# WebXR Chart Rendering Guide

## Why Charts Get Squished in WebXR

When porting 2D SVG charts to WebXR, they often appear squished, distorted, or completely broken. This guide explains why and how to fix it.

## The Core Problem

**SVG doesn't work in WebXR.** Period.

Your existing charts use SVG with pixel-based dimensions:
```typescript
// From WeeklyXpChart.tsx (2D web app)
const width = 320;  // pixels
const height = 160; // pixels
<svg width={width} height={height}>
  <rect x={10} y={10} width={40} height={100} />
</svg>
```

In WebXR, you need 3D primitives with world-space units (meters):
```typescript
// For WebXR VR
const barWidth = 0.08;  // 8cm in VR space
const barHeight = 0.6;  // 60cm in VR space
<mesh>
  <boxGeometry args={[barWidth, barHeight, barWidth]} />
</mesh>
```

## Key Differences: 2D vs 3D

| Aspect | 2D Web (SVG) | 3D WebXR |
|--------|--------------|----------|
| **Rendering** | SVG elements | three.js meshes |
| **Units** | Pixels (320px) | Meters (0.32m) |
| **Positioning** | X/Y coordinates | X/Y/Z world space |
| **Text** | SVG `<text>` | @react-three/drei `<Text>` |
| **Scaling** | CSS transforms | 3D scale/position |
| **Dimensions** | width/height attrs | geometry args |

## The Solution: 3D Primitives

### 1. Replace SVG with BoxGeometry

**Before (2D SVG):**
```typescript
<rect x={x} y={y} width={40} height={100} fill="#D4AF37" />
```

**After (3D WebXR):**
```typescript
<mesh position={[x, y, z]}>
  <boxGeometry args={[0.08, barHeight, 0.08]} />
  <meshBasicMaterial color="#D4AF37" />
</mesh>
```

### 2. Normalize Data Values

**The Problem:**
Raw XP values (e.g., 500 XP) create bars that are 500 units (meters) tall in VR!

**The Solution:**
Always normalize to a reasonable max height:

```typescript
// Define max height in world units
const maxHeight = 0.6; // 60cm tall

// Find max value in dataset
const maxValue = Math.max(...data.map(d => d.value), 1);

// Normalize each value
const normalizedHeight = (value / maxValue) * maxHeight;

// Ensure minimum visibility
const barHeight = Math.max(normalizedHeight, 0.05);
```

### 3. Use World-Space Dimensions

**Think in meters, not pixels:**

```typescript
// ❌ WRONG - Pixel thinking
const barWidth = 40;      // 40 meters! Way too big!
const barSpacing = 60;    // 60 meters apart!
const fontSize = 12;      // 12 meter tall text!

// ✅ CORRECT - World units (meters)
const barWidth = 0.08;    // 8cm wide
const barSpacing = 0.12;  // 12cm apart
const fontSize = 0.05;    // 5cm tall text
```

**Rule of thumb:**
- Divide pixel values by ~1000 to get reasonable world units
- 320px → 0.32m (32cm)
- 160px → 0.16m (16cm)
- 40px → 0.04m (4cm)

### 4. Position Bars Correctly

**Bars should sit on the ground (y=0):**

```typescript
// BoxGeometry is centered at its position
// To make bottom of bar at y=0, position center at y=height/2

<mesh position={[x, barHeight / 2, z]}>
  <boxGeometry args={[barWidth, barHeight, barWidth]} />
</mesh>
```

**Center bars around origin:**

```typescript
// For 7 bars, center them so middle bar is at x=0
const xPos = (index - (data.length - 1) / 2) * barSpacing;

// Example with 7 bars:
// index 0: (0 - 3) * 0.12 = -0.36
// index 3: (3 - 3) * 0.12 = 0     (center)
// index 6: (6 - 3) * 0.12 = 0.36
```

### 5. Replace SVG Text with 3D Text

**Before (2D SVG):**
```typescript
<text x={x} y={y} fontSize="10" fill="#888">
  Mon
</text>
```

**After (3D WebXR):**
```typescript
import { Text } from '@react-three/drei';

<Text
  position={[x, y, z]}
  fontSize={0.05}
  color="#888888"
  anchorX="center"
  anchorY="top"
>
  Mon
</Text>
```

**Text sizing guide:**
- Panel titles: `fontSize={0.12}`
- Section labels: `fontSize={0.08}`
- Values/numbers: `fontSize={0.04}`
- Chart labels: `fontSize={0.05}`

## Complete Example: Weekly XP Chart

