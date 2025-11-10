# Offline Mutation Queueing Test

## Implementation Summary

Task 43 has been implemented with the following features:

### 1. Connection State Monitoring Hook (`useConvexConnection`)
- Polls Convex connection state every 500ms
- Tracks three states: `connected`, `reconnecting`, `disconnected`
- Detects pending mutations when offline
- Located in: `src/hooks/useConvexConnection.ts`

### 2. Visual Indicators in TopResourceBar
- **Syncing...** - Yellow banner with spinning icon when mutations are pending
- **Reconnecting...** - Yellow banner when connection is being restored
- **Offline** - Red banner with message "Changes will sync when online"
- All indicators appear below the resource stats (streak, physical, mental)

### 3. Automatic Behavior (Convex Built-in)
- Mutations are automatically queued when offline
- Mutations are automatically retried when connection is restored
- Exponential backoff for reconnection attempts
- No manual intervention required

## Testing Instructions

### Test 1: Offline Activity Logging
1. Open the app in your browser
2. Open DevTools → Network tab
3. Set network to "Offline"
4. Navigate to LOG ACTIVITY screen
5. Try to log an activity via voice
6. **Expected**: "Offline - Changes will sync when online" banner appears
7. Set network back to "Online"
8. **Expected**: "Syncing..." banner appears briefly, then activity syncs

### Test 2: Connection Loss During Activity
1. Open the app with network online
2. Navigate to LOG ACTIVITY screen
3. Start logging an activity
4. While OpenAI is processing, set network to "Offline"
5. **Expected**: "Offline" banner appears
6. Set network back to "Online"
7. **Expected**: Activity completes and syncs automatically

### Test 3: Reconnection Behavior
1. Open the app with network online
2. Set network to "Offline" for 5 seconds
3. **Expected**: "Offline" banner appears
4. Set network back to "Online"
5. **Expected**: "Reconnecting..." banner appears briefly
6. **Expected**: Connection restores and banner disappears

### Test 4: Multiple Devices
1. Open app on two devices/browsers
2. On Device A, go offline and log an activity
3. **Expected**: Device A shows "Offline" banner
4. On Device A, go back online
5. **Expected**: Device A shows "Syncing..." banner
6. **Expected**: Device B receives the activity in real-time

## Technical Details

### Convex Automatic Queueing
Convex handles offline mutations automatically:
- When offline, mutations are queued in memory
- When connection is restored, queued mutations are sent
- Exponential backoff prevents overwhelming the server
- No data loss as long as the browser tab stays open

### Connection State Properties
The hook monitors these Convex connection state properties:
- `isWebSocketConnected` - Whether WebSocket is connected
- `hasInflightRequests` - Whether there are pending requests

### Visual Feedback
- **Yellow** indicators for temporary states (syncing, reconnecting)
- **Red** indicators for error states (offline)
- **Green** indicators for success states (partner logging)
- Spinning icon for active processes (syncing, reconnecting)

## Requirements Met

✅ Requirement 24: Error Handling for Voice Logging
- Clear offline status display
- Automatic reconnection with visual feedback
- Queue mutations when offline

✅ Task 43 Acceptance Criteria:
- Convex handles offline queueing automatically ✓
- Mutations are queued when offline and retried when online ✓
- Visual indicator showing "Syncing..." when mutations are pending ✓
- Can test by going offline, logging activity, then going back online ✓
- Activity syncs automatically ✓

## Notes

- The connection state is polled every 500ms for responsiveness
- Indicators only appear when there's a status to show (no clutter when connected)
- The implementation is minimal and relies on Convex's built-in capabilities
- No additional error handling needed - Convex handles retries automatically
