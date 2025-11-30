# Corgi Quest — Steering Docs Guide

*How we use Kiro steering files to maintain consistency across 40+ components and ensure every AI interaction follows our project standards.*

---

## What Are Steering Docs?

Steering docs are markdown files in `.kiro/steering/` that provide persistent context to Kiro. Unlike one-off prompts, steering docs are automatically loaded into every AI interaction, ensuring consistent guidance without repetition.

Think of them as **project-wide instructions** that shape how Kiro understands and contributes to your codebase.

---

## Our Steering Architecture

```
.kiro/steering/
├── product.md              # What we're building and why
├── tech.md                 # Technology stack and constraints
├── structure.md            # File organization and patterns
└── development-guidelines.md  # Implementation rules
```

Each file serves a distinct purpose, and together they form a complete picture of the project.

---

## Inclusion Modes

Steering files support three inclusion modes via front-matter:

### 1. Always Included (Default)
```yaml
---
inclusion: always
---
```
Loaded in every Kiro interaction. We use this for all our steering docs because Corgi Quest has consistent patterns across the entire codebase.

### 2. File Match (Conditional)
```yaml
---
inclusion: fileMatch
fileMatchPattern: 'convex/**/*.ts'
---
```
Only loaded when working with files matching the pattern. Useful for framework-specific guidance.

### 3. Manual
```yaml
---
inclusion: manual
---
```
Only loaded when explicitly referenced via `#SteeringFileName` in chat. Good for specialized contexts.

---

## Our Four Steering Files

### 1. `product.md` — The "Why"

**Purpose:** Keeps Kiro aligned with product vision and user needs.

**Key Sections:**
- **Purpose** — Why Corgi Quest exists (training Bumi, preparing for baby)
- **Target Users** — Who we're building for (couples, reactive dog owners)
- **Key Features** — All 15+ features with descriptions
- **Core Values** — Real-time first, hands-free, couple-centered

**Impact:** When Kiro suggests features or writes copy, it understands the emotional context. It knows we're building for real-world training sessions, not just a gamified app.

**Example Influence:**
```
❌ Without product.md: "Add a leaderboard to compare with other users"
✅ With product.md: "Add partner presence indicator to encourage coordination"
```

---

### 2. `tech.md` — The "How"

**Purpose:** Defines technology choices and constraints.

**Key Sections:**
- **Frontend Framework** — TanStack Start, React 18+, TypeScript
- **Backend & Real-Time** — Convex patterns (hooks, not fetch)
- **Styling** — Tailwind CSS, mobile-first, B&W only
- **Voice & AI** — Web Speech API, Claude, OpenAI
- **Architecture Decisions** — What we explicitly avoid

**Impact:** Prevents Kiro from suggesting incompatible technologies or patterns.

**Example Influence:**
```typescript
// ❌ Without tech.md: Kiro might suggest
const data = await fetch('/api/dogs');

// ✅ With tech.md: Kiro always uses
const data = useQuery(api.queries.getDogs);
```

**Critical Constraints Enforced:**
- No REST API calls (Convex hooks only)
- No Redux/Zustand (Convex handles state)
- No CSS-in-JS (Tailwind only)
- No class components (functional + hooks only)
- No manual refetching (real-time subscriptions)

---

### 3. `structure.md` — The "Where"

**Purpose:** Documents file organization and naming conventions.

**Key Sections:**
- **Directory Organization** — Full tree with explanations
- **Component Organization** — Feature-based grouping
- **Naming Conventions** — Files and code patterns
- **Import Patterns** — Ordering rules with examples
- **Component Patterns** — TypeScript interfaces, Convex fetching

**Impact:** New files land in the right place with correct naming.

**Example Influence:**
```
❌ Without structure.md: 
   src/components/StatOrb.tsx (flat structure)
   
✅ With structure.md:
   src/components/dog/StatOrb.tsx (feature-grouped)
```

**Import Order Enforced:**
1. React and framework imports
2. Third-party libraries
3. Convex hooks and API
4. Local components
5. Local hooks
6. Local utilities
7. Types

---

### 4. `development-guidelines.md` — The "Rules"

**Purpose:** Specific implementation requirements and patterns.

**Key Sections:**
- **Tech Stack Requirements** — Reinforces tech.md
- **Convex Patterns (CRITICAL)** — Detailed hook usage
- **Real-Time Requirements** — No polling, instant sync
- **Database Schema** — All 18 tables listed
- **UI/UX Requirements** — Mobile-first, RPG theme
- **Screen Requirements** — All 13 screens defined

**Impact:** Ensures consistency in implementation details.

