// Add this to your bridgeInterfaceML.js file

/**
 * Adds functionality to load and display DXF files on the map
 */
BridgeInterface.prototype.initDXFSupport = function () {
  // Ensure required libraries are available
  if (!window.DxfParser) {
    console.error(
      "DxfParser library is not loaded. Please include the library in your HTML."
    );
    return;
  }

  // Add DXF file input to the UI
  this.addDXFControls();
};

/**
 * Add UI controls for DXF file handling
 */
BridgeInterface.prototype.addDXFControls = function () {
  // Create container for DXF controls
  const dxfControlsContainer = document.createElement("div");
  dxfControlsContainer.id = "dxf-controls";
  dxfControlsContainer.className = "maplibregl-ctrl maplibregl-ctrl-group";
  dxfControlsContainer.style.position = "absolute";
  dxfControlsContainer.style.top = "10px";
  dxfControlsContainer.style.left = "50%";
  dxfControlsContainer.style.transform = "translateX(-50%)";
  dxfControlsContainer.style.zIndex = "1000";
  dxfControlsContainer.style.display = "flex";
  dxfControlsContainer.style.flexDirection = "column";
  dxfControlsContainer.style.gap = "5px";
  dxfControlsContainer.style.padding = "10px";
  dxfControlsContainer.style.backgroundColor = "white";
  dxfControlsContainer.style.borderRadius = "4px";
  dxfControlsContainer.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";

  // Create the file input
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "dxf-file-input";
  fileInput.accept = ".dxf";
  fileInput.style.display = "none";

  // Create the button to trigger file selection
  const fileButton = document.createElement("button");
  fileButton.id = "dxf-file-button";
  fileButton.innerHTML = "Load DXF File";
  fileButton.className = "dxf-control-button";
  fileButton.onclick = () => fileInput.click();

  // Create options for DXF rendering
  const optionsContainer = document.createElement("div");
  optionsContainer.style.display = "none";
  optionsContainer.id = "dxf-options";

  // Create coordinate system selector
  const coordSystemLabel = document.createElement("label");
  coordSystemLabel.innerHTML = "Coordinate System:";
  coordSystemLabel.htmlFor = "dxf-coord-system";

  const coordSystemSelect = document.createElement("select");
  coordSystemSelect.id = "dxf-coord-system";

  // Add common coordinate systems
  const coordSystems = [
    { value: "none", label: "No Transformation (Raw DXF Coordinates)" },
    { value: "EPSG:4326", label: "WGS84 (EPSG:4326)" },
    { value: "EPSG:3857", label: "Web Mercator (EPSG:3857)" },
    { value: "EPSG:25832", label: "ETRS89 / UTM zone 32N (EPSG:25832)" },
    { value: "EPSG:32633", label: "WGS 84 / UTM zone 33N (EPSG:32633)" },
    // Add more as needed
  ];

  coordSystems.forEach((cs) => {
    const option = document.createElement("option");
    option.value = cs.value;
    option.text = cs.label;
    coordSystemSelect.appendChild(option);
  });

  // Create transformation coordinates input
  const originLabel = document.createElement("label");
  originLabel.innerHTML = "Map Coordinates (Longitude, Latitude):";
  originLabel.htmlFor = "dxf-map-coords";

  const originInput = document.createElement("input");
  originInput.type = "text";
  originInput.id = "dxf-map-coords";
  originInput.placeholder = "e.g., 14.22, 46.62";

  // Create apply button
  const applyButton = document.createElement("button");
  applyButton.id = "dxf-apply-button";
  applyButton.innerHTML = "Apply & Show DXF";
  applyButton.className = "dxf-control-button";

  // Create clear button
  const clearButton = document.createElement("button");
  clearButton.id = "dxf-clear-button";
  clearButton.innerHTML = "Clear DXF Layers";
  clearButton.className = "dxf-control-button";

  // Add elements to the options container
  optionsContainer.appendChild(coordSystemLabel);
  optionsContainer.appendChild(coordSystemSelect);
  optionsContainer.appendChild(originLabel);
  optionsContainer.appendChild(originInput);
  optionsContainer.appendChild(applyButton);
  optionsContainer.appendChild(clearButton);

  // Add all elements to the main container
  dxfControlsContainer.appendChild(fileButton);
  dxfControlsContainer.appendChild(fileInput);
  dxfControlsContainer.appendChild(optionsContainer);

  // Add the container to the map
  document.getElementById("map").appendChild(dxfControlsContainer);

  // Store references to elements
  this.dxfFileInput = fileInput;
  this.dxfOptionsContainer = optionsContainer;
  this.dxfCoordSystemSelect = coordSystemSelect;
  this.dxfMapCoordsInput = originInput;

  // Bind event handlers
  this._bindDXFEventHandlers();
};

