# useVRData Hook

## Overview

The `useVRData` hook provides a unified interface for fetching all data needed for the VR training HUD. It aggregates multiple Convex queries into a single hook with real-time subscriptions.

## Requirements

- **9.1**: Fetch current dog stats, goals, and activities from Convex Backend
- **9.2**: Update VR-HUD within 3 seconds when data changes in Convex Backend

## Features

- **Real-time subscriptions**: All data updates automatically via Convex subscriptions
- **Unified interface**: Single hook provides all VR-HUD data
- **Loading state**: Tracks when data is being fetched
- **Null safety**: Handles cases where no dog is selected or data is unavailable

## Usage

```typescript
import { useVRData } from "../../hooks/useVRData";
import { useActiveDog } from "../../hooks/useActiveDog";

function VRScene() {
  const { activeDogId } = useActiveDog();
  const vrData = useVRData(activeDogId);

  // Handle loading state
  if (vrData.isLoading) {
    return <LoadingIndicator />;
  }

  // Handle no dog selected
  if (!vrData.dog) {
    return <NoDogMessage />;
  }

  // Use the data
  return (
    <>
      <DogProfile dog={vrData.dog} />
      <StatOrbs stats={vrData.stats} />
      <GoalsPanel goals={vrData.goals} />
      <ActivityFeed activities={vrData.activities} />
      <WeeklyChart data={vrData.weeklyXP} />
      <StreakDisplay streak={vrData.streak} />
    </>
  );
}
```

## Data Structure

### VRData Interface

```typescript
interface VRData {
  dog: Dog | null;
  stats: DogStat[];
  goals: DailyGoal | null;
  activities: ActivityWithDetails[];
  weeklyXP: Array<{ date: string; xp: number }>;
  streak: Streak | null;
  isLoading: boolean;
}
```

### Dog

```typescript
{
  _id: Id<"dogs">;
  name: string;
  householdId: Id<"households">;
  overallLevel: number;
  overallXp: number;
  xpToNextLevel: number;
  photoUrl?: string;
  breed?: string;
  traits?: string[];
  createdAt: number;
}
```

### DogStat

```typescript
{
  _id: Id<"dog_stats">;
  dogId: Id<"dogs">;
  statType: "INT" | "PHY" | "IMP" | "SOC";
  level: number;
  xp: number;
  xpToNextLevel: number;
}
```

### DailyGoal

```typescript
{
  _id: Id<"daily_goals">;
  dogId: Id<"dogs">;
  date: string; // YYYY-MM-DD
  physicalPoints: number;
  physicalGoal: number;
  mentalPoints: number;
  mentalGoal: number;
}
```

### Activity (with details)

```typescript
{
  _id: Id<"activities">;
  dogId: Id<"dogs">;
  userId: Id<"users">;
  activityName: string;
  description?: string;
  durationMinutes?: number;
  physicalPoints?: number;
  mentalPoints?: number;
  createdAt: number;
  userName: string;
  statGains: Array<{
    _id: Id<"activity_stat_gains">;
    activityId: Id<"activities">;
    statType: "INT" | "PHY" | "IMP" | "SOC";
    xpAmount: number;
  }>;
}
```

### Streak

```typescript
{
  _id: Id<"streaks">;
  dogId: Id<"dogs">;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
}
```

## Real-Time Updates

All data in the `useVRData` hook updates automatically when changes occur in the Convex backend:

- When a new activity is logged, `activities` updates immediately
- When XP is gained, `stats` and `weeklyXP` update automatically
- When goals progress, `goals` updates in real-time
- When the streak changes, `streak` updates instantly

This ensures the VR-HUD always displays current data without manual refetching.

## Performance

The hook uses Convex's optimized query system:

- Queries are batched and deduplicated
- Only changed data triggers re-renders
- Subscriptions are managed automatically
- No polling or manual refetching needed

## Error Handling

The hook handles common error cases:

- **No dog selected**: Returns `dog: null` and empty arrays
- **Loading state**: Returns `isLoading: true` while fetching
- **Missing data**: Returns `null` for optional fields (goals, streak)
- **Network errors**: Convex handles reconnection automatically

## Testing

See `useVRData.test.ts` for unit tests that verify the interface structure and type safety.

For integration testing with actual Convex queries, use the VR route in a development environment with seed data.

## Related Hooks

- `useActiveDog`: Get the currently selected dog ID
- `useSelectedCharacter`: Get the current user's character
- `useConvexConnection`: Monitor Convex connection status

## Implementation Notes

- The hook limits activities to 5 most recent for VR display performance
- Weekly XP data comes from the last 30 days of activities
- All queries use Convex `useQuery` hooks (never `fetch`)
- The hook follows the "skip" pattern when `dogId` is null
