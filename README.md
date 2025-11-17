# **Corgi Quest**

**A real-time dog training RPG for couples.**
Train your dog together, stay consistent, and watch your pup level up as you complete activities, quests, and daily goals — all synced instantly across both of your devices.

---

## **Why We Built This**

Training our corgi, Bumi, got tough the moment life got busy. We kept slipping, routines faded, and we always felt like the other person had it handled. Turning training into a shared game fixed that. Seeing progress update in real time on both our phones made it fun again — and kept us accountable.

Corgi Quest exists to help couples stay consistent, stay connected, and build a happier dog together.

---

## **What It Does**

### **• Real-Time Multiplayer**

Log a walk or training session and your partner sees XP, stats, and daily goals update instantly — no refresh needed.

### **• Voice Logging**

Talk naturally: “30-minute walk, passed two dogs, stayed calm.”
The app parses it and assigns XP to the right stats.

### **• Four Core Dog Stats**

* **Intelligence**
* **Physical**
* **Impulse Control**
* **Socialization**

Each has its own level, XP curve, and activity history.

### **• Daily Goals + Shared Streaks**

Hit physical and mental stimulation targets each day. Stay consistent together to build streaks.

### **• Quests + Recommendations**

Guided activities to keep training fresh, plus AI-suggested tasks tailored to your dog.

### **• Mood Tracking**

Quick mood check-ins help you spot patterns over time.

---

## **Tech Stack**

### **Frontend**

* **TanStack Start** — full-stack routing, server functions, streaming, and SSR.

### **Backend**

* **Convex** — real-time sync for XP, stats, daily goals, streaks, and the shared activity feed.

### **AI**

* **OpenAI Realtime API** — parses voice logs into structured XP events.
* **Firecrawl** — fetches and distills dog-training guidance for quest suggestions.

### **Dev + Cloud**

* **Netlify** — deployment of the full app.
* **Cloudflare** — global performance and edge caching.
* **Sentry** — error tracking and performance monitoring.
* **CodeRabbit** — automated PR reviews during development.
* **Autumn** — integrated as the basis for future monetization flows.

---

## **Architecture Overview**

### **• Real-Time Sync**

Convex subscriptions keep both partners’ screens in perfect sync:

* XP and stat updates
* Daily goals
* Activity feed
* Streaks

Everything updates live, even across two devices side by side.

### **• Voice → XP Pipeline**

1. User speaks.
2. Audio sent to TanStack server function.
3. OpenAI Realtime API extracts activity type, duration, and context.
4. Convex awards XP across multiple stats and updates daily goals instantly.

### **• Gamification Engine**

* XP scales with duration and difficulty.
* Daily goals reset at midnight.
* Streaks reward consistency.
* All progress persists in real time across the household.

---

## **Getting Started**

Clone the repo:

```bash
git clone https://github.com/thomasnguyen/corgi-quest.git
cd corgi-quest
npm install
```

Start Convex:

```bash
npx convex dev
```

Add `.env.local`:

```env
VITE_CONVEX_URL=your-convex-url
VITE_OPENAI_API_KEY=your-openai-key
```

Run the dev server:

```bash
npm run dev
```

Visit: `http://localhost:5173`

---

## **About**

Corgi Quest was designed and built by **Thomas Nguyen** for the TanStack Start Hackathon — a nine-day sprint powered by early mornings, late nights, and one very stubborn corgi.
Huge thanks to the creators of TanStack Start, Convex, Netlify, Cloudflare, Sentry, Autumn, Firecrawl, and CodeRabbit for the incredible tools.