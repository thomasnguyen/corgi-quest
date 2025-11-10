# Implementation Plan: Corgi Quest MVP

This implementation plan breaks down the Corgi Quest MVP into discrete, incremental coding tasks. Each task builds on previous tasks and focuses on getting real-time functionality working first, as this is the core showcase feature for the hackathon.

**Status:** Core MVP features are complete! Voice logging with OpenAI Realtime API, real-time sync, and all 6 main screens are working. Remaining tasks focus on new features (mood tracking, AI recommendations, BUMI character sheet, character selection) and polish.

## Implementation Summary

### ✅ Completed Core MVP (Tasks 1-51)
**All essential features for the hackathon demo are working:**
- Complete database schema with 9 tables (users, households, dogs, dog_stats, activities, activity_stat_gains, daily_goals, streaks, presence)
- All Convex queries and mutations for real-time data sync
- XP calculation utilities with unit tests
- All 6 main screens: Overview, Activity Feed, Quests, Stat Detail, Quest Detail, Voice Logging
- Real-time activity feed with instant updates across devices
- Voice interface with OpenAI Realtime API (audio-to-audio conversations)
- Audio visualization with @pipecat-ai/voice-ui-kit CircularWaveform
- Function calling for automatic activity saving
- Optimistic UI updates for instant feedback
- Activity confirmation display with "Log Another" and "View Feed" buttons
- All core components (StatOrb, StatGrid, ActivityFeedItem, QuestCard, ProgressBar, Toast, etc.)
- Level-up celebration animations and toast notifications
- TopResourceBar with real-time daily goals and streak
- Daily goal reset cron job (runs at midnight)
- Streak update logic (increments/resets based on goal completion)
- Today's Breakdown section in Activity screen
- Presence indicators showing when partner is logging
- Connection status indicators (offline, reconnecting, syncing)
- Offline mutation queueing (automatic sync when back online)
- Quest completion detection (checkmarks on completed quests)
- Timestamp formatting utility (relative time display)

### 🚧 Remaining Features (Tasks 17.1-104)
**New features from updated requirements (not in original MVP):**
- Project foundation with TanStack Start and Convex
- Complete database schema (8 tables)
- All Convex queries and mutations
- XP calculation utilities with unit tests
- All 6 main screens (Overview, Activity, Quests, Stat Detail, Quest Detail, Voice Logging)
- Real-time activity feed with toast notifications
- Voice interface with OpenAI Realtime API integration
- Audio visualization with @pipecat-ai/voice-ui-kit
- Function calling for automatic activity saving
- Optimistic UI updates
- Activity confirmation display
- All core components (StatOrb, StatGrid, ActivityFeedItem, QuestCard, etc.)

**Quest Enhancements (Tasks 17.1-17.2):**
- Quest completion counter (show "Done 2x today")
- Highlight quests that help with incomplete daily goals

**Mood Tracking System (Tasks 61-71):**
- Mood logging with 6 mood options (calm, anxious, reactive, playful, tired, neutral)
- Mood entries in activity feed
- Mood indicator in TopResourceBar
- Daily mood reminder popup (after 6pm)
- Real-time mood sync and toast notifications

**AI-Powered Recommendations (Tasks 72-80):**
- OpenAI API integration for personalized activity suggestions
- Analyze mood patterns and activity history
- Generate 3-5 daily recommendations
- AI Recommendations tab in Quests screen
- Recommendation caching and refresh

**BUMI Character Sheet Tab (Tasks 81-96):**
- 4th bottom nav tab for BUMI character sheet
- STATS sub-tab with radar chart and progress bars
- ITEMS sub-tab with cosmetic items (unlocked per level)
- AI image generation for dog wearing items
- Item equipping/unequipping with real-time portrait updates
- Cosmetic items database tables

**Character Selection (Tasks 97-104):**
- Character selection screen (gacha-style cards)
- 3 playable characters per household
- Character persistence in localStorage
- Character-specific activity logging and mood tracking

**Optional Testing & Polish (Tasks 52-55):**
- Accessibility tests
- Demo preparation features
- Performance optimizations
- Real-time sync testing on devices

## Current State Analysis

**What's Working:**
- ✅ Core hackathon demo is fully functional
- ✅ Real-time sync between devices (< 1 second latency)
- ✅ Voice logging with OpenAI Realtime API (audio-to-audio)
- ✅ All 6 main screens implemented and styled
- ✅ XP calculations, level-ups, daily goals, streaks all working
- ✅ Offline support with automatic sync
- ✅ Presence indicators and connection status

**What's Next:**
The remaining tasks (17.1-104) are **new features** added after the initial MVP was completed. These are enhancements based on updated requirements:
1. **Mood Tracking** - Track dog's emotional state throughout the day
2. **AI Recommendations** - Personalized activity suggestions based on mood patterns
3. **BUMI Character Sheet** - Detailed stats view with cosmetic items
4. **Character Selection** - Choose which household member you're playing as

**Recommendation:**
If the goal is to demo the hackathon MVP, **no additional work is needed** - the core features are complete. The remaining tasks are optional enhancements that can be added incrementally.

---

## Task List

- [x] 1. Set up project foundation and Convex integration
  - Initialize TanStack Start project with TypeScript
  - Install and configure Convex
  - Set up Convex client in the application
    - Create basic project structure (routes, components, hooks folders)
  - Configure TypeScript strict mode
  - _Requirements: 17, 18_

