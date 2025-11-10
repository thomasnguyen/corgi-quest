# Design Document: Corgi Quest MVP

## Overview

Corgi Quest is a real-time multiplayer dog training RPG built with TanStack Start for the frontend and Convex for the real-time backend. The architecture prioritizes real-time synchronization as the core technical showcase, enabling two partners to see each other's training activities appear instantly across devices.

The application follows a mobile-first design approach with a custom CSS implementation based on Figma specifications. The design emphasizes a minimalist black-and-white aesthetic with clear information hierarchy and intuitive navigation. Voice-based activity logging uses OpenAI Realtime API for audio-to-audio conversations with automatic activity saving.

### Key Design Principles

1. **Real-Time First**: Every data mutation triggers immediate updates across all connected clients
2. **Mobile-Optimized**: Touch-friendly interface designed for one-handed use
3. **Figma-Driven**: Exact implementation of provided Figma design specifications
4. **Minimal Friction**: Voice logging reduces typing; AI parsing reduces manual categorization
5. **Shared Accountability**: Both partners see the same data simultaneously

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Browser)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         TanStack Start (React + TypeScript)            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │   Routes     │  │  Components  │  │   Hooks     │ │ │
│  │  │ (File-based) │  │   (React)    │  │  (Convex)   │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  │  ┌────────────────────────────────────────────────┐   │ │
│  │  │  @pipecat-ai/voice-ui-kit (Audio Visualization)│   │ │
│  │  └────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket (Real-time subscriptions)
                              │ HTTPS (Mutations)
                              │ WebSocket (OpenAI Realtime API)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Convex Backend Layer                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Convex Functions                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────┐  │ │
│  │  │ Queries  │  │Mutations │  │ Actions            │  │ │
│  │  │(Real-time│  │ (Write)  │  │ (Session Tokens)   │  │ │
│  │  │Subscribe)│  │          │  │                    │  │ │
│  │  └──────────┘  └──────────┘  └────────────────────┘  │ │
│  │  ┌────────────────────┐                               │ │
│  │  │ Scheduled Functions│                               │ │
│  │  │  (Cron jobs)       │                               │ │
│  │  └────────────────────┘                               │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Convex Database (11 Tables)               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket (Audio streaming)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  OpenAI Realtime API                                   │ │
│  │  - Audio-to-audio voice conversations                  │ │
│  │  - Activity parsing via function calling               │ │
│  │  - Spoken confirmations with XP details                │ │
│  │  - Natural conversation interruptions                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- TanStack Start (React framework with file-based routing)
- React 18+ (functional components with hooks)
- TypeScript (strict mode)
- Custom CSS/CSS Modules (Figma design implementation)
- Lucide React (icon library)
- @pipecat-ai/voice-ui-kit (audio visualization)

**Backend:**
- Convex (real-time database and backend functions)
- Convex validators (schema validation)
- Scheduled functions (daily goal resets)
- Convex actions (OpenAI session token generation)

**External APIs:**
- OpenAI Realtime API for audio-to-audio voice conversations with function calling
- OpenAI Chat Completion API for AI-powered activity recommendations
- OpenAI DALL-E API or Stable Diffusion API for AI image generation of dog with cosmetic items


## Components and Interfaces

### Frontend Component Structure

```
src/
├── routes/                          # TanStack Start file-based routing
│   ├── index.tsx                    # Overview screen (default route) or character selection
│   ├── select-character.tsx         # Character selection screen
│   ├── quests.tsx                   # Quests list screen
│   ├── activity.tsx                 # Activity feed screen
│   ├── bumi.tsx                     # BUMI character sheet screen
│   ├── stats.$statType.tsx          # Stat detail screen (dynamic route)
│   ├── quests.$questId.tsx          # Quest detail screen (dynamic route)
│   └── log-activity.tsx             # Voice logging screen with OpenAI Realtime API
├── components/
│   ├── layout/
│   │   ├── BottomNav.tsx            # 4-tab navigation (Overview, Quests, Activity, BUMI)
│   │   ├── TopResourceBar.tsx       # Daily goals + streak display
│   │   ├── LogActivityButton.tsx    # Fixed action button
│   │   └── Layout.tsx               # Main layout wrapper
│   ├── character/
│   │   ├── CharacterSelection.tsx    # Character selection screen
│   │   └── CharacterCard.tsx        # Individual character card (gacha-style)
│   ├── dog/
│   │   ├── DogProfile.tsx           # Dog name, level, XP bar, portrait
│   │   ├── StatOrb.tsx              # Individual stat circular progress
│   │   └── StatGrid.tsx             # 4-stat grid layout
│   ├── activity/
│   │   ├── ActivityFeedItem.tsx     # Single activity in feed
│   │   ├── ActivityFeed.tsx         # List of activities
│   │   └── ActivityToast.tsx        # Real-time notification toast
│   ├── mood/
│   │   ├── MoodPicker.tsx           # Mood selection modal
│   │   └── MoodFeedItem.tsx         # Single mood entry in feed
│   ├── quests/
│   │   ├── QuestCard.tsx            # Quest list item
│   │   ├── QuestList.tsx            # Categorized quest list
│   │   ├── QuestDetail.tsx          # Quest instructions
│   │   ├── QuestTabs.tsx            # Tab navigation (All Quests / AI Recommendations)
│   │   └── AIRecommendations.tsx    # AI recommendations display
│   ├── dog/
│   │   ├── DogProfile.tsx           # Dog name, level, XP bar, portrait
│   │   ├── StatOrb.tsx              # Individual stat circular progress
│   │   ├── StatGrid.tsx             # 4-stat grid layout
│   │   ├── BumiCharacterSheet.tsx    # BUMI tab main component
│   │   ├── StatsView.tsx             # STATS sub-tab with radar chart
│   │   ├── ItemsView.tsx            # ITEMS sub-tab with cosmetic items
│   │   ├── RadarChart.tsx           # Spider/pentagon chart for stats
│   │   └── ItemCard.tsx            # Individual cosmetic item card
│   ├── voice/
│   │   ├── RealtimeVoiceInterface.tsx  # OpenAI Realtime API interface
│   │   ├── AudioVisualizer.tsx         # @pipecat-ai/voice-ui-kit VoiceVisualizer
│   │   └── ConversationDisplay.tsx     # Show conversation state
│   └── ui/
│       ├── ProgressBar.tsx          # Linear progress bar
│       ├── ProgressRing.tsx         # Circular progress indicator
│       ├── Toast.tsx                # Toast notification component
│       └── LevelBadge.tsx           # Level display badge
├── hooks/
│   ├── useConvexQuery.ts            # Wrapper for Convex useQuery
│   ├── useConvexMutation.ts         # Wrapper for Convex useMutation
│   ├── useOpenAIRealtime.ts         # OpenAI Realtime API WebSocket connection
│   ├── useRealtimeUpdates.ts        # Real-time subscription management
│   └── useOptimisticUpdate.ts       # Optimistic UI update logic
├── lib/
│   ├── convex.ts                    # Convex client setup
│   ├── types.ts                     # TypeScript type definitions
│   └── utils.ts                     # Utility functions
└── styles/
    ├── globals.css                  # Global styles
    ├── variables.css                # CSS custom properties
    └── components/                  # Component-specific styles
        ├── layout.module.css
        ├── dog.module.css
        ├── activity.module.css
        └── voice.module.css
```