/**
 * Bind event handlers for DXF controls
 */
BridgeInterface.prototype._bindDXFEventHandlers = function () {
  // Handle file selection
  this.dxfFileInput.addEventListener("change", (e) => {
    if (e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Store the file for later use
    this.dxfFile = file;

    // Show options after file selection
    this.dxfOptionsContainer.style.display = "flex";
    this.dxfOptionsContainer.style.flexDirection = "column";
    this.dxfOptionsContainer.style.gap = "5px";

    // Set default map coordinates to current center
    const center = this.map.getCenter();
    this.dxfMapCoordsInput.value = `${center.lng.toFixed(
      6
    )}, ${center.lat.toFixed(6)}`;
  });

  // Handle apply button click
  document.getElementById("dxf-apply-button").addEventListener("click", () => {
    this.loadAndDisplayDXF();
  });

  // Handle clear button click
  document.getElementById("dxf-clear-button").addEventListener("click", () => {
    this.clearDXFLayers();
  });
};

/**
 * Load and display the DXF file on the map
 */
BridgeInterface.prototype.loadAndDisplayDXF = function () {
  if (!this.dxfFile) {
    console.error("No DXF file selected");
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      // Parse the DXF file
      const parser = new DxfParser();
      const dxfData = parser.parseSync(e.target.result);

      // Convert DXF to GeoJSON
      const geoJson = this.convertDXFToGeoJSON(dxfData);

      // Apply coordinate transformation if needed
      const transformedGeoJson = this.transformGeoJSON(geoJson);

      // Display the transformed GeoJSON on the map
      this.displayGeoJSONOnMap(transformedGeoJson);

      console.log("DXF file loaded and displayed successfully");
    } catch (error) {
      console.error("Error processing DXF file:", error);
    }
  };

  reader.onerror = (error) => {
    console.error("Error reading DXF file:", error);
  };

  reader.readAsText(this.dxfFile);
};

/**
 * Convert DXF data to GeoJSON format
 * @param {Object} dxfData - Parsed DXF data
 * @returns {Object} GeoJSON FeatureCollection
 */
BridgeInterface.prototype.convertDXFToGeoJSON = function (dxfData) {
  const features = [];

  // Process each entity in the DXF
  for (const entityName in dxfData.entities) {
    const entity = dxfData.entities[entityName];

    // Skip unsupported entity types
    if (!entity || !entity.type) continue;

    let feature = null;

    switch (entity.type) {
      case "LINE":
        feature = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [entity.vertices[0].x, entity.vertices[0].y],
              [entity.vertices[1].x, entity.vertices[1].y],
            ],
          },
          properties: {
            type: "LINE",
            layer: entity.layer || "default",
            color: this._getColorFromEntity(entity),
          },
        };
        break;

      case "LWPOLYLINE":
      case "POLYLINE":
        const coordinates = entity.vertices.map((v) => [v.x, v.y]);

        // Check if the polyline is closed
        if (entity.shape && entity.shape.closed) {
          // Make sure the first and last coordinates match for a closed polygon
          if (
            coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
            coordinates[0][1] !== coordinates[coordinates.length - 1][1]
          ) {
            coordinates.push(coordinates[0]);
          }

          feature = {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [coordinates],
            },
            properties: {
              type: "POLYGON",
              layer: entity.layer || "default",
              color: this._getColorFromEntity(entity),
            },
          };
        } else {
          feature = {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: coordinates,
            },
            properties: {
              type: "POLYLINE",
              layer: entity.layer || "default",
              color: this._getColorFromEntity(entity),
            },
          };
        }
        break;

      case "CIRCLE":
        // Convert circle to polygon with points
        const circle = turf.circle(
          [entity.center.x, entity.center.y],
          entity.radius,
          { steps: 64, units: "meters" }
        );

        feature = {
          type: "Feature",
          geometry: circle.geometry,
          properties: {
            type: "CIRCLE",
            radius: entity.radius,
            layer: entity.layer || "default",
            color: this._getColorFromEntity(entity),
          },
        };
        break;

      case "TEXT":
        feature = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [entity.position.x, entity.position.y],
          },
          properties: {
            type: "TEXT",
            text: entity.text,
            height: entity.height,
            angle: entity.rotation,
            layer: entity.layer || "default",
            color: this._getColorFromEntity(entity),
          },
        };
        break;

      case "POINT":
        feature = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [entity.position.x, entity.position.y],
          },
          properties: {
            type: "POINT",
            layer: entity.layer || "default",
            color: this._getColorFromEntity(entity),
          },
        };
        break;

      // Add more entity types as needed

      default:
        console.log(`Unsupported DXF entity type: ${entity.type}`);
        continue;
    }

    if (feature) {
      features.push(feature);
    }
  }

  return {
    type: "FeatureCollection",
    features: features,
  };
};

