import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Query to get the first dog (for demo purposes)
 * Returns the first dog in the database
 */
export const getFirstDog = query({
  args: {},
  handler: async (ctx) => {
    const dog = await ctx.db.query("dogs").first();
    return dog;
  },
});

/**
 * Query to get the first user in a household (for demo purposes)
 * Returns the first user in the specified household
 */
export const getFirstUser = query({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .first();
    return user;
  },
});

/**
 * Query to get all users in a household
 * Returns all users in the specified household
 */
export const getHouseholdUsers = query({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();
    return users;
  },
});

/**
 * Optimized query to get all household users (demo: assumes single household)
 * Returns all users - for demo purposes, assumes there's only one household
 * This is the fastest possible query for character selection
 */
export const getAllHouseholdUsers = query({
  args: {},
  handler: async (ctx) => {
    // For demo: just get all users (assumes single household)
    // This is immediate - no intermediate queries needed
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

/**
 * Query to get a user by ID
 * Returns the user with the specified ID
 */
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

/**
 * Query to get dog profile with all stats
 * Returns dog info and all 4 stat records
 */
export const getDogProfile = query({
  args: {
    dogId: v.id("dogs"),
  },
  handler: async (ctx, args) => {
    // Get dog record
    const dog = await ctx.db.get(args.dogId);
    if (!dog) {
      return null;
    }

    // Get all 4 stats for this dog
    const stats = await ctx.db
      .query("dog_stats")
      .withIndex("by_dog", (q) => q.eq("dogId", args.dogId))
      .collect();

    return {
      dog,
      stats,
    };
  },
});

/**
 * Query to get dog profile with stats and mood history (cached/optimized)
 * Returns dog info, all 4 stat records, and mood history for the last 7 days
 * This is more efficient than making separate queries
 */
export const getDogProfileWithMood = query({
  args: {
    dogId: v.id("dogs"),
    days: v.optional(v.number()), // Number of days for mood history (default: 7)
  },
  handler: async (ctx, args) => {
    // Get dog record
    const dog = await ctx.db.get(args.dogId);
    if (!dog) {
      return null;
    }

    // Get all 4 stats for this dog
    const stats = await ctx.db
      .query("dog_stats")
      .withIndex("by_dog", (q) => q.eq("dogId", args.dogId))
      .collect();

    // Get mood history for the specified time period
    const days = args.days || 7;
    const now = Date.now();
    const startTime = now - days * 24 * 60 * 60 * 1000;

    const moodLogs = await ctx.db
      .query("mood_logs")
      .withIndex("by_dog_and_created", (q) => q.eq("dogId", args.dogId))
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .order("asc")
      .collect();

    // For each mood log, get user info
    const moodLogsWithDetails = await Promise.all(
      moodLogs.map(async (moodLog) => {
        const user = await ctx.db.get(moodLog.userId);
        return {
          ...moodLog,
          userName: user?.name || "Unknown",
        };
      })
    );

    return {
      dog,
      stats,
      moodHistory: moodLogsWithDetails,
    };
  },
});

/**
 * Query to get daily goals for today
 * Returns today's physical and mental goal progress
 */
export const getDailyGoals = query({
  args: {
    dogId: v.id("dogs"),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    // Find today's daily goal record
    const dailyGoal = await ctx.db
      .query("daily_goals")
      .withIndex("by_dog_and_date", (q) =>
        q.eq("dogId", args.dogId).eq("date", today)
      )
      .first();

    return dailyGoal;
  },
});

/**
 * Query to get current streak
 * Returns streak info including current and longest streak
 */
export const getStreak = query({
  args: {
    dogId: v.id("dogs"),
  },
  handler: async (ctx, args) => {
    const streak = await ctx.db
      .query("streaks")
      .withIndex("by_dog", (q) => q.eq("dogId", args.dogId))
      .first();

    return streak;
  },
});

/**
 * Query to get activity feed (20 most recent)
 * Returns activities with user info and stat gains
 */
export const getActivityFeed = query({
  args: {
    dogId: v.id("dogs"),
  },
  handler: async (ctx, args) => {
    // Get 20 most recent activities for this dog
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_dog_and_created", (q) => q.eq("dogId", args.dogId))
      .order("desc")
      .take(20);

    if (activities.length === 0) {
      return [];
    }

    // OPTIMIZATION: Batch fetch all users and stat gains in parallel
    // Collect unique user IDs
    const userIds = [...new Set(activities.map((a) => a.userId))];
    const activityIds = activities.map((a) => a._id);

    // Batch fetch all users (1 query instead of 20)
    const users = await Promise.all(
      userIds.map((userId) => ctx.db.get(userId))
    );
    const userMap = new Map(users.filter(Boolean).map((u) => [u!._id, u!]));

    // Batch fetch all stat gains (1 query per activity, but can be optimized further)
    // Note: Convex doesn't support IN queries, so we batch with Promise.all
    const allStatGains = await Promise.all(
      activityIds.map((activityId) =>
        ctx.db
          .query("activity_stat_gains")
          .withIndex("by_activity", (q) => q.eq("activityId", activityId))
          .collect()
      )
    );

    // Create stat gains map
    const statGainsMap = new Map(
      activityIds.map((id, idx) => [id, allStatGains[idx]])
    );

    // Combine results (no additional queries)
    const activitiesWithDetails = activities.map((activity) => {
      const user = userMap.get(activity.userId);
      const statGains = statGainsMap.get(activity._id) || [];

      return {
        ...activity,
        userName: user?.name || "Unknown",
        statGains,
      };
    });

    return activitiesWithDetails;
  },
});

/**
 * Query to get today's activities for breakdown section
 * Returns activities from today with user info
 */
export const getTodaysActivities = query({
  args: {
    dogId: v.id("dogs"),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const todayStart = new Date(today).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000; // End of today

    // Get all activities for today
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_dog_and_created", (q) => q.eq("dogId", args.dogId))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), todayStart),
          q.lt(q.field("createdAt"), todayEnd)
        )
      )
      .collect();

    // For each activity, get user info
    const activitiesWithUser = await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db.get(activity.userId);
        return {
          ...activity,
          userName: user?.name || "Unknown",
        };
      })
    );

    return activitiesWithUser;
  },
});

