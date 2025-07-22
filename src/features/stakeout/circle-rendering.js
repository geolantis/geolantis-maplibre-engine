/**
 * StakeOut Circle Rendering Enhancement
 * Fixes issues with circle updates and ensures proper rendering when GPS location changes
 */
(function () {
  // Wait for StakeOut module to be available
  function initStakeOutCircleRendering() {
    if (!App.Features || !App.Features.StakeOut) {
      console.log("Waiting for StakeOut module to load...");
      setTimeout(initStakeOutCircleRendering, 500);
      return;
    }

    console.log("Initializing StakeOut circle rendering enhancement...");

    // Get reference to original StakeOut circle layers function if it exists
    let originalAddCircleLayer = null;
    if (typeof App.Features.StakeOut.addCircleLayer === "function") {
      originalAddCircleLayer = App.Features.StakeOut.addCircleLayer;
    }

    /**
     * Enhanced addCircleLayer that ensures proper circle initialization and updates
     */
    App.Features.StakeOut.addCircleLayer = function (
      targetLng,
      targetLat,
      currentLng,
      currentLat
    ) {
      console.log(
        `Adding circle layer: target [${targetLng}, ${targetLat}], current [${currentLng}, ${currentLat}]`
      );

      // Store target coordinates for future updates
      this._targetLng = targetLng;
      this._targetLat = targetLat;

      // Call original function if it exists
      if (originalAddCircleLayer) {
        originalAddCircleLayer.call(
          this,
          targetLng,
          targetLat,
          currentLng,
          currentLat
        );
      } else {
        // Get the map
        if (!this.map && window.interface && window.interface.map) {
          this.map = window.interface.map;
        }

        if (!this.map) {
          console.error("Map not available for circle layer creation");
          return;
        }

        // Create circles array if it doesn't exist
        if (!this._circles) {
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

        // Set default properties if needed
        if (!this._createdCircles) this._createdCircles = new Set();
        if (!this._visibleCircles) this._visibleCircles = [];
        if (typeof this._outlineWidthPx === "undefined")
          this._outlineWidthPx = 2.0;
        if (typeof this._activeOutlineWidthPx === "undefined")
          this._activeOutlineWidthPx = 4.0;

        // Initialize tracking properties
        if (typeof this._circleLayersCreated === "undefined")
          this._circleLayersCreated = false;

        // Update visible circles based on current zoom
        this._updateVisibleCirclesByZoom();

        // Create or update circle layers
        this._createOrUpdateMapLibreCircles();

        // Create or update HTML labels
        this._createOrUpdateHTMLLabels(targetLng, targetLat);

        // Set up event handlers if not already done
        if (!this._eventsRegistered) {
          this.map.on("zoom", this._handleZoom.bind(this));
          this.map.on("zoomstart", this._handleZoomStart.bind(this));
          this.map.on("zoomend", this._handleZoomEnd.bind(this));
          this._eventsRegistered = true;
        }

        // Update circle states based on current position
        if (currentLng !== undefined && currentLat !== undefined) {
          this._updateCircleStates(currentLng, currentLat);
        }

        this._circleLayersCreated = true;
      }
    };

    /**
     * Function to create or update circle layers in MapLibre
     */
    App.Features.StakeOut._createOrUpdateMapLibreCircles = function () {
      // Skip if target coordinates are not set
      if (this._targetLng === undefined || this._targetLat === undefined) {
        console.warn("Target coordinates not set for circle layers");
        return;
      }

      // Get the map
      if (!this.map && window.interface && window.interface.map) {
        this.map = window.interface.map;
      }

      if (!this.map) {
        console.error("Map not available for circle layers");
        return;
      }

      // Ensure _visibleCircles is defined
      if (!this._visibleCircles || !this._visibleCircles.length) {
        this._updateVisibleCirclesByZoom();
      }

      // Create or update each visible circle
      this._visibleCircles.forEach((circle, i) => {
        const layerId = `maplibre-circle-${i}`;
        const isActive = circle.isActive || false;

        // Convert color to RGB values
        const colorRgb = circle.color.map((c) => Math.round(c * 255));

        // Determine stroke color based on active state
        const strokeColor = isActive
          ? `rgb(${colorRgb[0]}, ${colorRgb[1]}, ${colorRgb[2]})`
          : `rgb(77, 77, 77)`;

        // Determine stroke width based on active state
        const strokeWidth = isActive
          ? this._activeOutlineWidthPx
          : this._outlineWidthPx;

        // Calculate screen radius
        const screenRadius = this._calculateScreenRadius(circle.radius) / 2;

        // Check if the layer already exists
        if (this.map.getLayer(layerId)) {
          // Update existing layer
          this.map.setPaintProperty(layerId, "circle-radius", screenRadius);
          this.map.setPaintProperty(
            layerId,
            "circle-stroke-width",
            strokeWidth
          );
          this.map.setPaintProperty(
            layerId,
            "circle-stroke-color",
            strokeColor
          );

          // Update the source data
          if (this.map.getSource(layerId)) {
            this.map.getSource(layerId).setData({
              type: "Feature",
              properties: {},
              geometry: {
                type: "Point",
                coordinates: [this._targetLng, this._targetLat],
              },
            });
          }

          // Make sure the layer is visible
          this.map.setLayoutProperty(layerId, "visibility", "visible");

          // Track the circle
          if (this._createdCircles) {
            this._createdCircles.add(layerId);
          }
        } else {
          // Create a new layer
          try {
            // Add the source
            this.map.addSource(layerId, {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "Point",
                  coordinates: [this._targetLng, this._targetLat],
                },
              },
            });

            // Add the layer
            this.map.addLayer({
              id: layerId,
              type: "circle",
              source: layerId,
              paint: {
                "circle-radius": screenRadius,
                "circle-stroke-width": strokeWidth,
                "circle-stroke-color": strokeColor,
                "circle-stroke-opacity": 0.9,
                "circle-color": "rgba(0, 0, 0, 0)",
                "circle-pitch-alignment": "map",
              },
            });

            // Track the circle
            if (this._createdCircles) {
              this._createdCircles.add(layerId);
            }
          } catch (error) {
            console.error(`Error creating circle layer ${layerId}:`, error);
          }
        }

        // Store the active state
        circle.isActive = isActive;
      });

      // Hide any previously created circles that are no longer visible
      if (this._createdCircles) {
        const visibleIds = this._visibleCircles.map(
          (_, i) => `maplibre-circle-${i}`
        );
        this._createdCircles.forEach((layerId) => {
          if (!visibleIds.includes(layerId) && this.map.getLayer(layerId)) {
            this.map.setLayoutProperty(layerId, "visibility", "none");
          }
        });
      }
    };

    /**
     * Calculate screen radius based on real-world distance
     */
    App.Features.StakeOut._calculateScreenRadius = function (radiusInMeters) {
      if (!this.map) return 5; // Default size if map not available

      try {
        const center = [this._targetLng, this._targetLat];
        const zoom = this.map.getZoom();

        // For deep zoom and small distances, ensure minimum visibility
        if (zoom > 22 && radiusInMeters < 0.1) {
          return this._calculatePixelRadius(radiusInMeters, this._targetLat);
        }

        const bearingDegrees = 90;
        const radiusInKm = radiusInMeters / 1000;
        const earthRadiusKm = 6378.137;

        const latRad = (this._targetLat * Math.PI) / 180;
        const lngRad = (this._targetLng * Math.PI) / 180;
        const bearingRad = (bearingDegrees * Math.PI) / 180;

        const distRatio = radiusInKm / earthRadiusKm;
        const destLatRad = Math.asin(
          Math.sin(latRad) * Math.cos(distRatio) +
            Math.cos(latRad) * Math.sin(distRatio) * Math.cos(bearingRad)
        );
        const destLngRad =
          lngRad +
          Math.atan2(
            Math.sin(bearingRad) * Math.sin(distRatio) * Math.cos(latRad),
            Math.cos(distRatio) - Math.sin(latRad) * Math.sin(destLatRad)
          );

        const destLat = (destLatRad * 180) / Math.PI;
        const destLng = (destLngRad * 180) / Math.PI;

        const centerPx = this.map.project(center);
        const pointPx = this.map.project([destLng, destLat]);

        const pixelRadius = Math.sqrt(
          Math.pow(pointPx.x - centerPx.x, 2) +
            Math.pow(pointPx.y - centerPx.y, 2)
        );

        // Ensure minimum visibility based on zoom and radius
        let minSize = 0;
        if (zoom > 22) {
          if (radiusInMeters <= 0.01) minSize = 4;
          else if (radiusInMeters <= 0.02) minSize = 5;
          else if (radiusInMeters <= 0.05) minSize = 6;
        } else {
          minSize = radiusInMeters <= 0.05 ? 3 : 0;
        }

        return Math.max(pixelRadius * 2, minSize);
      } catch (e) {
        console.error("Error calculating screen radius:", e);
        const zoom = this.map.getZoom();
        const zoomFactor = Math.pow(2, zoom - 19);
        const scaleFactor = 0.000075 * zoomFactor;
        const minSize =
          radiusInMeters <= 0.01 ? 4 : radiusInMeters <= 0.05 ? 3 : 2;
        return Math.max(radiusInMeters * scaleFactor * 10000, minSize);
      }
    };

    /**
     * Calculate pixel radius based on meters and latitude
     */
    App.Features.StakeOut._calculatePixelRadius = function (
      meterRadius,
      latitude
    ) {
      if (!this.map) return 5; // Default size if map not available

      const zoom = this.map.getZoom();
      const pixelRatio = window.devicePixelRatio || 1;
      const metersPerPixel =
        (156543.03392 * Math.cos((latitude * Math.PI) / 180)) /
        Math.pow(2, zoom);
      return (meterRadius / metersPerPixel) * pixelRatio;
    };

    /**
     * Method to update visible circles based on zoom level
     */
    App.Features.StakeOut._updateVisibleCirclesByZoom = function () {
      if (!this.map) return;

      const zoom = this.map.getZoom();

      if (!this._circles) {
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

      // Determine which circles to show based on zoom level
      if (zoom >= 26) {
        this._visibleCircles = this._circles.slice(); // Show all circles
      } else if (zoom >= 23) {
        this._visibleCircles = this._circles.filter((circle) =>
          [2.0, 1.0, 0.5, 0.3, 0.1, 0.05].includes(circle.radius)
        );
      } else if (zoom >= 22) {
        this._visibleCircles = this._circles.filter((circle) =>
          [2.0, 1.0, 0.5, 0.3, 0.1].includes(circle.radius)
        );
      } else if (zoom >= 20) {
        this._visibleCircles = this._circles.filter((circle) =>
          [2.0, 1.0, 0.5].includes(circle.radius)
        );
      } else if (zoom >= 17) {
        this._visibleCircles = this._circles.filter((circle) =>
          [2.0, 1.0].includes(circle.radius)
        );
      } else {
        this._visibleCircles = [];
      }
    };

    /**
     * Method to create or update HTML labels for the circles
     */
    App.Features.StakeOut._createOrUpdateHTMLLabels = function (lng, lat) {
      if (!this.map || !this._visibleCircles || !this._visibleCircles.length)
        return;

      // Initialize labelMarkers array if it doesn't exist
      if (!this._labelMarkers) this._labelMarkers = [];

      // Create a mapping of existing markers by radius
      const existingMarkersByRadius = {};
      if (this._labelMarkers && this._labelMarkers.length > 0) {
        this._labelMarkers.forEach((marker) => {
          if (marker.radius) {
            existingMarkersByRadius[marker.radius] = marker;
          }
        });
      }

      const updatedMarkers = [];

      // Create or update markers for each visible circle
      this._visibleCircles.forEach((circle) => {
        // Calculate position for the label
        let labelPoint;
        try {
          // Use turf if available
          if (typeof turf !== "undefined" && turf.destination) {
            labelPoint = turf.destination([lng, lat], circle.radius, 90, {
              units: "meters",
            });
            labelPoint = labelPoint.geometry.coordinates;
          } else {
            // Simple approximation
            const latRadians = (lat * Math.PI) / 180;
            const metersPerDegreeLng = 111320 * Math.cos(latRadians);
            const metersPerDegreeLat = 110540;

            const lngDelta = circle.radius / metersPerDegreeLng;
            const latDelta = 0; // Place label directly east

            labelPoint = [lng + lngDelta, lat + latDelta];
          }
        } catch (error) {
          console.error("Error calculating label position:", error);
          labelPoint = [lng + 0.0001, lat]; // Fallback
        }

        // Check if marker already exists
        if (existingMarkersByRadius[circle.radius]) {
          // Update existing marker
          existingMarkersByRadius[circle.radius].setLngLat(labelPoint);
          updatedMarkers.push(existingMarkersByRadius[circle.radius]);
        } else {
          // Create new marker
          try {
            const el = document.createElement("div");
            el.className = "circle-label";
            el.style.color = "white";
            el.style.textShadow =
              "0px 0px 5px rgba(0, 0, 0, 0.8), 0px 0px 3px rgba(0, 0, 0, 0.5)";
            el.style.fontSize = "12px";
            el.style.fontWeight = "bold";
            el.style.pointerEvents = "none";
            el.textContent = circle.label;

            const marker = new maplibregl.Marker({
              element: el,
              anchor: "left",
            })
              .setLngLat(labelPoint)
              .addTo(this.map);

            marker.radius = circle.radius;
            updatedMarkers.push(marker);
          } catch (error) {
            console.error("Error creating label marker:", error);
          }
        }
      });

      // Remove any markers that are no longer needed
      const visibleRadii = this._visibleCircles.map((c) => c.radius);
      if (this._labelMarkers && this._labelMarkers.length > 0) {
        this._labelMarkers.forEach((marker) => {
          if (marker.radius && !visibleRadii.includes(marker.radius)) {
            marker.remove();
          }
        });
      }

      // Update the marker reference
      this._labelMarkers = updatedMarkers;
    };

    /**
     * Method to check if current location is within a circle's radius
     */
    App.Features.StakeOut._isWithinCircle = function (
      circleRadius,
      currentLng,
      currentLat
    ) {
      try {
        if (!this._targetLng || !this._targetLat) return false;

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

        // Return true if within radius
        return distance <= circleRadius;
      } catch (e) {
        console.error("Error checking if within circle:", e);
        return false;
      }
    };

    /**
     * Method to update circle states based on current position
     */
    App.Features.StakeOut._updateCircleStates = function (
      currentLng,
      currentLat
    ) {
      if (!this._visibleCircles || !this._visibleCircles.length) return;

      // Update active state for each circle
      this._visibleCircles.forEach((circle) => {
        circle.isActive = this._isWithinCircle(
          circle.radius,
          currentLng,
          currentLat
        );
      });

      // Update the appearance of the circles
      this._updateMapLibreCircleStates();
    };

    /**
     * Method to update MapLibre circle states
     */
    App.Features.StakeOut._updateMapLibreCircleStates = function () {
      if (!this.map || !this._visibleCircles || !this._visibleCircles.length)
        return;

      // Set default values if not available
      if (typeof this._outlineWidthPx === "undefined")
        this._outlineWidthPx = 2.0;
      if (typeof this._activeOutlineWidthPx === "undefined")
        this._activeOutlineWidthPx = 4.0;

      // Update each circle's appearance
      this._visibleCircles.forEach((circle, i) => {
        const layerId = `maplibre-circle-${i}`;
        if (this.map.getLayer(layerId)) {
          // Convert color to RGB
          const colorRgb = circle.color.map((c) => Math.round(c * 255));

          // Determine stroke color based on active state
          const strokeColor = circle.isActive
            ? `rgb(${colorRgb[0]}, ${colorRgb[1]}, ${colorRgb[2]})`
            : `rgb(77, 77, 77)`;

          // Determine stroke width based on active state
          const strokeWidth = circle.isActive
            ? this._activeOutlineWidthPx
            : this._outlineWidthPx;

          // Update the circle's appearance
          try {
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
          } catch (error) {
            console.error(`Error updating circle ${layerId}:`, error);
          }
        }
      });
    };

    /**
     * Handler for zoom events
     */
    App.Features.StakeOut._handleZoom = function () {
      if (this._zoomUpdateTimeout) {
        clearTimeout(this._zoomUpdateTimeout);
      }
    };

    /**
     * Handler for zoom start events
     */
    App.Features.StakeOut._handleZoomStart = function () {
      // Hide circles during zooming for performance
      if (this._visibleCircles) {
        this._visibleCircles.forEach((circle, i) => {
          const layerId = `maplibre-circle-${i}`;
          if (this.map.getLayer(layerId)) {
            this.map.setLayoutProperty(layerId, "visibility", "none");
          }
        });
      }
    };

    /**
     * Handler for zoom end events
     */
    App.Features.StakeOut._handleZoomEnd = function () {
      if (this._zoomUpdateTimeout) {
        clearTimeout(this._zoomUpdateTimeout);
      }

      this._zoomUpdateTimeout = setTimeout(() => {
        this._updateVisibleCirclesByZoom();
        this._createOrUpdateMapLibreCircles();

        if (this._targetLng !== undefined && this._targetLat !== undefined) {
          this._createOrUpdateHTMLLabels(this._targetLng, this._targetLat);
        }
      }, 100);
    };

    // Enhanced updateCurrentLocation to update circle states
    if (
      !App.Features.StakeOut._renderingUpdateCurrentLocation &&
      typeof App.Features.StakeOut.updateCurrentLocation === "function"
    ) {
      App.Features.StakeOut._renderingUpdateCurrentLocation =
        App.Features.StakeOut.updateCurrentLocation;

      // Override with a new function that also updates circle states
      App.Features.StakeOut.updateCurrentLocation = function (
        currentLng,
        currentLat
      ) {
        // Call the existing method
        if (this._renderingUpdateCurrentLocation) {
          this._renderingUpdateCurrentLocation.call(
            this,
            currentLng,
            currentLat
          );
        }

        // Update circle states if we're active
        if (this._stakeOutActive && this._circleLayersCreated) {
          this._updateCircleStates(currentLng, currentLat);
        }
      };

      console.log("Enhanced updateCurrentLocation to update circle states");
    }

    console.log("StakeOut circle rendering enhancement complete");
  }

  // Start initialization with a delay to ensure all components are loaded
  setTimeout(initStakeOutCircleRendering, 1800);
})();
