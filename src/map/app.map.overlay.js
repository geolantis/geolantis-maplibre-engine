/**
 * Map overlay management
 * @namespace App.Map.Overlay
 */
App.Map = App.Map || {};
App.Map.Overlay = (function () {
  // Private variables
  var _map = null;
  var _overlayLayers = {}; // Track active overlay layers
  var _clickHandlers = {}; // Track click handlers for overlay layers
  var _currentPopup = null;
  var _overlayGroups = {}; // Track which layers belong to which overlay config

  /**
   * Handle click events on overlay layers
   * @param {Object} e - Click event
   * @param {string} selectLayer - Optional specific layer to select
   * @private
   */
  function _handleOverlayClick(e, selectLayer) {
    if (e.features && e.features.length > 0) {
      const clickedFeature = e.features[0];

      console.log(`OverkayClick Layer: ${clickedFeature.layer.id}`);
      if (!selectLayer || clickedFeature.layer.id === selectLayer) {
        console.log(`Feature clicked on layer: ${clickedFeature.layer.id}`);

        _map.flyTo({
          center: e.lngLat,
          speed: 0.2,
        });

        // Highlight the clicked feature
        _highlightFeature(clickedFeature);

        // Trigger an event that other modules can listen for
        if (App.Core.Events) {
          App.Core.Events.trigger("overlay:featureClick", {
            feature: clickedFeature,
            lngLat: e.lngLat,
          });
        }
      } else {
        console.log("Clicked layer does not match the selectable layer.");
      }
    }
  }

  /**
   * Highlight a feature on the map
   * @param {Object} feature - The feature to highlight
   * @private
   */
  function _highlightFeature(feature) {
    // First remove any existing highlights
    _removeHighlight();

    console.log("Adding highlight for feature", feature);

    // Define unique layer IDs
    const casingLayerId = "highlight_casing";
    const highlightLayerId = "highlight_fill";

    // Check if the feature has a valid ID and geometry type
    if (!feature._vectorTileFeature || !feature._vectorTileFeature.id) {
      console.error("Invalid feature for highlighting", feature);
      return;
    }

    // Add the fill for polygon highlight
    _map.addLayer({
      id: highlightLayerId,
      type: "fill", // Use 'fill' for polygons
      source: feature.source,
      "source-layer": feature.sourceLayer,
      filter: ["all", ["==", ["id"], feature._vectorTileFeature.id]],
      paint: {
        "fill-color": "#00FF00", // Green fill for visibility
        "fill-opacity": 0.1, // 10% opacity for the polygon fill
      },
    });

    // Add a line casing around the polygon for emphasis
    _map.addLayer({
      id: casingLayerId,
      type: "line",
      source: feature.source,
      "source-layer": feature.sourceLayer,
      filter: ["all", ["==", ["id"], feature._vectorTileFeature.id]],
      paint: {
        "line-color": "#00FF00", // Green casing around the polygon
        "line-width": 4,
        "line-opacity": 1.0, // Full opacity for the casing line
      },
    });

    console.log("Feature highlight added");
  }

  /**
   * Remove highlight layers from the map
   * @private
   */
  function _removeHighlight() {
    if (_map.getLayer("highlight_casing")) {
      _map.removeLayer("highlight_casing");
    }
    if (_map.getLayer("highlight_fill")) {
      _map.removeLayer("highlight_fill");
    }
    if (_map.getLayer("highlight")) {
      _map.removeLayer("highlight");
    }
  }

  /**
   * Process and apply an overlay style to the map
   * @param {Object|string} styleData - Style data or URL to style
   * @param {string} spriteUrl - Optional sprite URL
   * @param {string} overlayName - Overlay name (from config)
   * @param {string} sourceId - Source ID
   * @private
   */
  function _applyOverlayStyle(styleData, spriteUrl, overlayName, sourceId) {
    const processStyle = (data) => {
      console.log(`Processing style data for ${overlayName}`);

      // Initialize the overlay group immediately
      if (!_overlayGroups[overlayName]) {
        _overlayGroups[overlayName] = {
          layers: [],
          sources: []
        };
      }

      // Get current map style
      const currentStyle = _map.getStyle();

      // Check for duplicate layers but track ALL layers for this overlay
      const existingLayerIds = new Set();
      currentStyle.layers.forEach((layer) => {
        existingLayerIds.add(layer.id);
      });

      // Track all layers from this style for the overlay group
      data.layers.forEach((layer) => {
        if (!_overlayGroups[overlayName].layers.includes(layer.id)) {
          _overlayGroups[overlayName].layers.push(layer.id);
        }
      });

      // Filter out any duplicate layers for adding
      const newLayers = data.layers.filter((layer) => {
        if (existingLayerIds.has(layer.id)) {
          console.log(`Skipping duplicate layer: ${layer.id}`);
          return false;
        }
        return true;
      });

      // Track all sources from this style for the overlay group
      Object.keys(data.sources || {}).forEach((id) => {
        if (!_overlayGroups[overlayName].sources.includes(id)) {
          _overlayGroups[overlayName].sources.push(id);
        }
      });

      // Also track sources used by the layers
      data.layers.forEach((layer) => {
        if (layer.source && !_overlayGroups[overlayName].sources.includes(layer.source)) {
          _overlayGroups[overlayName].sources.push(layer.source);
        }
      });

      // Check for duplicate sources
      const existingSourceIds = new Set(Object.keys(currentStyle.sources));
      const newSources = {};

      Object.keys(data.sources || {}).forEach((id) => {
        if (!existingSourceIds.has(id)) {
          newSources[id] = data.sources[id];
        } else {
          console.log(`Skipping duplicate source: ${id}`);
        }
      });

      // If there are no new layers or sources, we still need to process existing ones
      if (newLayers.length === 0 && Object.keys(newSources).length === 0) {
        console.log(`All layers/sources already exist for ${overlayName}, reusing existing ones`);
        
        // Process existing layers that belong to this overlay
        _overlayGroups[overlayName].layers.forEach(layerId => {
          if (_map.getLayer(layerId)) {
            // Ensure visibility
            _map.setLayoutProperty(layerId, "visibility", "visible");
            
            // Add event handlers if not already added
            if (!_clickHandlers[layerId]) {
              _map.on("click", layerId, (e) => _handleOverlayClick(e));
              _map.on("mouseenter", layerId, () => {
                _map.getCanvas().style.cursor = "pointer";
              });
              _map.on("mouseleave", layerId, () => {
                _map.getCanvas().style.cursor = "";
              });
              _clickHandlers[layerId] = _handleOverlayClick;
            }
            
            // Track this layer
            const source = _map.getLayer(layerId).source;
            _overlayLayers[layerId] = source;
          }
        });
        
        console.log(`Overlay ${overlayName} activated with existing layers`);
        return;
      }

      // Apply the updated style
      _map.setStyle({
        ...currentStyle,
        layers: [...currentStyle.layers, ...newLayers],
        sources: { ...currentStyle.sources, ...newSources },
        sprite: spriteUrl || currentStyle.sprite,
      });

      // After style is loaded, set up layer and add to tracking
      _map.once("style.load", () => {
        console.log(`Style loaded for ${overlayName}`);

        // Set layer visibility and attach event handlers for NEW layers only
        newLayers.forEach((layer) => {
          if (_map.getLayer(layer.id)) {
            _map.setLayoutProperty(layer.id, "visibility", "visible");

            // Add click event handler
            _map.on("click", layer.id, (e) => _handleOverlayClick(e));
            console.log(`Added click handler for ${layer.id}`);

            // Add hover effect
            _map.on("mouseenter", layer.id, () => {
              _map.getCanvas().style.cursor = "pointer";
            });

            _map.on("mouseleave", layer.id, () => {
              _map.getCanvas().style.cursor = "";
            });

            // Track this layer
            _overlayLayers[layer.id] = layer.source || sourceId;
            _clickHandlers[layer.id] = _handleOverlayClick;
          }
        });

        // Ensure proper layer ordering if layers module is available
        if (
          App.Map.Layers &&
          typeof App.Map.Layers.moveFeatureLayersToTop === "function"
        ) {
          App.Map.Layers.moveFeatureLayersToTop();
        }

        console.log(`Overlay ${overlayName} added successfully with ${newLayers.length} layers`);
      });
    };

    // Handle both string URLs and direct style objects
    if (typeof styleData === "string") {
      // Fetch the style file
      fetch(styleData)
        .then((response) => response.json())
        .then(processStyle)
        .catch((error) => {
          console.error(`Error fetching style for ${layerId}:`, error);
        });
    } else {
      // Process the style object directly
      processStyle(styleData);
    }
  }

  /**
   * Load a local style file
   * @param {string} filePath - Path to the style file
   * @param {Function} callback - Callback function to process the loaded style
   * @private
   */
  function _loadFile(filePath, callback) {
    // Resolve the correct path based on environment
    const resolvedPath = _resolveFilePath(filePath);

    if (_isAndroidApp()) {
      // Use XMLHttpRequest for Android WebView to load the file from assets
      _loadLocalFile(resolvedPath, callback);
    } else {
      // Use fetch for the web environment
      fetch(resolvedPath)
        .then((response) => response.json())
        .then((data) => {
          callback(data);
        })
        .catch((error) => {
          console.error("Error fetching file in web:", error);
        });
    }
  }

  /**
   * Check if running in Android app
   * @returns {boolean} True if running in Android WebView
   * @private
   */
  function _isAndroidApp() {
    // Check if we are in a WebView by checking the user agent or a custom flag
    return (
      /Android/.test(navigator.userAgent) && /wv/.test(navigator.userAgent)
    );
  }

  /**
   * Load a local file
   * @param {string} filePath - Path to the file
   * @param {Function} callback - Callback function
   * @private
   */
  function _loadLocalFile(filePath, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", filePath, true);
    xhr.responseType = "json"; // Assuming your local file is a JSON

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = xhr.response;
        callback(data);
      } else {
        console.error("Error loading local file:", xhr.statusText);
      }
    };

    xhr.onerror = function () {
      console.error("Network error while loading local file.");
    };

    xhr.send();
  }

  /**
   * Resolve file path based on environment
   * @param {string} filePath - Original file path
   * @returns {string} Resolved file path
   * @private
   */
  function _resolveFilePath(filePath) {
    if (_isAndroidApp()) {
      // If running in Android, point to the `assets/` directory
      return "file:///android_asset/" + filePath.replace(/^\/?maps\//, "");
    } else {
      // In the web environment, use the normal file path
      return filePath;
    }
  }

  // Public API
  return {
    /**
     * Initialize overlay management
     * @param {Object} map - The MapLibre map instance
     */
    initialize: function (map) {
      _map = map;
      console.log("Overlay management initialized");
    },

    /**
     * Toggle an overlay layer on/off
     * @param {Object} layerConfig - Configuration for the layer
     * @returns {boolean} True if layer is now active, false if removed
     */
    toggleOverlayLayer: function (layerConfig) {
      const overlayName = layerConfig.name;

      console.log(`Toggling overlay layer for: ${overlayName}`);

      // Check if this overlay group exists
      if (_overlayGroups[overlayName]) {
        console.log(`Overlay ${overlayName} exists, removing it...`);
        
        const overlayGroup = _overlayGroups[overlayName];
        
        // Remove all layers in this overlay group
        overlayGroup.layers.forEach(layerId => {
          // Remove click event handler
          try {
            if (_clickHandlers[layerId]) {
              _map.off("click", layerId, _clickHandlers[layerId]);
              delete _clickHandlers[layerId];
              console.log(`Removed click handler for ${layerId}`);
            }
          } catch (e) {
            console.warn(`Could not remove click handler: ${e.message}`);
          }

          // Remove hover handlers
          try {
            _map.off("mouseenter", layerId);
            _map.off("mouseleave", layerId);
          } catch (e) {
            console.warn(`Could not remove hover handlers: ${e.message}`);
          }

          // Remove the layer
          try {
            if (_map.getLayer(layerId)) {
              _map.removeLayer(layerId);
              console.log(`Removed layer ${layerId}`);
            }
          } catch (e) {
            console.warn(`Could not remove layer: ${e.message}`);
          }

          // Remove from tracking object
          delete _overlayLayers[layerId];
        });
        
        // Remove all sources in this overlay group
        overlayGroup.sources.forEach(sourceId => {
          try {
            if (_map.getSource(sourceId)) {
              _map.removeSource(sourceId);
              console.log(`Removed source ${sourceId}`);
            }
          } catch (e) {
            console.warn(`Could not remove source: ${e.message}`);
          }
        });

        // Remove the overlay group
        delete _overlayGroups[overlayName];

        return false; // Layer is now inactive
      }

      // If we reach here, the overlay doesn't exist, so add it
      console.log(`Overlay ${overlayName} does not exist, adding it...`);

      // Add the layer based on style path
      if (
        layerConfig.style.startsWith("file://") ||
        layerConfig.style.startsWith("maps/") ||
        layerConfig.style.startsWith("src/")
      ) {
        console.log(`Loading local style file: ${layerConfig.style}`);
        _loadFile(layerConfig.style, (localStyle) => {
          console.log(`Local style loaded for ${layerConfig.name}`);
          _applyOverlayStyle(
            localStyle,
            layerConfig.extra_sprite,
            overlayName,
            layerConfig.name
          );
        });
      } else {
        console.log(`Using remote style: ${layerConfig.style}`);
        _applyOverlayStyle(
          layerConfig.style,
          layerConfig.extra_sprite,
          overlayName,
          layerConfig.name
        );
      }
      
      return true; // Layer is now active
    },

    /**
     * Toggle a WMS layer on/off
     * @param {Object} layerConfig - Configuration for the WMS layer
     * @returns {boolean} True if layer is now active, false if removed
     */
    toggleWmsLayer: function (layerConfig) {
      const overlayName = layerConfig.name;
      const layerId = `${layerConfig.name}-layer`;
      const sourceId = `${layerConfig.name}-source`;

      console.log(`Toggling WMS layer: ${overlayName}`);

      // Check if this overlay group exists
      if (_overlayGroups[overlayName]) {
        console.log(`WMS Overlay ${overlayName} exists, removing it...`);
        
        const overlayGroup = _overlayGroups[overlayName];
        
        // Remove all layers in this overlay group
        overlayGroup.layers.forEach(layerId => {
          if (_map.getLayer(layerId)) {
            _map.removeLayer(layerId);
            console.log(`Removed layer ${layerId}`);
          }
          delete _overlayLayers[layerId];
        });
        
        // Remove all sources in this overlay group
        overlayGroup.sources.forEach(sourceId => {
          if (_map.getSource(sourceId)) {
            _map.removeSource(sourceId);
            console.log(`Removed source ${sourceId}`);
          }
        });

        // Remove the overlay group
        delete _overlayGroups[overlayName];

        return false; // Layer is now inactive
      }

      try {
        // Use the specified CRS or default to EPSG:3857
        const crs = layerConfig.crs || "EPSG:3857";

        // Construct the WMS URL
        const wmsUrl = `${layerConfig.url}?SERVICE=WMS&REQUEST=GetMap&LAYERS=${
          layerConfig.layers
        }&STYLES=&FORMAT=${
          layerConfig.format || "image/png"
        }&TRANSPARENT=true&VERSION=${
          layerConfig.version || "1.3.0"
        }&WIDTH=256&HEIGHT=256&CRS=${crs}&BBOX={bbox-epsg-3857}`;

        console.log(`Adding WMS source with URL template: ${wmsUrl}`);

        // Add the WMS source
        _map.addSource(sourceId, {
          type: "raster",
          tiles: [wmsUrl],
          tileSize: 256,
        });

        // Add the layer
        _map.addLayer({
          id: layerId,
          type: "raster",
          source: sourceId,
          paint: {
            "raster-opacity": 0.85,
          },
        });

        // Track this layer
        _overlayLayers[layerId] = sourceId;
        
        // Create overlay group for WMS layer
        _overlayGroups[overlayName] = {
          layers: [layerId],
          sources: [sourceId]
        };

        console.log(`WMS layer ${layerId} added with CRS: ${crs}`);
        return true;
      } catch (error) {
        console.error(`Error adding WMS layer: ${error.message}`);
        return false;
      }
    },

    /**
     * Explore available WMS layers from a server
     * @param {string} wmsUrl - URL of the WMS server
     */
    exploreWmsLayers: function (wmsUrl) {
      const capabilitiesUrl = `${wmsUrl}?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0`;

      console.log("Fetching WMS capabilities from:", capabilitiesUrl);

      // Create a temporary div to display results
      let resultsDiv = document.getElementById("wms-capabilities-results");
      if (!resultsDiv) {
        resultsDiv = document.createElement("div");
        resultsDiv.id = "wms-capabilities-results";
        resultsDiv.style.position = "absolute";
        resultsDiv.style.top = "100px";
        resultsDiv.style.left = "100px";
        resultsDiv.style.zIndex = "1000";
        resultsDiv.style.backgroundColor = "white";
        resultsDiv.style.padding = "10px";
        resultsDiv.style.maxHeight = "80%";
        resultsDiv.style.maxWidth = "80%";
        resultsDiv.style.overflow = "auto";
        resultsDiv.style.border = "2px solid black";
        document.body.appendChild(resultsDiv);
      }

      resultsDiv.innerHTML = `<h3>Fetching WMS layers...</h3>
                                <p>URL: ${capabilitiesUrl}</p>
                                <button id="close-wms-results">Close</button>`;

      document
        .getElementById("close-wms-results")
        .addEventListener("click", () => {
          resultsDiv.style.display = "none";
        });

      // Fetch the capabilities document
      fetch(capabilitiesUrl)
        .then((response) => response.text())
        .then((data) => {
          console.log("Received WMS capabilities data");

          // Simple parsing of XML to extract layer names
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data, "text/xml");

          // Check for exceptions
          const exceptions = xmlDoc.getElementsByTagName("ServiceException");
          if (exceptions.length > 0) {
            resultsDiv.innerHTML = `<h3>WMS Capabilities Error</h3>
                                            <p style="color:red">${exceptions[0].textContent}</p>
                                            <button id="close-wms-results">Close</button>`;

            document
              .getElementById("close-wms-results")
              .addEventListener("click", () => {
                resultsDiv.style.display = "none";
              });
            return;
          }

          // Extract layers
          const layers = xmlDoc.getElementsByTagName("Layer");
          let layersList = "<h3>Available WMS Layers</h3><ul>";

          for (let i = 0; i < layers.length; i++) {
            // Get layer name
            const nameElements = layers[i].getElementsByTagName("Name");
            if (nameElements.length > 0) {
              const name = nameElements[0].textContent;

              // Get layer title
              let title = name;
              const titleElements = layers[i].getElementsByTagName("Title");
              if (titleElements.length > 0) {
                title = titleElements[0].textContent;
              }

              layersList += `<li><strong>${name}</strong>: ${title} 
                                        <button class="add-wms-layer" data-layer="${name}">Add</button></li>`;
            }
          }

          layersList += "</ul>";
          layersList += '<button id="close-wms-results">Close</button>';

          resultsDiv.innerHTML = layersList;

          // Add event listeners to the "Add" buttons
          const self = this; // Store reference to 'this'
          document.querySelectorAll(".add-wms-layer").forEach((button) => {
            button.addEventListener("click", (e) => {
              const layerName = e.target.getAttribute("data-layer");
              console.log(`Adding WMS layer: ${layerName}`);

              // Create a temporary config for this layer
              const tempConfig = {
                name: `BEV_${layerName.replace(/:/g, "_")}`,
                type: "wms",
                url: wmsUrl,
                layers: layerName,
                format: "image/png",
                transparent: "true",
                version: "1.3.0",
              };

              // Add the layer using the stored reference
              self.toggleWmsLayer(tempConfig);

              // Hide the results
              resultsDiv.style.display = "none";
            });
          });

          document
            .getElementById("close-wms-results")
            .addEventListener("click", () => {
              resultsDiv.style.display = "none";
            });
        })
        .catch((error) => {
          console.error("Error fetching WMS capabilities:", error);
          resultsDiv.innerHTML = `<h3>Error</h3>
                                        <p style="color:red">Failed to fetch WMS capabilities: ${error.message}</p>
                                        <button id="close-wms-results">Close</button>`;

          document
            .getElementById("close-wms-results")
            .addEventListener("click", () => {
              resultsDiv.style.display = "none";
            });
        });
    },

    /**
     * Debug a WMS layer configuration
     * @param {Object} layerConfig - WMS layer configuration
     */
    debugWmsLayer: function (layerConfig) {
      const layerId = `${layerConfig.name}-layer`;
      const sourceId = `${layerConfig.name}-source`;

      console.log("Debugging WMS layer...");

      // Check if the layer exists
      if (_map.getLayer(layerId)) {
        console.log(`Layer ${layerId} exists in the map`);
        const visibility = _map.getLayoutProperty(layerId, "visibility");
        console.log(`Layer visibility: ${visibility}`);
      } else {
        console.log(`Layer ${layerId} does not exist in the map`);
      }

      // Check if the source exists
      if (_map.getSource(sourceId)) {
        console.log(`Source ${sourceId} exists in the map`);
        // Get source data
        const source = _map.getSource(sourceId);
        console.log("Source configuration:", source);
      } else {
        console.log(`Source ${sourceId} does not exist in the map`);
      }

      // Check map bounds to see if we're in a relevant area
      const bounds = _map.getBounds();
      console.log("Current map bounds:", bounds);

      // Test the WMS URL directly to see if it returns data
      const bbox =
        bounds._sw.lng +
        "," +
        bounds._sw.lat +
        "," +
        bounds._ne.lng +
        "," +
        bounds._ne.lat;
      const testUrl = `${layerConfig.url}?SERVICE=WMS&REQUEST=GetMap&LAYERS=${
        layerConfig.layers
      }&STYLES=&FORMAT=${layerConfig.format}&TRANSPARENT=true&VERSION=${
        layerConfig.version || "1.3.0"
      }&WIDTH=500&HEIGHT=500&CRS=EPSG:3857&BBOX=${bbox}`;

      console.log("Test WMS URL:", testUrl);
      console.log(
        "Try opening this URL in a new tab to see if it returns an image"
      );
    },

    /**
     * Remove all overlay layers
     */
    removeAllOverlays: function () {
      console.log(
        `Removing ${Object.keys(_overlayLayers).length} overlay layers`
      );

      // Remove each layer and its source
      for (const [layerId, sourceId] of Object.entries(_overlayLayers)) {
        if (_map.getLayer(layerId)) {
          // Remove click event handler if it exists
          if (_clickHandlers[layerId]) {
            _map.off("click", layerId, _clickHandlers[layerId]);
            delete _clickHandlers[layerId];
          }

          // Remove layer
          _map.removeLayer(layerId);

          // Try to remove source if it exists
          if (_map.getSource(sourceId)) {
            _map.removeSource(sourceId);
          }

          console.log(`Removed layer ${layerId} and source ${sourceId}`);
        }
      }

      // Clear the tracking objects
      _overlayLayers = {};
      _clickHandlers = {};

      console.log("All overlay layers removed");
    },

    /**
     * Check if any overlay layers are active
     * @returns {boolean} True if there are active overlay layers
     */
    hasVisibleOverlays: function () {
      return Object.keys(_overlayLayers).length > 0;
    },

    /**
     * Check if a specific overlay layer is active
     * @param {Object} layerConfig - Configuration for the layer
     * @returns {boolean} True if the layer is active
     */
    isOverlayActive: function (layerConfig) {
      return _overlayGroups.hasOwnProperty(layerConfig.name);
    },

    /**
     * Get all active overlay layer IDs
     * @returns {Array} Array of active layer IDs
     */
    getActiveOverlayLayers: function () {
      return Object.keys(_overlayLayers);
    },

    /**
     * Remove highlight from feature
     */
    removeHighlight: function () {
      _removeHighlight();
    },

    /**
     * Highlight a feature on the map
     * @param {Object} feature - Feature to highlight
     */
    highlightFeature: function (feature) {
      _highlightFeature(feature);
    },

    /**
     * Add click event handlers to overlay layers
     */
    attachClickEvents: function () {
      // Get overlay configs from mapConfig
      if (typeof mapConfig === "undefined" || !mapConfig.overlayMaps) {
        console.warn(
          "mapConfig not available for attaching click events to overlays"
        );
        return;
      }

      for (let key in mapConfig.overlayMaps) {
        const overlayMap = mapConfig.overlayMaps[key];

        if (overlayMap.popupLayers) {
          overlayMap.popupLayers.forEach((layerConfig) => {
            const layerId = layerConfig.layer;

            // Remove any previous click event handlers
            try {
              _map.off("click", layerId, _clickHandlers[layerId]);
            } catch (e) {
              // Ignore errors if no handler was attached
            }

            // Attach click event
            const handler = (e) =>
              _handleOverlayClick(e, overlayMap.selectLayer);
            _map.on("click", layerId, handler);
            _clickHandlers[layerId] = handler;

            // Change cursor to pointer when hovering over a feature
            _map.on("mouseenter", layerId, () => {
              _map.getCanvas().style.cursor = "pointer";
            });

            // Revert cursor back to default when leaving a feature
            _map.on("mouseleave", layerId, () => {
              _map.getCanvas().style.cursor = "";
            });

            console.log(`Click events attached to layer: ${layerId}`);
          });
        }
      }
    },

    /**
     * Get MapLibre vector tile feature as GeoJSON
     * @param {Object} feature - MapLibre vector tile feature
     * @returns {Object} GeoJSON feature
     */
    getGeoJsonFromVectorTileFeature: function (feature) {
      if (!feature || !feature.geometry) {
        console.error("Invalid feature for conversion to GeoJSON", feature);
        return null;
      }

      try {
        // Create GeoJSON from the MVT feature
        const geoJsonFeature = {
          type: "Feature",
          geometry: feature.geometry,
          properties: feature.properties || {},
          id:
            feature.id ||
            (feature._vectorTileFeature
              ? feature._vectorTileFeature.id
              : undefined),
        };

        return geoJsonFeature;
      } catch (e) {
        console.error("Error converting MVT feature to GeoJSON:", e);
        return null;
      }
    },

    /**
     * Add a long-click handler to an overlay layer
     * @param {string} layerId - Layer ID to attach the handler to
     */
    attachLongClickEvent: function (layerId) {
      // Make sure the layer exists before attaching the event
      if (_map.getLayer(layerId)) {
        console.log(`Attaching long click event for layer: ${layerId}`);

        _map.on("contextmenu", layerId, (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            console.log("Feature long clicked: ", feature);

            // Highlight the feature
            this.highlightFeature(feature);

            // Trigger an event that other modules can listen for
            if (App.Core.Events) {
              App.Core.Events.trigger("overlay:featureLongClick", {
                feature: feature,
                lngLat: e.lngLat,
              });
            }
          }
        });
      } else {
        console.warn(
          `Layer ${layerId} not found for long click event attachment.`
        );
      }
    },

    /**
     * Configure popup for an overlay feature
     * @param {Object} feature - Feature to show popup for
     * @param {Array} coordinates - [lng, lat] coordinates for popup
     */
    showPopupForFeature: function (feature, coordinates) {
      if (!feature || !coordinates) {
        console.error("Invalid feature or coordinates for popup");
        return;
      }

      try {
        // Create a popup
        const popup = new maplibregl.Popup({
          closeButton: true,
          closeOnClick: true,
        })
          .setLngLat(coordinates)
          .setHTML(
            `
                    <div class="feature-popup">
                        <h3>${
                          feature.properties.title || "Feature Details"
                        }</h3>
                        <div>${
                          feature.properties.description ||
                          "No description available"
                        }</div>
                    </div>
                `
          )
          .addTo(_map);

        // Track the popup so it can be removed later if needed
        this._currentPopup = popup;

        // Trigger an event that other modules can listen for
        if (App.Core.Events) {
          App.Core.Events.trigger("overlay:popupShown", {
            feature: feature,
            coordinates: coordinates,
          });
        }
      } catch (e) {
        console.error("Error showing popup:", e);
      }
    },

    /**
     * Close any open popup
     */
    closePopup: function () {
      if (this._currentPopup) {
        this._currentPopup.remove();
        this._currentPopup = null;
      }
    },

    /**
     * Move overlay layers to the top of the rendering order
     */
    moveOverlayLayersToTop: function () {
      const overlayLayerIds = Object.keys(_overlayLayers);
      overlayLayerIds.forEach((layerId) => {
        if (_map.getLayer(layerId)) {
          _map.moveLayer(layerId);
          console.log(`Moved overlay layer to top: ${layerId}`);
        }
      });
    },

    /**
     * Get overlay layer by name
     * @param {string} name - Overlay name from mapConfig.overlayMaps
     * @returns {Object|null} Layer configuration or null if not found
     */
    getOverlayByName: function (name) {
      if (typeof mapConfig === "undefined" || !mapConfig.overlayMaps) {
        console.warn("mapConfig not available for getting overlay by name");
        return null;
      }

      return mapConfig.overlayMaps[name] || null;
    },
  };
})();

console.log("app.map.overlay.js loaded - App.Map.Overlay module created");
