# UI Elements Catalog

This document provides a comprehensive list of all UI elements in the map application for easy reference and discussion.

## Main UI Elements Catalog

### Primary Layout
- **Map Container** (`#map`) - Main MapLibre GL map view

### Left Sidebars
1. **Documents** (`#left1-drawer`) - Base maps, overlays, tools
   - Basemap controls (`#basemap-controls`)
   - Overlay controls (various toggle buttons)
   - Tools placeholder

2. **Settings** (`#left2-drawer`) - Map/UI preferences, themes
   - Map settings switches (rotation, pitch, buildings, etc.)
   - UI settings switches (zoom controls, scale, units)
   - Background transparency slider
   - Button size controls (custom)
   - Button color theme controls (custom)

3. **Search** (`#left3-drawer`) - Location search interface
   - Search input (`#map_search_input`)
   - Search button (`#search_button`)
   - Map extent filter button (`#search_button_mapExtend`)
   - Search results container (`#map_search_results`)

4. **Feature Layers** (`#left4-drawer`) - Layer visibility/selection
   - Layer search input (`#layerSearchInput`)
   - Master visibility checkbox (`#masterVisibleCheckbox`)
   - Master selectable checkbox (`#masterSelectableCheckbox`)
   - Feature categories container (`#featureLayersContainer`)

### Right Sidebars
1. **Object Info** (`#right1-drawer`) - Feature details display
   - Custom web component: `<object-info>`
   - File: `/src/components/objectinfo-component.js`

2. **StakeOut** (`#right2-drawer`) - Navigation/targeting interface
   - Arrow container (`#arrow-container`)
   - Total distance display (`#total-distance`)
   - File: `/src/StakeOutUI.js`

### Map Controls
- **Logo Control** - Animated Geo360 logo (top-left)
- **Terrain Control** - 3D terrain toggle (`.maplibregl-ctrl-terrain`)
- **Zoom Control** - Custom zoom with level display
- **Navigation Control** - Compass/pitch controls
- **Scale Control** - Distance scale indicator
- **Fullscreen Control** - Fullscreen toggle
- **Dynamic Button** - Expandable action menu (Navigate, Measure, Inspect, Settings)

### Footer Components
- **Status Footer** (`<status-footer>`) - GPS status, coordinates, device info
  - Device info display
  - Time indicator
  - RTK status indicator
  - Accuracy indicator
  - Expandable sections (Coordinates, Status, Device)

### Overlays & Menus
- **Context Menu** - Right-click menu for map/features
  - Class: `g360-context-menu-container`
  - File: `/src/ui/app.ui.contextmenu.js`

- **Radial Menu** - Circular feature action menu
  - Actions: Select, Collect, Construct, Measure, Info, Stake Out
  - File: `/src/ui/app.ui.radialmenu.js`

- **Feature Selector** - Multi-feature selection dialog
  - Container: `#feature-selector-container`
  - File: `/src/ui/app.ui.featureselector.js`

- **Command Line** - Developer console interface
  - Container: `#cli-container`
  - File: `/src/commandline/commandline-interface.js`

### Visual Indicators
- **Accuracy Circle** - GPS accuracy visualization
  - Layer ID: `accuracy-circle`
  - File: `/src/map/app.map.navigation.js`

- **Location Marker** - Current position indicator
  - Layer ID: `user-location`
  - File: `/src/map/app.map.navigation.js`

- **StakeOut Circles** - Distance-based navigation rings
  - File: `/src/features/stakeout/circle-rendering.js`

### Toggle Buttons
- **Sidebar Toggles** - Icon buttons to open/close sidebars
  - Left sidebar toggles: Globe, Layers, Settings, Search icons
  - Right sidebar toggles: Info, Target/Goal icons
  - Container: `.sidebar-toggle-group` and `.sidebar-toggle-group-right`

- **GNSS Simulator** - Toggle GPS simulation
  - Container: `.gnss-button-container`
  - File: `/src/commandline/commandline-buttons-extension.js`

- **Snapping Toggle** - Enable/disable feature snapping
  - Container: `.snapping-button-container`
  - File: `/src/commandline/commandline-buttons-extension.js`

### Custom Components
- **Basemap Selector Component** (`<basemap-selector>`)
  - File: `/src/components/basemap-selector-component.js`
  - Custom basemap selection UI

### Search Components
- **Map Search (Geocoder)** - Location search with autocomplete
  - Class: `MaplibreGeocoder`
  - Loaded via CDN

- **Local Search** - Custom search implementation
  - Module: `App.UI.Search`
  - File: `/src/ui/app.ui.search.js`

### UI Bridges and Integrations
- **Object Info Bridge** (`window.objectInfoBridge`)
  - File: `/src/ui-bridge.js`
  - Connects features to object info display

- **Shoelace Bridge** - Web component integration layer
  - File: `/src/shoelace-bridge.js`

### Mobile-Specific UI
- **Responsive Sidebar Behavior**
  - CSS: `/src/css/mobile-overrides.css`
  - Mobile-optimized sidebar widths and transitions

- **Touch Controls**
  - Various touch event handlers for mobile gesture support

## File Locations Reference

### Main Files
- `/index.html` - Main HTML structure
- `/src/app.js` - Main application entry point

### UI Module Files
- `/src/ui/app.ui.contextmenu.js` - Context menu
- `/src/ui/app.ui.controls.js` - UI controls
- `/src/ui/app.ui.dynamicbutton.js` - Dynamic button control
- `/src/ui/app.ui.featureselector.js` - Feature selector
- `/src/ui/app.ui.footer.js` - Footer utilities
- `/src/ui/app.ui.radialmenu.js` - Radial menu
- `/src/ui/app.ui.search.js` - Search functionality
- `/src/ui/app.ui.sidebar.js` - Sidebar management
- `/src/ui/app.ui.status.js` - Status display

### Component Files
- `/src/components/basemap-selector-component.js` - Basemap selector
- `/src/components/objectinfo-component.js` - Object info display
- `/src/components/status-footer-component.js` - Status footer

### Map Control Files
- `/src/map/app.map.controls.js` - Map controls implementation
- `/src/map/app.map.terrain.js` - Terrain functionality

### CSS Files
- `/src/css/styles.css` - Main styles
- `/src/css/modernstyle.css` - Modern UI styles
- `/src/css/responsive-sidebar.css` - Responsive sidebar styles
- `/src/css/mobile-overrides.css` - Mobile-specific styles
- `/src/css/button-themes.css` - Button theming
- `/src/css/terrain-control.css` - Terrain control styles