### Convex Backend Structure

```
convex/
├── schema.ts                        # Database schema definitions
├── queries/
│   ├── dogs.ts                      # Dog profile queries
│   ├── stats.ts                     # Stat queries
│   ├── activities.ts                # Activity feed queries
│   ├── dailyGoals.ts                # Daily goal queries
│   ├── streaks.ts                   # Streak queries
│   ├── quests.ts                    # Quest queries
│   └── characters.ts                # Character/user queries
├── mutations/
│   ├── logActivity.ts               # Main activity logging mutation
│   ├── updateStats.ts               # Stat XP and level updates
│   ├── updateDailyGoals.ts          # Daily goal point updates
│   ├── updateStreak.ts              # Streak increment/reset
│   └── seed.ts                      # Demo data seeding
├── actions/
│   ├── generateSessionToken.ts      # OpenAI Realtime API session token generation
│   ├── generateRecommendations.ts  # OpenAI API for activity recommendations
│   └── generateItemImage.ts         # AI image generation for cosmetic items
├── crons.ts                         # Scheduled functions
└── lib/
    ├── validators.ts                # Reusable Convex validators
    ├── xpCalculations.ts            # XP and level-up logic
    └── constants.ts                 # Quest definitions, XP tables
```

### Key Interfaces and Types

```typescript
// Core Data Types
interface Dog {
  _id: Id<"dogs">;
  name: string;
  householdId: Id<"households">;
  overallLevel: number;
  overallXp: number;
  xpToNextLevel: number;
  photoUrl?: string;
  createdAt: number;
}

interface DogStat {
  _id: Id<"dog_stats">;
  dogId: Id<"dogs">;
  statType: "INT" | "PHY" | "IMP" | "SOC";
  level: number;
  xp: number;
  xpToNextLevel: number;
}

interface Activity {
  _id: Id<"activities">;
  dogId: Id<"dogs">;
  userId: Id<"users">;
  activityName: string;
  description?: string;
  durationMinutes?: number;
  createdAt: number;
}

interface ActivityStatGain {
  _id: Id<"activity_stat_gains">;
  activityId: Id<"activities">;
  statType: "INT" | "PHY" | "IMP" | "SOC";
  xpAmount: number;
}

interface DailyGoal {
  _id: Id<"daily_goals">;
  dogId: Id<"dogs">;
  date: string; // YYYY-MM-DD format
  physicalPoints: number;
  physicalGoal: number;
  mentalPoints: number;
  mentalGoal: number;
}

interface Streak {
  _id: Id<"streaks">;
  dogId: Id<"dogs">;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // YYYY-MM-DD format
}

interface MoodLog {
  _id: Id<"mood_logs">;
  dogId: Id<"dogs">;
  userId: Id<"users">;
  mood: "calm" | "anxious" | "reactive" | "playful" | "tired" | "neutral";
  note?: string;
  activityId?: Id<"activities">;
  createdAt: number;
}

interface AIRecommendation {
  activityName: string;
  reasoning: string; // Why this activity is recommended
  expectedMoodImpact: string; // e.g., "Reduces weekend anxiety"
  statGains: Array<{
    statType: "INT" | "PHY" | "IMP" | "SOC";
    xpAmount: number;
  }>;
  physicalPoints: number;
  mentalPoints: number;
  durationMinutes?: number;
}

interface CosmeticItem {
  _id: Id<"cosmetic_items">;
  name: string;
  description: string;
  unlockLevel: number; // Level required to unlock (e.g., 2, 3, 4...)
  itemType: "warrior" | "mage" | "ranger" | "paladin" | "rogue" | "cleric" | "bard" | "monk" | "wizard" | "knight" | "archer" | "ninja" | "priest" | "druid" | "sorcerer" | "barbarian" | "fighter" | "warlock" | "ranger" | "artificer";
  icon: string; // Emoji or icon identifier
  generatedImageUrl?: string; // AI-generated image URL (stored after generation)
}

interface EquippedItem {
  _id: Id<"equipped_items">;
  dogId: Id<"dogs">;
  itemId: Id<"cosmetic_items">;
  generatedImageUrl: string; // AI-generated image of dog with item
  equippedAt: number; // Timestamp
}

interface Character {
  _id: Id<"users">;
  name: string;
  avatarUrl?: string; // Optional character portrait/avatar
  title?: string; // Optional title/role (e.g., "Primary Trainer", "Play Partner")
  householdId: Id<"households">;
}

// Component Props Types
interface StatOrbProps {
  statType: "INT" | "PHY" | "IMP" | "SOC";
  level: number;
  xp: number;
  xpToNextLevel: number;
  onClick: () => void;
}

interface ActivityFeedItemProps {
  activity: Activity;
  statGains: ActivityStatGain[];
  userName: string;
  userAvatar: string;
}

interface RealtimeVoiceInterfaceProps {
  onActivitySaved: (activityId: Id<"activities">) => void;
  onError: (error: Error) => void;
}

// OpenAI Realtime API Types
interface OpenAISessionConfig {
  sessionToken: string;
  model: string;
  voice: string;
  instructions: string;
  tools: Array<FunctionDefinition>;
}

interface SaveActivityFunctionCall {
  activityName: string;
  durationMinutes?: number;
  statGains: Array<{
    statType: "INT" | "PHY" | "IMP" | "SOC";
    xpAmount: number;
  }>;
  physicalPoints: number;
  mentalPoints: number;
}
```

