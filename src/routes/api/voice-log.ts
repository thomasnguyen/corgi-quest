/**
 * TanStack Start Server Function for Voice Log
 *
 * POST /api/voice-log
 *
 * Accepts voice transcript, parses it with Claude (via Convex action),
 * creates activity, awards XP, and returns success status.
 *
 * Requirements: 9.2, 6.1
 */

import { createServerFn } from "@tanstack/react-start";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

// Initialize Convex client for server-side queries
const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

if (!convexUrl) {
  throw new Error("CONVEX_URL not configured");
}

const convex = new ConvexHttpClient(convexUrl);

interface VoiceLogRequest {
  text: string;
  sessionContext?: {
    activity: string;
    repsCompleted: number;
  };
}

interface VoiceLogResponse {
  success: boolean;
  activityId?: string;
  xpAwarded?: Array<{ stat: string; amount: number }>;
  error?: string;
}

export const submitVoiceLog = createServerFn({
  method: "POST",
})
  .inputValidator((data: VoiceLogRequest) => {
    if (!data || typeof data.text !== "string" || data.text.trim() === "") {
      throw new Error("Invalid request: text is required");
    }
    return data;
  })
  .handler(async ({ data }): Promise<VoiceLogResponse> => {
    try {
      // Get the first dog (demo purposes)
      const dog = await convex.query(api.queries.getFirstDog, {});

      if (!dog) {
        return {
          success: false,
          error: "No dog found",
        };
      }

      // Get the first user in the household
      const household = await convex.query(api.queries.getFirstUser, {
        householdId: dog.householdId,
      });

      if (!household) {
        return {
          success: false,
          error: "No user found",
        };
      }

      // Call Convex action to process the activity with AI
      const parsedActivity = await convex.action(
        api.actions.processTrainingActivity,
        {
          activityDescription: data.text,
        }
      );

      // Log the activity using the existing mutation
      const result = await convex.mutation(api.mutations.logActivity, {
        dogId: dog._id,
        userId: household._id,
        activityName: parsedActivity.activityName,
        description: data.text,
        durationMinutes: parsedActivity.durationMinutes,
        statGains: parsedActivity.statGains,
        physicalPoints: parsedActivity.physicalPoints,
        mentalPoints: parsedActivity.mentalPoints,
      });

      return {
        success: result.success,
        activityId: result.activityId,
        xpAwarded: parsedActivity.statGains.map(
          (sg: { statType: string; xpAmount: number }) => ({
            stat: sg.statType,
            amount: sg.xpAmount,
          })
        ),
      };
    } catch (error) {
      console.error("Failed to submit voice log:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to submit voice log",
      };
    }
  });
