# Requirements Document

## Introduction

A dedicated hackathon landing page for Corgi Quest designed to showcase the project to Kiroween judges. The page emphasizes the live demo experience, demo video walkthrough, and technical implementation details (especially Kiro integration). The landing page lives on a separate route from the main application and directs judges to a pre-configured test account for immediate hands-on experience.

## Glossary

- **Landing Page**: A standalone marketing page at `/hackathon` route showcasing Corgi Quest for judges
- **Demo Account**: Pre-seeded test account with real Bumi training data for judge evaluation
- **Hero Section**: The above-the-fold content containing headline, CTAs, and primary visual
- **Tech Stack Section**: Visual display of technologies used, with emphasis on Kiro integration
- **Feature Grid**: Organized display of core product features with icons and descriptions
- **Vision Pro HUD**: visionOS companion app showing real-time training data

## Requirements

### Requirement 1

**User Story:** As a hackathon judge, I want to immediately launch the live demo, so that I can experience Corgi Quest hands-on without friction.

#### Acceptance Criteria

1. WHEN a judge visits the landing page THEN the System SHALL display a prominent "Launch Demo (Auto-Login)" button in the hero section
2. WHEN a judge clicks the "Launch Demo" button THEN the System SHALL navigate to the main application with the test account pre-authenticated
3. WHEN the demo loads THEN the System SHALL display real Bumi training data including activities, stats, and cosmetics
4. WHEN a judge needs backup access THEN the System SHALL display test account credentials in a testing instructions section
5. WHEN the page loads THEN the System SHALL optimize all images and assets for fast loading to prevent judge frustration

### Requirement 2

**User Story:** As a hackathon judge, I want to watch a demo video walkthrough, so that I can understand the product flow before trying it myself.

#### Acceptance Criteria

1. WHEN a judge visits the landing page THEN the System SHALL display a "Watch Demo" button in the hero section
2. WHEN a judge clicks "Watch Demo" THEN the System SHALL display an embedded 2-3 minute demo video
3. WHEN the video section displays THEN the System SHALL include a caption explaining key features judges should notice
4. WHEN the video plays THEN the System SHALL ensure smooth playback without buffering delays
5. WHEN the video ends THEN the System SHALL provide a clear CTA to launch the live demo

### Requirement 3

**User Story:** As a hackathon judge, I want to understand the core value propositions, so that I can quickly grasp what makes Corgi Quest unique.

#### Acceptance Criteria

1. WHEN a judge scrolls past the hero THEN the System SHALL display three core value highlights with icons
2. WHEN displaying value highlights THEN the System SHALL include "Real-Time Couples Sync" as the first highlight
3. WHEN displaying value highlights THEN the System SHALL include "AI Voice Coach Mode" as the second highlight
4. WHEN displaying value highlights THEN the System SHALL include "Vision Pro Training HUD" as the third highlight
5. WHEN each highlight displays THEN the System SHALL include a concise description under 50 words

### Requirement 4

**User Story:** As a hackathon judge, I want to see how the system works technically, so that I can evaluate the architecture and implementation.

#### Acceptance Criteria

1. WHEN a judge views the "How It Works" section THEN the System SHALL display three sequential steps
2. WHEN displaying step 1 THEN the System SHALL explain "Log session (voice/text)" with visual indicator
3. WHEN displaying step 2 THEN the System SHALL explain "Claude → XP Engine" with visual indicator
4. WHEN displaying step 3 THEN the System SHALL explain "Convex real-time sync" with visual indicator
5. WHEN the section displays THEN the System SHALL use judge-focused language emphasizing technical implementation

### Requirement 5

**User Story:** As a hackathon judge, I want to see Kiro's role in development, so that I can evaluate the Kiro integration for the Kiroween hackathon.

#### Acceptance Criteria

1. WHEN a judge views the tech stack section THEN the System SHALL prominently display Kiro usage with visual emphasis
2. WHEN displaying Kiro integration THEN the System SHALL list "Specs, Steering, Hooks, Vibe Coding" as specific features used
3. WHEN displaying the tech stack THEN the System SHALL show logos for Kiro, Convex, Claude, TanStack, visionOS, Firecrawl, and DALL·E
4. WHEN logos display THEN the System SHALL use subtle color-coding or icons to emphasize Kiro usage
5. WHEN the section renders THEN the System SHALL maintain visual hierarchy with Kiro as a primary technology

### Requirement 6

**User Story:** As a hackathon judge, I want to see real training data from Bumi, so that I can understand the emotional motivation and real-world usage.

#### Acceptance Criteria

