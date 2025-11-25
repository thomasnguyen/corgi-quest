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
                goalsAttachment.position = [0, 0.4, -1.2] // Slightly above center, closer
                goalsAttachment.scale = [1.5, 1.5, 1.5] // Make 50% larger
                headAnchor.addChild(goalsAttachment)
            }

            // Stats panel - left side
            if let statsAttachment = attachments.entity(for: "stats") {
                statsAttachment.position = [-0.75, -0.05, -1.2] // Left side, closer
                statsAttachment.scale = [1.5, 1.5, 1.5] // Make 50% larger
                headAnchor.addChild(statsAttachment)
            }

            // Activities panel - right side
            if let activitiesAttachment = attachments.entity(for: "activities") {
                activitiesAttachment.position = [0.75, -0.05, -1.2] // Right side, closer
                activitiesAttachment.scale = [1.5, 1.5, 1.5] // Make 50% larger
                headAnchor.addChild(activitiesAttachment)
            }

            // Weekly chart - bottom center
            if let chartAttachment = attachments.entity(for: "chart") {
                chartAttachment.position = [0, -0.35, -1.2] // Below center, closer
                chartAttachment.scale = [1.5, 1.5, 1.5] // Make 50% larger
                headAnchor.addChild(chartAttachment)
            }

            // Dog Name/Level panel - top center (like Skyrim compass bar)
            if let dogInfoAttachment = attachments.entity(for: "dogInfo") {
                dogInfoAttachment.position = [0, 0.5, -1.2] // Top center
                dogInfoAttachment.scale = [1.8, 1.8, 1.8] // Larger for prominence
                headAnchor.addChild(dogInfoAttachment)
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

            Attachment(id: "dogInfo") {
                DogInfoPanel(dogName: viewModel.dogName, level: viewModel.dogLevel)
                    .frame(width: 450)
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

// MARK: - Preview

#Preview {
    TrainingRoomView()
}
