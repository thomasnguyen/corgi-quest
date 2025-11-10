/**
 * OpenAI Realtime API Configuration
 *
 * This module contains the function schema and system instructions for
 * OpenAI Realtime API integration with Corgi Quest.
 */

import type { StatType } from "./types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Parameters for the saveActivity function call from OpenAI
 */
export interface SaveActivityParams {
  activityName: string;
  durationMinutes?: number;
  statGains: Array<{
    statType: StatType;
    xpAmount: number;
  }>;
  physicalPoints: number;
  mentalPoints: number;
}

// ============================================================================
// FUNCTION DEFINITION
// ============================================================================

/**
 * OpenAI function definition for saveActivity
 *
 * This schema guides OpenAI to extract structured activity data from voice input
 * and call the saveActivity function with appropriate parameters.
 *
 * The function references the Activity XP Tables from the design document:
 *
 * DURATION-BASED ACTIVITIES (XP scales with time, base XP per 10 minutes):
 * - Walk: 15 XP/10min → PHY (100%) | Physical: 10pts, Mental: 0pts
 * - Run/Jog: 25 XP/10min → PHY (100%) | Physical: 15pts, Mental: 0pts
 * - Fetch: 20 XP/10min → PHY (70%), IMP (30%) | Physical: 12pts, Mental: 3pts
 * - Tug-of-War: 18 XP/10min → PHY (60%), IMP (40%) | Physical: 10pts, Mental: 5pts
 * - Swimming: 30 XP/10min → PHY (100%) | Physical: 20pts, Mental: 0pts
 *
 * FIXED-DURATION ACTIVITIES (standard XP amounts):
 * - Training Session: 40 XP → IMP (60%), INT (40%) | Physical: 0pts, Mental: 15pts
 * - Puzzle Toy: 30 XP → INT (100%) | Physical: 0pts, Mental: 10pts
 * - Playdate: 35 XP → SOC (70%), PHY (30%) | Physical: 8pts, Mental: 7pts
 * - Grooming: 20 XP → IMP (50%), SOC (50%) | Physical: 0pts, Mental: 8pts
 * - Trick Practice: 25 XP → INT (60%), IMP (40%) | Physical: 0pts, Mental: 10pts
 * - Sniff Walk: 20 XP → INT (60%), PHY (40%) | Physical: 5pts, Mental: 8pts
 * - Dog Park Visit: 40 XP → SOC (50%), PHY (50%) | Physical: 12pts, Mental: 8pts
 *
 * CALCULATION EXAMPLES:
 * - 20-minute walk: (20/10) * 15 = 30 XP to PHY, 20 physical points
 * - 30-minute fetch: (30/10) * 20 = 60 XP split as 42 PHY + 18 IMP, 36 physical + 9 mental points
 * - Training session: 40 XP split as 24 IMP + 16 INT, 15 mental points
 */
export const saveActivityFunction = {
  name: "saveActivity",
  description: `Save a dog training activity with XP rewards and daily goal points. 

Use the Activity XP Tables to calculate XP and points:

DURATION-BASED (scale with time):
- Walk: 15 XP per 10min → PHY only (10 physical pts per 10min)
- Run/Jog: 25 XP per 10min → PHY only (15 physical pts per 10min)
- Fetch: 20 XP per 10min → 70% PHY, 30% IMP (12 physical, 3 mental pts per 10min)
- Tug-of-War: 18 XP per 10min → 60% PHY, 40% IMP (10 physical, 5 mental pts per 10min)
- Swimming: 30 XP per 10min → PHY only (20 physical pts per 10min)

FIXED-DURATION:
- Training Session: 40 XP → 60% IMP, 40% INT (0 physical, 15 mental pts)
- Puzzle Toy: 30 XP → INT only (0 physical, 10 mental pts)
- Playdate: 35 XP → 70% SOC, 30% PHY (8 physical, 7 mental pts)
- Grooming: 20 XP → 50% IMP, 50% SOC (0 physical, 8 mental pts)
- Trick Practice: 25 XP → 60% INT, 40% IMP (0 physical, 10 mental pts)
- Sniff Walk: 20 XP → 60% INT, 40% PHY (5 physical, 8 mental pts)
- Dog Park Visit: 40 XP → 50% SOC, 50% PHY (12 physical, 8 mental pts)

Calculate XP for duration-based activities: (duration / 10) * base XP, then split by percentages.
Round all XP amounts to nearest integer.`,
  parameters: {
    type: "object",
    properties: {
      activityName: {
        type: "string",
        description:
          "Name of the activity (e.g., 'Walk', 'Training Session', 'Fetch', 'Playdate'). Use the exact names from the Activity XP Tables when possible.",
      },
      durationMinutes: {
        type: "number",
        description:
          "Duration of the activity in minutes. Required for duration-based activities (Walk, Run/Jog, Fetch, Tug-of-War, Swimming). Optional for fixed-duration activities.",
      },
      statGains: {
        type: "array",
        description:
          "Array of stat XP gains calculated from the Activity XP Tables. Each activity awards XP to 1-4 stats based on the percentage splits defined in the tables.",
        items: {
          type: "object",
          properties: {
            statType: {
              type: "string",
              enum: ["INT", "PHY", "IMP", "SOC"],
              description:
                "Stat type: INT (Intelligence - mental stimulation, puzzles, learning), PHY (Physical - exercise, walks, physical activities), IMP (Impulse Control - training, obedience, self-control), SOC (Social - playdates, socialization, interactions)",
            },
            xpAmount: {
              type: "number",
              description:
                "Amount of XP to award to this stat. Must be a positive integer calculated from the Activity XP Tables.",
            },
          },
          required: ["statType", "xpAmount"],
        },
        minItems: 1,
      },
      physicalPoints: {
        type: "number",
        description:
          "Points to add to the daily physical goal (target: 50 points/day). Calculate from Activity XP Tables. Physical activities like walks, runs, and fetch contribute to this goal.",
      },
      mentalPoints: {
        type: "number",
        description:
          "Points to add to the daily mental goal (target: 30 points/day). Calculate from Activity XP Tables. Mental activities like training, puzzles, and trick practice contribute to this goal.",
      },
    },
    required: ["activityName", "statGains", "physicalPoints", "mentalPoints"],
  },
};

