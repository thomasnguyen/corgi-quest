# Kiro Activity Pipeline - Fan Out Architecture

## Visual Diagram for Demo

```
┌─────────────────────────────────────────────────────────────────┐
│                         NEW ACTION                               │
│                                                                   │
│  🚶 Walk    🎯 Rep    🧩 Puzzle Toy    🎾 Fetch    🗣️ Voice Log  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Kiro-generated hooks
                             │ automatically fan out to:
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   📊 XP       │    │  🎯 GOALS     │    │  🔥 STREAKS   │
│               │    │               │    │               │
│ PHY +15       │    │ Physical ✓    │    │ Day 12        │
│ INT +10       │    │ Mental ✓      │    │ Keep going!   │
│ IMP +5        │    │               │    │               │
└───────────────┘    └───────────────┘    └───────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
                    ┌───────────────┐
                    │  🥽 VR HUD    │
                    │               │
                    │ Updates live  │
                    │ in Vision Pro │
                    └───────────────┘
```

## Code Flow (Show These Files in Sequence)

### 1. Action Logged
**File:** `src/routes/app.log-activity.tsx` or `src/components/training/TrainingModeInterface.tsx`
**Show:** User logs "5 minute walk with 3 calm reps"

### 2. XP Bar Jumps
**File:** `src/components/dog/StatOrb.tsx`
**Show:** The stat orbs animating with new XP values
**Code snippet to highlight:**
```typescript
// Real-time XP update via Convex
const stats = useQuery(api.queries.getDogStats, { dogId });
```

### 3. Goals Panel Updates
**File:** `src/components/layout/TopResourceBar.tsx`
**Show:** Daily goals progress bars filling up
**Code snippet to highlight:**
```typescript
// Goals update automatically
const goals = useQuery(api.queries.getTodaysGoals, { dogId });
```

### 4. Streak Badge Pulses
**File:** `src/components/dog/StatsView.tsx` or overview screen
**Show:** Streak counter incrementing with animation
**Code snippet to highlight:**
```typescript
// Streak updates in real-time
const streak = useQuery(api.queries.getCurrentStreak, { dogId });
```

### 5. VR HUD Updates
**File:** `src/routes/app.vr.tsx` or `src/components/vr/VRScene.tsx`
**Show:** VR panels updating simultaneously
**Code snippet to highlight:**
```typescript
// Same Convex queries power VR
const stats = useQuery(api.queries.getDogStats, { dogId });
const goals = useQuery(api.queries.getTodaysGoals, { dogId });
```

## Key Files That Make This Work

### Convex Mutations (The Fan-Out Logic)
**File:** `convex/mutations.ts`
**Function:** `logActivity`

This single mutation updates:
- `activities` table (new activity record)
- `activity_stat_gains` table (XP breakdown)
- `dog_stats` table (stat totals)
- `daily_goals` table (progress)
- `streaks` table (streak count)

**Show this code block:**
```typescript
export const logActivity = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    // 1. Create activity
    await ctx.db.insert("activities", { /* ... */ });
    
    // 2. Award XP to stats
    await ctx.db.insert("activity_stat_gains", { /* ... */ });
    
    // 3. Update daily goals
    await ctx.db.patch(goalId, { progress: newProgress });
    
    // 4. Update streak
    await ctx.db.patch(streakId, { currentStreak: streak + 1 });
    
    // All subscribers update instantly via Convex real-time
  }
});
```

### Hooks That Subscribe (No Manual Wiring)
**Files to show:**
- `src/hooks/useActiveDog.ts` - Gets current dog
- `src/hooks/useVRData.ts` - Powers VR HUD
- `src/hooks/useWeeklySummary.ts` - Aggregates stats

**Key point:** All use `useQuery` from Convex, so they update automatically when mutations run.

## Demo Script

**Say this while showing the visuals:**

> "So any new action—walk, rep, puzzle toy—automatically fans out to XP, goals, streaks, and VR without wiring everything by hand."

**Visual sequence (5-7 seconds total):**
1. Show action being logged (1s)
2. Cut to XP bars jumping (1s)
3. Cut to goals panel updating (1s)
4. Cut to streak badge pulsing (1s)
5. Cut to VR HUD showing all updates (2s)

**Then show the code:**
> "This works because Kiro helped me structure the Convex mutations to update all related tables, and generated hooks that subscribe to those changes. One mutation, instant updates everywhere."

Show `convex/mutations.ts` with the `logActivity` function highlighted.

## Alternative: Live Demo

Instead of a diagram, you could do a live demo:
1. Open web app on laptop
2. Open VR view on phone (or Vision Pro if available)
3. Log an activity on laptop
4. Show both screens updating simultaneously

This is more impressive but riskier for a recorded demo.
