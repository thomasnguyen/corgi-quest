//
//  FloatingPanelsView.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/24/25.
//

import SwiftUI

/// Arranges floating UI panels around the central pedestal in 3D space
struct FloatingPanelsView: View {
    let dogName: String
    @Binding var sessionState: SessionState
    
    // Sample data for preview - will be replaced with ViewModel data
    @State private var stats: [StatData] = [
        StatData(type: "PHY", name: "Physical", level: 5, xp: 120, xpToNextLevel: 200, xpProgress: 0.6),
        StatData(type: "INT", name: "Intelligence", level: 4, xp: 80, xpToNextLevel: 150, xpProgress: 0.53),
        StatData(type: "IMP", name: "Impulse Control", level: 3, xp: 50, xpToNextLevel: 100, xpProgress: 0.5),
        StatData(type: "SOC", name: "Socialization", level: 6, xp: 180, xpToNextLevel: 250, xpProgress: 0.72)
    ]
    
    @State private var goals: GoalData = GoalData(
        physical: GoalData.GoalProgress(current: 2, target: 3),
        mental: GoalData.GoalProgress(current: 1, target: 2),
        streak: 5
    )
    
    @State private var activities: [ActivityData] = [
        ActivityData(
            id: "1",
            name: "Calm Walk",
            xpBreakdown: [
                ActivityData.XPGain(stat: "PHY", amount: 15),
                ActivityData.XPGain(stat: "IMP", amount: 10)
            ],
            timestamp: Date().addingTimeInterval(-300),
            loggedBy: "Thomas"
        ),
        ActivityData(
            id: "2",
            name: "Sit Practice",
            xpBreakdown: [
                ActivityData.XPGain(stat: "INT", amount: 20),
                ActivityData.XPGain(stat: "IMP", amount: 5)
            ],
            timestamp: Date().addingTimeInterval(-1800),
            loggedBy: "Holly"
        )
    ]
    
    @State private var weeklyXP: [DayXP] = [
        DayXP(day: "Mon", total: 45, date: Date().addingTimeInterval(-6 * 86400)),
        DayXP(day: "Tue", total: 60, date: Date().addingTimeInterval(-5 * 86400)),
        DayXP(day: "Wed", total: 30, date: Date().addingTimeInterval(-4 * 86400)),
        DayXP(day: "Thu", total: 75, date: Date().addingTimeInterval(-3 * 86400)),
        DayXP(day: "Fri", total: 50, date: Date().addingTimeInterval(-2 * 86400)),
        DayXP(day: "Sat", total: 90, date: Date().addingTimeInterval(-1 * 86400)),
        DayXP(day: "Sun", total: 40, date: Date())
    ]
    
    var body: some View {
        ZStack {
            // Left Panel: Stat Orbs
            StatOrbsPanel(stats: stats)
                .position3D(x: -400, y: 0, z: -600)
            
            // Top Panel: Today's Goals
            GoalsPanel(goals: goals)
                .position3D(x: 0, y: 300, z: -600)
            
            // Right Panel: Recent Activities
            ActivitiesPanel(activities: activities)
                .position3D(x: 400, y: 0, z: -600)
            
            // Bottom Panel: Weekly XP Chart
            WeeklyChartPanel(weeklyXP: weeklyXP)
                .position3D(x: 0, y: -300, z: -600)
            
            // Center Panel: Session (conditional)
            if case .active(let sessionData) = sessionState {
                SessionPanel(sessionData: sessionData)
                    .position3D(x: 0, y: 0, z: -500)
            }
        }
    }
}

// MARK: - Panel Components (Placeholders)

/// Displays four stat orbs with XP progress rings
struct StatOrbsPanel: View {
    let stats: [StatData]
    
    var body: some View {
        VStack(spacing: 20) {
            ForEach(stats) { stat in
                StatOrbView(stat: stat)
            }
        }
        .padding(30)
        .background(.ultraThinMaterial)
        .cornerRadius(20)
    }
}

/// Individual stat orb with circular progress ring
struct StatOrbView: View {
    let stat: StatData
    
    var body: some View {
        VStack(spacing: 8) {
            // Circular progress ring
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.3), lineWidth: 8)
                    .frame(width: 80, height: 80)
                
                Circle()
                    .trim(from: 0, to: stat.xpProgress)
                    .stroke(stat.color, lineWidth: 8)
                    .frame(width: 80, height: 80)
                    .rotationEffect(.degrees(-90))
                
