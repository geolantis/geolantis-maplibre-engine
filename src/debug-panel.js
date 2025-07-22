/**
 * Debug Panel for MapLibre
 * Shows feature statistics and debugging info directly in the UI
 */
(function() {
  'use strict';
  
  let debugPanel = null;
  let isMinimized = false;
  
  function createDebugPanel() {
    // Remove existing panel if any
    if (debugPanel) {
      debugPanel.remove();
    }
    
    // Create panel
    debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.innerHTML = `
      <div class="debug-header">
        <span>Debug Info</span>
        <button id="debug-minimize">_</button>
      </div>
      <div class="debug-content">
        <button id="debug-refresh">Refresh Stats</button>
        <button id="debug-force-process">Force Process</button>
        <button id="debug-show-all">Show All Features</button>
        <div id="debug-stats"></div>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #debug-panel {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        max-width: 300px;
        z-index: 9999;
      }
      #debug-panel.minimized {
        height: 30px;
        overflow: hidden;
      }
      .debug-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-weight: bold;
      }
      #debug-minimize {
        background: none;
        border: 1px solid white;
        color: white;
        cursor: pointer;
        padding: 0 5px;
      }
      #debug-panel button {
        display: block;
        width: 100%;
        margin: 5px 0;
        padding: 5px;
        background: #333;
        color: white;
        border: 1px solid #666;
        cursor: pointer;
      }
      #debug-panel button:hover {
        background: #555;
      }
      #debug-stats {
        margin-top: 10px;
        white-space: pre-wrap;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(debugPanel);
    
    // Add event listeners
    document.getElementById('debug-minimize').addEventListener('click', toggleMinimize);
    document.getElementById('debug-refresh').addEventListener('click', refreshStats);
    document.getElementById('debug-force-process').addEventListener('click', forceProcess);
    document.getElementById('debug-show-all').addEventListener('click', showAllFeatures);
    
    // Initial stats
    refreshStats();
  }
  
  function toggleMinimize() {
    isMinimized = !isMinimized;
    debugPanel.classList.toggle('minimized', isMinimized);
    document.getElementById('debug-minimize').textContent = isMinimized ? '+' : '_';
  }
  
  function refreshStats() {
    const statsDiv = document.getElementById('debug-stats');
    
    try {
      // Get map info
      const map = App.Map.Init.getMap();
      const zoom = map ? map.getZoom().toFixed(2) : 'No map';
      
      // Get feature stats
      const stats = App.Map.Layers.getFeatureStats ? App.Map.Layers.getFeatureStats() : {};
      
      // Get category info
      const categories = window._geoCategories || [];
      const visibleCats = categories.filter(c => c.clientVisible).length;
      
      // Build stats text
      let statsText = `=== MAP STATE ===
Zoom: ${zoom}
Categories: ${categories.length} (${visibleCats} visible)

=== FEATURES ===
Loaded: ${stats.loaded || 0}
Pending: ${stats.pending || 0}
By Object ID: ${stats.byObjectId || 0}

=== BREAKDOWN ===`;

      if (stats.byCategory) {
        for (const [catId, count] of Object.entries(stats.byCategory)) {
          const cat = categories.find(c => c.id === catId);
          const name = cat ? cat.name : 'Unknown';
          statsText += `\n${name}: ${count}`;
        }
      }

      if (stats.byType) {
        statsText += `\n\n=== BY TYPE ===`;
        for (const [type, count] of Object.entries(stats.byType)) {
          statsText += `\n${type}: ${count}`;
        }
      }
      
      statsDiv.textContent = statsText;
    } catch (e) {
      statsDiv.textContent = 'Error getting stats: ' + e.message;
    }
  }
  
  function forceProcess() {
    try {
      if (App.Map.Layers.forceProcessPending) {
        App.Map.Layers.forceProcessPending();
        setTimeout(refreshStats, 500);
        alert('Processing forced. Stats will refresh.');
      } else {
        alert('Force process not available');
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }
  
  function showAllFeatures() {
    try {
      if (window.showAllFeatures) {
        window.showAllFeatures();
        alert('All features forced visible. Check the map.');
      } else {
        alert('Show all features not available');
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }
  
  // Auto-create panel when map is ready
  if (window.App && window.App.Core && window.App.Core.Events) {
    App.Core.Events.on('map:ready', createDebugPanel);
  } else {
    // Fallback: try to create after a delay
    setTimeout(createDebugPanel, 3000);
  }
  
  // Make it globally available
  window.createDebugPanel = createDebugPanel;
})();