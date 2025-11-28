//
//  SpatialAudioManager.swift
//  CorgiQuestVR
//
//  Manages 3D positioned audio for VR training HUD
//

import Foundation
import AVFoundation
import simd

/// Manages spatial audio playback with 3D positioning
@MainActor
class SpatialAudioManager: ObservableObject {
    
    // MARK: - Properties
    
    /// AVAudioEngine for audio processing
    private let audioEngine: AVAudioEngine
    
    /// AVAudioEnvironmentNode for 3D positioning
    private let environment: AVAudioEnvironmentNode
    
    /// Audio configuration settings
    private let config: AudioConfig
    
    /// Active audio players mapped by sound type
    private var activePlayers: [SoundType: AVAudioPlayerNode] = [:]
    
    /// Audio buffers for each sound type
    private var audioBuffers: [SoundType: AVAudioPCMBuffer] = [:]
    
    /// Listener position (user's head position)
    @Published var listenerPosition: SIMD3<Float> = [0, 0, 0]
    
    // MARK: - Initialization
    
    init(config: AudioConfig = AudioConfig()) {
        self.config = config
        self.audioEngine = AVAudioEngine()
        self.environment = AVAudioEnvironmentNode()
        
        setupAudioEngine()
    }
    
    // MARK: - Setup
    
    /// Configures the audio engine and environment node
    private func setupAudioEngine() {
        // Attach environment node to the engine
        audioEngine.attach(environment)
        
        // Connect environment to main mixer
        audioEngine.connect(
            environment,
            to: audioEngine.mainMixerNode,
            format: nil
        )
        
        // Configure environment for 3D audio
        environment.listenerPosition = AVAudio3DPoint(
            x: listenerPosition.x,
            y: listenerPosition.y,
            z: listenerPosition.z
        )
        
        environment.distanceAttenuationParameters.distanceAttenuationModel = .inverse
        environment.distanceAttenuationParameters.referenceDistance = config.referenceDistance
        environment.distanceAttenuationParameters.maximumDistance = config.maxDistance
        environment.distanceAttenuationParameters.rolloffFactor = config.rolloffFactor
        
        // Start the audio engine
        do {
            try audioEngine.start()
        } catch {
            print("Failed to start audio engine: \(error)")
        }
    }
    
    // MARK: - Audio Loading
    
    /// Loads audio files into buffers
    func loadSounds() {
        for soundType in SoundType.allCases {
            guard let url = Bundle.main.url(forResource: soundType.asset.filename, withExtension: nil) else {
                print("Warning: Could not find audio file for \(soundType)")
                continue
            }
            
            do {
                let audioFile = try AVAudioFile(forReading: url)
                let buffer = AVAudioPCMBuffer(
                    pcmFormat: audioFile.processingFormat,
                    frameCapacity: AVAudioFrameCount(audioFile.length)
                )
                
                guard let buffer = buffer else {
                    print("Warning: Could not create buffer for \(soundType)")
                    continue
                }
                
                try audioFile.read(into: buffer)
                audioBuffers[soundType] = buffer
            } catch {
                print("Error loading audio file for \(soundType): \(error)")
            }
        }
    }
    
    // MARK: - Playback
    
    /// Plays a sound at a specific 3D position
    /// - Parameters:
    ///   - sound: The type of sound to play
    ///   - position: 3D position in space where the sound originates
    ///   - volume: Base volume (0.0 to 1.0), will be adjusted by distance
    func playSound(_ sound: SoundType, at position: SIMD3<Float>, volume: Float = 1.0) {
        guard let buffer = audioBuffers[sound] else {
            print("Warning: No buffer loaded for \(sound)")
            return
        }
        
        // Create a new player node
        let player = AVAudioPlayerNode()
        audioEngine.attach(player)
        
        // Connect player to environment node
        audioEngine.connect(
            player,
            to: environment,
            format: buffer.format
        )
        
        // Set 3D position
        player.position = AVAudio3DPoint(x: position.x, y: position.y, z: position.z)
        
        // Calculate distance-adjusted volume
        let adjustedVolume = adjustVolume(for: position, userPosition: listenerPosition) * volume * sound.asset.baseVolume
        player.volume = adjustedVolume
        
        // Schedule and play the buffer
        player.scheduleBuffer(buffer, at: nil, options: [], completionHandler: { [weak self, weak player] in
            Task { @MainActor [weak self, weak player] in
                guard let self = self, let player = player else { return }
                
                // Clean up after playback
                player.stop()
                self.audioEngine.detach(player)
                self.activePlayers.removeValue(forKey: sound)
            }
        })
        
        player.play()
        activePlayers[sound] = player
    }
    
    /// Adjusts volume based on distance from listener
    /// - Parameters:
    ///   - position: Sound source position
    ///   - userPosition: Listener position
    /// - Returns: Volume multiplier (0.0 to 1.0)
    func adjustVolume(for position: SIMD3<Float>, userPosition: SIMD3<Float>) -> Float {
        let distance = simd_distance(position, userPosition)
        
        // If within reference distance, full volume
        if distance <= config.referenceDistance {
            return 1.0
        }
        
        // If beyond max distance, silent
        if distance >= config.maxDistance {
            return 0.0
        }
        
        // Inverse distance attenuation
        let attenuation = config.referenceDistance / (config.referenceDistance + config.rolloffFactor * (distance - config.referenceDistance))
        
        return max(0.0, min(1.0, attenuation))
    }
    
    /// Updates the listener position (user's head)
    /// - Parameter position: New listener position
    func updateListenerPosition(_ position: SIMD3<Float>) {
        listenerPosition = position
        environment.listenerPosition = AVAudio3DPoint(x: position.x, y: position.y, z: position.z)
    }
    
    /// Stops all currently playing sounds
    func stopAllSounds() {
        for (_, player) in activePlayers {
            player.stop()
            audioEngine.detach(player)
        }
        activePlayers.removeAll()
    }
    
    // MARK: - Cleanup
    
    deinit {
        stopAllSounds()
        audioEngine.stop()
    }
}

// MARK: - Supporting Types

/// Types of sounds that can be played
enum SoundType: String, CaseIterable {
    case statFill      // Soft whoosh when stat ring fills
    case goalComplete  // Success chime when goal reaches 100%
    case sessionEnd    // Completion fanfare when session ends
    case levelUp       // Celebration sound for level-up
    
    var asset: SoundAsset {
        switch self {
        case .statFill:
            return SoundAsset(filename: "whoosh.wav", duration: 0.5, baseVolume: 0.7)
        case .goalComplete:
            return SoundAsset(filename: "chime.wav", duration: 1.0, baseVolume: 0.8)
        case .sessionEnd:
            return SoundAsset(filename: "fanfare.wav", duration: 2.0, baseVolume: 0.9)
        case .levelUp:
            return SoundAsset(filename: "levelup.wav", duration: 1.5, baseVolume: 0.85)
        }
    }
}

/// Configuration for spatial audio
struct AudioConfig {
    /// Maximum audible distance in meters
    let maxDistance: Float
    
    /// Distance at which sound is at full volume
    let referenceDistance: Float
    
    /// How quickly volume decreases with distance
    let rolloffFactor: Float
    
    init(maxDistance: Float = 5.0, referenceDistance: Float = 1.0, rolloffFactor: Float = 1.0) {
        self.maxDistance = maxDistance
        self.referenceDistance = referenceDistance
        self.rolloffFactor = rolloffFactor
    }
}

/// Metadata for a sound asset
struct SoundAsset {
    let filename: String
    let duration: TimeInterval
    let baseVolume: Float
}
