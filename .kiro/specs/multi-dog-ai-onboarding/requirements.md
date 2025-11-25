# Requirements Document

## Introduction

This feature enables users to manage multiple dogs within a household and onboard new dogs using AI-powered voice input. The system allows seamless switching between dogs, with all app context (stats, quests, activity feed) updating to reflect the currently selected dog. The AI onboarding flow parses natural language descriptions to create personalized dog profiles with initial stats and tailored starter quests.

## Glossary

- **Dog Menu**: A bottom sheet UI component that displays all dogs in the household and provides access to add new dogs
- **Dog Chip**: A tappable UI element in the top bar showing the currently selected dog's name and avatar
- **Active Dog**: The currently selected dog whose data is displayed throughout the application
- **AI Onboarding**: The voice-powered flow for creating a new dog profile from a single natural language sentence
- **Household**: A shared workspace where multiple users (partners) can train the same dogs
- **Starter Quest**: A personalized first training quest automatically generated based on the dog's description
- **Dog Profile**: A complete dog record including name, breed, personality traits, initial stats, and associated quests
- **Voice Parser**: The AI system that extracts structured data from natural language dog descriptions
- **Context Switch**: The process of updating all app data to reflect a different active dog

## Requirements

### Requirement 1

**User Story:** As a dog owner, I want to see which dog is currently active, so that I know whose training data I am viewing.

#### Acceptance Criteria

1. WHEN the main PWA screen loads THEN the System SHALL display a dog chip in the top bar showing the active dog's name and avatar with a dropdown indicator
2. WHEN no dogs exist in the household THEN the System SHALL display a placeholder chip prompting the user to add their first dog
3. WHEN the active dog changes THEN the System SHALL update the dog chip to reflect the new active dog's name and avatar within 200 milliseconds
4. WHEN the dog chip is displayed THEN the System SHALL use a visually distinct style with adequate touch target size of at least 44x44 pixels

### Requirement 2

**User Story:** As a dog owner, I want to access a menu of all my household's dogs, so that I can switch between them or add new ones.

#### Acceptance Criteria

1. WHEN a user taps the dog chip THEN the System SHALL open a bottom sheet titled "Dogs" within 100 milliseconds
2. WHEN the dog menu opens THEN the System SHALL display all dogs in the household with the active dog marked as "current"
3. WHEN the dog menu opens THEN the System SHALL display a prominent "+ Add new dog" button with primary accent styling
4. WHEN the dog menu is open THEN the System SHALL allow the user to dismiss it by tapping outside the sheet or swiping down
5. WHEN the dog menu displays the dog list THEN the System SHALL show each dog's name and avatar in a tappable row

### Requirement 3

**User Story:** As a dog owner, I want to switch between my household's dogs, so that I can view and manage training for different dogs.

#### Acceptance Criteria

1. WHEN a user taps a dog in the dog menu THEN the System SHALL set that dog as the active dog and close the menu
2. WHEN the active dog changes THEN the System SHALL update all stats, XP, level, daily goals, and streaks to reflect the newly selected dog
3. WHEN the active dog changes THEN the System SHALL update the activity feed to show only activities logged for the newly selected dog
4. WHEN the active dog changes THEN the System SHALL update the quests list to show only quests assigned to the newly selected dog
5. WHEN the active dog changes THEN the System SHALL persist the selection so the same dog remains active on subsequent app launches

### Requirement 4

**User Story:** As a dog owner, I want to add a new dog using voice input, so that I can quickly onboard without typing on mobile.

#### Acceptance Criteria

1. WHEN a user taps "+ Add new dog" in the dog menu THEN the System SHALL open a full-screen modal titled "Add a new dog"
2. WHEN the add dog modal opens THEN the System SHALL display a subtitle "Describe your dog in one sentence" and a large microphone button
3. WHEN the add dog modal opens THEN the System SHALL display example text "Example: Luna, golden retriever, friendly but distractible"
4. WHEN a user taps the microphone button THEN the System SHALL activate voice recording and display a "Listening…" indicator
5. WHEN voice recording is active THEN the System SHALL use the Web Speech API to capture and transcribe the user's speech in real-time

