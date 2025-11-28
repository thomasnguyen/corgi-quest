//
//  PanelPositionManager.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/27/25.
//

import Foundation
import SwiftUI
import simd

/// Manages panel positions and handles drag repositioning
/// Requirements: 2.2
@MainActor
class PanelPositionManager: ObservableObject {
    
    // MARK: - Published Properties
    
    /// Custom positions for panels (overrides defaults)
    @Published var customPositions: [PanelIdentifier: SIMD3<Float>] = [:]
    
    /// Currently dragged panel
    @Published var draggedPanel: PanelIdentifier?
    
    /// Visual feedback during drag
    @Published var isDragging: Bool = false
    
    // MARK: - Private Properties
    
    /// Initial position when drag started
    private var dragStartPosition: SIMD3<Float>?
    
    /// Initial hand position when drag started
    private var dragStartHandPosition: SIMD3<Float>?
    
    // MARK: - Default Positions
    
    /// Returns the default position for a panel
    /// Requirements: 2.2
    func defaultPosition(for panel: PanelIdentifier) -> SIMD3<Float> {
        switch panel {
        case .stats:
            return SIMD3<Float>(x: -0.5, y: 0.0, z: -1.0)
        case .goals:
            return SIMD3<Float>(x: 0.0, y: 0.25, z: -1.0)
        case .activities:
            return SIMD3<Float>(x: 0.5, y: 0.0, z: -1.0)
        case .chart:
            return SIMD3<Float>(x: 0.0, y: -0.2, z: -1.0)
        case .session:
            return SIMD3<Float>(x: 0.0, y: 0.0, z: -0.8)
        case .dogInfo:
            return SIMD3<Float>(x: 0.0, y: 0.5, z: -1.2)
        case .xpBar:
            return SIMD3<Float>(x: 0.0, y: 0.42, z: -1.2)
        }
    }
    
    /// Returns the current position for a panel (custom or default)
    /// Requirements: 2.2
    func position(for panel: PanelIdentifier) -> SIMD3<Float> {
        return customPositions[panel] ?? defaultPosition(for: panel)
    }
    
    // MARK: - Drag Handling
    
    /// Starts dragging a panel
    /// Requirements: 2.2
    /// - Parameters:
    ///   - panel: The panel to drag
    ///   - handPosition: Current hand position
    func startDrag(panel: PanelIdentifier, handPosition: SIMD3<Float>) {
        draggedPanel = panel
        dragStartPosition = position(for: panel)
        dragStartHandPosition = handPosition
        isDragging = true
        
        print("Started dragging panel: \(panel)")
    }
    
    /// Updates panel position during drag
    /// Requirements: 2.2
    /// - Parameter currentHandPosition: Current hand position
    func updateDrag(currentHandPosition: SIMD3<Float>) {
        guard let panel = draggedPanel,
              let startPos = dragStartPosition,
              let startHandPos = dragStartHandPosition else {
            return
        }
        
        // Calculate hand movement delta
        let delta = currentHandPosition - startHandPos
        
        // Apply delta to panel position
        let newPosition = startPos + delta
        
        // Clamp position to reasonable bounds
        let clampedPosition = clampPosition(newPosition)
        
        // Update custom position
        customPositions[panel] = clampedPosition
    }
    
    /// Ends dragging and saves the new position
    /// Requirements: 2.2
    func endDrag() {
        guard let panel = draggedPanel else { return }
        
        print("Ended dragging panel: \(panel) at position: \(customPositions[panel] ?? defaultPosition(for: panel))")
        
        // Save position (in a real app, this would persist to UserDefaults or backend)
        savePosition(for: panel)
        
        // Clear drag state
        draggedPanel = nil
        dragStartPosition = nil
        dragStartHandPosition = nil
        isDragging = false
    }
    
    /// Cancels the current drag operation
    func cancelDrag() {
        guard let panel = draggedPanel else { return }
        
        // Restore original position
        customPositions[panel] = dragStartPosition
        
        // Clear drag state
        draggedPanel = nil
        dragStartPosition = nil
        dragStartHandPosition = nil
        isDragging = false
    }
    
    // MARK: - Position Management
    
    /// Clamps position to reasonable bounds
    /// Requirements: 2.2
    private func clampPosition(_ position: SIMD3<Float>) -> SIMD3<Float> {
        let minX: Float = -1.0
        let maxX: Float = 1.0
        let minY: Float = -0.5
        let maxY: Float = 0.6
        let minZ: Float = -1.5
        let maxZ: Float = -0.5
        
        return SIMD3<Float>(
            x: max(minX, min(maxX, position.x)),
            y: max(minY, min(maxY, position.y)),
            z: max(minZ, min(maxZ, position.z))
        )
    }
    
    /// Saves position for a panel (placeholder for persistence)
    /// Requirements: 2.2
    private func savePosition(for panel: PanelIdentifier) {
        // In a real app, save to UserDefaults or backend
        // For now, just keep in memory
        print("Saved position for \(panel): \(customPositions[panel] ?? defaultPosition(for: panel))")
    }
    
    /// Resets a panel to its default position
    /// Requirements: 2.2
    func resetPosition(for panel: PanelIdentifier) {
        customPositions.removeValue(forKey: panel)
        print("Reset position for \(panel)")
    }
    
    /// Resets all panels to default positions
    func resetAllPositions() {
        customPositions.removeAll()
        print("Reset all panel positions")
    }
}

// MARK: - Visual Feedback

/// View modifier for drag visual feedback
/// Requirements: 2.2
struct DragFeedbackModifier: ViewModifier {
    let isDragging: Bool
    
    func body(content: Content) -> some View {
        content
            .scaleEffect(isDragging ? 1.05 : 1.0)
            .opacity(isDragging ? 0.9 : 1.0)
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .strokeBorder(
                        Color.cyan.opacity(isDragging ? 0.8 : 0.0),
                        lineWidth: isDragging ? 4 : 0
                    )
            )
            .shadow(
                color: .cyan.opacity(isDragging ? 0.6 : 0.0),
                radius: isDragging ? 25 : 0,
                x: 0,
                y: 0
            )
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isDragging)
    }
}

extension View {
    /// Adds drag visual feedback to a view
    /// Requirements: 2.2
    func dragFeedback(isDragging: Bool) -> some View {
        self.modifier(DragFeedbackModifier(isDragging: isDragging))
    }
}
