# Smart Alignment System Enhancement

## Overview

The smart alignment system has been enhanced with automatic magnetic snapping functionality that provides smooth, intuitive element positioning during drag operations. This enhancement maintains the existing 6-point alignment system while adding magnetic attraction to alignment guides.

## Key Features

### 1. Magnetic Auto-Snapping
- **Automatic Attraction**: Elements are magnetically attracted to alignment guides when within the magnetic threshold (2x snap threshold)
- **Smooth Transition**: Gradual pull towards alignment points rather than instant snapping
- **Configurable Strength**: Magnetic strength can be adjusted (0-1 scale, default: 0.7)

### 2. Enhanced Visual Feedback
- **Section Center Guides**: Special visual feedback when elements align with section centers
- **Snap Strength Indication**: Visual guides intensity reflects the strength of magnetic attraction
- **Progressive Attraction**: Stronger pull as elements get closer to alignment points

### 3. Improved User Experience
- **Seamless Integration**: Works with existing drag operations without breaking changes
- **Performance Optimized**: Uses cached snapping points for smooth performance
- **Threshold-Based**: Different thresholds for full snap vs magnetic attraction

## Technical Implementation

### Core Components

#### 1. Enhanced `useSmartAlignment` Hook

```typescript
interface SmartAlignmentResult {
  x: number;
  y: number;
  hasVerticalSnap: boolean;
  hasHorizontalSnap: boolean;
  verticalSnapPosition?: number;
  horizontalSnapPosition?: number;
  isSnappedToSectionCenter?: boolean;  // NEW
  snapStrength?: number;               // NEW (0-1)
}

interface UseSmartAlignmentProps {
  query: any;
  activeNodeId: string;
  snapThreshold?: number;
  autoSnapEnabled?: boolean;           // NEW
  magneticStrength?: number;           // NEW (0-1)
}
```

#### 2. Magnetic Snapping Algorithm

The magnetic snapping uses a two-tier approach:

1. **Full Snap Zone** (within `snapThreshold`): Instant precise alignment
2. **Magnetic Zone** (within `magneticThreshold`): Gradual attraction with formula:
   ```typescript
   attractionStrength = 1 - (snapDistance / MAGNETIC_THRESHOLD)
   magneticPull = snapDistance * magneticStrength * attractionStrength
   ```

#### 3. Priority System

- **Section Centers**: Highest priority (priority: 0) with larger threshold
- **Element Centers**: Medium priority (priority: 1)
- **Edge Alignments**: Lower priority (priority: 2-3)

### Integration Points

#### 1. Drag Operations (`useDragging.ts`)
```typescript
const smartAlignment = useSmartAlignment({
  query,
  activeNodeId: id,
  snapThreshold: SNAP_THRESHOLD,
  autoSnapEnabled: true,
  magneticStrength: 0.7
});

// Enhanced visual feedback
const shouldShowGuides = snappedPosition.hasVerticalSnap || 
                        snappedPosition.hasHorizontalSnap || 
                        (snappedPosition.snapStrength && snappedPosition.snapStrength > 0.3);
```

#### 2. Visual Guides (`SmartAlignmentGuides.tsx`)
- Automatically displays guides when magnetic attraction is active
- Enhanced section center guide visibility
- Responsive guide intensity based on snap strength

## Configuration Options

### Default Settings
```typescript
{
  snapThreshold: 8,           // Pixels for full snap
  autoSnapEnabled: true,      // Enable magnetic snapping
  magneticStrength: 0.7,      // Magnetic pull strength (0-1)
  magneticThreshold: 16       // Pixels for magnetic attraction (2x snapThreshold)
}
```

### Customization
```typescript
// Disable magnetic snapping (fallback to original behavior)
const smartAlignment = useSmartAlignment({
  query,
  activeNodeId: id,
  autoSnapEnabled: false
});

// Adjust magnetic strength for different feel
const smartAlignment = useSmartAlignment({
  query,
  activeNodeId: id,
  magneticStrength: 0.5  // Gentler attraction
});
```

## Performance Optimizations

1. **Cached Snapping Points**: Static elements cached during drag operations
2. **Proximity Filtering**: Only considers elements within 200px (400px for sections)
3. **Efficient Distance Calculations**: Optimized distance calculations for performance
4. **Cache Management**: Automatic cache clearing after drag operations

## Debugging

Enable debug logging by uncommenting the console.log statements in the code:

```typescript
// In applyMagneticSnapping
if (snapStrength > 0) {
  console.log(`🧲 Magnetic Snapping: strength=${snapStrength.toFixed(2)}, section=${isSnappedToSectionCenter}`);
}
```

## Testing

Basic test suite included in `__tests__/useSmartAlignment.test.ts`:
- Initialization tests
- Magnetic attraction verification
- Cache management tests
- Resize operation tests

## Backward Compatibility

The enhancement is fully backward compatible:
- Existing drag operations continue to work unchanged
- Original snap behavior available when `autoSnapEnabled: false`
- All existing APIs maintained
- No breaking changes to component interfaces

## Future Enhancements

Potential improvements for future versions:
1. **Adaptive Thresholds**: Dynamic thresholds based on zoom level
2. **Multi-Element Snapping**: Simultaneous alignment to multiple guides
3. **Custom Snap Points**: User-defined alignment points
4. **Animation Curves**: Configurable magnetic attraction curves
