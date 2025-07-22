/**
 * StakeOut module extensions - Feature type checking and alerts
 * @namespace App.Features.StakeOut
 */
App.Features = App.Features || {};
App.Features.StakeOut = App.Features.StakeOut || {};

// Extend the StakeOut module with new functions
(function (module) {
  /**
   * Check if the feature is a valid type for stakeout (currently only polygons)
   * @param {Object} feature - GeoJSON feature to check
   * @returns {boolean} True if the feature is valid for stakeout
   */
  module.isFeatureTypeSupported = function (feature) {
    if (!feature || !feature.geometry || !feature.geometry.type) {
      console.error("Invalid feature or missing geometry", feature);
      return false;
    }

    // Supporting Point, LineString, Polygon and their Multi variants
    const supportedTypes = [
      "Point",
      "LineString", 
      "Polygon",
      "MultiPoint",
      "MultiLineString",
      "MultiPolygon"
    ];
    
    return supportedTypes.includes(feature.geometry.type);
  };

  /**
   * Shows an alert for unsupported feature types
   * @param {string} featureType - The type of feature that is not supported
   */
  module.showUnsupportedTypeAlert = function (featureType) {
    // Create a Shoelace alert
    const alert = document.createElement("sl-alert");
    alert.variant = "warning";
    alert.closable = true;
    alert.duration = 5000; // 5 seconds

    alert.innerHTML = `
      <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
      <strong>Feature Type Not Supported</strong><br>
      Stake Out does not support ${
        featureType || "this feature type"
      }. Supported types: Point, LineString, Polygon, and their Multi variants.
    `;

    // Add the alert to the document
    document.body.appendChild(alert);

    // Show the alert
    alert.toast();
  };

  /**
   * Activates stake out for the last selected feature
   * @param {Object} currentLocation - Current location coordinates [lng, lat]
   * @returns {boolean} Whether stake out was successfully activated
   */
  module.activateForLastSelectedFeature = function (currentLocation) {
    // Get the last selected feature from App.Core.State
    const lastFeature = App.Core.State.get("map.lastSelectedFeature");

    console.log(
      "Attempting to activate stake out for last selected feature:",
      lastFeature
    );

    if (!lastFeature) {
      this.showUnsupportedTypeAlert("No feature");
      console.error("No feature selected for stake out");
      return false;
    }

    // Check if the feature type is supported
    if (!this.isFeatureTypeSupported(lastFeature)) {
      const featureType = lastFeature.geometry
        ? lastFeature.geometry.type
        : "Unknown";
      this.showUnsupportedTypeAlert(featureType);
      console.warn(`Feature type ${featureType} not supported for stake out`);
      return false;
    }

    // If we reached here, the feature is valid for stake out
    console.log("Starting stake out for polygon feature");

    // Reset the UI if it exists
    var ui = this.getUI && this.getUI();
    if (ui && typeof ui.resetActivationState === "function") {
      ui.resetActivationState();
    }

    // Get current location if not provided
    if (!currentLocation) {
      // Try to get from App.Map.Navigation
      if (
        App.Map.Navigation &&
        typeof App.Map.Navigation.getPosition === "function"
      ) {
        currentLocation = App.Map.Navigation.getPosition();
        console.log("Got location from App.Map.Navigation:", currentLocation);
      } 
      
      // Try GNSS Simulator if active
      if (!currentLocation && window.GNSSSimulator && window.GNSSSimulator.active && window.GNSSSimulator.currentPosition) {
        currentLocation = window.GNSSSimulator.currentPosition;
        console.log("Got location from GNSS Simulator:", currentLocation);
      }
      
      // Try interface
      if (!currentLocation && window.interface && window.interface.currentLocation) {
        currentLocation = window.interface.currentLocation;
        console.log("Got location from interface:", currentLocation);
      }
      
      // Use default if nothing else is available
      if (!currentLocation) {
        // Default coordinates if nothing else is available
        currentLocation = [14.222929599999969, 46.62632869999987];
        console.log("Using default location:", currentLocation);
      }
    }

    // Navigate to the nearest point on the polygon
    return this.navigateToNearestPointOnPolygon(lastFeature, currentLocation);
  };

  /**
   * Starts stake out mode if a valid feature is selected
   * @returns {boolean} Whether stake out was successfully started
   */
  module.startStakeOutForLastFeature = function () {
    // Get the map instance (required for StakeOut)
    const map = App.Map.Init.getMap();
    if (!map) {
      console.error("Map not available");
      return false;
    }

    // Ensure StakeOut is initialized
    if (typeof this.initialize === "function" && !this._initialized) {
      this.initialize(map);
      this._initialized = true;
    }

    // Activate for the last selected feature
    const success = this.activateForLastSelectedFeature();

    // Notify system that stake out has started (for other components to react)
    if (success) {
      // Ensure active state is set
      if (typeof this.setActive === "function") {
        this.setActive(true);
      }
      
      if (App.Core.Events) {
        App.Core.Events.trigger("stakeout:started", {
          feature: App.Core.State.get("map.lastSelectedFeature"),
        });
      }
    }

    return success;
  };
})(App.Features.StakeOut);

// Add an event listener to handle feature selection for stake out
if (App.Core.Events) {
  App.Core.Events.on("feature:selected", function (feature) {
    // Store the selected feature in the state
    App.Core.State.set("map.lastSelectedFeature", feature);

    console.log("Feature selected for potential stake out:", feature);
  });

  // Add a listener for the dynamic button stake out action
  App.Core.Events.on("dynamicButton:action", function (data) {
    if (data.action === "startNavigation") {
      App.Features.StakeOut.startStakeOutForLastFeature();
    }
  });
}

console.log("StakeOut feature enhancements loaded");
