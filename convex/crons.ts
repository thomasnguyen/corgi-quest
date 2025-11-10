import { cronJobs } from "convex/server";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Scheduled Functions (Cron Jobs)
 *
 * This file defines scheduled functions that run automatically at specified intervals.
 * Currently includes:
 * - Daily goal reset at midnight
 */

const crons = cronJobs();

/**
 * Daily Goal Reset Cron Job
 *
 * Runs every day at midnight (00:00) to create new daily_goals records for all dogs.
 * This ensures each dog has a fresh daily goal record with:
 * - physicalPoints: 0
 * - physicalGoal: 50
 * - mentalPoints: 0
 * - mentalGoal: 30
 *
 * Schedule: "0 0 * * *" (minute hour day month dayOfWeek)
 * - 0 0 = midnight (00:00)
 * - * * * = every day, every month, every day of week
 */
crons.cron(
  "reset daily goals",
  "0 0 * * *", // Run at midnight every day
  internal.crons.resetDailyGoals
);

/**
 * Internal Mutation: Reset Daily Goals
 *
 * This mutation is called by the cron job to create new daily_goals records
 * for all dogs in the database. It runs at midnight every day.
 *
 * Also updates streaks based on whether yesterday's goals were met:
 * - If both physical and mental goals were met: increment currentStreak
 * - If either goal was not met: reset currentStreak to 0
 * - Update longestStreak if currentStreak exceeds it
 */
export const resetDailyGoals = internalMutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    // Calculate yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Query all dogs in the database
    const dogs = await ctx.db.query("dogs").collect();

    let streaksUpdated = 0;

    // For each dog, create a new daily_goals record for today and update streak
    for (const dog of dogs) {
      // Check if today's daily goal already exists
      const existingGoal = await ctx.db
        .query("daily_goals")
        .withIndex("by_dog_and_date", (q) =>
          q.eq("dogId", dog._id).eq("date", today)
        )
        .first();

      // Only create if it doesn't exist yet
      if (!existingGoal) {
        await ctx.db.insert("daily_goals", {
          dogId: dog._id,
          date: today,
          physicalPoints: 0,
          physicalGoal: 50,
          mentalPoints: 0,
          mentalGoal: 30,
        });
      }

      // Update streak based on yesterday's performance
      // Query yesterday's daily_goals for this dog
      const yesterdayGoal = await ctx.db
        .query("daily_goals")
        .withIndex("by_dog_and_date", (q) =>
          q.eq("dogId", dog._id).eq("date", yesterdayStr)
        )
        .first();

      // Get current streak record
      const streakRecord = await ctx.db
        .query("streaks")
        .withIndex("by_dog", (q) => q.eq("dogId", dog._id))
        .first();

      if (streakRecord) {
        // Check if both goals were met yesterday
        const bothGoalsMet =
          yesterdayGoal &&
          yesterdayGoal.physicalPoints >= yesterdayGoal.physicalGoal &&
          yesterdayGoal.mentalPoints >= yesterdayGoal.mentalGoal;

        if (bothGoalsMet) {
          // Increment streak
          const newStreak = streakRecord.currentStreak + 1;
          const newLongestStreak = Math.max(
            newStreak,
            streakRecord.longestStreak
          );

          await ctx.db.patch(streakRecord._id, {
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastActivityDate: yesterdayStr,
          });
          streaksUpdated++;
        } else if (yesterdayGoal) {
          // Goals were not met, reset streak to 0
          await ctx.db.patch(streakRecord._id, {
            currentStreak: 0,
            lastActivityDate: yesterdayStr,
          });
          streaksUpdated++;
        }
        // If no yesterdayGoal exists, don't update streak (dog might be new)
      }
    }

    return {
      success: true,
      dogsProcessed: dogs.length,
      streaksUpdated,
      date: today,
      yesterdayDate: yesterdayStr,
    };
  },
});

export default crons;
