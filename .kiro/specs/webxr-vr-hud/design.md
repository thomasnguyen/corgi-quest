# Design Document

## Overview

The WebXR VR-HUD feature provides an immersive training interface for Apple Vision Pro users through Safari's WebXR implementation. Built with react-three-fiber and integrated with the existing Convex real-time backend, this feature enables hands-free dog training with 3D visualizations, voice commands, and real-time data synchronization.

The design leverages Vision Pro's natural gaze-and-pinch input model while maintaining compatibility with desktop WebXR emulators for development. A 2D fallback ensures the feature remains accessible on non-VR devices.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Safari on Vision Pro                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              /vr Route (TanStack Start)               │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │         react-three-fiber Canvas              │ │  │
│  │  │  ┌──────────────────────────────────────────┐ │ │  │
│  │  │  │  WebXR Session (immersive-vr)          │ │ │  │
│  │  │  │  - 3D Scene with floating panels       │ │ │  │
│  │  │  │  - Stat orbs, goals, activity feed     │ │ │  │
│  │  │  │  - Session controls                    │ │ │  │
│  │  │  │  - Gaze-and-pinch raycasting          │ │ │  │
│  │  │  └──────────────────────────────────────────┘ │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │         Voice Recognition Layer               │ │  │
│  │  │  - Web Speech API                            │ │  │
│  │  │  - Command parsing                           │ │  │
│  │  │  - Activity transcription                    │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Convex Real-Time Backend                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Queries: getDog, getDogStats, getDailyGoals, etc.   │  │
│  │  Mutations: startSession, markRep, endSession        │  │
│  │  Actions: parseVoiceActivity (Claude integration)    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Real-time subscriptions
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Other Corgi Quest Clients                       │
│  - Web app (/app routes)                                    │
│  - Mobile PWA                                               │
│  - Native visionOS app                                      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Routing**: TanStack Start (file-based routing)
- **3D Rendering**: react-three-fiber (React wrapper for three.js)
- **WebXR**: @react-three/xr for WebXR session management
- **Voice Input**: Web Speech API (browser-native)
- **Backend**: Convex (real-time subscriptions via useQuery/useMutation)
- **Styling**: Tailwind CSS for 2D fallback UI
- **State Management**: React hooks + Convex real-time state

### Key Design Decisions

1. **react-three-fiber over vanilla three.js**: Provides React-friendly declarative 3D scene composition and integrates seamlessly with existing React components.

2. **Web Speech API over OpenAI Realtime**: Reduces latency and complexity for hackathon demo. Web Speech API is browser-native and works well for command recognition.

3. **Polling for real-time updates**: While Convex supports WebSocket subscriptions, WebXR sessions may have limitations. We'll use 3-second polling as a reliable fallback with option to upgrade to subscriptions.

4. **Minimal 3D geometry**: Keep scene lightweight with simple shapes (planes, circles) to maintain 60+ fps on Vision Pro.

5. **Gaze-based raycasting**: Use Vision Pro's transient-pointer input mode with targetRaySpace for natural interaction without hand controllers.

## Components and Interfaces

### Route Structure

```
src/routes/
  app.vr.tsx              # Main VR route with WebXR session management
```

### Component Hierarchy

```
<VRTrainingHUD>                    # Main route component
  ├─ <WebXRCheck>                  # Feature detection and fallback
  │   ├─ <VREntryButton>           # "Enter VR" button (requires user gesture)
  │   └─ <FallbackDashboard>       # 2D UI for non-VR devices
  │
  └─ <Canvas>                      # react-three-fiber canvas
      └─ <XR>                      # WebXR session wrapper
          ├─ <VRScene>             # 3D environment setup
          │   ├─ <Lighting>        # Ambient + directional lights
          │   └─ <Environment>     # Minimal background
          │
          ├─ <DogProfilePanel>     # Dog name, level, avatar
          │   └─ <Text3D>          # 3D text rendering
          │
          ├─ <StatOrbsPanel>       # Four stat visualizations
          │   └─ <StatOrb> × 4     # Individual stat with progress ring
          │
          ├─ <GoalsPanel>          # Daily goals display
          │   ├─ <ProgressBar3D>   # Physical goal bar
          │   ├─ <ProgressBar3D>   # Mental goal bar
          │   └─ <StreakDisplay>   # Streak counter
          │
          ├─ <ActivityFeedPanel>   # Recent activities
          │   └─ <ActivityItem> × 5
          │
          ├─ <WeeklyChartPanel>    # 7-day XP chart
          │   └─ <BarChart3D>      # 3D bar chart
          │
          ├─ <SessionControlsPanel> # Training session UI
          │   ├─ <StartButton>     # Conditional: no active session
          │   ├─ <MarkRepButton>   # Conditional: active session
          │   ├─ <EndButton>       # Conditional: active session
          │   └─ <RepCounter>      # Current rep count
          │
          └─ <InteractionRaycaster> # Gaze-and-pinch handler
```

