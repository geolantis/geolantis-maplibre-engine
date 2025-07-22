/**
 * StakeOut integration with Dynamic Button
 * Connects the StakeOut feature to the existing Dynamic Button UI component
 */
document.addEventListener("DOMContentLoaded", function () {
  // Wait for the Dynamic Button and StakeOut modules to be available
  function initStakeOutDynamicButtonIntegration() {
    // Check if required modules exist
    if (
      !App.UI ||
      !App.UI.DynamicButton ||
      !App.Features ||
      !App.Features.StakeOut
    ) {
      console.log("Waiting for Dynamic Button and StakeOut modules to load...");
      setTimeout(initStakeOutDynamicButtonIntegration, 500);
      return;
    }

    console.log("Initializing StakeOut integration with Dynamic Button...");

    // Register StakeOut actions with the Dynamic Button

    // 1. Start Navigation action - This triggers StakeOut for the selected feature
    App.UI.DynamicButton.onAction("startNavigation", function () {
      console.log("Dynamic Button: Starting StakeOut navigation");

      // Get the map instance if needed for initialization
      const map = App.Map.Init.getMap();

      // Ensure StakeOut is initialized
      if (
        map &&
        !App.Features.StakeOut._initialized &&
        typeof App.Features.StakeOut.initialize === "function"
      ) {
        App.Features.StakeOut.initialize(map);
        App.Features.StakeOut._initialized = true;
      }

      // Start StakeOut using the last selected feature
      const result = App.Features.StakeOut.activateForLastSelectedFeature();

      // If successful, switch to navigation mode
      if (result) {
        // Change Dynamic Button mode to navigation
        App.UI.DynamicButton.setMode("navigation");

        // Trigger stakeout started event
        if (App.Core.Events) {
          App.Core.Events.trigger("stakeout:started", {
            feature: App.Core.State.get("map.lastSelectedFeature"),
          });
        }
      }
    });

    // 2. Stop Navigation action
    App.UI.DynamicButton.onAction("stopNavigation", function () {
      console.log("Dynamic Button: Stopping StakeOut navigation");

      // Stop StakeOut if it has a cleanup method
      if (typeof App.Features.StakeOut.cleanup === "function") {
        App.Features.StakeOut.cleanup();
      }

      // Reset UI if available
      if (
        App.Features.StakeOut._ui &&
        typeof App.Features.StakeOut._ui.cleanup === "function"
      ) {
        App.Features.StakeOut._ui.cleanup();
      }

      // Change Dynamic Button mode back to default
      App.UI.DynamicButton.setMode("default");

      // Trigger stakeout stopped event
      if (App.Core.Events) {
        App.Core.Events.trigger("stakeout:stopped", {});
      }
    });

    // 3. Reset Target action
    App.UI.DynamicButton.onAction("resetTarget", function () {
      console.log("Dynamic Button: Resetting StakeOut target");

      // Clear the selected feature
      if (App.Core.State) {
        App.Core.State.set("map.lastSelectedFeature", null);
      }

      // Stop current stake out if active
      if (typeof App.Features.StakeOut.cleanup === "function") {
        App.Features.StakeOut.cleanup();
      }

      // Show a notification about target reset if alerts are available
      if (App.Features.StakeOut.Alerts) {
        App.Features.StakeOut.Alerts.info(
          "Target Reset",
          "The target feature has been cleared. Select a new feature to stake out."
        );
      } else {
        // Fallback to basic Shoelace alert if the alerts module isn't available
        const alert = document.createElement("sl-alert");
        alert.variant = "info";
        alert.closable = true;
        alert.duration = 3000;
        alert.innerHTML = `
            <sl-icon slot="icon" name="info-circle"></sl-icon>
            <strong>Target Reset</strong><br>
            The target feature has been cleared. Select a new feature to stake out.
          `;
        document.body.appendChild(alert);
        alert.toast();
      }
    });

    // Listen for feature selection to update dynamic button visibility
    if (App.Core.Events) {
      App.Core.Events.on("feature:selected", function (feature) {
        // Store the selected feature in the state if not already done
        if (App.Core.State) {
          App.Core.State.set("map.lastSelectedFeature", feature);
        }

        // Check if feature is valid for StakeOut
        const isValidFeature =
          App.Features.StakeOut.isFeatureTypeSupported &&
          App.Features.StakeOut.isFeatureTypeSupported(feature);

        // Show a hint or notification if appropriate
        if (isValidFeature) {
          console.log("Valid polygon feature selected for StakeOut");
        }
      });
    }

    // Listen for StakeOut events to update Dynamic Button state
    if (App.Core.Events) {
      App.Core.Events.on("stakeout:started", function () {
        // Update Dynamic Button to navigation mode
        App.UI.DynamicButton.setMode("navigation");
      });

      App.Core.Events.on("stakeout:stopped", function () {
        // Update Dynamic Button back to default mode
        App.UI.DynamicButton.setMode("default");
      });
    }

    // Create a utility function to check if we can start StakeOut
    App.Features.StakeOut.canStartStakeOut = function () {
      const feature =
        App.Core.State && App.Core.State.get("map.lastSelectedFeature");
      return (
        feature &&
        this.isFeatureTypeSupported &&
        this.isFeatureTypeSupported(feature)
      );
    };

    console.log("StakeOut and Dynamic Button integration complete");
  }

  // Start initialization with a delay
  setTimeout(initStakeOutDynamicButtonIntegration, 1000);
});

