# Corgi Quest

> **Level up your dog, level up your relationship.**  
> A real-time multiplayer dog training RPG where couples train together through shared quests, XP progression, and instant synchronization.

---

## 💭 The Why

I want to have a family in the future, and the thought of Bumi not getting along with our child—or worse, showing aggression—keeps me up at night. 

This app is my way of making sure we're doing everything we can to train and socialize him properly before that day comes. Turning daily training into a game helps us stay consistent, and doing it together as a couple means we're both accountable.

*Because the best training happens when you're both on the same page.* 🎯

---

## ✨ Features

**🎮 Core Gameplay**
- Real-time activity logging with instant cross-device sync
- Voice-powered activity entry using OpenAI Realtime API (just talk to log!)
- Four core stats: Intelligence 🧠, Physical 💪, Impulse Control 🎯, Socialization 🤝
- XP-based progression system (100 XP per level)

**📊 Progress Tracking**
- Daily goals (60 physical pts, 45 mental pts) with streak tracking 🔥
- Stat detail screens with beautiful progress visualization
- Activity feed showing all training activities and mood entries

**🎯 Quest System**
- Suggested activities with step-by-step instructions
- AI-powered activity recommendations based on your dog's needs
- Character customization with unlockable items

**😊 Wellbeing**
- Mood tracking with notes and timestamps
- Daily mood reminders to keep tabs on your pup's emotional state

---

## 🛠️ Tech Stack

Built with modern, battle-tested tools:

- **Frontend:** [TanStack Start](https://tanstack.com/start) (file-based routing)
- **Backend:** [Convex](https://www.convex.dev) (real-time database)
- **Hosting:** [Netlify](https://netlify.com) + [Cloudflare Workers](https://cloudflare.com)
- **Monitoring:** [Sentry](https://sentry.io) (error tracking)
- **AI:** [Autumn](https://useautumn.com) + [Firecrawl](https://firecrawl.dev) (training tips)

---

## 🏗️ Architecture Highlights

### Real-time Sync
Convex subscriptions with `useQuery` hooks automatically sync data across devices. When one partner logs an activity, the other sees it instantly—no polling or refresh needed. 11 tables with proper indexing. Optimistic UI updates provide instant feedback. Offline mutations queue and sync when reconnected.

### Voice Interface
OpenAI Realtime API with function calling extracts structured data from natural conversation. Audio-to-audio responses with waveform visualization. The AI understands context, calculates XP based on activity type and duration, and calls `saveActivity` with validated parameters.

### Gamification Engine
- **XP System:** 100 XP per level
- **Smart XP Distribution:** Activities award XP to relevant stats based on type and duration
  - Duration-based activities (walks, runs) scale with time
  - Fixed activities (training sessions, puzzle toys) have standard XP values
  - XP distribution follows percentage splits (e.g., fetch gives 70% Physical, 30% Impulse Control)
- **Daily Goals:** Reset at midnight via cron jobs
- **Streaks:** Increment when both goals are met

### Database
Convex validators for type-safe operations. Auto-generated TypeScript types. Indexed foreign keys and frequently queried fields.

### Type Safety
Full TypeScript with strict mode. Auto-generated types from schema. File-based routing with type inference.

### Performance
Image preloading, optimistic updates, lazy loading, React memoization, dynamic imports for voice interface.

### Training Tips
Firecrawl fetches dog training articles from AKC.org via Cloudflare Worker. Handles JavaScript rendering and returns clean markdown parsed into structured training tips.

### Monitoring
Sentry for error reporting and performance monitoring. Error boundaries for graceful error handling.

---

## 🚀 Try It Out

Get up and running in minutes:

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This creates your project and generates types automatically.

3. **Add environment variables** to `.env.local`:
   ```env
   VITE_CONVEX_URL=your-convex-url
   VITE_OPENAI_API_KEY=your-openai-key
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   ```

See [SETUP.md](./SETUP.md) for detailed setup instructions.

---

## Credits

Built with love using [TanStack Start](https://tanstack.com/start), [Convex](https://www.convex.dev), [Netlify](https://netlify.com), [Cloudflare](https://cloudflare.com), [Sentry](https://sentry.io), [Autumn](https://useautumn.com), and [Firecrawl](https://firecrawl.dev).

---

## Built By

**Thomas Nguyen**

*Making dog training fun, one quest at a time.*
