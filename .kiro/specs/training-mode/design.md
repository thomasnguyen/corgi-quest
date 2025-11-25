# Training Mode Design Document

## Overview

Training Mode is a hands-free activity logging feature that enables users to log dog training moments by speaking a wake word followed by an activity description. The system uses local speech recognition for continuous listening (cost-free), and only connects to OpenAI Realtime API when the wake word is detected to parse the activity and provide audio feedback. This design minimizes API costs while providing a seamless hands-free experience optimized for smart glasses and wireless earbuds.

## Architecture

### High-Level Flow

```
User speaks → Web Speech API (local) → Wake word detected? 
  ↓ No: Continue listening
  ↓ Yes: Extract payload
    ↓
  OpenAI Realtime API (parse + audio response)
    ↓
  Convex logActivity mutation
    ↓
  Real-time UI updates
    ↓
  Continue listening for next wake word
```

### Component Architecture

```
src/routes/training-mode.tsx
  ├── TrainingModeScreen (main component)
  │   ├── useWebSpeechRecognition (custom hook)
  │   ├── useOpenAIRealtime (existing hook, reused)
  │   ├── useMutation (Convex)
  │   └── useQuery (Convex)
  │
  └── UI Components
      ├── ListeningIndicator
      ├── LiveTranscript
      ├── LastLoggedActivity
      ├── TodaysSummary
      └── StopButton
```

### State Management

```typescript
// Training Mode State
{
  isListening: boolean,           // Web Speech API active
  transcript: string,             // Live transcript
  lastActivity: {                 // Most recent logged activity
    name: string,
    xpGains: { stat: string, amount: number }[],
    timestamp: number
  } | null,
  isProcessing: boolean,          // OpenAI parsing in progress
  error: string | null,           // Error message
  openAIConnected: boolean        // OpenAI WebSocket status
}
```

## Components and Interfaces

### 1. Overview Screen Updates

**File:** `src/components/layout/LogActivityButton.tsx`

**Changes:**
- Rename to `ActivityButtons.tsx`
- Display two side-by-side buttons instead of one
- Use existing button styling (cta_button.svg)

**Component Structure:**
```tsx
export function ActivityButtons() {
  return (
    <div className="px-5 pb-2 z-20">
      <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
        <Link to="/log-activity" className="...">
          LOG ACTIVITY
        </Link>
        <Link to="/training-mode" className="...">
          TRAINING MODE
        </Link>
      </div>
    </div>
  );
}
```

### 2. Training Mode Route

**File:** `src/routes/training-mode.tsx`

**Purpose:** Main route for Training Mode screen

**Key Features:**
- Request microphone permission on mount
- Initialize Web Speech API
- Detect wake word in transcript
- Connect to OpenAI only when wake word detected
- Display live UI feedback

**Route Configuration:**
```typescript
export const Route = createFileRoute("/training-mode")({
  component: TrainingModeScreen,
  ssr: false, // Disable SSR for browser-only APIs
});
```

### 3. Web Speech Recognition Hook

**File:** `src/hooks/useWebSpeechRecognition.ts`

**Purpose:** Manage Web Speech API for continuous local transcription

**Interface:**
```typescript
interface UseWebSpeechRecognitionReturn {
  transcript: string;           // Current transcript
  isListening: boolean;         // Recognition active
  error: string | null;         // Error message
  startListening: () => void;   // Start recognition
  stopListening: () => void;    // Stop recognition
  resetTranscript: () => void;  // Clear transcript
}

function useWebSpeechRecognition(): UseWebSpeechRecognitionReturn
```

**Implementation Details:**
- Use `webkitSpeechRecognition` (Chrome) or `SpeechRecognition` (Safari)
- Set `continuous: true` for ongoing recognition
- Set `interimResults: true` for live transcript
- Auto-restart on `onend` event (handles silence timeout)
- Accumulate transcript across recognition sessions

### 4. Wake Word Detection

**File:** `src/lib/wakeWordDetection.ts`

**Purpose:** Detect wake word and extract activity payload

