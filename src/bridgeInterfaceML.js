var BridgeInterface = function (domElementName) {
  var self = this;

  let lastBearing = null;
  let lastUpdate = 0;
  let rotationUpdateRate = 300;
  let mapReady = false;
  let isAnimating = false;
  // Add custom protocol handler for TIFF files
  maplibregl.addProtocol("tiff", async (params, abortController) => {
    try {
      /**
       * Fetches the TIFF file from the specified URL
       * @param {Object} params - The parameters containing the URL to fetch
       * @returns {Promise<Response>} - The fetch response object
       */
      const response = await fetch(params.url);
      if (!response.ok) {
        throw new Error(`Failed to load TIFF: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return { data: arrayBuffer };
    } catch (error) {
      console.error(`Error loading TIFF: ${error.message}`);
      throw error;
    }
  });

  // Try the new module approach first
  var useNewModules = false;

  try {
    useNewModules =
      typeof App !== "undefined" &&
      typeof App.Map !== "undefined" &&
      typeof App.Map.Init !== "undefined" &&
      typeof App.Map.Init.initializeMap === "function";
  } catch (e) {
    console.error("Error checking for new modules:", e);
  }

  // Log which approach we're using
  console.log("Using new module approach:", useNewModules);

  if (useNewModules) {
    // Try to get an existing map instance
    this.map = App.Map.Init.getMap();

    // If no map exists yet, initialize one
    if (!this.map) {
      console.log("No existing map found, initializing new map");
      this.map = App.Map.Init.initializeMap(domElementName);
    }
  } else {
    // Fall back to original initialization
    console.log("Using original map initialization");

    // IMPORTANT: Initialize the layer management module with the map
    if (App.Map.Layers && typeof App.Map.Layers.initialize === "function") {
      console.log("Initializing App.Map.Layers with map instance");
      App.Map.Layers.initialize(this.map);
    } else {
      console.error("App.Map.Layers module or initialize function not found");
    }

    // Your original map initialization code
    maplibregl.addProtocol("tiff", async (params, abortController) => {
      try {
        const response = await fetch(params.url);
        if (!response.ok) {
          throw new Error(`Failed to load TIFF: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return { data: arrayBuffer };
      } catch (error) {
        console.error(`Error loading TIFF: ${error.message}`);
        throw error;
      }
    });

    /**
     * Creates a new MapLibre GL JS map instance with the specified configuration.
     * This initializes the map with default settings for container, style, zoom levels,
     * and visual appearance including sky and atmosphere settings.
     */
    this.map = new maplibregl.Map({
      container: domElementName,
      // Style configuration for the map, using the "Basemap Standard" style from mapConfig
      style: mapConfig.backgroundMaps["Basemap Standard"].style,
      zoom: 0,
      minZoom: 1,
      maxZoom: 28,
      pixelRatio: window.devicePixelRatio || 1,
      attributionControl: false,
      maxPitch: 85,
      sky: {
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
      },
    });
  }

  // Map methods for backward compatibility
  this.setScaleEnabled = function (enabled) {
    if (App.Map.Controls) {
      App.Map.Controls.setScaleEnabled(enabled);
      return true;
    }
    return false;
  };

  this.setScaleImperial = function (enabled) {
    if (App.Map.Controls) {
      App.Map.Controls.setScaleUnits(!enabled); // true = metric, false = imperial
      return true;
    }
    return false;
  };

  this.showZoomLevel = function (show) {
    if (App.Map.Controls) {
      App.Map.Controls.showZoomLevel(show);
      return true;
    }
    return false;
  };

  // Updated methods to use Map.Controls
  this.addControl = function (control, position) {
    if (App.Map.Controls) {
      App.Map.Controls.addControl(control, position);
    } else {
      this.map.addControl(control, position);
    }
  };

  this.removeControl = function (control) {
    if (App.Map.Controls) {
      App.Map.Controls.removeControl(control);
    } else {
      this.map.removeControl(control);
    }
  };

  // Set up Overlay functionality
  if (App.Map.Overlay) {
    App.Map.Overlay.initialize(this.map);

    // Map old methods to new module methods
    this.toggleOverlayLayer = function (layerConfig) {
      App.Map.Overlay.toggleOverlayLayer(layerConfig);
    };

    this.toggleWmsLayer = function (layerConfig) {
      App.Map.Overlay.toggleWmsLayer(layerConfig);
    };

    this.exploreWmsLayers = function (wmsUrl) {
      App.Map.Overlay.exploreWmsLayers(wmsUrl);
    };
  }

  // Initialize search module if available
  if (App.UI.Search) {
    App.UI.Search.initialize(this.map);

    // Optionally map methods for backward compatibility
    this.filter_search2extent = function () {
      App.UI.Search.filterSearch2extent();
    };

    this.do_search = function (switchSearch) {
      App.UI.Search.doSearch(switchSearch);
    };

    // Map other methods as needed
  }

  // Initialize other modules
  if (App.Map.Navigation) {
    App.Map.Navigation.initialize(this.map);

    // Set up property forwarding for backward compatibility
    this.currentLocation = App.Map.Navigation.getPosition();

    // GPS update throttling variables
    var _lastGPSUpdate = 0;
    var _lastPositionUpdate = 0;
    var _lastPositionEnabledState = null;
    var _lastPositionEnabledUpdate = 0;
    
    // Get throttling intervals from performance config
    function getGPSUpdateInterval() {
      return App.Core.PerformanceConfig ? 
        App.Core.PerformanceConfig.get('gps.updateInterval') : 1000;
    }
    
    function getPositionUpdateInterval() {
      return App.Core.PerformanceConfig ? 
        App.Core.PerformanceConfig.get('gps.positionUpdateInterval') : 1000;
    }
    
    // Map the old methods to the new module methods with throttling
    // Note: In MapLibre, setPosition updates the GNSS/GPS marker position, not the manual position marker
    // This matches the Java implementation expectations where setPosition is used for GPS updates
    // The manual position marker is controlled separately through the UI
    this.setPosition = function (position) {
      var now = Date.now();
      
      // Throttle position updates based on config
      var interval = getPositionUpdateInterval();
      if (now - _lastPositionUpdate < interval) {
        // Skip this update - too soon since last update
        if (App.Core.PerformanceConfig && App.Core.PerformanceConfig.get('debug.logThrottledUpdates')) {
          console.log(`Skipping position update - throttled (${interval}ms)`);
        }
        return;
      }
      
      _lastPositionUpdate = now;
      window._lastGPSUpdateTime = now; // Track for performance dashboard
      
      // For MapLibre, setPosition should update the GNSS/GPS position
      // This matches the Java code expectations and GNSS simulator usage
      if (Array.isArray(position) && position.length === 2) {
        App.Map.Navigation.updateGPSLocation(position[0], position[1]);
      } else {
        console.warn("Bridge: setPosition called with invalid position format:", position);
      }
      
      self.currentLocation = position; // Keep local property in sync
    };

    this.updateGPSLocation = function (lng, lat) {
      console.log("updateGPSLocation raw call - arguments:", arguments, "arguments.length:", arguments.length);
      console.log("lng parameter:", lng, "typeof:", typeof lng);
      console.log("lat parameter:", lat, "typeof:", typeof lat);
      
      var now = Date.now();
      
      // Handle different input formats
      if (Array.isArray(lng) && lng.length === 2) {
        // Array format: [lng, lat]
        console.log("Parsing array format");
        lat = lng[1];
        lng = lng[0];
      } else if (typeof lng === 'object' && lng !== null && !Array.isArray(lng)) {
        // Object format (unexpected but let's log it)
        console.log("Received object format:", JSON.stringify(lng));
        // Try to extract coordinates if it's a LatLng-like object
        if (lng.lng !== undefined && lng.lat !== undefined) {
          lat = lng.lat;
          lng = lng.lng;
        } else if (lng.longitude !== undefined && lng.latitude !== undefined) {
          lat = lng.latitude;
          lng = lng.longitude;
        } else {
          console.error("Unknown object format for GPS coordinates:", lng);
          return;
        }
      } else if (arguments.length === 1 && typeof lng === 'string' && lng.indexOf(',') > -1) {
        // Single string with comma: "lng,lat"
        console.log("Parsing comma-separated string:", lng);
        var coords = lng.split(',');
        if (coords.length >= 2) {
          lng = parseFloat(coords[0].trim());
          lat = parseFloat(coords[1].trim());
          console.log("Parsed to lng:", lng, "lat:", lat);
        } else {
          console.error("Invalid GPS coordinate string format:", lng);
          return;
        }
      } else if (typeof lng === 'string' && typeof lat === 'string') {
        // Two string parameters
        console.log("Converting string parameters to numbers");
        lng = parseFloat(lng);
        lat = parseFloat(lat);
      } else if (typeof lng === 'number' && typeof lat === 'number') {
        // Already numbers, good to go
        console.log("Parameters are already numbers");
      } else if (arguments.length === 2) {
        // Two parameters but unexpected types - try to convert
        console.log("Two parameters with unexpected types - attempting conversion");
        if (typeof lng === 'string') lng = parseFloat(lng);
        if (typeof lat === 'string') lat = parseFloat(lat);
      } else {
        console.error("Unhandled parameter format - lng:", lng, "lat:", lat);
      }
      
      // Validate coordinates
      if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
        console.error("Invalid GPS coordinates: lng=" + lng + ", lat=" + lat);
        return;
      }
      
      // Throttle GPS updates based on config
      var interval = getGPSUpdateInterval();
      if (now - _lastGPSUpdate < interval) {
        // Skip this update - too soon since last update
        if (App.Core.PerformanceConfig && App.Core.PerformanceConfig.get('debug.logThrottledUpdates')) {
          console.log(`Skipping GPS update - throttled (${interval}ms)`);
        }
        return;
      }
      
      _lastGPSUpdate = now;
      window._lastGPSUpdateTime = now; // Track for performance dashboard
      console.log("Bridge: Calling App.Map.Navigation.updateGPSLocation with lng=" + lng + ", lat=" + lat);
      App.Map.Navigation.updateGPSLocation(lng, lat);
    };

    this.setPositionEnabled = function (enabled) {
      var now = Date.now();
      
      // Only update if state has changed or if it's been more than the configured interval
      var interval = getPositionUpdateInterval();
      if (_lastPositionEnabledState === enabled && 
          now - _lastPositionEnabledUpdate < interval) {
        // Skip this update - state hasn't changed and too soon
        if (App.Core.PerformanceConfig && App.Core.PerformanceConfig.get('debug.logThrottledUpdates')) {
          console.log("Skipping setPositionEnabled - throttled or no change");
        }
        return;
      }
      
      _lastPositionEnabledState = enabled;
      _lastPositionEnabledUpdate = now;
      console.log("Bridge: setPositionEnabled called with:", enabled);
      // For MapLibre, setPositionEnabled should control the GNSS marker to match Java expectations
      App.Map.Navigation.setGnssEnabled(enabled);
    };

    this.updateLocationMarker = function (markerUrl) {
      console.log("updateLocationMarker called with:", markerUrl);
      
      if (
        App.Map.Navigation &&
        typeof App.Map.Navigation.updateLocationMarker === "function"
      ) {
        App.Map.Navigation.updateLocationMarker(markerUrl);
      } else {
        console.warn(
          "App.Map.Navigation.updateLocationMarker not available"
        );
      }
    };

    this.UpdateLocationMarker = function (markerUrl) {
      // Only log in debug mode
      if (window.DEBUG || window._debugMode) {
        console.log("updateLocationMarker called with:", markerUrl);
      }
      
      if (
        App.Map.Navigation &&
        typeof App.Map.Navigation.updateLocationMarker === "function"
      ) {
        App.Map.Navigation.updateLocationMarker(markerUrl);
      } else if (window.DEBUG || window._debugMode) {
        console.warn(
          "App.Map.Navigation.updateLocationMarker not available, falling back to direct method"
        );
      }
    };

    this.setMapReady = function (ready) {
      App.Map.Navigation.setMapReady(ready);
    };

    this.rotateMap = function (bearing) {
      App.Map.Navigation.rotateMap(bearing);
    };

    // GLRM Tilt Bridge Methods
    var _lastGLRMUpdate = 0;
    var _glrmUpdateThrottle = 100; // Throttle GLRM updates to 100ms

    /**
     * Update GLRM tilt data and position
     * @param {number} lng - Longitude
     * @param {number} lat - Latitude  
     * @param {number} tiltAngle - Tilt angle in degrees
     * @param {number} azimuthAngle - Azimuth angle in degrees
     * @param {string} status - Tilt status ('active', 'calibrating', 'inactive')
     */
    this.updateGLRMTiltData = function (lng, lat, tiltAngle, azimuthAngle, status) {
      // Throttle updates to prevent performance issues
      const currentTime = Date.now();
      if (currentTime - _lastGLRMUpdate < _glrmUpdateThrottle) {
        return;
      }
      _lastGLRMUpdate = currentTime;

      // Validate input parameters
      if (typeof lng !== 'number' || typeof lat !== 'number' || 
          isNaN(lng) || isNaN(lat) || 
          Math.abs(lng) > 180 || Math.abs(lat) > 90) {
        console.error('[Bridge] Invalid GLRM coordinates:', lng, lat);
        return;
      }

      // Validate tilt angle (0-90 degrees)
      if (typeof tiltAngle !== 'number' || isNaN(tiltAngle) || tiltAngle < 0 || tiltAngle > 90) {
        console.error('[Bridge] Invalid GLRM tilt angle:', tiltAngle);
        return;
      }

      // Validate azimuth angle (0-360 degrees)
      if (typeof azimuthAngle !== 'number' || isNaN(azimuthAngle) || azimuthAngle < 0 || azimuthAngle > 360) {
        console.error('[Bridge] Invalid GLRM azimuth angle:', azimuthAngle);
        return;
      }

      console.log('[Bridge] GLRM tilt data update:', {
        position: [lng, lat],
        tiltAngle: tiltAngle,
        azimuthAngle: azimuthAngle,
        status: status
      });

      // Update GPS position first
      if (App.Map.Navigation && typeof App.Map.Navigation.updateGPSLocation === "function") {
        App.Map.Navigation.updateGPSLocation(lng, lat);
      }

      // Update tilt visualization widget
      if (App.UI && App.UI.TiltDisplayWidget && typeof App.UI.TiltDisplayWidget.updateTiltData === "function") {
        App.UI.TiltDisplayWidget.updateTiltData(tiltAngle, azimuthAngle, status);
      }

      // Send callback to Android if available
      if (typeof reha !== 'undefined' && reha.sendCallback) {
        reha.sendCallback('glrm_tilt_updated', JSON.stringify({
          lng: lng,
          lat: lat,
          tiltAngle: tiltAngle,
          azimuthAngle: azimuthAngle,
          status: status,
          timestamp: currentTime
        }));
      }
    };

    /**
     * Set GLRM tilt compensation enabled state
     * @param {boolean} enabled - Whether tilt compensation is enabled
     */
    this.setGLRMTiltEnabled = function (enabled) {
      console.log('[Bridge] GLRM tilt compensation enabled:', enabled);
      
      if (App.UI && App.UI.TiltDisplayWidget) {
        if (enabled) {
          App.UI.TiltDisplayWidget.showWidget();
          App.UI.TiltDisplayWidget.setTiltCompensationEnabled(true);
        } else {
          App.UI.TiltDisplayWidget.hideWidget();
          App.UI.TiltDisplayWidget.setTiltCompensationEnabled(false);
        }
      }

      // Send callback to Android
      if (typeof reha !== 'undefined' && reha.sendCallback) {
        reha.sendCallback('glrm_tilt_enabled_changed', JSON.stringify({
          enabled: enabled,
          timestamp: Date.now()
        }));
      }
    };

    /**
     * Update GLRM calibration progress
     * @param {number} progress - Calibration progress percentage (0-100)
     */
    this.updateGLRMCalibrationProgress = function (progress) {
      // Validate progress value
      if (typeof progress !== 'number' || isNaN(progress) || progress < 0 || progress > 100) {
        console.error('[Bridge] Invalid GLRM calibration progress:', progress);
        return;
      }

      console.log('[Bridge] GLRM calibration progress:', progress + '%');
      
      if (App.UI && App.UI.TiltDisplayWidget && typeof App.UI.TiltDisplayWidget.updateCalibrationProgress === "function") {
        App.UI.TiltDisplayWidget.updateCalibrationProgress(progress);
      }

      // Send callback to Android
      if (typeof reha !== 'undefined' && reha.sendCallback) {
        reha.sendCallback('glrm_calibration_progress', JSON.stringify({
          progress: progress,
          timestamp: Date.now()
        }));
      }
    };

    /**
     * Update comprehensive GLRM data (alternative method for complex data)
     * @param {Object} glrmData - Complete GLRM data object
     */
    this.updateGLRMData = function (glrmData) {
      // Validate input
      if (!glrmData || typeof glrmData !== 'object') {
        console.error('[Bridge] Invalid GLRM data object:', glrmData);
        return;
      }

      // Extract data with defaults
      const lng = glrmData.lng || glrmData.longitude || 0;
      const lat = glrmData.lat || glrmData.latitude || 0;
      const tiltAngle = glrmData.tiltAngle || glrmData.tilt_angle || 0;
      const azimuthAngle = glrmData.azimuthAngle || glrmData.azimuth_angle || 0;
      const status = glrmData.status || 'inactive';

      // Delegate to main update method
      this.updateGLRMTiltData(lng, lat, tiltAngle, azimuthAngle, status);
    };
  }

  // Initialize layers with the map
  if (App.Map.Layers && typeof App.Map.Layers.initialize === "function") {
    console.log("Calling App.Map.Layers.initialize with map");
    App.Map.Layers.initialize(this.map);
  } else {
    console.error("App.Map.Layers module not available!");
  }

  /**
   * Zoom to the extent of a GeoJSON layer
   * @param {string} layerId - The layer ID (source ID)
   * @param {Object} options - Optional settings
   */
  this.zoomToGeoJsonExtent = function (layerId, options) {
    if (
      App.Map.Layers &&
      typeof App.Map.Layers.zoomToGeoJsonExtent === "function"
    ) {
      return App.Map.Layers.zoomToGeoJsonExtent(layerId, options);
    } else {
      console.error("App.Map.Layers.zoomToGeoJsonExtent not available");
    }
  };

  /**
   * Zoom to multiple GeoJSON layers
   * @param {Array<string>} layerIds - Array of layer IDs
   * @param {Object} options - Optional settings
   */
  this.zoomToMultipleGeoJsonExtents = function (layerIds, options) {
    if (
      App.Map.Layers &&
      typeof App.Map.Layers.zoomToMultipleGeoJsonExtents === "function"
    ) {
      return App.Map.Layers.zoomToMultipleGeoJsonExtents(layerIds, options);
    } else {
      console.error(
        "App.Map.Layers.zoomToMultipleGeoJsonExtents not available"
      );
    }
  };

  /**
   * Zoom to all GeoJSON features on the map
   * @param {Object} options - Optional settings
   */
  this.zoomToAllGeoJsonFeatures = function (options) {
    if (
      App.Map.Layers &&
      typeof App.Map.Layers.zoomToAllGeoJsonFeatures === "function"
    ) {
      return App.Map.Layers.zoomToAllGeoJsonFeatures(options);
    } else {
      console.error("App.Map.Layers.zoomToAllGeoJsonFeatures not available");
    }
  };

  // Bridge methods to App.Map.Layers
  this.addFeature = function (layerId, objectid, geojson, style) {
    if (App.Map.Layers && typeof App.Map.Layers.addFeature === "function") {
      return App.Map.Layers.addFeature(layerId, objectid, geojson, style);
    }
  };

  /**
   * Native → JS   · Push the whole category list to the map module
   * @param  {string|Array<Object>} categories   JSON string OR already-parsed array
   */
  this.loadCategories = function (categories) {
    const rawType = typeof categories;
    const preview =
      rawType === "string"
        ? categories.substring(0, 120) + (categories.length > 120 ? "…" : "")
        : `Array[${categories.length}]`;

    console.log(`[Bridge] loadCategories → (${rawType}) ${preview}`);

    if (App.Map.Layers && typeof App.Map.Layers.loadCategories === "function") {
      const result = App.Map.Layers.loadCategories(categories);
      console.log(
        `[Bridge] loadCategories ✓ cached ${
          App.Map.Layers.getFeatureLayers
            ? (App.Map.Layers.getFeatureLayers().length || 0) +
              " feature layers"
            : "–"
        }`
      );
      return result;
    } else {
      console.warn(
        "[Bridge] loadCategories ✗ App.Map.Layers.loadCategories not found"
      );
    }
  };
  
  /**
   * Batch load features for a layer
   * @param {string} layerId - Layer ID
   * @param {string} featuresJson - JSON string containing feature collection
   */
  this.loadFeatureCollection = function(layerId, featuresJson) {
    console.log(`[Bridge] loadFeatureCollection for layer: ${layerId}`);
    
    try {
      const featureCollection = typeof featuresJson === 'string' 
        ? JSON.parse(featuresJson) 
        : featuresJson;
        
      if (App.Map.Layers && typeof App.Map.Layers.loadFeatureCollection === 'function') {
        App.Map.Layers.loadFeatureCollection(layerId, featureCollection);
        console.log(`[Bridge] Loaded ${featureCollection.features.length} features to layer ${layerId}`);
      } else {
        console.warn('[Bridge] App.Map.Layers.loadFeatureCollection not available');
      }
    } catch (e) {
      console.error('[Bridge] Error parsing feature collection:', e);
    }
  };
  
  /**
   * Batch update multiple layers at once
   * @param {string} layerDataJson - JSON object with layerId as keys and feature collections as values
   */
  this.batchUpdateLayers = function(layerDataJson) {
    console.log('[Bridge] batchUpdateLayers called');
    
    try {
      const layerData = typeof layerDataJson === 'string' 
        ? JSON.parse(layerDataJson) 
        : layerDataJson;
        
      if (App.Map.Layers && typeof App.Map.Layers.batchUpdateLayers === 'function') {
        App.Map.Layers.batchUpdateLayers(layerData);
        console.log(`[Bridge] Batch updated ${Object.keys(layerData).length} layers`);
      } else {
        console.warn('[Bridge] App.Map.Layers.batchUpdateLayers not available');
      }
    } catch (e) {
      console.error('[Bridge] Error parsing layer data:', e);
    }
  };

  this.addImageLayer = function (layerId, objId, image, southWest, northEast) {
    if (App.Map.Layers && typeof App.Map.Layers.addImageLayer === "function") {
      return App.Map.Layers.addImageLayer(
        layerId,
        objId,
        image,
        southWest,
        northEast
      );
    }
  };

  this.addWMSLayer = function (id, url, layer, format, maxZoom) {
    if (App.Map.Layers && typeof App.Map.Layers.addWMSLayer === "function") {
      return App.Map.Layers.addWMSLayer(id, url, layer, format, maxZoom);
    }
  };

  this.addText = function (layerId, objId, position, text, style) {
    if (App.Map.Layers && typeof App.Map.Layers.addText === "function") {
      return App.Map.Layers.addText(layerId, objId, position, text, style);
    }
  };

  this.addCircleFeature = function (layerId, objId, center, radius, style) {
    if (App.Map.Layers && typeof App.Map.Layers.addCircleFeature === "function") {
      return App.Map.Layers.addCircleFeature(layerId, objId, center, radius, style);
    } else {
      console.error("App.Map.Layers.addCircleFeature not available");
    }
  };

  this.addImageMarker = function (
    layerId,
    objId,
    position,
    image,
    size,
    text,
    isDraggable,
    markerOffset
  ) {
    if (App.Map.Layers && typeof App.Map.Layers.addImageMarker === "function") {
      return App.Map.Layers.addImageMarker(
        layerId,
        objId,
        position,
        image,
        size,
        text,
        isDraggable,
        markerOffset
      );
    }
  };

  this.addImageFeature = function (
    layerId,
    objId,
    position,
    image,
    size,
    text,
    isDraggable,
    markerOffset
  ) {
    // Handle both 5-parameter (old Android) and 8-parameter calls
    if (arguments.length === 5) {
      // Old format: layerId, objId, position (geoJson), image, size
      text = null;
      isDraggable = false;
      markerOffset = [0, 0];
    }
    // Enhanced logging to debug Android vs testpaste calls
    console.log(`===== addImageFeature TRACE START =====`);
    console.log(`Call source: ${(new Error()).stack.includes('testpaste') ? 'TESTPASTE' : 'ANDROID'}`);
    console.log(`Arguments received: ${arguments.length}`);
    console.log(`1. layerId: ${layerId} (type: ${typeof layerId})`);
    console.log(`2. objId: ${objId} (type: ${typeof objId})`);
    console.log(`3. position: ${typeof position === "string" ? position.substring(0, 100) + '...' : JSON.stringify(position)} (type: ${typeof position})`);
    console.log(`4. image: ${image ? (typeof image === "string" ? image.substring(0, 100) + '...' : "Bitmap object") : "null"} (type: ${typeof image})`);
    console.log(`5. size: ${size} (type: ${typeof size})`);
    console.log(`6. text: ${text} (type: ${typeof text})`);
    console.log(`7. isDraggable: ${isDraggable} (type: ${typeof isDraggable})`);
    console.log(`8. markerOffset: ${markerOffset} (type: ${typeof markerOffset})`);
    
    // Handle Android-style quoted strings
    // Android's JsHelper.objectify wraps strings in single quotes
    function unquoteIfNeeded(str) {
      if (typeof str === 'string' && str.startsWith("'") && str.endsWith("'")) {
        return str.slice(1, -1);
      }
      return str;
    }
    
    // Unquote string parameters that come from Android
    layerId = unquoteIfNeeded(layerId);
    objId = unquoteIfNeeded(objId);
    image = unquoteIfNeeded(image);
    
    // Handle special cases
    if (text === "null" || text === "'null'") {
      text = null;
    } else {
      text = unquoteIfNeeded(text);
    }
    
    // Convert string booleans
    if (isDraggable === "false" || isDraggable === "'false'") {
      isDraggable = false;
    } else if (isDraggable === "true" || isDraggable === "'true'") {
      isDraggable = true;
    }
    
    // Parse marker offset if it's a string
    if (typeof markerOffset === 'string') {
      try {
        markerOffset = JSON.parse(unquoteIfNeeded(markerOffset));
      } catch (e) {
        console.warn("Failed to parse markerOffset:", markerOffset);
        markerOffset = [0, 0];
      }
    }
    
    // Convert size to number if it's a string
    if (typeof size === 'string') {
      size = parseInt(size, 10);
    }
    
    console.log(`===== After parameter cleanup =====`);
    console.log(`layerId: ${layerId}`);
    console.log(`objId: ${objId}`);
    console.log(`image: ${image ? image.substring(0, 50) + '...' : 'null'}`);
    console.log(`size: ${size} (type: ${typeof size})`);
    
    // Extra validation
    if (!layerId || layerId.trim() === '') {
      console.error('ERROR: layerId is empty after cleanup!');
      return;
    }
    
    // Log what symbol layer will be created
    console.log(`Expected symbol layer ID: ${layerId}-symbols`);
    console.log(`===== addImageFeature TRACE END =====`);

    if (
      App.Map.Layers &&
      typeof App.Map.Layers.addImageFeature === "function"
    ) {
      console.log(
        `Forwarding addImageFeature call to App.Map.Layers.addImageFeature`
      );
      try {
        const result = App.Map.Layers.addImageFeature(
          layerId,
          objId,
          position,
          image,
          size,
          text,
          isDraggable,
          markerOffset
        );
        console.log(
          `App.Map.Layers.addImageFeature call completed successfully`
        );
        return result;
      } catch (error) {
        console.error(`Error in App.Map.Layers.addImageFeature:`, error);
        return null;
      }
    } else {
      console.warn(
        `App.Map.Layers.addImageFeature not available - cannot add image feature`
      );
      return null;
    }
  };

  this.addCircleMarker = function (
    layerId,
    objId,
    position,
    style,
    label,
    isDraggable
  ) {
    if (
      App.Map.Layers &&
      typeof App.Map.Layers.addCircleMarker === "function"
    ) {
      return App.Map.Layers.addCircleMarker(
        layerId,
        objId,
        position,
        style,
        label,
        isDraggable
      );
    }
  };

  this.addTextFeature = function (layerId, objectid, geojson, style) {
    if (App.Map.Layers && typeof App.Map.Layers.addTextFeature === "function") {
      return App.Map.Layers.addTextFeature(layerId, objectid, geojson, style);
    }
  };

  this.addImageOverlay = function (layerId, objectid, image, bounds) {
    if (
      App.Map.Layers &&
      typeof App.Map.Layers.addImageOverlay === "function"
    ) {
      return App.Map.Layers.addImageOverlay(layerId, objectid, image, bounds);
    }
  };

  this.addGeoJsonLayers = function () {
    if (
      App.Map.Layers &&
      typeof App.Map.Layers.addGeoJsonLayers === "function"
    ) {
      return App.Map.Layers.addGeoJsonLayers("myJson.geojson", "burg.geojson");
    }
  };

  // Add the other bridge methods from the instructions too
  this.createLayer = function (id) {
    if (App.Map.Layers && typeof App.Map.Layers.createLayer === "function") {
      return App.Map.Layers.createLayer(id);
    }
  };

  this.clearLayer = function (id) {
    if (App.Map.Layers && typeof App.Map.Layers.clearLayer === "function") {
      return App.Map.Layers.clearLayer(id);
    }
  };

  this.removeLayer = function (id) {
    if (App.Map.Layers && typeof App.Map.Layers.removeLayer === "function") {
      return App.Map.Layers.removeLayer(id);
    }
  };

  this.hideLayer = function (id) {
    if (App.Map.Layers && typeof App.Map.Layers.hideLayer === "function") {
      return App.Map.Layers.hideLayer(id);
    }
  };

  // Add this to your BridgeInterface constructor
  this.hideBackgroundLayers = function () {
    if (
      App.Map.Layers &&
      typeof App.Map.Layers.hideBackgroundLayers === "function"
    ) {
      return App.Map.Layers.hideBackgroundLayers();
    } else {
      console.error("App.Map.Layers.hideBackgroundLayers not available");
      return 0; // Return a default value
    }
  };

  // You'll probably need its counterpart as well
  this.showBackgroundLayers = function () {
    if (
      App.Map.Layers &&
      typeof App.Map.Layers.showBackgroundLayers === "function"
    ) {
      return App.Map.Layers.showBackgroundLayers();
    } else {
      console.error("App.Map.Layers.showBackgroundLayers not available");
      return 0; // Return a default value
    }
  };

  this.showLayer = function (id) {
    if (App.Map.Layers && typeof App.Map.Layers.showLayer === "function") {
      return App.Map.Layers.showLayer(id);
    }
  };

  // Set whether a layer should be drawable (visible) based on GeoObjectCategory settings
  this.setLayerDrawable = function (layerId, drawable) {
    console.log(`Bridge: setLayerDrawable called with layerId=${layerId}, drawable=${drawable}`);
    if (App.Map.Layers && typeof App.Map.Layers.setLayerDrawable === "function") {
      return App.Map.Layers.setLayerDrawable(layerId, drawable);
    } else {
      console.error("App.Map.Layers.setLayerDrawable not available");
    }
  };
  
  // Test function to verify bridge communication
  this.testLayerVisibility = function () {
    console.log("Bridge test function called!");
    if (window.interface && window.interface.callback) {
      window.interface.callback("layerVisibilityChanged", JSON.stringify({
        layerId: "test",
        visible: true,
        affectedFeatures: 0
      }));
      console.log("Sent test callback to Android");
    } else {
      console.error("Bridge callback not available");
    }
    return "Bridge communication working!";
  };

  // Set whether features in a layer can be selected by clicking
  this.setLayerSelectable = function (layerId, selectable) {
    if (App.Map.Layers && typeof App.Map.Layers.setLayerSelectable === "function") {
      return App.Map.Layers.setLayerSelectable(layerId, selectable);
    }
  };

  // Batch update layer visibility and selectability settings
  this.updateLayerSettings = function (layerSettingsJson) {
    if (App.Map.Layers && typeof App.Map.Layers.updateLayerSettings === "function") {
      return App.Map.Layers.updateLayerSettings(layerSettingsJson);
    }
  };

  this.toggleWmsLayer = function (layerConfig) {
    if (App.Map.Layers && typeof App.Map.Layers.toggleWmsLayer === "function") {
      return App.Map.Layers.toggleWmsLayer(layerConfig);
    }
  };

  if (App.Map.Basemap) {
    // Map methods for backward compatibility
    this.getActiveBackgroundLayer = function () {
      return App.Map.Basemap.getActiveBackgroundLayer();
    };

    this.setBasemap = function (selectedLayer) {
      App.Map.Basemap.setBasemap(selectedLayer);
    };
  }

  // Use coordinate handling module if available
  if (App.Map.Coordinates) {
    // Map methods for backward compatibility
    this.findNearestPointOnPolygon = function (
      polygonFeature,
      currentLocation
    ) {
      return App.Map.Coordinates.findNearestPointOnPolygon(
        polygonFeature,
        currentLocation
      );
    };
  }

  // Use utils module if available
  if (App.Utils) {
    this._calculateDistance = function (latlng1, latlng2) {
      return App.Utils.calculateDistance(latlng1, latlng2);
    };

    this.loadFile = function (filePath, callback) {
      App.Utils.loadFile(filePath, callback);
    };
  }

  if (App.UI.Controls) {
    // Add status band control
    var statusBand = App.UI.Controls.createStatusBandControl("Geo360 Project");
    this.map.addControl(statusBand, "top-left");
    
    // Store reference to status band control for bridge method access
    this.statusBandControl = statusBand;

    // Force additional fixes for status band
    const statusBandElement = document.getElementById("status-band");
    if (statusBandElement) {
      statusBandElement.style.position = "fixed";
      statusBandElement.style.top = "0";
      statusBandElement.style.left = "0";
      statusBandElement.style.transform = "none";
      statusBandElement.style.zIndex = "1001";
    }
  }

  // Store a reference to this instance for global access
  window.interface = this;
  
  // Create bridge object for MapLibre to communicate with Java
  // This implements the methods expected by the Java BridgeMapEventListener interface
  this.bridge = {
    onMapClicked: function(latLngPoint, viewPosition) {
      // Forward to reha (the JavaScript interface added in Java)
      if (typeof reha !== 'undefined' && reha.sendCallback) {
        reha.sendCallback('click', JSON.stringify({
          latlng: latLngPoint,
          point: viewPosition
        }));
      }
    },
    
    onObjectClicked: function(objectId) {
      // Forward to reha
      if (typeof reha !== 'undefined' && reha.sendCallback) {
        reha.sendCallback('objectclick', objectId);
      }
    },
    
    onMapLongClicked: function(latLng) {
      // Forward to reha
      if (typeof reha !== 'undefined' && reha.sendCallback) {
        reha.sendCallback('longclick', JSON.stringify(latLng));
      }
    }
  };

  console.log("BridgeInterface constructor called");
// Mark bridge as ready
  window._bridgeReady = true;
  window._bridgeReadyTime = new Date().toISOString();
  
  // Log ALL method calls for debugging
  window._bridgeCalls = [];
  const logCall = (method) => {
    const entry = { method, time: new Date().toISOString() };
    window._bridgeCalls.push(entry);
    console.log("[Bridge Call]", method);
  };
  
  // Wrap loadCategories to ensure we see it
  const originalLoadCategories = this.loadCategories;
  this.loadCategories = function(data) {
    logCall("loadCategories");
    console.log("[Bridge] loadCategories intercepted!");
    return originalLoadCategories.call(this, data);
  };

  console.log("BridgeInterface constructor called - interface ready at window.interface");

  //var cwmkey = "9G4F5b99xO28esL8tArIO2Bbp8sGhURW5qIieYTy";

  /* moved 
  this.map = new maplibregl.Map({
    container: domElementName,
    style: mapConfig.backgroundMaps["Basemap Standard"].style,
    //style: `https://maps.clockworkmicro.com/streets/v1/style?x-api-key=${cwmkey}`,
    //style:
    //  "https://basemaps.linz.govt.nz/v1/tiles/topographic/WebMercatorQuad/style/topographic.json?api=c01j9dwc438nq1f9kv8gkrg7gxr",
    //center: [4.222929599999969, 46.62632869999987],

    //center: [175.2673146, -37.79082],
    //style:
    //  "https://api.maptiler.com/maps/topo-v2/style.json?key=ldV32HV5eBdmgfE7vZJI",
    // Maptiler UK  "https://api.maptiler.com/maps/uk-openzoomstack-light/style.json?key=ldV32HV5eBdmgfE7vZJI",
    // OS "https://api.os.uk/maps/vector/v1/vts/resources/styles?srs=3857&key=dclksBdD441tZWuokDrxjRsw7Syr4nRS",
    //center: [-2.968, 54.425],
    zoom: 17,
    minZoom: 1,
    maxZoom: 28,
    pixelRatio: window.devicePixelRatio || 1,
    attributionControl: false,
    maxPitch: 85,
    sky: {
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
    },
  });
*/
  this.map.once("load", () => {
    // Wait one additional frame for rendering to fully initialize
    requestAnimationFrame(() => {
      console.log("Map is fully ready");
      if (
        window.interface &&
        typeof window.interface.setMapReady === "function"
      ) {
        window.interface.setMapReady();
      }
    });
  });

  //this.currentLocation = [14.222929599999969, 46.62632869999987]; // Starting location
  //{lat: 46.6262757,lng: 14.2228866}
  this.stepSize = 0.00001; // Small increment for slow movement (simulates walking)

  this.searchURL = "https://gis.ktn.gv.at/suche/kagis/search/all_wgs?";
  this.filterExtend = false;
  this.manualMode = false;

  if (App.Features.StakeOut) {
    App.Features.StakeOut.initialize(this.map);
  } else {
    console.error("App.Features.StakeOut module not loaded");
  }

  var sidebarWidth = 250; // Sidebar width when expanded
  var controlOffset = 0; // Default right offset for controls

  // Initialize StakeOut
  this.initializeStakeOut = function () {
    if (App.Features.StakeOut) {
      // Already initialized in constructor
      return App.Features.StakeOut;
    } else {
      console.error("App.Features.StakeOut module not loaded");
      return null;
    }
  };

  this.setRotationUpdateRate = function (rateInMs) {
    rotationUpdateRate = rateInMs;
  };

  // Function to add a marker to the map
  this.addMarker = (obj) => {
    // Implement marker addition logic based on the object coordinates
  };

  // Function to remove the marker from the map
  this.removeMarker = () => {
    // Implement marker removal logic
  };

  window.addEventListener(
    "resize",
    function () {
      setTimeout(() => {
        this.ensureMapIsVisible();
      }, 100);
    }.bind(this)
  );

  this.targetFeature = null; // Store the clicked target feature for stake-out

  this.highlightFromMVT = function (mvtObject) {
    // First remove any existing highlights
    console.log("Feature clicked: ", JSON.stringify(mvtObject, null, 2));

    this.removeHighlight();

    console.log("Adding highlight for feature", mvtObject);

    // Define unique layer IDs
    const casingLayerId = "highlight_casing";
    const highlightLayerId = "highlight_fill";

    // Check if the casing layer already exists, and remove it if it does
    if (this.map.getLayer(casingLayerId)) {
      this.map.removeLayer(casingLayerId);
    }

    // Check if the main highlight layer already exists, and remove it if it does
    if (this.map.getLayer(highlightLayerId)) {
      this.map.removeLayer(highlightLayerId);
    }

    // Log the feature's ID and geometry type to verify correct polygon identification
    console.log("Feature ID: ", mvtObject._vectorTileFeature.id);
    console.log("Feature Geometry Type: ", mvtObject._vectorTileFeature.type); // This should be 'Polygon'

    // Add the fill for polygon highlight
    this.map.addLayer({
      id: highlightLayerId,
      type: "fill", // Use 'fill' for polygons
      source: mvtObject.source,
      "source-layer": mvtObject.sourceLayer,
      filter: ["all", ["==", ["id"], mvtObject._vectorTileFeature.id]], // Use _vectorTileFeature.id
      paint: {
        "fill-color": "#00FF00", // Green fill for visibility
        "fill-opacity": 0.1, // 50% opacity for the polygon fill
      },
    });

    // Optionally, add a line casing around the polygon for emphasis
    this.map.addLayer({
      id: casingLayerId,
      type: "line",
      source: mvtObject.source,
      "source-layer": mvtObject.sourceLayer,
      filter: ["all", ["==", ["id"], mvtObject._vectorTileFeature.id]], // Use _vectorTileFeature.id
      paint: {
        "line-color": "#00FF00", // Blue casing around the polygon
        "line-width": 4,
        "line-opacity": 1.0, // Full opacity for the casing line
      },
    });
  };

  /**
   * Removes any existing highlight layers.
   */
  this.removeHighlight = function () {
    if (this.map.getLayer("highlight_casing")) {
      this.map.removeLayer("highlight_casing");
    }
    if (this.map.getLayer("highlight")) {
      this.map.removeLayer("highlight");
    }
  };

  /*
    // Add an event listener to handle map clicks
    this.map.on("click", function (e) {
      var coordinates = e.lngLat; // Get the clicked location coordinates

      // Position the radial menu where the user clicked on the map
      const xPos = e.point.x; // Get the x position of the click
      const yPos = e.point.y; // Get the y position of the click

      // Set the menu's position relative to the click
      //svgMenu.setPosition(xPos, yPos);
      // Set the menu's position relative to the click
      svgMenu.setPosition(xPos, yPos); // Dynamically set the position
      svgMenu.open(); // Trigger the open function directly
      // Open the radial menu at the clicked location
    });
    */

  this.ensureMapIsVisible = function () {
    console.log("Ensuring map visibility...");

    // Get the map container using the map object directly
    const mapContainer = this.map.getContainer();

    if (mapContainer) {
      // Set explicit dimensions if needed
      if (!mapContainer.style.height || mapContainer.offsetHeight === 0) {
        console.log("Setting explicit height on map container");
        mapContainer.style.height = "100vh";
      }

      // Force map resize
      console.log("Forcing map resize");
      this.map.resize();

      // Sometimes a second resize after a short delay helps
      setTimeout(() => {
        this.map.resize();
        console.log("Secondary map resize completed");
      }, 100);
    }
  };

  // Add the zoom control overlay to the map
  //this.map.addControl(new toggleZoomControls(), "bottom-right");

  // Reference to the map object for easy access in event listeners
  const map = this.map;

  let scaleControl = null; // Initially set to null to track scale control

  // Initialize Scale Control based on initial checkbox state
  const toggleScaleControl = document.getElementById("toggleScale");
  if (toggleScaleControl) {
    console.log("Scale toggle element found");

    // Check the initial state of the checkbox and add/remove control accordingly
    if (toggleScaleControl.checked) {
      scaleControl = new maplibregl.ScaleControl({
        maxWidth: 100,
        unit: "metric", // Initially set to metric
      });
      map.addControl(scaleControl, "bottom-left");
      console.log("Scale control added on initial load");
    }

    // Add event listener for toggling the scale control
    toggleScaleControl.addEventListener("change", (e) => {
      const isChecked = e.target.checked;
      console.log("Toggle Scale Control:", isChecked);
      if (isChecked) {
        if (!scaleControl) {
          scaleControl = new maplibregl.ScaleControl({
            maxWidth: 100,
            unit: "metric",
          });
        }
        map.addControl(scaleControl, "bottom-left");
        console.log("Scale control added");
      } else {
        if (scaleControl) {
          map.removeControl(scaleControl);
          scaleControl = null; // Set to null to avoid removing again
          console.log("Scale control removed");
        }
      }
    });
  } else {
    console.error("Scale toggle element not found");
  }

  // Toggle Metric/Imperial Units
  const toggleUnitsControl = document.getElementById("toggleUnits");
  if (toggleUnitsControl) {
    console.log("Units toggle element found");
    toggleUnitsControl.addEventListener("change", (e) => {
      const isMetric = e.target.checked;
      console.log("Toggle Units:", isMetric ? "Metric" : "Imperial");
      if (scaleControl) {
        scaleControl.setUnit(isMetric ? "metric" : "imperial");
        console.log(
          isMetric ? "Scale unit set to metric" : "Scale unit set to imperial"
        );
      }
    });
  } else {
    console.error("Units toggle element not found");
  }

  // Don't use on mobile device
  /*
    this.map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: false,
      })
    );
  */
  this.geoObjects = {}; // For layers and objects

  const geocoderApi = {
    forwardGeocode: async (config) => {
      const features = [];
      try {
        const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geojson=1&addressdetails=1`;
        const response = await fetch(request);
        const geojson = await response.json();
        for (const feature of geojson.features) {
          const center = [
            feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
            feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2,
          ];
          const point = {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: center,
            },
            place_name: feature.properties.display_name,
            properties: feature.properties,
            text: feature.properties.display_name,
            place_type: ["place"],
            center,
          };
          features.push(point);
        }
      } catch (e) {
        console.error(`Failed to forwardGeocode with error: ${e}`);
      }

      return {
        features,
      };
    },
  };

  /*
    this.map.addControl(
      new MaplibreGeocoder(geocoderApi, {
        maplibregl,
      }),
      "top-left"
    );
  */
  // Add controls
  //this.map.addControl(new maplibregl.NavigationControl(), "bottom-right");

  // No full screen for the mobile app
  //this.map.addControl(new maplibregl.FullscreenControl(), "top-right");

  // Variable to track the zoom control
  this.zoomControlAdded = true; // Default is true since controls are added by default
  // Store reference to the zoom control that will be created later
  this._zoomControl = null;

  // Then use CSS to target and style them differently
  // Add a class to each control for easier targeting
  document.querySelectorAll(".maplibregl-ctrl-group").forEach((control) => {
    if (control.querySelector(".maplibregl-ctrl-zoom-in")) {
      control.classList.add("zoom-only-control");
    } else if (control.querySelector(".maplibregl-ctrl-compass")) {
      control.classList.add("compass-only-control");
    }
  });

  let enable3D = false;

  // Function to initialize all map-related toggles using switches
  this.initializeMapToggles = function () {
    // Check if the map is already loaded
    if (this.map.loaded()) {
      console.log("Map already loaded, initializing toggles xxxx.");
      this.setupToggles(); // Call toggle setup directly
    } else {
      // Wait for the map's 'load' event
      this.map.on("load", () => {
        console.log("Map is loaded, initializing toggles xxxx.");
        this.setupToggles(); // Initialize toggles once the map is loaded
      });
    }
  };

  /**
   * Removes the zoom level indicator
   */
  this.removeZoomLevel = function () {
    const zoomIndicator = document.getElementById("zoom-level-indicator");
    if (zoomIndicator) {
      console.log("Removing zoom level indicator");
      zoomIndicator.remove();
    }

    // Remove event listeners (note: this would require storing the updateZoomDisplay reference)
    // this.map.off('zoom', updateZoomDisplay);
  };

  // Function to ensure proper layer ordering
  this.ensureProperLayerOrder = function () {
    const style = this.map.getStyle();
    if (!style || !style.layers) return;

    // 1. First, identify base/background layers (no need to move them)

    // 2. Then, identify GeoJSON layers and move them above base layers
    const geojsonLayerIds = style.layers
      .filter((layer) => {
        // Only include GeoJSON layers that aren't stakeout or location
        if (layer.id.includes("stakeout") || layer.id.includes("location")) {
          return false;
        }

        // Check if it's in featureLayers array
        if (this.featureLayers && this.featureLayers.includes(layer.id)) {
          return true;
        }

        // Check if it uses a GeoJSON source
        if (layer.source) {
          const source = style.sources[layer.source];
          return source && source.type === "geojson";
        }

        return false;
      })
      .map((layer) => layer.id);

    // 3. Finally, identify stakeout and location layers for top placement
    const navigationLayerIds = style.layers
      .filter(
        (layer) =>
          layer.id.includes("stakeout") ||
          layer.id.includes("location") ||
          layer.id.includes("position") ||
          layer.id.includes("marker") ||
          layer.id.includes("arrow") ||
          layer.id.includes("navigate")
      )
      .map((layer) => layer.id);

    // Move each GeoJSON layer above base layers
    geojsonLayerIds.forEach((layerId) => {
      if (this.map.getLayer(layerId)) {
        this.map.moveLayer(layerId);
      }
    });

    // Move each navigation layer to the very top
    navigationLayerIds.forEach((layerId) => {
      if (this.map.getLayer(layerId)) {
        this.map.moveLayer(layerId);
      }
    });

    console.log(
      `Ordered layers: ${geojsonLayerIds.length} GeoJSON layers in middle, ${navigationLayerIds.length} navigation layers on top`
    );
  };

  // Function to set up the toggle controls
  this.setupToggles = function () {
    // Map Rotation Toggle
    const rotationToggle = document.getElementById("toggleRotation");
    if (rotationToggle) {
      console.log("Rotation toggle element found");
      rotationToggle.addEventListener("change", (e) => {
        const isEnabled = e.target.checked;
        console.log("Toggle Rotation:", isEnabled);
        if (isEnabled) {
          this.map.dragRotate.enable();
          // disable map rotation using keyboard
          this.map.keyboard.enable();
          // disable map rotation using touch rotation gesture
          this.map.touchZoomRotate.enable();
          console.log("Rotation enabled");
        } else {
          this.map.dragRotate.disable();
          this.map.keyboard.disable();
          // disable map rotation using touch rotation gesture
          this.map.touchZoomRotate.disableRotation();
          console.log("Rotation disabled");
        }
      });
    } else {
      console.error("Rotation toggle element not found");
    }

    // Map Pitch Toggle
    const pitchToggle = document.getElementById("togglePitch");
    if (pitchToggle) {
      console.log("Pitch toggle element found");
      pitchToggle.addEventListener("change", (e) => {
        const isEnabled = e.target.checked;
        console.log("Toggle Pitch:", isEnabled);
        this.map.setPitch(isEnabled ? 45 : 0);
        console.log(isEnabled ? "Pitch set to 45" : "Pitch reset to 0");
      });
    } else {
      console.error("Pitch toggle element not found");
    }

    // Attach event listener to toggle background visibility
    const backgroundToggle = document.getElementById("toggleBackground");
    if (backgroundToggle) {
      console.log("Background toggle element found");
      backgroundToggle.addEventListener("change", (e) => {
        const isVisible = e.target.checked;
        console.log("Toggle Background:", isVisible);

        if (isVisible) {
          // Show background layers when the toggle is checked
          this.showBackgroundLayers();
        } else {
          // Hide background layers when the toggle is unchecked
          this.hideBackgroundLayers();
        }
      });
    } else {
      console.error("Background toggle element not found");
    }
    // Accuracy Circle Toggle
    const accuracyToggle = document.getElementById("toggleAccuracyCircle");
    if (accuracyToggle) {
      console.log("Accuracy circle toggle element found");
      accuracyToggle.addEventListener("change", (e) => {
        const isEnabled = e.target.checked;
        console.log("Toggle Accuracy Circle:", isEnabled);
        if (isEnabled) {
          if (!this.map.getLayer("accuracy-circle")) {
            this.map.addLayer({
              id: "accuracy-circle",
              type: "circle",
              source: {
                type: "geojson",
                data: {
                  type: "FeatureCollection",
                  features: [
                    {
                      type: "Feature",
                      geometry: {
                        type: "Point",
                        coordinates: [
                          this.map.getCenter().lng,
                          this.map.getCenter().lat,
                        ],
                      },
                    },
                  ],
                },
              },
              paint: {
                "circle-radius": 50,
                "circle-color": "rgba(0, 0, 255, 0.3)",
                "circle-stroke-width": 2,
                "circle-stroke-color": "#0000FF",
              },
            });
            console.log("Accuracy circle layer added");
          } else {
            this.map.setLayoutProperty(
              "accuracy-circle",
              "visibility",
              "visible"
            );
            console.log("Accuracy circle layer visibility set to visible");
          }
        } else {
          if (this.map.getLayer("accuracy-circle")) {
            this.map.setLayoutProperty("accuracy-circle", "visibility", "none");
            console.log("Accuracy circle layer visibility set to none");
          }
        }
      });
    } else {
      console.error("Accuracy circle toggle element not found");
    }
  };

  // Listen for sidebar toggle events (Assuming you have sidebar toggle function)
  window.interface = window.interface || {};
  window.interface.toggleSidebar = function (sidebarId) {
    const sidebar = document.getElementById(sidebarId);
    const isCollapsed = sidebar.classList.contains("collapsed");
    sidebar.classList.toggle("collapsed");

    // Update the controls' position based on sidebar state
    updateControlPositions(!isCollapsed);
  };

  // Add layers for GeoJSON data
  const geoJsonUrl = "myJson.geojson";
  const polygonGeoJsonUrl = "burg.geojson";

  function clickEventOverlay(e) {
    console.log(`Feature clicked on layer: ${e}`);
    if (e.features && e.features.length > 0) {
      console.log(`FXX`);
      const clickedFeature = e.features[0]; // Get the first clicked feature
      console.log(`Feature clicked on layer: ${clickedFeature.layer.id}`);
      map.flyTo({
        center: e.lngLat,
        speed: 0.2,
      });
      // Highlight or perform actions with the clicked feature
      this.highlightFromMVT(clickedFeature); // Assuming you want to highlight the feature
    }
  }

  // Function to start simulating the walking movement
  this.startWalkingSimulation = function () {
    setInterval(self.simulateWalking.bind(self), 1000); // Use self instead of this
  };

  // Add click events to the Kataster and Kataster BEV overlays
  function addClickEventToOverlayLayers() {
    // Assuming Kataster and Kataster BEV layers are already added to the map
    const overlayMaps = mapConfig.overlayMaps;

    // Check if popupLayers exist and add event listeners to each
    if (overlayMaps.Kataster.popupLayers) {
      overlayMaps.Kataster.popupLayers.forEach((layerConfig) => {
        map.off("click", layerConfig.layer, clickEventOverlay); // Remove existing click event
        map.on("click", layerConfig.layer, clickEventOverlay); // Add click event
      });
    }

    if (overlayMaps["Kataster BEV"].popupLayers) {
      overlayMaps["Kataster BEV"].popupLayers.forEach((layerConfig) => {
        map.off("click", layerConfig.layer, clickEventOverlay); // Remove existing click event
        map.on("click", layerConfig.layer, clickEventOverlay); // Add click event
      });
    }
  }

  /**
   * Sets a lock so the user can't move or zoom the map
   * @param {boolean} lock - whether to lock the map or not
   */
  this.setLock = function (lock) {
    if (lock) {
      this.locked = true;

      // Lock the map bounds to the current viewable area
      const currentBounds = this.map.getBounds();
      this.map.setMaxBounds(currentBounds);

      // Lock the zoom level to the current zoom
      const currentZoom = this.map.getZoom();
      this.map.setMaxZoom(currentZoom);
      this.map.setMinZoom(currentZoom);
    } else {
      this.locked = false;

      // Unlock the bounds, allowing free movement
      this.map.setMaxBounds(null);

      // Reset zoom restrictions, allowing zooming in and out
      this.map.setMaxZoom(null); // You can also specify a max zoom limit if needed
      this.map.setMinZoom(null); // You can also specify a min zoom limit if needed
    }
  };

  /**
   * Sets the minimal ZoomLevel (how far?)
   * @param {int} zoom - ZoomLevel
   */
  this.setMinZoom = function (zoom) {
    if (this.map) {
      // Check if the map instance exists
      this.map.setMinZoom(zoom);
    } else {
      console.error("Map instance not initialized.");
    }
  };

  /**
   * Sets the maximal ZoomLevel (how near?)
   * @param {int} zoom - zoomLevel
   */
  this.setMaxZoom = function (zoom) {
    if (this.map) {
      // Check if the map instance exists
      this.map.setMaxZoom(zoom);
    } else {
      console.error("Map instance not initialized.");
    }
  };

  /**
   * Toggle function for setLock
   */
  this.toggleLock = function () {
    this.setLock(!this.locked); // Invert the current lock state
  };

  /**
   * Toggle function for setScaleEnabled
   */
  this.toggleScaleEnabled = function () {
    this.setScaleEnabled(!this.scaleEnabled); // Invert the current scale state
  };

  /**
   * Sends a callback to check if the BridgeInterface was instantiated
   */
  this.probeStatus = function () {
    console.log("[probeStatus] Called at", new Date().toISOString());
    try {
      if (typeof reha !== 'undefined' && reha && typeof reha.sendCallback === 'function') {
        console.log("[probeStatus] Sending initiated callback");
        reha.sendCallback("initiated", "");
      } else {
        console.warn("[probeStatus] reha or reha.sendCallback not available, attempting delayed callback");
        // Try again after a short delay
        var attempts = 0;
        var maxAttempts = 5;
        var retryInterval = setInterval(function() {
          attempts++;
          if (typeof reha !== 'undefined' && reha && typeof reha.sendCallback === 'function') {
            console.log("[probeStatus] Sending initiated callback (delayed, attempt " + attempts + ")");
            reha.sendCallback("initiated", "");
            clearInterval(retryInterval);
          } else if (attempts >= maxAttempts) {
            console.error("[probeStatus] reha still not available after " + maxAttempts + " attempts");
            clearInterval(retryInterval);
          }
        }, 200);
      }
    } catch (e) {
      console.error("[probeStatus] Error during execution:", e);
    }
  };

  /*
            -- Debugger
        */

  this.startDebugger = function () {
    reha.setDebugMode(true);
    this.debugger = new Debugly();
  };

  this.stopDebugger = function () {
    reha.setDebugMode(false);
    this.debugger.end();
  };

  /*
  // Simplified optimized version of addFeature that only creates needed layers
  this.addFeature = function (layerId, objectid, geojson, style) {
    console.log(
      `Adding or updating feature to layer: ${layerId}, objectid: ${objectid}`
    );

    // Parse the GeoJSON if it's a string
    if (typeof geojson === "string") {
      try {
        geojson = JSON.parse(geojson);
      } catch (e) {
        console.error(`Error parsing GeoJSON: ${e.message}`);
        return;
      }
    }

    // Set up the source if it doesn't exist
    let source = this.map.getSource(layerId);
    if (!source) {
      console.log(`Source ${layerId} not found, creating it.`);
      this.map.addSource(layerId, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });
      source = this.map.getSource(layerId);
    }

    // Get the current data
    let data = source._data || {
      type: "FeatureCollection",
      features: [],
    };

    // Store features to add with the provided objectid
    const features = [];

    // Handle different types of input GeoJSON
    if (geojson.type === "FeatureCollection") {
      // Process all features in the collection
      geojson.features.forEach((feature, index) => {
        if (!feature.properties) {
          feature.properties = {};
        }
        feature.properties.objectid = objectid;
        feature.properties.styleId = objectid; // Use objectid as style identifier
        features.push(feature);
      });
    } else if (geojson.type === "GeometryCollection") {
      // Convert GeometryCollection to Features
      console.log("Converting GeometryCollection to Features");
      geojson.geometries.forEach((geometry, index) => {
        features.push({
          type: "Feature",
          geometry: geometry,
          properties: {
            objectid: objectid,
            styleId: objectid, // Use objectid as style identifier
          },
        });
      });
    } else if (geojson.type === "Feature") {
      // Single Feature
      if (!geojson.properties) {
        geojson.properties = {};
      }
      geojson.properties.objectid = objectid;
      geojson.properties.styleId = objectid; // Use objectid as style identifier
      features.push(geojson);
    } else {
      // Raw geometry
      features.push({
        type: "Feature",
        geometry: {
          type: geojson.type,
          coordinates: geojson.coordinates,
        },
        properties: {
          objectid: objectid,
          styleId: objectid, // Use objectid as style identifier
        },
      });
    }

    // Remove any existing features with this objectid
    data.features = data.features.filter(
      (feature) =>
        !(feature.properties && feature.properties.objectid === objectid)
    );

    // Add the new features
    data.features.push(...features);

    // Update the source data
    source.setData(data);

    // Track the styles by objectid
    if (!this.featureStyles) {
      this.featureStyles = new Map();
    }
    this.featureStyles.set(objectid, style);

    // Keep track of which geometry types exist for this layerId
    if (!this.layerGeometryTypes) {
      this.layerGeometryTypes = new Map();
    }

    // Determine geometry type of the features
    let hasPoint = false;
    let hasLine = false;
    let hasPolygon = false;

    features.forEach((feature) => {
      const geomType = feature.geometry.type;
      if (geomType === "Point" || geomType === "MultiPoint") {
        hasPoint = true;
      } else if (geomType === "LineString" || geomType === "MultiLineString") {
        hasLine = true;
      } else if (geomType === "Polygon" || geomType === "MultiPolygon") {
        hasPolygon = true;
      }
    });

    // Update the geometry types for this layer
    const existingTypes = this.layerGeometryTypes.get(layerId) || {
      point: false,
      line: false,
      polygon: false,
    };
    existingTypes.point = existingTypes.point || hasPoint;
    existingTypes.line = existingTypes.line || hasLine;
    existingTypes.polygon = existingTypes.polygon || hasPolygon;
    this.layerGeometryTypes.set(layerId, existingTypes);

    // Create or update only the needed style layers based on the geometry types
    this._ensureGeometryStyleLayers(layerId, existingTypes);

    console.log(
      `Successfully added/updated ${features.length} features in layer: ${layerId}`
    );
  };
*/
  // Helper method to create and style layers for a specific feature
  this._ensureStyleLayersForFeature = function (layerId, objectid, style) {
    // Create a unique ID for this feature's layers
    const pointLayerId = `${layerId}-point-${objectid}`;
    const lineLayerId = `${layerId}-line-${objectid}`;
    const polygonFillLayerId = `${layerId}-polygon-fill-${objectid}`;
    const polygonStrokeLayerId = `${layerId}-polygon-stroke-${objectid}`;

    // Remove any existing layers for this feature
    if (this.map.getLayer(pointLayerId)) this.map.removeLayer(pointLayerId);
    if (this.map.getLayer(lineLayerId)) this.map.removeLayer(lineLayerId);
    if (this.map.getLayer(polygonFillLayerId))
      this.map.removeLayer(polygonFillLayerId);
    if (this.map.getLayer(polygonStrokeLayerId))
      this.map.removeLayer(polygonStrokeLayerId);

    // Add layer for points
    this.map.addLayer({
      id: pointLayerId,
      type: "circle",
      source: layerId,
      filter: [
        "all",
        ["==", ["get", "objectid"], objectid],
        ["==", ["geometry-type"], "Point"],
      ],
      paint: {
        "circle-radius": (style && style.radius) || 6,
        "circle-color": (style && style["circle-color"]) || "#FFA500",
        "circle-stroke-color":
          (style && style["circle-stroke-color"]) || "#000000",
        "circle-stroke-width": (style && style["circle-stroke-width"]) || 2,
        "circle-opacity": (style && style.opacity) || 1,
      },
    });

    // Add layer for lines
    this.map.addLayer({
      id: lineLayerId,
      type: "line",
      source: layerId,
      filter: [
        "all",
        ["==", ["get", "objectid"], objectid],
        [
          "any",
          ["==", ["geometry-type"], "LineString"],
          ["==", ["geometry-type"], "MultiLineString"],
        ],
      ],
      paint: {
        "line-color": (style && style["line-color"]) || "#FFA500",
        "line-width": (style && style["line-width"]) || 2,
        "line-opacity": (style && style.opacity) || 1,
        "line-dasharray":
          style && style["line-dasharray"]
            ? style["line-dasharray"]
                .split(",")
                .map((v) => parseFloat(v.trim()))
            : null,
      },
    });

    // Add fill layer for polygons
    this.map.addLayer({
      id: polygonFillLayerId,
      type: "fill",
      source: layerId,
      filter: [
        "all",
        ["==", ["get", "objectid"], objectid],
        [
          "any",
          ["==", ["geometry-type"], "Polygon"],
          ["==", ["geometry-type"], "MultiPolygon"],
        ],
      ],
      paint: {
        "fill-color": (style && style["fill-color"]) || "#FFA500",
        "fill-opacity": (style && style.opacity) || 0.25,
      },
    });

    // Add stroke layer for polygons
    this.map.addLayer({
      id: polygonStrokeLayerId,
      type: "line",
      source: layerId,
      filter: [
        "all",
        ["==", ["get", "objectid"], objectid],
        [
          "any",
          ["==", ["geometry-type"], "Polygon"],
          ["==", ["geometry-type"], "MultiPolygon"],
        ],
      ],
      paint: {
        "line-color": (style && style["line-color"]) || "#000000",
        "line-width": (style && style["line-width"]) || 2,
        "line-opacity": (style && style.opacity) || 1,
      },
    });

    // Track these layers for proper ordering
    this.featureLayers.push(pointLayerId);
    this.featureLayers.push(lineLayerId);
    this.featureLayers.push(polygonFillLayerId);
    this.featureLayers.push(polygonStrokeLayerId);

    // Ensure layers are ordered correctly
    this.moveFeatureLayersToTop();
  };

  // Helper method to ensure style layers exist for each geometry type
  this._ensureStyleLayers = function (layerId, style) {
    // Check if we've already created style layers for this source
    if (this.featureLayers.includes(layerId)) {
      return; // Already set up
    }

    // Create layers for different geometry types (point, line, polygon)
    // Points layer
    this.map.addLayer({
      id: `${layerId}-points`,
      type: "circle",
      source: layerId,
      filter: ["==", ["geometry-type"], "Point"],
      paint: {
        "circle-radius": (style && style.radius) || 6,
        "circle-color": (style && style["circle-color"]) || "#FFA500",
        "circle-stroke-color":
          (style && style["circle-stroke-color"]) || "#000000",
        "circle-stroke-width": (style && style["circle-stroke-width"]) || 2,
      },
    });

    // Lines layer
    this.map.addLayer({
      id: `${layerId}-lines`,
      type: "line",
      source: layerId,
      filter: [
        "any",
        ["==", ["geometry-type"], "LineString"],
        ["==", ["geometry-type"], "MultiLineString"],
      ],
      paint: {
        "line-color": (style && style["line-color"]) || "#FFA500",
        "line-width": (style && style["line-width"]) || 2,
        "line-dasharray":
          style && style["line-dasharray"]
            ? style["line-dasharray"]
                .split(",")
                .map((v) => parseFloat(v.trim()))
            : null,
      },
    });

    // Polygons - fill
    this.map.addLayer({
      id: `${layerId}-polygons-fill`,
      type: "fill",
      source: layerId,
      filter: [
        "any",
        ["==", ["geometry-type"], "Polygon"],
        ["==", ["geometry-type"], "MultiPolygon"],
      ],
      paint: {
        "fill-color": (style && style["fill-color"]) || "#FFA500",
        "fill-opacity": (style && style.opacity) || 0.25,
      },
    });

    // Polygons - stroke
    this.map.addLayer({
      id: `${layerId}-polygons-stroke`,
      type: "line",
      source: layerId,
      filter: [
        "any",
        ["==", ["geometry-type"], "Polygon"],
        ["==", ["geometry-type"], "MultiPolygon"],
      ],
      paint: {
        "line-color": (style && style["line-color"]) || "#000000",
        "line-width": (style && style["line-width"]) || 2,
      },
    });

    // Track that we've created layers for this source
    this.featureLayers.push(layerId);
    this.featureLayers.push(`${layerId}-points`);
    this.featureLayers.push(`${layerId}-lines`);
    this.featureLayers.push(`${layerId}-polygons-fill`);
    this.featureLayers.push(`${layerId}-polygons-stroke`);
  };

  function clickEventOverlay(e, selectLayer) {
    if (e.features && e.features.length > 0) {
      const clickedFeature = e.features[0];

      console.log(`Layer: ${clickedFeature.layer}`);
      if (selectLayer && clickedFeature.layer.id === selectLayer) {
        console.log(`Feature clicked on layer: ${clickedFeature.layer.id}`);

        map.flyTo({
          center: e.lngLat,
          speed: 0.2,
        });

        // Make sure to remove the layer if it exists
        removeExistingHighlightLayer("highlight_casing");

        // Add the highlight feature
        this.highlightFromMVT(clickedFeature);
      } else {
        console.log("Clicked layer does not match the selectable layer.");
      }
    }
  }

  // Helper function to remove an existing highlight layer
  function removeExistingHighlightLayer(layerId) {
    if (map.getLayer(layerId)) {
      console.log(`Removing existing layer: ${layerId}`);
      map.removeLayer(layerId);
    }

    const sourceId = `${layerId}_source`; // Assuming source ID follows this pattern
    if (map.getSource(sourceId)) {
      console.log(`Removing existing source: ${sourceId}`);
      map.removeSource(sourceId);
    }
  }

  // Function to update the right sidebar with feature details
  function updateFeatureInfo(feature) {
    // Get the elements to update in the right sidebar
    console.log(`Feature clicked on layer: ${feature.layer.id}`);

    const featureTitle = document.getElementById("feature-title");
    const htmlText = document.getElementById("html-text");
    const coordinates = document.getElementById("coordinates");
    const geojsonData = document.getElementById("geojson-data");
    /*
      // Update with feature data
      featureTitle.textContent = feature.properties.title || "No title";
      htmlText.innerHTML =
        feature.properties.description || "No description available";

      const coords = feature.geometry.coordinates;
      coordinates.textContent = `Coordinates: (${coords[1]}, ${coords[0]})`; // Display as (latitude, longitude)

      // Pretty print the GeoJSON data
      geojsonData.textContent = JSON.stringify(feature, null, 2);
      */
  }

  function clickEventOverlay(e) {
    console.log(`Feature clicked overlay xxx`);
    if (e.features && e.features.length > 0) {
      const clickedFeature = e.features[0]; // Get the first clicked feature
      console.log(`Feature clicked on layer: ${clickedFeature.layer.id}`);

      // Update the right sidebar with the clicked feature's details
      updateFeatureInfo(clickedFeature);

      map.flyTo({
        center: e.lngLat,
        speed: 0.2,
      });

      this.highlightFromMVT(clickedFeature); // Highlight the clicked feature

      updateFeatureInfo(clickedFeature);
    }
  }

  /**
   * Adds an image layer to the map
   * @param {String} layerId - The ID of the layer
   * @param {String} objId - The ID of the object
   * @param {String} image - The URL or base64 string of the image
   * @param {Array} southWest - The [lng, lat] of the southwest corner
   * @param {Array} northEast - The [lng, lat] of the northeast corner
   */
  this.addImageLayer = function (layerId, objId, image, southWest, northEast) {
    this.map.addSource(`${layerId}-${objId}`, {
      type: "image",
      url: image,
      coordinates: [
        southWest,
        [northEast[0], southWest[1]],
        northEast,
        [southWest[0], northEast[1]],
      ],
    });

    this.map.addLayer({
      id: `${layerId}-${objId}`,
      source: `${layerId}-${objId}`,
      type: "raster",
    });
  };

  /**
   * Adds a WMS layer to the map
   * @param {String} id - The ID of the layer
   * @param {String} url - The URL of the WMS service
   * @param {String} layer - The name of the WMS layer
   * @param {String} format - The image format (e.g., "image/png")
   * @param {Number} maxZoom - The maximum zoom level
   */
  this.addWMSLayer = function (id, url, layer, format, maxZoom) {
    if (!this._isLayerExistant(id)) {
      this.createLayer(id);
    }

    // Add WMS source to the map
    this.map.addSource(id, {
      type: "raster",
      tiles: [
        `${url}?service=WMS&request=GetMap&layers=${layer}&styles=&format=${format}&transparent=true&version=1.1.1&width=256&height=256&bbox={bbox-epsg-3857}&srs=EPSG:3857`,
      ],
      tileSize: 256,
      maxzoom: maxZoom,
    });

    // Add the WMS layer to the map
    this.map.addLayer({
      id: id,
      type: "raster",
      source: id,
      paint: {},
    });

    this.geoObjects[id] = this.map.getLayer(id);
  };

  // First, add this debugging function to your BridgeInterface class
  this.debugWmsLayer = function (layerConfig) {
    const layerId = `${layerConfig.name}-layer`;
    const sourceId = `${layerConfig.name}-source`;

    console.log("Debugging WMS layer...");

    // Check if the layer exists
    if (this.map.getLayer(layerId)) {
      console.log(`Layer ${layerId} exists in the map`);
      const visibility = this.map.getLayoutProperty(layerId, "visibility");
      console.log(`Layer visibility: ${visibility}`);
    } else {
      console.log(`Layer ${layerId} does not exist in the map`);
    }

    // Check if the source exists
    if (this.map.getSource(sourceId)) {
      console.log(`Source ${sourceId} exists in the map`);
      // Get source data
      const source = this.map.getSource(sourceId);
      console.log("Source configuration:", source);
    } else {
      console.log(`Source ${sourceId} does not exist in the map`);
    }

    // Check map bounds to see if we're in a relevant area
    const bounds = this.map.getBounds();
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
  };

  this.activeBackgroundLayer = "Basemap Standard"; // Default active layer at initialization

  this.setBasemap = function (selectedLayer) {
    const selectedConfig = mapConfig.backgroundMaps[selectedLayer];

    if (!selectedConfig) {
      console.error(`Configuration for ${selectedLayer} not found.`);
      return;
    }

    // Remove any previous base layers
    if (this.map.getLayer("base-layer")) {
      this.map.removeLayer("base-layer");
      this.map.removeSource("base-layer");
    }

    // Google Maps basemaps or vector tile basemaps
    if (selectedConfig.style) {
      // Save reference to current GeoJSON and navigation layers before style change
      const currentStyle = this.map.getStyle();
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
          // Use the function from App.Map.Layers if available, otherwise define a fallback
          if (
            App.Map.Layers &&
            typeof App.Map.Layers.isUserAddedLayer === "function"
          ) {
            if (App.Map.Layers.isUserAddedLayer(layer.id)) {
              userLayers.push(JSON.parse(JSON.stringify(layer)));
            }
          } else {
            // Fallback implementation to check if it's a user-added layer
            // Check if the layer uses a GeoJSON source or other criteria
            if (
              layer.source &&
              currentStyle.sources[layer.source] &&
              currentStyle.sources[layer.source].type === "geojson"
            ) {
              userLayers.push(JSON.parse(JSON.stringify(layer)));
            }
          }
        });
      }

      // Set the new style
      this.map.setStyle(selectedConfig.style);

      // After style is loaded, restore user layers and ensure proper order
      this.map.once("style.load", () => {
        // First add back all GeoJSON sources
        Object.keys(userSources).forEach((sourceId) => {
          if (!this.map.getSource(sourceId)) {
            this.map.addSource(sourceId, userSources[sourceId]);
          }
        });

        // Then add back all user layers
        userLayers.forEach((layer) => {
          if (!this.map.getLayer(layer.id)) {
            this.map.addLayer(layer);
          }
        });

        // Attach click events and ensure proper layer ordering
        this.attachClickEventToOverlayLayers();
        this.ensureProperLayerOrder();

        console.log(
          `Restored ${userLayers.length} user layers after style change`
        );

        this.activeBackgroundLayer = selectedLayer;
      });
    } else if (selectedConfig.tiles) {
      // XYZ or WMTS basemaps - add as a new source/layer

      // Add the source and layer
      this.map.addSource("base-layer", {
        type: "raster",
        tiles: selectedConfig.tiles,
        tileSize: selectedConfig.tileSize || 256,
        maxzoom: selectedConfig.maxzoom || 19,
      });

      this.map.addLayer(
        {
          id: "base-layer",
          type: "raster",
          source: "base-layer",
          minzoom: selectedConfig.minzoom || 0,
          maxzoom: selectedConfig.maxzoom || 19,
        },
        this.getFirstNonBaseLayer()
      ); // Insert at bottom of the stack

      this.activeBackgroundLayer = selectedLayer;
      console.log(`Basemap switched to: ${selectedLayer}`);
    } else if (selectedConfig.type === "wms") {
      // Handle WMS basemaps
      this.map.addSource("base-layer", {
        type: "raster",
        tiles: [
          `${selectedConfig.url}?service=WMS&request=GetMap&layers=${selectedConfig.layers}&format=${selectedConfig.format}&transparent=true&width=256&height=256&crs=EPSG:3857&bbox={bbox-epsg-3857}`,
        ],
        tileSize: selectedConfig.tileSize || 256,
        maxzoom: selectedConfig.maxzoom || 19,
      });

      this.map.addLayer(
        {
          id: "base-layer",
          type: "raster",
          source: "base-layer",
          minzoom: 0,
          maxzoom: selectedConfig.maxzoom || 19,
        },
        this.getFirstNonBaseLayer()
      ); // Insert at bottom of the stack

      this.activeBackgroundLayer = selectedLayer;
      console.log(`Basemap switched to: ${selectedLayer}`);
    } else {
      console.error(`Basemap type for ${selectedLayer} not recognized.`);
    }
  };

  // Helper function to find the first non-base layer for insertion point
  this.getFirstNonBaseLayer = function () {
    const style = this.map.getStyle();
    if (!style || !style.layers) return undefined;

    // Find the first layer that is a user-added layer
    for (let i = 0; i < style.layers.length; i++) {
      if (this.isUserAddedLayer(style.layers[i].id)) {
        return style.layers[i].id;
      }
    }

    return undefined; // Will add to the top if no user layers found
  };

  /* Check if a layer was added by the user
   * @param {string} layerId - Layer ID to check
   * @returns {boolean} Whether the layer was user-added
   */
  this.isUserAddedLayer = function (layerId) {
    // Use App.Map.Layers implementation if available
    if (
      App.Map.Layers &&
      typeof App.Map.Layers.isUserAddedLayer === "function"
    ) {
      return App.Map.Layers.isUserAddedLayer(layerId);
    }

    // Fallback implementation
    // Check if the layer exists first
    const layer = this.map.getStyle().layers.find((l) => l.id === layerId);
    if (!layer) return false;

    // Check if it uses a GeoJSON source
    if (layer.source) {
      const source = this.map.getStyle().sources[layer.source];
      return source && source.type === "geojson";
    }

    return false;
  };

  /**
   * Moves all feature layers to the top of the layer stack
   */
  this.moveFeatureLayersToTop = function () {
    this.featureLayers.forEach((layerId) => {
      if (this.map.getLayer(layerId)) {
        this.map.moveLayer(layerId); // Move each layer to the top
      }
    });
  };

  // Ensure controls are only added once
  this._ensureControlsAdded = function () {
    if (this._useModularControls) {
      console.log("Skipping control initialization - using modular controls");
      return;
    }

    if (!this.navigationControlAdded) {
      this.map.addControl(new maplibregl.NavigationControl(), "top-left");
      this.navigationControlAdded = true;
    }

    if (!this.fullscreenControlAdded) {
      this.map.addControl(new maplibregl.FullscreenControl(), "top-right");
      this.fullscreenControlAdded = true;
    }

    if (!this.scaleControlAdded) {
      this.map.addControl(
        new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }),
        "bottom-left"
      );
      this.scaleControlAdded = true;
    }
  };

  // Add this to a script tag or a JS file loaded after your interface is initialized
  document.addEventListener("DOMContentLoaded", function () {
    // Initialize after Shoelace components are defined
    if (customElements.get("sl-switch")) {
      initScaleToggle();
    } else {
      customElements.whenDefined("sl-switch").then(initScaleToggle);
    }

    function initScaleToggle() {
      let scaleControl = null; // Track scale control instance
      const toggleScaleControl = document.getElementById("toggleScale");

      if (toggleScaleControl) {
        // Initial state
        if (toggleScaleControl.checked) {
          scaleControl = new maplibregl.ScaleControl({
            maxWidth: 100,
            unit: "metric",
          });
          interface.map.addControl(scaleControl, "bottom-left");
        }

        // Listen for Shoelace's custom event
        toggleScaleControl.addEventListener("sl-change", (e) => {
          const isChecked = e.target.checked;
          console.log("Toggle Scale Control:", isChecked);

          if (isChecked) {
            if (!scaleControl) {
              scaleControl = new maplibregl.ScaleControl({
                maxWidth: 100,
                unit: "metric",
              });
            }
            interface.map.addControl(scaleControl, "bottom-left");
          } else {
            if (scaleControl) {
              interface.map.removeControl(scaleControl);
              scaleControl = null;
            }
          }
        });
      }

      // Also update the units toggle
      const toggleUnitsControl = document.getElementById("toggleUnits");
      if (toggleUnitsControl) {
        toggleUnitsControl.addEventListener("sl-change", (e) => {
          const isMetric = e.target.checked;
          if (scaleControl) {
            scaleControl.setUnit(isMetric ? "metric" : "imperial");
          }
        });
      }
    }
  });

  
  // Add a global error handler for the map to suppress AbortError and related issues
  this.map.on("error", function (e) {
    // Suppress AbortError, which happens when tiles are aborted due to rapid zooming/moving
    if (e.error && e.error.name === "AbortError") {
      console.warn("Tile request aborted: ", e.error.message);
      // Optionally: log to server, alert the user, or handle in another way
    } else {
      // Log any other errors to the console
      console.error("Map error:", e.error);
    }
  });

  // Function to initialize the map settings controls
  function initMapSettingsSwitches() {
    console.log("Initializing map settings switches...");

    // Define the switches and their handlers
    const switches = [
      {
        id: "toggleRotation",
        handler: function (checked) {
          console.log("Map rotation toggled:", checked);
          if (window.interface && window.interface.map) {
            window.interface.map.dragRotate[checked ? "enable" : "disable"]();
          }
        },
      },
      {
        id: "toggleRotationDevice",
        handler: function (checked) {
          console.log("Device rotation toggled:", checked);
          if (window.interface) {
            window.interface.rotationWithCompass = checked;
          }
        },
      },
      {
        id: "togglePitch",
        handler: function (checked) {
          console.log("Map pitch toggled:", checked);
          if (window.interface && window.interface.map) {
            window.interface.map.touchPitch[checked ? "enable" : "disable"]();
          }
        },
      },
      {
        id: "toggleBackground",
        handler: function (checked) {
          console.log("Map background toggled:", checked);
          if (window.interface && window.interface.map) {
            // Update background layers visibility
            const layers = window.interface.map.getStyle().layers;
            layers.forEach((layer) => {
              if (layer.id.includes("background")) {
                window.interface.map.setLayoutProperty(
                  layer.id,
                  "visibility",
                  checked ? "visible" : "none"
                );
              }
            });
          }
        },
      },
      {
        id: "toggle3DBuildings",
        handler: function (checked) {
          console.log("3D buildings toggled:", checked);
          if (window.interface && window.interface.map) {
            // Toggle 3D building layers
            const layers = window.interface.map.getStyle().layers;
            layers.forEach((layer) => {
              if (layer.id.includes("building")) {
                window.interface.map.setLayoutProperty(
                  layer.id,
                  "visibility",
                  checked ? "visible" : "none"
                );
              }
            });
          }
        },
      },
      {
        id: "toggleAccuracyCircle",
        handler: function (checked) {
          console.log("Accuracy circle toggled:", checked);
          if (window.interface) {
            window.interface.showAccuracyCircle = checked;
            // Update visibility of accuracy circle if it exists
            if (window.interface.map) {
              try {
                window.interface.map.setLayoutProperty(
                  "accuracy-circle",
                  "visibility",
                  checked ? "visible" : "none"
                );
              } catch (e) {
                // Layer might not exist yet
              }
            }
          }
        },
      },
      {
        id: "toggleZoomControls",
        handler: function (checked) {
          console.log("Zoom controls toggled:", checked);
          // Use the App.Map.Controls module to manage zoom control
          if (App.Map.Controls && typeof App.Map.Controls.setZoomEnabled === "function") {
            App.Map.Controls.setZoomEnabled(checked);
          } else {
            console.error("App.Map.Controls.setZoomEnabled not available");
          }
        },
      },
      {
        id: "toggleScale",
        handler: function (checked) {
          console.log("Scale toggled:", checked);
          if (window.interface) {
            if (checked) {
              // Add scale if it doesn't exist
              if (!window.interface.scaleControl && window.interface.map) {
                window.interface.addScaleControl();
              }
            } else {
              // Remove scale if it exists
              if (window.interface.scaleControl) {
                window.interface.scaleControl.remove();
                window.interface.scaleControl = null;
              }
            }
          }
        },
      },
      {
        id: "toggleUnits",
        handler: function (checked) {
          console.log("Units toggled:", checked);
          // Set metric vs imperial units
          if (window.interface && window.interface.scaleControl) {
            window.interface.scaleControl.setUnit(
              checked ? "metric" : "imperial"
            );
          }
        },
      },
    ];

    // Set up event handlers for each switch
    switches.forEach((switchConfig) => {
      const switchElement = document.getElementById(switchConfig.id);
      if (switchElement) {
        // Add event listener
        switchElement.addEventListener("sl-change", (e) => {
          console.log(`${switchConfig.id} changed:`, e.target.checked);

          // Call the handler function
          switchConfig.handler(e.target.checked);

          // Dispatch a native change event for compatibility with existing code
          const nativeEvent = new Event("change", { bubbles: true });
          Object.defineProperty(nativeEvent, "target", {
            value: { checked: e.target.checked },
            enumerable: true,
          });
          switchElement.dispatchEvent(nativeEvent);
        });

        console.log(`Event handler set up for ${switchConfig.id}`);
      } else {
        console.warn(`Switch element not found: ${switchConfig.id}`);
      }
    });

    // Handle the slider
    const slider = document.getElementById("backgroundTransparency");
    if (slider) {
      slider.addEventListener("sl-change", (e) => {
        console.log("Background transparency changed:", e.target.value);

        // Update background transparency
        if (window.interface && window.interface.map) {
          const opacity = e.target.value / 100;
          const layers = window.interface.map.getStyle().layers;
          layers.forEach((layer) => {
            if (layer.id.includes("background")) {
              window.interface.map.setPaintProperty(
                layer.id,
                "background-opacity",
                opacity
              );
            }
          });
        }

        // Dispatch a native input event for compatibility
        const nativeEvent = new Event("input", { bubbles: true });
        Object.defineProperty(nativeEvent, "target", {
          value: { value: e.target.value },
          enumerable: true,
        });
        slider.dispatchEvent(nativeEvent);
      });

      console.log("Event handler set up for backgroundTransparency slider");
    } else {
      console.warn("Slider element not found: backgroundTransparency");
    }
  }

  // Initialize when the document is ready and Shoelace components are defined
  document.addEventListener("DOMContentLoaded", function () {
    // Check if Shoelace components are already defined
    if (customElements.get("sl-switch")) {
      initMapSettingsSwitches();
    } else {
      // Wait for Shoelace components to be defined
      customElements.whenDefined("sl-switch").then(() => {
        initMapSettingsSwitches();
      });

      // Add a fallback timeout in case the whenDefined promise doesn't resolve
      setTimeout(() => {
        if (!customElements.get("sl-switch")) {
          console.warn(
            "Shoelace components not defined after timeout, trying to initialize anyway"
          );
          initMapSettingsSwitches();
        }
      }, 2000);
    }
    
    // Get reference to existing zoom control after a delay
    setTimeout(() => {
      if (window.interface && window.interface.map) {
        // Find the zoom control that was already added
        const controls = document.querySelectorAll('.maplibregl-ctrl-group');
        controls.forEach(control => {
          if (control.querySelector('.maplibregl-ctrl-zoom-in') && 
              !control.querySelector('.maplibregl-ctrl-compass')) {
            // This is the zoom-only control
            window.interface._zoomControl = control._control || control;
            console.log("Found existing zoom control");
          }
        });
      }
    }, 1000);
  });

  // Make function available globally for debugging
  window.reinitMapSettings = initMapSettingsSwitches;

  // Function to simulate walking movement with directional bias
  this.simulateWalking = function () {
    var lng = self.currentLocation[0];
    var lat = self.currentLocation[1];

    // Introduce a bias to walk more often in one direction
    // The biasWeight controls the likelihood to move in the positive direction
    var biasWeightLng = 0.8; // 70% chance to move east (positive longitude)
    var biasWeightLat = 0.8; // 70% chance to move north (positive latitude)

    // Use biased random movement
    var randomDirectionLng = Math.random() < biasWeightLng ? 0.1 : -0.1;
    var randomDirectionLat = Math.random() < biasWeightLat ? 0.1 : -0.1;

    // Apply the movement based on the step size
    lng += randomDirectionLng * self.stepSize; // Increment longitude
    lat += randomDirectionLat * self.stepSize; // Increment latitude

    // Update the current location
    self.currentLocation = [lng, lat];

    // Update the map with the new GPS location
    self.setPosition([lng, lat]);
  };

  this.setCenter = function (position) {
    this.map.panTo(position);
  };

  this.setCenterAndZoom = function (position, zoom) {
    this.map.setCenter(position);
    this.map.setZoom(zoom);
  };

  /**
   * Returns the current zoom level
   * @returns {number} - zoom level
   */
  this.getZoom = function () {
    const zoomLevel = this.map.getZoom();
    reha.send(zoomLevel);
    return zoomLevel;
  };

  /**
   * Finds nearest Object and returns its id
   * @param {String} layerId - The ID of the layer to search
   * @param {Object} latlng - The [longitude, latitude] position to compare against
   * @returns {String} - Object id of the closest feature
   */
  this.findNearest = function (layerId, latlng) {
    var layerSource = this.map.getSource(layerId);
    if (!layerSource) {
      console.error(`Layer ${layerId} not found.`);
      return reha.send("null");
    }

    var geojsonData = layerSource._data; // GeoJSON data of the layer
    if (!geojsonData || !geojsonData.features.length) {
      console.error(`Layer ${layerId} has no features.`);
      return reha.send("null");
    }

    var nearestFeature = null;
    var minDistance = Infinity;

    // Loop through all features in the layer to find the closest one
    geojsonData.features.forEach((feature) => {
      if (feature.geometry.type === "Point") {
        var featureCoords = feature.geometry.coordinates;
        var distance = this._calculateDistance(latlng, featureCoords);

        if (distance < minDistance) {
          minDistance = distance;
          nearestFeature = feature;
        }
      }
    });

    if (nearestFeature && nearestFeature.geometry.id !== undefined) {
      return reha.send(nearestFeature.geometry.id);
    } else {
      return reha.send("null");
    }
  };

  /*
        -- Misc
    */
  this.removeMapLayer = function (layerId) {
    if (this.map.getLayer(layerId)) {
      // Remove the layer if it exists
      this.map.removeLayer(layerId);
      console.log(`Layer ${layerId} removed.`);
    }

    if (this.map.getSource(layerId)) {
      // Remove the source if it exists (since MapLibre uses sources and layers separately)
      this.map.removeSource(layerId);
      console.log(`Source ${layerId} removed.`);
    }
  };

  /**
   * Zooms one step in (+1)
   */
  this.zoomIn = function () {
    this.map.setZoom(this.map.getZoom() + 1);
  };

  /**
   * Gets the most northEast and southWest visible points on the current map
   * @returns {Object} - serialized bounds with northeast and southwest coordinates
   */
  this.getBounds = function () {
    var bounds = this.map.getBounds(); // Get the current bounds

    // Return bounds in a serialized format
    return {
      northEast: bounds.getNorthEast().toArray(), // [longitude, latitude]
      southWest: bounds.getSouthWest().toArray(), // [longitude, latitude]
    };
  };

  /**
   * Returns the center point of the current view
   * @returns {Array} - center point as [longitude, latitude]
   */
  this.getCenter = function () {
    var center = this.map.getCenter(); // Get the center as a LngLat object
    return center.toArray(); // Convert to [longitude, latitude] array
  };

  /**
   * Zooms one step out (-1)
   */
  this.zoomOut = function () {
    this.map.setZoom(this.map.getZoom() - 1);
  };

  // Throttling for removeObjectFromLayer
  var _removeObjectThrottle = {};
  
  // Get remove object interval from performance config
  function getRemoveObjectInterval() {
    return App.Core.PerformanceConfig ? 
      App.Core.PerformanceConfig.get('layers.removeObjectInterval') : 100;
  }
  
  /**
   * Removes object with specified id from a specified GeoJSON layer (source)
   * @param {String} layerId - the id of the layer (source)
   * @param {String} objId - the id of the object to remove
   */
  this.removeObjectFromLayer = function (layerId, objId) {
    // Check if this is a temporary layer that needs throttling
    var isTempLayer = layerId && (layerId.includes('tmpLayer') || layerId.includes('temporary'));
    
    if (isTempLayer) {
      var now = Date.now();
      var throttleKey = layerId + '_' + objId;
      
      // Check throttle
      var interval = getRemoveObjectInterval();
      if (_removeObjectThrottle[throttleKey] && 
          now - _removeObjectThrottle[throttleKey] < interval) {
        if (App.Core.PerformanceConfig && App.Core.PerformanceConfig.get('debug.logThrottledUpdates')) {
          console.log(`Skipping removeObjectFromLayer - throttled (${interval}ms):`, layerId, objId);
        }
        return;
      }
      
      _removeObjectThrottle[throttleKey] = now;
    }
    
    // Only log non-throttled calls
    if (!isTempLayer || (App.Core.PerformanceConfig && App.Core.PerformanceConfig.get('debug.logThrottledUpdates'))) {
      console.log("removeObjectFromLayer called with layerId:", layerId, "objId:", objId);
    }
    
    // Special handling for MYPOSID marker (manual placement marker)
    if (objId === "MYPOSID") {
      console.log("Removing MYPOSID marker, disabling position marker");
      if (App.Map.Navigation) {
        App.Map.Navigation.setPositionEnabled(false);
      }
      return;
    }

    var source = this.map.getSource(layerId);
    if (!source) return;

    // Only log detailed removal for non-temporary layers
    if (!isTempLayer) {
      console.log(`Removing object: ${objId} from layer: ${layerId}`);
    }
    var geojsonData = source._data;
    var filteredFeatures = geojsonData.features.filter(function (feature) {
      return feature.id !== objId;
    });
    source.setData({
      type: "FeatureCollection",
      features: filteredFeatures,
    });
  };

  // Toggle 3D terrain
  this.toggle3D = function () {
    console.log("enable3D:" + enable3D);
    enable3D = !enable3D;
    if (enable3D) {
      // Add terrain if not already added
      this.addTerrain();
      
      this.map.setSky({
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
      setTimeout(() => {
        if (this.map.getPitch() === 0) {
          this.map.flyTo({
            center: this.map.getCenter(),
            zoom: this.map.getZoom(),
            pitch: 45, // Adjust the pitch angle here
          });
        }
      }, 400);
    } else {
      console.log("disable 3D");
      this.map.flyTo({
        center: this.map.getCenter(),
        zoom: this.map.getZoom(),
        pitch: 0, // Adjust the pitch angle here
      });
      this.map.setTerrain(null);
    }
  };

 this.addTerrain = async function () {
  try {
    // Add MapTiler terrain source
    if (!this.map.getSource("terrainSource")) {
      this.map.addSource("terrainSource", {
        type: "raster-dem",
        url: "https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=ldV32HV5eBdmgfE7vZJI",
        tileSize: 256
      });
      console.log("MapTiler terrain source added");
      
      // Enable the terrain with exaggeration
      this.map.setTerrain({ source: "terrainSource", exaggeration: 1.0 });
    }
  } catch (error) {
    console.error("Failed to add terrain source:", error);
  }
};

  document
    .getElementById("toggle3DBuildings")
    .addEventListener("change", (e) => {
      if (e.target.checked) {
        // When the checkbox is checked, show the 3D buildings
        console.log("Toggling 3D buildings ON");
        this.toggle3DBuildings(); // Call the function to toggle 3D buildings visibility
      } else {
        // When the checkbox is unchecked, hide the 3D buildings
        console.log("Toggling 3D buildings OFF");
        this.toggle3DBuildings(); // Call the function again to toggle 3D buildings off
      }
    });

  // Assuming mapConfig is already defined and loaded
  // Add reset basemap button listener
  const resetBasemapBtn = document.getElementById("resetBasemapToDefault");
  if (resetBasemapBtn) {
    resetBasemapBtn.addEventListener("click", () => {
      console.log("Resetting basemap to default");
      if (App.Map.Basemap && typeof App.Map.Basemap.resetToDefault === "function") {
        App.Map.Basemap.resetToDefault("Global2");
      } else if (this.setBasemap && typeof this.setBasemap === "function") {
        // Fallback to bridge interface method
        this.setBasemap("Global2");
      }
    });
  }

  document
    .getElementById("backgroundTransparency")
    .addEventListener("input", (e) => {
      const opacityValue = e.target.value / 100; // Convert slider value (0-100) to opacity (0.0-1.0)

      // Get the active background layer
      const activeBackgroundLayerId = getActiveBackgroundLayer.call(this);

      // Loop through all layers to adjust the opacity for the entire background
      const allLayers = this.map.getStyle().layers;

      if (allLayers && allLayers.length > 0) {
        allLayers.forEach((layer) => {
          if (
            layer.type === "raster" &&
            this.map.getLayer(layer.id) &&
            layer.id === activeBackgroundLayerId
          ) {
            // Adjust raster layer opacity
            this.map.setPaintProperty(layer.id, "raster-opacity", opacityValue);
            console.log(`Set raster-opacity for layer: ${layer.id}`);
          } else if (
            (layer.type === "fill" ||
              layer.type === "line" ||
              layer.type === "symbol") &&
            this.map.getLayer(layer.id)
          ) {
            // Adjust vector layer opacity
            const opacityProp =
              layer.type === "fill"
                ? "fill-opacity"
                : layer.type === "line"
                ? "line-opacity"
                : "icon-opacity"; // For symbol layers, adjust icon opacity

            this.map.setPaintProperty(layer.id, opacityProp, opacityValue);
            console.log(`Set ${opacityProp} for layer: ${layer.id}`);
          }
        });
      } else {
        console.warn(`No layers found or no active background.`);
      }
    });

  // Example function to set and switch between background layers dynamically
  function setBackgroundLayer(layerId) {
    // Set the active background layer
    this.activeBackgroundLayerId = layerId;

    // Remove the existing background layer if any
    map.getStyle().layers.forEach((layer) => {
      if (layer.type === "raster" || layer.type === "background") {
        map.removeLayer(layer.id);
      }
    });

    // Add the new background layer based on the provided ID
    const backgroundLayer = mapConfig.backgroundMaps[layerId];
    if (backgroundLayer) {
      map.addLayer({
        id: layerId,
        type: "raster",
        source: {
          type: "raster",
          tiles: backgroundLayer.tiles || [],
          tileSize: backgroundLayer.tileSize || 256,
        },
        paint: {
          "raster-opacity": 1, // Default to fully opaque
        },
      });
    }
  }

  // Function to return the currently active background layer (this may vary based on your implementation)
  function getActiveBackgroundLayer() {
    // Return the currently active background layer from the map instance
    return this.activeBackgroundLayer || null;
  }

  this.toggle3DBuildings = function () {
    // Loop through all layers on the map
    this.map.getStyle().layers.forEach((layer) => {
      // Check if the layer is a 'fill-extrusion' type (which represents 3D buildings)
      if (layer.type === "fill-extrusion") {
        // Get the current visibility of the layer
        const visibility = this.map.getLayoutProperty(layer.id, "visibility");

        // Toggle the visibility between 'visible' and 'none'
        if (visibility === "visible") {
          this.map.setLayoutProperty(layer.id, "visibility", "none");
          console.log(`3D buildings layer '${layer.id}' is now hidden.`);
        } else {
          this.map.setLayoutProperty(layer.id, "visibility", "visible");
          console.log(`3D buildings layer '${layer.id}' is now visible.`);
        }
      }
    });
  };

  // Optional: Helper function to check if any overlay layers are currently visible
  this.hasVisibleOverlays = function () {
    return Object.keys(this.overlayLayers).length > 0;
  };

  function isAndroidApp() {
    // Check if we are in a WebView by checking the user agent or a custom flag
    return (
      /Android/.test(navigator.userAgent) && /wv/.test(navigator.userAgent)
    );
  }

  this.attachLongClickEvent = function (layerId) {
    // Make sure the layer exists and is visible before attaching the long click event
    if (this.map.getLayer(layerId)) {
      console.log(`Attaching long click event for layer: ${layerId}`);

      this.map.on("contextmenu", layerId, function (e) {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          console.log("Feature long clicked: ", feature);
          this.highlightFromMVT(feature); // Highlight the long-clicked feature
        }
      });
    } else {
      console.warn(`Layer ${layerId} not found or not visible.`);
    }
  };

  this.moveOverlayLayersToTop = function () {
    const overlayLayerIds = Object.keys(mapConfig.overlayMaps).map(
      (name) => `${name}-layer`
    );
    overlayLayerIds.forEach((layerId) => {
      if (this.map.getLayer(layerId)) {
        this.map.moveLayer(layerId);
      }
    });
  };

  this.moveFeatureLayersToTop = function () {
    this.featureLayers.forEach((layerId) => {
      if (this.map.getLayer(layerId)) {
        this.map.moveLayer(layerId);
      }
    });
  };
  /*
  this.attachClickEvent = function (layerId) {
    // Make sure the layer exists and is visible before attaching the click event
    if (this.map.getLayer(layerId)) {
      console.log(
        `AttachClickEvent : Attaching click event for layer: ${layerId}`
      );

      this.map.on("click", layerId, (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];

          // Manually create GeoJSON from the MVT feature
          const geoJsonFeature = {
            type: "Feature",
            geometry: feature.geometry, // This might need additional conversion depending on the feature geometry format
            properties: feature.properties,
            id: feature.id || feature._vectorTileFeature.id, // Use the id if available, or _vectorTileFeature.id
          };
          console.log("GeoJSON of selected feature: ", geoJsonFeature);

          // Store this feature as the target
          this.targetFeature = geoJsonFeature;
          window.objectInfoBridge = new ObjectInfoBridge();
          window.objectInfoBridge.displayFeature(features[0], true);
          console.log("OverlayFeature clicked (attachClickEvent): ", feature);
          // Update the right sidebar with the clicked feature's details
          updateFeatureInfo(feature);

          this.map.flyTo({
            center: e.lngLat,
            speed: 0.2,
          });

          this.highlightFromMVT(feature); // Highlight the clicked feature
        }
      });
    } else {
      console.warn(`Layer ${layerId} not found or not visible.`);
    }
  };
*/
  this.applyOverlayStyle = function (styleUrl, spriteUrl = null) {
    fetch(styleUrl)
      .then((response) => response.json())
      .then((styleData) => {
        this.map.setStyle({
          ...this.map.getStyle(),
          layers: [...this.map.getStyle().layers, ...styleData.layers],
          sources: {
            ...this.map.getStyle().sources,
            ...styleData.sources,
          },
          sprite: spriteUrl || this.map.getStyle().sprite,
        });

        // Ensure layers are set to interactive
        styleData.layers.forEach((layer) => {
          if (this.map.getLayer(layer.id)) {
            this.map.setLayoutProperty(layer.id, "visibility", "visible");
            this.attachClickEvent(layer.id); // Attach long click event to the layer
          }
        });
      });
  };

  this.toggleSidebar = function (id) {
    const leftDrawerIds = ["left1", "left2", "left3", "left4"];
    const rightDrawerIds = ["right1", "right2"];

    const clickedDrawer = document.getElementById(id + "-drawer");

    if (clickedDrawer) {
      // Mobile-specific optimizations
      const isMobile = window.innerWidth <= 768;
      
      // If the clicked drawer is already open, close it
      if (clickedDrawer.open) {
        clickedDrawer.hide();
        
        // Mobile-specific: Restore body scroll if needed
        if (isMobile) {
          document.body.style.overflow = '';
        }
      } else {
        // Close all other drawers on the same side
        if (leftDrawerIds.includes(id)) {
          leftDrawerIds.forEach((drawerId) => {
            const drawer = document.getElementById(drawerId + "-drawer");
            if (drawer && drawer.open) {
              drawer.hide();
            }
          });
        } else if (rightDrawerIds.includes(id)) {
          rightDrawerIds.forEach((drawerId) => {
            const drawer = document.getElementById(drawerId + "-drawer");
            if (drawer && drawer.open) {
              drawer.hide();
            }
          });
        }

        // Mobile-specific: Prevent background scroll when drawer opens
        if (isMobile) {
          document.body.style.overflow = 'hidden';
        }

        // Open the clicked drawer
        clickedDrawer.show();
        
        // Mobile-specific: Add event listener for better UX
        if (isMobile) {
          this._addMobileDrawerListeners(clickedDrawer);
        }
      }

      // Update map padding after drawer state changes
      // Use shorter timeout on mobile for better responsiveness
      setTimeout(() => {
        this.updateMapPadding();
      }, isMobile ? 150 : 300);
    }
  };

  // Mobile-specific drawer enhancement function
  this._addMobileDrawerListeners = function(drawer) {
    if (!drawer) return;
    
    // Add touch listeners for better mobile interaction
    const panel = drawer.shadowRoot?.querySelector('[part="panel"]');
    if (panel) {
      let startY = 0;
      let currentY = 0;
      let isDragging = false;
      
      // Touch start handler
      const handleTouchStart = (e) => {
        startY = e.touches[0].clientY;
        isDragging = false;
      };
      
      // Touch move handler for drag-to-close
      const handleTouchMove = (e) => {
        if (!startY) return;
        
        currentY = e.touches[0].clientY;
        const diffY = currentY - startY;
        
        // Only allow downward drag to close
        if (diffY > 50 && !isDragging) {
          isDragging = true;
          drawer.hide();
          document.body.style.overflow = '';
        }
      };
      
      // Clean up on touch end
      const handleTouchEnd = () => {
        startY = 0;
        currentY = 0;
        isDragging = false;
      };
      
      // Add event listeners with passive option for better performance
      panel.addEventListener('touchstart', handleTouchStart, { passive: true });
      panel.addEventListener('touchmove', handleTouchMove, { passive: true });
      panel.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      // Store listeners for cleanup
      panel._mobileListeners = {
        touchstart: handleTouchStart,
        touchmove: handleTouchMove,
        touchend: handleTouchEnd
      };
    }
  };
  // ADD this new function for padding updates:
  this.updateMapPadding = function () {
    const leftDrawer = document.querySelector(
      'sl-drawer[placement="start"][open]'
    );
    const rightDrawer = document.querySelector(
      'sl-drawer[placement="end"][open]'
    );

    const padding = {
      left: leftDrawer ? 300 : 0,
      right: rightDrawer ? 400 : 0,
    };

    this.map.easeTo({
      padding: padding,
      duration: 1000,
    });
  };
  
  // Bridge method to update project name from Java
  this.updateProjectName = function (projectName) {
    // Update the status band control if it exists
    if (this.statusBandControl && this.statusBandControl.updateProjectName) {
      this.statusBandControl.updateProjectName(projectName);
    }
    
    // Also update the DOM element directly as a fallback
    const projectNameElement = document.getElementById("project-name");
    if (projectNameElement) {
      projectNameElement.textContent = projectName;
    }
  };

  // Expose updateProjectName method to window.bridge for Java access
  if (!window.bridge) {
    window.bridge = {};
  }
  window.bridge.updateProjectName = (projectName) => {
    this.updateProjectName(projectName);
  };
  
  // Bridge method to update language preference from Java
  this.setLanguage = function (languageCode) {
    console.log('Setting language to:', languageCode);
    
    // Update the i18n manager if it exists
    if (window.App && window.App.I18n && typeof window.App.I18n.setLanguage === 'function') {
      window.App.I18n.setLanguage(languageCode).then(() => {
        console.log('Language successfully changed to:', languageCode);
      }).catch((error) => {
        console.error('Error changing language:', error);
      });
    } else {
      console.warn('I18n manager not available');
    }
  };
  
  // Expose setLanguage method to window.bridge for Java access
  window.bridge.setLanguage = (languageCode) => {
    this.setLanguage(languageCode);
  };

  // Final working implementation for basemap controls using Shoelace
  function createBasemapControls2() {
    // Get the container
    const basemapControlsContainer =
      document.getElementById("basemap-controls");
    if (!basemapControlsContainer) {
      console.error("Basemap controls container not found");
      return;
    }

    // Clear existing content
    basemapControlsContainer.innerHTML = "";

    // Create the currently selected indicator
    const selectedIndicator = document.createElement("div");
    selectedIndicator.id = "selected-basemap";
    selectedIndicator.className = "selected-basemap";

    // Find default map to display in indicator
    const defaultMapKey = "Basemap Standard";
    const defaultMap =
      mapConfig.backgroundMaps[defaultMapKey] ||
      Object.values(mapConfig.backgroundMaps)[0];
    selectedIndicator.textContent = defaultMap ? defaultMap.label : "Standard";

    basemapControlsContainer.appendChild(selectedIndicator);

    // Divider
    const divider = document.createElement("hr");
    divider.className = "basemap-divider";
    basemapControlsContainer.appendChild(divider);

    // Simple version: Create radio buttons just like the original
    Object.keys(mapConfig.backgroundMaps).forEach((key) => {
      const mapOption = mapConfig.backgroundMaps[key];
      const isChecked = key === defaultMapKey; // Default selection

      // Create Shoelace radio button
      const radio = document.createElement("sl-radio");
      radio.value = key;
      radio.checked = isChecked;
      radio.name = "basemap";
      radio.className = "basemap-radio";

      // Set the label text with optional flag (larger flag)
      radio.innerHTML = `<span style="font-size: 18px; margin-right: 8px;">${
        mapOption.flag || ""
      }</span> ${mapOption.label}`;

      // Append to container
      basemapControlsContainer.appendChild(radio);
    });

    // Important: Now add event listeners exactly like the original code
    // First wait for Shoelace to be ready
    setTimeout(() => {
      // Select all radio buttons
      document.querySelectorAll('sl-radio[name="basemap"]').forEach((radio) => {
        // Add the change event listener
        radio.addEventListener("sl-change", (event) => {
          if (event.target.checked) {
            // This is the key part - call setBasemap with the value
            if (
              window.interface &&
              typeof window.interface.setBasemap === "function"
            ) {
              window.interface.setBasemap(event.target.value);

              // Also update the selected indicator
              const selectedMap = mapConfig.backgroundMaps[event.target.value];
              if (selectedMap) {
                selectedIndicator.textContent = selectedMap.label;
              }
            } else {
              console.error("window.interface.setBasemap function not found");
            }
          }
        });
      });

      console.log("Event listeners added to basemap radio buttons");
    }, 200);

    // Add styles directly to make sure they are applied
    const style = document.createElement("style");
    style.textContent = `
    #basemap-controls {
      display: flex;
      flex-direction: column;
      gap: 5px;
      width: calc(100% - 40px); /* Account for container padding */
      padding: 1px;
      font-family: 'Roboto', sans-serif;
    }
    
    .selected-basemap {
      font-weight: bold;
      font-size: 16px;
      color: #4682b4;
      padding: 8px 12px;
      margin-bottom: 8px;
      background-color: rgba(70, 130, 180, 0.1);
      border-radius: 4px;
      border-left: 3px solid #4682b4;
    }
    
    .basemap-divider {
      border: none;
      height: 1px;
      background-color: #e0e0e0;
      margin: 4px 0 8px 0;
      width: 100%;
    }
    
    .basemap-radio {
      margin-bottom: 4px;
      --sl-input-border-color: #ddd;
      --sl-input-border-color-hover: #4682b4;
      font-size: 16px; /* Larger font size */
    }
    
    .basemap-radio::part(base) {
      background-color: #f8f8f8;
      border-radius: 4px;
      padding: 12px 20px; /* More padding left/right */
      transition: all 0.2s ease;
      margin: 0 10px; /* Additional margin on left/right sides */
    }
    
    .basemap-radio::part(base):hover {
      background-color: #f0f0f0;
    }
    
    .basemap-radio[checked]::part(base) {
      background-color: rgba(70, 130, 180, 0.1);
      border-left: 3px solid #4682b4;
    }
    
    .basemap-radio::part(control) {
      --sl-color-primary-600: #4682b4;
    }
  `;
    document.head.appendChild(style);
  }

  // Initialize basemap controls
  document.addEventListener("DOMContentLoaded", function () {
    // Small delay to ensure Shoelace components are defined
    customElements.whenDefined("sl-radio").then(() => {
      console.log("Initializing basemap controls with Shoelace radios");
      window.createBasemapControls = initializeBasemapSelector;
      //createBasemapControls();
    });

    // Fallback if Shoelace is not available after 1 second
    setTimeout(() => {
      if (!customElements.get("sl-radio")) {
        console.warn(
          "Shoelace radio not defined, using fallback implementation"
        );
        //createFallbackBasemapControls();
      }
    }, 1000);
  });

  document.addEventListener("DOMContentLoaded", function () {
    const drawers = document.querySelectorAll("sl-drawer");

    drawers.forEach((drawer) => {
      drawer.addEventListener("sl-after-show", () => {
        if (window.interface) {
          window.interface.updateMapPadding();
        }
      });

      drawer.addEventListener("sl-after-hide", () => {
        if (window.interface) {
          window.interface.updateMapPadding();
        }
      });
    });
  });

  // Fallback implementation with standard HTML
  function createFallbackBasemapControls() {
    const basemapControlsContainer =
      document.getElementById("basemap-controls");
    if (!basemapControlsContainer) return;

    basemapControlsContainer.innerHTML = "";

    // Create the selected indicator
    const selectedIndicator = document.createElement("div");
    selectedIndicator.id = "selected-basemap";
    selectedIndicator.className = "selected-basemap";

    // Find default map
    const defaultMapKey = "Basemap Standard";
    const defaultMap =
      mapConfig.backgroundMaps[defaultMapKey] ||
      Object.values(mapConfig.backgroundMaps)[0];
    selectedIndicator.textContent = defaultMap ? defaultMap.label : "Standard";

    basemapControlsContainer.appendChild(selectedIndicator);

    // Divider
    const divider = document.createElement("hr");
    divider.className = "basemap-divider";
    basemapControlsContainer.appendChild(divider);

    // Create standard radio buttons
    Object.keys(mapConfig.backgroundMaps).forEach((key) => {
      const mapOption = mapConfig.backgroundMaps[key];
      const isChecked = key === defaultMapKey; // Default selection

      // Create label and radio input elements
      const label = document.createElement("label");
      label.className = "basemap-label";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "basemap";
      input.value = key;
      input.checked = isChecked;
      input.className = "basemap-radio-native";

      // Set label text with optional flag (larger flag)
      label.appendChild(input);

      const flagSpan = document.createElement("span");
      flagSpan.style.fontSize = "18px";
      flagSpan.style.marginRight = "8px";
      flagSpan.textContent = mapOption.flag || "";
      label.appendChild(flagSpan);

      const textNode = document.createTextNode(` ${mapOption.label}`);
      label.appendChild(textNode);

      // Append label to the container
      basemapControlsContainer.appendChild(label);
    });

    // Add event listeners like in the original code
    document.querySelectorAll('input[name="basemap"]').forEach((radio) => {
      radio.addEventListener("change", (event) => {
        if (
          event.target.checked &&
          window.interface &&
          typeof window.interface.setBasemap === "function"
        ) {
          window.interface.setBasemap(event.target.value);

          // Update indicator
          const selectedMap = mapConfig.backgroundMaps[event.target.value];
          if (selectedMap) {
            selectedIndicator.textContent = selectedMap.label;
          }
        }
      });
    });

    // Add the fallback styles
    const style = document.createElement("style");
    style.textContent = `
    #basemap-controls {
      display: flex;
      flex-direction: column;
      gap: 5px;
      width: 100%;
      font-family: 'Roboto', sans-serif;
    }
    
    .selected-basemap {
      font-weight: bold;
      font-size: 16px;
      color: #4682b4;
      padding: 8px 12px;
      margin-bottom: 4px;
      background-color: rgba(70, 130, 180, 0.1);
      border-radius: 4px;
      border-left: 5px solid #4682b4;
    }
    
    .basemap-divider {
      border: none;
      height: 1px;
      background-color: #e0e0e0;
      margin: 4px 0 8px 0;
      width: 100%;
    }
    
    .basemap-label {
      display: block;
      padding: 12px 20px; /* More padding left/right */
      margin: 0 10px 8px 10px; /* Additional margin on left/right sides */
      border-radius: 4px;
      background-color: #f8f8f8;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 16px; /* Larger font size */
    }
    
    .basemap-label:hover {
      background-color: #f0f0f0;
    }
    
    input.basemap-radio-native:checked + span {
      font-weight: bold;
    }
    
    .basemap-label:has(input:checked) {
      background-color: rgba(70, 130, 180, 0.1);
      border-left: 3px solid #4682b4;
    }
  `;
    document.head.appendChild(style);
  }
/*
  // Export for manual testing
  window.reinitBasemaps = {
    shoelace: createBasemapControls,
    fallback: createFallbackBasemapControls,
  };*/
  
  // Initialize MapLibre events
  this._initEvents = function () {
    if (this._useModularEvents) {
      console.log("Skipping event initialization - using modular events");
      return;
    }

    const basemapControlsContainer =
      document.getElementById("basemap-controls");

    // Only proceed if the container exists
    if (!basemapControlsContainer) {
      console.log("basemap-controls container not found, skipping basemap radio button generation");
      return;
    }

    // Dynamically generate radio buttons for basemap controls
    Object.keys(mapConfig.backgroundMaps).forEach((key) => {
      const mapOption = mapConfig.backgroundMaps[key];
      const isChecked = key === "Basemap Standard"; // Default selection

      // Create label and radio input elements
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "basemap";
      input.value = key;
      input.checked = isChecked;
      label.appendChild(input);

      // Set label text with optional flag
      label.appendChild(
        document.createTextNode(` ${mapOption.flag || ""} ${mapOption.label}`)
      );

      // Append label to the container
      basemapControlsContainer.appendChild(label);
    });

    // Bind event listener to dynamically created basemap radio buttons
    document.querySelectorAll('input[name="basemap"]').forEach((radio) => {
      radio.addEventListener("change", (event) => {
        this.setBasemap(event.target.value);
      });
    });

    // Other event listeners within _initEvents
    this.map.on("contextmenu", (e) => {
      console.log("Map long-click detected", e.lngLat);
      reha.sendCallback(
        "longclick",
        BiHelper.toJson(BiHelper.serializeLatLng(e.lngLat))
      );
    });

    // Add overlay toggle event listeners
    document.getElementById("toggleKataster").addEventListener("click", () => {
      const isActive = this.toggleOverlayLayer(mapConfig.overlayMaps.Kataster);
      const button = document.getElementById("toggleKataster");
      button.setAttribute("variant", isActive ? "primary" : "outline");
    });

    document
      .getElementById("toggleInspireWMS")
      .addEventListener("click", () => {
        const isActive = this.toggleWmsLayer(mapConfig.overlayMaps["Inspire WMS"]);
        const button = document.getElementById("toggleInspireWMS");
        button.setAttribute("variant", isActive ? "primary" : "outline");
      });

    document.getElementById("exploreBEVWMS").addEventListener("click", () => {
      this.exploreWmsLayers("https://data.bev.gv.at/geoserver/BEVdataKAT/wms");
    });

    document.getElementById("NZParcels").addEventListener("click", () => {
      const isActive = this.toggleOverlayLayer(mapConfig.overlayMaps.NZParcels);
      const button = document.getElementById("NZParcels");
      button.setAttribute("variant", isActive ? "primary" : "outline");
    });

    document.getElementById("toggleBEVDKMGST").addEventListener("click", () => {
      const isActive = this.toggleWmsLayer(mapConfig.overlayMaps["BEV DKM GST"]);
      const button = document.getElementById("toggleBEVDKMGST");
      button.setAttribute("variant", isActive ? "primary" : "outline");
    });

    document
      .getElementById("toggleKatasterBEV")
      .addEventListener("click", () => {
        const isActive = this.toggleOverlayLayer(mapConfig.overlayMaps["Kataster BEV"]);
        const button = document.getElementById("toggleKatasterBEV");
        button.setAttribute("variant", isActive ? "primary" : "outline");
      });

    document
      .getElementById("toggleNSWBaseMap")
      .addEventListener("click", () => {
        const isActive = this.toggleOverlayLayer(mapConfig.overlayMaps["NSW BaseMap Overlay"]);
        const button = document.getElementById("toggleNSWBaseMap");
        button.setAttribute("variant", isActive ? "primary" : "outline");
      });

    document
      .getElementById("toggleDkmBevSymbole")
      .addEventListener("click", () => {
        const isActive = this.toggleOverlayLayer(mapConfig.overlayMaps.dkm_bev_symbole);
        const button = document.getElementById("toggleDkmBevSymbole");
        button.setAttribute("variant", isActive ? "primary" : "outline");
      });

    document.getElementById("toggleFLAWI").addEventListener("click", () => {
      const isActive = this.toggleOverlayLayer(mapConfig.overlayMaps.flawi);
      const button = document.getElementById("toggleFLAWI");
      button.setAttribute("variant", isActive ? "primary" : "outline");
    });

    document.getElementById("toggleGEFAHR").addEventListener("click", () => {
      const isActive = this.toggleOverlayLayer(mapConfig.overlayMaps.gefahr);
      const button = document.getElementById("toggleGEFAHR");
      button.setAttribute("variant", isActive ? "primary" : "outline");
    });


    // Load and zoom to GeoJSON layers
    document.getElementById("zoomToGeoJson").addEventListener("click", () => {
      fetch(geoJsonUrl)
        .then((response) => response.json())
        .then((data) => this.zoomToBounds(data));
      fetch(polygonGeoJsonUrl)
        .then((response) => response.json())
        .then((data) => this.zoomToBounds(data));
    });

    // Ensure FeatureSelector is initialized for highlighting
    if (App.UI && App.UI.FeatureSelector && App.UI.FeatureSelector.initialize) {
      console.log("Initializing FeatureSelector with map for highlighting");
      App.UI.FeatureSelector.initialize(this.map);
    }
    
    // Direct click handler - temporary fix to ensure clicks work
    this.map.on("click", (e) => {
      // Check if basemap selection is enabled
      const basemapSelectionEnabled = App.UI.DynamicButton && 
                                     App.UI.DynamicButton.getBasemapSelectionState && 
                                     App.UI.DynamicButton.getBasemapSelectionState();
      
      let features;
      if (basemapSelectionEnabled) {
        // Include all features
        features = this.map.queryRenderedFeatures(e.point);
      } else {
        // Filter to only GeoJSON features
        const allFeatures = this.map.queryRenderedFeatures(e.point);
        features = allFeatures.filter(function(feature) {
          if (feature.layer && feature.layer.source) {
            const source = self.map.getSource(feature.layer.source);
            return source && source.type === 'geojson';
          }
          return false;
        });
      }
      
      if (features && features.length > 0) {
        // Features found
        console.log(`Found ${features.length} features`);
        
        // Helper function to check if a string is a valid UUID
        function isValidUUID(str) {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          return uuidRegex.test(str);
        }
        
        // Find the first feature with a valid UUID
        let selectedFeature = null;
        let objectId = null;
        
        for (const feature of features) {
          const id = feature.properties?.objectid || feature.properties?.id;
          if (id && isValidUUID(id)) {
            selectedFeature = feature;
            objectId = id;
            break;
          }
        }
        
        // Select the feature (highlight it on the map)
        const featureToSelect = selectedFeature || features[0];
        
        // Highlight the feature
        if (App.UI.FeatureSelector && App.UI.FeatureSelector.highlightFeature) {
          App.UI.FeatureSelector.highlightFeature(featureToSelect, true); // true = clear previous
        }
        
        // Store selected feature in state for stakeout
        if (App.Core && App.Core.State) {
          App.Core.State.set("map.lastSelectedFeature", featureToSelect);
          App.Core.State.set("map.selectedFeatures", [featureToSelect]);
        }
        
        // Trigger feature selected event
        if (App.Core && App.Core.Events) {
          App.Core.Events.trigger("feature.selected", {
            feature: featureToSelect,
            layer: featureToSelect.layer?.id,
            lngLat: e.lngLat,
            point: e.point,
          });
        }
        
        if (objectId) {
          // Valid GeoObject with UUID
          console.log("GeoObject clicked, sending objectclick:", objectId);
          reha.sendCallback('objectclick', objectId);
        } else {
          // Basemap feature or feature without valid UUID
          console.log("Basemap feature clicked, displaying in JavaScript only");
          
          // Open right sidebar first
          const rightDrawer = document.getElementById("right1-drawer");
          if (rightDrawer) {
            rightDrawer.show();
          }
          
          // Display feature info directly in JavaScript
          setTimeout(() => {
            if (window.ensureObjectInfoReady) {
              window.ensureObjectInfoReady((objectInfo) => {
                try {
                  objectInfo.setFeature(featureToSelect);
                  console.log("Displayed basemap feature in object-info component");
                } catch (error) {
                  console.error("Error displaying feature:", error);
                }
              });
            } else if (window.objectInfoBridge) {
              window.objectInfoBridge.displayFeature(featureToSelect, true);
            }
          }, 150);
        }
      } else {
        // Background click - clear selection
        console.log("Map click detected on background", e.lngLat);
        
        // Clear any existing selection
        if (App.UI.FeatureSelector && App.UI.FeatureSelector.removeHighlight) {
          App.UI.FeatureSelector.removeHighlight();
        }
        
        // Clear state
        if (App.Core && App.Core.State) {
          App.Core.State.set("map.lastSelectedFeature", null);
          App.Core.State.set("map.selectedFeatures", []);
        }
        
        // Close the feature info sidebar
        const rightDrawer = document.getElementById("right1-drawer");
        if (rightDrawer) {
          rightDrawer.hide();
        }
        
        reha.sendCallback(
          "click",
          BiHelper.toJson(BiHelper.serializeLatLngAndPoint(e.lngLat, e.point))
        );
      }
    });

    // Movement-related events
    this.map.on("movestart", (e) => {
      try {
        reha.sendCallback(
          "move",
          BiHelper.toJson(BiHelper.serializeBounds(e.target.getBounds()))
        );
      } catch (error) {
        console.error("Error serializing bounds:", error);
      }
    });

    this.map.on("zoomend", (e) => {
      try {
        const zoomLevel = e.target.getZoom();
        console.log("Zoom level detected:", zoomLevel);
        reha.sendCallback("zoom", BiHelper.toJson(zoomLevel));
      } catch (error) {
        console.error("Error in zoomend event:", error);
      }
    });

    // Throttled moveend event
    let lastMoveEndCall = 0;
    this.map.on("moveend", (e) => {
      const now = Date.now();
      if (now - lastMoveEndCall > 500) {
        try {
          const serializedBounds = BiHelper.serializeBounds(
            e.target.getBounds()
          );
          console.log("Serialized bounds:", JSON.stringify(serializedBounds));
          reha.sendCallback("moveend", BiHelper.toJson(serializedBounds));
        } catch (error) {
          console.error("Error sending callback:", error);
        }
        lastMoveEndCall = now;
      }
    });
  };

  this.navigateToNearestPointOnPolygon = function (
    polygonFeature,
    currentLocation
  ) {
    if (!App.Features.StakeOut) {
      console.error("App.Features.StakeOut module not loaded");
      return;
    }

    // Use StakeOut's navigation function
    const nearestCoords = App.Features.StakeOut.navigateToNearestPointOnPolygon(
      polygonFeature,
      currentLocation
    );

    // Display directional arrows
    if (nearestCoords) {
      // Extract current location coordinates
      let lng, lat;
      if (Array.isArray(currentLocation) && currentLocation.length === 2) {
        [lng, lat] = currentLocation;
      } else if (
        currentLocation &&
        currentLocation.lng != null &&
        currentLocation.lat != null
      ) {
        lng = currentLocation.lng;
        lat = currentLocation.lat;
      }

      App.Features.StakeOut.displayDirectionalArrows([lng, lat], nearestCoords);
    }

    // Store the target feature for future updates
    this.targetFeature = polygonFeature;
  };

  // Initial render on load
  onMapChange();

  function hexToRgba(hex, alpha) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r / 255, g / 255, b / 255, alpha];
  }

  function displayLabels(map, centerCoords, circles) {
    circles.forEach((circle) => {
      const pixelRadius = calculatePixelRadius(
        circle.radius,
        map.getZoom(),
        centerCoords.lat
      );

      // Code to render the label (pseudo-code, as it depends on your specific map label API)
      map.addLabel({
        position: [
          centerCoords.lng + pixelRadius / 100000, // Adjust position based on pixelRadius
          centerCoords.lat,
        ],
        text: circle.label,
        color: circle.color,
      });
    });
  }

  // Attach the function to the map’s render event for dynamic updating
  function onMapChange() {
    const centerCoords = map.getCenter();
  }

  map.on("moveend", onMapChange);
  map.on("zoomend", onMapChange);

  // Initial render on load
  onMapChange();

  function calculatePixelRadius(meterRadius, zoomLevel, latitude) {
    const metersPerPixel =
      (156543.03392 * Math.cos((latitude * Math.PI) / 180)) /
      Math.pow(2, zoomLevel);
    return meterRadius / metersPerPixel;
  }

  /**
   * Checks for nearest point and marks it
   * @param e - Event
   * @private
   */
  this._updateSelection = function (e) {
    //todo: refactor global vars
    //        if (interface.inSelectionMode) {
    //            var layer = interface.geoObjects[interface.selectedLayer];
    //            var closest = L.GeometryUtil.closestLayer(interface.map,[layer],interface.map.getCenter());
    //            var id = closest.layer.feature.geometry.id;
    //
    //            interface.lastSelectedObject = id;
    //            interface.lastSelectedObjectMarker.setLatLng(closest.latlng);
    //            interface.centerMarker.setLatLng(interface.map.getCenter());
    //        }
  };

  // Initialize events and load map layers
  this._initEvents();

  this.addGeoJsonLayers();

  // Update controls' position when the sidebar is toggled
  function updateControlPositions() {
    const right1Sidebar = document.getElementById("right1");
    const right2Sidebar = document.getElementById("right2");

    // Calculate the width of visible sidebars
    const right1Width =
      right1Sidebar && !right1Sidebar.classList.contains("collapsed")
        ? right1Sidebar.offsetWidth
        : 0;
    const right2Width =
      right2Sidebar && !right2Sidebar.classList.contains("collapsed")
        ? right2Sidebar.offsetWidth
        : 0;

    // Combined width of all visible right sidebars
    const totalRightSidebarWidth = right1Width + right2Width;

    // Calculate the new right position for controls
    const rightPosition = totalRightSidebarWidth + controlOffset;

    console.log(`Calculated right position: ${rightPosition}px`);

    // Move both the zoom control and the G360StakeButtonControl
    document
      .querySelectorAll(
        ".zoom-level-control, .maplibregl-ctrl-group, #G360StakeButtonControl"
      )
      .forEach((control) => {
        if (control) {
          control.style.right = `${rightPosition}px`; // Dynamically set the right position
          console.log(
            `Control ${
              control.className || control.id
            } moved to right: ${rightPosition}px`
          );
        } else {
          console.error("Control element not found");
        }
      });
  }

  function observeSidebar(sidebarId) {
    console.log(`observeSidebar ID ${sidebarId}`);
    const sidebar = document.getElementById(sidebarId);
    if (!sidebar) {
      console.log(`Sidebar with ID ${sidebarId} not found`); // Debug log
      return;
    }

    console.log(`Observing sidebar: ${sidebarId}`); // Debug log

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isCollapsed = sidebar.classList.contains("collapsed");
          console.log(`Sidebar ${sidebarId} collapsed: ${isCollapsed}`); // Debug log
          updateControlPositions(); // Recalculate control positions when a sidebar is toggled
        }
      });
    });

    observer.observe(sidebar, {
      attributes: true,
    });
  }

  // Ensure DOM is fully loaded before observing sidebars
  document.addEventListener("DOMContentLoaded", function () {
    observeSidebar("right2-drawer");
    observeSidebar("right1-drawer");

    // Initialize the controls' position when the page loads
    const right2Sidebar = document.getElementById("right2-drawer");
    const isRight2Collapsed =
      right2Sidebar && right2Sidebar.classList.contains("collapsed");
    updateControlPositions(isRight2Collapsed);
  });

  let throttleTimeout;
  const throttleMoveZoomEvents = () => {
    if (throttleTimeout) return; // Skip if throttle timeout exists

    throttleTimeout = setTimeout(() => {
      // Call your map update logic here, for example:
      //drawCircles(); // Redraw the circles or update layers
      clearTimeout(throttleTimeout); // Clear the timeout after update
      throttleTimeout = null; // Reset the throttle
    }, 100); // Adjust the timeout duration as needed (e.g., 100ms)
  };

  // Throttle both move and zoom events
  this.map.on("move", throttleMoveZoomEvents);
  this.map.on("zoom", throttleMoveZoomEvents);

  this.map.on("style.load", () => {
    // Set projection first, then add terrain
    this.map.setProjection({
      type: "globe", // Set projection to globe
    });
    // Don't add terrain automatically - let user toggle it
    // this.addTerrain();
  });

  this.map.on("load", () => {
    this.addGeoJsonLayers();
    // Attach click event listeners to the overlay layers
    console.log("Map loaded, calling initializeMapToggles.");
    this.initializeMapToggles();
    console.log("Map loaded, calling initializeMapToggles done.");
    // Example: Center the map on the image's coordinates
    //this.map.setCenter([14.222929599999969, 46.62632869999987]);

    //this.map.setZoom(18); // Adjust zoom as needed

    console.log("Initializing UI bridges...");

    // IMPORTANT: Initialize App.Map.Events first
    if (App.Map && App.Map.Events) {
      console.log("🚀 Initializing App.Map.Events");
      App.Map.Events.initialize(this.map);

      console.log("✅ App.Map.Events initialized");
    } else {
      console.error("❌ App.Map.Events not available");
    }

    // Initialize status footer if it exists in the DOM
    if (document.getElementById("status-footer")) {
      window.statusFooterBridge = new StatusFooterBridge();
      console.log("Status footer bridge initialized");
    }

    // Initialize object info bridge if it exists in the DOM
    if (document.getElementById("right1-drawer")) {
      window.objectInfoBridge = new ObjectInfoBridge();
      console.log("Object info bridge initialized");
    }

    // Initialize Context Menu
    if (App.UI && App.UI.ContextMenu) {
      console.log("Initializing Context Menu...");
      App.UI.ContextMenu.initialize(this.map, {
        events: App.Core.Events,
      });

      App.Core.Events.on("contextMenu.itemClicked", function (data) {
        console.log("Menu item clicked:", data);

        // Handle specific actions if needed
        if (data.id === "select-feature") {
          console.log("Select feature clickedFeature");
        }
      });

      // Disable feature menu - we want direct object selection
      // This allows clicks to go directly to object selection and fire events to Android
      App.UI.ContextMenu.enableFeatureMenu(false);

      console.log("Context Menu initialized");
    }

    // Initialize Radial Menu
    if (App.UI && App.UI.RadialMenu) {
      console.log("Initializing Radial Menu...");

      // Store a reference to the map
      const map = this.map;

      // Initialize the RadialMenu with the map and events
      App.UI.RadialMenu.initialize(map, {
        events: App.Core.Events,
      });

      // Set up context menu (right-click) handler for the map
      map.on("contextmenu", function (e) {
        e.preventDefault();

        // Open the radial menu at the cursor position
        App.UI.RadialMenu.openMenu({
          x: e.point.x,
          y: e.point.y,
        });
      });

      // Set up Shift+click handler for feature selection
      map.on("click", function (e) {
        if (e.originalEvent.shiftKey) {
          const features = map.queryRenderedFeatures(e.point);

          // Check if a feature was clicked
          if (features.length > 0) {
            // Find the first valid feature with geometry
            const feature = features.find((f) => f.geometry);

            if (feature) {
              // Prevent the default click behavior
              e.preventDefault();
              e.stopPropagation();

              // Convert to GeoJSON if needed
              const featureJson = feature.toJSON ? feature.toJSON() : feature;

              // Open feature-specific menu at cursor position
              App.UI.RadialMenu.openMenu({
                x: e.point.x,
                y: e.point.y,
                feature: featureJson,
              });
            }
          }
        }
      });

      // Close menu on map movement
      map.on("movestart", function () {
        if (App.UI.RadialMenu.isMenuOpen()) {
          App.UI.RadialMenu.closeMenu();
        }
      });

      console.log("Radial Menu initialized with cursor positioning");
    }

    console.log("Context Menu initialized");

    //this.showZoomLevel();

    // Add markers and feature with delays
    // this.map.setCenter([14.222929599999969, 46.62632869999987]);

    console.log("enable3D:" + enable3D);

    this.setRotationUpdateRate(500);

    if (enable3D) {
      this.map.setSky({
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
    }
  });
};
