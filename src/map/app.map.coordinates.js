/**
 * Coordinates handling and projection
 * @namespace App.Map.Coordinates
 */
App.Map = App.Map || {};
App.Map.Coordinates = (function () {
  // Private variables
  var _formats = {
    DD: 0, // Decimal Degrees
    DMS: 1, // Degrees Minutes Seconds
    DDM: 2, // Degrees Decimal Minutes
  };
  var _currentFormat = _formats.DD;

  // Public API
  return {
    /**
     * Available coordinate formats
     */
    formats: _formats,

    /**
     * Get current coordinate format
     * @returns {number} Current format code
     */
    getCurrentFormat: function () {
      return _currentFormat;
    },

    /**
     * Set coordinate display format
     * @param {number} format - Format code to set
     */
    setFormat: function (format) {
      if (format >= 0 && format <= 2) {
        _currentFormat = format;
      }
    },

    /**
     * Cycle to the next coordinate format
     * @returns {number} The new format code
     */
    cycleFormat: function () {
      _currentFormat = (_currentFormat + 1) % 3;
      return _currentFormat;
    },

    /**
     * Format a coordinate according to the current or specified format
     * @param {number} decimal - Decimal coordinate value
     * @param {number} [format] - Optional specific format to use
     * @returns {string} Formatted coordinate string
     */
    format: function (decimal, format) {
      const useFormat = format !== undefined ? format : _currentFormat;

      switch (useFormat) {
        case this.formats.DD:
          return `${decimal.toFixed(7)}°`;
        case this.formats.DMS:
          return this.toDMS(decimal);
        case this.formats.DDM:
          return this.toDDM(decimal);
        default:
          return `${decimal.toFixed(7)}°`;
      }
    },

    /**
     * Convert decimal degrees to degrees minutes seconds
     * @param {number} decimal - Decimal degrees
     * @returns {string} Formatted DMS string
     */
    toDMS: function (decimal) {
      const deg = Math.floor(Math.abs(decimal));
      const minutesNotTruncated = (Math.abs(decimal) - deg) * 60;
      const min = Math.floor(minutesNotTruncated);
      const sec = ((minutesNotTruncated - min) * 60).toFixed(2);

      const direction = decimal >= 0 ? "" : "-";
      return `${direction}${deg}° ${min}' ${sec}"`;
    },

    /**
     * Convert decimal degrees to degrees decimal minutes
     * @param {number} decimal - Decimal degrees
     * @returns {string} Formatted DDM string
     */
    toDDM: function (decimal) {
      const deg = Math.floor(Math.abs(decimal));
      const min = ((Math.abs(decimal) - deg) * 60).toFixed(4);

      const direction = decimal >= 0 ? "" : "-";
      return `${direction}${deg}° ${min}'`;
    },

    /**
     * Find the nearest point on a polygon to a given point
     * @param {Object} polygonFeature - GeoJSON polygon feature
     * @param {Array|Object} currentLocation - Current location as [lng, lat] or {lng, lat}
     * @returns {Array|null} Coordinates of nearest point or null
     */
    findNearestPointOnPolygon: function (polygonFeature, currentLocation) {
      try {
        // Extract current location coordinates
        let lng, lat;
        if (Array.isArray(currentLocation) && currentLocation.length === 2) {
          [lng, lat] = currentLocation;
        } else if (
          currentLocation &&
          currentLocation.lng != null &&
          currentLocation.lat != null
        ) {
          lng = currentLocation.lng;
          lat = currentLocation.lat;
        } else {
          return null;
        }

        // Get the outer ring of the polygon
        const outerRing = polygonFeature.geometry.coordinates[0];

        // Create a LineString from the polygon perimeter
        const line = turf.lineString(outerRing);

        // Create a point from the current location
        const point = turf.point([lng, lat]);

        // Find the nearest point on the polygon perimeter
        const nearest = turf.nearestPointOnLine(line, point);

        // Return the coordinates of the nearest point
        return nearest.geometry.coordinates;
      } catch (error) {
        console.error("Error finding nearest point:", error);
        return null;
      }
    },
  };
})();

console.log(
  "app.map.coordinates.js loaded - App.Map.Coordinates module created"
);
