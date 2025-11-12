import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Flame, Dumbbell, Brain, WifiOff, RefreshCw } from "lucide-react";
import { useConvexConnection } from "../../hooks/useConvexConnection";
import { useState } from "react";
import MoodPicker, { type MoodType } from "../mood/MoodPicker";

export default function TopResourceBar() {
  // Monitor Convex connection state
  const { connectionState, hasPendingMutations } = useConvexConnection();
  // Get the first dog (demo purposes)
  const firstDog = useQuery(api.queries.getFirstDog);

  // Get the first user (current user for demo purposes)
  const firstUser = useQuery(
    api.queries.getFirstUser,
    firstDog ? { householdId: firstDog.householdId } : "skip"
  );

  // Subscribe to daily goals query
  const dailyGoals = useQuery(
    api.queries.getDailyGoals,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Subscribe to streak query
  const streak = useQuery(
    api.queries.getStreak,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Subscribe to partner's presence
  const partnerPresence = useQuery(
    api.queries.getPartnerPresence,
    firstDog && firstUser
      ? { householdId: firstDog.householdId, currentUserId: firstUser._id }
      : "skip"
  );

  // Subscribe to latest mood
  const latestMood = useQuery(
    api.queries.getLatestMood,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Mood picker state
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const logMoodMutation = useMutation(api.mutations.logMood);
  const [isLoggingMood, setIsLoggingMood] = useState(false);

  // Mood emoji mapping
  const getMoodEmoji = (mood: string | undefined) => {
    if (!mood) return "—";
    const moodMap: Record<string, string> = {
      calm: "😊",
      anxious: "😰",
      reactive: "😡",
      playful: "🎾",
      tired: "😴",
      neutral: "😐",
    };
    return moodMap[mood] || "—";
  };

  // Handle mood logging
  const handleMoodConfirm = async (mood: MoodType, note?: string) => {
    if (!firstDog || !firstUser) return;

    setIsLoggingMood(true);
    try {
      await logMoodMutation({
        dogId: firstDog._id,
        userId: firstUser._id,
        mood,
        note,
      });
      setShowMoodPicker(false);
    } catch (error) {
      console.error("Failed to log mood:", error);
    } finally {
      setIsLoggingMood(false);
    }
  };

  // Show loading state if queries are still loading
  // Only check firstDog since other queries depend on it
  if (firstDog === undefined) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between px-5 pb-3">
          <div className="flex items-center gap-2 bg-[#121216]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#3d3d3d]/30">
            <Flame size={16} strokeWidth={2} className="text-orange-500" />
            <span className="text-[#f9dca0] text-xs font-medium">0</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#121216]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#3d3d3d]/30">
            <Dumbbell size={14} strokeWidth={2} className="text-cyan-400" />
            <span className="text-[#f9dca0] text-xs font-medium">0/50</span>
            <span className="text-[#888] text-[9px] uppercase tracking-wide">
              STR
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#121216]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#3d3d3d]/30">
            <Brain size={14} strokeWidth={2} className="text-purple-400" />
            <span className="text-[#f9dca0] text-xs font-medium">0/30</span>
            <span className="text-[#888] text-[9px] uppercase tracking-wide">
              MEN
            </span>
          </div>
          <button
            className="flex items-center gap-2 bg-[#121216]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#3d3d3d]/30"
            disabled
          >
            <span className="text-[#f9dca0] text-xs font-medium">—</span>
          </button>
        </div>
      </div>
    );
  }

  // Extract values with defaults when no daily goal exists
  const physicalPoints = dailyGoals?.physicalPoints ?? 0;
  const physicalGoal = dailyGoals?.physicalGoal ?? 50;
  const mentalPoints = dailyGoals?.mentalPoints ?? 0;
  const mentalGoal = dailyGoals?.mentalGoal ?? 30;
  const currentStreak = streak?.currentStreak ?? 0;

  // Get mood emoji
  const moodEmoji = getMoodEmoji(latestMood?.mood);

  // Check if partner is logging activity
  const isPartnerLogging =
    partnerPresence?.location === "log-activity" && partnerPresence.partnerName;

  return (
    <>
      <div className="relative">
        <div className="flex items-center justify-between px-5 pb-3">
          <div className="flex items-center gap-2 bg-[#121216]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#3d3d3d]/30">
            <Flame size={16} strokeWidth={2} className="text-orange-500" />
            <span className="text-[#f9dca0] text-xs font-medium">
              {currentStreak}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#121216]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#3d3d3d]/30">
            <Dumbbell size={14} strokeWidth={2} className="text-cyan-400" />
            <span className="text-[#f9dca0] text-xs font-medium">
              {physicalPoints}/{physicalGoal}
            </span>
            <span className="text-[#888] text-[9px] uppercase tracking-wide pt-1">
              STR
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#121216]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#3d3d3d]/30">
            <Brain size={14} strokeWidth={2} className="text-purple-400" />
            <span className="text-[#f9dca0] text-xs font-medium">
              {mentalPoints}/{mentalGoal}
            </span>
            <span className="text-[#888] text-[9px] uppercase tracking-wide pt-1">
              MEN
            </span>
          </div>
          <button
            onClick={() => setShowMoodPicker(true)}
            className="flex items-center gap-2 bg-[#121216]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#3d3d3d]/30 hover:border-[#f5c35f]/50 transition-colors cursor-pointer active:scale-95"
            title={latestMood ? `Mood: ${latestMood.mood}` : "Tap to log mood"}
          >
            <span className="text-base">{moodEmoji}</span>
          </button>
        </div>
        {/* Syncing Indicator - Shows when mutations are pending */}
        {hasPendingMutations && (
          <div className="px-5 pb-2">
            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-yellow-500/30 flex items-center gap-2">
              <RefreshCw size={12} className="text-yellow-400 animate-spin" />
              <span className="text-yellow-400 text-xs font-medium">
                Syncing...
              </span>
            </div>
          </div>
        )}
        {/* Reconnecting Indicator */}
        {connectionState === "reconnecting" && !hasPendingMutations && (
          <div className="px-5 pb-2">
            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-yellow-500/30 flex items-center gap-2">
              <RefreshCw size={12} className="text-yellow-400 animate-spin" />
              <span className="text-yellow-400 text-xs font-medium">
                Reconnecting...
              </span>
            </div>
          </div>
        )}
        {/* Offline Indicator */}
        {connectionState === "disconnected" && (
          <div className="px-5 pb-2">
            <div className="bg-red-500/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-red-500/30 flex items-center gap-2">
              <WifiOff size={12} className="text-red-400" />
              <span className="text-red-400 text-xs font-medium">
                Offline - Changes will sync when online
              </span>
            </div>
          </div>
        )}
        {/* Partner Logging Indicator */}
        {isPartnerLogging && (
          <div className="px-5 pb-2">
            <div className="bg-green-500/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-green-500/30 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-green-400 text-xs font-medium">
                {partnerPresence.partnerName} is logging...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mood Picker Modal */}
      {showMoodPicker && (
        <MoodPicker
          onConfirm={handleMoodConfirm}
          onCancel={() => setShowMoodPicker(false)}
          isLoading={isLoggingMood}
        />
      )}
    </>
  );
}
