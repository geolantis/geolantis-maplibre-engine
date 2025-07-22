/**
 * Enhanced feature visualization
 * Adds node markers, segment distances, and area labels to selected features
 * @namespace App.Map.FeatureEnhancer
 */
App.Map = App.Map || {};
App.Map.FeatureEnhancer = (function () {
  // Private variables
  var _map = null;
  var _enhancementLayers = [];
  var _enhancementSources = [];
  var _nodeSize = 6;
  var _displayUnits = "metric"; // 'metric' or 'imperial'
  var _initialized = false;
  var _activeTurfLibraries = false;
  var _activeFeatures = [];
  var _showDistances = true;
  var _showAreas = true;

  // Prefix for all enhancement layers to avoid conflicts with feature selection
  const ENHANCER_PREFIX = "enhancer-";

  /**
   * Initialize required libraries
   * @private
   */
  function _ensureTurfLibraries() {
    if (_activeTurfLibraries) return Promise.resolve();

    return new Promise((resolve, reject) => {
      try {
        // Check if Turf is already available
        if (typeof turf !== "undefined") {
          _activeTurfLibraries = true;
          return resolve();
        }

        // Create script elements to load Turf.js
        const script = document.createElement("script");
        script.src = "https://unpkg.com/@turf/turf@6/turf.min.js";
        script.onload = () => {
          console.log("Turf.js loaded successfully");
          _activeTurfLibraries = true;
          resolve();
        };
        script.onerror = (error) => {
          console.error("Failed to load Turf.js:", error);
          reject(error);
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error("Error initializing Turf libraries:", error);
        reject(error);
      }
    });
  }

  /**
   * Clean up existing enhancement layers and sources
   * @private
   */
  function _cleanupExistingEnhancements() {
    if (!_map) return;

    // Remove layers first
    _enhancementLayers.forEach((layerId) => {
      if (_map.getLayer(layerId)) {
        try {
          _map.removeLayer(layerId);
        } catch (e) {
          console.warn(`Error removing layer ${layerId}:`, e);
        }
      }
    });

    // Then remove sources
    _enhancementSources.forEach((sourceId) => {
      if (_map.getSource(sourceId)) {
        try {
          _map.removeSource(sourceId);
        } catch (e) {
          console.warn(`Error removing source ${sourceId}:`, e);
        }
      }
    });

    // Clear arrays
    _enhancementLayers = [];
    _enhancementSources = [];

    console.log("Cleaned up existing feature enhancements");
  }

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
   * Calculate centroid of a polygon with optional offset
   * @param {Array} coordinates - Polygon coordinates
   * @returns {Array} - Centroid coordinate [lng, lat]
   * @private
   */
  function _calculateCentroid(polygon) {
    if (!turf) {
      console.error("Turf.js not available for centroid calculation");
      return null;
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
   * Create a unique ID with the enhancer prefix
   * @param {string} id - Original ID
   * @returns {string} - Prefixed ID
   * @private
   */
  function _createEnhancerId(id) {
    return `${ENHANCER_PREFIX}${id}`;
  }

  /**
   * Add node markers for a feature
   * @param {Object} feature - GeoJSON feature
   * @param {string} nodeSourceId - ID for node source
   * @private
   */
  function _addNodeMarkers(feature, nodeSourceId) {
    try {
      if (!feature || !feature.geometry) return;

      // Make source ID unique to avoid conflicts with feature selection
      const uniqueSourceId = _createEnhancerId(nodeSourceId);

      // Extract all nodes from the feature geometry
      const nodes = [];

      switch (feature.geometry.type) {
        case "Point":
          // For a point, just add the point itself
          nodes.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: feature.geometry.coordinates,
            },
            properties: {
              isNode: true,
              nodeIndex: 0,
            },
          });
          break;

        case "LineString":
          // Add all points in the line
          feature.geometry.coordinates.forEach((coord, index) => {
            nodes.push({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: coord,
              },
              properties: {
                isNode: true,
                nodeIndex: index,
                isEndpoint:
                  index === 0 ||
                  index === feature.geometry.coordinates.length - 1,
              },
            });
          });
          break;

        case "MultiLineString":
          // Add all points in all lines
          feature.geometry.coordinates.forEach((line, lineIndex) => {
            line.forEach((coord, pointIndex) => {
              nodes.push({
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: coord,
                },
                properties: {
                  isNode: true,
                  lineIndex: lineIndex,
                  nodeIndex: pointIndex,
                  isEndpoint:
                    pointIndex === 0 || pointIndex === line.length - 1,
                },
              });
            });
          });
          break;

        case "Polygon":
          // Add all points in all rings (but mark inner rings differently)
          feature.geometry.coordinates.forEach((ring, ringIndex) => {
            ring.forEach((coord, pointIndex) => {
              // Skip the last point in each ring (duplicate of first)
              if (pointIndex < ring.length - 1) {
                nodes.push({
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: coord,
                  },
                  properties: {
                    isNode: true,
                    ringIndex: ringIndex,
                    nodeIndex: pointIndex,
                    isInnerRing: ringIndex > 0,
                  },
                });
              }
            });
          });
          break;

        case "MultiPolygon":
          // Add all points in all polygons
          feature.geometry.coordinates.forEach((polygon, polygonIndex) => {
            polygon.forEach((ring, ringIndex) => {
              ring.forEach((coord, pointIndex) => {
                // Skip the last point in each ring (duplicate of first)
                if (pointIndex < ring.length - 1) {
                  nodes.push({
                    type: "Feature",
                    geometry: {
                      type: "Point",
                      coordinates: coord,
                    },
                    properties: {
                      isNode: true,
                      polygonIndex: polygonIndex,
                      ringIndex: ringIndex,
                      nodeIndex: pointIndex,
                      isInnerRing: ringIndex > 0,
                    },
                  });
                }
              });
            });
          });
          break;
      }

      // Create or update the node source
      const nodeSource = _map.getSource(uniqueSourceId);
      if (nodeSource) {
        nodeSource.setData({
          type: "FeatureCollection",
          features: nodes,
        });
      } else {
        _map.addSource(uniqueSourceId, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: nodes,
          },
        });
        _enhancementSources.push(uniqueSourceId);
      }

      // Create a layer for regular nodes
      const nodeLayerId = `${uniqueSourceId}-nodes`;
      if (!_map.getLayer(nodeLayerId)) {
        _map.addLayer({
          id: nodeLayerId,
          type: "circle",
          source: uniqueSourceId,
          paint: {
            "circle-radius": _nodeSize,
            "circle-color": [
              "case",
              ["==", ["get", "isInnerRing"], true],
              "#FFA500", // Orange for inner ring nodes
              ["==", ["get", "isEndpoint"], true],
              "#00FF00", // Green for endpoints
              "#FFFFFF", // White for regular nodes
            ],
            "circle-stroke-color": "#000000",
            "circle-stroke-width": 2,
          },
        });
        _enhancementLayers.push(nodeLayerId);
      } else {
        // Update the node size if the layer already exists
        _map.setPaintProperty(nodeLayerId, "circle-radius", _nodeSize);
      }

      console.log(`Added ${nodes.length} node markers for feature`);
    } catch (error) {
      console.error("Error adding node markers:", error);
    }
  }

  /**
   * Add distance labels for line segments
   * @param {Object} feature - GeoJSON feature
   * @param {string} distanceSourceId - ID for distance label source
   * @private
   */
  function _addDistanceLabels(feature, distanceSourceId) {
    try {
      if (!feature || !feature.geometry || !turf || !_showDistances) return;

      // Make source ID unique to avoid conflicts with feature selection
      const uniqueSourceId = _createEnhancerId(distanceSourceId);

      console.log(
        "Adding distance labels for feature type:",
        feature.geometry.type
      );

      // Only process lines and polygons
      if (
        !["LineString", "MultiLineString", "Polygon", "MultiPolygon"].includes(
          feature.geometry.type
        )
      ) {
        return;
      }

      const distanceLabels = [];

      switch (feature.geometry.type) {
        case "LineString":
          // Calculate distance for each segment
          for (let i = 0; i < feature.geometry.coordinates.length - 1; i++) {
            const start = feature.geometry.coordinates[i];
            const end = feature.geometry.coordinates[i + 1];

            // Create a tiny line segment for distance calculation
            const lineSegment = turf.lineString([start, end]);
            const distance = turf.length(lineSegment, { units: "meters" });

            // Calculate midpoint for label placement
            const midpoint = _calculateMidpoint(start, end);

            distanceLabels.push({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: midpoint,
              },
              properties: {
                distanceText: _formatDistance(distance),
                segmentIndex: i,
                bearing: turf.bearing(start, end),
              },
            });
          }
          break;

        case "MultiLineString":
          // Calculate distance for each segment in each line
          feature.geometry.coordinates.forEach((line, lineIndex) => {
            for (let i = 0; i < line.length - 1; i++) {
              const start = line[i];
              const end = line[i + 1];

              // Create a tiny line segment for distance calculation
              const lineSegment = turf.lineString([start, end]);
              const distance = turf.length(lineSegment, { units: "meters" });

              // Calculate midpoint for label placement
              const midpoint = _calculateMidpoint(start, end);

              distanceLabels.push({
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: midpoint,
                },
                properties: {
                  distanceText: _formatDistance(distance),
                  lineIndex: lineIndex,
                  segmentIndex: i,
                  bearing: turf.bearing(start, end),
                },
              });
            }
          });
          break;

        case "Polygon":
          // Calculate distance for each segment in the outer ring only
          const outerRing = feature.geometry.coordinates[0];
          for (let i = 0; i < outerRing.length - 1; i++) {
            const start = outerRing[i];
            const end = outerRing[i + 1];

            // Create a tiny line segment for distance calculation
            const lineSegment = turf.lineString([start, end]);
            const distance = turf.length(lineSegment, { units: "meters" });

            // Calculate midpoint for label placement
            const midpoint = _calculateMidpoint(start, end);

            distanceLabels.push({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: midpoint,
              },
              properties: {
                distanceText: _formatDistance(distance),
                segmentIndex: i,
                bearing: turf.bearing(start, end),
              },
            });
          }
          break;

        case "MultiPolygon":
          // Calculate distance for each segment in the outer ring of each polygon
          feature.geometry.coordinates.forEach((polygon, polygonIndex) => {
            const outerRing = polygon[0];
            for (let i = 0; i < outerRing.length - 1; i++) {
              const start = outerRing[i];
              const end = outerRing[i + 1];

              // Create a tiny line segment for distance calculation
              const lineSegment = turf.lineString([start, end]);
              const distance = turf.length(lineSegment, { units: "meters" });

              // Calculate midpoint for label placement
              const midpoint = _calculateMidpoint(start, end);

              distanceLabels.push({
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: midpoint,
                },
                properties: {
                  distanceText: _formatDistance(distance),
                  polygonIndex: polygonIndex,
                  segmentIndex: i,
                  bearing: turf.bearing(start, end),
                },
              });
            }
          });
          break;
      }

      console.log(`Generated ${distanceLabels.length} distance labels`);

      // Create or update the distance label source
      const distSource = _map.getSource(uniqueSourceId);
      if (distSource) {
        distSource.setData({
          type: "FeatureCollection",
          features: distanceLabels,
        });
      } else {
        _map.addSource(uniqueSourceId, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: distanceLabels,
          },
        });
        _enhancementSources.push(uniqueSourceId);
      }

      // Create a layer for distance labels
      const distanceLayerId = `${uniqueSourceId}-labels`;
      if (!_map.getLayer(distanceLayerId)) {
        _map.addLayer(
          {
            id: distanceLayerId,
            type: "symbol",
            source: uniqueSourceId,
            layout: {
              // Use 'get' expression to get the value from the property
              "text-field": ["get", "distanceText"],
              "text-size": 16, // Increased size for visibility
              "text-font": ["Arial Unicode MS Bold"], // Ensure widely available font
              "text-anchor": "center",
              "text-allow-overlap": true,
              "text-ignore-placement": true,
              "symbol-placement": "point",
              "text-letter-spacing": 0.05, // Slight spacing for better readability
              "text-max-width": 15, // Allow more characters per line
            },
            paint: {
              "text-color": "#FFFF00", // Bright yellow for visibility
              "text-halo-color": "#000000",
              "text-halo-width": 3, // Thicker halo for better contrast
              "text-opacity": 1,
            },
          },
          "poi-label"
        ); // Insert before POI labels to ensure visibility

        _enhancementLayers.push(distanceLayerId);

        console.log(`Created distance label layer: ${distanceLayerId}`);
      }

      // Verify source data
      if (_map.getSource(uniqueSourceId)) {
        const features = _map.querySourceFeatures(uniqueSourceId);
        console.log(`Source ${uniqueSourceId} has ${features.length} features`);
      }
    } catch (error) {
      console.error("Error adding distance labels:", error);
    }
  }

  /**
   * Add area labels for polygons
   * @param {Object} feature - GeoJSON feature
   * @param {string} areaSourceId - ID for area label source
   * @private
   */
  function _addAreaLabels(feature, areaSourceId) {
    try {
      if (!feature || !feature.geometry || !turf || !_showAreas) return;

      // Make source ID unique to avoid conflicts with feature selection
      const uniqueSourceId = _createEnhancerId(areaSourceId);

      console.log(
        "Adding area labels for feature type:",
        feature.geometry.type
      );

      // Only process polygons
      if (!["Polygon", "MultiPolygon"].includes(feature.geometry.type)) {
        return;
      }

      const areaLabels = [];

      switch (feature.geometry.type) {
        case "Polygon":
          // Calculate area for the polygon
          const area = turf.area(feature);
          const centroid = _calculateCentroid(feature);

          if (centroid) {
            areaLabels.push({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: centroid,
              },
              properties: {
                areaText: _formatArea(area),
              },
            });
          }
          break;

        case "MultiPolygon":
          // Calculate area for each polygon
          feature.geometry.coordinates.forEach(
            (polygonCoords, polygonIndex) => {
              const polygonFeature = {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: polygonCoords,
                },
              };

              const area = turf.area(polygonFeature);
              const centroid = _calculateCentroid(polygonFeature);

              if (centroid) {
                areaLabels.push({
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: centroid,
                  },
                  properties: {
                    areaText: _formatArea(area),
                    polygonIndex: polygonIndex,
                  },
                });
              }
            }
          );
          break;
      }

      console.log(`Generated ${areaLabels.length} area labels`);

      // Create or update the area label source
      const areaSource = _map.getSource(uniqueSourceId);
      if (areaSource) {
        areaSource.setData({
          type: "FeatureCollection",
          features: areaLabels,
        });
      } else {
        _map.addSource(uniqueSourceId, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: areaLabels,
          },
        });
        _enhancementSources.push(uniqueSourceId);
      }

      // Create a layer for area labels
      const areaLayerId = `${uniqueSourceId}-labels`;
      if (!_map.getLayer(areaLayerId)) {
        _map.addLayer(
          {
            id: areaLayerId,
            type: "symbol",
            source: uniqueSourceId,
            layout: {
              // Use 'get' expression to get the value from the property
              "text-field": ["get", "areaText"],
              "text-size": 18, // Larger size for area labels
              "text-font": ["Arial Unicode MS Bold"], // Ensure widely available font
              "text-anchor": "center",
              "text-allow-overlap": true,
              "text-ignore-placement": true,
              "symbol-placement": "point",
              "text-letter-spacing": 0.05, // Slight spacing for better readability
              "text-max-width": 15, // Allow more characters per line
            },
            paint: {
              "text-color": "#FF9900", // Orange for visibility
              "text-halo-color": "#000000",
              "text-halo-width": 3, // Thicker halo for better contrast
              "text-opacity": 1,
            },
          },
          "poi-label"
        ); // Insert before POI labels to ensure visibility

        _enhancementLayers.push(areaLayerId);

        console.log(`Created area label layer: ${areaLayerId}`);
      }

      // Verify source data
      if (_map.getSource(uniqueSourceId)) {
        const features = _map.querySourceFeatures(uniqueSourceId);
        console.log(`Source ${uniqueSourceId} has ${features.length} features`);
      }
    } catch (error) {
      console.error("Error adding area labels:", error);
    }
  }

  /**
   * Create simple debug labels to ensure the system is working
   * @param {Object} feature - GeoJSON feature
   * @private
   */
  function _addDebugLabels(feature) {
    if (!feature || !feature.geometry) return;

    try {
      // Create a unique source and layer for debug labels
      const sourceId = `debug-labels-${Date.now()}`;
      const layerId = `${sourceId}-layer`;

      let labelPoints = [];

      // For all geometry types, add a debug label at key points
      if (["Point"].includes(feature.geometry.type)) {
        labelPoints.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: feature.geometry.coordinates,
          },
          properties: {
            debugText: "DEBUG POINT",
          },
        });
      } else if (["LineString"].includes(feature.geometry.type)) {
        // Add at the middle point
        const midIdx = Math.floor(feature.geometry.coordinates.length / 2);
        labelPoints.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: feature.geometry.coordinates[midIdx],
          },
          properties: {
            debugText: "DEBUG LINE",
          },
        });
      } else if (["Polygon", "MultiPolygon"].includes(feature.geometry.type)) {
        // Add at the center
        const centroid = _calculateCentroid(feature);
        if (centroid) {
          labelPoints.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: centroid,
            },
            properties: {
              debugText: "DEBUG POLYGON",
            },
          });
        }
      }

      if (labelPoints.length === 0) return;

      // Create source
      _map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: labelPoints,
        },
      });
      _enhancementSources.push(sourceId);

      // Create layer with explicitly high z-index to ensure visibility
      _map.addLayer({
        id: layerId,
        type: "symbol",
        source: sourceId,
        layout: {
          "text-field": ["get", "debugText"],
          "text-size": 24,
          "text-font": ["Arial Unicode MS Bold"],
          "text-anchor": "center",
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#FF0000", // Bright red for debug
          "text-halo-color": "#FFFFFF",
          "text-halo-width": 4,
          "text-opacity": 1,
        },
      });
      _enhancementLayers.push(layerId);

      console.log(`Added debug labels for visualization testing`);
    } catch (error) {
      console.error("Error adding debug labels:", error);
    }
  }

  // Public API
  return {
    /**
     * Initialize the FeatureEnhancer
     * @param {Object} map - The MapLibre map instance
     */
    initialize: function (map) {
      _map = map;

      // Load required libraries
      _ensureTurfLibraries()
        .then(() => {
          _initialized = true;
          console.log("FeatureEnhancer initialized successfully");

          // Listen for feature selection events
          if (App.Core && App.Core.Events) {
            App.Core.Events.on("feature.selected", (data) => {
              if (data && data.feature) {
                this.enhanceFeature(data.feature);
              }
            });

            // Also listen for feature cleared events
            App.Core.Events.on("features.cleared", () => {
              this.clearEnhancements();
            });
          }
        })
        .catch((error) => {
          console.error("Failed to initialize FeatureEnhancer:", error);
        });
    },

    /**
     * Set display units for measurements
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

      // Update any active enhancements with new setting
      if (_activeFeatures.length > 0) {
        const featuresToReenhance = [..._activeFeatures];
        _cleanupExistingEnhancements();

        if (featuresToReenhance.length === 1) {
          this.enhanceFeature(featuresToReenhance[0]);
        } else {
          this.enhanceFeatures(featuresToReenhance);
        }
      }

      console.log(`Units set to ${units}`);
    },

    /**
     * Get current display units
     * @returns {string} - 'metric' or 'imperial'
     */
    getUnits: function () {
      return _displayUnits;
    },

    /**
     * Toggle between metric and imperial units
     * @returns {string} - The new units setting
     */
    toggleUnits: function () {
      _displayUnits = _displayUnits === "metric" ? "imperial" : "metric";

      // Update any active enhancements with new setting
      if (_activeFeatures.length > 0) {
        const featuresToReenhance = [..._activeFeatures];
        _cleanupExistingEnhancements();

        if (featuresToReenhance.length === 1) {
          this.enhanceFeature(featuresToReenhance[0]);
        } else {
          this.enhanceFeatures(featuresToReenhance);
        }
      }

      console.log(`Units toggled to ${_displayUnits}`);
      return _displayUnits;
    },

    /**
     * Set node marker size
     * @param {number} size - Size in pixels
     */
    setNodeSize: function (size) {
      _nodeSize = size;

      // Update existing node layers with new size
      _enhancementLayers.forEach((layerId) => {
        if (layerId.includes("-nodes") && _map.getLayer(layerId)) {
          _map.setPaintProperty(layerId, "circle-radius", _nodeSize);
        }
      });
    },

    /**
     * Clear all feature enhancements
     */
    clearEnhancements: function () {
      _cleanupExistingEnhancements();
      _activeFeatures = [];
    },

    /**
     * Set whether to show distance labels
     * @param {boolean} show - Whether to show distance labels
     */
    setShowDistances: function (show) {
      _showDistances = !!show;

      // Re-enhance features with new setting
      if (_activeFeatures.length > 0) {
        const featuresToReenhance = [..._activeFeatures];
        _cleanupExistingEnhancements();

        if (featuresToReenhance.length === 1) {
          this.enhanceFeature(featuresToReenhance[0]);
        } else {
          this.enhanceFeatures(featuresToReenhance);
        }
      }
    },

    /**
     * Set whether to show area labels
     * @param {boolean} show - Whether to show area labels
     */
    setShowAreas: function (show) {
      _showAreas = !!show;

      // Re-enhance features with new setting
      if (_activeFeatures.length > 0) {
        const featuresToReenhance = [..._activeFeatures];
        _cleanupExistingEnhancements();

        if (featuresToReenhance.length === 1) {
          this.enhanceFeature(featuresToReenhance[0]);
        } else {
          this.enhanceFeatures(featuresToReenhance);
        }
      }
    },

    /**
     * Enhance a selected feature with node markers, distance labels and area
     * @param {Object} feature - GeoJSON feature
     */
    enhanceFeature: function (feature) {
      if (!_map || !_initialized) {
        console.error("FeatureEnhancer not properly initialized");
        return;
      }

      // Make sure Turf.js is available
      if (!_activeTurfLibraries) {
        _ensureTurfLibraries()
          .then(() => {
            this.enhanceFeature(feature);
          })
          .catch((error) => {
            console.error(
              "Failed to load Turf.js, cannot enhance feature",
              error
            );
          });
        return;
      }

      // Clean up existing enhancements first
      _cleanupExistingEnhancements();

      try {
        // Ensure we have a valid feature with geometry
        if (!feature || !feature.geometry) {
          console.error("Cannot enhance feature: Invalid or missing geometry");
          return;
        }

        // Log feature type and coordinates sample for debugging
        console.log("Enhancing feature:", feature.geometry.type);
        if (
          feature.geometry.coordinates &&
          feature.geometry.coordinates.length > 0
        ) {
          if (typeof feature.geometry.coordinates[0] === "number") {
            console.log(
              "First coordinate:",
              JSON.stringify(feature.geometry.coordinates)
            );
          } else {
            console.log(
              "First coordinate:",
              JSON.stringify(feature.geometry.coordinates[0])
            );
          }
        }

        // Create a clean copy of the feature to avoid reference issues
        const cleanFeature = {
          type: "Feature",
          geometry: {
            type: feature.geometry.type,
            coordinates: JSON.parse(
              JSON.stringify(feature.geometry.coordinates)
            ),
          },
          properties: feature.properties ? { ...feature.properties } : {},
        };

        // Add ID if present
        if (feature.id) cleanFeature.id = feature.id;

        // Create a unique ID based on feature
        const featureId =
          cleanFeature.id ||
          cleanFeature.properties?.id ||
          (cleanFeature.geometry
            ? `${cleanFeature.geometry.type}-${Date.now()}`
            : `unknown-${Date.now()}`);

        console.log(`Enhancing feature with ID: ${featureId}`);

        // Store this feature
        _activeFeatures = [cleanFeature];

        // Generate unique source IDs for this feature
        const nodeSourceId = `nodes-${featureId}`;
        const distanceSourceId = `distances-${featureId}`;
        const areaSourceId = `areas-${featureId}`;

        // Add node markers
        _addNodeMarkers(cleanFeature, nodeSourceId);

        // Add distance labels
        _addDistanceLabels(cleanFeature, distanceSourceId);

        // Add area labels
        _addAreaLabels(cleanFeature, areaSourceId);

        // Add debug labels to help diagnose any visibility issues
        _addDebugLabels(cleanFeature);

        // Log map layer info for debugging
        setTimeout(() => {
          const style = _map.getStyle();
          console.log(`Map has ${style.layers.length} layers`);

          // Log the status of our enhancement layers
          _enhancementLayers.forEach((layerId) => {
            const isVisible =
              _map.getLayoutProperty(layerId, "visibility") !== "none";
            console.log(
              `Layer ${layerId} - exists: ${
                _map.getLayer(layerId) ? "YES" : "NO"
              }, visible: ${isVisible ? "YES" : "NO"}`
            );
          });

          // Check if any of our sources have features
          _enhancementSources.forEach((sourceId) => {
            if (_map.getSource(sourceId)) {
              const features = _map.querySourceFeatures(sourceId);
              console.log(`Source ${sourceId} has ${features.length} features`);
            }
          });
        }, 200);

        console.log("Feature enhancement completed successfully");
      } catch (error) {
        console.error("Error enhancing feature:", error);
      }
    },

    /**
     * Enhance multiple features
     * @param {Array} features - Array of GeoJSON features
     */
    enhanceFeatures: function (features) {
      if (!_map || !_initialized) {
        console.error("FeatureEnhancer not properly initialized");
        return;
      }

      // Make sure Turf.js is available
      if (!_activeTurfLibraries) {
        _ensureTurfLibraries()
          .then(() => {
            this.enhanceFeatures(features);
          })
          .catch((error) => {
            console.error(
              "Failed to load Turf.js, cannot enhance features",
              error
            );
          });
        return;
      }

      // Clean up existing enhancements first
      _cleanupExistingEnhancements();

      try {
        // Store all features
        _activeFeatures = features.map((f) => ({ ...f }));

        // Process each feature
        features.forEach((feature, index) => {
          // Create a unique ID based on feature and index
          const featureId =
            (feature.id ||
              feature.properties?.id ||
              (feature.geometry
                ? `${feature.geometry.type}-${index}`
                : `unknown-${index}`)) + `-${Date.now()}`;

          // Generate unique source IDs for this feature
          const nodeSourceId = `nodes-${featureId}`;
          const distanceSourceId = `distances-${featureId}`;
          const areaSourceId = `areas-${featureId}`;

          // Add node markers
          _addNodeMarkers(feature, nodeSourceId);

          // Add distance labels
          _addDistanceLabels(feature, distanceSourceId);

          // Add area labels
          _addAreaLabels(feature, areaSourceId);
        });

        console.log(`Enhanced ${features.length} features successfully`);
      } catch (error) {
        console.error("Error enhancing multiple features:", error);
      }
    },

    /**
     * Utility function to verify visibility status
     */
    debugLayers: function () {
      if (!_map) return "Map not initialized";

      const report = [];
      report.push(`Active features: ${_activeFeatures.length}`);
      report.push(`Enhancement layers: ${_enhancementLayers.length}`);
      report.push(`Enhancement sources: ${_enhancementSources.length}`);

      _enhancementLayers.forEach((layerId) => {
        if (_map.getLayer(layerId)) {
          const visibility =
            _map.getLayoutProperty(layerId, "visibility") !== "none"
              ? "visible"
              : "hidden";
          const type = _map.getLayer(layerId).type;
          report.push(`Layer ${layerId}: ${type}, ${visibility}`);
        } else {
          report.push(`Layer ${layerId}: not found`);
        }
      });

      return report.join("\n");
    },
  };
})();

// Initialize when the map is ready
if (App.Core && App.Core.Events) {
  App.Core.Events.on("map.ready", function (data) {
    if (data && data.map) {
      App.Map.FeatureEnhancer.initialize(data.map);
      console.log("FeatureEnhancer initialized on map.ready event");
    }
  });
}

console.log("App.Map.FeatureEnhancer module loaded");
