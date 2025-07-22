/**
 * Status Footer Interface - Bridge functions to update status information from Android
 * Updated to work with the new StatusFooter Web Component
 */
class StatusFooterBridge {
  constructor() {
    this.initComponent();
  }

  // Initialize the component reference
  initComponent() {
    // Use the global statusFooterBridge if available
    if (window.statusFooterBridge) {
      console.log("Using global status footer bridge");
      return;
    }
    
    this.statusFooter = document.querySelector("status-footer-ultrathin") || 
                       document.querySelector("status-footer-mobile") || 
                       document.querySelector("status-footer");

    if (!this.statusFooter) {
      console.error("Status footer Web Component not found");
      return;
    }

    console.log("Status footer bridge initialized with:", this.statusFooter.tagName);
  }

  // Update the main status bar
  updateStatusBar(data) {
    try {
      // Use global bridge if available
      if (window.statusFooterBridge) {
        window.statusFooterBridge.updateStatusBar({
          deviceName: data.deviceName,
          tiltStatus: data.tiltStatus,
          fixTime: data.fixTime,
          rtkStatus: data.rtkStatus,
          accuracy: data.accuracy,
          accuracyClass: data.accuracyClass,
          satellites: data.satellites
        });
        return true;
      }
      
      // Fallback to direct update
      console.warn("Global status footer bridge not available, using fallback");
      return false;
    } catch (error) {
      console.error("Error updating status bar:", error);
      return false;
    }
  }

  // Update coordinates section
  updateCoordinates(data) {
    try {
      // Use global bridge if available
      if (window.statusFooterBridge) {
        window.statusFooterBridge.updateCoordinates(data);
        return true;
      }
      
      console.warn("Global status footer bridge not available, using fallback");
      return false;
    } catch (error) {
      console.error("Error updating coordinates:", error);
      return false;
    }
  }

  // Update GNSS information
  updateGnssInfo(data) {
    try {
      // Use global bridge if available
      if (window.statusFooterBridge) {
        window.statusFooterBridge.updateGnssInfo({
          vrmsHrms: data.vrmsHrms,
          vdopPdop: data.vdopPdop,
          ntripStatus: data.ntripStatus,
          rtcmStatus: data.rtcmStatus,
          satelliteCount: data.satelliteCount,
          speed: data.speed,
          hdop: data.hdop,
          pdop: data.pdop
        });
        return true;
      }
      
      console.warn("Global status footer bridge not available, using fallback");
      return false;
    } catch (error) {
      console.error("Error updating GNSS info:", error);
      return false;
    }
  }

  // Update device information
  updateDeviceInfo(data) {
    try {
      // Use global bridge if available
      if (window.statusFooterBridge) {
        window.statusFooterBridge.updateDeviceInfo({
          tiltInfo: data.tiltInfo,
          batteryPercentage: data.batteryPercentage,
          temperature: data.temperature,
          uptime: data.uptime,
          memory: data.memory
        });
        return true;
      }
      
      console.warn("Global status footer bridge not available, using fallback");
      return false;
    } catch (error) {
      console.error("Error updating device info:", error);
      return false;
    }
  }

  // Update all status footer sections at once
  updateAllStatus(data) {
    try {
      // Use global bridge if available
      if (window.statusFooterBridge) {
        window.statusFooterBridge.updateAllStatus(data);
        return true;
      }
      
      console.warn("Global status footer bridge not available, using fallback");
      return false;
    } catch (error) {
      console.error("Error updating all status:", error);
      return false;
    }
  }

