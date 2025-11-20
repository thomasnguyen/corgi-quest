import { ChevronDown } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface DogChipProps {
  dogId: Id<"dogs"> | null;
  dogName: string | null;
  dogLevel: number | null;
  onClick: () => void;
}

/**
 * DogChip component displays the currently active dog in the top bar
 *
 * Shows dog name, emoji avatar, and dropdown indicator.
 * When no dogs exist, shows a placeholder prompting to add first dog.
 *
 * Requirements: 1.1, 1.2, 1.4
 */
export function DogChip({ dogId, dogName, dogLevel, onClick }: DogChipProps) {
  // Placeholder state when no dogs exist - Requirements: 1.2
  if (!dogId || !dogName) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2 bg-[#121216]/80 backdrop-blur-sm rounded-full px-4 py-2 border border-[#3d3d3d]/30 hover:border-[#f5c35f]/50 transition-colors cursor-pointer active:scale-95 min-h-[44px] min-w-[44px]"
        title="Add your first dog"
      >
        <span className="text-[#f9dca0] text-sm font-medium">
          + Add your first dog
        </span>
      </button>
    );
  }

  // Normal state with dog info - Requirements: 1.1, 1.4
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-[#121216]/80 backdrop-blur-sm rounded-full px-4 py-2 border border-[#3d3d3d]/30 hover:border-[#f5c35f]/50 transition-colors cursor-pointer active:scale-95 min-h-[44px] min-w-[44px]"
      title={`${dogName} - Level ${dogLevel || 1}`}
    >
      {/* Dog emoji avatar */}
      <span className="text-base">🐶</span>

      {/* Dog name with text shadow for readability */}
      <span
        className="text-[#f9dca0] text-sm font-medium"
        style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)" }}
      >
        {dogName}
      </span>

      {/* Dropdown indicator */}
      <ChevronDown size={14} className="text-[#888]" />
    </button>
  );
}
