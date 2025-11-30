# WebXR VR-HUD Testing Guide

## Prerequisites

- Apple Vision Pro with visionOS 1.1+ OR
- Desktop browser with WebXR emulator extension
- HTTPS connection (required for WebXR)
- Microphone permissions granted
- Active dog selected in Corgi Quest

## Test Environment Setup

### Vision Pro Setup
1. Open Safari on Vision Pro
2. Navigate to your deployment URL (must be HTTPS)
3. Go to `/app/vr` route
4. Grant microphone permissions when prompted

### Desktop Testing Setup
1. Install WebXR API Emulator extension for Chrome/Edge
2. Open browser DevTools
3. Enable WebXR emulation
4. Navigate to `/app/vr` route

## End-to-End Voice Flow Tests

### Test 1: Enter VR and Verify Initial State

**Steps:**
1. Navigate to `/app/vr`
2. Click "Enter VR" button
3. Wait for VR scene to load

**Expected Results:**
- ✓ VR scene loads within 3 seconds
- ✓ Dog profile panel displays at center top
- ✓ Four stat orbs (PHY, INT, IMP, SOC) display on left
- ✓ Goals panel displays on right top
- ✓ Activity feed displays on right bottom
- ✓ Voice status panel shows "Voice Ready" at bottom center
- ✓ Session controls panel shows "Start Session" button
- ✓ All panels maintain stable positions (no jitter)
- ✓ Frame rate is 60fps or higher

### Test 2: Start Training Session with Voice

**Steps:**
1. Say: "Start session"
2. Observe UI changes

**Expected Results:**
- ✓ Voice status panel shows "Listening..." with pulsing green icon
- ✓ Transcript preview appears showing "start session"
- ✓ Session controls panel updates to show:
  - "Mark Rep" button
  - "End Session" button
  - Rep counter showing "0 reps"
- ✓ "Start Session" button is hidden
- ✓ No errors in console

### Test 3: Mark Multiple Reps with Voice

**Steps:**
1. Say: "Mark rep"
2. Wait 1 second
3. Say: "Mark rep"
4. Wait 1 second
5. Say: "Mark rep"

**Expected Results:**
- ✓ Rep counter increments to 1 after first command
- ✓ Rep counter increments to 2 after second command
- ✓ Rep counter increments to 3 after third command
- ✓ Each command shows transcript preview
- ✓ Voice status panel returns to "Listening..." between commands
- ✓ No lag or delay in rep counting

### Test 4: End Session with Activity Description

**Steps:**
1. Say: "End session three calm sits around two dogs"
2. Observe processing flow

**Expected Results:**
- ✓ Voice status panel shows transcript: "end session three calm sits around two dogs"
- ✓ Voice status panel changes to "Processing..." with spinning indicator
- ✓ "Sending to Claude AI" message appears
- ✓ After 2-5 seconds, voice status panel shows "XP Awarded!"
- ✓ Success message: "Activity logged successfully"
- ✓ Session controls panel returns to "Start Session" button
- ✓ Rep counter resets to 0

### Test 5: Verify Real-Time Stat Updates

**Steps:**
1. After completing Test 4, observe stat orbs
2. Check activity feed

**Expected Results:**
- ✓ Affected stat orbs pulse/scale animation
- ✓ Floating XP indicators appear (e.g., "+15 PHY")
- ✓ XP indicators fade out after 2 seconds
- ✓ Progress rings update to show new XP values
- ✓ New activity appears at top of activity feed
- ✓ Activity shows correct name: "three calm sits around two dogs"
- ✓ Activity shows XP breakdown by stat (PHY, INT, IMP, SOC)
- ✓ Activity shows user name
- ✓ Older activities scroll down smoothly

### Test 6: Verify Real-Time Goals Update

**Steps:**
1. After completing Test 4, observe goals panel
2. Check progress bars

**Expected Results:**
- ✓ Physical progress bar animates smoothly to new value
- ✓ Mental progress bar animates smoothly to new value
- ✓ Progress bars show updated points/goal ratio
- ✓ If goal completed, completion indicator appears
- ✓ Streak counter updates if applicable

### Test 7: Multiple Activities in Sequence

**Steps:**
1. Say: "Start session"
2. Say: "Mark rep" (3 times)
3. Say: "End session five minute walk with loose leash"
4. Wait for processing to complete
5. Say: "Start session"
6. Say: "Mark rep" (2 times)
7. Say: "End session practiced stay for ten minutes"
8. Wait for processing to complete

**Expected Results:**
- ✓ Both activities process successfully
- ✓ Both activities appear in activity feed
- ✓ Stats update correctly for both activities
- ✓ Goals update correctly for both activities
- ✓ No errors or crashes
- ✓ Voice recognition continues working
- ✓ Frame rate remains stable (60fps+)

### Test 8: Cross-Device Real-Time Sync

**Steps:**
1. Open Corgi Quest web app on phone/desktop
2. In VR, say: "Start session"
3. Say: "Mark rep"
4. Say: "End session quick training session"
5. Check web app on other device

