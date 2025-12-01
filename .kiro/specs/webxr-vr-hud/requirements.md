# Requirements Document

## Introduction

The WebXR VR-HUD feature provides an immersive training interface for Apple Vision Pro users, enabling hands-free dog training with real-time stats, voice commands, and session management. This web-based VR experience complements the existing native visionOS app by providing a browser-accessible alternative that integrates seamlessly with the Corgi Quest real-time backend.

## Glossary

- **WebXR System**: The browser-based WebXR Device API implementation that enables immersive VR experiences
- **VR-HUD**: Virtual Reality Heads-Up Display showing training stats, goals, and session controls in 3D space
- **Training Session**: A timed training period with rep counting and voice-based activity logging
- **Stat Orb**: 3D visualization of a dog's training stat (PHY/INT/IMP/SOC) with level and XP progress
- **Rep**: A single repetition of a training behavior (e.g., one successful "sit" command)
- **Convex Backend**: The real-time database and backend system shared across all Corgi Quest platforms
- **Gaze-and-Pinch**: Vision Pro's natural input method using eye tracking and hand gestures
- **Transient Pointer**: WebXR input mode for Vision Pro's gaze-based interaction model

## Requirements

### Requirement 1: WebXR Environment Setup

**User Story:** As a Vision Pro user, I want to access the VR training HUD through Safari, so that I can train my dog with an immersive interface without installing a native app.

#### Acceptance Criteria

1. WHEN a user navigates to the /vr route THEN the WebXR System SHALL display a landing page with an "Enter VR" button
2. WHEN the page loads THEN the WebXR System SHALL check for immersive-vr session support via navigator.xr.isSessionSupported
3. WHEN WebXR is not supported THEN the WebXR System SHALL display a fallback 2D dashboard with the same training data
4. WHEN the site is accessed over HTTP THEN the WebXR System SHALL display a warning that HTTPS is required for WebXR features
5. WHEN the user clicks "Enter VR" THEN the WebXR System SHALL request an immersive-vr session with hand-tracking as an optional feature

### Requirement 2: 3D Scene Rendering

**User Story:** As a Vision Pro user in VR mode, I want to see my dog's stats and training controls floating in 3D space, so that I can monitor progress while actively training.

#### Acceptance Criteria

1. WHEN the VR session starts THEN the WebXR System SHALL create a WebGL2 rendering context compatible with the XR session
2. WHEN the scene initializes THEN the WebXR System SHALL render a minimal 3D environment with neutral lighting
3. WHEN rendering the HUD THEN the WebXR System SHALL display floating 3D panels positioned around the user's view
4. WHEN rendering stat orbs THEN the WebXR System SHALL display four circular progress indicators for PHY, INT, IMP, and SOC stats
5. WHEN the user looks around THEN the WebXR System SHALL maintain stable panel positions in 3D space without jitter

### Requirement 3: Dog Profile Display

**User Story:** As a trainer, I want to see my dog's name, level, and avatar in VR, so that I know which dog I'm currently training.

#### Acceptance Criteria

1. WHEN the VR-HUD loads THEN the WebXR System SHALL display the active dog's name in 3D text
2. WHEN the dog data is available THEN the WebXR System SHALL display the dog's overall level badge
3. WHEN the dog has a photo THEN the WebXR System SHALL display a placeholder avatar card in 3D space
4. WHEN the active dog changes THEN the WebXR System SHALL update the displayed name and level within 2 seconds
5. WHEN no dog is selected THEN the WebXR System SHALL display a message prompting the user to select a dog

### Requirement 4: Stat Visualization

**User Story:** As a trainer, I want to see real-time stat progress in VR, so that I can track which areas need more training focus.

#### Acceptance Criteria

1. WHEN displaying stats THEN the WebXR System SHALL render four stat orbs showing PHY, INT, IMP, and SOC
2. WHEN a stat has XP THEN the WebXR System SHALL display a circular progress ring showing XP progress to next level
3. WHEN a stat levels up THEN the WebXR System SHALL animate the stat orb with a pulse effect
4. WHEN XP is gained THEN the WebXR System SHALL update the progress ring with a smooth animation
5. WHEN displaying each stat THEN the WebXR System SHALL show the stat type, name, and current level

### Requirement 5: Daily Goals Display

**User Story:** As a trainer, I want to see today's physical and mental goals in VR, so that I know how much training is still needed.

