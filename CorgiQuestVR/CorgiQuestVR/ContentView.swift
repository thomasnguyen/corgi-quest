//
//  ContentView.swift
//  CorgiQuestVR
//
//  Created by Thomas Nguyen on 11/24/25.
//

import SwiftUI
import RealityKit
import RealityKitContent

struct ContentView: View {
    @Environment(\.openImmersiveSpace) var openImmersiveSpace
    @Environment(\.dismissImmersiveSpace) var dismissImmersiveSpace
    @State private var isImmersiveSpaceShown = false

    var body: some View {
        VStack(spacing: 20) {
            Text("🐕 Corgi Quest VR")
                .font(.largeTitle)
                .fontWeight(.bold)

            Text("Immersive Dog Training")
                .font(.title3)
                .foregroundColor(.secondary)

            Button {
                Task {
                    if isImmersiveSpaceShown {
                        await dismissImmersiveSpace()
                        isImmersiveSpaceShown = false
                    } else {
                        await openImmersiveSpace(id: "TrainingRoom")
                        isImmersiveSpaceShown = true
                    }
                }
            } label: {
                Text(isImmersiveSpaceShown ? "Exit Training Room" : "Enter Training Room")
                    .font(.title2)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 30)
                    .padding(.vertical, 15)
                    .background(isImmersiveSpaceShown ? Color.red : Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
            .buttonStyle(.plain)
        }
        .padding()
        .opacity(isImmersiveSpaceShown ? 0 : 1) // Hide window when in immersive space
        .task {
            // Auto-launch immersive space on startup
            if !isImmersiveSpaceShown {
                await openImmersiveSpace(id: "TrainingRoom")
                isImmersiveSpaceShown = true
            }
        }
    }
}

#Preview(windowStyle: .automatic) {
    ContentView()
}
