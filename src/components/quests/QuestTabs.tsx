import { Sparkles } from "lucide-react";

interface QuestTabsProps {
  activeTab: "all" | "ai";
  onTabChange: (tab: "all" | "ai") => void;
}

export default function QuestTabs({ activeTab, onTabChange }: QuestTabsProps) {
  return (
    <div className="flex gap-2 mb-6">
      {/* All Quests Tab */}
      <button
        onClick={() => onTabChange("all")}
        className={`py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
          activeTab === "all"
            ? "bg-[#f5c35f] text-[#121216] border-2 border-[#f5c35f]"
            : "bg-[#1a1a1e]/80 text-[#f9dca0] border-2 border-[#3d3d3d]/50 hover:border-[#f5c35f]/50"
        }`}
      >
        ALL QUESTS
      </button>

      {/* AI Recommendations Tab */}
      <button
        onClick={() => onTabChange("ai")}
        className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
          activeTab === "ai"
            ? "bg-[#f5c35f] text-[#121216] border-2 border-[#f5c35f]"
            : "bg-[#1a1a1e]/80 text-[#f9dca0] border-2 border-[#3d3d3d]/50 hover:border-[#f5c35f]/50"
        }`}
      >
        <Sparkles size={16} strokeWidth={2} />
        AI RECOMMENDATIONS
      </button>
    </div>
  );
}