/**
 * StakeOut Dynamic Button Configuration
 * Configures the Dynamic Button component to include StakeOut functionality in the submenu
 */
document.addEventListener("DOMContentLoaded", function () {
  // Wait for all needed components to be available
  function initStakeOutButtonConfig() {
    // Check if required modules exist
    if (
      !App.UI ||
      !App.UI.DynamicButton ||
      !App.Features ||
      !App.Features.StakeOut
    ) {
      console.log("Waiting for modules to load...");
      setTimeout(initStakeOutButtonConfig, 500);
      return;
    }

    console.log("Configuring Dynamic Button for StakeOut functionality...");

    // Define custom mode for StakeOut navigation
    const stakeOutMode = {
      primary: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4682b4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 13V2l8 4-8 4"/><path d="M20.561 10.222a9 9 0 1 1-12.55-5.29"/><path d="M8.002 9.997a5 5 0 1 0 8.9 2.02"/></svg>',
        title: "StakeOut Navigation",
        className: "active-mode",
      },
      secondary: [
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
          title: "Stop Navigation",
          action: "stopStakeOut",
          className: "danger",
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>',
          title: "Reset Target",
          action: "resetStakeOutTarget",
          className: "",
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-mouse-pointer"><path d="M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z"/><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/></svg>',
          title: "Toggle Basemap Selection",
          action: "toggleBasemapSelection",
          className: "basemap-toggle",
          isToggle: true,
        },
      ],
    };

    // Add the StakeOut mode to the Dynamic Button
    App.UI.DynamicButton.addMode("stakeout", stakeOutMode);

    // Modify the default mode's secondary buttons to include StakeOut functionality
    // Get current default config
    const defaultConfig = App.UI.DynamicButton._defaultModes?.default || {};
    if (defaultConfig.secondary && defaultConfig.secondary.length > 0) {
      // Find the navigation item
      const navItem = defaultConfig.secondary.find(
        (btn) => btn.action === "navigationMenu"
      );

      if (navItem && navItem.subButtons && navItem.subButtons.length > 0) {
        // Make sure the first submenu button is for StakeOut
        const firstButton = navItem.subButtons[0];

        // Update the first button to be specifically for StakeOut
        if (firstButton) {
          firstButton.icon =
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 13V2l8 4-8 4"/><path d="M20.561 10.222a9 9 0 1 1-12.55-5.29"/><path d="M8.002 9.997a5 5 0 1 0 8.9 2.02"/></svg>';
          firstButton.title = "Start StakeOut Navigation";
          firstButton.action = "startStakeOut";

          console.log(
            "Dynamic Button submenu updated with StakeOut functionality"
          );
        }
      }
    }

    // Register handlers for StakeOut actions
    App.UI.DynamicButton.onAction("startStakeOut", function () {
      // Get the last selected feature
      const feature = App.Core.State.get("map.lastSelectedFeature");

      // Check if there's a feature and if it's supported
      if (!feature) {
        showUnsupportedAlert(
          "No feature selected",
          "Please select a feature on the map before starting StakeOut."
        );
        return;
      }

      // Check if feature type is supported
      if (!App.Features.StakeOut.isFeatureTypeSupported(feature)) {
        const featureType = feature.geometry
          ? feature.geometry.type
          : "Unknown";
        showUnsupportedAlert(
          "Feature Type Not Supported",
          `StakeOut currently only supports polygons. ${featureType} cannot be used for StakeOut at this time.`
        );
        return;
      }

      // If we got here, we can start StakeOut
      console.log("Starting StakeOut for selected feature");

      // Get the map instance if needed for initialization
      const map = App.Map.Init.getMap();

      // Ensure StakeOut is initialized
      if (
        map &&
        !App.Features.StakeOut._initialized &&
        typeof App.Features.StakeOut.initialize === "function"
      ) {
        App.Features.StakeOut.initialize(map);
        App.Features.StakeOut._initialized = true;
      }

      // Start StakeOut
      const success = App.Features.StakeOut.activateForLastSelectedFeature();

      if (success) {
        // Update Dynamic Button mode
        App.UI.DynamicButton.setMode("stakeout");

        // Show success notification
        showSuccessAlert(
          "StakeOut Started",
          "Navigation to the selected polygon has started. Follow the directional arrows."
        );

        // Trigger event
        if (App.Core.Events) {
          App.Core.Events.trigger("stakeout:started", { feature });
        }
      }
    });

    // Handler for stopping StakeOut
    App.UI.DynamicButton.onAction("stopStakeOut", function () {
      console.log("Stopping StakeOut navigation");

      // Clean up StakeOut
      if (typeof App.Features.StakeOut.cleanup === "function") {
        App.Features.StakeOut.cleanup();
      }

      // Reset UI
      if (
        App.Features.StakeOut._ui &&
        typeof App.Features.StakeOut._ui.cleanup === "function"
      ) {
        App.Features.StakeOut._ui.cleanup();
      }

      // Return to default mode
      App.UI.DynamicButton.setMode("default");

      // Show notification
      showInfoAlert("StakeOut Stopped", "Navigation has been stopped.");

      // Trigger event
      if (App.Core.Events) {
        App.Core.Events.trigger("stakeout:stopped", {});
      }
    });

    // Handler for resetting StakeOut target
    App.UI.DynamicButton.onAction("resetStakeOutTarget", function () {
      console.log("Resetting StakeOut target");

      // Clear selected feature
      if (App.Core.State) {
        App.Core.State.set("map.lastSelectedFeature", null);
      }

      // If StakeOut is active, stop it
      if (App.UI.DynamicButton.getMode() === "stakeout") {
        // Clean up StakeOut
        if (typeof App.Features.StakeOut.cleanup === "function") {
          App.Features.StakeOut.cleanup();
        }

        // Reset UI
        if (
          App.Features.StakeOut._ui &&
          typeof App.Features.StakeOut._ui.cleanup === "function"
        ) {
          App.Features.StakeOut._ui.cleanup();
        }

        // Return to default mode
        App.UI.DynamicButton.setMode("default");
      }

      // Show notification
      showInfoAlert(
        "Target Reset",
        "The target feature has been cleared. Select a new feature for StakeOut."
      );
    });

    // Utility function to show alerts
    function showUnsupportedAlert(title, message) {
      const alert = document.createElement("sl-alert");
      alert.variant = "warning";
      alert.closable = true;
      alert.duration = 5000;

      alert.innerHTML = `
          <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
          <strong>${title}</strong><br>
          ${message}
        `;

      document.body.appendChild(alert);
      alert.toast();
    }

    function showSuccessAlert(title, message) {
      const alert = document.createElement("sl-alert");
      alert.variant = "success";
      alert.closable = true;
      alert.duration = 3000;

      alert.innerHTML = `
          <sl-icon slot="icon" name="check-circle"></sl-icon>
          <strong>${title}</strong><br>
          ${message}
        `;

      document.body.appendChild(alert);
      alert.toast();
    }

    function showInfoAlert(title, message) {
      const alert = document.createElement("sl-alert");
      alert.variant = "primary";
      alert.closable = true;
      alert.duration = 3000;

      alert.innerHTML = `
          <sl-icon slot="icon" name="info-circle"></sl-icon>
          <strong>${title}</strong><br>
          ${message}
        `;

      document.body.appendChild(alert);
      alert.toast();
    }

    // Listen for StakeOut events
    if (App.Core.Events) {
      // Listen for feature selection
      App.Core.Events.on("feature:selected", function (feature) {
        // Store in state if not already done
        if (App.Core.State) {
          App.Core.State.set("map.lastSelectedFeature", feature);
        }
      });

      // Listen for StakeOut events to update Dynamic Button
      App.Core.Events.on("stakeout:started", function () {
        App.UI.DynamicButton.setMode("stakeout");
      });

      App.Core.Events.on("stakeout:stopped", function () {
        App.UI.DynamicButton.setMode("default");
      });
    }

    console.log("Dynamic Button configured for StakeOut integration");
  }

  // Start initialization with a delay
  setTimeout(initStakeOutButtonConfig, 1000);
});