/**
 * Query to get stat detail with recent activities
 * Returns specific stat info and activities that awarded XP to it
 */
export const getStatDetail = query({
  args: {
    dogId: v.id("dogs"),
    statType: v.union(
      v.literal("INT"),
      v.literal("PHY"),
      v.literal("IMP"),
      v.literal("SOC")
    ),
  },
  handler: async (ctx, args) => {
    // Get the specific stat
    const stat = await ctx.db
      .query("dog_stats")
      .withIndex("by_dog_and_stat", (q) =>
        q.eq("dogId", args.dogId).eq("statType", args.statType)
      )
      .first();

    if (!stat) {
      return null;
    }

    // Get all stat gains for this stat type
    const statGains = await ctx.db
      .query("activity_stat_gains")
      .filter((q) => q.eq(q.field("statType"), args.statType))
      .collect();

    // Get activities that awarded XP to this stat (most recent 20)
    const activityIds = statGains.map((sg) => sg.activityId);
    const activities = await Promise.all(
      activityIds.map(async (activityId) => {
        const activity = await ctx.db.get(activityId);
        if (!activity || activity.dogId !== args.dogId) {
          return null;
        }

        // Get the XP amount for this specific stat
        const statGain = statGains.find((sg) => sg.activityId === activityId);

        return {
          ...activity,
          xpAmount: statGain?.xpAmount || 0,
        };
      })
    );

    // Filter out nulls and sort by creation date (most recent first)
    const validActivities = activities
      .filter((a) => a !== null)
      .sort((a, b) => b!.createdAt - a!.createdAt)
      .slice(0, 20);

    return {
      stat,
      recentActivities: validActivities,
    };
  },
});