### Core Components

#### VRTrainingHUD (app.vr.tsx)

Main route component that orchestrates the VR experience.

```typescript
interface VRTrainingHUDProps {}

export function VRTrainingHUD() {
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);
  const [inVR, setInVR] = useState(false);
  
  // Check WebXR support on mount
  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-vr')
        .then(setXrSupported);
    } else {
      setXrSupported(false);
    }
  }, []);
  
  // Render fallback or VR experience
  if (xrSupported === false) {
    return <FallbackDashboard />;
  }
  
  if (!inVR) {
    return <VREntryButton onEnter={() => setInVR(true)} />;
  }
  
  return <VRCanvas />;
}
```

#### VRCanvas

react-three-fiber canvas with WebXR session configuration.

```typescript
function VRCanvas() {
  return (
    <Canvas>
      <XR
        referenceSpace="local-floor"
        sessionInit={{
          optionalFeatures: ['hand-tracking', 'local-floor']
        }}
      >
        <VRScene />
        <VRPanels />
        <InteractionRaycaster />
      </XR>
    </Canvas>
  );
}
```

#### StatOrb

3D visualization of a single stat with circular progress ring.

```typescript
interface StatOrbProps {
  statType: 'PHY' | 'INT' | 'IMP' | 'SOC';
  level: number;
  xp: number;
  xpToNextLevel: number;
  position: [number, number, number];
}

function StatOrb({ statType, level, xp, xpToNextLevel, position }: StatOrbProps) {
  const progress = xp / xpToNextLevel;
  const [scale, setScale] = useState(1);
  
  // Pulse animation on XP change
  useEffect(() => {
    setScale(1.2);
    const timeout = setTimeout(() => setScale(1), 300);
    return () => clearTimeout(timeout);
  }, [xp]);
  
  return (
    <group position={position} scale={scale}>
      {/* Background circle */}
      <mesh>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Progress ring */}
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <ringGeometry args={[0.45, 0.5, 32, 1, 0, progress * Math.PI * 2]} />
        <meshBasicMaterial color={getStatColor(statType)} />
      </mesh>
      
      {/* Stat label */}
      <Text position={[0, 0, 0.01]} fontSize={0.15}>
        {statType} {level}
      </Text>
    </group>
  );
}
```

#### InteractionRaycaster

Handles gaze-and-pinch interaction using WebXR input sources.

```typescript
function InteractionRaycaster() {
  const { session } = useXR();
  const [hoveredObject, setHoveredObject] = useState<Object3D | null>(null);
  
  useFrame(() => {
    if (!session) return;
    
    // Get input sources (gaze + pinch)
    const inputSources = session.inputSources;
    
    for (const source of inputSources) {
      if (source.targetRayMode === 'gaze') {
        // Raycast from gaze direction
        const ray = getRayFromInputSource(source);
        const intersects = raycaster.intersectObjects(interactiveObjects);
        
        if (intersects.length > 0) {
          setHoveredObject(intersects[0].object);
        } else {
          setHoveredObject(null);
        }
      }
    }
  });
  
  // Listen for select events (pinch)
  useEffect(() => {
    if (!session) return;
    
    const handleSelect = (event: XRInputSourceEvent) => {
      if (hoveredObject && hoveredObject.userData.onClick) {
        hoveredObject.userData.onClick();
      }
    };
    
    session.addEventListener('select', handleSelect);
    return () => session.removeEventListener('select', handleSelect);
  }, [session, hoveredObject]);
  
  return null;
}
```

