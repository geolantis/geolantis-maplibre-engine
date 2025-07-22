/**
 * Enhanced Feature Labels
 * Handles the display of labels for distances and areas on selected features
 * @namespace App.Map.Labels
 */
App.Map = App.Map || {};
App.Map.Labels = (function () {
  // Private variables
  var _map = null;
  var _initialized = false;
  var _displayUnits = "metric"; // 'metric' or 'imperial'
  var _labelLayers = [];
  var _labelSources = [];
  var _activeFeature = null;
  var _labelVisibility = true;

  /**
   * Format distance value with appropriate units
   * @param {number} meters - Distance in meters
   * @returns {string} - Formatted distance string
   * @private
   */
  function _formatDistance(meters) {
    if (_displayUnits === "imperial") {
      // Convert to feet
      const feet = meters * 3.28084;
      if (feet >= 5280) {
        // Show in miles if >= 1 mile
        const miles = feet / 5280;
        return miles.toFixed(2) + " mi";
      } else {
        // Show in feet
        return feet.toFixed(1) + " ft";
      }
    } else {
      // Metric (default)
      if (meters >= 1000) {
        // Show in kilometers if >= 1km
        const km = meters / 1000;
        return km.toFixed(2) + " km";
      } else {
        // Show in meters
        return meters.toFixed(1) + " m";
      }
    }
  }

  /**
   * Format area value with appropriate units
   * @param {number} squareMeters - Area in square meters
   * @returns {string} - Formatted area string
   * @private
   */
  function _formatArea(squareMeters) {
    if (_displayUnits === "imperial") {
      // Convert to square feet
      const squareFeet = squareMeters * 10.7639;
      if (squareFeet >= 43560) {
        // Show in acres if >= 1 acre
        const acres = squareFeet / 43560;
        return acres.toFixed(2) + " ac";
      } else {
        // Show in square feet
        return squareFeet.toFixed(1) + " ft²";
      }
    } else {
      // Metric (default)
      if (squareMeters >= 10000) {
        // Show in hectares if >= 1 hectare
        const hectares = squareMeters / 10000;
        return hectares.toFixed(2) + " ha";
      } else {
        // Show in square meters
        return squareMeters.toFixed(1) + " m²";
      }
    }
  }

  /**
   * Calculate midpoint of a line segment
   * @param {Array} start - Start coordinate [lng, lat]
   * @param {Array} end - End coordinate [lng, lat]
   * @returns {Array} - Midpoint coordinate [lng, lat]
   * @private
   */
  function _calculateMidpoint(start, end) {
    return [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
  }

  /**
   * Calculate centroid of a polygon
   * @param {Object} polygon - GeoJSON polygon feature
   * @returns {Array} - Centroid coordinate [lng, lat]
   * @private
   */
  function _calculateCentroid(polygon) {
    if (!window.turf) {
      console.error("Turf.js not available for centroid calculation");

      // Fallback: calculate simple average of coordinates
      let sumLng = 0;
      let sumLat = 0;
      let count = 0;

      // First ring only (outer ring)
      polygon.geometry.coordinates[0].forEach((coord) => {
        sumLng += coord[0];
        sumLat += coord[1];
        count++;
      });

      return [sumLng / count, sumLat / count];
    }

    try {
      const centroid = turf.centroid(polygon);
      return centroid.geometry.coordinates;
    } catch (error) {
      console.error("Error calculating polygon centroid:", error);

      // Fallback: calculate simple average of coordinates
      let sumLng = 0;
      let sumLat = 0;
      let count = 0;

      // First ring only (outer ring)
      polygon.geometry.coordinates[0].forEach((coord) => {
        sumLng += coord[0];
        sumLat += coord[1];
        count++;
      });

      return [sumLng / count, sumLat / count];
    }
  }

  /**
   * Clean up existing labels
   * @private
   */
  function _cleanupLabels() {
    // Remove layers first
    _labelLayers.forEach((layerId) => {
      if (_map.getLayer(layerId)) {
        _map.removeLayer(layerId);
      }
    });

    // Then remove sources
    _labelSources.forEach((sourceId) => {
      if (_map.getSource(sourceId)) {
        _map.removeSource(sourceId);
      }
    });

    // Clear arrays
    _labelLayers = [];
    _labelSources = [];
  }

  /**
   * Add distance labels for line segments
   * @param {Object} feature - GeoJSON feature
   * @private
   */
  function _addDistanceLabels(feature) {
    if (!feature || !feature.geometry) return;

    // Only process lines and polygons
    if (
      !["LineString", "MultiLineString", "Polygon", "MultiPolygon"].includes(
        feature.geometry.type
      )
    ) {
      return;
    }

    const distanceLabels = [];
    const uniqueId = `distance-labels-${Date.now()}`;

    try {
      // Process different geometry types
      switch (feature.geometry.type) {
        case "LineString":
          // Calculate distance for each segment
          for (let i = 0; i < feature.geometry.coordinates.length - 1; i++) {
            const start = feature.geometry.coordinates[i];
            const end = feature.geometry.coordinates[i + 1];

            // Create a line segment for distance calculation
            const line = {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [start, end],
              },
            };

            // Calculate distance
            let distance;
            if (window.turf) {
              distance = turf.length(line, { units: "meters" });
            } else {
              // Fallback - rough approximation using Haversine
              distance = _approximateDistance(start, end);
            }

            // Skip very small segments
            if (distance < 0.01) continue;

            // Calculate midpoint for label
            const midpoint = _calculateMidpoint(start, end);

            // Add label point
            distanceLabels.push({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: midpoint,
              },
              properties: {
                distance: _formatDistance(distance),
                segmentIndex: i,
              },
            });
          }
          break;

        case "MultiLineString":
          // Process each line in the multi-line
          feature.geometry.coordinates.forEach((line, lineIndex) => {
            for (let i = 0; i < line.length - 1; i++) {
              const start = line[i];
              const end = line[i + 1];

              // Create a line segment for distance calculation
              const lineSegment = {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: [start, end],
                },
              };

              // Calculate distance
              let distance;
              if (window.turf) {
                distance = turf.length(lineSegment, { units: "meters" });
              } else {
                // Fallback - rough approximation
                distance = _approximateDistance(start, end);
              }

              // Skip very small segments
              if (distance < 0.01) continue;

              // Calculate midpoint for label
              const midpoint = _calculateMidpoint(start, end);

              // Add label point
              distanceLabels.push({
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: midpoint,
                },
                properties: {
                  distance: _formatDistance(distance),
                  lineIndex: lineIndex,
                  segmentIndex: i,
                },
              });
            }
          });
          break;

        case "Polygon":
          // Process outer ring of polygon
          const outerRing = feature.geometry.coordinates[0];
          for (let i = 0; i < outerRing.length - 1; i++) {
            const start = outerRing[i];
            const end = outerRing[i + 1];

            // Create a line segment for distance calculation
            const lineSegment = {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [start, end],
              },
            };

            // Calculate distance
            let distance;
            if (window.turf) {
              distance = turf.length(lineSegment, { units: "meters" });
            } else {
              // Fallback - rough approximation
              distance = _approximateDistance(start, end);
            }

            // Skip very small segments
            if (distance < 0.01) continue;

            // Calculate midpoint for label
            const midpoint = _calculateMidpoint(start, end);

            // Add label point
            distanceLabels.push({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: midpoint,
              },
              properties: {
                distance: _formatDistance(distance),
                ringIndex: 0,
                segmentIndex: i,
              },
            });
          }
          break;

        case "MultiPolygon":
          // Process outer ring of each polygon
          feature.geometry.coordinates.forEach((polygon, polygonIndex) => {
            const outerRing = polygon[0];
            for (let i = 0; i < outerRing.length - 1; i++) {
              const start = outerRing[i];
              const end = outerRing[i + 1];

              // Create a line segment for distance calculation
              const lineSegment = {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: [start, end],
                },
              };

              // Calculate distance
              let distance;
              if (window.turf) {
                distance = turf.length(lineSegment, { units: "meters" });
              } else {
                // Fallback - rough approximation
                distance = _approximateDistance(start, end);
              }

              // Skip very small segments
              if (distance < 0.01) continue;

              // Calculate midpoint for label
              const midpoint = _calculateMidpoint(start, end);

              // Add label point
              distanceLabels.push({
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: midpoint,
                },
                properties: {
                  distance: _formatDistance(distance),
                  polygonIndex: polygonIndex,
                  ringIndex: 0,
                  segmentIndex: i,
                },
              });
            }
          });
          break;
      }

      // Add the source and layer if we have labels
      if (distanceLabels.length > 0) {
        // Add the source
        _map.addSource(uniqueId, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: distanceLabels,
          },
        });
        _labelSources.push(uniqueId);

        // Add the layer
        const layerId = `${uniqueId}-layer`;
        _map.addLayer({
          id: layerId,
          type: "symbol",
          source: uniqueId,
          layout: {
            "text-field": ["get", "distance"],
            "text-size": 12,
            "text-font": ["Roboto Regular", "Arial Unicode MS Regular"],
            "text-anchor": "center",
            "text-allow-overlap": true,
            "text-ignore-placement": true,
            "text-padding": 2,
            "symbol-z-order": "source",
            "symbol-placement": "point",
          },
          paint: {
            "text-color": "#FFFFFF",
            "text-halo-color": "#000000",
            "text-halo-width": 2,
            "text-opacity": 0.9,
          },
        });
        _labelLayers.push(layerId);

        console.log(
          `Added ${distanceLabels.length} distance labels with ID: ${layerId}`
        );
      }
    } catch (error) {
      console.error("Error creating distance labels:", error);
    }
  }

  /**
   * Add area labels for polygons
   * @param {Object} feature - GeoJSON feature
   * @private
   */
  function _addAreaLabels(feature) {
    if (!feature || !feature.geometry) return;

    // Only process polygons
    if (!["Polygon", "MultiPolygon"].includes(feature.geometry.type)) {
      return;
    }

    const areaLabels = [];
    const uniqueId = `area-labels-${Date.now()}`;

    try {
      // Process different geometry types
      switch (feature.geometry.type) {
        case "Polygon":
          // Calculate area
          let area;
          if (window.turf) {
            area = turf.area(feature);
          } else {
            // Fallback - rough approximation
            area = _approximateArea(feature.geometry.coordinates[0]);
          }

          // Skip if area is too small
          if (area < 0.1) return;

          // Find centroid
          const centroid = _calculateCentroid(feature);

          // Add label point
          areaLabels.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: centroid,
            },
            properties: {
              area: _formatArea(area),
            },
          });
          break;

        case "MultiPolygon":
          // Process each polygon
          feature.geometry.coordinates.forEach(
            (polygonCoords, polygonIndex) => {
              const polygonFeature = {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: polygonCoords,
                },
              };

              // Calculate area
              let area;
              if (window.turf) {
                area = turf.area(polygonFeature);
              } else {
                // Fallback - rough approximation
                area = _approximateArea(polygonCoords[0]);
              }

              // Skip if area is too small
              if (area < 0.1) return;

              // Find centroid
              const centroid = _calculateCentroid(polygonFeature);

              // Add label point
              areaLabels.push({
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: centroid,
                },
                properties: {
                  area: _formatArea(area),
                  polygonIndex: polygonIndex,
                },
              });
            }
          );
          break;
      }

      // Add the source and layer if we have labels
      if (areaLabels.length > 0) {
        // Add the source
        _map.addSource(uniqueId, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: areaLabels,
          },
        });
        _labelSources.push(uniqueId);

        // Add the layer
        const layerId = `${uniqueId}-layer`;
        _map.addLayer({
          id: layerId,
          type: "symbol",
          source: uniqueId,
          layout: {
            "text-field": ["get", "area"],
            "text-size": 14,
            "text-font": ["Roboto Bold", "Arial Unicode MS Bold"],
            "text-anchor": "center",
            "text-allow-overlap": true,
            "text-ignore-placement": true,
            "symbol-z-order": "source",
            "symbol-placement": "point",
          },
          paint: {
            "text-color": "#FFFFFF",
            "text-halo-color": "#000000",
            "text-halo-width": 2,
            "text-opacity": 0.95,
          },
        });
        _labelLayers.push(layerId);

        console.log(
          `Added ${areaLabels.length} area labels with ID: ${layerId}`
        );
      }
    } catch (error) {
      console.error("Error creating area labels:", error);
    }
  }

  /**
   * Fallback function to approximate distance between two points
   * Uses the Haversine formula
   * @param {Array} start - Start coordinate [lng, lat]
   * @param {Array} end - End coordinate [lng, lat]
   * @returns {number} - Approximate distance in meters
   * @private
   */
  function _approximateDistance(start, end) {
    const R = 6371000; // Earth's radius in meters
    const dLat = _toRadians(end[1] - start[1]);
    const dLon = _toRadians(end[0] - start[0]);
    const lat1 = _toRadians(start[1]);
    const lat2 = _toRadians(end[1]);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Fallback function to approximate area of a polygon
   * Uses the Shoelace formula (Gauss's area formula)
   * @param {Array} coordinates - Array of [lng, lat] coordinates forming the polygon
   * @returns {number} - Approximate area in square meters
   * @private
   */
  function _approximateArea(coordinates) {
    // First convert lng/lat to meters (rough approximation)
    const earthRadius = 6371000; // meters
    const points = coordinates.map((coord) => {
      const x =
        ((coord[0] * Math.PI) / 180) *
        earthRadius *
        Math.cos((coord[1] * Math.PI) / 180);
      const y = ((coord[1] * Math.PI) / 180) * earthRadius;
      return [x, y];
    });

    // Calculate area using Shoelace formula
    let area = 0;
    for (let i = 0; i < points.length - 1; i++) {
      area += points[i][0] * points[i + 1][1] - points[i + 1][0] * points[i][1];
    }

    return Math.abs(area / 2);
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Angle in degrees
   * @returns {number} - Angle in radians
   * @private
   */
  function _toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Load Turf.js if needed
   * @returns {Promise} - Promise that resolves when Turf is loaded
   * @private
   */
  function _loadTurf() {
    return new Promise((resolve, reject) => {
      // Skip if already loaded
      if (window.turf) {
        return resolve();
      }

      // Add script element
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@turf/turf@6/turf.min.js";
      script.onload = () => {
        console.log("Turf.js loaded successfully");
        resolve();
      };
      script.onerror = (error) => {
        console.error("Failed to load Turf.js:", error);
        // Resolve anyway, we have fallbacks
        resolve();
      };

      document.head.appendChild(script);
    });
  }

  // Public API
  return {
    /**
     * Initialize the Labels module
     * @param {Object} map - MapLibre GL JS map instance
     */
    initialize: function (map) {
      if (_initialized) return;

      _map = map;

      // Try to load Turf.js
      _loadTurf()
        .then(() => {
          _initialized = true;
          console.log("Labels module initialized successfully");
        })
        .catch((error) => {
          console.warn(
            "Labels module initialized without Turf.js, using fallbacks"
          );
          _initialized = true;
        });

      // Listen for feature selection events
      if (App.Core && App.Core.Events) {
        App.Core.Events.on("feature.selected", (data) => {
          if (_labelVisibility && data && data.feature) {
            this.addLabels(data.feature);
          }
        });

        // Also listen for feature cleared events
        App.Core.Events.on("features.cleared", () => {
          this.clearLabels();
        });
      }
    },

    /**
     * Set the display units for labels
     * @param {string} units - 'metric' or 'imperial'
     */
    setUnits: function (units) {
      if (units !== "metric" && units !== "imperial") {
        console.error(
          `Invalid units: ${units}. Must be 'metric' or 'imperial'`
        );
        return;
      }

      _displayUnits = units;

      // Update labels if there's an active feature
      if (_activeFeature) {
        this.addLabels(_activeFeature);
      }
    },

    /**
     * Toggle between metric and imperial units
     * @returns {string} - The new units setting
     */
    toggleUnits: function () {
      _displayUnits = _displayUnits === "metric" ? "imperial" : "metric";

      // Update labels if there's an active feature
      if (_activeFeature) {
        this.addLabels(_activeFeature);
      }

      return _displayUnits;
    },

    /**
     * Set label visibility
     * @param {boolean} visible - Whether labels should be visible
     */
    setVisible: function (visible) {
      _labelVisibility = !!visible;

      if (!_labelVisibility) {
        this.clearLabels();
      } else if (_activeFeature) {
        this.addLabels(_activeFeature);
      }
    },

    /**
     * Clear all labels
     */
    clearLabels: function () {
      _cleanupLabels();
      _activeFeature = null;
    },

    /**
     * Add distance and area labels for a feature
     * @param {Object} feature - GeoJSON feature
     */
    addLabels: function (feature) {
      if (!_map || !_initialized || !_labelVisibility) {
        return;
      }

      // Clear existing labels
      _cleanupLabels();

      // Store the active feature
      _activeFeature = feature;

      // Add labels
      _addDistanceLabels(feature);
      _addAreaLabels(feature);
    },
  };
})();

// Initialize when App.Core.Init signals that the map is ready
if (App.Core && App.Core.Events) {
  App.Core.Events.on("map.ready", function (data) {
    if (data && data.map) {
      App.Map.Labels.initialize(data.map);
      console.log("Labels module subscribed to map.ready event");
    }
  });
}

console.log("App.Map.Labels module loaded");
