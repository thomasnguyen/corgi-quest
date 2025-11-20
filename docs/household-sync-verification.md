# Household Sync Verification Guide

This document provides verification steps for real-time household synchronization in Corgi Quest.

## Overview

The multi-dog AI onboarding feature includes real-time synchronization across all household members using Convex's subscription system. This ensures that when one user creates or updates a dog, all other users in the same household see the changes immediately.

## Architecture

### Convex Real-Time Subscriptions

The system uses Convex's built-in real-time subscription system with proper indexes:

1. **Dogs Table** (`by_household` index):
   ```typescript
   dogs: defineTable({
     name: v.string(),
     householdId: v.id("households"),
     breed: v.optional(v.string()),
     traits: v.optional(v.array(v.string())),
     // ... other fields
   }).index("by_household", ["householdId"])
   ```

2. **Quests Table** (`by_dog` index):
   ```typescript
   quests: defineTable({
     dogId: v.optional(v.id("dogs")),
     name: v.string(),
     // ... other fields
   }).index("by_dog", ["dogId"])
   ```

3. **Activities Table** (`by_dog_and_created` index):
   ```typescript
   activities: defineTable({
     dogId: v.id("dogs"),
     // ... other fields
     createdAt: v.number(),
   })
     .index("by_dog", ["dogId"])
     .index("by_dog_and_created", ["dogId", "createdAt"])
   ```

### Key Queries

1. **getHouseholdDogs** - Subscribes to all dogs in a household
2. **getDogQuests** - Subscribes to quests for a specific dog
3. **getActivityFeed** - Subscribes to activities for a specific dog
4. **getDogProfile** - Subscribes to dog profile and stats

## Verification Steps

### Requirement 9.2: New Dogs Appear in Real-Time

**Test Scenario**: When one partner adds a new dog, the other partner should see it immediately.

**Steps**:
1. Open two browser windows/tabs (or two devices)
2. Log in as different users in the same household
3. In Window A: Open the dog menu (tap dog chip)
4. In Window B: Tap "+ Add new dog" and complete the onboarding flow
5. **Expected Result**: Window A's dog menu should update automatically to show the new dog without refreshing

**Technical Details**:
- Uses `useQuery(api.queries.getHouseholdDogs, { householdId })`
- Convex automatically pushes updates when a new dog is inserted
- No manual refetching required

### Requirement 9.4: Dog Updates Sync in Real-Time

**Test Scenario**: When one partner updates a dog's data, the other partner sees the changes immediately.

**Steps**:
1. Open two browser windows with different users in the same household
2. Both users select the same dog as active
3. In Window A: Log an activity for the dog
4. **Expected Result**: Window B should show the new activity in the feed immediately
5. **Expected Result**: Window B should show updated XP and stats immediately

**Technical Details**:
- Uses `useQuery(api.queries.getActivityFeed, { dogId })`
- Uses `useQuery(api.queries.getDogProfile, { dogId })`
- Convex pushes updates when activities or stats are modified

### Requirement 9.3: Active Dog Selection is User-Specific

**Test Scenario**: Each user's active dog selection should be independent.

**Steps**:
1. Open two browser windows with different users in the same household
2. Create at least 2 dogs in the household
3. In Window A: Select Dog 1 as active
4. In Window B: Select Dog 2 as active
5. **Expected Result**: Window A shows Dog 1's data
6. **Expected Result**: Window B shows Dog 2's data
7. In Window A: Switch to Dog 2
8. **Expected Result**: Window B still shows Dog 2 (unchanged)
9. **Expected Result**: Window A now shows Dog 2

**Technical Details**:
- Active dog ID is stored in localStorage with user-scoped keys: `activeDogId_{userId}`
- Each user's selection is independent and persists across sessions
- Verified by unit tests in `src/lib/householdSync.test.ts`

## Manual Testing Checklist

### Setup
- [ ] Create a household with at least 2 users
- [ ] Open two browser windows/tabs or two devices
- [ ] Log in as different users in each window

### Real-Time Dog Creation (Req 9.2)
- [ ] Window A: Open dog menu
- [ ] Window B: Create a new dog via voice onboarding
- [ ] Verify: New dog appears in Window A's menu without refresh
- [ ] Verify: New dog appears with correct name, breed, and traits

