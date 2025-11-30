// Audio management system for the Noise Desensitizer tool

import type { SoundId, SoundConfig, Mode } from "./noiseTypes";

/**
 * AudioManager handles all audio playback for the Noise Desensitizer tool.
 * It manages HTMLAudioElement instances, playback control, volume, and loop timing.
 */
export class AudioManager {
  private audioElements: Map<SoundId, HTMLAudioElement>;
  private loopTimeouts: Map<SoundId, NodeJS.Timeout>;

  /**
   * Creates an AudioManager instance with HTMLAudioElement for each sound
   * @param sounds - Array of sound configurations
   */
  constructor(sounds: SoundConfig[]) {
    this.audioElements = new Map();
    this.loopTimeouts = new Map();

    // Create an HTMLAudioElement for each sound
    sounds.forEach((sound) => {
      const audio = new Audio(sound.fileUrl);
      audio.preload = "auto";
      this.audioElements.set(sound.id, audio);
    });
  }

  /**
   * Play a sound at the specified volume and mode
   * @param soundId - ID of the sound to play
   * @param volume - Volume level (0-1)
   * @param mode - Playback mode ("single" or "loop")
   */
  play(soundId: SoundId, volume: number, mode: Mode): void {
    const audio = this.audioElements.get(soundId);
    if (!audio) {
      console.error(`Audio element not found for sound: ${soundId}`);
      return;
    }

    // Clear any existing loop timeout for this sound
    this.clearLoopTimeout(soundId);

    // Set volume and reset to beginning
    audio.volume = Math.max(0, Math.min(1, volume)); // Clamp to 0-1
    audio.currentTime = 0;

    // Set up loop behavior if needed
    if (mode === "loop") {
      // Remove any existing ended listener to avoid duplicates
      audio.onended = null;

      audio.onended = () => {
        // Schedule replay after 7 seconds
        const timeout = setTimeout(() => {
          audio.currentTime = 0;
          audio.play().catch((error) => {
            console.error(`Failed to replay sound ${soundId}:`, error);
          });
        }, 7000);

        this.loopTimeouts.set(soundId, timeout);
      };
    } else {
      // Single mode - no loop behavior
      audio.onended = null;
    }

    // Start playback
    audio.play().catch((error) => {
      console.error(`Failed to play sound ${soundId}:`, error);
    });
  }

  /**
   * Stop a specific sound and reset it to the beginning
   * @param soundId - ID of the sound to stop
   */
  stop(soundId: SoundId): void {
    const audio = this.audioElements.get(soundId);
    if (!audio) {
      return;
    }

    // Clear any loop timeout
    this.clearLoopTimeout(soundId);

    // Stop playback and reset
    audio.pause();
    audio.currentTime = 0;
    audio.onended = null;
  }

  /**
   * Stop all sounds and clear all loop timeouts
   */
  stopAll(): void {
    this.audioElements.forEach((audio, soundId) => {
      this.clearLoopTimeout(soundId);
      audio.pause();
      audio.currentTime = 0;
      audio.onended = null;
    });
  }

  /**
   * Set the volume for a specific sound
   * @param soundId - ID of the sound
   * @param volume - Volume level (0-1)
   */
  setVolume(soundId: SoundId, volume: number): void {
    const audio = this.audioElements.get(soundId);
    if (!audio) {
      return;
    }

    // Clamp volume to valid range
    audio.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Clean up all audio elements and timeouts (call on unmount)
   */
  cleanup(): void {
    // Stop all sounds
    this.stopAll();

    // Remove all audio elements
    this.audioElements.forEach((audio) => {
      audio.src = "";
      audio.load();
    });

    this.audioElements.clear();
    this.loopTimeouts.clear();
  }

  /**
   * Helper method to clear a loop timeout for a specific sound
   * @param soundId - ID of the sound
   */
  private clearLoopTimeout(soundId: SoundId): void {
    const timeout = this.loopTimeouts.get(soundId);
    if (timeout) {
      clearTimeout(timeout);
      this.loopTimeouts.delete(soundId);
    }
  }
}
