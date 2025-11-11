import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Id } from "convex/_generated/dataModel";
import { Dog, DogStat, StatType } from "../../lib/types";
import { ProgressBar } from "../ui/ProgressBar";
import RadarChart from "./RadarChart";
import MoodGraph from "./MoodGraph";
import { Lightbulb, Zap, Shield, Users } from "lucide-react";
import { api } from "../../../convex/_generated/api";

interface MoodLog {
  _id: Id<"mood_logs">;
  dogId: Id<"dogs">;
  userId: Id<"users">;
  mood: "calm" | "anxious" | "reactive" | "playful" | "tired" | "neutral";
  note?: string;
  activityId?: Id<"activities">;
  createdAt: number;
  userName: string;
}

interface StatsViewProps {
  dog: Dog;
  stats: DogStat[];
  moodHistory?: MoodLog[];
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

// Order of stats for display
const STAT_ORDER: StatType[] = ["INT", "PHY", "IMP", "SOC"];

export default function StatsView({ dog, stats, moodHistory }: StatsViewProps) {
  const navigate = useNavigate();

  // Get currently equipped item to check if moon item is equipped (for demo)
  const equippedItem = useQuery(api.queries.getEquippedItem, {
    dogId: dog._id,
  });

  // Get ordered stats
  const orderedStats = STAT_ORDER.map((statType) => {
    const stat = stats.find((s) => s.statType === statType);
    return stat || null;
  }).filter((stat): stat is DogStat => stat !== null);

  const handleStatClick = (statType: StatType) => {
    navigate({ to: `/stats/$statType`, params: { statType } });
  };

  return (
    <div className="min-h-screen pb-32 pt-4 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Dog Portrait Section */}
        <div className="text-center">
          {/* Portrait with Border - placeholder - will show equipped item later */}
          <div className="relative w-32 h-32 mx-auto mb-3">
            {/* Border SVG */}
            <img
              src="/Border.svg"
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-contain"
            />
            {/* Portrait placeholder */}
            <div className="relative w-28 h-28 mx-auto mt-2 rounded-full bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center overflow-hidden">
              <img
                src={equippedItem?.item?.itemType === "moon" ? "/mage_avatar.png" : "/default_avatar.png"}
                alt={dog.name}
                fetchPriority="high"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Dog Name and Level */}
          <h2
            className="text-3xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent mb-2"
          >
            {dog.name}
          </h2>
          <p className="text-[#feefd0] text-sm mb-1">
            Level {dog.overallLevel}
          </p>

          {/* Overall XP Bar */}
          <div className="px-4 mt-4">
            <ProgressBar current={dog.overallXp} max={dog.xpToNextLevel} />
          </div>
        </div>

        {/* Individual Stat Progress Bars */}
        <div className="space-y-4">
          <h3 className="text-white text-center text-sm font-semibold uppercase tracking-wide">
            Detailed Stats
          </h3>
          {orderedStats.map((stat) => {
            const Icon = STAT_ICONS[stat.statType];
            const percentage = (stat.xp / stat.xpToNextLevel) * 100;

            return (
              <button
                key={stat._id}
                onClick={() => handleStatClick(stat.statType)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] border border-[#D4AF37] flex items-center justify-center">
                    <Icon size={20} strokeWidth={2} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-semibold text-sm">
                      {STAT_NAMES[stat.statType]}
                    </div>
                    <div className="text-[#f5c35f] text-xs">
                      Level {stat.level}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-xs">
                      {stat.xp} / {stat.xpToNextLevel} XP
                    </div>
                    <div className="text-[#f5c35f] text-xs">
                      {Math.round(percentage)}%
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#0c0b0b]/80 border border-white/20 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#c6a755] to-[#fff1ab] transition-all duration-300 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Mood Graph */}
        {moodHistory !== undefined && (
          <MoodGraph moodLogs={moodHistory} days={7} />
        )}

        {/* Radar Chart */}
        <div className="bg-black/40 border border-white/10 rounded-lg p-6">
          <h3 className="text-white text-center text-sm font-semibold mb-4 uppercase tracking-wide">
            Stat Overview
          </h3>
          <RadarChart stats={stats} size={220} />
        </div>
      </div>
    </div>
  );
}