## Progression System

### XP and Leveling

**Linear Progression:**
- Each level requires 100 XP (constant across all levels)
- Formula: `xpToNextLevel = 100`
- No level cap (unlimited progression)
- Both overall dog level and individual stat levels follow this pattern

**XP Sources:**
- Activities are the sole source of XP
- Each activity can grant XP to 1-4 stats simultaneously
- XP amounts vary based on activity type and duration
- Activities also contribute to daily goal progress

### Stat System

**Four Core Stats:**
1. **PHY (Physical/Fitness)** - Exercise, walks, physical activities
2. **IMP (Impulse Control/Happiness)** - Training, obedience, self-control
3. **INT (Intelligence)** - Mental stimulation, puzzle toys, learning
4. **SOC (Social)** - Playdates, socialization, interactions

**Stat Progression:**
- Each stat has its own level and XP counter
- Stats level up independently based on activities
- Some activities affect only 1 stat, others affect multiple
- Stat levels are displayed as circular progress orbs

**Overall Dog Level:**
- Separate from individual stat levels
- Gains XP from all activities
- Represents the dog's overall progress
- Displayed prominently with the dog's name

### Activity XP Tables

**Duration-Based Activities:**
Activities that scale with time spent:

| Activity | Base XP/10min | Stats Affected | Physical Points | Mental Points |
|----------|---------------|----------------|-----------------|---------------|
| Walk | 15 XP | PHY (100%) | 10 | 0 |
| Run/Jog | 25 XP | PHY (100%) | 15 | 0 |
| Fetch | 20 XP | PHY (70%), IMP (30%) | 12 | 3 |
| Tug-of-War | 18 XP | PHY (60%), IMP (40%) | 10 | 5 |
| Swimming | 30 XP | PHY (100%) | 20 | 0 |

**Fixed-Duration Activities:**
Activities with standard XP amounts:

| Activity | XP Amount | Stats Affected | Physical Points | Mental Points |
|----------|-----------|----------------|-----------------|---------------|
| Training Session | 40 XP | IMP (60%), INT (40%) | 0 | 15 |
| Puzzle Toy | 30 XP | INT (100%) | 0 | 10 |
| Playdate | 35 XP | SOC (70%), PHY (30%) | 8 | 7 |
| Grooming | 20 XP | IMP (50%), SOC (50%) | 0 | 8 |
| Trick Practice | 25 XP | INT (60%), IMP (40%) | 0 | 10 |
| Sniff Walk | 20 XP | INT (60%), PHY (40%) | 5 | 8 |
| Dog Park Visit | 40 XP | SOC (50%), PHY (50%) | 12 | 8 |

**Example Calculations:**
- 20-minute walk: `20 / 10 * 15 = 30 XP` to PHY, `20 points` to physical goal
- 30-minute fetch: `30 / 10 * 20 = 60 XP` split as `42 XP` to PHY, `18 XP` to IMP
- Training session: `40 XP` split as `24 XP` to IMP, `16 XP` to INT

### Daily Goals Integration

**Two Goal Types:**
1. **Physical Goal** - Default: 50 points/day
2. **Mental Goal** - Default: 30 points/day

**Point Allocation:**
- Each activity contributes points to one or both goals
- Physical activities (walks, fetch, runs) → Physical points
- Mental activities (training, puzzles) → Mental points
- Hybrid activities (playdate, sniff walk) → Both
- XP gained also counts toward daily goal progress

**Goal Completion:**
- Goals reset at midnight (local timezone)
- Completing both goals maintains streak
- Missing a day resets streak to 0
- Goals are shared between both partners (household-level)

### AI Parsing Rules with OpenAI Realtime API

When OpenAI Realtime API processes voice input, it should:

1. **Listen to Audio** - Process audio stream directly without text transcription
2. **Identify Activity Type** from the spoken description
3. **Extract Duration** if mentioned (for duration-based activities)
4. **Calculate XP** based on activity type and duration
5. **Distribute XP** to appropriate stats based on activity table
6. **Assign Points** to physical/mental goals
7. **Call saveActivity Function** with structured parameters
8. **Respond with Spoken Confirmation** including activity details and XP awards

**Example Voice Conversation Flow:**

**User speaks:** "We went on a 25-minute walk this morning"

**OpenAI calls function:**
```json
{
  "name": "saveActivity",
  "parameters": {
    "activityName": "Walk",
    "durationMinutes": 25,
    "statGains": [
      { "statType": "PHY", "xpAmount": 38 }
    ],
    "physicalPoints": 25,
    "mentalPoints": 0
  }
}
```

**OpenAI speaks:** "Logged! 25 minute walk - that's 38 XP for Physical. Great job!"

---

**User speaks:** "Bumi played fetch for about 15 minutes then we did some training"

**OpenAI calls function:**
```json
{
  "name": "saveActivity",
  "parameters": {
    "activityName": "Fetch + Training",
    "durationMinutes": 15,
    "statGains": [
      { "statType": "PHY", "xpAmount": 21 },
      { "statType": "IMP", "xpAmount": 33 },
      { "statType": "INT", "xpAmount": 16 }
    ],
    "physicalPoints": 18,
    "mentalPoints": 15
  }
}
```

