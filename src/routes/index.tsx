import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";
import Layout from "../components/layout/Layout";
import StatGrid from "../components/dog/StatGrid";
import LogActivityButton from "../components/layout/LogActivityButton";
import TopResourceBar from "../components/layout/TopResourceBar";
import { ProgressBar } from "../components/ui/ProgressBar";

export const Route = createFileRoute("/")({
  component: OverviewPage,
});

function OverviewPage() {
  const navigate = useNavigate();

  // Check for character selection before rendering main content
  useEffect(() => {
    const selectedCharacterId = localStorage.getItem("selectedCharacterId");

    if (!selectedCharacterId) {
      // No character selected, redirect to character selection
      navigate({ to: "/select-character" });
    }
  }, [navigate]);

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
      <div className="relative overflow-hidden bg-[url('/smoke_bg.svg')] bg-cover bg-bottom min-h-screen">
        {/* Content */}
        <div className="relative z-10 pb-32">
          {/* Top Resource Bar */}
          <TopResourceBar />

          {/* Dog Name and Level */}
          <div className="text-center mt-2 mb-2">
            <p
              className="text-[#feefd0] text-sm mb-1"
              style={{ textShadow: "0px 1px 1px #1e1e1e" }}
            >
              Lvl {dog.overallLevel}
            </p>
            <h1
              className="text-4xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent"
              style={{
                fontFamily: "serif",
                color: "linear-gradient(180deg, #FEEFD0 0%, #FCD587 100%)",
              }}
            >
              {dog.name}
            </h1>
          </div>

          {/* XP Progress Bar */}
          <div className="px-7 mb-6">
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1">
                <span className="text-[#f5c35f]">Level</span>
                <span className="text-white">{dog.overallLevel}/20</span>
              </div>
            </div>
            <ProgressBar current={dog.overallXp} max={dog.xpToNextLevel} />
          </div>

          {/* Stats Display - Overlapping bottom of portrait */}
        </div>

        <div className="fixed bottom-25 left-0 right-0  py-4 px-4">
          <StatGrid stats={stats} />

          <LogActivityButton />
        </div>
        {/* Log Activity Button - positioned above bottom nav */}
      </div>
    </Layout>
  );
}
