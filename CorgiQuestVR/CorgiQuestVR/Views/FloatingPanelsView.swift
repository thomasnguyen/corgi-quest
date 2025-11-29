//
//  FloatingPanelsView.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/24/25.
//

import SwiftUI
import Charts
import Combine

/// Arranges floating UI panels around the central pedestal in 3D space
struct FloatingPanelsView: View {
    let dogName: String
    let stats: [StatData]
    let goals: GoalData?
    let activities: [ActivityData]
    let weeklyXP: [DayXP]
    @Binding var sessionState: SessionState
    let onMarkRep: () -> Void
    let onEndSession: () -> Void

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
                SessionPanel(
                    sessionData: sessionData,
                    onMarkRep: onMarkRep,
                    onEndSession: onEndSession
                )
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
            
            // Streak - PROMINENT DISPLAY (Skyrim-style)
            HStack(spacing: 12) {
                Text("🔥")
                    .font(.system(size: 40))
                    .shadow(color: .orange, radius: 10)
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(goals.streak) Day Streak!")
                        .font(.system(size: 20, weight: .bold, design: .serif))
                        .foregroundColor(.orange)
                    Text("Keep Training!")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.yellow)
                }
                Text("🔥")
                    .font(.system(size: 40))
                    .shadow(color: .orange, radius: 10)
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.orange.opacity(0.2))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.orange, lineWidth: 2)
                    )
            )
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

/// XP Notifications - floating pop-ups
struct XPNotificationsView: View {
    let notifications: [XPNotification]

    var body: some View {
        VStack(alignment: .trailing, spacing: 10) {
            ForEach(notifications) { notification in
                HStack(spacing: 12) {
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(notification.color)
                        .shadow(color: notification.color.opacity(0.8), radius: 6, x: 0, y: 0)

                    Text("+\(notification.amount) \(notification.statType)")
                        .font(.system(size: 17, weight: .bold, design: .serif))
                        .foregroundColor(.white)
                        .tracking(0.5)
                        .shadow(color: .black.opacity(0.8), radius: 2, x: 0, y: 1)

                    Text("XP")
                        .font(.system(size: 13, weight: .semibold, design: .serif))
                        .foregroundColor(notification.color)
                        .tracking(0.5)
                }
                .padding(.horizontal, 18)
                .padding(.vertical, 12)
                .background(
                    ZStack {
                        // Dark base
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color(red: 0.1, green: 0.1, blue: 0.1).opacity(0.95))

                        // Colored glow overlay
                        RoundedRectangle(cornerRadius: 12)
                            .fill(
                                LinearGradient(
                                    gradient: Gradient(colors: [
                                        notification.color.opacity(0.2),
                                        notification.color.opacity(0.05)
                                    ]),
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                    }
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .strokeBorder(
                            LinearGradient(
                                gradient: Gradient(colors: [
                                    notification.color.opacity(0.9),
                                    notification.color.opacity(0.6)
                                ]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 2
                        )
                )
                .shadow(color: notification.color.opacity(0.4), radius: 12, x: 0, y: 0)
                .shadow(color: .black.opacity(0.6), radius: 6, x: 0, y: 3)
                .transition(.asymmetric(
                    insertion: .move(edge: .trailing).combined(with: .opacity).combined(with: .scale(scale: 0.9)),
                    removal: .opacity.combined(with: .scale(scale: 0.85))
                ))
            }
        }
        .animation(.spring(response: 0.5, dampingFraction: 0.75), value: notifications)
    }
}

/// Quick action buttons - Skyrim-style action bar
struct QuickActionsPanel: View {
    let isStatsOpen: Bool
    let onStartTraining: () -> Void
    let onViewStats: () -> Void

    var body: some View {
        HStack(spacing: 16) {
            // Start Training button
            Button(action: onStartTraining) {
                HStack(spacing: 10) {
                    Image(systemName: "figure.run")
                        .font(.system(size: 18, weight: .semibold))
                    Text("START TRAINING")
                        .font(.system(size: 17, weight: .bold, design: .serif))
                        .tracking(1)
                }
                .foregroundStyle(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color(red: 0.996, green: 0.937, blue: 0.816), // #FEEFD0
                            Color(red: 0.988, green: 0.835, blue: 0.529)  // #FCD587
                        ]),
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .padding(.horizontal, 28)
                .padding(.vertical, 16)
                .background(
                    ZStack {
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color(red: 0.702, green: 0.537, blue: 0.443), // #B38971
                                Color(red: 0.373, green: 0.333, blue: 0.325)  // #5F5553
                            ]),
                            startPoint: .top,
                            endPoint: .bottom
                        )

                        // Subtle highlight at top
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color.white.opacity(0.2),
                                Color.clear
                            ]),
                            startPoint: .top,
                            endPoint: .center
                        )
                    }
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .strokeBorder(Color(red: 0.976, green: 0.863, blue: 0.627), lineWidth: 3) // #F9DCA0
                )
                .cornerRadius(14)
            }
            .buttonStyle(.plain)

            // View Stats button
            Button(action: onViewStats) {
                HStack(spacing: 10) {
                    Image(systemName: isStatsOpen ? "xmark.circle.fill" : "chart.xyaxis.line")
                        .font(.system(size: 18, weight: .semibold))
                    Text(isStatsOpen ? "CLOSE" : "VIEW STATS")
                        .font(.system(size: 17, weight: .bold, design: .serif))
                        .tracking(1)
                }
                .foregroundStyle(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color(red: 0.996, green: 0.937, blue: 0.816), // #FEEFD0
                            Color(red: 0.988, green: 0.835, blue: 0.529)  // #FCD587
                        ]),
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .padding(.horizontal, 28)
                .padding(.vertical, 16)
                .background(
                    ZStack {
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color(red: 0.702, green: 0.537, blue: 0.443), // #B38971
                                Color(red: 0.373, green: 0.333, blue: 0.325)  // #5F5553
                            ]),
                            startPoint: .top,
                            endPoint: .bottom
                        )

                        // Subtle highlight at top
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color.white.opacity(0.2),
                                Color.clear
                            ]),
                            startPoint: .top,
                            endPoint: .center
                        )
                    }
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .strokeBorder(Color(red: 0.976, green: 0.863, blue: 0.627), lineWidth: 3) // #F9DCA0
                )
                .cornerRadius(14)
            }
            .buttonStyle(.plain)
        }
        .padding(.vertical, 18)
        .padding(.horizontal, 24)
        .background(
            ZStack {
                RoundedRectangle(cornerRadius: 18)
                    .fill(Color(red: 0.12, green: 0.12, blue: 0.12).opacity(0.92))

                // Subtle inner border
                RoundedRectangle(cornerRadius: 18)
                    .strokeBorder(Color.white.opacity(0.1), lineWidth: 1)
            }
        )
        .shadow(color: .black.opacity(0.6), radius: 12, x: 0, y: 6)
    }
}

