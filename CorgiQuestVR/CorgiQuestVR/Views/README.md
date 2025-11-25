# VR Training Room Views

This directory contains the SwiftUI views for the immersive VR training room experience.

## Main Views

### TrainingRoomView
The root view that combines the 3D RealityKit environment with floating UI panels.

**Features:**
- RealityView container with 3D environment
- Soft neutral lighting (ambient + directional)
- Floor plane with subtle grid
- Central circular pedestal
- Floating text placeholder for dog name (TODO: implement TextEntity)
- Overlays FloatingPanelsView for UI

**Requirements Validated:**
- 1.1: Displays stylized room with soft neutral lighting
- 1.2: Shows dog's name above central pedestal
- 1.3: Applies subtle parallax effects through RealityKit

### FloatingPanelsView
Arranges four data panels around the central pedestal in 3D space using `.position3D()`.

**Panel Layout:**
- **Left (-400, 0, -600)**: StatOrbsPanel - Four stat orbs (PHY, INT, IMP, SOC)
- **Top (0, 300, -600)**: GoalsPanel - Physical/Mental progress + Streak
- **Right (400, 0, -600)**: ActivitiesPanel - Last 5 training activities
- **Bottom (0, -300, -600)**: WeeklyChartPanel - 7-day XP bar chart
- **Center (0, 0, -500)**: SessionPanel - Active training session (conditional)

**Requirements Validated:**
- 2.1: Displays four distinct floating panels arranged around pedestal

## Panel Components

### StatOrbsPanel & StatOrbView
Displays four stat orbs with circular progress rings.

**Features:**
- Circular progress ring showing XP toward next level
- Stat type label (PHY, INT, IMP, SOC)
- Current level display
- Color-coded by stat type
- Ready for pulse animation on XP increase (to be implemented in task 8.2)

### GoalsPanel
Shows today's physical and mental training goals.

**Features:**
- Physical goal progress bar (red)
- Mental goal progress bar (blue)
- Current streak with fire emoji
- Progress percentages calculated from GoalData model

### ActivitiesPanel
Displays the last 3-5 training activities.

**Features:**
- Activity name
- XP breakdown per stat
- Relative timestamp (e.g., "5m ago")
- Who logged the activity
- Dividers between activities

### WeeklyChartPanel
Shows a 7-day XP bar chart.

**Features:**
- Horizontal bar chart
- One bar per day
- Day labels (Mon-Sun)
- Simple visual representation of XP trends

### SessionPanel
Displays active training session information (only visible during Coach Mode).

**Features:**
- Session title
- Activity name
- Goal description
- Training tips
- Rep counter in "X / Y" format
- Optional micro-suggestion with fade transition
- Green color when goal is complete

## Data Models Used

All views use the data models defined in `Models/`:
- `StatData` - Stat orb data with XP progress
- `GoalData` - Today's goals and streak
- `ActivityData` - Recent training activities
- `DayXP` - Daily XP totals for chart
- `SessionState` & `SessionData` - Training session state

## Next Steps

These views are currently using sample data for preview. The next tasks will:

1. Connect to TrainingRoomViewModel for real data (Task 7)
2. Implement XP pulse animations (Task 8.2)
3. Add goal progress bar animations (Task 8.3)
4. Add activity feed fade-in animations (Task 8.4)
5. Integrate voice command system (Task 6)

## Usage

To use these views in the app:

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        TrainingRoomView()
    }
}
```

The TrainingRoomView will automatically set up the 3D environment and display all floating panels.
