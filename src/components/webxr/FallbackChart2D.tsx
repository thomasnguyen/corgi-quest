/**
 * FallbackChart2D Component
 *
 * 2D fallback chart for non-VR devices.
 * Uses div-based bar chart with same data preparation logic as VR version.
 *
 * PURPOSE (Requirements: 6.1, 6.2, 6.3, 6.5, 9.3):
 * When WebXR is not supported (desktop browsers, mobile devices), this component
 * provides a 2D visualization of the same data that would appear in VR.
 *
 * KEY DESIGN DECISIONS:
 *
 * 1. Same Data Source (Requirements: 6.2)
 *    Uses identical prepareChartData() logic as WeeklyChartPanel.
 *    This ensures consistency between VR and 2D views.
 *
 * 2. Same Normalization (Requirements: 6.1, 9.1)
 *    Uses the same formula: (value / maxValue) * 100%
 *    Bars are proportionally scaled just like in VR.
 *
 * 3. Same Styling (Requirements: 6.1, 7.1, 7.2)
 *    - Bar color: #D4AF37 (Corgi Quest gold)
 *    - XP text: #f5c35f (lighter gold)
 *    - Day labels: #888888 (gray)
 *    - Background: #1a1a1a (dark panel)
 *
 * 4. Minimum Height (Requirements: 3.3, 9.2)
 *    Uses 10% minimum height (equivalent to 0.05m in VR).
 *    Ensures zero-value bars are visible.
 *
 * DIFFERENCES FROM VR VERSION (Requirements: 9.4):
 *
 * ❌ VR uses BoxGeometry (3D boxes)
 * ✅ 2D uses div elements with height percentages
 *
 * ❌ VR uses world units (meters)
 * ✅ 2D uses CSS percentages and pixels
 *
 * ❌ VR uses @react-three/drei Text
 * ✅ 2D uses HTML text elements
 *
 * But the LOGIC is identical - same data prep, same normalization, same styling.
 *
 * For more details on chart rendering, see:
 * .kiro/specs/webxr-vr-hud/CHART_RENDERING_GUIDE.md
 *
 * Requirements: 6.1, 6.2, 6.3, 6.5, 9.1, 9.2, 9.3, 9.4
 */

interface FallbackChart2DProps {
  data: Array<{ date: string; xp: number }>;
}

interface BarData {
  label: string;
  value: number;
  date: string;
}

/**
 * Prepare data for last 7 days
 *
 * IDENTICAL LOGIC TO VR VERSION (Requirements: 6.2, 9.3)
 *
 * This function is duplicated from WeeklyChartPanel to ensure
 * the 2D fallback shows exactly the same data as the VR version.
 *
 * Steps:
 * 1. Generate last 7 days (including today)
 * 2. Find matching XP data for each date
 * 3. Default to 0 if no data exists
 * 4. Format day labels (Mon, Tue, etc.)
 *
 * This ensures consistency between VR and 2D views.
 *
 * Requirements: 6.2, 9.3
 */
function prepareChartData(
  weeklyXP: Array<{ date: string; xp: number }>
): BarData[] {
  const today = new Date();
  const last7Days: BarData[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Find XP for this date
    const dayData = weeklyXP.find((d) => d.date === dateStr);
    const xp = dayData?.xp ?? 0; // Default to 0 if no data

    // Format day label (Mon, Tue, etc.)
    const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });

    last7Days.push({
      label: dayLabel,
      value: xp,
      date: dateStr,
    });
  }

  return last7Days;
}

