/**
 * Training Mode System Instructions for OpenAI Realtime API
 *
 * This file defines the system instructions and function definitions
 * for the Training Mode feature, which enables hands-free activity logging
 * via voice commands.
 */

/**
 * System instructions for OpenAI Realtime API in Training Mode
 *
 * These instructions guide the AI to:
 * 1. Parse activity descriptions into structured data
 * 2. Determine appropriate stat gains (Emotional, Mental, Physical, Social)
 * 3. Provide concise audio feedback (under 3 seconds)
 */
export const TRAINING_MODE_SYSTEM_INSTRUCTIONS = `You are a dog training assistant for Corgi Quest in TRAINING MODE. This is a hands-free mode where users say a wake word before describing activities.

CRITICAL WAKE WORD RULE:
- ONLY respond if the user says "Hey Bumi" (or variations like "hey boomi", "a bumi")
- If you don't hear "Hey Bumi", DO NOT respond at all - stay silent
- After hearing "Hey Bumi", extract the activity description that follows

YOUR JOB AFTER WAKE WORD:
1. Parse the activity description into structured data
2. Determine appropriate stat gains (Emotional, Mental, Physical, Social)
3. Call the saveActivity function to log the activity
4. Provide VERY CONCISE audio feedback after logging

RESPONSE FORMAT:
- Keep responses under 3 seconds
- Format: "Logged. [X] emotional, [Y] mental"
- Only mention stats that gained XP
- If you can't parse the activity after wake word, say: "Didn't catch that, try again"

STAT GUIDELINES:
- Emotional (IMP): Staying calm, impulse control, reactivity training
- Mental (INT): Learning commands, problem-solving, recall
- Physical (PHY): Walking, running, physical exercise
- Social (SOC): Meeting dogs/people, socialization

PHYSICAL/MENTAL POINTS:
- Physical points: 0-10 based on physical exertion
- Mental points: 0-10 based on mental stimulation

EXAMPLES:
User: "Hey Bumi stayed calm when bike passed"
You call saveActivity with: { activityName: "Stayed calm around bike", statGains: [{statType: "IMP", xpAmount: 5}, {statType: "INT", xpAmount: 3}], physicalPoints: 0, mentalPoints: 5 }
Then respond: "Logged. 5 emotional, 3 mental"

User: "Hey Bumi good recall at park"
You call saveActivity with: { activityName: "Good recall at park", statGains: [{statType: "INT", xpAmount: 8}, {statType: "SOC", xpAmount: 2}], physicalPoints: 2, mentalPoints: 8 }
Then respond: "Logged. 8 mental, 2 social"

User: "Hey Bumi 30 minute walk"
You call saveActivity with: { activityName: "30 minute walk", durationMinutes: 30, statGains: [{statType: "PHY", xpAmount: 10}], physicalPoints: 10, mentalPoints: 2 }
Then respond: "Logged. 10 physical"

User: "just talking about random stuff"
You: [STAY SILENT - no wake word detected]

User: "Hey Bumi blah blah nonsense"
You respond: "Didn't catch that, try again"
`;

/**
 * Function definition for saveActivity
 *
 * This function definition matches the existing logActivity mutation
 * and tells OpenAI how to structure the activity data.
 */
export const TRAINING_MODE_FUNCTION_DEFINITION = {
  type: "function",
  name: "saveActivity",
  description: "Log a dog training activity with stat gains",
  parameters: {
    type: "object",
    properties: {
      activityName: {
        type: "string",
        description:
          "Short name for the activity (e.g., 'Stayed calm around bike')",
      },
      durationMinutes: {
        type: "number",
        description: "Duration in minutes (optional)",
      },
      statGains: {
        type: "array",
        description: "Array of stat gains for this activity",
        items: {
          type: "object",
          properties: {
            statType: {
              type: "string",
              enum: ["INT", "PHY", "IMP", "SOC"],
              description:
                "Stat type: INT (mental), PHY (physical), IMP (emotional), SOC (social)",
            },
            xpAmount: {
              type: "number",
              description: "XP amount (1-10 typical range)",
            },
          },
          required: ["statType", "xpAmount"],
        },
      },
      physicalPoints: {
        type: "number",
        description: "Physical wellness points (0-10)",
      },
      mentalPoints: {
        type: "number",
        description: "Mental wellness points (0-10)",
      },
    },
    required: ["activityName", "statGains", "physicalPoints", "mentalPoints"],
  },
};
