/**
 * Terrain and 3D features management
 * @namespace App.Map.Terrain
 */
App.Map = App.Map || {};
App.Map.Terrain = (function () {
  // Private variables
  var _map = null;
  var _terrainEnabled = false;
  var _3dBuildingsEnabled = false;
  var _terrainSource = null;

  /**
 * Add terrain source to the map if it doesn't exist
 * @private
 */
async function _ensureTerrainSource() {
  try {
    // Make sure the map style is loaded
    if (!_map.isStyleLoaded()) {
      await new Promise(resolve => _map.once('styledata', resolve));
    }
    
    if (!_map.getSource("terrainSource")) {
      let sourceConfig;
      
      // Use MapTiler terrain source
      console.log("Configuring MapTiler terrain source...");
      
      sourceConfig = {
        type: "raster-dem",
        url: "https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=ldV32HV5eBdmgfE7vZJI",
        tileSize: 256
      };
      
      console.log("Using MapTiler terrain source with direct tiles URL");
      
      // Fallback to free terrain tiles
      if (!sourceConfig) {
        console.log("Using free terrain tiles from demotiles.maplibre.org");
        
        sourceConfig = {
          type: "raster-dem",
          tiles: [
            "https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png"
          ],
          tileSize: 256,
          encoding: "terrarium",
          maxzoom: 11,
        };
      }
      
      _map.addSource("terrainSource", sourceConfig);
      console.log("Terrain source added successfully:", sourceConfig);
      
      // Verify the source was added
      const addedSource = _map.getSource("terrainSource");
      console.log("Verification - terrain source exists:", !!addedSource);
    } else {
      console.log("Terrain source already exists");
      const existingSource = _map.getSource("terrainSource");
      console.log("Existing terrain source:", existingSource);
    }
    
    // Always set the terrain source name
    _terrainSource = "terrainSource";
  } catch (error) {
    console.error("Failed to add terrain source:", error);
    return false;
  }
  return true;
}

  // Public API
  return {
    /**
     * Initialize terrain functionality
     * @param {Object} map - The MapLibre map instance
     */
    initialize: function (map) {
      _map = map;
      console.log("Terrain module initialized");
    },

    /**
     * Enable 3D terrain on the map
     * @param {Object} [options] - Options for terrain
     * @param {number} [options.exaggeration=1] - Terrain exaggeration factor
     * @param {boolean} [options.setPitch=true] - Whether to set the map pitch automatically
     * @returns {boolean} Success status
     */
    enableTerrain: async function (options) {
      options = options || {};
      const exaggeration = options.exaggeration || 1.0;  // Increased default exaggeration for better visibility
      const setPitch = options.setPitch !== false;

      if (!_map) {
        console.error("Map not initialized in Terrain module");
        return false;
      }

      const sourceAdded = await _ensureTerrainSource();
      if (!sourceAdded) {
        console.error("Failed to add terrain source");
        return false;
      }

      console.log("Terrain source name:", _terrainSource);
      console.log("Available sources:", _map.getStyle().sources);

      try {
        console.log("About to enable terrain with source:", _terrainSource);
        console.log("Current map sources:", Object.keys(_map.getStyle().sources));
        console.log("Exaggeration value:", exaggeration);
        
        // Enable 3D terrain
        _map.setTerrain({
          source: _terrainSource,
          exaggeration: exaggeration,
        });
        
        console.log("setTerrain called successfully");
        
        // Verify terrain is enabled
        const terrainConfig = _map.getTerrain();
        console.log("Terrain config after enabling:", terrainConfig);

        // Add sky layer
        _map.setSky({
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
        });

        // Add pitch to the map if requested
        if (setPitch) {
          const currentPitch = _map.getPitch();
          console.log("Current pitch:", currentPitch);
          
          // Always set pitch for 3D view
          _map.easeTo({
            pitch: 60,
            bearing: _map.getBearing(),
            duration: 1000,
          });
        }

        _terrainEnabled = true;
        console.log("Terrain enabled successfully");
        console.log("Current zoom:", _map.getZoom());
        console.log("Terrain exaggeration:", exaggeration);
        
        // Log terrain status
        const terrain = _map.getTerrain();
        console.log("Terrain config:", terrain);

        // Trigger event if events module is available
        if (App.Core.Events) {
          App.Core.Events.trigger("terrain:state", { enabled: true });
        }

        return true;
      } catch (error) {
        console.error("Error enabling terrain:", error);
        return false;
      }
    },

    /**
     * Disable 3D terrain on the map
     * @param {Object} [options] - Options for disabling terrain
     * @param {boolean} [options.resetPitch=true] - Whether to reset the map pitch
     * @returns {boolean} Success status
     */
    disableTerrain: function (options) {
      options = options || {};
      const resetPitch = options.resetPitch !== false;

      try {
        // Disable 3D terrain
        _map.setTerrain(null);

        // Reset pitch if requested
        if (resetPitch) {
          _map.flyTo({
            center: _map.getCenter(),
            zoom: _map.getZoom(),
            pitch: 0,
          });
        }

        _terrainEnabled = false;
        console.log("Terrain disabled");

        // Trigger event if events module is available
        if (App.Core.Events) {
          App.Core.Events.trigger("terrain:state", { enabled: false });
        }

        return true;
      } catch (error) {
        console.error("Error disabling terrain:", error);
        return false;
      }
    },

    /**
     * Toggle terrain on/off
     * @param {Object} [options] - Options for terrain toggle
     * @returns {boolean} New terrain state (true = enabled, false = disabled)
     */
    toggleTerrain: function (options) {
      if (_terrainEnabled) {
        this.disableTerrain(options);
      } else {
        this.enableTerrain(options);
      }
      return !_terrainEnabled;
    },

    /**
     * Check if terrain is currently enabled
     * @returns {boolean} Whether terrain is enabled
     */
    isTerrainEnabled: function () {
      return _terrainEnabled;
    },

    /**
     * Toggle 3D buildings visibility
     * @param {boolean} [force] - Optional force state (true = show, false = hide)
     * @returns {boolean} The new state (true = visible, false = hidden)
     */
    toggle3DBuildings: function (force) {
      let isVisible = false;
      let layerCount = 0;

      // Loop through all layers on the map
      _map.getStyle().layers.forEach((layer) => {
        // Check if the layer is a 'fill-extrusion' type (which represents 3D buildings)
        if (layer.type === "fill-extrusion") {
          layerCount++;

          // Get the current visibility of the layer
          const visibility = _map.getLayoutProperty(layer.id, "visibility");

          // If force is provided, use that, otherwise toggle the current state
          const newVisibility =
            force !== undefined
              ? force
                ? "visible"
                : "none"
              : visibility === "visible"
              ? "none"
              : "visible";

          _map.setLayoutProperty(layer.id, "visibility", newVisibility);

          if (newVisibility === "visible") {
            isVisible = true;
            console.log(`3D buildings layer '${layer.id}' is now visible.`);
          } else {
            console.log(`3D buildings layer '${layer.id}' is now hidden.`);
          }
        }
      });

      _3dBuildingsEnabled = isVisible;

      if (layerCount === 0) {
        console.log("No 3D building layers found on the map.");
      } else {
        console.log(
          `Toggled ${layerCount} 3D building layers. Visibility: ${isVisible}`
        );
      }

      // Trigger an event that other modules can listen for
      if (App.Core.Events) {
        App.Core.Events.trigger("3dbuildings:visibility", {
          visible: isVisible,
          count: layerCount,
        });
      }

      return isVisible;
    },

    /**
     * Check if 3D buildings are enabled
     * @returns {boolean} Whether 3D buildings are enabled
     */
    is3DBuildingsEnabled: function () {
      return _3dBuildingsEnabled;
    },
  };
})();

console.log("app.map.terrain.js loaded - App.Map.Terrain module created");
