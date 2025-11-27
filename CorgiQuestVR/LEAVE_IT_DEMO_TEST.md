# "Leave It" Demo Flow Test Plan

## Overview

This document describes the complete 15-25 second demo scenario for showcasing the VR training integration with real-time sync between VR and web app.

## Demo Scenario

**Training Activity:** "Leave It" impulse control training
**Goal:** Complete 5 reps with treats on the floor
**Expected Duration:** 15-25 seconds
**Primary Stat:** IMP (Impulse Control)
**Secondary Stats:** INT (Intelligence)

## Complete Demo Flow

### Phase 1: Minimal UI (0-2 seconds)

**VR Display:**
- Floating panels showing current stats
- Dog name and level badge
- Today's goals (physical/mental)
- Current streak
- Last 7-day XP chart

**Web App Display:**
- Same dog profile
- Activity feed showing recent activities
- Stats matching VR display

**Voice Commands:** None
**Polling:** Initial poll at T+0s

**Verification:**
- ✅ VR shows correct dog name (e.g., "Bumi")
- ✅ VR shows current level (e.g., Level 12)
- ✅ VR shows IMP stat at starting XP (e.g., 780 XP)
- ✅ Web app shows identical stats
- ✅ Both apps are synchronized

### Phase 2: Start Training (2-5 seconds)

**Voice Command:** "Start training Leave It"

**VR Response:**
1. Voice recognition activates (visual indicator)
2. Transcript appears: "Start training Leave It"
3. Training mode activates
4. Rep counter appears: "0/5 reps"
5. Instructions: "Say 'Mark rep' after each successful rep"

**Web App Response:**
- Shows presence indicator: "Training in VR"
- Activity feed unchanged (no activity created yet)

**API Calls:**
- Poll at T+3s (no changes yet)

**Verification:**
- ✅ Voice command recognized correctly
- ✅ Training mode UI appears
- ✅ Rep counter shows 0/5
- ✅ Web app shows presence indicator
- ✅ No errors in console

### Phase 3: Mark Reps (5-15 seconds)

**Voice Commands:** "Mark rep" (repeated 5 times, ~2 seconds each)

**Timeline:**
- **T+5s:** "Mark rep" → Counter: 1/5
- **T+7s:** "Mark rep" → Counter: 2/5
- **T+9s:** "Mark rep" → Counter: 3/5
- **T+11s:** "Mark rep" → Counter: 4/5
- **T+13s:** "Mark rep" → Counter: 5/5

**VR Response (each rep):**
1. Voice recognition activates
2. Transcript appears: "Mark rep"
3. Rep counter increments
4. Visual feedback (checkmark, haptic)
5. Counter updates: "X/5 reps"

**Web App Response:**
- Presence indicator remains: "Training in VR"
- No activity created yet (reps are local to VR)

**API Calls:**
- Poll at T+6s (no changes)
- Poll at T+9s (no changes)
- Poll at T+12s (no changes)

**Verification:**
- ✅ Each "Mark rep" command recognized
- ✅ Counter increments correctly (1→2→3→4→5)
- ✅ Visual feedback appears for each rep
- ✅ No duplicate counts
- ✅ Web app shows presence indicator throughout

### Phase 4: End Session (15-20 seconds)

**Voice Command:** "End session, completed 5 Leave It reps"

**VR Response:**
1. Voice recognition activates
2. Transcript appears: "End session, completed 5 Leave It reps"
3. Shows "Submitting activity..." loading indicator
4. Calls `/api/voice-log` endpoint
5. Receives response with XP breakdown
6. Shows "Activity logged!" success message
7. Displays XP awarded: "+50 IMP, +20 INT"

**Backend Processing:**
1. Receives POST to `/api/voice-log`
2. AI parses: "Leave It training, 5 reps"
3. Determines stat gains: IMP +50, INT +20
4. Creates activity record in Convex
5. Updates dog stats: IMP 780→830, INT 320→340
6. Updates daily goals: Mental +1
7. Returns success response

**Web App Response:**
- Convex subscription fires (~T+16-18s)
- New activity appears in feed: "Leave It training (5 reps)"
- Shows XP breakdown: IMP +50, INT +20
- Shows "Logged by: VR"
- Stats not yet updated (waiting for next poll)

**API Calls:**
- POST `/api/voice-log` at T+15s
- Poll at T+15s (just before activity creation)
- Poll at T+18s (might catch update)

**Verification:**
- ✅ Voice command recognized correctly
- ✅ API call succeeds (200 OK)
- ✅ Response includes activityId
- ✅ Response includes xpAwarded array
- ✅ VR shows success message
- ✅ Web app shows new activity within 3 seconds
- ✅ Activity shows correct XP breakdown

### Phase 5: Stats Update (20-23 seconds)

**VR Response:**
1. Next poll occurs at T+21s
2. Fetches updated stats from `/api/vr-status`
3. Receives new IMP value: 830 XP (was 780)
4. Receives new INT value: 340 XP (was 320)
5. Animates XP gain: "+50 IMP" floats up
6. Animates XP gain: "+20 INT" floats up
7. Updates stat orbs with new values
8. Updates progress bars
9. Shows level-up animation if applicable

