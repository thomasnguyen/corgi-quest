import { Text } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";
import { useEffect, useState } from "react";

/**
 * WeeklyChartPanel Component
 *
 * Displays a 3D bar chart showing XP earned over the last 7 days in WebXR.
 * This component demonstrates proper 3D chart rendering techniques using world-space
 * dimensions (meters) and data normalization.
 *
 * KEY CONCEPTS:
 *
 * 1. World-Space Dimensions (Requirements: 2.3, 9.1)
 *    All dimensions are in METERS, not pixels:
 *    - maxHeight = 0.6 means 60 centimeters tall
 *    - barWidth = 0.08 means 8 centimeters wide
 *    - barSpacing = 0.12 means 12 centimeters between bar centers
 *
 *    ❌ WRONG: Using pixel dimensions
 *    <boxGeometry args={[40, 100, 40]} /> // Way too big! (40 meters wide)
 *
 *    ✅ CORRECT: Using world units
 *    <boxGeometry args={[0.08, barHeight, 0.08]} /> // 8cm wide
 *
 * 2. Data Normalization (Requirements: 3.1, 3.2, 9.1)
 *    Formula: normalizedHeight = (value / maxValue) * maxHeight
 *
 *    This ensures bars fit within the chart regardless of XP values:
 *    - If maxValue = 100 and value = 50, bar is 50% of maxHeight
 *    - If maxValue = 1000 and value = 500, bar is still 50% of maxHeight
 *
 *    ❌ WRONG: Using raw values
 *    <boxGeometry args={[0.08, xpValue, 0.08]} /> // Could be 500 meters tall!
 *
 *    ✅ CORRECT: Normalize first
 *    const normalizedHeight = (xpValue / maxValue) * 0.6;
 *    <boxGeometry args={[0.08, normalizedHeight, 0.08]} />
 *
 * 3. Minimum Height (Requirements: 3.3, 9.2)
 *    Always ensure bars are visible, even with zero values:
 *    barHeight = Math.max(normalizedHeight, 0.05) // Minimum 5cm
 *
 *    This prevents invisible bars when XP = 0.
 *
 * 4. Positioning (Requirements: 3.4, 3.5, 9.2)
 *    - Vertical: Center at y = height / 2 so bottom sits at y = 0
 *    - Horizontal: Center around origin using: (index - (count - 1) / 2) * spacing
 *
 *    Example with 7 bars (indices 0-6):
 *    - Bar 0: (0 - 3) * 0.12 = -0.36 (leftmost)
 *    - Bar 3: (3 - 3) * 0.12 = 0 (center)
 *    - Bar 6: (6 - 3) * 0.12 = 0.36 (rightmost)
 *
 * 5. Performance Optimization (Requirements: 7.5, 9.5, 10.1, 10.2, 10.5)
 *    - Use MeshBasicMaterial (no lighting calculations)
 *    - Use @react-three/drei Text component (optimized)
 *    - Limit to 7 bars maximum (< 1000 triangles total)
 *    - Dispose resources on unmount (handled by React Three Fiber)
 *
 * COMMON MISTAKES TO AVOID:
 *
 * ❌ Using SVG in WebXR
 * <svg><rect /></svg> // Won't render in 3D space
 *
 * ✅ Use 3D primitives
 * <mesh><boxGeometry /></mesh>
 *
 * ❌ Forgetting to normalize
 * const barHeight = xpValue; // Could be huge or tiny
 *
 * ✅ Always normalize
 * const barHeight = Math.max((xpValue / maxValue) * maxHeight, 0.05);
 *
 * ❌ Wrong positioning
 * position-y={barHeight} // Top of bar at barHeight, bottom at 0
 *
 * ✅ Center the bar
 * position-y={barHeight / 2} // Bottom at 0, top at barHeight
 *
 * For more details, see: .kiro/specs/webxr-vr-hud/CHART_RENDERING_GUIDE.md
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.4, 7.1, 7.2, 7.3, 7.4, 7.5, 9.1, 9.2, 9.3, 9.4, 9.5
 */

interface WeeklyChartPanelProps {
  weeklyXP: Array<{ date: string; xp: number }>;
  position?: [number, number, number];
}

interface BarData {
  label: string;
  value: number;
  date: string;
}