/// Displays dog name, level, and streak - RPG-style with golden gradient, all in one panel
struct DogInfoPanel: View {
    let dogName: String
    let level: Int
    let streak: Int?

    var body: some View {
        HStack(spacing: 12) {
            // Streak display - only if streak > 0 (FIRST, on the left)
            if let streak = streak, streak > 0 {
                // Streak badge
                HStack(spacing: 6) {
                    Text("🔥")
                        .font(.system(size: 14))
                    Text("\(streak)")
                        .font(.system(size: 13, weight: .medium, design: .rounded))
                        .foregroundColor(Color(red: 0.976, green: 0.863, blue: 0.627)) // #F9DCA0
                }

                // Separator
                Text("•")
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.4))
            }

            // Dog name - golden gradient like web UI
            Text(dogName)
                .font(.system(size: 26, weight: .bold, design: .serif))
                .foregroundStyle(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color(red: 0.996, green: 0.937, blue: 0.816), // #FEEFD0
                            Color(red: 0.988, green: 0.835, blue: 0.529)  // #FCD587
                        ]),
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .shadow(color: Color(red: 0.961, green: 0.765, blue: 0.373).opacity(0.5), radius: 8, x: 0, y: 0) // Golden glow

            // Separator
            Text("•")
                .font(.system(size: 14))
                .foregroundColor(.white.opacity(0.4))

            // Level display - compact with star
            HStack(spacing: 4) {
                Image(systemName: "star.fill")
                    .font(.system(size: 12))
                    .foregroundColor(Color(red: 0.961, green: 0.765, blue: 0.373)) // #F5C35F
                    .shadow(color: Color(red: 0.961, green: 0.765, blue: 0.373).opacity(0.6), radius: 4, x: 0, y: 0)
                Text("Lv \(level)")
                    .font(.system(size: 16, weight: .semibold, design: .serif))
                    .foregroundColor(Color(red: 0.961, green: 0.765, blue: 0.373)) // #F5C35F
            }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 12)
        .background(
            Capsule()
                .fill(Color(red: 0.071, green: 0.071, blue: 0.086).opacity(0.8)) // #121216
                .overlay(
                    Capsule()
                        .strokeBorder(Color(red: 0.239, green: 0.239, blue: 0.239).opacity(0.3), lineWidth: 1) // #3d3d3d
                )
        )
    }
}

