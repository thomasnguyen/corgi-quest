import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import {
  RECOMMENDATION_SYSTEM_PROMPT,
  createRecommendationUserPrompt,
} from "./lib/aiRecommendationPrompt";

/**
 * Generate OpenAI Realtime API Session Token
 *
 * Creates an ephemeral session token for client-side WebSocket connections
 * to the OpenAI Realtime API. This token is used to establish secure
 * audio-to-audio voice conversations with function calling capabilities.
 *
 * @returns {string} Session token (client_secret.value)
 * @throws {Error} If OPENAI_API_KEY is not configured or API request fails
 */
export const generateSessionToken = action(async () => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY not configured. Please add it to your Convex environment variables."
    );
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-10-01",
          voice: "alloy",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to generate session token: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    if (!data.client_secret?.value) {
      throw new Error(
        "Invalid response from OpenAI: missing client_secret.value"
      );
    }

    return data.client_secret.value;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `OpenAI session token generation failed: ${error.message}`
      );
    }
    throw new Error("OpenAI session token generation failed: Unknown error");
  }
});

/**
 * Generate AI-Powered Activity Recommendations
 *
 * Analyzes mood patterns and activity history from the last 7 days to generate
 * personalized activity recommendations. Uses OpenAI Chat Completion API to
 * identify patterns, stat gaps, and suggest activities that address mood issues
 * and help meet daily goals.
 *
 * @param {Object} args - Arguments object
 * @param {Id<"dogs">} args.dogId - The dog's ID
 * @returns {Array} Array of recommendation objects with activity details
 * @throws {Error} If OPENAI_API_KEY is not configured or API request fails
 */
/**
 * Generate AI recommendations for a specific week date range
 * Used for weekly summary to provide personalized recommendations based on the week's data
 */
export const generateWeeklyRecommendations = action({
  args: {
    dogId: v.id("dogs"),
    weekStartDate: v.string(), // YYYY-MM-DD
    weekEndDate: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY not configured. Please add it to your Convex environment variables."
      );
    }

    try {
      // Convert dates to timestamps
      const startTime = new Date(args.weekStartDate).getTime();
      const endTime = new Date(args.weekEndDate).getTime() + 24 * 60 * 60 * 1000; // End of day

      // Query mood logs for the week
      const moodLogs = await ctx.runQuery(api.queries.getMoodFeed, {
        dogId: args.dogId,
      });
      const weekMoods = moodLogs.filter(
        (mood: any) => mood.createdAt >= startTime && mood.createdAt < endTime
      );

      // Query activity history for the week
      const activityFeed = await ctx.runQuery(api.queries.getActivityFeed, {
        dogId: args.dogId,
      });
      const weekActivities = activityFeed.filter(
        (activity: any) => activity.createdAt >= startTime && activity.createdAt < endTime
      );

      // Check if we have enough data to generate meaningful recommendations
      if (weekActivities.length === 0 && weekMoods.length === 0) {
        // Return empty array instead of throwing - weekly summary can still show other data
        return [];
      }

      // Query current stats
      const dogProfile = await ctx.runQuery(api.queries.getDogProfile, {
        dogId: args.dogId,
      });

      if (!dogProfile) {
        throw new Error("Dog not found");
      }

      // Query current daily goals
      const dailyGoals = await ctx.runQuery(api.queries.getDailyGoals, {
        dogId: args.dogId,
      });

      // Format data for OpenAI
      const moodSummary = weekMoods.map((mood: any) => ({
        mood: mood.mood,
        note: mood.note,
        timestamp: new Date(mood.createdAt).toISOString(),
      }));

      const activitySummary = weekActivities.map((activity: any) => ({
        name: activity.activityName,
        duration: activity.durationMinutes,
        statGains: activity.statGains,
        physicalPoints: activity.physicalPoints,
        mentalPoints: activity.mentalPoints,
        timestamp: new Date(activity.createdAt).toISOString(),
      }));

      const statsSummary = dogProfile.stats.map((stat: any) => ({
        type: stat.statType,
        level: stat.level,
        xp: stat.xp,
        xpToNextLevel: stat.xpToNextLevel,
        progress: Math.round((stat.xp / stat.xpToNextLevel) * 100),
      }));

      const goalsSummary = dailyGoals
        ? {
            physical: {
              current: dailyGoals.physicalPoints,
              goal: dailyGoals.physicalGoal,
              remaining: dailyGoals.physicalGoal - dailyGoals.physicalPoints,
            },
            mental: {
              current: dailyGoals.mentalPoints,
              goal: dailyGoals.mentalGoal,
              remaining: dailyGoals.mentalGoal - dailyGoals.mentalPoints,
            },
          }
        : null;

      // Create prompts using the dedicated prompt module
      const systemPrompt = RECOMMENDATION_SYSTEM_PROMPT;
      const userPrompt = createRecommendationUserPrompt({
        moodSummary,
        activitySummary,
        statsSummary,
        goalsSummary,
      });

      // Call OpenAI Chat Completion API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      let response;
      try {
        response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            response_format: { type: "json_object" },
          }),
          signal: controller.signal,
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          throw new Error(
            "Request timed out. The AI service is taking too long to respond. Please try again."
          );
        }
        throw fetchError;
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const errorText = await response.text();

        // Handle specific error cases
        if (response.status === 429) {
          throw new Error(
            "Rate limit exceeded. Please wait a moment and try again."
          );
        } else if (response.status === 401) {
          throw new Error(
            "OpenAI API authentication failed. Please check your API key configuration."
          );
        } else if (response.status >= 500) {
          throw new Error(
            "OpenAI service is temporarily unavailable. Please try again in a few moments."
          );
        } else {
          throw new Error(
            `OpenAI API request failed: ${response.status} ${response.statusText}`
          );
        }
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new Error("Invalid response from OpenAI: missing content");
      }

      // Parse OpenAI response
      const content = data.choices[0].message.content;
      let parsedResponse;

      try {
        parsedResponse = JSON.parse(content);
      } catch (parseError) {
        throw new Error(
          `Failed to parse OpenAI response as JSON: ${content.substring(0, 200)}`
        );
      }

      // Extract recommendations array (handle both direct array and object with recommendations key)
      const recommendations = Array.isArray(parsedResponse)
        ? parsedResponse
        : parsedResponse.recommendations || [];

      if (!Array.isArray(recommendations) || recommendations.length === 0) {
        throw new Error("No recommendations generated");
      }

      // Validate and return recommendations
      return recommendations.map((rec) => ({
        activityName: rec.activityName || "Unknown Activity",
        reasoning: rec.reasoning || "No reasoning provided",
        expectedMoodImpact:
          rec.expectedMoodImpact || "May improve overall well-being",
        statGains: Array.isArray(rec.statGains) ? rec.statGains : [],
        physicalPoints: rec.physicalPoints || 0,
        mentalPoints: rec.mentalPoints || 0,
        durationMinutes: rec.durationMinutes,
      }));
    } catch (error) {
      if (error instanceof Error) {
        // Check for network errors
        if (
          error.message.includes("fetch failed") ||
          error.message.includes("network") ||
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("ETIMEDOUT")
        ) {
          throw new Error(
            "Network error. Please check your internet connection and try again."
          );
        }

        // Re-throw with original message if it's already user-friendly
        if (
          error.message.includes("Rate limit") ||
          error.message.includes("authentication") ||
          error.message.includes("temporarily unavailable") ||
          error.message.includes("not configured")
        ) {
          throw error;
        }

        // Generic error with details
        throw new Error(`Failed to generate recommendations: ${error.message}`);
      }
      throw new Error("Failed to generate recommendations: Unknown error");
    }
  },
});

