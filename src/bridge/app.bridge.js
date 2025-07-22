/**
 * Bridge interface for system integration
 * @namespace App.Bridge
 */
App.Bridge = (function () {
  // Private variables
  var _defaultLocation = [14.2229296, 46.626328]; // Default location if none provided
  var _currentLocation = _defaultLocation.slice(); // Clone the default
  var _bridgeCallbacks = {};
  var _isAndroid = false;
  var _isConnected = false;

  /**
   * Check if running in Android WebView
   * @private
   * @returns {boolean} Whether running in Android WebViewStatusFooterBridge
   */
  function _checkAndroidEnvironment() {
    return (
      /Android/.test(navigator.userAgent) && /wv/.test(navigator.userAgent)
    );
  }

  /**
   * Execute callback if it exists
   * @private
   * @param {string} name - Callback name
   * @param {*} data - Data to pass to callback
   */
  function _executeCallback(name, data) {
    if (
      _bridgeCallbacks[name] &&
      typeof _bridgeCallbacks[name] === "function"
    ) {
      try {
        _bridgeCallbacks[name](data);
      } catch (error) {
        console.error(`Error executing bridge callback '${name}':`, error);
      }
    }
  }

  // Public API
  return {
    /**
     * Initialize the bridge
     */
    init: function () {
      _isAndroid = _checkAndroidEnvironment();

      // Set up global interface for backward compatibility
      window.interface = window.interface || {};
      window.interface.currentLocation = _currentLocation;

      // Add compatibility methods
      this.setupCompatibilityLayer();

      console.log(
        "Bridge initialized. Environment:",
        _isAndroid ? "Android" : "Web"
      );
    },

    /**
     * Set up a compatibility layer for legacy code
     */
    setupCompatibilityLayer: function () {
      var self = this;

      // Map existing global interface functions to bridge methods
      window.interface.updateLocation = function (longitude, latitude) {
        self.updateLocation(longitude, latitude);
      };

      window.interface.toggleSidebar = function (sidebarId) {
        self.toggleUI("sidebar", sidebarId);
      };

      // Other compatibility methods can be added here
    },

    /**
     * Register a callback function
     * @param {string} name - Callback name
     * @param {Function} callback - Callback function
     */
    registerCallback: function (name, callback) {
      if (typeof callback === "function") {
        _bridgeCallbacks[name] = callback;
      } else {
        console.error("Invalid callback registered for:", name);
      }
    },

    /**
     * Update current location
     * @param {number} longitude - Longitude
     * @param {number} latitude - Latitude
     */
    updateLocation: function (longitude, latitude) {
      if (typeof longitude === "number" && typeof latitude === "number") {
        _currentLocation = [longitude, latitude];
        window.interface.currentLocation = _currentLocation;

        // Execute registered callbacks
        _executeCallback("locationChanged", {
          longitude: longitude,
          latitude: latitude,
        });
      }
    },

    /**
     * Get current location
     * @returns {Array} Current location as [longitude, latitude]
     */
    getCurrentLocation: function () {
      return _currentLocation.slice();
    },

    /**
     * Send data to system
     * @param {string} action - Action to perform
     * @param {Object} data - Data to send
     */
    sendToSystem: function (action, data) {
      if (!action) {
        console.error("No action specified for sendToSystem");
        return;
      }

      if (
        _isAndroid &&
        window.Android &&
        typeof window.Android.receiveData === "function"
      ) {
        try {
          // Send to Android if in WebView
          const jsonData = JSON.stringify({
            action: action,
            data: data || {},
          });
          window.Android.receiveData(jsonData);
        } catch (error) {
          console.error("Error sending data to Android:", error);
        }
      } else {
        // Log if in web environment
        console.log("Bridge action:", action, "Data:", data);
      }
    },

    /**
     * Toggle UI element
     * @param {string} elementType - Type of UI element
     * @param {string} elementId - ID of UI element
     */
    toggleUI: function (elementType, elementId) {
      if (elementType === "sidebar") {
        const sidebar = document.getElementById(elementId);
        if (sidebar) {
          sidebar.classList.toggle("collapsed");

          // Send state to system if needed
          this.sendToSystem("toggleSidebar", {
            id: elementId,
            collapsed: sidebar.classList.contains("collapsed"),
          });
        }
      }
      // Other UI element types can be added here
    },

    /**
     * Check if bridge is connected to a native system
     * @returns {boolean} Whether bridge is connected
     */
    isConnected: function () {
      return _isConnected;
    },

    /**
     * Check if running in Android environment
     * @returns {boolean} Whether running in Android
     */
    isAndroid: function () {
      return _isAndroid;
    },
  };
})();

// Initialize bridge when document is ready
document.addEventListener("DOMContentLoaded", function () {
  App.Bridge.init();
});

console.log("app.bridge.js loaded - App.Bridge module created");