### Real-Time Activity Sync (Req 9.4)
- [ ] Both windows: Select the same dog as active
- [ ] Window A: Log a training activity
- [ ] Verify: Activity appears in Window B's feed immediately
- [ ] Verify: XP bars update in Window B immediately
- [ ] Verify: Daily goals update in Window B immediately

### Real-Time Quest Sync (Req 9.4)
- [ ] Both windows: Select the same dog as active
- [ ] Window A: Create a new dog (which creates a starter quest)
- [ ] Verify: Starter quest appears in Window B's quest list immediately

### Independent Active Dog Selection (Req 9.3)
- [ ] Create at least 2 dogs in the household
- [ ] Window A: Select Dog 1
- [ ] Window B: Select Dog 2
- [ ] Verify: Window A shows Dog 1's stats and activities
- [ ] Verify: Window B shows Dog 2's stats and activities
- [ ] Window A: Switch to Dog 2
- [ ] Verify: Window B still shows Dog 2 (unchanged)
- [ ] Verify: Window A now shows Dog 2's data

### Persistence Across Sessions (Req 3.5)
- [ ] Window A: Select a specific dog
- [ ] Window A: Refresh the page
- [ ] Verify: Same dog is still active after refresh
- [ ] Window A: Close and reopen the browser
- [ ] Verify: Same dog is still active

## Automated Tests

### Unit Tests
Location: `src/lib/householdSync.test.ts`

Tests verify:
- ✅ Active dog ID is scoped to user ID
- ✅ One user's dog switch doesn't affect other users
- ✅ Active dog selection persists across sessions
- ✅ Multiple users in same household have independent selections
- ✅ localStorage keys use correct format: `activeDogId_{userId}`

Run tests:
```bash
npm run test -- src/lib/householdSync.test.ts
```

### Integration Tests
Convex subscriptions are tested through manual verification as described above. The real-time nature of Convex makes it difficult to test in isolation without a live Convex backend.

## Troubleshooting

### Dogs Not Appearing in Real-Time

**Symptom**: New dogs don't appear in other users' dog menus automatically.

**Possible Causes**:
1. Convex subscription not active
2. Network connectivity issues
3. Browser tab is backgrounded (some browsers throttle subscriptions)

**Solutions**:
1. Check browser console for Convex connection errors
2. Verify `useQuery(api.queries.getHouseholdDogs)` is being called
3. Bring tab to foreground
4. Check network tab for WebSocket connection

### Active Dog Selection Not Persisting

**Symptom**: Active dog resets after page refresh.

**Possible Causes**:
1. localStorage is disabled or blocked
2. User ID is changing between sessions
3. localStorage is being cleared

**Solutions**:
1. Check browser settings for localStorage permissions
2. Verify user ID is consistent (check `useSelectedCharacter` hook)
3. Check for code that calls `clearActiveDogId`

### One User's Selection Affects Another

**Symptom**: When User A switches dogs, User B's view changes too.

**Possible Causes**:
1. Both users are logged in as the same user
2. localStorage keys are not properly scoped

**Solutions**:
1. Verify each user has a unique user ID
2. Check localStorage keys in browser DevTools (should be `activeDogId_{userId}`)
3. Run unit tests to verify scoping logic

## Performance Considerations

### Subscription Efficiency

Convex subscriptions are highly efficient:
- Only changed data is sent over the wire
- Subscriptions use WebSocket for low latency
- Indexes ensure fast queries

### Scaling

The current implementation scales well:
- Each household typically has 1-5 dogs
- Queries are indexed by `householdId` and `dogId`
- No N+1 query problems

## Related Files

- `convex/schema.ts` - Database schema with indexes
- `convex/queries.ts` - Real-time query definitions
- `convex/mutations.ts` - Dog creation and update mutations
- `src/hooks/useActiveDog.ts` - Active dog management hook
- `src/lib/activeDogStorage.ts` - localStorage utilities
- `src/components/dog/DogMenu.tsx` - Dog selection UI
- `src/components/dog/AddDogModal.tsx` - Dog creation flow

## Conclusion

The household sync system is built on Convex's real-time subscription infrastructure with proper indexes and user-scoped localStorage. All requirements (9.2, 9.3, 9.4) are met through:

1. **Real-time subscriptions** via Convex `useQuery` hooks
2. **User-specific active dog selection** via localStorage with user-scoped keys
3. **Proper indexes** for efficient queries
4. **Automatic updates** without manual refetching

The system has been verified through unit tests and should be manually tested with multiple users to confirm real-time behavior in production.
