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
        VStack(alignment: .trailing, spacing: 12) {
            ForEach(notifications) { notification in
                HStack(spacing: 10) {
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 20))
                        .foregroundColor(notification.color)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("+\(notification.amount) \(notification.statType) XP")
                            .font(.system(size: 18, weight: .bold, design: .serif))
                            .foregroundColor(.white)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(notification.color.opacity(0.25))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(notification.color, lineWidth: 2)
                        )
                        .shadow(color: notification.color.opacity(0.6), radius: 10)
                )
                .transition(.asymmetric(
                    insertion: .move(edge: .trailing).combined(with: .opacity),
                    removal: .opacity.combined(with: .scale(scale: 0.8))
                ))
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.7), value: notifications)
    }
}

/// Quick action buttons - Skyrim-style action bar
struct QuickActionsPanel: View {
    let sessionState: SessionState
    let onStartTraining: () -> Void
    let onViewStats: () -> Void

    var body: some View {
        HStack(spacing: 20) {
            // Start Training button
            Button(action: onStartTraining) {
                HStack(spacing: 8) {
                    Image(systemName: "figure.walk")
                        .font(.system(size: 20))
                    Text("Start Training")
                        .font(.system(size: 18, weight: .semibold, design: .serif))
                }
                .foregroundColor(.white)
                .padding(.horizontal, 24)
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
            .disabled(sessionState.isActive)
            .opacity(sessionState.isActive ? 0.5 : 1.0)

            // View Stats button
            Button(action: onViewStats) {
                HStack(spacing: 8) {
                    Image(systemName: "chart.bar.fill")
                        .font(.system(size: 20))
                    Text("View Stats")
                        .font(.system(size: 18, weight: .semibold, design: .serif))
                }
                .foregroundColor(.white)
                .padding(.horizontal, 24)
                .padding(.vertical, 14)
                .background(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.blue.opacity(0.8),
                            Color.blue.opacity(0.6)
                        ]),
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.blue.opacity(0.9), lineWidth: 2)
                )
                .cornerRadius(12)
                .shadow(color: .blue.opacity(0.4), radius: 8, x: 0, y: 4)
            }
            .buttonStyle(.plain)
        }
        .padding(.vertical, 16)
        .padding(.horizontal, 20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(red: 0.15, green: 0.15, blue: 0.15).opacity(0.85))
                .shadow(color: .black.opacity(0.5), radius: 10, x: 0, y: 4)
        )
    }
}

/// Displays dog name and level - Elegant RPG-style nameplate
struct DogInfoPanel: View {
    let dogName: String
    let level: Int

    @State private var shimmerOffset: CGFloat = -200

