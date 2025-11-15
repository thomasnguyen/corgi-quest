import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Email Updates System - Phase 1
 *
 * Simple email collection for gauging interest in Corgi Quest.
 * Completely separate from the waitlist system.
 */

/**
 * Subscribe to email updates
 *
 * Validates and stores email addresses for product updates.
 * Returns existing subscriber data if email already exists.
 */
export const subscribeToUpdates = mutation({
  args: {
    email: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Validate email format (basic check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    // 2. Normalize email (lowercase, trim)
    const normalizedEmail = args.email.toLowerCase().trim();

    // 3. Check for existing subscriber
    const existing = await ctx.db
      .query("updates_subscribers")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    // 4. If exists, return existing data
    if (existing) {
      return {
        email: existing.email,
        subscribedAt: existing.subscribedAt,
        isNew: false,
      };
    }

    // 5. Create new subscriber
    const subscribedAt = Date.now();
    await ctx.db.insert("updates_subscribers", {
      email: normalizedEmail,
      subscribedAt,
      source: args.source,
    });

    // 6. Return subscriber data
    return {
      email: normalizedEmail,
      subscribedAt,
      isNew: true,
    };
  },
});

/**
 * Get subscriber count
 *
 * Returns total subscriber count and count from last week.
 */
export const getSubscriberCount = query({
  args: {},
  handler: async (ctx) => {
    const subscribers = await ctx.db.query("updates_subscribers").collect();

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const lastWeekCount = subscribers.filter(
      (s) => s.subscribedAt > oneWeekAgo
    ).length;

    return {
      total: subscribers.length,
      lastWeek: lastWeekCount,
    };
  },
});

/**
 * Get all subscribers (Admin only)
 *
 * Returns all subscribers ordered by signup date (most recent first).
 * Future: Add authentication check.
 */
export const getAllSubscribers = query({
  args: {},
  handler: async (ctx) => {
    // Future: Add authentication check
    const subscribers = await ctx.db
      .query("updates_subscribers")
      .withIndex("by_subscribed_at")
      .order("desc")
      .collect();

    return subscribers;
  },
});
