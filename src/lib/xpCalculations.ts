/**
 * XP Calculation Utilities for Corgi Quest
 *
 * This module contains all XP calculation logic including:
 * - Level-up calculations with overflow handling
 * - Activity XP lookup tables
 * - XP distribution across stats
 * - Daily points calculation
 */

import type { StatType } from "./types";

// ============================================================================
// TYPES
// ============================================================================

export interface LevelUpResult {
  newLevel: number;
  newXp: number;
  leveledUp: boolean;
  levelsGained: number;
}

export interface StatGain {
  statType: StatType;
  xpAmount: number;
}

export interface DailyPoints {
  physicalPoints: number;
  mentalPoints: number;
}

export interface ActivityXpResult {
  totalXp: number;
  statGains: StatGain[];
  dailyPoints: DailyPoints;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * XP required per level (constant across all levels)
 */
export const XP_PER_LEVEL = 100;

/**
 * Duration-based activities (XP scales with time)
 * Format: baseXP per 10 minutes
 */
export const DURATION_ACTIVITIES = {
  Walk: {
    baseXpPer10Min: 15,
    statDistribution: { PHY: 100 },
    physicalPoints: 10,
    mentalPoints: 0,
  },
  "Run/Jog": {
    baseXpPer10Min: 25,
    statDistribution: { PHY: 100 },
    physicalPoints: 15,
    mentalPoints: 0,
  },
  Fetch: {
    baseXpPer10Min: 20,
    statDistribution: { PHY: 70, IMP: 30 },
    physicalPoints: 12,
    mentalPoints: 3,
  },
  "Tug-of-War": {
    baseXpPer10Min: 18,
    statDistribution: { PHY: 60, IMP: 40 },
    physicalPoints: 10,
    mentalPoints: 5,
  },
  Swimming: {
    baseXpPer10Min: 30,
    statDistribution: { PHY: 100 },
    physicalPoints: 20,
    mentalPoints: 0,
  },
} as const;

/**
 * Fixed-duration activities (standard XP amounts)
 */
export const FIXED_ACTIVITIES = {
  "Training Session": {
    xpAmount: 40,
    statDistribution: { IMP: 60, INT: 40 },
    physicalPoints: 0,
    mentalPoints: 15,
  },
  "Puzzle Toy": {
    xpAmount: 30,
    statDistribution: { INT: 100 },
    physicalPoints: 0,
    mentalPoints: 10,
  },
  Playdate: {
    xpAmount: 35,
    statDistribution: { SOC: 70, PHY: 30 },
    physicalPoints: 8,
    mentalPoints: 7,
  },
  Grooming: {
    xpAmount: 20,
    statDistribution: { IMP: 50, SOC: 50 },
    physicalPoints: 0,
    mentalPoints: 8,
  },
  "Trick Practice": {
    xpAmount: 25,
    statDistribution: { INT: 60, IMP: 40 },
    physicalPoints: 0,
    mentalPoints: 10,
  },
  "Sniff Walk": {
    xpAmount: 20,
    statDistribution: { INT: 60, PHY: 40 },
    physicalPoints: 5,
    mentalPoints: 8,
  },
  "Dog Park Visit": {
    xpAmount: 40,
    statDistribution: { SOC: 50, PHY: 50 },
    physicalPoints: 12,
    mentalPoints: 8,
  },
} as const;

// ============================================================================
// LEVEL-UP CALCULATION
// ============================================================================

/**
 * Calculate level-up with XP overflow handling
 * Always uses 100 XP per level (constant)
 *
 * @param currentLevel - Current level
 * @param currentXp - Current XP amount
 * @param xpGained - XP being added
 * @returns LevelUpResult with new level, XP, and level-up status
 *
 * @example
 * // No level-up
 * calculateLevelUp(5, 50, 30) // { newLevel: 5, newXp: 80, leveledUp: false, levelsGained: 0 }
 *
 * @example
 * // Single level-up with overflow
 * calculateLevelUp(5, 80, 30) // { newLevel: 6, newXp: 10, leveledUp: true, levelsGained: 1 }
 *
 * @example
 * // Multiple level-ups
 * calculateLevelUp(5, 80, 250) // { newLevel: 8, newXp: 30, leveledUp: true, levelsGained: 3 }
 */
export function calculateLevelUp(
  currentLevel: number,
  currentXp: number,
  xpGained: number
): LevelUpResult {
  const totalXp = currentXp + xpGained;

  if (totalXp < XP_PER_LEVEL) {
    // No level-up
    return {
      newLevel: currentLevel,
      newXp: totalXp,
      leveledUp: false,
      levelsGained: 0,
    };
  }

  // Calculate how many levels gained
  const levelsGained = Math.floor(totalXp / XP_PER_LEVEL);
  const overflowXp = totalXp % XP_PER_LEVEL;

  return {
    newLevel: currentLevel + levelsGained,
    newXp: overflowXp,
    leveledUp: true,
    levelsGained,
  };
}

// ============================================================================
// ACTIVITY XP CALCULATION
// ============================================================================

/**
 * Calculate XP for a duration-based activity
 * Formula: (duration / 10) * baseXP
 *
 * @param activityName - Name of the activity
 * @param durationMinutes - Duration in minutes
 * @returns Total XP amount
 *
 * @example
 * calculateActivityXp("Walk", 20) // 30 XP (20/10 * 15)
 * calculateActivityXp("Fetch", 30) // 60 XP (30/10 * 20)
 */
export function calculateActivityXp(
  activityName: keyof typeof DURATION_ACTIVITIES,
  durationMinutes: number
): number {
  const activity = DURATION_ACTIVITIES[activityName];
  if (!activity) {
    throw new Error(`Unknown duration-based activity: ${activityName}`);
  }

  return Math.round((durationMinutes / 10) * activity.baseXpPer10Min);
}

// ============================================================================
// STAT XP DISTRIBUTION
// ============================================================================

/**
 * Distribute XP across stats based on percentage splits
 *
 * @param totalXp - Total XP to distribute
 * @param statDistribution - Object mapping stat types to percentages (e.g., { PHY: 70, IMP: 30 })
 * @returns Array of StatGain objects
 *
 * @example
 * distributeStatXp(60, { PHY: 70, IMP: 30 })
 * // Returns: [{ statType: "PHY", xpAmount: 42 }, { statType: "IMP", xpAmount: 18 }]
 */
export function distributeStatXp(
  totalXp: number,
  statDistribution: Partial<Record<StatType, number>>
): StatGain[] {
  const statGains: StatGain[] = [];

  for (const [statType, percentage] of Object.entries(statDistribution)) {
    const xpAmount = Math.round((totalXp * percentage) / 100);
    if (xpAmount > 0) {
      statGains.push({
        statType: statType as StatType,
        xpAmount,
      });
    }
  }

  return statGains;
}

// ============================================================================
// DAILY POINTS CALCULATION
// ============================================================================

/**
 * Calculate physical and mental points for an activity
 *
 * @param activityName - Name of the activity
 * @param durationMinutes - Duration in minutes (for duration-based activities)
 * @returns DailyPoints object with physical and mental points
 *
 * @example
 * calculateDailyPoints("Walk", 20) // { physicalPoints: 20, mentalPoints: 0 }
 * calculateDailyPoints("Training Session") // { physicalPoints: 0, mentalPoints: 15 }
 */
export function calculateDailyPoints(
  activityName: string,
  durationMinutes?: number
): DailyPoints {
  // Check duration-based activities first
  if (activityName in DURATION_ACTIVITIES) {
    const activity =
      DURATION_ACTIVITIES[activityName as keyof typeof DURATION_ACTIVITIES];

    if (durationMinutes === undefined) {
      throw new Error(`Duration required for activity: ${activityName}`);
    }

    // Scale points based on duration (points are per 10 minutes)
    const multiplier = durationMinutes / 10;
    return {
      physicalPoints: Math.round(activity.physicalPoints * multiplier),
      mentalPoints: Math.round(activity.mentalPoints * multiplier),
    };
  }

  // Check fixed activities
  if (activityName in FIXED_ACTIVITIES) {
    const activity =
      FIXED_ACTIVITIES[activityName as keyof typeof FIXED_ACTIVITIES];
    return {
      physicalPoints: activity.physicalPoints,
      mentalPoints: activity.mentalPoints,
    };
  }

  // Unknown activity - return zeros
  return {
    physicalPoints: 0,
    mentalPoints: 0,
  };
}

// ============================================================================
// COMBINED ACTIVITY CALCULATION
// ============================================================================

/**
 * Calculate complete activity results (XP, stat gains, and daily points)
 * This is a convenience function that combines all calculations
 *
 * @param activityName - Name of the activity
 * @param durationMinutes - Duration in minutes (for duration-based activities)
 * @returns ActivityXpResult with total XP, stat gains, and daily points
 *
 * @example
 * calculateActivityResult("Walk", 20)
 * // Returns: {
 * //   totalXp: 30,
 * //   statGains: [{ statType: "PHY", xpAmount: 30 }],
 * //   dailyPoints: { physicalPoints: 20, mentalPoints: 0 }
 * // }
 */
export function calculateActivityResult(
  activityName: string,
  durationMinutes?: number
): ActivityXpResult {
  let totalXp: number;
  let statDistribution: Partial<Record<StatType, number>>;

  // Check duration-based activities
  if (activityName in DURATION_ACTIVITIES) {
    if (durationMinutes === undefined) {
      throw new Error(`Duration required for activity: ${activityName}`);
    }

    const activity =
      DURATION_ACTIVITIES[activityName as keyof typeof DURATION_ACTIVITIES];
    totalXp = calculateActivityXp(
      activityName as keyof typeof DURATION_ACTIVITIES,
      durationMinutes
    );
    statDistribution = activity.statDistribution;
  }
  // Check fixed activities
  else if (activityName in FIXED_ACTIVITIES) {
    const activity =
      FIXED_ACTIVITIES[activityName as keyof typeof FIXED_ACTIVITIES];
    totalXp = activity.xpAmount;
    statDistribution = activity.statDistribution;
  }
  // Unknown activity
  else {
    return {
      totalXp: 0,
      statGains: [],
      dailyPoints: { physicalPoints: 0, mentalPoints: 0 },
    };
  }

  const statGains = distributeStatXp(totalXp, statDistribution);
  const dailyPoints = calculateDailyPoints(activityName, durationMinutes);

  return {
    totalXp,
    statGains,
    dailyPoints,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if an activity is duration-based
 */
export function isDurationBasedActivity(activityName: string): boolean {
  return activityName in DURATION_ACTIVITIES;
}

/**
 * Check if an activity is a fixed activity
 */
export function isFixedActivity(activityName: string): boolean {
  return activityName in FIXED_ACTIVITIES;
}

/**
 * Get all available activity names
 */
export function getAllActivityNames(): string[] {
  return [
    ...Object.keys(DURATION_ACTIVITIES),
    ...Object.keys(FIXED_ACTIVITIES),
  ];
}
