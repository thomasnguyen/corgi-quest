import { useEffect, useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { Id } from "../../../convex/_generated/dataModel";

interface StatGain {
  _id: Id<"activity_stat_gains">;
  activityId: Id<"activities">;
  statType: "INT" | "PHY" | "IMP" | "SOC";
  xpAmount: number;
}

interface Activity {
  _id: Id<"activities">;
  dogId: Id<"dogs">;
  userId: Id<"users">;
  activityName: string;
  description?: string;
  durationMinutes?: number;
  physicalPoints?: number;
  mentalPoints?: number;
  createdAt: number;
  userName: string;
  statGains: StatGain[];
}

interface ActivityFeedPanelProps {
  activities: Activity[];
}

/**
 * Get color for each stat type
 * Requirements: 11.2 - Show XP breakdown with stat-specific colors
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
 * ActivityItem - Single activity display in 3D space with smooth animations
 * Requirements: 11.2, 11.4 - Show activity name and XP breakdown with animations
 */
function ActivityItem({
  activity,
  position,
  opacity,
  yOffset,
}: {
  activity: Activity;
  position: [number, number, number];
  opacity: number;
  yOffset: number;
}) {
  const groupRef = useRef<Group>(null);
  const [currentYOffset, setCurrentYOffset] = useState(yOffset);

  // Smooth position animation - Requirements: 11.4
  useFrame(() => {
    if (Math.abs(currentYOffset - yOffset) > 0.001) {
      const newYOffset = currentYOffset + (yOffset - currentYOffset) * 0.15;
      setCurrentYOffset(newYOffset);
      if (groupRef.current) {
        groupRef.current.position.y = position[1] + newYOffset;
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1] + currentYOffset, position[2]]}
    >
      {/* Background panel */}
      <mesh>
        <planeGeometry args={[1.8, 0.35]} />
        <meshBasicMaterial
          color="#1a1a1a"
          transparent
          opacity={opacity * 0.8}
        />
      </mesh>

      {/* Activity name - Requirements: 11.2 */}
      <Text
        position={[-0.85, 0.1, 0.01]}
        fontSize={0.08}
        color="#f9dca0"
        anchorX="left"
        anchorY="middle"
        maxWidth={1.6}
        overflowWrap="break-word"
      >
        {activity.activityName}
      </Text>

      {/* User name */}
      <Text
        position={[-0.85, 0.02, 0.01]}
        fontSize={0.05}
        color="#888888"
        anchorX="left"
        anchorY="middle"
      >
        by {activity.userName}
      </Text>

      {/* XP breakdown - Requirements: 11.2 */}
      {activity.statGains && activity.statGains.length > 0 && (
        <group position={[-0.85, -0.08, 0.01]}>
          {activity.statGains.map((gain, index) => (
            <Text
              key={gain._id}
              position={[index * 0.35, 0, 0]}
              fontSize={0.06}
              color={getStatColor(gain.statType)}
              anchorX="left"
              anchorY="middle"
            >
              {gain.statType} +{gain.xpAmount}
            </Text>
          ))}
        </group>
      )}
    </group>
  );
}

/**
 * ActivityFeedPanel - Display recent training activities in VR with smooth animations
 *
 * Requirements:
 * - 11.1: Display 5 most recent activities
 * - 11.2: Show activity name and XP breakdown
 * - 11.4: Animate new activities fading in, scroll older items down
 *
 * Position: Right bottom (as specified in task)
 */
export default function ActivityFeedPanel({
  activities,
}: ActivityFeedPanelProps) {
  const groupRef = useRef<Group>(null);
  const [activityOpacities, setActivityOpacities] = useState<number[]>([]);
  const [activityYOffsets, setActivityYOffsets] = useState<number[]>([]);
  const prevActivityIdsRef = useRef<string[]>([]);

  // Track activity IDs to detect new activities - Requirements: 11.4
  useEffect(() => {
    const currentIds = activities.map((a) => a._id);
    const prevIds = prevActivityIdsRef.current;

    // Find new activities (not in previous list)
    const newActivityIds = currentIds.filter((id) => !prevIds.includes(id));
    const hasNewActivities = newActivityIds.length > 0;

    // Initialize opacities and Y offsets for all activities
    const newOpacities = activities.map((activity) => {
      const isNew = newActivityIds.includes(activity._id);
      // New activities start at 0 opacity for fade-in animation
      return isNew ? 0 : 1;
    });

    const newYOffsets = activities.map((activity) => {
      const isNew = newActivityIds.includes(activity._id);

      if (isNew) {
        // New activities start above their final position
        return -0.2;
      } else if (hasNewActivities) {
        // Existing activities need to scroll down to make room
        // They should move down by 0.4 units (one activity height)
        return 0;
      } else {
        // No new activities, stay in place
        return 0;
      }
    });

    setActivityOpacities(newOpacities);
    setActivityYOffsets(newYOffsets);
    prevActivityIdsRef.current = currentIds;
  }, [activities]);

  // Fade-in animation for new activities - Requirements: 11.4
  useFrame(() => {
    setActivityOpacities((prevOpacities) => {
      let updated = false;
      const newOpacities = prevOpacities.map((opacity) => {
        if (opacity < 1) {
          updated = true;
          return Math.min(1, opacity + 0.05); // Smooth fade-in
        }
        return opacity;
      });
      return updated ? newOpacities : prevOpacities;
    });

    // Animate Y offsets back to 0 (smooth scroll) - Requirements: 11.4
    setActivityYOffsets((prevOffsets) => {
      let updated = false;
      const newOffsets = prevOffsets.map((offset) => {
        if (Math.abs(offset) > 0.001) {
          updated = true;
          return offset * 0.85; // Smooth ease-out
        }
        return 0;
      });
      return updated ? newOffsets : prevOffsets;
    });
  });

  // Limit to 5 most recent activities - Requirements: 11.1
  const displayActivities = activities.slice(0, 5);

  return (
    <group ref={groupRef} position={[1.2, 0.2, -2]}>
      {/* Panel title */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.12}
        color="#f9dca0"
        anchorX="center"
        anchorY="middle"
      >
        Recent Activities
      </Text>

      {/* Activity list - Requirements: 11.4 (with scroll animation) */}
      {displayActivities.length > 0 ? (
        displayActivities.map((activity, index) => (
          <ActivityItem
            key={activity._id}
            activity={activity}
            position={[0, 0.5 - index * 0.4, 0]}
            opacity={activityOpacities[index] ?? 1}
            yOffset={activityYOffsets[index] ?? 0}
          />
        ))
      ) : (
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.08}
          color="#666666"
          anchorX="center"
          anchorY="middle"
        >
          No activities yet
        </Text>
      )}
    </group>
  );
}
