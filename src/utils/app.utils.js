/**
 * Utility functions
 * @namespace App.Utils
 */
App.Utils = App.Utils || {};
App.Utils = (function () {
  // Private variables

  // Public API
  return {
    /**
     * Calculate distance between two coordinates using Haversine formula
     * @param {Array} latlng1 - First coordinate [longitude, latitude]
     * @param {Array} latlng2 - Second coordinate [longitude, latitude]
     * @returns {number} Distance in meters
     */
    calculateDistance: function (latlng1, latlng2) {
      const R = 6371e3; // Radius of the Earth in meters
      const φ1 = (latlng1[1] * Math.PI) / 180; // latitude in radians
      const φ2 = (latlng2[1] * Math.PI) / 180;
      const Δφ = ((latlng2[1] - latlng1[1]) * Math.PI) / 180;
      const Δλ = ((latlng2[0] - latlng1[0]) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // Distance in meters
    },

    /**
     * Load a local file with environment detection
     * @param {string} filePath - Path to the file
     * @param {Function} callback - Callback function for the loaded data
     */
    loadFile: function (filePath, callback) {
      // Resolve the correct path based on environment
      const resolvedPath = this.resolveFilePath(filePath);

      if (this.isAndroidApp()) {
        // Use XMLHttpRequest for Android WebView to load the file from assets
        this.loadLocalFile(resolvedPath, callback);
      } else {
        // Use fetch for the web environment
        fetch(resolvedPath)
          .then((response) => response.json())
          .then((data) => {
            callback(data);
          })
          .catch((error) => {
            console.error("Error fetching file in web:", error);
          });
      }
    },

    /**
     * Check if the application is running in Android WebView
     * @returns {boolean} Whether running in Android WebView
     */
    isAndroidApp: function () {
      // Check if we are in a WebView by checking the user agent or a custom flag
      return (
        /Android/.test(navigator.userAgent) && /wv/.test(navigator.userAgent)
      );
    },

    /**
     * Load a local file using XMLHttpRequest
     * @param {string} filePath - Path to the file
     * @param {Function} callback - Callback function for the loaded data
     */
    loadLocalFile: function (filePath, callback) {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", filePath, true);
      xhr.responseType = "json"; // Assuming your local file is a JSON

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = xhr.response;
          callback(data);
        } else {
          console.error("Error loading local file:", xhr.statusText);
        }
      };

      xhr.onerror = function () {
        console.error("Network error while loading local file.");
      };

      xhr.send();
    },

    /**
     * Resolve file path based on environment
     * @param {string} filePath - Original file path
     * @returns {string} Resolved file path
     */
    resolveFilePath: function (filePath) {
      if (this.isAndroidApp()) {
        // If running in Android, point to the `assets/` directory
        return "file:///android_asset/" + filePath.replace(/^\/?maps\//, "");
      } else {
        // In the web environment, use the normal file path
        return filePath;
      }
    },

    /**
     * Convert decimal degrees to degrees minutes seconds format
     * @param {number} decimal - Decimal degrees
     * @returns {string} Formatted DMS string
     */
    decimalToDMS: function (decimal) {
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
    decimalToDDM: function (decimal) {
      const deg = Math.floor(Math.abs(decimal));
      const min = ((Math.abs(decimal) - deg) * 60).toFixed(4);

      const direction = decimal >= 0 ? "" : "-";
      return `${direction}${deg}° ${min}'`;
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
          return this.decimalToDMS(decimal);
        case 2: // Degrees decimal minutes
          return this.decimalToDDM(decimal);
        default:
          return `${decimal.toFixed(7)}°`;
      }
    },
  };
})();

console.log("app.utils.js loaded - App.Utils module created");
