/**
 * Feature Snapping System for Geolantis360
 *
 * Provides functionality to snap to the nearest point on map features,
 * supporting both GeoJSON features and vector tile features.
 */

class FeatureSnapper {
  /**
   * Creates a new FeatureSnapper instance
   * @param {Object} map - The MapLibre GL map instance
   * @param {Object} options - Configuration options
   */
  constructor(map, options = {}) {
    this.map = map;
    this.options = Object.assign(
      {
        // Default snap radius in pixels
        snapRadiusPixels: 20,
        // Optional layer filter function to determine which layers to consider for snapping
        layerFilter: null,
        // If a vector feature is found, whether to also search for GeoJSON features
        prioritizeVectorFeatures: false,
        // Whether to show visual indicator when snapping
        showSnapIndicator: true,
        // Display different colors for different snap types
        snapPointColor: "#04D9FF", // bright cyan for points
        snapLineColor: "#FFD904", // bright yellow for lines
        snapPolygonColor: "#FF04D9", // bright magenta for polygons
        snapIndicatorSize: 12,
        // Whether the snapper is active (enabled)
        active: true,
        // Callback function when a feature is snapped to
        onSnap: null,
        // Callback function when a feature is selected
        onSelect: null,
        // Debug mode
        debug: false,
      },
      options
    );

    // State
    this.snappedFeature = null;
    this.snappedPoint = null;
    this.snapIndicatorVisible = false;

    // Create marker for snap indicator (if enabled)
    if (this.options.showSnapIndicator) {
      this.createSnapIndicator();
    }

    // Bind event handlers
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleClick = this._handleClick.bind(this);

    // Attach events if active
    if (this.options.active) {
      this.enable();
    }

    this.log("FeatureSnapper initialized with options:", this.options);
  }

  /**
   * Log message if debug mode is enabled
   */
  log(...args) {
    if (this.options.debug || window.debugSnapper) {
      console.log("[FeatureSnapper]", ...args);
    }
  }

  /**
   * Log error message
   */
  logError(...args) {
    console.error("[FeatureSnapper]", ...args);
  }

  /**
   * Creates a visual indicator for snap points
   */
  createSnapIndicator() {
    // Create a container for the snap indicator
    const el = document.createElement("div");
    el.className = "snap-indicator";
    el.style.width = `${this.options.snapIndicatorSize}px`;
    el.style.height = `${this.options.snapIndicatorSize}px`;
    el.style.borderRadius = "50%";
    el.style.border = "2px solid white";
    el.style.backgroundColor = this.options.snapPointColor;
    el.style.opacity = "0";
    el.style.pointerEvents = "none"; // Make sure it doesn't interfere with clicking
    el.style.transition = "opacity 0.2s ease-in-out";

    // Create the marker and add to map (hidden initially)
    // FIX: Use the map center as initial position to avoid undefined errors
    try {
      const initialPosition = this.map.getCenter();
      this.snapIndicator = new maplibregl.Marker({
        element: el,
        anchor: "center",
      });

      // Add to map only if we have a valid position
      if (
        initialPosition &&
        initialPosition.lng !== undefined &&
        initialPosition.lat !== undefined
      ) {
        this.snapIndicator.setLngLat(initialPosition).addTo(this.map);
      }

      this.snapIndicatorEl = el;
    } catch (err) {
      this.logError("Error creating snap indicator:", err);
      // Create without adding to map, we'll add it later when needed
      this.snapIndicator = new maplibregl.Marker({
        element: el,
        anchor: "center",
      });
      this.snapIndicatorEl = el;
    }
  }

  /**
   * Updates the snap indicator appearance based on the feature type
   * @param {string} featureType - The type of feature (point, line, polygon)
   */
  updateSnapIndicatorStyle(featureType) {
    if (!this.snapIndicatorEl) return;

    let color;
    switch (featureType) {
      case "Point":
        color = this.options.snapPointColor;
        break;
      case "LineString":
      case "MultiLineString":
        color = this.options.snapLineColor;
        break;
      case "Polygon":
      case "MultiPolygon":
        color = this.options.snapPolygonColor;
        break;
      default:
        color = this.options.snapPointColor;
    }

    this.snapIndicatorEl.style.backgroundColor = color;
  }

