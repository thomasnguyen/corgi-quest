# Corgi Quest Retention Plan

Version: 1.0  
Scope: V1 launch + 12-month roadmap  
Audience: Thomas (product/strategy) + LLM-powered systems (copy & decision support)  
Channels: In-app UX, Push, Email (full stack)

---

## 0. North Star

**North Star:**  
Make daily dog training feel light, hopeful, and rewarding so that owners *want* to come back, not feel pressured to.

**Core idea:**  
Turn “I *should* train my dog” into “I *get to* go on a little adventure with my dog today.”

---

## 1. Goals & Key Metrics

### 1.1 Primary Retention Goals

- Strong early retention:
  - D1, D7, D30, D60 retention.
- Habit formation:
  - % of users training ≥3 days/week by end of Month 1.
- Long-term stickiness:
  - % of active users still training weekly at Month 3 and Month 6.

### 1.2 Supporting Metrics

- Onboarding completion rate.
- % of users who:
  - Complete at least one quest in Week 1.
  - Reach Level 2 by Day 7.
  - Maintain any streak of 3+ days in the first 30 days.
- Number of sessions logged (total + per week).
- Use of special features:
  - Voice logs.
  - Weekly reflections.
  - Quest swaps.

---

## 2. Core Principles & Guardrails

1. **No guilt, no shame**
   - Never blame users for lapses.
   - Always normalize breaks and celebrate returns.

2. **Celebrate every effort**
   - “Showing up” is a win, even if the session is short or imperfect.
   - Small rewards and micro-celebrations > rare big ones.

3. **Dog-first emotions**
   - Copy is anchored in love for the dog and the partnership:
   - “[DogName] is proud of you,” “You two make a great team.”

4. **Game framing**
   - Use simple RPG language: quests, XP, levels, streaks, cosmetics.
   - Progress should always feel visual and tangible.

5. **Tiny, doable steps**
   - Default to “can be done in 2–5 minutes.”
   - Avoid heavy, complicated asks in notifications.

6. **Personalization over spam**
   - Fewer, more meaningful messages.
   - Tie every push/email to a concrete action (quest, streak, reward).

---

## 3. Lifecycle Phases

Each phase includes **V1** (must-have now) and **Roadmap** (within ~12 months).

---

### Phase 1: Onboarding (Days 1–7)

**Goal:** Hook users quickly with an “Aha!” moment: “I can actually do this, and it’s fun.”

#### 1.1 In-App UX (V1)

- **Simple, guided setup**
  - Choose avatar + set dog name.
  - Ask 1–2 questions about goals (e.g., calmer walks, enrichment).

- **Mandatory first win**
  - During onboarding, require a **tiny first session log**:
    - Example: “Spend 2 minutes giving [DogName] treats while they sit calmly.”
  - Upon logging:
    - Award XP.
    - Set streak = 1.
    - Show a quick level progress animation (XP bar filling).
    - Pop confetti or badge: “First quest complete!”

- **Visible progress**
  - Home screen after onboarding shows:
    - Streak chip: “Streak: 1 day 🌟”
    - XP bar with “Next reward in X XP.”
    - Simple onboarding checklist:
      - [x] Create your hero & dog
      - [x] Finish your first quest
      - [ ] Log how it went (voice or quick log)

- **Voice logging intro**
  - After first quest, spotlight mic button:
    - Tooltip: “Tap 🎤 to quickly say how [DogName] did—10 seconds is enough.”

#### 1.2 Push Notifications (V1)

- **Day 1 Welcome**
  - Trigger: onboarding completed, no quest within 3 hours.
  - Example:  
    “Welcome to Corgi Quest! Your adventure with [DogName] starts with one tiny quest today 🐾”

- **Day 2 Gentle Nudge**
  - Trigger: no activity since Day 1.
  - Example:  
    “[DogName] would love another tiny quest today. Even 2 minutes of fun counts 💛”

- **Micro-celebration**
  - Trigger: first quest completed.
  - Example:  
    “Awesome job finishing Quest 1 with [DogName]! You just earned your first XP 🎉”

