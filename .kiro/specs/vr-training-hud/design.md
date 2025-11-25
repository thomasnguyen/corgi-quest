# Design Document

## Overview

The VR Training HUD is a visionOS companion app that creates an immersive "command center" for real-world dog training. Built with Swift and SwiftUI, it displays live training stats, daily goals, and recent activities in a stylized 3D environment. The app integrates with the existing Convex backend to provide real-time synchronization between VR and web experiences, enabling couples to train together across platforms.

The design prioritizes:
- **Immersion without complexity**: A focused training environment, not a full 3D game
- **Real-time sync**: Sub-2-second updates between VR and web app via Convex
- **Hands-free interaction**: Voice-first design for active training sessions
- **Demo impact**: Visually striking moments that showcase the platform's capabilities

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

1. **visionOS App Layer** (Swift + SwiftUI + RealityKit) - `visionos-app/`
   - TrainingRoomView: Main immersive space with 3D environment
   - FloatingPanelsView: UI overlay with stat orbs, goals, activities, charts
   - VoiceCommandHandler: Speech recognition and command parsing
   - TrainingRoomViewModel: State management and data fetching

2. **Backend API Layer** (TanStack Start server functions) - `src/routes/api/`
   - GET /api/vr-status: Fetch complete dog training status
   - POST /api/voice-log: Submit voice transcript for parsing

3. **Convex Backend** (Existing real-time database) - `convex/`
   - dogs, dog_stats, daily_goals, activities tables
   - Real-time subscriptions for web app
   - Claude integration for activity parsing

### Data Flow

1. **VR App Launch**: Fetch initial state from `/api/vr-status`
2. **Voice Command**: User speaks → Speech API → Command parser → Action
3. **Coach Mode Session**: Activate → Display session UI → Mark reps → End session
4. **Session End**: POST to `/api/voice-log` → Claude parsing → Convex update → VR refresh
5. **Real-time Sync**: Poll `/api/vr-status` every 3 seconds for updates
6. **UI Update**: New data → Animate stat orbs, goals, activity feed

## Components and Interfaces

### visionOS App Components

#### TrainingRoomView (Main Container)
The root view that combines 3D environment with floating UI panels.

**Responsibilities**:
- Setup RealityKit environment (room, pedestal, lighting)
- Overlay floating UI panels
- Initialize voice command handler
- Manage session state (idle, active, ending)

**Key Methods**:
- `setupEnvironment()`: Create 3D room with neutral lighting
- `setupPedestal()`: Add circular platform with dog name
- `onAppear()`: Fetch initial data and start polling

#### FloatingPanelsView (UI Overlay)
Arranges four data panels around the central pedestal in 3D space.

**Panel Layout**:
- Panel A (Left): Stat Orbs - Four orbs showing PHY, INT, IMP, SOC
- Panel B (Top): Today's Goals - Physical/Mental progress bars + Streak
- Panel C (Right): Recent Activities - Last 5 training events
- Panel D (Bottom): 7-Day XP Chart - Bar chart using Swift Charts
- Session Panel (Center): Appears during Coach Mode

**Positioning**: Uses `.position3D()` modifier to place panels in 3D space

#### StatOrbsPanel & StatOrbView
Displays individual stat orbs with XP progress rings.

**Features**:
- Circular progress ring showing XP toward next level
- Stat type label (PHY, INT, IMP, SOC)
- Current level display
- Pulse animation on XP increase
- Color-coded by stat type

**Animation**: Spring animation with 0.3s response time for pulse effect

#### SessionPanel (Coach Mode UI)
Displays active training session information.

**Content**:
- Session title ("Training Session")
- Goal description (e.g., "5 calm reps")
- Training tips (e.g., "Keep leash loose")
- Rep counter (e.g., "3 / 5")
- Optional micro-suggestions (e.g., "Great rep!")

**State**: Only visible when `sessionState != .idle`

#### VoiceCommandHandler
Manages speech recognition and command parsing.

**Supported Commands**:
- "Coach mode: [activity]" → Start training session
- "Mark rep" → Increment rep counter
- "End session: [description]" → Log activity and end session

**Implementation**: Uses SFSpeechRecognizer for continuous listening

#### TrainingRoomViewModel
Manages app state and coordinates data fetching.

