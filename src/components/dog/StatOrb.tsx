import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lightbulb, Zap, Shield, Users } from "lucide-react";
import { StatType } from "../../lib/types";
import { useAnimationTrigger } from "../../hooks/useAnimationTrigger";
import { STAT_COLORS } from "../../lib/animationUtils";
import FloatingXP from "../animations/FloatingXP";

interface StatOrbProps {
  statType: StatType;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

interface FloatingXPData {
  id: number;
  amount: number;
  x: number;
  y: number;
}

const STAT_NAMES: Record<StatType, string> = {
  INT: "Intelligence",
  PHY: "Physical",
  IMP: "Impulse Control",
  SOC: "Socialization",
};

const STAT_ICONS: Record<
  StatType,
  React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
    fill?: string;
    style?: React.CSSProperties;
  }>
> = {
  INT: Lightbulb,
  PHY: Zap,
  IMP: Shield,
  SOC: Users,
};

export default function StatOrb({
  statType,
  level,
  xp,
  xpToNextLevel,
}: StatOrbProps) {
  const navigate = useNavigate();
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState(level);

  // State for floating XP animations (Subtask 3.3)
  const [floatingXPs, setFloatingXPs] = useState<FloatingXPData[]>([]);

  // Detect level-up and trigger animation
  useEffect(() => {
    if (level > previousLevel) {
      setIsLevelingUp(true);
      // Reset animation after 6 seconds (3x longer)
      const timer = setTimeout(() => {
        setIsLevelingUp(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
    setPreviousLevel(level);
  }, [level, previousLevel]);

  // Detect XP changes and trigger floating XP animation (Subtask 3.1)
  useAnimationTrigger(
    xp,
    (prevXP, currentXP) => {
      // Calculate XP gained amount
      const xpGained = prevXP !== undefined ? currentXP - prevXP : 0;

      // Only show animation if XP increased
      if (xpGained > 0) {
        // Spawn at center of screen (higher up for better visibility)
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 3; // Upper third of screen

        // Add new animation to state (Subtask 3.3)
        setFloatingXPs((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(), // Unique ID
            amount: xpGained,
            x: centerX,
            y: centerY,
          },
        ]);
      }
    },
    { skipInitial: true } // Skip animation on initial mount
  );

  // Calculate progress percentage for visual ring
  const progressPercentage = (xp / xpToNextLevel) * 100;

  // SVG circle properties
  const size = 60;
  const strokeWidth = 2.5; // Smaller ring
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  const handleClick = () => {
    navigate({ to: `/stats/$statType`, params: { statType } });
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white ${
          isLevelingUp ? "animate-level-up" : ""
        }`}
        style={{ WebkitTapHighlightColor: "transparent" }}
        aria-label={`View ${STAT_NAMES[statType]} details`}
      >
        {/* Circular Progress Ring */}
        <div
          className="relative overflow-visible flex items-center justify-center"
          style={{ width: size + 16, height: size + 16 }}
        >
          <div className="relative" style={{ width: size, height: size }}>
            {/* Background circle */}
            <svg
              width={size}
              height={size}
              className="transform -rotate-90"
              style={{ overflow: "visible" }}
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#2a2a2a"
                strokeWidth={strokeWidth}
                fill="#1a1a1a"
                opacity={0.6}
              />
              {/* Progress circle - brighter and glowing */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#F5C35F"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`transition-all duration-300 ${
                  isLevelingUp ? "animate-pulse-ring" : ""
                }`}
                style={{
                  filter:
                    "drop-shadow(0 0 4px rgba(245, 195, 95, 0.9)) drop-shadow(0 0 8px rgba(245, 195, 95, 0.6)) drop-shadow(0 0 12px rgba(245, 195, 95, 0.3))",
                }}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {(() => {
                const Icon = STAT_ICONS[statType];
                return (
                  <Icon
                    size={20}
                    strokeWidth={2.5}
                    fill="none"
                    className="mb-1"
                    style={{
                      color: "#F5C35F",
                      filter: "drop-shadow(0 0 2px rgba(245, 195, 95, 0.6))",
                    }}
                  />
                );
              })()}
              <span className="text-[8px] font-bold text-white">
                LVL {level}
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Render FloatingXP components (Subtask 3.4) */}
      {floatingXPs.map((xpData) => (
        <FloatingXP
          key={xpData.id}
          amount={xpData.amount}
          color={STAT_COLORS[statType]}
          startX={xpData.x}
          startY={xpData.y}
          onComplete={() => {
            // Remove animation from state when it completes (Subtask 3.3)
            setFloatingXPs((prev) => prev.filter((xp) => xp.id !== xpData.id));
          }}
        />
      ))}
    </>
  );
}
