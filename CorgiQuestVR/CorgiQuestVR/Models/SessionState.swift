//
//  SessionState.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/24/25.
//

import Foundation

/// Represents the current training session state
enum SessionState: Equatable {
    case idle
    case active(SessionData)
    case ending
    
    var isActive: Bool {
        if case .active = self {
            return true
        }
        return false
    }
    
    var sessionData: SessionData? {
        if case .active(let data) = self {
            return data
        }
        return nil
    }
}

/// Details of an active training session
struct SessionData: Equatable, Codable {
    let activity: String // Activity name (e.g., "Calm Walk")
    let goal: String // Goal description (e.g., "5 calm reps")
    let tips: String // Training tips (e.g., "Keep leash loose")
    let targetReps: Int // Target rep count
    var currentReps: Int // Current rep count
    var currentSuggestion: String? // Optional micro-suggestion
    let startTime: Date // Session start time for elapsed timer
    
    /// Progress as a percentage (0.0 to 1.0)
    var progress: Double {
        guard targetReps > 0 else { return 0.0 }
        return min(Double(currentReps) / Double(targetReps), 1.0)
    }
    
    /// Whether the goal has been reached
    var isComplete: Bool {
        currentReps >= targetReps
    }
    
    /// Formatted rep counter (e.g., "3 / 5")
    var repCounterText: String {
        "\(currentReps) / \(targetReps)"
    }

    /// Elapsed time as a formatted string (e.g., "02:34")
    func elapsedTimeText(currentTime: Date = Date()) -> String {
        let elapsed = currentTime.timeIntervalSince(startTime)
        let minutes = Int(elapsed) / 60
        let seconds = Int(elapsed) % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }

    init(activity: String, goal: String, tips: String, targetReps: Int, currentReps: Int = 0, currentSuggestion: String? = nil, startTime: Date = Date()) {
        self.activity = activity
        self.goal = goal
        self.tips = tips
        self.targetReps = targetReps
        self.currentReps = currentReps
        self.currentSuggestion = currentSuggestion
        self.startTime = startTime
    }
    
    /// Increment the rep counter
    mutating func markRep() {
        currentReps += 1
    }
}