**OpenAI speaks:** "Logged! 15 minutes of fetch and training - that's 21 XP for Physical, 33 XP for Impulse Control, and 16 XP for Intelligence. Awesome work!"

### Level-Up Mechanics

**When a Stat Levels Up:**
1. Calculate overflow XP: `overflowXP = (currentXP + xpGained) - xpToNextLevel`
2. Increment level: `newLevel = currentLevel + 1`
3. Set new XP: `newXP = overflowXP`
4. Set new threshold: `xpToNextLevel = 100`
5. Show level-up toast notification
6. Update stat orb with animation

**When Overall Level Increases:**
- Same calculation as stat level-up
- More prominent celebration animation
- Update level badge next to dog name
- Show XP bar progress

**Multiple Level-Ups:**
- If overflow XP > 100, continue leveling up
- Example: 250 XP gained at 80/100 → Level up twice, end at 30/100

## Data Models

### Database Schema (Convex)

#### 1. users
```typescript
users: defineTable({
  name: v.string(),
  email: v.string(),
  householdId: v.id("households"),
  avatarUrl: v.optional(v.string()), // Optional character portrait/avatar URL
  title: v.optional(v.string()), // Optional title/role (e.g., "Primary Trainer", "Play Partner")
  createdAt: v.number(),
})
  .index("by_household", ["householdId"])
  .index("by_email", ["email"]);
```

#### 2. households
```typescript
households: defineTable({
  dogId: v.id("dogs"),
  createdAt: v.number(),
});
```

#### 3. dogs
```typescript
dogs: defineTable({
  name: v.string(),
  householdId: v.id("households"),
  overallLevel: v.number(),
  overallXp: v.number(),
  xpToNextLevel: v.number(),
  photoUrl: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_household", ["householdId"]);
```

#### 4. dog_stats
```typescript
dog_stats: defineTable({
  dogId: v.id("dogs"),
  statType: v.union(
    v.literal("INT"),
    v.literal("PHY"),
    v.literal("IMP"),
    v.literal("SOC")
  ),
  level: v.number(),
  xp: v.number(),
  xpToNextLevel: v.number(),
})
  .index("by_dog", ["dogId"])
  .index("by_dog_and_stat", ["dogId", "statType"]);
```

#### 5. activities
```typescript
activities: defineTable({
  dogId: v.id("dogs"),
  userId: v.id("users"),
  activityName: v.string(),
  description: v.optional(v.string()),
  durationMinutes: v.optional(v.number()),
  createdAt: v.number(),
})
  .index("by_dog", ["dogId"])
  .index("by_dog_and_created", ["dogId", "createdAt"]);
```

#### 6. activity_stat_gains
```typescript
activity_stat_gains: defineTable({
  activityId: v.id("activities"),
  statType: v.union(
    v.literal("INT"),
    v.literal("PHY"),
    v.literal("IMP"),
    v.literal("SOC")
  ),
  xpAmount: v.number(),
})
  .index("by_activity", ["activityId"]);
```

#### 7. daily_goals
```typescript
daily_goals: defineTable({
  dogId: v.id("dogs"),
  date: v.string(), // YYYY-MM-DD
  physicalPoints: v.number(),
  physicalGoal: v.number(),
  mentalPoints: v.number(),
  mentalGoal: v.number(),
})
  .index("by_dog", ["dogId"])
  .index("by_dog_and_date", ["dogId", "date"]);
```

#### 8. streaks
```typescript
streaks: defineTable({
  dogId: v.id("dogs"),
  currentStreak: v.number(),
  longestStreak: v.number(),
  lastActivityDate: v.string(), // YYYY-MM-DD
})
  .index("by_dog", ["dogId"]);
```

#### 9. mood_logs
```typescript
mood_logs: defineTable({
  dogId: v.id("dogs"),
  userId: v.id("users"),
  mood: v.union(
    v.literal("calm"),
    v.literal("anxious"),
    v.literal("reactive"),
    v.literal("playful"),
    v.literal("tired"),
    v.literal("neutral")
  ),
  note: v.optional(v.string()),
  activityId: v.optional(v.id("activities")), // Optional link to activity
  createdAt: v.number(),
})
  .index("by_dog", ["dogId"])
  .index("by_dog_and_created", ["dogId", "createdAt"]);
```

#### 10. cosmetic_items
```typescript
cosmetic_items: defineTable({
  name: v.string(),
  description: v.string(),
  unlockLevel: v.number(), // Level required to unlock (1 per level, starting at level 2)
  itemType: v.string(), // e.g., "warrior", "mage", "ranger", etc.
  icon: v.string(), // Emoji or icon identifier
  createdAt: v.number(),
})
  .index("by_unlock_level", ["unlockLevel"]);
```

#### 11. equipped_items
```typescript
equipped_items: defineTable({
  dogId: v.id("dogs"),
  itemId: v.id("cosmetic_items"),
  generatedImageUrl: v.string(), // AI-generated image URL
  equippedAt: v.number(),
})
  .index("by_dog", ["dogId"]);
  // Note: Only one item can be equipped per dog at a time
  // When equipping a new item, the previous equipped item is automatically unequipped
```

### Data Flow Diagrams

#### Activity Logging Flow
```
User taps "LOG ACTIVITY"
         │
         ▼
Generate OpenAI Session Token (Convex Action)
         │
         ▼
Open Realtime Voice Interface
         │
         ▼
Establish WebSocket connection to OpenAI
         │
         ▼
Display Audio Visualizer (@pipecat-ai/voice-ui-kit)
         │
         ▼
User speaks about activity
         │
         ▼
Stream audio to OpenAI Realtime API
         │
         ▼
OpenAI processes audio (no text transcription)
         │
         ▼
OpenAI calls saveActivity function with parameters
         │
         ▼
Convex Mutation: saveActivity
         │
         ├─► Insert activity record
         ├─► Insert activity_stat_gains records
         ├─► Update dog_stats (XP + levels)
         ├─► Update daily_goals (points)
         ├─► Update streaks (if applicable)
         │
         ▼
OpenAI speaks confirmation
"Logged! 20 minute walk - that's 30 XP for Physical. Great job!"
         │
         ▼
Real-time subscriptions trigger
         │
         ├─► Update local user's UI
         └─► Update partner's UI via WebSocket
         │
         ▼
Redirect to Activity Feed
```

