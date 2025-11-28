# Implementation Plan

- [ ] 1. Add animation state variables to StatsScreenView
  - Add `@State private var animatedProgress: [String: CGFloat] = [:]` dictionary
  - Add `@State private var glowScale: [String: CGFloat] = [:]` dictionary
  - Add animation timing constants: `baseDelay`, `staggerInterval`, `fillDuration`
  - _Requirements: 3.1_

- [ ] 2. Implement staggered fill animation on appear
  - Initialize all stat progress values to 0 in `.onAppear`
  - Loop through stats with enumerated index to calculate staggered delays
  - Use `withAnimation(.easeOut(duration:).delay())` to animate each stat's progress
  - _Requirements: 1.1, 1.2, 1.3, 3.2_

- [ ] 3. Update stat circle rendering to use animated values
  - Replace `stat.xpProgress` with `animatedProgress[stat.type] ?? 0` in Circle trim
  - Add `scaleEffect(glowScale[stat.type] ?? 1.0)` modifier
  - Add dynamic shadow radius based on glowScale value
  - _Requirements: 1.1_

- [ ] 4. Implement glow pulse effect on fill completion
  - Use `DispatchQueue.main.asyncAfter` to trigger glow after fill duration + delay
  - Animate scale to 1.05x with spring animation
  - Animate scale back to 1.0x after brief delay (0.15s)
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 5. Ensure animation replay on screen reopen
  - Reset `animatedProgress` dictionary to all zeros in `.onAppear`
  - Reset `glowScale` dictionary to all 1.0 values in `.onAppear`
  - _Requirements: 1.4_

- [ ] 6. Manual demo testing
  - Test in Xcode simulator: verify staggered fill animations
  - Verify glow pulse effect triggers after each circle fills
  - Test close/reopen behavior to confirm animations replay
  - Run full demo flow to validate timing feels good (~2-3 seconds total)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.2_
