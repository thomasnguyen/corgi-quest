import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Group } from "three";

interface SessionControlsPanelProps {
  session: {
    isActive: boolean;
    repCount: number;
    startTime: number | null;
  };
  isProcessing: boolean;
  error: string | null;
}

export default function SessionControlsPanel({
  session,
  isProcessing,
  error,
}: SessionControlsPanelProps) {
  const groupRef = useRef<Group>(null);
  const [pulseScale, setPulseScale] = useState(1);

  // Pulse animation when processing
  useFrame((state) => {
    if (isProcessing && groupRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
      setPulseScale(pulse);
    } else {
      setPulseScale(1);
    }
  });

  // Position at center bottom (above voice status)
  const position: [number, number, number] = [0, 0.9, -2];

  return (
    <group ref={groupRef} position={position}>
      {/* Background panel */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.8, 0.5]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.85} />
      </mesh>

      {/* Error state */}
      {error && (
        <Text
          position={[0, 0, 0]}
          fontSize={0.07}
          color="#ff6b6b"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.6}
        >
          Error: {error}
        </Text>
      )}

      {/* Processing state */}
      {isProcessing && !error && (
        <group scale={pulseScale}>
          <Text
            position={[0, 0.05, 0]}
            fontSize={0.08}
            color="#4ade80"
            anchorX="center"
            anchorY="middle"
          >
            Processing Activity...
          </Text>
          <Text
            position={[0, -0.08, 0]}
            fontSize={0.05}
            color="#999999"
            anchorX="center"
            anchorY="middle"
          >
            Calculating XP gains
          </Text>
        </group>
      )}

      {/* No active session - show instructions */}
      {!session.isActive && !isProcessing && !error && (
        <>
          <Text
            position={[0, 0.12, 0]}
            fontSize={0.09}
            color="#f9dca0"
            anchorX="center"
            anchorY="middle"
          >
            Ready to Train
          </Text>
          <Text
            position={[0, 0.02, 0]}
            fontSize={0.06}
            color="#999999"
            anchorX="center"
            anchorY="middle"
          >
            Say "start session" to begin
          </Text>
          <Text
            position={[0, -0.08, 0]}
            fontSize={0.05}
            color="#666666"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.6}
          >
            Then say "mark rep" for each repetition
          </Text>
        </>
      )}

      {/* Active session - show rep counter and instructions */}
      {session.isActive && !isProcessing && !error && (
        <>
          <Text
            position={[0, 0.15, 0]}
            fontSize={0.1}
            color="#4ade80"
            anchorX="center"
            anchorY="middle"
          >
            Session Active
          </Text>

          {/* Rep counter */}
          <group position={[0, 0.02, 0]}>
            <Text
              position={[0, 0, 0]}
              fontSize={0.12}
              color="#f9dca0"
              anchorX="center"
              anchorY="middle"
            >
              {session.repCount} reps
            </Text>
          </group>

          {/* Instructions */}
          <Text
            position={[0, -0.12, 0]}
            fontSize={0.05}
            color="#999999"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.6}
          >
            Say "end session" + description when done
          </Text>
        </>
      )}
    </group>
  );
}