/// Displays active training session information - Skyrim quest-style
struct SessionPanel: View {
    let sessionData: SessionData
    let onMarkRep: () -> Void
    let onEndSession: () -> Void

    @State private var currentTime = Date()

    // Timer to update elapsed time every second
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        VStack(spacing: 16) {
            // Title banner
            Text("⚔️ ACTIVE SESSION ⚔️")
                .font(.system(size: 18, weight: .bold, design: .serif))
                .foregroundColor(.yellow)
                .tracking(1.5)
                .shadow(color: .yellow.opacity(0.4), radius: 6, x: 0, y: 0)
                .shadow(color: .black.opacity(0.8), radius: 2, x: 0, y: 2)

            // Elapsed timer
            HStack(spacing: 8) {
                Image(systemName: "timer")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.cyan)
                Text(sessionData.elapsedTimeText(currentTime: currentTime))
                    .font(.system(size: 16, weight: .bold, design: .monospaced))
                    .foregroundColor(.cyan)
            }
            .onReceive(timer) { _ in
                currentTime = Date()
            }

            Divider()
                .background(Color.yellow.opacity(0.3))

            // Activity name
            Text(sessionData.activity)
                .font(.system(size: 22, weight: .bold, design: .serif))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
                .lineLimit(2)
                .shadow(color: .black.opacity(0.6), radius: 2, x: 0, y: 1)

            // Goal
            HStack(spacing: 6) {
                Image(systemName: "scope")
                    .font(.system(size: 14))
                    .foregroundColor(.green)
                Text(sessionData.goal)
                    .font(.system(size: 14, weight: .semibold, design: .serif))
                    .foregroundColor(.green)
            }

            // Rep counter - BIG AND PROMINENT
            VStack(spacing: 6) {
                Text(sessionData.isComplete ? "BONUS! 🎉" : "PROGRESS")
                    .font(.system(size: 12, weight: .bold, design: .serif))
                    .foregroundColor(sessionData.isComplete ? .green : .gray.opacity(0.8))
                    .tracking(1)

                Text(sessionData.repCounterText)
                    .font(.system(size: 48, weight: .heavy, design: .serif))
                    .foregroundColor(sessionData.isComplete ? .green : .yellow)
                    .shadow(color: sessionData.isComplete ? .green.opacity(0.6) : .yellow.opacity(0.5), radius: 12)
                    .shadow(color: .black.opacity(0.8), radius: 2, x: 0, y: 2)
            }
            .padding(.vertical, 8)

