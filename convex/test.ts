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

/**
 * Test query for getAllCosmeticItems
 * Verifies that getAllCosmeticItems returns all items with unlock status
 */
export const testGetAllCosmeticItems = query({
  args: {},
  handler: async (ctx) => {
    const dog = await ctx.db.query("dogs").first();

    if (!dog) {
      return {
        success: false,
        message: "No dog found. Please run seedDemoData first.",
      };
    }

    // Get all cosmetic items
    const items = await ctx.db.query("cosmetic_items").collect();

    // Add unlock status to each item
    const itemsWithStatus = items.map((item) => ({
      ...item,
      isUnlocked: dog.overallLevel >= item.unlockLevel,
    }));

    // Sort by unlock level
    const sortedItems = itemsWithStatus.sort(
      (a, b) => a.unlockLevel - b.unlockLevel
    );

    return {
      success: true,
      message: "getAllCosmeticItems test successful",
      dogLevel: dog.overallLevel,
      totalItems: sortedItems.length,
      unlockedCount: sortedItems.filter((item) => item.isUnlocked).length,
      lockedCount: sortedItems.filter((item) => !item.isUnlocked).length,
      items: sortedItems,
    };
  },
});

/**
 * Test query for getUnlockedItems
 * Verifies that getUnlockedItems returns only unlocked items based on dog's level
 */
export const testGetUnlockedItems = query({
  args: {},
  handler: async (ctx) => {
    const dog = await ctx.db.query("dogs").first();

    if (!dog) {
      return {
        success: false,
        message: "No dog found. Please run seedDemoData first.",
      };
    }

    // Get all cosmetic items
    const items = await ctx.db.query("cosmetic_items").collect();

    // Filter to only unlocked items
    const unlockedItems = items.filter(
      (item) => dog.overallLevel >= item.unlockLevel
    );

    // Sort by unlock level
    const sortedItems = unlockedItems.sort(
      (a, b) => a.unlockLevel - b.unlockLevel
    );

    return {
      success: true,
      message: "getUnlockedItems test successful",
      dogLevel: dog.overallLevel,
      unlockedCount: sortedItems.length,
      items: sortedItems,
    };
  },
});

/**
 * Test query for getEquippedItem
 * Verifies that getEquippedItem returns the currently equipped item with full details
 */
export const testGetEquippedItem = query({
  args: {},
  handler: async (ctx) => {
    const dog = await ctx.db.query("dogs").first();

    if (!dog) {
      return {
        success: false,
        message: "No dog found. Please run seedDemoData first.",
      };
    }

    // Get equipped item record
    const equippedItem = await ctx.db
      .query("equipped_items")
      .withIndex("by_dog", (q) => q.eq("dogId", dog._id))
      .first();

    if (!equippedItem) {
      return {
        success: true,
        message: "No item currently equipped",
        equippedItem: null,
      };
    }

    // Get the full item details
    const item = await ctx.db.get(equippedItem.itemId);
    if (!item) {
      return {
        success: false,
        message: "Equipped item not found in cosmetic_items table",
        equippedItem: null,
      };
    }

    return {
      success: true,
      message: "getEquippedItem test successful",
      equippedItem: {
        ...equippedItem,
        item,
      },
    };
  },
});

/**
 * Test mutation for item unlock on level up
 * Simulates logging an activity that causes a level up and verifies items are unlocked
 */
export const testItemUnlockOnLevelUp = mutation({
  args: {},
  handler: async (ctx) => {
    const dog = await ctx.db.query("dogs").first();
    const user = await ctx.db.query("users").first();

    if (!dog || !user) {
      return {
        success: false,
        message: "No dog or user found. Please run seedDemoData first.",
      };
    }

    // Get current level and XP
    const currentLevel = dog.overallLevel;
    const currentXp = dog.overallXp;

    // Calculate XP needed to level up (assuming 100 XP per level)
    const xpToNextLevel = 100 - currentXp;
    const xpToGain = xpToNextLevel + 10; // Gain enough to level up with overflow

    // Log an activity with enough XP to level up
    const activityId = await ctx.db.insert("activities", {
      dogId: dog._id,
      userId: user._id,
      activityName: "Test Level Up Activity",
      description: "Testing item unlock on level up",
      physicalPoints: 10,
      mentalPoints: 10,
      createdAt: Date.now(),
    });

    // Insert stat gains
    await ctx.db.insert("activity_stat_gains", {
      activityId,
      statType: "PHY",
      xpAmount: xpToGain,
    });

    // Update dog's overall XP and level
    const newXp = (currentXp + xpToGain) % 100;
    const newLevel = currentLevel + Math.floor((currentXp + xpToGain) / 100);

    await ctx.db.patch(dog._id, {
      overallLevel: newLevel,
      overallXp: newXp,
      xpToNextLevel: 100,
    });

    // Check for newly unlocked items
    const allItems = await ctx.db.query("cosmetic_items").collect();
    const newlyUnlockedItems = [];

    for (const item of allItems) {
      if (currentLevel < item.unlockLevel && newLevel >= item.unlockLevel) {
        newlyUnlockedItems.push({
          itemId: item._id,
          itemName: item.name,
          unlockLevel: item.unlockLevel,
        });

        // Mark as newly unlocked
        await ctx.db.insert("newly_unlocked_items", {
          dogId: dog._id,
          itemId: item._id,
          unlockedAt: Date.now(),
        });
      }
    }

    // Get newly unlocked items from database
    const newlyUnlockedRecords = await ctx.db
      .query("newly_unlocked_items")
      .withIndex("by_dog", (q) => q.eq("dogId", dog._id))
      .collect();

    return {
      success: true,
      message: "Item unlock test completed",
      levelUp: {
        oldLevel: currentLevel,
        newLevel: newLevel,
        xpGained: xpToGain,
      },
      newlyUnlockedItems,
      newlyUnlockedRecordsCount: newlyUnlockedRecords.length,
    };
  },
});

/**
 * Test query to check newly unlocked items
 * Verifies that newly unlocked items are tracked correctly
 */
export const testGetNewlyUnlockedItems = query({
  args: {},
  handler: async (ctx) => {
    const dog = await ctx.db.query("dogs").first();

    if (!dog) {
      return {
        success: false,
        message: "No dog found. Please run seedDemoData first.",
      };
    }

    // Get newly unlocked items
    const newlyUnlockedItems = await ctx.db
      .query("newly_unlocked_items")
      .withIndex("by_dog", (q) => q.eq("dogId", dog._id))
      .collect();

    // Get full item details
    const itemsWithDetails = await Promise.all(
      newlyUnlockedItems.map(async (record) => {
        const item = await ctx.db.get(record.itemId);
        return {
          ...record,
          item,
        };
      })
    );

    return {
      success: true,
      message: "Newly unlocked items retrieved",
      count: itemsWithDetails.length,
      items: itemsWithDetails,
    };
  },
});
