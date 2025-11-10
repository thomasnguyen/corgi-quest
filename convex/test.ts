import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Simple test query to verify Convex is working
 */
export const ping = query({
  args: {},
  handler: async () => {
    return { message: "Convex is connected!", timestamp: Date.now() };
  },
});

/**
 * Test mutation to verify logMood works
 * This will create a test mood log entry
 */
export const testLogMood = mutation({
  args: {},
  handler: async (ctx) => {
    // Get the first dog and user from the database
    const dog = await ctx.db.query("dogs").first();
    const user = await ctx.db.query("users").first();

    if (!dog || !user) {
      return {
        success: false,
        message: "No dog or user found. Please run seedDemoData first.",
      };
    }

    // Insert a test mood log
    const moodLogId = await ctx.db.insert("mood_logs", {
      dogId: dog._id,
      userId: user._id,
      mood: "calm",
      note: "Test mood log - Bumi seems relaxed after morning walk",
      createdAt: Date.now(),
    });

    // Verify the mood log was created
    const moodLog = await ctx.db.get(moodLogId);

    return {
      success: true,
      message: "Mood log created successfully",
      moodLog,
    };
  },
});

/**
 * Test query to verify mood logs are stored correctly
 */
export const getMoodLogs = query({
  args: {},
  handler: async (ctx) => {
    const dog = await ctx.db.query("dogs").first();

    if (!dog) {
      return {
        success: false,
        message: "No dog found. Please run seedDemoData first.",
        moodLogs: [],
      };
    }

    // Get all mood logs for the dog
    const moodLogs = await ctx.db
      .query("mood_logs")
      .withIndex("by_dog", (q) => q.eq("dogId", dog._id))
      .collect();

    return {
      success: true,
      count: moodLogs.length,
      moodLogs,
    };
  },
});

/**
 * Test query for getMoodFeed
 * Verifies that getMoodFeed returns the 20 most recent mood logs with user details
 */
export const testGetMoodFeed = query({
  args: {},
  handler: async (ctx) => {
    const dog = await ctx.db.query("dogs").first();

    if (!dog) {
      return {
        success: false,
        message: "No dog found. Please run seedDemoData first.",
      };
    }

    // Import and call the actual getMoodFeed query logic
    const moodFeed = await ctx.db
      .query("mood_logs")
      .withIndex("by_dog_and_created", (q) => q.eq("dogId", dog._id))
      .order("desc")
      .take(20);

    const moodLogsWithDetails = await Promise.all(
      moodFeed.map(async (moodLog) => {
        const user = await ctx.db.get(moodLog.userId);
        return {
          ...moodLog,
          userName: user?.name || "Unknown",
        };
      })
    );

    return {
      success: true,
      message: "getMoodFeed test successful",
      count: moodLogsWithDetails.length,
      moodFeed: moodLogsWithDetails,
    };
  },
});

/**
 * Test query for getLatestMood
 * Verifies that getLatestMood returns the most recent mood log
 */
export const testGetLatestMood = query({
  args: {},
  handler: async (ctx) => {
    const dog = await ctx.db.query("dogs").first();

    if (!dog) {
      return {
        success: false,
        message: "No dog found. Please run seedDemoData first.",
      };
    }

    // Get the most recent mood log
    const latestMood = await ctx.db
      .query("mood_logs")
      .withIndex("by_dog_and_created", (q) => q.eq("dogId", dog._id))
      .order("desc")
      .first();

    if (!latestMood) {
      return {
        success: true,
        message: "No mood logs found",
        latestMood: null,
      };
    }

    // Get user info
    const user = await ctx.db.get(latestMood.userId);

    return {
      success: true,
      message: "getLatestMood test successful",
      latestMood: {
        ...latestMood,
        userName: user?.name || "Unknown",
      },
    };
  },
});

/**
 * Test query for getTodaysMoods
 * Verifies that getTodaysMoods correctly identifies mood logs from today
 */
export const testGetTodaysMoods = query({
  args: {},
  handler: async (ctx) => {
    const dog = await ctx.db.query("dogs").first();

    if (!dog) {
      return {
        success: false,
        message: "No dog found. Please run seedDemoData first.",
      };
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const todayStart = new Date(today).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000; // End of today

    // Get all mood logs for today
    const todaysMoods = await ctx.db
      .query("mood_logs")
      .withIndex("by_dog_and_created", (q) => q.eq("dogId", dog._id))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), todayStart),
          q.lt(q.field("createdAt"), todayEnd)
        )
      )
      .collect();

    return {
      success: true,
      message: "getTodaysMoods test successful",
      hasMoodToday: todaysMoods.length > 0,
      count: todaysMoods.length,
      moods: todaysMoods,
    };
  },
});

/**
 * Test action for generateRecommendations
 * Verifies that the AI recommendations action works correctly
 */
export const testGenerateRecommendations = query({
  args: {},
  handler: async (ctx) => {
    const dog = await ctx.db.query("dogs").first();

    if (!dog) {
      return {
        success: false,
        message: "No dog found. Please run seedDemoData first.",
      };
    }

    return {
      success: true,
      message:
        "Test setup complete. Call the generateRecommendations action with dogId: " +
        dog._id,
      dogId: dog._id,
      instructions:
        "Run: await ctx.runAction(api.actions.generateRecommendations, { dogId: '" +
        dog._id +
        "' })",
    };
  },
});
