# Audio Assets

This directory contains spatial audio assets for the VR training HUD.

## Required Audio Files

The following audio files need to be added to the Xcode project:

### 1. whoosh.wav
- **Purpose**: Played when a stat ring fills to completion
- **Duration**: ~0.5 seconds
- **Characteristics**: Soft, satisfying swoosh sound
- **Volume**: 0.7 (70% base volume)

### 2. chime.wav
- **Purpose**: Played when a goal progress bar reaches 100%
- **Duration**: ~1.0 second
- **Characteristics**: Pleasant success chime, celebratory
- **Volume**: 0.8 (80% base volume)

### 3. fanfare.wav
- **Purpose**: Played when a training session ends
- **Duration**: ~2.0 seconds
- **Characteristics**: Completion fanfare, triumphant
- **Volume**: 0.9 (90% base volume)

### 4. levelup.wav
- **Purpose**: Played when a stat levels up
- **Duration**: ~1.5 seconds
- **Characteristics**: Celebration sound, exciting
- **Volume**: 0.85 (85% base volume)

## Adding Audio Files to Xcode

1. Drag the audio files into the Xcode project navigator
2. Ensure "Copy items if needed" is checked
3. Add files to the CorgiQuestVR target
4. Verify files appear in the project's Resources folder

## Audio Format Recommendations

- **Format**: WAV (uncompressed) or M4A (compressed)
- **Sample Rate**: 44.1 kHz or 48 kHz
- **Bit Depth**: 16-bit or 24-bit
- **Channels**: Mono (spatial positioning is handled by AVAudioEnvironmentNode)

## Testing Audio

Use the `SpatialAudioManager` to test audio playback:

```swift
let audioManager = SpatialAudioManager()
audioManager.loadSounds()

// Play a sound at a specific 3D position
let position = SIMD3<Float>(x: 1.0, y: 0.0, z: -2.0)
audioManager.playSound(.statFill, at: position)
```

## Spatial Audio Configuration

The audio system uses the following spatial audio parameters:

- **Max Distance**: 5.0 meters (sound becomes inaudible)
- **Reference Distance**: 1.0 meter (full volume)
- **Rolloff Factor**: 1.0 (natural distance attenuation)
- **Attenuation Model**: Inverse distance

These can be adjusted in `AudioConfig` if needed.
