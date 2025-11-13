# Corgi Quest

**Level up your dog, level up your relationship.**  
Corgi Quest is a real‑time multiplayer training game that turns everyday dog training into a shared adventure for couples. You and your partner log activities, complete quests and watch your pup grow stronger—together.

## Why Corgi Quest?

We built this because training our own corgi, Bumi, felt impossible when life got busy. Instead of skipping sessions, we needed a way to keep each other engaged and accountable. Making training feel like a game gave us a reason to show up, and tracking progress on both phones kept us on the same page:contentReference[oaicite:0]{index=0}.

## Key Features

- **Real‑Time Multiplayer:** When one of you logs a walk or training session, your partner sees the XP and progress instantly—no refreshing or waiting:contentReference[oaicite:1]{index=1}.
- **Voice Logging:** Speak naturally to record activities. Tell the app what you did and it updates stats automatically, so you don’t have to type:contentReference[oaicite:2]{index=2}.
- **Four Core Stats:** Intelligence, Physical, Impulse Control and Socialization—each with its own XP bar and level system:contentReference[oaicite:3]{index=3}.
- **Daily Goals and Streaks:** Hit your daily XP targets for physical and mental activities and build streaks that unlock cosmetic items:contentReference[oaicite:4]{index=4}.
- **Quests and Recommendations:** Choose from dozens of guided quests with clear instructions, or let the AI suggest activities tailored to your dog’s needs:contentReference[oaicite:5]{index=5}.
- **Mood Tracking:** Quick mood logs help you see patterns and adjust training accordingly:contentReference[oaicite:6]{index=6}.

## Tech Stack

Corgi Quest is built with modern tools to make development and deployment seamless:

- **Frontend:** TanStack Start for file‑based routing:contentReference[oaicite:7]{index=7}.
- **Backend:** Convex provides a real‑time database and subscriptions:contentReference[oaicite:8]{index=8}.
- **Hosting:** Netlify and Cloudflare Workers serve the app globally:contentReference[oaicite:9]{index=9}.
- **Monitoring:** Sentry catches errors before they cause trouble:contentReference[oaicite:10]{index=10}.
- **AI & Training Tips:** Autumn and Firecrawl power voice commands and dog‑training advice:contentReference[oaicite:11]{index=11}.

## Architecture Highlights

- **Real‑Time Data:** Convex subscriptions ensure both partners see updates instantly, with optimistic UI and offline support:contentReference[oaicite:12]{index=12}.
- **Voice Interface:** OpenAI’s Realtime API parses natural commands and computes XP based on activity type and duration:contentReference[oaicite:13]{index=13}.
- **Gamification Engine:** XP distribution scales with duration and activity type, daily goals reset at midnight, and streaks reward consistency:contentReference[oaicite:14]{index=14}.
- **Type Safety & Performance:** Fully typed TypeScript, indexed queries, image preloading and lazy loading keep the app fast:contentReference[oaicite:15]{index=15}.
- **Training Tips:** Firecrawl fetches and parses expert articles into actionable guidance:contentReference[oaicite:16]{index=16}.
- **Monitoring:** Sentry reports errors and performance insights:contentReference[oaicite:17]{index=17}.

## Getting Started

Want to run Corgi Quest locally? Follow these steps:

1. **Clone the repo and install dependencies**:
   ```bash
   git clone https://github.com/thomasnguyen/corgi-quest.git
   cd corgi-quest
   npm install
````

2. **Start Convex locally**:

   ```bash
   npx convex dev
   ```

   This initializes your project and generates types.

3. **Create a `.env.local` file** with your keys:

   ```env
   VITE_CONVEX_URL=your-convex-url
   VITE_OPENAI_API_KEY=your-openai-key
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

## Credits

Corgi Quest was designed and built by **Thomas Nguyen** for the TanStack Start Hackathon. Built in just nine days with love and a lot of corgi cuddles. Special thanks to the creators of TanStack Start, Convex, Netlify, Cloudflare, Sentry, Autumn and Firecrawl for the amazing tools.

```

This is the full Markdown content of the updated README, complete with headings, features and setup instructions.
```
