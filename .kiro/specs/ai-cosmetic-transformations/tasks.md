# Implementation Plan

- [x] 1. Update database schema and seed data
  - Add `aiPrompt` optional field to cosmetic_items table in convex/schema.ts
  - Update seed data to include aiPrompt values for existing cosmetic items
  - Run migration to apply schema changes
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. Create OpenAI DALL-E integration action
  - [x] 2.1 Set up OpenAI API configuration
    - Add OPENAI_API_KEY to Convex environment variables
    - Install openai npm package if not already present
    - Create convex/actions.ts file if it doesn't exist
    - _Requirements: 1.1, 5.1_
  
  - [x] 2.2 Implement generateItemImage action
    - Create action that accepts itemId and dogName
    - Query cosmetic_items to get aiPrompt field
    - Construct DALL-E prompt with fallback logic for missing aiPrompt
    - Call OpenAI DALL-E API with 30-second timeout
    - Return generated image URL on success
    - Throw descriptive errors on failure
    - _Requirements: 1.1, 4.4, 4.5, 5.5_

- [x] 3. Implement image caching logic in mutations
  - [x] 3.1 Create checkCachedImage query
    - Query equipped_items history for dogId + itemId combination
    - Return cached generatedImageUrl if found
    - Return null if no cache exists
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 3.2 Update equipItem mutation for AI integration
    - Check for cached image before equipping
    - If cache exists, use cached URL immediately
    - If no cache, accept imageUrl parameter from frontend
    - Update equipped_items table with image URL
    - Mark item as seen (remove "New!" badge)
    - _Requirements: 1.3, 2.1, 2.2, 3.1, 3.2_

- [x] 4. Create frontend hook for equip with AI generation
  - [x] 4.1 Create useEquipItem hook
    - Create src/hooks/useEquipItem.ts file
    - Implement loading state management
    - Implement error state management
    - Create equipItem function that orchestrates the flow
    - _Requirements: 1.2, 5.1, 5.2, 5.3_
  
  - [x] 4.2 Implement equip flow logic
    - Check for cached image using checkCachedImage query
    - If cache hit, call equipItem mutation immediately
    - If cache miss, call generateItemImage action
    - Wait for image generation with 30s timeout
    - Call equipItem mutation with generated URL
    - Handle errors and update error state
    - _Requirements: 1.1, 1.5, 3.1, 3.2, 3.4, 5.4, 5.5_

- [x] 5. Update ItemsView component for AI generation
  - Replace handleEquip with useEquipItem hook
  - Pass loading state to ItemCard components
  - Display error message if generation fails
  - Add retry functionality on error
  - Update portrait section to show generated images
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 5.3, 5.4_

- [x] 6. Update ItemCard component for loading states
  - Accept isLoading prop from parent
  - Disable "Equip" button during generation
  - Show "Generating..." text when isLoading is true
  - Display loading spinner on item card
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 7. Update Overview screen to display generated images
  - [x] 7.1 Update background image logic
    - Modify backgroundImage calculation to use equippedItem.generatedImageUrl
    - Add fallback to default background if no item equipped
    - Update preload logic for generated images
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 7.2 Update avatar display logic
    - Use equippedItem.generatedImageUrl for avatar
    - Add fallback to default avatar if no item equipped
    - Ensure real-time sync updates avatar immediately
    - _Requirements: 6.1, 6.4, 6.5_

- [x] 8. Implement error handling and fallbacks
  - Add error boundary for AI generation failures
  - Implement timeout handling (30 seconds)
  - Add fallback prompt logic for missing aiPrompt
  - Display user-friendly error messages
  - Add retry button for failed generations
  - Implement fallback to default images on error
  - _Requirements: 1.5, 3.4, 4.5, 5.5_

- [x] 9. Add loading and success feedback
  - Implement loading spinner during generation
  - Add progress indicator if possible
  - Show success message when image is generated
  - Add smooth transition animation for new images
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 10. Test end-to-end flow
  - Test equipping item with valid aiPrompt
  - Test cache hit scenario (re-equipping same item)
  - Test error scenarios (invalid API key, timeout, network failure)
  - Test real-time sync between devices
  - Verify images persist after page reload
  - Test fallback logic for missing aiPrompt
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_
