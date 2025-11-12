import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Enhanced seed mutation to create realistic demo household data
 *
 * Creates:
 * - Household with three users (Thomas, Holly, and Guest)
 * - Dog "Bumi" with progressive stat growth over 7 days
 * - 7 days of activities with varied times and types
 * - Daily goals for each of the 7 days
 * - Streak record showing 7 consecutive days
 * - 6 cosmetic items (1 per 3 levels, starting at level 2)
 */

// Activity definitions matching xpCalculations.ts
const DURATION_ACTIVITIES = {
  Walk: {
    baseXpPer10Min: 15,
    statDistribution: { PHY: 100 },
    physicalPoints: 10,
    mentalPoints: 0,
  },
  "Run/Jog": {
    baseXpPer10Min: 25,
    statDistribution: { PHY: 100 },
    physicalPoints: 15,
    mentalPoints: 0,
  },
  Fetch: {
    baseXpPer10Min: 20,
    statDistribution: { PHY: 70, IMP: 30 },
    physicalPoints: 12,
    mentalPoints: 3,
  },
  "Tug-of-War": {
    baseXpPer10Min: 18,
    statDistribution: { PHY: 60, IMP: 40 },
    physicalPoints: 10,
    mentalPoints: 5,
  },
  Swimming: {
    baseXpPer10Min: 30,
    statDistribution: { PHY: 100 },
    physicalPoints: 20,
    mentalPoints: 0,
  },
} as const;

const FIXED_ACTIVITIES = {
  "Training Session": {
    xpAmount: 40,
    statDistribution: { IMP: 60, INT: 40 },
    physicalPoints: 0,
    mentalPoints: 15,
  },
  "Puzzle Toy": {
    xpAmount: 30,
    statDistribution: { INT: 100 },
    physicalPoints: 0,
    mentalPoints: 10,
  },
  Playdate: {
    xpAmount: 35,
    statDistribution: { SOC: 70, PHY: 30 },
    physicalPoints: 8,
    mentalPoints: 7,
  },
  Grooming: {
    xpAmount: 20,
    statDistribution: { IMP: 50, SOC: 50 },
    physicalPoints: 0,
    mentalPoints: 8,
  },
  "Trick Practice": {
    xpAmount: 25,
    statDistribution: { INT: 60, IMP: 40 },
    physicalPoints: 0,
    mentalPoints: 10,
  },
  "Sniff Walk": {
    xpAmount: 20,
    statDistribution: { INT: 60, PHY: 40 },
    physicalPoints: 5,
    mentalPoints: 8,
  },
  "Dog Park Visit": {
    xpAmount: 40,
    statDistribution: { SOC: 50, PHY: 50 },
    physicalPoints: 12,
    mentalPoints: 8,
  },
} as const;

type StatType = "INT" | "PHY" | "IMP" | "SOC";

interface ActivityData {
  name: string;
  description: string;
  durationMinutes?: number;
  userId: Id<"users">;
  timestamp: number;
}

interface StatGain {
  statType: StatType;
  xpAmount: number;
}

function calculateActivityXp(
  activityName: string,
  durationMinutes?: number
): {
  totalXp: number;
  statGains: StatGain[];
  physicalPoints: number;
  mentalPoints: number;
} {
  // Check duration-based activities
  if (activityName in DURATION_ACTIVITIES && durationMinutes !== undefined) {
    const activity =
      DURATION_ACTIVITIES[activityName as keyof typeof DURATION_ACTIVITIES];
    const totalXp = Math.round(
      (durationMinutes / 10) * activity.baseXpPer10Min
    );
    const multiplier = durationMinutes / 10;

    const statGains: StatGain[] = [];
    for (const [statType, percentage] of Object.entries(
      activity.statDistribution
    )) {
      const xpAmount = Math.round((totalXp * percentage) / 100);
      if (xpAmount > 0) {
        statGains.push({
          statType: statType as StatType,
          xpAmount,
        });
      }
    }

    return {
      totalXp,
      statGains,
      physicalPoints: Math.round(activity.physicalPoints * multiplier),
      mentalPoints: Math.round(activity.mentalPoints * multiplier),
    };
  }

  // Check fixed activities
  if (activityName in FIXED_ACTIVITIES) {
    const activity =
      FIXED_ACTIVITIES[activityName as keyof typeof FIXED_ACTIVITIES];
    const statGains: StatGain[] = [];

    for (const [statType, percentage] of Object.entries(
      activity.statDistribution
    )) {
      const xpAmount = Math.round((activity.xpAmount * percentage) / 100);
      if (xpAmount > 0) {
        statGains.push({
          statType: statType as StatType,
          xpAmount,
        });
      }
    }

    return {
      totalXp: activity.xpAmount,
      statGains,
      physicalPoints: activity.physicalPoints,
      mentalPoints: activity.mentalPoints,
    };
  }

  // Unknown activity
  return {
    totalXp: 0,
    statGains: [],
    physicalPoints: 0,
    mentalPoints: 0,
  };
}

