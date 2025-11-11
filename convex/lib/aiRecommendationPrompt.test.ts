/**
 * Test file for AI Recommendation Prompt
 *
 * This file contains sample data scenarios to test the recommendation prompt.
 * Run this manually by copying the prompt and sample data to test with OpenAI API.
 */

import {
  RECOMMENDATION_SYSTEM_PROMPT,
  createRecommendationUserPrompt,
} from "./aiRecommendationPrompt";

// Test Scenario 1: Anxious dog with low INT stat and incomplete mental goal
export const scenario1_anxiousDogLowInt = {
  description:
    "Dog showing frequent anxiety, low INT stat, needs mental stimulation",
  data: {
    moodSummary: [
      {
        mood: "anxious",
        note: "Pacing and whining",
        timestamp: "2024-11-09T14:30:00Z",
      },
      {
        mood: "anxious",
        note: "Reactive to doorbell",
        timestamp: "2024-11-08T16:45:00Z",
      },
      {
        mood: "calm",
        note: "After puzzle toy",
        timestamp: "2024-11-08T10:00:00Z",
      },
      {
        mood: "anxious",
        note: "Weekend stress",
        timestamp: "2024-11-07T15:20:00Z",
      },
      {
        mood: "playful",
        note: "Morning energy",
        timestamp: "2024-11-06T08:30:00Z",
      },
      {
        mood: "tired",
        note: "After long walk",
        timestamp: "2024-11-05T18:00:00Z",
      },
    ],
    activitySummary: [
      {
        name: "Walk",
        duration: 15,
        statGains: [{ statType: "PHY", xpAmount: 23 }],
        physicalPoints: 15,
        mentalPoints: 0,
        timestamp: "2024-11-09T07:30:00Z",
      },
      {
        name: "Walk",
        duration: 20,
        statGains: [{ statType: "PHY", xpAmount: 30 }],
        physicalPoints: 20,
        mentalPoints: 0,
        timestamp: "2024-11-08T07:15:00Z",
      },
      {
        name: "Puzzle Toy",
        statGains: [{ statType: "INT", xpAmount: 30 }],
        physicalPoints: 0,
        mentalPoints: 10,
        timestamp: "2024-11-08T09:45:00Z",
      },
      {
        name: "Fetch",
        duration: 10,
        statGains: [
          { statType: "PHY", xpAmount: 14 },
          { statType: "IMP", xpAmount: 6 },
        ],
        physicalPoints: 12,
        mentalPoints: 3,
        timestamp: "2024-11-07T16:00:00Z",
      },
    ],
    statsSummary: [
      { type: "INT", level: 5, xp: 45, xpToNextLevel: 100, progress: 45 },
      { type: "PHY", level: 9, xp: 75, xpToNextLevel: 100, progress: 75 },
      { type: "IMP", level: 6, xp: 60, xpToNextLevel: 100, progress: 60 },
      { type: "SOC", level: 7, xp: 30, xpToNextLevel: 100, progress: 30 },
    ],
    goalsSummary: {
      physical: { current: 35, goal: 50, remaining: 15 },
      mental: { current: 10, goal: 30, remaining: 20 },
    },
  },
  expectedRecommendations: [
    "Sniff Walk (addresses anxiety + boosts INT)",
    "Training Session (mental stimulation + impulse control)",
    "Puzzle Toy (INT boost + mental goal)",
    "Hide & Seek (mental stimulation + fun)",
  ],
};

// Test Scenario 2: Reactive dog with low IMP stat
export const scenario2_reactiveDogLowImp = {
  description: "Dog showing reactivity, needs impulse control training",
  data: {
    moodSummary: [
      {
        mood: "reactive",
        note: "Barking at other dogs",
        timestamp: "2024-11-09T15:00:00Z",
      },
      {
        mood: "reactive",
        note: "Lunging at squirrels",
        timestamp: "2024-11-08T14:30:00Z",
      },
      {
        mood: "calm",
        note: "After training session",
        timestamp: "2024-11-07T11:00:00Z",
      },
      {
        mood: "playful",
        note: "Good energy",
        timestamp: "2024-11-06T09:00:00Z",
      },
    ],
    activitySummary: [
      {
        name: "Walk",
        duration: 25,
        statGains: [{ statType: "PHY", xpAmount: 38 }],
        physicalPoints: 25,
        mentalPoints: 0,
        timestamp: "2024-11-09T07:00:00Z",
      },
      {
        name: "Training Session",
        statGains: [
          { statType: "IMP", xpAmount: 24 },
          { statType: "INT", xpAmount: 16 },
        ],
        physicalPoints: 0,
        mentalPoints: 15,
        timestamp: "2024-11-07T10:30:00Z",
      },
      {
        name: "Dog Park Visit",
        statGains: [
          { statType: "SOC", xpAmount: 20 },
          { statType: "PHY", xpAmount: 20 },
        ],
        physicalPoints: 12,
        mentalPoints: 8,
        timestamp: "2024-11-06T16:00:00Z",
      },
    ],
    statsSummary: [
      { type: "INT", level: 7, xp: 80, xpToNextLevel: 100, progress: 80 },
      { type: "PHY", level: 8, xp: 65, xpToNextLevel: 100, progress: 65 },
      { type: "IMP", level: 4, xp: 20, xpToNextLevel: 100, progress: 20 },
      { type: "SOC", level: 7, xp: 50, xpToNextLevel: 100, progress: 50 },
    ],
    goalsSummary: {
      physical: { current: 40, goal: 50, remaining: 10 },
      mental: { current: 15, goal: 30, remaining: 15 },
    },
  },
  expectedRecommendations: [
    "Training Session (addresses reactivity + IMP boost)",
    "Fetch (impulse control + physical goal)",
    "Trick Practice (IMP + INT boost)",
    "Tug-of-War (impulse control + physical)",
  ],
};

