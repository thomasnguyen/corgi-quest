import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Layout from "../components/layout/Layout";
import ActivityFeedItem from "../components/activity/ActivityFeedItem";
import TodaysBreakdown from "../components/activity/TodaysBreakdown";

export const Route = createFileRoute("/activity")({
  component: ActivityPage,
});

function ActivityPage() {
  // Get the first dog (demo purposes)
  const firstDog = useQuery(api.queries.getFirstDog);

  // Get activity feed
  const activityFeed = useQuery(
    api.queries.getActivityFeed,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Get today's activities for breakdown
  const todaysActivities = useQuery(
    api.queries.getTodaysActivities,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Get household users for filter
  const householdUsers = useQuery(
    api.queries.getHouseholdUsers,
    firstDog ? { householdId: firstDog.householdId } : "skip"
  );

  // Loading state
  if (
    firstDog === undefined ||
    activityFeed === undefined ||
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

  // Empty state - no activities yet
  if (!activityFeed || activityFeed.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#121216] p-6">
          <h1
            className="text-3xl font-bold mb-6 bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent"
            style={{ fontFamily: "serif" }}
          >
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
        <h1
          className="text-3xl font-bold mb-6 bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent"
          style={{ fontFamily: "serif" }}
        >
          ACTIVITY FEED
        </h1>

        {/* Today's Breakdown Section */}
        <TodaysBreakdown activities={todaysActivities} users={householdUsers} />

        {/* Activity Feed */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-[#feefd0] mb-4">
            Recent Activity
          </h2>
          {activityFeed.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#888] text-sm">
                No activities yet. Log your first activity!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activityFeed.map((activity) => (
                <ActivityFeedItem
                  key={activity._id}
                  userName={activity.userName}
                  activityName={activity.activityName}
                  description={activity.description}
                  statGains={activity.statGains}
                  timestamp={activity._creationTime}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
