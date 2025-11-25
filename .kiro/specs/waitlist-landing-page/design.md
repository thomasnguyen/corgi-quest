# Design Document

## Overview

The Corgi Quest waitlist landing page is a standalone marketing page at `/waitlist` that collects emails and implements a viral referral system. The design follows a dark mode aesthetic (dark gray and white) and is completely isolated from the existing application code. The backend uses Convex for real-time data management, and the frontend is built with TanStack Start and React.

## Architecture

### High-Level Flow

```
User visits /waitlist?ref=ABC123
    ↓
Frontend extracts ref parameter
    ↓
User submits email
    ↓
Convex mutation: joinWaitlist
    ↓
- Check for existing email
- Create new user or return existing
- Increment referrer's count if ref provided
- Grant earlyAccess if referralCount >= 1
    ↓
Return user data (position, referralCode, referralCount, earlyAccess)
    ↓
Frontend displays status + referral link
```

### Technology Stack

- **Frontend**: TanStack Start (React 18+, TypeScript)
- **Backend**: Convex (real-time database + mutations)
- **Styling**: Tailwind CSS (dark mode theme)
- **Icons**: lucide-react
- **Deployment**: Vercel (frontend) + Convex Cloud (backend)

## Components and Interfaces

### Frontend Components

#### 1. WaitlistPage Component (`src/routes/waitlist.tsx`)

Main route component that handles the entire waitlist experience.

```typescript
interface WaitlistPageProps {
  // Extracted from URL search params
  referralCode?: string;
}

interface WaitlistStatus {
  email: string;
  referralCode: string;
  referralCount: number;
  position: number;
  earlyAccess: boolean;
}
```

**Responsibilities:**
- Extract `ref` parameter from URL
- Manage email input state
- Call `joinWaitlist` mutation
- Display pre-signup and post-signup UI states
- Handle loading and error states

#### 2. WaitlistHero Component (`src/components/waitlist/WaitlistHero.tsx`)

Hero section with headline, subheadline, and email form.

```typescript
interface WaitlistHeroProps {
  onSubmit: (email: string) => Promise<void>;
  loading: boolean;
  error?: string;
}
```

**Content:**
- Headline: "Turn dog training into a daily quest"
- Subheadline: "Corgi Quest is a real-time training companion that turns walks, practice, and play into XP, streaks, and shared progress for your household."
- Email input + submit button
- Trust line: "Built by dog parents preparing their corgi for a baby. Free to join."
- Beta timeline: "Private beta starting January 2026"

#### 3. HowItWorks Component (`src/components/waitlist/HowItWorks.tsx`)

Three-step explanation of the product.

```typescript
interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}
```

**Steps:**
1. **Log what you already do** - "Walks, training sessions, puzzle toys – log them in seconds, or just talk to the mic."
2. **Watch your dog level up** - "Earn XP in INT, PHY, IMP, and SOC. Hit daily goals to keep streaks alive."
3. **Train together, not alone** - "You and your partner share one dog profile and see updates in real time."

#### 4. WhyDifferent Component (`src/components/waitlist/WhyDifferent.tsx`)

Differentiators section highlighting unique value props.

```typescript
interface Differentiator {
  title: string;
  description: string;
}
```

**Differentiators:**
1. "We're not another 'how to train your dog' course – we're the consistency engine."
2. "Designed for pairs/households, not just solo owners."
3. "Built around gamification – streaks, quests, stats – not dry checklists."

#### 5. WaitlistStatus Component (`src/components/waitlist/WaitlistStatus.tsx`)

Post-signup status display with referral tracking.

```typescript
interface WaitlistStatusProps {
  position: number;
  referralCount: number;
  referralCode: string;
  earlyAccess: boolean;
}
```

**Display:**
- Queue position: "You're #123 in line"
- Early access status: "Early Access Unlocked! 🎉" or "Invite 1 friend to unlock early access"
- Referral progress: "0 / 1 friends joined" or "1 / 1 friends joined"
- Referral link with copy button
- Share instructions