/**
 * Get color from DXF entity
 * @param {Object} entity - DXF entity
 * @returns {string} Hex color code
 */
BridgeInterface.prototype._getColorFromEntity = function (entity) {
  // Default color if no color information is available
  return "#0000FF";
};

/**
 * Transform GeoJSON coordinates based on selected coordinate system
 * @param {Object} geoJson - GeoJSON object
 * @returns {Object} Transformed GeoJSON
 */
BridgeInterface.prototype.transformGeoJSON = function (geoJson) {
  const coordSystem = this.dxfCoordSystemSelect.value;
  const mapCoordsStr = this.dxfMapCoordsInput.value;

  // If no transformation is needed
  if (coordSystem === "none") {
    return geoJson;
  }

  try {
    // Parse map coordinates (longitude, latitude)
    const [mapLng, mapLat] = mapCoordsStr
      .split(",")
      .map((coord) => parseFloat(coord.trim()));

    if (isNaN(mapLng) || isNaN(mapLat)) {
      console.error("Invalid map coordinates");
      return geoJson;
    }

    // Create a deep copy of the GeoJSON
    const transformedGeoJson = JSON.parse(JSON.stringify(geoJson));

    // Calculate the centroid of the DXF data
    const centroid = this._calculateCentroid(geoJson);

    // Process each feature
    transformedGeoJson.features.forEach((feature) => {
      this._transformFeatureCoordinates(
        feature,
        centroid,
        [mapLng, mapLat],
        coordSystem
      );
    });

    return transformedGeoJson;
  } catch (error) {
    console.error("Error transforming GeoJSON:", error);
    return geoJson;
  }
};

/**
 * Calculate the centroid of a GeoJSON
 * @param {Object} geoJson - GeoJSON object
 * @returns {Array} [x, y] centroid coordinates
 */
BridgeInterface.prototype._calculateCentroid = function (geoJson) {
  // Use turf.js if available
  if (window.turf && window.turf.center) {
    const center = turf.center(geoJson);
    return center.geometry.coordinates;
  }

  // Manual calculation
  let totalX = 0;
  let totalY = 0;
  let count = 0;

  geoJson.features.forEach((feature) => {
    if (feature.geometry.type === "Point") {
      totalX += feature.geometry.coordinates[0];
      totalY += feature.geometry.coordinates[1];
      count++;
    } else if (
      feature.geometry.type === "LineString" ||
      feature.geometry.type === "MultiPoint"
    ) {
      feature.geometry.coordinates.forEach((coord) => {
        totalX += coord[0];
        totalY += coord[1];
        count++;
      });
    } else if (
      feature.geometry.type === "Polygon" ||
      feature.geometry.type === "MultiLineString"
    ) {
      feature.geometry.coordinates.forEach((ring) => {
        ring.forEach((coord) => {
          totalX += coord[0];
          totalY += coord[1];
          count++;
        });
      });
    } else if (feature.geometry.type === "MultiPolygon") {
      feature.geometry.coordinates.forEach((polygon) => {
        polygon.forEach((ring) => {
          ring.forEach((coord) => {
            totalX += coord[0];
            totalY += coord[1];
            count++;
          });
        });
      });
    }
  });

  return count > 0 ? [totalX / count, totalY / count] : [0, 0];
};

/**
 * Transform feature coordinates
 * @param {Object} feature - GeoJSON feature
 * @param {Array} centroid - [x, y] centroid coordinates
 * @param {Array} mapCoords - [lng, lat] map coordinates
 * @param {string} coordSystem - Target coordinate system
 */
