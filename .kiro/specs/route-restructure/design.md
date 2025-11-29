# Design Document

## Overview

This design outlines the technical approach for restructuring Corgi Quest's routing architecture to position the hackathon landing page at the root URL (`/`) and move the main application to `/app`. The restructuring leverages TanStack Router's file-based routing system to achieve clean URL paths while maintaining all existing functionality.

## Architecture

### Current Route Structure

```
/                          → Main app (Overview)
/hackathon                 → Landing page
/select-character          → Character selection
/quests                    → Quest list
/quests/:questId           → Quest detail
/stats/:statType           → Stat detail
/activity                  → Activity feed
/training-mode             → Training interface
/log-activity              → Activity logging
/waitlist                  → Waitlist signup
/thanks                    → Thank you page
/bumi                      → Bumi-specific page
```

### Target Route Structure

```
/                          → Landing page (hackathon showcase)
/app                       → Main app (Overview)
/app/select-character      → Character selection
/app/quests                → Quest list
/app/quests/:questId       → Quest detail
/app/stats/:statType       → Stat detail
/app/activity              → Activity feed
/app/training-mode         → Training interface
/app/log-activity          → Activity logging
/waitlist                  → Waitlist signup (remains public)
/thanks                    → Thank you page (remains public)
/bumi                      → Bumi-specific page (remains public)
```

### Routing Strategy

The restructuring uses TanStack Router's file-based routing conventions:

1. **Root Landing Page**: `src/routes/index.tsx` serves the landing page at `/`
2. **App Layout**: `src/routes/app.tsx` provides a layout wrapper for all app routes
3. **App Index**: `src/routes/app.index.tsx` serves the overview at `/app`
4. **Nested App Routes**: All app-related routes move to `src/routes/app/*.tsx` pattern
5. **Public Routes**: Waitlist, thanks, and bumi remain at root level as public pages

## Components and Interfaces

### File Restructuring

#### Phase 1: Move Landing Page to Root
- **Source**: `src/routes/hackathon.tsx`
- **Destination**: `src/routes/index.tsx`
- **Action**: Rename file, update route definition to `createFileRoute("/")`

#### Phase 2: Create App Layout
- **File**: `src/routes/app.tsx`
- **Purpose**: Provides layout wrapper for all `/app/*` routes
- **Content**: Exports route with `<Outlet />` for nested routes

#### Phase 3: Move App Routes
- **Source**: `src/routes/index.tsx` (current overview)
- **Destination**: `src/routes/app.index.tsx`
- **Action**: Rename file, update route definition to `createFileRoute("/app/")`

#### Phase 4: Move Nested App Routes
Move the following routes into the app namespace:
- `select-character.tsx` → `app.select-character.tsx`
- `quests.tsx` → `app.quests.tsx`
- `quests.index.tsx` → `app.quests.index.tsx`
- `quests.$questId.tsx` → `app.quests.$questId.tsx`
- `stats.$statType.tsx` → `app.stats.$statType.tsx`
- `activity.tsx` → `app.activity.tsx`
- `training-mode.tsx` → `app.training-mode.tsx`
- `log-activity.tsx` → `app.log-activity.tsx`

### Navigation Reference Updates

#### Component Updates Required

1. **CharacterSelection.tsx**
   - Current: `navigate({ to: "/" })`
   - Updated: `navigate({ to: "/app" })`

2. **DemoVideoSection.tsx**
   - Current: `navigate({ to: "/" })`
   - Updated: `navigate({ to: "/app" })`

3. **useDemoLogin.ts**
   - Current: `navigate({ to: "/" })`
   - Updated: `navigate({ to: "/app" })`

4. **TrainingModeSimple.client.tsx**
   - Current: `navigate({ to: "/" })`
   - Updated: `navigate({ to: "/app" })`

5. **TrainingModeInterface.client.tsx**
   - Current: `navigate({ to: "/" })`
   - Updated: `navigate({ to: "/app" })`

6. **RealtimeVoiceInterface.tsx**
   - Current: `navigate({ to: "/" })`
   - Updated: `navigate({ to: "/app" })`

7. **app.index.tsx** (formerly index.tsx)
   - Current: `navigate({ to: "/select-character" })`
   - Updated: `navigate({ to: "/app/select-character" })`

8. **app.select-character.tsx** (formerly select-character.tsx)
   - Current: `navigate({ to: "/" })`
   - Updated: `navigate({ to: "/app" })`

## Data Models

No data model changes are required. This is purely a routing restructure that maintains all existing Convex queries, mutations, and schema.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Route Resolution Consistency
*For any* valid route path in the new structure, TanStack Router should resolve it to the correct component without errors.
**Validates: Requirements 4.4, 4.5**

### Property 2: Navigation Reference Completeness
*For any* navigation reference in the codebase that previously pointed to `/`, it should now point to `/app` after restructuring.
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 3: Landing Page Accessibility
*For any* user visiting the root URL (`/`), the landing page should render with all sections visible and interactive.
**Validates: Requirements 1.1, 1.2, 1.4**

