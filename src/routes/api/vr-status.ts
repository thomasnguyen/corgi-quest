/**
 * TanStack Start Server Function for VR Status
 *
 * GET /api/vr-status
 *
 * Returns complete dog training status for VR display including:
 * - Dog name and level
 * - All four stats (PHY, INT, IMP, SOC) with XP progress
 * - Today's goals (physical/mental progress and streak)
 * - Recent activities (last 5)
 * - Weekly XP totals (last 7 days)
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.2, 6.3, 7.1
 */

import { createServerFn } from "@tanstack/react-start";
import { api } from "../../../convex/_generated/api";
import { convexHttpClient } from "../../lib/convexHttpClient";
import { ensureMilliseconds } from "../../lib/utils";
import { ensureValidStatType } from "../../lib/vrValidation";
import {
  logRequest,
  logResponse,
  logError,
  createPerformanceTimer,
} from "../../lib/apiLogger";

interface VRDogStatus {
  dogName: string;
  level: number;
  overallXp: number;
  xpToNextLevel: number;
  stats: Array<{
    type: string;
    name: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    xpProgress: number;
  }>;
  goals: {
    physical: { current: number; target: number };
    mental: { current: number; target: number };
    streak: number;
  };
  recentActivities: Array<{
    id: string;
    name: string;
    xpBreakdown: Array<{ stat: string; amount: number }>;
    timestamp: number; // milliseconds since epoch
    loggedBy: string;
  }>;
  weeklyXP: Array<{
    day: string; // "Mon", "Tue", etc.
    total: number;
    date: number; // milliseconds since epoch
  }>;
}

