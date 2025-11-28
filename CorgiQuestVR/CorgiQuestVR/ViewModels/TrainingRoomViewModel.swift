//
//  TrainingRoomViewModel.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/24/25.
//

import Foundation
import Combine
import simd
import ARKit
import RealityKit

/// ViewModel for managing TrainingRoomView state and data fetching
@MainActor
class TrainingRoomViewModel: ObservableObject {
    
    // MARK: - Published Properties
    
    /// Four stat orbs data (PHY, INT, IMP, SOC)
    @Published var stats: [StatData] = []
    
    /// Today's physical and mental goals with streak
    @Published var goals: GoalData?
    
    /// Recent 5 activities from the activity feed
    @Published var activities: [ActivityData] = []
    
    /// 7-day XP totals for the weekly chart
    @Published var weeklyXP: [DayXP] = []
    
    /// Dog's name
    @Published var dogName: String = ""

    /// Overall level
    @Published var dogLevel: Int = 1

    /// Current overall XP
    @Published var overallXp: Int = 0

    /// XP needed for next level
    @Published var xpToNextLevel: Int = 100
    
    /// Connection status indicator
    @Published var isConnected: Bool = true
    
    /// Error message for display
    @Published var errorMessage: String?
    
    // MARK: - Private Properties
    
    /// Network service for API calls
    private let networkService: NetworkService

    /// Timer for polling updates
    nonisolated(unsafe) private var pollingTimer: Timer?

    /// Polling interval in seconds
    private let pollingInterval: TimeInterval = 3.0
    
    /// Spatial audio manager for 3D positioned sounds
    let audioManager: SpatialAudioManager
    
    /// Celebration effects manager for particles
    let celebrationEffects: CelebrationEffects
    
    /// Environmental lighting adapter
    let lightingAdapter: LightingAdapter
    
    /// Shadow renderer for panels
    let shadowRenderer: ShadowRenderer
    
    /// Environment detector for space changes
    let environmentDetector: EnvironmentDetector
    
    /// Performance monitor for optimization
    /// Requirements: 6.1, 6.2, 6.3, 6.5
    let performanceMonitor: PerformanceMonitor
    
    /// Previous stat XP values for detecting completion
    private var previousStatXP: [String: Int] = [:]
    
    /// Previous stat levels for detecting level-ups
    private var previousStatLevels: [String: Int] = [:]
    
    /// Previous goal progress for detecting completion
    private var previousPhysicalProgress: Double = 0.0
    private var previousMentalProgress: Double = 0.0
    
    // MARK: - Initialization
    
    /// Initialize the ViewModel with a network service
    /// - Parameter networkService: The network service to use (defaults to production)
    init(networkService: NetworkService = NetworkService()) {
        self.networkService = networkService
        self.audioManager = SpatialAudioManager()
        self.celebrationEffects = CelebrationEffects()
        self.lightingAdapter = LightingAdapter()
        self.shadowRenderer = ShadowRenderer()
        self.environmentDetector = EnvironmentDetector()
        self.performanceMonitor = PerformanceMonitor()
        
        // Load audio files
        audioManager.loadSounds()
        
        // Start particle system
        celebrationEffects.start()
        
        // Start performance monitoring
        startPerformanceMonitoring()
    }
    
    // MARK: - Data Fetching
    
    /// Fetches initial data from the backend API
    func fetchInitialData() async {
        do {
            let status = try await networkService.fetchVRStatus()
            updateUI(with: status)
            isConnected = true
            errorMessage = nil
        } catch {
            handleFetchError(error)
        }
    }
    
    /// Transforms API response to UI models and updates published properties
    /// - Parameter status: The VRDogStatus response from the API
    func updateUI(with status: VRDogStatus) {
        // Check for stat XP completion before updating
        checkStatCompletion(newStats: status.stats)
        
        // Check for goal completion before updating
        if let newGoals = status.goals {
            checkGoalCompletion(newGoals: newGoals)
        }
        
        dogName = status.dogName
        dogLevel = status.level
        overallXp = status.overallXp
        xpToNextLevel = status.xpToNextLevel
        stats = status.stats
        goals = status.goals
        activities = Array(status.recentActivities.prefix(5)) // Limit to 5 items
        weeklyXP = status.weeklyXP
    }
    
