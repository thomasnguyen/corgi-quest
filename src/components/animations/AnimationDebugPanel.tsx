import { useState, useEffect, useRef } from "react";

interface AnimationDebugPanelProps {
  onTriggerAnimation: (type: string, params?: any) => void;
  isRealTimeEnabled: boolean;
  onToggleRealTime: (enabled: boolean) => void;
}

interface PerformanceMetrics {
  fps: number;
  animationCount: number;
  lastTriggerTime: number;
}

/**
 * Hidden debug panel for testing animations
 * Appears when ?debug=true is in URL
 * Provides controls to trigger animations and adjust parameters
 * Requirements: 5.1, 5.2, 5.7
 */
export default function AnimationDebugPanel({
  onTriggerAnimation,
  isRealTimeEnabled,
  onToggleRealTime,
}: AnimationDebugPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [xpAmount, setXpAmount] = useState(50);
  const [confettiCount, setConfettiCount] = useState(50);
  const [pulseIntensity, setPulseIntensity] = useState<
    "normal" | "celebration"
  >("normal");
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics>({
      fps: 60,
      animationCount: 0,
      lastTriggerTime: 0,
    });
  const [showPerformance, setShowPerformance] = useState(false);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number | null>(null);

  // Check for ?debug=true in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const debugMode = params.get("debug") === "true";
      setIsVisible(debugMode);
    }
  }, []);

  // FPS monitoring (Requirements: 5.1, 5.2, 5.7)
  useEffect(() => {
    if (!isVisible || !showPerformance) return;

    const measureFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTimeRef.current;

      // Update FPS every second
      if (elapsed >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);
        setPerformanceMetrics((prev) => ({
          ...prev,
          fps,
        }));
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(measureFPS);
    };

    animationFrameRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, showPerformance]);

  // Track animation triggers
  const handleTriggerAnimation = (type: string, params?: any) => {
    const now = performance.now();
    setPerformanceMetrics((prev) => ({
      ...prev,
      animationCount: prev.animationCount + 1,
      lastTriggerTime: now,
    }));
    onTriggerAnimation(type, params);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-gray-900 border-2 border-cyan-500 rounded-lg p-4 w-80 max-h-[70vh] overflow-y-auto shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
        <h3 className="text-white font-bold text-sm">Animation Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white text-xl leading-none"
          aria-label="Close debug panel"
        >
          ×
        </button>
      </div>

      {/* Real-time toggle */}
      <div className="mb-4 pb-4 border-b border-gray-700 space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-white text-sm">Real-time Animations</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={isRealTimeEnabled}
              onChange={(e) => onToggleRealTime(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-10 h-6 rounded-full transition-colors ${
                isRealTimeEnabled ? "bg-cyan-500" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                  isRealTimeEnabled ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </div>
          </div>
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-white text-sm">Performance Monitor</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={showPerformance}
              onChange={(e) => setShowPerformance(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-10 h-6 rounded-full transition-colors ${
                showPerformance ? "bg-green-500" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                  showPerformance ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </div>
          </div>
        </label>
      </div>

      {/* Performance metrics */}
      {showPerformance && (
        <div className="mb-4 pb-4 border-b border-gray-700 space-y-2">
          <h4 className="text-white font-semibold text-xs uppercase tracking-wide">
            Performance Metrics
          </h4>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">FPS:</span>
              <span
                className={`font-mono ${
                  performanceMetrics.fps >= 55
                    ? "text-green-400"
                    : performanceMetrics.fps >= 30
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                {performanceMetrics.fps}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Animations Triggered:</span>
              <span className="text-white font-mono">
                {performanceMetrics.animationCount}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Last Trigger:</span>
              <span className="text-white font-mono">
                {performanceMetrics.lastTriggerTime > 0
                  ? `${Math.round(performance.now() - performanceMetrics.lastTriggerTime)}ms ago`
                  : "N/A"}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            💡 Target: 60 FPS for smooth animations
          </div>
        </div>
      )}

      {/* Animation triggers */}
      <div className="space-y-3">
        <h4 className="text-white font-semibold text-xs uppercase tracking-wide mb-2">
          Trigger Animations
        </h4>

        {/* Floating XP */}
        <div className="space-y-2">
          <button
            onClick={() =>
              handleTriggerAnimation("floatingXP", { amount: xpAmount })
            }
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-sm py-2 px-3 rounded transition-colors"
          >
            Floating XP
          </button>
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-xs whitespace-nowrap">
              XP Amount:
            </label>
            <input
              type="range"
              min="10"
              max="200"
              value={xpAmount}
              onChange={(e) => setXpAmount(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-white text-xs w-8 text-right">
              {xpAmount}
            </span>
          </div>
        </div>

        {/* Pulse */}
        <div className="space-y-2">
          <button
            onClick={() =>
              handleTriggerAnimation("pulse", { intensity: pulseIntensity })
            }
            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-3 rounded transition-colors"
          >
            Pulse Effect
          </button>
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-xs whitespace-nowrap">
              Intensity:
            </label>
            <select
              value={pulseIntensity}
              onChange={(e) =>
                setPulseIntensity(e.target.value as "normal" | "celebration")
              }
              className="flex-1 bg-gray-800 text-white text-xs py-1 px-2 rounded border border-gray-700"
            >
              <option value="normal">Normal</option>
              <option value="celebration">Celebration</option>
            </select>
          </div>
        </div>

        {/* Confetti */}
        <div className="space-y-2">
          <button
            onClick={() =>
              handleTriggerAnimation("confetti", { count: confettiCount })
            }
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-2 px-3 rounded transition-colors"
          >
            Confetti
          </button>
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-xs whitespace-nowrap">
              Particle Count:
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={confettiCount}
              onChange={(e) => setConfettiCount(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-white text-xs w-8 text-right">
              {confettiCount}
            </span>
          </div>
        </div>

        {/* Level Up */}
        <button
          onClick={() => handleTriggerAnimation("levelUp")}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded transition-colors"
        >
          Level Up (Confetti + XP)
        </button>

        {/* Partner Activity */}
        <button
          onClick={() => handleTriggerAnimation("partnerActivity")}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm py-2 px-3 rounded transition-colors"
        >
          Partner Activity Toast
        </button>

        {/* Combined animations */}
        <button
          onClick={() => handleTriggerAnimation("all")}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded transition-colors font-semibold"
        >
          Trigger All Animations
        </button>

        {/* Stress test */}
        <button
          onClick={() => {
            // Trigger multiple animations rapidly to test throttling
            for (let i = 0; i < 10; i++) {
              setTimeout(() => {
                handleTriggerAnimation("floatingXP", { amount: 10 + i * 5 });
              }, i * 100);
            }
          }}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white text-sm py-2 px-3 rounded transition-colors"
        >
          Stress Test (10 rapid animations)
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-gray-400 text-xs">
          💡 Tip: Use URL parameters to auto-trigger animations:
        </p>
        <code className="block mt-1 text-xs text-cyan-400 bg-gray-800 p-2 rounded">
          ?testAnimation=floatingXP,pulse
        </code>
      </div>
    </div>
  );
}
