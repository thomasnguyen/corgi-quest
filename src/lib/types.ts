import { Id } from "convex/_generated/dataModel";

// Stat types
export type StatType = "INT" | "PHY" | "IMP" | "SOC";

// Core Data Types
export interface Dog {
  _id: Id<"dogs">;
  name: string;
  householdId: Id<"households">;
  overallLevel: number;
  overallXp: number;
  xpToNextLevel: number;
  photoUrl?: string;
  _creationTime: number;
}

export interface DogStat {
  _id: Id<"dog_stats">;
  dogId: Id<"dogs">;
  statType: StatType;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export interface Activity {
  _id: Id<"activities">;
  dogId: Id<"dogs">;
  userId: Id<"users">;
  activityName: string;
  description?: string;
  durationMinutes?: number;
  _creationTime: number;
}

export interface ActivityStatGain {
  _id: Id<"activity_stat_gains">;
  activityId: Id<"activities">;
  statType: StatType;
  xpAmount: number;
}

export interface DailyGoal {
  _id: Id<"daily_goals">;
  dogId: Id<"dogs">;
  date: string; // YYYY-MM-DD format
  physicalPoints: number;
  physicalGoal: number;
  mentalPoints: number;
  mentalGoal: number;
}

export interface Streak {
  _id: Id<"streaks">;
  dogId: Id<"dogs">;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // YYYY-MM-DD format
}

export interface User {
  _id: Id<"users">;
  name: string;
  email: string;
  householdId: Id<"households">;
  _creationTime: number;
}

export interface Household {
  _id: Id<"households">;
  dogId: Id<"dogs">;
  _creationTime: number;
}

// API Response Types
export interface ParsedVoiceLog {
  activityName: string;
  durationMinutes?: number;
  statGains: Array<{
    statType: StatType;
    xpAmount: number;
  }>;
  physicalPoints: number;
  mentalPoints: number;
  confidence: number; // 0-1 score from Claude
}