    /// Checks if any stat has filled to completion and triggers audio
    /// Also checks for level-ups and triggers particle effects
    /// Requirements: 3.1, 3.5 (Task 7 - with feature toggles)
    /// - Parameter newStats: The new stat data from the API
    private func checkStatCompletion(newStats: [StatData]) {
        let config = AppConfiguration.shared
        
        for stat in newStats {
            let previousXP = previousStatXP[stat.type] ?? 0
            let currentXP = stat.xp
            let previousLevel = previousStatLevels[stat.type] ?? stat.level
            
            // Check if XP increased and progress reached 1.0 (100%)
            if currentXP > previousXP && stat.xpProgress >= 1.0 {
                // Play whoosh sound at stat panel position (if audio enabled)
                if config.isFeatureEnabled("spatialAudio") {
                    let position = panelPosition(for: stat.type)
                    audioManager.playSound(.statFill, at: position)
                }
                
                // Announce via audio description if enabled
                if config.audioDescriptionsEnabled {
                    print("🔊 Audio Description: \(stat.type) stat filled")
                }
            }
            
            // Check for level-up (Requirements: 3.1, 3.5)
            if stat.level > previousLevel {
                // Trigger particle effect at stat orb position (if particles enabled)
                if config.isFeatureEnabled("particleEffects") {
                    let position = panelPosition(for: stat.type)
                    celebrationEffects.onStatLevelUp(statType: stat.type, at: position)
                }
                
                // Announce via audio description if enabled
                if config.audioDescriptionsEnabled {
                    print("🔊 Audio Description: \(stat.type) leveled up to level \(stat.level)")
                }
            }
            
            previousStatXP[stat.type] = currentXP
            previousStatLevels[stat.type] = stat.level
        }
    }
    
    /// Checks if goals have reached completion and triggers audio and particles
    /// Requirements: 3.2, 3.5 (Task 7 - with feature toggles)
    /// - Parameter newGoals: The new goal data from the API
    private func checkGoalCompletion(newGoals: GoalData?) {
        guard let newGoals = newGoals else { return }
        let config = AppConfiguration.shared
        let position = panelPosition(for: "goals")
        
        // Check physical goal completion
        if newGoals.physical.progress >= 1.0 && previousPhysicalProgress < 1.0 {
            // Play audio if enabled
            if config.isFeatureEnabled("spatialAudio") {
                audioManager.playSound(.goalComplete, at: position)
            }
            
            // Trigger confetti particles if enabled (Requirements: 3.2, 3.5)
            if config.isFeatureEnabled("particleEffects") {
                celebrationEffects.onGoalComplete(at: position)
            }
            
            // Announce via audio description if enabled
            if config.audioDescriptionsEnabled {
                print("🔊 Audio Description: Physical goal completed")
            }
        }
        
        // Check mental goal completion
        if newGoals.mental.progress >= 1.0 && previousMentalProgress < 1.0 {
            // Play audio if enabled
            if config.isFeatureEnabled("spatialAudio") {
                audioManager.playSound(.goalComplete, at: position)
            }
            
            // Trigger confetti particles if enabled (Requirements: 3.2, 3.5)
            if config.isFeatureEnabled("particleEffects") {
                celebrationEffects.onGoalComplete(at: position)
            }
            
            // Announce via audio description if enabled
            if config.audioDescriptionsEnabled {
                print("🔊 Audio Description: Mental goal completed")
            }
        }
        
        previousPhysicalProgress = newGoals.physical.progress
        previousMentalProgress = newGoals.mental.progress
    }
    
    /// Returns the 3D position for a panel based on its identifier
    /// - Parameter identifier: Panel identifier (stat type or panel name)
    /// - Returns: 3D position in space
    private func panelPosition(for identifier: String) -> SIMD3<Float> {
        switch identifier {
        case "PHY", "INT", "IMP", "SOC":
            // Left panel: Stat Orbs
            return SIMD3<Float>(x: -0.5, y: 0.0, z: -1.0)
        case "goals":
            // Top panel: Goals
            return SIMD3<Float>(x: 0.0, y: 0.25, z: -1.0)
        case "activities":
            // Right panel: Activities
            return SIMD3<Float>(x: 0.5, y: 0.0, z: -1.0)
        case "chart":
            // Bottom panel: Weekly Chart
            return SIMD3<Float>(x: 0.0, y: -0.2, z: -1.0)
        case "session":
            // Center panel: Session
            return SIMD3<Float>(x: 0.0, y: 0.0, z: -0.8)
        default:
            return SIMD3<Float>(x: 0.0, y: 0.0, z: -1.0)
        }
    }
    
