cl# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development Server:**
```bash
npm start         # Runs Express server on port 3000
```

**Linting:**
```bash
npx eslint .      # Run ESLint on all JavaScript files
```

Note: There is no build process - this is a traditional JavaScript application that runs directly in the browser.

## Architecture

This is a web-based GIS mapping application built with MapLibre GL JS. The codebase follows a modular architecture using the Revealing Module Pattern with namespaced modules under the `App` global object.

### Key Namespaces:
- **App.Core**: Application lifecycle (Config, Events, Init)
- **App.Map**: Map functionality (Layers, Controls, Navigation, Basemap)
- **App.UI**: User interface components (Sidebar, Search, Controls)
- **App.Bridge**: Legacy code compatibility layer
- **App.Features**: Feature modules (StakeOut, GNSS)
- **App.Utils**: Utility functions

### Module Pattern:
```javascript
App.Some.Module = (function() {
    // Private variables
    var _privateVar;
    
    // Public API
    return {
        initialize: function(dependencies) {
            // Module initialization
        },
        publicMethod: function() {
            // Public functionality
        }
    };
})();
```

### Key Integration Points:
- **Map Instance**: Access via `App.Map.Init.getMap()` after initialization
- **Events**: Use `App.Core.Events.trigger()` and `App.Core.Events.on()` for inter-module communication
- **Legacy Interface**: `window.interface` provides backward compatibility through `App.Bridge.Interface`

### Adding New Features:
1. Create module file in appropriate directory (e.g., `/src/map/app.map.newfeature.js`)
2. Follow the Revealing Module Pattern
3. Register initialization if needed
4. Add bridge methods for legacy compatibility if required

### Map Layer Management:
- Use `App.Map.Layers` for all layer operations
- Zoom functions: `zoomToGeoJsonExtent()`, `zoomToMultipleGeoJsonExtents()`, `zoomToAllGeoJsonFeatures()`
- Layer operations maintain both MapLibre layers and internal layer registry

### External Dependencies:
- MapLibre GL JS (loaded via CDN)
- Shoelace web components (loaded via CDN)
- jQuery (legacy dependency)
- Turf.js for geospatial operations
- Proj4js for coordinate transformations