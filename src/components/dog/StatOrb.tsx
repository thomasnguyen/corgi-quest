import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lightbulb, Zap, Shield, Users } from "lucide-react";
import { StatType } from "../../lib/types";

interface StatOrbProps {
  statType: StatType;
  level: number;
  xp: number;
  xpToNextLevel: number;
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

  // Detect level-up and trigger animation
  useEffect(() => {
    if (level > previousLevel) {
      setIsLevelingUp(true);
      // Reset animation after 2 seconds
      const timer = setTimeout(() => {
        setIsLevelingUp(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    setPreviousLevel(level);
  }, [level, previousLevel]);

  // Calculate progress percentage for visual ring
  const progressPercentage = (xp / xpToNextLevel) * 100;

  // SVG circle properties
  const size = 60;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  const handleClick = () => {
    navigate({ to: `/stats/$statType`, params: { statType } });
  };

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white ${
        isLevelingUp ? "animate-level-up" : ""
      }`}
      aria-label={`View ${STAT_NAMES[statType]} details`}
    >
      {/* Circular Progress Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#3d3d3d"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#D4AF37"
            strokeWidth={strokeWidth}
            fill="#0000006c"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-300 ${
              isLevelingUp ? "animate-pulse-ring" : ""
            }`}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {(() => {
            const Icon = STAT_ICONS[statType];
            return (
              <Icon size={20} strokeWidth={2} className="mb-1 text-white" />
            );
          })()}
          <span className="text-[8px] font-bold text-white">LVL {level}</span>
        </div>
      </div>
    </button>
  );
}
