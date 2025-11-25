# Implementation Plan

- [x] 1. Extend Convex schema for multi-dog support
  - Add `breed` and `traits` fields to dogs table
  - Add `dogId` field and index to quests table
  - Add `targetReps` field to quests table
  - _Requirements: 7.4, 7.5_

- [x] 2. Create Convex backend functions for dog management
- [x] 2.1 Implement getHouseholdDogs query
  - Query dogs by household ID with index
  - Order by creation date descending
  - _Requirements: 2.2, 9.1_

- [x] 2.2 Implement getDogQuests query
  - Query quests by dog ID with new index
  - Return all quests for specific dog
  - _Requirements: 3.4_

- [x] 2.3 Implement parseDogDescription action
  - Call OpenAI GPT-4 with system prompt for dog parsing
  - Extract name, breed, traits, stat emphasis, and starter quest
  - Return structured JSON response
  - Handle API errors and timeouts
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [x] 2.4 Implement createDogWithStats mutation
  - Create dog record with breed and traits
  - Create four stat records (PHY, INT, IMP, SOC) with initial emphasis
  - Create starter quest linked to dog ID
  - Return new dog ID
  - _Requirements: 7.1, 7.4, 7.5_

- [ ]* 2.5 Write property test for context switching
  - **Property 8: Context switch updates all app data**
  - **Validates: Requirements 3.2, 3.3, 3.4**

- [ ]* 2.6 Write property test for active dog persistence
  - **Property 9: Active dog selection persists across sessions**
  - **Validates: Requirements 3.5**

- [x] 3. Create active dog management utilities
- [x] 3.1 Implement activeDogStorage utility functions
  - getActiveDogId(userId)
  - setActiveDogId(userId, dogId)
  - clearActiveDogId(userId)
  - _Requirements: 3.5_

- [x] 3.2 Implement useActiveDog custom hook
  - Load active dog ID from localStorage on mount
  - Provide setActiveDogId function that updates both state and localStorage
  - Handle user ID changes
  - _Requirements: 3.5, 7.1_

- [ ]* 3.3 Write property test for localStorage persistence
  - **Property 9: Active dog selection persists across sessions**
  - **Validates: Requirements 3.5**

- [x] 4. Build DogChip component
- [x] 4.1 Create DogChip component with dog name and avatar
  - Display dog name, emoji avatar (🐶), and dropdown indicator (▼)
  - Implement onClick handler to open menu
  - Style with black/white theme and text shadow
  - Ensure 44x44px minimum touch target
  - _Requirements: 1.1, 1.4_

- [x] 4.2 Add placeholder state for no dogs
  - Show "+ Add your first dog" when no dogs exist
  - Open AddDogModal directly on click
  - _Requirements: 1.2_

- [x] 4.3 Integrate DogChip into TopResourceBar
  - Position in top bar (replace or augment existing layout)
  - Wire up to useActiveDog hook
  - Handle active dog changes with smooth updates
  - _Requirements: 1.1, 1.3_

- [ ]* 4.4 Write unit tests for DogChip component
  - Test rendering with dog data
  - Test placeholder state
  - Test onClick behavior
  - Test touch target size

- [x] 5. Build DogMenu bottom sheet component
- [x] 5.1 Create DogMenu component structure
  - Implement bottom sheet modal with slide-up animation (200-300ms)
  - Add backdrop with tap-to-dismiss
  - Add swipe-down gesture handler
  - Style with black/white theme
  - _Requirements: 2.1, 2.4, 10.2_

- [x] 5.2 Implement dog list rendering
  - Query household dogs with useQuery
  - Render each dog with name and avatar
  - Mark active dog as "(current)"
  - Make each row tappable
  - _Requirements: 2.2, 2.5_

- [x] 5.3 Add "+ Add new dog" button
  - Style with primary accent color
  - Position at bottom of list
  - Wire up onClick to open AddDogModal
  - _Requirements: 2.3_

- [x] 5.4 Implement dog selection handler
  - Call setActiveDogId on dog tap
  - Close menu after selection
  - Trigger context switch
  - _Requirements: 3.1_

- [ ]* 5.5 Write unit tests for DogMenu component
  - Test dog list rendering
  - Test active dog marking
  - Test dismissal methods
  - Test add dog button

- [ ]* 5.6 Write property test for dog menu display
  - **Property 2: Dog menu displays all household dogs**
  - **Validates: Requirements 2.2, 9.1**

