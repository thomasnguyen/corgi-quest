# Requirements Document - WebXR Charts Demo

## Introduction

The WebXR Charts Demo is a standalone route that demonstrates proper 3D chart rendering in WebXR using react-three-fiber. This is a separate implementation from the existing `/app.vr` route, allowing experimentation with 3D chart visualization techniques without affecting the working VR training HUD.

## Glossary

- **WebXR System**: The browser-based WebXR Device API implementation that enables immersive VR experiences
- **3D Chart**: Data visualization rendered using three.js primitives (BoxGeometry, PlaneGeometry) instead of SVG
- **World Units**: 3D space measurements in meters (e.g., 0.6m = 60cm)
- **Normalization**: Scaling data values to fit within a reasonable 3D space range
- **BoxGeometry**: three.js primitive for rendering 3D rectangular boxes (used for chart bars)

## Requirements

### Requirement 1: WebXR Chart Route Setup

**User Story:** As a developer, I want a separate WebXR route for testing charts, so that I can experiment without affecting the existing VR training interface.

#### Acceptance Criteria

1. WHEN a user navigates to the /webxr route THEN the WebXR System SHALL display a landing page with an "Enter VR" button
2. WHEN the page loads THEN the WebXR System SHALL check for immersive-vr session support
3. WHEN WebXR is not supported THEN the WebXR System SHALL display a 2D fallback showing the same charts
4. WHEN the user clicks "Enter VR" THEN the WebXR System SHALL request an immersive-vr session
5. WHEN the VR session starts THEN the WebXR System SHALL render a minimal 3D scene with the weekly XP chart

### Requirement 2: Weekly XP Chart Rendering

**User Story:** As a developer, I want to see a properly scaled 3D bar chart in VR, so that I can verify the chart rendering approach works correctly.

#### Acceptance Criteria

1. WHEN displaying the weekly chart THEN the WebXR System SHALL render a 3D bar chart using BoxGeometry primitives showing XP per day
2. WHEN rendering bars THEN the WebXR System SHALL display one bar per day for the last 7 days with consistent spacing of 0.12 units
3. WHEN rendering bars THEN the WebXR System SHALL use a bar width of 0.08 units and normalize heights to a maximum of 0.6 units
4. WHEN displaying XP values THEN the WebXR System SHALL show the numeric XP value above each bar using 3D text with fontSize 0.04
5. WHEN displaying day labels THEN the WebXR System SHALL show the day of the week below each bar using 3D text with fontSize 0.05

### Requirement 3: Data Normalization

**User Story:** As a developer, I want chart data to be properly normalized, so that bars render at appropriate heights regardless of XP values.

#### Acceptance Criteria

1. WHEN calculating bar heights THEN the WebXR System SHALL normalize values using the formula: (value / maxValue) * maxHeight
2. WHEN the maximum XP value is determined THEN the WebXR System SHALL use Math.max(...values, 1) to avoid division by zero
3. WHEN a bar has zero XP THEN the WebXR System SHALL render it with a minimum height of 0.05 units for visibility
4. WHEN bars are positioned THEN the WebXR System SHALL center each bar at y = barHeight / 2 so the bottom sits at y = 0
5. WHEN bars are spaced THEN the WebXR System SHALL center them around the origin using: xPos = (index - (count - 1) / 2) * spacing

### Requirement 4: Chart Animations

**User Story:** As a developer, I want smooth bar growth animations, so that the chart feels polished and professional.

#### Acceptance Criteria

1. WHEN the chart loads THEN the WebXR System SHALL animate bars growing from 0 to their target height over 0.5 seconds
2. WHEN animating bars THEN the WebXR System SHALL use spring physics with tension 200 and friction 20
3. WHEN multiple bars animate THEN the WebXR System SHALL stagger animations by 50ms per bar
4. WHEN XP data updates THEN the WebXR System SHALL smoothly transition bar heights to new values
5. WHEN animations run THEN the WebXR System SHALL maintain 60fps performance

### Requirement 5: Real-Time Data Integration