> **LLM hint:** When drafting onboarding pushes, always:
> - Mention [DogName] if available.
> - Mention a *specific* action (e.g., “today’s quest,” “tiny win”).
> - Avoid any wording like “you should,” “you haven’t,” “you failed.”

#### 1.3 Week 1 Email (V1)

- **Timing:** Day 2 or 3.
- **Length:** ~120–150 words.
- **Content:**
  - Congratulate user on starting.
  - Highlight 3 core features:
    - Daily quests.
    - Streaks & XP.
    - Cute avatar/cosmetics.
  - Give **one simple training tip** for the week.
  - CTA: “Open the app to complete today’s quest and earn XP.”

#### 1.4 Phase 1 Roadmap Ideas

- A/B tests on:
  - Different onboarding checklists.
  - Different first-quest difficulty levels.
- Smarter quest personalization from day 1 based on dog profile/goals.
- “Onboarding coach” micro-chat to answer anxious owner questions.

---

### Phase 2: Habit Formation (Days 8–30)

**Goal:** Establish Corgi Quest as a 3–5 times/week routine, with streaks and weekly structure.

#### 2.1 In-App UX (V1)

- **Daily quest focus**
  - Today screen:
    - “Today’s Quest” with estimated time (e.g., “~5 minutes”).
    - Streak indicator: “Day 5 streak—keep it going!”

- **Mini-streak rewards**
  - At 3 days, 7 days:
    - In-app popups: “3-day streak—nice consistency! 🐕”
    - Grant small XP/coin or cosmetic shard.

- **Weekly quest**
  - Show weekly meta-goal:
    - Example: “Weekly Quest: Train 4 days this week (2 Mind, 2 Body).”
  - Progress bar: 0/4 → 4/4.

- **Nudges to voice log**
  - After each quest completion:
    - Small banner: “Want to remember how this went? Tap 🎤 to log today.”

#### 2.2 Push Notifications (V1)

Cadence: ~2–3/week.

- **Weekly kick-off (e.g., Monday):**
  - “New weekly quests await! Ready for this week’s adventure with [DogName]? 🐕‍🦺”

- **Mid-week support:**
  - If weekly quest progress < 2/4:
    - “You’re early in this week’s quest. A quick 3-minute session tonight counts!”

- **Streak recognition:**
  - If streak hits 3 or 7 days:
    - “3-day streak—amazing work! Tiny steps are adding up 🌟”

#### 2.3 Weekly Emails (Weeks 2–4, V1)

- **Week 2 – “Great Start!”**
  - Show:
    - Quests completed.
    - Current streak.
  - Training tip tied to their goal.
  - CTA: “You’re X XP away from Level Y. Today’s quest can get you there.”

- **Week 3 – “You’re Making Progress”**
  - Highlight new content unlocked (e.g., new accessory/cosmetic).
  - Short “how-to” tip or mini-video link (optional later).

- **Week 4 – “Month 1 Recap”**
  - Explain:
    - XP earned.
    - Days trained.
    - Skills/areas they focused on.
  - Invite reply/feedback.
  - Reassure: “Even if you missed days, every bit of training helps [DogName].”

#### 2.4 Phase 2 Roadmap Ideas

- Automatic adaptation of quest difficulty based on engagement.
- “Gentle goal picker” to adjust weekly goals (3, 4, 5 days) based on user type.
- Optional “soft leaderboard” (anonymous or opt-in) for achievement-driven users.

---

### Phase 3: Early Mastery (Days 31–60)

**Goal:** Reward long-term commitment, introduce advanced challenges, and deepen emotional attachment to the app.

#### 3.1 In-App UX (V1)

- **“Month 2 Questline” banner**
  - Highlight a new category of quests or a themed series.

- **Big milestone badges**
  - 30-day streak or 30 days of total training:
    - Badge/title on profile (e.g., “30-Day Companion”).
  - 60 days total:
    - “Corgi Quest Legend” celebration screen + special cosmetic.

- **Bonus quests**
  - Weekend challenges with extra XP or rare cosmetics.

#### 3.2 Push Notifications (V1)

