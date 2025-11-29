//
//  PerformanceMonitorTests.swift
//  CorgiQuestVRTests
//
//  Tests for performance monitoring system
//

import XCTest
@testable import CorgiQuestVR

@MainActor
final class PerformanceMonitorTests: XCTestCase {
    
    var monitor: PerformanceMonitor!
    
    override func setUp() async throws {
        monitor = PerformanceMonitor()
    }
    
    override func tearDown() async throws {
        monitor = nil
    }
    
    // MARK: - Frame Time Tests
    
    func testFrameRecording() {
        // Record multiple frames
        for _ in 0..<10 {
            monitor.recordFrame()
            Thread.sleep(forTimeInterval: 0.016) // Simulate 60fps
        }
        
        // FPS should be close to 60
        XCTAssertGreaterThan(monitor.currentFPS, 50.0)
        XCTAssertLessThan(monitor.currentFPS, 70.0)
        
        // Frame time should be close to 16.67ms
        XCTAssertGreaterThan(monitor.frameTimeMs, 10.0)
        XCTAssertLessThan(monitor.frameTimeMs, 25.0)
    }
    
    func testPerformanceDegradation() {
        // Record frames with slow frame time
        for _ in 0..<10 {
            monitor.recordFrame()
            Thread.sleep(forTimeInterval: 0.020) // Simulate 50fps
        }
        
        // Should detect performance degradation
        XCTAssertTrue(monitor.isPerformanceDegraded)
    }
    
    func testFrameBudget() {
        // Record a fast frame
        monitor.recordFrame()
        Thread.sleep(forTimeInterval: 0.010) // 10ms frame
        monitor.recordFrame()
        
        // Should have budget remaining
        XCTAssertGreaterThan(monitor.getFrameBudgetRemaining(), 0)
    }
    
    // MARK: - Memory Tests
    
    func testMemoryMonitoring() {
        // Update memory usage
        monitor.updateMemoryUsage()
        
        // Memory usage should be positive
        XCTAssertGreaterThan(monitor.memoryUsageMB, 0)
    }
    
    // MARK: - Feature Monitoring Tests
    
    func testParticleCountTracking() {
        // Update particle count
        monitor.updateParticleCount(50)
        
        XCTAssertEqual(monitor.activeParticleCount, 50)
    }
    
    func testAudioSourceTracking() {
        // Update audio source count
        monitor.updateAudioSourceCount(3)
        
        XCTAssertEqual(monitor.activeAudioSources, 3)
    }
    
    // MARK: - Optimization Tests
    
    func testParticleOptimization() {
        // Normal performance - should allow max particles
        XCTAssertEqual(monitor.getRecommendedMaxParticles(), 100)
        
        // Simulate high particle count
        monitor.updateParticleCount(150)
        
        // Should recommend reduction
        XCTAssertTrue(monitor.shouldReduceFeature(.particles))
    }
    
    func testAudioOptimization() {
        // Normal performance - should allow max audio
        XCTAssertEqual(monitor.getRecommendedMaxAudioSources(), 5)
        
        // Simulate high audio count
        monitor.updateAudioSourceCount(10)
        
        // Should recommend reduction
        XCTAssertTrue(monitor.shouldReduceFeature(.audio))
    }
    
    func testReset() {
        // Record some data
        monitor.recordFrame()
        monitor.updateParticleCount(50)
        monitor.updateAudioSourceCount(3)
        
        // Reset
        monitor.reset()
        
        // Should be back to defaults
        XCTAssertEqual(monitor.currentFPS, 60.0)
        XCTAssertEqual(monitor.activeParticleCount, 0)
        XCTAssertEqual(monitor.activeAudioSources, 0)
    }
}

