/**
 * Enhanced Labels Module
 * Manages dynamic labels for features including length, slope angle, and slope percent
 * @namespace App.Map.LabelsEnhanced
 */
App.Map = App.Map || {};
App.Map.LabelsEnhanced = (function () {
  // Private variables
  var _map = null;
  var _initialized = false;
  var _labelLayerIds = [];
  var _labelSourceIds = [];
  
  // Toggle states
  var _lengthLabelsEnabled = false;
  var _slopeAngleLabelsEnabled = false;
  var _slopePercentLabelsEnabled = false;
  
  // Label configuration
  var _labelConfig = {
    units: 'metric', // 'metric' or 'imperial'
    decimalPlaces: 2,
    fontSize: 16,
    fontColor: '#000000',
    haloColor: '#FFFFFF',
    haloWidth: 2.5
  };

  /**
   * Calculate distance between two points
   * @param {Array} coord1 - [lng, lat, elevation]
   * @param {Array} coord2 - [lng, lat, elevation]
   * @returns {number} Distance in meters
   * @private
   */
  function _calculateDistance3D(coord1, coord2) {
    // If we have turf available, use it for horizontal distance
    if (window.turf) {
      const horizontalDistance = turf.distance(
        turf.point([coord1[0], coord1[1]]),
        turf.point([coord2[0], coord2[1]]),
        { units: 'meters' }
      );
      
      // If we have elevation data, calculate 3D distance
      if (coord1[2] !== undefined && coord2[2] !== undefined) {
        const elevationDiff = coord2[2] - coord1[2];
        return Math.sqrt(horizontalDistance * horizontalDistance + elevationDiff * elevationDiff);
      }
      
      return horizontalDistance;
    }
    
    // Fallback calculation
    const R = 6371000; // Earth's radius in meters
    const dLat = _toRadians(coord2[1] - coord1[1]);
    const dLon = _toRadians(coord2[0] - coord1[0]);
    const lat1 = _toRadians(coord1[1]);
    const lat2 = _toRadians(coord2[1]);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const horizontalDistance = R * c;
    
    // If we have elevation data, calculate 3D distance
    if (coord1[2] !== undefined && coord2[2] !== undefined) {
      const elevationDiff = coord2[2] - coord1[2];
      return Math.sqrt(horizontalDistance * horizontalDistance + elevationDiff * elevationDiff);
    }
    
    return horizontalDistance;
  }

  /**
   * Calculate slope between two points
   * @param {Array} coord1 - [lng, lat, elevation]
   * @param {Array} coord2 - [lng, lat, elevation]
   * @returns {Object} { angle: degrees, percent: percentage }
   * @private
   */
  function _calculateSlope(coord1, coord2) {
    // Need elevation data for slope calculation
    if (coord1[2] === undefined || coord2[2] === undefined) {
      return { angle: 0, percent: 0 };
    }
    
    const horizontalDistance = _calculateHorizontalDistance(coord1, coord2);
    const elevationDiff = coord2[2] - coord1[2];
    
    // Calculate slope angle in radians
    const slopeRadians = Math.atan(elevationDiff / horizontalDistance);
    
    // Convert to degrees
    const slopeDegrees = slopeRadians * (180 / Math.PI);
    
    // Calculate slope percentage
    const slopePercent = (elevationDiff / horizontalDistance) * 100;
    
    return {
      angle: slopeDegrees,
      percent: slopePercent
    };
  }

  /**
   * Calculate horizontal distance between two points
   * @private
   */
  function _calculateHorizontalDistance(coord1, coord2) {
    if (window.turf) {
      return turf.distance(
        turf.point([coord1[0], coord1[1]]),
        turf.point([coord2[0], coord2[1]]),
        { units: 'meters' }
      );
    }
    
    // Fallback calculation
    const R = 6371000; // Earth's radius in meters
    const dLat = _toRadians(coord2[1] - coord1[1]);
    const dLon = _toRadians(coord2[0] - coord1[0]);
    const lat1 = _toRadians(coord1[1]);
    const lat2 = _toRadians(coord2[1]);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @private
   */
  function _toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Format distance value
   * @private
   */
  function _formatDistance(meters) {
    if (_labelConfig.units === 'imperial') {
      const feet = meters * 3.28084;
      if (feet >= 5280) {
        const miles = feet / 5280;
        return miles.toFixed(_labelConfig.decimalPlaces) + ' mi';
      }
      return feet.toFixed(_labelConfig.decimalPlaces) + ' ft';
    } else {
      if (meters >= 1000) {
        const km = meters / 1000;
        return km.toFixed(_labelConfig.decimalPlaces) + ' km';
      }
      return meters.toFixed(_labelConfig.decimalPlaces) + ' m';
    }
  }

  /**
   * Format slope angle
   * @private
   */
  function _formatSlopeAngle(degrees) {
    return degrees.toFixed(_labelConfig.decimalPlaces) + '°';
  }

  /**
   * Format slope percent
   * @private
   */
  function _formatSlopePercent(percent) {
    return percent.toFixed(_labelConfig.decimalPlaces) + '%';
  }

  /**
   * Calculate midpoint of a line segment
   * @private
   */
  function _calculateMidpoint(coord1, coord2) {
    const mid = [
      (coord1[0] + coord2[0]) / 2,
      (coord1[1] + coord2[1]) / 2
    ];
    
    // Include elevation if available
    if (coord1[2] !== undefined && coord2[2] !== undefined) {
      mid[2] = (coord1[2] + coord2[2]) / 2;
    }
    
    return mid;
  }

  /**
   * Create label text based on enabled toggles
   * @private
   */
  function _createLabelText(distance, slope) {
    const parts = [];
    
    if (_lengthLabelsEnabled) {
      parts.push(_formatDistance(distance));
    }
    
    if (_slopeAngleLabelsEnabled && slope.angle !== 0) {
      parts.push(_formatSlopeAngle(slope.angle));
    }
    
    if (_slopePercentLabelsEnabled && slope.percent !== 0) {
      parts.push(_formatSlopePercent(slope.percent));
    }
    
    return parts.join(' | ');
  }

  /**
   * Process line geometry and create labels
   * @private
   */
  function _processLineString(coordinates, properties) {
    const labels = [];
    
    for (let i = 0; i < coordinates.length - 1; i++) {
      const coord1 = coordinates[i];
      const coord2 = coordinates[i + 1];
      
      const distance = _calculateDistance3D(coord1, coord2);
      const slope = _calculateSlope(coord1, coord2);
      
      const labelText = _createLabelText(distance, slope);
      
      if (labelText) {
        // Create a LineString for each segment to align labels properly
        labels.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [coord1, coord2]
          },
          properties: {
            label: labelText,
            distance: distance,
            slopeAngle: slope.angle,
            slopePercent: slope.percent,
            segmentIndex: i,
            ...properties
          }
        });
      }
    }
    
    return labels;
  }

  /**
   * Process polygon geometry and create labels
   * @private
   */
  function _processPolygon(coordinates, properties) {
    const labels = [];
    
    // Process outer ring
    const outerRing = coordinates[0];
    for (let i = 0; i < outerRing.length - 1; i++) {
      const coord1 = outerRing[i];
      const coord2 = outerRing[i + 1];
      
      const distance = _calculateDistance3D(coord1, coord2);
      const slope = _calculateSlope(coord1, coord2);
      
      const labelText = _createLabelText(distance, slope);
      
      if (labelText) {
        // Create a LineString for each segment to align labels properly
        labels.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [coord1, coord2]
          },
          properties: {
            label: labelText,
            distance: distance,
            slopeAngle: slope.angle,
            slopePercent: slope.percent,
            segmentIndex: i,
            ringIndex: 0,
            ...properties
          }
        });
      }
    }
    
    return labels;
  }

  /**
   * Clear all label layers
   * @private
   */
  function _clearLabels() {
    // Remove layers first
    _labelLayerIds.forEach(layerId => {
      if (_map.getLayer(layerId)) {
        _map.removeLayer(layerId);
      }
    });
    
    // Then remove sources
    _labelSourceIds.forEach(sourceId => {
      if (_map.getSource(sourceId)) {
        _map.removeSource(sourceId);
      }
    });
    
    _labelLayerIds = [];
    _labelSourceIds = [];
  }

  /**
   * Update labels for all layers
   * @private
   */
  function _updateAllLabels() {
    if (!_map || !_initialized) return;
    
    // Clear existing labels
    _clearLabels();
    
    // Check if any labels are enabled
    if (!_lengthLabelsEnabled && !_slopeAngleLabelsEnabled && !_slopePercentLabelsEnabled) {
      return;
    }
    
    // Get all sources
    const style = _map.getStyle();
    if (!style || !style.sources) return;
    
    // Process each GeoJSON source
    Object.keys(style.sources).forEach(sourceId => {
      const source = _map.getSource(sourceId);
      if (source && source.type === 'geojson') {
        _processGeoJSONSource(sourceId);
      }
    });
  }

  /**
   * Process a GeoJSON source and add labels
   * @private
   */
  function _processGeoJSONSource(sourceId) {
    const source = _map.getSource(sourceId);
    if (!source || !source._data) return;
    
    const data = source._data;
    const labels = [];
    
    // Process features
    if (data.type === 'FeatureCollection') {
      data.features.forEach(feature => {
        labels.push(..._processFeature(feature));
      });
    } else if (data.type === 'Feature') {
      labels.push(..._processFeature(data));
    }
    
    // Create label source and layer if we have labels
    if (labels.length > 0) {
      const labelSourceId = `${sourceId}-labels-${Date.now()}`;
      const labelLayerId = `${labelSourceId}-layer`;
      
      _map.addSource(labelSourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: labels
        }
      });
      
      _map.addLayer({
        id: labelLayerId,
        type: 'symbol',
        source: labelSourceId,
        layout: {
          'text-field': ['get', 'label'],
          'text-size': _labelConfig.fontSize,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-anchor': 'center',
          'text-allow-overlap': true,
          'text-ignore-placement': true,
          'symbol-placement': 'line',
          'text-rotation-alignment': 'map',
          'text-pitch-alignment': 'viewport',
          'symbol-z-order': 'source'
        },
        paint: {
          'text-color': _labelConfig.fontColor,
          'text-halo-color': _labelConfig.haloColor,
          'text-halo-width': _labelConfig.haloWidth,
          'text-opacity': 0.9
        }
      });
      
      _labelSourceIds.push(labelSourceId);
      _labelLayerIds.push(labelLayerId);
    }
  }

  /**
   * Process a single feature
   * @private
   */
  function _processFeature(feature) {
    if (!feature.geometry) return [];
    
    const labels = [];
    const properties = feature.properties || {};
    
    switch (feature.geometry.type) {
      case 'LineString':
        labels.push(..._processLineString(feature.geometry.coordinates, properties));
        break;
      case 'MultiLineString':
        feature.geometry.coordinates.forEach((line, index) => {
          const lineLabels = _processLineString(line, { ...properties, lineIndex: index });
          labels.push(...lineLabels);
        });
        break;
      case 'Polygon':
        labels.push(..._processPolygon(feature.geometry.coordinates, properties));
        break;
      case 'MultiPolygon':
        feature.geometry.coordinates.forEach((polygon, index) => {
          const polygonLabels = _processPolygon(polygon, { ...properties, polygonIndex: index });
          labels.push(...polygonLabels);
        });
        break;
    }
    
    return labels;
  }

  /**
   * Update label field in features
   * @private
   */
  function _updateFeatureLabels(sourceId) {
    const source = _map.getSource(sourceId);
    if (!source || !source._data) return;
    
    const data = source._data;
    let updated = false;
    
    // Process features
    if (data.type === 'FeatureCollection') {
      data.features.forEach(feature => {
        if (_updateFeatureLabel(feature)) {
          updated = true;
        }
      });
    } else if (data.type === 'Feature') {
      if (_updateFeatureLabel(data)) {
        updated = true;
      }
    }
    
    // Update source if needed
    if (updated) {
      source.setData(data);
    }
  }

  /**
   * Update label property on a feature
   * @private
   */
  function _updateFeatureLabel(feature) {
    if (!feature.geometry || !feature.properties) return false;
    
    // Calculate label based on geometry
    let label = '';
    
    switch (feature.geometry.type) {
      case 'LineString':
        const coords = feature.geometry.coordinates;
        if (coords.length >= 2) {
          const distance = _calculateDistance3D(coords[0], coords[coords.length - 1]);
          const slope = _calculateSlope(coords[0], coords[coords.length - 1]);
          label = _createLabelText(distance, slope);
        }
        break;
      case 'Point':
        // Points don't need segment labels
        return false;
    }
    
    if (label) {
      feature.properties.label = label;
      return true;
    }
    
    return false;
  }

  // Public API
  return {
    /**
     * Initialize the enhanced labels module
     * @param {Object} map - MapLibre GL JS map instance
     */
    initialize: function(map) {
      _map = map;
      _initialized = true;
      
      // Listen for toggle events
      if (App.Core.Events) {
        App.Core.Events.on('labels:lengthToggled', (data) => {
          _lengthLabelsEnabled = data.enabled;
          _updateAllLabels();
        });
        
        App.Core.Events.on('labels:slopeAngleToggled', (data) => {
          _slopeAngleLabelsEnabled = data.enabled;
          _updateAllLabels();
        });
        
        App.Core.Events.on('labels:slopePercentToggled', (data) => {
          _slopePercentLabelsEnabled = data.enabled;
          _updateAllLabels();
        });
        
        // Listen for layer changes
        App.Core.Events.on('layer:added', () => {
          if (_lengthLabelsEnabled || _slopeAngleLabelsEnabled || _slopePercentLabelsEnabled) {
            _updateAllLabels();
          }
        });
        
        App.Core.Events.on('layer:updated', () => {
          if (_lengthLabelsEnabled || _slopeAngleLabelsEnabled || _slopePercentLabelsEnabled) {
            _updateAllLabels();
          }
        });
      }
      
      console.log('Enhanced labels module initialized');
    },

    /**
     * Set label configuration
     * @param {Object} config - Configuration object
     */
    setConfig: function(config) {
      Object.assign(_labelConfig, config);
      _updateAllLabels();
    },

    /**
     * Get current label configuration
     * @returns {Object} Current configuration
     */
    getConfig: function() {
      return { ..._labelConfig };
    },

    /**
     * Toggle length labels
     * @param {boolean} enabled - Enable/disable state
     */
    setLengthLabelsEnabled: function(enabled) {
      _lengthLabelsEnabled = enabled;
      _updateAllLabels();
    },

    /**
     * Toggle slope angle labels
     * @param {boolean} enabled - Enable/disable state
     */
    setSlopeAngleLabelsEnabled: function(enabled) {
      _slopeAngleLabelsEnabled = enabled;
      _updateAllLabels();
    },

    /**
     * Toggle slope percent labels
     * @param {boolean} enabled - Enable/disable state
     */
    setSlopePercentLabelsEnabled: function(enabled) {
      _slopePercentLabelsEnabled = enabled;
      _updateAllLabels();
    },

    /**
     * Update labels for a specific source
     * @param {string} sourceId - Source ID to update
     */
    updateSourceLabels: function(sourceId) {
      if (!_map || !_initialized) return;
      
      // Update feature labels
      _updateFeatureLabels(sourceId);
      
      // Update display labels
      if (_lengthLabelsEnabled || _slopeAngleLabelsEnabled || _slopePercentLabelsEnabled) {
        _updateAllLabels();
      }
    },

    /**
     * Clear all labels
     */
    clearLabels: function() {
      _clearLabels();
    },

    /**
     * Get label states
     * @returns {Object} Current label states
     */
    getLabelStates: function() {
      return {
        lengthLabels: _lengthLabelsEnabled,
        slopeAngleLabels: _slopeAngleLabelsEnabled,
        slopePercentLabels: _slopePercentLabelsEnabled
      };
    }
  };
})();

console.log('app.map.labels.enhanced.js loaded - App.Map.LabelsEnhanced module created');