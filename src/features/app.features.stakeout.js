/**
 * StakeOut feature functionality
 * @namespace App.Features.StakeOut
 */
App.Features = App.Features || {};
App.Features.StakeOut = (function () {
  // Private variables
  var _map = null;
  var _ui = null;
  var _targetLng = 0;
  var _targetLat = 0;
  var _currentLng = 0;
  var _currentLat = 0;
  var _guideLineCreated = false;
  var _circleLayersCreated = false;
  var _labelMarkers = [];
  var _distanceMarker = null;
  var _outlineWidthPx = 2.0;
  var _activeOutlineWidthPx = 4.0;
  var _inactiveColor = [0.3, 0.3, 0.3, 1.0];
  var _smallCircleThreshold = 0.1;
  var _zoomUpdateTimeout = null;
  var _isUpdatingCircles = false;
  var _updateTimeout = null;
  var _createdCircles = new Set();
  var _eventsRegistered = false;
  var _visibleCircles = [];
  var _stakeOutActive = false;
  var _gnssHooksSetup = false;
  
  // Navigation mode variables
  var _navigationMode = "segments"; // "segments", "nodes", or "lines"
  var _currentFeature = null;
  var _extractedVertices = [];
  var _vertexMarkers = [];
  var _currentVertexIndex = -1; // Track selected vertex in nodes mode

  // Performance tracking
  var _positionUpdated = false;
  var _uiNeedsUpdate = false;
  var _lastUIUpdate = 0;
  var _positionUpdateInterval = null;
  var _uiUpdateInterval = null;

  // Update rate constants (in milliseconds)
  var _UI_REFRESH_RATE = 100; // 10Hz for smoother updates
  var _POSITION_UPDATE_RATE = 100; // 10Hz

  // Define circle sizes and colors
  var _circles = [
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
  
  // Get color based on current theme
  function _getThemedColor(originalColor, isActive) {
    if (!isActive) {
      return "rgb(77, 77, 77)"; // Inactive color
    }
    
    // Check if we have a steelblue theme active
    var isThemedMode = document.body.classList.contains('color-theme-steelblue');
    
    if (isThemedMode) {
      // Use steelblue color for all active circles
      return "rgb(70, 130, 180)"; // Steelblue
    }
    
    // Use original color scheme
    var colorRgb = originalColor.map(function (c) {
      return Math.round(c * 255);
    });
    return "rgb(" + colorRgb[0] + ", " + colorRgb[1] + ", " + colorRgb[2] + ")";
  }

  // Private methods
  
  /**
   * Extract vertices from a geometry
   * @param {Object} geometry - GeoJSON geometry object
   * @returns {Array} Array of coordinate arrays [lng, lat]
   */
  function _extractVertices(geometry) {
    var vertices = [];
    
    switch (geometry.type) {
      case "Point":
        vertices.push(geometry.coordinates);
        break;
        
      case "LineString":
        vertices = geometry.coordinates.slice();
        break;
        
      case "Polygon":
        // For polygons, extract vertices from all rings
        geometry.coordinates.forEach(function(ring) {
          // Skip the last coordinate if it's the same as the first (closed ring)
          var coords = ring.slice();
          if (coords.length > 1 && 
              coords[0][0] === coords[coords.length - 1][0] && 
              coords[0][1] === coords[coords.length - 1][1]) {
            coords.pop();
          }
          vertices = vertices.concat(coords);
        });
        break;
        
      case "MultiPoint":
        vertices = geometry.coordinates.slice();
        break;
        
      case "MultiLineString":
        geometry.coordinates.forEach(function(lineString) {
          vertices = vertices.concat(lineString);
        });
        break;
        
      case "MultiPolygon":
        geometry.coordinates.forEach(function(polygon) {
          polygon.forEach(function(ring) {
            var coords = ring.slice();
            if (coords.length > 1 && 
                coords[0][0] === coords[coords.length - 1][0] && 
                coords[0][1] === coords[coords.length - 1][1]) {
              coords.pop();
            }
            vertices = vertices.concat(coords);
          });
        });
        break;
    }
    
    // Remove duplicates
    var uniqueVertices = [];
    var seen = new Set();
    vertices.forEach(function(vertex) {
      var key = vertex[0] + "," + vertex[1];
      if (!seen.has(key)) {
        seen.add(key);
        uniqueVertices.push(vertex);
      }
    });
    
    return uniqueVertices;
  }
  
  /**
   * Find the nearest vertex to a given location
   * @param {Array} vertices - Array of vertex coordinates
   * @param {Array} location - [lng, lat] of current location
   * @param {boolean} updateIndex - Whether to update _currentVertexIndex
   * @returns {Array|null} Nearest vertex coordinates or null
   */
  function _findNearestVertex(vertices, location, updateIndex) {
    if (!vertices || vertices.length === 0) {
      console.error("[StakeOut] No vertices available for node navigation");
      return null;
    }
    
    console.log(`[StakeOut] Finding nearest vertex from ${vertices.length} vertices`);
    
    var nearestVertex = null;
    var nearestIndex = -1;
    var minDistance = Infinity;
    
    vertices.forEach(function(vertex, index) {
      var distance = turf.distance(
        turf.point(location),
        turf.point(vertex),
        { units: "meters" }
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestVertex = vertex;
        nearestIndex = index;
        console.log(`[StakeOut] New nearest vertex: index ${index}, distance: ${distance.toFixed(2)}m`);
      }
    });
    
    // Only update the current index if requested (initial selection)
    if (updateIndex && nearestIndex !== -1) {
      _currentVertexIndex = nearestIndex;
    }
    
    console.log(`[StakeOut] Selected vertex at distance: ${minDistance.toFixed(2)}m`);
    return nearestVertex;
  }
  
  /**
   * Create or update vertex markers for visualization
   * @param {Array} vertices - Array of vertex coordinates
   */
  function _createOrUpdateVertexMarkers(vertices) {
    // Remove existing markers
    _removeVertexMarkers();
    
    if (_navigationMode !== "nodes" || !vertices || vertices.length === 0) {
      return;
    }
    
    // Create markers for each vertex
    vertices.forEach(function(vertex, index) {
      // Create container that will be the MapLibre marker element
      var container = document.createElement("div");
      container.className = "vertex-marker-container";
      container.style.width = "0";
      container.style.height = "0";
      container.style.position = "relative";
      
      // Create clickable area
      var clickArea = document.createElement("div");
      clickArea.style.position = "absolute";
      clickArea.style.width = "30px";
      clickArea.style.height = "30px";
      clickArea.style.left = "-15px";
      clickArea.style.top = "-15px";
      clickArea.style.cursor = "pointer";
      
      // Create white background circle
      var bgCircle = document.createElement("div");
      bgCircle.style.position = "absolute";
      bgCircle.style.width = "30px";
      bgCircle.style.height = "30px";
      bgCircle.style.left = "-15px";
      bgCircle.style.top = "-15px";
      bgCircle.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
      bgCircle.style.borderRadius = "50%";
      bgCircle.style.transition = "all 0.3s ease";
      bgCircle.style.pointerEvents = "none";
      
      // Create the main vertex marker
      var el = document.createElement("div");
      el.className = "vertex-marker";
      el.style.position = "absolute";
      el.style.width = "12px";
      el.style.height = "12px";
      el.style.left = "-6px";
      el.style.top = "-6px";
      el.style.backgroundColor = "rgba(70, 130, 180, 0.9)";
      el.style.border = "2px solid white";
      el.style.borderRadius = "50%";
      el.style.boxShadow = "0 0 4px rgba(0, 0, 0, 0.5)";
      el.style.pointerEvents = "none";
      
      // Hide marker for currently selected vertex
      if (vertex[0] === _targetLng && vertex[1] === _targetLat) {
        // Hide the visual elements for selected vertex
        bgCircle.style.display = "none";
        el.style.display = "none";
      }
      
      // Add hover effect with color animation
      clickArea.addEventListener("mouseenter", function() {
        if (!window.matchMedia("(hover: none)").matches) { // Only on devices with hover
          bgCircle.style.width = "35px";
          bgCircle.style.height = "35px";
          bgCircle.style.left = "-17.5px";
          bgCircle.style.top = "-17.5px";
          bgCircle.style.backgroundColor = "rgba(70, 130, 180, 0.4)";
          
          // Animate background color
          var hue = 0;
          var colorInterval = setInterval(function() {
            hue = (hue + 2) % 360;
            bgCircle.style.backgroundColor = "hsla(" + hue + ", 70%, 60%, 0.4)";
          }, 50);
          
          clickArea.colorInterval = colorInterval;
        }
      });
      
      clickArea.addEventListener("mouseleave", function() {
        if (clickArea.colorInterval) {
          clearInterval(clickArea.colorInterval);
          clickArea.colorInterval = null;
        }
        
        bgCircle.style.width = "30px";
        bgCircle.style.height = "30px";
        bgCircle.style.left = "-15px";
        bgCircle.style.top = "-15px";
        
        // Reset to appropriate color
        if (vertex[0] === _targetLng && vertex[1] === _targetLat) {
          bgCircle.style.backgroundColor = "rgba(255, 69, 0, 0.2)";
        } else {
          bgCircle.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
        }
      });
      
      // Add elements to container
      container.appendChild(bgCircle);
      container.appendChild(el);
      container.appendChild(clickArea);
      
      // Add click handler to select this vertex
      clickArea.addEventListener("click", (function(vertexIndex, vertexCoords) {
        return function() {
          console.log(`[StakeOut] Vertex ${vertexIndex} clicked at [${vertexCoords[0]}, ${vertexCoords[1]}]`);
          
          // Update current vertex index
          _currentVertexIndex = vertexIndex;
          
          // Update target to this vertex
          _targetLng = vertexCoords[0];
          _targetLat = vertexCoords[1];
          
          // Update circles to new position
          _createOrUpdateMapLibreCircles();
          _createOrUpdateHTMLLabels(_targetLng, _targetLat);
          
          // Update guide line
          if (_currentLng && _currentLat && _guideLineCreated) {
            _createOrUpdateGuideLine([_currentLng, _currentLat], [_targetLng, _targetLat]);
          }
          
          // Update all vertex markers to show new selection
          _createOrUpdateVertexMarkers(vertices);
          
          // Force immediate UI update
          _positionUpdated = true;
          _uiNeedsUpdate = true;
          _updateUI();
          
          // Also trigger an immediate position update
          _updatePositions();
          
          // Update node info in UI
          if (_ui && _ui.updateNodeInfo) {
            _ui.updateNodeInfo(_currentVertexIndex, vertices.length);
          }
        };
      })(index, vertex.slice()));
      
      var marker = new maplibregl.Marker({ 
        element: container
      })
        .setLngLat(vertex)
        .addTo(_map);
      
      _vertexMarkers.push(marker);
    });
  }
  
  /**
   * Remove all vertex markers
   */
  function _removeVertexMarkers() {
    _vertexMarkers.forEach(function(marker) {
      marker.remove();
    });
    _vertexMarkers = [];
  }

  // Check if current location is within a circle's radius
  function _isWithinCircle(circleRadius) {
    try {
      var targetPoint = [_targetLng, _targetLat];
      var currentPoint = [_currentLng, _currentLat];

      // Calculate distance between current location and target in meters
      var distance = turf.distance(
        turf.point(targetPoint),
        turf.point(currentPoint),
        { units: "meters" }
      );

      // Return true if current location is within circle radius
      return distance <= circleRadius;
    } catch (e) {
      console.error("Error checking if within circle:", e);
      return false;
    }
  }

  // Calculate screen radius based on real-world distance
  function _calculateScreenRadius(radiusInMeters) {
    try {
      var center = [_targetLng, _targetLat];
      var bearingDegrees = 90;
      var radiusInKm = radiusInMeters / 1000;
      var earthRadiusKm = 6378.137;

      var latRad = (_targetLat * Math.PI) / 180;
      var lngRad = (_targetLng * Math.PI) / 180;
      var bearingRad = (bearingDegrees * Math.PI) / 180;

      var distRatio = radiusInKm / earthRadiusKm;
      var destLatRad = Math.asin(
        Math.sin(latRad) * Math.cos(distRatio) +
          Math.cos(latRad) * Math.sin(distRatio) * Math.cos(bearingRad)
      );
      var destLngRad =
        lngRad +
        Math.atan2(
          Math.sin(bearingRad) * Math.sin(distRatio) * Math.cos(latRad),
          Math.cos(distRatio) - Math.sin(latRad) * Math.sin(destLatRad)
        );

      var destLat = (destLatRad * 180) / Math.PI;
      var destLng = (destLngRad * 180) / Math.PI;

      var centerPx = _map.project(center);
      var pointPx = _map.project([destLng, destLat]);

      var pixelRadius = Math.sqrt(
        Math.pow(pointPx.x - centerPx.x, 2) +
          Math.pow(pointPx.y - centerPx.y, 2)
      );

      // For deep zoom and small distances, ensure minimum visibility
      var zoom = _map.getZoom();
      var minSize = 0;

      if (pixelRadius < 1 && radiusInMeters < 0.1) {
        return _calculatePixelRadius(radiusInMeters, _targetLat);
      }

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
      var zoom = _map.getZoom();
      var zoomFactor = Math.pow(2, zoom - 19);
      var scaleFactor = 0.000075 * zoomFactor;
      var minSize = 2;
      if (radiusInMeters <= 0.01) minSize = 4;
      else if (radiusInMeters <= 0.05) minSize = 3;
      return Math.max(radiusInMeters * scaleFactor * 10000, minSize);
    }
  }

  function _calculatePixelRadius(meterRadius, latitude) {
    var zoom = _map.getZoom();
    var pixelRatio = window.devicePixelRatio || 1;
    var metersPerPixel =
      (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom);
    return (meterRadius / metersPerPixel) * pixelRatio;
  }

  // Create or update MapLibre circles
  function _createOrUpdateMapLibreCircles() {
    _visibleCircles.forEach(function (circle, i) {
      var layerId = "maplibre-circle-" + i;
      var isActive = circle.isActive || _isWithinCircle(circle.radius);
      var strokeColor = _getThemedColor(circle.color, isActive);
      var strokeWidth = isActive ? _activeOutlineWidthPx : _outlineWidthPx;

      var screenRadius = _calculateScreenRadius(circle.radius) / 2;

      if (_map.getLayer(layerId)) {
        _map.setPaintProperty(layerId, "circle-radius", screenRadius);
        _map.setPaintProperty(layerId, "circle-stroke-width", strokeWidth);
        _map.setPaintProperty(layerId, "circle-stroke-color", strokeColor);

        if (_map.getSource(layerId)) {
          _map.getSource(layerId).setData({
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: [_targetLng, _targetLat],
            },
          });
        }

        _map.setLayoutProperty(layerId, "visibility", "visible");
        _createdCircles.add(layerId);
      } else {
        _map.addSource(layerId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: [_targetLng, _targetLat],
            },
          },
        });

        _map.addLayer({
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

        _createdCircles.add(layerId);
      }

      circle.isActive = isActive;
    });

    // Hide any previously created circles that are no longer visible
    var visibleIds = _visibleCircles.map(function (_, i) {
      return "maplibre-circle-" + i;
    });
    _createdCircles.forEach(function (layerId) {
      if (!visibleIds.includes(layerId) && _map.getLayer(layerId)) {
        _map.setLayoutProperty(layerId, "visibility", "none");
      }
    });
  }

  // Update visible circles based on zoom level
  function _updateVisibleCirclesByZoom() {
    var zoom = _map.getZoom();

    if (zoom >= 26) {
      _visibleCircles = _circles;
    } else if (zoom >= 23) {
      _visibleCircles = _circles.filter(function (circle) {
        return [2.0, 1.0, 0.5, 0.3, 0.1, 0.05].includes(circle.radius);
      });
    } else if (zoom >= 22) {
      _visibleCircles = _circles.filter(function (circle) {
        return [2.0, 1.0, 0.5, 0.3, 0.1].includes(circle.radius);
      });
    } else if (zoom >= 20) {
      _visibleCircles = _circles.filter(function (circle) {
        return [2.0, 1.0, 0.5].includes(circle.radius);
      });
    } else if (zoom >= 17) {
      _visibleCircles = _circles.filter(function (circle) {
        return [2.0, 1.0].includes(circle.radius);
      });
    } else {
      _visibleCircles = [];
    }
  }

  // Create or update HTML labels for the circles
  function _createOrUpdateHTMLLabels(lng, lat) {
    var existingMarkersByRadius = {};
    if (_labelMarkers && _labelMarkers.length > 0) {
      _labelMarkers.forEach(function (marker) {
        if (marker.radius) {
          existingMarkersByRadius[marker.radius] = marker;
        }
      });
    }

    var updatedMarkers = [];

    _visibleCircles.forEach(function (circle) {
      var labelPoint = turf.destination([lng, lat], circle.radius, 90, {
        units: "meters",
      });

      if (existingMarkersByRadius[circle.radius]) {
        existingMarkersByRadius[circle.radius].setLngLat(
          labelPoint.geometry.coordinates
        );
        updatedMarkers.push(existingMarkersByRadius[circle.radius]);
      } else {
        var el = document.createElement("div");
        el.className = "circle-label";
        el.style.color = "white";
        el.style.textShadow =
          "0px 0px 5px rgba(0, 0, 0, 0.8), 0px 0px 3px rgba(0, 0, 0, 0.5)";
        el.style.fontSize = "12px";
        el.style.fontWeight = "bold";
        el.style.pointerEvents = "none";
        el.textContent = circle.label;

        var marker = new maplibregl.Marker({ element: el, anchor: "left" })
          .setLngLat(labelPoint.geometry.coordinates)
          .addTo(_map);

        marker.radius = circle.radius;
        updatedMarkers.push(marker);
      }
    });

    // Remove any markers that are no longer needed
    var visibleRadii = _visibleCircles.map(function (c) {
      return c.radius;
    });
    if (_labelMarkers && _labelMarkers.length > 0) {
      _labelMarkers.forEach(function (marker) {
        if (marker.radius && !visibleRadii.includes(marker.radius)) {
          marker.remove();
        }
      });
    }

    _labelMarkers = updatedMarkers;
  }

  // Create or update guide line between two points
  function _createOrUpdateGuideLine(currentLocation, targetLocation) {
    try {
      var distance = turf.distance(
        turf.point(currentLocation),
        turf.point(targetLocation),
        { units: "meters" }
      );

      var distanceText;
      if (distance >= 1000) {
        distanceText = (distance / 1000).toFixed(2) + " km";
      } else if (distance >= 1) {
        distanceText = distance.toFixed(2) + " m";
      } else {
        distanceText = (distance * 100).toFixed(1) + " cm";
      }

      var lineStringData = {
        type: "Feature",
        properties: {
          QL: distanceText,
        },
        geometry: {
          type: "LineString",
          coordinates: [currentLocation, targetLocation],
        },
      };

      if (_map.getSource("guide-line")) {
        _map.getSource("guide-line").setData(lineStringData);
        // Force map to re-render
        _map.triggerRepaint();
      } else {
        _map.addSource("guide-line", {
          type: "geojson",
          data: lineStringData,
        });

        _map.addLayer({
          id: "guide-line",
          type: "line",
          source: "guide-line",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#4682b4",
            "line-width": 3,
            "line-dasharray": [2, 2],
          },
        });

        _map.addLayer({
          id: "guide-text",
          type: "symbol",
          source: "guide-line",
          layout: {
            "text-font": ["Roboto-Regular"],
            "text-field": "{QL}",
            "symbol-placement": "line",
            "symbol-spacing": 250,
            "text-size": 17,
            "text-line-height": 2,
            "text-padding": 0,
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            visibility: "visible",
            "icon-pitch-alignment": "auto",
            "text-pitch-alignment": "auto",
            "text-rotation-alignment": "auto",
            "icon-rotation-alignment": "auto",
          },
          paint: {
            "text-halo-color": "rgba(245, 245, 245, 1)",
            "text-halo-width": 2.4,
            "text-translate-anchor": "map",
            "text-color": "#4682b4",
            "text-halo-blur": 1,
          },
        });

        _guideLineCreated = true;
      }

      _distanceMarker = { remove: function () {} };
      return distance;
    } catch (error) {
      console.error("Error updating guide line:", error);
      return 0;
    }
  }

  // Position update function - only updates data, no UI changes
  function _updatePositions() {
    try {
      // Get current GNSS position if available
      if (App.Map && App.Map.Navigation && typeof App.Map.Navigation.getGnssLocation === 'function') {
        var gnssLocation = App.Map.Navigation.getGnssLocation();
        if (gnssLocation && gnssLocation.length === 2 && !isNaN(gnssLocation[0]) && !isNaN(gnssLocation[1])) {
          _currentLng = gnssLocation[0];
          _currentLat = gnssLocation[1];
        }
      }
      
      // Recalculate nearest point based on navigation mode
      if (_currentFeature && _currentLng && _currentLat) {
        var module = App.Features.StakeOut;
        var nearestCoords;
        
        if (_navigationMode === "nodes") {
          // For nodes mode, only update if no vertex is selected
          // This prevents overriding user's manual vertex selection
          if (_currentVertexIndex === -1 || !_targetLng || !_targetLat) {
            console.log(`[StakeOut] Finding initial vertex in nodes mode, vertices: ${_extractedVertices.length}`);
            nearestCoords = _findNearestVertex(_extractedVertices, [_currentLng, _currentLat], true);
          } else {
            // Keep current selected vertex - use the vertex from the array to ensure consistency
            if (_currentVertexIndex >= 0 && _currentVertexIndex < _extractedVertices.length) {
              nearestCoords = _extractedVertices[_currentVertexIndex];
            } else {
              nearestCoords = [_targetLng, _targetLat];
            }
          }
        } else if (_navigationMode === "lines") {
          // For lines mode, find nearest point on lines
          nearestCoords = module.findNearestPointOnLines(_currentFeature, [_currentLng, _currentLat]);
        } else {
          // For segments mode, find nearest point on segments
          nearestCoords = module.findNearestPoint(_currentFeature, [_currentLng, _currentLat]);
        }
        
        if (nearestCoords) {
          if (nearestCoords[0] !== _targetLng || nearestCoords[1] !== _targetLat) {
            console.log(`[StakeOut] Target updated from [${_targetLng}, ${_targetLat}] to [${nearestCoords[0]}, ${nearestCoords[1]}]`);
            // Target has moved, update it
            _targetLng = nearestCoords[0];
            _targetLat = nearestCoords[1];
            
            // Update circles to new target position
            _createOrUpdateMapLibreCircles();
            _createOrUpdateHTMLLabels(_targetLng, _targetLat);
          }
        } else {
          console.error(`[StakeOut] No nearest coordinates found in ${_navigationMode} mode`);
        }
      }
      
      _visibleCircles.forEach(function (circle) {
        circle.isActive = _isWithinCircle(circle.radius);
      });

      _positionUpdated = true;
      _uiNeedsUpdate = true;
    } catch (error) {
      console.error("[StakeOut] Error in _updatePositions:", error);
    }
  }

  // UI update function - handle all visual changes at a controlled rate
  function _updateUI() {
    try {
      if (!_uiNeedsUpdate) return;
      
      console.log("[StakeOut] _updateUI called");

      _lastUIUpdate = Date.now();

      // Update circle visuals and positions if needed
      if (_positionUpdated) {
        // Update circles to follow target position
        _createOrUpdateMapLibreCircles();
        // Update labels to follow target position
        if (_targetLng && _targetLat) {
          _createOrUpdateHTMLLabels(_targetLng, _targetLat);
        }
      } else {
        // Just update the active states
        _updateMapLibreCircleStates();
      }

      // Update guide line
      if (
        _guideLineCreated &&
        _currentLng &&
        _currentLat &&
        _targetLng &&
        _targetLat
      ) {
        _createOrUpdateGuideLine(
          [_currentLng, _currentLat],
          [_targetLng, _targetLat]
        );
      }

      // Update UI indicators
      if (_currentLng && _currentLat && _targetLng && _targetLat && _ui) {
        var distance = turf.distance(
          turf.point([_currentLng, _currentLat]),
          turf.point([_targetLng, _targetLat]),
          { units: "meters" }
        );

        console.log(`[StakeOut] Calling UI update with distance: ${distance}`);
        _ui.displayDirectionalArrows(
          [_currentLng, _currentLat],
          [_targetLng, _targetLat],
          distance
        );
      } else {
        console.log(`[StakeOut] Missing data for UI update - current: ${_currentLng}, ${_currentLat}, target: ${_targetLng}, ${_targetLat}, ui: ${!!_ui}`);
      }

      _uiNeedsUpdate = false;
      _positionUpdated = false;
    } catch (error) {
      console.error("[StakeOut] Error in _updateUI:", error);
    }
  }

  // Update active/inactive states of MapLibre circles
  function _updateMapLibreCircleStates() {
    _visibleCircles.forEach(function (circle, i) {
      var layerId = "maplibre-circle-" + i;
      if (_map.getLayer(layerId)) {
        var isActive =
          circle.isActive !== undefined
            ? circle.isActive
            : _isWithinCircle(circle.radius);
        var strokeColor = _getThemedColor(circle.color, isActive);
        var strokeWidth = isActive ? _activeOutlineWidthPx : _outlineWidthPx;

        _map.setPaintProperty(layerId, "circle-stroke-color", strokeColor);
        _map.setPaintProperty(layerId, "circle-stroke-width", strokeWidth);

        circle.isActive = isActive;
      }
    });
  }

  // Start update cycles
  function _startUpdateCycles() {
    _stopUpdateCycles();

    console.log("[StakeOut] Starting update cycles");
    _positionUpdateInterval = setInterval(
      _updatePositions,
      _POSITION_UPDATE_RATE
    );
    _uiUpdateInterval = setInterval(_updateUI, _UI_REFRESH_RATE);
    
    // Do immediate updates
    _updatePositions();
    _updateUI();
  }

  // Stop update cycles
  function _stopUpdateCycles() {
    if (_positionUpdateInterval) {
      clearInterval(_positionUpdateInterval);
      _positionUpdateInterval = null;
    }

    if (_uiUpdateInterval) {
      clearInterval(_uiUpdateInterval);
      _uiUpdateInterval = null;
    }
  }

  // Public API
  return {
    /**
     * Initialize the StakeOut feature
     * @param {Object} map - The MapLibre map instance
     */
    initialize: function (map) {
      _map = map;
      
      // Only create UI if it doesn't exist
      if (!_ui) {
        // Check if StakeOutUICompact exists, otherwise fall back to original
        if (typeof StakeOutUICompact !== "undefined") {
          _ui = new StakeOutUICompact();
        } else {
          _ui = new StakeOutUI();
        }
      }

      // Bind event handlers
      this.handleZoom = this.handleZoom.bind(this);
      this.handleZoomStart = this.handleZoomStart.bind(this);
      this.handleZoomEnd = this.handleZoomEnd.bind(this);
      this.debounceUpdate = this.debounceUpdate.bind(this);

      // Set up enhanced position tracking
      this._setupEnhancedPositionTracking();
      
      // Restore navigation mode from state
      var savedMode = App.Core.State.get("stakeout.navigationMode");
      if (savedMode === "nodes" || savedMode === "segments" || savedMode === "lines") {
        _navigationMode = savedMode;
      }

      console.log("StakeOut feature initialized with enhanced position tracking");
      
      // Listen for color theme changes
      if (App.Core && App.Core.Events) {
        App.Core.Events.on('colorTheme:changed', function() {
          // Refresh circle colors when theme changes
          if (_circleLayersCreated) {
            _createOrUpdateMapLibreCircles();
          }
        });
      }
      
      // Set up keyboard navigation for nodes
      this._setupKeyboardNavigation();
    },
    
    /**
     * Set up keyboard navigation for cycling through nodes
     * @private
     */
    _setupKeyboardNavigation: function() {
      document.addEventListener('keydown', function(e) {
        // Only handle if stakeout is active and in nodes mode
        if (!_stakeOutActive || _navigationMode !== "nodes" || !_extractedVertices || _extractedVertices.length === 0) {
          return;
        }
        
        var handled = false;
        
        // Tab or Right Arrow - Next node
        if (e.key === "Tab" || e.key === "ArrowRight") {
          e.preventDefault();
          _currentVertexIndex = (_currentVertexIndex + 1) % _extractedVertices.length;
          handled = true;
        }
        // Shift+Tab or Left Arrow - Previous node
        else if ((e.key === "Tab" && e.shiftKey) || e.key === "ArrowLeft") {
          e.preventDefault();
          _currentVertexIndex = (_currentVertexIndex - 1 + _extractedVertices.length) % _extractedVertices.length;
          handled = true;
        }
        // Number keys 1-9 - Jump to specific node
        else if (e.key >= "1" && e.key <= "9") {
          var nodeIndex = parseInt(e.key) - 1;
          if (nodeIndex < _extractedVertices.length) {
            _currentVertexIndex = nodeIndex;
            handled = true;
          }
        }
        
        if (handled) {
          // Update to the selected vertex
          var selectedVertex = _extractedVertices[_currentVertexIndex];
          _targetLng = selectedVertex[0];
          _targetLat = selectedVertex[1];
          
          console.log(`[StakeOut] Navigated to vertex ${_currentVertexIndex + 1}/${_extractedVertices.length}`);
          
          // Update visual elements
          _createOrUpdateMapLibreCircles();
          _createOrUpdateHTMLLabels(_targetLng, _targetLat);
          _createOrUpdateVertexMarkers(_extractedVertices);
          
          // Force UI update
          _positionUpdated = true;
          _uiNeedsUpdate = true;
          _updateUI();
          
          // Update node info in UI
          if (_ui && _ui.updateNodeInfo) {
            _ui.updateNodeInfo(_currentVertexIndex, _extractedVertices.length);
          }
        }
      });
    },
    
    /**
     * Ensure UI components are created
     * @private
     */
    _ensureUIComponents: function() {
      if (_ui) {
        // Make sure arrow container exists
        _ui.createArrowContainer();
        // This will also create the mode toggle
      }
    },

    /**
     * Add circle layers to the map
     * @param {number} targetLng - Target longitude
     * @param {number} targetLat - Target latitude
     * @param {number} [currentLng] - Current longitude (optional)
     * @param {number} [currentLat] - Current latitude (optional)
     */
    addCircleLayer: function (targetLng, targetLat, currentLng, currentLat) {
      _targetLng = targetLng;
      _targetLat = targetLat;
      _stakeOutActive = true;
      
      // Sync with external active state tracking
      if (typeof this.setActive === "function") {
        this.setActive(true);
      }
      
      // Ensure UI components are created
      this._ensureUIComponents();

      if (currentLng !== undefined && currentLat !== undefined) {
        _currentLng = currentLng;
        _currentLat = currentLat;
      }

      _updateVisibleCirclesByZoom();
      _createOrUpdateMapLibreCircles();
      _createOrUpdateHTMLLabels(targetLng, targetLat);

      // Set up event handlers if not already done
      if (!_eventsRegistered) {
        _map.on("move", this.debounceUpdate);
        _map.on("zoom", this.handleZoom);
        _map.on("zoomstart", this.handleZoomStart);
        _map.on("zoomend", this.handleZoomEnd);
        _eventsRegistered = true;
      }

      // Start the update cycles if not already running
      if (!_positionUpdateInterval) {
        _startUpdateCycles();
        console.log("Started stakeout update cycles");
      }
      
      // Trigger immediate update
      _updatePositions();
      _updateUI();
    },

    /**
     * Display directional arrows for navigation
     * @param {Array} currentLocation - [lng, lat] of current position
     * @param {Array} targetLocation - [lng, lat] of target position
     */
    displayDirectionalArrows: function (currentLocation, targetLocation) {
      this.updateCurrentLocation(currentLocation[0], currentLocation[1]);

      _targetLng = targetLocation[0];
      _targetLat = targetLocation[1];
      _uiNeedsUpdate = true;

      var now = Date.now();
      if (!_lastUIUpdate || now - _lastUIUpdate > _UI_REFRESH_RATE * 2) {
        var distance = turf.distance(
          turf.point(currentLocation),
          turf.point(targetLocation),
          { units: "meters" }
        );

        _createOrUpdateGuideLine(currentLocation, targetLocation);
        _ui.displayDirectionalArrows(currentLocation, targetLocation, distance);
        _lastUIUpdate = now;
      }
    },

    /**
     * Update current user location
     * @param {number} currentLng - Current longitude
     * @param {number} currentLat - Current latitude
     */
    updateCurrentLocation: function (currentLng, currentLat) {
      // Use GNSS position if no coordinates provided
      if ((currentLng === undefined || currentLat === undefined) && 
          App.Map && App.Map.Navigation && typeof App.Map.Navigation.getGnssLocation === 'function') {
        var gnssLocation = App.Map.Navigation.getGnssLocation();
        if (gnssLocation && gnssLocation.length === 2 && !isNaN(gnssLocation[0]) && !isNaN(gnssLocation[1])) {
          currentLng = gnssLocation[0];
          currentLat = gnssLocation[1];
        }
      }
      
      // Debug log to track update frequency - only log every 10th call to reduce spam
      if (!this._updateCallCount) this._updateCallCount = 0;
      this._updateCallCount++;
      if (this._updateCallCount % 10 === 0) {
        console.log(`[StakeOut] updateCurrentLocation called: [${currentLng}, ${currentLat}], active: ${_stakeOutActive}`);
      }
      
      // Always update position and force UI refresh - position might be same but target changed
      if (currentLng !== undefined && currentLat !== undefined) {
        _currentLng = currentLng;
        _currentLat = currentLat;
      }
      _positionUpdated = true;
      _uiNeedsUpdate = true;
      
      // Force immediate UI update
      if (_stakeOutActive && _currentFeature) {
        // First update positions (which may update target in line/segments mode)
        _updatePositions();
        
        // Then update UI with potentially new target
        if (_targetLng && _targetLat) {
          var distance = turf.distance(
            turf.point([currentLng, currentLat]),
            turf.point([_targetLng, _targetLat]),
            { units: "meters" }
          );
          
          // Update UI immediately
          if (_ui && typeof _ui.displayDirectionalArrows === "function") {
            _ui.displayDirectionalArrows(
              [currentLng, currentLat],
              [_targetLng, _targetLat],
              distance
            );
          }
          
          // Also update guide line immediately
          if (_guideLineCreated) {
            _createOrUpdateGuideLine(
              [currentLng, currentLat],
              [_targetLng, _targetLat]
            );
          }
        }
      }
    },

    /**
     * Navigate to the nearest point on a feature
     * @param {Object} feature - GeoJSON feature
     * @param {Array|Object} currentLocation - [lng, lat] or {lng, lat} object
     * @returns {Array|null} - Coordinates of nearest point or null if failed
     */
    navigateToNearestPointOnPolygon: function (
      feature,
      currentLocation
    ) {
      // Ensure UI components are created
      this._ensureUIComponents();
      
      // Store the current feature
      _currentFeature = feature;
      
      // Reset vertex index when navigating to a new feature
      _currentVertexIndex = -1;
      
      // Extract current location
      var lng, lat;
      if (Array.isArray(currentLocation) && currentLocation.length === 2) {
        lng = currentLocation[0];
        lat = currentLocation[1];
      } else if (
        currentLocation &&
        currentLocation.lng != null &&
        currentLocation.lat != null
      ) {
        lng = currentLocation.lng;
        lat = currentLocation.lat;
      }

      // Validate location
      if (lng === undefined || lat === undefined || isNaN(lng) || isNaN(lat)) {
        console.error("Invalid location provided to navigateToNearestPointOnPolygon:", currentLocation);
        return null;
      }

      _currentLng = lng;
      _currentLat = lat;
      
      console.log("StakeOut navigating from location:", [lng, lat]);
      
      // Extract vertices for the feature
      _extractedVertices = _extractVertices(feature.geometry);
      
      var nearestCoords;
      
      // Find target based on navigation mode
      if (_navigationMode === "nodes") {
        // Navigate to nearest vertex - update index on initial navigation
        nearestCoords = _findNearestVertex(_extractedVertices, [lng, lat], true);
        
        // Create vertex markers if in node mode
        _createOrUpdateVertexMarkers(_extractedVertices);
        
        // Update node info in UI
        if (_ui && _ui.updateNodeInfo && _currentVertexIndex >= 0) {
          _ui.updateNodeInfo(_currentVertexIndex, _extractedVertices.length);
        }
      } else if (_navigationMode === "lines") {
        // Navigate to nearest point on any line in the feature
        // For lines mode, we treat all linestrings as continuous
        nearestCoords = this.findNearestPointOnLines(feature, [lng, lat]);
      } else {
        // Default segments mode - navigate to nearest point on edge/segment
        nearestCoords = this.findNearestPoint(feature, [lng, lat]);
      }

      if (!nearestCoords) {
        console.error("Failed to find nearest point on feature");
        return null;
      }

      // Set target location and current location
      _targetLng = nearestCoords[0];
      _targetLat = nearestCoords[1];
      
      this.addCircleLayer(nearestCoords[0], nearestCoords[1], lng, lat);
      _createOrUpdateGuideLine([lng, lat], nearestCoords);
      this.displayDirectionalArrows([lng, lat], nearestCoords);

      return nearestCoords;
    },

    /**
     * Find nearest point on any geometry type
     * @param {Object} feature - GeoJSON feature
     * @param {Array} currentLocation - [lng, lat] of current location
     * @returns {Array|null} - Coordinates of nearest point or null if failed
     */
    findNearestPoint: function (feature, currentLocation) {
      if (!feature || !feature.geometry) {
        console.error("Invalid feature:", feature);
        return null;
      }

      var geometry = feature.geometry;
      var point = turf.point(currentLocation);
      
      try {
        switch (geometry.type) {
          case "Point":
            // For points, return the point itself
            return geometry.coordinates;
            
          case "LineString":
            // Find nearest point on line
            var line = turf.lineString(geometry.coordinates);
            var nearest = turf.nearestPointOnLine(line, point);
            return nearest.geometry.coordinates;
            
          case "Polygon":
            // Find nearest point on polygon perimeter
            var outerRing = geometry.coordinates[0];
            var polygonLine = turf.lineString(outerRing);
            var nearestOnPolygon = turf.nearestPointOnLine(polygonLine, point);
            return nearestOnPolygon.geometry.coordinates;
            
          case "MultiPoint":
            // Find nearest point among all points - don't update index here
            return _findNearestVertex(geometry.coordinates, currentLocation, false);
            
          case "MultiLineString":
            // Find nearest point across all line strings
            var nearestPoint = null;
            var minDistance = Infinity;
            
            geometry.coordinates.forEach(function(lineCoords) {
              var multiLine = turf.lineString(lineCoords);
              var nearestOnLine = turf.nearestPointOnLine(multiLine, point);
              var distance = turf.distance(point, nearestOnLine);
              
              if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = nearestOnLine.geometry.coordinates;
              }
            });
            
            return nearestPoint;
            
          case "MultiPolygon":
            // Find nearest point across all polygons
            var nearestMultiPoint = null;
            var minMultiDistance = Infinity;
            
            geometry.coordinates.forEach(function(polygonCoords) {
              var multiOuterRing = polygonCoords[0];
              var multiPolygonLine = turf.lineString(multiOuterRing);
              var nearestOnMultiPolygon = turf.nearestPointOnLine(multiPolygonLine, point);
              var multiDistance = turf.distance(point, nearestOnMultiPolygon);
              
              if (multiDistance < minMultiDistance) {
                minMultiDistance = multiDistance;
                nearestMultiPoint = nearestOnMultiPolygon.geometry.coordinates;
              }
            });
            
            return nearestMultiPoint;
            
          default:
            console.error("Unsupported geometry type:", geometry.type);
            return null;
        }
      } catch (error) {
        console.error("Error finding nearest point:", error);
        return null;
      }
    },
    
    /**
     * Find nearest point considering all lines as continuous (for lines mode)
     * @param {Object} feature - GeoJSON feature
     * @param {Array} currentLocation - [lng, lat] of current location
     * @returns {Array|null} - Coordinates of nearest point or null if failed
     */
    findNearestPointOnLines: function (feature, currentLocation) {
      if (!feature || !feature.geometry) {
        console.error("Invalid feature:", feature);
        return null;
      }
      
      var geometry = feature.geometry;
      var point = turf.point(currentLocation);
      
      try {
        // For lines mode, we want to find the nearest point on any LineString
        // treating them all as navigable lines
        switch (geometry.type) {
          case "LineString":
            var line = turf.lineString(geometry.coordinates);
            var nearest = turf.nearestPointOnLine(line, point);
            return nearest.geometry.coordinates;
            
          case "MultiLineString":
            var nearestPoint = null;
            var minDistance = Infinity;
            
            geometry.coordinates.forEach(function(lineCoords) {
              var multiLine = turf.lineString(lineCoords);
              var nearestOnLine = turf.nearestPointOnLine(multiLine, point);
              var distance = turf.distance(point, nearestOnLine);
              
              if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = nearestOnLine.geometry.coordinates;
              }
            });
            
            return nearestPoint;
            
          case "Polygon":
          case "MultiPolygon":
            // For polygons in lines mode, navigate to perimeter
            return this.findNearestPoint(feature, currentLocation);
            
          default:
            // For other types, fall back to regular nearest point
            return this.findNearestPoint(feature, currentLocation);
        }
      } catch (error) {
        console.error("Error finding nearest point on lines:", error);
        return null;
      }
    },
    
    /**
     * Legacy method - redirects to findNearestPoint
     * @param {Object} polygonFeature - GeoJSON polygon feature
     * @param {Array|Object} currentLocation - [lng, lat] or {lng, lat} object
     * @returns {Array|null} - Coordinates of nearest point or null if failed
     */
    findNearestPointOnPolygon: function (polygonFeature, currentLocation) {
      var loc = currentLocation;
      if (!Array.isArray(currentLocation)) {
        loc = [currentLocation.lng || currentLocation.longitude, 
               currentLocation.lat || currentLocation.latitude];
      }
      return this.findNearestPoint(polygonFeature, loc);
    },

    // Event handlers
    handleZoomStart: function () {
      _visibleCircles.forEach(function (circle, i) {
        var layerId = "maplibre-circle-" + i;
        if (_map.getLayer(layerId)) {
          _map.setLayoutProperty(layerId, "visibility", "none");
        }
      });
    },

    handleZoom: function () {
      if (_zoomUpdateTimeout) {
        clearTimeout(_zoomUpdateTimeout);
      }
    },

    handleZoomEnd: function () {
      if (_zoomUpdateTimeout) {
        clearTimeout(_zoomUpdateTimeout);
      }

      _zoomUpdateTimeout = setTimeout(function () {
        _updateVisibleCirclesByZoom();
        _createOrUpdateMapLibreCircles();
        _createOrUpdateHTMLLabels(_targetLng, _targetLat);
      }, 100);
    },

    debounceUpdate: function () {
      if (_isUpdatingCircles) return;

      if (_updateTimeout) {
        clearTimeout(_updateTimeout);
      }

      _updateTimeout = setTimeout(function () {
        _updateMapLibreCircleStates();
        _isUpdatingCircles = false;
      }, 10);
    },

    /**
     * Set up enhanced position tracking with GNSS hooks
     * @private
     */
    _setupEnhancedPositionTracking: function () {
      if (_gnssHooksSetup) return;
      
      var self = this;
      
      // Hook GNSS simulator if available
      if (window.GNSSSimulator) {
        var originalUpdatePosition = window.GNSSSimulator.updatePosition;
        var originalSetPosition = window.GNSSSimulator.setPosition;
        
        window.GNSSSimulator.updatePosition = function (map) {
          if (originalUpdatePosition) {
            originalUpdatePosition.apply(this, arguments);
          }
          
          if (this.currentPosition && this.currentPosition.length >= 2 && _stakeOutActive) {
            self.updateCurrentLocation(this.currentPosition[0], this.currentPosition[1]);
          }
        };
        
        window.GNSSSimulator.setPosition = function (lng, lat, map) {
          if (originalSetPosition) {
            originalSetPosition.apply(this, arguments);
          }
          
          if (_stakeOutActive) {
            self.updateCurrentLocation(lng, lat);
          }
        };
      }
      
      // Hook interface.setPosition for other position updates
      if (window.interface && window.interface.setPosition) {
        var originalInterfaceSetPosition = window.interface.setPosition;
        
        window.interface.setPosition = function (position) {
          if (originalInterfaceSetPosition) {
            originalInterfaceSetPosition.apply(this, arguments);
          }
          
          if (_stakeOutActive) {
            var lng, lat;
            if (Array.isArray(position) && position.length >= 2) {
              lng = position[0];
              lat = position[1];
            } else if (position && typeof position === "object") {
              lng = position.lng || position.longitude;
              lat = position.lat || position.latitude;
            }
            
            if (lng !== undefined && lat !== undefined) {
              self.updateCurrentLocation(lng, lat);
            }
          }
        };
      }
      
      _gnssHooksSetup = true;
      console.log("Enhanced position tracking hooks established");
    },

    /**
     * Set navigation mode
     * @param {string} mode - "segments", "nodes", or "lines"
     */
    setNavigationMode: function (mode) {
      if (mode !== "segments" && mode !== "nodes" && mode !== "lines") {
        console.error("Invalid navigation mode:", mode);
        return;
      }
      
      _navigationMode = mode;
      
      // Store in persistent state
      App.Core.State.set("stakeout.navigationMode", mode);
      
      // If stakeout is active, re-navigate to update the target
      if (_stakeOutActive && _currentFeature) {
        // Force re-extraction of vertices when switching to nodes mode
        if (mode === "nodes") {
          _extractedVertices = _extractVertices(_currentFeature.geometry);
          _createOrUpdateVertexMarkers(_extractedVertices);
        } else {
          _removeVertexMarkers();
        }
        this.navigateToNearestPointOnPolygon(_currentFeature, [_currentLng, _currentLat]);
      }
      
      // Trigger event for UI updates
      if (App.Core.Events) {
        App.Core.Events.trigger("stakeout:modeChanged", { mode: mode });
      }
      
      console.log("Stakeout navigation mode changed to:", mode);
    },
    
    /**
     * Get current navigation mode
     * @returns {string} Current mode ("segments" or "nodes")
     */
    getNavigationMode: function () {
      return _navigationMode;
    },
    
    /**
     * Get extracted vertices for current feature
     * @returns {Array} Array of vertex coordinates
     */
    getExtractedVertices: function () {
      return _extractedVertices;
    },
    
    /**
     * Get the UI instance
     * @returns {StakeOutUI} The UI instance
     */
    getUI: function () {
      return _ui;
    },
    
    /**
     * Check if StakeOut is currently active
     * @returns {boolean} True if active
     */
    isActive: function () {
      return _stakeOutActive;
    },

    /**
     * Clean up all resources
     */
    cleanup: function () {
      _stopUpdateCycles();

      if (_zoomUpdateTimeout) {
        clearTimeout(_zoomUpdateTimeout);
        _zoomUpdateTimeout = null;
      }

      if (_updateTimeout) {
        clearTimeout(_updateTimeout);
        _updateTimeout = null;
      }

      // Remove circle label markers
      if (_labelMarkers && _labelMarkers.length > 0) {
        _labelMarkers.forEach(function (marker) {
          marker.remove();
        });
        _labelMarkers = [];
      }

      // Clean up guide line elements
      if (_guideLineCreated) {
        if (_distanceMarker) {
          _distanceMarker.remove();
          _distanceMarker = null;
        }

        if (_map.getLayer("guide-text")) {
          _map.removeLayer("guide-text");
        }

        if (_map.getLayer("guide-line")) {
          _map.removeLayer("guide-line");
        }

        if (_map.getSource("guide-line")) {
          _map.removeSource("guide-line");
        }

        _guideLineCreated = false;
      }

      // Remove all MapLibre circle layers
      _createdCircles.forEach(function (layerId) {
        if (_map.getLayer(layerId)) {
          _map.removeLayer(layerId);
        }
        if (_map.getSource(layerId)) {
          _map.removeSource(layerId);
        }
      });
      _createdCircles.clear();

      // Remove vertex markers
      _removeVertexMarkers();
      
      // Clean up UI elements
      if (_ui) {
        _ui.cleanup();
      }

      // Remove event listeners
      if (_eventsRegistered) {
        _map.off("zoom", this.handleZoom);
        _map.off("zoomstart", this.handleZoomStart);
        _map.off("zoomend", this.handleZoomEnd);
        _map.off("move", this.debounceUpdate);
        _eventsRegistered = false;
      }

      // Reset tracking flags
      _circleLayersCreated = false;
      _guideLineCreated = false;
      _positionUpdated = false;
      _uiNeedsUpdate = false;
      _stakeOutActive = false;
      _currentFeature = null;
      _extractedVertices = [];
      
      // Sync with external active state tracking
      if (typeof this.setActive === "function") {
        this.setActive(false);
      }
    },
  };
})();

console.log("App.Features.StakeOut module loaded");
