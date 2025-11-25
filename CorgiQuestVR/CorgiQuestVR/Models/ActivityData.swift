//
//  ActivityData.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/24/25.
//

import Foundation

/// Represents a recent training activity
struct ActivityData: Identifiable, Codable {
    let id: String
    let name: String
    let xpBreakdown: [XPGain]
    let timestamp: Date
    let loggedBy: String
    
    struct XPGain: Codable {
        let stat: String // "PHY", "INT", "IMP", or "SOC"
        let amount: Int
    }
    
    /// Formatted timestamp for display (e.g., "2m ago", "1h ago")
    var relativeTimestamp: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: timestamp, relativeTo: Date())
    }
    
    /// Total XP earned from this activity
    var totalXP: Int {
        xpBreakdown.reduce(0) { $0 + $1.amount }
    }
    
    init(id: String, name: String, xpBreakdown: [XPGain], timestamp: Date, loggedBy: String) {
        self.id = id
        self.name = name
        self.xpBreakdown = xpBreakdown
        self.timestamp = timestamp
        self.loggedBy = loggedBy
    }
}
