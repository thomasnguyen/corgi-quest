import { useState } from "react";
import { BarChart3, Package } from "lucide-react";
import { Id } from "convex/_generated/dataModel";
import { Dog, DogStat } from "../../lib/types";
import StatsView from "./StatsView";
import ItemsView from "./ItemsView";

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

interface BumiCharacterSheetProps {
  dog: Dog;
  stats: DogStat[];
  moodHistory?: MoodLog[];
}

/**
 * BumiCharacterSheet component for the BUMI tab
 * Provides sub-tab navigation between STATS and ITEMS views
 * Requirements: 28
 */
export default function BumiCharacterSheet({
  dog,
  stats,
  moodHistory,
}: BumiCharacterSheetProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "items">("stats");

  return (
    <div className="min-h-screen bg-[#121216]">
      {/* Sub-tab Navigation */}
      <div className="sticky top-0 z-10 bg-[#121216]/95 backdrop-blur-sm border-b border-[#2a2a2a]">
        <div className="max-w-md mx-auto px-4 pt-3 pb-0">
          <div className="flex">
            {/* STATS Tab */}
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex-1 py-3 px-4 text-sm font-semibold transition-all duration-200 relative flex items-center justify-center gap-2 min-w-0 ${
                activeTab === "stats"
                  ? "text-[#f5c35f] border-b-2 border-[#f5c35f]"
                  : "text-[#888] hover:text-[#f9dca0] border-b-2 border-transparent"
              }`}
            >
              <BarChart3 size={16} strokeWidth={2} className="flex-shrink-0" />
              <span className="whitespace-nowrap">STATS</span>
            </button>

            {/* ITEMS Tab */}
            <button
              onClick={() => setActiveTab("items")}
              className={`flex-1 py-3 px-4 text-sm font-semibold transition-all duration-200 relative flex items-center justify-center gap-2 min-w-0 ${
                activeTab === "items"
                  ? "text-[#f5c35f] border-b-2 border-[#f5c35f]"
                  : "text-[#888] hover:text-[#f9dca0] border-b-2 border-transparent"
              }`}
            >
              <Package size={16} strokeWidth={2} className="flex-shrink-0" />
              <span className="whitespace-nowrap">ITEMS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div>
        {activeTab === "stats" ? (
          <StatsView dog={dog} stats={stats} moodHistory={moodHistory} />
        ) : (
          <ItemsView dog={dog} />
        )}
      </div>
    </div>
  );
}
