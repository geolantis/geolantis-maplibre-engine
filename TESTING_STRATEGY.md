# Unit Testing Strategy for Map Engine

This document outlines the unit testing approach for the map engine codebase, which uses the Revealing Module Pattern with a global `App` namespace.

## Overview

The map engine uses a traditional JavaScript architecture without modern module systems. All modules are defined as IIFEs (Immediately Invoked Function Expressions) and attached to a global `App` namespace. This testing strategy is designed to work with this existing architecture.

## Testing Framework

### Primary Framework: Jasmine

We recommend **Jasmine** as the primary testing framework for the following reasons:
- Excellent support for testing global namespace patterns
- Minimal configuration required
- Can run tests in both Node.js and browsers
- Well-suited for testing revealing module patterns
- Built-in assertion library and test runner

### Supporting Tools

- **Karma**: Browser-based test runner for testing MapLibre GL functionality
- **Sinon.js**: For creating spies, stubs, and mocks
- **jasmine-ajax**: For mocking AJAX requests

## Installation

```bash
# Install testing dependencies
npm install --save-dev jasmine jasmine-browser-runner karma karma-jasmine karma-chrome-launcher sinon jasmine-ajax

# Initialize Jasmine
npx jasmine init
```

## Test Structure

```
tests/
├── unit/                    # Unit tests for individual modules
│   ├── core/               # App.Core.* module tests
│   │   ├── events.spec.js
│   │   ├── init.spec.js
│   │   └── state.spec.js
│   ├── map/                # App.Map.* module tests
│   │   ├── layers.spec.js
│   │   ├── controls.spec.js
│   │   └── basemap.spec.js
│   ├── ui/                 # App.UI.* module tests
│   │   ├── sidebar.spec.js
│   │   └── controls.spec.js
│   ├── features/           # App.Features.* module tests
│   │   ├── stakeout.spec.js
│   │   └── measure.spec.js
│   └── utils/              # App.Utils.* module tests
├── integration/            # Integration tests
│   ├── map-layers.spec.js
│   └── event-flow.spec.js
├── fixtures/               # Test data and mock objects
│   ├── map-mock.js
│   ├── test-geojson.js
│   └── test-styles.js
├── helpers/                # Test utilities
│   ├── test-setup.js
│   ├── module-reset.js
│   └── dom-helpers.js
└── browser/                # Browser-specific tests
    └── karma.conf.js
```

## Testing Patterns

### 1. Testing a Revealing Module

```javascript
// tests/unit/core/events.spec.js
describe('App.Core.Events', function() {
    var originalModule;
    
    beforeEach(function() {
        // Store original module to restore later
        originalModule = App.Core.Events;
        
        // Reset event handlers between tests
        if (App.Core.Events._resetHandlers) {
            App.Core.Events._resetHandlers();
        }
    });
    
    afterEach(function() {
        // Restore original module
        App.Core.Events = originalModule;
    });
    
    describe('on()', function() {
        it('should register an event handler', function() {
            var callback = jasmine.createSpy('callback');
            
            App.Core.Events.on('test:event', callback);
            App.Core.Events.trigger('test:event', { data: 'test' });
            
            expect(callback).toHaveBeenCalledWith({ data: 'test' });
        });
        
        it('should handle multiple handlers for same event', function() {
            var callback1 = jasmine.createSpy('callback1');
            var callback2 = jasmine.createSpy('callback2');
            
            App.Core.Events.on('test:event', callback1);
            App.Core.Events.on('test:event', callback2);
            App.Core.Events.trigger('test:event');
            
            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });
    });
    
    describe('off()', function() {
        it('should remove an event handler', function() {
            var callback = jasmine.createSpy('callback');
            
            App.Core.Events.on('test:event', callback);
            App.Core.Events.off('test:event', callback);
            App.Core.Events.trigger('test:event');
            
            expect(callback).not.toHaveBeenCalled();
        });
    });
});
```

### 2. Mocking MapLibre GL Map Instance

