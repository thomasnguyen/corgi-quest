import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../convex/_generated/api";
import Layout from "../components/layout/Layout";
import ActivityFeedItem from "../components/activity/ActivityFeedItem";
import MoodFeedItem from "../components/mood/MoodFeedItem";
import TodaysBreakdown from "../components/activity/TodaysBreakdown";
import { useMemo } from "react";
import { useStaleQuery } from "../hooks/useStaleQuery";

export const Route = createFileRoute("/activity")({
  component: ActivityPage,
});

// Type for unified feed items
type FeedItem =
  | {
      type: "activity";
      _id: string;
      _creationTime: number;
      userName: string;
      activityName: string;
      description?: string;
      statGains: Array<{
        statType: "INT" | "PHY" | "IMP" | "SOC";
        xpAmount: number;
      }>;
    }
  | {
      type: "mood";
      _id: string;
      _creationTime: number;
      userName: string;
      mood: "calm" | "anxious" | "reactive" | "playful" | "tired" | "neutral";
      note?: string;
    };

function ActivityPage() {
  // Get the first dog (demo purposes) - use stale query to show cached data
  const firstDog = useStaleQuery(api.queries.getFirstDog, {});

  // Get activity feed - use stale query to show cached data
  const activityFeed = useStaleQuery(
    api.queries.getActivityFeed,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Get mood feed - use stale query to show cached data
  const moodFeed = useStaleQuery(
    api.queries.getMoodFeed,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Get today's activities for breakdown - use stale query
  const todaysActivities = useStaleQuery(
    api.queries.getTodaysActivities,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Get household users for filter - use stale query
  const householdUsers = useStaleQuery(
    api.queries.getHouseholdUsers,
    firstDog ? { householdId: firstDog.householdId } : "skip"
  );

  // Merge and sort activities and mood logs by timestamp
  const unifiedFeed = useMemo(() => {
    if (!activityFeed || !moodFeed) return [];

    const activities: FeedItem[] = activityFeed.map((activity) => ({
      type: "activity" as const,
      _id: activity._id,
      _creationTime: activity._creationTime,
      userName: activity.userName,
      activityName: activity.activityName,
      description: activity.description,
      statGains: activity.statGains,
    }));

    const moods: FeedItem[] = moodFeed.map((mood) => ({
      type: "mood" as const,
      _id: mood._id,
      _creationTime: mood._creationTime,
      userName: mood.userName,
      mood: mood.mood,
      note: mood.note,
    }));

    // Merge and sort by createdAt timestamp (newest first)
    return [...activities, ...moods].sort(
      (a, b) => b._creationTime - a._creationTime
    );
  }, [activityFeed, moodFeed]);

  // Loading state
  if (
    firstDog === undefined ||
    activityFeed === undefined ||
    moodFeed === undefined ||
    todaysActivities === undefined ||
    householdUsers === undefined
  ) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-[#121216]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#f5c35f] border-t-transparent"></div>
            <p className="mt-4 text-[#f9dca0] text-sm">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Empty state - no activities or moods yet
  if (unifiedFeed.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#121216] p-6">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent">
            ACTIVITY FEED
          </h1>
          <div className="flex items-center justify-center mt-20">
            <div className="text-center px-6">
              <p className="text-[#888] text-sm">
                No activities yet. Log your first activity!
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Display activity feed - activities are already in reverse chronological order (newest first)
  return (
    <Layout>
      <div className="min-h-screen bg-[#121216] p-6 pb-32">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent">
          ACTIVITY FEED
        </h1>

        {/* Today's Breakdown Section */}
        <TodaysBreakdown activities={todaysActivities} users={householdUsers} />

        {/* Unified Activity & Mood Feed */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-[#feefd0] mb-4">
            Recent Activity
          </h2>
          {unifiedFeed.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#888] text-sm">
                No activities yet. Log your first activity!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {unifiedFeed.map((item) => {
                if (item.type === "activity") {
                  return (
                    <ActivityFeedItem
                      key={item._id}
                      userName={item.userName}
                      activityName={item.activityName}
                      description={item.description}
                      statGains={item.statGains}
                      timestamp={item._creationTime}
                    />
                  );
                } else {
                  return (
                    <MoodFeedItem
                      key={item._id}
                      userName={item.userName}
                      mood={item.mood}
                      note={item.note}
                      timestamp={item._creationTime}
                    />
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
