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
    // Sample data for preview - will be replaced with ViewModel
    @State private var dogName: String = "Bumi"
    @State private var sessionState: SessionState = .idle
    
    var body: some View {
        ZStack {
            // 3D Environment
            RealityView { content in
                setupEnvironment(content: content)
                setupPedestal(content: content, dogName: dogName)
            }
            
            // Floating UI Panels overlay
            FloatingPanelsView(
                dogName: dogName,
                sessionState: $sessionState
            )
        }
    }
    
    // MARK: - Environment Setup
    
    /// Creates the stylized room with soft neutral lighting
    private func setupEnvironment(content: RealityViewContent) {
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
