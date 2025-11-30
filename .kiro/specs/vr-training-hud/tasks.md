# Implementation Plan

- [x] 1. Set up backend API endpoints for VR integration (in existing TanStack Start app)
- [x] 1.1 Create GET /api/vr-status endpoint
  - Create `src/routes/api/vr-status.ts` file
  - Implement TanStack Start server function using createAPIFileRoute
  - Query Convex for dog, stats, goals, activities, weekly XP
  - Transform data to VRDogStatus format
  - Return JSON response with all required fields
  - _Requirements: 9.1, 7.1_

- [x] 1.2 Create POST /api/voice-log endpoint
  - Create `src/routes/api/voice-log.ts` file
  - Implement TanStack Start server function using createAPIFileRoute
  - Accept voice transcript in request body
  - Call Convex action for Claude parsing
  - Return success status with activity ID and XP awarded
  - _Requirements: 9.2, 6.1_

- [ ]* 1.3 Write property test for API response completeness
  - **Property 8: API response completeness**
  - **Validates: Requirements 9.1**

- [ ]* 1.4 Write property test for voice log round trip
  - **Property 5: Voice log round trip**
  - **Validates: Requirements 6.1, 9.2**

- [x] 2. Create visionOS app project structure
- [x] 2.1 Initialize visionOS app in Xcode (separate directory)
  - Create `visionos-app/` directory in mono-repo root
  - Create new visionOS app project in Xcode within that directory
  - Set minimum deployment target to visionOS 1.0
  - Configure app capabilities (microphone, network)
  - Set up project structure (Views, ViewModels, Models, Services)
  - Add README.md explaining how to open and run the visionOS app
  - _Requirements: 1.1_

- [x] 2.2 Define Swift data models
  - Create StatData struct with Identifiable
  - Create GoalData struct
  - Create ActivityData struct
  - Create DayXP struct
  - Create SessionState enum and SessionData struct
  - _Requirements: 2.2, 2.3, 2.4, 4.2_

- [x] 2.3 Create NetworkService for API calls
  - Implement fetchVRStatus() using URLSession
  - Implement submitVoiceLog() using URLSession
  - Add error handling and retry logic
  - Configure request timeouts (5 seconds)
  - _Requirements: 7.1, 6.1_

- [x] 3. Build immersive VR training room environment
- [x] 3.1 Create TrainingRoomView with RealityView
  - Set up RealityView container
  - Implement setupEnvironment() for room and lighting
  - Implement setupPedestal() for central platform
  - Add dog name floating text above pedestal
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3.2 Implement FloatingPanelsView layout
  - Create ZStack with positioned panels
  - Position StatOrbsPanel at left (-400, 0, -600)
  - Position GoalsPanel at top (0, 300, -600)
  - Position ActivitiesPanel at right (400, 0, -600)
  - Position WeeklyChartPanel at bottom (0, -300, -600)
  - Add conditional SessionPanel at center
  - _Requirements: 2.1_

- [x] 4. Build floating UI panels
- [x] 4.1 Create StatOrbsPanel and StatOrbView
  - Implement VStack with four stat orbs
  - Add circular progress ring with trim animation
  - Display stat type, name, and level
  - Add pulse animation on XP change using onChange modifier
  - Apply .ultraThinMaterial background
  - _Requirements: 2.2_

- [ ]* 4.2 Write property test for stat orb completeness
  - **Property 1: Stat orb completeness**
  - **Validates: Requirements 2.2**

- [x] 4.3 Create GoalsPanel
  - Display physical goal progress bar
  - Display mental goal progress bar
  - Display streak with fire emoji
  - Add smooth animation on goal updates
  - _Requirements: 2.3_

  - [x] 4.4 Create ActivitiesPanel
  - Display last 5 activities in vertical list
  - Show activity name, XP breakdown, timestamp
  - Show who logged the activity
  - Add fade-in animation for new activities
  - _Requirements: 2.4_

- [x] 4.5 Create WeeklyChartPanel using Swift Charts
  - Implement horizontal bar chart
  - One bar per day showing total XP
  - Minimal axes with day labels
  - Add title "Last 7 Days XP"
  - Animate on load
  - _Requirements: 2.5_

- [ ]* 4.6 Write property test for data changes trigger animations
  - **Property 2: Data changes trigger animations**
  - **Validates: Requirements 3.1, 3.2**

- [x] 5. Implement Coach Mode session UI
- [x] 5.1 Create SessionPanel component
  - Display "Training Session" title
  - Show goal description
  - Show training tips
  - Display rep counter in "X / Y" format
  - Show optional micro-suggestions with fade transition
  - Apply .ultraThinMaterial background
  - _Requirements: 4.2, 5.2_

- [x] 5.2 Add session state management to TrainingRoomView
  - Add @State for sessionState
  - Pass sessionState binding to FloatingPanelsView
  - Conditionally render SessionPanel based on state
  - _Requirements: 4.1, 4.2_

- [x] 6. Implement voice command system
- [x] 6.1 Create VoiceCommandHandler class
  - Set up SFSpeechRecognizer
  - Implement startListening() method
  - Implement parseCommand() for three command types
  - Define VoiceCommand enum (startCoachMode, markRep, endSession)
  - Add extractActivity() and extractDescription() helpers
  - _Requirements: 8.1, 8.2_

- [ ]* 6.2 Write property test for voice command activation
  - **Property 3: Voice command activation**
  - **Validates: Requirements 4.1**