  /**
   * Shows the snap indicator at the given coordinates
   * @param {Array|Object} lngLat - The coordinates [longitude, latitude] or {lng, lat}
   * @param {string} featureType - The type of feature being snapped to
   */
  showSnapIndicator(lngLat, featureType) {
    if (!this.options.showSnapIndicator || !this.snapIndicator) return;

    // Check for valid coordinates
    if (!lngLat) {
      this.log("Invalid coordinates for snap indicator:", lngLat);
      return;
    }

    try {
      this.updateSnapIndicatorStyle(featureType);

      // Ensure the indicator is added to the map if it wasn't before
      if (!this.snapIndicator._map) {
        this.snapIndicator.addTo(this.map);
      }

      this.snapIndicator.setLngLat(lngLat);
      this.snapIndicatorEl.style.opacity = "1";
      this.snapIndicatorVisible = true;
    } catch (err) {
      this.logError("Error showing snap indicator:", err);
    }
  }

  /**
   * Hides the snap indicator
   */
  hideSnapIndicator() {
    if (!this.options.showSnapIndicator || !this.snapIndicator) return;

    try {
      this.snapIndicatorEl.style.opacity = "0";
      this.snapIndicatorVisible = false;
    } catch (err) {
      this.logError("Error hiding snap indicator:", err);
    }
  }

  /**
   * Enables the feature snapper
   */
  enable() {
    if (this.options.active) return;

    this.options.active = true;
    this.map.on("mousemove", this._handleMouseMove);
    this.map.on("click", this._handleClick);

    this.log("FeatureSnapper enabled");
  }

  /**
   * Disables the feature snapper
   */
  disable() {
    if (!this.options.active) return;

    this.options.active = false;
    this.map.off("mousemove", this._handleMouseMove);
    this.map.off("click", this._handleClick);
    this.hideSnapIndicator();

    this.log("FeatureSnapper disabled");
  }

  /**
   * Handles the mousemove event - finds features to snap to
   * @param {Object} e - The mousemove event
   */
  _handleMouseMove(e) {
    if (!this.options.active) return;

    // Find features to snap to
    const snapResult = this.findSnappableFeature(e.point);

    if (snapResult) {
      // Found a feature to snap to
      this.snappedFeature = snapResult.feature;
      this.snappedPoint = snapResult.point;
      this.map.getCanvas().style.cursor = "pointer";

      // Show the snap indicator
      this.showSnapIndicator(snapResult.point, snapResult.geometryType);

      // Call onSnap callback if provided
      if (typeof this.options.onSnap === "function") {
        this.options.onSnap(snapResult);
      }
    } else {
      // No feature to snap to
      this.snappedFeature = null;
      this.snappedPoint = null;
      this.map.getCanvas().style.cursor = "";
      this.hideSnapIndicator();
    }
  }

  /**
   * Handles click events - selects the snapped feature
   * @param {Object} e - The click event
   */
  _handleClick(e) {
    if (!this.options.active || !this.snappedFeature) return;

    // Call onSelect callback if provided
    if (typeof this.options.onSelect === "function") {
      this.options.onSelect({
        feature: this.snappedFeature,
        point: this.snappedPoint,
        originalEvent: e,
      });
    }
  }

  /**
   * Find the nearest snappable feature to the given point
   * @param {Object} point - The point {x, y} in pixel coordinates
   * @returns {Object|null} The snap result or null if no feature found
   */
  findSnappableFeature(point) {
    // First check vector tile features if prioritized
    let snapResult = null;

    if (this.options.prioritizeVectorFeatures) {
      snapResult = this.findNearestVectorFeature(point);
      if (snapResult) return snapResult;
    }

    // Then check GeoJSON features
    snapResult = this.findNearestGeoJSONFeature(point);
    if (snapResult) return snapResult;

    // If vector features were not prioritized, check them now
    if (!this.options.prioritizeVectorFeatures) {
      snapResult = this.findNearestVectorFeature(point);
      if (snapResult) return snapResult;
    }

    return null;
  }

