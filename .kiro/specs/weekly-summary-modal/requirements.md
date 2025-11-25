# Requirements Document

## Introduction

The Weekly Summary Modal provides Corgi Quest users with a comprehensive recap of their dog's training progress over the past 7 days. The feature celebrates consistency, highlights achievements, and delivers personalized recommendations to encourage continued engagement and improvement.

## Glossary

- **System**: The Corgi Quest application
- **User**: A dog owner using the Corgi Quest application
- **Weekly Summary**: An aggregated view of training data from the past 7 days
- **Modal**: A dialog overlay that displays the weekly summary
- **Dismissal**: The action of closing the modal and marking it as viewed for the current week
- **Firecrawl Tips**: AI-generated training recommendations stored in the database
- **Streak**: Consecutive days where both Physical and Mental daily goals were met
- **Partner**: Another user in the same household who logs activities for the shared dog
- **Activity**: A logged training session or interaction with the dog
- **Stat**: One of the four core metrics (Physical, Mental, Social, Emotional)

## Requirements

### Requirement 1

**User Story:** As a dog owner, I want to see a weekly recap of my dog's training progress, so that I can celebrate achievements and understand patterns in our training routine.

#### Acceptance Criteria

1. WHEN the current day is Sunday after 6 PM or Monday before 10 AM, THE System SHALL display the Weekly Summary Modal automatically
2. WHEN the User has not dismissed the Weekly Summary Modal for the current week, THE System SHALL show the modal upon app launch
3. THE System SHALL aggregate data from the past 7 calendar days (Monday through Sunday)
4. THE System SHALL display total activities logged, total XP gained, levels gained, and days goals were met
5. THE System SHALL calculate all metrics in real-time using Convex subscriptions

### Requirement 2

**User Story:** As a dog owner, I want to manually access my weekly summary, so that I can review my progress at any time.

#### Acceptance Criteria

1. THE System SHALL provide a "View Weekly Summary" button accessible from the Overview or Activity page
2. WHEN the User clicks the "View Weekly Summary" button, THE System SHALL display the Weekly Summary Modal with current week data
3. THE System SHALL allow the User to view the summary regardless of dismissal state

### Requirement 3

**User Story:** As a dog owner, I want to see my current training streak, so that I can stay motivated to maintain consistency.

#### Acceptance Criteria

1. THE System SHALL display the current streak count in the Weekly Summary Modal
2. THE System SHALL calculate streak as consecutive days where both Physical and Mental goals were met
3. THE System SHALL display the longest streak achieved as a secondary metric
4. WHEN no streak exists, THE System SHALL display "0 days" for current streak

### Requirement 4

**User Story:** As a dog owner, I want to see which activities I did most frequently, so that I can understand my training patterns.

#### Acceptance Criteria

1. THE System SHALL identify and display the most frequently logged activity name and count
2. THE System SHALL calculate and display the total number of unique activity types logged
3. THE System SHALL sum and display the total activity time in hours and minutes
4. WHEN no activities exist for the week, THE System SHALL display an encouraging message

### Requirement 5

**User Story:** As a dog owner, I want to see which stats improved the most, so that I can understand where my dog is progressing.

#### Acceptance Criteria

1. THE System SHALL identify and display the stat with the highest level this week
2. THE System SHALL identify and display the stat with the most XP gained this week
3. THE System SHALL calculate stat progress by comparing current values to week-ago values
4. THE System SHALL display stat type and corresponding metrics for each highlight

### Requirement 6

**User Story:** As a dog owner, I want to see personalized training tips, so that I can improve my training approach.

#### Acceptance Criteria

1. THE System SHALL display 1 to 2 Firecrawl tips in the Weekly Summary Modal
2. THE System SHALL retrieve tips from the firecrawl_tips table
3. THE System SHALL display each tip with its title and description
4. WHEN no tips are available, THE System SHALL hide the Firecrawl Tips section

### Requirement 7

**User Story:** As a dog owner, I want to see my dog's mood trends, so that I can understand their emotional well-being over time.

#### Acceptance Criteria

1. WHERE mood logging is enabled, THE System SHALL display mood insights in the Weekly Summary Modal
2. THE System SHALL display mood insights only when at least 3 mood logs exist for the week
3. THE System SHALL identify and display the most common mood type
4. THE System SHALL calculate and display a mood trend indicator (improving, stable, or needs attention)
5. WHEN fewer than 3 mood logs exist, THE System SHALL hide the Mood Insights section

### Requirement 8

**User Story:** As a dog owner in a multi-user household, I want to see how my partner and I contributed to training, so that we can celebrate our teamwork.

#### Acceptance Criteria

1. WHERE the household has 2 or more users, THE System SHALL display partner contribution metrics
2. THE System SHALL display the number of activities logged by the current user
3. THE System SHALL display the number of activities logged by the partner with their name
4. THE System SHALL display a collaborative achievement message
5. WHEN the household has only 1 user, THE System SHALL hide the Partner Contribution section

### Requirement 9

**User Story:** As a dog owner, I want to dismiss the weekly summary after viewing it, so that it doesn't appear again until next week.

#### Acceptance Criteria

1. THE System SHALL provide a close button (X) and a "Got it" button to dismiss the modal
2. WHEN the User dismisses the modal, THE System SHALL store the dismissal timestamp
3. THE System SHALL not display the modal again until the next week's time window
4. THE System SHALL persist dismissal state using Convex mutations
5. WHEN both partners dismiss the modal, THE System SHALL sync dismissal state in real-time

### Requirement 10

**User Story:** As a dog owner, I want the weekly summary to update in real-time, so that I see the most current data while viewing it.

#### Acceptance Criteria

1. THE System SHALL use Convex subscriptions to fetch weekly summary data
2. WHEN activities are logged while the modal is open, THE System SHALL update the displayed metrics in real-time
3. THE System SHALL not use polling or manual refetching for data updates
4. THE System SHALL display a loading state while data is being fetched
5. WHEN data fetch fails, THE System SHALL display a user-friendly error message

### Requirement 11

**User Story:** As a dog owner using a mobile device, I want the weekly summary to be easy to read and navigate, so that I can quickly review my progress.

#### Acceptance Criteria

1. THE System SHALL display the modal in a mobile-first responsive layout
2. THE System SHALL constrain the modal to a maximum width of medium (max-w-md)
3. THE System SHALL make the modal content scrollable when it exceeds viewport height
4. THE System SHALL apply consistent 16px padding throughout the modal
5. THE System SHALL use 8px spacing between list items and 16px spacing between sections

### Requirement 12

**User Story:** As a dog owner using assistive technology, I want the weekly summary to be accessible, so that I can navigate and understand the content.

#### Acceptance Criteria

1. THE System SHALL trap focus within the modal when it is open
2. THE System SHALL make the close button keyboard accessible
3. WHEN the User presses the ESC key, THE System SHALL close the modal
4. THE System SHALL ensure all text meets WCAG AA contrast ratios
5. THE System SHALL provide screen reader announcements for key metrics

### Requirement 13

**User Story:** As a dog owner who just started using the app, I want to see an encouraging message when I have no activities yet, so that I feel motivated to start logging.

#### Acceptance Criteria

1. WHEN no activities exist for the week, THE System SHALL display the message "Start logging activities to see your weekly summary!"
2. THE System SHALL still display Firecrawl tips when available
3. THE System SHALL hide activity-dependent sections when no activities exist
4. THE System SHALL maintain the modal structure with visible sections that have data
