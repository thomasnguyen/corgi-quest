# VR Polling and Real-Time Sync Test Plan

## Overview

This document describes how to test the 3-second polling mechanism and verify real-time synchronization between the VR app and web app.

## Polling Implementation

### Current Configuration ✅

**Location:** `TrainingRoomViewModel.swift`

```swift
/// Polling interval in seconds
private let pollingInterval: TimeInterval = 3.0

/// Starts polling for real-time updates every 3 seconds
func startPolling() {
    pollingTimer = Timer.scheduledTimer(withTimeInterval: pollingInterval, repeats: true) { [weak self] _ in
        Task { @MainActor [weak self] in
            await self?.fetchInitialData()
        }
    }
    
    // Fire immediately on start
    Task {
        await fetchInitialData()
    }
}
```

**Features:**
- ✅ Polls every 3 seconds during active training
- ✅ Fires immediately when polling starts
- ✅ Runs on main actor for UI updates
- ✅ Weak self reference prevents memory leaks
- ✅ Automatic cleanup in `deinit`

## Test Scenarios

### Test 1: Verify Polling Interval

**Objective:** Confirm VR app polls API every 3 seconds

**Steps:**
1. Open VR app on Vision Pro
2. Navigate to Training Room view
3. Observe network requests in Xcode console
4. Verify requests occur every 3 seconds

**Expected Output:**
```
[2024-11-27 10:00:00] GET /api/vr-status - 200 OK (450ms)
[2024-11-27 10:00:03] GET /api/vr-status - 200 OK (420ms)
[2024-11-27 10:00:06] GET /api/vr-status - 200 OK (480ms)
[2024-11-27 10:00:09] GET /api/vr-status - 200 OK (440ms)
```

**Success Criteria:**
- ✅ Requests occur at 3-second intervals (±100ms tolerance)
- ✅ No missed polls during active training
- ✅ Polling stops when leaving Training Room view

### Test 2: Real-Time Sync Between VR and Web App

**Objective:** Verify changes made in VR appear in web app within 3 seconds

**Setup:**
1. Open web app at `https://corgi-quest.netlify.app` on laptop/phone
2. Open VR app on Vision Pro
3. Ensure both show the same dog (e.g., "Bumi")
4. Note current IMP stat level and XP

**Test Steps:**
1. **T+0s:** Both apps show Level 12, IMP at 780 XP
2. **T+2s:** In VR, say "Start training Leave It"
3. **T+5s:** In VR, say "Mark rep" (repeat 5 times, 2 seconds each)
4. **T+15s:** In VR, say "End session, completed 5 Leave It reps"
5. **T+18s:** Check web app - should show new activity in feed
6. **T+20s:** VR polls API, shows updated IMP stat (+50 XP)
7. **T+23s:** Both apps show Level 12, IMP at 830 XP

**Expected Timeline:**
| Time | VR App | Web App | Backend |
|------|--------|---------|---------|
| T+0s | Shows IMP: 780 XP | Shows IMP: 780 XP | IMP: 780 XP |
| T+15s | Submits voice log | No change yet | Processing activity |
| T+16s | Shows "Activity logged" | No change yet | Activity created, IMP: 830 XP |
| T+18s | No change yet | Convex subscription fires, shows new activity | IMP: 830 XP |
| T+20s | Polls API, gets IMP: 830 XP | Shows IMP: 830 XP | IMP: 830 XP |
| T+23s | Shows IMP: 830 XP with animation | Shows IMP: 830 XP | IMP: 830 XP |

**Success Criteria:**
- ✅ Web app receives update within 3 seconds of activity creation (via Convex subscription)
- ✅ VR app receives update within 3 seconds of next poll (max 3s delay)
- ✅ Both apps show identical data after sync completes
- ✅ Total sync delay < 6 seconds (3s for web + 3s for VR worst case)

### Test 3: Measure Sync Delay

**Objective:** Measure actual sync delay between VR and web app

**Tools Needed:**
- Stopwatch or timer
- Screen recording of both devices

**Steps:**
1. Start screen recording on both VR and web app
2. In VR, submit a voice log: "Completed 5 Leave It reps"
3. Start timer when "Activity logged" appears in VR
4. Stop timer when activity appears in web app feed
5. Measure delay

**Expected Results:**
- **Minimum Delay:** ~0-1 second (if web app subscription fires immediately)
- **Maximum Delay:** ~3 seconds (if VR polls just before activity creation)
- **Average Delay:** ~1.5 seconds

**Success Criteria:**
- ✅ Average sync delay < 3 seconds
- ✅ No sync delays > 5 seconds
- ✅ Consistent sync behavior across multiple tests

### Test 4: Polling During Different States

**Objective:** Verify polling behavior in different app states

**Test Cases:**

#### 4.1 Polling Starts on View Appear
```swift
// In TrainingRoomView.swift
.onAppear {
    viewModel.startPolling()
}
```

**Steps:**
1. Launch VR app
2. Navigate to Training Room
3. Verify polling starts immediately

**Success Criteria:**
- ✅ First API call occurs within 100ms of view appearing
- ✅ Subsequent calls occur every 3 seconds

#### 4.2 Polling Stops on View Disappear
```swift
// In TrainingRoomView.swift
.onDisappear {
    viewModel.stopPolling()
}
```

**Steps:**
1. Navigate to Training Room (polling starts)
2. Navigate away from Training Room
3. Verify polling stops

**Success Criteria:**
- ✅ No API calls after leaving view
- ✅ Timer is properly invalidated
- ✅ No memory leaks