### Requirement 5

**User Story:** As a dog owner, I want the AI to understand my dog's description, so that I don't have to fill out forms manually.

#### Acceptance Criteria

1. WHEN the user finishes speaking THEN the System SHALL display a "Thinking…" indicator and send the transcription to the AI parser
2. WHEN the AI parser receives a dog description THEN the System SHALL extract breed, personality traits, and suggested name from the input
3. WHEN the AI parser completes THEN the System SHALL infer initial stat emphasis based on personality traits mentioned in the description
4. WHEN the AI parser completes THEN the System SHALL generate a personalized starter quest targeting the dog's primary training need
5. WHEN the AI parser fails to extract required information THEN the System SHALL prompt the user to try again with a more detailed description

### Requirement 6

**User Story:** As a dog owner, I want to confirm the AI-parsed dog information, so that I can correct any mistakes before saving.

#### Acceptance Criteria

1. WHEN the AI parser completes successfully THEN the System SHALL display a confirmation screen showing the parsed name, breed, traits, and starter quest
2. WHEN the confirmation screen displays THEN the System SHALL allow the user to edit the dog's name if voice recognition was inaccurate
3. WHEN the confirmation screen displays THEN the System SHALL show a "Looks good" button and a "Try again" button
4. WHEN the user taps "Looks good" THEN the System SHALL create the dog profile and close the onboarding modal
5. WHEN the user taps "Try again" THEN the System SHALL return to the voice input screen and clear the previous transcription

### Requirement 7

**User Story:** As a dog owner, I want the newly created dog to become active immediately, so that I can start training right away.

#### Acceptance Criteria

1. WHEN a new dog is successfully created THEN the System SHALL set the new dog as the active dog
2. WHEN a new dog is successfully created THEN the System SHALL update the dog chip to display the new dog's name and avatar
3. WHEN a new dog is successfully created THEN the System SHALL display a toast notification "Luna added!" with the dog's name
4. WHEN a new dog is successfully created THEN the System SHALL create initial dog stats at level 1 with XP values of 0
5. WHEN a new dog is successfully created THEN the System SHALL add the personalized starter quest to the dog's quest list

### Requirement 8

**User Story:** As a dog owner, I want to see a subtle notification about the new quest, so that I know what to do next.

#### Acceptance Criteria

1. WHEN a new dog is created with a starter quest THEN the System SHALL display a small banner showing "New quest added for Luna: Focused Walk (5 reps)"
2. WHEN the new quest banner is displayed THEN the System SHALL auto-dismiss it after 4 seconds
3. WHEN the new quest banner is displayed THEN the System SHALL allow the user to tap it to navigate to the quest detail screen
4. WHEN the new quest banner is displayed THEN the System SHALL use non-intrusive styling that does not block primary UI elements

### Requirement 9

**User Story:** As a household partner, I want to see all dogs added by anyone in the household, so that we can collaborate on training.

#### Acceptance Criteria

1. WHEN a user views the dog menu THEN the System SHALL display all dogs associated with the household regardless of who created them
2. WHEN a new dog is added by one partner THEN the System SHALL sync the new dog to all other household members in real-time via Convex
3. WHEN a partner switches the active dog THEN the System SHALL not affect the active dog selection for other household members
4. WHEN a dog's data is updated THEN the System SHALL sync changes to all household members viewing that dog in real-time

### Requirement 10

**User Story:** As a dog owner, I want the onboarding flow to be fast and mobile-friendly, so that I can complete it during a demo or real-world scenario.

#### Acceptance Criteria

1. WHEN the user completes the voice input THEN the System SHALL process the AI parsing and display results within 3 seconds
2. WHEN any modal or bottom sheet opens THEN the System SHALL use smooth animations with a duration of 200-300 milliseconds
3. WHEN the user interacts with the onboarding flow THEN the System SHALL provide immediate visual feedback for all touch interactions
4. WHEN the onboarding flow is displayed on mobile THEN the System SHALL use responsive layouts that work on screens as small as 375px wide
5. WHEN the microphone button is displayed THEN the System SHALL use a touch target of at least 60x60 pixels for easy tapping
