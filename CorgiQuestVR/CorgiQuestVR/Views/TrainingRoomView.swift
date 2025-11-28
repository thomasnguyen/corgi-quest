//
//  TrainingRoomView.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/24/25.
//

import SwiftUI
import RealityKit

/// Main immersive training room view with 3D environment and floating UI panels
struct TrainingRoomView: View {
    // ViewModel for state management and data fetching
    @StateObject private var viewModel = TrainingRoomViewModel()

    // View state for HUD management
    @State private var viewState: ViewState = .minimal

    // Voice command handler - DISABLED for simulator (microphone permissions hang)
    // @StateObject private var voiceCommandHandler = VoiceCommandHandler()

    // Hand tracking manager for gesture interactions
    @StateObject private var handTracking = HandTrackingManager()
    
    // Panel hover state
    @StateObject private var hoverState = PanelHoverState()
    
    // Panel position manager for drag repositioning
    @StateObject private var positionManager = PanelPositionManager()

    // Debounce timer for rep marking
    @State private var lastRepMarkTime: Date = .distantPast
    private let repMarkDebounceInterval: TimeInterval = 0.5

    // XP notifications for pop-ups
    @State private var xpNotifications: [XPNotification] = []
    @State private var previousStatXP: [String: Int] = [:] // Track previous XP values
    
    // Stat detail modal state
    @State private var selectedStat: StatData?
    @State private var showStatDetail: Bool = false

