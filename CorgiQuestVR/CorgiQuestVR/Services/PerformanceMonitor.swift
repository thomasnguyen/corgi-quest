//
//  PerformanceMonitor.swift
//  CorgiQuestVR
//
//  Performance monitoring and optimization for VR features
//  Requirements: 6.1, 6.2, 6.3, 6.5
//

import Foundation
import Combine
import os.log

/// Monitors and optimizes performance for VR features
@MainActor
class PerformanceMonitor: ObservableObject {
    
    // MARK: - Published Properties
    
    /// Current frame rate (frames per second)
    @Published private(set) var currentFPS: Double = 60.0
    
    /// Current frame time in milliseconds
    @Published private(set) var frameTimeMs: Double = 16.67
    
    /// Whether performance is degraded (below 60fps)
    @Published private(set) var isPerformanceDegraded: Bool = false
    
    /// Current memory usage in MB
    @Published private(set) var memoryUsageMB: Double = 0.0
    
    /// Whether memory pressure is high
    @Published private(set) var isMemoryPressureHigh: Bool = false
    
    /// Current particle count
    @Published private(set) var activeParticleCount: Int = 0
    
    /// Current audio source count
    @Published private(set) var activeAudioSources: Int = 0
    
    // MARK: - Private Properties
    
    /// Frame time measurements for averaging
    private var frameTimeSamples: [TimeInterval] = []
    private let maxSamples: Int = 60 // Average over 1 second at 60fps
    
    /// Last frame timestamp
    private var lastFrameTime: Date?
    
    /// Performance thresholds
    private let targetFPS: Double = 60.0
    private let minAcceptableFPS: Double = 60.0
    private let maxFrameTimeMs: Double = 16.67 // 60fps = 16.67ms per frame
    
    /// Memory thresholds
    private let memoryWarningThresholdMB: Double = 500.0
    private let memoryCriticalThresholdMB: Double = 750.0
    
    /// Particle optimization
    private let maxParticlesNormal: Int = 100
    private let maxParticlesReduced: Int = 50
    private let maxParticlesCritical: Int = 25
    
    /// Audio optimization
    private let maxAudioSourcesNormal: Int = 5
    private let maxAudioSourcesReduced: Int = 3
    
    /// Logger for performance metrics
    private let logger = Logger(subsystem: "com.corgiquest.vr", category: "Performance")
    
    /// Performance optimization state
    private var isOptimizationActive: Bool = false
    
    // MARK: - Frame Time Measurement
    
    /// Records a frame time measurement
    /// Requirements: 6.1
    func recordFrame() {
        let now = Date()
        
        if let lastTime = lastFrameTime {
            let frameTime = now.timeIntervalSince(lastTime)
            frameTimeSamples.append(frameTime)
            
            // Keep only recent samples
            if frameTimeSamples.count > maxSamples {
                frameTimeSamples.removeFirst()
            }
            
            // Calculate average frame time
            let avgFrameTime = frameTimeSamples.reduce(0.0, +) / Double(frameTimeSamples.count)
            frameTimeMs = avgFrameTime * 1000.0
            
            // Calculate FPS
            currentFPS = 1.0 / avgFrameTime
            
            // Check if performance is degraded
            let wasDegraded = isPerformanceDegraded
            isPerformanceDegraded = currentFPS < minAcceptableFPS
            
            // Log performance degradation
            if isPerformanceDegraded && !wasDegraded {
                logger.warning("Performance degraded: \(self.currentFPS, privacy: .public) fps")
                triggerOptimization()
            } else if !isPerformanceDegraded && wasDegraded {
                logger.info("Performance recovered: \(self.currentFPS, privacy: .public) fps")
            }
            
            // Log frame time if exceeding budget
            if frameTimeMs > maxFrameTimeMs {
                logger.debug("Frame time exceeded budget: \(self.frameTimeMs, privacy: .public)ms")
            }
        }
        
        lastFrameTime = now
    }
    
    /// Gets the current frame time budget remaining
    /// - Returns: Milliseconds remaining in frame budget (negative if over budget)
    func getFrameBudgetRemaining() -> Double {
        return maxFrameTimeMs - frameTimeMs
    }
    
    // MARK: - Memory Monitoring
    
    /// Updates memory usage statistics
    /// Requirements: 6.2, 6.5
    func updateMemoryUsage() {
        // Get memory usage from task_info
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size) / 4
        
