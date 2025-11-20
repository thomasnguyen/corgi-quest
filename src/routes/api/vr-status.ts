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
 * Requirements: 9.1, 7.1
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

interface VRDogStatus {
  dogName: string;
  level: number;
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
    timestamp: number;
    loggedBy: string;
  }>;
  weeklyXP: Array<{ day: string; total: number }>;
}

export const getVRStatus = createServerFn({
  method: "GET",
}).handler(async (): Promise<VRDogStatus> => {
  try {
    // Get the first dog (demo purposes)
    const dog = await convex.query(api.queries.getFirstDog, {});

    if (!dog) {
      throw new Error("No dog found");
    }

    // Get dog profile with stats
    const dogProfile = await convex.query(api.queries.getDogProfile, {
      dogId: dog._id,
    });

    if (!dogProfile) {
      throw new Error("Dog profile not found");
    }

    // Get daily goals
    const dailyGoals = await convex.query(api.queries.getDailyGoals, {
      dogId: dog._id,
    });

    // Get streak
    const streak = await convex.query(api.queries.getStreak, {
      dogId: dog._id,
    });

    // Get recent activities (last 5)
    const activityFeed = await convex.query(api.queries.getActivityFeed, {
      dogId: dog._id,
    });
    const recentActivities = activityFeed.slice(0, 5);

    // Get weekly XP data (last 7 days)
    const overallStats = await convex.query(api.queries.getOverallStatsData, {
      dogId: dog._id,
    });

    // Get last 7 days of XP data
    const last7Days = overallStats.dailyXpData.slice(-7);

    // Map day names
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyXP = last7Days.map((day) => {
      const date = new Date(day.date);
      return {
        day: dayNames[date.getDay()],
        total: day.xp,
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
      stats: dogProfile.stats.map((stat) => ({
        type: stat.statType,
        name: statNames[stat.statType] || stat.statType,
        level: stat.level,
        xp: stat.xp,
        xpToNextLevel: stat.xpToNextLevel,
        xpProgress: stat.xp / stat.xpToNextLevel,
      })),
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
      recentActivities: recentActivities.map((activity) => ({
        id: activity._id,
        name: activity.activityName,
        xpBreakdown: activity.statGains.map((sg) => ({
          stat: sg.statType,
          amount: sg.xpAmount,
        })),
        timestamp: activity.createdAt,
        loggedBy: activity.userName,
      })),
      weeklyXP,
    };

    return vrStatus;
  } catch (error) {
    console.error("Failed to fetch VR status:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch VR status"
    );
  }
});
