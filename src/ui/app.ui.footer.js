/**
 * Status footer management
 * @namespace App.UI.Footer
 */
App.UI = App.UI || {};
App.UI.Footer = (function () {
  // Private variables
  var _realDataReceived = false;
  var _demoIntervalId = null;
  var _debugEnabled = false;

  /**
   * Sets up the footer UI interactions
   * @private
   */
  function _setupFooterInteractions() {
    // Skip if elements don't exist (using new StatusFooter instead)
    const statusBar = document.querySelector(".status-bar");
    const expandedSections = document.getElementById("expanded-sections");
    const toggleButton = document.getElementById("toggle-expand");
    
    if (!statusBar) {
      console.log('[Footer] Old status bar not found, using new StatusFooter');
      return;
    }
    const chevronIcon = toggleButton
      ? toggleButton.querySelector("sl-icon")
      : null;

    if (statusBar && expandedSections && toggleButton) {
      // Clean up any existing click handlers
      const newStatusBar = statusBar.cloneNode(true);
      statusBar.parentNode.replaceChild(newStatusBar, statusBar);

      // Add click handler to toggle expanded sections
      newStatusBar.addEventListener("click", function (e) {
        // Don't toggle if the coordinate format switch button was clicked
        if (e.target.closest("#coord-format-switch")) {
          return;
        }
        _toggleExpandedSections();
      });

      // Add click handler to the toggle button
      if (toggleButton) {
        toggleButton.addEventListener("sl-click", function (e) {
          e.stopPropagation();
          _toggleExpandedSections();
        });
      }

      console.log("Footer interactions set up successfully");
    } else {
      console.warn("Required elements for footer interactions not found");
    }
  }

  /**
   * Toggles the expanded sections of the footer
   * @private
   */
  function _toggleExpandedSections() {
    const expandedSections = document.getElementById("expanded-sections");
    const chevronIcon = document.getElementById("chevron-icon");

    if (expandedSections) {
      const isExpanding = expandedSections.classList.contains("hidden");
      expandedSections.classList.toggle("hidden");

      // Update chevron icon direction
      if (chevronIcon) {
        chevronIcon.name = isExpanding ? "chevron-down" : "chevron-up";
      }

      // Toggle bottom controls visibility
      _toggleBottomControls(!isExpanding);
    }
  }

  /**
   * Toggles the visibility of bottom map controls
   * @param {boolean} show - Whether to show the controls
   * @private
   */
  function _toggleBottomControls(show) {
    try {
      // Find all bottom controls
      const bottomControls = document.querySelectorAll(
        ".maplibregl-ctrl-bottom-left, .maplibregl-ctrl-bottom-right, #G360StakeButtonControl, .maplibregl-ctrl-scale"
      );

      // Set visibility based on parameter
      bottomControls.forEach((control) => {
        if (control) {
          control.style.visibility = show ? "visible" : "hidden";
          control.style.opacity = show ? "1" : "0";
          control.style.transition = "opacity 0.3s ease";
        }
      });

      console.log(
        `Bottom controls visibility set to: ${show ? "visible" : "hidden"}`
      );
    } catch (error) {
      console.error("Error toggling bottom controls:", error);
    }
  }

  // Public API
  return {
    /**
     * Initialize the status footer
     */
    initialize: function () {
      console.log("Status footer initialization started");
      
      // Check if we should skip initialization (using new StatusFooter)
      if (!document.querySelector(".status-bar") && !document.getElementById("expanded-sections")) {
        console.log('[Footer] Old footer elements not found, skipping initialization');
        return;
      }

      // Wait for Shoelace components to be defined
      Promise.all([
        customElements.whenDefined("sl-icon"),
        customElements.whenDefined("sl-button"),
        customElements.whenDefined("sl-badge"),
        customElements.whenDefined("sl-progress-bar"),
      ])
        .then(() => {
          console.log(
            "Shoelace components defined, continuing with status footer initialization"
          );

          // Initial setup for the footer interactions
          _setupFooterInteractions();

          // Setup coordinate format switching
          this.setupCoordinateFormatSwitching();

          // Check if we're in a browser environment or Android WebView
          const isBrowserEnvironment =
            !window.AndroidBridge &&
            !window.Android &&
            !navigator.userAgent.includes("Android WebView");

          console.log("Running in browser environment:", isBrowserEnvironment);

          // Start demo updates - in browser they'll continue, in Android they'll stop when real data arrives
          this.startDemoUpdates(isBrowserEnvironment);
        })
        .catch((error) => {
          console.error("Error waiting for Shoelace components:", error);
        });
    },

    // Add other footer methods...

    /**
     * Sets up coordinate format switching
     */
    setupCoordinateFormatSwitching: function () {
      // Your existing implementation
    },

    /**
     * Starts demo updates for the status footer
     * @param {boolean} continueInBrowser - Whether to continue updates indefinitely in browser environment
     * @returns {number} Interval ID for the demo updates
     */
    startDemoUpdates: function (continueInBrowser) {
      // Your existing implementation
    },

    /**
     * Updates the UI with provided data
     * @param {Object} data - The data to update the status bar with
     */
    updateStatusBarUI: function (data) {
      // Your existing implementation
    },
  };
})();
