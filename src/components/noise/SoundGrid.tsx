import type { SoundConfig, SoundId } from "../../lib/noiseTypes";

interface SoundGridProps {
  sounds: SoundConfig[];
  selectedSoundId: SoundId | null;
  activeSoundId: SoundId | null;
  onSelectSound: (soundId: SoundId) => void;
}

export default function SoundGrid({
  sounds,
  selectedSoundId,
  activeSoundId,
  onSelectSound,
}: SoundGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {sounds.map((sound) => (
        <div key={sound.id}>
          {/* SoundTile will be implemented in task 3 */}
          {/* Placeholder for now */}
          <button
            onClick={() => onSelectSound(sound.id)}
            className="w-full aspect-square border border-gray-300 rounded-lg flex flex-col items-center justify-center p-2"
          >
            <span className="text-2xl">{sound.icon}</span>
            <span className="text-xs mt-1">{sound.shortLabel}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
