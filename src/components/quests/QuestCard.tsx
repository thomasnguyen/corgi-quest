import { Link } from "@tanstack/react-router";
import { Check, Zap, Brain } from "lucide-react";
import { getIcon } from "../../routes/quests.index";

type IconName =
  | "Sun"
  | "Moon"
  | "Activity"
  | "Users"
  | "Waves"
  | "Target"
  | "GraduationCap"
  | "Puzzle"
  | "Sparkles"
  | "Eye"
  | "Repeat"
  | "Scissors"
  | "Search"
  | "Gamepad2"
  | "Heart"
  | "Zap"
  | "Brain";

interface QuestCardProps {
  id: string;
  name: string;
  category: "Physical" | "Mental";
  points: number;
  description: string;
  isCompleted?: boolean;
  iconName: IconName;
}

export default function QuestCard({
  id,
  name,
  category,
  points,
  description,
  isCompleted = false,
  iconName,
}: QuestCardProps) {
  const Icon = getIcon(iconName);

  return (
    <Link
      to="/quests/$questId"
      params={{ questId: id }}
      className={`block bg-[#1a1a1e]/80 backdrop-blur-sm border border-[#3d3d3d]/50 rounded-lg p-4 transition-all duration-200 relative ${
        isCompleted
          ? "border-[#f5c35f]/50 bg-[#1a1a1e]"
          : "hover:border-[#f5c35f]/50 hover:bg-[#1a1a1e]"
      }`}
    >
      {/* Completion checkmark */}
      {isCompleted && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-[#f5c35f] rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-[#121216]" strokeWidth={3} />
        </div>
      )}

      {/* Header with icon, name and points */}
      <div className="flex items-start gap-3 mb-2 pr-10">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#2a2a2e]/80 border border-[#3d3d3d]/50 flex items-center justify-center">
          <Icon size={20} strokeWidth={2} className="text-[#f5c35f]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white text-sm mb-1">{name}</h3>
          <span className="font-mono font-bold text-[#f5c35f] text-sm">
            {points} pts
          </span>
        </div>
      </div>

      {/* Category badge */}
      <div className="mb-2 ml-[52px]">
        <span className="inline-flex items-center gap-1 border border-[#3d3d3d]/50 px-2 py-0.5 text-xs font-medium text-[#f9dca0] bg-[#1a1a1e]/50 rounded">
          {category === "Physical" ? (
            <Zap size={12} strokeWidth={2} className="text-[#f5c35f]" />
          ) : (
            <Brain size={12} strokeWidth={2} className="text-[#f5c35f]" />
          )}
          {category.toUpperCase()}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-[#f9dca0] ml-[52px]">{description}</p>
    </Link>
  );
}
