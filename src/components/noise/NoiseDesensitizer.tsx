// Main container component for the Noise Desensitizer tool
// Manages global state, audio playback, session timer, and progressive exposure

import { useState, useEffect, useRef } from "react";
import { AudioManager } from "../../lib/noiseAudio";
import { SOUNDS } from "../../lib/noiseSounds";
import type { SoundId, Mode, NoiseToolState } from "../../lib/noiseTypes";
import { SoundCard } from "./SoundCard";
import { SafetyCard } from "./SafetyCard";
import { ProgressiveToggle } from "./ProgressiveToggle";
import { StatusBar } from "./StatusBar";
import { SessionControls } from "./SessionControls";
import { NoiseCTA } from "./NoiseCTA";

export function NoiseDesensitizer() {
  // Initialize default state
  const [state, setState] = useState<NoiseToolState>(() => {
    // Build initial volume and mode maps from SOUNDS configuration
    const volumeBySound: Record<SoundId, number> = {} as Record<
      SoundId,
      number
    >;
    const modeBySound: Record<SoundId, Mode> = {} as Record<SoundId, Mode>;

    SOUNDS.forEach((sound) => {
      volumeBySound[sound.id] = sound.defaultVolume;
      modeBySound[sound.id] = sound.defaultMode;
    });

    return {
      selectedSoundId: null,
      activeSoundId: null,
      volumeBySound,
      modeBySound,
      progressiveEnabled: false,
      sessionSeconds: 0,
      isSessionRunning: false,
      isSafetyDrawerOpen: false,
    };
  });

  // Track if progressive exposure has been manually overridden for current sound
  const progressiveOverridden = useRef(false);

  // Create AudioManager instance (persists across re-renders)
  const audioManagerRef = useRef<AudioManager | null>(null);

  // Initialize AudioManager on mount
  useEffect(() => {
    audioManagerRef.current = new AudioManager(SOUNDS);

    // Cleanup on unmount
    return () => {
      if (audioManagerRef.current) {
        audioManagerRef.current.cleanup();
      }
    };
  }, []);

  // Session timer interval - increments every second when session is running
  useEffect(() => {
    if (!state.isSessionRunning) {
      return;
    }

    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        sessionSeconds: prev.sessionSeconds + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isSessionRunning]);

  // Progressive exposure interval - increases volume every 60 seconds
  useEffect(() => {
    if (
      !state.progressiveEnabled ||
      !state.activeSoundId ||
      progressiveOverridden.current
    ) {
      return;
    }

    const interval = setInterval(() => {
      setState((prev) => {
        if (!prev.activeSoundId) {
          return prev;
        }

        const currentVolume = prev.volumeBySound[prev.activeSoundId];

        // Only increase if below 0.6 (60%)
        if (currentVolume < 0.6) {
          const newVolume = Math.min(0.6, currentVolume + 0.1);

          // Update audio element volume
          if (audioManagerRef.current) {
            audioManagerRef.current.setVolume(prev.activeSoundId, newVolume);
          }

          return {
            ...prev,
            volumeBySound: {
              ...prev.volumeBySound,
              [prev.activeSoundId]: newVolume,
            },
          };
        }

        return prev;
      });
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [state.progressiveEnabled, state.activeSoundId]);

  /**
   * Handle playing a sound
   * Stops current sound, starts new sound, starts timer
   */
  const handlePlay = (soundId: SoundId) => {
    if (!audioManagerRef.current) {
      return;
    }

    // Stop currently playing sound if different
    if (state.activeSoundId && state.activeSoundId !== soundId) {
      audioManagerRef.current.stop(state.activeSoundId);
    }

    // Reset progressive override flag for new sound
    progressiveOverridden.current = false;

    // Get volume and mode for this sound
    const volume = state.volumeBySound[soundId];
    const mode = state.modeBySound[soundId];

    // If progressive exposure is enabled, start at 10% minimum
    const startVolume = state.progressiveEnabled
      ? Math.max(0.1, volume)
      : volume;

    // Play the sound
    audioManagerRef.current.play(soundId, startVolume, mode);

    // Update state
    setState((prev) => ({
      ...prev,
      activeSoundId: soundId,
      isSessionRunning: true,
      volumeBySound: {
        ...prev.volumeBySound,
        [soundId]: startVolume,
      },
    }));
  };

  /**
   * Handle stopping a specific sound
   * Stops sound, resets audio, pauses timer if no sounds active
   */
  const handleStop = (soundId: SoundId) => {
    if (!audioManagerRef.current) {
      return;
    }

    // Stop the sound
    audioManagerRef.current.stop(soundId);

    // Update state
    setState((prev) => ({
      ...prev,
      activeSoundId: prev.activeSoundId === soundId ? null : prev.activeSoundId,
      isSessionRunning: false,
    }));

    // Reset progressive override flag
    progressiveOverridden.current = false;
  };

  /**
   * Handle stopping all sounds
   * Stops all sounds and freezes timer
   */
  const handleStopAll = () => {
    if (!audioManagerRef.current) {
      return;
    }

    // Stop all audio
    audioManagerRef.current.stopAll();

    // Update state
    setState((prev) => ({
      ...prev,
      activeSoundId: null,
      isSessionRunning: false,
    }));

    // Reset progressive override flag
    progressiveOverridden.current = false;
  };

  /**
   * Handle volume change for a specific sound
   * Updates state and audio element
   */
  const handleVolumeChange = (soundId: SoundId, volume: number) => {
    // Clamp volume to 0-1 range
    const clampedVolume = Math.max(0, Math.min(1, volume));

    // If this is the active sound and progressive is enabled, mark as overridden
    if (state.activeSoundId === soundId && state.progressiveEnabled) {
      progressiveOverridden.current = true;
    }

    // Update audio element if this sound is playing
    if (audioManagerRef.current && state.activeSoundId === soundId) {
      audioManagerRef.current.setVolume(soundId, clampedVolume);
    }

    // Update state
    setState((prev) => ({
      ...prev,
      volumeBySound: {
        ...prev.volumeBySound,
        [soundId]: clampedVolume,
      },
    }));
  };

  /**
   * Handle mode change for a specific sound
   * Updates state (mode persists for that sound)
   */
  const handleModeChange = (soundId: SoundId, mode: Mode) => {
    setState((prev) => ({
      ...prev,
      modeBySound: {
        ...prev.modeBySound,
        [soundId]: mode,
      },
    }));

    // If this sound is currently playing, we need to restart it with the new mode
    if (state.activeSoundId === soundId && audioManagerRef.current) {
      const volume = state.volumeBySound[soundId];
      audioManagerRef.current.stop(soundId);
      audioManagerRef.current.play(soundId, volume, mode);
    }
  };

  /**
   * Handle toggling progressive exposure
   */
  const handleProgressiveToggle = () => {
    setState((prev) => ({
      ...prev,
      progressiveEnabled: !prev.progressiveEnabled,
    }));

    // Reset override flag when toggling
    progressiveOverridden.current = false;
  };

  /**
   * Handle resetting the session timer
   * Resets sessionSeconds to 0 without affecting playback
   */
  const handleResetTimer = () => {
    setState((prev) => ({
      ...prev,
      sessionSeconds: 0,
    }));
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-md mx-auto p-4">
          {/* Safety Card */}
          <SafetyCard />

          {/* Progressive Exposure Toggle */}
          <div className="mb-6">
            <ProgressiveToggle
              enabled={state.progressiveEnabled}
              onToggle={handleProgressiveToggle}
            />
          </div>

          {/* Status Bar */}
          <StatusBar
            sessionSeconds={state.sessionSeconds}
            activeSoundId={state.activeSoundId}
            activeMode={
              state.activeSoundId
                ? state.modeBySound[state.activeSoundId]
                : null
            }
            isSessionRunning={state.isSessionRunning}
          />

          {/* Sound Cards Grid */}
          <div className="space-y-4 mt-6">
            {SOUNDS.map((sound) => (
              <SoundCard
                key={sound.id}
                sound={sound}
                isActive={state.activeSoundId === sound.id}
                volume={state.volumeBySound[sound.id]}
                mode={state.modeBySound[sound.id]}
                progressiveActive={
                  state.progressiveEnabled && state.activeSoundId === sound.id
                }
                onPlay={() => handlePlay(sound.id)}
                onStop={() => handleStop(sound.id)}
                onVolumeChange={(volume) =>
                  handleVolumeChange(sound.id, volume)
                }
                onModeChange={(mode) => handleModeChange(sound.id, mode)}
              />
            ))}
          </div>

          {/* CTA Footer */}
          <NoiseCTA />
        </div>
      </div>

      {/* Session Controls - Sticky Bottom */}
      <SessionControls
        onStopAll={handleStopAll}
        onResetTimer={handleResetTimer}
      />
    </div>
  );
}
