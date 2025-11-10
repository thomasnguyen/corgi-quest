/**
 * Test file for mood queries
 * This file can be used to manually test the mood queries in the Convex dashboard
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Test query to verify getMoodFeed works correctly
 * Usage: Call this query with a dogId to test getMoodFeed
 */
export const testGetMoodFeed = query({
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

    return {
      success: true,
      count: moodLogsWithDetails.length,
      moodLogs: moodLogsWithDetails,
    };
  },
});

/**
 * Test query to verify getLatestMood works correctly
 * Usage: Call this query with a dogId to test getLatestMood
 */
export const testGetLatestMood = query({
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
      return {
        success: true,
        hasMood: false,
        mood: null,
      };
    }

    // Get user info
    const user = await ctx.db.get(latestMood.userId);

    return {
      success: true,
      hasMood: true,
      mood: {
        ...latestMood,
        userName: user?.name || "Unknown",
      },
    };
  },
});

/**
 * Test query to verify getTodaysMoods works correctly
 * Usage: Call this query with a dogId to test getTodaysMoods
 */
export const testGetTodaysMoods = query({
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
      success: true,
      hasMoodToday: todaysMoods.length > 0,
      count: todaysMoods.length,
      moods: todaysMoods,
      todayDate: today,
      todayStart,
      todayEnd,
    };
  },
});
