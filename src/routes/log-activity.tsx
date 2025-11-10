import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Layout from "../components/layout/Layout";
import { RealtimeVoiceInterface } from "../components/voice/RealtimeVoiceInterface";

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

  // Get the first dog (demo purposes)
  const firstDog = useQuery(api.queries.getFirstDog);

  // Get the first user (current user for demo purposes)
  const firstUser = useQuery(
    api.queries.getFirstUser,
    firstDog ? { householdId: firstDog.householdId } : "skip"
  );

  // Presence mutations
  const updatePresence = useMutation(api.mutations.updatePresence);
  const clearPresence = useMutation(api.mutations.clearPresence);

  // Update presence when entering this screen
  useEffect(() => {
    if (firstUser) {
      updatePresence({
        userId: firstUser._id,
        location: "log-activity",
      });
    }

    // Clear presence when leaving this screen
    return () => {
      if (firstUser) {
        clearPresence({
          userId: firstUser._id,
        });
      }
    };
  }, [firstUser, updatePresence, clearPresence]);

  return (
    <Layout>
      <RealtimeVoiceInterface questName={activityContext} />
    </Layout>
  );
}