#### Real-Time Subscription Flow
```
Component mounts
         │
         ▼
useQuery hook subscribes to Convex query
         │
         ▼
Convex establishes WebSocket connection
         │
         ▼
Initial data returned
         │
         ▼
Component renders with data
         │
         ▼
[Partner logs activity on their device]
         │
         ▼
Convex mutation updates database
         │
         ▼
Convex detects query result changed
         │
         ▼
Convex pushes update via WebSocket
         │
         ▼
useQuery hook receives new data
         │
         ▼
Component re-renders with updated data
         │
         ▼
Toast notification appears
```

#### Mood Logging Flow
```
User taps "LOG MOOD" button or resource bar mood indicator
         │
         ▼
Open mood picker modal
         │
         ▼
User selects mood (😊 Calm, 😰 Anxious, etc.)
         │
         ▼
User optionally adds note
         │
         ▼
User confirms mood log
         │
         ▼
Convex Mutation: logMood
         │
         ├─► Insert mood_logs record
         │
         ▼
Real-time subscriptions trigger
         │
         ├─► Update resource bar mood indicator
         ├─► Add mood entry to activity feed
         ├─► Show toast notification to partner
         │
         ▼
Mood appears in feed instantly
```

#### Daily Mood Reminder Flow
```
User opens app after 6pm
         │
         ▼
System checks: mood logged today?
         │
         ├─► Yes → No reminder
         └─► No → Show reminder popup
         │
         ▼
User sees: "How is Bumi feeling today?"
         │
         ├─► "Log Mood Now" → Opens mood picker
         ├─► "Remind Me Later" → Dismisses for 2 hours
         └─► "Dismiss" → Dismisses for the day
```

#### AI Recommendations Generation Flow
```
User opens Quests screen → Selects "AI RECOMMENDATIONS" tab
         │
         ▼
Check if cached recommendations exist (from today)
         │
         ├─► Yes → Display cached recommendations
         └─► No → Generate new recommendations
         │
         ▼
Convex Action: generateRecommendations
         │
         ├─► Query mood logs (last 7 days)
         ├─► Query activity history (last 7 days)
         ├─► Query current stats and daily goals
         │
         ▼
Send data to OpenAI API (Chat Completion)
         │
         ▼
OpenAI analyzes patterns and generates recommendations
         │
         ▼
Parse OpenAI response into structured recommendations
         │
         ▼
Cache recommendations in Convex (optional table or return directly)
         │
         ▼
Display recommendations in UI
         │
         ▼
User taps "Log Activity" → Navigate to /log-activity with activity name
```

#### Item Equipping and Image Generation Flow
```
User opens BUMI tab → Selects "ITEMS" sub-tab
         │
         ▼
Display unlocked items (based on dog's current level)
         │
         ▼
User taps item to equip
         │
         ▼
Check if image already generated for this item
         │
         ├─► Yes → Equip immediately, update portrait
         └─► No → Generate new image
         │
         ▼
Convex Mutation: equipItem
         │
         ├─► Delete existing equipped_items record for this dog (only one at a time)
         ├─► Check if image exists for new item
         │   ├─► Yes → Use existing image
         │   └─► No → Call generateItemImage action
         │       ├─► Get base Bumi photo from dog record
         │       ├─► Create prompt: "A corgi dog wearing [item name], [item type] style, [description]"
         │       └─► Call OpenAI DALL-E API or Stable Diffusion API
         │
         ▼
Insert new equipped_items record
         │
         ▼
Update dog's portrait in real-time
         │
         ├─► Update local user's UI
         └─► Update partner's UI via WebSocket
         │
         ▼
Portrait updates instantly on both devices
```

#### Level Up Item Unlock Flow
```
Dog levels up (stat or overall level)
         │
         ▼
Check if new item unlocks at this level
         │
         ├─► No → Continue
         └─► Yes → Unlock item
         │
         ▼
Convex Action: generateItemImage (background)
         │
         ├─► Generate image for newly unlocked item
         ├─► Save to equipped_items (but don't equip yet)
         │
         ▼
Item appears in ITEMS tab as "New!" badge
         │
         ▼
User can equip when ready (image already generated)
```

#### Character Selection Flow
```
User opens app
         │
         ▼
Check localStorage for selected character
         │
         ├─► Character selected → Navigate to Overview
         └─► No character selected → Show Character Selection screen
         │
         ▼
Display 3 character cards (vertical scrollable list)
         │
         ├─► Character 1: "You" (Primary Trainer)
         ├─► Character 2: "Sarah" (Play Partner)
         └─► Character 3: "Alex" (Training Buddy)
         │
         ▼
User taps character card
         │
         ▼
Store selected character ID in localStorage
         │
         ▼
Navigate to Overview screen
         │
         ▼
Use selected character for all actions (logging, mood tracking)
```


## Error Handling

### Error Categories and Strategies

#### 1. Network Errors
**Scenarios:**
- Loss of internet connection during activity logging
- Convex WebSocket disconnection
- OpenAI Realtime API timeout or unavailability

**Handling Strategy:**
- Display connection status indicator in top bar
- Queue mutations locally when offline
- Retry mutations automatically when connection restored
- Show user-friendly error messages with retry options
- Maintain optimistic UI updates with rollback on failure

