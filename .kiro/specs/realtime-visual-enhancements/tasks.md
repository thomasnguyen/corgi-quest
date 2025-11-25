# Implementation Plan

- [x] 1. Set up animation utilities and hooks
  - Create shared animation utility functions and custom hooks for detecting value changes
  - _Requirements: 5.3, 5.4, 5.5, 5.6_

- [x] 1.1 Create usePreviousValue hook
  - Write custom hook that tracks and returns the previous value of any variable
  - Handle initial mount case where previous value is undefined
  - _Requirements: 5.3, 5.4, 5.5_

- [x] 1.2 Create useAnimationTrigger hook
  - Write hook that compares current vs previous values and triggers callback on change
  - Add skipInitial option to prevent triggering on component mount
  - Add debounce option to prevent animation spam
  - _Requirements: 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 1.3 Create animation utility functions
  - Write helper functions for calculating element positions (getBoundingClientRect)
  - Write color utility functions (lighten, darken for confetti colors)
  - Write stat color mapping constants
  - _Requirements: 1.5, 3.3, 3.4_

- [x] 2. Implement FloatingXP component
  - Create animated "+XP" text component that floats upward from stat orbs
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2.1 Create FloatingXP component structure
  - Define TypeScript interface for FloatingXP props (amount, color, startX, startY, onComplete)
  - Create functional component with absolute positioning
  - Use React portal to render outside parent component hierarchy
  - _Requirements: 1.1, 1.2_

- [x] 2.2 Implement FloatingXP animation
  - Add CSS keyframe animation for upward movement (translateY -40px over 1.5s)
  - Add fade-out effect (opacity 1 to 0)
  - Use transform for GPU acceleration
  - Trigger onComplete callback after animation finishes
  - _Requirements: 1.3, 1.6_

- [x] 2.3 Style FloatingXP component
  - Apply stat theme color to text
  - Add font styling (bold, appropriate size)
  - Add text shadow for visibility
  - Position absolutely at startX, startY coordinates
  - _Requirements: 1.5_

- [x] 3. Enhance StatOrb component with floating XP
  - Add floating XP animation triggers to StatOrb component when XP changes
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 3.1 Add XP change detection to StatOrb
  - Use useAnimationTrigger hook to detect stat.xp changes
  - Calculate XP gained amount (currentXP - previousXP)
  - Skip animation on initial mount
  - _Requirements: 1.1, 5.4, 5.6_

- [x] 3.2 Calculate FloatingXP spawn position
  - Add ref to StatOrb container element
  - Use getBoundingClientRect to get orb center coordinates
  - Store position data for FloatingXP component
  - _Requirements: 1.2_

- [x] 3.3 Manage FloatingXP state in StatOrb
  - Add state array to track active floating XP animations
  - Generate unique IDs for each animation
  - Add new animations to state when XP changes
  - Remove animations from state when they complete
  - _Requirements: 1.4, 1.6_

- [x] 3.4 Render FloatingXP components
  - Map over floating XP state array
  - Render FloatingXP component for each active animation
  - Pass stat theme color, position, and amount
  - Handle stagger delays for multiple simultaneous gains (100ms apart)
  - _Requirements: 1.4, 1.5_

- [x] 4. Implement PulseWrapper component
  - Create reusable wrapper component that applies pulse animation to children
  - _Requirements: 2.1, 2.2,   2.3, 2.4, 2.5, 2.6_

- [x] 4.1 Create PulseWrapper component structure
  - Define TypeScript interface for props (isActive, color, intensity, children)
  - Create wrapper div that renders children
  - Apply conditional CSS classes based on isActive prop
  - _Requirements: 2.1, 2.2_

- [x] 4.2 Implement pulse animation CSS
  - Create keyframe animation for normal pulse (scale 1 to 1.05)
  - Create keyframe animation for celebration pulse (scale 1 to 1.1)
  - Add box-shadow glow effect using color prop
  - Set animation duration to 1 second
  - _Requirements: 2.3, 2.4, 2.5_

