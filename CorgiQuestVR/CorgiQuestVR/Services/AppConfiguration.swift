//
//  AppConfiguration.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/27/25.
//

import Foundation
import Combine

/// Global app configuration with feature toggles and accessibility options
/// Requirements: All (Task 7)
@MainActor
class AppConfiguration: ObservableObject {
    
    // MARK: - Singleton
    
    static let shared = AppConfiguration()
    
    // MARK: - Feature Toggles (for debugging)
    
    /// Enable/disable spatial audio system
    @Published var spatialAudioEnabled: Bool = true {
        didSet {
            UserDefaults.standard.set(spatialAudioEnabled, forKey: "spatialAudioEnabled")
        }
    }
    
    /// Enable/disable hand tracking interactions
    @Published var handTrackingEnabled: Bool = true {
        didSet {
            UserDefaults.standard.set(handTrackingEnabled, forKey: "handTrackingEnabled")
        }
    }
    
    /// Enable/disable particle effects
    @Published var particleEffectsEnabled: Bool = true {
        didSet {
            UserDefaults.standard.set(particleEffectsEnabled, forKey: "particleEffectsEnabled")
        }
    }
    
    /// Enable/disable adaptive positioning
    @Published var adaptivePositioningEnabled: Bool = true {
        didSet {
            UserDefaults.standard.set(adaptivePositioningEnabled, forKey: "adaptivePositioningEnabled")
        }
    }
    
    /// Enable/disable environmental integration (lighting, shadows)
    @Published var environmentalIntegrationEnabled: Bool = true {
        didSet {
            UserDefaults.standard.set(environmentalIntegrationEnabled, forKey: "environmentalIntegrationEnabled")
        }
    }
    
    /// Enable/disable performance monitoring
    @Published var performanceMonitoringEnabled: Bool = true {
        didSet {
            UserDefaults.standard.set(performanceMonitoringEnabled, forKey: "performanceMonitoringEnabled")
        }
    }
    
    // MARK: - Accessibility Options
    
    /// Disable particle effects for motion sensitivity
    @Published var reduceMotion: Bool = false {
        didSet {
            UserDefaults.standard.set(reduceMotion, forKey: "reduceMotion")
        }
    }
    
    /// Enable audio descriptions for visual effects
    @Published var audioDescriptionsEnabled: Bool = false {
        didSet {
            UserDefaults.standard.set(audioDescriptionsEnabled, forKey: "audioDescriptionsEnabled")
        }
    }
    
    /// Increase contrast for better visibility
    @Published var highContrastMode: Bool = false {
        didSet {
            UserDefaults.standard.set(highContrastMode, forKey: "highContrastMode")
        }
    }
    
    /// Reduce transparency for better readability
    @Published var reduceTransparency: Bool = false {
        didSet {
            UserDefaults.standard.set(reduceTransparency, forKey: "reduceTransparency")
        }
    }
    
    /// Increase panel sizes for easier interaction
    @Published var largerPanels: Bool = false {
        didSet {
            UserDefaults.standard.set(largerPanels, forKey: "largerPanels")
        }
    }
    
    // MARK: - Graceful Degradation Settings
    
    /// Fallback to simplified mode if features fail
    @Published var enableGracefulDegradation: Bool = true {
        didSet {
            UserDefaults.standard.set(enableGracefulDegradation, forKey: "enableGracefulDegradation")
        }
    }
    
    /// Track which features have been degraded
    @Published var degradedFeatures: Set<String> = []
    
    // MARK: - Debug Settings
    
    /// Show performance overlay
    @Published var showPerformanceOverlay: Bool = false {
        didSet {
            UserDefaults.standard.set(showPerformanceOverlay, forKey: "showPerformanceOverlay")
        }
    }
    
    /// Show hand tracking debug visualization
    @Published var showHandTrackingDebug: Bool = false {
        didSet {
            UserDefaults.standard.set(showHandTrackingDebug, forKey: "showHandTrackingDebug")
        }
    }
    
    /// Show panel position debug info
    @Published var showPositionDebug: Bool = false {
        didSet {
            UserDefaults.standard.set(showPositionDebug, forKey: "showPositionDebug")
        }
    }
    
    /// Log all audio events
    @Published var logAudioEvents: Bool = false {
        didSet {
            UserDefaults.standard.set(logAudioEvents, forKey: "logAudioEvents")
        }
    }
    
    // MARK: - Initialization
    
    private init() {
        // Load saved preferences
        loadPreferences()
    }
    
    // MARK: - Persistence
    
