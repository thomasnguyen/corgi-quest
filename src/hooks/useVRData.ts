import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * VR Data interface
 * Aggregates all data needed for the VR-HUD display
 * Requirements: 9.1, 9.2
 */
export interface VRData {
  dog: {
    _id: Id<"dogs">;
    name: string;
    householdId: Id<"households">;
    overallLevel: number;
    overallXp: number;
    xpToNextLevel: number;
    photoUrl?: string;
    breed?: string;
    traits?: string[];
    createdAt: number;
  } | null;
  stats: Array<{
    _id: Id<"dog_stats">;
    dogId: Id<"dogs">;
    statType: "INT" | "PHY" | "IMP" | "SOC";
    level: number;
    xp: number;
    xpToNextLevel: number;
  }>;
  goals: {
    _id: Id<"daily_goals">;
    dogId: Id<"dogs">;
    date: string;
    physicalPoints: number;
    physicalGoal: number;
    mentalPoints: number;
    mentalGoal: number;
  } | null;
  activities: Array<{
    _id: Id<"activities">;
    dogId: Id<"dogs">;
    userId: Id<"users">;
    activityName: string;
    description?: string;
    durationMinutes?: number;
    physicalPoints?: number;
    mentalPoints?: number;
    createdAt: number;
    userName: string;
    statGains: Array<{
      _id: Id<"activity_stat_gains">;
      activityId: Id<"activities">;
      statType: "INT" | "PHY" | "IMP" | "SOC";
      xpAmount: number;
    }>;
  }>;
  weeklyXP: Array<{ date: string; xp: number }>;
  streak: {
    _id: Id<"streaks">;
    dogId: Id<"dogs">;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
  } | null;
  isLoading: boolean;
}

/**
 * Custom hook for fetching and subscribing to VR-HUD data from Convex
 *
 * This hook aggregates all data needed for the VR training interface:
 * - Dog profile (name, level, XP)
 * - Four training stats (PHY, INT, IMP, SOC)
 * - Today's daily goals (physical and mental)
 * - Recent activities (5 most recent for activity feed)
 * - Weekly XP data (last 7 days for chart)
 * - Current streak information
 *
 * All queries use Convex real-time subscriptions, so the VR-HUD
 * automatically updates when data changes in the backend.
 *
 * Requirements: 9.1, 9.2
 *
 * @param dogId - The ID of the dog to fetch data for, or null if no dog selected
 * @returns VRData object with all VR-HUD data and loading state
 */
export function useVRData(dogId: Id<"dogs"> | null): VRData {
  // Real-time query for dog profile - Requirements: 9.1
  const dogProfile = useQuery(
    api.queries.getDogProfile,
    dogId ? { dogId } : "skip"
  );

  // Real-time query for daily goals - Requirements: 9.1
  const goals = useQuery(api.queries.getDailyGoals, dogId ? { dogId } : "skip");

  // Real-time query for recent activities (limit to 5 for VR display) - Requirements: 9.1
  const activityFeed = useQuery(
    api.queries.getActivityFeed,
    dogId ? { dogId } : "skip"
  );

  // Real-time query for overall stats data (includes weekly XP) - Requirements: 9.1
  const overallStats = useQuery(
    api.queries.getOverallStatsData,
    dogId ? { dogId } : "skip"
  );

  // Real-time query for streak - Requirements: 9.1
  const streak = useQuery(api.queries.getStreak, dogId ? { dogId } : "skip");

  // Determine loading state - all queries must be loaded
  const isLoading =
    dogProfile === undefined ||
    goals === undefined ||
    activityFeed === undefined ||
    overallStats === undefined ||
    streak === undefined;

  // Handle null states and extract data - Requirements: 9.2
  const dog = dogProfile?.dog ?? null;
  const stats = dogProfile?.stats ?? [];
  const activities = activityFeed ? activityFeed.slice(0, 5) : []; // Limit to 5 for VR
  const weeklyXP = overallStats?.dailyXpData ?? [];

  return {
    dog,
    stats,
    goals: goals ?? null,
    activities,
    weeklyXP,
    streak: streak ?? null,
    isLoading,
  };
}
