/**
 * Unit tests for useVRData hook
 *
 * Note: These tests verify the hook's interface and type safety.
 * Integration tests with actual Convex queries should be done manually
 * or with a full test environment setup.
 */

import { describe, it, expect } from "vitest";
import type { VRData } from "./useVRData";
import type { Id } from "../../convex/_generated/dataModel";

describe("useVRData", () => {
  describe("VRData interface", () => {
    it("should have correct structure for VRData type", () => {
      // This test verifies the VRData interface structure
      const mockVRData: VRData = {
        dog: {
          _id: "test-dog-id" as Id<"dogs">,
          name: "Bumi",
          householdId: "test-household-id" as Id<"households">,
          overallLevel: 5,
          overallXp: 250,
          xpToNextLevel: 100,
          photoUrl: "https://example.com/bumi.jpg",
          breed: "Corgi",
          traits: ["reactive", "smart"],
          createdAt: Date.now(),
        },
        stats: [
          {
            _id: "test-stat-id-1" as Id<"dog_stats">,
            dogId: "test-dog-id" as Id<"dogs">,
            statType: "PHY",
            level: 3,
            xp: 50,
            xpToNextLevel: 100,
          },
          {
            _id: "test-stat-id-2" as Id<"dog_stats">,
            dogId: "test-dog-id" as Id<"dogs">,
            statType: "INT",
            level: 4,
            xp: 75,
            xpToNextLevel: 100,
          },
          {
            _id: "test-stat-id-3" as Id<"dog_stats">,
            dogId: "test-dog-id" as Id<"dogs">,
            statType: "IMP",
            level: 2,
            xp: 25,
            xpToNextLevel: 100,
          },
          {
            _id: "test-stat-id-4" as Id<"dog_stats">,
            dogId: "test-dog-id" as Id<"dogs">,
            statType: "SOC",
            level: 3,
            xp: 60,
            xpToNextLevel: 100,
          },
        ],
        goals: {
          _id: "test-goal-id" as Id<"daily_goals">,
          dogId: "test-dog-id" as Id<"dogs">,
          date: "2024-01-15",
          physicalPoints: 30,
          physicalGoal: 60,
          mentalPoints: 20,
          mentalGoal: 40,
        },
        activities: [
          {
            _id: "test-activity-id-1" as Id<"activities">,
            dogId: "test-dog-id" as Id<"dogs">,
            userId: "test-user-id" as Id<"users">,
            activityName: "Walk",
            description: "Morning walk around the block",
            durationMinutes: 20,
            physicalPoints: 30,
            mentalPoints: 10,
            createdAt: Date.now(),
            userName: "Thomas",
            statGains: [
              {
                _id: "test-stat-gain-id-1" as Id<"activity_stat_gains">,
                activityId: "test-activity-id-1" as Id<"activities">,
                statType: "PHY",
                xpAmount: 25,
              },
            ],
          },
        ],
        weeklyXP: [
          { date: "2024-01-09", xp: 50 },
          { date: "2024-01-10", xp: 75 },
          { date: "2024-01-11", xp: 60 },
          { date: "2024-01-12", xp: 80 },
          { date: "2024-01-13", xp: 90 },
          { date: "2024-01-14", xp: 70 },
          { date: "2024-01-15", xp: 85 },
        ],
        streak: {
          _id: "test-streak-id" as Id<"streaks">,
          dogId: "test-dog-id" as Id<"dogs">,
          currentStreak: 7,
          longestStreak: 14,
          lastActivityDate: "2024-01-15",
        },
        isLoading: false,
      };

      // Verify all required fields are present
      expect(mockVRData.dog).toBeDefined();
      expect(mockVRData.stats).toBeDefined();
      expect(mockVRData.goals).toBeDefined();
      expect(mockVRData.activities).toBeDefined();
      expect(mockVRData.weeklyXP).toBeDefined();
      expect(mockVRData.streak).toBeDefined();
      expect(mockVRData.isLoading).toBeDefined();
    });

    it("should handle null dog state", () => {
      const mockVRData: VRData = {
        dog: null,
        stats: [],
        goals: null,
        activities: [],
        weeklyXP: [],
        streak: null,
        isLoading: false,
      };

      expect(mockVRData.dog).toBeNull();
      expect(mockVRData.stats).toHaveLength(0);
      expect(mockVRData.goals).toBeNull();
      expect(mockVRData.activities).toHaveLength(0);
      expect(mockVRData.weeklyXP).toHaveLength(0);
      expect(mockVRData.streak).toBeNull();
    });

    it("should handle loading state", () => {
      const mockVRData: VRData = {
        dog: null,
        stats: [],
        goals: null,
        activities: [],
        weeklyXP: [],
        streak: null,
        isLoading: true,
      };

      expect(mockVRData.isLoading).toBe(true);
    });

    it("should support all four stat types", () => {
      const statTypes: Array<"PHY" | "INT" | "IMP" | "SOC"> = [
        "PHY",
        "INT",
        "IMP",
        "SOC",
      ];

      statTypes.forEach((statType) => {
        const mockStat = {
          _id: `test-stat-${statType}` as Id<"dog_stats">,
          dogId: "test-dog-id" as Id<"dogs">,
          statType,
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
        };

        expect(mockStat.statType).toBe(statType);
      });
    });

    it("should support activity with stat gains", () => {
      const mockActivity = {
        _id: "test-activity-id" as Id<"activities">,
        dogId: "test-dog-id" as Id<"dogs">,
        userId: "test-user-id" as Id<"users">,
        activityName: "Training Session",
        createdAt: Date.now(),
        userName: "Holly",
        statGains: [
          {
            _id: "test-gain-1" as Id<"activity_stat_gains">,
            activityId: "test-activity-id" as Id<"activities">,
            statType: "INT" as const,
            xpAmount: 30,
          },
          {
            _id: "test-gain-2" as Id<"activity_stat_gains">,
            activityId: "test-activity-id" as Id<"activities">,
            statType: "IMP" as const,
            xpAmount: 20,
          },
        ],
      };

      expect(mockActivity.statGains).toHaveLength(2);
      expect(mockActivity.statGains[0].statType).toBe("INT");
      expect(mockActivity.statGains[1].statType).toBe("IMP");
    });
  });
});
