# Design Document

## Overview

This feature creates two REST API endpoints that bridge the visionOS VR app to the Convex real-time backend. The endpoints aggregate multiple Convex queries into optimized responses and enable voice-based activity logging from the VR headset. The design prioritizes a streamlined demo experience with "Leave It" impulse control training and real-time sync between VR and web app.

**Demo Focus**: The implementation is optimized for a 15-25 second hackathon demo showcasing the complete training flow: minimal UI → start training → mark 5 reps → session summary → updated stats → return to minimal UI.

## Architecture

### High-Level Flow

```
VR App (Swift) → HTTP Request → TanStack Start API Route → Convex Queries/Mutations → Database
                                                          ↓
                                                    JSON Response
```

### API Endpoints

1. **GET /api/vr-status** - Aggregates dog training data for VR display
2. **POST /api/voice-log** - Processes voice transcripts into activities

### Real-Time Sync Strategy

- **Polling Interval**: VR app polls `/api/vr-status` every 3 seconds during active training
- **Optimistic Updates**: VR app shows immediate feedback, then confirms with next poll
- **Convex Real-Time**: Web app gets instant updates via Convex subscriptions
- **Demo Benefit**: Changes made in VR appear on web app within 3 seconds max


## Components and Interfaces

### TanStack Start API Routes

**Location**: `src/routes/api/`

#### Route 1: VR Status Endpoint

```typescript
// src/routes/api/vr-status.ts
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createAPIFileRoute('/api/vr-status')({
  GET: async ({ request }) => {
    // Extract dogId from query params (default to first dog)
    // Execute parallel Convex queries
    // Aggregate results into VRDogStatus format
    // Return JSON response
  }
})
```

#### Route 2: Voice Log Endpoint

```typescript
// src/routes/api/voice-log.ts
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createAPIFileRoute('/api/voice-log')({
  POST: async ({ request }) => {
    // Parse request body (text + optional sessionContext)
    // Call processTrainingActivity action
    // Call logActivity mutation
    // Return success response with XP breakdown
  }
})
```

### Convex Integration

**Queries Used**:
- `getDogProfile` - Dog info + 4 stats
- `getDailyGoals` - Today's physical/mental progress
- `getStreak` - Current streak count
- `getActivityFeed` - Recent 5 activities
- `getOverallStatsData` - Weekly XP chart data

**Actions Used**:
- `processTrainingActivity` - AI parsing of voice transcript

**Mutations Used**:
- `logActivity` - Create activity + update stats/goals/streak


## Data Models

### VR Status Response Format

Matches the Swift `VRDogStatus` struct exactly:

```typescript
interface VRDogStatus {
  dogName: string
  level: number
  overallXp: number
  xpToNextLevel: number
  stats: StatData[]
  goals: GoalData
  recentActivities: ActivityData[]
  weeklyXP: DayXP[]
}

interface StatData {
  type: "PHY" | "INT" | "IMP" | "SOC"
  name: string
  level: number
  xp: number
  xpToNextLevel: number
  xpProgress: number // 0.0 to 1.0
}

interface GoalData {
  physical: { current: number; target: number }
  mental: { current: number; target: number }
  streak: number
}

interface ActivityData {
  id: string
  name: string
  xpBreakdown: Array<{ stat: string; amount: number }>
  timestamp: number // milliseconds since epoch
  loggedBy: "VR" | "Mobile"
}

interface DayXP {
  day: string // "Mon", "Tue", etc.
  total: number
  date: number // milliseconds since epoch
}
```

### Voice Log Request/Response Format

Matches the Swift `VoiceLogRequest` and `VoiceLogResponse` structs:

```typescript
interface VoiceLogRequest {
  text: string
  sessionContext?: {
    activity: string
    repsCompleted: number
  }
}

interface VoiceLogResponse {
  success: boolean
  activityId?: string
  xpAwarded?: Array<{ stat: string; amount: number }>
  error?: string
}
```


## Demo-Optimized Design

### "Leave It" Training Flow (15-25 seconds)

**Scenario**: User demonstrates impulse control training with 5-rep goal

1. **Minimal UI (0-2s)**: VR shows floating panels with current stats
2. **Start Training (2-5s)**: Voice command "Start training Leave It"
3. **Mark Reps (5-15s)**: Voice commands "Mark rep" × 5 (2 seconds each)
4. **Session Summary (15-20s)**: Voice command "End session, completed 5 Leave It reps"
5. **Stats Update (20-23s)**: VR polls API, shows +IMP XP animation
6. **Return to Minimal (23-25s)**: Updated stats visible in floating panels

### Real-Time Sync Demo

**Parallel View**: Web app open on laptop/phone shows same dog

