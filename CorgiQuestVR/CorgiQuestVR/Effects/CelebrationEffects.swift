//
//  CelebrationEffects.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/27/25.
//

import Foundation
import RealityKit
import SwiftUI
import Combine

/// Coordinates celebration effects for level-ups and goal completions
/// Requirements: 3.1, 3.2, 3.5
@MainActor
class CelebrationEffects: ObservableObject {
    
    // MARK: - Properties
    
    /// Particle system for rendering
    let particleSystem: ParticleSystem
    
    /// Particle emitter for event-based emissions
    let particleEmitter: ParticleEmitter
    
    /// Timer for updating particle physics
    private var updateTimer: Timer?
    
    /// Last update time for delta calculation
    private var lastUpdateTime: Date = Date()
    
    // MARK: - Initialization
    
    init() {
        self.particleSystem = ParticleSystem()
        self.particleEmitter = ParticleEmitter(particleSystem: particleSystem)
    }
    
    // MARK: - Lifecycle
    
    /// Start the particle update loop
    func start() {
        lastUpdateTime = Date()
        
        // Update at 60 FPS
        updateTimer = Timer.scheduledTimer(withTimeInterval: 1.0 / 60.0, repeats: true) { [weak self] _ in
            Task { @MainActor [weak self] in
                self?.update()
            }
        }
    }
    
    /// Stop the particle update loop
    func stop() {
        updateTimer?.invalidate()
        updateTimer = nil
        particleSystem.clear()
    }
    
    /// Update particle physics
    private func update() {
        let now = Date()
        let deltaTime = now.timeIntervalSince(lastUpdateTime)
        lastUpdateTime = now
        
        particleSystem.update(deltaTime: deltaTime)
    }
    
    // MARK: - Event Handlers
    
    /// Trigger particles when a stat levels up
    /// Requirements: 3.1, 3.5
    /// - Parameters:
    ///   - statType: The stat that leveled up
    ///   - position: 3D position of the stat orb
    func onStatLevelUp(statType: String, at position: SIMD3<Float>) {
        particleEmitter.emitLevelUp(statType: statType, at: position)
    }
    
    /// Trigger confetti when a goal completes
    /// Requirements: 3.2, 3.5
    /// - Parameter position: 3D position of the goals panel
    func onGoalComplete(at position: SIMD3<Float>) {
        particleEmitter.emitGoalConfetti(at: position)
    }
    
    // MARK: - Cleanup

    nonisolated deinit {
        Task { @MainActor in
            updateTimer?.invalidate()
        }
    }
}
