# Debug Screen Command Documentation

## Overview
The `debug screen` command provides comprehensive information about screen dimensions, DPI, and UI element positions to help diagnose layout issues on different devices and screen sizes.

## Usage
```
debug screen
```

## Output Information

### Screen Information
- **Window Size**: Current browser window dimensions (innerWidth x innerHeight)
- **Screen Size**: Physical screen dimensions
- **Available Screen**: Usable screen area (excluding taskbars, etc.)
- **Device Pixel Ratio (DPR)**: Pixel density multiplier
- **Actual Resolution**: True pixel resolution (window size × DPR)
- **Screen Orientation**: Current orientation (portrait/landscape)
- **Viewport Meta**: Content of viewport meta tag

### Element Position Reports

#### Sidebar Toggles
For each sidebar toggle button, displays:
- Position (x, y coordinates)
- Size (width x height)
- Display property
- Visibility status

#### Map Controls
For each map control (Logo, Zoom, Navigation, Scale, Fullscreen, Terrain, Feature Toggle, Dynamic Button):
- Position (x, y coordinates)
- Size (width x height)
- Corner location (top-left, top-right, bottom-left, bottom-right)

#### Status Footer
- Position and size
- Display and visibility properties

### Overlap Detection
Automatically checks for overlapping UI elements and reports any collisions between:
- Sidebar toggle buttons
- Map controls
- Other UI elements

## Example Output
```
=== Screen & Element Debug Info ===
Screen Information:
  Window Size: 1024 x 768px
  Screen Size: 1920 x 1080px
  Available Screen: 1920 x 1040px
  Device Pixel Ratio (DPR): 2
  Actual Resolution: 2048 x 1536px
  Screen Orientation: landscape-primary
  Viewport Meta: width=device-width, initial-scale=1.0

Sidebar Toggle Positions:
  Left Toggle 1:
    Position: 10, 80
    Size: 48 x 48px
    Display: flex
    Visibility: visible
  ...

Map Control Positions:
  Zoom Control:
    Position: 10, 140
    Size: 29 x 87px
    Corner: top-left
  ...

Checking for element overlaps...
  ⚠️ Overlap detected: Sidebar Toggle <-> Zoom Control
```

## Use Cases
1. **Debugging layout issues on different screen sizes**
   - Identify when elements overlap on smaller screens
   - Check element positions at different resolutions

2. **Testing responsive design**
   - Verify element positioning across devices
   - Ensure UI elements scale properly with different DPRs

3. **Troubleshooting visibility issues**
   - Check if elements are positioned off-screen
   - Verify display and visibility properties

## Tips
- Run this command on different devices to compare layouts
- Use in combination with browser developer tools for comprehensive debugging
- Check after orientation changes on mobile devices
- Test with different zoom levels to ensure UI remains functional