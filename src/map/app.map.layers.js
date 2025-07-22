/**
 * Map layer management - Refactored for improved MapLibre performance
 * @namespace App.Map.Layers
 */
App.Map = App.Map || {};
App.Map.Layers = (function () {
  // Private variables
  var _map = null;
  var _featureLayers = [];
  var _overlayLayers = {};
  var _layerVisibility = new Map(); // Track visibility state of layers
  var _imageCache = {};

  // Category management
  var _geoCategories = []; // full array received from native
  var _geoCategoryById = new Map(); // quick lookup by UUID
  var _hiddenCategories = new Set(); // track hidden categories for filtering
  var _categoryStyles = new Map(); // MapLibre style definitions for each category
  
  // Improved feature management
  var _categoryLayers = new Map(); // Map of categoryId -> { sourceId, layerIds }
  var _pendingFeatures = new Map(); // Map of categoryId -> features array for batching
  var _batchTimeout = null;
  var _featuresByObjectId = new Map(); // Map of objectId -> { categoryId, feature }
  
  // Queue for operations before map initialization
  var _initQueue = [];
  var _isInitialized = false;

  /**
   * Check if a layer exists on the map
   * @param {string} id - Layer ID to check
   * @returns {boolean} Whether the layer exists
   * @private
   */
  function _isLayerExistant(id) {
    if (!_map) {
      console.warn("_isLayerExistant called before map initialization");
      return false;
    }
    return !!_map.getLayer(id);
  }

  /**
   * Check if a layer was added by the user
   * @param {string} layerId - Layer ID to check
   * @returns {boolean} Whether the layer was user-added
   * @private
   */
  function _isUserAddedLayer(layerId) {
    // Check if this is one of our feature layers
    if (_featureLayers.includes(layerId)) {
      return true;
    }

    // Check if this is a category layer
    for (const [categoryId, layerInfo] of _categoryLayers) {
      if (layerInfo.layerIds.includes(layerId)) {
        return true;
      }
    }

    // Check if the layer uses a GeoJSON source
    if (!_map) {
      console.warn("_isUserAddedLayer called before map initialization");
      return false;
    }
    
    const style = _map.getStyle();
    if (!style || !style.layers) {
      return false;
    }
    
    const layer = style.layers.find((l) => l.id === layerId);
    if (layer && layer.source && style.sources) {
      const source = style.sources[layer.source];
      return source && source.type === "geojson";
    }

    return false;
  }

  /**
   * Check if a layer is a background layer
   * @param {Object} layer - Layer object
   * @returns {boolean} Whether the layer is a background layer
   * @private
   */
  function _isBackgroundLayer(layer) {
    if (!_map) {
      console.warn("_isBackgroundLayer called before map initialization");
      return false;
    }
    // Check layer type (comprehensive coverage of basemap layer types)
    if (
      [
        "background",
        "raster",
        "fill",
        "line",
        "symbol",
        "circle",
        "fill-extrusion",
        "heatmap",
        "hillshade",
      ].includes(layer.type)
    ) {
      // Check source type if available
      if (layer.source) {
        const style = _map.getStyle();
        if (style && style.sources) {
          const source = style.sources[layer.source];
          if (source && (source.type === "vector" || source.type === "raster")) {
            return true;
          }
        }
      } else if (layer.type === "background") {
        // Background layers don't have a source but are definitely background
        return true;
      }
    }
    return false;
  }

  /**
   * Create category-specific layers with pre-defined styles
   * This creates separate sources and layers for each category for better performance
   * 
   * IMPORTANT: This function applies zoom restrictions (minzoom/maxzoom) from the category
   * configuration to ensure objects only appear at appropriate zoom levels. This is critical
   * for performance and user experience - objects should not appear too early (cluttering
   * the map at low zoom levels) or disappear too early (when users expect to see them).
   * 
   * @param {string} categoryId - Category ID
   * @private
   */
  function _createCategoryLayers(categoryId) {
    if (!_map) {
      console.warn(`_createCategoryLayers called before map initialization for category ${categoryId}`);
      return;
    }
    
    const category = _geoCategoryById.get(categoryId);
    if (!category) {
      console.warn(`Category ${categoryId} not found`);
      return;
    }
    
    // Log zoom restrictions for debugging
    // Note: Java sends minZoom (camelCase), not min_zoom
    if (category.minZoom || category.maxZoom) {
      console.log(`Category ${category.name} has zoom restrictions: min=${category.minZoom || 0}, max=${category.maxZoom || 24}`);
    }

    const sourceId = `category-${categoryId}`;
    
    // Check if already created
    if (_categoryLayers.has(categoryId)) {
      return;
    }

    // Create the source
    if (!_map.getSource(sourceId)) {
      _map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      });
    }

    const layerIds = [];
    const styleInfo = _categoryStyles.get(categoryId);
    
    // Get category color for default styling
    const categoryColor = category.color || "#FFA500";
    const categoryAlpha = (category.alpha || 255) / 255;

    // Create point layer if category supports points
    if (!styleInfo || styleInfo.type === "circle" || styleInfo.type === "symbol" || !styleInfo.type) {
      const pointLayerId = `${sourceId}-points`;
      if (!_map.getLayer(pointLayerId)) {
        const pointStyle = {
          id: pointLayerId,
          type: "circle",
          source: sourceId,
          filter: [
            "any",
            ["==", ["geometry-type"], "Point"],
            ["==", ["geometry-type"], "MultiPoint"]
          ],
          paint: styleInfo?.paint || {
            "circle-radius": 6,
            "circle-color": categoryColor,
            "circle-stroke-color": "#000000",
            "circle-stroke-width": 2,
            "circle-opacity": categoryAlpha
          }
        };
        
        // Apply zoom restrictions from category or style
        // FIXED: Only apply zoom restrictions if explicitly configured and reasonable
        // Prevent features from being hidden at normal zoom levels due to incorrect minZoom values
        if (styleInfo?.minZoom !== undefined && styleInfo.minZoom <= 20) {
          pointStyle.minzoom = styleInfo.minZoom;
          console.log(`Setting minzoom for point layer ${pointLayerId}: ${pointStyle.minzoom} from style`);
        } else if (category.minZoom !== undefined && category.minZoom <= 20 && category.minZoom > 0) {
          pointStyle.minzoom = category.minZoom;
          console.log(`Setting minzoom for point layer ${pointLayerId}: ${pointStyle.minzoom} from category`);
        } else {
          pointStyle.minzoom = 0; // Default to show at all zoom levels
        }
        
        if (styleInfo?.maxZoom !== undefined && styleInfo.maxZoom >= 10) {
          pointStyle.maxzoom = styleInfo.maxZoom;
        } else if (category.maxZoom !== undefined && category.maxZoom >= 10) {
          pointStyle.maxzoom = category.maxZoom;
        } else {
          pointStyle.maxzoom = 24; // Default to show at all zoom levels
        }
        
        if (styleInfo?.layout) {
          pointStyle.layout = styleInfo.layout;
        }
        
        _map.addLayer(pointStyle);
        // Debug: Log the actual layer after creation
        const createdLayer = _map.getLayer(pointLayerId);
        console.log(`Created point layer ${pointLayerId}: minzoom=${createdLayer.minzoom}, maxzoom=${createdLayer.maxzoom}`);
        layerIds.push(pointLayerId);
        _featureLayers.push(pointLayerId);
      }
    }

    // Create line layer
    const lineLayerId = `${sourceId}-lines`;
    if (!_map.getLayer(lineLayerId)) {
      const lineStyle = {
        id: lineLayerId,
        type: "line",
        source: sourceId,
        filter: [
          "any",
          ["==", ["geometry-type"], "LineString"],
          ["==", ["geometry-type"], "MultiLineString"]
        ],
        paint: styleInfo?.paint || {
          "line-color": categoryColor,
          "line-width": 3,
          "line-opacity": categoryAlpha
        },
        layout: styleInfo?.layout || {
          "line-cap": "round",
          "line-join": "round"
        }
      };
      
      // Apply zoom restrictions from category or style
      // FIXED: Only apply zoom restrictions if explicitly configured and reasonable
      if (styleInfo?.minZoom !== undefined && styleInfo.minZoom <= 20) {
        lineStyle.minzoom = styleInfo.minZoom;
        console.log(`Setting minzoom for line layer ${lineLayerId}: ${lineStyle.minzoom} from style`);
      } else if (category.minZoom !== undefined && category.minZoom <= 20 && category.minZoom > 0) {
        lineStyle.minzoom = category.minZoom;
        console.log(`Setting minzoom for line layer ${lineLayerId}: ${lineStyle.minzoom} from category`);
      } else {
        lineStyle.minzoom = 0; // Default to show at all zoom levels
      }
      
      if (styleInfo?.maxZoom !== undefined && styleInfo.maxZoom >= 10) {
        lineStyle.maxzoom = styleInfo.maxZoom;
      } else if (category.maxZoom !== undefined && category.maxZoom >= 10) {
        lineStyle.maxzoom = category.maxZoom;
      } else {
        lineStyle.maxzoom = 24; // Default to show at all zoom levels
      }
      
      _map.addLayer(lineStyle);
      layerIds.push(lineLayerId);
      _featureLayers.push(lineLayerId);
    }

    // Create polygon layers
    const polygonFillLayerId = `${sourceId}-polygons-fill`;
    const polygonStrokeLayerId = `${sourceId}-polygons-stroke`;
    
    if (!_map.getLayer(polygonFillLayerId)) {
      const fillStyle = {
        id: polygonFillLayerId,
        type: "fill",
        source: sourceId,
        filter: [
          "any",
          ["==", ["geometry-type"], "Polygon"],
          ["==", ["geometry-type"], "MultiPolygon"]
        ],
        paint: styleInfo?.paint || {
          "fill-color": categoryColor,
          "fill-opacity": categoryAlpha * 0.4
        }
      };
      
      // Apply zoom restrictions from category or style
      // FIXED: Only apply zoom restrictions if explicitly configured and reasonable
      if (styleInfo?.minZoom !== undefined && styleInfo.minZoom <= 20) {
        fillStyle.minzoom = styleInfo.minZoom;
      } else if (category.minZoom !== undefined && category.minZoom <= 20 && category.minZoom > 0) {
        fillStyle.minzoom = category.minZoom;
      } else {
        fillStyle.minzoom = 0; // Default to show at all zoom levels
      }
      
      if (styleInfo?.maxZoom !== undefined && styleInfo.maxZoom >= 10) {
        fillStyle.maxzoom = styleInfo.maxZoom;
      } else if (category.maxZoom !== undefined && category.maxZoom >= 10) {
        fillStyle.maxzoom = category.maxZoom;
      } else {
        fillStyle.maxzoom = 24; // Default to show at all zoom levels
      }
      
      _map.addLayer(fillStyle);
      layerIds.push(polygonFillLayerId);
      _featureLayers.push(polygonFillLayerId);
    }
    
    if (!_map.getLayer(polygonStrokeLayerId)) {
      const strokeStyle = {
        id: polygonStrokeLayerId,
        type: "line",
        source: sourceId,
        filter: [
          "any",
          ["==", ["geometry-type"], "Polygon"],
          ["==", ["geometry-type"], "MultiPolygon"]
        ],
        paint: {
          "line-color": categoryColor,
          "line-width": 2,
          "line-opacity": categoryAlpha
        }
      };
      
      // Apply zoom restrictions from category or style
      // FIXED: Only apply zoom restrictions if explicitly configured and reasonable
      if (styleInfo?.minZoom !== undefined && styleInfo.minZoom <= 20) {
        strokeStyle.minzoom = styleInfo.minZoom;
      } else if (category.minZoom !== undefined && category.minZoom <= 20 && category.minZoom > 0) {
        strokeStyle.minzoom = category.minZoom;
      } else {
        strokeStyle.minzoom = 0; // Default to show at all zoom levels
      }
      
      if (styleInfo?.maxZoom !== undefined && styleInfo.maxZoom >= 10) {
        strokeStyle.maxzoom = styleInfo.maxZoom;
      } else if (category.maxZoom !== undefined && category.maxZoom >= 10) {
        strokeStyle.maxzoom = category.maxZoom;
      } else {
        strokeStyle.maxzoom = 24; // Default to show at all zoom levels
      }
      
      _map.addLayer(strokeStyle);
      layerIds.push(polygonStrokeLayerId);
      _featureLayers.push(polygonStrokeLayerId);
    }

    // Store layer info
    _categoryLayers.set(categoryId, {
      sourceId: sourceId,
      layerIds: layerIds
    });

    // Set initial visibility - default to visible unless explicitly hidden
    const visible = category.visible !== false && !_hiddenCategories.has(categoryId);
    layerIds.forEach(layerId => {
      _map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      _layerVisibility.set(layerId, visible);
    });
    
    console.log(`Category ${category.name} (${categoryId}) layers created with visibility: ${visible}`);

    return { sourceId, layerIds };
  }

  /**
   * Add feature to pending batch for later processing
   * @param {string} categoryId - Category ID
   * @param {string} objectId - Object ID
   * @param {Object} feature - GeoJSON feature
   * @private
   */
  function _addToPendingBatch(categoryId, objectId, feature) {
    // Ensure category layers exist before adding features
    if (!_categoryLayers.has(categoryId)) {
      console.log(`Creating category layers for ${categoryId} before adding feature`);
      _createCategoryLayers(categoryId);
      
      // Verify layer was created successfully
      if (!_categoryLayers.has(categoryId)) {
        console.error(`Failed to create category layers for ${categoryId}`);
        return;
      }
    }
    
    if (!_pendingFeatures.has(categoryId)) {
      _pendingFeatures.set(categoryId, new Map());
    }
    
    const categoryFeatures = _pendingFeatures.get(categoryId);
    categoryFeatures.set(objectId, feature);
    
    // Store feature reference for quick lookup
    _featuresByObjectId.set(objectId, { categoryId, feature });
    
    // Schedule batch update
    if (_batchTimeout) {
      clearTimeout(_batchTimeout);
    }
    
    _batchTimeout = setTimeout(() => {
      _processPendingBatches();
    }, 100); // Process after 100ms of inactivity - increased for better batching
  }

  /**
   * Process all pending feature batches
   * @private
   */
  function _processPendingBatches() {
    if (!_map) {
      console.warn("_processPendingBatches called before map initialization");
      return;
    }
    
    console.log(`Processing ${_pendingFeatures.size} category batches`);
    
    // Debug: Log details about pending features
    let totalFeatures = 0;
    for (const [categoryId, featuresMap] of _pendingFeatures) {
      console.log(`Category ${categoryId}: ${featuresMap.size} pending features`);
      totalFeatures += featuresMap.size;
    }
    
    // FIXED: Validate that we have features to process
    if (totalFeatures === 0) {
      console.log("No features to process, clearing pending batches");
      _pendingFeatures.clear();
      _batchTimeout = null;
      return;
    }
    
    for (const [categoryId, featuresMap] of _pendingFeatures) {
      const layerInfo = _categoryLayers.get(categoryId);
      if (!layerInfo) {
        console.warn(`No layer info for category ${categoryId}`);
        continue;
      }
      
      const source = _map.getSource(layerInfo.sourceId);
      if (!source) {
        console.warn(`Source ${layerInfo.sourceId} not found`);
        continue;
      }
      
      // Get current data
      const currentData = source._data || { type: "FeatureCollection", features: [] };
      
      // Create a map of existing features by objectId for faster lookup
      const existingFeatures = new Map();
      currentData.features.forEach((feature, index) => {
        if (feature.properties && feature.properties.objectid) {
          existingFeatures.set(feature.properties.objectid, index);
        }
      });
      
      // Update or add new features
      const newFeatures = [...currentData.features];
      for (const [objectId, feature] of featuresMap) {
        if (existingFeatures.has(objectId)) {
          // Replace existing feature
          newFeatures[existingFeatures.get(objectId)] = feature;
        } else {
          // Add new feature
          newFeatures.push(feature);
        }
      }
      
      // Update source data
      source.setData({
        type: "FeatureCollection",
        features: newFeatures
      });
      
      console.log(`Updated ${featuresMap.size} features in category ${categoryId}, total in source: ${newFeatures.length}`);
      
      // FIXED: Validate that features were actually added
      if (newFeatures.length === 0) {
        console.warn(`No features in source ${layerInfo.sourceId} after update!`);
      } else {
        // Log sample of features for debugging
        const sampleSize = Math.min(3, newFeatures.length);
        console.log(`Sample features (first ${sampleSize}):`, 
          newFeatures.slice(0, sampleSize).map(f => ({
            id: f.properties?.objectid,
            type: f.geometry?.type,
            categoryId: f.properties?.categoryId
          }))
        );
      }
    }
    
    console.log(`Batch processing complete. Total features processed: ${totalFeatures}`);
    
    // Clear pending features
    _pendingFeatures.clear();
    _batchTimeout = null;
    
    // Trigger events for updates
    if (App.Core.Events) {
      App.Core.Events.trigger('layers:batch-updated');
    }
    
    // Update labels if needed
    if (App.Map.LabelsEnhanced) {
      for (const [categoryId, layerInfo] of _categoryLayers) {
        App.Map.LabelsEnhanced.updateSourceLabels(layerInfo.sourceId);
      }
    }
  }

  /**
   * Convert Android dash pattern to MapLibre line-dasharray
   * @param {string} dashPattern - Android dash pattern (e.g. "5, 10")
   * @returns {Array} MapLibre dash array
   * @private
   */
  function _convertDashPattern(dashPattern) {
    if (!dashPattern) return null;
    
    // Parse the dash pattern string
    const values = dashPattern.split(',').map(v => parseFloat(v.trim()));
    
    // MapLibre uses a different scale, so we need to adjust the values
    // Android uses pixels, MapLibre uses line-width multipliers
    // We'll scale down by a factor to get reasonable results
    const scale = 0.5;
    return values.map(v => v * scale);
  }

  /**
   * Apply overlay style and track the layer
   * @param {Object} styleData - Style data object or URL
   * @param {string} spriteUrl - Optional sprite URL
   * @param {string} layerId - Layer ID
   * @param {string} sourceId - Source ID
   * @private
   */
  function _applyOverlayStyle(styleData, spriteUrl, layerId, sourceId) {
    if (!_map) {
      console.warn("_applyOverlayStyle called before map initialization");
      return;
    }
    
    const processStyle = (data) => {
      console.log(`Processing style data for ${layerId}`);

      // Get current map style
      const currentStyle = _map.getStyle();
      if (!currentStyle) {
        console.warn("No current style available");
        return;
      }

      // Check for duplicate layers
      const existingLayerIds = new Set();
      if (currentStyle.layers) {
        currentStyle.layers.forEach((layer) => {
          existingLayerIds.add(layer.id);
        });
      }

      // Filter out any duplicate layers
      const newLayers = data.layers ? data.layers.filter((layer) => {
        if (existingLayerIds.has(layer.id)) {
          console.log(`Skipping duplicate layer: ${layer.id}`);
          return false;
        }
        return true;
      }) : [];

      // Check for duplicate sources
      const existingSourceIds = new Set(Object.keys(currentStyle.sources || {}));
      const newSources = {};

      Object.keys(data.sources || {}).forEach((id) => {
        if (!existingSourceIds.has(id)) {
          newSources[id] = data.sources[id];
        } else {
          console.log(`Skipping duplicate source: ${id}`);
        }
      });

      // Apply the updated style
      _map.setStyle({
        ...currentStyle,
        layers: [...(currentStyle.layers || []), ...newLayers],
        sources: { ...(currentStyle.sources || {}), ...newSources },
        sprite: spriteUrl || currentStyle.sprite,
      });

      // After style is loaded, set up layer and add to tracking
      _map.once("style.load", () => {
        console.log(`Style loaded for ${layerId}`);

        // Set layer visibility
        newLayers.forEach((layer) => {
          if (_map.getLayer(layer.id)) {
            _map.setLayoutProperty(layer.id, "visibility", "visible");

            // Track this layer
            _overlayLayers[layer.id] = sourceId;
          }
        });

        // Move feature layers to top if needed
        App.Map.Layers.moveFeatureLayersToTop();
      });
    };

    // Check if styleData is a string (URL)
    if (typeof styleData === "string") {
      fetch(styleData)
        .then((response) => response.json())
        .then((data) => processStyle(data))
        .catch((error) => {
          console.error(`Error loading style from ${styleData}:`, error);
        });
    } else {
      // styleData is already an object
      processStyle(styleData);
    }
  }

  /**
   * Add a filter to hide features of a specific category
   * @param {Array} currentFilter - Current filter array
   * @param {string} categoryId - Category ID to hide
   * @returns {Array} Updated filter
   * @private
   */
  function addFilterForCategory(currentFilter, categoryId) {
    _hiddenCategories.add(categoryId);

    if (!currentFilter || currentFilter.length === 0) {
      return ["!=", ["get", "categoryId"], categoryId];
    }

    // If the filter is already an 'all' expression, add to it
    if (currentFilter[0] === "all") {
      return [...currentFilter, ["!=", ["get", "categoryId"], categoryId]];
    }

    // Otherwise, wrap in 'all'
    return ["all", currentFilter, ["!=", ["get", "categoryId"], categoryId]];
  }

  /**
   * Remove a filter that was hiding features of a specific category
   * @param {Array} currentFilter - Current filter array
   * @param {string} categoryId - Category ID to show
   * @returns {Array} Updated filter
   * @private
   */
  function removeFilterForCategory(currentFilter, categoryId) {
    _hiddenCategories.delete(categoryId);

    if (!currentFilter || currentFilter.length === 0) {
      return null;
    }

    // If it's a simple filter for this category
    if (
      currentFilter[0] === "!=" &&
      currentFilter[1][0] === "get" &&
      currentFilter[1][1] === "categoryId" &&
      currentFilter[2] === categoryId
    ) {
      return null;
    }

    // If it's an 'all' expression, remove the specific filter
    if (currentFilter[0] === "all") {
      const newFilters = currentFilter
        .slice(1)
        .filter((f) => {
          return !(
            f[0] === "!=" &&
            f[1][0] === "get" &&
            f[1][1] === "categoryId" &&
            f[2] === categoryId
          );
        });

      if (newFilters.length === 0) {
        return null;
      } else if (newFilters.length === 1) {
        return newFilters[0];
      } else {
        return ["all", ...newFilters];
      }
    }

    return currentFilter;
  }

  // Public API
  return {
    /**
     * Initialize the layers module with the map instance
     * @param {Object} map - MapLibre GL map instance
     */
    init: function (map) {
      console.log("Initializing App.Map.Layers");
      _map = map;
      _featureLayers = [];
      _overlayLayers = {};
      _imageCache = {};
      _categoryLayers.clear();
      _pendingFeatures.clear();
      _featuresByObjectId.clear();
      _isInitialized = true;

      // Process any queued operations
      if (_initQueue.length > 0) {
        console.log(`Processing ${_initQueue.length} queued operations`);
        _initQueue.forEach(operation => {
          try {
            operation();
          } catch (e) {
            console.error("Error processing queued operation:", e);
          }
        });
        _initQueue = [];
      }

      // Subscribe to any bridge events if needed
      console.log("App.Map.Layers initialization complete");
    },
    
    /**
     * Alias for init method to match the bridge's expectation
     * @param {Object} map - MapLibre GL map instance
     */
    initialize: function(map) {
      return this.init(map);
    },

    /**
     * Get list of all feature layers
     * @returns {Array} List of layer IDs
     */
    getFeatureLayers: function () {
      return _featureLayers.slice();
    },

    /**
     * Check if a layer is a feature layer
     * @param {string} layerId - Layer ID to check
     * @returns {boolean} Whether the layer is a feature layer
     */
    isUserAddedLayer: function (layerId) {
      return _isUserAddedLayer(layerId);
    },

    /**
     * Create a new layer (legacy compatibility)
     * @param {string} id - Layer ID
     */
    createLayer: function (id) {
      console.log(`Creating layer: ${id}`);
      
      // If map is not initialized yet, queue this operation
      if (!_isInitialized || !_map) {
        console.warn("Map not initialized yet, queuing createLayer operation");
        _initQueue.push(() => this.createLayer(id));
        return;
      }
      
      // Check if this is a category layer request
      if (id.startsWith("cat-")) {
        const categoryId = id.substring(4);
        _createCategoryLayers(categoryId);
        return;
      }

      // Legacy layer creation
      if (!_map.getSource(id)) {
        _map.addSource(id, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        _featureLayers.push(id);
        console.log(`Layer ${id} created successfully`);
      } else {
        console.log(`Layer ${id} already exists`);
      }
    },

    /**
     * Remove a layer and its source
     * @param {string} id - Layer ID
     */
    removeLayer: function (id) {
      console.log(`Removing layer: ${id}`);
      
      // If map is not initialized yet, queue this operation
      if (!_isInitialized || !_map) {
        console.warn("Map not initialized yet, queuing removeLayer operation");
        _initQueue.push(() => this.removeLayer(id));
        return;
      }

      // Check if this is a category layer
      for (const [categoryId, layerInfo] of _categoryLayers) {
        if (layerInfo.sourceId === id || layerInfo.layerIds.includes(id)) {
          // Remove all associated layers
          layerInfo.layerIds.forEach(layerId => {
            if (_map.getLayer(layerId)) {
              _map.removeLayer(layerId);
            }
            const index = _featureLayers.indexOf(layerId);
            if (index > -1) {
              _featureLayers.splice(index, 1);
            }
          });
          
          // Remove source
          if (_map.getSource(layerInfo.sourceId)) {
            _map.removeSource(layerInfo.sourceId);
          }
          
          // Clean up tracking
          _categoryLayers.delete(categoryId);
          return;
        }
      }

      // Legacy layer removal
      // First, find and remove all layers that use this source
      const style = _map.getStyle();
      if (!style || !style.layers) {
        console.warn("No style or layers found");
        return;
      }
      
      const layers = style.layers;
      const layersToRemove = layers.filter((layer) => layer.source === id);

      layersToRemove.forEach((layer) => {
        _map.removeLayer(layer.id);

        // Remove from tracking
        const index = _featureLayers.indexOf(layer.id);
        if (index > -1) {
          _featureLayers.splice(index, 1);
        }
        delete _overlayLayers[layer.id];
      });

      // Then remove the source
      if (_map.getSource(id)) {
        _map.removeSource(id);
      }

      // Remove from tracking
      const index = _featureLayers.indexOf(id);
      if (index > -1) {
        _featureLayers.splice(index, 1);
      }

      console.log(`Layer ${id} removed successfully`);
    },

    /**
     * Show a layer
     * @param {string} id - Layer ID
     */
    showLayer: function (id) {
      console.log(`Showing layer: ${id}`);
      
      // If map is not initialized yet, queue this operation
      if (!_isInitialized || !_map) {
        console.warn("Map not initialized yet, queuing showLayer operation");
        _initQueue.push(() => this.showLayer(id));
        return;
      }

      // Check if this is a category
      const categoryInfo = _categoryLayers.get(id);
      if (categoryInfo) {
        categoryInfo.layerIds.forEach(layerId => {
          if (_map.getLayer(layerId)) {
            _map.setLayoutProperty(layerId, "visibility", "visible");
            _layerVisibility.set(layerId, true);
          }
        });
        _hiddenCategories.delete(id);
        return;
      }

      // Legacy layer visibility
      if (_isLayerExistant(id)) {
        _map.setLayoutProperty(id, "visibility", "visible");
        _layerVisibility.set(id, true);
      } else {
        // Handle composite layer IDs
        const layerIds = [`${id}-points`, `${id}-lines`, `${id}-polygons-fill`, `${id}-polygons-stroke`];
        layerIds.forEach((layerId) => {
          if (_isLayerExistant(layerId)) {
            _map.setLayoutProperty(layerId, "visibility", "visible");
            _layerVisibility.set(layerId, true);
          }
        });
      }
    },

    /**
     * Hide a layer
     * @param {string} id - Layer ID
     */
    hideLayer: function (id) {
      console.log(`Hiding layer: ${id}`);
      
      // If map is not initialized yet, queue this operation
      if (!_isInitialized || !_map) {
        console.warn("Map not initialized yet, queuing hideLayer operation");
        _initQueue.push(() => this.hideLayer(id));
        return;
      }

      // Check if this is a category
      const categoryInfo = _categoryLayers.get(id);
      if (categoryInfo) {
        categoryInfo.layerIds.forEach(layerId => {
          if (_map.getLayer(layerId)) {
            _map.setLayoutProperty(layerId, "visibility", "none");
            _layerVisibility.set(layerId, false);
          }
        });
        _hiddenCategories.add(id);
        return;
      }

      // Legacy layer visibility
      if (_isLayerExistant(id)) {
        _map.setLayoutProperty(id, "visibility", "none");
        _layerVisibility.set(id, false);
      } else {
        // Handle composite layer IDs
        const layerIds = [`${id}-points`, `${id}-lines`, `${id}-polygons-fill`, `${id}-polygons-stroke`];
        layerIds.forEach((layerId) => {
          if (_isLayerExistant(layerId)) {
            _map.setLayoutProperty(layerId, "visibility", "none");
            _layerVisibility.set(layerId, false);
          }
        });
      }
    },

    /**
     * Clear all features from a layer
     * @param {string} id - Layer ID
     */
    clearLayer: function (id) {
      console.log(`Clearing layer: ${id}`);
      
      if (!_map) {
        console.warn("Map not initialized yet, cannot clear layer");
        return;
      }

      const source = _map.getSource(id);
      if (source && source.type === "geojson") {
        source.setData({
          type: "FeatureCollection",
          features: [],
        });

        // Clear features associated with this layer
        const toRemove = [];
        for (const [objectId, featureInfo] of _featuresByObjectId) {
          if (featureInfo.categoryId === id) {
            toRemove.push(objectId);
          }
        }
        toRemove.forEach(objectId => _featuresByObjectId.delete(objectId));

        console.log(`Layer ${id} cleared successfully`);
      }
    },

    /**
     * Get the visibility state of a layer
     * @param {string} layerId - Layer ID
     * @returns {boolean} Whether the layer is visible
     */
    isLayerVisible: function (layerId) {
      return _layerVisibility.get(layerId) !== false;
    },

    /**
     * Remove a specific object from a layer
     * @param {string} layerId - Layer ID
     * @param {string} objectId - Object ID to remove
     */
    removeObject: function (layerId, objectId) {
      console.log(`Removing object ${objectId} from layer ${layerId}`);
      
      if (!_map) {
        console.warn("Map not initialized yet, cannot remove object");
        return;
      }

      // Check if we have this feature in our tracking
      const featureInfo = _featuresByObjectId.get(objectId);
      if (featureInfo) {
        const categoryInfo = _categoryLayers.get(featureInfo.categoryId);
        if (categoryInfo) {
          const source = _map.getSource(categoryInfo.sourceId);
          if (source) {
            const data = source._data || { type: "FeatureCollection", features: [] };
            data.features = data.features.filter(
              (f) => !(f.properties && f.properties.objectid === objectId)
            );
            source.setData(data);
          }
        }
        _featuresByObjectId.delete(objectId);
      } else {
        // Legacy removal
        const source = _map.getSource(layerId);
        if (source && source.type === "geojson") {
          const data = source._data || { type: "FeatureCollection", features: [] };
          data.features = data.features.filter(
            (f) => !(f.properties && f.properties.objectid === objectId)
          );
          source.setData(data);
        }
      }
    },

    /**
     * Load categories from Java side
     * Creates category-specific layers with appropriate styles
     * @param {string|Array} data - Category data
     */
    loadCategories: function (data) {
      console.log("=== loadCategories called ===");
      console.log("Data type:", typeof data);
      console.log("Data length:", data ? data.length : "null/undefined");
      console.log("Map initialized:", _isInitialized);
      
      // Save raw data for potential reloading after basemap changes
      window._rawCategoryData = data;
      
      // If map is not initialized yet, queue this operation
      if (!_isInitialized || !_map) {
        console.warn("Map not initialized yet, queuing loadCategories operation");
        _initQueue.push(() => this.loadCategories(data));
        return;
      }
      
      // Parse input
      let parsedData;
      let categories;
      try {
        parsedData = typeof data === "string" ? JSON.parse(data) : data;
        
        // Check if this is the new MapLibre style format
        if (parsedData.categories && parsedData.version) {
          console.log("Detected MapLibre style format, version:", parsedData.version);
          categories = parsedData.categories;
          
          // Store style information for each category
          categories.forEach((cat) => {
            if (cat.paint || cat.layout) {
              _categoryStyles.set(cat.id, {
                type: cat.type,
                paint: cat.paint || {},
                layout: cat.layout || {},
                minZoom: cat.minZoom || 0,
                selectable: cat.selectable !== false,
              });
            }
          });
        } else {
          // Legacy format
          if (!Array.isArray(parsedData)) {
            categories = Object.values(parsedData);
          } else {
            categories = parsedData;
          }
        }
        
        console.log("Parse successful, got", categories ? categories.length : 0, "categories");
      } catch (e) {
        console.error("Failed to parse categories:", e);
        return;
      }

      // Cache categories
      _geoCategories = categories;
      _geoCategoryById.clear();
      categories.forEach((cat) => {
        _geoCategoryById.set(cat.id, cat);
        // Debug: Log category zoom settings
        if (cat.minZoom !== undefined && cat.minZoom > 0) {
          console.log(`Category ${cat.name} (${cat.id}) has minZoom: ${cat.minZoom}`);
        }
      });

      console.log("GeoObject categories received:", categories);
      console.log("Total categories:", categories.length);
      // Debug: Show all categories with their zoom settings
      categories.forEach(cat => {
        console.log(`Category: ${cat.name}, minZoom: ${cat.minZoom}, visible: ${cat.clientVisible}`);
      });

      // Create layers for each visible category
      categories
        .filter((c) => c.visible !== false)
        .forEach((c) => {
          _createCategoryLayers(c.id);
        });

      // Notify UI of category update
      console.log("Notifying UI of category update...");
      this._notifyUIOfCategoryUpdate();
      
      // Also try to force refresh the UI after a short delay
      setTimeout(() => {
        if (App.Map.Layers.UI && App.Map.Layers.UI.refreshFromCurrentCategories) {
          console.log("Force refreshing UI from current categories...");
          App.Map.Layers.UI.refreshFromCurrentCategories();
        }
      }, 100);
      
      // Debug
      window._debugCategories = categories;
      console.log("Categories saved to window._debugCategories for debugging");
    },

    /**
     * Get category by ID
     * @param {string} uuid - Category ID
     * @returns {Object} Category object
     */
    getCategoryById: function (uuid) {
      return _geoCategoryById.get(uuid);
    },

    /**
     * Get MapLibre style for a category
     * @param {string} categoryId - Category UUID
     * @returns {Object} Style object with paint and layout properties
     */
    getCategoryStyle: function (categoryId) {
      return _categoryStyles.get(categoryId);
    },

    /**
     * Get all loaded categories
     * @returns {Array} Array of category objects
     */
    getFeatureCategories: function () {
      return _geoCategories.slice();
    },

    /**
     * Add or update a feature (refactored for performance)
     * Features are now added to category-specific layers
     * 
     * IMPORTANT: This function handles multiple patterns from Java:
     * 1. Single features with layerId = "objectLayer_{categoryId}_{objectType}"
     * 2. FeatureCollections where each feature has its own objectid in properties
     * 3. Legacy layers that don't follow category patterns
     * 
     * The Java code often passes the categoryId as the objectid parameter when
     * sending FeatureCollections, but each feature has its correct objectid in
     * its properties. This function handles this correctly.
     * 
     * @param {string} layerId - Layer ID (can be category ID or legacy layer ID)
     * @param {string} objectid - Object ID (or collection ID for FeatureCollections)
     * @param {Object} geojson - GeoJSON data
     * @param {Object} style - Style object (ignored for category layers)
     */
    addFeature: function (layerId, objectid, geojson, style) {
      console.log(`Adding feature to layer: ${layerId}, objectid: ${objectid}`);
      
      // If map is not initialized yet, queue this operation
      if (!_isInitialized || !_map) {
        console.warn("Map not initialized yet, queuing addFeature operation");
        _initQueue.push(() => this.addFeature(layerId, objectid, geojson, style));
        return;
      }
      
      // Debug: Log the raw parameters
      console.log(`addFeature debug - layerId: ${layerId}, objectid: ${objectid}, geojson type: ${typeof geojson}, style:`, style);
      
      // Parse GeoJSON if string
      if (typeof geojson === "string") {
        try {
          geojson = JSON.parse(geojson);
        } catch (e) {
          console.error(`Error parsing GeoJSON: ${e.message}`);
          return;
        }
      }

      // Extract features from GeoJSON
      const features = [];
      
      // Debug: Log the GeoJSON type
      console.log(`GeoJSON type: ${geojson.type}, geometries/features count: ${
        geojson.features?.length || geojson.geometries?.length || 1
      }`);
      
      // Check if the GeoJSON has a categoryId property at the root level
      let rootCategoryId = geojson.properties?.categoryId || geojson.categoryId;
      
      if (geojson.type === "FeatureCollection") {
        geojson.features.forEach((feature) => {
          if (!feature.properties) {
            feature.properties = {};
          }
          // For FeatureCollections, prefer the individual feature's objectid if it exists
          // This handles the case where Java sends a collection of features with their own IDs
          if (!feature.properties.objectid) {
            feature.properties.objectid = objectid;
          }
          // Inherit category ID from root if not present
          if (rootCategoryId && !feature.properties.categoryId) {
            feature.properties.categoryId = rootCategoryId;
          }
          features.push(feature);
        });
      } else if (geojson.type === "GeometryCollection") {
        geojson.geometries.forEach((geometry, index) => {
          features.push({
            type: "Feature",
            geometry: geometry,
            properties: {
              objectid: objectid,
              categoryId: rootCategoryId || geojson.properties?.categoryId,
              _geometryIndex: index  // Track which geometry this is from the collection
            }
          });
        });
      } else if (geojson.type === "Feature") {
        if (!geojson.properties) {
          geojson.properties = {};
        }
        geojson.properties.objectid = objectid;
        // Add category ID if present at root
        if (rootCategoryId && !geojson.properties.categoryId) {
          geojson.properties.categoryId = rootCategoryId;
        }
        features.push(geojson);
      } else {
        // Raw geometry
        features.push({
          type: "Feature",
          geometry: geojson,
          properties: {
            objectid: objectid,
            categoryId: rootCategoryId
          }
        });
      }

      // Determine category ID
      let categoryId = null;
      
      // Check if features have categoryId
      if (features.length > 0 && features[0].properties?.categoryId) {
        categoryId = features[0].properties.categoryId;
      }
      // Check if layerId is a category ID
      else if (_geoCategoryById.has(layerId)) {
        categoryId = layerId;
      }
      // Check if layerId follows category layer pattern
      else if (layerId.startsWith("cat-")) {
        categoryId = layerId.substring(4);
      }
      // Check if layerId follows the Java pattern: objectLayer_{categoryId}_{objectType}
      else if (layerId.startsWith("objectLayer_")) {
        const parts = layerId.split("_");
        if (parts.length >= 2) {
          const potentialCategoryId = parts[1];
          if (_geoCategoryById.has(potentialCategoryId)) {
            categoryId = potentialCategoryId;
            console.log(`Detected category ${categoryId} from Java layer pattern: ${layerId}`);
          }
        }
      }

      // If we have a category, use optimized path
      if (categoryId && _geoCategoryById.has(categoryId)) {
        console.log(`Using category path for ${features.length} features in category ${categoryId}`);
        
        // Ensure category layers exist
        if (!_categoryLayers.has(categoryId)) {
          _createCategoryLayers(categoryId);
        }
        
        // Add categoryId to all features
        features.forEach(feature => {
          feature.properties.categoryId = categoryId;
        });
        
        // Add to pending batch
        features.forEach((feature, index) => {
          // Use the feature's own objectid if it has one (from FeatureCollection)
          const featureId = feature.properties.objectid || `${objectid}_${index}`;
          _addToPendingBatch(categoryId, featureId, feature);
        });
        
        console.log(`Added ${features.length} features to category ${categoryId} batch`);
      } else {
        // Legacy path for non-category layers
        console.log(`Using legacy path for layer ${layerId}`);
        
        // Create layer if needed
        if (!_map.getSource(layerId)) {
          this.createLayer(layerId);
        }
        
        // Add features immediately
        const source = _map.getSource(layerId);
        if (source) {
          const data = source._data || { type: "FeatureCollection", features: [] };
          
          // Remove existing features with this objectid
          data.features = data.features.filter(
            (f) => !(f.properties && f.properties.objectid === objectid)
          );
          
          // Add new features
          data.features.push(...features);
          
          // Update source
          source.setData(data);
          
          console.log(`Added ${features.length} features to legacy layer ${layerId}`);
        }
      }
    },

    /**
     * Add a circle marker to a layer
     * @param {string} layerId - Layer ID
     * @param {string} objId - Object ID
     * @param {Array} position - Position [lng, lat]
     * @param {Object} style - Style object
     * @param {string} label - Label text
     * @param {boolean} draggable - Whether the marker is draggable
     */
    addCircleMarker: function (layerId, objId, position, style, label, draggable) {
      const geojson = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [position.lng, position.lat]
        },
        properties: {
          label: label,
          draggable: draggable
        }
      };
      
      this.addFeature(layerId, objId, geojson, style);
    },

    /**
     * Add an image marker to a layer
     * @param {string} layerId - Layer ID
     * @param {string} objId - Object ID
     * @param {Array} position - Position [lng, lat]
     * @param {Object} bitmap - Bitmap image data
     * @param {number} size - Size of the marker
     * @param {string} label - Label text
     * @param {boolean} draggable - Whether the marker is draggable
     * @param {boolean} markerOffset - Whether to apply marker offset
     */
    addImageMarker: function (layerId, objId, position, bitmap, size, label, draggable, markerOffset) {
      console.log(`Adding image marker to layer: ${layerId}, objId: ${objId}`);
      
      // If map is not initialized yet, queue this operation
      if (!_isInitialized || !_map) {
        console.warn("Map not initialized yet, queuing addImageMarker operation");
        _initQueue.push(() => this.addImageMarker(layerId, objId, position, bitmap, size, label, draggable, markerOffset));
        return;
      }
      
      // Convert bitmap to data URL if needed
      const imageId = `marker-${objId}`;
      
      if (bitmap && !_map.hasImage(imageId)) {
        // Store in cache for later use
        _imageCache[imageId] = bitmap;
        
        // Add image to map
        _map.addImage(imageId, bitmap);
      }
      
      const geojson = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [position.lng, position.lat]
        },
        properties: {
          icon: imageId,
          iconSize: size,
          label: label,
          draggable: draggable,
          offset: markerOffset
        }
      };
      
      this.addFeature(layerId, objId, geojson, null);
    },

    /**
     * Load a feature collection for a layer
     * Optimized for batch loading
     * @param {string} layerId - Layer ID
     * @param {Object} featureCollection - GeoJSON FeatureCollection
     */
    loadFeatureCollection: function(layerId, featureCollection) {
      console.log(`Loading feature collection for layer: ${layerId}`);
      
      if (!_isInitialized || !_map) {
        console.warn("Map not initialized yet, queuing loadFeatureCollection operation");
        _initQueue.push(() => this.loadFeatureCollection(layerId, featureCollection));
        return;
      }
      
      // Parse if string
      let data = featureCollection;
      if (typeof featureCollection === 'string') {
        try {
          data = JSON.parse(featureCollection);
        } catch (e) {
          console.error(`Error parsing feature collection: ${e.message}`);
          return;
        }
      }
      
      // FIXED: Extract category ID from layerId pattern and add to features
      let extractedCategoryId = null;
      if (layerId.startsWith("objectLayer_")) {
        const parts = layerId.split("_");
        if (parts.length >= 2) {
          extractedCategoryId = parts[1];
          console.log(`Extracted category ID from layer pattern: ${extractedCategoryId}`);
          
          // Add categoryId to all features if missing
          if (data.features && data.features.length > 0) {
            data.features.forEach(feature => {
              if (!feature.properties) {
                feature.properties = {};
              }
              if (!feature.properties.categoryId) {
                feature.properties.categoryId = extractedCategoryId;
                console.log(`Added missing categoryId to feature: ${feature.properties.objectid}`);
              }
            });
          }
        }
      }
      
      // Check if all features belong to the same category
      let categoryId = extractedCategoryId;
      let allSameCategory = true;
      
      if (data.features && data.features.length > 0) {
        // Use the first feature's categoryId if we don't have one from the layerId
        if (!categoryId) {
          categoryId = data.features[0].properties?.categoryId;
        }
        
        if (categoryId) {
          allSameCategory = data.features.every(f => 
            f.properties?.categoryId === categoryId
          );
        }
      }
      
      // If all features are from the same category, use category layer
      if (categoryId && allSameCategory && _geoCategoryById.has(categoryId)) {
        console.log(`All features belong to category ${categoryId}, using optimized path`);
        
        // Ensure category layers exist
        if (!_categoryLayers.has(categoryId)) {
          console.log(`Creating category layers for ${categoryId}`);
          _createCategoryLayers(categoryId);
        }
        
        const layerInfo = _categoryLayers.get(categoryId);
        if (layerInfo) {
          const source = _map.getSource(layerInfo.sourceId);
          
          if (source) {
            // Set all features at once
            source.setData(data);
            console.log(`Loaded ${data.features.length} features to category ${categoryId}`);
            
            // Update labels if needed
            if (App.Map.LabelsEnhanced) {
              App.Map.LabelsEnhanced.updateSourceLabels(layerInfo.sourceId);
            }
          } else {
            console.error(`Source ${layerInfo.sourceId} not found for category ${categoryId}`);
          }
        } else {
          console.error(`Layer info not found for category ${categoryId}`);
        }
      } else {
        // Mixed categories or no category - use legacy approach
        console.log(`Mixed or no categories, using legacy approach`);
        console.log(`Debug: categoryId=${categoryId}, allSameCategory=${allSameCategory}, categoryExists=${_geoCategoryById.has(categoryId)}`);
        
        // Create or update source
        let source = _map.getSource(layerId);
        if (!source) {
          _map.addSource(layerId, {
            type: "geojson",
            data: data
          });
          
          if (!_featureLayers.includes(layerId)) {
            _featureLayers.push(layerId);
          }
        } else {
          source.setData(data);
        }
        
        console.log(`Loaded ${data.features.length} features to layer ${layerId}`);
      }
    },
    
    /**
     * Batch update multiple layers at once
     * @param {Object} layerData - Object with layerId as keys and feature collections as values
     */
    batchUpdateLayers: function(layerData) {
      console.log(`Batch updating ${Object.keys(layerData).length} layers`);
      
      if (!_isInitialized || !_map) {
        console.warn("Map not initialized yet, queuing batchUpdateLayers operation");
        _initQueue.push(() => this.batchUpdateLayers(layerData));
        return;
      }
      
      // Group updates by category for optimization
      const categoryUpdates = new Map();
      const legacyUpdates = {};
      
      Object.entries(layerData).forEach(([layerId, featureCollection]) => {
        // Parse if needed
        let data = featureCollection;
        if (typeof featureCollection === 'string') {
          try {
            data = JSON.parse(featureCollection);
          } catch (e) {
            console.error(`Error parsing feature collection for ${layerId}: ${e.message}`);
            return;
          }
        }
        
        // Check if this is category data
        if (data.features && data.features.length > 0) {
          const categoryId = data.features[0].properties?.categoryId;
          if (categoryId && _geoCategoryById.has(categoryId)) {
            if (!categoryUpdates.has(categoryId)) {
              categoryUpdates.set(categoryId, []);
            }
            categoryUpdates.get(categoryId).push(...data.features);
          } else {
            legacyUpdates[layerId] = data;
          }
        }
      });
      
      // Process category updates
      for (const [categoryId, features] of categoryUpdates) {
        if (!_categoryLayers.has(categoryId)) {
          _createCategoryLayers(categoryId);
        }
        
        const layerInfo = _categoryLayers.get(categoryId);
        const source = _map.getSource(layerInfo.sourceId);
        
        if (source) {
          source.setData({
            type: "FeatureCollection",
            features: features
          });
        }
      }
      
      // Process legacy updates
      Object.entries(legacyUpdates).forEach(([layerId, data]) => {
        this.loadFeatureCollection(layerId, data);
      });
      
      // Ensure proper layer ordering
      this.moveFeatureLayersToTop();
    },

    /**
     * Move all feature layers to the top of the layer stack
     */
    moveFeatureLayersToTop: function () {
      console.log("Moving feature layers to top");
      
      if (!_map) {
        console.warn("Map not initialized yet, cannot move feature layers");
        return;
      }

      const style = _map.getStyle();
      if (!style || !style.layers || style.layers.length === 0) {
        console.warn("No style or layers available");
        return;
      }
      
      const allLayers = style.layers;
      const topLayerId = allLayers[allLayers.length - 1].id;

      // Move all tracked feature layers to top
      _featureLayers.forEach((layerId) => {
        if (_map.getLayer(layerId) && layerId !== topLayerId) {
          _map.moveLayer(layerId);
        }
      });

      // Move category layers to top
      for (const [categoryId, layerInfo] of _categoryLayers) {
        layerInfo.layerIds.forEach(layerId => {
          if (_map.getLayer(layerId) && layerId !== topLayerId) {
            _map.moveLayer(layerId);
          }
        });
      }
    },

    /**
     * Zoom to the bounds of a layer's features
     * @param {string} layerId - Layer ID
     */
    zoomToLayerBounds: function (layerId) {
      if (!_map) {
        console.warn("Map not initialized yet, cannot zoom to layer bounds");
        return;
      }
      
      let source = null;
      
      // Check if this is a category layer
      if (_geoCategoryById.has(layerId)) {
        const layerInfo = _categoryLayers.get(layerId);
        if (layerInfo) {
          source = _map.getSource(layerInfo.sourceId);
        }
      } else {
        source = _map.getSource(layerId);
      }

      if (source && source.type === "geojson") {
        const data = source._data;

        if (data && data.features.length > 0) {
          const bounds = new maplibregl.LngLatBounds();

          data.features.forEach(function (feature) {
            if (feature.geometry.type === "Point") {
              bounds.extend(feature.geometry.coordinates);
            } else if (feature.geometry.type === "Polygon") {
              feature.geometry.coordinates[0].forEach(function (coord) {
                bounds.extend(coord);
              });
            } else if (feature.geometry.type === "LineString") {
              feature.geometry.coordinates.forEach(function (coord) {
                bounds.extend(coord);
              });
            }
          });

          _map.fitBounds(bounds, {
            padding: 20,
          });
        }
      }
    },

    /**
     * Add WMS layer
     * @param {string} id - Layer ID
     * @param {string} url - WMS URL
     * @param {string} layer - Layer name
     * @param {string} format - Image format
     * @param {number} minZoom - Minimum zoom level
     * @param {number} maxZoom - Maximum zoom level
     */
    addWMSLayer: function (id, url, layer, format, minZoom, maxZoom) {
      console.log(`Adding WMS layer: ${id}`);
      
      if (!_isInitialized || !_map) {
        console.warn("Map not initialized yet, queuing addWMSLayer operation");
        _initQueue.push(() => this.addWMSLayer(id, url, layer, format, minZoom, maxZoom));
        return;
      }

      const source = {
        type: "raster",
        tiles: [
          `${url}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=${format}&TRANSPARENT=true&LAYERS=${layer}&WIDTH=256&HEIGHT=256&SRS=EPSG:3857&BBOX={bbox-epsg-3857}`,
        ],
        tileSize: 256,
      };

      _map.addSource(id, source);

      _map.addLayer({
        id: id,
        type: "raster",
        source: id,
        paint: {},
        minzoom: minZoom || 0,
        maxzoom: maxZoom || 24,
      });

      _overlayLayers[id] = id;
      console.log(`WMS layer ${id} added successfully`);
    },

    /**
     * Add secure WMS layer with access token
     * @param {string} id - Layer ID
     * @param {string} url - WMS URL
     * @param {string} layer - Layer name
     * @param {string} format - Image format
     * @param {string} accessToken - Access token
     */
    addSecureWMSLayer: function (id, url, layer, format, accessToken) {
      console.log(`Adding secure WMS layer: ${id}`);
      
      if (!_isInitialized || !_map) {
        console.warn("Map not initialized yet, queuing addSecureWMSLayer operation");
        _initQueue.push(() => this.addSecureWMSLayer(id, url, layer, format, accessToken));
        return;
      }

      const source = {
        type: "raster",
        tiles: [
          `${url}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=${format}&TRANSPARENT=true&LAYERS=${layer}&WIDTH=256&HEIGHT=256&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&access_token=${accessToken}`,
        ],
        tileSize: 256,
      };

      _map.addSource(id, source);

      _map.addLayer({
        id: id,
        type: "raster",
        source: id,
        paint: {},
      });

      _overlayLayers[id] = id;
      console.log(`Secure WMS layer ${id} added successfully`);
    },

    /**
     * Add WMTS layer
     * @param {string} id - Layer ID
     * @param {string} url - WMTS URL
     * @param {string} layer - Layer name
     * @param {string} format - Image format
     */
    addWMTSLayer: function (id, url, layer, format) {
      console.log(`Adding WMTS layer: ${id}`);
      
      if (!_isInitialized || !_map) {
        console.warn("Map not initialized yet, queuing addWMTSLayer operation");
        _initQueue.push(() => this.addWMTSLayer(id, url, layer, format));
        return;
      }

      const source = {
        type: "raster",
        tiles: [`${url}/${layer}/{z}/{x}/{y}.${format}`],
        tileSize: 256,
      };

      _map.addSource(id, source);

      _map.addLayer({
        id: id,
        type: "raster",
        source: id,
        paint: {},
      });

      _overlayLayers[id] = id;
      console.log(`WMTS layer ${id} added successfully`);
    },

    /**
     * Add vector layer with style
     * @param {string} layerId - Layer ID
     * @param {string} objId - Object ID
     * @param {string} path - Path to style JSON
     */
    addVectorLayer: function (layerId, objId, path) {
      console.log(`Adding vector layer: ${layerId} from ${path}`);

      fetch(path)
        .then((response) => response.json())
        .then((style) => {
          const spriteUrl = style.sprite || null;
          _applyOverlayStyle(style, spriteUrl, layerId, objId);
        })
        .catch((error) => {
          console.error(`Error loading vector layer style: ${error}`);
        });
    },

    /**
     * Notify UI of category update
     * @private
     */
    _notifyUIOfCategoryUpdate: function() {
      // Multiple notification methods for compatibility
      
      // Method 1: Direct function call if available
      if (window.Android && window.Android.onCategoriesLoaded) {
        console.log("Notifying Android via onCategoriesLoaded");
        window.Android.onCategoriesLoaded();
      }
      
      // Method 2: Event dispatch
      if (window.dispatchEvent) {
        console.log("Dispatching categoriesLoaded event");
        window.dispatchEvent(new Event('categoriesLoaded'));
      }
      
      // Method 3: Direct UI update if available
      if (App.Map.Layers.UI && App.Map.Layers.UI.updateFeatureLayersFromCategories) {
        console.log("Updating UI directly with", _geoCategories.length, "categories");
        App.Map.Layers.UI.updateFeatureLayersFromCategories(_geoCategories);
      } else {
        console.warn("App.Map.Layers.UI or updateFeatureLayersFromCategories not available");
        console.log("App.Map.Layers.UI exists:", !!App.Map.Layers.UI);
        if (App.Map.Layers.UI) {
          console.log("updateFeatureLayersFromCategories exists:", !!App.Map.Layers.UI.updateFeatureLayersFromCategories);
        }
      }
    },

    /**
     * Set layer visibility (MapLibre specific)
     * @param {string} layerId - Layer or category ID
     * @param {boolean} visible - Visibility state
     */
    setLayerVisibility: function(layerId, visible) {
      console.log(`Setting layer ${layerId} visibility to ${visible}`);
      
      // If map is not initialized yet, queue this operation
      if (!_isInitialized || !_map) {
        console.warn("Map not initialized yet, queuing setLayerVisibility operation");
        _initQueue.push(() => this.setLayerVisibility(layerId, visible));
        return;
      }
      
      // Check if this is a category
      const categoryInfo = _categoryLayers.get(layerId);
      if (categoryInfo) {
        categoryInfo.layerIds.forEach(id => {
          if (_map.getLayer(id)) {
            _map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
            _layerVisibility.set(id, visible);
          }
        });
        
        if (visible) {
          _hiddenCategories.delete(layerId);
        } else {
          _hiddenCategories.add(layerId);
        }
        
        // Notify callback if set
        if (window._layerVisibilityCallback) {
          const source = _map.getSource(categoryInfo.sourceId);
          const featureCount = source?._data?.features?.length || 0;
          window._layerVisibilityCallback(layerId, visible, featureCount);
        }
      } else {
        // Legacy layer
        if (visible) {
          this.showLayer(layerId);
        } else {
          this.hideLayer(layerId);
        }
      }
    },

    /**
     * Set layer selectability (MapLibre specific)
     * @param {string} layerId - Layer or category ID
     * @param {boolean} selectable - Selectability state
     */
    setLayerSelectable: function(layerId, selectable) {
      console.log(`Setting layer ${layerId} selectability to ${selectable}`);
      
      // Store selectability state in category styles
      if (_geoCategoryById.has(layerId)) {
        const styleInfo = _categoryStyles.get(layerId) || {};
        styleInfo.selectable = selectable;
        _categoryStyles.set(layerId, styleInfo);
      }
    },

    /**
     * Update multiple layer settings at once
     * @param {string} layerSettingsJson - JSON string with layer settings
     */
    updateLayerSettings: function(layerSettingsJson) {
      console.log("Updating layer settings");
      
      try {
        const settings = JSON.parse(layerSettingsJson);
        
        Object.entries(settings).forEach(([layerId, config]) => {
          if (config.visible !== undefined) {
            this.setLayerVisibility(layerId, config.visible);
          }
          if (config.selectable !== undefined) {
            this.setLayerSelectable(layerId, config.selectable);
          }
        });
      } catch (e) {
        console.error("Error parsing layer settings:", e);
      }
    },

    /**
     * Get category by ID
     * @param {string} categoryId - Category ID
     * @returns {Object|null} Category object or null if not found
     */
    getCategoryById: function(categoryId) {
      return _geoCategoryById.get(categoryId) || null;
    },
    
    /**
     * Force process any pending features immediately
     * Useful for debugging or ensuring all features are displayed
     */
    forceProcessPending: function() {
      if (_batchTimeout) {
        clearTimeout(_batchTimeout);
        _batchTimeout = null;
      }
      
      if (_pendingFeatures.size > 0) {
        console.log(`Force processing ${_pendingFeatures.size} pending batches`);
        _processPendingBatches();
        
        // FIXED: Verify processing completed successfully
        if (_pendingFeatures.size > 0) {
          console.error(`Processing failed! Still have ${_pendingFeatures.size} pending batches`);
        }
      } else {
        console.log("No pending features to process");
      }
    },
    
    /**
     * Get current feature statistics
     * @returns {Object} Statistics about loaded features
     */
    getFeatureStats: function() {
      const stats = {
        categories: _geoCategories.length,
        categoryLayers: _categoryLayers.size,
        pendingBatches: _pendingFeatures.size,
        pendingFeatures: 0,
        loadedFeatures: 0,
        featuresByCategory: {}
      };
      
      // Count pending features
      for (const [categoryId, featuresMap] of _pendingFeatures) {
        stats.pendingFeatures += featuresMap.size;
        stats.featuresByCategory[categoryId] = { pending: featuresMap.size, loaded: 0 };
      }
      
      // Count loaded features
      if (_map) {
        for (const [categoryId, layerInfo] of _categoryLayers) {
          const source = _map.getSource(layerInfo.sourceId);
          if (source && source._data && source._data.features) {
            const count = source._data.features.length;
            stats.loadedFeatures += count;
            if (!stats.featuresByCategory[categoryId]) {
              stats.featuresByCategory[categoryId] = { pending: 0, loaded: 0 };
            }
            stats.featuresByCategory[categoryId].loaded = count;
          }
        }
      }
      
      return stats;
    },
    
    /**
     * Restore category layer tracking after a style change
     * This rebuilds the internal tracking structures by examining the current map state
     */
    restoreCategoryTracking: function() {
      console.log("Restoring category layer tracking after style change");
      
      if (!_map) {
        console.error("Cannot restore category tracking - map not initialized");
        return;
      }
      
      // Clear existing tracking
      _categoryLayers.clear();
      _featureLayers = [];
      
      // Rebuild tracking from existing map sources and layers
      const style = _map.getStyle();
      if (!style || !style.sources) {
        console.warn("No style or sources found");
        return;
      }
      
      // First, identify all category sources
      Object.keys(style.sources).forEach(sourceId => {
        if (sourceId.startsWith('category-')) {
          const categoryId = sourceId.substring(9); // Remove 'category-' prefix
          
          // Find all layers using this source
          const layerIds = [];
          style.layers.forEach(layer => {
            if (layer.source === sourceId) {
              layerIds.push(layer.id);
              
              // Add to feature layers tracking
              if (!_featureLayers.includes(layer.id)) {
                _featureLayers.push(layer.id);
              }
            }
          });
          
          // Restore category layer tracking
          if (layerIds.length > 0) {
            _categoryLayers.set(categoryId, {
              sourceId: sourceId,
              layerIds: layerIds
            });
            console.log(`Restored tracking for category ${categoryId} with ${layerIds.length} layers`);
          }
        }
      });
      
      // Also identify any other feature layers (legacy layers)
      style.layers.forEach(layer => {
        if (layer.source && style.sources[layer.source] && 
            style.sources[layer.source].type === 'geojson' &&
            !layer.source.startsWith('category-') &&
            !_featureLayers.includes(layer.id)) {
          _featureLayers.push(layer.id);
        }
      });
      
      console.log(`Category tracking restored: ${_categoryLayers.size} categories, ${_featureLayers.length} feature layers`);
      
      // If we have categories loaded, recreate any missing category layers
      if (_geoCategories.length > 0) {
        console.log("Recreating missing category layers...");
        _geoCategories
          .filter(cat => cat.visible !== false && !_categoryLayers.has(cat.id))
          .forEach(cat => {
            console.log(`Recreating layers for category ${cat.id}`);
            _createCategoryLayers(cat.id);
          });
      }
    }
  };
})();