### Hooks

#### useVRData

Custom hook for fetching and subscribing to VR-HUD data from Convex.

```typescript
interface VRData {
  dog: Dog | null;
  stats: DogStat[];
  goals: DailyGoal | null;
  activities: Activity[];
  weeklyXP: { date: string; xp: number }[];
  streak: Streak | null;
}

function useVRData(dogId: Id<"dogs"> | null): VRData {
  // Real-time queries
  const dog = useQuery(api.queries.getDog, dogId ? { dogId } : "skip");
  const stats = useQuery(api.queries.getDogStats, dogId ? { dogId } : "skip");
  const goals = useQuery(api.queries.getTodaysGoals, dogId ? { dogId } : "skip");
  const activities = useQuery(
    api.queries.getRecentActivities,
    dogId ? { dogId, limit: 5 } : "skip"
  );
  const weeklyXP = useQuery(
    api.queries.getWeeklyXP,
    dogId ? { dogId } : "skip"
  );
  const streak = useQuery(api.queries.getStreak, dogId ? { dogId } : "skip");
  
  return {
    dog: dog ?? null,
    stats: stats ?? [],
    goals: goals ?? null,
    activities: activities ?? [],
    weeklyXP: weeklyXP ?? [],
    streak: streak ?? null,
  };
}
```

#### useVoiceCommands

Custom hook for voice command recognition and parsing.

```typescript
interface VoiceCommand {
  type: 'start_session' | 'mark_rep' | 'end_session' | 'unknown';
  payload?: string;
}

function useVoiceCommands(enabled: boolean) {
  const [command, setCommand] = useState<VoiceCommand | null>(null);
  const { transcript, isListening } = useWebSpeechRecognition();
  
  useEffect(() => {
    if (!enabled || !transcript) return;
    
    const lowerTranscript = transcript.toLowerCase();
    
    // Parse commands
    if (lowerTranscript.includes('start session') || 
        lowerTranscript.includes('begin training')) {
      setCommand({ type: 'start_session' });
    } else if (lowerTranscript.includes('mark rep') || 
               lowerTranscript.includes('mark repetition')) {
      setCommand({ type: 'mark_rep' });
    } else if (lowerTranscript.includes('end session')) {
      // Extract description after "end session"
      const description = transcript.substring(
        transcript.toLowerCase().indexOf('end session') + 11
      ).trim();
      setCommand({ type: 'end_session', payload: description });
    }
  }, [transcript, enabled]);
  
  const clearCommand = useCallback(() => {
    setCommand(null);
  }, []);
  
  return { command, clearCommand, isListening };
}
```

#### useTrainingSession

Custom hook for managing training session state.

```typescript
interface TrainingSession {
  isActive: boolean;
  repCount: number;
  startTime: number | null;
  sessionId: Id<"training_sessions"> | null;
}

function useTrainingSession(dogId: Id<"dogs"> | null) {
  const [session, setSession] = useState<TrainingSession>({
    isActive: false,
    repCount: 0,
    startTime: null,
    sessionId: null,
  });
  
  const startSession = useMutation(api.mutations.startTrainingSession);
  const markRep = useMutation(api.mutations.incrementRepCount);
  const endSession = useMutation(api.mutations.endTrainingSession);
  
  const handleStart = useCallback(async () => {
    if (!dogId) return;
    
    const sessionId = await startSession({ dogId });
    setSession({
      isActive: true,
      repCount: 0,
      startTime: Date.now(),
      sessionId,
    });
  }, [dogId, startSession]);
  
  const handleMarkRep = useCallback(async () => {
    if (!session.sessionId) return;
    
    await markRep({ sessionId: session.sessionId });
    setSession(prev => ({ ...prev, repCount: prev.repCount + 1 }));
  }, [session.sessionId, markRep]);
  
  const handleEnd = useCallback(async (description: string) => {
    if (!session.sessionId) return;
    
    await endSession({
      sessionId: session.sessionId,
      description,
      repCount: session.repCount,
    });
    
    setSession({
      isActive: false,
      repCount: 0,
      startTime: null,
      sessionId: null,
    });
  }, [session, endSession]);
  
  return {
    session,
    startSession: handleStart,
    markRep: handleMarkRep,
    endSession: handleEnd,
  };
}
```