**Interface:**
```typescript
interface WakeWordResult {
  detected: boolean;
  payload: string;  // Text after wake word
  wakeWord: string; // Which variation was detected
}

function detectWakeWord(transcript: string): WakeWordResult
```

**Implementation:**
```typescript
const WAKE_WORDS = [
  'corgi quest',
  'corgi, quest',
  'corgiquest'
];

function detectWakeWord(transcript: string): WakeWordResult {
  const lower = transcript.toLowerCase();
  
  for (const wakeWord of WAKE_WORDS) {
    const index = lower.indexOf(wakeWord);
    if (index !== -1) {
      const payload = transcript
        .substring(index + wakeWord.length)
        .trim()
        .replace(/^[,:]\s*/, ''); // Remove leading punctuation
      
      return {
        detected: true,
        payload,
        wakeWord
      };
    }
  }
  
  return { detected: false, payload: '', wakeWord: '' };
}
```

### 5. OpenAI Integration

**Reuse:** `src/hooks/useOpenAIRealtime.ts` (existing)

**New System Instructions:**

**File:** `src/lib/trainingModeInstructions.ts`

```typescript
export const TRAINING_MODE_SYSTEM_INSTRUCTIONS = `
You are a dog training assistant for Corgi Quest. Your job is to:

1. Parse activity descriptions into structured data
2. Determine appropriate stat gains (Emotional, Mental, Physical, Social)
3. Provide VERY CONCISE audio feedback

RESPONSE FORMAT:
- Keep responses under 3 seconds
- Format: "Logged. [X] emotional, [Y] mental"
- Only mention stats that gained XP
- If you can't parse the activity, say: "Didn't catch that, try again"

STAT GUIDELINES:
- Emotional (IMP): Staying calm, impulse control, reactivity training
- Mental (INT): Learning commands, problem-solving, recall
- Physical (PHY): Walking, running, physical exercise
- Social (SOC): Meeting dogs/people, socialization

EXAMPLES:
User: "stayed calm when bike passed"
You: "Logged. 5 emotional, 3 mental"

User: "good recall at park"
You: "Logged. 8 mental, 2 social"

User: "30 minute walk"
You: "Logged. 10 physical"

User: "blah blah nonsense"
You: "Didn't catch that, try again"
`;

export const TRAINING_MODE_FUNCTION_DEFINITION = {
  name: "saveActivity",
  description: "Log a dog training activity with stat gains",
  parameters: {
    type: "object",
    properties: {
      activityName: {
        type: "string",
        description: "Short name for the activity (e.g., 'Stayed calm around bike')"
      },
      durationMinutes: {
        type: "number",
        description: "Duration in minutes (optional)"
      },
      statGains: {
        type: "array",
        items: {
          type: "object",
          properties: {
            statType: {
              type: "string",
              enum: ["INT", "PHY", "IMP", "SOC"],
              description: "Stat type: INT (mental), PHY (physical), IMP (emotional), SOC (social)"
            },
            xpAmount: {
              type: "number",
              description: "XP amount (1-10 typical range)"
            }
          },
          required: ["statType", "xpAmount"]
        }
      },
      physicalPoints: {
        type: "number",
        description: "Physical wellness points (0-10)"
      },
      mentalPoints: {
        type: "number",
        description: "Mental wellness points (0-10)"
      }
    },
    required: ["activityName", "statGains", "physicalPoints", "mentalPoints"]
  }
};
```

### 6. Training Mode Screen UI

**File:** `src/routes/training-mode.tsx`

**Layout:**
```
┌─────────────────────────────────┐
│  [X] Close                      │  ← Top bar
├─────────────────────────────────┤
│                                 │
│     🎤 Listening...             │  ← Pulsing indicator
│                                 │
├─────────────────────────────────┤
│  Live Transcript:               │
│  "stayed calm when bike         │  ← Scrolling transcript
│   passed"                       │
├─────────────────────────────────┤
│  Last Logged:                   │
│  ✅ Stayed calm around bike     │  ← Most recent activity
│  +5 🧠 Emotional, +3 💪 Mental  │
│  Just now                       │
├─────────────────────────────────┤
│  Today's Progress:              │
│  💪 45/60 | 🧠 30/45 | 🔥 15    │  ← Daily summary
├─────────────────────────────────┤
│                                 │
│     [STOP TRAINING MODE]        │  ← Stop button
│                                 │
└─────────────────────────────────┘
```

