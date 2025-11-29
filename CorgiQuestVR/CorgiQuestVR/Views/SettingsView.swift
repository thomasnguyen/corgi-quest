//
//  SettingsView.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/27/25.
//

import SwiftUI

/// Settings view for feature toggles and accessibility options
/// Requirements: All (Task 7)
struct SettingsView: View {
    @ObservedObject var config = AppConfiguration.shared
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            Form {
                // Feature Toggles Section
                Section("Features") {
                    Toggle("Spatial Audio", isOn: $config.spatialAudioEnabled)
                        .help("3D positioned sound effects")
                    
                    Toggle("Hand Tracking", isOn: $config.handTrackingEnabled)
                        .help("Gesture-based interactions")
                    
                    Toggle("Particle Effects", isOn: $config.particleEffectsEnabled)
                        .help("Celebration animations")
                    
                    Toggle("Adaptive Positioning", isOn: $config.adaptivePositioningEnabled)
                        .help("Context-aware panel placement")
                    
                    Toggle("Environmental Integration", isOn: $config.environmentalIntegrationEnabled)
                        .help("Lighting and shadow adaptation")
                    
                    Toggle("Performance Monitoring", isOn: $config.performanceMonitoringEnabled)
                        .help("Track and optimize performance")
                }
                
                // Accessibility Section
                Section("Accessibility") {
                    Toggle("Reduce Motion", isOn: $config.reduceMotion)
                        .help("Disable particle effects for motion sensitivity")
                    
                    Toggle("Audio Descriptions", isOn: $config.audioDescriptionsEnabled)
                        .help("Spoken descriptions of visual effects")
                    
                    Toggle("High Contrast", isOn: $config.highContrastMode)
                        .help("Increase contrast for better visibility")
                    
                    Toggle("Reduce Transparency", isOn: $config.reduceTransparency)
                        .help("Make panels more opaque")
                    
                    Toggle("Larger Panels", isOn: $config.largerPanels)
                        .help("Increase panel size for easier interaction")
                }
                
                // Debug Section
                Section("Debug") {
                    Toggle("Performance Overlay", isOn: $config.showPerformanceOverlay)
                        .help("Show FPS and memory usage")
                    
                    Toggle("Hand Tracking Debug", isOn: $config.showHandTrackingDebug)
                        .help("Visualize hand positions")
                    
                    Toggle("Position Debug", isOn: $config.showPositionDebug)
                        .help("Show panel position info")
                    
                    Toggle("Log Audio Events", isOn: $config.logAudioEvents)
                        .help("Print audio events to console")
                }
                
                // Graceful Degradation Section
                Section("System") {
                    Toggle("Graceful Degradation", isOn: $config.enableGracefulDegradation)
                        .help("Automatically disable failing features")
                    
                    if !config.degradedFeatures.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Degraded Features:")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            
                            ForEach(Array(config.degradedFeatures), id: \.self) { feature in
                                HStack {
                                    Text(feature)
                                        .font(.caption)
                                    Spacer()
                                    Button("Restore") {
                                        config.restoreFeature(feature)
                                    }
                                    .font(.caption)
                                }
                            }
                        }
                    }
                }
                
                // Reset Section
                Section {
                    Button("Reset to Defaults", role: .destructive) {
                        config.resetToDefaults()
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    SettingsView()
}
