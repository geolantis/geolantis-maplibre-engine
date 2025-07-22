/**
 * Core initialization functionality
 * @namespace App.Core.Init
 */
App.Core = App.Core || {};
App.Core.Init = (function () {
  var _initialized = false;
  var _modules = [];

  /**
   * Register a module for initialization
   * @param {Object} module - Module object with initialize function
   * @param {string} name - Module name for debugging
   */
  function registerModule(module, name) {
    if (module && typeof module.initialize === "function") {
      _modules.push({ module: module, name: name });
      console.log("Registered module for initialization:", name);
    }
  }

  /**
   * Initialize all registered modules
   */
  function initializeModules() {
    const map = App.Map.Init.getMap();

    _modules.forEach(function (moduleInfo) {
      try {
        console.log("Initializing module:", moduleInfo.name);
        moduleInfo.module.initialize(map);
      } catch (error) {
        console.error("Error initializing module", moduleInfo.name, ":", error);
      }
    });
  }

  /**
   * Initialize the application
   */
  function initialize() {
    console.log("[Core.Init] Initialize called");
    
    if (_initialized) {
      console.log("[Core.Init] Application already initialized");
      return;
    }

    console.log("[Core.Init] Initializing application...");
    
    // Initialize i18n manager first
    if (App.I18n && typeof App.I18n.init === 'function') {
      console.log("[Core.Init] Initializing i18n manager");
      App.I18n.init().then(() => {
        console.log("[Core.Init] i18n manager initialized");
        // Update page translations after i18n is initialized
        if (App.I18n.updatePageTranslations) {
          console.log("[Core.Init] Updating page translations");
          App.I18n.updatePageTranslations();
        }
      }).catch((error) => {
        console.error("[Core.Init] Error initializing i18n:", error);
      });
    }

    // Register all modules
    registerModule(App.UI.Sidebar, "UI.Sidebar");
    registerModule(App.UI.Controls, "UI.Controls");
    registerModule(App.UI.Search, "UI.Search");
    registerModule(App.UI.Footer, "UI.Footer");
    registerModule(App.UI.StatusFooter, "UI.StatusFooter");
    registerModule(App.UI.FeatureSelector, "UI.FeatureSelector"); // Add this line
    registerModule(App.UI.PerformanceDashboard, "UI.PerformanceDashboard");
    registerModule(App.UI.TiltDisplayWidget, "UI.TiltDisplayWidget");
    registerModule(App.Map.Controls, "Map.Controls");
    registerModule(App.Map.Layers, "Map.Layers");
    registerModule(App.Map.Events, "Map.Events");
    registerModule(App.Map.Overlay, "Map.Overlay");
    registerModule(App.Map.Basemap, "Map.Basemap");
    registerModule(App.Map.Basemap.UI, "Map.Basemap.UI");
    registerModule(App.Map.Terrain, "Map.Terrain");
    registerModule(App.Map.LabelsEnhanced, "Map.LabelsEnhanced");
    registerModule(App.Map.Bookmarks, "Map.Bookmarks");
    registerModule(App.Bridge.Interface, "Bridge.Interface");
    registerModule(App.Features.Measure, "Features.Measure");
    registerModule(App.Core.Performance, "Core.Performance");

    // Initialize all modules
    initializeModules();

    // Trigger initialization complete event
    App.Core.Events.trigger("app:initialized");

    _initialized = true;
    console.log("Application initialization complete");
  }

  // Public API
  return {
    initialize: initialize,
    registerModule: registerModule,
    isInitialized: function () {
      return _initialized;
    },
  };
})();

console.log("App.Core.Init module loaded");
