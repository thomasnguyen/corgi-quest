import type { SoundId, Mode } from "../../lib/noiseTypes";
import { SOUNDS } from "../../lib/noiseSounds";

interface StatusBarProps {
  sessionSeconds: number;
  activeSoundId: SoundId | null;
  activeMode: Mode | null;
  isSessionRunning: boolean;
}

export function StatusBar({
  sessionSeconds,
  activeSoundId,
  activeMode,
  isSessionRunning,
}: StatusBarProps) {
  // Format sessionSeconds as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get sound label from SOUNDS array
  const getSoundLabel = (soundId: SoundId): string => {
    const sound = SOUNDS.find((s) => s.id === soundId);
    return sound?.label || soundId;
  };

  // Determine status text
  const getStatusText = (): string => {
    if (!activeSoundId || !activeMode) {
      return "Status: Stopped";
    }
    const soundLabel = getSoundLabel(activeSoundId);
    const modeText = activeMode === "single" ? "Single" : "Loop";
    return `Status: Playing ${soundLabel} (${modeText})`;
  };

  return (
    <div className="bg-gray-900 text-white rounded-2xl p-4 border border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium" aria-live="polite">
            {getStatusText()}
          </p>
        </div>
        <div className="ml-4">
          <p
            className="text-2xl font-bold tabular-nums"
            aria-label={`Session timer: ${formatTime(sessionSeconds)}`}
          >
            {formatTime(sessionSeconds)}
          </p>
        </div>
      </div>
    </div>
  );
}