- **Day 30 milestone:**
  - “30 days of Corgi Quest—look at how far you and [DogName] have come 💛 Check your recap in the app.”

- **Encouraging lapse handling:**
  - If streak breaks:
    - “Breaks happen. [DogName] is still proud of you. When you’re ready, we’ll start with something easy.”

- **Day 60 tease:**
  - In the days leading up to Day 60:
    - “Your 60-day bonus quest is almost here—one more step to a special reward.”

#### 3.3 Weekly Emails (Weeks 5–8, V1)

- **Week 5 – “30-Day Milestone!”**
  - Recap total XP, days trained, and improvements.
  - Set optional aspirational goal: “Try for a 45-day streak at your own pace.”

- **Week 6 – “New Powers Unlocked”**
  - Showcase any new cosmetics or features they’ve unlocked.

- **Week 7 – “Leveling Up Your Skills”**
  - Offer deeper tips or a fun quiz/interactive thing: “Why do dogs bark? Learn in 2 minutes.”

- **Week 8 – “60-Day Champion Recap”**
  - Heartfelt thank-you for caring for [DogName].
  - Optional small gift:
    - Bonus XP.
    - Special cosmetic.
    - Light mention of Premium if appropriate.

#### 3.4 Phase 3 Roadmap Ideas

- More complex questlines and “class” fantasy (e.g., Knight/Mage/Ranger/Healer for the dog avatar).
- Deeper behavioral insights in recaps (“Walks are calmer vs Week 1”).
- Optional community elements or sharing badges.

---

### Cross-Phase: Re-Engagement & Win-Back

**Goal:** Bring people back with kindness, not pressure.

#### 4.1 Inactivity Levels

- 7 days inactive → soft re-engagement.
- 14 days inactive → medium re-engagement.
- 30+ days inactive → graceful “door always open” message.

#### 4.2 Push & Email (V1)

**7 days inactive:**

- Push:  
  “We’ve been thinking about you and [DogName]. Want a super easy 2-minute quest to ease back in?”

- If no open within 24–48h → Email:
  - Remind that:
    - Progress is saved.
    - No streak shaming.
    - Offer a specially easy quest when they return.

**14 days inactive:**

- Push:  
  “Life gets busy. If you want to restart, we’ll give you a gentle Reset Quest and a small XP boost—no pressure.”

- Optional email:
  - Invite them to a “3-Day Restart” mini-challenge.

**30+ days inactive:**

- Single warm email:
  - “Thank you for the time you and [DogName] spent with Corgi Quest. If you ever want to come back, your progress will be right where you left it. No resets. No judgment.”

---

## 5. User Types & Personalization

These are behavioral archetypes. A single user can drift between them.

### 5.1 Types

1. **Achievement-Driven Trainers**
   - Love visible progress and rewards.
   - Respond well to XP, levels, cosmetics.

2. **New/Anxious Owners**
   - Worried about “doing it wrong.”
   - Need reassurance and small steps.

3. **Busy/Forgetful Owners**
   - Limited time, irregular routines.
   - Need quick wins and well-timed reminders.

4. **Social / Love-of-Dogs Owners**
   - Motivated by fun, cuteness, and joy.
   - Like enrichment and playful tasks.

### 5.2 Personalization Rules (for LLMs & Flows)

- **Achievement-driven:**
  - Emphasize XP, streaks, and upcoming unlocks.
  - Example: “You’re 40 XP away from Level 3—today’s quest can get you there.”

- **New/anxious:**
  - Emphasize emotional safety and validation.
  - Example: “Every tiny session helps [DogName]. There’s no ‘perfect’ way, only progress.”

- **Busy/forgetful:**
  - Emphasize brevity and convenience.
  - Example: “Got 2 minutes? That’s enough for a quick win with [DogName] today.”

- **Social/love-of-dogs:**
  - Emphasize dog happiness and playful vibes.
  - Example: “[DogName] will love this fun sniffing quest. It’s basically a little game.”

---

## 6. Data, Events & Segmentation (For Systems & LLMs)

### 6.1 Core Events (simplified names)

