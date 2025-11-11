import { useQuery, useMutation } from "convex/react";
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

  const handleEquip = async (itemId: Id<"cosmetic_items">) => {
    try {
      setLoadingItemId(itemId);

      // For hackathon demo: use placeholder image URL
      // In production, this would call an AI image generation service
      const placeholderImageUrl = `https://placehold.co/400x400/1a1a1a/f5c35f?text=${encodeURIComponent("🐕")}`;

      await equipItemMutation({
        dogId: dog._id,
        itemId,
        imageUrl: placeholderImageUrl,
      });
    } catch (error) {
      console.error("Failed to equip item:", error);
    } finally {
      setLoadingItemId(null);
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

  return (
    <div className="min-h-screen pb-32 pt-4 px-4">
      <div className="max-w-md mx-auto space-y-4">
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
              {equippedItem?.item?.itemType === "moon" ? (
                <picture>
                  <source srcSet="/mage_avatar.webp" type="image/webp" />
                  <img
                    src="/mage_avatar.png"
                    alt={`${dog.name} wearing ${equippedItem.item.name}`}
                    fetchPriority="high"
                    className="w-full h-full object-cover"
                  />
                </picture>
              ) : equippedItem?.generatedImageUrl ? (
                <img
                  src={equippedItem.generatedImageUrl}
                  alt={`${dog.name} wearing ${equippedItem.item.name}`}
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                />
              ) : (
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
                    <span className="text-[#f5c35f]">{equippedItem.item.icon}</span>
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
