# Performance Monitoring and Optimization

This document describes the performance monitoring and optimization system implemented for the VR advanced features.

## Overview

The performance monitoring system tracks frame rate, memory usage, particle count, and audio sources to ensure smooth 60fps operation. When performance degrades, the system automatically applies optimizations to maintain a good user experience.

**Requirements:** 6.1, 6.2, 6.3, 6.5

## Components

### PerformanceMonitor

The central performance monitoring class that tracks all metrics and triggers optimizations.

**Location:** `CorgiQuestVR/Services/PerformanceMonitor.swift`

**Key Features:**
- Frame time measurement and FPS calculation
- Memory usage monitoring with pressure detection
- Particle count tracking
- Audio source count tracking
- Automatic optimization triggering
- Performance logging

**Thresholds:**
- Target FPS: 60.0
- Min Acceptable FPS: 60.0
- Max Frame Time: 16.67ms
- Memory Warning: 500MB
- Memory Critical: 750MB
- Max Particles (Normal): 100
- Max Particles (Reduced): 50
- Max Particles (Critical): 25
- Max Audio Sources (Normal): 5
- Max Audio Sources (Reduced): 3

### Integration Points

#### 1. TrainingRoomViewModel

The ViewModel integrates the performance monitor and applies optimizations to all subsystems.

**Key Methods:**
- `startPerformanceMonitoring()` - Starts periodic monitoring (every 1 second)
- `updatePerformanceMetrics()` - Updates all metrics and applies optimizations
- `recordFrame()` - Records frame time for FPS calculation
- `applyPerformanceOptimizations()` - Applies optimizations to particles, audio, shadows, and lighting

#### 2. TrainingRoomView

The View records frame times in the RealityView update loop.

```swift
update: { content, attachments in
    // Record frame for performance monitoring
    viewModel.recordFrame()
    // ... rest of update logic
}
```

#### 3. ParticleSystem

The particle system supports dynamic particle count reduction.

**Optimizations:**
- `maxParticleCount` - Adjustable maximum particle count
- `useReducedQuality` - Enables half particle emission
- Automatic particle capping when at capacity

#### 4. SpatialAudioManager

The audio manager supports concurrent source limiting and low CPU mode.

**Optimizations:**
- `maxConcurrentSources` - Limits simultaneous audio sources
- `useLowCPUMode` - Skips sounds when near limit
- Automatic oldest sound stopping when at capacity

#### 5. ShadowRenderer

Shadow rendering can be disabled for performance.

**Optimizations:**
- `isEnabled` - Completely disables shadow rendering

#### 6. LightingAdapter

Lighting adaptation can use simplified mode.

**Optimizations:**
- `useSimplifiedMode` - Skips smooth transitions, uses instant updates

## Performance Optimization Flow

```
1. Frame Update
   ↓
2. Record Frame Time
   ↓
3. Calculate FPS
   ↓
4. Check Thresholds
   ↓
5. Trigger Optimization (if needed)
   ↓
6. Apply Optimizations:
   - Reduce particle count
   - Limit audio sources
   - Disable shadows
   - Simplify lighting
   ↓
7. Monitor Recovery
   ↓
8. Reset Optimizations (when recovered)
```

## Optimization Levels

### Normal Operation
- 100 max particles
- 5 max audio sources
- Shadows enabled
- Full lighting effects

### Performance Degraded (< 60fps or > 500MB memory)
- 50 max particles
- 3 max audio sources
- Shadows disabled
- Simplified lighting

### Critical (< 45fps or > 750MB memory)
- 25 max particles
- 3 max audio sources
- Shadows disabled
- Simplified lighting
- Aggressive particle cleanup

## Monitoring Metrics

The performance monitor tracks and publishes:

- `currentFPS` - Current frames per second
- `frameTimeMs` - Current frame time in milliseconds
- `isPerformanceDegraded` - Whether FPS is below target
- `memoryUsageMB` - Current memory usage in megabytes
- `isMemoryPressureHigh` - Whether memory exceeds warning threshold
- `activeParticleCount` - Number of active particles
- `activeAudioSources` - Number of playing audio sources

## Logging

The performance monitor uses `os.log` for structured logging:

```swift
logger.info("Performance recovered: 62.5 fps")
logger.warning("Performance degraded: 55.3 fps")
logger.error("Critical memory pressure: 820.5 MB")
logger.debug("Frame time exceeded budget: 18.2ms")
```

Logs can be viewed in Console.app by filtering for:
- Subsystem: `com.corgiquest.vr`
- Category: `Performance`

## Testing Performance

### Manual Testing

1. **Frame Rate Test:**
   - Run the app in Vision Pro simulator or device
   - Monitor Console.app for performance logs
   - Trigger multiple particle effects simultaneously
   - Verify FPS stays above 60

2. **Memory Test:**
   - Run for extended period
   - Trigger many particle effects
   - Play multiple audio sources
   - Monitor memory usage in Xcode Instruments

3. **Optimization Test:**
   - Artificially trigger performance degradation
   - Verify particle count reduces
   - Verify audio sources limit
   - Verify shadows disable
   - Verify performance recovers

### Automated Testing

Property-based tests can verify:
- Frame time stays under 16.67ms budget
- Memory usage stays under thresholds
- Particle count respects limits
- Audio mixing doesn't clip

## Future Improvements

1. **Adaptive Quality:**
   - Gradually reduce quality instead of sudden drops
   - Per-feature quality levels (low/medium/high)

2. **Predictive Optimization:**
   - Predict performance issues before they occur
   - Pre-emptively reduce quality in demanding scenarios

3. **User Preferences:**
   - Allow users to prioritize features (particles vs audio)
   - Manual quality settings override

4. **Telemetry:**
   - Send performance metrics to analytics
   - Track common performance issues
   - Optimize based on real-world data

## Requirements Coverage

- **6.1:** Frame time measurement and logging ✓
- **6.2:** Dynamic particle count reduction ✓
- **6.3:** Audio mixing optimization for low CPU usage ✓
- **6.5:** Memory pressure monitoring and graceful degradation ✓

