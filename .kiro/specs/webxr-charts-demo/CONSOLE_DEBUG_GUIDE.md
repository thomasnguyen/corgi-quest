# WebXR Charts Demo - Console Debug Guide

This guide explains the console.log output you'll see when testing the WebXR charts demo.

## Console Output Overview

When you load the `/webxr` route and enter VR, you'll see detailed debug information in the browser console to help verify the chart is rendering correctly.

## Output Sequence

### 1. Route Loading (Initial)

```
WebXR: Loading training data...
```

This appears while fetching data from Convex.

### 2. Data Loaded

```
=== WebXR Route Debug Info ===
Active Dog ID: [dog_id]
Weekly XP Data: [
  { date: "2024-11-24", xp: 45 },
  { date: "2024-11-25", xp: 30 },
  ...
]
Data Points: 7
Date Range: {
  start: "2024-11-24",
  end: "2024-11-30"
}
==============================
```

**What to check:**
- ✅ Active Dog ID is not null
- ✅ Weekly XP Data has entries
- ✅ Data Points matches expected count
- ✅ Date Range covers last 7 days

### 3. Entering VR

```
🥽 Entering VR mode...
Chart will render with 7 data points
```

This confirms you clicked "Enter VR" and shows how many data points will be rendered.

### 4. Chart Rendering

```
=== WebXR Chart Debug Info ===
Chart Data: [
  { label: "Sun", value: 45, date: "2024-11-24" },
  { label: "Mon", value: 30, date: "2024-11-25" },
  { label: "Tue", value: 60, date: "2024-11-26" },
  { label: "Wed", value: 0, date: "2024-11-27" },
  { label: "Thu", value: 50, date: "2024-11-28" },
  { label: "Fri", value: 40, date: "2024-11-29" },
  { label: "Sat", value: 55, date: "2024-11-30" }
]
Max XP Value: 60
Chart Dimensions: {
  maxHeight: "0.6m (60cm)",
  barWidth: "0.08m (8cm)",
  barSpacing: "0.12m (12cm)",
  totalWidth: "0.84m (84cm)"
}
Bar Heights: [
  { day: "Sun", xp: 45, height: "0.450m (45.0cm)", isMinimum: false },
  { day: "Mon", xp: 30, height: "0.300m (30.0cm)", isMinimum: false },
  { day: "Tue", xp: 60, height: "0.600m (60.0cm)", isMinimum: false },
  { day: "Wed", xp: 0, height: "0.050m (5.0cm)", isMinimum: true },
  { day: "Thu", xp: 50, height: "0.500m (50.0cm)", isMinimum: false },
  { day: "Fri", xp: 40, height: "0.400m (40.0cm)", isMinimum: false },
  { day: "Sat", xp: 55, height: "0.550m (55.0cm)", isMinimum: true }
]
==============================
```

**What to check:**

#### Chart Data
- ✅ 7 days of data (last 7 days including today)
- ✅ Labels are day names (Sun, Mon, Tue, etc.)
- ✅ Values match your training data
- ✅ Dates are in chronological order

#### Max XP Value
- ✅ Should be the highest XP value in the data
- ✅ Used for normalization (all bars scaled relative to this)

#### Chart Dimensions
- ✅ maxHeight: 0.6m (60cm) - tallest bar height
- ✅ barWidth: 0.08m (8cm) - width of each bar
- ✅ barSpacing: 0.12m (12cm) - distance between bar centers
- ✅ totalWidth: 0.84m (84cm) - total chart width

#### Bar Heights
For each bar, you'll see:
- **day**: Day of the week
- **xp**: XP value for that day
- **height**: Calculated bar height in meters and centimeters
- **isMinimum**: Whether bar is at minimum height (0.05m / 5cm)

**Height Calculation:**
- Bars are normalized: `(xp / maxXP) * 0.6m`
- Minimum height: 0.05m (5cm) for visibility
- Example: If maxXP = 60 and xp = 30, height = (30/60) * 0.6 = 0.3m (30cm)

## Interpreting the Output

### Scenario 1: All Zeros

```
Max XP Value: 1
Bar Heights: [
  { day: "Sun", xp: 0, height: "0.050m (5.0cm)", isMinimum: true },
  { day: "Mon", xp: 0, height: "0.050m (5.0cm)", isMinimum: true },
  ...
]
```

**Expected in VR:**
- All bars at minimum height (5cm)
- All bars visible (not invisible)
- All show "0" as XP value

### Scenario 2: One High Value

```
Max XP Value: 100
Bar Heights: [
  { day: "Sun", xp: 10, height: "0.060m (6.0cm)", isMinimum: false },
  { day: "Mon", xp: 100, height: "0.600m (60.0cm)", isMinimum: false },
  { day: "Tue", xp: 5, height: "0.050m (5.0cm)", isMinimum: true },
  ...
]
```

**Expected in VR:**
- One bar at full height (60cm)
- Other bars proportionally smaller
- Small values at minimum height (5cm)

### Scenario 3: Gradual Increase

```
Max XP Value: 70
Bar Heights: [
  { day: "Sun", xp: 10, height: "0.086m (8.6cm)", isMinimum: false },
  { day: "Mon", xp: 20, height: "0.171m (17.1cm)", isMinimum: false },
  { day: "Tue", xp: 30, height: "0.257m (25.7cm)", isMinimum: false },
  ...
]
```

