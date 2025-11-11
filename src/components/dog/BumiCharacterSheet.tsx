import { useState } from "react";
import { Dog, DogStat } from "../../lib/types";
import StatsView from "./StatsView";
import ItemsView from "./ItemsView";

interface BumiCharacterSheetProps {
  dog: Dog;
  stats: DogStat[];
}

/**
 * BumiCharacterSheet component for the BUMI tab
 * Provides sub-tab navigation between STATS and ITEMS views
 * Requirements: 28
 */
export default function BumiCharacterSheet({
  dog,
  stats,
}: BumiCharacterSheetProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "items">("stats");

  return (
    <div className="min-h-screen bg-[#121216]">
      {/* Sub-tab Navigation */}
      <div className="sticky top-0 z-10 bg-[#121216] border-b border-white/10 px-4 pt-4 pb-2">
        <div className="max-w-md mx-auto flex gap-2">
          {/* STATS Tab */}
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === "stats"
                ? "bg-[#f5c35f] text-[#121216] border-2 border-[#f5c35f]"
                : "bg-[#1a1a1e]/80 text-[#f9dca0] border-2 border-[#3d3d3d]/50 hover:border-[#f5c35f]/50"
            }`}
          >
            STATS
          </button>

          {/* ITEMS Tab */}
          <button
            onClick={() => setActiveTab("items")}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === "items"
                ? "bg-[#f5c35f] text-[#121216] border-2 border-[#f5c35f]"
                : "bg-[#1a1a1e]/80 text-[#f9dca0] border-2 border-[#3d3d3d]/50 hover:border-[#f5c35f]/50"
            }`}
          >
            ITEMS
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div>
        {activeTab === "stats" ? (
          <StatsView dog={dog} stats={stats} />
        ) : (
          <ItemsView dog={dog} />
        )}
      </div>
    </div>
  );
}
