# Corgi Quest

A real-time multiplayer dog training RPG where couples level up their dog together through shared quests, XP progression, and instant synchronization.

## The Why

I want to have a family in the future, and the thought of Bumi not getting along with our child—or worse, showing aggression—keeps me up at night. This app is my way of making sure we're doing everything we can to train and socialize him properly before that day comes. Turning daily training into a game helps us stay consistent, and doing it together as a couple means we're both accountable.

## What It Does

- Real-time activity logging with instant cross-device synchronization
- Voice-powered activity entry using OpenAI Realtime API with natural conversation
- Four core stats (Intelligence, Physical, Impulse Control, Socialization) with XP progression and leveling
- Daily goals for physical (60 pts) and mental (45 pts) stimulation with streak tracking
- Quest system with suggested activities, point values, and detailed instructions
- Mood tracking throughout the day with notes and timestamps
- AI-powered activity recommendations based on mood patterns, stat gaps, and goal progress
- Unified activity feed showing both training activities and mood entries in chronological order
- Today's breakdown displaying all physical and mental activities completed today
- Stat detail screens for each of the four core attributes with progress visualization
- Quest detail screens with category, points, and step-by-step instructions
- Character customization with unlockable cosmetic items and dynamic backgrounds
- Level-up celebrations with animations and toast notifications
- Presence indicators showing when your partner is actively logging
- Connection status indicators for offline, reconnecting, and syncing states

## Tech Highlights

### Real-Time Multiplayer

Built on Convex subscriptions for true real-time synchronization. When one partner logs an activity, the other sees it instantly—no polling, no refresh needed. The system uses `useQuery` hooks that automatically subscribe to data changes, triggering React re-renders when mutations occur.

The architecture includes 11 database tables with proper indexing for efficient queries. Presence tracking shows when your partner is actively logging activities, creating awareness of shared engagement. Optimistic UI updates provide instant feedback before server confirmation, making interactions feel immediate.

Offline mutations queue automatically and sync when reconnected, ensuring no data loss during network interruptions. Connection status indicators (offline, reconnecting, syncing) keep users informed of system state. Sub-second updates across all devices with automatic conflict resolution maintain data consistency.

### Voice Interface

OpenAI Realtime API powers natural, conversational activity logging with audio-to-audio responses. Speak to the app like you're talking to a person—it understands context, calculates XP based on activity type and duration, and extracts structured data through function calling.

The system automatically calls `saveActivity` with validated parameters (stat gains, physical/mental points, duration). Function calling ensures structured data extraction without manual parsing. Real-time audio waveform visualization using Pipecat provides visual feedback during conversations, creating an engaging interaction.

The AI assistant uses a medieval character persona for engaging interactions, making logging feel like a conversation rather than data entry. Natural language understanding handles variations in activity descriptions ("we went for a walk" vs "took the dog walking") and asks clarifying questions when needed.

### Gamification System

Full RPG progression with four character stats, daily goals, and streak tracking. Activities award XP to relevant stats based on type and duration—duration-based activities (walks, runs) scale with time, while fixed activities (training sessions, puzzle toys) have standard XP values.

XP distribution follows percentage splits (e.g., fetch gives 70% Physical, 30% Impulse Control). Stats level up at 100 XP increments with linear progression. Dogs have an overall level calculated from stat averages, providing a unified progression metric.

Daily goals track physical (60 pts) and mental (45 pts) stimulation, resetting at midnight via cron jobs. Streaks increment when both goals are met and reset when either goal is missed, creating accountability. Level-up celebrations trigger animations and toast notifications, providing satisfying feedback. Quest system categorizes activities as Physical or Mental with point values and detailed instructions.

### Database Architecture

The schema uses Convex's validator system for type-safe database operations. All 11 tables are defined with strict TypeScript types that are auto-generated from the schema, ensuring compile-time safety.

