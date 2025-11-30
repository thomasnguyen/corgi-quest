# Design Document

## Overview

This design document outlines the technical implementation of the Noise Desensitizer tool. The design creates a compact, single-screen experience optimized for mobile use, featuring a sound grid and a unified "Now Playing" control panel.

## Architecture

### Component Structure

```
NoiseDesensitizer/
├── NoiseDesensitizer.tsx      # Main container (state management)
├── SoundGrid.tsx              # 3-column grid of sound tiles
├── SoundTile.tsx              # Individual sound tile (icon, label, intensity)
├── NowPlayingPanel.tsx        # Unified control panel
├── CompactStatusBar.tsx       # Timer and status display
├── SafetyDrawer.tsx           # Slide-up safety guidelines
├── CompactHeader.tsx          # Header with tips button
└── SubtleCTA.tsx              # Minimal Corgi Quest branding
```

### State Management

The tool manages the following state:

```typescript
interface NoiseToolState {
  selectedSoundId: SoundId | null;  // Currently selected (may not be playing)
  activeSoundId: SoundId | null;    // Currently playing sound
  volumeBySound: Record<SoundId, number>;
  modeBySound: Record<SoundId, Mode>;
  progressiveEnabled: boolean;
  sessionSeconds: number;
  isSessionRunning: boolean;
  isSafetyDrawerOpen: boolean;      // Safety drawer visibility
}
```

### Data Flow

```
User taps sound tile
        ↓
SoundGrid → onSelectSound(soundId)
        ↓
NoiseDesensitizer updates selectedSoundId
        ↓
NowPlayingPanel receives selected sound config
        ↓
User taps Play in NowPlayingPanel
        ↓
AudioManager.play() + update activeSoundId
        ↓
CompactStatusBar shows playing status
```

## Components and Interfaces

### SoundGrid Component

```typescript
interface SoundGridProps {
  sounds: SoundConfig[];
  selectedSoundId: SoundId | null;
  activeSoundId: SoundId | null;
  onSelectSound: (soundId: SoundId) => void;
}
```

Renders a CSS Grid with 3 columns. Each tile shows:
- Sound icon (emoji)
- Short label (max 5 characters, truncated)
- Intensity dot (colored circle)
- Selected state (border highlight)
- Playing state (animated indicator)

### SoundTile Component

```typescript
interface SoundTileProps {
  sound: SoundConfig;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: () => void;
}
```

Compact tile design:
- 44x44px minimum touch target
- Icon centered, label below
- Intensity dot in corner
- Border highlight when selected
- Pulse animation when playing

### NowPlayingPanel Component

```typescript
interface NowPlayingPanelProps {
  selectedSound: SoundConfig | null;
  isPlaying: boolean;
  volume: number;
  mode: Mode;
  progressiveEnabled: boolean;
  sessionSeconds: number;
  onPlay: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
  onModeChange: (mode: Mode) => void;
  onProgressiveToggle: () => void;
  onResetTimer: () => void;
}
```

Fixed-position panel containing:
- Compact status bar (sound name + timer)
- Volume slider with percentage
- Mode toggle (Single/Loop)
- Progressive exposure toggle
- Play/Stop buttons

### SafetyDrawer Component

```typescript
interface SafetyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}
```

Slide-up drawer with:
- Semi-transparent backdrop
- Safety guidelines content
- Close button and swipe-to-dismiss
- Smooth animation (transform + opacity)

## Data Models

### Sound Configuration (unchanged)

```typescript
interface SoundConfig {
  id: SoundId;
  label: string;
  shortLabel: string;      // 5-char max for grid display
  icon: string;
  audioSrc: string;
  intensityTag: "High" | "Medium" | "Low";
  defaultVolume: number;
  defaultMode: Mode;
}
```

### Layout Constants

