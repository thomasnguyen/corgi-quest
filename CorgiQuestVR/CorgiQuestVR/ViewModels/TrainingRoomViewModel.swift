//
//  TrainingRoomViewModel.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/24/25.
//

import Foundation
import Combine
import simd

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
    
    /// Previous stat XP values for detecting completion
    private var previousStatXP: [String: Int] = [:]
    
    /// Previous goal progress for detecting completion
    private var previousPhysicalProgress: Double = 0.0
    private var previousMentalProgress: Double = 0.0
    
    // MARK: - Initialization
    
    /// Initialize the ViewModel with a network service
    /// - Parameter networkService: The network service to use (defaults to production)
    init(networkService: NetworkService = NetworkService()) {
        self.networkService = networkService
        self.audioManager = SpatialAudioManager()
        
        // Load audio files
        audioManager.loadSounds()
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
    /// - Parameter newStats: The new stat data from the API
    private func checkStatCompletion(newStats: [StatData]) {
        for stat in newStats {
            let previousXP = previousStatXP[stat.type] ?? 0
            let currentXP = stat.xp
            
            // Check if XP increased and progress reached 1.0 (100%)
            if currentXP > previousXP && stat.xpProgress >= 1.0 {
                // Play whoosh sound at stat panel position
                let position = panelPosition(for: stat.type)
                audioManager.playSound(.statFill, at: position)
            }
            
            previousStatXP[stat.type] = currentXP
        }
    }
    
    /// Checks if goals have reached completion and triggers audio
    /// - Parameter newGoals: The new goal data from the API
    private func checkGoalCompletion(newGoals: GoalData) {
        // Check physical goal completion
        if newGoals.physical.progress >= 1.0 && previousPhysicalProgress < 1.0 {
            let position = panelPosition(for: "goals")
            audioManager.playSound(.goalComplete, at: position)
        }
        
        // Check mental goal completion
        if newGoals.mental.progress >= 1.0 && previousMentalProgress < 1.0 {
            let position = panelPosition(for: "goals")
            audioManager.playSound(.goalComplete, at: position)
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
    func playSessionEndSound() {
        let position = panelPosition(for: "session")
        audioManager.playSound(.sessionEnd, at: position)
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
    
    deinit {
        stopPolling()
    }
}
