# Training Mode Implementation Plan

- [x] 1. Update Overview screen with side-by-side buttons
  - Rename `LogActivityButton.tsx` to `ActivityButtons.tsx`
  - Implement grid layout with two buttons: "LOG ACTIVITY" and "TRAINING MODE"
  - Use existing button styling (cta_button.svg) for consistency
  - Ensure responsive design for mobile devices
  - Update import in `src/routes/index.tsx`
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Create wake word detection utility
  - [x] 2.1 Implement wake word detection function
    - Create `src/lib/wakeWordDetection.ts`
    - Support variations: "corgi quest", "corgi, quest", "corgiquest"
    - Extract payload text after wake word
    - Return detection result with payload
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 3. Create Web Speech Recognition hook
  - [x] 3.1 Implement useWebSpeechRecognition hook
    - Create `src/hooks/useWebSpeechRecognition.ts`
    - Initialize Web Speech API with continuous mode
    - Handle transcript accumulation
    - Implement auto-restart on recognition end
    - Handle browser compatibility (webkit prefix)
    - _Requirements: 3.1, 3.2, 3.5, 12.1, 12.2_
  
  - [x] 3.2 Add error handling and permission management
    - Request microphone permission
    - Handle permission denied errors
    - Handle speech recognition errors
    - Provide error messages to UI
    - _Requirements: 2.1, 2.2, 11.1, 11.4_

- [x] 4. Create Training Mode system instructions
  - [x] 4.1 Create training mode OpenAI configuration
    - Create `src/lib/trainingModeInstructions.ts`
    - Define concise system instructions for activity parsing
    - Define stat gain guidelines (Emotional, Mental, Physical, Social)
    - Specify audio response format: "Logged. [X] emotional, [Y] mental"
    - Define error response: "Didn't catch that, try again"
    - _Requirements: 5.2, 6.2, 6.3, 6.5_
  
  - [x] 4.2 Define saveActivity function for OpenAI
    - Create function definition matching existing logActivity mutation
    - Include parameters: activityName, statGains, physicalPoints, mentalPoints
    - Add durationMinutes as optional parameter
    - _Requirements: 5.1, 5.2_

- [x] 5. Create Training Mode UI components
  - [x] 5.1 Create ListeningIndicator component
    - Create `src/components/training/ListeningIndicator.tsx`
    - Display pulsing microphone icon when listening
    - Show "Listening..." or "Not listening" text
    - Use app's color scheme (gold/black)
    - _Requirements: 7.1, 7.5_
  
  - [x] 5.2 Create LiveTranscript component
    - Create `src/components/training/LiveTranscript.tsx`
    - Display scrolling transcript text
    - Auto-scroll to bottom as new text arrives
    - Show placeholder when empty
    - _Requirements: 7.2, 7.5_
  
  - [x] 5.3 Create LastLoggedActivity component
    - Create `src/components/training/LastLoggedActivity.tsx`
    - Display activity name with checkmark
    - Show XP gains with stat emojis
    - Display relative timestamp ("Just now", "2 min ago")
    - _Requirements: 7.3, 7.5_
  
  - [x] 5.4 Create TodaysSummary component
    - Create `src/components/training/TodaysSummary.tsx`
    - Query daily goals from Convex
    - Display physical/mental points progress
    - Show current streak
    - _Requirements: 7.4, 7.5_
  
  - [x] 5.5 Create StopButton component
    - Create `src/components/training/StopButton.tsx`
    - Style as prominent red button
    - Position at bottom of screen
    - _Requirements: 8.1, 8.5_