            // Tips
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 4) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 12))
                        .foregroundColor(.yellow)
                    Text("TIP")
                        .font(.system(size: 11, weight: .bold, design: .serif))
                        .foregroundColor(.yellow.opacity(0.9))
                        .tracking(0.5)
                }
                Text(sessionData.tips)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.white.opacity(0.85))
                    .lineLimit(3)
            }
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.black.opacity(0.2))
            )

            // Suggestion (if any)
            if let suggestion = sessionData.currentSuggestion {
                Text(suggestion)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.green)
                    .padding(8)
                    .background(
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color.green.opacity(0.15))
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .strokeBorder(Color.green.opacity(0.5), lineWidth: 1)
                            )
                    )
                    .transition(.opacity.combined(with: .scale(scale: 0.95)))
            }

            Divider()
                .background(Color.yellow.opacity(0.3))

            // Action buttons - Stacked vertically for compact layout
            VStack(spacing: 10) {
                // Mark Rep button
                Button(action: onMarkRep) {
                    HStack(spacing: 8) {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 16, weight: .semibold))
                        Text("MARK REP")
                            .font(.system(size: 15, weight: .bold, design: .serif))
                            .tracking(0.5)
                    }
                    .foregroundStyle(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color(red: 0.996, green: 0.937, blue: 0.816), // #FEEFD0
                                Color(red: 0.988, green: 0.835, blue: 0.529)  // #FCD587
                            ]),
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(
                        ZStack {
                            LinearGradient(
                                gradient: Gradient(colors: [
                                    Color(red: 0.702, green: 0.537, blue: 0.443), // #B38971
                                    Color(red: 0.373, green: 0.333, blue: 0.325)  // #5F5553
                                ]),
                                startPoint: .top,
                                endPoint: .bottom
                            )

                            LinearGradient(
                                gradient: Gradient(colors: [
                                    Color.white.opacity(0.2),
                                    Color.clear
                                ]),
                                startPoint: .top,
                                endPoint: .center
                            )
                        }
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .strokeBorder(Color(red: 0.976, green: 0.863, blue: 0.627), lineWidth: 3) // #F9DCA0
                    )
                    .cornerRadius(10)
                }
                .buttonStyle(.plain)

                // End Session button
                Button(action: onEndSession) {
                    HStack(spacing: 8) {
                        Image(systemName: "stop.circle.fill")
                            .font(.system(size: 16, weight: .semibold))
                        Text("END SESSION")
                            .font(.system(size: 15, weight: .bold, design: .serif))
                            .tracking(0.5)
                    }
                    .foregroundStyle(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color(red: 0.996, green: 0.937, blue: 0.816), // #FEEFD0
                                Color(red: 0.988, green: 0.835, blue: 0.529)  // #FCD587
                            ]),
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(
                        ZStack {
                            LinearGradient(
                                gradient: Gradient(colors: [
                                    Color(red: 0.702, green: 0.537, blue: 0.443), // #B38971
                                    Color(red: 0.373, green: 0.333, blue: 0.325)  // #5F5553
                                ]),
                                startPoint: .top,
                                endPoint: .bottom
                            )

                            LinearGradient(
                                gradient: Gradient(colors: [
                                    Color.white.opacity(0.2),
                                    Color.clear
                                ]),
                                startPoint: .top,
                                endPoint: .center
                            )
                        }
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .strokeBorder(Color(red: 0.976, green: 0.863, blue: 0.627), lineWidth: 3) // #F9DCA0
                    )
                    .cornerRadius(10)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(20)
        .background(.ultraThinMaterial)
        .overlay(
            RoundedRectangle(cornerRadius: 18)
                .strokeBorder(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.yellow.opacity(0.7),
                            Color.orange.opacity(0.5)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 2.5
                )
        )
        .cornerRadius(18)
        .shadow(color: .yellow.opacity(0.2), radius: 8, x: 0, y: 0)
        .shadow(color: .black.opacity(0.5), radius: 10, x: 0, y: 4)
    }
}

/// Streak display - compact RPG badge matching web UI style
struct StreakDisplayPanel: View {
    let streak: Int

    var body: some View {
        HStack(spacing: 6) {
            // Fire emoji - smaller like web
            Text("🔥")
                .font(.system(size: 14))

            // Streak count - matches web UI styling
            Text("\(streak)")
                .font(.system(size: 13, weight: .medium, design: .rounded))
                .foregroundColor(Color(red: 0.976, green: 0.863, blue: 0.627)) // #F9DCA0
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(
            Capsule()
                .fill(Color(red: 0.071, green: 0.071, blue: 0.086).opacity(0.8)) // #121216
                .overlay(
                    Capsule()
                        .strokeBorder(Color(red: 0.239, green: 0.239, blue: 0.239).opacity(0.3), lineWidth: 1) // #3d3d3d
                )
        )
    }
}

/// XP Progress Bar - matching web UI style
struct XPProgressBar: View {
    let currentXP: Int
    let maxXP: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            // XP text label
            HStack(spacing: 4) {
                Text("Level")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(Color(red: 0.961, green: 0.765, blue: 0.373)) // #F5C35F
                Text("\(currentXP)/\(maxXP)")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.white)
            }

            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    // Background bar
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color(red: 0.16, green: 0.16, blue: 0.16)) // Dark background
                        .frame(height: 8)

                    // Progress fill with golden gradient
                    RoundedRectangle(cornerRadius: 4)
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [
                                    Color(red: 0.961, green: 0.765, blue: 0.373), // #F5C35F
                                    Color(red: 0.988, green: 0.835, blue: 0.529)  // #FCD587
                                ]),
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: geometry.size.width * CGFloat(min(Double(currentXP) / Double(maxXP), 1.0)), height: 8)
                }
            }
            .frame(height: 8)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 8)
        .frame(width: 250)
    }
}

