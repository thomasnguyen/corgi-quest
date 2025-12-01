# WebXR Charts Demo - Vision Pro Testing Guide

This guide provides step-by-step instructions for testing the WebXR charts demo on Apple Vision Pro (Requirements: 8.5).

## Prerequisites

### Hardware
- Apple Vision Pro headset
- Sufficient lighting for hand tracking
- Clear space for VR experience

### Software
- Safari browser on Vision Pro
- Corgi Quest app deployed and accessible
- Active dog profile with training data

### Network
- Stable internet connection
- Access to Corgi Quest deployment URL

## Testing Procedure

### Step 1: Load the Route

1. **Open Safari on Vision Pro:**
   - Launch Safari from the home screen
   - Ensure you're in a comfortable viewing position

2. **Navigate to the WebXR route:**
   ```
   https://[your-deployment-url]/webxr
   ```
   - Replace `[your-deployment-url]` with actual deployment URL
   - Example: `https://corgi-quest.netlify.app/webxr`

3. **Verify landing page:**
   - ✅ "WebXR Charts Demo" title appears
   - ✅ "Enter VR" button is visible
   - ✅ Button is styled correctly (gold background)
   - ✅ No console errors in Safari dev tools

### Step 2: Enter VR Mode

1. **Click "Enter VR" button:**
   - Use hand gesture or controller to click
   - Button should respond to hover/click

2. **Verify VR session starts:**
   - ✅ Immersive VR mode activates
   - ✅ Chart appears in 3D space
   - ✅ No black screen or loading issues
   - ✅ Smooth transition from 2D to VR

3. **Check initial positioning:**
   - ✅ Chart is visible in front of you
   - ✅ Chart is at comfortable viewing distance (~2m)
   - ✅ Chart is at eye level (~1.5m height)
   - ✅ Chart is centered in view

### Step 3: Verify Text Readability (Requirements: 8.5)