BridgeInterface.prototype._transformFeatureCoordinates = function (
  feature,
  centroid,
  mapCoords,
  coordSystem
) {
  // Transform all coordinate arrays
  const transformCoords = (coords) => {
    if (Array.isArray(coords[0]) && !Array.isArray(coords[0][0])) {
      // LineString or ring of a Polygon
      const newCoords = coords.map((coord) => {
        // Calculate offset from centroid
        const dx = coord[0] - centroid[0];
        const dy = coord[1] - centroid[1];

        // Apply scaling factor based on coordinate system
        // For simplicity, we're using a fixed scale factor
        // In a real app, you might want to calculate this based on the coordinate system
        const scaleFactor = 0.00001; // This should be adjusted based on your data scale

        // Calculate new coordinates relative to map coordinates
        return [
          mapCoords[0] + dx * scaleFactor,
          mapCoords[1] + dy * scaleFactor,
        ];
      });

      return newCoords;
    } else if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
      // Polygon or MultiLineString
      return coords.map((ring) => transformCoords(ring));
    } else if (Array.isArray(coords[0][0]) && Array.isArray(coords[0][0][0])) {
      // MultiPolygon
      return coords.map((polygon) =>
        polygon.map((ring) => transformCoords(ring))
      );
    } else {
      // Point
      const dx = coords[0] - centroid[0];
      const dy = coords[1] - centroid[1];
      const scaleFactor = 0.00001;

      return [mapCoords[0] + dx * scaleFactor, mapCoords[1] + dy * scaleFactor];
    }
  };

  // Process the feature based on its geometry type
  if (feature.geometry.type === "Point") {
    feature.geometry.coordinates = transformCoords(
      feature.geometry.coordinates
    );
  } else {
    feature.geometry.coordinates = transformCoords(
      feature.geometry.coordinates
    );
  }
};

/**
 * Display GeoJSON on the map
 * @param {Object} geoJson - GeoJSON object
 */
BridgeInterface.prototype.displayGeoJSONOnMap = function (geoJson) {
  // Clear previous DXF layers
  this.clearDXFLayers();

  // Store the layers we create for later removal
  this.dxfLayers = [];

  // Create a unique ID for the DXF source
  const dxfSourceId = "dxf-source-" + Date.now();

  // Add the GeoJSON source
  this.map.addSource(dxfSourceId, {
    type: "geojson",
    data: geoJson,
  });

  // Add layers for different geometry types
  this._addDXFLayers(dxfSourceId, geoJson);

  // Zoom to the bounds of the GeoJSON
  this.zoomToDXFBounds(geoJson);
};

/**
 * Add layers for different geometry types in the DXF
 * @param {string} sourceId - Source ID
 * @param {Object} geoJson - GeoJSON object
 */
BridgeInterface.prototype._addDXFLayers = function (sourceId, geoJson) {
  // Group features by type and layer
  const featuresByType = {};

  geoJson.features.forEach((feature) => {
    const type = feature.properties.type || "UNKNOWN";
    const layer = feature.properties.layer || "default";
    const key = `${type}_${layer}`;

    if (!featuresByType[key]) {
      featuresByType[key] = [];
    }

    featuresByType[key].push(feature);
  });

  // Add layers for each feature type
  for (const key in featuresByType) {
    const [type, layer] = key.split("_");
    const layerId = `dxf-${type.toLowerCase()}-${layer}-${Date.now()}`;

    // Determine layer type and style based on the feature type
    switch (type) {
      case "POINT":
        this.map.addLayer({
          id: layerId,
          type: "circle",
          source: sourceId,
          filter: [
            "all",
            ["==", ["get", "type"], "POINT"],
            ["==", ["get", "layer"], layer],
          ],
          paint: {
            "circle-radius": 5,
            "circle-color": "#FF0000",
            "circle-stroke-width": 1,
            "circle-stroke-color": "#FFFFFF",
          },
        });
        break;

      case "LINE":
      case "POLYLINE":
        this.map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          filter: [
            "any",
            ["==", ["get", "type"], "LINE"],
            ["==", ["get", "type"], "POLYLINE"],
          ],
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": ["get", "color"],
            "line-width": 2,
          },
        });
        break;

      case "POLYGON":
      case "CIRCLE":
        // Add fill layer
        this.map.addLayer({
          id: layerId + "-fill",
          type: "fill",
          source: sourceId,
          filter: [
            "any",
            ["==", ["get", "type"], "POLYGON"],
            ["==", ["get", "type"], "CIRCLE"],
          ],
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": 0.5,
          },
        });

        // Add outline layer
        this.map.addLayer({
          id: layerId + "-outline",
          type: "line",
          source: sourceId,
          filter: [
            "any",
            ["==", ["get", "type"], "POLYGON"],
            ["==", ["get", "type"], "CIRCLE"],
          ],
          paint: {
            "line-color": ["get", "color"],
            "line-width": 1,
          },
        });

        this.dxfLayers.push(layerId + "-fill");
        this.dxfLayers.push(layerId + "-outline");
        break;

      case "TEXT":
        this.map.addLayer({
          id: layerId,
          type: "symbol",
          source: sourceId,
          filter: ["==", ["get", "type"], "TEXT"],
          layout: {
            "text-field": ["get", "text"],
            "text-font": ["Open Sans Regular"],
            "text-size": ["*", ["get", "height"], 2],
            "text-rotate": ["get", "angle"],
            "text-anchor": "center",
          },
          paint: {
            "text-color": ["get", "color"],
          },
        });
        break;

      default:
        console.log(`Skipping unsupported DXF entity type: ${type}`);
        continue;
    }

    this.dxfLayers.push(layerId);
  }
};