  // Toggle expanded sections visibility
  toggleExpandedSections(show) {
    try {
      // Use global bridge if available
      if (window.statusFooterBridge) {
        window.statusFooterBridge.toggleExpandedSections(show);
        return true;
      }
      
      // Fallback to direct method
      if (this.statusFooter) {
        // The Web Component handles this internally through its toggleExpanded method
        // We can trigger it by simulating a click on the status bar or toggle button
        if (show === undefined) {
          // Toggle if no parameter provided
          this.statusFooter.toggleExpanded();
        } else {
          // Get current state from the component
          const expandedSections =
            this.statusFooter.shadowRoot.querySelector("#expanded-sections");
          const isCurrentlyExpanded =
            !expandedSections.classList.contains("hidden");

          // Only toggle if the desired state is different from current state
          if (show !== isCurrentlyExpanded) {
            this.statusFooter.toggleExpanded();
          }
        }

        return true;
      }
      
      console.warn("Global status footer bridge not available, using fallback");
      return false;
    } catch (error) {
      console.error("Error toggling expanded sections:", error);
      return false;
    }
  }

  // Methods that are handled by the Web Component internally
  updateAccuracy(accuracy, accuracyClass) {
    // This is now handled internally by the Web Component
    console.log(
      "updateAccuracy is now handled internally by the Web Component"
    );
  }

  updateTiltStatusIcon(status) {
    // This is now handled internally by the Web Component
    console.log(
      "updateTiltStatusIcon is now handled internally by the Web Component"
    );
  }

  // Legacy compatibility method - the Web Component handles this automatically now
  updateMapControlPositioning(expanded) {
    // This is now handled by the Web Component's toggleBottomControls method
    console.log("Map control positioning is now handled by the Web Component");
  }
}

/**
 * ObjectInfo Bridge - Bridge functions to display feature information from Android in the right1 sidebar
 */
class ObjectInfoBridge {
  constructor() {
    this.objectInfoComponent = null;
    this.currentFeature = null;
    console.log("🔧 ObjectInfoBridge: Constructor called");
    this.initComponent();
  }

