/**
 * Active Dog Storage Utilities
 *
 * Manages localStorage persistence for the currently active dog selection.
 * Each user has their own active dog selection stored in localStorage.
 */

/**
 * Get the active dog ID for a specific user from localStorage
 * @param userId - The user's ID
 * @returns The active dog ID or null if not set
 */
export const getActiveDogId = (userId: string): string | null => {
  if (typeof window === "undefined") {
    return null; // SSR safety
  }

  return localStorage.getItem(`activeDogId_${userId}`);
};

/**
 * Set the active dog ID for a specific user in localStorage
 * @param userId - The user's ID
 * @param dogId - The dog ID to set as active
 */
export const setActiveDogId = (userId: string, dogId: string): void => {
  if (typeof window === "undefined") {
    return; // SSR safety
  }

  localStorage.setItem(`activeDogId_${userId}`, dogId);
};

/**
 * Clear the active dog ID for a specific user from localStorage
 * @param userId - The user's ID
 */
export const clearActiveDogId = (userId: string): void => {
  if (typeof window === "undefined") {
    return; // SSR safety
  }

  localStorage.removeItem(`activeDogId_${userId}`);
};
