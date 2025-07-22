/**
 * Debug utilities for feature selection with category-based layers
 */

window.debugFeatureSelection = {
  /**
   * Check if feature selection is properly initialized
   */
  checkInitialization: function() {
    console.log("\n=== Feature Selection Initialization Check ===");
    
    const checks = {
      'Map instance': !!window.interface?.map || !!App.Map.Init?.getMap(),
      'Feature selector module': !!App.UI.FeatureSelector,
      'Feature selector initialized': !!(App.UI.FeatureSelector && App.UI.FeatureSelector._map),
      'Map events module': !!App.Map.Events,
      'Object info bridge': !!window.objectInfoBridge,
      'Object info component': !!document.querySelector('object-info')
    };
    
    Object.entries(checks).forEach(([name, status]) => {
      console.log(`${status ? '✅' : '❌'} ${name}`);
    });
    
    return checks;
  },
  
  /**
   * Debug layer visibility and selectability
   */
  checkLayerSettings: function() {
    console.log("\n=== Layer Settings Check ===");
    
    const map = window.interface?.map || App.Map.Init?.getMap();
    if (!map) {
      console.error("Map not available");
      return;
    }
    
    // Get layer selectability settings
    const selectability = map._layerSelectability || {};
    console.log("Layer selectability settings:", selectability);
    
    // Check category layers
    const style = map.getStyle();
    if (style && style.layers) {
      const categoryLayers = style.layers.filter(l => l.id.includes('category-'));
      
      categoryLayers.forEach(layer => {
        const visible = layer.layout?.visibility !== 'none';
        const selectable = selectability[layer.id] !== false;
        
        console.log(`Layer: ${layer.id}`);
        console.log(`  - Visible: ${visible}`);
        console.log(`  - Selectable: ${selectable}`);
        console.log(`  - Type: ${layer.type}`);
      });
    }
  },
  
  /**
   * Test feature querying at specific point
   */
  queryFeaturesAt: function(x, y) {
    const map = window.interface?.map || App.Map.Init?.getMap();
    if (!map) {
      console.error("Map not available");
      return;
    }
    
    // Default to center
    if (x === undefined || y === undefined) {
      const center = map.project(map.getCenter());
      x = center.x;
      y = center.y;
    }
    
    console.log(`\n=== Querying features at (${x}, ${y}) ===`);
    
    const point = { x: x, y: y };
    const lngLat = map.unproject(point);
    console.log("LngLat:", lngLat);
    
    // Query all features
    const allFeatures = map.queryRenderedFeatures(point);
    console.log(`Total features: ${allFeatures.length}`);
    
    // Group by layer
    const featuresByLayer = {};
    allFeatures.forEach(f => {
      const layerId = f.layer?.id || 'unknown';
      if (!featuresByLayer[layerId]) {
        featuresByLayer[layerId] = [];
      }
      featuresByLayer[layerId].push(f);
    });
    
    // Log summary
    Object.entries(featuresByLayer).forEach(([layerId, features]) => {
      console.log(`\nLayer: ${layerId} (${features.length} features)`);
      
      // Check if it's a category layer
      const categoryMatch = layerId.match(/^category-([a-f0-9-]+)-(points|lines|polygons-fill|polygons-stroke)$/);
      if (categoryMatch) {
        const categoryId = categoryMatch[1];
        const geometryType = categoryMatch[2];
        console.log(`  - Category ID: ${categoryId}`);
        console.log(`  - Geometry type: ${geometryType}`);
        
        // Try to get category name
        if (App.Map.Layers && App.Map.Layers.getCategoryById) {
          const category = App.Map.Layers.getCategoryById(categoryId);
          if (category) {
            console.log(`  - Category name: ${category.name}`);
          }
        }
      }
      
      // Show first feature details
      if (features.length > 0) {
        const firstFeature = features[0];
        console.log("  First feature:");
        console.log("    - ID:", firstFeature.id);
        console.log("    - Properties:", Object.keys(firstFeature.properties || {}));
        if (firstFeature.properties?.name) {
          console.log("    - Name:", firstFeature.properties.name);
        }
      }
    });
    
    return allFeatures;
  },
  
  /**
   * Test the feature selector filter
   */
  testFeatureFilter: function() {
    console.log("\n=== Testing Feature Selector Filter ===");
    
    const map = window.interface?.map || App.Map.Init?.getMap();
    if (!map || !App.UI.FeatureSelector) {
      console.error("Required modules not available");
      return;
    }
    
    // Create test features
    const testFeatures = [
      {
        layer: { id: 'category-abc123-points' },
        properties: { name: 'Category Feature 1' },
        geometry: { type: 'Point', coordinates: [0, 0] }
      },
      {
        layer: { id: 'basemap-roads' },
        properties: { name: 'Basemap Feature' },
        geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] }
      },
      {
        layer: { id: 'category-def456-polygons-fill' },
        properties: { name: 'Category Feature 2' },
        geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }
      }
    ];
    
    // Test the filter
    const filtered = App.UI.FeatureSelector.filterSelectableFeatures(testFeatures);
    
    console.log(`Input features: ${testFeatures.length}`);
    console.log(`Filtered features: ${filtered.length}`);
    
    filtered.forEach((f, i) => {
      console.log(`Filtered feature ${i + 1}: ${f.layer.id} - ${f.properties.name}`);
    });
  },
  
  /**
   * Monitor feature selection events
   */
  monitorEvents: function() {
    console.log("\n=== Monitoring Feature Selection Events ===");
    
    if (!App.Core || !App.Core.Events) {
      console.error("Event system not available");
      return;
    }
    
    // Monitor various events
    const events = [
      'map:featureClick',
      'feature.selected',
      'map.clicked',
      'featureSelector:closed',
      'featureSelector:modeChanged'
    ];
    
    events.forEach(eventName => {
      App.Core.Events.on(eventName, function(data) {
        console.log(`📢 Event: ${eventName}`, data);
      });
    });
    
    console.log("Event monitoring enabled. Click on features to see events.");
  },
  
  /**
   * Fix common issues
   */
  attemptFix: function() {
    console.log("\n=== Attempting to Fix Common Issues ===");
    
    // Ensure feature selector is initialized
    const map = window.interface?.map || App.Map.Init?.getMap();
    if (map && App.UI.FeatureSelector && !App.UI.FeatureSelector._map) {
      console.log("Initializing feature selector...");
      App.UI.FeatureSelector.initialize(map);
    }
    
    // Ensure map events are set up
    if (map && App.Map.Events) {
      console.log("Resetting map events...");
      App.Map.Events.reset();
    }
    
    // Set layer selectability for category layers
    if (map) {
      const style = map.getStyle();
      if (style && style.layers) {
        const categoryLayers = style.layers.filter(l => l.id.includes('category-'));
        
        categoryLayers.forEach(layer => {
          const categoryMatch = layer.id.match(/^category-([a-f0-9-]+)/);
          if (categoryMatch) {
            const categoryId = categoryMatch[1];
            // Make category selectable
            if (!map._layerSelectability) {
              map._layerSelectability = {};
            }
            map._layerSelectability[`category-${categoryId}`] = true;
            console.log(`Made category ${categoryId} selectable`);
          }
        });
      }
    }
    
    console.log("Fix attempt completed. Test feature selection again.");
  }
};