// Diagnostic utilities
window.checkCats = function() {
  console.log("=== Bridge Status ===");
  console.log("Bridge ready:", window._bridgeReady ? "YES" : "NO");
  console.log("Bridge ready time:", window._bridgeReadyTime || "never");
  console.log("interface exists:", !!window.interface);
  console.log("interface.loadCategories exists:", !!(window.interface && window.interface.loadCategories));
  
  const cats = App.Map.Layers.getFeatureCategories();
  console.log("\n=== Categories Status ===");
  console.log("Total categories:", cats.length);
  console.log("Categories:", cats);
  
  console.log("\n=== Category Layers ===");
  const categoryLayers = App.Map.Layers._categoryLayers || new Map();
  console.log("Category layers created:", categoryLayers.size);
  for (const [categoryId, layerInfo] of categoryLayers) {
    console.log(`- ${categoryId}:`, layerInfo);
  }
};

window.reloadCats = function() {
  if (window._rawCategoryData) {
    console.log("Reloading categories from saved data...");
    App.Map.Layers.loadCategories(window._rawCategoryData);
  } else {
    console.log("No saved category data found");
  }
};

// Debug map state
window.checkMapState = function() {
  const map = window.interface ? window.interface.map : null;
  if (!map) {
    console.log("Map not available");
    return;
  }
  
  console.log("=== Map State ===");
  console.log("Map loaded:", map.loaded());
  console.log("Map style loaded:", map.isStyleLoaded());
  console.log("Current zoom:", map.getZoom());
  
  const style = map.getStyle();
  if (style) {
    console.log("\n=== Sources ===");
    let totalFeatures = 0;
    Object.keys(style.sources).forEach(sourceId => {
      const source = style.sources[sourceId];
      console.log(`- ${sourceId}: type=${source.type}`);
      if (source.type === 'geojson' && map.getSource(sourceId)) {
        const data = map.getSource(sourceId)._data;
        if (data && data.features) {
          console.log(`  Features: ${data.features.length}`);
          totalFeatures += data.features.length;
          
          // Show feature types
          const types = {};
          data.features.forEach(f => {
            const geomType = f.geometry?.type || 'unknown';
            types[geomType] = (types[geomType] || 0) + 1;
          });
          console.log(`  Feature types:`, types);
        }
      }
    });
    console.log(`\nTotal features across all sources: ${totalFeatures}`);
    
    console.log("\n=== Layers ===");
    const categoryLayers = [];
    const featureLayers = [];
    const baseLayers = [];
    
    style.layers.forEach(layer => {
      if (layer.id.includes('category-')) {
        categoryLayers.push(layer);
      } else if (layer.source && style.sources[layer.source] && style.sources[layer.source].type === 'geojson') {
        featureLayers.push(layer);
      } else {
        baseLayers.push(layer);
      }
    });
    
    console.log(`Category layers: ${categoryLayers.length}`);
    categoryLayers.forEach(l => {
      const visibility = map.getLayoutProperty(l.id, 'visibility') || 'visible';
      const minzoom = l.minzoom || 0;
      const maxzoom = l.maxzoom || 24;
      console.log(`  - ${l.id} (${l.type}) vis=${visibility} zoom=[${minzoom}-${maxzoom}]`);
    });
    
    console.log(`\nFeature layers: ${featureLayers.length}`);
    featureLayers.forEach(l => console.log(`  - ${l.id} (${l.type})`, 
      map.getLayoutProperty(l.id, 'visibility') || 'visible'));
    
    console.log(`\nBase layers: ${baseLayers.length}`);
  }
  
  // Check pending features
  if (window.App && window.App.Map && window.App.Map.Layers) {
    const pendingCount = App.Map.Layers._pendingFeatures ? App.Map.Layers._pendingFeatures.size : 0;
    console.log(`\nPending feature batches: ${pendingCount}`);
  }
};

