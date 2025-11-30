import { useEffect, useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Id } from "../../../convex/_generated/dataModel";

interface GoalsPanelProps {
  goals: {
    _id: Id<"daily_goals">;
    dogId: Id<"dogs">;
    date: string;
    physicalPoints: number;
    physicalGoal: number;
    mentalPoints: number;
    mentalGoal: number;
  } | null;
  streak: {
    _id: Id<"streaks">;
    dogId: Id<"dogs">;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
  } | null;
  position?: [number, number, number];
}

/**
 * ProgressBar3D - 3D progress bar component with smooth animations
 * Requirements: 5.1, 5.2, 5.3 - Display physical and mental progress bars with animations
 */
function ProgressBar3D({
  progress,
  color,
  position,
  isComplete,
}: {
  progress: number;
  color: string;
  position: [number, number, number];
  isComplete: boolean;
}) {
  const barWidth = 0.6;
  const barHeight = 0.08;
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);
  const prevProgressRef = useRef(0);

  // Smooth progress animation - Requirements: 5.3
  useFrame(() => {
    const targetProgress = Math.min(Math.max(progress, 0), 1);

    // Animate progress bar smoothly
    if (Math.abs(animatedProgress - targetProgress) > 0.001) {
      const newProgress =
        animatedProgress + (targetProgress - animatedProgress) * 0.1;
      setAnimatedProgress(newProgress);
    }

    // Pulse animation when progress increases
    if (targetProgress > prevProgressRef.current) {
      setPulseScale(1.1);
    }

    // Return pulse to normal
    if (pulseScale > 1) {
      setPulseScale(Math.max(1, pulseScale - 0.05));
    }

    prevProgressRef.current = targetProgress;
  });

  return (
    <group position={position} scale={[pulseScale, pulseScale, 1]}>
      {/* Background bar */}
      <mesh>
        <planeGeometry args={[barWidth, barHeight]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Progress fill */}
      <mesh position={[-(barWidth / 2) * (1 - animatedProgress), 0, 0.001]}>
        <planeGeometry args={[barWidth * animatedProgress, barHeight]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Completion glow - Requirements: 5.5 */}
      {isComplete && (
        <mesh position={[0, 0, 0.002]}>
          <planeGeometry args={[barWidth + 0.05, barHeight + 0.05]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      )}

      {/* Border */}
      <lineSegments>
        <edgesGeometry
          attach="geometry"
          args={[new THREE.PlaneGeometry(barWidth, barHeight)]}
        />
        <lineBasicMaterial
          attach="material"
          color={isComplete ? color : "#444444"}
        />
      </lineSegments>
    </group>
  );
}

/**
 * GoalsPanel - Displays daily goals and streak with real-time animations
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 * - Display physical and mental progress bars
 * - Animate progress bars when activities logged
 * - Highlight completed goals
 * - Show streak counter
 * - Update streak counter in real-time
 * - Position at right top
 * - Update live when goals change (via Convex subscriptions)
 */
export default function GoalsPanel({
  goals,
  streak,
  position = [0.8, 0.3, -1.5], // Right top (from design doc)
}: GoalsPanelProps) {
  // Calculate progress percentages
  const physicalProgress = goals
    ? goals.physicalPoints / goals.physicalGoal
    : 0;
  const mentalProgress = goals ? goals.mentalPoints / goals.mentalGoal : 0;

  // Check if goals are complete - Requirements: 5.5
  const isPhysicalComplete = goals
    ? goals.physicalPoints >= goals.physicalGoal
    : false;
  const isMentalComplete = goals
    ? goals.mentalPoints >= goals.mentalGoal
    : false;

  // Animate streak counter - Requirements: 5.4
  const [displayedStreak, setDisplayedStreak] = useState(
    streak?.currentStreak ?? 0
  );
  const prevStreakRef = useRef(streak?.currentStreak ?? 0);

  useEffect(() => {
    const currentStreak = streak?.currentStreak ?? 0;

    // Animate streak counter when it changes
    if (currentStreak !== prevStreakRef.current) {
      // Animate from previous to current value
      let frame = 0;
      const frames = 20;
      const diff = currentStreak - prevStreakRef.current;

      const animate = () => {
        frame++;
        if (frame <= frames) {
          const progress = frame / frames;
          const value = Math.round(prevStreakRef.current + diff * progress);
          setDisplayedStreak(value);
          requestAnimationFrame(animate);
        } else {
          setDisplayedStreak(currentStreak);
        }
      };

      animate();
      prevStreakRef.current = currentStreak;
    }
  }, [streak?.currentStreak]);

  return (
    <group position={position}>
      {/* Panel title */}
      <Text
        position={[0, 0.35, 0]}
        fontSize={0.12}
        color="#f9dca0"
        anchorX="center"
        anchorY="middle"
      >
        Today's Goals
      </Text>

      {/* Physical goal label */}
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.08}
        color="#ff6b35"
        anchorX="center"
        anchorY="middle"
      >
        Physical
      </Text>

      {/* Physical progress bar - Requirements: 5.1, 5.3, 5.5 */}
      <ProgressBar3D
        progress={physicalProgress}
        color="#ff6b35"
        position={[0, 0.1, 0]}
        isComplete={isPhysicalComplete}
      />

      {/* Physical points text */}
      <Text
        position={[0, 0.02, 0]}
        fontSize={0.06}
        color="#888888"
        anchorX="center"
        anchorY="middle"
      >
        {goals ? `${goals.physicalPoints} / ${goals.physicalGoal}` : "0 / 0"}
      </Text>

      {/* Mental goal label */}
      <Text
        position={[0, -0.1, 0]}
        fontSize={0.08}
        color="#4ecdc4"
        anchorX="center"
        anchorY="middle"
      >
        Mental
      </Text>

      {/* Mental progress bar - Requirements: 5.2, 5.3, 5.5 */}
      <ProgressBar3D
        progress={mentalProgress}
        color="#4ecdc4"
        position={[0, -0.2, 0]}
        isComplete={isMentalComplete}
      />

      {/* Mental points text */}
      <Text
        position={[0, -0.28, 0]}
        fontSize={0.06}
        color="#888888"
        anchorX="center"
        anchorY="middle"
      >
        {goals ? `${goals.mentalPoints} / ${goals.mentalGoal}` : "0 / 0"}
      </Text>

      {/* Streak counter - Requirements: 5.4 (with real-time animation) */}
      {streak && (
        <>
          <Text
            position={[0, -0.42, 0]}
            fontSize={0.1}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
          >
            🔥 {displayedStreak}
          </Text>
          <Text
            position={[0, -0.52, 0]}
            fontSize={0.06}
            color="#888888"
            anchorX="center"
            anchorY="middle"
          >
            day streak
          </Text>
        </>
      )}

      {/* Completion indicator - Requirements: 5.5 */}
      {isPhysicalComplete && isMentalComplete && (
        <Text
          position={[0, -0.65, 0]}
          fontSize={0.08}
          color="#4ade80"
          anchorX="center"
          anchorY="middle"
        >
          ✓ Goals Complete!
        </Text>
      )}
    </group>
  );
}
