// Integration code for StakeOut feature
document.addEventListener("DOMContentLoaded", function () {
  // Wait for the map and StakeOut module to be available
  function initStakeOutIntegration() {
    if (!App || !App.Features || !App.Features.StakeOut) {
      console.log("Waiting for StakeOut module to load...");
      setTimeout(initStakeOutIntegration, 500);
      return;
    }

    // Get map instance
    let map = null;
    if (App.Map && App.Map.Init && typeof App.Map.Init.getMap === "function") {
      map = App.Map.Init.getMap();
    } else if (window.interface && window.interface.map) {
      map = window.interface.map;
    }

    if (!map) {
      console.log("Waiting for map to initialize...");
      setTimeout(initStakeOutIntegration, 500);
      return;
    }

    console.log("Initializing StakeOut integration...");

    // Ensure the StakeOut module is initialized with the map
    if (typeof App.Features.StakeOut.initialize === "function") {
      App.Features.StakeOut.initialize(map);

      // Create and store UI instance if it doesn't exist
      if (!App.Features.StakeOut._ui) {
        App.Features.StakeOut._ui = new StakeOutUI();
      }

      console.log("StakeOut module initialized with map and UI");
    }

    // Add a button to activate stake out for the right2 drawer
    createStakeOutButton();

    // Add a listener for feature selection to validate feature type
    if (App.Core.Events) {
      App.Core.Events.on("feature:selected", function (feature) {
        // Show a hint if it's a supported type
        if (feature && App.Features.StakeOut.isFeatureTypeSupported(feature)) {
          showStakeOutHint();
        }
      });
    }

    console.log("StakeOut integration completed");
  }

  // Create a button for activating stake out
  function createStakeOutButton() {
    // Check if the right2 drawer exists
    const right2Drawer = document.getElementById("right2-drawer");
    if (!right2Drawer) {
      console.error("Right2 drawer not found for stake out button");
      return;
    }

    // Check if the button already exists
    if (document.getElementById("stake-out-button")) {
      return;
    }

    // Create the content if it doesn't exist
    if (!right2Drawer.querySelector(".drawer-content")) {
      const content = document.createElement("div");
      content.className = "drawer-content";
      content.innerHTML = `
          <div class="drawer-header">
            <h3>Stake Out</h3>
          </div>
          <div class="drawer-body">
            <sl-button id="stake-out-button" variant="primary" size="large">
              <sl-icon slot="prefix" name="geo-alt-fill"></sl-icon>
              Start Stake Out
            </sl-button>
            <div id="stake-out-info" style="margin-top: 15px; display: none;">
              <p>Select a feature on the map to stake out to.</p>
            </div>
          </div>
        `;
      right2Drawer.appendChild(content);
    } else {
      // Add just the button if the content exists
      const drawerBody =
        right2Drawer.querySelector(".drawer-body") || right2Drawer;

      const button = document.createElement("sl-button");
      button.id = "stake-out-button";
      button.setAttribute("variant", "primary");
      button.setAttribute("size", "large");
      button.innerHTML = `
          <sl-icon slot="prefix" name="geo-alt-fill"></sl-icon>
          Start Stake Out
        `;

      drawerBody.appendChild(button);

      const infoDiv = document.createElement("div");
      infoDiv.id = "stake-out-info";
      infoDiv.style.marginTop = "15px";
      infoDiv.style.display = "none";
      infoDiv.innerHTML = "<p>Select a feature on the map to stake out to.</p>";

      drawerBody.appendChild(infoDiv);
    }

    // Add event listener to the button
    document
      .getElementById("stake-out-button")
      .addEventListener("click", function () {
        const success = App.Features.StakeOut.startStakeOutForLastFeature();

        // If successful, update button state
        if (success) {
          this.innerHTML = `
            <sl-icon slot="prefix" name="stop-circle"></sl-icon>
            Stop Stake Out
          `;
          this.setAttribute("variant", "danger");

          // Toggle the drawer open if it's not already
          if (right2Drawer.open === false) {
            right2Drawer.show();
          }
        }
      });
  }

  // Show a hint about stake out when a feature is selected
  function showStakeOutHint() {
    const infoDiv = document.getElementById("stake-out-info");
    if (infoDiv) {
      infoDiv.innerHTML =
        "<p>Polygon feature selected. Click Start Stake Out to navigate to this feature.</p>";
      infoDiv.style.display = "block";

      // Add a highlight effect
      infoDiv.style.animation = "pulse 1.5s ease-in-out";

      // Create style if it doesn't exist
      if (!document.getElementById("stake-out-hint-style")) {
        const style = document.createElement("style");
        style.id = "stake-out-hint-style";
        style.textContent = `
            @keyframes pulse {
              0% { background-color: transparent; }
              50% { background-color: rgba(70, 130, 180, 0.2); }
              100% { background-color: transparent; }
            }
          `;
        document.head.appendChild(style);
      }

      // Open the right drawer if not open
      const right2Drawer = document.getElementById("right2-drawer");
      if (right2Drawer && !right2Drawer.open) {
        right2Drawer.show();
      }
    }
  }

  // Start initialization with a delay to make sure everything is loaded
  setTimeout(initStakeOutIntegration, 1000);
});

// Define a cleanup function for the StakeOut feature
App.Features = App.Features || {};
App.Features.StakeOut = App.Features.StakeOut || {};

// Add stop function if it doesn't exist
if (!App.Features.StakeOut.stopStakeOut) {
  App.Features.StakeOut.stopStakeOut = function () {
    if (typeof this.cleanup === "function") {
      this.cleanup();
    }

    // Reset UI state
    if (this._ui) {
      this._ui.cleanup();
    }

    // Reset button state
    const button = document.getElementById("stake-out-button");
    if (button) {
      button.innerHTML = `
          <sl-icon slot="prefix" name="geo-alt-fill"></sl-icon>
          Start Stake Out
        `;
      button.setAttribute("variant", "primary");
    }

    // Hide info div
    const infoDiv = document.getElementById("stake-out-info");
    if (infoDiv) {
      infoDiv.style.display = "none";
    }

    // Trigger event
    if (App.Core.Events) {
      App.Core.Events.trigger("stakeout:stopped", {});
    }

    return true;
  };
}

console.log("StakeOut UI integration code loaded");
