# Fix Integration Guide

This guide explains how to integrate all the fixes into the map engine's modular architecture.

## Overview of Fixes

1. **StakeOut Circle Rendering** - Ensures circles render correctly at all zoom levels
2. **Sidebar Toggle Fix** - Fixes sidebar visibility and button positioning  
3. **Status Footer Visibility** - Ensures the footer is always visible
4. **Measurement Text Display** - Forces TerraDraw measurement labels to appear
5. **Map Glyphs Fix** - Adds missing font glyphs for text rendering
6. **Dynamic Button Positioning** - Adjusts measurement control position relative to dynamic buttons

## Integration Architecture

### 1. StakeOut Integration (app.features.stakeout.js)

**Key Integration Points:**
- Initialize method: `App.Features.StakeOut.initialize(map)`
- Main update cycle: Uses intervals for position updates (200ms) and UI updates (200ms)
- Circle rendering: `_createOrUpdateMapLibreCircles()` handles all circle layer creation
- GPS integration: `updateCurrentLocation(lng, lat)` receives position updates

**Integration with other modules:**
- Connects to GPS via `App.Features.GPSListener` or hooks into `App.Map.Navigation.updateGPSLocation`
- Uses `App.UI.DynamicButton` for mode switching
- Triggers events via `App.Core.Events`

### 2. Sidebar Fix Integration (app.ui.sidebar.js + sidebar-fix.js)

**Key Integration Points:**
- Initialize method: `App.UI.Sidebar.initialize(map)`
- Toggle method: `App.UI.Sidebar.toggleSidebar(sidebarId)`
- State tracking: `_activeSidebars` object tracks open sidebars

**The sidebar-fix.js overrides:**
- Replaces `window.interface.toggleSidebar` with fixed implementation
- Adds drawer event listeners for sl-drawer components
- Updates map padding via `map.easeTo()`
- Repositions map controls based on sidebar state

### 3. Status Footer Integration (status-footer-component.js)

**Key Integration Points:**
- Web Component: `<status-footer>` custom element
- Update methods: `updateStatusBar()`, `updateCoordinates()`, `updateGnssInfo()`, `updateDeviceInfo()`
- Visibility toggle: `toggleExpanded()` shows/hides expanded sections

**Footer visibility fix:**
- Forces CSS positioning to ensure visibility
- Adjusts map bottom spacing to prevent overlap
- Moves bottom controls up to accommodate footer

### 4. Measurement Text Fix (app.features.measure.js + terradraw-text-fix.js)

**Key Integration Points:**
- Initialize: `App.Features.Measure.initialize(map)`
- Start/stop: `startMeasurement()`, `stopMeasurement()`
- Mode management: Integrates with `App.UI.DynamicButton.setMode()`

**TerraDraw text fix:**
- Overrides `MaplibreTerradrawControl.MaplibreMeasureControl` constructor
- Forces text display options to be enabled
- Monitors map sources for measurement data
- Creates custom markers when TerraDraw labels fail

### 5. Glyphs Fix Integration (app.map.glyphs-fix.js)

**Key Integration Points:**
- Auto-initializes on DOM ready
- Monitors map style changes via `App.Core.Events`
- Checks map instance via `App.Map.Init.getMap()`

**Fix implementation:**
- Adds missing glyphs URL to map styles
- Uses MapTiler's public font service as fallback
- Triggers on style changes and map initialization

### 6. Dynamic Button Integration (app.ui.dynamicbutton.js)

**Key Integration Points:**
- Initialize: `App.UI.DynamicButton.initialize(map)`
- Create control: Returns MapLibre control object
- Mode switching: `setMode('default' | 'navigation' | 'measure')`
- Action handlers: `onAction(actionName, handler)`

**Button positioning:**
- Uses CSS classes for dynamic sizing
- Calculates spacing based on computed button dimensions
- Triggers `buttonSize:changed` event when resized

## Implementation Steps

### Step 1: Core Module Updates

1. **Update App.Core.Init**
   - Add initialization calls for all fix modules
   - Ensure proper loading order

2. **Update App.Core.Events**
   - Add new event types if needed:
     - `stakeout:started`, `stakeout:stopped`
     - `buttonSize:changed`
     - `map:glyphsFixed`

### Step 2: Map Module Integration

1. **In App.Map.Init**
   - After map creation, initialize glyphs fix
   - Ensure map reference is available to all modules

2. **Create App.Map.GlyphsFix module**
   - Add as separate module file
   - Auto-initializes when loaded

### Step 3: Feature Module Updates

1. **Update App.Features.StakeOut**
   - Already contains all necessary fixes
   - Ensure GPS integration is working
   - Connect to dynamic button events

