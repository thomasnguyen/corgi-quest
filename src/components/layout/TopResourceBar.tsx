import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Flame, Dumbbell, Brain, WifiOff, RefreshCw } from "lucide-react";
import { useConvexConnection } from "../../hooks/useConvexConnection";
import { useState, lazy, Suspense } from "react";
import MoodPicker, { type MoodType } from "../mood/MoodPicker";
import { useAnimationTrigger } from "../../hooks/useAnimationTrigger";
import PulseWrapper from "../animations/PulseWrapper";
import { DogChip } from "../dog/DogChip";
import { DogMenu } from "../dog/DogMenu";
import { QuestBanner } from "../quests/QuestBanner";
import { useActiveDog } from "../../hooks/useActiveDog";
import { useToast } from "../../contexts/ToastContext";

// Code splitting for AddDogModal - Requirements: 10.1
const AddDogModal = lazy(() =>
  import("../dog/AddDogModal").then((module) => ({
    default: module.AddDogModal,
  }))
);

export default function TopResourceBar() {
  // Monitor Convex connection state
  const { connectionState, hasPendingMutations } = useConvexConnection();

  // Active dog management - Requirements: 3.5, 7.1
  const { activeDogId, setActiveDogId } = useActiveDog();

  // Get the first dog (demo purposes - fallback if no active dog)
  const firstDog = useQuery(api.queries.getFirstDog);

  // Get active dog data if activeDogId is set
  const activeDog = useQuery(
    api.queries.getDogProfile,
    activeDogId ? { dogId: activeDogId } : "skip"
  );

  // Use active dog if available, otherwise fall back to first dog
  const currentDog = activeDog?.dog || firstDog;

  // Dog menu state - Requirements: 2.1
  const [showDogMenu, setShowDogMenu] = useState(false);

  // Add dog modal state - Requirements: 4.1
  const [showAddDogModal, setShowAddDogModal] = useState(false);

  // Quest banner state - Requirements: 8.1
  const [questBanner, setQuestBanner] = useState<{
    questId: Id<"quests">;
    questName: string;
    targetReps: number;
    dogName: string;
  } | null>(null);

  // Toast context for notifications - Requirements: 7.3
  const { showToast } = useToast();

  // Debounce state for dog selection - Requirements: 10.3
  const [isDogSwitching, setIsDogSwitching] = useState(false);

  // Handler for dog selection with debouncing - Requirements: 3.1, 10.3
  const handleDogSelect = (dogId: Id<"dogs">) => {
    // Prevent rapid switches
    if (isDogSwitching) return;

    setIsDogSwitching(true);
    setActiveDogId(dogId);

    // Reset debounce after 300ms
    setTimeout(() => {
      setIsDogSwitching(false);
    }, 300);
  };

  // Handler for add dog button - Requirements: 2.3
  const handleAddDog = () => {
    setShowDogMenu(false);
    setShowAddDogModal(true);
  };

  // Handler for successful dog creation - Requirements: 7.1, 7.2, 7.3, 8.1
  const handleDogCreated = (
    dogId: Id<"dogs">,
    dogName: string,
    questInfo?: { questId: Id<"quests">; questName: string; targetReps: number }
  ) => {
    // Set new dog as active - Requirements: 7.1
    setActiveDogId(dogId);

    // Show toast notification - Requirements: 7.3
    showToast(`${dogName} added!`, "success", 3000);

    // Show quest banner if quest was created - Requirements: 8.1
    if (questInfo) {
      setQuestBanner({
        questId: questInfo.questId,
        questName: questInfo.questName,
        targetReps: questInfo.targetReps,
        dogName,
      });
    }
  };

  // Get the first user (current user for demo purposes)
  const firstUser = useQuery(
    api.queries.getFirstUser,
    currentDog ? { householdId: currentDog.householdId } : "skip"
  );

  // Subscribe to daily goals query
  const dailyGoals = useQuery(
    api.queries.getDailyGoals,
    currentDog ? { dogId: currentDog._id } : "skip"
  );

  // Subscribe to streak query
  const streak = useQuery(
    api.queries.getStreak,
    currentDog ? { dogId: currentDog._id } : "skip"
  );

  // Subscribe to partner's presence
  const partnerPresence = useQuery(
    api.queries.getPartnerPresence,
    currentDog && firstUser
      ? { householdId: currentDog.householdId, currentUserId: firstUser._id }
      : "skip"
  );

  // Subscribe to latest mood
  const latestMood = useQuery(
    api.queries.getLatestMood,
    currentDog ? { dogId: currentDog._id } : "skip"
  );

  // Mood picker state
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const logMoodMutation = useMutation(api.mutations.logMood);
  const [isLoggingMood, setIsLoggingMood] = useState(false);

  // Pulse state for daily goals - Requirements: 2.1, 2.2
  const [physicalPulse, setPhysicalPulse] = useState(false);

  // Extract values with defaults when no daily goal exists
  const physicalPoints = dailyGoals?.physicalPoints ?? 0;
  const physicalGoal = dailyGoals?.physicalGoal ?? 50;
  const mentalPoints = dailyGoals?.mentalPoints ?? 0;
  const mentalGoal = dailyGoals?.mentalGoal ?? 30;
  const currentStreak = streak?.currentStreak ?? 0;

  // Detect physical points changes - Requirements: 2.1, 2.7, 5.5
  // IMPORTANT: Always call this hook, even when data is loading
  useAnimationTrigger(physicalPoints, (prevPoints, currentPoints) => {
    if (prevPoints !== undefined && currentPoints > prevPoints) {
      setPhysicalPulse(true);
      setTimeout(() => setPhysicalPulse(false), 1000);
    }
  });

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
    if (!currentDog || !firstUser) return;

    setIsLoggingMood(true);
    try {
      await logMoodMutation({
        dogId: currentDog._id,
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
  // Only check currentDog since other queries depend on it
  if (currentDog === undefined) {
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

  // Get mood emoji
  const moodEmoji = getMoodEmoji(latestMood?.mood);

  // Check if partner is logging activity
  const isPartnerLogging =
    partnerPresence?.location === "log-activity" && partnerPresence.partnerName;

  return (
    <>
      <div className="relative">
        {/* Dog Chip - Requirements: 1.1, 1.3 - Positioned at top left */}
        <div className="flex items-start justify-start px-5 pt-3 pb-2">
          <DogChip
            dogId={currentDog?._id || null}
            dogName={currentDog?.name || null}
            dogLevel={currentDog?.overallLevel || null}
            onClick={() => setShowDogMenu(true)}
          />
        </div>

        {/* Resource indicators */}
        <div className="flex items-center justify-between px-5 pb-3">
          <div className="flex items-center gap-2 bg-[#121216]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#3d3d3d]/30">
            <Flame size={16} strokeWidth={2} className="text-orange-500" />
            <span className="text-[#f9dca0] text-xs font-medium">
              {currentStreak}
            </span>
          </div>
          <PulseWrapper
            isActive={physicalPulse}
            color="#22d3ee"
            intensity={
              physicalPoints >= physicalGoal ? "celebration" : "normal"
            }
          >
            <div
              className="flex items-center gap-1.5 bg-[#121216]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border transition-colors"
              style={{
                borderColor:
                  physicalPoints >= physicalGoal
                    ? "#22d3ee"
                    : "rgba(61, 61, 61, 0.3)",
              }}
            >
              <Dumbbell size={14} strokeWidth={2} className="text-cyan-400" />
              <span className="text-[#f9dca0] text-xs font-medium">
                {physicalPoints}/{physicalGoal}
              </span>
              <span className="text-[#888] text-[9px] uppercase tracking-wide pt-1">
                STR
              </span>
            </div>
          </PulseWrapper>
          <div
            className="flex items-center gap-1.5 bg-[#121216]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border transition-colors"
            style={{
              borderColor:
                mentalPoints >= mentalGoal
                  ? "#a855f7"
                  : "rgba(61, 61, 61, 0.3)",
            }}
          >
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

      {/* Dog Menu - Requirements: 2.1, 2.2, 2.3, 2.4, 2.5 */}
      {currentDog && (
        <DogMenu
          isOpen={showDogMenu}
          onClose={() => setShowDogMenu(false)}
          activeDogId={activeDogId}
          householdId={currentDog.householdId}
          onDogSelect={handleDogSelect}
          onAddDog={handleAddDog}
        />
      )}

      {/* Add Dog Modal - Requirements: 4.1, 7.1, 7.2, 7.3 */}
      {/* Lazy loaded with Suspense fallback - Requirements: 10.1 */}
      <Suspense fallback={null}>
        <AddDogModal
          isOpen={showAddDogModal}
          onClose={() => setShowAddDogModal(false)}
          onSuccess={handleDogCreated}
        />
      </Suspense>

      {/* Quest Banner - Requirements: 8.1, 8.2, 8.3, 8.4 */}
      {questBanner && (
        <QuestBanner
          questId={questBanner.questId}
          questName={questBanner.questName}
          targetReps={questBanner.targetReps}
          dogName={questBanner.dogName}
          onDismiss={() => setQuestBanner(null)}
          autoDismissMs={4000}
        />
      )}
    </>
  );
}
