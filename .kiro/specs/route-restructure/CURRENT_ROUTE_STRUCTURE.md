# Current Route Structure (Pre-Restructure)

**Date:** November 29, 2025  
**Commit:** bff27f5

This document captures the current route structure before restructuring for the route-restructure spec.

## Current File-Based Routes

```
src/routes/
├── __root.tsx                 # Root layout wrapper
├── index.tsx                  # Main app overview (/) - WILL MOVE TO /app
├── hackathon.tsx              # Landing page (/hackathon) - WILL MOVE TO /
├── select-character.tsx       # Character selection (/select-character) - WILL MOVE TO /app/select-character
├── quests.tsx                 # Quest layout (/quests) - WILL MOVE TO /app/quests
├── quests.index.tsx           # Quest list (/quests) - WILL MOVE TO /app/quests
├── quests.$questId.tsx        # Quest detail (/quests/:id) - WILL MOVE TO /app/quests/:id
├── stats.$statType.tsx        # Stat detail (/stats/:type) - WILL MOVE TO /app/stats/:type
├── activity.tsx               # Activity feed (/activity) - WILL MOVE TO /app/activity
├── training-mode.tsx          # Training interface (/training-mode) - WILL MOVE TO /app/training-mode
├── log-activity.tsx           # Activity logging (/log-activity) - WILL MOVE TO /app/log-activity
├── waitlist.tsx               # Waitlist signup (/waitlist) - STAYS PUBLIC
├── thanks.tsx                 # Thank you page (/thanks) - STAYS PUBLIC
├── bumi.tsx                   # Bumi page (/bumi) - STAYS PUBLIC
├── api/                       # API routes
└── demo/                      # Demo routes
```

## Current URL Mapping

| Current URL | Component | Post-Restructure URL |
|-------------|-----------|---------------------|
| `/` | Main app overview | `/app` |
| `/hackathon` | Landing page | `/` |
| `/select-character` | Character selection | `/app/select-character` |
| `/quests` | Quest list | `/app/quests` |
| `/quests/:questId` | Quest detail | `/app/quests/:questId` |
| `/stats/:statType` | Stat detail | `/app/stats/:statType` |
| `/activity` | Activity feed | `/app/activity` |
| `/training-mode` | Training interface | `/app/training-mode` |
| `/log-activity` | Activity logging | `/app/log-activity` |
| `/waitlist` | Waitlist signup | `/waitlist` (unchanged) |
| `/thanks` | Thank you page | `/thanks` (unchanged) |
| `/bumi` | Bumi page | `/bumi` (unchanged) |

## Navigation References to Update

Based on the design document, the following components contain navigation references that need updating:

1. **src/components/character/CharacterSelection.tsx**
   - `navigate({ to: "/" })` → `navigate({ to: "/app" })`

2. **src/components/hackathon/DemoVideoSection.tsx**
   - `navigate({ to: "/" })` → `navigate({ to: "/app" })`

3. **src/hooks/useDemoLogin.ts**
   - `navigate({ to: "/" })` → `navigate({ to: "/app" })`

4. **src/components/training/TrainingModeSimple.client.tsx**
   - `navigate({ to: "/" })` → `navigate({ to: "/app" })`

5. **src/components/training/TrainingModeInterface.client.tsx**
   - `navigate({ to: "/" })` → `navigate({ to: "/app" })`

6. **src/components/voice/RealtimeVoiceInterface.tsx**
   - `navigate({ to: "/" })` → `navigate({ to: "/app" })`

7. **src/routes/index.tsx** (will become app.index.tsx)
   - `navigate({ to: "/select-character" })` → `navigate({ to: "/app/select-character" })`

8. **src/routes/select-character.tsx** (will become app.select-character.tsx)
   - `navigate({ to: "/" })` → `navigate({ to: "/app" })`

## Files to Rename

### Phase 1: Landing Page
- `src/routes/hackathon.tsx` → temporary name → eventually `src/routes/index.tsx`

### Phase 2: App Layout
- Create new: `src/routes/app.tsx`

### Phase 3: App Routes
- `src/routes/index.tsx` → `src/routes/app.index.tsx`
- `src/routes/select-character.tsx` → `src/routes/app.select-character.tsx`
- `src/routes/quests.tsx` → `src/routes/app.quests.tsx`
- `src/routes/quests.index.tsx` → `src/routes/app.quests.index.tsx`
- `src/routes/quests.$questId.tsx` → `src/routes/app.quests.$questId.tsx`
- `src/routes/stats.$statType.tsx` → `src/routes/app.stats.$statType.tsx`
- `src/routes/activity.tsx` → `src/routes/app.activity.tsx`
- `src/routes/training-mode.tsx` → `src/routes/app.training-mode.tsx`
- `src/routes/log-activity.tsx` → `src/routes/app.log-activity.tsx`

## Public Routes (No Changes)
- `src/routes/waitlist.tsx` - Remains at `/waitlist`
- `src/routes/thanks.tsx` - Remains at `/thanks`
- `src/routes/bumi.tsx` - Remains at `/bumi`
- `src/routes/api/*` - API routes remain unchanged
- `src/routes/demo/*` - Demo routes remain unchanged

## Notes

- TanStack Router uses file-based routing where file names determine URL paths
- The `app.` prefix creates nested routes under `/app`
- The `app.index.tsx` pattern creates the index route at `/app`
- All app-related routes will be nested under the new `/app` layout route
