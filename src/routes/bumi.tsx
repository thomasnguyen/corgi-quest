import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Layout from "../components/layout/Layout";
import StatsView from "../components/dog/StatsView";

export const Route = createFileRoute("/bumi")({
  component: BumiScreen,
});

function BumiScreen() {
  // Get the first dog (demo purposes)
  const firstDog = useQuery(api.queries.getFirstDog);

  // Get dog profile with stats
  const dogProfile = useQuery(
    api.queries.getDogProfile,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Loading state
  if (firstDog === undefined || dogProfile === undefined) {
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

  // No dog found
  if (!firstDog || !dogProfile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-[#121216]">
          <div className="text-center px-6">
            <p className="text-[#f9dca0] text-sm">
              No dog found. Run the seed mutation to create demo data.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const { dog, stats } = dogProfile;

  return (
    <Layout>
      <StatsView dog={dog} stats={stats} />
    </Layout>
  );
}
