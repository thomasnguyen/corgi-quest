//
//  OcclusionHandler.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/27/25.
//

import Foundation
import SwiftUI
import Combine
import ARKit
import RealityKit
import simd

/// Handles detection and avoidance of real-world occlusions for VR panels
/// Requirements: 4.5
@MainActor
class OcclusionHandler: ObservableObject {
    
    // MARK: - Types
    
    /// Represents a detected mesh anchor from the real world
    struct MeshInfo {
        let position: SIMD3<Float>
        let bounds: SIMD3<Float>  // Width, height, depth
        let transform: simd_float4x4
    }
    
    /// Represents a panel's bounding box in 3D space
    struct PanelBounds {
        let center: SIMD3<Float>
        let size: SIMD3<Float>  // Width, height, depth
        
        /// Calculates the min corner of the bounding box
        var min: SIMD3<Float> {
            return center - size / 2
        }
        
        /// Calculates the max corner of the bounding box
        var max: SIMD3<Float> {
            return center + size / 2
        }
    }
    
    // MARK: - Properties
    
    /// Currently detected mesh anchors from ARKit
    private var meshAnchors: [MeshInfo] = []
    
    /// Threshold for acceptable overlap (10% of panel area)
    private let overlapThreshold: Float = 0.1
    
    /// Minimum distance to maintain from mesh surfaces
    private let minDistanceFromMesh: Float = 0.15  // 15cm
    
    /// Maximum repositioning distance per frame for smooth transitions
    private let maxRepositionDelta: Float = 0.05  // 5cm per frame
    
    // MARK: - Mesh Anchor Management
    
    /// Updates the list of detected mesh anchors from ARKit
    /// - Parameter anchors: Array of mesh anchors from WorldTrackingProvider
    func updateMeshAnchors(_ anchors: [WorldAnchor]) {
        meshAnchors = anchors.compactMap { anchor in
            // On visionOS, WorldAnchor provides transform but not mesh geometry
            // We'll use a simplified approach with estimated bounds
            let transform = anchor.originFromAnchorTransform
            let position = SIMD3<Float>(
                transform.columns.3.x,
                transform.columns.3.y,
                transform.columns.3.z
            )
            
            // Use default bounds since mesh geometry isn't directly available
            let bounds = SIMD3<Float>(0.5, 0.5, 0.1)

            return MeshInfo(
                position: position,
                bounds: bounds,
                transform: transform
            )
        }
    }

    /// Calculates approximate bounding box for a mesh geometry
    /// - Parameter geometry: Estimated size for the mesh
    /// - Returns: Approximate size of the mesh (width, height, depth)
    private func calculateMeshBounds() -> SIMD3<Float> {
        // Default size for visionOS world anchors
        return SIMD3<Float>(0.5, 0.5, 0.1)
    }
    
    // MARK: - Occlusion Detection
    
    /// Checks if a panel at the given position would be occluded by any mesh
    /// - Parameters:
    ///   - position: The panel's center position
    ///   - panelSize: The panel's dimensions (width, height, depth)
    /// - Returns: True if the panel overlaps with a mesh by more than the threshold
    func isOccluded(position: SIMD3<Float>, panelSize: SIMD3<Float>) -> Bool {
        let panelBounds = PanelBounds(center: position, size: panelSize)
        
        for mesh in meshAnchors {
            let meshBounds = PanelBounds(center: mesh.position, size: mesh.bounds)
            let overlapRatio = calculateOverlapRatio(panel: panelBounds, mesh: meshBounds)
            
            if overlapRatio > overlapThreshold {
                return true
            }
        }
        
        return false
    }
    