/**
 * Zoom to the bounds of the DXF data
 * @param {Object} geoJson - GeoJSON object
 */
BridgeInterface.prototype.zoomToDXFBounds = function (geoJson) {
  if (!geoJson || !geoJson.features || geoJson.features.length === 0) {
    return;
  }

  try {
    // Use turf.js if available
    if (window.turf && window.turf.bbox) {
      const bbox = turf.bbox(geoJson);
      this.map.fitBounds(
        [
          [bbox[0], bbox[1]], // Southwest corner
          [bbox[2], bbox[3]], // Northeast corner
        ],
        {
          padding: 50,
        }
      );
      return;
    }

    // Manual calculation
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const processCoords = (coords) => {
      if (Array.isArray(coords[0]) && !Array.isArray(coords[0][0])) {
        // LineString or ring of a Polygon
        coords.forEach((coord) => {
          minX = Math.min(minX, coord[0]);
          minY = Math.min(minY, coord[1]);
          maxX = Math.max(maxX, coord[0]);
          maxY = Math.max(maxY, coord[1]);
        });
      } else if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
        // Polygon or MultiLineString
        coords.forEach((ring) => processCoords(ring));
      } else if (
        Array.isArray(coords[0][0]) &&
        Array.isArray(coords[0][0][0])
      ) {
        // MultiPolygon
        coords.forEach((polygon) =>
          polygon.forEach((ring) => processCoords(ring))
        );
      } else {
        // Point
        minX = Math.min(minX, coords[0]);
        minY = Math.min(minY, coords[1]);
        maxX = Math.max(maxX, coords[0]);
        maxY = Math.max(maxY, coords[1]);
      }
    };

    geoJson.features.forEach((feature) => {
      processCoords(feature.geometry.coordinates);
    });

    this.map.fitBounds(
      [
        [minX, minY], // Southwest corner
        [maxX, maxY], // Northeast corner
      ],
      {
        padding: 50,
      }
    );
  } catch (error) {
    console.error("Error zooming to DXF bounds:", error);
  }
};

/**
 * Clear all DXF layers from the map
 */
BridgeInterface.prototype.clearDXFLayers = function () {
  if (this.dxfLayers && this.dxfLayers.length > 0) {
    this.dxfLayers.forEach((layerId) => {
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
    });

    // Clear sources
    const sourcesToRemove = [];
    const style = this.map.getStyle();

    // Find all DXF sources
    for (const sourceId in style.sources) {
      if (sourceId.startsWith("dxf-source-")) {
        sourcesToRemove.push(sourceId);
      }
    }

    // Remove the sources
    sourcesToRemove.forEach((sourceId) => {
      if (this.map.getSource(sourceId)) {
        this.map.removeSource(sourceId);
      }
    });

    this.dxfLayers = [];
  }

  // Reset file input
  if (this.dxfFileInput) {
    this.dxfFileInput.value = "";
  }

  // Hide options
  if (this.dxfOptionsContainer) {
    this.dxfOptionsContainer.style.display = "none";
  }

  // Clear stored file
  this.dxfFile = null;
};

// Initialize DXF support in the map load event
this.map.on("load", () => {
  // ... existing code ...

  // Initialize DXF support
  this.initDXFSupport();

  // ... rest of your code ...
});
