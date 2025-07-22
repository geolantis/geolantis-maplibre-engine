/**
 * Command Line Extension for Button Control
 * Adds button-specific commands to the command line interface
 */

(function () {
  // Initialize when the document is loaded
  document.addEventListener("DOMContentLoaded", initButtonCommands);

  function initButtonCommands() {
    // Wait for the command line interface to be available
    const waitForCommandLine = setInterval(() => {
      if (window.mapConsole) {
        clearInterval(waitForCommandLine);
        addButtonCommands();
      }
    }, 500);
  }

  function addButtonCommands() {
    // Store the original processCommand function
    const originalProcessCommand = window.processCommand;

    // Extend the processCommand function
    window.processCommand = function (command) {
      const parts = command.split(" ");
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      // Check for our new commands
      if (cmd === "buttons" || cmd === "button") {
        handleButtonCommands(args);
        return; // Don't pass to original handler
      } else if (cmd === "snap") {
        handleSnapCommands(args);
        return;
      }

      // Pass to original handler for all other commands
      originalProcessCommand.call(this, command);
    };

    // Add our new commands to help
    extendHelpCommand();

    console.log("Button commands added to command line interface");
  }

  function handleButtonCommands(args) {
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

  function handleSnapCommands(args) {
    if (args.length === 0 || args[0] === "help") {
      window.mapConsole.addOutput(
        `
Snapping Control Commands:
snap help      - Show snapping commands
snap enable    - Enable snapping and show button
snap disable   - Disable snapping
snap toggle    - Toggle snapping state
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

      default:
        window.mapConsole.addOutput(
          `Unknown snap command: ${action}. Use 'snap help' for available commands.`,
          "#ff0000"
        );
    }
  }

  function listButtons() {
    const gnssButton = document.getElementById("gnss-simulator-button");
    const snapButton = document.getElementById("snap-toggle-button");

    let buttonInfo = "Control Buttons Status:\n";

    buttonInfo += `GNSS Simulator: ${
      gnssButton
        ? gnssButton.style.display === "none"
          ? "Hidden"
          : "Visible"
        : "Not created"
    }\n`;
    buttonInfo += `Snapping: ${
      snapButton
        ? snapButton.style.display === "none"
          ? "Hidden"
          : "Visible"
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

  function showAllButtons() {
    showGnssButton();
    showSnapButton();
    window.mapConsole.addOutput("All control buttons shown", "#00ff00");
  }

  function hideAllButtons() {
    hideGnssButton();
    hideSnapButton();
    window.mapConsole.addOutput("All control buttons hidden", "#00ff00");
  }

  function showGnssButton() {
    const button = document.getElementById("gnss-simulator-button");

    if (!button && window.GNSSSimulator) {
      // If button doesn't exist but simulator does, create a button
      window.mapConsole.addOutput("Creating GNSS button...", "#00aaff");

      // Add GNSS button
      const gnssBtn = document.createElement("button");
      gnssBtn.id = "gnss-simulator-button";
      gnssBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="2"></circle>
                <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path>
              </svg>
            `;
      gnssBtn.title = "Toggle GNSS Simulator (Ctrl+G)";
      gnssBtn.style.position = "fixed";
      gnssBtn.style.bottom = "110px";
      gnssBtn.style.right = "10px";
      gnssBtn.style.width = "40px";
      gnssBtn.style.height = "40px";
      gnssBtn.style.borderRadius = "50%";
      gnssBtn.style.backgroundColor = window.GNSSSimulator.active
        ? "#F44336"
        : "#4CAF50";
      gnssBtn.style.color = "white";
      gnssBtn.style.border = "none";
      gnssBtn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
      gnssBtn.style.cursor = "pointer";
      gnssBtn.style.zIndex = "900";
      gnssBtn.style.display = "flex";
      gnssBtn.style.justifyContent = "center";
      gnssBtn.style.alignItems = "center";

      // Add click event
      gnssBtn.addEventListener("click", () => {
        if (window.GNSSSimulator) {
          if (window.GNSSSimulator.active) {
            window.GNSSSimulator.stop();
          } else {
            window.GNSSSimulator.start(window.interface.map);
          }
        }
      });

      document.body.appendChild(gnssBtn);
      window.mapConsole.addOutput("GNSS button created and shown", "#00ff00");
    } else if (button) {
      button.style.display = "flex";
      window.mapConsole.addOutput("GNSS button is now visible", "#00ff00");
    } else {
      window.mapConsole.addOutput(
        "GNSS Simulator not initialized. Try 'gnss start' first.",
        "#ff0000"
      );
    }
  }

  function hideGnssButton() {
    const button = document.getElementById("gnss-simulator-button");
    if (button) {
      button.style.display = "none";
      window.mapConsole.addOutput("GNSS button hidden", "#00ff00");
    } else {
      window.mapConsole.addOutput("GNSS button not found", "#ffaa00");
    }
  }

  function showSnapButton() {
    const button = document.getElementById("snap-toggle-button");
    if (button) {
      button.style.display = "block";
      window.mapConsole.addOutput("Snapping button is now visible", "#00ff00");
    } else {
      window.mapConsole.addOutput(
        "Snapping button not found. Initialize snapping first.",
        "#ff0000"
      );
    }
  }

  function hideSnapButton() {
    const button = document.getElementById("snap-toggle-button");
    if (button) {
      button.style.display = "none";
      window.mapConsole.addOutput("Snapping button hidden", "#00ff00");
    } else {
      window.mapConsole.addOutput("Snapping button not found", "#ffaa00");
    }
  }

  function enableSnapping() {
    if (!window.featureSnapper) {
      window.mapConsole.addOutput(
        "Feature snapper not initialized yet",
        "#ff0000"
      );
      return;
    }

    window.featureSnapper.enable();

    const button = document.getElementById("snap-toggle-button");
    if (button) {
      button.style.display = "block";
      button.textContent = "Disable Snapping";
      button.style.backgroundColor = "#0f9d58";
    }

    window.mapConsole.addOutput("Snapping enabled", "#00ff00");
  }

  function disableSnapping() {
    if (!window.featureSnapper) {
      window.mapConsole.addOutput(
        "Feature snapper not initialized yet",
        "#ff0000"
      );
      return;
    }

    window.featureSnapper.disable();

    const button = document.getElementById("snap-toggle-button");
    if (button) {
      button.textContent = "Enable Snapping";
      button.style.backgroundColor = "#4285f4";
    }

    window.mapConsole.addOutput("Snapping disabled", "#00ff00");
  }

  function toggleSnapping() {
    if (!window.featureSnapper) {
      window.mapConsole.addOutput(
        "Feature snapper not initialized yet",
        "#ff0000"
      );
      return;
    }

    if (window.featureSnapper.options.active) {
      disableSnapping();
    } else {
      enableSnapping();
    }
  }

  function extendHelpCommand() {
    // Wait for processCommand to be fully initialized
    setTimeout(() => {
      // Add our commands to the help text
      const helpMap = {
        buttons: "Button control commands (use 'buttons help' for more info)",
        snap: "Snapping control commands (use 'snap help' for more info)",
      };

      // Store original help command processing
      const originalHelpCommand = window.processCommand;

      // Override process command for help
      window.processCommand = function (command) {
        if (command.toLowerCase() === "help") {
          // Call the original help command
          originalHelpCommand.call(this, command);

          // Add our button commands
          let buttonHelpText = "\nButton Control Commands:\n";
          for (const [cmd, desc] of Object.entries(helpMap)) {
            buttonHelpText += `  ${cmd.padEnd(12)}${desc}\n`;
          }

          window.mapConsole.addOutput(buttonHelpText, "#00ff00");
          return;
        }

        // Pass all other commands to the original handler
        originalHelpCommand.call(this, command);
      };
    }, 1000); // Give time for all other initializations
  }
})();
