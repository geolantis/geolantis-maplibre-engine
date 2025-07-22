/**
 * Enhanced Button Visibility Controller for GNSS and Snapping Features
 * Completely overrides original button creation to ensure buttons only appear when activated
 */

(function () {
  // Track our initialization status
  let initialized = false;
  let gnssButtonIntercepted = false;

  // Store original functions to override
  let originalAddGpsButton = null;

  // Initialize when the page loads
  document.addEventListener("DOMContentLoaded", function () {
    console.log("[Button Controller] Initializing...");
    initEnhancedButtonController();
  });

  // For early interception
  if (document.readyState !== "loading") {
    console.log(
      "[Button Controller] Document already loaded, initializing immediately"
    );
    initEnhancedButtonController();
  }

  // Function to intercept GNSS button creation before it happens
  function interceptGnssButtonCreation() {
    if (gnssButtonIntercepted) return;

    console.log("[Button Controller] Setting up GNSS button interception");

    // Override the global addGpsButton function that creates the GNSS button
    if (typeof window.addGpsButton === "function") {
      console.log(
        "[Button Controller] Found addGpsButton function, intercepting it"
      );
      originalAddGpsButton = window.addGpsButton;

      // Replace with our controlled version
      window.addGpsButton = function () {
        console.log(
          "[Button Controller] Prevented automatic GNSS button creation"
        );
        // Don't create the button, our command will handle this
        return null;
      };

      gnssButtonIntercepted = true;
    }

    // If the function isn't defined yet, set up a watcher to intercept it when it's defined
    if (!gnssButtonIntercepted) {
      Object.defineProperty(window, "addGpsButton", {
        configurable: true,
        set: function (newFunction) {
          console.log(
            "[Button Controller] Intercepted addGpsButton assignment"
          );
          // Store the original function
          originalAddGpsButton = newFunction;

          // Replace the property with our function
          Object.defineProperty(window, "addGpsButton", {
            configurable: true,
            writable: true,
            value: function () {
              console.log(
                "[Button Controller] Prevented automatic GNSS button creation"
              );
              // Don't actually create the button
              return null;
            },
          });

          gnssButtonIntercepted = true;
        },
        get: function () {
          return function () {
            console.log(
              "[Button Controller] Prevented automatic GNSS button creation"
            );
            return null;
          };
        },
      });

      gnssButtonIntercepted = true;
    }
  }

  function initEnhancedButtonController() {
    if (initialized) return;
    initialized = true;

    console.log(
      "[Button Controller] Initializing enhanced button controller..."
    );

    // Intercept GNSS button creation as early as possible
    interceptGnssButtonCreation();

    // Remove any existing GNSS button
    removeExistingGnssButton();

    // Hide existing snap button
    const snapButton = document.getElementById("snap-toggle-button");
    if (snapButton) {
      snapButton.style.display = "none";
      console.log("[Button Controller] Hidden existing snapping button");
    }

    // Set up a periodic check to intercept any buttons that might be created
    const buttonCheckInterval = setInterval(function () {
      removeExistingGnssButton();

      // Once command line is ready, set up command observers and clear interval
      if (window.mapConsole) {
        setupCommandLineObservers();
        clearInterval(buttonCheckInterval);
      }
    }, 500);

    // Inject our CSS to ensure buttons stay hidden when we need them to
    injectControllerCSS();

    // Set up MutationObserver to watch for new buttons
    setupButtonObserver();
  }

  function removeExistingGnssButton() {
    const gnssButton = document.getElementById("gnss-simulator-button");
    if (gnssButton) {
      gnssButton.remove();
      console.log("[Button Controller] Removed existing GNSS button");
    }
  }

  function injectControllerCSS() {
    // Add CSS to ensure buttons start hidden
    const styleElement = document.createElement("style");
    styleElement.textContent = `
            /* Hide GNSS and snapping buttons by default */
            #gnss-simulator-button {
                display: none !important;
            }
            
            /* Add classes we can use to override the !important */
            #gnss-simulator-button.force-show {
                display: flex !important;
            }
            
            #snap-toggle-button {
                display: none;
            }
            
            #snap-toggle-button.force-show {
                display: block !important;
            }
        `;
    document.head.appendChild(styleElement);
    console.log(
      "[Button Controller] Injected CSS to control button visibility"
    );
  }

  function setupButtonObserver() {
    // Create a MutationObserver to watch for new buttons being added to the DOM
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) {
              // Element node
              // Check if this is a GNSS button being added
              if (node.id === "gnss-simulator-button") {
                // Only remove if we're not showing it
                if (!node.classList.contains("force-show")) {
                  node.remove();
                  console.log(
                    "[Button Controller] Removed dynamically added GNSS button"
                  );
                }
              }
            }
          });
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log("[Button Controller] Set up DOM observer for button control");
  }

  function setupCommandLineObservers() {
    // Store original command execution function
    const originalExecute = window.mapConsole.execute;

    // Override the execute function to monitor commands
    window.mapConsole.execute = function (command) {
      // Call the original function first
      originalExecute.call(this, command);

      // Process our command monitoring logic
      processCommand(command);
    };

    console.log(
      "[Button Controller] Command line observer initialized successfully"
    );

    // Override GNSS simulator functions
    overrideGnssSimulator();
  }

  function overrideGnssSimulator() {
    // Wait for GNSSSimulator to be available
    const checkGnssSimulator = setInterval(() => {
      if (window.GNSSSimulator) {
        clearInterval(checkGnssSimulator);

        console.log(
          "[Button Controller] Found GNSSSimulator, overriding functions"
        );

        // Store original start and stop functions
        const originalStart = window.GNSSSimulator.start;
        const originalStop = window.GNSSSimulator.stop;

        // Override start function
        window.GNSSSimulator.start = function (map) {
          // Call original function
          const result = originalStart.call(this, map);

          // Instead of relying on the original function to show the button,
          // we'll handle it ourselves
          showGnssButton();

          return result;
        };

        // Override stop function
        window.GNSSSimulator.stop = function () {
          // Call original function
          const result = originalStop.call(this);

          // Hide the button
          hideGnssButton();

          return result;
        };

        console.log("[Button Controller] GNSSSimulator functions overridden");
      }
    }, 500);
  }

  function processCommand(command) {
    const commandParts = command.toLowerCase().trim().split(" ");
    const mainCommand = commandParts[0];
    const subCommand = commandParts.length > 1 ? commandParts[1] : "";

    // Handle GNSS simulator commands
    if (mainCommand === "gnss") {
      if (subCommand === "start") {
        // Button will be shown by our overridden start function
      } else if (subCommand === "stop") {
        // Button will be hidden by our overridden stop function
      } else if (subCommand === "show") {
        // Explicit command to show the button without starting
        showGnssButton();
      } else if (subCommand === "hide") {
        hideGnssButton();
      }
    }

    // Handle snapping commands
    if (mainCommand === "snap") {
      if (subCommand === "enable" || subCommand === "show") {
        showSnappingButton();
      } else if (subCommand === "disable" || subCommand === "hide") {
        hideSnappingButton();
      }
    }

    // Button command group
    if (mainCommand === "buttons" || mainCommand === "button") {
      const action = subCommand;
      const target = commandParts.length > 2 ? commandParts[2] : "";

      if (action === "show") {
        if (target === "gnss") {
          showGnssButton();
        } else if (target === "snap") {
          showSnappingButton();
        } else if (target === "all") {
          showGnssButton();
          showSnappingButton();
        }
      } else if (action === "hide") {
        if (target === "gnss") {
          hideGnssButton();
        } else if (target === "snap") {
          hideSnappingButton();
        } else if (target === "all") {
          hideGnssButton();
          hideSnappingButton();
        }
      }
    }
  }

  function showGnssButton() {
    // Check if we need to create the button
    let button = document.getElementById("gnss-simulator-button");

    if (!button) {
      // Create the button
      button = document.createElement("button");
      button.id = "gnss-simulator-button";
      button.className = "force-show"; // Use our CSS class
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
      console.log("[Button Controller] GNSS button created and shown");
    } else {
      // Just ensure it's visible by adding our class
      button.classList.add("force-show");
    }
  }

  function hideGnssButton() {
    const button = document.getElementById("gnss-simulator-button");
    if (button) {
      button.classList.remove("force-show");
      console.log("[Button Controller] GNSS button hidden");
    }
  }

  function showSnappingButton() {
    const button = document.getElementById("snap-toggle-button");
    if (button) {
      button.classList.add("force-show");
      console.log("[Button Controller] Snapping button shown");
    }
  }

  function hideSnappingButton() {
    const button = document.getElementById("snap-toggle-button");
    if (button) {
      button.classList.remove("force-show");
      console.log("[Button Controller] Snapping button hidden");
    }
  }

  // Attach to window for debugging
  window.buttonController = {
    showGnssButton,
    hideGnssButton,
    showSnappingButton,
    hideSnappingButton,
  };
})();