1. **Check title text:**
   - ✅ "Last 7 Days" is clearly readable
   - ✅ Text is not too small or too large
   - ✅ Text color (#f9dca0) is visible
   - ✅ No pixelation or blurriness

2. **Check XP value text:**
   - ✅ Numbers above bars are readable
   - ✅ Text size (0.04m / 4cm) is appropriate
   - ✅ Text color (#f5c35f) provides good contrast
   - ✅ All 7 values are legible

3. **Check day label text:**
   - ✅ Day names (Mon, Tue, etc.) are readable
   - ✅ Text size (0.05m / 5cm) is appropriate
   - ✅ Text color (#888888) is visible
   - ✅ Labels align with bars

4. **Test from different distances:**
   - Move closer to chart (1m away)
   - Move farther from chart (3m away)
   - Verify text remains readable at both distances

### Step 4: Check Performance (Requirements: 8.5)

1. **Monitor frame rate:**
   - ✅ Smooth, fluid motion (60fps)
   - ✅ No stuttering or frame drops
   - ✅ No judder during head movement
   - ✅ Consistent performance throughout

2. **Test animations:**
   - Watch initial bar growth animation
   - ✅ Bars grow smoothly from 0 to target height
   - ✅ Staggered animation looks natural
   - ✅ No lag or delay
   - ✅ Spring physics feels responsive

3. **Test head tracking:**
   - Move head left/right
   - Move head up/down
   - ✅ Chart stays in place (world-locked)
   - ✅ No tracking issues
   - ✅ Smooth rendering during movement

### Step 5: Test with Real Training Data (Requirements: 8.5)

1. **Verify data loading:**
   - ✅ Chart displays actual XP data
   - ✅ Bars reflect real training sessions
   - ✅ No placeholder or dummy data
   - ✅ Data matches main app

2. **Check data scenarios:**
   - **If you have varied data:**
     - ✅ Bars have different heights
     - ✅ Proportions look correct
     - ✅ High XP days are taller
   
   - **If you have zero data:**
     - ✅ All bars show minimum height
     - ✅ "0" values are displayed
     - ✅ Chart doesn't break
   
   - **If you have missing days:**
     - ✅ All 7 bars are present
     - ✅ Missing days show 0 XP
     - ✅ No gaps in chart

3. **Test real-time updates:**
   - Open main app on another device
   - Log a new training activity
   - Return to VR view
   - ✅ Chart updates within 3 seconds
   - ✅ New bar height animates smoothly
   - ✅ No need to refresh

### Step 6: Visual Quality Checks

1. **Check bar appearance:**
   - ✅ Bars are gold color (#D4AF37)
   - ✅ Bars are solid (not transparent)
   - ✅ Bars have clean edges
   - ✅ No visual artifacts

2. **Check background panel:**
   - ✅ Dark background (#1a1a1a) is visible
   - ✅ Background is semi-transparent (50% opacity)
   - ✅ Background frames chart nicely
   - ✅ Background doesn't obscure bars

3. **Check spacing and alignment:**
   - ✅ Bars are evenly spaced
   - ✅ Bars are aligned at bottom
   - ✅ Chart is centered
   - ✅ No overlapping elements

4. **Check depth perception:**
   - ✅ Bars appear 3D (not flat)
   - ✅ Background is behind bars
   - ✅ Text is in front of bars
   - ✅ Depth ordering is correct

### Step 7: Interaction Testing

1. **Test hand tracking:**
   - Raise hands in view
   - ✅ Hands are tracked correctly
   - ✅ No interference with chart
   - ✅ Chart remains stable

2. **Test movement:**
   - Walk around the chart
   - ✅ Chart stays in place
   - ✅ Can view from different angles
   - ✅ Text remains readable from sides

3. **Test exit:**
   - Exit VR mode
   - ✅ Returns to landing page
   - ✅ No errors or crashes
   - ✅ Can re-enter VR successfully

## Common Issues and Solutions

### Issue: Text is too small to read

**Possible causes:**
- Chart positioned too far away
- Font size too small for Vision Pro

**Solutions:**
- Adjust chart position in code (move closer)
- Increase fontSize values slightly
- Check Vision Pro display settings

### Issue: Chart is not visible

**Possible causes:**
- Chart positioned outside field of view
- WebXR session not starting correctly
- Browser compatibility issue

**Solutions:**
- Verify position prop is [0, 1.5, -2]
- Check Safari WebXR support
- Try refreshing page
- Check console for errors

### Issue: Performance is poor (< 60fps)

**Possible causes:**
- Too many triangles
- Complex materials
- Other apps running

**Solutions:**
- Verify triangle count (should be ~131)
- Confirm MeshBasicMaterial usage
- Close other apps
- Restart Vision Pro

### Issue: Bars don't animate

**Possible causes:**
- Animation library not loaded
- React Spring configuration issue
- Data not updating

**Solutions:**
- Check @react-spring/three import
- Verify spring config (tension: 200, friction: 20)
- Check browser console for errors
- Verify data is being passed to component

### Issue: Real-time updates don't work

**Possible causes:**
- Convex subscription not active
- Network connectivity issue
- Data not syncing

**Solutions:**
- Verify Convex connection
- Check network status
- Confirm useQuery hook is working
- Test in main app first

## Performance Benchmarks

### Expected Performance (Requirements: 8.5)

- **Frame rate**: 60fps (consistent)
- **Frame time**: ~16.67ms per frame
- **Triangle count**: ~131 triangles
- **Memory usage**: ~576KB
- **Animation smoothness**: No stuttering
- **Text readability**: Clear at 2m distance

### Acceptable Performance

- **Frame rate**: 55-60fps (occasional drops acceptable)
- **Frame time**: 16-18ms per frame
- **Text readability**: Clear at 1.5-2.5m distance

### Unacceptable Performance

- **Frame rate**: < 55fps (consistent)
- **Frame time**: > 20ms per frame
- **Text readability**: Blurry or pixelated
- **Stuttering**: Frequent frame drops
- **Crashes**: App crashes or freezes

## Test Results Template

Use this template to document your testing results:

```markdown
## Vision Pro Test Results

**Date:** [Date]
**Tester:** [Name]
**Device:** Apple Vision Pro
**Software Version:** [visionOS version]
**Deployment URL:** [URL]

### Step 1: Load Route
- [ ] Landing page loads correctly
- [ ] "Enter VR" button visible
- [ ] No console errors

### Step 2: Enter VR
- [ ] VR session starts successfully
- [ ] Chart appears in 3D space
- [ ] Positioning is correct

### Step 3: Text Readability
- [ ] Title is readable
- [ ] XP values are readable
- [ ] Day labels are readable
- [ ] Text readable from 1-3m distance

### Step 4: Performance
- [ ] 60fps maintained
- [ ] Animations are smooth
- [ ] Head tracking works correctly

### Step 5: Real Training Data
- [ ] Data loads correctly
- [ ] Bars reflect actual XP
- [ ] Real-time updates work

### Step 6: Visual Quality
- [ ] Bar colors correct
- [ ] Background visible
- [ ] Spacing even
- [ ] Depth perception correct

### Step 7: Interaction
- [ ] Hand tracking works
- [ ] Can move around chart
- [ ] Exit works correctly

### Issues Found
[List any issues encountered]

### Overall Assessment
[Pass/Fail with notes]
```

## Conclusion

This testing guide covers all aspects of Vision Pro testing (Requirements: 8.5):

- ✅ Loading and entering VR
- ✅ Text readability verification
- ✅ Performance monitoring
- ✅ Real training data testing
- ✅ Visual quality checks
- ✅ Interaction testing

Follow this guide to ensure the WebXR charts demo works correctly on Apple Vision Pro.
