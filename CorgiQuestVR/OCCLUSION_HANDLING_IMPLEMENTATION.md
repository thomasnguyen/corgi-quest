# Occlusion Handling Implementation

## Overview
This document describes the implementation of occlusion handling for the VR advanced features, which allows panels to automatically reposition themselves to avoid being blocked by real-world objects detected by the Vision Pro.

## Requirements
- **Requirement 4.5**: WHEN real-world objects are detected THEN the system SHALL reposition panels to avoid occlusion

## Architecture

### Components

#### 1. OcclusionHandler (`Positioning/OcclusionHandler.swift`)
Handles detection and avoidance of real-world occlusions for VR panels.

**Key Features:**
- Processes mesh anchors from ARKit's WorldTrackingProvider
- Calculates bounding box intersections between panels and real-world surfaces
- Finds safe positions for occluded panels using multiple repositioning strategies
- Applies smooth interpolation for gradual repositioning

**Key Methods:**
- `updateMeshAnchors(_ anchors: [ARAnchor])` - Updates the list of detected mesh anchors
- `isOccluded(position:panelSize:)` - Checks if a panel would be occluded at a given position
- `findSafePosition(from:panelSize:)` - Finds a safe position that avoids occlusion
- `applySmoothRepositioning(from:to:)` - Applies smooth interpolation for transitions

**Repositioning Strategies:**
The handler tries multiple strategies in order of preference:
1. Move up (0.2m)
2. Move down (0.2m)
3. Move right (0.2m)
4. Move left (0.2m)
5. Move closer (0.2m)
6. Move further (0.2m)
7. Move diagonal up-right (0.15m)
8. Move diagonal up-left (0.15m)
9. Fallback: Move significantly further back (0.5m)

**Overlap Threshold:**
- Panels are considered occluded if they overlap with a mesh by more than 10% of their area
- Minimum distance from mesh surfaces: 15cm

#### 2. AdaptivePositioner Integration
The `AdaptivePositioner` class has been extended to integrate occlusion handling:

**New Properties:**
- `occlusionHandler: OcclusionHandler` - Handles occlusion detection and avoidance
- `panelSizes: [PanelIdentifier: SIMD3<Float>]` - Default panel dimensions for collision detection
- `targetPositions: [PanelIdentifier: SIMD3<Float>]` - Target positions for smooth repositioning

**New Methods:**
- `updateMeshAnchors(_ anchors: [ARAnchor])` - Updates mesh anchors and checks for occlusions
- `updateOcclusionAvoidance()` - Updates panel positions with smooth transitions
- `avoidOcclusion(panel:at:)` - Manually repositions a specific panel
- `clearMeshAnchors()` - Clears all mesh anchor data
- `meshAnchorCount: Int` - Gets the number of tracked mesh anchors

#### 3. TrainingRoomView Integration
The main VR view has been updated to support world tracking:

**New Properties:**
- `worldTrackingSession: ARKitSession?` - ARKit session for world tracking
- `worldTrackingProvider: WorldTrackingProvider?` - Provider for mesh anchor updates

**New Methods:**
- `startWorldTracking()` - Initializes ARKit session and world tracking provider
- `monitorMeshAnchors(provider:)` - Monitors mesh anchor updates in real-time
- `stopWorldTracking()` - Stops world tracking and cleans up resources

**Lifecycle:**
- World tracking starts in `onAppear` after hand tracking initialization
- Mesh anchors are monitored continuously via async stream
- Updates are applied to `adaptivePositioner` on the main actor
- World tracking stops in `onDisappear` with cleanup

## Data Flow

1. **Mesh Detection:**
   - ARKit's WorldTrackingProvider detects real-world surfaces
   - Mesh anchors are provided via async stream

2. **Update Processing:**
   - `TrainingRoomView.monitorMeshAnchors()` receives anchor updates
   - Updates are passed to `AdaptivePositioner.updateMeshAnchors()`

3. **Occlusion Detection:**
   - `OcclusionHandler` calculates bounding box intersections
   - Panels with >10% overlap are marked for repositioning

4. **Repositioning:**
   - Safe positions are found using multiple strategies
   - Target positions are stored for smooth interpolation
   - `updateOcclusionAvoidance()` applies gradual movement each frame

5. **Rendering:**
   - Updated panel transforms are applied in `positionAttachments()`
   - Smooth animations are applied via SwiftUI's animation system

## Performance Considerations

- **Smooth Transitions:** Maximum repositioning delta of 5cm per frame prevents jarring movements
- **Efficient Detection:** Bounding box calculations are optimized for real-time performance
- **Strategy Ordering:** Most common repositioning strategies are tried first
- **Cleanup:** Mesh anchors are cleared when exiting VR mode to free memory

## Testing

To test occlusion handling:

1. **Enable World Tracking:**
   - Ensure device supports WorldTrackingProvider (Vision Pro)
   - Grant world sensing authorization when prompted

2. **Trigger Occlusion:**
   - Position panels near real-world surfaces (walls, furniture)
   - Move closer to surfaces to trigger occlusion detection

3. **Verify Repositioning:**
   - Panels should smoothly move away from occluding surfaces
   - Movement should be gradual (not instant)
   - Panels should maintain readability after repositioning

4. **Check Performance:**
   - Frame rate should remain at 60fps minimum
   - No stuttering during repositioning
   - Smooth transitions even with multiple panels repositioning

## Future Enhancements

- **Predictive Repositioning:** Anticipate occlusions before they occur based on user movement
- **User Preferences:** Allow users to set preferred repositioning directions
- **Occlusion Visualization:** Show debug overlays of detected mesh anchors
- **Adaptive Strategies:** Learn user's space layout and optimize repositioning strategies
- **Multi-Panel Coordination:** Ensure repositioned panels don't collide with each other

## Related Files

- `CorgiQuestVR/Positioning/OcclusionHandler.swift` - Core occlusion detection and avoidance
- `CorgiQuestVR/Positioning/AdaptivePositioner.swift` - Integration with adaptive positioning
- `CorgiQuestVR/Views/TrainingRoomView.swift` - World tracking setup and monitoring
- `.kiro/specs/vr-advanced-features/requirements.md` - Original requirements
- `.kiro/specs/vr-advanced-features/design.md` - Design specifications

## Implementation Status

✅ OcclusionHandler class created with full functionality
✅ AdaptivePositioner integration complete
✅ TrainingRoomView world tracking setup complete
✅ Smooth transition animations implemented
✅ Documentation complete

**Task 4.2 Complete:** All requirements for occlusion handling have been implemented.
