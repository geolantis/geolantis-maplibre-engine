# Geolantis360 App Architecture Documentation

## Overview

This document describes the architecture of the MapLibre-based Geolantis360 mapping application after refactoring from a monolithic structure to a modular pattern using traditional JavaScript patterns (no ES6 modules).

## Architectural Principles

The refactored application follows these key principles:

1. **Namespaced Modules**: All code is organized within the `App` namespace
2. **Revealing Module Pattern**: Private variables and functions are encapsulated
3. **Separation of Concerns**: Code is divided by functionality
4. **Backward Compatibility**: Legacy code continues to work through bridge interfaces

## Module Structure

The application is organized into the following namespaces:

### App.Core

Core functionality that manages the application lifecycle:

- `App.Core.Config` - Configuration management
- `App.Core.Events` - Event handling system
- `App.Core.Init` - Application initialization

### App.Map

Map-related functionality:

- `App.Map.Init` - Map initialization and lifecycle
- `App.Map.Layers` - Layer management (create, add, remove, style)
  - **New Zoom Functions**:
    - `zoomToGeoJsonExtent(sourceId, options)` - Zooms to a single GeoJSON layer's extent
    - `zoomToMultipleGeoJsonExtents(sourceIds, options)` - Zooms to multiple layers' combined extent
    - `zoomToAllGeoJsonFeatures(options)` - Zooms to all GeoJSON features on the map
- `App.Map.Controls` - Map control management
- `App.Map.Navigation` - Map navigation and positioning
- `App.Map.Overlay` - Overlay layer management
- `App.Map.Basemap` - Basemap selection and management
- `App.Map.Terrain` - Terrain and 3D functionality
- `App.Map.Coordinates` - Coordinate transformations and calculations
- `App.Map.Events` - Map-specific event handling

### App.UI

User interface components:

- `App.UI.Controls` - UI control creation and management
- `App.UI.Sidebar` - Sidebar management (toggle, content)
- `App.UI.Search` - Search functionality
- `App.UI.Footer` - Footer management

### App.Utils

Utility functions:

- `App.Utils` - General utilities
- `App.Utils.Coordinates` - Coordinate utilities
- `App.Utils.Bridge` - Bridge utilities for legacy code

### App.Bridge

Bridge to external systems and legacy code:

- `App.Bridge.Interface` - Bridge to the legacy BridgeInterface

### App.Features

Feature-specific functionality:

- `App.Features.StakeOut` - StakeOut feature
- `App.Features.GNSS` - GNSS-related functionality

## Module Dependencies

```
App.Core.Init
  ├── App.Core.Config
  └── App.Core.Events
      
App.Map.Init
  ├── App.Core.Config
  ├── App.Core.Events
  └── App.Map.Layers
      
App.Map.Controls
  ├── App.Map.Init
  └── App.Core.Events
      
App.UI.Sidebar
  ├── App.Map.Init
  └── App.Core.Events
      
App.Bridge.Interface
  ├── App.Map.Init
  ├── App.Map.Layers
  ├── App.Map.Controls
  ├── App.Map.Basemap
  ├── App.Map.Navigation
  ├── App.UI.Sidebar
  └── App.UI.Search
```

## Key Patterns

### Revealing Module Pattern

Each module follows the Revealing Module Pattern to encapsulate private functionality:

```javascript
App.Some.Module = (function() {
    // Private variables and functions
    var _privateVar = 'value';
    
    function _privateFunction() {
        // ...
    }
    
    // Public API
    return {
        publicFunction: function() {
            // Can access private variables and functions
            _privateFunction();
            return _privateVar;
        }
    };
})();
```

### Initialization Pattern

Modules are initialized in a consistent way:

```javascript
SomeModule.initialize = function(dependencies) {
    // Store dependencies
    _dependency = dependencies.someRequiredObject;
    
    // Set up event handlers
    _setupEventHandlers();
    
    // Initialization logic
    
    console.log('Module initialized');
};
```

### Event Communication

Modules communicate through the events system:

```javascript
// Publishing an event
App.Core.Events.trigger('map.layerAdded', layerData);

// Subscribing to an event
App.Core.Events.on('map.layerAdded', function(layerData) {
    // Handle the event
});
```