function calculateLevelUp(
  currentLevel: number,
  currentXp: number,
  xpGained: number
) {
  let newLevel = currentLevel;
  let newXp = currentXp + xpGained;
  const xpToNextLevel = 100;

  while (newXp >= xpToNextLevel) {
    newLevel += 1;
    newXp -= xpToNextLevel;
  }

  return {
    newLevel,
    newXp,
    xpToNextLevel: 100,
  };
}

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    // Step 0: Clear existing data (optional - comment out if you want to keep old data)
    // Delete all existing data to start fresh
    const existingDogs = await ctx.db.query("dogs").collect();
    for (const dog of existingDogs) {
      // Delete related data
      const activities = await ctx.db
        .query("activities")
        .withIndex("by_dog", (q) => q.eq("dogId", dog._id))
        .collect();
      for (const activity of activities) {
        // Delete stat gains
        const statGains = await ctx.db
          .query("activity_stat_gains")
          .withIndex("by_activity", (q) => q.eq("activityId", activity._id))
          .collect();
        for (const gain of statGains) {
          await ctx.db.delete(gain._id);
        }
        await ctx.db.delete(activity._id);
      }

      // Delete stats
      const stats = await ctx.db
        .query("dog_stats")
        .withIndex("by_dog", (q) => q.eq("dogId", dog._id))
        .collect();
      for (const stat of stats) {
        await ctx.db.delete(stat._id);
      }

      // Delete daily goals
      const goals = await ctx.db
        .query("daily_goals")
        .withIndex("by_dog", (q) => q.eq("dogId", dog._id))
        .collect();
      for (const goal of goals) {
        await ctx.db.delete(goal._id);
      }

      // Delete streaks
      const streaks = await ctx.db
        .query("streaks")
        .withIndex("by_dog", (q) => q.eq("dogId", dog._id))
        .collect();
      for (const streak of streaks) {
        await ctx.db.delete(streak._id);
      }

      // Delete equipped items
      const equipped = await ctx.db
        .query("equipped_items")
        .withIndex("by_dog", (q) => q.eq("dogId", dog._id))
        .collect();
      for (const item of equipped) {
        await ctx.db.delete(item._id);
      }

      await ctx.db.delete(dog._id);
    }

    // Delete all users and households
    const households = await ctx.db.query("households").collect();
    for (const household of households) {
      const users = await ctx.db
        .query("users")
        .withIndex("by_household", (q) => q.eq("householdId", household._id))
        .collect();
      for (const user of users) {
        await ctx.db.delete(user._id);
      }
      await ctx.db.delete(household._id);
    }

    // Step 1: Create household
    const householdId = await ctx.db.insert("households", {
      createdAt: now,
    });

    // Step 2: Create three users
    const thomasId = await ctx.db.insert("users", {
      name: "Thomas",
      email: "thomas@example.com",
      householdId,
      title: "Primary Trainer",
      avatarUrl: "👨",
      createdAt: now,
    });

    const hollyId = await ctx.db.insert("users", {
      name: "Holly",
      email: "holly@example.com",
      householdId,
      title: "Play Partner",
      avatarUrl: "👩",
      createdAt: now,
    });

    const guestId = await ctx.db.insert("users", {
      name: "Guest",
      email: "guest@example.com",
      householdId,
      title: "Training Buddy",
      avatarUrl: "🧑",
      createdAt: now,
    });

    // Step 3: Initialize stats at lower levels (will grow over 7 days)
    const initialStats = {
      INT: { level: 3, xp: 20 },
      PHY: { level: 4, xp: 30 },
      IMP: { level: 2, xp: 10 },
      SOC: { level: 3, xp: 15 },
    };

    // Step 4: Create dog (level will be calculated from stats later)
    const dogId = await ctx.db.insert("dogs", {
      name: "Bumi",
      householdId,
      overallLevel: 3, // Will be updated after activities
      overallXp: 0,
      xpToNextLevel: 100,
      createdAt: now - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    });

    // Update household with dog reference
    await ctx.db.patch(householdId, { dogId });

    // Step 5: Create initial dog_stats
    await ctx.db.insert("dog_stats", {
      dogId,
      statType: "INT",
      level: initialStats.INT.level,
      xp: initialStats.INT.xp,
      xpToNextLevel: 100,
    });

    await ctx.db.insert("dog_stats", {
      dogId,
      statType: "PHY",
      level: initialStats.PHY.level,
      xp: initialStats.PHY.xp,
      xpToNextLevel: 100,
    });

    await ctx.db.insert("dog_stats", {
      dogId,
      statType: "IMP",
      level: initialStats.IMP.level,
      xp: initialStats.IMP.xp,
      xpToNextLevel: 100,
    });

    await ctx.db.insert("dog_stats", {
      dogId,
      statType: "SOC",
      level: initialStats.SOC.level,
      xp: initialStats.SOC.xp,
      xpToNextLevel: 100,
    });

    // Step 6: Generate 7 days of activities
    const activities: ActivityData[] = [];
    const users = [thomasId, hollyId, guestId];

    // Activity templates for variety
    const activityTemplates = [
      // Day 1 (7 days ago) - Light start
      { name: "Walk", duration: 25, user: 0, hour: 8 },
      { name: "Puzzle Toy", user: 1, hour: 14 },

      // Day 2 (6 days ago)
      { name: "Fetch", duration: 15, user: 0, hour: 9 },
      { name: "Training Session", user: 1, hour: 16 },
      { name: "Walk", duration: 20, user: 2, hour: 19 },

      // Day 3 (5 days ago) - Busy day
      { name: "Dog Park Visit", user: 0, hour: 10 },
      { name: "Grooming", user: 1, hour: 13 },
      { name: "Run/Jog", duration: 25, user: 0, hour: 17 },
      { name: "Trick Practice", user: 2, hour: 20 },

      // Day 4 (4 days ago) - Lighter day
      { name: "Swimming", duration: 18, user: 1, hour: 11 },
      { name: "Sniff Walk", user: 0, hour: 18 },

      // Day 5 (3 days ago)
      { name: "Walk", duration: 60, user: 0, hour: 8 }, // Long walk
      { name: "Playdate", user: 1, hour: 14 },
      { name: "Tug-of-War", duration: 12, user: 2, hour: 19 },

      // Day 6 (2 days ago) - Active day
      { name: "Walk", duration: 30, user: 0, hour: 7 },
      { name: "Training Session", user: 1, hour: 12 },
      { name: "Fetch", duration: 20, user: 0, hour: 17 },
      { name: "Puzzle Toy", user: 2, hour: 20 },

      // Day 7 (today) - Recent activities
      { name: "Walk", duration: 28, user: 0, hour: 8 },
      { name: "Training Session", user: 1, hour: 13 },
      { name: "Fetch", duration: 18, user: 0, hour: 17 },
      { name: "Puzzle Toy", user: 1, hour: 19 },
    ];

    // Generate activities with proper timestamps
    const activityDescriptions: Record<string, string[]> = {
      Walk: [
        "Morning walk around the neighborhood",
        "Evening stroll through the park",
        "Afternoon walk to the local trail",
        "Long walk exploring new areas",
        "Quick walk before dinner",
      ],
      "Puzzle Toy": [
        "Worked on treat puzzle for mental stimulation",
        "Solved food puzzle toy",
        "Engaged with interactive puzzle",
      ],
      Fetch: [
        "15 minutes of fetch in the backyard",
        "Played fetch at the park",
        "Fetch session with favorite ball",
      ],
      "Training Session": [
        "Practiced sit, stay, and come commands",
        "Obedience training session",
        "Worked on basic commands",
      ],
      "Dog Park Visit": [
        "Visited the local dog park for exercise and socialization",
        "Dog park visit with friends",
      ],
      Grooming: [
        "Full grooming session with brushing",
        "Grooming and health check",
      ],
      "Run/Jog": ["Morning run through the neighborhood", "Jog at the park"],
      "Trick Practice": ["Practiced known tricks", "Reinforced trick training"],
      Swimming: ["Swimming session at the lake", "Pool time for exercise"],
      "Sniff Walk": [
        "Leisurely sniff walk exploring scents",
        "Slow walk focused on scent exploration",
      ],
      Playdate: [
        "Playdate with neighbor's dog",
        "Social play session with friend's dog",
      ],
      "Tug-of-War": [
        "Tug-of-war game with rope toy",
        "Played tug to build strength",
      ],
    };

    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const dayActivities = activityTemplates.filter(
        (_, idx) =>
          (dayOffset === 6 && idx < 2) ||
          (dayOffset === 5 && idx >= 2 && idx < 5) ||
          (dayOffset === 4 && idx >= 5 && idx < 9) ||
          (dayOffset === 3 && idx >= 9 && idx < 11) ||
          (dayOffset === 2 && idx >= 11 && idx < 14) ||
          (dayOffset === 1 && idx >= 14 && idx < 18) ||
          (dayOffset === 0 && idx >= 18)
      );

      for (const template of dayActivities) {
        const dayStart = now - dayOffset * 24 * 60 * 60 * 1000;
        const activityDate = new Date(dayStart);
        activityDate.setHours(
          template.hour,
          Math.floor(Math.random() * 60),
          0,
          0
        );
        const timestamp = activityDate.getTime();

        const descriptions = activityDescriptions[template.name] || [
          `${template.name} activity`,
        ];
        const description =
          descriptions[Math.floor(Math.random() * descriptions.length)];

        activities.push({
          name: template.name,
          description,
          durationMinutes: template.duration,
          userId: users[template.user],
          timestamp,
        });
      }
    }

    // Step 7: Process activities chronologically and update stats
    const dailyGoals: Record<
      string,
      { physicalPoints: number; mentalPoints: number }
    > = {};
    let totalOverallXp = 0;

    // Sort activities by timestamp
    activities.sort((a, b) => a.timestamp - b.timestamp);

    for (const activity of activities) {
      const activityDate = new Date(activity.timestamp)
        .toISOString()
        .split("T")[0];
      if (!dailyGoals[activityDate]) {
        dailyGoals[activityDate] = { physicalPoints: 0, mentalPoints: 0 };
      }

      const result = calculateActivityXp(
        activity.name,
        activity.durationMinutes
      );

      // Insert activity
      const activityId = await ctx.db.insert("activities", {
        dogId,
        userId: activity.userId,
        activityName: activity.name,
        description: activity.description,
        durationMinutes: activity.durationMinutes,
        physicalPoints: result.physicalPoints,
        mentalPoints: result.mentalPoints,
        createdAt: activity.timestamp,
      });

      // Insert stat gains
      for (const statGain of result.statGains) {
        await ctx.db.insert("activity_stat_gains", {
          activityId,
          statType: statGain.statType,
          xpAmount: statGain.xpAmount,
        });

        // Update stat - query by dog and stat type
        const stat = await ctx.db
          .query("dog_stats")
          .withIndex("by_dog_and_stat", (q) =>
            q.eq("dogId", dogId).eq("statType", statGain.statType)
          )
          .first();

        if (stat) {
          const levelUpResult = calculateLevelUp(
            stat.level,
            stat.xp,
            statGain.xpAmount
          );
          await ctx.db.patch(stat._id, {
            level: levelUpResult.newLevel,
            xp: levelUpResult.newXp,
            xpToNextLevel: levelUpResult.xpToNextLevel,
          });
        }
      }

      // Accumulate daily goals
      dailyGoals[activityDate].physicalPoints += result.physicalPoints;
      dailyGoals[activityDate].mentalPoints += result.mentalPoints;
      totalOverallXp += result.totalXp;
    }

    // Step 8: Create daily goals for all 7 days
    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const date = new Date(now - dayOffset * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const goals = dailyGoals[date] || { physicalPoints: 0, mentalPoints: 0 };

      await ctx.db.insert("daily_goals", {
        dogId,
        date,
        physicalPoints: goals.physicalPoints,
        physicalGoal: 50,
        mentalPoints: goals.mentalPoints,
        mentalGoal: 30,
      });
    }

    // Step 9: Calculate final dog overall level from stats
    const finalStats = await Promise.all([
      ctx.db
        .query("dog_stats")
        .withIndex("by_dog_and_stat", (q) =>
          q.eq("dogId", dogId).eq("statType", "INT")
        )
        .first(),
      ctx.db
        .query("dog_stats")
        .withIndex("by_dog_and_stat", (q) =>
          q.eq("dogId", dogId).eq("statType", "PHY")
        )
        .first(),
      ctx.db
        .query("dog_stats")
        .withIndex("by_dog_and_stat", (q) =>
          q.eq("dogId", dogId).eq("statType", "IMP")
        )
        .first(),
      ctx.db
        .query("dog_stats")
        .withIndex("by_dog_and_stat", (q) =>
          q.eq("dogId", dogId).eq("statType", "SOC")
        )
        .first(),
    ]);

    const avgLevel =
      finalStats.reduce((sum, stat) => sum + (stat?.level || 0), 0) / 4;
    const finalOverallLevel = Math.floor(avgLevel);
    const finalOverallXp = totalOverallXp % 100;
    const finalXpToNextLevel = 100;

    await ctx.db.patch(dogId, {
      overallLevel: finalOverallLevel,
      overallXp: finalOverallXp,
      xpToNextLevel: finalXpToNextLevel,
    });

    // Step 10: Create streak record
    await ctx.db.insert("streaks", {
      dogId,
      currentStreak: 7,
      longestStreak: 7,
      lastActivityDate: today,
    });

    // Step 11: Create cosmetic items (moon-themed items first)
    await ctx.db.insert("cosmetic_items", {
      name: "Lunar Bandana",
      description: "A mystical silver bandana that glows with moonlight",
      unlockLevel: 2,
      itemType: "moon",
      icon: "🌙",
      createdAt: now,
    });

    await ctx.db.insert("cosmetic_items", {
      name: "Moonlight Collar",
      description: "A cool silver collar adorned with crescent moon patterns",
      unlockLevel: 5,
      itemType: "moon",
      icon: "🌙",
      createdAt: now,
    });

    const moonCapeId = await ctx.db.insert("cosmetic_items", {
      name: "Lunar Cape",
      description: "A flowing cape that shimmers like moonlight on water",
      unlockLevel: 8,
      itemType: "moon",
      icon: "🌙",
      createdAt: now,
    });

    await ctx.db.insert("cosmetic_items", {
      name: "Solar Crown",
      description: "A radiant golden crown that shines like the sun",
      unlockLevel: 11,
      itemType: "sun",
      icon: "☀️",
      createdAt: now,
    });

    await ctx.db.insert("cosmetic_items", {
      name: "Flame Bandana",
      description: "A fiery red bandana that radiates warmth and energy",
      unlockLevel: 14,
      itemType: "fire",
      icon: "🔥",
      createdAt: now,
    });

    await ctx.db.insert("cosmetic_items", {
      name: "Earth Vest",
      description: "A sturdy brown vest made from the finest earth materials",
      unlockLevel: 17,
      itemType: "ground",
      icon: "🪨",
      createdAt: now,
    });

    // Step 12: Equip Lunar Cape if dog is level 8 or higher
    if (finalOverallLevel >= 8) {
      await ctx.db.insert("equipped_items", {
        dogId,
        itemId: moonCapeId,
        generatedImageUrl: "/images/bumi-lunar-cape.png",
        equippedAt: now,
      });
    }

    return {
      success: true,
      message:
        "Enhanced demo data seeded successfully with 7 days of activities",
      data: {
        householdId,
        dogId,
        userIds: { thomasId, hollyId, guestId },
        activityCount: activities.length,
        cosmeticItemsCount: 6,
        finalStats: finalStats.map((s) => ({
          statType: s?.statType,
          level: s?.level,
          xp: s?.xp,
        })),
        finalOverallLevel,
      },
    };
  },
});
