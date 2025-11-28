# Spatial Audio Implementation

## Overview

The VR training HUD now includes spatial audio feedback that provides 3D positioned sound cues during training sessions. This enhances immersion and allows users to understand what's happening without looking directly at panels.

## Implementation Details

### Components

#### 1. SpatialAudioManager (`Audio/SpatialAudioManager.swift`)

The core audio management class that handles:
- AVAudioEngine setup and configuration
- AVAudioEnvironmentNode for 3D positioning
- Audio file loading and buffering
- Distance-based volume attenuation
- Spatial sound playback

**Key Features:**
- Inverse distance attenuation model
- Configurable max distance (5.0m) and reference distance (1.0m)
- Automatic cleanup of completed audio players
- Support for multiple simultaneous sounds

#### 2. Audio Event Triggers

Integrated into `TrainingRoomViewModel`:
- **Stat Fill Completion**: Plays "whoosh" sound when a stat ring fills to 100%
- **Goal Completion**: Plays "chime" sound when physical or mental goals reach 100%
- **Session End**: Plays "fanfare" sound when a training session completes

### Sound Types

| Sound Type | File | Duration | Purpose | Volume |
|------------|------|----------|---------|--------|
| `statFill` | whoosh.wav | 0.5s | Stat ring completion | 70% |
| `goalComplete` | chime.wav | 1.0s | Goal reaches 100% | 80% |
| `sessionEnd` | fanfare.wav | 2.0s | Training session ends | 90% |
| `levelUp` | levelup.wav | 1.5s | Stat levels up | 85% |

### Panel Positions

Audio is positioned at the 3D location of each panel:

```swift
- Left Panel (Stats): (-0.5, 0.0, -1.0)
- Top Panel (Goals): (0.0, 0.25, -1.0)
- Right Panel (Activities): (0.5, 0.0, -1.0)
- Bottom Panel (Chart): (0.0, -0.2, -1.0)
- Center Panel (Session): (0.0, 0.0, -0.8)
```

### Volume Calculation

Volume is adjusted based on distance from the listener (user's head):

```
if distance <= referenceDistance (1.0m):
    volume = 1.0 (full volume)
else if distance >= maxDistance (5.0m):
    volume = 0.0 (silent)
else:
    volume = referenceDistance / (referenceDistance + rolloffFactor * (distance - referenceDistance))
```

## Integration Points

### 1. ViewModel Initialization

```swift
init(networkService: NetworkService = NetworkService()) {
    self.networkService = networkService
    self.audioManager = SpatialAudioManager()
    audioManager.loadSounds()
}
```

### 2. Stat Completion Detection

```swift
private func checkStatCompletion(newStats: [StatData]) {
    for stat in newStats {
        if currentXP > previousXP && stat.xpProgress >= 1.0 {
            let position = panelPosition(for: stat.type)
            audioManager.playSound(.statFill, at: position)
        }
    }
}
```

### 3. Goal Completion Detection

```swift
private func checkGoalCompletion(newGoals: GoalData) {
    if newGoals.physical.progress >= 1.0 && previousPhysicalProgress < 1.0 {
        let position = panelPosition(for: "goals")
        audioManager.playSound(.goalComplete, at: position)
    }
}
```

### 4. Session End Trigger

```swift
private func handleEndSession(description: String) {
    viewModel.playSessionEndSound()
    // ... rest of session end logic
}
```

## Requirements Validation

### Requirement 1.1 ✅
**WHEN a stat ring fills to completion THEN the system SHALL play a soft "whoosh" sound positioned at the stat panel's 3D location**

Implemented in `checkStatCompletion()` - detects when `xpProgress >= 1.0` and plays whoosh sound at left panel position.

### Requirement 1.2 ✅
**WHEN a goal progress bar reaches 100% THEN the system SHALL play a success chime positioned at the goals panel's 3D location**

Implemented in `checkGoalCompletion()` - detects when `progress >= 1.0` and plays chime sound at top panel position.

### Requirement 1.3 ✅
**WHEN a training session ends THEN the system SHALL play a completion sound positioned at the center panel's location**

Implemented in `handleEndSession()` - calls `playSessionEndSound()` which plays fanfare at center panel position.

### Requirement 1.4 ✅
**WHEN audio plays THEN the system SHALL adjust volume based on distance from the user's head position**

Implemented in `adjustVolume()` method using inverse distance attenuation formula.

### Requirement 1.5 ✅
**WHEN multiple sounds trigger simultaneously THEN the system SHALL mix them without clipping or distortion**

Handled by AVAudioEngine's built-in mixing capabilities. Each sound uses a separate AVAudioPlayerNode connected to the environment node, which connects to the main mixer.

## Testing

### Manual Testing Steps

1. **Stat Fill Sound**:
   - Log activities that increase stat XP
   - Wait for stat to reach 100% progress
   - Verify whoosh sound plays from left side

2. **Goal Completion Sound**:
   - Complete physical or mental goals
   - Verify chime sound plays from above

3. **Session End Sound**:
   - Start a training session
   - End the session
   - Verify fanfare sound plays from center

4. **Distance Attenuation**:
   - Move head closer/farther from panels
   - Verify volume changes appropriately

5. **Multiple Sounds**:
   - Trigger multiple events simultaneously
   - Verify sounds mix cleanly without distortion

### Known Limitations

1. **Audio Files Not Included**: The actual .wav files need to be added to the Xcode project. See `Audio/README.md` for specifications.

2. **Simulator Testing**: Spatial audio may not work correctly in the iOS Simulator. Test on actual Vision Pro hardware.

3. **Head Position Tracking**: Currently uses static panel positions. Future enhancement could track actual panel positions in 3D space.

## Future Enhancements

1. **Dynamic Panel Tracking**: Update audio positions when panels move (adaptive positioning)
2. **Haptic Feedback**: Add haptic feedback alongside audio cues
3. **Audio Ducking**: Lower background audio when voice commands are active
4. **Reverb Effects**: Add environmental reverb based on room size
5. **User Preferences**: Allow users to adjust volume levels or disable audio

## Dependencies

- AVFoundation framework
- simd library (for 3D vector math)
- Existing VR app architecture (ViewModels, Models, Views)

## Files Modified

- `CorgiQuestVR/ViewModels/TrainingRoomViewModel.swift` - Added audio manager and event detection
- `CorgiQuestVR/Views/TrainingRoomView.swift` - Added session end sound trigger
- `CorgiQuestVR/Views/FloatingPanelsView.swift` - Added SessionSummaryView component

## Files Created

- `CorgiQuestVR/Audio/SpatialAudioManager.swift` - Core audio management
- `CorgiQuestVR/Audio/README.md` - Audio asset specifications
- `CorgiQuestVR/SPATIAL_AUDIO_IMPLEMENTATION.md` - This documentation
