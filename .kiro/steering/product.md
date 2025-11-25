---
inclusion: always
---

# 🐾 **Corgi Quest — Product Overview

*A real-time, AI-powered training platform built to help us train Bumi — our sweet, reactive corgi — and prepare for a future baby together.*

---

# 💡 **Purpose**

Corgi Quest turns everyday dog training into a shared, real-time adventure.
Inspired by our real struggles training Bumi through reactivity, the app helps couples stay consistent, stay connected, and make training genuinely fun.

It blends:

* AI voice coaching
* real-time multiplayer
* VR training assistance
* RPG-style progression
* and AI-driven personalization

…into one seamless experience designed to **supercharge real-world training sessions.**

---

# 🎯 **Target Users**

* Dog owners who want to stay consistent with training
* Couples/partners who share responsibility (core use case)
* Owners of reactive dogs (fear, reactivity, anxiety)
* People who respond well to gamification
* Users with busy lives who need hands-free, voice-first interaction
* Early adopters interested in AI + VR-enhanced pet care

---

# 🧩 **Key Features**

## 🎮 **RPG Progression System**

* Four core training stats:
  **INT** (Intelligence), **PHY** (Physical), **IMP** (Impulse Control), **SOC** (Socialization)
* Each stat has XP, level, and its own progression curve
* Overall level increases as stats level up
* Activities give multi-stat XP (AI-determined)
* Real-time XP animations, level-ups, and progression feedback

---

## 🎙️ **Voice-Activated Logging (Hands-Free Training)**

* Log activities with natural speech during real walks or training
* Claude/OpenAI parses descriptions into structured training events
* Automatically awards XP across relevant stats
* Summaries appear instantly in the activity feed
* Perfect for real-world use when hands are busy

---

## 🤖 **Voice Coach Mode (Full AI Coach)**

A guided, hands-free training mode designed for reactive dogs and real-life sessions.

* Say: **“Coach mode: calm walk.”**
* AI sets a micro-goal:
  “Goal: 5 calm reps. Mark each rep with your voice.”
* Say: **“Mark rep.”** to increment progress
* Say: **“End session: five calm reps around two dogs.”**
* Claude processes the summary → assigns XP → updates dashboards in real time
* Ideal when actively training Bumi in the living room or outside

This turns training into a **conversational, guided coaching loop**.

---

## 🥽 **VR Training HUD (Vision Pro Companion)**

A lightweight visionOS app that acts as a **training command center** during real-life sessions.

* Live stat panels
* Today’s physical & mental goals
* Current streak
* Last 7-day XP chart
* Recent activity feed

Plus hands-free controls:

* **“Start training.”**
* **“Mark rep.”**
* **“End session…”**
* Updates appear instantly thanks to the shared Convex backend

This gives you **a real-time training HUD** floating in your space while you work with Bumi.

---

## 🖼️ **AI-Generated Cosmetic Transformations**

* Earn a cosmetic every time Bumi levels up
* DALL·E 3 generates unique items based on his photo
* Equip items to change Bumi’s look in the app
* Dynamic backgrounds adapt to item type
* Some special items (e.g., moon/space) unlock themed environments

This adds delight and forward momentum to training.

---

## 📅 **Daily Goals & Streaks**

* Daily **Physical** and **Mental** training goals
* Streak tracking for consistency
* Visual resource bars update in real time
* Missing a day breaks the streak (gentle reset)
* Encourages daily micro-training sessions

---

## 🐶 **Character Selection (Future Personalization)**

* Choose from 6 starter pups at onboarding
* Each with initial stats + temperament
* Makes onboarding fun and thematic

---

## 🗺️ **Quests & Recommendations**

* Curated training quests (e.g., “Calm Walk,” “Loose Leash,” “Impulse Game”)
* Firecrawl scrapes expert training advice
* Claude transforms it into tailored daily recommendations
* Keeps training fresh and leveled to your dog’s weaknesses

---

## 📜 **Activity Feed (Real-Time Timeline)**

* Chronological log of everything earned
* Shows XP breakdown per stat
* Displays who logged the activity (you or partner)
* Animates instantly thanks to Convex subscriptions

---

## 📈 **Weekly Summary & Insights**

* Modal / section showing:

  * Total XP earned
  * Activities completed
  * Goal completion rate
  * Trends across INT/PHY/IMP/SOC
* Celebrates milestones
* Perfect for evaluating progress toward preparing for a baby

---

# ⚙️ **Platform & Architecture**

## ⚡ **Real-Time System (Convex)**

* Live stats, goals, streaks, and feed
* Zero polling
* Instant, optimistic UI updates
* Multi-user household support
* Shared training progress in real time

---

## 🧠 **AI System (Claude + Firecrawl)**

* Natural language → structured training data
* XP + stat weighting
* Rep counting
* Session summarization
* Quest suggestions
* Cosmetic generation prompts
* Future: temperament modeling

---

## 🥽 **VR System (visionOS + SwiftUI)**

* Fetches same backend data as web app
* Immersive “training HUD”
* Voice controls for hands-free sessions
* True multi-device ecosystem

---

## 🔧 **Kiro-Powered Development (Heavy Integration)**

Major subsystems were designed & refactored with **Kiro**:

* XP engine
* Activity logging pipeline
* Voice parsing structure
* Rep counting system
* Real-time UI wiring
* Schema, types, server functions
* Steering docs + task breakdown
* Automated refactor workflows

Kiro served as an **AI pair programmer, architect, and spec generator**, accelerating development and ensuring consistency.

---

# 🧬 **Frankenstein Stitch — Multi-Tech Integration**

Corgi Quest uniquely stitches together:

* **TanStack Start** → full-stack + server functions
* **Convex** → real-time database + sync
* **Claude** → voice parsing + coaching
* **Firecrawl** → quest recommendations
* **DALL·E** → cosmetic generation
* **visionOS** → VR training HUD
* **Kiro** → AI IDE + spec → task automation
* **Screen Studio** → pro-level capture
* **PWA** → mobile-first real-world usage

This creates a cohesive, multi-platform training ecosystem.

---

# 🎯 **Business & Product Objectives**

* Help dog owners (especially couples) stay consistent
* Reduce reactivity through daily micro-training
* Prepare our family (and Bumi) for a future baby
* Make training feel fun, not stressful
* Build a long-term platform for personalized dog training
* Validate interest through waitlist + early access
* Demonstrate cutting-edge AI + real-time + VR integration

---

# ❤️ **Core Values**

* **Real-time first** — everything updates instantly
* **AI-augmented** — voice coaching and smart parsing
* **Hands-free** — built for real-world training
* **Emotionally grounded** — inspired by our real journey with Bumi
* **Positive reinforcement** — celebrate progress, not failure
* **Couple-centered** — shared progress strengthens teamwork