2. **Update App.Features.Measure**
   - Text fix is handled by separate terradraw-text-fix.js
   - Ensure proper integration with dynamic button

### Step 4: UI Module Updates

1. **Update App.UI.Sidebar**
   - Module is already updated with proper logic
   - sidebar-fix.js provides immediate override

2. **Update App.UI.DynamicButton**
   - Already contains button size event triggers
   - Integrates with measurement positioning

### Step 5: Component Integration

1. **Status Footer Component**
   - Already a self-contained web component
   - footer-visibility-fix.js ensures visibility

2. **Load Order in index.html**
   ```html
   <!-- Core modules first -->
   <script src="src/core/app.core.init.js"></script>
   <script src="src/core/app.core.events.js"></script>
   
   <!-- Map modules -->
   <script src="src/map/app.map.init.js"></script>
   <script src="src/map/app.map.glyphs-fix.js"></script>
   
   <!-- UI modules -->
   <script src="src/ui/app.ui.sidebar.js"></script>
   <script src="src/ui/app.ui.dynamicbutton.js"></script>
   
   <!-- Feature modules -->
   <script src="src/features/app.features.stakeout.js"></script>
   <script src="src/features/app.features.measure.js"></script>
   
   <!-- Fix scripts (load after modules) -->
   <script src="src/fixes/sidebar-fix.js"></script>
   <script src="src/features/terradraw-text-fix.js"></script>
   <script src="src/features/adjust-measurement-position.js"></script>
   <script src="src/footer-visibility-fix.js"></script>
   
   <!-- Integration scripts -->
   <script src="src/features/stakeout/master-integration.js"></script>
   ```

## Testing Integration

### 1. StakeOut Testing
- Select a polygon feature
- Start navigation via dynamic button
- Verify circles render at all zoom levels
- Check GPS updates move circles correctly

### 2. Sidebar Testing
- Toggle each sidebar
- Verify only one per side opens
- Check map padding updates
- Verify control positions adjust

### 3. Footer Testing
- Verify footer is visible on load
- Test expand/collapse functionality
- Check map bottom spacing
- Verify controls don't overlap

### 4. Measurement Testing
- Start measurement mode
- Draw lines and polygons
- Verify text labels appear
- Check positioning below dynamic buttons

### 5. Integration Testing
- Test all features together
- Verify no conflicts between modules
- Check performance with all fixes active

## Module Dependencies

```
App.Core.Init
├── App.Map.Init
│   └── App.Map.GlyphsFix
├── App.UI.Sidebar
│   └── sidebar-fix.js (override)
├── App.UI.DynamicButton
│   └── adjust-measurement-position.js
├── App.Features.StakeOut
│   └── master-integration.js
├── App.Features.Measure
│   └── terradraw-text-fix.js
└── Components
    ├── status-footer-component.js
    └── footer-visibility-fix.js
```

## Event Flow

1. **Map Initialization**
   - `map:initialized` → Initialize all modules
   - `map:styleChanged` → Apply glyphs fix

2. **Feature Selection**
   - `feature:selected` → Store in state
   - User clicks "Start Navigation" → StakeOut activates

3. **GPS Updates**
   - GPS position received → `GPSListener` broadcasts
   - StakeOut receives update → Updates circles
   - UI updates at controlled rate (5Hz)

4. **Mode Changes**
   - Dynamic button mode change → Update UI
   - Measurement start → Position control
   - StakeOut start → Switch to navigation mode

## Best Practices

1. **Module Independence**
   - Each module should work standalone
   - Use events for inter-module communication
   - Avoid direct module dependencies

2. **Performance**
   - Use throttling/debouncing for frequent updates
   - Batch DOM operations
   - Clean up resources on module destroy

3. **Error Handling**
   - Check for module existence before calling
   - Provide fallbacks for missing dependencies
   - Log errors for debugging

4. **State Management**
   - Use App.Core.State for shared state
   - Subscribe to state changes
   - Avoid global variables

## Troubleshooting

### Common Issues

1. **Circles not rendering**
   - Check if map style has been updated
   - Verify GPS coordinates are valid
   - Check console for layer errors

2. **Sidebar toggle not working**
   - Ensure sidebar-fix.js is loaded
   - Check if drawer components are initialized
   - Verify button click handlers are attached

3. **Footer not visible**
   - Check z-index conflicts
   - Verify footer-visibility-fix.js is loaded
   - Ensure custom element is defined

4. **Measurement text missing**
   - Check if TerraDraw library is loaded
   - Verify text fix is applied after library load
   - Check for font/glyph issues

5. **Button positioning issues**
   - Ensure CSS is loaded in correct order
   - Check for CSS variable overrides
   - Verify button size calculations