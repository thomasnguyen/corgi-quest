/**
 * Demo login utilities for hackathon landing page
 * Handles auto-login flow by setting demo user in localStorage
 */

import { Id } from "../../convex/_generated/dataModel";

export interface DemoLoginConfig {
  email: string;
}

export interface DemoLoginResult {
  success: boolean;
  userId?: Id<"users">;
  error?: string;
}

/**
 * Get demo user configuration from environment variables
 */
export function getDemoConfig(): DemoLoginConfig {
  return {
    email: import.meta.env.VITE_DEMO_USER_EMAIL || "thomas@example.com",
  };
}

/**
 * Perform demo auto-login by setting the user in localStorage
 * Returns true if successful, false otherwise
 */
export function performDemoLogin(userId: Id<"users">): boolean {
  try {
    localStorage.setItem("selectedCharacterId", userId);
    return true;
  } catch (error) {
    console.error("Failed to set demo user in localStorage:", error);
    return false;
  }
}

/**
 * Clear any existing user session
 */
export function clearUserSession(): void {
  try {
    localStorage.removeItem("selectedCharacterId");
  } catch (error) {
    console.error("Failed to clear user session:", error);
  }
}
