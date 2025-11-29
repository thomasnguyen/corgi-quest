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
    
    @State private var panelsVisible = false
    @State private var floatOffset: CGFloat = 0

    var body: some View {
        ZStack {
            // Left Panel: Stat Orbs - with depth and float animation
            StatOrbsPanel(stats: stats)
                .offset(x: -500, y: -50 + floatOffset)
                .rotation3DEffect(.degrees(panelsVisible ? 0 : -15), axis: (x: 0, y: 1, z: 0))
                .opacity(panelsVisible ? 1 : 0)
                .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.1), value: panelsVisible)

            // Top Panel: Today's Goals - with depth
            if let goals = goals {
                GoalsPanel(goals: goals)
                    .offset(x: 0, y: -250 + floatOffset * 0.8)
                    .rotation3DEffect(.degrees(panelsVisible ? 0 : 10), axis: (x: 1, y: 0, z: 0))
                    .opacity(panelsVisible ? 1 : 0)
                    .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.2), value: panelsVisible)
            }

            // Right Panel: Recent Activities - with depth and float animation
            ActivitiesPanel(activities: activities)
                .offset(x: 500, y: -50 + floatOffset * 1.2)
                .rotation3DEffect(.degrees(panelsVisible ? 0 : 15), axis: (x: 0, y: 1, z: 0))
                .opacity(panelsVisible ? 1 : 0)
                .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.3), value: panelsVisible)

            // Bottom Panel: Weekly XP Chart - with depth
            WeeklyChartPanel(weeklyXP: weeklyXP)
                .offset(x: 0, y: 200 + floatOffset * 0.6)
                .rotation3DEffect(.degrees(panelsVisible ? 0 : -10), axis: (x: 1, y: 0, z: 0))
                .opacity(panelsVisible ? 1 : 0)
                .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.4), value: panelsVisible)

            // Center Panel: Session (conditional) - always front and center
            if case .active(let sessionData) = sessionState {
                SessionPanel(
                    sessionData: sessionData,
                    onMarkRep: onMarkRep,
                    onEndSession: onEndSession
                )
                .offset(x: 0, y: 0)
                .scaleEffect(panelsVisible ? 1.0 : 0.9)
                .opacity(panelsVisible ? 1 : 0)
                .animation(.spring(response: 0.6, dampingFraction: 0.75).delay(0.5), value: panelsVisible)
            }
        }
        .onAppear {
            panelsVisible = true
            
            // Gentle floating animation for depth perception
            withAnimation(.easeInOut(duration: 3.0).repeatForever(autoreverses: true)) {
                floatOffset = 8
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
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color(red: 0.071, green: 0.071, blue: 0.086)) // #121216
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .strokeBorder(Color(red: 0.961, green: 0.769, blue: 0.373).opacity(0.2), lineWidth: 1) // #f5c35f
                )
        )
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
    @State private var animatedPhysicalProgress: CGFloat = 0
    @State private var animatedMentalProgress: CGFloat = 0
    @State private var streakPulse: CGFloat = 1.0
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Today's Goals")
                .font(.headline)
                .foregroundColor(.white)
            
            // Physical goal with shimmer animation
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Image(systemName: "figure.run")
                        .font(.system(size: 12))
                        .foregroundColor(.red)
                    Text("Physical: \(goals.physical.current) / \(goals.physical.target)")
                        .font(.caption)
                        .foregroundColor(.white)
                }
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        // Background track
                        Capsule()
                            .fill(Color.white.opacity(0.15))
                            .frame(height: 10)
                        
                        // Animated progress fill with gradient
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
                            .frame(width: geometry.size.width * animatedPhysicalProgress, height: 10)
        
                        
                        // Shimmer overlay when progressing
                        if animatedPhysicalProgress > 0 && animatedPhysicalProgress < 1.0 {
                            Capsule()
                                .fill(
                                    LinearGradient(
                                        gradient: Gradient(colors: [
                                            Color.white.opacity(0),
                                            Color.white.opacity(0.4),
                                            Color.white.opacity(0)
                                        ]),
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .frame(width: 40, height: 10)
                                .offset(x: -20)
                                .animation(.linear(duration: 1.5).repeatForever(autoreverses: false), value: animatedPhysicalProgress)
                        }
                    }
                }
                .frame(height: 10)
            }
            
            // Mental goal with shimmer animation
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Image(systemName: "brain.head.profile")
                        .font(.system(size: 12))
                        .foregroundColor(.blue)
                    Text("Mental: \(goals.mental.current) / \(goals.mental.target)")
                        .font(.caption)
                        .foregroundColor(.white)
                }
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        // Background track
                        Capsule()
                            .fill(Color.white.opacity(0.15))
                            .frame(height: 10)
                        
                        // Animated progress fill with gradient
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
                            .frame(width: geometry.size.width * animatedMentalProgress, height: 10)
        
                        
                        // Shimmer overlay when progressing
                        if animatedMentalProgress > 0 && animatedMentalProgress < 1.0 {
                            Capsule()
                                .fill(
                                    LinearGradient(
                                        gradient: Gradient(colors: [
                                            Color.white.opacity(0),
                                            Color.white.opacity(0.4),
                                            Color.white.opacity(0)
                                        ]),
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .frame(width: 40, height: 10)
                                .offset(x: -20)
                                .animation(.linear(duration: 1.5).repeatForever(autoreverses: false), value: animatedMentalProgress)
                        }
                    }
                }
                .frame(height: 10)
            }
            
            // Streak - PROMINENT DISPLAY with pulse animation
            HStack(spacing: 12) {
                Text("🔥")
                    .font(.system(size: 40))
                    .scaleEffect(streakPulse)
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
                    .scaleEffect(streakPulse)
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.orange.opacity(0.3))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(
                                LinearGradient(
                                    gradient: Gradient(colors: [
                                        Color.orange,
                                        Color.yellow
                                    ]),
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 2
                            )
                    )
            )

        }
        .padding(30)
        .frame(width: 320)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color(red: 0.071, green: 0.071, blue: 0.086)) // #121216
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .strokeBorder(Color(red: 0.961, green: 0.769, blue: 0.373).opacity(0.2), lineWidth: 1) // #f5c35f
                )
        )
        .onAppear {
            // Animate progress bars on appear
            withAnimation(.easeOut(duration: 0.8).delay(0.2)) {
                animatedPhysicalProgress = goals.physical.progress
            }
            withAnimation(.easeOut(duration: 0.8).delay(0.4)) {
                animatedMentalProgress = goals.mental.progress
            }
            
            // Continuous pulse for streak
            withAnimation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true)) {
                streakPulse = 1.1
            }
        }
        .onChange(of: goals.physical.progress) { oldValue, newValue in
            withAnimation(.spring(response: 0.6, dampingFraction: 0.7)) {
                animatedPhysicalProgress = newValue
            }
        }
        .onChange(of: goals.mental.progress) { oldValue, newValue in
            withAnimation(.spring(response: 0.6, dampingFraction: 0.7)) {
                animatedMentalProgress = newValue
            }
        }
    }
}

