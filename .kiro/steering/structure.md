---
inclusion: always
---

# Corgi Quest - Project Structure

## Directory Organization

```
corgi-quest/
├── src/
│   ├── routes/              # TanStack Start file-based routes
│   │   ├── __root.tsx       # Root layout
│   │   ├── index.tsx        # Hackathon landing page (/)
│   │   ├── waitlist.tsx     # Waitlist signup (/waitlist)
│   │   ├── thanks.tsx       # Post-signup confirmation (/thanks)
│   │   ├── bumi.tsx         # Bumi character page (/bumi)
│   │   ├── app.tsx          # App layout wrapper
│   │   ├── app.index.tsx    # Overview screen (/app)
│   │   ├── app.activity.tsx # Activity feed (/app/activity)
│   │   ├── app.quests.tsx   # Quests layout (/app/quests)
│   │   ├── app.quests.index.tsx    # Quests list
│   │   ├── app.quests.$questId.tsx # Quest detail
│   │   ├── app.stats.$statType.tsx # Stat detail (/app/stats/:statType)
│   │   ├── app.log-activity.tsx    # Voice logging (/app/log-activity)
│   │   ├── app.training-mode.tsx   # Training mode (/app/training-mode)
│   │   └── app.select-character.tsx # Character selection
│   ├── components/          # React components (grouped by feature)
│   │   ├── activity/       # Activity feed components
│   │   ├── animations/     # Animation components (FloatingXP, PulseWrapper)
│   │   ├── character/      # Character selection components
│   │   ├── dog/            # Dog-related components (StatOrb, ItemsView, StatsView)
│   │   ├── hackathon/      # Hackathon landing page sections
│   │   ├── icons/          # Custom icon components
│   │   ├── layout/         # Layout components (TopResourceBar, Layout)
│   │   ├── mood/           # Mood tracking components
│   │   ├── quests/         # Quest-related components
│   │   ├── stats/          # Stats visualization components
│   │   ├── summary/        # Weekly summary components
│   │   ├── training/       # Training mode components
│   │   ├── ui/             # Shared UI components (ProgressBar, Toast)
│   │   ├── voice/          # Voice interface components
│   │   └── waitlist/       # Waitlist page components
│   ├── contexts/           # React context providers
│   │   └── ToastContext.tsx
│   ├── data/               # Static data files
│   ├── hooks/              # Custom React hooks
│   │   ├── useActiveDog.ts
│   │   ├── useAnimationTrigger.ts
│   │   ├── useConfetti.ts
│   │   ├── useConvexConnection.ts
│   │   ├── useDemoLogin.ts
│   │   ├── useEquipItem.ts
│   │   ├── useMoodReminder.ts
│   │   ├── useOpenAIRealtime.ts
│   │   ├── useSelectedCharacter.ts
│   │   ├── useSimpleVoiceRecognition.ts
│   │   ├── useStaleQuery.ts
│   │   ├── useWebSpeechRecognition.ts
│   │   └── useWeeklySummary.ts
│   ├── lib/                # Utility functions
│   │   ├── activeDogStorage.ts
│   │   ├── animationUtils.ts
│   │   ├── convex.ts
│   │   ├── dateUtils.ts
│   │   ├── demoLogin.ts
│   │   ├── openai.ts
│   │   ├── trainingModeInstructions.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   ├── wakeWordDetection.ts
│   │   └── xpCalculations.ts
│   ├── router.tsx          # TanStack router configuration
│   └── styles.css          # Global styles
├── convex/                 # Convex backend
│   ├── schema.ts           # Database schema (18 tables)
│   ├── queries.ts          # Read operations
│   ├── mutations.ts        # Write operations
│   ├── actions.ts          # External API calls (AI, Firecrawl)
│   ├── crons.ts            # Scheduled jobs
│   ├── waitlist.ts         # Waitlist functions
│   └── seed.ts             # Seed data
├── server/                 # Server-side API routes
│   └── api/                # Nitro API endpoints
├── .kiro/                  # Kiro configuration
│   ├── specs/              # Feature specifications
│   ├── steering/           # Steering files
│   └── hooks/              # Agent hooks
└── public/                 # Static assets (images, icons)
```

## Component Organization

