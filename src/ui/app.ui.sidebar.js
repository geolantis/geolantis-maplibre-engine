/**
 * Sidebar UI functionality with centralized width control
 * @namespace App.UI.Sidebar
 */
App.UI = App.UI || {};
App.UI.Sidebar = (function () {
  // Private variables
  var _map = null;
  var _activeSidebars = {
    left: null,
    right: null,
  };
  var _sidebarStates = {};
  var _leftSidebarIds = ["left1", "left2", "left3", "left4"];
  var _rightSidebarIds = ["right1", "right2"];
  var _drawersSetup = false;
  var _tabStates = new Map(); // Store last active tab for each drawer

  /**
   * Get computed sidebar width from CSS
   * @private
   */
  function _getSidebarWidth(side) {
    const root = document.documentElement;
    const property =
      side === "right" ? "--right-sidebar-width" : "--sidebar-width";
    return (
      getComputedStyle(root).getPropertyValue(property) ||
      (side === "right" ? "600px" : "500px")
    );
  }

  /**
   * Update the map padding
   * @private
   */
  function _updateMapPadding() {
    if (!_map) return;

    var padding = { left: 0, right: 0, top: 0, bottom: 0 };

    // Get actual sidebar widths from CSS
    const leftWidth = parseInt(_getSidebarWidth("left"), 10);
    const rightWidth = parseInt(_getSidebarWidth("right"), 10);

    // Update padding based on open sidebars
    if (_activeSidebars.left) {
      padding.left = leftWidth;
    }
    if (_activeSidebars.right) {
      padding.right = rightWidth;
    }

    _map.easeTo({
      padding: padding,
      duration: 300,
    });
    
    // Also update map control positions
    _updateControlPositions();
  }
  
  /**
   * Update control positions based on sidebar state
   * @private
   */
  function _updateControlPositions() {
    var rightSidebar1 = document.getElementById("right1");
    var rightSidebar2 = document.getElementById("right2");
    
    var rightSidebar1Width = rightSidebar1 && !rightSidebar1.classList.contains("collapsed") 
      ? rightSidebar1.offsetWidth : 0;
    var rightSidebar2Width = rightSidebar2 && !rightSidebar2.classList.contains("collapsed") 
      ? rightSidebar2.offsetWidth : 0;
    
    var totalRightSidebarWidth = rightSidebar1Width + rightSidebar2Width;
    var rightPosition = totalRightSidebarWidth + 10;
    
    document.querySelectorAll(
      ".maplibregl-ctrl-group, .maplibregl-ctrl-top-right, .maplibregl-ctrl-bottom-right"
    ).forEach(function (control) {
      if (control) {
        control.style.right = rightPosition + "px";
      }
    });
  }

  /**
   * Get sidebar by ID and side
   * @private
   */
  function _getSidebar(sidebarId) {
    // Try to get either the old sidebar or the new drawer
    var sidebar = document.getElementById(sidebarId);
    var drawer = document.getElementById(sidebarId + "-drawer");
    return sidebar || drawer;
  }

  /**
   * Get toggle button for sidebar
   * @private
   */
  function _getToggleButton(sidebarId) {
    return document.querySelector(`.sidebar-toggle.${sidebarId}`);
  }

  /**
   * Close sidebar
   * @private
   */
  function _closeSidebar(sidebarId) {
    var sidebar = _getSidebar(sidebarId);
    var toggleButton = _getToggleButton(sidebarId);

    if (sidebar && toggleButton) {
      sidebar.classList.add("collapsed");
      toggleButton.classList.remove("active");
      _sidebarStates[sidebarId] = false;

      // Reset the translate
      toggleButton.style.transform = "translateX(0)";

      // Update active sidebar tracking
      var side = sidebarId.startsWith("left") ? "left" : "right";
      if (_activeSidebars[side] === sidebarId) {
        _activeSidebars[side] = null;
      }
    }
  }

  /**
   * Open sidebar
   * @private
   */
  function _openSidebar(sidebarId) {
    var sidebar = _getSidebar(sidebarId);
    var toggleButton = _getToggleButton(sidebarId);
    var side = sidebarId.startsWith("left") ? "left" : "right";

    if (sidebar && toggleButton) {
      sidebar.classList.remove("collapsed");
      toggleButton.classList.add("active");
      _sidebarStates[sidebarId] = true;

      // Move toggle button with sidebar using CSS variable
      const width = _getSidebarWidth(side);
      toggleButton.style.transform =
        side === "left"
          ? `translateX(${width})`
          : `translateX(calc(-1 * ${width}))`;

      // Update active sidebar tracking
      _activeSidebars[side] = sidebarId;
    }
  }

  // Public API
  return {
    /**
     * Initialize sidebar management
     * @param {Object} map - The MapLibre map instance
     */
    initialize: function (map) {
      _map = map;

      // Initialize all sidebar states as collapsed
      var allSidebars = document.querySelectorAll(".sidebar");
      allSidebars.forEach(function (sidebar) {
        _sidebarStates[sidebar.id] = false;
        sidebar.classList.add("collapsed");
      });

      console.log("Sidebar management initialized");
      
      // Set up drawer event listeners
      this._setupDrawerEventListeners();
      
      // Fix toggle button onclick handlers
      this._fixToggleButtons();
      
      // Initialize tab management
      this._initializeTabManagement();
    },
    
    /**
     * Set up event listeners for Shoelace drawers
     * @private
     */
    _setupDrawerEventListeners: function () {
      if (_drawersSetup) return;
      
      var self = this;
      var drawers = document.querySelectorAll("sl-drawer");
      
      drawers.forEach(function (drawer) {
        drawer.addEventListener("sl-after-show", function () {
          var drawerId = drawer.id.replace("-drawer", "");
          var isLeftDrawer = _leftSidebarIds.indexOf(drawerId) !== -1;
          var isRightDrawer = _rightSidebarIds.indexOf(drawerId) !== -1;
          
          if (isLeftDrawer) {
            var leftToggleGroup = document.querySelector(".sidebar-toggle-group");
            if (leftToggleGroup) {
              // Use actual drawer width from CSS variable
              var drawerWidth = _getSidebarWidth("left");
              leftToggleGroup.style.left = drawerWidth;
            }
          }
          
          if (isRightDrawer) {
            var rightToggleButtons = document.querySelectorAll(
              ".sidebar-toggle.right1, .sidebar-toggle.right2"
            );
            rightToggleButtons.forEach(function (button) {
              var drawerWidth = _getSidebarWidth("right");
              button.style.right = drawerWidth;
            });
          }
          
          _updateMapPadding();
          
          // Restore tab state
          self._onDrawerShow(drawer);
        });
        
        drawer.addEventListener("sl-after-hide", function () {
          var drawerId = drawer.id.replace("-drawer", "");
          var isLeftDrawer = _leftSidebarIds.indexOf(drawerId) !== -1;
          var isRightDrawer = _rightSidebarIds.indexOf(drawerId) !== -1;
          
          if (isLeftDrawer) {
            var leftToggleGroup = document.querySelector(".sidebar-toggle-group");
            if (leftToggleGroup) {
              leftToggleGroup.style.left = "10px";
            }
          }
          
          if (isRightDrawer) {
            var rightToggleButtons = document.querySelectorAll(
              ".sidebar-toggle.right1, .sidebar-toggle.right2"
            );
            rightToggleButtons.forEach(function (button) {
              button.style.right = "10px";
            });
          }
          
          _updateMapPadding();
        });
      });
      
      _drawersSetup = true;
    },
    
    /**
     * Fix toggle button onclick handlers
     * @private
     */
    _fixToggleButtons: function () {
      var self = this;
      
      document.querySelectorAll(".sidebar-toggle").forEach(function (toggleButton) {
        var onclickAttr = toggleButton.getAttribute("onclick");
        if (onclickAttr && onclickAttr.includes("toggleSidebar")) {
          var match = onclickAttr.match(/'([^']+)'/);
          if (match && match[1]) {
            var sidebarId = match[1];
            
            // Clear the original onclick handler
            toggleButton.removeAttribute("onclick");
            
            // Add a new click event listener
            toggleButton.addEventListener("click", function (e) {
              e.preventDefault();
              self.toggleSidebar(sidebarId);
            });
          }
        }
      });
    },

    /**
     * Toggle a sidebar
     * @param {string} sidebarId - The sidebar ID to toggle
     */
    toggleSidebar: function (sidebarId) {
      var sidebar = document.getElementById(sidebarId);
      var drawer = document.getElementById(sidebarId + "-drawer");
      var side = sidebarId.startsWith("left") ? "left" : "right";
      var isLeftSidebar = _leftSidebarIds.indexOf(sidebarId) !== -1;
      var isRightSidebar = _rightSidebarIds.indexOf(sidebarId) !== -1;
      
      // Handle drawers differently
      if (drawer) {
        var leftToggleGroup = document.querySelector(".sidebar-toggle-group");
        var rightToggleButtons = document.querySelectorAll(
          ".sidebar-toggle.right1, .sidebar-toggle.right2"
        );
        
        if (drawer.open) {
          drawer.hide();
          
          // Reset button positions
          if (isLeftSidebar && leftToggleGroup) {
            leftToggleGroup.style.left = "10px";
          }
          if (isRightSidebar) {
            rightToggleButtons.forEach(function (button) {
              button.style.right = "10px";
            });
          }
        } else {
          // Close other drawers on the same side
          var sidebarList = isLeftSidebar ? _leftSidebarIds : _rightSidebarIds;
          sidebarList.forEach(function (id) {
            if (id !== sidebarId) {
              var otherDrawer = document.getElementById(id + "-drawer");
              if (otherDrawer && otherDrawer.open) {
                otherDrawer.hide();
              }
            }
          });
          
          drawer.show();
          
          if (isLeftSidebar && leftToggleGroup) {
            var drawerWidth = _getSidebarWidth("left");
            leftToggleGroup.style.left = drawerWidth;
          }
          if (isRightSidebar) {
            rightToggleButtons.forEach(function (button) {
              var drawerWidth = _getSidebarWidth("right");
              button.style.right = drawerWidth;
            });
          }
        }
        
        // Update map after a short delay
        setTimeout(function () {
          _updateMapPadding();
        }, 50);
        
        return drawer.open;
      }
      
      // Handle traditional sidebars
      if (sidebar) {
        // If sidebar is currently active, close it
        if (_activeSidebars[side] === sidebarId) {
          _closeSidebar(sidebarId);
        } else {
          // Close any open sidebar on the same side
          if (_activeSidebars[side]) {
            _closeSidebar(_activeSidebars[side]);
          }
          // Open the requested sidebar
          _openSidebar(sidebarId);
        }

        // Update map padding
        _updateMapPadding();

        return !sidebar.classList.contains("collapsed");
      }
      
      return false;
    },

    /**
     * Open a specific sidebar
     * @param {string} sidebarId - The sidebar ID to open
     */
    openSidebar: function (sidebarId) {
      var side = sidebarId.startsWith("left") ? "left" : "right";

      // Close any open sidebar on the same side
      if (_activeSidebars[side] && _activeSidebars[side] !== sidebarId) {
        _closeSidebar(_activeSidebars[side]);
      }

      // Open the requested sidebar
      _openSidebar(sidebarId);
      _updateMapPadding();
    },

    /**
     * Close a specific sidebar
     * @param {string} sidebarId - The sidebar ID to close
     */
    closeSidebar: function (sidebarId) {
      _closeSidebar(sidebarId);
      _updateMapPadding();
    },

    /**
     * Check if a sidebar is open
     * @param {string} sidebarId - The sidebar ID to check
     * @returns {boolean} Whether the sidebar is open
     */
    isSidebarOpen: function (sidebarId) {
      return _sidebarStates[sidebarId] || false;
    },

    /**
     * Get active sidebar for a side
     * @param {string} side - 'left' or 'right'
     * @returns {string|null} Active sidebar ID or null
     */
    getActiveSidebar: function (side) {
      return _activeSidebars[side];
    },
    
    /**
     * Initialize tab management for drawers
     * @private
     */
    _initializeTabManagement: function () {
      var self = this;
      
      // Wait for Shoelace components to be defined
      customElements.whenDefined('sl-tab-group').then(function() {
        var drawers = document.querySelectorAll('sl-drawer');
        
        drawers.forEach(function(drawer) {
          var tabGroup = drawer.querySelector('sl-tab-group');
          if (!tabGroup) return;
          
          var drawerId = drawer.id;
          
          // Set up tab change listener
          tabGroup.addEventListener('sl-tab-show', function(event) {
            var tabName = event.detail.name;
            _tabStates.set(drawerId, tabName);
          });
          
          // Initialize tab state on first render
          self._initializeTabState(tabGroup, drawerId);
        });
      });
    },
    
    /**
     * Initialize or restore tab state for a drawer
     * @private
     */
    _initializeTabState: function(tabGroup, drawerId) {
      if (!tabGroup) return;
      
      var tabs = tabGroup.querySelectorAll('sl-tab');
      var panels = tabGroup.querySelectorAll('sl-tab-panel');
      
      if (tabs.length === 0 || panels.length === 0) return;
      
      // Check if we have a saved active tab
      var savedTabName = _tabStates.get(drawerId);
      
      if (savedTabName) {
        // Restore saved tab
        tabs.forEach(function(tab) {
          if (tab.panel === savedTabName) {
            tab.setAttribute('active', '');
          } else {
            tab.removeAttribute('active');
          }
        });
        
        panels.forEach(function(panel) {
          if (panel.name === savedTabName) {
            panel.setAttribute('active', '');
          } else {
            panel.removeAttribute('active');
          }
        });
        
        // Trigger Shoelace's internal update if method exists
        if (typeof tabGroup.show === 'function') {
          tabGroup.show(savedTabName);
        }
      } else {
        // No saved state, find the active tab or use first
        var activeTab = tabGroup.querySelector('sl-tab[active]');
        var activePanel = tabGroup.querySelector('sl-tab-panel[active]');
        
        if (!activeTab || !activePanel) {
          // No active tab, activate first one
          tabs[0].setAttribute('active', '');
          panels[0].setAttribute('active', '');
          
          if (typeof tabGroup.show === 'function') {
            tabGroup.show(tabs[0].panel || panels[0].name);
          }
        }
      }
    },
    
    /**
     * Update tab state when drawer shows
     * @private
     */
    _onDrawerShow: function(drawer) {
      var tabGroup = drawer.querySelector('sl-tab-group');
      if (tabGroup) {
        var drawerId = drawer.id;
        // Small delay to ensure drawer is fully rendered
        setTimeout(() => {
          this._initializeTabState(tabGroup, drawerId);
        }, 50);
      }
    },
  };
})();

console.log("App.UI.Sidebar module loaded");

// Override window.interface.toggleSidebar if it exists
if (window.interface) {
  window.interface.toggleSidebar = function (sidebarId) {
    return App.UI.Sidebar.toggleSidebar(sidebarId);
  };
}