export default function FallbackChart2D({ data }: FallbackChart2DProps) {
  // Prepare last 7 days using same logic as VR version - Requirements: 6.2
  const chartData = prepareChartData(data);

  /**
   * DATA NORMALIZATION (Requirements: 6.1, 9.1, 9.2)
   *
   * Same formula as VR version: (value / maxValue) * 100%
   *
   * In VR, we normalize to maxHeight (0.6m).
   * In 2D, we normalize to 100% of container height.
   *
   * Example with maxValue = 100:
   * - value = 0   → (0 / 100) * 100 = 0%
   * - value = 25  → (25 / 100) * 100 = 25%
   * - value = 50  → (50 / 100) * 100 = 50%
   * - value = 100 → (100 / 100) * 100 = 100%
   *
   * The Math.max(..., 1) prevents division by zero when all values are 0.
   */
  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8">
      <h1 className="text-2xl text-white mb-4">
        WebXR Charts Demo (2D Fallback)
      </h1>
      <p className="text-gray-400 mb-8">WebXR not supported on this device</p>

      {/* Chart container - Requirements: 6.1 */}
      <div className="bg-[#1a1a1a] border border-[#3d3d3d] rounded-lg p-6">
        <h2 className="text-[#f9dca0] text-lg mb-4 text-center">Last 7 Days</h2>

        {/* Bar chart using divs - Requirements: 6.1 */}
        <div className="flex items-end gap-4 h-64">
          {chartData.map((item) => {
            /**
             * BAR HEIGHT CALCULATION (Requirements: 6.1, 9.1, 9.2)
             *
             * Step 1: Normalize to percentage
             * heightPercent = (value / maxValue) * 100
             *
             * Step 2: Apply minimum height
             * displayHeight = Math.max(heightPercent, 10)
             *
             * This is equivalent to the VR version's Math.max(normalizedHeight, 0.05).
             * In VR, 0.05m is the minimum. In 2D, 10% is the minimum.
             *
             * WHY 10%? (Requirements: 9.4)
             * - Container height is 256px (h-64 = 16rem = 256px)
             * - 10% of 256px = 25.6px
             * - This is visible but not overwhelming for zero values
             *
             * COMPARISON TO VR:
             * - VR: Math.max((value / maxValue) * 0.6, 0.05)
             * - 2D: Math.max((value / maxValue) * 100, 10)
             * Same logic, different units!
             */
            const heightPercent = (item.value / maxValue) * 100;
            const displayHeight = Math.max(heightPercent, 10);

            return (
              <div
                key={item.date}
                className="flex flex-col items-center gap-2 flex-1"
              >
                {/**
                 * XP VALUE TEXT (Requirements: 7.2, 9.3)
                 *
                 * Positioned above the bar (flex-col with gap).
                 * - color: #f5c35f (matches VR version)
                 * - text-sm: 14px (readable on screens)
                 *
                 * In VR, this is fontSize: 0.04 (4cm).
                 * In 2D, we use text-sm for similar visual weight.
                 */}
                <span className="text-[#f5c35f] text-sm font-medium">
                  {item.value}
                </span>

                {/**
                 * BAR ELEMENT (Requirements: 7.1, 9.3, 9.4)
                 *
                 * - bg-[#D4AF37]: Corgi Quest gold (matches VR)
                 * - rounded-t: Rounded top corners (visual polish)
                 * - transition-all duration-500: Smooth height changes
                 * - height: Dynamic based on normalized value
                 *
                 * COMPARISON TO VR (Requirements: 9.4):
                 * ❌ VR: <boxGeometry args={[0.08, height, 0.08]} />
                 * ✅ 2D: <div style={{ height: `${height}%` }} />
                 *
                 * Different implementation, same visual result!
                 */}
                <div
                  className="w-full bg-[#D4AF37] rounded-t transition-all duration-500"
                  style={{ height: `${displayHeight}%` }}
                />

                {/**
                 * DAY LABEL TEXT (Requirements: 7.2, 9.3)
                 *
                 * Positioned below the bar.
                 * - color: #888888 (matches VR version)
                 * - text-xs: 12px (secondary information)
                 *
                 * In VR, this is fontSize: 0.05 (5cm).
                 * In 2D, we use text-xs for similar hierarchy.
                 */}
                <span className="text-[#888888] text-xs">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