    /// Calculates the overlap ratio between a panel and a mesh
    /// - Parameters:
    ///   - panel: The panel's bounding box
    ///   - mesh: The mesh's bounding box
    /// - Returns: Ratio of overlapping volume to panel volume (0.0 to 1.0)
    private func calculateOverlapRatio(panel: PanelBounds, mesh: PanelBounds) -> Float {
        // Calculate intersection of the two bounding boxes
        let intersectionMin = simd_max(panel.min, mesh.min)
        let intersectionMax = simd_min(panel.max, mesh.max)
        
        // Check if there's any intersection
        if any(intersectionMin .>= intersectionMax) {
            return 0.0  // No intersection
        }
        
        // Calculate intersection volume
        let intersectionSize = intersectionMax - intersectionMin
        let intersectionVolume = intersectionSize.x * intersectionSize.y * intersectionSize.z
        
        // Calculate panel volume
        let panelVolume = panel.size.x * panel.size.y * panel.size.z
        
        // Return ratio
        return intersectionVolume / panelVolume
    }
    
    // MARK: - Repositioning
    
    /// Finds a safe position for a panel that avoids occlusion
    /// - Parameters:
    ///   - currentPosition: The panel's current position
    ///   - panelSize: The panel's dimensions
    /// - Returns: A new position that avoids occlusion, or nil if current position is safe
    func findSafePosition(
        from currentPosition: SIMD3<Float>,
        panelSize: SIMD3<Float>
    ) -> SIMD3<Float>? {
        // If not occluded, return nil (no repositioning needed)
        if !isOccluded(position: currentPosition, panelSize: panelSize) {
            return nil
        }
        
        // Try repositioning strategies in order of preference
        let strategies: [(SIMD3<Float>) -> SIMD3<Float>] = [
            { pos in pos + SIMD3<Float>(0, 0.2, 0) },      // Move up
            { pos in pos + SIMD3<Float>(0, -0.2, 0) },     // Move down
            { pos in pos + SIMD3<Float>(0.2, 0, 0) },      // Move right
            { pos in pos + SIMD3<Float>(-0.2, 0, 0) },     // Move left
            { pos in pos + SIMD3<Float>(0, 0, 0.2) },      // Move closer
            { pos in pos + SIMD3<Float>(0, 0, -0.2) },     // Move further
            { pos in pos + SIMD3<Float>(0.15, 0.15, 0) },  // Move diagonal up-right
            { pos in pos + SIMD3<Float>(-0.15, 0.15, 0) }, // Move diagonal up-left
        ]
        
        // Try each strategy
        for strategy in strategies {
            let newPosition = strategy(currentPosition)
            if !isOccluded(position: newPosition, panelSize: panelSize) {
                return newPosition
            }
        }
        
        // If all strategies fail, move panel significantly further back
        return currentPosition + SIMD3<Float>(0, 0, -0.5)
    }
    
    /// Applies smooth repositioning to avoid occlusion
    /// - Parameters:
    ///   - currentPosition: The panel's current position
    ///   - targetPosition: The desired safe position
    /// - Returns: The next position with smooth interpolation applied
    func applySmoothRepositioning(
        from currentPosition: SIMD3<Float>,
        to targetPosition: SIMD3<Float>
    ) -> SIMD3<Float> {
        let delta = targetPosition - currentPosition
        let distance = simd_length(delta)
        
        // If already at target, return current position
        if distance < 0.001 {
            return currentPosition
        }
        
        // Limit movement to max delta for smooth transition
        if distance > maxRepositionDelta {
            let direction = simd_normalize(delta)
            return currentPosition + direction * maxRepositionDelta
        }
        
        // Close enough, snap to target
        return targetPosition
    }
    
    /// Checks if a panel needs repositioning and returns the safe position
    /// - Parameters:
    ///   - currentPosition: The panel's current position
    ///   - panelSize: The panel's dimensions
    /// - Returns: A tuple of (needsRepositioning, safePosition)
    func checkAndReposition(
        currentPosition: SIMD3<Float>,
        panelSize: SIMD3<Float>
    ) -> (needsRepositioning: Bool, safePosition: SIMD3<Float>?) {
        if let safePosition = findSafePosition(from: currentPosition, panelSize: panelSize) {
            return (true, safePosition)
        }
        return (false, nil)
    }
    
    // MARK: - Utility
    
    /// Gets the number of currently tracked mesh anchors
    var meshCount: Int {
        return meshAnchors.count
    }
    
    /// Clears all tracked mesh anchors
    func clearMeshAnchors() {
        meshAnchors.removeAll()
    }
}
