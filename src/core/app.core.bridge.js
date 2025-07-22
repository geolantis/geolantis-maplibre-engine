/**
 * Bridge module for backward compatibility
 * @namespace App.Core.Bridge
 */
App.Core = App.Core || {};
App.Core.Bridge = (function () {
  // Private variables
  var _initialized = false;

  /**
   * Create a compatible interface
   * @private
   */
  function _createCompatibleInterface() {
    console.log("Creating compatibility layer for old code");

    // Only create if window.interface doesn't exist yet
    if (!window.interface || !window.interface.map) {
      console.log("Setting up window.interface compatibility");

      // Get the map instance
      const map = App.Map.Init.getMap();

      // If the map isn't already in window.interface, add it
      if (window.interface && !window.interface.map) {
        window.interface.map = map;
        console.log("Added map to existing window.interface");
      } else {
        // Create a minimal interface with just the map for now
        window.interface = {
          map: map,
        };
        console.log("Created new minimal window.interface");
      }
    } else {
      console.log("window.interface already exists with a map");
    }
  }

  // Public API
  return {
    /**
     * Initialize the bridge
     */
    initialize: function () {
      if (_initialized) return;

      // Create compatibility layer
      _createCompatibleInterface();

      _initialized = true;
      console.log("Compatibility bridge initialized");
    },
  };
})();

console.log("app.core.bridge.js loaded - App.Core.Bridge module created");
