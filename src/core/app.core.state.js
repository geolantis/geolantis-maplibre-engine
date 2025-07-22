/**
 * App.Core.State module
 * 
 * Manages the application state with a centralized store pattern.
 * Provides methods for getting, setting, and subscribing to state changes.
 * State is organized into sections for settings, UI, map, and user data.
 */
// src/core/app.core.state.js
App.Core = App.Core || {};
App.Core.State = (function () {
  // Private state storage
  var _applicationState = {
    settings: {
      basemapSelectionEnabled: false,
      measurementMode: false,
      navigationMode: false,
      mapRotationEnabled: true,
      rotateWithCompass: true,
      pitchEnabled: true,
    },
    ui: {
      activeSidebar: null,
      buttonStates: {},
      modalOpen: false,
    },
    map: {
      currentBasemap: null,
      activeLayers: [],
      selectedFeatures: [],
      lastSelectedFeature: null,
      currentZoom: null,
      currentCenter: null,
    },
    user: {
      preferences: {},
      recentActions: [],
    },
  };

  // State change callbacks
  var _callbacks = {};

  // Helper function to get nested property
  function _getNestedProperty(obj, path) {
    if (!path) return obj;

    const parts = path.split(".");
    let current = obj;

    for (let i = 0; i < parts.length; i++) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[parts[i]];
    }

    return current;
  }

  // Helper function to set nested property
  function _setNestedProperty(obj, path, value) {
    if (!path) {
      Object.assign(obj, value);
      return;
    }

    const parts = path.split(".");
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }

  // Helper function to deep clone object
  function _deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  return {
    // Get state
    get: function (path) {
      return _getNestedProperty(_applicationState, path);
    },

    // Set state
    set: function (path, value) {
      _setNestedProperty(_applicationState, path, value);
      this._notifySubscribers(path, value);
    },

    // Update nested state
    update: function (path, updater) {
      const currentValue = this.get(path);
      const newValue = updater(currentValue);
      this.set(path, newValue);
    },

    // Subscribe to state changes
    subscribe: function (path, callback) {
      if (!_callbacks[path]) {
        _callbacks[path] = [];
      }
      _callbacks[path].push(callback);

      // Return unsubscribe function
      return function () {
        const index = _callbacks[path].indexOf(callback);
        if (index > -1) {
          _callbacks[path].splice(index, 1);
        }
      };
    },

    // Private: Notify subscribers
    _notifySubscribers: function (path, value) {
      if (_callbacks[path]) {
        _callbacks[path].forEach(function (callback) {
          callback(value);
        });
      }
    },

    // Get the entire state (careful with this)
    getState: function () {
      return _deepClone(_applicationState);
    },

    // For debugging
    logState: function () {
      console.log("Current application state:", this.getState());
    },
  };
})();

console.log("App.Core.State module loaded");