- [x] 4.3 Add pulse state management
  - Automatically reset isActive to false after animation completes
  - Prevent animation stacking with debounce logic
  - _Requirements: 2.6_

- [x] 5. Enhance TopResourceBar with pulse effects
  - Add pulse animations to daily goal indicators when points are added
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 5.1 Add pulse state for daily goals
  - Add state variables for physical pulse and mental pulse
  - Initialize both to false
  - _Requirements: 2.1, 2.2_

- [x] 5.2 Detect physical points changes
  - Use useAnimationTrigger to detect dailyGoals.physicalPoints changes
  - Trigger pulse when points increase
  - Set physicalPulse to true, then false after 1 second
  - _Requirements: 2.1, 2.7, 5.5_

- [x] 5.3 Detect mental points changes
  - Use useAnimationTrigger to detect dailyGoals.mentalPoints changes
  - Trigger pulse when points increase
  - Set mentalPulse to true, then false after 1 second
  - _Requirements: 2.2, 2.7, 5.5_

- [x] 5.4 Wrap goal indicators with PulseWrapper
  - Wrap physical goal indicator in PulseWrapper with cyan color
  - Wrap mental goal indicator in PulseWrapper with purple color
  - Pass pulse state as isActive prop
  - _Requirements: 2.3, 2.4_

- [x] 5.5 Add celebration pulse for goal completion
  - Detect when physicalPoints >= physicalGoal
  - Detect when mentalPoints >= mentalGoal
  - Use 'celebration' intensity for completed goals
  - _Requirements: 2.5_

- [x] 6. Install and configure confetti library
  - Add canvas-confetti dependency and create confetti utility hook
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [x] 6.1 Install canvas-confetti package
  - Run npm install canvas-confetti
  - Install TypeScript types: npm install --save-dev @types/canvas-confetti
  - _Requirements: 3.1, 3.2_

- [x] 6.2 Create useConfetti hook
  - Create custom hook that wraps canvas-confetti library
  - Export functions for triggering overall and stat confetti
  - Handle cleanup and DOM removal after animation
  - _Requirements: 3.9, 3.10_