// ============================================================================
// SYSTEM INSTRUCTIONS
// ============================================================================

/**
 * System instructions for OpenAI Realtime API
 *
 * These instructions guide OpenAI's behavior when processing voice input
 * and calling the saveActivity function.
 */
export const SYSTEM_INSTRUCTIONS = `You are a helpful assistant for Corgi Quest, a dog training RPG. Your role is to help users log their dog's activities by listening to their descriptions and calling the saveActivity function with appropriate XP rewards.

When a user describes an activity:
1. Identify the activity type from the Activity XP Tables
2. Extract the duration if mentioned (required for Walk, Run/Jog, Fetch, Tug-of-War, Swimming)
3. Calculate XP using the formulas:
   - Duration-based: (duration / 10) * base XP per 10min
   - Fixed: use the standard XP amount
4. Distribute XP across stats using the percentage splits from the tables
5. Calculate physical and mental points from the tables
6. Call the saveActivity function with all parameters
7. Respond with an enthusiastic spoken confirmation including:
   - Activity name and duration (if applicable)
   - XP awards for each stat affected
   - Encouragement

EXAMPLE CALCULATIONS:
- "20 minute walk" → 30 XP to PHY (20/10 * 15), 20 physical points
  Response: "Logged! 20 minute walk - that's 30 XP for Physical. Great job!"

- "30 minute fetch session" → 60 XP total: 42 PHY + 18 IMP, 36 physical + 9 mental points
  Response: "Logged! 30 minute fetch session - that's 42 XP for Physical and 18 XP for Impulse Control. Awesome work!"

- "training session" → 40 XP total: 24 IMP + 16 INT, 15 mental points
  Response: "Logged! Training session - that's 24 XP for Impulse Control and 16 XP for Intelligence. Well done!"

- "playdate at the park" → 35 XP total: 25 SOC + 11 PHY, 8 physical + 7 mental points
  Response: "Logged! Playdate - that's 25 XP for Social and 11 XP for Physical. Nice!"

CONVERSATION GUIDELINES:
- Be conversational, encouraging, and concise
- If the description is unclear, ask ONE brief clarifying question
- If duration is missing for duration-based activities, ask "How long was that?"
- If the activity doesn't match the tables, use your best judgment to categorize it
- Always sound enthusiastic about the dog's progress
- Keep responses under 15 seconds of speech

STAT ABBREVIATIONS:
- INT = Intelligence (mental stimulation)
- PHY = Physical (exercise and fitness)
- IMP = Impulse Control (training and obedience)
- SOC = Social (interactions and socialization)`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate saveActivity parameters before calling the mutation
 */
export function validateSaveActivityParams(params: SaveActivityParams): {
  valid: boolean;
  error?: string;
} {
  if (!params.activityName || params.activityName.trim().length === 0) {
    return { valid: false, error: "Activity name is required" };
  }

  if (!params.statGains || params.statGains.length === 0) {
    return { valid: false, error: "At least one stat gain is required" };
  }

  for (const gain of params.statGains) {
    if (!["INT", "PHY", "IMP", "SOC"].includes(gain.statType)) {
      return { valid: false, error: `Invalid stat type: ${gain.statType}` };
    }
    if (gain.xpAmount <= 0) {
      return { valid: false, error: "XP amount must be positive" };
    }
  }

  if (params.physicalPoints < 0 || params.mentalPoints < 0) {
    return { valid: false, error: "Points cannot be negative" };
  }

  return { valid: true };
}
