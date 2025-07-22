/**
 * StakeOut Circle Updates Fix
 * Ensures that circles around the target location are updated when GPS location changes
 */
(function () {
  // Wait for StakeOut module to be available
  function initStakeOutCircleFix() {
    // Check if required modules exist
    if (!App.Features || !App.Features.StakeOut) {
      console.log("Waiting for StakeOut module to load...");
      setTimeout(initStakeOutCircleFix, 500);
      return;
    }

    console.log("Initializing StakeOut circle updates fix...");

    // Enhance updateCurrentLocation to update circle states
    if (
      !App.Features.StakeOut._circleFixUpdateCurrentLocation &&
      typeof App.Features.StakeOut.updateCurrentLocation === "function"
    ) {
      App.Features.StakeOut._circleFixUpdateCurrentLocation =
        App.Features.StakeOut.updateCurrentLocation;

      // Override with a new function that also updates circle states
      App.Features.StakeOut.updateCurrentLocation = function (
        currentLng,
        currentLat
      ) {
        // Call the existing method first
        if (this._circleFixUpdateCurrentLocation) {
          this._circleFixUpdateCurrentLocation.call(
            this,
            currentLng,
            currentLat
          );
        }

        // Now update the circle states if we're active
        if (this._stakeOutActive) {
          // Update active/inactive state of circles based on current position
          this._updateCircleStates(currentLng, currentLat);
        }
      };

      console.log(
        "Enhanced StakeOut.updateCurrentLocation to update circle states"
      );
    }

    // Add method to update circle states based on current position
    if (!App.Features.StakeOut._updateCircleStates) {
      App.Features.StakeOut._updateCircleStates = function (
        currentLng,
        currentLat
      ) {
        // Skip if no circles are defined
        if (!this._circles || !this._circles.length) {
          // If this is using the original StakeOut code, _circles should be defined in the module scope
          if (typeof _circles !== "undefined" && _circles.length) {
            this._circles = _circles;
          } else {
            return;
          }
        }

        // Skip if no target location
        if (!this._targetLng || !this._targetLat) {
          // If this is using the original StakeOut code, these might be defined in module scope
          if (
            typeof _targetLng !== "undefined" &&
            typeof _targetLat !== "undefined"
          ) {
            this._targetLng = _targetLng;
            this._targetLat = _targetLat;
          } else {
            return;
          }
        }

        // Update circle visibility based on current zoom level
        this._updateVisibleCirclesByZoom();

        // Check if each visible circle is active (current position is within the circle)
        this._visibleCircles.forEach((circle) => {
          circle.isActive = this._isWithinCircle(
            circle.radius,
            currentLng,
            currentLat
          );
        });

        // Force update of circle visuals
        this._updateMapLibreCircleStates();

        console.log("Circle states updated based on position change");
      };

      console.log("Added _updateCircleStates method to StakeOut");
    }

    // Add method to check if current position is within a circle's radius
    if (!App.Features.StakeOut._isWithinCircle) {
      App.Features.StakeOut._isWithinCircle = function (
        circleRadius,
        currentLng,
        currentLat
      ) {
        try {
          // Skip if target or current position is not defined
          if (
            !this._targetLng ||
            !this._targetLat ||
            !currentLng ||
            !currentLat
          ) {
            return false;
          }

          // Create points for target and current location
          const targetPoint = [this._targetLng, this._targetLat];
          const currentPoint = [currentLng, currentLat];

          // Calculate distance between points
          let distance;

          // Use turf if available
          if (typeof turf !== "undefined" && turf.distance) {
            distance = turf.distance(
              turf.point(targetPoint),
              turf.point(currentPoint),
              { units: "meters" }
            );
          } else {
            // Fallback to basic calculation
            const R = 6371000; // Earth radius in meters
            const lat1 = (this._targetLat * Math.PI) / 180;
            const lat2 = (currentLat * Math.PI) / 180;
            const dLat = ((currentLat - this._targetLat) * Math.PI) / 180;
            const dLng = ((currentLng - this._targetLng) * Math.PI) / 180;

            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) *
                Math.cos(lat2) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            distance = R * c;
          }

          // Return true if current location is within circle radius
          return distance <= circleRadius;
        } catch (e) {
          console.error("Error checking if within circle:", e);
          return false;
        }
      };

      console.log("Added _isWithinCircle method to StakeOut");
    }

    // Add update visible circles method if needed
    if (!App.Features.StakeOut._updateVisibleCirclesByZoom) {
      App.Features.StakeOut._updateVisibleCirclesByZoom = function () {
        // If map is not available, skip
        if (!this.map && window.interface && window.interface.map) {
          this.map = window.interface.map;
        }

        if (!this.map) {
          return;
        }

        // Get the current zoom level
        const zoom = this.map.getZoom();

        // If _circles is not defined, try to get it from module scope
        if (!this._circles || !this._circles.length) {
          if (typeof _circles !== "undefined" && _circles.length) {
            this._circles = _circles;
          } else {
            // Define default circles if none exist
            this._circles = [
              { radius: 2.0, color: [1.0, 0.0, 0.0, 1.0], label: "2m" },
              { radius: 1.0, color: [1.0, 0.5, 0.0, 1.0], label: "1m" },
              { radius: 0.5, color: [1.0, 1.0, 0.0, 1.0], label: "50cm" },
              { radius: 0.3, color: [0.5, 1.0, 0.0, 1.0], label: "30cm" },
              { radius: 0.1, color: [0.0, 1.0, 0.0, 1.0], label: "10cm" },
              { radius: 0.05, color: [0.0, 0.7, 1.0, 1.0], label: "5cm" },
              { radius: 0.04, color: [0.0, 0.4, 1.0, 1.0], label: "4cm" },
              { radius: 0.03, color: [0.0, 0.0, 1.0, 1.0], label: "3cm" },
              { radius: 0.02, color: [0.5, 0.0, 1.0, 1.0], label: "2cm" },
              { radius: 0.01, color: [1.0, 0.0, 1.0, 1.0], label: "1cm" },
            ];
          }
        }

        // If _visibleCircles is not defined, initialize it
        if (!this._visibleCircles) {
          this._visibleCircles = [];
        }

        // Determine which circles to show based on zoom level
        if (zoom >= 26) {
          this._visibleCircles = this._circles.slice(); // Show all circles
        } else if (zoom >= 23) {
          this._visibleCircles = this._circles.filter(function (circle) {
            return [2.0, 1.0, 0.5, 0.3, 0.1, 0.05].includes(circle.radius);
          });
        } else if (zoom >= 22) {
          this._visibleCircles = this._circles.filter(function (circle) {
            return [2.0, 1.0, 0.5, 0.3, 0.1].includes(circle.radius);
          });
        } else if (zoom >= 20) {
          this._visibleCircles = this._circles.filter(function (circle) {
            return [2.0, 1.0, 0.5].includes(circle.radius);
          });
        } else if (zoom >= 17) {
          this._visibleCircles = this._circles.filter(function (circle) {
            return [2.0, 1.0].includes(circle.radius);
          });
        } else {
          this._visibleCircles = [];
        }
      };

      console.log("Added _updateVisibleCirclesByZoom method to StakeOut");
    }

    // Add update MapLibre circle states method if needed
    if (!App.Features.StakeOut._updateMapLibreCircleStates) {
      App.Features.StakeOut._updateMapLibreCircleStates = function () {
        // Skip if no visible circles or no map
        if (!this._visibleCircles || !this._visibleCircles.length) {
          return;
        }

        if (!this.map && window.interface && window.interface.map) {
          this.map = window.interface.map;
        }

        if (!this.map) {
          return;
        }

        // Define default values if not available
        if (typeof this._outlineWidthPx === "undefined") {
          this._outlineWidthPx = 2.0;
        }
        if (typeof this._activeOutlineWidthPx === "undefined") {
          this._activeOutlineWidthPx = 4.0;
        }

        // Update each visible circle's appearance based on its active state
        this._visibleCircles.forEach((circle, i) => {
          const layerId = `maplibre-circle-${i}`;
          if (this.map.getLayer(layerId)) {
            // Get the circle's color as RGB values
            const colorRgb = circle.color.map((c) => Math.round(c * 255));

            // Determine the stroke color based on active state
            const strokeColor = circle.isActive
              ? `rgb(${colorRgb[0]}, ${colorRgb[1]}, ${colorRgb[2]})`
              : `rgb(77, 77, 77)`;

            // Determine the stroke width based on active state
            const strokeWidth = circle.isActive
              ? this._activeOutlineWidthPx
              : this._outlineWidthPx;

            // Update the circle's appearance
            this.map.setPaintProperty(
              layerId,
              "circle-stroke-color",
              strokeColor
            );
            this.map.setPaintProperty(
              layerId,
              "circle-stroke-width",
              strokeWidth
            );
          }
        });
      };

      console.log("Added _updateMapLibreCircleStates method to StakeOut");
    }

    // Enhanced activateForLastSelectedFeature to store target location
    if (
      !App.Features.StakeOut._circleFixActivateForLastSelectedFeature &&
      typeof App.Features.StakeOut.activateForLastSelectedFeature === "function"
    ) {
      App.Features.StakeOut._circleFixActivateForLastSelectedFeature =
        App.Features.StakeOut.activateForLastSelectedFeature;

      // Override with a new function that also stores target location
      App.Features.StakeOut.activateForLastSelectedFeature = function (
        currentLocation
      ) {
        // Call the original function
        const result = this._circleFixActivateForLastSelectedFeature.call(
          this,
          currentLocation
        );

        // Store additional data needed for circle updates
        if (result) {
          // If we have access to the polygon feature, store it
          const lastFeature = App.Core.State.get("map.lastSelectedFeature");
          if (lastFeature) {
            this._activePolygonFeature = lastFeature;
          }

          // If current location wasn't provided, try to get it
          if (!currentLocation) {
            if (
              App.Map &&
              App.Map.Navigation &&
              typeof App.Map.Navigation.getPosition === "function"
            ) {
              currentLocation = App.Map.Navigation.getPosition();
            } else if (window.interface && window.interface.currentLocation) {
              currentLocation = window.interface.currentLocation;
            }
          }

          // If we have current location, immediately update circle states
          if (currentLocation) {
            let lng, lat;
            if (Array.isArray(currentLocation)) {
              [lng, lat] = currentLocation;
            } else if (
              currentLocation.lng !== undefined &&
              currentLocation.lat !== undefined
            ) {
              lng = currentLocation.lng;
              lat = currentLocation.lat;
            }

            if (lng !== undefined && lat !== undefined) {
              this._updateCircleStates(lng, lat);
            }
          }
        }

        return result;
      };

      console.log(
        "Enhanced activateForLastSelectedFeature to store target location"
      );
    }

    // Enhance navigateToNearestPointOnPolygon to store target coordinates
    if (
      !App.Features.StakeOut._circleFixNavigateToNearestPointOnPolygon &&
      typeof App.Features.StakeOut.navigateToNearestPointOnPolygon ===
        "function"
    ) {
      App.Features.StakeOut._circleFixNavigateToNearestPointOnPolygon =
        App.Features.StakeOut.navigateToNearestPointOnPolygon;

      // Override with a new function that also stores target coordinates
      App.Features.StakeOut.navigateToNearestPointOnPolygon = function (
        polygonFeature,
        currentLocation
      ) {
        // Call the original function
        const result = this._circleFixNavigateToNearestPointOnPolygon.call(
          this,
          polygonFeature,
          currentLocation
        );

        // If successful, store target coordinates
        if (result) {
          // Store the target coordinates
          if (Array.isArray(result) && result.length >= 2) {
            this._targetLng = result[0];
            this._targetLat = result[1];
            console.log(
              `Stored target coordinates: [${this._targetLng}, ${this._targetLat}]`
            );
          }

          // Store current location
          if (currentLocation) {
            let lng, lat;
            if (Array.isArray(currentLocation)) {
              [lng, lat] = currentLocation;
            } else if (
              currentLocation.lng !== undefined &&
              currentLocation.lat !== undefined
            ) {
              lng = currentLocation.lng;
              lat = currentLocation.lat;
            }

            if (lng !== undefined && lat !== undefined) {
              this._updateCircleStates(lng, lat);
            }
          }
        }

        return result;
      };

      console.log(
        "Enhanced navigateToNearestPointOnPolygon to store target coordinates"
      );
    }

    console.log("StakeOut circle updates fix complete");
  }

  // Start initialization with a delay to ensure all components are loaded
  setTimeout(initStakeOutCircleFix, 1500);
})();
