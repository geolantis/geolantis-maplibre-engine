/**
 * Map event handling
 * @namespace App.Map.Events
 */
App.Map = App.Map || {};
App.Map.Events = (function () {
  // Private variables
  var _map = null;
  var _eventsInitialized = false;
  var _lastMoveEndCall = 0;
  var _lastClickTime = 0;
  var _lastClickCoords = null;
  var _debounceTime = 100;
  var _currentSelectedFeature = null;
  var _besitzerModeEnabled = false; // Flag for automatic neighbor selection
  
  /**
   * Check if a string is a valid UUID
   * @private
   */
  function isValidUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Get all interactive layer IDs
   * @private
   */
  function _getInteractiveLayers() {
    if (!_map) return [];

    // Get all layers from the map
    var style = _map.getStyle();
    var interactiveLayers = [];

    if (style && style.layers) {
      style.layers.forEach(function (layer) {
        // Include layers that should be interactive
        if (
          layer.id.includes("feature-") ||
          layer.id.includes("marker-") ||
          layer.id.includes("poi-") ||
          layer.id.includes("layer-") ||
          layer.id.includes("category-") // Include category-based layers
        ) {
          interactiveLayers.push(layer.id);
        }
      });
    }

    return interactiveLayers;
  }

  /**
   * Handle map click events
   * @private
   */
  function _handleMapClick(e) {
    const now = Date.now();
    const currentCoords = `${e.lngLat.lng.toFixed(8)},${e.lngLat.lat.toFixed(
      8
    )}`;

    // Prevent duplicate clicks
    if (
      now - _lastClickTime < _debounceTime &&
      currentCoords === _lastClickCoords
    ) {
      console.log("Duplicate click prevented");
      return;
    }

    _lastClickTime = now;
    _lastClickCoords = currentCoords;

    try {
      // Hide any existing feature selector first
      if (App.UI.FeatureSelector && App.UI.FeatureSelector.isVisible) {
        if (App.UI.FeatureSelector.isVisible()) {
          App.UI.FeatureSelector.hideSelector(); // Just hide UI without clearing highlights
          return; // Don't process the click further if we just closed the selector
        }
      }

      // Check if StakeOut is active in node mode - if so, don't show feature selector
      var skipFeatureSelector = false;
      if (App.Features && App.Features.StakeOut && 
          App.Features.StakeOut.isActive && 
          App.Features.StakeOut.isActive() && 
          App.Features.StakeOut.getNavigationMode && 
          App.Features.StakeOut.getNavigationMode() === "nodes") {
        console.log("StakeOut is active in node mode, skipping feature selector");
        skipFeatureSelector = true;
      }

      // Check if basemap selection is enabled
      const basemapSelectionEnabled = App.UI.DynamicButton && 
                                     App.UI.DynamicButton.getBasemapSelectionState && 
                                     App.UI.DynamicButton.getBasemapSelectionState();

      let features;
      
      if (basemapSelectionEnabled) {
        // When basemap selection is enabled, query ALL features including basemap layers
        features = _map.queryRenderedFeatures(e.point);
      } else {
        // When basemap selection is disabled, filter out basemap features
        const allFeatures = _map.queryRenderedFeatures(e.point);
        
        // Filter to only include GeoJSON features (user-added layers)
        features = allFeatures.filter(function(feature) {
          // Check if the feature's layer uses a GeoJSON source
          if (feature.layer && feature.layer.source) {
            const source = _map.getSource(feature.layer.source);
            return source && source.type === 'geojson';
          }
          return false;
        });
        
        if (allFeatures.length > features.length) {
          console.log(`Filtered out ${allFeatures.length - features.length} basemap features (basemap selection disabled)`);
        }
      }

      if (features && features.length > 0 && !skipFeatureSelector) {
        console.log(`Found ${features.length} features`);
        console.log("First feature:", features[0]);
        console.log("All features:", features);

        if (features.length === 1) {
          // Single feature - display directly
          console.log("Single feature clicked, displaying directly");
          _displayFeature(features[0], e);
        } else {
          // Multiple features - show selector
          console.log("Multiple features clicked, showing feature selector");
          console.log("App.UI.FeatureSelector available:", !!App.UI.FeatureSelector);
          console.log("App.UI.FeatureSelector.show available:", !!(App.UI.FeatureSelector && App.UI.FeatureSelector.show));

          // Ensure the feature selector is available
          if (App.UI.FeatureSelector && App.UI.FeatureSelector.show) {
            console.log("Calling App.UI.FeatureSelector.show with:", {
              featuresCount: features.length,
              point: e.point
            });
            App.UI.FeatureSelector.show(
              features,
              e.point,
              function (selectedFeature) {
                console.log("Feature selected from selector:", selectedFeature);
                _displayFeature(selectedFeature, e);
              }
            );
          } else {
            console.error("Feature selector module not available");
            console.error("App.UI:", App.UI);
            console.error("App.UI.FeatureSelector:", App.UI.FeatureSelector);
            // Fallback: display the first feature
            _displayFeature(features[0], e);
          }
        }
      } else {
        console.log("Map clicked at:", e.lngLat);

        // Clear selection if clicking on empty space (pass true to force clearing all highlights)
        _clearSelectedFeature(true);

        App.Core.Events.trigger("map.clicked", {
          lngLat: e.lngLat,
          point: e.point,
        });

        // Notify bridge
        if (window.interface && window.interface.bridge) {
          const latLngPoint = {
            lat: e.lngLat.lat,
            lng: e.lngLat.lng,
            x: e.point.x,
            y: e.point.y,
          };
          window.interface.bridge.onMapClicked(latLngPoint, latLngPoint);
        }
      }
    } catch (error) {
      console.error("Error in click handler:", error);
    }
  }

  /**
   * Clear existing handlers
   * @private
   */
  function _clearHandlers() {
    if (_map && _map._listeners && _map._listeners.click) {
      _map._listeners.click = [];
    }
  }

  /**
   * Display a selected feature and add it to the highlights
   * @param {Object} feature - The feature to display
   * @param {Object} e - Event data
   * @private
   */
  function _displayFeature(feature, e) {
    console.log("Displaying feature:", feature);

    // Store current selected feature
    _currentSelectedFeature = feature;

    // Highlight the selected feature WITHOUT clearing previous highlights
    // The false parameter ensures we don't clear existing highlights
    if (App.UI.FeatureSelector && App.UI.FeatureSelector.highlightFeature) {
      App.UI.FeatureSelector.highlightFeature(feature, false);
    }

    // Store selected feature in state (append to selection array)
    if (App.Core.State) {
      // Set as last selected feature
      App.Core.State.set("map.lastSelectedFeature", feature);

      // Add to selected features array without removing existing ones
      App.Core.State.update("map.selectedFeatures", function (currentFeatures) {
        // Make a copy of the current features array
        const updatedFeatures = Array.isArray(currentFeatures)
          ? [...currentFeatures]
          : [];

        // Check if this feature is already in the array to avoid duplicates
        const isDuplicate = updatedFeatures.some(
          (existingFeature) =>
            existingFeature.id === feature.id ||
            (existingFeature.geometry &&
              feature.geometry &&
              JSON.stringify(existingFeature.geometry) ===
                JSON.stringify(feature.geometry))
        );

        // Only add if it's not already in the array
        if (!isDuplicate) {
          updatedFeatures.push(feature);
        }

        return updatedFeatures;
      });
    }
    
    // Check if this is likely a GeoObject (has a valid UUID)
    let objectId = feature.properties?.id;
    const isGeoObject = objectId && isValidUUID(objectId);
    console.log("Feature ID:", objectId, "Is GeoObject:", isGeoObject);

    // Open right sidebar first
    const rightDrawer = document.getElementById("right1-drawer");
    const map = document.getElementById("map");
    
    if (rightDrawer) {
      rightDrawer.show();
      console.log("Right drawer opened");
      
      // Add class to map to adjust width
      if (map) {
        map.classList.add("drawer-open");
      }
      
      // For GeoObjects, just open the drawer and wait for Java to send the full details
      // For basemap features, display immediately
      if (!isGeoObject) {
        // This is a basemap feature - display it immediately
        // Wait for drawer to be fully shown before setting feature
        setTimeout(() => {
          // Function to try displaying the feature
          const tryDisplayFeature = () => {
            // First try the helper function
            if (window.ensureObjectInfoReady) {
              window.ensureObjectInfoReady((objectInfo) => {
                try {
                  objectInfo.setFeature(feature);
                  console.log("✅ Called setFeature on object-info component for basemap feature");
                } catch (error) {
                  console.error("Error calling setFeature:", error);
                  if (window.objectInfoBridge) {
                    window.objectInfoBridge.displayFeature(feature, false);
                  }
                }
              });
              return true;
            }
            
            // Try direct approach
            const objectInfo = document.querySelector("object-info");
            if (objectInfo && typeof objectInfo.setFeature === 'function') {
              try {
                objectInfo.setFeature(feature);
                console.log("✅ Called setFeature on object-info component (direct) for basemap feature");
                return true;
              } catch (error) {
                console.error("Error calling setFeature:", error);
              }
            }
            
            // Try the bridge
            if (window.objectInfoBridge) {
              console.log("Using objectInfoBridge as fallback for basemap feature");
              window.objectInfoBridge.displayFeature(feature, false);
              return true;
            }
            
            return false;
          };
          
          // Try immediately
          if (!tryDisplayFeature()) {
            // If failed, wait for components to be ready
            console.log("Waiting for object-info component or bridge to be ready...");
            
            // Set up a retry mechanism
            let retries = 0;
            const maxRetries = 10;
            const retryInterval = setInterval(() => {
              retries++;
              if (tryDisplayFeature() || retries >= maxRetries) {
                clearInterval(retryInterval);
                if (retries >= maxRetries) {
                  console.error("Failed to display feature after " + maxRetries + " attempts");
                }
              }
            }, 200);
          }
        }, 150); // Slightly longer delay to ensure drawer animation completes
      } else {
        // This is a GeoObject - Java will send the full details after the objectclick callback
        console.log("GeoObject detected, waiting for Java to send full details...");
        
        // Display a loading state
        setTimeout(() => {
          if (window.ensureObjectInfoReady) {
            window.ensureObjectInfoReady((objectInfo) => {
              try {
                // Show loading state
                if (typeof objectInfo.showLoading === 'function') {
                  objectInfo.showLoading();
                } else {
                  // Fallback: just clear the content
                  objectInfo.clearFeature();
                }
              } catch (error) {
                console.error("Error setting loading state:", error);
              }
            });
          }
        }, 150);
      }
    } else {
      // If no drawer, try to use objectInfoBridge directly
      if (window.objectInfoBridge) {
        if (!isGeoObject) {
          window.objectInfoBridge.displayFeature(feature, true);
        }
      }
    }

    // Trigger event
    App.Core.Events.trigger("feature.selected", {
      feature: feature,
      layer: feature.layer?.id,
      lngLat: e.lngLat,
      point: e.point,
    });

    // Notify bridge using the same callback mechanism as Leaflet
    let objectId = feature.properties?.id;
    if (!objectId) {
      // Generate a more reliable ID for features without proper IDs
      if (feature.id !== null && feature.id !== undefined) {
        objectId = `${feature.layer?.id || 'feature'}_${feature.id}`;
      } else {
        // For features without IDs, generate a temporary ID based on coordinates
        const coords = feature.geometry?.coordinates;
        if (coords && Array.isArray(coords)) {
          const coordStr = coords.slice(0, 2).map(c => c.toFixed(6)).join('_');
          objectId = `${feature.layer?.id || 'feature'}_${coordStr}`;
        } else {
          objectId = `${feature.layer?.id || 'feature'}_${Date.now()}`;
        }
      }
    }
    console.log("Attempting to send objectclick callback with ID:", objectId);
    console.log("reha object:", window.reha);
    console.log("reha.sendCallback type:", typeof window.reha?.sendCallback);
    
    if (window.reha && typeof window.reha.sendCallback === "function") {
      console.log("Calling reha.sendCallback('objectclick', " + objectId + ")");
      reha.sendCallback('objectclick', objectId);
    } else {
      console.error("reha.sendCallback is not available!");
      // Fallback: try the original method
      if (window.interface && window.interface.bridge) {
        console.log("Falling back to interface.bridge.onObjectClicked");
        window.interface.bridge.onObjectClicked(objectId);
      }
    }

    // Only automatically select similar features if besitzer mode is enabled
    if (_besitzerModeEnabled) {
      setTimeout(() => {
        const similarFeatures = _selectSimilarFeatures(feature, 'eigent1', false, 10000);
        if (similarFeatures.length > 0) {
          console.log(`Auto-selected ${similarFeatures.length} similar features within 10000m`);
        }
      }, 100);
    }
  }

  /**
   * Clear currently selected feature
   * @param {boolean} clearHighlights - Whether to remove all highlights (default: false)
   * @private
   */
  function _clearSelectedFeature(clearHighlights = false) {
    _currentSelectedFeature = null;

    // Only clear highlights if explicitly requested
    if (
      clearHighlights &&
      App.UI.FeatureSelector &&
      App.UI.FeatureSelector.removeHighlight
    ) {
      App.UI.FeatureSelector.removeHighlight();
    }

    // Clear state
    if (App.Core.State) {
      App.Core.State.set("map.lastSelectedFeature", null);

      // Only clear the selected features array if also clearing highlights
      if (clearHighlights) {
        App.Core.State.set("map.selectedFeatures", []);
      }
    }
  }

  /**
   * Select all similar features within the screen area or distance radius
   * @param {Object} feature - The reference feature
   * @param {string} attributeName - The attribute to match (e.g., 'eigent1')
   * @param {boolean} addToSelection - Whether to add to existing selection (true) or replace (false)
   * @param {number} maxDistanceMeters - Maximum distance in meters (0 = use screen bounds)
   * @private
   */
  function _selectSimilarFeatures(feature, attributeName = 'eigent1', addToSelection = true, maxDistanceMeters = 0) {
    if (!feature || !feature.layer || !feature.properties) {
      console.warn("Invalid feature for similar selection");
      return [];
    }

    const layerId = feature.layer.id;
    const attributeValue = feature.properties[attributeName];
    
    if (attributeValue === undefined || attributeValue === null) {
      console.warn(`Feature has no value for attribute '${attributeName}'`);
      return [];
    }

    console.log(`Selecting features in layer '${layerId}' with ${attributeName}='${attributeValue}'`);
    if (maxDistanceMeters > 0) {
      console.log(`Within ${maxDistanceMeters}m radius`);
    }

    // Get feature center point
    let featureCenter = null;
    if (feature.geometry) {
      if (feature.geometry.type === 'Point') {
        featureCenter = feature.geometry.coordinates;
      } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
        // Get centroid using turf if available
        if (window.turf) {
          const centroid = turf.centroid(feature);
          featureCenter = centroid.geometry.coordinates;
        }
      } else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
        // Get center using turf if available
        if (window.turf) {
          const center = turf.center(feature);
          featureCenter = center.geometry.coordinates;
        }
      }
    }

    let allFeatures;
    
    if (maxDistanceMeters > 0 && featureCenter && window.turf) {
      // Create a circle around the feature center
      const circle = turf.circle(featureCenter, maxDistanceMeters / 1000, { units: 'kilometers' });
      const bbox = turf.bbox(circle);
      
      // Convert bbox to map bounds
      const sw = _map.project([bbox[0], bbox[1]]);
      const ne = _map.project([bbox[2], bbox[3]]);
      
      // Query features within the bounding box
      allFeatures = _map.queryRenderedFeatures([sw, ne]);
    } else {
      // Query all rendered features in the current viewport
      allFeatures = _map.queryRenderedFeatures();
    }
    
    // Filter features that match our criteria
    let similarFeatures = allFeatures.filter(f => {
      return f.layer && 
             f.layer.id === layerId && 
             f.properties &&
             f.properties[attributeName] === attributeValue;
    });

    // If distance filtering is enabled, further filter by actual distance
    if (maxDistanceMeters > 0 && featureCenter && window.turf) {
      similarFeatures = similarFeatures.filter(f => {
        if (!f.geometry) return false;
        
        let targetCenter;
        if (f.geometry.type === 'Point') {
          targetCenter = f.geometry.coordinates;
        } else if (window.turf) {
          const centroid = turf.centroid(f);
          targetCenter = centroid.geometry.coordinates;
        }
        
        if (targetCenter) {
          const distance = turf.distance(featureCenter, targetCenter, { units: 'meters' });
          return distance <= maxDistanceMeters;
        }
        
        return false;
      });
    }

    console.log(`Found ${similarFeatures.length} similar features`);

    if (similarFeatures.length > 0) {
      // Set selection mode to multi if not already
      if (App.UI.FeatureSelector && App.UI.FeatureSelector.getSelectionMode() === 'single') {
        App.UI.FeatureSelector.setSelectionMode('multi');
      }

      // Clear existing selection if not adding to it
      if (!addToSelection && App.UI.FeatureSelector) {
        App.UI.FeatureSelector.removeHighlight();
      }

      // Highlight all similar features
      similarFeatures.forEach(f => {
        if (App.UI.FeatureSelector && App.UI.FeatureSelector.highlightFeature) {
          App.UI.FeatureSelector.highlightFeature(f, false); // false = don't clear existing
        }
      });

      // Update state with all selected features
      if (App.Core.State) {
        const currentSelection = addToSelection ? 
          (App.Core.State.get("map.selectedFeatures") || []) : [];
        
        // Merge with existing selection, avoiding duplicates
        const updatedSelection = [...currentSelection];
        similarFeatures.forEach(f => {
          const isDuplicate = updatedSelection.some(existing => 
            (existing.id === f.id) ||
            (existing.geometry && f.geometry && 
             JSON.stringify(existing.geometry) === JSON.stringify(f.geometry))
          );
          if (!isDuplicate) {
            updatedSelection.push(f);
          }
        });
        
        App.Core.State.set("map.selectedFeatures", updatedSelection);
      }

      // Trigger event
      App.Core.Events.trigger("features.similarSelected", {
        referenceFeature: feature,
        similarFeatures: similarFeatures,
        attributeName: attributeName,
        attributeValue: attributeValue,
        totalSelected: similarFeatures.length,
        maxDistance: maxDistanceMeters
      });

      return similarFeatures;
    }

    return [];
  }

  /**
   * Clean up existing handlers
   * @private
   */
  function _cleanupHandlers() {
    if (!_map) return;

    // Remove all click handlers
    if (_map._listeners && _map._listeners.click) {
      _map._listeners.click = [];
    }
  }

  /**
   * Handle map context menu events (right-click/long-press)
   * @param {Object} e - Context menu event
   * @private
   */
  function _handleContextMenu(e) {
    console.log("Map long-click detected", e.lngLat);

    // For backward compatibility
    if (window.reha && typeof window.reha.sendCallback === "function") {
      reha.sendCallback(
        "longclick",
        BiHelper.toJson(BiHelper.serializeLatLng(e.lngLat))
      );
    }

    // Trigger event for new module-based approach
    App.Core.Events.trigger("map:longclick", {
      lngLat: e.lngLat,
    });
  }

  /**
   * Handle map moveend events
   * @param {Object} e - Move end event
   * @private
   */
  function _handleMapMoveEnd(e) {
    const now = Date.now();
    if (now - _lastMoveEndCall > 500) {
      try {
        const bounds = e.target.getBounds();

        // For backward compatibility
        if (window.reha && typeof window.reha.sendCallback === "function") {
          const serializedBounds = BiHelper.serializeBounds(bounds);
          reha.sendCallback("moveend", BiHelper.toJson(serializedBounds));
        }

        // Trigger event for new module-based approach
        App.Core.Events.trigger("map:moveend", {
          bounds: bounds,
        });
      } catch (error) {
        console.error("Error in moveend handler:", error);
      }
      _lastMoveEndCall = now;
    }
  }

  /**
   * Handle map zoom end events
   * @param {Object} e - Zoom end event
   * @private
   */
  function _handleMapZoomEnd(e) {
    try {
      const zoomLevel = e.target.getZoom();
      console.log("Zoom level detected:", zoomLevel);

      // For backward compatibility
      if (window.reha && typeof window.reha.sendCallback === "function") {
        reha.sendCallback("zoom", BiHelper.toJson(zoomLevel));
      }

      // Trigger event for new module-based approach
      App.Core.Events.trigger("map:zoomend", {
        zoom: zoomLevel,
      });
    } catch (error) {
      console.error("Error in zoomend handler:", error);
    }
  }

  /**
   * Set up all map event handlers
   * @private
   */
  function _setupMapEvents() {
    if (!_map) {
      console.error("Cannot set up map events: map instance is null");
      return;
    }

    if (_eventsInitialized) {
      console.log("Map events already initialized, resetting first");
      _removeMapEvents();
    }

    // Add event handlers
    _map.on("click", _handleMapClick);
    _map.on("contextmenu", _handleContextMenu);
    _map.on("moveend", _handleMapMoveEnd);
    _map.on("zoomend", _handleMapZoomEnd);

    _eventsInitialized = true;
    console.log("Map event handlers attached");
  }

  /**
   * Remove all map event handlers
   * @private
   */
  function _removeMapEvents() {
    if (!_map) return;

    _map.off("click", _handleMapClick);
    _map.off("contextmenu", _handleContextMenu);
    _map.off("moveend", _handleMapMoveEnd);
    _map.off("zoomend", _handleMapZoomEnd);

    _eventsInitialized = false;
    console.log("Map event handlers removed");
  }

  // Public API
  return {
    /**
     * Initialize map events
     * @param {Object} map - MapLibre map instance
     */
    initialize: function (map) {
      _map = map;

      // Clean up any existing handlers
      _clearHandlers();

      // Add single click handler
      _map.on("click", _handleMapClick);

      console.log("Map events initialized with single click handler");
    },

    /**
     * Reset event handlers
     */
    reset: function () {
      if (!_map) return;

      _cleanupHandlers();
      _map.on("click", _handleMapClick);

      console.log("Map event handlers reset");
    },

    /**
     * Get interactive layers
     */
    getInteractiveLayers: _getInteractiveLayers,

    /**
     * Clear selection
     * @param {boolean} clearHighlights - Whether to remove all highlights (default: true)
     */
    clearSelection: function (clearHighlights = true) {
      _clearSelectedFeature(clearHighlights);

      // Close the feature info sidebar if open
      const rightDrawer = document.getElementById("right1-drawer");
      if (rightDrawer) {
        rightDrawer.hide();
      }
    },

    /**
     * Highlight a feature using the FeatureSelector
     * @param {Object} feature - Feature to highlight
     */
    highlightFeature: function (feature) {
      if (App.UI.FeatureSelector && App.UI.FeatureSelector.highlightFeature) {
        App.UI.FeatureSelector.highlightFeature(feature, false);
      }
    },

    /**
     * Get current selected feature
     * @returns {Object} Currently selected feature
     */
    getSelectedFeature: function () {
      return _currentSelectedFeature;
    },

    /**
     * Get all currently highlighted features
     * @returns {Array} Array of highlighted features
     */
    getHighlightedFeatures: function () {
      if (
        App.UI.FeatureSelector &&
        App.UI.FeatureSelector.getActiveHighlights
      ) {
        return App.UI.FeatureSelector.getActiveHighlights();
      }
      return [];
    },

    /**
     * Clear all highlights
     */
    clearAllHighlights: function () {
      if (App.UI.FeatureSelector && App.UI.FeatureSelector.removeHighlight) {
        App.UI.FeatureSelector.removeHighlight();
      }
    },

    /**
     * Select all similar features within the screen area or distance radius
     * @param {Object} feature - The reference feature to match
     * @param {string} attributeName - The attribute to match (default: 'eigent1')
     * @param {boolean} addToSelection - Whether to add to existing selection (default: true)
     * @param {number} maxDistanceMeters - Maximum distance in meters (default: 0 = use screen bounds)
     * @returns {Array} Array of selected features
     */
    selectSimilarFeatures: function (feature, attributeName = 'eigent1', addToSelection = true, maxDistanceMeters = 0) {
      return _selectSimilarFeatures(feature, attributeName, addToSelection, maxDistanceMeters);
    },

    /**
     * Select similar features for the currently selected feature
     * @param {string} attributeName - The attribute to match (default: 'eigent1')
     * @param {boolean} addToSelection - Whether to add to existing selection (default: true)
     * @param {number} maxDistanceMeters - Maximum distance in meters (default: 0 = use screen bounds)
     * @returns {Array} Array of selected features
     */
    selectSimilarForCurrent: function (attributeName = 'eigent1', addToSelection = true, maxDistanceMeters = 0) {
      if (_currentSelectedFeature) {
        return _selectSimilarFeatures(_currentSelectedFeature, attributeName, addToSelection, maxDistanceMeters);
      }
      console.warn("No feature currently selected");
      return [];
    },

    /**
     * Select similar features within 1000m radius
     * @param {Object} feature - The reference feature to match (optional, uses current if not provided)
     * @param {string} attributeName - The attribute to match (default: 'eigent1')
     * @returns {Array} Array of selected features
     */
    selectSimilarWithin1000m: function (feature = null, attributeName = 'eigent1') {
      const targetFeature = feature || _currentSelectedFeature;
      if (!targetFeature) {
        console.warn("No feature provided or currently selected");
        return [];
      }
      return _selectSimilarFeatures(targetFeature, attributeName, true, 1000);
    },

    /**
     * Enable besitzer mode (automatic neighbor selection)
     */
    enableBesitzerMode: function () {
      _besitzerModeEnabled = true;
      console.log("Besitzer mode enabled - automatic neighbor selection is active");
    },

    /**
     * Disable besitzer mode
     */
    disableBesitzerMode: function () {
      _besitzerModeEnabled = false;
      console.log("Besitzer mode disabled");
    },

    /**
     * Check if besitzer mode is enabled
     * @returns {boolean} True if besitzer mode is active
     */
    isBesitzerModeEnabled: function () {
      return _besitzerModeEnabled;
    },

    /**
     * Toggle besitzer mode
     * @returns {boolean} New state of besitzer mode
     */
    toggleBesitzerMode: function () {
      _besitzerModeEnabled = !_besitzerModeEnabled;
      console.log("Besitzer mode " + (_besitzerModeEnabled ? "enabled" : "disabled"));
      return _besitzerModeEnabled;
    },
  };
})();

