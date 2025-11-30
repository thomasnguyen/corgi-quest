# Implementation Plan

## Overview
This plan transforms the existing Noise Desensitizer from a vertical card-based layout into a compact, single-screen experience with a sound grid and unified "Now Playing" control panel. The redesign prioritizes mobile usability and eliminates scrolling on standard mobile viewports.

---

## Phase 1: Component Architecture & Data Models

- [x] 1. Update data models and state structure
  - Add `selectedSoundId` to `NoiseToolState` (separate from `activeSoundId`)
  - Add `isSafetyDrawerOpen` boolean to state
  - Add `shortLabel` field to `SoundConfig` type (5-char max for grid display)
  - Update `SOUNDS` array with short labels for each sound
  - _Requirements: 1.2, 2.5, 4.1_

- [x] 2. Create SoundGrid component
  - Create `src/components/noise/SoundGrid.tsx`
  - Implement 3-column CSS Grid layout with 8px gap
  - Accept `sounds`, `selectedSoundId`, `activeSoundId`, `onSelectSound` props
  - Render SoundTile components for each sound
  - _Requirements: 1.1, 1.2_

- [-] 3. Create SoundTile component
  - Create `src/components/noise/SoundTile.tsx`
  - Implement compact tile design (icon, short label, intensity dot)
  - Add 44x44px minimum touch target
  - Show border highlight when selected
  - Show pulse animation when playing
  - Display intensity indicator as colored dot in corner
  - _Requirements: 1.2, 1.4, 1.5, 7.1-7.5, 9.1_

---

## Phase 2: Now Playing Panel & Controls

- [ ] 4. Create NowPlayingPanel component
  - Create `src/components/noise/NowPlayingPanel.tsx`
  - Implement fixed-position panel at bottom of viewport
  - Show "Tap a sound above to start" when no sound selected
  - Display selected sound's name, icon, and controls when sound selected
  - Include CompactStatusBar at top of panel
  - Include volume slider with percentage display
  - Include Single/Loop mode toggle buttons
  - Include Progressive Exposure toggle
  - Include large play/pause button (56x56px minimum)
  - _Requirements: 2.1-2.6, 3.1-3.2, 6.1-6.2, 9.4_

- [ ] 5. Create CompactStatusBar component
  - Create `src/components/noise/CompactStatusBar.tsx`
  - Display current playback status (sound name + mode or "Ready to play")
  - Display session timer in MM:SS format
  - Position at top of Now Playing panel (40px height)
  - _Requirements: 3.1-3.5_

- [ ] 6. Update SessionControls for new layout
  - Modify `src/components/noise/SessionControls.tsx`
  - Integrate Stop and Reset buttons into Now Playing panel
  - Ensure Stop button is prominent when sound is playing
  - Maintain 48x48px minimum touch targets
  - _Requirements: 5.1-5.5_

---

## Phase 3: Safety Drawer & Header

- [ ] 7. Create SafetyDrawer component
  - Create `src/components/noise/SafetyDrawer.tsx`
  - Implement slide-up drawer with semi-transparent backdrop
  - Include all four safety guidelines from existing SafetyCard
  - Add close button and swipe-to-dismiss functionality
  - Implement 300ms slide-up animation with ease-out timing
  - _Requirements: 4.1-4.4_

- [ ] 8. Create CompactHeader component
  - Create `src/components/noise/CompactHeader.tsx`
  - Display compact safety banner (44px height max)
  - Include "Tips" button that opens SafetyDrawer
  - Use minimal styling to preserve screen space
  - _Requirements: 4.1, 4.5_

---

## Phase 4: CTA & Visual Polish

- [ ] 9. Update NoiseCTA for subtle styling
  - Modify `src/components/noise/NoiseCTA.tsx`
  - Change to minimal "Powered by Corgi Quest" text
  - Use small font and muted color (text-gray-500)
  - Remove large button, make text clickable link
  - Position below Now Playing panel
  - _Requirements: 8.1-8.4_

- [ ] 10. Implement visual feedback and animations
  - Add scale(1.02) animation on tile selection (150ms)
  - Add pulse animation for playing indicator (opacity 0.5-1.0, 1s duration)
  - Add scale(0.95) feedback on button press (100ms)
  - Ensure all interactive elements have visual feedback
  - _Requirements: 9.5_

---

## Phase 5: Integration & State Management