## Data Models

### VR-Specific Types

```typescript
// 3D position in space
type Position3D = [number, number, number];

// Panel layout configuration
interface PanelLayout {
  dogProfile: Position3D;
  statOrbs: Position3D;
  goals: Position3D;
  activities: Position3D;
  weeklyChart: Position3D;
  sessionControls: Position3D;
}

// Interactive 3D object
interface Interactive3DObject extends Object3D {
  userData: {
    onClick?: () => void;
    onHover?: () => void;
    onHoverEnd?: () => void;
    interactable: boolean;
  };
}

// Voice command result
interface VoiceCommand {
  type: 'start_session' | 'mark_rep' | 'end_session' | 'unknown';
  payload?: string;
  confidence?: number;
}

// Training session state
interface TrainingSession {
  isActive: boolean;
  repCount: number;
  startTime: number | null;
  sessionId: Id<"training_sessions"> | null;
}
```

### Existing Convex Types (Reused)

```typescript
// From convex schema
type Dog = {
  _id: Id<"dogs">;
  name: string;
  householdId: Id<"households">;
  overallLevel: number;
  overallXp: number;
  xpToNextLevel: number;
  photoUrl?: string;
  breed?: string;
  traits?: string[];
  createdAt: number;
};

type DogStat = {
  _id: Id<"dog_stats">;
  dogId: Id<"dogs">;
  statType: "INT" | "PHY" | "IMP" | "SOC";
  level: number;
  xp: number;
  xpToNextLevel: number;
};

type DailyGoal = {
  _id: Id<"daily_goals">;
  dogId: Id<"dogs">;
  date: string;
  physicalPoints: number;
  physicalGoal: number;
  mentalPoints: number;
  mentalGoal: number;
};

type Activity = {
  _id: Id<"activities">;
  dogId: Id<"dogs">;
  userId: Id<"users">;
  activityName: string;
  description?: string;
  durationMinutes?: number;
  physicalPoints?: number;
  mentalPoints?: number;
  createdAt: number;
};

type Streak = {
  _id: Id<"streaks">;
  dogId: Id<"dogs">;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
};
```

## C
orrectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

After analyzing the acceptance criteria, many requirements focus on specific UI states, initialization sequences, and integration behaviors that are better validated through example-based tests. However, several universal properties emerge that should hold across all inputs and states:

### Property 1: Panel Position Consistency
*For any* set of panels in the VR scene, each panel should maintain its configured 3D position relative to the user's view space
**Validates: Requirements 2.3**

### Property 2: Stat Progress Accuracy
*For any* stat with XP data, the circular progress ring should display a percentage equal to (xp / xpToNextLevel) * 100
**Validates: Requirements 4.2**

### Property 3: Animation Triggering on State Change
*For any* stat that receives XP, the stat orb should trigger a pulse animation
**Validates: Requirements 4.3, 4.4, 10.4, 13.3**

### Property 4: Complete Stat Information Display
*For any* rendered stat orb, it should display the stat type, stat name, and current level
**Validates: Requirements 4.5**

### Property 5: Goal Progress Animation
*For any* goal whose progress value changes, the progress bar should trigger a smooth animation
**Validates: Requirements 5.3**

### Property 6: Goal Completion Highlighting
*For any* goal where progress >= goal target, the goal should display a visual completion indicator
**Validates: Requirements 5.5**

### Property 7: Button Hover Highlighting
*For any* interactive 3D button, when the raycaster intersects it, the button should display a hover highlight
**Validates: Requirements 6.2**

### Property 8: Button Action Triggering
*For any* interactive 3D button with an onClick handler, when the user pinches while gazing at it, the onClick handler should be called
**Validates: Requirements 6.3**

### Property 9: Rep Counter Increment
*For any* active training session, marking a rep should increase the rep counter by exactly 1
**Validates: Requirements 7.4**

### Property 10: Voice Command Recognition
*For any* transcript containing "start session", "mark rep", or "end session", the system should parse and execute the corresponding command
**Validates: Requirements 8.3, 8.4, 8.5**

