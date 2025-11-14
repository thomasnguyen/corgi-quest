import { ReactNode, useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import BottomNav from "./BottomNav";
import { useToast } from "../../contexts/ToastContext";
import { useMoodReminder } from "../../hooks/useMoodReminder";
import MoodReminderPopup from "../mood/MoodReminderPopup";
import { useSelectedCharacter } from "../../hooks/useSelectedCharacter";
import AppExplanation from "./AppExplanation";
import { useWeeklySummary } from "../../hooks/useWeeklySummary";
import WeeklySummaryModal from "../summary/WeeklySummaryModal";
import AnimationDebugPanel from "../animations/AnimationDebugPanel";
import { useConfetti } from "../../hooks/useConfetti";
import { useAnimationTrigger } from "../../hooks/useAnimationTrigger";

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout component with real-time activity and mood feed subscriptions
 * Detects new activities and moods, shows toast notifications
 * Also detects level-ups by watching stat changes
 * Shows daily mood reminder after 6pm if no mood logged
 * Shows weekly summary modal on Sunday evening or Monday morning
 *
 * Debug Mode: Add ?debug=true to URL to show animation testing panel
 * Requirements: 1, 21, 22, 26, 5.1, 5.2
 */
export default function Layout({ children }: LayoutProps) {
  const { showToast } = useToast();

  // Get selected character
  const { selectedCharacterId } = useSelectedCharacter();

  // Get the first dog (demo purposes)
  const firstDog = useQuery(api.queries.getFirstDog);

  // Confetti hook for level-up animations (Subtask 7.2)
  const { triggerOverallConfetti } = useConfetti();

  // Weekly summary modal state
  const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);

  // Check if we should show the weekly summary modal
  const { shouldShowModal, weekStartDate, weekEndDate } = useWeeklySummary(
    firstDog?._id
  );

  // Animation debug state
  const [isRealTimeAnimationsEnabled, setIsRealTimeAnimationsEnabled] =
    useState(true);
  const [debugMode, setDebugMode] = useState(false);

  // Check for query parameter to force show modal (for testing)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const forceShow = params.get("showWeeklySummary") === "true";
      if (forceShow) {
        if (firstDog === null) {
          console.error("Cannot show weekly summary: No dog found in database");
          return;
        }
        if (firstDog && weekStartDate && weekEndDate) {
          console.log("Opening weekly summary modal via URL parameter", {
            firstDog: firstDog._id,
            weekStartDate,
            weekEndDate,
          });
          setIsWeeklySummaryOpen(true);
        } else {
          console.log("Waiting for data to load...", {
            firstDog: firstDog ? "loaded" : "loading",
            weekStartDate,
            weekEndDate,
          });
        }
      }
    }
  }, [firstDog, weekStartDate, weekEndDate]);

  // URL parameter testing mode - parse ?testAnimation parameter
  // Supports: floatingXP, pulse, confetti, levelUp, partnerActivity
  // Can combine multiple with comma: ?testAnimation=floatingXP,pulse
  // Requirements: 5.1, 5.2
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const testAnimation = params.get("testAnimation");
      const debug = params.get("debug") === "true";

      setDebugMode(debug);

      if (testAnimation) {
        // Parse comma-separated animation types
        const animationTypes = testAnimation.split(",").map((s) => s.trim());

        if (debug) {
          console.log(
            "[Animation Test Mode] Triggering animations:",
            animationTypes
          );
        }

        // Trigger each animation with a slight delay between them
        animationTypes.forEach((type, index) => {
          setTimeout(() => {
            if (debug) {
              console.log(`[Animation Test Mode] Triggering: ${type}`);
            }
            handleTriggerAnimation(type);
          }, index * 500); // 500ms delay between each animation
        });
      }
    }
  }, []);

  // Automatically show modal based on time window and dismissal state
  useEffect(() => {
    if (shouldShowModal) {
      setIsWeeklySummaryOpen(true);
    }
  }, [shouldShowModal]);

  // Subscribe to activity feed for real-time updates
  const activityFeed = useQuery(
    api.queries.getActivityFeed,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Subscribe to dog profile to detect level-ups
  const dogProfile = useQuery(
    api.queries.getDogProfile,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Detect overall level changes and trigger confetti (Subtask 7.1)
  // Requirements: 3.1, 5.3, 5.6
  useAnimationTrigger(
    dogProfile?.dog?.overallLevel,
    (prevLevel, currentLevel) => {
      if (
        prevLevel !== undefined &&
        currentLevel !== undefined &&
        currentLevel > prevLevel
      ) {
        // Trigger overall confetti animation (Subtask 7.2)
        // Requirements: 3.1, 3.3, 3.5, 3.6
        triggerOverallConfetti();

        // Show toast notification
        showToast(`🎉 Overall leveled up to ${currentLevel}!`, "success");
      }
    },
    { skipInitial: true } // Skip animation on initial mount (Requirement 5.6)
  );

  // Subscribe to mood feed for real-time mood updates
  const moodFeed = useQuery(
    api.queries.getMoodFeed,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Mood reminder hook
  const { shouldShowReminder, dismissReminder } = useMoodReminder(
    firstDog?._id
  );

  // Track previous activity IDs to detect new activities
  const previousActivityIdsRef = useRef<Set<string>>(new Set());

  // Track previous mood IDs to detect new moods
  const previousMoodIdsRef = useRef<Set<string>>(new Set());

  // Track previous stat levels to detect level-ups
  const previousStatLevelsRef = useRef<Map<string, number>>(new Map());

  // Track recent level-ups to associate with partner activity toasts (Subtask 9.3)
  // Requirements: 4.4
  const recentLevelUpsRef = useRef<
    Array<{ statType: string; newLevel: number; timestamp: number }>
  >([]);

  // Get current user ID to identify partner activities (Subtask 9.1)
  // Requirements: 4.1, 4.7
  const currentUserId = selectedCharacterId;

  // Detect new activities and show enhanced toasts for partner activities
  // Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8
  useEffect(() => {
    if (
      !activityFeed ||
      activityFeed.length === 0 ||
      !isRealTimeAnimationsEnabled ||
      !currentUserId
    ) {
      return;
    }

    // Get current activity IDs
    const currentActivityIds = new Set(
      activityFeed.map((activity) => activity._id)
    );

    // If this is the first load, just store the IDs without showing toasts
    if (previousActivityIdsRef.current.size === 0) {
      previousActivityIdsRef.current = currentActivityIds;
      return;
    }

    // Find new activities (IDs that weren't in previous set)
    const newActivities = activityFeed.filter(
      (activity) => !previousActivityIdsRef.current.has(activity._id)
    );

    // Filter to find partner's activities (Subtask 9.1)
    // Requirements: 4.1, 4.7
    const partnerActivities = newActivities.filter(
      (activity) => activity.userId !== currentUserId
    );

    // Show enhanced toast for each new partner activity
    partnerActivities.forEach((activity) => {
      // Format stat gains as "PHY +30, IMP +10" (Subtask 9.2)
      // Requirements: 4.1, 4.2, 4.3
      const statGainsText = activity.statGains
        .map((gain) => `${gain.statType} +${gain.xpAmount}`)
        .join(", ");

      // Calculate total XP (Subtask 9.2)
      // Requirements: 4.2
      const totalXP = activity.statGains.reduce(
        (sum, gain) => sum + gain.xpAmount,
        0
      );

      // Build base message with partner name, activity name, and stat breakdown
      // Requirements: 4.1, 4.2, 4.3
      let message = `${activity.userName} logged "${activity.activityName}" • +${totalXP} XP`;

      if (statGainsText) {
        message += ` (${statGainsText})`;
      }

      // Check for recent level-ups to include in toast (Subtask 9.3)
      // Requirements: 4.4
      const now = Date.now();
      const recentLevelUps = recentLevelUpsRef.current.filter(
        (levelUp) => now - levelUp.timestamp < 2000 // Within 2 seconds
      );

      if (recentLevelUps.length > 0) {
        const levelUpText = recentLevelUps
          .map((levelUp) => `${levelUp.statType} → Lv${levelUp.newLevel}`)
          .join(", ");
        message += ` 🎉 Level Up: ${levelUpText}`;
      }

      // Show toast with 4-second duration for partner activities (Subtask 9.4)
      // Requirements: 4.5, 4.6, 4.8
      showToast(message, "success", 4000);
    });

    // Update previous activity IDs
    previousActivityIdsRef.current = currentActivityIds;
  }, [activityFeed, showToast, isRealTimeAnimationsEnabled, currentUserId]);

  // Detect new moods and show toasts (only for partner's moods, not current user's)
  useEffect(() => {
    if (
      !moodFeed ||
      moodFeed.length === 0 ||
      !selectedCharacterId ||
      !isRealTimeAnimationsEnabled
    ) {
      return;
    }

    // Get current mood IDs
    const currentMoodIds = new Set(moodFeed.map((mood) => mood._id));

    // If this is the first load, just store the IDs without showing toasts
    if (previousMoodIdsRef.current.size === 0) {
      previousMoodIdsRef.current = currentMoodIds;
      return;
    }

    // Find new moods (IDs that weren't in previous set)
    const newMoods = moodFeed.filter(
      (mood) => !previousMoodIdsRef.current.has(mood._id)
    );

    // Filter out current user's own moods - only show partner's moods
    const partnerMoods = newMoods.filter(
      (mood) => mood.userId !== selectedCharacterId
    );

    // Mood emoji mapping
    const MOOD_EMOJI = {
      calm: "😊",
      anxious: "😰",
      reactive: "😡",
      playful: "🎾",
      tired: "😴",
      neutral: "😐",
    };

    const MOOD_LABEL = {
      calm: "Calm",
      anxious: "Anxious",
      reactive: "Reactive",
      playful: "Playful",
      tired: "Tired",
      neutral: "Neutral",
    };

    // Show toast for each new partner mood
    partnerMoods.forEach((mood) => {
      const emoji = MOOD_EMOJI[mood.mood];
      const label = MOOD_LABEL[mood.mood];
      const message = `${mood.userName} logged: Bumi is ${emoji} ${label}`;
      showToast(message, "info");
    });

    // Update previous mood IDs
    previousMoodIdsRef.current = currentMoodIds;
  }, [moodFeed, showToast, selectedCharacterId, isRealTimeAnimationsEnabled]);

  // Detect stat level-ups by watching stat changes
  // Track level-ups for potential inclusion in partner activity toasts (Subtask 9.3)
  // Requirements: 4.4
  useEffect(() => {
    if (!dogProfile || !dogProfile.stats || !isRealTimeAnimationsEnabled) {
      return;
    }

    const now = Date.now();

    // Check each stat level
    dogProfile.stats.forEach((stat) => {
      const key = stat.statType;
      const previousLevel = previousStatLevelsRef.current.get(key);

      if (previousLevel !== undefined && stat.level > previousLevel) {
        // Track this level-up for potential association with partner activity
        recentLevelUpsRef.current.push({
          statType: stat.statType,
          newLevel: stat.level,
          timestamp: now,
        });

        // Clean up old level-ups (older than 5 seconds)
        recentLevelUpsRef.current = recentLevelUpsRef.current.filter(
          (levelUp) => now - levelUp.timestamp < 5000
        );

        showToast(
          `🎉 ${stat.statType} leveled up to ${stat.level}!`,
          "success"
        );
      }

      previousStatLevelsRef.current.set(key, stat.level);
    });
  }, [dogProfile, showToast, isRealTimeAnimationsEnabled]);

  // Handle animation triggers from debug panel and URL parameters
  // Requirements: 5.1, 5.2
  const handleTriggerAnimation = (type: string, params?: any) => {
    if (debugMode) {
      console.log(`[Animation Debug] Triggering animation: ${type}`, params);
    }

    switch (type) {
      case "floatingXP":
        // Simulate XP gain on all stats
        // This would trigger floating XP animations on StatOrb components
        if (debugMode) {
          console.log(
            `[Animation Debug] FloatingXP: +${params?.amount || 50} XP on all stats`
          );
        }
        showToast(
          `Debug: Floating XP animation triggered (+${params?.amount || 50} XP)`,
          "info"
        );
        break;

      case "pulse":
        // Trigger pulse on daily goals
        // This would trigger pulse animations on TopResourceBar
        if (debugMode) {
          console.log(
            `[Animation Debug] Pulse: ${params?.intensity || "normal"} intensity`
          );
        }
        showToast(
          `Debug: Pulse animation triggered (${params?.intensity || "normal"})`,
          "info"
        );
        break;

      case "confetti":
        // Trigger overall confetti
        // This triggers the actual confetti animation from top of screen
        if (debugMode) {
          console.log(
            `[Animation Debug] Confetti: ${params?.count || 50} particles`
          );
        }
        triggerOverallConfetti();
        showToast(
          `Debug: Confetti animation triggered (${params?.count || 50} particles)`,
          "info"
        );
        break;

      case "levelUp":
        // Simulate overall level-up with confetti
        // This triggers the actual overall confetti animation
        if (debugMode) {
          console.log("[Animation Debug] Level Up: Overall Confetti");
        }
        triggerOverallConfetti();
        showToast("🎉 Debug: Level up animation triggered!", "success");
        break;

      case "partnerActivity":
        // Show partner activity toast
        // This demonstrates the enhanced partner activity notification
        if (debugMode) {
          console.log("[Animation Debug] Partner Activity: Toast notification");
        }
        showToast("Holly logged Walk - PHY +30 XP, SOC +20 XP", "success");
        break;

      case "all":
        // Trigger all animations in sequence
        if (debugMode) {
          console.log("[Animation Debug] Triggering all animations...");
        }
        showToast("Debug: Triggering all animations...", "info");
        setTimeout(() => handleTriggerAnimation("floatingXP", params), 100);
        setTimeout(() => handleTriggerAnimation("pulse", params), 600);
        setTimeout(() => handleTriggerAnimation("confetti", params), 1200);
        setTimeout(() => handleTriggerAnimation("partnerActivity"), 1800);
        break;

      default:
        console.warn(`[Animation Debug] Unknown animation type: ${type}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#121216] flex flex-col">
      {/* Floating explanation - desktop only */}
      <AppExplanation />

      <main className="flex-1 pb-32 overflow-y-auto">
        <div className="max-w-md mx-auto">{children}</div>
      </main>

      <BottomNav />

      {/* Mood reminder popup */}
      {shouldShowReminder && firstDog && selectedCharacterId && (
        <MoodReminderPopup
          dogId={firstDog._id}
          userId={selectedCharacterId}
          onDismiss={dismissReminder}
        />
      )}

      {/* Weekly summary modal */}
      {isWeeklySummaryOpen && firstDog && weekStartDate && weekEndDate && (
        <WeeklySummaryModal
          dogId={firstDog._id}
          isOpen={isWeeklySummaryOpen}
          onClose={() => setIsWeeklySummaryOpen(false)}
          weekStartDate={weekStartDate}
          weekEndDate={weekEndDate}
        />
      )}

      {/* Animation debug panel */}
      <AnimationDebugPanel
        onTriggerAnimation={handleTriggerAnimation}
        isRealTimeEnabled={isRealTimeAnimationsEnabled}
        onToggleRealTime={setIsRealTimeAnimationsEnabled}
      />
    </div>
  );
}
