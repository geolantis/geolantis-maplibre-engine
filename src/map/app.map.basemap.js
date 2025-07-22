/**
 * Basemap management
 * @namespace App.Map.Basemap
 */
App.Map = App.Map || {};
App.Map.Basemap = (function () {
  // Private variables
  var _map = null;
  var _activeBackgroundLayer = "Basemap Standard"; // Default active layer
  var _layerVisibility = new Map(); // Track visibility state of layers

  /**
   * Check if a layer is a background layer
   * @param {Object} layer - Layer object
   * @returns {boolean} Whether the layer is a background layer
   * @private
   */
  function _isBackgroundLayer(layer) {
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
        const source = _map.getStyle().sources[layer.source];
        if (source && (source.type === "vector" || source.type === "raster")) {
          return true;
        }
      } else if (layer.type === "background") {
        // Background layers don't have a source but are definitely background
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a layer was added by the user
   * @param {string} layerId - Layer ID to check
   * @returns {boolean} Whether the layer was user-added
   * @private
   */
  function _isUserAddedLayer(layerId) {
    // Check if the layer uses a GeoJSON source
    const layer = _map.getStyle().layers.find((l) => l.id === layerId);
    if (layer && layer.source) {
      const source = _map.getStyle().sources[layer.source];
      return source && source.type === "geojson";
    }

    return false;
  }

  /**
   * Find the first non-base layer for insertion point
   * @returns {string|undefined} Layer ID or undefined
   * @private
   */
  function _getFirstNonBaseLayer() {
    const style = _map.getStyle();
    if (!style || !style.layers) return undefined;

    // Find the first layer that is a user-added layer
    for (let i = 0; i < style.layers.length; i++) {
      if (_isUserAddedLayer(style.layers[i].id)) {
        return style.layers[i].id;
      }
    }

    return undefined; // Will add to the top if no user layers found
  }

  // Public API
  return {
    /**
     * Initialize basemap management
     * @param {Object} map - The MapLibre map instance
     */
    initialize: function (map) {
      _map = map;
      console.log("Basemap management initialized");
    },

    /**
     * Get the currently active background layer
     * @returns {string} The active background layer name
     */
    getActiveBackgroundLayer: function () {
      return _activeBackgroundLayer;
    },

    /**
     * Set the basemap to the specified layer
     * @param {string} selectedLayer - Name of the layer to set as basemap
     */
    setBasemap: function (selectedLayer) {
      const selectedConfig = mapConfig.backgroundMaps[selectedLayer];

      if (!selectedConfig) {
        console.error(`Configuration for ${selectedLayer} not found.`);
        return;
      }

      // Save the selected basemap to localStorage
      try {
        localStorage.setItem('geolantis360_selected_basemap', selectedLayer);
        console.log(`Saved basemap preference: ${selectedLayer}`);
      } catch (e) {
        console.warn('Could not save basemap preference:', e);
      }

      // Remove any previous base layers
      if (_map.getLayer("base-layer")) {
        _map.removeLayer("base-layer");
        _map.removeSource("base-layer");
      }

      // Google Maps basemaps or vector tile basemaps
      if (selectedConfig.style) {
        // Save current view state (zoom, center, bearing, pitch)
        const currentZoom = _map.getZoom();
        const currentCenter = _map.getCenter();
        const currentBearing = _map.getBearing();
        const currentPitch = _map.getPitch();
        
        // Save reference to current GeoJSON and navigation layers before style change
        const currentStyle = _map.getStyle();
        const userSources = {};
        const userLayers = [];

        // Store all GeoJSON sources and user layers
        if (currentStyle && currentStyle.sources) {
          Object.keys(currentStyle.sources).forEach((sourceId) => {
            if (currentStyle.sources[sourceId].type === "geojson") {
              userSources[sourceId] = JSON.parse(
                JSON.stringify(currentStyle.sources[sourceId])
              );
            }
          });

          currentStyle.layers.forEach((layer) => {
            if (_isUserAddedLayer(layer.id)) {
              userLayers.push(JSON.parse(JSON.stringify(layer)));
            }
          });
        }

        // Set the new style
        _map.setStyle(selectedConfig.style);

        // After style is loaded, restore user layers and ensure proper order
        _map.once("style.load", () => {
          // Restore view state
          _map.jumpTo({
            center: currentCenter,
            zoom: currentZoom,
            bearing: currentBearing,
            pitch: currentPitch
          });
          
          // First add back all GeoJSON sources
          Object.keys(userSources).forEach((sourceId) => {
            if (!_map.getSource(sourceId)) {
              _map.addSource(sourceId, userSources[sourceId]);
            }
          });

          // Then add back all user layers
          userLayers.forEach((layer) => {
            if (!_map.getLayer(layer.id)) {
              _map.addLayer(layer);
            }
          });

          // Re-initialize category layer tracking after style change
          if (App.Map.Layers && typeof App.Map.Layers.restoreCategoryTracking === "function") {
            console.log("Restoring category layer tracking after basemap change");
            App.Map.Layers.restoreCategoryTracking();
          }

          // Ensure proper layer ordering
          if (
            App.Map.Layers &&
            typeof App.Map.Layers.moveFeatureLayersToTop === "function"
          ) {
            App.Map.Layers.moveFeatureLayersToTop();
          }

          // Attach click events if overlay module is available
          if (
            App.Map.Overlay &&
            typeof App.Map.Overlay.attachClickEvents === "function"
          ) {
            App.Map.Overlay.attachClickEvents();
          }

          console.log(
            `Restored ${userLayers.length} user layers after style change`
          );

          _activeBackgroundLayer = selectedLayer;

          // Trigger events that other modules can listen for
          if (App.Core.Events) {
            App.Core.Events.trigger("basemap:changed", {
              layer: selectedLayer,
            });
            
            // Trigger style changed event for glyph fix module
            App.Core.Events.trigger("map:styleChanged", {
              map: _map,
              layer: selectedLayer
            });
          }
        });
      } else if (selectedConfig.tiles) {
        // XYZ or WMTS basemaps - add as a new source/layer

        // Add the source and layer
        _map.addSource("base-layer", {
          type: "raster",
          tiles: selectedConfig.tiles,
          tileSize: selectedConfig.tileSize || 256,
          maxzoom: selectedConfig.maxzoom || 19,
        });

        _map.addLayer(
          {
            id: "base-layer",
            type: "raster",
            source: "base-layer",
            minzoom: selectedConfig.minzoom || 0,
            maxzoom: selectedConfig.maxzoom || 19,
          },
          _getFirstNonBaseLayer()
        ); // Insert at bottom of the stack

        _activeBackgroundLayer = selectedLayer;
        console.log(`Basemap switched to: ${selectedLayer}`);

        // Trigger an event that other modules can listen for
        if (App.Core.Events) {
          App.Core.Events.trigger("basemap:changed", {
            layer: selectedLayer,
          });
        }
      } else if (selectedConfig.type === "wms") {
        // Handle WMS basemaps
        _map.addSource("base-layer", {
          type: "raster",
          tiles: [
            `${selectedConfig.url}?service=WMS&request=GetMap&layers=${selectedConfig.layers}&format=${selectedConfig.format}&transparent=true&width=256&height=256&crs=EPSG:3857&bbox={bbox-epsg-3857}`,
          ],
          tileSize: selectedConfig.tileSize || 256,
          maxzoom: selectedConfig.maxzoom || 19,
        });

        _map.addLayer(
          {
            id: "base-layer",
            type: "raster",
            source: "base-layer",
            minzoom: 0,
            maxzoom: selectedConfig.maxzoom || 19,
          },
          _getFirstNonBaseLayer()
        ); // Insert at bottom of the stack

        _activeBackgroundLayer = selectedLayer;
        console.log(`Basemap switched to: ${selectedLayer}`);

        // Trigger an event that other modules can listen for
        if (App.Core.Events) {
          App.Core.Events.trigger("basemap:changed", {
            layer: selectedLayer,
          });
        }
      } else {
        console.error(`Basemap type for ${selectedLayer} not recognized.`);
      }
    },

    /**
     * Hide all background and base layers
     * @returns {number} Number of layers hidden
     */
    hideBackgroundLayers: function () {
      const style = _map.getStyle();
      let hiddenCount = 0;

      // Process all layers and remember their state
      style.layers.forEach((layer) => {
        // Skip layers that are already in our tracked state
        if (!_layerVisibility.has(layer.id)) {
          // Get current visibility (default is visible if not specified)
          const currentVisibility =
            _map.getLayoutProperty(layer.id, "visibility") || "visible";

          // Store original state
          _layerVisibility.set(layer.id, currentVisibility);
        }

        // Skip GeoJSON (user-added) layers
        if (_isUserAddedLayer(layer.id)) {
          return;
        }

        // Hide background/basemap layers
        if (_isBackgroundLayer(layer)) {
          _map.setLayoutProperty(layer.id, "visibility", "none");
          hiddenCount++;
        }
      });

      console.log(`Hidden ${hiddenCount} background layers`);

      // Trigger an event that other modules can listen for
      if (App.Core.Events) {
        App.Core.Events.trigger("basemap:visibility", {
          visible: false,
          count: hiddenCount,
        });
      }

      return hiddenCount;
    },

    /**
     * Show all background layers
     * @returns {number} Number of layers restored
     */
    showBackgroundLayers: function () {
      let restoredCount = 0;

      // Restore all layers to their original state
      _layerVisibility.forEach((originalVisibility, layerId) => {
        // Skip user-added layers
        if (_isUserAddedLayer(layerId)) {
          return;
        }

        // Restore original visibility
        if (_map.getLayer(layerId)) {
          _map.setLayoutProperty(layerId, "visibility", originalVisibility);
          restoredCount++;
        }
      });

      console.log(`Restored ${restoredCount} background layers`);

      // Trigger an event that other modules can listen for
      if (App.Core.Events) {
        App.Core.Events.trigger("basemap:visibility", {
          visible: true,
          count: restoredCount,
        });
      }

      return restoredCount;
    },

    /**
     * Set background transparency
     * @param {number} opacity - Opacity value from 0 to 1
     */
    setBackgroundOpacity: function (opacity) {
      // Ensure opacity is within valid range
      opacity = Math.max(0, Math.min(1, opacity));

      const style = _map.getStyle();
      let updatedCount = 0;

      style.layers.forEach((layer) => {
        // Skip user-added layers
        if (_isUserAddedLayer(layer.id)) {
          return;
        }

        // Apply opacity based on layer type
        if (_isBackgroundLayer(layer)) {
          if (layer.type === "raster") {
            _map.setPaintProperty(layer.id, "raster-opacity", opacity);
            updatedCount++;
          } else if (layer.type === "fill") {
            _map.setPaintProperty(layer.id, "fill-opacity", opacity);
            updatedCount++;
          } else if (layer.type === "line") {
            _map.setPaintProperty(layer.id, "line-opacity", opacity);
            updatedCount++;
          } else if (layer.type === "background") {
            _map.setPaintProperty(layer.id, "background-opacity", opacity);
            updatedCount++;
          }
        }
      });

      console.log(
        `Updated opacity for ${updatedCount} background layers to ${opacity}`
      );

      // Trigger an event that other modules can listen for
      if (App.Core.Events) {
        App.Core.Events.trigger("basemap:opacity", {
          opacity: opacity,
          count: updatedCount,
        });
      }
    },

    /**
     * Toggle 3D buildings
     * @param {boolean} [force] - Optional force state (true = show, false = hide)
     * @returns {boolean} The new state (true = visible, false = hidden)
     */
    toggle3DBuildings: function (force) {
      let isVisible = false;
      let layerCount = 0;

      // Loop through all layers on the map
      _map.getStyle().layers.forEach((layer) => {
        // Check if the layer is a 'fill-extrusion' type (which represents 3D buildings)
        if (layer.type === "fill-extrusion") {
          layerCount++;

          // Get the current visibility of the layer
          const visibility = _map.getLayoutProperty(layer.id, "visibility");

          // If force is provided, use that, otherwise toggle the current state
          const newVisibility =
            force !== undefined
              ? force
                ? "visible"
                : "none"
              : visibility === "visible"
              ? "none"
              : "visible";

          _map.setLayoutProperty(layer.id, "visibility", newVisibility);

          if (newVisibility === "visible") {
            isVisible = true;
            console.log(`3D buildings layer '${layer.id}' is now visible.`);
          } else {
            console.log(`3D buildings layer '${layer.id}' is now hidden.`);
          }
        }
      });

      if (layerCount === 0) {
        console.log("No 3D building layers found on the map.");
      } else {
        console.log(
          `Toggled ${layerCount} 3D building layers. Visibility: ${isVisible}`
        );
      }

      // Trigger an event that other modules can listen for
      if (App.Core.Events) {
        App.Core.Events.trigger("3dbuildings:visibility", {
          visible: isVisible,
          count: layerCount,
        });
      }

      return isVisible;
    },

    /**
     * Add terrain to the map
     * @param {boolean} [enabled=true] - Whether to enable terrain (true) or disable it (false)
     */
    setTerrain: function (enabled = true) {
      try {
        if (enabled) {
          // Create the terrain source if it doesn't exist
          if (!_map.getSource("terrainSource")) {
            _map.addSource("terrainSource", {
              type: "raster-dem",
              tiles: [
                "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
              ],
              tileSize: 256,
              encoding: "terrarium",
              maxzoom: 15,
            });
          }

          // Enable 3D terrain
          _map.setTerrain({
            source: "terrainSource",
            exaggeration: 1,
          });

          // Add sky layer
          _map.setSky({
            "sky-color": "#199EF3",
            "sky-horizon-blend": 0.5,
            "horizon-color": "#ffffff",
            "horizon-fog-blend": 0.5,
            "fog-color": "#0000ff",
            "fog-ground-blend": 0.5,
            "atmosphere-blend": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              1,
              10,
              1,
              12,
              0,
            ],
          });

          // Add pitch to the map if not already pitched
          setTimeout(() => {
            if (!(_map.getPitch() > 0)) {
              _map.flyTo({
                center: _map.getCenter(),
                zoom: _map.getZoom(),
                pitch: 45,
              });
            }
          }, 400);

          console.log("Terrain enabled");

          // Trigger an event that other modules can listen for
          if (App.Core.Events) {
            App.Core.Events.trigger("terrain:state", { enabled: true });
          }
        } else {
          // Disable 3D terrain
          _map.setTerrain(null);

          // Reset pitch
          _map.flyTo({
            center: _map.getCenter(),
            zoom: _map.getZoom(),
            pitch: 0,
          });

          console.log("Terrain disabled");

          // Trigger an event that other modules can listen for
          if (App.Core.Events) {
            App.Core.Events.trigger("terrain:state", { enabled: false });
          }
        }
      } catch (error) {
        console.error("Error setting terrain:", error);
      }
    },

    /**
     * Toggle terrain on/off
     * @returns {boolean} New terrain state (true = enabled, false = disabled)
     */
    toggleTerrain: function () {
      const currentlyHasTerrain = !!_map.getTerrain();
      this.setTerrain(!currentlyHasTerrain);
      return !currentlyHasTerrain;
    },

    /**
     * Get all basemap layers from current style
     * @returns {Array} Array of basemap layer objects
     */
    getBasemapLayers: function() {
      if (!_map || !_map.getStyle()) return [];
      
      const layers = _map.getStyle().layers;
      return layers.filter(layer => !_isUserAddedLayer(layer));
    },

    /**
     * Set visibility for a specific layer
     * @param {string} layerId - Layer ID
     * @param {boolean} visible - Visibility state
     */
    setLayerVisibility: function(layerId, visible) {
      if (!_map || !_map.getLayer(layerId)) return;
      
      _map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
    },

    /**
     * Set opacity for a specific layer
     * @param {string} layerId - Layer ID
     * @param {number} opacity - Opacity value (0-1)
     */
    setLayerOpacity: function(layerId, opacity) {
      if (!_map || !_map.getLayer(layerId)) return;
      
      const layer = _map.getLayer(layerId);
      
      // Set appropriate paint property based on layer type
      switch (layer.type) {
        case 'fill':
          _map.setPaintProperty(layerId, 'fill-opacity', opacity);
          break;
        case 'line':
          _map.setPaintProperty(layerId, 'line-opacity', opacity);
          break;
        case 'circle':
          _map.setPaintProperty(layerId, 'circle-opacity', opacity);
          break;
        case 'symbol':
          if (layer.paint && layer.paint['icon-opacity'] !== undefined) {
            _map.setPaintProperty(layerId, 'icon-opacity', opacity);
          }
          if (layer.paint && layer.paint['text-opacity'] !== undefined) {
            _map.setPaintProperty(layerId, 'text-opacity', opacity);
          }
          break;
        case 'raster':
          _map.setPaintProperty(layerId, 'raster-opacity', opacity);
          break;
        case 'hillshade':
          _map.setPaintProperty(layerId, 'hillshade-exaggeration', opacity);
          break;
      }
    },

    /**
     * Get layer information
     * @param {string} layerId - Layer ID
     * @returns {Object|null} Layer information
     */
    getLayerInfo: function(layerId) {
      if (!_map || !_map.getLayer(layerId)) return null;
      
      const layer = _map.getLayer(layerId);
      const source = layer.source ? _map.getSource(layer.source) : null;
      
      return {
        id: layer.id,
        type: layer.type,
        source: layer.source,
        sourceLayer: layer['source-layer'],
        minzoom: layer.minzoom || 0,
        maxzoom: layer.maxzoom || 24,
        visibility: _map.getLayoutProperty(layerId, 'visibility') || 'visible',
        sourceType: source ? source.type : null
      };
    },

    /**
     * Get saved basemap preference from localStorage
     * @returns {string|null} Saved basemap name or null
     */
    getSavedBasemap: function() {
      try {
        return localStorage.getItem('geolantis360_selected_basemap');
      } catch (e) {
        console.warn('Could not read saved basemap preference:', e);
        return null;
      }
    },

    /**
     * Load saved basemap or default
     * @param {string} [defaultBasemap] - Default basemap to use if no saved preference
     */
    loadSavedBasemap: function(defaultBasemap) {
      const savedBasemap = this.getSavedBasemap();
      
      if (savedBasemap && mapConfig.backgroundMaps[savedBasemap]) {
        console.log(`Loading saved basemap: ${savedBasemap}`);
        // Add a small delay to ensure map is fully initialized
        setTimeout(() => {
          this.setBasemap(savedBasemap);
        }, 500);
      } else if (defaultBasemap && mapConfig.backgroundMaps[defaultBasemap]) {
        console.log(`Loading default basemap: ${defaultBasemap}`);
        this.setBasemap(defaultBasemap);
      }
    },

    /**
     * Reset basemap to default
     * @param {string} defaultBasemap - Default basemap name
     */
    resetToDefault: function(defaultBasemap) {
      try {
        localStorage.removeItem('geolantis360_selected_basemap');
        console.log('Cleared saved basemap preference');
      } catch (e) {
        console.warn('Could not clear saved basemap preference:', e);
      }
      
      if (defaultBasemap && mapConfig.backgroundMaps[defaultBasemap]) {
        this.setBasemap(defaultBasemap);
      }
    },
  };
})();

console.log("app.map.basemap.js loaded - App.Map.Basemap module created");