- [x] 2. Implement Convex database schema
  - Create schema.ts with all 8 table definitions
  - Define validators for users, households, dogs tables
  - Define validators for dog_stats, activities, activity_stat_gains tables
  - Define validators for daily_goals, streaks tables
  - Add appropriate indexes for query optimization
  - _Requirements: 17, 18_

- [x] 3. Create database seeding mutation
  - Implement seed mutation to create demo household
  - Create two users ("Thomas" and "Holly")
  - Create dog "Bumi" with overallLevel: 8, overallXp: 50, xpToNextLevel: 100
  - Create four dog_stats records with linear 100 XP per level:
    - INT: level 7, xp: 30, xpToNextLevel: 100
    - PHY: level 9, xp: 75, xpToNextLevel: 100
    - IMP: level 5, xp: 20, xpToNextLevel: 100
    - SOC: level 6, xp: 60, xpToNextLevel: 100
  - Create today's daily_goals record (physicalPoints: 35/50, mentalPoints: 20/30)
  - Create streak record (currentStreak: 15, longestStreak: 22)
  - Create 3-4 sample activities from past few hours with realistic XP/point values
  - _Requirements: 19_

- [x] 4. Implement core Convex queries for real-time subscriptions
  - Create query to get dog profile with stats
  - Create query to get daily goals for today
  - Create query to get current streak
  - Create query to get activity feed (20 most recent)
  - Create query to get stat detail with recent activities
  - Test queries in Convex dashboard
  - _Requirements: 1, 2, 3, 4, 5, 6, 10_

- [x] 5. Implement activity logging mutation with XP awards
  - Create logActivity mutation that accepts activity data and stat gains
  - Insert activity record into activities table
  - Insert stat gain records into activity_stat_gains table
  - Update dog_stats with new XP values for each affected stat
  - Update dog overall XP (sum of all stat gains)
  - Implement level-up logic: when XP >= 100, increment level and set XP to overflow
  - Handle multiple level-ups if overflow XP > 100
  - Update daily_goals with physical and mental points
  - Update streak lastActivityDate to today
  - Test mutation in Convex dashboard with various XP amounts
  - _Requirements: 1, 3, 5, 7, 8, 9, 21, 22_

- [x] 6. Create XP calculation utility functions
  - Implement calculateLevelUp function (handles XP overflow, always 100 XP per level)
  - Create activity XP lookup tables (duration-based and fixed activities)
  - Implement calculateActivityXp function (duration * baseXP/10min for duration-based)
  - Implement distributeStatXp function (splits XP by percentages: PHY 70%, IMP 30%, etc.)
  - Implement calculateDailyPoints function (maps activities to physical/mental points)
  - Reference design doc Activity XP Tables for all values
  - _Requirements: 3, 8_

- [x] 6.1 Write unit tests for XP calculations
  - Test level-up with exact 100 XP threshold
  - Test level-up with overflow (e.g., 80 XP + 30 = level up, 10 XP remaining)
  - Test multiple level-ups (e.g., 80 XP + 250 = 2 level ups, 30 XP remaining)
  - Test no level-up when below 100 XP threshold
  - Test activity XP calculations (20min walk = 30 XP, 30min fetch = 60 XP split)
  - Test stat XP distribution (Fetch: 70% PHY, 30% IMP)
  - _Requirements: 3_

- [x] 7. Set up main layout with navigation structure
  - Create Layout component with top resource bar and bottom nav
  - Implement BottomNav component with 3 tabs (OVERVIEW, QUESTS, ACTIVITY)
  - Implement TopResourceBar component (placeholder for now)
  - Create LogActivityButton component (fixed above bottom nav)
  - Apply Figma design styles using custom CSS modules and from MCP server
  - _Requirements: 14, 15, 16, 20_

- [x] 8. Implement Overview screen (index route)
  - Create index.tsx route file
  - Use useQuery to subscribe to dog profile data
  - Display dog name and level badge in header
  - Display overall XP progress bar
  - Display dog portrait image (placeholder for now)
  - Display loading state while data loads
  - _Requirements: 2, 13, 20_

- [x] 9. Create StatOrb component with real-time updates
  - Create src/components/dog/StatOrb.tsx component
  - Implement circular progress ring using SVG
  - Display stat abbreviation (INT/PHY/IMP/SOC), level, and XP progress
  - Calculate progress percentage for visual ring (xp / xpToNextLevel * 100)
  - Make orb clickable to navigate to stat detail route
  - _Requirements: 2, 3, 20_

- [x] 10. Create StatGrid component and integrate into Overview
  - Create src/components/dog/StatGrid.tsx component
  - Display 4 StatOrbs in a 2x2 grid layout
  - Pass stat data from dogProfile query to each StatOrb
  - Handle navigation to /stats/$statType route on orb click
  - Integrate StatGrid into index.tsx below dog portrait
  - Verify real-time updates work when stats change
  - _Requirements: 2, 3, 13_

- [x] 11. Implement TopResourceBar with real-time daily goals and streak
  - Update src/components/layout/TopResourceBar.tsx to use real data
  - Subscribe to getDailyGoals query using useQuery
  - Subscribe to getStreak query using useQuery
  - Display "TODAY | 💪 X/50 | 🧠 Y/30 | 🔥 Z" format
  - Handle case when no daily goal exists (show 0/50, 0/30)
  - Update in real-time when activities are logged
  - _Requirements: 5, 6, 16_