  /**
   * Find the nearest vector tile feature to snap to
   * @param {Object} point - The point {x, y} in pixel coordinates
   * @returns {Object|null} The snap result or null if no feature found
   */
  findNearestVectorFeature(point) {
    try {
      // Query features around the point
      const boxSize = this.options.snapRadiusPixels;
      const bbox = [
        point.x - boxSize,
        point.y - boxSize,
        point.x + boxSize,
        point.y + boxSize,
      ];

      // Get all layers in the map
      const layers = this.map.getStyle().layers;
      if (!layers || !Array.isArray(layers)) {
        this.log("No map layers found for snapping");
        return null;
      }

      // Filter to vector layers
      const vectorLayers = layers
        .filter((layer) => {
          // Filter out raster, background, and other non-geometric layers
          const validTypes = ["fill", "line", "circle", "symbol"];
          const isValidType = validTypes.includes(layer.type);

          // Apply custom layer filter if provided
          const passesFilter =
            !this.options.layerFilter || this.options.layerFilter(layer);

          return isValidType && passesFilter;
        })
        .map((layer) => layer.id);

      if (vectorLayers.length === 0) return null;

      // Query vector features
      const features = this.map.queryRenderedFeatures(bbox, {
        layers: vectorLayers,
      });

      if (features.length === 0) return null;

      // Find the closest feature
      let closestFeature = null;
      let closestDistance = Infinity;
      let closestPoint = null;
      let geometryType = null;

      features.forEach((feature) => {
        let nearestPoint;
        let distance;

        // Skip features with no geometry
        if (!feature.geometry) return;

        // Handle different geometry types
        if (feature.geometry.type === "Point") {
          // For points, snap directly to the point
          try {
            // Validate coordinates
            if (!this.isValidCoordinate(feature.geometry.coordinates)) {
              return;
            }

            const featurePoint = this.map.project(feature.geometry.coordinates);
            distance = Math.sqrt(
              Math.pow(featurePoint.x - point.x, 2) +
                Math.pow(featurePoint.y - point.y, 2)
            );

            nearestPoint = feature.geometry.coordinates;
          } catch (err) {
            this.log("Error processing point feature:", err);
            return;
          }
        } else if (
          feature.geometry.type === "LineString" ||
          feature.geometry.type === "MultiLineString"
        ) {
          // For lines, find the nearest point on the line
          const result = this.findNearestPointOnLine(point, feature);
          if (result) {
            distance = result.distance;
            nearestPoint = result.point;
          }
        } else if (
          feature.geometry.type === "Polygon" ||
          feature.geometry.type === "MultiPolygon"
        ) {
          // For polygons, find the nearest point on the boundary
          const result = this.findNearestPointOnPolygon(point, feature);
          if (result) {
            distance = result.distance;
            nearestPoint = result.point;
          }
        }

        // Update closest feature if this one is closer
        if (
          distance !== undefined &&
          distance < closestDistance &&
          distance <= this.options.snapRadiusPixels
        ) {
          closestFeature = feature;
          closestDistance = distance;
          closestPoint = nearestPoint;
          geometryType = feature.geometry.type;
        }
      });

      if (closestFeature) {
        return {
          feature: closestFeature,
          point: closestPoint,
          distance: closestDistance,
          geometryType: geometryType,
          isVectorFeature: true,
        };
      }
    } catch (err) {
      this.logError("Error finding nearest vector feature:", err);
    }

    return null;
  }