1. WHEN a judge views the real training data section THEN the System SHALL display screenshots with actual Bumi training logs
2. WHEN screenshots display THEN the System SHALL show authentic activity entries, XP gains, and stat progression
3. WHEN the section renders THEN the System SHALL include a short emotional note about training Bumi
4. WHEN the emotional note displays THEN the System SHALL be under 100 words and convey genuine motivation
5. WHEN images load THEN the System SHALL optimize screenshots for fast rendering without quality loss

### Requirement 7

**User Story:** As a hackathon judge, I want to browse all features quickly, so that I can understand the full scope of the product.

#### Acceptance Criteria

1. WHEN a judge views the feature grid THEN the System SHALL display features in a scannable grid layout
2. WHEN the grid displays THEN the System SHALL include Voice Logging, Coach Mode, Goals/Streaks, Quests, and Cosmetics
3. WHEN each feature displays THEN the System SHALL include an icon and brief description
4. WHEN the grid renders THEN the System SHALL use consistent spacing and visual hierarchy
5. WHEN on mobile THEN the System SHALL stack features vertically for readability

### Requirement 8

**User Story:** As a hackathon judge, I want to see the Vision Pro integration, so that I can evaluate the multi-platform implementation.

#### Acceptance Criteria

1. WHEN a judge views the Vision Pro section THEN the System SHALL display a large HUD screenshot
2. WHEN the screenshot displays THEN the System SHALL show real-time training data visible in the visionOS app
3. WHEN the section renders THEN the System SHALL include a short caption about real-time use during training
4. WHEN the caption displays THEN the System SHALL be under 50 words
5. WHEN the image loads THEN the System SHALL optimize for fast rendering while maintaining clarity

### Requirement 9

**User Story:** As a hackathon judge, I want clear testing instructions, so that I can evaluate the product without technical barriers.

#### Acceptance Criteria

1. WHEN a judge views the testing instructions section THEN the System SHALL display the "Launch Demo" auto-login option prominently
2. WHEN backup credentials are needed THEN the System SHALL display test account username and password
3. WHEN instructions display THEN the System SHALL explain what judges should test (voice logging, real-time sync, cosmetics)
4. WHEN the section renders THEN the System SHALL use clear, numbered steps for easy scanning
5. WHEN on mobile THEN the System SHALL ensure credentials are easily copyable

### Requirement 10

**User Story:** As a hackathon judge, I want to access the demo and source code, so that I can evaluate both the product and implementation.

#### Acceptance Criteria

1. WHEN a judge reaches the end of the page THEN the System SHALL display a final CTA section
2. WHEN the CTA section displays THEN the System SHALL include a "Launch Demo" button
3. WHEN the CTA section displays THEN the System SHALL include a "View GitHub" link
4. WHEN the GitHub link is clicked THEN the System SHALL open the repository in a new tab
5. WHEN the section renders THEN the System SHALL use high-contrast styling to draw attention

### Requirement 11

**User Story:** As a hackathon judge, I want the landing page to load quickly, so that I can evaluate the project without frustration.

#### Acceptance Criteria

1. WHEN a judge visits the landing page THEN the System SHALL load the hero section within 2 seconds
2. WHEN images load THEN the System SHALL use optimized formats (WebP, AVIF) with fallbacks
3. WHEN the page renders THEN the System SHALL lazy-load below-the-fold content
4. WHEN videos embed THEN the System SHALL use lazy loading and thumbnail previews
5. WHEN on mobile THEN the System SHALL serve appropriately sized images for the viewport

### Requirement 13

**User Story:** As a hackathon judge, I want the landing page to match the main app's visual style, so that I experience a cohesive brand identity.

#### Acceptance Criteria

1. WHEN the landing page renders THEN the System SHALL use the dark background color #121216 or #0a0a0a
2. WHEN text displays THEN the System SHALL use the cream/golden color palette (#feefd0, #fcd587, #f5c35f, #f9dca0)
3. WHEN buttons render THEN the System SHALL use the golden accent color #f5c35f with appropriate hover states
4. WHEN sections display THEN the System SHALL maintain the minimalist black and white aesthetic from the main app
5. WHEN the page loads THEN the System SHALL use consistent typography and spacing with the main application

### Requirement 12

**User Story:** As a hackathon judge, I want the landing page to be mobile-friendly, so that I can evaluate it on any device.

#### Acceptance Criteria

1. WHEN a judge visits on mobile THEN the System SHALL display a responsive layout with max-w-4xl container
2. WHEN on mobile THEN the System SHALL stack sections vertically with appropriate spacing
3. WHEN CTAs display on mobile THEN the System SHALL use full-width buttons with minimum 44px touch targets
4. WHEN images display on mobile THEN the System SHALL scale appropriately without horizontal scrolling
5. WHEN the page renders on mobile THEN the System SHALL maintain readability with appropriate font sizes