Components are grouped by feature in `src/components/`:

| Folder | Purpose | Key Components |
|--------|---------|----------------|
| `activity/` | Activity feed display | ActivityFeedItem, TodaysBreakdown |
| `animations/` | XP and level-up effects | FloatingXP, PulseWrapper, AnimationErrorBoundary |
| `character/` | Character selection | CharacterCard, CharacterSelection |
| `dog/` | Dog stats and cosmetics | StatOrb, StatsView, ItemsView, RadarChart, DogMenu |
| `hackathon/` | Landing page sections | HeroSection, FeatureGrid, TechStackSection |
| `icons/` | Custom SVG icons | MenuIcons |
| `layout/` | App shell and navigation | Layout, TopResourceBar |
| `mood/` | Mood tracking | MoodPicker, MoodFeedItem, MoodReminderPopup |
| `quests/` | Quest system | QuestCard, QuestBanner, AIRecommendations |
| `stats/` | Stats visualization | DailyXpChart, WeeklyXpChart, StreakCard |
| `summary/` | Weekly summaries | WeeklySummaryModal |
| `training/` | Training mode UI | TrainingModeInterface, ListeningIndicator, LiveTranscript |
| `ui/` | Shared UI primitives | ProgressBar, Toast, OptimizedBackground |
| `voice/` | Voice interfaces | RealtimeVoiceInterface |
| `waitlist/` | Waitlist page | WaitlistHero, WaitlistStatus, HowItWorks |

## Naming Conventions

### Files
- **Routes**: `kebab-case.tsx` or `dot.notation.tsx` (e.g., `app.training-mode.tsx`)
- **Components**: `PascalCase.tsx` (e.g., `StatOrb.tsx`)
- **Hooks**: `camelCase.ts` with `use` prefix (e.g., `useEquipItem.ts`)
- **Utilities**: `camelCase.ts` (e.g., `wakeWordDetection.ts`)
- **Convex functions**: `camelCase.ts` (e.g., `mutations.ts`)

### Code
- **Components**: `PascalCase` (e.g., `StatOrb`, `TopResourceBar`)
- **Functions**: `camelCase` (e.g., `logActivity`, `calculateXP`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `XP_PER_LEVEL`)
- **Types/Interfaces**: `PascalCase` (e.g., `DogStats`, `ActivityLog`)

## Import Patterns

### Order
1. React and framework imports
2. Third-party libraries (lucide-react, etc.)
3. Convex hooks and API
4. Local components
5. Local hooks
6. Local utilities
7. Types

### Example (from a route file in src/routes/)
```typescript
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import StatGrid from "../components/dog/StatGrid";
import TopResourceBar from "../components/layout/TopResourceBar";
import { useActiveDog } from "../hooks/useActiveDog";
import { calculateXP } from "../lib/xpCalculations";
import type { StatType } from "../lib/types";
```

### Example (from a component in src/components/dog/)
```typescript
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lightbulb, Zap, Shield, Users } from "lucide-react";
import { StatType } from "../../lib/types";
import { useAnimationTrigger } from "../../hooks/useAnimationTrigger";
import FloatingXP from "../animations/FloatingXP";
```

## Component Patterns

### Functional Components Only
```typescript
interface Props {
  dogId: string;
  statType: "PHY" | "INT" | "IMP" | "SOC";
}

export function StatOrb({ dogId, statType }: Props) {
  // Component logic
}
```

### Convex Data Fetching
```typescript
// ✅ Correct: Use hooks
const dog = useQuery(api.queries.getDog, { dogId });
const updateStat = useMutation(api.mutations.updateStat);

// ❌ Wrong: Never use fetch
const response = await fetch("/api/dog");
```

## File Organization Rules

1. **One component per file** (except small helper components)
2. **Co-locate related files** (component + styles + tests)
3. **Group by feature** in components/ (not by type)
4. **Keep routes flat** (no nested route folders)
5. **Convex functions by type** (queries, mutations, actions)

## Architectural Principles

- **Mobile-first**: All layouts use `max-w-md mx-auto`
- **Real-time subscriptions**: No manual refetching
- **Optimistic updates**: Instant UI feedback
- **Type safety**: No `any` types
- **Accessibility**: Semantic HTML, ARIA labels
