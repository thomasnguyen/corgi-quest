import { useState, useEffect, useCallback } from "react";
import {
  getActiveDogId,
  setActiveDogId as setActiveDogIdStorage,
  clearActiveDogId,
} from "../lib/activeDogStorage";
import { useSelectedCharacter } from "./useSelectedCharacter";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Hook to manage the active dog selection for the current user
 *
 * The active dog ID is stored in localStorage per user and persists across sessions.
 * When the user changes, the hook automatically loads the new user's active dog.
 *
 * Enhanced error handling:
 * - Falls back to first dog if stored ID is invalid
 * - Clears invalid ID from localStorage
 * - Handles no dogs in household case
 *
 * Requirements: 1.2, 3.5, 7.1
 */
export function useActiveDog() {
  const { selectedCharacterId, selectedUser } = useSelectedCharacter();
  const [activeDogId, setActiveDogIdState] = useState<Id<"dogs"> | null>(null);
  const [hasValidated, setHasValidated] = useState(false);

  // Query household dogs to validate active dog ID - Requirements: 1.2
  const householdDogs = useQuery(
    api.queries.getHouseholdDogs,
    selectedUser?.householdId
      ? { householdId: selectedUser.householdId }
      : "skip"
  );

  // Load and validate active dog ID from localStorage when user changes - Requirements: 1.2
  useEffect(() => {
    if (!selectedCharacterId || !householdDogs) {
      return;
    }

    // Skip if already validated
    if (hasValidated) {
      return;
    }

    const storedId = getActiveDogId(selectedCharacterId);

    // Case 1: No dogs in household - Requirements: 1.2
    if (householdDogs.length === 0) {
      setActiveDogIdState(null);
      if (storedId) {
        // Clear invalid stored ID
        clearActiveDogId(selectedCharacterId);
        console.warn(
          "[useActiveDog] No dogs in household, cleared stored ID:",
          storedId
        );
      }
      setHasValidated(true);
      return;
    }

    // Case 2: No stored ID - use first dog - Requirements: 1.2
    if (!storedId) {
      const firstDog = householdDogs[0];
      setActiveDogIdState(firstDog._id);
      setActiveDogIdStorage(selectedCharacterId, firstDog._id);
      console.log(
        "[useActiveDog] No stored ID, using first dog:",
        firstDog._id
      );
      setHasValidated(true);
      return;
    }

    // Case 3: Validate stored ID exists in household dogs - Requirements: 1.2
    const dogExists = householdDogs.some((dog) => dog._id === storedId);

    if (dogExists) {
      // Valid stored ID
      setActiveDogIdState(storedId as Id<"dogs">);
      console.log("[useActiveDog] Valid stored ID:", storedId);
    } else {
      // Invalid stored ID - fall back to first dog - Requirements: 1.2
      const firstDog = householdDogs[0];
      setActiveDogIdState(firstDog._id);
      setActiveDogIdStorage(selectedCharacterId, firstDog._id);
      console.warn(
        "[useActiveDog] Invalid stored ID:",
        storedId,
        "falling back to first dog:",
        firstDog._id
      );
    }

    setHasValidated(true);
  }, [selectedCharacterId, householdDogs, hasValidated]);

  // Reset validation when user changes
  useEffect(() => {
    setHasValidated(false);
  }, [selectedCharacterId]);

  // Update both state and localStorage when active dog changes
  const setActiveDogId = useCallback(
    (dogId: Id<"dogs">) => {
      if (selectedCharacterId) {
        setActiveDogIdState(dogId);
        setActiveDogIdStorage(selectedCharacterId, dogId);
        console.log("[useActiveDog] Set active dog:", dogId);
      }
    },
    [selectedCharacterId]
  );

  return {
    activeDogId,
    setActiveDogId,
  };
}
