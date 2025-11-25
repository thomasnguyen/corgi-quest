# Implementation Plan

- [x] 1. Set up Convex backend for waitlist
  - Add `waitlist_users` table to Convex schema with email, referralCode, referredBy, referralCount, earlyAccess, and createdAt fields
  - Create indexes for email and referralCode lookups
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2. Implement waitlist mutation logic
  - [x] 2.1 Create `convex/waitlist.ts` file with joinWaitlist mutation
    - Implement email duplicate detection using by_email index
    - Generate 6-character alphanumeric referral codes
    - Handle referral attribution by looking up referredByCode
    - _Requirements: 1.2, 1.3, 3.1, 3.5_
  
  - [x] 2.2 Implement referral count and early access logic
    - Increment referrer's referralCount when new user joins via their link
    - Set earlyAccess to true for both users when referralCount reaches 1
    - Store referral relationship in referredBy field
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 2.3 Implement queue position calculation
    - Count users created before current user based on createdAt timestamp
    - Return position as count + 1
    - _Requirements: 1.4, 2.1_

- [x] 3. Create waitlist page route
  - [x] 3.1 Create `src/routes/waitlist.tsx` route file
    - Set up TanStack Start route with URL parameter handling
    - Extract `ref` parameter from URL search params
    - Implement form state management for email input
    - _Requirements: 7.1, 3.4_
  
  - [x] 3.2 Integrate Convex mutation in route component
    - Use useMutation hook from convex/react for joinWaitlist
    - Handle loading, success, and error states
    - Store waitlist status in component state after successful signup
    - _Requirements: 1.1, 1.5_

- [x] 4. Build waitlist UI components
  - [x] 4.1 Create WaitlistHero component
    - Implement hero section with headline and subheadline
    - Build email input form with validation
    - Add submit button with loading state
    - Include trust line and beta timeline messaging
    - _Requirements: 6.1, 6.2, 1.1_
  
  - [x] 4.2 Create HowItWorks component
    - Build 3-step grid layout with icons from lucide-react
    - Add step titles and descriptions
    - Style with dark mode colors (dark gray background, white text)
    - _Requirements: 6.3_
  
  - [x] 4.3 Create WhyDifferent component
    - Display 3 differentiator bullets
    - Style as cards or list items with dark mode theme
    - _Requirements: 6.4_
  
  - [x] 4.4 Create WaitlistStatus component
    - Display queue position number
    - Show referral progress (X / 1 friends joined)
    - Display early access status with conditional messaging
    - Build referral link display with copy-to-clipboard button
    - Implement clipboard copy functionality
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 3.3_

- [x] 5. Apply dark mode styling
  - [x] 5.1 Implement Tailwind dark mode color scheme
    - Use dark gray (#0a0a0a, #1a1a1a) for backgrounds
    - Use white and light gray for text
    - Add white borders and accents
    - Apply green color for early access success state
    - _Requirements: 6.5_
  
  - [x] 5.2 Make layout responsive
    - Use max-w-md for mobile-first design
    - Center content with mx-auto
    - Add appropriate padding (px-4)
    - Ensure all components work on mobile screens
    - _Requirements: 6.5_

- [x] 6. Add error handling and edge cases
  - Implement client-side email validation
  - Display error messages for network failures
  - Handle duplicate email gracefully (show existing status)
  - Silently handle invalid referral codes
  - Add loading states to prevent double submissions
  - _Requirements: 1.3_

- [x] 7. Verify isolation from existing code
  - Confirm no modifications to existing route files (index.tsx, quests.tsx, etc.)
  - Confirm no modifications to existing Convex tables (users, households, dogs, etc.)
  - Verify waitlist components are in separate directory
  - Test that existing app functionality is unaffected
  - _Requirements: 7.2, 7.3, 7.4, 7.5_
