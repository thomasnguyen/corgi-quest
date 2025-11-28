# Context-Aware Positioning Implementation

## Overview

This document describes the implementation of context-aware panel positioning for the Corgi Quest VR training HUD. The system intelligently repositions panels based on training session state to optimize the user experience.

## Requirements Addressed

- **4.2**: Bring session panel to center when training starts
- **4.3**: Fade out irrelevant panels during active session
- **4.4**: Reset positions when user looks away (session ends)

## Architecture

### AdaptivePositioner Class

Located in `CorgiQuestVR/Positioning/AdaptivePositioner.swift`

The `AdaptivePositioner` is an `ObservableObject` that manages panel transforms and opacities based on the current training context.

#### Key Features

1. **Panel Transforms**: Manages position, rotation, and scale for each panel
2. **Panel Opacities**: Controls visibility of panels (1.0 = fully visible, 0.3 = faded)
3. **Context Awareness**: Tracks whether the system is in training mode

#### Panel Identifiers

```swift
enum PanelIdentifier {
    case stats      // Left panel with stat orbs
    case goals      // Top panel with daily goals
    case activities // Right panel with recent activities
    case chart      // Bottom panel with weekly XP chart
    case session    // Center panel during training
}
```

### Positioning Modes

#### Default Mode (Minimal View)

All panels are positioned at their default locations with full opacity:

- Stats: Left side (-0.5, 0.0, -1.0)
- Goals: Top center (0.0, 0.25, -1.0)
- Activities: Right side (0.5, 0.0, -1.0)
- Chart: Bottom center (0.0, -0.2, -1.0)
- Session: Center (0.0, 0.0, -0.8)

#### Training Mode (Active Session)

When training starts, the system automatically:

1. **Brings session panel forward**: Moves to (0.0, 0.0, -0.7) and scales to 1.15x
2. **Fades background panels**: Reduces opacity to 0.3 (30%)
3. **Moves panels to periphery**: Shifts other panels further back (-1.2 on z-axis)
4. **Scales down background panels**: Reduces to 0.85x scale

This creates a focused training experience where the session panel is prominent and other information is de-emphasized but still visible.

## Integration with TrainingRoomView

### Initialization

```swift
@StateObject private var adaptivePositioner = AdaptivePositioner()
```

### Training Session Start

When a training session starts (via button or voice command):

```swift
private func startTrainingSession() {
    // ... create session data ...
    
    // Activate context-aware positioning
    adaptivePositioner.activateTrainingMode()
    
    viewState = .training(sessionData)
}
```

### Training Session End

When a training session ends:

```swift
private func handleEndSession(description: String) {
    // ... process session ...
    
    // Deactivate context-aware positioning
    adaptivePositioner.deactivateTrainingMode()
    
    viewState = .summary(summary)
}
```

### Return to Minimal View

When returning to the minimal view from summary:

```swift
private func returnToMinimal() {
    // Reset panels to default positions
    adaptivePositioner.deactivateTrainingMode()
    
    viewState = .minimal
}
```

### Applying Transforms

In the `positionAttachments` method, the adaptive transforms are applied:

```swift
let adaptiveTransform = adaptivePositioner.getTransform(for: .session)
let adaptiveOpacity = adaptivePositioner.getOpacity(for: .session)

// Apply position, scale, and opacity
sessionAttachment.position = basePosition + adaptiveTransform.position
sessionAttachment.scale = baseScale * adaptiveTransform.scale
sessionAttachment.components[OpacityComponent.self] = OpacityComponent(opacity: adaptiveOpacity)
```

## Animation

All position and opacity changes are animated using SwiftUI's spring animation:

```swift
withAnimation(.spring(response: 0.8, dampingFraction: 0.75)) {
    // Update transforms and opacities
}
```

This provides smooth, natural transitions between states.

## Future Enhancements

### Gaze-Based Positioning (Requirement 4.1)

The `updateForGaze(direction:)` method is a placeholder for future gaze-based positioning:

```swift
func updateForGaze(direction gazeDirection: SIMD3<Float>) {
    // Future: Use ARKit gaze tracking to bring panels closer when gazed at
}
```

This would require:
1. ARKit gaze tracking integration
2. Ray-panel intersection detection
3. Smooth interpolation when gaze changes

### Occlusion Handling (Requirement 4.5)

Future implementation would detect real-world objects and reposition panels to avoid occlusion:

```swift
func avoidOcclusion(with meshAnchors: [MeshAnchor]) {
    // Detect panel-mesh intersections
    // Reposition panels to visible areas
}
```

## Testing

The implementation can be tested by:

1. Starting a training session and observing the session panel move to center
2. Verifying that other panels fade to 30% opacity
3. Ending the session and confirming panels return to default positions
4. Checking that animations are smooth and natural

## Performance Considerations

- All transforms are computed once per state change, not per frame
- Animations use SwiftUI's optimized spring animation system
- Opacity changes use RealityKit's `OpacityComponent` for efficient rendering
- No continuous updates unless state changes

## Conclusion

The context-aware positioning system successfully implements requirements 4.2, 4.3, and 4.4, providing an intelligent, adaptive UI that enhances the training experience by focusing attention on relevant information while keeping other data accessible.
