# Animation Components

## Overview
Corgi Quest includes optimized animation components for real-time feedback and visual polish.

## Components

- **FloatingXP** - Animated "+XP" text that floats upward from stat orbs
- **PulseWrapper** - Reusable wrapper that applies pulse animation to children
- **AnimationErrorBoundary** - Error boundary for graceful animation failure handling

## Performance Optimizations

All animations are optimized for 60 FPS performance:
- ✅ GPU-accelerated properties (transform, opacity)
- ✅ will-change hints for browser optimization
- ✅ Animation throttling to prevent performance degradation
- ✅ Proper cleanup to prevent memory leaks
- ✅ Error boundaries for graceful failure handling

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| FPS (idle) | 60 | ✅ |
| FPS (animations) | 55-60 | ✅ |
| Sync latency | <100ms | ✅ |
| Memory leaks | 0 | ✅ |