- [ ] 11. Refactor NoiseDesensitizer main component
  - Update `src/components/noise/NoiseDesensitizer.tsx`
  - Replace vertical card layout with SoundGrid + NowPlayingPanel
  - Add `selectedSoundId` state management
  - Add `isSafetyDrawerOpen` state management
  - Implement `handleSelectSound` to update selected sound
  - Update layout to use CompactHeader instead of SafetyCard
  - Wire up all new components with proper props
  - Ensure fixed positioning for Now Playing panel
  - _Requirements: 1.4, 2.1, 4.2_

- [ ] 12. Update route layout for single-screen design
  - Modify `src/routes/tools.noise.tsx`
  - Ensure page header is compact
  - Verify total viewport height fits standard mobile (667px iPhone SE)
  - Test that no vertical scrolling is needed for sound grid
  - _Requirements: 1.3, 10.4_

---

## Phase 6: Mobile Optimization & Accessibility

- [ ] 13. Implement touch target and spacing requirements
  - Verify all interactive elements meet 44x44px minimum
  - Ensure sound grid tiles have 8px gap to prevent mis-taps
  - Verify volume slider thumb is 24px minimum
  - Verify play/pause button is 56x56px
  - Test on actual mobile devices (iOS Safari, Chrome)
  - _Requirements: 9.1-9.4_

- [ ] 14. Add accessibility attributes
  - Add ARIA labels to all interactive elements
  - Add aria-live regions for status updates
  - Ensure keyboard navigation works for all controls
  - Add aria-pressed states for toggle buttons
  - Test with screen reader
  - _Requirements: 2.2, 3.1, 5.4_

---

## Phase 7: Testing & Validation

- [ ]* 15. Write unit tests for new components
  - Test SoundGrid renders all sounds correctly
  - Test SoundTile selection and playing states
  - Test NowPlayingPanel shows correct content based on selection
  - Test CompactStatusBar timer formatting
  - Test SafetyDrawer open/close behavior
  - _Requirements: All_

- [ ]* 16. Write property-based tests
  - **Property 1: Sound tile rendering completeness**
  - **Validates: Requirements 1.2, 7.1**
  - Test that for any sound config, rendered tile contains icon, label, and intensity indicator

- [ ]* 16.1 Write property test for Now Playing panel update
  - **Property 2: Sound selection updates Now Playing panel**
  - **Validates: Requirements 1.4, 2.1**
  - Test that for any sound selection, Now Playing panel displays that sound's info

- [ ]* 16.2 Write property test for status bar display
  - **Property 3: Status bar displays correct playing state**
  - **Validates: Requirements 3.3**
  - Test that for any playing sound, status bar shows sound label and mode

- [ ]* 16.3 Write property test for timer formatting
  - **Property 4: Timer format consistency**
  - **Validates: Requirements 3.5**
  - Test that for any non-negative integer seconds, formatTime returns MM:SS format

- [ ]* 16.4 Write property test for stop functionality
  - **Property 5: Stop button halts all playback**
  - **Validates: Requirements 5.2**
  - Test that for any playing state, stop action results in no sound playing

- [ ]* 16.5 Write property test for progressive exposure
  - **Property 6: Progressive exposure volume behavior**
  - **Validates: Requirements 6.3, 6.4**
  - Test that for any volume below 60%, progressive mode increases by 10% after 60s
  - Test that for any volume at/above 60%, no automatic increase occurs

- [ ] 17. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Phase 8: Final Polish & Cleanup

- [ ] 18. Remove deprecated components
  - Delete old `SafetyCard.tsx` (replaced by SafetyDrawer)
  - Remove old `SoundCard.tsx` (replaced by SoundTile + NowPlayingPanel)
  - Clean up unused imports
  - _Requirements: N/A_

- [ ] 19. Verify mobile viewport requirements
  - Test on iPhone SE (375x667px) - should fit without scrolling
  - Test on standard Android (360x640px)
  - Verify touch targets on actual devices
  - Test in both portrait and landscape
  - _Requirements: 1.3, 10.1-10.5_

- [ ] 20. Final accessibility audit
  - Run automated accessibility checker
  - Test with VoiceOver (iOS) and TalkBack (Android)
  - Verify color contrast for intensity indicators
  - Ensure all interactive elements are keyboard accessible
  - _Requirements: 9.5, 10.5_

- [ ] 21. Final Checkpoint - Complete testing and validation
  - Ensure all tests pass, ask the user if questions arise.
