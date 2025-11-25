# Requirements Document

## Introduction

This feature enhances the real-time visual feedback in Corgi Quest to make data updates more obvious and engaging. When one user logs an activity, the other user should immediately see animated visual feedback showing what changed. This creates a more immersive collaborative experience and demonstrates the power of Convex's real-time capabilities.

## Glossary

- **System**: The Corgi Quest web application
- **User**: A person using the application to track their dog's activities
- **Partner**: The other user in the same household
- **Stat Orb**: The circular UI component displaying a dog stat (INT, PHY, IMP, SOC)
- **Daily Goals**: The physical and mental point targets shown in the top resource bar
- **Level-Up**: When a dog or stat reaches the next level threshold
- **XP Gain**: Experience points earned from logging an activity
- **Real-Time Update**: Data changes that appear instantly without manual refresh

## Requirements

### Requirement 1: Floating XP Animations on Stat Orbs

**User Story:** As a user, I want to see animated "+XP" indicators floating up from stat orbs when XP is gained, so that I can immediately understand which stats were affected by an activity.

#### Acceptance Criteria

1. WHEN a stat gains XP from an activity, THE System SHALL display a floating "+[amount] XP" text animation that rises from the stat orb
2. THE System SHALL position the floating text to start at the center of the affected stat orb
3. THE System SHALL animate the floating text upward by 40 pixels over 1.5 seconds with a fade-out effect
4. WHEN multiple stats gain XP simultaneously, THE System SHALL display separate floating animations for each stat with 100ms stagger delays
5. THE System SHALL use the stat's theme color for the floating text (cyan for PHY, purple for INT, orange for IMP, green for SOC)
6. THE System SHALL remove the floating animation element from the DOM after the animation completes
7. WHEN the user is on a different screen, THE System SHALL still trigger the animation when returning to the overview screen if XP was gained within the last 3 seconds

### Requirement 2: Pulse Effect on Daily Goals When Updated

**User Story:** As a user, I want to see the daily goal progress bars pulse when points are added, so that I can immediately notice when my partner logs an activity that contributes to our shared goals.

#### Acceptance Criteria

1. WHEN physical points are added to daily goals, THE System SHALL apply a cyan pulse animation to the physical goal indicator for 1 second
2. WHEN mental points are added to daily goals, THE System SHALL apply a purple pulse animation to the mental goal indicator for 1 second
3. THE System SHALL scale the pulsing element from 100% to 105% and back during the animation
4. THE System SHALL apply a glow effect with the appropriate color during the pulse
5. WHEN a goal is completed (reaches 100%), THE System SHALL trigger a more prominent celebration pulse with 110% scale
6. THE System SHALL prevent pulse animations from stacking if multiple updates occur within 1 second
7. THE System SHALL trigger the pulse animation for both the current user and their partner in real-time

### Requirement 3: Confetti Animation on Level-Ups

**User Story:** As a user, I want to see confetti animations when my dog levels up, so that level-up moments feel celebratory and are visible to both me and my partner in real-time.

#### Acceptance Criteria

1. WHEN a dog's overall level increases, THE System SHALL trigger a confetti animation that covers the screen
2. WHEN an individual stat levels up, THE System SHALL trigger a smaller confetti burst near the stat orb
3. THE System SHALL use gold and yellow colors for overall level-up confetti
4. THE System SHALL use the stat's theme color for individual stat level-up confetti
5. THE System SHALL animate confetti particles falling from top to bottom over 3 seconds with physics-based motion
6. THE System SHALL generate between 30-50 confetti pieces for overall level-ups
7. THE System SHALL generate between 15-25 confetti pieces for stat level-ups
8. THE System SHALL trigger the confetti animation for both the current user and their partner simultaneously
9. THE System SHALL ensure confetti does not block interactive UI elements
10. THE System SHALL remove confetti elements from the DOM after the animation completes

### Requirement 4: Partner Activity Toast Enhancements

**User Story:** As a user, I want to see detailed toast notifications when my partner logs an activity, so that I can stay informed about their contributions without switching screens.

#### Acceptance Criteria

1. WHEN a partner logs an activity, THE System SHALL display a toast notification with the partner's name and activity name
2. THE System SHALL include the total XP gained in the toast message
3. THE System SHALL show individual stat gains in the toast (e.g., "PHY +30, IMP +10")
4. WHEN a partner's activity causes a level-up, THE System SHALL include level-up information in the toast
5. THE System SHALL display the toast for 4 seconds before auto-dismissing
6. THE System SHALL position toasts at the bottom center of the screen, stacking vertically if multiple appear
7. THE System SHALL NOT show toast notifications for the current user's own activities
8. THE System SHALL use a distinct visual style (green accent) for partner activity toasts to differentiate from system messages

### Requirement 5: Real-Time Animation Synchronization

**User Story:** As a user, I want all visual animations to appear simultaneously for both me and my partner, so that we experience the same celebratory moments together in real-time.

#### Acceptance Criteria

1. WHEN an activity is logged, THE System SHALL trigger all relevant animations within 100ms for all connected users
2. THE System SHALL use Convex real-time subscriptions to detect data changes that trigger animations
3. THE System SHALL detect level-ups by comparing previous and current level values in useEffect hooks
4. THE System SHALL detect XP gains by comparing previous and current XP values in useEffect hooks
5. THE System SHALL detect daily goal updates by comparing previous and current point values in useEffect hooks
6. THE System SHALL ensure animations do not trigger on initial page load, only on real-time updates
7. THE System SHALL handle multiple simultaneous animations without performance degradation
8. THE System SHALL use requestAnimationFrame for smooth 60fps animations