- [x] 6.3 Configure overall level-up confetti
  - Set particle count to 50
  - Set spread to 70 degrees
  - Set origin to center-top (y: 0.6)
  - Use gold/yellow colors (#f5c35f, #fcd587, #fff1ab)
  - Set duration to 3 seconds
  - _Requirements: 3.1, 3.3, 3.5, 3.6_

- [x] 6.4 Configure stat level-up confetti
  - Set particle count to 25
  - Set spread to 50 degrees
  - Calculate origin from stat orb position
  - Use stat theme color and lightened variant
  - Set duration to 3 seconds
  - _Requirements: 3.2, 3.4, 3.5, 3.7_

- [x] 7. Add confetti to overall level-ups
  - Trigger confetti animation when dog's overall level increases
  - _Requirements: 3.1, 3.3, 3.5, 3.6, 3.8, 3.9, 3.10_

- [x] 7.1 Detect overall level changes in Layout or Overview
  - Subscribe to dog profile query
  - Use useAnimationTrigger to detect dog.overallLevel changes
  - Skip animation on initial mount
  - _Requirements: 3.1, 5.3, 5.6_

- [x] 7.2 Trigger overall confetti
  - Call useConfetti hook's triggerOverallConfetti function
  - Pass gold/yellow color configuration
  - Ensure confetti renders full-screen
  - _Requirements: 3.1, 3.3, 3.5, 3.6_

- [x] 7.3 Ensure confetti appears for both users
  - Verify confetti triggers via Convex real-time subscription
  - Test that both users see confetti simultaneously
  - _Requirements: 3.8, 5.1_

- [x] 8. Add confetti to stat level-ups
  - Trigger localized confetti when individual stats level up
  - _Requirements: 3.2, 3.4, 3.5, 3.7, 3.8, 3.9, 3.10_

- [x] 8.1 Detect stat level changes in StatOrb
  - Use useAnimationTrigger to detect stat.level changes
  - Calculate stat orb center position
  - Skip animation on initial mount
  - _Requirements: 3.2, 5.3, 5.6_

- [x] 8.2 Trigger stat confetti
  - Call useConfetti hook's triggerStatConfetti function
  - Pass stat theme color and orb position
  - Ensure confetti bursts from orb location
  - _Requirements: 3.2, 3.4, 3.5, 3.7_

- [x] 8.3 Ensure confetti appears for both users
  - Verify confetti triggers via Convex real-time subscription
  - Test that both users see confetti simultaneously
  - _Requirements: 3.8, 5.1_

- [x] 9. Enhance partner activity toast notifications
  - Improve toast messages to show detailed stat breakdown and level-ups
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 9.1 Detect partner activities in Layout
  - Subscribe to activity feed query
  - Filter activities to find partner's activities (userId !== currentUserId)
  - Track previous activity IDs to detect new activities
  - _Requirements: 4.1, 4.7_

- [x] 9.2 Format toast message with stat breakdown
  - Extract partner name from activity
  - Extract activity name
  - Calculate total XP from stat gains
  - Format stat gains as "PHY +30, IMP +10"
  - Combine into readable message
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 9.3 Add level-up information to toast
  - Check if activity result includes level-up data
  - Append level-up information to toast message
  - Use celebration emoji for level-ups
  - _Requirements: 4.4_

- [x] 9.4 Style partner activity toasts
  - Use green accent color for partner toasts
  - Set duration to 4 seconds
  - Position at bottom center with vertical stacking
  - _Requirements: 4.5, 4.6, 4.8_

- [x] 10. Add URL parameter testing mode
  - Create a testing mode that allows triggering animations via URL parameters for easy testing
  - _Requirements: 5.1, 5.2_

- [x] 10.1 Create animation testing utility
  - Add URL parameter parsing in Layout component (e.g., ?testAnimation=floatingXP)
  - Support parameters: floatingXP, pulse, confetti, levelUp, partnerActivity
  - Add debug mode that shows animation triggers in console
  - _Requirements: 5.1, 5.2_

- [x] 10.2 Implement test animation triggers
  - When ?testAnimation=floatingXP is present, simulate XP gain on all stats
  - When ?testAnimation=pulse is present, trigger pulse on daily goals
  - When ?testAnimation=confetti is present, trigger overall confetti
  - When ?testAnimation=levelUp is present, simulate stat level-up with confetti
  - When ?testAnimation=partnerActivity is present, show partner toast
  - Allow combining multiple animations with comma separation (e.g., ?testAnimation=floatingXP,pulse)
  - _Requirements: 5.1, 5.2_

- [x] 10.3 Add testing controls UI
  - Add a hidden testing panel that appears when ?debug=true is in URL
  - Include buttons to trigger each animation type
  - Add sliders to control animation parameters (XP amount, confetti count, etc.)
  - Add toggle to enable/disable real-time animations
  - _Requirements: 5.1, 5.2_

- [x] 11. Optimize animation performance
  - Ensure all animations run at 60fps and handle edge cases
  - _Requirements: 5.1, 5.2, 5.7, 5.8_

- [x] 11.1 Use GPU-accelerated properties
  - Verify all animations use transform and opacity (not top/left)
  - Add will-change CSS hints for animated elements
  - Use translate3d for 3D hardware acceleration
  - _Requirements: 5.8_

- [x] 11.2 Implement animation throttling
  - Limit concurrent floating XP animations to 4 per stat
  - Debounce pulse animations to prevent stacking
  - Queue confetti if multiple level-ups occur simultaneously
  - _Requirements: 5.7_

- [x] 11.3 Add cleanup and error handling
  - Remove animation elements from DOM after completion
  - Add error boundaries around animation components
  - Handle missing element refs gracefully
  - Clear timeouts and intervals on unmount
  - _Requirements: 5.1, 5.2_

- [x] 11.4 Test animation synchronization
  - Verify animations trigger within 100ms across devices
  - Test with poor network conditions
  - Test with multiple simultaneous animations
  - Use Chrome DevTools Performance tab to verify 60fps
  - _Requirements: 5.1, 5.2, 5.7_
