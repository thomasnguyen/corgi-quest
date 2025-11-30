import { useEffect, useState } from "react";
import { Text } from "@react-three/drei";
import { useActiveDog } from "../../hooks/useActiveDog";
import { useVRData } from "../../hooks/useVRData";
import { useVRVoiceCommands } from "../../hooks/useVRVoiceCommands";
import { useVRTrainingSession } from "../../hooks/useVRTrainingSession";
import type { Id } from "../../../convex/_generated/dataModel";
import DogProfilePanel from "./DogProfilePanel";
import StatOrbsPanel from "./StatOrbsPanel";
import GoalsPanel from "./GoalsPanel";
import ActivityFeedPanel from "./ActivityFeedPanel";
import VoiceStatusPanel from "./VoiceStatusPanel";
import SessionControlsPanel from "./SessionControlsPanel";

export default function VRScene() {
  const { activeDogId } = useActiveDog();
  const vrData = useVRData(activeDogId);
  const voiceCommands = useVRVoiceCommands();

  // Get current user ID from localStorage
  const [userId, setUserId] = useState<Id<"users"> | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("selectedCharacterId");
    if (storedUserId) {
      setUserId(storedUserId as Id<"users">);
    }
  }, []);

  // Training session management
  const trainingSession = useVRTrainingSession(
    activeDogId,
    userId,
    voiceCommands.command,
    voiceCommands.clearCommand
  );

  useEffect(() => {
    console.log("VR Scene mounted");
    console.log("Active dog ID:", activeDogId);
    console.log("VR Data loading:", vrData.isLoading);
    console.log("Voice listening:", voiceCommands.isListening);
    console.log("Mic permission:", voiceCommands.micPermissionGranted);
  }, [
    activeDogId,
    vrData.isLoading,
    voiceCommands.isListening,
    voiceCommands.micPermissionGranted,
  ]);

  return (
    <>
      {/* Ambient light for overall scene illumination */}
      <ambientLight intensity={0.5} />

      {/* Directional light for depth and shadows */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow={false} // Disable shadows for performance
      />

      {/* Additional fill light from below to reduce harsh shadows */}
      <directionalLight position={[-5, -3, -5]} intensity={0.3} />

      {/* Loading state */}
      {vrData.isLoading && (
        <Text
          position={[0, 1.6, -2]}
          fontSize={0.2}
          color="#f9dca0"
          anchorX="center"
          anchorY="middle"
        >
          Loading VR data...
        </Text>
      )}

      {/* No dog selected state */}
      {!vrData.isLoading && !vrData.dog && (
        <Text
          position={[0, 1.6, -2]}
          fontSize={0.15}
          color="#f9dca0"
          anchorX="center"
          anchorY="middle"
        >
          No dog selected
        </Text>
      )}

      {/* Display VR panels when data is loaded */}
      {!vrData.isLoading && vrData.dog && (
        <>
          {/* Dog Profile Panel - Center top */}
          <DogProfilePanel dog={vrData.dog} />

          {/* Stat Orbs Panel - Left side */}
          <StatOrbsPanel stats={vrData.stats} activities={vrData.activities} />

          {/* Goals Panel - Right top */}
          <GoalsPanel goals={vrData.goals} streak={vrData.streak} />

          {/* Activity Feed Panel - Right bottom */}
          <ActivityFeedPanel activities={vrData.activities} />

          {/* Voice Status Panel - Bottom center */}
          <VoiceStatusPanel
            isListening={voiceCommands.isListening}
            lastCommand={
              voiceCommands.command
                ? `${voiceCommands.command.type}${voiceCommands.command.payload ? `: ${voiceCommands.command.payload}` : ""}`
                : null
            }
            micPermissionGranted={voiceCommands.micPermissionGranted}
            transcript={voiceCommands.transcript}
            isProcessing={trainingSession.isProcessing}
            processingSuccess={
              trainingSession.lastSuccessTime !== null &&
              Date.now() - trainingSession.lastSuccessTime < 3000
            }
          />

          {/* Session Controls Panel - Center bottom */}
          <SessionControlsPanel
            session={trainingSession.session}
            isProcessing={trainingSession.isProcessing}
            error={trainingSession.error}
          />
        </>
      )}

      {/* Ground reference (optional, for spatial awareness) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow={false}
      >
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.3} />
      </mesh>
    </>
  );
}
