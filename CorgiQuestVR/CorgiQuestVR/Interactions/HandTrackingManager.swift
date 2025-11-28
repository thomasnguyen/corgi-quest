//
//  HandTrackingManager.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/27/25.
//

import Foundation
import ARKit
import RealityKit
import SwiftUI
import Combine

/// Manages hand tracking and gesture recognition for VR interactions
/// Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
@MainActor
class HandTrackingManager: ObservableObject {
    
    // MARK: - Published Properties
    
    /// Position of the left hand in 3D space (nil if not tracked)
    @Published var leftHandPosition: SIMD3<Float>?
    
    /// Position of the right hand in 3D space (nil if not tracked)
    @Published var rightHandPosition: SIMD3<Float>?
    
    /// Currently detected gesture
    @Published var detectedGesture: HandGesture?
    
    /// Whether hand tracking is currently active
    @Published var isTracking: Bool = false
    
    // MARK: - Private Properties
    
    /// ARKit hand tracking session
    private var handTrackingProvider: HandTrackingProvider?
    
    /// Task for processing hand tracking updates
    private var handTrackingTask: Task<Void, Never>?
    
    /// Previous hand positions for gesture detection
    private var previousLeftPosition: SIMD3<Float>?
    private var previousRightPosition: SIMD3<Float>?
    
    /// Pinch state tracking
    private var isPinching: Bool = false
    private var pinchStartPosition: SIMD3<Float>?
    
    /// Tap detection timing
    private var lastTapTime: Date = .distantPast
    private let tapDebounceInterval: TimeInterval = 0.3
    
    // MARK: - Configuration Constants
    
    /// Distance threshold for hover detection (in meters)
    private let hoverThreshold: Float = 0.15
    
    /// Distance threshold for pinch detection (thumb-index distance)
    private let pinchThreshold: Float = 0.03
    
    /// Minimum movement for drag detection (in meters)
    private let dragThreshold: Float = 0.02
    
    /// Velocity threshold for tap detection (m/s)
    private let tapVelocityThreshold: Float = 0.5
    
    // MARK: - Initialization
    
    init() {
        // Initialization happens in startTracking()
    }
    
    // MARK: - Public Methods
    
    /// Starts hand tracking using ARKit
    /// Requirements: 2.1
    func startTracking() async {
        guard !isTracking else { return }
        
        // Check if hand tracking is supported
        guard HandTrackingProvider.isSupported else {
            print("Hand tracking is not supported on this device")
            return
        }
        
        do {
            // Create hand tracking provider
            let provider = HandTrackingProvider()
            handTrackingProvider = provider
            
            // Start the provider
            try await provider.start()
            
            isTracking = true
            print("Hand tracking started successfully")
            
            // Start processing hand updates
            startProcessingHandUpdates()
            
        } catch {
            print("Failed to start hand tracking: \(error)")
            isTracking = false
        }
    }
    
    /// Stops hand tracking and cleans up resources
    /// Requirements: 2.1
    func stopTracking() {
        handTrackingTask?.cancel()
        handTrackingTask = nil
        
        handTrackingProvider?.stop()
        handTrackingProvider = nil
        
        isTracking = false
        leftHandPosition = nil
        rightHandPosition = nil
        detectedGesture = nil
        
        print("Hand tracking stopped")
    }
    
    /// Checks if a hand is near a specific panel
    /// Requirements: 2.3
    /// - Parameters:
    ///   - panel: The panel identifier to check
    ///   - threshold: Distance threshold (defaults to hoverThreshold)
    /// - Returns: True if either hand is within threshold distance
    func isHandNear(panel: PanelIdentifier, threshold: Float? = nil) -> Bool {
        let checkThreshold = threshold ?? hoverThreshold
        let panelPos = panelPosition(for: panel)
        
        // Check left hand
        if let leftPos = leftHandPosition {
            let distance = simd_distance(leftPos, panelPos)
            if distance <= checkThreshold {
                return true
            }
        }
        
        // Check right hand
        if let rightPos = rightHandPosition {
            let distance = simd_distance(rightPos, panelPos)
            if distance <= checkThreshold {
                return true
            }
        }
        
        return false
    }
    
    /// Calculates distance between hand and panel
    /// Requirements: 2.3, 2.4
    /// - Parameters:
    ///   - panel: The panel identifier
    ///   - hand: Which hand to check (.left or .right)
    /// - Returns: Distance in meters, or nil if hand not tracked
    func distanceToPanel(panel: PanelIdentifier, hand: HandSide) -> Float? {
        let panelPos = panelPosition(for: panel)
        
        let handPos: SIMD3<Float>?
        switch hand {
        case .left:
            handPos = leftHandPosition
        case .right:
            handPos = rightHandPosition
        }
        
        guard let pos = handPos else { return nil }
        return simd_distance(pos, panelPos)
    }
    
    // MARK: - Private Methods
    
    /// Starts processing hand tracking updates in a background task
    private func startProcessingHandUpdates() {
        handTrackingTask = Task {
            guard let provider = handTrackingProvider else { return }
            
            for await update in provider.anchorUpdates {
                await processHandUpdate(update)
                
                // Check if task was cancelled
                if Task.isCancelled {
                    break
                }
            }
        }
    }
    
