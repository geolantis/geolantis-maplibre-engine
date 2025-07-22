/**
 * Map initialization module
 * @namespace App.Map.Init
 */
App.Map = App.Map || {};
App.Map.Init = (function () {
  // Private variables
  var _map = null;
  var _isInitialized = false;

  return {
    /**
     * Initialize the map
     * @param {string} containerId - The ID of the map container
     * @returns {Object} The map object
     */
    initializeMap: function (containerId) {
      console.log(
        "App.Map.Init.initializeMap called for container:",
        containerId
      );

      if (_map) {
        console.log("Map already initialized, returning existing instance");
        return _map;
      }

      try {
        console.log("Creating new map instance");

        // Add protocol handler for TIFF files
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

        // Create the map
        _map = new maplibregl.Map({
          container: containerId,
          style: mapConfig.backgroundMaps["Global2"].style,
          center: [14.5, 47.0], // Default center (Austria)
          zoom: 0,
          minZoom: 0,
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

        console.log("Map created successfully");

        // Set up loaded event handler
        _map.once("load", function () {
          console.log("Map has finished loading");
          _isInitialized = true;
          
          // Ensure glyphs are available for text rendering
          App.Map.Init.ensureGlyphs(_map);
          
          // Animate zoom from 0 to 2.25 after map loads
          setTimeout(() => {
            _map.easeTo({
              zoom: 2.25,
              duration: 2000, // 2 second animation
              easing: function(t) {
                // Ease-in-out cubic function for smooth animation
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
              }
            });
            console.log("Animating zoom to 2.25");
          }, 500); // Small delay to ensure map is fully rendered
          
          // Load saved basemap after animation starts
          setTimeout(() => {
            if (App.Map.Basemap && typeof App.Map.Basemap.loadSavedBasemap === "function") {
              console.log("Loading saved basemap preference");
              App.Map.Basemap.loadSavedBasemap("Global2"); // Use Global2 as fallback
            }
          }, 1000); // Load after animation has started
        });
        
        // Also listen for style changes
        _map.on('styledata', function() {
          // Ensure glyphs after style change
          setTimeout(() => {
            App.Map.Init.ensureGlyphs(_map);
          }, 100);
        });

        return _map;
      } catch (e) {
        console.error("Error creating map:", e);
        return null;
      }
    },

    /**
     * Get the map instance
     * @returns {Object|null} The map instance or null if not initialized
     */
    getMap: function () {
      return _map;
    },

    /**
     * Check if the map is initialized
     * @returns {boolean} True if the map is initialized
     */
    isInitialized: function () {
      return _isInitialized;
    },
    
    /**
     * Ensure map style has glyphs for text rendering
     * @param {Object} map - MapLibre map instance (optional, uses internal map if not provided)
     */
    ensureGlyphs: function (map) {
      const mapInstance = map || _map;
      if (!mapInstance) return;
      
      const style = mapInstance.getStyle();
      if (!style) return;
      
      // Check if glyphs are missing
      if (!style.glyphs) {
        console.warn('Map style missing glyphs URL - adding default glyphs for text rendering');
        
        // Use MapTiler's public glyphs as fallback
        style.glyphs = 'https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=ldV32HV5eBdmgfE7vZJI';
        
        // Apply the updated style
        mapInstance.setStyle(style);
        
        console.log('✅ Added glyphs URL to map style');
        
        // Trigger event
        if (App.Core.Events) {
          App.Core.Events.trigger('map:glyphsFixed', { map: mapInstance });
        }
      }
    },
  };
})();

console.log("app.map.init.js loaded - App.Map.Init module created");
console.log(
  "- initializeMap is a function:",
  typeof App.Map.Init.initializeMap === "function"
);
console.log(
  "- getMap is a function:",
  typeof App.Map.Init.getMap === "function"
);
