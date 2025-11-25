# Requirements Document

## Introduction

This feature implements a viral waitlist landing page for Corgi Quest at the `/waitlist` route. The page allows users to join a waitlist with a referral system where inviting 1 friend grants both users instant early access. The implementation includes a dark mode marketing page, Convex backend for waitlist management, and real-time referral tracking.

## Glossary

- **Waitlist System**: The backend and frontend components that manage user signups and queue position
- **Referral Code**: A unique alphanumeric string assigned to each waitlist user for tracking referrals
- **Early Access Status**: A boolean flag indicating whether a user has unlocked early access by successfully referring 1 friend
- **Queue Position**: The user's numerical position in the waitlist based on signup timestamp
- **Referral Link**: A URL containing a referral code parameter that attributes new signups to the referring user

## Requirements

### Requirement 1

**User Story:** As a potential user, I want to join the Corgi Quest waitlist by providing my email, so that I can be notified when the product launches.

#### Acceptance Criteria

1. WHEN a user navigates to `/waitlist`, THE Waitlist System SHALL display an email input form with a submit button
2. WHEN a user submits a valid email address, THE Waitlist System SHALL create a new waitlist entry with a unique referral code
3. WHEN a user submits an email that already exists in the waitlist, THE Waitlist System SHALL return the existing user's waitlist information without creating a duplicate
4. WHEN a waitlist entry is created, THE Waitlist System SHALL assign a queue position based on the creation timestamp
5. WHEN a user successfully joins the waitlist, THE Waitlist System SHALL display their queue position and referral link

### Requirement 2

**User Story:** As a waitlist member, I want to see my position in the queue and referral progress, so that I understand my status and how to unlock early access.

#### Acceptance Criteria

1. WHEN a user joins the waitlist, THE Waitlist System SHALL display their numerical queue position
2. WHEN a user joins the waitlist, THE Waitlist System SHALL display their referral count as "0 / 1 friends joined"
3. WHEN a user's referral count reaches 1, THE Waitlist System SHALL update the display to show "1 / 1 friends joined"
4. WHEN a user unlocks early access, THE Waitlist System SHALL display a visual indicator confirming early access status
5. THE Waitlist System SHALL display the user's unique referral link with a copy-to-clipboard button

### Requirement 3

**User Story:** As a waitlist member, I want to share my referral link with friends, so that both of us can unlock early access when they join.

#### Acceptance Criteria

1. WHEN a user joins the waitlist, THE Waitlist System SHALL generate a unique referral code containing 6 alphanumeric characters
2. WHEN a user views their waitlist status, THE Waitlist System SHALL display a referral URL in the format `{origin}/waitlist?ref={referralCode}`
3. WHEN a user clicks the copy button, THE Waitlist System SHALL copy the referral link to the system clipboard
4. WHEN a new user visits the waitlist page with a `ref` URL parameter, THE Waitlist System SHALL extract and store the referral code
5. WHEN a new user submits the waitlist form with a valid referral code, THE Waitlist System SHALL attribute the signup to the referring user

### Requirement 4

**User Story:** As a referring user, I want both myself and my friend to instantly unlock early access when they join using my link, so that we can both access the product sooner.

#### Acceptance Criteria

1. WHEN a referred user successfully joins the waitlist, THE Waitlist System SHALL increment the referrer's referral count by 1
2. WHEN a user's referral count changes from 0 to 1, THE Waitlist System SHALL set their early access status to true
3. WHEN a referred user joins via a valid referral link, THE Waitlist System SHALL set their early access status to true immediately
4. WHEN a user has early access status, THE Waitlist System SHALL display "Early Access Unlocked!" message
5. THE Waitlist System SHALL store the referral relationship by recording the referrer's ID in the referred user's record

### Requirement 5

**User Story:** As a product owner, I want the waitlist data stored in Convex with proper indexing, so that I can efficiently query and manage waitlist members.

#### Acceptance Criteria

1. THE Waitlist System SHALL create a `waitlist_users` table in the Convex schema
2. THE Waitlist System SHALL store email, referralCode, referredBy, referralCount, earlyAccess, and createdAt fields for each user
3. THE Waitlist System SHALL create an index on the email field for duplicate detection
4. THE Waitlist System SHALL create an index on the referralCode field for referral link lookups
5. THE Waitlist System SHALL use `v.id("waitlist_users")` validation for the referredBy field

### Requirement 6

**User Story:** As a visitor, I want to see compelling product information on the waitlist page, so that I understand what Corgi Quest offers before joining.

#### Acceptance Criteria

1. THE Waitlist System SHALL display a hero section with headline "Turn dog training into a daily quest"
2. THE Waitlist System SHALL display a subheadline explaining the real-time training companion concept
3. THE Waitlist System SHALL display a "How It Works" section with 3 steps: log activities, watch dog level up, train together
4. THE Waitlist System SHALL display a "Why It's Different" section with 3 differentiators: consistency engine, household design, gamification
5. THE Waitlist System SHALL use dark gray and white color scheme for dark mode aesthetic

### Requirement 7

**User Story:** As a developer, I want the waitlist implementation to be isolated from existing code, so that it doesn't interfere with the current application.

#### Acceptance Criteria

1. THE Waitlist System SHALL create a new route file at `src/routes/waitlist.tsx`
2. THE Waitlist System SHALL create new Convex functions in a separate `convex/waitlist.ts` file
3. THE Waitlist System SHALL NOT modify existing route files
4. THE Waitlist System SHALL NOT modify existing Convex schema tables (users, households, dogs, etc.)
5. THE Waitlist System SHALL create waitlist-specific components in a new `src/components/waitlist/` directory