**Example Influence:**
```typescript
// ❌ Without guidelines: Generic mobile layout
<div className="container mx-auto">

// ✅ With guidelines: Corgi Quest mobile-first
<div className="max-w-md mx-auto">
```

---

## How Steering Docs Work Together

When you ask Kiro to create a new component, all four files inform the response:

| Question | Steering File | Answer |
|----------|---------------|--------|
| What should this feature do? | `product.md` | Align with core values |
| What tech should I use? | `tech.md` | Convex hooks, Tailwind |
| Where should the file go? | `structure.md` | `src/components/[feature]/` |
| How should I implement it? | `development-guidelines.md` | Mobile-first, real-time |

---

## Real Examples from Corgi Quest

### Example 1: Creating a New Stat Component

**Request:** "Create a component to display dog intelligence stat"

**Kiro's Response (informed by steering):**

```typescript
// File: src/components/dog/IntelligenceStat.tsx (structure.md)

import { useQuery } from "convex/react";        // tech.md: Convex hooks
import { api } from "../../convex/_generated/api";
import { Lightbulb } from "lucide-react";       // tech.md: lucide-react
import type { StatType } from "../../lib/types"; // structure.md: import order

interface Props {
  dogId: string;  // development-guidelines.md: TypeScript types
}

export function IntelligenceStat({ dogId }: Props) {
  // tech.md: useQuery, not fetch
  const stats = useQuery(api.queries.getDogStats, { dogId });
  
  return (
    // development-guidelines.md: max-w-md mx-auto
    <div className="max-w-md mx-auto p-4">
      {/* product.md: RPG-style progression */}
      <div className="flex items-center gap-2">
        <Lightbulb className="w-6 h-6" />
        <span>INT: {stats?.intelligence ?? 0}</span>
      </div>
    </div>
  );
}
```

### Example 2: Adding a New Feature

**Request:** "Add mood tracking to the app"

**Kiro's Response (informed by steering):**

1. **Product alignment** (product.md): Mood tracking helps correlate training with emotional state
2. **Tech choice** (tech.md): Store in Convex, use real-time subscriptions
3. **File location** (structure.md): `src/components/mood/MoodPicker.tsx`
4. **Implementation** (development-guidelines.md): Mobile-first UI, Convex hooks

---

## Best Practices We Follow

### 1. Keep Steering Docs Focused
Each file has one job. Don't mix product vision with technical constraints.

### 2. Use Concrete Examples
Abstract rules are hard to follow. We include code snippets showing correct patterns.

### 3. Mark Critical Sections
We use **(CRITICAL)** and **(MOST IMPORTANT)** to highlight non-negotiable rules.

### 4. Update When Patterns Change
When we add a new technology or change a pattern, we update steering docs immediately.

### 5. Reference Other Files
Our steering docs reference each other (e.g., "See structure.md for file locations").

---

## Steering vs. Specs vs. Hooks

| Feature | Purpose | Scope |
|---------|---------|-------|
| **Steering** | Persistent project context | Every interaction |
| **Specs** | Feature-specific requirements | Single feature |
| **Hooks** | Automated actions on events | Triggered workflows |

**Steering** provides the foundation. **Specs** build features on that foundation. **Hooks** automate maintenance.

---

## Creating New Steering Files

If you need specialized guidance for a subset of files:

```yaml
---
inclusion: fileMatch
fileMatchPattern: 'CorgiQuestVR/**/*.swift'
---

# VisionOS Development Guidelines

## SwiftUI Patterns
- Use @Observable for state management
- Prefer RealityKit for 3D content
- Follow Apple HIG for spatial computing
```

This loads only when working on the VR app, keeping web development context clean.

---

## Troubleshooting

### Kiro Ignores Steering Rules
1. Check front-matter syntax (must be valid YAML)
2. Verify `inclusion: always` is set
3. Restart Kiro to reload steering files

### Conflicting Guidance
If two steering files conflict, the more specific one wins. `development-guidelines.md` overrides `tech.md` for implementation details.

### Too Much Context
If steering docs become too long, split by inclusion mode:
- Keep critical rules in `always` files
- Move specialized guidance to `fileMatch` files

---

## Summary

Our steering docs ensure every Kiro interaction produces code that:
- ✅ Aligns with product vision (couples, real-time, hands-free)
- ✅ Uses correct technology (Convex hooks, Tailwind, TypeScript)
- ✅ Lands in the right location (feature-grouped components)
- ✅ Follows implementation patterns (mobile-first, real-time)

This consistency across 40+ components and 15+ features would be impossible to maintain manually. Steering docs make it automatic.
