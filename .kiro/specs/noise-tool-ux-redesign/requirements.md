# Requirements Document

## Introduction

This spec defines the Noise Desensitizer tool - a standalone web tool for playing trigger sounds to help desensitize dogs. The tool features a clean, mobile-friendly experience with a compact sound grid and focused "Now Playing" panel, allowing users to see all sounds and controls on a single screen without scrolling. No signup or authentication is required.

## Glossary

- **Noise Desensitizer**: The standalone web tool for playing trigger sounds to help desensitize dogs
- **Sound Grid**: A compact grid layout displaying all available sounds as tappable icons
- **Now Playing Panel**: A dedicated control area showing the currently selected/playing sound with volume and mode controls
- **Safety Drawer**: A slide-up panel containing safety guidelines, accessible via a button
- **Sticky Controls**: Fixed-position controls that remain visible regardless of scroll position
- **Progressive Exposure**: A training technique where volume gradually increases over time

## Requirements

### Requirement 1

**User Story:** As a dog owner on mobile, I want to see all available sounds without scrolling, so that I can quickly find and play the trigger sound I need.

#### Acceptance Criteria

1. WHEN the page loads THEN the system SHALL display all sounds in a compact grid layout (3 columns on mobile)
2. THE sound grid SHALL show each sound as a tappable tile with icon, short label, and intensity indicator
3. THE entire sound grid SHALL be visible on a standard mobile viewport (375px width) without vertical scrolling
4. WHEN a user taps a sound tile THEN the system SHALL select that sound and display its controls in the Now Playing panel
5. THE selected sound tile SHALL display a visual highlight (border or background change) to indicate selection

### Requirement 2

**User Story:** As a dog owner, I want a dedicated control panel for the selected sound, so that I can adjust volume and playback without navigating away.

#### Acceptance Criteria

1. WHEN a sound is selected THEN the system SHALL display a Now Playing panel with the sound name, icon, and all controls
2. THE Now Playing panel SHALL include a large play/pause button (minimum 48x48px touch target)
3. THE Now Playing panel SHALL include a volume slider with current percentage displayed
4. THE Now Playing panel SHALL include Single/Loop mode toggle buttons
5. WHEN no sound is selected THEN the Now Playing panel SHALL display a prompt to "Tap a sound above to start"
6. THE Now Playing panel SHALL remain in a fixed position on screen (not scroll with content)

### Requirement 3

**User Story:** As a dog owner, I want to see the session timer and status at a glance, so that I can track my training session duration.

#### Acceptance Criteria

1. THE system SHALL display a compact status bar showing current playback status and session timer
2. THE status bar SHALL be positioned at the top of the Now Playing panel
3. WHEN a sound is playing THEN the status bar SHALL display the sound name and mode (Single/Loop)
4. WHEN no sound is playing THEN the status bar SHALL display "Ready to play"
5. THE session timer SHALL display in MM:SS format and increment every second during playback

### Requirement 4

**User Story:** As a dog owner, I want to access safety guidelines without them taking up screen space, so that I can focus on the training tool while still having guidance available.

#### Acceptance Criteria

1. WHEN the page loads THEN the system SHALL display a compact safety banner at the top with a "Tips" button
2. WHEN a user taps the Tips button THEN the system SHALL open a slide-up drawer with full safety guidelines
3. THE safety drawer SHALL include all four safety guidelines (relaxed dog, low volume, stress signals, positive reinforcement)
4. WHEN a user taps outside the drawer or a close button THEN the system SHALL close the safety drawer
5. THE safety banner SHALL not exceed 44px in height to preserve screen space

### Requirement 5

**User Story:** As a dog owner, I want quick access to stop all sounds and reset the timer, so that I can immediately respond if my dog shows stress.

#### Acceptance Criteria

1. THE system SHALL display a prominent "Stop" button that is always visible when a sound is playing
2. WHEN a user taps the Stop button THEN the system SHALL immediately stop all audio playback
3. THE system SHALL display a "Reset" button to reset the session timer to 00:00
4. THE Stop button SHALL have a minimum touch target of 48x48px
5. WHEN no sound is playing THEN the Stop button SHALL be visually de-emphasized but still accessible

### Requirement 6

**User Story:** As a dog owner, I want to enable progressive exposure mode, so that volume increases automatically during my training session.

#### Acceptance Criteria

1. THE Now Playing panel SHALL include a Progressive Exposure toggle
2. WHEN Progressive Exposure is enabled THEN the system SHALL display an indicator showing "Auto +10% every 60s"
3. WHEN Progressive Exposure is enabled and a sound is playing THEN the system SHALL increase volume by 10% every 60 seconds
4. WHEN volume reaches 60% during progressive exposure THEN the system SHALL stop automatic increases
5. IF a user manually adjusts volume during progressive exposure THEN the system SHALL disable automatic increases for that session

### Requirement 7

**User Story:** As a dog owner, I want the sound grid to show intensity levels visually, so that I can quickly identify high-intensity sounds to approach with caution.

#### Acceptance Criteria

1. EACH sound tile SHALL display an intensity indicator (High, Medium, or Low)
2. High intensity sounds SHALL display a red indicator dot or badge
3. Medium intensity sounds SHALL display an amber/yellow indicator dot or badge
4. Low intensity sounds SHALL display a green indicator dot or badge
5. THE intensity indicator SHALL be visible without tapping or hovering on the tile

### Requirement 8

**User Story:** As a potential Corgi Quest user, I want to see a non-intrusive call-to-action, so that I can discover the full app without it interfering with my training.

#### Acceptance Criteria

1. THE system SHALL display a minimal "Powered by Corgi Quest" text below the Now Playing panel
2. WHEN a user taps the Corgi Quest text THEN the system SHALL navigate to the waitlist page
3. THE CTA SHALL not include large buttons or promotional banners that compete with the tool's primary function
4. THE CTA text SHALL use subtle styling (small font, muted color) to remain unobtrusive

### Requirement 9

**User Story:** As a dog owner using the tool during training, I want all interactive elements to be easily tappable, so that I can control playback without precise finger placement.

#### Acceptance Criteria

1. ALL interactive elements SHALL have a minimum touch target of 44x44 pixels
2. THE sound grid tiles SHALL have adequate spacing (minimum 8px gap) to prevent mis-taps
3. THE volume slider SHALL have a large thumb (minimum 24px) for easy dragging
4. THE play/pause button SHALL be the largest interactive element (minimum 56x56px)
5. THE system SHALL provide visual feedback (scale or color change) on tap for all interactive elements

### Requirement 10

**User Story:** As a dog owner, I want the tool to work immediately without any setup, so that I can start training right away.

#### Acceptance Criteria

1. THE system SHALL function without requiring any user authentication or account creation
2. THE system SHALL not display any login prompts, signup modals, or account-related UI
3. THE system SHALL not require cookies or display cookie consent banners
4. WHEN the page loads THEN the system SHALL be ready to play sounds within 2 seconds
5. THE system SHALL work in mobile browsers including iOS Safari and Chrome without plugins