// Test Scenario 3: Balanced dog, just needs daily goal completion
export const scenario3_balancedDogGoalCompletion = {
  description: "Well-balanced dog, just needs to complete daily goals",
  data: {
    moodSummary: [
      {
        mood: "calm",
        note: "Relaxed morning",
        timestamp: "2024-11-09T09:00:00Z",
      },
      {
        mood: "playful",
        note: "Excited for walk",
        timestamp: "2024-11-08T07:30:00Z",
      },
      {
        mood: "calm",
        note: "Content after training",
        timestamp: "2024-11-07T11:00:00Z",
      },
      {
        mood: "tired",
        note: "Good tired after park",
        timestamp: "2024-11-06T17:00:00Z",
      },
    ],
    activitySummary: [
      {
        name: "Walk",
        duration: 20,
        statGains: [{ statType: "PHY", xpAmount: 30 }],
        physicalPoints: 20,
        mentalPoints: 0,
        timestamp: "2024-11-09T07:30:00Z",
      },
      {
        name: "Training Session",
        statGains: [
          { statType: "IMP", xpAmount: 24 },
          { statType: "INT", xpAmount: 16 },
        ],
        physicalPoints: 0,
        mentalPoints: 15,
        timestamp: "2024-11-08T10:00:00Z",
      },
      {
        name: "Playdate",
        statGains: [
          { statType: "SOC", xpAmount: 25 },
          { statType: "PHY", xpAmount: 11 },
        ],
        physicalPoints: 8,
        mentalPoints: 7,
        timestamp: "2024-11-07T15:00:00Z",
      },
      {
        name: "Dog Park Visit",
        statGains: [
          { statType: "SOC", xpAmount: 20 },
          { statType: "PHY", xpAmount: 20 },
        ],
        physicalPoints: 12,
        mentalPoints: 8,
        timestamp: "2024-11-06T16:30:00Z",
      },
    ],
    statsSummary: [
      { type: "INT", level: 7, xp: 65, xpToNextLevel: 100, progress: 65 },
      { type: "PHY", level: 8, xp: 70, xpToNextLevel: 100, progress: 70 },
      { type: "IMP", level: 7, xp: 55, xpToNextLevel: 100, progress: 55 },
      { type: "SOC", level: 8, xp: 60, xpToNextLevel: 100, progress: 60 },
    ],
    goalsSummary: {
      physical: { current: 28, goal: 50, remaining: 22 },
      mental: { current: 15, goal: 30, remaining: 15 },
    },
  },
  expectedRecommendations: [
    "Walk or Run (complete physical goal)",
    "Fetch (both goals + variety)",
    "Puzzle Toy (mental goal)",
    "Sniff Walk (balanced activity)",
  ],
};

// Test Scenario 4: No recent data (edge case)
export const scenario4_noRecentData = {
  description: "No mood logs or activities in last 7 days",
  data: {
    moodSummary: [],
    activitySummary: [],
    statsSummary: [
      { type: "INT", level: 6, xp: 50, xpToNextLevel: 100, progress: 50 },
      { type: "PHY", level: 7, xp: 40, xpToNextLevel: 100, progress: 40 },
      { type: "IMP", level: 6, xp: 30, xpToNextLevel: 100, progress: 30 },
      { type: "SOC", level: 6, xp: 45, xpToNextLevel: 100, progress: 45 },
    ],
    goalsSummary: {
      physical: { current: 0, goal: 50, remaining: 50 },
      mental: { current: 0, goal: 30, remaining: 30 },
    },
  },
  expectedRecommendations: [
    "Morning Walk (start the day)",
    "Training Session (mental stimulation)",
    "Playdate (socialization)",
    "Puzzle Toy (mental goal)",
  ],
};

// Function to generate test output
export function generateTestPrompts() {
  const scenarios = [
    scenario1_anxiousDogLowInt,
    scenario2_reactiveDogLowImp,
    scenario3_balancedDogGoalCompletion,
    scenario4_noRecentData,
  ];

  console.log("=".repeat(80));
  console.log("AI RECOMMENDATION PROMPT TEST SCENARIOS");
  console.log("=".repeat(80));
  console.log("\nSYSTEM PROMPT:");
  console.log("-".repeat(80));
  console.log(RECOMMENDATION_SYSTEM_PROMPT);
  console.log("\n");

  scenarios.forEach((scenario, index) => {
    console.log("=".repeat(80));
    console.log(`SCENARIO ${index + 1}: ${scenario.description}`);
    console.log("=".repeat(80));
    console.log("\nUSER PROMPT:");
    console.log("-".repeat(80));
    console.log(createRecommendationUserPrompt(scenario.data));
    console.log("\n");
    console.log("EXPECTED RECOMMENDATIONS:");
    console.log("-".repeat(80));
    scenario.expectedRecommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
    console.log("\n");
  });

  console.log("=".repeat(80));
  console.log("END OF TEST SCENARIOS");
  console.log("=".repeat(80));
}

// Export for manual testing
export const testData = {
  systemPrompt: RECOMMENDATION_SYSTEM_PROMPT,
  scenarios: [
    scenario1_anxiousDogLowInt,
    scenario2_reactiveDogLowImp,
    scenario3_balancedDogGoalCompletion,
    scenario4_noRecentData,
  ],
};
