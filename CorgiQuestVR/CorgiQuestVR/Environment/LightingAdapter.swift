//
//  LightingAdapter.swift
//  CorgiQuestVR
//
//  Environmental lighting adaptation for VR panels
//

import SwiftUI
import ARKit
import RealityKit
import Combine

/// Manages panel brightness and contrast based on environmental lighting conditions
@MainActor
class LightingAdapter: ObservableObject {
    // MARK: - Published Properties
    
    @Published var currentBrightness: Float = 1.0
    @Published var contrastMultiplier: Float = 1.0
    @Published var isHighContrastMode: Bool = false
    @Published var isOutdoorEnvironment: Bool = false
    
    /// Whether to use simplified mode for performance
    /// Requirements: 6.5
    var useSimplifiedMode: Bool = false
    
    // MARK: - Private Properties
    
    private var lightEstimate: ARLightEstimate?
    private let brightnessThreshold: Float = 1000.0  // Lux threshold for bright environments
    private let darkThreshold: Float = 100.0         // Lux threshold for dark environments
    private let outdoorThreshold: Float = 10000.0    // Lux threshold for outdoor detection
    
    // Smoothing for brightness changes
    private var targetBrightness: Float = 1.0
    private let smoothingFactor: Float = 0.1
    
    // MARK: - Initialization
    
    init() {
        // Start with default indoor lighting
        updateBrightnessSettings(ambientIntensity: 1000.0)
    }
    
    // MARK: - Public Methods
    
    /// Update lighting based on ARKit light estimate
    func updateFromARLightEstimate(_ estimate: ARLightEstimate) {
        self.lightEstimate = estimate
        
        // Get ambient light intensity in lumens
        let ambientIntensity = estimate.ambientIntensity
        
        updateBrightnessSettings(ambientIntensity: ambientIntensity)
    }
    
    /// Update lighting based on manual lux value
    func updateFromLuxValue(_ lux: Float) {
        updateBrightnessSettings(ambientIntensity: lux)
    }
    
    /// Get adjusted opacity for panels based on current lighting
    func adjustedOpacity(baseOpacity: Double = 0.95) -> Double {
        let brightnessAdjustment = Double(currentBrightness)
        return min(1.0, baseOpacity * brightnessAdjustment)
    }
    
    /// Get adjusted color for panels based on current lighting
    func adjustedColor(_ baseColor: Color) -> Color {
        if isHighContrastMode {
            // In high contrast mode, use pure black or white
            return baseColor.opacity(Double(contrastMultiplier))
        }
        return baseColor
    }
    
    /// Smooth update for brightness (call in update loop)
    func smoothUpdate(deltaTime: TimeInterval) {
        // In simplified mode, skip smooth transitions
        if useSimplifiedMode {
            currentBrightness = targetBrightness
            return
        }
        
        // Smoothly interpolate current brightness toward target
        let delta = (targetBrightness - currentBrightness) * smoothingFactor
        currentBrightness += delta
    }
    
    /// Reset to default lighting settings
    func resetToDefaults() {
        targetBrightness = 1.0
        currentBrightness = 1.0
        contrastMultiplier = 1.0
        isHighContrastMode = false
        isOutdoorEnvironment = false
    }
    
    // MARK: - Private Methods
    
    private func updateBrightnessSettings(ambientIntensity: Float) {
        // Detect outdoor environment
        isOutdoorEnvironment = ambientIntensity > outdoorThreshold
        
        // Calculate brightness adjustment
        if ambientIntensity < darkThreshold {
            // Dark environment - dim panels to reduce eye strain
            targetBrightness = 0.6
            contrastMultiplier = 0.8
            isHighContrastMode = false
        } else if ambientIntensity > brightnessThreshold {
            // Bright environment - increase contrast for visibility
            targetBrightness = 1.2
            contrastMultiplier = 1.3
            isHighContrastMode = ambientIntensity > outdoorThreshold
        } else {
            // Normal indoor lighting
            targetBrightness = 1.0
            contrastMultiplier = 1.0
            isHighContrastMode = false
        }
        
        // Clamp values to reasonable ranges
        targetBrightness = max(0.4, min(1.5, targetBrightness))
        contrastMultiplier = max(0.7, min(1.5, contrastMultiplier))
    }
}

// MARK: - Lighting Configuration

struct LightingConfig {
    static let defaultBrightness: Float = 1.0
    static let minBrightness: Float = 0.4
    static let maxBrightness: Float = 1.5
    
    static let defaultContrast: Float = 1.0
    static let minContrast: Float = 0.7
    static let maxContrast: Float = 1.5
    
    // Lux thresholds
    static let darkThreshold: Float = 100.0
    static let normalThreshold: Float = 1000.0
    static let outdoorThreshold: Float = 10000.0
}