/**
 * Query to get partner's presence status
 * Returns presence info for the partner (other user in household)
 */
export const getPartnerPresence = query({
  args: {
    householdId: v.id("households"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all users in the household
    const users = await ctx.db
      .query("users")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Find the partner (user who is not the current user)
    const partner = users.find((user) => user._id !== args.currentUserId);

    if (!partner) {
      return null;
    }

    // Get partner's presence
    const presence = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", partner._id))
      .first();

    if (!presence) {
      return {
        partnerName: partner.name,
        location: "",
        lastSeen: 0,
      };
    }

    // Consider presence stale if last seen more than 30 seconds ago
    const now = Date.now();
    const isStale = now - presence.lastSeen > 30000;

    return {
      partnerName: partner.name,
      location: isStale ? "" : presence.location,
      lastSeen: presence.lastSeen,
    };
  },
});

/**
 * Query to get mood feed (20 most recent mood logs)
 * Returns mood logs with user info
 */
export const getMoodFeed = query({
  args: {
    dogId: v.id("dogs"),
  },
  handler: async (ctx, args) => {
    // Get 20 most recent mood logs for this dog
    const moodLogs = await ctx.db
      .query("mood_logs")
      .withIndex("by_dog_and_created", (q) => q.eq("dogId", args.dogId))
      .order("desc")
      .take(20);

    // For each mood log, get user info
    const moodLogsWithDetails = await Promise.all(
      moodLogs.map(async (moodLog) => {
        const user = await ctx.db.get(moodLog.userId);
        return {
          ...moodLog,
          userName: user?.name || "Unknown",
        };
      })
    );

    return moodLogsWithDetails;
  },
});

/**
 * Query to get the latest mood for a dog
 * Returns the most recent mood log
 */
export const getLatestMood = query({
  args: {
    dogId: v.id("dogs"),
  },
  handler: async (ctx, args) => {
    // Get the most recent mood log for this dog
    const latestMood = await ctx.db
      .query("mood_logs")
      .withIndex("by_dog_and_created", (q) => q.eq("dogId", args.dogId))
      .order("desc")
      .first();

    if (!latestMood) {
      return null;
    }

    // Get user info
    const user = await ctx.db.get(latestMood.userId);

    return {
      ...latestMood,
      userName: user?.name || "Unknown",
    };
  },
});

/**
 * Query to check if mood has been logged today
 * Returns boolean indicating if any mood log exists for today
 */
export const getTodaysMoods = query({
  args: {
    dogId: v.id("dogs"),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const todayStart = new Date(today).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000; // End of today

    // Get all mood logs for today
    const todaysMoods = await ctx.db
      .query("mood_logs")
      .withIndex("by_dog_and_created", (q) => q.eq("dogId", args.dogId))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), todayStart),
          q.lt(q.field("createdAt"), todayEnd)
        )
      )
      .collect();

    return {
      hasMoodToday: todaysMoods.length > 0,
      count: todaysMoods.length,
      moods: todaysMoods,
    };
  },
});

/**
 * Query to get mood logs over a time period (default: last 7 days)
 * Returns mood logs sorted by creation time
 */
export const getMoodHistory = query({
  args: {
    dogId: v.id("dogs"),
    days: v.optional(v.number()), // Number of days to look back (default: 7)
  },
  handler: async (ctx, args) => {
    const days = args.days || 7;
    const now = Date.now();
    const startTime = now - days * 24 * 60 * 60 * 1000;

    // Get all mood logs within the time period
    const moodLogs = await ctx.db
      .query("mood_logs")
      .withIndex("by_dog_and_created", (q) => q.eq("dogId", args.dogId))
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .order("asc")
      .collect();

    // For each mood log, get user info
    const moodLogsWithDetails = await Promise.all(
      moodLogs.map(async (moodLog) => {
        const user = await ctx.db.get(moodLog.userId);
        return {
          ...moodLog,
          userName: user?.name || "Unknown",
        };
      })
    );

    return moodLogsWithDetails;
  },
});

