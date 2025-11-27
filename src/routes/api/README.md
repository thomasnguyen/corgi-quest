# VR API Integration - Infrastructure

This directory contains the API endpoints that bridge the visionOS VR app to the Convex backend.

## Architecture

```
VR App (Swift) → HTTP Request → TanStack Start Server Function → Convex HTTP Client → Convex Backend
                                                                                    ↓
                                                                              JSON Response
```

## Endpoints

### GET /api/vr-status
Returns complete dog training status for VR display.

**Query Parameters:**
- `dogId` (optional): Specific dog ID to fetch. If omitted, returns first dog in database.

**Features:**
- Parallel query execution for optimal performance
- 5-second timeout with graceful degradation
- Returns partial data if some queries fail (except dog profile)
- Proper error handling with specific status codes

**Response Format:**
```typescript
{
  dogName: string
  level: number
  overallXp: number
  xpToNextLevel: number
  stats: Array<{
    type: "PHY" | "INT" | "IMP" | "SOC"
    name: string
    level: number
    xp: number
    xpToNextLevel: number
    xpProgress: number // 0.0 to 1.0
  }>
  goals: {
    physical: { current: number; target: number }
    mental: { current: number; target: number }
    streak: number
  }
  recentActivities: Array<{
    id: string
    name: string
    xpBreakdown: Array<{ stat: string; amount: number }>
    timestamp: number // milliseconds since epoch
    loggedBy: string
  }>
  weeklyXP: Array<{
    day: string // "Mon", "Tue", etc.
    total: number
    date: number // milliseconds since epoch
  }>
}
```

**Error Responses:**
- `404 DOG_NOT_FOUND`: Invalid or missing dog ID
- `404 NO_DOGS`: No dogs in system
- `503 TIMEOUT`: Request exceeded 5-second timeout
- `500 INTERNAL_ERROR`: Unexpected server error

### POST /api/voice-log
Processes voice transcripts into training activities.

**Request Headers:**
- `Content-Type: application/json` (required)

**Request Format:**
```typescript
{
  text: string // Natural language activity description (required)
  sessionContext?: {
    activity: string
    repsCompleted: number
  }
}
```

**Features:**
- AI-powered activity parsing using OpenAI GPT-4
- 30-second timeout for AI parsing
- Automatic XP calculation and stat updates
- Daily goal progress updates
- Streak tracking updates
- Comprehensive error handling and logging

**Response Format:**
```typescript
{
  success: boolean
  activityId?: string // Convex activity record ID
  xpAwarded?: Array<{ 
    stat: "PHY" | "INT" | "IMP" | "SOC"
    amount: number 
  }>
  error?: string // Only present on failure
}
```

**Error Responses:**
- `400 INVALID_CONTENT_TYPE`: Missing or invalid Content-Type header
- `400 EMPTY_TRANSCRIPT`: Text field is empty or missing
- `404 NO_DOGS`: No dogs found in system
- `404 NO_USERS`: No users found in household
- `500 PARSING_FAILED`: AI parsing failed
- `500 LOG_ACTIVITY_FAILED`: Failed to create activity record
- `503 PARSING_TIMEOUT`: AI parsing exceeded 30 seconds
- `500 INTERNAL_ERROR`: Unexpected server error

**Example Request:**
```bash
curl -X POST https://corgi-quest.netlify.app/api/voice-log \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Completed 5 Leave It reps with treats on the floor"
  }'
```

**Example Success Response:**
```json
{
  "success": true,
  "activityId": "k17abc123...",
  "xpAwarded": [
    { "stat": "IMP", "amount": 50 },
    { "stat": "INT", "amount": 20 }
  ]
}
```

**Example Error Response:**
```json
{
  "success": false,
  "error": "Text is required and cannot be empty",
  "code": "EMPTY_TRANSCRIPT"
}
```

## Infrastructure Components