**Expected in VR:**
- Each bar taller than the previous
- Smooth progression
- Highest bar at 60cm

### Scenario 4: Missing Data

```
Chart Data: [
  { label: "Sun", value: 25, date: "2024-11-24" },
  { label: "Mon", value: 0, date: "2024-11-25" },  // Missing - filled with 0
  { label: "Tue", value: 30, date: "2024-11-26" },
  ...
]
```

**Expected in VR:**
- All 7 bars present
- Missing days show 0 XP
- Missing days at minimum height (5cm)

## Troubleshooting

### Issue: No console output

**Possible causes:**
- Console not open
- Browser dev tools not connected
- JavaScript errors preventing execution

**Solutions:**
1. Open Safari dev tools (Cmd+Option+I)
2. Check Console tab
3. Look for errors in red

### Issue: "Active Dog ID: null"

**Possible causes:**
- No dog selected in main app
- Not logged in

**Solutions:**
1. Go to main app
2. Select a dog
3. Return to /webxr route

### Issue: "Data Points: 0"

**Possible causes:**
- No training data logged
- Date range issue
- Convex query not working

**Solutions:**
1. Log some training activities
2. Check Convex dashboard
3. Verify query parameters

### Issue: All bars show "isMinimum: true"

**Possible causes:**
- All XP values are 0
- No training data for last 7 days

**Solutions:**
1. Log training activities
2. Check date range
3. Verify data is recent

### Issue: Bar heights seem wrong

**Possible causes:**
- Normalization issue
- Max value calculation error

**Solutions:**
1. Check Max XP Value in console
2. Verify height calculation formula
3. Compare console output to VR view

## Using Console Output for VR Testing

### Before Entering VR

1. **Check data loaded:**
   - Verify Active Dog ID
   - Confirm Weekly XP Data has entries
   - Check Date Range is correct

2. **Review chart data:**
   - Verify 7 days present
   - Check XP values match expectations
   - Confirm dates are recent

3. **Verify calculations:**
   - Check Max XP Value makes sense
   - Review Bar Heights calculations
   - Confirm minimum heights applied

### After Entering VR

1. **Compare console to VR:**
   - Match bar heights to console output
   - Verify XP values displayed correctly
   - Check day labels match

2. **Verify proportions:**
   - Tallest bar should match Max XP Value
   - Other bars proportional
   - Minimum height bars visible

3. **Check for issues:**
   - Any bars missing?
   - Text readable?
   - Colors correct?

## Example Console Session

Here's what a complete console session looks like:

```
WebXR: Loading training data...

=== WebXR Route Debug Info ===
Active Dog ID: "kg2abc123def456"
Weekly XP Data: [
  { date: "2024-11-24", xp: 45 },
  { date: "2024-11-25", xp: 30 },
  { date: "2024-11-26", xp: 60 },
  { date: "2024-11-27", xp: 0 },
  { date: "2024-11-28", xp: 50 },
  { date: "2024-11-29", xp: 40 },
  { date: "2024-11-30", xp: 55 }
]
Data Points: 7
Date Range: { start: "2024-11-24", end: "2024-11-30" }
==============================

🥽 Entering VR mode...
Chart will render with 7 data points

=== WebXR Chart Debug Info ===
Chart Data: [
  { label: "Sun", value: 45, date: "2024-11-24" },
  { label: "Mon", value: 30, date: "2024-11-25" },
  { label: "Tue", value: 60, date: "2024-11-26" },
  { label: "Wed", value: 0, date: "2024-11-27" },
  { label: "Thu", value: 50, date: "2024-11-28" },
  { label: "Fri", value: 40, date: "2024-11-29" },
  { label: "Sat", value: 55, date: "2024-11-30" }
]
Max XP Value: 60
Chart Dimensions: {
  maxHeight: "0.6m (60cm)",
  barWidth: "0.08m (8cm)",
  barSpacing: "0.12m (12cm)",
  totalWidth: "0.84m (84cm)"
}
Bar Heights: [
  { day: "Sun", xp: 45, height: "0.450m (45.0cm)", isMinimum: false },
  { day: "Mon", xp: 30, height: "0.300m (30.0cm)", isMinimum: false },
  { day: "Tue", xp: 60, height: "0.600m (60.0cm)", isMinimum: false },
  { day: "Wed", xp: 0, height: "0.050m (5.0cm)", isMinimum: true },
  { day: "Thu", xp: 50, height: "0.500m (50.0cm)", isMinimum: false },
  { day: "Fri", xp: 40, height: "0.400m (40.0cm)", isMinimum: false },
  { day: "Sat", xp: 55, height: "0.550m (55.0cm)", isMinimum: false }
]
==============================
```

**What this tells you:**
- ✅ Data loaded successfully
- ✅ 7 days of data present
- ✅ Max XP is 60 (Tuesday)
- ✅ Wednesday has 0 XP (minimum height)
- ✅ All other bars proportionally scaled
- ✅ Chart dimensions are correct

## Summary

The console output provides:
1. **Data verification** - Confirm data loaded correctly
2. **Calculation transparency** - See how heights are calculated
3. **Debugging info** - Identify issues before VR testing
4. **Reference values** - Compare console to VR view

Use this output to verify everything is working correctly before putting on your VR headset!
