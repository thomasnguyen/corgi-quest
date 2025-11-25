# Design Document

## Overview

This feature adds real-time visual feedback animations to make data updates immediately obvious to users. The design leverages Convex's real-time subscriptions to detect changes and trigger coordinated animations across all connected clients. The implementation uses React hooks, CSS animations, and a lightweight animation library for confetti effects.

## Architecture

### Component Structure

```
src/
├── components/
│   ├── animations/
│   │   ├── FloatingXP.tsx          # Floating "+XP" animation component
│   │   ├── ConfettiEffect.tsx      # Confetti animation component
│   │   └── PulseWrapper.tsx        # Reusable pulse animation wrapper
│   ├── dog/
│   │   ├── StatOrb.tsx             # Enhanced with floating XP triggers
│   │   └── StatGrid.tsx            # Coordinates stat animations
│   └── layout/
│       └── TopResourceBar.tsx      # Enhanced with pulse effects
├── hooks/
│   ├── useAnimationTrigger.ts      # Detects value changes and triggers animations
│   ├── useConfetti.ts              # Manages confetti state and cleanup
│   └── usePreviousValue.ts         # Tracks previous values for comparison
└── lib/
    └── animationUtils.ts           # Shared animation utilities
```

### Data Flow

1. **Activity Logged** → Convex mutation updates database
2. **Convex Query Subscription** → Detects change in real-time
3. **React useEffect Hook** → Compares previous vs current values
4. **Animation Trigger** → Spawns animation components
5. **Animation Completion** → Cleanup and DOM removal

## Components and Interfaces

### 1. FloatingXP Component

**Purpose:** Displays animated "+XP" text that floats upward from stat orbs.

**Props:**
```typescript
interface FloatingXPProps {
  amount: number;           // XP amount to display
  color: string;            // Stat theme color
  startX: number;           // Starting X position (px)
  startY: number;           // Starting Y position (px)
  onComplete: () => void;   // Callback when animation finishes
}
```

**Implementation:**
- Uses CSS keyframe animation for upward movement and fade
- Positioned absolutely relative to viewport
- Auto-removes after 1.5s animation
- Uses `transform: translateY()` for GPU acceleration

**Animation Keyframes:**
```css
@keyframes floatUp {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-40px);
    opacity: 0;
  }
}
```

### 2. ConfettiEffect Component

**Purpose:** Renders confetti particles with physics-based falling animation.

**Props:**
```typescript
interface ConfettiEffectProps {
  type: 'overall' | 'stat';     // Overall level-up or stat level-up
  statColor?: string;            // Color for stat-specific confetti
  centerX?: number;              // Center X for stat confetti burst
  centerY?: number;              // Center Y for stat confetti burst
  onComplete: () => void;        // Callback when animation finishes
}
```

**Implementation:**
- Uses `canvas-confetti` library for performant particle effects
- Overall confetti: Full-screen burst from top
- Stat confetti: Localized burst from stat orb position
- Configurable colors, particle count, and physics
- Auto-cleanup after 3s

**Confetti Configuration:**
```typescript
// Overall level-up
{
  particleCount: 50,
  spread: 70,
  origin: { y: 0.6 },
  colors: ['#f5c35f', '#fcd587', '#fff1ab']
}

// Stat level-up
{
  particleCount: 25,
  spread: 50,
  origin: { x: centerX, y: centerY },
  colors: [statColor, lighten(statColor, 20)]
}
```

### 3. PulseWrapper Component

**Purpose:** Reusable wrapper that applies pulse animation to children.

**Props:**
```typescript
interface PulseWrapperProps {
  isActive: boolean;        // Whether to show pulse
  color: string;            // Pulse glow color
  intensity?: 'normal' | 'celebration';  // Pulse strength
  children: ReactNode;
}
```

**Implementation:**
- Wraps existing components without modifying their structure
- Uses CSS transitions for smooth scaling
- Applies box-shadow glow effect
- Automatically resets after animation