- [x] 12. Implement Activity Feed screen (activity route)
  - Update src/routes/activity.tsx to use real data
  - Subscribe to getActivityFeed query using useQuery
  - Display loading state while data loads (spinner)
  - Handle empty state with message "No activities yet. Log your first activity!"
  - _Requirements: 10_

- [x] 13. Create ActivityFeedItem component
  - Create src/components/activity/ActivityFeedItem.tsx component
  - Display user name (from query data)
  - Display activity name and description (if exists)
  - Display stat gains with format "PHY +30 XP, IMP +10 XP"
  - Display relative timestamp using helper function (e.g., "2h ago")
  - _Requirements: 10, 20_

- [x] 14. Integrate ActivityFeedItem into Activity Feed with real-time updates
  - Map getActivityFeed results to ActivityFeedItem components in activity.tsx
  - Display activities in reverse chronological order (newest first)
  - Verify new activities appear at top in real-time
  - Test with two browsers: log activity in one, see it appear in other instantly
  - _Requirements: 1, 10_

- [x] 15. Implement Quests screen (quests route)
  - Update src/routes/quests.tsx with quest data
  - Define quest data structure: { id, name, category, points, description }
  - Create static quest list from requirements:
    - Physical: Morning Walk (30), Fetch Session (15), Dog Park Visit (40), Long Walk 60min+ (50)
    - Mental: Training Session (20), Puzzle Toy (10), New Trick Training (25), Hide & Seek (15)
  - Display quests grouped by category with headers
  - _Requirements: 11_

- [x] 16. Create QuestCard component
  - Create src/components/quests/QuestCard.tsx component
  - Display quest name and description
  - Display category badge (PHYSICAL or MENTAL)
  - Display point value prominently
  - Make card clickable to navigate to /quests/$questId route
  - _Requirements: 11, 20_

- [x] 17. Implement quest completion detection
  - Subscribe to getActivityFeed query in quests.tsx
  - Check if any activity from today matches quest name
  - Pass completion status to QuestCard component
  - Display checkmark (✓) on completed quests
  - Update in real-time when activity is logged
  - _Requirements: 11_

- [ ] 17.1 Add quest completion counter
  - Count how many times each quest has been completed today from activity feed
  - Pass completion count to QuestCard component
  - Display count in gray text below quest name (e.g., "Done 2x today")
  - Show "Not done today" or hide text if count is 0
  - Update count in real-time when activities are logged
  - _Requirements: 11_

- [ ] 17.2 Highlight quests that help with daily goals
  - Subscribe to getDailyGoals query in quests.index.tsx
  - Determine which goal needs more progress (physical < 50 or mental < 30)
  - Match quest category (Physical/Mental) to incomplete goals
  - Pass helpsWithGoals boolean to QuestCard component
  - Add visual indicator (border, badge, or highlight) to helpful quests
  - Update highlighting in real-time as goals progress
  - _Requirements: 11_

- [x] 18. Implement Stat Detail screen (stats.$statType route)
  - Create src/routes/stats.$statType.tsx dynamic route file
  - Get statType from route params using Route.useParams()
  - Subscribe to getStatDetail query with dogId and statType
  - Display stat name (full name: Intelligence, Physical, etc.) and level in header
  - Display large XP progress bar with current/total and percentage
  - Add back button using router.history.back() or Link to="/"
  - _Requirements: 4_

- [x] 19. Display recent activities in Stat Detail screen
  - Use recentActivities from getStatDetail query result
  - Display list of activities with name, XP amount, and timestamp
  - Format timestamps as relative time (e.g., "2h ago")
  - Show empty state if no activities yet
  - Update list in real-time when new activities are logged
  - _Requirements: 4_

- [x] 20. Display suggested activities in Stat Detail screen
  - Create static suggestions based on stat type:
    - PHY: Walk, Run/Jog, Fetch, Swimming
    - INT: Puzzle Toy, Trick Practice, Sniff Walk
    - IMP: Training Session, Fetch, Tug-of-War
    - SOC: Playdate, Dog Park Visit, Grooming
  - Display activity name and potential XP reward from xpCalculations constants
  - Make suggestions clickable to navigate to /log-activity with pre-filled data
  - _Requirements: 4, 20_

- [x] 21. Implement Quest Detail screen (quests.$questId route)
  - Create src/routes/quests.$questId.tsx dynamic route file
  - Get questId from route params
  - Look up quest data from static quest list
  - Display quest name, category badge, and point value
  - Display quest instructions/description
  - Add "Complete Quest" button that navigates to /log-activity
  - _Requirements: 12, 20_

- [x] 22. Install and configure @pipecat-ai/voice-ui-kit
  - Install @pipecat-ai/voice-ui-kit package via npm
  - Import VoiceVisualizer component in voice interface
  - Test that package imports correctly
  - _Requirements: 7_

- [x] 23. Implement OpenAI session token generation action
  - Create convex/actions/generateSessionToken.ts
  - Add OPENAI_API_KEY to environment variables (.env.local and Convex dashboard)
  - Implement fetch to OpenAI /v1/realtime/sessions endpoint
  - Return client_secret.value as session token
  - Handle errors if API key is missing or request fails
  - Test action in Convex dashboard
  - _Requirements: 7, 24_

