import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useActiveDog } from "../hooks/useActiveDog";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import WeeklyChartPanel from "../components/webxr/WeeklyChartPanel";
import FallbackChart2D from "../components/webxr/FallbackChart2D";

/**
 * WebXR Charts Demo Route
 *
 * A standalone route demonstrating proper 3D chart rendering in WebXR.
 * This is completely separate from /app.vr and won't affect existing VR functionality.
 *
 * Real-time Updates (Requirements: 5.4):
 * - Uses Convex useQuery hook which automatically subscribes to data changes
 * - When new activities are logged, weeklyXP updates within 3 seconds
 * - WeeklyChartPanel receives new data and AnimatedBar components smoothly transition
 * - No manual refetching needed - Convex handles real-time subscriptions
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4
 */
export const Route = createFileRoute("/webxr")({
  component: WebXRChartsDemo,
  ssr: false,
});

/**
 * DATE HELPER FUNCTIONS (Requirements: 5.1, 9.3)
 *
 * These functions generate ISO date strings (YYYY-MM-DD format)
 * for querying Convex data.
 *
 * getTodayDate(): Returns today's date
 * getDateDaysAgo(n): Returns date n days in the past
 *
 * Example:
 * - Today is 2024-01-15
 * - getTodayDate() → "2024-01-15"
 * - getDateDaysAgo(7) → "2024-01-08"
 *
 * These are used to fetch the last 7 days of XP data from Convex.
 */
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