/// Displays last 3-5 training activities
struct ActivitiesPanel: View {
    let activities: [ActivityData]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent Activities")
                .font(.headline)
                .foregroundColor(.white)
            
            ForEach(activities.prefix(5)) { activity in
                VStack(alignment: .leading, spacing: 4) {
                    Text(activity.name)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                    
                    HStack(spacing: 8) {
                        ForEach(activity.xpBreakdown, id: \.stat) { gain in
                            Text("\(gain.stat) +\(gain.amount)")
                                .font(.caption2)
                                .fontWeight(.semibold)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(statColor(for: gain.stat).opacity(0.25))
                                .foregroundColor(statColor(for: gain.stat))
                                .cornerRadius(4)
                        }
                    }
                    
                    HStack {
                        Text(activity.relativeTimestamp)
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.5))
                        Text("•")
                            .foregroundColor(.white.opacity(0.5))
                        Text(activity.loggedBy)
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.5))
                    }
                }
                .padding(.vertical, 4)
                .transition(.opacity.combined(with: .move(edge: .top)))
                
                if activity.id != activities.prefix(5).last?.id {
                    Divider()
                        .background(Color.white.opacity(0.2))
                }
            }
        }
        .padding(30)
        .frame(width: 320)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color(red: 0.071, green: 0.071, blue: 0.086)) // #121216
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .strokeBorder(Color(red: 0.961, green: 0.769, blue: 0.373).opacity(0.2), lineWidth: 1) // #f5c35f
                )
        )
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
            HStack {
                Image(systemName: "chart.bar.fill")
                    .font(.system(size: 14))
                    .foregroundColor(.cyan)
                Text("Last 7 Days XP")
                    .font(.headline)
                    .foregroundColor(.white)
            }
            
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
                AxisMarks(values: .automatic) { value in
                    AxisValueLabel()
                        .font(.caption2)
                        .foregroundStyle(.white.opacity(0.7))
                }
            }
            .chartYAxis {
                AxisMarks(position: .leading) { value in
                    AxisValueLabel()
                        .font(.caption2)
                        .foregroundStyle(.white.opacity(0.5))
                }
            }
            .frame(height: 120)
            .onAppear {
                withAnimation(.easeInOut(duration: 1.0).delay(0.3)) {
                    animateChart = true
                }
            }
            .onChange(of: weeklyXP.map { $0.total }) { oldValue, newValue in
                // Re-animate when data changes
                animateChart = false
                withAnimation(.spring(response: 0.6, dampingFraction: 0.7)) {
                    animateChart = true
                }
            }
        }
        .padding(30)
        .frame(width: 420)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color(red: 0.071, green: 0.071, blue: 0.086)) // #121216
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .strokeBorder(Color(red: 0.961, green: 0.769, blue: 0.373).opacity(0.2), lineWidth: 1) // #f5c35f
                )
        )
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

                    Text("+\(notification.amount) \(notification.statType)")
                        .font(.system(size: 17, weight: .bold, design: .serif))
                        .foregroundColor(.white)
                        .tracking(0.5)

                    Text("XP")
                        .font(.system(size: 13, weight: .semibold, design: .serif))
                        .foregroundColor(notification.color)
                        .tracking(0.5)
                }
                .padding(.horizontal, 18)
                .padding(.vertical, 12)
                .background(
                    ZStack {
                        // Dark base - matching web app
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color(red: 0.071, green: 0.071, blue: 0.086)) // #121216

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
                    .fill(Color(red: 0.071, green: 0.071, blue: 0.086)) // #121216

                // Subtle inner border
                RoundedRectangle(cornerRadius: 18)
                    .strokeBorder(Color(red: 0.961, green: 0.769, blue: 0.373).opacity(0.2), lineWidth: 1) // #f5c35f
            }
        )
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


            // Separator
            Text("•")
                .font(.system(size: 14))
                .foregroundColor(.white.opacity(0.4))

            // Level display - compact with star
            HStack(spacing: 4) {
                Image(systemName: "star.fill")
                    .font(.system(size: 12))
                    .foregroundColor(Color(red: 0.961, green: 0.765, blue: 0.373)) // #F5C35F
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
    @State private var pulseAnimation = false
    @State private var celebrationScale: CGFloat = 1.0
    @State private var celebrationRotation: Double = 0
    @State private var showConfetti = false
    @State private var previousIsComplete = false

    // Timer to update elapsed time every second
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        VStack(spacing: 16) {
            // Title banner with decorative background
            Text("⚔️ ACTIVE SESSION ⚔️")
                .font(.system(size: 18, weight: .bold, design: .serif))
                .foregroundColor(.yellow)
                .tracking(1.5)
                .shadow(color: .yellow.opacity(0.6), radius: 8, x: 0, y: 0)
                .shadow(color: .black.opacity(0.8), radius: 2, x: 0, y: 2)
                .padding(.vertical, 8)
                .padding(.horizontal, 16)
                .background(
                    Capsule()
                        .fill(Color.yellow.opacity(0.1))
                        .overlay(
                            Capsule()
                                .strokeBorder(Color.yellow.opacity(0.3), lineWidth: 1)
                        )
                )

            // Elapsed timer with pulsing icon
            HStack(spacing: 8) {
                Image(systemName: "timer")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.cyan)
                    .shadow(color: .cyan.opacity(0.5), radius: 4)
                    .scaleEffect(pulseAnimation ? 1.1 : 1.0)
                Text(sessionData.elapsedTimeText(currentTime: currentTime))
                    .font(.system(size: 16, weight: .bold, design: .monospaced))
                    .foregroundColor(.cyan)
                    .shadow(color: .cyan.opacity(0.3), radius: 2)
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

            // Goal
            HStack(spacing: 6) {
                Image(systemName: "scope")
                    .font(.system(size: 14))
                    .foregroundColor(.green)
                Text(sessionData.goal)
                    .font(.system(size: 14, weight: .semibold, design: .serif))
                    .foregroundColor(.green)
            }

            // Rep counter - BIG AND PROMINENT with pulsing glow
            VStack(spacing: 6) {
                Text(sessionData.isComplete ? "BONUS! 🎉" : "PROGRESS")
                    .font(.system(size: 12, weight: .bold, design: .serif))
                    .foregroundColor(sessionData.isComplete ? .green : .gray.opacity(0.8))
                    .tracking(1)

                Text(sessionData.repCounterText)
                    .font(.system(size: 48, weight: .heavy, design: .serif))
                    .foregroundColor(sessionData.isComplete ? .green : .yellow)
                    .shadow(color: sessionData.isComplete ? .green.opacity(pulseAnimation ? 0.8 : 0.4) : .yellow.opacity(pulseAnimation ? 0.7 : 0.4), radius: pulseAnimation ? 16 : 10)
                    .shadow(color: .black.opacity(0.8), radius: 2, x: 0, y: 2)
                    .scaleEffect(pulseAnimation ? 1.03 : 1.0)
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
        .background(
            RoundedRectangle(cornerRadius: 18)
                .fill(Color(red: 0.08, green: 0.08, blue: 0.08).opacity(0.95))
        )
        .overlay(
            ZStack {
                // Pulsing border
                RoundedRectangle(cornerRadius: 18)
                    .strokeBorder(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                sessionData.isComplete ? Color.green.opacity(0.7) : Color.yellow.opacity(0.7),
                                sessionData.isComplete ? Color.cyan.opacity(0.5) : Color.orange.opacity(0.5)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: sessionData.isComplete ? 3.5 : 2.5
                    )
                    .shadow(color: sessionData.isComplete ? .green.opacity(0.6) : .yellow.opacity(pulseAnimation ? 0.4 : 0.15), radius: sessionData.isComplete ? 16 : (pulseAnimation ? 12 : 6), x: 0, y: 0)

                // Corner decorative elements
                GeometryReader { geometry in
                    // Top-left corner ornament
                    Image(systemName: sessionData.isComplete ? "star.fill" : "diamond.fill")
                        .font(.system(size: sessionData.isComplete ? 14 : 10))
                        .foregroundColor(sessionData.isComplete ? .green : .yellow)
                        .position(x: 20, y: 20)
                        .shadow(color: sessionData.isComplete ? .green.opacity(0.8) : .yellow.opacity(0.6), radius: sessionData.isComplete ? 8 : 4)
                        .rotationEffect(.degrees(celebrationRotation))
                        .scaleEffect(sessionData.isComplete ? 1.2 : 1.0)

                    // Top-right corner ornament
                    Image(systemName: sessionData.isComplete ? "star.fill" : "diamond.fill")
                        .font(.system(size: sessionData.isComplete ? 14 : 10))
                        .foregroundColor(sessionData.isComplete ? .green : .yellow)
                        .position(x: geometry.size.width - 20, y: 20)
                        .shadow(color: sessionData.isComplete ? .green.opacity(0.8) : .yellow.opacity(0.6), radius: sessionData.isComplete ? 8 : 4)
                        .rotationEffect(.degrees(-celebrationRotation))
                        .scaleEffect(sessionData.isComplete ? 1.2 : 1.0)

                    // Bottom-left corner ornament
                    Image(systemName: sessionData.isComplete ? "star.fill" : "diamond.fill")
                        .font(.system(size: sessionData.isComplete ? 14 : 10))
                        .foregroundColor(sessionData.isComplete ? .cyan : .orange)
                        .position(x: 20, y: geometry.size.height - 20)
                        .shadow(color: sessionData.isComplete ? .cyan.opacity(0.8) : .orange.opacity(0.6), radius: sessionData.isComplete ? 8 : 4)
                        .rotationEffect(.degrees(-celebrationRotation))
                        .scaleEffect(sessionData.isComplete ? 1.2 : 1.0)

                    // Bottom-right corner ornament
                    Image(systemName: sessionData.isComplete ? "star.fill" : "diamond.fill")
                        .font(.system(size: sessionData.isComplete ? 14 : 10))
                        .foregroundColor(sessionData.isComplete ? .cyan : .orange)
                        .position(x: geometry.size.width - 20, y: geometry.size.height - 20)
                        .shadow(color: sessionData.isComplete ? .cyan.opacity(0.8) : .orange.opacity(0.6), radius: sessionData.isComplete ? 8 : 4)
                        .rotationEffect(.degrees(celebrationRotation))
                        .scaleEffect(sessionData.isComplete ? 1.2 : 1.0)

                    // Confetti particles (only when complete)
                    if showConfetti {
                        ForEach(0..<12, id: \.self) { index in
                            ConfettiParticle(index: index, geometry: geometry)
                        }
                    }
                }
            }
        )
        .cornerRadius(18)
        .scaleEffect(celebrationScale)
        .shadow(color: sessionData.isComplete ? .green.opacity(0.5) : .yellow.opacity(pulseAnimation ? 0.3 : 0.15), radius: sessionData.isComplete ? 20 : (pulseAnimation ? 14 : 8), x: 0, y: 0)
        .shadow(color: .black.opacity(0.5), radius: 10, x: 0, y: 4)
        .onAppear {
            // Start pulsing animation
            withAnimation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true)) {
                pulseAnimation = true
            }
            previousIsComplete = sessionData.isComplete
        }
        .onChange(of: sessionData.isComplete) { oldValue, newValue in
            // Trigger celebration when completed
            if newValue && !previousIsComplete {
                triggerCelebration()
            }
            previousIsComplete = newValue
        }
    }

    /// Triggers celebration animation when session completes
    private func triggerCelebration() {
        // Bounce effect
        withAnimation(.spring(response: 0.6, dampingFraction: 0.5)) {
            celebrationScale = 1.1
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                celebrationScale = 1.0
            }
        }

        // Rotate corner stars
        withAnimation(.easeInOut(duration: 0.8).repeatCount(3, autoreverses: true)) {
            celebrationRotation = 360
        }

        // Show confetti
        showConfetti = true

        // Hide confetti after 2 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            withAnimation {
                showConfetti = false
            }
        }
    }
}

