# 🐾 Corgi Quest – High-Level Tech Stack (v1)

## 0. Goals & Constraints

* **Platform:** Mobile-first, iOS via React Native + Expo (Android later).
* **Scale target:** Up to ~10k active users (no premature over-optimization for millions).
* **Core loop:** Logging dog training/enrichment → XP → quests → cosmetics.
* **Must-haves:**

  * Fast logging (Quick Log in < 5 seconds, even on bad network).
  * Partial offline support (logging works offline, syncs later).
  * Hosted AI (no self-hosted models in v1).
* **Non-goals (v1):**

  * Complex multi-env infra (just production for now).
  * Fully custom backend / infra management.

---

## 1. Mobile App

**Tech**

* **Framework:** React Native with **Expo (managed workflow)**
* **Language:** TypeScript
* **Platforms:** iOS first, Android later

**Core Libraries**

* **Navigation:** `@react-navigation` (bottom tabs + stacks)
* **Data fetching & sync:** **React Query (TanStack Query)**

  * Caching, retries, background refetch
  * Powers Today, Quests, Dog, Journal screens
* **Offline support:**

  * React Query + **AsyncStorage/MMKV** with persistence:

    * Cache dog profile, today’s quest, streak, XP, recent sessions
    * App feels “alive” even with no network
  * Simple **pending logs queue**:

    * On mutation network error → write to `pendingLogs` in storage
    * On app focus / reconnect → replay pending logs to backend

**UI / Styling**

* Styling: Tailwind-style (e.g. `nativewind`) or StyleSheet + design tokens
* Icon set: Expo vector icons
* Custom components for:

  * Today screen (XP bar, Daily Quest, Quick Log, Streak)
  * Quest list & cards
  * Dog profile & cosmetics

**Auth**

* **Methods:**

  * Sign in with **Apple**
  * Sign in with **Google**
* **Flow:**

  * Expo auth → get provider tokens
  * Send to Convex auth function → create/find `User` + issue Convex session

---

## 2. Backend – App Logic & Data (Convex)

**Tech**

* **Backend-as-a-Service:** **Convex**
* **Language:** TypeScript
* **Responsibility:**

  * Auth & user accounts
  * Dog profiles, stats, XP, levels
  * Training sessions (voice / quick / manual)
  * Daily & weekly quest assignments + completion
  * Streak logic
  * Cosmetic unlocks
  * Notification preference data
  * AI orchestration (calling OpenAI, maybe Deepgram later)
  * HubSpot ingestion where needed

**Collections (high-level)**

* `users`
* `dogs`
* `trainingSessions`
* `questTemplates`
* `questAssignments` (daily / weekly per dog)
* `cosmeticUnlocks`
* `notificationPreferences`

**Function Modules (example)**

* `auth/`

  * `auth:handleOAuthLogin` (Apple / Google) → create/find user
* `dogs/`

  * `dogs:getTodayData` → Today screen bundle (dog + XP + quests + streak)
  * `dogs:getProfile`
* `sessions/`

  * `sessions:logQuickSession`
  * `sessions:logManualSession`
  * `sessions:logVoiceSession` (calls AI)
  * `sessions:getHistory`
* `quests/`

  * `quests:getAssignmentsForDog`
  * `quests:swapDailyQuest`
  * `quests:checkCompletionForSession`
* `xp/`

  * Functions for XP formula + level computation
* `onboarding/`

  * `onboarding:saveBehaviorProfile`
  * `onboarding:completeFirstLog`

**Domain Logic (shared)**

Create a **shared `domain/` package** (pure TS, no Convex imports):

* XP & level curve functions
* Stat allocation (INT/PHY/IMP/SOC)
* Streak math
* Daily/weekly quest selection algorithm
* Cosmetic unlock rules

Convex functions call into these pure functions so that:

* Logic is testable in isolation
* Migration to a different backend later is much easier

---

## 3. AI Stack (OpenAI + Future Deepgram)

**Provider (v1):** **OpenAI for everything**

* **Transcription:**

  * **Whisper API** for:

    * Voice logs (training sessions)
    * Onboarding voice answers
