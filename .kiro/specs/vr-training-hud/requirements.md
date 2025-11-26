# Requirements Document

## Introduction

The VR Training HUD is a visionOS companion experience that transforms real-world dog training into an immersive training environment with clean Apple-style design. Users can view live stats, run AI-guided training sessions, and experience a streamlined head-anchored UI that follows their gaze while watching real-time updates sync between VR and the web app via Convex.

## Glossary

- **VR Training Room**: An immersive visionOS environment with clean, minimal design and soft ambient lighting
- **Head-Anchored UI**: UI panels that follow the user's head position and gaze, always visible without turning
- **Stat Orbs**: Four circular progress rings displaying PHY, INT, IMP, and SOC stats with XP and level
- **Leave It Practice**: The demo training activity focused on impulse control where the user marks successful "leave it" commands (5 reps = goal)
- **View States**: Four distinct UI modes (minimal, stats, training, summary) that control which panels are visible
- **Quick Actions**: Clean action bar with START TRAINING and VIEW STATS buttons using Apple design language
- **Session Panel**: Left-side panel showing active "Leave It" training session with rep counter (X/5), progress bar, tips, and action buttons
- **Stats Screen**: Full-screen overlay showing detailed statistics, goals, and activities with Apple-style design
- **XP Notifications**: Floating pop-ups that appear when XP is gained, showing stat type and amount with clean design
- **Convex Backend**: Real-time database system that syncs data between VR app and web app via polling (3-second intervals)
- **Rep**: A single successful "leave it" command where the dog resists temptation for 3+ seconds
- **VisionOS App**: The Swift/SwiftUI application running on Apple Vision Pro
- **Web App**: The existing TanStack Start + React application

## Requirements

### Requirement 1

**User Story:** As a dog trainer, I want to enter an immersive VR training environment with clean Apple design, so that I can train in a focused, distraction-free space.

#### Acceptance Criteria

1. WHEN the VisionOS App launches THEN the system SHALL display a minimal environment with soft neutral lighting and clean surfaces
2. WHEN the room loads THEN the system SHALL display ambient lighting that creates a calm, focused atmosphere
3. WHEN the environment renders THEN the system SHALL include a simple circular platform in the center
4. WHEN the environment renders THEN the system SHALL maintain 30-60 fps performance
5. WHEN the user moves their head THEN the system SHALL keep UI panels anchored to head position for constant visibility

### Requirement 2

**User Story:** As a dog trainer, I want to see head-anchored UI panels that follow my gaze, so that I can monitor progress without turning my head or losing focus.

#### Acceptance Criteria

1. WHEN the VR Training Room loads in minimal view THEN the system SHALL display dog info panel at top center, streak display below it (if streak > 0), and quick actions at bottom center
2. WHEN displaying the dog info panel THEN the system SHALL show dog name and level in clean rounded font with capsule shape and ultraThinMaterial background
3. WHEN displaying the streak THEN the system SHALL show fire emoji, day count, and encouragement message with clean capsule design
4. WHEN displaying quick actions THEN the system SHALL show START TRAINING and VIEW STATS buttons with clean Apple-style design using SF Symbols and subtle gradients
5. WHEN the user moves their head THEN the system SHALL keep all panels anchored to head position at fixed offsets

### Requirement 3

**User Story:** As a dog trainer, I want XP notifications to float up when I gain XP, so that I receive immediate visual feedback during training sessions.

#### Acceptance Criteria

1. WHEN XP increases for any stat THEN the system SHALL display a floating XP notification in the upper right showing "+[amount] [stat] XP" with stat-specific color
2. WHEN an XP notification appears THEN the system SHALL use clean Apple design with thin material background, subtle colored accent, and SF Symbol bolt icon
3. WHEN an XP notification is displayed THEN the system SHALL automatically remove it after 3 seconds with fade-out animation
4. WHEN multiple stats gain XP simultaneously THEN the system SHALL stack notifications vertically without overlap
5. WHILE animations play THEN the system SHALL maintain 30-60 fps performance

### Requirement 4

**User Story:** As a dog trainer, I want to start a "Leave It" training session with the START TRAINING button, so that I can practice impulse control with my dog in VR.

#### Acceptance Criteria

1. WHEN the user clicks START TRAINING in minimal view THEN the system SHALL start a "Leave It Practice" session and transition to training view state
2. WHEN the "Leave It" session activates THEN the system SHALL display a session panel on the left side showing "Leave It Practice" as activity name, "5 successful leave-its" as goal, elapsed timer, rep counter (0/5), training tips, and action buttons
3. WHEN the session panel displays THEN the system SHALL show "🎯 ACTIVE SESSION" header in clean Apple design with system font
4. WHEN the session panel displays THEN the system SHALL show rep counter in large rounded font (48pt) with format "X / 5" and a horizontal progress bar below it
5. WHEN training view is active THEN the system SHALL hide quick actions panel and show only dog info, streak (if > 0), and session panel

### Requirement 5

**User Story:** As a dog trainer, I want to mark successful "leave it" reps during training, so that I can track my dog's impulse control progress and receive encouragement.

#### Acceptance Criteria

