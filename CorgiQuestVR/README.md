# Corgi Quest VR Training HUD

A visionOS companion app for Corgi Quest that provides an immersive training command center with real-time stats, voice-activated coaching, and hands-free controls.

## Requirements

- Xcode 15.2 or later
- visionOS 1.0 SDK or later
- Apple Vision Pro device or simulator
- Active Corgi Quest backend (TanStack Start + Convex)

## Project Structure

```
CorgiQuestVR/
├── CorgiQuestVR/
│   ├── Views/              # SwiftUI views and UI components
│   ├── ViewModels/         # State management and business logic
│   ├── Models/             # Data models and structures
│   ├── Services/           # Network and external services
│   ├── Assets.xcassets/    # Images and assets
│   ├── CorgiQuestVRApp.swift  # App entry point
│   └── Info.plist          # App configuration
├── Packages/
│   └── RealityKitContent/  # 3D assets and RealityKit content
└── CorgiQuestVR.xcodeproj  # Xcode project file
```

## Getting Started

### 1. Open the Project

```bash
# From the mono-repo root
open CorgiQuestVR/CorgiQuestVR.xcodeproj
```

### 2. Configure Backend URL

Update the API base URL in `Services/NetworkService.swift` to point to your running backend:

```swift
// For local development
private let baseURL = "http://localhost:3000"

// For production
private let baseURL = "https://your-app.netlify.app"
```

### 3. Build and Run

1. Select the visionOS simulator or device as the target
2. Press `Cmd + R` to build and run
3. Grant microphone permissions when prompted

## Features

- **Immersive Training Room**: 3D environment with floating UI panels
- **Real-Time Stats**: Live PHY, INT, IMP, SOC stat orbs with XP progress
- **Voice Commands**: Hands-free control with "Coach mode", "Mark rep", "End session"
- **Today's Goals**: Physical and mental training progress with streak tracking
- **Activity Feed**: Recent training events synced with web app
- **Weekly Chart**: 7-day XP visualization using Swift Charts

## Voice Commands

- **"Coach mode: [activity]"** - Start a guided training session
- **"Mark rep"** - Increment rep counter during active session
- **"End session: [description]"** - Complete session and log activity

## Development

### Adding New Views

Place SwiftUI views in `CorgiQuestVR/Views/`:
- `TrainingRoomView.swift` - Main immersive space
- `FloatingPanelsView.swift` - UI overlay
- `StatOrbsPanel.swift` - Stat display components

### Adding ViewModels

Place view models in `CorgiQuestVR/ViewModels/`:
- `TrainingRoomViewModel.swift` - Main state management
- Use `@Published` properties for reactive updates
- Use `@MainActor` for UI updates

### Adding Models

Place data models in `CorgiQuestVR/Models/`:
- `StatData.swift` - Stat orb data structure
- `GoalData.swift` - Daily goals structure
- `ActivityData.swift` - Training activity structure

### Adding Services

Place services in `CorgiQuestVR/Services/`:
- `NetworkService.swift` - API communication
- `VoiceCommandHandler.swift` - Speech recognition

## API Endpoints

The app communicates with these backend endpoints:

- `GET /api/vr-status` - Fetch complete dog training status
- `POST /api/voice-log` - Submit voice transcript for parsing

## Troubleshooting

### Microphone Permission Denied
1. Open Settings on Vision Pro
2. Navigate to Privacy & Security → Microphone
3. Enable microphone access for Corgi Quest VR

### Connection Issues
- Ensure the backend is running and accessible
- Check the base URL in `NetworkService.swift`
- Verify network connectivity on Vision Pro

### Build Errors
- Clean build folder: `Cmd + Shift + K`
- Reset package cache: `File → Packages → Reset Package Caches`
- Restart Xcode

## Architecture

The app follows MVVM architecture:
- **Views**: SwiftUI components for UI
- **ViewModels**: State management with Combine
- **Models**: Data structures conforming to Codable
- **Services**: Network layer and external integrations

Real-time updates are achieved through polling the `/api/vr-status` endpoint every 3 seconds.

## Performance

- Target: 60+ fps in immersive space
- Polling interval: 3 seconds
- Request timeout: 5 seconds
- Lightweight materials for optimal rendering

## License

Part of the Corgi Quest project.
