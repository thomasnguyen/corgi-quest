import { Link } from "@tanstack/react-router";
import { Check, Zap, Brain } from "lucide-react";

interface QuestCardProps {
  id: string;
  name: string;
  category: "Physical" | "Mental";
  points: number;
  description: string;
  isCompleted?: boolean;
}

export default function QuestCard({
  id,
  name,
  category,
  points,
  description,
  isCompleted = false,
}: QuestCardProps) {
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

      {/* Header with name and points */}
      <div className="flex justify-between items-start mb-2 pr-10">
        <div className="flex-1">
          <h3 className="font-medium text-white text-sm mb-1">{name}</h3>
        </div>
        <span className="font-mono font-bold text-[#f5c35f] text-sm ml-4">
          {points} pts
        </span>
      </div>

      {/* Category badge */}
      <div className="mb-2">
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
      <p className="text-sm text-[#f9dca0]">{description}</p>
    </Link>
  );
}