* **LLM (text):**

  * GPT models (e.g. GPT-4 / GPT-4o) for:

    * Parsing transcripts → `TrainingSessionDraft`:

      * `activityType`, `durationMinutes`, `intensity`, `contextTags`, `notes`
    * Onboarding trait/goal extraction from freeform text
    * Generating emotionally-safe copy:

      * Notifications
      * Weekly reflections
      * Micro in-app text (celebrations, encouragement)

**Flow (Voice Log)**

1. App records audio → sends to Convex `sessions:logVoiceSession`.
2. Convex:

   * Sends audio → OpenAI Whisper → transcript.
   * Sends transcript → GPT with function-calling schema → structured session(s).
   * Runs domain XP/quest/streak logic.
   * Persists `trainingSessions` + updates dog.
3. Convex returns updated dog state & new session(s) to client.

**AI Budget / Limits (v1)**

* Start with **standard paid OpenAI usage**.
* Add:

  * Basic logging of token + latency per call.
  * Monthly usage monitoring.
* No strict per-user rate limits initially; adjust after seeing real usage.

**Future (v2+): Deepgram for Live AI Coach**

* Use **Deepgram** only if/when you build a real-time “AI coach on a walk”:

  * RN app streams audio → Deepgram (fast streaming transcript).
  * Transcript → OpenAI GPT for live suggestions / summarization.
* Core logging + onboarding stays on OpenAI-only pipeline.

---

## 4. Landing Page & CRM

**Landing Page**

* **Framework:** **Astro**
* **Hosting:** **Netlify**
* **Purpose:**

  * Marketing site / story
  * Waitlist capture
  * Screenshots, manifesto, “Join the Quest” CTA

**Form → HubSpot Flow**

* Form fields:

  * Owner name
  * Email (required)
  * Dog name
  * Dog primary goal (dropdown)
* Submission:

  * Astro form → Netlify function or simple Node/Edge handler.
  * Handler → HubSpot Contacts API using a **Private App token**.
  * Set properties:

    * `owner_first_name`
    * `email`
    * `dog_name`
    * `dog_primary_goal`
    * `cq_lifecycle_stage = waitlist`
    * `cq_beta_status = not_invited`
    * `cq_source = landing_page_main` (or similar)

**HubSpot usage**

* Lists & workflows for:

  * Waitlist nurture
  * Beta invites
  * Post-launch onboarding email cadence

---

## 5. Analytics, Monitoring & Logging

**Product Analytics**

* **Primary:** PostHog (or Amplitude; PostHog is a good default)

  * Track:

    * Onboarding funnel
    * First log / first XP
    * Daily/weekly quest usage & swap rate
    * Streak milestones
    * Retention (D1/D7/D30 events)

**Error & Crash Monitoring**

* **Sentry**

  * React Native app
  * Optional: backend logging wrapper for Convex functions

**Logging**

* Backend logs for:

  * AI calls (model, duration, success/failure)
  * Key business events (onboarding complete, weekly quest complete, etc.)

---

## 6. Environments & CI/CD

**Environments**

* **v1:** **Production only**

  * Single Convex project
  * Single OpenAI project/key
  * Single PostHog project
* Use feature-flag style checks / test users for early experiments instead of full dev/staging environments.

**CI/CD**

* **Code hosting:** GitHub
* **Mobile builds:** Expo EAS

  * On push to `main`:

    * Run lint + tests
    * Trigger EAS build for production as needed
* **Landing page:** Netlify

  * Auto-deploy on `main` for Astro app
* **Convex:** Deploy from GitHub Actions or manually via CLI when merging to `main`.

---

## 7. Future-Proofing & Migration Notes

* Domain logic is isolated in `packages/domain/`:

  * Easier to move to Supabase/Postgres/Hasura/custom backend if needed.
* Client data layer uses React Query + thin API wrappers:

  * Swap Convex endpoints for REST/GraphQL later without rewriting every screen.
* If scale grows towards hundreds of thousands / millions of users:

  * Add separate staging environment.
  * Consider moving to a custom Postgres-based backend, reusing the same domain logic.


