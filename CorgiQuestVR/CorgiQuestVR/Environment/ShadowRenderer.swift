//
//  ShadowRenderer.swift
//  CorgiQuestVR
//
//  Renders subtle shadows for panels on real-world surfaces
//

import SwiftUI
import RealityKit
import ARKit
import Combine

/// Manages shadow rendering for VR panels on real surfaces
@MainActor
class ShadowRenderer: ObservableObject {
    // MARK: - Published Properties
    
    @Published var shadowsEnabled: Bool = false // Disabled by default
    @Published var shadowIntensity: Float = 0.3
    
    /// Whether shadow rendering is enabled (for performance optimization)
    /// Requirements: 6.5
    var isEnabled: Bool = false // Disabled by default
    
    // MARK: - Private Properties
    
    private var shadowEntities: [UUID: ModelEntity] = [:]
    private let shadowDistance: Float = 0.05  // Distance from panel to shadow plane
    private let shadowBlurRadius: Float = 0.02
    
    // MARK: - Public Methods
    
    /// Create or update shadow for a panel near a surface
    func updateShadow(
        for panelId: UUID,
        panelPosition: SIMD3<Float>,
        panelSize: SIMD2<Float>,
        nearestSurface: SIMD3<Float>?,
        in scene: RealityKit.Scene
    ) {
        // Skip if disabled for performance
        guard isEnabled, shadowsEnabled, let surfacePosition = nearestSurface else {
            removeShadow(for: panelId, from: scene)
            return
        }
        
        // Calculate distance from panel to surface
        let distance = simd_distance(panelPosition, surfacePosition)
        
        // Only render shadow if panel is close to surface
        guard distance < 0.5 else {
            removeShadow(for: panelId, from: scene)
            return
        }
        
        // Calculate shadow intensity based on distance
        let distanceIntensity = 1.0 - (distance / 0.5)
        let finalIntensity = shadowIntensity * distanceIntensity
        
        // Create or update shadow entity
        if let existingShadow = shadowEntities[panelId] {
            updateShadowEntity(existingShadow, intensity: finalIntensity, position: surfacePosition)
        } else {
            let shadowEntity = createShadowEntity(
                size: panelSize,
                intensity: finalIntensity,
                position: surfacePosition
            )
            shadowEntities[panelId] = shadowEntity
            // Note: In visionOS, shadows are managed differently - entity is added to parent container
        }
    }
    
    /// Remove shadow for a specific panel
    func removeShadow(for panelId: UUID, from scene: RealityKit.Scene) {
        if let shadowEntity = shadowEntities[panelId] {
            shadowEntity.removeFromParent()
            shadowEntities.removeValue(forKey: panelId)
        }
    }
    
    /// Remove all shadows
    func removeAllShadows(from scene: RealityKit.Scene) {
        for (_, shadowEntity) in shadowEntities {
            shadowEntity.removeFromParent()
        }
        shadowEntities.removeAll()
    }
    
    /// Enable or disable shadow rendering
    func setShadowsEnabled(_ enabled: Bool) {
        shadowsEnabled = enabled
    }
    
    /// Adjust shadow intensity (0.0 to 1.0)
    func setShadowIntensity(_ intensity: Float) {
        shadowIntensity = max(0.0, min(1.0, intensity))
    }
    
    // MARK: - Private Methods
    
    private func createShadowEntity(
        size: SIMD2<Float>,
        intensity: Float,
        position: SIMD3<Float>
    ) -> ModelEntity {
        // Create a plane mesh for the shadow
        let mesh = MeshResource.generatePlane(width: size.x, depth: size.y)
        
        // Create shadow material with transparency
        var material = UnlitMaterial()
        material.color = .init(tint: .black.withAlphaComponent(CGFloat(intensity)))
        material.blending = .transparent(opacity: .init(floatLiteral: Float(intensity)))
        
        // Create the shadow entity
        let shadowEntity = ModelEntity(mesh: mesh, materials: [material])
        shadowEntity.position = position + SIMD3<Float>(0, -shadowDistance, 0)
        
        // Rotate to align with surface (assuming horizontal surface)
        shadowEntity.orientation = simd_quatf(angle: .pi / 2, axis: SIMD3<Float>(1, 0, 0))
        
        return shadowEntity
    }
    
    private func updateShadowEntity(
        _ entity: ModelEntity,
        intensity: Float,
        position: SIMD3<Float>
    ) {
        // Update position
        entity.position = position + SIMD3<Float>(0, -shadowDistance, 0)
        
        // Update material opacity
        if var material = entity.model?.materials.first as? UnlitMaterial {
            material.color = .init(tint: .black.withAlphaComponent(CGFloat(intensity)))
            material.blending = .transparent(opacity: .init(floatLiteral: Float(intensity)))
            entity.model?.materials = [material]
        }
    }
}

// MARK: - Shadow Configuration

struct ShadowConfig {
    static let defaultIntensity: Float = 0.3
    static let maxDistance: Float = 0.5  // Max distance to render shadows
    static let shadowOffset: Float = 0.05  // Offset from surface
    static let blurRadius: Float = 0.02
}
