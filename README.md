# Product Requirements Document: Corgi Quest
## The Real-Time Dog Training RPG for Couples

**Version:** 3.0 MVP (Updated Wireframe Design)  
**Date:** November 8, 2025  
**Target:** TanStack Start Hackathon

---

## Executive Summary

**Product Name:** Corgi Quest  
**Tagline:** Level up your dog together, in real-time  

**One-Liner:** A multiplayer dog training RPG where couples collaborate in real-time to prepare their dog for major life changes (like a baby) by turning daily training into shared quests, XP gains, and stat progression.

**The Hook:** You and your partner both see Bumi's stats update LIVE as either of you complete activities. Training becomes a shared adventure, not a solo chore.

---

## Problem Statement

### The Real Problem
You have a 5-year-old corgi (Bumi) with leash reactivity and aggression issues. You want to have a baby with your wife, but you're scared the dog won't be safe. The biggest challenge isn't knowing WHAT to do—it's **maintaining consistency** when life gets busy.

**The specific pain points:**
1. **Solo burden** - Training feels like YOUR job alone
2. **No accountability** - Easy to skip when partner doesn't know
3. **Miscommunication** - "Did you do mental exercise today?" "I thought you did!"
4. **No shared visibility** - Can't see if progress is actually happening
5. **Regression anxiety** - When you slip, skills deteriorate fast
6. **Partner disconnect** - Wife doesn't feel involved in the process

---

## Core Features (Updated Design)

### 1. Shared Dog Character

**Description:** One dog profile (Bumi) that both partners access simultaneously with real-time updates.

**Character Sheet:**

**Top Resource Bar:**
- TODAY | 💪 45/60 | 🧠 30/45 | 🔥 15
- Quick glance at daily physical/mental stimulation progress + streak
- Updates in real-time as either partner logs activities

**Header:**
- Centered dog name: "Bumi"
- Level badge (LVL 8)
- XP progress bar to next level (4,500/7,000 XP)

**Portrait:**
- Clean dog image/illustration (no stats around it)
- Center of the screen, focal point

**4 Core Stats (Below Portrait):**
1. 🧠 **Intelligence (INT)** - Tricks, training, problem-solving
2. 💪 **Physical (PHY)** - Walks, exercise, play
3. 🛡️ **Impulse Control (IMP)** - Wait, leave it, door manners
4. 👥 **Socialization (SOC)** - Good with people, kids, dogs, new environments

Each stat displays as a circular progress orb showing:
- Stat abbreviation
- Current level
- XP progress ring

**Real-Time Features:**
- Stats update instantly when partner logs activity
- Toast notification: "Sarah logged a walk - +30 PHY XP!"
- Live streak counter updates for both
- Presence indicator: "Sarah is logging..."

---

### 2. Stat Detail View (NEW)

**Description:** Tap any stat orb to see detailed breakdown of that specific stat.

**Stat Detail Screen Shows:**

**Header:**
- Back button
- Stat name (e.g., "Intelligence")
- Current level badge

**XP Progress:**
- Large progress bar to next level
- Percentage complete
- X/Y XP display

**Recent Activities:**
- List of recent activities that earned XP for this stat
- Activity name, XP amount, timestamp
- Example: "Training Session - +20 XP - 2h ago"

**Suggested Activities:**
- AI/system-suggested ways to earn more XP
- Activity name + potential XP reward
- Example: "Teach a new trick - +25 XP"

**Next Milestone:**
- Shows next level and XP needed
- Visual preview of what unlocks

**Real-Time:**
- When partner logs activity for this stat, appears instantly in "Recent Activities"
- XP bar animates to new value

---

### 3. Daily Goals System (NEW)

**Description:** Every day requires both Physical and Mental stimulation. Track progress with points.

**Daily Requirements:**
- **Physical Stimulation:** 60 points/day
  - Walking (30pts), Fetch (15pts), Dog park (40pts), etc.
- **Mental Stimulation:** 45 points/day
  - Training (20pts), Puzzle toys (10pts), New tricks (25pts), etc.

**Points Tracking:**
- Top bar shows current progress: 💪 45/60 | 🧠 30/45
- Overview tab shows breakdown of what earned points today
- Points reset at midnight
- Both partners' activities count toward shared goals

**Goal Completion:**
- Complete both goals = streak continues
- Miss either goal = streak breaks
- Visual feedback when goals met

---

### 4. Activity Logging (Updated)

**Description:** Either partner can log activities via voice. AI parses and awards XP to relevant stats + daily goal points.

**User Flow:**

