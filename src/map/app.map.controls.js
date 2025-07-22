/**
 * Map controls management
 * @namespace App.Map.Controls
 */
App.Map = App.Map || {};
App.Map.Controls = (function () {
  // Private variables
  var _map = null;
  var _scaleControl = null;
  var _navigationControl = null;
  var _fullscreenControl = null;
  var _zoomControl = null;
  var _compassControl = null;
  var _controlsAdded = false;
  var _showZoomLevel = false;
  var _zoomTimerId = null;
  var _logoControl = null;
  var _terrainControl = null;

  /**
   * Create a custom logo control
   * @returns {Object} The logo control
   * @private
   */
  function _createLogoControl() {
    class LogoControl {
      onAdd(map) {
        this._map = map;
        this._container = document.createElement("div");

        // Apply specific positioning styles to place below status bar
        this._container.className = "maplibregl-ctrl custom-logo-control";
        this._container.style.position = "absolute";
        this._container.style.top = "-30px"; // Moved up by 20px from original
        this._container.style.left = "1px";
        this._container.style.zIndex = "900"; // Lower than status band
        this._container.style.background = "none"; // Transparent background
        this._container.style.boxShadow = "none"; // Remove box shadow
        this._container.innerHTML = this._container.innerHTML = `
        <sl-animation
          name="bounce"
          iterations="3"
          duration="1000"
          easing="ease-in-out"
          play
        >
          <img width="100px" src="src/assets/geo360-website-geo_high_precision_300.png" alt="Geo360 Logo">
        </sl-animation>
      `;

        return this._container;
      }

      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }
    }

    return new LogoControl();
  }

  /**
   * Create a terrain toggle control
   * @returns {Object} The terrain control
   * @private
   */
  function _createTerrainControl() {
    var TerrainControl = function () {
      this.onAdd = function (map) {
        this._map = map;
        this._container = document.createElement("div");
        this._container.className = "maplibregl-ctrl maplibregl-ctrl-group";

        // Create the terrain toggle button
        this._terrainButton = document.createElement("button");
        this._terrainButton.className = "maplibregl-ctrl-terrain";
        this._terrainButton.type = "button";
        this._terrainButton.title = "Toggle 3D Terrain";

        // Create the icon element with inline SVG
        this._terrainButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
        `;

        // Add click event listener
        this._terrainButton.addEventListener("click", async () => {
          const enable3D = !this._map.getTerrain();
          console.log("Terrain button clicked, enable3D:", enable3D);

          if (enable3D) {
            // Set up terrain
            const success = await App.Map.Terrain.enableTerrain();
            console.log("Terrain enable result:", success);
            
            if (success) {
              // Update button appearance and icon for 3D
              this._terrainButton.className = "maplibregl-ctrl-terrain-enabled";
              this._terrainButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  <path d="M12 2v10"/>
                  <path d="M12 12l-3.5 6"/>
                  <path d="M12 12l3.5 6"/>
                </svg>
              `;
              
              // Zoom to mountainous area to see terrain
              console.log("Terrain enabled, zooming to Alps to demonstrate...");
              this._map.flyTo({
                center: [11.3, 47.3], // Near Innsbruck, Austria  
                zoom: 12,
                pitch: 60,
                bearing: 40,
                duration: 3000
              });
            }
          } else {
            // Disable terrain
            App.Map.Terrain.disableTerrain();

            // Update button appearance and icon for 2D
            this._terrainButton.className = "maplibregl-ctrl-terrain";
            this._terrainButton.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
            `;
          }
        });

        // Add the button to the container
        this._container.appendChild(this._terrainButton);

        return this._container;
      };

      this.onRemove = function () {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      };
    };

    return new TerrainControl();
  }

  /**
   * Create a zoom level indicator control
   * @returns {Object} The zoom level control
   * @private
   */
  function _createZoomLevelControl() {
    return {
      onAdd: function (map) {
        this._map = map;
        this._container = document.createElement("div");
        this._container.className = "zoom-level-control";
        this._container.style.position = "absolute";
        this._container.style.bottom = "35px";
        this._container.style.right = "0px";
        this._container.style.padding = "2px 4px";
        this._container.style.backgroundColor = "rgba(255, 255, 255, 0.4)";
        this._container.style.borderRadius = "3px";
        this._container.style.fontSize = "8px";
        this._container.style.display = "inline-block";
        this._container.style.whiteSpace = "nowrap";
        this._container.innerHTML = `Zoom: ${map.getZoom().toFixed(2)}`;

        map.on("zoomend", () => {
          this._container.innerHTML = `Zoom: ${map.getZoom().toFixed(2)}`;
        });

        return this._container;
      },

      onRemove: function () {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      },
    };
  }

  /**
   * Create a Geo360 navigation button control
   * @returns {Object} The navigation button control
   * @private
   */
  function _createNavigationButtonControl() {
    class Geo360NavButtonControl {
      onAdd(map) {
        this.followMode = false; // Track whether follow mode is active
        this.longPressTimeout = null;
        this._map = map;
        this._container = document.createElement("div");
        this._container.className = "maplibregl-ctrl maplibregl-ctrl-group";

        // Add custom CSS to arrange buttons vertically
        this._container.style.display = "flex";
        this._container.style.flexDirection = "column";

        // First Button (Locate Fixed)
        const btnCenter = document.createElement("button");
        btnCenter.className = "maplibregl-ctrl-icon";
        btnCenter.type = "button";
        btnCenter.title = "Center map"; // Tooltip for the first button

        // Set the button innerHTML to the provided SVG for Locate Fixed
        btnCenter.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-locate-fixed">
            <line x1="2" x2="5" y1="12" y2="12"/>
            <line x1="19" x2="22" y1="12" y2="12"/>
            <line x1="12" x2="12" y1="2" y2="5"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
            <circle cx="12" cy="12" r="7"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        `;

        // Attach events for short click (center map) and long click (toggle follow mode)
        btnCenter.addEventListener(
          "mousedown",
          this.handleMouseDown.bind(this, btnCenter)
        );
        btnCenter.addEventListener("mouseup", this.handleMouseUp.bind(this));
        btnCenter.addEventListener(
          "mouseleave",
          this.handleMouseLeave.bind(this)
        );

        btnCenter.addEventListener("dblclick", () => {
          this._map.setZoom(18); // Set the zoom level to 18 on double-click
          console.log("Double-click detected: Zoom level set to 18");
        });

        // Touch events for mobile compatibility
        btnCenter.addEventListener(
          "touchstart",
          this.handleMouseDown.bind(this, btnCenter)
        );
        btnCenter.addEventListener("touchend", this.handleMouseUp.bind(this));
        btnCenter.addEventListener(
          "touchcancel",
          this.handleMouseLeave.bind(this)
        ); // Equivalent of mouseleave

        // Second Button (Custom Action)
        const btnExtent = document.createElement("button");
        btnExtent.className = "maplibregl-ctrl-icon";
        btnExtent.type = "button";
        btnExtent.title = "Custom Action"; // Tooltip for the second button

        // Set the second button's innerHTML to another SVG or icon
        btnExtent.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize-2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>
        `;

        // Attach a click event listener to the second button
        btnExtent.addEventListener("click", () => {
          // Toggle manual mode if available
          App.Map.Layers.zoomToAllGeoJsonFeatures({
            padding: 20,
            animate: true,
          });
        });

        // Append both buttons to the control container
        this._container.appendChild(btnCenter);
        this._container.appendChild(btnExtent);

        return this._container;
      }

      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }

      // Handle mousedown or touchstart
      handleMouseDown(btnCenter) {
        console.log("mousedown or touchstart event triggered");
        this.longPressTimeout = setTimeout(() => {
          console.log("Long press detected, entering follow mode");
          this.toggleFollowMode(btnCenter);
        }, 1000); // Long press detection (1 second)
      }

      // Handle mouseup or touchend
      handleMouseUp() {
        console.log("mouseup or touchend event triggered");
        clearTimeout(this.longPressTimeout); // Cancel long press if it's just a short click
        if (!this.followMode) {
          console.log("Short click detected, centering map");
          this.centerMapOnCurrentLocation(); // On short click, center the map
        }
      }

      // Handle mouseleave or touchcancel (reset long press timeout)
      handleMouseLeave() {
        console.log(
          "mouseleave or touchcancel event triggered, resetting long press"
        );
        clearTimeout(this.longPressTimeout); // Reset the long press if user moves away from button
      }

      toggleFollowMode(button) {
        this.followMode = !this.followMode;

        // Get the SVG icon element inside the button
        const svgIcon = button.querySelector("svg");

        if (this.followMode) {
          console.log("Follow mode enabled");
          svgIcon.style.stroke = "green"; // Change the SVG icon color to green
          this.startFollowMode();
        } else {
          console.log("Follow mode disabled");
          svgIcon.style.stroke = "currentColor"; // Reset the SVG icon color
          this.stopFollowMode();
        }
      }

      // Function to center the map on the current location
      centerMapOnCurrentLocation() {
        if (App.Map.Navigation) {
          // Get current GNSS location from the Navigation module
          const gnssLocation = App.Map.Navigation.getGnssLocation();
          console.log("Current GNSS location:", gnssLocation);
          
          // Check if we have a valid GPS location (not the default)
          if (gnssLocation && 
              gnssLocation[0] !== 14.222929599999969 && // Not default longitude
              gnssLocation[0] !== 0 && gnssLocation[1] !== 0) { // Not zero coordinates
            
            // Center map to GPS location with zoom level 17.5
            this._map.easeTo({
              center: gnssLocation,
              zoom: 17.5,
              duration: 1000,
              easing: function (t) {
                return t * (2 - t);
              }
            });
            console.log("Centered map to GPS location:", gnssLocation);
          } else {
            // No valid GPS location available
            console.log("No valid GPS location available");
            
            // Try to use the navigation module's center method as fallback
            if (typeof App.Map.Navigation.centerOnCurrentLocation === "function") {
              App.Map.Navigation.centerOnCurrentLocation();
            } else {
              // If no GPS is available, show a message to the user
              console.warn("GPS location not available. Please ensure GPS is enabled.");
              
              // Optionally, you could trigger a GPS request through the Android bridge
              if (window.reha && typeof window.reha.sendCallback === "function") {
                // This will notify Android that we need GPS location
                // Android should respond by calling updateGPSLocation with current position
                window.reha.sendCallback("centerMapRequested", "");
              }
            }
          }
        }
      }

      // Function to start follow mode
      startFollowMode() {
        if (App.Map.Navigation) {
          App.Map.Navigation.toggleFollowMode();
        }
      }

      // Function to stop follow mode
      stopFollowMode() {
        if (App.Map.Navigation) {
          App.Map.Navigation.toggleFollowMode();
        }
      }
    }

    return new Geo360NavButtonControl();
  }

  /**
   * Create a StakeOut button control
   * @returns {Object} The StakeOut button control
   * @private
   */
  function _createStakeOutButtonControl() {
    class G360StakeButtonControl {
      onAdd(map) {
        this._map = map;
        this._container = document.createElement("div");
        this._container.id = "G360StakeButtonControl"; // Add an ID for easy selection
        this._container.className = "maplibregl-ctrl maplibregl-ctrl-group";

        // Add custom CSS to arrange buttons vertically
        this._container.style.display = "flex";
        this._container.style.flexDirection = "column";
        this._container.style.position = "absolute"; // Make sure it's positioned absolutely
        this._container.style.right = "0px"; // Set initial right position
        this._container.style.bottom = "38px"; // Set bottom position for alignment

        // First Button (Stakeout)
        const button1 = document.createElement("button");
        button1.className = "maplibregl-ctrl-icon";
        button1.type = "button";
        button1.title = "Stakeout"; // Tooltip for the first button
        button1.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-goal"><path d="M12 13V2l8 4-8 4"/><path d="M20.561 10.222a9 9 0 1 1-12.55-5.29"/><path d="M8.002 9.997a5 5 0 1 0 8.9 2.02"/></svg>`;

        // Stakeout button action
        button1.addEventListener("click", () => {
          if (App.Features.StakeOut) {
            App.Features.StakeOut.clearTargetFeature();
            App.Features.StakeOut.stopNavigation();
          }
        });

        // Second Button (Measure)
        const button2 = document.createElement("button");
        button2.className = "maplibregl-ctrl-icon";
        button2.type = "button";
        button2.title = "Measure"; // Tooltip for the second button
        button2.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ruler"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>`;

        // Measure button action
        button2.addEventListener("click", () => {
          if (App.Map.Navigation) {
            App.Map.Navigation.setPositionEnabled(true);
            App.Map.Navigation.updateLocationMarker("cursor-green.png");
            App.Map.Navigation.startWalkingSimulation();
          }
        });

        // Append both buttons to the control container
        this._container.appendChild(button1);
        this._container.appendChild(button2);

        return this._container;
      }

      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }
    }

    return new G360StakeButtonControl();
  }

  /**
   * Shows or hides the zoom level indicator
   * @param {boolean} show - Whether to show the indicator
   * @private
   */
  function _toggleZoomLevelIndicator(show) {
    if (show && !_showZoomLevel) {
      console.log("Setting up zoom level indicator");

      // Create indicator element if it doesn't exist
      let zoomIndicator = document.getElementById("zoom-level-indicator");
      if (!zoomIndicator) {
        console.log("Creating zoom level indicator element");
        zoomIndicator = document.createElement("div");
        zoomIndicator.id = "zoom-level-indicator";
        zoomIndicator.style.position = "absolute";
        zoomIndicator.style.top = "50px";
        zoomIndicator.style.left = "10px";
        zoomIndicator.style.backgroundColor = "rgba(244, 244, 244, 0.2)";
        zoomIndicator.style.color = "#000000";
        zoomIndicator.style.padding = "6px 6px";
        zoomIndicator.style.borderRadius = "12px";
        zoomIndicator.style.fontFamily = "Roboto, sans-serif";
        zoomIndicator.style.fontSize = "12px";
        zoomIndicator.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
        zoomIndicator.style.boxShadow = "0 0 10px rgba(255,255,255,0.2)";
        zoomIndicator.style.zIndex = "1000";
        zoomIndicator.textContent = "Zoom: loading..."; // Default text
        document.body.appendChild(zoomIndicator);
      }

      // Direct function to update zoom text
      const updateZoom = () => {
        if (_map) {
          try {
            const zoom = _map.getZoom();
            const zoomText =
              zoom !== undefined ? zoom.toFixed(4) : "unavailable";
            zoomIndicator.textContent = `Zoom: ${zoomText}`;
          } catch (e) {
            console.error("Error getting zoom level:", e);
            zoomIndicator.textContent = "Zoom: error";
          }
        } else {
          console.warn("Map not available for zoom level");
          zoomIndicator.textContent = "Zoom: no map";
        }
      };

      // Immediate update - don't wait for events
      updateZoom();

      // Try both standard events and manual timer
      _map.on("zoom", updateZoom);
      _map.on("zoomend", updateZoom);
      _map.on("move", updateZoom);

      // Safety timer as backup - update every second regardless of events
      _zoomTimerId = setInterval(updateZoom, 1000);
      _showZoomLevel = true;
    } else if (!show && _showZoomLevel) {
      const zoomIndicator = document.getElementById("zoom-level-indicator");
      if (zoomIndicator) {
        console.log("Removing zoom level indicator");
        zoomIndicator.remove();
      }

      if (_zoomTimerId) {
        clearInterval(_zoomTimerId);
        _zoomTimerId = null;
      }

      _showZoomLevel = false;
    }
  }

  // Public API
  return {
    /**
     * Initialize controls
     * @param {Object} map - The MapLibre map instance
     */
    initialize: function (map) {
      _map = map;

      // Add basic controls
      this.addDefaultControls();

      console.log("Map controls initialized");
    },

    /**
     * Add the default set of controls to the map
     */
    addDefaultControls: function () {
      if (_controlsAdded) return;

      // Logo
      _logoControl = _createLogoControl();
      _map.addControl(_logoControl, "top-left");

      // Terrain toggle
      _terrainControl = _createTerrainControl();
      //_map.addControl(_terrainControl, "top-right");

      // Navigation control (compass only)
      _navigationControl = new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: false,
        visualizePitch: true,
      });
      _map.addControl(_navigationControl, "top-right");

      // Zoom control (zoom only) - Don't add by default, controlled by UI settings
      // _zoomControl = new maplibregl.NavigationControl({
      //   showCompass: false,
      //   showZoom: true,
      // });
      // _map.addControl(_zoomControl, "bottom-right");

      // Scale control - Commented out as it's managed by bridgeInterfaceML.js toggle
      // _scaleControl = new maplibregl.ScaleControl({
      //   maxWidth: 100,
      //   unit: "metric",
      // });
      // _map.addControl(_scaleControl, "bottom-left");

      // Add navigation button control
      _map.addControl(_createNavigationButtonControl(), "bottom-left");

      // Add StakeOut button control
      //_map.addControl(_createStakeOutButtonControl(), "bottom-right");

      _controlsAdded = true;
      console.log("Default controls added to map");
    },

    /**
     * Set scale control enabled/disabled
     * @param {boolean} enabled - Whether to enable the scale control
     */
    setScaleEnabled: function (enabled) {
      if (enabled) {
        if (!_scaleControl) {
          _scaleControl = new maplibregl.ScaleControl({
            maxWidth: 100,
            unit: "metric",
          });
          _map.addControl(_scaleControl, "bottom-left");
        }
      } else {
        if (_scaleControl) {
          _map.removeControl(_scaleControl);
          _scaleControl = null;
        }
      }
    },

    /**
     * Set scale units (metric or imperial)
     * @param {boolean} useMetric - Whether to use metric units
     */
    setScaleUnits: function (useMetric) {
      if (_scaleControl) {
        _scaleControl.setUnit(useMetric ? "metric" : "imperial");
        console.log(`Scale units set to ${useMetric ? "metric" : "imperial"}`);
      }
    },

    /**
     * Set zoom control enabled/disabled
     * @param {boolean} enabled - Whether to enable the zoom control
     */
    setZoomEnabled: function (enabled) {
      if (enabled) {
        if (!_zoomControl) {
          _zoomControl = new maplibregl.NavigationControl({
            showCompass: false,
            showZoom: true,
          });
          _map.addControl(_zoomControl, "bottom-right");
          console.log("Zoom control added");
        }
      } else {
        if (_zoomControl) {
          _map.removeControl(_zoomControl);
          _zoomControl = null;
          console.log("Zoom control removed");
        }
      }
    },
    
    /**
     * Get the zoom control instance
     * @returns {Object|null} The zoom control or null
     */
    getZoomControl: function () {
      return _zoomControl;
    },

    /**
     * Show or hide the zoom level indicator
     * @param {boolean} show - Whether to show the indicator
     */
    showZoomLevel: function (show) {
      _toggleZoomLevelIndicator(show);
    },

    /**
     * Add a custom control to the map
     * @param {Object} control - The control to add
     * @param {string} position - The position on the map
     */
    addControl: function (control, position) {
      _map.addControl(control, position);
    },

    /**
     * Remove a control from the map
     * @param {Object} control - The control to remove
     */
    removeControl: function (control) {
      _map.removeControl(control);
    },

    /**
     * Update the position of controls based on sidebar state
     * @param {number} rightOffset - The right offset for controls
     */
    updateControlPositions: function (rightOffset) {
      // Get all controls that need to be repositioned
      const controls = document.querySelectorAll(
        ".zoom-level-control, .maplibregl-ctrl-group, #G360StakeButtonControl"
      );

      // Update their positions
      controls.forEach((control) => {
        if (control) {
          control.style.right = `${rightOffset}px`;
        }
      });
    },
  };
})();

console.log("app.map.controls.js loaded - App.Map.Controls module created");
