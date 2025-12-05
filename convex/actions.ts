"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import {
  RECOMMENDATION_SYSTEM_PROMPT,
  createRecommendationUserPrompt,
} from "./lib/aiRecommendationPrompt";
import OpenAI from "openai";

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
          model: "gpt-4o-realtime-preview",
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
export const generateRecommendations = action({
  args: {
    dogId: v.id("dogs"),
    weekStartDate: v.optional(v.string()), // YYYY-MM-DD
    weekEndDate: v.optional(v.string()), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY not configured. Please add it to your Convex environment variables."
      );
    }

    try {
      // Convert dates to timestamps (default to last 7 days if not provided)
      let startTime: number;
      let endTime: number;

      if (args.weekStartDate && args.weekEndDate) {
        startTime = new Date(args.weekStartDate).getTime();
        endTime = new Date(args.weekEndDate).getTime() + 24 * 60 * 60 * 1000; // End of day
      } else {
        // Default to last 7 days
        const now = new Date();
        endTime = now.getTime() + 24 * 60 * 60 * 1000; // End of today
        startTime = now.getTime() - 7 * 24 * 60 * 60 * 1000; // 7 days ago
      }

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
        (activity: any) =>
          activity.createdAt >= startTime && activity.createdAt < endTime
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
 * Generate AI Image for Cosmetic Item
 *
 * Creates an AI-generated image using OpenAI's DALL-E API based on the item's
 * predefined prompt. The generated image is used as the dog's avatar and background
 * when the item is equipped.
 *
 * Supports optional reference image for future image-to-image capabilities.
 *
 * @param {Object} args - Arguments object
 * @param {Id<"cosmetic_items">} args.itemId - The cosmetic item's ID
 * @param {string} args.dogName - The dog's name for personalization
 * @param {string} args.referenceImageUrl - Optional reference image URL for modification
 * @returns {string} Generated image URL
 * @throws {Error} If OPENAI_API_KEY is not configured, item not found, or API request fails
 */
export const generateItemImage = action({
  args: {
    itemId: v.id("cosmetic_items"),
    dogName: v.string(),
    referenceImageUrl: v.optional(v.string()), // Optional reference image (deprecated - always uses mage_bg)
  },
  handler: async (ctx, args): Promise<string> => {
    const apiKey = process.env.OPENAI_API_KEY;

    console.log({ referenceImageUrl: args.referenceImageUrl });
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY not configured. Please add it to your Convex environment variables."
      );
    }

    try {
      // Query cosmetic_items to get item details
      const item = await ctx.runQuery(api.queries.getCosmeticItem, {
        itemId: args.itemId,
      });

      if (!item) {
        throw new Error("Cosmetic item not found");
      }

      // SAFEGUARD: Moon items NEVER generate AI images - they always use mage_bg/mage_avatar
      // This should never be called for moon items, but adding as a safety check
      if (item.itemType === "moon") {
        // DEBUG: Alert if moon item somehow reaches generation (should never happen)
        console.error(
          "🚨 ERROR: Moon item tried to generate AI image! This should never happen!"
        );
        throw new Error(
          "Moon items do not use AI-generated images. They always use mage_bg/mage_avatar."
        );
      }

      // Map item types to element descriptions for prompt building
      const elementMap: Record<
        string,
        { element: string; colors: string; energy: string }
      > = {
        fire: {
          element: "fire",
          colors: "red, orange, and yellow",
          energy: "flaming",
        },
        water: {
          element: "water",
          colors: "blue, cyan, and white",
          energy: "flowing water",
        },
        grass: {
          element: "nature",
          colors: "green, brown, and earth tones",
          energy: "vital",
        },
        sun: {
          element: "solar",
          colors: "gold, yellow, and white",
          energy: "radiant",
        },
        ground: {
          element: "earth",
          colors: "brown, tan, and ochre",
          energy: "grounded",
        },
        moon: {
          element: "lunar",
          colors: "silver, blue, and white",
          energy: "mystical",
        },
      };

      // Get element info based on item type, with fallback
      const elementInfo = elementMap[item.itemType] || {
        element: item.itemType || "magical",
        colors: "vibrant",
        energy: "energetic",
      };

      // Build detailed prompt using the Lightning Monk template structure
      // Always uses dark background and references mage_bg style
      // If custom aiPrompt exists, use it; otherwise build from template
      let fullPrompt: string;

      // Reference to mage_bg style - dark mystical background with atmospheric lighting
      const mageBgStyleReference =
        "The art style should match the dark, atmospheric, mystical background style of a mage's realm - with deep shadows, subtle magical glows, and a sense of fantasy adventure. The background should be **dark dark dark gray** with subtle atmospheric effects.";

      if (item.aiPrompt) {
        // Use custom prompt if provided, but enhance it with the detailed structure
        fullPrompt = `A full-body digital illustration of a Corgi dog dressed as a **${item.name}** character from a role-playing game. It should look and feel like an RPG game art. It should be super serious and cool. ${item.aiPrompt}. The Corgi is standing upright, in a highly detailed, fantasy art style. The character's outfit and accessories are glowing with **${elementInfo.energy}** energy and symbols. The colors should primarily be **${elementInfo.colors}** to represent the ${elementInfo.element} element. ${mageBgStyleReference} The Corgi's feet should be positioned very close to the bottom of the image frame.`;
      } else {
        // Build prompt from template
        const characterClass =
          item.itemType === "fire"
            ? "Warrior"
            : item.itemType === "water"
              ? "Mage"
              : item.itemType === "grass"
                ? "Druid"
                : item.itemType === "sun"
                  ? "Paladin"
                  : item.itemType === "ground"
                    ? "Monk"
                    : item.itemType === "moon"
                      ? "Mystic"
                      : "Adventurer";

        fullPrompt = `A full-body digital illustration of a cute Corgi dog dressed as a **${characterClass}** character from a role-playing game. The Corgi is standing upright, in a highly detailed, fantasy art style. The character wears ${item.description.toLowerCase()}, with outfit and accessories glowing with **${elementInfo.energy}** energy and symbols. The colors should primarily be **${elementInfo.colors}** to represent the ${elementInfo.element} element. ${mageBgStyleReference} The Corgi's feet should be positioned very close to the bottom of the image frame.`;
      }

      // Always use mage_bg.webp as reference image for consistent style
      // (Note: DALL-E 3 doesn't support image-to-image directly, but we can reference it in the prompt)
      const referenceImageUrl =
        "https://corgiquest.netlify.app/images/backgrounds/mage_bg.webp";
      fullPrompt = `${fullPrompt} The image should be inspired by and similar in style to the reference image at ${referenceImageUrl}, matching the dark, atmospheric, mystical background style with deep shadows, subtle magical glows, and a sense of fantasy adventure.`;

      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey,
      });

      // Call OpenAI DALL-E API with 30-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      let response;
      try {
        response = await openai.images.generate({
          model: "dall-e-3",
          prompt: fullPrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        });
      } catch (generateError) {
        clearTimeout(timeoutId);
        if (
          generateError instanceof Error &&
          generateError.name === "AbortError"
        ) {
          throw new Error(
            "Image generation timed out after 30 seconds. Please try again."
          );
        }
        throw generateError;
      } finally {
        clearTimeout(timeoutId);
      }

      // Return generated image URL on success
      if (!response.data?.[0]?.url) {
        throw new Error("Invalid response from DALL-E: missing image URL");
      }

      const openaiImageUrl = response.data[0].url;

      // Step 2: Download, compress, convert to WebP, and save to Convex storage
      try {
        // Download the image from OpenAI
        const imageResponse = await fetch(openaiImageUrl);
        if (!imageResponse.ok) {
          throw new Error(
            `Failed to download image: ${imageResponse.statusText}`
          );
        }

        // Get image as buffer
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

        // Convert to WebP and compress using sharp
        // Import sharp dynamically to avoid bundling issues
        const sharp = await import("sharp");
        const webpBuffer = await sharp
          .default(imageBuffer)
          .webp({
            quality: 80, // Good balance between quality and file size
            effort: 6, // Compression effort (0-6, higher = better compression but slower)
          })
          .toBuffer();

        // Upload to Convex storage
        // Convert buffer to Uint8Array, then to Blob for Convex storage
        const uint8Array = new Uint8Array(webpBuffer);
        const blob = new Blob([uint8Array], { type: "image/webp" });
        const storageId = await ctx.storage.store(blob);

        // Get the URL for the stored file
        const storageUrl = await ctx.storage.getUrl(storageId);

        if (!storageUrl) {
          throw new Error("Failed to get storage URL from Convex");
        }

        // Return the Convex storage URL instead of OpenAI URL
        return storageUrl;
      } catch (storageError) {
        // If storage fails, log error but return OpenAI URL as fallback
        console.error("Failed to save image to storage:", storageError);
        // Return OpenAI URL as fallback
        return openaiImageUrl;
      }
    } catch (error) {
      // Throw descriptive errors on failure
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

        // Handle OpenAI-specific errors
        if (error.message.includes("rate limit")) {
          throw new Error(
            "Rate limit exceeded. Please wait a moment and try again."
          );
        }

        if (
          error.message.includes("authentication") ||
          error.message.includes("401")
        ) {
          throw new Error(
            "OpenAI API authentication failed. Please check your API key configuration."
          );
        }

        if (error.message.includes("content_policy_violation")) {
          throw new Error(
            "Image generation failed due to content policy. Please try a different item."
          );
        }

        // Re-throw with original message if it's already user-friendly
        if (
          error.message.includes("not configured") ||
          error.message.includes("not found") ||
          error.message.includes("timed out")
        ) {
          throw error;
        }

        // Generic error with details
        throw new Error(`Failed to generate image: ${error.message}`);
      }
      throw new Error("Failed to generate image: Unknown error");
    }
  },
});