**Tap "LOG ACTIVITY" button:**
1. Opens voice recording interface
2. User speaks: "30 minute walk in the neighborhood, saw 2 dogs, Bumi stayed calm"
3. AI parses and extracts:
   - Activity type: Walk
   - Duration: 30 minutes
   - Context: Good socialization exposure
4. AI awards:
   - PHY +30 XP
   - SOC +10 XP
   - Physical daily goal +30 pts
5. Confirmation screen shows what was logged
6. User confirms or edits
7. Activity saves and appears in both partners' feeds

**Partner sees in real-time:**
- Toast: "You logged a walk"
- Activity feed updates
- Stats increment with animation
- Daily goal progress updates

**XP Award Logic:**
- Each activity can award XP to multiple stats
- Example: "Training session" → INT +20, IMP +15
- Example: "Dog park visit" → PHY +40, SOC +25
- AI determines which stats benefit based on description

---

### 5. Activity Feed (Shared Timeline)

**Description:** Live feed showing all activities by both partners. Updates in real-time.

**Feed Items:**
- User avatar (S for Sarah, Y for You)
- Activity description
- Emoji indicating type (💪 physical, 🧠 mental, 🏆 boss)
- XP/points awarded
- Timestamp

**Example Feed:**
```
[S] Sarah completed Morning Walk
    💪 +30 pts • 2h ago

[Y] You completed Puzzle Toy
    🧠 +10 pts • 4h ago

[S] Sarah defeated Skateboard Boss
    🏆 +50 pts • 1d ago
```

**Real-Time Updates:**
- New activities appear at top instantly
- Can react with emoji
- Can add quick comments

---

### 6. Quest System (Simplified)

**Description:** Suggested activities organized by category that award specific points.

**Quest Types:**

**Physical Quests:**
- Morning Walk (30 pts)
- Fetch Session (15 pts)
- Dog Park Visit (40 pts)
- Long Walk 60min+ (50 pts)

**Mental Quests:**
- Training Session (20 pts)
- Puzzle Toy (10 pts)
- New Trick Training (25 pts)
- Hide & Seek (15 pts)

**Quest Display:**
- Shows quest name
- Category (Physical/Mental)
- Points awarded
- Completion status (✓ if done today)

**Completion:**
- Tap quest → shows detail/instructions
- Complete in real life
- Log via voice or tap to complete
- Both partners see completion instantly

---

### 7. Progress Dashboard

**Description:** Overview tab showing Bumi's overall progress.

**Key Metrics:**

**Today's Breakdown:**
- Physical activities completed (with point values)
- Mental activities completed (with point values)
- Visual cards showing what's been done

**Stat Overview:**
- 4 stat orbs (clickable for details)
- Visual at-a-glance of strengths/weaknesses

**Streak Display:**
- Current streak (🔥 15 days)
- Visual milestone markers

**Level Progress:**
- Overall level and XP bar
- Shows combined progress across all stats

---

## Navigation & Screens

### **Bottom Navigation (3 tabs):**
1. **OVERVIEW** - Main dashboard (Bumi portrait, stats, daily breakdown)
2. **QUESTS** - Available activities to complete
3. **ACTIVITY** - Feed of all recent activities

### **Primary Action:**
- **LOG ACTIVITY** button (fixed above bottom nav)
- Voice-activated logging
- Most-used action in the app

### **Screen Count (MVP):**
- 3 main nav screens
- 1 stat detail screen (reused for all 4 stats)
- 1 voice logging screen
- 1 log confirmation screen
- 1 quest detail screen

**Total: 7 unique screens**

---

## Database Schema (Simplified)

### **1. users**
```
id
name
email
household_id
created_at
```

### **2. households**
```
id
dog_id
created_at
```

### **3. dogs**
```
id
name (Bumi)
household_id
overall_level (8)
overall_xp (4500)
xp_to_next_level (7000)
photo_url
created_at
```

### **4. dog_stats**
```
id
dog_id
stat_type (INT, PHY, IMP, SOC)
level (7, 9, 5, 6)
xp (580, 1120, 380, 510)
xp_to_next_level (1000, 1200, 800, 900)
```

### **5. activities**
```
id
dog_id
user_id (who logged it)
activity_name (Morning Walk, Training Session, etc)
description (optional voice log text)
duration_minutes
created_at
```

### **6. activity_stat_gains**
```
id
activity_id
stat_type (INT, PHY, IMP, SOC)
xp_amount (30, 20, etc)
```

### **7. daily_goals**
```
id
dog_id
date
physical_points (45)
physical_goal (60)
mental_points (30)
mental_goal (45)
```

