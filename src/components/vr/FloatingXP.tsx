import { useEffect, useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

interface FloatingXPProps {
  statType: "PHY" | "INT" | "IMP" | "SOC";
  xpAmount: number;
  position: [number, number, number];
  onComplete?: () => void;
}

/**
 * Get color for each stat type
 */
function getStatColor(statType: "PHY" | "INT" | "IMP" | "SOC"): string {
  switch (statType) {
    case "PHY":
      return "#ff6b35"; // Orange/red for physical
    case "INT":
      return "#4ecdc4"; // Cyan for intelligence
    case "IMP":
      return "#a78bfa"; // Purple for impulse control
    case "SOC":
      return "#fbbf24"; // Yellow for socialization
  }
}

/**
 * FloatingXP - Animated floating XP indicator in 3D space
 *
 * Requirements: 4.3, 10.4, 13.3
 * - Shows floating XP indicators (e.g., "+15 PHY")
 * - Fades out and floats upward
 * - Calls onComplete when animation finishes
 */
export default function FloatingXP({
  statType,
  xpAmount,
  position,
  onComplete,
}: FloatingXPProps) {
  const groupRef = useRef<Group>(null);
  const [opacity, setOpacity] = useState(1);
  const [yOffset, setYOffset] = useState(0);
  const animationProgress = useRef(0);

  const color = getStatColor(statType);

  // Animate floating and fading
  useFrame((_, delta) => {
    animationProgress.current += delta;

    // Animation duration: 1.5 seconds
    const duration = 1.5;
    const progress = Math.min(animationProgress.current / duration, 1);

    // Float upward (ease-out)
    const newYOffset = progress * 0.3 * (2 - progress);
    setYOffset(newYOffset);

    // Fade out (start fading after 50% of animation)
    const fadeStart = 0.5;
    if (progress > fadeStart) {
      const fadeProgress = (progress - fadeStart) / (1 - fadeStart);
      setOpacity(1 - fadeProgress);
    }

    // Call onComplete when animation finishes
    if (progress >= 1 && onComplete) {
      onComplete();
    }
  });

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1] + yOffset, position[2]]}
    >
      <Text
        fontSize={0.15}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        +{xpAmount} {statType}
      </Text>
      <meshBasicMaterial transparent opacity={opacity} />
    </group>
  );
}
