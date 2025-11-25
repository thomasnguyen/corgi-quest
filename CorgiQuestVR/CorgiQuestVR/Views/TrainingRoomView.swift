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
    
    // Session state for Coach Mode
    @State private var sessionState: SessionState = .idle

    // Voice command handler - DISABLED for simulator (microphone permissions hang)
    // @StateObject private var voiceCommandHandler = VoiceCommandHandler()

    // Debounce timer for rep marking
    @State private var lastRepMarkTime: Date = .distantPast
    private let repMarkDebounceInterval: TimeInterval = 0.5
    
    var body: some View {
        RealityView { content, attachments in
            setupEnvironment(content: content)
            setupPedestal(content: content, dogName: viewModel.dogName)

            // Create a head anchor - this will follow the user's head
            let headAnchor = AnchorEntity(.head)
            content.add(headAnchor)

            // Position HUD panels relative to head (in head-local space)
            // These will follow as the user looks around

            // Goals panel - top center, 1.5m forward
            if let goalsAttachment = attachments.entity(for: "goals") {
                goalsAttachment.position = [0, 0.35, -1.5] // Slightly above center
                headAnchor.addChild(goalsAttachment)
            }

            // Stats panel - left side
            if let statsAttachment = attachments.entity(for: "stats") {
                statsAttachment.position = [-0.9, -0.1, -1.5] // Left side, slightly down
                headAnchor.addChild(statsAttachment)
            }

            // Activities panel - right side
            if let activitiesAttachment = attachments.entity(for: "activities") {
                activitiesAttachment.position = [0.9, -0.1, -1.5] // Right side, slightly down
                headAnchor.addChild(activitiesAttachment)
            }

            // Weekly chart - bottom center
            if let chartAttachment = attachments.entity(for: "chart") {
                chartAttachment.position = [0, -0.4, -1.5] // Below center
                headAnchor.addChild(chartAttachment)
            }
        } attachments: {
            // Define attachments for each panel
            if let goals = viewModel.goals {
                Attachment(id: "goals") {
                    GoalsPanel(goals: goals)
                        .frame(width: 400)
                }
            }

            Attachment(id: "stats") {
                StatOrbsPanel(stats: viewModel.stats)
                    .frame(width: 250)
            }

            Attachment(id: "activities") {
                ActivitiesPanel(activities: viewModel.activities)
                    .frame(width: 350)
            }

            Attachment(id: "chart") {
                WeeklyChartPanel(weeklyXP: viewModel.weeklyXP)
                    .frame(width: 500)
            }
        }
        .onAppear {
            // Fetch initial data and start polling
            Task {
                await viewModel.fetchInitialData()
                viewModel.startPolling()
            }
        }
        .onDisappear {
            // Stop polling when view disappears
            viewModel.stopPolling()
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
            currentSuggestion: nil
        )
        
        sessionState = .active(sessionData)
        print("Started coach mode for activity: \(activity)")
    }
    
    /// Handle "Mark rep" command
    private func handleMarkRep() {
        // Only process if there's an active session
        guard case .active(var sessionData) = sessionState else {
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
        
        // Update session state
        sessionState = .active(sessionData)
        
        print("Marked rep: \(sessionData.repCounterText)")
        
        // Optionally add micro-suggestion
        if sessionData.currentReps < sessionData.targetReps {
            var updatedData = sessionData
            updatedData.currentSuggestion = "Great rep! Keep going!"
            sessionState = .active(updatedData)
        } else {
            var updatedData = sessionData
            updatedData.currentSuggestion = "Goal reached! 🎉"
            sessionState = .active(updatedData)
        }
    }
    
    /// Handle "End session: [description]" command
    private func handleEndSession(description: String) {
        // Only process if there's an active session
        guard case .active(let sessionData) = sessionState else {
            print("Ignoring 'end session' - no active session")
            return
        }
        
        // Set state to ending
        sessionState = .ending
        
        print("Ending session with description: \(description)")
        print("Completed \(sessionData.currentReps) reps")
        
        // In production, this would:
        // 1. Call NetworkService.submitVoiceLog(text: description)
        // 2. Wait for backend to parse and award XP
        // 3. Refresh the VR dashboard
        // 4. Return to idle state
        
        // For now, simulate a brief delay then return to idle
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            sessionState = .idle
            print("Session ended, returned to idle")
        }
    }
    
    // MARK: - Environment Setup
    
    /// Creates the stylized room with soft neutral lighting
    private func setupEnvironment(content: RealityViewContent) {
        // DEBUG: Add HUGE bright spheres to test visibility
        // Red sphere right in front
        let redSphere = ModelEntity(
            mesh: .generateSphere(radius: 0.5),
            materials: [SimpleMaterial(color: .red, isMetallic: false)]
        )
        redSphere.position = [0, 1.5, -1.5] // Eye level, 1.5m in front
        content.add(redSphere)

        // Blue sphere to the left
        let blueSphere = ModelEntity(
            mesh: .generateSphere(radius: 0.4),
            materials: [SimpleMaterial(color: .blue, isMetallic: false)]
        )
        blueSphere.position = [-1, 1.5, -2] // Left side
        content.add(blueSphere)

        // Green sphere to the right
        let greenSphere = ModelEntity(
            mesh: .generateSphere(radius: 0.4),
            materials: [SimpleMaterial(color: .green, isMetallic: false)]
        )
        greenSphere.position = [1, 1.5, -2] // Right side
        content.add(greenSphere)

        // Yellow cube above
        let yellowCube = ModelEntity(
            mesh: .generateBox(size: 0.4),
            materials: [SimpleMaterial(color: .yellow, isMetallic: false)]
        )
        yellowCube.position = [0, 2.2, -2] // Above
        content.add(yellowCube)

        // Very bright lighting
        let ambientLight = PointLight()
        ambientLight.light.intensity = 10000
        ambientLight.light.color = .white
        ambientLight.position = [0, 2, 0]
        content.add(ambientLight)

        // Create bright white floor plane
        let floorMesh = MeshResource.generatePlane(width: 20, depth: 20)
        var floorMaterial = SimpleMaterial()
        floorMaterial.color = .init(tint: .white.withAlphaComponent(0.5))
        let floor = ModelEntity(mesh: floorMesh, materials: [floorMaterial])
        floor.position = [0, 0, 0]
        content.add(floor)
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

// MARK: - Preview

#Preview {
    TrainingRoomView()
}
