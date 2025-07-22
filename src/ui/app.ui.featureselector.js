/**
 * Enhanced Feature selector UI component
 * Added support for single and multi-selection modes
 * @namespace App.UI.FeatureSelector
 */
App.UI = App.UI || {};
App.UI.FeatureSelector = (function () {
  console.log("App.UI.FeatureSelector module loading...");

  // Private variables
  var _activeSelector = null;
  var _map = null;
  var _currentOutsideClickHandler = null;
  // Track highlight layers and sources for proper cleanup
  var _highlightLayerIds = [];
  var _highlightSourceIds = [];
  // Track active highlighted features
  var _activeHighlights = [];
  // Selection mode - 'single' or 'multi' (default to single)
  var _selectionMode = "single";

  /**
   * Initialize the feature selector
   * @param {Object} map - MapLibre map instance
   */
  function initialize(map) {
    console.log("Feature selector initialize called");
    console.log("Map instance provided:", !!map);
    _map = map;
    console.log("Feature selector initialized with map:", !!_map);
    console.log("Map type:", _map ? _map.constructor.name : 'N/A');

    // Load saved selection mode from state if available
    if (App.Core && App.Core.State) {
      const savedMode = App.Core.State.get("ui.featureSelector.selectionMode");
      if (savedMode) {
        // Respect user's saved preference
        _selectionMode = savedMode;
        console.log(
          `Restored selection mode from user preference: ${_selectionMode}`
        );
      } else {
        // Store initial default mode (single)
        App.Core.State.set("ui.featureSelector.selectionMode", _selectionMode);
        console.log(
          `Set initial selection mode to single select: ${_selectionMode}`
        );
      }
    }

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
        if (data.features && data.features.length > 0) {
          // Filter features to only include those from selectable layers
          const selectableFeatures = filterSelectableFeatures(data.features);
          
          if (selectableFeatures.length > 1) {
            show(selectableFeatures, data.point, function (feature) {
              // Display feature in info panel
              if (window.objectInfoBridge) {
                window.objectInfoBridge.displayFeature(feature, true);
              }
            });
          } else if (selectableFeatures.length === 1) {
            // Single selectable feature, display directly
            if (window.objectInfoBridge) {
              window.objectInfoBridge.displayFeature(selectableFeatures[0], true);
            }
          }
          // If no selectable features, do nothing (click is ignored)
        }
      });
    } else {
      console.error("App.Core.Events not available");
    }
  }

  /**
   * Filter features to only include those from selectable layers
   * @param {Array} features - Array of features to filter
   * @returns {Array} Array of features from selectable layers
   */
  function filterSelectableFeatures(features) {
    if (!_map || !features || features.length === 0) {
      return features || [];
    }

    // Get layer selectability settings
    const layerSelectability = _map._layerSelectability || {};

    return features.filter(feature => {
      // Get the layer ID for this feature
      const layerId = feature.layer && feature.layer.id ? feature.layer.id : null;
      
      if (!layerId) {
        // If we can't determine the layer, allow selection by default
        return true;
      }

      // Check if this specific layer is selectable
      if (layerSelectability.hasOwnProperty(layerId)) {
        const isSelectable = layerSelectability[layerId];
        console.log(`Feature from layer ${layerId} selectability: ${isSelectable}`);
        return isSelectable;
      }

      // Check if the base layer (without suffixes) is selectable
      const baseLayerId = layerId.replace(/-points$|-lines$|-polygons-fill$|-polygons-stroke$|-layer$/, '');
      if (baseLayerId !== layerId && layerSelectability.hasOwnProperty(baseLayerId)) {
        const isSelectable = layerSelectability[baseLayerId];
        console.log(`Feature from base layer ${baseLayerId} (actual: ${layerId}) selectability: ${isSelectable}`);
        return isSelectable;
      }

      // For category-based layers, extract the category ID
      const categoryMatch = layerId.match(/^category-([a-f0-9-]+)-(points|lines|polygons-fill|polygons-stroke)$/);
      if (categoryMatch) {
        const categoryId = categoryMatch[1];
        const categoryLayerId = `category-${categoryId}`;
        
        // Check if the category is selectable
        if (layerSelectability.hasOwnProperty(categoryLayerId)) {
          const isSelectable = layerSelectability[categoryLayerId];
          console.log(`Feature from category ${categoryId} (layer: ${layerId}) selectability: ${isSelectable}`);
          return isSelectable;
        }
      }

      // Default to selectable if no specific setting found
      console.log(`No selectability setting found for layer ${layerId}, defaulting to selectable`);
      return true;
    });
  }

  /**
   * Set the selection mode
   * @param {string} mode - Either 'single' or 'multi'
   */
  function setSelectionMode(mode) {
    if (mode !== "single" && mode !== "multi") {
      console.error(
        `Invalid selection mode: ${mode}. Must be 'single' or 'multi'`
      );
      return;
    }

    // Only update if the mode is actually changing
    if (_selectionMode !== mode) {
      const previousMode = _selectionMode;
      _selectionMode = mode;

      // Store in state
      if (App.Core && App.Core.State) {
        App.Core.State.set("ui.featureSelector.selectionMode", mode);
      }

      console.log(`Selection mode changed from ${previousMode} to ${mode}`);

      // Trigger event so other components can react
      if (App.Core && App.Core.Events) {
        App.Core.Events.trigger("featureSelector:modeChanged", {
          previousMode: previousMode,
          newMode: mode,
        });
      }

      // If switching from multi to single and we have multiple highlights,
      // keep only the most recent one (if exists)
      if (mode === "single" && _activeHighlights.length > 1) {
        const lastFeature = _activeHighlights[_activeHighlights.length - 1];

        // Clear all highlights first
        removeHighlight();

        // Add back just the last selected feature
        if (lastFeature) {
          highlightFeature(lastFeature, true);

          // Also update state
          if (App.Core && App.Core.State) {
            App.Core.State.set("map.selectedFeatures", [lastFeature]);
            App.Core.State.set("map.lastSelectedFeature", lastFeature);
          }
        }
      }
    }
  }

  /**
   * Get the current selection mode
   * @returns {string} The current selection mode ('single' or 'multi')
   */
  function getSelectionMode() {
    return _selectionMode;
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
      hideSelector();
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
    // Filter features to only include those from selectable layers
    const selectableFeatures = filterSelectableFeatures(features);
    
    console.log(
      "FeatureSelector.show called with",
      features.length,
      "features,",
      selectableFeatures.length,
      "selectable"
    );
    console.log("Original features:", features);
    console.log("Selectable features:", selectableFeatures);
    console.log("Point:", point);
    console.log("_activeSelector exists:", !!_activeSelector);
    console.log("_map exists:", !!_map);

    // If no selectable features, don't show selector
    if (selectableFeatures.length === 0) {
      console.log("No selectable features, not showing selector");
      return;
    }

    // Use the filtered features from here on
    features = selectableFeatures;

    // Ensure map is available
    if (!_map) {
      console.warn("Map not initialized, trying to get it...");
      _map = window.interface?.map || App.Map.Init?.getMap();
      if (!_map) {
        console.error("Cannot show feature selector - map not available");
        return;
      }
    }

    // Ensure UI is created
    if (!_activeSelector) {
      console.log("Creating feature selector UI...");
      createFeatureSelectorUI();
      
      // Double check it was created
      if (!_activeSelector) {
        console.error("Failed to create feature selector UI");
        return;
      }
    }

    // Use requestAnimationFrame for smooth performance
    const showSelector = () => {
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
        const layerName = getFeatureLayerName(feature);

        item.innerHTML = `
        <div class="feature-selector-icon">${getFeatureIconHTML(feature)}</div>
        <div class="feature-selector-info">
          <div class="feature-selector-name">${featureName}</div>
          <div class="feature-selector-type">${layerName}</div>
        </div>
      `;

        // Add hover effect using the improved _applyHoverHighlight function
        item.addEventListener("mouseover", () => {
          // Create a unique ID for this hover highlight
          const uniqueHoverId = `hover-${index}-${Math.random()
            .toString(36)
            .substring(2, 10)}`;

          // Store the hover ID on the item for removal
          item._hoverHighlightId = uniqueHoverId;

          // Apply hover highlight using our helper function
          _applyHoverHighlight(feature, uniqueHoverId);
        });

        // Remove temporary hover highlight on mouseout
        item.addEventListener("mouseout", () => {
          // Get the hover ID stored on the item
          const hoverId = item._hoverHighlightId;
          if (hoverId) {
            // Remove just this hover highlight
            _removeHoverHighlight(hoverId);
            item._hoverHighlightId = null;
          }
        });

        // Add click handler
        item.addEventListener("click", (event) => {
          event.stopPropagation();
          console.log("Feature selected:", feature);

          // Remove any hover highlights
          const hoverId = item._hoverHighlightId;
          if (hoverId) {
            _removeHoverHighlight(hoverId);
          }

          // Hide the selector UI without clearing permanent highlights
          hideSelector();

          // For single selection mode, clear previous selections first
          const clearPrevious = _selectionMode === "single";

          // Add this feature as a permanent highlight
          highlightFeature(feature, clearPrevious);

          // Call the onSelect callback
          onSelect(feature);
        });

        fragment.appendChild(item);
      });

      listContainer.appendChild(fragment);

      // Position the selector
      const x = point.x ? point.x : window.innerWidth / 2;
      const y = point.y ? point.y : window.innerHeight / 2;

      console.log("Positioning selector at:", { x, y });
      container.style.left = `${x - 150}px`;
      container.style.top = `${y - 20}px`;
      container.style.display = "flex";
      container.style.position = "fixed";
      container.style.zIndex = "9999";
      container.style.visibility = "visible"; // Ensure visibility
      container.style.opacity = "1"; // Ensure opacity
      container.style.pointerEvents = "auto"; // Ensure it can receive clicks
      
      console.log("Container display style:", container.style.display);
      console.log("Container computed style:", window.getComputedStyle(container).display);
      console.log("Container visible:", container.offsetParent !== null);
      
      // Force a red border for debugging visibility
      container.style.border = "3px solid red";
      container.style.backgroundColor = "white"; // Ensure background is visible

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

          // Trigger an event to notify other components that the selector was closed
          if (App.Core && App.Core.Events) {
            App.Core.Events.trigger("featureSelector:closed", {});
          }
        }
      };

      // Add outside click handler after a delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener("click", _currentOutsideClickHandler, true);
      }, 250);

      console.log("Feature selector shown successfully");
      
      // Final check
      setTimeout(() => {
        const finalContainer = document.getElementById("feature-selector-container");
        if (finalContainer) {
          console.log("Final container check:");
          console.log("- Display:", finalContainer.style.display);
          console.log("- Visibility:", finalContainer.style.visibility);
          console.log("- Opacity:", finalContainer.style.opacity);
          console.log("- Z-index:", finalContainer.style.zIndex);
          console.log("- Position:", finalContainer.style.position);
          console.log("- Left:", finalContainer.style.left);
          console.log("- Top:", finalContainer.style.top);
          console.log("- Children count:", finalContainer.children.length);
          console.log("- BoundingRect:", finalContainer.getBoundingClientRect());
        } else {
          console.error("Container not found in final check!");
        }
      }, 100);
    };
    
    // Try to show immediately, fallback to setTimeout if requestAnimationFrame is not available
    try {
      if (window.requestAnimationFrame) {
        requestAnimationFrame(showSelector);
      } else {
        showSelector();
      }
    } catch (e) {
      console.error("Error showing selector:", e);
      // Fallback to direct call
      showSelector();
    }
  }

  /**
   * Apply hover highlight using the same mechanism as regular highlights
   * @param {Object} feature - Feature to highlight
   * @param {string} uniqueId - Unique ID for this hover highlight
   * @private
   */
  function _applyHoverHighlight(feature, uniqueId) {
    if (!feature || !feature.geometry || !_map) return;

    try {
      const geomType = feature.geometry.type;
      const featureSourceId = feature.layer?.source;
      const sourceLay = feature.layer?.["source-layer"];
      const featId = feature.id ?? feature.properties?.id ?? null;
      const hasVTId = !!featureSourceId && !!sourceLay && featId !== null;

      // Create a hover highlight source ID
      const hoverSourceId = `hover-source-${uniqueId}`;

      // For vector tiles
      if (hasVTId) {
        const idFilter = ["all", ["==", ["id"], featId]];
        const insertBefore = feature.layer.id;

        // POINT / MULTIPOINT
        if (geomType === "Point" || geomType === "MultiPoint") {
          const layerId = `hover-layer-${uniqueId}`;
          _map.addLayer(
            {
              id: layerId,
              type: "circle",
              source: featureSourceId,
              "source-layer": sourceLay,
              filter: idFilter,
              paint: {
                "circle-radius": 14, // Larger radius for hover
                "circle-color": "rgba(255,165,0,0.6)", // Orange for hover
                "circle-stroke-color": "rgba(255,165,0,1)",
                "circle-stroke-width": 3,
              },
            },
            insertBefore
          );

          // Track this layer for removal
          _hoveredLayers.push(layerId);
        }
        // LINESTRING / MULTILINESTRING
        else if (geomType === "LineString" || geomType === "MultiLineString") {
          const layerId = `hover-layer-${uniqueId}`;
          _map.addLayer(
            {
              id: layerId,
              type: "line",
              source: featureSourceId,
              "source-layer": sourceLay,
              filter: idFilter,
              paint: {
                "line-color": "rgba(255,165,0,1)", // Orange for hover
                "line-width": 7, // Wider for hover
                "line-opacity": 0.9,
              },
            },
            insertBefore
          );

          // Track this layer for removal
          _hoveredLayers.push(layerId);
        }
        // POLYGON / MULTIPOLYGON
        else if (geomType === "Polygon" || geomType === "MultiPolygon") {
          const fillLayerId = `hover-fill-${uniqueId}`;
          const strokeLayerId = `hover-stroke-${uniqueId}`;

          _map.addLayer(
            {
              id: fillLayerId,
              type: "fill",
              source: featureSourceId,
              "source-layer": sourceLay,
              filter: idFilter,
              paint: {
                "fill-color": "rgba(255,165,0,0.4)", // Orange for hover
                "fill-outline-color": "rgba(255,165,0,1)",
              },
            },
            insertBefore
          );

          _map.addLayer(
            {
              id: strokeLayerId,
              type: "line",
              source: featureSourceId,
              "source-layer": sourceLay,
              filter: idFilter,
              paint: {
                "line-color": "rgba(255,165,0,1)", // Orange for hover
                "line-width": 3,
              },
            },
            insertBefore
          );

          // Track these layers for removal
          _hoveredLayers.push(fillLayerId, strokeLayerId);
        }
      }
      // For GeoJSON features
      else {
        // Create new source for this feature
        _map.addSource(hoverSourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: feature.geometry,
            properties: {},
          },
        });

        // Track this source for removal
        _hoveredSources.push(hoverSourceId);

        if (geomType === "Point" || geomType === "MultiPoint") {
          const layerId = `hover-layer-${uniqueId}`;
          _map.addLayer({
            id: layerId,
            type: "circle",
            source: hoverSourceId,
            paint: {
              "circle-radius": 14, // Larger radius for hover
              "circle-color": "rgba(255,165,0,0.6)", // Orange for hover
              "circle-stroke-color": "rgba(255,165,0,1)",
              "circle-stroke-width": 3,
            },
          });

          // Track this layer for removal
          _hoveredLayers.push(layerId);
        } else if (
          geomType === "LineString" ||
          geomType === "MultiLineString"
        ) {
          const layerId = `hover-layer-${uniqueId}`;
          _map.addLayer({
            id: layerId,
            type: "line",
            source: hoverSourceId,
            paint: {
              "line-color": "rgba(255,165,0,1)", // Orange for hover
              "line-width": 7, // Wider for hover
              "line-opacity": 0.9,
            },
          });

          // Track this layer for removal
          _hoveredLayers.push(layerId);
        } else if (geomType === "Polygon" || geomType === "MultiPolygon") {
          const fillLayerId = `hover-fill-${uniqueId}`;
          const strokeLayerId = `hover-stroke-${uniqueId}`;

          _map.addLayer({
            id: fillLayerId,
            type: "fill",
            source: hoverSourceId,
            paint: {
              "fill-color": "rgba(255,165,0,0.4)", // Orange for hover
              "fill-outline-color": "rgba(255,165,0,1)",
            },
          });

          _map.addLayer({
            id: strokeLayerId,
            type: "line",
            source: hoverSourceId,
            paint: {
              "line-color": "rgba(255,165,0,1)", // Orange for hover
              "line-width": 3,
            },
          });

          // Track these layers for removal
          _hoveredLayers.push(fillLayerId, strokeLayerId);
        }
      }
    } catch (err) {
      console.error(
        "[_applyHoverHighlight] Error adding hover highlight:",
        err
      );
    }
  }

  /**
   * Remove hover highlight using ID
   * @param {string} hoverId - Unique ID for this hover highlight
   * @private
   */
  function _removeHoverHighlight(hoverId) {
    if (!_map) return;

    try {
      // Remove hover layers with this ID
      const hoverLayerIds = _hoveredLayers.filter((id) => id.includes(hoverId));
      hoverLayerIds.forEach((id) => {
        if (_map.getLayer(id)) {
          _map.removeLayer(id);
        }
      });

      // Remove from tracking array
      _hoveredLayers = _hoveredLayers.filter((id) => !id.includes(hoverId));

      // Remove hover source if exists
      const hoverSourceId = `hover-source-${hoverId}`;
      if (_map.getSource(hoverSourceId)) {
        _map.removeSource(hoverSourceId);

        // Remove from tracking array
        _hoveredSources = _hoveredSources.filter((id) => id !== hoverSourceId);
      }
    } catch (err) {
      console.error(
        "[_removeHoverHighlight] Error removing hover highlight:",
        err
      );
    }
  }

  // Add tracking arrays for hover highlights to the private variables
  var _hoveredLayers = [];
  var _hoveredSources = [];

  /**
   * Remove all highlights or remove just a specific feature highlight
   * @param {Object|null} feature - Optional feature to remove highlight for (if null, remove all)
   */
  function removeHighlight(feature = null) {
    if (!_map) {
      _map = window.interface?.map || App.Map.Init?.getMap();
      if (!_map) return;
    }

    // If a specific feature is provided, only remove that one
    if (feature) {
      console.log(
        "[removeHighlight] Removing highlight for specific feature",
        feature
      );

      // Find feature in active highlights
      const featureId =
        feature.id ||
        feature.properties?.id ||
        JSON.stringify(feature.geometry?.coordinates);

      const highlightIndex = _activeHighlights.findIndex((f) => {
        const fId =
          f.id || f.properties?.id || JSON.stringify(f.geometry?.coordinates);
        return fId === featureId;
      });

      if (highlightIndex !== -1) {
        // Remove from active highlights array
        _activeHighlights.splice(highlightIndex, 1);

        // Need to remove and rebuild all highlights since we don't track which
        // layers belong to which feature. This is a simplification.
        const savedHighlights = [..._activeHighlights];

        // Remove all visible highlights
        _removeAllVisibleHighlights();

        // Re-add remaining highlights
        savedHighlights.forEach((f) => {
          highlightFeature(f, false); // false = don't clear existing
        });
      }

      return;
    }

    // No feature specified, remove all highlights
    console.log("[removeHighlight] Removing all highlight layers / sources");

    // Clear active highlights array
    _activeHighlights = [];

    // Remove all visible highlight layers and sources
    _removeAllVisibleHighlights();
  }

  /**
   * Helper to remove all visible highlight layers and sources
   * @private
   */
  function _removeAllVisibleHighlights() {
    // Remove all tracked highlight layers
    _highlightLayerIds.forEach((layerId) => {
      if (_map.getLayer(layerId)) {
        try {
          _map.removeLayer(layerId);
        } catch (e) {
          console.warn(`Error removing layer ${layerId}:`, e);
        }
      }
    });
    _highlightLayerIds = [];

    // Remove all tracked highlight sources
    _highlightSourceIds.forEach((sourceId) => {
      if (_map.getSource(sourceId)) {
        try {
          _map.removeSource(sourceId);
        } catch (e) {
          console.warn(`Error removing source ${sourceId}:`, e);
        }
      }
    });
    _highlightSourceIds = [];

    // Also remove any hover highlights
    _hoveredLayers.forEach((layerId) => {
      if (_map.getLayer(layerId)) {
        try {
          _map.removeLayer(layerId);
        } catch (e) {
          console.warn(`Error removing hover layer ${layerId}:`, e);
        }
      }
    });
    _hoveredLayers = [];

    _hoveredSources.forEach((sourceId) => {
      if (_map.getSource(sourceId)) {
        try {
          _map.removeSource(sourceId);
        } catch (e) {
          console.warn(`Error removing hover source ${sourceId}:`, e);
        }
      }
    });
    _hoveredSources = [];

    // Also remove any old-style highlight layers (for backward compatibility)
    [
      "highlight-layer-point",
      "highlight-layer-line",
      "highlight-layer-fill",
      "highlight-layer-casing",
    ].forEach((id) => {
      if (_map.getLayer(id)) {
        try {
          _map.removeLayer(id);
        } catch (e) {
          console.warn(`Error removing legacy layer ${id}:`, e);
        }
      }
    });

    if (_map.getSource("highlight-source")) {
      try {
        _map.removeSource("highlight-source");
      } catch (e) {
        console.warn("Error removing legacy source highlight-source:", e);
      }
    }
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
   * Handle Ctrl/Cmd + click for multiselect
   * @param {Object} feature - Feature to highlight
   * @param {Object} event - Mouse event
   * @returns {boolean} True if handled as multiselect
   */
  function handleMultiSelectClick(feature, event) {
    // Check if ctrl/cmd key is pressed and we're in multi mode
    if (_selectionMode === "multi" && (event.ctrlKey || event.metaKey)) {
      // Check if the feature is already highlighted
      const featureId =
        feature.id ||
        feature.properties?.id ||
        JSON.stringify(feature.geometry?.coordinates);

      const isAlreadyHighlighted = _activeHighlights.some((f) => {
        const fId =
          f.id || f.properties?.id || JSON.stringify(f.geometry?.coordinates);
        return fId === featureId;
      });

      if (isAlreadyHighlighted) {
        // Remove this highlight
        removeHighlight(feature);
      } else {
        // Add this highlight without clearing
        highlightFeature(feature, false);
      }

      return true; // Handled as multiselect
    }

    return false; // Not handled as multiselect
  }

  /**
   * Highlight a feature on the map – works across VT tiles
   * @param {Object} feature - A MapLibre‐style feature (from queryRenderedFeatures / click)
   * @param {boolean} clearPrevious - Whether to clear previous highlights (default: true)
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

    // If in single selection mode, force clearPrevious to true
    if (_selectionMode === "single") {
      clearPrevious = true;
    }

    // Remove any existing highlight if requested
    if (clearPrevious) {
      removeHighlight();
      _activeHighlights = [];
    }

    // Check if this feature is already highlighted to prevent duplicates
    const featureId =
      feature.id ||
      feature.properties?.id ||
      JSON.stringify(feature.geometry.coordinates);

    const isDuplicate = _activeHighlights.some(
      (f) =>
        f.id === featureId ||
        (f.geometry?.coordinates &&
          feature.geometry?.coordinates &&
          JSON.stringify(f.geometry.coordinates) ===
            JSON.stringify(feature.geometry.coordinates))
    );

    if (isDuplicate) {
      console.log("Feature already highlighted, skipping");
      return;
    }

    // Add to active highlights array
    _activeHighlights.push({
      ...feature,
      id: featureId,
    });

    // Update state with selected features
    if (App.Core && App.Core.State) {
      App.Core.State.set("map.selectedFeatures", _activeHighlights);
      // Also update last selected feature
      App.Core.State.set("map.lastSelectedFeature", feature);
    }

    try {
      // Generate a unique layer ID for this feature to prevent conflicts
      const geomType = feature.geometry.type;
      const featureSourceId = feature.layer?.source;
      const sourceLay = feature.layer?.["source-layer"];
      const featId = feature.id ?? feature.properties?.id ?? null;
      const hasVTId = !!featureSourceId && !!sourceLay && featId !== null;

      console.log("[highlightFeature] featId:", featId, "hasVTId:", hasVTId);

      // Create a unique ID for each highlight layer to allow multiple highlights
      const uniqueId = Math.random().toString(36).substring(2, 10);

      // VECTOR-TILE ROUTE
      if (hasVTId) {
        console.log("[VT route] highlighting featId =", featId);

        const idFilter = ["all", ["==", ["id"], featId]];
        const insertBefore = feature.layer.id;

        // POINT / MULTIPOINT
        if (geomType === "Point" || geomType === "MultiPoint") {
          const layerId = `highlight-layer-point-${uniqueId}`;
          if (!_map.getLayer(layerId)) {
            _map.addLayer(
              {
                id: layerId,
                type: "circle",
                source: featureSourceId,
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

            // Store the layer ID for later removal
            _highlightLayerIds.push(layerId);
          }
        }
        // LINESTRING / MULTILINESTRING
        else if (geomType === "LineString" || geomType === "MultiLineString") {
          const layerId = `highlight-layer-line-${uniqueId}`;
          if (!_map.getLayer(layerId)) {
            _map.addLayer(
              {
                id: layerId,
                type: "line",
                source: featureSourceId,
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

            // Store the layer ID for later removal
            _highlightLayerIds.push(layerId);
          }
        }
        // POLYGON / MULTIPOLYGON
        else if (geomType === "Polygon" || geomType === "MultiPolygon") {
          const fillLayerId = `highlight-layer-fill-${uniqueId}`;
          const casingLayerId = `highlight-layer-casing-${uniqueId}`;

          if (!_map.getLayer(fillLayerId)) {
            _map.addLayer(
              {
                id: fillLayerId,
                type: "fill",
                source: featureSourceId,
                "source-layer": sourceLay,
                filter: idFilter,
                paint: {
                  "fill-color": "rgba(255,255,0,0.3)",
                  "fill-outline-color": "rgba(255,255,0,1)",
                },
              },
              insertBefore
            );

            // Store the layer ID for later removal
            _highlightLayerIds.push(fillLayerId);
          }

          if (!_map.getLayer(casingLayerId)) {
            _map.addLayer(
              {
                id: casingLayerId,
                type: "line",
                source: featureSourceId,
                "source-layer": sourceLay,
                filter: idFilter,
                paint: {
                  "line-color": "rgba(255,255,0,1)",
                  "line-width": 3,
                },
              },
              insertBefore
            );

            // Store the layer ID for later removal
            _highlightLayerIds.push(casingLayerId);
          }
        }
        return; // job done – no need to create a GeoJSON source
      }

      // GEOJSON FALLBACK
      console.log("[GeoJSON route] highlighting via ad-hoc source");

      // Use a different variable name for this sourceId
      const highlightSourceId = `highlight-source-${uniqueId}`;

      // Create new source for this feature
      _map.addSource(highlightSourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: feature.geometry,
          properties: {},
        },
      });

      // Store the source ID for later removal
      _highlightSourceIds.push(highlightSourceId);

      if (geomType === "Point" || geomType === "MultiPoint") {
        const layerId = `highlight-layer-point-${uniqueId}`;
        _map.addLayer({
          id: layerId,
          type: "circle",
          source: highlightSourceId,
          paint: {
            "circle-radius": 12,
            "circle-color": "rgba(255,255,0,0.6)",
            "circle-stroke-color": "rgba(255,255,0,1)",
            "circle-stroke-width": 3,
          },
        });
        _highlightLayerIds.push(layerId);
      } else if (geomType === "LineString" || geomType === "MultiLineString") {
        const layerId = `highlight-layer-line-${uniqueId}`;
        _map.addLayer({
          id: layerId,
          type: "line",
          source: highlightSourceId,
          paint: {
            "line-color": "rgba(255,255,0,1)",
            "line-width": 6,
            "line-opacity": 0.8,
          },
        });
        _highlightLayerIds.push(layerId);
      } else if (geomType === "Polygon" || geomType === "MultiPolygon") {
        const fillLayerId = `highlight-layer-fill-${uniqueId}`;
        _map.addLayer({
          id: fillLayerId,
          type: "fill",
          source: highlightSourceId,
          paint: {
            "fill-color": "rgba(255,255,0,0.3)",
            "fill-outline-color": "rgba(255,255,0,1)",
          },
        });
        _highlightLayerIds.push(fillLayerId);

        const casingLayerId = `highlight-layer-casing-${uniqueId}`;
        _map.addLayer({
          id: casingLayerId,
          type: "line",
          source: highlightSourceId,
          paint: {
            "line-color": "rgba(255,255,0,1)",
            "line-width": 3,
          },
        });
        _highlightLayerIds.push(casingLayerId);
      }
    } catch (err) {
      console.error("[highlightFeature] Error adding highlight:", err);
    }
  }

  /**
   * Add a new highlighted feature without clearing previous highlights
   * @param {Object} feature - Feature to highlight
   */
  function addHighlight(feature) {
    // In single mode, we should still replace the existing highlight
    if (_selectionMode === "single") {
      highlightFeature(feature, true);
    } else {
      highlightFeature(feature, false);
    }
  }

  /**
   * Highlight multiple features at once
   * @param {Array} features - Array of features to highlight
   */
  function highlightFeatures(features) {
    if (!features || !features.length) return;

    // In single selection mode, only highlight the last feature
    if (_selectionMode === "single") {
      highlightFeature(features[features.length - 1], true);
      return;
    }

    // Clear existing highlights
    removeHighlight();

    // Add each feature
    features.forEach((feature) => {
      highlightFeature(feature, false);
    });
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
    hideSelector: hideSelector,

    /**
     * Check if selector is currently visible
     */
    isVisible: function () {
      return (
        _activeSelector !== null && _activeSelector.style.display !== "none"
      );
    },

    /**
     * Set the selection mode ('single' or 'multi')
     * @param {string} mode - 'single' or 'multi'
     */
    setSelectionMode: setSelectionMode,

    /**
     * Get current selection mode
     * @returns {string} - 'single' or 'multi'
     */
    getSelectionMode: getSelectionMode,

    /**
     * Toggle between selection modes
     */
    toggleSelectionMode: function () {
      const newMode = _selectionMode === "single" ? "multi" : "single";
      setSelectionMode(newMode);
      return newMode;
    },

    /**
     * Debug function to check selector state
     */
    debug: function () {
      console.log("Feature Selector Debug Info:");
      console.log("Active selector:", _activeSelector);
      console.log("Selector visible:", this.isVisible());
      console.log("Map instance available:", !!_map);
      console.log("Active highlights:", _activeHighlights);
      console.log("Highlight layer IDs:", _highlightLayerIds);
      console.log("Highlight source IDs:", _highlightSourceIds);
      console.log("Selection mode:", _selectionMode);
    },

    /**
     * Handle multiselect click with Ctrl/Cmd key
     */
    handleMultiSelectClick: handleMultiSelectClick,

    // Expose utility functions that might be needed externally
    getFeatureName: getFeatureName,
    highlightFeature: highlightFeature,
    removeHighlight: removeHighlight,
    addHighlight: addHighlight,
    highlightFeatures: highlightFeatures,
    prioritizeFeatures: prioritizeFeatures,

    // Get active highlights
    getActiveHighlights: function () {
      return [..._activeHighlights];
    },

    /**
     * Get count of selected features
     * @returns {number} - Number of selected features
     */
    getSelectionCount: function () {
      return _activeHighlights.length;
    },
  };

  /**
   * Get a display name for the feature's layer
   * @param {Object} feature - The map feature
   * @returns {String} - A friendly name for the layer
   */
  function getFeatureLayerName(feature) {
    if (!feature || !feature.layer || !feature.layer.id) {
      return "Unknown layer";
    }

    const layerId = feature.layer.id;

    // Handle category-based layers
    const categoryMatch = layerId.match(/^category-([a-f0-9-]+)-(points|lines|polygons-fill|polygons-stroke)$/);
    if (categoryMatch) {
      const categoryId = categoryMatch[1];
      const geometryType = categoryMatch[2];
      
      // Try to get the category name from the layer management system
      if (App.Map && App.Map.Layers && App.Map.Layers.getCategoryById) {
        const category = App.Map.Layers.getCategoryById(categoryId);
        if (category && category.name) {
          // Format the geometry type nicely
          const typeLabel = geometryType.replace(/-fill|-stroke/g, '').replace(/s$/, '');
          return `${category.name} (${typeLabel})`;
        }
      }
      
      // Fallback: use the category ID
      return `Category ${categoryId.substring(0, 8)}...`;
    }

    // For other layers, try to make the ID more readable
    return layerId
      .replace(/-layer$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
})();

// Update App.Map.Events to work with the selection modes
App.Map.Events = (function () {
  // Use the existing Events module and extend it
  const module = App.Map.Events;

  // Store the original _handleMapClick method
  const originalHandleMapClick = module._handleMapClick;

  // Override the method to add selection mode handling
  module._handleMapClick = function (e) {
    const now = Date.now();
    const currentCoords = `${e.lngLat.lng.toFixed(8)},${e.lngLat.lat.toFixed(
      8
    )}`;

    // Prevent duplicate clicks using the existing debounce mechanism
    if (
      module._lastClickTime &&
      now - module._lastClickTime < module._debounceTime &&
      currentCoords === module._lastClickCoords
    ) {
      console.log("Duplicate click prevented");
      return;
    }

    module._lastClickTime = now;
    module._lastClickCoords = currentCoords;

    try {
      // Hide any existing feature selector first
      if (App.UI.FeatureSelector && App.UI.FeatureSelector.isVisible) {
        if (App.UI.FeatureSelector.isVisible()) {
          App.UI.FeatureSelector.hideSelector(); // Just hide UI without clearing highlights
          return; // Don't process the click further if we just closed the selector
        }
      }

      const features = module._map.queryRenderedFeatures(e.point);

      if (features && features.length > 0) {
        console.log(`Found ${features.length} features`);

        if (features.length === 1) {
          // Check for Ctrl/Cmd key for multiselect
          if (App.UI.FeatureSelector.handleMultiSelectClick(features[0], e)) {
            // Handled as multiselect operation
            console.log("Handled as multiselect operation");
          } else {
            // Regular selection
            const selectionMode = App.UI.FeatureSelector.getSelectionMode();
            const clearPrevious = selectionMode === "single";

            console.log(
              `Selection mode: ${selectionMode}, clearPrevious: ${clearPrevious}`
            );

            // Display the feature (highlighting)
            App.UI.FeatureSelector.highlightFeature(features[0], clearPrevious);

            // Show in sidebar or info panel
            _displayFeatureInfo(features[0], e);
          }
        } else {
          // Multiple features - show selector
          console.log("Showing feature selector for multiple features");

          // Ensure the feature selector is available
          if (App.UI.FeatureSelector) {
            App.UI.FeatureSelector.show(
              features,
              e.point,
              function (selectedFeature) {
                // If ctrl/cmd key is pressed in multi-select mode
                if (
                  App.UI.FeatureSelector.handleMultiSelectClick(
                    selectedFeature,
                    e
                  )
                ) {
                  // Handled as multiselect operation
                  console.log("Handled as multiselect operation from selector");
                } else {
                  // Regular selection - respect selection mode
                  const selectionMode =
                    App.UI.FeatureSelector.getSelectionMode();
                  const clearPrevious = selectionMode === "single";

                  // Display the feature (highlighting)
                  App.UI.FeatureSelector.highlightFeature(
                    selectedFeature,
                    clearPrevious
                  );

                  // Show in sidebar or info panel
                  _displayFeatureInfo(selectedFeature, e);
                }
              }
            );
          } else {
            console.error("Feature selector module not available");
            // Fallback: display the first feature
            _displayFeatureInfo(features[0], e);
          }
        }
      } else {
        console.log("Map clicked at:", e.lngLat);

        // Clear selection if clicking on empty space
        App.UI.FeatureSelector.removeHighlight();

        App.Core.Events.trigger("map.clicked", {
          lngLat: e.lngLat,
          point: e.point,
        });

        // Notify bridge
        if (window.interface && window.interface.bridge) {
          const latLngPoint = {
            lat: e.lngLat.lat,
            lng: e.lngLat.lng,
            x: e.point.x,
            y: e.point.y,
          };
          window.interface.bridge.onMapClicked(latLngPoint, latLngPoint);
        }
      }
    } catch (error) {
      console.error("Error in click handler:", error);
    }
  };

  // Helper function to display feature info in UI panels
  function _displayFeatureInfo(feature, e) {
    if (!feature) return;

    console.log("Displaying feature info:", feature);

    // Open right sidebar
    const rightDrawer = document.getElementById("right1-drawer");
    if (rightDrawer) {
      rightDrawer.show();
    }

    // Display feature in object info component
    const objectInfo = document.querySelector("object-info");
    if (objectInfo) {
      // Wait for the component to be defined
      customElements.whenDefined('object-info').then(() => {
        if (typeof objectInfo.setFeature === 'function') {
          console.log("Setting feature in object-info component:", feature);
          objectInfo.setFeature(feature);
        } else {
          console.error("setFeature method missing on object-info component");
        }
      }).catch(err => {
        console.error("Error waiting for object-info component:", err);
      });
    } else {
      console.error("Object info component not found in DOM");
    }

    // Also use objectInfoBridge if available
    if (window.objectInfoBridge) {
      window.objectInfoBridge.displayFeature(JSON.stringify(feature), true);
    }

    // Trigger event
    App.Core.Events.trigger("feature.selected", {
      feature: feature,
      layer: feature.layer?.id,
      lngLat: e.lngLat,
      point: e.point,
    });

    // Notify bridge
    if (window.interface && window.interface.bridge) {
      window.interface.bridge.onObjectClicked(
        feature.properties?.id || `${feature.layer?.id}_${feature.id}`
      );
    }
  }

  // Add a clearAllSelections method
  module.clearAllSelections = function () {
    App.UI.FeatureSelector.removeHighlight();

    // Close the feature info sidebar if open
    const rightDrawer = document.getElementById("right1-drawer");
    if (rightDrawer) {
      rightDrawer.hide();
    }

    // Clear state
    if (App.Core.State) {
      App.Core.State.set("map.lastSelectedFeature", null);
      App.Core.State.set("map.selectedFeatures", []);
    }

    // Trigger event
    if (App.Core && App.Core.Events) {
      App.Core.Events.trigger("features.cleared", {});
    }
  };

  return module;
})();

// Add test function to window for debugging
window.testFeatureSelector = function() {
  console.log("Testing feature selector...");
  
  // Create mock features
  const mockFeatures = [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [0, 0] },
      properties: { name: "Test Feature 1", id: "test1" },
      layer: { id: "test-layer-1" }
    },
    {
      type: "Feature", 
      geometry: { type: "Point", coordinates: [0, 0] },
      properties: { name: "Test Feature 2", id: "test2" },
      layer: { id: "test-layer-2" }
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [0, 0] }, 
      properties: { name: "Test Feature 3", id: "test3" },
      layer: { id: "test-layer-3" }
    }
  ];
  
  // Show the selector in the center of the screen
  App.UI.FeatureSelector.show(
    mockFeatures,
    { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    function(selectedFeature) {
      console.log("Test: Feature selected:", selectedFeature);
    }
  );
};

console.log("App.UI.FeatureSelector with selection modes loaded");
console.log("Test with: window.testFeatureSelector()");
