# Debug Guide for Vertical Alignment Issue

## Problem
Horizontal alignment (vertical guides) is working correctly, but vertical alignment (horizontal guides) is not working as expected.

## Changes Made

### 1. Fixed Magnetic Pull Calculation
**Before:**
```typescript
const pullDirection = targetX > newX ? 1 : -1;
snappedX = newX + (pullDirection * magneticPull);
```

**After:**
```typescript
const pullDistance = (targetX - newX) * magneticStrength * attractionStrength;
snappedX = newX + pullDistance;
```

This change ensures that:
- The pull direction is automatically calculated based on the distance
- The magnetic strength is properly applied
- The attraction strength (based on distance) is correctly factored in

### 2. Added Comprehensive Debug Logging

The enhanced system now logs:
- Cache building details (elements found, their positions, snap points)
- Magnetic snapping calculations for both section and element alignments
- Drag operation alignment results

## How to Debug

### Step 1: Enable Debug Logging
The debug logging is now enabled by default. When you drag an element, you should see:

```
🎯 Smart Alignment: Cached X static elements for snapping
   - element-id (Element/Section): WxH at (X, Y)
     Snap points: L=X, C=X, R=X
     Snap points: T=Y, M=Y, B=Y
```

### Step 2: Test Vertical Alignment
1. Open the editor
2. Add a section and some elements
3. Try dragging an element vertically near another element
4. Watch the console for debug messages:
   - `🔥 Element Vertical FULL SNAP` - Full snap occurred
   - `🧲 Element Vertical MAGNETIC` - Magnetic attraction occurred
   - `🎯 Drag Alignment` - Final position after alignment

### Step 3: Check Coordinate System
Verify that:
- **Vertical alignment** affects the **X coordinate** (horizontal positioning)
- **Horizontal alignment** affects the **Y coordinate** (vertical positioning)

This is correct because:
- Vertical guides are vertical lines that help align elements horizontally
- Horizontal guides are horizontal lines that help align elements vertically

### Step 4: Test Different Scenarios

#### Test Case 1: Element to Element Vertical Alignment
1. Add two elements side by side
2. Drag one element vertically to align with the other
3. Should see magnetic attraction when within 16px of alignment
4. Should snap precisely when within 8px

#### Test Case 2: Element to Section Center Vertical Alignment
1. Add a section with an element
2. Drag the element toward the vertical center of the section
3. Should see stronger magnetic attraction (priority 0)
4. Should see `isSnappedToSectionCenter: true` in logs

#### Test Case 3: Multiple Alignment Points
1. Add multiple elements in a column
2. Drag a new element vertically
3. Should see alignment to the nearest element
4. Priority should favor center alignment over edge alignment

## Expected Debug Output

When vertical alignment is working correctly, you should see:

```
🎯 Smart Alignment: Cached 3 static elements for snapping
   - section-1 (Section): 400x300 at (0, 0)
     Snap points: L=0, C=200, R=400
     Snap points: T=0, M=150, B=300
   - element-1 (Element): 100x50 at (50, 100)
     Snap points: L=50, C=100, R=150
     Snap points: T=100, M=125, B=150

🧲 Element Vertical MAGNETIC: active=120, static=100, targetX=50, pullDistance=-14, snappedX=106
🎯 Drag Alignment: (120, 200) -> (106, 200)
🧲 Magnetic Snapping: strength=0.75, section=false
   Original: (120, 200) -> Snapped: (106, 200)
   Vertical snap: true at 100
   Horizontal snap: false at undefined
```

## Troubleshooting

### Issue: No Debug Messages
- Check that elements are being cached (should see cache messages)
- Verify that the dragged element is not filtered out
- Ensure the element is within the proximity threshold (200px for elements, 400px for sections)

### Issue: Magnetic Attraction Not Working
- Check that `snapDistance <= MAGNETIC_THRESHOLD` (16px by default)
- Verify that `attractionStrength` is calculated correctly
- Ensure `magneticStrength` is set (default 0.7)

### Issue: Wrong Direction
- Verify that `pullDistance` calculation is correct
- Check that `targetX` is calculated properly with offset
- Ensure the coordinate system is understood correctly

### Issue: Snapping Too Weak/Strong
- Adjust `magneticStrength` (0-1, default 0.7)
- Modify `MAGNETIC_THRESHOLD` (default 2x snapThreshold)
- Check `attractionStrength` calculation

## Configuration for Testing

For stronger magnetic effect:
```typescript
const smartAlignment = useSmartAlignment({
  query,
  activeNodeId: id,
  snapThreshold: 8,
  autoSnapEnabled: true,
  magneticStrength: 0.9  // Stronger attraction
});
```

For debugging without magnetic effect:
```typescript
const smartAlignment = useSmartAlignment({
  query,
  activeNodeId: id,
  snapThreshold: 8,
  autoSnapEnabled: false  // Disable magnetic snapping
});
```
