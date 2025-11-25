# Mobile Testing Guide - Hackathon Landing Page

## Quick Test Checklist

Use this guide to manually verify mobile optimizations on the hackathon landing page.

---

## 1. Responsive Layout Testing (Req 12.1, 12.2)

### Test Viewports

Test on these common mobile viewport sizes:

- **iPhone SE:** 375px × 667px
- **iPhone 12/13/14:** 390px × 844px
- **iPhone 14 Pro Max:** 430px × 932px
- **Samsung Galaxy S21:** 360px × 800px
- **Pixel 5:** 393px × 851px

### What to Check

1. **Container Width**
   - Page content should be centered with padding on sides
   - No content should touch the edges
   - Max width should be 4xl (896px) on larger screens

2. **Vertical Stacking**
   - All sections should stack vertically
   - No side-by-side content on mobile (< 768px)
   - Proper spacing between sections

3. **Button Layout**
   - Hero buttons should stack vertically
   - Final CTA buttons should stack vertically
   - Testing instructions button should be full-width

### How to Test

**Chrome DevTools:**
```
1. Open hackathon page
2. Press F12 or Cmd+Option+I
3. Click device toolbar icon (Cmd+Shift+M)
4. Select "Responsive" or specific device
5. Resize to test different widths
```

**Safari:**
```
1. Open hackathon page
2. Develop → Enter Responsive Design Mode
3. Select device or custom size
4. Test at 375px, 390px, 768px breakpoints
```

---

## 2. Touch Target Testing (Req 12.3)

### Minimum Size: 44px × 44px

All interactive elements must meet this minimum for comfortable tapping.

### Elements to Test

1. **Primary CTAs**
   - [ ] Hero "Launch Demo" button
   - [ ] Hero "Watch Demo" button
   - [ ] Demo Video "Launch Demo Now" button
   - [ ] Testing Instructions "Launch Demo Now" button
   - [ ] Final CTA "Launch Demo" button
   - [ ] Final CTA "View GitHub" button

2. **Secondary Actions**
   - [ ] Credential copy buttons (smaller is OK for secondary actions)

### How to Test

1. **Visual Inspection:**
   - Buttons should look substantial, not cramped
   - Adequate padding around text
   - Easy to tap without zooming

2. **Actual Tapping:**
   - Test on real device if possible
   - Tap each button with thumb
   - Should not accidentally tap adjacent elements

3. **DevTools Measurement:**
   ```
   1. Right-click button → Inspect
   2. Check computed height and width
   3. Should be ≥ 44px in both dimensions
   ```

---

## 3. Font Size Testing (Req 12.4)

### Minimum Body Text: 16px

### Font Size Reference

| Class | Size | Usage | Mobile OK? |
|-------|------|-------|------------|
| `text-xs` | 12px | Micro-copy only | ⚠️ Sparingly |
| `text-sm` | 14px | Captions, secondary | ✅ Yes |
| `text-base` | 16px | Body text | ✅ Yes |
| `text-lg` | 18px | Emphasized text | ✅ Yes |
| `text-xl` | 20px | Subheadings | ✅ Yes |
| `text-2xl` | 24px | Headings | ✅ Yes |
| `text-3xl` | 30px | Large headings | ✅ Yes |
| `text-4xl` | 36px | Hero text (mobile) | ✅ Yes |

### What to Check

1. **Readability Without Zooming**
   - All body text should be readable at arm's length
   - No need to pinch-zoom to read content
   - Comfortable reading experience

2. **Heading Hierarchy**
   - Hero headline should be largest
   - Section headings should be prominent
   - Subheadings should be distinguishable

3. **Responsive Scaling**
   - Text should scale appropriately across breakpoints
   - Hero: `text-4xl sm:text-5xl md:text-6xl`
   - Sections: `text-3xl sm:text-4xl`

### How to Test

1. **Visual Test:**
   - View page on mobile device
   - Hold at comfortable reading distance
   - All text should be legible

2. **Zoom Test:**
   - Start at 100% zoom
   - Read through entire page
   - Should not need to zoom in

3. **DevTools:**
   ```
   1. Inspect text element
   2. Check computed font-size
   3. Body text should be ≥ 16px
   ```

---

## 4. Horizontal Scrolling Test (Req 12.5)

### Goal: Zero Horizontal Scrolling

The page should fit perfectly within the viewport width at all sizes.

### What to Check

1. **No Horizontal Scrollbar**
   - Scroll through entire page vertically
   - Horizontal scrollbar should never appear
   - All content should fit within viewport

2. **Content Constraints**
   - Images should scale to fit
   - Text should wrap properly
   - No fixed-width elements that overflow

3. **Edge Cases**
   - Very narrow viewports (320px)
   - Long words or URLs
   - Code blocks with credentials

### How to Test

1. **Visual Inspection:**
   ```
   1. Set viewport to 375px width
   2. Scroll from top to bottom
   3. Watch for horizontal scrollbar
   4. Check if any content is cut off
   ```

2. **Narrow Viewport Test:**
   ```
   1. Set viewport to 320px (iPhone SE landscape)
   2. Verify all content still fits
   3. Check for any overflow
   ```

