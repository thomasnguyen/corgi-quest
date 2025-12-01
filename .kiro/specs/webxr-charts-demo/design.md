# Design Document - WebXR Charts Demo

## Overview

The WebXR Charts Demo is a standalone route (`/webxr`) that demonstrates proper 3D chart rendering techniques using react-three-fiber. This implementation is completely separate from the existing `/app.vr` route, allowing safe experimentation with 3D visualization approaches.

The primary goal is to create a reference implementation of a 3D bar chart that:
- Uses proper world-space dimensions (meters, not pixels)
- Normalizes data correctly to avoid giant or tiny bars
- Positions elements accurately in 3D space
- Renders text at readable sizes
- Animates smoothly with spring physics

## Architecture

### Route Structure

```
src/routes/
  webxr.tsx              # New standalone WebXR demo route
```

This route is completely independent from:
- `src/routes/app.vr.tsx` (existing VR training HUD)
- `src/routes/vr.tsx` (if it exists)

### Component Hierarchy

```
<WebXRChartsDemo>                    # Main route component
  ├─ <WebXRCheck>                    # Feature detection
  │   ├─ <VREntryButton>             # "Enter VR" button
  │   └─ <FallbackChart2D>           # 2D canvas fallback
  │
  └─ <Canvas>                        # react-three-fiber canvas
      └─ <XR>                        # WebXR session wrapper
          ├─ <Scene>                 # Basic lighting and environment
          │   ├─ <ambientLight>
          │   └─ <directionalLight>
          │
          └─ <WeeklyChartPanel>      # 3D bar chart
              ├─ <Text>              # Title
              ├─ <mesh>              # Background panel
              └─ <AnimatedBar> × 7   # One per day
                  ├─ <boxGeometry>   # Bar shape
                  ├─ <Text>          # XP value above
                  └─ <Text>          # Day label below
```

## Core Components

### WebXRChartsDemo (webxr.tsx)

Main route component with WebXR session management.

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { XR } from "@react-three/xr";
import { useActiveDog } from "../hooks/useActiveDog";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import WeeklyChartPanel from "../components/webxr/WeeklyChartPanel";

export const Route = createFileRoute("/webxr")({
  component: WebXRChartsDemo,
});

function WebXRChartsDemo() {
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);
  const [inVR, setInVR] = useState(false);
  const { activeDogId } = useActiveDog();
  
  // Fetch last 7 days of XP data
  const weeklyXP = useQuery(
    api.queries.getDailyXP,
    activeDogId ? {
      dogId: activeDogId,
      startDate: getDateDaysAgo(7),
      endDate: getTodayDate(),
    } : "skip"
  );
  
  // Check WebXR support
  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-vr')
        .then(setXrSupported);
    } else {
      setXrSupported(false);
    }
  }, []);
  
  // Render fallback if WebXR not supported
  if (xrSupported === false) {
    return <FallbackChart2D data={weeklyXP ?? []} />;
  }
  
  // Render entry button if not in VR
  if (!inVR) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <h1 className="text-2xl text-white mb-8">WebXR Charts Demo</h1>
        <button
          onClick={() => setInVR(true)}
          className="px-6 py-3 bg-[#D4AF37] text-black rounded-lg font-semibold"
        >
          Enter VR
        </button>
      </div>
    );
  }
  
  // Render VR experience
  return (
    <Canvas>
      <XR referenceSpace="local-floor">
        {/* Basic lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        
        {/* Weekly chart */}
        <WeeklyChartPanel
          weeklyXP={weeklyXP ?? []}
          position={[0, 1.5, -2]}
        />
      </XR>
    </Canvas>
  );
}

// Helper functions
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}
```

### WeeklyChartPanel Component

The core 3D chart component with proper scaling and positioning.

```typescript
import { Text } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { useEffect, useState } from 'react';

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
 * AnimatedBar - Single bar with growth animation
 * Requirements: 4.1, 4.2, 4.3
 */
function AnimatedBar({
  height,
  position,
  color,
  delay = 0,
}: {
  height: number;
  position: [number, number, number];
  color: string;
  delay?: number;
}) {
  const [started, setStarted] = useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);
  
  // Spring animation - Requirements: 4.2
  const { animatedHeight } = useSpring({
    animatedHeight: started ? height : 0,
    config: { tension: 200, friction: 20 },
  });
  
  return (
    <animated.mesh
      position-x={position[0]}
      position-y={animatedHeight.to(h => h / 2)} // Center at half height - Requirements: 3.4
      position-z={position[2]}
    >
      <boxGeometry args={[0.08, animatedHeight, 0.08]} />
      <meshBasicMaterial color={color} />
    </animated.mesh>
  );
}