/// Full stats screen overlay - Apple-style design with 2D → 3D explosion transition
struct StatsScreenView: View {
    let stats: [StatData]
    let goals: GoalData?
    let activities: [ActivityData]
    let weeklyXP: [DayXP]
    let onClose: () -> Void
    @State private var isVisible = false
    @State private var animateChart = false

    // Animation state variables for staggered fill animation
    @State private var animatedProgress: [String: CGFloat] = [:]
    @State private var glowScale: [String: CGFloat] = [:]

    // Explosion animation state variables
    @State private var explosionPhase: ExplosionPhase = .initial
    @State private var orbPositions: [String: CGPoint] = [:]
    @State private var orbScales: [String: CGFloat] = [:]
    @State private var orbRotations: [String: Double] = [:]
    @State private var particleOpacity: CGFloat = 0
    @State private var chartPillarHeights: [CGFloat] = Array(repeating: 0, count: 7)

    // Explosion phases
    enum ExplosionPhase {
        case initial      // Flat 2D panel
        case shatter      // Panel flash/shatter
        case exploding    // Orbs launching
        case settled      // Final 3D positions
    }

    // Animation timing constants (Requirements 3.1)
    private let baseDelay: Double = 0.3
    private let staggerInterval: Double = 0.2
    private let fillDuration: Double = 0.8

    var body: some View {
        mainContainer
            .scaleEffect(isVisible ? 1.0 : 0.96)
            .opacity(isVisible ? 1.0 : 0.0)
            .onAppear {
                initializeExplosionState()
                startExplosionSequence()
            }
    }

    // MARK: - View Components

    private var mainContainer: some View {
        ZStack {
            backgroundView
            particlesView
            headerView
            orbsView
            chartView
            goalsViewIfNeeded
        }
        .frame(width: 750, height: 600)
        .clipShape(RoundedRectangle(cornerRadius: 28))
        .overlay(borderOverlay)
        .shadow(color: .black.opacity(0.5), radius: 35, x: 0, y: 18)
    }

    private var backgroundView: some View {
        RoundedRectangle(cornerRadius: 28)
            .fill(.regularMaterial)
            .frame(width: 750, height: 600)
    }

    @ViewBuilder
    private var particlesView: some View {
        if explosionPhase == .shatter || explosionPhase == .exploding {
            ForEach(0..<20, id: \.self) { index in
                Circle()
                    .fill(particleColor(for: index))
                    .frame(width: 8, height: 8)
                    .offset(particleOffset(for: index))
                    .opacity(particleOpacity)
                    .blur(radius: 2)
            }
        }
    }

    private var headerView: some View {
        VStack(spacing: 0) {
            HStack {
                Text("Statistics")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .opacity(explosionPhase == .initial ? 1.0 : 0.3)

                Spacer()

                Button(action: onClose) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 28))
                        .foregroundColor(.white.opacity(0.6))
                        .symbolRenderingMode(.hierarchical)
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 20)
            .background(.thinMaterial)

