//
//  StatDetailModal.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/27/25.
//

import SwiftUI

/// Modal view showing detailed stat information
/// Requirements: 2.1, 2.5
struct StatDetailModal: View {
    let stat: StatData
    let onDismiss: () -> Void
    
    @State private var isVisible = false
    @State private var progressAnimation: CGFloat = 0
    
    var body: some View {
        VStack(spacing: 24) {
            // Header with close button
            HStack {
                Text(stat.name)
                    .font(.system(size: 32, weight: .bold, design: .serif))
                    .foregroundStyle(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                stat.color,
                                stat.color.opacity(0.7)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                
                Spacer()
                
                Button(action: onDismiss) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 28))
                        .foregroundColor(.white.opacity(0.6))
                        .symbolRenderingMode(.hierarchical)
                }
                .buttonStyle(.plain)
            }
            
            Divider()
                .background(stat.color.opacity(0.3))
            
            // Large stat orb with progress
            ZStack {
                Circle()
                    .stroke(stat.color.opacity(0.2), lineWidth: 12)
                    .frame(width: 180, height: 180)
                
                Circle()
                    .trim(from: 0, to: progressAnimation)
                    .stroke(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                stat.color,
                                stat.color.opacity(0.6)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        style: StrokeStyle(lineWidth: 12, lineCap: .round)
                    )
                    .frame(width: 180, height: 180)
                    .rotationEffect(.degrees(-90))
                    .shadow(color: stat.color.opacity(0.6), radius: 15)
                
                VStack(spacing: 8) {
                    Text("Level \(stat.level)")
                        .font(.system(size: 24, weight: .bold, design: .serif))
                        .foregroundColor(.white)
                    
                    Text(stat.type)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(stat.color)
                }
            }
            .padding(.vertical, 20)
            
            // XP Breakdown
            VStack(alignment: .leading, spacing: 16) {
                Text("XP Progress")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
                
                HStack {
                    Text("Current XP:")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                    Spacer()
                    Text("\(stat.xp)")
                        .font(.system(size: 16, weight: .bold, design: .monospaced))
                        .foregroundColor(stat.color)
                }
                
                HStack {
                    Text("Next Level:")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                    Spacer()
                    Text("\(stat.xpToNextLevel)")
                        .font(.system(size: 16, weight: .bold, design: .monospaced))
                        .foregroundColor(.white)
                }
                
                HStack {
                    Text("Progress:")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                    Spacer()
                    Text("\(Int(stat.xpProgress * 100))%")
                        .font(.system(size: 16, weight: .bold, design: .monospaced))
                        .foregroundColor(stat.color)
                }
                
                // Progress bar
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        Capsule()
                            .fill(Color.white.opacity(0.1))
                            .frame(height: 12)
                        
                        Capsule()
                            .fill(
                                LinearGradient(
                                    gradient: Gradient(colors: [
                                        stat.color,
                                        stat.color.opacity(0.7)
                                    ]),
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .frame(width: geometry.size.width * progressAnimation, height: 12)
                            .shadow(color: stat.color.opacity(0.6), radius: 8)
                    }
                }
                .frame(height: 12)
            }
            .padding(20)
            .background {
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.black.opacity(0.3))
            }
            
            // Recent Gains (placeholder - would come from backend)
            VStack(alignment: .leading, spacing: 12) {
                Text("Recent Gains")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
                
                VStack(spacing: 8) {
                    RecentGainRow(activity: "Leash Training", xp: 25, color: stat.color)
                    RecentGainRow(activity: "Calm Walk", xp: 15, color: stat.color)
                    RecentGainRow(activity: "Impulse Control", xp: 20, color: stat.color)
                }
            }
            .padding(20)
            .background {
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.black.opacity(0.3))
            }
            
            Spacer()
            
            // Dismiss button
            Button(action: onDismiss) {
                HStack(spacing: 10) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 18, weight: .semibold))
                    Text("CLOSE")
                        .font(.system(size: 17, weight: .bold, design: .serif))
                        .tracking(1)
                }
                .foregroundStyle(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color(red: 0.996, green: 0.937, blue: 0.816),
                            Color(red: 0.988, green: 0.835, blue: 0.529)
                        ]),
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background {
                    ZStack {
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color(red: 0.702, green: 0.537, blue: 0.443),
                                Color(red: 0.373, green: 0.333, blue: 0.325)
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
                }
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .strokeBorder(Color(red: 0.976, green: 0.863, blue: 0.627), lineWidth: 3)
                )
                .cornerRadius(14)
            }
            .buttonStyle(.plain)
        }
        .padding(32)
        .frame(width: 500, height: 700)
        .background {
            RoundedRectangle(cornerRadius: 24)
                .fill(.regularMaterial)
        }
        .overlay(
            RoundedRectangle(cornerRadius: 24)
                .strokeBorder(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            stat.color.opacity(0.6),
                            stat.color.opacity(0.3)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 2
                )
        )
        .shadow(color: stat.color.opacity(0.3), radius: 20, x: 0, y: 10)
        .shadow(color: .black.opacity(0.5), radius: 30, x: 0, y: 15)
        .scaleEffect(isVisible ? 1.0 : 0.9)
        .opacity(isVisible ? 1.0 : 0.0)
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.75)) {
                isVisible = true
            }
            
            withAnimation(.easeOut(duration: 1.0).delay(0.3)) {
                progressAnimation = stat.xpProgress
            }
        }
    }
}

/// Row showing a recent XP gain
struct RecentGainRow: View {
    let activity: String
    let xp: Int
    let color: Color
    
    var body: some View {
        HStack {
            Text(activity)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(.white.opacity(0.8))
            
            Spacer()
            
            HStack(spacing: 4) {
                Text("+\(xp)")
                    .font(.system(size: 14, weight: .bold, design: .monospaced))
                    .foregroundColor(color)
                Image(systemName: "bolt.fill")
                    .font(.system(size: 12))
                    .foregroundColor(color)
            }
        }
        .padding(.vertical, 6)
    }
}

// MARK: - Preview

#Preview {
    StatDetailModal(
        stat: StatData(
            type: "PHY",
            name: "Physical",
            level: 5,
            xp: 75,
            xpToNextLevel: 100,
            xpProgress: 0.75
        ),
        onDismiss: {}
    )
}
