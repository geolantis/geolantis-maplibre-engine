/**
 * StakeOut Master Integration
 * This script ties together all StakeOut components and ensures proper functionality
 * with the Dynamic Button and any GPS source (external, simulator, etc.)
 */
(function () {
  console.log("Initializing StakeOut Master Integration...");

  // Wait for all required components to load
  function initStakeOutIntegration() {
    // Check if core modules are loaded
    if (
      !App.Features ||
      !App.Features.StakeOut ||
      !App.UI ||
      !App.UI.DynamicButton
    ) {
      console.log("Waiting for required modules to load...");
      setTimeout(initStakeOutIntegration, 500);
      return;
    }

    console.log(
      "All required modules loaded, setting up StakeOut integration..."
    );

    // Step 1: Ensure StakeOut has all required methods
    ensureStakeOutMethods();

    // Step 2: Set up Dynamic Button integration
    setupDynamicButtonIntegration();

    // Step 3: Set up GPS integration (if not already done)
    setupGPSIntegration();

    // Step 4: Connect to events
    setupEventListeners();

    // Step 5: Add stop/start methods if needed
    addStopStartMethods();

    console.log("StakeOut Master Integration complete");
  }

  // Ensure StakeOut has all required methods
  function ensureStakeOutMethods() {
    // Make sure we have necessary methods
    if (!App.Features.StakeOut.isFeatureTypeSupported) {
      App.Features.StakeOut.isFeatureTypeSupported = function (feature) {
        if (!feature || !feature.geometry || !feature.geometry.type) {
          return false;
        }
        return (
          feature.geometry.type === "Polygon" ||
          feature.geometry.type === "MultiPolygon"
        );
      };
      console.log("Added isFeatureTypeSupported method to StakeOut");
    }

    // Add active state tracking if not present
    if (App.Features.StakeOut._stakeOutActive === undefined) {
      App.Features.StakeOut._stakeOutActive = false;
      console.log("Added _stakeOutActive state to StakeOut");
    }

    // Add setActive method if not present
    if (typeof App.Features.StakeOut.setActive !== "function") {
      App.Features.StakeOut.setActive = function (active) {
        this._stakeOutActive = active;
        console.log("StakeOut active state set to:", active);

        // Trigger appropriate event
        if (App.Core && App.Core.Events) {
          App.Core.Events.trigger(
            active ? "stakeout:started" : "stakeout:stopped",
            {
              feature: App.Core.State.get("map.lastSelectedFeature"),
            }
          );
        }
      };
      console.log("Added setActive method to StakeOut");
    }

    // Save the currently active polygon feature
    if (App.Features.StakeOut._activePolygonFeature === undefined) {
      App.Features.StakeOut._activePolygonFeature = null;
      console.log("Added _activePolygonFeature property to StakeOut");
    }
  }

  // Set up Dynamic Button integration
  function setupDynamicButtonIntegration() {
    console.log("Setting up Dynamic Button integration...");

    // Register handlers for start/stop StakeOut
    App.UI.DynamicButton.onAction("startNavigation", function () {
      const lastFeature = App.Core.State.get("map.lastSelectedFeature");

      if (!lastFeature) {
        showAlert(
          "warning",
          "No Feature Selected",
          "Please select a polygon feature before starting StakeOut."
        );
        return;
      }

      if (!App.Features.StakeOut.isFeatureTypeSupported(lastFeature)) {
        const featureType = lastFeature.geometry
          ? lastFeature.geometry.type
          : "Unknown";
        showAlert(
          "warning",
          "Feature Type Not Supported",
          `StakeOut does not support ${featureType}. Supported types: Point, LineString, Polygon, and their Multi variants.`
        );
        return;
      }

      const success = App.Features.StakeOut.activateForLastSelectedFeature();

      if (success) {
        showAlert(
          "success",
          "StakeOut Started",
          "Navigation to selected polygon has started. Follow the directional arrows."
        );

        // Store active polygon
        App.Features.StakeOut._activePolygonFeature = lastFeature;

        // Set active state
        App.Features.StakeOut.setActive(true);

        // Change Dynamic Button mode
        App.UI.DynamicButton.setMode("navigation");
      }
    });

    // Register handler for stopping StakeOut
    App.UI.DynamicButton.onAction("stopNavigation", function () {
      if (typeof App.Features.StakeOut.cleanup === "function") {
        App.Features.StakeOut.cleanup();
      }

      // Clear active state
      App.Features.StakeOut.setActive(false);

      // Clear active polygon
      App.Features.StakeOut._activePolygonFeature = null;

      // Change Dynamic Button mode
      App.UI.DynamicButton.setMode("default");

      showAlert("info", "StakeOut Stopped", "Navigation has been stopped.");
    });

    // Register handler for reset target
    App.UI.DynamicButton.onAction("resetTarget", function () {
      // Clear the selected feature
      if (App.Core.State) {
        App.Core.State.set("map.lastSelectedFeature", null);
      }

      // Clear active polygon
      App.Features.StakeOut._activePolygonFeature = null;

      // If StakeOut is active, stop it
      if (App.Features.StakeOut._stakeOutActive) {
        if (typeof App.Features.StakeOut.cleanup === "function") {
          App.Features.StakeOut.cleanup();
        }

        // Clear active state
        App.Features.StakeOut.setActive(false);

        // Change Dynamic Button mode
        App.UI.DynamicButton.setMode("default");
      }

      showAlert(
        "info",
        "Target Reset",
        "The target feature has been cleared. Select a new feature for StakeOut."
      );
    });

    console.log("Dynamic Button integration complete");
  }

  // Set up GPS integration
  function setupGPSIntegration() {
    console.log("Setting up GPS integration...");

    // Check if we already have location updates working
    if (App.Features.GPSListener) {
      console.log("Using existing GPSListener for StakeOut updates");

      // Register StakeOut as a listener if not already done
      if (
        App.Features.StakeOut &&
        App.Features.StakeOut._gpsListenerRegistered !== true
      ) {
        App.Features.GPSListener.addListener(function (position) {
          if (App.Features.StakeOut._stakeOutActive && position) {
            const [lng, lat] = position;
            App.Features.StakeOut.updateCurrentLocation(lng, lat);
          }
        });
        App.Features.StakeOut._gpsListenerRegistered = true;
        console.log("Registered StakeOut with GPSListener");
      }
    } else {
      // Set up a backup position update mechanism
      console.log(
        "No GPSListener found, setting up direct StakeOut update hooks"
      );

      // Intercept navigation updates
      if (
        App.Map &&
        App.Map.Navigation &&
        typeof App.Map.Navigation.updateGPSLocation === "function"
      ) {
        if (!App.Map.Navigation._stakeOutUpdateHooked) {
          const originalUpdateGPS = App.Map.Navigation.updateGPSLocation;

          App.Map.Navigation.updateGPSLocation = function (lng, lat) {
            // Call original method
            originalUpdateGPS.apply(this, arguments);

            // Forward to StakeOut if active
            if (
              App.Features.StakeOut &&
              App.Features.StakeOut._stakeOutActive
            ) {
              App.Features.StakeOut.updateCurrentLocation(lng, lat);
            }
          };

          App.Map.Navigation._stakeOutUpdateHooked = true;
          console.log(
            "Hooked App.Map.Navigation.updateGPSLocation for StakeOut updates"
          );
        }
      }

      // Intercept GNSS simulator updates
      if (
        window.GNSSSimulator &&
        typeof window.GNSSSimulator.updatePosition === "function"
      ) {
        if (!window.GNSSSimulator._stakeOutUpdateHooked) {
          const originalUpdatePosition = window.GNSSSimulator.updatePosition;

          window.GNSSSimulator.updatePosition = function (map) {
            // Call original method
            originalUpdatePosition.apply(this, arguments);

            // Forward to StakeOut if active
            if (
              App.Features.StakeOut &&
              App.Features.StakeOut._stakeOutActive &&
              this.currentPosition &&
              Array.isArray(this.currentPosition)
            ) {
              const [lng, lat] = this.currentPosition;
              App.Features.StakeOut.updateCurrentLocation(lng, lat);
            }
          };

          window.GNSSSimulator._stakeOutUpdateHooked = true;
          console.log(
            "Hooked GNSSSimulator.updatePosition for StakeOut updates"
          );
        }
      }
    }

    console.log("GPS integration complete");
  }

  // Set up event listeners
  function setupEventListeners() {
    if (!App.Core || !App.Core.Events) {
      console.log("Core Events not available, skipping event listeners");
      return;
    }

    console.log("Setting up event listeners...");

    // Listen for feature selection
    App.Core.Events.on("feature:selected", function (feature) {
      // Store the feature in state
      if (App.Core.State) {
        App.Core.State.set("map.lastSelectedFeature", feature);
      }

      console.log("Feature selected:", feature);
    });

    // Listen for StakeOut start/stop events
    App.Core.Events.on("stakeout:started", function (data) {
      // Update dynamic button mode
      if (App.UI.DynamicButton) {
        App.UI.DynamicButton.setMode("navigation");
      }

      console.log("StakeOut started event received:", data);
    });

    App.Core.Events.on("stakeout:stopped", function () {
      // Update dynamic button mode
      if (App.UI.DynamicButton) {
        App.UI.DynamicButton.setMode("default");
      }

      console.log("StakeOut stopped event received");
    });

    console.log("Event listeners setup complete");
  }

  // Add stop/start methods if needed
  function addStopStartMethods() {
    // Add stopStakeOut method if not present
    if (typeof App.Features.StakeOut.stopStakeOut !== "function") {
      App.Features.StakeOut.stopStakeOut = function () {
        if (typeof this.cleanup === "function") {
          this.cleanup();
        }

        // Clear active state
        this.setActive(false);

        // Clear active polygon
        this._activePolygonFeature = null;

        // Trigger event
        if (App.Core && App.Core.Events) {
          App.Core.Events.trigger("stakeout:stopped", {});
        }

        return true;
      };
      console.log("Added stopStakeOut method to StakeOut");
    }

    // Add startStakeOut method if not present
    if (typeof App.Features.StakeOut.startStakeOut !== "function") {
      App.Features.StakeOut.startStakeOut = function () {
        // Get the last selected feature
        const lastFeature = App.Core.State.get("map.lastSelectedFeature");

        if (!lastFeature) {
          showAlert(
            "warning",
            "No Feature Selected",
            "Please select a polygon feature before starting StakeOut."
          );
          return false;
        }

        if (!this.isFeatureTypeSupported(lastFeature)) {
          const featureType = lastFeature.geometry
            ? lastFeature.geometry.type
            : "Unknown";
          showAlert(
            "warning",
            "Feature Type Not Supported",
            `StakeOut does not support ${featureType}. Supported types: Point, LineString, Polygon, and their Multi variants.`
          );
          return false;
        }

        const success = this.activateForLastSelectedFeature();

        if (success) {
          // Store active polygon
          this._activePolygonFeature = lastFeature;

          // Set active state
          this.setActive(true);

          showAlert(
            "success",
            "StakeOut Started",
            "Navigation to selected polygon has started. Follow the directional arrows."
          );
        }

        return success;
      };
      console.log("Added startStakeOut method to StakeOut");
    }
  }

  // Helper function to show shoelace alerts
  function showAlert(variant, title, message) {
    try {
      const alert = document.createElement("sl-alert");
      alert.variant = variant || "primary";
      alert.closable = true;
      alert.duration = 3000;

      const icon =
        {
          primary: "info-circle",
          success: "check-circle",
          warning: "exclamation-triangle",
          danger: "exclamation-octagon",
        }[variant] || "info-circle";

      alert.innerHTML = `
          <sl-icon slot="icon" name="${icon}"></sl-icon>
          <strong>${title}</strong><br>
          ${message}
        `;

      document.body.appendChild(alert);
      alert.toast();
    } catch (error) {
      console.error("Error showing alert:", error);
      console.log(`${variant.toUpperCase()}: ${title} - ${message}`);
    }
  }

  // Start initialization
  setTimeout(initStakeOutIntegration, 2000);
})();