/**
 * Create Autumn Checkout Session (Sandbox Mode)
 *
 * Creates a checkout session for tip jar functionality using Autumn's payment platform.
 * In sandbox mode, this simulates the checkout flow without real charges.
 * In production, this would create an actual Autumn checkout session and return a URL.
 *
 * @param {Object} args - Arguments object
 * @param {number} args.amount - Tip amount in USD
 * @param {string} args.customerId - Customer ID (user ID)
 * @param {string} args.successUrl - URL to redirect after successful payment
 * @returns {Object} Checkout session with URL and session ID
 * @throws {Error} If AUTUMN_API_KEY is not configured or API request fails
 *
 * Note: To use Autumn in production:
 * 1. Install autumn-js: npm install autumn-js
 * 2. Get API key from https://useautumn.com/dashboard
 * 3. Add AUTUMN_API_KEY to Convex environment variables
 * 4. Create products in Autumn dashboard for tip amounts
 * 5. Use Autumn.checkout() to create checkout sessions
 * 6. Handle webhooks for payment confirmation
 */
export const createAutumnCheckout = action({
  args: {
    amount: v.number(),
    customerId: v.string(),
    successUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.AUTUMN_API_KEY;

    // In sandbox mode, return a mock checkout session
    if (!apiKey || apiKey === "autumn_sandbox_test_key_placeholder") {
      return {
        url: null, // No redirect needed in sandbox
        sessionId: `sandbox_${Date.now()}`,
        amount: args.amount,
        currency: "USD",
        mode: "sandbox",
        message: "Sandbox mode - no real charges will be made",
      };
    }

    // Production implementation (requires autumn-js package)
    // Uncomment and configure when ready for production:
    /*
    try {
      const { Autumn } = await import("autumn-js");
      
      const autumn = new Autumn({
        apiKey,
        env: "sandbox", // Change to "live" for production
      });

      // Create or get customer
      const customer = await autumn.createCustomer({
        id: args.customerId,
        email: `${args.customerId}@corgiquest.app`,
      });

      // Create checkout session
      // Note: You need to create products in Autumn dashboard first
      const productId = `tip_${args.amount}`; // e.g., "tip_3", "tip_5", "tip_10"
      
      const result = await autumn.checkout({
        customer_id: customer.id,
        product_id: productId,
        success_url: args.successUrl || "https://corgiquest.app/thanks?success=true",
      });

      if (result.url) {
        return {
          url: result.url,
          sessionId: result.customer_id,
          amount: args.amount,
          currency: result.currency,
          mode: "live",
        };
      }

      throw new Error("Failed to create checkout session");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Autumn checkout failed: ${error.message}`);
      }
      throw new Error("Autumn checkout failed: Unknown error");
    }
    */

    throw new Error(
      "AUTUMN_API_KEY not configured. Please add it to your Convex environment variables."
    );
  },
});
