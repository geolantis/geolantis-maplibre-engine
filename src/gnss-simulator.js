/**
 * Enhanced GNSS Simulator for MapLibre
 * Features:
 * - Command line integration
 * - Status footer updates
 * - 8-direction manual movement controls
 * - Removable GPS toggle button
 */

(function () {
  console.log("Initializing GNSS Simulator...");

  // The main GNSS Simulator object
  const GNSSSimulator = {
    active: false,
    intervalId: null,
    updateInterval: 1000, // ms between position updates
    currentPosition: null, // [lng, lat]
    speed: 5, // meters per second
    heading: 0, // degrees, 0 = north, 90 = east
    randomness: "low", // 'none', 'low', 'medium', 'high'
    track: [], // Array of [lng, lat] coordinates to follow
    trackIndex: 0,
    accuracyH: 0.5, // Horizontal accuracy in meters
    accuracyV: 0.8, // Vertical accuracy in meters
    positionHistory: [], // Array to store historical positions
    maxHistoryLength: 100, // Maximum number of positions to store
    manualStepSize: 0.01, // Default manual step size in meters
    showTrack: false, // Flag to control track visualization

    // Initialize the simulator with the current map center
    initialize: function (map) {
      if (!map) {
        console.error("[GNSS] Map not provided");
        return false;
      }

      try {
        const center = map.getCenter();
        this.currentPosition = [center.lng, center.lat];
        console.log(
          `[GNSS] Initialized at ${center.lng.toFixed(6)}, ${center.lat.toFixed(
            6
          )}`
        );
        return true;
      } catch (e) {
        console.error("[GNSS] Error initializing: " + e.message);
        return false;
      }
    },

    // Start the simulator
    start: function (map) {
      if (this.active) {
        console.log("[GNSS] Already running");
        return "GNSS Simulator is already running";
      }

      if (!this.currentPosition) {
        if (!this.initialize(map)) {
          return "Failed to initialize GNSS Simulator";
        }
      }

      this.active = true;

      // Change cursor to green when starting simulation
      if (
        window.interface &&
        typeof window.interface.updateLocationMarker === "function"
      ) {
        try {
          window.interface.updateLocationMarker("cursor-green.png");
          console.log("[GNSS] Updated location marker to green cursor");
        } catch (e) {
          console.error("[GNSS] Error updating location marker: " + e.message);
        }
      } else {
        console.log("[GNSS] UpdateLocationMarker function not found");
      }

      this.updatePosition(map);

      // Set up interval for regular position updates
      this.intervalId = setInterval(() => {
        this.updatePosition(map);
      }, this.updateInterval);

      // Update the UI button if it exists
      const button = document.getElementById("gnss-simulator-button");
      if (button) {
        button.style.backgroundColor = "#F44336"; // Red when active
      }

      // Show the directional control panel
      this.showDirectionalControls();

      console.log(
        `[GNSS] Started at ${this.currentPosition[0].toFixed(
          6
        )}, ${this.currentPosition[1].toFixed(6)}`
      );
      return `GNSS Simulator started at ${this.currentPosition[0].toFixed(
        6
      )}, ${this.currentPosition[1].toFixed(6)}`;
    },

    // Stop the simulator
    stop: function () {
      if (!this.active) {
        console.log("[GNSS] Not running");
        return "GNSS Simulator is not running";
      }

      this.active = false;
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }

      // Change cursor back to default when stopping simulation
      if (
        window.interface &&
        typeof window.interface.UpdateLocationMarker === "function"
      ) {
        try {
          window.interface.UpdateLocationMarker("cursor-blue.png"); // Reset to default marker
          console.log("[GNSS] Reset location marker to default");
        } catch (e) {
          console.error("[GNSS] Error resetting location marker: " + e.message);
        }
      }

      // Remove the GPS button
      const button = document.getElementById("gnss-simulator-button");
      if (button) {
        button.remove();
      }

      // Hide directional controls
      this.hideDirectionalControls();

      console.log("[GNSS] Stopped");
      return "GNSS Simulator stopped";
    },

    // Show the 8-direction control panel
    showDirectionalControls: function () {
      // Remove existing panel if it exists
      this.hideDirectionalControls();

      // Create the control panel
      const panel = document.createElement("div");
      panel.id = "gnss-direction-panel";
      panel.style.position = "fixed";
      panel.style.bottom = "160px";
      panel.style.right = "10px";
      panel.style.width = "150px";
      panel.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      panel.style.borderRadius = "8px";
      panel.style.padding = "10px";
      panel.style.zIndex = "900";
      panel.style.display = "flex";
      panel.style.flexDirection = "column";
      panel.style.alignItems = "center";

      // Title
      const title = document.createElement("div");
      title.textContent = "Manual Control";
      title.style.color = "white";
      title.style.fontWeight = "bold";
      title.style.marginBottom = "5px";
      panel.appendChild(title);

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
      stepInput.value = this.manualStepSize;
      stepInput.style.width = "60px";
      stepInput.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
      stepInput.style.border = "none";
      stepInput.style.borderRadius = "3px";
      stepInput.style.padding = "2px 5px";
      stepInput.addEventListener("change", () => {
        const value = parseFloat(stepInput.value);
        if (!isNaN(value) && value > 0) {
          this.manualStepSize = value;
        }
      });
      stepControl.appendChild(stepInput);

      const unitLabel = document.createElement("span");
      unitLabel.textContent = "m";
      unitLabel.style.color = "white";
      unitLabel.style.marginLeft = "5px";
      stepControl.appendChild(unitLabel);

      panel.appendChild(stepControl);

      // Create the direction buttons grid
      const grid = document.createElement("div");
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = "repeat(3, 1fr)";
      grid.style.gridGap = "5px";
      grid.style.width = "100%";

      // Helper function to create a direction button
      const createDirectionButton = (direction, symbol, degrees) => {
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

        button.addEventListener("click", () => {
          this.moveInDirection(degrees);
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

      panel.appendChild(grid);

      // Append the panel to the body
      document.body.appendChild(panel);
    },

    // Hide the directional controls
    hideDirectionalControls: function () {
      const panel = document.getElementById("gnss-direction-panel");
      if (panel) {
        panel.remove();
      }
    },

    // Move in a specific direction (degrees)
    moveInDirection: function (degrees) {
      if (!this.currentPosition) return;

      try {
        // Convert distance from meters to lat/lng changes
        const distance = this.manualStepSize; // meters
        let [lng, lat] = this.currentPosition;

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
        this.setPosition(lng, lat, window.interface.map);

        console.log(
          `[GNSS] Manually moved ${distance}m in direction ${degrees}°`
        );
      } catch (e) {
        console.error("[GNSS] Error during manual movement: " + e.message);
      }
    },

    // Set current position
    setPosition: function (lng, lat, map) {
      this.currentPosition = [lng, lat];

      // If simulator is active, update the map immediately
      if (this.active && map) {
        this.updateMapPosition(map);
      } else if (
        window.interface &&
        typeof window.interface.setPosition === "function"
      ) {
        try {
          console.log(
            "[GNSS] Calling interface.setPosition with:",
            this.currentPosition
          );
          window.interface.setPosition(this.currentPosition);
        } catch (e) {
          console.error("[GNSS] Error setting position: " + e.message);
        }
      }

      // Store position in history if active
      if (this.active) {
        this.positionHistory.push([lng, lat]);

        // Trim history if needed
        if (this.positionHistory.length > this.maxHistoryLength) {
          this.positionHistory.shift(); // Remove oldest position
        }

        // Update position trail
        if (map) {
          this.updatePositionTrail(map);
        }
      }

      // Update status footer
      this.updateStatusFooter();

      console.log(
        `[GNSS] Position set to ${lng.toFixed(6)}, ${lat.toFixed(6)}`
      );
      return `GNSS position set to ${lng.toFixed(6)}, ${lat.toFixed(6)}`;
    },

    // Update the status footer with GNSS information
    updateStatusFooter: function () {
      if (!this.currentPosition) return;

      try {
        // Try both status update mechanisms
        if (
          window.statusFooterBridge &&
          typeof window.statusFooterBridge.updateAllStatus === "function"
        ) {
          const [lng, lat] = this.currentPosition;

          // Create dummy altitude based on position (for simulation)
          const altitude = 500 + Math.sin(lng * lat) * 50;

          // Accuracy varies based on randomness setting
          let accuracy = this.accuracyH;
          if (this.randomness === "medium") accuracy = 0.8;
          if (this.randomness === "high") accuracy = 1.5;

          // Create status data
          const statusData = {
            statusBar: {
              deviceName: "GNSS Simulator",
              tiltStatus: "Active",
              fixTime: new Date().toLocaleTimeString(),
              rtkStatus: this.randomness === "none" ? "FIX" : "FLOAT",
              accuracy: `±${accuracy.toFixed(2)}cm`,
              accuracyClass: this.randomness === "none" ? "high" : "medium",
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
              vrmsHrms: `${(this.accuracyV / 100).toFixed(3)} [m] / ${(
                this.accuracyH / 100
              ).toFixed(3)} [m]`,
              vdopPdop: "1.1 / 1.3",
              ntripStatus: this.active ? "Connected" : "Disconnected",
              rtcmStatus: this.active ? "Receiving" : "Inactive",
              satelliteCount: "15/22",
              speed: `${this.speed.toFixed(1)} m/s`,
            },
          };

          try {
            // Comment out the problematic updateAllStatus call
            // TODO: Fix status footer update method
            // window.statusFooterBridge.updateAllStatus(statusData);
            // console.log("[GNSS] Updated status footer via statusFooterBridge");
            
            // For now, just log the status data
            if (this.debugMode) {
              console.log("[GNSS] Status data:", statusData);
            }
          } catch (e) {
            console.error(
              "[GNSS] Failed to update status footer: " + e.message
            );
          }
        } else if (typeof window.updateStatusBar === "function") {
          try {
            window.updateStatusBar(
              "GNSS Simulator",
              "Active",
              new Date().toLocaleTimeString(),
              this.randomness === "none" ? "FIX" : "FLOAT",
              this.accuracyH.toFixed(1),
              this.randomness === "none" ? "high" : "medium"
            );
            console.log("[GNSS] Updated status footer via updateStatusBar");
          } catch (e) {
            console.error("[GNSS] Failed to update status bar: " + e.message);
          }
        }
      } catch (e) {
        console.error("[GNSS] Error updating status footer: " + e.message);
      }
    },

    // Set simulator speed in meters per second
    setSpeed: function (speed) {
      const numSpeed = parseFloat(speed);
      if (isNaN(numSpeed) || numSpeed < 0) {
        return "Invalid speed value. Speed must be a positive number.";
      }

      this.speed = numSpeed;
      this.updateStatusFooter();
      console.log(`[GNSS] Speed set to ${numSpeed} m/s`);
      return `GNSS simulator speed set to ${numSpeed} m/s`;
    },

    // Set manual step size in meters
    setStepSize: function (size) {
      const numSize = parseFloat(size);
      if (isNaN(numSize) || numSize <= 0) {
        return "Invalid step size. Must be a positive number.";
      }

      this.manualStepSize = numSize;
      console.log(`[GNSS] Manual step size set to ${numSize} m`);

      // Update the step size input if it exists
      const stepInput = document.querySelector("#gnss-direction-panel input");
      if (stepInput) {
        stepInput.value = numSize;
      }

      return `GNSS manual step size set to ${numSize} m`;
    },

    // Set simulator heading in degrees
    setHeading: function (heading) {
      const numHeading = parseFloat(heading);
      if (isNaN(numHeading)) {
        return "Invalid heading value. Heading must be a number.";
      }

      // Normalize heading to 0-360 degrees
      this.heading = ((numHeading % 360) + 360) % 360;
      console.log(
        `[GNSS] Heading set to ${
          this.heading
        }° (${this.getHeadingDescription()})`
      );
      return `GNSS simulator heading set to ${
        this.heading
      }° (${this.getHeadingDescription()})`;
    },

    // Get textual description of current heading
    getHeadingDescription: function () {
      const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
      const index = Math.round(this.heading / 45) % 8;
      return directions[index];
    },

    // Set randomness level for position updates
    setRandomness: function (level) {
      const validLevels = ["none", "low", "medium", "high"];

      if (!validLevels.includes(level)) {
        return `Invalid randomness level. Valid options are: ${validLevels.join(
          ", "
        )}`;
      }

      this.randomness = level;
      this.updateStatusFooter();
      console.log(`[GNSS] Randomness set to ${level}`);
      return `GNSS randomness set to ${level}`;
    },

    // Update position based on current settings
    updatePosition: function (map) {
      if (!this.active) {
        return;
      }

      try {
        // Calculate new position based on speed and heading
        let [lng, lat] = this.currentPosition;

        // Calculate distance to move in this update
        const timeInSeconds = this.updateInterval / 1000;
        let distance = this.speed * timeInSeconds; // meters

        // Add randomness to distance if enabled
        if (this.randomness !== "none") {
          const randomFactors = {
            low: 0.05, // 5% variation
            medium: 0.15, // 15% variation
            high: 0.3, // 30% variation
          };

          const randomFactor = randomFactors[this.randomness] || 0;
          const randomMultiplier =
            1 + (Math.random() * 2 * randomFactor - randomFactor);
          distance *= randomMultiplier;
        }

        // Add randomness to heading if enabled
        let moveHeading = this.heading;
        if (this.randomness !== "none") {
          const randomHeadingVariation = {
            low: 5, // ±5 degrees
            medium: 15, // ±15 degrees
            high: 45, // ±45 degrees
          };

          const variation = randomHeadingVariation[this.randomness] || 0;
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
        this.currentPosition = [lng, lat];
        this.positionHistory.push([lng, lat]);

        // Trim history if needed
        if (this.positionHistory.length > this.maxHistoryLength) {
          this.positionHistory.shift(); // Remove oldest position
        }

        // Update the map
        this.updateMapPosition(map);

        // Update the status footer
        this.updateStatusFooter();
      } catch (e) {
        console.error("[GNSS] Error updating position: " + e.message);
      }
    },

    // Update the map position marker
    updateMapPosition: function (map) {
      try {
        // Use the interface setPosition method
        if (
          window.interface &&
          typeof window.interface.setPosition === "function"
        ) {
          console.log(
            "[GNSS] Setting position with interface.setPosition:",
            this.currentPosition
          );
          window.interface.setPosition(this.currentPosition);
        }

        // Draw position history trail if map is available
        if (map) {
          this.updatePositionTrail(map);
        }
      } catch (e) {
        console.error("[GNSS] Error updating map position: " + e.message);
      }
    },

    // Create or update the position history trail
    updatePositionTrail: function (map) {
      if (!map || this.positionHistory.length < 2) return;
      
      // Only update trail if showTrack is enabled
      if (!this.showTrack) {
        // Remove the trail if it exists and showTrack is disabled
        if (map.getLayer("gnss-history-trail")) {
          map.removeLayer("gnss-history-trail");
        }
        if (map.getSource("gnss-history-trail")) {
          map.removeSource("gnss-history-trail");
        }
        return;
      }

      try {
        // Create a source for the trail if it doesn't exist
        if (!map.getSource("gnss-history-trail")) {
          map.addSource("gnss-history-trail", {
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
          map.addLayer({
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
        map.getSource("gnss-history-trail").setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: this.positionHistory,
          },
        });
      } catch (e) {
        console.error(`[GNSS] Error updating position trail: ${e.message}`);
      }
    },

    // Get status of the simulator
    getStatus: function () {
      return {
        active: this.active,
        currentPosition: this.currentPosition,
        speed: this.speed,
        heading: this.heading,
        randomness: this.randomness,
        updateInterval: this.updateInterval,
        historyLength: this.positionHistory ? this.positionHistory.length : 0,
        manualStepSize: this.manualStepSize,
        showTrack: this.showTrack,
      };
    },

    // Enable track visualization
    enableTrack: function (map) {
      this.showTrack = true;
      if (map) {
        this.updatePositionTrail(map);
      }
      return "GNSS track visualization enabled";
    },

    // Disable track visualization
    disableTrack: function (map) {
      this.showTrack = false;
      if (map) {
        // Remove the trail layer and source
        if (map.getLayer("gnss-history-trail")) {
          map.removeLayer("gnss-history-trail");
        }
        if (map.getSource("gnss-history-trail")) {
          map.removeSource("gnss-history-trail");
        }
      }
      return "GNSS track visualization disabled";
    },

    // Toggle track visualization
    toggleTrack: function (map) {
      if (this.showTrack) {
        return this.disableTrack(map);
      } else {
        return this.enableTrack(map);
      }
    },

    // Clear track history
    clearTrack: function (map) {
      this.positionHistory = [];
      if (this.currentPosition) {
        // Keep current position as the start of new track
        this.positionHistory.push([...this.currentPosition]);
      }
      if (map && this.showTrack) {
        this.updatePositionTrail(map);
      }
      return "GNSS track history cleared";
    },
  };

  // Generate a circular track
  function generateCircleTrack(
    centerLng,
    centerLat,
    radiusMeters,
    numPoints = 36
  ) {
    const points = [];
    const earthRadius = 6371000; // Earth radius in meters

    // Convert radius from meters to degrees (approximate)
    const radiusLat = (radiusMeters / earthRadius) * (180 / Math.PI);
    const radiusLng = radiusLat / Math.cos((centerLat * Math.PI) / 180);

    // Generate points around the circle
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const lat = centerLat + radiusLat * Math.cos(angle);
      const lng = centerLng + radiusLng * Math.sin(angle);
      points.push([lng, lat]);
    }

    // Close the circle
    points.push(points[0]);

    return points;
  }

  // Add a visible GPS button to toggle the simulator
  function addGpsButton() {
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
    button.addEventListener("click", () => {
      if (GNSSSimulator.active) {
        GNSSSimulator.stop();
      } else {
        GNSSSimulator.start(window.interface.map);
      }
    });

    // Add the button to the document
    document.body.appendChild(button);

    // Add keyboard shortcut (Ctrl+G)
    document.addEventListener("keydown", function (e) {
      if (e.ctrlKey && e.key === "g") {
        e.preventDefault(); // Prevent default browser behavior

        if (GNSSSimulator.active) {
          GNSSSimulator.stop();
        } else {
          GNSSSimulator.start(window.interface.map);
        }
      }
    });

    return button;
  }

  // Set GNSS simulator position to current map center
  GNSSSimulator.setToMapCenter = function (map) {
    if (!map) {
      console.error("[GNSS] Map not provided for setToMapCenter");
      return "Error: Map not provided";
    }

    try {
      const center = map.getCenter();

      // Set the position
      this.currentPosition = [center.lng, center.lat];

      // Update the map
      if (
        window.interface &&
        typeof window.interface.setPosition === "function"
      ) {
        window.interface.setPosition(this.currentPosition);
      }

      // Update the status footer
      this.updateStatusFooter();

      console.log(
        `[GNSS] Position set to map center: [${center.lng.toFixed(
          6
        )}, ${center.lat.toFixed(6)}]`
      );
      return `GNSS position set to map center: [${center.lng.toFixed(
        6
      )}, ${center.lat.toFixed(6)}]`;
    } catch (e) {
      console.error(
        "[GNSS] Error setting position to map center: " + e.message
      );
      return "Error setting position to map center: " + e.message;
    }
  };

  // Initialize the simulator when the map is ready
  function initialize() {
    console.log("[GNSS] Starting initialization...");

    // Check if the map interface is available
    if (!window.interface || !window.interface.map) {
      console.log("[GNSS] Map interface not ready yet, waiting...");
      setTimeout(initialize, 1000);
      return;
    }

    // Make the simulator available globally
    window.GNSSSimulator = GNSSSimulator;

    // Initialize the simulator with the map
    GNSSSimulator.initialize(window.interface.map);

    // Add the GPS toggle button
    addGpsButton();

    // Add the command to set step size
    if (window.mapConsole && typeof window.mapConsole.execute === "function") {
      console.log("[GNSS] Adding command for step size");
      // The mapConsole will handle this through the modified command line
    }

    console.log("[GNSS] Initialization complete");
  }

  // Start initialization when everything is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(initialize, 1000);
    });
  } else {
    // Document already loaded
    setTimeout(initialize, 1000);
  }
})();