        let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                task_info(mach_task_self_,
                         task_flavor_t(MACH_TASK_BASIC_INFO),
                         $0,
                         &count)
            }
        }
        
        if kerr == KERN_SUCCESS {
            let usedBytes = Double(info.resident_size)
            memoryUsageMB = usedBytes / 1024.0 / 1024.0
            
            // Check memory pressure
            let wasHighPressure = isMemoryPressureHigh
            isMemoryPressureHigh = memoryUsageMB > memoryWarningThresholdMB
            
            // Log memory pressure changes
            if isMemoryPressureHigh && !wasHighPressure {
                logger.warning("High memory pressure: \(self.memoryUsageMB, privacy: .public) MB")
                triggerOptimization()
            } else if !isMemoryPressureHigh && wasHighPressure {
                logger.info("Memory pressure normalized: \(self.memoryUsageMB, privacy: .public) MB")
            }
            
            // Critical memory pressure
            if memoryUsageMB > memoryCriticalThresholdMB {
                logger.error("Critical memory pressure: \(self.memoryUsageMB, privacy: .public) MB")
                triggerAggressiveOptimization()
            }
        }
    }
    
    // MARK: - Feature Monitoring
    
    /// Updates particle count
    /// Requirements: 6.2
    /// - Parameter count: Current number of active particles
    func updateParticleCount(_ count: Int) {
        activeParticleCount = count
        
        // Log if particle count is high
        if count > maxParticlesNormal {
            logger.debug("High particle count: \(count, privacy: .public)")
        }
    }
    
    /// Updates audio source count
    /// Requirements: 6.3
    /// - Parameter count: Current number of active audio sources
    func updateAudioSourceCount(_ count: Int) {
        activeAudioSources = count
        
        // Log if audio source count is high
        if count > maxAudioSourcesNormal {
            logger.debug("High audio source count: \(count, privacy: .public)")
        }
    }
    
    // MARK: - Optimization
    
    /// Triggers performance optimization
    /// Requirements: 6.1, 6.2, 6.3
    private func triggerOptimization() {
        guard !isOptimizationActive else { return }
        
        isOptimizationActive = true
        logger.info("Triggering performance optimization")
        
        // Optimization will be handled by individual systems
        // This just sets the flag that optimization is needed
    }
    
    /// Triggers aggressive optimization for critical situations
    /// Requirements: 6.5
    private func triggerAggressiveOptimization() {
        logger.warning("Triggering aggressive performance optimization")
        
        // This signals that systems should use minimal quality settings
        isOptimizationActive = true
    }
    
    /// Resets optimization state when performance recovers
    func resetOptimization() {
        if isOptimizationActive && !isPerformanceDegraded && !isMemoryPressureHigh {
            isOptimizationActive = false
            logger.info("Performance optimization reset")
        }
    }
    
    // MARK: - Optimization Recommendations
    
    /// Gets recommended maximum particle count based on current performance
    /// Requirements: 6.2
    /// - Returns: Maximum particle count to maintain performance
    func getRecommendedMaxParticles() -> Int {
        if memoryUsageMB > memoryCriticalThresholdMB || currentFPS < 45.0 {
            return maxParticlesCritical
        } else if isPerformanceDegraded || isMemoryPressureHigh {
            return maxParticlesReduced
        } else {
            return maxParticlesNormal
        }
    }
    
    /// Gets recommended maximum audio sources based on current performance
    /// Requirements: 6.3
    /// - Returns: Maximum audio sources to maintain performance
    func getRecommendedMaxAudioSources() -> Int {
        if isPerformanceDegraded || isMemoryPressureHigh {
            return maxAudioSourcesReduced
        } else {
            return maxAudioSourcesNormal
        }
    }
    
    /// Checks if a feature should be reduced or disabled
    /// Requirements: 6.5
    /// - Parameter feature: The feature to check
    /// - Returns: True if the feature should be reduced
    func shouldReduceFeature(_ feature: PerformanceFeature) -> Bool {
        switch feature {
        case .particles:
            return activeParticleCount > getRecommendedMaxParticles()
        case .audio:
            return activeAudioSources > getRecommendedMaxAudioSources()
        case .shadows:
            return isPerformanceDegraded || isMemoryPressureHigh
        case .environmentalEffects:
            return memoryUsageMB > memoryCriticalThresholdMB
        }
    }
    
    // MARK: - Logging
    
    /// Logs current performance metrics
    func logMetrics() {
        logger.info("""
            Performance Metrics:
            - FPS: \(self.currentFPS, privacy: .public)
            - Frame Time: \(self.frameTimeMs, privacy: .public)ms
            - Memory: \(self.memoryUsageMB, privacy: .public)MB
            - Particles: \(self.activeParticleCount, privacy: .public)
            - Audio Sources: \(self.activeAudioSources, privacy: .public)
            - Degraded: \(self.isPerformanceDegraded, privacy: .public)
            - Memory Pressure: \(self.isMemoryPressureHigh, privacy: .public)
            """)
    }
    
    /// Logs a performance warning
    /// - Parameter message: Warning message
    func logWarning(_ message: String) {
        logger.warning("\(message, privacy: .public)")
    }
    
    /// Logs a performance error
    /// - Parameter message: Error message
    func logError(_ message: String) {
        logger.error("\(message, privacy: .public)")
    }
    
    // MARK: - Reset
    
    /// Resets all performance metrics
    func reset() {
        frameTimeSamples.removeAll()
        lastFrameTime = nil
        currentFPS = 60.0
        frameTimeMs = 16.67
        isPerformanceDegraded = false
        memoryUsageMB = 0.0
        isMemoryPressureHigh = false
        activeParticleCount = 0
        activeAudioSources = 0
        isOptimizationActive = false
    }
}

// MARK: - Supporting Types

/// Features that can be optimized for performance
enum PerformanceFeature {
    case particles
    case audio
    case shadows
    case environmentalEffects
}

