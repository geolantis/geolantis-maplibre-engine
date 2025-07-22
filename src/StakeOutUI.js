// StakeOutUI.js
class StakeOutUI {
  constructor() {
    this.arrowContainer = null;
    this.totalElement = null;
    this.arrowElements = {};
    this.isInitialActivation = true; // Track if this is the first activation
    this.manuallyCollapsed = false; // Track if user manually closed the sidebar
    this.modeToggleContainer = null; // Container for the mode toggle
  }

  // Create or find the arrow container with cleaner styling
  createArrowContainer() {
    let arrowContainer = document.getElementById("arrow-container");
    if (!arrowContainer) {
      arrowContainer = document.createElement("div");
      arrowContainer.id = "arrow-container";
      arrowContainer.style.display = "flex";
      arrowContainer.style.flexDirection = "column";
      arrowContainer.style.alignItems = "center";
      arrowContainer.style.justifyContent = "center";
      // Remove the border and background styling
      arrowContainer.style.backgroundColor = "transparent";
      arrowContainer.style.boxShadow = "none";
      arrowContainer.style.border = "none";

      // Append the container to the right2 sidebar if it exists
      const right2Sidebar = document.getElementById("right2");
      if (right2Sidebar) {
        right2Sidebar.appendChild(arrowContainer);
      } else {
        // Alternative: append to body if sidebar isn't found
        document.body.appendChild(arrowContainer);
        arrowContainer.style.position = "absolute";
        arrowContainer.style.bottom = "20px";
        arrowContainer.style.right = "20px";
        arrowContainer.style.zIndex = "1000";
      }
    }
    this.arrowContainer = arrowContainer;
    
    // Create mode toggle if it doesn't exist
    if (!this.modeToggleContainer) {
      this.createModeToggle();
    }
    
    return arrowContainer;
  }

  // Create the navigation mode toggle
  createModeToggle() {
    if (this.modeToggleContainer) return;
    
    console.log("Creating stakeout mode toggle");
    
    // Create container for the toggle
    this.modeToggleContainer = document.createElement("div");
    this.modeToggleContainer.id = "stakeout-mode-toggle";
    this.modeToggleContainer.style.display = "flex";
    this.modeToggleContainer.style.flexDirection = "column";
    this.modeToggleContainer.style.alignItems = "center";
    this.modeToggleContainer.style.margin = "20px 10px";
    this.modeToggleContainer.style.padding = "15px";
    this.modeToggleContainer.style.backgroundColor = "rgba(70, 130, 180, 0.2)";
    this.modeToggleContainer.style.borderRadius = "8px";
    this.modeToggleContainer.style.border = "1px solid rgba(70, 130, 180, 0.5)";
    this.modeToggleContainer.style.backdropFilter = "blur(5px)";
    
    // Create label
    const label = document.createElement("div");
    label.style.color = "white";
    label.style.fontSize = "14px";
    label.style.fontWeight = "bold";
    label.style.marginBottom = "10px";
    label.style.textShadow = "0px 0px 5px rgba(0, 0, 0, 0.8)";
    label.textContent = "Navigation Mode";
    
    // Create toggle switch using Shoelace
    const toggle = document.createElement("sl-switch");
    toggle.id = "stakeoutModeToggle";
    toggle.size = "large";
    toggle.style.setProperty("--width", "80px");
    toggle.style.setProperty("--height", "32px");
    toggle.style.setProperty("--thumb-size", "26px");
    
    // Create labels for the toggle
    const toggleWrapper = document.createElement("div");
    toggleWrapper.style.display = "flex";
    toggleWrapper.style.alignItems = "center";
    toggleWrapper.style.gap = "10px";
    
    const segmentLabel = document.createElement("span");
    segmentLabel.style.color = "white";
    segmentLabel.style.fontSize = "14px";
    segmentLabel.style.fontWeight = toggle.checked ? "normal" : "bold";
    segmentLabel.style.textShadow = "0px 0px 5px rgba(0, 0, 0, 0.8)";
    segmentLabel.textContent = "Segments";
    
    const nodeLabel = document.createElement("span");
    nodeLabel.style.color = "white";
    nodeLabel.style.fontSize = "14px";
    nodeLabel.style.fontWeight = toggle.checked ? "bold" : "normal";
    nodeLabel.style.textShadow = "0px 0px 5px rgba(0, 0, 0, 0.8)";
    nodeLabel.textContent = "Nodes";
    
    // Get current mode from state
    let currentMode = "segments";
    if (typeof App !== "undefined" && App.Core && App.Core.State) {
      currentMode = App.Core.State.get("stakeout.navigationMode") || "segments";
    }
    toggle.checked = currentMode === "nodes";
    
    // Update label weights based on initial state
    segmentLabel.style.fontWeight = currentMode === "segments" ? "bold" : "normal";
    nodeLabel.style.fontWeight = currentMode === "nodes" ? "bold" : "normal";
    
    // Add event listener for toggle changes
    toggle.addEventListener("sl-change", (event) => {
      const mode = event.target.checked ? "nodes" : "segments";
      
      // Update label weights
      segmentLabel.style.fontWeight = mode === "segments" ? "bold" : "normal";
      nodeLabel.style.fontWeight = mode === "nodes" ? "bold" : "normal";
      
      // Call the stakeout module to change mode
      if (App.Features.StakeOut && App.Features.StakeOut.setNavigationMode) {
        App.Features.StakeOut.setNavigationMode(mode);
      }
    });
    
    // Assemble the toggle wrapper
    toggleWrapper.appendChild(segmentLabel);
    toggleWrapper.appendChild(toggle);
    toggleWrapper.appendChild(nodeLabel);
    
    // Assemble the container
    this.modeToggleContainer.appendChild(label);
    this.modeToggleContainer.appendChild(toggleWrapper);
    
    // Insert at the beginning of arrow container
    const arrowContainer = this.arrowContainer || this.createArrowContainer();
    arrowContainer.insertBefore(this.modeToggleContainer, arrowContainer.firstChild);
    
    console.log("Mode toggle added to arrow container", this.modeToggleContainer);
  }

