import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Dog } from "../../lib/types";
import { Id } from "convex/_generated/dataModel";
import ItemCard from "./ItemCard";
import { useState } from "react";

interface ItemsViewProps {
  dog: Dog;
}

/**
 * ItemsView component for the ITEMS sub-tab in BUMI screen
 * Displays dog portrait with current outfit, unlocked items, and locked items
 * Requirements: 28
 */
export default function ItemsView({ dog }: ItemsViewProps) {
  const [loadingItemId, setLoadingItemId] =
    useState<Id<"cosmetic_items"> | null>(null);

  // Get all cosmetic items with unlock status
  const allItems = useQuery(api.queries.getAllCosmeticItems, {
    dogId: dog._id,
  });

  // Get currently equipped item
  const equippedItem = useQuery(api.queries.getEquippedItem, {
    dogId: dog._id,
  });

  // Equip item mutation (placeholder - will be implemented in task 91)
  // const equipItemMutation = useMutation(api.mutations.equipItem);

  const handleEquip = async (itemId: Id<"cosmetic_items">) => {
    try {
      setLoadingItemId(itemId);
      // TODO: Implement equipItem mutation in task 91
      // await equipItemMutation({ dogId: dog._id, itemId });
      console.log("Equip item:", itemId);
    } catch (error) {
      console.error("Failed to equip item:", error);
    } finally {
      setLoadingItemId(null);
    }
  };

  // Loading state
  if (allItems === undefined || equippedItem === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121216]">
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

  return (
    <div className="min-h-screen bg-[#121216] pb-32 pt-4 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Dog Portrait Section */}
        <div className="text-center">
          {/* Portrait - shows equipped item or base portrait */}
          <div className="w-48 h-48 mx-auto mb-4 rounded-full bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#D4AF37] flex items-center justify-center overflow-hidden">
            {equippedItem?.generatedImageUrl ? (
              <img
                src={equippedItem.generatedImageUrl}
                alt={`${dog.name} wearing ${equippedItem.item.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-6xl">🐕</div>
            )}
          </div>

          {/* Currently Wearing */}
          <div className="mb-6">
            <p className="text-[#888] text-sm mb-1">Currently Wearing</p>
            <p className="text-white font-semibold">
              {equippedItem ? equippedItem.item.name : "Nothing"}
            </p>
            {equippedItem && (
              <p className="text-[#f5c35f] text-xs mt-1">
                {equippedItem.item.icon} {equippedItem.item.description}
              </p>
            )}
          </div>
        </div>

        {/* Unlocked Items Section */}
        {unlockedItems.length > 0 && (
          <div>
            <h3 className="text-white text-center text-sm font-semibold uppercase tracking-wide mb-4">
              Unlocked Items ({unlockedItems.length})
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {unlockedItems.map((item) => (
                <ItemCard
                  key={item._id}
                  itemId={item._id}
                  name={item.name}
                  description={item.description}
                  icon={item.icon}
                  unlockLevel={item.unlockLevel}
                  isUnlocked={true}
                  isEquipped={item._id === equippedItemId}
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
            <h3 className="text-white text-center text-sm font-semibold uppercase tracking-wide mb-4">
              Locked Items ({lockedItems.length})
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {lockedItems.map((item) => (
                <ItemCard
                  key={item._id}
                  itemId={item._id}
                  name={item.name}
                  description={item.description}
                  icon={item.icon}
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
