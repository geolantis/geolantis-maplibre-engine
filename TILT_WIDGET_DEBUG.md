# GLRM Tilt Widget Debug Guide

## What Should You See?

When the GLRM tilt widget is working properly, you should see:

### 1. Widget Appearance
- **Position**: Top-right corner of the map (fixed position)
- **Size**: 120px wide, initially 40px tall (collapsed)
- **Background**: Dark gray gradient with subtle border
- **Handle**: "GLRM Tilt" title with a horizontal bar at the top

### 2. Widget Content (When Expanded)
- **Circular Tilt Indicator**: 
  - White circle with crosshair lines
  - Green bubble (dot) that moves based on tilt angle and azimuth
  - Bubble color changes: Green (0-15°), Orange (15-30°), Red (>30°)
  
- **Digital Readout**:
  - "Angle: X.X°" (shows current tilt angle)
  - "Azimuth: N XX°" (shows compass direction)
  - "Status: Active/Calibrating/Inactive" with colored indicator

### 3. Widget Behavior
- **Draggable**: Click and drag the handle to move the widget
- **Collapsible**: Click the handle to expand/collapse content
- **Auto-hide**: Widget is hidden when GLRM is not connected

## Current Issue: Black Rectangle

If you see a black rectangle instead of the widget content, it means:

1. **Widget CSS Issue**: The styles are not being applied correctly
2. **Content Not Expanded**: The widget is created but content is hidden
3. **Display State**: The widget is not properly shown/expanded

## Testing Steps

### 1. Open Test Page
Open `test-tilt-widget.html` in a browser to test the widget in isolation.

### 2. Check Console Logs
Look for these debug messages:
```
[TiltDisplayWidget] Initializing...
[TiltDisplayWidget] Widget styles applied
[TiltDisplayWidget] Initialized successfully
[TiltDisplayWidget] showWidget() called
[TiltDisplayWidget] Widget display set to block
[TiltDisplayWidget] _toggleExpanded() called, isExpanded: true
[TiltDisplayWidget] Widget expanded, height: 160px
```

### 3. Test Functions
Use these functions to test the widget:
- `App.UI.TiltDisplayWidget.initialize()` - Initialize the widget
- `App.UI.TiltDisplayWidget.showWidget()` - Show the widget
- `App.UI.TiltDisplayWidget.testWidget()` - Show with test data
- `App.UI.TiltDisplayWidget.updateTiltData(15, 120, 'active')` - Update with data

### 4. Expected Widget Structure
```
tilt-display-widget (120px × 160px when expanded)
├── tilt-handle (40px height)
│   ├── handle-bar (visual indicator)
│   └── tilt-title ("GLRM Tilt")
└── tilt-content (hidden initially)
    ├── tilt-indicator-container
    │   └── svg (circular indicator with bubble)
    └── tilt-readout
        ├── tilt-angle ("Angle: X.X°")
        ├── tilt-azimuth ("Azimuth: N XX°")
        └── tilt-status ("Status: Active")
```

## Integration Points

### Android Side
- `ActGeolantis.toggleGLRMTilt()` - Toggles tilt activation
- `BLEMultipleManager.sendGLRMTiltCommand()` - Sends tilt command to device
- `GeoObjectDialogs.java` - Shows tilt button in BT menu

### JavaScript Side
- `BridgeInterface.setGLRMTiltEnabled(enabled)` - Show/hide widget
- `BridgeInterface.updateGLRMTiltData(lng, lat, angle, azimuth, status)` - Update data
- `App.UI.TiltDisplayWidget` - Widget module

## Common Issues

1. **Widget Not Showing**: Check if `showWidget()` is called
2. **Black Rectangle**: Check CSS styles and content expansion
3. **No Data**: Verify `updateTiltData()` is called with valid data
4. **Not Draggable**: Check event handlers are properly bound

## Resolution Steps

1. **Check Browser Console**: Look for JavaScript errors
2. **Verify Widget Creation**: Ensure widget DOM element exists
3. **Test Expansion**: Click the handle to expand/collapse
4. **Check Styles**: Inspect CSS properties in browser dev tools
5. **Test Data Updates**: Call `updateTiltData()` with test values