- [x] 24. Create useOpenAIRealtime hook for WebSocket connection
  - Create src/hooks/useOpenAIRealtime.ts
  - Implement microphone permission request
  - Implement WebSocket connection to OpenAI Realtime API using session token
  - Handle connection states (disconnected, connecting, connected, error)
  - Implement automatic reconnection with exponential backoff
  - Handle WebSocket message events (session.created, conversation.item.created, etc.)
  - Handle WebSocket error and close events
  - _Requirements: 7, 24_

- [x] 25. Define saveActivity function schema for OpenAI
  - Create function definition object with name "saveActivity"
  - Define parameters schema: activityName (string), durationMinutes (number, optional), statGains (array), physicalPoints (number), mentalPoints (number)
  - Add detailed descriptions for each parameter to guide OpenAI
  - Include stat type enum (INT, PHY, IMP, SOC) in schema
  - Reference Activity XP Tables from design doc in function description
  - _Requirements: 8_

- [x] 26. Create system instructions for OpenAI Realtime API
  - Write system prompt that explains Corgi Quest context
  - Include Activity XP Tables with XP calculations in instructions
  - Instruct OpenAI to identify activity type, extract duration, calculate XP
  - Instruct OpenAI to call saveActivity function with structured data
  - Instruct OpenAI to respond with enthusiastic spoken confirmation including XP details
  - Example response format: "Logged! 20 minute walk - that's 30 XP for Physical. Great job!"
  - _Requirements: 8_

- [x] 27. Implement RealtimeVoiceInterface component
  - Create src/components/voice/RealtimeVoiceInterface.tsx
  - Use useOpenAIRealtime hook for connection management
  - Request microphone permission on mount
  - Generate session token via Convex action
  - Establish WebSocket connection to OpenAI
  - Send session.update with system instructions and function definition
  - Display connection status (connecting, connected, error)
  - _Requirements: 7, 24_

- [x] 28. Implement audio streaming in RealtimeVoiceInterface
  - Capture microphone audio using MediaRecorder API
  - Convert audio to PCM16 format at 24kHz sample rate
  - Stream audio chunks to OpenAI via WebSocket (input_audio_buffer.append events)
  - Receive audio responses from OpenAI (response.audio.delta events)
  - Play OpenAI's audio responses through device speakers using Web Audio API
  - Handle audio streaming errors
  - _Requirements: 7_

- [x] 29. Integrate VoiceVisualizer from @pipecat-ai/voice-ui-kit
  - Import VoiceVisualizer component in RealtimeVoiceInterface
  - Pass isListening state to control visualization
  - Configure visualizer: 32 bars, black color, 4px width, 4px gap
  - Display visualizer prominently in center of screen
  - Update isListening state based on conversation state
  - _Requirements: 7, 20_

- [x] 30. Implement function call handling in RealtimeVoiceInterface
  - Listen for response.function_call_arguments.done events from OpenAI
  - Parse function call arguments JSON
  - Validate parameters (activityName, statGains array, points)
  - Call logActivity mutation with parsed parameters
  - Send function call result back to OpenAI (conversation.item.create with function_call_output)
  - Handle mutation errors and send error response to OpenAI
  - _Requirements: 8, 24_

- [x] 31. Implement conversation state management
  - Track conversation state (idle, listening, processing, speaking)
  - Update UI based on state (show different messages/icons)
  - Handle user interruptions (allow stopping OpenAI mid-response)
  - Implement "Stop" button to end conversation
  - Clear conversation state on unmount
  - _Requirements: 7_

- [x] 32. Show activity confirmation on log screen
  - After logActivity mutation succeeds, display logged activity details in a success card
  - Show toast notification with XP gained (e.g., "Activity logged! +15 XP earned")
  - Add "Log Another" button to reset the interface for immediate next logging
  - Add "View Feed" button to navigate to /activity route
  - Keep WebSocket connection open for seamless consecutive logging
  - Let AI speak confirmation message naturally (already implemented)
  - _Requirements: 7_

- [x] 33. Implement optimistic UI updates for activity logging
  - Use Convex's built-in optimistic updates with useMutation
  - Update local activity feed immediately when OpenAI calls saveActivity
  - Show new activity at top of feed before server confirms
  - Convex will automatically reconcile with server response
  - Handle rollback if mutation fails (Convex handles this automatically)
  - Test optimistic updates work smoothly
  - _Requirements: 23_

- [x] 34. Implement real-time toast notifications
  - Create src/components/ui/Toast.tsx component with 4 levels (error, warning, info, success)
  - Create toast context/state management
  - Subscribe to getActivityFeed query in Layout component
  - Detect when new activity is added (compare previous vs current data)
  - Display toast with format "Holly logged Walk - PHY +30 XP"
  - Auto-dismiss toast after 3 seconds
  - Position toasts at top of screen, stack if multiple
  - _Requirements: 1, 21_

- [x] 35. Implement level-up celebration animation
  - Check levelUps array returned from logActivity mutation
  - Display toast notification for each level-up (e.g., "PHY leveled up to 10!")
  - Add CSS animation to StatOrb when level increases (pulse or glow effect)
  - Trigger celebration on all connected clients via real-time subscription
  - _Requirements: 22_

