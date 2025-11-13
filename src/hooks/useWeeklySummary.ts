import { useState, useEffect } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { getWeekDateRange } from "../lib/dateUtils";

interface UseWeeklySummaryReturn {
  shouldShowModal: boolean;
  weekStartDate: string; // YYYY-MM-DD
  weekEndDate: string; // YYYY-MM-DD
}

/**
 * Hook to determine when to show the weekly summary modal
 * Shows modal on Sunday 6 PM - Monday 10 AM if not dismissed for current week
 */
export function useWeeklySummary(
  dogId: Id<"dogs"> | undefined
): UseWeeklySummaryReturn {
  const [shouldShowModal, setShouldShowModal] = useState(false);

  useEffect(() => {
    if (!dogId) {
      setShouldShowModal(false);
      return;
    }

    // Get current date/time
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
    const currentHour = now.getHours();

    // Check if we're in the time window
    const isSundayEvening = dayOfWeek === 0 && currentHour >= 18;
    const isMondayMorning = dayOfWeek === 1 && currentHour < 10;
    const isInTimeWindow = isSundayEvening || isMondayMorning;

    if (!isInTimeWindow) {
      setShouldShowModal(false);
      return;
    }

    // Calculate week end date (most recent Sunday)
    const { weekEndDate } = getWeekDateRange();

    // Check localStorage for dismissal
    const dismissalKey = `weeklySummaryDismissed_${weekEndDate}`;
    const dismissedAt = localStorage.getItem(dismissalKey);

    if (dismissedAt) {
      setShouldShowModal(false);
      return;
    }

    // All conditions met: show modal
    setShouldShowModal(true);
  }, [dogId]);

  const { weekStartDate, weekEndDate } = getWeekDateRange();

  return {
    shouldShowModal,
    weekStartDate,
    weekEndDate,
  };
}
