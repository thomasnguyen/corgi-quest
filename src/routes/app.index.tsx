import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import StatGrid from "../components/dog/StatGrid";
import ActivityButtons from "../components/layout/ActivityButtons";
import TopResourceBar from "../components/layout/TopResourceBar";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useStaleQuery } from "../hooks/useStaleQuery";
import { useActiveDog } from "../hooks/useActiveDog";

// Preload background images for faster loading
function preloadImage(src: string) {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = src;
  link.setAttribute("fetchpriority", "high");
  document.head.appendChild(link);
}

export const Route = createFileRoute("/app/")({
  component: OverviewPage,
});

function OverviewPage() {
  const navigate = useNavigate();

  // Check for character selection before rendering main content
  useEffect(() => {
    const selectedCharacterId = localStorage.getItem("selectedCharacterId");

    if (!selectedCharacterId) {
      // No character selected, redirect to character selection
      navigate({ to: "/app/select-character" });
    }
  }, [navigate]);

  // Get active dog ID from useActiveDog hook
  const { activeDogId } = useActiveDog();

  // Get dog profile with stats - use stale query to show cached data
  const dogProfile = useStaleQuery(
    api.queries.getDogProfile,
    activeDogId ? { dogId: activeDogId } : "skip"
  );

  // Get currently equipped item to check if moon item is equipped - use stale query
  const equippedItem = useStaleQuery(
    api.queries.getEquippedItem,
    activeDogId ? { dogId: activeDogId } : "skip"
  );

  // Detect mobile for responsive backgrounds
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Determine background based on equipped item and breed (calculate early, before conditionals)
  // Priority:
  // 1. Moon items → mage_bg.webp (local, never AI-generated)
  // 2. Non-moon equipped items → generatedImageUrl from Convex storage (AI-generated WebP)
  // 3. Golden Retriever breed → golden_retriever.jpg (special breed background)
  // 4. Default (nothing equipped) → main_bg.webp (local)
  const bgSuffix = isMobile ? "_mobile" : "";
  const isMoonItem = equippedItem?.item?.itemType === "moon";
  const isGoldenRetriever = dogProfile?.dog?.breed
    ?.toLowerCase()
    .includes("golden retriever");

  // Debug: log breed info
  console.log(
    "Dog breed:",
    dogProfile?.dog?.breed,
    "| isGoldenRetriever:",
    isGoldenRetriever
  );

  const getDefaultBackground = () => {
    if (isGoldenRetriever) return `/golden_retriever.png`;
    return `/main_bg.webp`;
  };
  // if isGoldenRetriever add padding top 30px;

  const backgroundImage = isMoonItem
    ? `/images/backgrounds/mage_bg${bgSuffix}.webp`
    : equippedItem?.generatedImageUrl && equippedItem.generatedImageUrl !== ""
      ? equippedItem.generatedImageUrl
      : getDefaultBackground();

  // Fallback for browsers that don't support WebP (only for non-AI images)
  const backgroundImageFallback = isMoonItem
    ? `/images/backgrounds/mage_bg${bgSuffix}.webp`
    : equippedItem?.generatedImageUrl && equippedItem.generatedImageUrl !== ""
      ? equippedItem.generatedImageUrl
      : getDefaultBackground();

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
  if (dogProfile === undefined || equippedItem === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121216]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#f5c35f] border-t-transparent"></div>
          <p className="mt-4 text-[#f9dca0] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // No dog found or no active dog selected
  if (!activeDogId || !dogProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121216]">
        <div className="text-center px-6">
          <p className="text-[#f9dca0] text-sm">
            No active dog selected. Please select a dog from the menu.
          </p>
        </div>
      </div>
    );
  }

  const { dog, stats } = dogProfile;

  return (
    <div
      className="relative overflow-hidden bg-cover min-h-screen"
      style={{
        backgroundImage: `url('${backgroundImage}'), url('${backgroundImageFallback}')`,
        backgroundPosition: isGoldenRetriever
          ? "center top 30px"
          : "center bottom",
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

        <ActivityButtons />
      </div>
      {/* Activity Buttons - positioned above bottom nav */}
    </div>
  );
}