### Property 4: App Route Preservation
*For any* app route that existed before restructuring, it should remain accessible under the `/app` prefix with identical functionality.
**Validates: Requirements 2.4, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**

### Property 5: Character Selection Flow
*For any* user accessing `/app` without a selected character, the system should redirect to `/app/select-character`, and upon completion, redirect back to `/app`.
**Validates: Requirements 2.2, 2.3, 3.1, 3.6**

### Property 6: CTA Navigation
*For any* call-to-action button on the landing page, clicking it should navigate to `/app` instead of the previous root path.
**Validates: Requirements 1.5, 3.5**

## Error Handling

### Route Not Found
- **Scenario**: User navigates to a non-existent route
- **Handling**: TanStack Router's default 404 handling remains unchanged
- **User Experience**: Display friendly error message with navigation back to landing page

### Redirect Loops
- **Scenario**: Character selection redirect creates infinite loop
- **Prevention**: Add guard conditions to check if already on target route
- **Fallback**: Break loop after 2 redirects and show error state

### Missing Navigation Updates
- **Detection**: Manual testing of all navigation flows
- **Prevention**: Comprehensive grep search for all `navigate({ to:` patterns
- **Verification**: Test each navigation path in development

## Testing Strategy

### Unit Tests

1. **Route Definition Tests**
   - Verify each route file exports correct `createFileRoute()` path
   - Test that route components render without errors
   - Validate route parameter parsing for dynamic routes

2. **Navigation Hook Tests**
   - Test `navigate()` calls with correct paths
   - Verify redirect logic in character selection flow
   - Test conditional navigation based on auth state

### Integration Tests

1. **Landing to App Flow**
   - Navigate from `/` to `/app` via CTA
   - Verify character selection redirect if needed
   - Confirm successful app load after selection

2. **App Navigation Flow**
   - Navigate between all app routes
   - Verify back button behavior
   - Test deep linking to specific app routes

3. **Training Mode Exit Flow**
   - Start training mode from `/app`
   - Complete or cancel training session
   - Verify return to `/app` overview

### Manual Testing Checklist

- [ ] Visit `/` and verify landing page loads
- [ ] Click "Launch Demo" and verify navigation to `/app`
- [ ] Access `/app` without character and verify redirect to `/app/select-character`
- [ ] Complete character selection and verify redirect to `/app`
- [ ] Navigate to `/app/quests` and verify quest list loads
- [ ] Navigate to `/app/activity` and verify activity feed loads
- [ ] Start training mode and verify exit returns to `/app`
- [ ] Test browser back/forward buttons across routes
- [ ] Verify `/hackathon` redirects to `/` (if redirect implemented)
- [ ] Test all CTAs on landing page navigate correctly

### Property-Based Tests

Property-based testing is not applicable for this routing restructure as it involves file system changes and navigation patterns rather than algorithmic logic that can be tested across random inputs.

## Implementation Notes

### TanStack Router File Naming Conventions

- **Index routes**: `app.index.tsx` → `/app`
- **Nested routes**: `app.quests.tsx` → `/app/quests`
- **Dynamic routes**: `app.quests.$questId.tsx` → `/app/quests/:questId`
- **Layout routes**: `app.tsx` → Wraps all `/app/*` routes

### Migration Safety

1. **Backup Current State**: Commit all changes before starting restructure
2. **Incremental Changes**: Move one route at a time and test
3. **Route Tree Regeneration**: Run build after each file move to regenerate route tree
4. **Navigation Audit**: Use grep to find all navigation references before updating

### Performance Considerations

- **No Performance Impact**: File-based routing is resolved at build time
- **Bundle Size**: No change in bundle size as components remain identical
- **Route Preloading**: TanStack Router's preloading continues to work with new paths

### Accessibility Considerations

- **Focus Management**: Ensure focus resets appropriately on route changes
- **Screen Reader Announcements**: Verify route changes are announced
- **Keyboard Navigation**: Test tab order across route transitions

## Deployment Strategy

1. **Development Testing**: Complete all manual testing in local environment
2. **Staging Deployment**: Deploy to staging and verify all routes
3. **Production Deployment**: Deploy during low-traffic period
4. **Monitoring**: Watch for 404 errors or navigation issues post-deployment
5. **Rollback Plan**: Keep previous commit ready for quick rollback if needed

## Future Considerations

### Potential Enhancements

1. **Redirect Middleware**: Add automatic redirects from old `/hackathon` path to `/`
2. **Route Guards**: Implement authentication guards for `/app/*` routes
3. **Analytics**: Track navigation patterns between landing and app
4. **SEO Optimization**: Add meta tags specific to landing vs app routes
5. **Progressive Enhancement**: Consider lazy loading app routes for faster landing page load
