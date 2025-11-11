import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Helper function to calculate level-up logic
 * Linear progression: always 100 XP per level
 * Handles overflow XP and multiple level-ups
 */
function calculateLevelUp(
  currentLevel: number,
  currentXp: number,
  xpGained: number
) {
  let newLevel = currentLevel;
  let newXp = currentXp + xpGained;
  const xpToNextLevel = 100;

  // Handle level-ups (including multiple level-ups)
  while (newXp >= xpToNextLevel) {
    newLevel += 1;
    newXp -= xpToNextLevel;
  }

  return {
    newLevel,
    newXp,
    xpToNextLevel: 100,
    leveledUp: newLevel > currentLevel,
  };
}

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
export const logActivity = mutation({
  args: {
    dogId: v.id("dogs"),
    userId: v.id("users"),
    activityName: v.string(),
    description: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    statGains: v.array(
      v.object({
        statType: v.union(
          v.literal("INT"),
          v.literal("PHY"),
          v.literal("IMP"),
          v.literal("SOC")
        ),
        xpAmount: v.number(),
      })
    ),
    physicalPoints: v.number(),
    mentalPoints: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    // Step 1: Insert activity record
    const activityId = await ctx.db.insert("activities", {
      dogId: args.dogId,
      userId: args.userId,
      activityName: args.activityName,
      description: args.description,
      durationMinutes: args.durationMinutes,
      physicalPoints: args.physicalPoints,
      mentalPoints: args.mentalPoints,
      createdAt: now,
    });

    // Step 2: Insert stat gain records
    for (const statGain of args.statGains) {
      await ctx.db.insert("activity_stat_gains", {
        activityId,
        statType: statGain.statType,
        xpAmount: statGain.xpAmount,
      });
    }

    // Step 3: Update dog_stats with new XP values and handle level-ups
    const levelUpResults = [];
    for (const statGain of args.statGains) {
      // Get current stat
      const stat = await ctx.db
        .query("dog_stats")
        .withIndex("by_dog_and_stat", (q) =>
          q.eq("dogId", args.dogId).eq("statType", statGain.statType)
        )
        .first();

      if (stat) {
        // Calculate level-up
        const result = calculateLevelUp(stat.level, stat.xp, statGain.xpAmount);

        // Update stat
        await ctx.db.patch(stat._id, {
          level: result.newLevel,
          xp: result.newXp,
          xpToNextLevel: result.xpToNextLevel,
        });

        if (result.leveledUp) {
          levelUpResults.push({
            statType: statGain.statType,
            oldLevel: stat.level,
            newLevel: result.newLevel,
          });
        }
      }
    }

    // Step 4: Update dog overall XP (sum of all stat gains)
    const totalXpGained = args.statGains.reduce(
      (sum, statGain) => sum + statGain.xpAmount,
      0
    );

    const dog = await ctx.db.get(args.dogId);
    if (dog) {
      const dogLevelResult = calculateLevelUp(
        dog.overallLevel,
        dog.overallXp,
        totalXpGained
      );

      await ctx.db.patch(args.dogId, {
        overallLevel: dogLevelResult.newLevel,
        overallXp: dogLevelResult.newXp,
        xpToNextLevel: dogLevelResult.xpToNextLevel,
      });

      if (dogLevelResult.leveledUp) {
        levelUpResults.push({
          statType: "OVERALL",
          oldLevel: dog.overallLevel,
          newLevel: dogLevelResult.newLevel,
        });
      }
    }

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
    } else {
      // Create today's daily goal if it doesn't exist
      await ctx.db.insert("daily_goals", {
        dogId: args.dogId,
        date: today,
        physicalPoints: args.physicalPoints,
        physicalGoal: 50,
        mentalPoints: args.mentalPoints,
        mentalGoal: 30,
      });
    }

    // Step 6: Update streak lastActivityDate to today
    const streak = await ctx.db
      .query("streaks")
      .withIndex("by_dog", (q) => q.eq("dogId", args.dogId))
      .first();

    if (streak) {
      await ctx.db.patch(streak._id, {
        lastActivityDate: today,
      });
    } else {
      // Create streak record if it doesn't exist
      await ctx.db.insert("streaks", {
        dogId: args.dogId,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: today,
      });
    }

    // Step 7: Invalidate AI recommendation cache (new activity affects recommendations)
    const cachedRec = await ctx.db
      .query("ai_recommendations")
      .withIndex("by_dog_and_date", (q) =>
        q.eq("dogId", args.dogId).eq("date", today)
      )
      .first();

    if (cachedRec) {
      await ctx.db.delete(cachedRec._id);
    }

    return {
      success: true,
      activityId,
      levelUps: levelUpResults,
      totalXpGained,
    };
  },
});