  /**
   * Checks if a coordinate is valid
   * @param {Array|Object} coord - The coordinate to check
   * @returns {boolean} - Whether the coordinate is valid
   */
  isValidCoordinate(coord) {
    // Check if it's an array with at least 2 elements
    if (Array.isArray(coord) && coord.length >= 2) {
      return !isNaN(coord[0]) && !isNaN(coord[1]);
    }

    // Check if it's an object with lng and lat properties
    if (coord && typeof coord === "object") {
      if (coord.lng !== undefined && coord.lat !== undefined) {
        return !isNaN(coord.lng) && !isNaN(coord.lat);
      }
      if (coord.lon !== undefined && coord.lat !== undefined) {
        return !isNaN(coord.lon) && !isNaN(coord.lat);
      }
    }

    return false;
  }

  /**
   * Find the nearest GeoJSON feature to snap to
   * @param {Object} point - The point {x, y} in pixel coordinates
   * @returns {Object|null} The snap result or null if no feature found
   */
  findNearestGeoJSONFeature(point) {
    try {
      // Get all sources from the map
      const sources = this.map.getStyle().sources;
      if (!sources) {
        return null;
      }

      // Filter to GeoJSON sources
      const geojsonSources = Object.keys(sources).filter((sourceId) => {
        return sources[sourceId].type === "geojson";
      });

      if (geojsonSources.length === 0) return null;

      // Find layers that use GeoJSON sources
      const layers = this.map.getStyle().layers;
      if (!layers || !Array.isArray(layers)) return null;

      const geojsonLayers = layers
        .filter((layer) => {
          return (
            geojsonSources.includes(layer.source) &&
            (!this.options.layerFilter || this.options.layerFilter(layer))
          );
        })
        .map((layer) => layer.id);

      if (geojsonLayers.length === 0) return null;

      // Query GeoJSON features
      const boxSize = this.options.snapRadiusPixels;
      const bbox = [
        point.x - boxSize,
        point.y - boxSize,
        point.x + boxSize,
        point.y + boxSize,
      ];

      const features = this.map.queryRenderedFeatures(bbox, {
        layers: geojsonLayers,
      });

      if (features.length === 0) return null;

      // Find the closest feature
      let closestFeature = null;
      let closestDistance = Infinity;
      let closestPoint = null;
      let geometryType = null;

      features.forEach((feature) => {
        let nearestPoint;
        let distance;

        // Skip features with no geometry
        if (!feature.geometry) return;

        // Handle different geometry types
        if (feature.geometry.type === "Point") {
          // For points, snap directly to the point
          try {
            // Validate coordinates
            if (!this.isValidCoordinate(feature.geometry.coordinates)) {
              return;
            }

            const featurePoint = this.map.project(feature.geometry.coordinates);
            distance = Math.sqrt(
              Math.pow(featurePoint.x - point.x, 2) +
                Math.pow(featurePoint.y - point.y, 2)
            );

            nearestPoint = feature.geometry.coordinates;
          } catch (err) {
            this.log("Error processing point feature:", err);
            return;
          }
        } else if (
          feature.geometry.type === "LineString" ||
          feature.geometry.type === "MultiLineString"
        ) {
          // For lines, find the nearest point on the line
          const result = this.findNearestPointOnLine(point, feature);
          if (result) {
            distance = result.distance;
            nearestPoint = result.point;
          }
        } else if (
          feature.geometry.type === "Polygon" ||
          feature.geometry.type === "MultiPolygon"
        ) {
          // For polygons, find the nearest point on the boundary
          const result = this.findNearestPointOnPolygon(point, feature);
          if (result) {
            distance = result.distance;
            nearestPoint = result.point;
          }
        }

        // Update closest feature if this one is closer
        if (
          distance !== undefined &&
          distance < closestDistance &&
          distance <= this.options.snapRadiusPixels
        ) {
          closestFeature = feature;
          closestDistance = distance;
          closestPoint = nearestPoint;
          geometryType = feature.geometry.type;
        }
      });

      if (closestFeature) {
        return {
          feature: closestFeature,
          point: closestPoint,
          distance: closestDistance,
          geometryType: geometryType,
          isVectorFeature: false,
        };
      }
    } catch (err) {
      this.logError("Error finding nearest GeoJSON feature:", err);
    }

    return null;
  }

