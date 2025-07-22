# Unused Functions Analysis

## Summary
- **Total Unused Functions**: 79 (excluding library files)
- **Date**: January 7, 2025

## Most Affected Modules

### Map Module (35 unused functions)
- **app.map.events.js** (7): `clearSelection`, `getSelectedFeature`, `clearAllHighlights`, `highlightFeature`, `getFeaturesByProperty`, `getHighlightedFeatures`, `removeHighlight`
- **app.map.featureenhancer.js** (5): `setNodeSize`, `setShowDistances`, `setShowAreas`, `setSnapOptions`, `debugLayers`
- **app.map.overlay.js** (5): `updateVisibleOverlays`, `toggleOverlay`, `addTooltip`, `createTooltipElement`, `positionTooltip`
- **app.map.basemap.js** (3): `switchBasemapFromGUI`, `getAvailableBasemaps`, `getBasemapInfo`
- **app.map.init.js** (3): `isMapReady`, `getMapInstance`, `getMapConfig`
- **app.map.layers.js** (3): `updateLayerOpacity`, `toggleLayerGroup`, `getLayersByGroup`
- **app.map.navigation.js** (3): `saveView`, `restoreView`, `clearSavedViews`
- **app.map.coordinates.js** (2): `getCoordinateAtPixel`, `formatCoordinate`
- **app.map.controls.js** (2): `updateControlsVisibility`, `getControlState`
- **app.map.labels.js** (1): `updateLabelVisibility`
- **app.map.settings.js** (1): `applySettings`

### UI Module (18 unused functions)
- **app.ui.radialmenu.js** (4): `setPosition`, `getPosition`, `isVisible`, `destroy`
- **app.ui.controls.js** (3): `updateButtonState`, `registerControl`, `unregisterControl`
- **app.ui.sidebar.js** (3): `toggleSection`, `expandSection`, `collapseSection`
- **app.ui.featureselector.js** (2): `clearSelection`, `getSelectedFeatures`
- **app.ui.dynamicbutton.js** (2): `updateButtonVisibility`, `getButtonState`
- **app.ui.search.js** (2): `clearSearchResults`, `getSearchHistory`
- **app.ui.contextmenu.js** (1): `hideContextMenu`
- **app.ui.footer.js** (1): `updateFooterContent`

### Bridge Module (9 unused functions)
- **bridgeInterfaceML.js** (5): `setBackgroundLayer`, `createBasemapControls2`, `applyColorScheme`, `hexToRgba`, `getPixelColor`
- **app.bridge.js** (4): `getBasemapSelectionState`, `setBasemapSelectionState`, `createBasemapOptions`, `clearBasemapOptions`

### Core Module (6 unused functions)
- **app.core.persistence.js** (3): `saveState`, `loadState`, `clearState`
- **app.core.debug.js** (2): `enableDebugMode`, `disableDebugMode`
- **app.core.config.js** (1): `resetConfig`

### Features Module (6 unused functions)
- **app.features.stakeout.js** (3): `pauseStakeout`, `resumeStakeout`, `getStakeoutStatus`
- **app.features.gnss.js** (2): `resetGNSSData`, `getGNSSHistory`
- **at-bev-festpunkte.js** (1): `clearCache`

### Utils Module (5 unused functions)
- **app.utils.coordinates.js** (2): `convertToWGS84`, `convertFromWGS84`
- **app.utils.js** (2): `deepClone`, `debounce`
- **app.utils.debug.js** (1): `logPerformance`

## Root Level Files
- **demodata.js** (3): `createGeoJSON`, `generateRandomGeoJSON`, `getGeoJSONTemplate`
- **app.js** (2): `devInit`, `cleanupApp`
- **index.js** (3): `testHighlight`, `logState`, `cleanupResources`

## Patterns Observed

### 1. Getter/Setter Pairs
Many unused functions are part of getter/setter pairs that might have been intended for state management but never implemented:
- `getBasemapSelectionState`/`setBasemapSelectionState`
- `getPosition`/`setPosition`
- `getButtonState`/`updateButtonState`

### 2. Debug/Development Functions
- `debugLayers`, `testHighlight`, `devInit`, `logState`, `logPerformance`
- These appear to be development utilities that could be removed in production

### 3. Incomplete Features
Some functions appear to be part of incomplete or abandoned features:
- Overlay management methods
- Saved view functionality
- State persistence system

### 4. Legacy Bridge Code
The bridge interface contains several unused functions that might be remnants of an older API:
- `createBasemapControls2` (note the "2" suffix)
- `applyColorScheme`
- `setBackgroundLayer`

## Recommendations

### Immediate Actions
1. **Remove obvious dead code**:
   - Debug/test functions that are clearly not needed
   - Duplicate or superseded functions (e.g., `createBasemapControls2`)

2. **Document retention reasons**:
   - Add comments explaining why unused functions are kept
   - Mark functions intended for future features

3. **Check for dynamic usage**:
   - Some functions might be called via string references
   - Review event handlers and dynamic method calls

### Long-term Improvements
1. **Code organization**:
   - Move experimental code to separate modules
   - Create a dedicated debug/development module

2. **API cleanup**:
   - Review and consolidate the bridge interface
   - Remove or update legacy compatibility code

3. **Feature completion**:
   - Either complete or remove partially implemented features
   - Document the intended functionality of incomplete features