# Environmental Integration System

This module provides environmental awareness and adaptation for the Corgi Quest VR training HUD.

## Components

### LightingAdapter
Adjusts panel brightness and contrast based on ambient lighting conditions.

**Features:**
- Automatic brightness adjustment for dark/bright environments
- High contrast mode for outdoor training
- Smooth transitions between lighting conditions
- Configurable thresholds for different lighting levels

**Usage:**
```swift
let lightingAdapter = LightingAdapter()

// Update from ARKit light estimate
lightingAdapter.updateFromARLightEstimate(arLightEstimate)

// Get adjusted opacity for panels
let opacity = lightingAdapter.adjustedOpacity(baseOpacity: 0.95)

// Check if in high contrast mode
if lightingAdapter.isHighContrastMode {
    // Apply high contrast styling
}
```

**Lighting Thresholds:**
- Dark: < 100 lux (dims panels to 60% brightness)
- Normal: 100-1000 lux (standard brightness)
- Bright: 1000-10000 lux (increases contrast by 30%)
- Outdoor: > 10000 lux (enables high contrast mode)

### ShadowRenderer
Renders subtle shadows for panels on nearby real-world surfaces.

**Features:**
- Dynamic shadow creation based on panel-surface proximity
- Intensity adjustment based on distance
- Automatic shadow cleanup
- Performance-optimized shadow rendering

**Usage:**
```swift
let shadowRenderer = ShadowRenderer()

// Update shadow for a panel
shadowRenderer.updateShadow(
    for: panelId,
    panelPosition: panelPosition,
    panelSize: SIMD2<Float>(0.3, 0.4),
    nearestSurface: surfacePosition,
    in: realityKitScene
)

// Remove shadow when panel moves away
shadowRenderer.removeShadow(for: panelId, from: scene)

// Adjust shadow intensity
shadowRenderer.setShadowIntensity(0.5)
```

**Shadow Configuration:**
- Max distance: 0.5 meters (shadows only render when panel is close)
- Shadow offset: 0.05 meters below surface
- Default intensity: 0.3 (30% opacity)
- Blur radius: 0.02 meters

### EnvironmentDetector
Detects environmental changes and provides surface information.

**Features:**
- Indoor/outdoor detection based on lighting
- Space change detection (user moved to new room)
- Real-world surface detection from mesh anchors
- Nearest surface queries for shadow rendering

**Usage:**
```swift
let environmentDetector = EnvironmentDetector()

// Update with ARKit data
environmentDetector.update(
    cameraTransform: cameraTransform,
    lightEstimate: lightEstimate,
    meshAnchors: meshAnchors
)

// Find nearest surface to a panel
if let nearestSurface = environmentDetector.findNearestSurface(to: panelPosition) {
    // Render shadow on this surface
}

// Check if user changed spaces
if environmentDetector.hasChangedSpace {
    // Reset panel positions to safe defaults
    environmentDetector.resetSpaceChangeDetection()
}

// Check environment type
switch environmentDetector.currentEnvironment {
case .indoor:
    // Indoor-specific behavior
case .outdoor:
    // Enable high contrast mode
}
```

**Detection Thresholds:**
- Space change: 3 meters of movement
- Surface proximity: 0.3 meters
- Outdoor detection: > 10000 lux

## Integration with TrainingRoomViewModel

The environmental system integrates with the main VR view model:

```swift
class TrainingRoomViewModel: ObservableObject {
    let lightingAdapter = LightingAdapter()
    let shadowRenderer = ShadowRenderer()
    let environmentDetector = EnvironmentDetector()
    
    func updateEnvironment(
        cameraTransform: simd_float4x4,
        lightEstimate: ARLightEstimate?,
        meshAnchors: [MeshAnchor]
    ) {
        // Update lighting
        if let estimate = lightEstimate {
            lightingAdapter.updateFromARLightEstimate(estimate)
        }
        
        // Update environment detection
        environmentDetector.update(
            cameraTransform: cameraTransform,
            lightEstimate: lightEstimate,
            meshAnchors: meshAnchors
        )
        
        // Handle space changes
        if environmentDetector.hasChangedSpace {
            resetPanelPositions()
            environmentDetector.resetSpaceChangeDetection()
        }
        
        // Update shadows for all panels
        updatePanelShadows()
    }
}
```

## Requirements Validation

This implementation satisfies the following requirements:

### Requirement 5.1: Dark Room Dimming
✅ `LightingAdapter` detects dark environments (< 100 lux) and reduces panel brightness to 60%

### Requirement 5.2: Bright Room Contrast
✅ `LightingAdapter` detects bright environments (> 1000 lux) and increases contrast by 30%

### Requirement 5.3: Surface Shadows
✅ `ShadowRenderer` renders subtle shadows on nearby real surfaces (within 0.5m)

### Requirement 5.4: Outdoor High Contrast
✅ `LightingAdapter` enables high contrast mode when outdoor detected (> 10000 lux)

### Requirement 5.5: Space Change Reset
✅ `EnvironmentDetector` detects space changes (> 3m movement) and triggers position reset

## Performance Considerations

- **Lighting updates**: Smoothed over time to avoid jarring transitions
- **Shadow rendering**: Only active for panels within 0.5m of surfaces
- **Surface detection**: Samples mesh vertices (1 in 20) for performance
- **Memory**: Shadows automatically cleaned up when panels move away

## Future Enhancements

- Adaptive shadow quality based on device performance
- Color temperature adjustment based on ambient lighting
- Directional shadows based on light source position
- Surface material detection for shadow appearance