**Implementation:**
```typescript
// Convex mutation with retry logic
const logActivity = useMutation(api.mutations.logActivity);

const handleLogActivity = async (data: ActivityData) => {
  try {
    await logActivity(data);
  } catch (error) {
    if (error.message.includes("network")) {
      // Queue for retry
      queueMutation("logActivity", data);
      showToast("Activity saved locally. Will sync when online.", "info");
    } else {
      showToast("Failed to log activity. Please try again.", "error");
    }
  }
};
```

#### 2. Voice Recording and OpenAI Realtime API Errors
**Scenarios:**
- Microphone permission denied
- OpenAI session token generation fails
- WebSocket connection to OpenAI fails
- OpenAI Realtime API service unavailable
- Audio streaming interrupted

**Handling Strategy:**
- Request microphone permissions with clear explanation
- Generate session token before opening voice interface
- Implement automatic WebSocket reconnection with exponential backoff
- Show connection status indicator during voice logging
- Allow user to retry if connection fails
- Display clear error messages for each failure type

**Implementation:**
```typescript
const useOpenAIRealtime = () => {
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const generateToken = useAction(api.actions.generateSessionToken);

  const requestPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
    } catch (error) {
      setHasPermission(false);
      showToast("Microphone access required for voice logging", "error");
    }
  };

  const connect = async () => {
    try {
      setConnectionStatus("connecting");
      const sessionToken = await generateToken();
      
      // Establish WebSocket connection to OpenAI
      const ws = new WebSocket(`wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`);
      
      ws.onopen = () => {
        setConnectionStatus("connected");
        // Send session configuration
      };
      
      ws.onerror = () => {
        setConnectionStatus("error");
        showToast("Failed to connect to voice service", "error");
      };
      
      return ws;
    } catch (error) {
      setConnectionStatus("error");
      showToast("Failed to initialize voice logging", "error");
      throw error;
    }
  };

  return { connectionStatus, hasPermission, requestPermission, connect };
};
```

#### 3. AI Function Calling Errors
**Scenarios:**
- OpenAI function call fails to execute
- Function parameters are invalid or incomplete
- saveActivity mutation fails
- OpenAI doesn't understand the activity description

**Handling Strategy:**
- Validate function call parameters before executing mutation
- Provide clear error messages if mutation fails
- Allow user to retry voice logging
- OpenAI can ask clarifying questions if activity is unclear
- Log errors for debugging and improvement

**Implementation:**
```typescript
const handleFunctionCall = async (functionCall: FunctionCall) => {
  try {
    if (functionCall.name === "saveActivity") {
      const params = JSON.parse(functionCall.arguments);
      
      // Validate parameters
      if (!params.activityName || !params.statGains || params.statGains.length === 0) {
        throw new Error("Invalid activity parameters");
      }
      
      // Execute mutation
      const activityId = await saveActivityMutation(params);
      
      // Return success to OpenAI
      return {
        success: true,
        activityId,
      };
    }
  } catch (error) {
    showToast("Failed to save activity. Please try again.", "error");
    
    // Return error to OpenAI so it can inform the user
    return {
      success: false,
      error: error.message,
    };
  }
};
```

#### 4. Data Validation Errors
**Scenarios:**
- Invalid stat type provided
- Negative XP values
- Missing required fields
- Invalid date formats

**Handling Strategy:**
- Use Convex validators to enforce schema at database level
- Validate data on client before sending mutation
- Provide clear error messages indicating which field is invalid
- Prevent form submission until validation passes

**Implementation:**
```typescript
// Convex validator example
export const logActivityValidator = {
  dogId: v.id("dogs"),
  userId: v.id("users"),
  activityName: v.string(),
  statGains: v.array(
    v.object({
      statType: v.union(
        v.literal("INT"),
        v.literal("PHY"),
        v.literal("IMP"),
        v.literal("SOC")
      ),
      xpAmount: v.number(), // Convex will reject negative numbers if we add custom validation
    })
  ),
};
```

#### 5. Real-Time Sync Errors
**Scenarios:**
- Conflicting updates from both partners simultaneously
- Stale data displayed due to missed WebSocket message
- Race condition in optimistic updates

**Handling Strategy:**
- Rely on Convex's built-in conflict resolution (last-write-wins)
- Use optimistic updates with automatic reconciliation
- Display loading states during mutations
- Show sync status indicator
- Implement exponential backoff for reconnection attempts

**Implementation:**
```typescript
const useRealtimeSync = () => {
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("synced");
  
  const convexClient = useConvexClient();
  
  useEffect(() => {
    const handleConnectionChange = (state: ConnectionState) => {
      if (state.isWebSocketConnected) {
        setSyncStatus("synced");
      } else {
        setSyncStatus("error");
      }
    };
    
    convexClient.onUpdate(handleConnectionChange);
    
    return () => {
      // Cleanup
    };
  }, [convexClient]);
  
  return syncStatus;
};
```

### Error UI Components

**Toast Notification Levels:**
- `error`: Red background, critical issues requiring user action
- `warning`: Yellow background, issues that may need attention
- `info`: Blue background, informational messages
- `success`: Green background, successful operations

**Error Message Guidelines:**
- Be specific about what went wrong
- Provide actionable next steps
- Avoid technical jargon
- Include retry options when applicable
- Show error codes only in development mode

## Testing Strategy

### Unit Testing

**Framework:** Vitest (recommended for TanStack Start projects)

**Coverage Areas:**
1. **Utility Functions**
   - XP calculation logic
   - Level-up detection
   - Date formatting
   - Stat type validation

2. **Custom Hooks**
   - `useVoiceRecording` state management
   - `useOptimisticUpdate` rollback logic
   - `useRealtimeUpdates` subscription handling

3. **Component Logic**
   - StatOrb XP percentage calculation
   - ActivityFeedItem timestamp formatting
   - ProgressBar percentage clamping

