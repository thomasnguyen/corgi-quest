//
//  EnvironmentDetector.swift
//  CorgiQuestVR
//
//  Detects environmental changes and triggers appropriate responses
//

import SwiftUI
import ARKit
import RealityKit
import Combine

/// Detects and responds to environmental changes
@MainActor
class EnvironmentDetector: ObservableObject {
    // MARK: - Published Properties
    
    @Published var currentEnvironment: EnvironmentType = .indoor
    @Published var hasChangedSpace: Bool = false
    @Published var nearestSurfaces: [UUID: SIMD3<Float>] = [:]
    
    // MARK: - Private Properties
    
    private var lastKnownPosition: SIMD3<Float>?
    private let spaceChangeThreshold: Float = 3.0  // Meters
    private var meshAnchors: [UUID: MeshAnchor] = [:]
    
    // MARK: - Public Methods
    
    /// Update environment detection from ARKit data
    func update(
        cameraTransform: simd_float4x4,
        lightEstimate: ARLightEstimate?,
        meshAnchors: [MeshAnchor]
    ) {
        // Update mesh anchors for surface detection
        updateMeshAnchors(meshAnchors)
        
        // Detect space changes
        detectSpaceChange(cameraTransform: cameraTransform)
        
        // Detect indoor/outdoor based on lighting
        if let estimate = lightEstimate {
            detectEnvironmentType(lightEstimate: estimate)
        }
    }
    
    /// Find nearest surface to a given position
    func findNearestSurface(to position: SIMD3<Float>) -> SIMD3<Float>? {
        var nearestDistance: Float = .infinity
        var nearestPosition: SIMD3<Float>?
        
        for (_, meshAnchor) in meshAnchors {
            // Get mesh geometry
            let geometry = meshAnchor.geometry
            let vertices = geometry.vertices
            
            // Check vertices for closest point
            for vertex in vertices {
                let worldPosition = meshAnchor.transform * SIMD4<Float>(vertex.x, vertex.y, vertex.z, 1.0)
                let vertexPosition = SIMD3<Float>(worldPosition.x, worldPosition.y, worldPosition.z)
                let distance = simd_distance(position, vertexPosition)
                
                if distance < nearestDistance {
                    nearestDistance = distance
                    nearestPosition = vertexPosition
                }
            }
        }
        
        // Only return if surface is reasonably close (within 1 meter)
        return nearestDistance < 1.0 ? nearestPosition : nil
    }
    
    /// Check if position is near any real surface
    func isNearSurface(_ position: SIMD3<Float>, threshold: Float = 0.3) -> Bool {
        guard let nearest = findNearestSurface(to: position) else {
            return false
        }
        return simd_distance(position, nearest) < threshold
    }
    
    /// Reset space change detection
    func resetSpaceChangeDetection() {
        hasChangedSpace = false
    }
    
    /// Get all detected surfaces
    func getAllSurfaces() -> [SIMD3<Float>] {
        var surfaces: [SIMD3<Float>] = []
        
        for (_, meshAnchor) in meshAnchors {
            let geometry = meshAnchor.geometry
            let vertices = geometry.vertices
            
            // Sample vertices (not all, for performance)
            let stride = max(1, vertices.count / 20)
            for i in stride(from: 0, to: vertices.count, by: stride) {
                let vertex = vertices[i]
                let worldPosition = meshAnchor.transform * SIMD4<Float>(vertex.x, vertex.y, vertex.z, 1.0)
                surfaces.append(SIMD3<Float>(worldPosition.x, worldPosition.y, worldPosition.z))
            }
        }
        
        return surfaces
    }
    
    // MARK: - Private Methods
    
    private func updateMeshAnchors(_ anchors: [MeshAnchor]) {
        // Update our mesh anchor dictionary
        meshAnchors.removeAll()
        for anchor in anchors {
            meshAnchors[anchor.id] = anchor
        }
    }
    
    private func detectSpaceChange(cameraTransform: simd_float4x4) {
        let currentPosition = SIMD3<Float>(
            cameraTransform.columns.3.x,
            cameraTransform.columns.3.y,
            cameraTransform.columns.3.z
        )
        
        if let lastPosition = lastKnownPosition {
            let distance = simd_distance(currentPosition, lastPosition)
            
            // If user has moved significantly, mark as space change
            if distance > spaceChangeThreshold {
                hasChangedSpace = true
                lastKnownPosition = currentPosition
            }
        } else {
            // First position
            lastKnownPosition = currentPosition
        }
    }
    
    private func detectEnvironmentType(lightEstimate: ARLightEstimate) {
        let ambientIntensity = lightEstimate.ambientIntensity
        
        // Detect outdoor based on very high light levels
        if ambientIntensity > 10000.0 {
            currentEnvironment = .outdoor
        } else {
            currentEnvironment = .indoor
        }
    }
}

// MARK: - Environment Types

enum EnvironmentType {
    case indoor
    case outdoor
    
    var description: String {
        switch self {
        case .indoor: return "Indoor"
        case .outdoor: return "Outdoor"
        }
    }
}

// MARK: - Environment Configuration

struct EnvironmentConfig {
    static let spaceChangeThreshold: Float = 3.0  // Meters
    static let surfaceProximityThreshold: Float = 0.3  // Meters
    static let outdoorLightThreshold: Float = 10000.0  // Lux
}
