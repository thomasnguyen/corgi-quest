import { Flame } from "lucide-react";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakCard({
  currentStreak,
  longestStreak,
}: StreakCardProps) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-lg p-4">
      <h3 className="text-white text-center text-sm font-semibold mb-4 uppercase tracking-wide">
        Streak
      </h3>
      <div className="space-y-4">
        {/* Current Streak */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame size={20} className="text-[#f5c35f]" />
            <span className="text-white text-xs font-medium">Current</span>
          </div>
          <div className="text-3xl font-bold text-[#D4AF37]">
            {currentStreak}
          </div>
          <div className="text-white/60 text-xs mt-1">days</div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10"></div>

        {/* Longest Streak */}
        <div className="text-center">
          <div className="text-white text-xs font-medium mb-2">Best</div>
          <div className="text-2xl font-bold text-[#f5c35f]">
            {longestStreak}
          </div>
          <div className="text-white/60 text-xs mt-1">days</div>
        </div>
      </div>
    </div>
  );
}


