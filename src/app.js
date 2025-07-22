/**
 * Main application namespace
 * @namespace App
 */
var App = App || {};

/**
 * Core functionality namespace
 * @namespace App.Core
 */
App.Core = App.Core || {};

/**
 * Map functionality namespace
 * @namespace App.Map
 */
App.Map = App.Map || {};

/**
 * User interface namespace
 * @namespace App.UI
 */
App.UI = App.UI || {};

/**
 * Feature functionality namespace
 * @namespace App.Features
 */
App.Features = App.Features || {};

/**
 * Utility functions namespace
 * @namespace App.Utils
 */
App.Utils = App.Utils || {};

// Modify your app.js initialization to use App.Core.Init
App.init = function () {
  console.log("[App] App.init called - initializing application");

  // Check if Map.Init module is available with initializeMap function
  if (
    App.Map &&
    App.Map.Init &&
    typeof App.Map.Init.initializeMap === "function"
  ) {
    console.log("Map.Init module available, initializing map");
    var map = App.Map.Init.initializeMap("map");

    if (map) {
      console.log("Map initialized successfully");

      // Initialize the rest of the application
      if (
        App.Core &&
        App.Core.Init &&
        typeof App.Core.Init.initialize === "function"
      ) {
        console.log("Initializing application components");
        App.Core.Init.initialize();
      } else {
        console.error("Core initialization module not available");
      }
    } else {
      console.error("Map initialization failed");
    }
  } else {
    console.error("Map initialization function not available");
  }
};

// Set up initialization when page loads
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded - calling App.init");
  // Delay to ensure all scripts are loaded
  setTimeout(() => {
    App.init();
  }, 100);
});

// Also listen for window load event as a backup
window.addEventListener("load", function () {
  console.log("Window loaded");
  if (!App._initialized) {
    App.init();
  }
});

// Add this to your initialization or run it manually
window.fixMapStall = function () {
  console.log("🔧 Fixing map stall issue");

  // Reinitialize map events to ensure only one handler
  reinitializeMapEvents();

  // Make sure feature selector is optimized
  const container = document.getElementById("feature-selector-container");
  if (container) {
    container.style.willChange = "transform";
    container.style.transform = "translateZ(0)";
  }

  console.log("✅ Map stall fix applied");
};

// Debugging helper
window.checkAppStructure = function () {
  console.log("Checking App structure:");
  console.log("- App exists:", typeof App !== "undefined");
  console.log("- App.Map exists:", App && typeof App.Map !== "undefined");
  console.log(
    "- App.Map.Init exists:",
    App && App.Map && typeof App.Map.Init !== "undefined"
  );

  if (App && App.Map && App.Map.Init) {
    console.log(
      "- App.Map.Init.initializeMap exists:",
      typeof App.Map.Init.initializeMap === "function"
    );
    console.log(
      "- App.Map.Init.getMap exists:",
      typeof App.Map.Init.getMap === "function"
    );
  }
};

console.log("app.js loaded - namespace structure created");
