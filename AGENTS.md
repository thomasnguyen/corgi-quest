# Corgi Quest Development Guidelines

## Tech Stack Requirements
- TanStack Start (file-based routing in app/routes/)
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
- Routes: app/routes/*.tsx
- Components: app/components/*.tsx
- Convex backend: convex/*.ts
- Convex schema: convex/schema.ts

## Component Patterns
- Functional components only with TypeScript
- Use proper TypeScript types for all props
- Follow black/white minimalist wireframe design
- No gradients, no colors except black/white/gray

## Real-Time Requirements (MOST IMPORTANT)
- All data must update in real-time using Convex subscriptions
- NO polling, NO manual refetching
- When one user logs activity, other user sees it instantly
- Use optimistic updates where appropriate

## Database Schema
Follow the exact schema:
- 8 tables: users, households, dogs, dog_stats, activities, activity_stat_gains, daily_goals, streaks
- Use Convex validators (v.object, v.string, v.number, v.id, etc.)

## UI/UX Requirements
- Mobile-first design (max-w-md mx-auto)
- Bottom navigation (3 tabs: OVERVIEW, QUESTS, ACTIVITY)
- LOG ACTIVITY button above bottom nav
- Top resource bar with TODAY stats
- Centered dog name with level badge
- Black and white only - minimalist wireframe style
- Use lucide-react for icons

## Screen Requirements (7 total)
1. Overview - Dog portrait, 4 stats, daily goals breakdown
2. Quests - List of available activities
3. Activity - Feed of recent activities from both users
4. Stat Detail - Click on any stat orb to see details
5. Voice Logging - Recording interface
6. Log Confirmation - Preview before saving
7. Quest Detail - Individual quest info