**Example Test:**
```typescript
import { describe, it, expect } from 'vitest';
import { calculateLevelUp } from '../lib/xpCalculations';

describe('calculateLevelUp', () => {
  it('should level up when XP exceeds threshold', () => {
    const result = calculateLevelUp({
      currentLevel: 5,
      currentXp: 800,
      xpToNextLevel: 1000,
      xpGained: 300,
    });
    
    expect(result.newLevel).toBe(6);
    expect(result.newXp).toBe(100); // Overflow
    expect(result.leveledUp).toBe(true);
  });
  
  it('should not level up when XP is below threshold', () => {
    const result = calculateLevelUp({
      currentLevel: 5,
      currentXp: 800,
      xpToNextLevel: 1000,
      xpGained: 100,
    });
    
    expect(result.newLevel).toBe(5);
    expect(result.newXp).toBe(900);
    expect(result.leveledUp).toBe(false);
  });
});
```

### Integration Testing

**Framework:** Vitest + Testing Library

**Coverage Areas:**
1. **Convex Query Integration**
   - Test that components correctly subscribe to queries
   - Verify data updates trigger re-renders
   - Test loading and error states

2. **Convex Mutation Integration**
   - Test that mutations are called with correct arguments
   - Verify optimistic updates work correctly
   - Test rollback on mutation failure

3. **Voice Recording Flow**
   - Test permission request flow
   - Test recording start/stop
   - Test transcription callback

**Example Test:**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { ConvexProvider } from 'convex/react';
import { DogProfile } from '../components/dog/DogProfile';

describe('DogProfile Integration', () => {
  it('should display dog data from Convex query', async () => {
    render(
      <ConvexProvider client={mockConvexClient}>
        <DogProfile dogId="test-dog-id" />
      </ConvexProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Bumi')).toBeInTheDocument();
      expect(screen.getByText('LVL 8')).toBeInTheDocument();
    });
  });
});
```

### End-to-End Testing

**Framework:** Playwright (recommended for full browser testing)

**Coverage Areas:**
1. **Critical User Flows**
   - Complete activity logging flow (voice → parse → confirm → save)
   - Navigate between all 7 screens
   - View stat detail and return to overview
   - Complete a quest from quest list

2. **Real-Time Synchronization**
   - Open two browser contexts (simulating two users)
   - Log activity in context A
   - Verify activity appears in context B within 1 second
   - Verify stat updates appear in context B

3. **Mobile Responsiveness**
   - Test on mobile viewport sizes
   - Verify touch targets are accessible
   - Test voice recording on mobile

**Example Test:**
```typescript
import { test, expect } from '@playwright/test';

test('real-time activity sync between users', async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();
  
  await pageA.goto('http://localhost:3000');
  await pageB.goto('http://localhost:3000');
  
  // User A logs activity
  await pageA.click('button:has-text("LOG ACTIVITY")');
  await pageA.fill('input[name="activityName"]', 'Morning Walk');
  await pageA.click('button:has-text("Confirm")');
  
  // Verify appears on User B's screen
  await expect(pageB.locator('text=Morning Walk')).toBeVisible({ timeout: 2000 });
});
```

### Manual Testing Checklist

**Real-Time Features:**
- [ ] Open app on two devices/browsers simultaneously
- [ ] Log activity on device A, verify appears on device B within 1 second
- [ ] Verify stat XP updates in real-time on both devices
- [ ] Verify daily goal progress updates in real-time
- [ ] Verify streak counter updates at midnight
- [ ] Test with poor network conditions (throttle to 3G)

**Voice Logging:**
- [ ] Test OpenAI Realtime API connection establishment
- [ ] Test audio streaming with clear speech
- [ ] Test with background noise
- [ ] Test with various activity descriptions
- [ ] Verify AI function calling accuracy across different phrasings
- [ ] Test spoken confirmation responses from OpenAI
- [ ] Test conversation interruptions (user interrupting OpenAI)
- [ ] Test audio visualization with @pipecat-ai/voice-ui-kit
- [ ] Test automatic activity saving after confirmation
- [ ] Test WebSocket reconnection on connection loss

**UI/UX:**
- [ ] Verify Figma design matches implementation pixel-perfect
- [ ] Test on iOS Safari and Android Chrome
- [ ] Test all touch targets are at least 44x44px
- [ ] Verify animations are smooth (60fps)
- [ ] Test with screen reader for accessibility
- [ ] Verify all text is readable (sufficient contrast)

**Data Integrity:**
- [ ] Verify XP calculations are correct
- [ ] Verify level-ups occur at correct thresholds
- [ ] Verify daily goals reset at midnight
- [ ] Verify streak increments/resets correctly
- [ ] Test with edge cases (0 XP, max level, etc.)

### Performance Testing

**Metrics to Monitor:**
1. **Real-Time Latency**
   - Target: < 1 second from mutation to UI update on partner's device
   - Measure: Time from button click to toast notification appearance

2. **Initial Load Time**
   - Target: < 2 seconds to interactive on 3G
   - Measure: Time to First Contentful Paint (FCP) and Time to Interactive (TTI)

3. **Voice Interface Performance**
   - Target: < 500ms to establish WebSocket connection
   - Target: < 200ms audio streaming latency
   - Target: < 1 second for OpenAI to start speaking response

4. **AI Function Calling Performance**
   - Target: < 2 seconds from end of user speech to function call execution
   - Target: < 3 seconds total from speech end to spoken confirmation start
   - Implement timeout at 10 seconds with error handling

**Tools:**
- Lighthouse for web vitals
- Chrome DevTools Performance tab
- Convex Dashboard for query performance
- Custom timing logs for real-time latency

### Testing Priorities for 9-Day Hackathon

**Days 1-2 (Foundation):**
- Unit tests for XP calculation logic
- Integration tests for Convex schema
- Manual testing of database seeding

**Days 3-4 (Core Features):**
- Integration tests for activity logging mutation
- Manual real-time testing with two browsers
- E2E test for basic activity flow

**Days 5-6 (Voice + AI):**
- Integration tests for OpenAI Realtime API connection
- Manual testing of audio streaming and function calling
- Test various voice input scenarios and conversation flows
- Test audio visualization with @pipecat-ai/voice-ui-kit

**Days 7-8 (Polish):**
- E2E tests for all 7 screens
- Real-time sync testing on actual devices
- Performance testing and optimization

**Day 9 (Demo Prep):**
- Final manual testing with wife on two phones
- Record demo video showing real-time sync
- Test demo script multiple times

### Continuous Testing During Development

**After Each Task:**
1. Run relevant unit tests
2. Manually test the feature in browser
3. Check for TypeScript errors
4. Verify real-time updates still work
5. Test on mobile viewport

**Before Moving to Next Task:**
1. Ensure all tests pass
2. Verify no console errors
3. Check Convex dashboard for query errors
4. Confirm feature works in both user contexts

---

## OpenAI Realtime API Integration

### Session Token Generation

**Convex Action Implementation:**
```typescript
// convex/actions/generateSessionToken.ts
import { action } from "./_generated/server";