- [x] 6. Build VoiceInputScreen component
- [x] 6.1 Create VoiceInputScreen component
  - Display title "Add a new dog"
  - Display subtitle "Describe your dog in one sentence"
  - Display example text
  - Add large microphone button (60x60px minimum)
  - _Requirements: 4.2, 4.3, 10.5_

- [x] 6.2 Integrate Web Speech API
  - Use useWebSpeechRecognition hook (existing)
  - Start listening on microphone tap
  - Show ListeningIndicator component (reuse from training mode)
  - Stop listening after 10 seconds or on silence
  - _Requirements: 4.4, 4.5_

- [x] 6.3 Handle transcript completion
  - Call onTranscriptComplete callback with final transcript
  - Handle speech recognition errors
  - Provide retry option on error
  - _Requirements: 4.4, 4.5_

- [ ]* 6.4 Write unit tests for VoiceInputScreen
  - Test microphone button rendering
  - Test Web Speech API integration
  - Test listening indicator display
  - Test error handling

- [ ]* 6.5 Write property test for voice recording activation
  - **Property 10: Voice recording activates on microphone tap**
  - **Validates: Requirements 4.4**

- [x] 7. Build ConfirmationScreen component
- [x] 7.1 Create ConfirmationScreen component
  - Display parsed dog name (editable input)
  - Display breed (read-only)
  - Display traits as tags (read-only)
  - Display starter quest info (read-only)
  - _Requirements: 6.1, 6.2_

- [x] 7.2 Add action buttons
  - "Looks good" button (primary)
  - "Try again" button (secondary)
  - Validate name is not empty before allowing confirm
  - _Requirements: 6.3_

- [x] 7.3 Implement confirmation handler
  - Call onConfirm with edited name
  - Trigger dog creation mutation
  - Handle creation errors
  - _Requirements: 6.4_

- [x] 7.4 Implement retry handler
  - Call onRetry callback
  - Clear transcript state
  - Return to voice input screen
  - _Requirements: 6.5_

- [ ]* 7.5 Write unit tests for ConfirmationScreen
  - Test data display
  - Test name editing
  - Test validation
  - Test button actions

- [ ]* 7.6 Write property test for confirmation flow
  - **Property 16: Confirmation screen displays all parsed data**
  - **Validates: Requirements 6.1**

- [x] 8. Build AddDogModal orchestrator component
- [x] 8.1 Create AddDogModal component with state machine
  - Define modal states: voice-input, listening, processing, confirmation, creating, error
  - Implement state transitions
  - Handle modal open/close with animations
  - _Requirements: 4.1, 10.2_

- [x] 8.2 Implement voice input stage
  - Render VoiceInputScreen
  - Handle transcript completion
  - Transition to processing state
  - Show "Thinking…" indicator
  - _Requirements: 5.1_

- [x] 8.3 Implement AI parsing stage
  - Call parseDogDescription action
  - Handle parsing success → transition to confirmation
  - Handle parsing errors → show error message with retry
  - Enforce 3-second timeout
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 10.1_

- [x] 8.4 Implement confirmation stage
  - Render ConfirmationScreen with parsed data
  - Handle user confirmation → call createDogWithStats mutation
  - Handle retry → return to voice input
  - _Requirements: 6.1, 6.4, 6.5_

- [x] 8.5 Implement dog creation stage
  - Call createDogWithStats mutation
  - Set new dog as active dog
  - Close modal on success
  - Call onSuccess callback with new dog ID
  - _Requirements: 7.1, 7.2_

- [ ]* 8.6 Write integration test for full onboarding flow
  - Mock Web Speech API
  - Mock OpenAI responses
  - Test complete flow from voice input to dog creation
  - Verify all state transitions

- [ ]* 8.7 Write property test for AI parsing
  - **Property 12: AI parser extracts required dog attributes**
  - **Validates: Requirements 5.2**

- [ ]* 8.8 Write property test for new dog initialization
  - **Property 21: New dog initializes with correct stat values**
  - **Validates: Requirements 7.4**

- [x] 9. Implement post-creation UI updates
- [x] 9.1 Add toast notification on dog creation
  - Show toast with format "[DogName] added!"
  - Use success styling
  - Auto-dismiss after 3 seconds
  - _Requirements: 7.3_

- [x] 9.2 Create QuestBanner component
  - Display quest name and rep count
  - Position at top of screen (non-intrusive)
  - Auto-dismiss after 4 seconds
  - Make tappable to navigate to quest detail
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 9.3 Integrate QuestBanner into Layout
  - Show banner when new dog is created with quest
  - Handle tap navigation to quest detail screen
  - Ensure banner doesn't block primary UI
  - _Requirements: 8.1, 8.3, 8.4_