  // Create or update the total distance element with cleaner styling
  updateTotalDistance(distance) {
    const formattedDistance = `Total: ${distance.toFixed(2)} m`;

    if (!this.totalElement) {
      this.totalElement = document.createElement("div");
      this.totalElement.id = "total-distance";
      this.totalElement.style.textAlign = "center";
      this.totalElement.style.margin = "10px";
      this.totalElement.style.padding = "8px 12px";
      // Remove background and box-shadow
      this.totalElement.style.backgroundColor = "transparent";
      this.totalElement.style.color = "white";
      this.totalElement.style.fontWeight = "bold";
      this.totalElement.style.boxShadow = "none";
      this.totalElement.style.textShadow =
        "0px 0px 10px rgba(255, 255, 255, 1), 0px 0px 5px rgba(0, 0, 0, 0.8)";
      this.createArrowContainer().appendChild(this.totalElement);
    }

    this.totalElement.textContent = formattedDistance;
  }

  // Update or create an arrow element with cleaner styling
  updateArrow(id, distance, rotation) {
    // Calculate arrow size as 1/4 of the screen height
    const arrowSize = window.innerHeight / 3 + "px";

    // Halo effect CSS
    const haloEffect = "0px 0px 12px rgba(70, 130, 180, 0.8)";

    let arrowElement = document.getElementById(id);
    if (!arrowElement) {
      arrowElement = document.createElement("div");
      arrowElement.id = id;
      arrowElement.style.textAlign = "center";
      arrowElement.style.margin = "12px";
      arrowElement.style.display = "flex";
      arrowElement.style.flexDirection = "column";
      arrowElement.style.alignItems = "center";
      arrowElement.style.justifyContent = "center";
      // Remove background, border, and box-shadow
      arrowElement.style.backgroundColor = "transparent";
      arrowElement.style.border = "none";
      arrowElement.style.boxShadow = "none";
      arrowElement.style.padding = "5px";
      this.createArrowContainer().appendChild(arrowElement);
      this.arrowElements[id] = arrowElement;
    }

    // Add the rotated SVG and the distance below it
    arrowElement.innerHTML = `
        <div style="transform: rotate(${rotation}deg); width: ${arrowSize}; height: ${arrowSize}; filter: drop-shadow(${haloEffect}); pointer-events: none;">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#4682b4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-left-dash">
            <path d="M19 15V9"/>
            <path d="M15 15h-3v4l-7-7 7-7v4h3v6z"/>
          </svg>
        </div>
        <div style="font-size: 24px; margin-top:6px; text-shadow: 0px 0px 10px rgba(255, 255, 255, 1), 0px 0px 5px rgba(0, 0, 0, 0.8); color: white; font-weight: bold; pointer-events: none;">
          ${distance}
        </div>`;
  }

