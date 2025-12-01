# Implementation Plan - Demo MVP (Voice-First)

- [x] 1. Install dependencies and set up WebXR environment
  - Install @react-three/fiber, @react-three/drei, @react-three/xr
  - Configure TypeScript types for WebXR APIs
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Create VR route with WebXR session management
  - [x] 2.1 Create app.vr.tsx route with feature detection
    - Implement navigator.xr.isSessionSupported check
    - Create "Enter VR" button for session initiation
    - Show simple message if WebXR not supported
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  
  - [x] 2.2 Set up react-three-fiber Canvas with XR
    - Configure Canvas with WebGL2 context
    - Set up XR wrapper with local-floor reference space
    - Add basic lighting (ambient + directional)
    - _Requirements: 2.1, 2.2_

- [x] 3. Create data hooks for VR
  - [x] 3.1 Implement useVRData hook
    - Fetch dog, stats, goals, activities using Convex useQuery
    - Handle loading and null states
    - Set up real-time subscriptions for live updates
    - _Requirements: 9.1, 9.2_

- [x] 4. Build core VR panels (read-only displays)
  - [x] 4.1 Create DogProfilePanel
    - Display dog name and level using @react-three/drei Text
    - Position at center top
    - _Requirements: 3.1, 3.2_
  
  - [x] 4.2 Create StatOrb component
    - Render circle with progress ring
    - Show stat type and level
    - Use stat-specific colors
    - Add pulse animation on XP gain
    - _Requirements: 4.1, 4.2, 4.5_
  
  - [x] 4.3 Create StatOrbsPanel
    - Render 4 StatOrbs for PHY, INT, IMP, SOC
    - Position at left side
    - Update live when stats change
    - _Requirements: 4.1_
  
  - [x] 4.4 Create GoalsPanel
    - Display physical and mental progress bars
    - Show streak counter
    - Position at right top
    - Update live when goals change
    - _Requirements: 5.1, 5.2, 5.4_

- [x] 5. Add activity feed panel
  - [x] 5.1 Create ActivityFeedPanel
    - Display 5 most recent activities
    - Show activity name and XP breakdown
    - Position at right bottom
    - Animate new activities fading in
    - _Requirements: 11.1, 11.2_

- [x] 6. Implement voice-first interaction system
  - [x] 6.1 Set up voice recognition
    - Request microphone permissions on VR session start
    - Integrate useWebSpeechRecognition hook
    - Display listening indicator in VR space
    - _Requirements: 8.1, 8.2_
  
  - [x] 6.2 Create VoiceStatusPanel
    - Show "Listening..." indicator when active
    - Display last recognized command
    - Show microphone permission status
    - Position at bottom center
    - _Requirements: 8.1, 8.2_
  
  - [x] 6.3 Implement voice command parsing
    - Parse natural language training descriptions
    - Detect activity type from speech (e.g., "sit", "stay", "walk")
    - Extract duration and context from description
    - _Requirements: 8.3, 8.4, 8.5, 10.1_
  
  - [x] 6.4 Wire voice to activity logging
    - Send voice transcript to existing Convex parseVoiceActivity action
    - Receive XP allocation from Claude
    - Create activity record in database
    - _Requirements: 10.2, 10.3_

- [x] 7. Implement live stat updates
  - [x] 7.1 Connect stat animations to activity events
    - Listen for new activities in real-time
    - Trigger pulse animation on affected stat orbs
    - Show floating XP indicators (e.g., "+15 PHY")
    - _Requirements: 4.3, 10.4, 13.3_
  
  - [x] 7.2 Update goals in real-time
    - Animate progress bars when activities logged
    - Highlight completed goals
    - Update streak counter
    - _Requirements: 5.3, 5.5_
  
  - [x] 7.3 Refresh activity feed
    - Add new activity to top of feed
    - Fade in animation for new items
    - Scroll older items down
    - _Requirements: 11.4_

- [ ] 8. Implement 3D weekly XP chart
  - [ ] 8.1 Create WeeklyChartPanel component
    - Fetch last 7 days of XP data using useVRData hook
    - Position panel at center bottom
    - Add panel background and title
    - _Requirements: 12.1, 12.2_
  
  - [ ] 8.2 Implement 3D bar chart rendering
    - Use BoxGeometry for bars (NOT SVG)
    - Calculate bar heights using normalized values (maxHeight = 0.6 units)
    - Ensure minimum bar height of 0.05 units for visibility
    - Space bars evenly with barSpacing = 0.12 units
    - Center bars around origin using proper X positioning
    - _Requirements: 12.1, 12.2, 12.6_
  
  - [ ] 8.3 Add chart labels and values
    - Display day labels below each bar using 3D Text (fontSize 0.05)
    - Display XP values above each bar using 3D Text (fontSize 0.04)
    - Use proper text anchoring (center/top for labels, center/bottom for values)
    - _Requirements: 12.3, 12.7_
  
  - [ ] 8.4 Add bar growth animations
    - Animate bars growing from 0 to target height on mount
    - Use spring animations for smooth transitions
    - Stagger animations slightly for visual appeal
    - _Requirements: 12.4_
  
  - [ ] 8.5 Implement real-time chart updates
    - Listen for XP changes via Convex subscriptions
    - Smoothly transition bar heights when data updates
    - Update labels and values in real-time
    - _Requirements: 12.5_

- [ ] 9. Polish and optimize
  - [ ] 9.1 Add visual feedback for voice
    - Pulsing microphone icon when listening
    - Show transcript preview in VR
    - Display "Processing..." when sending to Claude
    - Show success confirmation when XP awarded
    - _Requirements: 10.5_
  
  - [ ] 9.2 Optimize for performance
    - Use low-poly meshes (< 1000 triangles)
    - Prefer MeshBasicMaterial over Standard
    - Clean up resources on unmount
    - Limit simultaneous animations
    - _Requirements: 15.1, 15.2, 15.3_
  
  - [ ] 9.3 Test end-to-end voice flow
    - Enter VR → say training activity → watch stats update live
    - Test multiple activities in sequence
    - Verify real-time sync across devices
    - Test on Vision Pro if available
  
  - [ ] 9.4 Test chart rendering
    - Verify bars render at correct heights
    - Verify labels are readable and properly positioned
    - Test with various XP values (0, small, large)
    - Verify animations are smooth
    - Test real-time updates when logging activities
