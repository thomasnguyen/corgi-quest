# Implementation Plan

- [-] 1. Backup and prepare for route restructuring
  - Create a git commit with current state before any changes
  - Document current route structure for reference
  - Run build to ensure current state is working
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 2. Move landing page to root route
  - Rename `src/routes/hackathon.tsx` to a temporary name (e.g., `hackathon-temp.tsx`)
  - Update the route definition to `createFileRoute("/")`
  - Test that landing page renders at `/`
  - _Requirements: 1.1, 1.2, 1.4, 4.1, 4.4_

- [ ] 3. Create app layout route
  - Create `src/routes/app.tsx` with layout wrapper
  - Add `<Outlet />` component for nested routes
  - Export route with `createFileRoute("/app")`
  - _Requirements: 4.3, 4.5_

- [ ] 4. Move main app overview to /app route
  - Rename `src/routes/index.tsx` to `src/routes/app.index.tsx`
  - Update route definition to `createFileRoute("/app/")`
  - Update character selection redirect from `/select-character` to `/app/select-character`
  - Test that overview renders at `/app`
  - _Requirements: 2.1, 2.2, 3.6, 4.2, 4.5_

- [ ] 5. Move character selection route
  - Rename `src/routes/select-character.tsx` to `src/routes/app.select-character.tsx`
  - Update route definition to `createFileRoute("/app/select-character")`
  - Update navigation on completion from `/` to `/app`
  - Test character selection flow
  - _Requirements: 2.2, 2.3, 3.1, 6.3_

- [ ] 6. Move quest routes
  - Rename `src/routes/quests.tsx` to `src/routes/app.quests.tsx`
  - Rename `src/routes/quests.index.tsx` to `src/routes/app.quests.index.tsx`
  - Rename `src/routes/quests.$questId.tsx` to `src/routes/app.quests.$questId.tsx`
  - Update all route definitions to use `/app/quests` prefix
  - Test quest list and quest detail pages
  - _Requirements: 2.5, 6.4_

- [ ] 7. Move stat detail route
  - Rename `src/routes/stats.$statType.tsx` to `src/routes/app.stats.$statType.tsx`
  - Update route definition to `createFileRoute("/app/stats/$statType")`
  - Test stat detail pages for all stat types
  - _Requirements: 2.5, 6.5_

- [ ] 8. Move activity feed route
  - Rename `src/routes/activity.tsx` to `src/routes/app.activity.tsx`
  - Update route definition to `createFileRoute("/app/activity")`
  - Test activity feed rendering
  - _Requirements: 2.5, 6.6_

- [ ] 9. Move training mode route
  - Rename `src/routes/training-mode.tsx` to `src/routes/app.training-mode.tsx`
  - Update route definition to `createFileRoute("/app/training-mode")`
  - Test training mode interface
  - _Requirements: 2.5, 6.7_

- [ ] 10. Move log activity route
  - Rename `src/routes/log-activity.tsx` to `src/routes/app.log-activity.tsx`
  - Update route definition to `createFileRoute("/app/log-activity")`
  - Test activity logging interface
  - _Requirements: 2.5_

- [ ] 11. Finalize landing page at root
  - Rename `hackathon-temp.tsx` to `index.tsx` (replacing old index)
  - Verify landing page is at `/`
  - Test all landing page sections and interactions
  - _Requirements: 1.1, 1.2, 1.4_

- [ ] 12. Update CharacterSelection component navigation
  - Open `src/components/character/CharacterSelection.tsx`
  - Change `navigate({ to: "/" })` to `navigate({ to: "/app" })`
  - Test character selection completion flow
  - _Requirements: 3.1_

- [ ] 13. Update DemoVideoSection component navigation
  - Open `src/components/hackathon/DemoVideoSection.tsx`
  - Change `navigate({ to: "/" })` to `navigate({ to: "/app" })`
  - Test "Launch Demo" button on landing page
  - _Requirements: 1.5, 3.5_

- [ ] 14. Update useDemoLogin hook navigation
  - Open `src/hooks/useDemoLogin.ts`
  - Change `navigate({ to: "/" })` to `navigate({ to: "/app" })`
  - Test demo login flow
  - _Requirements: 3.4_

- [ ] 15. Update TrainingModeSimple component navigation
  - Open `src/components/training/TrainingModeSimple.client.tsx`
  - Change `navigate({ to: "/" })` to `navigate({ to: "/app" })`
  - Test training mode exit flow
  - _Requirements: 3.2_

- [ ] 16. Update TrainingModeInterface component navigation
  - Open `src/components/training/TrainingModeInterface.client.tsx`
  - Change `navigate({ to: "/" })` to `navigate({ to: "/app" })`
  - Test training mode exit flow
  - _Requirements: 3.2_

- [ ] 17. Update RealtimeVoiceInterface component navigation
  - Open `src/components/voice/RealtimeVoiceInterface.tsx`
  - Change `navigate({ to: "/" })` to `navigate({ to: "/app" })`
  - Test voice interface close flow
  - _Requirements: 3.3_

- [ ] 18. Search for any remaining navigation references
  - Run grep search for `navigate({ to: "/" })` in src directory
  - Run grep search for `navigate({ to: "/hackathon" })` in src directory
  - Update any remaining references found
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 19. Search for Link component references
  - Run grep search for `<Link to="/"` in src directory
  - Run grep search for `<Link to="/hackathon"` in src directory
  - Update any Link components to use new paths
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 20. Regenerate route tree and build
  - Run `npm run build` to regenerate TanStack Router route tree
  - Verify no build errors
  - Check that `src/routeTree.gen.ts` reflects new structure
  - _Requirements: 4.4, 4.5_

- [ ] 21. Manual testing - Landing page
  - Visit `/` and verify landing page loads correctly
  - Test all sections render (hero, video, values, tech stack, etc.)
  - Test "Watch Demo" scroll behavior
  - Test "Launch Demo" navigation to `/app`
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 5.1_

- [ ] 22. Manual testing - App entry and character selection
  - Visit `/app` without character selected
  - Verify redirect to `/app/select-character`
  - Complete character selection
  - Verify redirect back to `/app`
  - Verify overview page loads with dog stats
  - _Requirements: 2.1, 2.2, 2.3, 5.2, 6.2, 6.3_

- [ ] 23. Manual testing - App navigation
  - Navigate to `/app/quests` and verify quest list
  - Navigate to `/app/quests/[id]` and verify quest detail
  - Navigate to `/app/stats/PHY` and verify stat detail
  - Navigate to `/app/activity` and verify activity feed
  - Navigate to `/app/training-mode` and verify training interface
  - _Requirements: 2.4, 2.5, 6.4, 6.5, 6.6, 6.7_

- [ ] 24. Manual testing - Training mode flow
  - Start training mode from `/app`
  - Complete or cancel training session
  - Verify return to `/app` overview
  - Test voice interface close returns to `/app`
  - _Requirements: 3.2, 3.3, 5.2_

- [ ] 25. Manual testing - Browser navigation
  - Test browser back button from app to landing
  - Test browser forward button from landing to app
  - Test deep linking to `/app/quests`
  - Verify scroll restoration works correctly
  - _Requirements: 5.3, 5.4_

- [ ] 26. Final verification and cleanup
  - Run full build and verify no errors
  - Test all routes one final time
  - Remove any temporary files or comments
  - Update any documentation that references old routes
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