/**
 * Query to get cached AI recommendations for today
 * Returns cached recommendations if they exist for today, otherwise null
 */
export const getCachedRecommendations = query({
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

    if (!cached) {
      return null;
    }

    // Parse the JSON string back to array
    try {
      const recommendations = JSON.parse(cached.recommendations);
      return {
        recommendations,
        createdAt: cached.createdAt,
      };
    } catch (error) {
      console.error("Failed to parse cached recommendations:", error);
      return null;
    }
  },
});

/**
 * Query to get cached Firecrawl tips for today
 * Returns cached tips if they exist for today, otherwise null
 */
export const getCachedFirecrawlTips = query({
  args: {
    dogId: v.id("dogs"),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    // Find today's cached tips
    const cached = await ctx.db
      .query("firecrawl_tips")
      .withIndex("by_dog_and_date", (q) =>
        q.eq("dogId", args.dogId).eq("date", today)
      )
      .first();

    if (!cached) {
      return null;
    }

    // Parse the JSON string back to array
    try {
      const tips = JSON.parse(cached.tips);
      return {
        tips,
        createdAt: cached.createdAt,
      };
    } catch (error) {
      console.error("Failed to parse cached Firecrawl tips:", error);
      return null;
    }
  },
});

/**
 * Query to get all cosmetic items with unlock status
 * Returns all items with a flag indicating if they're unlocked based on dog's level
 * and if they're newly unlocked (show "New!" badge)
 */
export const getAllCosmeticItems = query({
  args: {
    dogId: v.id("dogs"),
  },
  handler: async (ctx, args) => {
    // Get dog to check current level
    const dog = await ctx.db.get(args.dogId);
    if (!dog) {
      return [];
    }

    // Get all cosmetic items
    const items = await ctx.db.query("cosmetic_items").collect();

    // Get newly unlocked items for this dog
    const newlyUnlockedItems = await ctx.db
      .query("newly_unlocked_items")
      .withIndex("by_dog", (q) => q.eq("dogId", args.dogId))
      .collect();

    const newlyUnlockedItemIds = new Set(
      newlyUnlockedItems.map((item) => item.itemId)
    );

    // Add unlock status and "new" status to each item
    const itemsWithStatus = items.map((item) => ({
      ...item,
      isUnlocked: dog.overallLevel >= item.unlockLevel,
      isNew: newlyUnlockedItemIds.has(item._id),
    }));

    // Sort by unlock level
    return itemsWithStatus.sort((a, b) => a.unlockLevel - b.unlockLevel);
  },
});

/**
 * Query to get currently equipped item for a dog
 * Returns the equipped item with full item details, or null if nothing equipped
 */
export const getEquippedItem = query({
  args: {
    dogId: v.id("dogs"),
  },
  handler: async (ctx, args) => {
    // Get equipped item record
    const equippedItem = await ctx.db
      .query("equipped_items")
      .withIndex("by_dog", (q) => q.eq("dogId", args.dogId))
      .first();

    if (!equippedItem) {
      return null;
    }

    // Get the full item details
    const item = await ctx.db.get(equippedItem.itemId);
    if (!item) {
      return null;
    }

    return {
      ...equippedItem,
      item,
    };
  },
});

/**
 * Query to get unlocked items for a dog
 * Returns only items that the dog has unlocked based on level
 */
export const getUnlockedItems = query({
  args: {
    dogId: v.id("dogs"),
  },
  handler: async (ctx, args) => {
    // Get dog to check current level
    const dog = await ctx.db.get(args.dogId);
    if (!dog) {
      return [];
    }

    // Get all cosmetic items
    const items = await ctx.db.query("cosmetic_items").collect();

    // Filter to only unlocked items
    const unlockedItems = items.filter(
      (item) => dog.overallLevel >= item.unlockLevel
    );

    // Sort by unlock level
    return unlockedItems.sort((a, b) => a.unlockLevel - b.unlockLevel);
  },
});

