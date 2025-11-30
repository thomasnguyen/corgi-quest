import { Play, Square } from "lucide-react";
import type { SoundConfig, Mode } from "../../lib/noiseTypes";

interface SoundCardProps {
  sound: SoundConfig;
  isActive: boolean;
  volume: number; // 0-1
  mode: Mode;
  progressiveActive: boolean;
  onPlay: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
  onModeChange: (mode: Mode) => void;
}

export function SoundCard({
  sound,
  isActive,
  volume,
  mode,
  progressiveActive,
  onPlay,
  onStop,
  onVolumeChange,
  onModeChange,
}: SoundCardProps) {
  // Convert 0-1 volume to 0-100 percentage
  const volumePercent = Math.round(volume * 100);

  // Intensity badge colors
  const intensityColors = {
    High: "bg-red-500 text-white",
    Medium: "bg-amber-500 text-white",
    Low: "bg-green-500 text-white",
  };

  return (
    <div className="bg-white border-2 border-black rounded-2xl p-4 space-y-4">
      {/* Header: Icon + Label + Intensity Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label={sound.label}>
            {sound.icon}
          </span>
          <span className="text-lg font-bold">{sound.label}</span>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            intensityColors[sound.intensityTag]
          }`}
        >
          {sound.intensityTag}
        </span>
      </div>

      {/* Play/Stop Button + Mode Selector */}
      <div className="flex items-center gap-3">
        {/* Play/Stop Button - 44x44px minimum touch target */}
        <button
          onClick={isActive ? onStop : onPlay}
          className="flex items-center justify-center w-12 h-12 bg-black text-white rounded-xl hover:bg-gray-800 active:bg-gray-700 transition-colors"
          aria-label={isActive ? `Stop ${sound.label}` : `Play ${sound.label}`}
        >
          {isActive ? (
            <Square className="w-5 h-5" fill="currentColor" />
          ) : (
            <Play className="w-5 h-5" fill="currentColor" />
          )}
        </button>

        {/* Mode Selector - Button Group */}
        <div className="flex gap-2 flex-1">
          <button
            onClick={() => onModeChange("single")}
            className={`flex-1 h-12 px-4 rounded-xl font-semibold transition-colors ${
              mode === "single"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-label="Single play mode"
            aria-pressed={mode === "single"}
          >
            Single
          </button>
          <button
            onClick={() => onModeChange("loop")}
            className={`flex-1 h-12 px-4 rounded-xl font-semibold transition-colors ${
              mode === "loop"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-label="Loop play mode"
            aria-pressed={mode === "loop"}
          >
            Loop
          </button>
        </div>
      </div>

      {/* Volume Label + Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor={`volume-${sound.id}`}
            className="text-sm font-semibold"
          >
            Volume
          </label>
          <span className="text-sm font-bold">{volumePercent}%</span>
        </div>
        <input
          id={`volume-${sound.id}`}
          type="range"
          min="0"
          max="100"
          value={volumePercent}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
          aria-label={`Volume for ${sound.label}`}
          aria-valuetext={`${volumePercent} percent`}
        />
      </div>

      {/* Progressive Exposure Indicator */}
      {progressiveActive && isActive && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-blue-600 text-sm font-semibold">
            🔄 Auto-raising every 60s
          </span>
        </div>
      )}
    </div>
  );
}