## Backward Compatibility

The refactored code maintains backward compatibility through:

1. **Global Interface Object**: The `window.interface` object is maintained for legacy code
2. **Bridge Interface Module**: `App.Bridge.Interface` maps new module functions to legacy interface
3. **Migration Script**: Helps transition from old to new structure

## Sidebar System

The sidebar system has been improved to:

1. Close the previously opened sidebar on the same side when opening a new one
2. Move toggle buttons with sidebars
3. Allow left and right sidebars to be operated independently
4. Update map padding correctly

## File Structure

```
/src
  /bridge
    app.bridge.js
  /core
    app.core.config.js
    app.core.events.js
    app.core.init.js
  /map
    app.map.basemap.js
    app.map.controls.js
    app.map.coordinates.js
    app.map.events.js
    app.map.init.js
    app.map.layers.js
    app.map.navigation.js
    app.map.overlay.js
    app.map.terrain.js
  /ui
    app.ui.controls.js
    app.ui.footer.js
    app.ui.search.js
    app.ui.sidebar.js
  /utils
    app.utils.bridge.js
    app.utils.coordinates.js
    app.utils.js
  app.js
  sidebar-toggle-fix.js
  migration-script.js
```

## How to Add New Functionality

### Adding a New Module

1. Create a new JS file in the appropriate directory (e.g., `/src/map/app.map.newfeature.js`)
2. Set up the module using the Revealing Module Pattern:

```javascript
/**
 * NewFeature functionality
 * @namespace App.Map.NewFeature
 */
App.Map = App.Map || {};
App.Map.NewFeature = (function() {
    // Private variables
    var _map = null;
    
    // Public API
    return {
        /**
         * Initialize the NewFeature module
         * @param {Object} map - MapLibre map instance
         */
        initialize: function(map) {
            _map = map;
            console.log('NewFeature module initialized');
        },
        
        // Add public methods...
    };
})();

console.log('App.Map.NewFeature module loaded');
```

3. Include the file in your HTML after the namespace definitions but before the initialization script
4. Register the module for initialization if needed

### Extending an Existing Module

To add functionality to an existing module:

1. Locate the appropriate module file
2. Add private variables/functions as needed
3. Add new methods to the public API object
4. Update any related documentation

#### Example: Adding Zoom Functionality to App.Map.Layers

The zoom functionality was added to the App.Map.Layers module following these steps:

1. **Private Helper Functions**: Added `_extendBoundsWithGeometry()` to handle all GeoJSON geometry types
2. **Public Methods**:
   - `zoomToGeoJsonExtent(sourceId, options)` - Zooms to a single GeoJSON layer's extent
   - `zoomToMultipleGeoJsonExtents(sourceIds, options)` - Zooms to multiple layers' combined extent
   - `zoomToAllGeoJsonFeatures(options)` - Zooms to all GeoJSON features on the map
3. **Bridge Methods**: Added corresponding methods to the BridgeInterface for backward compatibility
4. **Java Integration**: Added methods to DefaultBridgeMap.java for Android integration

Usage example:
```javascript
// Zoom to a specific layer with options
App.Map.Layers.zoomToGeoJsonExtent('points-layer', {
    padding: 100,
    animate: true,
    duration: 1000,
    maxZoom: 16
});

// Zoom to multiple layers
App.Map.Layers.zoomToMultipleGeoJsonExtents(['points-layer', 'polygon-layer'], {
    padding: 50
});

// Zoom to all GeoJSON features
App.Map.Layers.zoomToAllGeoJsonFeatures();
```

## Debugging

For debugging:

1. Check the browser console for module initialization messages
2. Each module's functions log their operations
3. Use `App.Core.Init.isInitialized()` to check if the application is properly initialized
4. Verify that modules are properly registered and initialized

## Best Practices

1. **Privacy**: Keep variables and functions private when possible
2. **Documentation**: Document all public methods with JSDoc
3. **Logging**: Use console.log for important initialization and state changes
4. **Event Communication**: Use the events system rather than direct calls when modules need to communicate
5. **Backwards Compatibility**: Maintain the global interface object for legacy code
6. **Error Handling**: Provide meaningful error messages and handle edge cases
7. **Feature Detection**: Check for dependencies before using them