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
