/**
 * Map Events Optimization Module
 * @namespace App.Map.EventsOptimizer
 */
App.Map = App.Map || {};
App.Map.EventsOptimizer = (function () {
  var _handlerTracker = new Map();
  var _activeHandlers = new Set();

  /**
   * Get all interactive layer IDs
   * @private
   */
  function _getInteractiveLayers() {
    var map = App.Map.Init.getMap();
    if (!map) return [];

    // Get all layers from the map
    var style = map.getStyle();
    var interactiveLayers = [];

    if (style && style.layers) {
      style.layers.forEach(function (layer) {
        // Include layers that should be interactive
        if (
          layer.id.includes("feature-") ||
          layer.id.includes("marker-") ||
          layer.id.includes("poi-") ||
          layer.id.includes("layer-") ||
          layer.id.includes("category-") // Include category-based layers
        ) {
          interactiveLayers.push(layer.id);
        }
      });
    }

    return interactiveLayers;
  }

  /**
   * Clean up all map event handlers
   * @private
   */
  function _cleanupHandlers() {
    var map = App.Map.Init.getMap();
    if (!map) return;

    console.log("🧹 Cleaning up event handlers...");

    // Remove all click handlers
    if (map._listeners && map._listeners.click) {
      map._listeners.click = [];
    }

    // Clear our tracking
    _handlerTracker.clear();
    _activeHandlers.clear();
  }

  /**
   * Add a handler with duplicate prevention
   * @private
   */
  function _addHandlerWithCheck(eventName, handler, context, identifier) {
    var map = App.Map.Init.getMap();
    if (!map) return;

    var handlerId = `${eventName}:${identifier}`;

    // Check if this handler is already active
    if (_activeHandlers.has(handlerId)) {
      console.log(`⚠️ Handler ${handlerId} already registered, skipping`);
      return;
    }

    // Wrap the handler to add tracking
    var wrappedHandler = function (e) {
      // Prevent default and stop propagation for click events
      if (eventName === "click") {
        if (e.originalEvent) {
          e.originalEvent.preventDefault();
          e.originalEvent.stopPropagation();
        }
      }

      // Call the original handler
      return handler.call(context, e);
    };

    // Add the wrapped handler
    map.on(eventName, wrappedHandler);

    // Track this handler
    _activeHandlers.add(handlerId);
    _handlerTracker.set(handlerId, {
      event: eventName,
      handler: wrappedHandler,
      originalHandler: handler,
      context: context,
    });

    console.log(`✅ Added handler: ${handlerId}`);
  }

  /**
   * Remove a specific handler
   * @private
   */
  function _removeHandler(eventName, identifier) {
    var map = App.Map.Init.getMap();
    if (!map) return;

    var handlerId = `${eventName}:${identifier}`;
    var handlerInfo = _handlerTracker.get(handlerId);

    if (handlerInfo) {
      map.off(eventName, handlerInfo.handler);
      _activeHandlers.delete(handlerId);
      _handlerTracker.delete(handlerId);
      console.log(`🗑️ Removed handler: ${handlerId}`);
    }
  }

  /**
   * Optimize map click handlers
   * @public
   */
  function optimizeClickHandlers() {
    console.log("🔧 Optimizing click handlers...");

    // Step 1: Clean up existing handlers
    _cleanupHandlers();

    // Step 2: Add a single unified click handler
    _addHandlerWithCheck(
      "click",
      function (e) {
        // Primary map click handler
        try {
          // Get click coordinates
          var lngLat = e.lngLat;
          var point = e.point;

          // Check for feature under click - use our local function instead
          var features = App.Map.Init.getMap().queryRenderedFeatures(point, {
            layers: _getInteractiveLayers(),
          });

          if (features.length > 0) {
            // Handle feature click
            var feature = features[0];
            App.Core.Events.trigger("feature.selected", {
              feature: feature,
              layer: feature.layer.id,
              lngLat: lngLat,
              point: point,
            });

            // Notify the bridge
            if (window.interface && window.interface.bridge) {
              window.interface.bridge.onObjectClicked(
                feature.properties.id || `${feature.layer.id}_${feature.id}`
              );
            }
          } else {
            // Handle map click (no feature)
            App.Core.Events.trigger("map.clicked", {
              lngLat: lngLat,
              point: point,
            });

            // Notify the bridge
            if (window.interface && window.interface.bridge) {
              const latLngPoint = {
                lat: lngLat.lat,
                lng: lngLat.lng,
                x: point.x,
                y: point.y,
              };
              window.interface.bridge.onMapClicked(latLngPoint, latLngPoint);
            }
          }
        } catch (error) {
          console.error("Error in unified click handler:", error);
        }
      },
      this,
      "unified-click-handler"
    );

    // Step 3: Add debug handler if needed
    if (window._debugMode) {
      _addHandlerWithCheck(
        "click",
        function (e) {
          console.log("🔍 Debug: Map clicked at", e.lngLat);
        },
        this,
        "debug-click-handler"
      );
    }

    console.log("✨ Click handler optimization complete");
  }

  /**
   * Monitor for stalls
   * @private
   */
  function _monitorForStalls() {
    var lastClickTime = 0;
    var stallThreshold = 500; // 500ms

    // Monitor click events for stalls
    App.Core.Events.on("map.clicked", function () {
      var now = Date.now();
      if (lastClickTime && now - lastClickTime > stallThreshold) {
        console.warn(`⚠️ Potential stall detected: ${now - lastClickTime}ms`);
        // Auto-fix if stall detected
        optimizeClickHandlers();
      }
      lastClickTime = now;
    });
  }

  // Public API
  return {
    /**
     * Initialize the optimizer
     */
    initialize: function () {
      console.log("Initializing Map Events Optimizer");

      // Start monitoring
      _monitorForStalls();

      // Initial optimization
      optimizeClickHandlers();

      // Re-optimize periodically
      setInterval(function () {
        var map = App.Map.Init.getMap();
        if (
          map &&
          map._listeners &&
          map._listeners.click &&
          map._listeners.click.length > 2
        ) {
          console.log("🔍 Multiple click handlers detected, re-optimizing...");
          optimizeClickHandlers();
        }
      }, 30000); // Every 30 seconds
    },

    /**
     * Manually optimize handlers
     */
    optimize: optimizeClickHandlers,

    /**
     * Get handler statistics
     */
    getStats: function () {
      return {
        totalHandlers: _handlerTracker.size,
        activeHandlers: Array.from(_activeHandlers),
        handlerBreakdown: Array.from(_handlerTracker.entries()).map(
          ([id, info]) => ({
            id: id,
            event: info.event,
            context: info.context,
          })
        ),
      };
    },
  };
})();