### Property 11: Activity Feed Limiting
*For any* activity list, the feed should display at most the 5 most recent activities sorted by creation time
**Validates: Requirements 11.1**

### Property 12: Complete Activity Information
*For any* displayed activity, it should show the activity name, XP breakdown, timestamp, and user who logged it
**Validates: Requirements 11.2, 11.3**

### Property 13: Activity Feed Animation
*For any* new activity added to the feed, it should trigger a fade-in animation
**Validates: Requirements 11.4**

### Property 14: Weekly Chart Bar Count
*For any* weekly XP data, the chart should render exactly 7 bars representing the last 7 days
**Validates: Requirements 12.2**

### Property 15: Chart Bar Labeling
*For any* bar in the weekly chart, it should have a label showing the day of the week
**Validates: Requirements 12.3**

### Property 16: Chart Data Updates
*For any* change in weekly XP data, the bar heights should smoothly transition to the new values
**Validates: Requirements 12.5**

### Property 17: Button Feedback Animation
*For any* button activation, the button should play a scale animation
**Validates: Requirements 13.1**

### Property 18: Goal Celebration Animation
*For any* goal that transitions from incomplete to complete, a celebration animation should play
**Validates: Requirements 13.4**

### Property 19: Fallback Functional Equivalence
*For any* user action in 2D fallback mode, it should produce the same backend effect as the same action in VR mode
**Validates: Requirements 14.3**

### Property 20: Animation Throttling
*For any* frame, no more than 4 UI animations should be running simultaneously
**Validates: Requirements 15.2**

### Property 21: Polling Rate Limiting
*For any* 3-second window, at most one data polling request should be made to the backend
**Validates: Requirements 15.4**

### Property 22: Error Message Display
*For any* backend error response, the system should display a user-friendly error message
**Validates: Requirements 16.4**

### Property 23: Unrecognized Command Handling
*For any* voice transcript that doesn't match known commands, the system should ignore it without displaying an error
**Validates: Requirements 16.5**

## Error Handling

### Network Errors

- **Connection Loss**: Display floating "Offline" indicator in VR space. Retry data fetching with exponential backoff (1s, 2s, 4s, 8s max).
- **Timeout**: Show "Connection slow" warning after 5 seconds. Cancel request after 10 seconds.
- **Backend Errors**: Parse error response and display user-friendly message. Log technical details to console.

### WebXR Errors

- **Session Request Failure**: Fall back to 2D dashboard immediately. Display message: "VR mode unavailable. Using 2D mode."
- **Session End**: Gracefully exit VR and return to entry screen. Preserve session state if active.
- **Rendering Errors**: Catch three.js errors and display error boundary. Offer "Restart VR" button.

### Voice Recognition Errors

- **Permission Denied**: Display modal with instructions to enable microphone in browser settings. Provide manual text input fallback.
- **Recognition Unavailable**: Fall back to manual text input. Display message: "Voice commands unavailable. Use manual input."
- **No Speech Detected**: Silently continue listening. Don't show error to user.
- **Network Error (Speech API)**: Continue with local recognition if available. Show warning if cloud features unavailable.

### Data Errors

- **No Active Dog**: Display message: "Please select a dog to begin training." Provide link to dog selection.
- **Missing Data**: Show placeholder UI with loading state. Retry fetch after 2 seconds.
- **Invalid Data**: Log error and use fallback values (e.g., 0 XP, level 1). Display warning icon.

### Session Errors

- **Session Already Active**: Prevent starting new session. Display message: "Session already in progress."
- **Session Not Found**: Clear local session state. Display message: "Session expired. Please start a new session."
- **Rep Marking Without Session**: Ignore action silently. Don't show error.

## Testing Strategy

### Unit Testing

Unit tests will focus on:

- **Component Rendering**: Verify components render with correct props and structure
- **State Management**: Test hooks return correct state and update functions
- **Voice Command Parsing**: Test command recognition logic with various transcripts
- **Data Transformations**: Test utility functions for XP calculations, date formatting, etc.
- **Error Handling**: Test error boundary behavior and fallback rendering