- [ ]* 9.4 Write unit tests for QuestBanner
  - Test rendering with quest data
  - Test auto-dismiss timing
  - Test tap navigation

- [ ]* 9.5 Write property test for quest banner behavior
  - **Property 23: Quest banner displays and auto-dismisses**
  - **Validates: Requirements 8.1, 8.2**

- [x] 10. Update app context switching logic
- [x] 10.1 Update getDogProfile query to use active dog
  - Modify query to accept dogId parameter
  - Update all usages to pass active dog ID
  - _Requirements: 3.2_

- [x] 10.2 Update getActivityFeed query to filter by dog
  - Modify query to filter activities by dogId
  - Update all usages to pass active dog ID
  - _Requirements: 3.3_

- [x] 10.3 Update getDailyGoals query to filter by dog
  - Modify query to filter goals by dogId
  - Update all usages to pass active dog ID
  - _Requirements: 3.2_

- [x] 10.4 Update getStreak query to filter by dog
  - Modify query to filter streak by dogId
  - Update all usages to pass active dog ID
  - _Requirements: 3.2_

- [x] 10.5 Update all components to use active dog from useActiveDog hook
  - Replace hardcoded firstDog queries with active dog
  - Update Overview, Quests, Activity, Training Mode screens
  - Ensure all data updates when active dog changes
  - _Requirements: 3.2, 3.3, 3.4_

- [ ]* 10.6 Write integration test for context switching
  - Create multiple dogs
  - Switch between dogs
  - Verify all displayed data updates correctly

- [ ]* 10.7 Write property test for context switching
  - **Property 8: Context switch updates all app data**
  - **Validates: Requirements 3.2, 3.3, 3.4**

- [x] 11. Implement real-time household sync
- [x] 11.1 Verify Convex subscriptions work across users
  - Test that new dogs appear in real-time for all household members
  - Test that dog updates sync in real-time
  - _Requirements: 9.2, 9.4_

- [x] 11.2 Ensure active dog selection is user-specific
  - Verify localStorage keys are scoped to user ID
  - Test that one user's dog switch doesn't affect other users
  - _Requirements: 9.3_

- [ ]* 11.3 Write integration test for real-time sync
  - Mock multiple users in same household
  - Create dog as user A
  - Verify user B sees new dog
  - Verify active dog selections remain independent

- [ ]* 11.4 Write property test for household sync
  - **Property 25: Household dog data syncs in real-time**
  - **Validates: Requirements 9.2, 9.4**

- [x] 12. Add error handling and edge cases
- [x] 12.1 Handle voice recognition errors
  - Display error message for microphone permission issues
  - Provide retry option
  - Handle no speech detected timeout
  - _Requirements: 5.5_

- [x] 12.2 Handle AI parsing errors
  - Display error message for API failures
  - Preserve transcript for retry
  - Handle incomplete data extraction
  - Use placeholder name if AI can't extract name
  - _Requirements: 5.5_

- [x] 12.3 Handle dog creation errors
  - Display error message for mutation failures
  - Provide retry option
  - Log errors for debugging
  - _Requirements: 6.4_

- [x] 12.4 Handle invalid active dog ID
  - Fall back to first dog if stored ID is invalid
  - Clear invalid ID from localStorage
  - Handle no dogs in household case
  - _Requirements: 1.2_

- [ ]* 12.5 Write unit tests for error handling
  - Test voice recognition errors
  - Test AI parsing errors
  - Test dog creation errors
  - Test invalid active dog ID

- [x] 13. Optimize performance for mobile
- [x] 13.1 Implement code splitting for AddDogModal
  - Use React.lazy to lazy load modal component
  - Add loading fallback
  - _Requirements: 10.1_

- [x] 13.2 Optimize animations for 60fps
  - Use CSS transforms for smooth animations
  - Add will-change hints
  - Test on mobile devices
  - _Requirements: 10.2, 10.3_

- [x] 13.3 Implement responsive layouts
  - Test on 375px wide screens
  - Ensure no horizontal scrolling
  - Verify touch targets meet minimum sizes
  - _Requirements: 10.4, 10.5_

- [x] 13.4 Add debouncing for rapid interactions
  - Debounce dog switches
  - Debounce transcript updates
  - Prevent animation jank
  - _Requirements: 10.3_

- [ ]* 13.5 Write performance tests
  - Test animation frame rates
  - Test AI parsing timeout
  - Test modal open/close timing

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
