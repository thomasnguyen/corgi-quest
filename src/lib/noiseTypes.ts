// Type definitions for the Noise Desensitizer tool

export type SoundId =
  | "fireworks"
  | "thunder"
  | "door_knock"
  | "doorbell"
  | "dog_bark"
  | "baby_crying"
  | "traffic"
  | "siren"
  | "construction";

export type Mode = "single" | "loop";

export type IntensityTag = "High" | "Medium" | "Low";

export interface SoundConfig {
  id: SoundId;
  label: string;
  shortLabel: string; // 5-char max for grid display
  icon: string; // emoji
  intensityTag: IntensityTag;
  fileUrl: string; // path to audio file
  defaultVolume: number; // 0.2-0.3
  defaultMode: Mode; // "single"
}

export interface NoiseToolState {
  selectedSoundId: SoundId | null; // Currently selected (may not be playing)
  activeSoundId: SoundId | null; // Currently playing sound
  volumeBySound: Record<SoundId, number>; // 0-1
  modeBySound: Record<SoundId, Mode>;
  progressiveEnabled: boolean;
  sessionSeconds: number;
  isSessionRunning: boolean;
  isSafetyDrawerOpen: boolean; // Safety drawer visibility
}
