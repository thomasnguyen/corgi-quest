# Animation Performance Testing Guide

This guide provides instructions for testing the real-time animation system to ensure it meets performance requirements (5.1, 5.2, 5.7, 5.8).

## Prerequisites

- Two devices or browser windows for testing real-time synchronization
- Chrome DevTools for performance profiling
- Network throttling tools for testing poor network conditions

## Test 1: GPU Acceleration Verification (Requirement 5.8)

**Objective:** Verify all animations use GPU-accelerated properties (transform, opacity)

**Steps:**
1. Open Chrome DevTools → Performance tab
2. Click "Record" button
3. Trigger animations using the debug panel (?debug=true)
4. Stop recording after 5 seconds
5. Analyze the flame chart

**Expected Results:**
- All animations should show in the "Composite" layer (green)
- No "Layout" or "Paint" operations during animations
- Smooth 60 FPS throughout animation lifecycle

**CSS Properties to Verify:**
- ✅ `transform: translate3d()` - GPU accelerated
- ✅ `opacity` - GPU accelerated
- ✅ `will-change: transform, opacity` - Hints to browser
- ❌ `top`, `left`, `width`, `height` - NOT GPU accelerated

## Test 2: Animation Throttling (Requirement 5.7)

**Objective:** Verify animations are throttled to prevent performance degradation

**Steps:**
1. Open debug panel (?debug=true)
2. Enable "Performance Monitor"
3. Click "Stress Test (10 rapid animations)" button
4. Observe FPS counter and animation behavior

**Expected Results:**
- FPS should remain above 55 (green indicator)
- Maximum 4 concurrent floating XP animations per stat
- Pulse animations should not stack (1 second debounce)
- Confetti should queue if multiple level-ups occur (500ms spacing)

**Throttling Limits:**
- Floating XP: Max 4 concurrent per stat
- Pulse: 1 second debounce
- Confetti: Queued with 500ms delay between bursts

## Test 3: Cleanup and Error Handling (Requirements 5.1, 5.2)

**Objective:** Verify proper cleanup and graceful error handling

**Steps:**
1. Trigger multiple animations
2. Navigate away from the page quickly
3. Check browser console for errors
4. Return to the page and trigger more animations

**Expected Results:**
- No memory leaks (check Chrome DevTools → Memory tab)
- No console errors about unmounted components
- Timeouts and animation frames are properly cleared
- Animation elements are removed from DOM after completion

**Error Scenarios to Test:**
- Missing element refs (should log error but not crash)
- Invalid position values (should use safe defaults)
- Portal rendering failures (should fail silently)
- Confetti library errors (should catch and log)

## Test 4: Real-Time Synchronization (Requirements 5.1, 5.2)

**Objective:** Verify animations trigger within 100ms across devices

**Steps:**
1. Open app on two devices/windows with same household
2. Log an activity on Device 1
3. Measure time until animations appear on Device 2
4. Use browser DevTools → Network tab to check timing

**Expected Results:**
- Animations appear within 100ms on both devices
- All relevant animations trigger (floating XP, pulse, confetti)
- Animations are synchronized (both users see same thing)
- No duplicate animations

**Timing Breakdown:**
- Convex mutation: ~10-20ms
- Real-time subscription update: ~20-50ms
- React re-render: ~10-30ms
- Animation trigger: ~5-10ms
- **Total: 45-110ms** (within 100ms target)

## Test 5: Poor Network Conditions (Requirements 5.1, 5.2)

**Objective:** Verify animations work under poor network conditions

**Steps:**
1. Open Chrome DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Log an activity
4. Observe animation behavior

**Expected Results:**
- Animations still trigger (may be delayed)
- No animation errors or crashes
- Graceful degradation if data is delayed
- Animations don't stack up when connection recovers

## Test 6: Multiple Simultaneous Animations (Requirement 5.7)

**Objective:** Verify system handles multiple animations without lag

**Steps:**
1. Enable debug panel (?debug=true)
2. Enable "Performance Monitor"
3. Click "Trigger All Animations" button
4. Observe FPS counter

**Expected Results:**
- FPS remains above 55 during all animations
- All animations complete successfully
- No visual glitches or stuttering
- Proper staggering of animations

**Simultaneous Animation Scenarios:**
- 4 stats gain XP at once (4 floating XP animations)
- Both daily goals update (2 pulse animations)
- Overall level-up + stat level-up (2 confetti bursts)
- Partner activity toast + local animations

## Test 7: 60 FPS Verification (Requirement 5.8)

**Objective:** Verify animations run at 60 FPS

**Steps:**
1. Open debug panel (?debug=true)
2. Enable "Performance Monitor"
3. Trigger various animations
4. Monitor FPS counter continuously

**Expected Results:**
- FPS stays at 60 (green) during idle
- FPS stays above 55 (green) during animations
- FPS drops to 30-55 (yellow) only under extreme load
- FPS never drops below 30 (red)

**Performance Targets:**
- Idle: 60 FPS
- Single animation: 60 FPS
- Multiple animations: 55-60 FPS
- Stress test: 45-60 FPS

## Test 8: Mobile Device Testing

**Objective:** Verify animations work on mobile devices

**Steps:**
1. Open app on mobile device
2. Test all animation types
3. Check for touch interaction issues
4. Monitor battery usage

**Expected Results:**
- Animations are smooth on mobile
- No touch event conflicts
- Reasonable battery consumption
- Proper scaling for different screen sizes

## Automated Testing Commands

```bash
# Run unit tests for animation hooks
npm test -- useAnimationTrigger.test.ts

# Run integration tests
npm test -- animations.test.tsx

# Check for memory leaks
npm run test:memory

# Performance profiling
npm run test:performance
```

## Debug Panel Features

Access the debug panel by adding `?debug=true` to the URL.

**Features:**
- Real-time animation toggle
- Performance monitor (FPS, animation count, timing)
- Individual animation triggers
- Parameter adjustment (XP amount, confetti count, pulse intensity)
- Stress test button
- Combined animation test

**URL Parameters:**
- `?debug=true` - Show debug panel
- `?testAnimation=floatingXP` - Auto-trigger floating XP
- `?testAnimation=pulse,confetti` - Auto-trigger multiple animations

## Performance Checklist

- [ ] All animations use `transform` and `opacity`
- [ ] All animated elements have `will-change` hints
- [ ] Floating XP limited to 4 concurrent per stat
- [ ] Pulse animations debounced (1 second)
- [ ] Confetti queued (500ms spacing)
- [ ] Timeouts cleared on unmount
- [ ] Animation frames cancelled on unmount
- [ ] Error boundaries around animation components
- [ ] Missing refs handled gracefully
- [ ] Invalid values have safe defaults
- [ ] Animations trigger within 100ms across devices
- [ ] FPS stays above 55 during animations
- [ ] No memory leaks
- [ ] Works on mobile devices
- [ ] Works under poor network conditions

## Troubleshooting

**Low FPS:**
- Check for layout thrashing (use Performance tab)
- Verify GPU acceleration is enabled
- Reduce concurrent animation count
- Check for memory leaks

**Animations Not Triggering:**
- Verify Convex subscription is active
- Check useAnimationTrigger skipInitial setting
- Verify element refs are valid
- Check browser console for errors

**Synchronization Issues:**
- Check network latency
- Verify both users are in same household
- Check Convex real-time connection status
- Verify animation trigger logic

**Memory Leaks:**
- Check for uncleaned timeouts
- Verify animation frames are cancelled
- Check for orphaned DOM elements
- Use Chrome DevTools Memory profiler