- [x] 36. Update TopResourceBar to use real daily goals data
  - TopResourceBar currently shows hardcoded values (45/60, 30/45, streak 15)
  - Subscribe to getDailyGoals and getStreak queries
  - Display actual physical/mental points from database
  - Display actual streak value from database
  - Handle case when no daily goal exists for today (show 0/50, 0/30)
  - Update in real-time when activities are logged
  - _Requirements: 5, 6, 16_

- [x] 37. Implement daily goal reset scheduled function
  - Create convex/crons.ts with daily reset cron job
  - Schedule to run at midnight (0 0 * * *) using Convex cron syntax
  - Query all dogs in database
  - For each dog, create new daily_goals record with today's date
  - Set physicalPoints: 0, physicalGoal: 50, mentalPoints: 0, mentalGoal: 30
  - Test cron job in Convex dashboard
  - _Requirements: 5_

- [x] 38. Implement streak update logic
  - Add streak check logic to daily goal reset cron
  - Query yesterday's daily_goals for each dog
  - Check if physicalPoints >= physicalGoal AND mentalPoints >= mentalGoal
  - If both met: increment currentStreak, update longestStreak if needed
  - If not met: reset currentStreak to 0
  - Update streaks table for each dog
  - _Requirements: 6_

- [x] 39. Implement "Complete Quest" button functionality
  - Add "Complete Quest" button to Quest Detail screen
  - Navigate to /log-activity route with quest name in router state
  - Pre-populate OpenAI conversation with quest context if quest name provided
  - OpenAI should acknowledge the quest and ask for duration/details
  - Continue with normal voice conversation flow
  - _Requirements: 11, 12_

- [x] 40. Implement Today's Breakdown section in Activity screen
  - Query today's activities using getActivityFeed
  - Filter activities by today's date
  - Group activities by Physical (physicalPoints > 0) vs Mental (mentalPoints > 0)
  - Add filter dropdown/tabs to filter by person (All, Thomas, Holly)
  - Display activity cards showing name and points in two columns
  - Update in real-time as activities are logged
  - Add to Activity screen above the activity feed
  - _Requirements: 10, 20_

- [x] 41. Add presence indicators for real-time awareness
  - Create presence table in schema (userId, location, lastSeen)
  - Create mutation to update presence when entering/leaving log-activity screen
  - Create query to get partner's presence status
  - Display "Holly is logging..." indicator in TopResourceBar when partner is on log-activity
  - Clear presence on unmount or navigation away
  - _Requirements: 1_

- [x] 42. Implement connection status indicator
  - Use Convex client connection state API
  - Monitor WebSocket connection status (both Convex and OpenAI)
  - Display small indicator in TopResourceBar (• connected, ○ disconnected)
  - Show "Reconnecting..." message when connection lost
  - Convex handles reconnection automatically with exponential backoff
  - _Requirements: 24_

- [x] 43. Implement offline mutation queueing
  - Convex handles offline queueing automatically
  - Mutations are queued when offline and retried when online
  - Add visual indicator showing "Syncing..." when mutations are pending
  - Test by going offline, logging activity, then going back online
  - Verify activity syncs automatically
  - _Requirements: 24_

- [x] 44. Implement ProgressBar component
  - Create src/components/ui/ProgressBar.tsx component
  - Accept props: current (number), max (number), label (optional string)
  - Calculate percentage: (current / max) * 100
  - Display horizontal bar with black fill on gray background
  - Show numeric values: "X / Y" below bar
  - Use in Overview (overall XP) and Stat Detail screens
  - _Requirements: 2, 4, 13, 20_



- [x] 47. Add Lucide React icons throughout the app
  - lucide-react is already installed and used in BottomNav and LogActivityButton
  - Add icons to quest categories (Dumbbell for Physical, Brain for Mental)
  - Add icons to stat types (Lightbulb=INT, Zap=PHY, Shield=IMP, Users=SOC)
  - Add icons to buttons (ArrowLeft for back, Mic for voice, Check for confirm)
  - Add Mic icon to voice interface to indicate listening state
  - Ensure all icons use strokeWidth={2} for consistency
  - _Requirements: 20_

- [x] 49. Add loading states to all data-dependent screens
  - Loading states already implemented in index.tsx (spinner)
  - Add similar loading states to activity.tsx, quests.tsx, stats.$statType.tsx
  - Add loading state to voice interface during session token generation
  - Add loading state during OpenAI connection establishment
  - Use consistent spinner design (animate-spin with border)
  - Show loading text "Loading..." or "Connecting..." below spinner
  - Test by throttling network in dev tools
  - _Requirements: 8, 10, 12, 18, 24_

- [x] 50. Add empty states for screens with no data
  - Empty state already implemented in activity feed
  - Add empty state to stat detail: "No activities for this stat yet" (already done)
  - Add empty state to today's breakdown: "No activities logged today"
  - Use consistent design with gray text and helpful message
  - _Requirements: 10, 19_

- [x] 51. Implement timestamp formatting utility
  - Create src/lib/utils.ts function formatRelativeTime(timestamp: number)
  - Handle: "just now" (<1 min), "Xm ago" (<60 min), "Xh ago" (<24 hrs), "Xd ago"
  - Use in ActivityFeedItem and Stat Detail recent activities
  - Test with various timestamps
  - _Requirements: 10, 19_

