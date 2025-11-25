# Design Document

## Overview

This feature integrates OpenAI's DALL-E API to generate custom dog avatar and background images when users equip cosmetic items. The system will cache generated images to avoid redundant API calls, provide loading feedback during generation, and gracefully handle failures. The generated images will be displayed in both the Items view (avatar) and Overview screen (avatar + background).

## Architecture

### High-Level Flow

1. User clicks "Equip" button on an unlocked cosmetic item
2. Frontend checks if a cached image exists for this item
3. If no cache exists:
   - Display loading state
   - Call Convex action to generate image via DALL-E
   - Save generated image URL to database
4. Update equipped_items table with image URL
5. Display generated image in Items view and Overview screen
6. Real-time sync ensures all connected devices see the update

### Technology Stack

- **Frontend**: React with TanStack Start
- **Backend**: Convex (real-time database + actions)
- **AI Service**: OpenAI DALL-E API (via Convex actions)
- **Image Storage**: External URLs (returned by DALL-E)
- **Caching**: Database-backed (equipped_items table)

## Components and Interfaces

### 1. Database Schema Changes

**cosmetic_items table** - Add new field:
```typescript
{
  // ... existing fields
  aiPrompt: v.optional(v.string()), // DALL-E prompt for image generation
}
```

**equipped_items table** - Already has the necessary field:
```typescript
{
  dogId: v.id("dogs"),
  itemId: v.id("cosmetic_items"),
  generatedImageUrl: v.string(), // Stores the DALL-E generated image URL
  equippedAt: v.number(),
}
```

### 2. Convex Action: generateItemImage

**Purpose**: Call OpenAI DALL-E API to generate an image based on item prompt

**Location**: `convex/actions.ts`

**Signature**:
```typescript
export const generateItemImage = action({
  args: {
    itemId: v.id("cosmetic_items"),
    dogName: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Get item details including aiPrompt
    // 2. Construct DALL-E prompt
    // 3. Call OpenAI DALL-E API
    // 4. Return generated image URL
  }
});
```

**Implementation Details**:
- Use OpenAI API key from environment variables
- Call DALL-E 3 API with the item's aiPrompt
- Include dog name in prompt for personalization
- Set size to 1024x1024 for quality
- Set quality to "standard" for faster generation
- Timeout after 30 seconds
- Return image URL on success
- Throw error on failure

**Prompt Construction**:
```
Base template: "{aiPrompt}, digital art, centered composition, clean background"
Example: "fire warrior corgi, digital art, centered composition, clean background"
```

### 3. Convex Mutation: equipItemWithAI

**Purpose**: Equip an item and trigger AI generation if needed

**Location**: `convex/mutations.ts`

**Signature**:
```typescript
export const equipItemWithAI = mutation({
  args: {
    dogId: v.id("dogs"),
    itemId: v.id("cosmetic_items"),
  },
  handler: async (ctx, args) => {
    // 1. Check if item was previously equipped (cache exists)
    // 2. If cache exists, reuse the image URL
    // 3. If no cache, return signal to trigger AI generation
    // 4. Update equipped_items table
  }
});
```

**Cache Logic**:
- Query equipped_items history for this dogId + itemId combination
- If found, return cached generatedImageUrl
- If not found, return `needsGeneration: true`

### 4. Frontend Hook: useEquipItem

**Purpose**: Manage the equip flow with AI generation

**Location**: `src/hooks/useEquipItem.ts`

**Interface**:
```typescript
interface UseEquipItemReturn {
  equipItem: (itemId: Id<"cosmetic_items">) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useEquipItem(dogId: Id<"dogs">): UseEquipItemReturn
```

**Flow**:
1. Set loading state
2. Call `equipItemWithAI` mutation
3. If `needsGeneration: true`:
   - Call `generateItemImage` action
   - Wait for image URL (with 30s timeout)
   - Call `updateEquippedItemImage` mutation to save URL
4. If cache hit, immediately update UI
5. Handle errors and set error state
6. Clear loading state

### 5. Component Updates

**ItemsView.tsx**:
- Replace `handleEquip` with `useEquipItem` hook
- Display loading spinner during AI generation
- Show error message if generation fails
- Display generated image in portrait section

**index.tsx (Overview)**:
- Update background logic to use `equippedItem.generatedImageUrl`
- Fallback to default background if no item equipped
- Preload generated images for performance

**ItemCard.tsx**:
- Pass loading state from parent
- Disable "Equip" button during generation
- Show "Generating..." text during loading

## Data Models

### CosmeticItem (Extended)
```typescript
{
  _id: Id<"cosmetic_items">,
  name: string,
  description: string,
  unlockLevel: number,
  itemType: string,
  icon: string,
  aiPrompt?: string, // NEW: DALL-E prompt
  createdAt: number,
}
```

### EquippedItem (Existing)
```typescript
{
  _id: Id<"equipped_items">,
  dogId: Id<"dogs">,
  itemId: Id<"cosmetic_items">,
  generatedImageUrl: string, // DALL-E generated URL
  equippedAt: number,
}
```

### API Response Types

**DALL-E API Response**:
```typescript
{
  created: number,
  data: [
    {
      url: string, // Generated image URL (expires after 1 hour)
      revised_prompt?: string,
    }
  ]
}
```

**Note**: DALL-E URLs expire after 1 hour. For production, we would need to:
1. Download the image
2. Upload to permanent storage (e.g., Convex file storage, S3)
3. Store permanent URL in database

For this implementation, we'll use the temporary URLs and note this limitation.