// Debug function to check feature visibility
// Force show all features (for debugging)
window.showAllFeatures = function() {
  const map = window.interface ? window.interface.map : null;
  if (!map) {
    console.log("Map not available");
    return;
  }
  
  console.log("=== Forcing all features visible ===");
  
  // First, force process any pending features
  if (App.Map.Layers.forceProcessPending) {
    App.Map.Layers.forceProcessPending();
  }
  
  // Show all category layers
  const style = map.getStyle();
  if (style && style.layers) {
    let count = 0;
    style.layers.forEach(layer => {
      if (layer.id.includes('category-') || 
          (layer.source && style.sources[layer.source] && style.sources[layer.source].type === 'geojson')) {
        map.setLayoutProperty(layer.id, 'visibility', 'visible');
        
        // Remove any zoom restrictions temporarily
        if (layer.minzoom !== undefined) {
          map.setLayerZoomRange(layer.id, 0, 24);
        }
        count++;
      }
    });
    console.log(`Made ${count} layers visible`);
  }
  
  // Clear hidden categories
  if (App.Map.Layers._hiddenCategories) {
    App.Map.Layers._hiddenCategories.clear();
  }
  
  // Get feature stats
  const stats = App.Map.Layers.getFeatureStats ? App.Map.Layers.getFeatureStats() : {};
  console.log("\nFeature statistics:", stats);
};