  // Listen for sidebar toggle events to detect manual closing
  setupSidebarListener() {
    // Find the sidebar toggle button
    const sidebarToggle = document.querySelector(".sidebar-toggle.right2");
    if (sidebarToggle && !this.listenerSetup) {
      sidebarToggle.addEventListener("click", () => {
        const sidebar = document.getElementById("right2");
        if (sidebar && !sidebar.classList.contains("collapsed")) {
          // User manually closed the sidebar
          this.manuallyCollapsed = true;
        } else {
          // User manually opened the sidebar
          this.manuallyCollapsed = false;
        }
      });
      this.listenerSetup = true;
    }
  }

  // Display directional arrows to guide navigation
  displayDirectionalArrows(currentLocation, targetLocation, directDistance) {
    // Set up the sidebar listener if not already done
    if (!this.listenerSetup) {
      this.setupSidebarListener();
    }

    // Only open the sidebar on initial activation, not on every location update
    const right2Sidebar = document.getElementById("right2");
    if (right2Sidebar && this.isInitialActivation && !this.manuallyCollapsed) {
      if (
        typeof window.interface !== "undefined" &&
        window.interface.toggleSidebar &&
        right2Sidebar.classList.contains("collapsed")
      ) {
        window.interface.toggleSidebar("right2");
      }
      this.isInitialActivation = false;
    }

    // Create the arrow container if it doesn't exist
    this.createArrowContainer();

    // Update the total distance
    this.updateTotalDistance(directDistance);

    // Decompose the current and target coordinates
    const [currentLng, currentLat, currentAlt = 0] = currentLocation;
    const [targetLng, targetLat, targetAlt = 0] = targetLocation;

    // Calculate x, y, and z distances using turf.js
    const xDistanceMeters = turf.distance(
      turf.point([currentLng, currentLat]),
      turf.point([targetLng, currentLat]), // Only change longitude (east-west)
      { units: "meters" }
    );

    const yDistanceMeters = turf.distance(
      turf.point([currentLng, currentLat]),
      turf.point([currentLng, targetLat]), // Only change latitude (north-south)
      { units: "meters" }
    );

    const zDistanceMeters = targetAlt - currentAlt; // Z is the difference in altitude

    // Format the distance (always in meters with 2 decimal places)
    const formatDistanceMeters = (distance) => `${distance.toFixed(2)} m`;

    // Format the distances
    const xDistanceFormatted = formatDistanceMeters(xDistanceMeters);
    const yDistanceFormatted = formatDistanceMeters(yDistanceMeters);
    const zDistanceFormatted =
      zDistanceMeters === 0
        ? "- (no Z)"
        : formatDistanceMeters(Math.abs(zDistanceMeters));

    // X arrow - east or west
    const xArrowRotation = targetLng > currentLng ? 180 : 0; // Rotate for east (180 degrees) or west (0 degrees)
    this.updateArrow("x-arrow", xDistanceFormatted, xArrowRotation);

    // Y arrow - north or south
    const yArrowRotation = targetLat > currentLat ? 90 : -90; // Rotate for north (90 degrees) or south (-90 degrees)
    this.updateArrow("y-arrow", yDistanceFormatted, yArrowRotation);

    // Z arrow - up or down (altitude)
    const zArrowRotation = targetAlt > currentAlt ? -45 : 45; // Rotate for up (-45 degrees) or down (45 degrees)
    this.updateArrow("z-arrow", zDistanceFormatted, zArrowRotation);
  }

  // Method to reset the initial activation state when StakeOut is manually activated
  resetActivationState() {
    this.isInitialActivation = true;
    this.manuallyCollapsed = false;
  }

  // Clean up resources
  cleanup() {
    const arrowContainer = document.getElementById("arrow-container");
    if (arrowContainer) {
      arrowContainer.remove();
    }
    this.arrowContainer = null;
    this.totalElement = null;
    this.arrowElements = {};
    this.modeToggleContainer = null;

    // Reset state
    this.isInitialActivation = true;
    this.manuallyCollapsed = false;
    this.listenerSetup = false;
  }
}

// Export the class
if (typeof module !== "undefined" && module.exports) {
  module.exports = StakeOutUI;
}