## Error Handling

### Error Scenarios

1. **OpenAI API Failure**
   - Cause: API key invalid, rate limit, service down
   - Handling: Display error message, allow retry, fallback to default image
   - User Message: "Failed to generate image. Please try again."

2. **Timeout (30 seconds)**
   - Cause: DALL-E generation takes too long
   - Handling: Cancel request, show timeout message
   - User Message: "Image generation timed out. Please try again."

3. **Network Failure**
   - Cause: No internet connection
   - Handling: Catch network error, show offline message
   - User Message: "No internet connection. Please check your network."

4. **Invalid Prompt**
   - Cause: Item missing aiPrompt field
   - Handling: Use fallback prompt based on item name
   - Fallback: `"{itemName} themed corgi, digital art"`

5. **Image URL Expired**
   - Cause: DALL-E URLs expire after 1 hour
   - Handling: Regenerate image if URL fails to load
   - User Message: "Image expired. Regenerating..."

### Error Recovery

- **Retry Logic**: Allow users to manually retry by clicking "Equip" again
- **Fallback Images**: Use default avatar/background if generation fails
- **Error Logging**: Log errors to console for debugging
- **User Feedback**: Clear error messages with actionable next steps

## Testing Strategy

### Unit Tests (Optional)

- Test prompt construction logic
- Test cache hit/miss scenarios
- Test error handling for various failure modes

### Integration Tests (Optional)

- Test full equip flow with mocked DALL-E API
- Test real-time sync between devices
- Test loading states and transitions

### Manual Testing (Required)

1. **Happy Path**:
   - Equip item with valid aiPrompt
   - Verify loading state appears
   - Verify generated image displays in Items view
   - Verify generated image displays in Overview screen
   - Verify image persists after reload

2. **Cache Hit**:
   - Equip item that was previously equipped
   - Verify no loading state (instant display)
   - Verify same image is reused

3. **Error Scenarios**:
   - Test with invalid API key (expect error message)
   - Test with network disconnected (expect offline message)
   - Test with missing aiPrompt (expect fallback prompt)

4. **Real-time Sync**:
   - Open app on two devices
   - Equip item on device 1
   - Verify device 2 sees the update immediately

5. **Performance**:
   - Measure time from click to image display
   - Verify preloading works for Overview screen
   - Test with slow network connection

### Test Data

Create test cosmetic items with various prompts:
```typescript
[
  {
    name: "Fire Warrior",
    aiPrompt: "fire warrior corgi with flames, epic fantasy art",
    itemType: "fire",
  },
  {
    name: "Water Mage",
    aiPrompt: "water mage corgi with flowing water magic, mystical art",
    itemType: "water",
  },
  {
    name: "Earth Guardian",
    aiPrompt: "earth guardian corgi with stone armor, nature art",
    itemType: "ground",
  },
]
```

## Implementation Phases

### Phase 1: Database & Backend (Core)
- Add `aiPrompt` field to cosmetic_items schema
- Create `generateItemImage` action
- Update `equipItem` mutation to support caching
- Add environment variable for OpenAI API key

### Phase 2: Frontend Integration (Core)
- Create `useEquipItem` hook
- Update ItemsView to use new hook
- Add loading states to ItemCard
- Update Overview screen to use generated images

### Phase 3: Error Handling & Polish (Core)
- Implement timeout logic
- Add error messages and retry functionality
- Add fallback images
- Test all error scenarios

### Phase 4: Optimization (Optional)
- Implement image download and permanent storage
- Add image compression
- Optimize preloading strategy
- Add analytics for generation success rate

## Security Considerations

1. **API Key Protection**:
   - Store OpenAI API key in Convex environment variables
   - Never expose API key to frontend
   - Use Convex actions (server-side) for API calls

2. **Rate Limiting**:
   - Implement rate limiting to prevent abuse
   - Limit to 1 generation per item per dog
   - Cache aggressively to reduce API calls

3. **Input Validation**:
   - Validate itemId exists and is unlocked
   - Sanitize prompts to prevent injection
   - Limit prompt length to prevent abuse

4. **Cost Management**:
   - Monitor OpenAI API usage
   - Set budget alerts
   - Consider daily/monthly limits per user

## Performance Considerations

1. **Image Preloading**:
   - Preload generated images on Overview screen
   - Use `<link rel="preload">` for critical images
   - Implement lazy loading for item grid

2. **Caching Strategy**:
   - Cache generated images indefinitely in database
   - Use browser cache for image assets
   - Implement stale-while-revalidate for queries

3. **Loading States**:
   - Show skeleton loaders during generation
   - Provide progress feedback (if possible)
   - Allow users to navigate away during generation

4. **Real-time Sync**:
   - Leverage Convex subscriptions for instant updates
   - Minimize query overhead with selective subscriptions
   - Use optimistic updates where appropriate

## Future Enhancements

1. **Permanent Image Storage**:
   - Download DALL-E images to Convex file storage
   - Implement CDN for faster image delivery
   - Add image optimization pipeline

2. **Advanced Prompts**:
   - Allow users to customize prompts
   - Add prompt templates and variations
   - Implement prompt history and favorites

3. **Image Variations**:
   - Generate multiple variations per item
   - Allow users to choose their favorite
   - Implement A/B testing for prompts

4. **Social Features**:
   - Share generated images with other users
   - Gallery of community-generated images
   - Voting system for best images

5. **Animation**:
   - Animate transition between images
   - Add particle effects during generation
   - Implement smooth fade-in for new images