- **T+0s**: Both show Level 12, IMP at 780 XP
- **T+5s**: VR starts training, web app shows partner presence "Training in VR"
- **T+15s**: VR submits session via `/api/voice-log`
- **T+18s**: Web app receives Convex update, shows activity feed entry
- **T+20s**: VR polls `/api/vr-status`, shows IMP now at 830 XP (+50)
- **T+23s**: Both apps show synchronized Level 12, IMP at 830 XP

### Performance Targets

- **API Response Time**: < 500ms for `/api/vr-status`
- **Voice Log Processing**: < 2s for `/api/voice-log` (includes AI parsing)
- **Polling Frequency**: Every 3 seconds during active training
- **Data Freshness**: Max 3-second delay between VR and web app


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Status response completeness

*For any* valid dog ID, the `/api/vr-status` endpoint should return all required fields (dogName, level, stats array with 4 elements, goals, recentActivities, weeklyXP) with no null or undefined values

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

### Property 2: Voice log idempotency

*For any* voice transcript, submitting it multiple times should create separate activity records but each should have consistent XP calculations based on the same AI parsing

**Validates: Requirements 2.1, 2.3**

### Property 3: Parallel query consistency

*For any* set of Convex queries executed in parallel, the aggregated response should be equivalent to executing them sequentially in terms of data correctness

**Validates: Requirements 3.1, 3.2**

### Property 4: Dog identification fallback

*For any* request without a dog ID parameter, the system should return data for the first dog in the first household without throwing errors

**Validates: Requirements 4.2**

### Property 5: Error response format

*For any* error condition (invalid dog ID, parsing failure, timeout), the system should return a JSON object with an error message and appropriate HTTP status code

**Validates: Requirements 5.3, 6.3**

### Property 6: Timestamp format consistency

*For any* response containing timestamps, all timestamp fields should use milliseconds since epoch format matching Swift's Date expectations

**Validates: Requirements 7.3**

### Property 7: Stat type code consistency

*For any* response containing stat information, stat types should always use three-letter codes (PHY, INT, IMP, SOC) matching the Swift enum

**Validates: Requirements 7.4**

### Property 8: XP breakdown completeness

*For any* successful voice log submission, the response should include XP breakdown for all stats that received XP from the activity

**Validates: Requirements 2.5**


## Error Handling

### Error Categories

1. **Client Errors (4xx)**
   - 400 Bad Request: Invalid request body or missing required fields
   - 404 Not Found: Dog ID doesn't exist
   - 422 Unprocessable Entity: Valid JSON but invalid data (e.g., negative XP)

2. **Server Errors (5xx)**
   - 500 Internal Server Error: Unexpected errors, Convex query failures
   - 503 Service Unavailable: OpenAI API timeout or rate limit

### Error Response Format

All errors return JSON with consistent structure:

```typescript
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {} // Optional additional context
}
```

### Timeout Handling

- **Convex Queries**: 5-second timeout per query
- **AI Parsing**: 30-second timeout (inherited from existing action)
- **Overall Request**: 5-second timeout for VR app compatibility

### Graceful Degradation

- If weekly XP query fails, return empty array instead of failing entire request
- If activity feed query fails, return empty array but include stats
- If AI parsing fails, return error but don't crash the endpoint


## Testing Strategy

### Unit Tests

Unit tests verify specific examples and edge cases:

- **Status endpoint**: Test with valid dog ID, invalid dog ID, missing dog ID
- **Voice log endpoint**: Test with valid transcript, empty transcript, malformed JSON
- **Data transformation**: Test Convex data → VR format conversion
- **Error handling**: Test timeout scenarios, missing data scenarios
- **Timestamp conversion**: Test Date objects → milliseconds conversion

### Property-Based Tests

Property-based tests verify universal properties across many inputs using **fast-check** (JavaScript property testing library):

- **Minimum 100 iterations** per property test to ensure thorough coverage
- Each test tagged with format: `**Feature: vr-api-integration, Property {number}: {property_text}**`
- Tests generate random valid inputs and verify properties hold

### Integration Tests

- **End-to-end flow**: Mock VR app request → API → Convex → response
- **Real-time sync**: Verify web app receives updates after VR submission
- **Demo scenario**: Automated test of "Leave It" 5-rep flow

### Manual Testing

- **VR headset testing**: Verify actual Vision Pro integration
- **Network conditions**: Test with slow connections, timeouts
- **Demo rehearsal**: Practice 15-25 second flow timing


## Implementation Details

### VR Status Endpoint Logic

