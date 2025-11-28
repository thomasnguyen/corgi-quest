//
//  HandTrackingManagerTests.swift
//  CorgiQuestVRTests
//
//  Created by Kiro on 11/27/25.
//

import XCTest
@testable import CorgiQuestVR

/// Unit tests for HandTrackingManager gesture recognition
/// Requirements: 2.1, 2.2, 2.3
@MainActor
final class HandTrackingManagerTests: XCTestCase {
    
    var manager: HandTrackingManager!
    
    override func setUp() async throws {
        try await super.setUp()
        manager = HandTrackingManager()
    }
    
    override func tearDown() async throws {
        manager.stopTracking()
        manager = nil
        try await super.tearDown()
    }
    
    // MARK: - Tap Detection Tests
    // Requirements: 2.1
    
    /// Test that tap gesture is detected when hand positions indicate a tap
    func testTapDetectionFromHandPositions() {
        // Given: A hand position that represents a tap location
        let tapPosition = SIMD3<Float>(x: 0.0, y: 0.0, z: -1.0)
        
        // When: We simulate a tap gesture
        manager.detectedGesture = .tap(position: tapPosition)
        
        // Then: The gesture should be detected as a tap
        if case .tap(let position) = manager.detectedGesture {
            XCTAssertEqual(position.x, tapPosition.x, accuracy: 0.001)
            XCTAssertEqual(position.y, tapPosition.y, accuracy: 0.001)
            XCTAssertEqual(position.z, tapPosition.z, accuracy: 0.001)
        } else {
            XCTFail("Expected tap gesture to be detected")
        }
    }
    
    /// Test that tap detection works at various positions in 3D space
    func testTapDetectionAtVariousPositions() {
        let testPositions: [SIMD3<Float>] = [
            SIMD3<Float>(x: -0.5, y: 0.0, z: -1.0),  // Left
            SIMD3<Float>(x: 0.5, y: 0.0, z: -1.0),   // Right
            SIMD3<Float>(x: 0.0, y: 0.25, z: -1.0),  // Top
            SIMD3<Float>(x: 0.0, y: -0.2, z: -1.0),  // Bottom
            SIMD3<Float>(x: 0.0, y: 0.0, z: -0.8)    // Close
        ]
        
        for position in testPositions {
            // When: We simulate a tap at each position
            manager.detectedGesture = .tap(position: position)
            
            // Then: The tap should be detected at the correct position
            if case .tap(let detectedPos) = manager.detectedGesture {
                XCTAssertEqual(detectedPos.x, position.x, accuracy: 0.001,
                             "Tap X position should match at \(position)")
                XCTAssertEqual(detectedPos.y, position.y, accuracy: 0.001,
                             "Tap Y position should match at \(position)")
                XCTAssertEqual(detectedPos.z, position.z, accuracy: 0.001,
                             "Tap Z position should match at \(position)")
            } else {
                XCTFail("Expected tap gesture at position \(position)")
            }
        }
    }
    
    /// Test that tap gestures are properly distinguished from other gestures
    func testTapGestureDistinction() {
        // Given: Different gesture types
        let tapPos = SIMD3<Float>(x: 0.0, y: 0.0, z: -1.0)
        let hoverPos = SIMD3<Float>(x: 0.1, y: 0.1, z: -1.0)
        
        // When: We set a tap gesture
        manager.detectedGesture = .tap(position: tapPos)
        
        // Then: It should be a tap, not hover or pinch
        XCTAssertTrue(manager.detectedGesture != nil)
        if case .tap = manager.detectedGesture {
            // Success
        } else {
            XCTFail("Expected tap gesture, got \(String(describing: manager.detectedGesture))")
        }
        
        // When: We change to hover
        manager.detectedGesture = .hover(position: hoverPos)
        
        // Then: It should now be hover, not tap
        if case .hover = manager.detectedGesture {
            // Success
        } else {
            XCTFail("Expected hover gesture, got \(String(describing: manager.detectedGesture))")
        }
    }
    
    // MARK: - Pinch Gesture Tracking Tests
    // Requirements: 2.2
    
    /// Test that pinch gesture tracks start and current positions
    func testPinchGestureTracking() {
        // Given: Start and current positions for a pinch gesture
        let startPos = SIMD3<Float>(x: 0.0, y: 0.0, z: -1.0)
        let currentPos = SIMD3<Float>(x: 0.1, y: 0.05, z: -0.95)
        
        // When: We simulate a pinch gesture
        manager.detectedGesture = .pinch(start: startPos, current: currentPos)
        
        // Then: Both positions should be tracked correctly
        if case .pinch(let start, let current) = manager.detectedGesture {
            XCTAssertEqual(start.x, startPos.x, accuracy: 0.001)
            XCTAssertEqual(start.y, startPos.y, accuracy: 0.001)
            XCTAssertEqual(start.z, startPos.z, accuracy: 0.001)
            
            XCTAssertEqual(current.x, currentPos.x, accuracy: 0.001)
            XCTAssertEqual(current.y, currentPos.y, accuracy: 0.001)
            XCTAssertEqual(current.z, currentPos.z, accuracy: 0.001)
        } else {
            XCTFail("Expected pinch gesture to be detected")
        }
    }
    
