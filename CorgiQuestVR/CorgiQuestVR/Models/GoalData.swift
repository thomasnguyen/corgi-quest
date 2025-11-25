//
//  GoalData.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/24/25.
//

import Foundation

/// Represents today's training goals
struct GoalData: Codable {
    let physical: GoalProgress
    let mental: GoalProgress
    let streak: Int
    
    struct GoalProgress: Codable {
        let current: Int
        let target: Int
        
        /// Progress as a percentage (0.0 to 1.0)
        var progress: Double {
            guard target > 0 else { return 0.0 }
            return min(Double(current) / Double(target), 1.0)
        }
        
        /// Whether the goal has been completed
        var isComplete: Bool {
            current >= target
        }
    }
    
    init(physical: GoalProgress, mental: GoalProgress, streak: Int) {
        self.physical = physical
        self.mental = mental
        self.streak = streak
    }
}
