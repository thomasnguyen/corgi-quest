import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a 6-character alphanumeric referral code
 * Format: lowercase letters + numbers (e.g., "a3x9k2")
 */
function generateReferralCode(): string {
  return Math.random().toString(36).slice(2, 8);
}

/**
 * Join the waitlist with optional referral attribution
 *
 * Flow:
 * 1. Check for existing user by email
 * 2. If exists, return existing data with queue position
 * 3. If referredByCode provided, find referrer
 * 4. Create new user with generated referralCode
 * 5. If valid referrer found:
 *    - Increment referrer's referralCount
 *    - Set referrer's earlyAccess to true if count >= 1
 *    - Set new user's earlyAccess to true
 * 6. Calculate queue position
 * 7. Return user data
 */
export const joinWaitlist = mutation({
  args: {
    email: v.string(),
    referredByCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { email, referredByCode } = args;

    // Validate email format
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      throw new Error("Invalid email format");
    }

    // 1. Check for existing user by email using by_email index
    const existingUser = await ctx.db
      .query("waitlist_users")
      .withIndex("by_email", (q) => q.eq("email", trimmedEmail))
      .first();

    if (existingUser) {
      // User already exists, calculate their queue position and return
      const position = await calculateQueuePosition(
        ctx,
        existingUser.createdAt
      );

      return {
        id: existingUser._id,
        email: existingUser.email,
        referralCode: existingUser.referralCode,
        referralCount: existingUser.referralCount,
        position,
        earlyAccess: existingUser.earlyAccess,
      };
    }

    // 2. Generate unique referral code for new user
    const referralCode = generateReferralCode();
    const createdAt = Date.now();

    // 3. Look up referrer if referredByCode provided
    let referrerId: any;
    let grantEarlyAccess = false;

    if (referredByCode) {
      const referrer = await ctx.db
        .query("waitlist_users")
        .withIndex("by_referralCode", (q) =>
          q.eq("referralCode", referredByCode)
        )
        .first();

      if (referrer) {
        referrerId = referrer._id;

        // 4. Increment referrer's referralCount
        const newReferralCount = referrer.referralCount + 1;

        await ctx.db.patch(referrer._id, {
          referralCount: newReferralCount,
        });

        // 5. Set referrer's earlyAccess to true if they hit the threshold
        if (newReferralCount >= 1) {
          await ctx.db.patch(referrer._id, {
            earlyAccess: true,
          });
        }

        // 6. Grant early access to the new user since they were referred
        grantEarlyAccess = true;
      }
    }

    // 7. Create new waitlist user
    const userId = await ctx.db.insert("waitlist_users", {
      email: trimmedEmail,
      referralCode,
      referredBy: referrerId,
      referralCount: 0,
      earlyAccess: grantEarlyAccess,
      createdAt,
    });

    // 8. Calculate queue position
    const position = await calculateQueuePosition(ctx, createdAt);

    // 9. Return user data
    return {
      id: userId,
      email: trimmedEmail,
      referralCode,
      referralCount: 0,
      position,
      earlyAccess: grantEarlyAccess,
    };
  },
});

/**
 * Calculate queue position based on createdAt timestamp
 * Position = number of users created before this user + 1
 */
async function calculateQueuePosition(
  ctx: any,
  createdAt: number
): Promise<number> {
  const usersAhead = await ctx.db
    .query("waitlist_users")
    .filter((q: any) => q.lt(q.field("createdAt"), createdAt))
    .collect();

  return usersAhead.length + 1;
}
