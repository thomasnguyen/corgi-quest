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
                .foregroundColor(.white)
                .padding(.horizontal, 28)
                .padding(.vertical, 16)
                .background(
                    ZStack {
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color.green.opacity(0.9),
                                Color.green.opacity(0.7)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
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
                        .strokeBorder(Color.green.opacity(0.9), lineWidth: 2)
                )
                .cornerRadius(14)
                .shadow(color: .green.opacity(0.5), radius: 10, x: 0, y: 4)
                .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)
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
                .foregroundColor(.white)
                .padding(.horizontal, 28)
                .padding(.vertical, 16)
                .background(
                    ZStack {
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color.blue.opacity(0.9),
                                Color.blue.opacity(0.7)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
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
                        .strokeBorder(Color.blue.opacity(0.9), lineWidth: 2)
                )
                .cornerRadius(14)
                .shadow(color: .blue.opacity(0.5), radius: 10, x: 0, y: 4)
                .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)
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

/// Displays dog name and level - Sleek minimal design
struct DogInfoPanel: View {
    let dogName: String
    let level: Int

    var body: some View {
        HStack(spacing: 12) {
            // Dog name - smaller and sleeker
            Text(dogName)
                .font(.system(size: 22, weight: .semibold, design: .rounded))
                .foregroundColor(.white)

            // Separator
            Text("•")
                .font(.system(size: 14))
                .foregroundColor(.white.opacity(0.4))

            // Level display - compact
            HStack(spacing: 4) {
                Image(systemName: "star.fill")
                    .font(.system(size: 12))
                    .foregroundColor(.yellow)
                Text("Lv \(level)")
                    .font(.system(size: 16, weight: .semibold, design: .rounded))
                    .foregroundColor(.yellow)
            }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 12)
        .background(
            Capsule()
                .fill(.ultraThinMaterial)
                .overlay(
                    Capsule()
                        .strokeBorder(Color.white.opacity(0.15), lineWidth: 1)
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
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(
                        ZStack {
                            LinearGradient(
                                gradient: Gradient(colors: [
                                    Color.green.opacity(0.9),
                                    Color.green.opacity(0.7)
                                ]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
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
                            .strokeBorder(Color.green.opacity(0.9), lineWidth: 1.5)
                    )
                    .cornerRadius(10)
                    .shadow(color: .green.opacity(0.4), radius: 6, x: 0, y: 2)
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
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(
                        ZStack {
                            LinearGradient(
                                gradient: Gradient(colors: [
                                    Color.red.opacity(0.9),
                                    Color.red.opacity(0.7)
                                ]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
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
                            .strokeBorder(Color.red.opacity(0.9), lineWidth: 1.5)
                    )
                    .cornerRadius(10)
                    .shadow(color: .red.opacity(0.4), radius: 6, x: 0, y: 2)
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

/// Streak display - floating next to dog info, smaller and cleaner
struct StreakDisplayPanel: View {
    let streak: Int

    var body: some View {
        HStack(spacing: 8) {
            Text("🔥")
                .font(.system(size: 20))
            VStack(alignment: .center, spacing: 1) {
                Text("\(streak) DAY STREAK")
                    .font(.system(size: 12, weight: .bold, design: .serif))
                    .foregroundColor(.orange)
                    .tracking(0.5)
                Text("Keep it up!")
                    .font(.system(size: 9, weight: .medium, design: .serif))
                    .foregroundColor(.yellow.opacity(0.9))
            }
            Text("🔥")
                .font(.system(size: 20))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(.ultraThinMaterial)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .strokeBorder(Color.orange.opacity(0.4), lineWidth: 1)
        )
    }
}

/// Full stats screen overlay - Apple-style design
struct StatsScreenView: View {
    let stats: [StatData]
    let goals: GoalData?
    let activities: [ActivityData]
    let weeklyXP: [DayXP]
    let onClose: () -> Void
    @State private var isVisible = false
    @State private var animateChart = false

    var body: some View {
        VStack(spacing: 0) {
            // Clean header with close button
            HStack {
                Text("Statistics")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(.white)

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

            // Content - NO SCROLL, everything fits
            VStack(spacing: 16) {
                // Stats cards in grid
                HStack(spacing: 12) {
                    ForEach(stats) { stat in
                        VStack(spacing: 8) {
                            ZStack {
                                Circle()
                                    .stroke(stat.color.opacity(0.15), lineWidth: 5)
                                    .frame(width: 65, height: 65)

                                Circle()
                                    .trim(from: 0, to: stat.xpProgress)
                                    .stroke(
                                        LinearGradient(
                                            gradient: Gradient(colors: [
                                                stat.color,
                                                stat.color.opacity(0.7)
                                            ]),
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        ),
                                        style: StrokeStyle(lineWidth: 5, lineCap: .round)
                                    )
                                    .frame(width: 65, height: 65)
                                    .rotationEffect(.degrees(-90))

                                Text("\(stat.level)")
                                    .font(.system(size: 22, weight: .semibold, design: .rounded))
                                    .foregroundColor(.white)
                            }

                            Text(stat.type)
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(.white)

                            Text(stat.name)
                                .font(.system(size: 9, weight: .medium))
                                .foregroundColor(.white.opacity(0.5))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(
                            RoundedRectangle(cornerRadius: 14)
                                .fill(.thinMaterial)
                        )
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 6)

                // Chart and Goals side by side
                HStack(alignment: .top, spacing: 12) {
                    // Weekly XP Chart
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Weekly XP")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)

                        Chart(weeklyXP) { day in
                            BarMark(
                                x: .value("Day", day.day),
                                y: .value("XP", animateChart ? day.total : 0)
                            )
                            .foregroundStyle(
                                LinearGradient(
                                    gradient: Gradient(colors: [
                                        Color.blue,
                                        Color.cyan
                                    ]),
                                    startPoint: .bottom,
                                    endPoint: .top
                                )
                            )
                            .cornerRadius(5)
                        }
                        .chartXAxis {
                            AxisMarks { _ in
                                AxisValueLabel()
                                    .font(.system(size: 9, weight: .medium))
                                    .foregroundStyle(.white.opacity(0.6))
                            }
                        }
                        .chartYAxis {
                            AxisMarks(position: .leading) { _ in
                                AxisValueLabel()
                                    .font(.system(size: 8))
                                    .foregroundStyle(.white.opacity(0.4))
                            }
                        }
                        .frame(height: 110)
                    }
                    .padding(16)
                    .background(
                        RoundedRectangle(cornerRadius: 14)
                            .fill(.thinMaterial)
                    )

                    // Goals
                    if let goals = goals {
                        VStack(alignment: .leading, spacing: 10) {
                            HStack {
                                Text("Today's Goals")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.white)

                                Spacer()

                                if goals.streak > 0 {
                                    HStack(spacing: 3) {
                                        Text("🔥")
                                            .font(.system(size: 14))
                                        Text("\(goals.streak)")
                                            .font(.system(size: 12, weight: .semibold))
                                            .foregroundColor(.orange)
                                    }
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 3)
                                    .background(
                                        Capsule()
                                            .fill(Color.orange.opacity(0.15))
                                    )
                                }
                            }

                            VStack(spacing: 10) {
                                // Physical
                                VStack(alignment: .leading, spacing: 5) {
                                    HStack {
                                        Text("Physical")
                                            .font(.system(size: 11, weight: .medium))
                                            .foregroundColor(.white.opacity(0.8))
                                        Spacer()
                                        Text("\(goals.physical.current)/\(goals.physical.target)")
                                            .font(.system(size: 11, weight: .semibold, design: .rounded))
                                            .foregroundColor(.white)
                                    }
                                    GeometryReader { geo in
                                        ZStack(alignment: .leading) {
                                            Capsule()
                                                .fill(Color.white.opacity(0.1))
                                                .frame(height: 7)
                                            Capsule()
                                                .fill(
                                                    LinearGradient(
                                                        gradient: Gradient(colors: [
                                                            Color.red,
                                                            Color.orange
                                                        ]),
                                                        startPoint: .leading,
                                                        endPoint: .trailing
                                                    )
                                                )
                                                .frame(width: geo.size.width * goals.physical.progress, height: 7)
                                        }
                                    }
                                    .frame(height: 7)
                                }

                                // Mental
                                VStack(alignment: .leading, spacing: 5) {
                                    HStack {
                                        Text("Mental")
                                            .font(.system(size: 11, weight: .medium))
                                            .foregroundColor(.white.opacity(0.8))
                                        Spacer()
                                        Text("\(goals.mental.current)/\(goals.mental.target)")
                                            .font(.system(size: 11, weight: .semibold, design: .rounded))
                                            .foregroundColor(.white)
                                    }
                                    GeometryReader { geo in
                                        ZStack(alignment: .leading) {
                                            Capsule()
                                                .fill(Color.white.opacity(0.1))
                                                .frame(height: 7)
                                            Capsule()
                                                .fill(
                                                    LinearGradient(
                                                        gradient: Gradient(colors: [
                                                            Color.blue,
                                                            Color.cyan
                                                        ]),
                                                        startPoint: .leading,
                                                        endPoint: .trailing
                                                    )
                                                )
                                                .frame(width: geo.size.width * goals.mental.progress, height: 7)
                                        }
                                    }
                                    .frame(height: 7)
                                }
                            }
                        }
                        .padding(16)
                        .background(
                            RoundedRectangle(cornerRadius: 14)
                                .fill(.thinMaterial)
                        )
                    }
                }
                .padding(.horizontal, 20)

                // Recent Activities
                VStack(alignment: .leading, spacing: 12) {
                    Text("Recent Activities")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)

                    ForEach(activities.prefix(2)) { activity in
                        HStack(spacing: 10) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(activity.name)
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.white)
                                    .lineLimit(1)

                                HStack(spacing: 5) {
                                    ForEach(activity.xpBreakdown, id: \.stat) { gain in
                                        Text("\(gain.stat) +\(gain.amount)")
                                            .font(.system(size: 9, weight: .semibold))
                                            .padding(.horizontal, 7)
                                            .padding(.vertical, 3)
                                            .background(
                                                Capsule()
                                                    .fill(statColor(for: gain.stat).opacity(0.2))
                                            )
                                            .foregroundColor(statColor(for: gain.stat))
                                    }
                                }
                            }

                            Spacer()

                            Text(activity.relativeTimestamp)
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(.white.opacity(0.4))
                        }
                        .padding(.vertical, 3)

                        if activity.id != activities.prefix(2).last?.id {
                            Divider()
                                .background(Color.white.opacity(0.1))
                        }
                    }
                }
                .padding(16)
                .background(
                    RoundedRectangle(cornerRadius: 14)
                        .fill(.thinMaterial)
                )
                .padding(.horizontal, 20)
                .padding(.bottom, 16)
            }
        }
        .frame(width: 750, height: 600)
        .clipShape(RoundedRectangle(cornerRadius: 28))
        .background(
            RoundedRectangle(cornerRadius: 28)
                .fill(.regularMaterial)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 28)
                .strokeBorder(
                    Color.white.opacity(0.2),
                    lineWidth: 1
                )
        )
        .shadow(color: .black.opacity(0.5), radius: 35, x: 0, y: 18)
        .scaleEffect(isVisible ? 1.0 : 0.96)
        .opacity(isVisible ? 1.0 : 0.0)
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.75)) {
                isVisible = true
            }
            withAnimation(.easeInOut(duration: 1.0).delay(0.3)) {
                animateChart = true
            }
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
                .foregroundColor(.white)
                .padding(.horizontal, 40)
                .padding(.vertical, 14)
                .background(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.green.opacity(0.8),
                            Color.green.opacity(0.6)
                        ]),
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.green.opacity(0.9), lineWidth: 2)
                )
                .cornerRadius(12)
                .shadow(color: .green.opacity(0.4), radius: 8, x: 0, y: 4)
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
