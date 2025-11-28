//
//  AdaptivePositioner.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/27/25.
//

import Foundation
import SwiftUI
import Combine
import simd
import ARKit

/// Manages adaptive positioning of panels based on training context and user gaze
/// Requirements: 4.2, 4.3, 4.4, 4.5
@MainActor
class AdaptivePositioner: ObservableObject {
    
    // MARK: - Published Properties
    
    /// Current panel transforms (position, rotation, scale)
    @Published var panelTransforms: [PanelIdentifier: PanelTransform] = [:]
    
    /// Current panel opacities for fade in/out
    @Published var panelOpacities: [PanelIdentifier: Double] = [:]
    
    /// Whether panels are in context-aware mode
    @Published var isContextAware: Bool = false
    
    // MARK: - Dependencies
    
    /// Handles occlusion detection and avoidance
    private let occlusionHandler = OcclusionHandler()
    
    // MARK: - Types
    
    /// Identifies different panels in the VR space
    enum PanelIdentifier: String, CaseIterable {
        case stats = "stats"
        case goals = "goals"
        case activities = "activities"
        case chart = "chart"
        case session = "session"
    }
    
    /// Represents a panel's 3D transform
    struct PanelTransform: Equatable {
        var position: SIMD3<Float>
        var rotation: simd_quatf
        var scale: Float
        
        static let identity = PanelTransform(
            position: SIMD3<Float>(0, 0, 0),
            rotation: simd_quatf(angle: 0, axis: SIMD3<Float>(0, 1, 0)),
            scale: 1.0
        )
    }
    
    // MARK: - Default Positions
    
    /// Default panel positions when not in training mode
    private let defaultPositions: [PanelIdentifier: SIMD3<Float>] = [
        .stats: SIMD3<Float>(x: -0.5, y: 0.0, z: -1.0),
        .goals: SIMD3<Float>(x: 0.0, y: 0.25, z: -1.0),
        .activities: SIMD3<Float>(x: 0.5, y: 0.0, z: -1.0),
        .chart: SIMD3<Float>(x: 0.0, y: -0.2, z: -1.0),
        .session: SIMD3<Float>(x: 0.0, y: 0.0, z: -0.8)
    ]
    
    /// Training mode positions (session centered, others faded)
    private let trainingPositions: [PanelIdentifier: SIMD3<Float>] = [
        .stats: SIMD3<Float>(x: -0.7, y: 0.0, z: -1.2),      // Further left and back
        .goals: SIMD3<Float>(x: 0.0, y: 0.4, z: -1.2),       // Higher and back
        .activities: SIMD3<Float>(x: 0.7, y: 0.0, z: -1.2),  // Further right and back
        .chart: SIMD3<Float>(x: 0.0, y: -0.3, z: -1.2),      // Lower and back
        .session: SIMD3<Float>(x: 0.0, y: 0.0, z: -0.7)      // Centered and closer
    ]
    
    /// Default opacities for all panels
    private let defaultOpacity: Double = 1.0
    
    /// Reduced opacity for background panels during training
    private let backgroundOpacity: Double = 0.3
    
    /// Session panel opacity during training
    private let sessionOpacity: Double = 1.0
    
    /// Default panel sizes (width, height, depth) for occlusion detection
    private let panelSizes: [PanelIdentifier: SIMD3<Float>] = [
        .stats: SIMD3<Float>(0.3, 0.4, 0.05),
        .goals: SIMD3<Float>(0.35, 0.25, 0.05),
        .activities: SIMD3<Float>(0.3, 0.4, 0.05),
        .chart: SIMD3<Float>(0.4, 0.3, 0.05),
        .session: SIMD3<Float>(0.4, 0.35, 0.05)
    ]
    
    /// Target positions for panels being repositioned to avoid occlusion
    private var targetPositions: [PanelIdentifier: SIMD3<Float>] = [:]
    
    // MARK: - Initialization
    
    init() {
        // Initialize all panels to default positions and full opacity
        resetToDefaults()
    }
    
