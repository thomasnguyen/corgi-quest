# Requirements Document

## Introduction

The Noise Desensitizer is a free, standalone mobile-first web tool that helps dog owners safely expose their dogs to common environmental triggers (fireworks, doorbells, thunder, etc.) at controlled volumes. It supports progressive exposure training and provides safety guidance, serving as both a valuable training resource and a funnel to the main Corgi Quest app.

## Glossary

- **Noise Desensitizer**: The standalone web tool for playing trigger sounds
- **Trigger Sound**: An environmental noise that may cause anxiety or reactivity in dogs
- **Progressive Exposure**: A training technique where volume gradually increases over time
- **Session**: A continuous period of sound playback tracked by a timer
- **Single Mode**: Play a sound once and stop automatically
- **Loop Mode**: Continuously replay a sound with pauses until manually stopped

## Requirements

### Requirement 1

**User Story:** As a dog owner, I want to play common trigger sounds at controlled volumes, so that I can safely desensitize my dog to environmental noises.

#### Acceptance Criteria

1. WHEN the page loads THEN the system SHALL display 8-10 trigger sounds with icons, names, and intensity tags
2. WHEN a user taps the Play button on any sound THEN the system SHALL play that sound at the current volume setting
3. WHEN a sound is playing and the user adjusts its volume slider THEN the system SHALL immediately update the playback volume
4. WHEN a user taps Play on a different sound THEN the system SHALL stop the currently playing sound and start the new sound
5. WHEN a user taps the Stop button on an active sound THEN the system SHALL stop playback and reset the audio to the beginning

### Requirement 2

**User Story:** As a dog owner, I want to choose between single-play and loop modes, so that I can control how sounds are repeated during training sessions.

#### Acceptance Criteria

1. WHEN a user selects Single mode for a sound THEN the system SHALL play the sound once and automatically stop when it ends
2. WHEN a user selects Loop mode for a sound THEN the system SHALL replay the sound after a 5-10 second pause until manually stopped
3. WHEN a sound completes in Loop mode THEN the system SHALL wait 7 seconds and replay from the beginning
4. WHEN a user changes mode while a sound is playing THEN the system SHALL apply the new mode to subsequent playback
5. WHERE a sound is in Loop mode WHEN the user starts a different sound THEN the system SHALL stop the looping sound

### Requirement 3

**User Story:** As a dog owner, I want to see safety instructions before using the tool, so that I can train my dog responsibly without causing stress.

#### Acceptance Criteria

1. WHEN the page loads THEN the system SHALL display a safety card with four key guidelines
2. THE safety card SHALL include guidance to start when the dog is relaxed
3. THE safety card SHALL include guidance to begin at very low volume
4. THE safety card SHALL include guidance to reduce volume or stop if the dog shows stress
5. THE safety card SHALL include guidance to pair sounds with positive reinforcement

### Requirement 4

**User Story:** As a dog owner, I want to use progressive exposure training, so that I can gradually increase volume automatically during a session.

#### Acceptance Criteria

1. WHEN a user enables Progressive Exposure mode THEN the system SHALL start playback at 10% volume minimum
2. WHILE Progressive Exposure is enabled and a sound is playing THEN the system SHALL increase volume by 10% every 60 seconds
3. WHEN volume reaches 60% during progressive exposure THEN the system SHALL stop automatic increases
4. IF a user manually adjusts the volume slider during progressive exposure THEN the system SHALL disable automatic increases for that sound
5. WHEN Progressive Exposure is disabled mid-session THEN the system SHALL stop automatic volume increases but continue playback

### Requirement 5

**User Story:** As a dog owner, I want to track my training session duration, so that I can keep sessions appropriately short and positive.

#### Acceptance Criteria

1. WHEN any sound starts playing THEN the system SHALL start a session timer from 00:00
2. WHILE any sound is playing THEN the system SHALL increment the timer every second
3. WHEN all sounds are stopped THEN the system SHALL pause the timer
4. WHEN a user taps Reset Timer THEN the system SHALL set the timer to 00:00 without affecting playback
5. WHEN a user taps Stop All THEN the system SHALL stop all playback and freeze the timer

### Requirement 6

**User Story:** As a dog owner, I want to see the current playback status, so that I know which sound is playing and in what mode.

#### Acceptance Criteria

1. WHEN no sound is playing THEN the system SHALL display "Status: Stopped"
2. WHEN a sound is playing in Single mode THEN the system SHALL display "Status: Playing [Sound Name] (Single)"
3. WHEN a sound is playing in Loop mode THEN the system SHALL display "Status: Playing [Sound Name] (Loop)"
4. WHEN Progressive Exposure is active THEN the system SHALL display an indicator showing "Auto-raising every 60s"
5. THE status display SHALL update in real-time as playback state changes

### Requirement 7

**User Story:** As a dog owner, I want the tool to work on my mobile device without requiring login, so that I can use it immediately during training sessions.

#### Acceptance Criteria

1. THE system SHALL render responsively on mobile devices with touch-optimized controls
2. THE system SHALL function without requiring user authentication or account creation
3. THE system SHALL provide touch targets of at least 44x44 pixels for all interactive elements
4. THE system SHALL work in mobile browsers including iOS Safari and Chrome
5. THE system SHALL not require cookies or display cookie consent banners

### Requirement 8

**User Story:** As a potential Corgi Quest user, I want to see a call-to-action for the main app, so that I can discover the full training platform.

#### Acceptance Criteria

1. WHEN the page loads THEN the system SHALL display a footer with "powered by Corgi Quest" branding
2. THE footer SHALL include a CTA button reading "Get daily training quests in the Corgi Quest app"
3. WHEN a user taps the CTA button THEN the system SHALL navigate to the main Corgi Quest app
4. THE tool SHALL remain fully functional without requiring interaction with the CTA
5. THE CTA SHALL be visually distinct but not intrusive to the tool's primary function

### Requirement 9

**User Story:** As a dog owner, I want each sound to have appropriate default settings, so that I can start training safely without configuration.

#### Acceptance Criteria

1. WHEN the page loads THEN the system SHALL set all sounds to 20-30% default volume
2. WHEN the page loads THEN the system SHALL set all sounds to Single mode by default
3. WHEN the page loads THEN the system SHALL set Progressive Exposure to disabled
4. THE system SHALL display intensity tags (High, Medium, Low) for each sound based on typical dog sensitivity
5. THE system SHALL provide distinct visual styling for different intensity levels

### Requirement 10

**User Story:** As a dog owner, I want access to a comprehensive set of common trigger sounds, so that I can address my dog's specific sensitivities.

#### Acceptance Criteria

1. THE system SHALL provide a Fireworks sound tagged as High intensity
2. THE system SHALL provide a Thunder sound tagged as Medium/High intensity
3. THE system SHALL provide a Door Knock sound tagged as Medium intensity
4. THE system SHALL provide a Doorbell sound tagged as Medium intensity
5. THE system SHALL provide a Dog Barking sound tagged as Medium/High intensity
6. THE system SHALL provide a Baby Crying sound tagged as Medium intensity
7. THE system SHALL provide a Traffic/City Noise sound tagged as Medium intensity
8. THE system SHALL provide a Siren sound tagged as Medium intensity
9. THE system SHALL provide a Construction/Hammering sound tagged as Medium/High intensity
