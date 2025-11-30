# Corgi Quest — Kiro Hooks Guide

*How we use agent hooks to automate documentation, validation, and content generation across the entire development workflow.*

---

## What Are Kiro Hooks?

Hooks are automated agent actions triggered by events in your workspace. When you save a file, create a component, or manually invoke a hook, Kiro executes a predefined prompt to perform tasks like:

- Updating documentation
- Validating code patterns
- Generating marketing content
- Checking accessibility
- Syncing spec tasks

Think of hooks as **event-driven AI assistants** that handle repetitive tasks automatically.

---

## Our Hook Architecture

```
.kiro/hooks/
├── schema-documentation.kiro.hook      # Docs sync
├── spec-task-sync.kiro.hook            # Task generation
├── training-mode-docs.kiro.hook        # Feature docs
├── convex-pattern-check.kiro.hook      # Code validation
├── cross-reference-validator.kiro.hook # Schema consistency
├── accessibility-audit.kiro.hook       # A11y checks
├── performance-budget.kiro.hook        # Mobile perf
├── component-test-reminder.kiro.hook   # Test prompts
├── changelog-generator.kiro.hook       # Release notes
├── marketing-content-generator.kiro.hook # Tweet ideas
├── tweet-generator.kiro.hook           # Social content
└── demo-script-generator.kiro.hook     # Presentation prep
```

We have 12 hooks organized into four categories:
1. **Documentation** — Keep docs in sync with code
2. **Validation** — Catch issues before they ship
3. **Testing** — Encourage good test coverage
4. **Content** — Generate marketing and demo materials

---

## Hook Anatomy

Every hook is a JSON file with three parts:

```json
{
  "name": "Human-readable name",
  "description": "What this hook does",
  "trigger": {
    "type": "onFileSave | onFileCreate | manual",
    "filePattern": "glob/pattern/**/*.ts"
  },
  "action": {
    "type": "agentPrompt",
    "prompt": "Instructions for Kiro..."
  },
  "enabled": true
}
```

### Trigger Types

| Type | When It Fires | Use Case |
|------|---------------|----------|
| `onFileSave` | File matching pattern is saved | Validation, doc sync |
| `onFileCreate` | New file matching pattern created | Scaffolding, reminders |
| `manual` | User clicks "Run" in Kiro UI | On-demand generation |

### File Patterns

Patterns use glob syntax:
- `convex/schema.ts` — Exact file
- `src/components/**/*.tsx` — All TSX in components
- `.kiro/specs/**/tasks.md` — Tasks in any spec folder
- `convex/{schema,queries,mutations}.ts` — Multiple specific files

---

## Our 12 Hooks Explained

### Category 1: Documentation Hooks

#### 1. Schema Documentation Sync
**File:** `schema-documentation.kiro.hook`
**Trigger:** `convex/schema.ts` saved

```json
{
  "trigger": {
    "type": "onFileSave",
    "filePattern": "convex/schema.ts"
  }
}
```

**What it does:**
- Reads the current Convex schema (18 tables)
- Updates `docs/schema-overview.md` with:
  - Table descriptions and purposes
  - Field types and relationships
  - Index definitions
  - Real-time subscription patterns

**Why it matters:** Schema changes are frequent during development. This hook ensures documentation never drifts from reality.

**Example output:**
```markdown
## dogs
Stores dog profiles linked to households.

| Field | Type | Description |
|-------|------|-------------|
| householdId | Id<"households"> | Parent household |
| name | string | Dog's display name |
| level | number | Current overall level |
| imageUrl | string? | Profile photo URL |

**Subscribed by:** Overview screen, Dog menu, Activity feed
```

---

#### 2. Spec Task Sync
**File:** `spec-task-sync.kiro.hook`
**Trigger:** `.kiro/specs/**/requirements.md` saved

**What it does:**
- Reads updated requirements and design docs
- Regenerates `tasks.md` with:
  - Actionable implementation tasks
  - Acceptance criteria
  - Dependencies and complexity estimates
- Preserves completed task status

**Why it matters:** When requirements change, tasks update automatically instead of becoming stale.

**Example flow:**
```
Edit requirements.md → Save → Hook fires →
tasks.md regenerated with new tasks →
Completed tasks preserved
```

---

#### 3. Training Mode Pipeline Docs
**File:** `training-mode-docs.kiro.hook`
**Trigger:** `src/components/training/**/*.tsx` saved

**What it does:**
- Analyzes the voice → AI → XP pipeline
- Updates `docs/training-mode-pipeline.md` with:
  - Voice input methods (Web Speech API, OpenAI Realtime)
  - AI processing flow
  - Database mutations
  - Real-time UI updates

**Why it matters:** Training mode is our most complex feature. This hook keeps its documentation current as we iterate.

**Example diagram generated:**
```
User speaks → Wake word detected → Recording starts →
Audio sent to OpenAI → Activity parsed →
Convex mutation called → Database updated →
Real-time subscription triggers → UI updates
```

