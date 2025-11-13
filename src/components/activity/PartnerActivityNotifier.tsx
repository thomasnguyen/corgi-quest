import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from "../../contexts/ToastContext";
import type { Id } from "../../../convex/_generated/dataModel";

interface PartnerActivityNotifierProps {
  dogId: Id<"dogs">;
  currentUserId: Id<"users">;
}

/**
 * PartnerActivityNotifier - Real-time notifications for partner activities
 *
 * Showcases Convex's real-time capabilities by subscribing to partner activities
 * and displaying instant notifications when they log training sessions.
 *
 * This component demonstrates:
 * - Real-time data sync across devices
 * - Filtering and deduplication of notifications
 * - Optimized queries with batch fetching
 */
export function PartnerActivityNotifier({
  dogId,
  currentUserId,
}: PartnerActivityNotifierProps) {
  const { showToast } = useToast();
  const seenActivitiesRef = useRef<Set<string>>(new Set());

  // Subscribe to recent partner activities (updates in real-time!)
  const recentActivities = useQuery(
    api.queries.getRecentPartnerActivities,
    dogId && currentUserId ? { dogId, currentUserId } : "skip"
  );

  useEffect(() => {
    if (!recentActivities || recentActivities.length === 0) {
      return;
    }

    // Process new activities
    recentActivities.forEach((activity) => {
      const activityKey = activity._id;

      // Skip if we've already shown a notification for this activity
      if (seenActivitiesRef.current.has(activityKey)) {
        return;
      }

      // Mark as seen
      seenActivitiesRef.current.add(activityKey);

      // Clean up old entries (keep last 50)
      if (seenActivitiesRef.current.size > 50) {
        const entries = Array.from(seenActivitiesRef.current);
        seenActivitiesRef.current = new Set(entries.slice(-50));
      }

      // Format activity description
      const activityDescription = formatActivityDescription(activity);

      // Show notification
      showToast(
        `${activity.userName} just logged: ${activityDescription} (+${activity.totalXP} XP)`,
        "success"
      );
    });
  }, [recentActivities, showToast]);

  // This component doesn't render anything - it's just for side effects
  return null;
}

/**
 * Format activity for display in notification
 */
function formatActivityDescription(activity: {
  type: string;
  duration?: number;
}): string {
  const { type, duration } = activity;

  // Convert duration from seconds to minutes if present
  const durationText = duration ? ` (${Math.round(duration / 60)}min)` : "";

  // Format activity type nicely
  const formattedType = type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return `${formattedType}${durationText}`;
}
