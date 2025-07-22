/**
 * Stop debugger
 *//**
 * Debug and monitoring utilities
 * @namespace App.Core.Debug
 */
App.Core = App.Core || {};
App.Core.Debug = (function () {
  // Private variables
  var _debugMode = false;
  var _debugger = null;

  // Public API
  return {
    /**
     * Set debug mode
     * @param {boolean} enabled - Whether debug mode is enabled
     */
    setDebugMode: function (enabled) {
      _debugMode = enabled;
      if (window.reha && typeof window.reha.setDebugMode === "function") {
        window.reha.setDebugMode(enabled);
      }
      console.log(`Debug mode ${enabled ? "enabled" : "disabled"}`);
    },

    /**
     * Check if debug mode is enabled
     * @returns {boolean} Debug mode state
     */
    isDebugMode: function () {
      return _debugMode;
    },

    /**
     * Start debugger
     */
    startDebugger: function () {
      if (!_debugger && typeof Debugly === "function") {
        _debugger = new Debugly();
        this.setDebugMode(true);
        console.log("Debugger started");
      }
    },

    /**
     * Stop debugger
     */
    stopDebugger: function () {
      if (_debugger && typeof _debugger.end === "function") {
        _debugger.end();
        _debugger = null;
        this.setDebugMode(false);
        console.log("Debugger stopped");
      }
    },

    /**
     * Check the application structure
     * @returns {Object} Structure status
     */
    checkAppStructure: function () {
      const structure = {
        app: typeof App !== "undefined",
        map: App && typeof App.Map !== "undefined",
        mapInit: App && App.Map && typeof App.Map.Init !== "undefined",
      };

      if (structure.mapInit) {
        structure.initializeMap =
          typeof App.Map.Init.initializeMap === "function";
        structure.getMap = typeof App.Map.Init.getMap === "function";
      }

      console.log("App structure check:", structure);
      return structure;
    },

    /**
     * Debug a WMS layer
     * @param {Object} layerConfig - WMS layer configuration
     */
    debugWmsLayer: function (layerConfig) {
      if (!_debugMode) return;

      const layerId = `${layerConfig.name}-layer`;
      const sourceId = `${layerConfig.name}-source`;
      const map = App.Map.Init.getMap();

      if (!map) {
        console.error("Map not available for debugging");
        return;
      }

      console.log("Debugging WMS layer...");

      // Check if the layer exists
      if (map.getLayer(layerId)) {
        console.log(`Layer ${layerId} exists in the map`);
        const visibility = map.getLayoutProperty(layerId, "visibility");
        console.log(`Layer visibility: ${visibility}`);
      } else {
        console.log(`Layer ${layerId} does not exist in the map`);
      }

      // Check if the source exists
      if (map.getSource(sourceId)) {
        console.log(`Source ${sourceId} exists in the map`);
        // Get source data
        const source = map.getSource(sourceId);
        console.log("Source configuration:", source);
      } else {
        console.log(`Source ${sourceId} does not exist in the map`);
      }

      // Check map bounds to see if we're in a relevant area
      const bounds = map.getBounds();
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
     * Probe interface status
     * @returns {boolean} Whether the interface is initialized
     */
    probeStatus: function () {
      console.log("Probing interface status...");
      if (window.reha && typeof window.reha.sendCallback === "function") {
        reha.sendCallback("initiated", "");
        return true;
      }
      return false;
    },
  };
})();

console.log("app.core.debug.js loaded - App.Core.Debug module created");