            Spacer()
        }
    }

    @ViewBuilder
    private var orbsView: some View {
        ForEach(0..<stats.count, id: \.self) { index in
            animatedOrbView(for: stats[index], at: index)
        }
    }

    private func animatedOrbView(for stat: StatData, at index: Int) -> some View {
        let position = orbPositions[stat.type] ?? .zero
        let scale = orbScales[stat.type] ?? 1.0
        let rotation = orbRotations[stat.type] ?? 0

        return statOrbView(for: stat, at: index)
            .offset(position)
            .scaleEffect(scale)
            .rotation3DEffect(
                .degrees(rotation),
                axis: (x: 0, y: 1, z: 0)
            )
    }

    @ViewBuilder
    private var chartView: some View {
        if explosionPhase == .settled || explosionPhase == .exploding {
            weeklyChartPillars()
                .offset(y: 180)
        }
    }

    @ViewBuilder
    private var goalsViewIfNeeded: some View {
        if explosionPhase == .settled, let goals = goals {
            goalsView(goals: goals)
                .offset(x: 220, y: -150)
                .opacity(isVisible ? 1.0 : 0.0)
        }
    }

    private var borderOverlay: some View {
        RoundedRectangle(cornerRadius: 28)
            .strokeBorder(
                Color.white.opacity(0.2),
                lineWidth: 1
            )
    }

    // MARK: - Explosion Animation Methods

    /// Initialize all orbs to center position (flat 2D layout)
    private func initializeExplosionState() {
        for stat in stats {
            orbPositions[stat.type] = .zero
            orbScales[stat.type] = 0.8
            orbRotations[stat.type] = 0
            animatedProgress[stat.type] = 0
            glowScale[stat.type] = 1.0
        }
    }

    /// Execute the 2-second explosion sequence
    private func startExplosionSequence() {
        // 0.0s - Initial visibility
        withAnimation(.spring(response: 0.3, dampingFraction: 0.75)) {
            isVisible = true
        }

        // 0.2s - Shatter phase
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            withAnimation(.easeIn(duration: 0.1)) {
                explosionPhase = .shatter
                particleOpacity = 1.0
            }
        }

        // 0.3s - Start explosion, launch orbs one by one
        for (index, stat) in stats.enumerated() {
            let launchDelay = 0.3 + (Double(index) * 0.2) // 0.3s, 0.5s, 0.7s, 0.9s

            DispatchQueue.main.asyncAfter(deadline: .now() + launchDelay) {
                withAnimation(.spring(response: 0.4, dampingFraction: 0.65)) {
                    explosionPhase = .exploding

                    // Set final position in arc formation
                    let finalPosition = arcPosition(for: index, total: stats.count)
                    orbPositions[stat.type] = finalPosition
                    orbScales[stat.type] = 1.2
                    orbRotations[stat.type] = Double.random(in: -15...15)
                }
            }
        }

        // 1.0s - Start weekly pillars shooting up
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            for i in 0..<weeklyXP.count {
                let pillarDelay = Double(i) * 0.05
                DispatchQueue.main.asyncAfter(deadline: .now() + pillarDelay) {
                    withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
                        chartPillarHeights[i] = 1.0
                    }
                }
            }
        }

        // 1.2s - Settle into final positions
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.75)) {
                explosionPhase = .settled
                particleOpacity = 0

                for stat in stats {
                    orbScales[stat.type] = 1.0
                }
            }
        }

        // 1.4s - Start staggered fill animations
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.4) {
            for (index, stat) in stats.enumerated() {
                let fillDelay = Double(index) * staggerInterval

                withAnimation(.easeOut(duration: fillDuration).delay(fillDelay)) {
                    animatedProgress[stat.type] = stat.xpProgress
                }

                // 1.8s+ - Glow pulse effects
                let glowDelay = fillDelay + fillDuration
                DispatchQueue.main.asyncAfter(deadline: .now() + glowDelay) {
                    withAnimation(.spring(response: 0.2, dampingFraction: 0.6)) {
                        glowScale[stat.type] = 1.05
                    }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                        withAnimation(.spring(response: 0.2, dampingFraction: 0.8)) {
                            glowScale[stat.type] = 1.0
                        }
                    }
                }
            }
        }
    }

    /// Calculate arc position for orbs in 3D space
    private func arcPosition(for index: Int, total: Int) -> CGPoint {
        let radius: CGFloat = 250
        let arcSpan: CGFloat = .pi * 0.8 // 144 degrees
        let startAngle: CGFloat = .pi / 2 - arcSpan / 2
        let angle = startAngle + (arcSpan * CGFloat(index) / CGFloat(max(1, total - 1)))

        return CGPoint(
            x: cos(angle) * radius,
            y: -100 + sin(angle) * radius * 0.4
        )
    }

    /// Particle color based on index
    private func particleColor(for index: Int) -> Color {
        let colors: [Color] = [.red, .blue, .purple, .green, .cyan, .orange]
        return colors[index % colors.count]
    }

    /// Particle offset for explosion effect
    private func particleOffset(for index: Int) -> CGSize {
        let angle = Double(index) * (360.0 / 20.0) * .pi / 180.0
        let distance: CGFloat = particleOpacity > 0 ? 150 : 0
        return CGSize(
            width: cos(angle) * distance,
            height: sin(angle) * distance
        )
    }

    /// Individual stat orb view
    private func statOrbView(for stat: StatData, at index: Int) -> some View {
        VStack(spacing: 8) {
            ZStack {
                // Background circle
                Circle()
                    .stroke(stat.color.opacity(0.15), lineWidth: 6)
                    .frame(width: 80, height: 80)

                // Progress ring
                Circle()
                    .trim(from: 0, to: animatedProgress[stat.type] ?? 0)
                    .stroke(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                stat.color,
                                stat.color.opacity(0.7)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        style: StrokeStyle(lineWidth: 6, lineCap: .round)
                    )
                    .frame(width: 80, height: 80)
                    .rotationEffect(.degrees(-90))
                    .scaleEffect(glowScale[stat.type] ?? 1.0)
                    .shadow(
                        color: stat.color.opacity(0.8),
                        radius: (glowScale[stat.type] ?? 1.0) > 1.0 ? 20 : 8
                    )

                // Level number
                Text("\(stat.level)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .shadow(color: .black.opacity(0.5), radius: 2)
            }

            // Stat type
            Text(stat.type)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(stat.color)

            // Stat name
            Text(stat.name)
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(.white.opacity(0.6))
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(.ultraThinMaterial)
                .shadow(color: stat.color.opacity(0.3), radius: 10)
        )
    }

    /// Weekly chart as 3D pillars
    private func weeklyChartPillars() -> some View {
        HStack(spacing: 8) {
            ForEach(Array(weeklyXP.enumerated()), id: \.offset) { index, day in
                VStack(spacing: 4) {
                    // Pillar
                    RoundedRectangle(cornerRadius: 6)
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [
                                    Color.cyan,
                                    Color.blue
                                ]),
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .frame(
                            width: 35,
                            height: max(20, CGFloat(day.total) * chartPillarHeights[index] / 2)
                        )
                        .shadow(color: .cyan.opacity(0.6), radius: 8)
                        .rotation3DEffect(
                            .degrees(10),
                            axis: (x: 1, y: 0, z: 0)
                        )

                    // Day label
                    Text(day.day)
                        .font(.system(size: 9, weight: .medium))
                        .foregroundColor(.white.opacity(0.6))
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.ultraThinMaterial)
        )
    }

    /// Compact goals view
    private func goalsView(goals: GoalData) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Goals")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)

                if goals.streak > 0 {
                    HStack(spacing: 2) {
                        Text("🔥")
                            .font(.system(size: 10))
                        Text("\(goals.streak)")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundColor(.orange)
                    }
                }
            }

            // Progress bars
            VStack(spacing: 6) {
                goalBar(label: "PHY", progress: goals.physical.progress, color: .red)
                goalBar(label: "MEN", progress: goals.mental.progress, color: .blue)
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(.ultraThinMaterial)
        )
    }

    private func goalBar(label: String, progress: CGFloat, color: Color) -> some View {
        HStack(spacing: 6) {
            Text(label)
                .font(.system(size: 9, weight: .semibold))
                .foregroundColor(.white.opacity(0.7))
                .frame(width: 30, alignment: .leading)

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(Color.white.opacity(0.1))
                        .frame(height: 5)

                    Capsule()
                        .fill(color)
                        .frame(width: geo.size.width * progress, height: 5)
                }
            }
            .frame(height: 5)
        }
    }

    /// Helper function to get color for stat type
    private func statColor(for stat: String) -> Color {
        switch stat {
        case "PHY": return .red
        case "INT": return .blue
        case "IMP": return .purple
        case "SOC": return .green
        default: return .gray
        }
    }
}