    /// Triggers session end audio at the center panel position
    /// Task 7 - with feature toggle
    func playSessionEndSound() {
        let config = AppConfiguration.shared
        
        // Play audio if enabled
        if config.isFeatureEnabled("spatialAudio") {
            let position = panelPosition(for: "session")
            audioManager.playSound(.sessionEnd, at: position)
        }
        
        // Announce via audio description if enabled
        if config.audioDescriptionsEnabled {
            print("🔊 Audio Description: Training session completed")
        }
    }
    
    // MARK: - Environmental Integration
    
    /// Updates environmental systems with ARKit data
    /// Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
    /// - Parameters:
    ///   - cameraTransform: Current camera transform from ARKit
    ///   - lightEstimate: Light estimation data from ARKit
    ///   - meshAnchors: Detected mesh anchors for real surfaces
    func updateEnvironment(
        cameraTransform: simd_float4x4,
        lightEstimate: ARLightEstimate?,
        meshAnchors: [MeshAnchor]
    ) {
        // Update lighting adaptation (Requirements: 5.1, 5.2, 5.4)
        if let estimate = lightEstimate {
            lightingAdapter.updateFromARLightEstimate(estimate)
        }
        
        // Update environment detection (Requirements: 5.5)
        environmentDetector.update(
            cameraTransform: cameraTransform,
            lightEstimate: lightEstimate,
            meshAnchors: meshAnchors
        )
        
        // Handle space changes - reset panel positions (Requirement: 5.5)
        if environmentDetector.hasChangedSpace {
            // Trigger panel position reset in the view
            // This will be handled by the view layer
            environmentDetector.resetSpaceChangeDetection()
        }
    }
    
    /// Updates shadows for all panels based on their positions
    /// Requirement: 5.3
    /// - Parameters:
    ///   - panelPositions: Dictionary of panel IDs to their 3D positions
    ///   - scene: RealityKit scene for rendering shadows
    func updatePanelShadows(
        panelPositions: [UUID: SIMD3<Float>],
        in scene: RealityKit.Scene
    ) {
        for (panelId, position) in panelPositions {
            // Find nearest surface for this panel
            let nearestSurface = environmentDetector.findNearestSurface(to: position)
            
            // Update shadow (will be removed if no nearby surface)
            shadowRenderer.updateShadow(
                for: panelId,
                panelPosition: position,
                panelSize: SIMD2<Float>(0.3, 0.4),  // Standard panel size
                nearestSurface: nearestSurface,
                in: scene
            )
        }
    }
    
    /// Gets adjusted opacity for panels based on current lighting
    /// Requirements: 5.1, 5.2
    /// - Parameter baseOpacity: Base opacity value (default 0.95)
    /// - Returns: Adjusted opacity value
    func getAdjustedPanelOpacity(baseOpacity: Double = 0.95) -> Double {
        return lightingAdapter.adjustedOpacity(baseOpacity: baseOpacity)
    }
    
    /// Checks if high contrast mode should be enabled
    /// Requirement: 5.4
    /// - Returns: True if high contrast mode is active
    func isHighContrastMode() -> Bool {
        return lightingAdapter.isHighContrastMode
    }
    
    /// Resets panel positions to safe defaults
    /// Called when user changes spaces
    /// Requirement: 5.5
    func resetPanelPositions() {
        // This will be implemented in the view layer
        // The view model just signals that a reset is needed
    }
    
    // MARK: - Performance Monitoring
    