#### Acceptance Criteria

1. WHEN displaying goals THEN the WebXR System SHALL show physical goal progress as a horizontal bar
2. WHEN displaying goals THEN the WebXR System SHALL show mental goal progress as a horizontal bar
3. WHEN goals are updated THEN the WebXR System SHALL animate the progress bars smoothly
4. WHEN displaying the streak THEN the WebXR System SHALL show the current streak count with a fire emoji
5. WHEN a goal is completed THEN the WebXR System SHALL highlight the completed goal with a visual indicator

### Requirement 6: Gaze-and-Pinch Interaction

**User Story:** As a Vision Pro user, I want to interact with VR controls using natural gaze and pinch gestures, so that I can control training sessions hands-free.

#### Acceptance Criteria

1. WHEN the VR session starts THEN the WebXR System SHALL listen for select, selectstart, and inputsourceschange events
2. WHEN the user gazes at a 3D button THEN the WebXR System SHALL highlight the button to indicate it is targetable
3. WHEN the user pinches while gazing at a button THEN the WebXR System SHALL trigger the button's action
4. WHEN raycasting from gaze THEN the WebXR System SHALL use the input source's targetRaySpace to determine intersection
5. WHEN no interactive element is targeted THEN the WebXR System SHALL not trigger any actions on pinch

### Requirement 7: Training Session Controls

**User Story:** As a trainer, I want to start, track, and end training sessions in VR, so that I can log training activities without leaving the immersive environment.

#### Acceptance Criteria

1. WHEN no session is active THEN the WebXR System SHALL display a "Start Session" button in 3D space
2. WHEN the user activates "Start Session" THEN the WebXR System SHALL create a session record in the Convex Backend with dog ID and start time
3. WHEN a session is active THEN the WebXR System SHALL display a "Mark Rep" button and an "End Session" button
4. WHEN the user activates "Mark Rep" THEN the WebXR System SHALL increment the rep counter and display the updated count
5. WHEN the user activates "End Session" THEN the WebXR System SHALL close the session and prompt for a voice summary

### Requirement 8: Voice Command Integration

**User Story:** As a trainer actively working with my dog, I want to control the VR interface with voice commands, so that I can keep my hands free during training.

#### Acceptance Criteria

1. WHEN the VR session starts THEN the WebXR System SHALL request microphone permissions via getUserMedia
2. WHEN microphone access is granted THEN the WebXR System SHALL activate voice recognition using the Web Speech API
3. WHEN the user says "start session" THEN the WebXR System SHALL initiate a new training session
4. WHEN the user says "mark rep" during a session THEN the WebXR System SHALL increment the rep counter
5. WHEN the user says "end session" followed by a description THEN the WebXR System SHALL log the activity with the spoken summary

### Requirement 9: Real-Time Backend Integration

**User Story:** As a trainer using multiple devices, I want VR-HUD data to sync in real-time with the web app and mobile app, so that all my training data stays consistent.

#### Acceptance Criteria

1. WHEN the VR-HUD loads THEN the WebXR System SHALL fetch current dog stats, goals, and activities from the Convex Backend
2. WHEN data changes in the Convex Backend THEN the WebXR System SHALL update the VR-HUD within 3 seconds
3. WHEN a session is started in VR THEN the Convex Backend SHALL create a session record visible to all connected clients
4. WHEN a rep is marked in VR THEN the Convex Backend SHALL update the session state in real-time
5. WHEN an activity is logged in VR THEN the Convex Backend SHALL process the activity and update stats visible across all platforms

### Requirement 10: Voice Activity Logging

**User Story:** As a trainer, I want to describe my training session with natural speech, so that the AI can parse it and award appropriate XP.

#### Acceptance Criteria

1. WHEN the user ends a session with voice THEN the WebXR System SHALL capture the spoken description via Web Speech API
2. WHEN a voice transcript is captured THEN the WebXR System SHALL send it to the Convex Backend for Claude parsing
3. WHEN Claude parses the activity THEN the Convex Backend SHALL determine XP allocation across PHY, INT, IMP, and SOC stats
4. WHEN XP is awarded THEN the WebXR System SHALL animate the affected stat orbs with pulse effects
5. WHEN the activity is logged THEN the WebXR System SHALL display a confirmation message in VR

### Requirement 11: Activity Feed Display

**User Story:** As a trainer, I want to see recent training activities in VR, so that I can review what training has been completed today.

