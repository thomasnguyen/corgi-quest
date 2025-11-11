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
export const generateRecommendations = action({
  args: {
    dogId: v.id("dogs"),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY not configured. Please add it to your Convex environment variables."
      );
    }

    try {
      // Calculate date range (last 7 days)
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

      // Query mood logs from last 7 days
      const moodLogs = await ctx.runQuery(api.queries.getMoodFeed, {
        dogId: args.dogId,
      });
      const recentMoods = moodLogs.filter(
        (mood: any) => mood.createdAt >= sevenDaysAgo
      );

      // Query activity history from last 7 days
      const activityFeed = await ctx.runQuery(api.queries.getActivityFeed, {
        dogId: args.dogId,
      });
      const recentActivities = activityFeed.filter(
        (activity: any) => activity.createdAt >= sevenDaysAgo
      );

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
      const moodSummary = recentMoods.map((mood: any) => ({
        mood: mood.mood,
        note: mood.note,
        timestamp: new Date(mood.createdAt).toISOString(),
      }));

      const activitySummary = recentActivities.map((activity: any) => ({
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

      // Call OpenAI Chat Completion API
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
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
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `OpenAI API request failed: ${response.status} ${response.statusText} - ${errorText}`
        );
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
        throw new Error(`Failed to generate recommendations: ${error.message}`);
      }
      throw new Error("Failed to generate recommendations: Unknown error");
    }
  },
});
