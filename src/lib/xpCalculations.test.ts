/**
 * Unit tests for XP calculation utilities
 */

import { describe, it, expect } from "vitest";
import {
  calculateLevelUp,
  calculateActivityXp,
  distributeStatXp,
  XP_PER_LEVEL,
} from "./xpCalculations";

describe("calculateLevelUp", () => {
  describe("exact threshold tests", () => {
    it("should level up when XP exactly reaches 100 XP threshold", () => {
      const result = calculateLevelUp(5, 50, 50);

      expect(result.newLevel).toBe(6);
      expect(result.newXp).toBe(0);
      expect(result.leveledUp).toBe(true);
      expect(result.levelsGained).toBe(1);
    });

    it("should level up when starting at 0 XP and gaining exactly 100 XP", () => {
      const result = calculateLevelUp(1, 0, 100);

      expect(result.newLevel).toBe(2);
      expect(result.newXp).toBe(0);
      expect(result.leveledUp).toBe(true);
      expect(result.levelsGained).toBe(1);
    });
  });

  describe("overflow tests", () => {
    it("should level up with overflow (80 XP + 30 = level up, 10 XP remaining)", () => {
      const result = calculateLevelUp(5, 80, 30);

      expect(result.newLevel).toBe(6);
      expect(result.newXp).toBe(10);
      expect(result.leveledUp).toBe(true);
      expect(result.levelsGained).toBe(1);
    });

    it("should level up with overflow (90 XP + 25 = level up, 15 XP remaining)", () => {
      const result = calculateLevelUp(3, 90, 25);

      expect(result.newLevel).toBe(4);
      expect(result.newXp).toBe(15);
      expect(result.leveledUp).toBe(true);
      expect(result.levelsGained).toBe(1);
    });
  });

  describe("multiple level-up tests", () => {
    it("should handle multiple level-ups (80 XP + 250 = 3 level ups, 30 XP remaining)", () => {
      const result = calculateLevelUp(5, 80, 250);

      expect(result.newLevel).toBe(8);
      expect(result.newXp).toBe(30);
      expect(result.leveledUp).toBe(true);
      expect(result.levelsGained).toBe(3);
    });

    it("should handle multiple level-ups (50 XP + 200 = 2 level ups, 50 XP remaining)", () => {
      const result = calculateLevelUp(10, 50, 200);

      expect(result.newLevel).toBe(12);
      expect(result.newXp).toBe(50);
      expect(result.leveledUp).toBe(true);
      expect(result.levelsGained).toBe(2);
    });

    it("should handle multiple level-ups with exact threshold (0 XP + 300 = 3 level ups, 0 XP remaining)", () => {
      const result = calculateLevelUp(1, 0, 300);

      expect(result.newLevel).toBe(4);
      expect(result.newXp).toBe(0);
      expect(result.leveledUp).toBe(true);
      expect(result.levelsGained).toBe(3);
    });
  });

  describe("no level-up tests", () => {
    it("should not level up when below 100 XP threshold", () => {
      const result = calculateLevelUp(5, 50, 30);

      expect(result.newLevel).toBe(5);
      expect(result.newXp).toBe(80);
      expect(result.leveledUp).toBe(false);
      expect(result.levelsGained).toBe(0);
    });

    it("should not level up when at 99 XP", () => {
      const result = calculateLevelUp(7, 90, 9);

      expect(result.newLevel).toBe(7);
      expect(result.newXp).toBe(99);
      expect(result.leveledUp).toBe(false);
      expect(result.levelsGained).toBe(0);
    });

    it("should not level up when gaining 0 XP", () => {
      const result = calculateLevelUp(3, 45, 0);

      expect(result.newLevel).toBe(3);
      expect(result.newXp).toBe(45);
      expect(result.leveledUp).toBe(false);
      expect(result.levelsGained).toBe(0);
    });
  });

  describe("XP_PER_LEVEL constant", () => {
    it("should use 100 XP per level constant", () => {
      expect(XP_PER_LEVEL).toBe(100);
    });
  });
});

describe("calculateActivityXp", () => {
  describe("duration-based activity calculations", () => {
    it("should calculate 20min walk = 30 XP", () => {
      const xp = calculateActivityXp("Walk", 20);
      expect(xp).toBe(30);
    });

    it("should calculate 30min fetch = 60 XP", () => {
      const xp = calculateActivityXp("Fetch", 30);
      expect(xp).toBe(60);
    });

    it("should calculate 10min walk = 15 XP (base rate)", () => {
      const xp = calculateActivityXp("Walk", 10);
      expect(xp).toBe(15);
    });

    it("should calculate 40min walk = 60 XP", () => {
      const xp = calculateActivityXp("Walk", 40);
      expect(xp).toBe(60);
    });

    it("should calculate 15min fetch = 30 XP", () => {
      const xp = calculateActivityXp("Fetch", 15);
      expect(xp).toBe(30);
    });

    it("should calculate 20min run/jog = 50 XP", () => {
      const xp = calculateActivityXp("Run/Jog", 20);
      expect(xp).toBe(50);
    });

    it("should calculate 30min swimming = 90 XP", () => {
      const xp = calculateActivityXp("Swimming", 30);
      expect(xp).toBe(90);
    });
  });
});

describe("distributeStatXp", () => {
  describe("stat XP distribution", () => {
    it("should distribute Fetch XP (70% PHY, 30% IMP)", () => {
      const statGains = distributeStatXp(60, { PHY: 70, IMP: 30 });

      expect(statGains).toHaveLength(2);
      expect(statGains).toContainEqual({ statType: "PHY", xpAmount: 42 });
      expect(statGains).toContainEqual({ statType: "IMP", xpAmount: 18 });
    });

    it("should distribute Walk XP (100% PHY)", () => {
      const statGains = distributeStatXp(30, { PHY: 100 });

      expect(statGains).toHaveLength(1);
      expect(statGains).toContainEqual({ statType: "PHY", xpAmount: 30 });
    });

    it("should distribute Training Session XP (60% IMP, 40% INT)", () => {
      const statGains = distributeStatXp(40, { IMP: 60, INT: 40 });

      expect(statGains).toHaveLength(2);
      expect(statGains).toContainEqual({ statType: "IMP", xpAmount: 24 });
      expect(statGains).toContainEqual({ statType: "INT", xpAmount: 16 });
    });

    it("should distribute Playdate XP (70% SOC, 30% PHY)", () => {
      const statGains = distributeStatXp(35, { SOC: 70, PHY: 30 });

      expect(statGains).toHaveLength(2);
      expect(statGains).toContainEqual({ statType: "SOC", xpAmount: 25 });
      expect(statGains).toContainEqual({ statType: "PHY", xpAmount: 11 });
    });

    it("should distribute Dog Park Visit XP (50% SOC, 50% PHY)", () => {
      const statGains = distributeStatXp(40, { SOC: 50, PHY: 50 });

      expect(statGains).toHaveLength(2);
      expect(statGains).toContainEqual({ statType: "SOC", xpAmount: 20 });
      expect(statGains).toContainEqual({ statType: "PHY", xpAmount: 20 });
    });

    it("should round XP amounts correctly", () => {
      const statGains = distributeStatXp(33, { PHY: 70, IMP: 30 });

      expect(statGains).toHaveLength(2);
      expect(statGains).toContainEqual({ statType: "PHY", xpAmount: 23 });
      expect(statGains).toContainEqual({ statType: "IMP", xpAmount: 10 });
    });
  });
});