- [ ]* 52. Write accessibility tests
  - Test keyboard navigation through bottom nav
  - Test screen reader announcements for stat updates
  - Test focus management in voice logging flow
  - Test that audio responses from OpenAI are perceivable
  - _Requirements: 25_

- [ ]* 53. Implement demo preparation features
  - seedDemoData mutation already exists and works
  - Add resetDemoData mutation to clear all data and re-seed
  - Test demo flow: reset → seed → log activity via voice → verify real-time updates
  - Practice demo multiple times to ensure smooth flow
  - _Requirements: 19_

- [ ]* 54. Performance optimization for real-time updates
  - Wrap StatOrb, ActivityFeedItem in React.memo to prevent unnecessary re-renders
  - Use useMemo for XP percentage calculations
  - Optimize audio streaming to minimize latency
  - Convex queries already have proper indexes from schema
  - Test performance with React DevTools Profiler
  - Ensure smooth animations (no jank)
  - _Requirements: 1, 22_

- [ ]* 55. Test real-time sync on actual devices
  - Deploy to Vercel or similar hosting
  - Test on two physical phones (iPhone and Android)
  - Verify real-time updates work over WiFi and cellular
  - Test voice logging on both iOS Safari and Android Chrome
  - Test with throttled network (Chrome DevTools 3G)
  - Measure latency from mutation to UI update (<1 second target)
  - Measure audio streaming latency (<200ms target)
  - _Requirements: 1, 25_


- [x] 61. Add mood_logs table to database schema
  - Add mood_logs table definition to convex/schema.ts
  - Define mood union type: calm, anxious, reactive, playful, tired, neutral
  - Add fields: dogId, userId, mood, note (optional), activityId (optional), createdAt
  - Add indexes: by_dog, by_dog_and_created
  - Test schema in Convex dashboard
  - _Requirements: 26_

- [x] 62. Create mood logging mutation
  - Create logMood mutation in convex/mutations.ts
  - Accept args: dogId, userId, mood, note (optional), activityId (optional)
  - Insert mood_logs record with current timestamp
  - Return mood log ID
  - Test mutation in Convex dashboard
  - _Requirements: 26_

- [ ] 63. Create mood queries
  - Create getMoodFeed query to get recent mood logs (last 20)
  - Create getLatestMood query to get most recent mood for a dog
  - Create getTodaysMoods query to check if mood logged today
  - Test queries in Convex dashboard
  - _Requirements: 26_

- [ ] 64. Create MoodPicker component
  - Create src/components/mood/MoodPicker.tsx
  - Display 6 mood options in grid layout
  - Each mood shows emoji + label (😊 Calm, 😰 Anxious, etc.)
  - Include optional note textarea (max 200 chars)
  - Add "Cancel" and "Log Mood" buttons
  - Handle mood selection and note input
  - _Requirements: 26_

- [ ] 65. Create MoodFeedItem component
  - Create src/components/mood/MoodFeedItem.tsx
  - Display user name, mood emoji + label, optional note, timestamp
  - Style differently from ActivityFeedItem (different background/border)
  - Format timestamp as relative time (e.g., "2h ago")
  - _Requirements: 26_

- [ ] 66. Add mood logging button to Activity screen
  - Add "LOG MOOD" button to Activity screen (above or below activity feed)
  - Button opens MoodPicker modal
  - Call logMood mutation when user confirms
  - Show loading state during mutation
  - Display success toast after logging
  - _Requirements: 26_

- [ ] 67. Integrate mood entries into activity feed
  - Merge mood logs and activities into unified chronological feed
  - Sort by createdAt timestamp (newest first)
  - Display MoodFeedItem for mood entries, ActivityFeedItem for activities
  - Update feed in real-time when mood is logged
  - Test with two browsers: log mood in one, see it appear in other
  - _Requirements: 26_

- [ ] 68. Add mood indicator to TopResourceBar
  - Add 4th item to resource bar: mood emoji (latest mood)
  - Subscribe to getLatestMood query
  - Display mood emoji (or "—" if no mood logged)
  - Make mood indicator tappable to open MoodPicker
  - Update in real-time when partner logs mood
  - Handle case when no mood exists (show "—" or "Tap to log")
  - _Requirements: 26_

- [ ] 69. Implement daily mood reminder (6pm+)
  - Create hook to check if current time is after 6pm
  - Query getTodaysMoods to check if mood logged today
  - Show dismissible popup if no mood logged and time > 6pm
  - Popup shows: "How is Bumi feeling today?" with mood options
  - Add "Log Mood Now", "Remind Me Later" (2hr), "Dismiss" (for day) buttons
  - Store dismissal state in localStorage (key: moodReminderDismissed_YYYY-MM-DD)
  - Only show once per day
  - _Requirements: 26_

- [ ] 70. Add real-time toast for partner mood logs
  - Subscribe to mood feed in Layout component
  - Detect when new mood is added (compare previous vs current data)
  - Display toast: "Sarah logged: Bumi is 😊 Calm"
  - Auto-dismiss after 3 seconds
  - Stack multiple toasts if several moods logged quickly
  - _Requirements: 26_

- [ ] 71. Update seed mutation to include sample mood logs
  - Add 2-3 sample mood_logs entries to seed.ts
  - Create moods from past few hours with realistic timestamps
  - Include variety of moods (calm, playful, etc.)
  - Test seed mutation includes mood logs
  - _Requirements: 26_

