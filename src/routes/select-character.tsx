import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import CharacterSelection from "../components/character/CharacterSelection";

export const Route = createFileRoute("/select-character")({
  component: SelectCharacterPage,
});

/**
 * Character selection route
 * Redirects to Overview if character already selected
 * Otherwise shows CharacterSelection component
 * Requirements: 29
 */
function SelectCharacterPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if character already selected
    const selectedCharacterId = localStorage.getItem("selectedCharacterId");

    if (selectedCharacterId) {
      // Redirect to Overview if character already selected
      navigate({ to: "/" });
    }
  }, [navigate]);

  // Render CharacterSelection component
  // (will show loading/error states if needed)
  return <CharacterSelection />;
}
