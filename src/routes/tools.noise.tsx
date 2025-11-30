import { createFileRoute } from "@tanstack/react-router";
import { NoiseDesensitizer } from "../components/noise/NoiseDesensitizer";

export const Route = createFileRoute("/tools/noise")({
  component: NoiseDesensitizerRoute,
});

function NoiseDesensitizerRoute() {
  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <header className="bg-black text-white py-6 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-2">🐕 Noise Desensitizer</h1>
          <p className="text-gray-300 text-lg">
            Train your dog to stay calm around common triggers like fireworks,
            doorbells, and thunder
          </p>
        </div>
      </header>

      {/* Main Tool */}
      <NoiseDesensitizer />
    </div>
  );
}
