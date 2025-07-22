/**
 * Map navigation and location functionality
 * @namespace App.Map.Navigation
 */
App.Map = App.Map || {};
App.Map.Navigation = (function () {
  // Private variables
  var _map = null;
  var _gnssMarker = null; // GPS/GNSS location marker (green)
  var _positionMarker = null; // Manual position marker (orange)
  var _gnssLocation = null; // Current GPS location - will be set when first GPS update arrives
  var _manualPosition = null; // Manual position for placing objects - will be set to map center when needed
  var _gnssEnabled = false;
  var _positionEnabled = false;
  var _stepSize = 0.00001; // Small increment for slow movement
  var _followMode = false;
  var _followModeInterval = null;
  var _lastBearing = null;
  var _lastUpdate = 0;
  var _rotationUpdateRate = 300;
  var _mapReady = false;
  var _isAnimating = false;
  var _targetFeature = null;
  var _hasGNSSLocation = false; // Development flag to track GNSS availability

  /**
   * Creates the GNSS/GPS location marker (green cursor)
   * @private
   */
  function _createGnssMarker() {
    // Only create if we have GNSS location
    if (!_hasGNSSLocation || !_gnssLocation) {
      console.log("No GNSS location available - skipping GNSS marker creation");
      return;
    }

    // Validate coordinates
    if (!Array.isArray(_gnssLocation) || _gnssLocation.length !== 2 ||
        isNaN(_gnssLocation[0]) || isNaN(_gnssLocation[1])) {
      console.warn("Invalid GNSS coordinates - skipping marker creation:", _gnssLocation);
      return;
    }

    // Remove any existing marker first
    if (_gnssMarker) {
      _gnssMarker.remove();
    }

    // Create a custom HTML element for the GNSS marker
    var markerElement = document.createElement("div");
    markerElement.style.backgroundImage = `url(cursor-green.png)`;
    markerElement.style.backgroundSize = "contain";
    markerElement.style.backgroundRepeat = "no-repeat";
    markerElement.style.width = "96px";
    markerElement.style.height = "96px";
    markerElement.className = "blinking";

    // Create GNSS marker (not draggable)
    _gnssMarker = new maplibregl.Marker({
      element: markerElement,
      draggable: false
    })
      .setLngLat(_gnssLocation)
      .addTo(_map);

    console.log("GNSS marker created with green cursor at", _gnssLocation);
  }

  /**
   * Creates the manual position marker (orange cursor)
   * @private
   */
  function _createPositionMarker() {
    // Initialize manual position to map center if not set
    if (!_manualPosition) {
      var center = _map.getCenter();
      _manualPosition = [center.lng, center.lat];
      console.log("Initializing manual position to map center:", _manualPosition);
    }

    // Remove any existing marker first
    if (_positionMarker) {
      _positionMarker.remove();
    }

    // Create a custom HTML element for the position marker
    var markerElement = document.createElement("div");
    markerElement.style.backgroundImage = `url(cursor-orange.png)`;
    markerElement.style.backgroundSize = "contain";
    markerElement.style.backgroundRepeat = "no-repeat";
    markerElement.style.width = "96px";
    markerElement.style.height = "96px";
    markerElement.className = "blinking";

    // Create position marker (draggable for manual placement)
    _positionMarker = new maplibregl.Marker({
      element: markerElement,
      draggable: true
    })
      .setLngLat(_manualPosition)
      .addTo(_map);

    // Handle drag events for manual placement
    _positionMarker.on('dragend', function() {
      var lngLat = _positionMarker.getLngLat();
      _manualPosition = [lngLat.lng, lngLat.lat];
      console.log("Manual position updated:", _manualPosition);
      
      // Send callback to Java about position update
      if (window.reha && typeof window.reha.sendCallback === "function") {
        reha.sendCallback('dragtopos', JSON.stringify({
          lat: lngLat.lat,
          lng: lngLat.lng,
          id: "MYPOSID"
        }));
      }
    });

    console.log("Position marker created with orange cursor (draggable)");
  }

  /**
   * Updates the GPS location on the map
   * @param {number} lng - Longitude
   * @param {number} lat - Latitude
   * @private
   */
  function _updateGPSLocation(lng, lat) {
    console.log("GPS location update received: lng=" + lng + ", lat=" + lat);
    
    // Validate coordinates before using them
    if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
      console.error("Invalid GPS coordinates received: lng=" + lng + " (type: " + typeof lng + "), lat=" + lat + " (type: " + typeof lat + ")");
      return;
    }
    
    _gnssLocation = [lng, lat];
    _hasGNSSLocation = true;

    // Update or create GNSS marker
    if (!_gnssMarker && _gnssEnabled) {
      console.log("Creating GNSS marker at:", _gnssLocation);
      _createGnssMarker();
    } else if (_gnssMarker) {
      console.log("Updating GNSS marker position to:", _gnssLocation);
      _gnssMarker.setLngLat(_gnssLocation);
    } else {
      console.log("GNSS marker not ready - enabled:", _gnssEnabled, "marker exists:", !!_gnssMarker);
    }

    // Auto-center map if GPS is out of bounds
    var mapCanvas = _map.getCanvas();
    var width = mapCanvas.offsetWidth;
    var height = mapCanvas.offsetHeight;

    var marginX = width * 0.15; // 15% margin
    var marginY = height * 0.15;

    var positionPixel = _map.project([lng, lat]);

    var isOutOfBounds =
      positionPixel.x < marginX ||
      positionPixel.x > width - marginX ||
      positionPixel.y < marginY ||
      positionPixel.y > height - marginY;

    if (isOutOfBounds && _followMode) {
      // When we recenter, maintain the current zoom level
      const currentZoom = _map.getZoom();

      _map.easeTo({
        center: [lng, lat],
        duration: 500,
        zoom: currentZoom, // Keep current zoom level
        easing: function (t) {
          return t * (2 - t);
        },
      });
    }

    // Ensure location marker is on top
    // Note: ensureProperLayerOrder is in the interface, not in App.Map.Layers
    if (window.interface && typeof window.interface.ensureProperLayerOrder === 'function') {
      window.interface.ensureProperLayerOrder();
    }

    // If a target feature is selected and StakeOut is initialized, update navigation
    if (_targetFeature && App.Features.StakeOut) {
      // Update the directional arrows without changing map view
      const nearestCoords = App.Features.StakeOut.findNearestPointOnPolygon(
        _targetFeature,
        [lng, lat]
      );

      if (nearestCoords) {
        App.Features.StakeOut.displayDirectionalArrows(
          [lng, lat],
          nearestCoords
        );
      }
    }
  }

  /**
   * Simulates walking movement with directional bias
   * @private
   */
  function _simulateWalking() {
    var lng = _gnssLocation[0];
    var lat = _gnssLocation[1];

    // Introduce a bias to walk more often in one direction
    // The biasWeight controls the likelihood to move in the positive direction
    var biasWeightLng = 0.8; // 80% chance to move east (positive longitude)
    var biasWeightLat = 0.8; // 80% chance to move north (positive latitude)

    // Use biased random movement
    var randomDirectionLng = Math.random() < biasWeightLng ? 0.1 : -0.1;
    var randomDirectionLat = Math.random() < biasWeightLat ? 0.1 : -0.1;

    // Apply the movement based on the step size
    lng += randomDirectionLng * _stepSize; // Increment longitude
    lat += randomDirectionLat * _stepSize; // Increment latitude

    // Update the GPS location
    _updateGPSLocation(lng, lat);
  }

  // Public API
  return {
    /**
     * Initialize navigation functionality
     * @param {Object} map - The MapLibre map instance
     */
    initialize: function (map) {
      _map = map;
      // Don't create any markers on initialization - they'll be created when needed
      console.log("Navigation module initialized");
    },

    /**
     * Set the manual position marker location
     * @param {Array} position - [longitude, latitude] coordinates
     */
    setPosition: function (position) {
      console.log("setPosition called with:", position);
      _manualPosition = position;

      if (_positionMarker) {
        _positionMarker.setLngLat(position);
      }
    },

    /**
     * Get the manual position
     * @returns {Array} [longitude, latitude] coordinates
     */
    getPosition: function () {
      return _manualPosition;
    },

    /**
     * Update the GPS location
     * @param {number} lng - Longitude
     * @param {number} lat - Latitude
     */
    updateGPSLocation: function (lng, lat) {
      _updateGPSLocation(lng, lat);
    },

    /**
     * Set whether the manual position marker is visible
     * @param {boolean} enabled - Whether to show the position marker
     */
    setPositionEnabled: function (enabled) {
      console.log("setPositionEnabled called with:", enabled);
      _positionEnabled = enabled;

      if (enabled) {
        // Create position marker if it doesn't exist
        if (!_positionMarker && _map) {
          _createPositionMarker();
        }
        // Make sure it's visible
        if (_positionMarker && !_positionMarker._element.parentNode) {
          _positionMarker.addTo(_map);
        }
      } else {
        // Hide the position marker
        if (_positionMarker) {
          _positionMarker.remove();
        }
      }
    },

    /**
     * Update the location marker appearance
     * @param {string} markerUrl - URL to the marker image
     */
    updateLocationMarker: function (markerUrl) {
      // This method should update the GNSS marker to match Java expectations
      // The GNSS marker color changes based on GPS accuracy (green/orange/red)
      console.log("updateLocationMarker: updating GNSS marker icon to", markerUrl);
      
      // Store the current map center to prevent unwanted centering
      var currentCenter = _map.getCenter();
      var currentZoom = _map.getZoom();
      
      // Only update if GNSS marker exists
      if (_gnssMarker) {
        // Create a custom HTML element for the marker with the new icon
        var markerElement = document.createElement("div");
        markerElement.style.backgroundImage = `url(${markerUrl})`;
        markerElement.style.backgroundSize = "contain";
        markerElement.style.backgroundRepeat = "no-repeat";
        markerElement.style.width = "96px";
        markerElement.style.height = "96px";
        markerElement.className = "blinking";

        // Get current position of GNSS marker
        var currentLngLat = _gnssMarker.getLngLat();
        
        // Remove the existing marker
        _gnssMarker.remove();

        // Create a new marker with the updated icon
        _gnssMarker = new maplibregl.Marker({
          element: markerElement,
          draggable: false
        })
          .setLngLat(currentLngLat)
          .addTo(_map);
          
        // Restore the map center if it changed
        if (_map.getCenter().lng !== currentCenter.lng || 
            _map.getCenter().lat !== currentCenter.lat ||
            _map.getZoom() !== currentZoom) {
          _map.jumpTo({
            center: currentCenter,
            zoom: currentZoom
          });
        }
      } else {
        console.warn("updateLocationMarker: GNSS marker doesn't exist yet");
      }
    },

    /**
     * Set the map center to a specified position
     * @param {Array} position - [longitude, latitude] coordinates
     */
    setCenter: function (position) {
      _map.panTo(position);
    },

    /**
     * Set the map center and zoom level
     * @param {Array} position - [longitude, latitude] coordinates
     * @param {number} zoom - Zoom level
     */
    setCenterAndZoom: function (position, zoom) {
      _map.setCenter(position);
      _map.setZoom(zoom);
    },

    /**
     * Start walking simulation for testing
     */
    startWalkingSimulation: function () {
      if (!this._walkingInterval) {
        this._walkingInterval = setInterval(_simulateWalking, 1000);
        console.log("Walking simulation started");
      }
    },

    /**
     * Stop walking simulation
     */
    stopWalkingSimulation: function () {
      if (this._walkingInterval) {
        clearInterval(this._walkingInterval);
        this._walkingInterval = null;
        console.log("Walking simulation stopped");
      }
    },

    /**
     * Set the target feature for navigation
     * @param {Object} feature - GeoJSON feature to navigate to
     */
    setTargetFeature: function (feature) {
      _targetFeature = feature;

      // If we have a GNSS location and the StakeOut module is available, start navigation
      if (_hasGNSSLocation && App.Features.StakeOut && feature) {
        App.Features.StakeOut.navigateToNearestPointOnPolygon(
          feature,
          _gnssLocation
        );
      }
    },

    /**
     * Clear the current navigation target
     */
    clearTargetFeature: function () {
      _targetFeature = null;

      // If StakeOut module is available, stop navigation
      if (App.Features.StakeOut) {
        App.Features.StakeOut.stopNavigation();
      }
    },

    /**
     * Set the map ready state
     * @param {boolean} ready - Whether the map is ready
     */
    setMapReady: function (ready) {
      _mapReady = ready;
    },

    /**
     * Set the rotation update rate
     * @param {number} rateInMs - Rate in milliseconds
     */
    setRotationUpdateRate: function (rateInMs) {
      _rotationUpdateRate = rateInMs;
    },

    /**
     * Rotate the map smoothly to the given bearing
     * @param {number} bearing - The target compass bearing in degrees (0 = North)
     */
    rotateMap: function (bearing) {
      if (!_mapReady || !_map || _isAnimating) return;

      if (!_map.isStyleLoaded()) {
        console.warn("Map style not yet fully loaded — skipping rotation");
        return;
      }

      console.log(
        `[rotateMap] Ready: ${_mapReady}, Style: ${_map.isStyleLoaded()}, Animating: ${_isAnimating}, Bearing: ${bearing}`
      );

      const now = Date.now();
      if (now - _lastUpdate < _rotationUpdateRate) return;

      bearing = ((bearing % 360) + 360) % 360;
      if (_lastBearing !== null && Math.abs(bearing - _lastBearing) < 0.5)
        return;

      _lastUpdate = now;
      _lastBearing = bearing;

      try {
        _isAnimating = true;
        _map.easeTo({
          bearing: bearing,
          duration: _rotationUpdateRate * 1.5,
          easing: (t) => t * (2 - t),
          noMoveStart: true,
        });

        // Reset animating flag after animation completes
        setTimeout(() => {
          _isAnimating = false;
        }, _rotationUpdateRate * 1.5);
      } catch (e) {
        console.warn("Map rotation failed:", e);
        _isAnimating = false;
      }
    },

    /**
     * Toggle follow mode on/off
     * @returns {boolean} The new follow mode state
     */
    toggleFollowMode: function () {
      _followMode = !_followMode;

      if (_followMode) {
        console.log("Follow mode enabled");

        // Start follow mode (automatically update GPS location)
        _followModeInterval = setInterval(() => {
          console.log("Updating GPS location in follow mode...");
          this.updateGPSLocation(_gnssLocation[0], _gnssLocation[1]);
        }, 2000); // Simulating GPS updates every 2 seconds
      } else {
        console.log("Follow mode disabled");

        // Stop follow mode
        if (_followModeInterval) {
          clearInterval(_followModeInterval);
          _followModeInterval = null;
        }
      }

      return _followMode;
    },

    /**
     * Center the map on the current GNSS location
     */
    centerOnCurrentLocation: function () {
      if (_hasGNSSLocation) {
        console.log("Centering map to GNSS location:", _gnssLocation);
        _map.easeTo({
          center: _gnssLocation,
          duration: 1000,
          easing: function (t) {
            return t * (2 - t);
          },
        });
      } else {
        console.log("No GNSS location available to center on");
      }
    },

    /**
     * Enable GNSS location (for development)
     * This will create the position marker if it doesn't exist
     */
    enableGNSS: function () {
      _hasGNSSLocation = true;
      console.log("GNSS enabled (development mode)");
      
      // Create the position marker if it doesn't exist
      if (!_positionMarker && _map) {
        _createPositionMarker();
      }
      
      // Set the green cursor marker
      this.updateLocationMarker("cursor-green.png");
    },

    /**
     * Disable GNSS location (for development)
     * This will remove the position marker
     */
    disableGNSS: function () {
      _hasGNSSLocation = false;
      console.log("GNSS disabled (development mode)");
      
      // Remove the position marker if it exists
      if (_positionMarker) {
        _positionMarker.remove();
        _positionMarker = null;
      }
    },

    /**
     * Check if GNSS is enabled (for development)
     * @returns {boolean} Whether GNSS is enabled
     */
    isGNSSEnabled: function () {
      return _hasGNSSLocation;
    },

    /**
     * Set whether the GNSS marker is visible
     * @param {boolean} enabled - Whether to show the GNSS marker
     */
    setGnssEnabled: function (enabled) {
      console.log("setGnssEnabled called with:", enabled);
      _gnssEnabled = enabled;

      if (enabled) {
        // Only show existing marker or defer creation until we have valid coordinates
        if (_gnssMarker) {
          // Marker exists, just ensure it's visible
          console.log("GNSS marker already exists, ensuring visibility");
        } else if (_hasGNSSLocation && _map) {
          // We have location data, try to create marker
          _createGnssMarker();
        } else {
          // No location yet, marker will be created when GPS update arrives
          console.log("GNSS enabled but no valid location yet - marker will be created on first GPS update");
        }
      } else {
        // Hide the GNSS marker
        if (_gnssMarker) {
          _gnssMarker.remove();
          _gnssMarker = null;
        }
      }
    },

    /**
     * Get the current GNSS location
     * @returns {Array} [longitude, latitude] coordinates
     */
    getGnssLocation: function () {
      return _gnssLocation;
    },

    /**
     * Get the position marker instance
     * @returns {Object} The position marker or null
     */
    getPositionMarker: function () {
      return _positionMarker;
    }
  };
})();

console.log("app.map.navigation.js loaded - App.Map.Navigation module created");
