import type { SoundConfig } from "../../lib/noiseTypes";

interface SoundTileProps {
  sound: SoundConfig;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: () => void;
}

export default function SoundTile({
  sound,
  isSelected,
  isPlaying,
  onSelect,
}: SoundTileProps) {
  // Determine intensity indicator color based on intensity tag
  const getIntensityColor = () => {
    switch (sound.intensityTag) {
      case "High":
        return "bg-red-500"; // --intensity-high: #ef4444
      case "Medium":
        return "bg-amber-500"; // --intensity-medium: #f59e0b
      case "Low":
        return "bg-green-500"; // --intensity-low: #22c55e
      default:
        return "bg-gray-500";
    }
  };

  return (
    <button
      onClick={onSelect}
      className={`
        relative w-full aspect-square
        min-h-[44px] min-w-[44px]
        flex flex-col items-center justify-center
        rounded-lg p-2
        transition-all duration-150
        ${
          isSelected
            ? "border-2 border-black bg-gray-50"
            : "border border-gray-300 bg-white"
        }
        hover:scale-[1.02]
        active:scale-95
        ${isPlaying ? "animate-pulse-border" : ""}
      `}
      aria-label={`${sound.label} - ${sound.intensityTag} intensity`}
      aria-pressed={isSelected}
    >
      {/* Intensity indicator dot in top-right corner */}
      <div
        className={`
          absolute top-1 right-1
          w-2 h-2 rounded-full
          ${getIntensityColor()}
        `}
        aria-hidden="true"
      />

      {/* Sound icon */}
      <span className="text-2xl mb-1" aria-hidden="true">
        {sound.icon}
      </span>

      {/* Short label */}
      <span className="text-xs font-medium text-gray-900 text-center leading-tight">
        {sound.shortLabel}
      </span>

      {/* Playing indicator - pulse animation */}
      {isPlaying && (
        <div
          className="absolute inset-0 rounded-lg border-2 border-black animate-pulse-playing pointer-events-none"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
