//
//  ViewState.swift
//  CorgiQuestVR
//
//  Created by Claude on 11/26/25.
//

import Foundation

/// Represents the current view mode in the VR HUD
enum ViewState: Equatable {
    case minimal              // Default view: just dog info + buttons
    case stats                // Full stats screen open
    case training(SessionData) // Active training session
    case summary(SessionSummary) // Post-session summary

    var isTraining: Bool {
        if case .training = self { return true }
        return false
    }

    var isStats: Bool {
        if case .stats = self { return true }
        return false
    }

    var isSummary: Bool {
        if case .summary = self { return true }
        return false
    }
}

/// Data for the session summary view
struct SessionSummary: Equatable {
    let activity: String
    let duration: TimeInterval
    let repsCompleted: Int
    let repsTarget: Int
    let xpGained: [XPGain]
    let startTime: Date

    struct XPGain: Equatable {
        let statType: String
        let amount: Int
        let color: String // Color name (e.g., "red", "blue")
    }

    var durationText: String {
        let minutes = Int(duration) / 60
        let seconds = Int(duration) % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }

    var totalXP: Int {
        xpGained.reduce(0) { $0 + $1.amount }
    }
}