- [x] 6. Implement Training Mode route
  - [x] 6.1 Create training-mode route file
    - Create `src/routes/training-mode.tsx`
    - Disable SSR for browser-only APIs
    - Set up Layout wrapper
    - _Requirements: 1.2_
  
  - [x] 6.2 Implement core Training Mode logic
    - Initialize Web Speech Recognition hook
    - Initialize OpenAI Realtime hook (reuse existing)
    - Implement wake word detection on transcript updates
    - Connect to OpenAI only when wake word detected
    - Send activity payload to OpenAI
    - _Requirements: 3.1, 4.1, 4.3, 5.1, 10.1, 10.2_
  
  - [x] 6.3 Implement OpenAI response handling
    - Handle saveActivity function call from OpenAI
    - Call Convex logActivity mutation with optimistic updates
    - Play audio response from OpenAI
    - Update lastActivity state
    - Disconnect from OpenAI after response
    - _Requirements: 5.3, 5.4, 6.1, 6.4, 10.3_
  
  - [x] 6.4 Implement session management
    - Configure OpenAI session with training mode instructions
    - Handle session lifecycle (connect/disconnect)
    - Reset state between activities
    - Continue listening after activity logged
    - _Requirements: 3.3, 5.5_
  
  - [x] 6.5 Implement stop functionality
    - Stop Web Speech Recognition
    - Disconnect from OpenAI
    - Navigate back to Overview screen
    - Clean up resources
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [x] 6.6 Assemble UI components
    - Add ListeningIndicator
    - Add LiveTranscript
    - Add LastLoggedActivity (conditional)
    - Add TodaysSummary
    - Add StopButton
    - Add error display
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 11.1, 11.2, 11.3_

- [ ] 7. Implement real-time updates
  - [ ] 7.1 Configure optimistic updates for activity logging
    - Use existing optimistic update pattern from log-activity
    - Update activity feed immediately
    - Update XP totals immediately
    - Update daily goals immediately
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 8. Add error handling and edge cases
  - [ ] 8.1 Handle microphone permission errors
    - Display user-friendly error message
    - Provide guidance for granting permission
    - _Requirements: 2.2, 11.1_
  
  - [ ] 8.2 Handle Web Speech API errors
    - Auto-retry on recognition errors
    - Display error message if persistent
    - _Requirements: 11.1, 11.5_
  
  - [ ] 8.3 Handle OpenAI connection errors
    - Continue local listening if OpenAI fails
    - Display error message
    - Retry on next wake word
    - _Requirements: 11.2, 11.5_
  
  - [ ] 8.4 Handle activity logging errors
    - Display error message
    - Keep activity data for manual retry
    - Don't auto-retry to avoid duplicates
    - _Requirements: 11.3, 11.5_
  
  - [ ] 8.5 Add browser compatibility check
    - Check for Web Speech API support
    - Display warning if not supported
    - Suggest compatible browsers
    - _Requirements: 12.3, 12.5_

- [ ] 9. Test and validate
  - [ ] 9.1 Test wake word detection
    - Test all wake word variations
    - Test payload extraction accuracy
    - Test with different speech patterns
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ] 9.2 Test end-to-end flow
    - Start Training Mode
    - Speak wake word with activity
    - Verify audio response plays
    - Verify activity logged in database
    - Verify UI updates in real-time
    - Test multiple activities in sequence
    - _Requirements: 3.1, 4.1, 5.1, 5.3, 6.1, 9.1, 9.2, 9.3_
  
  - [ ] 9.3 Test error scenarios
    - Test with microphone permission denied
    - Test with no internet connection
    - Test with invalid activity descriptions
    - Verify error messages display correctly
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [ ] 9.4 Test on mobile devices
    - Test on iPhone with Safari
    - Test on Android with Chrome
    - Test with AirPods connected
    - Verify audio plays through correct output
    - _Requirements: 12.1, 12.2, 12.4_

- [ ] 10. Polish and optimize
  - [ ] 10.1 Optimize battery usage
    - Verify Web Speech API auto-pauses during silence
    - Verify OpenAI connections are short-lived
    - Test battery drain over 30-minute session
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ] 10.2 Verify cost optimization
    - Measure OpenAI API usage per activity
    - Verify only payload sent to OpenAI (not full transcript)
    - Confirm cost per 30-minute walk is under $0.10
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ] 10.3 Add visual polish
    - Ensure animations are smooth
    - Verify color scheme consistency
    - Test responsive layout on different screen sizes
    - Add loading states where appropriate
    - _Requirements: 7.5_