// Create a comprehensive test function
window.testFeatureSelectionFlow = function() {
  console.log("\n=== COMPREHENSIVE FEATURE SELECTION TEST ===\n");
  
  // Step 1: Check initialization
  console.log("Step 1: Checking initialization...");
  const initChecks = debugFeatureSelection.checkInitialization();
  
  // Step 2: Check layer settings
  console.log("\nStep 2: Checking layer settings...");
  debugFeatureSelection.checkLayerSettings();
  
  // Step 3: Query features at center
  console.log("\nStep 3: Querying features at map center...");
  const features = debugFeatureSelection.queryFeaturesAt();
  
  // Step 4: Test feature filter
  console.log("\nStep 4: Testing feature filter...");
  debugFeatureSelection.testFeatureFilter();
  
  // Step 5: If issues found, attempt fix
  const hasIssues = Object.values(initChecks).some(v => !v) || features.length === 0;
  if (hasIssues) {
    console.log("\nStep 5: Issues detected, attempting fixes...");
    debugFeatureSelection.attemptFix();
  } else {
    console.log("\nStep 5: No issues detected!");
  }
  
  console.log("\n=== TEST COMPLETE ===");
  console.log("Monitor events with: debugFeatureSelection.monitorEvents()");
};

console.log("Feature selection debug utilities loaded!");
console.log("Run testFeatureSelectionFlow() for a comprehensive test");
console.log("Or use individual debug functions:");
console.log("- debugFeatureSelection.checkInitialization()");
console.log("- debugFeatureSelection.checkLayerSettings()");
console.log("- debugFeatureSelection.queryFeaturesAt(x, y)");
console.log("- debugFeatureSelection.monitorEvents()");
console.log("- debugFeatureSelection.attemptFix()");