**Component Breakdown:**

```tsx
function TrainingModeScreen() {
  return (
    <Layout>
      <div className="min-h-screen bg-[#121216] text-white">
        {/* Header */}
        <TrainingModeHeader onClose={handleClose} />
        
        {/* Listening Indicator */}
        <ListeningIndicator isListening={isListening} />
        
        {/* Live Transcript */}
        <LiveTranscript transcript={transcript} />
        
        {/* Last Logged Activity */}
        {lastActivity && (
          <LastLoggedActivity activity={lastActivity} />
        )}
        
        {/* Today's Summary */}
        <TodaysSummary />
        
        {/* Stop Button */}
        <StopButton onClick={handleStop} />
        
        {/* Error Display */}
        {error && <ErrorMessage message={error} />}
      </div>
    </Layout>
  );
}
```

### 7. UI Components

#### ListeningIndicator

```tsx
interface ListeningIndicatorProps {
  isListening: boolean;
}

function ListeningIndicator({ isListening }: ListeningIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`
        w-24 h-24 rounded-full 
        ${isListening ? 'bg-[#f5c35f] animate-pulse' : 'bg-gray-700'}
        flex items-center justify-center
      `}>
        <Mic className="w-12 h-12 text-[#121216]" />
      </div>
      <p className="mt-4 text-[#f9dca0] text-lg">
        {isListening ? 'Listening...' : 'Not listening'}
      </p>
    </div>
  );
}
```

#### LiveTranscript

```tsx
interface LiveTranscriptProps {
  transcript: string;
}

function LiveTranscript({ transcript }: LiveTranscriptProps) {
  const transcriptRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);
  
  return (
    <div className="px-6 py-4">
      <h3 className="text-[#f5c35f] text-sm font-semibold mb-2">
        Live Transcript
      </h3>
      <div 
        ref={transcriptRef}
        className="bg-[#1a1a1e] rounded-lg p-4 h-32 overflow-y-auto text-[#f9dca0] text-sm"
      >
        {transcript || 'Say "Corgi Quest" to log an activity...'}
      </div>
    </div>
  );
}
```

#### LastLoggedActivity

```tsx
interface LastLoggedActivityProps {
  activity: {
    name: string;
    xpGains: Array<{ stat: string; amount: number }>;
    timestamp: number;
  };
}

function LastLoggedActivity({ activity }: LastLoggedActivityProps) {
  const timeAgo = formatTimeAgo(activity.timestamp);
  
  return (
    <div className="px-6 py-4 bg-[#1a1a1e] mx-6 rounded-lg">
      <h3 className="text-[#f5c35f] text-sm font-semibold mb-2">
        Last Logged
      </h3>
      <div className="flex items-start gap-2">
        <span className="text-green-500 text-xl">✅</span>
        <div className="flex-1">
          <p className="text-white font-medium">{activity.name}</p>
          <p className="text-[#f9dca0] text-sm mt-1">
            {activity.xpGains.map(gain => 
              `+${gain.amount} ${getStatEmoji(gain.stat)} ${gain.stat}`
            ).join(', ')}
          </p>
          <p className="text-gray-500 text-xs mt-1">{timeAgo}</p>
        </div>
      </div>
    </div>
  );
}
```

#### TodaysSummary

