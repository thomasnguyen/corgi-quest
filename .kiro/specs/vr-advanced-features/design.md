# Design Document

## Overview

This design extends the existing Corgi Quest VR training HUD with advanced spatial computing features. We'll leverage Vision Pro's spatial audio, hand tracking, and environmental understanding capabilities to create an immersive, interactive training experience that feels natural and responsive.

## Architecture

### Component Structure

```
VRAdvancedFeatures/
├── Audio/
│   ├── SpatialAudioManager.swift      # Manages 3D positioned audio
│   ├── SoundLibrary.swift             # Audio asset definitions
│   └── AudioMixer.swift               # Handles simultaneous sounds
├── Interactions/
│   ├── HandTrackingManager.swift      # Processes hand gestures
│   ├── GestureRecognizer.swift        # Detects tap, pinch, hover
│   └── PanelInteractionHandler.swift  # Responds to interactions
├── Effects/
│   ├── ParticleSystem.swift           # Particle emission and physics
│   ├── ParticleEmitter.swift          # Individual emitter configuration
│   └── CelebrationEffects.swift      # Level-up and goal celebrations
├── Positioning/
│   ├── AdaptivePositioner.swift       # Gaze-based panel positioning
│   ├── GazeTracker.swift              # Tracks user's gaze direction
│   └── OcclusionHandler.swift         # Handles real-world occlusion
└── Environment/
    ├── LightingAdapter.swift          # Adjusts to room lighting
    ├── ShadowRenderer.swift           # Renders panel shadows
    └── EnvironmentDetector.swift      # Detects indoor/outdoor
```

### Data Flow

1. **Audio Events**: UI events → SpatialAudioManager → AVAudioEngine → 3D positioned sound
2. **Hand Tracking**: ARKit hand data → GestureRecognizer → PanelInteractionHandler → UI updates
3. **Particles**: Level-up event → ParticleEmitter → ParticleSystem → RealityKit rendering
4. **Positioning**: Gaze data → AdaptivePositioner → Panel transforms → Smooth animation

## Components and Interfaces

### SpatialAudioManager

```swift
class SpatialAudioManager: ObservableObject {
    private let audioEngine: AVAudioEngine
    private let environment: AVAudioEnvironmentNode
    
    func playSound(_ sound: SoundType, at position: SIMD3<Float>, volume: Float)
    func adjustVolume(for position: SIMD3<Float>, userPosition: SIMD3<Float>) -> Float
    func stopAllSounds()
}

enum SoundType {
    case statFill      // Soft whoosh
    case goalComplete  // Success chime
    case sessionEnd    // Completion fanfare
    case levelUp       // Celebration sound
}
```

### HandTrackingManager

```swift
class HandTrackingManager: ObservableObject {
    @Published var leftHandPosition: SIMD3<Float>?
    @Published var rightHandPosition: SIMD3<Float>?
    @Published var detectedGesture: HandGesture?
    
    func startTracking()
    func stopTracking()
    func isHandNear(panel: PanelIdentifier, threshold: Float) -> Bool
}

enum HandGesture {
    case tap(position: SIMD3<Float>)
    case pinch(start: SIMD3<Float>, current: SIMD3<Float>)
    case hover(position: SIMD3<Float>)
    case dismiss
}
```

### ParticleSystem

```swift
class ParticleSystem {
    func emitParticles(
        count: Int,
        from position: SIMD3<Float>,
        color: Color,
        lifetime: TimeInterval,
        velocity: SIMD3<Float>
    )
    
    func update(deltaTime: TimeInterval)
    func clear()
}

struct Particle {
    var position: SIMD3<Float>
    var velocity: SIMD3<Float>
    var color: Color
    var alpha: Float
    var lifetime: TimeInterval
    var age: TimeInterval
}
```

### AdaptivePositioner

```swift
class AdaptivePositioner: ObservableObject {
    @Published var panelTransforms: [PanelIdentifier: Transform]
    
    func updateForGaze(direction: SIMD3<Float>)
    func bringToFront(panel: PanelIdentifier)
    func sendToPeriphery(panel: PanelIdentifier)
    func resetToDefaults()
    func avoidOcclusion(with meshAnchors: [MeshAnchor])
}

struct Transform {
    var position: SIMD3<Float>
    var rotation: simd_quatf
    var scale: Float
}
```

## Data Models

### Audio Configuration

```swift
struct AudioConfig {
    let maxDistance: Float = 5.0        // Max audible distance
    let referenceDistance: Float = 1.0  // Distance for full volume
    let rolloffFactor: Float = 1.0      // How quickly volume decreases
}

struct SoundAsset {
    let filename: String
    let duration: TimeInterval
    let baseVolume: Float
}
```

### Interaction State

```swift
struct InteractionState {
    var hoveredPanel: PanelIdentifier?
    var draggedPanel: PanelIdentifier?
    var dragOffset: SIMD3<Float>?
    var selectedStat: StatType?
}
```

### Particle Configuration

