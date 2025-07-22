/**
 * Bridge interface utility functions
 * @namespace App.Utils.Bridge
 */
App.Utils = App.Utils || {};
App.Utils.Bridge = (function () {
  // Private variables and methods

  // Public API
  return {
    /**
     * Checks if an object has a specific key
     * @param {Object} object - The object to check
     * @param {string} key - The key to look for
     * @returns {boolean} Whether the object has the key
     */
    has: function (object, key) {
      return object ? hasOwnProperty.call(object, key) : false;
    },

    /**
     * Converts an object to JSON string
     * @param {Object} object - The object to convert
     * @returns {string} JSON string representation
     */
    toJson: function (object) {
      return JSON.stringify(object);
    },

    /**
     * Serializes map bounds object for communication
     * @param {Object} bounds - MapLibre bounds object
     * @returns {Object} Serialized bounds with northEast and southWest coordinates
     */
    serializeBounds: function (bounds) {
      return {
        northEast: this.serializeLatLng(bounds.getNorthEast()),
        southWest: this.serializeLatLng(bounds.getSouthWest()),
      };
    },

    /**
     * Serializes latitude/longitude object
     * @param {Object} latLng - Latitude/longitude object
     * @returns {Object|null} Simplified lat/lng object or null
     */
    serializeLatLng: function (latLng) {
      if (!latLng) return null;
      return {
        lat: latLng.lat,
        lng: latLng.lng,
      };
    },

    /**
     * Serializes latitude/longitude with pixel point
     * @param {Object} latLng - Latitude/longitude object
     * @param {Object} point - Pixel point object
     * @returns {Object} Combined lat/lng and x/y object
     */
    serializeLatLngAndPoint: function (latLng, point) {
      return {
        lat: latLng.lat,
        lng: latLng.lng,
        x: point.x,
        y: point.y,
      };
    },

    /**
     * Serializes a pixel point object
     * @param {Object} point - Pixel point object
     * @returns {Object} Simplified x/y object
     */
    serializePoint: function (point) {
      return {
        x: point.x,
        y: point.y,
      };
    },

    /**
     * Serializes latitude/longitude with an ID
     * @param {Object} point - Latitude/longitude object
     * @param {string|number} id - ID to associate with the point
     * @returns {Object} Lat/lng object with ID
     */
    serializeLatLngWithId: function (point, id) {
      return {
        lat: point.lat,
        lng: point.lng,
        id: id,
      };
    },

    /**
     * Serializes a 3D coordinate
     * @param {Object} coord - Coordinate object with x, y, z
     * @returns {Object} Simplified x/y/z object
     */
    serializeCoord: function (coord) {
      return {
        x: coord.x,
        y: coord.y,
        z: coord.z,
      };
    },
  };
})();

console.log("app.utils.bridge.js loaded - App.Utils.Bridge module created");
