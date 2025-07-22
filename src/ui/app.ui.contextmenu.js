/**
 * Dynamic Context Menu functionality
 * @namespace App.UI.ContextMenu
 */
App.UI = App.UI || {};
App.UI.ContextMenu = (function () {
  // Private variables
  var _map = null;
  var _menuElement = null;
  var _menuContainer = null;
  var _menuItems = [];
  var _isMenuOpen = false;
  var _events = null;
  var _config = null;
  var _featureMenuEnabled = false;
  var _currentFeature = null;
  var _currentFeatureType = null;
  var _menuPosition = { x: 0, y: 0 };
  var _menuType = "main"; // 'main' or 'feature'

  /**
   * Create the menu elements
   * @private
   */
  function _createMenuElements() {
    // Create the button (optional - can be used if you want a permanent button)
    _menuElement = document.createElement("div");
    _menuElement.className =
      "maplibre-ctrl maplibre-ctrl-group g360-context-menu-button";
    _menuElement.innerHTML =
      '<button type="button" title="Menu"><span class="g360-menu-icon"></span></button>';

    // Create the menu container
    _menuContainer = document.createElement("div");
    _menuContainer.className = "g360-context-menu-container";
    document.body.appendChild(_menuContainer);

    // Add style rules
    if (!document.getElementById("g360-context-menu-styles")) {
      var style = document.createElement("style");
      style.id = "g360-context-menu-styles";
      style.innerHTML = `
                .g360-context-menu-button {
                    margin: 10px;
                    z-index: 1000;
                }
                .g360-menu-icon {
                    display: block;
                    width: 20px;
                    height: 20px;
                    background-color: #333;
                    mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>');
                    -webkit-mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>');
                    mask-size: contain;
                    -webkit-mask-size: contain;
                    mask-repeat: no-repeat;
                    -webkit-mask-repeat: no-repeat;
                    mask-position: center;
                    -webkit-mask-position: center;
                }
                .g360-context-menu-container {
                    position: absolute;
                    display: none;
                    background: white;
                    border-radius: 4px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    z-index: 1000;
                    overflow: hidden;
                    min-width: 180px;
                    max-width: 280px;
                    font-family: 'Roboto', sans-serif;
                }
                .g360-context-menu-container.open {
                    display: block;
                }
                .g360-menu-title {
                    padding: 8px 12px;
                    font-weight: bold;
                    background-color: rgba(70, 130, 180, 0.1);
                    border-bottom: 1px solid #eee;
                    color: #4682b4;
                    font-size: 14px;
                }
                .g360-menu-item {
                    padding: 10px 15px;
                    border-bottom: 1px solid #eee;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    font-size: 14px;
                    color: #333;
                    transition: background-color 0.2s ease;
                }
                .g360-menu-item:last-child {
                    border-bottom: none;
                }
                .g360-menu-item:hover {
                    background-color: #f5f5f5;
                }
                .g360-menu-item i, .g360-menu-item svg {
                    margin-right: 10px;
                    width: 20px;
                    height: 20px;
                    text-align: center;
                    color: #4682b4;
                }
                .g360-menu-divider {
                    height: 1px;
                    background-color: #ddd;
                    margin: 0;
                }
                .g360-submenu-header {
                    padding: 8px 15px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-weight: 500;
                    background-color: #f8f8f8;
                }
                .g360-submenu-content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease;
                }
                .g360-submenu-content.expanded {
                    max-height: 300px;
                }
                .g360-submenu-item {
                    padding: 8px 15px 8px 35px;
                    border-bottom: 1px solid #eee;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    font-size: 13px;
                }
                .g360-submenu-item:hover {
                    background-color: #f5f5f5;
                }
                .g360-chevron {
                    transition: transform 0.3s ease;
                }
                .g360-chevron.expanded {
                    transform: rotate(180deg);
                }
                @media (max-width: 768px) {
                    .g360-menu-item, .g360-submenu-item {
                        padding: 12px 15px;
                    }
                    .g360-submenu-item {
                        padding-left: 35px;
                    }
                }
            `;
      document.head.appendChild(style);
    }

    // Close menu when clicking elsewhere
    document.addEventListener("click", function (e) {
      if (_isMenuOpen && !_menuContainer.contains(e.target)) {
        _closeMenu();
      }
    });

    // Close menu on map move
    _map.on("move", _closeMenu);
    _map.on("zoom", _closeMenu);
  }

  /**
   * Open the menu at specific position
   * @private
   * @param {number} x - X position on screen
   * @param {number} y - Y position on screen
   * @param {string} type - Menu type: 'main' or 'feature'
   * @param {Object} [feature] - The feature object if opening feature menu
   */
  function _openMenu(x, y, type, feature) {
    // Store menu position
    _menuPosition.x = x;
    _menuPosition.y = y;

    // Set menu type and feature if applicable
    _menuType = type || "main";
    _currentFeature = feature || null;

    if (_currentFeature) {
      _currentFeatureType = _getFeatureType(_currentFeature);
    }

    // Position the menu
    _menuContainer.style.left = x + "px";
    _menuContainer.style.top = y + "px";

    // Render appropriate menu items
    if (_menuType === "main") {
      _renderMainMenuItems();
    } else if (_menuType === "feature") {
      _renderFeatureMenuItems();
    }

    // Show the menu
    _menuContainer.classList.add("open");
    _isMenuOpen = true;

    // Adjust menu position if it goes off-screen
    _adjustMenuPosition();

    // Trigger event
    if (_events) {
      _events.trigger("contextMenu.opened", {
        type: _menuType,
        position: _menuPosition,
      });
    }
  }

  /**
   * Close the menu
   * @private
   */
  function _closeMenu() {
    _menuContainer.classList.remove("open");
    _isMenuOpen = false;

    // Trigger event
    if (_events) {
      _events.trigger("contextMenu.closed");
    }
  }

  /**
   * Adjust menu position to ensure it stays within viewport
   * @private
   */
  function _adjustMenuPosition() {
    const rect = _menuContainer.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontally if off-screen
    if (rect.right > viewportWidth) {
      const overflowX = rect.right - viewportWidth;
      _menuContainer.style.left =
        parseInt(_menuContainer.style.left) - overflowX - 10 + "px";
    }

    // Adjust vertically if off-screen
    if (rect.bottom > viewportHeight) {
      const overflowY = rect.bottom - viewportHeight;
      _menuContainer.style.top =
        parseInt(_menuContainer.style.top) - overflowY - 10 + "px";
    }
  }

  /**
   * Get feature type (point, line, polygon)
   * @private
   * @param {Object} feature - The GeoJSON feature
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
   * Render the main context menu items
   * @private
   */
  function _renderMainMenuItems() {
    _menuContainer.innerHTML = "";

    // Add title
    const titleEl = document.createElement("div");
    titleEl.className = "g360-menu-title";
    titleEl.textContent = App.I18n ? App.I18n.t('contextMenu.mapActions') : "Map Actions";
    _menuContainer.appendChild(titleEl);

    // Create menu items for main context menu
    const mainItems = [
      {
        id: "select-feature",
        label: App.I18n ? App.I18n.t('contextMenu.selectFeature') : "Select Feature",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 3 7 7"/><path d="m21 21-7-7"/><path d="m11 13 9 9"/><path d="m13 11-9-9"/><path d="m17 17-5-5"/></svg>',
        action: function () {
          if (
            window.interface &&
            typeof window.interface.startSelectionMode === "function"
          ) {
            window.interface.startSelectionMode();
          } else if (
            App.Features &&
            App.Features.Selection &&
            typeof App.Features.Selection.start === "function"
          ) {
            App.Features.Selection.start();
          }
        },
      },
      {
        id: "manual-collection",
        label: App.I18n ? App.I18n.t('contextMenu.manualCollection') : "Manual Collection",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12h14"/></svg>',
        action: function () {
          if (
            window.interface &&
            typeof window.interface.startManualCollection === "function"
          ) {
            window.interface.startManualCollection();
          } else if (
            App.Features &&
            App.Features.Collection &&
            typeof App.Features.Collection.startManual === "function"
          ) {
            App.Features.Collection.startManual();
          }
        },
      },
      {
        type: "divider",
      },
      {
        id: "construct",
        label: App.I18n ? App.I18n.t('contextMenu.construct') : "Construct",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m11 8v6"/><path d="M8 11h6"/></svg>',
        action: function () {
          if (
            window.interface &&
            typeof window.interface.startConstruct === "function"
          ) {
            window.interface.startConstruct();
          } else if (
            App.Features &&
            App.Features.Construct &&
            typeof App.Features.Construct.start === "function"
          ) {
            App.Features.Construct.start();
          }
        },
      },
      {
        id: "measure",
        label: App.I18n ? App.I18n.t('contextMenu.measure') : "Measure",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9h20"/><path d="M2 15h20"/><path d="M12 3v18"/><path d="M9 3v18"/><path d="M5 3v18"/><path d="M19 3v18"/></svg>',
        action: function () {
          if (
            window.interface &&
            typeof window.interface.startMeasure === "function"
          ) {
            window.interface.startMeasure();
          } else if (
            App.Features &&
            App.Features.Measure &&
            typeof App.Features.Measure.start === "function"
          ) {
            App.Features.Measure.start();
          }
        },
      },
    ];

    // Render menu items
    mainItems.forEach(function (item) {
      if (item.type === "divider") {
        // Add a divider
        var divider = document.createElement("div");
        divider.className = "g360-menu-divider";
        _menuContainer.appendChild(divider);
      } else {
        // Add a menu item
        var menuItem = document.createElement("div");
        menuItem.className = "g360-menu-item";
        menuItem.setAttribute("data-id", item.id);

        // Add icon if specified
        var iconHTML = item.icon || "";

        menuItem.innerHTML = iconHTML + item.label;

        // Add click handler
        menuItem.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();

          // Execute the action
          if (typeof item.action === "function") {
            item.action();
          }

          // Close the menu
          _closeMenu();

          // Trigger event
          if (_events) {
            _events.trigger("contextMenu.itemClicked", {
              id: item.id,
              label: item.label,
              type: "main",
            });
          }
        });

        _menuContainer.appendChild(menuItem);
      }
    });
  }

  /**
   * Render feature-specific menu items
   * @private
   */
  function _renderFeatureMenuItems() {
    _menuContainer.innerHTML = "";

    // Add title with feature info
    const titleEl = document.createElement("div");
    titleEl.className = "g360-menu-title";

    // Try to get feature name/title from properties
    let featureTitle = App.I18n ? App.I18n.t('contextMenu.selectedFeature') : "Selected Feature";
    if (_currentFeature && _currentFeature.properties) {
      featureTitle =
        _currentFeature.properties.name ||
        _currentFeature.properties.title ||
        _currentFeature.properties.id ||
        "Feature #" + (_currentFeature.id || "");
    }

    titleEl.textContent = featureTitle;
    _menuContainer.appendChild(titleEl);

    // Create menu items for feature context menu
    const featureItems = [
      {
        id: "object-info",
        label: App.I18n ? App.I18n.t('contextMenu.objectInfo') : "Object Info",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
        action: function () {
          if (
            window.interface &&
            typeof window.interface.displayFeatureInfo === "function"
          ) {
            window.interface.displayFeatureInfo(
              JSON.stringify(_currentFeature),
              true
            );
          } else if (
            window.objectInfoBridge &&
            typeof window.objectInfoBridge.displayFeature === "function"
          ) {
            window.objectInfoBridge.displayFeature(_currentFeature, true);
          }
        },
      },
    ];

    // Add different options based on feature type
    if (_currentFeatureType === "point") {
      featureItems.push({
        id: "edit-coordinates",
        label: App.I18n ? App.I18n.t('contextMenu.editCoordinates') : "Edit Coordinates",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 5-3-3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2"/><path d="M8 18h1"/><path d="M14.5 18h1.5"/><path d="M8 14h8"/><path d="M17 10h3a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/></svg>',
        action: function () {
          if (
            window.interface &&
            typeof window.interface.editCoordinates === "function"
          ) {
            window.interface.editCoordinates(_currentFeature);
          }
        },
      });
    }

    // Add Stake-Out options
    featureItems.push({
      id: "stake-out-point",
      label: App.I18n ? App.I18n.t('contextMenu.stakeOutPoint') : "Stake-Out Point",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 13V2"/><path d="m9 6 3-3 3 3"/><path d="M4.24 10a6.62 6.62 0 0 0-1.2 3.8c0 3.27 2.68 5.2 6 5.2"/><path d="M21.71 15.5A7.4 7.4 0 0 0 22 13c0-3.5-2.5-6.5-6-6.92"/><path d="M12 13v9"/><path d="M12 22a3 3 0 0 0 3-3"/></svg>',
      action: function () {
        if (
          window.interface &&
          typeof window.interface.startStakeout === "function"
        ) {
          window.interface.startStakeout(_currentFeature);
        } else if (
          window.stakeOut &&
          typeof window.stakeOut.start === "function"
        ) {
          window.stakeOut.start(_currentFeature);
        }
      },
    });

    if (_currentFeatureType === "line" || _currentFeatureType === "polygon") {
      featureItems.push({
        id: "stake-out-line",
        label: App.I18n ? App.I18n.t('contextMenu.stakeOutLine') : "Stake-Out Line",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8h-2a4 4 0 1 0 0 8h5a4 4 0 1 1 0 8h-8"/></svg>',
        action: function () {
          if (
            window.interface &&
            typeof window.interface.startLineStakeout === "function"
          ) {
            window.interface.startLineStakeout(_currentFeature);
          } else if (
            window.stakeOut &&
            typeof window.stakeOut.startLine === "function"
          ) {
            window.stakeOut.startLine(_currentFeature);
          }
        },
      });
    }

    // Add other common feature actions
    featureItems.push(
      {
        type: "divider",
      },
      {
        id: "move",
        label: App.I18n ? App.I18n.t('contextMenu.move') : "Move",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 12-4 4-4-4"/><path d="m16 8-4-4-4 4"/></svg>',
        action: function () {
          if (
            window.interface &&
            typeof window.interface.startMoveFeature === "function"
          ) {
            window.interface.startMoveFeature(_currentFeature);
          }
        },
      },
      {
        id: "move-manually",
        label: App.I18n ? App.I18n.t('contextMenu.moveManually') : "Move Manually",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8c-2-2-5-2.8-7-1"/><path d="M7 15c-2 2-2.8 5-1 7"/><path d="M19 13.5A7.5 7.5 0 0 0 11.5 6"/><path d="M7.5 13A3.5 3.5 0 0 0 11 16.5"/><path d="M6 11V7h4"/><path d="M4 8a12 12 0 0 1 16.071-.237L22 6"/><path d="M15 19h4v-4"/><path d="M22 15a12 12 0 0 1-16.071.237L4 17"/></svg>',
        action: function () {
          if (
            window.interface &&
            typeof window.interface.startManualMoveFeature === "function"
          ) {
            window.interface.startManualMoveFeature(_currentFeature);
          }
        },
      },
      {
        id: "delete",
        label: App.I18n ? App.I18n.t('contextMenu.delete') : "Delete",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
        action: function () {
          // Confirm before deleting
          if (confirm(App.I18n ? App.I18n.t('messages.confirmDelete') : "Are you sure you want to delete this feature?")) {
            if (
              window.interface &&
              typeof window.interface.deleteFeature === "function"
            ) {
              window.interface.deleteFeature(_currentFeature);
            }
          }
        },
      }
    );

    // Add node operations submenu for lines and polygons
    if (_currentFeatureType === "line" || _currentFeatureType === "polygon") {
      featureItems.push({
        type: "divider",
      });

      // Create submenu container
      const submenuContainer = document.createElement("div");
      submenuContainer.className = "g360-submenu";

      // Create submenu header
      const submenuHeader = document.createElement("div");
      submenuHeader.className = "g360-submenu-header";
      submenuHeader.innerHTML = `
                <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="4"/>
                    </svg>
                    Node Operations
                </span>
                <svg class="g360-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                </svg>
            `;

      // Create submenu content
      const submenuContent = document.createElement("div");
      submenuContent.className = "g360-submenu-content";

      // Node operations
      const nodeItems = [
        {
          id: "delete-node",
          label: App.I18n ? App.I18n.t('contextMenu.deleteNode') : "Delete Node",
          action: function () {
            if (
              window.interface &&
              typeof window.interface.startDeleteNode === "function"
            ) {
              window.interface.startDeleteNode(_currentFeature);
            }
          },
        },
        {
          id: "insert-node",
          label: App.I18n ? App.I18n.t('contextMenu.insertNode') : "Insert Node",
          action: function () {
            if (
              window.interface &&
              typeof window.interface.startInsertNode === "function"
            ) {
              window.interface.startInsertNode(_currentFeature);
            }
          },
        },
      ];

      // Add node items to submenu content
      nodeItems.forEach(function (item) {
        const submenuItem = document.createElement("div");
        submenuItem.className = "g360-submenu-item";
        submenuItem.setAttribute("data-id", item.id);
        submenuItem.textContent = item.label;

        // Add click handler
        submenuItem.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();

          // Execute the action
          if (typeof item.action === "function") {
            item.action();
          }

          // Close the menu
          _closeMenu();

          // Trigger event
          if (_events) {
            _events.trigger("contextMenu.itemClicked", {
              id: item.id,
              label: item.label,
              type: "feature",
            });
          }
        });

        submenuContent.appendChild(submenuItem);
      });

      // Add toggle behavior to submenu header
      submenuHeader.addEventListener("click", function () {
        const chevron = this.querySelector(".g360-chevron");
        const content = this.nextElementSibling;

        chevron.classList.toggle("expanded");
        content.classList.toggle("expanded");
      });

      // Append submenu elements
      submenuContainer.appendChild(submenuHeader);
      submenuContainer.appendChild(submenuContent);

      // Add submenu to menu container
      _menuContainer.appendChild(submenuContainer);
    }

    // Render standard menu items
    featureItems.forEach(function (item) {
      if (item.type === "divider") {
        // Add a divider
        var divider = document.createElement("div");
        divider.className = "g360-menu-divider";
        _menuContainer.appendChild(divider);
      } else if (!item.submenu) {
        // Add a regular menu item
        var menuItem = document.createElement("div");
        menuItem.className = "g360-menu-item";
        menuItem.setAttribute("data-id", item.id);

        // Add icon if specified
        var iconHTML = item.icon || "";

        menuItem.innerHTML = iconHTML + item.label;

        // Add click handler
        menuItem.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();

          // Execute the action
          if (typeof item.action === "function") {
            item.action();
          }

          // Close the menu
          _closeMenu();

          // Trigger event
          if (_events) {
            _events.trigger("contextMenu.itemClicked", {
              id: item.id,
              label: item.label,
              type: "feature",
            });
          }
        });

        _menuContainer.appendChild(menuItem);
      }
    });
  }

  /**
   * Set up map event handlers
   * @private
   */
  function _setupMapEventHandlers() {
    // Right-click/Long-press to open main context menu
    _map.on("contextmenu", function (e) {
      // Prevent default context menu
      e.preventDefault();

      // Get map pixel coordinates
      const point = e.point;

      // Open the main context menu
      _openMenu(point.x, point.y, "main");
    });

    // Check for feature clicks
    _map.on("click", function (e) {
      // Skip if feature menus are disabled
      if (!_featureMenuEnabled) return;

      // Query features at click point
      const features = _map.queryRenderedFeatures(e.point);

      // If a valid feature is found, open feature menu
      if (features.length > 0) {
        // Find the first valid feature (with geometry)
        const feature = features.find((f) => f.geometry);

        if (feature) {
          // Convert to GeoJSON if needed
          const featureJson = feature.toJSON ? feature.toJSON() : feature;

          // Open feature menu
          _openMenu(e.point.x, e.point.y, "feature", featureJson);

          // Prevent normal click behavior
          // MapLibre events might not have stopPropagation or it might be on originalEvent
          try {
            if (typeof e.stopPropagation === 'function') {
              e.stopPropagation();
            } else if (e.originalEvent && typeof e.originalEvent.stopPropagation === 'function') {
              e.originalEvent.stopPropagation();
            }
          } catch (error) {
            // Ignore if stopPropagation is not available
            console.log("Could not stop propagation:", error.message);
          }
        }
      }
    });
  }

  // Public API
  return {
    /**
     * Initialize the ContextMenu module
     * @param {Object} map - MapLibre map instance
     * @param {Object} dependencies - Required dependencies
     * @returns {Object} The menu button element to add to the map
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

      // Create the menu elements
      _createMenuElements();

      // Set up map event handlers
      _setupMapEventHandlers();

      console.log("ContextMenu module initialized");

      // Return the menu button element
      return _menuElement;
    },

    /**
     * Open the context menu at the specified position
     * @param {Object} options - Menu options
     * @param {number} options.x - X position
     * @param {number} options.y - Y position
     * @param {string} [options.type='main'] - Menu type: 'main' or 'feature'
     * @param {Object} [options.feature] - Feature object (required for 'feature' type)
     */
    openMenu: function (options) {
      if (
        !options ||
        !options.hasOwnProperty("x") ||
        !options.hasOwnProperty("y")
      ) {
        console.error("Missing required position information");
        return;
      }

      _openMenu(options.x, options.y, options.type || "main", options.feature);
    },

    /**
     * Close the context menu
     */
    closeMenu: function () {
      _closeMenu();
    },

    /**
     * Enable or disable feature context menus
     * @param {boolean} enabled - Whether feature menus should be enabled
     */
    enableFeatureMenu: function (enabled) {
      _featureMenuEnabled = !!enabled;
    },

    /**
     * Check if the menu is currently open
     * @returns {boolean} Whether the menu is open
     */
    isMenuOpen: function () {
      return _isMenuOpen;
    },

    /**
     * Get the current menu type
     * @returns {string} Current menu type: 'main' or 'feature'
     */
    getMenuType: function () {
      return _menuType;
    },

    /**
     * Get the current feature (if any)
     * @returns {Object|null} Current feature or null
     */
    getCurrentFeature: function () {
      return _currentFeature;
    },
  };
})();
