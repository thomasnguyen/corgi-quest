import { Id } from "convex/_generated/dataModel";

interface ItemCardProps {
  itemId: Id<"cosmetic_items">;
  name: string;
  description: string;
  icon: string;
  unlockLevel: number;
  isUnlocked: boolean;
  isEquipped: boolean;
  isNew?: boolean;
  currentLevel: number;
  onEquip?: (itemId: Id<"cosmetic_items">) => void;
  isLoading?: boolean;
}

/**
 * ItemCard component for displaying cosmetic items in the BUMI tab
 * Shows locked/unlocked state, equip button, and currently equipped badge
 * Requirements: 28
 */
export default function ItemCard({
  itemId,
  name,
  description,
  icon,
  unlockLevel,
  isUnlocked,
  isEquipped,
  isNew = false,
  currentLevel,
  onEquip,
  isLoading = false,
}: ItemCardProps) {
  const handleEquip = () => {
    if (isUnlocked && !isEquipped && onEquip) {
      onEquip(itemId);
    }
  };

  return (
    <div
      className={`relative bg-[#1a1a1e]/80 backdrop-blur-sm border rounded-lg p-4 transition-all duration-200 ${
        isUnlocked
          ? isEquipped
            ? "border-[#f5c35f] bg-[#f5c35f]/10"
            : "border-[#3d3d3d]/50 hover:border-[#f5c35f]/50"
          : "border-[#3d3d3d]/30 opacity-60"
      }`}
    >
      {/* Currently Equipped Badge */}
      {isEquipped && (
        <div className="absolute top-2 right-2 bg-[#f5c35f] text-[#121216] text-xs font-bold px-2 py-1 rounded">
          EQUIPPED
        </div>
      )}

      {/* New Badge */}
      {!isEquipped && isUnlocked && isNew && (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
          NEW!
        </div>
      )}

      {/* Locked Badge */}
      {!isUnlocked && (
        <div className="absolute top-2 right-2 bg-[#3d3d3d] text-[#888] text-xs font-bold px-2 py-1 rounded">
          LOCKED
        </div>
      )}

      {/* Item Icon */}
      <div className="flex justify-center mb-3">
        <div className={`text-5xl ${isUnlocked ? "" : "grayscale opacity-50"}`}>
          {icon}
        </div>
      </div>

      {/* Item Name */}
      <h3
        className={`font-semibold text-center mb-2 ${
          isUnlocked ? "text-white" : "text-[#888]"
        }`}
      >
        {name}
      </h3>

      {/* Item Description */}
      <p
        className={`text-sm text-center mb-3 ${
          isUnlocked ? "text-[#f9dca0]" : "text-[#666]"
        }`}
      >
        {description}
      </p>

      {/* Unlock Requirement or Equip Button */}
      {!isUnlocked ? (
        <div className="text-center">
          <span className="inline-block bg-[#3d3d3d]/50 text-[#888] text-xs font-mono font-bold px-3 py-1.5 rounded">
            UNLOCK AT LVL {unlockLevel}
          </span>
          {currentLevel < unlockLevel && (
            <p className="text-[#666] text-xs mt-2">
              {unlockLevel - currentLevel} level
              {unlockLevel - currentLevel !== 1 ? "s" : ""} to go
            </p>
          )}
        </div>
      ) : isEquipped ? (
        <div className="text-center">
          <span className="inline-block text-[#f5c35f] text-sm font-medium">
            ✓ Currently Wearing
          </span>
        </div>
      ) : (
        <button
          onClick={handleEquip}
          disabled={isLoading}
          className="w-full bg-[#f5c35f] text-[#121216] py-2 rounded-lg font-semibold hover:bg-[#f5c35f]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Equipping..." : "Equip"}
        </button>
      )}
    </div>
  );
}
