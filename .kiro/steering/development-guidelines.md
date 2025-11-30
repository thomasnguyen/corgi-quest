# Corgi Quest Development Guidelines

## Tech Stack Requirements
- TanStack Start (file-based routing in src/routes/)
- Convex for real-time backend (all backend code in convex/ folder)
- React with Hooks only
- Tailwind CSS (core utilities only)
- TypeScript for all files

## Convex Patterns (CRITICAL)
- ALWAYS use useQuery from "convex/react" for data subscriptions
- ALWAYS use useMutation from "convex/react" for mutations
- All Convex functions go in convex/ folder
- Use convex/server for defining functions
- Use v.id("tableName") for ID validation
- Never use fetch() to call Convex - use hooks

## File Structure
- Routes: src/routes/*.tsx
- Components: src/components/*.tsx
- Hooks: src/hooks/*.ts
- Utilities: src/lib/*.ts
- Convex backend: convex/*.ts
- Convex schema: convex/schema.ts

## Component Patterns
- Functional components only with TypeScript
- Use proper TypeScript types for all props

## Real-Time Requirements (MOST IMPORTANT)
- All data must update in real-time using Convex subscriptions
- NO polling, NO manual refetching
- When one user logs activity, other user sees it instantly
- Use optimistic updates where appropriate

## Database Schema
Follow the exact schema:
- 18 tables: users, households, dogs, dog_stats, activities, activity_stat_gains, daily_goals, streaks, presence, mood_logs, ai_recommendations, firecrawl_tips, cosmetic_items, equipped_items, newly_unlocked_items, quests, waitlist_users, updates_subscribers
- Use Convex validators (v.object, v.string, v.number, v.id, etc.)

## UI/UX Requirements
- Mobile-first design (max-w-md mx-auto)
- Bottom navigation (3 tabs: OVERVIEW, QUESTS, ACTIVITY)
- LOG ACTIVITY button above bottom nav
- Top resource bar with TODAY stats
- Centered dog name with level badge
- RPG theme with dynamic backgrounds based on equipped cosmetics
- Cosmetic transformations via AI-generated images (DALL-E)
- XP animations, level-up effects, and floating XP indicators
- Use lucide-react for icons

## Screen Requirements (12+ screens)
1. Overview - Dog portrait, 4 stats, daily goals breakdown, equipped cosmetics
2. Quests - List of available activities with AI recommendations
3. Activity - Feed of recent activities from both users
4. Stat Detail - Click on any stat orb to see detailed progression
5. Voice Logging (Log Activity) - Recording interface for voice input
6. Log Confirmation - Preview before saving with parsed activity details
7. Quest Detail - Individual quest info with stat gains
8. Training Mode - Hands-free voice-activated training with rep counting
9. Waitlist - Landing page for waitlist signups with referral system
10. Hackathon Landing (index) - Main landing page showcasing features
11. Items/Cosmetics - View and equip unlocked cosmetic items
12. Character Selection - Choose starter character during onboarding
13. Thanks - Confirmation page after waitlist signup