```tsx
function TodaysSummary() {
  const firstDog = useQuery(api.queries.getFirstDog);
  const dailyGoals = useQuery(
    api.queries.getDailyGoals,
    firstDog ? { dogId: firstDog._id } : "skip"
  );
  
  if (!dailyGoals) return null;
  
  return (
    <div className="px-6 py-4">
      <h3 className="text-[#f5c35f] text-sm font-semibold mb-2">
        Today's Progress
      </h3>
      <div className="flex items-center justify-around bg-[#1a1a1e] rounded-lg p-4">
        <div className="text-center">
          <p className="text-2xl">💪</p>
          <p className="text-white text-sm mt-1">
            {dailyGoals.physicalPoints}/{dailyGoals.physicalGoal}
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl">🧠</p>
          <p className="text-white text-sm mt-1">
            {dailyGoals.mentalPoints}/{dailyGoals.mentalGoal}
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl">🔥</p>
          <p className="text-white text-sm mt-1">
            {dailyGoals.currentStreak} days
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### StopButton

```tsx
interface StopButtonProps {
  onClick: () => void;
}

function StopButton({ onClick }: StopButtonProps) {
  return (
    <div className="fixed bottom-8 left-0 right-0 px-6">
      <button
        onClick={onClick}
        className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold text-lg transition-colors"
      >
        STOP TRAINING MODE
      </button>
    </div>
  );
}
```

## Data Models

### Training Mode State

```typescript
interface TrainingModeState {
  // Web Speech API
  isListening: boolean;
  transcript: string;
  speechError: string | null;
  
  // OpenAI
  openAIConnected: boolean;
  isProcessing: boolean;
  
  // Activity Logging
  lastActivity: {
    activityId: string;
    name: string;
    xpGains: Array<{
      statType: string;
      xpAmount: number;
    }>;
    timestamp: number;
  } | null;
  
