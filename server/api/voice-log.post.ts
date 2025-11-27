/**
 * Nitro API Route for Voice Log
 * POST /api/voice-log
 *
 * This is a Nitro API route that wraps the TanStack Start server function
 * to make it accessible as a REST endpoint for the VR app.
 */

import { defineEventHandler, readBody, getHeader, createError } from "h3";
import { api } from "../../convex/_generated/api";
import { convexHttpClient } from "../../src/lib/convexHttpClient";
import { ensureValidStatType } from "../../src/lib/vrValidation";
import {
  logRequest,
  logResponse,
  logError,
  createPerformanceTimer,
} from "../../src/lib/apiLogger";

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

export default defineEventHandler(async (event): Promise<VoiceLogResponse> => {
  const requestTimer = createPerformanceTimer("voice_log_request");

  try {
    // Log request (Requirements: 8.1)
    logRequest(
      event.node.req.method || "POST",
      event.node.req.url || "/api/voice-log"
    );

    // Validate Content-Type (Requirements: 6.4)
    const contentType = getHeader(event, "content-type");
    if (!contentType || !contentType.includes("application/json")) {
      logError(new Error("Invalid Content-Type"), {
        contentType,
        endpoint: "/api/voice-log",
      });
      throw createError({
        statusCode: 400,
        statusMessage: "Content-Type must be application/json",
        data: { code: "INVALID_CONTENT_TYPE" },
      });
    }

    // Parse request body
    const body = await readBody<VoiceLogRequest>(event);

    // Validate text field (Requirements: 5.5)
    if (!body.text || body.text.trim().length === 0) {
      logError(new Error("Empty transcript"), {
        endpoint: "/api/voice-log",
      });
      throw createError({
        statusCode: 400,
        statusMessage: "Text is required and cannot be empty",
        data: { code: "EMPTY_TRANSCRIPT" },
      });
    }

    // Get first dog and user (Requirements: 4.2)
    const households = await convexHttpClient.query(
      api.queries.getHouseholds,
      {}
    );
    if (!households || households.length === 0) {
      logError(new Error("No households found"), {
        endpoint: "/api/voice-log",
      });
      throw createError({
        statusCode: 404,
        statusMessage: "No dogs found in system",
        data: { code: "NO_DOGS" },
      });
    }

    const firstHousehold = households[0];
    const dogs = await convexHttpClient.query(api.queries.getDogs, {
      householdId: firstHousehold._id,
    });

    if (!dogs || dogs.length === 0) {
      logError(new Error("No dogs in household"), {
        householdId: firstHousehold._id,
        endpoint: "/api/voice-log",
      });
      throw createError({
        statusCode: 404,
        statusMessage: "No dogs found in system",
        data: { code: "NO_DOGS" },
      });
    }

    const dog = dogs[0];

    // Get first user in household
    const users = await convexHttpClient.query(api.queries.getUsers, {
      householdId: firstHousehold._id,
    });

    if (!users || users.length === 0) {
      logError(new Error("No users in household"), {
        householdId: firstHousehold._id,
        endpoint: "/api/voice-log",
      });
      throw createError({
        statusCode: 404,
        statusMessage: "No users found in household",
        data: { code: "NO_USERS" },
      });
    }

    const user = users[0];

    // Call AI parsing action with 30-second timeout (Requirements: 2.1, 2.2)
    const parsingTimer = createPerformanceTimer("ai_parsing", {
      textLength: body.text.length,
    });

    const parsingTimeout = 30000; // 30 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Parsing timeout")), parsingTimeout);
    });

    let parsed: any;
    try {
      parsed = await Promise.race([
        convexHttpClient.action(api.actions.processTrainingActivity, {
          activityDescription: body.text,
        }),
        timeoutPromise,
      ]);
      parsingTimer();
    } catch (error: any) {
      parsingTimer();
      if (error.message === "Parsing timeout") {
        logError(error, {
          endpoint: "/api/voice-log",
          transcript: body.text,
        });
        throw createError({
          statusCode: 503,
          statusMessage: "AI parsing exceeded 30 seconds",
          data: { code: "PARSING_TIMEOUT" },
        });
      }
      logError(error, {
        endpoint: "/api/voice-log",
        transcript: body.text,
      });
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to parse activity",
        data: { code: "PARSING_FAILED" },
      });
    }

    // Log activity mutation (Requirements: 2.3, 2.4)
    let result: any;
    try {
      result = await convexHttpClient.mutation(api.mutations.logActivity, {
        dogId: dog._id,
        userId: user._id,
        activityName: parsed.activityName,
        description: body.text,
        durationMinutes: parsed.durationMinutes,
        statGains: parsed.statGains,
        physicalPoints: parsed.physicalPoints,
        mentalPoints: parsed.mentalPoints,
      });
    } catch (error: any) {
      logError(error, {
        endpoint: "/api/voice-log",
        transcript: body.text,
        parsed,
      });
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to log activity",
        data: { code: "LOG_ACTIVITY_FAILED" },
      });
    }

    // Format response (Requirements: 2.5, 7.2)
    const response: VoiceLogResponse = {
      success: true,
      activityId: result.activityId,
      xpAwarded: parsed.statGains.map((sg: any) => ({
        stat: ensureValidStatType(sg.statType),
        amount: sg.xpAmount,
      })),
    };

    const duration = requestTimer();
    logResponse(200, duration);

    return response;
  } catch (error: any) {
    const duration = requestTimer();
    logError(error, {
      endpoint: "/api/voice-log",
    });

    if (error.statusCode) {
      throw error;
    }

    return {
      success: false,
      error: error.message || "Internal server error",
    };
  }
});