// Debug function to test object info
window.debugObjectInfo = function() {
  const objectInfo = document.querySelector("object-info");
  console.log("Object info element:", objectInfo);
  
  if (objectInfo) {
    // Check available methods
    console.log("Constructor name:", objectInfo.constructor.name);
    console.log("Prototype:", Object.getPrototypeOf(objectInfo));
    console.log("Own properties:", Object.getOwnPropertyNames(objectInfo));
    
    // Check for methods on prototype
    const proto = Object.getPrototypeOf(objectInfo);
    console.log("Prototype methods:", Object.getOwnPropertyNames(proto));
    
    // Check if setFeature exists
    console.log("setFeature exists:", 'setFeature' in objectInfo);
    console.log("setFeature type:", typeof objectInfo.setFeature);
    
    // Try to access methods directly
    if (proto.setFeature) {
      console.log("Found setFeature on prototype");
      
      // Test with sample data
      const testFeature = {
        type: 'Feature',
        id: 12345,
        properties: {
          name: 'Test Feature',
          eigent1: 'Test Owner',
          gnr: '123/45',
          kg: '72118',
          rstatus: 'E'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[[14.0, 46.0], [14.1, 46.0], [14.1, 46.1], [14.0, 46.1], [14.0, 46.0]]]
        },
        layer: {
          id: 'test-layer',
          source: 'test-source'
        }
      };
      
      try {
        proto.setFeature.call(objectInfo, testFeature);
        console.log("setFeature called successfully via prototype");
      } catch (error) {
        console.error("Error calling setFeature:", error);
      }
    }
    
    // Check shadowRoot
    if (objectInfo.shadowRoot) {
      const content = objectInfo.shadowRoot.getElementById("content");
      console.log("Content element in shadowRoot:", content);
      if (content) {
        console.log("Content innerHTML:", content.innerHTML.substring(0, 200) + "...");
      }
    } else {
      console.log("No shadowRoot found");
    }
  }
  
  // Also check if component is registered
  console.log("Component registered:", customElements.get('object-info'));
  
  return objectInfo;
};

window.fixMapClickHandlers = function () {
  console.log("🔧 Fixing map click handlers...");

  // Get the map instance
  var map = window.interface?.map || App.Map.Init?.getMap();
  if (!map) {
    console.error("❌ Map not found");
    return;
  }

  // Reset the event system
  if (App.Map.Events) {
    App.Map.Events.reset();
  }

  console.log("✅ Map click handlers fixed");

  // Return diagnostic info
  return {
    success: true,
    clickHandlers: map._listeners.click ? map._listeners.click.length : 0,
  };
};

console.log("App.Map.Events module loaded");
