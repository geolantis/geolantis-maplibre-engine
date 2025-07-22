// Modified version of shoelace-bridge.js with null checking
document.addEventListener("DOMContentLoaded", function () {
  console.log("Initializing Shoelace bridge...");

  // Wait for Shoelace components to be ready
  function initShoelaceBridge() {
    // Check if all required Shoelace components are defined
    if (!customElements.get("sl-switch") || !customElements.get("sl-button")) {
      console.log("Waiting for Shoelace components to be defined...");
      setTimeout(initShoelaceBridge, 200);
      return;
    }

    console.log("Shoelace components ready, initializing bridge");

    // Get all sl-switch elements and add event handlers
    document.querySelectorAll("sl-switch").forEach((slSwitch) => {
      // Make sure the element is fully defined before proceeding
      if (!slSwitch || typeof slSwitch.addEventListener !== "function") {
        return;
      }

      // Find the original native checkbox element - ADD NULL CHECK HERE
      const originalId = slSwitch.id;
      const originalCheckbox = originalId
        ? document.querySelector(`input[type="checkbox"]#${originalId}`)
        : null;

      // If there's a corresponding native checkbox, synchronize them
      if (originalCheckbox) {
        console.log(`Found matching checkbox for sl-switch #${originalId}`);

        // Set initial state
        slSwitch.checked = originalCheckbox.checked;

        // Add event listeners to keep them in sync
        slSwitch.addEventListener("sl-change", function (e) {
          originalCheckbox.checked = e.target.checked;

          // Dispatch a native change event
          const nativeEvent = new Event("change", { bubbles: true });
          originalCheckbox.dispatchEvent(nativeEvent);
        });
      }
    });

    // Handle sl-button elements if needed
    // ...

    console.log("Shoelace bridge initialized successfully");
  }

  // Start initialization
  initShoelaceBridge();
});