/**
 * StakeOut Feature Type Checking
 * Ensures that StakeOut is only activated for supported feature types (polygons)
 */
App.Features = App.Features || {};
App.Features.StakeOut = App.Features.StakeOut || {};

// Add feature type checking if it doesn't exist
if (!App.Features.StakeOut.isFeatureTypeSupported) {
  /**
   * Check if the feature is a valid type for stakeout (currently only polygons)
   * @param {Object} feature - GeoJSON feature to check
   * @returns {boolean} True if the feature is valid for stakeout
   */
  App.Features.StakeOut.isFeatureTypeSupported = function (feature) {
    if (!feature || !feature.geometry || !feature.geometry.type) {
      console.error("Invalid feature or missing geometry", feature);
      return false;
    }

    // Currently only supporting Polygon and MultiPolygon
    return (
      feature.geometry.type === "Polygon" ||
      feature.geometry.type === "MultiPolygon"
    );
  };
}

// Add the show unsupported type alert function if it doesn't exist
if (!App.Features.StakeOut.showUnsupportedTypeAlert) {
  /**
   * Shows an alert for unsupported feature types
   * @param {string} featureType - The type of feature that is not supported
   */
  App.Features.StakeOut.showUnsupportedTypeAlert = function (featureType) {
    // Create a Shoelace alert
    const alert = document.createElement("sl-alert");
    alert.variant = "warning";
    alert.closable = true;
    alert.duration = 5000; // 5 seconds

    alert.innerHTML = `
      <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
      <strong>Feature Type Not Supported</strong><br>
      Stake Out currently only supports polygons. ${
        featureType || "This feature type"
      } cannot be used for Stake Out at this time.
    `;

    // Add the alert to the document
    document.body.appendChild(alert);

    // Show the alert
    alert.toast();
  };
}

