/**
 * Enhanced Command Line Interface for MapLibre with Button Control
 * Includes all original functionality plus button controls for GNSS and Snapping
 */

class EnhancedCommandLine {
  constructor() {
    this.container = null;
    this.output = null;
    this.input = null;
    this.history = [];
    this.historyIndex = -1;
    this.debugStatus = {
      active: false,
      consoleRedirected: false,
      bridgeDebugPanel: false,
      statusUpdatesLogged: false,
    };
  }

  /**
   * Initialize the command line interface
   */
  initialize() {
    console.log("Initializing Enhanced Command Line...");

    // Create the command line container
    this.container = document.createElement("div");
    this.container.id = "cli-container";
    this.container.style.position = "fixed";
    this.container.style.bottom = "40px";
    this.container.style.left = "0";
    this.container.style.right = "0";
    this.container.style.width = "100%";
    this.container.style.height = "300px";
    this.container.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    this.container.style.color = "#f0f0f0";
    this.container.style.fontFamily = "monospace";
    this.container.style.fontSize = "14px";
    this.container.style.zIndex = "1000";
    this.container.style.display = "flex";
    this.container.style.flexDirection = "column";
    this.container.style.boxShadow = "0 -2px 10px rgba(0, 0, 0, 0.5)";
    this.container.style.borderRadius = "5px 5px 0 0";

    // Add a header with close button
    const headerContainer = document.createElement("div");
    headerContainer.style.display = "flex";
    headerContainer.style.justifyContent = "space-between";
    headerContainer.style.alignItems = "center";
    headerContainer.style.padding = "8px 10px";
    headerContainer.style.borderBottom = "1px solid rgba(255, 255, 255, 0.2)";
    headerContainer.style.backgroundColor = "rgba(0, 0, 0, 0.6)";

    // Add title
    const title = document.createElement("div");
    title.textContent = "Geolantis360 Command Line";
    title.style.fontWeight = "bold";
    title.style.color = "#00aaff";

    // Create close button
    const closeButton = document.createElement("sl-button");
    closeButton.variant = "default";
    closeButton.size = "small";
    closeButton.innerHTML = '<sl-icon name="x"></sl-icon>';
    closeButton.style.fontSize = "14px";
    closeButton.style.marginLeft = "auto";
    closeButton.style.color = "white";
    closeButton.style.border = "1px solid rgba(255, 255, 255, 0.2)";

    // Add click handler
    const self = this;
    closeButton.addEventListener("click", function () {
      self.hide();
      self.updateButtonStates();
    });

    // Assemble header
    headerContainer.appendChild(title);
    headerContainer.appendChild(closeButton);
    this.container.appendChild(headerContainer);

    // Create the output area
    this.output = document.createElement("div");
    this.output.id = "cli-output";
    this.output.style.flexGrow = "1";
    this.output.style.overflowY = "auto";
    this.output.style.padding = "10px";
    this.output.style.whiteSpace = "pre-wrap";
    this.output.style.wordWrap = "break-word";
    this.output.style.height = "calc(100% - 80px)"; // Adjusted for header

    // Create the input container
    const inputContainer = document.createElement("div");
    inputContainer.style.display = "flex";
    inputContainer.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
    inputContainer.style.padding = "10px";
    inputContainer.style.height = "40px";

    // Create the prompt
    const prompt = document.createElement("span");
    prompt.textContent = "> ";
    prompt.style.color = "#00ff00";
    prompt.style.marginRight = "5px";

    // Create the input field
    this.input = document.createElement("input");
    this.input.id = "cli-input";
    this.input.type = "text";
    this.input.style.flexGrow = "1";
    this.input.style.backgroundColor = "transparent";
    this.input.style.border = "none";
    this.input.style.color = "#ffffff";
    this.input.style.fontFamily = "inherit";
    this.input.style.fontSize = "inherit";
    this.input.style.outline = "none";

    // Assemble the UI
    inputContainer.appendChild(prompt);
    inputContainer.appendChild(this.input);
    this.container.appendChild(this.output);
    this.container.appendChild(inputContainer);
    document.body.appendChild(this.container);

    // Set up event handlers
    this.setupEventHandlers();

    // Focus the input field
    this.input.focus();

    // Welcome message
    this.addOutput(
      'Geolantis360 Command Interface initialized. Type "help" for available commands.',
      "#00aaff"
    );

    // Add styles for the scrollbar and command line UI
    this.addStyles();

    // Make the console available globally
    window.mapConsole = {
      show: () => this.show(),
      hide: () => this.hide(),
      execute: (command) => this.execute(command),
      addOutput: (text, color) => this.addOutput(text, color),
      _commandLineInstance: this,
    };
    
    // Set up interception
    this.interceptAddImageFeature();

    return window.mapConsole;
  }

  /**
   * Add CSS styles for command line interface
   */
  addStyles() {
    const styleId = "command-line-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      /* Command Line Tool Styles */
      .tools-buttons {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 15px;
      }
      
      .tools-buttons sl-button {
        width: 100%;
        justify-content: flex-start;
        --sl-input-height-medium: 42px;
      }
      
      .tools-buttons sl-button::part(base) {
        border-radius: 4px;
        padding: 8px 12px;
        background-color: rgba(70, 130, 180, 0.7);
        border-color: rgba(70, 130, 180, 0.7);
        color: white;
        font-family: 'Roboto', sans-serif;
        text-align: left;
      }
      
      .tools-buttons sl-button::part(base):hover {
        background-color: rgba(70, 130, 180, 0.9);
        border-color: rgba(70, 130, 180, 0.9);
      }
      
      .tools-buttons sl-button[variant="primary"]::part(base) {
        background-color: #4682b4;
        border-color: #4682b4;
      }
      
      /* Command Line UI Improvements */
      #cli-container {
        border-radius: 5px 5px 0 0;
        max-height: 50vh;
        overflow: hidden;
        box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.3);
      }
      
      #cli-input {
        height: 30px;
        padding: 0 5px;
      }
      
      #cli-output::-webkit-scrollbar {
        width: 8px;
      }
      
      #cli-output::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
      }
      
      #cli-output::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
      }
      
      /* Custom shoelace button styling for the close button */
      #cli-container sl-button::part(base) {
        padding: 5px;
        font-size: 12px;
        background-color: transparent;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
      }
      
      #cli-container sl-button::part(base):hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Set up event handlers for the command line
   */
  setupEventHandlers() {
    // Command handling
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const command = this.input.value.trim();
        if (command) {
          // Add command to output
          this.addOutput(`> ${command}`, "#ffaa00");

          // Process command
          this.processCommand(command);

          // Add to history
          this.history.push(command);
          this.historyIndex = this.history.length;

          // Clear input
          this.input.value = "";
        }
      } else if (e.key === "ArrowUp") {
        // Navigate history up
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.input.value = this.history[this.historyIndex];
        }
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        // Navigate history down
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.input.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          this.input.value = "";
        }
        e.preventDefault();
      } else if (e.key === "Escape") {
        // Hide CLI
        this.hide();
        this.updateButtonStates();
      }
    });
  }

  /**
   * Add output to the command line
   * @param {string} text - The text to output
   * @param {string} color - The color of the text (CSS color)
   */
  addOutput(text, color = "#ffffff") {
    const element = document.createElement("div");
    element.textContent = text;
    element.style.color = color;
    element.style.margin = "5px 0";
    this.output.appendChild(element);
    this.output.scrollTop = this.output.scrollHeight;
  }

  /**
   * Handle database command
   * @param {Array} args - Command arguments
   */
  handleDatabaseCommand(args) {
    if (args.length === 0 || args[0] === "help") {
      this.addOutput(
        `
Database Commands:
db help     - Show this help
db count    - Show GeoObject table counts
db refresh  - Force refresh count display
db rtree    - Check R-Tree status and populate if needed
db tiles    - Check tile index status
db reindex  - Force rebuild all spatial indexes
db test     - Test if triggers are working correctly
db optimize - Recheck indexes and optimize queries
`,
        "#00ff00"
      );
      return;
    }

    const subCmd = args[0].toLowerCase();

    switch (subCmd) {
      case "count":
      case "counts":
        this.addOutput("Fetching database counts...", "#ffff00");
        
        // Call native Android method to get debug info
        // Try using the reha bridge if available
        if (window.reha && window.reha.sendReturnCallback) {
          try {
            const countsJson = window.reha.sendReturnCallback("getGeoObjectTableCounts", "");
            if (countsJson && countsJson !== "undefined") {
              const counts = JSON.parse(countsJson);
            
            this.addOutput("=== GeoObject Table Counts ===", "#00ff00");
            
            // Display main table counts
            if (counts.mainTable) {
              this.addOutput("Main Table:", "#00ffff");
              this.addOutput(`  Total objects: ${counts.mainTable.total || 0}`, "#ffffff");
              this.addOutput(`  Active objects: ${counts.mainTable.active || 0}`, "#ffffff");
            }
            
            // Display index table counts
            if (counts.indexTables) {
              this.addOutput("Index Tables:", "#00ffff");
              for (const [tableName, count] of Object.entries(counts.indexTables)) {
                if (count === -1) {
                  this.addOutput(`  ${tableName}: [does not exist]`, "#888888");
                } else {
                  this.addOutput(`  ${tableName}: ${count} rows`, "#ffffff");
                }
              }
            }
            
            // Display project-specific counts
            if (counts.currentProject) {
              this.addOutput(`Current Project (${counts.currentProject.name}):`, "#00ffff");
              this.addOutput(`  Object count: ${counts.currentProject.objectCount || 0}`, "#ffffff");
              this.addOutput(`  Total point count: ${counts.currentProject.pointCount || 0}`, "#ffffff");
            }
            
            // Display memory counts
            if (counts.memoryLoaded !== undefined) {
              this.addOutput(`Objects in memory: ${counts.memoryLoaded}`, "#ffff00");
            }
            
              this.addOutput("=== End of Table Counts ===", "#00ff00");
            } else {
              this.addOutput("No data returned from native bridge", "#ff0000");
              this.showMockData();
            }
            
          } catch (e) {
            this.addOutput(`Error getting counts: ${e.message}`, "#ff0000");
            this.showMockData();
          }
        } else {
          this.showMockData();
        }
        break;
        
      case "refresh":
        this.addOutput("Refreshing database counts...", "#ffff00");
        this.handleDatabaseCommand(["count"]);
        break;
        
      case "rtree":
        this.addOutput("Checking R-Tree status...", "#ffff00");
        
        if (window.reha && window.reha.sendReturnCallback) {
          try {
            const result = window.reha.sendReturnCallback("forceRTreePopulation", "");
            if (result && result !== "undefined") {
              const rtreeCount = parseInt(result);
              if (rtreeCount >= 0) {
                this.addOutput(`R-Tree contains ${rtreeCount} entries`, "#00ff00");
                if (rtreeCount === 0) {
                  this.addOutput("R-Tree is empty - no spatial data to index", "#ffff00");
                }
              } else {
                this.addOutput("Failed to populate R-Tree", "#ff0000");
              }
            } else {
              this.addOutput("No response from R-Tree check", "#ff0000");
            }
          } catch (e) {
            this.addOutput(`Error checking R-Tree: ${e.message}`, "#ff0000");
          }
        } else {
          this.addOutput("Native bridge not available", "#ff0000");
        }
        break;
        
      case "tiles":
        this.addOutput("Checking tile index status...", "#ffff00");
        
        if (window.reha && window.reha.sendReturnCallback) {
          try {
            const result = window.reha.sendReturnCallback("checkTileIndex", "");
            if (result && result !== "undefined") {
              const tileInfo = JSON.parse(result);
              this.addOutput(`Tile index entries: ${tileInfo.count}`, "#00ff00");
              this.addOutput(`Unique tiles: ${tileInfo.uniqueTiles}`, "#00ff00");
              if (tileInfo.count === 0) {
                this.addOutput("Tile index is empty - run 'db reindex' to populate", "#ffff00");
              }
            } else {
              this.addOutput("No response from tile index check", "#ff0000");
            }
          } catch (e) {
            this.addOutput(`Error checking tile index: ${e.message}`, "#ff0000");
          }
        } else {
          this.addOutput("Native bridge not available", "#ff0000");
        }
        break;

      case "reindex":
        this.addOutput("Force rebuilding all spatial indexes...", "#ffff00");
        this.addOutput("This may take a while for large datasets...", "#ffff00");
        
        if (window.reha && window.reha.sendReturnCallback) {
          try {
            const result = window.reha.sendReturnCallback("forceReindexAll", "");
            if (result && result !== "undefined") {
              const indexInfo = JSON.parse(result);
              this.addOutput("Spatial indexes rebuilt successfully!", "#00ff00");
              this.addOutput(`R-Tree entries: ${indexInfo.rtreeCount}`, "#00ff00");
              this.addOutput(`Tile index entries: ${indexInfo.tileCount}`, "#00ff00");
              this.addOutput(`Time taken: ${indexInfo.duration}ms`, "#00ff00");
            } else {
              this.addOutput("Reindexing completed", "#00ff00");
            }
          } catch (e) {
            this.addOutput(`Error rebuilding indexes: ${e.message}`, "#ff0000");
          }
        } else {
          this.addOutput("Native bridge not available", "#ff0000");
        }
        break;

      case "test":
        this.addOutput("Testing spatial index triggers...", "#ffff00");
        
        if (window.reha && window.reha.sendReturnCallback) {
          try {
            const result = window.reha.sendReturnCallback("testTriggers", "");
            if (result && result !== "undefined") {
              this.addOutput("Trigger test completed - check logs for details", "#00ff00");
              if (result === "OK") {
                this.addOutput("✓ Triggers are working correctly!", "#00ff00");
              } else {
                this.addOutput("✗ Triggers are NOT working!", "#ff0000");
                this.addOutput("Run 'db reindex' to manually rebuild indexes", "#ffff00");
              }
            } else {
              this.addOutput("Test completed", "#00ff00");
            }
          } catch (e) {
            this.addOutput(`Error testing triggers: ${e.message}`, "#ff0000");
          }
        } else {
          this.addOutput("Native bridge not available", "#ff0000");
        }
        break;

      case "optimize":
        this.addOutput("Rechecking database indexes...", "#ffff00");
        
        if (window.reha && window.reha.sendReturnCallback) {
          try {
            window.reha.sendReturnCallback("recheckIndexes", "");
            this.addOutput("Indexes rechecked - check logs for details", "#00ff00");
            
            // Show updated counts
            setTimeout(() => {
              this.handleDatabaseCommand(["count"]);
            }, 500);
          } catch (e) {
            this.addOutput(`Error optimizing: ${e.message}`, "#ff0000");
          }
        } else {
          this.addOutput("Native bridge not available", "#ff0000");
        }
        break;
        
      default:
        this.addOutput(`Unknown database command: ${subCmd}`, "#ff0000");
        this.addOutput("Type 'db help' for available commands", "#ffff00");
    }
  }

  /**
   * Show mock data for testing when bridge is not available
   */
  showMockData() {
    this.addOutput("Running in browser mode - showing mock data", "#ffff00");
    this.addOutput("=== GeoObject Table Counts (Mock) ===", "#00ff00");
    this.addOutput("Main Table:", "#00ffff");
    this.addOutput("  Total objects: 1234", "#ffffff");
    this.addOutput("  Active objects: 1200", "#ffffff");
    this.addOutput("Index Tables:", "#00ffff");
    this.addOutput("  geoobject_rtree: [does not exist]", "#888888");
    this.addOutput("  geoobject_rtree_map: [does not exist]", "#888888");
    this.addOutput("  basemap_index: 5678 rows", "#ffffff");
    this.addOutput("  basemap_id_to_oid: 5678 rows", "#ffffff");
    this.addOutput("Current Project (Demo Project):", "#00ffff");
    this.addOutput("  Object count: 456", "#ffffff");
    this.addOutput("  Total point count: 789", "#ffffff");
    this.addOutput("Objects in memory: 123", "#ffff00");
    this.addOutput("=== End of Table Counts ===", "#00ff00");
  }

  /**
   * Process a command
   * @param {string} command - The command to process
   */
  processCommand(command) {
    const parts = command.split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (cmd) {
        case "help":
          this.showHelp();
          break;

        case "log":
          this.handleLogCommand(args);
          break;
          
        case "android":
          this.handleAndroidCommand(args);
          break;
          
        case "footer":
          this.handleFooterCommand(args);
          break;

        case "clear":
          this.output.innerHTML = "";
          break;

        case "hide":
          this.hide();
          break;

        case "buttons":
        case "button":
          this.handleButtonCommand(args);
          break;

        case "testfeature":
          this.handleTestFeatureCommand(args);
          break;

        case "testpaste":
          this.handleTestPasteCommand();
          break;
          
        case "debugimage":
          this.debugLastImageCall();
          break;
          
        case "testimage":
          this.testSingleImage();
          break;
          
        case "checkfeaturecollection":
          this.installFeatureCollectionChecker();
          break;
          
        case "debuglayer":
          this.debugLayerInfo(args[0] || "objlayer");
          break;
          
        case "testfromandroid":
          this.testFromAndroidFormat();
          break;
          
        case "verifyimages":
          this.verifyImageDisplay();
          break;
          
        case "captureandroid":
          this.captureAndroidCalls();
          break;
          
        case "testquoted":
          this.testQuotedParameters();
          break;
          
        case "listsymbols":
          this.listSymbolLayers();
          break;
          
        case "fixlayer":
          this.fixObjLayer();
          break;
          
        case "createsymbol":
          this.createSymbolLayer(args[0] || "objlayer");
          break;
          
        case "testandroid5":
          this.testAndroid5Params();
          break;
          
        case "testbase64":
          this.testBase64Image(args.join(' '));
          break;
          
        case "traceflow":
          this.traceImageFlow();
          break;
          
        case "testdirect":
          this.testDirectSymbolLayer();
          break;
          
        case "capturebase64":
          this.captureBase64FromAndroid();
          break;

        case "tracecalls":
        case "trace":
          this.wrapAddFeature();
          break;

        case "snap":
          this.handleSnapCommand(args);
          break;
          
        case "presets":
        case "preset":
          this.handlePresetCommand(args);
          break;
          
        case "db":
        case "database":
          this.handleDatabaseCommand(args);
          break;
          
        case "perf":
        case "performance":
          this.handlePerfCommand(args);
          break;
          
        case "stakeout":
          if (args[0] === "debug") {
            if (App.Features && App.Features.StakeOut) {
              const isActive = App.Features.StakeOut.isActive();
              const mode = App.Features.StakeOut.getNavigationMode();
              const ui = App.Features.StakeOut.getUI();
              
              this.addOutput("StakeOut Debug Info:", "#00ff00");
              this.addOutput(`  Active: ${isActive}`, "#00ff00");
              this.addOutput(`  Mode: ${mode}`, "#00ff00");
              this.addOutput(`  UI exists: ${!!ui}`, "#00ff00");
              if (ui && ui.widget) {
                this.addOutput(`  Widget in DOM: ${document.body.contains(ui.widget)}`, "#00ff00");
                // Check if elements exist
                const distEl = document.getElementById("stakeout-distance");
                const xEl = document.getElementById("stakeout-x");
                const yEl = document.getElementById("stakeout-y");
                const zEl = document.getElementById("stakeout-z");
                this.addOutput(`  Distance element: ${!!distEl} (${distEl?.textContent || 'N/A'})`, "#00ff00");
                this.addOutput(`  X element: ${!!xEl} (${xEl?.textContent || 'N/A'})`, "#00ff00");
                this.addOutput(`  Y element: ${!!yEl} (${yEl?.textContent || 'N/A'})`, "#00ff00");
                this.addOutput(`  Z element: ${!!zEl} (${zEl?.textContent || 'N/A'})`, "#00ff00");
              }
            } else {
              this.addOutput("StakeOut feature not available", "#ff0000");
            }
          } else if (args[0] === "forceupdate") {
            if (App.Features && App.Features.StakeOut && App.Features.StakeOut.isActive()) {
              const ui = App.Features.StakeOut.getUI();
              if (ui) {
                // Force create widget if needed
                if (!ui.widget || !document.body.contains(ui.widget)) {
                  ui.createWidget();
                }
                // Force update with dummy data to test
                ui.updateNavigation([0, 0], [1, 1], 157.25);
                this.addOutput("Forced StakeOut UI update", "#00ff00");
              }
            } else {
              this.addOutput("StakeOut not active", "#ff0000");
            }
          } else if (args[0] === "testui") {
            // Test StakeOut UI directly
            const existingWidgets = document.querySelectorAll("#stakeout-widget");
            this.addOutput(`Found ${existingWidgets.length} StakeOut widgets`, "#00ff00");
            
            // Remove any duplicates
            for (let i = 1; i < existingWidgets.length; i++) {
              existingWidgets[i].remove();
              this.addOutput("Removed duplicate widget", "#ffff00");
            }
            
            // Test update
            const distEl = document.getElementById("stakeout-distance");
            if (distEl) {
              this.addOutput(`Current distance text: "${distEl.textContent}"`, "#00ff00");
              distEl.textContent = "TEST";
              this.addOutput(`After test update: "${distEl.textContent}"`, "#00ff00");
            } else {
              this.addOutput("Distance element not found!", "#ff0000");
            }
            
            // Check all stakeout elements
            const elements = ["stakeout-distance", "stakeout-x", "stakeout-y", "stakeout-z"];
            elements.forEach(id => {
              const el = document.getElementById(id);
              if (el) {
                this.addOutput(`${id}: "${el.textContent}" (parent: ${el.parentElement?.className})`, "#00ff00");
              }
            });
          } else if (args[0] === "fix") {
            // Try to fix the update issue
            if (App.Features && App.Features.StakeOut) {
              const ui = App.Features.StakeOut.getUI();
              if (ui && ui.widget) {
                // Re-setup event delegation
                console.log("[StakeOut] Attempting to fix update issue");
                
                // Force a test update
                const testUpdate = () => {
                  const distEl = document.getElementById("stakeout-distance");
                  const xEl = document.getElementById("stakeout-x");
                  const yEl = document.getElementById("stakeout-y");
                  
                  if (distEl) distEl.textContent = "999.99";
                  if (xEl) xEl.textContent = "888.88m";
                  if (yEl) yEl.textContent = "777.77m";
                  
                  console.log("[StakeOut] Test values set");
                };
                
                testUpdate();
                this.addOutput("Applied test values - check if they persist", "#00ff00");
              }
            }
          } else if (args[0] === "debugon") {
            window.debugStakeOut = true;
            this.addOutput("StakeOut debugging enabled - recreate widget to start monitoring", "#00ff00");
          } else if (args[0] === "debugoff") {
            window.debugStakeOut = false;
            this.addOutput("StakeOut debugging disabled", "#00ff00");
          } else if (args[0] === "styles") {
            // Check computed styles of elements
            const checkElement = (id) => {
              const el = document.getElementById(id);
              if (el) {
                const styles = window.getComputedStyle(el);
                this.addOutput(`${id}:`, "#00ff00");
                this.addOutput(`  Text: "${el.textContent}"`, "#00ff00");
                this.addOutput(`  Display: ${styles.display}`, "#00ff00");
                this.addOutput(`  Visibility: ${styles.visibility}`, "#00ff00");
                this.addOutput(`  Opacity: ${styles.opacity}`, "#00ff00");
                this.addOutput(`  Color: ${styles.color}`, "#00ff00");
                this.addOutput(`  Z-index: ${styles.zIndex}`, "#00ff00");
                this.addOutput(`  Position: ${styles.position}`, "#00ff00");
                
                // Check if there are any pseudo-elements
                const before = window.getComputedStyle(el, '::before');
                const after = window.getComputedStyle(el, '::after');
                if (before.content !== 'none') {
                  this.addOutput(`  ::before content: ${before.content}`, "#ffff00");
                }
                if (after.content !== 'none') {
                  this.addOutput(`  ::after content: ${after.content}`, "#ffff00");
                }
              }
            };
            
            checkElement("stakeout-distance");
            checkElement("stakeout-x");
          } else if (args[0] === "help") {
            this.addOutput("StakeOut Navigation Help:", "#00ff00");
            this.addOutput("", "#00ff00");
            this.addOutput("Mode Toggle:", "#00ff00");
            this.addOutput("  Click mode button or use quick toggle", "#00ff00");
            this.addOutput("  Modes: Segments → Lines → Nodes", "#00ff00");
            this.addOutput("", "#00ff00");
            this.addOutput("Node Mode Navigation:", "#00ff00");
            this.addOutput("  • Click on any blue node marker to select it", "#00ff00");
            this.addOutput("  • Tab or → : Next node", "#00ff00");
            this.addOutput("  • Shift+Tab or ← : Previous node", "#00ff00");
            this.addOutput("  • 1-9 keys: Jump to node 1-9", "#00ff00");
            this.addOutput("  • Selected node shows in orange", "#00ff00");
            this.addOutput("  • Closest node auto-selects when moving", "#00ff00");
            this.addOutput("", "#00ff00");
            this.addOutput("Stop Button: Click red stop button to exit StakeOut", "#00ff00");
          }
          break;

        case "center":
          this.handleCenterCommand(args);
          break;

        case "zoom":
          this.handleZoomCommand(args);
          break;

        case "layers":
          this.handleLayersCommand(args);
          break;

        case "toggle":
          this.handleToggleCommand(args);
          break;

        case "bounds":
          this.handleBoundsCommand();
          break;

        case "eval":
          this.handleEvalCommand(args);
          break;

        case "position":
          this.handlePositionCommand(args);
          break;

        case "basemap":
          this.handleBasemapCommand(args);
          break;

        case "wms":
          this.handleWmsCommand(args);
          break;

        case "gnss":
          this.handleGnssCommand(args);
          break;

        case "debug":
          this.handleDebugCommand(args);
          break;

        // Standalone button commands for direct access
        case "show-gnss":
          this.showGnssButton();
          break;

        case "hide-gnss":
          this.hideGnssButton();
          break;

        case "show-snap":
          this.showSnapButton();
          break;

        case "hide-snap":
          this.hideSnapButton();
          break;

        case "show-all":
          this.showGnssButton();
          this.showSnapButton();
          this.addOutput("All buttons shown", "#00ff00");
          break;

        case "hide-all":
          this.hideGnssButton();
          this.hideSnapButton();
          this.addOutput("All buttons hidden", "#00ff00");
          break;

        case "list":
          this.listButtons();
          break;

        case "enable-snap":
          this.enableSnapping();
          break;

        case "disable-snap":
          this.disableSnapping();
          break;

        case "toggle-snap":
          this.toggleSnapping();
          break;

        case "besitzer":
          this.handleBesitzerCommand(args);
          break;

        default:
          this.addOutput(
            `Unknown command: ${cmd}. Type "help" for available commands.`,
            "#ff0000"
          );
      }
    } catch (error) {
      this.addOutput(`Error: ${error.message}`, "#ff0000");
      console.error(error);
    }
  }

  /**
   * Execute a command programmatically
   * @param {string} command - The command to execute
   */
  execute(command) {
    this.addOutput(`> ${command}`, "#ffaa00");
    this.processCommand(command);
  }

  /**
   * Show the command line
   */
  show() {
    this.container.style.display = "flex";
    this.input.focus();
  }

  /**
   * Hide the command line
   */
  hide() {
    this.container.style.display = "none";
  }

  /**
   * Update button states based on command line visibility
   */
  updateButtonStates() {
    const isVisible = this.container.style.display !== "none";

    // Update the tools panel button if it exists
    const toolsPanelButton = document.getElementById(
      "command-line-tool-button"
    );
    if (toolsPanelButton) {
      toolsPanelButton.variant = isVisible ? "primary" : "default";
    }

    // Update the original floating button if it exists
    const consoleButton = document.getElementById("console-button");
    if (consoleButton) {
      consoleButton.style.backgroundColor = isVisible ? "#4682b4" : "#FFFFF0";
      consoleButton.style.color = isVisible ? "white" : "black";
    }
  }

  /**
   * Add command line button to the tools panel section
   */
  addCommandLineButtonToTools = function () {
    // Find the tools panel (in left2-drawer under the "ux" tab)
    const toolsPanel = document.querySelector(
      'sl-tab-panel[name="ux"] .placeholder-content'
    );

    if (toolsPanel) {
      // Remove the placeholder text if present
      const placeholderText = toolsPanel.querySelector("p");
      if (placeholderText) {
        placeholderText.remove();
      }

      // Create container for tools buttons
      let toolsContainer = toolsPanel.querySelector(".tools-buttons");
      if (!toolsContainer) {
        toolsContainer = document.createElement("div");
        toolsContainer.className = "tools-buttons";
        toolsPanel.appendChild(toolsContainer);
      }

      // Create command line button
      if (!document.getElementById("command-line-tool-button")) {
        // Create a proper Geolantis styled button div instead of sl-button
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "tool-button-container";
        buttonContainer.style.margin = "10px 0";

        const commandLineButton = document.createElement("div");
        commandLineButton.id = "command-line-tool-button";
        commandLineButton.className = "custom-tool-button";

        // Style to match the design shown in the screenshot
        commandLineButton.style.display = "flex";
        commandLineButton.style.alignItems = "center";
        commandLineButton.style.padding = "15px";
        commandLineButton.style.backgroundColor = "white";
        commandLineButton.style.border = "1px solid #e0e0e0";
        commandLineButton.style.borderRadius = "4px";
        commandLineButton.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
        commandLineButton.style.cursor = "pointer";
        commandLineButton.style.transition = "all 0.2s ease";

        // Icon container
        const iconContainer = document.createElement("div");
        iconContainer.style.width = "40px";
        iconContainer.style.height = "40px";
        iconContainer.style.display = "flex";
        iconContainer.style.alignItems = "center";
        iconContainer.style.justifyContent = "center";
        iconContainer.style.marginRight = "15px";
        iconContainer.style.color = "#4682b4"; // Geolantis blue

        // Add terminal icon (using a standard HTML version instead of sl-icon)
        const terminalIcon = document.createElement("div");
        terminalIcon.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 17 10 11 4 5"></polyline>
            <line x1="12" y1="19" x2="20" y2="19"></line>
          </svg>
        `;
        iconContainer.appendChild(terminalIcon);

        // Add text
        const textSpan = document.createElement("span");
        textSpan.textContent = "Command Line Tool";
        textSpan.style.fontSize = "16px";
        textSpan.style.fontFamily = "Roboto, sans-serif";
        textSpan.style.color = "#333";

        // Assemble button
        commandLineButton.appendChild(iconContainer);
        commandLineButton.appendChild(textSpan);
        buttonContainer.appendChild(commandLineButton);

        // Add active/hover states
        commandLineButton.addEventListener("mouseover", function () {
          this.style.backgroundColor = "#f5f5f5";
          this.style.boxShadow = "0 2px 5px rgba(0,0,0,0.15)";
        });

        commandLineButton.addEventListener("mouseout", function () {
          if (!this.classList.contains("active")) {
            this.style.backgroundColor = "white";
            this.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
          }
        });

        // Make absolutely sure we have a direct click handler on the button
        commandLineButton.onclick = function (e) {
          console.log("Command line button clicked!");
          e.stopPropagation();

          // Check if command line is initialized yet
          if (!window.mapConsole) {
            console.log("Initializing command line...");
            initEnhancedCommandLine();
            return;
          }

          // Toggle command line visibility
          const cliContainer = document.getElementById("cli-container");
          if (cliContainer) {
            const isVisible =
              window.getComputedStyle(cliContainer).display !== "none";
            console.log("CLI visibility:", isVisible ? "visible" : "hidden");

            if (isVisible) {
              window.mapConsole.hide();

              // Remove active state
              this.classList.remove("active");
              this.style.backgroundColor = "white";
              this.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            } else {
              window.mapConsole.show();

              // Add active state
              this.classList.add("active");
              this.style.backgroundColor = "#f5f5f5";
              this.style.boxShadow = "0 2px 5px rgba(0,0,0,0.15)";
            }
          } else {
            console.error("Command line container not found!");
          }
        };

        // Also make the container clickable to increase hit area
        buttonContainer.onclick = function (e) {
          // Just delegate to the button click
          if (e.target !== commandLineButton) {
            commandLineButton.onclick(e);
          }
        };

        // Add button to the tools container
        toolsContainer.appendChild(buttonContainer);

        console.log("Command line button added to tools panel");

        // Hide the floating button if it exists
        const floatingButton = document.getElementById("console-button");
        if (floatingButton) {
          floatingButton.style.display = "none";
        }

        return true;
      }
    }

    return false;
  };
  /**
   * Show help information
   */
  showHelp() {
    this.addOutput(
      `
Available commands:
help          - Show available commands
clear         - Clear the console output
hide          - Hide the command line interface
center        - Get or set the map center
zoom          - Get or set the map zoom level
db            - Database debug commands (db help for more)
layers        - Layer management commands
               Usage: layers [command]
               Available layer commands:
               - all (or none) : List all map layers
               - background    : List background and raster layers
               - geojson       : List GeoJSON layers
               - layers geojson-full : Show detailed information about GeoJSON layers
               - objects       : List top 10 GeoJSON objects across all layers
               - objects-by-layer : List top 10 GeoJSON objects for each layer
               - layers objects-full   : Show detailed information about top GeoJSON objects
               - layers objects-by-layer-full : Show detailed information about GeoJSON objects by layer
               - layers raw [layer_id] [limit] - Show raw GeoJSON for features (default: 1 feature)
               - layers raw-geojson [layer_id] [limit] - Show raw GeoJSON for features (default: 1 feature)
               - help          : Show layer command help
toggle        - Toggle layer visibility (toggle layerId)
bounds        - Get current map bounds
eval          - Evaluate JavaScript code (eval code...)
position      - Get or set current position marker
basemap       - Get or set the basemap
wms           - Inspect WMS capabilities or add WMS layers
               Usage: wms <url> [layer] [crs]
               Examples:
               - wms https://data.bev.gv.at/geoserver/BEVdataKAT/wms
               - wms https://data.bev.gv.at/geoserver/BEVdataKAT/wms DKM_GST
               - wms https://data.bev.gv.at/geoserver/BEVdataKAT/wms DKM_GST EPSG:31287

gnss          - GNSS Simulator commands
               Use "gnss help" for more details

debug         - Debug related commands
               Usage: debug [command]
               Available debug commands:
               - status       : Show current debug status
               - enable       : Enable all debug features 
               - disable      : Disable all debug features
               - panel        : Show visual debug panel
               - test         : Test status update functions
               - logupdates   : Log all status updates to console
               - dom          : Test DOM status elements
               
buttons       - Button visibility control commands

preset        - Preset management commands
               Usage: preset [command]
               Available preset commands:
               - layers       : Show layer presets dialog
               - ui           : Show UI presets dialog
               - buttons      : Add preset buttons to UI
               - list layers  : List all layer presets
               - list ui      : List all UI presets
               - load <id>    : Load a preset by ID

Image debugging:
testimage     - Test adding a single image feature
testpaste     - Execute test features from paste.txt
testfromandroid - Test Android-style image feature call
testquoted    - Test with quoted parameters (like Android)
testandroid5  - Test with exactly 5 params like Android
testbase64    - Test base64 image validity
testdirect    - Test direct symbol layer creation
traceflow     - Trace complete image/layer flow
captureandroid - Capture and analyze Android calls
verifyimages  - Verify image display setup
fixlayer      - Fix objlayer setup and test with red circle
listsymbols   - List all symbol layers and their properties
createsymbol  - Manually create symbol layer
debugimage    - Show details of last image call
debuglayer    - Debug layer info (usage: debuglayer [layerId])
tracecalls    - Enable call tracing for addImageFeature
               Usage: buttons [command]
               Available button commands:
               - list         : List all control buttons and their status
               - show all     : Show all available buttons
               - hide all     : Hide all control buttons
               - show gnss    : Show GNSS simulator button
               - hide gnss    : Hide GNSS simulator button
               - show snap    : Show snapping button
               - hide snap    : Hide snapping button
               
snap          - Snapping functionality control
               Usage: snap [command]
               Available snap commands:
               - enable       : Enable snapping and show button
               - disable      : Disable snapping
               - toggle       : Toggle snapping state
               - status       : Show current snapping status

log           - GeoJSON conversion logging commands
               Usage: log [command]
               Available log commands:
               - help      : Show log command help
               - status    : Show current logging status  
               - enable    : Enable GeoJSON conversion logging
               - disable   : Disable GeoJSON conversion logging
               - clear     : Clear the log history
               - show      : Show the latest log entries
               - last      : Show the last GeoJSON conversion
               - save      : Save logs to file
               - filter    : Filter logs by type
               
Direct button commands:
show-gnss     - Show GNSS simulator button
hide-gnss     - Hide GNSS simulator button
show-snap     - Show snapping button
hide-snap     - Hide snapping button
show-all      - Show all buttons
hide-all      - Hide all buttons
list          - List all button statuses
enable-snap   - Enable snapping
disable-snap  - Disable snapping
toggle-snap   - Toggle snapping state
`,
      "#00ff00"
    );
  }

  /**
   * Handle button commands
   * @param {Array} args - Command arguments
   */
  handleButtonCommand(args) {
    if (args.length === 0 || args[0] === "help") {
      this.addOutput(
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
        this.listButtons();
        break;

      case "show":
        if (target === "all") {
          this.showGnssButton();
          this.showSnapButton();
          this.addOutput("All buttons shown", "#00ff00");
        } else if (target === "gnss") {
          this.showGnssButton();
        } else if (target === "snap") {
          this.showSnapButton();
        } else {
          this.addOutput(
            `Unknown button type: ${target}. Use 'buttons help' for available commands.`,
            "#ff0000"
          );
        }
        break;

      case "hide":
        if (target === "all") {
          this.hideGnssButton();
          this.hideSnapButton();
          this.addOutput("All buttons hidden", "#00ff00");
        } else if (target === "gnss") {
          this.hideGnssButton();
        } else if (target === "snap") {
          this.hideSnapButton();
        } else {
          this.addOutput(
            `Unknown button type: ${target}. Use 'buttons help' for available commands.`,
            "#ff0000"
          );
        }
        break;

      default:
        this.addOutput(
          `Unknown button command: ${action}. Use 'buttons help' for available commands.`,
          "#ff0000"
        );
    }
  }

  // Add this to your EnhancedCommandLine class in commandline-interface.js

  /**
   * Handle logging command
   * @param {Array} args - Command arguments
   */
  handleLogCommand(args) {
    if (args.length === 0 || args[0] === "help") {
      this.addOutput(
        `
Logging Commands:
log help     - Show this help
log status   - Show current logging status
log enable   - Enable GeoJSON conversion logging
log disable  - Disable GeoJSON conversion logging
log clear    - Clear the log history
log show     - Show the latest log entries
log last     - Show the last GeoJSON conversion
log save     - Save logs to file
log filter <type> - Filter logs by type (e.g. 'geometry', 'feature')
`,
        "#00ff00"
      );
      return;
    }

    const subCmd = args[0].toLowerCase();

    // Initialize logs storage if needed
    if (!window.geoJsonLogs) {
      window.geoJsonLogs = {
        enabled: false,
        entries: [],
        filterType: null,
      };
    }

    switch (subCmd) {
      case "status":
        const status = window.geoJsonLogs.enabled ? "enabled" : "disabled";
        const filter = window.geoJsonLogs.filterType
          ? `(filtered to '${window.geoJsonLogs.filterType}')`
          : "(no filter)";
        const count = window.geoJsonLogs.entries.length;

        this.addOutput(
          `GeoJSON conversion logging is ${status} ${filter}`,
          "#00ff00"
        );
        this.addOutput(`Total log entries: ${count}`, "#00ff00");
        break;

      case "websocket":
        if (args.length > 1 && args[1] === "help") {
          this.addOutput(
            "WebSocket Export Commands:\n" +
              "log websocket ws://IP:PORT - Send logs to a WebSocket server\n" +
              "log websocket status      - Check WebSocket connection status\n" +
              "log websocket disconnect  - Disconnect from WebSocket server\n" +
              "log websocket help        - Show this help",
            "#00ff00"
          );
        } else if (args.length > 1 && args[1] === "status") {
          this.checkWebSocketStatus();
        } else if (args.length > 1 && args[1] === "disconnect") {
          this.disconnectWebSocket();
        } else if (args.length > 1 && args[1].startsWith("ws")) {
          this.webviewCompatibleWebSocket(args[1]);
        } else {
          this.addOutput(
            "Please specify a valid WebSocket URL (starting with ws://)",
            "#ff0000"
          );
          this.addOutput("Usage: log websocket ws://IP:PORT", "#aaaaaa");
          this.addOutput(
            "Example: log websocket ws://192.168.1.100:8080",
            "#aaaaaa"
          );
        }
        break;

      case "paste":
        this.exportToTemporaryPaste();
        break;

      case "dataurl":
        if (args.length > 1 && args[1] === "help") {
          this.addOutput(
            "Data URL Export Commands:\n" +
              "log dataurl         - Generate a data URL with the logs\n" +
              "log dataurl pretty  - Generate a data URL with formatted logs\n" +
              "log dataurl html    - Generate a formatted HTML version with the logs\n" +
              "log dataurl help    - Show this help",
            "#00ff00"
          );
        } else if (args.length > 1 && args[1] === "pretty") {
          this.generatePrettyDataUrlExternal();
        } else if (args.length > 1 && args[1] === "html") {
          this.generateHtmlDataUrlExternal();
        } else {
          this.generateDataUrlExternal();
        }
        break;

      case "enable":
        this.enableGeoJsonLogging();
        break;

      case "disable":
        this.disableGeoJsonLogging();
        break;

      case "clear":
        window.geoJsonLogs.entries = [];
        this.addOutput("Log history cleared", "#00ff00");
        break;

      case "show":
        this.showGeoJsonLogs();
        break;
      case "clipboard":
        this.exportToClipboard();
        break;

      case "last":
        this.showLastGeoJsonLog();
        break;

      case "save":
        this.saveGeoJsonLogs();
        break;

      case "qrcode":
        this.simpleQRCodeExport();
        break;

      case "filter":
        if (args.length < 2) {
          this.addOutput(
            "Please specify a filter type (or 'none' to clear filters)",
            "#ff0000"
          );
          break;
        }

        const filterType =
          args[1].toLowerCase() === "none" ? null : args[1].toLowerCase();
        window.geoJsonLogs.filterType = filterType;

        this.addOutput(
          filterType
            ? `Logs filtered to type: ${filterType}`
            : "Log filtering disabled",
          "#00ff00"
        );
        break;

      default:
        this.addOutput(
          `Unknown log command: ${subCmd}. Use 'log help' for available commands.`,
          "#ff0000"
        );
    }
  }

  /**
   * Export logs to a temporary anonymous paste service
   */
  exportToTemporaryPaste() {
    // Get logs using the same method that works in QR code
    var logs = this.getAllLogs();

    if (!logs || logs.length === 0) {
      this.addOutput("No logs available to export", "#ffaa00");
      return;
    }

    try {
      // Format logs as JSON (pretty printed for readability)
      var logsJson = JSON.stringify(logs, null, 2);

      // Get byte size
      var byteSize = new Blob([logsJson]).size;
      var kilobyteSize = (byteSize / 1024).toFixed(2);

      this.addOutput(
        "Preparing " +
          kilobyteSize +
          " KB of log data (" +
          logs.length +
          " entries)",
        "#00aaff"
      );

      // Create a container for status and buttons
      var container = document.createElement("div");
      container.style.margin = "10px 0";
      container.style.padding = "10px";
      container.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
      container.style.borderRadius = "4px";

      // Add title
      var title = document.createElement("div");
      title.textContent = "Remote Paste Log Export";
      title.style.fontWeight = "bold";
      title.style.marginBottom = "10px";
      container.appendChild(title);

      // Add status message
      var status = document.createElement("div");
      status.id = "paste-status";
      status.textContent = "Ready to export logs to temporary storage";
      status.style.marginBottom = "15px";
      container.appendChild(status);

      // Create a button to trigger export
      var exportButton = document.createElement("button");
      exportButton.textContent = "Upload Logs to Temporary Storage";
      exportButton.style.display = "block";
      exportButton.style.width = "100%";
      exportButton.style.padding = "12px 16px";
      exportButton.style.backgroundColor = "#4285f4";
      exportButton.style.color = "white";
      exportButton.style.border = "none";
      exportButton.style.borderRadius = "4px";
      exportButton.style.fontFamily = "inherit";
      exportButton.style.marginBottom = "15px";
      exportButton.style.fontWeight = "bold";
      exportButton.style.fontSize = "16px";
      exportButton.style.cursor = "pointer";

      var self = this;

      // Function to update status
      function updateStatus(message, color) {
        var statusElem = document.getElementById("paste-status");
        if (statusElem) {
          statusElem.textContent = message;
          if (color) {
            statusElem.style.color = color;
          }
        }
        self.addOutput(message, color || "#ffffff");
      }

      // Handle click on export button
      exportButton.onclick = function () {
        exportButton.disabled = true;
        exportButton.textContent = "Uploading...";
        exportButton.style.backgroundColor = "#999999";

        updateStatus("Uploading logs to temporary storage...", "#00aaff");

        // Try uploading to an anonymous paste service
        self.uploadToPastebin(logsJson, function (err, result) {
          if (err) {
            updateStatus("Error: " + err, "#ff0000");
            exportButton.textContent = "Retry Upload";
            exportButton.disabled = false;
            exportButton.style.backgroundColor = "#4285f4";
            return;
          }

          // Successfully uploaded
          updateStatus("Logs uploaded successfully!", "#00ff00");

          // Change button to show URL
          exportButton.textContent = "Open Logs in Browser";
          exportButton.disabled = false;
          exportButton.style.backgroundColor = "#0f9d58";

          // Store URL for button click
          exportButton.setAttribute("data-url", result.url);
          exportButton.onclick = function () {
            var url = this.getAttribute("data-url");
            self.openInExternalBrowser(url);
          };

          // Display URL in UI
          var urlDisplay = document.createElement("div");
          urlDisplay.style.marginTop = "10px";
          urlDisplay.style.marginBottom = "10px";
          urlDisplay.style.padding = "8px";
          urlDisplay.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
          urlDisplay.style.borderRadius = "4px";
          urlDisplay.style.wordBreak = "break-all";
          urlDisplay.style.fontSize = "14px";
          urlDisplay.textContent = result.url;
          container.insertBefore(urlDisplay, exportButton.nextSibling);

          // Add expiration info
          var expiryInfo = document.createElement("div");
          expiryInfo.style.marginTop = "10px";
          expiryInfo.style.fontSize = "12px";
          expiryInfo.textContent = "Note: This link will expire after 24 hours";
          container.appendChild(expiryInfo);
        });
      };

      container.appendChild(exportButton);

      // Add instructions
      var instructions = document.createElement("div");
      instructions.style.marginTop = "10px";
      instructions.style.fontSize = "13px";
      instructions.textContent =
        "This will upload your logs to a temporary anonymous storage service. You'll get a URL you can open in any browser.";
      container.appendChild(instructions);

      // Add container to output
      var outputContainer = document.getElementById("cli-output");
      if (outputContainer) {
        outputContainer.appendChild(container);
      } else {
        this.addOutput("Could not create export UI", "#ff0000");
      }
    } catch (error) {
      this.addOutput("Error preparing logs: " + error.message, "#ff0000");
    }
  }

  /**
   * Export logs to clipboard
   */
  exportToClipboard() {
    // Get logs using the same method that works in QR code
    var logs = this.getAllLogs();

    if (!logs || logs.length === 0) {
      this.addOutput("No logs available to export", "#ffaa00");
      return;
    }

    try {
      // Format logs as JSON (pretty printed for readability)
      var logsJson = JSON.stringify(logs, null, 2);

      // Get byte size
      var byteSize = new Blob([logsJson]).size;
      var kilobyteSize = (byteSize / 1024).toFixed(2);

      this.addOutput(
        "Preparing " +
          kilobyteSize +
          " KB of log data (" +
          logs.length +
          " entries)",
        "#00aaff"
      );

      // Create a container for the clipboard functionality
      var container = document.createElement("div");
      container.style.margin = "10px 0";
      container.style.padding = "10px";
      container.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
      container.style.borderRadius = "4px";

      // Add title
      var title = document.createElement("div");
      title.textContent = "Clipboard Log Export";
      title.style.fontWeight = "bold";
      title.style.marginBottom = "10px";
      container.appendChild(title);

      // Create hidden textarea for copying
      var textarea = document.createElement("textarea");
      textarea.value = logsJson;
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      document.body.appendChild(textarea);

      // Create copy button
      var copyButton = document.createElement("button");
      copyButton.textContent = "Copy Logs to Clipboard";
      copyButton.style.display = "block";
      copyButton.style.width = "100%";
      copyButton.style.padding = "12px 16px";
      copyButton.style.backgroundColor = "#4285f4";
      copyButton.style.color = "white";
      copyButton.style.border = "none";
      copyButton.style.borderRadius = "4px";
      copyButton.style.fontFamily = "inherit";
      copyButton.style.marginBottom = "15px";
      copyButton.style.fontWeight = "bold";
      copyButton.style.fontSize = "16px";
      copyButton.style.cursor = "pointer";

      var self = this;
      copyButton.onclick = function () {
        try {
          // Select the text
          textarea.focus();
          textarea.select();

          // Execute copy command
          var successful = document.execCommand("copy");

          if (successful) {
            copyButton.textContent = "✓ Copied to Clipboard!";
            copyButton.style.backgroundColor = "#0f9d58";
            self.addOutput("Logs copied to clipboard successfully!", "#00ff00");
          } else {
            throw new Error("Copy command failed");
          }
        } catch (err) {
          copyButton.textContent = "Copy Failed - Try Alternatives";
          copyButton.style.backgroundColor = "#db4437";
          self.addOutput("Failed to copy: " + err.message, "#ff0000");

          // Show manual select instructions
          showManualInstructions();
        }
      };

      container.appendChild(copyButton);

      // Create an overflow text area with the content
      var previewContainer = document.createElement("div");
      previewContainer.style.marginTop = "10px";
      previewContainer.style.marginBottom = "10px";

      var previewTitle = document.createElement("div");
      previewTitle.textContent =
        "Log Preview (select all and copy manually if button doesn't work)";
      previewTitle.style.marginBottom = "5px";
      previewTitle.style.fontSize = "12px";
      previewContainer.appendChild(previewTitle);

      var preview = document.createElement("pre");
      preview.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
      preview.style.color = "#ffffff";
      preview.style.padding = "10px";
      preview.style.borderRadius = "4px";
      preview.style.overflow = "auto";
      preview.style.maxHeight = "200px";
      preview.style.fontSize = "12px";
      preview.style.whiteSpace = "pre-wrap";
      preview.style.wordBreak = "break-all";
      preview.textContent = logsJson;
      previewContainer.appendChild(preview);

      // Function to show manual instructions
      function showManualInstructions() {
        previewTitle.textContent =
          "Select all text below and copy manually (Ctrl+A then Ctrl+C)";
        previewTitle.style.color = "#ffaa00";
        previewTitle.style.fontWeight = "bold";
      }

      container.appendChild(previewContainer);

      // Add container to output
      var outputContainer = document.getElementById("cli-output");
      if (outputContainer) {
        outputContainer.appendChild(container);
      } else {
        this.addOutput("Could not create clipboard UI", "#ff0000");
      }

      // Clean up
      setTimeout(function () {
        document.body.removeChild(textarea);
      }, 5000);
    } catch (error) {
      this.addOutput(
        "Error generating clipboard data: " + error.message,
        "#ff0000"
      );
    }
  }

  /**
   * Upload logs to a pastebin service
   * @param {string} content - Log content to upload
   * @param {function} callback - Callback function(error, result)
   */
  uploadToPastebin(content, callback) {
    // Try multiple pastebin services in order
    this.uploadToHastebin(
      content,
      function (err, result) {
        if (!err && result) {
          callback(null, result);
        } else {
          // If the first service fails, try a different one
          this.uploadToTempPaste(content, callback);
        }
      }.bind(this)
    );
  }

  /**
   * Upload to hastebin.com
   * @param {string} content - Content to upload
   * @param {function} callback - Callback(error, result)
   */
  uploadToHastebin(content, callback) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "https://hastebin.com/documents", true);
      xhr.setRequestHeader("Content-Type", "text/plain");

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              var response = JSON.parse(xhr.responseText);
              if (response.key) {
                callback(null, {
                  url: "https://hastebin.com/" + response.key,
                  service: "hastebin",
                });
              } else {
                callback("Invalid response from server");
              }
            } catch (e) {
              callback("Error parsing response: " + e.message);
            }
          } else {
            callback("Server returned status " + xhr.status);
          }
        }
      };

      xhr.onerror = function () {
        callback("Network error occurred");
      };

      xhr.send(content);
    } catch (e) {
      callback("Error sending request: " + e.message);
    }
  }

  /**
   * Upload to temp.sh
   * @param {string} content - Content to upload
   * @param {function} callback - Callback(error, result)
   */
  uploadToTempPaste(content, callback) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "https://temp.sh/upload", true);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              // This service returns the URL directly in the response
              var url = xhr.responseText.trim();
              if (url.startsWith("https://")) {
                callback(null, {
                  url: url,
                  service: "temp.sh",
                });
              } else {
                callback("Invalid response from server");
              }
            } catch (e) {
              callback("Error processing response: " + e.message);
            }
          } else {
            callback("Server returned status " + xhr.status);
          }
        }
      };

      xhr.onerror = function () {
        callback("Network error occurred");
      };

      // Create form data with file
      var formData = new FormData();
      var blob = new Blob([content], { type: "text/plain" });
      formData.append("file", blob, "logs.json");

      xhr.send(formData);
    } catch (e) {
      callback("Error sending request: " + e.message);
    }
  }

  /**
   * Open a URL in the external browser
   * @param {string} url - URL to open
   */
  openInExternalBrowser(url) {
    // Method 1: Using window.open with _system target (works in Cordova WebViews)
    try {
      window.open(url, "_system");
      return;
    } catch (e) {
      console.log("Method 1 failed:", e);
    }

    // Method 2: Using location.href for regular URLs (should be allowed by most WebViews)
    try {
      window.location.href = url;
      return;
    } catch (e) {
      console.log("Method 2 failed:", e);
    }

    // Method 3: Fallback for regular URLs
    location.href = url;
  }

  webviewCompatibleWebSocket(wsAddress) {
    // Get logs using the same method that works in QR code
    var logs = this.getAllLogs();

    if (!logs || logs.length === 0) {
      this.addOutput("No logs available to export via WebSocket", "#ffaa00");
      return;
    }

    var self = this;

    // Create a status container in the UI
    var statusContainer = document.createElement("div");
    statusContainer.style.margin = "10px 0";
    statusContainer.style.padding = "10px";
    statusContainer.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
    statusContainer.style.borderRadius = "4px";

    var statusTitle = document.createElement("div");
    statusTitle.textContent = "WebSocket Transfer Status";
    statusTitle.style.fontWeight = "bold";
    statusTitle.style.marginBottom = "10px";
    statusContainer.appendChild(statusTitle);

    var statusText = document.createElement("div");
    statusText.id = "ws-status-text";
    statusText.textContent = "Initializing WebSocket connection...";
    statusContainer.appendChild(statusText);

    var outputContainer = document.getElementById("cli-output");
    if (outputContainer) {
      outputContainer.appendChild(statusContainer);
    }

    // Helper function to update status
    function updateStatus(message, color) {
      self.addOutput(message, color || "#ffffff");
      var statusElement = document.getElementById("ws-status-text");
      if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.color = color || "#ffffff";
      }
    }

    try {
      // Close existing connection if any
      if (
        window.mapLogWebSocket &&
        window.mapLogWebSocket.readyState !== WebSocket.CLOSED
      ) {
        window.mapLogWebSocket.close();
      }

      updateStatus("Connecting to " + wsAddress + "...", "#00aaff");

      // WebSocket connection with more explicit error handling
      window.mapLogWebSocket = new WebSocket(wsAddress);

      // Add specific timeouts to detect stalled connections
      var connectionTimeout = setTimeout(function () {
        if (
          window.mapLogWebSocket &&
          window.mapLogWebSocket.readyState === WebSocket.CONNECTING
        ) {
          updateStatus(
            "Connection timeout - WebView may be blocking WebSocket",
            "#ff0000"
          );

          // Suggest fallback methods
          self.addOutput(
            "WebSocket connection failed. Consider using alternative methods:",
            "#ffaa00"
          );
          self.addOutput(
            "1. Try 'log dataurl' to export via data URL",
            "#ffffff"
          );
          self.addOutput(
            "2. Try 'log qrcode' to export via QR code",
            "#ffffff"
          );

          // Clean up
          try {
            window.mapLogWebSocket.close();
          } catch (e) {
            // Ignore close errors
          }
        }
      }, 10000); // 10 second timeout

      // Set up event handlers with robust error handling
      window.mapLogWebSocket.onopen = function () {
        clearTimeout(connectionTimeout);
        updateStatus("Connected successfully!", "#00ff00");

        try {
          // Prepare minimal metadata to avoid large messages
          var metadata = {
            type: "logs",
            count: logs.length,
            timestamp: new Date().toISOString(),
          };

          // Send just metadata first as a test
          window.mapLogWebSocket.send(JSON.stringify(metadata));

          updateStatus("Metadata sent, preparing logs...", "#00aaff");

          // Add a delay before sending the actual logs
          setTimeout(function () {
            try {
              // Prepare minimal log data
              var logData = {
                type: "log_data",
                logs: logs,
              };

              // Convert to JSON and get size info
              var jsonData = JSON.stringify(logData);
              var byteSize = new Blob([jsonData]).size;
              var kilobyteSize = (byteSize / 1024).toFixed(2);

              updateStatus(
                "Sending " + logs.length + " logs (" + kilobyteSize + " KB)...",
                "#00aaff"
              );

              // Send the actual logs
              window.mapLogWebSocket.send(jsonData);

              updateStatus(
                "Logs sent successfully! Waiting for confirmation...",
                "#00ff00"
              );

              // Set a timeout to show success even if server doesn't respond
              setTimeout(function () {
                if (
                  window.mapLogWebSocket &&
                  window.mapLogWebSocket.readyState === WebSocket.OPEN
                ) {
                  updateStatus("Transfer completed", "#00ff00");
                }
              }, 3000);
            } catch (e) {
              updateStatus("Error sending logs: " + e.message, "#ff0000");
            }
          }, 1000);
        } catch (e) {
          updateStatus("Error preparing logs: " + e.message, "#ff0000");
        }
      };

      window.mapLogWebSocket.onmessage = function (event) {
        try {
          // Try to parse as JSON
          var message = JSON.parse(event.data);

          if (message.type === "confirm") {
            updateStatus("Server confirmed receipt of logs!", "#00ff00");
          } else {
            // Any other message
            self.addOutput("Server: " + event.data, "#00aaff");
          }
        } catch (e) {
          // Not JSON, just output as text
          self.addOutput("Server: " + event.data, "#00aaff");
        }
      };

      window.mapLogWebSocket.onerror = function (error) {
        clearTimeout(connectionTimeout);
        updateStatus(
          "WebSocket error - This may be a WebView limitation",
          "#ff0000"
        );

        // Provide more helpful error information
        self.addOutput(
          "WebSocket errors are common in WebView environments due to restrictions",
          "#ffaa00"
        );
        self.addOutput(
          "Try using 'log dataurl' or 'log qrcode' instead",
          "#ffaa00"
        );
      };

      window.mapLogWebSocket.onclose = function (event) {
        clearTimeout(connectionTimeout);

        if (event.code === 1006) {
          updateStatus("Connection closed abnormally (Code 1006)", "#ff0000");

          // Provide targeted advice for Error 1006
          self.addOutput(
            "Error 1006 indicates the connection was closed without a proper close frame",
            "#ffaa00"
          );
          self.addOutput(
            "This is common in WebView environments due to security restrictions",
            "#ffaa00"
          );
          self.addOutput(
            "Try using alternative export methods like 'log dataurl' or 'log qrcode'",
            "#ffffff"
          );
        } else {
          updateStatus(
            "Connection closed (Code: " + event.code + ")",
            "#ffaa00"
          );
        }
      };
    } catch (error) {
      updateStatus(
        "Failed to initialize WebSocket: " + error.message,
        "#ff0000"
      );
      self.addOutput(
        "WebSocket may not be fully supported in this WebView environment",
        "#ffaa00"
      );
    }
  }

  /**
   * Check status of the WebSocket connection
   */
  checkWebSocketStatus() {
    if (!window.mapLogWebSocket) {
      this.addOutput("No WebSocket connection has been established", "#ffaa00");
      return;
    }

    var readyStateMap = {
      0: "Connecting",
      1: "Open",
      2: "Closing",
      3: "Closed",
    };

    var state = readyStateMap[window.mapLogWebSocket.readyState] || "Unknown";
    var stateColor =
      state === "Open"
        ? "#00ff00"
        : state === "Connecting"
        ? "#ffaa00"
        : "#aaaaaa";

    this.addOutput("WebSocket Status: " + state, stateColor);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnectWebSocket() {
    if (!window.mapLogWebSocket) {
      this.addOutput("No active WebSocket connection", "#ffaa00");
      return;
    }

    if (
      window.mapLogWebSocket.readyState === WebSocket.OPEN ||
      window.mapLogWebSocket.readyState === WebSocket.CONNECTING
    ) {
      try {
        window.mapLogWebSocket.close();
        this.addOutput("WebSocket connection closed", "#00ff00");
      } catch (e) {
        this.addOutput("Error closing connection: " + e.message, "#ff0000");
      }
    } else {
      this.addOutput("WebSocket connection already closed", "#ffaa00");
    }
  }

  /**
   * Enable GeoJSON conversion logging
   */
  enableGeoJsonLogging() {
    if (!window.geoJsonLogs) {
      window.geoJsonLogs = {
        enabled: false,
        entries: [],
        filterType: null,
      };
    }

    if (window.geoJsonLogs.enabled) {
      this.addOutput(
        "GeoJSON conversion logging is already enabled",
        "#ffaa00"
      );
      return;
    }

    // Save the original addFeature function
    if (!window.originalAddFeature && window.interface) {
      window.originalAddFeature = window.interface.addFeature;

      // Replace with our logging version
      window.interface.addFeature = (layerId, objectid, geojson, style) => {
        // Log the conversion if enabled
        if (window.geoJsonLogs && window.geoJsonLogs.enabled) {
          const entry = {
            timestamp: new Date(),
            type: typeof geojson === "string" ? "unknown" : geojson.type,
            layerId,
            objectid,
            input:
              typeof geojson === "string" ? geojson : JSON.stringify(geojson),
            style: JSON.stringify(style),
          };

          // Apply filter if set
          if (
            !window.geoJsonLogs.filterType ||
            entry.type.toLowerCase().includes(window.geoJsonLogs.filterType)
          ) {
            window.geoJsonLogs.entries.push(entry);

            // Keep only the last 100 entries
            if (window.geoJsonLogs.entries.length > 100) {
              window.geoJsonLogs.entries.shift();
            }

            console.log(`GeoJSON Conversion Log: ${entry.type} in ${layerId}`);
          }
        }

        // Call the original function
        return window.originalAddFeature.call(
          window.interface,
          layerId,
          objectid,
          geojson,
          style
        );
      };

      this.addOutput("GeoJSON conversion logging enabled", "#00ff00");
      window.geoJsonLogs.enabled = true;
    } else {
      this.addOutput(
        "ERROR: Could not find interface.addFeature to hook into",
        "#ff0000"
      );
    }
  }

  /**
   * Disable GeoJSON conversion logging
   */
  disableGeoJsonLogging() {
    if (!window.geoJsonLogs || !window.geoJsonLogs.enabled) {
      this.addOutput(
        "GeoJSON conversion logging is already disabled",
        "#ffaa00"
      );
      return;
    }

    // Restore original function if possible
    if (window.originalAddFeature && window.interface) {
      window.interface.addFeature = window.originalAddFeature;
      window.geoJsonLogs.enabled = false;
      this.addOutput("GeoJSON conversion logging disabled", "#00ff00");
    } else {
      this.addOutput(
        "ERROR: Original addFeature function not found",
        "#ff0000"
      );
    }
  }

  /**
   * Show GeoJSON logs
   */
  showGeoJsonLogs() {
    if (!window.geoJsonLogs || window.geoJsonLogs.entries.length === 0) {
      this.addOutput("No GeoJSON conversion logs available", "#ffaa00");
      return;
    }

    // Show the last 10 entries (or all if less than 10)
    const entriesToShow = window.geoJsonLogs.entries.slice(-10);

    this.addOutput(
      `Showing last ${entriesToShow.length} log entries:`,
      "#00aaff"
    );

    entriesToShow.forEach((entry, index) => {
      const time = entry.timestamp.toLocaleTimeString();
      this.addOutput(
        `${index + 1}. [${time}] ${entry.type} - Layer: ${
          entry.layerId
        }, Object: ${entry.objectid}`,
        "#ffffff"
      );

      // Add a snippet of the input (truncated)
      const inputSnippet =
        entry.input.length > 100
          ? entry.input.substring(0, 100) + "..."
          : entry.input;

      this.addOutput(`   Input: ${inputSnippet}`, "#aaaaaa");
    });

    this.addOutput(
      `Use 'log last' to see detailed info for the most recent conversion`,
      "#aaaaaa"
    );
  }

  /**
   * Show the last GeoJSON log entry in detail
   */
  showLastGeoJsonLog() {
    if (!window.geoJsonLogs || window.geoJsonLogs.entries.length === 0) {
      this.addOutput("No GeoJSON conversion logs available", "#ffaa00");
      return;
    }

    const lastEntry =
      window.geoJsonLogs.entries[window.geoJsonLogs.entries.length - 1];

    this.addOutput("Last GeoJSON Conversion:", "#00aaff");
    this.addOutput(`Time: ${lastEntry.timestamp.toLocaleString()}`, "#ffffff");
    this.addOutput(`Type: ${lastEntry.type}`, "#ffffff");
    this.addOutput(`Layer ID: ${lastEntry.layerId}`, "#ffffff");
    this.addOutput(`Object ID: ${lastEntry.objectid}`, "#ffffff");

    // Parse and format the input if possible
    try {
      const parsedInput = JSON.parse(lastEntry.input);
      this.addOutput("Input GeoJSON:", "#ffffff");
      this.addOutput(JSON.stringify(parsedInput, null, 2), "#dddddd");
    } catch (e) {
      // If can't parse, show as is
      this.addOutput("Input (raw):", "#ffffff");
      this.addOutput(lastEntry.input, "#dddddd");
    }

    // Show style information
    this.addOutput("Style:", "#ffffff");
    this.addOutput(lastEntry.style, "#dddddd");
  }

  /**
   * Save GeoJSON logs to a file
   */
  saveGeoJsonLogs() {
    if (!window.geoJsonLogs || window.geoJsonLogs.entries.length === 0) {
      this.addOutput("No GeoJSON conversion logs available to save", "#ffaa00");
      return;
    }

    // Format logs as JSON
    const logsJson = JSON.stringify(window.geoJsonLogs.entries, null, 2);

    // Create a Blob with the logs
    const blob = new Blob([logsJson], { type: "application/json" });

    // Create a download link
    const a = document.createElement("a");
    a.download = `geojson_logs_${new Date()
      .toISOString()
      .replace(/:/g, "-")}.json`;
    a.href = URL.createObjectURL(blob);
    a.style.display = "none";

    // Add to document, click it, then remove it
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }, 100);

    this.addOutput(
      `Saved ${window.geoJsonLogs.entries.length} log entries to file`,
      "#00ff00"
    );
  }

  /**
   * Handle snap command with initialization capability
   * @param {Array} args - Command arguments
   */
  handleSnapCommand(args) {
    if (args.length === 0 || args[0] === "help") {
      this.addOutput(
        `
Snapping Control Commands:
snap help      - Show this help
snap enable    - Enable snapping and show the snapping button
snap disable   - Disable snapping
snap toggle    - Toggle snapping state
snap status    - Show current snapping status
snap init      - Initialize the feature snapper
`,
        "#00ff00"
      );
      return;
    }

    const action = args[0].toLowerCase();

    switch (action) {
      case "init":
        this.initializeSnapper();
        break;

      case "enable":
        this.enableSnapping();
        break;

      case "disable":
        this.disableSnapping();
        break;

      case "toggle":
        this.toggleSnapping();
        break;

      case "status":
        this.showSnappingStatus();
        break;

      default:
        this.addOutput(
          `Unknown snap command: ${action}. Use 'snap help' for available commands.`,
          "#ff0000"
        );
    }
  }

  /**
   * Handle performance monitoring commands
   * @param {Array} args - Command arguments
   */
  handlePerfCommand(args) {
    const action = args[0] || "help";

    switch (action) {
      case "help":
        this.addOutput(
          `
Performance Monitoring Commands:
perf help             - Show this help
perf show             - Show performance dashboard
perf hide             - Hide performance dashboard
perf toggle           - Toggle dashboard visibility
perf enable           - Enable performance monitoring
perf disable          - Disable performance monitoring
perf summary          - Show performance summary
perf report           - Generate detailed report
perf export           - Export metrics as JSON
perf clear            - Clear all collected metrics
perf fps              - Show current FPS
perf trace start      - Start performance trace
perf trace stop       - Stop performance trace
perf threshold <ms>   - Set warning threshold for operations
perf config           - Show current performance config
perf config <path>    - Get specific config value
perf config <path> <value> - Set config value
perf preset <name>    - Apply performance preset (high/balanced/battery-saver)
perf throttle         - Show current throttling settings
perf throttle gps <ms> - Set GPS update interval
perf gps stats        - Show GPS throttling statistics
perf gps reset        - Reset GPS throttling stats
perf layer stats      - Show layer batching statistics
perf footer stats     - Show status footer update timing
perf footer reset     - Reset status footer timing stats
perf layer reset      - Reset layer batching stats
perf layer disable    - Disable layer batching (immediate execution)
perf layer enable     - Enable layer batching
perf diag start [sec] - Start diagnostics (default 10 seconds)
perf diag stop        - Stop diagnostics and show report
perf quiet            - Disable frame drop warnings and throttle logs
perf verbose          - Enable all performance logs
`, 
          "#00aaff"
        );
        break;

      case "show":
        if (App.UI && App.UI.PerformanceDashboard) {
          App.UI.PerformanceDashboard.show();
          this.addOutput("Performance dashboard shown", "#00ff00");
        } else {
          this.addOutput("Performance dashboard not loaded", "#ff0000");
        }
        break;

      case "hide":
        if (App.UI && App.UI.PerformanceDashboard) {
          App.UI.PerformanceDashboard.hide();
          this.addOutput("Performance dashboard hidden", "#00ff00");
        } else {
          this.addOutput("Performance dashboard not loaded", "#ff0000");
        }
        break;

      case "toggle":
        if (App.UI && App.UI.PerformanceDashboard) {
          App.UI.PerformanceDashboard.toggle();
          const visible = App.UI.PerformanceDashboard.isVisible();
          this.addOutput(`Performance dashboard ${visible ? 'shown' : 'hidden'}`, "#00ff00");
        } else {
          this.addOutput("Performance dashboard not loaded", "#ff0000");
        }
        break;

      case "enable":
        if (App.Core && App.Core.Performance) {
          App.Core.Performance.setEnabled(true);
          this.addOutput("Performance monitoring enabled", "#00ff00");
        } else {
          this.addOutput("Performance module not loaded", "#ff0000");
        }
        break;

      case "disable":
        if (App.Core && App.Core.Performance) {
          App.Core.Performance.setEnabled(false);
          this.addOutput("Performance monitoring disabled", "#00ff00");
        } else {
          this.addOutput("Performance module not loaded", "#ff0000");
        }
        break;

      case "summary":
        if (App.Core && App.Core.Performance) {
          const summary = App.Core.Performance.getSummary();
          this.addOutput("=== Performance Summary ===", "#00aaff");
          this.addOutput(`Current FPS: ${summary.fps.toFixed(1)}`, 
            summary.fps >= 50 ? "#00ff00" : summary.fps >= 30 ? "#ffaa00" : "#ff0000");
          this.addOutput(`Map Load Time: ${summary.mapLoadTime ? summary.mapLoadTime.toFixed(0) + 'ms' : 'N/A'}`, "#ffffff");
          this.addOutput(`Avg Layer Op: ${summary.avgLayerOpTime.toFixed(1)}ms`, "#ffffff");
          this.addOutput(`Avg Source Op: ${summary.avgSourceOpTime.toFixed(1)}ms`, "#ffffff");
          this.addOutput(`Avg Tile Load: ${summary.avgTileLoadTime.toFixed(1)}ms`, "#ffffff");
          this.addOutput(`Avg Query Time: ${summary.avgQueryTime.toFixed(1)}ms`, "#ffffff");
          
          if (summary.slowOperations.length > 0) {
            this.addOutput("\nSlow Operations:", "#ffaa00");
            summary.slowOperations.slice(0, 5).forEach((op, i) => {
              this.addOutput(`  ${i + 1}. ${op.category} - ${op.operation}: ${op.duration.toFixed(1)}ms`, "#ffaa00");
            });
          }
        } else {
          this.addOutput("Performance module not loaded", "#ff0000");
        }
        break;

      case "report":
        if (App.Core && App.Core.Performance) {
          const report = App.Core.Performance.generateReport();
          const lines = report.split('\n');
          lines.forEach(line => {
            const color = line.includes('⚠️') ? "#ffaa00" : 
                         line.includes('===') ? "#00aaff" : "#ffffff";
            this.addOutput(line, color);
          });
        } else {
          this.addOutput("Performance module not loaded", "#ff0000");
        }
        break;

      case "export":
        if (App.Core && App.Core.Performance) {
          const metrics = App.Core.Performance.exportMetrics();
          // Create download link
          const blob = new Blob([metrics], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `maplibre-metrics-${Date.now()}.json`;
          link.click();
          URL.revokeObjectURL(url);
          this.addOutput("Metrics exported to file", "#00ff00");
        } else {
          this.addOutput("Performance module not loaded", "#ff0000");
        }
        break;

      case "clear":
        if (App.Core && App.Core.Performance) {
          App.Core.Performance.clearMetrics();
          this.addOutput("Performance metrics cleared", "#00ff00");
        } else {
          this.addOutput("Performance module not loaded", "#ff0000");
        }
        break;

      case "fps":
        if (App.Core && App.Core.Performance) {
          const summary = App.Core.Performance.getSummary();
          const fps = summary.fps;
          const color = fps >= 50 ? "#00ff00" : fps >= 30 ? "#ffaa00" : "#ff0000";
          this.addOutput(`Current FPS: ${fps.toFixed(1)}`, color);
        } else {
          this.addOutput("Performance module not loaded", "#ff0000");
        }
        break;

      case "trace":
        if (args[1] === "start") {
          if (App.Core && App.Core.Performance) {
            const traceName = args[2] || 'cli-trace';
            App.Core.Performance.startTrace(traceName);
            this.addOutput(`Started performance trace: ${traceName}`, "#00ff00");
          } else {
            this.addOutput("Performance module not loaded", "#ff0000");
          }
        } else if (args[1] === "stop") {
          if (App.Core && App.Core.Performance) {
            const traceName = args[2] || 'cli-trace';
            const trace = App.Core.Performance.stopTrace(traceName);
            if (trace) {
              this.addOutput(`Stopped trace: ${traceName}`, "#00ff00");
              this.addOutput(`Duration: ${trace.duration.toFixed(2)}ms`, "#ffffff");
            } else {
              this.addOutput("No active trace found", "#ff0000");
            }
          } else {
            this.addOutput("Performance module not loaded", "#ff0000");
          }
        } else {
          this.addOutput("Usage: perf trace [start|stop] [name]", "#ffaa00");
        }
        break;

      case "threshold":
        if (args[1] && !isNaN(args[1])) {
          if (App.Core && App.Core.Performance) {
            const ms = parseInt(args[1]);
            App.Core.Performance.setThresholds({
              layerOperation: ms,
              sourceOperation: ms,
              featureQuery: ms / 2
            });
            this.addOutput(`Set performance thresholds to ${ms}ms`, "#00ff00");
          } else {
            this.addOutput("Performance module not loaded", "#ff0000");
          }
        } else {
          this.addOutput("Usage: perf threshold <milliseconds>", "#ffaa00");
        }
        break;

      case "config":
        if (App.Core && App.Core.PerformanceConfig) {
          if (args.length === 1) {
            // Show all config
            const config = App.Core.PerformanceConfig.get();
            this.addOutput("=== Performance Configuration ===", "#00aaff");
            this.addOutput(JSON.stringify(config, null, 2), "#ffffff");
          } else if (args.length === 2) {
            // Get specific config value
            const value = App.Core.PerformanceConfig.get(args[1]);
            if (value !== undefined) {
              this.addOutput(`${args[1]} = ${JSON.stringify(value)}`, "#00ff00");
            } else {
              this.addOutput(`Config path '${args[1]}' not found`, "#ff0000");
            }
          } else if (args.length >= 3) {
            // Set config value
            const path = args[1];
            let value = args[2];
            
            // Try to parse as number or boolean
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            else if (!isNaN(value)) value = Number(value);
            
            App.Core.PerformanceConfig.set(path, value);
            this.addOutput(`Set ${path} = ${value}`, "#00ff00");
          }
        } else {
          this.addOutput("Performance config module not loaded", "#ff0000");
        }
        break;

      case "preset":
        if (App.Core && App.Core.PerformanceConfig) {
          const presetName = args[1];
          if (!presetName) {
            this.addOutput("Available presets: high, balanced, battery-saver", "#ffaa00");
          } else {
            App.Core.PerformanceConfig.applyPreset(presetName);
            this.addOutput(`Applied performance preset: ${presetName}`, "#00ff00");
          }
        } else {
          this.addOutput("Performance config module not loaded", "#ff0000");
        }
        break;

      case "throttle":
        if (App.Core && App.Core.PerformanceConfig) {
          if (args.length === 1) {
            // Show throttle settings
            const gpsInterval = App.Core.PerformanceConfig.get('gps.updateInterval');
            const posInterval = App.Core.PerformanceConfig.get('gps.positionUpdateInterval');
            const layerInterval = App.Core.PerformanceConfig.get('layers.removeObjectInterval');
            
            this.addOutput("=== Throttling Settings ===", "#00aaff");
            this.addOutput(`GPS Update Interval: ${gpsInterval}ms (${(1000/gpsInterval).toFixed(1)} Hz)`, "#ffffff");
            this.addOutput(`Position Update Interval: ${posInterval}ms (${(1000/posInterval).toFixed(1)} Hz)`, "#ffffff");
            this.addOutput(`Layer Remove Throttle: ${layerInterval}ms`, "#ffffff");
          } else if (args[1] === 'gps' && args[2]) {
            // Set GPS throttle
            const interval = parseInt(args[2]);
            if (!isNaN(interval) && interval > 0) {
              App.Core.PerformanceConfig.set('gps.updateInterval', interval);
              App.Core.PerformanceConfig.set('gps.positionUpdateInterval', interval);
              const hz = (1000 / interval).toFixed(1);
              this.addOutput(`Set GPS update interval to ${interval}ms (${hz} Hz)`, "#00ff00");
            } else {
              this.addOutput("Invalid interval. Must be a positive number in milliseconds", "#ff0000");
            }
          } else {
            this.addOutput("Usage: perf throttle [gps <ms>]", "#ffaa00");
          }
        } else {
          this.addOutput("Performance config module not loaded", "#ff0000");
        }
        break;

      case "gps":
        if (args[1] === 'stats') {
          if (App.Core && App.Core.GPSThrottle) {
            const stats = App.Core.GPSThrottle.getStats();
            this.addOutput("=== GPS Throttling Statistics ===", "#00aaff");
            this.addOutput(`Updates Received: ${stats.received}`, "#ffffff");
            this.addOutput(`Updates Processed: ${stats.processed}`, "#00ff00");
            this.addOutput(`Updates Throttled: ${stats.throttled}`, "#ffaa00");
            this.addOutput(`Updates Queued: ${stats.queued}`, "#ffaa00");
            this.addOutput(`Process Ratio: ${stats.processRatio}`, 
              stats.processed / stats.received > 0.5 ? "#ffaa00" : "#00ff00");
            this.addOutput(`Current Interval: ${stats.currentInterval}`, "#ffffff");
          } else {
            this.addOutput("GPS throttle module not loaded", "#ff0000");
          }
        } else if (args[1] === 'reset') {
          if (App.Core && App.Core.GPSThrottle) {
            App.Core.GPSThrottle.resetStats();
            this.addOutput("GPS throttling statistics reset", "#00ff00");
          } else {
            this.addOutput("GPS throttle module not loaded", "#ff0000");
          }
        } else {
          this.addOutput("Usage: perf gps [stats|reset]", "#ffaa00");
        }
        break;

      case "layer":
        if (args[1] === 'stats') {
          if (App.Core && App.Core.LayerBatch) {
            const stats = App.Core.LayerBatch.getStats();
            this.addOutput("=== Layer Batching Statistics ===", "#00aaff");
            this.addOutput(`Operations Queued: ${stats.operations}`, "#ffffff");
            this.addOutput(`Batches Processed: ${stats.batches}`, "#00ff00");
            this.addOutput(`Operations Skipped: ${stats.skipped}`, "#ffaa00");
            this.addOutput(`Ops per Batch: ${stats.opsPerBatch}`, "#ffffff");
            this.addOutput(`Status: ${stats.enabled ? 'Enabled' : 'Disabled'}`, 
              stats.enabled ? "#00ff00" : "#ff0000");
            this.addOutput(`Batch Interval: ${stats.interval}`, "#ffffff");
          } else {
            this.addOutput("Layer batch module not loaded", "#ff0000");
          }
        } else if (args[1] === 'reset') {
          if (App.Core && App.Core.LayerBatch) {
            App.Core.LayerBatch.resetStats();
            this.addOutput("Layer batching statistics reset", "#00ff00");
          } else {
            this.addOutput("Layer batch module not loaded", "#ff0000");
          }
        } else if (args[1] === 'disable') {
          if (App.Core && App.Core.LayerBatch) {
            App.Core.LayerBatch.setEnabled(false);
            this.addOutput("Layer batching disabled - operations execute immediately", "#ffaa00");
          } else {
            this.addOutput("Layer batch module not loaded", "#ff0000");
          }
        } else if (args[1] === 'enable') {
          if (App.Core && App.Core.LayerBatch) {
            App.Core.LayerBatch.setEnabled(true);
            this.addOutput("Layer batching enabled", "#00ff00");
          } else {
            this.addOutput("Layer batch module not loaded", "#ff0000");
          }
        } else {
          this.addOutput("Usage: perf layer [stats|reset|enable|disable]", "#ffaa00");
        }
        break;

      case "diag":
        if (args[1] === 'start') {
          if (App.Core && App.Core.Diagnostics) {
            if (App.Core.Diagnostics.isRunning()) {
              this.addOutput("Diagnostics already running", "#ffaa00");
            } else {
              const duration = parseInt(args[2]) || 10;
              const message = App.Core.Diagnostics.start(duration);
              this.addOutput(message, "#00ff00");
              this.addOutput("Move around with GPS enabled to capture data...", "#00aaff");
              
              // Auto-show report when done
              setTimeout(() => {
                if (App.Core.Diagnostics.isRunning()) {
                  const report = App.Core.Diagnostics.stop();
                  const formatted = App.Core.Diagnostics.generateReport(report);
                  this.addOutput(formatted, "#ffffff");
                }
              }, duration * 1000 + 100);
            }
          } else {
            this.addOutput("Diagnostics module not loaded", "#ff0000");
          }
        } else if (args[1] === 'stop') {
          if (App.Core && App.Core.Diagnostics) {
            if (!App.Core.Diagnostics.isRunning()) {
              this.addOutput("Diagnostics not running", "#ffaa00");
            } else {
              const report = App.Core.Diagnostics.stop();
              const formatted = App.Core.Diagnostics.generateReport(report);
              this.addOutput(formatted, "#ffffff");
            }
          } else {
            this.addOutput("Diagnostics module not loaded", "#ff0000");
          }
        } else {
          this.addOutput("Usage: perf diag [start|stop]", "#ffaa00");
        }
        break;

      case "footer":
        if (args[1] === 'stats') {
          // Track and display status footer timing stats
          if (!window._footerTimingStats) {
            window._footerTimingStats = {
              updates: 0,
              totalTime: 0,
              maxTime: 0,
              slowUpdates: 0,
              lastReset: Date.now()
            };
          }
          
          const stats = window._footerTimingStats;
          const avgTime = stats.updates > 0 ? (stats.totalTime / stats.updates).toFixed(2) : 0;
          const uptime = ((Date.now() - stats.lastReset) / 1000).toFixed(1);
          
          this.addOutput("=== Status Footer Update Timing ===", "#00aaff");
          this.addOutput(`Total updates: ${stats.updates}`, "#ffffff");
          this.addOutput(`Average time: ${avgTime}ms`, "#ffffff");
          this.addOutput(`Max time: ${stats.maxTime.toFixed(2)}ms`, "#ffffff");
          this.addOutput(`Slow updates (>16ms): ${stats.slowUpdates} (${stats.updates > 0 ? ((stats.slowUpdates / stats.updates) * 100).toFixed(1) : 0}%)`, "#ffaa00");
          this.addOutput(`Tracking duration: ${uptime}s`, "#ffffff");
          
          // Enable tracking if not already
          if (!window._footerTimingEnabled) {
            this.enableFooterTiming();
            this.addOutput("\nFooter timing tracking enabled", "#00ff00");
          }
        } else if (args[1] === 'reset') {
          window._footerTimingStats = {
            updates: 0,
            totalTime: 0,
            maxTime: 0,
            slowUpdates: 0,
            lastReset: Date.now()
          };
          this.addOutput("Footer timing stats reset", "#00ff00");
        } else {
          this.addOutput("Usage: perf footer [stats|reset]", "#ffaa00");
        }
        break;

      case "quiet":
        if (App.Core && App.Core.PerformanceConfig) {
          App.Core.PerformanceConfig.set('debug.logThrottledUpdates', false);
          App.Core.PerformanceConfig.set('debug.warnOnSlowOperations', false);
          this.addOutput("Performance logging set to quiet mode", "#00ff00");
          this.addOutput("Frame drop warnings and throttle logs disabled", "#00ff00");
        } else {
          this.addOutput("Performance config module not loaded", "#ff0000");
        }
        break;

      case "verbose":
        if (App.Core && App.Core.PerformanceConfig) {
          App.Core.PerformanceConfig.set('debug.logThrottledUpdates', true);
          App.Core.PerformanceConfig.set('debug.warnOnSlowOperations', true);
          this.addOutput("Performance logging set to verbose mode", "#00ff00");
          this.addOutput("All performance logs enabled", "#00ff00");
        } else {
          this.addOutput("Performance config module not loaded", "#ff0000");
        }
        break;

      default:
        this.addOutput(`Unknown performance command: ${action}`, "#ff0000");
        this.addOutput("Use 'perf help' for available commands", "#ffaa00");
    }
  }

  /**
   * Enable footer timing tracking
   */
  enableFooterTiming() {
    if (window._footerTimingEnabled) return;
    
    // Initialize stats if needed
    if (!window._footerTimingStats) {
      window._footerTimingStats = {
        updates: 0,
        totalTime: 0,
        maxTime: 0,
        slowUpdates: 0,
        lastReset: Date.now()
      };
    }
    
    // Wrap the status footer bridge updateAllStatus method
    if (window.statusFooterBridge && window.statusFooterBridge.updateAllStatus) {
      const originalUpdate = window.statusFooterBridge.updateAllStatus;
      window.statusFooterBridge.updateAllStatus = function(data) {
        const startTime = performance.now();
        const result = originalUpdate.call(this, data);
        const executionTime = performance.now() - startTime;
        
        // Update stats
        const stats = window._footerTimingStats;
        stats.updates++;
        stats.totalTime += executionTime;
        if (executionTime > stats.maxTime) {
          stats.maxTime = executionTime;
        }
        if (executionTime > 16) { // More than one frame
          stats.slowUpdates++;
        }
        
        return result;
      };
      
      window._footerTimingEnabled = true;
    }
  }

  /**
   * Handle Android log commands
   * @param {Array} args - Command arguments
   */
  handleAndroidCommand(args) {
    const action = args[0] || "help";
    
    switch (action) {
      case "help":
        this.addOutput(
          `
Android Log Control Commands:
android help          - Show this help
android logs off      - Disable verbose GPS/GLRM logging for performance
android logs on       - Restore normal logging
android logs analyze  - Analyze log frequency (1 second sample)
android perf          - Set performance mode (minimal logging)
android normal        - Restore normal logging mode
android stats         - Get current log control statistics
`,
          "#00aaff"
        );
        break;
        
      case "logs":
        const subAction = args[1];
        if (subAction === 'off') {
          // Send command to disable verbose logging
          if (window.reha && window.reha.sendCallback) {
            window.reha.sendCallback('disableVerboseLogging', '');
            this.addOutput("Disabling verbose Android logs...", "#00ff00");
            this.addOutput("Categories disabled: GLRM, GLRM-RTCM, GLRM-Manager, GLRM-Processor, BLE", "#00ff00");
          } else {
            this.addOutput("Android bridge not available", "#ff0000");
          }
        } else if (subAction === 'on') {
          // Send command to enable verbose logging
          if (window.reha && window.reha.sendCallback) {
            window.reha.sendCallback('enableVerboseLogging', '');
            this.addOutput("Enabling verbose Android logs...", "#00ff00");
          } else {
            this.addOutput("Android bridge not available", "#ff0000");
          }
        } else if (subAction === 'analyze') {
          this.addOutput("Analyzing log frequency for 1 second...", "#00aaff");
          if (App.Utils && App.Utils.AndroidLog) {
            App.Utils.AndroidLog.analyzeLogFrequency(1000).then(analysis => {
              this.addOutput("=== Log Frequency Analysis ===", "#00aaff");
              this.addOutput(`Total logs: ${analysis.totalLogs} in ${analysis.duration}ms`, "#ffffff");
              this.addOutput(`Logs per second: ${analysis.logsPerSecond}`, 
                analysis.logsPerSecond > 100 ? "#ff0000" : "#00ff00");
              
              Object.keys(analysis.byCategory).forEach(category => {
                const data = analysis.byCategory[category];
                this.addOutput(`  ${category}: ${data.perSecond}/sec (${data.count} total)`, "#ffffff");
              });
            });
          }
        } else {
          this.addOutput("Usage: android logs [off|on|analyze]", "#ffaa00");
        }
        break;
        
      case "perf":
        // Send performance mode command to Android
        if (window.reha && window.reha.sendCallback) {
          window.reha.sendCallback('setLogMode', 'performance');
          this.addOutput("Android set to performance mode", "#00ff00");
          this.addOutput("Minimal logging enabled for better FPS", "#00ff00");
        } else {
          this.addOutput("Android bridge not available", "#ff0000");
        }
        break;
        
      case "normal":
        // Send normal mode command to Android
        if (window.reha && window.reha.sendCallback) {
          window.reha.sendCallback('setLogMode', 'normal');
          this.addOutput("Android set to normal mode", "#00ff00");
          this.addOutput("Full logging enabled", "#00ff00");
        } else {
          this.addOutput("Android bridge not available", "#ff0000");
        }
        break;
        
      case "stats":
        // Get log control statistics from Android
        if (window.reha && window.reha.sendReturnCallback) {
          window.reha.sendReturnCallback('getLogStats', '', (stats) => {
            if (stats) {
              this.addOutput("=== Android Log Control Status ===", "#00aaff");
              const lines = stats.split('\n');
              lines.forEach(line => {
                if (line.trim()) {
                  this.addOutput(line, "#ffffff");
                }
              });
            }
          });
        } else {
          this.addOutput("Android bridge not available", "#ff0000");
        }
        break;
        
      default:
        this.addOutput(`Unknown android command: ${action}`, "#ff0000");
        this.addOutput("Use 'android help' for available commands", "#ffaa00");
    }
  }
  
  /**
   * Handle footer commands for debugging performance
   * @param {Array} args - Command arguments
   */
  handleFooterCommand(args) {
    const action = args[0] || "help";
    
    switch (action) {
      case "help":
        this.addOutput(
          `
Footer Control Commands:
footer help      - Show this help
footer off       - Hide status footer (for performance testing)
footer on        - Show status footer
footer toggle    - Toggle status footer visibility
footer status    - Check current status
footer disable   - Completely disable footer updates
footer enable    - Re-enable footer updates
footer perf      - Check what performance monitoring is active
`,
          "#00aaff"
        );
        break;
        
      case "off":
      case "hide":
        // Hide the footer element
        const footerOff = document.querySelector('status-footer-ultrathin');
        if (footerOff) {
          footerOff.style.display = 'none';
          this.addOutput("Status footer hidden", "#00ff00");
        } else {
          this.addOutput("Status footer not found", "#ff0000");
        }
        break;
        
      case "on":
      case "show":
        // Show the footer element
        const footerOn = document.querySelector('status-footer-ultrathin');
        if (footerOn) {
          footerOn.style.display = '';
          this.addOutput("Status footer shown", "#00ff00");
        } else {
          this.addOutput("Status footer not found", "#ff0000");
        }
        break;
        
      case "toggle":
        // Toggle footer visibility
        const footerToggle = document.querySelector('status-footer-ultrathin');
        if (footerToggle) {
          if (footerToggle.style.display === 'none') {
            footerToggle.style.display = '';
            this.addOutput("Status footer shown", "#00ff00");
          } else {
            footerToggle.style.display = 'none';
            this.addOutput("Status footer hidden", "#00ff00");
          }
        } else {
          this.addOutput("Status footer not found", "#ff0000");
        }
        break;
        
      case "disable":
        // Disable footer updates completely
        if (window.statusFooterBridge) {
          // Store original methods
          window._originalFooterMethods = {
            updateStatusBar: window.statusFooterBridge.updateStatusBar,
            updateCoordinates: window.statusFooterBridge.updateCoordinates,
            updateGnssInfo: window.statusFooterBridge.updateGnssInfo,
            updateDeviceInfo: window.statusFooterBridge.updateDeviceInfo
          };
          
          // Replace with no-op functions
          window.statusFooterBridge.updateStatusBar = function() {};
          window.statusFooterBridge.updateCoordinates = function() {};
          window.statusFooterBridge.updateGnssInfo = function() {};
          window.statusFooterBridge.updateDeviceInfo = function() {};
          
          this.addOutput("Status footer updates disabled", "#00ff00");
          this.addOutput("GPS updates will not affect the footer", "#00ff00");
        } else {
          this.addOutput("Status footer bridge not found", "#ff0000");
        }
        break;
        
      case "enable":
        // Re-enable footer updates
        if (window.statusFooterBridge && window._originalFooterMethods) {
          // Restore original methods
          window.statusFooterBridge.updateStatusBar = window._originalFooterMethods.updateStatusBar;
          window.statusFooterBridge.updateCoordinates = window._originalFooterMethods.updateCoordinates;
          window.statusFooterBridge.updateGnssInfo = window._originalFooterMethods.updateGnssInfo;
          window.statusFooterBridge.updateDeviceInfo = window._originalFooterMethods.updateDeviceInfo;
          
          delete window._originalFooterMethods;
          
          this.addOutput("Status footer updates re-enabled", "#00ff00");
        } else {
          this.addOutput("Footer updates were not disabled", "#ffaa00");
        }
        break;
        
      case "status":
        // Check current status
        const footer = document.querySelector('status-footer-ultrathin');
        const bridge = window.statusFooterBridge;
        
        if (footer) {
          const isVisible = footer.style.display !== 'none';
          const isDisabled = window._originalFooterMethods ? true : false;
          
          this.addOutput("=== Footer Status ===", "#00aaff");
          this.addOutput(`Element found: Yes`, "#ffffff");
          this.addOutput(`Visible: ${isVisible ? 'Yes' : 'No'}`, "#ffffff");
          this.addOutput(`Updates disabled: ${isDisabled ? 'Yes' : 'No'}`, "#ffffff");
          
          if (bridge) {
            this.addOutput(`Bridge available: Yes`, "#ffffff");
          } else {
            this.addOutput(`Bridge available: No`, "#ffffff");
          }
        } else {
          this.addOutput("Status footer element not found", "#ff0000");
        }
        break;
        
      case "perf":
        // Check what performance monitoring is running
        this.addOutput("=== Performance Monitoring Status ===", "#00aaff");
        
        // Check if performance dashboard is visible
        const perfDash = document.querySelector('#performance-dashboard');
        if (perfDash && perfDash.style.display !== 'none') {
          this.addOutput("Performance Dashboard: ACTIVE (updates every 500ms)", "#ffff00");
          this.addOutput("This may cause frame drops!", "#ff0000");
        } else {
          this.addOutput("Performance Dashboard: Not visible", "#00ff00");
        }
        
        // Check if performance monitoring is collecting
        if (window.App && App.Core && App.Core.Performance) {
          const isCollecting = App.Core.Performance._isCollecting || false;
          this.addOutput(`Performance Metrics Collection: ${isCollecting ? 'ACTIVE' : 'Not active'}`, isCollecting ? "#ffff00" : "#00ff00");
        }
        
        // Check for any active intervals
        this.addOutput("\nTo stop performance dashboard:", "#ffffff");
        this.addOutput("perf stop", "#00aaff");
        break;
        
      default:
        this.addOutput(`Unknown footer command: ${action}`, "#ff0000");
        this.addOutput("Use 'footer help' for available commands", "#ffaa00");
    }
  }

  /**
   * Handle preset commands
   * @param {Array} args - Command arguments
   */
  handlePresetCommand(args) {
    const action = args[0] || "help";

    switch (action) {
      case "help":
        this.addOutput(
          `
Preset commands:
preset layers           - Show layer presets dialog
preset ui              - Show UI presets dialog  
preset buttons         - Add preset buttons to UI
preset list layers     - List all layer presets
preset list ui         - List all UI presets
preset load <id>       - Load a preset by ID
preset save <name>     - Save current state as preset
`,
          "#00aaff"
        );
        break;

      case "layers":
      case "layer":
        if (App.UI && App.UI.Presets) {
          App.UI.Presets.showLayerPresets();
          this.addOutput("Opening layer presets dialog...", "#00ff00");
        } else {
          this.addOutput("Preset UI module not loaded", "#ff0000");
        }
        break;

      case "ui":
        if (App.UI && App.UI.Presets) {
          App.UI.Presets.showUIPresets();
          this.addOutput("Opening UI presets dialog...", "#00ff00");
        } else {
          this.addOutput("Preset UI module not loaded", "#ff0000");
        }
        break;

      case "buttons":
      case "button":
        if (App.UI && App.UI.Presets) {
          App.UI.Presets.addPresetButtons();
          this.addOutput("Adding preset buttons to UI...", "#00ff00");
        } else {
          this.addOutput("Preset UI module not loaded", "#ff0000");
        }
        break;

      case "list":
        const type = args[1] || "layers";
        if (type === "layers" || type === "layer") {
          if (App.Map && App.Map.Layers && App.Map.Layers.Presets) {
            const presets = App.Map.Layers.Presets.getAllPresets();
            this.addOutput(`Layer Presets (${presets.length}):`, "#00aaff");
            presets.forEach(p => {
              const current = App.Map.Layers.Presets.getCurrentPresetId() === p.id ? " [CURRENT]" : "";
              this.addOutput(`  ${p.name} (${p.id})${current}`, "#ffffff");
            });
          } else {
            this.addOutput("Layer presets module not loaded", "#ff0000");
          }
        } else if (type === "ui") {
          if (App.UI && App.UI.State) {
            const presets = App.UI.State.getAllPresets();
            this.addOutput(`UI Presets (${presets.length}):`, "#00aaff");
            presets.forEach(p => {
              const current = App.UI.State.getCurrentPresetId() === p.id ? " [CURRENT]" : "";
              this.addOutput(`  ${p.name} (${p.id})${current}`, "#ffffff");
            });
          } else {
            this.addOutput("UI state module not loaded", "#ff0000");
          }
        }
        break;

      case "load":
        const presetId = args[1];
        if (!presetId) {
          this.addOutput("Please specify a preset ID", "#ff0000");
          break;
        }
        // Try layer presets first
        if (App.Map && App.Map.Layers && App.Map.Layers.Presets) {
          try {
            App.Map.Layers.Presets.loadPreset(presetId);
            this.addOutput(`Loaded layer preset: ${presetId}`, "#00ff00");
            break;
          } catch (e) {
            // Not a layer preset, try UI preset
          }
        }
        if (App.UI && App.UI.State) {
          try {
            App.UI.State.loadPreset(presetId);
            this.addOutput(`Loaded UI preset: ${presetId}`, "#00ff00");
          } catch (e) {
            this.addOutput(`Preset not found: ${presetId}`, "#ff0000");
          }
        }
        break;

      case "save":
        const name = args.slice(1).join(" ");
        if (!name) {
          this.addOutput("Please specify a preset name", "#ff0000");
          break;
        }
        this.addOutput("Use the preset dialogs to save presets", "#ffaa00");
        this.addOutput("Type 'preset layers' or 'preset ui' to open dialogs", "#ffaa00");
        break;

      default:
        this.addOutput(
          `Unknown preset command: ${action}. Use 'preset help' for available commands.`,
          "#ff0000"
        );
    }
  }

  generateLogQRCode() {
    // Get logs from all possible sources
    const logs = this.getAllLogs();

    if (logs.length === 0) {
      this.addOutput(
        "No logs available to export via QR code. Try running 'log enable' first.",
        "#ffaa00"
      );
      return;
    }

    this.addOutput(
      "Generating QR code for " + logs.length + " logs...",
      "#00aaff"
    );

    // Load QRCode.js from CDN
    this.loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
      function () {
        try {
          // Format logs as JSON
          const logsJson = JSON.stringify(logs);

          // Check size - QR codes have practical limits
          const byteSize = new Blob([logsJson]).size;
          const kilobyteSize = (byteSize / 1024).toFixed(2);

          if (byteSize > 2000) {
            this.addOutput(
              "Warning: Log data is " +
                kilobyteSize +
                " KB, which may be too large for a single QR code.",
              "#ffaa00"
            );
            this.addOutput(
              "Try using 'log qrcode split' for large logs.",
              "#ffaa00"
            );

            if (byteSize > 4000) {
              this.addOutput(
                "Log data too large for reliable QR code. Please use 'log qrcode split' instead.",
                "#ff0000"
              );
              return;
            }
          }

          // Create container for QR code
          const container = document.createElement("div");
          container.id = "qrcode-container";
          container.style.background = "white";
          container.style.padding = "20px";
          container.style.textAlign = "center";
          container.style.borderRadius = "8px";
          container.style.maxWidth = "350px";
          container.style.margin = "10px 0";
          container.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";

          // Add title
          const title = document.createElement("div");
          title.textContent = "Scan to transfer logs";
          title.style.marginBottom = "10px";
          title.style.color = "black";
          title.style.fontWeight = "bold";
          container.appendChild(title);

          // Add size info
          const sizeInfo = document.createElement("div");
          sizeInfo.textContent = "Log size: " + kilobyteSize + " KB";
          sizeInfo.style.marginBottom = "10px";
          sizeInfo.style.color = byteSize > 2000 ? "orange" : "green";
          sizeInfo.style.fontSize = "12px";
          container.appendChild(sizeInfo);

          // Create div for QR code
          const qrcodeDiv = document.createElement("div");
          qrcodeDiv.id = "qrcode";
          container.appendChild(qrcodeDiv);

          // Add close button
          const closeButton = document.createElement("button");
          closeButton.textContent = "Close";
          closeButton.style.marginTop = "10px";
          closeButton.style.padding = "5px 10px";
          closeButton.style.backgroundColor = "#f44336";
          closeButton.style.color = "white";
          closeButton.style.border = "none";
          closeButton.style.borderRadius = "4px";
          closeButton.style.cursor = "pointer";
          closeButton.onclick = function () {
            document.body.removeChild(container);
          };
          container.appendChild(closeButton);

          // Add instructions
          const instructions = document.createElement("div");
          instructions.style.marginTop = "10px";
          instructions.style.fontSize = "12px";
          instructions.style.color = "black";
          instructions.textContent =
            "Use a QR code scanner on your computer to capture the log data";
          container.appendChild(instructions);

          // Add container to the body
          document.body.appendChild(container);

          // Position fixed in center
          container.style.position = "fixed";
          container.style.top = "50%";
          container.style.left = "50%";
          container.style.transform = "translate(-50%, -50%)";
          container.style.zIndex = "10000";

          // Generate QR code
          new QRCode(qrcodeDiv, {
            text: logsJson,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H, // High error correction
          });

          this.addOutput(
            "QR code generated - scan it with your computer to access the logs",
            "#00ff00"
          );
          this.addOutput("Log size: " + kilobyteSize + " KB", "#aaaaaa");
        } catch (error) {
          this.addOutput(
            "Error generating QR code: " + error.message,
            "#ff0000"
          );
          console.error("QR code generation error:", error);
        }
      }.bind(this)
    ); // Bind this to maintain context
  }

  /**
   * Simple QR Code export implementation
   */
  simpleQRCodeExport() {
    var self = this;
    var logs = this.getAllLogs();

    if (logs.length === 0) {
      this.addOutput(
        "No logs available to export. Try running 'log enable' first.",
        "#ffaa00"
      );
      return;
    }

    // Load QRCode library
    this.loadQRCodeLibrary(function () {
      // Create a modal container
      var modal = document.createElement("div");
      modal.style.position = "fixed";
      modal.style.top = "0";
      modal.style.left = "0";
      modal.style.width = "100%";
      modal.style.height = "100%";
      modal.style.backgroundColor = "rgba(0,0,0,0.7)";
      modal.style.zIndex = "9999";
      modal.style.display = "flex";
      modal.style.justifyContent = "center";
      modal.style.alignItems = "center";

      // Create a content container
      var content = document.createElement("div");
      content.style.backgroundColor = "white";
      content.style.borderRadius = "8px";
      content.style.padding = "20px";
      content.style.maxWidth = "90%";
      content.style.maxHeight = "90%";
      content.style.overflow = "auto";
      content.style.textAlign = "center";

      // Add a title
      var title = document.createElement("h2");
      title.textContent = "QR Code Log Export";
      title.style.color = "black";
      title.style.margin = "0 0 15px 0";
      content.appendChild(title);

      // Add log info
      var logInfo = document.createElement("p");
      logInfo.textContent = "Total logs: " + logs.length;
      logInfo.style.color = "black";
      logInfo.style.marginBottom = "15px";
      content.appendChild(logInfo);

      // Add the QR code container
      var qrContainer = document.createElement("div");
      qrContainer.id = "qr-container";
      qrContainer.style.margin = "0 auto";
      qrContainer.style.width = "256px";
      qrContainer.style.height = "256px";
      content.appendChild(qrContainer);

      // Add instruction text
      var instructions = document.createElement("p");
      instructions.style.color = "black";
      instructions.style.margin = "15px 0";
      instructions.textContent =
        "Scan this QR code with your computer to transfer the logs";
      content.appendChild(instructions);

      // Add close button
      var closeButton = document.createElement("button");
      closeButton.textContent = "Close";
      closeButton.style.backgroundColor = "#f44336";
      closeButton.style.color = "white";
      closeButton.style.border = "none";
      closeButton.style.borderRadius = "4px";
      closeButton.style.padding = "8px 16px";
      closeButton.style.cursor = "pointer";
      closeButton.style.marginTop = "10px";

      closeButton.onclick = function () {
        document.body.removeChild(modal);
      };

      content.appendChild(closeButton);
      modal.appendChild(content);
      document.body.appendChild(modal);

      // Format logs as JSON
      var logsJson = JSON.stringify(logs);

      // Get size info
      var byteSize = new Blob([logsJson]).size;
      var kilobyteSize = (byteSize / 1024).toFixed(2);

      // Add size info
      var sizeInfo = document.createElement("p");
      sizeInfo.textContent = "Log size: " + kilobyteSize + " KB";
      sizeInfo.style.color = kilobyteSize > 2 ? "red" : "green";
      sizeInfo.style.margin = "5px 0";

      // Insert after title
      content.insertBefore(sizeInfo, logInfo.nextSibling);

      // If logs are too large, show warning and offer chunking
      if (byteSize > 2000) {
        var warning = document.createElement("div");
        warning.style.backgroundColor = "#fff3cd";
        warning.style.color = "#856404";
        warning.style.padding = "10px";
        warning.style.borderRadius = "4px";
        warning.style.marginBottom = "15px";
        warning.textContent =
          "Warning: Your logs are large and may not scan reliably as a single QR code.";

        // Add button to split into chunks
        var splitButton = document.createElement("button");
        splitButton.textContent = "Split into Multiple QR Codes";
        splitButton.style.backgroundColor = "#007bff";
        splitButton.style.color = "white";
        splitButton.style.border = "none";
        splitButton.style.borderRadius = "4px";
        splitButton.style.padding = "8px 16px";
        splitButton.style.cursor = "pointer";
        splitButton.style.marginTop = "10px";
        warning.appendChild(document.createElement("br"));
        warning.appendChild(splitButton);

        // Insert after size info
        content.insertBefore(warning, sizeInfo.nextSibling);

        // Chunking functionality
        var chunks = [];
        var currentChunk = 0;
        var chunkSize = 1000; // Smaller size for more reliable scanning

        // Create chunks
        for (var i = 0; i < logsJson.length; i += chunkSize) {
          chunks.push(logsJson.substring(i, i + chunkSize));
        }

        splitButton.onclick = function () {
          // Remove warning
          content.removeChild(warning);

          // Update info text
          sizeInfo.textContent =
            "Showing chunk " + (currentChunk + 1) + " of " + chunks.length;

          // Add navigation buttons
          var nav = document.createElement("div");
          nav.style.margin = "10px 0";

          var prevBtn = document.createElement("button");
          prevBtn.textContent = "Previous";
          prevBtn.style.backgroundColor = "#6c757d";
          prevBtn.style.color = "white";
          prevBtn.style.border = "none";
          prevBtn.style.borderRadius = "4px";
          prevBtn.style.padding = "5px 10px";
          prevBtn.style.marginRight = "10px";
          prevBtn.style.cursor = "pointer";
          prevBtn.disabled = true;

          var nextBtn = document.createElement("button");
          nextBtn.textContent = "Next";
          nextBtn.style.backgroundColor = "#28a745";
          nextBtn.style.color = "white";
          nextBtn.style.border = "none";
          nextBtn.style.borderRadius = "4px";
          nextBtn.style.padding = "5px 10px";
          nextBtn.style.cursor = "pointer";

          nav.appendChild(prevBtn);
          nav.appendChild(nextBtn);
          content.insertBefore(nav, qrContainer);

          // Function to update QR code
          function updateQRCode() {
            // Clear previous QR code
            qrContainer.innerHTML = "";

            // Update status text
            sizeInfo.textContent =
              "Chunk " + (currentChunk + 1) + " of " + chunks.length;

            // Create data with chunk info
            var chunkData = {
              part: currentChunk + 1,
              total: chunks.length,
              data: chunks[currentChunk],
            };

            // Generate QR code
            new QRCode(qrContainer, {
              text: JSON.stringify(chunkData),
              width: 256,
              height: 256,
              colorDark: "#000000",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.H,
            });

            // Update button states
            prevBtn.disabled = currentChunk === 0;
            nextBtn.disabled = currentChunk === chunks.length - 1;
          }

          // Set up button handlers
          prevBtn.onclick = function () {
            if (currentChunk > 0) {
              currentChunk--;
              updateQRCode();
            }
          };

          nextBtn.onclick = function () {
            if (currentChunk < chunks.length - 1) {
              currentChunk++;
              updateQRCode();
            }
          };

          // Show first QR code
          updateQRCode();
        };
      }

      // Generate the QR code (for single chunk/not split)
      new QRCode(qrContainer, {
        text: logsJson,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });

      self.addOutput("QR code generated - scan with your computer", "#00ff00");
    });
  }

  /**
   * Load the QR Code library
   * @param {Function} callback - Function to call when loaded
   */
  loadQRCodeLibrary(callback) {
    if (typeof QRCode !== "undefined") {
      // Library already loaded
      callback();
      return;
    }

    var script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    script.onload = callback;
    script.onerror = function () {
      this.addOutput(
        "Failed to load QR code library. Check your internet connection.",
        "#ff0000"
      );
    }.bind(this);

    document.head.appendChild(script);
  }

  /**
   * Generate multiple QR codes for large logs
   */
  /**
   * Generate multiple QR codes for large logs
   */
  generateSplitLogQRCodes() {
    // Get logs from all possible sources
    const logs = this.getAllLogs();

    if (logs.length === 0) {
      this.addOutput(
        "No logs available to export via QR code. Try running 'log enable' first.",
        "#ffaa00"
      );
      return;
    }

    this.addOutput("Generating split QR codes for logs...", "#00aaff");

    // Load QRCode.js from CDN
    this.loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
      function () {
        try {
          // Format logs as JSON
          const logsJson = JSON.stringify(logs);

          // Get log size
          const byteSize = new Blob([logsJson]).size;
          const kilobyteSize = (byteSize / 1024).toFixed(2);

          // Define maximum chunk size (in bytes) for reliable QR codes
          const MAX_CHUNK_SIZE = 1200; // Conservative size for reliable scanning

          // Split the logs into chunks
          const chunks = this.chunkString(logsJson, MAX_CHUNK_SIZE);

          this.addOutput(
            "Split " +
              kilobyteSize +
              " KB of logs into " +
              chunks.length +
              " QR codes",
            "#00ff00"
          );

          // Create container for QR codes
          const container = document.createElement("div");
          container.id = "qrcode-container";
          container.style.background = "white";
          container.style.padding = "20px";
          container.style.textAlign = "center";
          container.style.borderRadius = "8px";
          container.style.maxWidth = "350px";
          container.style.maxHeight = "80vh";
          container.style.overflowY = "auto";
          container.style.margin = "10px 0";
          container.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";

          // Add title
          const title = document.createElement("div");
          title.textContent = "Log Transfer - Multiple QR Codes";
          title.style.marginBottom = "10px";
          title.style.color = "black";
          title.style.fontWeight = "bold";
          container.appendChild(title);

          // Add size info
          const sizeInfo = document.createElement("div");
          sizeInfo.textContent =
            "Log size: " +
            kilobyteSize +
            " KB (" +
            chunks.length +
            " QR codes)";
          sizeInfo.style.marginBottom = "10px";
          sizeInfo.style.color = "black";
          sizeInfo.style.fontSize = "12px";
          container.appendChild(sizeInfo);

          // Add navigation controls for multiple QR codes
          const navControl = document.createElement("div");
          navControl.style.display = "flex";
          navControl.style.justifyContent = "center";
          navControl.style.alignItems = "center";
          navControl.style.gap = "10px";
          navControl.style.marginBottom = "10px";

          const prevButton = document.createElement("button");
          prevButton.textContent = "< Prev";
          prevButton.style.padding = "5px 10px";
          prevButton.style.backgroundColor = "#4285f4";
          prevButton.style.color = "white";
          prevButton.style.border = "none";
          prevButton.style.borderRadius = "4px";
          prevButton.style.cursor = "pointer";

          const nextButton = document.createElement("button");
          nextButton.textContent = "Next >";
          nextButton.style.padding = "5px 10px";
          nextButton.style.backgroundColor = "#4285f4";
          nextButton.style.color = "white";
          nextButton.style.border = "none";
          nextButton.style.borderRadius = "4px";
          nextButton.style.cursor = "pointer";

          const pageInfo = document.createElement("div");
          pageInfo.style.color = "black";
          pageInfo.style.margin = "0 10px";

          navControl.appendChild(prevButton);
          navControl.appendChild(pageInfo);
          navControl.appendChild(nextButton);
          container.appendChild(navControl);

          // Create div for QR codes
          const qrcodeDiv = document.createElement("div");
          qrcodeDiv.id = "qrcode-multiple";
          container.appendChild(qrcodeDiv);

          // Add close button
          const closeButton = document.createElement("button");
          closeButton.textContent = "Close";
          closeButton.style.marginTop = "10px";
          closeButton.style.padding = "5px 10px";
          closeButton.style.backgroundColor = "#f44336";
          closeButton.style.color = "white";
          closeButton.style.border = "none";
          closeButton.style.borderRadius = "4px";
          closeButton.style.cursor = "pointer";

          // Add instructions
          const instructions = document.createElement("div");
          instructions.style.marginTop = "10px";
          instructions.style.fontSize = "12px";
          instructions.style.color = "black";
          instructions.innerHTML =
            "Scan all QR codes in sequence with your computer.<br>Use a QR code reader that supports merging multiple codes.";
          container.appendChild(instructions);

          // Add container to the body
          document.body.appendChild(container);

          // Position fixed in center
          container.style.position = "fixed";
          container.style.top = "50%";
          container.style.left = "50%";
          container.style.transform = "translate(-50%, -50%)";
          container.style.zIndex = "10000";

          // Store all the variables we need access to in the navigation
          var navigationState = {
            currentIndex: 0,
            chunks: chunks,
            qrcodeDiv: qrcodeDiv,
            pageInfo: pageInfo,
            prevButton: prevButton,
            nextButton: nextButton,
          };

          // Function to display QR code at specified index - defined as a standalone function
          function showQRCode(index) {
            // Update page info
            navigationState.pageInfo.textContent =
              "QR code " + (index + 1) + " of " + navigationState.chunks.length;

            // Clear current QR code
            navigationState.qrcodeDiv.innerHTML = "";

            // Prepare data with metadata
            var chunkData = JSON.stringify({
              part: index + 1,
              total: navigationState.chunks.length,
              data: navigationState.chunks[index],
            });

            // Generate QR code - making sure QRCode is defined
            if (typeof QRCode !== "undefined") {
              new QRCode(navigationState.qrcodeDiv, {
                text: chunkData,
                width: 256,
                height: 256,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H, // High error correction
              });
            } else {
              // Fallback if QRCode isn't available
              var errorMsg = document.createElement("div");
              errorMsg.textContent =
                "QR Code library not loaded. Please try again.";
              errorMsg.style.color = "red";
              navigationState.qrcodeDiv.appendChild(errorMsg);
            }

            // Update button states
            navigationState.prevButton.disabled = index === 0;
            navigationState.prevButton.style.opacity =
              index === 0 ? "0.5" : "1";
            navigationState.nextButton.disabled =
              index === navigationState.chunks.length - 1;
            navigationState.nextButton.style.opacity =
              index === navigationState.chunks.length - 1 ? "0.5" : "1";

            // Update current index
            navigationState.currentIndex = index;
          }

          // Add event listeners for navigation
          prevButton.addEventListener("click", function () {
            if (navigationState.currentIndex > 0) {
              showQRCode(navigationState.currentIndex - 1);
            }
          });

          nextButton.addEventListener("click", function () {
            if (
              navigationState.currentIndex <
              navigationState.chunks.length - 1
            ) {
              showQRCode(navigationState.currentIndex + 1);
            }
          });

          // Close button event listener
          closeButton.addEventListener("click", function () {
            document.body.removeChild(container);
          });
          container.appendChild(closeButton);

          // Show the first QR code
          showQRCode(0);

          this.addOutput(
            "Generated " + chunks.length + " QR codes for your logs",
            "#00ff00"
          );
          this.addOutput(
            "Scan them in sequence with a QR code reader on your computer",
            "#aaaaaa"
          );
        } catch (error) {
          this.addOutput(
            "Error generating split QR codes: " + error.message,
            "#ff0000"
          );
          console.error("Split QR code generation error:", error);
        }
      }.bind(this)
    ); // Bind this to maintain context
  }

  /**
   * Helper to split string into chunks of specified size
   * @param {string} str - String to split
   * @param {number} size - Maximum chunk size in bytes
   * @returns {Array} Array of string chunks
   */
  chunkString(str, size) {
    const chunks = [];
    let index = 0;

    while (index < str.length) {
      chunks.push(str.substring(index, index + size));
      index += size;
    }

    return chunks;
  }

  /**
   * Helper to load script from URL
   * @param {string} url - Script URL to load
   * @param {Function} callback - Callback function when loaded
   */
  loadScript(url, callback) {
    // Check if script is already loaded
    if (document.querySelector(`script[src="${url}"]`)) {
      callback();
      return;
    }

    const script = document.createElement("script");
    script.src = url;
    script.onload = callback;
    script.onerror = (error) => {
      this.addOutput(
        `Error loading script from ${url}: ${error.message}`,
        "#ff0000"
      );
    };
    document.head.appendChild(script);
  }

  /**
   * Initialize the feature snapper
   */
  initializeSnapper() {
    // Check if already initialized
    if (window.featureSnapper) {
      this.addOutput("Feature snapper is already initialized", "#ffaa00");
      return;
    }

    this.addOutput("Initializing feature snapper...", "#00aaff");

    try {
      // Check if map is available
      if (!window.interface || !window.interface.map) {
        throw new Error("Map not found. Please make sure the map is loaded.");
      }

      // Check if FeatureSnapper class exists
      if (typeof FeatureSnapper !== "function") {
        // Try to load it if available but not initialized
        if (document.querySelector('script[src*="feature-snapper.js"]')) {
          throw new Error(
            "FeatureSnapper script found but class not initialized. Try refreshing the page."
          );
        } else {
          throw new Error(
            "FeatureSnapper class not found. Make sure feature-snapper.js is included in your HTML."
          );
        }
      }

      // Create a new feature snapper instance
      window.featureSnapper = new FeatureSnapper(window.interface.map, {
        snapRadiusPixels: 30, // Increased radius for easier snapping
        showSnapIndicator: true,
        debug: true, // Enable debug mode

        // Layer filter - only snap to certain layers
        layerFilter: (layer) => {
          // Skip layers that are purely for visual effects
          const skipLayerTypes = ["background", "raster", "hillshade"];
          if (skipLayerTypes.includes(layer.type)) return false;

          // Skip specific layers by id pattern
          const skipLayerIds = ["highlight", "background", "shadow"];
          for (const skipId of skipLayerIds) {
            if (layer.id.includes(skipId)) return false;
          }

          return true;
        },

        // When a feature is snapped to (mouse hover)
        onSnap: (snapResult) => {
          this.updateStatusMessage(`Snapped to ${snapResult.geometryType}`);

          // Change the cursor to indicate snapping
          window.interface.map.getCanvas().style.cursor = "pointer";
        },

        // When a feature is selected (mouse click)
        onSelect: (selectResult) => {
          const feature = selectResult.feature;

          // Highlight the selected feature
          window.featureSnapper.highlightFeature(feature);

          // Update the status message
          this.updateStatusMessage(`Selected ${feature.geometry.type}`);

          // Log feature details
          console.log("Selected feature:", feature);

          // Show feature properties in sidebar if available
          if (typeof showFeatureInfo === "function") {
            showFeatureInfo(feature);
          } else {
            // Create a basic feature info display if the function isn't available
            this.showBasicFeatureInfo(feature);
          }
        },
      });

      this.addOutput("Feature snapper initialized successfully", "#00ff00");

      // Show snapping button but leave it disabled initially
      this.showSnapButton();
      const button = document.getElementById("snap-toggle-button");
      if (button) {
        button.disabled = false;
        button.textContent = "Enable Snapping";
        button.title = "Click to enable feature snapping (or press S key)";
        button.style.backgroundColor = "#4285f4";
      }

      // Add keyboard shortcut to toggle snapping (press 'S' key)
      document.addEventListener("keydown", function (e) {
        // Check if the key pressed is 'S' and not in an input field
        if (
          e.key.toLowerCase() === "s" &&
          !["INPUT", "TEXTAREA", "SELECT"].includes(
            document.activeElement.tagName
          )
        ) {
          const button = document.getElementById("snap-toggle-button");
          if (button && !button.disabled) {
            button.click(); // Simulate click on the toggle button
          }
        }
      });

      return true;
    } catch (error) {
      this.addOutput(
        `Error initializing feature snapper: ${error.message}`,
        "#ff0000"
      );
      console.error("Error initializing feature snapper:", error);

      // Update the toggle button to show there was an error
      const button = document.getElementById("snap-toggle-button");
      if (button) {
        button.disabled = true;
        button.textContent = "Snapping Error";
        button.title = "Error initializing feature snapping";
        button.style.backgroundColor = "#f44336";
      }

      return false;
    }
  }

  /**
   * Show basic feature info in command line
   * @param {Object} feature - The selected feature
   */
  showBasicFeatureInfo(feature) {
    let infoText = `Selected Feature:\n`;
    infoText += `- Type: ${feature.geometry.type}\n`;

    if (feature.properties) {
      infoText += `- Properties:\n`;
      for (const [key, value] of Object.entries(feature.properties)) {
        if (key.startsWith("_")) continue; // Skip internal properties

        let displayValue = value;
        if (value === null || value === undefined || value === "") {
          displayValue = "(empty)";
        } else if (typeof value === "object") {
          displayValue = JSON.stringify(value);
        }

        infoText += `  • ${key}: ${displayValue}\n`;
      }
    }

    this.addOutput(infoText, "#00aaff");
  }

  /**
   * Update status message for snapping
   * @param {string} message - Status message
   */
  updateStatusMessage(message) {
    // Check if we already have a status element
    let statusElement = document.getElementById("snap-status-message");

    if (!statusElement) {
      // Create a new status element
      statusElement = document.createElement("div");
      statusElement.id = "snap-status-message";
      statusElement.style.position = "absolute";
      statusElement.style.bottom = "40px";
      statusElement.style.left = "50%";
      statusElement.style.transform = "translateX(-50%)";
      statusElement.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      statusElement.style.color = "white";
      statusElement.style.padding = "8px 16px";
      statusElement.style.borderRadius = "20px";
      statusElement.style.fontFamily = "Roboto, sans-serif";
      statusElement.style.fontSize = "14px";
      statusElement.style.zIndex = "1000";
      statusElement.style.opacity = "0";
      statusElement.style.transition = "opacity 0.3s ease-in-out";

      // Add it to the page
      document.body.appendChild(statusElement);
    }

    // Update the message
    statusElement.textContent = message;

    // Show the message
    statusElement.style.opacity = "1";

    // Hide after 3 seconds
    clearTimeout(window.statusTimeout);
    window.statusTimeout = setTimeout(function () {
      statusElement.style.opacity = "0";
    }, 3000);

    // Also add to command line
    this.addOutput(`Status: ${message}`, "#aaaaaa");
  }

  /**
   * Enable snapping functionality
   */
  enableSnapping() {
    // Try to initialize if not already initialized
    if (!window.featureSnapper) {
      this.addOutput(
        "Feature snapper not initialized. Attempting to initialize now...",
        "#ffaa00"
      );
      const success = this.initializeSnapper();
      if (!success) {
        this.addOutput(
          "Could not initialize snapping. Try 'snap init' to see detailed errors.",
          "#ff0000"
        );
        return;
      }
    }

    try {
      window.featureSnapper.enable();
      this.showSnapButton();
      this.addOutput("Snapping enabled", "#00ff00");

      // Update button text if visible
      const button = document.getElementById("snap-toggle-button");
      if (button) {
        button.textContent = "Disable Snapping";
        button.style.backgroundColor = "#0f9d58";
        button.disabled = false;
      }
    } catch (e) {
      this.addOutput(`Error enabling snapping: ${e.message}`, "#ff0000");
    }
  }

  /**
   * Disable snapping functionality
   */
  disableSnapping() {
    if (!window.featureSnapper) {
      this.addOutput(
        "Feature snapper not initialized. Use 'snap enable' or 'snap init' first.",
        "#ff0000"
      );
      return;
    }

    try {
      window.featureSnapper.disable();
      this.addOutput("Snapping disabled", "#00ff00");

      // Update button text if visible
      const button = document.getElementById("snap-toggle-button");
      if (button) {
        button.textContent = "Enable Snapping";
        button.style.backgroundColor = "#4285f4";
      }
    } catch (e) {
      this.addOutput(`Error disabling snapping: ${e.message}`, "#ff0000");
    }
  }

  /**
   * Toggle snapping state
   */
  toggleSnapping() {
    if (!window.featureSnapper) {
      this.addOutput(
        "Feature snapper not initialized. Use 'snap enable' or 'snap init' first.",
        "#ff0000"
      );
      return;
    }

    try {
      if (window.featureSnapper.options.active) {
        this.disableSnapping();
      } else {
        this.enableSnapping();
      }
    } catch (e) {
      this.addOutput(`Error toggling snapping: ${e.message}`, "#ff0000");
    }
  }

  /**
   * Show snapping status
   */
  showSnappingStatus() {
    if (!window.featureSnapper) {
      this.addOutput(
        "Feature snapper not initialized. Use 'snap enable' or 'snap init' first.",
        "#ff0000"
      );
      return;
    }

    const status = window.featureSnapper.options.active ? "active" : "inactive";
    const buttonVisible = this.isElementVisible(
      document.getElementById("snap-toggle-button")
    );

    this.addOutput(
      `Snapping is currently ${status}, button is ${
        buttonVisible ? "visible" : "hidden"
      }`,
      "#00ff00"
    );
  }

  /**
   * List all available buttons and their status
   */
  listButtons() {
    const gnssButton = document.getElementById("gnss-simulator-button");
    const snapButton = document.getElementById("snap-toggle-button");

    let buttonInfo = "Control Buttons Status:\n";

    buttonInfo += `GNSS Simulator: ${
      gnssButton
        ? this.isElementVisible(gnssButton)
          ? "Visible"
          : "Hidden"
        : "Not created"
    }\n`;
    buttonInfo += `Snapping: ${
      snapButton
        ? this.isElementVisible(snapButton)
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

    this.addOutput(buttonInfo, "#00ff00");
  }

  /**
   * Check if element is visible
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} Whether the element is visible
   */
  isElementVisible(element) {
    return window.getComputedStyle(element).display !== "none";
  }

  /**
   * Show GNSS button
   */
  showGnssButton() {
    // Check if button controller exists
    if (
      window.buttonController &&
      typeof window.buttonController.showGnssButton === "function"
    ) {
      window.buttonController.showGnssButton();
      this.addOutput("GNSS button shown using button controller", "#00ff00");
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
      this.addOutput("GNSS button created and shown", "#00ff00");
    } else {
      // Show existing button
      button.style.display = "flex";
      // Remove any CSS classes that might be hiding it
      button.classList.add("force-show");
      this.addOutput("Existing GNSS button shown", "#00ff00");
    }
  }

  /**
   * Hide GNSS button
   */
  hideGnssButton() {
    // Check if button controller exists
    if (
      window.buttonController &&
      typeof window.buttonController.hideGnssButton === "function"
    ) {
      window.buttonController.hideGnssButton();
      this.addOutput("GNSS button hidden using button controller", "#00ff00");
      return;
    }

    // Otherwise, hide the button manually
    const button = document.getElementById("gnss-simulator-button");
    if (button) {
      button.style.display = "none";
      // Remove any CSS classes that might be showing it
      button.classList.remove("force-show");
      this.addOutput("GNSS button hidden", "#00ff00");
    } else {
      this.addOutput("GNSS button not found", "#ffaa00");
    }
  }

  /**
   * Show snapping button
   */
  showSnapButton() {
    // Check if button controller exists
    if (
      window.buttonController &&
      typeof window.buttonController.showSnappingButton === "function"
    ) {
      window.buttonController.showSnappingButton();
      this.addOutput(
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
      this.addOutput("Snapping button shown", "#00ff00");
    } else {
      this.addOutput(
        "Snapping button not found. Initialize snapping first.",
        "#ffaa00"
      );
    }
  }

  /**
   * Hide snapping button
   */
  hideSnapButton() {
    // Check if button controller exists
    if (
      window.buttonController &&
      typeof window.buttonController.hideSnappingButton === "function"
    ) {
      window.buttonController.hideSnappingButton();
      this.addOutput(
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
      this.addOutput("Snapping button hidden", "#00ff00");
    } else {
      this.addOutput("Snapping button not found", "#ffaa00");
    }
  }

  /**
   * Enable snapping functionality
   */
  enableSnapping() {
    if (!window.featureSnapper) {
      this.addOutput("Feature snapper not initialized yet", "#ff0000");
      return;
    }

    try {
      window.featureSnapper.enable();
      this.showSnapButton();
      this.addOutput("Snapping enabled", "#00ff00");

      // Update button text if visible
      const button = document.getElementById("snap-toggle-button");
      if (button) {
        button.textContent = "Disable Snapping";
        button.style.backgroundColor = "#0f9d58";
      }
    } catch (e) {
      this.addOutput(`Error enabling snapping: ${e.message}`, "#ff0000");
    }
  }

  /**
   * Disable snapping functionality
   */
  disableSnapping() {
    if (!window.featureSnapper) {
      this.addOutput("Feature snapper not initialized yet", "#ff0000");
      return;
    }

    try {
      window.featureSnapper.disable();
      this.addOutput("Snapping disabled", "#00ff00");

      // Update button text if visible
      const button = document.getElementById("snap-toggle-button");
      if (button) {
        button.textContent = "Enable Snapping";
        button.style.backgroundColor = "#4285f4";
      }
    } catch (e) {
      this.addOutput(`Error disabling snapping: ${e.message}`, "#ff0000");
    }
  }

  /**
   * Toggle snapping state
   */
  toggleSnapping() {
    if (!window.featureSnapper) {
      this.addOutput("Feature snapper not initialized yet", "#ff0000");
      return;
    }

    try {
      if (window.featureSnapper.options.active) {
        this.disableSnapping();
      } else {
        this.enableSnapping();
      }
    } catch (e) {
      this.addOutput(`Error toggling snapping: ${e.message}`, "#ff0000");
    }
  }

  /**
   * Show snapping status
   */
  showSnappingStatus() {
    if (!window.featureSnapper) {
      this.addOutput("Feature snapper not initialized yet", "#ff0000");
      return;
    }

    const status = window.featureSnapper.options.active ? "active" : "inactive";
    const buttonVisible = this.isElementVisible(
      document.getElementById("snap-toggle-button")
    );

    this.addOutput(
      `Snapping is currently ${status}, button is ${
        buttonVisible ? "visible" : "hidden"
      }`,
      "#00ff00"
    );
  }

  /**
   * Handle center command
   * @param {Array} args - Command arguments
   */
  handleCenterCommand(args) {
    const map = window.interface.map;
    if (args.length >= 2) {
      const lng = parseFloat(args[0]);
      const lat = parseFloat(args[1]);
      if (isNaN(lng) || isNaN(lat)) {
        throw new Error("Invalid coordinates");
      }
      map.setCenter([lng, lat]);
      this.addOutput(`Map centered at [${lng}, ${lat}]`, "#00ff00");
    } else {
      const center = map.getCenter();
      this.addOutput(
        `Current map center: [${center.lng.toFixed(6)}, ${center.lat.toFixed(
          6
        )}]`,
        "#00ff00"
      );
    }
  }

  /**
   * Handle zoom command
   * @param {Array} args - Command arguments
   */
  handleZoomCommand(args) {
    const mapZoom = window.interface.map;
    if (args.length >= 1) {
      const zoom = parseFloat(args[0]);
      if (isNaN(zoom)) {
        throw new Error("Invalid zoom level");
      }
      mapZoom.setZoom(zoom);
      this.addOutput(`Map zoom set to ${zoom}`, "#00ff00");
    } else {
      const zoom = mapZoom.getZoom();
      this.addOutput(`Current map zoom: ${zoom.toFixed(2)}`, "#00ff00");
    }
  }

  /**
   * Handle layers command with expanded functionality
   * @param {Array} args - Command arguments (optional)
   */
  /**
   * Handle layers command with expanded functionality
   * @param {Array} args - Command arguments (optional)
   */
  handleLayersCommand(args = []) {
    try {
      const map = window.interface.map;
      const layers = map.getStyle().layers;
      const sources = map.getStyle().sources;

      // Parse arguments if provided
      const subCmd = args.length > 0 ? args[0].toLowerCase() : "all";

      this.addOutput(
        `Running layers command with sub-command: ${subCmd}`,
        "#aaaaaa"
      );

      switch (subCmd) {
        case "all":
        case "list":
          // Original functionality - list all layers
          let layerInfo = `Total layers: ${layers.length}\n`;
          layers.forEach((layer, index) => {
            layerInfo += `${index + 1}. ${layer.id} (${layer.type})\n`;
          });
          this.addOutput(layerInfo, "#00ff00");
          break;

        case "background":
          // List all background layers
          const backgroundLayers = layers.filter(
            (layer) =>
              layer.type === "background" ||
              (sources[layer.source] && sources[layer.source].type === "raster")
          );

          if (backgroundLayers.length === 0) {
            this.addOutput("No background layers found.", "#ffaa00");
          } else {
            let bgInfo = `Background layers: ${backgroundLayers.length}\n`;
            backgroundLayers.forEach((layer, index) => {
              const sourceInfo = layer.source
                ? ` (source: ${layer.source})`
                : "";
              bgInfo += `${index + 1}. ${layer.id} (${
                layer.type
              })${sourceInfo}\n`;
            });
            this.addOutput(bgInfo, "#00ff00");
          }
          break;

        case "geojson":
          // List all GeoJSON layers
          const geojsonLayers = this.getGeojsonLayers(layers, sources);

          if (geojsonLayers.length === 0) {
            this.addOutput("No GeoJSON layers found.", "#ffaa00");
          } else {
            let gjInfo = `GeoJSON layers: ${geojsonLayers.length}\n`;
            geojsonLayers.forEach((layer, index) => {
              gjInfo += `${index + 1}. ${layer.id} (${layer.type}) - source: ${
                layer.source
              }\n`;
            });
            this.addOutput(gjInfo, "#00ff00");
          }
          break;
        case "geojson-full":
          // Show detailed info about GeoJSON layers
          this.showFullGeoJsonInfo();
          break;
        case "raw":
        case "raw-geojson":
          // Show raw GeoJSON for features
          this.listRawGeoJson(args.slice(1));
          break;
        case "features":
        case "objects":
          // List top 10 GeoJSON objects across all layers
          this.listGeoJsonObjects();
          break;

        case "features-by-layer":
        case "objects-by-layer":
          // List top 10 GeoJSON objects for each layer
          this.listGeoJsonObjectsByLayer();
          break;
        case "objects-full":
        case "features-full":
          this.listGeoJsonObjectsFull();
          break;

        case "objects-by-layer-full":
        case "features-by-layer-full":
          this.listGeoJsonObjectsByLayerFull();
          break;

        case "help":
          this.addOutput(
            `
Layers Command Usage:
layers             - List all map layers
layers background  - List background and raster layers
layers geojson     - List GeoJSON layers
layers geojson-full - Show detailed information about GeoJSON layers
layers objects     - List top 10 GeoJSON objects across all layers
layers objects-full   - Show detailed information about top GeoJSON objects
layers objects-by-layer-full - Show detailed information about GeoJSON objects by layer
layers objects-by-layer - List top 10 GeoJSON objects for each GeoJSON layer
layers raw [layer_id] [limit] - Show raw GeoJSON for features (default: 1 feature)
layers raw-geojson [layer_id] [limit] - Show raw GeoJSON for features (default: 1 feature)
`,
            "#00ff00"
          );
          break;

        default:
          this.addOutput(
            `Unknown layers sub-command: "${subCmd}". Try 'layers help' for available options.`,
            "#ff0000"
          );
      }
    } catch (error) {
      this.addOutput(
        `Error in handleLayersCommand: ${error.message}`,
        "#ff0000"
      );
      console.error("Error in handleLayersCommand:", error);
    }
  }

  /**
   * List full detail of GeoJSON objects across all layers
   */
  listGeoJsonObjectsFull() {
    try {
      const map = window.interface.map;
      const style = map.getStyle();
      const layers = style.layers;
      const sources = style.sources;

      // Get all GeoJSON layers
      const geojsonLayers = this.getGeojsonLayers(layers, sources);

      if (geojsonLayers.length === 0) {
        this.addOutput("No GeoJSON layers found.", "#ffaa00");
        return;
      }

      let allFeatures = [];
      let loadedSources = 0;
      let totalSources = geojsonLayers.length;

      // Output processing status
      this.addOutput(
        `Processing ${totalSources} GeoJSON sources for detailed feature information...`,
        "#00aaff"
      );

      // Process each GeoJSON layer to extract features
      geojsonLayers.forEach((layer) => {
        const sourceId = layer.source;
        const source = sources[sourceId];

        // Skip if source doesn't exist
        if (!source) {
          loadedSources++;
          return;
        }

        try {
          // Try to get features from the source
          const sourceData = map.getSource(sourceId);

          if (sourceData && sourceData._data) {
            // If source data is available directly
            let features = [];

            if (sourceData._data.features) {
              // Standard GeoJSON FeatureCollection
              features = sourceData._data.features;
            } else if (sourceData._data.type === "Feature") {
              // Single GeoJSON Feature
              features = [sourceData._data];
            }

            // Add source info to each feature
            features.forEach((feature) => {
              if (!feature.properties) feature.properties = {};

              // Add source and layer id to properties for display
              feature._sourceId = sourceId;
              feature._layerId = layer.id;
            });

            // Add to all features array
            allFeatures = allFeatures.concat(features);
          }

          loadedSources++;
        } catch (error) {
          this.addOutput(
            `Error accessing source '${sourceId}': ${error.message}`,
            "#ff0000"
          );
          loadedSources++;
        }
      });

      // Check if all sources have been processed
      if (loadedSources === totalSources) {
        this.displayFullFeatures(allFeatures);
      }
    } catch (error) {
      this.addOutput(
        `Error in listGeoJsonObjectsFull: ${error.message}`,
        "#ff0000"
      );
      console.error("Error in listGeoJsonObjectsFull:", error);
    }
  }

  /**
   * List full detail of GeoJSON objects organized by layer
   */
  listGeoJsonObjectsByLayerFull() {
    try {
      const map = window.interface.map;
      const style = map.getStyle();
      const layers = style.layers;
      const sources = style.sources;

      // Get all GeoJSON layers
      const geojsonLayers = this.getGeojsonLayers(layers, sources);

      if (geojsonLayers.length === 0) {
        this.addOutput("No GeoJSON layers found.", "#ffaa00");
        return;
      }

      // Output processing status
      this.addOutput(
        `Processing ${geojsonLayers.length} GeoJSON layers for detailed feature information...`,
        "#00aaff"
      );

      // Process each GeoJSON layer to extract features
      geojsonLayers.forEach((layer) => {
        const sourceId = layer.source;
        const source = sources[sourceId];

        // Skip if source doesn't exist
        if (!source) {
          this.addOutput(
            `Source '${sourceId}' not found for layer '${layer.id}'.`,
            "#ffaa00"
          );
          return;
        }

        try {
          // Try to get features from the source
          const sourceData = map.getSource(sourceId);

          if (sourceData && sourceData._data) {
            // If source data is available directly
            let features = [];

            if (sourceData._data.features) {
              // Standard GeoJSON FeatureCollection
              features = sourceData._data.features;
            } else if (sourceData._data.type === "Feature") {
              // Single GeoJSON Feature
              features = [sourceData._data];
            }

            // Add source info to each feature
            features.forEach((feature) => {
              if (!feature.properties) feature.properties = {};

              // Add source and layer id to properties for display
              feature._sourceId = sourceId;
              feature._layerId = layer.id;
            });

            // Display top features for this layer
            this.addOutput(
              `\n🔷 Detailed features in layer: ${layer.id} (source: ${sourceId})`,
              "#00aaff"
            );
            this.displayFullFeatures(features, 10, false); // Don't show source info since we're already grouped by layer
          } else {
            this.addOutput(
              `No data found in source '${sourceId}' for layer '${layer.id}'.`,
              "#ffaa00"
            );
          }
        } catch (error) {
          this.addOutput(
            `Error accessing source '${sourceId}': ${error.message}`,
            "#ff0000"
          );
        }
      });
    } catch (error) {
      this.addOutput(
        `Error in listGeoJsonObjectsByLayerFull: ${error.message}`,
        "#ff0000"
      );
      console.error("Error in listGeoJsonObjectsByLayerFull:", error);
    }
  }

  /**
   * Generate an HTML formatted data URL for logs and open in external browser
   */
  generateHtmlDataUrlExternal() {
    // Get logs using the same method that works in QR code
    var logs = this.getAllLogs();

    if (!logs || logs.length === 0) {
      this.addOutput("No logs available to export", "#ffaa00");
      return;
    }

    try {
      // Generate metadata
      var timestamp = new Date().toISOString();
      var title = "Map Logs - " + new Date().toLocaleString();

      // Start building HTML content with concatenation instead of template literals
      var htmlContent = '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
      htmlContent += '  <meta charset="UTF-8">\n';
      htmlContent +=
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
      htmlContent += "  <title>" + title + "</title>\n";
      htmlContent += "  <style>\n";
      htmlContent += "    body {\n";
      htmlContent +=
        '      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\n';
      htmlContent += "      line-height: 1.6;\n";
      htmlContent += "      color: #333;\n";
      htmlContent += "      max-width: 1200px;\n";
      htmlContent += "      margin: 0 auto;\n";
      htmlContent += "      padding: 20px;\n";
      htmlContent += "      background-color: #f5f5f7;\n";
      htmlContent += "    }\n";

      // Add more CSS styles here (same as before)
      // ...

      htmlContent += "    h1 {\n";
      htmlContent += "      color: #333;\n";
      htmlContent += "      border-bottom: 2px solid #ddd;\n";
      htmlContent += "      padding-bottom: 10px;\n";
      htmlContent += "      margin-bottom: 20px;\n";
      htmlContent += "    }\n";
      htmlContent += "    .summary {\n";
      htmlContent += "      background-color: #fff;\n";
      htmlContent += "      border-radius: 8px;\n";
      htmlContent += "      padding: 15px;\n";
      htmlContent += "      margin-bottom: 20px;\n";
      htmlContent += "      box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n";
      htmlContent += "    }\n";
      htmlContent += "    .summary h2 {\n";
      htmlContent += "      margin-top: 0;\n";
      htmlContent += "      color: #333;\n";
      htmlContent += "    }\n";
      htmlContent += "    .log-entry {\n";
      htmlContent += "      margin-bottom: 20px;\n";
      htmlContent += "      background-color: #fff;\n";
      htmlContent += "      border-radius: 8px;\n";
      htmlContent += "      padding: 15px;\n";
      htmlContent += "      box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n";
      htmlContent += "    }\n";
      htmlContent += "    .log-entry h3 {\n";
      htmlContent += "      margin-top: 0;\n";
      htmlContent += "      color: #333;\n";
      htmlContent += "      border-bottom: 1px solid #eee;\n";
      htmlContent += "      padding-bottom: 8px;\n";
      htmlContent += "    }\n";
      htmlContent += "    .log-entry-header {\n";
      htmlContent += "      display: flex;\n";
      htmlContent += "      justify-content: space-between;\n";
      htmlContent += "      align-items: center;\n";
      htmlContent += "      margin-bottom: 10px;\n";
      htmlContent += "    }\n";
      htmlContent += "    .timestamp {\n";
      htmlContent += "      color: #666;\n";
      htmlContent += "      font-size: 0.9em;\n";
      htmlContent += "    }\n";
      htmlContent += "    .method {\n";
      htmlContent += "      font-weight: bold;\n";
      htmlContent += "    }\n";
      htmlContent += "    .properties {\n";
      htmlContent += "      margin-top: 10px;\n";
      htmlContent += "    }\n";
      htmlContent += "    .property {\n";
      htmlContent += "      margin-bottom: 5px;\n";
      htmlContent += "    }\n";
      htmlContent += "    .key {\n";
      htmlContent += "      font-weight: 600;\n";
      htmlContent += "      color: #555;\n";
      htmlContent += "    }\n";
      htmlContent += "    .value {\n";
      htmlContent += "      word-break: break-word;\n";
      htmlContent += "    }\n";
      htmlContent += "    .json {\n";
      htmlContent += "      background-color: #f5f5f5;\n";
      htmlContent += "      padding: 10px;\n";
      htmlContent += "      border-radius: 4px;\n";
      htmlContent += "      overflow-x: auto;\n";
      htmlContent += "      font-family: monospace;\n";
      htmlContent += "      white-space: pre-wrap;\n";
      htmlContent += "      margin-top: 10px;\n";
      htmlContent += "    }\n";
      htmlContent += "    .btn {\n";
      htmlContent += "      background-color: #0066cc;\n";
      htmlContent += "      color: white;\n";
      htmlContent += "      border: none;\n";
      htmlContent += "      padding: 8px 16px;\n";
      htmlContent += "      border-radius: 4px;\n";
      htmlContent += "      cursor: pointer;\n";
      htmlContent += "      font-size: 14px;\n";
      htmlContent += "      margin-right: 10px;\n";
      htmlContent += "    }\n";
      htmlContent += "    .btn:hover {\n";
      htmlContent += "      background-color: #004c99;\n";
      htmlContent += "    }\n";
      htmlContent += "    .btn-secondary {\n";
      htmlContent += "      background-color: #666;\n";
      htmlContent += "    }\n";
      htmlContent += "    .controls {\n";
      htmlContent += "      margin-bottom: 20px;\n";
      htmlContent += "    }\n";
      htmlContent += "  </style>\n";
      htmlContent += "</head>\n<body>\n";
      htmlContent += "  <h1>Map Log Export</h1>\n";

      htmlContent += '  <div class="summary">\n';
      htmlContent += "    <h2>Summary</h2>\n";
      htmlContent += "    <p>Timestamp: " + timestamp + "</p>\n";
      htmlContent += "    <p>Total log entries: " + logs.length + "</p>\n";
      htmlContent += "    <p>User Agent: " + navigator.userAgent + "</p>\n";
      htmlContent += "  </div>\n";

      htmlContent += '  <div class="controls">\n';
      htmlContent +=
        '    <button class="btn" id="expand-all">Expand All</button>\n';
      htmlContent +=
        '    <button class="btn btn-secondary" id="collapse-all">Collapse All</button>\n';
      htmlContent +=
        '    <button class="btn" id="download-json">Download as JSON</button>\n';
      htmlContent += "  </div>\n";

      htmlContent += '  <div class="logs-container">\n';

      // Add log entries
      for (var i = 0; i < logs.length; i++) {
        var log = logs[i];
        var id = "log-entry-" + i;
        var logTimestamp = log.timestamp
          ? new Date(log.timestamp).toLocaleString()
          : "Unknown time";
        var method = log.method || "Unknown";

        htmlContent += '    <div class="log-entry" id="' + id + '">\n';
        htmlContent += '      <div class="log-entry-header">\n';
        htmlContent += "        <h3>Log Entry #" + (i + 1) + "</h3>\n";
        htmlContent +=
          '        <span class="timestamp">' + logTimestamp + "</span>\n";
        htmlContent += "      </div>\n";
        htmlContent += '      <div class="properties">\n';
        htmlContent += '        <div class="property">\n';
        htmlContent += '          <span class="key">Method:</span>\n';
        htmlContent +=
          '          <span class="value method">' + method + "</span>\n";
        htmlContent += "        </div>\n";

        // Add other properties
        for (var key in log) {
          if (
            log.hasOwnProperty(key) &&
            key !== "timestamp" &&
            key !== "method" &&
            key !== "input" &&
            key !== "style"
          ) {
            var value = log[key];
            var displayValue =
              typeof value === "object" ? JSON.stringify(value) : value;

            htmlContent += '        <div class="property">\n';
            htmlContent += '          <span class="key">' + key + ":</span>\n";
            htmlContent +=
              '          <span class="value">' + displayValue + "</span>\n";
            htmlContent += "        </div>\n";
          }
        }

        // Add input (if available)
        if (log.input) {
          htmlContent += '        <div class="property">\n';
          htmlContent += '          <span class="key">Input:</span>\n';
          htmlContent +=
            '          <div class="json">' + log.input + "</div>\n";
          htmlContent += "        </div>\n";
        }

        // Add style (if available)
        if (log.style) {
          htmlContent += '        <div class="property">\n';
          htmlContent += '          <span class="key">Style:</span>\n';
          htmlContent +=
            '          <div class="json">' + log.style + "</div>\n";
          htmlContent += "        </div>\n";
        }

        htmlContent += "      </div>\n";
        htmlContent += "    </div>\n";
      }

      htmlContent += "  </div>\n";

      // Add JavaScript
      htmlContent += "  <script>\n";
      htmlContent += "    // Expand/collapse functionality\n";
      htmlContent +=
        "    document.getElementById('expand-all').addEventListener('click', function() {\n";
      htmlContent +=
        "      var jsonElements = document.querySelectorAll('.json');\n";
      htmlContent += "      for (var i = 0; i < jsonElements.length; i++) {\n";
      htmlContent += "        jsonElements[i].style.display = 'block';\n";
      htmlContent += "      }\n";
      htmlContent += "    });\n";

      htmlContent +=
        "    document.getElementById('collapse-all').addEventListener('click', function() {\n";
      htmlContent +=
        "      var jsonElements = document.querySelectorAll('.json');\n";
      htmlContent += "      for (var i = 0; i < jsonElements.length; i++) {\n";
      htmlContent += "        jsonElements[i].style.display = 'none';\n";
      htmlContent += "      }\n";
      htmlContent += "    });\n";

      htmlContent += "    // Download as JSON\n";
      htmlContent +=
        "    document.getElementById('download-json').addEventListener('click', function() {\n";
      htmlContent += "      var logs = " + JSON.stringify(logs) + ";\n";
      htmlContent +=
        "      var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));\n";
      htmlContent +=
        "      var downloadAnchorNode = document.createElement('a');\n";
      htmlContent +=
        "      downloadAnchorNode.setAttribute('href', dataStr);\n";
      htmlContent +=
        "      downloadAnchorNode.setAttribute('download', 'map_logs_" +
        timestamp.replace(/:/g, "-") +
        ".json');\n";
      htmlContent += "      document.body.appendChild(downloadAnchorNode);\n";
      htmlContent += "      downloadAnchorNode.click();\n";
      htmlContent += "      downloadAnchorNode.remove();\n";
      htmlContent += "    });\n";
      htmlContent += "  </script>\n";
      htmlContent += "</body>\n</html>";

      // Get byte size
      var byteSize = new Blob([htmlContent]).size;
      var kilobyteSize = (byteSize / 1024).toFixed(2);

      this.addOutput(
        "Preparing " +
          kilobyteSize +
          " KB of HTML log data (" +
          logs.length +
          " entries)",
        "#00aaff"
      );

      // Create a container for buttons
      var container = document.createElement("div");
      container.style.margin = "10px 0";
      container.style.padding = "10px";
      container.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
      container.style.borderRadius = "4px";

      // Add title
      var titleElement = document.createElement("div");
      titleElement.textContent = "External Browser HTML Log Export";
      titleElement.style.fontWeight = "bold";
      titleElement.style.marginBottom = "10px";
      container.appendChild(titleElement);

      // Create a button to open in external browser
      var openButton = document.createElement("button");
      openButton.textContent = "Open HTML Logs in Browser";
      openButton.style.display = "block";
      openButton.style.width = "100%";
      openButton.style.padding = "12px 16px";
      openButton.style.backgroundColor = "#db4437";
      openButton.style.color = "white";
      openButton.style.border = "none";
      openButton.style.borderRadius = "4px";
      openButton.style.fontFamily = "inherit";
      openButton.style.marginBottom = "15px";
      openButton.style.fontWeight = "bold";
      openButton.style.fontSize = "16px";
      openButton.style.cursor = "pointer";

      var self = this;
      openButton.onclick = function () {
        try {
          // Create a data URL
          var dataUrl =
            "data:text/html;charset=utf-8," + encodeURIComponent(htmlContent);

          // Use external browser method
          self.openInExternalBrowser(dataUrl);

          self.addOutput("Opening HTML logs in external browser...", "#00ff00");
        } catch (error) {
          self.addOutput(
            "Error opening in browser: " + error.message,
            "#ff0000"
          );
        }
      };

      container.appendChild(openButton);

      // Add warning for large HTML
      if (kilobyteSize > 5000) {
        var warningEl = document.createElement("div");
        warningEl.textContent =
          "Warning: HTML is large (" +
          kilobyteSize +
          " KB). It may take a moment to load.";
        warningEl.style.color = "#ff9800";
        warningEl.style.margin = "10px 0";
        container.appendChild(warningEl);
      }

      // Add instructions
      var instructions = document.createElement("div");
      instructions.style.marginTop = "15px";
      instructions.style.fontSize = "13px";
      instructions.textContent =
        "Click the button to open interactive HTML view in your device's browser. From there, you can download the raw data.";
      container.appendChild(instructions);

      // Add container to output
      var outputContainer = document.getElementById("cli-output");
      if (outputContainer) {
        outputContainer.appendChild(container);
      } else {
        this.addOutput("Could not create external browser link UI", "#ff0000");
      }
    } catch (error) {
      this.addOutput("Error generating HTML: " + error.message, "#ff0000");
    }
  }

  /**
   * Generate a data URL for logs and open in external browser
   */
  generateDataUrlExternal() {
    // Get logs using the same method that works in QR code
    var logs = this.getAllLogs();

    if (!logs || logs.length === 0) {
      this.addOutput("No logs available to export", "#ffaa00");
      return;
    }

    try {
      // Format logs as JSON
      var logsJson = JSON.stringify(logs);

      // Get byte size
      var byteSize = new Blob([logsJson]).size;
      var kilobyteSize = (byteSize / 1024).toFixed(2);

      this.addOutput(
        "Preparing " +
          kilobyteSize +
          " KB of log data (" +
          logs.length +
          " entries)",
        "#00aaff"
      );

      // Create a container for buttons
      var container = document.createElement("div");
      container.style.margin = "10px 0";
      container.style.padding = "10px";
      container.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
      container.style.borderRadius = "4px";

      // Add title
      var title = document.createElement("div");
      title.textContent = "External Browser Log Export";
      title.style.fontWeight = "bold";
      title.style.marginBottom = "10px";
      container.appendChild(title);

      // Create a button to open in external browser
      var openButton = document.createElement("button");
      openButton.textContent = "Open Raw Logs in Browser";
      openButton.style.display = "block";
      openButton.style.width = "100%";
      openButton.style.padding = "12px 16px";
      openButton.style.backgroundColor = "#4285f4";
      openButton.style.color = "white";
      openButton.style.border = "none";
      openButton.style.borderRadius = "4px";
      openButton.style.fontFamily = "inherit";
      openButton.style.marginBottom = "15px";
      openButton.style.fontWeight = "bold";
      openButton.style.fontSize = "16px";
      openButton.style.cursor = "pointer";

      var self = this;
      openButton.onclick = function () {
        try {
          // Create a data URL
          var dataUrl =
            "data:text/json;charset=utf-8," + encodeURIComponent(logsJson);

          // Use location.href to force external browser open
          self.openInExternalBrowser(dataUrl);

          self.addOutput("Opening logs in external browser...", "#00ff00");
        } catch (error) {
          self.addOutput(
            "Error opening in browser: " + error.message,
            "#ff0000"
          );
        }
      };

      container.appendChild(openButton);

      // Add alternative options
      var alternativeLinks = document.createElement("div");
      alternativeLinks.style.marginTop = "10px";
      alternativeLinks.style.display = "flex";
      alternativeLinks.style.justifyContent = "space-between";

      // Add link to pretty version
      var prettyLink = document.createElement("button");
      prettyLink.textContent = "Pretty Format";
      prettyLink.style.padding = "8px 12px";
      prettyLink.style.backgroundColor = "#0f9d58";
      prettyLink.style.color = "white";
      prettyLink.style.border = "none";
      prettyLink.style.borderRadius = "4px";
      prettyLink.style.width = "48%";
      prettyLink.style.cursor = "pointer";

      prettyLink.onclick = function () {
        self.generatePrettyDataUrlExternal();
      };

      // Add link to HTML version
      var htmlLink = document.createElement("button");
      htmlLink.textContent = "HTML Format";
      htmlLink.style.padding = "8px 12px";
      htmlLink.style.backgroundColor = "#db4437";
      htmlLink.style.color = "white";
      htmlLink.style.border = "none";
      htmlLink.style.borderRadius = "4px";
      htmlLink.style.width = "48%";
      htmlLink.style.cursor = "pointer";

      htmlLink.onclick = function () {
        self.generateHtmlDataUrlExternal();
      };

      alternativeLinks.appendChild(prettyLink);
      alternativeLinks.appendChild(htmlLink);
      container.appendChild(alternativeLinks);

      // Add instructions
      var instructions = document.createElement("div");
      instructions.style.marginTop = "15px";
      instructions.style.fontSize = "13px";
      instructions.textContent =
        "Click the button to open logs in your device's browser. From there, you can save the data to your device.";
      container.appendChild(instructions);

      // Add container to output
      var outputContainer = document.getElementById("cli-output");
      if (outputContainer) {
        outputContainer.appendChild(container);
      } else {
        this.addOutput("Could not create external browser link UI", "#ff0000");
      }
    } catch (error) {
      this.addOutput("Error generating data URL: " + error.message, "#ff0000");
    }
  }

  /**
   * Generate a pretty (formatted) data URL for logs and open in external browser
   */
  generatePrettyDataUrlExternal() {
    // Get logs using the same method that works in QR code
    var logs = this.getAllLogs();

    if (!logs || logs.length === 0) {
      this.addOutput("No logs available to export", "#ffaa00");
      return;
    }

    try {
      // Format logs as pretty JSON with indentation
      var logsJson = JSON.stringify(logs, null, 2);

      // Get byte size
      var byteSize = new Blob([logsJson]).size;
      var kilobyteSize = (byteSize / 1024).toFixed(2);

      this.addOutput(
        "Preparing " +
          kilobyteSize +
          " KB of formatted log data (" +
          logs.length +
          " entries)",
        "#00aaff"
      );

      // Create a container for buttons
      var container = document.createElement("div");
      container.style.margin = "10px 0";
      container.style.padding = "10px";
      container.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
      container.style.borderRadius = "4px";

      // Add title
      var title = document.createElement("div");
      title.textContent = "External Browser Formatted Log Export";
      title.style.fontWeight = "bold";
      title.style.marginBottom = "10px";
      container.appendChild(title);

      // Create a button to open in external browser
      var openButton = document.createElement("button");
      openButton.textContent = "Open Formatted Logs in Browser";
      openButton.style.display = "block";
      openButton.style.width = "100%";
      openButton.style.padding = "12px 16px";
      openButton.style.backgroundColor = "#0f9d58";
      openButton.style.color = "white";
      openButton.style.border = "none";
      openButton.style.borderRadius = "4px";
      openButton.style.fontFamily = "inherit";
      openButton.style.marginBottom = "15px";
      openButton.style.fontWeight = "bold";
      openButton.style.fontSize = "16px";
      openButton.style.cursor = "pointer";

      var self = this;
      openButton.onclick = function () {
        try {
          // Create a data URL
          var dataUrl =
            "data:text/json;charset=utf-8," + encodeURIComponent(logsJson);

          // Use external browser method
          self.openInExternalBrowser(dataUrl);

          self.addOutput(
            "Opening formatted logs in external browser...",
            "#00ff00"
          );
        } catch (error) {
          self.addOutput(
            "Error opening in browser: " + error.message,
            "#ff0000"
          );
        }
      };

      container.appendChild(openButton);

      // Add instructions
      var instructions = document.createElement("div");
      instructions.style.marginTop = "15px";
      instructions.style.fontSize = "13px";
      instructions.textContent =
        "Click the button to open logs in your device's browser. From there, you can save the data to your device.";
      container.appendChild(instructions);

      // Add container to output
      var outputContainer = document.getElementById("cli-output");
      if (outputContainer) {
        outputContainer.appendChild(container);
      } else {
        this.addOutput("Could not create external browser link UI", "#ff0000");
      }
    } catch (error) {
      this.addOutput(
        "Error generating pretty data URL: " + error.message,
        "#ff0000"
      );
    }
  }

  /**
   * Open a URL in the external browser
   * @param {string} url - URL to open
   */
  openInExternalBrowser(url) {
    // Method 1: Using window.open with _system target (works in Cordova WebViews)
    try {
      window.open(url, "_system");
      return;
    } catch (e) {
      console.log("Method 1 failed:", e);
    }

    // Method 2: Using location.href (may work in some WebViews)
    try {
      // Create a temporary anchor and trigger click
      var a = document.createElement("a");
      a.href = url;
      a.target = "_blank"; // This may force external browser in some cases
      a.rel = "noopener noreferrer"; // Security best practice
      a.click();
      return;
    } catch (e) {
      console.log("Method 2 failed:", e);
    }

    // Method 3: Attempt to use Android WebView bridge if available
    if (window.Android && typeof window.Android.openBrowser === "function") {
      window.Android.openBrowser(url);
      return;
    }

    // Method 4: If we get here, directly change location (last resort)
    window.location.href = url;
  }

  /**
   * Display full feature details from a feature array
   * @param {Array} features - Array of GeoJSON features
   * @param {number} limit - Maximum number of features to display
   * @param {boolean} showSource - Whether to show source information
   */
  displayFullFeatures(features, limit = 10, showSource = true) {
    try {
      // Check if we have any features
      if (!features || features.length === 0) {
        this.addOutput("No features found.", "#ffaa00");
        return;
      }

      // Output the total number of features
      this.addOutput(`Total features: ${features.length}\n`, "#00ff00");

      // Limit to top N features
      const topFeatures = features.slice(0, limit);

      // Display each feature with full details
      topFeatures.forEach((feature, index) => {
        // Feature header with type and ID information
        let headerInfo = `🔹 Feature ${index + 1}: `;

        // Add geometry type
        if (feature.geometry && feature.geometry.type) {
          headerInfo += `${feature.geometry.type} `;
        } else {
          headerInfo += "Unknown geometry ";
        }

        // Add id if available
        if (feature.id !== undefined) {
          headerInfo += `(id: ${feature.id}) `;
        }

        // Add source info if requested
        if (showSource && feature._sourceId) {
          headerInfo += `[${feature._layerId || "unknown layer"}] `;
        }

        // Display the header
        this.addOutput(headerInfo, "#00ccff");

        // Display detailed geometry information
        if (feature.geometry) {
          this.addOutput(
            `  • Geometry Type: ${feature.geometry.type}`,
            "#ffffff"
          );

          // Show coordinate information based on geometry type
          switch (feature.geometry.type) {
            case "Point":
              this.addOutput(
                `  • Coordinates: [${feature.geometry.coordinates.join(", ")}]`,
                "#ffffff"
              );
              break;

            case "LineString":
              this.addOutput(
                `  • Points: ${feature.geometry.coordinates.length}`,
                "#ffffff"
              );
              this.addOutput(
                `  • First Point: [${feature.geometry.coordinates[0].join(
                  ", "
                )}]`,
                "#ffffff"
              );
              this.addOutput(
                `  • Last Point: [${feature.geometry.coordinates[
                  feature.geometry.coordinates.length - 1
                ].join(", ")}]`,
                "#ffffff"
              );
              break;

            case "Polygon":
              const outerRing = feature.geometry.coordinates[0];
              this.addOutput(
                `  • Rings: ${feature.geometry.coordinates.length}`,
                "#ffffff"
              );
              this.addOutput(
                `  • Outer Ring Points: ${outerRing.length}`,
                "#ffffff"
              );
              break;

            case "MultiPoint":
            case "MultiLineString":
            case "MultiPolygon":
              this.addOutput(
                `  • Number of ${feature.geometry.type.replace(
                  "Multi",
                  ""
                )}s: ${feature.geometry.coordinates.length}`,
                "#ffffff"
              );
              break;

            case "GeometryCollection":
              this.addOutput(
                `  • Number of Geometries: ${feature.geometry.geometries.length}`,
                "#ffffff"
              );
              break;
          }
        }

        // Display all properties with detailed formatting
        if (feature.properties) {
          const propKeys = Object.keys(feature.properties).filter(
            (k) => !k.startsWith("_")
          );

          if (propKeys.length > 0) {
            this.addOutput(`  • Properties:`, "#ffffff");

            propKeys.forEach((key) => {
              const value = feature.properties[key];
              let displayValue;

              // Format the value based on its type
              if (value === null || value === undefined) {
                displayValue = "(null)";
              } else if (typeof value === "object") {
                displayValue = JSON.stringify(value);
              } else if (typeof value === "string") {
                // Truncate long strings
                displayValue =
                  value.length > 100
                    ? `"${value.substring(0, 100)}..."`
                    : `"${value}"`;
              } else {
                displayValue = value.toString();
              }

              this.addOutput(`      ${key}: ${displayValue}`, "#dddddd");
            });
          } else {
            this.addOutput(`  • Properties: (none)`, "#dddddd");
          }
        }

        // Add a separator between features
        if (index < topFeatures.length - 1) {
          this.addOutput("", "#ffffff"); // Empty line as separator
        }
      });

      // Indicate if there are more features
      if (features.length > limit) {
        this.addOutput(
          `...and ${features.length - limit} more features`,
          "#aaaaaa"
        );
      }
    } catch (error) {
      this.addOutput(
        `Error in displayFullFeatures: ${error.message}`,
        "#ff0000"
      );
      console.error("Error in displayFullFeatures:", error);
    }
  }

  /**
   * Add this method to your EnhancedCommandLine class
   */
  /**
   * List raw GeoJSON data for features
   * @param {Array} args - Additional arguments (optional layer id or limit)
   */
  listRawGeoJson(args = []) {
    try {
      const map = window.interface.map;
      const style = map.getStyle();
      const layers = style.layers;
      const sources = style.sources;

      // Parse additional arguments
      let targetLayerId = null;
      let limit = 1; // Default to just 1 feature to avoid huge output

      // Check if first arg is a number (limit) or string (layer id)
      if (args.length > 0) {
        const firstArg = args[0];
        if (!isNaN(parseInt(firstArg))) {
          // If it's a number, it's the limit
          limit = parseInt(firstArg);
        } else {
          // Otherwise it's a layer ID
          targetLayerId = firstArg;

          // Check if second arg is a number (limit)
          if (args.length > 1 && !isNaN(parseInt(args[1]))) {
            limit = parseInt(args[1]);
          }
        }
      }

      // Get GeoJSON layers
      let geojsonLayers = this.getGeojsonLayers(layers, sources);

      // Filter by layer ID if specified
      if (targetLayerId) {
        geojsonLayers = geojsonLayers.filter(
          (layer) => layer.id === targetLayerId
        );
        if (geojsonLayers.length === 0) {
          this.addOutput(
            `No GeoJSON layer found with ID: ${targetLayerId}`,
            "#ff0000"
          );

          // Show available layer IDs to help the user
          const availableLayers = this.getGeojsonLayers(layers, sources);
          if (availableLayers.length > 0) {
            this.addOutput(`Available GeoJSON layers:`, "#ffffff");
            availableLayers.forEach((layer) => {
              this.addOutput(`  • ${layer.id}`, "#aaaaaa");
            });
          }
          return;
        }
      }

      if (geojsonLayers.length === 0) {
        this.addOutput("No GeoJSON layers found.", "#ffaa00");
        return;
      }

      // Output processing status with limit info
      this.addOutput(
        `Displaying raw GeoJSON for up to ${limit} feature(s) per layer...`,
        "#00aaff"
      );

      // Track if we found any features
      let featuresFound = false;

      // Process each GeoJSON layer
      geojsonLayers.forEach((layer) => {
        const sourceId = layer.source;
        const source = sources[sourceId];

        // Skip if source doesn't exist
        if (!source) {
          this.addOutput(
            `Source '${sourceId}' not found for layer '${layer.id}'.`,
            "#ffaa00"
          );
          return;
        }

        try {
          // Try to get features from the source
          const sourceData = map.getSource(sourceId);

          if (sourceData && sourceData._data) {
            // If source data is available directly
            let features = [];

            if (sourceData._data.features) {
              // Standard GeoJSON FeatureCollection
              features = sourceData._data.features;
            } else if (sourceData._data.type === "Feature") {
              // Single GeoJSON Feature
              features = [sourceData._data];
            }

            if (features.length > 0) {
              featuresFound = true;

              // Header for the layer
              this.addOutput(
                `\n📄 Raw GeoJSON from layer: ${layer.id} (source: ${sourceId})`,
                "#00aaff"
              );

              // Limit the number of features to avoid overwhelming output
              const featuresToShow = features.slice(0, limit);

              // Display each feature's raw GeoJSON
              featuresToShow.forEach((feature, index) => {
                // Create a clean copy of the feature (without internal properties)
                const cleanFeature = JSON.parse(JSON.stringify(feature));

                // Remove any internal properties (those starting with underscore)
                if (cleanFeature.properties) {
                  Object.keys(cleanFeature.properties).forEach((key) => {
                    if (key.startsWith("_")) {
                      delete cleanFeature.properties[key];
                    }
                  });
                }

                // Format the raw JSON with indentation for readability
                const formattedJson = JSON.stringify(cleanFeature, null, 2);

                // Display feature with header
                this.addOutput(`Feature ${index + 1}:`, "#ffffff");
                this.addOutput(formattedJson, "#dddddd");

                // Add a separator between features
                if (index < featuresToShow.length - 1) {
                  this.addOutput("", "#ffffff"); // Empty line as separator
                }
              });

              // Indicate if there are more features
              if (features.length > limit) {
                this.addOutput(
                  `...and ${features.length - limit} more features not shown`,
                  "#aaaaaa"
                );
              }
            } else {
              this.addOutput(
                `No features found in layer: ${layer.id}`,
                "#ffaa00"
              );
            }
          } else {
            this.addOutput(
              `No direct data access for source '${sourceId}' in layer '${layer.id}'.`,
              "#ffaa00"
            );

            // If source has URL, show it
            if (source.data && typeof source.data === "string") {
              this.addOutput(`Source URL: ${source.data}`, "#aaaaaa");
            }
          }
        } catch (error) {
          this.addOutput(
            `Error accessing source '${sourceId}': ${error.message}`,
            "#ff0000"
          );
        }
      });

      if (!featuresFound) {
        this.addOutput("No features found in any layer.", "#ffaa00");
      }

      // Add usage help at the end
      this.addOutput(`\nUsage: layers raw [layer_id] [limit]`, "#aaaaaa");
      this.addOutput(
        `Example: layers raw buildings 3  - Show 3 features from 'buildings' layer`,
        "#aaaaaa"
      );
      this.addOutput(
        `Example: layers raw 5          - Show 5 features from each layer`,
        "#aaaaaa"
      );
    } catch (error) {
      this.addOutput(`Error in listRawGeoJson: ${error.message}`, "#ff0000");
      console.error("Error in listRawGeoJson:", error);
    }
  }

  /**
   * Get logs from all possible storage locations
   * @returns {Array} Combined logs from all sources
   */
  getAllLogs() {
    let logs = [];

    // Check geoJsonLogs (from your original code)
    if (
      window.geoJsonLogs &&
      window.geoJsonLogs.entries &&
      window.geoJsonLogs.entries.length > 0
    ) {
      logs = logs.concat(window.geoJsonLogs.entries);
    }

    // Check mapFeatureLogs (mentioned in commandline-log-mailer.js)
    if (
      window.mapFeatureLogs &&
      window.mapFeatureLogs.entries &&
      window.mapFeatureLogs.entries.length > 0
    ) {
      logs = logs.concat(window.mapFeatureLogs.entries);
    }

    // Check mapLogs (another possible name)
    if (
      window.mapLogs &&
      window.mapLogs.entries &&
      window.mapLogs.entries.length > 0
    ) {
      logs = logs.concat(window.mapLogs.entries);
    }

    return logs;
  }

  /**
   * Get all GeoJSON layers from the map
   * @param {Array} layers - All map layers
   * @param {Object} sources - All map sources
   * @returns {Array} GeoJSON layers
   */
  getGeojsonLayers(layers, sources) {
    // Get all layers that use GeoJSON sources
    return layers.filter((layer) => {
      // Check if layer has a source and the source exists
      if (!layer.source || !sources[layer.source]) return false;

      // Check if the source is GeoJSON
      return sources[layer.source].type === "geojson";
    });
  }

  /**
   * Show detailed information about all GeoJSON layers
   */
  showFullGeoJsonInfo() {
    try {
      const map = window.interface.map;
      const style = map.getStyle();
      const layers = style.layers;
      const sources = style.sources;

      // Get all GeoJSON layers
      const geojsonLayers = this.getGeojsonLayers(layers, sources);

      if (geojsonLayers.length === 0) {
        this.addOutput("No GeoJSON layers found.", "#ffaa00");
        return;
      }

      this.addOutput(
        `Found ${geojsonLayers.length} GeoJSON layers:`,
        "#00ff00"
      );

      // Process each GeoJSON layer
      geojsonLayers.forEach((layer, layerIndex) => {
        const sourceId = layer.source;
        const source = sources[sourceId];

        // Show layer details header
        this.addOutput(`\n${layerIndex + 1}. Layer: ${layer.id}`, "#00aaff");

        // Show layer type and basic info
        const layerInfo = [
          `Type: ${layer.type}`,
          `Source: ${sourceId}`,
          `Visibility: ${layer.layout?.visibility || "visible"}`,
        ];

        // Show paint properties
        if (layer.paint) {
          const paintProps = Object.entries(layer.paint)
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join(", ");
          layerInfo.push(`Paint: ${paintProps}`);
        }

        // Show layout properties
        if (layer.layout) {
          const layoutProps = Object.entries(layer.layout)
            .filter(([key]) => key !== "visibility") // Already showed visibility
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join(", ");
          if (layoutProps) {
            layerInfo.push(`Layout: ${layoutProps}`);
          }
        }

        // Show filter if it exists
        if (layer.filter) {
          layerInfo.push(`Filter: ${JSON.stringify(layer.filter)}`);
        }

        // Show layer info
        layerInfo.forEach((info) => {
          this.addOutput(`   • ${info}`, "#ffffff");
        });

        // Show source info
        this.addOutput(`   Source Details:`, "#00aaff");

        try {
          // Try to get features from the source
          const sourceData = map.getSource(sourceId);

          if (sourceData && sourceData._data) {
            // If source data is available directly
            let features = [];

            if (sourceData._data.features) {
              // Standard GeoJSON FeatureCollection
              features = sourceData._data.features;
              this.addOutput(
                `     • FeatureCollection with ${features.length} features`,
                "#ffffff"
              );
            } else if (sourceData._data.type === "Feature") {
              // Single GeoJSON Feature
              features = [sourceData._data];
              this.addOutput(`     • Single Feature`, "#ffffff");
            }

            // Show unique geometry types
            const geometryTypes = [
              ...new Set(features.map((f) => f.geometry?.type).filter(Boolean)),
            ];
            if (geometryTypes.length > 0) {
              this.addOutput(
                `     • Geometry Types: ${geometryTypes.join(", ")}`,
                "#ffffff"
              );
            }

            // Collect all property keys across features
            const allPropertyKeys = new Set();
            features.forEach((feature) => {
              if (feature.properties) {
                Object.keys(feature.properties).forEach((key) =>
                  allPropertyKeys.add(key)
                );
              }
            });

            // Show property keys
            if (allPropertyKeys.size > 0) {
              this.addOutput(
                `     • Property Fields: ${[...allPropertyKeys].join(", ")}`,
                "#ffffff"
              );
            }

            // Sample first 3 features
            const sampleSize = Math.min(3, features.length);
            if (sampleSize > 0) {
              this.addOutput(
                `     • Sample Features (${sampleSize}):`,
                "#ffffff"
              );

              for (let i = 0; i < sampleSize; i++) {
                const feature = features[i];
                let featureInfo = `       ${i + 1}. `;

                // Add geometry type
                if (feature.geometry && feature.geometry.type) {
                  featureInfo += `${feature.geometry.type} `;
                } else {
                  featureInfo += "Unknown geometry ";
                }

                // Add id if available
                if (feature.id !== undefined) {
                  featureInfo += `(id: ${feature.id}) `;
                }

                // Show detailed properties
                if (feature.properties) {
                  featureInfo += "Properties: ";
                  const props = Object.entries(feature.properties)
                    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                    .join(", ");
                  featureInfo += props;
                }

                this.addOutput(featureInfo, "#ffffff");
              }

              // Indicate if there are more features
              if (features.length > sampleSize) {
                this.addOutput(
                  `       ...and ${features.length - sampleSize} more features`,
                  "#aaaaaa"
                );
              }
            }
          } else {
            this.addOutput(
              `     • Source data not directly accessible`,
              "#ffaa00"
            );

            // Try to get some basic info about the source
            if (source.data) {
              if (typeof source.data === "string") {
                this.addOutput(`     • Data URL: ${source.data}`, "#ffffff");
              } else {
                this.addOutput(
                  `     • Data: Embedded GeoJSON object`,
                  "#ffffff"
                );
              }
            }
          }
        } catch (error) {
          this.addOutput(
            `     • Error accessing source: ${error.message}`,
            "#ff0000"
          );
        }
      });
    } catch (error) {
      this.addOutput(
        `Error in showFullGeoJsonInfo: ${error.message}`,
        "#ff0000"
      );
      console.error("Error in showFullGeoJsonInfo:", error);
    }
  }

  /**
   * List top 10 GeoJSON objects across all layers
   */
  listGeoJsonObjects() {
    const map = window.interface.map;
    const style = map.getStyle();
    const layers = style.layers;
    const sources = style.sources;

    // Get all GeoJSON layers
    const geojsonLayers = this.getGeojsonLayers(layers, sources);

    if (geojsonLayers.length === 0) {
      this.addOutput("No GeoJSON layers found.", "#ffaa00");
      return;
    }

    let allFeatures = [];
    let loadedSources = 0;
    let totalSources = geojsonLayers.length;

    // Output processing status
    this.addOutput(`Processing ${totalSources} GeoJSON sources...`, "#00aaff");

    // Process each GeoJSON layer to extract features
    geojsonLayers.forEach((layer) => {
      const sourceId = layer.source;
      const source = sources[sourceId];

      // Skip if source doesn't exist
      if (!source) {
        loadedSources++;
        return;
      }

      try {
        // Try to get features from the source
        const sourceData = map.getSource(sourceId);

        if (sourceData && sourceData._data) {
          // If source data is available directly
          let features = [];

          if (sourceData._data.features) {
            // Standard GeoJSON FeatureCollection
            features = sourceData._data.features;
          } else if (sourceData._data.type === "Feature") {
            // Single GeoJSON Feature
            features = [sourceData._data];
          }

          // Add source info to each feature
          features.forEach((feature) => {
            if (!feature.properties) feature.properties = {};

            // Add source and layer id to properties for display
            feature._sourceId = sourceId;
            feature._layerId = layer.id;
          });

          // Add to all features array
          allFeatures = allFeatures.concat(features);
        }

        loadedSources++;
      } catch (error) {
        this.addOutput(
          `Error accessing source '${sourceId}': ${error.message}`,
          "#ff0000"
        );
        loadedSources++;
      }
    });

    // Check if all sources have been processed
    if (loadedSources === totalSources) {
      this.displayTopFeatures(allFeatures);
    }
  }

  /**
   * List top 10 GeoJSON objects for each layer
   */
  listGeoJsonObjectsByLayer() {
    const map = window.interface.map;
    const style = map.getStyle();
    const layers = style.layers;
    const sources = style.sources;

    // Get all GeoJSON layers
    const geojsonLayers = this.getGeojsonLayers(layers, sources);

    if (geojsonLayers.length === 0) {
      this.addOutput("No GeoJSON layers found.", "#ffaa00");
      return;
    }

    // Output processing status
    this.addOutput(
      `Processing ${geojsonLayers.length} GeoJSON layers...`,
      "#00aaff"
    );

    // Process each GeoJSON layer to extract features
    geojsonLayers.forEach((layer) => {
      const sourceId = layer.source;
      const source = sources[sourceId];

      // Skip if source doesn't exist
      if (!source) {
        this.addOutput(
          `Source '${sourceId}' not found for layer '${layer.id}'.`,
          "#ffaa00"
        );
        return;
      }

      try {
        // Try to get features from the source
        const sourceData = map.getSource(sourceId);

        if (sourceData && sourceData._data) {
          // If source data is available directly
          let features = [];

          if (sourceData._data.features) {
            // Standard GeoJSON FeatureCollection
            features = sourceData._data.features;
          } else if (sourceData._data.type === "Feature") {
            // Single GeoJSON Feature
            features = [sourceData._data];
          }

          // Add source info to each feature
          features.forEach((feature) => {
            if (!feature.properties) feature.properties = {};

            // Add source and layer id to properties for display
            feature._sourceId = sourceId;
            feature._layerId = layer.id;
          });

          // Display top features for this layer
          this.addOutput(
            `\nTop features in layer: ${layer.id} (source: ${sourceId})`,
            "#00aaff"
          );
          this.displayTopFeatures(features, 10, false); // Don't show source info since we're already grouped by layer
        } else {
          this.addOutput(
            `No data found in source '${sourceId}' for layer '${layer.id}'.`,
            "#ffaa00"
          );
        }
      } catch (error) {
        this.addOutput(
          `Error accessing source '${sourceId}': ${error.message}`,
          "#ff0000"
        );
      }
    });
  }

  /**
   * Display top features from a feature array
   * @param {Array} features - Array of GeoJSON features
   * @param {number} limit - Maximum number of features to display
   * @param {boolean} showSource - Whether to show source information
   */
  displayTopFeatures(features, limit = 10, showSource = true) {
    // Check if we have any features
    if (!features || features.length === 0) {
      this.addOutput("No features found.", "#ffaa00");
      return;
    }

    // Output the total number of features
    this.addOutput(`Total features: ${features.length}\n`, "#00ff00");

    // Limit to top N features
    const topFeatures = features.slice(0, limit);

    // Display each feature
    topFeatures.forEach((feature, index) => {
      let featureInfo = `${index + 1}. `;

      // Add geometry type
      if (feature.geometry && feature.geometry.type) {
        featureInfo += `${feature.geometry.type} `;
      } else {
        featureInfo += "Unknown geometry ";
      }

      // Add id if available
      if (feature.id !== undefined) {
        featureInfo += `(id: ${feature.id}) `;
      }

      // Add source info if requested
      if (showSource && feature._sourceId) {
        featureInfo += `[${feature._layerId || "unknown layer"}] `;
      }

      // Add some properties for context (limit to first 3)
      if (feature.properties) {
        const propKeys = Object.keys(feature.properties).filter(
          (k) => !k.startsWith("_")
        );
        if (propKeys.length > 0) {
          featureInfo += "- Properties: ";

          // Get up to 3 properties for display
          const displayProps = propKeys.slice(0, 3);

          displayProps.forEach((key, i) => {
            const value = feature.properties[key];
            featureInfo += `${key}: ${JSON.stringify(value)}`;
            if (i < displayProps.length - 1) featureInfo += ", ";
          });

          // Indicate if there are more properties
          if (propKeys.length > 3) {
            featureInfo += ` (+ ${propKeys.length - 3} more properties)`;
          }
        }
      }

      this.addOutput(featureInfo, "#ffffff");
    });

    // Indicate if there are more features
    if (features.length > limit) {
      this.addOutput(
        `...and ${features.length - limit} more features`,
        "#aaaaaa"
      );
    }
  }

  /**
   * Handle toggle command
   * @param {Array} args - Command arguments
   */
  handleToggleCommand(args) {
    if (args.length < 1) {
      throw new Error("Layer ID required");
    }

    const layerId = args[0];
    const mapToggle = window.interface.map;

    if (!mapToggle.getLayer(layerId)) {
      throw new Error(`Layer "${layerId}" not found`);
    }

    const visibility = mapToggle.getLayoutProperty(layerId, "visibility");
    const newVisibility = visibility === "visible" ? "none" : "visible";

    mapToggle.setLayoutProperty(layerId, "visibility", newVisibility);
    this.addOutput(
      `Layer "${layerId}" visibility set to ${newVisibility}`,
      "#00ff00"
    );
  }

  /**
   * Handle bounds command
   */
  handleBoundsCommand() {
    const bounds = window.interface.map.getBounds();
    const boundsInfo = {
      southwest: [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
      northeast: [bounds.getNorthEast().lng, bounds.getNorthEast().lat],
    };
    this.addOutput(JSON.stringify(boundsInfo, null, 2), "#00ff00");
  }

  /**
   * Handle eval command
   * @param {Array} args - Command arguments
   */
  handleEvalCommand(args) {
    if (args.length < 1) {
      throw new Error("JavaScript code required");
    }
    const code = args.join(" ");
    const result = eval(code);
    this.addOutput(JSON.stringify(result), "#00ff00");
  }

  /**
   * Handle position command
   * @param {Array} args - Command arguments
   */
  handlePositionCommand(args) {
    if (args.length >= 2) {
      const lng = parseFloat(args[0]);
      const lat = parseFloat(args[1]);
      if (isNaN(lng) || isNaN(lat)) {
        throw new Error("Invalid coordinates");
      }
      window.interface.setPosition([lng, lat]);
      this.addOutput(`Position set to [${lng}, ${lat}]`, "#00ff00");
    } else {
      this.addOutput(
        `Current position: ${JSON.stringify(window.interface.currentLocation)}`,
        "#00ff00"
      );
    }
  }

  /**
   * Handle basemap command
   * @param {Array} args - Command arguments
   */
  handleBasemapCommand(args) {
    if (args.length >= 1) {
      const mapName = args.join(" ");
      window.interface.setBasemap(mapName);
      this.addOutput(`Base map set to "${mapName}"`, "#00ff00");
    } else {
      const current = window.interface.getActiveBackgroundLayer
        ? window.interface.getActiveBackgroundLayer()
        : "Unknown (getActiveBackgroundLayer not available)";
      this.addOutput(`Current basemap: ${current}`, "#00ff00");
    }
  }

  /**
   * Handle WMS command
   * @param {Array} args - Command arguments
   */
  handleWmsCommand(args) {
    if (args.length < 1) {
      this.addOutput("Usage: wms <url> [layer] [crs]", "#ff0000");
      this.addOutput("Examples:", "#aaaaaa");
      this.addOutput(
        "  wms https://data.bev.gv.at/geoserver/BEVdataKAT/wms",
        "#aaaaaa"
      );
      this.addOutput(
        "  wms https://data.bev.gv.at/geoserver/BEVdataKAT/wms DKM_GST",
        "#aaaaaa"
      );
      this.addOutput(
        "  wms https://data.bev.gv.at/geoserver/BEVdataKAT/wms DKM_GST EPSG:31287",
        "#aaaaaa"
      );
      return;
    }

    const wmsUrl = args[0];
    const wmsLayer = args.length > 1 ? args[1] : null;
    const wmsCrs = args.length > 2 ? args[2] : null; // Default to no specified CRS

    // If a specific layer was provided, add it directly
    if (wmsLayer) {
      this.addOutput(
        `Adding WMS layer: ${wmsLayer} from ${wmsUrl}${
          wmsCrs ? ` using ${wmsCrs}` : ""
        }`,
        "#00ff00"
      );

      const wmsConfig = {
        name: wmsLayer.replace(/:/g, "_"),
        type: "wms",
        url: wmsUrl,
        layers: wmsLayer,
        format: "image/png",
        transparent: "true",
        version: "1.3.0",
      };

      // Add CRS if specified
      if (wmsCrs) {
        wmsConfig.crs = wmsCrs;
      }

      const success = window.interface.toggleWmsLayer(wmsConfig);

      if (success) {
        this.addOutput(`Successfully added WMS layer: ${wmsLayer}`, "#00ff00");
      } else {
        this.addOutput(
          `Failed to add WMS layer. Try a different CRS or check console for errors.`,
          "#ff0000"
        );
      }
    } else {
      // Otherwise, fetch and display capabilities
      this.addOutput(`Fetching WMS capabilities from: ${wmsUrl}`, "#00aaff");

      const capabilitiesUrl = `${wmsUrl}?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0`;

      fetch(capabilitiesUrl)
        .then((response) => response.text())
        .then((data) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data, "text/xml");

          // Check for exceptions
          const exceptions = xmlDoc.getElementsByTagName("ServiceException");
          if (exceptions.length > 0) {
            this.addOutput(
              `WMS Error: ${exceptions[0].textContent}`,
              "#ff0000"
            );
            return;
          }

          // Extract service info
          const service = xmlDoc.getElementsByTagName("Service")[0];
          if (service) {
            const title =
              service.getElementsByTagName("Title")[0]?.textContent ||
              "Untitled";
            this.addOutput(`WMS Service: ${title}`, "#00ff00");
          }

          // Extract layers
          const layers = xmlDoc.getElementsByTagName("Layer");

          // Filter to only get layers with Name elements (avoid parent container layers)
          const namedLayers = Array.from(layers).filter(
            (layer) => layer.getElementsByTagName("Name").length > 0
          );

          this.addOutput(`Found ${namedLayers.length} layers:`, "#00ff00");

          namedLayers.forEach((layer, i) => {
            const name = layer.getElementsByTagName("Name")[0].textContent;
            const title =
              layer.getElementsByTagName("Title")[0]?.textContent || name;

            // List CRS
            const crsElements = layer.getElementsByTagName("CRS");
            const crsList = Array.from(crsElements).map(
              (crs) => crs.textContent
            );

            // Check if layer supports common projections
            const supports3857 = crsList.includes("EPSG:3857");
            const supports31287 = crsList.includes("EPSG:31287"); // Austria Lambert

            // Format CRS list for display (limit to 3 with "and more" if needed)
            let crsDisplay = crsList.slice(0, 3).join(", ");
            if (crsList.length > 3) {
              crsDisplay += ` and ${crsList.length - 3} more`;
            }

            // Show different command examples based on supported projections
            const addDefaultCommand = `wms ${wmsUrl} ${name}`;

            this.addOutput(`${i + 1}. ${name} - ${title}`, "#00aaff");
            this.addOutput(`   Available CRS: ${crsDisplay}`, "#aaaaaa");

            // Add command examples with recommended projections
            if (supports3857) {
              this.addOutput(
                `   Add with Web Mercator: ${addDefaultCommand}`,
                "#88ff88"
              );
            } else if (supports31287) {
              this.addOutput(
                `   Add with Austria Lambert: ${addDefaultCommand} EPSG:31287`,
                "#88ff88"
              );
            } else if (crsList.length > 0) {
              this.addOutput(
                `   Add with ${crsList[0]}: ${addDefaultCommand} ${crsList[0]}`,
                "#88ff88"
              );
            }
          });
        })
        .catch((error) => {
          this.addOutput(
            `Error fetching WMS capabilities: ${error.message}`,
            "#ff0000"
          );
        });
    }
  }

  /**
   * Handle GNSS command
   * @param {Array} args - Command arguments
   */
  handleGnssCommand(args) {
    if (args.length === 0 || args[0] === "help") {
      this.addOutput(
        `
GNSS Simulator Commands:
gnss status   - Show current GNSS simulator status
gnss start    - Start the GNSS simulator
gnss stop     - Stop the GNSS simulator
gnss position <lng> <lat> - Set the simulator position
gnss speed <speed> - Set movement speed in meters/second
gnss heading <degrees> - Set movement direction (0-359 degrees)
gnss random <none|low|medium|high> - Set position randomness level
gnss stepsize <meters> - Set manual movement step size
gnss circle [radius] - Create a circular test track around map center
gnss center  - Sets the location to the map center
gnss track [enable|disable|toggle|clear] - Control track visualization
gnss track status - Show track visualization status
`,
        "#00ff00"
      );
      return;
    }

    const subCmd = args[0].toLowerCase();

    if (window.GNSSSimulator) {
      switch (subCmd) {
        case "status":
          const status = window.GNSSSimulator.getStatus();
          let statusText = `GNSS Simulator Status: ${
            status.active ? "Active" : "Inactive"
          }\n`;

          if (status.currentPosition) {
            statusText += `Position: [${status.currentPosition[0].toFixed(
              6
            )}, ${status.currentPosition[1].toFixed(6)}]\n`;
          }

          statusText += `Speed: ${status.speed} m/s\n`;
          statusText += `Heading: ${
            status.heading
          }° (${window.GNSSSimulator.getHeadingDescription()})\n`;
          statusText += `Randomness: ${status.randomness}\n`;
          statusText += `Update interval: ${status.updateInterval}ms\n`;

          if (status.historyLength > 0) {
            statusText += `Position history: ${status.historyLength} points`;
          }

          this.addOutput(statusText, "#00ff00");
          break;

        case "start":
          // First set speed to 0.2
          const startSpeedResult = window.GNSSSimulator.setSpeed("0.2");
          this.addOutput(startSpeedResult, "#00ff00");
          
          // Then center the GNSS position to map center
          const startCenterResult = window.GNSSSimulator.setToMapCenter(window.interface.map);
          this.addOutput(startCenterResult, "#00ff00");
          
          // Finally start the simulator
          const startResult = window.GNSSSimulator.start(window.interface.map);
          this.addOutput(startResult, "#00ff00");
          break;

        case "stop":
          const stopResult = window.GNSSSimulator.stop();
          this.addOutput(stopResult, "#00ff00");
          break;

        case "position":
          if (args.length < 3) {
            this.addOutput(
              "Usage: gnss position <longitude> <latitude>",
              "#ff0000"
            );
            break;
          }

          const lng = parseFloat(args[1]);
          const lat = parseFloat(args[2]);

          if (isNaN(lng) || isNaN(lat)) {
            this.addOutput("Invalid coordinates. Must be numbers.", "#ff0000");
            break;
          }

          const posResult = window.GNSSSimulator.setPosition(
            lng,
            lat,
            window.interface.map
          );
          this.addOutput(posResult, "#00ff00");
          break;

        case "speed":
          if (args.length < 2) {
            this.addOutput(
              "Usage: gnss speed <speed_in_meters_per_second>",
              "#ff0000"
            );
            break;
          }

          const speedResult = window.GNSSSimulator.setSpeed(args[1]);
          this.addOutput(speedResult, "#00ff00");
          break;

        case "heading":
          if (args.length < 2) {
            this.addOutput("Usage: gnss heading <degrees>", "#ff0000");
            break;
          }

          const headingResult = window.GNSSSimulator.setHeading(args[1]);
          this.addOutput(headingResult, "#00ff00");
          break;

        case "random":
        case "randomness":
          if (args.length < 2) {
            this.addOutput(
              "Usage: gnss random <none|low|medium|high>",
              "#ff0000"
            );
            break;
          }

          const randomResult = window.GNSSSimulator.setRandomness(args[1]);
          this.addOutput(randomResult, "#00ff00");
          break;

        case "circle":
          try {
            // Get the current map center
            const center = window.interface.map.getCenter();
            // Default radius is 200 meters, or use provided argument
            const radius = args.length > 1 ? parseFloat(args[1]) : 200;

            if (isNaN(radius)) {
              this.addOutput("Invalid radius. Must be a number.", "#ff0000");
              break;
            }

            // Generate a circular track
            const track = this.generateCircleTrack(
              center.lng,
              center.lat,
              radius
            );

            // Set the simulator to the first point
            window.GNSSSimulator.setPosition(
              track[0][0],
              track[0][1],
              window.interface.map
            );

            // Set the track
            window.GNSSSimulator.track = track;
            window.GNSSSimulator.trackIndex = 0;

            this.addOutput(
              `Created circular track with ${track.length} points and radius ${radius}m`,
              "#00ff00"
            );
          } catch (e) {
            this.addOutput(
              `Error creating circle track: ${e.message}`,
              "#ff0000"
            );
          }
          break;

        case "center":
          if (window.GNSSSimulator) {
            const centerResult = window.GNSSSimulator.setToMapCenter(
              window.interface.map
            );
            this.addOutput(centerResult, "#00ff00");
          } else {
            this.addOutput("GNSS Simulator not initialized", "#ff0000");
          }
          break;

        case "track":
          if (args.length < 2) {
            // Default to toggle if no subcommand provided
            const trackResult = window.GNSSSimulator.toggleTrack(window.interface.map);
            this.addOutput(trackResult, "#00ff00");
            break;
          }

          const trackCmd = args[1].toLowerCase();
          switch (trackCmd) {
            case "enable":
            case "on":
              const enableResult = window.GNSSSimulator.enableTrack(window.interface.map);
              this.addOutput(enableResult, "#00ff00");
              break;

            case "disable":
            case "off":
              const disableResult = window.GNSSSimulator.disableTrack(window.interface.map);
              this.addOutput(disableResult, "#00ff00");
              break;

            case "toggle":
              const toggleResult = window.GNSSSimulator.toggleTrack(window.interface.map);
              this.addOutput(toggleResult, "#00ff00");
              break;

            case "clear":
              const clearResult = window.GNSSSimulator.clearTrack(window.interface.map);
              this.addOutput(clearResult, "#00ff00");
              break;

            case "status":
              const status = window.GNSSSimulator.getStatus();
              this.addOutput(
                `Track visualization: ${status.showTrack ? "Enabled" : "Disabled"}\n` +
                `Track points: ${status.historyLength}`,
                status.showTrack ? "#00ff00" : "#aaaaaa"
              );
              break;

            default:
              this.addOutput(
                `Unknown track command: ${trackCmd}. Use 'enable', 'disable', 'toggle', 'clear', or 'status'`,
                "#ff0000"
              );
          }
          break;

        case "stepsize":
          if (args.length < 2) {
            this.addOutput("Usage: gnss stepsize <size_in_meters>", "#ff0000");
            break;
          }

          const sizeValue = parseFloat(args[1]);
          if (isNaN(sizeValue) || sizeValue <= 0) {
            this.addOutput(
              "Invalid step size. Must be a positive number.",
              "#ff0000"
            );
            break;
          }

          const stepResult = window.GNSSSimulator.setStepSize(sizeValue);
          this.addOutput(stepResult, "#00ff00");
          break;

        default:
          this.addOutput(
            `Unknown GNSS command: ${subCmd}. Use 'gnss help' for available commands.`,
            "#ff0000"
          );
      }
    } else {
      this.addOutput(
        "GNSS Simulator not initialized. Try refreshing the page or check the console for errors.",
        "#ff0000"
      );
    }
  }

  /**
   * Handle besitzer command (hidden command for automatic neighbor selection)
   * @param {Array} args - Command arguments
   */
  handleBesitzerCommand(args) {
    if (args.length === 0) {
      // Toggle mode when no arguments provided
      const newState = App.Map.Events.toggleBesitzerMode();
      this.addOutput(
        `Besitzer mode ${newState ? "enabled" : "disabled"}`,
        newState ? "#00ff00" : "#ffaa00"
      );
      if (newState) {
        this.addOutput("Automatic neighbor selection is now active when clicking parcels", "#aaaaaa");
      }
      return;
    }

    const subCmd = args[0].toLowerCase();

    switch (subCmd) {
      case "enable":
      case "on":
        App.Map.Events.enableBesitzerMode();
        this.addOutput("Besitzer mode enabled", "#00ff00");
        this.addOutput("Automatic neighbor selection is now active when clicking parcels", "#aaaaaa");
        break;

      case "disable":
      case "off":
        App.Map.Events.disableBesitzerMode();
        this.addOutput("Besitzer mode disabled", "#ffaa00");
        break;

      case "status":
        const isEnabled = App.Map.Events.isBesitzerModeEnabled();
        this.addOutput(
          `Besitzer mode is currently ${isEnabled ? "enabled" : "disabled"}`,
          isEnabled ? "#00ff00" : "#aaaaaa"
        );
        break;

      default:
        this.addOutput(
          `Unknown besitzer command: ${subCmd}. Use 'enable', 'disable', or 'status'`,
          "#ff0000"
        );
    }
  }

  /**
   * Generate a circular track for GNSS simulator
   * @param {number} centerLng - Center longitude
   * @param {number} centerLat - Center latitude
   * @param {number} radiusMeters - Radius in meters
   * @param {number} numPoints - Number of points
   * @returns {Array} Array of [lng, lat] coordinates
   */
  generateCircleTrack(centerLng, centerLat, radiusMeters, numPoints = 36) {
    const points = [];
    const earthRadius = 6371000; // Earth radius in meters

    // Convert radius from meters to degrees (approximate)
    const radiusLat = (radiusMeters / earthRadius) * (180 / Math.PI);
    const radiusLng = radiusLat / Math.cos((centerLat * Math.PI) / 180);

    // Generate points around the circle
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const lat = centerLat + radiusLat * Math.cos(angle);
      const lng = centerLng + radiusLng * Math.sin(angle);
      points.push([lng, lat]);
    }

    // Close the circle
    points.push(points[0]);

    return points;
  }

  /**
   * Handle debug command
   * @param {Array} args - Command arguments
   */
  handleDebugCommand(args) {
    if (args.length < 1) {
      this.addOutput("Usage: debug [command]", "#ff0000");
      this.addOutput("Available debug commands:", "#aaaaaa");
      this.addOutput(
        "  debug status    : Show current debug status",
        "#aaaaaa"
      );
      this.addOutput(
        "  debug enable    : Enable all debug features",
        "#aaaaaa"
      );
      this.addOutput(
        "  debug disable   : Disable all debug features",
        "#aaaaaa"
      );
      this.addOutput("  debug panel     : Show visual debug panel", "#aaaaaa");
      this.addOutput(
        "  debug test      : Test status update functions",
        "#aaaaaa"
      );
      this.addOutput(
        "  debug logupdates: Log all status updates to console",
        "#aaaaaa"
      );
      this.addOutput("  debug dom       : Test DOM status elements", "#aaaaaa");
      this.addOutput("  debug screen    : Show screen info and element positions", "#aaaaaa");
      return;
    }

    const debugCmd = args[0].toLowerCase();

    switch (debugCmd) {
      case "status":
        this.addOutput("Debug Status:", "#00ff00");
        this.addOutput(
          `  Active: ${this.debugStatus.active}`,
          this.debugStatus.active ? "#00ff00" : "#aaaaaa"
        );
        this.addOutput(
          `  Console Redirected: ${this.debugStatus.consoleRedirected}`,
          this.debugStatus.consoleRedirected ? "#00ff00" : "#aaaaaa"
        );
        this.addOutput(
          `  Bridge Debug Panel: ${this.debugStatus.bridgeDebugPanel}`,
          this.debugStatus.bridgeDebugPanel ? "#00ff00" : "#aaaaaa"
        );
        this.addOutput(
          `  Status Updates Logged: ${this.debugStatus.statusUpdatesLogged}`,
          this.debugStatus.statusUpdatesLogged ? "#00ff00" : "#aaaaaa"
        );

        // Check for update functions
        if (window.updateStatusBar) {
          this.addOutput("  window.updateStatusBar: Available", "#00ff00");
        } else {
          this.addOutput("  window.updateStatusBar: Not available", "#ff0000");
        }

        if (
          window.statusFooterBridge &&
          window.statusFooterBridge.updateAllStatus
        ) {
          this.addOutput(
            "  statusFooterBridge.updateAllStatus: Available",
            "#00ff00"
          );
        } else {
          this.addOutput(
            "  statusFooterBridge.updateAllStatus: Not available",
            "#ff0000"
          );
        }

        if (window.verySimpleUpdate) {
          this.addOutput("  window.verySimpleUpdate: Available", "#00ff00");
        } else {
          this.addOutput("  window.verySimpleUpdate: Not available", "#aaaaaa");
        }

        // Check if GNSS simulator is available
        if (window.GNSSSimulator) {
          this.addOutput("  GNSS Simulator: Available", "#00ff00");
          if (window.GNSSSimulator.active) {
            this.addOutput("  GNSS Simulator Status: Active", "#00ff00");
          } else {
            this.addOutput("  GNSS Simulator Status: Inactive", "#aaaaaa");
          }
        } else {
          this.addOutput("  GNSS Simulator: Not available", "#ff0000");
        }
        break;

      case "enable":
        this.debugStatus.active = true;
        this.createBridgeDebugPanel();
        this.redirectConsoleToBridgeDebug();
        this.createTestUpdateFunction();
        this.enableStatusUpdateLogging();
        this.addOutput("All debug features enabled", "#00ff00");
        break;

      case "disable":
        // Hide debug panel if it exists
        const panel = document.getElementById("bridge-debug-panel");
        if (panel) {
          panel.style.display = "none";
        }

        // We can't easily unreplace console functions, but we can note they're not active
        this.debugStatus.active = false;
        this.debugStatus.bridgeDebugPanel = false;
        this.addOutput("Debug features disabled", "#00ff00");
        break;

      case "panel":
        this.createBridgeDebugPanel();
        break;

      case "test":
        if (
          window.statusFooterBridge &&
          typeof window.statusFooterBridge.updateAllStatus === "function"
        ) {
          const testData = {
            statusBar: {
              deviceName: "Console Test",
              tiltStatus: "Active",
              fixTime: "12:34:56",
              rtkStatus: "FIX",
              accuracy: "±0.5cm",
              accuracyClass: "high",
            },
          };

          this.addOutput(
            "Sending test update via statusFooterBridge.updateAllStatus",
            "#00ff00"
          );
          try {
            window.statusFooterBridge.updateAllStatus(testData);
            this.addOutput("Test update sent successfully", "#00ff00");
          } catch (err) {
            this.addOutput(
              `Error sending test update: ${err.message}`,
              "#ff0000"
            );
          }
        } else if (window.updateStatusBar) {
          this.addOutput("Sending test update via updateStatusBar", "#00ff00");
          try {
            window.updateStatusBar(
              "Console Test",
              "Active",
              "12:34:56",
              "FIX",
              "0.5",
              "high"
            );
            this.addOutput("Test update sent successfully", "#00ff00");
          } catch (err) {
            this.addOutput(
              `Error sending test update: ${err.message}`,
              "#ff0000"
            );
          }
        } else {
          this.addOutput("ERROR: No status update function found", "#ff0000");
          this.createTestUpdateFunction();
          this.addOutput(
            "Created simple test function, trying it now...",
            "#ffaa00"
          );
          try {
            window.verySimpleUpdate("Simple Test from Console");
            this.addOutput("Simple test function executed", "#00ff00");
          } catch (err) {
            this.addOutput(
              `Error using simple test function: ${err.message}`,
              "#ff0000"
            );
          }
        }
        break;

      case "logupdates":
        this.enableStatusUpdateLogging();
        break;

      case "dom":
        this.testDomStatusElements();
        break;

      case "screen":
        this.debugScreenAndElements();
        break;

      default:
        this.addOutput(`Unknown debug command: ${debugCmd}`, "#ff0000");
        this.addOutput("Available debug commands:", "#aaaaaa");
        this.addOutput(
          "  debug status    : Show current debug status",
          "#aaaaaa"
        );
        this.addOutput(
          "  debug enable    : Enable all debug features",
          "#aaaaaa"
        );
        this.addOutput(
          "  debug disable   : Disable all debug features",
          "#aaaaaa"
        );
        this.addOutput(
          "  debug panel     : Show visual debug panel",
          "#aaaaaa"
        );
        this.addOutput(
          "  debug test      : Test status update functions",
          "#aaaaaa"
        );
        this.addOutput(
          "  debug screen    : Show screen info and element positions",
          "#aaaaaa"
        );
        this.addOutput(
          "  debug logupdates: Log all status updates to console",
          "#aaaaaa"
        );
        this.addOutput(
          "  debug dom       : Test DOM status elements",
          "#aaaaaa"
        );
    }
  }

  // Debug helper methods (from the original command line interface)

  /**
   * Create bridge debug panel
   * @returns {HTMLElement} Log container
   */
  createBridgeDebugPanel() {
    if (!this.debugStatus.bridgeDebugPanel) {
      const logContainer = this.createDebugPanel();
      this.debugStatus.bridgeDebugPanel = true;
      this.addOutput("Bridge debug panel created", "#00ff00");
      return logContainer;
    } else {
      const panel = document.getElementById("bridge-debug-panel");
      if (panel) {
        panel.style.display = "block";
      }
      this.addOutput(
        "Bridge debug panel already exists - made visible",
        "#00ff00"
      );
      return document.getElementById("bridge-debug-log");
    }
  }

  /**
   * Create debug panel
   * @returns {HTMLElement} Log container
   */
  createDebugPanel() {
    const debugPanel = document.createElement("div");
    debugPanel.id = "bridge-debug-panel";
    debugPanel.style.position = "fixed";
    debugPanel.style.bottom = "100px";
    debugPanel.style.right = "20px";
    debugPanel.style.width = "300px";
    debugPanel.style.maxHeight = "200px";
    debugPanel.style.overflowY = "auto";
    debugPanel.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    debugPanel.style.color = "white";
    debugPanel.style.padding = "10px";
    debugPanel.style.borderRadius = "5px";
    debugPanel.style.fontFamily = "monospace";
    debugPanel.style.fontSize = "12px";
    debugPanel.style.zIndex = "9999";

    // Add a title
    const title = document.createElement("div");
    title.textContent = "Bridge Debug Console";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "5px";
    title.style.borderBottom = "1px solid #555";
    title.style.paddingBottom = "3px";
    debugPanel.appendChild(title);

    // Add a close button
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "X";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "5px";
    closeBtn.style.right = "5px";
    closeBtn.style.backgroundColor = "#d33";
    closeBtn.style.border = "none";
    closeBtn.style.color = "white";
    closeBtn.style.borderRadius = "3px";
    closeBtn.style.cursor = "pointer";
    closeBtn.onclick = function () {
      debugPanel.style.display = "none";
    };
    debugPanel.appendChild(closeBtn);

    // Add a log container
    const logContainer = document.createElement("div");
    logContainer.id = "bridge-debug-log";
    debugPanel.appendChild(logContainer);

    // Add test buttons
    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.marginTop = "10px";

    const testBtn = document.createElement("button");
    testBtn.textContent = "Test Status Update";
    testBtn.style.backgroundColor = "#28a745";
    testBtn.style.color = "white";
    testBtn.style.border = "none";
    testBtn.style.borderRadius = "3px";
    testBtn.style.marginRight = "5px";
    testBtn.style.padding = "5px";
    testBtn.onclick = function () {
      if (typeof window.updateStatusBar === "function") {
        window.updateStatusBar(
          "Test Device",
          "Active",
          "12:34:56",
          "FIX",
          "0.5",
          "high"
        );
        logDebugMessage("Called updateStatusBar");
      } else if (
        window.statusFooterBridge &&
        typeof window.statusFooterBridge.updateAllStatus === "function"
      ) {
        const testData = {
          statusBar: {
            deviceName: "Test Device",
            tiltStatus: "Active",
            fixTime: "12:34:56",
            rtkStatus: "FIX",
            accuracy: "±0.5cm",
            accuracyClass: "high",
          },
        };
        window.statusFooterBridge.updateAllStatus(testData);
        logDebugMessage("Called statusFooterBridge.updateAllStatus");
      } else {
        logDebugMessage("ERROR: No status update function found", true);
      }
    };
    buttonsContainer.appendChild(testBtn);

    const testCoordinatesBtn = document.createElement("button");
    testCoordinatesBtn.textContent = "Test Coordinates";
    testCoordinatesBtn.style.backgroundColor = "#007bff";
    testCoordinatesBtn.style.color = "white";
    testCoordinatesBtn.style.border = "none";
    testCoordinatesBtn.style.borderRadius = "3px";
    testCoordinatesBtn.style.padding = "5px";
    testCoordinatesBtn.style.marginRight = "5px";
    testCoordinatesBtn.onclick = function () {
      if (
        window.statusFooterBridge &&
        typeof window.statusFooterBridge.updateAllStatus === "function"
      ) {
        const testData = {
          coordinates: {
            longitude: "14.2229296°",
            latitude: "46.6263287°",
            altitude: "524.80 m",
            x: "551234.23",
            y: "4179456.78",
            z: "18.30",
          },
        };
        window.statusFooterBridge.updateAllStatus(testData);
        logDebugMessage(
          "Called statusFooterBridge.updateAllStatus with coordinates"
        );
      } else {
        logDebugMessage("ERROR: No status update function found", true);
      }
    };
    buttonsContainer.appendChild(testCoordinatesBtn);

    const testGnssBtn = document.createElement("button");
    testGnssBtn.textContent = "Test GNSS Info";
    testGnssBtn.style.backgroundColor = "#ffc107";
    testGnssBtn.style.color = "black";
    testGnssBtn.style.border = "none";
    testGnssBtn.style.borderRadius = "3px";
    testGnssBtn.style.padding = "5px";
    testGnssBtn.onclick = function () {
      if (
        window.statusFooterBridge &&
        typeof window.statusFooterBridge.updateAllStatus === "function"
      ) {
        const testData = {
          gnssInfo: {
            vrmsHrms: "0.008 [m] / 0.012 [m]",
            vdopPdop: "1.1 / 1.3",
            ntripStatus: "Connected",
            rtcmStatus: "Receiving",
            satelliteCount: "15/22",
            speed: "0.2 m/s",
          },
        };
        window.statusFooterBridge.updateAllStatus(testData);
        logDebugMessage(
          "Called statusFooterBridge.updateAllStatus with GNSS info"
        );
      } else {
        logDebugMessage("ERROR: No status update function found", true);
      }
    };
    buttonsContainer.appendChild(testGnssBtn);

    debugPanel.appendChild(buttonsContainer);

    document.body.appendChild(debugPanel);

    // Helper function to log a message to the debug panel
    function logDebugMessage(message, isError = false) {
      const logContainer = document.getElementById("bridge-debug-log");
      if (!logContainer) return;

      const logEntry = document.createElement("div");
      logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;

      if (isError) {
        logEntry.style.color = "#ff6b6b";
      }

      logContainer.appendChild(logEntry);
      logContainer.scrollTop = logContainer.scrollHeight;
    }

    // Return the log container for future reference
    return logContainer;
  }

  /**
   * Redirect console logs to debug panel
   */
  redirectConsoleToBridgeDebug() {
    if (this.debugStatus.consoleRedirected) {
      this.addOutput("Console already redirected to debug panel", "#ffaa00");
      return;
    }

    // Override the console.log
    const originalConsoleLog = console.log;
    console.log = function () {
      originalConsoleLog.apply(console, arguments);

      // Check if this is a bridge-related log
      const logString = Array.from(arguments).join(" ");
      if (
        logString.includes("status") ||
        logString.includes("bridge") ||
        logString.includes("update") ||
        logString.includes("Android")
      ) {
        logDebugMessage(logString);
      }
    };

    // Override console.error too
    const originalConsoleError = console.error;
    console.error = function () {
      originalConsoleError.apply(console, arguments);

      // Log all errors to our debug panel
      const errorString = Array.from(arguments).join(" ");
      logDebugMessage(errorString, true);
    };

    this.debugStatus.consoleRedirected = true;
    this.addOutput("Console logs now redirected to debug panel", "#00ff00");

    // Helper function to log a message to the debug panel
    function logDebugMessage(message, isError = false) {
      const logContainer = document.getElementById("bridge-debug-log");
      if (!logContainer) return;

      const logEntry = document.createElement("div");
      logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;

      if (isError) {
        logEntry.style.color = "#ff6b6b";
      }

      logContainer.appendChild(logEntry);
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }

  /**
   * Create a simple test function
   */
  createTestUpdateFunction() {
    if (!window.verySimpleUpdate) {
      window.verySimpleUpdate = function (text) {
        // Log the call
        console.log("Very simple update called with:", text);

        // Create a visual indicator that the function was called
        document.body.style.border = "5px solid blue";
        setTimeout(() => (document.body.style.border = ""), 1000);

        // Try to find the device name element
        const deviceNameElem = document.querySelector(".device-name");

        if (deviceNameElem) {
          console.log("Found device-name element:", deviceNameElem);
          // Try to update it
          deviceNameElem.textContent = text;
          console.log("Updated device-name to:", text);
          return "SUCCESS: Updated device-name";
        } else {
          console.log("ERROR: Could not find device-name element");

          // DEBUG: Log all elements with class names in the document
          const allElements = document.querySelectorAll("*[class]");
          console.log("All elements with classes:", allElements.length);
          allElements.forEach((el) => {
            console.log(`Element: ${el.tagName}, Classes: ${el.className}`);
          });

          return "ERROR: Element not found";
        }
      };

      this.addOutput(
        "Simple update test function created: window.verySimpleUpdate",
        "#00ff00"
      );
    } else {
      this.addOutput("Simple update test function already exists", "#ffaa00");
    }
  }

  /**
   * Enable status update logging
   */
  enableStatusUpdateLogging() {
    if (this.debugStatus.statusUpdatesLogged) {
      this.addOutput("Status updates already being logged", "#ffaa00");
      return;
    }

    if (
      window.statusFooterBridge &&
      typeof window.statusFooterBridge.updateAllStatus === "function"
    ) {
      // Save the original function
      const originalUpdateAllStatus = window.statusFooterBridge.updateAllStatus;

      // Override with logging version
      window.statusFooterBridge.updateAllStatus = function (statusData) {
        console.log(
          "STATUS UPDATE RECEIVED:",
          JSON.stringify(statusData, null, 2)
        );

        // Call the original function
        return originalUpdateAllStatus.call(this, statusData);
      };

      this.debugStatus.statusUpdatesLogged = true;
      this.addOutput("Status updates will now be logged to console", "#00ff00");
    } else {
      this.addOutput(
        "ERROR: statusFooterBridge.updateAllStatus not found",
        "#ff0000"
      );
    }
  }

  /**
   * Test DOM status elements
   */
  testDomStatusElements() {
    this.addOutput("Testing DOM status elements...", "#00aaff");

    const elements = {
      deviceName: document.querySelector(".device-name"),
      fixTime: document.querySelector(".fix-time"),
      rtkStatus: document.querySelector(".rtk-status"),
      accuracy: document.querySelector(".accuracy"),
      longitudeValue: document.querySelector(".coord-value.longitude"),
      latitudeValue: document.querySelector(".coord-value.latitude"),
      altitudeValue: document.querySelector(".coord-value[2]"),
      tiltInfo: document.querySelector(".tilt-info span"),
      batteryBar: document.querySelector(".battery-bar"),
    };

    let report = "Status Elements Test Results:\n";

    for (const [name, elem] of Object.entries(elements)) {
      if (elem) {
        report += `✅ ${name}: Found (${
          elem.tagName
        }) with text "${elem.textContent.trim()}"\n`;
      } else {
        report += `❌ ${name}: Element not found\n`;
      }
    }

    this.addOutput(report, "#00ff00");
  }

  /**
   * Debug screen information and element positions
   */
  debugScreenAndElements() {
    this.addOutput("=== Screen & Element Debug Info ===", "#00aaff");
    
    // Screen information
    this.addOutput("Screen Information:", "#00ff00");
    this.addOutput(`  Window Size: ${window.innerWidth} x ${window.innerHeight}px`, "#ffffff");
    this.addOutput(`  Screen Size: ${screen.width} x ${screen.height}px`, "#ffffff");
    this.addOutput(`  Available Screen: ${screen.availWidth} x ${screen.availHeight}px`, "#ffffff");
    this.addOutput(`  Device Pixel Ratio (DPR): ${window.devicePixelRatio}`, "#ffffff");
    this.addOutput(`  Actual Resolution: ${Math.round(window.innerWidth * window.devicePixelRatio)} x ${Math.round(window.innerHeight * window.devicePixelRatio)}px`, "#ffffff");
    this.addOutput(`  Screen Orientation: ${screen.orientation ? screen.orientation.type : 'N/A'}`, "#ffffff");
    
    // Viewport information
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      this.addOutput(`  Viewport Meta: ${viewport.content}`, "#ffffff");
    }
    
    this.addOutput("", ""); // Empty line
    
    // Sidebar toggle positions
    this.addOutput("Sidebar Toggle Positions:", "#00ff00");
    const leftToggles = document.querySelectorAll('.sidebar-toggle-group .sidebar-toggle');
    const rightToggles = document.querySelectorAll('.sidebar-toggle-group-right .sidebar-toggle');
    
    leftToggles.forEach((toggle, index) => {
      const rect = toggle.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(toggle);
      this.addOutput(`  Left Toggle ${index + 1}:`, "#ffaa00");
      this.addOutput(`    Position: ${Math.round(rect.left)}, ${Math.round(rect.top)}`, "#ffffff");
      this.addOutput(`    Size: ${Math.round(rect.width)} x ${Math.round(rect.height)}px`, "#ffffff");
      this.addOutput(`    Display: ${computedStyle.display}`, "#ffffff");
      this.addOutput(`    Visibility: ${computedStyle.visibility}`, "#ffffff");
    });
    
    rightToggles.forEach((toggle, index) => {
      const rect = toggle.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(toggle);
      this.addOutput(`  Right Toggle ${index + 1}:`, "#ffaa00");
      this.addOutput(`    Position: ${Math.round(rect.left)}, ${Math.round(rect.top)}`, "#ffffff");
      this.addOutput(`    Size: ${Math.round(rect.width)} x ${Math.round(rect.height)}px`, "#ffffff");
      this.addOutput(`    Display: ${computedStyle.display}`, "#ffffff");
      this.addOutput(`    Visibility: ${computedStyle.visibility}`, "#ffffff");
    });
    
    this.addOutput("", ""); // Empty line
    
    // Map control positions
    this.addOutput("Map Control Positions:", "#00ff00");
    const mapControls = [
      { selector: '.maplibregl-ctrl-logo', name: 'Logo' },
      { selector: '.maplibregl-ctrl-zoom', name: 'Zoom' },
      { selector: '.maplibregl-ctrl-compass', name: 'Navigation' },
      { selector: '.maplibregl-ctrl-scale', name: 'Scale' },
      { selector: '.maplibregl-ctrl-fullscreen', name: 'Fullscreen' },
      { selector: '.maplibregl-ctrl-terrain', name: 'Terrain' },
      { selector: '.feature-toggle-control', name: 'Feature Toggle' },
      { selector: '.dynamic-button-control', name: 'Dynamic Button' }
    ];
    
    mapControls.forEach(control => {
      const elem = document.querySelector(control.selector);
      if (elem) {
        const rect = elem.getBoundingClientRect();
        const parent = elem.closest('.maplibregl-ctrl-top-left, .maplibregl-ctrl-top-right, .maplibregl-ctrl-bottom-left, .maplibregl-ctrl-bottom-right');
        const position = parent ? parent.className.replace('maplibregl-ctrl-', '') : 'unknown';
        this.addOutput(`  ${control.name} Control:`, "#ffaa00");
        this.addOutput(`    Position: ${Math.round(rect.left)}, ${Math.round(rect.top)}`, "#ffffff");
        this.addOutput(`    Size: ${Math.round(rect.width)} x ${Math.round(rect.height)}px`, "#ffffff");
        this.addOutput(`    Corner: ${position}`, "#ffffff");
      } else {
        this.addOutput(`  ${control.name} Control: Not found`, "#ff0000");
      }
    });
    
    this.addOutput("", ""); // Empty line
    
    // Check for overlaps
    this.addOutput("Checking for element overlaps...", "#00ff00");
    this.checkElementOverlaps();
    
    // Footer visibility
    const footer = document.querySelector('status-footer');
    if (footer) {
      const rect = footer.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(footer);
      this.addOutput("Status Footer:", "#00ff00");
      this.addOutput(`  Position: ${Math.round(rect.left)}, ${Math.round(rect.top)}`, "#ffffff");
      this.addOutput(`  Size: ${Math.round(rect.width)} x ${Math.round(rect.height)}px`, "#ffffff");
      this.addOutput(`  Display: ${computedStyle.display}`, "#ffffff");
      this.addOutput(`  Visibility: ${computedStyle.visibility}`, "#ffffff");
    }
  }
  
  /**
   * Check for overlapping elements
   */
  checkElementOverlaps() {
    const elements = [];
    
    // Collect all sidebar toggles with better identification
    document.querySelectorAll('.sidebar-toggle-group .sidebar-toggle').forEach((elem, index) => {
      const rect = elem.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) { // Only include visible elements
        elements.push({ elem, name: `Left Sidebar Toggle ${index + 1}`, type: 'toggle' });
      }
    });
    
    document.querySelectorAll('.sidebar-toggle-group-right .sidebar-toggle').forEach((elem, index) => {
      const rect = elem.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) { // Only include visible elements
        elements.push({ elem, name: `Right Sidebar Toggle ${index + 1}`, type: 'toggle' });
      }
    });
    
    // Collect all map control containers (not individual controls within them)
    const controlCorners = [
      '.maplibregl-ctrl-top-left',
      '.maplibregl-ctrl-top-right', 
      '.maplibregl-ctrl-bottom-left',
      '.maplibregl-ctrl-bottom-right'
    ];
    
    controlCorners.forEach(cornerSelector => {
      const corner = document.querySelector(cornerSelector);
      if (corner) {
        const rect = corner.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) { // Only include visible elements
          const cornerName = cornerSelector.replace('.maplibregl-ctrl-', '').replace('-', ' ');
          elements.push({ elem: corner, name: `Map Controls (${cornerName})`, type: 'control-group' });
        }
      }
    });
    
    // Also check individual controls that might be outside control groups
    document.querySelectorAll('.maplibregl-control').forEach(elem => {
      const rect = elem.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) { // Only include visible elements
        const name = elem.className.split(' ').find(c => c.includes('maplibregl-ctrl-')) || 'Map Control';
        elements.push({ elem, name: name.replace('maplibregl-ctrl-', ''), type: 'control' });
      }
    });
    
    // Check for overlaps
    let overlapsFound = false;
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const rect1 = elements[i].elem.getBoundingClientRect();
        const rect2 = elements[j].elem.getBoundingClientRect();
        
        // Skip if both are the same type and likely part of the same group
        if (elements[i].type === elements[j].type && elements[i].type === 'control') {
          continue;
        }
        
        // Check if rectangles overlap
        if (rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top) {
          
          overlapsFound = true;
          this.addOutput(`  ⚠️ Overlap detected: ${elements[i].name} <-> ${elements[j].name}`, "#ff0000");
          
          // Add more details about the overlap
          const overlapLeft = Math.max(rect1.left, rect2.left);
          const overlapRight = Math.min(rect1.right, rect2.right);
          const overlapTop = Math.max(rect1.top, rect2.top);
          const overlapBottom = Math.min(rect1.bottom, rect2.bottom);
          const overlapWidth = overlapRight - overlapLeft;
          const overlapHeight = overlapBottom - overlapTop;
          
          this.addOutput(`     Overlap area: ${Math.round(overlapWidth)} x ${Math.round(overlapHeight)}px`, "#ffaa00");
        }
      }
    }
    
    // Additional check for elements that are very close (within 5px)
    this.addOutput("", ""); // Empty line
    this.addOutput("Checking for near-collisions (within 5px)...", "#00ff00");
    let nearCollisionsFound = false;
    
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const rect1 = elements[i].elem.getBoundingClientRect();
        const rect2 = elements[j].elem.getBoundingClientRect();
        
        // Skip if both are the same type
        if (elements[i].type === elements[j].type && elements[i].type === 'control') {
          continue;
        }
        
        // Calculate minimum distance between rectangles
        const xDist = Math.max(0, Math.max(rect1.left, rect2.left) - Math.min(rect1.right, rect2.right));
        const yDist = Math.max(0, Math.max(rect1.top, rect2.top) - Math.min(rect1.bottom, rect2.bottom));
        const minDist = Math.sqrt(xDist * xDist + yDist * yDist);
        
        if (minDist > 0 && minDist <= 5) {
          nearCollisionsFound = true;
          this.addOutput(`  ⚠️ Near collision: ${elements[i].name} <-> ${elements[j].name} (${Math.round(minDist)}px apart)`, "#ffaa00");
        }
      }
    }
    
    if (!overlapsFound && !nearCollisionsFound) {
      this.addOutput("  ✅ No overlapping or near-collision elements detected", "#00ff00");
    }
  }
}

/**
 * Add a button to show the command line
 */
function addConsoleButton() {
  // Check if button already exists
  if (document.getElementById("console-button")) {
    return;
  }

  // Check if the tools panel button exists - if so, we don't need the floating button
  if (document.getElementById("command-line-tool-button")) {
    return;
  }

  const button = document.createElement("button");
  button.id = "console-button";
  button.textContent = "Console";
  button.style.position = "fixed";
  button.style.top = "40px";
  button.style.right = "220px";
  button.style.zIndex = "999";
  button.style.padding = "5px 10px";
  button.style.backgroundColor = "#FFFFF0";
  button.style.color = "black";
  button.style.border = "none";
  button.style.borderRadius = "4px";
  button.style.cursor = "pointer";

  button.addEventListener("click", () => {
    if (window.mapConsole) {
      // Toggle visibility
      const cliContainer = document.getElementById("cli-container");
      if (
        cliContainer &&
        window.getComputedStyle(cliContainer).display !== "none"
      ) {
        window.mapConsole.hide();
      } else {
        window.mapConsole.show();
      }
    } else {
      initEnhancedCommandLine();
    }
  });

  document.body.appendChild(button);
}

/**
 * Initialize the enhanced command line
 */
/**
 * Initialize the enhanced command line
 */
/**
 * Initialize the enhanced command line - Modified to ensure proper initialization
 */
function initEnhancedCommandLine() {
  console.log("Initializing enhanced command line...");

  // Check if already initialized
  if (window.mapConsole) {
    console.log("Command line already initialized, showing it instead");
    window.mapConsole.show();
    return window.mapConsole;
  }

  const commandLine = new EnhancedCommandLine();
  const mapConsole = commandLine.initialize();

  console.log("Command line initialized:", mapConsole);

  // Make sure the button knows about the command line
  setTimeout(function () {
    const button = document.getElementById("command-line-tool-button");
    if (button) {
      console.log("Updating command line button state");
      button.classList.add("active");
      button.style.backgroundColor = "#f5f5f5";
      button.style.boxShadow = "0 2px 5px rgba(0,0,0,0.15)";
    }
  }, 100);

  return mapConsole;
}
// Create the command line when the page loads
// Create the command line when the page loads
window.onload = function () {
  // Wait for the map to be ready
  setTimeout(() => {
    if (window.interface && window.interface.map) {
      // First try to add button to tools panel
      const commandLine = new EnhancedCommandLine();
      if (!commandLine.addCommandLineButtonToTools()) {
        // If tools panel not available, add floating button
        //addConsoleButton();
      }

      console.log(
        "Enhanced MapLibre debug console button added. Click to open the command line."
      );
    } else {
      console.error(
        "Map interface not available. Make sure the map is loaded first."
      );
      // Try again after a delay
      setTimeout(() => {
        if (window.interface && window.interface.map) {
          const commandLine = new EnhancedCommandLine();
          if (!commandLine.addCommandLineButtonToTools()) {
            //addConsoleButton();
          }
          console.log(
            "Enhanced MapLibre debug console button added. Click to open the command line."
          );
        }
      }, 2000);
    }
  }, 1000);
};

// Wait for DOM content to be loaded and set up a MutationObserver to watch for panel changes
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    // Start watching for tab panel changes
    const observeToolsPanel = function () {
      const tabGroup = document.querySelector("sl-tab-group");
      if (tabGroup) {
        const observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            if (
              mutation.type === "attributes" &&
              mutation.attributeName === "hidden"
            ) {
              // Check if UX tab is now visible
              const uxTab = document.querySelector('sl-tab-panel[name="ux"]');
              if (uxTab && !uxTab.hasAttribute("hidden")) {
                // Try to add the button to the tools panel
                const commandLine = new EnhancedCommandLine();
                commandLine.addCommandLineButtonToTools();
              }
            }
          });
        });

        // Start observing the tab panels for visibility changes
        const tabPanels = document.querySelectorAll("sl-tab-panel");
        tabPanels.forEach(function (panel) {
          observer.observe(panel, {
            attributes: true,
            attributeFilter: ["hidden"],
          });
        });
      }
    };

    observeToolsPanel();
  }, 1000);
});

// Export the class and functions
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    EnhancedCommandLine,
    initEnhancedCommandLine,
    addConsoleButton,
  };
}

EnhancedCommandLine.prototype.handleTestFeatureCommand = function (args) {
  try {
    this.addOutput("Starting test feature command...", "#00aaff");

    // Default parameters
    const layerId = args[0] || "testLayer";
    const objectId = args[1] || "test-" + Date.now();

    // Create a test GeoJSON object - start with a simple point
    const testPoint = {
      type: "GeometryCollection",
      geometries: [
        {
          type: "Point",
          coordinates: [
            // Use current map center if available, or default coordinates
            window.interface && window.interface.map
              ? window.interface.map.getCenter().lng
              : 14.222929,
            window.interface && window.interface.map
              ? window.interface.map.getCenter().lat
              : 46.626328,
          ],
        },
      ],
    };

    // Style for the test feature
    const testStyle = {
      "circle-color": "#FF0000",
      "circle-radius": 8,
      "line-width": 3,
      "line-color": "#FF0000",
      "fill-color": "#FF0000",
      "fill-opacity": 0.5,
    };

    this.addOutput(
      `Adding test feature to layer '${layerId}' with ID '${objectId}'`,
      "#00aaff"
    );

    // Log input parameters for debugging
    this.addOutput("GeoJSON input:", "#aaaaaa");
    this.addOutput(JSON.stringify(testPoint, null, 2), "#dddddd");
    this.addOutput("Style input:", "#aaaaaa");
    this.addOutput(JSON.stringify(testStyle, null, 2), "#dddddd");

    // Check if the interface is available
    if (!window.interface) {
      this.addOutput("ERROR: window.interface is not available!", "#ff0000");
      return;
    }

    // Check if addFeature function exists
    if (typeof window.interface.addFeature !== "function") {
      this.addOutput(
        "ERROR: window.interface.addFeature is not a function!",
        "#ff0000"
      );
      return;
    }

    // First, create the layer if needed
    if (typeof window.interface.createLayer === "function") {
      this.addOutput(
        `Creating layer '${layerId}' if it doesn't exist...`,
        "#aaaaaa"
      );
      window.interface.createLayer(layerId);
    }

    // Log the bridge implementation
    this.addOutput("Checking bridge implementation:", "#aaaaaa");
    if (App && App.Map && App.Map.Layers) {
      this.addOutput("App.Map.Layers is available", "#00ff00");

      if (typeof App.Map.Layers.addFeature === "function") {
        this.addOutput("App.Map.Layers.addFeature is available", "#00ff00");
      } else {
        this.addOutput(
          "WARNING: App.Map.Layers.addFeature is not a function!",
          "#ffaa00"
        );
      }
    } else {
      this.addOutput("WARNING: App.Map.Layers module not found", "#ffaa00");
    }

    // Apply special handling based on the paste.txt content format
    // Try direct call first
    try {
      window.interface.addFeature(layerId, objectId, testPoint, testStyle);
      this.addOutput("Called window.interface.addFeature directly", "#00ff00");
    } catch (error) {
      this.addOutput(`Error in direct call: ${error.message}`, "#ff0000");

      // Try using JSON strings like in paste.txt
      try {
        this.addOutput("Trying with JSON strings instead...", "#ffaa00");
        window.interface.addFeature(
          layerId,
          objectId,
          JSON.stringify(testPoint),
          JSON.stringify(testStyle)
        );
        this.addOutput("Called with JSON strings successfully", "#00ff00");
      } catch (stringError) {
        this.addOutput(
          `Error with JSON strings: ${stringError.message}`,
          "#ff0000"
        );
      }
    }

    // Check additional command to test
    this.addOutput("\nTrying alternative approach...", "#00aaff");

    // Create a direct test command from paste.txt style
    const testCommand = `window.interface.addFeature(
      "${layerId}",
      "${objectId}-alt",
      JSON.parse(
        '${JSON.stringify(testPoint)}'
      ),
      JSON.parse(
        '${JSON.stringify(testStyle)}'
      )
    );`;

    this.addOutput("Executing test command:", "#aaaaaa");
    this.addOutput(testCommand, "#dddddd");

    // Execute the test command
    try {
      eval(testCommand);
      this.addOutput("Test command executed successfully", "#00ff00");
    } catch (evalError) {
      this.addOutput(
        `Error executing test command: ${evalError.message}`,
        "#ff0000"
      );
    }

    // Try adding a polygon too
    try {
      const polygonId = objectId + "-polygon";

      // Create a small polygon around current point
      const center = testPoint.geometries[0].coordinates;
      const polygonGeoJson = {
        type: "GeometryCollection",
        geometries: [
          {
            type: "Polygon",
            coordinates: [
              [
                [center[0] - 0.0002, center[1] - 0.0002],
                [center[0] + 0.0002, center[1] - 0.0002],
                [center[0] + 0.0002, center[1] + 0.0002],
                [center[0] - 0.0002, center[1] + 0.0002],
                [center[0] - 0.0002, center[1] - 0.0002],
              ],
            ],
          },
        ],
      };

      this.addOutput(`\nAdding test polygon with ID '${polygonId}'`, "#00aaff");
      window.interface.addFeature(
        layerId,
        polygonId,
        polygonGeoJson,
        testStyle
      );
      this.addOutput("Polygon added successfully", "#00ff00");
    } catch (polyError) {
      this.addOutput(`Error adding polygon: ${polyError.message}`, "#ff0000");
    }

    this.addOutput("\nTest feature command completed", "#00ff00");
    this.addOutput("Check the map for new features", "#aaaaaa");

    // Suggestion for next steps
    this.addOutput("\nFor further debugging, try:", "#aaaaaa");
    this.addOutput("testpaste - To test features from paste.txt", "#ffffff");
  } catch (error) {
    this.addOutput(
      `Error in test feature command: ${error.message}`,
      "#ff0000"
    );
    console.error("Test feature error:", error);
  }
};

// Store last image call for debugging
EnhancedCommandLine.prototype.lastImageCall = null;

// Test single image
EnhancedCommandLine.prototype.testSingleImage = function() {
  this.addOutput("Testing single image feature...", "#00ff00");
  
  try {
    // Check if layer/source already exists before creating
    const map = App.Map.Init.getMap();
    if (!map.getSource("objlayer")) {
      window.interface.createLayer("objlayer");
    } else {
      this.addOutput("Layer 'objlayer' already exists, skipping creation", "#ffff00");
    }
    
    // Wait a bit for layer creation
    setTimeout(() => {
      // Call with exact same parameters as testpaste
      window.interface.addImageFeature(
        "objlayer",
        "test-single-image",
        '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[14.2224928,46.6264901,499.6]},"properties":{"name":"Test Image"}}]}',
        "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAQ8SURBVFiFpVddSBxXFP7O3T+NS+Kua6R1J2l2NdRAC4U+V6RCwBRaSWkLSpC2kTYpGIgQiuSteUgrRUqh5ClWU7oWKtKE9MUQ8txHKaSpGmtWC1FnF91dO7Ozc/oQdzJ3ZieO+sGFOT/3fOeeuZx7L2EPeNp8KhqMaL8AOB0iEoEdvQlAY2aC+aCIQ2eV7J+q35jkx0ltTY80BsRXedP0FbRRCORhfh1fXrhyoATU1vYzEcF3NGZfxE6EiKCZOJdYmZ/ccwJqMrUGUGJfzC4SLsWyiw2+ElhVUm/WM/1Ra82saai/fAl1gx+DYjHZtrkJ7eYESteugyKRmokYQM/R7MLvL0wgl0y7C24YqBu5gvovPq8Z2Alt4ieUhr8EImFJTwBi2QVy6uzkTxlotuvYMBD/d8kXsRO54ycB98Ytx7MLVmai+qEmUz1OchFr3Dc5AMT+eQTxynGnOrSupKxSWhUoKm0s7XbDQOwA5HbkUq8CZcOSw0SIPpknYKcCqpIe8SIvl8ueww4iskYmk5FsscWHgK5bss4MNXnihqUwlXZWk2lrbH//A1cBwHO8yGd7e5vt0GZuSxy60s4AIDba2g7n+flGYU1D3cXPXGVMJBJoamqyRjwed/kwMwYGBgAAfX19ki387jvgYtGSC2xio7UtKahUmbI71l8ecgUGgLW1Nayvr1tjY2Ojpl93dzcAIJvNumwN330rJwy+K1iI03ZlZPCTmoHL5TIymYwnsR+EP3xfkqNCvBYME1HZtgGFo8NZk8NyU6lUKhBC1PT1AoVCkmyAYR2pu6G3txf9/f2WHAj4nekNE7ZG5IWhoSEwM6anpzE5OYnl5WXLtrq6euAkRGUXh7GxMUlWFMX6Hh8fPxg5AKGzfPbw5pbvALqtufhCRV5uEIAgmA/sSu3mj77jdXV17Ylfm7ktyUXmR6KIQ2ftytK165ITEWF4eFiSq+js7HSRzM7OApB/lUV4/oIkB4h6AADmMbkV/zdxi5mZR0dHPdvw3Nyc1WaJyGUvFotSK9bv3a/ZigEAeaX9G7tRPapYE5eWlrilpcUK3NHRwaZpshNCCMsnk8m47GoiKSWgKukpwHYcF5Q21u37kQix5b9dZdwP8qfeAG8939xBIhy2H8cAoLPZL81ixuZbbx+YfOu9DyRyANDBV6vf0pUsn0wVTJB8ew0GEXv8cF/kzpUDQIAIR3ZWDzg6YWN2MeqKYhjItRyD/tsd38Tle/eRa1Zc5AAkclcCO+hxXZXDYRQvXoIafwnarZ8Bx22omqj26wzUppdRGDgP1Lmv5oZpfurUeT9MWlM6iEJe9r0gAOCI4zpehedhFF9ZDIPoQsjf87EmggBMMq96kQN+H6fJEzeiFBwssL/HaZQECqYxFV95/NFuvntaXil5snUblbsNRK8beHaeA8/KGARQYv5LEJ1pfDK/4Dfm//V1T7xVvYCXAAAAAElFTkSuQmCC",
        32
      );
      
      this.addOutput("Single image test completed. Check 'debugimage' and 'debuglayer' commands for details.", "#00ff00");
      
      // Automatically debug after a short delay
      setTimeout(() => {
        this.debugLayerInfo("objlayer");
      }, 500);
      
    }, 100);
    
  } catch (error) {
    this.addOutput(`Error in single image test: ${error.message}`, "#ff0000");
  }
};

// Debug last image call
EnhancedCommandLine.prototype.debugLastImageCall = function() {
  if (!this.lastImageCall) {
    this.addOutput("No image calls recorded yet", "#ff0000");
    return;
  }
  
  this.addOutput("=== Last addImageFeature Call ===", "#00ff00");
  this.addOutput(`Time: ${this.lastImageCall.time}`, "#ffffff");
  this.addOutput(`Source: ${this.lastImageCall.source}`, "#ffffff");
  this.addOutput(`Layer: ${this.lastImageCall.layerId}`, "#ffffff");
  this.addOutput(`ObjectId: ${this.lastImageCall.objId}`, "#ffffff");
  this.addOutput(`Position type: ${typeof this.lastImageCall.position}`, "#ffffff");
  this.addOutput(`Position: ${JSON.stringify(this.lastImageCall.position).substring(0, 200)}...`, "#ffffff");
  this.addOutput(`Image type: ${typeof this.lastImageCall.image}`, "#ffffff");
  this.addOutput(`Image preview: ${this.lastImageCall.image ? this.lastImageCall.image.substring(0, 100) + '...' : 'null'}`, "#ffffff");
  this.addOutput(`Size: ${this.lastImageCall.size} (type: ${typeof this.lastImageCall.size})`, "#ffffff");
  
  // Check if layer exists
  if (window.interface && window.interface.map) {
    const source = window.interface.map.getSource(this.lastImageCall.layerId);
    this.addOutput(`Layer exists: ${!!source}`, source ? "#00ff00" : "#ff0000");
  }
};

// Install feature collection checker
EnhancedCommandLine.prototype.installFeatureCollectionChecker = function() {
  const self = this;
  
  // Check if App.Map.Layers exists
  if (!window.App || !window.App.Map || !window.App.Map.Layers) {
    this.addOutput("Error: App.Map.Layers not found", "#ff0000");
    return;
  }
  
  // Save original function
  const originalAddImageFeature = App.Map.Layers.addImageFeature;
  
  // Override function
  App.Map.Layers.addImageFeature = function(layerId, objId, position, image, size, text, isDraggable, markerOffset) {
    self.addOutput("=== ANDROID FEATURE COLLECTION CHECK ===", "#00ffff");
    self.addOutput(`1. layerId: ${layerId}`, "#ffffff");
    self.addOutput(`2. objId: ${objId}`, "#ffffff");
    self.addOutput(`3. position type: ${typeof position}`, "#ffffff");
    self.addOutput(`4. position content: ${JSON.stringify(position).substring(0, 200)}...`, "#ffffff");
    
    // Try to parse if string
    let positionData = position;
    if (typeof position === 'string') {
      try {
        positionData = JSON.parse(position);
        self.addOutput(`5. Parsed position: ${JSON.stringify(positionData).substring(0, 200)}...`, "#ffffff");
      } catch (e) {
        self.addOutput(`Failed to parse position: ${e.message}`, "#ff0000");
      }
    }
    
    // Check structure
    if (positionData && typeof positionData === 'object') {
      self.addOutput(`6. Position type field: ${positionData.type}`, "#ffffff");
      self.addOutput(`7. Has features? ${!!positionData.features}`, "#ffffff");
      self.addOutput(`8. Has geometries? ${!!positionData.geometries}`, "#ffffff");
      
      if (positionData.type === "FeatureCollection" && positionData.features) {
        self.addOutput("✅ CORRECT: FeatureCollection with features array", "#00ff00");
        self.addOutput(`9. Number of features: ${positionData.features.length}`, "#ffffff");
        if (positionData.features.length > 0) {
          self.addOutput(`10. First feature: ${JSON.stringify(positionData.features[0]).substring(0, 200)}...`, "#ffffff");
        }
      } else if (positionData.type === "GeometryCollection") {
        self.addOutput("❌ WRONG: Still sending GeometryCollection!", "#ff0000");
      } else {
        self.addOutput("❓ UNKNOWN: Structure doesn't match expected format", "#ffff00");
      }
    }
    
    // Call original function
    const result = originalAddImageFeature.apply(this, arguments);
    
    // Restore original function
    App.Map.Layers.addImageFeature = originalAddImageFeature;
    
    self.addOutput("Feature collection check complete. Original function restored.", "#00ff00");
    
    return result;
  };
  
  this.addOutput("Feature collection checker installed. The next addImageFeature call from Android will be analyzed.", "#00ff00");
  this.addOutput("To test: Have Android add an image feature, or use 'testimage' command", "#ffff00");
};

// Intercept addImageFeature calls
EnhancedCommandLine.prototype.interceptAddImageFeature = function() {
  const originalAddImageFeature = window.interface.addImageFeature;
  const self = this;
  
  window.interface.addImageFeature = function() {
    // Store call details
    self.lastImageCall = {
      time: new Date().toISOString(),
      source: (new Error()).stack.includes('testpaste') ? 'testpaste' : 'android',
      layerId: arguments[0],
      objId: arguments[1],
      position: arguments[2],
      image: arguments[3],
      size: arguments[4],
      text: arguments[5],
      isDraggable: arguments[6],
      markerOffset: arguments[7]
    };
    
    console.log('INTERCEPTED addImageFeature:', self.lastImageCall);
    
    // Call original
    return originalAddImageFeature.apply(this, arguments);
  };
};

// Test from Android format - simulates exact Android call
EnhancedCommandLine.prototype.testFromAndroidFormat = function() {
  this.addOutput("Testing Android-style image feature call...", "#00ff00");
  
  try {
    // Simulate exact Android call sequence
    const map = App.Map.Init.getMap();
    
    // 1. Create layer (like Android does)
    if (!map.getSource("objlayer")) {
      window.interface.createLayer("objlayer");
    }
    
    // 2. Call addImageFeature with 8 parameters like Android
    setTimeout(() => {
      // Simulate the exec call from Android:
      // exec("addImageFeature", objectify(layerId), objectify(objectId), geoJson, objectify(base64ImageUrl), size, "null", "false", "[0, 0]");
      
      const layerId = "objlayer";
      const objectId = "android-test-123";
      const geoJson = '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[14.2225,46.6265,500]},"properties":{"name":"Android Test"}}]}';
      const base64ImageUrl = "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAQ8SURBVFiFpVddSBxXFP7O3T+NS+Kua6R1J2l2NdRAC4U+V6RCwBRaSWkLSpC2kTYpGIgQiuSteUgrRUqh5ClWU7oWKtKE9MUQ8txHKaSpGmtWC1FnF91dO7Ozc/oQdzJ3ZieO+sGFOT/3fOeeuZx7L2EPeNp8KhqMaL8AOB0iEoEdvQlAY2aC+aCIQ2eV7J+q35jkx0ltTY80BsRXedP0FbRRCORhfh1fXrhyoATU1vYzEcF3NGZfxE6EiKCZOJdYmZ/ccwJqMrUGUGJfzC4SLsWyiw2+ElhVUm/WM/1Ra82saai/fAl1gx+DYjHZtrkJ7eYESteugyKRmokYQM/R7MLvL0wgl0y7C24YqBu5gvovPq8Z2Alt4ieUhr8EImFJTwBi2QVy6uzkTxlotuvYMBD/d8kXsRO54ycB98Ytx7MLVmai+qEmUz1OchFr3Dc5AMT+eQTxynGnOrSupKxSWhUoKm0s7XbDQOwA5HbkUq8CZcOSw0SIPpknYKcCqpIe8SIvl8ueww4iskYmk5FsscWHgK5bss4MNXnihqUwlXZWk2lrbH//A1cBwHO8yGd7e5vt0GZuSxy60s4AIDba2g7n+flGYU1D3cXPXGVMJBJoamqyRjwed/kwMwYGBgAAfX19ki387jvgYtGSC2xio7UtKahUmbI71l8ecgUGgLW1Nayvr1tjY2Ojpl93dzcAIJvNumwN330rJwy+K1iI03ZlZPCTmoHL5TIymYwnsR+EP3xfkqNCvBYME1HZtgGFo8NZk8NyU6lUKhBC1PT1AoVCkmyAYR2pu6G3txf9/f2WHAj4nekNE7ZG5IWhoSEwM6anpzE5OYnl5WXLtrq6euAkRGUXh7GxMUlWFMX6Hh8fPxg5AKGzfPbw5pbvALqtufhCRV5uEIAgmA/sSu3mj77jdXV17Ylfm7ktyUXmR6KIQ2ftytK165ITEWF4eFiSq+js7HSRzM7OApB/lUV4/oIkB4h6AADmMbkV/zdxi5mZR0dHPdvw3Nyc1WaJyGUvFotSK9bv3a/ZigEAeaX9G7tRPapYE5eWlrilpcUK3NHRwaZpshNCCMsnk8m47GoiKSWgKukpwHYcF5Q21u37kQix5b9dZdwP8qfeAG8939xBIhy2H8cAoLPZL81ixuZbbx+YfOu9DyRyANDBV6vf0pUsn0wVTJB8ew0GEXv8cF/kzpUDQIAIR3ZWDzg6YWN2MeqKYhjItRyD/tsd38Tle/eRa1Zc5AAkclcCO+hxXZXDYRQvXoIafwnarZ8Bx22omqj26wzUppdRGDgP1Lmv5oZpfurUeT9MWlM6iEJe9r0gAOCI4zpehedhFF9ZDIPoQsjf87EmggBMMq96kQN+H6fJEzeiFBwssL/HaZQECqYxFV95/NFuvntaXil5snUblbsNRK8beHaeA8/KGARQYv5LEJ1pfDK/4Dfm//V1T7xVvYCXAAAAAElFTkSuQmCC";
      const size = "32";
      const text = "null";
      const isDraggable = "false";
      const markerOffset = "[0, 0]";
      
      this.addOutput("Calling addImageFeature with 8 parameters (Android style)...", "#00aaff");
      
      // Call through App.Map.Layers directly to bypass any bridge transformations
      if (App.Map.Layers && App.Map.Layers.addImageFeature) {
        App.Map.Layers.addImageFeature(
          layerId,
          objectId,
          geoJson,
          base64ImageUrl,
          parseInt(size),
          text === "null" ? null : text,
          isDraggable === "true",
          JSON.parse(markerOffset)
        );
      }
      
      this.addOutput("Android-style test completed.", "#00ff00");
      
      // Debug after delay
      setTimeout(() => {
        this.debugLayerInfo("objlayer");
      }, 500);
      
    }, 100);
    
  } catch (error) {
    this.addOutput(`Error in Android test: ${error.message}`, "#ff0000");
  }
};

// Debug layer information
EnhancedCommandLine.prototype.debugLayerInfo = function(layerId) {
  this.addOutput(`Debugging layer: ${layerId}`, "#00ff00");
  
  try {
    const map = App.Map.Init.getMap();
    
    // Check source
    const source = map.getSource(layerId);
    if (source) {
      this.addOutput(`  Source exists: YES`, "#00ff00");
      if (source._data) {
        const featureCount = source._data.features ? source._data.features.length : 0;
        this.addOutput(`  Features in source: ${featureCount}`, "#00ff00");
        
        // List feature IDs
        if (source._data.features && source._data.features.length > 0) {
          source._data.features.forEach((f, idx) => {
            const objId = f.properties?.objectid || f.properties?.id || 'no-id';
            const geomType = f.geometry?.type || 'unknown';
            this.addOutput(`    Feature ${idx}: ${objId} (${geomType})`, "#00aaff");
          });
        }
      }
    } else {
      this.addOutput(`  Source exists: NO`, "#ff0000");
    }
    
    // Check layers using this source
    const style = map.getStyle();
    const layersUsingSource = style.layers.filter(l => l.source === layerId);
    this.addOutput(`  Layers using source: ${layersUsingSource.length}`, "#00ff00");
    layersUsingSource.forEach(l => {
      this.addOutput(`    - ${l.id} (${l.type})`, "#00aaff");
    });
    
    // Check for symbol layers with images
    const symbolLayers = layersUsingSource.filter(l => l.type === 'symbol');
    symbolLayers.forEach(l => {
      const iconImage = l.layout && l.layout['icon-image'];
      this.addOutput(`    Symbol layer ${l.id} icon-image: ${iconImage || 'none'}`, "#00aaff");
    });
    
    // Check loaded images
    const images = map.listImages();
    const relatedImages = images.filter(img => img.includes(layerId) || img.includes('objlayer'));
    this.addOutput(`  Related images loaded: ${relatedImages.length}`, "#00ff00");
    relatedImages.forEach(img => {
      this.addOutput(`    - ${img}`, "#00aaff");
    });
    
  } catch (error) {
    this.addOutput(`Error debugging layer: ${error.message}`, "#ff0000");
  }
};

// Test direct symbol layer creation
EnhancedCommandLine.prototype.testDirectSymbolLayer = function() {
  this.addOutput("Testing direct symbol layer creation...", "#00ff00");
  
  try {
    const map = App.Map.Init.getMap();
    const layerId = 'objlayer';
    const symbolLayerId = `${layerId}-symbols`;
    
    // 1. Ensure source exists with test data
    let source = map.getSource(layerId);
    if (!source) {
      this.addOutput("Creating source...", "#00ff00");
      map.addSource(layerId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [14.2228, 46.6268]
            },
            properties: {
              objectid: 'direct-test',
              imageId: 'image-direct-test',
              name: 'Direct Test'
            }
          }]
        }
      });
      source = map.getSource(layerId);
    }
    
    // 2. Add a simple test image
    const imageId = 'image-direct-test';
    if (!map.hasImage(imageId)) {
      this.addOutput("Creating test image...", "#00ff00");
      
      // Create a simple red square
      const size = 32;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(0, 0, size, size);
      
      const img = new Image();
      img.onload = () => {
        map.addImage(imageId, img);
        this.addOutput(`Image '${imageId}' added`, "#00ff00");
        
        // 3. Now create the symbol layer
        if (map.getLayer(symbolLayerId)) {
          this.addOutput("Removing existing symbol layer...", "#ffff00");
          map.removeLayer(symbolLayerId);
        }
        
        this.addOutput("Creating symbol layer...", "#00ff00");
        try {
          map.addLayer({
            id: symbolLayerId,
            type: 'symbol',
            source: layerId,
            layout: {
              'icon-image': ['get', 'imageId'],
              'icon-size': 1,
              'icon-allow-overlap': true
            }
          });
          this.addOutput("Symbol layer created successfully!", "#00ff00");
          
          // Verify
          const layer = map.getLayer(symbolLayerId);
          if (layer) {
            this.addOutput(`Verification: Layer '${symbolLayerId}' exists`, "#00ff00");
            
            // Check visibility
            const bounds = map.getBounds();
            const center = map.getCenter();
            this.addOutput(`Map center: ${center.lng.toFixed(4)}, ${center.lat.toFixed(4)}`, "#00aaff");
            this.addOutput(`Feature at: 14.2228, 46.6268`, "#00aaff");
            
            // Zoom to feature
            map.flyTo({
              center: [14.2228, 46.6268],
              zoom: 15
            });
            this.addOutput("Zoomed to feature location", "#00ff00");
          }
        } catch (error) {
          this.addOutput(`ERROR creating symbol layer: ${error.message}`, "#ff0000");
        }
      };
      img.src = canvas.toDataURL();
    }
    
  } catch (error) {
    this.addOutput(`Error in direct test: ${error.message}`, "#ff0000");
  }
};

// Trace complete image flow
EnhancedCommandLine.prototype.traceImageFlow = function() {
  this.addOutput("Setting up comprehensive flow tracing...", "#00ff00");
  
  const self = this;
  const originalAddImageFeature = App.Map.Layers.addImageFeature;
  
  // Trace App.Map.Layers.addImageFeature
  App.Map.Layers.addImageFeature = function() {
    self.addOutput("\n=== App.Map.Layers.addImageFeature called ===", "#ffff00");
    self.addOutput(`Arguments: ${arguments.length}`, "#ffff00");
    
    // Log each argument
    for (let i = 0; i < arguments.length; i++) {
      const arg = arguments[i];
      if (typeof arg === 'string' && arg.length > 100) {
        self.addOutput(`[${i}]: ${arg.substring(0, 100)}...`, "#ffff00");
      } else {
        self.addOutput(`[${i}]: ${JSON.stringify(arg)}`, "#ffff00");
      }
    }
    
    // Call original and catch any errors
    try {
      const result = originalAddImageFeature.apply(this, arguments);
      self.addOutput("addImageFeature completed successfully", "#00ff00");
      return result;
    } catch (error) {
      self.addOutput(`ERROR in addImageFeature: ${error.message}`, "#ff0000");
      console.error(error);
      throw error;
    }
  };
  
  // Trace map.addLayer calls
  const map = App.Map.Init.getMap();
  const originalAddLayer = map.addLayer.bind(map);
  
  map.addLayer = function(layer) {
    self.addOutput(`\n=== map.addLayer called ===`, "#00aaff");
    self.addOutput(`Layer ID: ${layer.id}`, "#00aaff");
    self.addOutput(`Layer type: ${layer.type}`, "#00aaff");
    self.addOutput(`Layer source: ${layer.source}`, "#00aaff");
    
    // Check if source exists
    const source = map.getSource(layer.source);
    if (!source) {
      self.addOutput(`ERROR: Source '${layer.source}' does not exist!`, "#ff0000");
    } else {
      self.addOutput(`Source exists: ${source.type}`, "#00ff00");
    }
    
    try {
      const result = originalAddLayer(layer);
      self.addOutput(`Layer '${layer.id}' added successfully`, "#00ff00");
      return result;
    } catch (error) {
      self.addOutput(`ERROR adding layer: ${error.message}`, "#ff0000");
      throw error;
    }
  };
  
  // Trace map.addImage calls
  const originalAddImage = map.addImage.bind(map);
  
  map.addImage = function(id, image, options) {
    self.addOutput(`\n=== map.addImage called ===`, "#00ffff");
    self.addOutput(`Image ID: ${id}`, "#00ffff");
    self.addOutput(`Image type: ${image.constructor.name}`, "#00ffff");
    if (image.width && image.height) {
      self.addOutput(`Image size: ${image.width}x${image.height}`, "#00ffff");
    }
    
    try {
      const result = originalAddImage(id, image, options);
      self.addOutput(`Image '${id}' added successfully`, "#00ff00");
      return result;
    } catch (error) {
      self.addOutput(`ERROR adding image: ${error.message}`, "#ff0000");
      throw error;
    }
  };
  
  this.addOutput("\nFlow tracing enabled. Make a call to see the complete flow.", "#00ff00");
  this.addOutput("Use 'traceflow off' to disable.", "#00aaff");
};

// Test base64 image validity
EnhancedCommandLine.prototype.testBase64Image = function(base64String) {
  this.addOutput("Testing base64 image...", "#00ff00");
  
  try {
    // If no string provided, use a test one
    if (!base64String) {
      base64String = "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAQ8SURBVFiFpVddSBxXFP7O3T+NS+Kua6R1J2l2NdRAC4U+V6RCwBRaSWkLSpC2kTYpGIgQiuSteUgrRUqh5ClWU7oWKtKE9MUQ8txHKaSpGmtWC1FnF91dO7Ozc/oQdzJ3ZieO+sGFOT/3fOeeuZx7L2EPeNp8KhqMaL8AOB0iEoEdvQlAY2aC+aCIQ2eV7J+q35jkx0ltTY80BsRXedP0FbRRCORhfh1fXrhyoATU1vYzEcF3NGZfxE6EiKCZOJdYmZ/ccwJqMrUGUGJfzC4SLsWyiw2+ElhVUm/WM/1Ra82saai/fAl1gx+DYjHZtrkJ7eYESteugyKRmokYQM/R7MLvL0wgl0y7C24YqBu5gvovPq8Z2Alt4ieUhr8EImFJTwBi2QVy6uzkTxlotuvYMBD/d8kXsRO54ycB98Ytx7MLVmai+qEmUz1OchFr3Dc5AMT+eQTxynGnOrSupKxSWhUoKm0s7XbDQOwA5HbkUq8CZcOSw0SIPpknYKcCqpIe8SIvl8ueww4iskYmk5FsscWHgK5bss4MNXnihqUwlXZWk2lrbH//A1cBwHO8yGd7e5vt0GZuSxy60s4AIDba2g7n+flGYU1D3cXPXGVMJBJoamqyRjwed/kwMwYGBgAAfX19ki387jvgYtGSC2xio7UtKahUmbI71l8ecgUGgLW1Nayvr1tjY2Ojpl93dzcAIJvNumwN330rJwy+K1iI03ZlZPCTmoHL5TIymYwnsR+EP3xfkqNCvBYME1HZtgGFo8NZk8NyU6lUKhBC1PT1AoVCkmyAYR2pu6G3txf9/f2WHAj4nekNE7ZG5IWhoSEwM6anpzE5OYnl5WXLtrq6euAkRGUXh7GxMUlWFMX6Hh8fPxg5AKGzfPbw5pbvALqtufhCRV5uEIAgmA/sSu3mj77jdXV17Ylfm7ktyUXmR6KIQ2ftytK165ITEWF4eFiSq+js7HSRzM7OApB/lUV4/oIkB4h6AADmMbkV/zdxi5mZR0dHPdvw3Nyc1WaJyGUvFotSK9bv3a/ZigEAeaX9G7tRPapYE5eWlrilpcUK3NHRwaZpshNCCMsnk8m47GoiKSWgKukpwHYcF5Q21u37kQix5b9dZdwP8qfeAG8939xBIhy2H8cAoLPZL81ixuZbbx+YfOu9DyRyANDBV6vf0pUsn0wVTJB8ew0GEXv8cF/kzpUDQIAIR3ZWDzg6YWN2MeqKYhjItRyD/tsd38Tle/eRa1Zc5AAkclcCO+hxXZXDYRQvXoIafwnarZ8Bx22omqj26wzUppdRGDgP1Lmv5oZpfurUeT9MWlM6iEJe9r0gAOCI4zpehedhFF9ZDIPoQsjf87EmggBMMq96kQN+H6fJEzeiFBwssL/HaZQECqYxFV95/NFuvntaXil5snUblbsNRK8beHaeA8/KGARQYv5LEJ1pfDK/4Dfm//V1T7xVvYCXAAAAAElFTkSuQmCC";
    }
    
    // Check for newlines
    if (base64String.includes('\n')) {
      this.addOutput("WARNING: Base64 contains newlines!", "#ff0000");
    }
    
    // Create an image element to test
    const img = new Image();
    img.onload = () => {
      this.addOutput(`Image loaded successfully! Size: ${img.width}x${img.height}`, "#00ff00");
      
      // Try to add it to map
      const map = App.Map.Init.getMap();
      const testId = 'test-base64-img';
      
      if (map.hasImage(testId)) {
        map.removeImage(testId);
      }
      
      map.addImage(testId, img);
      this.addOutput(`Image added to map as '${testId}'`, "#00ff00");
    };
    
    img.onerror = (e) => {
      this.addOutput("ERROR: Failed to load image!", "#ff0000");
      this.addOutput(`Base64 length: ${base64String.length}`, "#ff0000");
      this.addOutput(`First 100 chars: ${base64String.substring(0, 100)}`, "#ff0000");
      
      // Check if it's a data URL
      if (!base64String.startsWith('data:image/')) {
        this.addOutput("ERROR: Not a valid data URL!", "#ff0000");
      }
    };
    
    img.src = base64String;
    
  } catch (error) {
    this.addOutput(`Error testing base64: ${error.message}`, "#ff0000");
  }
};

// Test with exactly 5 params like Android sends
EnhancedCommandLine.prototype.testAndroid5Params = function() {
  this.addOutput("Testing with EXACT 5 parameters like Android...", "#00ff00");
  
  try {
    // First ensure source exists
    const map = App.Map.Init.getMap();
    if (!map.getSource('objlayer')) {
      this.addOutput("Creating objlayer source first...", "#00ff00");
      window.interface.createLayer('objlayer');
    }
    
    // Wait a bit
    setTimeout(() => {
      // Simulate EXACT Android call with 5 params
      const layerId = "'objlayer'";  // Quoted
      const objectId = "'test-android-5'";
      const geoJson = '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[14.2227,46.6267,502]},"properties":{"name":"Android 5 Param Test"}}]}';
      const imageUrl = "'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAQ8SURBVFiFpVddSBxXFP7O3T+NS+Kua6R1J2l2NdRAC4U+V6RCwBRaSWkLSpC2kTYpGIgQiuSteUgrRUqh5ClWU7oWKtKE9MUQ8txHKaSpGmtWC1FnF91dO7Ozc/oQdzJ3ZieO+sGFOT/3fOeeuZx7L2EPeNp8KhqMaL8AOB0iEoEdvQlAY2aC+aCIQ2eV7J+q35jkx0ltTY80BsRXedP0FbRRCORhfh1fXrhyoATU1vYzEcF3NGZfxE6EiKCZOJdYmZ/ccwJqMrUGUGJfzC4SLsWyiw2+ElhVUm/WM/1Ra82saai/fAl1gx+DYjHZtrkJ7eYESteugyKRmokYQM/R7MLvL0wgl0y7C24YqBu5gvovPq8Z2Alt4ieUhr8EImFJTwBi2QVy6uzkTxlotuvYMBD/d8kXsRO54ycB98Ytx7MLVmai+qEmUz1OchFr3Dc5AMT+eQTxynGnOrSupKxSWhUoKm0s7XbDQOwA5HbkUq8CZcOSw0SIPpknYKcCqpIe8SIvl8ueww4iskYmk5FsscWHgK5bss4MNXnihqUwlXZWk2lrbH//A1cBwHO8yGd7e5vt0GZuSxy60s4AIDba2g7n+flGYU1D3cXPXGVMJBJoamqyRjwed/kwMwYGBgAAfX19ki387jvgYtGSC2xio7UtKahUmbI71l8ecgUGgLW1Nayvr1tjY2Ojpl93dzcAIJvNumwN330rJwy+K1iI03ZlZPCTmoHL5TIymYwnsR+EP3xfkqNCvBYME1HZtgGFo8NZk8NyU6lUKhBC1PT1AoVCkmyAYR2pu6G3txf9/f2WHAj4nekNE7ZG5IWhoSEwM6anpzE5OYnl5WXLtrq6euAkRGUXh7GxMUlWFMX6Hh8fPxg5AKGzfPbw5pbvALqtufhCRV5uEIAgmA/sSu3mj77jdXV17Ylfm7ktyUXmR6KIQ2ftytK165ITEWF4eFiSq+js7HSRzM7OApB/lUV4/oIkB4h6AADmMbkV/zdxi5mZR0dHPdvw3Nyc1WaJyGUvFotSK9bv3a/ZigEAeaX9G7tRPapYE5eWlrilpcUK3NHRwaZpshNCCMsnk8m47GoiKSWgKukpwHYcF5Q21u37kQix5b9dZdwP8qfeAG8939xBIhy2H8cAoLPZL81ixuZbbx+YfOu9DyRyANDBV6vf0pUsn0wVTJB8ew0GEXv8cF/kzpUDQIAIR3ZWDzg6YWN2MeqKYhjItRyD/tsd38Tle/eRa1Zc5AAkclcCO+hxXZXDYRQvXoIafwnarZ8Bx22omqj26wzUppdRGDgP1Lmv5oZpfurUeT9MWlM6iEJe9r0gAOCI4zpehedhFF9ZDIPoQsjf87EmggBMMq96kQN+H6fJEzeiFBwssL/HaZQECqYxFV95/NFuvntaXil5snUblbsNRK8beHaeA8/KGARQYv5LEJ1pfDK/4Dfm//V1T7xVvYCXAAAAAElFTkSuQmCC'";
      const size = "'32'";
      
      this.addOutput("\nCalling with 5 quoted params:", "#ffff00");
      this.addOutput(`1. ${layerId}`, "#ffff00");
      this.addOutput(`2. ${objectId}`, "#ffff00");
      this.addOutput(`3. geoJson (unquoted)`, "#ffff00");
      this.addOutput(`4. ${imageUrl.substring(0, 50)}...`, "#ffff00");
      this.addOutput(`5. ${size}`, "#ffff00");
      
      // Call exactly as Android does
      window.interface.addImageFeature(layerId, objectId, geoJson, imageUrl, size);
      
      // Verify after delay
      setTimeout(() => {
        this.addOutput("\nVerifying after 5-param call:", "#00ff00");
        this.debugLayerInfo('objlayer');
      }, 500);
      
    }, 100);
    
  } catch (error) {
    this.addOutput(`Error in 5-param test: ${error.message}`, "#ff0000");
  }
};

// Manually create symbol layer
EnhancedCommandLine.prototype.createSymbolLayer = function(layerId) {
  this.addOutput(`Manually creating symbol layer for: ${layerId}`, "#00ff00");
  
  try {
    const map = App.Map.Init.getMap();
    const symbolLayerId = `${layerId}-symbols`;
    
    // Check if source exists
    if (!map.getSource(layerId)) {
      this.addOutput(`ERROR: Source '${layerId}' does not exist. Create it first.`, "#ff0000");
      return;
    }
    
    // Check if layer already exists
    if (map.getLayer(symbolLayerId)) {
      this.addOutput(`Symbol layer '${symbolLayerId}' already exists`, "#ffff00");
      return;
    }
    
    // Create the symbol layer
    map.addLayer({
      id: symbolLayerId,
      type: 'symbol',
      source: layerId,
      layout: {
        'icon-image': ['get', 'imageId'],
        'icon-size': 1,
        'icon-allow-overlap': true,
        'text-field': ['get', 'text'],
        'text-font': ['Open Sans Regular'],
        'text-offset': [0, 1.5],
        'text-anchor': 'top',
        'text-size': 12
      },
      paint: {
        'text-color': '#000000',
        'icon-opacity': 1
      }
    });
    
    this.addOutput(`Symbol layer '${symbolLayerId}' created successfully!`, "#00ff00");
    
    // Verify
    setTimeout(() => {
      const layer = map.getLayer(symbolLayerId);
      if (layer) {
        this.addOutput("Verification: Layer exists in map", "#00ff00");
      } else {
        this.addOutput("ERROR: Layer not found after creation!", "#ff0000");
      }
    }, 100);
    
  } catch (error) {
    this.addOutput(`Error creating symbol layer: ${error.message}`, "#ff0000");
  }
};

// Fix objlayer by ensuring proper creation
EnhancedCommandLine.prototype.fixObjLayer = function() {
  this.addOutput("Fixing objlayer setup...", "#00ff00");
  
  try {
    const map = App.Map.Init.getMap();
    
    // 1. Check if source exists
    let source = map.getSource('objlayer');
    if (!source) {
      this.addOutput("Creating objlayer source...", "#00ff00");
      map.addSource('objlayer', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });
    } else {
      this.addOutput("Source objlayer already exists", "#00aaff");
    }
    
    // 2. Remove any existing symbol layer that might be corrupt
    const symbolLayerId = 'objlayer-symbols';
    if (map.getLayer(symbolLayerId)) {
      this.addOutput("Removing existing symbol layer...", "#ffff00");
      map.removeLayer(symbolLayerId);
    }
    
    // 3. Add a test feature with image
    const testFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [14.2225, 46.6265]
      },
      properties: {
        objectid: 'fix-test',
        imageId: 'image-fix-test',
        name: 'Fix Test'
      }
    };
    
    // 4. Update source data
    source = map.getSource('objlayer');
    const data = source._data || { type: 'FeatureCollection', features: [] };
    data.features = [testFeature];
    source.setData(data);
    
    // 5. Add a simple test image
    const imageId = 'image-fix-test';
    if (!map.hasImage(imageId)) {
      // Create a simple red circle as test image
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      // Draw red circle
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2 - 2, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add image to map
      const img = new Image();
      img.onload = () => {
        map.addImage(imageId, img);
        this.addOutput(`Test image '${imageId}' added`, "#00ff00");
        
        // 6. Now create the symbol layer
        this.addOutput("Creating symbol layer...", "#00ff00");
        try {
          map.addLayer({
            id: symbolLayerId,
            type: 'symbol',
            source: 'objlayer',
            layout: {
              'icon-image': ['get', 'imageId'],
              'icon-size': 1,
              'icon-allow-overlap': true
            }
          });
          this.addOutput("Symbol layer created successfully!", "#00ff00");
          
          // Move to top
          map.moveLayer(symbolLayerId);
          
          // Verify
          setTimeout(() => {
            this.listSymbolLayers();
          }, 100);
          
        } catch (error) {
          this.addOutput(`Error creating symbol layer: ${error.message}`, "#ff0000");
        }
      };
      img.src = canvas.toDataURL();
    }
    
  } catch (error) {
    this.addOutput(`Error fixing layer: ${error.message}`, "#ff0000");
  }
};

// List all symbol layers
EnhancedCommandLine.prototype.listSymbolLayers = function() {
  this.addOutput("Listing all symbol layers...", "#00ff00");
  
  try {
    const map = App.Map.Init.getMap();
    const style = map.getStyle();
    const symbolLayers = style.layers.filter(l => l.type === 'symbol');
    
    this.addOutput(`Found ${symbolLayers.length} symbol layers:`, "#00ff00");
    
    symbolLayers.forEach(layer => {
      this.addOutput(`\nSymbol Layer: ${layer.id}`, "#00aaff");
      this.addOutput(`  Source: ${layer.source}`, "#00aaff");
      
      // Check if source exists
      const source = map.getSource(layer.source);
      if (!source) {
        this.addOutput(`  WARNING: Source '${layer.source}' does not exist!`, "#ff0000");
      } else {
        this.addOutput(`  Source type: ${source.type}`, "#00aaff");
        if (source._data && source._data.features) {
          this.addOutput(`  Features in source: ${source._data.features.length}`, "#00aaff");
        }
      }
      
      // Check layout properties
      const iconImage = layer.layout && layer.layout['icon-image'];
      const iconSize = layer.layout && layer.layout['icon-size'];
      this.addOutput(`  icon-image: ${JSON.stringify(iconImage)}`, "#00aaff");
      this.addOutput(`  icon-size: ${JSON.stringify(iconSize)}`, "#00aaff");
      
      // Check visibility
      const visibility = map.getLayoutProperty(layer.id, 'visibility');
      this.addOutput(`  visibility: ${visibility || 'visible'}`, "#00aaff");
    });
    
    // Also check for objlayer specifically
    this.addOutput("\nChecking for objlayer-symbols specifically:", "#ffff00");
    const objSymbolLayer = map.getLayer('objlayer-symbols');
    if (objSymbolLayer) {
      this.addOutput("  Layer exists!", "#00ff00");
    } else {
      this.addOutput("  Layer does NOT exist", "#ff0000");
      
      // Check if objlayer source exists
      const objSource = map.getSource('objlayer');
      if (objSource) {
        this.addOutput("  Source 'objlayer' exists", "#00ff00");
      } else {
        this.addOutput("  Source 'objlayer' does NOT exist", "#ff0000");
      }
    }
    
  } catch (error) {
    this.addOutput(`Error listing symbol layers: ${error.message}`, "#ff0000");
  }
};

// Test with quoted parameters like Android sends
EnhancedCommandLine.prototype.testQuotedParameters = function() {
  this.addOutput("Testing with quoted parameters (Android style)...", "#00ff00");
  
  try {
    // Simulate exactly how Android sends parameters
    const layerId = "'objlayer'";
    const objectId = "'quoted-test-123'";
    const geoJson = '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[14.2226,46.6266,501]},"properties":{"name":"Quoted Test"}}]}';
    const base64ImageUrl = "'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAQ8SURBVFiFpVddSBxXFP7O3T+NS+Kua6R1J2l2NdRAC4U+V6RCwBRaSWkLSpC2kTYpGIgQiuSteUgrRUqh5ClWU7oWKtKE9MUQ8txHKaSpGmtWC1FnF91dO7Ozc/oQdzJ3ZieO+sGFOT/3fOeeuZx7L2EPeNp8KhqMaL8AOB0iEoEdvQlAY2aC+aCIQ2eV7J+q35jkx0ltTY80BsRXedP0FbRRCORhfh1fXrhyoATU1vYzEcF3NGZfxE6EiKCZOJdYmZ/ccwJqMrUGUGJfzC4SLsWyiw2+ElhVUm/WM/1Ra82saai/fAl1gx+DYjHZtrkJ7eYESteugyKRmokYQM/R7MLvL0wgl0y7C24YqBu5gvovPq8Z2Alt4ieUhr8EImFJTwBi2QVy6uzkTxlotuvYMBD/d8kXsRO54ycB98Ytx7MLVmai+qEmUz1OchFr3Dc5AMT+eQTxynGnOrSupKxSWhUoKm0s7XbDQOwA5HbkUq8CZcOSw0SIPpknYKcCqpIe8SIvl8ueww4iskYmk5FsscWHgK5bss4MNXnihqUwlXZWk2lrbH//A1cBwHO8yGd7e5vt0GZuSxy60s4AIDba2g7n+flGYU1D3cXPXGVMJBJoamqyRjwed/kwMwYGBgAAfX19ki387jvgYtGSC2xio7UtKahUmbI71l8ecgUGgLW1Nayvr1tjY2Ojpl93dzcAIJvNumwN330rJwy+K1iI03ZlZPCTmoHL5TIymYwnsR+EP3xfkqNCvBYME1HZtgGFo8NZk8NyU6lUKhBC1PT1AoVCkmyAYR2pu6G3txf9/f2WHAj4nekNE7ZG5IWhoSEwM6anpzE5OYnl5WXLtrq6euAkRGUXh7GxMUlWFMX6Hh8fPxg5AKGzfPbw5pbvALqtufhCRV5uEIAgmA/sSu3mj77jdXV17Ylfm7ktyUXmR6KIQ2ftytK165ITEWF4eFiSq+js7HSRzM7OApB/lUV4/oIkB4h6AADmMbkV/zdxi5mZR0dHPdvw3Nyc1WaJyGUvFotSK9bv3a/ZigEAeaX9G7tRPapYE5eWlrilpcUK3NHRwaZpshNCCMsnk8m47GoiKSWgKukpwHYcF5Q21u37kQix5b9dZdwP8qfeAG8939xBIhy2H8cAoLPZL81ixuZbbx+YfOu9DyRyANDBV6vf0pUsn0wVTJB8ew0GEXv8cF/kzpUDQIAIR3ZWDzg6YWN2MeqKYhjItRyD/tsd38Tle/eRa1Zc5AAkclcCO+hxXZXDYRQvXoIafwnarZ8Bx22omqj26wzUppdRGDgP1Lmv5oZpfurUeT9MWlM6iEJe9r0gAOCI4zpehedhFF9ZDIPoQsjf87EmggBMMq96kQN+H6fJEzeiFBwssL/HaZQECqYxFV95/NFuvntaXil5snUblbsNRK8beHaeA8/KGARQYv5LEJ1pfDK/4Dfm//V1T7xVvYCXAAAAAElFTkSuQmCC'";
    const size = "32";
    const text = "'null'";
    const isDraggable = "'false'";
    const markerOffset = "'[0, 0]'";
    
    this.addOutput("Calling with quoted parameters like Android does...", "#ffff00");
    
    // Call directly through interface (simulating Android's exec)
    window.interface.addImageFeature(
      layerId,
      objectId,
      geoJson,
      base64ImageUrl,
      size,
      text,
      isDraggable,
      markerOffset
    );
    
    this.addOutput("Quoted parameter test completed.", "#00ff00");
    
    // Debug after delay
    setTimeout(() => {
      this.debugLayerInfo("objlayer");
    }, 500);
    
  } catch (error) {
    this.addOutput(`Error in quoted test: ${error.message}`, "#ff0000");
  }
};

// Capture Android calls for debugging
EnhancedCommandLine.prototype.captureAndroidCalls = function() {
  this.addOutput("Setting up Android call capture...", "#00ff00");
  
  const self = this;
  
  // Store original functions
  const originalAddImageFeature = window.interface.addImageFeature;
  const originalCreateLayer = window.interface.createLayer;
  
  // Capture buffer
  this.androidCalls = [];
  
  // Wrap createLayer
  window.interface.createLayer = function(layerId) {
    const callInfo = {
      method: 'createLayer',
      args: [layerId],
      timestamp: new Date().toISOString()
    };
    self.androidCalls.push(callInfo);
    self.addOutput(`CAPTURED: createLayer('${layerId}')`, "#ffff00");
    return originalCreateLayer.apply(this, arguments);
  };
  
  // Wrap addImageFeature with detailed capture
  window.interface.addImageFeature = function() {
    const args = Array.from(arguments);
    const callInfo = {
      method: 'addImageFeature',
      args: args,
      argTypes: args.map(arg => typeof arg),
      timestamp: new Date().toISOString()
    };
    
    // Detailed analysis
    self.addOutput(`\nCAPTURED: addImageFeature with ${args.length} arguments:`, "#ffff00");
    args.forEach((arg, idx) => {
      let display = arg;
      if (typeof arg === 'string') {
        if (arg.length > 100) {
          display = arg.substring(0, 100) + '...';
        }
        // Check if it's quoted
        if (arg.startsWith("'") && arg.endsWith("'")) {
          self.addOutput(`  [${idx}] QUOTED STRING: ${display}`, "#ff9900");
        } else {
          self.addOutput(`  [${idx}] STRING: ${display}`, "#ffff00");
        }
      } else {
        self.addOutput(`  [${idx}] ${typeof arg}: ${display}`, "#ffff00");
      }
    });
    
    self.androidCalls.push(callInfo);
    
    // Call original
    const result = originalAddImageFeature.apply(this, arguments);
    
    // Verify what was actually passed to the layers
    setTimeout(() => {
      self.addOutput("\nVerifying after Android call:", "#00ff00");
      self.verifyImageDisplay();
    }, 500);
    
    return result;
  };
  
  this.addOutput("Android call capture enabled. Make a call from Android to see details.", "#00ff00");
  this.addOutput("Use 'captureandroid off' to disable capture.", "#00aaff");
};

// Verify image display
EnhancedCommandLine.prototype.verifyImageDisplay = function() {
  this.addOutput("Verifying image display setup...", "#00ff00");
  
  try {
    const map = App.Map.Init.getMap();
    const layerId = "objlayer";
    
    // 1. Check if source exists
    const source = map.getSource(layerId);
    if (!source) {
      this.addOutput("ERROR: Source 'objlayer' does not exist!", "#ff0000");
      return;
    }
    
    // 2. Check features in source
    const features = source._data?.features || [];
    this.addOutput(`Features in source: ${features.length}`, "#00ff00");
    
    // 3. Check each feature's imageId
    features.forEach((f, idx) => {
      const props = f.properties || {};
      this.addOutput(`  Feature ${idx}:`, "#00aaff");
      this.addOutput(`    objectid: ${props.objectid}`, "#00aaff");
      this.addOutput(`    imageId: ${props.imageId}`, "#00aaff");
      if (!props.imageId) {
        this.addOutput(`    WARNING: No imageId set!`, "#ff0000");
      }
    });
    
    // 4. Check symbol layers
    const symbolLayerId = `${layerId}-symbols`;
    const symbolLayer = map.getLayer(symbolLayerId);
    if (!symbolLayer) {
      this.addOutput(`WARNING: Symbol layer '${symbolLayerId}' does not exist!`, "#ffff00");
      this.addOutput(`This might be normal if no images have been added yet.`, "#ffff00");
      
      // List all layers with this source
      const style = map.getStyle();
      const layersWithSource = style.layers.filter(l => l.source === layerId);
      this.addOutput(`Layers using source '${layerId}': ${layersWithSource.length}`, "#00aaff");
      layersWithSource.forEach(l => {
        this.addOutput(`  - ${l.id} (${l.type})`, "#00aaff");
      });
      return;
    }
    
    this.addOutput(`Symbol layer exists: ${symbolLayerId}`, "#00ff00");
    
    // 5. Check layout properties (with error handling)
    let iconImage, iconSize, iconAllowOverlap;
    try {
      iconImage = map.getLayoutProperty(symbolLayerId, 'icon-image');
      iconSize = map.getLayoutProperty(symbolLayerId, 'icon-size');
      iconAllowOverlap = map.getLayoutProperty(symbolLayerId, 'icon-allow-overlap');
    } catch (error) {
      this.addOutput(`Error getting layout properties: ${error.message}`, "#ff0000");
    }
    
    this.addOutput(`  icon-image: ${JSON.stringify(iconImage)}`, "#00aaff");
    this.addOutput(`  icon-size: ${iconSize}`, "#00aaff");
    this.addOutput(`  icon-allow-overlap: ${iconAllowOverlap}`, "#00aaff");
    
    // 6. Check loaded images
    const allImages = map.listImages();
    this.addOutput(`Total images loaded: ${allImages.length}`, "#00ff00");
    
    // Check for specific image IDs mentioned in features
    const uniqueImageIds = [...new Set(features.map(f => f.properties?.imageId).filter(id => id))];
    uniqueImageIds.forEach(imgId => {
      const hasImage = map.hasImage(imgId);
      this.addOutput(`  Image '${imgId}': ${hasImage ? 'LOADED' : 'NOT LOADED'}`, hasImage ? "#00ff00" : "#ff0000");
    });
    
    // 7. Check layer visibility
    const visibility = map.getLayoutProperty(symbolLayerId, 'visibility');
    this.addOutput(`Symbol layer visibility: ${visibility || 'visible'}`, "#00ff00");
    
    // 8. Check paint properties
    const iconOpacity = map.getPaintProperty(symbolLayerId, 'icon-opacity');
    this.addOutput(`Symbol layer icon-opacity: ${iconOpacity || 1}`, "#00ff00");
    
    // 9. Check layer order
    const layers = map.getStyle().layers;
    const symbolLayerIndex = layers.findIndex(l => l.id === symbolLayerId);
    const totalLayers = layers.length;
    this.addOutput(`Symbol layer position: ${symbolLayerIndex + 1} of ${totalLayers}`, "#00ff00");
    
    // Check if any layers are above it
    if (symbolLayerIndex < totalLayers - 1) {
      this.addOutput("  Layers above symbol layer:", "#ffff00");
      for (let i = symbolLayerIndex + 1; i < totalLayers; i++) {
        this.addOutput(`    - ${layers[i].id} (${layers[i].type})`, "#ffff00");
      }
    }
    
  } catch (error) {
    this.addOutput(`Error during verification: ${error.message}`, "#ff0000");
  }
};

// Test paste.txt content
EnhancedCommandLine.prototype.handleTestPasteCommand = function () {
  this.addOutput(
    "Executing feature creation from paste.txt content...",
    "#00aaff"
  );

  try {
    // Paste commands from paste.txt
    this.addOutput("Executing 10 sample commands from paste.txt", "#aaaaaa");

    // First test command
    window.interface.addFeature(
      "objectLayer",
      "ab422c24-c366-424b-94dc-d657af1d79dc",
      JSON.parse(
        '{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[14.22233878,46.62616327]},{"type":"Point","coordinates":[14.22194986,46.62612274]},{"type":"Point","coordinates":[14.22203033,46.62601591]},{"type":"Point","coordinates":[14.22225563,46.62619827]}]}'
      ),
      JSON.parse(
        '{"line-width":12,"circle-color":"#047DBD","line-color":"#047DBD","fill-color":"#047DBD"}'
      )
    );
    this.addOutput("Added multi-point feature", "#00ff00");

    // Second test command with polygon
    window.interface.addFeature(
      "objectLayer",
      "8d4cf201-3678-4ae7-924b-c14161a50ad7",
      JSON.parse(
        '{"type":"GeometryCollection","geometries":[{"type":"Polygon","coordinates":[[[14.22194986,46.62612274],[14.22225563,46.62619827],[14.22233878,46.62616327],[14.22203033,46.62601591],[14.22194986,46.62612274]]]}]}'
      ),
      JSON.parse(
        '{"fill-color":"#51BAF2","line-width":2,"circle-color":"#51BAF2","line-color":"#51BAF2"}'
      )
    );
    this.addOutput("Added polygon feature", "#00ff00");

    // Third test command with line
    window.interface.addFeature(
      "objectLayer",
      "828dadef-2143-42be-9cc3-46f187ce60f6",
      JSON.parse(
        '{"type":"GeometryCollection","geometries":[{"type":"LineString","coordinates":[[14.22248036,46.62611196,499.6],[14.22255009,46.6259738,498.6],[14.2227003,46.62577855],[14.22287732,46.62563487,493.1]]}]}'
      ),
      JSON.parse(
        '{"line-width":3,"circle-color":"#FF0000","line-color":"#FF0000","fill-color":"#FF0000"}'
      )
    );

    window.interface.addFeature(
      "objectLayer",
      "8621fb98-d2c4-4116-a8a7-62ab8bf5e01f",
      JSON.parse(
        '{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[14.2230515,46.6263414]},{"type":"Point","coordinates":[14.22306299,46.62643808]}]}'
      ),
      "data:image/jpeg;base64, iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAD5SURBVFiFY2AY6YARxjA2Nv7PwMDA4Kr07gA9LN59T8iBgYGBgYkeluED8BAwNYGEwL//EL65zCeaWHjyCR8DAwMDAxPUZhaEFMTmM2nnGBgYGBhMZhlD+WepYjG6eWazjSAOoYrpFAAWXBIwl5rMMqYoFAiF5OANARg4k3aW7PRATOgN/hBgYEBND8h8XICUECPKAcQ6hJyoGhpRgA7QQwJdnBQw4CEw6oBRB5CVC6hZDpDkAEIWkFpiMjAMlSggNWhJaUsM/hCgpEVETFti8IYAtVrFhHIGzn6BlSxt+gXHHqP2CwZPFMB8Tuu+oavSOwYGhkHUNwQA6cRva4swY5oAAAAASUVORK5CYII=",
      "32"
    );
    window.interface.addImageFeature(
      "objlayer",
      "955c0193-ac25-4902-a65f-a7256026120a",
      JSON.parse(
        '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[14.2224928,46.6264901,499.6000061]},"id":"2895ae25-32f2-4c3c-8ac0-638f172fede1","class":{"categoryId":"955c0193-ac25-4902-a65f-a7256026120a","categoryName":"50er"},"properties":{"name":"50er","type":"Point"},"sensors":[{"deviceType":"Smartphone","deviceName":"Galaxy Tab Active5 5G","deviceModel":"SM-X306B","deviceVersion":"34"}]}]}'
      ),
      "data:image/jpeg;base64, iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAQ8SURBVFiFpVddSBxXFP7O3T+NS+Kua6R1J2l2NdRAC4U+V6RCwBRaSWkLSpC2kTYpGIgQiuSteUgrRUqh5ClWU7oWKtKE9MUQ8txHKaSpGmtWC1FnF91dO7Ozc/oQdzJ3ZieO+sGFOT/3fOeeuZx7L2EPeNp8KhqMaL8AOB0iEoEdvQlAY2aC+aCIQ2eV7J+q35jkx0ltTY80BsRXedP0FbRRCORhfh1fXrhyoATU1vYzEcF3NGZfxE6EiKCZOJdYmZ/ccwJqMrUGUGJfzC4SLsWyiw2+ElhVUm/WM/1Ra82saai/fAl1gx+DYjHZtrkJ7eYESteugyKRmokYQM/R7MLvL0wgl0y7C24YqBu5gvovPq8Z2Alt4ieUhr8EImFJTwBi2QVy6uzkTxlotuvYMBD/d8kXsRO54ycB98Ytx7MLVmai+qEmUz1OchFr3Dc5AMT+eQTxynGnOrSupKxSWhUoKm0s7XbDQOwA5HbkUq8CZcOSw0SIPpknYKcCqpIe8SIvl8ueww4iskYmk5FsscWHgK5bss4MNXnihqUwlXZWk2lrbH//A1cBwHO8yGd7e5vt0GZuSxy60s4AIDba2g7n+flGYU1D3cXPXGVMJBJoamqyRjwed/kwMwYGBgAAfX19ki387jvgYtGSC2xio7UtKahUmbI71l8ecgUGgLW1Nayvr1tjY2Ojpl93dzcAIJvNumwN330rJwy+K1iI03ZlZPCTmoHL5TIymYwnsR+EP3xfkqNCvBYME1HZtgGFo8NZk8NyU6lUKhBC1PT1AoVCkmyAYR2pu6G3txf9/f2WHAj4nekNE7ZG5IWhoSEwM6anpzE5OYnl5WXLtrq6euAkRGUXh7GxMUlWFMX6Hh8fPxg5AKGzfPbw5pbvALqtufhCRV5uEIAgmA/sSu3mj77jdXV17Ylfm7ktyUXmR6KIQ2ftytK165ITEWF4eFiSq+js7HSRzM7OApB/lUV4/oIkB4h6AADmMbkV/zdxi5mZR0dHPdvw3Nyc1WaJyGUvFotSK9bv3a/ZigEAeaX9G7tRPapYE5eWlrilpcUK3NHRwaZpshNCCMsnk8m47GoiKSWgKukpwHYcF5Q21u37kQix5b9dZdwP8qfeAG8939xBIhy2H8cAoLPZL81ixuZbbx+YfOu9DyRyANDBV6vf0pUsn0wVTJB8ew0GEXv8cF/kzpUDQIAIR3ZWDzg6YWN2MeqKYhjItRyD/tsd38Tle/eRa1Zc5AAkclcCO+hxXZXDYRQvXoIafwnarZ8Bx22omqj26wzUppdRGDgP1Lmv5oZpfurUeT9MWlM6iEJe9r0gAOCI4zpehedhFF9ZDIPoQsjf87EmggBMMq96kQN+H6fJEzeiFBwssL/HaZQECqYxFV95/NFuvntaXil5snUblbsNRK8beHaeA8/KGARQYv5LEJ1pfDK/4Dfm//V1T7xVvYCXAAAAAElFTkSuQmCC",
      "32"
    );

    this.addOutput("Added line feature", "#00ff00");

    window.interface.addImageFeature(
      "objlayer",
      "955c0193-ac25-4902-a65f-a7256026120a",
      JSON.parse(
        '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[14.2224928,46.6264901,499.6000061]},"id":"2895ae25-32f2-4c3c-8ac0-638f172fede1","class":{"categoryId":"955c0193-ac25-4902-a65f-a7256026120a","categoryName":"50er"},"properties":{"name":"50er","type":"Point"},"sensors":[{"deviceType":"Smartphone","deviceName":"Galaxy Tab Active5 5G","deviceModel":"SM-X306B","deviceVersion":"34"}]},{"type":"Feature","geometry":{"type":"Point","coordinates":[14.2225952,46.6264167,499.5]},"id":"79d4e200-1155-47ee-bf7d-b0108fb8bac7","class":{"categoryId":"955c0193-ac25-4902-a65f-a7256026120a","categoryName":"50er"},"properties":{"name":"50er","type":"Point"},"sensors":[{"deviceType":"Smartphone","deviceName":"Galaxy Tab Active5 5G","deviceModel":"SM-X306B","deviceVersion":"34"}]}]}'
      ),
      "data:image/jpeg;base64, iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAQ8SURBVFiFpVddSBxXFP7O3T+NS+Kua6R1J2l2NdRAC4U+V6RCwBRaSWkLSpC2kTYpGIgQiuSteUgrRUqh5ClWU7oWKtKE9MUQ8txHKaSpGmtWC1FnF91dO7Ozc/oQdzJ3ZieO+sGFOT/3fOeeuZx7L2EPeNp8KhqMaL8AOB0iEoEdvQlAY2aC+aCIQ2eV7J+q35jkx0ltTY80BsRXedP0FbRRCORhfh1fXrhyoATU1vYzEcF3NGZfxE6EiKCZOJdYmZ/ccwJqMrUGUGJfzC4SLsWyiw2+ElhVUm/WM/1Ra82saai/fAl1gx+DYjHZtrkJ7eYESteugyKRmokYQM/R7MLvL0wgl0y7C24YqBu5gvovPq8Z2Alt4ieUhr8EImFJTwBi2QVy6uzkTxlotuvYMBD/d8kXsRO54ycB98Ytx7MLVmai+qEmUz1OchFr3Dc5AMT+eQTxynGnOrSupKxSWhUoKm0s7XbDQOwA5HbkUq8CZcOSw0SIPpknYKcCqpIe8SIvl8ueww4iskYmk5FsscWHgK5bss4MNXnihqUwlXZWk2lrbH//A1cBwHO8yGd7e5vt0GZuSxy60s4AIDba2g7n+flGYU1D3cXPXGVMJBJoamqyRjwed/kwMwYGBgAAfX19ki387jvgYtGSC2xio7UtKahUmbI71l8ecgUGgLW1Nayvr1tjY2Ojpl93dzcAIJvNumwN330rJwy+K1iI03ZlZPCTmoHL5TIymYwnsR+EP3xfkqNCvBYME1HZtgGFo8NZk8NyU6lUKhBC1PT1AoVCkmyAYR2pu6G3txf9/f2WHAj4nekNE7ZG5IWhoSEwM6anpzE5OYnl5WXLtrq6euAkRGUXh7GxMUlWFMX6Hh8fPxg5AKGzfPbw5pbvALqtufhCRV5uEIAgmA/sSu3mj77jdXV17Ylfm7ktyUXmR6KIQ2ftytK165ITEWF4eFiSq+js7HSRzM7OApB/lUV4/oIkB4h6AADmMbkV/zdxi5mZR0dHPdvw3Nyc1WaJyGUvFotSK9bv3a/ZigEAeaX9G7tRPapYE5eWlrilpcUK3NHRwaZpshNCCMsnk8m47GoiKSWgKukpwHYcF5Q21u37kQix5b9dZdwP8qfeAG8939xBIhy2H8cAoLPZL81ixuZbbx+YfOu9DyRyANDBV6vf0pUsn0wVTJB8ew0GEXv8cF/kzpUDQIAIR3ZWDzg6YWN2MeqKYhjItRyD/tsd38Tle/eRa1Zc5AAkclcCO+hxXZXDYRQvXoIafwnarZ8Bx22omqj26wzUppdRGDgP1Lmv5oZpfurUeT9MWlM6iEJe9r0gAOCI4zpehedhFF9ZDIPoQsjf87EmggBMMq96kQN+H6fJEzeiFBwssL/HaZQECqYxFV95/NFuvntaXil5snUblbsNRK8beHaeA8/KGARQYv5LEJ1pfDK/4Dfm//V1T7xVvYCXAAAAAElFTkSuQmCC",
      32
    );

    window.interface.addImageFeature(
      "objlayer",
      "8a4e0469-06b1-4bed-b440-0527dd672477",
      JSON.parse(
        '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[14.22285855,46.62628326]},"id":"5854dd9d-9d0b-4c35-ae23-28a72f937def","class":{"categoryId":"8a4e0469-06b1-4bed-b440-0527dd672477","categoryName":"Lichtpunkt"},"properties":{"name":"Lichtpunkt","type":"Point","L_Nummer":"00,00,00","text8":"SK 00"},"sensors":[{"deviceType":"Smartphone","deviceName":"Galaxy Tab Active5 5G","deviceModel":"SM-X306B","deviceVersion":"34"}]}]}'
      ),
      "data:image/jpeg;base64, iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAFcSURBVFiF5ZfNTcNAEIW/iSKupANCB9ABHUAHEAlh6IIuwAgpTgVAB3QAHRA6CFeEGA47dqzYZu3gn5V4p/V6PW/0Zrz7Fv47pMlinTMB4JMjmzrYWPIKwA7PADJj5Ys5apJAF/AqoDdMGXFtj6cN4y/4dt/KFctGCWjMiQ3nYNJvh7QMMwCJeMy/DK8EemeNpbx0xHgIIBeuYQdXYFyYUR46ZVzH34cAFMh6QOPsF0t64j6DfAnETaA90Rvf4CVYK6CFfb0SEv3+XuMaQYwvIAX+tt1ugwkEpkB6aPSlxAqCUkDMzWjmdipRq8t9ML78b5jugN4EWoHxDV6Coh+IebPhtCPOJYBEgZyGZX7AecG0KduGZl4TCECBald8y7GtSGjDFas7fuWSp1oJZIncs8eX3QtSz1AXSsLY7gXnvJctCbcEZdCYXTewzUo2PIRa44rdDSM+fDEHV+AHhQdITVSXPQ8AAAAASUVORK5CYII=",
      32
    );

    window.interface.addImageFeature(
      "objlayer",
      "cc6290f8-69af-4dcc-932e-431e9a0b1ba5",
      JSON.parse(
        '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[14.2227177,46.62672984,332]},"id":"888114da-d06d-44a5-8a80-7450a169abc8","class":{"categoryId":"cc6290f8-69af-4dcc-932e-431e9a0b1ba5","categoryName":"Telefonmast"},"properties":{"name":"Telefonmast","type":"Point"},"sensors":[{"deviceType":"Smartphone","deviceName":"Galaxy Tab Active5 5G","deviceModel":"SM-X306B","deviceVersion":"34"}]}]}'
      ),
      "data:image/jpeg;base64, iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAABEWlDQ1BTa2lhAAAYlWNgYHzAAAQsBgwMuXklRUHuTgoRkVEK7A8YGIEQDBKTiwsYcAOgqm/XIGov6+JRhwtwpqQWJwPpD0AcUgS0HGikC5Atkg5hR4DYSRB2DohdXlJQAmQ3gNhFIUHOQPYUIFsgHYmdhMROLigCqV8CZNvk5pQmI9zNwJOaFxoMpC2AWIahmCGIwZ3BiUEBSCYy5DKUMpQA2eUMmUA6A8gyYtADYgWGEIYioHweUH0aQyoDyMkKECPzFwON+srAwDwBIZY0i4FhexsDg8QthJjKAgYG/hYGhm0XEGKIMCxILEqEhw6TsTEONyuA3ezOkA+E6Qw5QJcoMHgCXZUMdCXIrQYMhgxmAG93RTta6qDiAAAAA3NCSVQICAjb4U/gAAABLklEQVRIic1WwQ2DMAw0FW/ebEDG6BKVOkbFAjBB1Ue36Ap9MEZG4M0C7qMtGGInNlWk+kd09t3FTkKBiJAzDlmr2wl6B73LSWAPC8Gs3WLifxxsVKtNWJvsoR1MGQUiWgfDoOZDkIa6OUFcEUKxRRF/Cuv6JvvY536CpMYUQOeA1aszESVQTlcUpmmyrPSnKTIdDhmcbHJKYwogEOw420JKvMm6YY/COIL40TUe7IBgGnldtHRII5sICK5HhpJVrVssed5ZEU1gblNyp/aepVxf18smeLG0pJemEDzZosdFzAQA/1xUzz3YeKrqqIPQ4Caf7ls4AkJuySPU1/0KT4tM49tQMEWnG1/9fFe8DSTxO43rR98qXGRyAADtAFUNiIhdgzmiaxBR91fxQ7wAsm/SZ0H+UZoAAAAASUVORK5CYII=",
      32
    );

    this.addOutput("Added image features", "#00ff00");

    this.addOutput("Test paste commands completed successfully", "#00ff00");
    this.addOutput("Check the map for new features", "#aaaaaa");
  } catch (error) {
    this.addOutput(`Error in test paste command: ${error.message}`, "#ff0000");
    console.error("Test paste error:", error);

    // Try to give more specific error information
    if (error.message.includes("JSON")) {
      this.addOutput(
        "This appears to be a JSON parsing error. Check the format of your GeoJSON data.",
        "#ffaa00"
      );
    } else if (error.message.includes("undefined")) {
      this.addOutput(
        "This appears to be a reference error. Some object or function is undefined.",
        "#ffaa00"
      );
    }
  }
};

// Expose a tracing function for addFeature
EnhancedCommandLine.prototype.wrapAddFeature = function () {
  this.addOutput("Installing addFeature trace wrapper...", "#00aaff");

  try {
    // Store the original function
    if (!window._originalAddFeature && window.interface) {
      window._originalAddFeature = window.interface.addFeature;

      // Replace with wrapped version
      window.interface.addFeature = (layerId, objectId, geojson, style) => {
        console.log("addFeature called with:", {
          layerId,
          objectId,
          geojson: typeof geojson === "string" ? "JSON string" : geojson,
          style: typeof style === "string" ? "JSON string" : style,
        });

        // Try to determine if App.Map.Layers is available
        let usingModules = false;
        if (
          App &&
          App.Map &&
          App.Map.Layers &&
          typeof App.Map.Layers.addFeature === "function"
        ) {
          usingModules = true;
          console.log("Using App.Map.Layers.addFeature module");
        } else {
          console.log("App.Map.Layers module not available");
        }

        try {
          // Call the original function
          const result = window._originalAddFeature(
            layerId,
            objectId,
            geojson,
            style
          );
          console.log("addFeature call succeeded");
          return result;
        } catch (error) {
          console.error("Error in addFeature:", error);
          throw error;
        }
      };

      this.addOutput("addFeature trace wrapper installed", "#00ff00");
      this.addOutput(
        "All calls to addFeature will now be logged to console",
        "#00ff00"
      );
    } else {
      this.addOutput(
        "Trace wrapper already installed or interface not available",
        "#ffaa00"
      );
    }
  } catch (error) {
    this.addOutput(
      `Error installing trace wrapper: ${error.message}`,
      "#ff0000"
    );
  }
};

// Wait for the command line to be initialized
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    // Check if the command line interface is initialized
    if (window.mapConsole) {
      // Add our commands to the existing command line
      extendCommandLine();
      console.log("Command line extended with feature testing functionality");
    } else {
      console.warn(
        "Command line interface not found, waiting for initialization"
      );

      // Try again after a delay
      setTimeout(function () {
        if (window.mapConsole) {
          extendCommandLine();
          console.log(
            "Command line extended with feature testing functionality (delayed)"
          );
        } else {
          // Create a button to initialize command line and extend it
          //createManualInitButton();
        }
      }, 2000);
    }
  }, 1000);
});

// Function to extend the command line with our new commands
function extendCommandLine() {
  // Find the EnhancedCommandLine instance
  const commandLineInstance = window.mapConsole._commandLineInstance;

  if (!commandLineInstance) {
    console.error("Command line instance not found");
    return;
  }

  // Add our test commands
  commandLineInstance.processCommand = extendProcessCommand(
    commandLineInstance.processCommand
  );

  // Add our command handlers
  commandLineInstance.handleTestFeatureCommand = function (args) {
    try {
      this.addOutput("Starting test feature command...", "#00aaff");

      // Default parameters
      const layerId = args[0] || "testLayer";
      const objectId = args[1] || "test-" + Date.now();

      // Create a test GeoJSON object - start with a simple point
      const testPoint = {
        type: "GeometryCollection",
        geometries: [
          {
            type: "Point",
            coordinates: [
              // Use current map center if available, or default coordinates
              window.interface && window.interface.map
                ? window.interface.map.getCenter().lng
                : 14.222929,
              window.interface && window.interface.map
                ? window.interface.map.getCenter().lat
                : 46.626328,
            ],
          },
        ],
      };

      // Style for the test feature
      const testStyle = {
        "circle-color": "#FF0000",
        "circle-radius": 8,
        "line-width": 3,
        "line-color": "#FF0000",
        "fill-color": "#FF0000",
        "fill-opacity": 0.5,
      };

      this.addOutput(
        `Adding test feature to layer '${layerId}' with ID '${objectId}'`,
        "#00aaff"
      );

      // Log input parameters for debugging
      this.addOutput("GeoJSON input:", "#aaaaaa");
      this.addOutput(JSON.stringify(testPoint, null, 2), "#dddddd");
      this.addOutput("Style input:", "#aaaaaa");
      this.addOutput(JSON.stringify(testStyle, null, 2), "#dddddd");

      // Check if the interface is available
      if (!window.interface) {
        this.addOutput("ERROR: window.interface is not available!", "#ff0000");
        return;
      }

      // Check if addFeature function exists
      if (typeof window.interface.addFeature !== "function") {
        this.addOutput(
          "ERROR: window.interface.addFeature is not a function!",
          "#ff0000"
        );
        return;
      }

      // First, create the layer if needed
      if (typeof window.interface.createLayer === "function") {
        this.addOutput(
          `Creating layer '${layerId}' if it doesn't exist...`,
          "#aaaaaa"
        );
        window.interface.createLayer(layerId);
      }

      // Log the bridge implementation
      this.addOutput("Checking bridge implementation:", "#aaaaaa");
      if (App && App.Map && App.Map.Layers) {
        this.addOutput("App.Map.Layers is available", "#00ff00");

        if (typeof App.Map.Layers.addFeature === "function") {
          this.addOutput("App.Map.Layers.addFeature is available", "#00ff00");
        } else {
          this.addOutput(
            "WARNING: App.Map.Layers.addFeature is not a function!",
            "#ffaa00"
          );
        }
      } else {
        this.addOutput("WARNING: App.Map.Layers module not found", "#ffaa00");
      }

      // Try using JSON strings like in paste.txt
      try {
        this.addOutput("Trying with JSON strings...", "#ffaa00");
        window.interface.addFeature(
          layerId,
          objectId,
          JSON.stringify(testPoint),
          JSON.stringify(testStyle)
        );
        this.addOutput("Called with JSON strings successfully", "#00ff00");
      } catch (stringError) {
        this.addOutput(
          `Error with JSON strings: ${stringError.message}`,
          "#ff0000"
        );

        // Try direct call if JSON strings fail
        try {
          this.addOutput("Trying direct objects instead...", "#ffaa00");
          window.interface.addFeature(layerId, objectId, testPoint, testStyle);
          this.addOutput(
            "Called window.interface.addFeature directly",
            "#00ff00"
          );
        } catch (error) {
          this.addOutput(`Error in direct call: ${error.message}`, "#ff0000");
        }
      }

      // Try adding a polygon too
      try {
        const polygonId = objectId + "-polygon";

        // Create a small polygon around current point
        const center = testPoint.geometries[0].coordinates;
        const polygonGeoJson = {
          type: "GeometryCollection",
          geometries: [
            {
              type: "Polygon",
              coordinates: [
                [
                  [center[0] - 0.0002, center[1] - 0.0002],
                  [center[0] + 0.0002, center[1] - 0.0002],
                  [center[0] + 0.0002, center[1] + 0.0002],
                  [center[0] - 0.0002, center[1] + 0.0002],
                  [center[0] - 0.0002, center[1] - 0.0002],
                ],
              ],
            },
          ],
        };

        this.addOutput(
          `\nAdding test polygon with ID '${polygonId}'`,
          "#00aaff"
        );
        window.interface.addFeature(
          layerId,
          polygonId,
          polygonGeoJson,
          testStyle
        );
        this.addOutput("Polygon added successfully", "#00ff00");
      } catch (polyError) {
        this.addOutput(`Error adding polygon: ${polyError.message}`, "#ff0000");
      }

      this.addOutput("\nTest feature command completed", "#00ff00");
      this.addOutput("Check the map for new features", "#aaaaaa");

      // Suggestion for next steps
      this.addOutput("\nFor further debugging, try:", "#aaaaaa");
      this.addOutput("testpaste - To test features from paste.txt", "#ffffff");
    } catch (error) {
      this.addOutput(
        `Error in test feature command: ${error.message}`,
        "#ff0000"
      );
      console.error("Test feature error:", error);
    }
  };

  commandLineInstance.handleTestPasteCommand = function () {
    this.addOutput(
      "Executing feature creation from paste.txt content...",
      "#00aaff"
    );

    try {
      // Make sure the layer exists
      if (typeof window.interface.createLayer === "function") {
        window.interface.createLayer("objectLayer");
      }

      // First test command
      window.interface.addFeature(
        "objectLayer",
        "ab422c24-c366-424b-94dc-d657af1d79dc",
        JSON.parse(
          '{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[14.22233878,46.62616327]},{"type":"Point","coordinates":[14.22194986,46.62612274]},{"type":"Point","coordinates":[14.22203033,46.62601591]},{"type":"Point","coordinates":[14.22225563,46.62619827]}]}'
        ),
        JSON.parse(
          '{"line-width":12,"circle-color":"#047DBD","line-color":"#047DBD","fill-color":"#047DBD"}'
        )
      );
      this.addOutput("Added multi-point feature", "#00ff00");

      // Second test command with polygon
      window.interface.addFeature(
        "objectLayer",
        "8d4cf201-3678-4ae7-924b-c14161a50ad7",
        JSON.parse(
          '{"type":"GeometryCollection","geometries":[{"type":"Polygon","coordinates":[[[14.22194986,46.62612274],[14.22225563,46.62619827],[14.22233878,46.62616327],[14.22203033,46.62601591],[14.22194986,46.62612274]]]}]}'
        ),
        JSON.parse(
          '{"fill-color":"#51BAF2","line-width":2,"circle-color":"#51BAF2","line-color":"#51BAF2"}'
        )
      );
      this.addOutput("Added polygon feature", "#00ff00");

      // Third test command with line
      window.interface.addFeature(
        "objectLayer",
        "828dadef-2143-42be-9cc3-46f187ce60f6",
        JSON.parse(
          '{"type":"GeometryCollection","geometries":[{"type":"LineString","coordinates":[[14.22248036,46.62611196],[14.22255009,46.6259738],[14.2227003,46.62577855],[14.22287732,46.62563487]]}]}'
        ),
        JSON.parse(
          '{"line-width":3,"circle-color":"#FF0000","line-color":"#FF0000","fill-color":"#FF0000"}'
        )
      );
      this.addOutput("Added line feature", "#00ff00");

      this.addOutput("Test paste commands completed successfully", "#00ff00");
      this.addOutput("Check the map for new features", "#aaaaaa");
    } catch (error) {
      this.addOutput(
        `Error in test paste command: ${error.message}`,
        "#ff0000"
      );
      console.error("Test paste error:", error);

      // Try to give more specific error information
      if (error.message.includes("JSON")) {
        this.addOutput(
          "This appears to be a JSON parsing error. Check the format of your GeoJSON data.",
          "#ffaa00"
        );
      } else if (error.message.includes("undefined")) {
        this.addOutput(
          "This appears to be a reference error. Some object or function is undefined.",
          "#ffaa00"
        );
      }
    }
  };

  commandLineInstance.wrapAddFeature = function () {
    this.addOutput("Installing addFeature trace wrapper...", "#00aaff");

    try {
      // Store the original function
      if (!window._originalAddFeature && window.interface) {
        window._originalAddFeature = window.interface.addFeature;

        // Replace with wrapped version
        window.interface.addFeature = (layerId, objectId, geojson, style) => {
          console.log("addFeature called with:", {
            layerId,
            objectId,
            geojson: typeof geojson === "string" ? "JSON string" : geojson,
            style: typeof style === "string" ? "JSON string" : style,
          });

          // Try to determine if App.Map.Layers is available
          let usingModules = false;
          if (
            App &&
            App.Map &&
            App.Map.Layers &&
            typeof App.Map.Layers.addFeature === "function"
          ) {
            usingModules = true;
            console.log("Using App.Map.Layers.addFeature module");
          } else {
            console.log("App.Map.Layers module not available");
          }

          try {
            // Call the original function
            const result = window._originalAddFeature(
              layerId,
              objectId,
              geojson,
              style
            );
            console.log("addFeature call succeeded");
            return result;
          } catch (error) {
            console.error("Error in addFeature:", error);
            throw error;
          }
        };

        this.addOutput("addFeature trace wrapper installed", "#00ff00");
        this.addOutput(
          "All calls to addFeature will now be logged to console",
          "#00ff00"
        );
      } else {
        this.addOutput(
          "Trace wrapper already installed or interface not available",
          "#ffaa00"
        );
      }
    } catch (error) {
      this.addOutput(
        `Error installing trace wrapper: ${error.message}`,
        "#ff0000"
      );
    }
  };

  commandLineInstance.fixAddFeature = function () {
    this.addOutput("Installing addFeature fix...", "#00aaff");

    try {
      // Don't overwrite if already fixed
      if (window._fixedAddFeature) {
        this.addOutput("addFeature fix already installed", "#ffaa00");
        return;
      }

      // Store the original function
      if (window.interface) {
        window._originalAddFeatureFn = window.interface.addFeature;
        window._fixedAddFeature = true;

        // Replace with enhanced version
        window.interface.addFeature = function (
          layerId,
          objectid,
          geojson,
          style
        ) {
          console.log("Fixed addFeature called with:", {
            layerId: layerId,
            objectid: objectid,
            geojsonType: typeof geojson,
            styleType: typeof style,
          });

          // Handle string JSON from Java Bridge
          let parsedGeojson = geojson;
          let parsedStyle = style;

          // Parse JSON strings if needed (from Java)
          if (typeof geojson === "string") {
            try {
              parsedGeojson = JSON.parse(geojson);
              console.log("Successfully parsed GeoJSON string");
            } catch (e) {
              console.error("Error parsing GeoJSON string:", e);
              return false; // Return false to indicate failure
            }
          }

          if (typeof style === "string") {
            try {
              parsedStyle = JSON.parse(style);
              console.log("Successfully parsed style string");
            } catch (e) {
              console.error("Error parsing style string:", e);
              return false; // Return false to indicate failure
            }
          }

          // Try to use App.Map.Layers if available
          if (
            App.Map.Layers &&
            typeof App.Map.Layers.addFeature === "function"
          ) {
            console.log("Using App.Map.Layers.addFeature");
            try {
              return App.Map.Layers.addFeature(
                layerId,
                objectid,
                parsedGeojson,
                parsedStyle
              );
            } catch (e) {
              console.error("Error in App.Map.Layers.addFeature:", e);
              // Continue with fallback implementation if App.Map.Layers fails
            }
          } else {
            console.log(
              "App.Map.Layers.addFeature not available, using fallback"
            );
          }

          // Fallback implementation if App.Map.Layers is not available or fails
          try {
            console.log("Setting up fallback implementation for addFeature");

            // Create layer if it doesn't exist
            let source = this.map.getSource(layerId);
            if (!source) {
              console.log(`Creating new source for layer: ${layerId}`);
              this.map.addSource(layerId, {
                type: "geojson",
                data: {
                  type: "FeatureCollection",
                  features: [],
                },
              });
              source = this.map.getSource(layerId);
            }

            // Prepare data for source update
            let data = source._data || {
              type: "FeatureCollection",
              features: [],
            };

            // Process the features based on GeoJSON type
            const features = [];

            if (parsedGeojson.type === "FeatureCollection") {
              // Process all features in the collection
              parsedGeojson.features.forEach((feature) => {
                if (!feature.properties) {
                  feature.properties = {};
                }
                feature.properties.objectid = objectid;
                feature.properties.styleId = objectid;
                features.push(feature);
              });
            } else if (parsedGeojson.type === "GeometryCollection") {
              // Convert GeometryCollection to Features
              parsedGeojson.geometries.forEach((geometry) => {
                features.push({
                  type: "Feature",
                  geometry: geometry,
                  properties: {
                    objectid: objectid,
                    styleId: objectid,
                  },
                });
              });
            } else if (parsedGeojson.type === "Feature") {
              // Single Feature
              if (!parsedGeojson.properties) {
                parsedGeojson.properties = {};
              }
              parsedGeojson.properties.objectid = objectid;
              parsedGeojson.properties.styleId = objectid;
              features.push(parsedGeojson);
            } else {
              // Raw geometry
              features.push({
                type: "Feature",
                geometry: {
                  type: parsedGeojson.type,
                  coordinates: parsedGeojson.coordinates,
                },
                properties: {
                  objectid: objectid,
                  styleId: objectid,
                },
              });
            }

            // Remove any existing features with this objectid
            data.features = data.features.filter(
              (feature) =>
                !(
                  feature.properties && feature.properties.objectid === objectid
                )
            );

            // Add the new features
            data.features = data.features.concat(features);

            // Update the source data
            source.setData(data);

            // Ensure style layers exist for the feature types
            if (typeof this._ensureStyleLayersForFeatures === "function") {
              this._ensureStyleLayersForFeatures(
                layerId,
                features,
                parsedStyle
              );
            } else {
              console.warn("_ensureStyleLayersForFeatures not available");
              this._ensureBasicStyleLayers(layerId, features, parsedStyle);
            }

            console.log(
              `Successfully added ${features.length} features to layer: ${layerId}`
            );
            return true;
          } catch (e) {
            console.error("Error in fallback addFeature implementation:", e);
            return false;
          }
        };

        // Add a basic style layer ensure method if not available
        if (
          typeof window.interface._ensureStyleLayersForFeatures !== "function"
        ) {
          window.interface._ensureBasicStyleLayers = function (
            layerId,
            features,
            style
          ) {
            // Determine which geometry types are present
            let hasPoint = false;
            let hasLine = false;
            let hasPolygon = false;

            features.forEach((feature) => {
              const geomType = feature.geometry.type;
              if (geomType === "Point" || geomType === "MultiPoint") {
                hasPoint = true;
              } else if (
                geomType === "LineString" ||
                geomType === "MultiLineString"
              ) {
                hasLine = true;
              } else if (
                geomType === "Polygon" ||
                geomType === "MultiPolygon"
              ) {
                hasPolygon = true;
              }
            });

            // Create layer properties based on geometry types
            if (hasPoint && !this.map.getLayer(`${layerId}-points`)) {
              this.map.addLayer({
                id: `${layerId}-points`,
                type: "circle",
                source: layerId,
                filter: [
                  "any",
                  ["==", ["geometry-type"], "Point"],
                  ["==", ["geometry-type"], "MultiPoint"],
                ],
                paint: {
                  "circle-radius":
                    style?.radius || style?.["circle-radius"] || 6,
                  "circle-color": style?.["circle-color"] || "#FF0000",
                  "circle-stroke-color":
                    style?.["circle-stroke-color"] || "#000000",
                  "circle-stroke-width": style?.["circle-stroke-width"] || 2,
                  "circle-opacity": style?.opacity || 1,
                },
              });
            }

            if (hasLine && !this.map.getLayer(`${layerId}-lines`)) {
              this.map.addLayer({
                id: `${layerId}-lines`,
                type: "line",
                source: layerId,
                filter: [
                  "any",
                  ["==", ["geometry-type"], "LineString"],
                  ["==", ["geometry-type"], "MultiLineString"],
                ],
                paint: {
                  "line-color": style?.["line-color"] || "#FF0000",
                  "line-width": style?.["line-width"] || 2,
                  "line-opacity": style?.opacity || 1,
                },
              });
            }

            if (hasPolygon) {
              if (!this.map.getLayer(`${layerId}-polygons-fill`)) {
                this.map.addLayer({
                  id: `${layerId}-polygons-fill`,
                  type: "fill",
                  source: layerId,
                  filter: [
                    "any",
                    ["==", ["geometry-type"], "Polygon"],
                    ["==", ["geometry-type"], "MultiPolygon"],
                  ],
                  paint: {
                    "fill-color": style?.["fill-color"] || "#FF0000",
                    "fill-opacity": style?.["fill-opacity"] || 0.25,
                  },
                });
              }

              if (!this.map.getLayer(`${layerId}-polygons-stroke`)) {
                this.map.addLayer({
                  id: `${layerId}-polygons-stroke`,
                  type: "line",
                  source: layerId,
                  filter: [
                    "any",
                    ["==", ["geometry-type"], "Polygon"],
                    ["==", ["geometry-type"], "MultiPolygon"],
                  ],
                  paint: {
                    "line-color": style?.["line-color"] || "#000000",
                    "line-width": style?.["line-width"] || 2,
                    "line-opacity": style?.opacity || 1,
                  },
                });
              }
            }
          };
        }

        this.addOutput("addFeature fix installed successfully", "#00ff00");
        this.addOutput(
          "The function now handles both object and string inputs",
          "#00ff00"
        );
      } else {
        this.addOutput("ERROR: window.interface is not available!", "#ff0000");
      }
    } catch (error) {
      this.addOutput(
        `Error installing addFeature fix: ${error.message}`,
        "#ff0000"
      );
    }
  };

  // Display a message that the commands have been added
  commandLineInstance.addOutput("Feature testing commands added:", "#00ff00");
  commandLineInstance.addOutput(
    "  testfeature [layerId] [objectId] - Add test features to map",
    "#ffffff"
  );
  commandLineInstance.addOutput(
    "  testpaste - Test with paste.txt examples",
    "#ffffff"
  );
  commandLineInstance.addOutput(
    "  trace - Trace all addFeature calls",
    "#ffffff"
  );
  commandLineInstance.addOutput(
    "  fixfeature - Apply enhanced addFeature implementation",
    "#ffffff"
  );
  commandLineInstance.addOutput(
    "Try 'fixfeature' first to resolve Java/JS compatibility issues",
    "#ffaa00"
  );
}

// Function to extend the processCommand method with our new commands
function extendProcessCommand(originalProcessCommand) {
  return function (command) {
    const parts = command.split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Handle our custom commands
    switch (cmd) {
      case "testfeature":
        this.handleTestFeatureCommand(args);
        break;

      case "testpaste":
        this.handleTestPasteCommand();
        break;

      case "tracecalls":
      case "trace":
        this.wrapAddFeature();
        break;

      case "fixfeature":
      case "patchfeature":
        this.fixAddFeature();
        break;

      default:
        // Call the original method for other commands
        return originalProcessCommand.call(this, command);
    }
  };
}

// Function to create a manual initialization button if needed
function createManualInitButton() {
  // Check if button already exists
  if (document.getElementById("init-feature-test")) {
    return;
  }

  // Create a floating button
  const button = document.createElement("button");
  button.id = "init-feature-test";
  button.textContent = "Init Feature Test";
  button.style.position = "fixed";
  button.style.bottom = "120px";
  button.style.right = "20px";
  button.style.zIndex = "9999";
  button.style.padding = "10px 15px";
  button.style.backgroundColor = "#4CAF50";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "4px";
  button.style.cursor = "pointer";
  button.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";

  // Add click handler
  button.addEventListener("click", function () {
    // Try to initialize
    if (window.initEnhancedCommandLine) {
      window.initEnhancedCommandLine();
      setTimeout(extendCommandLine, 500);

      // Update button text
      button.textContent = "Console Ready";
      button.style.backgroundColor = "#2196F3";

      // Hide button after 3 seconds
      setTimeout(function () {
        button.style.display = "none";
      }, 3000);
    } else {
      console.error("initEnhancedCommandLine function not found");
      button.textContent = "Init Failed";
      button.style.backgroundColor = "#F44336";
    }
  });

  // Add to document
  document.body.appendChild(button);
}

// Make EnhancedCommandLine available globally
window.EnhancedCommandLine = EnhancedCommandLine;
