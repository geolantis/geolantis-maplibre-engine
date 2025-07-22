/**
 * Simple Button Commands for Command Line
 * Adds button-specific commands to the command line interface
 */

(function () {
  // Wait for command line to be initialized
  document.addEventListener("DOMContentLoaded", function () {
    // Try to find the command line interface
    const checkInterval = setInterval(function () {
      if (window.mapConsole) {
        clearInterval(checkInterval);
        addButtonCommands();
      }
    }, 500);
  });

  function addButtonCommands() {
    console.log("[Button Commands] Adding button commands to command line");

    // Original process command function
    const originalProcessCommand = window.processCommand;

    // New process command function with button commands
    window.processCommand = function (command) {
      const parts = command.toLowerCase().split(/\s+/);
      const cmd = parts[0];

      // Handle button-specific commands
      if (cmd === "buttons" || cmd === "button") {
        handleButtonCommand(parts.slice(1), command);
        return;
      }

      // Pass to original handler
      originalProcessCommand.call(this, command);
    };

    // Add our commands to help
    extendHelpCommand();
  }

  function handleButtonCommand(args, fullCommand) {
    if (args.length === 0 || args[0] === "help") {
      showButtonHelp();
      return;
    }

    const action = args[0];
    const target = args.length > 1 ? args[1] : null;

    switch (action) {
      case "show":
        if (!target || target === "all") {
          showAllButtons();
        } else if (target === "gnss") {
          showGnssButton();
        } else if (target === "snap") {
          showSnapButton();
        } else {
          mapConsole.addOutput(`Unknown button: ${target}`, "#ff0000");
        }
        break;

      case "hide":
        if (!target || target === "all") {
          hideAllButtons();
        } else if (target === "gnss") {
          hideGnssButton();
        } else if (target === "snap") {
          hideSnapButton();
        } else {
          mapConsole.addOutput(`Unknown button: ${target}`, "#ff0000");
        }
        break;

      case "list":
        listButtons();
        break;

      default:
        mapConsole.addOutput(
          `Unknown button command: ${action}. Use 'buttons help' for available commands.`,
          "#ff0000"
        );
        break;
    }
  }

  function showButtonHelp() {
    mapConsole.addOutput(
      `
Button Control Commands:
buttons show [all|gnss|snap] - Show specified button(s)
buttons hide [all|gnss|snap] - Hide specified button(s)
buttons list                - List all buttons and their status
`,
      "#00ff00"
    );
  }

  function showAllButtons() {
    showGnssButton();
    showSnapButton();
    mapConsole.addOutput("All buttons shown", "#00ff00");
  }

  function hideAllButtons() {
    hideGnssButton();
    hideSnapButton();
    mapConsole.addOutput("All buttons hidden", "#00ff00");
  }

  function showGnssButton() {
    if (window.buttonController && window.buttonController.showGnssButton) {
      window.buttonController.showGnssButton();
      mapConsole.addOutput("GNSS button shown", "#00ff00");
    } else {
      // Fallback if buttonController isn't available
      const button = document.getElementById("gnss-simulator-button");
      if (button) {
        button.classList.add("force-show");
        button.style.display = "flex";
        mapConsole.addOutput("GNSS button shown", "#00ff00");
      } else {
        mapConsole.addOutput(
          "GNSS button not found. Try 'gnss start' first.",
          "#ffaa00"
        );
      }
    }
  }

  function hideGnssButton() {
    if (window.buttonController && window.buttonController.hideGnssButton) {
      window.buttonController.hideGnssButton();
      mapConsole.addOutput("GNSS button hidden", "#00ff00");
    } else {
      // Fallback if buttonController isn't available
      const button = document.getElementById("gnss-simulator-button");
      if (button) {
        button.classList.remove("force-show");
        button.style.display = "none";
        mapConsole.addOutput("GNSS button hidden", "#00ff00");
      } else {
        mapConsole.addOutput("GNSS button not found", "#ffaa00");
      }
    }
  }

  function showSnapButton() {
    if (window.buttonController && window.buttonController.showSnappingButton) {
      window.buttonController.showSnappingButton();
      mapConsole.addOutput("Snapping button shown", "#00ff00");
    } else {
      // Fallback if buttonController isn't available
      const button = document.getElementById("snap-toggle-button");
      if (button) {
        button.classList.add("force-show");
        button.style.display = "block";
        mapConsole.addOutput("Snapping button shown", "#00ff00");
      } else {
        mapConsole.addOutput("Snapping button not found", "#ffaa00");
      }
    }
  }

  function hideSnapButton() {
    if (window.buttonController && window.buttonController.hideSnappingButton) {
      window.buttonController.hideSnappingButton();
      mapConsole.addOutput("Snapping button hidden", "#00ff00");
    } else {
      // Fallback if buttonController isn't available
      const button = document.getElementById("snap-toggle-button");
      if (button) {
        button.classList.remove("force-show");
        button.style.display = "none";
        mapConsole.addOutput("Snapping button hidden", "#00ff00");
      } else {
        mapConsole.addOutput("Snapping button not found", "#ffaa00");
      }
    }
  }

  function listButtons() {
    const gnssButton = document.getElementById("gnss-simulator-button");
    const snapButton = document.getElementById("snap-toggle-button");

    let report = "Buttons status:\n";

    report += "GNSS Simulator: ";
    if (gnssButton) {
      const visible = window.getComputedStyle(gnssButton).display !== "none";
      report += visible ? "Visible" : "Hidden";
      if (window.GNSSSimulator) {
        report += ` (${window.GNSSSimulator.active ? "Active" : "Inactive"})`;
      }
    } else {
      report += "Not created";
    }
    report += "\n";

    report += "Snapping: ";
    if (snapButton) {
      const visible = window.getComputedStyle(snapButton).display !== "none";
      report += visible ? "Visible" : "Hidden";
      if (window.featureSnapper) {
        report += ` (${
          window.featureSnapper.options.active ? "Active" : "Inactive"
        })`;
      }
    } else {
      report += "Not created";
    }

    mapConsole.addOutput(report, "#00ff00");
  }

  function extendHelpCommand() {
    // Wait a moment to ensure all other help text is initialized
    setTimeout(() => {
      // Original help command processing
      const originalHelpFunction = window.processCommand;

      // Extend the help command
      window.processCommand = function (command) {
        if (command.toLowerCase() === "help") {
          // First call the original handler
          originalHelpFunction.call(this, command);

          // Then add our own help text
          mapConsole.addOutput(
            `
Additional Commands:
buttons       - Button visibility control commands (use 'buttons help' for more info)
`,
            "#00ff00"
          );
          return;
        }

        // For all other commands, use the original handler
        originalHelpFunction.call(this, command);
      };
    }, 1000);
  }
})();
