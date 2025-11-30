# Design Document

## Overview

The Noise Desensitizer is a standalone React-based web tool built with TanStack Start that provides controlled sound exposure for dog training. It features a mobile-first interface with real-time audio controls, progressive volume automation, and session tracking. The tool operates independently from the main Corgi Quest app but shares visual theming and serves as a conversion funnel.

## Architecture

### Component Structure

```
src/routes/
  tools.noise.tsx              # Main route at /tools/noise

src/components/noise/
  NoiseDesensitizer.tsx         # Main container component
  SoundCard.tsx                 # Individual sound control card
  SafetyCard.tsx                # Safety instructions display
  SessionControls.tsx           # Global controls (Stop All, Reset Timer)
  StatusBar.tsx                 # Playback status and timer display
  ProgressiveToggle.tsx         # Progressive exposure control
  NoiseCTA.tsx                  # Footer CTA to main app

src/lib/
  noiseAudio.ts                 # Audio playback management
  noiseSounds.ts                # Sound library configuration
  noiseTypes.ts                 # TypeScript types
```

### State Management

The tool uses React state (no Convex) since it's a standalone utility:

```typescript
type SoundId =
  | "fireworks"
  | "thunder"
  | "door_knock"
  | "doorbell"
  | "dog_bark"
  | "baby_crying"
  | "traffic"
  | "siren"
  | "construction";

type Mode = "single" | "loop";

type NoiseToolState = {
  activeSoundId: SoundId | null;
  volumeBySound: Record<SoundId, number>; // 0-1
  modeBySound: Record<SoundId, Mode>;
  progressiveEnabled: boolean;
  sessionSeconds: number;
  isSessionRunning: boolean;
};
```

## Components and Interfaces

### NoiseDesensitizer (Main Container)

**Responsibilities:**
- Manages global state (NoiseToolState)
- Coordinates audio playback across all sounds
- Handles session timer and progressive exposure intervals
- Renders child components with appropriate props

**Key Methods:**
- `handlePlay(soundId)` - Start playing a sound
- `handleStop(soundId)` - Stop a specific sound
- `handleStopAll()` - Stop all sounds and freeze timer
- `handleVolumeChange(soundId, volume)` - Update volume
- `handleModeChange(soundId, mode)` - Switch between single/loop
- `handleProgressiveToggle()` - Enable/disable progressive exposure
- `handleResetTimer()` - Reset session timer to 00:00

**Intervals:**
- Session timer: Increments every 1000ms when `isSessionRunning === true`
- Progressive exposure: Increments volume every 60000ms when enabled and sound is active

### SoundCard

**Props:**
```typescript
interface SoundCardProps {
  sound: SoundConfig;
  isActive: boolean;
  volume: number;
  mode: Mode;
  progressiveActive: boolean;
  onPlay: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
  onModeChange: (mode: Mode) => void;
}
```

**Layout:**
- Top: Icon + Name + Intensity Badge
- Middle: Play/Stop button + Mode selector
- Bottom: Volume label + Slider
- Progressive indicator (when active)

### SafetyCard

**Props:** None (static content)

**Content:**
- Title: "How to use this safely"
- 4 bullet points with safety guidelines
- Icon: 🛡️ or 💡
- Styling: Info card with subtle background

### SessionControls

**Props:**
```typescript
interface SessionControlsProps {
  onStopAll: () => void;
  onResetTimer: () => void;
}
```

**Layout:**
- Sticky bottom bar on mobile
- Two buttons: [Stop All] [Reset Timer]
- Minimal, non-intrusive design

### StatusBar

**Props:**
```typescript
interface StatusBarProps {
  sessionSeconds: number;
  activeSoundId: SoundId | null;
  activeMode: Mode | null;
  isSessionRunning: boolean;
}
```

**Display:**
- Timer: `MM:SS` format
- Status text: "Stopped" or "Playing [Sound] (Mode)"
- Updates in real-time

### ProgressiveToggle

**Props:**
```typescript
interface ProgressiveToggleProps {
  enabled: boolean;
  onToggle: () => void;
}
```

**Layout:**
- Toggle switch + label
- Helper text explaining the feature
- Disabled state when no sound is playing

### NoiseCTA

**Props:** None

**Content:**
- "powered by Corgi Quest" text
- CTA button: "Get daily training quests in the Corgi Quest app →"
- Links to main app (waitlist or app route)

## Data Models

### SoundConfig

```typescript
interface SoundConfig {
  id: SoundId;
  label: string;
  icon: string; // emoji or lucide icon name
  intensityTag: "High" | "Medium" | "Low";
  fileUrl: string; // path to audio file
  defaultVolume: number; // 0.2-0.3
  defaultMode: Mode; // "single"
}
```

### Sound Library Configuration

