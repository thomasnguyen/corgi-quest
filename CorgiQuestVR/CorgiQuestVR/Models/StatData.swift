//
//  StatData.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/24/25.
//

import Foundation
import SwiftUI

/// Represents a single stat orb with XP progress
struct StatData: Identifiable, Codable {
    let id: String
    let type: String // "PHY", "INT", "IMP", or "SOC"
    let name: String // Full name (e.g., "Physical")
    let level: Int
    let xp: Int
    let xpToNextLevel: Int
    let xpProgress: Double // Progress as 0.0 to 1.0
    
    /// Computed property for stat-specific color
    var color: Color {
        switch type {
        case "PHY":
            return .red
        case "INT":
            return .blue
        case "IMP":
            return .purple
        case "SOC":
            return .green
        default:
            return .gray
        }
    }
    
    init(id: String = UUID().uuidString, type: String, name: String, level: Int, xp: Int, xpToNextLevel: Int, xpProgress: Double) {
        self.id = id
        self.type = type
        self.name = name
        self.level = level
        self.xp = xp
        self.xpToNextLevel = xpToNextLevel
        self.xpProgress = xpProgress
    }
}
