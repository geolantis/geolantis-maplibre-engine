// Modified app.core.config.js

/**
 * Configuration settings for the application
 * @namespace App.Core.Config
 */
App.Core = App.Core || {};
App.Core.Config = (function () {
  // Private variables
  var _defaultCenter = [14.222929599999969, 46.62632869999987];
  var _defaultZoom = 17;
  var _maxZoom = 28;
  var _minZoom = 1;
  var _mapOptions = null;
  var _initialized = false;

  // Function to initialize the config with mapConfig
  function _initializeConfig() {
    if (_initialized) return;
    
    // Make sure mapConfig is available
    if (!window.mapConfig) {
      console.warn("mapConfig not available yet - using default configuration");
      // Set default map options without mapConfig
      _mapOptions = {
        container: "map",
        style: "https://gis.ktn.gv.at/osgdi/styles/basemap_ktn_vektor.json", // Default style
        center: _defaultCenter,
        zoom: _defaultZoom,
        minZoom: _minZoom,
        maxZoom: _maxZoom,
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
      };
    } else {
      // Use mapConfig if available
      _mapOptions = {
        container: "map",
        style: window.mapConfig.backgroundMaps["Basemap Standard"].style,
        center: _defaultCenter,
        zoom: _defaultZoom,
        minZoom: _minZoom,
        maxZoom: _maxZoom,
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
      };
    }
    
    _initialized = true;
    console.log("App.Core.Config initialized");
  }

  // Try to initialize on load
  _initializeConfig();

  // Public API
  return {
    /**
     * Default map center coordinates
     * @type {Array}
     */
    defaultCenter: _defaultCenter,

    /**
     * Default map zoom level
     * @type {number}
     */
    defaultZoom: _defaultZoom,

    /**
     * Maximum allowed zoom level
     * @type {number}
     */
    maxZoom: _maxZoom,

    /**
     * Minimum allowed zoom level
     * @type {number}
     */
    minZoom: _minZoom,

    /**
     * Map configuration options
     * @type {Object}
     */
    get mapOptions() {
      if (!_initialized) {
        _initializeConfig();
      }
      return _mapOptions;
    },
    
    /**
     * Explicitly initialize the configuration
     * Should be called after mapConfig is loaded
     */
    initialize: function() {
      _initializeConfig();
    }
  };
})();