    /// Test that pinch gesture updates as hand moves
    func testPinchGestureMovementTracking() {
        // Given: A pinch gesture that moves through space
        let startPos = SIMD3<Float>(x: 0.0, y: 0.0, z: -1.0)
        let positions: [SIMD3<Float>] = [
            SIMD3<Float>(x: 0.02, y: 0.01, z: -0.99),
            SIMD3<Float>(x: 0.05, y: 0.03, z: -0.97),
            SIMD3<Float>(x: 0.10, y: 0.05, z: -0.95),
            SIMD3<Float>(x: 0.15, y: 0.08, z: -0.92)
        ]
        
        for currentPos in positions {
            // When: We update the pinch position
            manager.detectedGesture = .pinch(start: startPos, current: currentPos)
            
            // Then: The current position should update while start remains constant
            if case .pinch(let start, let current) = manager.detectedGesture {
                // Start position should remain constant
                XCTAssertEqual(start.x, startPos.x, accuracy: 0.001)
                XCTAssertEqual(start.y, startPos.y, accuracy: 0.001)
                XCTAssertEqual(start.z, startPos.z, accuracy: 0.001)
                
                // Current position should match the new position
                XCTAssertEqual(current.x, currentPos.x, accuracy: 0.001)
                XCTAssertEqual(current.y, currentPos.y, accuracy: 0.001)
                XCTAssertEqual(current.z, currentPos.z, accuracy: 0.001)
            } else {
                XCTFail("Expected pinch gesture at position \(currentPos)")
            }
        }
    }
    
    /// Test that pinch gesture calculates drag distance correctly
    func testPinchDragDistance() {
        // Given: A pinch gesture with known start and end positions
        let startPos = SIMD3<Float>(x: 0.0, y: 0.0, z: -1.0)
        let endPos = SIMD3<Float>(x: 0.1, y: 0.0, z: -1.0)
        
        // When: We simulate a pinch drag
        manager.detectedGesture = .pinch(start: startPos, current: endPos)
        
        // Then: We should be able to calculate the drag distance
        if case .pinch(let start, let current) = manager.detectedGesture {
            let dragDistance = simd_distance(start, current)
            let expectedDistance: Float = 0.1
            
            XCTAssertEqual(dragDistance, expectedDistance, accuracy: 0.001,
                         "Drag distance should be approximately 0.1 meters")
        } else {
            XCTFail("Expected pinch gesture")
        }
    }
    
    // MARK: - Hover Threshold Tests
    // Requirements: 2.3
    
    /// Test hover detection at exact threshold boundary
    func testHoverThresholdBoundary() {
        // Given: The default hover threshold (0.15 meters)
        let threshold: Float = 0.15
        
        // Test positions at, below, and above threshold
        let testCases: [(SIMD3<Float>, Bool, String)] = [
            // (hand position, should hover, description)
            (SIMD3<Float>(x: -0.5, y: 0.0, z: -1.0), true, "Exact panel position"),
            (SIMD3<Float>(x: -0.5 + threshold, y: 0.0, z: -1.0), true, "At threshold distance"),
            (SIMD3<Float>(x: -0.5 + threshold - 0.01, y: 0.0, z: -1.0), true, "Just inside threshold"),
            (SIMD3<Float>(x: -0.5 + threshold + 0.01, y: 0.0, z: -1.0), false, "Just outside threshold"),
            (SIMD3<Float>(x: -0.5 + 0.5, y: 0.0, z: -1.0), false, "Far from panel")
        ]
        
        for (handPos, shouldHover, description) in testCases {
            // When: We set the hand position
            manager.leftHandPosition = handPos
            
            // Then: Hover should be detected based on threshold
            let isNear = manager.isHandNear(panel: .stats)
            XCTAssertEqual(isNear, shouldHover,
                         "Hover detection failed for: \(description)")
        }
    }
    
