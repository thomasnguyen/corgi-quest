# Corgi Quest VR - Complete Feature List

## 🎮 Platform
- **Apple Vision Pro** - Immersive mixed reality training environment
- **visionOS 1.0+** - Native Vision Pro app built with SwiftUI & RealityKit

---

## 🌍 Immersive Environment

### Skyrim-Inspired Training Hall
- **Stone Floor** - Medieval dungeon/hall aesthetic with rough stone texture
- **Warm Torchlight** - Ambient orange lighting simulating flickering torches
- **Four Corner Torches** - Point lights positioned around the room for atmospheric lighting
- **Stone Pillars** - Four cylindrical pillars at corners creating medieval hall feel
- **Central Pedestal** - Circular platform where your dog would stand during training
- **Head-Locked UI** - All panels follow your gaze for comfortable viewing

---

## 📊 Real-Time Data Display

### 1. Dog Info Card (Top Center)
- **Dog Name** - Golden gradient text matching web UI style
- **Level Display** - Current level with star icon
- **Streak Badge** - Fire emoji with day count (only shown if streak > 0)
- **Compact Design** - All info in one sleek capsule panel

### 2. XP Progress Bar (Below Dog Info)
- **Current/Max XP** - Shows progress toward next level (e.g., "450/600")
- **Golden Progress Fill** - Gradient fill matching web UI
- **Real-Time Updates** - Animates when XP increases

### 3. Four Stat Orbs (Available in Stats View)
- **PHY (Physical)** - Red circular progress ring
- **INT (Intelligence)** - Blue circular progress ring
- **IMP (Impulse Control)** - Purple circular progress ring
- **SOC (Socialization)** - Green circular progress ring
- **Animated Progress** - Rings fill as XP increases
- **Pulse Animation** - Orbs pulse when XP is gained
- **Level Display** - Each stat shows its individual level

### 4. Today's Goals Panel (Stats View)
- **Physical Goal** - Progress bar (e.g., "2/3 activities")
- **Mental Goal** - Progress bar (e.g., "1/2 activities")
- **Streak Display** - Fire emoji with day count and motivational text
- **Progress Gradients** - Red-to-orange for physical, blue-to-cyan for mental

### 5. Recent Activities Feed (Stats View)
- **Last 5 Activities** - Shows most recent training sessions
- **XP Breakdown** - Color-coded badges for each stat gain (e.g., "+15 PHY")
- **Timestamps** - Relative time display (e.g., "5 min ago")
- **Logged By** - Shows who logged it (VR, Mobile, web)
- **Real-Time Updates** - Animates when new activities appear

### 6. Weekly XP Chart (Stats View)
- **7-Day Bar Chart** - Last 7 days of XP totals using Swift Charts
- **Animated Bars** - Smooth animation when data loads/updates
- **Day Labels** - Mon, Tue, Wed, etc.
- **Gradient Bars** - Blue-to-cyan gradient

---

## 🎯 Training Session Features

### Session Panel (Left Side During Training)
- **Activity Name** - Large, prominent display (e.g., "Leash Training")
- **Goal Description** - What you're aiming for (e.g., "5 calm reps")
- **Elapsed Timer** - Live countdown showing session duration (MM:SS)
- **Rep Counter** - HUGE display showing progress (e.g., "3 / 5")
- **Bonus Indicator** - Shows "BONUS! 🎉" when target exceeded
- **Training Tips** - Context-specific tips for the activity
- **Micro-Suggestions** - Real-time encouragement (e.g., "Great rep! Keep going!")
- **Mark Rep Button** - Skyrim-style golden button to log each repetition
- **End Session Button** - Complete the training session
- **Debounce Protection** - 500ms cooldown prevents accidental double-taps

### Session Summary (After Training)
- **Celebration Header** - "🎉 TRAINING COMPLETE! 🎉"
- **Activity Name** - What you just completed
- **Duration** - Total time elapsed (MM:SS)
- **Reps Completed** - Final count vs. target (e.g., "7/5" for bonus reps)
- **XP Earned Breakdown** - Individual stat gains with icons
- **Total XP** - Sum of all XP awarded
- **Color-Coded Badges** - Each stat has its themed color
- **Done Button** - Returns to main view

