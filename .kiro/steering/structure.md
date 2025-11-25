---
inclusion: always
---

# Corgi Quest - Project Structure

## Directory Organization

```
corgi-quest/
├── src/
│   ├── routes/              # TanStack Start file-based routes
│   │   ├── index.tsx        # Overview screen (/)
│   │   ├── quests.tsx       # Quests list (/quests)
│   │   ├── activity.tsx     # Activity feed (/activity)
│   │   └── training-mode.tsx # Voice logging (/training-mode)
│   ├── components/          # React components
│   │   ├── dog/            # Dog-related components (StatOrb, ItemsView)
│   │   ├── layout/         # Layout components (TopResourceBar, Layout)
│   │   ├── training/       # Training mode components
│   │   ├── animations/     # Animation components (FloatingXP, PulseWrapper)
│   │   └── mood/           # Mood tracking components
│   ├── hooks/              # Custom React hooks
│   │   ├── useOpenAIRealtime.ts
│   │   ├── useWebSpeechRecognition.ts
│   │   └── useEquipItem.ts
│   └── lib/                # Utility functions
│       ├── trainingModeInstructions.ts
│       └── wakeWordDetection.ts
├── convex/                 # Convex backend
│   ├── schema.ts           # Database schema (11 tables)
│   ├── queries.ts          # Read operations
│   ├── mutations.ts        # Write operations
│   ├── actions.ts          # External API calls
│   └── seed.ts             # Seed data
├── .kiro/                  # Kiro configuration
│   ├── specs/              # Feature specifications
│   ├── steering/           # Steering files
│   └── hooks/              # Agent hooks
└── public/                 # Static assets
```

## Naming Conventions

### Files
- **Routes**: `kebab-case.tsx` (e.g., `training-mode.tsx`)
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
2. Third-party libraries
3. Convex hooks and types
4. Local components
5. Local hooks
6. Local utilities
7. Types

### Example
```typescript
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StatOrb } from "../components/dog/StatOrb";
import { useEquipItem } from "../hooks/useEquipItem";
import { calculateXP } from "../lib/xpCalculations";
import type { DogStats } from "../types";
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
