import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, Suspense, lazy } from "react";

// Lazy load the VR Canvas to avoid loading three.js on initial page load
const VRCanvas = lazy(() => import("../components/vr/VRCanvas"));

export const Route = createFileRoute("/app/vr")({
  component: VRTrainingHUD,
  ssr: false, // WebXR requires client-side only
});

function VRTrainingHUD() {
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);
  const [inVR, setInVR] = useState(false);
  const [isHTTPS, setIsHTTPS] = useState(true);

  // Check WebXR support and HTTPS on mount
  useEffect(() => {
    // Check if running over HTTPS (required for WebXR)
    if (typeof window !== "undefined") {
      setIsHTTPS(
        window.location.protocol === "https:" ||
          window.location.hostname === "localhost"
      );
    }

    // Check WebXR support
    if ("xr" in navigator) {
      navigator.xr
        ?.isSessionSupported("immersive-vr")
        .then((supported) => {
          setXrSupported(supported);
        })
        .catch(() => {
          setXrSupported(false);
        });
    } else {
      setXrSupported(false);
    }
  }, []);

  // Show HTTPS warning if not secure
  if (!isHTTPS) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-[#f9dca0]">HTTPS Required</h1>
          <p className="text-gray-300">
            WebXR features require a secure HTTPS connection. Please access this
            page over HTTPS to use VR mode.
          </p>
          <p className="text-sm text-gray-400">
            Current protocol:{" "}
            {typeof window !== "undefined"
              ? window.location.protocol
              : "unknown"}
          </p>
        </div>
      </div>
    );
  }

  // Show loading state while checking support
  if (xrSupported === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-[#f9dca0]">Checking WebXR support...</p>
      </div>
    );
  }

  // Show fallback if WebXR not supported
  if (xrSupported === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-[#f9dca0]">
            VR Not Supported
          </h1>
          <p className="text-gray-300">
            Your browser or device doesn't support WebXR. VR mode is currently
            only available on:
          </p>
          <ul className="text-left text-gray-300 space-y-2">
            <li>• Apple Vision Pro (Safari 17.4+)</li>
            <li>• Meta Quest (Browser)</li>
            <li>• Desktop browsers with WebXR emulator extension</li>
          </ul>
          <p className="text-sm text-gray-400 mt-4">
            Using 2D fallback mode instead.
          </p>
          <FallbackDashboard />
        </div>
      </div>
    );
  }

  // Show VR entry button if not in VR yet
  if (!inVR) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-3xl font-bold text-[#f9dca0]">
            Corgi Quest VR Training
          </h1>
          <p className="text-gray-300">
            Enter VR mode to see your dog's stats, goals, and training progress
            in an immersive 3D environment.
          </p>
          <button
            onClick={() => setInVR(true)}
            className="px-8 py-4 bg-[#f9dca0] text-black font-bold rounded-lg hover:bg-[#e5c890] transition-colors text-lg"
          >
            Enter VR
          </button>
          <p className="text-sm text-gray-400">
            Make sure you're in a comfortable position before entering VR.
          </p>
        </div>
      </div>
    );
  }

  // Render VR Canvas
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-black">
          <p className="text-[#f9dca0]">Loading VR environment...</p>
        </div>
      }
    >
      <VRCanvas onExit={() => setInVR(false)} />
    </Suspense>
  );
}

// Simple 2D fallback dashboard
function FallbackDashboard() {
  return (
    <div className="mt-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold text-[#f9dca0] mb-4">
        2D Dashboard (Coming Soon)
      </h2>
      <p className="text-gray-400">
        A 2D version of the training dashboard will be available here for
        devices that don't support VR.
      </p>
    </div>
  );
}
