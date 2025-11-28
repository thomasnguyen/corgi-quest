# Design Document: VR Stats Animation

## Overview

This feature enhances the VR Stats Screen with polished startup animations. When the stats screen opens, each stat circle (PHY, INT, IMP, SOC) will animate its progress ring from 0% to its actual value with staggered timing. A subtle glow pulse effect will trigger when each circle completes its fill.

The implementation leverages SwiftUI's native animation system, requiring minimal code changes (~15-20 lines) to the existing `StatsScreenView` in `FloatingPanelsView.swift`.

## Architecture

### Animation Flow

```
Stats Screen Opens
       │
       ▼
┌──────────────────┐
│ isVisible = true │  (existing fade-in)
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Staggered Fill Animations Begin          │
│                                          │
│  0.3s delay → PHY circle fills (0.8s)    │
│  0.5s delay → INT circle fills (0.8s)    │
│  0.7s delay → IMP circle fills (0.8s)    │
│  0.9s delay → SOC circle fills (0.8s)    │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ On Each Fill Complete:                   │
│  - Glow pulse (shadow radius increase)   │
│  - Scale bounce (1.0 → 1.05 → 1.0)       │
└──────────────────────────────────────────┘
         │
         ▼
   All animations complete (~2.5s total)
```

### State Management

```swift
// New state variables in StatsScreenView
@State private var animatedProgress: [String: CGFloat] = [:]  // Tracks animated progress per stat
@State private var glowScale: [String: CGFloat] = [:]         // Tracks glow pulse scale per stat

// Animation timing constants
private let baseDelay: Double = 0.3
private let staggerInterval: Double = 0.2
private let fillDuration: Double = 0.8
```

## Components and Interfaces

### Modified Components

#### StatsScreenView (FloatingPanelsView.swift)

The main stats screen view will be modified to:
1. Initialize `animatedProgress` dictionary with 0 values for each stat
2. Trigger staggered animations in `.onAppear`
3. Pass animated progress values to stat circle rendering

#### Stat Circle Rendering

The stat circle within `StatsScreenView` will use the animated progress value instead of the raw `stat.xpProgress`:

```swift
// Current implementation
Circle()
    .trim(from: 0, to: stat.xpProgress)

// New implementation  
Circle()
    .trim(from: 0, to: animatedProgress[stat.type] ?? 0)
    .scaleEffect(glowScale[stat.type] ?? 1.0)
    .shadow(color: stat.color.opacity(0.6), 
            radius: (glowScale[stat.type] ?? 1.0) > 1.0 ? 15 : 5)
```

### Animation Trigger Logic

```swift
.onAppear {
    // Reset progress for replay on reopen
    for stat in stats {
        animatedProgress[stat.type] = 0
        glowScale[stat.type] = 1.0
    }
    
    // Staggered fill animations
    for (index, stat) in stats.enumerated() {
        let delay = baseDelay + (Double(index) * staggerInterval)
        
        withAnimation(.easeOut(duration: fillDuration).delay(delay)) {
            animatedProgress[stat.type] = stat.xpProgress
        }
        
        // Glow pulse after fill completes
        let glowDelay = delay + fillDuration
        DispatchQueue.main.asyncAfter(deadline: .now() + glowDelay) {
            withAnimation(.spring(response: 0.2, dampingFraction: 0.6)) {
                glowScale[stat.type] = 1.05
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                withAnimation(.spring(response: 0.2, dampingFraction: 0.8)) {
                    glowScale[stat.type] = 1.0
                }
            }
        }
    }
}
```

## Data Models

No new data models required. The feature uses existing `StatData` model and adds local `@State` variables for animation tracking.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Analysis

Based on the prework analysis, most acceptance criteria relate to visual animation timing and effects, which are not suitable for property-based testing. The animations are:
- Time-dependent (delays, durations)
- Visual in nature (glow effects, scaling)
- SwiftUI framework-managed (animation curves)

**No testable properties identified.** This feature is primarily visual/UX polish and is best validated through:
1. Manual demo testing
2. Visual inspection in Xcode previews
3. Simulator/device testing

The one potentially testable behavior (state reset on reopen - Requirement 1.4) is an example test rather than a property, and given the demo-focused nature of this feature, manual verification is sufficient.

## Error Handling

### Edge Cases

1. **Empty stats array**: If `stats` is empty, no animations will trigger (safe no-op)
2. **Stats screen closed mid-animation**: SwiftUI handles animation cancellation automatically
3. **Rapid open/close**: The `.onAppear` reset logic ensures animations restart cleanly

### Graceful Degradation

If animations fail to trigger for any reason, the stat circles will still display their correct values (just without animation) since the underlying `stat.xpProgress` data remains unchanged.

## Testing Strategy

### Manual Testing (Primary)

Given this is a visual polish feature for demos, manual testing is the primary validation method:

1. **Open Stats Screen**: Verify circles animate from 0 → actual value
2. **Timing Check**: Confirm staggered delays feel natural (~0.2s between each)
3. **Glow Effect**: Verify subtle pulse occurs after each fill completes
4. **Reopen Test**: Close and reopen stats screen, verify animations replay
5. **Demo Run-through**: Full demo flow to ensure animations enhance presentation

### Xcode Preview Testing

Use SwiftUI previews to iterate on timing and visual feel without full app builds.

### No Automated Tests Required

This feature:
- Has no complex business logic
- Is purely visual/UX enhancement
- Is best validated by human observation
- Would require fragile timing-based tests that provide little value

The existing app functionality (data display, navigation) remains unchanged and is covered by existing tests.
