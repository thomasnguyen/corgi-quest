import { Id } from "convex/_generated/dataModel";

interface ItemCardProps {
  itemId: Id<"cosmetic_items">;
  name: string;
  description: string;
  icon: string;
  itemType?: string;
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
  itemType,
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
      className={`relative bg-[#1a1a1e]/80 backdrop-blur-sm border rounded-lg p-2 transition-all duration-200 ${
        isUnlocked
          ? isEquipped
            ? "border-[#f5c35f] bg-[#f5c35f]/10"
            : "border-[#3d3d3d]/50 hover:border-[#f5c35f]/50"
          : "border-[#3d3d3d]/30 opacity-60"
      }`}
    >
      {/* Currently Equipped Badge */}
      {isEquipped && (
        <div className="absolute top-1 right-1 bg-[#f5c35f] text-[#121216] text-[10px] font-bold px-1.5 py-0.5 rounded">
          EQUIPPED
        </div>
      )}

      {/* New Badge */}
      {!isEquipped && isUnlocked && isNew && (
        <div className="absolute top-1 right-1 bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] text-white text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse">
          NEW!
        </div>
      )}

      {/* Locked Badge */}
      {!isUnlocked && (
        <div className="absolute top-1 right-1 bg-[#3d3d3d] text-[#888] text-[10px] font-bold px-1.5 py-0.5 rounded">
          LOCKED
        </div>
      )}

      {/* Item Icon */}
      <div className="flex justify-center mb-2">
        {itemType === "fire" ? (
          <img
            src="/fire_emblem.svg"
            alt={name}
            loading="lazy"
            className={`w-8 h-8 ${isUnlocked ? "" : "grayscale opacity-50"}`}
          />
        ) : itemType === "water" ? (
          <img
            src="/water_emblem.svg"
            alt={name}
            loading="lazy"
            className={`w-8 h-8 ${isUnlocked ? "" : "grayscale opacity-50"}`}
          />
        ) : itemType === "grass" ? (
          <img
            src="/grass_emblem.svg"
            alt={name}
            loading="lazy"
            className={`w-8 h-8 ${isUnlocked ? "" : "grayscale opacity-50"}`}
          />
        ) : itemType === "sun" ? (
          <img
            src="/sun_emblem.svg"
            alt={name}
            loading="lazy"
            className={`w-8 h-8 ${isUnlocked ? "" : "grayscale opacity-50"}`}
          />
        ) : itemType === "ground" ? (
          <img
            src="/earth_emblem.svg"
            alt={name}
            loading="lazy"
            className={`w-8 h-8 ${isUnlocked ? "" : "grayscale opacity-50"}`}
          />
        ) : itemType === "moon" ? (
          <img
            src="/moon_emblem.svg"
            alt={name}
            loading="lazy"
            className={`w-8 h-8 ${isUnlocked ? "" : "grayscale opacity-50"}`}
          />
        ) : (
          <div
            className={`text-3xl ${isUnlocked ? "" : "grayscale opacity-50"}`}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Item Name */}
      <h3
        className={`font-semibold text-center mb-1 text-xs ${
          isUnlocked ? "text-white" : "text-[#888]"
        }`}
      >
        {name}
      </h3>

      {/* Item Description */}
      <p
        className={`text-[10px] text-center mb-2 leading-tight ${
          isUnlocked ? "text-[#f9dca0]" : "text-[#666]"
        }`}
      >
        {description}
      </p>

      {/* Unlock Requirement or Equip Button */}
      {!isUnlocked ? (
        <div className="text-center">
          <span className="inline-block bg-[#3d3d3d]/50 text-[#888] text-[10px] font-mono font-bold px-2 py-1 rounded">
            LVL {unlockLevel}
          </span>
          {currentLevel < unlockLevel && (
            <p className="text-[#666] text-[9px] mt-1">
              {unlockLevel - currentLevel} to go
            </p>
          )}
        </div>
      ) : isEquipped ? (
        <div className="text-center">
          <span className="inline-block text-[#f5c35f] text-[10px] font-medium">
            ✓ Wearing
          </span>
        </div>
      ) : (
        <button
          onClick={handleEquip}
          disabled={isLoading}
          className="w-full bg-[#f5c35f] text-[#121216] py-1.5 rounded text-[11px] font-semibold hover:bg-[#f5c35f]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          {isLoading && (
            <svg
              className="animate-spin h-3 w-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {isLoading ? "Generating..." : "Equip"}
        </button>
      )}
    </div>
  );
}
