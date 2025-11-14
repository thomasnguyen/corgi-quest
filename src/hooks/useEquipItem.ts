import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Hook to manage equipping cosmetic items with AI generation
 * Handles cache checking, image generation, and equipping flow
 * Requirements: 1.2, 5.1, 5.2, 5.3
 */
interface UseEquipItemReturn {
  equipItem: (itemId: Id<"cosmetic_items">) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  loadingItemId: Id<"cosmetic_items"> | null;
}

export function useEquipItem(
  dogId: Id<"dogs">,
  dogName: string
): UseEquipItemReturn {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingItemId, setLoadingItemId] =
    useState<Id<"cosmetic_items"> | null>(null);

  // Convex hooks
  const equipItemMutation = useMutation(api.mutations.equipItem);
  const generateItemImageAction = useAction(api.actions.generateItemImage);

  /**
   * Orchestrates the equip flow with AI generation
   * Moon items ALWAYS skip AI generation and use mage_bg/mage_avatar
   * Requirements: 1.1, 1.5, 3.1, 3.2, 3.4, 5.4, 5.5
   */
  const equipItem = async (itemId: Id<"cosmetic_items">) => {
    try {
      // Reset error state
      setError(null);

      // Set loading state - ItemsView will check item type and hide generating screen for moon items
      setIsLoading(true);
      setLoadingItemId(itemId);

      // Step 1: Try to equip with cache check
      // The equipItem mutation will check if it's a moon item and skip AI generation
      const result = await equipItemMutation({
        dogId,
        itemId,
      });

      // If cache was used or it's a moon item, we're done
      // Moon items ALWAYS return isMoonItem: true and never generate
      if (result.isMoonItem) {
        // Clear loading state immediately to prevent generating screen from showing
        setIsLoading(false);
        setLoadingItemId(null);
        return;
      }

      if (result.usedCache) {
        return;
      }

      // If needsGeneration is true, continue to image generation
      if (result.needsGeneration) {
        // Continue to image generation (only for non-moon items)
      } else {
        // If we got here and it's not a moon item, cache, or needs generation, something went wrong
        // But we'll continue to generation as fallback
      }

      // Step 2: No cache exists - generate image using AI (only for non-moon items)
      // Moon items NEVER reach this point - they're handled in Step 1
      // Call generateItemImage action with 30s timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              "Image generation timed out after 30 seconds. Please try again."
            )
          );
        }, 30000);
      });

      const generatePromise = generateItemImageAction({
        itemId,
        dogName,
      });

      const imageUrl = await Promise.race([generatePromise, timeoutPromise]);

      // Step 3: Equip item with generated URL
      await equipItemMutation({
        dogId,
        itemId,
        imageUrl,
      });
    } catch (err) {
      // Handle errors and update error state
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      throw err;
    } finally {
      setIsLoading(false);
      setLoadingItemId(null);
    }
  };

  return {
    equipItem,
    isLoading,
    error,
    loadingItemId,
  };
}
