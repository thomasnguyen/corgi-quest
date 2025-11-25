//
//  CorgiQuestVRApp.swift
//  CorgiQuestVR
//
//  Created by Thomas Nguyen on 11/24/25.
//

import SwiftUI

@main
struct CorgiQuestVRApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }

        ImmersiveSpace(id: "TrainingRoom") {
            TrainingRoomView()
        }
        .immersionStyle(selection: .constant(.full), in: .full)
    }
}
