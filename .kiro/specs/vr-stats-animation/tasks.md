# Implementation Plan

- [x] 1. Add animation state variables to StatsScreenView
  - Add `@State private var animatedProgress: [String: CGFloat] = [:]` dictionary
  - Add `@State private var glowScale: [String: CGFloat] = [:]` dictionary
  - Add animation timing constants: `baseDelay`, `staggerInterval`, `fillDuration`
  - _Requirements: 3.1_

- [x] 2. Implement staggered fill animation on appear
  - Initialize all stat progress values to 0 in `.onAppear`
  - Loop through stats with enumerated index to calculate staggered delays
  - Use `withAnimation(.easeOut(duration:).delay())` to animate each stat's progress
  - _Requirements: 1.1, 1.2, 1.3, 3.2_

- [x] 3. Update stat circle rendering to use animated values
  - Replace `stat.xpProgress` with `animatedProgress[stat.type] ?? 0` in Circle trim
  - Add `scaleEffect(glowScale[stat.type] ?? 1.0)` modifier
  - Add dynamic shadow radius based on glowScale value
  - _Requirements: 1.1_

- [x] 4. Implement glow pulse effect on fill completion
  - Use `DispatchQueue.main.asyncAfter` to trigger glow after fill duration + delay
  - Animate scale to 1.05x with spring animation
  - Animate scale back to 1.0x after brief delay (0.15s)
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 5. Ensure animation replay on screen reopen
  - Reset `animatedProgress` dictionary to all zeros in `.onAppear`
  - Reset `glowScale` dictionary to all 1.0 values in `.onAppear`
  - _Requirements: 1.4_

- [x] 6. Improve background opacity for better readability
  - Replace `.ultraThinMaterial` with `Color.black.opacity(0.85)` on all panels
  - Add subtle white border (0.15 opacity) for depth definition
  - Increase shadow intensity (0.7 opacity, 20pt radius, 10pt offset)
  - Update text colors to white for better contrast

- [x] 7. Add animated progress bars to Goals panel
  - Add `@State` variables for animated physical/mental progress
  - Animate from 0 to current value on appear with staggered delays
  - Use gradient fills (red→orange, blue→cyan) with Capsule shape
  - Add shimmer overlay effect for incomplete bars
  - Add colored shadows matching bar colors

- [x] 8. Add streak pulse animation
  - Implement continuous scale animation (1.0 to 1.1)
  - Use `.repeatForever(autoreverses: true)` with 1.5s duration
  - Add gradient border (orange→yellow) to streak badge
  - Increase shadow for glow effect

- [x] 9. Implement 3D depth effects on floating panels
  - Add `rotation3DEffect` to all panels for spatial depth
  - Left/right panels rotate on Y-axis (±15°)
  - Top/bottom panels rotate on X-axis (±10°)
  - Animate to 0° rotation on appear with spring
  - Stagger panel appearance (0.1s, 0.2s, 0.3s, 0.4s delays)

- [x] 10. Add gentle floating animation for depth perception
  - Implement continuous vertical offset animation (0 to 8pt)
  - 3 second duration with `.repeatForever(autoreverses: true)`
  - Different multipliers per panel (1.0, 0.8, 1.2, 0.6) for parallax
  - Use `.easeInOut` curve for smooth motion

- [x] 11. Enhance weekly chart with gradients and animations
  - Replace solid color with blue→cyan gradient (bottom to top)
  - Animate bars from 0 to full height on appear (1.0s, 0.3s delay)
  - Re-animate with spring when data changes
  - Add chart icon to header (chart.bar.fill)

- [x] 12. Manual demo testing
  - Test in Xcode simulator: verify all animations work together
  - Verify readability improvements with darker backgrounds
  - Test 3D depth effects and floating animations
  - Verify goals panel animations and streak pulse
  - Test close/reopen behavior to confirm animations replay
  - Run full demo flow to validate timing and visual polish