export const generateSessionToken = action(async () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }
  
  const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview-2024-10-01",
      voice: "alloy",
    }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to generate session token");
  }
  
  const data = await response.json();
  return data.client_secret.value;
});
```

### Function Definition for saveActivity

**OpenAI Function Schema:**
```typescript
const saveActivityFunction = {
  name: "saveActivity",
  description: "Save a dog training activity with XP rewards for stats and daily goal points",
  parameters: {
    type: "object",
    properties: {
      activityName: {
        type: "string",
        description: "Name of the activity (e.g., 'Walk', 'Training Session', 'Fetch')",
      },
      durationMinutes: {
        type: "number",
        description: "Duration of the activity in minutes (optional for fixed-duration activities)",
      },
      statGains: {
        type: "array",
        description: "Array of stat XP gains",
        items: {
          type: "object",
          properties: {
            statType: {
              type: "string",
              enum: ["INT", "PHY", "IMP", "SOC"],
              description: "Stat type: INT (Intelligence), PHY (Physical), IMP (Impulse Control), SOC (Social)",
            },
            xpAmount: {
              type: "number",
              description: "Amount of XP to award to this stat",
            },
          },
          required: ["statType", "xpAmount"],
        },
      },
      physicalPoints: {
        type: "number",
        description: "Points to add to daily physical goal (0-60)",
      },
      mentalPoints: {
        type: "number",
        description: "Points to add to daily mental goal (0-45)",
      },
    },
    required: ["activityName", "statGains", "physicalPoints", "mentalPoints"],
  },
};
```

### System Instructions for OpenAI

**Prompt Configuration:**
```
You are a helpful assistant for Corgi Quest, a dog training RPG. Your role is to help users log their dog's activities by listening to their descriptions and calling the saveActivity function with appropriate XP rewards.

When a user describes an activity:
1. Identify the activity type (walk, training, fetch, etc.)
2. Extract the duration if mentioned
3. Calculate XP based on these rules:
   - Walks: 15 XP per 10 minutes to PHY
   - Runs: 25 XP per 10 minutes to PHY
   - Fetch: 20 XP per 10 minutes (70% PHY, 30% IMP)
   - Training: 40 XP fixed (60% IMP, 40% INT)
   - Puzzle toys: 30 XP fixed to INT
   - Playdates: 35 XP fixed (70% SOC, 30% PHY)
4. Assign physical and mental points appropriately
5. Call the saveActivity function
6. Respond with an enthusiastic confirmation including the activity name, duration (if applicable), and XP awards for each stat

Example response: "Logged! 20 minute walk - that's 30 XP for Physical. Great job!"

Be conversational, encouraging, and concise. If the user's description is unclear, ask a brief clarifying question.
```

### WebSocket Connection Management

**Client-Side Implementation Pattern:**
```typescript
const useOpenAIRealtimeConnection = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const generateToken = useAction(api.actions.generateSessionToken);
  
  const connect = async () => {
    const token = await generateToken();
    
    const websocket = new WebSocket(
      `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "OpenAI-Beta": "realtime=v1",
        },
      }
    );
    
    websocket.onopen = () => {
      // Send session configuration
      websocket.send(JSON.stringify({
        type: "session.update",
        session: {
          instructions: SYSTEM_INSTRUCTIONS,
          tools: [saveActivityFunction],
          voice: "alloy",
          input_audio_transcription: { model: "whisper-1" },
        },
      }));
    };
    
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleRealtimeMessage(message);
    };
    
    setWs(websocket);
    return websocket;
  };
  
  return { ws, connect };
};
```

### Audio Visualization with @pipecat-ai/voice-ui-kit

**Component Usage:**
```typescript
import { VoiceVisualizer } from "@pipecat-ai/voice-ui-kit";

const RealtimeVoiceInterface = () => {
  const [isListening, setIsListening] = useState(false);
  
  return (
    <div className="voice-interface">
      <VoiceVisualizer
        isListening={isListening}
        barCount={32}
        barColor="#000000"
        barGap={4}
        barWidth={4}
        barMinHeight={4}
        barMaxHeight={100}
      />
    </div>
  );
};
```

### Environment Variables Required

```bash
# .env.local
OPENAI_API_KEY=sk-proj-...
CONVEX_DEPLOYMENT=...
```

### Key Implementation Notes

1. **Session Token Lifecycle**: Tokens are ephemeral and should be generated fresh for each voice logging session
2. **WebSocket Reconnection**: Implement exponential backoff for reconnection attempts (1s, 2s, 4s, 8s, max 30s)
3. **Audio Format**: OpenAI expects PCM16 audio at 24kHz sample rate
4. **Function Call Handling**: Client must respond to function calls with results to complete the conversation loop
5. **Conversation State**: Track conversation state (idle, listening, processing, speaking) for UI feedback
6. **Error Recovery**: Always provide a way for users to retry or cancel the voice logging session
7. **Microphone Permissions**: Request permissions before attempting to connect to OpenAI
8. **Audio Playback**: OpenAI's audio responses must be played through the device speakers for the user to hear confirmations