```typescript
const SOUNDS: SoundConfig[] = [
  {
    id: "fireworks",
    label: "Fireworks",
    icon: "🎆",
    intensityTag: "High",
    fileUrl: "/sounds/fireworks.mp3",
    defaultVolume: 0.2,
    defaultMode: "single"
  },
  {
    id: "thunder",
    label: "Thunder",
    icon: "🌩️",
    intensityTag: "High",
    fileUrl: "/sounds/thunder.mp3",
    defaultVolume: 0.25,
    defaultMode: "single"
  },
  // ... 7 more sounds
];
```

### Audio Management

```typescript
class AudioManager {
  private audioElements: Map<SoundId, HTMLAudioElement>;
  private loopTimeouts: Map<SoundId, NodeJS.Timeout>;
  
  constructor(sounds: SoundConfig[]);
  
  play(soundId: SoundId, volume: number, mode: Mode): void;
  stop(soundId: SoundId): void;
  stopAll(): void;
  setVolume(soundId: SoundId, volume: number): void;
  cleanup(): void;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Single active sound exclusivity

*For any* two different sounds A and B, when sound A is playing and the user starts sound B, then sound A should be stopped and only sound B should be playing.

**Validates: Requirements 1.4**

### Property 2: Volume changes apply immediately

*For any* sound that is currently playing, when the user adjusts the volume slider, the audio playback volume should match the slider value within 100ms.

**Validates: Requirements 1.3**

### Property 3: Loop mode repetition

*For any* sound in Loop mode, when the sound completes playback, the system should replay it after exactly 7 seconds unless the sound is stopped or another sound is started.

**Validates: Requirements 2.3**

### Property 4: Progressive exposure volume progression

*For any* sound playing with Progressive Exposure enabled, the volume should increase by exactly 0.1 (10%) every 60 seconds until reaching 0.6 (60%) or until playback stops.

**Validates: Requirements 4.2, 4.3**

### Property 5: Session timer accuracy

*For any* continuous playback session, the session timer should increment by exactly 1 second for each elapsed second of playback, regardless of which sound is playing.

**Validates: Requirements 5.2**

### Property 6: Stop All completeness

*For any* system state where one or more sounds are playing, when the user triggers Stop All, all audio playback should cease and no sounds should be in an active state.

**Validates: Requirements 5.5**

### Property 7: Mode persistence

*For any* sound, when the user changes its mode from Single to Loop (or vice versa), the mode setting should persist for that sound until explicitly changed again, even after playback stops.

**Validates: Requirements 2.4**

### Property 8: Default state initialization

*For any* page load, all sounds should initialize with volume between 0.2-0.3, mode set to "single", and Progressive Exposure disabled.

**Validates: Requirements 9.1, 9.2, 9.3**

### Property 9: Manual volume disables progressive

*For any* sound playing with Progressive Exposure enabled, when the user manually adjusts the volume slider, automatic volume increases should stop for that sound until it is restarted.

**Validates: Requirements 4.4**

### Property 10: Timer reset independence

*For any* system state, when the user resets the timer, the timer should return to 00:00 without affecting the current playback state or active sound.

**Validates: Requirements 5.4**

## Error Handling

### Audio Loading Failures

**Scenario:** Sound file fails to load or is corrupted

**Handling:**
- Display error message on the specific sound card
- Disable Play button for that sound
- Log error to console for debugging
- Other sounds continue to function normally

### Browser Audio API Unavailable

**Scenario:** User's browser doesn't support Web Audio API

**Handling:**
- Display banner: "Your browser doesn't support audio playback"
- Provide link to supported browsers list
- Gracefully disable all playback controls

### Autoplay Policy Restrictions

**Scenario:** Browser blocks autoplay (common on mobile)

**Handling:**
- First play attempt may fail silently
- Show tooltip: "Tap Play again if sound doesn't start"
- Subsequent plays work after user interaction

### Volume Slider Edge Cases

**Scenario:** User drags slider rapidly or to extreme values

**Handling:**
- Debounce volume changes (50ms)
- Clamp values to 0-1 range
- Prevent NaN or undefined values

### Timer Overflow

**Scenario:** Session runs for extremely long duration (>24 hours)

**Handling:**
- Cap timer display at 99:59
- Continue tracking actual seconds internally
- Reset button always available

## Testing Strategy

### Unit Tests

**Audio Manager:**
- Test play/stop/volume methods
- Verify cleanup on unmount
- Test loop timeout scheduling
- Verify single-play auto-stop

**State Management:**
- Test state transitions (stopped → playing → stopped)
- Verify mode changes persist
- Test progressive exposure state updates
- Verify timer increment logic

**Component Rendering:**
- Test SoundCard renders with correct props
- Verify StatusBar displays correct text
- Test SafetyCard static content
- Verify CTA links to correct route

### Property-Based Tests

We'll use **fast-check** (JavaScript property testing library) for universal properties.

**Property Test 1: Single active sound**
- Generate random sequences of play commands
- Verify only one sound is ever active
- **Validates: Property 1**

**Property Test 2: Volume synchronization**
- Generate random volume changes during playback
- Verify audio element volume matches state
- **Validates: Property 2**

**Property Test 3: Loop timing**
- Generate random loop scenarios
- Verify 7-second delay between replays
- **Validates: Property 3**

**Property Test 4: Progressive volume steps**
- Generate random progressive exposure sessions
- Verify volume increases by 0.1 every 60s
- Verify cap at 0.6
- **Validates: Property 4**

**Property Test 5: Timer continuity**
- Generate random play/stop sequences
- Verify timer only increments during playback
- **Validates: Property 5**

**Property Test 6: Stop All completeness**
- Generate random multi-sound states
- Verify Stop All clears all active sounds
- **Validates: Property 6**

**Property Test 7: Mode persistence**
- Generate random mode changes
- Verify mode persists across play/stop cycles
- **Validates: Property 7**

**Property Test 8: Initialization consistency**
- Generate multiple page loads
- Verify all defaults are correct
- **Validates: Property 8**

**Property Test 9: Manual override**
- Generate progressive sessions with manual changes
- Verify auto-increment stops after manual adjustment
- **Validates: Property 9**

**Property Test 10: Timer reset isolation**
- Generate random playback states
- Verify reset doesn't affect playback
- **Validates: Property 10**

### Integration Tests

**Full User Flows:**
- Load page → play sound → adjust volume → stop
- Enable progressive → play sound → verify auto-increase
- Play sound in loop → verify repetition → stop all
- Multiple sounds in sequence → verify exclusivity
- Long session → reset timer → continue playing

**Mobile Testing:**
- Touch interactions on all controls
- Slider dragging on mobile
- Sticky controls remain accessible
- No layout shifts during playback

### Manual Testing Checklist

- [ ] Test on iOS Safari (autoplay restrictions)
- [ ] Test on Chrome mobile
- [ ] Test on desktop browsers
- [ ] Verify all 9 sounds play correctly
- [ ] Test progressive exposure full cycle
- [ ] Test loop mode with multiple sounds
- [ ] Verify CTA links to correct destination
- [ ] Test with screen reader (accessibility)
- [ ] Test with keyboard navigation
- [ ] Verify no console errors

## Performance Considerations

### Audio Preloading

- Lazy load audio files (don't preload all 9 sounds)
- Load on first play attempt
- Cache loaded audio elements
- Cleanup on unmount

### State Updates

- Debounce volume slider changes (50ms)
- Use React.memo for SoundCard components
- Avoid re-rendering inactive sound cards

### Timer Optimization

- Use single interval for session timer
- Use single interval for progressive exposure
- Clear intervals on unmount
- Avoid creating new intervals on re-renders

### Mobile Performance

- Minimize DOM updates during playback
- Use CSS transforms for animations
- Avoid layout thrashing
- Test on low-end devices

## Accessibility

### Keyboard Navigation

- All controls accessible via Tab
- Play/Stop: Space or Enter
- Volume slider: Arrow keys
- Mode toggle: Arrow keys or Tab + Enter

### Screen Reader Support

- ARIA labels on all interactive elements
- Live region for status updates
- Descriptive button labels
- Volume slider with aria-valuetext

### Visual Accessibility

- High contrast mode support
- Focus indicators on all controls
- Minimum 44px touch targets
- Color not sole indicator (use icons + text)

### Reduced Motion

- Respect prefers-reduced-motion
- Disable animations if requested
- Keep core functionality intact

## Deployment

### Route Configuration

- Path: `/tools/noise`
- No authentication required
- No Convex connection needed
- Standalone page with own layout

### Asset Management

- Store audio files in `/public/sounds/`
- Optimize audio files (MP3, 128kbps)
- Keep file sizes under 500KB each
- Use descriptive filenames

### SEO Considerations

- Title: "Free Dog Noise Desensitizer | Corgi Quest"
- Meta description: "Train your dog to stay calm around fireworks, doorbells, and other triggers. Free mobile-friendly tool with progressive exposure."
- Open Graph tags for social sharing
- Canonical URL

### Analytics

- Track page views
- Track sound plays (which sounds are most used)
- Track progressive exposure usage
- Track CTA clicks to main app
- No personal data collection

## Future Enhancements

### Phase 2 Features

- Custom sound upload
- Save favorite sound combinations
- Share training sessions
- Integration with main app (if logged in)
- Training tips per sound type
- Success stories from other users

### Advanced Features

- Scheduled training reminders
- Progress tracking over time
- Community sound library
- Expert training guides per sound
- Video demonstrations
