/**
 * Command Line Extension for Button Control - Fixed Version
 * Directly extends the processCommand function in commandline-interface.js
 */

(function () {
  console.log("[CommandLine Extension] Initializing...");

  // Initialize when document is loaded
  function init() {
    console.log(
      "[CommandLine Extension] Document ready, waiting for command line..."
    );
    waitForCommandLine();
  }

  // Wait for command line to be available
  function waitForCommandLine() {
    if (window.mapConsole && window.mapConsole._commandLineInstance) {
      console.log(
        "[CommandLine Extension] Command line found, extending functionality..."
      );
      extendCommandLine();
      return;
    }

    console.log("[CommandLine Extension] Waiting for command line...");
    setTimeout(waitForCommandLine, 500);
  }

  // Extend command line functionality
  function extendCommandLine() {
    const commandLineInstance = window.mapConsole._commandLineInstance;
    
    // Store original processCommand function
    const originalProcessCommand = commandLineInstance.processCommand.bind(commandLineInstance);

    // Override with extended version
    commandLineInstance.processCommand = function (command) {
      const parts = command.split(" ");
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      // Handle our custom commands
      if (cmd === "buttons" || cmd === "button") {
        handleButtonCommand(args);
        return;
      } else if (cmd === "snap") {
        handleSnapCommand(args);
        return;
      } else if (cmd === "help") {
        // Call original help
        originalProcessCommand(command);
        // Add our help
        showExtendedHelp();
        return;
      }

      // Forward to original handler for other commands
      try {
        originalProcessCommand(command);
      } catch (error) {
        if (window.mapConsole) {
          window.mapConsole.addOutput(
            `Error processing command: ${error.message}`,
            "#ff0000"
          );
        } else {
          console.error("Error processing command:", error);
        }
      }
    };

    // Register our commands with the mapConsole if available
    if (window.mapConsole && window.mapConsole.helpText) {
      registerCommandsInHelp();
    }

    console.log("[CommandLine Extension] Command line extension ready");
  }

  // Register our commands in the help text
  function registerCommandsInHelp() {
    const buttonCommands = `
Available button commands:
buttons list       - List all control buttons and their status
buttons show all   - Show all available buttons
buttons hide all   - Hide all control buttons
buttons show gnss  - Show GNSS simulator button
buttons hide gnss  - Hide GNSS simulator button
buttons show snap  - Show snapping button
buttons hide snap  - Hide snapping button

Snapping commands:
snap enable        - Enable snapping and show button
snap disable       - Disable snapping
snap toggle        - Toggle snapping state
snap status        - Check snapping status
`;

    // Add to existing help text if possible
    if (
      window.mapConsole &&
      typeof window.mapConsole.addOutput === "function"
    ) {
      window.mapConsole.addOutput(buttonCommands, "#00ff00");
    }
  }

  // Show extended help in command line
  function showExtendedHelp() {
    const extendedHelp = `
Button Control Commands:
buttons        - Button visibility control (use 'buttons help' for details)
snap           - Snapping functionality control (use 'snap help' for details)
`;

    if (
      window.mapConsole &&
      typeof window.mapConsole.addOutput === "function"
    ) {
      window.mapConsole.addOutput(extendedHelp, "#00ff00");
    }
  }

  // Handle button command
  function handleButtonCommand(args) {
    if (args.length === 0 || args[0] === "help") {
      window.mapConsole.addOutput(
        `
Button Control Commands:
buttons list       - List all control buttons and their status
buttons show all   - Show all available buttons
buttons hide all   - Hide all control buttons
buttons show gnss  - Show GNSS simulator button
buttons hide gnss  - Hide GNSS simulator button
buttons show snap  - Show snapping button
buttons hide snap  - Hide snapping button
`,
        "#00ff00"
      );
      return;
    }

    const action = args[0].toLowerCase();
    const target = args.length > 1 ? args[1].toLowerCase() : "";

    switch (action) {
      case "list":
        listButtons();
        break;

      case "show":
        if (target === "all") {
          showAllButtons();
        } else if (target === "gnss") {
          showGnssButton();
        } else if (target === "snap") {
          showSnapButton();
        } else {
          window.mapConsole.addOutput(
            `Unknown button type: ${target}. Use 'buttons help' for available commands.`,
            "#ff0000"
          );
        }
        break;

      case "hide":
        if (target === "all") {
          hideAllButtons();
        } else if (target === "gnss") {
          hideGnssButton();
        } else if (target === "snap") {
          hideSnapButton();
        } else {
          window.mapConsole.addOutput(
            `Unknown button type: ${target}. Use 'buttons help' for available commands.`,
            "#ff0000"
          );
        }
        break;

      default:
        window.mapConsole.addOutput(
          `Unknown button command: ${action}. Use 'buttons help' for available commands.`,
          "#ff0000"
        );
    }
  }

  // Handle snap command
  function handleSnapCommand(args) {
    if (args.length === 0 || args[0] === "help") {
      window.mapConsole.addOutput(
        `
Snapping Control Commands:
snap help      - Show this help
snap enable    - Enable snapping and show the snapping button
snap disable   - Disable snapping
snap toggle    - Toggle snapping state
snap status    - Show current snapping status
`,
        "#00ff00"
      );
      return;
    }

    const action = args[0].toLowerCase();

    switch (action) {
      case "enable":
        enableSnapping();
        break;

      case "disable":
        disableSnapping();
        break;

      case "toggle":
        toggleSnapping();
        break;

      case "status":
        showSnappingStatus();
        break;

      default:
        window.mapConsole.addOutput(
          `Unknown snap command: ${action}. Use 'snap help' for available commands.`,
          "#ff0000"
        );
    }
  }

  // List all available buttons and their status
  function listButtons() {
    const gnssButton = document.getElementById("gnss-simulator-button");
    const snapButton = document.getElementById("snap-toggle-button");

    let buttonInfo = "Control Buttons Status:\n";

    buttonInfo += `GNSS Simulator: ${
      gnssButton
        ? isElementVisible(gnssButton)
          ? "Visible"
          : "Hidden"
        : "Not created"
    }\n`;
    buttonInfo += `Snapping: ${
      snapButton
        ? isElementVisible(snapButton)
          ? "Visible"
          : "Hidden"
        : "Not created"
    }\n`;

    // Add GNSS simulator status if available
    if (window.GNSSSimulator) {
      buttonInfo += `GNSS Simulator Status: ${
        window.GNSSSimulator.active ? "Active" : "Inactive"
      }\n`;
    }

    // Add snapping status if available
    if (window.featureSnapper) {
      buttonInfo += `Snapping Status: ${
        window.featureSnapper.options.active ? "Active" : "Inactive"
      }\n`;
    }

    window.mapConsole.addOutput(buttonInfo, "#00ff00");
  }

  // Check if element is visible
  function isElementVisible(element) {
    return window.getComputedStyle(element).display !== "none";
  }

  // Show all buttons
  function showAllButtons() {
    let result = "";

    try {
      showGnssButton();
      result += "GNSS button shown. ";
    } catch (e) {
      result += `Error showing GNSS button: ${e.message}. `;
    }

    try {
      showSnapButton();
      result += "Snapping button shown.";
    } catch (e) {
      result += `Error showing snapping button: ${e.message}.`;
    }

    window.mapConsole.addOutput(result, "#00ff00");
  }

  // Hide all buttons
  function hideAllButtons() {
    let result = "";

    try {
      hideGnssButton();
      result += "GNSS button hidden. ";
    } catch (e) {
      result += `Error hiding GNSS button: ${e.message}. `;
    }

    try {
      hideSnapButton();
      result += "Snapping button hidden.";
    } catch (e) {
      result += `Error hiding snapping button: ${e.message}.`;
    }

    window.mapConsole.addOutput(result, "#00ff00");
  }

  // Show GNSS button
  function showGnssButton() {
    // If button controller exists, use it
    if (
      window.buttonController &&
      typeof window.buttonController.showGnssButton === "function"
    ) {
      window.buttonController.showGnssButton();
      window.mapConsole.addOutput(
        "GNSS button shown using button controller",
        "#00ff00"
      );
      return;
    }

    // Otherwise, create or show the button manually
    let button = document.getElementById("gnss-simulator-button");

    if (!button) {
      // Create a new button if it doesn't exist
      button = document.createElement("button");
      button.id = "gnss-simulator-button";
      button.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="2"></circle>
                <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path>
              </svg>
            `;
      button.title = "Toggle GNSS Simulator (Ctrl+G)";
      button.style.position = "fixed";
      button.style.bottom = "110px";
      button.style.right = "10px";
      button.style.width = "40px";
      button.style.height = "40px";
      button.style.borderRadius = "50%";
      button.style.backgroundColor =
        window.GNSSSimulator && window.GNSSSimulator.active
          ? "#F44336"
          : "#4CAF50";
      button.style.color = "white";
      button.style.border = "none";
      button.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
      button.style.cursor = "pointer";
      button.style.zIndex = "900";
      button.style.display = "flex";
      button.style.justifyContent = "center";
      button.style.alignItems = "center";

      // Add click event
      button.addEventListener("click", () => {
        if (window.GNSSSimulator) {
          if (window.GNSSSimulator.active) {
            window.GNSSSimulator.stop();
          } else {
            window.GNSSSimulator.start(window.interface.map);
          }
        }
      });

      document.body.appendChild(button);
      window.mapConsole.addOutput("GNSS button created and shown", "#00ff00");
    } else {
      // Show existing button
      button.style.display = "flex";
      // Remove any CSS classes that might be hiding it
      button.classList.add("force-show");
      window.mapConsole.addOutput("Existing GNSS button shown", "#00ff00");
    }
  }

  // Hide GNSS button
  function hideGnssButton() {
    // If button controller exists, use it
    if (
      window.buttonController &&
      typeof window.buttonController.hideGnssButton === "function"
    ) {
      window.buttonController.hideGnssButton();
      window.mapConsole.addOutput(
        "GNSS button hidden using button controller",
        "#00ff00"
      );
      return;
    }

    // Otherwise, hide the button manually
    const button = document.getElementById("gnss-simulator-button");
    if (button) {
      button.style.display = "none";
      // Remove any CSS classes that might be showing it
      button.classList.remove("force-show");
      window.mapConsole.addOutput("GNSS button hidden", "#00ff00");
    } else {
      window.mapConsole.addOutput("GNSS button not found", "#ffaa00");
    }
  }

  // Show snapping button
  function showSnapButton() {
    // If button controller exists, use it
    if (
      window.buttonController &&
      typeof window.buttonController.showSnappingButton === "function"
    ) {
      window.buttonController.showSnappingButton();
      window.mapConsole.addOutput(
        "Snapping button shown using button controller",
        "#00ff00"
      );
      return;
    }

    // Otherwise, show the button manually
    const button = document.getElementById("snap-toggle-button");
    if (button) {
      button.style.display = "block";
      // Add force-show class if it exists in our CSS
      button.classList.add("force-show");
      window.mapConsole.addOutput("Snapping button shown", "#00ff00");
    } else {
      window.mapConsole.addOutput(
        "Snapping button not found. Initialize snapping first.",
        "#ffaa00"
      );
    }
  }

  // Hide snapping button
  function hideSnapButton() {
    // If button controller exists, use it
    if (
      window.buttonController &&
      typeof window.buttonController.hideSnappingButton === "function"
    ) {
      window.buttonController.hideSnappingButton();
      window.mapConsole.addOutput(
        "Snapping button hidden using button controller",
        "#00ff00"
      );
      return;
    }

    // Otherwise, hide the button manually
    const button = document.getElementById("snap-toggle-button");
    if (button) {
      button.style.display = "none";
      // Remove force-show class if it exists in our CSS
      button.classList.remove("force-show");
      window.mapConsole.addOutput("Snapping button hidden", "#00ff00");
    } else {
      window.mapConsole.addOutput("Snapping button not found", "#ffaa00");
    }
  }

  // Enable snapping functionality
  function enableSnapping() {
    if (!window.featureSnapper) {
      window.mapConsole.addOutput(
        "Feature snapper not initialized yet",
        "#ff0000"
      );
      return;
    }

    try {
      window.featureSnapper.enable();
      showSnapButton();
      window.mapConsole.addOutput("Snapping enabled", "#00ff00");

      // Update button text if visible
      const button = document.getElementById("snap-toggle-button");
      if (button) {
        button.textContent = "Disable Snapping";
        button.style.backgroundColor = "#0f9d58";
      }
    } catch (e) {
      window.mapConsole.addOutput(
        `Error enabling snapping: ${e.message}`,
        "#ff0000"
      );
    }
  }

  // Disable snapping functionality
  function disableSnapping() {
    if (!window.featureSnapper) {
      window.mapConsole.addOutput(
        "Feature snapper not initialized yet",
        "#ff0000"
      );
      return;
    }

    try {
      window.featureSnapper.disable();
      window.mapConsole.addOutput("Snapping disabled", "#00ff00");

      // Update button text if visible
      const button = document.getElementById("snap-toggle-button");
      if (button) {
        button.textContent = "Enable Snapping";
        button.style.backgroundColor = "#4285f4";
      }
    } catch (e) {
      window.mapConsole.addOutput(
        `Error disabling snapping: ${e.message}`,
        "#ff0000"
      );
    }
  }

  // Toggle snapping state
  function toggleSnapping() {
    if (!window.featureSnapper) {
      window.mapConsole.addOutput(
        "Feature snapper not initialized yet",
        "#ff0000"
      );
      return;
    }

    try {
      if (window.featureSnapper.options.active) {
        disableSnapping();
      } else {
        enableSnapping();
      }
    } catch (e) {
      window.mapConsole.addOutput(
        `Error toggling snapping: ${e.message}`,
        "#ff0000"
      );
    }
  }

  // Show snapping status
  function showSnappingStatus() {
    if (!window.featureSnapper) {
      window.mapConsole.addOutput(
        "Feature snapper not initialized yet",
        "#ff0000"
      );
      return;
    }

    const status = window.featureSnapper.options.active ? "active" : "inactive";
    const buttonVisible = isElementVisible(
      document.getElementById("snap-toggle-button")
    );

    window.mapConsole.addOutput(
      `Snapping is currently ${status}, button is ${
        buttonVisible ? "visible" : "hidden"
      }`,
      "#00ff00"
    );
  }

  // Start initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