### **8. streaks**
```
id
dog_id
current_streak (15)
longest_streak (23)
last_activity_date
```

**Total: 8 tables**

---

## Real-Time Technical Architecture

### Convex Backend

**Key Queries (with Live Subscriptions):**

```typescript
// Get dog stats (subscribes to real-time updates)
export const getDogStats = query({
  args: { dogId: v.id("dogs") },
  handler: async (ctx, args) => {
    const dog = await ctx.db.get(args.dogId);
    const stats = await ctx.db
      .query("dog_stats")
      .filter(q => q.eq(q.field("dogId"), args.dogId))
      .collect();
    return { dog, stats };
  }
});

// Get daily goals
export const getDailyGoals = query({
  args: { dogId: v.id("dogs") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];
    return await ctx.db
      .query("daily_goals")
      .filter(q => 
        q.and(
          q.eq(q.field("dogId"), args.dogId),
          q.eq(q.field("date"), today)
        )
      )
      .first();
  }
});

// Get activity feed
export const getActivityFeed = query({
  args: { dogId: v.id("dogs"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .filter(q => q.eq(q.field("dogId"), args.dogId))
      .order("desc")
      .take(args.limit ?? 20);
  }
});
```

**Key Mutations:**

```typescript
// Log activity with XP awards
export const logActivity = mutation({
  args: { 
    dogId: v.id("dogs"),
    userId: v.id("users"),
    activityName: v.string(),
    description: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    statGains: v.array(v.object({
      statType: v.string(),
      xpAmount: v.number()
    })),
    physicalPoints: v.optional(v.number()),
    mentalPoints: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Create activity
    const activityId = await ctx.db.insert("activities", {
      dogId: args.dogId,
      userId: args.userId,
      activityName: args.activityName,
      description: args.description,
      durationMinutes: args.durationMinutes,
      createdAt: Date.now(),
    });
    
    // Award XP to stats
    for (const gain of args.statGains) {
      await ctx.db.insert("activity_stat_gains", {
        activityId,
        statType: gain.statType,
        xpAmount: gain.xpAmount,
      });
      
      // Update dog_stats
      const stat = await ctx.db
        .query("dog_stats")
        .filter(q => 
          q.and(
            q.eq(q.field("dogId"), args.dogId),
            q.eq(q.field("statType"), gain.statType)
          )
        )
        .first();
      
      if (stat) {
        const newXp = stat.xp + gain.xpAmount;
        const leveledUp = newXp >= stat.xpToNextLevel;
        
        await ctx.db.patch(stat._id, {
          xp: leveledUp ? newXp - stat.xpToNextLevel : newXp,
          level: leveledUp ? stat.level + 1 : stat.level,
        });
      }
    }
    
    // Update daily goals
    const today = new Date().toISOString().split('T')[0];
    const goal = await ctx.db
      .query("daily_goals")
      .filter(q => 
        q.and(
          q.eq(q.field("dogId"), args.dogId),
          q.eq(q.field("date"), today)
        )
      )
      .first();
    
    if (goal) {
      await ctx.db.patch(goal._id, {
        physicalPoints: goal.physicalPoints + (args.physicalPoints || 0),
        mentalPoints: goal.mentalPoints + (args.mentalPoints || 0),
      });
    }
    
    // Check and update streak
    // ... streak logic
    
    return activityId;
  }
});
```

**Scheduled Functions:**

```typescript
// Reset daily goals at midnight
export const resetDailyGoals = internalMutation({
  handler: async (ctx) => {
    const today = new Date().toISOString().split('T')[0];
    const allDogs = await ctx.db.query("dogs").collect();
    
    for (const dog of allDogs) {
      await ctx.db.insert("daily_goals", {
        dogId: dog._id,
        date: today,
        physicalPoints: 0,
        physicalGoal: 60,
        mentalPoints: 0,
        mentalGoal: 45,
      });
    }
  }
});
```

---

## Kiro AI IDE Setup & Development Workflow

### **Prerequisites**
- Download and install Kiro from https://kiro.dev
- Node.js installed
- GitHub account (for authentication)

### **Initial Project Setup**

**Step 1: Configure Kiro MCP Servers**

Open Kiro Settings → Tools & Integrations → MCP Configuration

Add these MCP servers to your `mcp.json`:

```json
{
  "mcpServers": {
    "convex": {
      "command": "npx",
      "args": ["-y", "convex@latest", "mcp", "start"]
    }
  }
}
```

**Step 2: Index Convex Documentation**