window.debugFeatures = function(categoryId) {
  const map = window.interface ? window.interface.map : null;
  if (!map) {
    console.log("Map not available");
    return;
  }
  
  const sourceId = categoryId ? `category-${categoryId}` : null;
  
  if (sourceId) {
    const source = map.getSource(sourceId);
    if (source) {
      const data = source._data;
      if (data && data.features) {
        console.log(`\n=== Features in ${sourceId} ===`);
        console.log(`Total features: ${data.features.length}`);
        
        // Sample first 5 features
        console.log("\nFirst 5 features:");
        data.features.slice(0, 5).forEach((f, i) => {
          console.log(`${i + 1}. ID: ${f.properties?.objectid}, Type: ${f.geometry?.type}, Category: ${f.properties?.categoryId}`);
        });
        
        // Check visibility of layers
        const layerInfo = App.Map.Layers._categoryLayers?.get(categoryId);
        if (layerInfo) {
          console.log(`\nLayer visibility for category ${categoryId}:`);
          layerInfo.layerIds.forEach(layerId => {
            if (map.getLayer(layerId)) {
              const visibility = map.getLayoutProperty(layerId, 'visibility') || 'visible';
              const layer = map.getLayer(layerId);
              console.log(`- ${layerId}: ${visibility} (zoom: ${layer.minzoom || 0}-${layer.maxzoom || 24})`);
            }
          });
        }
      }
    } else {
      console.log(`Source ${sourceId} not found`);
    }
  } else {
    // List all category sources
    console.log("\n=== All Category Sources ===");
    const style = map.getStyle();
    if (style && style.sources) {
      Object.keys(style.sources).forEach(sourceId => {
        if (sourceId.startsWith('category-')) {
          const source = map.getSource(sourceId);
          if (source && source._data && source._data.features) {
            console.log(`${sourceId}: ${source._data.features.length} features`);
          }
        }
      });
    }
  }
};