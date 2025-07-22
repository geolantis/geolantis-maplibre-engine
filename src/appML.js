/**
 *
 */
var reha = new ReturnHandler();

// Function to initialize reha with Android interface
function initializeReha() {
  // Check if nativeReha is available
  if (typeof nativeReha !== 'undefined') {
    console.log("nativeReha is available, setting Android interface");
    reha.setInterface("android");
    console.log("ReturnHandler initialized with Android interface");
    return true;
  } else {
    console.warn("nativeReha not yet available");
    return false;
  }
}

// Try to initialize immediately
if (!initializeReha()) {
  // If not available, try again after a short delay
  console.log("Scheduling reha initialization for later");
  setTimeout(function() {
    if (!initializeReha()) {
      console.error("Failed to initialize reha with Android interface - nativeReha not available");
    }
  }, 100);
}

console.log("reha object:", reha);
console.log("reha.sendCallback:", reha.sendCallback);

window.interface = new BridgeInterface("map");
console.log("BridgeInterface initialized");
console.log("Interface probeStatus available:", typeof window.interface.probeStatus === 'function');

// For MapLibre, ensure the interface is ready and trigger the callback if needed
// Also ensure the interface is globally accessible
if (typeof interface === 'undefined') {
  window.interface = window.interface; // Ensure global accessibility
}

// Send initiated callback earlier for MapLibre
setTimeout(function() {
  console.log("[appML] Checking interface status after delay");
  if (window.interface && typeof window.interface.probeStatus === 'function') {
    console.log("[appML] Interface ready, checking if init callback is needed");
    // Check if reha is ready
    if (typeof reha !== 'undefined' && reha && typeof reha.sendCallback === 'function') {
      console.log("[appML] Sending initial 'initiated' callback");
      reha.sendCallback("initiated", "");
    }
  } else {
    console.error("[appML] Interface or probeStatus not available after delay");
  }
}, 200); // Reduced delay to 200ms

// Ensure App modules are initialized after BridgeInterface is ready
setTimeout(function() {
  console.log("[appML] Checking if App needs initialization...");
  if (typeof App !== 'undefined' && typeof App.init === 'function' && !App._initialized) {
    console.log("[appML] Calling App.init()");
    App.init();
  } else {
    console.log("[appML] App already initialized or not available");
  }
}, 200);

function initializeStatusFooter() {
  const statusFooter = document.querySelector("status-footer");
  if (statusFooter) {
    // Footer is self-initialized, no action needed
    console.log("Status footer Web Component found and initialized");
  } else {
    console.error("Status footer Web Component not found");
  }
}

// Separate function to handle footer setup - this can be called multiple times safely
function setupStatusFooter() {
  const statusBar = document.querySelector(".status-bar");
  const expandedSections = document.getElementById("expanded-sections");
  const chevronIcon = document.getElementById("chevron-icon");

  if (statusBar && expandedSections) {
    console.log("Setting up status footer interaction");

    // Ensure expanded sections starts hidden
    expandedSections.classList.add("hidden");

    // Remove any existing click handlers (using cloneNode trick)
    const newStatusBar = statusBar.cloneNode(true);
    statusBar.parentNode.replaceChild(newStatusBar, statusBar);

    // Add fresh click handler
    newStatusBar.addEventListener("click", function () {
      console.log("Status bar clicked");

      // Determine if we're expanding or collapsing
      const isExpanding = expandedSections.classList.contains("hidden");

      // Toggle expanded sections visibility
      expandedSections.classList.toggle("hidden");

      // Update chevron icon if it exists
      if (chevronIcon) {
        if (!isExpanding) {
          // Now collapsed
          chevronIcon.innerHTML =
            '<polyline points="18 15 12 9 6 15"></polyline>';
        } else {
          // Now expanded
          chevronIcon.innerHTML =
            '<polyline points="6 9 12 15 18 9"></polyline>';
        }
      }

      // Toggle visibility of bottom controls when expanded/collapsed
      if (
        window.statusFooterFunctions &&
        window.statusFooterFunctions.toggleBottomControls
      ) {
        window.statusFooterFunctions.toggleBottomControls(!isExpanding);
        console.log(
          `Bottom controls visibility set to: ${
            !isExpanding ? "visible" : "hidden"
          }`
        );
      } else {
        console.warn(
          "statusFooterFunctions.toggleBottomControls is not available"
        );
      }
    });

    // Start data updates - either demo or real
    startDataUpdates();
  } else {
    console.log("Elements not ready yet, will retry");
    setTimeout(setupStatusFooter, 200); // Try again shortly
  }
}

// Add the coordinate format switcher function
function setupCoordinateFormatSwitcher() {
  // Global coordinate format (0 = decimal degrees, 1 = degrees minutes seconds, 2 = degrees decimal minutes)
  if (typeof window.currentCoordFormat === "undefined") {
    window.currentCoordFormat = 0;
  }

  const formatSwitchBtn = document.getElementById("coord-format-switch");
  if (formatSwitchBtn) {
    formatSwitchBtn.addEventListener("click", function (e) {
      // Stop event propagation to prevent the status bar toggle from being triggered
      e.stopPropagation();

      // Cycle through formats (0 -> 1 -> 2 -> 0)
      window.currentCoordFormat = (window.currentCoordFormat + 1) % 3;

      // Get the current data from the elements
      const longitudeElem = document.querySelector(".coord-value.longitude");
      const latitudeElem = document.querySelector(".coord-value.latitude");

      if (longitudeElem && latitudeElem) {
        // Extract raw decimal values
        const rawLongitude = parseFloat(
          longitudeElem.getAttribute("data-raw") || 14.2229296
        );
        const rawLatitude = parseFloat(
          latitudeElem.getAttribute("data-raw") || 46.626328
        );

        // Update display with formatted values
        longitudeElem.textContent = formatCoordinate(
          rawLongitude,
          window.currentCoordFormat
        );
        latitudeElem.textContent = formatCoordinate(
          rawLatitude,
          window.currentCoordFormat
        );
      }
    });
  }
}

// Make sure the footer loads after the page is ready
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    //loadStatusFooter();
  }, 500); // Short delay to ensure the page is fully loaded
});

function devInit() {
  reha.setDebugMode(true);
  //interface.setBasemapUrl('http://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png');

  // Load the status footer
  //loadStatusFooter();
}
