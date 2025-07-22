/**
 * GNSS Simulator functionality
 * @namespace App.Features.GNSS
 */
App.Features = App.Features || {};
App.Features.GNSS = (function () {
  // Private variables
  var _active = false;
  var _intervalId = null;
  var _updateInterval = 1000; // ms between position updates
  var _currentPosition = null; // [lng, lat]
  var _speed = 5; // meters per second
  var _heading = 0; // degrees, 0 = north, 90 = east
  var _randomness = "low"; // 'none', 'low', 'medium', 'high'
  var _track = []; // Array of [lng, lat] coordinates to follow
  var _trackIndex = 0;
  var _accuracyH = 0.5; // Horizontal accuracy in meters
  var _accuracyV = 0.8; // Vertical accuracy in meters
  var _positionHistory = []; // Array to store historical positions
  var _maxHistoryLength = 100; // Maximum number of positions to store
  var _manualStepSize = 0.01; // Default manual step size in meters
  var _map = null;
  var _controlPanel = null;

  /**
   * Create the GPS toggle button
   * @private
   */
  function _addGpsButton() {
    // Check if button already exists
    if (document.getElementById("gnss-simulator-button")) {
      return;
    }

    const button = document.createElement("button");
    button.id = "gnss-simulator-button";
    button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="2"></circle>
                <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path>
            </svg>
        `;
    button.title = "Toggle GNSS Simulator (Ctrl+G)";
    button.style.position = "fixed";
    button.style.bottom = "110px";
    button.style.right = "10px";
    button.style.width = "40px";
    button.style.height = "40px";
    button.style.borderRadius = "50%";
    button.style.backgroundColor = "#4CAF50";
    button.style.color = "white";
    button.style.border = "none";
    button.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
    button.style.cursor = "pointer";
    button.style.zIndex = "900";
    button.style.display = "flex";
    button.style.justifyContent = "center";
    button.style.alignItems = "center";

    // Add click event
    button.addEventListener("click", function () {
      if (_active) {
        App.Features.GNSS.stop();
      } else {
        App.Features.GNSS.start();
      }
    });

    // Add the button to the document
    document.body.appendChild(button);

    return button;
  }

  /**
   * Update position based on current settings
   * @private
   */
  function _updatePosition() {
    if (!_active) {
      return;
    }

    try {
      // Calculate new position based on speed and heading
      let [lng, lat] = _currentPosition;

      // Calculate distance to move in this update
      const timeInSeconds = _updateInterval / 1000;
      let distance = _speed * timeInSeconds; // meters

      // Add randomness to distance if enabled
      if (_randomness !== "none") {
        const randomFactors = {
          low: 0.05, // 5% variation
          medium: 0.15, // 15% variation
          high: 0.3, // 30% variation
        };

        const randomFactor = randomFactors[_randomness] || 0;
        const randomMultiplier =
          1 + (Math.random() * 2 * randomFactor - randomFactor);
        distance *= randomMultiplier;
      }

      // Add randomness to heading if enabled
      let moveHeading = _heading;
      if (_randomness !== "none") {
        const randomHeadingVariation = {
          low: 5, // ±5 degrees
          medium: 15, // ±15 degrees
          high: 45, // ±45 degrees
        };

        const variation = randomHeadingVariation[_randomness] || 0;
        moveHeading += Math.random() * 2 * variation - variation;
        moveHeading = ((moveHeading % 360) + 360) % 360; // Normalize to 0-360
      }

      // Convert heading and distance to lat/lng changes
      // We use an approximation that works for small distances
      const latChange =
        (distance * Math.cos((moveHeading * Math.PI) / 180)) / 111111; // 1 degree lat ~= 111111 meters
      const lngChange =
        (distance * Math.sin((moveHeading * Math.PI) / 180)) /
        (111111 * Math.cos((lat * Math.PI) / 180)); // Adjust for latitude

      // Apply the changes
      lat += latChange;
      lng += lngChange;

      // Store the new position
      _currentPosition = [lng, lat];
      _positionHistory.push([lng, lat]);

      // Trim history if needed
      if (_positionHistory.length > _maxHistoryLength) {
        _positionHistory.shift(); // Remove oldest position
      }

      // Update the map
      _updateMapPosition();

      // Update the status footer
      _updateStatusFooter();
    } catch (e) {
      console.error("[GNSS] Error updating position: " + e.message);
    }
  }

  /**
   * Update the map position marker
   * @private
   */
  function _updateMapPosition() {
    try {
      // Use the Map.Navigation module if available
      if (App.Map && App.Map.Navigation) {
        App.Map.Navigation.setPosition(_currentPosition);
      }
      // Fallback to the interface setPosition method
      else if (
        window.interface &&
        typeof window.interface.setPosition === "function"
      ) {
        window.interface.setPosition(_currentPosition);
      }

      // Draw position history trail if map is available
      if (_map) {
        _updatePositionTrail();
      }
    } catch (e) {
      console.error("[GNSS] Error updating map position: " + e.message);
    }
  }

  /**
   * Update the status footer with GNSS information
   * @private
   */
  function _updateStatusFooter() {
    if (!_currentPosition) return;

    try {
      // Try both status update mechanisms
      if (
        App.UI &&
        App.UI.Footer &&
        typeof App.UI.Footer.updateStatus === "function"
      ) {
        const [lng, lat] = _currentPosition;

        // Create dummy altitude based on position (for simulation)
        const altitude = 500 + Math.sin(lng * lat) * 50;

        // Accuracy varies based on randomness setting
        let accuracy = _accuracyH;
        if (_randomness === "medium") accuracy = 0.8;
        if (_randomness === "high") accuracy = 1.5;

        // Create status data
        const statusData = {
          statusBar: {
            deviceName: "GNSS Simulator",
            tiltStatus: "Active",
            fixTime: new Date().toLocaleTimeString(),
            rtkStatus: _randomness === "none" ? "FIX" : "FLOAT",
            accuracy: `±${accuracy.toFixed(2)}cm`,
            accuracyClass: _randomness === "none" ? "high" : "medium",
          },
          coordinates: {
            longitude: `${lng.toFixed(7)}°`,
            latitude: `${lat.toFixed(7)}°`,
            altitude: `${altitude.toFixed(2)} m`,
            x: (500000 + lng * 10000).toFixed(2),
            y: (5000000 + lat * 10000).toFixed(2),
            z: altitude.toFixed(2),
          },
          gnssInfo: {
            vrmsHrms: `${(_accuracyV / 100).toFixed(3)} [m] / ${(
              _accuracyH / 100
            ).toFixed(3)} [m]`,
            vdopPdop: "1.1 / 1.3",
            ntripStatus: _active ? "Connected" : "Disconnected",
            rtcmStatus: _active ? "Receiving" : "Inactive",
            satelliteCount: "15/22",
            speed: `${_speed.toFixed(1)} m/s`,
          },
        };

        App.UI.Footer.updateStatus(statusData);
      }
      // Fallback to global statusFooterBridge
      else if (
        window.statusFooterBridge &&
        typeof window.statusFooterBridge.updateAllStatus === "function"
      ) {
        // Similar implementation as above
        // ...
      }
    } catch (e) {
      console.error("[GNSS] Error updating status footer: " + e.message);
    }
  }

  /**
   * Create or update the position history trail
   * @private
   */
  function _updatePositionTrail() {
    if (!_map || _positionHistory.length < 2) return;

    try {
      // Create a source for the trail if it doesn't exist
      if (!_map.getSource("gnss-history-trail")) {
        _map.addSource("gnss-history-trail", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [],
            },
          },
        });

        // Add the trail layer
        _map.addLayer({
          id: "gnss-history-trail",
          type: "line",
          source: "gnss-history-trail",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3388ff",
            "line-width": 3,
            "line-opacity": 0.6,
          },
        });
      }

      // Update the trail data
      _map.getSource("gnss-history-trail").setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: _positionHistory,
        },
      });
    } catch (e) {
      console.error(`[GNSS] Error updating position trail: ${e.message}`);
    }
  }

  /**
   * Show the 8-direction control panel
   * @private
   */
  function _showDirectionalControls() {
    // Remove existing panel if it exists
    _hideDirectionalControls();

    // Create the control panel
    _controlPanel = document.createElement("div");
    _controlPanel.id = "gnss-direction-panel";
    _controlPanel.style.position = "fixed";
    _controlPanel.style.bottom = "160px";
    _controlPanel.style.right = "10px";
    _controlPanel.style.width = "150px";
    _controlPanel.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    _controlPanel.style.borderRadius = "8px";
    _controlPanel.style.padding = "10px";
    _controlPanel.style.zIndex = "900";
    _controlPanel.style.display = "flex";
    _controlPanel.style.flexDirection = "column";
    _controlPanel.style.alignItems = "center";

    // Title
    const title = document.createElement("div");
    title.textContent = "Manual Control";
    title.style.color = "white";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "5px";
    _controlPanel.appendChild(title);

    // Step size control
    const stepControl = document.createElement("div");
    stepControl.style.marginBottom = "10px";
    stepControl.style.width = "100%";
    stepControl.style.display = "flex";
    stepControl.style.alignItems = "center";

    const stepLabel = document.createElement("span");
    stepLabel.textContent = "Step: ";
    stepLabel.style.color = "white";
    stepLabel.style.marginRight = "5px";
    stepControl.appendChild(stepLabel);

    const stepInput = document.createElement("input");
    stepInput.type = "number";
    stepInput.min = "0.01";
    stepInput.max = "10";
    stepInput.step = "0.01";
    stepInput.value = _manualStepSize;
    stepInput.style.width = "60px";
    stepInput.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
    stepInput.style.border = "none";
    stepInput.style.borderRadius = "3px";
    stepInput.style.padding = "2px 5px";
    stepInput.addEventListener("change", function () {
      const value = parseFloat(this.value);
      if (!isNaN(value) && value > 0) {
        _manualStepSize = value;
      }
    });
    stepControl.appendChild(stepInput);

    const unitLabel = document.createElement("span");
    unitLabel.textContent = "m";
    unitLabel.style.color = "white";
    unitLabel.style.marginLeft = "5px";
    stepControl.appendChild(unitLabel);

    _controlPanel.appendChild(stepControl);

    // Create the direction buttons grid
    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(3, 1fr)";
    grid.style.gridGap = "5px";
    grid.style.width = "100%";

    // Helper function to create a direction button
    const createDirectionButton = function (direction, symbol, degrees) {
      const button = document.createElement("button");
      button.textContent = symbol;
      button.style.width = "30px";
      button.style.height = "30px";
      button.style.backgroundColor = "#4CAF50";
      button.style.color = "white";
      button.style.border = "none";
      button.style.borderRadius = "50%";
      button.style.cursor = "pointer";
      button.style.fontSize = "14px";
      button.style.fontWeight = "bold";
      button.style.display = "flex";
      button.style.justifyContent = "center";
      button.style.alignItems = "center";

      button.addEventListener("click", function () {
        App.Features.GNSS.moveInDirection(degrees);
      });

      return button;
    };

    // Add direction buttons to the grid
    grid.appendChild(createDirectionButton("nw", "↖", 315));
    grid.appendChild(createDirectionButton("n", "↑", 0));
    grid.appendChild(createDirectionButton("ne", "↗", 45));
    grid.appendChild(createDirectionButton("w", "←", 270));
    grid.appendChild(document.createElement("div")); // Center space
    grid.appendChild(createDirectionButton("e", "→", 90));
    grid.appendChild(createDirectionButton("sw", "↙", 225));
    grid.appendChild(createDirectionButton("s", "↓", 180));
    grid.appendChild(createDirectionButton("se", "↘", 135));

    _controlPanel.appendChild(grid);

    // Append the panel to the body
    document.body.appendChild(_controlPanel);
  }

  /**
   * Hide the directional controls
   * @private
   */
  function _hideDirectionalControls() {
    if (_controlPanel) {
      _controlPanel.remove();
      _controlPanel = null;
    } else {
      const panel = document.getElementById("gnss-direction-panel");
      if (panel) {
        panel.remove();
      }
    }
  }

  // Public API
  return {
    /**
     * Initialize the GNSS simulator
     * @param {Object} map - The MapLibre map instance
     * @returns {boolean} Whether initialization was successful
     */
    initialize: function (map) {
      _map = map;

      if (!map) {
        console.error("[GNSS] Map not provided");
        return false;
      }

      try {
        const center = map.getCenter();
        _currentPosition = [center.lng, center.lat];
        console.log(
          `[GNSS] Initialized at ${center.lng.toFixed(6)}, ${center.lat.toFixed(
            6
          )}`
        );

        // Add keyboard shortcut (Ctrl+G)
        document.addEventListener("keydown", function (e) {
          if (e.ctrlKey && e.key === "g") {
            e.preventDefault(); // Prevent default browser behavior

            if (_active) {
              App.Features.GNSS.stop();
            } else {
              App.Features.GNSS.start();
            }
          }
        });

        // Add the GPS toggle button
        _addGpsButton();

        return true;
      } catch (e) {
        console.error("[GNSS] Error initializing: " + e.message);
        return false;
      }
    },

    /**
     * Start the GNSS simulator
     * @returns {string} Status message
     */
    start: function () {
      if (_active) {
        console.log("[GNSS] Already running");
        return "GNSS Simulator is already running";
      }

      if (!_currentPosition) {
        if (!this.initialize(_map)) {
          return "Failed to initialize GNSS Simulator";
        }
      }

      _active = true;

      // Change cursor to green when starting simulation
      if (
        App.Map &&
        App.Map.Navigation &&
        typeof App.Map.Navigation.updateLocationMarker === "function"
      ) {
        App.Map.Navigation.updateLocationMarker("cursor-green.png");
      } else if (
        window.interface &&
        typeof window.interface.UpdateLocationMarker === "function"
      ) {
        window.interface.UpdateLocationMarker("cursor-green.png");
      }

      _updatePosition();

      // Set up interval for regular position updates
      _intervalId = setInterval(_updatePosition, _updateInterval);

      // Update the UI button if it exists
      const button = document.getElementById("gnss-simulator-button");
      if (button) {
        button.style.backgroundColor = "#F44336"; // Red when active
      }

      // Show the directional control panel
      _showDirectionalControls();

      console.log(
        `[GNSS] Started at ${_currentPosition[0].toFixed(
          6
        )}, ${_currentPosition[1].toFixed(6)}`
      );
      return `GNSS Simulator started at ${_currentPosition[0].toFixed(
        6
      )}, ${_currentPosition[1].toFixed(6)}`;
    },

    /**
     * Stop the GNSS simulator
     * @returns {string} Status message
     */
    stop: function () {
      if (!_active) {
        console.log("[GNSS] Not running");
        return "GNSS Simulator is not running";
      }

      _active = false;
      if (_intervalId) {
        clearInterval(_intervalId);
        _intervalId = null;
      }

      // Change cursor back to default when stopping simulation
      if (
        App.Map &&
        App.Map.Navigation &&
        typeof App.Map.Navigation.updateLocationMarker === "function"
      ) {
        App.Map.Navigation.updateLocationMarker("cursor-blue.png");
      } else if (
        window.interface &&
        typeof window.interface.UpdateLocationMarker === "function"
      ) {
        window.interface.UpdateLocationMarker("cursor-blue.png"); // Reset to default marker
      }

      // Update the UI button if it exists
      const button = document.getElementById("gnss-simulator-button");
      if (button) {
        button.style.backgroundColor = "#4CAF50"; // Green when inactive
      }

      // Hide directional controls
      _hideDirectionalControls();

      console.log("[GNSS] Stopped");
      return "GNSS Simulator stopped";
    },

    /**
     * Set the current position
     * @param {number} lng - Longitude
     * @param {number} lat - Latitude
     * @returns {string} Status message
     */
    setPosition: function (lng, lat) {
      _currentPosition = [lng, lat];

      // If simulator is active, update the map immediately
      if (_active) {
        _updateMapPosition();
      }

      // Store position in history if active
      if (_active) {
        _positionHistory.push([lng, lat]);

        // Trim history if needed
        if (_positionHistory.length > _maxHistoryLength) {
          _positionHistory.shift(); // Remove oldest position
        }

        // Update position trail
        if (_map) {
          _updatePositionTrail();
        }
      }

      // Update status footer
      _updateStatusFooter();

      console.log(
        `[GNSS] Position set to ${lng.toFixed(6)}, ${lat.toFixed(6)}`
      );
      return `GNSS position set to ${lng.toFixed(6)}, ${lat.toFixed(6)}`;
    },

    /**
     * Set the position to the current map center
     * @returns {string} Status message
     */
    setToMapCenter: function () {
      if (!_map) {
        console.error("[GNSS] Map not available");
        return "Error: Map not available";
      }

      try {
        const center = _map.getCenter();
        this.setPosition(center.lng, center.lat);
        return `GNSS position set to map center: [${center.lng.toFixed(
          6
        )}, ${center.lat.toFixed(6)}]`;
      } catch (e) {
        console.error(
          "[GNSS] Error setting position to map center: " + e.message
        );
        return "Error setting position to map center: " + e.message;
      }
    },

    /**
     * Set the simulator speed
     * @param {number} speed - Speed in meters per second
     * @returns {string} Status message
     */
    setSpeed: function (speed) {
      const numSpeed = parseFloat(speed);
      if (isNaN(numSpeed) || numSpeed < 0) {
        return "Invalid speed value. Speed must be a positive number.";
      }

      _speed = numSpeed;
      _updateStatusFooter();
      console.log(`[GNSS] Speed set to ${numSpeed} m/s`);
      return `GNSS simulator speed set to ${numSpeed} m/s`;
    },

    /**
     * Set the manual step size
     * @param {number} size - Step size in meters
     * @returns {string} Status message
     */
    setStepSize: function (size) {
      const numSize = parseFloat(size);
      if (isNaN(numSize) || numSize <= 0) {
        return "Invalid step size. Must be a positive number.";
      }

      _manualStepSize = numSize;
      console.log(`[GNSS] Manual step size set to ${numSize} m`);

      // Update the step size input if it exists
      const stepInput = document.querySelector("#gnss-direction-panel input");
      if (stepInput) {
        stepInput.value = numSize;
      }

      return `GNSS manual step size set to ${numSize} m`;
    },

    /**
     * Set the simulator heading
     * @param {number} heading - Heading in degrees
     * @returns {string} Status message
     */
    setHeading: function (heading) {
      const numHeading = parseFloat(heading);
      if (isNaN(numHeading)) {
        return "Invalid heading value. Heading must be a number.";
      }

      // Normalize heading to 0-360 degrees
      _heading = ((numHeading % 360) + 360) % 360;
      console.log(
        `[GNSS] Heading set to ${_heading}° (${this.getHeadingDescription()})`
      );
      return `GNSS simulator heading set to ${_heading}° (${this.getHeadingDescription()})`;
    },

    /**
     * Get textual description of current heading
     * @returns {string} Heading description
     */
    getHeadingDescription: function () {
      const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
      const index = Math.round(_heading / 45) % 8;
      return directions[index];
    },

    /**
     * Set the randomness level
     * @param {string} level - Randomness level ('none', 'low', 'medium', 'high')
     * @returns {string} Status message
     */
    setRandomness: function (level) {
      const validLevels = ["none", "low", "medium", "high"];

      if (!validLevels.includes(level)) {
        return `Invalid randomness level. Valid options are: ${validLevels.join(
          ", "
        )}`;
      }

      _randomness = level;
      _updateStatusFooter();
      console.log(`[GNSS] Randomness set to ${level}`);
      return `GNSS randomness set to ${level}`;
    },

    /**
     * Move in a specific direction (degrees)
     * @param {number} degrees - Direction in degrees
     */
    moveInDirection: function (degrees) {
      if (!_currentPosition) return;

      try {
        // Convert distance from meters to lat/lng changes
        const distance = _manualStepSize; // meters
        let [lng, lat] = _currentPosition;

        // Convert heading and distance to lat/lng changes
        const latChange =
          (distance * Math.cos((degrees * Math.PI) / 180)) / 111111; // 1 degree lat ~= 111111 meters
        const lngChange =
          (distance * Math.sin((degrees * Math.PI) / 180)) /
          (111111 * Math.cos((lat * Math.PI) / 180)); // Adjust for latitude

        // Apply the changes
        lat += latChange;
        lng += lngChange;

        // Update position
        this.setPosition(lng, lat);

        console.log(
          `[GNSS] Manually moved ${distance}m in direction ${degrees}°`
        );
      } catch (e) {
        console.error("[GNSS] Error during manual movement: " + e.message);
      }
    },

    /**
     * Get status of the simulator
     * @returns {Object} Simulator status
     */
    getStatus: function () {
      return {
        active: _active,
        currentPosition: _currentPosition,
        speed: _speed,
        heading: _heading,
        randomness: _randomness,
        updateInterval: _updateInterval,
        historyLength: _positionHistory ? _positionHistory.length : 0,
        manualStepSize: _manualStepSize,
      };
    },
  };
})();

// Initialize when the application is ready
document.addEventListener("DOMContentLoaded", function () {
  // Check if App.Core is initialized
  if (App.Core && typeof App.Core.onReady === "function") {
    App.Core.onReady(function () {
      console.log("[GNSS] Initializing with App.Core.onReady");
      if (App.Map && App.Map.Init && App.Map.Init.getMap) {
        App.Features.GNSS.initialize(App.Map.Init.getMap());
      }
    });
  } else {
    // Fallback to wait for map to be ready
    console.log("[GNSS] Using fallback initialization");
    const checkMap = setInterval(function () {
      if (window.interface && window.interface.map) {
        clearInterval(checkMap);
        App.Features.GNSS.initialize(window.interface.map);
      }
    }, 1000);
  }
});
