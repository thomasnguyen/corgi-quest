# Implementation Plan - WebXR Charts Demo

## Overview

This implementation creates a **new standalone route** (`/webxr`) that demonstrates proper 3D chart rendering. This is completely separate from the existing `/app.vr` route and won't affect any existing VR functionality.

## Tasks

- [x] 1. Set up new WebXR route
  - [x] 1.1 Create webxr.tsx route file
    - Create new file at `src/routes/webxr.tsx`
    - Implement WebXR feature detection
    - Add "Enter VR" button with styling
    - Set up Canvas and XR wrapper
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 1.2 Add basic 3D scene
    - Add ambient and directional lighting
    - Set up local-floor reference space
    - Position camera appropriately
    - _Requirements: 1.5_

- [x] 2. Create WeeklyChartPanel component
  - [x] 2.1 Create component file structure
    - Create `src/components/webxr/` folder
    - Create `WeeklyChartPanel.tsx` file
    - Set up TypeScript interfaces
    - _Requirements: 2.1_
  
  - [x] 2.2 Implement data preparation logic
    - Create `prepareChartData()` function
    - Generate last 7 days array
    - Format day labels (Mon, Tue, etc.)
    - Handle missing data with zeros
    - _Requirements: 2.2, 2.5, 5.5_
  
  - [x] 2.3 Implement data normalization
    - Calculate maxValue using Math.max
    - Normalize heights: `(value / maxValue) * maxHeight`
    - Apply minimum height of 0.05 units
    - Calculate bar positions: `(index - (count - 1) / 2) * spacing`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 2.4 Render 3D bars
    - Use BoxGeometry with args `[0.08, height, 0.08]`
    - Position bars at `[xPos, height / 2, 0]`
    - Use MeshBasicMaterial with color #D4AF37
    - Space bars 0.12 units apart
    - _Requirements: 2.1, 2.2, 2.3, 7.1, 7.5_
  
  - [x] 2.5 Add text labels
    - Display XP values above bars (fontSize 0.04, color #f5c35f)
    - Display day labels below bars (fontSize 0.05, color #888888)
    - Use proper text anchoring (center/bottom and center/top)
    - Position text with 0.05 unit offset from bars
    - _Requirements: 2.4, 2.5, 7.2_
  
  - [x] 2.6 Add background panel and title
    - Create semi-transparent background plane (#1a1a1a, 50% opacity)
    - Add "Last 7 Days" title (fontSize 0.12, color #f9dca0)
    - Position background at z = -0.02
    - Size panel to fit all bars with padding
    - _Requirements: 7.3, 7.4_

- [x] 3. Implement bar animations
  - [x] 3.1 Create AnimatedBar component
    - Create separate component for animated bars
    - Use @react-spring/three for animations
    - Implement spring config: tension 200, friction 20
    - Animate from height 0 to target height
    - _Requirements: 4.1, 4.2_
  
  - [x] 3.2 Add staggered animations
    - Add delay prop to AnimatedBar
    - Stagger by 50ms per bar (index * 50)
    - Trigger animations on mount
    - _Requirements: 4.3_
  
  - [x] 3.3 Handle data updates
    - Listen for weeklyXP changes
    - Smoothly transition bar heights
    - Maintain 60fps during transitions
    - _Requirements: 4.4, 4.5_

- [x] 4. Integrate Convex data
  - [x] 4.1 Add data fetching to route
    - Import useActiveDog hook
    - Import useQuery from convex/react
    - Fetch last 7 days using api.queries.getDailyXP
    - Pass startDate and endDate parameters
    - _Requirements: 5.1_
  
  - [x] 4.2 Handle loading and empty states
    - Show loading indicator when data is undefined
    - Show "No dog selected" message when dogId is null
    - Handle empty weeklyXP array
    - _Requirements: 5.2, 5.3_
  
  - [x] 4.3 Set up real-time updates
    - Verify useQuery subscription works
    - Test data updates within 3 seconds
    - Verify animations trigger on data change
    - _Requirements: 5.4_

- [x] 5. Create 2D fallback
  - [x] 5.1 Create FallbackChart2D component
    - Create component in webxr folder
    - Use div-based bar chart
    - Match VR chart styling
    - Use same data preparation logic
    - _Requirements: 6.1, 6.2_
  
  - [x] 5.2 Add fallback routing logic
    - Check WebXR support on mount
    - Render fallback when xrSupported === false
    - Show appropriate message
    - _Requirements: 6.3, 6.5_

- [x] 6. Add documentation and comments
  - [x] 6.1 Document normalization formulas
    - Add comments explaining `(value / maxValue) * maxHeight`
    - Document minimum height logic
    - Explain positioning calculations
    - _Requirements: 9.1, 9.2_
  
  - [x] 6.2 Add requirement references
    - Tag each section with requirement numbers
    - Add comments for key design decisions
    - Document performance optimizations
    - _Requirements: 9.3, 9.5_
  
  - [x] 6.3 Add examples in comments
    - Show correct vs incorrect approaches
    - Explain common mistakes
    - Reference CHART_RENDERING_GUIDE.md
    - _Requirements: 9.4_

- [x] 7. Test and optimize
  - [x] 7.1 Test with various data scenarios
    - Test with all zeros
    - Test with one high value
    - Test with gradual increase
    - Test with missing data
    - Test with real Convex data
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x] 7.2 Verify visual quality
    - Check bar proportions
    - Verify text readability
    - Confirm even spacing
    - Test chart centering
    - Verify color accuracy
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 7.3 Performance testing
    - Verify 60+ fps in VR
    - Count total triangles (< 1000)
    - Check for memory leaks
    - Test animation smoothness
    - _Requirements: 4.5, 10.1, 10.2, 10.3, 10.5_
  
  - [x] 7.4 Test on Vision Pro
    - Load /webxr route in Safari
    - Enter VR mode
    - Verify text is readable
    - Check performance
    - Test with real training data
    - _Requirements: 8.5_
  
  - [x] 7.5 Add cleanup logic
    - Dispose geometries on unmount
    - Dispose materials on unmount
    - Clear animation timers
    - _Requirements: 10.4_

## Notes

- This route is **completely independent** from `/app.vr`
- No existing VR functionality will be affected
- Can be tested without entering the main VR training HUD
- Uses same Convex data source as main app
- Can be removed or modified without breaking anything

## Testing Checklist

After implementation, verify:

- [ ] Route loads at `/webxr`
- [ ] "Enter VR" button works
- [ ] Chart displays in VR with correct proportions
- [ ] Bars animate smoothly on load
- [ ] Text is readable (not too small/large)
- [ ] Colors match Corgi Quest theme
- [ ] Real-time data updates work
- [ ] 2D fallback works on non-VR devices
- [ ] Performance is 60+ fps
- [ ] No console errors or warnings