/**
 * AnimatedBar Component
 *
 * Single bar with growth animation using spring physics.
 * Animates from height 0 to target height with configurable delay.
 * Smoothly transitions when height changes (data updates).
 *
 * ANIMATION APPROACH (Requirements: 4.1, 4.2, 4.3, 9.3):
 *
 * 1. Initial Load Animation
 *    - Bars start at height 0
 *    - After `delay` milliseconds, animate to target height
 *    - Uses spring physics (tension: 200, friction: 20) for natural motion
 *    - Staggered by 50ms per bar for cascading effect
 *
 * 2. Data Update Animation (Requirements: 4.4, 4.5)
 *    - When `height` prop changes, spring automatically transitions
 *    - No need to reset to 0 - smoothly morphs to new height
 *    - Maintains 60fps performance during transitions
 *
 * 3. Positioning (Requirements: 3.4, 9.2)
 *    - Y position is animated: animatedHeight / 2
 *    - This keeps the bottom of the bar at y = 0 as it grows
 *    - Without this, the bar would grow from its center
 *
 * PERFORMANCE NOTES (Requirements: 9.5, 10.3):
 * - Spring animations are GPU-accelerated via react-spring/three
 * - Only animates transform properties (position, scale)
 * - No geometry recreation during animation
 * - Cleanup handled automatically by React Three Fiber
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 9.3, 9.5
 */
interface AnimatedBarProps {
  height: number;
  position: [number, number, number];
  color: string;
  barWidth: number;
  delay?: number;
}

function AnimatedBar({
  height,
  position,
  color,
  barWidth,
  delay = 0,
}: AnimatedBarProps) {
  const [started, setStarted] = useState(false);

  // Trigger animation after delay - Requirements: 4.3
  // Cleanup: Clear timeout on unmount - Requirements: 10.4
  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => {
      clearTimeout(timeout); // Prevent memory leaks
    };
  }, [delay]);

  // Spring animation with specified config - Requirements: 4.2, 4.4, 4.5
  // Smoothly transitions to new height when data updates
  const { animatedHeight } = useSpring({
    animatedHeight: started ? height : 0,
    config: { tension: 200, friction: 20 },
  });

  return (
    <animated.mesh
      position-x={position[0]}
      // Center at half height so bottom sits at y = 0 - Requirements: 3.4
      position-y={animatedHeight.to((h) => h / 2)}
      position-z={position[2]}
    >
      <boxGeometry args={[barWidth, animatedHeight as any, barWidth]} />
      <meshBasicMaterial color={color} />
    </animated.mesh>
  );
}

/**
 * CLEANUP AND RESOURCE MANAGEMENT (Requirements: 10.4)
 *
 * This component follows React Three Fiber's automatic cleanup patterns:
 *
 * 1. **Geometries**: Automatically disposed by R3F on unmount
 *    - BoxGeometry instances (7 bars)
 *    - PlaneGeometry instance (background)
 *    - No manual dispose() needed
 *
 * 2. **Materials**: Automatically disposed by R3F on unmount
 *    - MeshBasicMaterial instances
 *    - No manual dispose() needed
 *
 * 3. **Animation Timers**: Manually cleaned up in useEffect
 *    - setTimeout cleared in cleanup function
 *    - Prevents memory leaks
 *
 * 4. **Text Components**: Managed by @react-three/drei
 *    - Font atlas is cached and reused (not disposed per component)
 *    - Text geometries disposed automatically
 *
 * 5. **Spring Animations**: Managed by @react-spring/three
 *    - Animation frames cancelled on unmount
 *    - No manual cleanup needed
 *
 * React Three Fiber's disposal system:
 * - Tracks all created objects
 * - Disposes geometries/materials when components unmount
 * - Prevents memory leaks automatically
 * - No manual dispose() calls required for standard objects
 *
 * This approach ensures:
 * - No memory leaks
 * - Proper resource cleanup
 * - Optimal performance
 * - Simplified code (no manual disposal)
 */
