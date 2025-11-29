# VR UI Style Guide - Matching Web App

## Color Palette

### Primary Background
```swift
Color(red: 0.071, green: 0.071, blue: 0.086) // #121216 - Dark brown/charcoal
```

### Accent/Border Color
```swift
Color(red: 0.961, green: 0.769, blue: 0.373) // #f5c35f - Golden yellow
```

### Text Colors
- Primary text: `.white`
- Secondary text: `Color(red: 0.976, green: 0.863, blue: 0.627)` (#f9dca0 - Light golden)
- Accent text: `Color(red: 0.961, green: 0.769, blue: 0.373)` (#f5c35f - Golden)

## Design Principles

1. **Flat Design**: Minimal shadows, clean backgrounds
2. **Golden Accents**: Use #f5c35f for borders and highlights
3. **Dark Brown Base**: Use #121216 for all panel backgrounds
4. **Consistency**: Match web app's minimalist aesthetic

## Implementation Status

✅ Background colors updated to #121216
✅ Border colors updated to #f5c35f with 0.2 opacity
✅ Shadows disabled in ShadowRenderer
✅ Panel hover effects preserved (no shadows)

## Files Updated
- FloatingPanelsView.swift - All panel backgrounds
- StatDetailModal.swift - Modal backgrounds
- PanelHoverModifier.swift - Removed shadow from hover effect
- ShadowRenderer.swift - Disabled by default
