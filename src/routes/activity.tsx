import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Layout from "../components/layout/Layout";
import ActivityFeedItem from "../components/activity/ActivityFeedItem";
import MoodFeedItem from "../components/mood/MoodFeedItem";
import TodaysBreakdown from "../components/activity/TodaysBreakdown";
import MoodPicker, { MoodType } from "../components/mood/MoodPicker";
import { useToast } from "../contexts/ToastContext";
import { useState, useMemo } from "react";
import { useSelectedCharacter } from "../hooks/useSelectedCharacter";
import { Smile } from "lucide-react";

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
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const { showToast } = useToast();
  const logMoodMutation = useMutation(api.mutations.logMood);

  // Get selected character
  const { selectedCharacterId } = useSelectedCharacter();

  // Get the first dog (demo purposes)
  const firstDog = useQuery(api.queries.getFirstDog);

  // Get activity feed
  const activityFeed = useQuery(
    api.queries.getActivityFeed,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Get mood feed
  const moodFeed = useQuery(
    api.queries.getMoodFeed,
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

  // Handle mood logging
  const handleMoodConfirm = async (mood: MoodType, note?: string) => {
    if (!firstDog || !selectedCharacterId) return;

    try {
      await logMoodMutation({
        dogId: firstDog._id,
        userId: selectedCharacterId,
        mood,
        note,
      });

      // Show success toast
      const moodEmojis = {
        calm: "😊",
        anxious: "😰",
        reactive: "😡",
        playful: "🎾",
        tired: "😴",
        neutral: "😐",
      };
      showToast(`Mood logged: Bumi is ${moodEmojis[mood]} ${mood}`, "success");

      // Close modal
      setShowMoodPicker(false);
    } catch (error) {
      console.error("Failed to log mood:", error);
      showToast("Failed to log mood. Please try again.", "error");
    }
  };

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

        {/* LOG MOOD Button */}
        <div className="mt-6 mb-4 flex justify-center">
          <button
            onClick={() => setShowMoodPicker(true)}
            className="bg-[#f5c35f] text-[#121216] py-2 px-4 rounded-lg font-medium hover:bg-[#f5c35f]/90 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Smile className="w-4 h-4" strokeWidth={2} />
            <span>LOG MOOD</span>
          </button>
        </div>

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

        {/* Mood Picker Modal */}
        {showMoodPicker && (
          <MoodPicker
            onConfirm={handleMoodConfirm}
            onCancel={() => setShowMoodPicker(false)}
            isLoading={false}
          />
        )}
      </div>
    </Layout>
  );
}