/// Confetti particle for celebration animation
struct ConfettiParticle: View {
    let index: Int
    let geometry: GeometryProxy

    @State private var yOffset: CGFloat = 0
    @State private var xOffset: CGFloat = 0
    @State private var opacity: Double = 1.0
    @State private var rotation: Double = 0

    private var color: Color {
        let colors: [Color] = [.yellow, .orange, .green, .cyan, .purple, .pink]
        return colors[index % colors.count]
    }

    private var symbol: String {
        let symbols = ["star.fill", "sparkle", "circle.fill", "diamond.fill"]
        return symbols[index % symbols.count]
    }

    var body: some View {
        Image(systemName: symbol)
            .font(.system(size: 12))
            .foregroundColor(color)
            .position(
                x: geometry.size.width / 2 + xOffset,
                y: geometry.size.height / 2 + yOffset
            )
            .opacity(opacity)
            .rotationEffect(.degrees(rotation))
            .onAppear {
                let angle = Double(index) * (360.0 / 12.0)
                let distance: CGFloat = 80

                withAnimation(.easeOut(duration: 1.2)) {
                    xOffset = cos(angle * .pi / 180) * distance
                    yOffset = sin(angle * .pi / 180) * distance
                    opacity = 0
                }

                withAnimation(.linear(duration: 1.2)) {
                    rotation = Double.random(in: 180...540)
                }
            }
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

/// Full stats screen overlay - Apple-style design
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
    
    // Animation timing constants (Requirements 3.1)
    private let baseDelay: Double = 0.3
    private let staggerInterval: Double = 0.2
    private let fillDuration: Double = 0.8

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
                                        style: StrokeStyle(lineWidth: 5, lineCap: .round)
                                    )
                                    .frame(width: 65, height: 65)
                                    .rotationEffect(.degrees(-90))
                                    .scaleEffect(glowScale[stat.type] ?? 1.0)

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
        .scaleEffect(isVisible ? 1.0 : 0.96)
        .opacity(isVisible ? 1.0 : 0.0)
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.75)) {
                isVisible = true
            }
            withAnimation(.easeInOut(duration: 1.0).delay(0.3)) {
                animateChart = true
            }
            
            // Initialize all stat progress values to 0 (Requirements 1.1, 1.4)
            for stat in stats {
                animatedProgress[stat.type] = 0
                glowScale[stat.type] = 1.0
            }
            
            // Staggered fill animations (Requirements 1.2, 1.3, 3.2)
            // PHY at 0.3s, INT at 0.5s, IMP at 0.7s, SOC at 0.9s
            for (index, stat) in stats.enumerated() {
                let delay = baseDelay + (Double(index) * staggerInterval)
                
                // Animate each stat's progress with easeOut curve over 0.8s duration
                withAnimation(.easeOut(duration: fillDuration).delay(delay)) {
                    animatedProgress[stat.type] = stat.xpProgress
                }
                
                // Glow pulse effect on fill completion (Requirements 2.1, 2.2, 2.3)
                // Trigger glow after fill duration + delay
                let glowDelay = delay + fillDuration
                DispatchQueue.main.asyncAfter(deadline: .now() + glowDelay) {
                    // Animate scale to 1.05x with spring animation (increases shadow radius)
                    withAnimation(.spring(response: 0.2, dampingFraction: 0.6)) {
                        glowScale[stat.type] = 1.05
                    }
                    // Animate scale back to 1.0x after brief delay (0.15s)
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                        withAnimation(.spring(response: 0.2, dampingFraction: 0.8)) {
                            glowScale[stat.type] = 1.0
                        }
                    }
                }
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