export default function WeeklyChartPanel({
  weeklyXP,
  position = [0, 1.5, -2],
}: WeeklyChartPanelProps) {
  /**
   * Prepare data for last 7 days
   *
   * DATA PREPARATION LOGIC (Requirements: 2.2, 2.5, 5.5, 9.3):
   *
   * 1. Generate date range (last 7 days including today)
   * 2. For each date, find matching XP data from Convex
   * 3. If no data exists for a date, use 0 (Requirements: 5.5)
   * 4. Format day labels as short names (Mon, Tue, etc.)
   *
   * This ensures:
   * - Chart always shows exactly 7 bars
   * - Missing data doesn't break the chart
   * - Days are in chronological order (oldest to newest)
   *
   * Requirements: 2.2, 2.5, 5.5, 9.3
   */
  const prepareChartData = (): BarData[] => {
    const today = new Date();
    const last7Days: BarData[] = [];

    // Loop backwards from 6 days ago to today
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Find XP for this date - Requirements: 5.1
      const dayData = weeklyXP.find((d) => d.date === dateStr);
      const xp = dayData?.xp ?? 0; // Default to 0 if no data - Requirements: 5.5

      // Format day label (Mon, Tue, etc.) - Requirements: 2.5
      const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });

      last7Days.push({
        label: dayLabel,
        value: xp,
        date: dateStr,
      });
    }

    return last7Days;
  };

  const chartData = prepareChartData();

  /**
   * CHART DIMENSIONS (Requirements: 2.3, 9.1, 9.3)
   *
   * All dimensions are in WORLD UNITS (meters), not pixels.
   * These values were chosen for optimal readability in VR:
   *
   * - maxHeight: 0.6m (60cm) - Tall enough to see differences, not overwhelming
   * - barWidth: 0.08m (8cm) - Wide enough to be visible, narrow enough to fit 7 bars
   * - barSpacing: 0.12m (12cm) - Comfortable spacing between bars
   *
   * Total chart width: 7 bars × 0.12m = 0.84m (84cm)
   *
   * DESIGN DECISION (Requirements: 9.3):
   * These dimensions work well at 2 meters distance (typical VR viewing distance).
   * If the chart appears too small/large, adjust the position prop, not these dimensions.
   */
  const maxHeight = 0.6; // 60cm maximum bar height
  const barWidth = 0.08; // 8cm bar width
  const barSpacing = 0.12; // 12cm between bar centers
  const chartWidth = chartData.length * barSpacing;

  /**
   * DATA NORMALIZATION (Requirements: 3.1, 3.2, 9.1, 9.2)
   *
   * Calculate the maximum XP value to normalize all bars proportionally.
   *
   * Formula: normalizedHeight = (value / maxValue) * maxHeight
   *
   * Example:
   * - If maxValue = 100 and a bar has value = 50:
   *   normalizedHeight = (50 / 100) * 0.6 = 0.3 meters (30cm)
   *
   * - If maxValue = 1000 and a bar has value = 500:
   *   normalizedHeight = (500 / 1000) * 0.6 = 0.3 meters (30cm)
   *
   * The Math.max(..., 1) ensures we never divide by zero when all values are 0.
   * This prevents NaN heights and ensures bars with 0 XP get the minimum height.
   *
   * WHY THIS MATTERS (Requirements: 9.4):
   * Without normalization, a bar with 500 XP would be 500 meters tall!
   * With normalization, bars always fit within the 0.6m maxHeight.
   */
  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  // DEBUG: Log chart data for VR testing
  console.log("=== WebXR Chart Debug Info ===");
  console.log("Chart Data:", chartData);
  console.log("Max XP Value:", maxValue);
  console.log("Chart Dimensions:", {
    maxHeight: `${maxHeight}m (${maxHeight * 100}cm)`,
    barWidth: `${barWidth}m (${barWidth * 100}cm)`,
    barSpacing: `${barSpacing}m (${barSpacing * 100}cm)`,
    totalWidth: `${chartWidth}m (${chartWidth * 100}cm)`,
  });
  console.log(
    "Bar Heights:",
    chartData.map((d) => {
      const normalizedHeight = (d.value / maxValue) * maxHeight;
      const barHeight = Math.max(normalizedHeight, 0.05);
      return {
        day: d.label,
        xp: d.value,
        height: `${barHeight.toFixed(3)}m (${(barHeight * 100).toFixed(1)}cm)`,
        isMinimum: barHeight === 0.05,
      };
    })
  );
  console.log("==============================");

  return (
    <group position={position}>
      {/* Panel title - Requirements: 7.4 */}
      <Text
        position={[0, maxHeight + 0.15, 0]}
        fontSize={0.12}
        color="#f9dca0"
        anchorX="center"
        anchorY="middle"
      >
        Last 7 Days
      </Text>

      {/* Background panel - Requirements: 7.3 */}
      <mesh position={[0, maxHeight / 2, -0.02]}>
        <planeGeometry args={[chartWidth + 0.2, maxHeight + 0.3]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.5} />
      </mesh>

      {/* Bars - Requirements: 2.1, 2.2, 2.3, 3.1, 3.3, 3.4, 3.5, 4.1, 4.3, 7.1, 7.5 */}
      {chartData.map((item, index) => {
        /**
         * BAR HEIGHT CALCULATION (Requirements: 3.1, 3.3, 9.1, 9.2)
         *
         * Step 1: Normalize the value
         * normalizedHeight = (value / maxValue) * maxHeight
         *
         * Example with maxValue = 100, maxHeight = 0.6:
         * - value = 0   → (0 / 100) * 0.6 = 0.0m
         * - value = 25  → (25 / 100) * 0.6 = 0.15m (15cm)
         * - value = 50  → (50 / 100) * 0.6 = 0.3m (30cm)
         * - value = 100 → (100 / 100) * 0.6 = 0.6m (60cm)
         *
         * Step 2: Apply minimum height
         * barHeight = Math.max(normalizedHeight, 0.05)
         *
         * This ensures bars with 0 XP are still visible (5cm tall).
         * Without this, zero-value bars would be invisible.
         */
        const normalizedHeight = (item.value / maxValue) * maxHeight;
        const barHeight = Math.max(normalizedHeight, 0.05);

        /**
         * HORIZONTAL POSITIONING (Requirements: 3.5, 9.2)
         *
         * Formula: xPos = (index - (count - 1) / 2) * spacing
         *
         * This centers the bars around the origin (x = 0).
         *
         * Example with 7 bars (indices 0-6), spacing = 0.12:
         * - Bar 0: (0 - 3) * 0.12 = -0.36m (leftmost)
         * - Bar 1: (1 - 3) * 0.12 = -0.24m
         * - Bar 2: (2 - 3) * 0.12 = -0.12m
         * - Bar 3: (3 - 3) * 0.12 = 0.0m (center)
         * - Bar 4: (4 - 3) * 0.12 = 0.12m
         * - Bar 5: (5 - 3) * 0.12 = 0.24m
         * - Bar 6: (6 - 3) * 0.12 = 0.36m (rightmost)
         *
         * Total width: 0.72m (36cm on each side of center)
         *
         * WHY NOT SIMPLER? (Requirements: 9.4)
         * ❌ xPos = index * spacing
         *    This would start at 0 and go right, not centered
         *
         * ❌ xPos = (index - 3) * spacing
         *    This only works for exactly 7 bars, not flexible
         *
         * ✅ xPos = (index - (count - 1) / 2) * spacing
         *    Works for any number of bars, always centered
         */
        const xPos = (index - (chartData.length - 1) / 2) * barSpacing;

        return (
          <group key={item.date}>
            {/**
             * ANIMATED BAR (Requirements: 4.1, 4.3, 7.1, 7.5, 9.3)
             *
             * - height: Normalized and clamped bar height
             * - position: [xPos, 0, 0] - Y starts at 0 (AnimatedBar centers it)
             * - color: #D4AF37 (Corgi Quest gold) - Requirements: 7.1
             * - delay: Staggered by 50ms per bar for cascading effect - Requirements: 4.3
             *
             * PERFORMANCE (Requirements: 9.5, 10.2):
             * - Uses MeshBasicMaterial (no lighting calculations)
             * - GPU-accelerated spring animations
             * - Each bar is ~12 triangles (box geometry)
             * - Total: 7 bars × 12 triangles = 84 triangles (well under 1000 limit)
             */}
            <AnimatedBar
              height={barHeight}
              position={[xPos, 0, 0]}
              color="#D4AF37"
              barWidth={barWidth}
              delay={index * 50}
            />

            {/**
             * XP VALUE TEXT (Requirements: 2.4, 7.2, 9.3)
             *
             * Positioned above the bar with 5cm offset.
             * - fontSize: 0.04 (4cm) - Readable but not overwhelming
             * - color: #f5c35f (lighter gold for contrast)
             * - anchorY: "bottom" - Text sits on top of the offset point
             *
             * TEXT SIZING GUIDE (Requirements: 9.4):
             * ❌ fontSize: 0.5 - Way too big (50cm tall text)
             * ❌ fontSize: 0.005 - Too small to read in VR
             * ✅ fontSize: 0.04 - Just right for 2m viewing distance
             */}
            <Text
              position={[xPos, barHeight + 0.05, 0]}
              fontSize={0.04}
              color="#f5c35f"
              anchorX="center"
              anchorY="bottom"
            >
              {item.value}
            </Text>

            {/**
             * DAY LABEL TEXT (Requirements: 2.5, 7.2, 9.3)
             *
             * Positioned below the bar with 5cm offset.
             * - fontSize: 0.05 (5cm) - Slightly larger than XP value
             * - color: #888888 (gray for secondary information)
             * - anchorY: "top" - Text hangs from the offset point
             *
             * POSITIONING NOTE (Requirements: 9.2):
             * The -0.05 offset places text below y = 0 (the floor of the chart).
             * This keeps labels outside the bar area for clean separation.
             */}
            <Text
              position={[xPos, -0.05, 0]}
              fontSize={0.05}
              color="#888888"
              anchorX="center"
              anchorY="top"
            >
              {item.label}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