**CSS:**
```css
.pulse-normal {
  animation: pulse 1s ease-out;
}

.pulse-celebration {
  animation: pulseCelebration 1s ease-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: none; }
  50% { transform: scale(1.05); box-shadow: 0 0 20px currentColor; }
}

@keyframes pulseCelebration {
  0%, 100% { transform: scale(1); box-shadow: none; }
  50% { transform: scale(1.1); box-shadow: 0 0 30px currentColor; }
}
```

### 4. useAnimationTrigger Hook

**Purpose:** Detects value changes and triggers animations.

**Interface:**
```typescript
function useAnimationTrigger<T>(
  currentValue: T,
  onTrigger: (previous: T, current: T) => void,
  options?: {
    skipInitial?: boolean;  // Don't trigger on mount
    debounce?: number;      // Debounce time in ms
  }
): void
```

**Implementation:**
```typescript
export function useAnimationTrigger<T>(
  currentValue: T,
  onTrigger: (previous: T, current: T) => void,
  options = { skipInitial: true, debounce: 0 }
) {
  const previousValue = usePreviousValue(currentValue);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip initial mount if configured
    if (isInitialMount.current && options.skipInitial) {
      isInitialMount.current = false;
      return;
    }

    // Skip if no change
    if (previousValue === currentValue) return;

    // Debounce if configured
    const timeoutId = setTimeout(() => {
      onTrigger(previousValue, currentValue);
    }, options.debounce);

    return () => clearTimeout(timeoutId);
  }, [currentValue, previousValue, onTrigger, options]);
}
```

### 5. Enhanced StatOrb Component

**Changes:**
- Add state for floating XP animations
- Use `useAnimationTrigger` to detect XP changes
- Calculate orb center position for animation spawn point
- Render `FloatingXP` components in a portal

**Implementation:**
```typescript
export default function StatOrb({ stat }: StatOrbProps) {
  const [floatingXPs, setFloatingXPs] = useState<FloatingXPData[]>([]);
  const orbRef = useRef<HTMLDivElement>(null);

  // Detect XP changes
  useAnimationTrigger(
    stat.xp,
    (prevXP, currentXP) => {
      const xpGained = currentXP - prevXP;
      if (xpGained > 0 && orbRef.current) {
        const rect = orbRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        setFloatingXPs(prev => [...prev, {
          id: Date.now(),
          amount: xpGained,
          x: centerX,
          y: centerY
        }]);
      }
    }
  );

  // Detect level-ups for confetti
  useAnimationTrigger(
    stat.level,
    (prevLevel, currentLevel) => {
      if (currentLevel > prevLevel) {
        triggerStatConfetti(stat.statType, orbRef.current);
      }
    }
  );

  return (
    <div ref={orbRef}>
      {/* Existing orb UI */}
      
      {/* Floating XP animations */}
      {createPortal(
        floatingXPs.map(xp => (
          <FloatingXP
            key={xp.id}
            amount={xp.amount}
            color={STAT_COLORS[stat.statType]}
            startX={xp.x}
            startY={xp.y}
            onComplete={() => {
              setFloatingXPs(prev => prev.filter(f => f.id !== xp.id));
            }}
          />
        )),
        document.body
      )}
    </div>
  );
}
```

### 6. Enhanced TopResourceBar Component

**Changes:**
- Wrap daily goal indicators in `PulseWrapper`
- Use `useAnimationTrigger` to detect point changes
- Trigger pulse animations with appropriate colors

**Implementation:**
```typescript
export default function TopResourceBar() {
  const [physicalPulse, setPhysicalPulse] = useState(false);
  const [mentalPulse, setMentalPulse] = useState(false);

  // Detect physical points changes
  useAnimationTrigger(
    dailyGoals?.physicalPoints,
    (prevPoints, currentPoints) => {
      if (currentPoints > prevPoints) {
        setPhysicalPulse(true);
        setTimeout(() => setPhysicalPulse(false), 1000);
      }
    }
  );

  // Detect mental points changes
  useAnimationTrigger(
    dailyGoals?.mentalPoints,
    (prevPoints, currentPoints) => {
      if (currentPoints > prevPoints) {
        setMentalPulse(true);
        setTimeout(() => setMentalPulse(false), 1000);
      }
    }
  );

  return (
    <div>
      <PulseWrapper isActive={physicalPulse} color="#22d3ee">
        {/* Physical goal indicator */}
      </PulseWrapper>
      
      <PulseWrapper isActive={mentalPulse} color="#a855f7">
        {/* Mental goal indicator */}
      </PulseWrapper>
    </div>
  );
}
```

