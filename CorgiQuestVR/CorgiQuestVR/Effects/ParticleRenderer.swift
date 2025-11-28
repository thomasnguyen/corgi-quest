//
//  ParticleRenderer.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/27/25.
//

import Foundation
import RealityKit
import SwiftUI

/// Renders particles in RealityKit
/// Requirements: 3.3, 3.4
@MainActor
class ParticleRenderer {
    
    // MARK: - Properties
    
    /// Reference to the particle system
    private let particleSystem: ParticleSystem
    
    /// Entity to hold all particle entities
    private var particleContainer: Entity?
    
    /// Map of particle IDs to their entities
    private var particleEntities: [UUID: ModelEntity] = [:]
    
    // MARK: - Initialization
    
    init(particleSystem: ParticleSystem) {
        self.particleSystem = particleSystem
    }
    
    // MARK: - Rendering
    
    /// Setup the particle container in the RealityKit scene
    /// - Parameter content: RealityViewContent to add entities to
    func setup(in content: RealityViewContent) {
        let container = Entity()
        container.name = "ParticleContainer"
        content.add(container)
        self.particleContainer = container
    }
    
    /// Update particle rendering
    /// Requirements: 3.3, 3.4
    func update() {
        guard let container = particleContainer else { return }
        
        // Get current particles
        let particles = particleSystem.particles
        
        // Remove dead particle entities
        let particleIDs = Set(particles.map { ObjectIdentifier($0) })
        let entitiesToRemove = particleEntities.keys.filter { id in
            !particleIDs.contains(ObjectIdentifier(id))
        }
        
        for id in entitiesToRemove {
            if let entity = particleEntities[id] {
                entity.removeFromParent()
            }
            particleEntities.removeValue(forKey: id)
        }
        
        // Update or create particle entities
        for particle in particles {
            let particleID = UUID() // In production, particles would have stable IDs
            
            if let entity = particleEntities[particleID] {
                // Update existing entity
                updateParticleEntity(entity, with: particle)
            } else {
                // Create new entity
                let entity = createParticleEntity(for: particle)
                container.addChild(entity)
                particleEntities[particleID] = entity
            }
        }
    }
    
    /// Create a RealityKit entity for a particle
    /// Requirements: 3.4
    private func createParticleEntity(for particle: ParticleSystem.Particle) -> ModelEntity {
        // Create a small sphere for the particle
        let mesh = MeshResource.generateSphere(radius: 0.02)
        
        // Create material with particle color and alpha
        var material = SimpleMaterial()
        material.color = .init(
            tint: UIColor(particle.color).withAlphaComponent(CGFloat(particle.alpha)),
            texture: nil
        )
        material.metallic = .float(0.0)
        material.roughness = .float(0.5)
        
        let entity = ModelEntity(mesh: mesh, materials: [material])
        entity.position = particle.position
        
        return entity
    }
    
    /// Update an existing particle entity
    /// Requirements: 3.4
    private func updateParticleEntity(_ entity: ModelEntity, with particle: ParticleSystem.Particle) {
        // Update position
        entity.position = particle.position
        
        // Update material alpha
        if var material = entity.model?.materials.first as? SimpleMaterial {
            material.color = .init(
                tint: UIColor(particle.color).withAlphaComponent(CGFloat(particle.alpha)),
                texture: nil
            )
            entity.model?.materials = [material]
        }
    }
    
    /// Clear all particle entities
    func clear() {
        for (_, entity) in particleEntities {
            entity.removeFromParent()
        }
        particleEntities.removeAll()
    }
}
