# Task 93: Integrate Item Unlock on Level Up - Implementation Summary

## Overview
Implemented automatic item unlock detection when a dog levels up, with visual "New!" badges in the ITEMS tab to highlight newly unlocked items.

## Changes Made

### 1. Database Schema (`convex/schema.ts`)
- Added `newly_unlocked_items` table to track items that were recently unlocked
- Fields: `dogId`, `itemId`, `unlockedAt` (timestamp)
- Indexes: `by_dog`, `by_dog_and_item`

### 2. Mutations (`convex/mutations.ts`)

#### Updated `logActivity` mutation:
- Added logic to detect when dog levels up
- Checks all cosmetic items to see if any were just unlocked (level went from below to at/above unlock level)
- Inserts records into `newly_unlocked_items` table for each newly unlocked item
- Returns `newlyUnlockedItems` array in response with item details

#### Added `markItemAsSeen` mutation:
- Removes the "New!" badge from a newly unlocked item
- Called when user views the ITEMS tab or equips the item
- Deletes the record from `newly_unlocked_items` table

#### Updated `equipItem` mutation:
- Automatically marks item as seen when equipped
- Removes "New!" badge when item is equipped

### 3. Queries (`convex/queries.ts`)

#### Updated `getAllCosmeticItems` query:
- Added `isNew` field to each item
- Queries `newly_unlocked_items` table to check if item is newly unlocked
- Returns items with both `isUnlocked` and `isNew` status

### 4. Components

#### Updated `ItemCard.tsx`:
- Added `isNew` prop (optional, defaults to false)
- Added "New!" badge that displays when `isNew` is true
- Badge has gradient background (red to orange) with pulse animation
- Badge only shows for unlocked items that are not equipped

#### Updated `ItemsView.tsx`:
- Passes `isNew` prop from query data to ItemCard component
- "New!" badge automatically appears on newly unlocked items

### 5. Testing (`convex/test.ts`)

#### Added `testItemUnlockOnLevelUp` mutation:
- Simulates logging an activity that causes a level up
- Verifies that items are correctly marked as newly unlocked
- Returns level up details and newly unlocked items

#### Added `testGetNewlyUnlockedItems` query:
- Retrieves all newly unlocked items for a dog
- Returns full item details with unlock timestamps

## How It Works

1. **Level Up Detection**: When `logActivity` mutation is called and the dog levels up, the system checks all cosmetic items to see if any unlock at the new level.

2. **Marking as New**: For each item that was just unlocked, a record is inserted into `newly_unlocked_items` table.

3. **Displaying Badge**: When the ITEMS tab is viewed, the `getAllCosmeticItems` query includes the `isNew` status for each item. The ItemCard component displays a "New!" badge for items where `isNew` is true.

4. **Removing Badge**: The badge is automatically removed when:
   - User equips the item (handled in `equipItem` mutation)
   - User manually marks it as seen (can be called from UI if needed)

## Example Flow

1. User logs an activity that gives enough XP to level up from 7 to 8
2. System detects that "Forest Cape" unlocks at level 8
3. Record inserted into `newly_unlocked_items` table
4. User navigates to BUMI tab → ITEMS sub-tab
5. "Forest Cape" displays with animated "New!" badge
6. User taps "Equip" on Forest Cape
7. Item is equipped and "New!" badge is removed

## Visual Design

The "New!" badge:
- Gradient background: red (#ff6b6b) to orange (#ff8e53)
- White text, bold font
- Positioned at top-right of item card
- Pulse animation to draw attention
- Only shows for unlocked, unequipped items

## Testing

To test the implementation:

1. Run seed data: `await ctx.runMutation(api.seed.seedDemoData)`
2. Test item unlock: `await ctx.runMutation(api.test.testItemUnlockOnLevelUp)`
3. Check newly unlocked items: `await ctx.runQuery(api.test.testGetNewlyUnlockedItems)`
4. View ITEMS tab in UI to see "New!" badges

## Requirements Met

✅ Update logActivity mutation to check for level ups
✅ When level up detected, check if new item unlocks
✅ Show "New!" badge in ITEMS tab for newly unlocked items
✅ Image generation skipped for hackathon (images pre-created)
✅ Requirement 28 satisfied
