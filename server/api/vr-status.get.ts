/**
 * Nitro API Route for VR Status
 * GET /api/vr-status
 *
 * This is a Nitro API route that wraps the TanStack Start server function
 * to make it accessible as a REST endpoint for the VR app.
 */

import { defineEventHandler, getQuery, createError } from "h3";
import { api } from "../../convex/_generated/api";
import { convexHttpClient } from "../../src/lib/convexHttpClient";
import { ensureMilliseconds } from "../../src/lib/utils";
import { ensureValidStatType } from "../../src/lib/vrValidation";
import {
  logRequest,
  logResponse,
  logError,
  createPerformanceTimer,
} from "../../src/lib/apiLogger";

interface VRDogStatus {
  dogName: string;
  level: number;
  overallXp: number;
  xpToNextLevel: number;
  stats: Array<{
    type: "PHY" | "INT" | "IMP" | "SOC";
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
    timestamp: number;
    loggedBy: string;
  }>;
  weeklyXP: Array<{
    day: string;
    total: number;
    date: number;
  }>;
}

export default defineEventHandler(async (event): Promise<VRDogStatus> => {
  const requestTimer = createPerformanceTimer("vr_status_request");

  try {
    // Log request (Requirements: 8.1)
    logRequest(
      event.node.req.method || "GET",
      event.node.req.url || "/api/vr-status"
    );

    // Extract dogId from query params
    const query = getQuery(event);
    const dogId = query.dogId as string | undefined;

    // Get first dog if no dogId provided (Requirements: 4.2)
    let dog: any;
    if (dogId) {
      // Validate dog exists
      dog = await convexHttpClient.query(api.queries.getDog, { dogId });
      if (!dog) {
        logError(new Error("Dog not found"), {
          dogId,
          endpoint: "/api/vr-status",
        });
        throw createError({
          statusCode: 404,
          statusMessage: "Dog not found",
          data: { code: "DOG_NOT_FOUND" },
        });
      }
    } else {
      // Get first dog as fallback
      const households = await convexHttpClient.query(
        api.queries.getHouseholds,
        {}
      );
      if (!households || households.length === 0) {
        logError(new Error("No households found"), {
          endpoint: "/api/vr-status",
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
          endpoint: "/api/vr-status",
        });
        throw createError({
          statusCode: 404,
          statusMessage: "No dogs found in system",
          data: { code: "NO_DOGS" },
        });
      }

      dog = dogs[0];
    }

    // Execute all queries in parallel with 5-second timeout
    const queryTimeout = 5000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Query timeout")), queryTimeout);
    });

    const queryTimer = createPerformanceTimer("convex_parallel_queries", {
      dogId: dog._id,
      queryCount: 5,
    });

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

    queryTimer();

    // Extract results with fallbacks
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

    if (!dogProfile) {
      throw new Error("Dog profile not found");
    }

    // Transform to VR format
    const response: VRDogStatus = {
      dogName: dogProfile.dog.name,
      level: dogProfile.dog.overallLevel,
      overallXp: dogProfile.dog.overallXp,
      xpToNextLevel: dogProfile.dog.xpToNextLevel,
      stats: dogProfile.stats.map((stat: any) => ({
        type: ensureValidStatType(stat.type),
        name: stat.name,
        level: stat.level,
        xp: stat.xp,
        xpToNextLevel: stat.xpToNextLevel,
        xpProgress: stat.xp / stat.xpToNextLevel,
      })),
      goals: {
        physical: {
          current: dailyGoals?.physicalProgress || 0,
          target: dailyGoals?.physicalGoal || 60,
        },
        mental: {
          current: dailyGoals?.mentalProgress || 0,
          target: dailyGoals?.mentalGoal || 30,
        },
        streak: streak?.currentStreak || 0,
      },
      recentActivities: activityFeed.slice(0, 5).map((activity: any) => ({
        id: activity._id,
        name: activity.activityName,
        xpBreakdown: activity.statGains.map((gain: any) => ({
          stat: ensureValidStatType(gain.statType),
          amount: gain.xpAmount,
        })),
        timestamp: ensureMilliseconds(activity._creationTime),
        loggedBy: activity.loggedBy || "Mobile",
      })),
      weeklyXP: (overallStats.dailyXpData || []).slice(-7).map((day: any) => ({
        day: new Date(day.date).toLocaleDateString("en-US", {
          weekday: "short",
        }),
        total: day.totalXp,
        date: ensureMilliseconds(day.date),
      })),
    };

    const duration = requestTimer();
    logResponse(200, duration);

    return response;
  } catch (error: any) {
    const duration = requestTimer();
    logError(error, {
      endpoint: "/api/vr-status",
      dogId: query?.dogId,
    });

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error",
      data: { code: "INTERNAL_ERROR" },
    });
  }
});
