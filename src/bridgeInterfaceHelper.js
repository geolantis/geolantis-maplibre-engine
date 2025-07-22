var BiHelper = {
  has: function (object, key) {
    return object ? hasOwnProperty.call(object, key) : false;
  },

  toJson: function (object) {
    return JSON.stringify(object);
  },

  serializeBounds: function (bounds) {
    return {
      northEast: this.serializeLatLng(bounds.getNorthEast()),
      southWest: this.serializeLatLng(bounds.getSouthWest()),
    };
  },

  serializeLatLng: function (latLng) {
    if (!latLng) return null;
    return {
      lat: latLng.lat,
      lng: latLng.lng,
    };
  },

  serializeLatLngAndPoint: function (latLng, point) {
    return {
      lat: latLng.lat,
      lng: latLng.lng,
      x: point.x,
      y: point.y,
    };
  },

  serializePoint: function (point) {
    return {
      x: point.x,
      y: point.y,
    };
  },

  serializeLatLngWithId: function (point, id) {
    return {
      lat: point.lat,
      lng: point.lng,
      id: id,
    };
  },

  serializeCoord: function (coord) {
    return {
      x: coord.x,
      y: coord.y,
      z: coord.z,
    };
  },
};