```typescript
const LAYOUT = {
  GRID_COLUMNS: 3,
  GRID_GAP: 8,
  TILE_MIN_SIZE: 100,
  TOUCH_TARGET_MIN: 44,
  PLAY_BUTTON_SIZE: 56,
  HEADER_HEIGHT: 44,
  NOW_PLAYING_HEIGHT: 200,
} as const;
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the acceptance criteria analysis, the following properties must hold:

### Property 1: Sound tile rendering completeness
*For any* sound configuration, the rendered SoundTile component SHALL contain the sound's icon, a label (truncated if needed), and an intensity indicator matching the sound's intensityTag.
**Validates: Requirements 1.2, 7.1**

### Property 2: Sound selection updates Now Playing panel
*For any* sound in the grid, when that sound is selected, the Now Playing panel SHALL display that sound's name and icon, and the selected sound's controls SHALL be functional.
**Validates: Requirements 1.4, 2.1**

### Property 3: Status bar displays correct playing state
*For any* sound that is currently playing, the status bar SHALL display that sound's label and its current mode (Single or Loop).
**Validates: Requirements 3.3**

### Property 4: Timer format consistency
*For any* non-negative integer representing seconds, the formatTime function SHALL return a string in MM:SS format where MM is zero-padded minutes and SS is zero-padded seconds.
**Validates: Requirements 3.5**

### Property 5: Stop button halts all playback
*For any* state where a sound is playing, invoking the stop action SHALL result in no sound playing (activeSoundId becomes null and audio stops).
**Validates: Requirements 5.2**

### Property 6: Progressive exposure volume behavior
*For any* volume below 60% with progressive exposure enabled, after 60 seconds the volume SHALL increase by 10% (capped at 60%). *For any* volume at or above 60%, no automatic increase SHALL occur.
**Validates: Requirements 6.3, 6.4**

## Error Handling

### Audio Playback Errors
- If audio fails to load, display a toast notification and disable the sound tile
- If audio context is blocked (autoplay policy), prompt user to tap to enable audio
- Gracefully handle missing audio files by showing "Sound unavailable" state

### State Consistency
- If selectedSoundId references a non-existent sound, reset to null
- If activeSoundId and audio state become out of sync, reconcile by stopping audio
- Validate volume values are clamped to 0-1 range before applying

### Browser Compatibility
- Detect Web Audio API support and fall back to HTML5 Audio if needed
- Handle iOS Safari audio restrictions with user gesture requirement
- Provide fallback for browsers without CSS Grid (flexbox layout)

## Testing Strategy

### Property-Based Testing

The implementation will use **fast-check** as the property-based testing library for TypeScript/React.

Each correctness property will be implemented as a property-based test with minimum 100 iterations:

```typescript
// Example: Property 4 - Timer format consistency
import fc from 'fast-check';

describe('formatTime', () => {
  it('**Feature: noise-tool-ux-redesign, Property 4: Timer format consistency**', () => {
    fc.assert(
      fc.property(fc.nat(36000), (seconds) => {
        const result = formatTime(seconds);
        // Verify MM:SS format
        expect(result).toMatch(/^\d{2}:\d{2}$/);
        // Verify round-trip
        const [mins, secs] = result.split(':').map(Number);
        expect(mins * 60 + secs).toBe(seconds % 3600);
      }),
      { numRuns: 100 }
    );
  });
});
```

### Unit Tests

Unit tests will cover:
- Component rendering with various props
- User interaction handlers (tap, drag)
- State transitions (select, play, stop)
- Edge cases (empty state, max volume, timer overflow)

### Integration Tests

Integration tests will verify:
- Sound selection → Now Playing panel update flow
- Play → Stop → Reset timer flow
- Progressive exposure toggle and volume changes
- Safety drawer open/close behavior

## Visual Design

### Color Palette

```css
/* Intensity indicators */
--intensity-high: #ef4444;    /* red-500 */
--intensity-medium: #f59e0b;  /* amber-500 */
--intensity-low: #22c55e;     /* green-500 */

/* UI elements */
--bg-primary: #ffffff;
--bg-panel: #111827;          /* gray-900 */
--text-primary: #111827;
--text-secondary: #6b7280;    /* gray-500 */
--border: #000000;
--accent: #000000;
```

### Layout Specifications

```
Mobile viewport (375px):
┌─────────────────────────────────────┐
│ Header (44px)                       │
├─────────────────────────────────────┤
│ Sound Grid (~280px)                 │
│ - 3 columns                         │
│ - 8px gap                           │
│ - ~88px per tile                    │
├─────────────────────────────────────┤
│ Now Playing Panel (~200px)          │
│ - Fixed position                    │
│ - Status bar (40px)                 │
│ - Controls (160px)                  │
├─────────────────────────────────────┤
│ CTA Footer (32px)                   │
└─────────────────────────────────────┘
Total: ~556px (fits 667px iPhone SE)
```

### Animation Specifications

- Tile selection: 150ms scale(1.02) + border color transition
- Playing indicator: Infinite pulse animation (opacity 0.5-1.0, 1s duration)
- Safety drawer: 300ms slide-up with ease-out timing
- Button press: 100ms scale(0.95) feedback

## Implementation Strategy

The tool will be implemented directly at `/tools/noise`:

1. Create components in `src/components/noise/`
2. Implement route at `src/routes/tools.noise.tsx`
3. Use existing audio utilities from `src/lib/noiseAudio.ts`
4. Follow mobile-first design patterns from the main app