  /**
   * Find the nearest point on a line feature
   * @param {Object} point - The point {x, y} in pixel coordinates
   * @param {Object} feature - The line feature
   * @returns {Object|null} The nearest point result or null
   */
  findNearestPointOnLine(point, feature) {
    try {
      const coordinates = feature.geometry.coordinates;
      if (!coordinates) return null;

      // Handle both LineString and MultiLineString
      let lines = coordinates;
      if (feature.geometry.type === "MultiLineString") {
        lines = coordinates;
      } else {
        lines = [coordinates];
      }

      let closestDistance = Infinity;
      let closestPoint = null;

      // Check each line segment of each line
      lines.forEach((line) => {
        for (let i = 0; i < line.length - 1; i++) {
          // Skip invalid coordinates
          if (
            !this.isValidCoordinate(line[i]) ||
            !this.isValidCoordinate(line[i + 1])
          ) {
            continue;
          }

          try {
            const start = this.map.project(line[i]);
            const end = this.map.project(line[i + 1]);

            // Find the nearest point on this segment
            const nearestResult = this.nearestPointOnSegment(point, start, end);

            if (nearestResult.distance < closestDistance) {
              closestDistance = nearestResult.distance;

              // Convert pixel coordinates back to geographic coordinates
              closestPoint = this.map.unproject(nearestResult.point);
            }
          } catch (err) {
            this.log("Error calculating nearest point on line segment:", err);
            continue;
          }
        }
      });

      if (closestPoint) {
        return {
          point: closestPoint,
          distance: closestDistance,
        };
      }
    } catch (err) {
      this.logError("Error finding nearest point on line:", err);
    }

    return null;
  }

  /**
   * Find the nearest point on a polygon feature
   * @param {Object} point - The point {x, y} in pixel coordinates
   * @param {Object} feature - The polygon feature
   * @returns {Object|null} The nearest point result or null
   */
  findNearestPointOnPolygon(point, feature) {
    try {
      const coordinates = feature.geometry.coordinates;
      if (!coordinates) return null;

      // Handle both Polygon and MultiPolygon
      let polygons = coordinates;
      if (feature.geometry.type === "MultiPolygon") {
        // Flatten the array of polygons
        polygons = coordinates.reduce((acc, poly) => acc.concat(poly), []);
      }

      let closestDistance = Infinity;
      let closestPoint = null;

      // Check each ring of each polygon
      polygons.forEach((polygon) => {
        // Skip empty polygons
        if (!polygon || !Array.isArray(polygon) || polygon.length === 0) {
          this.log("Skipping empty polygon");
          return;
        }

        // Polygon outer ring
        const ring = polygon[0]; // Outer ring is always the first
        if (!ring) return;

        // For each segment of the ring
        for (let i = 0; i < ring.length - 1; i++) {
          // Skip invalid coordinates
          if (
            !this.isValidCoordinate(ring[i]) ||
            !this.isValidCoordinate(ring[i + 1])
          ) {
            this.log(
              "Skipping invalid ring coordinates:",
              ring[i],
              ring[i + 1]
            );
            continue;
          }

          try {
            const start = this.map.project(ring[i]);
            const end = this.map.project(ring[i + 1]);

            // Find the nearest point on this segment
            const nearestResult = this.nearestPointOnSegment(point, start, end);

            if (nearestResult.distance < closestDistance) {
              closestDistance = nearestResult.distance;

              // Convert pixel coordinates back to geographic coordinates
              closestPoint = this.map.unproject(nearestResult.point);
            }
          } catch (err) {
            this.log(
              "Error calculating nearest point on polygon segment:",
              err
            );
            continue;
          }
        }
      });

      if (closestPoint) {
        return {
          point: closestPoint,
          distance: closestDistance,
        };
      }
    } catch (err) {
      this.logError("Error finding nearest point on polygon:", err);
    }

    return null;
  }