/**
 * Process Training Mode Activity with AI
 *
 * Takes a natural language activity description and uses OpenAI to:
 * 1. Parse the activity details (name, duration, etc.)
 * 2. Determine appropriate stat gains
 * 3. Calculate physical/mental points
 *
 * @param {Object} args - Arguments object
 * @param {string} args.activityDescription - Natural language description (e.g., "walked for 10 minutes")
 * @returns {Object} Parsed activity with stat gains
 * @throws {Error} If OPENAI_API_KEY is not configured or parsing fails
 */
export const processTrainingActivity = action({
  args: {
    activityDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY not configured. Please add it to your Convex environment variables."
      );
    }

    try {
      const systemPrompt = `You are an AI assistant that parses dog training activities and assigns appropriate stat gains.

Given a natural language description of an activity, you must:
1. Extract the activity name and duration (if mentioned)
2. Assign stat gains based on the activity type:
   - INT (Intelligence): Training, learning tricks, puzzle toys
   - PHY (Physical): Walking, running, playing fetch, swimming
   - IMP (Impulse Control): Staying calm, ignoring distractions, waiting
   - SOC (Social): Meeting other dogs, greeting people politely

3. Calculate points:
   - Physical points: For physical activities (walking, running, playing)
   - Mental points: For mental activities (training, puzzles, calm behavior)

Return a JSON object with this structure:
{
  "activityName": "Brief activity name (e.g., 'Morning Walk')",
  "durationMinutes": number or null,
  "statGains": [
    { "statType": "PHY", "xpAmount": 50 },
    { "statType": "INT", "xpAmount": 20 }
  ],
  "physicalPoints": number (0-100),
  "mentalPoints": number (0-100)
}

Guidelines:
- Stat XP: 10-100 per stat (higher for longer/more intense activities)
- Physical points: 10-100 for physical activities, 0 otherwise
- Mental points: 10-100 for mental activities, 0 otherwise
- Most activities should give 1-2 stats, not all 4`;

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
              { role: "user", content: args.activityDescription },
            ],
            temperature: 0.3,
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

      const parsed = JSON.parse(data.choices[0].message.content);

      return {
        activityName: parsed.activityName || "Activity",
        durationMinutes: parsed.durationMinutes || undefined,
        statGains: parsed.statGains || [],
        physicalPoints: parsed.physicalPoints || 0,
        mentalPoints: parsed.mentalPoints || 0,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to process activity: ${error.message}`);
      }
      throw new Error("Failed to process activity: Unknown error");
    }
  },
});

/**
 * Parse Dog Description with AI
 *
 * Takes a natural language dog description and uses OpenAI GPT-4 to extract:
 * - Dog name
 * - Breed
 * - Personality traits
 * - Initial stat emphasis (PHY, INT, IMP, SOC)
 * - Personalized starter quest
 *
 * @param {Object} args - Arguments object
 * @param {string} args.transcript - Natural language dog description
 * @returns {Object} Parsed dog data with all required fields
 * @throws {Error} If OPENAI_API_KEY is not configured or parsing fails
 */
export const parseDogDescription = action({
  args: {
    transcript: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY not configured. Please add it to your Convex environment variables."
      );
    }

    try {
      const systemPrompt = `You are an AI assistant that analyzes dog descriptions and extracts structured data for a dog training RPG app.

Given a natural language description of a dog, extract:
1. Dog name
2. Breed (be specific, e.g., "Golden Retriever" not just "retriever")
3. Personality traits (3-4 traits like "friendly", "energetic", "smart", "calm", "shy", "reactive", etc.)
4. Initial stat emphasis (PHY, INT, IMP, SOC) - base stats at 5, adjust +2 or -2 based on traits
5. A personalized starter quest based on the dog's weakest stat

Stat guidelines:
- PHY (Physical): Energetic, active, playful dogs get +2
- INT (Intelligence): Smart, clever, quick learner dogs get +2
- IMP (Impulse Control): Calm, patient dogs get +2; distractible/reactive dogs get -2
- SOC (Social): Friendly, social dogs get +2; shy/anxious dogs get -1

Quest types by weakest stat:
- PHY: "Active Play Session" - 15 min active play, 5 reps
- INT: "Basic Commands" - Practice sit/stay/come, 10 reps
- IMP: "Impulse Control Training" - Wait calmly before meals, 5 reps
- SOC: "Socialization Walk" - Calm walk with polite greetings, 3 reps

Return JSON:
{
  "name": "Dog name",
  "breed": "Specific breed",
  "traits": ["trait1", "trait2", "trait3"],
  "initialStatEmphasis": {
    "PHY": 5,
    "INT": 5,
    "IMP": 5,
    "SOC": 5
  },
  "starterQuest": {
    "name": "Quest name",
    "description": "Quest description",
    "targetStat": "PHY|INT|IMP|SOC",
    "reps": number
  }
}`;

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
              { role: "user", content: args.transcript },
            ],
            temperature: 0.3,
            response_format: { type: "json_object" },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
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
        }
        throw new Error(
          `OpenAI API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new Error("Invalid response from OpenAI: missing content");
      }

      const parsed = JSON.parse(data.choices[0].message.content);

      // Validate required fields
      if (!parsed.name || !parsed.breed || !parsed.traits) {
        throw new Error(
          "Could not extract all required information. Please provide more details about your dog's name, breed, and personality."
        );
      }

      return {
        name: parsed.name,
        breed: parsed.breed,
        traits: parsed.traits,
        initialStatEmphasis: parsed.initialStatEmphasis || {
          PHY: 5,
          INT: 5,
          IMP: 5,
          SOC: 5,
        },
        starterQuest: parsed.starterQuest || {
          name: "Basic Commands",
          description: "Practice sit, stay, and come commands to build focus",
          targetStat: "INT",
          reps: 10,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("fetch failed") ||
          error.message.includes("network") ||
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("ETIMEDOUT")
        ) {
          throw new Error(
            "Network error. Please check your connection and try again."
          );
        }
        if (
          error.message.includes("Rate limit") ||
          error.message.includes("authentication") ||
          error.message.includes("temporarily unavailable") ||
          error.message.includes("not configured") ||
          error.message.includes("Could not extract")
        ) {
          throw error;
        }
        throw new Error(`Failed to parse dog description: ${error.message}`);
      }
      throw new Error("Failed to parse dog description: Unknown error");
    }
  },
});

/**
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
