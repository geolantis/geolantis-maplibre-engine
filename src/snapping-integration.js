// Create a toggle button for enabling/disabling snapping
function createSnapToggleButton() {
  // Remove any existing button
  const existingButton = document.getElementById("snap-toggle-button");
  if (existingButton) {
    existingButton.remove();
  }

  const button = document.createElement("button");
  button.id = "snap-toggle-button";
  button.textContent = "Loading...";
  button.disabled = true;
  button.style.position = "absolute";
  button.style.top = "75px"; // Higher position to avoid overlap
  button.style.left = "10px";
  button.style.zIndex = "999";
  button.style.padding = "8px 12px";
  button.style.backgroundColor = "#808080";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "4px";
  button.style.cursor = "pointer";
  button.style.fontFamily = "Roboto, sans-serif";
  button.style.fontWeight = "500";
  button.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
  button.style.transition = "background-color 0.3s";
  button.title = "Initializing...";

  // Add this line to hide the button initially
  button.style.display = "none";

  // Add the button to the page
  document.body.appendChild(button);

  // Add click event handler
  button.addEventListener("click", function () {
    if (button.disabled) return;

    if (!window.featureSnapper) {
      console.error("Feature snapper not initialized yet");
      return;
    }

    if (window.featureSnapper.options.active) {
      // Disable snapping
      window.featureSnapper.disable();
      button.textContent = "Enable Snapping";
      button.style.backgroundColor = "#4285f4";
      updateStatusMessage("Snapping disabled");
    } else {
      // Enable snapping
      window.featureSnapper.enable();
      button.textContent = "Disable Snapping";
      button.style.backgroundColor = "#0f9d58";
      updateStatusMessage("Snapping enabled - Click features to select");
    }
  });
}
