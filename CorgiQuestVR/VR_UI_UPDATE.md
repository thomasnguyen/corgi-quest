# VR UI Update - Web App Style Match

## Changes Made

### Background Color Update
- Changed all panel backgrounds from `Color.black.opacity(0.85)` to `Color(red: 0.071, green: 0.071, blue: 0.086)` (#121216)
- This matches the web app's dark brown/charcoal background color
- Updated in:
  - StatOrbsPanel
  - GoalsPanel
  - ActivitiesPanel
  - WeeklyChartPanel
  - QuickActionsPanel
  - XPNotificationsView
  - StatDetailModal
  - SessionPanel

### Border Color Update
- Changed panel borders from `Color.white.opacity(0.15)` to `Color(red: 0.961, green: 0.769, blue: 0.373).opacity(0.2)` (#f5c35f)
- This adds a subtle golden accent matching the web app's color scheme

### Shadow Removal
- Removed ALL `.shadow()` modifiers from panels and UI elements
- Disabled shadows by default in `ShadowRenderer.swift`:
  - `shadowsEnabled: Bool = false`
  - `isEnabled: Bool = false`
- Removed shadows from:
  - Panel backgrounds
  - Text elements
  - Progress bars
  - Stat orbs
  - XP notifications
  - Fire emoji decorations
  - Hover effects (PanelHoverModifier)

## Visual Result
The VR app now has a cleaner, flatter aesthetic that matches the web app's minimalist design with:
- Dark brown/charcoal backgrounds (#121216)
- Golden accent borders (#f5c35f)
- No drop shadows or glows
- Consistent color palette across platforms
