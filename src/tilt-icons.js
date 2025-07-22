/**
 * Add this as a new file called tilt-icons.js
 * Then import this file in your main JavaScript file after status-footer.js
 */

// Function to handle tilt icon updates
function updateTiltIcon(status) {
  // Find the container
  const container = document.querySelector(".tilt-status-icon-container");
  if (!container) {
    console.log("Tilt icon container not found");
    return;
  }

  // Default tooltip
  container.setAttribute("title", status || "Tilt Status");

  // Choose the appropriate SVG based on status
  let svgContent = "";

  if (status) {
    const statusLower = status.toLowerCase();

    if (statusLower.includes("calibrated") || statusLower.includes("active")) {
      // Active tilt SVG
      svgContent =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><circle cx="25" cy="25" r="24" fill="#e0e0e0" stroke="#a0a0a0" stroke-width="1.5"/><circle cx="40" cy="15" r="7" fill="#4285F4"/><circle cx="25" cy="25" r="2" fill="#707070"/><line x1="5" y1="25" x2="45" y2="25" stroke="#707070" stroke-width="1.5"/><line x1="25" y1="5" x2="25" y2="45" stroke="#707070" stroke-width="1.5"/></svg>';
    } else if (
      statusLower.includes("inactive") ||
      statusLower.includes("disabled")
    ) {
      // Inactive tilt SVG
      svgContent =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><circle cx="25" cy="25" r="24" fill="#e0e0e0" stroke="#a0a0a0" stroke-width="1.5"/><circle cx="40" cy="15" r="7" fill="#4285F4"/><circle cx="25" cy="25" r="2" fill="#707070"/><line x1="5" y1="25" x2="45" y2="25" stroke="#707070" stroke-width="1.5"/><line x1="25" y1="5" x2="25" y2="45" stroke="#707070" stroke-width="1.5"/><line x1="5" y1="5" x2="45" y2="45" stroke="#FF0000" stroke-width="3"/><line x1="45" y1="5" x2="5" y2="45" stroke="#FF0000" stroke-width="3"/></svg>';
    } else if (
      statusLower.includes("initializing") ||
      statusLower.includes("calibrating")
    ) {
      // Initializing tilt SVG - no animation to avoid issues
      svgContent =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><circle cx="25" cy="25" r="24" fill="#e0e0e0" stroke="#a0a0a0" stroke-width="1.5"/><circle cx="40" cy="15" r="7" fill="#4285F4"/><circle cx="25" cy="25" r="2" fill="#707070"/><line x1="5" y1="25" x2="45" y2="25" stroke="#707070" stroke-width="1.5" stroke-dasharray="2,2"/><line x1="25" y1="5" x2="25" y2="45" stroke="#707070" stroke-width="1.5" stroke-dasharray="2,2"/></svg>';
    }
  }

  // Set the SVG content
  container.innerHTML = svgContent;
}

// Patch the original updateStatusBar function to use our tilt icon
const originalUpdateStatusBar = window.updateStatusBar;
if (originalUpdateStatusBar) {
  window.updateStatusBar = function (data) {
    // Call the original function
    originalUpdateStatusBar(data);

    // Add our tilt icon update
    if (data && data.tiltStatus) {
      updateTiltIcon(data.tiltStatus);
    }
  };

  console.log("Tilt icon integration complete");
} else {
  console.warn("Original updateStatusBar function not found");
}

// Initialize with default icon
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    updateTiltIcon("Calibrated");
  }, 1000);
});
