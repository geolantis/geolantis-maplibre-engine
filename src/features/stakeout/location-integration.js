/**
 * StakeOut Location Integration
 * Ensures StakeOut tracks location updates from both external app and GNSS simulator
 */
(function () {
  // Wait for all needed components to be available
  function initStakeOutLocationIntegration() {
    // Check if required modules exist
    if (!App.Features || !App.Features.StakeOut) {
      console.log("Waiting for StakeOut module to load...");
      setTimeout(initStakeOutLocationIntegration, 500);
      return;
    }

    console.log("Initializing StakeOut location integration...");

    // Store the original updateCurrentLocation method to call it from our enhanced version
    if (
      !App.Features.StakeOut._originalUpdateCurrentLocation &&
      typeof App.Features.StakeOut.updateCurrentLocation === "function"
    ) {
      App.Features.StakeOut._originalUpdateCurrentLocation =
        App.Features.StakeOut.updateCurrentLocation;
    }

    // Keep track of StakeOut active state
    App.Features.StakeOut._stakeOutActive = false;

    // Add a method to update the StakeOut active state
    App.Features.StakeOut.setActive = function (active) {
      this._stakeOutActive = active;
      console.log("StakeOut active state set to:", active);
      
      // If activating, trigger an immediate location update
      if (active && App.Map && App.Map.Navigation) {
        const currentPos = App.Map.Navigation.getPosition();
        if (currentPos && currentPos.length >= 2) {
          console.log("Triggering immediate location update:", currentPos);
          this.updateCurrentLocation(currentPos[0], currentPos[1]);
        }
      }
    };

    // Don't override updateCurrentLocation anymore - it causes duplicate updates
    // The StakeOut module already handles its own updates properly

    // Hook into Map.Navigation.updateGPSLocation to catch external updates
    if (App.Map && App.Map.Navigation) {
      if (
        !App.Map.Navigation._originalUpdateGPSLocation &&
        typeof App.Map.Navigation.updateGPSLocation === "function"
      ) {
        App.Map.Navigation._originalUpdateGPSLocation =
          App.Map.Navigation.updateGPSLocation;

        // Override with a new function that also updates StakeOut
        App.Map.Navigation.updateGPSLocation = function (lng, lat) {
          // Call the original function first
          if (this._originalUpdateGPSLocation) {
            this._originalUpdateGPSLocation.call(this, lng, lat);
          }

          // Forward to StakeOut if it's active
          if (App.Features.StakeOut._stakeOutActive) {
            App.Features.StakeOut.updateCurrentLocation(lng, lat);
          }
        };

        console.log(
          "Enhanced App.Map.Navigation.updateGPSLocation for StakeOut integration"
        );
      }
    }

    // Hook into GNSS Simulator to catch position updates if it exists
    if (window.GNSSSimulator) {
      // Store original updatePosition method
      if (
        !window.GNSSSimulator._originalUpdatePosition &&
        typeof window.GNSSSimulator.updatePosition === "function"
      ) {
        window.GNSSSimulator._originalUpdatePosition =
          window.GNSSSimulator.updatePosition;

        // Override with a new function that also updates StakeOut
        window.GNSSSimulator.updatePosition = function (map) {
          // Call the original function first
          if (this._originalUpdatePosition) {
            this._originalUpdatePosition.call(this, map);
          }

          // Forward to StakeOut if it's active and we have a current position
          if (App.Features.StakeOut._stakeOutActive && this.currentPosition) {
            const [lng, lat] = this.currentPosition;
            App.Features.StakeOut.updateCurrentLocation(lng, lat);
          }
        };

        console.log(
          "Enhanced GNSSSimulator.updatePosition for StakeOut integration"
        );
      }

      // Also hook into the setPosition method
      if (
        !window.GNSSSimulator._originalSetPosition &&
        typeof window.GNSSSimulator.setPosition === "function"
      ) {
        window.GNSSSimulator._originalSetPosition =
          window.GNSSSimulator.setPosition;

        // Override with a new function that also updates StakeOut
        window.GNSSSimulator.setPosition = function (lng, lat, map) {
          // Call the original function first
          if (this._originalSetPosition) {
            this._originalSetPosition.call(this, lng, lat, map);
          }

          // Forward to StakeOut if it's active
          if (App.Features.StakeOut._stakeOutActive) {
            App.Features.StakeOut.updateCurrentLocation(lng, lat);
          }
        };

        console.log(
          "Enhanced GNSSSimulator.setPosition for StakeOut integration"
        );
      }
    }

    // Enhance original StakeOut activateForLastSelectedFeature function to set active state
    if (
      !App.Features.StakeOut._originalActivateForLastSelectedFeature &&
      typeof App.Features.StakeOut.activateForLastSelectedFeature === "function"
    ) {
      App.Features.StakeOut._originalActivateForLastSelectedFeature =
        App.Features.StakeOut.activateForLastSelectedFeature;

      // Override with a new function that also sets active state
      App.Features.StakeOut.activateForLastSelectedFeature = function (
        currentLocation
      ) {
        // Call the original function
        const result = this._originalActivateForLastSelectedFeature.call(
          this,
          currentLocation
        );

        // If successful, set active state
        if (result) {
          this.setActive(true);
        }

        return result;
      };

      console.log(
        "Enhanced StakeOut.activateForLastSelectedFeature to track active state"
      );
    }

    // Enhance StakeOut cleanup function to clear active state
    if (
      !App.Features.StakeOut._originalCleanup &&
      typeof App.Features.StakeOut.cleanup === "function"
    ) {
      App.Features.StakeOut._originalCleanup = App.Features.StakeOut.cleanup;

      // Override with a new function that also clears active state
      App.Features.StakeOut.cleanup = function () {
        // Call the original function
        const result = this._originalCleanup.call(this);

        // Clear active state
        this.setActive(false);

        return result;
      };

      console.log("Enhanced StakeOut.cleanup to clear active state");
    }

    // Connect to StakeOut start/stop events
    if (App.Core && App.Core.Events) {
      App.Core.Events.on("stakeout:started", function () {
        App.Features.StakeOut.setActive(true);
      });

      App.Core.Events.on("stakeout:stopped", function () {
        App.Features.StakeOut.setActive(false);
      });
    }

    console.log("StakeOut location integration complete");
  }

  // Start initialization after a delay to ensure all components are loaded
  setTimeout(initStakeOutLocationIntegration, 1000);
})();
