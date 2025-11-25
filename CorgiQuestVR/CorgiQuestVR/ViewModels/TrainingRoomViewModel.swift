//
//  TrainingRoomViewModel.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/24/25.
//

import Foundation
import Combine

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
    
    /// Connection status indicator
    @Published var isConnected: Bool = true
    
    /// Error message for display
    @Published var errorMessage: String?
    
    // MARK: - Private Properties
    
    /// Network service for API calls
    private let networkService: NetworkService
    
    /// Timer for polling updates
    private var pollingTimer: Timer?
    
    /// Polling interval in seconds
    private let pollingInterval: TimeInterval = 3.0
    
    // MARK: - Initialization
    
    /// Initialize the ViewModel with a network service
    /// - Parameter networkService: The network service to use (defaults to production)
    init(networkService: NetworkService = NetworkService()) {
        self.networkService = networkService
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
        dogName = status.dogName
        dogLevel = status.level
        stats = status.stats
        goals = status.goals
        activities = Array(status.recentActivities.prefix(5)) // Limit to 5 items
        weeklyXP = status.weeklyXP
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
