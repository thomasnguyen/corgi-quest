import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";
import Layout from "../components/layout/Layout";
import StatGrid from "../components/dog/StatGrid";
import LogActivityButton from "../components/layout/LogActivityButton";
import TopResourceBar from "../components/layout/TopResourceBar";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useStaleQuery } from "../hooks/useStaleQuery";

// Preload background images for faster loading
function preloadImage(src: string) {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = src;
  link.setAttribute("fetchpriority", "high");
  document.head.appendChild(link);
}

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

  // Get the first dog (demo purposes) - use stale query to show cached data
  const firstDog = useStaleQuery(api.queries.getFirstDog, {});

  // Get dog profile with stats - use stale query to show cached data
  const dogProfile = useStaleQuery(
    api.queries.getDogProfile,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Get currently equipped item to check if moon item is equipped - use stale query
  const equippedItem = useStaleQuery(
    api.queries.getEquippedItem,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Determine background based on equipped item (calculate early, before conditionals)
  const backgroundImage =
    equippedItem?.item?.itemType === "moon" ? "/mage_bg.webp" : "/smoke_bg.svg";

  // Fallback for browsers that don't support WebP
  const backgroundImageFallback =
    equippedItem?.item?.itemType === "moon" ? "/mage_bg.png" : "/smoke_bg.svg";

  // Preload the background image for faster rendering (must be before any conditional returns)
  useEffect(() => {
    if (backgroundImage) {
      preloadImage(backgroundImage);
      // Also preload fallback for non-WebP browsers
      if (
        backgroundImageFallback &&
        backgroundImage !== backgroundImageFallback
      ) {
        preloadImage(backgroundImageFallback);
      }
    }
  }, [backgroundImage, backgroundImageFallback]);

  // Loading state - only show if we've never loaded data before
  // With useStaleQuery, we'll have stale data on subsequent visits
  if (
    firstDog === undefined ||
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
      <div
        className="relative overflow-hidden bg-cover bg-bottom min-h-screen"
        style={{
          backgroundImage: `url('${backgroundImage}'), url('${backgroundImageFallback}')`,
        }}
      >
        {/* Content */}
        <div className="relative z-10 pb-32 pt-2">
          {/* Top Resource Bar */}
          <TopResourceBar />

          {/* Dog Name and Level */}
          <div className="text-center mt-2">
            <p
              className="text-[#feefd0] text-sm mb-1"
              style={{ textShadow: "0px 1px 1px #1e1e1e" }}
            >
              Lvl {dog.overallLevel}
            </p>
            <h1
              className="text-4xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent"
              style={{
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

        <div className="fixed bottom-28 left-0 right-0 py-4 px-4">
          <StatGrid stats={stats} />

          <LogActivityButton />
        </div>
        {/* Log Activity Button - positioned above bottom nav */}
      </div>
    </Layout>
  );
}
