  # Design Document

  ## Overview

  The VR Training HUD is a visionOS companion app that creates an immersive "command center" for real-world dog training. Built with Swift and SwiftUI, it displays live training stats, daily goals, and recent activities in a clean, minimal environment with Apple-style design. The app integrates with the existing Convex backend to provide real-time synchronization between VR and web experiences, enabling couples to train together across platforms.

  The design prioritizes:
  - **Clean Apple design**: Minimal UI with soft lighting, thin materials (ultraThinMaterial), SF Symbols, and subtle gradients
  - **Head-anchored UI**: Panels follow user's gaze for constant visibility without turning head
  - **View state system**: Four distinct modes (minimal, stats, training, summary) that control which panels are visible
  - **"Leave It" demo focus**: Streamlined impulse control training with 5-rep goal for hackathon presentation
  - **Real-time sync**: 3-second polling updates between VR and web app via Convex
  - **15-25 second demo**: Optimized flow showcasing minimal → training → mark 5 reps → summary → stats → minimal

  ## Architecture

  ### Mono-Repo Structure

  ```
  corgi-quest/
  ├── src/                          # Existing TanStack Start web app
  │   ├── routes/
  │   │   ├── api/
  │   │   │   ├── vr-status.ts     # NEW: VR status endpoint
  │   │   │   └── voice-log.ts     # NEW: Voice log endpoint
  │   │   └── ...
  │   └── ...
  ├── visionos-app/                 # NEW: Separate visionOS app
  │   ├── CorgiQuestVR.xcodeproj
  │   ├── CorgiQuestVR/
  │   │   ├── Views/
  │   │   ├── ViewModels/
  │   │   ├── Models/
  │   │   ├── Services/
  │   │   └── ...
  │   └── README.md
  ├── convex/                       # Existing Convex backend
  │   ├── queries.ts
  │   ├── mutations.ts
  │   ├── actions.ts
  │   └── ...
  └── ...
  ```

  ### System Components

  The VR Training HUD consists of three main layers:

  1. **visionOS App Layer** (Swift + SwiftUI + RealityKit) - `CorgiQuestVR/`
    - TrainingRoomView: Main immersive space with minimal 3D environment
    - FloatingPanelsView: Head-anchored UI with view state management
    - ViewState enum: Controls which panels are visible (minimal, stats, training, summary)
    - SessionPanel: Left-side panel for "Leave It Practice" training
    - StatsScreen: Full-screen overlay with all stats and charts
    - TrainingRoomViewModel: State management, polling, and data fetching
    - NetworkService: API communication layer

  2. **Backend API Layer** (TanStack Start server functions) - `src/routes/api/`
    - GET /api/vr-status: Fetch complete dog training status
    - POST /api/voice-log: Submit voice transcript for parsing (not used in demo)

  3. **Convex Backend** (Existing real-time database) - `convex/`
    - dogs, dog_stats, daily_goals, activities tables
    - Real-time subscriptions for web app
    - Claude integration for activity parsing

  ### Data Flow

  1. **VR App Launch**: Fetch initial state from `/api/vr-status` → Display minimal view
  2. **START TRAINING Button**: User clicks → Transition to training view → Show session panel
  3. **"Leave It" Session**: Display "Leave It Practice" panel with 0/5 reps, timer, tips, action buttons
  4. **MARK REP Button**: User clicks → Increment rep counter (0/5 → 1/5 → ... → 5/5) → Show micro-suggestions
  5. **Goal Complete**: 5th rep marked → Counter turns green → Show "🎉 GOAL COMPLETE!" → Enable bonus reps
  6. **END SESSION Button**: User clicks → Transition to summary view → Display XP breakdown (+30 IMP, +10 PHY)
  7. **Done Button**: User clicks → Return to minimal view → Trigger XP notifications
  8. **VIEW STATS Button**: User clicks → Show full-screen stats overlay → Display all stats, charts, goals
  9. **Real-time Sync**: Poll `/api/vr-status` every 3 seconds → Update all panels → Trigger XP animations
  10. **XP Change Detection**: Compare old vs new XP → Show floating notifications in upper right

  ## Components and Interfaces

  ### visionOS App Components

  #### ViewState Enum
  Controls which panels are visible in the UI.

  **States**:
  - `.minimal`: Dog info, streak (if > 0), quick actions (START TRAINING, VIEW STATS)
  - `.training`: Dog info, streak (if > 0), session panel (left side)
  - `.summary`: Session summary panel (center)
  - `.stats`: Full-screen stats overlay

  **Rationale**: Clean state management prevents panel clutter and creates focused experiences for each mode.

  #### TrainingRoomView (Main Container)
  The root view that combines minimal 3D environment with head-anchored UI panels.

  **Responsibilities**:
  - Setup RealityKit environment (simple room, soft lighting, circular platform)
  - Manage view state transitions (minimal ↔ training ↔ summary ↔ stats)
  - Handle button actions (START TRAINING, MARK REP, END SESSION, VIEW STATS, Done)
  - Coordinate with TrainingRoomViewModel for data fetching and polling
  - Track session progress (reps completed, timer)

  **Key Methods**:
  - `setupEnvironment()`: Create minimal 3D room with soft neutral lighting
  - `setupPedestal()`: Add simple circular platform in center
  - `onAppear()`: Fetch initial data and start 3-second polling
  - `startTraining()`: Transition to training view, initialize session
  - `markRep()`: Increment rep counter, show micro-suggestion, check for goal completion
  - `endSession()`: Transition to summary view, calculate XP breakdown
  - `returnToMinimal()`: Transition back to minimal view, trigger XP notifications

  **Design Decision**: Head-anchored panels use fixed offsets from user's head position, ensuring constant visibility without requiring head turning. This is critical for hands-free training where the user is focused on their dog.

  #### FloatingPanelsView (Head-Anchored UI)
  Arranges UI panels that follow the user's head position and gaze.

  **Panel Layout by View State**:

  **Minimal View**:
  - Dog Info Panel (top center): Dog name + level in capsule with ultraThinMaterial
  - Streak Display (below dog info, if streak > 0): Fire emoji + day count + encouragement
  - Quick Actions (bottom center): START TRAINING and VIEW STATS buttons with SF Symbols

  **Training View**:
  - Dog Info Panel (top center): Same as minimal
  - Streak Display (below dog info, if streak > 0): Same as minimal
  - Session Panel (left side): "Leave It Practice" session UI

  **Summary View**:
  - Session Summary Panel (center): "🎉 TRAINING COMPLETE! 🎉" with XP breakdown

  **Stats View**:
  - Full-screen overlay with all stats, charts, goals, activities

  **Positioning**: Uses `.offset()` modifiers with head-anchored positioning to keep panels visible at fixed offsets from user's gaze direction.

  **Design Decision**: Head-anchored UI ensures panels are always visible without requiring the user to turn their head, which is essential during active training sessions where attention is on the dog.

  #### DogInfoPanel
  Displays dog name and level at top center.

  **Content**:
  - Dog name in clean rounded font (SF Pro Rounded)
  - Level badge (e.g., "Lv. 15")
  - Capsule shape with ultraThinMaterial background
  - Subtle padding and spacing

  **Design**: Follows Apple's design language with thin materials and system fonts.

  #### StreakDisplay
  Shows current training streak below dog info (only if streak > 0).

  **Content**:
  - Fire emoji (🔥)
  - Day count (e.g., "5 days")
  - Encouragement message (e.g., "Keep it up!")
  - Capsule shape with ultraThinMaterial background

  **Visibility**: Only rendered when streak > 0 to keep minimal view clean.

  #### QuickActionsPanel
  Displays START TRAINING and VIEW STATS buttons at bottom center.

  **Buttons**:
  - START TRAINING: Primary button with gradient, SF Symbol (figure.run), starts "Leave It" session
  - VIEW STATS: Secondary button with gradient, SF Symbol (chart.bar), opens stats overlay

  **Design**: Clean Apple-style buttons with SF Symbols, subtle gradients, and proper touch targets (44pt minimum).

  #### SessionPanel ("Leave It Practice" UI)
  Displays active training session on left side during training view.

  **Header**:
  - "🎯 ACTIVE SESSION" in system font
  - Activity name: "Leave It Practice"
  - Goal: "5 successful leave-its"
  - Elapsed timer (MM:SS format)

  **Rep Counter**:
  - Large rounded font (48pt) showing "X / 5"
  - Horizontal progress bar below counter
  - Color changes to green when goal complete (5/5)
  - "🎉 GOAL COMPLETE!" label appears at 5 reps

  **Training Tips**:
  - "Place treat on ground"
  - "Say 'leave it' clearly"
  - "Wait 3+ seconds"
  - "Reward with different treat"

  **Micro-Suggestions**:
  - Appear below rep counter after each rep
  - Examples: "Great restraint! Keep going!", "Excellent impulse control!", "Amazing! You can keep going for bonus XP!"
  - Fade in/out with smooth animation

  **Action Buttons**:
  - MARK REP: Primary button, increments counter
  - END SESSION: Secondary button, transitions to summary

  **Design Decision**: Left-side placement keeps session UI visible while user focuses on dog in center of view. Large rep counter (48pt) ensures readability during active training.

  #### SessionSummaryPanel
  Displays training results after ending session.

  **Header**:
  - "🎉 TRAINING COMPLETE! 🎉"
  - Activity name: "Leave It Practice"
  - Session duration (e.g., "2m 34s")
  - Reps completed (e.g., "5/5" or "7/5" for bonus)

  **XP Breakdown**:
  - IMP (Impulse Control): +30 XP with purple badge
  - PHY (Physical): +10 XP with red badge
  - Total: 40 XP earned
  - Colored badges match stat colors

  **Action Button**:
  - Done: Returns to minimal view, triggers XP notifications

  **Design**: Celebratory tone with emojis and clear XP breakdown to reinforce training success.

  #### StatsScreen (Full-Screen Overlay)
  Displays comprehensive stats when VIEW STATS button is clicked.

  **Content**:
  - All four stats (PHY, INT, IMP, SOC) with circular progress rings
  - Weekly XP chart (last 7 days) using Swift Charts
  - Today's goals with progress bars (physical, mental)
  - Recent activities (last 2) with XP breakdown
  - Close button (X) in top right

  **Design**: Apple-style full-screen overlay with thin material background, clean typography, and smooth scale/opacity animations on appear/disappear.

  **Animation**: Scales from 0.8 to 1.0 with opacity fade-in when appearing.

  #### XPNotificationView
  Floating notifications that appear in upper right when XP is gained.

  **Content**:
  - "+[amount] [stat] XP" text (e.g., "+30 IMP XP")
  - Stat-specific color (purple for IMP, red for PHY, etc.)
  - SF Symbol bolt icon
  - Thin material background with subtle colored accent

  **Behavior**:
  - Appears in upper right corner
  - Stacks vertically if multiple stats gain XP
  - Auto-dismisses after 3 seconds with fade-out
  - Smooth slide-in animation

  **Design Decision**: Upper right placement keeps notifications visible without blocking central training area. Clean Apple design with thin materials and SF Symbols maintains visual consistency.

  #### TrainingRoomViewModel
  Manages app state, coordinates data fetching, and handles polling.

  **Published Properties**:
  - `stats: [StatData]` - Four stat data (PHY, INT, IMP, SOC)
  - `goals: GoalData?` - Today's physical/mental goals
  - `activities: [ActivityData]` - Recent 2 activities (for stats screen)
  - `weeklyXP: [DayXP]` - 7-day XP totals (for stats screen)
  - `dogName: String` - Dog's name
  - `dogLevel: Int` - Overall level
  - `streak: Int` - Current training streak
  - `previousStats: [StatData]` - Previous stat values for XP change detection

  **Key Methods**:
  - `fetchVRStatus()`: Async fetch from NetworkService
  - `startPolling()`: Timer-based polling every 3 seconds
  - `stopPolling()`: Cancel timer on app disappear
  - `detectXPChanges()`: Compare old vs new stats, return changed stats
  - `updateUI(with:)`: Transform VRDogStatus to UI models

  **Design Decision**: Polling every 3 seconds balances real-time updates with battery efficiency. Previous stats tracking enables XP change detection for notification triggers.

  ### Backend API Endpoints

  #### NetworkService
  Handles API communication with the backend.

  **Methods**:
  - `fetchVRStatus() async throws -> VRDogStatus`: Fetch complete dog status
  - `submitVoiceLog(text:, sessionContext:) async throws -> VoiceLogResponse`: Submit voice log (not used in demo)

  **Error Handling**:
  - Throws `NetworkError` for connection failures, timeouts, server errors
  - Implements retry logic with exponential backoff
  - Caches last successful response for offline display

  **Design Decision**: Separate NetworkService layer enables easy testing and mocking, and centralizes error handling logic.

  #### GET /api/vr-status

  **Purpose**: Fetch complete dog training status for VR display

  **Response Structure**:
  ```typescript
  {
    dogName: string,
    level: number,
    stats: [{ type, name, level, xp, xpToNextLevel, xpProgress }],
    goals: { physical: { current, target }, mental: { current, target }, streak },
    recentActivities: [{ id, name, xpBreakdown, timestamp, loggedBy }],
    weeklyXP: [{ day, total }]
  }
  ```

  **Implementation**: TanStack Start server function that queries Convex

  **Data Sources**:
  - `api.queries.getDogByUserId` - Dog name and level
  - `api.queries.getDogStats` - Four stat values (PHY, INT, IMP, SOC)
  - `api.queries.getTodayGoals` - Physical/mental progress and streak
  - `api.queries.getRecentActivities` - Last 2 activities (for stats screen)
  - `api.queries.getWeeklyXP` - 7-day totals (for stats screen)

  **Design Decision**: Single endpoint reduces API calls and ensures consistent data snapshot. Polling this endpoint every 3 seconds provides near-real-time updates without WebSocket complexity.

  #### POST /api/voice-log (Not Used in Demo)

  **Purpose**: Submit voice transcript for parsing and activity logging

  **Note**: This endpoint exists but is not used in the hackathon demo. The demo uses button-based interactions (START TRAINING, MARK REP, END SESSION) instead of voice commands for reliability and presentation clarity.

  **Request Body**:
  ```typescript
  {
    text: string,
    sessionContext?: { activity, repsCompleted }
  }
  ```

  **Response**:
  ```typescript
  {
    success: boolean,
    activityId?: string,
    xpAwarded?: [{ stat, amount }],
    error?: string
  }
  ```

  **Flow**:
  1. Receive voice transcript
  2. Call `api.actions.parseAndLogActivity` with Claude
  3. Create activity in Convex
  4. Award XP to stats
  5. Return success with activity ID

  ## Data Models

  ### Swift Models (visionOS)

  **ViewState**: Controls which panels are visible
  - `.minimal` - Dog info, streak (if > 0), quick actions
  - `.training` - Dog info, streak (if > 0), session panel
  - `.summary` - Session summary panel
  - `.stats` - Full-screen stats overlay

  **StatData**: Represents a single stat
  - `type: String` - "PHY", "INT", "IMP", or "SOC"
  - `name: String` - Full name (e.g., "Physical", "Impulse Control")
  - `level: Int` - Current level
  - `xp: Int` - Current XP
  - `xpToNextLevel: Int` - XP required for next level
  - `xpProgress: Double` - Progress as 0.0 to 1.0
  - `color: Color` - Computed property for stat-specific color (red for PHY, purple for IMP, etc.)

  **GoalData**: Today's training goals
  - `physical: (current: Int, target: Int)` - Physical goal progress
  - `mental: (current: Int, target: Int)` - Mental goal progress
  - `streak: Int` - Current training streak

  **ActivityData**: Recent training activity
  - `id: String` - Unique identifier
  - `name: String` - Activity name (e.g., "Leave It Practice")
  - `xpBreakdown: [(stat: String, amount: Int)]` - XP per stat
  - `timestamp: Date` - When logged
  - `loggedBy: String` - User who logged it

  **DayXP**: Single day's XP total
  - `day: String` - Day label (e.g., "Mon", "Tue")
  - `total: Int` - Total XP earned that day

  **SessionData**: Active "Leave It" session details
  - `activity: String` - "Leave It Practice"
  - `goal: String` - "5 successful leave-its"
  - `tips: [String]` - Training tips array
  - `targetReps: Int` - 5 (goal)
  - `currentReps: Int` - Current rep count (0-5+)
  - `startTime: Date` - Session start time for elapsed timer
  - `currentSuggestion: String?` - Optional micro-suggestion after each rep
  - `isGoalComplete: Bool` - True when currentReps >= targetReps

  **VRDogStatus**: API response model
  - `dogName: String`
  - `level: Int`
  - `stats: [StatData]`
  - `goals: GoalData`
  - `recentActivities: [ActivityData]`
  - `weeklyXP: [DayXP]`

  **XPChange**: Detected XP change for notifications
  - `stat: StatData` - The stat that changed
  - `amount: Int` - Amount of XP gained

  ### Convex Schema Extensions

  No new tables required. VR app reads from existing schema:
  - `dogs` - Dog name, level, household
  - `dog_stats` - PHY, INT, IMP, SOC values
  - `daily_goals` - Physical/mental progress, streak
  - `activities` - Training logs with timestamps
  - `activity_stat_gains` - XP breakdown per activity

  ## Correctness Properties

  *A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

  ### Acceptance Criteria Testing Prework

  1.5 WHEN the user moves their head THEN the system SHALL keep UI panels anchored to head position for constant visibility
    Thoughts: This is a property about head-anchored UI - for any head movement, panels should maintain fixed offsets.
    Testable: yes - property

  2.2 WHEN displaying the dog info panel THEN the system SHALL show dog name and level in clean rounded font with capsule shape and ultraThinMaterial background
    Thoughts: This is a property about UI rendering - for any dog data, the panel should display required elements with correct styling.
    Testable: yes - property

  3.1 WHEN XP increases for any stat THEN the system SHALL display a floating XP notification in the upper right showing "+[amount] [stat] XP" with stat-specific color
    Thoughts: This is a property about XP notifications - for any XP change, a notification should appear with correct formatting.
    Testable: yes - property

  4.1 WHEN the user clicks START TRAINING in minimal view THEN the system SHALL start a "Leave It Practice" session and transition to training view state
    Thoughts: This is a property about button interactions - clicking START TRAINING should always trigger session start and view transition.
    Testable: yes - property

  5.1 WHEN the user clicks MARK REP button during an active "Leave It" session THEN the system SHALL increment the rep counter by one with spring animation
    Thoughts: This is a property about rep counting - for any active session, marking a rep should increment the counter.
    Testable: yes - property

  5.4 WHEN the 5th rep is marked THEN the system SHALL change rep counter color to green, show "🎉 GOAL COMPLETE!" label, and display "Amazing! You can keep going for bonus XP!" suggestion
    Thoughts: This is an edge case for goal completion - when reaching exactly 5 reps, specific UI changes should occur.
    Testable: edge-case

  6.2 WHEN the summary panel displays THEN the system SHALL show "🎉 TRAINING COMPLETE! 🎉" header, "Leave It Practice" as activity name, session duration, reps completed (e.g., "5/5" or "7/5" for bonus), and XP breakdown showing IMP (primary) and PHY (secondary) gains
    Thoughts: This is a property about summary rendering - for any completed session, all required elements should be displayed.
    Testable: yes - property

  7.2 WHEN the app appears THEN the system SHALL start polling the backend every 3 seconds for updates
    Thoughts: This is a property about polling behavior - app appearance should always trigger polling.
    Testable: yes - property

  7.3 WHEN polling detects changes THEN the system SHALL update the VR dashboard with new stats, goals, activities, and weekly XP data
    Thoughts: This is a property about data updates - for any detected changes, UI should reflect new data.
    Testable: yes - property

  7.5 WHEN XP changes are detected THEN the system SHALL trigger XP notification animations for each stat that gained XP
    Thoughts: This is a property about XP change detection - for any XP increase, notifications should appear.
    Testable: yes - property

  8.2 WHEN the stats screen displays THEN the system SHALL show all four stats with circular progress rings, weekly XP chart, today's goals with progress bars, and recent activities (last 2)
    Thoughts: This is a property about stats screen rendering - for any stats data, all required elements should be displayed.
    Testable: yes - property

  9.1 WHEN the VR app calls fetchVRStatus THEN the system SHALL return a VRDogStatus model containing dog name, level, all four stats, today's goals, streak, recent activities, and weekly XP totals
    Thoughts: This is a property about API responses - for any valid request, the response should contain all required fields.
    Testable: yes - property

  ### Property Reflection

  After reviewing all properties, the following consolidations can be made:

  - Properties 7.3 and 7.5 both test data update handling and can be combined
  - Property 3.1 and 7.5 both test XP notification triggers and can be combined

  Consolidated properties:
  - Combine 7.3 + 7.5 → "Polling updates trigger UI refresh and XP notifications"
  - Combine 3.1 + 7.5 → "XP changes trigger floating notifications"

  ### Correctness Properties

  Property 1: Head-anchored UI positioning
  *For any* head movement, UI panels should maintain fixed offsets from the user's gaze direction, ensuring constant visibility
  **Validates: Requirements 1.5**

  Property 2: Dog info panel rendering
  *For any* dog data, the dog info panel should display dog name and level with clean Apple design (rounded font, capsule shape, ultraThinMaterial)
  **Validates: Requirements 2.2**

  Property 3: XP notification display
  *For any* XP increase, a floating notification should appear in the upper right showing "+[amount] [stat] XP" with stat-specific color and clean Apple design
  **Validates: Requirements 3.1**

  Property 4: Training session activation
  *For any* click of START TRAINING button in minimal view, the system should start a "Leave It Practice" session and transition to training view
  **Validates: Requirements 4.1**

  Property 5: Rep counter increment
  *For any* active "Leave It" session, clicking MARK REP should increment the rep counter by exactly one with spring animation
  **Validates: Requirements 5.1**

  Property 6: Session summary rendering
  *For any* completed "Leave It" session, the summary panel should display all required elements: celebration header, activity name, duration, reps completed, and XP breakdown (+30 IMP, +10 PHY)
  **Validates: Requirements 6.2**

  Property 7: Polling behavior
  *For any* app appearance, the system should start polling the backend every 3 seconds and stop polling on disappear
  **Validates: Requirements 7.2, 7.4**

  Property 8: Data update propagation
  *For any* polling cycle that detects changes, the system should update all UI elements (stats, goals, activities, weekly XP) and trigger XP notifications for changed stats
  **Validates: Requirements 7.3, 7.5**

  Property 9: Stats screen completeness
  *For any* stats data, the stats screen should display all four stats with progress rings, weekly XP chart, today's goals with progress bars, and recent activities (last 2)
  **Validates: Requirements 8.2**

  Property 10: API response completeness
  *For any* valid fetchVRStatus call, the response should contain all required fields: dogName, level, stats array (4 stats), goals (physical, mental, streak), recentActivities, and weeklyXP
  **Validates: Requirements 9.1**

  ## Error Handling

  ### Network Errors
  - **Connection failure**: Display "Offline" indicator in minimal view, cache last successful response
  - **Timeout**: Retry up to 3 times with exponential backoff (1s, 2s, 4s)
  - **Invalid response**: Log error, continue using cached data, show subtle error indicator
  - **429 Rate limit**: Back off polling to 10 second intervals

  **Design Decision**: Graceful degradation ensures the app remains usable during network issues. Cached data allows viewing stats even when offline.

  ### Button Interaction Errors
  - **MARK REP without active session**: Button should be disabled/hidden when not in training view
  - **END SESSION without active session**: Button should be disabled/hidden when not in training view
  - **Rapid button clicks**: Debounce MARK REP button (500ms minimum between clicks)
  - **Network failure during END SESSION**: Show loading indicator, retry on reconnection

  **Design Decision**: UI state management prevents invalid interactions. Debouncing prevents accidental double-marks during enthusiastic training.

  ### Data Validation Errors
  - **Missing required fields**: Use default values (empty string, 0, etc.)
  - **Invalid stat values**: Clamp to valid range (0-100 for XP progress)
  - **Malformed activity data**: Skip rendering that activity, log error
  - **Future timestamps**: Adjust to current time
  - **Negative XP values**: Treat as 0

  **Design Decision**: Defensive programming ensures the app never crashes due to unexpected data. Logging errors helps debugging without disrupting user experience.

  ### View State Errors
  - **Invalid view state transition**: Log error, return to minimal view
  - **Missing session data in training view**: Return to minimal view with error message
  - **Stats screen fails to load**: Show error message, allow closing to return to minimal view

  **Design Decision**: Always provide a path back to minimal view as a safe fallback state.

  ## Testing Strategy

  ### Unit Tests

  **Swift Unit Tests** (XCTest):
  - VoiceCommandHandlerTests: Test command parsing logic
  - TrainingRoomViewModelTests: Test data fetching and state management
  - NetworkServiceTests: Test API integration and retry logic

  **TypeScript Unit Tests** (Vitest):
  - vr-status.test.ts: Test API endpoint response formatting
  - voice-log.test.ts: Test voice log processing and Claude integration

  ### Property-Based Tests

  **Property Test 1: Stat orb completeness**
  *For any* stat data, the rendered stat orb should display all required elements
  **Validates: Requirements 2.2**
  Generator: Random stat data with levels 1-50, XP 0-1000
  Test: Render StatOrbView, verify name, level, progress ring present

  **Property Test 2: Rep counter increment**
  *For any* active session, marking a rep increments counter by one
  **Validates: Requirements 5.1**
  Generator: Random session states with reps 0-20
  Test: Call markRep(), verify counter increases by 1

  **Property Test 3: Voice log round trip**
  *For any* session description, activity is persisted and retrievable
  **Validates: Requirements 6.1, 9.2**
  Generator: Random session descriptions
Test: Submit voice log, fetch VR status, verify activity in recentActivities

**Property Test 4: Real-time sync latency**
*For any* activity logged, other platform updates within 2 seconds
**Validates: Requirements 6.5, 7.2**
Generator: Random activities with varying XP
Test: Log in web app, poll VR status, verify update within 2s

**Property Test 5: API response completeness**
*For any* valid request, response contains all required fields
**Validates: Requirements 9.1**
Generator: Random dog states
Test: Call /api/vr-status, verify all fields present

### Integration Tests

- End-to-end voice flow: Launch → coach mode → mark reps → end session → verify XP
- Cross-platform sync: Log in web → verify VR displays within 2s
- Network resilience: Simulate failure → verify offline indicator → restore → verify sync

## Performance Considerations

- Target 60 fps minimum, 90 fps ideal
- Polling interval: 3 seconds (balance freshness and battery)
- Limit simultaneous animations to 3-4 elements
- Cache last successful response for offline display
- Limit activity feed to 5 items
- Use weak references in closures to prevent retain cycles