```javascript
// tests/fixtures/map-mock.js
function createMapMock() {
    return {
        addSource: jasmine.createSpy('addSource'),
        addLayer: jasmine.createSpy('addLayer'),
        removeLayer: jasmine.createSpy('removeLayer'),
        removeSource: jasmine.createSpy('removeSource'),
        getLayer: jasmine.createSpy('getLayer').and.returnValue(null),
        getSource: jasmine.createSpy('getSource').and.returnValue(null),
        on: jasmine.createSpy('on'),
        off: jasmine.createSpy('off'),
        flyTo: jasmine.createSpy('flyTo'),
        fitBounds: jasmine.createSpy('fitBounds'),
        getZoom: jasmine.createSpy('getZoom').and.returnValue(10),
        getCenter: jasmine.createSpy('getCenter').and.returnValue({ lng: 0, lat: 0 }),
        project: jasmine.createSpy('project').and.returnValue({ x: 0, y: 0 }),
        unproject: jasmine.createSpy('unproject').and.returnValue({ lng: 0, lat: 0 })
    };
}
```

### 3. Testing Modules with Dependencies

```javascript
// tests/unit/map/layers.spec.js
describe('App.Map.Layers', function() {
    var mapMock;
    
    beforeEach(function() {
        // Create map mock
        mapMock = createMapMock();
        
        // Mock the getMap function
        spyOn(App.Map.Init, 'getMap').and.returnValue(mapMock);
        
        // Initialize the module if needed
        if (App.Map.Layers.initialize) {
            App.Map.Layers.initialize({ map: mapMock });
        }
    });
    
    describe('addGeoJsonLayer()', function() {
        it('should add source and layer to map', function() {
            var layerId = 'test-layer';
            var geoJsonData = {
                type: 'FeatureCollection',
                features: []
            };
            
            App.Map.Layers.addGeoJsonLayer(layerId, geoJsonData, {
                type: 'fill',
                paint: { 'fill-color': '#ff0000' }
            });
            
            expect(mapMock.addSource).toHaveBeenCalledWith(layerId, {
                type: 'geojson',
                data: geoJsonData
            });
            
            expect(mapMock.addLayer).toHaveBeenCalled();
        });
    });
});
```

### 4. Testing Event-Driven Interactions

```javascript
// tests/integration/event-flow.spec.js
describe('Event-driven module interactions', function() {
    it('should update UI when layer is added', function(done) {
        var layerAddedSpy = jasmine.createSpy('layerAdded');
        
        // Listen for UI update event
        App.Core.Events.on('ui:layers:update', layerAddedSpy);
        
        // Add a layer (should trigger event)
        App.Map.Layers.addLayer({
            id: 'test-layer',
            type: 'geojson'
        });
        
        // Use setTimeout to allow for async event propagation
        setTimeout(function() {
            expect(layerAddedSpy).toHaveBeenCalled();
            done();
        }, 10);
    });
});
```

### 5. Testing Asynchronous Operations

```javascript
describe('Asynchronous map operations', function() {
    it('should load remote GeoJSON data', function(done) {
        jasmine.Ajax.install();
        
        var successCallback = jasmine.createSpy('success');
        var errorCallback = jasmine.createSpy('error');
        
        App.Map.Layers.loadRemoteGeoJson('http://example.com/data.json')
            .then(successCallback)
            .catch(errorCallback);
        
        jasmine.Ajax.requests.mostRecent().respondWith({
            status: 200,
            contentType: 'application/json',
            responseText: JSON.stringify({
                type: 'FeatureCollection',
                features: []
            })
        });
        
        setTimeout(function() {
            expect(successCallback).toHaveBeenCalled();
            expect(errorCallback).not.toHaveBeenCalled();
            jasmine.Ajax.uninstall();
            done();
        }, 10);
    });
});
```

## Browser Testing with Karma

### Karma Configuration

```javascript
// tests/browser/karma.conf.js
module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],
        
        files: [
            // External dependencies (same order as index.html)
            'https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js',
            'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@latest/dist/shoelace.js',
            'src/turf.js',
            
            // Application files (in dependency order)
            'src/core/*.js',
            'src/map/*.js',
            'src/ui/*.js',
            'src/features/*.js',
            'src/utils/*.js',
            
            // Test helpers and fixtures
            'tests/helpers/*.js',
            'tests/fixtures/*.js',
            
            // Test specs
            'tests/unit/**/*.spec.js',
            'tests/integration/**/*.spec.js'
        ],
        
        browsers: ['ChromeHeadless'],
        
        reporters: ['progress', 'coverage'],
        
        preprocessors: {
            'src/**/*.js': ['coverage']
        },
        
        coverageReporter: {
            type: 'html',
            dir: 'coverage/'
        }
    });
};
```

## Test Helpers

### Module Reset Helper

