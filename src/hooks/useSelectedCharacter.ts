import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Hook to manage selected character from localStorage
 * Returns the selected character ID and user data
 * Requirements: 29
 */
export function useSelectedCharacter() {
  const [selectedCharacterId, setSelectedCharacterId] =
    useState<Id<"users"> | null>(null);

  // Load selected character ID from localStorage on mount
  useEffect(() => {
    const storedId = localStorage.getItem("selectedCharacterId");
    if (storedId) {
      setSelectedCharacterId(storedId as Id<"users">);
    }
  }, []);

  // Query the selected user's data
  const selectedUser = useQuery(
    api.queries.getUserById,
    selectedCharacterId ? { userId: selectedCharacterId } : "skip"
  );

  return {
    selectedCharacterId,
    selectedUser,
    isLoading: selectedCharacterId !== null && selectedUser === undefined,
  };
}
