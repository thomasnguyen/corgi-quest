# Presence Indicators Implementation

## Overview
Implemented real-time presence indicators to show when a partner is logging an activity. This provides awareness of partner activity across devices.

## Bug Fix (Infinite Loading)
**Issue**: The main page showed an infinite loading screen after implementing TopResourceBar.

**Root Cause**: TopResourceBar was making queries but didn't have its own loading state. The parent component (OverviewPage) was waiting for `firstDog` and `dogProfile` to load, but TopResourceBar was also waiting for its queries to resolve, creating a loading state deadlock.

**Solution**: Added a loading state check to TopResourceBar that returns early with placeholder values (0/50, 0/30, streak 0) when `firstDog` is undefined. This allows the component to render immediately while queries are loading, preventing the infinite loading screen.

## Changes Made

### 1. Database Schema (convex/schema.ts)
- Added new `presence` table with fields:
  - `userId`: Reference to the user
  - `location`: Current screen/location (e.g., "log-activity")
  - `lastSeen`: Timestamp of last presence update
- Added index `by_user` for efficient queries

### 2. Convex Mutations (convex/mutations.ts)
- **updatePresence**: Updates or creates a presence record for a user
  - Called when user enters a screen
  - Updates location and lastSeen timestamp
- **clearPresence**: Clears a user's presence (sets location to empty)
  - Called when user leaves a screen or unmounts

### 3. Convex Queries (convex/queries.ts)
- **getPartnerPresence**: Gets the partner's current presence status
  - Finds the other user in the household
  - Returns partner name, location, and lastSeen
  - Considers presence stale if lastSeen > 30 seconds ago

### 4. TopResourceBar Component (src/components/layout/TopResourceBar.tsx)
- Created new component to display daily goals, streak, and presence
- Subscribes to `getPartnerPresence` query
- Shows green indicator with "Partner is logging..." when partner is on log-activity screen
- Includes animated pulse effect for visual feedback

### 5. Log Activity Route (src/routes/log-activity.tsx)
- Updates presence to "log-activity" when component mounts
- Clears presence when component unmounts or user navigates away
- Uses useEffect cleanup function to ensure presence is cleared

### 6. Overview Route (src/routes/index.tsx)
- Refactored to use new TopResourceBar component
- Removed inline top resource bar code
- Simplified component by delegating to TopResourceBar

## How It Works

1. **User A navigates to /log-activity**
   - `updatePresence` mutation is called with location="log-activity"
   - Presence record is created/updated in database

2. **User B sees the indicator**
   - TopResourceBar subscribes to `getPartnerPresence` query
   - Query detects User A's presence at "log-activity"
   - Green indicator appears: "User A is logging..."

3. **User A leaves /log-activity**
   - `clearPresence` mutation is called
   - Presence location is set to empty string
   - Indicator disappears from User B's screen

4. **Stale Presence Handling**
   - If lastSeen > 30 seconds, presence is considered stale
   - Query returns empty location to hide indicator
   - Prevents showing stale presence if user closes browser

## Testing

### Manual Testing
1. Open two browser windows side-by-side
2. In Window 1: Navigate to /log-activity
3. In Window 2: Check the top of the Overview screen
4. You should see: "Holly is logging..." (or partner's name)
5. In Window 1: Navigate away from /log-activity
6. In Window 2: Indicator should disappear

### Real-Time Verification
- Changes should appear within 1 second (Convex real-time sync)
- Indicator should have animated pulse effect
- Green color indicates active presence

## Requirements Met
- ✅ Create presence table in schema
- ✅ Create mutation to update presence when entering/leaving log-activity screen
- ✅ Create query to get partner's presence status
- ✅ Display indicator in TopResourceBar when partner is on log-activity
- ✅ Clear presence on unmount or navigation away
- ✅ Requirement 1: Real-Time Multi-User Data Synchronization

## Future Enhancements
- Add presence for other screens (overview, quests, activity)
- Show typing indicators during voice logging
- Add "last seen" timestamps
- Support more than 2 users per household