```swift
struct ParticleConfig {
    let count: Int = 25
    let lifetime: TimeInterval = 1.5
    let initialVelocity: SIMD3<Float> = [0, 0.5, 0]
    let spread: Float = 0.3
    let gravity: SIMD3<Float> = [0, -0.5, 0]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Audio Volume Distance Relationship
*For any* spatial audio event and user position, the volume should decrease monotonically as distance increases, reaching zero at max distance.
**Validates: Requirements 1.4**

### Property 2: Hand Hover Consistency
*For any* panel and hand position, if the hand is within threshold distance, the hover effect should be active; if outside threshold, hover should be inactive.
**Validates: Requirements 2.3, 2.4**

### Property 3: Particle Lifetime Bounds
*For any* emitted particle, its age should never exceed its configured lifetime, and alpha should decrease linearly from 1.0 to 0.0 over that lifetime.
**Validates: Requirements 3.4**

### Property 4: Panel Position Smoothness
*For any* adaptive positioning update, the panel's new position should be within a maximum delta from its previous position to ensure smooth motion.
**Validates: Requirements 4.1, 4.4**

### Property 5: Frame Rate Maintenance
*For any* combination of active features (audio + particles + hand tracking), the frame time should not exceed 16.67ms (60fps minimum).
**Validates: Requirements 6.1**

### Property 6: Gesture Recognition Latency
*For any* detected hand gesture, the time from gesture completion to UI response should not exceed 50ms.
**Validates: Requirements 6.4**

### Property 7: Occlusion Avoidance
*For any* detected mesh anchor (real-world surface), no panel should overlap with it by more than 10% of the panel's area.
**Validates: Requirements 4.5**

### Property 8: Audio Mixing Stability
*For any* set of simultaneous audio events (up to 5), the mixed output should not clip (exceed ±1.0 amplitude).
**Validates: Requirements 1.5**

## Error Handling

### Audio Errors
- **Audio engine fails to start**: Fall back to silent mode, log error, continue without audio
- **Sound file missing**: Use default beep sound, log warning
- **Audio session interrupted**: Pause audio, resume when session becomes active

### Hand Tracking Errors
- **Hand tracking unavailable**: Disable hand interactions, show message to user
- **Tracking lost temporarily**: Maintain last known state, resume when tracking returns
- **Gesture ambiguity**: Prioritize most recent gesture, ignore conflicting inputs

### Particle System Errors
- **Too many particles**: Cap at maximum count, drop oldest particles
- **Rendering performance drop**: Reduce particle count dynamically, simplify physics
- **Memory pressure**: Clear all particles immediately, disable until memory recovers

### Positioning Errors
- **Gaze tracking unavailable**: Use default panel positions, disable adaptive features
- **Occlusion mesh unavailable**: Skip occlusion handling, position panels normally
- **Invalid transform**: Clamp to valid ranges, log warning

## Testing Strategy

### Unit Tests
- Audio volume calculation at various distances
- Gesture recognition from hand position data
- Particle physics simulation step-by-step
- Transform interpolation for smooth positioning
- Occlusion detection with mock mesh data

### Property-Based Tests
We'll use Swift's built-in XCTest with custom property test helpers for randomized testing.

**Property Test 1: Audio Volume Monotonicity**
- Generate random user and sound positions
- Verify volume decreases as distance increases
- Test edge cases (zero distance, max distance, beyond max)

**Property Test 2: Hand Hover Threshold**
- Generate random hand and panel positions
- Verify hover state matches distance threshold
- Test boundary conditions (exactly at threshold)

**Property Test 3: Particle Alpha Decay**
- Generate random particle ages within lifetime
- Verify alpha = 1.0 - (age / lifetime)
- Test edge cases (age = 0, age = lifetime)

**Property Test 4: Position Delta Bounds**
- Generate random position updates
- Verify delta never exceeds maximum
- Test rapid successive updates

**Property Test 5: Frame Time Budget**
- Simulate various feature combinations
- Verify total frame time stays under 16.67ms
- Test worst-case scenarios (all features active)

### Integration Tests
- Full audio playback with spatial positioning
- Hand gesture triggering UI changes
- Particle emission on level-up events
- Adaptive positioning responding to gaze
- Environmental lighting affecting panel brightness

### Performance Tests
- Measure frame rate with all features active
- Profile memory usage during particle bursts
- Test audio latency from event to sound
- Measure gesture recognition latency
- Verify smooth 60fps during interactions

## Implementation Notes

### Vision Pro Capabilities
- Use ARKit for hand tracking and gaze detection
- Use AVAudioEngine with AVAudioEnvironmentNode for spatial audio
- Use RealityKit for particle rendering and physics
- Use WorldTrackingProvider for mesh anchors

### Optimization Strategies
- Pool particle objects to avoid allocation overhead
- Use Metal compute shaders for particle physics
- Batch audio updates to reduce engine overhead
- Cache gaze calculations between frames
- Use LOD (level of detail) for distant panels

### Accessibility Considerations
- Provide audio descriptions for visual effects
- Allow disabling particle effects for motion sensitivity
- Support voice commands as alternative to hand gestures
- Ensure high contrast mode works with all features
- Provide haptic feedback alternatives to audio cues
