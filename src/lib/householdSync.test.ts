/**
 * Household Sync Tests
 *
 * Tests for real-time household synchronization and user-specific active dog selection.
 * Validates Requirements 9.2, 9.3, 9.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getActiveDogId,
  setActiveDogId,
  clearActiveDogId,
} from "./activeDogStorage";

describe("Household Sync - Active Dog Selection", () => {
  // Mock localStorage
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    // Reset localStorage mock before each test
    localStorageMock = {};

    // Mock localStorage methods with proper implementation
    const mockLocalStorage = {
      getItem: (key: string) => localStorageMock[key] || null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value;
      },
      removeItem: (key: string) => {
        delete localStorageMock[key];
      },
      clear: () => {
        localStorageMock = {};
      },
      length: Object.keys(localStorageMock).length,
      key: (index: number) => Object.keys(localStorageMock)[index] || null,
    };

    // Mock window object (needed for node test environment)
    // @ts-expect-error - Mocking window in node environment
    global.window = {} as Window;

    // Override global localStorage
    Object.defineProperty(global, "localStorage", {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clean up window mock
    // @ts-expect-error - Cleaning up window mock
    delete global.window;
  });

  describe("User-Specific Active Dog Selection (Requirement 9.3)", () => {
    it("should scope active dog ID to user ID", () => {
      const userId1 = "user_123";
      const userId2 = "user_456";
      const dogId1 = "dog_abc";
      const dogId2 = "dog_xyz";

      // User 1 selects dog 1
      setActiveDogId(userId1, dogId1);

      // User 2 selects dog 2
      setActiveDogId(userId2, dogId2);

      // Verify each user has their own active dog
      expect(getActiveDogId(userId1)).toBe(dogId1);
      expect(getActiveDogId(userId2)).toBe(dogId2);

      // Verify localStorage keys are scoped to user ID
      expect(localStorageMock[`activeDogId_${userId1}`]).toBe(dogId1);
      expect(localStorageMock[`activeDogId_${userId2}`]).toBe(dogId2);
    });

    it("should not affect other users when one user changes active dog", () => {
      const userId1 = "user_123";
      const userId2 = "user_456";
      const dogId1 = "dog_abc";
      const dogId2 = "dog_xyz";
      const dogId3 = "dog_new";

      // Both users select initial dogs
      setActiveDogId(userId1, dogId1);
      setActiveDogId(userId2, dogId2);

      // User 1 changes their active dog
      setActiveDogId(userId1, dogId3);

      // Verify user 1's selection changed
      expect(getActiveDogId(userId1)).toBe(dogId3);

      // Verify user 2's selection remained unchanged
      expect(getActiveDogId(userId2)).toBe(dogId2);
    });

    it("should return null for user with no active dog set", () => {
      const userId = "user_new";

      // User has not set an active dog yet
      const activeDogId = getActiveDogId(userId);

      expect(activeDogId).toBeNull();
    });

    it("should clear active dog for specific user without affecting others", () => {
      const userId1 = "user_123";
      const userId2 = "user_456";
      const dogId1 = "dog_abc";
      const dogId2 = "dog_xyz";

      // Both users select dogs
      setActiveDogId(userId1, dogId1);
      setActiveDogId(userId2, dogId2);

      // Clear user 1's active dog
      clearActiveDogId(userId1);

      // Verify user 1's selection is cleared
      expect(getActiveDogId(userId1)).toBeNull();

      // Verify user 2's selection is unaffected
      expect(getActiveDogId(userId2)).toBe(dogId2);
    });

    it("should persist active dog selection across sessions", () => {
      const userId = "user_123";
      const dogId = "dog_abc";

      // User selects a dog
      setActiveDogId(userId, dogId);

      // Simulate page reload by creating new localStorage instance
      const storedValue = localStorageMock[`activeDogId_${userId}`];

      // Verify the value persists in localStorage
      expect(storedValue).toBe(dogId);

      // Simulate reading after reload
      const retrievedDogId = getActiveDogId(userId);
      expect(retrievedDogId).toBe(dogId);
    });

    it("should handle multiple users in same household independently", () => {
      // Simulate a household with 3 users
      const users = [
        { id: "user_thomas", dogId: "dog_bumi" },
        { id: "user_holly", dogId: "dog_luna" },
        { id: "user_guest", dogId: "dog_bumi" }, // Guest can select same dog as Thomas
      ];

      // Each user selects their active dog
      users.forEach((user) => {
        setActiveDogId(user.id, user.dogId);
      });

      // Verify each user's selection is independent
      users.forEach((user) => {
        expect(getActiveDogId(user.id)).toBe(user.dogId);
      });

      // User 1 changes their selection
      setActiveDogId(users[0].id, "dog_new");

      // Verify only user 1's selection changed
      expect(getActiveDogId(users[0].id)).toBe("dog_new");
      expect(getActiveDogId(users[1].id)).toBe(users[1].dogId);
      expect(getActiveDogId(users[2].id)).toBe(users[2].dogId);
    });
  });

  describe("localStorage Key Format", () => {
    it("should use correct key format: activeDogId_{userId}", () => {
      const userId = "user_123";
      const dogId = "dog_abc";

      setActiveDogId(userId, dogId);

      // Verify the exact key format
      expect(localStorageMock).toHaveProperty(`activeDogId_${userId}`);
      expect(localStorageMock[`activeDogId_${userId}`]).toBe(dogId);
    });

    it("should handle special characters in user IDs", () => {
      const userId = "user_123-abc_xyz";
      const dogId = "dog_abc";

      setActiveDogId(userId, dogId);

      expect(getActiveDogId(userId)).toBe(dogId);
      expect(localStorageMock[`activeDogId_${userId}`]).toBe(dogId);
    });
  });

  describe("SSR Safety", () => {
    it("should handle SSR environment gracefully", () => {
      // Temporarily remove window object to simulate SSR
      const originalWindow = global.window;
      // @ts-expect-error - Simulating SSR environment
      delete global.window;

      const userId = "user_123";
      const dogId = "dog_abc";

      // These should not throw errors in SSR
      expect(() => setActiveDogId(userId, dogId)).not.toThrow();
      expect(() => getActiveDogId(userId)).not.toThrow();
      expect(() => clearActiveDogId(userId)).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });
  });
});

/**
 * Integration Test Notes for Real-Time Sync (Requirement 9.2, 9.4)
 *
 * The following scenarios should be tested manually or with Convex integration tests:
 *
 * 1. Real-Time Dog Creation Sync:
 *    - User A creates a new dog
 *    - User B (in same household) should see the new dog appear in their dog menu immediately
 *    - Verified by: getHouseholdDogs query with Convex subscriptions
 *
 * 2. Real-Time Dog Updates Sync:
 *    - User A updates a dog's name or stats
 *    - User B should see the updates in real-time
 *    - Verified by: getDogProfile query with Convex subscriptions
 *
 * 3. Real-Time Activity Sync:
 *    - User A logs an activity for a dog
 *    - User B (viewing same dog) should see the activity appear in feed immediately
 *    - Verified by: getActivityFeed query with Convex subscriptions
 *
 * 4. Independent Active Dog Selection:
 *    - User A switches to Dog 1
 *    - User B switches to Dog 2
 *    - Both users should see different data based on their active dog
 *    - User A's switch should not affect User B's view
 *
 * These scenarios rely on Convex's real-time subscription system and are best
 * tested in a live environment with multiple browser sessions or devices.
 */