In Kiro Settings → Indexing & Docs → Add new doc:
- URL: `https://docs.convex.dev/home`
- This lets you reference @Convex in prompts

**Step 3: Index TanStack Start Documentation**

Add another doc:
- URL: `https://tanstack.com/start/latest`
- Reference with @TanStack in prompts

### **Project Initialization**

**Terminal Commands (Run in Order):**

```bash
# 1. Create TanStack Start project
npm create @tanstack/start@latest corgi-quest
cd corgi-quest

# 2. Install Convex
npm install convex

# 3. Initialize Convex
npx convex dev
# ⚠️ CRITICAL: Keep this running in a separate terminal at all times!

# 4. Install additional dependencies
npm install lucide-react

# 5. Open project in Kiro
kiro .
```

### **Create Steering File**

Create `.kiro/steering.md` in project root:

```markdown
# Corgi Quest Development Guidelines

## Tech Stack Requirements
- TanStack Start (file-based routing in app/routes/)
- Convex for real-time backend (all backend code in convex/ folder)
- React with Hooks only
- Tailwind CSS (core utilities only - no custom config)
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
- Follow the black/white minimalist wireframe design
- No gradients, no colors except black/white/gray

## Real-Time Requirements (MOST IMPORTANT)
- All data must update in real-time using Convex subscriptions
- NO polling, NO manual refetching
- When one user logs activity, other user sees it instantly
- Use optimistic updates where appropriate

## Database Schema
Follow the exact schema in the PRD:
- 8 tables: users, households, dogs, dog_stats, activities, activity_stat_gains, daily_goals, streaks
- Use Convex validators (v.object, v.string, v.number, v.id, etc.)

## UI/UX Requirements
- Mobile-first design (max-w-md mx-auto)
- Bottom navigation (3 tabs)
- LOG ACTIVITY button above bottom nav
- Top resource bar with TODAY stats
- Centered dog name with level badge
- Black and white only - minimalist wireframe style
```

### **Create README.md**

Create `README.md` with the complete PRD (paste the entire PRD document).

### **Start Kiro Spec Session**

1. Open Kiro chat sidebar (right panel)
2. Click "New Session" → Select "Spec" mode
3. Use this initial prompt:

```
I'm building Corgi Quest - a real-time dog training RPG for couples.

Tech Stack:
- TanStack Start
- Convex (real-time backend)
- React + TypeScript
- Tailwind CSS (black/white minimalist)

Read the README.md file for the complete Product Requirements Document.
Read the .kiro/steering.md file for development guidelines.

This is a 9-day hackathon project. The complete PRD is in README.md.

Create a comprehensive spec following these priorities:

1. Database Schema (Convex schema.ts)
2. Core real-time features (stats, activity logging)
3. 7 screens as outlined in PRD
4. Voice logging with Claude API integration

Focus on real-time multiplayer - this is the core feature that must work flawlessly.

Generate requirements, design, and task breakdown for this project.
```

### **Kiro Development Workflow**

**Phase 1: Foundation (Tasks 1-10)**
- Approve Kiro's generated requirements.md
- Approve Kiro's generated design.md
- Review tasks.md - ensure it covers all 8 database tables
- Execute database schema tasks first
- Seed initial test data (you + partner + Bumi)

**Phase 2: Core Features (Tasks 11-30)**
- Overview screen with stats
- Real-time subscriptions working
- Activity logging mutations
- Test with two browser windows constantly

**Phase 3: Additional Screens (Tasks 31-50)**
- Quests screen
- Activity feed
- Stat detail view
- Voice logging UI

**Phase 4: AI Integration (Tasks 51-60)**
- Claude API for voice log parsing
- Activity → Stat XP calculation
- Daily goal tracking

**Phase 5: Polish (Tasks 61-70)**
- UI refinements
- Real-time testing
- Demo preparation

### **Critical Reminders for Kiro**

**Always Keep Running:**
```bash
npx convex dev
```

**Test Real-Time Constantly:**
- Open http://localhost:3000 in two browser tabs
- Log activity in one tab
- Verify it appears in other tab instantly
- If it doesn't, stop and fix before moving forward

**Review Every Task:**
- Don't use autopilot for complex tasks
- Review code diffs before approving
- Test after each task completion
- Kiro can get stuck in loops - catch it early

**When Stuck:**
- Check Convex dev server is running
- Check for TypeScript errors
- Use @Convex docs for help
- Ask Kiro to explain its reasoning

### **Database Seeding Script**

After schema is created, tell Kiro to create this seed script:

