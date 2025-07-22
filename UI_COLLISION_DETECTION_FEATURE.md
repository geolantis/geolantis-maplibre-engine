# UI Collision Detection Feature

## Overview
We implemented a comprehensive debug tool to detect and diagnose UI element collisions and layout issues across different screen sizes and DPI settings.

## Problem Statement
- UI elements were colliding on smaller screens
- Layout issues varied depending on device DPI
- Sidebar toggles were overlapping with map controls
- No easy way to diagnose position-related issues across devices

## Solution Implemented

### New Debug Command: `debug screen`
Added a new command to the commandline interface that provides:

1. **Screen Information**
   - Window dimensions (viewport size)
   - Physical screen size
   - Device Pixel Ratio (DPR)
   - Actual pixel resolution
   - Screen orientation
   - Viewport meta tag content

2. **Element Position Tracking**
   - Precise coordinates for all UI elements
   - Size measurements for each component
   - Visibility and display status
   - Corner positions for map controls

3. **Collision Detection**
   - Automatic overlap detection between UI elements
   - Overlap area measurements
   - Near-collision warnings (elements within 5px)
   - Detailed reporting of which elements are colliding

## Technical Details

### Files Modified
- `/src/commandline/commandline-interface.js` - Added new debug command and methods

### Key Methods Added
1. `debugScreenAndElements()` - Main debug information gatherer
2. `checkElementOverlaps()` - Sophisticated overlap detection algorithm

### Detection Algorithm Features
- Filters out invisible elements (0 width/height)
- Checks both exact overlaps and near-collisions
- Provides overlap area dimensions
- Identifies specific elements involved in collisions
- Distinguishes between element types to avoid false positives

## Usage Example
```bash
# In the command line interface
debug screen

# Output includes:
# - Screen metrics and DPI
# - All UI element positions
# - Collision warnings with specific details
# - Near-collision alerts
```

## Benefits
1. **Quick diagnosis** of layout issues on different devices
2. **Precise measurements** for debugging responsive design
3. **Early warning** of potential collisions (near-collision detection)
4. **Comprehensive view** of all UI element positions in one command
5. **DPI awareness** to understand high-density display issues

## Future Enhancements (Potential)
- Visual overlay showing collision areas
- Automatic spacing recommendations
- Export collision report to file
- Real-time collision monitoring mode
- Responsive breakpoint testing

## Related Documentation
- `DEBUG_SCREEN_COMMAND.md` - User documentation for the command
- `UI_ELEMENTS_CATALOG.md` - Complete list of UI elements

## Use Cases
1. **Development** - Test layouts during development
2. **QA Testing** - Verify UI on different screen sizes
3. **Bug Reports** - Include debug output with layout issues
4. **Responsive Design** - Ensure UI scales properly across devices