Example unit tests:
- StatOrb renders with correct progress percentage
- useVoiceCommands parses "start session" correctly
- Activity feed limits to 5 items
- Fallback dashboard renders when WebXR unsupported

### Property-Based Testing

Property-based tests will verify universal behaviors across many inputs:

- **Progress Calculations**: Generate random XP values and verify progress ring accuracy (Property 2)
- **Animation Triggering**: Generate random state changes and verify animations trigger (Properties 3, 5, 13, 16)
- **Data Limiting**: Generate random activity lists and verify only 5 most recent shown (Property 11)
- **Command Recognition**: Generate random transcripts and verify command parsing (Property 10)
- **Polling Rate**: Generate random time sequences and verify polling respects 3s limit (Property 21)

Property tests will use **fast-check** library for JavaScript/TypeScript property-based testing. Each test will run a minimum of 100 iterations to ensure statistical confidence.

### Integration Testing

Integration tests will verify:

- **Convex Integration**: Test real-time data subscriptions and mutations
- **WebXR Session**: Test session lifecycle (request, render, end)
- **Voice + Backend**: Test end-to-end voice logging flow
- **Cross-Device Sync**: Test data updates appear across VR and web clients

### Manual Testing Checklist

For hackathon demo:

1. **Vision Pro Setup**
   - [ ] Load /vr route in Safari on Vision Pro
   - [ ] Verify HTTPS connection
   - [ ] Grant microphone permissions

2. **VR Experience**
   - [ ] Click "Enter VR" and verify session starts
   - [ ] Verify all panels render in 3D space
   - [ ] Test gaze-and-pinch on each button
   - [ ] Verify stat orbs show correct data

3. **Voice Commands**
   - [ ] Say "start session" and verify session begins
   - [ ] Say "mark rep" 3 times and verify counter increments
   - [ ] Say "end session: three calm sits" and verify activity logs

4. **Real-Time Sync**
   - [ ] Open web app on phone while in VR
   - [ ] Mark rep in VR, verify web app updates within 3s
   - [ ] Log activity in web app, verify VR updates within 3s

5. **Error Scenarios**
   - [ ] Disconnect network, verify offline indicator
   - [ ] Deny microphone, verify fallback to manual input
   - [ ] Say unrecognized command, verify no error shown

6. **Fallback Mode**
   - [ ] Load /vr on desktop browser
   - [ ] Verify 2D dashboard renders
   - [ ] Test all controls work in 2D mode

## Performance Considerations

### Frame Rate Optimization

- **Target**: 60 fps minimum, 90 fps ideal for Vision Pro
- **Geometry**: Use low-poly meshes (< 1000 triangles per panel)
- **Materials**: Prefer MeshBasicMaterial over MeshStandardMaterial
- **Textures**: Avoid textures where possible, use solid colors
- **Animations**: Limit to 4 simultaneous animations (Property 20)
- **Draw Calls**: Batch similar geometries to reduce draw calls

### Memory Management

- **Dispose Resources**: Clean up geometries, materials, and textures on unmount
- **Object Pooling**: Reuse 3D objects for activity feed items
- **Data Limiting**: Cap activity feed at 5 items, weekly chart at 7 bars
- **Texture Compression**: Use compressed texture formats if images needed

### Network Optimization

- **Polling Rate**: Limit to once per 3 seconds (Property 21)
- **Request Batching**: Fetch all VR data in single query
- **Caching**: Cache static data (dog name, breed) locally
- **Optimistic Updates**: Update UI immediately, sync with backend async

### Bundle Size

- **Code Splitting**: Lazy load VR route to avoid bloating main bundle
- **Tree Shaking**: Import only needed three.js modules
- **Dependencies**: Use @react-three/xr (lightweight) over heavier alternatives
- **Target**: Keep VR route bundle < 500KB gzipped

## Development Workflow

### Local Development

1. **Desktop Testing**: Use WebXR emulator browser extension for initial development
2. **Three.js Inspector**: Use browser DevTools for debugging 3D scene
3. **Mock Data**: Use Convex seed data for consistent testing
4. **Hot Reload**: Vite HMR works with react-three-fiber

### Vision Pro Testing

