# Corgi Quest

A real-time multiplayer dog training RPG where couples level up their dog together through shared quests, XP progression, and instant synchronization.

## The Why

I want to have a family in the future, and the thought of Bumi not getting along with our child—or worse, showing aggression—keeps me up at night. This app is my way of making sure we're doing everything we can to train and socialize him properly before that day comes. Turning daily training into a game helps us stay consistent, and doing it together as a couple means we're both accountable.

## Features

- Real-time activity logging with instant cross-device sync
- Voice-powered activity entry using OpenAI Realtime API
- Four core stats (Intelligence, Physical, Impulse Control, Socialization) with XP progression
- Daily goals (60 physical pts, 45 mental pts) with streak tracking
- Quest system with suggested activities and instructions
- Mood tracking with notes and timestamps
- AI-powered activity recommendations
- Activity feed showing training activities and mood entries
- Stat detail screens with progress visualization
- Character customization with unlockable items

## Tech Stack

TanStack Start, Convex, Netlify, Cloudflare Workers, Sentry, Autumn, Firecrawl

## Architecture

**Real-time:** Convex subscriptions with `useQuery` hooks automatically sync data across devices. When one partner logs an activity, the other sees it instantly—no polling or refresh needed. 11 tables with proper indexing. Optimistic UI updates provide instant feedback. Offline mutations queue and sync when reconnected.

**Voice:** OpenAI Realtime API with function calling extracts structured data from natural conversation. Audio-to-audio responses with waveform visualization. The AI understands context, calculates XP based on activity type and duration, and calls `saveActivity` with validated parameters.

**Gamification:** XP-based progression (100 XP per level). Activities award XP to relevant stats based on type and duration—duration-based activities (walks, runs) scale with time, while fixed activities (training sessions, puzzle toys) have standard XP values. XP distribution follows percentage splits (e.g., fetch gives 70% Physical, 30% Impulse Control). Daily goals reset at midnight via cron jobs. Streaks increment when both goals are met.

**Database:** Convex validators for type-safe operations. Auto-generated TypeScript types. Indexed foreign keys and frequently queried fields.

**Type Safety:** Full TypeScript with strict mode. Auto-generated types from schema. File-based routing with type inference.

**Performance:** Image preloading, optimistic updates, lazy loading, React memoization, dynamic imports for voice interface.

**Training Tips:** Firecrawl fetches dog training articles from AKC.org via Cloudflare Worker. Firecrawl handles JavaScript rendering and returns clean markdown parsed into structured training tips.

**Monitoring:** Sentry for error reporting and performance monitoring. Error boundaries for graceful error handling.

## Try It

1. Clone and install: `npm install`
2. Set up Convex: `npx convex dev` (creates project and generates types)
3. Add environment variables to `.env.local`:
   ```
   VITE_CONVEX_URL=your-convex-url
   VITE_OPENAI_API_KEY=your-openai-key
   ```
4. Run: `npm run dev`

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Credits

Built with [TanStack Start](https://tanstack.com/start), [Convex](https://www.convex.dev), [Netlify](https://netlify.com), [Cloudflare](https://cloudflare.com), [Sentry](https://sentry.io), [Autumn](https://useautumn.com), and [Firecrawl](https://firecrawl.dev).

## Built By

Thomas Nguyen
