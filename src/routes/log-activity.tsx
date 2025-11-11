import { createFileRoute } from "@tanstack/react-router";
import { useEffect, lazy, Suspense } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Layout from "../components/layout/Layout";
import { useSelectedCharacter } from "../hooks/useSelectedCharacter";

// Dynamically import the client-only wrapper to avoid bundling browser-only deps in server function
// The .client.tsx extension and "use client" directive ensure this is never bundled in server functions
const RealtimeVoiceInterface = lazy(
  () =>
    import("../components/voice/RealtimeVoiceInterface.client").then((mod) => ({
      default: mod.RealtimeVoiceInterface,
    }))
);

// Define search params schema
interface LogActivitySearch {
  questName?: string;
  prefilledActivity?: string;
}

export const Route = createFileRoute("/log-activity")({
  component: LogActivityPage,
  // Disable SSR for this route to avoid issues with browser-only dependencies
  ssr: false,
  validateSearch: (search: Record<string, unknown>): LogActivitySearch => {
    return {
      questName: search.questName as string | undefined,
      prefilledActivity: search.prefilledActivity as string | undefined,
    };
  },
});

function LogActivityPage() {
  const { questName, prefilledActivity } = Route.useSearch();

  // Use questName if provided, otherwise use prefilledActivity
  const activityContext = questName || prefilledActivity;

  // Get selected character
  const { selectedCharacterId, selectedUser } = useSelectedCharacter();

  // Presence mutations
  const updatePresence = useMutation(api.mutations.updatePresence);
  const clearPresence = useMutation(api.mutations.clearPresence);

  // Update presence when entering this screen
  useEffect(() => {
    if (selectedCharacterId) {
      updatePresence({
        userId: selectedCharacterId,
        location: "log-activity",
      });
    }

    // Clear presence when leaving this screen
    return () => {
      if (selectedCharacterId) {
        clearPresence({
          userId: selectedCharacterId,
        });
      }
    };
  }, [selectedCharacterId, updatePresence, clearPresence]);

  return (
    <Layout>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading voice interface...</div>}>
        <RealtimeVoiceInterface
          questName={activityContext}
          userId={selectedCharacterId || undefined}
        />
      </Suspense>
    </Layout>
  );
}