function WebXRChartsDemo() {
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);
  const [inVR, setInVR] = useState(false);
  const [store] = useState(() => createXRStore());
  const { activeDogId } = useActiveDog();

  /**
   * REAL-TIME DATA FETCHING (Requirements: 5.1, 5.4, 9.3)
   *
   * Uses Convex useQuery hook which automatically subscribes to data changes.
   * This is NOT a one-time fetch - it's a live subscription.
   *
   * HOW REAL-TIME UPDATES WORK:
   * 1. User logs activity in main app → Convex mutation runs
   * 2. Convex detects change to activities table
   * 3. All subscribed queries automatically re-run
   * 4. weeklyXP updates within 3 seconds (Requirements: 5.4)
   * 5. WeeklyChartPanel receives new data
   * 6. AnimatedBar components smoothly transition to new heights
   *
   * NO POLLING NEEDED - Convex handles real-time subscriptions.
   *
   * CONDITIONAL QUERY (Requirements: 5.2):
   * If no dog is selected (activeDogId is null), we pass "skip" to prevent
   * the query from running. This avoids errors and shows appropriate UI.
   *
   * COMMON MISTAKE (Requirements: 9.4):
   * ❌ Using fetch() to call Convex
   * const data = await fetch('/api/getDailyXP');
   * This would require manual refetching and wouldn't get real-time updates.
   *
   * ✅ Using useQuery hook
   * const data = useQuery(api.queries.getDailyXP, { ... });
   * Automatic real-time subscriptions, no manual work needed.
   */
  const weeklyXP = useQuery(
    api.queries.getDailyXP,
    activeDogId
      ? {
          dogId: activeDogId,
          startDate: getDateDaysAgo(7),
          endDate: getTodayDate(),
        }
      : "skip"
  );

  /**
   * WEBXR FEATURE DETECTION (Requirements: 1.2, 9.3)
   *
   * Checks if the browser supports WebXR immersive-vr sessions.
   *
   * Three possible states:
   * - null: Still checking (show loading spinner)
   * - true: WebXR supported (show "Enter VR" button)
   * - false: Not supported (show 2D fallback)
   *
   * BROWSER SUPPORT:
   * - Vision Pro Safari: ✅ Supported
   * - Meta Quest Browser: ✅ Supported
   * - Desktop Chrome/Firefox: ❌ Not supported (no VR headset)
   * - Mobile Safari/Chrome: ❌ Not supported (no WebXR on phones)
   *
   * This check prevents errors when users try to enter VR on unsupported devices.
   */
  useEffect(() => {
    if ("xr" in navigator) {
      navigator.xr
        ?.isSessionSupported("immersive-vr")
        .then(setXrSupported)
        .catch(() => setXrSupported(false));
    } else {
      setXrSupported(false);
    }
  }, []);

  // Enter VR when inVR state changes
  useEffect(() => {
    if (inVR) {
      store.enterVR();
    }
  }, [inVR, store]);

  // Handle session end
  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      if (state.session === null && inVR) {
        setInVR(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [store, inVR]);

  // Render loading state while checking WebXR support
  if (xrSupported === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-white mt-4">Checking WebXR support...</p>
      </div>
    );
  }

  // Render 2D fallback if WebXR not supported - Requirements: 1.3, 6.1, 6.2, 6.3, 6.5
  if (xrSupported === false) {
    return <FallbackChart2D data={weeklyXP ?? []} />;
  }

  // Handle no dog selected - Requirements: 5.2
  if (!activeDogId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <h1 className="text-2xl text-white mb-8">WebXR Charts Demo</h1>
        <div className="bg-[#1a1a1e] border border-[#3d3d3d] rounded-lg p-8 max-w-md text-center">
          <p className="text-yellow-400 mb-4">No dog selected</p>
          <p className="text-gray-400 text-sm">
            Please select a dog from the main app to view training data.
          </p>
        </div>
      </div>
    );
  }

  // Handle loading state - Requirements: 5.3
  if (weeklyXP === undefined) {
    console.log("WebXR: Loading training data...");
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-white mt-4">Loading training data...</p>
      </div>
    );
  }

  // DEBUG: Log loaded data
  console.log("=== WebXR Route Debug Info ===");
  console.log("Active Dog ID:", activeDogId);
  console.log("Weekly XP Data:", weeklyXP);
  console.log("Data Points:", weeklyXP.length);
  console.log("Date Range:", {
    start: getDateDaysAgo(7),
    end: getTodayDate(),
  });
  console.log("==============================");

  // Render entry button if not in VR - Requirements: 1.1, 1.4
  if (!inVR) {
    // Prepare chart data for preview
    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayData = weeklyXP.find((d) => d.date === dateStr);
      const xp = dayData?.xp ?? 0;
      const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
      last7Days.push({ label: dayLabel, value: xp, date: dateStr });
    }

    const maxValue = Math.max(...last7Days.map((d) => d.value), 1);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8">
        <h1 className="text-2xl text-white mb-4">WebXR Charts Demo</h1>
        <p className="text-gray-400 mb-8 max-w-md text-center">
          This is a standalone demo showing proper 3D chart rendering in WebXR.
          {weeklyXP.length === 0 && (
            <span className="block mt-2 text-yellow-400">
              Note: No training data yet. Chart will show empty bars.
            </span>
          )}
        </p>

        {/* Preview of what you'll see in VR */}
        <div className="bg-[#1a1a1e] border border-[#3d3d3d] rounded-lg p-6 mb-8 max-w-2xl w-full">
          <h2 className="text-[#f9dca0] text-lg mb-4 text-center">
            Preview: Last 7 Days
          </h2>
          <p className="text-gray-400 text-sm mb-4 text-center">
            This is what you'll see in VR (scaled for 2D preview)
          </p>

          {/* 2D bar chart preview */}
          <div className="flex items-end justify-center gap-4 h-64 mb-4">
            {last7Days.map((item) => {
              const heightPercent = (item.value / maxValue) * 100;
              const displayHeight = Math.max(heightPercent, 10);

              return (
                <div
                  key={item.date}
                  className="flex flex-col items-center gap-2 flex-1 max-w-[80px]"
                >
                  <span className="text-[#f5c35f] text-sm font-medium">
                    {item.value}
                  </span>
                  <div
                    className="w-full bg-[#D4AF37] rounded-t transition-all duration-500"
                    style={{ height: `${displayHeight}%` }}
                  />
                  <span className="text-[#888888] text-xs">{item.label}</span>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-[#0a0a0a] p-3 rounded">
              <div className="text-gray-400">Max XP</div>
              <div className="text-white font-semibold">{maxValue}</div>
            </div>
            <div className="bg-[#0a0a0a] p-3 rounded">
              <div className="text-gray-400">Data Points</div>
              <div className="text-white font-semibold">{last7Days.length}</div>
            </div>
            <div className="bg-[#0a0a0a] p-3 rounded">
              <div className="text-gray-400">Total XP</div>
              <div className="text-white font-semibold">
                {last7Days.reduce((sum, d) => sum + d.value, 0)}
              </div>
            </div>
            <div className="bg-[#0a0a0a] p-3 rounded">
              <div className="text-gray-400">Avg XP/Day</div>
              <div className="text-white font-semibold">
                {Math.round(last7Days.reduce((sum, d) => sum + d.value, 0) / 7)}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            console.log("🥽 Entering VR mode...");
            console.log(
              "Chart will render with",
              weeklyXP.length,
              "data points"
            );
            setInVR(true);
          }}
          className="px-6 py-3 bg-[#D4AF37] text-black rounded-lg font-semibold hover:bg-[#c49f2f] transition-colors"
        >
          Enter VR
        </button>

        <p className="text-gray-500 text-xs mt-4">
          Check browser console for detailed debug info
        </p>
      </div>
    );
  }

  /**
   * VR EXPERIENCE RENDERING (Requirements: 1.5, 9.3, 9.5)
   *
   * CANVAS CONFIGURATION:
   * - powerPreference: "high-performance" - Use dedicated GPU for VR
   * - antialias: true - Smooth edges (important for text readability)
   * - alpha: false - Opaque background (performance optimization)
   *
   * CAMERA SETUP:
   * - position: [0, 1.6, 0] - Average human eye height (1.6m)
   * - fov: 75 - Field of view in degrees
   *
   * LIGHTING (Requirements: 1.5):
   * - ambientLight: Provides base illumination (no shadows)
   * - directionalLight: Adds depth perception (subtle shadows)
   *
   * CHART POSITIONING:
   * - position: [0, 1.5, -2]
   *   - x: 0 (centered horizontally)
   *   - y: 1.5 (at eye level, slightly below)
   *   - z: -2 (2 meters in front of user)
   *
   * This places the chart at a comfortable viewing distance and height.
   *
   * PERFORMANCE OPTIMIZATION (Requirements: 9.5, 10.1):
   * - MeshBasicMaterial in chart (no lighting calculations)
   * - Simple geometry (boxes and planes)
   * - Minimal draw calls (< 20 objects total)
   * - Target: 60+ fps on Vision Pro
   */
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        gl={{
          powerPreference: "high-performance",
          antialias: true,
          alpha: false,
        }}
        camera={{
          position: [0, 1.6, 0], // Average eye height
          fov: 75,
        }}
      >
        <XR store={store}>
          {/* Basic lighting - Requirements: 1.5 */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />

          {/* Weekly chart panel with real-time data - Requirements: 4.4, 5.4 */}
          <WeeklyChartPanel weeklyXP={weeklyXP} position={[0, 1.5, -2]} />
        </XR>
      </Canvas>
    </div>
  );
}