/**
 * WeeklyChartPanel - Displays 7-day XP bar chart
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.4, 7.1, 7.2, 7.3, 7.4, 7.5
 */
export default function WeeklyChartPanel({
  weeklyXP,
  position = [0, 1.5, -2],
}: WeeklyChartPanelProps) {
  // Prepare data for last 7 days - Requirements: 2.2, 5.5
  const prepareChartData = (): BarData[] => {
    const today = new Date();
    const last7Days: BarData[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Find XP for this date - Requirements: 5.1
      const dayData = weeklyXP.find(d => d.date === dateStr);
      const xp = dayData?.xp ?? 0;
      
      // Format day label (Mon, Tue, etc.) - Requirements: 2.5
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      last7Days.push({
        label: dayLabel,
        value: xp,
        date: dateStr,
      });
    }
    
    return last7Days;
  };
  
  const chartData = prepareChartData();
  
  // Chart dimensions in world units (meters) - Requirements: 2.3
  const maxHeight = 0.6;    // 60cm maximum bar height
  const barWidth = 0.08;    // 8cm bar width
  const barSpacing = 0.12;  // 12cm between bar centers
  const chartWidth = chartData.length * barSpacing;
  
  // Calculate max value for normalization - Requirements: 3.1, 3.2
  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  
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
      
      {/* Bars - Requirements: 2.1, 2.2, 2.3, 3.1, 3.3, 3.4, 3.5, 4.1, 4.3 */}
      {chartData.map((item, index) => {
        // Normalize height - Requirements: 3.1
        const normalizedHeight = (item.value / maxValue) * maxHeight;
        
        // Ensure minimum height for visibility - Requirements: 3.3
        const barHeight = Math.max(normalizedHeight, 0.05);
        
        // Calculate X position (center bars around origin) - Requirements: 3.5
        const xPos = (index - (chartData.length - 1) / 2) * barSpacing;
        
        return (
          <group key={item.date}>
            {/* Animated bar - Requirements: 4.1, 4.3, 7.1, 7.5 */}
            <AnimatedBar
              height={barHeight}
              position={[xPos, 0, 0]}
              color="#D4AF37"
              delay={index * 50} // Stagger animation - Requirements: 4.3
            />
            
            {/* XP value above bar - Requirements: 2.4, 7.2 */}
            <Text
              position={[xPos, barHeight + 0.05, 0]}
              fontSize={0.04}
              color="#f5c35f"
              anchorX="center"
              anchorY="bottom"
            >
              {item.value}
            </Text>
            
            {/* Day label below bar - Requirements: 2.5, 7.2 */}
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
      
      {/* Optional: Grid lines for reference */}
      {[0.25, 0.5, 0.75].map((ratio) => {
        const y = ratio * maxHeight;
        return (
          <line key={ratio}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  -chartWidth / 2, y, 0.01,
                  chartWidth / 2, y, 0.01,
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#3d3d3d" opacity={0.3} transparent />
          </line>
        );
      })}
    </group>
  );
}
```

### FallbackChart2D Component

2D canvas fallback for non-VR devices.

```typescript
interface FallbackChart2DProps {
  data: Array<{ date: string; xp: number }>;
}

function FallbackChart2D({ data }: FallbackChart2DProps) {
  // Prepare last 7 days
  const chartData = prepareChartData(data);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8">
      <h1 className="text-2xl text-white mb-4">WebXR Charts Demo (2D Fallback)</h1>
      <p className="text-gray-400 mb-8">WebXR not supported on this device</p>
      
      <div className="bg-[#1a1a1e] border border-[#3d3d3d] rounded-lg p-6">
        <h2 className="text-[#f9dca0] text-lg mb-4">Last 7 Days</h2>
        
        {/* Simple bar chart using divs */}
        <div className="flex items-end gap-4 h-64">
          {chartData.map((item) => {
            const maxValue = Math.max(...chartData.map(d => d.value), 1);
            const heightPercent = (item.value / maxValue) * 100;
            
            return (
              <div key={item.date} className="flex flex-col items-center gap-2">
                <span className="text-[#f5c35f] text-sm">{item.value}</span>
                <div
                  className="w-12 bg-[#D4AF37] rounded-t"
                  style={{ height: `${Math.max(heightPercent, 10)}%` }}
                />
                <span className="text-[#888888] text-xs">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

## Key Design Principles

### 1. World-Space Dimensions

All dimensions are in meters (world units), not pixels:

```typescript
const maxHeight = 0.6;    // 60cm tall
const barWidth = 0.08;    // 8cm wide
const barSpacing = 0.12;  // 12cm apart
const fontSize = 0.04;    // 4cm text height
```

### 2. Data Normalization

Always normalize data to fit within maxHeight:

```typescript
const maxValue = Math.max(...data.map(d => d.value), 1);
const normalizedHeight = (value / maxValue) * maxHeight;
const barHeight = Math.max(normalizedHeight, 0.05); // Minimum 5cm
```

### 3. Proper Positioning

- **Bars**: Center at `y = height / 2` so bottom is at `y = 0`
- **Horizontal**: Center around origin using `(index - (count - 1) / 2) * spacing`
- **Text**: Position relative to bar top/bottom with small offset

### 4. Text Sizing

Use small fontSize values for readability:

```typescript
// Title: 0.12 (12cm)
// Labels: 0.05 (5cm)
// Values: 0.04 (4cm)
```

### 5. Performance

- Use `MeshBasicMaterial` (no lighting calculations)
- Use `@react-three/drei` Text component
- Limit animations to 7 bars
- Dispose resources on unmount

## Data Flow

```
Convex Backend
    ↓
api.queries.getDailyXP
    ↓
useQuery hook
    ↓
weeklyXP array
    ↓
prepareChartData()
    ↓
chartData (7 days)
    ↓
Normalization
    ↓
3D Bar Rendering
```

## Testing Strategy

### Test Scenarios

1. **All zeros**: Verify minimum bar height (0.05)
2. **One high value**: Verify proportional scaling
3. **Gradual increase**: Verify smooth progression
4. **Missing data**: Verify zero-fill behavior
5. **Real data**: Verify with actual Convex data

### Visual Checks

- [ ] Bars are visible and proportional
- [ ] Text is readable (not too small/large)
- [ ] Spacing is even
- [ ] Chart is centered in view
- [ ] Animations are smooth
- [ ] Colors match Corgi Quest theme

### Performance Checks

- [ ] 60+ fps in VR
- [ ] < 1000 triangles total
- [ ] No memory leaks
- [ ] Smooth animations

## Dependencies

### New Dependencies

```json
{
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.92.0",
  "@react-three/xr": "^6.2.0",
  "@react-spring/three": "^9.7.0",
  "three": "^0.160.0"
}
```

### Existing Dependencies (Reused)

- `react`: ^18.2.0
- `@tanstack/react-router`: For routing
- `convex`: For real-time data
- `typescript`: For type safety

## File Structure

```
src/
  routes/
    webxr.tsx                          # New route (independent)
  components/
    webxr/                             # New folder
      WeeklyChartPanel.tsx             # 3D chart component
      AnimatedBar.tsx                  # Animated bar component
      FallbackChart2D.tsx              # 2D fallback
```

## Implementation Notes

### Avoiding Common Mistakes

❌ **Don't use SVG**
```typescript
<svg><rect /></svg> // Won't work in WebXR
```

✅ **Use 3D primitives**
```typescript
<mesh><boxGeometry /></mesh>
```

❌ **Don't use pixel dimensions**
```typescript
<boxGeometry args={[40, 100, 40]} /> // Way too big!
```

✅ **Use world units**
```typescript
<boxGeometry args={[0.08, barHeight, 0.08]} />
```

❌ **Don't forget normalization**
```typescript
<boxGeometry args={[0.08, xpValue, 0.08]} /> // Could be 500m tall!
```

✅ **Normalize data**
```typescript
const normalizedHeight = (xpValue / maxValue) * 0.6;
```

### Performance Optimization

1. **Use MeshBasicMaterial**: No lighting calculations
2. **Batch geometries**: Reuse geometry instances
3. **Limit animations**: Max 7 simultaneous
4. **Dispose resources**: Clean up on unmount

```typescript
useEffect(() => {
  return () => {
    // Dispose geometries and materials
    geometry.dispose();
    material.dispose();
  };
}, []);
```

## Future Enhancements

- Interactive bars (click to see details)
- Multiple chart types (line, area)
- Comparison mode (multiple dogs)
- Time range selector
- Export chart as image
