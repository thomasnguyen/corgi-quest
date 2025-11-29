# Implementation Plan

- [x] 1. Set up spatial audio infrastructure
  - Create `SpatialAudioManager.swift` with AVAudioEngine setup
  - Configure AVAudioEnvironmentNode for 3D positioning
  - Add sound asset files (whoosh, chime, fanfare) to project
  - Implement volume calculation based on distance
  - _Requirements: 1.1, 1.4_

- [ ]* 1.1 Write property test for audio volume distance relationship
  - **Property 1: Audio Volume Distance Relationship**
  - **Validates: Requirements 1.4**

- [x] 1.2 Implement audio event triggers
  - Hook stat fill completion to play whoosh sound
  - Hook goal completion to play success chime
  - Hook session end to play completion fanfare
  - Position sounds at panel 3D locations
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 1.3 Write unit tests for audio positioning
  - Test volume at various distances
  - Test simultaneous sound mixing
  - Test audio cleanup on scene exit
  - _Requirements: 1.4, 1.5_

- [x] 2. Implement hand tracking system
  - Create `HandTrackingManager.swift` with ARKit integration
  - Set up hand anchor tracking for left and right hands
  - Implement distance calculation between hand and panels
  - Add gesture recognition (tap, pinch, hover, dismiss)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 2.1 Write property test for hand hover consistency
  - **Property 2: Hand Hover Consistency**
  - **Validates: Requirements 2.3, 2.4**

- [x] 2.2 Add hover effects to panels
  - Implement glow effect when hand is near
  - Add smooth transition animations
  - Update all panel views to support hover state
  - _Requirements: 2.3, 2.4_

- [x] 2.3 Implement tap gesture for stat details
  - Create stat detail modal view
  - Show XP breakdown, level progress, recent gains
  - Trigger modal on tap gesture detection
  - Add dismiss gesture support
  - _Requirements: 2.1, 2.5_

- [x] 2.4 Implement pinch-and-drag panel repositioning
  - Detect pinch gesture start and track movement
  - Update panel position in real-time during drag
  - Save new position when pinch releases
  - Add visual feedback during drag
  - _Requirements: 2.2_

- [ ] 2.5 Write unit tests for gesture recognition
  - Test tap detection from hand positions
  - Test pinch gesture tracking
  - Test hover threshold boundaries
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Build particle system
  - Create `ParticleSystem.swift` with RealityKit integration
  - Implement particle struct with position, velocity, color, lifetime
  - Add physics simulation (gravity, velocity updates)
  - Implement particle rendering with alpha fade
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ]* 3.1 Write property test for particle lifetime bounds
  - **Property 3: Particle Lifetime Bounds**
  - **Validates: Requirements 3.4**

- [x] 3.2 Create particle emitter configurations
  - Define level-up particle config (25 particles, stat colors)
  - Define goal completion confetti config
  - Add particle pooling for performance
  - Implement particle cleanup after lifetime
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 3.3 Hook particle effects to events
  - Trigger particles on stat level-up
  - Trigger confetti on goal completion
  - Position emitters at panel locations
  - _Requirements: 3.1, 3.5_

- [ ]* 3.4 Write unit tests for particle physics
  - Test particle position updates
  - Test alpha decay over lifetime
  - Test particle cleanup
  - _Requirements: 3.3, 3.4_

- [x] 4. Implement adaptive positioning
  - Create `AdaptivePositioner.swift` with gaze tracking
  - Implement gaze direction calculation from ARKit
  - Add panel transform interpolation for smooth movement
  - Implement bring-to-front logic for gazed panels
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 4.1 Write property test for position smoothness
  - **Property 4: Panel Position Smoothness**
  - **Validates: Requirements 4.1, 4.4**

- [x] 4.2 Add occlusion handling
  - Integrate WorldTrackingProvider for mesh anchors
  - Detect panel-mesh intersections
  - Reposition panels to avoid occlusion
  - Add smooth transition animations
  - _Requirements: 4.5_

- [ ]* 4.3 Write property test for occlusion avoidance
  - **Property 7: Occlusion Avoidance**
  - **Validates: Requirements 4.5**

- [x] 4.4 Implement context-aware positioning
  - Bring session panel to center when training starts
  - Fade out irrelevant panels during active session
  - Reset positions when user looks away
  - _Requirements: 4.2, 4.3, 4.4_

- [ ]* 4.5 Write unit tests for adaptive positioning
  - Test gaze-based panel movement
  - Test position reset logic
  - Test transform interpolation
  - _Requirements: 4.1, 4.4_

- [x] 5. Add environmental integration
  - Create `LightingAdapter.swift` to detect room brightness
  - Implement panel brightness adjustment based on lighting
  - Add high contrast mode for outdoor detection
  - Implement shadow rendering on real surfaces
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 5.1 Write unit tests for lighting adaptation
  - Test brightness calculation
  - Test contrast adjustment
  - Test outdoor detection
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 6. Performance optimization and monitoring
  - Add frame time measurement and logging
  - Implement dynamic particle count reduction
  - Add memory pressure monitoring
  - Optimize audio mixing for low CPU usage
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ]* 6.1 Write property test for frame rate maintenance
  - **Property 5: Frame Rate Maintenance**
  - **Validates: Requirements 6.1**

- [ ]* 6.2 Write property test for gesture latency
  - **Property 6: Gesture Recognition Latency**
  - **Validates: Requirements 6.4**

- [ ]* 6.3 Write property test for audio mixing stability
  - **Property 8: Audio Mixing Stability**
  - **Validates: Requirements 1.5**

- [ ]* 6.4 Write performance tests
  - Test frame rate with all features active
  - Profile memory during particle bursts
  - Measure audio latency
  - Measure gesture recognition latency
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7. Integration and polish
  - Wire all systems together in main VR view
  - Add feature toggles for debugging
  - Implement graceful degradation on errors
  - Add accessibility options (disable particles, audio descriptions)
  - _Requirements: All_

- [ ]* 7.1 Write integration tests
  - Test full audio playback with positioning
  - Test hand gestures triggering UI changes
  - Test particles on level-up events
  - Test adaptive positioning with gaze
  - _Requirements: All_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
