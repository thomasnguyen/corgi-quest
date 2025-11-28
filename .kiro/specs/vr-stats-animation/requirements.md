# Requirements Document

## Introduction

This feature adds polished startup animations to the VR Stats Screen in the CorgiQuestVR visionOS app. When the stats screen opens, stat circles will animate from 0 to their actual values with staggered timing, creating an impressive "filling up" effect perfect for demos. A subtle glow pulse will occur when each circle completes its fill animation.

**Implementation Note:** This is straightforward in SwiftUI using `@State` variables, `.onAppear`, and built-in `.animation()` modifiers. No external libraries or complex code required - approximately 15-20 lines of changes to existing views.

## Glossary

- **Stats Screen**: The full-screen overlay view (`StatsScreenView`) that displays dog training statistics when the user taps "VIEW STATS"
- **Stat Circle**: A circular progress ring showing XP progress for each stat type (PHY, INT, IMP, SOC)
- **Staggered Animation**: Animation where each element starts with a slight delay after the previous one
- **Fill Animation**: The visual effect of a progress ring growing from 0% to its target percentage
- **Glow Pulse**: A brief brightness/scale increase effect that occurs when an animation completes

## Requirements

### Requirement 1

**User Story:** As a demo presenter, I want the stat circles to animate from empty to filled when the stats screen opens, so that the UI feels polished and impressive.

#### Acceptance Criteria

1. WHEN the Stats Screen appears THEN the VR App SHALL animate each stat circle's progress ring from 0 to its actual xpProgress value
2. WHEN the Stats Screen appears THEN the VR App SHALL stagger the start of each stat circle animation by 0.2 seconds (PHY at 0.3s, INT at 0.5s, IMP at 0.7s, SOC at 0.9s)
3. WHEN a stat circle animates THEN the VR App SHALL use an easeOut animation curve over 0.8 seconds duration
4. WHEN the Stats Screen is closed and reopened THEN the VR App SHALL replay the fill animations from the beginning

### Requirement 2

**User Story:** As a user, I want visual feedback when stat circles finish filling, so that the completion feels satisfying and game-like.

#### Acceptance Criteria

1. WHEN a stat circle completes its fill animation THEN the VR App SHALL display a brief glow effect using the stat's color
2. WHEN the glow effect triggers THEN the VR App SHALL increase the circle's shadow radius momentarily (0.2 seconds)
3. WHEN the glow effect triggers THEN the VR App SHALL scale the circle to 1.05x then back to 1.0x with a spring animation

### Requirement 3

**User Story:** As a developer, I want the animation timing to be configurable, so that I can tune the feel for different demo scenarios.

#### Acceptance Criteria

1. WHEN implementing the animations THEN the VR App SHALL define animation timing constants at the top of the view (baseDelay, staggerInterval, fillDuration)
2. WHEN the total animation completes THEN the VR App SHALL have taken approximately 2-3 seconds from screen open to all circles filled
