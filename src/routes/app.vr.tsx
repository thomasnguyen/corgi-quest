import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useActiveDog } from "../hooks/useActiveDog";
import { useSimpleVoiceRecognition } from "../hooks/useSimpleVoiceRecognition";
import StatOrb from "../components/dog/StatOrb";

export const Route = createFileRoute("/app/vr")({
  component: VRTrainingDashboard,
  ssr: false,
});

/**
 * Compact 2D Training Dashboard for Vision Pro
 * Designed to sit on the left side of the browser in Vision Pro
 */
function VRTrainingDashboard() {
  const { activeDogId } = useActiveDog();
  const [userId, setUserId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldAutoProcessRef = useRef(false);
  const wasListeningRef = useRef(false);

  // Fetch data
  const dogProfile = useQuery(
    api.queries.getDogProfile,
    activeDogId ? { dogId: activeDogId } : "skip"
  );
  const goals = useQuery(
    api.queries.getDailyGoals,
    activeDogId ? { dogId: activeDogId } : "skip"
  );
  const quests = useQuery(
    api.queries.getDogQuests,
    activeDogId ? { dogId: activeDogId } : "skip"
  );

  const dog = dogProfile?.dog;
  const stats = dogProfile?.stats;

  // Simple voice recognition (tap to talk)
  const {
    transcript,
    isListening,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSimpleVoiceRecognition();

  // Convex mutations
  const logActivityMutation = useMutation(api.mutations.logActivity);
  const processActivityAction = useAction(api.actions.processTrainingActivity);

  // Get user ID from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("selectedCharacterId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Get first available quest
  const firstQuest = quests?.[0];

  // Process activity when user stops talking
  const processActivity = async (activityDescription: string) => {
    if (!activeDogId || !userId) {
      console.error("[VR Mode] Missing dog or user information");
      return;
    }

    setIsProcessing(true);

    try {
      console.log("[VR Mode] Processing activity:", activityDescription);

      // Call AI to parse the activity
      const parsed = await processActivityAction({
        activityDescription,
      });

      if (!parsed) {
        throw new Error("No response from AI processing");
      }

      // Log the activity
      await logActivityMutation({
        dogId: activeDogId,
        userId: userId as any,
        activityName: parsed.activityName,
        description: undefined,
        durationMinutes: parsed.durationMinutes,
        statGains: parsed.statGains,
        physicalPoints: parsed.physicalPoints,
        mentalPoints: parsed.mentalPoints,
      });

      console.log("[VR Mode] Activity logged successfully");

      // Show success message
      setSuccessMessage(`✅ Logged: ${parsed.activityName}`);
      setTimeout(() => setSuccessMessage(null), 3000);

      // Reset transcript
      resetTranscript();
    } catch (err) {
      console.error("[VR Mode] Failed to process activity:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle microphone button
  const handleMicrophoneTap = async () => {
    if (isListening) {
      // User manually stopped - don't auto-process
      shouldAutoProcessRef.current = false;
      stopListening();

      // Clear auto-stop timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Process the transcript immediately if we have one
      if (transcript.trim()) {
        await processActivity(transcript.trim());
      }
    } else {
      // Start listening
      resetTranscript();
      setSuccessMessage(null);
      shouldAutoProcessRef.current = true; // Enable auto-processing
      startListening();

      // Auto-stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        shouldAutoProcessRef.current = false; // Disable auto-process for timeout
        stopListening();
        if (transcript.trim()) {
          processActivity(transcript.trim());
        }
      }, 10000);
    }
  };

  // Auto-process when mic stops (user stopped talking naturally)
  useEffect(() => {
    // Track if we were listening
    if (isListening) {
      wasListeningRef.current = true;
    }

    // If we were listening and now we're not, and auto-process is enabled
    if (
      wasListeningRef.current &&
      !isListening &&
      shouldAutoProcessRef.current &&
      transcript.trim() &&
      !isProcessing
    ) {
      console.log("[VR Mode] Mic auto-stopped, processing transcript");
      wasListeningRef.current = false;
      shouldAutoProcessRef.current = false;
      processActivity(transcript.trim());
    }
  }, [isListening, transcript, isProcessing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      stopListening();
    };
  }, [stopListening]);

  return (
    <div className="min-h-screen bg-[#1a1a1e] p-8">
      <div className="w-full max-w-[600px] mx-auto space-y-6">
        {/* Dog Avatar & Level */}
        {dog && (
          <div className="flex items-center gap-4 pb-6 border-b border-[#3d3d3d]">
            <div className="w-16 h-16 rounded-full bg-[#2a2a2e] border-2 border-[#f5c35f] flex items-center justify-center overflow-hidden">
              {dog.photoUrl ? (
                <img
                  src={dog.photoUrl}
                  alt={dog.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">🐕</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{dog.name}</h2>
              <p className="text-sm text-[#f9dca0]">Level {dog.overallLevel}</p>
            </div>
          </div>
        )}

        {/* Voice Button - BIG */}
        <button
          onClick={handleMicrophoneTap}
          disabled={isProcessing || !!voiceError}
          className={`w-full py-8 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
            isListening
              ? "bg-red-500/20 border-2 border-red-500 text-red-400 hover:bg-red-500/30"
              : "bg-[#f5c35f] text-[#121216] hover:bg-[#e5b84f] border-2 border-[#f5c35f]"
          } ${
            isProcessing || voiceError ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : isListening ? (
            <>
              <MicOff size={24} />
              Stop & Log Activity
            </>
          ) : (
            <>
              <Mic size={24} />
              Tap to Speak
            </>
          )}
        </button>

        {/* Live Transcript */}
        {isListening && transcript && (
          <div className="py-3 px-4 bg-[#2a2a2e] rounded-lg border border-[#3d3d3d]">
            <p className="text-sm text-gray-400 mb-1">You said:</p>
            <p className="text-white">{transcript}</p>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="py-4 px-4 bg-[#2a2a2e] rounded-lg border border-[#f5c35f]">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[#f5c35f] border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-sm font-medium text-[#f5c35f]">
                  Processing with AI...
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Analyzing activity and calculating XP
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Voice Status */}
        <div className="text-center py-3 px-4 bg-[#2a2a2e] rounded-lg border border-[#3d3d3d]">
          {voiceError ? (
            <p className="text-sm text-red-400">{voiceError}</p>
          ) : isProcessing ? (
            <p className="text-sm text-[#f5c35f]">Sending to Claude AI...</p>
          ) : isListening ? (
            <p className="text-sm text-green-400">🎤 Listening...</p>
          ) : successMessage ? (
            <p className="text-sm text-green-400">{successMessage}</p>
          ) : (
            <p className="text-sm text-[#f9dca0]">Tap mic to log activity</p>
          )}
        </div>

        {/* Quest Card */}
        {firstQuest && (
          <div>
            <h3 className="text-sm font-medium text-[#f9dca0] mb-3">
              Suggested Quest
            </h3>
            <div className="bg-[#2a2a2e] border border-[#3d3d3d] rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">{firstQuest.name}</h4>
              <p className="text-sm text-[#f9dca0] mb-3">
                {firstQuest.description}
              </p>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-[#ff6b35]/20 text-[#ff6b35] rounded">
                  {firstQuest.physicalPoints} Physical
                </span>
                <span className="px-2 py-1 bg-[#4ecdc4]/20 text-[#4ecdc4] rounded">
                  {firstQuest.mentalPoints} Mental
                </span>
                <span className="px-2 py-1 bg-[#f5c35f]/20 text-[#f5c35f] rounded">
                  {firstQuest.durationMinutes} min
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stat Orbs */}
        {stats && stats.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-[#f9dca0] mb-3">Stats</h3>
            <div className="flex justify-around items-center py-4 bg-[#2a2a2e] rounded-lg border border-[#3d3d3d]">
              {stats.map((stat: any) => (
                <StatOrb
                  key={stat._id}
                  statType={stat.statType}
                  level={stat.level}
                  xp={stat.xp}
                  xpToNextLevel={stat.xpToNextLevel}
                />
              ))}
            </div>
          </div>
        )}

        {/* Daily Goals */}
        {goals && (
          <div>
            <h3 className="text-sm font-medium text-[#f9dca0] mb-3">
              Today's Goals
            </h3>
            <div className="space-y-3">
              {/* Physical Goal */}
              <div>
                <div className="flex justify-between text-xs text-[#f9dca0] mb-1">
                  <span>Physical</span>
                  <span>
                    {goals.physicalPoints} / {goals.physicalGoal}
                  </span>
                </div>
                <div className="h-2 bg-[#2a2a2e] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ff6b35] transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        (goals.physicalPoints / goals.physicalGoal) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Mental Goal */}
              <div>
                <div className="flex justify-between text-xs text-[#f9dca0] mb-1">
                  <span>Mental</span>
                  <span>
                    {goals.mentalPoints} / {goals.mentalGoal}
                  </span>
                </div>
                <div className="h-2 bg-[#2a2a2e] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4ecdc4] transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        (goals.mentalPoints / goals.mentalGoal) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