/// Session summary view - shown after training ends
struct SessionSummaryView: View {
    let summary: SessionSummary
    let onDone: () -> Void
    @State private var isVisible = false

    var body: some View {
        VStack(spacing: 24) {
            // Celebration header
            Text("🎉 TRAINING COMPLETE! 🎉")
                .font(.system(size: 24, weight: .bold, design: .serif))
                .foregroundColor(.green)
                .shadow(color: .green.opacity(0.6), radius: 10)

            Divider()
                .background(Color.yellow.opacity(0.5))

            // Activity name
            Text(summary.activity)
                .font(.system(size: 28, weight: .bold, design: .serif))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)

            // Session stats
            HStack(spacing: 30) {
                VStack(spacing: 4) {
                    Image(systemName: "clock.fill")
                        .foregroundColor(.cyan)
                        .font(.system(size: 20))
                    Text(summary.durationText)
                        .font(.system(size: 18, weight: .semibold, design: .monospaced))
                        .foregroundColor(.cyan)
                    Text("Duration")
                        .font(.caption)
                        .foregroundColor(.gray)
                }

                VStack(spacing: 4) {
                    Image(systemName: "target")
                        .foregroundColor(.green)
                        .font(.system(size: 20))
                    Text("\(summary.repsCompleted)/\(summary.repsTarget)")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.green)
                    Text("Reps")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }

            Divider()
                .background(Color.yellow.opacity(0.5))

            // XP Earned
            VStack(spacing: 12) {
                Text("XP EARNED")
                    .font(.system(size: 16, weight: .semibold, design: .serif))
                    .foregroundColor(.gray)

                ForEach(summary.xpGained, id: \.statType) { xp in
                    HStack(spacing: 12) {
                        Image(systemName: "bolt.fill")
                            .foregroundColor(colorFromString(xp.color))
                        Text("+\(xp.amount) \(xp.statType)")
                            .font(.system(size: 20, weight: .bold, design: .serif))
                            .foregroundColor(colorFromString(xp.color))
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(
                        RoundedRectangle(cornerRadius: 10)
                            .fill(colorFromString(xp.color).opacity(0.2))
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(colorFromString(xp.color), lineWidth: 2)
                            )
                    )
                }

                // Total XP
                Text("Total: +\(summary.totalXP) XP")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.yellow)
                    .padding(.top, 8)
            }