    /// Starts performance monitoring and optimization
    /// Requirements: 6.1, 6.2, 6.3, 6.5
    private func startPerformanceMonitoring() {
        // Start periodic monitoring
        Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            Task { @MainActor [weak self] in
                self?.updatePerformanceMetrics()
            }
        }
    }
    
    /// Updates performance metrics and applies optimizations
    /// Requirements: 6.1, 6.2, 6.3, 6.5
    func updatePerformanceMetrics() {
        // Update memory usage
        performanceMonitor.updateMemoryUsage()
        
        // Update particle count
        let particleCount = celebrationEffects.particleSystem.particles.count
        performanceMonitor.updateParticleCount(particleCount)
        
        // Update audio source count
        let audioCount = audioManager.getActiveSourceCount()
        performanceMonitor.updateAudioSourceCount(audioCount)
        
        // Apply optimizations if needed
        applyPerformanceOptimizations()
        
        // Reset optimization if performance recovered
        performanceMonitor.resetOptimization()
    }
    
    /// Records a frame for performance tracking
    /// Requirements: 6.1
    func recordFrame() {
        performanceMonitor.recordFrame()
    }
    
    /// Applies performance optimizations based on current metrics
    /// Requirements: 6.2, 6.3, 6.5
    private func applyPerformanceOptimizations() {
        // Optimize particle system
        if performanceMonitor.shouldReduceFeature(.particles) {
            let maxParticles = performanceMonitor.getRecommendedMaxParticles()
            celebrationEffects.particleSystem.maxParticleCount = maxParticles
            celebrationEffects.particleSystem.useReducedQuality = true
        } else {
            celebrationEffects.particleSystem.maxParticleCount = 100
            celebrationEffects.particleSystem.useReducedQuality = false
        }
        
        // Optimize audio system
        if performanceMonitor.shouldReduceFeature(.audio) {
            let maxAudio = performanceMonitor.getRecommendedMaxAudioSources()
            audioManager.maxConcurrentSources = maxAudio
            audioManager.useLowCPUMode = true
        } else {
            audioManager.maxConcurrentSources = 5
            audioManager.useLowCPUMode = false
        }
        
        // Disable shadows if performance is critical
        if performanceMonitor.shouldReduceFeature(.shadows) {
            shadowRenderer.isEnabled = false
        } else {
            shadowRenderer.isEnabled = true
        }
        
        // Reduce environmental effects if memory is critical
        if performanceMonitor.shouldReduceFeature(.environmentalEffects) {
            lightingAdapter.useSimplifiedMode = true
        } else {
            lightingAdapter.useSimplifiedMode = false
        }
    }
    
    /// Logs current performance metrics
    /// Requirements: 6.1
    func logPerformanceMetrics() {
        performanceMonitor.logMetrics()
    }
    
    // MARK: - Voice Activity Logging
    
    /// Logs a voice activity to the backend and refreshes data
    /// - Parameters:
    ///   - text: The voice transcript to submit
    ///   - sessionContext: Optional context about the current training session
    /// - Returns: VoiceLogResponse with success status and XP awarded
    /// - Throws: NetworkError if the request fails
    @discardableResult
    func logVoiceActivity(text: String, sessionContext: SessionContext? = nil) async throws -> VoiceLogResponse {
        do {
            // Submit the voice log to the backend
            let response = try await networkService.submitVoiceLog(text: text, sessionContext: sessionContext)
            
            // If successful, refresh the data to show the new activity
            if response.success {
                await fetchInitialData()
            }
            
            return response
        } catch {
            // Handle errors gracefully
            handleFetchError(error)
            throw error
        }
    }
    
    // MARK: - Polling Mechanism
    
    /// Starts polling for real-time updates every 3 seconds
    func startPolling() {
        // Stop any existing timer first
        stopPolling()
        
        // Create a timer that fires every 3 seconds
        pollingTimer = Timer.scheduledTimer(withTimeInterval: pollingInterval, repeats: true) { [weak self] _ in
            Task { @MainActor [weak self] in
                await self?.fetchInitialData()
            }
        }
        
        // Fire immediately on start
        Task {
            await fetchInitialData()
        }
    }
    
    /// Stops the polling timer and cleans up resources
    nonisolated func stopPolling() {
        pollingTimer?.invalidate()
        pollingTimer = nil
    }
    
    // MARK: - Error Handling
    
    /// Handles errors from data fetching
    /// - Parameter error: The error that occurred
    private func handleFetchError(_ error: Error) {
        isConnected = false
        
        if let networkError = error as? NetworkError {
            switch networkError {
            case .timeout:
                errorMessage = "Connection timed out. Retrying..."
            case .connectionFailed:
                errorMessage = "No internet connection"
            case .serverError(let code):
                errorMessage = "Server error (\(code))"
            case .clientError(let code):
                errorMessage = "Request error (\(code))"
            default:
                errorMessage = "Failed to load data"
            }
        } else {
            errorMessage = "Failed to load data: \(error.localizedDescription)"
        }
        
        print("Fetch error: \(error)")
    }
    
    // MARK: - Cleanup
    
    nonisolated deinit {
        stopPolling()
        Task { @MainActor in
            celebrationEffects.stop()
        }
    }
}
