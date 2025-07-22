/**
 * UI controls management
 * @namespace App.UI.Controls
 */
App.UI = App.UI || {};
App.UI.Controls = (function () {
  // Private variables
  var _map = null;
  var _controlsAdded = false;

  // Public API
  return {
    /**
     * Initialize UI controls
     * @param {Object} map - The MapLibre map instance
     */
    initialize: function (map) {
      _map = map;
      console.log("UI controls initialized");
    },

    /**
     * Create a feature toggle control panel
     * @returns {Object} The feature toggle control
     */
    createFeatureToggleControl: function () {
      var FeatureToggleControl = function () {
        this.onAdd = function (map) {
          this._map = map;
          this._container = document.createElement("div");

          // Add some basic inline styles to ensure visibility
          this._container.style.position = "absolute";
          this._container.style.top = "10px";
          this._container.style.right = "10px";
          this._container.style.padding = "10px";
          this._container.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
          this._container.style.borderRadius = "5px";
          this._container.style.zIndex = "999"; // Ensure the control appears on top of other elements
          this._container.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.3)";
          this._container.style.width = "180px";
          this._container.style.color = "#333";

          this._container.innerHTML = `
                <div class="toggle-container">
                    <label>Show Zoom</label>
                    <label class="switch">
                        <input type="checkbox" id="toggle-zoom" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="toggle-container">
                    <label>Show Navigation</label>
                    <label class="switch">
                        <input type="checkbox" id="toggle-navigation" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="toggle-container">
                    <label>Allow Rotate</label>
                    <label class="switch">
                        <input type="checkbox" id="toggle-rotate" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="toggle-container">
                    <label>Allow Pitch</label>
                    <label class="switch">
                        <input type="checkbox" id="toggle-pitch" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
            `;

          console.log("FeatureToggleControl is added to the map.");

          // Attach listeners after the DOM is created
          setTimeout(() => {
            const zoomControl = new ZoomControl();
            const navControl = new maplibregl.NavigationControl({
              visualizePitch: true,
              visualizeRoll: true,
              showZoom: false,
              showCompass: true,
            });

            // Zoom toggle
            document
              .getElementById("toggle-zoom")
              .addEventListener("change", (e) => {
                if (e.target.checked) {
                  this._map.addControl(zoomControl, "top-right");
                } else {
                  this._map.removeControl(zoomControl);
                }
              });

            // Navigation toggle
            document
              .getElementById("toggle-navigation")
              .addEventListener("change", (e) => {
                if (e.target.checked) {
                  this._map.addControl(navControl, "top-left");
                } else {
                  this._map.removeControl(navControl);
                }
              });

            // Rotate toggle
            document
              .getElementById("toggle-rotate")
              .addEventListener("change", (e) => {
                if (e.target.checked) {
                  this._map.dragRotate.enable();
                } else {
                  this._map.dragRotate.disable();
                }
              });

            // Pitch toggle
            document
              .getElementById("toggle-pitch")
              .addEventListener("change", (e) => {
                if (e.target.checked) {
                  this._map.touchPitch.enable();
                } else {
                  this._map.touchPitch.disable();
                }
              });

            console.log("Event listeners attached successfully.");
          }, 0);

          return this._container;
        };

        this.onRemove = function () {
          this._container.parentNode.removeChild(this._container);
          this._map = undefined;
        };
      };

      return new FeatureToggleControl();
    },

    /**
     * Create a status band control
     * @param {string} projectName - Project name to display
     * @returns {Object} The status band control
     */
    createStatusBandControl: function (projectName = "Project Name") {
      var StatusBandControl = function (projectName) {
        this.onAdd = function (map) {
          this._map = map;
          this._container = document.createElement("div");
          this._container.id = "status-band";
          this._container.className = "status-band-control";

          // Critical positioning styles
          this._container.style.position = "absolute";
          this._container.style.top = "0";
          this._container.style.left = "0";
          this._container.style.width = "100%";
          this._container.style.margin = "0";
          this._container.style.padding = "3px 4px";

          // Appearance styles
          this._container.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
          this._container.style.color = "#000";
          this._container.style.fontFamily = "Roboto, sans-serif";
          this._container.style.fontSize = "12px";
          this._container.style.zIndex = "1000";
          this._container.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.1)";

          // Layout styles - Center the content
          this._container.style.display = "flex";
          this._container.style.justifyContent = "center";
          this._container.style.alignItems = "center";
          this._container.style.boxSizing = "border-box";

          // Project name centered with white halo
          this._projectNameElement = document.createElement("span");
          this._projectNameElement.id = "project-name";
          this._projectNameElement.textContent = projectName;
          this._projectNameElement.style.padding = "0 13px";
          
          // Add white halo effect using text-shadow
          this._projectNameElement.style.textShadow = `
            0 0 3px rgba(255, 255, 255, 0.8),
            0 0 6px rgba(255, 255, 255, 0.6),
            0 0 9px rgba(255, 255, 255, 0.4),
            1px 1px 2px rgba(255, 255, 255, 0.9),
            -1px -1px 2px rgba(255, 255, 255, 0.9),
            1px -1px 2px rgba(255, 255, 255, 0.9),
            -1px 1px 2px rgba(255, 255, 255, 0.9)
          `.trim();

          // GNSS Satellite Status
          this._gnssStatus = document.createElement("div");
          this._gnssStatus.id = "gnss-status";
          this._gnssStatus.style.display = "flex";
          this._gnssStatus.style.alignItems = "center";
          this._gnssStatus.style.gap = "25px";

          this._satelliteIcon = document.createElement("div");
          this._satelliteIcon.id = "satellite-icon";
          this._satelliteIcon.style.width = "24px";
          this._satelliteIcon.style.height = "24px";

          this._satelliteInfo = document.createElement("span");
          this._satelliteInfo.id = "satellite-info";
          this._satelliteInfo.textContent = "0/0"; // Default Used/Visible Satellites

          this._gnssStatus.appendChild(this._satelliteIcon);
          this._gnssStatus.appendChild(this._satelliteInfo);

          // Accuracy Status
          this._accuracyStatus = document.createElement("div");
          this._accuracyStatus.id = "accuracy-status";
          this._accuracyStatus.style.display = "flex";
          this._accuracyStatus.style.alignItems = "center";
          this._accuracyStatus.style.gap = "5px";

          this._accuracyIcon = document.createElement("div");
          this._accuracyIcon.id = "accuracy-icon";
          this._accuracyIcon.style.width = "24px";
          this._accuracyIcon.style.height = "24px";

          this._accuracyInfo = document.createElement("span");
          this._accuracyInfo.id = "accuracy-info";
          this._accuracyInfo.textContent = "V: 0.000 [m]  H: 0.000 [m]";
          this._accuracyInfo.style.whiteSpace = "nowrap";
          this._accuracyInfo.style.overflow = "hidden";
          this._accuracyInfo.style.textOverflow = "ellipsis";

          this._accuracyStatus.appendChild(this._accuracyIcon);
          this._accuracyStatus.appendChild(this._accuracyInfo);

          // Status info on the right
          this._statusInfoElement = document.createElement("span");
          this._statusInfoElement.id = "status-info";
          this._statusInfoElement.textContent = "";

          this._container.appendChild(this._projectNameElement);
          //this._container.appendChild(this._gnssStatus);
          //this._container.appendChild(this._accuracyStatus);
          //this._container.appendChild(this._statusInfoElement);

          return this._container;
        };

        this.onRemove = function () {
          this._container.parentNode.removeChild(this._container);
          this._map = undefined;
        };

        // Method to update the project name
        this.updateProjectName = function (projectName) {
          if (this._projectNameElement) {
            this._projectNameElement.textContent = projectName;
          }
        };

        // Method to update the status text
        this.updateStatus = function (statusText) {
          if (this._statusInfoElement) {
            this._statusInfoElement.textContent = statusText;
          }
        };

        // Method to update GNSS Satellite Count
        this.updateGnssStatus = function (usedSatellites, visibleSatellites) {
          if (this._satelliteInfo) {
            this._satelliteInfo.textContent = `${usedSatellites}/${visibleSatellites}`;
          }
        };

        // Method to update Accuracy Values
        this.updateAccuracyStatus = function (verticalAcc, horizontalAcc) {
          if (this._accuracyInfo) {
            this._accuracyInfo.textContent = `V: ${verticalAcc.toFixed(
              3
            )} / H: ${horizontalAcc.toFixed(3)}`;
          }
        };
      };

      return new StatusBandControl(projectName);
    },

    // Additional methods will be added here
  };
})();

console.log("app.ui.controls.js loaded - App.UI.Controls module created");
