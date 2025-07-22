/**
 * Coordinate utilities for formatting and conversion
 * @namespace App.Utils.Coordinates
 */
App.Utils = App.Utils || {};
App.Utils.Coordinates = (function () {
  // Private variables and methods

  /**
   * Convert decimal degrees to degrees minutes seconds format
   * @private
   * @param {number} decimal - Decimal degrees
   * @returns {string} Formatted DMS string
   */
  function _decimalToDMS(decimal) {
    const deg = Math.floor(Math.abs(decimal));
    const minutesNotTruncated = (Math.abs(decimal) - deg) * 60;
    const min = Math.floor(minutesNotTruncated);
    const sec = ((minutesNotTruncated - min) * 60).toFixed(2);

    const direction = decimal >= 0 ? "" : "-";
    return `${direction}${deg}° ${min}' ${sec}"`;
  }

  /**
   * Convert decimal degrees to degrees decimal minutes
   * @private
   * @param {number} decimal - Decimal degrees
   * @returns {string} Formatted DDM string
   */
  function _decimalToDDM(decimal) {
    const deg = Math.floor(Math.abs(decimal));
    const min = ((Math.abs(decimal) - deg) * 60).toFixed(4);

    const direction = decimal >= 0 ? "" : "-";
    return `${direction}${deg}° ${min}'`;
  }

  // Public API
  return {
    /**
     * Convert decimal degrees to degrees minutes seconds format
     * @param {number} decimal - Decimal degrees
     * @returns {string} Formatted DMS string
     */
    decimalToDMS: function (decimal) {
      return _decimalToDMS(decimal);
    },

    /**
     * Convert decimal degrees to degrees decimal minutes
     * @param {number} decimal - Decimal degrees
     * @returns {string} Formatted DDM string
     */
    decimalToDDM: function (decimal) {
      return _decimalToDDM(decimal);
    },

    /**
     * Format coordinates based on selected format
     * @param {number} decimal - Decimal coordinate value
     * @param {number} format - Format code (0=DD, 1=DMS, 2=DDM)
     * @returns {string} Formatted coordinate string
     */
    formatCoordinate: function (decimal, format) {
      switch (format) {
        case 0: // Decimal degrees
          return `${decimal.toFixed(7)}°`;
        case 1: // Degrees minutes seconds
          return _decimalToDMS(decimal);
        case 2: // Degrees decimal minutes
          return _decimalToDDM(decimal);
        default:
          return `${decimal.toFixed(7)}°`;
      }
    },
  };
})();

console.log(
  "app.utils.coordinates.js loaded - App.Utils.Coordinates module created"
);