```
Create a Convex mutation called `seed:seedDemoData` that:
1. Creates a household
2. Creates a dog named "Bumi" with level 8
3. Creates 4 dog_stats (INT level 7, PHY level 9, IMP level 5, SOC level 6)
4. Creates 2 users (names: "You", "Sarah")
5. Links users to household
6. Creates today's daily_goals (physical: 45/60, mental: 30/45)
7. Creates a streak (current: 15 days)
8. Creates 3-4 sample activities from the past few hours

Use proper Convex validators and follow the schema exactly.
```

Then run: `npx convex run seed:seedDemoData`

### **Common Kiro Issues & Solutions**

**Issue:** Kiro uses fetch() to call Convex
**Solution:** Stop it immediately. Remind it to use useQuery/useMutation hooks

**Issue:** Types not found from convex
**Solution:** Ensure `npx convex dev` is running. Check convex/_generated exists.

**Issue:** Real-time not working
**Solution:** Verify using useQuery with proper subscription. Check Convex dashboard for live queries.

**Issue:** Kiro making too many files
**Solution:** Remind it to follow TanStack Start file-based routing structure

**Issue:** Not following wireframe design
**Solution:** Show it the wireframe artifact and emphasize black/white minimalist design

---

## MVP Build Plan (Updated - 9 Days)

**Note:** Accounts will be pre-seeded in Convex DB. No auth/onboarding needed for demo.

### Days 1-2: Foundation
- ✅ TanStack Start + Convex project setup
- ✅ Seed DB with household, both user accounts, dog profile (Bumi)
- ✅ Dog profile with 4 stats (INT, PHY, IMP, SOC)
- ✅ Basic UI structure
- ✅ Real-time subscription hooks working

### Days 3-4: Core Real-Time Loop
- ✅ Daily goal system (physical/mental points)
- ✅ Real-time daily goal updates (CRITICAL - showcase Convex)
- ✅ Activity logging with stat XP awards
- ✅ Level-up detection and celebration
- ✅ Streak counter (shared)
- ✅ Activity feed with real-time updates
- ✅ Toast notifications when partner does something

### Days 5-6: Voice + AI + Stat Details
- ✅ Voice logging interface (Web Speech API)
- ✅ Claude API integration for parsing (streaming via TanStack server functions)
- ✅ Voice log → auto-award XP to multiple stats
- ✅ Real-time log appearance in feed
- ✅ Stat detail view (click on orb → see breakdown)
- ✅ Recent activities per stat
- ✅ Suggested activities per stat

### Days 7-8: Polish + Quests
- ✅ Quest system (suggested activities)
- ✅ Quest detail view
- ✅ Progress dashboard with 4 stats
- ✅ Top resource bar (TODAY, daily goals, streak)
- ✅ All sponsor integrations complete and visible in demo
- ✅ Polished animations for level-ups

### Day 9: Demo Prep
- ✅ Test with two devices extensively
- ✅ Use app together with wife for real (collect authentic data)
- ✅ Record demo video showing:
  - Two phones side-by-side
  - Real-time sync moments
  - Voice logging with AI
  - Stat detail views
  - Progress dashboard
- ✅ Practice demo script with explicit Convex callouts
- ✅ Submit by 12 PM PT

---

## Success Criteria

### Hackathon Success
✅ Real-time multiplayer works flawlessly  
✅ Both partners can log activities simultaneously  
✅ Stats update instantly on both devices  
✅ Voice logging with AI parsing is reliable  
✅ Daily goal system tracks progress accurately
✅ All sponsor tools integrated and visible  
✅ Demo video shows authentic two-person usage  
🎯 **Goal: Win Top 3, possibly 1st place**

### Product Success (Post-Launch)
- 70%+ 30-day retention (higher than solo apps)
- Both partners active 3+ days/week each
- Couples report improved dog behavior
- Partner activity increases accountability
- Daily goals completed 5+ days/week

---

## Why This Wins

### Technical Excellence
- Real-time sync across multiple clients
- Multi-stat XP award system
- Streaming AI responses
- Complex state management with Convex
- Optimistic UI updates

### Novel Concept
- **First multiplayer dog training app**
- RPG mechanics for serious behavioral work
- Couples accountability system
- Real-time progress sharing
- Daily goal tracking

### Emotional Impact
- Authentic story: preparing dog for baby
- Relationship angle: working together
- High stakes: baby safety depends on this
- Visible outcome: Stat progression + daily goals

### Demo-Friendly
- Can show two phones side-by-side
- Live stat updates
- Real-time activity logging
- Partner notifications appearing
- "Watch what happens when my wife logs a walk..."

---

**END OF UPDATED PRD**