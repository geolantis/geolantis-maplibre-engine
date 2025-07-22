/**
 * Offline maps management
 * @namespace App.Map.Offline
 */
App.Map = App.Map || {};
App.Map.Offline = (function () {
  // Private variables
  var _map = null;
  var _offlineMaps = [];
  var _isOfflineMode = false;
  var _currentOfflineMap = null;
  var _originalStyle = null;

  /**
   * Sample offline maps for demonstration
   * In production, these would be loaded from IndexedDB or file system
   */
  var _sampleOfflineMaps = [
    {
      id: 'offline-1',
      name: 'Kärnten',
      type: 'mbtiles',
      size: '625 MB',
      bounds: [[12.65, 46.35], [15.05, 47.15]], // Approximate bounds of Carinthia
      minZoom: 8,
      maxZoom: 18,
      visible: true,
      selectable: true
    },
    {
      id: 'offline-2', 
      name: 'Oberkärnten',
      type: 'mbtiles',
      size: '282 MB',
      bounds: [[12.8, 46.7], [13.9, 47.15]], // Upper Carinthia region
      minZoom: 9,
      maxZoom: 18,
      visible: true,
      selectable: true
    },
    {
      id: 'offline-3',
      name: 'Klagenfurt',
      type: 'mbtiles',
      size: '94 MB',
      bounds: [[14.23, 46.58], [14.39, 46.68]], // Klagenfurt city bounds
      minZoom: 10,
      maxZoom: 19,
      visible: true,
      selectable: true
    }
  ];

  /**
   * Initialize offline maps list UI
   * @private
   */
  function _initializeOfflineMapsUI() {
    const container = document.getElementById('offline-maps-list');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    if (_offlineMaps.length === 0) {
      // Show empty state
      container.innerHTML = `
        <div class="offline-maps-empty">
          <p>No offline maps available</p>
          <p class="info-text">Add .mbtiles or .pmtiles files to enable offline mode</p>
        </div>
      `;
      return;
    }

    // Create list of offline maps
    _offlineMaps.forEach((offlineMap) => {
      const mapItem = document.createElement('div');
      mapItem.className = 'offline-map-item';
      if (_currentOfflineMap === offlineMap.id) {
        mapItem.className += ' selected';
      }
      
      mapItem.innerHTML = `
        <div class="offline-map-info" data-map-id="${offlineMap.id}">
          <div class="offline-map-name">${offlineMap.name}</div>
          <div class="offline-map-details">${offlineMap.type} • ${offlineMap.size}</div>
        </div>
        <div class="offline-map-controls">
          <sl-checkbox 
            class="offline-visible-checkbox" 
            data-map-id="${offlineMap.id}"
            ${offlineMap.visible ? 'checked' : ''}
            title="Visible"
          ></sl-checkbox>
          <sl-checkbox 
            class="offline-selectable-checkbox" 
            data-map-id="${offlineMap.id}"
            ${offlineMap.selectable ? 'checked' : ''}
            title="Selectable"
          ></sl-checkbox>
        </div>
      `;

      // Add click handler for the entire item (except checkboxes)
      mapItem.addEventListener('click', (e) => {
        // Don't select if clicking on checkboxes
        if (!e.target.closest('sl-checkbox')) {
          _selectOfflineMap(offlineMap.id);
        }
      });

      // Add handlers for checkboxes
      const visibleCheckbox = mapItem.querySelector('.offline-visible-checkbox');
      visibleCheckbox.addEventListener('sl-change', (e) => {
        e.stopPropagation();
        _setOfflineMapVisibility(offlineMap.id, e.target.checked);
      });

      const selectableCheckbox = mapItem.querySelector('.offline-selectable-checkbox');
      selectableCheckbox.addEventListener('sl-change', (e) => {
        e.stopPropagation();
        _setOfflineMapSelectable(offlineMap.id, e.target.checked);
      });

      container.appendChild(mapItem);
    });
  }


  /**
   * Set visibility for an offline map
   * @param {string} mapId - Map ID
   * @param {boolean} visible - Visibility state
   * @private
   */
  function _setOfflineMapVisibility(mapId, visible) {
    const map = _offlineMaps.find(m => m.id === mapId);
    if (map) {
      map.visible = visible;
      
      // If this is the current map in offline mode, update visibility
      if (_isOfflineMode && _currentOfflineMap === mapId) {
        // Implementation would show/hide the offline map layers
        console.log(`Setting offline map ${mapId} visibility to ${visible}`);
      }
    }
  }

  /**
   * Set selectability for an offline map
   * @param {string} mapId - Map ID
   * @param {boolean} selectable - Selectability state
   * @private
   */
  function _setOfflineMapSelectable(mapId, selectable) {
    const map = _offlineMaps.find(m => m.id === mapId);
    if (map) {
      map.selectable = selectable;
    }
  }

  /**
   * Select an offline map
   * @param {string} mapId - Map ID to select
   * @private
   */
  function _selectOfflineMap(mapId) {
    const map = _offlineMaps.find(m => m.id === mapId);
    if (!map || !map.selectable) return;

    _currentOfflineMap = mapId;
    
    // Highlight selected map in UI
    document.querySelectorAll('.offline-map-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    const selectedItem = document.querySelector(`.offline-map-info[data-map-id="${mapId}"]`);
    if (selectedItem) {
      selectedItem.closest('.offline-map-item').classList.add('selected');
    }

    // If in offline mode, switch to this map
    if (_isOfflineMode) {
      _loadOfflineMap(map);
    }

    // Trigger event
    if (App.Core.Events) {
      App.Core.Events.trigger('offlineMap:selected', {
        map: map
      });
    }
  }

  /**
   * Load an offline map
   * @param {Object} offlineMap - Offline map configuration
   * @private
   */
  function _loadOfflineMap(offlineMap) {
    if (!_map) return;

    console.log(`Loading offline map: ${offlineMap.name}`);

    // In a real implementation, this would:
    // 1. Load the mbtiles/pmtiles file
    // 2. Create a raster-tiles source
    // 3. Add layers to display the tiles
    // 4. Update the map style

    // For now, just zoom to the bounds
    if (offlineMap.bounds) {
      _map.fitBounds(offlineMap.bounds, {
        padding: 50,
        duration: 1000
      });
    }

    // Show notification
    if (App.Core.Events) {
      App.Core.Events.trigger('notification:show', {
        message: `Loaded offline map: ${offlineMap.name}`,
        type: 'info'
      });
    }
  }

  /**
   * Enable offline mode
   * @private
   */
  function _enableOfflineMode() {
    if (!_map || _isOfflineMode) return;

    console.log('Enabling offline mode');
    
    // Store current style
    _originalStyle = _map.getStyle();
    
    // If we have a selected offline map, load it
    if (_currentOfflineMap) {
      const map = _offlineMaps.find(m => m.id === _currentOfflineMap);
      if (map) {
        _loadOfflineMap(map);
      }
    }

    _isOfflineMode = true;

    // Trigger event
    if (App.Core.Events) {
      App.Core.Events.trigger('offlineMode:enabled');
    }
  }

  /**
   * Disable offline mode
   * @private
   */
  function _disableOfflineMode() {
    if (!_map || !_isOfflineMode) return;

    console.log('Disabling offline mode');
    
    // Restore original style if we have it
    if (_originalStyle) {
      _map.setStyle(_originalStyle);
    }

    _isOfflineMode = false;

    // Trigger event
    if (App.Core.Events) {
      App.Core.Events.trigger('offlineMode:disabled');
    }
  }

  // Public API
  return {
    /**
     * Initialize offline maps functionality
     * @param {Object} map - The MapLibre map instance
     */
    initialize: function (map) {
      _map = map;

      // Load sample offline maps for demo
      _offlineMaps = [..._sampleOfflineMaps];

      // Initialize UI
      _initializeOfflineMapsUI();

      // Listen for offline mode toggle events
      if (App.Core.Events) {
        App.Core.Events.on('offlineMode:toggled', (data) => {
          if (data.enabled) {
            _enableOfflineMode();
          } else {
            _disableOfflineMode();
          }
        });
      }

      console.log('Offline maps module initialized');
    },

    /**
     * Get list of offline maps
     * @returns {Array} Array of offline map configurations
     */
    getOfflineMaps: function () {
      return [..._offlineMaps];
    },

    /**
     * Add an offline map
     * @param {Object} mapConfig - Offline map configuration
     */
    addOfflineMap: function (mapConfig) {
      _offlineMaps.push(mapConfig);
      _initializeOfflineMapsUI();
    },

    /**
     * Remove an offline map
     * @param {string} mapId - Map ID to remove
     */
    removeOfflineMap: function (mapId) {
      _offlineMaps = _offlineMaps.filter(m => m.id !== mapId);
      if (_currentOfflineMap === mapId) {
        _currentOfflineMap = null;
      }
      _initializeOfflineMapsUI();
    },

    /**
     * Check if in offline mode
     * @returns {boolean} Whether offline mode is active
     */
    isOfflineMode: function () {
      return _isOfflineMode;
    },

    /**
     * Get current offline map
     * @returns {string|null} Current offline map ID
     */
    getCurrentOfflineMap: function () {
      return _currentOfflineMap;
    },

    /**
     * Toggle offline mode
     * @param {boolean} [enable] - Optional force enable/disable
     */
    toggleOfflineMode: function (enable) {
      if (enable === undefined) {
        enable = !_isOfflineMode;
      }

      if (enable) {
        _enableOfflineMode();
      } else {
        _disableOfflineMode();
      }
    }
  };
})();

console.log("app.map.offline.js loaded - App.Map.Offline module created");