- `onboarding_completed`
- `first_quest_completed`
- `daily_quest_completed`
- `weekly_quest_completed`
- `streak_updated` (with `current_streak_days`)
- `level_up` (with `new_level`)
- `cosmetic_unlocked`
- `session_logged` (with `mode`: voice / quick / manual)
- `last_active_at` (derived)

### 6.2 Key User Properties

- `dog_name`
- `dog_primary_goal` (e.g., calmer walks, enrichment, manners)
- `lifecycle_day` (days since signup)
- `current_streak_days`
- `total_sessions_last_7d`
- `total_sessions_last_30d`
- `current_level`
- `user_type` (achievement / anxious / busy / social)

### 6.3 LLM Decision Inputs

Whenever the LLM is asked to draft or choose content, it should consider:

- Dog’s name and goal.
- Lifecycle phase (Day 1–7 vs 8–30 vs 31–60).
- User type.
- Engagement:
  - Streak length.
  - Last active date.
  - Whether they’ve just hit or missed a milestone.

---

## 7. Channel Playbooks (LLM-Friendly Summary)

### 7.1 In-App UX (V1)

- Always show:
  - Streak.
  - XP bar.
  - Next reward summary.
- For each session complete:
  - Show tiny celebration + clear “next step” (e.g., log via voice, see weekly progress).

### 7.2 Push Notifications (V1)

**Hard rules:**

- Max ~1/day in Week 1, ~2–3/week after.
- Never guilt or blame.
- Always:
  - Mention [DogName] when known.
  - Reference a specific benefit or action.

**LLM is allowed to:**

- Adjust tone per user type (softer for anxious, more “let’s go!” for achievement).
- Pick between templates based on context (onboarding vs re-engagement).

### 7.3 Email (V1)

**Patterns:**

- Short (≤150 words).
- Simple structure:
  1. Warm opening.
  2. Progress recap (if available).
  3. One tip or insight.
  4. Clear CTA.

**LLM is allowed to:**

- Adapt tips to `dog_primary_goal`.
- Rewrite copy for tone, while respecting guardrails.

---

## 8. LLM Implementation Notes & Guardrails

### 8.1 What the LLM *Can* Decide

- Wording of push notifications and emails, within:
  - No guilt / no shame.
  - Dog-first, supportive tone.
- Which template variant to use based on:
  - Lifecycle phase.
  - User type.
  - Recent engagement (streaks, XP, recency).
- How to lightly personalize:
  - Insert [DogName].
  - Reference relevant quests or goals.

### 8.2 What the LLM *Should Not* Do (without explicit instruction)

- Change game economy:
  - XP values, level thresholds, or reward frequency.
- Overwrite user goals or dog data.
- Promise features not in the app.
- Use urgency or FOMO tactics like:
  - “Last chance,” “You’ll lose everything,” “Don’t be lazy,” etc.

### 8.3 Safety & Tone Checks

Before sending content, the LLM should implicitly verify:

- ✅ Copy is encouraging and kind.
- ✅ User is never blamed for inactivity.
- ✅ Suggestions are small, doable, and non-judgmental.
- ✅ Dog is framed as partner/beneficiary, not as a burden.

---

## 9. V1 vs Year-1 Roadmap Summary

**V1 (must-have):**

- Onboarding with:
  - First quest.
  - XP.
  - Streak start.
  - Voice log intro.
- Daily & weekly quests with:
  - Streaks.
  - XP bar and next reward.
- Basic user segmentation:
  - At least 2 types (e.g., achievement vs anxious).
- Push flows:
  - Onboarding.
  - Habit formation (weekly & streak pushes).
  - Basic re-engagement (7 & 14 days).
- Emails:
  - Welcome.
  - Weekly recap in Weeks 2–4.
  - Basic re-engagement emails.

**Year-1 roadmap:**

- Richer user types and adaptive quests.
- Multi-phase onboarding experiments.
- More advanced recap & insights (behavioral changes, “before vs after”).
- Class-style avatar progression (Knight/Mage/Ranger/Healer).
- Seasonal questlines & events.
- Smarter re-engagement paths (e.g., 3-Day Restart packs).

