import { useEffect, useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";

interface StatOrbProps {
  statType: "PHY" | "INT" | "IMP" | "SOC";
  level: number;
  xp: number;
  xpToNextLevel: number;
  position: [number, number, number];
}

/**
 * Get color for each stat type
 * Requirements: 4.2 - Use stat-specific colors
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
 * Get full name for each stat type
 * Requirements: 4.5 - Show stat type and level
 */
function getStatName(statType: "PHY" | "INT" | "IMP" | "SOC"): string {
  switch (statType) {
    case "PHY":
      return "Physical";
    case "INT":
      return "Intelligence";
    case "IMP":
      return "Impulse";
    case "SOC":
      return "Social";
  }
}

/**
 * StatOrb - 3D visualization of a single stat with circular progress ring
 *
 * Requirements: 4.1, 4.2, 4.5
 * - Renders circle with progress ring showing XP progress
 * - Shows stat type and level
 * - Uses stat-specific colors
 * - Adds pulse animation on XP gain
 */
export default function StatOrb({
  statType,
  level,
  xp,
  xpToNextLevel,
  position,
}: StatOrbProps) {
  const groupRef = useRef<Group>(null);
  const [targetScale, setTargetScale] = useState(1);
  const [currentScale, setCurrentScale] = useState(1);
  const prevXpRef = useRef(xp);
  const meshRefs = useRef<Mesh[]>([]);

  // Calculate progress percentage
  const progress = xpToNextLevel > 0 ? xp / xpToNextLevel : 0;
  const color = getStatColor(statType);
  const statName = getStatName(statType);

  // Pulse animation on XP change - Requirements: 4.2
  useEffect(() => {
    if (xp > prevXpRef.current) {
      // XP increased, trigger pulse
      setTargetScale(1.2);
      const timeout = setTimeout(() => {
        setTargetScale(1);
      }, 300);
      return () => clearTimeout(timeout);
    }
    prevXpRef.current = xp;
  }, [xp]);

  // Smooth scale animation
  useFrame(() => {
    if (Math.abs(currentScale - targetScale) > 0.01) {
      const newScale = currentScale + (targetScale - currentScale) * 0.15;
      setCurrentScale(newScale);
      if (groupRef.current) {
        groupRef.current.scale.set(newScale, newScale, newScale);
      }
    }
  });

  // Cleanup resources on unmount - Requirements: 15.3
  useEffect(() => {
    return () => {
      meshRefs.current.forEach((mesh) => {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <group ref={groupRef} position={position}>
      {/* Background circle - Requirements: 4.1 - Optimized to 16 segments */}
      <mesh ref={(el) => el && meshRefs.current.push(el)}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Progress ring - Requirements: 4.2 - Optimized to 16 segments */}
      <mesh
        rotation={[0, 0, -Math.PI / 2]}
        ref={(el) => el && meshRefs.current.push(el)}
      >
        <ringGeometry args={[0.42, 0.5, 16, 1, 0, progress * Math.PI * 2]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Stat type label - Requirements: 4.5 */}
      <Text
        position={[0, 0.15, 0.01]}
        fontSize={0.12}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {statType}
      </Text>

      {/* Level - Requirements: 4.5 */}
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {level}
      </Text>

      {/* Stat name - Requirements: 4.5 */}
      <Text
        position={[0, -0.15, 0.01]}
        fontSize={0.08}
        color="#888888"
        anchorX="center"
        anchorY="middle"
      >
        {statName}
      </Text>

      {/* XP progress text */}
      <Text
        position={[0, -0.25, 0.01]}
        fontSize={0.06}
        color="#666666"
        anchorX="center"
        anchorY="middle"
      >
        {xp}/{xpToNextLevel}
      </Text>
    </group>
  );
}
