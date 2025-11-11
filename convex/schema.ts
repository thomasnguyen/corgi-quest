import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Corgi Quest Database Schema
 *
 * This schema defines 11 tables for the dog training RPG:
 * - users: Partners in a household
 * - households: Shared account containing users and a dog
 * - dogs: The pet character being trained
 * - dog_stats: Four character attributes (INT, PHY, IMP, SOC)
 * - activities: Logged training/exercise events
 * - activity_stat_gains: XP awards per activity per stat
 * - daily_goals: Daily physical and mental stimulation tracking
 * - streaks: Consecutive days meeting goals
 * - mood_logs: Dog mood tracking throughout the day
 * - cosmetic_items: Unlockable cosmetic items for dog customization
 * - equipped_items: Currently equipped cosmetic items per dog
 */

export default defineSchema({
  // Users table - partners in a household
  users: defineTable({
    name: v.string(),
    email: v.string(),
    householdId: v.id("households"),
    avatarUrl: v.optional(v.string()), // Optional character portrait/avatar URL
    title: v.optional(v.string()), // Optional title/role (e.g., "Primary Trainer", "Play Partner")
    createdAt: v.number(),
  })
    .index("by_household", ["householdId"])
    .index("by_email", ["email"]),

  // Households table - shared account
  households: defineTable({
    dogId: v.optional(v.id("dogs")),
    createdAt: v.number(),
  }),

  // Dogs table - the pet character
  dogs: defineTable({
    name: v.string(),
    householdId: v.id("households"),
    overallLevel: v.number(),
    overallXp: v.number(),
    xpToNextLevel: v.number(),
    photoUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_household", ["householdId"]),

  // Dog stats table - four character attributes
  dog_stats: defineTable({
    dogId: v.id("dogs"),
    statType: v.union(
      v.literal("INT"),
      v.literal("PHY"),
      v.literal("IMP"),
      v.literal("SOC")
    ),
    level: v.number(),
    xp: v.number(),
    xpToNextLevel: v.number(),
  })
    .index("by_dog", ["dogId"])
    .index("by_dog_and_stat", ["dogId", "statType"]),

  // Activities table - logged training events
  activities: defineTable({
    dogId: v.id("dogs"),
    userId: v.id("users"),
    activityName: v.string(),
    description: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    physicalPoints: v.optional(v.number()),
    mentalPoints: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_dog", ["dogId"])
    .index("by_dog_and_created", ["dogId", "createdAt"]),

  // Activity stat gains table - XP awards per activity
  activity_stat_gains: defineTable({
    activityId: v.id("activities"),
    statType: v.union(
      v.literal("INT"),
      v.literal("PHY"),
      v.literal("IMP"),
      v.literal("SOC")
    ),
    xpAmount: v.number(),
  }).index("by_activity", ["activityId"]),

  // Daily goals table - physical and mental stimulation tracking
  daily_goals: defineTable({
    dogId: v.id("dogs"),
    date: v.string(), // YYYY-MM-DD format
    physicalPoints: v.number(),
    physicalGoal: v.number(),
    mentalPoints: v.number(),
    mentalGoal: v.number(),
  })
    .index("by_dog", ["dogId"])
    .index("by_dog_and_date", ["dogId", "date"]),

  // Streaks table - consecutive days meeting goals
  streaks: defineTable({
    dogId: v.id("dogs"),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastActivityDate: v.string(), // YYYY-MM-DD format
  }).index("by_dog", ["dogId"]),

  // Presence table - real-time awareness of partner activity
  presence: defineTable({
    userId: v.id("users"),
    location: v.string(), // e.g., "log-activity", "overview", etc.
    lastSeen: v.number(), // timestamp
  }).index("by_user", ["userId"]),

  // Mood logs table - dog mood tracking throughout the day
  mood_logs: defineTable({
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
    createdAt: v.number(),
  })
    .index("by_dog", ["dogId"])
    .index("by_dog_and_created", ["dogId", "createdAt"]),

  // AI Recommendations cache - stores daily AI-generated recommendations
  ai_recommendations: defineTable({
    dogId: v.id("dogs"),
    date: v.string(), // YYYY-MM-DD format
    recommendations: v.string(), // JSON stringified array of recommendations
    createdAt: v.number(),
  })
    .index("by_dog", ["dogId"])
    .index("by_dog_and_date", ["dogId", "date"]),

  // Firecrawl Tips cache - stores daily Firecrawl-scraped training tips
  firecrawl_tips: defineTable({
    dogId: v.id("dogs"),
    date: v.string(), // YYYY-MM-DD format
    tips: v.string(), // JSON stringified array of training tips
    createdAt: v.number(),
  })
    .index("by_dog", ["dogId"])
    .index("by_dog_and_date", ["dogId", "date"]),

  // Cosmetic items table - unlockable items for dog customization
  cosmetic_items: defineTable({
    name: v.string(),
    description: v.string(),
    unlockLevel: v.number(), // Level required to unlock (1 per level, starting at level 2)
    itemType: v.string(), // e.g., "warrior", "mage", "ranger", etc.
    icon: v.string(), // Emoji or icon identifier
    createdAt: v.number(),
  }).index("by_unlock_level", ["unlockLevel"]),

  // Equipped items table - currently equipped cosmetic items per dog
  equipped_items: defineTable({
    dogId: v.id("dogs"),
    itemId: v.id("cosmetic_items"),
    generatedImageUrl: v.string(), // AI-generated image URL
    equippedAt: v.number(), // Timestamp
  }).index("by_dog", ["dogId"]),

  // Newly unlocked items table - tracks items that were recently unlocked to show "New!" badge
  newly_unlocked_items: defineTable({
    dogId: v.id("dogs"),
    itemId: v.id("cosmetic_items"),
    unlockedAt: v.number(), // Timestamp when item was unlocked
  })
    .index("by_dog", ["dogId"])
    .index("by_dog_and_item", ["dogId", "itemId"]),
});