            Divider()
                .background(Color.yellow.opacity(0.5))

            // Done button
            Button(action: onDone) {
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 20))
                    Text("Done")
                        .font(.system(size: 18, weight: .semibold, design: .serif))
                }
                .foregroundStyle(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color(red: 0.996, green: 0.937, blue: 0.816), // #FEEFD0
                            Color(red: 0.988, green: 0.835, blue: 0.529)  // #FCD587
                        ]),
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .padding(.horizontal, 40)
                .padding(.vertical, 14)
                .background(
                    ZStack {
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color(red: 0.702, green: 0.537, blue: 0.443), // #B38971
                                Color(red: 0.373, green: 0.333, blue: 0.325)  // #5F5553
                            ]),
                            startPoint: .top,
                            endPoint: .bottom
                        )

                        // Subtle highlight at top
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color.white.opacity(0.2),
                                Color.clear
                            ]),
                            startPoint: .top,
                            endPoint: .center
                        )
                    }
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .strokeBorder(Color(red: 0.976, green: 0.863, blue: 0.627), lineWidth: 3) // #F9DCA0
                )
                .cornerRadius(12)
            }
            .buttonStyle(.plain)
        }
        .padding(30)
        .background(.regularMaterial)
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.yellow.opacity(0.8), lineWidth: 3)
        )
        .cornerRadius(20)
        .shadow(color: .black.opacity(0.3), radius: 10, x: 0, y: 3)
        .scaleEffect(isVisible ? 1.0 : 0.85)
        .opacity(isVisible ? 1.0 : 0.0)
        .onAppear {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                isVisible = true
            }
        }
    }

    /// Helper to convert color string to Color
    private func colorFromString(_ colorName: String) -> Color {
        switch colorName.lowercased() {
        case "red": return .red
        case "blue": return .blue
        case "purple": return .purple
        case "green": return .green
        case "yellow": return .yellow
        case "orange": return .orange
        default: return .white
        }
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
        sessionState: .constant(.idle),
        onMarkRep: { print("Mark rep pressed") },
        onEndSession: { print("End session pressed") }
    )
}