---

## 🎤 Voice Commands (Built-In, Currently Disabled)

### Supported Commands:
1. **"Coach mode: [activity]"** - Start a new training session
   - Example: "Coach mode: Leave It"
   - Launches session panel with activity-specific tips

2. **"Mark rep"** - Increment rep counter during training
   - Hands-free rep tracking
   - Debounced to prevent double-counting

3. **"End session: [description]"** - Complete training
   - Example: "End session: completed 5 reps"
   - Shows session summary with XP breakdown

### Voice System Features:
- **Real-Time Transcription** - Uses Apple Speech Recognition
- **Pattern Matching** - Regex-based command parsing
- **Partial Results** - Live feedback as you speak
- **Error Handling** - Permission checks and fallback messages
- **Case Insensitive** - Commands work in any case

**Note:** Voice commands currently disabled in simulator to avoid permission hang issues.

---

## 🎨 UI/UX Features

### Skyrim-Inspired Design System:
- **Golden Gradients** - Buttons and text use warm gold/tan gradients (#FEEFD0 → #FCD587)
- **Brown Leather Backgrounds** - Buttons have brown leather texture (#B38971 → #5F5553)
- **Golden Borders** - 3px strokes in #F9DCA0
- **Ultra-Thin Material** - Frosted glass panels with blur
- **Serif Typography** - Fantasy RPG-style fonts
- **Shadow Effects** - Glows and depth for 3D feel

### Interactive Elements:
- **Spring Animations** - Smooth, bouncy transitions (0.3s response, 0.7 damping)
- **Scale Effects** - Buttons pulse on press
- **Fade Transitions** - Panels smoothly appear/disappear
- **Color Feedback** - Stats glow when XP is gained

### XP Notification Popups (Upper Right):
- **Floating Badges** - "+15 PHY XP" appears when stats increase
- **Color-Coded** - Matches stat color (red for PHY, blue for INT, etc.)
- **Auto-Dismiss** - Fades out after 3 seconds
- **Stacked Display** - Multiple notifications stack vertically
- **Glow Effects** - Colored shadows matching stat type

---

## 📱 API Integration

### Network Service:
- **Base URL Configuration** - Supports dev (localhost) and production (Netlify)
- **Mock Data Mode** - Built-in fallback with realistic demo data
- **Automatic Retry** - 3 attempts with exponential backoff (1s, 2s, 4s)
- **5-Second Timeout** - Fast failure for poor connections
- **Error Handling** - User-friendly error messages

### API Endpoints:
1. **GET /api/vr-status**
   - Fetches complete dog profile, stats, goals, activities, weekly XP
   - Returns `VRDogStatus` struct

2. **POST /api/voice-log**
   - Submits voice transcripts for AI parsing
   - Returns XP awarded and activity ID

### Real-Time Polling:
- **3-Second Intervals** - Polls for updates during active sessions
- **Automatic Start/Stop** - Begins on view appear, stops on disappear
- **Data Diffing** - Detects XP changes and shows notifications

### Mock Data (Current Mode):
- **Buddy** - Demo dog at Level 12 with 450/600 XP
- **4 Stats** - PHY (Lv 10), INT (Lv 8), IMP (Lv 15), SOC (Lv 6)
- **Goals** - Physical 2/3, Mental 1/2, 7-day streak
- **5 Activities** - Pre-loaded activity feed with timestamps
- **Weekly Chart** - 7 days of XP data (Mon-Sun)

---

## 🎬 View States & Navigation

### Three Main States:

1. **Minimal View (Default)**
   - Dog info + XP bar at top
   - Two action buttons at bottom:
     - "START TRAINING" - Launches session
     - "VIEW STATS" - Opens full stats overlay

2. **Stats View (Full Overlay)**
   - Complete statistics screen with:
     - 4 stat orbs in grid layout
     - Weekly XP chart
     - Today's goals with streak
     - Recent activities (last 2 shown)
   - Close button returns to minimal view

3. **Training View (Active Session)**
   - Dog info + XP bar remain at top
   - Session panel appears on left side
   - Buttons hidden during training
   - Real-time timer and rep counter
   - Mark Rep and End Session actions

4. **Summary View (Post-Training)**
   - Full-screen celebration overlay
   - Session stats and XP breakdown
   - Done button returns to minimal view

---

## 🏗️ Architecture

### MVVM Pattern:
- **Views** - SwiftUI components (TrainingRoomView, FloatingPanelsView)
- **ViewModels** - TrainingRoomViewModel with @Published properties
- **Models** - Codable structs (VRDogStatus, SessionData, StatData, etc.)
- **Services** - NetworkService, VoiceCommandHandler

### State Management:
- **@StateObject** - ViewModel persists across view updates
- **@Published** - Auto-updates UI when data changes
- **Combine** - Reactive data flow
- **Timer.publish** - Real-time updates for session timer and polling

### RealityKit Integration:
- **RealityView** - Main 3D container
- **Attachments** - 2D SwiftUI views in 3D space
- **AnchorEntity** - Head-locked positioning
- **ModelEntity** - 3D environment objects (floor, pillars, pedestal)
- **PointLight** - Dynamic lighting system

---

## 🎯 Performance & Optimization

### Target Performance:
- **60+ FPS** - Smooth rendering in immersive space
- **3-Second Polling** - Balance between real-time and battery life
- **5-Second Timeout** - Fast API response or graceful fallback
- **Lightweight Materials** - Ultra-thin frosted glass for optimal rendering

### Memory Management:
- **Weak Self** - Prevents retain cycles in closures
- **@MainActor** - UI updates on main thread
- **Debouncing** - 500ms cooldown for rep marking
- **Auto-cleanup** - ViewModel stops polling on deinit

---

## 🔐 Permissions Required

- **Microphone** - For voice command recognition (if enabled)
- **Speech Recognition** - For parsing voice commands (if enabled)

---

## 🚀 Quick Start Guide

1. **Launch App** - Opens to window with "Enter Training Room" button
2. **Auto-Enter** - Automatically launches immersive space
3. **Minimal View** - See dog name, level, streak, XP bar
4. **View Stats** - Tap to see full dashboard overlay
5. **Start Training** - Tap to begin a session
6. **Mark Reps** - Track progress during training
7. **End Session** - See summary and XP earned
8. **Real-Time Sync** - All changes appear within 3 seconds

---

## 📦 Technical Stack

- **SwiftUI** - Declarative UI framework
- **RealityKit** - 3D rendering engine
- **visionOS SDK** - Vision Pro platform APIs
- **Swift Charts** - Native charting framework
- **Combine** - Reactive programming
- **Speech Framework** - Voice recognition
- **AVFoundation** - Audio engine
- **URLSession** - Network requests

---

## 🎨 Color Palette

### Stat Colors:
- **PHY (Physical)** - Red (#FF0000)
- **INT (Intelligence)** - Blue (#0000FF)
- **IMP (Impulse Control)** - Purple (#800080)
- **SOC (Socialization)** - Green (#00FF00)

### UI Colors:
- **Golden Text** - #FEEFD0 → #FCD587
- **Leather Brown** - #B38971 → #5F5553
- **Golden Border** - #F9DCA0
- **Golden Accent** - #F5C35F
- **Dark Background** - #121216
- **Gray Border** - #3D3D3D

---

## 🐛 Known Limitations

1. **Voice Commands Disabled** - Currently disabled in simulator to avoid microphone permission hangs
2. **Mock Data Only** - Using mock data mode due to network proxy on work laptop
3. **No WebSocket** - Uses polling instead of WebSocket for real-time updates
4. **Text Rendering** - Dog name on pedestal uses placeholder (TextEntity not yet implemented)

---

## 🔮 Future Enhancements

- Real API integration for production use
- WebSocket support for true real-time updates
- Voice commands re-enabled for device testing
- Dog 3D model on pedestal
- Haptic feedback for rep marking
- Sound effects for XP gains
- Quest system with guided tutorials
- Multiplayer view showing partner's progress

---

**Last Updated:** November 2025
**Version:** 1.0 (Demo Build)