    var body: some View {
        RealityView { content, attachments in
            setupEnvironment(content: content)
            setupPedestal(content: content, dogName: viewModel.dogName)

            // Create a head anchor - this will follow the user's head
            let headAnchor = AnchorEntity(.head)
            content.add(headAnchor)

            // Position attachments
            positionAttachments(headAnchor: headAnchor, attachments: attachments)
        } update: { content, attachments in
            // Update attachment positions when state changes
            if let headAnchor = content.entities.first(where: { $0 is AnchorEntity }) as? AnchorEntity {
                // Remove all children first
                headAnchor.children.removeAll()

                // Re-add with updated positions
                positionAttachments(headAnchor: headAnchor, attachments: attachments)
            }
        } attachments: {
            // Dog Info with streak (always visible)
            Attachment(id: "dogInfo") {
                DogInfoPanel(
                    dogName: viewModel.dogName,
                    level: viewModel.dogLevel,
                    streak: viewModel.goals?.streak
                )
                .frame(width: 550) // Wider to accommodate streak
                .panelHover(isHovered: hoverState.isHovered(.dogInfo), color: .yellow)
                .dragFeedback(isDragging: positionManager.draggedPanel == .dogInfo)
            }

            // XP Progress Bar (always visible, centered)
            Attachment(id: "xpBar") {
                XPProgressBar(currentXP: viewModel.overallXp, maxXP: viewModel.xpToNextLevel)
                    .frame(width: 250)
                    .panelHover(isHovered: hoverState.isHovered(.xpBar), color: .orange)
                    .dragFeedback(isDragging: positionManager.draggedPanel == .xpBar)
            }

            // Buttons overlay (only in minimal view - no background panel)
            if viewState == .minimal {
                Attachment(id: "floatingButtons") {
                    HStack(spacing: 16) {
                        // Start Training button
                        Button(action: startTrainingSession) {
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
                                LinearGradient(
                                    gradient: Gradient(colors: [
                                        Color(red: 0.702, green: 0.537, blue: 0.443), // #B38971
                                        Color(red: 0.373, green: 0.333, blue: 0.325)  // #5F5553
                                    ]),
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 14)
                                    .strokeBorder(Color(red: 0.976, green: 0.863, blue: 0.627), lineWidth: 3) // #F9DCA0
                            )
                            .cornerRadius(14)
                        }
                        .buttonStyle(.plain)

                        // View Stats button
                        Button(action: toggleStatsView) {
                            HStack(spacing: 10) {
                                Image(systemName: "chart.xyaxis.line")
                                    .font(.system(size: 18, weight: .semibold))
                                Text("VIEW STATS")
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
                                LinearGradient(
                                    gradient: Gradient(colors: [
                                        Color(red: 0.702, green: 0.537, blue: 0.443), // #B38971
                                        Color(red: 0.373, green: 0.333, blue: 0.325)  // #5F5553
                                    ]),
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 14)
                                    .strokeBorder(Color(red: 0.976, green: 0.863, blue: 0.627), lineWidth: 3) // #F9DCA0
                            )
                            .cornerRadius(14)
                        }
                        .buttonStyle(.plain)
                    }
                    .frame(width: 500)
                }
            }

            // Stats Screen (full overlay)
            if viewState.isStats {
                Attachment(id: "statsScreen") {
                    StatsScreenView(
                        stats: viewModel.stats,
                        goals: viewModel.goals,
                        activities: viewModel.activities,
                        weeklyXP: viewModel.weeklyXP,
                        onClose: closeStatsView
                    )
                    .frame(width: 800)
                }
            }

            // Session panel (only during active training)
            if case .training(let sessionData) = viewState {
                Attachment(id: "session") {
                    SessionPanel(
                        sessionData: sessionData,
                        onMarkRep: handleMarkRep,
                        onEndSession: handleEndSessionButton
                    )
                    .frame(width: 350) // Smaller width so it doesn't block view
                    .panelHover(isHovered: hoverState.isHovered(.session), color: .green)
                    .dragFeedback(isDragging: positionManager.draggedPanel == .session)
                }
            }

            // Session Summary (after training ends)
            if case .summary(let summary) = viewState {
                Attachment(id: "summary") {
                    SessionSummaryView(
                        summary: summary,
                        onDone: returnToMinimal
                    )
                    .frame(width: 500)
                }
            }

            // XP Notifications
            Attachment(id: "xpNotifications") {
                XPNotificationsView(notifications: xpNotifications)
                    .frame(width: 250)
            }
            
            // Stat Detail Modal (when a stat is tapped)
            if showStatDetail, let stat = selectedStat {
                Attachment(id: "statDetail") {
                    StatDetailModal(
                        stat: stat,
                        onDismiss: closeStatDetail
                    )
                }
            }
        }
        .onAppear {
            // Fetch initial data and start polling
            Task {
                await viewModel.fetchInitialData()
                viewModel.startPolling()
                
                // Start hand tracking
                await handTracking.startTracking()
            }
        }
        .onDisappear {
            // Stop polling when view disappears
            viewModel.stopPolling()
            
            // Stop hand tracking
            handTracking.stopTracking()
        }
        .onChange(of: viewModel.stats) { oldStats, newStats in
            detectXPChanges(old: oldStats, new: newStats)
        }
        .onChange(of: handTracking.leftHandPosition) { _, _ in
            hoverState.updateHover(from: handTracking)
        }
        .onChange(of: handTracking.rightHandPosition) { _, _ in
            hoverState.updateHover(from: handTracking)
        }
        .onChange(of: handTracking.detectedGesture) { _, newGesture in
            handleGesture(newGesture)
        }
    }

    // MARK: - Gesture Handling
    
    /// Handles detected hand gestures
    /// Requirements: 2.1, 2.2, 2.5
    private func handleGesture(_ gesture: HandGesture?) {
        guard let gesture = gesture else {
            // Gesture ended - check if we were dragging
            if positionManager.isDragging {
                positionManager.endDrag()
            }
            return
        }
        
        switch gesture {
        case .tap(let position):
            handleTapGesture(at: position)
        case .pinch(let start, let current):
            handlePinchGesture(start: start, current: current)
        case .dismiss:
            handleDismissGesture()
        default:
            break
        }
    }
    
    /// Handles tap gesture - opens stat detail if tapping near a stat
    /// Requirements: 2.1
    private func handleTapGesture(at position: SIMD3<Float>) {
        // Check if tapping near stats panel
        if handTracking.isHandNear(panel: .stats, threshold: 0.2) {
            // Find which stat was tapped (simplified - would need more precise hit testing)
            if let firstStat = viewModel.stats.first {
                selectedStat = firstStat
                withAnimation(.spring(response: 0.4, dampingFraction: 0.75)) {
                    showStatDetail = true
                }
            }
        }
    }
    
    /// Handles pinch gesture - starts or updates panel drag
    /// Requirements: 2.2
    private func handlePinchGesture(start: SIMD3<Float>, current: SIMD3<Float>) {
        // Check if we're starting a new drag
        if !positionManager.isDragging {
            // Find which panel is being pinched
            let panels: [PanelIdentifier] = [.stats, .goals, .activities, .chart, .session, .dogInfo, .xpBar]
            
            for panel in panels {
                if handTracking.isHandNear(panel: panel, threshold: 0.2) {
                    positionManager.startDrag(panel: panel, handPosition: start)
                    break
                }
            }
        } else {
            // Update drag position
            positionManager.updateDrag(currentHandPosition: current)
        }
    }
    
    /// Handles dismiss gesture - closes any open modals
    /// Requirements: 2.5
    private func handleDismissGesture() {
        if showStatDetail {
            closeStatDetail()
        }
        
        if positionManager.isDragging {
            positionManager.cancelDrag()
        }
    }
    
    /// Closes the stat detail modal
    private func closeStatDetail() {
        withAnimation(.easeOut(duration: 0.3)) {
            showStatDetail = false
        }
        
        // Clear selected stat after animation
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            selectedStat = nil
        }
    }

    // MARK: - XP Detection

    /// Detect XP changes and create notifications
    private func detectXPChanges(old: [StatData], new: [StatData]) {
        for newStat in new {
            let oldXP = previousStatXP[newStat.type] ?? newStat.xp
            let xpGained = newStat.xp - oldXP

            if xpGained > 0 {
                // Create notification
                let notification = XPNotification(
                    id: UUID(),
                    statType: newStat.type,
                    amount: xpGained,
                    color: newStat.color
                )
                xpNotifications.append(notification)

                // Remove after 3 seconds
                Task {
                    try? await Task.sleep(nanoseconds: 3_000_000_000)
                    xpNotifications.removeAll { $0.id == notification.id }
                }
            }

            // Update previous XP
            previousStatXP[newStat.type] = newStat.xp
        }
    }

    // MARK: - View State Actions

    /// Start a training session
    private func startTrainingSession() {
        // Create a sample training session
        let sessionData = SessionData(
            activity: "Leash Training",
            goal: "5 calm reps",
            tips: "Keep leash loose, reward calm behavior",
            targetReps: 5,
            currentReps: 0,
            currentSuggestion: nil,
            startTime: Date()
        )
        withAnimation(.easeInOut(duration: 0.3)) {
            viewState = .training(sessionData)
        }
    }

    /// Toggle stats view
    private func toggleStatsView() {
        withAnimation(.easeInOut(duration: 0.3)) {
            viewState = viewState.isStats ? .minimal : .stats
        }
    }

    /// Close stats view
    private func closeStatsView() {
        withAnimation(.easeInOut(duration: 0.3)) {
            viewState = .minimal
        }
    }

    /// Return to minimal view
    private func returnToMinimal() {
        withAnimation(.easeInOut(duration: 0.3)) {
            viewState = .minimal
        }
    }

    // MARK: - Voice Command Handling

    /// Handle voice commands from the VoiceCommandHandler
    private func handleVoiceCommand(_ command: VoiceCommand?) {
        guard let command = command else { return }
        
        switch command {
        case .startCoachMode(let activity):
            handleStartCoachMode(activity: activity)
            
        case .markRep:
            handleMarkRep()
            
        case .endSession(let description):
            handleEndSession(description: description)
        }
    }
    
    /// Handle "Coach mode: [activity]" command
    private func handleStartCoachMode(activity: String) {
        // Create a new training session
        // In production, this would fetch tips and goals from the backend
        let sessionData = SessionData(
            activity: activity,
            goal: "5 calm reps",
            tips: "Keep leash loose, reward calm behavior",
            targetReps: 5,
            currentReps: 0,
            currentSuggestion: nil,
            startTime: Date()
        )

        viewState = .training(sessionData)
        print("Started coach mode for activity: \(activity)")
    }
    
    /// Handle "Mark rep" command
    private func handleMarkRep() {
        // Only process if there's an active session
        guard case .training(var sessionData) = viewState else {
            print("Ignoring 'mark rep' - no active session")
            return
        }

        // Debounce: ignore if less than 500ms since last mark
        let now = Date()
        guard now.timeIntervalSince(lastRepMarkTime) >= repMarkDebounceInterval else {
            print("Ignoring 'mark rep' - too soon after last mark")
            return
        }

        // Increment rep counter
        sessionData.markRep()
        lastRepMarkTime = now

        print("Marked rep: \(sessionData.repCounterText)")

        // Optionally add micro-suggestion
        if sessionData.currentReps < sessionData.targetReps {
            sessionData.currentSuggestion = "Great rep! Keep going!"
        } else if sessionData.currentReps == sessionData.targetReps {
            sessionData.currentSuggestion = "Goal reached! 🎉 Keep going for bonus XP!"
        } else {
            sessionData.currentSuggestion = "Amazing! +\(sessionData.currentReps - sessionData.targetReps) bonus reps! 💪"
        }

        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
            viewState = .training(sessionData)
        }
    }
    
    /// Handle "End session: [description]" command
    private func handleEndSession(description: String) {
        // Only process if there's an active session
        guard case .training(let sessionData) = viewState else {
            print("Ignoring 'end session' - no active session")
            return
        }

        print("Ending session with description: \(description)")
        print("Completed \(sessionData.currentReps) reps")

        // Play session end sound at center panel position
        viewModel.playSessionEndSound()

        // Calculate session duration
        let duration = Date().timeIntervalSince(sessionData.startTime)

        // Create summary with sample XP data
        // In production, this would come from the backend
        let summary = SessionSummary(
            activity: sessionData.activity,
            duration: duration,
            repsCompleted: sessionData.currentReps,
            repsTarget: sessionData.targetReps,
            xpGained: [
                SessionSummary.XPGain(statType: "PHY", amount: 25, color: "red"),
                SessionSummary.XPGain(statType: "IMP", amount: 15, color: "purple")
            ],
            startTime: sessionData.startTime
        )

        // Show summary view
        withAnimation(.easeInOut(duration: 0.3)) {
            viewState = .summary(summary)
        }
    }

    /// Handle End Session button press
    private func handleEndSessionButton() {
        // Only process if there's an active session
        guard case .training(let sessionData) = viewState else {
            print("Ignoring 'end session' button - no active session")
            return
        }

        // In production, this would prompt the user to describe the session
        // For now, just end with a default description
        let description = "Completed \(sessionData.currentReps) reps of \(sessionData.activity)"
        handleEndSession(description: description)
    }

    // MARK: - Attachment Positioning

    /// Position all attachments relative to the head anchor
    private func positionAttachments(headAnchor: AnchorEntity, attachments: RealityViewAttachments) {
        // Dog Name/Level/Streak panel - top center (one combined card)
        if let dogInfoAttachment = attachments.entity(for: "dogInfo") {
            let position = positionManager.position(for: .dogInfo)
            dogInfoAttachment.position = position
            dogInfoAttachment.scale = [1.6, 1.6, 1.6] // Slightly smaller for cleaner look
            headAnchor.addChild(dogInfoAttachment)
        }

        // XP Progress Bar - very close below the info card
        if let xpBarAttachment = attachments.entity(for: "xpBar") {
            let position = positionManager.position(for: .xpBar)
            xpBarAttachment.position = position
            xpBarAttachment.scale = [1.6, 1.6, 1.6]
            headAnchor.addChild(xpBarAttachment)
        }

        // Floating buttons - bottom center (no background panel)
        if let buttonsAttachment = attachments.entity(for: "floatingButtons") {
            buttonsAttachment.position = [0, -0.4, -1.2] // Bottom center
            buttonsAttachment.scale = [1.6, 1.6, 1.6]
            headAnchor.addChild(buttonsAttachment)
        }

        // Session Panel - left side (shows during active training)
        // Positioned to the side so you can see your dog clearly!
        if let sessionAttachment = attachments.entity(for: "session") {
            let position = positionManager.position(for: .session)
            sessionAttachment.position = position
            sessionAttachment.scale = [1.2, 1.2, 1.2] // Smaller so it doesn't block view
            headAnchor.addChild(sessionAttachment)
        }

        // Stats Screen - full overlay (shows when stats view is active)
        if let statsScreenAttachment = attachments.entity(for: "statsScreen") {
            statsScreenAttachment.position = [0, 0.0, -1.2] // Center
            statsScreenAttachment.scale = [1.8, 1.8, 1.8]
            headAnchor.addChild(statsScreenAttachment)
        }

        // Session Summary - center (shows after training ends)
        if let summaryAttachment = attachments.entity(for: "summary") {
            summaryAttachment.position = [0, 0.0, -1.2] // Center
            summaryAttachment.scale = [1.7, 1.7, 1.7]
            headAnchor.addChild(summaryAttachment)
        }

        // XP Notifications - float up on right side
        if let xpNotifAttachment = attachments.entity(for: "xpNotifications") {
            xpNotifAttachment.position = [0.9, 0.3, -1.2] // Upper right
            xpNotifAttachment.scale = [1.4, 1.4, 1.4]
            headAnchor.addChild(xpNotifAttachment)
        }
        
        // Stat Detail Modal - center overlay
        if let statDetailAttachment = attachments.entity(for: "statDetail") {
            statDetailAttachment.position = [0, 0.0, -1.0] // Center, slightly closer
            statDetailAttachment.scale = [1.5, 1.5, 1.5]
            headAnchor.addChild(statDetailAttachment)
        }
    }

    // MARK: - Environment Setup

    /// Creates a Skyrim-inspired training hall with warm torchlight
    private func setupEnvironment(content: RealityViewContent) {
        // Stone floor (like Skyrim dungeons/halls)
        let floorMesh = MeshResource.generatePlane(width: 20, depth: 20)
        var floorMaterial = SimpleMaterial()
        floorMaterial.color = .init(tint: UIColor(red: 0.4, green: 0.35, blue: 0.3, alpha: 1.0)) // Stone color
        floorMaterial.roughness = 0.8 // Rough stone texture
        let floor = ModelEntity(mesh: floorMesh, materials: [floorMaterial])
        floor.position = [0, 0, 0]
        content.add(floor)

        // Warm ambient lighting (like torchlight)
        let ambientLight = PointLight()
        ambientLight.light.intensity = 800
        ambientLight.light.color = .init(red: 1.0, green: 0.8, blue: 0.6, alpha: 1.0) // Warm orange glow
        ambientLight.position = [0, 2.5, 0]
        content.add(ambientLight)

        // Torch-like point lights around the room
        let torchPositions: [SIMD3<Float>] = [
            [-3, 2, -3], // Front left
            [3, 2, -3],  // Front right
            [-3, 2, 3],  // Back left
            [3, 2, 3]    // Back right
        ]

        for position in torchPositions {
            let torch = PointLight()
            torch.light.intensity = 600
            torch.light.color = .init(red: 1.0, green: 0.7, blue: 0.4, alpha: 1.0) // Flickering torch color
            torch.light.attenuationRadius = 5.0
            torch.position = position
            content.add(torch)
        }

        // Stone pillars (medieval hall aesthetic)
        let pillarPositions: [SIMD3<Float>] = [
            [-2.5, 0, -2],
            [2.5, 0, -2],
            [-2.5, 0, 2],
            [2.5, 0, 2]
        ]

        for position in pillarPositions {
            let pillarMesh = MeshResource.generateCylinder(height: 3.0, radius: 0.2)
            var pillarMaterial = SimpleMaterial()
            pillarMaterial.color = .init(tint: UIColor(red: 0.3, green: 0.3, blue: 0.3, alpha: 1.0))
            pillarMaterial.roughness = 0.9
            let pillar = ModelEntity(mesh: pillarMesh, materials: [pillarMaterial])
            pillar.position = position
            content.add(pillar)
        }
    }
    
    /// Creates the central circular platform with dog name floating above
    private func setupPedestal(content: RealityViewContent, dogName: String) {
        // Create circular pedestal
        let pedestalMesh = MeshResource.generateCylinder(height: 0.1, radius: 0.5)
        var pedestalMaterial = SimpleMaterial()
        pedestalMaterial.color = .init(tint: .white.withAlphaComponent(0.3))
        let pedestal = ModelEntity(mesh: pedestalMesh, materials: [pedestalMaterial])
        pedestal.position = [0, -0.45, 0]
        content.add(pedestal)
        
        // Create floating text with dog name
        // Note: Text rendering in RealityKit requires TextMesh which is more complex
        // For now, we'll create a placeholder sphere to represent where text will go
        // In production, you'd use ModelEntity with a custom text mesh or TextEntity
        let textPlaceholder = ModelEntity(
            mesh: .generateSphere(radius: 0.05),
            materials: [SimpleMaterial(color: .white, isMetallic: false)]
        )
        textPlaceholder.position = [0, 0.3, 0]
        content.add(textPlaceholder)
        
        // TODO: Replace with actual TextEntity when implementing text rendering
        // Example: let textEntity = TextEntity(text: dogName, font: .systemFont(ofSize: 0.1))
    }
}

// MARK: - XP Notification Model

struct XPNotification: Identifiable, Equatable {
    let id: UUID
    let statType: String
    let amount: Int
    let color: Color
}

// MARK: - Preview

#Preview {
    TrainingRoomView()
}