**Web App Response:**
- Stats already updated via Convex subscription
- Shows IMP: 830 XP
- Shows INT: 340 XP
- Activity feed shows new entry at top

**API Calls:**
- Poll at T+21s (gets updated stats)

**Verification:**
- ✅ VR polls and receives updated stats
- ✅ IMP stat increases by 50 XP
- ✅ INT stat increases by 20 XP
- ✅ XP animations play smoothly
- ✅ Stat orbs update to new values
- ✅ Web app shows identical stats
- ✅ Both apps synchronized

### Phase 6: Return to Minimal (23-25 seconds)

**VR Response:**
1. Training mode exits automatically
2. Returns to minimal UI with floating panels
3. Shows updated stats in stat orbs
4. Shows updated goals (Mental +1)
5. Shows updated activity feed (new entry at top)
6. Continues polling every 3 seconds

**Web App Response:**
- Presence indicator disappears: "Training in VR" → gone
- Shows updated stats
- Shows new activity in feed
- Continues real-time updates via Convex

**API Calls:**
- Poll at T+24s (confirms sync)

**Verification:**
- ✅ Training mode exits cleanly
- ✅ Minimal UI shows updated stats
- ✅ Activity appears in VR feed
- ✅ Goals updated correctly
- ✅ Web app synchronized
- ✅ No errors or crashes

## Expected Data Changes

### Before Demo (T+0s)
```json
{
  "dogName": "Bumi",
  "level": 12,
  "overallXp": 1450,
  "stats": [
    { "type": "PHY", "level": 10, "xp": 450 },
    { "type": "INT", "level": 8, "xp": 320 },
    { "type": "IMP", "level": 15, "xp": 780 },
    { "type": "SOC", "level": 6, "xp": 120 }
  ],
  "goals": {
    "physical": { "current": 2, "target": 3 },
    "mental": { "current": 1, "target": 2 },
    "streak": 7
  }
}
```

### After Demo (T+25s)
```json
{
  "dogName": "Bumi",
  "level": 12,
  "overallXp": 1520,
  "stats": [
    { "type": "PHY", "level": 10, "xp": 450 },
    { "type": "INT", "level": 8, "xp": 340 },  // +20
    { "type": "IMP", "level": 15, "xp": 830 },  // +50
    { "type": "SOC", "level": 6, "xp": 120 }
  ],
  "goals": {
    "physical": { "current": 2, "target": 3 },
    "mental": { "current": 2, "target": 2 },  // +1 (goal complete!)
    "streak": 7
  },
  "recentActivities": [
    {
      "id": "k17...",
      "name": "Leave It training (5 reps)",
      "xpBreakdown": [
        { "stat": "IMP", "amount": 50 },
        { "stat": "INT", "amount": 20 }
      ],
      "timestamp": 1732723215000,
      "loggedBy": "VR"
    },
    // ... previous activities
  ]
}
```

## Test Execution

### Prerequisites
1. ✅ Netlify deployment is live
2. ✅ API endpoints are accessible
3. ✅ Convex backend has demo dog ("Bumi")
4. ✅ VR app configured for production API
5. ✅ Vision Pro device ready
6. ✅ Web app open on laptop/phone
7. ✅ Both apps showing same dog

### Test Steps

#### Setup (Before Demo)
1. Open web app at `https://corgi-quest.netlify.app`
2. Log in as demo user
3. Navigate to Overview screen
4. Note current IMP stat: _____ XP
5. Note current INT stat: _____ XP
6. Note mental goal progress: ___/2

7. Open VR app on Vision Pro
8. Navigate to Training Room
9. Verify stats match web app
10. Verify polling is active (check console)

#### Execute Demo (15-25 seconds)
Follow the 6-phase flow above, checking each verification point.

#### Post-Demo Verification
1. Check VR app stats:
   - IMP increased by 50 XP? ✅/❌
   - INT increased by 20 XP? ✅/❌
   - Activity in feed? ✅/❌

2. Check web app stats:
   - IMP increased by 50 XP? ✅/❌
   - INT increased by 20 XP? ✅/❌
   - Activity in feed? ✅/❌
   - Mental goal complete? ✅/❌

3. Check synchronization:
   - Both apps show same IMP XP? ✅/❌
   - Both apps show same INT XP? ✅/❌
   - Both apps show same activity? ✅/❌
   - Sync delay < 3 seconds? ✅/❌

### Success Criteria

**Must Pass:**
- ✅ All voice commands recognized correctly
- ✅ Rep counter increments properly (1→2→3→4→5)
- ✅ Activity submitted successfully
- ✅ IMP stat increases by expected amount
- ✅ Activity appears in both VR and web app
- ✅ Both apps synchronized within 3 seconds
- ✅ No errors or crashes
- ✅ Total demo time: 15-25 seconds