    /// Load preferences from UserDefaults
    private func loadPreferences() {
        // Feature toggles
        spatialAudioEnabled = UserDefaults.standard.bool(forKey: "spatialAudioEnabled", defaultValue: true)
        handTrackingEnabled = UserDefaults.standard.bool(forKey: "handTrackingEnabled", defaultValue: true)
        particleEffectsEnabled = UserDefaults.standard.bool(forKey: "particleEffectsEnabled", defaultValue: true)
        adaptivePositioningEnabled = UserDefaults.standard.bool(forKey: "adaptivePositioningEnabled", defaultValue: true)
        environmentalIntegrationEnabled = UserDefaults.standard.bool(forKey: "environmentalIntegrationEnabled", defaultValue: true)
        performanceMonitoringEnabled = UserDefaults.standard.bool(forKey: "performanceMonitoringEnabled", defaultValue: true)
        
        // Accessibility options
        reduceMotion = UserDefaults.standard.bool(forKey: "reduceMotion", defaultValue: false)
        audioDescriptionsEnabled = UserDefaults.standard.bool(forKey: "audioDescriptionsEnabled", defaultValue: false)
        highContrastMode = UserDefaults.standard.bool(forKey: "highContrastMode", defaultValue: false)
        reduceTransparency = UserDefaults.standard.bool(forKey: "reduceTransparency", defaultValue: false)
        largerPanels = UserDefaults.standard.bool(forKey: "largerPanels", defaultValue: false)
        
        // Graceful degradation
        enableGracefulDegradation = UserDefaults.standard.bool(forKey: "enableGracefulDegradation", defaultValue: true)
        
        // Debug settings
        showPerformanceOverlay = UserDefaults.standard.bool(forKey: "showPerformanceOverlay", defaultValue: false)
        showHandTrackingDebug = UserDefaults.standard.bool(forKey: "showHandTrackingDebug", defaultValue: false)
        showPositionDebug = UserDefaults.standard.bool(forKey: "showPositionDebug", defaultValue: false)
        logAudioEvents = UserDefaults.standard.bool(forKey: "logAudioEvents", defaultValue: false)
    }
    
    /// Reset all settings to defaults
    func resetToDefaults() {
        spatialAudioEnabled = true
        handTrackingEnabled = true
        particleEffectsEnabled = true
        adaptivePositioningEnabled = true
        environmentalIntegrationEnabled = true
        performanceMonitoringEnabled = true
        
        reduceMotion = false
        audioDescriptionsEnabled = false
        highContrastMode = false
        reduceTransparency = false
        largerPanels = false
        
        enableGracefulDegradation = true
        degradedFeatures.removeAll()
        
        showPerformanceOverlay = false
        showHandTrackingDebug = false
        showPositionDebug = false
        logAudioEvents = false
    }
    
    // MARK: - Feature Management
    
    /// Check if a feature should be enabled
    /// - Parameter feature: Feature name
    /// - Returns: True if feature is enabled and not degraded
    func isFeatureEnabled(_ feature: String) -> Bool {
        // Check if feature is degraded
        if degradedFeatures.contains(feature) {
            return false
        }
        
        // Check feature toggle
        switch feature {
        case "spatialAudio":
            return spatialAudioEnabled
        case "handTracking":
            return handTrackingEnabled
        case "particleEffects":
            return particleEffectsEnabled && !reduceMotion
        case "adaptivePositioning":
            return adaptivePositioningEnabled
        case "environmentalIntegration":
            return environmentalIntegrationEnabled
        case "performanceMonitoring":
            return performanceMonitoringEnabled
        default:
            return true
        }
    }
    
    /// Degrade a feature due to error or performance
    /// - Parameter feature: Feature name to degrade
    func degradeFeature(_ feature: String) {
        guard enableGracefulDegradation else { return }
        
        degradedFeatures.insert(feature)
        print("⚠️ Feature degraded: \(feature)")
        
        // Log for debugging
        if logAudioEvents && feature == "spatialAudio" {
            print("Spatial audio has been disabled due to errors")
        }
    }
    
    /// Restore a degraded feature
    /// - Parameter feature: Feature name to restore
    func restoreFeature(_ feature: String) {
        degradedFeatures.remove(feature)
        print("✅ Feature restored: \(feature)")
    }
    
    /// Get panel scale multiplier based on accessibility settings
    /// - Returns: Scale multiplier (1.0 = normal, >1.0 = larger)
    func getPanelScaleMultiplier() -> Float {
        return largerPanels ? 1.3 : 1.0
    }
    
    /// Get panel opacity based on accessibility settings
    /// - Parameter baseOpacity: Base opacity value
    /// - Returns: Adjusted opacity
    func getPanelOpacity(baseOpacity: Double) -> Double {
        if reduceTransparency {
            return min(baseOpacity + 0.2, 1.0)
        }
        return baseOpacity
    }
}

// MARK: - UserDefaults Extension

extension UserDefaults {
    /// Get bool with default value if key doesn't exist
    func bool(forKey key: String, defaultValue: Bool) -> Bool {
        if object(forKey: key) == nil {
            return defaultValue
        }
        return bool(forKey: key)
    }
}
