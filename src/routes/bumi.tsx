import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../convex/_generated/api";
import Layout from "../components/layout/Layout";
import BumiCharacterSheet from "../components/dog/BumiCharacterSheet";
import { useStaleQuery } from "../hooks/useStaleQuery";

export const Route = createFileRoute("/bumi")({
  component: BumiPage,
});

/**
 * BUMI Character Sheet Page
 * Displays detailed stats and cosmetic items for the dog
 * Requirements: 28
 */
function BumiPage() {
  // Get the first dog (demo purposes) - use stale query to show cached data
  const firstDog = useStaleQuery(api.queries.getFirstDog, {});

  // Get dog profile with stats and mood history (optimized/cached query) - use stale query
  // Only query if firstDog is available (cached or loaded)
  const dogProfile = useStaleQuery(
    api.queries.getDogProfileWithMood,
    firstDog ? { dogId: firstDog._id, days: 7 } : "skip"
  );

  // Get equipped item - use stale query
  const equippedItem = useStaleQuery(
    api.queries.getEquippedItem,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Loading state - only show if we've never loaded data before
  // With useStaleQuery, we'll have stale data on subsequent visits
  // But we need firstDog to be available before we can check dogProfile
  if (!firstDog) {
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

  // Now check if dogProfile and equippedItem are available
  if (
    dogProfile === undefined ||
    equippedItem === undefined
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

  // Error state - no dog found
  if (!dogProfile || !dogProfile.dog) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#121216] p-6">
          <div className="flex items-center justify-center mt-20">
            <div className="text-center px-6">
              <p className="text-[#888] text-sm">
                No dog profile found. Please seed the database.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <BumiCharacterSheet 
        dog={dogProfile.dog} 
        stats={dogProfile.stats}
        moodHistory={dogProfile.moodHistory}
      />
    </Layout>
  );
}
