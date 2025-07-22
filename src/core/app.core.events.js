/**
 * Event handling system
 * @namespace App.Core.Events
 *//**
  * Event handling system
  * @namespace App.Core.Events
  */
App.Core = App.Core || {};
App.Core.Events = (function () {
  // Private variables
  var _events = {};

  // Public API
  return {
    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Function to call when event is triggered
     * @returns {Function} Unsubscribe function
     */
    on: function (eventName, callback) {
      _events[eventName] = _events[eventName] || [];
      _events[eventName].push(callback);

      // Return a function to unsubscribe
      return function () {
        _events[eventName] = _events[eventName].filter(function (cb) {
          return cb !== callback;
        });
      };
    },

    /**
     * Trigger an event
     * @param {string} eventName - Name of the event
     * @param {*} data - Data to pass to event handlers
     */
    trigger: function (eventName, data) {
      if (!_events[eventName]) {
        return;
      }

      _events[eventName].forEach(function (callback) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      });
    },
  };
})();