                VStack(spacing: 2) {
                    Text(stat.type)
                        .font(.caption)
                        .fontWeight(.bold)
                    Text("Lv \(stat.level)")
                        .font(.caption2)
                }
            }
            
            Text(stat.name)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

/// Displays today's physical and mental goals with progress bars
struct GoalsPanel: View {
    let goals: GoalData
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Today's Goals")
                .font(.headline)
            
            // Physical goal
            VStack(alignment: .leading, spacing: 4) {
                Text("Physical: \(goals.physical.current) / \(goals.physical.target)")
                    .font(.caption)
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        Rectangle()
                            .fill(Color.gray.opacity(0.3))
                            .frame(height: 8)
                        
                        Rectangle()
                            .fill(Color.red)
                            .frame(width: geometry.size.width * goals.physical.progress, height: 8)
                    }
                }
                .frame(height: 8)
            }
            
            // Mental goal
            VStack(alignment: .leading, spacing: 4) {
                Text("Mental: \(goals.mental.current) / \(goals.mental.target)")
                    .font(.caption)
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        Rectangle()
                            .fill(Color.gray.opacity(0.3))
                            .frame(height: 8)
                        
                        Rectangle()
                            .fill(Color.blue)
                            .frame(width: geometry.size.width * goals.mental.progress, height: 8)
                    }
                }
                .frame(height: 8)
            }
            
            // Streak
            HStack {
                Text("🔥")
                Text("\(goals.streak) day streak")
                    .font(.caption)
            }
        }
        .padding(30)
        .frame(width: 300)
        .background(.ultraThinMaterial)
        .cornerRadius(20)
    }
}

/// Displays last 3-5 training activities
struct ActivitiesPanel: View {
    let activities: [ActivityData]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent Activities")
                .font(.headline)
            
            ForEach(activities.prefix(5)) { activity in
                VStack(alignment: .leading, spacing: 4) {
                    Text(activity.name)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    
                    HStack(spacing: 8) {
                        ForEach(activity.xpBreakdown, id: \.stat) { gain in
                            Text("\(gain.stat) +\(gain.amount)")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    HStack {
                        Text(activity.relativeTimestamp)
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        Text("•")
                            .foregroundColor(.secondary)
                        Text(activity.loggedBy)
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.vertical, 4)
                
                if activity.id != activities.prefix(5).last?.id {
                    Divider()
                }
            }
        }
        .padding(30)
        .frame(width: 300)
        .background(.ultraThinMaterial)
        .cornerRadius(20)
    }
}

/// Displays 7-day XP bar chart
struct WeeklyChartPanel: View {
    let weeklyXP: [DayXP]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Last 7 Days XP")
                .font(.headline)
            
            HStack(alignment: .bottom, spacing: 12) {
                ForEach(weeklyXP) { day in
                    VStack(spacing: 4) {
                        // Bar
                        Rectangle()
                            .fill(Color.blue)
                            .frame(width: 30, height: CGFloat(day.total) / 2)
                        
                        // Day label
                        Text(day.day)
                            .font(.caption2)
                    }
                }
            }
            .frame(height: 100)
        }
        .padding(30)
        .background(.ultraThinMaterial)
        .cornerRadius(20)
    }
}

/// Displays active training session information
struct SessionPanel: View {
    let sessionData: SessionData
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Training Session")
                .font(.headline)
            
            Text(sessionData.activity)
                .font(.title3)
                .fontWeight(.bold)
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Goal: \(sessionData.goal)")
                    .font(.subheadline)
                
                Text("Tips: \(sessionData.tips)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            // Rep counter
            Text(sessionData.repCounterText)
                .font(.system(size: 48, weight: .bold))
                .foregroundColor(sessionData.isComplete ? .green : .primary)
            
            // Optional micro-suggestion
            if let suggestion = sessionData.currentSuggestion {
                Text(suggestion)
                    .font(.caption)
                    .foregroundColor(.green)
                    .transition(.opacity)
            }
        }
        .padding(40)
        .frame(width: 400)
        .background(.ultraThinMaterial)
        .cornerRadius(20)
    }
}

// MARK: - Preview

#Preview {
    FloatingPanelsView(
        dogName: "Bumi",
        sessionState: .constant(.idle)
    )
}
