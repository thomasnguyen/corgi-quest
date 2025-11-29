# 🐾 Corgi Quest

> **A real-time co-op dog-training RPG for couples.**  
> Built for the **Kiroween Hackathon – Frankenstein category**.

<img width="1856" height="1004" alt="Corgi Quest screenshot" src="https://github.com/user-attachments/assets/5c601e7b-19e9-4e22-bc23-37b1e976a82c" />

Corgi Quest turns everyday dog training into a shared RPG so couples can stay aligned while training a reactive dog and preparing for a future baby. It's built from our real journey with **Bumi**, our sweet but reactive corgi.

---

## 🔎 Judges' Quick Tour

**If you only have a few minutes, start here:**

1. **Watch the demo video** – full flow: voice logging, real-time sync, VR HUD, Kiro usage.
2. **Open the live demo (auto-login)** – see real Bumi data and shared streaks.
3. **Skim "How we used Kiro"** – directly maps to Kiroween *Implementation* criteria.
4. Optionally: peek at the `.kiro/`, `convex/`, and `app/` directories to see the stitched stack.

> 🧪 **Links (update before submission):**
> - ▶️ Demo video: `TODO: add link`
> - 🌐 Hackathon landing page: `TODO: add link`
> - 💻 Live web/PWA demo (auto-login): `TODO: add link`
> - 🥽 Vision Pro HUD clip / section: `TODO: add link`

---

## 💡 Problem & Potential Value

Training a reactive dog is hard enough. Doing it as a couple is worse:

- One person logs walks, the other *thinks* they did.
- Nobody fully trusts "I trained today."
- The dog's progress is invisible and inconsistent.

We built Corgi Quest to:

- Give each dog their own **stats, quests, and XP**.
- Turn invisible effort into a **shared streak**, not a hidden resentment.
- Help prepare Bumi (and us) for a future baby with **real daily training data**, not vibes.

This addresses Kiroween's **Potential Value**: real pain point, real data from our own household, and a path to millions of dog-owning couples who struggle with consistency and alignment.

---

## 🐕 What Corgi Quest Does

### 🎮 RPG-style dog progression

Each dog has four core stats:

- **INT** – Intelligence (training games, learning sessions)
- **PHY** – Physical (walks, hikes, fetch)
- **IMP** – Impulse Control (calm reps, "leave it", threshold work)
- **SOC** – Socialization (dogs, people, strollers, etc.)

Every activity awards **multi-stat XP** and drives:

- Stat levels + overall dog level  
- Real-time XP animations and level-up feedback  
- AI-generated cosmetics on level-up

---

### 🔄 Real-time couples sync (household view)

- Two humans, one reactive corgi (or more dogs).
- Log a session on one device → **XP, stats, goals, and streaks update live** on all others via Convex subscriptions.
- Activity feed shows **who** did **what** and **when**, so there's no "did you really train?" argument.

---

### 🎙️ Voice logging (hands-free training)

- Say: **"30-minute walk, passed two dogs, stayed calm."**
- The system parses the sentence into a structured training event: activity type, duration, context.
- XP is distributed across INT/PHY/IMP/SOC and logged in the shared activity feed in real time.

Perfect when your hands are full of leash, treats, and poop bags.

---

### 🤖 Voice Coach Mode (AI coaching loop)

A dedicated mode for real training sessions with reactive dogs:

1. **"Coach mode: calm walk."**  
   - Creates a micro-goal like: "Goal: 5 calm reps. Mark each rep with your voice."
2. **"Mark rep."** increments the in-session counter.
3. **"End session: five calm reps around two dogs."**  
   - Summarizes the session, awards XP, updates goals & streaks, and writes to the feed.

This turns training into a **conversational, guided experience** instead of ad-hoc logging.

---

### 🥽 Vision Pro Training HUD

A lightweight **visionOS** companion app that acts as a HUD during real sessions:

- Panels for **live stats**, **today's goals**, **streak**, **weekly XP chart**, and **recent activity**.
- Voice controls: **"Start training", "Mark rep", "End session…"**
- Uses the same Convex backend as the web app, so everything stays in sync.