  /**
   * Find the nearest point on a line segment
   * @param {Object} p - The point {x, y}
   * @param {Object} v - The start point of the segment {x, y}
   * @param {Object} w - The end point of the segment {x, y}
   * @returns {Object} The nearest point result
   */
  nearestPointOnSegment(p, v, w) {
    // Adapted from https://stackoverflow.com/a/1501725
    const lengthSquared = Math.pow(w.x - v.x, 2) + Math.pow(w.y - v.y, 2);

    // If segment is effectively a point, return distance to the point
    if (lengthSquared === 0) {
      return {
        point: v,
        distance: Math.sqrt(Math.pow(p.x - v.x, 2) + Math.pow(p.y - v.y, 2)),
      };
    }

    // Calculate projection of point onto line
    const t = Math.max(
      0,
      Math.min(
        1,
        ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / lengthSquared
      )
    );

    // Calculate the nearest point on the line
    const nearestPoint = {
      x: v.x + t * (w.x - v.x),
      y: v.y + t * (w.y - v.y),
    };

    // Calculate distance to the nearest point
    const distance = Math.sqrt(
      Math.pow(p.x - nearestPoint.x, 2) + Math.pow(p.y - nearestPoint.y, 2)
    );

    return {
      point: nearestPoint,
      distance: distance,
    };
  }

  /**
   * Highlights a selected feature
   * @param {Object} feature - The feature to highlight
   */
  highlightFeature(feature) {
    if (!feature) return;

    try {
      // Remove any existing highlight
      this.removeHighlight();

      // Generate a unique layer ID for the highlight
      const highlightId = `highlight-${Date.now()}`;

      // Add the feature as a GeoJSON source
      this.map.addSource(highlightId, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [feature],
        },
      });

      // Add appropriate layer based on geometry type
      if (feature.geometry.type === "Point") {
        // Add point highlight
        this.map.addLayer({
          id: highlightId,
          source: highlightId,
          type: "circle",
          paint: {
            "circle-radius": 10,
            "circle-color": this.options.snapPointColor,
            "circle-opacity": 0.5,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
      } else if (
        feature.geometry.type === "LineString" ||
        feature.geometry.type === "MultiLineString"
      ) {
        // Add line highlight
        this.map.addLayer({
          id: highlightId,
          source: highlightId,
          type: "line",
          paint: {
            "line-width": 6,
            "line-color": this.options.snapLineColor,
            "line-opacity": 0.8,
          },
        });
      } else if (
        feature.geometry.type === "Polygon" ||
        feature.geometry.type === "MultiPolygon"
      ) {
        // Add polygon fill highlight
        this.map.addLayer({
          id: `${highlightId}-fill`,
          source: highlightId,
          type: "fill",
          paint: {
            "fill-color": this.options.snapPolygonColor,
            "fill-opacity": 0.3,
          },
        });

        // Add polygon outline highlight
        this.map.addLayer({
          id: `${highlightId}-line`,
          source: highlightId,
          type: "line",
          paint: {
            "line-width": 4,
            "line-color": this.options.snapPolygonColor,
            "line-opacity": 0.8,
          },
        });
      }

      // Store the highlight ID for later removal
      this.highlightId = highlightId;
    } catch (err) {
      this.logError("Error highlighting feature:", err);
    }
  }

  /**
   * Removes any existing feature highlight
   */
  removeHighlight() {
    if (!this.highlightId) return;

    try {
      // Check for polygon highlights (which have two layers)
      if (this.map.getLayer(`${this.highlightId}-fill`)) {
        this.map.removeLayer(`${this.highlightId}-fill`);
      }

      if (this.map.getLayer(`${this.highlightId}-line`)) {
        this.map.removeLayer(`${this.highlightId}-line`);
      }

      // Check for the main highlight layer
      if (this.map.getLayer(this.highlightId)) {
        this.map.removeLayer(this.highlightId);
      }

      // Remove the source
      if (this.map.getSource(this.highlightId)) {
        this.map.removeSource(this.highlightId);
      }

      this.highlightId = null;
    } catch (err) {
      this.logError("Error removing highlight:", err);
    }
  }
}
