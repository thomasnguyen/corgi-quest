import { useState, useCallback, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { VoiceCommand } from "./useVRVoiceCommands";

interface TrainingSession {
  isActive: boolean;
  repCount: number;
  startTime: number | null;
}

interface UseVRTrainingSessionReturn {
  session: TrainingSession;
  startSession: () => void;
  markRep: () => void;
  endSession: (description: string) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
  lastSuccessTime: number | null;
}

/**
 * Hook for managing VR training sessions with voice commands
 * Handles session state, rep counting, and activity logging via Convex
 */
export function useVRTrainingSession(
  dogId: Id<"dogs"> | null,
  userId: Id<"users"> | null,
  voiceCommand: VoiceCommand | null,
  clearCommand: () => void
): UseVRTrainingSessionReturn {
  const [session, setSession] = useState<TrainingSession>({
    isActive: false,
    repCount: 0,
    startTime: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSuccessTime, setLastSuccessTime] = useState<number | null>(null);

  const logActivity = useMutation(api.mutations.logActivity);
  const processActivity = useAction(api.actions.processTrainingActivity);

  // Handle voice commands
  useEffect(() => {
    if (!voiceCommand) return;

    switch (voiceCommand.type) {
      case "start_session":
        startSession();
        clearCommand();
        break;
      case "mark_rep":
        markRep();
        clearCommand();
        break;
      case "end_session":
        if (voiceCommand.payload) {
          endSession(voiceCommand.payload);
          clearCommand();
        }
        break;
    }
  }, [voiceCommand]);

  const startSession = useCallback(() => {
    if (!dogId) {
      setError("No dog selected");
      return;
    }

    setSession({
      isActive: true,
      repCount: 0,
      startTime: Date.now(),
    });
    setError(null);
    console.log("[VR Training] Session started");
  }, [dogId]);

  const markRep = useCallback(() => {
    if (!session.isActive) {
      console.log("[VR Training] Cannot mark rep - no active session");
      return;
    }

    setSession((prev) => ({
      ...prev,
      repCount: prev.repCount + 1,
    }));
    console.log("[VR Training] Rep marked:", session.repCount + 1);
  }, [session.isActive, session.repCount]);

  const endSession = useCallback(
    async (description: string) => {
      if (!session.isActive) {
        console.log("[VR Training] Cannot end session - no active session");
        return;
      }

      if (!dogId || !userId) {
        setError("Missing dog or user ID");
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        console.log("[VR Training] Processing activity:", description);

        // Use Claude to parse the activity description
        const parsedActivity = await processActivity({
          activityDescription: description,
        });

        console.log("[VR Training] Parsed activity:", parsedActivity);

        // Calculate duration based on session time
        const durationMinutes = session.startTime
          ? Math.round((Date.now() - session.startTime) / 60000)
          : parsedActivity.durationMinutes;

        // Log the activity to Convex
        await logActivity({
          dogId,
          userId,
          activityName: parsedActivity.activityName,
          description: description,
          durationMinutes: durationMinutes,
          statGains: parsedActivity.statGains,
          physicalPoints: parsedActivity.physicalPoints,
          mentalPoints: parsedActivity.mentalPoints,
        });

        console.log("[VR Training] Activity logged successfully");

        // Mark success
        setLastSuccessTime(Date.now());

        // Reset session
        setSession({
          isActive: false,
          repCount: 0,
          startTime: null,
        });
      } catch (err) {
        console.error("[VR Training] Failed to log activity:", err);
        setError(err instanceof Error ? err.message : "Failed to log activity");
      } finally {
        setIsProcessing(false);
      }
    },
    [session, dogId, userId, processActivity, logActivity]
  );

  return {
    session,
    startSession,
    markRep,
    endSession,
    isProcessing,
    error,
    lastSuccessTime,
  };
}