    var body: some View {
        VStack(spacing: 16) {
            // Decorative top divider
            HStack(spacing: 12) {
                Rectangle()
                    .fill(LinearGradient(
                        colors: [.clear, Color.yellow.opacity(0.6), Color.yellow.opacity(0.6), .clear],
                        startPoint: .leading,
                        endPoint: .trailing
                    ))
                    .frame(height: 1)

                Image(systemName: "crown.fill")
                    .font(.system(size: 16))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [Color.yellow, Color.orange],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .shadow(color: .yellow.opacity(0.8), radius: 6)

                Rectangle()
                    .fill(LinearGradient(
                        colors: [.clear, Color.yellow.opacity(0.6), Color.yellow.opacity(0.6), .clear],
                        startPoint: .leading,
                        endPoint: .trailing
                    ))
                    .frame(height: 1)
            }
            .frame(maxWidth: 300)

            // Dog name with elegant styling
            Text(dogName)
                .font(.system(size: 40, weight: .bold, design: .serif))
                .foregroundStyle(
                    LinearGradient(
                        colors: [Color.white, Color(white: 0.9)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .shadow(color: .black.opacity(0.6), radius: 2, x: 0, y: 2)
                .shadow(color: Color.yellow.opacity(0.3), radius: 8)
                .overlay(
                    // Shimmer effect
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [.clear, Color.white.opacity(0.3), .clear],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: 60)
                        .offset(x: shimmerOffset)
                        .blur(radius: 8)
                        .mask(
                            Text(dogName)
                                .font(.system(size: 40, weight: .bold, design: .serif))
                        )
                )
                .onAppear {
                    withAnimation(Animation.linear(duration: 3).repeatForever(autoreverses: false)) {
                        shimmerOffset = 200
                    }
                }

            // Level display with refined elegance
            HStack(spacing: 12) {
                // Left ornament
                Image(systemName: "sparkles")
                    .font(.system(size: 14))
                    .foregroundColor(Color.yellow.opacity(0.8))
                    .shadow(color: .yellow.opacity(0.6), radius: 4)

                // Level text with gradient
                HStack(spacing: 6) {
                    Text("Level")
                        .font(.system(size: 18, weight: .medium, design: .serif))
                        .foregroundColor(Color.yellow.opacity(0.9))

                    Text("\(level)")
                        .font(.system(size: 32, weight: .bold, design: .serif))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [Color.yellow, Color.orange],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                }
                .shadow(color: .black.opacity(0.6), radius: 2, x: 0, y: 2)
                .shadow(color: Color.yellow.opacity(0.5), radius: 8)

                // Right ornament
                Image(systemName: "sparkles")
                    .font(.system(size: 14))
                    .foregroundColor(Color.yellow.opacity(0.8))
                    .shadow(color: .yellow.opacity(0.6), radius: 4)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(
                Capsule()
                    .fill(Color.black.opacity(0.4))
                    .overlay(
                        Capsule()
                            .stroke(
                                LinearGradient(
                                    colors: [Color.yellow.opacity(0.6), Color.orange.opacity(0.4)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 1.5
                            )
                    )
            )

            // Decorative bottom divider
            Rectangle()
                .fill(LinearGradient(
                    colors: [.clear, Color.yellow.opacity(0.6), Color.yellow.opacity(0.6), .clear],
                    startPoint: .leading,
                    endPoint: .trailing
                ))
                .frame(width: 250, height: 1)
        }
        .padding(.vertical, 24)
        .padding(.horizontal, 48)
        .background(
            ZStack {
                // Main background with subtle gradient
                RoundedRectangle(cornerRadius: 20)
                    .fill(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color(red: 0.12, green: 0.12, blue: 0.15).opacity(0.95),
                                Color(red: 0.08, green: 0.08, blue: 0.12).opacity(0.95)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )

                // Inner glow
                RoundedRectangle(cornerRadius: 20)
                    .stroke(
                        LinearGradient(
                            colors: [Color.yellow.opacity(0.4), Color.orange.opacity(0.2)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 2
                    )
                    .blur(radius: 1)

                // Outer border
                RoundedRectangle(cornerRadius: 20)
                    .stroke(
                        LinearGradient(
                            colors: [Color.yellow.opacity(0.7), Color.orange.opacity(0.5)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 2
                    )
            }
        )
        .shadow(color: Color.yellow.opacity(0.2), radius: 20, x: 0, y: 0)
        .shadow(color: .black.opacity(0.6), radius: 15, x: 0, y: 8)
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
        VStack(spacing: 20) {
            // Title banner
            Text("⚔️ ACTIVE TRAINING ⚔️")
                .font(.system(size: 20, weight: .bold, design: .serif))
                .foregroundColor(.yellow)
                .shadow(color: .black.opacity(0.8), radius: 4, x: 0, y: 2)

            // Elapsed timer
            HStack(spacing: 8) {
                Image(systemName: "clock.fill")
                    .foregroundColor(.cyan)
                Text(sessionData.elapsedTimeText(currentTime: currentTime))
                    .font(.system(size: 18, weight: .semibold, design: .monospaced))
                    .foregroundColor(.cyan)
            }
            .onReceive(timer) { _ in
                currentTime = Date()
            }

            Divider()
                .background(Color.yellow.opacity(0.5))

            // Activity name
            Text(sessionData.activity)
                .font(.system(size: 28, weight: .bold, design: .serif))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)

            // Goal
            HStack {
                Image(systemName: "target")
                    .foregroundColor(.green)
                Text(sessionData.goal)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.green)
            }

            // Rep counter - BIG AND PROMINENT
            VStack(spacing: 8) {
                Text("PROGRESS")
                    .font(.system(size: 14, weight: .semibold, design: .serif))
                    .foregroundColor(.gray)

                Text(sessionData.repCounterText)
                    .font(.system(size: 56, weight: .bold, design: .serif))
                    .foregroundColor(sessionData.isComplete ? .green : .yellow)
                    .shadow(color: sessionData.isComplete ? .green.opacity(0.8) : .yellow.opacity(0.6), radius: 10)
            }
            .padding(.vertical, 12)

            // Tips
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Image(systemName: "lightbulb.fill")
                        .foregroundColor(.yellow)
                    Text("Tips:")
                        .font(.system(size: 14, weight: .semibold))
                }
                Text(sessionData.tips)
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.9))
            }
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.black.opacity(0.3))
            .cornerRadius(8)

            // Suggestion (if any)
            if let suggestion = sessionData.currentSuggestion {
                Text(suggestion)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.green)
                    .padding(10)
                    .background(Color.green.opacity(0.2))
                    .cornerRadius(8)
                    .transition(.opacity)
            }

            Divider()
                .background(Color.yellow.opacity(0.5))

            // Action buttons
            HStack(spacing: 16) {
                // Mark Rep button
                Button(action: onMarkRep) {
                    HStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 20))
                        Text("Mark Rep")
                            .font(.system(size: 16, weight: .semibold, design: .serif))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
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
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(Color.green.opacity(0.9), lineWidth: 2)
                    )
                    .cornerRadius(10)
                    .shadow(color: .green.opacity(0.4), radius: 6, x: 0, y: 3)
                }
                .buttonStyle(.plain)

                // End Session button
                Button(action: onEndSession) {
                    HStack(spacing: 8) {
                        Image(systemName: "stop.circle.fill")
                            .font(.system(size: 20))
                        Text("End Session")
                            .font(.system(size: 16, weight: .semibold, design: .serif))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color.red.opacity(0.8),
                                Color.red.opacity(0.6)
                            ]),
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(Color.red.opacity(0.9), lineWidth: 2)
                    )
                    .cornerRadius(10)
                    .shadow(color: .red.opacity(0.4), radius: 6, x: 0, y: 3)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(30)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.2, green: 0.15, blue: 0.1).opacity(0.95),
                    Color(red: 0.15, green: 0.1, blue: 0.05).opacity(0.95)
                ]),
                startPoint: .top,
                endPoint: .bottom
            )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.yellow.opacity(0.7), lineWidth: 3)
        )
        .cornerRadius(20)
        .shadow(color: .black.opacity(0.7), radius: 15, x: 0, y: 5)
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