/**
 * Helper function to generate array of dates for the week
 */
function getWeekDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Query to get weekly summary data
 * Returns aggregated data for the past 7 days including activities, XP, levels, goals, streaks, and tips
 */
export const getWeeklySummary = query({
  args: {
    dogId: v.id("dogs"),
    weekStartDate: v.string(), // YYYY-MM-DD
    weekEndDate: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    // Convert dates to timestamps
    const startTime = new Date(args.weekStartDate).getTime();
    const endTime = new Date(args.weekEndDate).getTime() + 24 * 60 * 60 * 1000; // End of Sunday

    // 1. Get all activities for the week
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_dog_and_created", (q) => q.eq("dogId", args.dogId))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), startTime),
          q.lt(q.field("createdAt"), endTime)
        )
      )
      .collect();

    // 2. Calculate total XP gained
    const activityIds = activities.map((a) => a._id);
    const allStatGains = await Promise.all(
      activityIds.map((activityId) =>
        ctx.db
          .query("activity_stat_gains")
          .withIndex("by_activity", (q) => q.eq("activityId", activityId))
          .collect()
      )
    );

    const totalXpGained = allStatGains
      .flat()
      .reduce((sum, sg) => sum + sg.xpAmount, 0);

    // 3. Calculate XP gained per stat this week
    const statXpMap = new Map<string, number>();
    allStatGains.flat().forEach((sg) => {
      const current = statXpMap.get(sg.statType) || 0;
      statXpMap.set(sg.statType, current + sg.xpAmount);
    });

    // Estimate levels gained (100 XP per level)
    const levelsGained = {
      overall: Math.floor(totalXpGained / 100),
      stats: {
        INT: Math.floor((statXpMap.get("INT") || 0) / 100),
        PHY: Math.floor((statXpMap.get("PHY") || 0) / 100),
        IMP: Math.floor((statXpMap.get("IMP") || 0) / 100),
        SOC: Math.floor((statXpMap.get("SOC") || 0) / 100),
      },
    };

    // 4. Get daily goals for the week
    const weekDates = getWeekDates(args.weekStartDate, args.weekEndDate);
    const dailyGoals = await Promise.all(
      weekDates.map((date) =>
        ctx.db
          .query("daily_goals")
          .withIndex("by_dog_and_date", (q) =>
            q.eq("dogId", args.dogId).eq("date", date)
          )
          .first()
      )
    );

    const daysGoalsMet = dailyGoals.filter(
      (dg) =>
        dg &&
        dg.physicalPoints >= dg.physicalGoal &&
        dg.mentalPoints >= dg.mentalGoal
    ).length;

    // 5. Get streak info
    const streak = await ctx.db
      .query("streaks")
      .withIndex("by_dog", (q) => q.eq("dogId", args.dogId))
      .first();

    // 6. Calculate activity breakdown
    const activityCounts = new Map<string, number>();
    let totalActivityTime = 0;

    activities.forEach((activity) => {
      const count = activityCounts.get(activity.activityName) || 0;
      activityCounts.set(activity.activityName, count + 1);
      totalActivityTime += activity.durationMinutes || 0;
    });

    const topActivity =
      activityCounts.size > 0
        ? Array.from(activityCounts.entries()).sort((a, b) => b[1] - a[1])[0]
        : null;

    // 7. Calculate stat progress
    const currentStats = await ctx.db
      .query("dog_stats")
      .withIndex("by_dog", (q) => q.eq("dogId", args.dogId))
      .collect();

    const highestStat =
      currentStats.length > 0
        ? currentStats.reduce((max, stat) =>
            stat.level > max.level ? stat : max
          )
        : null;

    const mostImprovedStat =
      statXpMap.size > 0
        ? Array.from(statXpMap.entries()).sort((a, b) => b[1] - a[1])[0]
        : null;

    // 8. Get mood insights (if applicable)
    const moodLogs = await ctx.db
      .query("mood_logs")
      .withIndex("by_dog_and_created", (q) => q.eq("dogId", args.dogId))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), startTime),
          q.lt(q.field("createdAt"), endTime)
        )
      )
      .collect();

    let moodInsights = undefined;
    if (moodLogs.length >= 3) {
      const moodCounts = new Map<string, number>();
      moodLogs.forEach((ml) => {
        const count = moodCounts.get(ml.mood) || 0;
        moodCounts.set(ml.mood, count + 1);
      });

      const mostCommon = Array.from(moodCounts.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0][0] as
        | "calm"
        | "anxious"
        | "reactive"
        | "playful"
        | "tired"
        | "neutral";

      // Simple trend calculation (compare first half to second half)
      const midpoint = Math.floor(moodLogs.length / 2);
      const firstHalf = moodLogs.slice(0, midpoint);
      const secondHalf = moodLogs.slice(midpoint);

      const positiveMoods = ["calm", "playful"];
      const firstHalfPositive = firstHalf.filter((ml) =>
        positiveMoods.includes(ml.mood)
      ).length;
      const secondHalfPositive = secondHalf.filter((ml) =>
        positiveMoods.includes(ml.mood)
      ).length;

      let trend: "improving" | "stable" | "needs_attention";
      if (secondHalfPositive > firstHalfPositive) {
        trend = "improving";
      } else if (secondHalfPositive < firstHalfPositive) {
        trend = "needs_attention";
      } else {
        trend = "stable";
      }

      moodInsights = {
        mostCommon,
        trend,
        totalMoods: moodLogs.length,
      };
    }

    // 9. Get partner contribution (if applicable)
    const dog = await ctx.db.get(args.dogId);
    let partnerContribution = undefined;

    if (dog) {
      const household = await ctx.db.get(dog.householdId);
      if (household) {
        const users = await ctx.db
          .query("users")
          .withIndex("by_household", (q) => q.eq("householdId", household._id))
          .collect();

        if (users.length >= 2) {
          const userActivityCounts = new Map<string, number>();
          activities.forEach((activity) => {
            const count = userActivityCounts.get(activity.userId) || 0;
            userActivityCounts.set(activity.userId, count + 1);
          });

          // Sort users by activity count to determine current user and partner
          const userCounts = users.map((user) => ({
            user,
            count: userActivityCounts.get(user._id) || 0,
          }));
          userCounts.sort((a, b) => b.count - a.count);

          const currentUser = userCounts[0].user;
          const partner = userCounts[1].user;

          partnerContribution = {
            currentUserActivities: userCounts[0].count,
            partnerActivities: userCounts[1].count,
            partnerName: partner.name,
          };
        }
      }
    }

    // 10. Get Firecrawl tips
    const firecrawlCache = await ctx.db
      .query("firecrawl_tips")
      .withIndex("by_dog", (q) => q.eq("dogId", args.dogId))
      .order("desc")
      .first();

    let firecrawlTips: Array<{ title: string; description: string }> = [];
    if (firecrawlCache) {
      try {
        const tips = JSON.parse(firecrawlCache.tips);
        firecrawlTips = tips.slice(0, 2); // Take first 2 tips
      } catch (error) {
        console.error("Failed to parse Firecrawl tips:", error);
      }
    }

    // Return complete summary
    return {
      weekStartDate: args.weekStartDate,
      weekEndDate: args.weekEndDate,
      totalActivities: activities.length,
      totalXpGained,
      levelsGained,
      daysGoalsMet,
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      topActivity: topActivity
        ? { name: topActivity[0], count: topActivity[1] }
        : null,
      activityVariety: activityCounts.size,
      totalActivityTime,
      highestStat: highestStat
        ? { type: highestStat.statType, level: highestStat.level }
        : null,
      mostImprovedStat: mostImprovedStat
        ? {
            type: mostImprovedStat[0] as "INT" | "PHY" | "IMP" | "SOC",
            xpGained: mostImprovedStat[1],
          }
        : null,
      moodInsights,
      partnerContribution,
      firecrawlTips,
    };
  },
});