- [ ] 72. Create AI recommendations Convex action
  - Create convex/actions/generateRecommendations.ts
  - Query mood logs from last 7 days
  - Query activity history from last 7 days
  - Query current stats and daily goals
  - Format data for OpenAI API
  - Call OpenAI Chat Completion API with analysis prompt
  - Parse OpenAI response into structured recommendations
  - Return recommendations array
  - Handle errors gracefully
  - _Requirements: 27_

- [ ] 73. Create OpenAI recommendation prompt
  - Write system prompt explaining Corgi Quest context
  - Include mood pattern analysis instructions
  - Include activity effectiveness analysis
  - Include stat gap identification
  - Include daily goal consideration
  - Specify output format (JSON with activity name, reasoning, XP, etc.)
  - Test prompt with sample data
  - _Requirements: 27_

- [ ] 74. Create QuestTabs component
  - Create src/components/quests/QuestTabs.tsx
  - Display two tabs: "ALL QUESTS" and "AI RECOMMENDATIONS"
  - Handle tab switching state
  - Style tabs to match app design
  - Show active tab indicator
  - _Requirements: 27_

- [ ] 75. Create AIRecommendations component
  - Create src/components/quests/AIRecommendations.tsx
  - Call generateRecommendations action on mount (if no cache)
  - Display loading state while generating
  - Display recommendations in card layout
  - Show activity name, reasoning, expected mood impact, XP rewards
  - Add "Log Activity" button for each recommendation
  - Add "Refresh Recommendations" button
  - Handle errors (show error message with retry)
  - _Requirements: 27_

- [ ] 76. Integrate tabs into Quests screen
  - Update src/routes/quests.index.tsx
  - Add QuestTabs component at top
  - Conditionally render: All Quests view OR AI Recommendations view
  - Maintain existing quest functionality in "ALL QUESTS" tab
  - Add AI Recommendations view in "AI RECOMMENDATIONS" tab
  - _Requirements: 27_

- [ ] 77. Link recommendations to activity logging
  - When user taps "Log Activity" on recommendation
  - Navigate to /log-activity route
  - Pass activity name in route state or search params
  - Pre-populate voice interface with activity context
  - OpenAI should acknowledge the recommended activity
  - _Requirements: 27_

- [ ] 78. Add recommendation caching (optional)
  - Create recommendations table in Convex schema (optional)
  - Or cache in component state (simpler)
  - Cache recommendations for current day
  - Invalidate cache when new mood/activity logged
  - Show "Last updated: X minutes ago" in UI
  - _Requirements: 27_

- [ ] 79. Add error handling for AI recommendations
  - Handle OpenAI API failures gracefully
  - Show user-friendly error message
  - Provide retry button
  - Handle rate limiting
  - Handle network errors
  - Show fallback message if no recommendations available
  - _Requirements: 27_

- [ ] 80. Polish AI recommendations UI
  - Style recommendation cards to match app design
  - Add visual distinction from regular quests
  - Show AI icon/badge
  - Add smooth loading animations
  - Ensure mobile-responsive layout
  - Test on various screen sizes
  - _Requirements: 27_

- [ ] 81. Add BUMI tab to bottom navigation
  - Update src/components/layout/BottomNav.tsx
  - Add 4th tab: "BUMI"
  - Add navigation route /bumi
  - Update tab icons/images
  - Ensure mobile-responsive layout
  - _Requirements: 28_

- [ ] 82. Create cosmetic_items and equipped_items database tables
  - Add cosmetic_items table to convex/schema.ts
  - Add equipped_items table to convex/schema.ts
  - Define item unlock levels (1 per level, starting at level 2)
  - Add indexes: by_unlock_level, by_dog
  - Test schema in Convex dashboard
  - _Requirements: 28_

- [ ] 83. Seed cosmetic items data
  - Create seed data for cosmetic items (1 per level, starting at level 2)
  - Define item types: warrior, mage, ranger, paladin, etc.
  - Add icons/emojis for each item
  - Add descriptions for each item
  - Update seed mutation to include cosmetic items
  - _Requirements: 28_

- [ ] 84. Create RadarChart component
  - Create src/components/dog/RadarChart.tsx
  - Use recharts library or custom SVG
  - Display 4 stats in pentagon/spider chart format
  - White lines on black background
  - 200x200px size
  - Make it responsive
  - _Requirements: 28_

- [ ] 85. Create StatsView component (STATS sub-tab)
  - Create src/components/dog/StatsView.tsx
  - Display Bumi portrait with current outfit
  - Display name + level badge
  - Display overall XP bar
  - Display RadarChart component
  - Display 4 horizontal progress bars (one per stat)
  - Make progress bars tappable → navigate to stat detail
  - Style to match app design
  - _Requirements: 28_

- [ ] 86. Create ItemCard component
  - Create src/components/dog/ItemCard.tsx
  - Display item icon, name, description
  - Show "UNLOCKED" or "LOCKED" state
  - Show unlock requirement for locked items
  - Add "Equip" button for unlocked items
  - Show "Currently Equipped" badge
  - Style to match app design
  - _Requirements: 28_