**Nice to Have:**
- ✅ Smooth animations throughout
- ✅ Clear visual feedback for each action
- ✅ Mental goal completes (2/2)
- ✅ Level-up animation if threshold reached

## Troubleshooting

### Issue: Voice Commands Not Recognized
**Symptoms:**
- "Start training" doesn't activate training mode
- "Mark rep" doesn't increment counter
- "End session" doesn't submit activity

**Solutions:**
1. Check microphone permissions in Vision Pro settings
2. Verify VoiceCommandHandler is properly initialized
3. Check for background noise interference
4. Try speaking more clearly and slowly
5. Check Xcode console for voice recognition errors

### Issue: Activity Not Submitted
**Symptoms:**
- "End session" shows error message
- No activity appears in web app
- VR shows "Failed to log activity"

**Solutions:**
1. Check network connection on Vision Pro
2. Verify API endpoint is accessible: `curl https://corgi-quest.netlify.app/api/voice-log`
3. Check Convex backend is running
4. Verify OpenAI API key is configured
5. Check API logs for errors

### Issue: Stats Not Updating
**Symptoms:**
- Activity submitted successfully
- Activity appears in feed
- But stats don't increase

**Solutions:**
1. Wait for next poll (up to 3 seconds)
2. Check if XP calculation is correct in backend
3. Verify stat gains in activity record
4. Check Convex mutations are working
5. Manually refresh VR app

### Issue: Sync Delay > 5 Seconds
**Symptoms:**
- Activity appears in web app quickly
- But VR takes too long to update

**Solutions:**
1. Check API response times (should be < 500ms)
2. Verify polling is active (check console)
3. Check network latency on Vision Pro
4. Verify no rate limiting on API
5. Check for slow Convex queries

### Issue: Rep Counter Doesn't Increment
**Symptoms:**
- "Mark rep" recognized
- But counter stays at 0/5

**Solutions:**
1. Check TrainingRoomViewModel rep tracking logic
2. Verify voice command parsing
3. Check for state management issues
4. Restart VR app
5. Check Xcode console for errors

## Alternative Test Scenarios

### Scenario 2: "Sit-Stay" Training
**Activity:** Sit-stay impulse control
**Duration:** 15-25 seconds
**Primary Stat:** IMP
**Voice Commands:**
- "Start training Sit-Stay"
- "Mark rep" × 5
- "End session, completed 5 Sit-Stay reps"

### Scenario 3: "Recall" Training
**Activity:** Recall/come when called
**Duration:** 15-25 seconds
**Primary Stat:** INT
**Secondary Stat:** PHY
**Voice Commands:**
- "Start training Recall"
- "Mark rep" × 5
- "End session, completed 5 Recall reps"

### Scenario 4: "Loose Leash" Training
**Activity:** Loose leash walking
**Duration:** 15-25 seconds
**Primary Stat:** PHY
**Secondary Stat:** IMP
**Voice Commands:**
- "Start training Loose Leash"
- "Mark rep" × 5
- "End session, completed 5 Loose Leash reps"

## Performance Benchmarks

### Target Metrics
- **Voice Recognition Latency:** < 500ms
- **Rep Counter Update:** < 100ms
- **Activity Submission:** < 2 seconds
- **API Response Time:** < 500ms
- **Sync Delay (VR → Web):** < 3 seconds
- **Total Demo Duration:** 15-25 seconds

### Actual Measurements
Record actual times during testing:

| Metric | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| Voice recognition | < 500ms | ___ms | ✅/❌ |
| Rep counter update | < 100ms | ___ms | ✅/❌ |
| Activity submission | < 2s | ___s | ✅/❌ |
| API response | < 500ms | ___ms | ✅/❌ |
| Sync delay | < 3s | ___s | ✅/❌ |
| Total demo time | 15-25s | ___s | ✅/❌ |

## Demo Rehearsal Checklist

Before presenting:
- [ ] Test complete flow 3 times successfully
- [ ] Verify all voice commands work reliably
- [ ] Confirm API endpoints are accessible
- [ ] Check network connection is stable
- [ ] Verify both apps show same dog
- [ ] Practice timing (aim for 20 seconds)
- [ ] Prepare backup plan if API fails
- [ ] Have mock data fallback ready
- [ ] Test on actual Vision Pro device (not simulator)
- [ ] Record demo video as backup

## Requirements Validated

- ✅ **Requirement 2.1:** Voice transcript parsed using AI
- ✅ **Requirement 2.2:** Activity record created in database
- ✅ **Requirement 2.3:** XP awarded to appropriate stats
- ✅ **Requirement 2.4:** Daily goal progress updated
- ✅ **Requirement 2.5:** Activity ID and XP breakdown returned
- ✅ **Requirement 5.2:** Real-time sync < 3 seconds
- ✅ **Demo Requirement:** Complete flow in 15-25 seconds

## Next Steps

After successful demo flow test:
1. Test error scenarios (Task 6.5)
2. Deploy to production (Task 8.1)
3. Update VR app configuration (Task 8.2)
4. Perform end-to-end demo rehearsal (Task 8.3)