#### Acceptance Criteria

1. WHEN displaying the activity feed THEN the WebXR System SHALL show the 5 most recent activities
2. WHEN displaying each activity THEN the WebXR System SHALL show the activity name, XP breakdown, and timestamp
3. WHEN displaying each activity THEN the WebXR System SHALL show which user logged the activity
4. WHEN a new activity is logged THEN the WebXR System SHALL add it to the feed with a fade-in animation
5. WHEN the feed updates THEN the WebXR System SHALL maintain smooth 60fps rendering

### Requirement 12: Weekly XP Chart

**User Story:** As a trainer, I want to see a 7-day XP chart in VR, so that I can visualize training consistency over the past week.

#### Acceptance Criteria

1. WHEN displaying the weekly chart THEN the WebXR System SHALL render a 3D bar chart using BoxGeometry primitives showing XP per day
2. WHEN rendering bars THEN the WebXR System SHALL display one bar per day for the last 7 days with consistent spacing
3. WHEN displaying the chart THEN the WebXR System SHALL label each bar with the day of the week using 3D text positioned below each bar
4. WHEN the chart loads THEN the WebXR System SHALL animate the bars growing from zero to their final height over 0.5 seconds
5. WHEN XP data updates THEN the WebXR System SHALL smoothly transition bar heights to new values using spring animations
6. WHEN rendering bars THEN the WebXR System SHALL maintain a minimum bar height of 0.05 units for visibility even when XP is zero
7. WHEN displaying XP values THEN the WebXR System SHALL show the numeric XP value above each bar using 3D text with appropriate font size

### Requirement 13: Session Feedback Animations

**User Story:** As a trainer, I want visual feedback when I interact with VR controls, so that I know my actions were registered.

#### Acceptance Criteria

1. WHEN a button is activated THEN the WebXR System SHALL play a scale animation on the button
2. WHEN a rep is marked THEN the WebXR System SHALL display a floating "+1" indicator that fades out
3. WHEN XP is gained THEN the WebXR System SHALL pulse the affected stat orbs
4. WHEN a goal is completed THEN the WebXR System SHALL play a celebration animation
5. WHEN a session ends THEN the WebXR System SHALL display a summary panel with total reps and XP earned

### Requirement 14: Fallback Non-VR Experience

**User Story:** As a user without Vision Pro, I want to access training data through a standard 2D interface, so that the app remains functional on all devices.

#### Acceptance Criteria

1. WHEN WebXR is not supported THEN the WebXR System SHALL display a 2D dashboard with the same data
2. WHEN displaying the 2D fallback THEN the WebXR System SHALL show stats, goals, and session controls in a standard layout
3. WHEN the user interacts with 2D controls THEN the WebXR System SHALL provide the same functionality as VR mode
4. WHEN the 2D fallback loads THEN the WebXR System SHALL fetch data from the Convex Backend identically to VR mode
5. WHEN the user is on a non-VR device THEN the WebXR System SHALL not display VR-specific instructions

### Requirement 15: Performance Optimization

**User Story:** As a Vision Pro user, I want the VR experience to run smoothly at 60+ fps, so that the immersive experience feels natural and comfortable.

#### Acceptance Criteria

1. WHEN rendering the VR scene THEN the WebXR System SHALL maintain 60 frames per second or higher
2. WHEN animating UI elements THEN the WebXR System SHALL limit simultaneous animations to 4 or fewer
3. WHEN loading 3D assets THEN the WebXR System SHALL use lightweight geometries and materials
4. WHEN polling for data updates THEN the WebXR System SHALL limit requests to once every 3 seconds
5. WHEN the app backgrounds THEN the WebXR System SHALL pause rendering and data polling to conserve resources

### Requirement 16: Error Handling

**User Story:** As a user, I want clear error messages when things go wrong, so that I know how to resolve issues.

#### Acceptance Criteria

1. WHEN the network connection fails THEN the WebXR System SHALL display an offline indicator in VR
2. WHEN microphone permissions are denied THEN the WebXR System SHALL display a message explaining how to enable permissions
3. WHEN voice recognition fails THEN the WebXR System SHALL allow manual text input as a fallback
4. WHEN the Convex Backend returns an error THEN the WebXR System SHALL display a user-friendly error message
5. WHEN an unrecognized voice command is spoken THEN the WebXR System SHALL ignore it silently without disrupting the experience
