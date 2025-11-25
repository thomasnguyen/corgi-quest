# Requirements Document

## Introduction

The VR Training HUD is a visionOS companion experience that transforms real-world dog training into an immersive command center. Users can view live stats, run AI-guided training sessions, and control everything hands-free with voice commands while watching real-time updates sync between VR and the web app via Convex.

## Glossary

- **VR Training Room**: An immersive visionOS environment with floating UI panels and a central pedestal representing the dog
- **Stat Orbs**: Four floating spheres displaying PHY, INT, IMP, and SOC stats with XP progress rings
- **Coach Mode**: An AI-guided training session activated by voice that provides goals, tips, and rep tracking
- **Convex Backend**: Real-time database system that syncs data between VR app and web app
- **Rep**: A single repetition of a training behavior (e.g., one calm sit, one successful recall)
- **VisionOS App**: The Swift/SwiftUI application running on Apple Vision Pro
- **Web App**: The existing TanStack Start + React application

## Requirements

### Requirement 1

**User Story:** As a dog trainer, I want to enter an immersive VR training room, so that I can see my dog's stats and training environment in a focused, distraction-free space.

#### Acceptance Criteria

1. WHEN the VisionOS App launches THEN the system SHALL display a stylized room with soft neutral lighting and a circular platform in the center
2. WHEN the room loads THEN the system SHALL display the dog's name floating above the central pedestal
3. WHILE the user moves their head THEN the system SHALL apply subtle parallax effects to create depth perception
4. WHEN the environment renders THEN the system SHALL maintain 30-60 fps performance
5. WHERE the user prefers dark mode THEN the system SHALL render the environment with appropriate contrast

### Requirement 2

**User Story:** As a dog trainer, I want to see floating UI panels with live training data, so that I can monitor progress without leaving the immersive environment.

#### Acceptance Criteria

1. WHEN the VR Training Room loads THEN the system SHALL display four distinct floating panels arranged around the central pedestal
2. WHEN displaying stat orbs THEN the system SHALL show four orbs labeled INT, PHY, IMP, and SOC with current level and XP progress rings
3. WHEN displaying today's goals THEN the system SHALL show Physical progress, Mental progress, and current streak with visual progress bars
4. WHEN displaying recent activities THEN the system SHALL show the last 3-5 training events with activity name, XP breakdown, and timestamp
5. WHEN displaying the 7-day chart THEN the system SHALL render a horizontal bar chart showing XP earned per day using Swift Charts

### Requirement 3

**User Story:** As a dog trainer, I want stat orbs to pulse and animate when XP increases, so that I receive immediate visual feedback during training sessions.

#### Acceptance Criteria

1. WHEN XP increases for any stat THEN the system SHALL pulse the corresponding stat orb with a smooth animation
2. WHEN today's goals update THEN the system SHALL smoothly animate the progress bars to their new values
3. WHEN a new activity appears THEN the system SHALL add it to the recent activities panel with a fade-in animation
4. WHILE animations play THEN the system SHALL maintain 30-60 fps performance
5. WHEN multiple stats update simultaneously THEN the system SHALL coordinate animations without visual conflicts

### Requirement 4

**User Story:** As a dog trainer, I want to activate Coach Mode with my voice, so that I can start a guided training session hands-free.

#### Acceptance Criteria

1. WHEN the user says "Coach mode: [activity name]" THEN the system SHALL activate a training session for that activity
2. WHEN Coach Mode activates THEN the system SHALL display a training session panel showing goal, tips, and rep counter starting at 0
3. WHEN the session starts THEN the system SHALL fetch activity-specific tips from the backend
4. WHEN Coach Mode is active THEN the system SHALL update the UI to indicate an active training session
5. WHERE the activity name is unrecognized THEN the system SHALL display an error message and remain in idle state

### Requirement 5

**User Story:** As a dog trainer, I want to mark reps with my voice during training, so that I can track progress without using my hands.

