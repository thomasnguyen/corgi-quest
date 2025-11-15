# Corgi Quest — Kiro Agents & Hooks

This document explains how we used Kiro's agentic features (specs, hooks, steering, and AI assistance) to build Corgi Quest for Kiroween.

## What is Corgi Quest?

Corgi Quest is a real-time dog training RPG for couples. Partners log real-world training activities that convert into PHY/INT/IMP/SOC stats and XP, with changes syncing live between users via Convex.

## How We Used Kiro

### 1. Spec-Driven Development

We organized our development using Kiro specs in `.kiro/specs/`:

- **corgi-quest-mvp/** – Core product spec and initial architecture
- **training-mode/** – Voice-activated training logging system
- **ai-cosmetic-transformations/** – AI-generated dog cosmetics unlocked by leveling
- **realtime-visual-enhancements/** – Real-time presence and activity animations
- **weekly-summary-modal/** – Weekly progress tracking and insights

Each spec contains:
- `requirements.md` – What we're building and why
- `design.md` – Technical approach and architecture decisions
- `tasks.md` – Generated implementation tasks

We used Kiro's spec sessions to:
- Generate initial file structure and routes
- Draft Convex schema and functions
- Break down features into actionable tasks
- Maintain consistency across the codebase

### 2. Agent Hooks

We configured Kiro agent hooks to automate key parts of our workflow. Each hook lives in `.kiro/hooks/*.kiro.hook` and is versioned with our code.

#### 2.1 Schema Documentation Hook
**File:** `.kiro/hooks/schema-documentation.kiro.hook`  
**Trigger:** On save of `convex/schema.ts`  
**Action:** Update `docs/schema-overview.md`

What it does:
- Detects schema changes (new tables, fields, indexes)
- Maintains human-readable documentation of our 11-table Convex schema
- Documents relationships between tables (households → dogs → stats)
- Explains which frontend queries depend on each table
- Highlights real-time subscription patterns

Impact: Our Convex schema and documentation stay in sync automatically, making it easy for new developers (or judges) to understand how real-time updates propagate through the system.

#### 2.2 Spec Task Sync Hook
**File:** `.kiro/hooks/spec-task-sync.kiro.hook`  
**Trigger:** On save of `.kiro/specs/**/requirements.md`  
**Action:** Regenerate `tasks.md` in the same spec folder

What it does:
- Reads updated requirements and design decisions
- Generates actionable implementation tasks with acceptance criteria
- Preserves completed task status when updating
- Maintains task dependencies and complexity estimates
- Keeps implementation aligned with current spec

Impact: When we pivot or refine a feature, our task list updates automatically instead of becoming stale. This saved us hours of manual task management during the hackathon.

#### 2.3 Training Mode Documentation Hook
**File:** `.kiro/hooks/training-mode-docs.kiro.hook`  
**Trigger:** On save of `src/components/training/**/*.tsx`  
**Action:** Update `docs/training-mode-pipeline.md`

What it does:
- Documents the voice → transcription → parsing → Convex → XP pipeline
- Tracks which components and mutations are involved
- Explains how voice logs update goals, XP, and the shared activity feed
- Includes flow diagrams and edge case handling
- Documents both Web Speech API and OpenAI Realtime paths

Impact: Our most complex feature (real-time voice training) stays documented as it evolves, making it easier to debug and demo. This was crucial for onboarding and troubleshooting.

#### 2.4 Convex Pattern Validator Hook
**File:** `.kiro/hooks/convex-pattern-check.kiro.hook`  
**Trigger:** On save of `src/**/*.{ts,tsx}`  
**Action:** Scan for Convex anti-patterns

What it does:
- Detects use of `fetch()` instead of Convex hooks
- Flags manual refetching instead of real-time subscriptions
- Catches incorrect ID validation patterns
- Provides friendly, actionable feedback with code examples
- Only alerts on critical issues (no spam)

Impact: Prevents common mistakes that break real-time functionality. This hook caught several bugs before they made it to production and helped maintain consistency across 40+ components.

#### 2.5 Component Test Reminder Hook
**File:** `.kiro/hooks/component-test-reminder.kiro.hook`  
**Trigger:** On create of `src/components/**/*.tsx`  
**Action:** Suggest testing approach

What it does:
- Reminds about test coverage when creating new components
- Suggests appropriate test types (integration, interaction, visual)
- Provides specific test scenarios based on component complexity
- Doesn't auto-create tests (just reminds)

Impact: Keeps testing top-of-mind without being intrusive. Helped us maintain good test coverage throughout rapid development.

### 2.6 Innovative Hooks (Beyond Code Quality)

We went beyond typical code quality hooks to automate product and presentation tasks:

#### Marketing Content Generator
**File:** `.kiro/hooks/marketing-content-generator.kiro.hook`  
**Trigger:** On save of `.kiro/specs/**/tasks.md` (when tasks complete)  
**Action:** Generate tweet ideas in `marketing/tweet-ideas.md`

What it does:
- Detects completed tasks and major milestones
- Generates 3 tweet options per feature (under 280 chars)
- Includes demo talking points and technical highlights
- Adds relevant emojis and hashtags (#Kiroween, #DogTraining)
- Focuses on user value and couple collaboration angle

Impact: Turns development progress into marketing content automatically. No context-switching needed—just complete features and get ready-to-post tweets.

#### Performance Budget Enforcer
**File:** `.kiro/hooks/performance-budget.kiro.hook`  
**Trigger:** On save of `src/components/**/*.tsx`  
**Action:** Alert on mobile performance issues

What it catches:
- Heavy animations without optimization
- Expensive re-renders (missing memoization)
- Unoptimized images and large imports
- Heavy Convex subscriptions without pagination
- Bundle size concerns

Impact: Ensures Corgi Quest stays fast on mobile during actual training sessions. Caught several performance regressions before they shipped.

#### Accessibility Audit
**File:** `.kiro/hooks/accessibility-audit.kiro.hook`  
**Trigger:** On save of `src/components/**/*.tsx`  
**Action:** Check for a11y issues

What it catches:
- Interactive elements without labels
- Poor color contrast (critical for B&W theme)
- Missing keyboard navigation
- Images without alt text
- Small touch targets (< 44px)

Impact: Keeps the app inclusive and usable in distracting environments (like dog parks). Training mode is often used hands-free, so accessibility is critical.

#### Cross-Reference Validator
**File:** `.kiro/hooks/cross-reference-validator.kiro.hook`  
**Trigger:** On save of `convex/{schema,queries,mutations}.ts`  
**Action:** Validate consistency across Convex files

What it catches:
- Queries referencing non-existent tables
- Mutations using wrong field types
- Missing indexes for common queries
- Orphaned references and naming inconsistencies

Impact: Prevents integration bugs between schema and queries. Caught several issues that would have caused runtime errors.

#### Changelog Generator
**File:** `.kiro/hooks/changelog-generator.kiro.hook`  
**Trigger:** On save of `.kiro/specs/**/tasks.md` (when tasks complete)  
**Action:** Update `CHANGELOG.md` with user-facing changes

What it does:
- Groups completed tasks by category (Features, Fixes, Performance)
- Writes user-focused descriptions (not technical jargon)
- Adds emojis for visual scanning (✨ 🐛 ⚡ 🎨)
- Links changes to user value

Impact: Maintains a clean changelog without manual effort. Perfect for showing progress to judges and future users.

#### Demo Script Generator (Manual)
**File:** `.kiro/hooks/demo-script-generator.kiro.hook`  
**Trigger:** Manual (run before presenting)  
**Action:** Generate presentation script in `marketing/demo-script.md`

What it does:
- Analyzes current project state (specs, schema, routes)
- Creates 5-minute demo outline with timing
- Includes feature demo sequence and talking points
- Adds Kiro integration showcase section
- Generates demo checklist (two phones, permissions, etc.)

Impact: Streamlines presentation prep. Instead of manually creating a script, we run one hook and get a complete demo outline.

### 3. Steering

We use steering files in `.kiro/steering/` to keep Kiro aligned with our product vision and technical standards. All steering files use `inclusion: always` so they're loaded in every interaction.

#### 3.1 Product Overview (`product.md`)
Defines Corgi Quest's purpose, target users, and core values:
- Real-time collaboration between partners
- RPG progression system (PHY/INT/IMP/SOC stats)
- Voice-activated logging for hands-free training
- Daily goals and streak tracking
- Positive reinforcement approach

#### 3.2 Technology Stack (`tech.md`)
Documents our chosen frameworks and technical constraints:
- TanStack Start + React + TypeScript
- Convex for real-time backend (no REST API)
- Tailwind CSS
- Web Speech API + OpenAI for voice
- Mobile-first, sub-second latency requirements

#### 3.3 Project Structure (`structure.md`)
Outlines file organization and coding conventions:
- Directory structure and naming patterns
- Import ordering rules
- Component patterns (functional only)
- Convex usage patterns (hooks, not fetch)
- Architectural principles

#### 3.4 Development Guidelines (`development-guidelines.md`)
Specific implementation rules:
- Always use Convex hooks (useQuery/useMutation)
- Real-time subscriptions, no manual refetching
- Mobile-first design (max-w-md mx-auto)
- 7 core screens with specific layouts

Impact: Whenever we ask Kiro for new code or refactors, it follows these guidelines automatically. This ensured consistency across 40+ components and 5 major features without constant reminders.

### 4. AI-Assisted Development

We used Kiro's AI assistance strategically for high-leverage moments:

- **Activity feed animations** – Turning raw data into engaging RPG-style logs
- **XP/level-up feedback** – Delightful animations when completing quests
- **Voice confirmation UI** – Friendly trainer-style summaries of parsed logs
- **Stat orb interactions** – Smooth transitions and real-time updates
- **Cosmetic item generation** – AI-powered dog transformations using DALL-E

We kept AI sessions focused and composable, then refined results by hand. This gave us AI speed with traditional development control.

### 5. Real-Time Architecture

Kiro helped us maintain strict real-time patterns throughout:

- All data fetching uses Convex `useQuery` hooks (no fetch calls)
- All mutations use Convex `useMutation` hooks
- Optimistic updates for instant feedback
- Presence system shows partner activity in real-time
- Activity feed updates live when either partner logs training

The combination of Convex's real-time backend and Kiro's pattern enforcement made it realistic to build a polished multiplayer training RPG within the hackathon timeframe.

## Why This Matters for Kiroween

Kiro wasn't just autocomplete for us:

- **Specs** kept our complex features organized and documented
- **Hooks** automated documentation and task management as we iterated
- **Steering** ensured consistency across 40+ components and routes
- **AI assistance** accelerated high-value UI/UX polish

This combination made it possible to ship a real-time, multiplayer, voice-enabled dog training RPG with AI-generated cosmetics in a hackathon timeline while maintaining code quality and documentation.

## Getting Started with Our Hooks

To see our hooks in action:

1. Open the Kiro sidebar → "Agent Hooks"
2. View configured hooks in `.kiro/hooks/`
3. Edit `convex/schema.ts` or a spec file and save
4. Watch Kiro automatically update related documentation

To create your own hooks:
1. Click "+ New Hook" in the Agent Hooks panel
2. Describe what you want automated
3. Configure trigger (file save, pattern match)
4. Define the action Kiro should take
5. Test and commit the `.kiro.hook` file
