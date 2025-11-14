import { mutation } from "./_generated/server";

/**
 * Seed mutation to create demo household data
 *
 * Creates:
 * - Household with three users (Thomas, Holly, and Guest)
 * - Dog "Bumi" at level 8
 * - Four dog stats with varying levels
 * - Today's daily goals with partial progress
 * - Streak record
 * - 3-4 sample activities from past few hours
 * - 6 cosmetic items (1 per 3 levels, starting at level 2)
 *   - Level 2: Flame Bandana (fire type) 🔥
 *   - Level 5: Ocean Collar (water type) 💧
 *   - Level 8: Forest Cape (grass type) 🌿
 *   - Level 11: Solar Crown (sun type) ☀️
 *   - Level 14: Lunar Scarf (moon type) 🌙
 *   - Level 17: Earth Vest (ground type) 🪨
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

    // Step 4: Create three users
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

    // Step 9: Create cosmetic items (1 per 3 levels, starting at level 2)
    // Level 2: Fire type
    await ctx.db.insert("cosmetic_items", {
      name: "Flame Bandana",
      description: "A fiery red bandana that radiates warmth and energy",
      unlockLevel: 2,
      itemType: "fire",
      icon: "🔥",
      aiPrompt:
        "fire warrior corgi wearing a red bandana with flames, epic fantasy art, centered composition, clean background",
      createdAt: now,
    });

    // Level 5: Water type
    await ctx.db.insert("cosmetic_items", {
      name: "Ocean Collar",
      description: "A cool blue collar adorned with wave patterns",
      unlockLevel: 5,
      itemType: "water",
      icon: "💧",
      aiPrompt:
        "water mage corgi wearing a blue collar with wave patterns, flowing water magic, mystical art, centered composition, clean background",
      createdAt: now,
    });

    // Level 8: Grass type
    const forestCapeId = await ctx.db.insert("cosmetic_items", {
      name: "Forest Cape",
      description: "A leafy green cape that brings nature's vitality",
      unlockLevel: 8,
      itemType: "grass",
      icon: "🌿",
      aiPrompt:
        "nature guardian corgi wearing a leafy green cape, surrounded by plants and vines, nature art, centered composition, clean background",
      createdAt: now,
    });

    // Level 11: Sun type
    await ctx.db.insert("cosmetic_items", {
      name: "Solar Crown",
      description: "A radiant golden crown that shines like the sun",
      unlockLevel: 11,
      itemType: "sun",
      icon: "☀️",
      aiPrompt:
        "solar knight corgi wearing a radiant golden crown, glowing with sunlight, divine art, centered composition, clean background",
      createdAt: now,
    });

    // Level 14: Moon type
    await ctx.db.insert("cosmetic_items", {
      name: "Lunar Scarf",
      description: "A mystical silver scarf that glows with moonlight",
      unlockLevel: 14,
      itemType: "moon",
      icon: "🌙",
      aiPrompt:
        "lunar mystic corgi wearing a silver scarf glowing with moonlight, celestial art, centered composition, clean background",
      createdAt: now,
    });

    // Level 17: Ground type
    await ctx.db.insert("cosmetic_items", {
      name: "Earth Vest",
      description: "A sturdy brown vest made from the finest earth materials",
      unlockLevel: 17,
      itemType: "ground",
      icon: "🪨",
      aiPrompt:
        "earth guardian corgi wearing a brown stone armor vest, rocky terrain, nature art, centered composition, clean background",
      createdAt: now,
    });

    // Step 10: Equip the Forest Cape (level 8 item) since Bumi is level 8
    // Using placeholder image URL - replace with actual image path
    await ctx.db.insert("equipped_items", {
      dogId,
      itemId: forestCapeId,
      generatedImageUrl: "/images/bumi-forest-cape.png", // Placeholder - replace with actual image
      equippedAt: now,
    });

    return {
      success: true,
      message: "Demo data seeded successfully",
      data: {
        householdId,
        dogId,
        userIds: { thomasId, hollyId, guestId },
        activityCount: 4,
        cosmeticItemsCount: 6,
        equippedItemId: forestCapeId,
      },
    };
  },
});
