import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import Layout from "../components/layout/Layout";

// Dynamically import the client-only wrapper (simplified text-only version)
const TrainingModeInterface = lazy(() =>
  import("../components/training/TrainingModeSimple.client").then((mod) => ({
    default: mod.TrainingModeSimple,
  }))
);

export const Route = createFileRoute("/training-mode")({
  component: TrainingModeScreen,
  ssr: false,
});

function TrainingModeScreen() {
  return (
    <Layout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-[#f9dca0]">Loading Training Mode...</p>
          </div>
        }
      >
        <TrainingModeInterface />
      </Suspense>
    </Layout>
  );
}
