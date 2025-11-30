import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import type { Group } from "three";

interface VoiceStatusPanelProps {
  isListening: boolean;
  lastCommand: string | null;
  micPermissionGranted: boolean;
  transcript: string;
  isProcessing?: boolean;
  processingSuccess?: boolean;
}

export default function VoiceStatusPanel({
  isListening,
  lastCommand,
  micPermissionGranted,
  transcript,
  isProcessing = false,
  processingSuccess = false,
}: VoiceStatusPanelProps) {
  const groupRef = useRef<Group>(null);
  const [pulseScale, setPulseScale] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success message temporarily
  useEffect(() => {
    if (processingSuccess) {
      setShowSuccess(true);
      const timeout = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [processingSuccess]);

  // Pulse animation when listening
  useFrame((state) => {
    if (isListening && groupRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      setPulseScale(pulse);
    } else {
      setPulseScale(1);
    }
  });

  // Position at bottom center
  const position: [number, number, number] = [0, 0.5, -2];

  return (
    <group ref={groupRef} position={position}>
      {/* Background panel */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.5, 0.4]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.8} />
      </mesh>

      {/* Microphone permission status */}
      {!micPermissionGranted && (
        <>
          <Text
            position={[0, 0.1, 0]}
            fontSize={0.08}
            color="#ff6b6b"
            anchorX="center"
            anchorY="middle"
          >
            Microphone Permission Required
          </Text>
          <Text
            position={[0, -0.05, 0]}
            fontSize={0.05}
            color="#999999"
            anchorX="center"
            anchorY="middle"
          >
            Please grant microphone access
          </Text>
        </>
      )}

      {/* Processing indicator */}
      {micPermissionGranted && isProcessing && (
        <>
          {/* Spinning processing indicator - Optimized to 8 segments */}
          <mesh position={[-0.6, 0, 0]} rotation={[0, 0, Date.now() * 0.003]}>
            <ringGeometry args={[0.04, 0.05, 8, 1, 0, Math.PI * 1.5]} />
            <meshBasicMaterial color="#f9dca0" />
          </mesh>

          <Text
            position={[0, 0.1, 0]}
            fontSize={0.08}
            color="#f9dca0"
            anchorX="center"
            anchorY="middle"
          >
            Processing...
          </Text>

          <Text
            position={[0, -0.05, 0]}
            fontSize={0.05}
            color="#999999"
            anchorX="center"
            anchorY="middle"
          >
            Sending to Claude AI
          </Text>
        </>
      )}

      {/* Success confirmation */}
      {micPermissionGranted && showSuccess && !isProcessing && (
        <>
          {/* Success checkmark (simple circle with green color) - Optimized to 8 segments */}
          <mesh position={[-0.6, 0, 0]}>
            <circleGeometry args={[0.05, 8]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>

          <Text
            position={[0, 0.1, 0]}
            fontSize={0.08}
            color="#4ade80"
            anchorX="center"
            anchorY="middle"
          >
            XP Awarded!
          </Text>

          <Text
            position={[0, -0.05, 0]}
            fontSize={0.05}
            color="#999999"
            anchorX="center"
            anchorY="middle"
          >
            Activity logged successfully
          </Text>
        </>
      )}

      {/* Listening indicator */}
      {micPermissionGranted && isListening && !isProcessing && !showSuccess && (
        <>
          {/* Pulsing microphone icon (simple circle) - Optimized to 8 segments */}
          <mesh position={[-0.6, 0, 0]} scale={pulseScale}>
            <circleGeometry args={[0.05, 8]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>

          <Text
            position={[0, 0.1, 0]}
            fontSize={0.08}
            color="#4ade80"
            anchorX="center"
            anchorY="middle"
          >
            Listening...
          </Text>

          {/* Show current transcript preview if available */}
          {transcript && (
            <Text
              position={[0, -0.05, 0]}
              fontSize={0.05}
              color="#f9dca0"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.3}
            >
              "
              {transcript.length > 50
                ? transcript.substring(0, 50) + "..."
                : transcript}
              "
            </Text>
          )}
        </>
      )}

      {/* Last recognized command */}
      {micPermissionGranted &&
        !isListening &&
        !isProcessing &&
        !showSuccess &&
        lastCommand && (
          <>
            <Text
              position={[0, 0.1, 0]}
              fontSize={0.08}
              color="#999999"
              anchorX="center"
              anchorY="middle"
            >
              Ready
            </Text>
            <Text
              position={[0, -0.05, 0]}
              fontSize={0.05}
              color="#666666"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.3}
            >
              Last: {lastCommand}
            </Text>
          </>
        )}

      {/* Ready state (mic granted but not listening) */}
      {micPermissionGranted &&
        !isListening &&
        !isProcessing &&
        !showSuccess &&
        !lastCommand && (
          <Text
            position={[0, 0, 0]}
            fontSize={0.08}
            color="#999999"
            anchorX="center"
            anchorY="middle"
          >
            Voice Ready
          </Text>
        )}
    </group>
  );
}
