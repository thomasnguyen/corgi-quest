import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  X,
  Activity,
  Zap,
  TrendingUp,
  Target,
  Flame,
  Heart,
  Sparkles,
} from "lucide-react";
import { formatWeekRange } from "../../lib/dateUtils";
import { useEffect, useRef, useState } from "react";

interface WeeklySummaryModalProps {
  dogId: Id<"dogs">;
  isOpen: boolean;
  onClose: () => void;
  weekStartDate: string;
  weekEndDate: string;
}

/**
 * Weekly Summary Modal - Full-screen overlay showing weekly training progress
 * Displays aggregated stats, streaks, activity breakdown, and personalized tips
 * Requirements: 1.4, 1.5, 9.1, 9.2, 9.4, 10.1, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 11.5, 13.1, 13.2, 13.3, 13.4
 */
export default function WeeklySummaryModal({
  dogId,
  isOpen,
  onClose,
  weekStartDate,
  weekEndDate,
}: WeeklySummaryModalProps) {
  // Subscribe to weekly summary data using Convex real-time query
  const summaryData = useQuery(api.queries.getWeeklySummary, {
    dogId,
    weekStartDate,
    weekEndDate,
  });

  // Get dog data for portrait display
  const dogProfile = useQuery(api.queries.getDogProfile, { dogId });

  // Get currently equipped item to check if moon item is equipped (for demo)
  const equippedItem = useQuery(api.queries.getEquippedItem, {
    dogId,
  });

  // AI Recommendations state
  const [aiRecommendations, setAiRecommendations] = useState<
    Array<{
      activityName: string;
      reasoning: string;
      expectedMoodImpact: string;
    }>
  >([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);
  const generateWeeklyRecommendations = useAction(
    api.actions.generateWeeklyRecommendations
  );
  const cacheWeeklyRecommendations = useMutation(
    api.mutations.cacheWeeklyRecommendations
  );

  // Get cached weekly recommendations
  const cachedRecommendations = useQuery(
    api.queries.getCachedWeeklyRecommendations,
    { dogId, weekEndDate }
  );

  // Refs for focus trap
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle dismissal - store in localStorage and close modal
  const handleDismiss = () => {
    const dismissalKey = `weeklySummaryDismissed_${weekEndDate}`;
    localStorage.setItem(dismissalKey, Date.now().toString());
    onClose();
  };

  // ESC key handler to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleDismiss();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, weekEndDate, onClose]);

  // Load cached recommendations first, then generate if needed
  useEffect(() => {
    if (!isOpen || !summaryData) return;

    // If we have cached recommendations, use them
    if (cachedRecommendations?.recommendations) {
      setAiRecommendations(cachedRecommendations.recommendations.slice(0, 1));
      setIsLoadingRecommendations(false);
      return;
    }

    // If cache is still loading, wait
    if (cachedRecommendations === undefined) {
      return;
    }

    // No cache found, generate new recommendations
    const loadRecommendations = async () => {
      setIsLoadingRecommendations(true);
      try {
        const recommendations = await generateWeeklyRecommendations({
          dogId,
          weekStartDate,
          weekEndDate,
        });
        const topRecommendations = recommendations.slice(0, 1);
        setAiRecommendations(topRecommendations);

        // Cache the recommendations for this week
        await cacheWeeklyRecommendations({
          dogId,
          weekEndDate,
          recommendations: JSON.stringify(recommendations),
        });
      } catch (error) {
        console.error("Failed to generate AI recommendations:", error);
        // Don't show error to user, just leave empty
        setAiRecommendations([]);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    loadRecommendations();
  }, [
    isOpen,
    dogId,
    weekStartDate,
    weekEndDate,
    summaryData,
    generateWeeklyRecommendations,
    cacheWeeklyRecommendations,
    cachedRecommendations,
  ]);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // Focus the close button when modal opens
    closeButtonRef.current?.focus();

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !modalRef.current) return;

      // Get all focusable elements within the modal
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // If shift+tab on first element, focus last element
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
      // If tab on last element, focus first element
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => {
      document.removeEventListener("keydown", handleTabKey);
    };
  }, [isOpen]);

  // Don't render if modal is not open
  if (!isOpen) {
    return null;
  }

  // Loading state - show spinner while data is being fetched
  if (summaryData === undefined) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/80"
        role="dialog"
        aria-modal="true"
        aria-labelledby="loading-title"
        aria-busy="true"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <picture>
            <source srcSet="/stat_bg2.webp" type="image/webp" />
            <img
              src="/stat_bg2.png"
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
          </picture>
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="h-full flex flex-col items-center justify-center p-8 relative z-10">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"
              role="status"
              aria-label="Loading"
            />
            <p id="loading-title" className="text-white text-lg font-medium">
              Loading weekly summary...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - show error message if data fetch fails
  if (summaryData === null) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/80"
        role="dialog"
        aria-modal="true"
        aria-labelledby="error-title"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <picture>
            <source srcSet="/stat_bg2.webp" type="image/webp" />
            <img
              src="/stat_bg2.png"
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
          </picture>
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div ref={modalRef} className="h-full flex flex-col p-6 relative z-10">
          <div className="flex justify-end mb-4">
            <button
              ref={closeButtonRef}
              onClick={handleDismiss}
              className="text-white hover:text-gray-400 transition-colors"
              aria-label="Close error dialog"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <h2
              id="error-title"
              className="text-red-500 text-xl font-bold mb-4"
            >
              Error
            </h2>
            <p className="text-gray-400 mb-6 text-center">
              Failed to load weekly summary. Please try again later.
            </p>
            <button
              onClick={handleDismiss}
              className="w-full max-w-sm bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - show encouraging message when no activities exist
  if (summaryData.totalActivities === 0) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/80"
        role="dialog"
        aria-modal="true"
        aria-labelledby="empty-summary-title"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <picture>
            <source srcSet="/stat_bg2.webp" type="image/webp" />
            <img
              src="/stat_bg2.png"
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
          </picture>
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div ref={modalRef} className="h-full flex flex-col p-6 relative z-10">
          <div className="flex justify-end mb-4">
            <button
              ref={closeButtonRef}
              onClick={handleDismiss}
              className="text-white hover:text-gray-400 transition-colors"
              aria-label="Close weekly summary"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <h2
              id="empty-summary-title"
              className="text-white text-xl font-bold mb-4 text-center"
            >
              Weekly Summary
            </h2>
            <p className="text-gray-400 text-center mb-6">
              Start logging activities to see your weekly summary!
            </p>
            <button
              onClick={handleDismiss}
              className="w-full max-w-sm bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get mood emoji
  const getMoodEmoji = (mood: string) => {
    const moodEmojis: Record<string, string> = {
      calm: "😌",
      anxious: "😰",
      reactive: "😤",
      playful: "😄",
      tired: "😴",
      neutral: "😐",
    };
    return moodEmojis[mood] || "🐕";
  };

  // Get trend emoji
  const getTrendEmoji = (trend: string) => {
    const trendEmojis: Record<string, string> = {
      improving: "📈",
      stable: "➡️",
      needs_attention: "📉",
    };
    return trendEmojis[trend] || "➡️";
  };

  // Main modal content - full screen with scrollable content
  return (
    <div
      className="fixed inset-0 z-50 bg-[#1a1a1f]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="weekly-summary-title"
      aria-describedby="weekly-summary-description"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <picture>
          <source srcSet="/stat_bg2.webp" type="image/webp" />
          <img
            src="/stat_bg2.png"
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
        </picture>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div
        ref={modalRef}
        className="h-full w-full flex flex-col overflow-y-auto relative z-10"
      >
        {/* Decorative corner images */}
        <div className="absolute top-0 left-0 z-20 pointer-events-none">
          <picture>
            <source srcSet="/left_corner.webp" type="image/webp" />
            <img
              src="/left_corner.png"
              alt=""
              className="w-16 h-16"
              loading="eager"
            />
          </picture>
        </div>
        <div className="absolute top-0 right-0 z-20 pointer-events-none">
          <picture>
            <source srcSet="/right_corner.webp" type="image/webp" />
            <img
              src="/right_corner.png"
              alt=""
              className="w-16 h-16"
              loading="eager"
            />
          </picture>
        </div>

        {/* Header with close button */}
        <div className="sticky top-0  backdrop-blur-sm border-gray-700/50 p-3 z-10">
          <div className="flex items-center justify-end">
            <button
              ref={closeButtonRef}
              onClick={handleDismiss}
              className="text-white hover:text-gray-400 transition-colors relative z-30"
              aria-label="Close weekly summary"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Dog Portrait Section */}
        {dogProfile?.dog && (
          <div className="text-center -mt-8 px-6 z-10">
            {/* Portrait with Border */}
            <div className="relative w-20 h-20 mx-auto mb-2">
              {/* Border SVG */}
              <img
                src="/Border.svg"
                alt=""
                loading="lazy"
                className="absolute inset-0 w-full h-full object-contain"
              />
              {/* Portrait placeholder */}
              <div className="relative w-16 h-16 mx-auto mt-1.5 rounded-full bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center overflow-hidden">
                {equippedItem?.item?.itemType === "moon" ? (
                  // Moon items always use mage_avatar
                  <picture>
                    <source srcSet="/mage_avatar.webp" type="image/webp" />
                    <img
                      src="/mage_avatar.png"
                      alt={dogProfile.dog.name}
                      fetchPriority="high"
                      className="w-full h-full object-cover"
                    />
                  </picture>
                ) : equippedItem?.generatedImageUrl && equippedItem.generatedImageUrl !== "" ? (
                  // AI-generated image for non-moon items
                  <img
                    src={equippedItem.generatedImageUrl}
                    alt={`${dogProfile.dog.name} wearing ${equippedItem.item.name}`}
                    fetchPriority="high"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to default avatar if generated image fails to load
                      e.currentTarget.src = "/default_avatar.png";
                    }}
                  />
                ) : (
                  // Default avatar when nothing equipped
                  <picture>
                    <source srcSet="/default_avatar.webp" type="image/webp" />
                    <img
                      src="/default_avatar.png"
                      alt={dogProfile.dog.name}
                      fetchPriority="high"
                      className="w-full h-full object-cover"
                    />
                  </picture>
                )}
              </div>
            </div>

            {/* Dog Name and Title - Centered */}
            <h2 className="text-xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent">
              {dogProfile.dog.name}
            </h2>

            {/* Weekly Summary Title */}
            <h3
              id="weekly-summary-title"
              className="text-3xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent"
            >
              Weekly Summary
            </h3>
            <p
              id="weekly-summary-description"
              className="text-gray-400 text-sm"
            >
              {formatWeekRange(weekStartDate, weekEndDate)}
            </p>
          </div>
        )}

        {/* Content sections */}
        <div className="flex-1 p-6 space-y-4">
          {/* AI Recommendations Section - Moved to top */}
          <section className="bg-[#111115 rounded-lg p-4 relative overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-[#D4AF37]" />
              <h3 className="text-white text-sm font-semibold uppercase tracking-wide">
                AI Recommendations
              </h3>
            </div>
            {isLoadingRecommendations ? (
              <div className="text-center py-4">
                <div className="inline-block w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-xs mt-2">
                  Generating personalized recommendations...
                </p>
              </div>
            ) : aiRecommendations.length > 0 ? (
              <div className="space-y-3">
                {aiRecommendations.map((rec, index) => (
                  <div key={index} className=" rounded-lg p-3">
                    <h4 className="text-white font-semibold text-sm mb-2 text-[#f5c35f]">
                      {rec.activityName}
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {rec.reasoning}
                    </p>
                    {rec.expectedMoodImpact && (
                      <p className="text-gray-400 text-xs italic border-t border-white/5 pt-2 mt-2">
                        Expected impact: {rec.expectedMoodImpact}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-xs text-center py-4">
                No recommendations available yet. Log some activities to get
                personalized suggestions!
              </p>
            )}
          </section>

          {/* This Week Section */}
          <section className="bg-black/40 border border-white/10 rounded-lg p-4 relative overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
            {/* Top gradient */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/5 to-transparent" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-sm font-semibold uppercase tracking-wide">
                This Week
              </h3>
              {/* Streak Status - Top right */}
              <div className="flex items-center gap-1">
                <Flame size={12} className="text-orange-500" />
                <span className="text-[10px] text-white">
                  <span className="font-bold text-[#f5c35f]">
                    {summaryData.currentStreak}
                  </span>
                  <span className="text-gray-400"> days</span>
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-gray-400" />
                  <span className="text-xs">Activities logged</span>
                </div>
                <span className="text-xs font-bold text-[#f5c35f]">
                  {summaryData.totalActivities}
                </span>
              </div>
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-gray-400" />
                  <span className="text-xs">XP gained</span>
                </div>
                <span className="text-xs font-bold text-[#f5c35f]">
                  {summaryData.totalXpGained}
                </span>
              </div>
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-gray-400" />
                  <span className="text-xs">Levels gained</span>
                </div>
                <span className="text-xs font-bold text-[#f5c35f]">
                  {summaryData.levelsGained.overall}
                </span>
              </div>
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-gray-400" />
                  <span className="text-xs">Days goals met</span>
                </div>
                <span className="text-xs font-bold text-[#f5c35f]">
                  {summaryData.daysGoalsMet} / 7
                </span>
              </div>
            </div>
          </section>

          {/* Stat Progress Section */}
          <section className="bg-black/40 border border-white/10 rounded-lg p-4 relative overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
            {/* Top gradient */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/5 to-transparent" />
            <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">
              Stat Progress
            </h3>
            <div className="space-y-2">
              {summaryData.highestStat && (
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-gray-400" />
                    <span className="text-xs">Highest stat</span>
                  </div>
                  <span className="text-xs font-bold text-[#f5c35f]">
                    {summaryData.highestStat.type} (Lvl{" "}
                    {summaryData.highestStat.level})
                  </span>
                </div>
              )}
              {summaryData.mostImprovedStat && (
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-gray-400" />
                    <span className="text-xs">Most improved</span>
                  </div>
                  <span className="text-xs font-bold text-[#f5c35f]">
                    {summaryData.mostImprovedStat.type} (+
                    {summaryData.mostImprovedStat.xpGained} XP)
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Mood Insights Section (conditional) */}
          {summaryData.moodInsights && (
            <section className="bg-black/40 border border-white/10 rounded-lg p-4 relative overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
              {/* Top gradient */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/5 to-transparent" />
              <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">
                Mood Insights
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-gray-400" />
                    <span className="text-xs">Most common mood</span>
                  </div>
                  <span className="text-xs font-bold text-[#f5c35f]">
                    {summaryData.moodInsights.mostCommon}{" "}
                    {getMoodEmoji(summaryData.moodInsights.mostCommon)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-gray-400" />
                    <span className="text-xs">Trend</span>
                  </div>
                  <span className="text-xs font-bold text-[#f5c35f]">
                    {summaryData.moodInsights.trend.replace("_", " ")}{" "}
                    {getTrendEmoji(summaryData.moodInsights.trend)}
                  </span>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer with Got it button */}
        <div className="sticky bottom-0 bg-black/40 backdrop-blur-sm border-t border-gray-700/50 p-6 z-10">
          <button
            onClick={handleDismiss}
            className="w-full bg-black border border-[#D4AF37]/50 text-[#f5c35f] py-3 px-4 rounded-lg font-bold text-base transition-all duration-200 hover:border-[#D4AF37] hover:bg-black/80 active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
