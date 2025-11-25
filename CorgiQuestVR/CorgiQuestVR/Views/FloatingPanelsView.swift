//
//  FloatingPanelsView.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/24/25.
//

import SwiftUI
import Charts

/// Arranges floating UI panels around the central pedestal in 3D space
struct FloatingPanelsView: View {
    let dogName: String
    let stats: [StatData]
    let goals: GoalData?
    let activities: [ActivityData]
    let weeklyXP: [DayXP]
    @Binding var sessionState: SessionState
    
    var body: some View {
        ZStack {
            // Left Panel: Stat Orbs
            StatOrbsPanel(stats: stats)
                .offset(x: -500, y: -50)

            // Top Panel: Today's Goals
            if let goals = goals {
                GoalsPanel(goals: goals)
                    .offset(x: 0, y: -250)
            }

            // Right Panel: Recent Activities
            ActivitiesPanel(activities: activities)
                .offset(x: 500, y: -50)

            // Bottom Panel: Weekly XP Chart
            WeeklyChartPanel(weeklyXP: weeklyXP)
                .offset(x: 0, y: 200)

            // Center Panel: Session (conditional)
            if case .active(let sessionData) = sessionState {
                SessionPanel(sessionData: sessionData)
                    .offset(x: 0, y: 0)
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
    @State private var pulseScale: CGFloat = 1.0
    
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
                    .animation(.easeInOut(duration: 0.5), value: stat.xpProgress)
                
                VStack(spacing: 2) {
                    Text(stat.type)
                        .font(.caption)
                        .fontWeight(.bold)
                    Text("Lv \(stat.level)")
                        .font(.caption2)
                }
            }
            .scaleEffect(pulseScale)
            .onChange(of: stat.xp) { oldValue, newValue in
                // Pulse animation on XP change
                withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                    pulseScale = 1.2
                }
                
                // Return to normal size
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                        pulseScale = 1.0
                    }
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
                            .cornerRadius(4)
                        
                        Rectangle()
                            .fill(Color.red)
                            .frame(width: geometry.size.width * goals.physical.progress, height: 8)
                            .cornerRadius(4)
                            .animation(.easeInOut(duration: 0.5), value: goals.physical.progress)
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
                            .cornerRadius(4)
                        
                        Rectangle()
                            .fill(Color.blue)
                            .frame(width: geometry.size.width * goals.mental.progress, height: 8)
                            .cornerRadius(4)
                            .animation(.easeInOut(duration: 0.5), value: goals.mental.progress)
                    }
                }
                .frame(height: 8)
            }
            
            // Streak
            HStack {
                Text("🔥")
                    .font(.title3)
                Text("\(goals.streak) day streak")
                    .font(.caption)
                    .fontWeight(.semibold)
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
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(statColor(for: gain.stat).opacity(0.2))
                                .cornerRadius(4)
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
                .transition(.opacity.combined(with: .move(edge: .top)))
                
                if activity.id != activities.prefix(5).last?.id {
                    Divider()
                }
            }
        }
        .padding(30)
        .frame(width: 300)
        .background(.ultraThinMaterial)
        .cornerRadius(20)
        .animation(.easeInOut(duration: 0.3), value: activities.map { $0.id })
    }
    
    /// Helper function to get color for stat type
    private func statColor(for stat: String) -> Color {
        switch stat {
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
}

/// Displays 7-day XP bar chart using Swift Charts
struct WeeklyChartPanel: View {
    let weeklyXP: [DayXP]
    @State private var animateChart = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Last 7 Days XP")
                .font(.headline)
            
            Chart(weeklyXP) { day in
                BarMark(
                    x: .value("Day", day.day),
                    y: .value("XP", animateChart ? day.total : 0)
                )
                .foregroundStyle(Color.blue.gradient)
                .cornerRadius(4)
            }
            .chartXAxis {
                AxisMarks(values: .automatic) { value in
                    AxisValueLabel()
                        .font(.caption2)
                }
            }
            .chartYAxis {
                AxisMarks(position: .leading) { value in
                    AxisValueLabel()
                        .font(.caption2)
                }
            }
            .frame(height: 120)
            .onAppear {
                withAnimation(.easeInOut(duration: 0.8)) {
                    animateChart = true
                }
            }
            .onChange(of: weeklyXP.map { $0.total }) { oldValue, newValue in
                // Re-animate when data changes
                animateChart = false
                withAnimation(.easeInOut(duration: 0.5)) {
                    animateChart = true
                }
            }
        }
        .padding(30)
        .frame(width: 400)
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
        stats: [
            StatData(type: "PHY", name: "Physical", level: 5, xp: 120, xpToNextLevel: 200, xpProgress: 0.6),
            StatData(type: "INT", name: "Intelligence", level: 4, xp: 80, xpToNextLevel: 150, xpProgress: 0.53),
            StatData(type: "IMP", name: "Impulse Control", level: 3, xp: 50, xpToNextLevel: 100, xpProgress: 0.5),
            StatData(type: "SOC", name: "Socialization", level: 6, xp: 180, xpToNextLevel: 250, xpProgress: 0.72)
        ],
        goals: GoalData(
            physical: GoalData.GoalProgress(current: 2, target: 3),
            mental: GoalData.GoalProgress(current: 1, target: 2),
            streak: 5
        ),
        activities: [
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
        ],
        weeklyXP: [
            DayXP(day: "Mon", total: 45, date: Date().addingTimeInterval(-6 * 86400)),
            DayXP(day: "Tue", total: 60, date: Date().addingTimeInterval(-5 * 86400)),
            DayXP(day: "Wed", total: 30, date: Date().addingTimeInterval(-4 * 86400)),
            DayXP(day: "Thu", total: 75, date: Date().addingTimeInterval(-3 * 86400)),
            DayXP(day: "Fri", total: 50, date: Date().addingTimeInterval(-2 * 86400)),
            DayXP(day: "Sat", total: 90, date: Date().addingTimeInterval(-1 * 86400)),
            DayXP(day: "Sun", total: 40, date: Date())
        ],
        sessionState: .constant(.idle)
    )
}