// Add the activation function for last selected feature if it doesn't exist
if (!App.Features.StakeOut.activateForLastSelectedFeature) {
  /**
   * Activates stake out for the last selected feature
   * @param {Object} currentLocation - Current location coordinates [lng, lat]
   * @returns {boolean} Whether stake out was successfully activated
   */
  App.Features.StakeOut.activateForLastSelectedFeature = function (
    currentLocation
  ) {
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
    if (this._ui && typeof this._ui.resetActivationState === "function") {
      this._ui.resetActivationState();
    }

    // Get current location if not provided
    if (!currentLocation) {
      // Try to get from App.Map.Navigation
      if (
        App.Map.Navigation &&
        typeof App.Map.Navigation.getPosition === "function"
      ) {
        currentLocation = App.Map.Navigation.getPosition();
      } else if (window.interface && window.interface.currentLocation) {
        // Fallback to interface
        currentLocation = window.interface.currentLocation;
      } else {
        // Default coordinates if nothing else is available
        currentLocation = [14.222929599999969, 46.62632869999987];
      }
    }

    // Navigate to the nearest point on the polygon
    return this.navigateToNearestPointOnPolygon(lastFeature, currentLocation);
  };
}

// Add the cleanup function if it doesn't exist
if (!App.Features.StakeOut.cleanup) {
  /**
   * Clean up all resources used by StakeOut
   */
  App.Features.StakeOut.cleanup = function () {
    console.log("Cleaning up StakeOut resources");

    // Clean up UI resources if UI exists
    if (this._ui && typeof this._ui.cleanup === "function") {
      this._ui.cleanup();
    }

    // Remove any event listeners specific to StakeOut

    // Clear any state related to StakeOut

    // Trigger an event to notify that StakeOut has been cleaned up
    if (App.Core.Events) {
      App.Core.Events.trigger("stakeout:stopped", {});
    }
  };
}

// Set up event listener for feature selection if not already done
if (App.Core.Events) {
  // Use a custom event name to avoid duplicating event handlers
  App.Core.Events.on("stakeout:checkFeatureType", function (feature) {
    // Only store the feature if it exists
    if (feature && App.Core.State) {
      App.Core.State.set("map.lastSelectedFeature", feature);

      // Log the feature type
      if (feature.geometry && feature.geometry.type) {
        console.log(`Selected feature type: ${feature.geometry.type}`);

        // Check if the feature type is supported
        const isSupported =
          App.Features.StakeOut.isFeatureTypeSupported(feature);
        console.log(`Feature type supported for StakeOut: ${isSupported}`);

        // Trigger an event with the result
        App.Core.Events.trigger("stakeout:featureTypeChecked", {
          feature: feature,
          isSupported: isSupported,
        });
      }
    }
  });
}

console.log("StakeOut feature type checking initialized");
