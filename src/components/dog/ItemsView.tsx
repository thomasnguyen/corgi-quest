import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Dog } from "../../lib/types";
import { Id } from "convex/_generated/dataModel";
import ItemCard from "./ItemCard";
import { useState } from "react";
import { useEquipItem } from "../../hooks/useEquipItem";
import GeneratingScreen from "../ui/GeneratingScreen";

interface ItemsViewProps {
  dog: Dog;
}

/**
 * ItemsView component for the ITEMS sub-tab in BUMI screen
 * Displays dog portrait with current outfit, unlocked items, and locked items
 * Requirements: 28, 1.1, 1.2, 1.3, 5.1, 5.2, 5.3, 5.4
 */
export default function ItemsView({ dog }: ItemsViewProps) {
  const [isUnequipping, setIsUnequipping] = useState(false);

  // Get all cosmetic items with unlock status
  const allItems = useQuery(api.queries.getAllCosmeticItems, {
    dogId: dog._id,
  });

  // Get currently equipped item
  const equippedItem = useQuery(api.queries.getEquippedItem, {
    dogId: dog._id,
  });

  // Mutations
  const unequipItemMutation = useMutation(api.mutations.unequipItem);
  const equipItemMutation = useMutation(api.mutations.equipItem);

  // Use the AI-powered equip hook (only for non-moon items)
  const { equipItem, isLoading, error, loadingItemId } = useEquipItem(
    dog._id,
    dog.name
  );

  const handleEquip = async (itemId: Id<"cosmetic_items">) => {
    try {
      // Check if this is a moon item BEFORE calling equipItem
      // Moon items should NEVER show loading/generating screen - equip instantly!
      const item = allItems?.find((item) => item._id === itemId);
      const isMoonItem = item?.itemType === "moon";
      
      if (isMoonItem) {
        // Moon items: Call mutation directly, NO loading state, instant equip!
        // Call mutation directly - no loading state, instant equip
        await equipItemMutation({
          dogId: dog._id,
          itemId,
        });
        
        // Done! No loading screen, no generation, instant equip
        return;
      }
      
      // Non-moon items: Use the hook which handles AI generation
      await equipItem(itemId);
    } catch (error) {
      // Error is already handled by useEquipItem hook
      console.error("Failed to equip item:", error);
    }
  };

  const handleUnequip = async () => {
    try {
      setIsUnequipping(true);
      await unequipItemMutation({ dogId: dog._id });
    } catch (error) {
      console.error("Failed to unequip item:", error);
    } finally {
      setIsUnequipping(false);
    }
  };

  // Loading state
  if (allItems === undefined || equippedItem === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#f5c35f] border-t-transparent"></div>
          <p className="mt-4 text-[#f9dca0] text-sm">Loading items...</p>
        </div>
      </div>
    );
  }

  // Separate unlocked and locked items
  const unlockedItems = allItems.filter((item) => item.isUnlocked);
  const lockedItems = allItems.filter((item) => !item.isUnlocked);

  // Get equipped item ID for comparison
  const equippedItemId = equippedItem?.itemId;

  // Check if the currently loading item is a moon item (don't show generating screen for moon items)
  const loadingItem = allItems?.find((item) => item._id === loadingItemId);
  const isLoadingMoonItem = loadingItem?.itemType === "moon";
  
  // DEBUG: Log to console to verify moon item detection
  if (isLoading && loadingItemId) {
    console.log("🔍 Loading item check:", {
      itemId: loadingItemId,
      itemName: loadingItem?.name,
      itemType: loadingItem?.itemType,
      isMoonItem: isLoadingMoonItem,
      allItemsLength: allItems?.length,
      foundItem: !!loadingItem,
    });
    
    if (isLoadingMoonItem) {
      console.log("✅ MOON ITEM DETECTED - Generating screen will NOT show");
    } else {
      console.log("❌ NOT a moon item - Generating screen WILL show");
    }
  }

  return (
    <div className="min-h-screen pb-32 pt-4 px-4">
      {/* Show generating screen when AI is generating (but NOT for moon items) */}
      {isLoading && loadingItemId && !isLoadingMoonItem && (
        <GeneratingScreen />
      )}
      
      <div className="max-w-md mx-auto space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-red-500 text-lg">⚠️</span>
              <div className="flex-1">
                <p className="text-red-400 text-sm font-semibold mb-1">
                  Generation Failed
                </p>
                <p className="text-red-300 text-xs mb-2">{error}</p>
                {loadingItemId && (
                  <button
                    onClick={() => handleEquip(loadingItemId)}
                    className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded transition-colors"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dog Portrait Section */}
        <div className="text-center">
          {/* Portrait with Border - shows equipped item or base portrait */}
          <div className="relative w-32 h-32 mx-auto mb-3">
            {/* Border SVG */}
            <img
              src="/Border.svg"
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-contain"
            />
            {/* Portrait - shows equipped item or base portrait */}
            <div className="relative w-28 h-28 mx-auto mt-2 rounded-full bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center overflow-hidden">
              {isLoading && loadingItemId ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#f5c35f] border-t-transparent"></div>
                  <p className="text-[#f5c35f] text-[10px] font-semibold">
                    Generating...
                  </p>
                </div>
              ) : equippedItem?.item?.itemType === "moon" ? (
                // Moon items always use mage_avatar
                <picture>
                  <source srcSet="/mage_avatar.webp" type="image/webp" />
                  <img
                    src="/mage_avatar.png"
                    alt={`${dog.name} wearing ${equippedItem.item.name}`}
                    fetchPriority="high"
                    className="w-full h-full object-cover"
                  />
                </picture>
              ) : equippedItem?.generatedImageUrl && equippedItem.generatedImageUrl !== "" ? (
                // AI-generated image for non-moon items
                <img
                  src={equippedItem.generatedImageUrl}
                  alt={`${dog.name} wearing ${equippedItem.item.name}`}
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to default avatar if generated image fails to load
                    e.currentTarget.src = "/default_avatar.png";
                  }}
                />
              ) : (
                // Default avatar when nothing equipped
                <picture>
                  <source srcSet="/default_avatar.webp" type="image/webp" />
                  <img
                    src="/default_avatar.png"
                    alt={dog.name}
                    fetchPriority="high"
                    className="w-full h-full object-cover"
                  />
                </picture>
              )}
            </div>
          </div>

          {/* Currently Wearing */}
          <div className="mb-4">
            <p className="text-[#888] text-sm mb-1">Currently Wearing</p>
            <p className="text-white font-semibold">
              {equippedItem ? equippedItem.item.name : "Nothing"}
            </p>
            {equippedItem && (
              <>
                <div className="flex items-center justify-center gap-2 mt-1">
                  {equippedItem.item.itemType === "fire" ? (
                    <img
                      src="/fire_emblem.svg"
                      alt={equippedItem.item.name}
                      loading="lazy"
                      className="w-4 h-4"
                    />
                  ) : equippedItem.item.itemType === "water" ? (
                    <img
                      src="/water_emblem.svg"
                      alt={equippedItem.item.name}
                      loading="lazy"
                      className="w-4 h-4"
                    />
                  ) : equippedItem.item.itemType === "grass" ? (
                    <img
                      src="/grass_emblem.svg"
                      alt={equippedItem.item.name}
                      loading="lazy"
                      className="w-4 h-4"
                    />
                  ) : equippedItem.item.itemType === "sun" ? (
                    <img
                      src="/sun_emblem.svg"
                      alt={equippedItem.item.name}
                      loading="lazy"
                      className="w-4 h-4"
                    />
                  ) : equippedItem.item.itemType === "ground" ? (
                    <img
                      src="/earth_emblem.svg"
                      alt={equippedItem.item.name}
                      loading="lazy"
                      className="w-4 h-4"
                    />
                  ) : equippedItem.item.itemType === "moon" ? (
                    <img
                      src="/moon_emblem.svg"
                      alt={equippedItem.item.name}
                      loading="lazy"
                      className="w-4 h-4"
                    />
                  ) : (
                    <span className="text-[#f5c35f]">
                      {equippedItem.item.icon}
                    </span>
                  )}
                  <p className="text-[#f5c35f] text-xs">
                    {equippedItem.item.description}
                  </p>
                </div>
                {/* Unequip Button */}
                <button
                  onClick={handleUnequip}
                  disabled={isUnequipping}
                  className="mt-3 px-4 py-2 bg-[#2a2a2a] text-white text-sm rounded-lg border border-[#444] hover:bg-[#333] hover:border-[#666] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUnequipping ? "Unequipping..." : "Unequip"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Unlocked Items Section */}
        {unlockedItems.length > 0 && (
          <div>
            <h3 className="text-white text-center text-xs font-semibold uppercase tracking-wide mb-3">
              Unlocked Items ({unlockedItems.length})
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {unlockedItems.map((item) => (
                <ItemCard
                  key={item._id}
                  itemId={item._id}
                  name={item.name}
                  description={item.description}
                  icon={item.icon}
                  itemType={item.itemType}
                  unlockLevel={item.unlockLevel}
                  isUnlocked={true}
                  isEquipped={item._id === equippedItemId}
                  isNew={item.isNew}
                  currentLevel={dog.overallLevel}
                  onEquip={handleEquip}
                  isLoading={loadingItemId === item._id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Locked Items Section */}
        {lockedItems.length > 0 && (
          <div>
            <h3 className="text-white text-center text-xs font-semibold uppercase tracking-wide mb-3">
              Locked Items ({lockedItems.length})
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {lockedItems.map((item) => (
                <ItemCard
                  key={item._id}
                  itemId={item._id}
                  name={item.name}
                  description={item.description}
                  icon={item.icon}
                  itemType={item.itemType}
                  unlockLevel={item.unlockLevel}
                  isUnlocked={false}
                  isEquipped={false}
                  currentLevel={dog.overallLevel}
                />
              ))}
            </div>
          </div>
        )}

        {/* No items message */}
        {allItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#888] text-sm">
              No cosmetic items available yet.
            </p>
            <p className="text-[#666] text-xs mt-2">
              Items unlock as you level up!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
