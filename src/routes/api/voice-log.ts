/**
 * TanStack Start Server Function for Voice Log
 *
 * POST /api/voice-log
 *
 * Processes voice transcripts from VR training sessions:
 * - Parses natural language using AI (processTrainingActivity action)
 * - Creates activity record with stat gains
 * - Updates XP, goals, and streak
 * - Returns success response with XP breakdown
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.3, 5.4, 6.4, 7.2
 */

import { createServerFn } from "@tanstack/react-start";
import { api } from "../../../convex/_generated/api";
import { convexHttpClient } from "../../lib/convexHttpClient";
import { ensureValidStatType } from "../../lib/vrValidation";
import {
  logRequest,
  logResponse,
  logError,
  logVoiceParsingFailure,
  createPerformanceTimer,
} from "../../lib/apiLogger";

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

export const postVoiceLog = createServerFn({
  method: "POST",
}).handler(async (ctx: any): Promise<VoiceLogResponse> => {
  const requestStartTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    // Step 1: Parse request body
    const body = await ctx.request.json();
    const { text, sessionContext } = body as VoiceLogRequest;

    // Log incoming request (Requirements: 8.1)
    logRequest({
      method: "POST",
      path: "/api/voice-log",
      timestamp,
      textLength: text?.length,
      hasSessionContext: !!sessionContext,
    });

    // Step 2: Validate Content-Type header
    const contentType = ctx.request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Response(
        JSON.stringify({
          success: false,
          error: "Content-Type must be application/json",
          code: "INVALID_CONTENT_TYPE",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 3: Validate input - empty transcript
    if (!text || text.trim().length === 0) {
      const responseTimeMs = Date.now() - requestStartTime;
      logResponse({
        statusCode: 400,
        responseTimeMs,
        timestamp: new Date().toISOString(),
      });

      throw new Response(
        JSON.stringify({
          success: false,
          error: "Text is required and cannot be empty",
          code: "EMPTY_TRANSCRIPT",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 4: Call AI parsing action with 30-second timeout
    const parseTimeout = 30000; // 30 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("AI parsing timeout")), parseTimeout);
    });

    // Create performance timer for AI parsing (Requirements: 8.5)
    const parseTimer = createPerformanceTimer("ai_parsing", {
      textLength: text.length,
    });

    let parsed: {
      activityName: string;
      durationMinutes?: number;
      statGains: Array<{
        statType: "INT" | "PHY" | "IMP" | "SOC";
        xpAmount: number;
      }>;
      physicalPoints: number;
      mentalPoints: number;
    };
    try {
      parsed = (await Promise.race([
        convexHttpClient.action(api.actions.processTrainingActivity, {
          activityDescription: text,
        }),
        timeoutPromise,
      ])) as typeof parsed;

      // Log parsing execution time (Requirements: 8.5)
      parseTimer();
    } catch (parseError) {
      // Log voice parsing failure with transcript (Requirements: 8.4)
      logVoiceParsingFailure(text, parseError);
      // Handle AI parsing timeout (Requirements: 5.3, 5.4)
      if (
        parseError instanceof Error &&
        parseError.message === "AI parsing timeout"
      ) {
        const responseTimeMs = Date.now() - requestStartTime;
        logResponse({
          statusCode: 503,
          responseTimeMs,
          timestamp: new Date().toISOString(),
        });

        throw new Response(
          JSON.stringify({
            success: false,
            error:
              "AI parsing timed out after 30 seconds. Please try again with a shorter description.",
            code: "PARSING_TIMEOUT",
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Handle other AI parsing failures (Requirements: 5.1, 5.3)
      const responseTimeMs = Date.now() - requestStartTime;
      logResponse({
        statusCode: 500,
        responseTimeMs,
        timestamp: new Date().toISOString(),
      });

      throw new Response(
        JSON.stringify({
          success: false,
          error:
            parseError instanceof Error
              ? `AI parsing failed: ${parseError.message}`
              : "AI parsing failed. Please try again.",
          code: "PARSING_FAILED",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 5: Get default dog ID and user ID (fallback to first)
    let dog;
    try {
      dog = await convexHttpClient.query(api.queries.getFirstDog, {});
      if (!dog) {
        throw new Error("No dog found");
      }
    } catch (error) {
      logError({
        error,
        context: {
          endpoint: "/api/voice-log",
          step: "get_dog",
        },
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined,
      });

      const responseTimeMs = Date.now() - requestStartTime;
      logResponse({
        statusCode: 404,
        responseTimeMs,
        timestamp: new Date().toISOString(),
      });

      throw new Response(
        JSON.stringify({
          success: false,
          error: "No dogs found in the system",
          code: "NO_DOGS",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get first user from household
    let user;
    try {
      const users = await convexHttpClient.query(
        api.queries.getHouseholdUsers,
        {
          householdId: dog.householdId,
        }
      );
      if (!users || users.length === 0) {
        throw new Error("No users found");
      }
      user = users[0];
    } catch (error) {
      logError({
        error,
        context: {
          endpoint: "/api/voice-log",
          step: "get_user",
          householdId: dog.householdId,
        },
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined,
      });

      const responseTimeMs = Date.now() - requestStartTime;
      logResponse({
        statusCode: 404,
        responseTimeMs,
        timestamp: new Date().toISOString(),
      });

      throw new Response(
        JSON.stringify({
          success: false,
          error: "No users found in the system",
          code: "NO_USERS",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 6: Log activity mutation
    let result;
    try {
      // Create performance timer for mutation (Requirements: 8.5)
      const mutationTimer = createPerformanceTimer("log_activity_mutation", {
        dogId: dog._id,
        activityName: parsed.activityName,
      });

      result = await convexHttpClient.mutation(api.mutations.logActivity, {
        dogId: dog._id,
        userId: user._id,
        activityName: parsed.activityName,
        description: text,
        durationMinutes: parsed.durationMinutes,
        statGains: parsed.statGains,
        physicalPoints: parsed.physicalPoints,
        mentalPoints: parsed.mentalPoints,
      });

      // Log mutation execution time (Requirements: 8.5)
      mutationTimer();
    } catch (error) {
      logError({
        error,
        context: {
          endpoint: "/api/voice-log",
          step: "log_activity",
          dogId: dog._id,
          userId: user._id,
          activityName: parsed.activityName,
        },
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined,
      });

      const responseTimeMs = Date.now() - requestStartTime;
      logResponse({
        statusCode: 500,
        responseTimeMs,
        timestamp: new Date().toISOString(),
      });

      throw new Response(
        JSON.stringify({
          success: false,
          error:
            error instanceof Error
              ? `Failed to log activity: ${error.message}`
              : "Failed to log activity. Please try again.",
          code: "LOG_ACTIVITY_FAILED",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 7: Format response matching VoiceLogResponse Swift struct
    const response: VoiceLogResponse = {
      success: true,
      activityId: result.activityId,
      xpAwarded: parsed.statGains.map((sg: any) => ({
        stat: ensureValidStatType(sg.statType), // Validate three-letter codes (PHY, INT, IMP, SOC)
        amount: sg.xpAmount,
      })),
    };

    // Log successful response (Requirements: 8.3)
    const responseTimeMs = Date.now() - requestStartTime;
    logResponse({
      statusCode: 200,
      responseTimeMs,
      timestamp: new Date().toISOString(),
    });

    return response;
  } catch (error) {
    // Handle Response errors (already formatted)
    if (error instanceof Response) {
      throw error;
    }

    // Handle unexpected errors (Requirements: 8.2)
    logError({
      error,
      context: {
        endpoint: "/api/voice-log",
        step: "unexpected",
      },
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
    });

    const responseTimeMs = Date.now() - requestStartTime;
    logResponse({
      statusCode: 500,
      responseTimeMs,
      timestamp: new Date().toISOString(),
    });

    throw new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        code: "INTERNAL_ERROR",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