```javascript
// tests/helpers/module-reset.js
var TestHelpers = {
    // Store original modules
    originalModules: {},
    
    // Backup a module before testing
    backupModule: function(modulePath) {
        var parts = modulePath.split('.');
        var module = window;
        
        for (var i = 0; i < parts.length; i++) {
            module = module[parts[i]];
        }
        
        this.originalModules[modulePath] = module;
    },
    
    // Restore a module after testing
    restoreModule: function(modulePath) {
        if (this.originalModules[modulePath]) {
            var parts = modulePath.split('.');
            var parent = window;
            
            for (var i = 0; i < parts.length - 1; i++) {
                parent = parent[parts[i]];
            }
            
            parent[parts[parts.length - 1]] = this.originalModules[modulePath];
        }
    },
    
    // Reset all modules
    resetAll: function() {
        for (var modulePath in this.originalModules) {
            this.restoreModule(modulePath);
        }
        this.originalModules = {};
    }
};
```

### DOM Testing Helper

```javascript
// tests/helpers/dom-helpers.js
var DOMHelpers = {
    // Create a test container
    createContainer: function() {
        var container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
        return container;
    },
    
    // Clean up test container
    cleanupContainer: function() {
        var container = document.getElementById('test-container');
        if (container) {
            container.remove();
        }
    },
    
    // Trigger DOM event
    triggerEvent: function(element, eventType, data) {
        var event = new CustomEvent(eventType, { detail: data });
        element.dispatchEvent(event);
    }
};
```

## Running Tests

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jasmine",
    "test:browser": "karma start tests/browser/karma.conf.js",
    "test:browser:watch": "karma start tests/browser/karma.conf.js --auto-watch",
    "test:coverage": "karma start tests/browser/karma.conf.js --single-run --coverage"
  }
}
```

### Command Line Usage

```bash
# Run all unit tests
npm test

# Run tests in browser
npm run test:browser

# Run tests in watch mode
npm run test:browser:watch

# Generate coverage report
npm run test:coverage
```

## Best Practices

### 1. Module Isolation
- Always backup and restore modules in beforeEach/afterEach
- Reset module state between tests
- Mock external dependencies

### 2. Event Testing
- Clear event handlers between tests
- Use spies to verify event handling
- Test both synchronous and asynchronous events

### 3. DOM Testing
- Create fresh DOM elements for each test
- Clean up after tests to prevent pollution
- Use Karma for complex DOM interactions

### 4. MapLibre Testing
- Always mock the map instance
- Test layer operations independently
- Verify correct MapLibre API usage

### 5. Async Testing
- Use Jasmine's `done()` callback
- Mock AJAX requests with jasmine-ajax
- Test both success and error paths

## Common Testing Scenarios

### Testing Layer Management
```javascript
it('should maintain internal layer registry', function() {
    var layer = { id: 'test', type: 'geojson' };
    App.Map.Layers.addLayer(layer);
    
    expect(App.Map.Layers.getLayer('test')).toEqual(layer);
    expect(App.Map.Layers.getAllLayers()).toContain(layer);
});
```

### Testing Coordinate Transformations
```javascript
it('should transform coordinates correctly', function() {
    var wgs84 = [16.3738, 48.2082]; // Vienna
    var result = App.Utils.Coordinates.transform(wgs84, 'EPSG:4326', 'EPSG:3857');
    
    expect(result[0]).toBeCloseTo(1823848.4, 1);
    expect(result[1]).toBeCloseTo(6143859.9, 1);
});
```

### Testing UI Updates
```javascript
it('should update sidebar when layer visibility changes', function() {
    spyOn(App.UI.Sidebar, 'updateLayerList');
    
    App.Map.Layers.setLayerVisibility('test-layer', false);
    
    expect(App.UI.Sidebar.updateLayerList).toHaveBeenCalled();
});
```

## Troubleshooting

### Issue: Module not found
**Solution**: Ensure modules are loaded in correct order in test runner

### Issue: Map operations fail
**Solution**: Check that map mock includes all required methods

### Issue: Events not firing in tests
**Solution**: Use setTimeout or Jasmine's async support for event propagation

### Issue: DOM elements not found
**Solution**: Create elements in beforeEach, not in describe blocks

## Next Steps

1. Set up continuous integration (CI) to run tests automatically
2. Add code coverage requirements (aim for >80%)
3. Create test data fixtures for common scenarios
4. Document module-specific testing patterns
5. Add performance benchmarks for critical operations