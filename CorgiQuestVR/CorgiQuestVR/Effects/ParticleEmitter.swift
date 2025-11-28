//
//  ParticleEmitter.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/27/25.
//

import Foundation
import RealityKit
import SwiftUI

/// Manages particle emission for specific events
/// Requirements: 3.1, 3.2, 3.4
@MainActor
class ParticleEmitter: ObservableObject {
    
    // MARK: - Properties
    
    /// Reference to the particle system
    private let particleSystem: ParticleSystem
    
    /// Emitter configurations
    private var emitterConfigs: [EmitterType: ParticleConfig] = [:]
    
    // MARK: - Initialization
    
    init(particleSystem: ParticleSystem) {
        self.particleSystem = particleSystem
        setupConfigurations()
    }
    
    // MARK: - Configuration Setup
    
    /// Define particle configurations for different events
    /// Requirements: 3.1, 3.2
    private func setupConfigurations() {
        // Level-up particles for each stat type
        emitterConfigs[.levelUpPHY] = ParticleConfig.levelUp(color: .red)
        emitterConfigs[.levelUpINT] = ParticleConfig.levelUp(color: .blue)
        emitterConfigs[.levelUpIMP] = ParticleConfig.levelUp(color: .purple)
        emitterConfigs[.levelUpSOC] = ParticleConfig.levelUp(color: .green)
        
        // Goal completion confetti
        emitterConfigs[.goalComplete] = ParticleConfig.confetti
    }
    
    // MARK: - Emission Methods
    
    /// Emit particles for a stat level-up
    /// Requirements: 3.1
    /// - Parameters:
    ///   - statType: The stat that leveled up (PHY, INT, IMP, SOC)
    ///   - position: 3D position of the stat orb
    func emitLevelUp(statType: String, at position: SIMD3<Float>) {
        let emitterType = EmitterType.fromStatType(statType)
        guard let config = emitterConfigs[emitterType] else { return }
        
        let color = colorForStat(statType)
        
        particleSystem.emitParticles(
            count: config.count,
            from: position,
            color: color,
            lifetime: config.lifetime,
            velocity: config.initialVelocity
        )
    }
    
    /// Emit confetti for goal completion
    /// Requirements: 3.2
    /// - Parameter position: 3D position of the goals panel
    func emitGoalConfetti(at position: SIMD3<Float>) {
        guard let config = emitterConfigs[.goalComplete] else { return }
        
        // Emit multiple colors for confetti effect
        let colors: [Color] = [.red, .blue, .green, .yellow, .purple, .orange]
        let particlesPerColor = config.count / colors.count
        
        for color in colors {
            particleSystem.emitParticles(
                count: particlesPerColor,
                from: position,
                color: color,
                lifetime: config.lifetime,
                velocity: config.initialVelocity
            )
        }
    }
    
    // MARK: - Helper Methods
    
    /// Get color for stat type
    private func colorForStat(_ statType: String) -> Color {
        switch statType {
        case "PHY":
            return .red
        case "INT":
            return .blue
        case "IMP":
            return .purple
        case "SOC":
            return .green
        default:
            return .white
        }
    }
}

// MARK: - Emitter Type

/// Types of particle emitters
enum EmitterType {
    case levelUpPHY
    case levelUpINT
    case levelUpIMP
    case levelUpSOC
    case goalComplete
    
    /// Convert stat type string to emitter type
    static func fromStatType(_ statType: String) -> EmitterType {
        switch statType {
        case "PHY":
            return .levelUpPHY
        case "INT":
            return .levelUpINT
        case "IMP":
            return .levelUpIMP
        case "SOC":
            return .levelUpSOC
        default:
            return .levelUpPHY
        }
    }
}