**Published Properties**:
- `stats: [StatData]` - Four stat orbs data
- `goals: GoalData?` - Today's physical/mental goals
- `activities: [ActivityData]` - Recent 5 activities
- `weeklyXP: [DayXP]` - 7-day XP totals
- `dogName: String` - Dog's name
- `dogLevel: Int` - Overall level

**Key Methods**:
- `fetchInitialData()`: Async fetch from /api/vr-status
- `startPolling()`: Timer-based polling every 3 seconds
- `logVoiceActivity(text:)`: Submit voice log to backend
- `updateUI(with:)`: Transform API response to UI models

### Backend API Endpoints

#### GET /api/vr-status

**Purpose**: Fetch complete dog training status for VR display

**Response Structure**:
```typescript
{
  dogName: string,
  level: number,
  stats: [{ type, name, level, xp, xpToNextLevel, xpProgress }],
  goals: { physical, mental, streak },
  recentActivities: [{ id, name, xpBreakdown, timestamp, loggedBy }],
  weeklyXP: [{ day, total }],
  currentSession?: { activity, goal, tips, targetReps }
}
```

**Implementation**: TanStack Start server function that queries Convex

**Data Sources**:
- `api.queries.getDogByUserId` - Dog name and level
- `api.queries.getDogStats` - Four stat values
- `api.queries.getTodayGoals` - Physical/mental progress
- `api.queries.getRecentActivities` - Last 5 activities
- `api.queries.getWeeklyXP` - 7-day totals

#### POST /api/voice-log

**Purpose**: Submit voice transcript for parsing and activity logging

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

**StatData**: Represents a single stat orb
- `type: String` - "PHY", "INT", "IMP", or "SOC"
- `name: String` - Full name (e.g., "Physical")
- `level: Int` - Current level
- `xp: Int` - Current XP
- `xpToNextLevel: Int` - XP required for next level
- `xpProgress: Double` - Progress as 0.0 to 1.0
- `color: Color` - Computed property for stat-specific color

**GoalData**: Today's training goals
- `physical: (current: Int, target: Int)` - Physical goal progress
- `mental: (current: Int, target: Int)` - Mental goal progress
- `streak: Int` - Current training streak

**ActivityData**: Recent training activity
- `id: String` - Unique identifier
- `name: String` - Activity name
- `xpBreakdown: [(stat: String, amount: Int)]` - XP per stat
- `timestamp: Date` - When logged
- `loggedBy: String` - User who logged it

**DayXP**: Single day's XP total
- `day: String` - Day label (e.g., "Mon")
- `total: Int` - Total XP earned

**SessionState**: Training session state
- `.idle` - No active session
- `.active(SessionData)` - Session in progress
- `.ending` - Session completing

**SessionData**: Active session details
- `activity: String` - Activity name
- `goal: String` - Goal description
- `tips: String` - Training tips
- `targetReps: Int` - Target rep count
- `currentReps: Int` - Current rep count
- `currentSuggestion: String?` - Optional micro-suggestion

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

2.2 WHEN displaying stat orbs THEN the system SHALL show four orbs labeled INT, PHY, IMP, and SOC with current level and XP progress rings
  Thoughts: This is a property about all stat orbs - for any stat data, the orb should display the required information.
  Testable: yes - property

3.1 WHEN XP increases for any stat THEN the system SHALL pulse the corresponding stat orb with a smooth animation
  Thoughts: This is a property that should hold for all stats - whenever XP increases, animation should trigger.
  Testable: yes - property

3.2 WHEN today's goals update THEN the system SHALL smoothly animate the progress bars to their new values
  Thoughts: This is a property about goal updates - for any goal value change, animation should occur.
  Testable: yes - property

4.1 WHEN the user says "Coach mode: [activity name]" THEN the system SHALL activate a training session for that activity
  Thoughts: This is a property about voice command parsing - for any valid activity name, the session should activate.
  Testable: yes - property

5.1 WHEN the user says "Mark rep" during an active session THEN the system SHALL increment the rep counter by one
  Thoughts: This is a property about rep counting - for any active session, marking a rep should increment the counter.
  Testable: yes - property

6.1 WHEN the user says "End session: [description]" THEN the system SHALL send the description to the backend for parsing
  Thoughts: This is a property about session ending - for any description, it should be sent to the backend.
  Testable: yes - property