Indexes are strategically placed on foreign keys and frequently queried fields (dogId, householdId, createdAt) for optimal query performance. The normalized structure separates concerns—activities, stat gains, and daily goals are in separate tables, allowing efficient queries and updates.

Relationships are maintained through Convex ID references with proper validation. The schema supports complex queries like "get all activities for a dog in the last 7 days" or "calculate streak based on daily goal completion" efficiently.

### Type Safety & Developer Experience

Full TypeScript coverage with strict mode enabled ensures type safety from database to UI. Convex generates TypeScript types automatically from the schema, eliminating manual type definitions and keeping types in sync with the database.

TanStack Start provides file-based routing with automatic type inference for route parameters and search params. React hooks are fully typed, catching errors at compile time rather than runtime.

The codebase uses consistent patterns—all Convex functions follow the same structure, all components use functional components with TypeScript props, and all utilities are fully typed. This consistency reduces cognitive load and makes the codebase easier to navigate.

### Performance Optimizations

Image preloading for background assets ensures smooth visual transitions. Optimistic UI updates make interactions feel instant by updating the UI before server confirmation. Lazy loading for route components reduces initial bundle size.

Convex queries are optimized with proper indexing and selective field queries. The system only subscribes to data that's actually displayed, reducing unnecessary network traffic. React memoization prevents unnecessary re-renders of expensive components.

The voice interface uses dynamic imports to avoid bundling browser-only dependencies in server functions. This keeps the server bundle small while providing full functionality on the client.

### Error Handling & Monitoring

Sentry integration provides real-time error reporting with context about user actions and system state. Error boundaries catch React errors gracefully, showing user-friendly messages instead of white screens.

Performance monitoring tracks slow queries and render times, helping identify bottlenecks. Session replay captures user interactions leading to errors, making debugging significantly easier.

The system validates all inputs at multiple layers—Convex validators at the database level, TypeScript types at compile time, and runtime validation for external API calls. This defense-in-depth approach prevents invalid data from corrupting the system.

## Tech Stack

**Frontend:** TanStack Start, React, TypeScript, Tailwind CSS

**Backend:** Convex (real-time database with subscriptions)

**Voice:** OpenAI Realtime API, Pipecat

**Infrastructure:** Netlify, Cloudflare Workers

**Tools:** Sentry, Vitest, Vite

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

## Special Thanks

### Convex

Thanks to [Convex](https://www.convex.dev) for the real-time backend. The subscription-based architecture enables true real-time synchronization without polling.

The app uses Convex's `useQuery` hooks for automatic data subscriptions that trigger React re-renders on mutations. Database operations use Convex's validator system for type-safe queries and mutations, with TypeScript types auto-generated from the schema. The 11-table schema includes proper indexing, and Convex handles conflict resolution automatically.

Convex actions handle secure server-side operations like OpenAI session token generation and Autumn checkout creation. Scheduled functions (crons) reset daily goals at midnight. The offline mutation queue ensures no data loss during network interruptions.

### TanStack Start

Built with [TanStack Start](https://tanstack.com/start) for the full-stack React framework. File-based routing provides automatic type inference for route parameters and search params.

The app uses TanStack Start's server functions for secure API calls to external services. SSR improves initial load performance, and TypeScript integration ensures type safety throughout. File-based routing keeps the codebase organized.

### Autumn

Tip jar powered by [Autumn](https://useautumn.com). The `/thanks` route allows users to tip $3, $5, $10, or custom amounts. Autumn's SDK handles customer creation, checkout sessions, and payment processing through Convex actions. Currently in sandbox mode for demos.

### Firecrawl

Training tips powered by [Firecrawl](https://firecrawl.dev). The app uses Firecrawl through a Cloudflare Worker to fetch dog training articles from AKC.org. Firecrawl handles JavaScript rendering, removes clutter, and returns clean markdown that we parse into structured training tips.

## Built By

Thomas Nguyen