1. WHEN the user clicks MARK REP button during an active "Leave It" session THEN the system SHALL increment the rep counter by one with spring animation
2. WHEN a rep is marked THEN the system SHALL display the updated count in the format "X / 5" and update the progress bar to show X/5 completion
3. WHEN a rep is marked THEN the system SHALL display a micro-suggestion below the rep counter (e.g., "Great restraint! Keep going!" or "Excellent impulse control!")
4. WHEN the 5th rep is marked THEN the system SHALL change rep counter color to green, show "🎉 GOAL COMPLETE!" label, and display "Amazing! You can keep going for bonus XP!" suggestion
5. WHEN marking reps THEN the system SHALL debounce rapid clicks with 500ms minimum interval to prevent accidental double-marks

### Requirement 6

**User Story:** As a dog trainer, I want to end "Leave It" training sessions and see a summary, so that I can review my dog's impulse control progress and XP earned.

#### Acceptance Criteria

1. WHEN the user clicks END SESSION button THEN the system SHALL transition to summary view state and display the session summary panel
2. WHEN the summary panel displays THEN the system SHALL show "🎉 TRAINING COMPLETE! 🎉" header, "Leave It Practice" as activity name, session duration, reps completed (e.g., "5/5" or "7/5" for bonus), and XP breakdown showing IMP (primary) and PHY (secondary) gains
3. WHEN displaying XP breakdown for "Leave It" THEN the system SHALL show IMP stat gaining 30 XP and PHY stat gaining 10 XP with colored badges (purple for IMP, red for PHY) and calculate total 40 XP earned
4. WHEN the summary displays THEN the system SHALL show a Done button to return to minimal view
5. WHEN the user clicks Done THEN the system SHALL transition back to minimal view with updated IMP and PHY stats visible and XP notifications appearing

### Requirement 7

**User Story:** As a dog trainer, I want the VR app to sync with the web app via polling, so that my partner and I see the same training data.

#### Acceptance Criteria

1. WHEN the VisionOS App launches THEN the system SHALL fetch current dog status from the Convex backend via NetworkService
2. WHEN the app appears THEN the system SHALL start polling the backend every 3 seconds for updates
3. WHEN polling detects changes THEN the system SHALL update the VR dashboard with new stats, goals, activities, and weekly XP data
4. WHEN the app disappears THEN the system SHALL stop polling to conserve resources
5. WHEN XP changes are detected THEN the system SHALL trigger XP notification animations for each stat that gained XP

### Requirement 8

**User Story:** As a dog trainer, I want to view detailed stats in a full-screen overlay, so that I can review all my training data without leaving VR.

#### Acceptance Criteria

1. WHEN the user clicks VIEW STATS button THEN the system SHALL transition to stats view state and display the stats screen overlay
2. WHEN the stats screen displays THEN the system SHALL show all four stats with circular progress rings, weekly XP chart, today's goals with progress bars, and recent activities (last 2)
3. WHEN displaying the stats screen THEN the system SHALL use Apple-style design with clean typography, thin material backgrounds, and smooth animations
4. WHEN the stats screen appears THEN the system SHALL animate in with scale and opacity transition
5. WHEN the user clicks the X button THEN the system SHALL close the stats screen and return to minimal view

### Requirement 9

**User Story:** As a developer, I want a NetworkService that handles API communication, so that the VisionOS app can fetch and submit training data.

#### Acceptance Criteria

1. WHEN the VR app calls fetchVRStatus THEN the system SHALL return a VRDogStatus model containing dog name, level, all four stats, today's goals, streak, recent activities, and weekly XP totals
2. WHEN the VR app calls submitVoiceLog THEN the system SHALL send the text and optional session context to the backend and return a VoiceLogResponse with success status and XP awarded
3. WHEN API requests fail THEN the system SHALL throw NetworkError with appropriate error types (timeout, connectionFailed, serverError, clientError)
4. WHEN the TrainingRoomViewModel polls THEN the system SHALL call fetchVRStatus every 3 seconds and update published properties
5. WHEN voice logs are submitted successfully THEN the system SHALL automatically refresh data to show the new activity

### Requirement 10

**User Story:** As a product demonstrator, I want to capture a compelling 15-25 second "Leave It" training demo clip, so that judges can see the VR feature's clean Apple design, impulse control training, and real-time sync.

#### Acceptance Criteria

1. WHEN recording a demo THEN the system SHALL show the clean training environment with minimal design and dog info panel within 1-2 seconds
2. WHEN demonstrating "Leave It" training flow THEN the system SHALL show START TRAINING button click, "Leave It Practice" session panel appearing, 5 rapid MARK REP clicks with counter incrementing (0/5 → 1/5 → 2/5 → 3/5 → 4/5 → 5/5), goal completion celebration, and END SESSION with summary showing +30 IMP, +10 PHY XP
3. WHEN XP is awarded THEN the system SHALL show floating XP notifications appearing in upper right ("+30 IMP XP" in purple, "+10 PHY XP" in red) with clean Apple design
4. WHEN demonstrating stats view THEN the system SHALL show VIEW STATS button click and full-screen stats overlay with IMP and PHY stats updated and smooth animations
5. WHEN the demo completes THEN the system SHALL have demonstrated the full "Leave It" training flow (minimal → training → mark 5 reps → summary → stats → minimal) in 15-25 seconds
