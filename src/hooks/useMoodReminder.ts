import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Hook to manage daily mood reminder logic
 * Shows reminder after 6pm if no mood has been logged today
 * Handles dismissal state in localStorage
 * Requirements: 26
 */
export function useMoodReminder(dogId: Id<"dogs"> | undefined) {
  const [shouldShowReminder, setShouldShowReminder] = useState(false);

  // Query to check if mood has been logged today
  const todaysMoods = useQuery(
    api.queries.getTodaysMoods,
    dogId ? { dogId } : "skip"
  );

  useEffect(() => {
    if (!dogId || !todaysMoods) {
      setShouldShowReminder(false);
      return;
    }

    // Check if current time is after 6pm (18:00)
    const now = new Date();
    const currentHour = now.getHours();
    const isAfter6pm = currentHour >= 18;

    if (!isAfter6pm) {
      setShouldShowReminder(false);
      return;
    }

    // Check if mood has been logged today
    const hasMoodToday = todaysMoods.hasMoodToday;

    if (hasMoodToday) {
      setShouldShowReminder(false);
      return;
    }

    // Check localStorage for dismissal state
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const dismissalKey = `moodReminderDismissed_${today}`;
    const dismissedAt = localStorage.getItem(dismissalKey);

    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const now = Date.now();
      const twoHoursInMs = 2 * 60 * 60 * 1000;

      // Check if "Remind Me Later" was clicked (dismissal is temporary)
      const remindLaterKey = `moodReminderRemindLater_${today}`;
      const isRemindLater = localStorage.getItem(remindLaterKey) === "true";

      if (isRemindLater) {
        // If less than 2 hours have passed, don't show reminder
        if (now - dismissedTime < twoHoursInMs) {
          setShouldShowReminder(false);
          return;
        } else {
          // 2 hours have passed, clear the remind later flag
          localStorage.removeItem(remindLaterKey);
        }
      } else {
        // Full dismissal for the day
        setShouldShowReminder(false);
        return;
      }
    }

    // All conditions met: show reminder
    setShouldShowReminder(true);
  }, [dogId, todaysMoods]);

  const dismissReminder = (type: "full" | "remindLater") => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const dismissalKey = `moodReminderDismissed_${today}`;
    const remindLaterKey = `moodReminderRemindLater_${today}`;

    // Store dismissal timestamp
    localStorage.setItem(dismissalKey, Date.now().toString());

    if (type === "remindLater") {
      // Mark as "remind later" so we check again in 2 hours
      localStorage.setItem(remindLaterKey, "true");
    } else {
      // Full dismissal - remove remind later flag if it exists
      localStorage.removeItem(remindLaterKey);
    }

    setShouldShowReminder(false);
  };

  return {
    shouldShowReminder,
    dismissReminder,
  };
}
