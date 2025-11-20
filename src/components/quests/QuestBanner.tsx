import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { Id } from "../../../convex/_generated/dataModel";

interface QuestBannerProps {
  questId: Id<"quests">;
  questName: string;
  targetReps: number;
  dogName: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

/**
 * QuestBanner component displays a notification when a new quest is created
 *
 * Shows quest name and rep count at the top of the screen.
 * Auto-dismisses after specified duration (default 4 seconds).
 * Tappable to navigate to quest detail screen.
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
export function QuestBanner({
  questId,
  questName,
  targetReps,
  dogName,
  onDismiss,
  autoDismissMs = 4000,
}: QuestBannerProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  // Trigger slide-in animation on mount - Requirements: 8.1
  useEffect(() => {
    // Small delay to trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    });

    // Auto-dismiss after specified duration - Requirements: 8.2
    const timer = setTimeout(() => {
      handleDismiss();
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [autoDismissMs]);

  // Handle dismissal with animation
  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for animation to complete before calling onDismiss
    setTimeout(() => {
      onDismiss();
    }, 300); // Match animation duration
  };

  // Handle tap to navigate to quest detail - Requirements: 8.3
  const handleTap = () => {
    navigate({ to: `/quests/${questId}` });
    handleDismiss();
  };

  return (
    <>
      {/* Banner positioned at top of screen - Requirements: 8.1, 8.4 */}
      <div
        className={`fixed top-0 left-0 right-0 z-30 flex justify-center px-4 pt-4 pointer-events-none transition-all duration-300 ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div
          onClick={handleTap}
          className="max-w-md w-full bg-[#1a1a1e]/95 backdrop-blur-sm border border-[#f5c35f]/50 rounded-lg shadow-lg pointer-events-auto cursor-pointer active:scale-98 transition-transform"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            {/* Quest info */}
            <div className="flex-1 min-w-0">
              <p className="text-[#f5c35f] text-xs font-semibold uppercase tracking-wide mb-1">
                New quest added for {dogName}
              </p>
              <p className="text-white text-sm font-medium truncate">
                {questName} ({targetReps} reps)
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style>{`
        .active\\:scale-98:active {
          transform: scale(0.98);
        }
      `}</style>
    </>
  );
}