**User Story:** As a developer, I want the chart to display real dog training data, so that I can verify it works with actual Convex data.

#### Acceptance Criteria

1. WHEN the chart loads THEN the WebXR System SHALL fetch the last 7 days of XP data from Convex
2. WHEN no dog is selected THEN the WebXR System SHALL display a message prompting dog selection
3. WHEN XP data is loading THEN the WebXR System SHALL display a loading indicator
4. WHEN XP data updates in Convex THEN the WebXR System SHALL update the chart within 3 seconds
5. WHEN a day has no XP data THEN the WebXR System SHALL display a bar with value 0 and minimum height

### Requirement 6: 2D Fallback

**User Story:** As a developer, I want a 2D fallback view, so that I can test the chart on non-VR devices.

#### Acceptance Criteria

1. WHEN WebXR is not supported THEN the WebXR System SHALL display the same chart data in a 2D canvas view
2. WHEN displaying the 2D fallback THEN the WebXR System SHALL use the same data source as the VR view
3. WHEN the user interacts with 2D controls THEN the WebXR System SHALL provide the same functionality as VR mode
4. WHEN switching between 2D and VR THEN the WebXR System SHALL preserve the selected dog and data state
5. WHEN on a non-VR device THEN the WebXR System SHALL not display VR-specific instructions

### Requirement 7: Chart Styling and Polish

**User Story:** As a developer, I want the chart to match the Corgi Quest visual style, so that it feels cohesive with the rest of the app.

#### Acceptance Criteria

1. WHEN rendering bars THEN the WebXR System SHALL use the gold color #D4AF37 for bar fill
2. WHEN rendering text THEN the WebXR System SHALL use #f5c35f for XP values and #888888 for day labels
3. WHEN rendering the background THEN the WebXR System SHALL use a semi-transparent dark panel (#1a1a1a with 50% opacity)
4. WHEN displaying the chart title THEN the WebXR System SHALL use "Last 7 Days" with fontSize 0.12 and color #f9dca0
5. WHEN rendering all elements THEN the WebXR System SHALL use MeshBasicMaterial for optimal performance

### Requirement 8: Testing and Validation

**User Story:** As a developer, I want to test the chart with various data scenarios, so that I can verify it handles edge cases correctly.

#### Acceptance Criteria

1. WHEN testing with all zero values THEN the WebXR System SHALL display 7 bars with minimum height
2. WHEN testing with one high value THEN the WebXR System SHALL normalize all bars proportionally
3. WHEN testing with gradually increasing values THEN the WebXR System SHALL display a smooth progression
4. WHEN testing with missing data THEN the WebXR System SHALL fill gaps with zero values
5. WHEN testing on Vision Pro THEN the WebXR System SHALL render at 60+ fps with readable text

### Requirement 9: Developer Documentation

**User Story:** As a developer, I want clear documentation of the chart implementation, so that I can understand and maintain the code.

#### Acceptance Criteria

1. WHEN viewing the component THEN the WebXR System SHALL include comments explaining normalization formulas
2. WHEN viewing the component THEN the WebXR System SHALL include comments explaining positioning calculations
3. WHEN viewing the component THEN the WebXR System SHALL include comments referencing requirement numbers
4. WHEN viewing the component THEN the WebXR System SHALL include examples of correct vs incorrect approaches
5. WHEN viewing the component THEN the WebXR System SHALL include performance optimization notes

### Requirement 10: Performance Optimization

**User Story:** As a developer, I want the chart to render efficiently, so that it maintains smooth performance in VR.

#### Acceptance Criteria

1. WHEN rendering the chart THEN the WebXR System SHALL use fewer than 1000 triangles total
2. WHEN rendering bars THEN the WebXR System SHALL use MeshBasicMaterial instead of MeshStandardMaterial
3. WHEN animating THEN the WebXR System SHALL limit simultaneous animations to 7 bars maximum
4. WHEN the component unmounts THEN the WebXR System SHALL dispose of all geometries and materials
5. WHEN rendering text THEN the WebXR System SHALL use @react-three/drei Text component for optimal performance
