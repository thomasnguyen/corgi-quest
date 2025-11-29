//
//  PanelHoverModifier.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/27/25.
//

import SwiftUI
import Combine

/// View modifier that adds hover effects to panels
/// Requirements: 2.3, 2.4
struct PanelHoverModifier: ViewModifier {
    let isHovered: Bool
    let panelColor: Color
    
    // Animation state
    @State private var glowIntensity: Double = 0.0
    
    func body(content: Content) -> some View {
        content
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .strokeBorder(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                panelColor.opacity(isHovered ? 0.8 : 0.0),
                                panelColor.opacity(isHovered ? 0.4 : 0.0)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: isHovered ? 3 : 0
                    )
                    .animation(.easeInOut(duration: 0.3), value: isHovered)
            )
                x: 0,
                y: 0
            )
            .scaleEffect(isHovered ? 1.02 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isHovered)
            .onChange(of: isHovered) { oldValue, newValue in
                if newValue {
                    // Start pulsing glow animation
                    withAnimation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true)) {
                        glowIntensity = 1.0
                    }
                } else {
                    // Stop glow animation
                    withAnimation(.easeOut(duration: 0.3)) {
                        glowIntensity = 0.0
                    }
                }
            }
    }
}

extension View {
    /// Adds hover effect to a panel
    /// - Parameters:
    ///   - isHovered: Whether the panel is currently hovered
    ///   - color: The color to use for the glow effect
    /// - Returns: Modified view with hover effects
    func panelHover(isHovered: Bool, color: Color = .cyan) -> some View {
        self.modifier(PanelHoverModifier(isHovered: isHovered, panelColor: color))
    }
}

/// Hover state manager for panels
/// Requirements: 2.3, 2.4
@MainActor
class PanelHoverState: ObservableObject {
    @Published var hoveredPanel: PanelIdentifier?
    
    /// Updates the hovered panel based on hand tracking
    func updateHover(from handTracking: HandTrackingManager) {
        // Check each panel for hover
        let panels: [PanelIdentifier] = [.stats, .goals, .activities, .chart, .session, .dogInfo, .xpBar]
        
        for panel in panels {
            if handTracking.isHandNear(panel: panel) {
                if hoveredPanel != panel {
                    hoveredPanel = panel
                }
                return
            }
        }
        
        // No panel is hovered
        hoveredPanel = nil
    }
    
    /// Checks if a specific panel is hovered
    func isHovered(_ panel: PanelIdentifier) -> Bool {
        return hoveredPanel == panel
    }
}