```typescript
// Pseudocode for /api/vr-status
async function handleVRStatus(request) {
  // 1. Extract dog ID from query params
  const dogId = request.query.dogId || await getFirstDogId()
  
  // 2. Execute queries in parallel
  const [profile, goals, streak, activities, statsData] = await Promise.all([
    convex.query(api.queries.getDogProfile, { dogId }),
    convex.query(api.queries.getDailyGoals, { dogId }),
    convex.query(api.queries.getStreak, { dogId }),
    convex.query(api.queries.getActivityFeed, { dogId }),
    convex.query(api.queries.getOverallStatsData, { dogId })
  ])
  
  // 3. Transform to VR format
  const response = {
    dogName: profile.dog.name,
    level: profile.dog.overallLevel,
    overallXp: profile.dog.overallXp,
    xpToNextLevel: profile.dog.xpToNextLevel,
    stats: profile.stats.map(transformStat),
    goals: transformGoals(goals),
    recentActivities: activities.slice(0, 5).map(transformActivity),
    weeklyXP: transformWeeklyXP(statsData.dailyXpData)
  }
  
  // 4. Return JSON
  return json(response, { 
    headers: { 'Cache-Control': 'no-cache' } 
  })
}
```

### Voice Log Endpoint Logic

```typescript
// Pseudocode for /api/voice-log
async function handleVoiceLog(request) {
  // 1. Parse request body
  const { text, sessionContext } = await request.json()
  
  // 2. Validate input
  if (!text || text.trim().length === 0) {
    return json({ error: 'Text is required' }, { status: 400 })
  }
  
  // 3. Call AI parsing action
  const parsed = await convex.action(api.actions.processTrainingActivity, {
    activityDescription: text
  })
  
  // 4. Get dog and user IDs (default to first)
  const dogId = await getFirstDogId()
  const userId = await getFirstUserId()
  
  // 5. Log activity mutation
  const result = await convex.mutation(api.mutations.logActivity, {
    dogId,
    userId,
    activityName: parsed.activityName,
    description: text,
    durationMinutes: parsed.durationMinutes,
    statGains: parsed.statGains,
    physicalPoints: parsed.physicalPoints,
    mentalPoints: parsed.mentalPoints
  })
  
  // 6. Return success response
  return json({
    success: true,
    activityId: result.activityId,
    xpAwarded: parsed.statGains.map(sg => ({
      stat: sg.statType,
      amount: sg.xpAmount
    }))
  })
}
```

### Convex Client Setup

```typescript
// src/lib/convexClient.ts
import { ConvexHttpClient } from "convex/browser"

export const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)
```

### Environment Variables

Required in `.env.local`:
- `VITE_CONVEX_URL` - Convex deployment URL
- `OPENAI_API_KEY` - Already configured in Convex


## Security Considerations

### Authentication

**Current Approach (Demo/MVP)**:
- No authentication required for hackathon demo
- Endpoints default to first dog/user in database
- Suitable for single-household demo environment

**Future Production Approach**:
- Add API key authentication via headers
- Implement user session tokens
- Add dog ownership verification
- Rate limiting per user/household

### Input Validation

- Sanitize all user input (voice transcripts)
- Validate dog IDs exist before querying
- Limit transcript length (max 500 characters)
- Prevent SQL injection (Convex handles this)

### Rate Limiting

**Demo**: No rate limiting needed

**Production Recommendations**:
- 60 requests/minute per VR device
- 10 voice log submissions/minute
- Exponential backoff on failures


## Deployment Considerations

### Netlify Configuration

The API routes will deploy automatically with TanStack Start on Netlify:

```toml
# netlify.toml (existing)
[build]
  command = "npm run build"
  publish = ".output/public"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Environment Setup

1. Convex URL already configured in project
2. OpenAI API key already configured in Convex
3. No additional environment variables needed for demo

### CORS Configuration

Enable CORS for VR app requests:

```typescript
// Add to API route responses
headers: {
  'Access-Control-Allow-Origin': '*', // Demo only
  'Access-Control-Allow-Methods': 'GET, POST',
  'Access-Control-Allow-Headers': 'Content-Type'
}
```

### Monitoring

**Demo**: Console logging sufficient

**Production Recommendations**:
- Add Sentry for error tracking
- Log API response times
- Track voice parsing success rate
- Monitor Convex query performance


## Demo Script Integration

### VR App Configuration Changes

**Before Demo**:
```swift
// AppConfiguration.swift
static let current: Environment = .production
static var apiBaseURL: String {
  "https://corgi-quest.netlify.app" // Your deployed URL
}

// NetworkService.swift
init(baseURL: String? = nil, useMockData: Bool = false) {
  // Set useMockData to FALSE for real data
  self.useMockData = false
}
```

### Demo Talking Points

1. **"Real-time training HUD"**: Show floating panels with live stats
2. **"Voice-activated logging"**: Say "Start training Leave It"
3. **"Hands-free rep counting"**: Mark 5 reps with voice
4. **"AI-powered parsing"**: Show how natural language becomes structured data
5. **"Cross-device sync"**: Point to web app updating in real-time
6. **"Instant feedback"**: Show XP animation and stat updates

### Backup Plan

If API fails during demo:
- VR app automatically falls back to mock data
- Demo continues seamlessly
- Mention "offline mode" as a feature

