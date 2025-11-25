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
        ZStack {
            // 3D Environment
            RealityView { content in
                setupEnvironment(content: content)
                setupPedestal(content: content, dogName: viewModel.dogName)
            }
            
            // Floating UI Panels overlay
            FloatingPanelsView(
                dogName: viewModel.dogName,
                stats: viewModel.stats,
                goals: viewModel.goals,
                activities: viewModel.activities,
                weeklyXP: viewModel.weeklyXP,
                sessionState: $sessionState
            )

            // Voice recognition indicator - DISABLED
            // if voiceCommandHandler.isListening {
            //     VStack {
            //         Spacer()
            //         HStack {
            //             Image(systemName: "mic.fill")
            //                 .foregroundColor(.red)
            //             Text("Listening...")
            //                 .font(.caption)
            //         }
            //         .padding()
            //         .background(.ultraThinMaterial)
            //         .cornerRadius(8)
            //         .padding(.bottom, 50)
            //     }
            // }
            //
            // // Error message display
            // if let errorMessage = voiceCommandHandler.errorMessage {
            //     VStack {
            //         Text(errorMessage)
            //             .font(.caption)
            //             .foregroundColor(.red)
            //             .padding()
            //             .background(.ultraThinMaterial)
            //             .cornerRadius(8)
            //         Spacer()
            //     }
            //     .padding(.top, 50)
            // }
        }
        .onAppear {
            // Voice commands DISABLED for simulator
            // voiceCommandHandler.requestAuthorization()
            // voiceCommandHandler.startListening()

            // Fetch initial data and start polling
            Task {
                await viewModel.fetchInitialData()
                viewModel.startPolling()
            }
        }
        .onDisappear {
            // Voice commands DISABLED
            // voiceCommandHandler.stopListening()

            // Stop polling when view disappears
            viewModel.stopPolling()
        }
        // Voice commands DISABLED
        // .onChange(of: voiceCommandHandler.lastCommand) { oldValue, newValue in
        //     handleVoiceCommand(newValue)
        // }
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
        // DEBUG: Add a big red sphere right in front to test visibility
        let debugSphere = ModelEntity(
            mesh: .generateSphere(radius: 0.3),
            materials: [SimpleMaterial(color: .red, isMetallic: false)]
        )
        debugSphere.position = [0, 1.5, -2] // Eye level, 2m in front
        content.add(debugSphere)

        // Create ambient lighting for soft, neutral illumination
        let ambientLight = PointLight()
        ambientLight.light.intensity = 500
        ambientLight.light.color = .white
        ambientLight.position = [0, 2, 0]
        content.add(ambientLight)

        // Add directional light for depth
        let directionalLight = DirectionalLight()
        directionalLight.light.intensity = 300
        directionalLight.light.color = .white
        directionalLight.look(at: [0, 0, 0], from: [2, 3, 2], relativeTo: nil)
        content.add(directionalLight)

        // Create floor plane with subtle grid
        let floorMesh = MeshResource.generatePlane(width: 10, depth: 10)
        var floorMaterial = SimpleMaterial()
        floorMaterial.color = .init(tint: .gray.withAlphaComponent(0.1))
        let floor = ModelEntity(mesh: floorMesh, materials: [floorMaterial])
        floor.position = [0, -0.5, 0]
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
