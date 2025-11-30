# Implementation Plan

- [x] 1. Set up project structure and sound library configuration
  - Create `src/routes/tools.noise.tsx` route file
  - Create `src/components/noise/` directory
  - Create `src/lib/noiseTypes.ts` with TypeScript types (SoundId, Mode, NoiseToolState, SoundConfig)
  - Create `src/lib/noiseSounds.ts` with SOUNDS array configuration (9 sounds with metadata)
  - Add placeholder audio files to `/public/sounds/` directory
  - _Requirements: 10.1-10.9_

- [-] 2. Implement core audio management system
  - [x] 2.1 Create AudioManager class in `src/lib/noiseAudio.ts`
    - Implement constructor that creates HTMLAudioElement for each sound
    - Implement `play(soundId, volume, mode)` method
    - Implement `stop(soundId)` method with currentTime reset
    - Implement `stopAll()` method
    - Implement `setVolume(soundId, volume)` method
    - Implement `cleanup()` method for unmounting
    - _Requirements: 1.2, 1.5_

  - [ ]* 2.2 Write property test for single active sound exclusivity
    - **Property 1: Single active sound exclusivity**
    - **Validates: Requirements 1.4**

  - [ ]* 2.3 Write property test for volume synchronization
    - **Property 2: Volume changes apply immediately**
    - **Validates: Requirements 1.3**

- [x] 3. Build main container component with state management
  - [x] 3.1 Create NoiseDesensitizer.tsx component
    - Initialize NoiseToolState with default values
    - Create AudioManager instance with useRef
    - Implement `handlePlay(soundId)` - stops current sound, starts new sound, starts timer
    - Implement `handleStop(soundId)` - stops sound, resets audio, pauses timer if no sounds active
    - Implement `handleStopAll()` - stops all sounds, freezes timer
    - Implement `handleVolumeChange(soundId, volume)` - updates state and audio element
    - Implement `handleModeChange(soundId, mode)` - updates state
    - Implement `handleProgressiveToggle()` - toggles progressive exposure
    - Implement `handleResetTimer()` - resets sessionSeconds to 0
    - Set up session timer interval (1000ms) that increments when isSessionRunning
    - Set up progressive exposure interval (60000ms) that increases volume when enabled
    - Clean up intervals on unmount
    - _Requirements: 1.1-1.5, 4.1-4.5, 5.1-5.5_

  - [ ]* 3.2 Write property test for Stop All completeness
    - **Property 6: Stop All completeness**
    - **Validates: Requirements 5.5**

  - [ ]* 3.3 Write property test for timer reset independence
    - **Property 10: Timer reset independence**
    - **Validates: Requirements 5.4**

- [ ] 4. Implement loop mode functionality
  - [x] 4.1 Add loop timeout tracking to AudioManager
    - Add `loopTimeouts` Map to store timeout IDs
    - In `play()` method, attach 'ended' event listener
    - On 'ended', if mode is 'loop', schedule replay after 7000ms
    - Clear timeout in `stop()` and `stopAll()` methods
    - _Requirements: 2.2, 2.3_

  - [ ]* 4.2 Write property test for loop mode repetition
    - **Property 3: Loop mode repetition**
    - **Validates: Requirements 2.3**

  - [ ]* 4.3 Write property test for single mode auto-stop
    - **Property 7: Mode persistence** (covers single mode behavior)
    - **Validates: Requirements 2.1, 2.4**

- [x] 5. Implement progressive exposure automation
  - [x] 5.1 Add progressive exposure logic to NoiseDesensitizer
    - In progressive interval callback, check if activeSoundId exists
    - Get current volume for active sound
    - If volume < 0.6, increase by 0.1
    - Update volumeBySound state
    - Call audioManager.setVolume()
    - Track manual volume changes to disable auto-increment
    - _Requirements: 4.1-4.5_

  - [ ]* 5.2 Write property test for progressive volume progression
    - **Property 4: Progressive exposure volume progression**
    - **Validates: Requirements 4.2, 4.3**

  - [ ]* 5.3 Write property test for manual override
    - **Property 9: Manual volume disables progressive**
    - **Validates: Requirements 4.4**

- [x] 6. Build SoundCard component
  - [x] 6.1 Create SoundCard.tsx with props interface
    - Render icon (emoji) + label + intensity badge
    - Render Play/Stop button (conditional based on isActive)
    - Render mode selector (Single/Loop button group)
    - Render volume label showing current percentage
    - Render volume slider (0-100 range)
    - Show "Auto-raising every 60s" chip when progressiveActive
    - Style intensity badges with color coding (High=red, Medium=amber, Low=green)
    - Ensure touch targets are 44x44px minimum
    - _Requirements: 1.1-1.5, 2.1-2.5, 9.4_

  - [ ]* 6.2 Write property test for touch target sizes
    - **Property (accessibility): Touch targets meet 44px minimum**
    - **Validates: Requirements 7.3**

- [x] 7. Build SafetyCard component
  - Create SafetyCard.tsx with static content
  - Render title "How to use this safely"
  - Render 🛡️ icon
  - Render 4 bullet points with safety guidelines
  - Style as info card with subtle background
  - _Requirements: 3.1-3.5_

