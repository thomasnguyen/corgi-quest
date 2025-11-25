//
//  DayXP.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/24/25.
//

import Foundation

/// Represents a single day's XP total for the weekly chart
struct DayXP: Identifiable, Codable {
    let id: String
    let day: String // Day label (e.g., "Mon", "Tue", "Wed")
    let total: Int // Total XP earned that day
    let date: Date // Full date for sorting and calculations
    
    init(id: String = UUID().uuidString, day: String, total: Int, date: Date) {
        self.id = id
        self.day = day
        self.total = total
        self.date = date
    }
    
    /// Creates a DayXP from a date with zero XP
    static func empty(for date: Date) -> DayXP {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE" // Short day name
        let dayLabel = formatter.string(from: date)
        
        return DayXP(day: dayLabel, total: 0, date: date)
    }
}
