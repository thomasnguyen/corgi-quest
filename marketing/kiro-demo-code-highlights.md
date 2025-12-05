# Kiro Demo - Code Highlights for "Fan Out" Section

## What to Show: The `logActivity` Mutation

This single mutation demonstrates how Kiro helped structure the fan-out architecture.

### File to Display
**Path:** `convex/mutations.ts`
**Function:** `logActivity` (lines 30-200)

---

## Screen Recording Plan

### Option 1: Show the Full Mutation (Recommended)
Record a slow scroll through the `logActivity` function with these sections highlighted:

#### 1. Function Signature (Line 30-50)
```typescript
export const logActivity = mutation({
  args: {
    dogId: v.id("dogs"),
    userId: v.id("users"),
    activityName: v.string(),
    // ... stat gains, physical/mental points
  },
```
**Voiceover:** "One mutation accepts the activity..."

#### 2. Step 1: Insert Activity (Line 70-80)
```typescript
// Step 1: Insert activity record
const activityId = await ctx.db.insert("activities", {
  dogId: args.dogId,
  userId: args.userId,
  activityName: args.activityName,
  // ...
});
```
**Voiceover:** "...logs it to the database..."

#### 3. Step 2: Insert Stat Gains (Line 82-88)
```typescript
// Step 2: Insert stat gain records
for (const statGain of args.statGains) {
  await ctx.db.insert("activity_stat_gains", {
    activityId,
    statType: statGain.statType,
    xpAmount: statGain.xpAmount,
  });
}
```
**Voiceover:** "...awards XP to each stat..."

#### 4. Step 3: Update Stats with Level-Ups (Line 90-125)
```typescript
// Step 3: Update dog_stats with new XP values and handle level-ups
const levelUpResults = [];
for (const statGain of args.statGains) {
  const stat = await ctx.db
    .query("dog_stats")
    .withIndex("by_dog_and_stat", (q) =>
      q.eq("dogId", args.dogId).eq("statType", statGain.statType)
    )
    .first();

  if (stat) {
    const result = calculateLevelUp(stat.level, stat.xp, statGain.xpAmount);
    await ctx.db.patch(stat._id, {
      level: result.newLevel,
      xp: result.newXp,
      xpToNextLevel: result.xpToNextLevel,
    });
  }
}
```
**Voiceover:** "...handles level-ups..."

#### 5. Step 5: Update Daily Goals (Line 165-185)
```typescript
// Step 5: Update daily_goals with physical and mental points
const dailyGoal = await ctx.db
  .query("daily_goals")
  .withIndex("by_dog_and_date", (q) =>
    q.eq("dogId", args.dogId).eq("date", today)
  )
  .first();

if (dailyGoal) {
  await ctx.db.patch(dailyGoal._id, {
    physicalPoints: dailyGoal.physicalPoints + args.physicalPoints,
    mentalPoints: dailyGoal.mentalPoints + args.mentalPoints,
  });
}
```
**Voiceover:** "...updates daily goals..."

#### 6. Step 6: Update Streak (Line 187-200)
```typescript
// Step 6: Update streak lastActivityDate to today
const streak = await ctx.db
  .query("streaks")
  .withIndex("by_dog", (q) => q.eq("dogId", args.dogId))
  .first();

if (streak) {
  await ctx.db.patch(streak._id, {
    lastActivityDate: today,
  });
}
```
**Voiceover:** "...and updates the streak."

#### 7. Return Statement (Line 202-210)
```typescript
return {
  success: true,
  activityId,
  levelUps: levelUpResults,
  totalXpGained,
  newlyUnlockedItems,
};
```
**Voiceover:** "All subscribers update instantly via Convex real-time."

---

## Option 2: Side-by-Side Split Screen (More Visual)

### Left Side: Code
Show `convex/mutations.ts` with the `logActivity` function

### Right Side: Live Updates
Show 4 panels updating in real-time:
1. **XP Panel** - `src/components/dog/StatOrb.tsx`
2. **Goals Panel** - `src/components/layout/TopResourceBar.tsx`
3. **Streak Panel** - Overview screen showing streak
4. **VR HUD** - `src/routes/app.vr.tsx`

As you scroll through each step in the code, highlight the corresponding panel on the right.

---

## Option 3: Animated Diagram (Simplest)

Create a simple flow diagram showing:

```
┌─────────────────────────────────────┐
│   logActivity() mutation            │
│   (convex/mutations.ts)             │
└──────────────┬──────────────────────┘
               │
               │ One mutation updates:
               │
    ┌──────────┼──────────┬──────────┐
    │          │          │          │
    ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│activities│dog_stats│daily_goals│streaks│
│  table  │  table  │   table   │ table  │
└────────┘ └────────┘ └────────┘ └────────┘
    │          │          │          │
    └──────────┴──────────┴──────────┘
               │
               │ Convex real-time subscriptions
               │ notify all listeners instantly
               │
    ┌──────────┼──────────┬──────────┐
    │          │          │          │
    ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│  XP    │ Goals  │ Streak │  VR    │
│  Orbs  │  Bar   │  Badge │  HUD   │
└────────┘ └────────┘ └────────┘ └────────┘
```

Animate each arrow lighting up in sequence.

---

## Recommended Approach for Your Demo

**Best option:** Combine Option 1 + Option 3

1. **Start with the diagram** (5 seconds)
   - Show the flow from mutation → tables → UI components
   - Voiceover: "So any new action automatically fans out to XP, goals, streaks, and VR..."

2. **Then show the code** (10 seconds)
   - Quick scroll through `logActivity` in `convex/mutations.ts`
   - Highlight the 6 steps with colored boxes or arrows
   - Voiceover: "...without wiring everything by hand. Kiro helped me structure this mutation to update all related tables in one transaction."

3. **End with live demo** (5 seconds)
   - Show web app + VR HUD side by side
   - Log one activity
   - Watch both screens update simultaneously
   - Voiceover: "All subscribers update instantly via Convex real-time."

**Total time:** 20 seconds for this section

---

## Files to Have Open for Screen Recording

1. `convex/mutations.ts` - The fan-out logic
2. `src/components/dog/StatOrb.tsx` - XP visualization
3. `src/components/layout/TopResourceBar.tsx` - Goals bar
4. `src/routes/app.vr.tsx` - VR HUD
5. `src/hooks/useVRData.ts` - Shows how VR subscribes to same data

---

## Key Talking Points

✅ "One mutation updates 5+ tables"
✅ "Kiro helped structure this fan-out pattern"
✅ "All UI components subscribe via Convex hooks"
✅ "No manual wiring - real-time by default"
✅ "Same data powers web, mobile, and VR"

---

## Quick Win: Just Show This One Code Block

If you're really short on time, just show this summary comment block at the top of `logActivity`:

```typescript
/**
 * Log Activity Mutation
 *
 * Creates an activity record and updates all related data:
 * - Inserts activity and stat gains
 * - Updates dog_stats with XP and handles level-ups
 * - Updates dog overall XP and level
 * - Updates daily goals with physical/mental points
 * - Updates streak lastActivityDate
 */
```

Then say: "This one mutation, structured with Kiro's help, updates everything. All subscribers see changes instantly."

**Time:** 5 seconds