3. **Content Overflow Test:**
   ```
   1. Check credential code blocks
   2. Verify they don't overflow
   3. Test copy buttons work
   ```

---

## 5. Component-Specific Tests

### HeroSection

- [ ] Headline scales: `text-4xl` on mobile
- [ ] Buttons stack vertically
- [ ] Buttons are full-width on mobile
- [ ] Phone mockup scales appropriately
- [ ] Error message (if shown) fits viewport

### CoreValuesSection

- [ ] Cards stack in single column
- [ ] Icons are properly sized
- [ ] Text is readable
- [ ] Proper spacing between cards

### HowItWorksSection

- [ ] Steps stack vertically
- [ ] Step numbers and icons visible
- [ ] Connection lines hidden on mobile
- [ ] Text wraps properly

### FeatureGrid

- [ ] Single column on mobile
- [ ] Cards have proper spacing
- [ ] Icons align with text
- [ ] Descriptions are readable

### TechStackSection

- [ ] Kiro section full-width
- [ ] Tech grid shows 2 columns
- [ ] Cards are tappable
- [ ] Legend wraps properly

### RealDataSection

- [ ] Emotional note card readable
- [ ] Screenshots stack vertically (2 cols on tablet)
- [ ] Images scale properly
- [ ] Captions are readable

### VisionProSection

- [ ] HUD screenshot scales properly
- [ ] Caption is readable
- [ ] Technical details stack on mobile
- [ ] Cards have proper spacing

### TestingInstructions

- [ ] Button is full-width on mobile
- [ ] Credentials are easily copyable
- [ ] Copy buttons work
- [ ] Steps are numbered and clear

### FinalCTA

- [ ] Buttons stack vertically
- [ ] Large touch targets
- [ ] Proper spacing
- [ ] Error message (if shown) fits

---

## 6. Real Device Testing

### iOS Testing

**Devices to Test:**
- iPhone SE (small screen)
- iPhone 12/13/14 (standard)
- iPhone 14 Pro Max (large)

**Safari Specific:**
1. Test in Safari browser
2. Test as PWA (Add to Home Screen)
3. Check landscape orientation
4. Test with iOS keyboard visible

### Android Testing

**Devices to Test:**
- Pixel 5 (standard)
- Samsung Galaxy S21 (common)
- Budget Android (360px width)

**Chrome Specific:**
1. Test in Chrome browser
2. Test in Samsung Internet
3. Check landscape orientation
4. Test with Android keyboard visible

---

## 7. Performance on Mobile

### Load Time

- [ ] Hero section loads within 2 seconds
- [ ] Images load progressively
- [ ] No layout shift during load
- [ ] Smooth scrolling

### Interactions

- [ ] Buttons respond immediately to tap
- [ ] Smooth scroll to video section
- [ ] Copy buttons work instantly
- [ ] No lag or jank

---

## 8. Common Issues to Watch For

### Layout Issues

- ❌ Content touching edges (missing padding)
- ❌ Horizontal scrollbar appearing
- ❌ Overlapping elements
- ❌ Text cut off at edges

### Touch Issues

- ❌ Buttons too small to tap
- ❌ Accidental taps on adjacent elements
- ❌ No visual feedback on tap
- ❌ Buttons not responding

### Typography Issues

- ❌ Text too small to read
- ❌ Poor contrast on mobile
- ❌ Text not wrapping properly
- ❌ Headings not scaling

### Image Issues

- ❌ Images not loading
- ❌ Images too large (slow load)
- ❌ Images not scaling
- ❌ Broken aspect ratios

---

## 9. Testing Checklist Summary

### Before Deployment

- [ ] Test on 3+ mobile viewports (375px, 390px, 768px)
- [ ] Verify all buttons meet 44px minimum
- [ ] Check all text is ≥ 16px (body text)
- [ ] Confirm no horizontal scrolling
- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Verify smooth scrolling
- [ ] Check all CTAs work
- [ ] Test copy buttons
- [ ] Verify images load properly

### Sign-Off Criteria

✅ All sections stack vertically on mobile
✅ All touch targets ≥ 44px
✅ All body text ≥ 16px
✅ No horizontal scrolling at any width
✅ Tested on real devices
✅ All interactions work smoothly
✅ Page loads within 2 seconds
✅ No layout issues or bugs

---

## 10. Quick Fix Reference

### If Content Overflows

```tsx
// Add to container
className="max-w-4xl mx-auto px-4"
```

### If Buttons Too Small

```tsx
// Add minimum touch targets
className="min-h-[44px] min-w-[44px] px-8 py-4"
```

### If Text Too Small

```tsx
// Use text-base or larger for body
className="text-base sm:text-lg"
```

### If Horizontal Scroll

```tsx
// Ensure full-width on mobile
className="w-full sm:w-auto"
```

### If Layout Not Stacking

```tsx
// Use mobile-first flex/grid
className="flex flex-col sm:flex-row"
className="grid grid-cols-1 md:grid-cols-2"
```

---

## Testing Complete! ✅

Once all checks pass, the mobile optimization is complete and ready for judges to test on their devices.