#### Acceptance Criteria

1. WHEN the user says "Mark rep" during an active session THEN the system SHALL increment the rep counter by one
2. WHEN a rep is marked THEN the system SHALL display the updated count in the format "X / Y" where Y is the goal
3. WHEN a rep is marked THEN the system SHALL optionally display a micro-suggestion or encouragement
4. WHEN the rep goal is reached THEN the system SHALL provide visual feedback indicating goal completion
5. IF the user says "Mark rep" without an active session THEN the system SHALL ignore the command

### Requirement 6

**User Story:** As a dog trainer, I want to end training sessions with natural speech, so that the system can log my activity and award XP.

#### Acceptance Criteria

1. WHEN the user says "End session: [description]" THEN the system SHALL send the description to the backend for parsing
2. WHEN the backend processes the session THEN the system SHALL parse the description into structured activity data with XP assignments
3. WHEN XP is awarded THEN the system SHALL refresh the VR dashboard to show updated stats, goals, and activity feed
4. WHEN the session ends THEN the system SHALL display a confirmation message and return to idle state
5. WHEN the web app is open simultaneously THEN the system SHALL ensure the activity appears in both VR and web app within 2 seconds

### Requirement 7

**User Story:** As a dog trainer, I want the VR app to sync with the web app in real-time, so that my partner and I see the same training data instantly.

#### Acceptance Criteria

1. WHEN the VisionOS App launches THEN the system SHALL fetch current dog status from the Convex backend
2. WHEN any training data changes in Convex THEN the system SHALL update the VR dashboard within 2 seconds
3. WHEN the web app logs an activity THEN the system SHALL reflect the update in VR stat orbs, goals, and activity feed
4. WHEN the VR app logs an activity THEN the system SHALL reflect the update in the web app within 2 seconds
5. WHILE offline THEN the system SHALL display a connection status indicator and queue updates for sync

### Requirement 8

**User Story:** As a dog trainer, I want voice commands to work reliably, so that I can control the app hands-free during real training sessions.

#### Acceptance Criteria

1. WHEN the VisionOS App has microphone permission THEN the system SHALL enable voice command recognition
2. WHEN the user speaks a recognized command THEN the system SHALL execute the command within 1 second
3. WHEN voice recognition is active THEN the system SHALL display a visual indicator
4. WHEN a command is ambiguous THEN the system SHALL request clarification or ignore the command
5. WHERE background noise is present THEN the system SHALL filter noise and recognize commands accurately

### Requirement 9

**User Story:** As a developer, I want backend API endpoints for VR data, so that the VisionOS app can fetch and update training data.

#### Acceptance Criteria

1. WHEN the VR app requests dog status THEN the system SHALL return a JSON response containing dog name, level, all four stats, today's goals, streak, recent activities, and weekly XP totals
2. WHEN the VR app submits a voice log THEN the system SHALL parse the text with Claude, create structured activity data, update Convex, and return success status
3. WHEN API requests fail THEN the system SHALL return appropriate HTTP status codes and error messages
4. WHEN the VR app polls for updates THEN the system SHALL respond within 500ms
5. WHERE authentication is required THEN the system SHALL validate user tokens before returning data

### Requirement 10

**User Story:** As a product demonstrator, I want to capture a compelling 15-25 second demo clip, so that judges can see the VR feature's impact.

#### Acceptance Criteria

1. WHEN recording a demo THEN the system SHALL show the VR Training Room environment within 1-2 seconds
2. WHEN demonstrating Coach Mode THEN the system SHALL show session activation, rep marking, and session completion in sequence
3. WHEN XP is awarded THEN the system SHALL show stat orbs pulsing and today's goals updating with clear visual feedback
4. WHEN cutting to the web app THEN the system SHALL show the same activity appearing in the web app's activity feed
5. WHEN the demo completes THEN the system SHALL have demonstrated the full VR → backend → web app sync flow in 15-25 seconds
