/**
 * Updated commandline-log-extension.js to work with App namespace architecture
 * This script fixes the logging system to properly track methods in both the BridgeInterface
 * and the App.Map.Layers module.
 */

(function () {
  console.log(
    "Setting up integrated feature logging (App namespace compatible)..."
  );

  // Define global storage for logs if it doesn't exist
  window.mapFeatureLogs = window.mapFeatureLogs || {
    enabled: false,
    entries: [],
    filterType: null,
    maxEntries: 100,
  };

  // Define the methods to track - including App namespace methods
  const methodsToHook = [
    // Original BridgeInterface methods
    { object: window.interface, name: "addFeature" },
    { object: window.interface, name: "addImageLayer" },
    { object: window.interface, name: "addWMSLayer" },
    { object: window.interface, name: "addText" },
    { object: window.interface, name: "addImageMarker" },
    { object: window.interface, name: "addImageFeature" },
    { object: window.interface, name: "addCircleMarker" },
    { object: window.interface, name: "addTextFeature" },
    { object: window.interface, name: "addImageOverlay" },
    { object: window.interface, name: "addGeoJsonLayers" },

    // App namespace methods - will be populated dynamically when available
  ];

  /**
   * Set up logging for App namespace methods when available
   */
  function setupAppNamespaceLogging() {
    if (!window.App || !window.App.Map || !window.App.Map.Layers) {
      console.log("App.Map.Layers not available yet for logging setup");
      return false;
    }

    // Add App.Map.Layers methods to tracking
    const layersMethods = [
      "addFeature",
      "addImageLayer",
      "addWMSLayer",
      "addText",
      "addCircleMarker",
      "addCircleFeature",
      "addImageMarker",
      "toggleOverlayLayer",
      "toggleWmsLayer",
    ];

    layersMethods.forEach((methodName) => {
      if (typeof App.Map.Layers[methodName] === "function") {
        // Only add if not already in the list
        if (
          !methodsToHook.some(
            (m) => m.object === App.Map.Layers && m.name === methodName
          )
        ) {
          methodsToHook.push({ object: App.Map.Layers, name: methodName });
          console.log(`Added App.Map.Layers.${methodName} to logging hooks`);
        }
      }
    });

    return true;
  }

  /**
   * Set up logging for all feature methods
   */
  function setupLogging() {
    // Try to add App namespace methods first
    setupAppNamespaceLogging();

    let successCount = 0;

    methodsToHook.forEach((methodInfo) => {
      const { object, name } = methodInfo;

      // Skip if object doesn't exist
      if (!object) {
        return;
      }

      // Check if the method exists
      if (typeof object[name] !== "function") {
        return;
      }

      // Create a unique key for storing the original method
      const storeKey = `original_${
        object === window.interface ? "" : "app_"
      }${name}`;

      // Store the original method if not already hooked
      if (!window[storeKey]) {
        window[storeKey] = object[name];

        // Replace with logged version
        object[name] = function (...args) {
          // Only log if enabled
          if (window.mapFeatureLogs.enabled) {
            const objectName =
              object === window.interface
                ? "interface"
                : object === App.Map.Layers
                ? "App.Map.Layers"
                : "unknown";

            const entry = {
              timestamp: new Date(),
              method: `${objectName}.${name}`,
              args: args.map((arg) => {
                // Special handling for different argument types
                if (arg === null || arg === undefined) return null;
                if (typeof arg === "object") {
                  try {
                    // For GeoJSON and other objects, create a safe copy
                    return JSON.parse(JSON.stringify(arg));
                  } catch (e) {
                    // If can't stringify (circular refs, etc), create basic info
                    return `[Object: ${
                      arg.constructor ? arg.constructor.name : "Unknown"
                    }]`;
                  }
                }
                return arg;
              }),
            };

            // Apply filter if set
            if (
              !window.mapFeatureLogs.filterType ||
              entry.method
                .toLowerCase()
                .includes(window.mapFeatureLogs.filterType)
            ) {
              // Add the entry to the log
              window.mapFeatureLogs.entries.push(entry);

              // Keep logs under the max size
              if (
                window.mapFeatureLogs.entries.length >
                window.mapFeatureLogs.maxEntries
              ) {
                window.mapFeatureLogs.entries.shift();
              }

              // Print to console for immediate feedback
              console.log(`Map feature call: ${entry.method}`, args);
            }
          }

          // Call the original method
          try {
            return window[storeKey].apply(object, args);
          } catch (error) {
            // Log errors
            console.error(`Error in ${name}:`, error);
            if (window.mapFeatureLogs.enabled) {
              window.mapFeatureLogs.entries.push({
                timestamp: new Date(),
                method: `${
                  object === window.interface ? "interface" : "App.Map.Layers"
                }.${name}`,
                error: error.message,
                stack: error.stack,
                args: args,
              });
            }
            throw error; // Re-throw to preserve normal error handling
          }
        };

        successCount++;
      }
    });

    console.log(`Set up logging for ${successCount} methods`);
    return successCount > 0;
  }

  // Initialize logging setup
  function initialize() {
    // First try to setup logging for what's available
    let setupSuccess = setupLogging();

    // Continue checking for App namespace to be available
    if (!window.App || !window.App.Map || !window.App.Map.Layers) {
      console.log("App namespace not fully available, will check again later");

      // Set an interval to check for App namespace and setup logging when available
      const checkInterval = setInterval(() => {
        if (window.App && window.App.Map && window.App.Map.Layers) {
          console.log(
            "App namespace now available, setting up additional logging"
          );
          setupAppNamespaceLogging();
          setupLogging();
          clearInterval(checkInterval);
        }
      }, 1000);

      // Stop checking after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 10000);
    }

    // Continue with the rest of the setup - commandline patching etc.
    patchCommandLine();
  }

  // Try to setup logging immediately
  setupLogging();

  // Also try again after a delay in case interface isn't ready yet
  setTimeout(setupLogging, 1000);

  // Wait for command line to be ready, then patch it
  function patchCommandLine() {
    // Find the command line prototype to patch
    if (
      typeof EnhancedCommandLine === "function" &&
      EnhancedCommandLine.prototype
    ) {
      console.log(
        "Found EnhancedCommandLine prototype, patching handleLogCommand..."
      );

      // Store the original method
      const originalHandleLogCommand =
        EnhancedCommandLine.prototype.handleLogCommand;

      // Replace with our enhanced version
      EnhancedCommandLine.prototype.handleLogCommand = function (args) {
        if (args.length === 0 || args[0] === "help") {
          this.addOutput(
            `
Feature Logging Commands:
log help     - Show this help
log status   - Show current logging status
log enable   - Enable feature logging
log disable  - Disable feature logging
log clear    - Clear the log history
log show     - Show the latest log entries
log last     - Show the last logged operation in detail
log inspect <index> - Show complete details for a specific log entry by index
`,
            "#00ff00"
          );
          return;
        }

        const subCmd = args[0].toLowerCase();

        // Initialize logs storage if needed
        if (!window.mapFeatureLogs) {
          window.mapFeatureLogs = {
            enabled: false,
            entries: [],
            filterType: null,
            maxEntries: 100,
          };
        }

        switch (subCmd) {
          case "status":
            const status = window.mapFeatureLogs.enabled
              ? "enabled"
              : "disabled";
            const filter = window.mapFeatureLogs.filterType
              ? `(filtered to '${window.mapFeatureLogs.filterType}')`
              : "(no filter)";
            const count = window.mapFeatureLogs.entries.length;

            this.addOutput(`Feature logging is ${status} ${filter}`, "#00ff00");
            this.addOutput(`Total log entries: ${count}`, "#00ff00");

            // Count by method type
            if (count > 0) {
              const methodCounts = {};
              window.mapFeatureLogs.entries.forEach((entry) => {
                methodCounts[entry.method] =
                  (methodCounts[entry.method] || 0) + 1;
              });

              this.addOutput("Counts by method:", "#00ff00");
              Object.entries(methodCounts).forEach(([method, count]) => {
                this.addOutput(`  • ${method}: ${count}`, "#aaaaaa");
              });
            }
            break;

          case "enable":
            if (window.mapFeatureLogs.enabled) {
              this.addOutput("Feature logging is already enabled", "#ffaa00");
            } else {
              window.mapFeatureLogs.enabled = true;
              setupLogging(); // Make sure all methods are hooked
              this.addOutput("Feature logging enabled", "#00ff00");
            }
            break;

          case "disable":
            window.mapFeatureLogs.enabled = false;
            this.addOutput("Feature logging disabled", "#00ff00");
            break;

          case "clear":
            window.mapFeatureLogs.entries = [];
            this.addOutput("Log history cleared", "#00ff00");
            break;

          case "show":
            showFeatureLogs.call(this);
            break;

          case "last":
            const showFull =
              args.length > 1 && args[1]?.toLowerCase() === "full";
            showLastFeatureLog.call(this, showFull);
            break;

          case "inspect":
            if (args.length < 2) {
              this.addOutput("Please specify an index number", "#ff0000");
              break;
            }
            inspectLogEntry.call(this, parseInt(args[1], 10));
            break;

          default:
            // Fall back to original handler if command not recognized
            if (originalHandleLogCommand) {
              originalHandleLogCommand.call(this, args);
            } else {
              this.addOutput(
                `Unknown log command: ${subCmd}. Use 'log help' for available commands.`,
                "#ff0000"
              );
            }
        }
      };

      console.log(
        "Command line patched successfully with enhanced logging commands"
      );
      return true;
    } else if (
      window.mapConsole &&
      typeof window.mapConsole.execute === "function"
    ) {
      // If we can't find the prototype but mapConsole exists, add methods to the instance
      console.log("Adding methods directly to mapConsole instance...");

      // Get the instance object
      const cmdLineInstance =
        window.mapConsole.commandLine || window.mapConsole;

      // Replace handleLogCommand with a simpler version
      const originalHandleLog = cmdLineInstance.handleLogCommand;
      cmdLineInstance.handleLogCommand = function (args) {
        // Same implementation as above but simplified
        if (args.length === 0 || args[0] === "help") {
          this.addOutput(
            `Feature Logging Commands: enable, disable, status, show, last, clear`,
            "#00ff00"
          );
          return;
        }

        const subCmd = args[0].toLowerCase();

        // Initialize logs storage if needed
        if (!window.mapFeatureLogs) {
          window.mapFeatureLogs = {
            enabled: false,
            entries: [],
            filterType: null,
            maxEntries: 100,
          };
        }

        // Process commands
        switch (subCmd) {
          case "status":
            const status = window.mapFeatureLogs.enabled
              ? "enabled"
              : "disabled";
            this.addOutput(`Feature logging is ${status}`, "#00ff00");
            this.addOutput(
              `Total entries: ${window.mapFeatureLogs.entries.length}`,
              "#00ff00"
            );
            break;

          case "enable":
            window.mapFeatureLogs.enabled = true;
            setupLogging();
            this.addOutput("Feature logging enabled", "#00ff00");
            break;

          case "disable":
            window.mapFeatureLogs.enabled = false;
            this.addOutput("Feature logging disabled", "#00ff00");
            break;

          case "clear":
            window.mapFeatureLogs.entries = [];
            this.addOutput("Log history cleared", "#00ff00");
            break;

          case "show":
            showFeatureLogs.call(this);
            break;

          case "last":
            showLastFeatureLog.call(this, false);
            break;

          default:
            if (originalHandleLog) {
              originalHandleLog.call(this, args);
            } else {
              this.addOutput(`Unknown log command: ${subCmd}`, "#ff0000");
            }
        }
      };

      console.log("Added basic logging methods to mapConsole instance");
      return true;
    }

    console.warn("Could not find command line to patch, will try again later");
    return false;
  }

  // Helper methods for displaying logs

  /**
   * Show logged feature operations
   */
  function showFeatureLogs() {
    if (!window.mapFeatureLogs || window.mapFeatureLogs.entries.length === 0) {
      this.addOutput("No feature logs available", "#ffaa00");
      return;
    }

    // Show the last 10 entries (or all if less than 10)
    const entriesToShow = window.mapFeatureLogs.entries.slice(-10);

    this.addOutput(
      `Showing last ${entriesToShow.length} log entries:`,
      "#00aaff"
    );

    entriesToShow.forEach((entry, index) => {
      const time = entry.timestamp.toLocaleTimeString();

      // Display different colors for different methods
      let methodColor = "#ffffff";
      if (entry.method.includes("Feature")) methodColor = "#9cf";
      if (entry.method.includes("Image")) methodColor = "#fc9";
      if (entry.method.includes("WMS")) methodColor = "#9fc";
      if (entry.method.includes("Text")) methodColor = "#f9c";
      if (entry.method.includes("Circle")) methodColor = "#cf9";

      // Format the entry header
      this.addOutput(`${index + 1}. [${time}] ${entry.method}`, methodColor);

      // Show error if present
      if (entry.error) {
        this.addOutput(`   ERROR: ${entry.error}`, "#ff6b6b");
      }
    });

    this.addOutput(
      `Use 'log last' to see detailed info for the most recent operation`,
      "#aaaaaa"
    );
  }

  /**
   * Show the last feature log entry in detail
   */
  function showLastFeatureLog(fullDetails = false) {
    if (!window.mapFeatureLogs || window.mapFeatureLogs.entries.length === 0) {
      this.addOutput("No feature logs available", "#ffaa00");
      return;
    }

    const lastEntry =
      window.mapFeatureLogs.entries[window.mapFeatureLogs.entries.length - 1];

    this.addOutput("Last Feature Operation:", "#00aaff");
    this.addOutput(`Time: ${lastEntry.timestamp.toLocaleString()}`, "#ffffff");
    this.addOutput(`Method: ${lastEntry.method}`, "#ffffff");

    // Show arguments
    if (lastEntry.args && lastEntry.args.length > 0) {
      this.addOutput("Arguments:", "#ffffff");

      lastEntry.args.forEach((arg, index) => {
        let argDisplay;

        // Format the argument for display
        if (arg === null || arg === undefined) {
          argDisplay = String(arg);
        } else if (typeof arg === "object") {
          try {
            // For objects, show formatted JSON
            argDisplay = JSON.stringify(arg, null, 2);
            // Only truncate if not showing full details
            if (!fullDetails && argDisplay.length > 500) {
              argDisplay =
                argDisplay.substring(0, 500) +
                "... (truncated)\nUse 'log last full' to see complete data";
            }
          } catch (e) {
            argDisplay = "[Object: Could not stringify]";
          }
        } else if (
          typeof arg === "string" &&
          !fullDetails &&
          arg.length > 100
        ) {
          // Truncate long strings only if not showing full details
          argDisplay = arg.substring(0, 100) + "... (truncated)";
        } else {
          argDisplay = String(arg);
        }

        // Display the argument
        this.addOutput(`  Arg ${index + 1}: ${argDisplay}`, "#dddddd");
      });
    }

    // Show error if present
    if (lastEntry.error) {
      this.addOutput("Error:", "#ff0000");
      this.addOutput(lastEntry.error, "#ff6b6b");

      if (lastEntry.stack) {
        this.addOutput("Stack Trace:", "#ff0000");
        this.addOutput(lastEntry.stack, "#ff6b6b");
      }
    }
  }

  /**
   * Inspect a specific log entry by index
   */
  function inspectLogEntry(index) {
    if (!window.mapFeatureLogs || window.mapFeatureLogs.entries.length === 0) {
      this.addOutput("No feature logs available", "#ffaa00");
      return;
    }

    // Validate index
    if (
      isNaN(index) ||
      index < 0 ||
      index >= window.mapFeatureLogs.entries.length
    ) {
      this.addOutput(
        `Invalid index: ${index}. Use 'log show' to see available entries.`,
        "#ff0000"
      );
      return;
    }

    const entry = window.mapFeatureLogs.entries[index];

    this.addOutput(`Inspecting Log Entry #${index}:`, "#00aaff");
    this.addOutput(`Time: ${entry.timestamp.toLocaleString()}`, "#ffffff");
    this.addOutput(`Method: ${entry.method}`, "#ffffff");

    // Show arguments with full details
    if (entry.args && entry.args.length > 0) {
      this.addOutput("Arguments:", "#ffffff");

      entry.args.forEach((arg, i) => {
        let argDisplay;

        // Format the argument for display - NO truncation
        if (arg === null || arg === undefined) {
          argDisplay = String(arg);
        } else if (typeof arg === "object") {
          try {
            // Show complete JSON
            argDisplay = JSON.stringify(arg, null, 2);
          } catch (e) {
            argDisplay = "[Object: Could not stringify]";
          }
        } else {
          argDisplay = String(arg);
        }

        // Display the argument with index
        this.addOutput(`  Arg ${i + 1}: ${argDisplay}`, "#dddddd");
      });
    }

    // Show error if present
    if (entry.error) {
      this.addOutput("Error:", "#ff0000");
      this.addOutput(entry.error, "#ff6b6b");

      if (entry.stack) {
        this.addOutput("Stack Trace:", "#ff0000");
        this.addOutput(entry.stack, "#ff6b6b");
      }
    }
  }

  // Expose utility functions to window for manual execution
  window.mapFeatureLogging = {
    setup: setupLogging,
    patch: patchCommandLine,
    status: () => {
      const trackedMethods = methodsToHook.filter((m) => {
        const storeKey = `original_${
          m.object === window.interface ? "" : "app_"
        }${m.name}`;
        return !!window[storeKey];
      });

      console.log("Logging status:", window.mapFeatureLogs);
      console.log("Tracked methods:", trackedMethods);

      return {
        enabled: window.mapFeatureLogs?.enabled || false,
        entriesCount: window.mapFeatureLogs?.entries?.length || 0,
        filter: window.mapFeatureLogs?.filterType || null,
        trackedMethods: trackedMethods.map(
          (m) =>
            `${
              m.object === window.interface ? "interface" : "App.Map.Layers"
            }.${m.name}`
        ),
      };
    },
    appInit: setupAppNamespaceLogging,
  };

  // Initialize after a short delay to ensure other scripts have loaded
  setTimeout(initialize, 500);

  console.log(
    "Feature logging setup complete - use 'log enable' to start tracking"
  );
})();
