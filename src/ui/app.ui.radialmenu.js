/**
 * Radial Menu functionality
 * @namespace App.UI.RadialMenu
 */
App.UI = App.UI || {};
App.UI.RadialMenu = (function () {
  // Private variables
  var _map = null;
  var _events = null;
  var _config = null;
  var _radialMenu = null;
  var _menuItems = [];
  var _isMenuOpen = false;
  var _currentFeature = null;
  var _defaultSize = 400;
  var _menuContainer = null;

  /**
   * Default menu items for main radial menu
   * @private
   */
  function _getDefaultMenuItems() {
    return [
      {
        id: "select-feature",
        title: App.I18n ? App.I18n.t('radialMenu.select') : "Select",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 3 7 7"/><path d="m21 21-7-7"/><path d="m11 13 9 9"/><path d="m13 11-9-9"/><path d="m17 17-5-5"/></svg>',
      },
      {
        id: "manual-collection",
        title: App.I18n ? App.I18n.t('radialMenu.collect') : "Collect",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize-icon lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
      },
      {
        id: "construct",
        title: App.I18n ? App.I18n.t('radialMenu.construct') : "Construct",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m11 8v6"/><path d="M8 11h6"/></svg>',
      },
      {
        id: "measure",
        title: App.I18n ? App.I18n.t('radialMenu.measure') : "Measure",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-git-compare-icon lucide-git-compare"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>',
      },
    ];
  }

  /**
   * Default feature-specific menu items
   * @private
   * @param {string} featureType - Type of feature: 'point', 'line', 'polygon'
   * @returns {Array} Array of menu items
   */
  function _getFeatureMenuItems(featureType) {
    // Base items for all feature types
    var baseItems = [
      {
        id: "object-info",
        title: App.I18n ? App.I18n.t('radialMenu.info') : "Info",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
      },
      {
        id: "stake-out",
        title: App.I18n ? App.I18n.t('radialMenu.stake') : "Stake",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 13V2"/><path d="m9 6 3-3 3 3"/><path d="M4.24 10a6.62 6.62 0 0 0-1.2 3.8c0 3.27 2.68 5.2 6 5.2"/><path d="M21.71 15.5A7.4 7.4 0 0 0 22 13c0-3.5-2.5-6.5-6-6.92"/><path d="M12 13v9"/><path d="M12 22a3 3 0 0 0 3-3"/></svg>',
      },
    ];

    // Feature-specific items
    if (featureType === "point") {
      baseItems.push({
        id: "edit-coordinates",
        title: App.I18n ? App.I18n.t('radialMenu.edit') : "Edit",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 5-3-3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2"/><path d="M8 18h1"/><path d="M14.5 18h1.5"/><path d="M8 14h8"/><path d="M17 10h3a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/></svg>',
      });
    }

    if (featureType === "line" || featureType === "polygon") {
      baseItems.push({
        id: "stake-out-line",
        title: App.I18n ? App.I18n.t('radialMenu.line') : "Line",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8h-2a4 4 0 1 0 0 8h5a4 4 0 1 1 0 8h-8"/></svg>',
      });
    }

    // Add edit operations submenu
    baseItems.push({
      id: "edit-operations",
      title: App.I18n ? App.I18n.t('radialMenu.editSubmenu') : "Edit",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
      items: [
        {
          id: "move",
          title: App.I18n ? App.I18n.t('radialMenu.move') : "Move",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 12-4 4-4-4"/><path d="m16 8-4-4-4 4"/></svg>',
        },
        {
          id: "move-manually",
          title: App.I18n ? App.I18n.t('radialMenu.moveManual') : "Move Manual",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8c-2-2-5-2.8-7-1"/><path d="M7 15c-2 2-2.8 5-1 7"/><path d="M19 13.5A7.5 7.5 0 0 0 11.5 6"/><path d="M7.5 13A3.5 3.5 0 0 0 11 16.5"/><path d="M6 11V7h4"/><path d="M4 8a12 12 0 0 1 16.071-.237L22 6"/><path d="M15 19h4v-4"/><path d="M22 15a12 12 0 0 1-16.071.237L4 17"/></svg>',
        },
        {
          id: "delete",
          title: App.I18n ? App.I18n.t('radialMenu.delete') : "Delete",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
        },
      ],
    });

    // Add node operations submenu for lines and polygons
    if (featureType === "line" || featureType === "polygon") {
      baseItems.push({
        id: "node-operations",
        title: App.I18n ? App.I18n.t('radialMenu.node') : "Node",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>',
        items: [
          {
            id: "delete-node",
            title: App.I18n ? App.I18n.t('radialMenu.deleteNode') : "Delete Node",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
          },
          {
            id: "insert-node",
            title: App.I18n ? App.I18n.t('radialMenu.insertNode') : "Insert Node",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>',
          },
        ],
      });
    }

    return baseItems;
  }

  /**
   * Add CSS styles for the radial menu
   * @private
   */
  function _addMenuStyles() {
    if (!document.getElementById("g360-radial-menu-styles")) {
      var style = document.createElement("style");
      style.id = "g360-radial-menu-styles";
      style.innerHTML = `
              div.g360-radial-menu-container {
                  position: absolute;
                  display: none;
                  z-index: 1000;
                  user-select: none;
                  -moz-user-select: none;
                  overflow: visible;
                  width: ${_defaultSize}px;
                  height: ${_defaultSize}px;
                  margin-left: -${_defaultSize / 2}px;
                  margin-top: -${_defaultSize / 2}px;
              }
              
              svg.icons {
                  display: none;
              }
              
              svg.menu {
                  position: absolute;
                  overflow: visible;
                  transition: 0.2s;
                  transition-timing-function: ease-out;
                  pointer-events: auto;
              }
              
              svg.menu.inner {
                  transform: scale(0.66) rotate(-10deg);
                  opacity: 0;
                  visibility: hidden;
              }
              
              svg.menu.outer {
                  transform: scale(1.5) rotate(10deg);
                  opacity: 0;
                  visibility: hidden;
              }
              
              svg.menu > g > path {
                  fill: rgba(248, 248, 248, 0.75);
                  stroke: #999999;
                  stroke-width: 0.4;
              }
              
              svg.menu > g.sector > path {
                  cursor: pointer;
              }
              
              svg.menu > g.sector > text,
              svg.menu > g.sector > use {
                  cursor: pointer;
                  font-family: 'Roboto', sans-serif;
              }
              
              svg.menu > g.sector > text {
                  fill: black;
              }
              
              svg.menu > g.sector > use {
                  fill: rgba(70, 130, 180, 0.8);
                  shape-rendering: geometricPrecision;
                  vector-effect: non-scaling-stroke;
              }
              
              svg.menu > g.sector:hover > path {
                  fill: rgba(70, 130, 180, 0.4);
                  stroke: #7a7a7a;
              }
              
              svg.menu > g.sector.selected > path {
                  fill: rgba(230, 230, 230, 0.95) !important;
                  stroke: #666666;
                  stroke-width: 0.75;
              }
              
              svg.menu > g.center:hover > circle {
                  fill: rgba(70, 130, 180, 0.4);
                  stroke: #7a7a7a;
              }
              
              svg.menu > g.center > circle {
                  cursor: pointer;
                  fill: rgba(248, 248, 248, 0.95);
                  stroke: #999999;
                  stroke-width: 0.75;
              }
              
              svg.menu > g.center > text {
                  cursor: pointer;
                  fill: black;
              }
              
              svg.menu > g.center > use {
                  cursor: pointer;
                  fill: rgba(70, 130, 180, 0.8);
                  shape-rendering: geometricPrecision;
                  vector-effect: non-scaling-stroke;
              }
              
              svg.menu g > use {
                  width: 20px;
                  height: 20px;
              }

              /* Fix for symbol rendering in icons */
              symbol {
                shape-rendering: geometricPrecision;
                stroke-linecap: round;
                stroke-linejoin: round;
              }
          `;
      document.head.appendChild(style);
    }

    if (!document.getElementById("g360-radial-menu-icons")) {
      var icons = document.createElement("svg");
      icons.id = "g360-radial-menu-icons";
      icons.className = "icons";

      // Add the return/close icons for navigating in the radial menu
      icons.innerHTML = `
                <symbol id="return" viewBox="0 0 24 24">
                    <path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"/>
                </symbol>
                <symbol id="close" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </symbol>
            `;

      document.body.appendChild(icons);
    }
  }

  /**
   * Convert SVG icon strings to DOM elements for the RadialMenu
   * @private
   * @param {Array} items - Menu items array
   * @returns {Array} - Processed menu items
   */
  /**
   * Update the icon processing to preserve sharp edges
   */
  function _processMenuItems(items) {
    return items.map(function (item) {
      // Create a new object to avoid modifying the original
      var newItem = Object.assign({}, item);

      // If there's an SVG icon, convert it to a symbol ID
      if (
        newItem.icon &&
        typeof newItem.icon === "string" &&
        newItem.icon.includes("<svg")
      ) {
        // Generate a unique ID based on item ID
        var symbolId = "icon-" + newItem.id;

        // Check if this symbol already exists
        if (!document.getElementById(symbolId)) {
          // Create a new symbol from the SVG
          var parser = new DOMParser();
          var svgDoc = parser.parseFromString(newItem.icon, "image/svg+xml");
          var svgElement = svgDoc.documentElement;

          // Create a symbol element
          var symbol = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "symbol"
          );
          symbol.id = symbolId;
          symbol.setAttribute(
            "viewBox",
            svgElement.getAttribute("viewBox") || "0 0 24 24"
          );
          symbol.setAttribute("shape-rendering", "geometricPrecision");
          symbol.setAttribute("vector-effect", "non-scaling-stroke");

          // Copy the SVG content to the symbol
          while (svgElement.firstChild) {
            var child = svgElement.firstChild;
            // Ensure paths maintain crisp edges
            if (child.nodeType === 1) {
              // Element node
              child.setAttribute("shape-rendering", "geometricPrecision");
              child.setAttribute("vector-effect", "non-scaling-stroke");
            }
            symbol.appendChild(child);
          }

          // Add to the icons SVG
          document.getElementById("g360-radial-menu-icons").appendChild(symbol);
        }

        // Set the icon to the symbol reference
        newItem.icon = "#" + symbolId;
      }

      // Process submenu items recursively
      if (newItem.items && Array.isArray(newItem.items)) {
        newItem.items = _processMenuItems(newItem.items);
      }

      return newItem;
    });
  }

  /**
   * Get feature type from geometry
   * @private
   * @param {Object} feature - GeoJSON feature
   * @returns {string} Feature type: 'point', 'line', 'polygon', or 'unknown'
   */
  function _getFeatureType(feature) {
    if (!feature || !feature.geometry || !feature.geometry.type) {
      return "unknown";
    }

    const type = feature.geometry.type.toLowerCase();

    if (type === "point" || type === "multipoint") {
      return "point";
    } else if (type === "linestring" || type === "multilinestring") {
      return "line";
    } else if (type === "polygon" || type === "multipolygon") {
      return "polygon";
    } else {
      return "unknown";
    }
  }

  /**
   * Open the radial menu
   * @private
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} [feature] - Feature to use for feature-specific menu
   */
  function _openMenu(x, y, feature) {
    // Position the menu
    _menuContainer.style.left = x + "px";
    _menuContainer.style.top = y + "px";

    setTimeout(function () {
      _addTouchEventSupport();
    }, 100); // Small delay to ensure menu is fully rendered

    // Show the menu
    _menuContainer.style.display = "block";
    _isMenuOpen = true;

    // Set current feature if provided
    if (feature) {
      _currentFeature = feature;
      const featureType = _getFeatureType(feature);
      const menuItems = _processMenuItems(_getFeatureMenuItems(featureType));
      _radialMenu.setMenuItems(menuItems);
    } else {
      _currentFeature = null;
      const menuItems = _processMenuItems(_getDefaultMenuItems());
      _radialMenu.setMenuItems(menuItems);
    }

    // Open the menu
    _radialMenu.open();

    // Trigger event
    if (_events) {
      _events.trigger("radialMenu.opened", {
        type: feature ? "feature" : "main",
        featureType: feature ? _getFeatureType(feature) : null,
      });
    }
  }

  /**
   * Close the radial menu
   * @private
   */
  function _closeMenu() {
    if (_isMenuOpen) {
      _radialMenu.close();
      _menuContainer.style.display = "none";
      _isMenuOpen = false;

      // Trigger event
      if (_events) {
        _events.trigger("radialMenu.closed");
      }
    }
  }

  /**
   * Initialize RadialMenu
   * @private
   */
  function _initializeRadialMenu() {
    // Create menu container if it doesn't exist
    _menuContainer = document.createElement("div");
    _menuContainer.id = "g360-radial-menu-container";
    _menuContainer.className = "g360-radial-menu-container";
    document.body.appendChild(_menuContainer);

    // Process menu items to add icons as symbols
    var processedItems = _processMenuItems(_getDefaultMenuItems());

    // Create the RadialMenu instance
    _radialMenu = new RadialMenu({
      parent: _menuContainer,
      size: _defaultSize,
      closeOnClick: true,
      menuItems: processedItems,
      onClick: function (item) {
        _handleMenuItemClick(item);
      },
    });
  }

  /**
   * Handle menu item click events
   * @private
   * @param {Object} item - The clicked menu item
   */
  function _handleMenuItemClick(item) {
    console.log("Radial menu item clicked:", item.id);

    // Trigger event
    if (_events) {
      _events.trigger("radialMenu.itemClicked", {
        id: item.id,
        title: item.title,
        feature: _currentFeature,
      });
    }

    // Handle built-in actions
    switch (item.id) {
      case "select-feature":
        if (
          window.interface &&
          typeof window.interface.startSelectionMode === "function"
        ) {
          window.interface.startSelectionMode();
        }
        break;

      case "manual-collection":
        if (
          window.interface &&
          typeof window.interface.startManualCollection === "function"
        ) {
          window.interface.startManualCollection();
        }
        break;

      case "construct":
        if (
          window.interface &&
          typeof window.interface.startConstruct === "function"
        ) {
          window.interface.startConstruct();
        }
        break;

      case "measure":
        if (
          window.interface &&
          typeof window.interface.startMeasure === "function"
        ) {
          window.interface.startMeasure();
        }
        break;

      case "object-info":
        if (
          _currentFeature &&
          window.interface &&
          typeof window.interface.displayFeatureInfo === "function"
        ) {
          window.interface.displayFeatureInfo(
            JSON.stringify(_currentFeature),
            true
          );
        }
        break;

      case "stake-out":
        if (
          _currentFeature &&
          window.interface &&
          typeof window.interface.startStakeout === "function"
        ) {
          window.interface.startStakeout(_currentFeature);
        }
        break;

      case "stake-out-line":
        if (
          _currentFeature &&
          window.interface &&
          typeof window.interface.startLineStakeout === "function"
        ) {
          window.interface.startLineStakeout(_currentFeature);
        }
        break;

      case "edit-coordinates":
        if (
          _currentFeature &&
          window.interface &&
          typeof window.interface.editCoordinates === "function"
        ) {
          window.interface.editCoordinates(_currentFeature);
        }
        break;

      case "move":
        if (
          _currentFeature &&
          window.interface &&
          typeof window.interface.startMoveFeature === "function"
        ) {
          window.interface.startMoveFeature(_currentFeature);
        }
        break;

      case "move-manually":
        if (
          _currentFeature &&
          window.interface &&
          typeof window.interface.startManualMoveFeature === "function"
        ) {
          window.interface.startManualMoveFeature(_currentFeature);
        }
        break;

      case "delete":
        if (_currentFeature && window.interface) {
          // Confirm before deleting
          if (confirm("Are you sure you want to delete this feature?")) {
            if (typeof window.interface.deleteFeature === "function") {
              window.interface.deleteFeature(_currentFeature);
            }
          }
        }
        break;

      case "delete-node":
        if (
          _currentFeature &&
          window.interface &&
          typeof window.interface.startDeleteNode === "function"
        ) {
          window.interface.startDeleteNode(_currentFeature);
        }
        break;

      case "insert-node":
        if (
          _currentFeature &&
          window.interface &&
          typeof window.interface.startInsertNode === "function"
        ) {
          window.interface.startInsertNode(_currentFeature);
        }
        break;
    }
  }

  /**
   * Set up map event handlers
   * @private
   */
  function _setupMapEventHandlers() {
    // Right-click/Long-press to open main radial menu
    _map.on("contextmenu", function (e) {
      // Prevent default context menu
      e.preventDefault();

      // Get map coordinates
      const point = e.point;

      // Open the menu at the click point
      _openMenu(point.x, point.y);
    });

    // Check for feature clicks with shift key pressed
    _map.on("click", function (e) {
      // Skip if the shift key wasn't pressed
      if (!e.originalEvent.shiftKey) return;

      // Query features at click point
      const features = _map.queryRenderedFeatures(e.point);

      // If a valid feature is found, open feature menu
      if (features.length > 0) {
        // Find the first valid feature (with geometry)
        const feature = features.find((f) => f.geometry);

        if (feature) {
          // Convert to GeoJSON if needed
          const featureJson = feature.toJSON ? feature.toJSON() : feature;

          // Open the menu at click point with the feature
          _openMenu(e.point.x, e.point.y, featureJson);

          // Prevent normal click behavior
          e.stopPropagation();
        }
      }
    });

    // Close menu on map movement
    _map.on("movestart", function () {
      if (_isMenuOpen) {
        _closeMenu();
      }
    });

    // Close menu when clicking elsewhere
    document.addEventListener("click", function (e) {
      if (_isMenuOpen && !_menuContainer.contains(e.target)) {
        _closeMenu();
      }
    });
  }

  // Add these specific touch event handlers to the RadialMenu
  function _addTouchEventSupport() {
    // Get all menu elements
    var menuElements = _menuContainer.querySelectorAll(
      "svg.menu g.sector, svg.menu g.center"
    );

    // Add touch handlers to each element
    menuElements.forEach(function (element) {
      element.addEventListener(
        "touchstart",
        function (e) {
          e.preventDefault(); // Prevent scrolling/zooming

          // Find the sector and highlight it
          if (element.classList.contains("sector")) {
            var index = element.getAttribute("data-index");
            if (index !== null) {
              _radialMenu.setSelectedIndex(parseInt(index));
            }
          }
        },
        { passive: false }
      );

      element.addEventListener(
        "touchend",
        function (e) {
          e.preventDefault();

          // Handle click based on element type
          if (element.classList.contains("sector")) {
            _radialMenu.handleClick();
          } else if (element.classList.contains("center")) {
            _radialMenu.handleCenterClick();
          }
        },
        { passive: false }
      );
    });
  }

  // Public API
  return {
    /**
     * Initialize the RadialMenu module
     * @param {Object} map - MapLibre map instance
     * @param {Object} dependencies - Required dependencies
     */
    initialize: function (map, dependencies) {
      _map = map;
      _events =
        dependencies && dependencies.events
          ? dependencies.events
          : App.Core.Events;
      _config =
        dependencies && dependencies.config
          ? dependencies.config
          : App.Core.Config;

      // Add menu styles
      _addMenuStyles();

      // Initialize the RadialMenu
      _initializeRadialMenu();

      // Set up map event handlers
      _setupMapEventHandlers();

      console.log("RadialMenu module initialized");
    },

    /**
     * Open the radial menu
     * @param {Object} options - Menu options
     * @param {number} options.x - X coordinate (screen pixels)
     * @param {number} options.y - Y coordinate (screen pixels)
     * @param {Object} [options.feature] - Feature to use for feature-specific menu
     */
    openMenu: function (options) {
      if (
        !options ||
        typeof options.x !== "number" ||
        typeof options.y !== "number"
      ) {
        console.error("Missing required position information");
        return;
      }

      _openMenu(options.x, options.y, options.feature);
    },

    /**
     * Close the radial menu
     */
    closeMenu: function () {
      _closeMenu();
    },

    /**
     * Check if menu is open
     * @returns {boolean} Whether the menu is open
     */
    isMenuOpen: function () {
      return _isMenuOpen;
    },

    /**
     * Set custom menu items
     * @param {Array} items - Menu items to use
     */
    setMenuItems: function (items) {
      if (Array.isArray(items)) {
        const processedItems = _processMenuItems(items);
        _radialMenu.setMenuItems(processedItems);
      }
    },

    /**
     * Get RadialMenu instance
     * @returns {Object} RadialMenu instance
     */
    getRadialMenu: function () {
      return _radialMenu;
    },
  };
})();
