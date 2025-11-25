# Implementation Plan

- [x] 1. Create backend query for weekly summary data
  - Create `getWeeklySummary` query in `convex/queries.ts`
  - Implement data aggregation logic for activities, XP, levels, goals, streaks
  - Implement activity breakdown calculations (top activity, variety, time)
  - Implement stat progress calculations (highest stat, most improved)
  - Implement conditional mood insights (only if 3+ mood logs)
  - Implement conditional partner contribution (only if 2+ users)
  - Integrate Firecrawl tips from existing cache
  - Add helper function `getWeekDates()` for date range generation
  - _Requirements: 1.3, 1.4, 3.1, 3.2, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 10.1, 10.2_

- [x] 2. Create date utility functions
  - Create `src/lib/dateUtils.ts` file
  - Implement `getWeekDateRange()` function to calculate Monday-Sunday range
  - Implement `formatWeekRange()` function for display formatting
  - _Requirements: 1.3_

- [x] 3. Create useWeeklySummary hook
  - Create `src/hooks/useWeeklySummary.ts` file
  - Implement time window detection (Sunday 6 PM - Monday 10 AM)
  - Implement localStorage dismissal state checking
  - Return `shouldShowModal`, `weekStartDate`, `weekEndDate`
  - _Requirements: 1.1, 1.2, 9.2, 9.3_

- [x] 4. Create WeeklySummaryModal component structure
  - Create `src/components/summary/WeeklySummaryModal.tsx` file
  - Set up component props interface
  - Implement Convex query subscription using `useQuery`
  - Implement loading state UI
  - Implement error state UI
  - Implement empty state UI (no activities)
  - Implement dismissal handler with localStorage
  - use full screen
  - have a X exit button at the top right
  - _Requirements: 1.4, 1.5, 9.1, 9.2, 9.4, 10.1, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 11.5, 13.1, 13.2, 13.3, 13.4_

- [x] 5. Implement modal sections
- [x] 5.1 Create Header section
  - Display week date range using `formatWeekRange()`
  - Add close button (X) with click handler
  - Style with black/white theme
  - _Requirements: 1.4, 9.1, 11.1, 11.4, 11.5_

- [x] 5.2 Create WeeklyStats section
  - Display total activities logged
  - Display total XP gained
  - Display levels gained (overall)
  - Display days goals met (out of 7)
  - Style as compact list with icons
  - _Requirements: 1.4, 11.1, 11.4, 11.5_

- [x] 5.3 Create StreakHighlights section
  - Display current streak with fire emoji
  - Display longest streak as secondary metric
  - Style with emphasis on current streak
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 11.1, 11.4, 11.5_

- [x] 5.4 Create ActivityBreakdown section
  - Display top activity name and count
  - Display activity variety (unique types)
  - Display total activity time in hours and minutes
  - Style as compact list
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 11.1, 11.4, 11.5_

- [x] 5.5 Create StatProgress section
  - Display highest stat type and level
  - Display most improved stat type and XP gained
  - Style with stat type labels (INT, PHY, IMP, SOC)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 11.1, 11.4, 11.5_

- [x] 5.6 Create MoodInsights section (conditional)
  - Check if `moodInsights` exists in data
  - Display most common mood type
  - Display mood trend indicator with emoji
  - Only render if data exists
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 11.1, 11.4, 11.5_

- [x] 5.7 Create PartnerContribution section (conditional)
  - Check if `partnerContribution` exists in data
  - Display current user's activity count
  - Display partner's activity count with name
  - Display collaborative achievement message
  - Only render if data exists
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 11.1, 11.4, 11.5_

- [x] 5.8 Create FirecrawlTips section
  - Display 1-2 tips from data
  - Show tip title and description in card format
  - Style as bordered cards
  - Handle empty tips array gracefully
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 11.1, 11.4, 11.5_

- [x] 5.9 Create Footer section
  - Add "Got it" button
  - Wire button to dismissal handler
  - Style as primary action button
  - _Requirements: 9.1, 9.2, 11.1, 11.4, 11.5_

- [x] 6. Integrate modal into Layout
  - Import `useWeeklySummary` hook in Layout component
  - Import `WeeklySummaryModal` component
  - Add state for modal open/close
  - Wire up automatic display based on `shouldShowModal`
  - Add query parameter support for testing (`?showWeeklySummary=true`)
  - Pass `dogId` from `useSelectedCharacter` hook
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3_

- [x] 7. Add accessibility features
  - Add focus trap to modal (use existing modal patterns)
  - Add ESC key handler to close modal
  - Add ARIA attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`)
  - Ensure keyboard navigation works for all interactive elements
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 8. Add manual trigger button (optional)
  - Add "View Weekly Summary" button to Overview page
  - Wire button to open modal state
  - Style as secondary action button
  - _Requirements: 2.1, 2.2, 2.3_
