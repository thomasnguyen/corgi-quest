import { Link } from "@tanstack/react-router";
import { Check, Dumbbell, Brain } from "lucide-react";

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
      className={`block border-2 border-black p-4 transition-colors relative ${
        isCompleted ? "bg-gray-100" : "bg-white hover:bg-gray-50"
      }`}
    >
      {/* Completion checkmark */}
      {isCompleted && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Header with name and points */}
      <div className="flex justify-between items-start mb-2 pr-8">
        <div className="flex-1">
          <h3 className="font-bold text-black">{name}</h3>
        </div>
        <span className="font-mono font-bold text-black ml-4">
          {points} pts
        </span>
      </div>

      {/* Category badge */}
      <div className="mb-2">
        <span className="inline-flex items-center gap-1 border border-black px-2 py-0.5 text-xs font-bold text-black">
          {category === "Physical" ? (
            <Dumbbell size={12} strokeWidth={2} />
          ) : (
            <Brain size={12} strokeWidth={2} />
          )}
          {category.toUpperCase()}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700">{description}</p>
    </Link>
  );
}
