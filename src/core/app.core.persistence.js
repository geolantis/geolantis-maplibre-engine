/**
 * Persistence module for handling application state storage.
 * Provides methods to save, load, and clear application state from localStorage.
 * 
 * @namespace App.Core.Persistence
 */
App.Core.Persistence = (function () {
  return {
    saveState: function () {
      const state = App.Core.State.getState();
      localStorage.setItem("geolantis360_state", JSON.stringify(state));
    },

    loadState: function () {
      const savedState = localStorage.getItem("geolantis360_state");
      if (savedState) {
        return JSON.parse(savedState);
      }
      return null;
    },

    clearState: function () {
      localStorage.removeItem("geolantis360_state");
    },
  };
})();