    /// Processes a single hand tracking update
    /// Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
    private func processHandUpdate(_ update: AnchorUpdate<HandAnchor>) {
        let anchor = update.anchor
        
        // Update hand positions
        switch anchor.chirality {
        case .left:
            leftHandPosition = anchor.originFromAnchorTransform.columns.3.xyz
            previousLeftPosition = leftHandPosition
        case .right:
            rightHandPosition = anchor.originFromAnchorTransform.columns.3.xyz
            previousRightPosition = rightHandPosition
        }
        
        // Detect gestures
        detectGestures(from: anchor)
    }
    
    /// Detects gestures from hand anchor data
    /// Requirements: 2.1, 2.2, 2.5
    private func detectGestures(from anchor: HandAnchor) {
        // Get hand skeleton
        guard let skeleton = anchor.handSkeleton else { return }
        
        // Get key joint positions
        guard let thumbTip = skeleton.joint(.thumbTip),
              let indexTip = skeleton.joint(.indexFingerTip),
              let wrist = skeleton.joint(.wrist) else {
            return
        }
        
        let thumbPos = thumbTip.anchorFromJointTransform.columns.3.xyz
        let indexPos = indexTip.anchorFromJointTransform.columns.3.xyz
        let wristPos = wrist.anchorFromJointTransform.columns.3.xyz
        
        // Calculate thumb-index distance for pinch detection
        let thumbIndexDistance = simd_distance(thumbPos, indexPos)
        
        // Detect pinch gesture
        if thumbIndexDistance < pinchThreshold {
            if !isPinching {
                // Pinch started
                isPinching = true
                pinchStartPosition = wristPos
                detectedGesture = .pinch(start: wristPos, current: wristPos)
            } else {
                // Pinch continuing - check for drag
                if let startPos = pinchStartPosition {
                    let dragDistance = simd_distance(startPos, wristPos)
                    if dragDistance > dragThreshold {
                        detectedGesture = .pinch(start: startPos, current: wristPos)
                    }
                }
            }
        } else {
            if isPinching {
                // Pinch released
                isPinching = false
                pinchStartPosition = nil
                detectedGesture = nil
            }
        }
        
        // Detect tap gesture (quick pinch and release)
        if !isPinching && thumbIndexDistance < pinchThreshold * 1.5 {
            let now = Date()
            if now.timeIntervalSince(lastTapTime) > tapDebounceInterval {
                detectedGesture = .tap(position: indexPos)
                lastTapTime = now
                
                // Clear tap gesture after short delay
                Task {
                    try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
                    if case .tap = detectedGesture {
                        detectedGesture = nil
                    }
                }
            }
        }
        
        // Detect hover (hand near panel without pinching)
        if !isPinching {
            detectedGesture = .hover(position: indexPos)
        }
        
        // Detect dismiss gesture (hand wave or specific gesture)
        // For now, we'll use a simple palm-facing-forward detection
        // This can be enhanced with more sophisticated gesture recognition
    }
    
    /// Returns the 3D position for a panel based on its identifier
    /// Requirements: 2.3
    /// - Parameter identifier: Panel identifier
    /// - Returns: 3D position in space
    private func panelPosition(for identifier: PanelIdentifier) -> SIMD3<Float> {
        switch identifier {
        case .stats:
            // Left panel: Stat Orbs
            return SIMD3<Float>(x: -0.5, y: 0.0, z: -1.0)
        case .goals:
            // Top panel: Goals
            return SIMD3<Float>(x: 0.0, y: 0.25, z: -1.0)
        case .activities:
            // Right panel: Activities
            return SIMD3<Float>(x: 0.5, y: 0.0, z: -1.0)
        case .chart:
            // Bottom panel: Weekly Chart
            return SIMD3<Float>(x: 0.0, y: -0.2, z: -1.0)
        case .session:
            // Center panel: Session
            return SIMD3<Float>(x: 0.0, y: 0.0, z: -0.8)
        case .dogInfo:
            // Top center: Dog info
            return SIMD3<Float>(x: 0.0, y: 0.5, z: -1.2)
        case .xpBar:
            // Below dog info
            return SIMD3<Float>(x: 0.0, y: 0.42, z: -1.2)
        }
    }
    
    // MARK: - Cleanup
    
    deinit {
        stopTracking()
    }
}

// MARK: - Supporting Types

/// Represents different types of hand gestures
/// Requirements: 2.1, 2.2, 2.5
enum HandGesture: Equatable {
    /// Tap gesture at a specific position
    case tap(position: SIMD3<Float>)
    
    /// Pinch gesture with start and current positions
    case pinch(start: SIMD3<Float>, current: SIMD3<Float>)
    
    /// Hover gesture at a specific position
    case hover(position: SIMD3<Float>)
    
    /// Dismiss gesture
    case dismiss
}

/// Identifies which hand is being tracked
enum HandSide {
    case left
    case right
}

/// Identifies different panels in the VR interface
/// Requirements: 2.3
enum PanelIdentifier {
    case stats
    case goals
    case activities
    case chart
    case session
    case dogInfo
    case xpBar
}

// MARK: - SIMD Extensions

extension SIMD4 where Scalar == Float {
    /// Extracts XYZ components from a SIMD4 (ignoring W)
    var xyz: SIMD3<Float> {
        return SIMD3<Float>(x: self.x, y: self.y, z: self.z)
    }
}
