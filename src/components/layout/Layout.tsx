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

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout component with real-time activity and mood feed subscriptions
 * Detects new activities and moods, shows toast notifications
 * Also detects level-ups by watching stat changes
 * Shows daily mood reminder after 6pm if no mood logged
 * Shows weekly summary modal on Sunday evening or Monday morning
 * Requirements: 1, 21, 22, 26
 */
export default function Layout({ children }: LayoutProps) {
  const { showToast } = useToast();

  // Get selected character
  const { selectedCharacterId } = useSelectedCharacter();

  // Get the first dog (demo purposes)
  const firstDog = useQuery(api.queries.getFirstDog);

  // Weekly summary modal state
  const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);

  // Check if we should show the weekly summary modal
  const { shouldShowModal, weekStartDate, weekEndDate } = useWeeklySummary(
    firstDog?._id
  );

  // Check for query parameter to force show modal (for testing)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const forceShow = params.get("showWeeklySummary") === "true";
      if (forceShow && firstDog) {
        setIsWeeklySummaryOpen(true);
      }
    }
  }, [firstDog]);

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
  const previousOverallLevelRef = useRef<number | null>(null);

  // Detect new activities and show toasts
  useEffect(() => {
    if (!activityFeed || activityFeed.length === 0) {
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

    // Show toast for each new activity
    newActivities.forEach((activity) => {
      // Format stat gains as "PHY +30 XP, IMP +10 XP"
      const statGainsText = activity.statGains
        .map((gain) => `${gain.statType} +${gain.xpAmount} XP`)
        .join(", ");

      const message = `${activity.userName} logged ${activity.activityName}${statGainsText ? ` - ${statGainsText}` : ""}`;

      showToast(message, "success");
    });

    // Update previous activity IDs
    previousActivityIdsRef.current = currentActivityIds;
  }, [activityFeed, showToast]);

  // Detect new moods and show toasts (only for partner's moods, not current user's)
  useEffect(() => {
    if (!moodFeed || moodFeed.length === 0 || !selectedCharacterId) {
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
  }, [moodFeed, showToast, selectedCharacterId]);

  // Detect level-ups by watching stat changes
  useEffect(() => {
    if (!dogProfile || !dogProfile.stats || !dogProfile.dog) {
      return;
    }

    // Check overall level
    if (previousOverallLevelRef.current !== null) {
      const currentOverallLevel = dogProfile.dog.overallLevel;
      if (currentOverallLevel > previousOverallLevelRef.current) {
        showToast(
          `🎉 Overall leveled up to ${currentOverallLevel}!`,
          "success"
        );
      }
    }
    previousOverallLevelRef.current = dogProfile.dog.overallLevel;

    // Check each stat level
    dogProfile.stats.forEach((stat) => {
      const key = stat.statType;
      const previousLevel = previousStatLevelsRef.current.get(key);

      if (previousLevel !== undefined && stat.level > previousLevel) {
        showToast(
          `🎉 ${stat.statType} leveled up to ${stat.level}!`,
          "success"
        );
      }

      previousStatLevelsRef.current.set(key, stat.level);
    });
  }, [dogProfile, showToast]);

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
      {isWeeklySummaryOpen && firstDog && (
        <WeeklySummaryModal
          dogId={firstDog._id}
          isOpen={isWeeklySummaryOpen}
          onClose={() => setIsWeeklySummaryOpen(false)}
          weekStartDate={weekStartDate}
          weekEndDate={weekEndDate}
        />
      )}
    </div>
  );
}
