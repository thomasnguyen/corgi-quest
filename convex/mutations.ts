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
    const newlyUnlockedItems = [];

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

        // Check for newly unlocked items
        // Items unlock at specific levels (2, 5, 8, 11, 14, 17, etc.)
        const allItems = await ctx.db.query("cosmetic_items").collect();

        for (const item of allItems) {
          // Check if this item was just unlocked (level went from below to at/above unlock level)
          if (
            dog.overallLevel < item.unlockLevel &&
            dogLevelResult.newLevel >= item.unlockLevel
          ) {
            newlyUnlockedItems.push({
              itemId: item._id,
              itemName: item.name,
              unlockLevel: item.unlockLevel,
            });

            // Mark this item as newly unlocked
            await ctx.db.insert("newly_unlocked_items", {
              dogId: args.dogId,
              itemId: item._id,
              unlockedAt: now,
            });
          }
        }
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
      newlyUnlockedItems,
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

/**
 * Mark Item as Seen Mutation
 *
 * Removes the "New!" badge from a newly unlocked item.
 * Called when user views the ITEMS tab or equips the item.
 */
export const markItemAsSeen = mutation({
  args: {
    dogId: v.id("dogs"),
    itemId: v.id("cosmetic_items"),
  },
  handler: async (ctx, args) => {
    // Find the newly_unlocked_items record
    const newlyUnlockedItem = await ctx.db
      .query("newly_unlocked_items")
      .withIndex("by_dog_and_item", (q) =>
        q.eq("dogId", args.dogId).eq("itemId", args.itemId)
      )
      .first();

    if (newlyUnlockedItem) {
      await ctx.db.delete(newlyUnlockedItem._id);
      return { success: true, removed: true };
    }

    return { success: true, removed: false };
  },
});

/**
 * Equip Item Mutation
 *
 * Equips a cosmetic item to a dog.
 * Only one item can be equipped at a time - equipping a new item automatically unequips the previous one.
 * For hackathon demo, images are manually created and passed as imageUrl parameter.
 */
export const equipItem = mutation({
  args: {
    dogId: v.id("dogs"),
    itemId: v.id("cosmetic_items"),
    imageUrl: v.string(), // Manually created image URL
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Step 1: Delete any existing equipped_items record for this dog (only one item at a time)
    const existingEquippedItem = await ctx.db
      .query("equipped_items")
      .withIndex("by_dog", (q) => q.eq("dogId", args.dogId))
      .first();

    if (existingEquippedItem) {
      await ctx.db.delete(existingEquippedItem._id);
    }

    // Step 2: Insert new equipped_items record with provided imageUrl
    const equippedItemId = await ctx.db.insert("equipped_items", {
      dogId: args.dogId,
      itemId: args.itemId,
      generatedImageUrl: args.imageUrl,
      equippedAt: now,
    });

    // Step 3: Mark item as seen (remove "New!" badge)
    const newlyUnlockedItem = await ctx.db
      .query("newly_unlocked_items")
      .withIndex("by_dog_and_item", (q) =>
        q.eq("dogId", args.dogId).eq("itemId", args.itemId)
      )
      .first();

    if (newlyUnlockedItem) {
      await ctx.db.delete(newlyUnlockedItem._id);
    }

    // Step 4: Get the item details to return
    const item = await ctx.db.get(args.itemId);

    return {
      success: true,
      equippedItemId,
      itemName: item?.name,
      imageUrl: args.imageUrl,
    };
  },
});

/**
 * Unequip Item Mutation
 *
 * Removes the currently equipped cosmetic item from a dog.
 * The dog's portrait will return to the base image (🐕 emoji or default image).
 * Updates in real-time on all connected devices.
 */
export const unequipItem = mutation({
  args: {
    dogId: v.id("dogs"),
  },
  handler: async (ctx, args) => {
    // Find and delete the equipped_items record for this dog
    const existingEquippedItem = await ctx.db
      .query("equipped_items")
      .withIndex("by_dog", (q) => q.eq("dogId", args.dogId))
      .first();

    if (existingEquippedItem) {
      await ctx.db.delete(existingEquippedItem._id);
      return {
        success: true,
        unequipped: true,
      };
    }

    return {
      success: true,
      unequipped: false, // No item was equipped
    };
  },
});
