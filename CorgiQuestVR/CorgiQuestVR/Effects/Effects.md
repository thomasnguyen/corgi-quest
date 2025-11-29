# Particle System Implementation

This directory contains the particle system for celebration effects in the Corgi Quest VR app.

## Overview

The particle system provides visual feedback for training achievements:
- **Level-up particles**: Emit 25 colored particles when a stat levels up
- **Goal completion confetti**: Emit 30 multi-colored particles when goals are reached

## Architecture

### ParticleSystem.swift
Core particle physics engine that manages particle lifecycle and simulation.

**Key Features:**
- Particle struct with position, velocity, color, alpha, and lifetime
- Physics simulation with gravity and velocity updates
- Linear alpha fade over particle lifetime (Requirements: 3.4)
- Particle pooling for performance optimization (Requirements: 3.2, 3.4)
- 60 FPS update loop

**Properties Validated:**
- Particle age never exceeds lifetime
- Alpha decreases linearly from 1.0 to 0.0 over lifetime
- Particles are cleaned up when lifetime expires

### ParticleEmitter.swift
Manages particle emission for specific events with predefined configurations.

**Emitter Types:**
- `levelUpPHY` - Red particles for Physical stat
- `levelUpINT` - Blue particles for Intelligence stat
- `levelUpIMP` - Purple particles for Impulse Control stat
- `levelUpSOC` - Green particles for Socialization stat
- `goalComplete` - Multi-colored confetti

**Configuration:**
- Level-up: 25 particles, 1.5s lifetime, upward velocity
- Confetti: 30 particles, 2.0s lifetime, higher velocity

### CelebrationEffects.swift
Coordinates particle effects with event detection.

**Responsibilities:**
- Manages particle system lifecycle (start/stop)
- Provides event handlers for level-ups and goal completions
- Runs 60 FPS update loop for particle physics
- Integrates with TrainingRoomViewModel

### ParticleRenderer.swift
Renders particles in RealityKit using ModelEntity spheres.

**Rendering:**
- Creates small sphere entities (0.02 radius) for each particle
- Updates position and alpha in real-time
- Removes entities when particles die
- Integrates with RealityView update cycle

## Integration

### TrainingRoomViewModel
Detects achievement events and triggers particle effects:

```swift
// Detect stat level-up
if stat.level > previousLevel {
    let position = panelPosition(for: stat.type)
    celebrationEffects.onStatLevelUp(statType: stat.type, at: position)
}

// Detect goal completion
if newGoals.physical.progress >= 1.0 && previousPhysicalProgress < 1.0 {
    celebrationEffects.onGoalComplete(at: position)
}
```

### TrainingRoomView
Renders particles in the RealityKit scene:

```swift
RealityView { content, attachments in
    let renderer = ParticleRenderer(particleSystem: viewModel.celebrationEffects.particleSystem)
    renderer.setup(in: content)
    particleRenderer = renderer
} update: { content, attachments in
    particleRenderer?.update()
}
```

## Requirements Mapping

- **3.1**: Stat level-up particles (25 particles, stat colors)
- **3.2**: Goal completion confetti, particle pooling, cleanup
- **3.3**: Physics simulation (gravity, velocity updates)
- **3.4**: Alpha fade over lifetime, particle cleanup
- **3.5**: Event hooks for level-ups and goal completions

## Performance Considerations

1. **Particle Pooling**: Reuses particle objects to reduce allocations
2. **Entity Management**: Removes dead particle entities immediately
3. **60 FPS Updates**: Smooth physics simulation
4. **Particle Limits**: Max 100 particles in pool, automatic cleanup
5. **Efficient Rendering**: Small sphere meshes with simple materials

## Future Enhancements

- Particle trails for motion blur effect
- Sparkle/glow effects for special achievements
- Sound effects synchronized with particle bursts
- Haptic feedback on particle emission
- Custom particle shapes (stars, hearts, etc.)
- Particle collision with real-world surfaces