This gives us a **multi-surface ecosystem**: web/PWA for daily use, Vision Pro for "deep work" training sessions.

---

### 🎨 AI-generated cosmetics

To keep training fun:

- Level-ups unlock **AI-generated cosmetics** based on your dog's appearance.
- Equip items to change their appearance and environment.
- Special items unlock themed backgrounds (e.g., space, moon).

It's lightweight but surprisingly motivating.

---

### 📅 Daily goals, streaks & quests

- Separate **physical** and **mental** daily goals.
- Streaks encourage consistency (household + per-dog).
- **Quests** and AI recommendations keep training fresh and focused on your dog's weaknesses.

---

## 🧬 Frankenstein Tech Stitch (Category Fit)

Corgi Quest is intentionally over-the-top for **Frankenstein**:

- **TanStack Start** – full-stack React app (routing, server functions, SSR)
- **Convex** – real-time database + subscriptions for XP, stats, streaks, feed
- **Claude / LLM** – voice parsing, session summarization, rep counting, quest logic
- **Firecrawl** – scrapes expert training content into quest suggestions
- **DALL·E / image model** – cosmetic generation for dog avatars
- **visionOS + SwiftUI** – Vision Pro training HUD
- **Kiro** – specs, steering, hooks, and vibe coding to architect and glue everything together
- **PWA** – mobile-first, used during real walks

Everything shares the **same Convex backend**, so web, PWA, and Vision Pro stay in lockstep.

---

## 🧠 How We Used Kiro (Implementation Criteria)

Kiroween judges care about **how** Kiro is used, not just that it's imported.

Kiro powered Corgi Quest in four main ways: **specs, steering, hooks, and vibe coding**.

### 1️⃣ Spec-driven XP & training pipeline

We wrote Kiro specs for:

- **XP Engine** – stat definitions, XP curves, household streak rules
- **Activity Pipeline** – how raw voice/text logs map into structured events
- **Rep Counting & Coach Mode** – the "start → mark rep → end" state machine

From those specs, Kiro helped generate:

- Convex schema + tables (`activities`, `sessions`, `dogs`, `households`)
- Type-safe server functions to award XP and update goals
- Shared TypeScript types used by front-end hooks

Result: a **single source of truth** for progression logic that stays consistent across web and VR.

---

### 2️⃣ Steering docs for domain correctness

Steering docs teach Kiro the **language of our world**:

- Reactivity, calm reps, and the four stats (INT/PHY/IMP/SOC)
- How "30-minute walk, passed two dogs, stayed calm" should be interpreted
- Our mental model: **XP → stats → goals → streaks → HUD**

That context keeps generated code aligned with the product, not generic CRUD.

---

### 3️⃣ Hooks & automation for fast iteration

We leaned on Kiro hooks to:

- Regenerate Convex functions and types when specs changed
- Keep client hooks (`useActivityFeed`, `useDogStats`, `useHouseholdStreak`) in sync with schema
- Auto-update docs / comments when we added new activity types or stats

This made it realistic to evolve the XP model and coach flow within hackathon time.

---

### 4️⃣ Vibe coding as pair programmer

Outside formal specs, we used Kiro vibe coding to:

- Bootstrap the **Vision Pro HUD UI** from product notes and sketches
- Refactor state machines (coach mode, streak resets) into cleaner modules
- Generate example data + seed scripts based on real Bumi sessions

Kiro wasn't bolted on at the end; it **shaped the architecture and day-to-day dev loop**, which is exactly what Kiroween's Implementation criteria want to see.

---

## 🧱 Architecture Overview

High-level flow:

1. **Client surfaces**  
   - Web / PWA (TanStack Start + React)  
   - Vision Pro HUD (SwiftUI + RealityKit)

2. **Voice & text input**  
   - Browser mic or text field  
   - Vision Pro voice commands

3. **AI parsing**  
   - Extracts activities, duration, context, rep counts  
   - Decides XP distribution across INT/PHY/IMP/SOC  
   - Produces structured events according to Kiro-defined schema

4. **Real-time data layer (Convex)**  
   - Persists activities, sessions, stats, goals, streaks  
   - Pushes updates via subscriptions to all connected clients

