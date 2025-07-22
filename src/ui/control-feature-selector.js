/**
 * Feature selector UI component
 * Consolidated version combining all feature selection and highlighting functionality
 * @namespace App.UI.FeatureSelector
 */
App.UI = App.UI || {};
App.UI.FeatureSelector = (function () {
  console.log("App.UI.FeatureSelector module loading...");

  // Private variables
  var _activeSelector = null;
  var _map = null;
  var _currentOutsideClickHandler = null;

  /**
   * Initialize the feature selector
   * @param {Object} map - MapLibre map instance
   */
  function initialize(map) {
    console.log("Feature selector initialize called");
    _map = map;
    console.log("Feature selector initialized with map:", !!_map);

    // Create UI elements and add styles
    console.log("Creating feature selector UI...");
    createFeatureSelectorUI();
    console.log("Adding feature selector styles...");
    addFeatureSelectorStyles();

    // Debug check
    const container = document.getElementById("feature-selector-container");
    if (container) {
      console.log("✅ Feature selector container created successfully");
    } else {
      console.error("❌ Feature selector container not created");
    }

    // Listen for feature click events
    if (App.Core && App.Core.Events) {
      console.log("Setting up feature click event listener");
      App.Core.Events.on("map:featureClick", function (data) {
        console.log("Feature click event received", data);
        if (data.features && data.features.length > 1) {
          show(data.features, data.point, function (feature) {
            // Display feature in info panel
            if (window.objectInfoBridge) {
              window.objectInfoBridge.displayFeature(feature, true);
            }
          });
        }
      });
    } else {
      console.error("App.Core.Events not available");
    }
  }

  /**
   * Create the feature selector UI elements
   */
  function createFeatureSelectorUI() {
    console.log("createFeatureSelectorUI called");

    // Remove existing container if it exists
    const existingContainer = document.getElementById(
      "feature-selector-container"
    );
    if (existingContainer) {
      console.log("Removing existing feature selector container");
      existingContainer.remove();
    }

    // Create the container
    const container = document.createElement("div");
    container.id = "feature-selector-container";
    container.className = "feature-selector-container";
    console.log("Created feature selector container");

    // Add header
    const header = document.createElement("div");
    header.className = "feature-selector-header";

    const title = document.createElement("div");
    title.className = "feature-selector-title";
    title.textContent = "Select Feature";

    const closeBtn = document.createElement("button");
    closeBtn.className = "feature-selector-close";
    closeBtn.innerHTML = "&times;";
    closeBtn.title = "Close";
    closeBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      hide();
    });

    header.appendChild(title);
    header.appendChild(closeBtn);
    container.appendChild(header);

    // Add feature list container
    const listContainer = document.createElement("div");
    listContainer.className = "feature-selector-list";
    listContainer.id = "feature-selector-list";
    container.appendChild(listContainer);

    // Add to document
    document.body.appendChild(container);
    console.log("Added feature selector container to document body");

    // Initially hide it
    container.style.display = "none";
    _activeSelector = container;

    console.log("Feature selector UI creation complete");
  }

  /**
   * Show feature selector
   * @param {Array} features - Array of features to display
   * @param {Object} point - Click point coordinates
   * @param {Function} onSelect - Callback when feature is selected
   */
  function show(features, point, onSelect) {
    console.log(
      "FeatureSelector.show called with",
      features.length,
      "features"
    );

    // Ensure UI is created
    if (!_activeSelector) {
      createFeatureSelectorUI();
    }

    // Use requestAnimationFrame for smooth performance
    requestAnimationFrame(() => {
      const container = _activeSelector;
      const listContainer = document.getElementById("feature-selector-list");

      if (!container || !listContainer) {
        console.error("Feature selector elements not found!");
        return;
      }

      // Clear previous list
      listContainer.innerHTML = "";

      // Limit features and prioritize them
      const prioritizedFeatures = prioritizeFeatures(features).slice(0, 5);

      // Store the point data
      container.dataset.lngLat = JSON.stringify(point);

      // Create all items at once using DocumentFragment
      const fragment = document.createDocumentFragment();

      prioritizedFeatures.forEach((feature, index) => {
        const item = document.createElement("div");
        item.className = "feature-selector-item";
        item.dataset.featureIndex = index;

        const featureName = getFeatureName(feature);

        item.innerHTML = `
          <div class="feature-selector-icon">${getFeatureIconHTML(
            feature
          )}</div>
          <div class="feature-selector-info">
            <div class="feature-selector-name">${featureName}</div>
            <div class="feature-selector-type">${
              feature.layer?.id || "Unknown layer"
            }</div>
          </div>
        `;

        // Add hover effect to highlight feature on map WITHOUT removing on mouseout
        item.addEventListener("mouseover", () => {
          // Just show this feature temporarily for hover effect, without clearing existing ones
          const tempHighlightId = `temp-highlight-${index}`;

          // Create a temporary highlight with higher opacity and priority
          const tempFeature = { ...feature };
          _map.addSource(tempHighlightId, {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: feature.geometry,
              properties: {},
            },
          });

          // Add a hover overlay highlight based on geometry type
          const geomType = feature.geometry.type;

          if (geomType === "Point" || geomType === "MultiPoint") {
            _map.addLayer({
              id: `${tempHighlightId}-layer`,
              type: "circle",
              source: tempHighlightId,
              paint: {
                "circle-radius": 14,
                "circle-color": "rgba(255,165,0,0.7)",
                "circle-stroke-color": "rgba(255,165,0,1)",
                "circle-stroke-width": 3,
              },
              layout: {
                visibility: "visible",
              },
            });
          } else if (
            geomType === "LineString" ||
            geomType === "MultiLineString"
          ) {
            _map.addLayer({
              id: `${tempHighlightId}-layer`,
              type: "line",
              source: tempHighlightId,
              paint: {
                "line-color": "rgba(255,165,0,1)",
                "line-width": 7,
                "line-opacity": 0.9,
              },
              layout: {
                visibility: "visible",
              },
            });
          } else if (geomType === "Polygon" || geomType === "MultiPolygon") {
            _map.addLayer({
              id: `${tempHighlightId}-layer`,
              type: "fill",
              source: tempHighlightId,
              paint: {
                "fill-color": "rgba(255,165,0,0.4)",
                "fill-outline-color": "rgba(255,165,0,1)",
              },
              layout: {
                visibility: "visible",
              },
            });
          }

          // Store the temp highlight ID for removal
          item._tempHighlightId = tempHighlightId;
        });

        // Remove temporary hover highlight on mouseout
        item.addEventListener("mouseout", () => {
          // Only remove the temporary highlight, not the permanent ones
          const tempHighlightId = item._tempHighlightId;
          if (tempHighlightId && _map) {
            // Remove the layer
            if (_map.getLayer(`${tempHighlightId}-layer`)) {
              _map.removeLayer(`${tempHighlightId}-layer`);
            }

            // Remove the source
            if (_map.getSource(tempHighlightId)) {
              _map.removeSource(tempHighlightId);
            }
          }
        });

        // Add click handler
        item.addEventListener("click", (event) => {
          event.stopPropagation();
          console.log("Feature selected:", feature);

          // Only hide the selector, don't remove highlights
          hideSelector();

          // Call the onSelect callback
          onSelect(feature);
        });

        fragment.appendChild(item);
      });

      listContainer.appendChild(fragment);

      // Position the selector
      const x = point.x ? point.x : window.innerWidth / 2;
      const y = point.y ? point.y : window.innerHeight / 2;

      container.style.left = `${x - 150}px`;
      container.style.top = `${y - 20}px`;
      container.style.display = "flex";
      container.style.position = "fixed";
      container.style.zIndex = "9999";

      // Prevent the selector from closing when clicking inside it
      container.addEventListener("click", (event) => {
        event.stopPropagation();
      });

      // Handle outside clicks with a delay
      _currentOutsideClickHandler = function (e) {
        if (_activeSelector && !_activeSelector.contains(e.target)) {
          console.log("Outside click detected, hiding selector");
          // Only hide the selector UI, don't remove highlights
          hideSelector();
          document.removeEventListener(
            "click",
            _currentOutsideClickHandler,
            true
          );
          _currentOutsideClickHandler = null;
        }
      };

      // Add outside click handler after a delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener("click", _currentOutsideClickHandler, true);
      }, 250);

      console.log("Feature selector shown successfully");
    });
  }

  /**
   * Hide just the selector UI without removing highlights
   */
  function hideSelector() {
    if (_activeSelector) {
      _activeSelector.style.display = "none";
    }

    // Remove any existing selector elements as well
    const existingSelectors = document.querySelectorAll("#feature-selector");
    existingSelectors.forEach((selector) => selector.remove());

    // Also hide radial menu if it's visible
    if (window.radialMenu) {
      window.radialMenu.hide();
    }

    // Remove event listeners to prevent memory leaks
    if (_currentOutsideClickHandler) {
      document.removeEventListener("click", _currentOutsideClickHandler, true);
      _currentOutsideClickHandler = null;
    }
  }

  /**
   * Hide the selector AND clear all highlights
   */
  function hide() {
    // First hide the selector UI
    hideSelector();

    // Then remove all highlights
    removeHighlight();
  }

  /**
   * Hide the current selector
   */
  function hide() {
    if (_activeSelector) {
      _activeSelector.style.display = "none";
    }

    // Remove any existing selector elements as well
    const existingSelectors = document.querySelectorAll("#feature-selector");
    existingSelectors.forEach((selector) => selector.remove());

    // Also hide radial menu if it's visible
    if (window.radialMenu) {
      window.radialMenu.hide();
    }

    // Remove highlight
    removeHighlight();

    // Remove event listeners to prevent memory leaks
    if (_currentOutsideClickHandler) {
      document.removeEventListener("click", _currentOutsideClickHandler, true);
      _currentOutsideClickHandler = null;
    }
  }

  /**
   * Highlight a feature on the map – works across VT tiles
   * @param {Object} feature  A MapLibre‐style feature (from queryRenderedFeatures / click)
   * @param {boolean} clearPrevious Whether to clear previous highlights (default: true)
   */
  function highlightFeature(feature, clearPrevious = true) {
    if (!feature || !feature.geometry) {
      console.log("[highlightFeature] No feature or geometry");
      return;
    }

    // Get the map instance if we don't have it yet
    if (!_map) {
      _map = window.interface?.map || App.Map.Init?.getMap();
      if (!_map) {
        console.error("[highlightFeature] Map not available");
        return;
      }
    }

    // Remove any existing highlight if requested
    if (clearPrevious) {
      removeHighlight();
    }

    // VT ID detection
    const geomType = feature.geometry.type;
    const sourceId = feature.layer?.source;
    const sourceLay = feature.layer?.["source-layer"];
    const featId = feature.id ?? feature.properties?.id ?? null;
    const hasVTId = !!sourceId && !!sourceLay && featId !== null;

    console.log("[highlightFeature] featId:", featId, "hasVTId:", hasVTId);

    // VECTOR-TILE ROUTE
    if (hasVTId) {
      console.log("[VT route] highlighting featId =", featId);

      const idFilter = ["all", ["==", ["id"], featId]];
      const insertBefore = feature.layer.id;

      // POINT / MULTIPOINT
      if (geomType === "Point" || geomType === "MultiPoint") {
        _map.addLayer(
          {
            id: "highlight-layer-point",
            type: "circle",
            source: sourceId,
            "source-layer": sourceLay,
            filter: idFilter,
            paint: {
              "circle-radius": 12,
              "circle-color": "rgba(255,255,0,0.6)",
              "circle-stroke-color": "rgba(255,255,0,1)",
              "circle-stroke-width": 3,
            },
          },
          insertBefore
        );
      }
      // LINESTRING / MULTILINESTRING
      else if (geomType === "LineString" || geomType === "MultiLineString") {
        _map.addLayer(
          {
            id: "highlight-layer-line",
            type: "line",
            source: sourceId,
            "source-layer": sourceLay,
            filter: idFilter,
            paint: {
              "line-color": "rgba(255,255,0,1)",
              "line-width": 6,
              "line-opacity": 0.8,
            },
          },
          insertBefore
        );
      }
      // POLYGON / MULTIPOLYGON
      else if (geomType === "Polygon" || geomType === "MultiPolygon") {
        _map.addLayer(
          {
            id: "highlight-layer-fill",
            type: "fill",
            source: sourceId,
            "source-layer": sourceLay,
            filter: idFilter,
            paint: {
              "fill-color": "rgba(255,255,0,0.3)",
              "fill-outline-color": "rgba(255,255,0,1)",
            },
          },
          insertBefore
        );

        _map.addLayer(
          {
            id: "highlight-layer-casing",
            type: "line",
            source: sourceId,
            "source-layer": sourceLay,
            filter: idFilter,
            paint: {
              "line-color": "rgba(255,255,0,1)",
              "line-width": 3,
            },
          },
          insertBefore
        );
      }
      return;
    }

    // GEOJSON FALLBACK
    console.log("[GeoJSON route] highlighting via ad-hoc source");

    try {
      _map.addSource("highlight-source", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: feature.geometry,
          properties: {},
        },
      });

      if (geomType === "Point" || geomType === "MultiPoint") {
        _map.addLayer({
          id: "highlight-layer-point",
          type: "circle",
          source: "highlight-source",
          paint: {
            "circle-radius": 12,
            "circle-color": "rgba(255,255,0,0.6)",
            "circle-stroke-color": "rgba(255,255,0,1)",
            "circle-stroke-width": 3,
          },
        });
      } else if (geomType === "LineString" || geomType === "MultiLineString") {
        _map.addLayer({
          id: "highlight-layer-line",
          type: "line",
          source: "highlight-source",
          paint: {
            "line-color": "rgba(255,255,0,1)",
            "line-width": 6,
            "line-opacity": 0.8,
          },
        });
      } else if (geomType === "Polygon" || geomType === "MultiPolygon") {
        _map.addLayer({
          id: "highlight-layer-fill",
          type: "fill",
          source: "highlight-source",
          paint: {
            "fill-color": "rgba(255,255,0,0.3)",
            "fill-outline-color": "rgba(255,255,0,1)",
          },
        });
        _map.addLayer({
          id: "highlight-layer-casing",
          type: "line",
          source: "highlight-source",
          paint: {
            "line-color": "rgba(255,255,0,1)",
            "line-width": 3,
          },
        });
      }
    } catch (err) {
      console.error("[highlightFeature] Error adding highlight:", err);
    }
  }

  /**
   * Remove any highlight layers / sources
   */
  function removeHighlight() {
    if (!_map) {
      _map = window.interface?.map || App.Map.Init?.getMap();
      if (!_map) return;
    }

    console.log("[removeHighlight] Removing highlight layers / source");

    [
      "highlight-layer-point",
      "highlight-layer-line",
      "highlight-layer-fill",
      "highlight-layer-casing",
    ].forEach((id) => _map.getLayer(id) && _map.removeLayer(id));

    if (_map.getSource("highlight-source")) {
      _map.removeSource("highlight-source");
    }
  }

  /**
   * Get a display name for a feature
   * @param {Object} feature - The map feature
   * @returns {String} - A name for the feature
   */
  function getFeatureName(feature) {
    if (!feature || !feature.properties) {
      return "Unnamed Feature";
    }

    // Try to find a name-like property
    const nameProps = ["name", "title", "label", "id", "description"];
    for (const prop of nameProps) {
      if (feature.properties[prop]) {
        return feature.properties[prop];
      }
    }

    // If no name found, use the feature ID or layer name
    if (feature.id) {
      return `Feature #${feature.id}`;
    }

    if (feature.layer && feature.layer.id) {
      return `${feature.layer.id} Feature`;
    }

    return "Unnamed Feature";
  }

  /**
   * Get feature icon HTML
   * @private
   */
  function getFeatureIconHTML(feature) {
    const type = feature.geometry?.type || "";
    switch (type.toLowerCase()) {
      case "point":
        return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>';
      case "linestring":
      case "multilinestring":
        return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>';
      case "polygon":
      case "multipolygon":
        return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/></svg>';
      default:
        return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    }
  }

  /**
   * Prioritize features based on importance
   * @param {Array} features - Array of features
   * @returns {Array} - Prioritized array of features
   */
  function prioritizeFeatures(features) {
    // Create a copy to avoid modifying the original
    const featuresCopy = [...features];

    // Define type priorities (lower is more important)
    const typePriority = {
      Point: 1,
      LineString: 2,
      Polygon: 3,
      MultiPoint: 4,
      MultiLineString: 5,
      MultiPolygon: 6,
    };

    // Sort features by type priority and then by layer ID
    return featuresCopy.sort((a, b) => {
      // First sort by geometry type priority
      if (a.geometry && b.geometry) {
        const priorityA = typePriority[a.geometry.type] || 10;
        const priorityB = typePriority[b.geometry.type] || 10;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
      }

      // Then sort by layer ID if available
      if (a.layer && b.layer && a.layer.id !== b.layer.id) {
        return a.layer.id.localeCompare(b.layer.id);
      }

      // Lastly, try to sort by id or properties
      if (a.id !== undefined && b.id !== undefined) {
        return a.id - b.id;
      }

      return 0;
    });
  }

  /**
   * Add styles for the feature selector
   */
  function addFeatureSelectorStyles() {
    console.log("addFeatureSelectorStyles called");

    if (document.getElementById("feature-selector-styles")) {
      console.log("Feature selector styles already exist");
      return;
    }

    const styleEl = document.createElement("style");
    styleEl.id = "feature-selector-styles";
    styleEl.textContent = `
      .feature-selector-container {
        position: absolute;
        width: 300px;
        max-height: 400px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
      }
      
      .feature-selector-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        background-color: #4682b4;
        color: white;
        font-weight: 500;
      }
      
      .feature-selector-title {
        font-size: 16px;
      }
      
      .feature-selector-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
        transition: opacity 0.2s;
      }
      
      .feature-selector-close:hover {
        opacity: 0.8;
      }
      
      .feature-selector-list {
        overflow-y: auto;
        max-height: 340px;
      }
      
      .feature-selector-item {
        display: flex;
        align-items: center;
        padding: 10px 15px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .feature-selector-item:hover {
        background-color: #f5f5f5;
      }
      
      .feature-selector-icon {
        margin-right: 12px;
        width: 32px;
        height: 32px;
        background-color: #f0f0f0;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #4682b4;
      }
      
      .feature-selector-info {
        flex: 1;
        min-width: 0;
      }
      
      .feature-selector-name {
        font-weight: 500;
        font-size: 14px;
        color: #333;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .feature-selector-type {
        font-size: 12px;
        color: #666;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      /* Tablet/mobile optimizations */
      @media (max-width: 768px) {
        .feature-selector-container {
          width: 85%;
          max-width: 350px;
        }
        
        .feature-selector-item {
          padding: 12px 15px;
        }
        
        .feature-selector-name {
          font-size: 15px;
        }
        
        .feature-selector-type {
          font-size: 13px;
        }
        
        .feature-selector-close {
          width: 32px;
          height: 32px;
          font-size: 24px;
        }
      }
    `;

    document.head.appendChild(styleEl);
    console.log("Feature selector styles added to document");
  }

  // Public API
  return {
    initialize: initialize,
    show: show,
    hide: hide,

    /**
     * Check if selector is currently visible
     */
    isVisible: function () {
      return (
        _activeSelector !== null && _activeSelector.style.display !== "none"
      );
    },

    /**
     * Debug function to check selector state
     */
    debug: function () {
      console.log("Feature Selector Debug Info:");
      console.log("Active selector:", _activeSelector);
      console.log("Selector visible:", this.isVisible());
      console.log("Map instance available:", !!_map);
    },

    /**
     * Test highlighting functionality
     */
    testHighlight: function () {
      const testFeature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            window.interface?.currentLocation?.[0] || 0,
            window.interface?.currentLocation?.[1] || 0,
          ],
        },
        properties: {
          name: "Test Feature",
        },
      };
      console.log("Testing highlight with:", testFeature);
      highlightFeature(testFeature);

      // Remove after 2 seconds
      setTimeout(() => {
        console.log("Removing test highlight");
        removeHighlight();
      }, 2000);
    },

    // Expose utility functions that might be needed externally
    getFeatureName: getFeatureName,
    highlightFeature: highlightFeature,
    removeHighlight: removeHighlight,
    prioritizeFeatures: prioritizeFeatures,
  };
})();

console.log("App.UI.FeatureSelector module loaded");

// Debug check
if (App.UI.FeatureSelector) {
  console.log(
    "✅ App.UI.FeatureSelector successfully created with methods:",
    Object.keys(App.UI.FeatureSelector)
  );
} else {
  console.error("❌ App.UI.FeatureSelector failed to create");
}