```typescript
import { Text } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';

interface WeeklyChartPanelProps {
  weeklyXP: Array<{ date: string; xp: number }>;
  position?: [number, number, number];
}

export default function WeeklyChartPanel({
  weeklyXP,
  position = [0, -0.5, -1.5],
}: WeeklyChartPanelProps) {
  // Prepare last 7 days of data
  const chartData = prepareChartData(weeklyXP);
  
  // Chart dimensions (world units)
  const maxHeight = 0.6;
  const barWidth = 0.08;
  const barSpacing = 0.12;
  
  // Normalize data
  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  
  return (
    <group position={position}>
      {/* Title */}
      <Text
        position={[0, maxHeight + 0.15, 0]}
        fontSize={0.12}
        color="#f9dca0"
        anchorX="center"
      >
        Last 7 Days
      </Text>
      
      {/* Background panel */}
      <mesh position={[0, maxHeight / 2, -0.02]}>
        <planeGeometry args={[chartData.length * barSpacing + 0.2, maxHeight + 0.3]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.5} />
      </mesh>
      
      {/* Bars */}
      {chartData.map((item, index) => {
        // Normalize height
        const normalizedHeight = (item.value / maxValue) * maxHeight;
        const barHeight = Math.max(normalizedHeight, 0.05);
        
        // Calculate position
        const xPos = (index - (chartData.length - 1) / 2) * barSpacing;
        
        return (
          <group key={item.date}>
            {/* Bar */}
            <mesh position={[xPos, barHeight / 2, 0]}>
              <boxGeometry args={[barWidth, barHeight, barWidth]} />
              <meshBasicMaterial color="#D4AF37" />
            </mesh>
            
            {/* Value above bar */}
            <Text
              position={[xPos, barHeight + 0.05, 0]}
              fontSize={0.04}
              color="#f5c35f"
              anchorX="center"
              anchorY="bottom"
            >
              {item.value}
            </Text>
            
            {/* Day label below */}
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

function prepareChartData(weeklyXP: Array<{ date: string; xp: number }>) {
  const today = new Date();
  const last7Days = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayData = weeklyXP.find(d => d.date === dateStr);
    const xp = dayData?.xp ?? 0;
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    last7Days.push({ label: dayLabel, value: xp, date: dateStr });
  }
  
  return last7Days;
}
```

## Common Mistakes Checklist

- [ ] ❌ Using SVG elements in WebXR
- [ ] ❌ Using pixel dimensions (320px, 160px)
- [ ] ❌ Not normalizing data values
- [ ] ❌ Forgetting minimum bar height
- [ ] ❌ Wrong bar positioning (not centered at height/2)
- [ ] ❌ Text fontSize too large (> 0.15)
- [ ] ❌ Not centering bars around origin
- [ ] ❌ Using raw XP values as heights

## Testing Your Chart

1. **Check bar visibility:**
   - All 7 bars should be visible
   - Even zero-XP days should show small bars (0.05 units)

2. **Check proportions:**
   - Bars should look like bars, not needles or walls
   - Width ~8cm, max height ~60cm

3. **Check text:**
   - Labels should be readable
   - Values shouldn't overlap with bars
   - Text should be in front of background

4. **Check positioning:**
   - Chart should be centered in view
   - Bars should sit on ground (not floating)
   - Spacing should be even

5. **Check with different data:**
   - Test with all zeros
   - Test with one high value
   - Test with gradually increasing values

## Performance Tips

1. **Use MeshBasicMaterial** (not MeshStandardMaterial)
   - Faster rendering
   - No lighting calculations needed

2. **Keep geometry simple**
   - BoxGeometry is perfect for bars
   - Avoid complex shapes

3. **Limit animations**
   - Stagger bar animations (50ms delay each)
   - Use react-spring for smooth transitions

4. **Clean up resources**
   ```typescript
   useEffect(() => {
     return () => {
       // Dispose geometries and materials
     };
   }, []);
   ```

## Debugging Tips

**Add console logs:**
```typescript
console.log('Chart data:', chartData);
console.log('Max value:', maxValue);
console.log('Bar heights:', chartData.map(d => (d.value / maxValue) * maxHeight));
```

**Visualize with wireframes:**
```typescript
<meshBasicMaterial color="#D4AF37" wireframe />
```

**Check positions:**
```typescript
console.log('Bar positions:', chartData.map((_, i) => 
  (i - (chartData.length - 1) / 2) * barSpacing
));
```

## Summary

**The golden rules for WebXR charts:**

1. ✅ Use 3D primitives (BoxGeometry), not SVG
2. ✅ Use world units (0.08m), not pixels (40px)
3. ✅ Normalize data to reasonable heights (0.6m max)
4. ✅ Ensure minimum visibility (0.05m min)
5. ✅ Position bars correctly (center at height/2)
6. ✅ Use small fontSize for 3D text (0.04-0.05)
7. ✅ Center bars around origin
8. ✅ Test with various data values

Follow these rules and your charts will render beautifully in VR! 🎉