---

### Category 2: Validation Hooks

#### 4. Convex Pattern Validator
**File:** `convex-pattern-check.kiro.hook`
**Trigger:** `src/**/*.{ts,tsx}` saved

**What it catches:**
- ❌ Using `fetch()` instead of Convex hooks
- ❌ Manual refetching instead of subscriptions
- ❌ `useState` for data that should be live
- ❌ Wrong ID validation (`v.string()` vs `v.id()`)

**Example alert:**
```
⚠️ Convex Pattern Check

Found potential issue in src/components/dog/StatOrb.tsx:
Using fetch() to call API instead of Convex hooks

Suggested fix:
// Before
const data = await fetch('/api/stats');

// After
const data = useQuery(api.queries.getDogStats, { dogId });
```

**Why it matters:** These anti-patterns break real-time functionality. Catching them early prevents bugs.

---

#### 5. Cross-Reference Validator
**File:** `cross-reference-validator.kiro.hook`
**Trigger:** `convex/{schema,queries,mutations}.ts` saved

**What it catches:**
- Queries referencing non-existent tables
- Mutations using wrong field types
- Missing indexes for common queries
- Orphaned references

**Example alert:**
```
🔗 Cross-Reference Check

Inconsistency detected:
Query 'getDogStats' references field 'dogId' but schema uses 'dog_id'

Affected files:
- convex/schema.ts
- convex/queries.ts

Suggested fix:
Change query to use 'dog_id' or update schema field name

Impact: Runtime error when query executes
```

---

#### 6. Accessibility Audit
**File:** `accessibility-audit.kiro.hook`
**Trigger:** `src/components/**/*.tsx` saved

**What it catches:**
- Interactive elements without labels
- Poor color contrast (critical for B&W theme)
- Missing keyboard navigation
- Images without alt text
- Touch targets < 44px

**Example alert:**
```
♿ Accessibility Check: TrainingModeButton

Issue: Button has only icon, no aria-label
WCAG Level: A

Suggested fix:
<button aria-label="Start training mode">
  <Mic className="w-6 h-6" />
</button>

Why it matters: Training mode is often used hands-free
or in distracting environments.
```

---

#### 7. Performance Budget Enforcer
**File:** `performance-budget.kiro.hook`
**Trigger:** `src/components/**/*.tsx` saved

**What it catches:**
- Heavy animations without optimization
- Missing React.memo on pure components
- Unoptimized images
- Heavy Convex subscriptions
- Large bundle imports

**Example alert:**
```
⚡ Performance Check: ActivityFeed

Potential issue: Subscribing to entire activities table
Impact: Mobile performance degradation with large datasets

Suggested fix:
// Before
const activities = useQuery(api.queries.getAllActivities);

// After
const activities = useQuery(api.queries.getRecentActivities, {
  limit: 20,
  dogId
});

Why it matters: Corgi Quest must work smoothly on mobile
during training sessions.
```

---

### Category 3: Testing Hooks

#### 8. Component Test Reminder
**File:** `component-test-reminder.kiro.hook`
**Trigger:** `src/components/**/*.tsx` created (not saved)

**What it does:**
- Fires only when NEW components are created
- Suggests appropriate test types based on component complexity
- Doesn't auto-create tests (just reminds)

**Example reminder:**
```
📝 Test Reminder for StatOrb

This component uses Convex queries and has animations.

Consider:
- Integration test for Convex data fetching
- Interaction test for click → navigation
- Visual test for animation states

If this is a simple presentational component,
visual testing might be sufficient.
```

**Why it matters:** Keeps testing top-of-mind without being intrusive.

---

### Category 4: Content Generation Hooks

#### 9. Changelog Generator
**File:** `changelog-generator.kiro.hook`
**Trigger:** `.kiro/specs/**/tasks.md` saved

**What it does:**
- Detects newly completed tasks
- Updates `CHANGELOG.md` with categorized entries
- Uses emojis for visual scanning

**Example output:**
```markdown
## [2024-01-15] - Training Mode

### ✨ Features
- Added voice-activated training with wake word detection
- Implemented real-time activity feed with partner sync

### ⚡ Performance
- Optimized stat orb animations for mobile

### 🔧 Technical
- Refactored Convex queries for better caching
```

**Trigger conditions:**
- At least 3 tasks completed, OR
- 1 major feature completed, OR
- Significant bug fixes

---

#### 10. Marketing Content Generator
**File:** `marketing-content-generator.kiro.hook`
**Trigger:** `.kiro/specs/**/tasks.md` saved

**What it does:**
- Detects completed features (not individual tasks)
- Appends tweet ideas to `marketing/tweet-ideas.md`
- Skips if feature already documented

