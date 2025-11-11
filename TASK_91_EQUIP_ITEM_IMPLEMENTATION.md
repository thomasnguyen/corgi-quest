# Task 91: Equip Item Implementation

## Summary
Implemented the `handleEquip` function in `ItemsView.tsx` to allow users to equip cosmetic items to their dog.

## Changes Made

### 1. Updated `src/components/dog/ItemsView.tsx`
- Added `equipItemMutation` using `useMutation(api.mutations.equipItem)`
- Implemented `handleEquip` function that:
  - Sets loading state for the specific item being equipped
  - Calls the `equipItem` mutation with `dogId`, `itemId`, and `imageUrl`
  - Uses placeholder image URL for hackathon demo
  - Handles errors gracefully
  - Clears loading state when complete

### 2. Mutation Already Exists
The `equipItem` mutation was already implemented in `convex/mutations.ts` with the following features:
- Automatically unequips any previously equipped item (only one item at a time)
- Inserts new `equipped_items` record with the provided image URL
- Marks the item as seen (removes "New!" badge)
- Returns success status and item details

## How It Works

1. User clicks "Equip" button on an unlocked item in `ItemCard`
2. `ItemCard` calls `onEquip(itemId)` handler
3. `ItemsView.handleEquip` is triggered:
   - Shows loading state on the button
   - Generates placeholder image URL
   - Calls `equipItemMutation` with dog ID, item ID, and image URL
4. Convex mutation executes:
   - Removes any existing equipped item
   - Creates new equipped item record
   - Removes "New!" badge if present
5. Real-time subscription updates UI:
   - Dog portrait shows equipped item
   - "Currently Wearing" section updates
   - Item card shows "EQUIPPED" badge
   - Other users see the change instantly

## Placeholder Image
For the hackathon demo, using a simple placeholder:
```typescript
const placeholderImageUrl = `https://placehold.co/400x400/1a1a1a/f5c35f?text=${encodeURIComponent("🐕")}`;
```

In production, this would call an AI image generation service to create custom images of the dog wearing the item.

## Testing
- No TypeScript errors
- All components properly typed
- Loading states handled
- Error handling in place
- Real-time updates via Convex subscriptions

## Status
✅ Complete - Ready for testing