### Backend Components

#### Convex Schema (`convex/schema.ts`)

```typescript
waitlist_users: defineTable({
  email: v.string(),
  referralCode: v.string(),
  referredBy: v.optional(v.id("waitlist_users")),
  referralCount: v.number(),
  earlyAccess: v.boolean(),
  createdAt: v.number(),
})
  .index("by_email", ["email"])
  .index("by_referralCode", ["referralCode"])
```

**Field Descriptions:**
- `email`: User's email address (unique)
- `referralCode`: 6-character alphanumeric code for sharing
- `referredBy`: ID of the user who referred this user (optional)
- `referralCount`: Number of successful referrals (0 or 1 for early access)
- `earlyAccess`: Boolean flag indicating TestFlight eligibility
- `createdAt`: Timestamp for queue position calculation

#### Convex Mutations (`convex/waitlist.ts`)

##### joinWaitlist Mutation

```typescript
export const joinWaitlist = mutation({
  args: {
    email: v.string(),
    referredByCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Check for existing user by email
    // 2. If exists, return existing data
    // 3. If referredByCode provided, find referrer
    // 4. Create new user with generated referralCode
    // 5. If valid referrer found:
    //    - Increment referrer's referralCount
    //    - Set referrer's earlyAccess to true if count >= 1
    //    - Set new user's earlyAccess to true
    // 6. Calculate queue position
    // 7. Return user data
  },
});
```

**Return Type:**
```typescript
{
  id: Id<"waitlist_users">;
  email: string;
  referralCode: string;
  referralCount: number;
  position: number;
  earlyAccess: boolean;
}
```

#### Convex Queries (`convex/waitlist.ts`)

##### getWaitlistStats Query (Optional)

```typescript
export const getWaitlistStats = query({
  args: {},
  handler: async (ctx) => {
    // Return aggregate stats for admin dashboard
    // - Total signups
    // - Total with early access
    // - Average referrals per user
  },
});
```

## Data Models

### Waitlist User

```typescript
interface WaitlistUser {
  _id: Id<"waitlist_users">;
  _creationTime: number;
  email: string;
  referralCode: string;
  referredBy?: Id<"waitlist_users">;
  referralCount: number;
  earlyAccess: boolean;
  createdAt: number;
}
```

### Referral Code Generation

```typescript
function generateReferralCode(): string {
  // Generate 6-character alphanumeric code
  // Format: lowercase letters + numbers (e.g., "a3x9k2")
  // Collision probability is low with base36 encoding
  return Math.random().toString(36).slice(2, 8);
}
```

### Queue Position Calculation

```typescript
// Count all users created before this user
const aheadCount = await ctx.db
  .query("waitlist_users")
  .filter(q => q.lt(q.field("createdAt"), currentUser.createdAt))
  .collect();

const position = aheadCount.length + 1;
```

## Error Handling

### Frontend Error States

1. **Invalid Email**: Client-side validation using HTML5 `type="email"`
2. **Network Error**: Display "Something went wrong. Please try again."
3. **Mutation Error**: Display error message from Convex
4. **Loading State**: Disable form and show loading indicator

### Backend Error Handling

1. **Duplicate Email**: Return existing user data (not an error)
2. **Invalid Referral Code**: Silently ignore, create user without referrer
3. **Database Error**: Throw error, caught by Convex and returned to client

### Edge Cases

1. **User refreshes page after signup**: State is lost, they can re-enter email to see status
2. **Referral code doesn't exist**: User still joins waitlist, just without referrer attribution
3. **User refers themselves**: Prevented by checking if referredByCode matches their own code
4. **Concurrent referrals**: Convex handles atomicity, no race conditions

## UI/UX Design

### Color Scheme (Dark Mode)

