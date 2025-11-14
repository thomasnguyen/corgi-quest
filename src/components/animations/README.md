# Animation Testing & Debug Tools

## Overview
Corgi Quest includes comprehensive testing tools for animations, including a visual debug panel and URL parameter triggers for automated testing.

## URL Parameter Testing Mode

### Quick Start - Test Everything at Once! 🚀
```
http://localhost:3000/?debug=true&testAnimation=all
```

This single URL will:
- Show the debug panel with performance monitoring
- Trigger all animations sequentially
- Enable debug logging

### Individual Animation Testing
```
# Single animation
http://localhost:3000/?testAnimation=floatingXP

# Multiple animations (comma-separated)
http://localhost:3000/?testAnimation=floatingXP,pulse,confetti

# With debug logging
http://localhost:3000/?testAnimation=levelUp&debug=true
```

### Supported Animation Types

- `floatingXP` - Simulates XP gain on all stats
- `pulse` - Triggers pulse on daily goals
- `confetti` - Triggers overall confetti animation
- `levelUp` - Simulates stat level-up (confetti + XP)
- `partnerActivity` - Shows partner activity toast notification

### Debug Mode
Add `?debug=true` to enable console logging:
```
http://localhost:3000/?testAnimation=all&debug=true
```

This will log all animation triggers to the browser console with the `[Animation Debug]` prefix.

## Animation Debug Panel

### How to Access
Add `?debug=true` to any URL to show the visual debug panel:
```
http://localhost:3000/?debug=true
```

### Test Everything at Once
```
http://localhost:3000/?debug=true&testAnimation=all
```
This will open the debug panel AND trigger all animations automatically!

## Features

### Real-Time Toggle
- Enable/disable real-time animations from Convex subscriptions
- When disabled, animations won't trigger automatically from data changes
- Useful for testing animations in isolation

### Animation Triggers

1. **Floating XP** - Simulates XP gain on stat orbs
   - Adjustable XP amount (10-200)
   - Triggers floating "+XP" text animation

2. **Pulse Effect** - Simulates daily goal updates
   - Normal or Celebration intensity
   - Triggers pulse animation on goal indicators

3. **Confetti** - Simulates level-up celebrations
   - Adjustable particle count (10-100)
   - Triggers confetti burst

4. **Level Up** - Combined animation
   - Triggers both confetti and floating XP
   - Simulates complete level-up experience

5. **Partner Activity Toast** - Simulates partner logging activity
   - Shows toast notification with stat breakdown
   - Tests partner activity detection

6. **Trigger All** - Sequential test
   - Triggers all animations in sequence
   - Useful for comprehensive testing

## Implementation Details

### Component Location
- `src/components/animations/AnimationDebugPanel.tsx`

### Integration
- Integrated into `src/components/layout/Layout.tsx`
- Appears as a fixed panel in bottom-right corner
- Z-index: 50 (above most UI elements)

### State Management
- Panel visibility controlled by URL parameter
- Animation parameters stored in local state
- Real-time toggle affects Layout component behavior

## Notes
- Panel can be closed with the × button
- Closing the panel doesn't remove `?debug=true` from URL
- Refresh page to show panel again
- Panel is responsive and scrollable on mobile devices


## Performance Optimizations

All animations are optimized for 60 FPS performance:
- ✅ GPU-accelerated properties (transform, opacity)
- ✅ will-change hints for browser optimization
- ✅ Animation throttling to prevent performance degradation
- ✅ Proper cleanup to prevent memory leaks
- ✅ Error boundaries for graceful failure handling

See `OPTIMIZATION_SUMMARY.md` for detailed optimization information.

## Performance Monitoring

The debug panel now includes real-time performance monitoring:

### Features
- **FPS Counter** - Real-time frames per second measurement
- **Animation Count** - Total animations triggered in session
- **Last Trigger Time** - Time since last animation trigger
- **Color-Coded Indicators**:
  - Green (55-60 FPS): Excellent performance
  - Yellow (30-55 FPS): Acceptable performance
  - Red (<30 FPS): Performance issues

### Stress Testing
Click "Stress Test (10 rapid animations)" to verify throttling:
- Triggers 10 floating XP animations rapidly (100ms apart)
- Tests animation throttling (max 4 concurrent)
- Verifies FPS stays above 55

## Testing

See `TESTING_GUIDE.md` for comprehensive testing instructions including:
- GPU acceleration verification
- Animation throttling tests
- Cleanup and error handling tests
- Real-time synchronization tests
- Poor network condition tests
- Mobile device testing

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| FPS (idle) | 60 | ✅ |
| FPS (animations) | 55-60 | ✅ |
| Sync latency | <100ms | ✅ |
| Memory leaks | 0 | ✅ |

## Components

- **FloatingXP** - Animated "+XP" text that floats upward from stat orbs
- **PulseWrapper** - Reusable wrapper that applies pulse animation to children
- **AnimationErrorBoundary** - Error boundary for graceful animation failure handling
- **AnimationDebugPanel** - Debug panel for testing animations with performance monitoring