// Auto-initialize when the module loads
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    if (App.Map.Init.getMap()) {
      App.Map.EventsOptimizer.initialize();
    }
  }, 2000);
});

// Direct fix for map click events
window.directMapClickFix = function () {
  console.log("🔧 Applying direct map click fix");

  // Get the map instance
  var map = window.interface?.map || App.Map.Init?.getMap();
  if (!map) {
    console.error("Map not found");
    return;
  }

  // Remove all existing click handlers
  if (map._listeners && map._listeners.click) {
    map._listeners.click = [];
  }

  // Add a single, simple click handler
  map.on("click", function (e) {
    console.log("Map clicked at:", e.lngLat);

    // Process the click
    try {
      var lngLat = e.lngLat;
      var point = e.point;

      // Simple feature query
      var features = map.queryRenderedFeatures(point);

      if (features && features.length > 0) {
        // Feature clicked
        console.log("Feature clicked:", features[0]);

        // Trigger event
        App.Core.Events.trigger("feature.selected", {
          feature: features[0],
          layer: features[0].layer.id,
          lngLat: lngLat,
          point: point,
        });

        // Notify bridge
        if (window.interface && window.interface.bridge) {
          window.interface.bridge.onObjectClicked(
            features[0].properties?.id ||
              `${features[0].layer.id}_${features[0].id}`
          );
        }
      } else {
        // Map clicked (no feature)
        console.log("Map clicked (no feature)");

        // Trigger event
        App.Core.Events.trigger("map.clicked", {
          lngLat: lngLat,
          point: point,
        });

        // Notify bridge
        if (window.interface && window.interface.bridge) {
          var latLngPoint = {
            lat: lngLat.lat,
            lng: lngLat.lng,
            x: point.x,
            y: point.y,
          };
          window.interface.bridge.onMapClicked(latLngPoint, latLngPoint);
        }
      }
    } catch (error) {
      console.error("Error in click handler:", error);
    }
  });

  console.log("✅ Direct map click fix applied");
  return true;
};

// Fix for duplicate click events
window.fixDuplicateClicks = function () {
  console.log("🔧 Fixing duplicate click events");

  // Get the map instance
  var map = window.interface?.map || App.Map.Init?.getMap();
  if (!map) {
    console.error("Map not found");
    return;
  }

  // Check current handlers
  if (map._listeners && map._listeners.click) {
    console.log(`Current click handlers: ${map._listeners.click.length}`);

    // Remove all click handlers
    map._listeners.click = [];
  }

  // Add a single click handler with debounce
  var lastClickTime = 0;
  var clickDebounce = 50; // 50ms debounce

  map.on("click", function (e) {
    var now = Date.now();

    // Prevent rapid duplicate clicks
    if (now - lastClickTime < clickDebounce) {
      return;
    }

    lastClickTime = now;

    // Process the click
    try {
      var lngLat = e.lngLat;
      var point = e.point;

      console.log("Map clicked at:", lngLat);

      // Query features
      var features = map.queryRenderedFeatures(point);

      if (features && features.length > 0) {
        // Feature clicked
        console.log("Feature clicked:", features[0]);

        // Trigger event once
        App.Core.Events.trigger("feature.selected", {
          feature: features[0],
          layer: features[0].layer.id,
          lngLat: lngLat,
          point: point,
        });

        // Notify bridge once
        if (window.interface && window.interface.bridge) {
          window.interface.bridge.onObjectClicked(
            features[0].properties?.id ||
              `${features[0].layer.id}_${features[0].id}`
          );
        }
      } else {
        // Map clicked (no feature)

        // Trigger event once
        App.Core.Events.trigger("map.clicked", {
          lngLat: lngLat,
          point: point,
        });

        // Notify bridge once
        if (window.interface && window.interface.bridge) {
          var latLngPoint = {
            lat: lngLat.lat,
            lng: lngLat.lng,
            x: point.x,
            y: point.y,
          };
          window.interface.bridge.onMapClicked(latLngPoint, latLngPoint);
        }
      }
    } catch (error) {
      console.error("Error in click handler:", error);
    }
  });

  console.log("✅ Duplicate click fix applied");
  console.log(
    `Now have ${
      map._listeners.click ? map._listeners.click.length : 0
    } click handlers`
  );

  return true;
};

// Also let's check for duplicate handlers
window.checkClickHandlers = function () {
  var map = window.interface?.map || App.Map.Init?.getMap();
  if (!map) {
    console.error("Map not found");
    return;
  }

  if (map._listeners && map._listeners.click) {
    console.log(`Total click handlers: ${map._listeners.click.length}`);
    map._listeners.click.forEach((handler, index) => {
      console.log(
        `Handler ${index}:`,
        handler.toString().substring(0, 100) + "..."
      );
    });
  } else {
    console.log("No click handlers found");
  }
};