6.5 WHEN the web app is open simultaneously THEN the system SHALL ensure the activity appears in both VR and web app within 2 seconds
  Thoughts: This is a round-trip property - data logged in VR should appear in web app and vice versa.
  Testable: yes - property

7.2 WHEN any training data changes in Convex THEN the system SHALL update the VR dashboard within 2 seconds
  Thoughts: This is a property about real-time sync - for any data change, VR should update within the time limit.
  Testable: yes - property

8.2 WHEN the user speaks a recognized command THEN the system SHALL execute the command within 1 second
  Thoughts: This is a property about command execution latency - for any recognized command, execution should be fast.
  Testable: yes - property

9.1 WHEN the VR app requests dog status THEN the system SHALL return a JSON response containing all required fields
  Thoughts: This is a property about API responses - for any valid request, the response should contain all required data.
  Testable: yes - property

9.2 WHEN the VR app submits a voice log THEN the system SHALL parse the text with Claude, create structured activity data, update Convex, and return success status
  Thoughts: This is a round-trip property - voice log submission should result in data being persisted and retrievable.
  Testable: yes - property

### Property Reflection

After reviewing all properties, the following consolidations can be made:

- Properties 3.1 and 3.2 both test animation triggers and can be combined
- Properties 6.1 and 9.2 both test the voice log submission pipeline
- Properties 7.2 and 6.5 both test real-time sync latency

Consolidated properties:
- Combine 3.1 + 3.2 → "Data changes trigger smooth animations"
- Combine 6.1 + 9.2 → "Voice log submission creates persisted activity"
- Combine 7.2 + 6.5 → "Real-time sync between VR and web within 2 seconds"

### Correctness Properties

Property 1: Stat orb completeness
*For any* stat data (PHY, INT, IMP, SOC), the rendered stat orb should display the stat name, current level, and XP progress ring
**Validates: Requirements 2.2**

Property 2: Data changes trigger animations
*For any* data update (XP increase, goal progress, new activity), the corresponding UI element should animate smoothly
**Validates: Requirements 3.1, 3.2**

Property 3: Voice command activation
*For any* valid activity name spoken in "Coach mode: [activity]" format, the system should activate a training session with that activity
**Validates: Requirements 4.1**

Property 4: Rep counter increment
*For any* active training session, saying "Mark rep" should increment the rep counter by exactly one
**Validates: Requirements 5.1**

Property 5: Voice log round trip
*For any* session description, ending the session should result in the activity being persisted to Convex and retrievable via the API
**Validates: Requirements 6.1, 9.2**

Property 6: Real-time sync latency
*For any* activity logged in either VR or web app, the other platform should reflect the update within 2 seconds
**Validates: Requirements 6.5, 7.2**

Property 7: Command execution latency
*For any* recognized voice command, the system should execute the command within 1 second
**Validates: Requirements 8.2**

Property 8: API response completeness
*For any* valid VR status request, the response should contain all required fields: dogName, level, stats array, goals, recentActivities, and weeklyXP
**Validates: Requirements 9.1**

## Error Handling

### Network Errors
- **Connection failure**: Display "Offline" indicator, queue updates for retry
- **Timeout**: Retry up to 3 times with exponential backoff (1s, 2s, 4s)
- **Invalid response**: Log error, show generic error message to user
- **429 Rate limit**: Back off polling to 10 second intervals

### Voice Recognition Errors
- **Microphone permission denied**: Show permission request dialog with explanation
- **Unrecognized command**: Ignore silently to avoid disrupting training flow
- **Ambiguous command**: Default to most likely interpretation
- **Speech recognition unavailable**: Show error message, suggest manual logging

### Session State Errors
- **Mark rep without active session**: Ignore command silently
- **End session without active session**: Ignore command silently
- **Network failure during session end**: Cache session data locally, retry on reconnection
- **Duplicate rep marking**: Debounce commands (ignore if < 500ms since last mark)

### Data Validation Errors
- **Missing required fields**: Use default values (empty string, 0, etc.)
- **Invalid stat values**: Clamp to valid range (0-100 for XP progress)
- **Malformed activity data**: Skip rendering that activity, log error
- **Future timestamps**: Adjust to current time

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