```css
Background: #0a0a0a (near black)
Surface: #1a1a1a (dark gray)
Border: #2a2a2a (medium gray)
Text Primary: #ffffff (white)
Text Secondary: #a3a3a3 (light gray)
Accent: #ffffff (white borders/highlights)
Success: #22c55e (green for early access)
```

### Typography

- **Headline**: 3xl-4xl, font-bold, tracking-tight
- **Subheadline**: lg-xl, font-normal, text-gray-400
- **Body**: base, font-normal, text-gray-300
- **Small**: sm-xs, text-gray-500

### Layout Structure

```
┌─────────────────────────────────────┐
│           Hero Section              │
│  - Headline                         │
│  - Subheadline                      │
│  - Email Form (if not signed up)    │
│  - Status Card (if signed up)       │
│  - Trust line                       │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│        How It Works Section         │
│  - 3 cards in grid                  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│       Why Different Section         │
│  - 3 bullet points                  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│            Footer                   │
│  - Copyright                        │
│  - Links (optional)                 │
└─────────────────────────────────────┘
```

### Responsive Design

- **Mobile**: Single column, max-w-md, px-4
- **Tablet**: Same as mobile (optimized for mobile-first)
- **Desktop**: Centered, max-w-2xl, larger text

### Animations

- **Form Submit**: Button shows loading spinner
- **Success State**: Fade in status card with slide-up animation
- **Copy Button**: Brief "Copied!" feedback
- **Early Access Unlock**: Confetti or celebration animation (optional)

## Testing Strategy

### Unit Tests

1. **generateReferralCode()**: Verify 6-character output, uniqueness
2. **Queue position calculation**: Test with multiple users
3. **Early access logic**: Test referral count triggers

### Integration Tests

1. **joinWaitlist mutation**:
   - New user signup
   - Existing user returns same data
   - Referral attribution works
   - Referrer count increments
   - Early access granted correctly

2. **Frontend form**:
   - Email validation
   - Submission flow
   - Error handling
   - Status display

### Manual Testing Checklist

- [ ] Visit `/waitlist` without ref parameter
- [ ] Submit email and verify status display
- [ ] Copy referral link
- [ ] Open referral link in incognito window
- [ ] Verify ref parameter is captured
- [ ] Submit second email with ref
- [ ] Verify both users get early access
- [ ] Verify referral count updates
- [ ] Test with invalid email format
- [ ] Test with duplicate email
- [ ] Test mobile responsive design
- [ ] Test copy-to-clipboard functionality

## Future Enhancements (Out of Scope)

1. **HubSpot Integration**: Sync emails to HubSpot for drip campaigns
2. **Admin Dashboard**: View all waitlist users, export CSV
3. **Email Notifications**: Send confirmation and early access emails
4. **Social Sharing**: Pre-filled tweets, iMessage deep links
5. **Analytics**: Track conversion rates, referral sources
6. **A/B Testing**: Test different copy and CTAs
7. **Tiered Rewards**: 1/3/10 referrals unlock different perks

## Security Considerations

1. **Email Validation**: Server-side validation in Convex mutation
2. **Rate Limiting**: Convex handles this automatically
3. **No PII Exposure**: Referral codes don't reveal email addresses
4. **HTTPS Only**: Enforced by Vercel deployment
5. **No Authentication Required**: Public waitlist page

## Performance Considerations

1. **Optimistic Updates**: Show loading state immediately
2. **Index Usage**: Queries use `by_email` and `by_referralCode` indexes
3. **Minimal Bundle Size**: Only load waitlist components on `/waitlist` route
4. **Image Optimization**: No images in v1 (text-only design)
5. **Real-time Subscriptions**: Not needed for waitlist (mutation-only)

## Deployment Strategy

1. **Convex Schema**: Deploy schema changes first
2. **Frontend**: Deploy `/waitlist` route (no impact on existing routes)
3. **Testing**: Verify in production with test emails
4. **Monitoring**: Watch Convex dashboard for errors
5. **Rollback**: Remove route file if issues arise (backend data persists)