    // MARK: - Context-Aware Positioning
    
    /// Activates training mode: brings session panel to center, fades out others
    /// Requirements: 4.2, 4.3
    func activateTrainingMode() {
        isContextAware = true
        
        // Animate to training positions
        withAnimation(.spring(response: 0.8, dampingFraction: 0.75)) {
            // Session panel: center, closer, larger
            panelTransforms[.session] = PanelTransform(
                position: trainingPositions[.session]!,
                rotation: simd_quatf(angle: 0, axis: SIMD3<Float>(0, 1, 0)),
                scale: 1.15  // Slightly larger
            )
            panelOpacities[.session] = sessionOpacity
            
            // Other panels: move to periphery, fade out
            for panel in [PanelIdentifier.stats, .goals, .activities, .chart] {
                panelTransforms[panel] = PanelTransform(
                    position: trainingPositions[panel]!,
                    rotation: simd_quatf(angle: 0, axis: SIMD3<Float>(0, 1, 0)),
                    scale: 0.85  // Slightly smaller
                )
                panelOpacities[panel] = backgroundOpacity
            }
        }
    }
    
    /// Deactivates training mode: resets all panels to default positions
    /// Requirements: 4.4
    func deactivateTrainingMode() {
        isContextAware = false
        resetToDefaults()
    }
    
    /// Resets all panels to their default positions and full opacity
    /// Requirements: 4.4
    func resetToDefaults() {
        withAnimation(.spring(response: 0.8, dampingFraction: 0.75)) {
            for panel in PanelIdentifier.allCases {
                panelTransforms[panel] = PanelTransform(
                    position: defaultPositions[panel]!,
                    rotation: simd_quatf(angle: 0, axis: SIMD3<Float>(0, 1, 0)),
                    scale: 1.0
                )
                panelOpacities[panel] = defaultOpacity
            }
        }
    }
    