export const getVRStatus = createServerFn({
  method: "GET",
}).handler(async (ctx: any): Promise<VRDogStatus> => {
  const requestStartTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    // Parse query parameters for dogId from the URL
    // In TanStack Start, GET params come through the context
    const dogIdParam = ctx.data?.dogId;

    // Log incoming request (Requirements: 8.1)
    logRequest({
      method: "GET",
      path: "/api/vr-status",
      timestamp,
      dogId: dogIdParam,
    });

    let dog;

    if (dogIdParam) {
      // If dogId provided, try to get that specific dog
      try {
        dog = await convexHttpClient.query(api.queries.getDogProfile, {
          dogId: dogIdParam as any,
        });
        if (!dog) {
          throw new Error("Dog not found");
        }
        // Extract just the dog object from the profile
        dog = dog.dog;
      } catch (error) {
        throw new Error(`Invalid dog ID: ${dogIdParam}`);
      }
    } else {
      // Fallback to first dog if no dogId provided
      dog = await convexHttpClient.query(api.queries.getFirstDog, {});
      if (!dog) {
        throw new Error("No dog found");
      }
    }

    // Execute all queries in parallel with 5-second timeout
    const queryTimeout = 5000; // 5 seconds

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Query timeout")), queryTimeout);
    });

    // Create performance timer for parallel queries (Requirements: 8.5)
    const queryTimer = createPerformanceTimer("convex_parallel_queries", {
      dogId: dog._id,
      queryCount: 5,
    });

    // Use Promise.allSettled for graceful degradation - continue with partial data if some queries fail
    const results = (await Promise.race([
      Promise.allSettled([
        convexHttpClient.query(api.queries.getDogProfile, { dogId: dog._id }),
        convexHttpClient.query(api.queries.getDailyGoals, { dogId: dog._id }),
        convexHttpClient.query(api.queries.getStreak, { dogId: dog._id }),
        convexHttpClient.query(api.queries.getActivityFeed, {
          dogId: dog._id,
        }),
        convexHttpClient.query(api.queries.getOverallStatsData, {
          dogId: dog._id,
        }),
      ]),
      timeoutPromise,
    ])) as PromiseSettledResult<any>[];

    // Log query execution time (Requirements: 8.5)
    queryTimer();

    // Extract results with fallbacks for failed queries
    const dogProfile =
      results[0].status === "fulfilled" ? results[0].value : null;
    const dailyGoals =
      results[1].status === "fulfilled" ? results[1].value : null;
    const streak = results[2].status === "fulfilled" ? results[2].value : null;
    const activityFeed =
      results[3].status === "fulfilled" ? results[3].value : [];
    const overallStats =
      results[4].status === "fulfilled"
        ? results[4].value
        : { dailyXpData: [] };

    // Dog profile is critical - must have it
    if (!dogProfile) {
      throw new Error("Dog profile not found");
    }

    const recentActivities = activityFeed.slice(0, 5);

    // Get last 7 days of XP data
    const last7Days = overallStats.dailyXpData.slice(-7);

    // Map day names
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyXP = last7Days.map((day: any) => {
      const date = new Date(day.date);
      return {
        day: dayNames[date.getDay()],
        total: day.xp,
        date: ensureMilliseconds(day.date), // Ensure timestamp in milliseconds since epoch
      };
    });

    // Map stat names
    const statNames: Record<string, string> = {
      INT: "Intelligence",
      PHY: "Physical",
      IMP: "Impulse Control",
      SOC: "Socialization",
    };

    // Transform data to VRDogStatus format
    const vrStatus: VRDogStatus = {
      dogName: dog.name,
      level: dog.overallLevel,
      overallXp: dog.overallXp,
      xpToNextLevel: dog.xpToNextLevel,
      stats: dogProfile.stats.map((stat: any) => {
        // Validate and ensure stat type is correct format
        const validatedStatType = ensureValidStatType(stat.statType);
        return {
          type: validatedStatType, // Use validated three-letter codes (PHY, INT, IMP, SOC)
          name: statNames[validatedStatType] || validatedStatType,
          level: stat.level,
          xp: stat.xp,
          xpToNextLevel: stat.xpToNextLevel,
          xpProgress: stat.xpToNextLevel > 0 ? stat.xp / stat.xpToNextLevel : 0, // Calculate progress as 0.0 to 1.0
        };
      }),
      goals: {
        physical: {
          current: dailyGoals?.physicalPoints || 0,
          target: dailyGoals?.physicalGoal || 100,
        },
        mental: {
          current: dailyGoals?.mentalPoints || 0,
          target: dailyGoals?.mentalGoal || 100,
        },
        streak: streak?.currentStreak || 0,
      },
      recentActivities: recentActivities.map((activity: any) => ({
        id: activity._id,
        name: activity.activityName,
        xpBreakdown: activity.statGains.map((sg: any) => ({
          stat: ensureValidStatType(sg.statType), // Validate three-letter codes
          amount: sg.xpAmount,
        })),
        timestamp: ensureMilliseconds(activity.createdAt), // Ensure milliseconds since epoch
        loggedBy: activity.userName || "Unknown",
      })),
      weeklyXP,
    };

    // Log successful response (Requirements: 8.3)
    const responseTimeMs = Date.now() - requestStartTime;
    logResponse({
      statusCode: 200,
      responseTimeMs,
      timestamp: new Date().toISOString(),
    });

    return vrStatus;
  } catch (error) {
    // Log error with context (Requirements: 8.2)
    logError({
      error,
      context: {
        endpoint: "/api/vr-status",
        dogId: ctx.data?.dogId,
      },
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Handle specific error cases
    if (error instanceof Error) {
      // Invalid dog ID - return 404
      if (
        error.message.includes("Invalid dog ID") ||
        error.message === "Dog not found"
      ) {
        const responseTimeMs = Date.now() - requestStartTime;
        logResponse({
          statusCode: 404,
          responseTimeMs,
          timestamp: new Date().toISOString(),
        });

        throw new Response(
          JSON.stringify({
            error: error.message,
            code: "DOG_NOT_FOUND",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Timeout error - return 503
      if (error.message === "Query timeout") {
        const responseTimeMs = Date.now() - requestStartTime;
        logResponse({
          statusCode: 503,
          responseTimeMs,
          timestamp: new Date().toISOString(),
        });

        throw new Response(
          JSON.stringify({
            error: "Request timed out. Please try again.",
            code: "TIMEOUT",
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // No dog found - return 404
      if (error.message === "No dog found") {
        const responseTimeMs = Date.now() - requestStartTime;
        logResponse({
          statusCode: 404,
          responseTimeMs,
          timestamp: new Date().toISOString(),
        });

        throw new Response(
          JSON.stringify({
            error: "No dogs found in the system",
            code: "NO_DOGS",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Generic server error - return 500
    const responseTimeMs = Date.now() - requestStartTime;
    logResponse({
      statusCode: 500,
      responseTimeMs,
      timestamp: new Date().toISOString(),
    });

    throw new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Failed to fetch VR status",
        code: "INTERNAL_ERROR",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
