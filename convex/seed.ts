import { mutation } from "./_generated/server";

/**
 * Seed mutation to create demo household data
 *
 * Creates:
 * - Household with two users (Thomas and Holly)
 * - Dog "Bumi" at level 8
 * - Four dog stats with varying levels
 * - Today's daily goals with partial progress
 * - Streak record
 * - 3-4 sample activities from past few hours
 */
export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    // Step 1: Create household without dog first (dogId is now optional)
    const householdId = await ctx.db.insert("households", {
      createdAt: now,
    });

    // Step 2: Create dog with household reference
    const dogId = await ctx.db.insert("dogs", {
      name: "Bumi",
      householdId,
      overallLevel: 8,
      overallXp: 50,
      xpToNextLevel: 100,
      createdAt: now,
    });

    // Step 3: Update household with dog reference
    await ctx.db.patch(householdId, { dogId });

    // Step 4: Create two users
    const thomasId = await ctx.db.insert("users", {
      name: "Thomas",
      email: "thomas@example.com",
      householdId,
      createdAt: now,
    });

    const hollyId = await ctx.db.insert("users", {
      name: "Holly",
      email: "holly@example.com",
      householdId,
      createdAt: now,
    });

    // Step 5: Create four dog_stats records
    await ctx.db.insert("dog_stats", {
      dogId,
      statType: "INT",
      level: 7,
      xp: 30,
      xpToNextLevel: 100,
    });

    await ctx.db.insert("dog_stats", {
      dogId,
      statType: "PHY",
      level: 9,
      xp: 75,
      xpToNextLevel: 100,
    });

    await ctx.db.insert("dog_stats", {
      dogId,
      statType: "IMP",
      level: 5,
      xp: 20,
      xpToNextLevel: 100,
    });

    await ctx.db.insert("dog_stats", {
      dogId,
      statType: "SOC",
      level: 6,
      xp: 60,
      xpToNextLevel: 100,
    });

    // Step 6: Create today's daily_goals record
    await ctx.db.insert("daily_goals", {
      dogId,
      date: today,
      physicalPoints: 35,
      physicalGoal: 50,
      mentalPoints: 20,
      mentalGoal: 30,
    });

    // Step 7: Create streak record
    await ctx.db.insert("streaks", {
      dogId,
      currentStreak: 15,
      longestStreak: 22,
      lastActivityDate: today,
    });

    // Step 8: Create 3-4 sample activities from past few hours
    // Activity 1: Morning walk (3 hours ago)
    const activity1Id = await ctx.db.insert("activities", {
      dogId,
      userId: thomasId,
      activityName: "Morning Walk",
      description: "30 minute walk around the neighborhood",
      durationMinutes: 30,
      physicalPoints: 30,
      mentalPoints: 0,
      createdAt: now - 3 * 60 * 60 * 1000, // 3 hours ago
    });

    // PHY stat gain for morning walk (30 min walk = 45 XP to PHY)
    await ctx.db.insert("activity_stat_gains", {
      activityId: activity1Id,
      statType: "PHY",
      xpAmount: 45,
    });

    // Activity 2: Training session (2 hours ago)
    const activity2Id = await ctx.db.insert("activities", {
      dogId,
      userId: hollyId,
      activityName: "Training Session",
      description: "Practiced sit, stay, and come commands",
      physicalPoints: 0,
      mentalPoints: 15,
      createdAt: now - 2 * 60 * 60 * 1000, // 2 hours ago
    });

    // Training session: 40 XP split between IMP (60%) and INT (40%)
    await ctx.db.insert("activity_stat_gains", {
      activityId: activity2Id,
      statType: "IMP",
      xpAmount: 24,
    });

    await ctx.db.insert("activity_stat_gains", {
      activityId: activity2Id,
      statType: "INT",
      xpAmount: 16,
    });

    // Activity 3: Fetch session (1 hour ago)
    const activity3Id = await ctx.db.insert("activities", {
      dogId,
      userId: thomasId,
      activityName: "Fetch",
      description: "15 minutes of fetch in the backyard",
      durationMinutes: 15,
      physicalPoints: 18,
      mentalPoints: 5,
      createdAt: now - 1 * 60 * 60 * 1000, // 1 hour ago
    });

    // Fetch: 15 min = 30 XP split PHY (70%) and IMP (30%)
    await ctx.db.insert("activity_stat_gains", {
      activityId: activity3Id,
      statType: "PHY",
      xpAmount: 21,
    });

    await ctx.db.insert("activity_stat_gains", {
      activityId: activity3Id,
      statType: "IMP",
      xpAmount: 9,
    });

    // Activity 4: Puzzle toy (30 minutes ago)
    const activity4Id = await ctx.db.insert("activities", {
      dogId,
      userId: hollyId,
      activityName: "Puzzle Toy",
      description: "Worked on treat puzzle for mental stimulation",
      physicalPoints: 0,
      mentalPoints: 10,
      createdAt: now - 30 * 60 * 1000, // 30 minutes ago
    });

    // Puzzle toy: 30 XP to INT
    await ctx.db.insert("activity_stat_gains", {
      activityId: activity4Id,
      statType: "INT",
      xpAmount: 30,
    });

    return {
      success: true,
      message: "Demo data seeded successfully",
      data: {
        householdId,
        dogId,
        userIds: { thomasId, hollyId },
        activityCount: 4,
      },
    };
  },
});
