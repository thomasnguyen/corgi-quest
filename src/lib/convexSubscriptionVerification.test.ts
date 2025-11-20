/**
 * Convex Subscription Verification Tests
 *
 * These tests verify that the Convex queries are properly structured
 * for real-time subscriptions with correct indexes.
 *
 * Validates Requirements 9.2, 9.4
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Convex Real-Time Subscription Setup", () => {
  const schemaPath = join(process.cwd(), "convex", "schema.ts");
  const queriesPath = join(process.cwd(), "convex", "queries.ts");

  const schemaContent = readFileSync(schemaPath, "utf-8");
  const queriesContent = readFileSync(queriesPath, "utf-8");

  describe("Schema Indexes (Requirement 9.2, 9.4)", () => {
    it("should have by_household index on dogs table", () => {
      expect(schemaContent).toContain('index("by_household", ["householdId"])');
    });

    it("should have by_dog index on quests table", () => {
      expect(schemaContent).toContain('index("by_dog", ["dogId"])');
    });

    it("should have by_dog_and_created index on activities table", () => {
      expect(schemaContent).toContain(
        'index("by_dog_and_created", ["dogId", "createdAt"])'
      );
    });

    it("should have by_dog index on dog_stats table", () => {
      expect(schemaContent).toContain('index("by_dog", ["dogId"])');
    });

    it("should have by_dog_and_date index on daily_goals table", () => {
      expect(schemaContent).toContain(
        'index("by_dog_and_date", ["dogId", "date"])'
      );
    });

    it("should have by_dog index on streaks table", () => {
      expect(schemaContent).toContain('index("by_dog", ["dogId"])');
    });

    it("should have by_dog_and_created index on mood_logs table", () => {
      expect(schemaContent).toContain(
        'index("by_dog_and_created", ["dogId", "createdAt"])'
      );
    });
  });

  describe("Query Implementations (Requirement 9.2, 9.4)", () => {
    it("should have getHouseholdDogs query using by_household index", () => {
      expect(queriesContent).toContain("getHouseholdDogs");
      expect(queriesContent).toContain('withIndex("by_household"');
    });

    it("should have getDogQuests query using by_dog index", () => {
      expect(queriesContent).toContain("getDogQuests");
      expect(queriesContent).toContain('withIndex("by_dog"');
    });

    it("should have getActivityFeed query using by_dog_and_created index", () => {
      expect(queriesContent).toContain("getActivityFeed");
      expect(queriesContent).toContain('withIndex("by_dog_and_created"');
    });

    it("should have getDogProfile query using by_dog index", () => {
      expect(queriesContent).toContain("getDogProfile");
      expect(queriesContent).toContain('withIndex("by_dog"');
    });

    it("should have getDailyGoals query using by_dog_and_date index", () => {
      expect(queriesContent).toContain("getDailyGoals");
      expect(queriesContent).toContain('withIndex("by_dog_and_date"');
    });

    it("should have getStreak query using by_dog index", () => {
      expect(queriesContent).toContain("getStreak");
      expect(queriesContent).toContain('withIndex("by_dog"');
    });
  });

  describe("Query Return Types", () => {
    it("getHouseholdDogs should return array of dogs", () => {
      // Verify the query collects results (returns array)
      const getHouseholdDogsMatch = queriesContent.match(
        /export const getHouseholdDogs = query\({[\s\S]*?}\);/
      );
      expect(getHouseholdDogsMatch).toBeTruthy();
      expect(getHouseholdDogsMatch![0]).toContain(".collect()");
    });

    it("getDogQuests should return array of quests", () => {
      const getDogQuestsMatch = queriesContent.match(
        /export const getDogQuests = query\({[\s\S]*?}\);/
      );
      expect(getDogQuestsMatch).toBeTruthy();
      expect(getDogQuestsMatch![0]).toContain(".collect()");
    });

    it("getActivityFeed should return array of activities", () => {
      const getActivityFeedMatch = queriesContent.match(
        /export const getActivityFeed = query\({[\s\S]*?}\);/
      );
      expect(getActivityFeedMatch).toBeTruthy();
      // Should use .take(20) for pagination
      expect(getActivityFeedMatch![0]).toContain(".take(");
    });
  });

  describe("Real-Time Subscription Patterns", () => {
    it("queries should not use fetch() calls", () => {
      // Verify no fetch calls in queries (would break real-time)
      expect(queriesContent).not.toContain("fetch(");
    });

    it("queries should use ctx.db for database access", () => {
      // All queries should use ctx.db
      expect(queriesContent).toContain("ctx.db.query");
      expect(queriesContent).toContain("ctx.db.get");
    });

    it("queries should not have manual polling logic", () => {
      // No setInterval or setTimeout in queries
      expect(queriesContent).not.toContain("setInterval");
      expect(queriesContent).not.toContain("setTimeout");
    });
  });

  describe("Index Coverage", () => {
    it("all dog-related queries should use indexes", () => {
      // Extract all query definitions
      const queryMatches = queriesContent.matchAll(
        /export const (\w+) = query\({/g
      );
      const queryNames = Array.from(queryMatches).map((match) => match[1]);

      // Dog-related queries that should use indexes (exclude demo queries)
      const dogQueries = queryNames.filter(
        (name) =>
          (name.includes("Dog") ||
            name.includes("Activity") ||
            name.includes("Stat") ||
            name.includes("Quest") ||
            name.includes("Streak") ||
            name.includes("Goal") ||
            name.includes("Mood")) &&
          !name.includes("First") && // Exclude demo queries like getFirstDog
          !name.includes("All") // Exclude getAllHouseholdUsers (demo query)
      );

      // Verify each dog query uses withIndex
      dogQueries.forEach((queryName) => {
        const queryRegex = new RegExp(
          `export const ${queryName} = query\\({[\\s\\S]*?}\\);`
        );
        const queryMatch = queriesContent.match(queryRegex);

        if (queryMatch) {
          const queryBody = queryMatch[0];
          // Should use withIndex or be a simple get by ID
          const usesIndex = queryBody.includes("withIndex");
          const usesGet = queryBody.includes("ctx.db.get");

          expect(
            usesIndex || usesGet,
            `Query ${queryName} should use withIndex or ctx.db.get`
          ).toBe(true);
        }
      });
    });
  });
});

/**
 * Integration Notes:
 *
 * These tests verify the static structure of Convex queries and schema.
 * They ensure that:
 *
 * 1. All necessary indexes exist for efficient queries
 * 2. Queries use the correct indexes for real-time subscriptions
 * 3. No anti-patterns (fetch, polling) are present
 *
 * Real-time behavior should be verified manually with multiple users
 * as described in docs/household-sync-verification.md
 */