- [ ] 87. Create ItemsView component (ITEMS sub-tab)
  - Create src/components/dog/ItemsView.tsx
  - Display large Bumi portrait at top (with current outfit)
  - Display "Currently Wearing: [Item Name]"
  - Display grid of unlocked items
  - Display grid of locked items (grayed out)
  - Handle item equip/unequip
  - Show loading state during image generation
  - _Requirements: 28_

- [ ] 88. Create BumiCharacterSheet component
  - Create src/components/dog/BumiCharacterSheet.tsx
  - Add sub-tab navigation: "STATS" and "ITEMS"
  - Conditionally render StatsView or ItemsView
  - Handle tab switching
  - Style tabs to match app design
  - _Requirements: 28_

- [ ] 89. Create BUMI route
  - Create src/routes/bumi.tsx
  - Use BumiCharacterSheet component
  - Subscribe to dog profile data
  - Subscribe to equipped items
  - Handle loading states
  - _Requirements: 28_

- [ ] 90. Create generateItemImage Convex action
  - Create convex/actions/generateItemImage.ts
  - Accept args: dogId, itemId, baseImageUrl (Bumi photo)
  - Create prompt: "A corgi dog wearing [item name], [item type] style, [description], high quality, photorealistic"
  - Call OpenAI DALL-E API or Stable Diffusion API
  - Upload generated image to Convex file storage or external storage
  - Return image URL
  - Handle errors gracefully
  - _Requirements: 28_

- [ ] 91. Create equipItem mutation
  - Create equipItem mutation in convex/mutations.ts
  - Accept args: dogId, itemId
  - Check if image already exists for this item
  - If not, call generateItemImage action
  - Delete any existing equipped_items record for this dog (only one item at a time)
  - Insert new equipped_items record
  - Update dog's portrait URL (or reference equipped item)
  - Return equipped item with image URL
  - _Requirements: 28_

- [ ] 92. Create queries for cosmetic items
  - Create getUnlockedItems query (based on dog's level)
  - Create getEquippedItem query (current equipped item)
  - Create getAllCosmeticItems query (all items with unlock status)
  - Test queries in Convex dashboard
  - _Requirements: 28_

- [ ] 93. Integrate item unlock on level up
  - Update logActivity mutation to check for level ups
  - When level up detected, check if new item unlocks
  - If yes, automatically generate image for new item (background)
  - Store generated image in equipped_items (but don't equip)
  - Show "New!" badge in ITEMS tab
  - _Requirements: 28_

- [ ] 94. Add real-time portrait updates
  - Subscribe to equipped_items in BumiCharacterSheet
  - Update portrait when partner equips item
  - Show toast notification: "Sarah equipped [Item Name]"
  - Ensure portrait updates instantly on both devices
  - Test with two browsers
  - _Requirements: 28_

- [ ] 95. Add unequip functionality
  - Add "Unequip" button to currently equipped item
  - Create unequipItem mutation
  - Remove equipped_items record
  - Return to base Bumi portrait
  - Update in real-time
  - _Requirements: 28_

- [ ] 96. Polish BUMI tab UI
  - Ensure mobile-responsive layout
  - Style radar chart and progress bars
  - Add smooth transitions
  - Add loading states for image generation
  - Add error handling UI
  - Test on various screen sizes
  - _Requirements: 28_

- [ ] 97. Add 3rd user to seed data
  - Update seed mutation to include 3rd user Guest
  - Add character title/role for each user (optional)
  - Add avatar/portrait URLs for each user (optional, can use placeholder)
  - Ensure all 3 users are in the same household
  - Test seed mutation includes all 3 users
  - _Requirements: 29_

- [ ] 98. Create CharacterCard component
  - Create src/components/character/CharacterCard.tsx
  - Style like gacha character card: dark background, golden border, character art
  - Display character name, optional title, avatar/portrait
  - Add "Select" button
  - Add hover/press animations
  - Style to match app's black/white/gold aesthetic
  - _Requirements: 29_

- [ ] 99. Create CharacterSelection component
  - Create src/components/character/CharacterSelection.tsx
  - Query all users in household (getHouseholdUsers)
  - Display character cards in vertical scrollable list
  - Handle character selection
  - Store selected character ID in localStorage
  - Navigate to Overview after selection
  - Show loading state while fetching characters
  - _Requirements: 29_

- [ ] 100. Create select-character route
  - Create src/routes/select-character.tsx
  - Use CharacterSelection component
  - Handle case when no characters available
  - Redirect to Overview if character already selected
  - _Requirements: 29_

- [ ] 101. Add character selection check to app entry
  - Update root route or Layout component
  - Check localStorage for selected character
  - If no character selected → redirect to /select-character
  - If character selected → proceed to normal app flow
  - _Requirements: 29_

- [ ] 102. Update app to use selected character
  - Create context or hook to manage selected character
  - Update all queries/mutations to use selected character ID
  - Update activity feed to show selected character's name
  - Update mood logging to use selected character
  - Ensure real-time sync works with character selection
  - _Requirements: 29_

- [ ] 103. Add character change functionality
  - Add "Change Character" option in settings or profile
  - Clear localStorage and redirect to character selection
  - Or add character switcher in UI (optional)
  - _Requirements: 29_

- [ ] 104. Polish character selection UI
  - Ensure mobile-responsive layout
  - Add smooth card animations
  - Add character selection confirmation
  - Style to match gacha game aesthetic (dark, golden accents)
  - Test on various screen sizes
  - _Requirements: 29_

