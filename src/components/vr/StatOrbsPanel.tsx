import { useEffect, useRef, useState } from "react";
import StatOrb from "./StatOrb";
import FloatingXP from "./FloatingXP";
import { useAnimationThrottle } from "../../hooks/useAnimationThrottle";
import type { Id } from "../../../convex/_generated/dataModel";

interface StatGain {
  _id: Id<"activity_stat_gains">;
  activityId: Id<"activities">;
  statType: "INT" | "PHY" | "IMP" | "SOC";
  xpAmount: number;
}

interface Activity {
  _id: Id<"activities">;
  statGains: StatGain[];
}

interface StatOrbsPanelProps {
  stats: Array<{
    _id: Id<"dog_stats">;
    dogId: Id<"dogs">;
    statType: "INT" | "PHY" | "IMP" | "SOC";
    level: number;
    xp: number;
    xpToNextLevel: number;
  }>;
  activities?: Activity[];
  position?: [number, number, number];
}

interface FloatingXPInstance {
  id: string;
  statType: "PHY" | "INT" | "IMP" | "SOC";
  xpAmount: number;
  position: [number, number, number];
}

/**
 * Get position for a stat orb based on its type
 */
function getStatOrbPosition(
  statType: "PHY" | "INT" | "IMP" | "SOC",
  spacing: number
): [number, number, number] {
  switch (statType) {
    case "PHY":
      return [0, spacing * 1.5, 0];
    case "INT":
      return [0, spacing * 0.5, 0];
    case "IMP":
      return [0, -spacing * 0.5, 0];
    case "SOC":
      return [0, -spacing * 1.5, 0];
  }
}

/**
 * StatOrbsPanel - Displays all four training stats as orbs
 *
 * Requirements: 4.1, 4.3, 10.4, 13.3
 * - Renders 4 StatOrbs for PHY, INT, IMP, SOC
 * - Positioned at left side by default
 * - Updates live when stats change (via Convex subscriptions)
 * - Listens for new activities and triggers animations
 * - Shows floating XP indicators when XP is gained
 */
export default function StatOrbsPanel({
  stats,
  activities = [],
  position = [-0.8, 0, -1.5], // Left side (from design doc)
}: StatOrbsPanelProps) {
  // Find each stat by type
  const phyStat = stats.find((s) => s.statType === "PHY");
  const intStat = stats.find((s) => s.statType === "INT");
  const impStat = stats.find((s) => s.statType === "IMP");
  const socStat = stats.find((s) => s.statType === "SOC");

  // Vertical spacing between orbs
  const spacing = 0.65;

  // Track previous activity IDs to detect new activities - Requirements: 4.3, 10.4
  const prevActivityIdsRef = useRef<string[]>([]);
  const [floatingXPs, setFloatingXPs] = useState<FloatingXPInstance[]>([]);

  // Animation throttling - Requirements: 15.2
  const animationThrottle = useAnimationThrottle(4);

  // Listen for new activities and trigger floating XP animations - Requirements: 4.3, 10.4, 13.3
  useEffect(() => {
    if (!activities || activities.length === 0) return;

    const currentIds = activities.map((a) => a._id);
    const prevIds = prevActivityIdsRef.current;

    // Find new activities (not in previous list)
    const newActivities = activities.filter((a) => !prevIds.includes(a._id));

    // Create floating XP indicators for each stat gain in new activities
    // Requirements: 15.2 - Limit simultaneous animations
    newActivities.forEach((activity) => {
      if (activity.statGains && activity.statGains.length > 0) {
        activity.statGains.forEach((gain) => {
          const animationId = `${activity._id}-${gain.statType}`;

          // Check if we can start a new animation
          if (animationThrottle.canAnimate(animationId)) {
            // Get the position of the stat orb for this stat type
            const orbPosition = getStatOrbPosition(gain.statType, spacing);

            // Create floating XP instance
            const floatingXP: FloatingXPInstance = {
              id: animationId,
              statType: gain.statType,
              xpAmount: gain.xpAmount,
              position: [
                orbPosition[0] + 0.3, // Offset to the right of the orb
                orbPosition[1],
                orbPosition[2] + 0.1,
              ],
            };

            animationThrottle.startAnimation(animationId);
            setFloatingXPs((prev) => [...prev, floatingXP]);
          }
        });
      }
    });

    prevActivityIdsRef.current = currentIds;
  }, [activities, spacing]);

  // Remove floating XP when animation completes
  const handleFloatingXPComplete = (id: string) => {
    animationThrottle.endAnimation(id);
    setFloatingXPs((prev) => prev.filter((xp) => xp.id !== id));
  };

  return (
    <group position={position}>
      {/* PHY - Top */}
      {phyStat && (
        <StatOrb
          statType="PHY"
          level={phyStat.level}
          xp={phyStat.xp}
          xpToNextLevel={phyStat.xpToNextLevel}
          position={[0, spacing * 1.5, 0]}
        />
      )}

      {/* INT - Upper middle */}
      {intStat && (
        <StatOrb
          statType="INT"
          level={intStat.level}
          xp={intStat.xp}
          xpToNextLevel={intStat.xpToNextLevel}
          position={[0, spacing * 0.5, 0]}
        />
      )}

      {/* IMP - Lower middle */}
      {impStat && (
        <StatOrb
          statType="IMP"
          level={impStat.level}
          xp={impStat.xp}
          xpToNextLevel={impStat.xpToNextLevel}
          position={[0, -spacing * 0.5, 0]}
        />
      )}

      {/* SOC - Bottom */}
      {socStat && (
        <StatOrb
          statType="SOC"
          level={socStat.level}
          xp={socStat.xp}
          xpToNextLevel={socStat.xpToNextLevel}
          position={[0, -spacing * 1.5, 0]}
        />
      )}

      {/* Show message if no stats available */}
      {stats.length === 0 && (
        <mesh>
          <planeGeometry args={[0.8, 0.3]} />
          <meshBasicMaterial color="#1a1a1a" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Floating XP indicators - Requirements: 4.3, 10.4, 13.3 */}
      {floatingXPs.map((xp) => (
        <FloatingXP
          key={xp.id}
          statType={xp.statType}
          xpAmount={xp.xpAmount}
          position={xp.position}
          onComplete={() => handleFloatingXPComplete(xp.id)}
        />
      ))}
    </group>
  );
}