**Example output:**
```markdown
---

## Voice Training Mode - 2024-01-15

### Tweet Options
1. 🎙️ Just shipped voice-activated training! Say "Hey Corgi"
   to log activities hands-free during walks. #Kiroween #DogTraining

2. Training your dog while holding a leash? Now you can log
   activities with just your voice. Real-time sync included! 🐕

3. Built voice → AI → XP pipeline with @OpenAI + @convex_dev.
   Result: hands-free dog training that actually works. ⚡

### Quick Copy-Paste
**For Twitter:** [Tweet 1]
**For Demo:** "Watch me log this walk without touching my phone"

### Why This Matters
Hands-free logging makes training practical during real sessions.
```

---

#### 11. Tweet Generator (Manual)
**File:** `tweet-generator.kiro.hook`
**Trigger:** Manual (run on demand)

**What it does:**
- Analyzes recent git commits and specs
- Generates 3-5 tweet ideas with different angles
- Includes thread ideas and visual content suggestions
- Provides hashtag strategy

**When to use:** Before posting about progress or milestones.

---

#### 12. Demo Script Generator (Manual)
**File:** `demo-script-generator.kiro.hook`
**Trigger:** Manual (run before presentations)

**What it does:**
- Analyzes current project state
- Generates 5-minute demo outline with timing
- Creates feature demo sequence
- Includes Kiro integration showcase
- Provides demo checklist

**Example output:**
```markdown
# Demo Script - Kiroween

## Opening (30 seconds)
- Hook: "What if dog training was a multiplayer RPG?"
- Problem: Couples struggle with consistency
- Solution: Real-time collaborative training

## Feature Demo (2 minutes)
1. Overview screen (show stats, level, goals)
2. Voice logging ("Hey Corgi, we just did a 20 minute walk")
3. Real-time sync (show partner's phone updating)
4. Cosmetic unlocks (level up, get new item)

## Demo Checklist
- [ ] Two phones logged in
- [ ] Dog profile set up
- [ ] Voice permissions enabled
- [ ] Activity feed visible
```

---

## Hook Patterns We Use

### Pattern 1: Silent Unless Issues Found

Most validation hooks stay quiet when everything is fine:

```json
{
  "prompt": "...✅ If no issues: Stay silent"
}
```

This prevents notification spam while still catching problems.

### Pattern 2: Preserve Existing Content

Documentation hooks check before overwriting:

```json
{
  "prompt": "...If tasks.md already exists:\n- Preserve any completed task status..."
}
```

### Pattern 3: Conditional Generation

Content hooks avoid duplicates:

```json
{
  "prompt": "...Check if marketing/tweet-ideas.md already has content for this feature\n- If exists: SKIP generation..."
}
```

### Pattern 4: Context-Aware Prompts

Hooks reference project-specific details:

```json
{
  "prompt": "...Aligned with Corgi Quest's tech stack (React, Convex, TypeScript)\n- Following the development guidelines in .kiro/steering/..."
}
```

---

## Creating New Hooks

### Step 1: Identify the Trigger

What event should fire this hook?
- File saved? → `onFileSave`
- File created? → `onFileCreate`
- On demand? → `manual`

### Step 2: Define the Pattern

What files should trigger it?
- Specific file: `convex/schema.ts`
- File type: `src/**/*.tsx`
- Multiple patterns: `convex/{schema,queries}.ts`

### Step 3: Write the Prompt

Include:
- Clear role ("You are a...")
- Specific instructions (numbered steps)
- Output format (code blocks, markdown)
- Conditions (when to act, when to stay silent)

### Step 4: Test and Iterate

1. Save a matching file
2. Check if hook fires
3. Review output quality
4. Refine prompt as needed

---

## Hook Best Practices

### Do:
- ✅ Keep prompts focused on one task
- ✅ Include output format examples
- ✅ Specify when to stay silent
- ✅ Reference project conventions
- ✅ Test with real files

### Don't:
- ❌ Create hooks that spam notifications
- ❌ Overwrite files without checking
- ❌ Use vague instructions
- ❌ Ignore existing content
- ❌ Trigger on every file type

---

## Hooks vs. Steering vs. Specs

| Feature | Purpose | Trigger |
|---------|---------|---------|
| **Hooks** | Automated actions | File events |
| **Steering** | Persistent context | Every interaction |
| **Specs** | Feature planning | Manual workflow |

**Hooks** automate tasks. **Steering** provides context. **Specs** guide development.

---

## Viewing and Managing Hooks

### In Kiro UI:
1. Open Kiro sidebar
2. Click "Agent Hooks"
3. View all configured hooks
4. Toggle enabled/disabled
5. Run manual hooks

### In Code:
- All hooks live in `.kiro/hooks/`
- Each hook is a `.kiro.hook` JSON file
- Hooks are version-controlled with your code

---

## Summary

Our 12 hooks automate:
- 📝 **Documentation** — Schema, specs, training mode pipeline
- ✅ **Validation** — Convex patterns, cross-references, a11y, performance
- 🧪 **Testing** — Component test reminders
- 📣 **Content** — Changelog, tweets, demo scripts

This automation saved hours of manual work during the hackathon while maintaining code quality and documentation freshness.
