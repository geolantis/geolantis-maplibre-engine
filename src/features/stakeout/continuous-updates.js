/**
 * StakeOut Continuous Updates Enhancement
 * Improves StakeOut UI and real-time location tracking performance
 */
(function () {
  // Wait for all needed components to be available
  function initStakeOutContinuousUpdates() {
    // Check if required modules exist
    if (!App.Features || !App.Features.StakeOut) {
      console.log("Waiting for StakeOut module to load...");
      setTimeout(initStakeOutContinuousUpdates, 500);
      return;
    }

    console.log("Initializing StakeOut continuous updates enhancement...");

    // Add performance tracking properties
    App.Features.StakeOut._lastUIUpdate = 0;
    App.Features.StakeOut._updateQueuedPosition = null;
    App.Features.StakeOut._uiUpdateInterval = null;
    App.Features.StakeOut._uiUpdateRate = 100; // 10 updates per second
    App.Features.StakeOut._maxLineLength = 500; // Maximum length of guide line in meters

    // Enhanced displayDirectionalArrows with throttling to prevent UI overload
    if (
      !App.Features.StakeOut._originalDisplayDirectionalArrows &&
      typeof App.Features.StakeOut.displayDirectionalArrows === "function"
    ) {
      App.Features.StakeOut._originalDisplayDirectionalArrows =
        App.Features.StakeOut.displayDirectionalArrows;

      // Override with a new function that throttles updates
      App.Features.StakeOut.displayDirectionalArrows = function (
        currentLocation,
        targetLocation,
        directDistance
      ) {
        // Store the latest position but don't update UI immediately
        this._updateQueuedPosition = {
          currentLocation: currentLocation,
          targetLocation: targetLocation,
          directDistance:
            directDistance ||
            this._calculateDistance(currentLocation, targetLocation),
        };

        // If no update interval is running, start one
        if (!this._uiUpdateInterval) {
          this._startUIUpdateInterval();
        }
      };

      console.log("Enhanced StakeOut.displayDirectionalArrows with throttling");
    }

    // Method to actually update the UI at controlled intervals
    App.Features.StakeOut._updateUI = function () {
      // Skip if no queued update
      if (!this._updateQueuedPosition) return;

      // Calculate time since last update
      const now = Date.now();
      const timeSinceLastUpdate = now - this._lastUIUpdate;

      // Update if enough time has passed
      if (timeSinceLastUpdate >= this._uiUpdateRate) {
        const update = this._updateQueuedPosition;

        // Call the original method
        if (this._originalDisplayDirectionalArrows) {
          this._originalDisplayDirectionalArrows.call(
            this,
            update.currentLocation,
            update.targetLocation,
            update.directDistance
          );
        }

        // Clear the queued update
        this._updateQueuedPosition = null;

        // Record the update time
        this._lastUIUpdate = now;
      }
    };

    // Start the UI update interval
    App.Features.StakeOut._startUIUpdateInterval = function () {
      // Clear any existing interval
      if (this._uiUpdateInterval) {
        clearInterval(this._uiUpdateInterval);
      }

      // Start a new interval
      this._uiUpdateInterval = setInterval(() => {
        this._updateUI();
      }, this._uiUpdateRate);

      console.log(
        `StakeOut UI update interval started (${this._uiUpdateRate}ms)`
      );
    };

    // Stop the UI update interval
    App.Features.StakeOut._stopUIUpdateInterval = function () {
      if (this._uiUpdateInterval) {
        clearInterval(this._uiUpdateInterval);
        this._uiUpdateInterval = null;
        console.log("StakeOut UI update interval stopped");
      }
    };

    // Distance calculation helper method if not already present
    if (!App.Features.StakeOut._calculateDistance) {
      App.Features.StakeOut._calculateDistance = function (point1, point2) {
        try {
          // Use turf.js if available
          if (typeof turf !== "undefined" && turf.distance) {
            return turf.distance(point1, point2, { units: "meters" });
          }

          // Fallback to basic calculation
          const [lng1, lat1] = point1;
          const [lng2, lat2] = point2;

          // Convert to radians
          const lat1Rad = (lat1 * Math.PI) / 180;
          const lat2Rad = (lat2 * Math.PI) / 180;
          const lng1Rad = (lng1 * Math.PI) / 180;
          const lng2Rad = (lng2 * Math.PI) / 180;

          // Earth radius in meters
          const earthRadius = 6371000;

          // Haversine formula
          const dLat = lat2Rad - lat1Rad;
          const dLng = lng2Rad - lng1Rad;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1Rad) *
              Math.cos(lat2Rad) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = earthRadius * c;

          return distance;
        } catch (error) {
          console.error("Error calculating distance:", error);
          return 0;
        }
      };
    }

    // Enhanced cleanup method to stop UI updates
    if (
      !App.Features.StakeOut._enhancedCleanup &&
      typeof App.Features.StakeOut.cleanup === "function"
    ) {
      App.Features.StakeOut._enhancedCleanup = App.Features.StakeOut.cleanup;

      // Override with a new function that also stops UI updates
      App.Features.StakeOut.cleanup = function () {
        // Stop UI updates
        this._stopUIUpdateInterval();

        // Clear queued position
        this._updateQueuedPosition = null;

        // Call the original cleanup
        if (this._enhancedCleanup) {
          return this._enhancedCleanup.call(this);
        }
      };

      console.log("Enhanced StakeOut.cleanup to handle UI updates");
    }

    // Add a method to limit guide line length
    App.Features.StakeOut._limitGuideLineLength = function (
      currentLocation,
      targetLocation
    ) {
      const distance = this._calculateDistance(currentLocation, targetLocation);

      // If distance is less than max, return original target
      if (distance <= this._maxLineLength) {
        return targetLocation;
      }

      // Otherwise, calculate a point along the line
      try {
        // Use turf if available
        if (typeof turf !== "undefined" && turf.along && turf.lineString) {
          const line = turf.lineString([currentLocation, targetLocation]);
          const point = turf.along(line, this._maxLineLength / 1000, {
            units: "kilometers",
          });
          return point.geometry.coordinates;
        }

        // Fallback calculation
        const ratio = this._maxLineLength / distance;
        const lng =
          currentLocation[0] + ratio * (targetLocation[0] - currentLocation[0]);
        const lat =
          currentLocation[1] + ratio * (targetLocation[1] - currentLocation[1]);
        return [lng, lat];
      } catch (error) {
        console.error("Error limiting guide line length:", error);
        return targetLocation;
      }
    };

    // Enhanced navigateToNearestPointOnPolygon with continuous updates
    if (
      !App.Features.StakeOut._originalNavigateToNearestPointOnPolygon &&
      typeof App.Features.StakeOut.navigateToNearestPointOnPolygon ===
        "function"
    ) {
      App.Features.StakeOut._originalNavigateToNearestPointOnPolygon =
        App.Features.StakeOut.navigateToNearestPointOnPolygon;

      // Override with a new function that handles continuous updates
      App.Features.StakeOut.navigateToNearestPointOnPolygon = function (
        polygonFeature,
        currentLocation
      ) {
        // Store the polygon feature for later updates
        this._activePolygonFeature = polygonFeature;

        // Call the original method
        const result = this._originalNavigateToNearestPointOnPolygon.call(
          this,
          polygonFeature,
          currentLocation
        );

        // Start UI updates
        this._startUIUpdateInterval();

        return result;
      };

      console.log(
        "Enhanced StakeOut.navigateToNearestPointOnPolygon for continuous updates"
      );
    }

    // Enhance updateCurrentLocation to recalculate nearest point
    if (
      !App.Features.StakeOut._enhancedUpdateCurrentLocation &&
      typeof App.Features.StakeOut.updateCurrentLocation === "function"
    ) {
      App.Features.StakeOut._enhancedUpdateCurrentLocation =
        App.Features.StakeOut.updateCurrentLocation;

      // Override with a new function that recalculates nearest point
      App.Features.StakeOut.updateCurrentLocation = function (
        currentLng,
        currentLat
      ) {
        // Call the existing method
        if (this._enhancedUpdateCurrentLocation) {
          this._enhancedUpdateCurrentLocation.call(
            this,
            currentLng,
            currentLat
          );
        }

        // If we have an active polygon feature, recalculate nearest point
        if (this._stakeOutActive && this._activePolygonFeature) {
          // Find the nearest point on the polygon
          const nearestCoords = this.findNearestPointOnPolygon(
            this._activePolygonFeature,
            [currentLng, currentLat]
          );

          if (nearestCoords) {
            // Calculate direct distance
            const directDistance = this._calculateDistance(
              [currentLng, currentLat],
              nearestCoords
            );

            // Queue a UI update with the new directions
            this._updateQueuedPosition = {
              currentLocation: [currentLng, currentLat],
              targetLocation: nearestCoords,
              directDistance: directDistance,
            };
          }
        }
      };

      console.log(
        "Enhanced StakeOut.updateCurrentLocation to recalculate nearest point"
      );
    }

    console.log("StakeOut continuous updates enhancement complete");
  }

  // Start initialization after a delay to ensure all components are loaded
  setTimeout(initStakeOutContinuousUpdates, 1500);
})();
