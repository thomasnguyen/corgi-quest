import { Text } from "@react-three/drei";
import type { Id } from "../../../convex/_generated/dataModel";

interface DogProfilePanelProps {
  dog: {
    _id: Id<"dogs">;
    name: string;
    overallLevel: number;
    overallXp: number;
    xpToNextLevel: number;
  } | null;
  position?: [number, number, number];
}

/**
 * DogProfilePanel - Displays dog name and level in VR space
 *
 * Requirements: 3.1, 3.2
 * - Shows dog's name in 3D text
 * - Shows overall level badge
 * - Positioned at center top by default
 */
export default function DogProfilePanel({
  dog,
  position = [0, 0.5, -1.5], // Center top (from design doc)
}: DogProfilePanelProps) {
  if (!dog) {
    return (
      <Text
        position={position}
        fontSize={0.15}
        color="#888888"
        anchorX="center"
        anchorY="middle"
      >
        No dog selected
      </Text>
    );
  }

  return (
    <group position={position}>
      {/* Dog name - larger, prominent */}
      <Text
        position={[0, 0.15, 0]}
        fontSize={0.25}
        color="#f9dca0"
        anchorX="center"
        anchorY="middle"
      >
        {dog.name}
      </Text>

      {/* Level badge - smaller, below name */}
      <Text
        position={[0, -0.1, 0]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Level {dog.overallLevel}
      </Text>

      {/* XP progress indicator - subtle, informational */}
      <Text
        position={[0, -0.25, 0]}
        fontSize={0.1}
        color="#888888"
        anchorX="center"
        anchorY="middle"
      >
        {dog.overallXp} / {dog.xpToNextLevel} XP
      </Text>
    </group>
  );
}
