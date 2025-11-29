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
        className="relative flex items-center gap-2 backdrop-blur-sm rounded-full px-4 py-2 border border-[#3d3d3d]/30 hover:border-[#f5c35f]/50 transition-all cursor-pointer active:scale-95 min-h-[44px] min-w-[44px] overflow-hidden"
        title="Add your first dog"
        style={{
          background:
            "linear-gradient(135deg, rgba(245, 195, 95, 0.15) 0%, rgba(139, 92, 46, 0.15) 100%)",
        }}
      >
        <span className="text-[#f9dca0] text-sm font-medium relative z-10">
          + Add your first dog
        </span>
      </button>
    );
  }

  // Normal state with dog info - Requirements: 1.1, 1.4
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-2 backdrop-blur-sm rounded-full px-4 py-2 border border-[#3d3d3d]/30 hover:border-[#f5c35f]/50 transition-all cursor-pointer active:scale-95 min-h-[44px] min-w-[44px] overflow-hidden"
      title={`${dogName} - Level ${dogLevel || 1}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(245, 195, 95, 0.2) 0%, rgba(139, 92, 46, 0.15) 100%)",
      }}
    >
      {/* Dog emoji avatar */}
      <span className="text-base relative z-10">🐶</span>

      {/* Dog name with text shadow for readability */}
      <span
        className="text-[#f9dca0] text-sm font-medium relative z-10"
        style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)" }}
      >
        {dogName}
      </span>

      {/* Dropdown indicator */}
      <ChevronDown size={14} className="text-[#888] relative z-10" />
    </button>
  );
}