- [x] 8. Build session controls and status display
  - [x] 8.1 Create SessionControls.tsx component
    - Render [Stop All] button
    - Render [Reset Timer] button
    - Make sticky at bottom on mobile
    - Wire up onStopAll and onResetTimer callbacks
    - _Requirements: 5.4, 5.5_

  - [x] 8.2 Create StatusBar.tsx component
    - Format sessionSeconds as MM:SS
    - Display "Status: Stopped" when no active sound
    - Display "Status: Playing [Sound] (Mode)" when active
    - Update in real-time based on props
    - _Requirements: 6.1-6.5_

  - [ ]* 8.3 Write property test for session timer accuracy
    - **Property 5: Session timer accuracy**
    - **Validates: Requirements 5.2**

- [x] 9. Build progressive exposure toggle
  - Create ProgressiveToggle.tsx component
  - Render toggle switch + label "Progressive exposure"
  - Render helper text explaining the feature
  - Wire up onToggle callback
  - _Requirements: 4.1-4.5, 6.4_

- [x] 10. Build footer CTA component
  - Create NoiseCTA.tsx component
  - Render "powered by Corgi Quest" text
  - Render CTA button "Get daily training quests in the Corgi Quest app →"
  - Link to `/waitlist` or `/app` route
  - Style to match Corgi Quest theme (reuse colors)
  - Make visually distinct but not intrusive
  - _Requirements: 8.1-8.4_

- [-] 11. Wire up main route and layout
  - [ ] 11.1 Complete tools.noise.tsx route
    - Import and render NoiseDesensitizer component
    - Add page title and subtitle
    - Arrange components in mobile-first vertical layout
    - Add SafetyCard at top
    - Add sound grid (SoundCard for each sound)
    - Add ProgressiveToggle
    - Add StatusBar
    - Add SessionControls (sticky bottom)
    - Add NoiseCTA footer
    - _Requirements: 1.1, 3.1, 7.1_

  - [ ]* 11.2 Write property test for default initialization
    - **Property 8: Default state initialization**
    - **Validates: Requirements 9.1, 9.2, 9.3**

- [ ] 12. Add responsive styling and theming
  - Apply Tailwind CSS with mobile-first approach
  - Use max-w-md mx-auto for mobile layout
  - On desktop, arrange sound cards in 2-3 column grid
  - Reuse Corgi Quest color palette (black/white theme)
  - Add rounded corners (border-radius: 16px) to cards
  - Ensure proper spacing and padding
  - Test on mobile viewport (375px width)
  - _Requirements: 7.1, 7.3_

- [ ] 13. Implement error handling
  - Add try-catch in AudioManager.play() for loading failures
  - Display error message on sound card if file fails to load
  - Disable Play button for failed sounds
  - Add browser compatibility check for Web Audio API
  - Show banner if audio not supported
  - Handle autoplay policy restrictions (show tooltip on first play)
  - Debounce volume slider changes (50ms)
  - Clamp volume values to 0-1 range
  - Cap timer display at 99:59
  - _Requirements: 1.2, 7.4_

- [ ] 14. Add accessibility features
  - Add ARIA labels to all interactive elements
  - Add aria-live region for status updates
  - Add descriptive button labels (not just icons)
  - Add aria-valuetext to volume sliders
  - Ensure keyboard navigation works (Tab, Space, Enter, Arrow keys)
  - Add focus indicators to all controls
  - Test with screen reader
  - Respect prefers-reduced-motion for animations
  - _Requirements: 7.3_

- [ ] 15. Add SEO and meta tags
  - Set page title: "Free Dog Noise Desensitizer | Corgi Quest"
  - Add meta description about training tool
  - Add Open Graph tags for social sharing
  - Add canonical URL
  - Ensure no authentication required
  - Verify no cookie usage
  - _Requirements: 7.2, 7.5_

- [ ] 16. Checkpoint - Ensure all tests pass, ask the user if questions arise

- [ ] 17. Source or create audio files
  - Find or create 9 audio files (fireworks, thunder, door knock, doorbell, dog bark, baby crying, traffic, siren, construction)
  - Optimize to MP3 format at 128kbps
  - Keep file sizes under 500KB each
  - Add to `/public/sounds/` directory
  - Update fileUrl paths in noiseSounds.ts
  - Test all sounds play correctly
  - _Requirements: 10.1-10.9_

- [ ] 18. Final testing and polish
  - Test full user flow: load → play → adjust volume → stop
  - Test progressive exposure full cycle
  - Test loop mode with multiple sounds
  - Test Stop All and Reset Timer
  - Test on iOS Safari (autoplay restrictions)
  - Test on Chrome mobile
  - Test keyboard navigation
  - Test with screen reader
  - Verify CTA links to correct destination
  - Check for console errors
  - Verify mobile responsiveness
  - _Requirements: All_

- [ ] 19. Final Checkpoint - Ensure all tests pass, ask the user if questions arise
