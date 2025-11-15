// Simplified Training Mode - Text Only (No Audio)
// 1. Listen for "Jarvis" wake word
// 2. Get activity description from speech
// 3. Send to OpenAI text API
// 4. Log activity and show toast

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSelectedCharacter } from "../../hooks/useSelectedCharacter";
import { useWebSpeechRecognition } from "../../hooks/useWebSpeechRecognition";
import { detectWakeWord } from "../../lib/wakeWordDetection";
import { ListeningIndicator } from "./ListeningIndicator";
import { LastLoggedActivity } from "./LastLoggedActivity";
import { TodaysSummary } from "./TodaysSummary";
import { StopButton } from "./StopButton";

export function TrainingModeSimple() {
  const navigate = useNavigate();
  const { selectedCharacterId } = useSelectedCharacter();

  const [lastActivity, setLastActivity] = useState<{
    name: string;
    xpGains: Array<{ statType: string; xpAmount: number }>;
    timestamp: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const firstDog = useQuery(api.queries.getFirstDog);
  const dogId = firstDog?._id;

  // Get all household users to find a valid one
  const householdUsers = useQuery(api.queries.getAllHouseholdUsers);
  const validUserId = selectedCharacterId || householdUsers?.[0]?._id;

  const logActivityMutation = useMutation(api.mutations.logActivity);
  const processActivityAction = useAction(api.actions.processTrainingActivity);

  // Web Speech Recognition for wake word detection (auto-starts)
  const {
    transcript: speechTranscript,
    isListening: isSpeechListening,
    error: speechError,
    stopListening: stopSpeech,
    resetTranscript,
  } = useWebSpeechRecognition();

  // Define processActivity with useCallback to avoid re-creating on every render
  const processActivity = useCallback(
    async (activityDescription: string) => {
      if (!dogId || !validUserId) {
        console.error("[Training Mode] ❌ Missing dog or user information");
        console.log(
          "[Training Mode] dogId:",
          dogId,
          "validUserId:",
          validUserId
        );
        setError("Missing dog or user information");
        return;
      }

      setIsProcessing(true);
      setError(null);
      setSuccessMessage(null);

      try {
        console.log(
          "[Training Mode] 🤖 Processing with AI:",
          activityDescription
        );
        console.log(
          "[Training Mode] Using dogId:",
          dogId,
          "userId:",
          validUserId
        );

        // Call OpenAI to parse the activity
        console.log("[Training Mode] Calling processActivityAction...");
        const parsed = await processActivityAction({
          activityDescription,
        });

        console.log("[Training Mode] ✅ AI parsed activity:", parsed);

        if (!parsed) {
          throw new Error("No response from AI processing");
        }

        // Log the activity
        console.log("[Training Mode] 💾 Logging activity to database...");
        await logActivityMutation({
          dogId,
          userId: validUserId,
          activityName: parsed.activityName,
          description: undefined,
          durationMinutes: parsed.durationMinutes,
          statGains: parsed.statGains,
          physicalPoints: parsed.physicalPoints,
          mentalPoints: parsed.mentalPoints,
        });

        console.log("[Training Mode] ✅ Activity logged successfully");

        // Update UI
        setLastActivity({
          name: parsed.activityName,
          xpGains: parsed.statGains.map((gain: any) => ({
            statType: gain.statType,
            xpAmount: gain.xpAmount,
          })),
          timestamp: Date.now(),
        });

        setSuccessMessage(`✅ Logged: ${parsed.activityName}`);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        console.error("[Training Mode] ❌ Failed to process activity:", err);
        console.error("[Training Mode] Error details:", {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        setError(
          err instanceof Error ? err.message : "Failed to process activity"
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [dogId, validUserId, processActivityAction, logActivityMutation]
  );

  // Monitor transcript for wake word
  useEffect(() => {
    if (!speechTranscript) {
      console.log("[Training Mode] ⏳ Waiting for speech transcript...");
      return;
    }

    if (isProcessing) {
      console.log(
        "[Training Mode] ⏳ Already processing, skipping wake word check"
      );
      return;
    }

    console.log(
      "[Training Mode] 🔍 Checking for wake word in:",
      speechTranscript
    );
    const result = detectWakeWord(speechTranscript);
    console.log("[Training Mode] 🔍 Wake word check result:", result);

    if (result.detected) {
      console.log("[Training Mode] 🎯 Wake word detected:", result.wakeWord);
      console.log("[Training Mode] 📝 Activity payload:", result.payload);

      // Check if payload is empty
      if (!result.payload || result.payload.trim() === "") {
        console.warn(
          "[Training Mode] ⚠️ Empty payload - need activity description after wake word"
        );
        setError(
          "Please say the activity after 'Jarvis' (e.g., 'Jarvis walked for 10 minutes')"
        );
        return;
      }

      console.log(
        "[Training Mode] ✅ Valid payload detected, starting processing..."
      );
      // Process the activity
      processActivity(result.payload);

      // Reset transcript for next detection
      resetTranscript();
    } else {
      console.log("[Training Mode] ❌ No wake word detected yet");
    }
  }, [speechTranscript, isProcessing, resetTranscript, processActivity]);

  const handleStop = () => {
    console.log("[Training Mode] 🛑 Stop button clicked");
    stopSpeech();
    navigate({ to: "/" });
  };

  // Cleanup on unmount
  useEffect(() => {
    console.log("[Training Mode] 🎤 Training Mode mounted");

    return () => {
      console.log("[Training Mode] 🛑 Cleaning up...");
      stopSpeech();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#121216] text-white pb-32">
      <div className="px-6 py-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-[#f9dca0]">Training Mode</h1>
        <p className="text-xs text-gray-500 mt-1">
          Say "Jarvis" to start logging an activity
        </p>
      </div>

      <ListeningIndicator isListening={isSpeechListening && !isProcessing} />

      {lastActivity && <LastLoggedActivity activity={lastActivity} />}
      {dogId && <TodaysSummary dogId={dogId} />}

      {error && (
        <div className="px-6 py-4">
          <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-4">
            <p className="text-red-400 text-sm font-medium mb-1">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {speechError && (
        <div className="px-6 py-4">
          <div className="bg-yellow-900/10 border border-yellow-900/30 rounded-lg p-4">
            <p className="text-yellow-400 text-sm font-medium mb-1">
              Microphone Issue
            </p>
            <p className="text-yellow-300 text-sm">{speechError}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="px-6 py-4">
          <div className="bg-green-900/10 border border-green-900/30 rounded-lg p-4">
            <p className="text-green-300 text-sm font-medium">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="px-6 py-4">
          <div className="bg-gray-900/50 rounded-lg p-4 text-center border border-gray-700">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mb-2"></div>
            <p className="text-gray-400 text-sm font-medium">
              Processing activity...
            </p>
          </div>
        </div>
      )}

      <StopButton onClick={handleStop} />
    </div>
  );
}