- [x] 6.3 Integrate voice commands with TrainingRoomView
  - Add @StateObject for VoiceCommandHandler
  - Handle .startCoachMode command to activate session
  - Handle .markRep command to increment counter
  - Handle .endSession command to log activity
  - Request microphone permissions on appear
  - _Requirements: 4.1, 5.1, 6.1_

- [ ]* 6.4 Write property test for rep counter increment
  - **Property 4: Rep counter increment**
  - **Validates: Requirements 5.1**

- [x] 7. Implement TrainingRoomViewModel for state management
- [x] 7.1 Create TrainingRoomViewModel class
  - Add @Published properties for stats, goals, activities, weeklyXP
  - Add @Published properties for dogName and dogLevel
  - Implement fetchInitialData() async method
  - Implement updateUI() to transform API response
  - _Requirements: 7.1, 7.2_

- [x] 7.2 Add polling mechanism for real-time updates
  - Implement startPolling() with Timer (3 second interval)
  - Call fetchInitialData() on each poll
  - Add stopPolling() for cleanup
  - Use weak self in timer closure
  - _Requirements: 7.2, 7.3_

- [x] 7.3 Add logVoiceActivity method
  - Implement async method to call NetworkService
  - Refresh data after successful log
  - Handle errors gracefully
  - _Requirements: 6.1, 6.2_

- [ ]* 7.4 Write property test for real-time sync latency
  - **Property 6: Real-time sync latency**
  - **Validates: Requirements 6.5, 7.2**

- [x] 8. Wire up data flow and animations
- [x] 8.1 Connect TrainingRoomViewModel to TrainingRoomView
  - Add @StateObject for viewModel
  - Pass data to FloatingPanelsView
  - Call fetchInitialData() and startPolling() on appear
  - Stop polling on disappear
  - _Requirements: 7.1, 7.2_

- [x] 8.2 Implement XP pulse animation in StatOrbView
  - Add @State for pulseScale
  - Use onChange(of: stat.xp) to trigger animation
  - Apply spring animation with 0.3s response
  - Scale to 1.2 then back to 1.0
  - _Requirements: 3.1_

- [x] 8.3 Implement goal progress bar animations
  - Add smooth animation to progress bar width changes
  - Use .animation(.easeInOut) modifier
  - Ensure bars fill smoothly on data update
  - _Requirements: 3.2_

- [x] 8.4 Implement activity feed fade-in animation
  - Add transition(.opacity) to new activities
  - Animate when activities array changes
  - _Requirements: 3.3_

- [x] 9. Add error handling and edge cases
- [ ] 9.1 Implement network error handling
  - Add offline indicator when connection fails
  - Implement retry logic with exponential backoff
  - Show error message for invalid responses
  - Handle 429 rate limits by backing off polling
  - _Requirements: 7.5_

- [ ] 9.2 Implement voice recognition error handling
  - Show permission dialog if microphone denied
  - Ignore unrecognized commands silently
  - Show error if speech recognition unavailable
  - _Requirements: 8.1, 8.4_

- [ ] 9.3 Handle session state edge cases
  - Ignore "mark rep" when no active session
  - Ignore "end session" when no active session
  - Cache session data if network fails during end
  - Debounce rep marking (500ms minimum between marks)
  - _Requirements: 5.3, 6.3_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Optimize performance for 60+ fps
- [ ] 11.1 Optimize RealityKit rendering
  - Use lightweight materials (.ultraThinMaterial)
  - Limit simultaneous animations to 3-4 elements
  - Release RealityKit resources when app backgrounds
  - _Requirements: 1.4_

- [ ] 11.2 Optimize network and memory usage
  - Implement response caching for offline display
  - Limit activity feed to 5 items maximum
  - Use weak references in closures
  - Batch multiple stat changes into single animation cycle
  - _Requirements: 7.3_

- [ ] 12. Prepare demo capture setup
- [ ] 12.1 Create demo data seed script
  - Pre-seed Convex with Bumi at level 15
  - Add variety of recent activities
  - Set up realistic daily goals and streak
  - _Requirements: 10.1_

- [ ] 12.2 Test demo flow end-to-end
  - Launch VR app and verify room loads (1-2 seconds)
  - Activate coach mode with voice
  - Mark 2-3 reps with voice
  - End session with natural speech
  - Verify stat orbs pulse and goals update
  - Open web app and verify activity appears
  - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 12.3 Record 15-25 second demo clip
  - Capture at 30-60 fps from Vision Pro
  - Show VR training room (1-2 seconds)
  - Show coach mode activation
  - Show rep marking
  - Show session ending with natural speech
  - Show stat orbs pulsing and goals updating
  - Fast cut to web app showing same update
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 13. Final polish and testing
- [ ] 13.1 Test voice commands in realistic environment
  - Test in quiet room
  - Test with background noise
  - Verify command recognition accuracy
  - Test microphone permission flow
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 13.2 Test cross-platform sync
  - Log activity in VR, verify web app updates within 2s
  - Log activity in web app, verify VR updates within 2s
  - Test with both devices open simultaneously
  - _Requirements: 6.5, 7.2, 7.3_

- [ ] 13.3 Test offline and error scenarios
  - Disconnect network, verify offline indicator
  - Reconnect, verify sync resumes
  - Test with invalid API responses
  - Test with missing data fields
  - _Requirements: 7.5_

- [ ]* 13.4 Write property test for command execution latency
  - **Property 7: Command execution latency**
  - **Validates: Requirements 8.2**

- [ ] 14. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