**Expected Results:**
- ✓ Activity appears in web app within 3 seconds
- ✓ Stats update in web app
- ✓ Goals update in web app
- ✓ Activity feed shows new activity
- ✓ XP values match between VR and web app

### Test 9: Error Handling - Unrecognized Commands

**Steps:**
1. Say: "Hello there"
2. Say: "What's the weather"
3. Say: "Random gibberish"

**Expected Results:**
- ✓ Transcript appears in voice status panel
- ✓ No error messages displayed
- ✓ Commands are silently ignored
- ✓ Voice recognition continues listening
- ✓ No console errors

### Test 10: Error Handling - Network Issues

**Steps:**
1. Start a session in VR
2. Disable network connection
3. Say: "End session test activity"
4. Re-enable network connection

**Expected Results:**
- ✓ "Processing..." indicator appears
- ✓ After timeout, error message appears
- ✓ Error message is user-friendly (not technical)
- ✓ Session state is preserved
- ✓ User can retry after network restored

### Test 11: Performance Under Load

**Steps:**
1. Complete 5 activities in rapid succession
2. Monitor frame rate
3. Check for memory leaks

**Expected Results:**
- ✓ Frame rate stays at 60fps or higher
- ✓ No more than 4 animations run simultaneously
- ✓ Floating XP indicators are throttled correctly
- ✓ No memory leaks (check DevTools memory profiler)
- ✓ Scene remains responsive

### Test 12: Visual Feedback Completeness

**Steps:**
1. Start session and observe voice status panel
2. Mark rep and observe feedback
3. End session and observe full processing flow

**Expected Results:**
- ✓ Pulsing microphone icon when listening
- ✓ Transcript preview shows in real-time
- ✓ "Processing..." with spinning indicator
- ✓ "Sending to Claude AI" message
- ✓ "XP Awarded!" success confirmation
- ✓ "Activity logged successfully" message
- ✓ All visual states are clear and distinct

## Performance Benchmarks

### Frame Rate
- **Target:** 60fps minimum, 90fps ideal
- **Measure:** Use browser DevTools Performance tab
- **Pass Criteria:** No drops below 55fps during normal use

### Geometry Complexity
- **Target:** < 1000 triangles per panel
- **Measure:** Check three.js stats
- **Pass Criteria:** Total scene < 5000 triangles

### Animation Throttling
- **Target:** Max 4 simultaneous animations
- **Measure:** Console log active animation count
- **Pass Criteria:** Never exceeds 4 concurrent animations

### Network Latency
- **Target:** Activity logging completes in < 5 seconds
- **Measure:** Time from "End session" to "XP Awarded!"
- **Pass Criteria:** 95% of requests complete in < 5 seconds

## Known Limitations

1. **Voice Recognition Accuracy:** Depends on ambient noise and microphone quality
2. **WebXR Browser Support:** Limited to Safari on Vision Pro, Chrome/Edge with emulator
3. **Network Dependency:** Requires stable internet for Claude API calls
4. **Language Support:** English only in v1

## Troubleshooting

### Voice Not Working
- Check microphone permissions in browser settings
- Verify HTTPS connection
- Try refreshing the page
- Check console for errors

### VR Not Loading
- Verify WebXR support (navigator.xr exists)
- Check HTTPS connection
- Try different browser
- Check console for errors

### Stats Not Updating
- Verify Convex connection
- Check network tab for failed requests
- Verify active dog is selected
- Check console for errors

### Poor Performance
- Close other browser tabs
- Disable browser extensions
- Check system resources
- Reduce animation complexity

## Success Criteria

All tests must pass with:
- ✓ No critical errors
- ✓ Frame rate ≥ 60fps
- ✓ Voice recognition working
- ✓ Real-time sync working
- ✓ Visual feedback complete
- ✓ Performance optimizations active

## Test Report Template

```
Date: ___________
Tester: ___________
Device: ___________
Browser: ___________

Test Results:
[ ] Test 1: Enter VR and Verify Initial State
[ ] Test 2: Start Training Session with Voice
[ ] Test 3: Mark Multiple Reps with Voice
[ ] Test 4: End Session with Activity Description
[ ] Test 5: Verify Real-Time Stat Updates
[ ] Test 6: Verify Real-Time Goals Update
[ ] Test 7: Multiple Activities in Sequence
[ ] Test 8: Cross-Device Real-Time Sync
[ ] Test 9: Error Handling - Unrecognized Commands
[ ] Test 10: Error Handling - Network Issues
[ ] Test 11: Performance Under Load
[ ] Test 12: Visual Feedback Completeness

Performance Metrics:
- Average Frame Rate: _____ fps
- Total Triangles: _____
- Max Concurrent Animations: _____
- Average Activity Logging Time: _____ seconds

Issues Found:
1. _____________________
2. _____________________
3. _____________________

Overall Status: [ ] PASS [ ] FAIL

Notes:
_____________________
_____________________
```