    /// Brings a specific panel to the front (closer to user)
    /// - Parameter panel: The panel to bring forward
    func bringToFront(panel: PanelIdentifier) {
        guard var transform = panelTransforms[panel] else { return }
        
        // Move panel 0.2 units closer
        transform.position.z += 0.2
        transform.scale = 1.1
        
        withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
            panelTransforms[panel] = transform
            panelOpacities[panel] = 1.0
        }
    }
    
    /// Sends a specific panel to the periphery (further from user)
    /// - Parameter panel: The panel to send back
    func sendToPeriphery(panel: PanelIdentifier) {
        guard var transform = panelTransforms[panel] else { return }
        
        // Move panel 0.2 units further
        transform.position.z -= 0.2
        transform.scale = 0.85
        
        withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
            panelTransforms[panel] = transform
            panelOpacities[panel] = backgroundOpacity
        }
    }
    
    /// Updates positioning based on gaze direction
    /// - Parameter gazeDirection: The user's current gaze direction vector
    func updateForGaze(direction gazeDirection: SIMD3<Float>) {
        // This is a placeholder for future gaze-based positioning
        // Currently not implemented as it requires ARKit gaze tracking integration
        // Requirements: 4.1 (future enhancement)
    }
    
    // MARK: - Occlusion Handling
    
    /// Updates mesh anchors from ARKit WorldTrackingProvider
    /// - Parameter anchors: Array of mesh anchors detected in the real world
    /// Requirements: 4.5
    func updateMeshAnchors(_ anchors: [ARAnchor]) {
        occlusionHandler.updateMeshAnchors(anchors)
        
        // Check all panels for occlusion and reposition if needed
        checkAndRepositionPanels()
    }
    
    /// Checks all panels for occlusion and repositions them if necessary
    /// Requirements: 4.5
    private func checkAndRepositionPanels() {
        for panel in PanelIdentifier.allCases {
            guard let currentTransform = panelTransforms[panel],
                  let panelSize = panelSizes[panel] else {
                continue
            }
            
            let currentPosition = currentTransform.position
            
            // Check if panel needs repositioning
            let (needsRepositioning, safePosition) = occlusionHandler.checkAndReposition(
                currentPosition: currentPosition,
                panelSize: panelSize
            )
            
            if needsRepositioning, let safePosition = safePosition {
                // Store target position for smooth interpolation
                targetPositions[panel] = safePosition
            } else {
                // Clear target if no longer needed
                targetPositions.removeValue(forKey: panel)
            }
        }
    }
    
    /// Updates panel positions with smooth transitions to avoid occlusion
    /// Should be called each frame when mesh anchors are active
    /// Requirements: 4.5
    func updateOcclusionAvoidance() {
        var hasChanges = false
        
        for (panel, targetPosition) in targetPositions {
            guard var currentTransform = panelTransforms[panel] else { continue }
            
            // Apply smooth repositioning
            let newPosition = occlusionHandler.applySmoothRepositioning(
                from: currentTransform.position,
                to: targetPosition
            )
            
            // Update transform if position changed
            if newPosition != currentTransform.position {
                currentTransform.position = newPosition
                panelTransforms[panel] = currentTransform
                hasChanges = true
            }
            
            // Remove target if we've reached it
            if simd_distance(newPosition, targetPosition) < 0.001 {
                targetPositions.removeValue(forKey: panel)
            }
        }
        
        // Animate changes if any occurred
        if hasChanges {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                // Animation will be applied to the published properties
            }
        }
    }
    
    /// Manually repositions a panel to avoid occlusion at a specific position
    /// - Parameters:
    ///   - panel: The panel to reposition
    ///   - position: The desired position
    /// Requirements: 4.5
    func avoidOcclusion(panel: PanelIdentifier, at position: SIMD3<Float>) {
        guard let panelSize = panelSizes[panel] else { return }
        
        // Check if position is occluded
        if let safePosition = occlusionHandler.findSafePosition(
            from: position,
            panelSize: panelSize
        ) {
            // Set target for smooth transition
            targetPositions[panel] = safePosition
        }
    }
    
    /// Clears all mesh anchor data (useful when exiting VR mode)
    func clearMeshAnchors() {
        occlusionHandler.clearMeshAnchors()
        targetPositions.removeAll()
    }
    
    /// Gets the number of currently tracked mesh anchors
    var meshAnchorCount: Int {
        return occlusionHandler.meshCount
    }
    
    /// Gets the current transform for a panel
    /// - Parameter panel: The panel identifier
    /// - Returns: The panel's current transform, or identity if not found
    func getTransform(for panel: PanelIdentifier) -> PanelTransform {
        return panelTransforms[panel] ?? .identity
    }
    
    /// Gets the current opacity for a panel
    /// - Parameter panel: The panel identifier
    /// - Returns: The panel's current opacity (0.0 to 1.0)
    func getOpacity(for panel: PanelIdentifier) -> Double {
        return panelOpacities[panel] ?? defaultOpacity
    }
}

// MARK: - SwiftUI View Modifiers

/// View modifier to apply adaptive positioning to a panel
struct AdaptivePositionModifier: ViewModifier {
    let panel: AdaptivePositioner.PanelIdentifier
    @ObservedObject var positioner: AdaptivePositioner
    
    func body(content: Content) -> some View {
        let transform = positioner.getTransform(for: panel)
        let opacity = positioner.getOpacity(for: panel)
        
        content
            .offset(
                x: CGFloat(transform.position.x) * 100,
                y: CGFloat(transform.position.y) * 100
            )
            .scaleEffect(CGFloat(transform.scale))
            .opacity(opacity)
    }
}

extension View {
    /// Applies adaptive positioning to this view
    /// - Parameters:
    ///   - panel: The panel identifier
    ///   - positioner: The adaptive positioner instance
    /// - Returns: A view with adaptive positioning applied
    func adaptivePosition(
        panel: AdaptivePositioner.PanelIdentifier,
        positioner: AdaptivePositioner
    ) -> some View {
        self.modifier(AdaptivePositionModifier(panel: panel, positioner: positioner))
    }
}
