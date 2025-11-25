/**
 * Custom hook for demo auto-login functionality
 * Handles the complete flow: query user by email → set localStorage → navigate to app
 */

import { useState } from "react";
import { useQuery } from "convex/react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "../../convex/_generated/api";
import {
  getDemoConfig,
  performDemoLogin,
  clearUserSession,
  type DemoLoginResult,
} from "../lib/demoLogin";

export function useDemoLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = getDemoConfig();

  // Query to get demo user by email
  const demoUser = useQuery(api.queries.getUserByEmail, {
    email: config.email,
  });

  /**
   * Attempt demo auto-login
   * Returns result object with success status and error details
   */
  const attemptDemoLogin = async (): Promise<DemoLoginResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Wait for user query to complete
      if (demoUser === undefined) {
        // Still loading
        setIsLoading(false);
        return {
          success: false,
          error: "Loading user data...",
        };
      }

      if (!demoUser) {
        // User not found - show error
        setError("Demo user not found. Please select a character manually.");
        setIsLoading(false);
        return {
          success: false,
          error: "Demo user not found",
        };
      }

      // Clear any existing session first
      clearUserSession();

      // Perform demo login (just sets localStorage)
      const loginSuccess = performDemoLogin(demoUser._id);

      if (!loginSuccess) {
        setError("Failed to set user session. Please try again.");
        setIsLoading(false);
        return {
          success: false,
          error: "Failed to set user session",
        };
      }

      // Navigate to main app
      await navigate({ to: "/" });

      setIsLoading(false);
      return {
        success: true,
        userId: demoUser._id,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      setIsLoading(false);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    attemptDemoLogin,
    isLoading,
    error,
    demoUser,
    isReady: demoUser !== undefined,
  };
}