### 7. Enhanced Toast Notifications for Partner Activities

**Changes to Layout.tsx:**
- Filter activity feed to detect partner activities
- Show enhanced toast with stat breakdown
- Include level-up information if applicable

**Implementation:**
```typescript
// In Layout.tsx
useEffect(() => {
  if (!activityFeed || !firstUser) return;

  const newPartnerActivities = activityFeed.filter(
    activity => 
      activity.userId !== firstUser._id &&
      !previousActivityIds.current.has(activity._id)
  );

  newPartnerActivities.forEach(activity => {
    // Format stat gains
    const statGainsText = activity.statGains
      .map(gain => `${gain.statType} +${gain.xpAmount}`)
      .join(", ");

    // Calculate total XP
    const totalXP = activity.statGains.reduce(
      (sum, gain) => sum + gain.xpAmount, 
      0
    );

    showToast(
      `${activity.userName} logged "${activity.activityName}" • +${totalXP} XP (${statGainsText})`,
      "success"
    );
  });

  // Update tracking
  previousActivityIds.current = new Set(
    activityFeed.map(a => a._id)
  );
}, [activityFeed, firstUser, showToast]);
```

## Data Models

### FloatingXPData
```typescript
interface FloatingXPData {
  id: number;        // Unique identifier
  amount: number;    // XP amount
  x: number;         // Starting X position
  y: number;         // Starting Y position
}
```

### AnimationState
```typescript
interface AnimationState {
  isActive: boolean;
  triggeredAt: number;
  type: 'pulse' | 'confetti' | 'float';
}
```

## Error Handling

1. **Animation Cleanup:** Use cleanup functions in useEffect to prevent memory leaks
2. **Portal Errors:** Wrap portal rendering in error boundaries
3. **Performance:** Limit concurrent animations to prevent lag
4. **Missing Elements:** Check for element existence before calculating positions
5. **Stale Animations:** Clear animations when component unmounts

## Testing Strategy

### Unit Tests
- Test `useAnimationTrigger` hook with various value changes
- Test `usePreviousValue` hook returns correct previous values
- Test animation cleanup functions

### Integration Tests
- Test FloatingXP spawns at correct position
- Test confetti triggers on level-up
- Test pulse animations on goal updates
- Test partner activity toasts appear

### Visual Tests
- Verify animations are smooth (60fps)
- Verify colors match stat themes
- Verify animations don't overlap awkwardly
- Verify animations work on mobile devices

### Real-Time Tests
- Test animations appear simultaneously on two devices
- Test animations trigger within 100ms of data change
- Test multiple simultaneous animations
- Test animations during poor network conditions

## Performance Considerations

1. **GPU Acceleration:** Use `transform` and `opacity` for animations
2. **Portal Rendering:** Render animations in portals to avoid layout thrashing
3. **Cleanup:** Remove animation elements immediately after completion
4. **Debouncing:** Prevent animation spam with debounce logic
5. **RequestAnimationFrame:** Use RAF for smooth animations
6. **Lazy Loading:** Load confetti library only when needed

## Dependencies

- `canvas-confetti`: ^1.9.3 (for confetti effects)
- Existing: `react`, `convex/react`, `framer-motion` (optional for advanced animations)

## Implementation Notes

1. Start with FloatingXP as it's the simplest
2. Add PulseWrapper as a reusable utility
3. Implement confetti last as it requires external library
4. Test each animation independently before combining
5. Use Chrome DevTools Performance tab to verify 60fps
6. Test on mobile devices for touch interactions
