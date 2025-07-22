/**
 * Test file for feature selection with category-based layers
 */

// Test function to verify feature selection works with category layers
window.testCategoryFeatureSelection = function() {
  console.log("=== Testing Category Feature Selection ===");
  
  // Get the map instance
  const map = window.interface?.map || App.Map.Init?.getMap();
  if (!map) {
    console.error("❌ Map not found");
    return;
  }
  
  // List all layers
  const style = map.getStyle();
  const categoryLayers = [];
  
  if (style && style.layers) {
    style.layers.forEach(layer => {
      if (layer.id.includes('category-')) {
        categoryLayers.push({
          id: layer.id,
          type: layer.type,
          source: layer.source
        });
      }
    });
  }
  
  console.log(`Found ${categoryLayers.length} category layers:`, categoryLayers);
  
  // Test querying features from category layers
  const center = map.getCenter();
  const centerPoint = map.project(center);
  
  console.log("Querying features at map center:", center);
  console.log("Screen point:", centerPoint);
  
  // Query all features
  const allFeatures = map.queryRenderedFeatures(centerPoint);
  console.log(`Total features found: ${allFeatures.length}`);
  
  // Filter for category features
  const categoryFeatures = allFeatures.filter(f => 
    f.layer && f.layer.id && f.layer.id.includes('category-')
  );
  
  console.log(`Category features found: ${categoryFeatures.length}`);
  
  // Log details of first few category features
  categoryFeatures.slice(0, 3).forEach((feature, index) => {
    console.log(`\nCategory Feature ${index + 1}:`);
    console.log("- Layer ID:", feature.layer.id);
    console.log("- Feature ID:", feature.id);
    console.log("- Properties:", feature.properties);
    console.log("- Geometry type:", feature.geometry?.type);
  });
  
  // Test feature selector
  if (categoryFeatures.length > 0) {
    console.log("\n=== Testing Feature Selector ===");
    
    // Check if feature selector is initialized
    if (App.UI.FeatureSelector) {
      console.log("✅ Feature selector module found");
      
      // Test single feature selection
      if (categoryFeatures.length === 1) {
        console.log("Testing single feature highlight...");
        App.UI.FeatureSelector.highlightFeature(categoryFeatures[0], true);
      } else {
        console.log("Testing feature selector UI with multiple features...");
        App.UI.FeatureSelector.show(
          categoryFeatures.slice(0, 5), // Limit to 5 features
          centerPoint,
          function(selectedFeature) {
            console.log("Feature selected:", selectedFeature);
          }
        );
      }
    } else {
      console.error("❌ Feature selector module not found");
    }
  } else {
    console.log("⚠️ No category features found at map center. Try panning to an area with features.");
  }
  
  return {
    totalLayers: categoryLayers.length,
    totalFeatures: allFeatures.length,
    categoryFeatures: categoryFeatures.length
  };
};

// Test function to simulate a click on a specific category feature
window.testClickCategoryFeature = function(x, y) {
  console.log(`\n=== Testing Click at (${x}, ${y}) ===`);
  
  const map = window.interface?.map || App.Map.Init?.getMap();
  if (!map) {
    console.error("❌ Map not found");
    return;
  }
  
  // Default to center if no coordinates provided
  if (x === undefined || y === undefined) {
    const center = map.project(map.getCenter());
    x = center.x;
    y = center.y;
  }
  
  const point = { x: x, y: y };
  
  // Query features at this point
  const features = map.queryRenderedFeatures(point);
  console.log(`Found ${features.length} features at point`);
  
  // Filter for category features
  const categoryFeatures = features.filter(f => 
    f.layer && f.layer.id && f.layer.id.includes('category-')
  );
  
  console.log(`Found ${categoryFeatures.length} category features`);
  
  if (categoryFeatures.length > 0) {
    // Create a fake click event
    const fakeEvent = {
      lngLat: map.unproject(point),
      point: point,
      originalEvent: {
        ctrlKey: false,
        metaKey: false
      }
    };
    
    // Trigger the map click handler
    if (App.Map.Events && App.Map.Events._handleMapClick) {
      console.log("Triggering map click handler...");
      App.Map.Events._handleMapClick(fakeEvent);
    } else {
      console.error("❌ Map click handler not found");
    }
  }
  
  return categoryFeatures.length;
};

// Test the category layer setup
window.testCategoryLayers = function() {
  console.log("\n=== Testing Category Layer Setup ===");
  
  const layers = App.Map.Layers;
  if (!layers) {
    console.error("❌ App.Map.Layers not found");
    return;
  }
  
  // Get all categories
  const categories = layers.getFeatureCategories();
  console.log(`Total categories: ${categories.length}`);
  
  // Check each category
  categories.forEach(category => {
    console.log(`\nCategory: ${category.name} (${category.id})`);
    console.log(`- Color: ${category.color}`);
    console.log(`- Icon: ${category.icon}`);
    console.log(`- Visible: ${category.visible}`);
    
    // Check if layers exist for this category
    const map = window.interface?.map || App.Map.Init?.getMap();
    if (map) {
      const sourceId = `category-${category.id}`;
      const source = map.getSource(sourceId);
      
      if (source) {
        console.log(`✅ Source exists: ${sourceId}`);
        
        // Check individual layers
        const layerTypes = ['points', 'lines', 'polygons-fill', 'polygons-stroke'];
        layerTypes.forEach(type => {
          const layerId = `${sourceId}-${type}`;
          const layer = map.getLayer(layerId);
          if (layer) {
            console.log(`  ✅ Layer exists: ${layerId}`);
          }
        });
      } else {
        console.log(`❌ Source missing: ${sourceId}`);
      }
    }
  });
};

console.log("Feature selection test functions loaded!");
console.log("Available test functions:");
console.log("- testCategoryFeatureSelection() - Test feature selection at map center");
console.log("- testClickCategoryFeature(x, y) - Test click at specific screen coordinates");
console.log("- testCategoryLayers() - Check category layer setup");