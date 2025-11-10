import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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

      // Create system prompt
      const systemPrompt = `You are an AI assistant for Corgi Quest, a dog training RPG. Your role is to analyze mood patterns and activity history to generate personalized activity recommendations.

Context:
- The dog has 4 stats: INT (Intelligence), PHY (Physical), IMP (Impulse Control), SOC (Social)
- Daily goals: Physical (50 points) and Mental (30 points)
- Activities award XP to stats and contribute to daily goals

Your task:
1. Analyze mood patterns to identify issues (e.g., frequent anxiety, reactivity)
2. Identify which activities have been effective at improving mood
3. Identify stat gaps (stats that are lower level or need more XP)
4. Consider daily goal progress (which goal needs more attention)
5. Generate 3-5 personalized activity recommendations

Each recommendation should include:
- activityName: Name of the activity (e.g., "Morning Walk", "Training Session")
- reasoning: 1-2 sentences explaining why this activity is recommended
- expectedMoodImpact: Brief description of how this might help with mood (e.g., "Reduces anxiety", "Increases calmness")
- statGains: Array of {statType, xpAmount} objects
- physicalPoints: Points toward physical goal (0-50)
- mentalPoints: Points toward mental goal (0-30)
- durationMinutes: Optional duration for time-based activities

Activity XP Guidelines:
- Walk: 15 XP per 10 min to PHY, 10 physical points per 10 min
- Run: 25 XP per 10 min to PHY, 15 physical points per 10 min
- Fetch: 20 XP per 10 min (70% PHY, 30% IMP), 12 physical + 3 mental points per 10 min
- Training Session: 40 XP (60% IMP, 40% INT), 15 mental points
- Puzzle Toy: 30 XP to INT, 10 mental points
- Playdate: 35 XP (70% SOC, 30% PHY), 8 physical + 7 mental points
- Dog Park Visit: 40 XP (50% SOC, 50% PHY), 12 physical + 8 mental points

Respond ONLY with a valid JSON array of recommendations. No additional text.`;

      const userPrompt = `Analyze this data and generate 3-5 personalized activity recommendations:

Mood Logs (Last 7 Days):
${JSON.stringify(moodSummary, null, 2)}

Activity History (Last 7 Days):
${JSON.stringify(activitySummary, null, 2)}

Current Stats:
${JSON.stringify(statsSummary, null, 2)}

Today's Daily Goals:
${JSON.stringify(goalsSummary, null, 2)}

Generate recommendations as a JSON array.`;

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
