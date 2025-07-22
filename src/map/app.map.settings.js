/**
 * Map settings management
 * @namespace App.Map.Settings
 */
App.Map = App.Map || {};
App.Map.Settings = (function () {
  // Private variables
  var _map = null;

  // Public API
  return {
    /**
     * Initialize settings management
     * @param {Object} map - The MapLibre map instance
     */
    initialize: function (map) {
      _map = map;
      console.log("Map settings management initialized");

      // Set up initial settings
      this.setupInitialSettings();
    },

    /**
     * Set up initial map settings based on configuration
     */
    setupInitialSettings: function () {
      // Apply default settings
    },

    /**
     * Set up map settings controls and toggle switches
     */
    setupSettingsControls: function () {
      // Initialize map toggles using switches
      this.initializeMapToggles();
    },

    /**
     * Initialize map toggle controls
     */
    initializeMapToggles: function () {
      // Set up each type of toggle
      this.setupRotationToggle();
      this.setupPitchToggle();
      this.setupBackgroundToggle();
      this.setup3DBuildingsToggle();
      this.setupAccuracyCircleToggle();
      // Add more toggles as needed
    },

    /**
     * Set up rotation toggle control
     */
    setupRotationToggle: function () {
      const rotationToggle = document.getElementById("toggleRotation");
      if (rotationToggle) {
        console.log("Rotation toggle element found");
        rotationToggle.addEventListener("change", (e) => {
          const isEnabled = e.target.checked;
          console.log("Toggle Rotation:", isEnabled);
          if (isEnabled) {
            _map.dragRotate.enable();
            _map.keyboard.enable();
            _map.touchZoomRotate.enable();
            console.log("Rotation enabled");
          } else {
            _map.dragRotate.disable();
            _map.keyboard.disable();
            _map.touchZoomRotate.disableRotation();
            console.log("Rotation disabled");
          }
        });
      }
    },

    // Add methods for other toggles...

    /**
     * Set background transparency
     * @param {number} opacity - Opacity value from 0 to 1
     */
    setBackgroundTransparency: function (opacity) {
      if (!_map) return;

      // Ensure opacity is within valid range
      opacity = Math.max(0, Math.min(1, opacity));

      const layers = _map.getStyle().layers;
      layers.forEach((layer) => {
        if (layer.id.includes("background")) {
          _map.setPaintProperty(layer.id, "background-opacity", opacity);
        }
      });

      console.log(`Background transparency set to: ${opacity}`);
    },
  };
})();

console.log("app.map.settings.js loaded - App.Map.Settings module created");