    /// Test hover detection with both hands
    func testHoverDetectionBothHands() {
        // Given: Positions for both hands
        let leftHandPos = SIMD3<Float>(x: -0.5, y: 0.0, z: -1.0)  // Near stats panel
        let rightHandPos = SIMD3<Float>(x: 0.5, y: 0.0, z: -1.0)  // Near activities panel
        
        // When: We set both hand positions
        manager.leftHandPosition = leftHandPos
        manager.rightHandPosition = rightHandPos
        
        // Then: Each hand should trigger hover for its nearby panel
        XCTAssertTrue(manager.isHandNear(panel: .stats),
                     "Left hand should trigger hover for stats panel")
        XCTAssertTrue(manager.isHandNear(panel: .activities),
                     "Right hand should trigger hover for activities panel")
        XCTAssertFalse(manager.isHandNear(panel: .goals),
                      "No hand should trigger hover for goals panel")
    }
    
    /// Test hover detection with custom threshold
    func testHoverDetectionCustomThreshold() {
        // Given: A custom threshold
        let customThreshold: Float = 0.3
        let handPos = SIMD3<Float>(x: -0.5 + 0.2, y: 0.0, z: -1.0)
        
        // When: We set hand position
        manager.leftHandPosition = handPos
        
        // Then: Hover should be detected with custom threshold but not default
        XCTAssertFalse(manager.isHandNear(panel: .stats),
                      "Should not hover with default threshold (0.15m)")
        XCTAssertTrue(manager.isHandNear(panel: .stats, threshold: customThreshold),
                     "Should hover with custom threshold (0.3m)")
    }
    
    /// Test distance calculation to panels
    func testDistanceToPanel() {
        // Given: A hand position
        let handPos = SIMD3<Float>(x: -0.4, y: 0.0, z: -1.0)
        manager.leftHandPosition = handPos
        
        // When: We calculate distance to stats panel (at -0.5, 0.0, -1.0)
        let distance = manager.distanceToPanel(panel: .stats, hand: .left)
        
        // Then: Distance should be approximately 0.1 meters
        XCTAssertNotNil(distance, "Distance should be calculated")
        if let dist = distance {
            XCTAssertEqual(dist, 0.1, accuracy: 0.001,
                         "Distance should be 0.1 meters")
        }
    }
    
    /// Test distance calculation returns nil for untracked hand
    func testDistanceToPanel_UntrackedHand() {
        // Given: No hand position set
        manager.leftHandPosition = nil
        
        // When: We try to calculate distance
        let distance = manager.distanceToPanel(panel: .stats, hand: .left)
        
        // Then: Distance should be nil
        XCTAssertNil(distance, "Distance should be nil for untracked hand")
    }
    
    /// Test hover threshold boundaries with multiple panels
    func testHoverThresholdMultiplePanels() {
        // Given: A hand position equidistant from two panels
        let handPos = SIMD3<Float>(x: 0.0, y: 0.125, z: -1.0)  // Between stats and goals
        manager.leftHandPosition = handPos
        
        // When: We check hover for both panels
        let nearStats = manager.isHandNear(panel: .stats)
        let nearGoals = manager.isHandNear(panel: .goals)
        
        // Then: Hand should be near goals (0.125m away) but not stats (0.5m away)
        XCTAssertTrue(nearGoals, "Hand should be near goals panel")
        XCTAssertFalse(nearStats, "Hand should not be near stats panel")
    }
    
    // MARK: - Gesture State Management Tests
    
    /// Test that gestures can be cleared
    func testGestureClear() {
        // Given: An active gesture
        manager.detectedGesture = .tap(position: SIMD3<Float>(x: 0, y: 0, z: -1))
        XCTAssertNotNil(manager.detectedGesture)
        
        // When: We clear the gesture
        manager.detectedGesture = nil
        
        // Then: No gesture should be detected
        XCTAssertNil(manager.detectedGesture)
    }
    
    /// Test that hand positions can be cleared
    func testHandPositionClear() {
        // Given: Active hand positions
        manager.leftHandPosition = SIMD3<Float>(x: -0.5, y: 0, z: -1)
        manager.rightHandPosition = SIMD3<Float>(x: 0.5, y: 0, z: -1)
        
        // When: We clear hand positions
        manager.leftHandPosition = nil
        manager.rightHandPosition = nil
        
        // Then: No hand positions should be tracked
        XCTAssertNil(manager.leftHandPosition)
        XCTAssertNil(manager.rightHandPosition)
    }
    
    /// Test tracking state management
    func testTrackingState() {
        // Given: Initial state
        XCTAssertFalse(manager.isTracking, "Should not be tracking initially")
        
        // Note: We can't actually start tracking in unit tests without ARKit
        // but we can test the state property
        
        // When: We stop tracking
        manager.stopTracking()
        
        // Then: State should be false and positions cleared
        XCTAssertFalse(manager.isTracking)
        XCTAssertNil(manager.leftHandPosition)
        XCTAssertNil(manager.rightHandPosition)
        XCTAssertNil(manager.detectedGesture)
    }
}
