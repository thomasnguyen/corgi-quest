# ViewModels

This directory contains ViewModels for the CorgiQuestVR app.

## TrainingRoomViewModel

The `TrainingRoomViewModel` manages state and data fetching for the TrainingRoomView.

### Features

- **Data Fetching**: Fetches dog status from the backend API
- **Real-time Updates**: Polls for updates every 3 seconds
- **Voice Activity Logging**: Submits voice transcripts and refreshes data
- **Error Handling**: Gracefully handles network errors with retry logic
- **Connection Status**: Tracks online/offline state

### Published Properties

- `stats: [StatData]` - Four stat orbs (PHY, INT, IMP, SOC)
- `goals: GoalData?` - Today's physical/mental goals and streak
- `activities: [ActivityData]` - Recent 5 activities
- `weeklyXP: [DayXP]` - 7-day XP totals
- `dogName: String` - Dog's name
- `dogLevel: Int` - Overall level
- `isConnected: Bool` - Connection status
- `errorMessage: String?` - Error message for display

### Key Methods

- `fetchInitialData()` - Fetches data from the API
- `updateUI(with:)` - Transforms API response to UI models
- `logVoiceActivity(text:sessionContext:)` - Logs voice activity and refreshes
- `startPolling()` - Starts 3-second polling timer
- `stopPolling()` - Stops polling and cleans up

### Usage

```swift
@StateObject private var viewModel = TrainingRoomViewModel()

// In onAppear
viewModel.startPolling()

// In onDisappear
viewModel.stopPolling()

// Log voice activity
Task {
    try await viewModel.logVoiceActivity(text: "Five calm reps")
}
```

### Requirements Validated

- **7.1**: Fetches and transforms API data
- **7.2**: Polls every 3 seconds with weak self
- **6.1, 6.2**: Logs voice activities and refreshes data