5. **Presentation**  
   - XP bars & stat orbs  
   - Daily goal bars + streak indicators  
   - Activity feed & weekly XP charts  
   - VR HUD panels for in-session visibility

---

## 🧪 How to Test the Project (For Judges)

Assuming the Devpost / landing page links to an auto-login demo:

1. **Open the live demo (auto-login).**  
   - You should land in a household with Bumi's real training data.

2. **Log a voice session.**  
   - Use text if mic access is awkward, e.g.:  
     `30-minute walk, passed two dogs, stayed calm`  
   - Watch XP, stats, and daily goals update.

3. **See real-time sync.**  
   - Open the demo in two browser windows side by side.  
   - Log an activity in one; watch XP, stats, and the feed update in both instantly.

4. **Try Coach Mode.**  
   - Start a "calm walk" coaching session.  
   - Increment reps, end the session, and confirm the summary + XP in the feed.

5. **Check streaks & quests.**  
   - Look at household streak, daily goals, and quest recommendations.

6. **Vision Pro HUD (optional but fun).**  
   - Watch the provided video or run the visionOS app (if you have hardware/simulator) to see the same data rendered as a training HUD.

---

## 🛠 Tech Stack

**Frontend**

- TanStack Start (React, routing, server functions, SSR)
- PWA for iOS & Android usage
- Tailwind CSS for styling

**Backend**

- Convex for real-time data + subscriptions (XP, stats, goals, streaks, feed)

**AI**

- Claude / compatible LLM for voice parsing, summarization, rep counting, quest logic
- Firecrawl to ingest expert training content into structured quests
- DALL·E-style image generation for cosmetics

**VR / Native**

- visionOS app (SwiftUI + RealityKit) for training HUD
- Shared Convex backend with the web/PWA app

**Dev Experience**

- Kiro specs, steering, hooks, and vibe coding to drive design and implementation

---

## 🚀 Local Development

> These instructions are for the web/PWA app. The Vision Pro app lives in its own Xcode project (see `CorgiQuestVR/` directory).

### Prerequisites

- Node.js and npm
- Convex CLI (`npm install -g convex`)
- A Convex project + URL
- An API key for your LLM provider (OpenAI / Claude, depending on how you configure it)

### Setup

Clone the repo:

```bash
git clone https://github.com/thomasnguyen/corgi-quest.git
cd corgi-quest
npm install
```

Start Convex (in a separate terminal):

```bash
npx convex dev
```

Create `.env.local` in the project root (names may differ based on how you wire your keys in code):

```env
VITE_CONVEX_URL=your-convex-url
VITE_OPENAI_API_KEY=your-ai-key
```

Start the dev server:

```bash
npm run dev
```

Then visit:

```
http://localhost:5173
```

You should be able to:

- Create a demo household + dog
- Log activities
- See XP & stats update in real time

### 🥽 VisionOS / VR Development (Optional)

If you'd like to explore the Vision Pro HUD:

1. Open the Xcode project under `CorgiQuestVR/`.
2. Update any Convex / API keys in the Xcode project's configuration to match your `.env.local`.
3. Run on a Vision Pro simulator or device.
4. Start a training session and watch stats, goals, and XP update live from the shared backend.

(If you're reviewing this for Kiroween, the demo video shows this flow without requiring hardware.)

---

## 📸 Real Data from Bumi

All of the screenshots and most of the demo footage come from real sessions with Bumi:

- Real walks, calm reps, and exposure work
- Real XP gains and stat progression
- Real streaks as we prepare for a baby

We use Corgi Quest ourselves — if it works for us, it can work for other reactive dogs and their humans.

---

## 👤 About

Corgi Quest is designed and built by **Thomas Nguyen** as a love letter to:

- One very stubborn corgi (Bumi)
- Couples trying to stay aligned under stress
- The idea that good tools can turn hard, emotional work into something cooperative and fun

Built for **Kiroween – Frankenstein category**, powered by:

- Kiro for specs, steering, hooks, and vibe coding
- Convex for real-time sync
- TanStack Start for the web app
- Claude + friends for voice + AI
- visionOS for the training HUD

**Train together. Level up together.**
