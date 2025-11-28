//
//  ParticleSystem.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/27/25.
//

import Foundation
import RealityKit
import SwiftUI

/// Particle system for celebration effects in VR
/// Requirements: 3.1, 3.2, 3.3, 3.4
@MainActor
class ParticleSystem: ObservableObject {
    
    // MARK: - Particle Structure
    
    /// Individual particle with physics properties
    struct Particle {
        var position: SIMD3<Float>
        var velocity: SIMD3<Float>
        var color: Color
        var alpha: Float
        var lifetime: TimeInterval
        var age: TimeInterval
        
        /// Check if particle is still alive
        var isAlive: Bool {
            return age < lifetime
        }
        
        /// Calculate current alpha based on age (linear fade)
        /// Requirements: 3.4
        var currentAlpha: Float {
            guard lifetime > 0 else { return 0 }
            return Float(1.0 - (age / lifetime))
        }
    }
    
    // MARK: - Properties
    
    /// Active particles in the system
    @Published private(set) var particles: [Particle] = []
    
    /// Particle pool for performance optimization
    private var particlePool: [Particle] = []
    private let maxPoolSize: Int = 100
    
    /// Physics constants
    private let gravity: SIMD3<Float> = SIMD3<Float>(0, -0.5, 0)
    
    /// Last update time for delta calculation
    private var lastUpdateTime: Date?
    
    /// Maximum particle count (can be adjusted for performance)
    /// Requirements: 6.2
    var maxParticleCount: Int = 100
    
    /// Whether to use reduced quality mode
    /// Requirements: 6.2
    var useReducedQuality: Bool = false
    
    // MARK: - Particle Emission
    
    /// Emit particles from a position
    /// Requirements: 3.1, 3.2, 6.2
    /// - Parameters:
    ///   - count: Number of particles to emit
    ///   - position: 3D position to emit from
    ///   - color: Color of the particles
    ///   - lifetime: How long particles should live (seconds)
    ///   - velocity: Initial velocity vector
    func emitParticles(
        count: Int,
        from position: SIMD3<Float>,
        color: Color,
        lifetime: TimeInterval,
        velocity: SIMD3<Float>
    ) {
        // Apply dynamic particle count reduction if needed
        // Requirements: 6.2
        let adjustedCount: Int
        if useReducedQuality {
            adjustedCount = min(count / 2, maxParticleCount - particles.count)
        } else {
            adjustedCount = min(count, maxParticleCount - particles.count)
        }
        
        // Don't emit if we're at capacity
        guard adjustedCount > 0 else { return }
        
        for _ in 0..<adjustedCount {
            let particle = createParticle(
                position: position,
                color: color,
                lifetime: lifetime,
                velocity: velocity
            )
            particles.append(particle)
        }
    }
    
    /// Create a single particle with randomized properties
    private func createParticle(
        position: SIMD3<Float>,
        color: Color,
        lifetime: TimeInterval,
        velocity: SIMD3<Float>
    ) -> Particle {
        // Add random spread to velocity
        let spread: Float = 0.3
        let randomVelocity = SIMD3<Float>(
            velocity.x + Float.random(in: -spread...spread),
            velocity.y + Float.random(in: 0...spread * 2),
            velocity.z + Float.random(in: -spread...spread)
        )
        
        return Particle(
            position: position,
            velocity: randomVelocity,
            color: color,
            alpha: 1.0,
            lifetime: lifetime,
            age: 0
        )
    }
    
    // MARK: - Physics Simulation
    
    /// Update particle physics and lifetime
    /// Requirements: 3.3, 3.4
    /// - Parameter deltaTime: Time elapsed since last update
    func update(deltaTime: TimeInterval) {
        var aliveParticles: [Particle] = []
        
        for var particle in particles {
            // Update age
            particle.age += deltaTime
            
            // Check if particle should be removed
            guard particle.isAlive else {
                // Return to pool for reuse
                returnToPool(particle)
                continue
            }
            
            // Apply gravity to velocity
            particle.velocity += gravity * Float(deltaTime)
            
            // Update position based on velocity
            particle.position += particle.velocity * Float(deltaTime)
            
            // Update alpha (linear fade)
            particle.alpha = particle.currentAlpha
            
            aliveParticles.append(particle)
        }
        
        particles = aliveParticles
    }
    
    // MARK: - Particle Pooling
    
    /// Return particle to pool for reuse
    /// Requirements: 3.2, 3.4
    private func returnToPool(_ particle: Particle) {
        guard particlePool.count < maxPoolSize else { return }
        var pooledParticle = particle
        pooledParticle.age = 0
        pooledParticle.alpha = 1.0
        particlePool.append(pooledParticle)
    }
    
    /// Get particle from pool or create new one
    private func getFromPool() -> Particle? {
        return particlePool.popLast()
    }
    
    // MARK: - Cleanup
    
    /// Clear all active particles
    /// Requirements: 3.4
    func clear() {
        particles.removeAll()
    }
    
    /// Clear particles and pool
    func reset() {
        particles.removeAll()
        particlePool.removeAll()
    }
}

// MARK: - Particle Configuration

/// Configuration for particle emitters
/// Requirements: 3.1, 3.2
struct ParticleConfig {
    let count: Int
    let lifetime: TimeInterval
    let initialVelocity: SIMD3<Float>
    let spread: Float
    let gravity: SIMD3<Float>
    
    /// Level-up particle configuration (25 particles, stat colors)
    /// Requirements: 3.1
    static func levelUp(color: Color) -> ParticleConfig {
        return ParticleConfig(
            count: 25,
            lifetime: 1.5,
            initialVelocity: SIMD3<Float>(0, 0.5, 0),
            spread: 0.3,
            gravity: SIMD3<Float>(0, -0.5, 0)
        )
    }
    
    /// Goal completion confetti configuration
    /// Requirements: 3.2
    static var confetti: ParticleConfig {
        return ParticleConfig(
            count: 30,
            lifetime: 2.0,
            initialVelocity: SIMD3<Float>(0, 0.8, 0),
            spread: 0.5,
            gravity: SIMD3<Float>(0, -0.3, 0)
        )
    }
}
