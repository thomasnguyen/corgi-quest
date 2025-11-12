import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import CharacterCard from "./CharacterCard";
import { Id } from "../../../convex/_generated/dataModel";

/**
 * Preload images for faster rendering
 */
function preloadImage(src: string) {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = src;
  link.fetchPriority = "high";
  document.head.appendChild(link);
}

/**
 * CharacterSelection component for selecting which household member to play as
 * Displays all users in the household as character cards
 * Requirements: 29
 */
export default function CharacterSelection() {
  const navigate = useNavigate();

  // Preload character avatars and background as soon as component mounts
  useEffect(() => {
    preloadImage("/holly_avatar.svg");
    preloadImage("/thomas_avatar.svg");
    preloadImage("/guest_avatar.svg");
    preloadImage("/smoke_spark_bg.svg");
  }, []);

  // Get the first dog to find the household
  const firstDog = useQuery(api.queries.getFirstDog);

  // Get all users in the household
  const householdUsers = useQuery(
    api.queries.getHouseholdUsers,
    firstDog ? { householdId: firstDog.householdId } : "skip"
  );

  // Handle character selection
  const handleSelectCharacter = (userId: Id<"users">) => {
    // Store selected character ID in localStorage
    localStorage.setItem("selectedCharacterId", userId);

    // Navigate to Overview screen
    navigate({ to: "/" });
  };

  // Loading state
  if (firstDog === undefined || householdUsers === undefined) {
    return (
      <div className="min-h-screen bg-[#121216] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#D4AF37] border-t-transparent"></div>
          <p className="mt-4 text-[#D4AF37] text-sm">Loading characters...</p>
        </div>
      </div>
    );
  }

  // Error state - no dog or users found
  if (!firstDog || !householdUsers || householdUsers.length === 0) {
    return (
      <div className="min-h-screen bg-[#121216] bg-[url('/smoke_spark_bg.svg')] bg-cover bg-bottom flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-white text-lg mb-2">No characters available</p>
          <p className="text-gray-400 text-sm">
            Please run the seed mutation to create demo data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[url('/smoke_spark_bg.svg')] bg-no-repeat bg-bottom bg-contain py-8 px-6 absolute top-0 left-0 right-0 z-10">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <h1 className="text-4xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent text-center mb-2">
            Choose Your Character
          </h1>
          <p
            className="text-[#feefd0] text-sm text-center mb-8"
            style={{ textShadow: "0px 1px 1px #1e1e1e" }}
          >
            Select which dog parent you want to play as
          </p>

          {/* Character Cards */}
          <div className="space-y-6">
            {householdUsers.map((user) => (
              <CharacterCard
                key={user._id}
                userId={user._id}
                name={user.name}
                title={user.title}
                avatarUrl={user.avatarUrl}
                onSelect={handleSelectCharacter}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