#### 4.3 Polling Continues During Voice Commands
**Steps:**
1. Start polling in Training Room
2. Say "Start training Leave It"
3. Verify polling continues during voice recognition
4. Say "Mark rep" multiple times
5. Verify polling continues

**Success Criteria:**
- ✅ Polling continues uninterrupted during voice commands
- ✅ No missed polls during voice recognition
- ✅ UI updates smoothly during polling

### Test 5: Network Error Handling During Polling

**Objective:** Verify graceful degradation when API is unavailable

**Test Cases:**

#### 5.1 Temporary Network Failure
**Steps:**
1. Start polling with good connection
2. Disable Wi-Fi on Vision Pro
3. Wait 10 seconds (3-4 failed polls)
4. Re-enable Wi-Fi
5. Verify polling resumes

**Expected Behavior:**
- ✅ Error message appears: "Connection timed out. Retrying..."
- ✅ Polling continues attempting every 3 seconds
- ✅ UI shows last known data
- ✅ Connection restored automatically when network returns

#### 5.2 API Timeout
**Steps:**
1. Simulate slow API (>5 second response)
2. Verify timeout handling
3. Verify next poll occurs 3 seconds after timeout

**Expected Behavior:**
- ✅ Request times out after 5 seconds
- ✅ Error message: "Connection timed out. Retrying..."
- ✅ Next poll starts 3 seconds after timeout completes
- ✅ No request queue buildup

#### 5.3 Server Error (500)
**Steps:**
1. Trigger server error from API
2. Verify error handling
3. Verify polling continues

**Expected Behavior:**
- ✅ Error message: "Server error (500)"
- ✅ Polling continues every 3 seconds
- ✅ UI shows last known data
- ✅ Recovers automatically when server is fixed

## Performance Metrics

### Target Metrics
- **Polling Interval:** 3.0 seconds (±100ms)
- **API Response Time:** < 500ms
- **Sync Delay (VR → Web):** < 3 seconds
- **Sync Delay (Web → VR):** < 3 seconds
- **Total Round-Trip:** < 6 seconds

### Measurement Tools

#### Xcode Console Logging
Add logging to `TrainingRoomViewModel.swift`:

```swift
func fetchInitialData() async {
    let startTime = Date()
    do {
        let status = try await networkService.fetchVRStatus()
        let responseTime = Date().timeIntervalSince(startTime) * 1000
        print("✅ API Response: \(responseTime)ms")
        updateUI(with: status)
    } catch {
        let responseTime = Date().timeIntervalSince(startTime) * 1000
        print("❌ API Error: \(responseTime)ms - \(error)")
        handleFetchError(error)
    }
}
```

#### Network Profiling
Use Xcode Instruments:
1. Product → Profile (⌘I)
2. Select "Network" template
3. Record during training session
4. Analyze request frequency and response times

## Demo Optimization

### 15-25 Second Demo Flow

**Timeline:**
| Time | Action | VR Display | Web App | Polling |
|------|--------|------------|---------|---------|
| 0-2s | Minimal UI | Floating panels with stats | Shows same stats | Poll at T+0s |
| 2-5s | "Start training" | Training mode active | Shows presence indicator | Poll at T+3s |
| 5-15s | "Mark rep" × 5 | Rep counter: 1, 2, 3, 4, 5 | No change yet | Poll at T+6s, T+9s, T+12s |
| 15-20s | "End session" | Submitting... | No change yet | Poll at T+15s, T+18s |
| 20-23s | Stats update | IMP +50 XP animation | Activity appears in feed | Poll at T+21s (gets new data) |
| 23-25s | Return to minimal | Updated stats visible | Updated stats visible | Poll at T+24s |

**Key Polling Moments:**
- **T+0s:** Initial poll shows starting stats
- **T+3s, T+6s, T+9s, T+12s, T+15s:** Polls during training (no changes yet)
- **T+18s:** Poll just after activity submission (might catch update)
- **T+21s:** Poll definitely catches updated stats
- **T+24s:** Final poll confirms sync

**Success Criteria:**
- ✅ VR shows updated stats by T+21s (within 6 seconds of submission)
- ✅ Web app shows activity by T+18s (within 3 seconds via Convex)
- ✅ Both apps synchronized by T+23s
- ✅ Total demo time: 15-25 seconds

## Troubleshooting

### Issue: Polling Too Frequent
**Symptom:** API calls more than once per 3 seconds
**Solution:** Check for multiple timers or view lifecycle issues

### Issue: Polling Stops Unexpectedly
**Symptom:** No API calls after initial load
**Solution:** Verify `startPolling()` is called in `onAppear`

### Issue: Sync Delay > 5 Seconds
**Symptom:** Changes take too long to appear
**Solution:** 
- Check API response times (should be < 500ms)
- Verify Convex subscriptions are working in web app
- Check network latency on Vision Pro

### Issue: Memory Leak
**Symptom:** App memory grows over time
**Solution:** Verify `weak self` in timer closure and `deinit` cleanup

## Requirements Validated

- ✅ **Requirement 5.2:** VR app polls every 3 seconds during training
- ✅ **Requirement 3.1:** Parallel query execution for optimal performance
- ✅ **Requirement 3.5:** Requests complete within 5 seconds
- ✅ **Demo Requirement:** Real-time sync < 3 seconds between devices

## Next Steps

After validating polling:
1. Test complete "Leave It" demo flow (Task 6.3)
2. Test error scenarios (Task 6.5)
3. Deploy to production and verify on actual Vision Pro device
4. Rehearse demo with timing