1. **HTTPS Setup**: Use ngrok or Netlify deploy previews for HTTPS
2. **Remote Debugging**: Use Safari Web Inspector connected to Vision Pro
3. **Performance Profiling**: Use Safari Timeline to monitor frame rate
4. **Input Testing**: Test gaze-and-pinch with actual Vision Pro hardware

### Deployment

1. **Build**: `npm run build` creates production bundle
2. **Deploy**: Netlify automatically deploys on push to main
3. **HTTPS**: Netlify provides automatic HTTPS
4. **Testing**: Test on actual Vision Pro before demo

## Dependencies

### New Dependencies

```json
{
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.92.0",
  "@react-three/xr": "^6.2.0",
  "three": "^0.160.0",
  "fast-check": "^3.15.0"
}
```

### Existing Dependencies (Reused)

- `react`: ^18.2.0
- `@tanstack/react-router`: For routing
- `convex`: For real-time backend
- `typescript`: For type safety
- `tailwindcss`: For 2D fallback UI

## Implementation Notes

### WebXR Browser Support

- **Vision Pro**: Safari 17.4+ with visionOS 1.1+
- **Desktop**: Chrome/Edge with WebXR emulator extension
- **Mobile**: Not supported (use 2D fallback)

### Voice Recognition Limitations

- **Language**: English only for v1
- **Accuracy**: Depends on ambient noise and microphone quality
- **Latency**: 500ms-2s typical for Web Speech API
- **Fallback**: Always provide manual text input option

### Real-Time Sync Strategy

For hackathon demo, use 3-second polling as reliable baseline:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // Refetch all VR data
    refetchVRData();
  }, 3000);
  
  return () => clearInterval(interval);
}, []);
```

Future optimization: Upgrade to Convex WebSocket subscriptions for sub-second updates.

### Gaze-and-Pinch Implementation

Vision Pro uses "transient-pointer" input mode:

```typescript
// In XR session
session.addEventListener('select', (event) => {
  const inputSource = event.inputSource;
  
  if (inputSource.targetRayMode === 'gaze') {
    // Get ray from gaze direction
    const ray = new THREE.Ray();
    const targetRaySpace = inputSource.targetRaySpace;
    
    // Raycast to find intersections
    const intersects = raycaster.intersectObjects(interactiveObjects);
    
    if (intersects.length > 0) {
      const object = intersects[0].object;
      if (object.userData.onClick) {
        object.userData.onClick();
      }
    }
  }
});
```

### 3D Text Rendering

Use @react-three/drei's Text component for performant 3D text:

```typescript
import { Text } from '@react-three/drei';

<Text
  position={[0, 0, 0]}
  fontSize={0.2}
  color="#f9dca0"
  anchorX="center"
  anchorY="middle"
>
  {dogName}
</Text>
```

### Panel Layout Positions

Recommended positions for comfortable viewing:

```typescript
const PANEL_LAYOUT: PanelLayout = {
  dogProfile: [0, 0.5, -1.5],      // Center top
  statOrbs: [-0.8, 0, -1.5],       // Left
  goals: [0.8, 0.3, -1.5],         // Right top
  activities: [0.8, -0.3, -1.5],   // Right bottom
  weeklyChart: [0, -0.5, -1.5],    // Center bottom
  sessionControls: [0, 0, -1.2],   // Center (when active)
};
```

## Future Enhancements

### Phase 2 (Post-Hackathon)

- **Spatial Audio**: Add sound effects for rep marking, level-ups
- **Hand Tracking**: Use hand gestures for more natural interaction
- **Multi-Window**: Support multiple floating windows in Vision Pro
- **Persistent Layout**: Remember user's preferred panel positions
- **Voice Feedback**: Text-to-speech confirmation of commands
- **Offline Mode**: Cache data for offline VR sessions

### Phase 3 (Long-Term)

- **Shared VR Sessions**: Multiple users in same VR space
- **3D Dog Avatar**: Animated 3D model of dog in VR
- **Training Visualizations**: 3D charts and progress graphs
- **AR Mode**: Mixed reality with real-world passthrough
- **Gesture Training**: Demonstrate training gestures in VR
- **AI Coach Avatar**: Virtual trainer providing real-time guidance
