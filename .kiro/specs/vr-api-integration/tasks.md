# Implementation Plan

- [x] 1. Set up API infrastructure and Convex client
  - Create Convex HTTP client configuration
  - Set up TanStack Start API route structure
  - Configure CORS headers for VR app requests
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 2. Implement VR Status endpoint
- [x] 2.1 Create GET /api/vr-status route handler
  - Implement TanStack Start API file route
  - Add query parameter parsing for dogId
  - Implement fallback to first dog logic
  - _Requirements: 1.1, 4.2, 4.4_

- [x] 2.2 Implement parallel Convex query execution
  - Call getDogProfile, getDailyGoals, getStreak queries in parallel
  - Call getActivityFeed and getOverallStatsData queries
  - Add 5-second timeout handling
  - _Requirements: 3.1, 3.5_

- [x] 2.3 Implement data transformation to VR format
  - Transform dog profile to VRDogStatus structure
  - Convert stats array with xpProgress calculation
  - Transform goals with current/target structure
  - Transform activities with XP breakdown
  - Transform weekly XP data with day labels
  - Ensure all timestamps use milliseconds since epoch
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.3_

- [ ]* 2.4 Write property test for status response completeness
  - **Property 1: Status response completeness**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

- [ ]* 2.5 Write property test for parallel query consistency
  - **Property 3: Parallel query consistency**
  - **Validates: Requirements 3.1, 3.2**

- [x] 2.6 Add error handling and graceful degradation
  - Handle invalid dog ID with 404 response
  - Handle Convex query failures with partial data
  - Add timeout error handling
  - _Requirements: 3.3, 5.3, 6.3_


- [x] 3. Implement Voice Log endpoint
- [x] 3.1 Create POST /api/voice-log route handler
  - Implement TanStack Start API file route
  - Add request body parsing and validation
  - Validate Content-Type header
  - _Requirements: 2.1, 6.4_

- [x] 3.2 Integrate AI activity parsing
  - Call processTrainingActivity action with transcript
  - Handle AI parsing timeout (30 seconds)
  - Extract activity name, duration, stat gains
  - _Requirements: 2.1, 2.2_

- [x] 3.3 Implement activity logging
  - Get default dog ID and user ID
  - Call logActivity mutation with parsed data
  - Handle XP calculation and stat updates
  - Handle daily goal updates
  - _Requirements: 2.2, 2.3, 2.4_

- [x] 3.4 Format voice log response
  - Return success status and activity ID
  - Include XP breakdown in response format
  - Match VoiceLogResponse Swift struct exactly
  - _Requirements: 2.5, 7.2_

- [ ]* 3.5 Write property test for voice log idempotency
  - **Property 2: Voice log idempotency**
  - **Validates: Requirements 2.1, 2.3**

- [ ]* 3.6 Write property test for XP breakdown completeness
  - **Property 8: XP breakdown completeness**
  - **Validates: Requirements 2.5**

- [x] 3.7 Add voice log error handling
  - Handle empty transcript with 400 error
  - Handle AI parsing failures with descriptive errors
  - Handle network timeouts with 503 error
  - _Requirements: 5.1, 5.3, 5.4_


- [x] 4. Implement data format validation
- [x] 4.1 Add timestamp format conversion utilities
  - Create helper to convert Date to milliseconds
  - Ensure all timestamps use consistent format
  - _Requirements: 7.3_

- [x] 4.2 Add stat type validation
  - Ensure stat types always use PHY/INT/IMP/SOC codes
  - Validate stat type consistency across responses
  - _Requirements: 7.4_

- [ ]* 4.3 Write property test for timestamp format consistency
  - **Property 6: Timestamp format consistency**
  - **Validates: Requirements 7.3**

- [ ]* 4.4 Write property test for stat type code consistency
  - **Property 7: Stat type code consistency**
  - **Validates: Requirements 7.4**

- [x] 5. Add logging and monitoring
- [x] 5.1 Implement request logging
  - Log request method, path, and timestamp
  - Log response time and status code
  - _Requirements: 8.1, 8.3_

- [x] 5.2 Implement error logging
  - Log error messages with stack traces
  - Log request context for debugging
  - Log voice transcript on parsing failures
  - _Requirements: 8.2, 8.4_

- [x] 5.3 Add performance logging
  - Log Convex query execution times
  - Log slow queries for optimization
  - _Requirements: 8.5_


- [ ] 6. Demo optimization and testing
- [x] 6.1 Configure VR app for production API
  - Update AppConfiguration to use production URL
  - Set useMockData to false in NetworkService
  - Test VR app connection to deployed API
  - _Requirements: 7.1, 7.2_

- [x] 6.2 Implement 3-second polling optimization
  - Verify VR app polls every 3 seconds during training
  - Test real-time sync between VR and web app
  - Measure sync delay (should be < 3 seconds)
  - _Requirements: 5.2_

- [x] 6.3 Test "Leave It" demo flow
  - Test complete 15-25 second demo scenario
  - Verify minimal UI → training → 5 reps → summary → stats flow
  - Test voice commands: "Start training", "Mark rep", "End session"
  - Verify IMP stat increases after session
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 6.4 Write integration test for demo scenario
  - Test end-to-end "Leave It" training flow
  - Verify XP awarded to IMP stat
  - Verify activity appears in feed
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 6.5 Test error scenarios
  - Test with invalid dog ID
  - Test with empty voice transcript
  - Test with network timeout simulation
  - Verify error responses match expected format
  - _Requirements: 4.3, 5.3, 6.3_

- [ ]* 6.6 Write property test for error response format
  - **Property 5: Error response format**
  - **Validates: Requirements 5.3, 6.3**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 8. Deploy and verify
- [x] 8.1 Deploy to Netlify
  - Push changes to trigger Netlify build
  - Verify API routes are accessible at production URL
  - Test /api/vr-status endpoint from browser
  - Test /api/voice-log endpoint with curl/Postman
  - _Requirements: 6.1, 6.2_

- [x] 8.2 Update VR app configuration
  - Set production URL in AppConfiguration
  - Disable mock data in NetworkService
  - Build and deploy VR app to Vision Pro
  - _Requirements: 7.1_

- [x] 8.3 Perform end-to-end demo rehearsal
  - Practice complete 15-25 second demo flow
  - Verify real-time sync between VR and web app
  - Test voice commands and stat updates
  - Prepare backup plan if API fails
  - _Requirements: All_

- [ ]* 8.4 Write unit tests for edge cases
  - Test with missing dog ID parameter
  - Test with malformed JSON in voice log
  - Test with very long transcripts
  - Test with special characters in transcripts
  - _Requirements: 4.2, 5.5_

- [ ]* 8.5 Write property test for dog identification fallback
  - **Property 4: Dog identification fallback**
  - **Validates: Requirements 4.2**

