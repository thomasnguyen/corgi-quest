import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/bumi")({
  component: BumiScreen,
});

function BumiScreen() {
  return (
    <div className="pb-32 pt-4 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">
          BUMI Character Sheet
        </h1>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
          <p className="text-white/60">Character sheet coming soon...</p>
        </div>
      </div>
    </div>
  );
}