  // Error Handling
  error: string | null;
}
```

### Wake Word Detection Result

```typescript
interface WakeWordResult {
  detected: boolean;
  payload: string;
  wakeWord: string;
  startIndex: number;
  endIndex: number;
}
```

## Error Handling

### Error Types

1. **Microphone Permission Denied**
   - Display: "Microphone access required for Training Mode"
   - Action: Provide link to browser settings

2. **Web Speech API Not Supported**
   - Display: "Your browser doesn't support voice recognition"
   - Action: Suggest Chrome or Safari

3. **Web Speech API Error**
   - Display: "Voice recognition error. Retrying..."
   - Action: Auto-restart recognition

4. **OpenAI Connection Failed**
   - Display: "Failed to connect to voice service"
   - Action: Continue local listening, retry on next wake word

5. **Activity Logging Failed**
   - Display: "Failed to log activity. Please try again"
   - Action: Keep activity data, allow manual retry

### Error Recovery Strategy

```typescript
function handleError(error: Error, type: ErrorType) {
  // Log error
  console.error(`[Training Mode] ${type}:`, error);
  
  // Display user-friendly message
  setError(getUserFriendlyMessage(type));
  
  // Auto-recovery based on type
  switch (type) {
    case 'SPEECH_RECOGNITION':
      // Restart recognition after 1 second
      setTimeout(() => startListening(), 1000);
      break;
      
    case 'OPENAI_CONNECTION':
      // Continue local listening, retry on next wake word
      setOpenAIConnected(false);
      break;
      
    case 'ACTIVITY_LOGGING':
      // Keep activity data for manual retry
      // Don't auto-retry to avoid duplicates
      break;
  }
}
```

## Testing Strategy

### Unit Tests

1. **Wake Word Detection**
   - Test all wake word variations
   - Test payload extraction
   - Test edge cases (wake word at start/end, multiple occurrences)

2. **Web Speech Hook**
   - Test start/stop lifecycle
   - Test auto-restart on end
   - Test transcript accumulation

3. **OpenAI Integration**
   - Test function call handling
   - Test audio response playback
   - Test error responses

### Integration Tests

1. **End-to-End Flow**
   - Start Training Mode → Speak wake word → Verify activity logged
   - Test with multiple activities in sequence
   - Test error recovery

2. **Real-Time Updates**
   - Verify XP updates in UI
   - Verify daily goals update
   - Verify activity feed updates

### Manual Testing

1. **Device Testing**
   - Test on iPhone with Safari
   - Test on Android with Chrome
   - Test with AirPods
   - Test with Ray-Ban Meta (if available)

2. **Audio Quality**
   - Test in quiet environment
   - Test in noisy environment (dog park)
   - Test with background conversations

3. **Battery Impact**
   - Measure battery drain over 30-minute session
   - Compare with/without Training Mode

## Performance Considerations

### Battery Optimization

1. **Web Speech API**
   - Runs locally, minimal battery impact
   - Auto-pause during silence (browser handles this)

2. **OpenAI Connection**
   - Only connect when wake word detected
   - Disconnect immediately after response
   - Typical session: 3 connections × 5 seconds = 15 seconds total

3. **Screen**
   - Allow screen to dim/lock while Training Mode active
   - Audio feedback works with screen off

### Cost Optimization

**Per Activity:**
- Audio input: ~5 seconds × $0.06/min = $0.005
- Audio output: ~3 seconds × $0.24/min = $0.012
- **Total per activity: ~$0.017**

**Per 30-Minute Walk (3 activities):**
- 3 × $0.017 = **$0.051**

**Monthly (20 walks):**
- 20 × $0.051 = **$1.02**

This is economically viable for production.

## Browser Compatibility

### Supported Browsers

| Browser | Platform | Web Speech API | OpenAI Realtime | Status |
|---------|----------|----------------|-----------------|--------|
| Chrome | Android | ✅ | ✅ | Fully Supported |
| Safari | iOS | ✅ | ✅ | Fully Supported |
| Chrome | Desktop | ✅ | ✅ | Supported (not primary use case) |
| Firefox | Any | ❌ | ✅ | Not Supported |
| Edge | Any | ✅ | ✅ | Supported |

### Compatibility Detection

```typescript
function checkBrowserCompatibility(): {
  supported: boolean;
  message: string;
} {
  // Check Web Speech API
  const hasSpeechRecognition = 
    'webkitSpeechRecognition' in window || 
    'SpeechRecognition' in window;
  
  if (!hasSpeechRecognition) {
    return {
      supported: false,
      message: 'Your browser doesn\'t support voice recognition. Please use Chrome or Safari.'
    };
  }
  
  // Check WebSocket (for OpenAI)
  if (!('WebSocket' in window)) {
    return {
      supported: false,
      message: 'Your browser doesn\'t support real-time voice. Please update your browser.'
    };
  }
  
  return { supported: true, message: '' };
}
```

## Security Considerations

### API Key Protection

- OpenAI API key stored in environment variables
- Session tokens generated server-side via Convex action
- Tokens expire after 60 seconds

### Data Privacy

- Web Speech API transcription happens locally (not sent to servers)
- Only activity payload sent to OpenAI (not full transcript)
- No audio recordings stored
- Transcripts not persisted

### Input Validation

- Validate activity payload length (max 500 characters)
- Sanitize activity names before storing in database
- Validate XP amounts from OpenAI (max 100 per stat)

## Future Enhancements

### Phase 2 (Post-Hackathon)

1. **Custom Wake Words**
   - Allow users to set their own wake word
   - Store in user preferences

2. **Offline Mode**
   - Cache common activities for offline logging
   - Sync when connection restored

3. **Voice Commands**
   - "Corgi Quest, pause" - Pause Training Mode
   - "Corgi Quest, resume" - Resume Training Mode
   - "Corgi Quest, stats" - Hear today's progress

4. **Smart Suggestions**
   - Learn common activities per user
   - Suggest activities based on time/location

5. **Multi-Language Support**
   - Support wake words in multiple languages
   - Localized audio responses

### Phase 3 (Advanced)

1. **Background Operation**
   - Run Training Mode as PWA background service
   - Requires native app or advanced PWA features

2. **ML-Based Wake Word**
   - Train custom wake word model
   - Better accuracy, lower false positives

3. **Activity Patterns**
   - Detect activity patterns (e.g., "every morning walk")
   - Auto-suggest based on patterns
