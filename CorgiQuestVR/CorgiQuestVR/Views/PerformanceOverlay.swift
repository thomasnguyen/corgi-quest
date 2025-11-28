//
//  PerformanceOverlay.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/27/25.
//

import SwiftUI

/// Performance overlay for debugging
/// Requirements: 6.1 (Task 7)
struct PerformanceOverlay: View {
    let performanceMonitor: PerformanceMonitor
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            // FPS
            HStack {
                Text("FPS:")
                    .font(.system(size: 12, weight: .semibold, design: .monospaced))
                Text(String(format: "%.1f", performanceMonitor.currentFPS))
                    .font(.system(size: 12, design: .monospaced))
                    .foregroundStyle(fpsColor)
            }
            
            // Frame Time
            HStack {
                Text("Frame:")
                    .font(.system(size: 12, weight: .semibold, design: .monospaced))
                Text(String(format: "%.2fms", performanceMonitor.frameTimeMs))
                    .font(.system(size: 12, design: .monospaced))
                    .foregroundStyle(frameTimeColor)
            }
            
            // Memory
            HStack {
                Text("Memory:")
                    .font(.system(size: 12, weight: .semibold, design: .monospaced))
                Text(String(format: "%.1fMB", performanceMonitor.memoryUsageMB))
                    .font(.system(size: 12, design: .monospaced))
                    .foregroundStyle(memoryColor)
            }
            
            // Particles
            HStack {
                Text("Particles:")
                    .font(.system(size: 12, weight: .semibold, design: .monospaced))
                Text("\(performanceMonitor.activeParticleCount)")
                    .font(.system(size: 12, design: .monospaced))
            }
            
            // Audio Sources
            HStack {
                Text("Audio:")
                    .font(.system(size: 12, weight: .semibold, design: .monospaced))
                Text("\(performanceMonitor.activeAudioSources)")
                    .font(.system(size: 12, design: .monospaced))
            }
            
            // Optimization Status
            if performanceMonitor.isPerformanceDegraded {
                Text("⚠️ Optimizing")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundStyle(.orange)
            }
        }
        .padding(8)
        .background(.black.opacity(0.7))
        .cornerRadius(8)
    }
    
    // MARK: - Color Helpers
    
    private var fpsColor: Color {
        if performanceMonitor.currentFPS >= 55 {
            return .green
        } else if performanceMonitor.currentFPS >= 45 {
            return .yellow
        } else {
            return .red
        }
    }
    
    private var frameTimeColor: Color {
        if performanceMonitor.frameTimeMs <= 16.67 {
            return .green
        } else if performanceMonitor.frameTimeMs <= 20 {
            return .yellow
        } else {
            return .red
        }
    }
    
    private var memoryColor: Color {
        if performanceMonitor.memoryUsageMB < 200 {
            return .green
        } else if performanceMonitor.memoryUsageMB < 300 {
            return .yellow
        } else {
            return .red
        }
    }
}

#Preview {
    PerformanceOverlay(performanceMonitor: PerformanceMonitor())
}
