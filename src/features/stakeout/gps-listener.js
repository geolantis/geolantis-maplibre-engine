/**
 * GPS Listener Integration for StakeOut
 * Creates a unified GPS location provider that works with all sources
 * and reliably updates the StakeOut feature
 */
App.Features = App.Features || {};
App.Features.GPSListener = (function () {
  // Private properties
  let _currentPosition = null; // [lng, lat]
  let _listeners = []; // Array of callback functions
  let _active = false; // Whether listener is active
  let _lastUpdateTime = 0; // Timestamp of last position update
  let _sourceType = "unknown"; // Source of the last position update
  let _updateCount = 0; // Count of position updates

  // Intercept all GPS updates from various sources
  function _setupInterceptors() {
    console.log("Setting up GPS source interceptors...");

    // 1. Intercept interface.setPosition
    if (
      window.interface &&
      typeof window.interface.setPosition === "function"
    ) {
      if (!window.interface._originalSetPosition) {
        window.interface._originalSetPosition = window.interface.setPosition;

        // Store the current setPosition (which might already be throttled)
        var currentSetPosition = window.interface.setPosition;
        
        window.interface.setPosition = function (position) {
          // Call the current method (respecting any throttling)
          currentSetPosition.apply(this, arguments);

          // Extract coordinates from position
          let lng, lat;
          if (Array.isArray(position) && position.length >= 2) {
            [lng, lat] = position;
          } else if (position && typeof position === "object") {
            lng = position.lng || position.longitude || position[0];
            lat = position.lat || position.latitude || position[1];
          }

          // Forward to GPS listener for tracking only
          if (lng !== undefined && lat !== undefined) {
            App.Features.GPSListener.updatePosition(
              lng,
              lat,
              "interface.setPosition"
            );
          }
        };

        console.log("Intercepted window.interface.setPosition");
      }
    }

    // 2. Intercept App.Map.Navigation.updateGPSLocation
    if (
      App.Map &&
      App.Map.Navigation &&
      typeof App.Map.Navigation.updateGPSLocation === "function"
    ) {
      if (!App.Map.Navigation._originalUpdateGPSLocation) {
        App.Map.Navigation._originalUpdateGPSLocation =
          App.Map.Navigation.updateGPSLocation;

        App.Map.Navigation.updateGPSLocation = function (lng, lat) {
          // Call original method
          App.Map.Navigation._originalUpdateGPSLocation.apply(this, arguments);

          // Forward to GPS listener
          App.Features.GPSListener.updatePosition(
            lng,
            lat,
            "Navigation.updateGPSLocation"
          );
        };

        console.log("Intercepted App.Map.Navigation.updateGPSLocation");
      }
    }

    // 3. Intercept GNSSSimulator updates
    if (window.GNSSSimulator) {
      // Intercept position updates
      if (typeof window.GNSSSimulator.updatePosition === "function") {
        if (!window.GNSSSimulator._originalUpdatePosition) {
          window.GNSSSimulator._originalUpdatePosition =
            window.GNSSSimulator.updatePosition;

          window.GNSSSimulator.updatePosition = function (map) {
            // Call original method
            window.GNSSSimulator._originalUpdatePosition.apply(this, arguments);

            // Forward to GPS listener if we have a position
            if (
              this.currentPosition &&
              Array.isArray(this.currentPosition) &&
              this.currentPosition.length >= 2
            ) {
              const [lng, lat] = this.currentPosition;
              App.Features.GPSListener.updatePosition(
                lng,
                lat,
                "GNSSSimulator"
              );
            }
          };

          console.log("Intercepted GNSSSimulator.updatePosition");
        }
      }

      // Intercept direct position setting
      if (typeof window.GNSSSimulator.setPosition === "function") {
        if (!window.GNSSSimulator._originalSetPosition) {
          window.GNSSSimulator._originalSetPosition =
            window.GNSSSimulator.setPosition;

          window.GNSSSimulator.setPosition = function (lng, lat, map) {
            // Call original method
            window.GNSSSimulator._originalSetPosition.apply(this, arguments);

            // Forward to GPS listener
            App.Features.GPSListener.updatePosition(
              lng,
              lat,
              "GNSSSimulator.setPosition"
            );
          };

          console.log("Intercepted GNSSSimulator.setPosition");
        }
      }
    }

    // 4. Hook into App.Core.Events for position events
    if (App.Core && App.Core.Events) {
      // Hook any custom position events
      App.Core.Events.on("position:updated", function (data) {
        if (
          data &&
          (data.lng !== undefined || data.longitude !== undefined) &&
          (data.lat !== undefined || data.latitude !== undefined)
        ) {
          const lng = data.lng || data.longitude;
          const lat = data.lat || data.latitude;
          App.Features.GPSListener.updatePosition(
            lng,
            lat,
            "position:updated event"
          );
        }
      });

      console.log("Registered event listener for 'position:updated' events");
    }

    console.log("GPS source interceptors setup complete");
  }

  // Initialize StakeOut integration
  function _setupStakeOutIntegration() {
    console.log("Setting up StakeOut integration...");

    if (!App.Features || !App.Features.StakeOut) {
      console.log("StakeOut module not found, skipping integration");
      return;
    }

    // Register StakeOut as a listener
    App.Features.GPSListener.addListener(function (position) {
      if (App.Features.StakeOut && App.Features.StakeOut.isActive()) {
        // Update StakeOut with the new position
        const [lng, lat] = position;
        App.Features.StakeOut.updateCurrentLocation(lng, lat);
      }
    });

    console.log("Registered StakeOut as a GPS listener");
  }

  // Public API
  return {
    /**
     * Initialize the GPS listener
     * @returns {boolean} Success status
     */
    initialize: function () {
      console.log("Initializing GPS Listener...");

      // Set up interceptors for various location sources
      _setupInterceptors();

      // Set up StakeOut integration
      _setupStakeOutIntegration();

      // Set active state
      _active = true;

      console.log("GPS Listener initialized successfully");
      return true;
    },

    /**
     * Add a position update listener
     * @param {Function} callback - Function to call with position updates [lng, lat]
     * @returns {Function} Unsubscribe function
     */
    addListener: function (callback) {
      if (typeof callback !== "function") {
        console.error("GPS Listener: Callback must be a function");
        return function () {};
      }

      _listeners.push(callback);
      console.log(`GPS Listener: Added listener (total: ${_listeners.length})`);

      // Return unsubscribe function
      return function () {
        const index = _listeners.indexOf(callback);
        if (index !== -1) {
          _listeners.splice(index, 1);
          console.log(
            `GPS Listener: Removed listener (remaining: ${_listeners.length})`
          );
        }
      };
    },

    /**
     * Update the current position and notify listeners
     * @param {number} lng - Longitude
     * @param {number} lat - Latitude
     * @param {string} source - Source of the position update
     */
    updatePosition: function (lng, lat, source = "unknown") {
      // Skip if inactive
      if (!_active) return;

      // Validate input
      if (
        typeof lng !== "number" ||
        typeof lat !== "number" ||
        isNaN(lng) ||
        isNaN(lat)
      ) {
        console.error(`GPS Listener: Invalid position: ${lng}, ${lat}`);
        return;
      }

      // Update position
      _currentPosition = [lng, lat];
      _lastUpdateTime = Date.now();
      _sourceType = source;
      _updateCount++;

      // Track GPS update time globally for performance dashboard
      window._lastGPSUpdateTime = Date.now();
      
      // Log update (throttled to avoid console spam)
      if (_updateCount % 10 === 0) {
        console.log(
          `GPS position update (${_sourceType}): [${lng.toFixed(
            6
          )}, ${lat.toFixed(6)}]`
        );
      }

      // Notify listeners
      _listeners.forEach(function (callback) {
        try {
          callback(_currentPosition, _sourceType);
        } catch (error) {
          console.error("GPS Listener: Error in listener callback:", error);
        }
      });

      // Trigger event
      if (App.Core && App.Core.Events) {
        App.Core.Events.trigger("gps:position", {
          position: _currentPosition,
          source: _sourceType,
          timestamp: _lastUpdateTime,
        });
      }
    },

    /**
     * Get the current position
     * @returns {Array|null} [lng, lat] or null if position unknown
     */
    getPosition: function () {
      return _currentPosition;
    },

    /**
     * Get position update status information
     * @returns {Object} Status object
     */
    getStatus: function () {
      return {
        active: _active,
        position: _currentPosition,
        lastUpdate: _lastUpdateTime,
        timeSinceUpdate: _lastUpdateTime ? Date.now() - _lastUpdateTime : null,
        sourceType: _sourceType,
        listenerCount: _listeners.length,
        updateCount: _updateCount,
      };
    },

    /**
     * Activate or deactivate the listener
     * @param {boolean} active - Whether to activate
     */
    setActive: function (active) {
      _active = !!active;
      console.log(`GPS Listener: ${_active ? "Activated" : "Deactivated"}`);
      return _active;
    },
  };
})();

// Initialize the GPS Listener when document is ready
document.addEventListener("DOMContentLoaded", function () {
  // Wait for all required components to load
  function initGPSListener() {
    // Check if core modules are available
    if (!App.Core || !App.Core.Events) {
      console.log("Waiting for core modules to load...");
      setTimeout(initGPSListener, 500);
      return;
    }

    // Initialize the GPS Listener
    App.Features.GPSListener.initialize();

    // Register as a command if CLI is available
    if (
      window.mapConsole &&
      typeof window.mapConsole.registerCommand === "function"
    ) {
      console.log("Registering GPS command for CLI");

      // Register status command
      window.mapConsole.registerCommand(
        "gps.status",
        function () {
          return JSON.stringify(App.Features.GPSListener.getStatus(), null, 2);
        },
        "Show GPS listener status"
      );
    }
  }

  // Start initialization with a delay
  setTimeout(initGPSListener, 2000);
});

// Export for console debugging
window.GPSListener = App.Features.GPSListener;

console.log("GPS Listener module loaded");