### Convex HTTP Client (`src/lib/convexHttpClient.ts`)
- Singleton HTTP client for server-side Convex queries
- Configured with environment variable `VITE_CONVEX_URL` or `CONVEX_URL`
- Used by all API endpoints to communicate with Convex backend

### CORS Configuration
CORS headers are configured at the Netlify level in `netlify.toml`:
- `Access-Control-Allow-Origin: *` (demo/hackathon - restrict in production)
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`
- `Access-Control-Max-Age: 86400` (24 hours)

### TanStack Start Server Functions
Both endpoints use `createServerFn` from `@tanstack/react-start`:
- Automatic JSON serialization
- Type-safe request/response handling
- Built-in error handling
- Deployed as Netlify Functions

## Environment Variables

Required environment variables:
- `VITE_CONVEX_URL` or `CONVEX_URL` - Convex deployment URL
- `OPENAI_API_KEY` - Already configured in Convex for AI parsing

## Error Handling

All endpoints follow consistent error patterns:
- 400 Bad Request: Invalid input (empty text, malformed JSON)
- 404 Not Found: Dog ID doesn't exist, no dogs in system
- 500 Internal Server Error: Convex query failures, unexpected errors
- 503 Service Unavailable: Request timeout, OpenAI API timeout or rate limit

Error responses include descriptive messages and error codes:
```typescript
{
  error: "Human-readable error message",
  code: "ERROR_CODE" // e.g., "DOG_NOT_FOUND", "TIMEOUT", "INTERNAL_ERROR"
}
```

### Graceful Degradation

The VR status endpoint uses `Promise.allSettled` to handle partial failures:
- If weekly XP query fails → returns empty array
- If activity feed query fails → returns empty array
- If goals/streak queries fail → returns default values (0)
- If dog profile query fails → returns 500 error (critical data)

## Performance Targets

- **VR Status Response**: < 500ms
- **Voice Log Processing**: < 2s (includes AI parsing)
- **Polling Frequency**: Every 3 seconds during active training
- **Data Freshness**: Max 3-second delay between VR and web app

## Demo Optimization

The API is optimized for a 15-25 second hackathon demo:
1. Minimal UI (0-2s): VR shows floating panels
2. Start Training (2-5s): Voice command "Start training Leave It"
3. Mark Reps (5-15s): Voice commands "Mark rep" × 5
4. Session Summary (15-20s): Voice command "End session"
5. Stats Update (20-23s): VR polls API, shows +IMP XP
6. Return to Minimal (23-25s): Updated stats visible

## Requirements Mapping

- **Requirements 6.1, 6.2**: REST conventions (GET/POST, proper status codes)
- **Requirements 6.3**: CORS headers configured in netlify.toml
- **Requirements 1.1-1.5**: VR status endpoint returns all required data
- **Requirements 2.1-2.5**: Voice log endpoint processes and logs activities
- **Requirements 7.1-7.4**: Response formats match Swift structs exactly

## Testing

To test the endpoints locally:

```bash
# Start dev server
npm run dev

# Test VR status endpoint (default dog)
curl http://localhost:3000/api/vr-status

# Test VR status endpoint (specific dog)
curl "http://localhost:3000/api/vr-status?dogId=YOUR_DOG_ID"

# Test voice log endpoint
curl -X POST http://localhost:3000/api/voice-log \
  -H "Content-Type: application/json" \
  -d '{"text": "Completed 5 Leave It reps"}'
```

## Deployment

Endpoints deploy automatically with Netlify:
1. Push changes to trigger build
2. Netlify builds TanStack Start app
3. Server functions deploy as Netlify Functions
4. CORS headers applied via netlify.toml
5. Production URL: `https://corgi-quest.netlify.app/api/*`

## VR App Configuration

Update the VR app to use production API:

```swift
// AppConfiguration.swift
static let current: Environment = .production
static var apiBaseURL: String {
  "https://corgi-quest.netlify.app"
}

// NetworkService.swift
init(baseURL: String? = nil, useMockData: Bool = false) {
  self.useMockData = false // Disable mock data
}
```
