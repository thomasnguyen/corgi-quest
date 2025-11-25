//
//  NetworkServiceExample.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/24/25.
//
//  Example usage of NetworkService for reference
//

import Foundation
import Combine

/// Example usage of NetworkService
/// This file demonstrates how to use the NetworkService in your ViewModels
class NetworkServiceExample {
    
    private let networkService: NetworkService
    
    init() {
        // Initialize with production URL (default)
        self.networkService = NetworkService()
        
        // Or initialize with custom URL for development
        // self.networkService = NetworkService(baseURL: "http://localhost:3000")
        
        // Or use the AppConfiguration
        // self.networkService = NetworkService(baseURL: AppConfiguration.apiBaseURL)
    }
    
    /// Example: Fetch VR status
    func exampleFetchStatus() async {
        do {
            let status = try await networkService.fetchVRStatus()
            print("✅ Successfully fetched status for \(status.dogName)")
            print("   Level: \(status.level)")
            print("   Stats: \(status.stats.count)")
            print("   Recent activities: \(status.recentActivities.count)")
        } catch let error as NetworkError {
            print("❌ Network error: \(error.errorDescription ?? "Unknown")")
        } catch {
            print("❌ Unexpected error: \(error)")
        }
    }
    
    /// Example: Submit voice log
    func exampleSubmitVoiceLog() async {
        do {
            let response = try await networkService.submitVoiceLog(
                text: "We did a 20 minute walk and passed two dogs. Bumi stayed calm!",
                sessionContext: nil
            )
            
            if response.success {
                print("✅ Voice log submitted successfully")
                if let activityId = response.activityId {
                    print("   Activity ID: \(activityId)")
                }
                if let xpAwarded = response.xpAwarded {
                    print("   XP Awarded:")
                    for gain in xpAwarded {
                        print("     - \(gain.stat): +\(gain.amount) XP")
                    }
                }
            } else {
                print("❌ Voice log failed: \(response.error ?? "Unknown error")")
            }
        } catch let error as NetworkError {
            print("❌ Network error: \(error.errorDescription ?? "Unknown")")
        } catch {
            print("❌ Unexpected error: \(error)")
        }
    }
    
    /// Example: Submit voice log with session context
    func exampleSubmitVoiceLogWithContext() async {
        do {
            let context = SessionContext(
                activity: "Calm Walk",
                repsCompleted: 5
            )
            
            let response = try await networkService.submitVoiceLog(
                text: "Completed 5 calm reps during our walk",
                sessionContext: context
            )
            
            if response.success {
                print("✅ Session completed successfully")
            }
        } catch {
            print("❌ Error: \(error)")
        }
    }
    
    /// Example: Handle errors gracefully
    func exampleErrorHandling() async {
        do {
            let status = try await networkService.fetchVRStatus()
            // Use the status
            print("Status: \(status)")
        } catch NetworkError.timeout {
            // Handle timeout specifically
            print("⏱️ Request timed out. Please check your connection.")
        } catch NetworkError.serverError(let code) {
            // Handle server errors
            print("🔥 Server error \(code). Please try again later.")
        } catch NetworkError.connectionFailed {
            // Handle connection failures
            print("📡 No internet connection. Please check your network.")
        } catch {
            // Handle other errors
            print("❌ Something went wrong: \(error)")
        }
    }
}

// MARK: - Usage in a ViewModel

/// Example ViewModel showing real-world usage
@MainActor
class ExampleViewModel: ObservableObject {
    @Published var dogName: String = ""
    @Published var stats: [StatData] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let networkService: NetworkService
    
    init(networkService: NetworkService = NetworkService(baseURL: AppConfiguration.apiBaseURL)) {
        self.networkService = networkService
    }
    
    func loadData() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let status = try await networkService.fetchVRStatus()
            dogName = status.dogName
            stats = status.stats
        } catch let error as NetworkError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = "An unexpected error occurred"
        }
        
        isLoading = false
    }
    
    func submitTrainingLog(text: String) async -> Bool {
        do {
            let response = try await networkService.submitVoiceLog(text: text)
            if response.success {
                // Refresh data after successful submission
                await loadData()
                return true
            } else {
                errorMessage = response.error
                return false
            }
        } catch let error as NetworkError {
            errorMessage = error.errorDescription
            return false
        } catch {
            errorMessage = "Failed to submit training log"
            return false
        }
    }
}