/**
 * Update Presence Mutation
 *
 * Updates or creates a presence record for a user
 * Used to show real-time awareness of partner activity
 */
export const updatePresence = mutation({
  args: {
    userId: v.id("users"),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if presence record exists for this user
    const existingPresence = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existingPresence) {
      // Update existing presence
      await ctx.db.patch(existingPresence._id, {
        location: args.location,
        lastSeen: now,
      });
    } else {
      // Create new presence record
      await ctx.db.insert("presence", {
        userId: args.userId,
        location: args.location,
        lastSeen: now,
      });
    }

    return { success: true };
  },
});

/**
 * Clear Presence Mutation
 *
 * Clears a user's presence (sets location to empty)
 * Called when user leaves a screen or unmounts
 */
export const clearPresence = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find presence record for this user
    const existingPresence = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existingPresence) {
      // Clear location
      await ctx.db.patch(existingPresence._id, {
        location: "",
        lastSeen: now,
      });
    }

    return { success: true };
  },
});

/**
 * Log Mood Mutation
 *
 * Creates a mood log record for tracking the dog's emotional state
 * Used to track mood patterns throughout the day
 */
export const logMood = mutation({
  args: {
    dogId: v.id("dogs"),
    userId: v.id("users"),
    mood: v.union(
      v.literal("calm"),
      v.literal("anxious"),
      v.literal("reactive"),
      v.literal("playful"),
      v.literal("tired"),
      v.literal("neutral")
    ),
    note: v.optional(v.string()),
    activityId: v.optional(v.id("activities")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    // Insert mood log record
    const moodLogId = await ctx.db.insert("mood_logs", {
      dogId: args.dogId,
      userId: args.userId,
      mood: args.mood,
      note: args.note,
      activityId: args.activityId,
      createdAt: now,
    });

    // Invalidate AI recommendation cache (new mood affects recommendations)
    const cachedRec = await ctx.db
      .query("ai_recommendations")
      .withIndex("by_dog_and_date", (q) =>
        q.eq("dogId", args.dogId).eq("date", today)
      )
      .first();

    if (cachedRec) {
      await ctx.db.delete(cachedRec._id);
    }

    return {
      success: true,
      moodLogId,
    };
  },
});

/**
 * Cache AI Recommendations Mutation
 *
 * Saves AI-generated recommendations to the cache for today.
 * Replaces any existing cache for today.
 */
export const cacheRecommendations = mutation({
  args: {
    dogId: v.id("dogs"),
    recommendations: v.string(), // JSON stringified array
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const now = Date.now();

    // Check if cache already exists for today
    const existing = await ctx.db
      .query("ai_recommendations")
      .withIndex("by_dog_and_date", (q) =>
        q.eq("dogId", args.dogId).eq("date", today)
      )
      .first();

    if (existing) {
      // Update existing cache
      await ctx.db.patch(existing._id, {
        recommendations: args.recommendations,
        createdAt: now,
      });
      return { success: true, updated: true };
    } else {
      // Insert new cache
      await ctx.db.insert("ai_recommendations", {
        dogId: args.dogId,
        date: today,
        recommendations: args.recommendations,
        createdAt: now,
      });
      return { success: true, updated: false };
    }
  },
});

/**
 * Invalidate Recommendation Cache Mutation
 *
 * Deletes cached AI recommendations for a dog for today.
 * Called when new activities or moods are logged to ensure fresh recommendations.
 */
export const invalidateRecommendationCache = mutation({
  args: {
    dogId: v.id("dogs"),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    // Find today's cached recommendations
    const cached = await ctx.db
      .query("ai_recommendations")
      .withIndex("by_dog_and_date", (q) =>
        q.eq("dogId", args.dogId).eq("date", today)
      )
      .first();

    if (cached) {
      await ctx.db.delete(cached._id);
      return { success: true, deleted: true };
    }

    return { success: true, deleted: false };
  },
});