  initComponent() {
    console.log("🔧 ObjectInfoBridge.initComponent: Starting initialization");

    // Wait for the DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.setupComponent()
      );
    } else {
      this.setupComponent();
    }
  }

  setupComponent() {
    // Find the right1-drawer
    const drawer = document.getElementById("right1-drawer");
    if (!drawer) {
      console.error("❌ ObjectInfoBridge: right1-drawer not found");
      return;
    }

    // Check if component already exists
    this.objectInfoComponent = drawer.querySelector("object-info");
    if (this.objectInfoComponent) {
      console.log("✅ ObjectInfo component already exists in drawer");
      return;
    }

    // Find the sidebar content - don't clear it if it exists
    let sidebarContent = drawer.querySelector(".sidebar-content");
    if (!sidebarContent) {
      console.error("❌ No sidebar-content found in drawer");
      return;
    }

    // Check again if component exists in sidebar content
    this.objectInfoComponent = sidebarContent.querySelector("object-info");
    if (this.objectInfoComponent) {
      console.log("✅ ObjectInfo component found in sidebar content");
      return;
    }

    console.error("❌ ObjectInfo component not found - it should be defined in index.html");
  }

  /**
   * Display feature information in the right1 sidebar
   * @param {Object} feature - The feature data to display
   * @param {boolean} openSidebar - Whether to open the sidebar if it's closed
   * @returns {boolean} - Success status
   */
  displayFeature(feature, openSidebar = true) {
    try {
      // Log the raw feature data for debugging
      console.log("📥 Raw feature data received:", feature);

      // Parse feature if it's a string
      if (typeof feature === "string") {
        try {
          feature = JSON.parse(feature);
          console.log("📥 Parsed feature data:", feature);
        } catch (parseError) {
          console.error("❌ Error parsing feature JSON:", parseError);
          return false;
        }
      }

      this.currentFeature = feature;

      // Try to find the component if we don't have it
      if (!this.objectInfoComponent) {
        // Try multiple selectors
        this.objectInfoComponent = document.querySelector("object-info") || 
                                  document.querySelector("#right1-drawer object-info") ||
                                  document.querySelector(".sidebar-content object-info");
        
        if (this.objectInfoComponent) {
          console.log("✅ Found object-info component");
        }
      }

      // Use the component
      if (this.objectInfoComponent && typeof this.objectInfoComponent.setFeature === 'function') {
        try {
          this.objectInfoComponent.setFeature(feature);
          console.log("✅ Feature set using objectInfoBridge");
        } catch (error) {
          console.error("❌ Error setting feature in objectInfoBridge:", error);
        }
      } else {
        console.error("❌ ObjectInfo component not found or setFeature not available");
        // Try one more time after a delay
        setTimeout(() => {
          const component = document.querySelector("object-info");
          if (component && typeof component.setFeature === 'function') {
            component.setFeature(feature);
            console.log("✅ Feature set after delay");
          }
        }, 100);
        return false;
      }

      // Open sidebar if requested
      if (openSidebar) {
        const drawer = document.getElementById("right1-drawer");
        const map = document.getElementById("map");

        if (drawer) {
          // Using Shoelace's drawer API
          drawer.show();

          // Add class to map to adjust width
          if (map) {
            map.classList.add("drawer-open");
          }

          console.log("✅ Right sidebar opened");
        }
      }

      return true;
    } catch (error) {
      console.error("❌ Error displaying feature information:", error);
      console.error("Stack trace:", error.stack);
      return false;
    }
  }

  /**
   * Clear the current feature display
   */
  clearFeature() {
    if (
      this.objectInfoComponent &&
      typeof this.objectInfoComponent.clearFeature === "function"
    ) {
      this.objectInfoComponent.clearFeature();
      console.log("✅ Feature cleared");
    }
  }

  /**
   * Close the drawer
   */
  closeDrawer() {
    const drawer = document.getElementById("right1-drawer");
    const map = document.getElementById("map");

    if (drawer) {
      drawer.hide();

      // Remove class from map to restore full width
      if (map) {
        map.classList.remove("drawer-open");
      }

      console.log("✅ Right sidebar closed");
    }
  }

  /**
   * Display sample feature (for testing)
   */
  displaySampleFeature() {
    const sampleFeature = {
      id: "FT-2025-03-28-001",
      name: "Water Valve #42",
      description: "Newly installed valve, needs inspection in 6 months",
      type: "Point",
      location: {
        Longitude: "-122.4194456",
        Latitude: "37.7749456",
        Altitude: "42.32 m",
        X: "551234.23",
        Y: "4179456.78",
        Z: "18.30",
        "Recording Mode": "RTK Fixed",
        Accuracy: "±0.012 m",
      },
      attributes: {
        Diameter: "200 mm",
        Material: "Ductile Iron",
        Pressure: "16 bar",
      },
      creationInfo: {
        "Creation Time": "2025-03-28 09:45:22",
        User: "John Smith",
      },
    };

    this.displayFeature(sampleFeature, true);
  }
}

// Initialize bridges ONLY ONCE
document.addEventListener("DOMContentLoaded", function () {
  console.log("📄 DOMContentLoaded: Initializing bridges");

  // Initialize StatusFooterBridge only if it doesn't exist
  if (!window.statusFooterBridge) {
    window.statusFooterBridge = new StatusFooterBridge();
    console.log(
      "✅ StatusFooterBridge initialized and attached to window object"
    );
  } else {
    console.log(
      "✅ StatusFooterBridge already exists, skipping initialization"
    );
  }

  // Initialize ObjectInfoBridge after ensuring component is defined
  if (!window.objectInfoBridge) {
    // Wait for object-info component to be defined
    customElements.whenDefined('object-info').then(() => {
      console.log("✅ object-info component is defined, initializing bridge");
      window.objectInfoBridge = new ObjectInfoBridge();
      console.log(
        "✅ ObjectInfoBridge initialized and attached to window object"
      );

      // Add a debug helper to test the functionality
      window.testObjectInfo = function () {
        window.objectInfoBridge.displaySampleFeature();
      };
    }).catch(err => {
      console.error("❌ Error waiting for object-info component:", err);
      // Initialize anyway
      window.objectInfoBridge = new ObjectInfoBridge();
    });
  } else {
    console.log("✅ ObjectInfoBridge already exists, skipping initialization");
  }
});
