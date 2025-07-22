/**
 * UI State Management module
 * Handles saving and loading of UI preferences and control states
 * @namespace App.UI.State
 */
App.UI = App.UI || {};
App.UI.State = (function () {
  // Private variables
  var _uiPresets = new Map();
  var _currentPresetId = null;
  var STORAGE_KEY = 'geo360_ui_presets';
  var DEFAULT_PRESET_ID = 'default';
  
  // Default UI state
  var DEFAULT_STATE = {
    controls: {
      showZoom: true,
      showNavigation: true,
      allowRotate: true,
      allowPitch: true,
      showScale: true,
      showCoordinates: true,
      showMeasurement: true
    },
    drawers: {
      left1: false,  // Basemap/Overlay drawer
      left2: false,  // Search drawer
      left3: false,  // Tools drawer
      left4: false,  // Feature Layers drawer
      right1: false, // Settings drawer
      right2: false  // Feature Info drawer
    },
    map: {
      pitch: 0,
      bearing: 0
    },
    theme: {
      buttonSize: 'medium',
      colorTheme: 'default'
    }
  };
  
  /**
   * Load presets from localStorage
   * @private
   */
  function _loadPresets() {
    try {
      var savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        var data = JSON.parse(savedData);
        _uiPresets = new Map(data.presets);
        _currentPresetId = data.currentPresetId || null;
        console.log(`[UI State] Loaded ${_uiPresets.size} UI presets from storage`);
      }
    } catch (e) {
      console.error("[UI State] Failed to load UI presets:", e);
    }
  }
  
  /**
   * Save presets to localStorage
   * @private
   */
  function _savePresets() {
    try {
      var data = {
        presets: Array.from(_uiPresets.entries()),
        currentPresetId: _currentPresetId,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log("[UI State] Saved UI presets to storage");
    } catch (e) {
      console.error("[UI State] Failed to save UI presets:", e);
    }
  }
  
  /**
   * Collect current UI state
   * @private
   * @returns {Object} Current UI state
   */
  function _collectCurrentState() {
    var state = {
      controls: {},
      drawers: {},
      map: {},
      theme: {}
    };
    
    // Collect control states
    var toggleZoom = document.getElementById('toggle-zoom');
    var toggleNavigation = document.getElementById('toggle-navigation');
    var toggleRotate = document.getElementById('toggle-rotate');
    var togglePitch = document.getElementById('toggle-pitch');
    
    state.controls.showZoom = toggleZoom ? toggleZoom.checked : true;
    state.controls.showNavigation = toggleNavigation ? toggleNavigation.checked : true;
    state.controls.allowRotate = toggleRotate ? toggleRotate.checked : true;
    state.controls.allowPitch = togglePitch ? togglePitch.checked : true;
    
    // Check for scale control
    var scaleControl = document.querySelector('.maplibregl-ctrl-scale');
    state.controls.showScale = scaleControl ? scaleControl.style.display !== 'none' : true;
    
    // Check for coordinates display
    var coordsDisplay = document.querySelector('.coordinates-display');
    state.controls.showCoordinates = coordsDisplay ? coordsDisplay.style.display !== 'none' : true;
    
    // Check for measurement tools
    var measurementContainer = document.getElementById('measurement-container');
    state.controls.showMeasurement = measurementContainer ? measurementContainer.style.display !== 'none' : true;
    
    // Collect drawer states
    var drawers = ['left1', 'left2', 'left3', 'left4', 'right1', 'right2'];
    drawers.forEach(function(drawerId) {
      var drawer = document.getElementById(drawerId + '-drawer');
      state.drawers[drawerId] = drawer ? drawer.open : false;
    });
    
    // Collect map state
    if (window.App && window.App.Map && window.App.Map.Init) {
      var map = window.App.Map.Init.getMap();
      if (map) {
        state.map.pitch = map.getPitch();
        state.map.bearing = map.getBearing();
        state.map.zoom = map.getZoom();
        var center = map.getCenter();
        state.map.center = {
          lng: center.lng,
          lat: center.lat
        };
      }
    }
    
    // Collect theme settings
    try {
      state.theme.buttonSize = localStorage.getItem('buttonSize') || 'medium';
      state.theme.colorTheme = localStorage.getItem('colorTheme') || 'default';
    } catch (e) {
      state.theme.buttonSize = 'medium';
      state.theme.colorTheme = 'default';
    }
    
    return state;
  }
  
  /**
   * Apply UI state
   * @private
   * @param {Object} state - UI state to apply
   */
  function _applyState(state) {
    if (!state) return;
    
    // Apply control states
    if (state.controls) {
      // Toggle controls
      var toggleZoom = document.getElementById('toggle-zoom');
      var toggleNavigation = document.getElementById('toggle-navigation');
      var toggleRotate = document.getElementById('toggle-rotate');
      var togglePitch = document.getElementById('toggle-pitch');
      
      if (toggleZoom && toggleZoom.checked !== state.controls.showZoom) {
        toggleZoom.checked = state.controls.showZoom;
        toggleZoom.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      if (toggleNavigation && toggleNavigation.checked !== state.controls.showNavigation) {
        toggleNavigation.checked = state.controls.showNavigation;
        toggleNavigation.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      if (toggleRotate && toggleRotate.checked !== state.controls.allowRotate) {
        toggleRotate.checked = state.controls.allowRotate;
        toggleRotate.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      if (togglePitch && togglePitch.checked !== state.controls.allowPitch) {
        togglePitch.checked = state.controls.allowPitch;
        togglePitch.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      // Scale control
      var scaleControl = document.querySelector('.maplibregl-ctrl-scale');
      if (scaleControl) {
        scaleControl.style.display = state.controls.showScale ? 'block' : 'none';
      }
      
      // Coordinates display
      var coordsDisplay = document.querySelector('.coordinates-display');
      if (coordsDisplay) {
        coordsDisplay.style.display = state.controls.showCoordinates ? 'block' : 'none';
      }
      
      // Measurement tools
      var measurementContainer = document.getElementById('measurement-container');
      if (measurementContainer) {
        measurementContainer.style.display = state.controls.showMeasurement ? 'block' : 'none';
      }
    }
    
    // Apply drawer states
    if (state.drawers) {
      Object.keys(state.drawers).forEach(function(drawerId) {
        var drawer = document.getElementById(drawerId + '-drawer');
        if (drawer) {
          if (state.drawers[drawerId] && !drawer.open) {
            drawer.show();
          } else if (!state.drawers[drawerId] && drawer.open) {
            drawer.hide();
          }
        }
      });
    }
    
    // Apply map state
    if (state.map && window.App && window.App.Map && window.App.Map.Init) {
      var map = window.App.Map.Init.getMap();
      if (map) {
        // Apply with animation
        if (state.map.center) {
          map.flyTo({
            center: [state.map.center.lng, state.map.center.lat],
            zoom: state.map.zoom || map.getZoom(),
            pitch: state.map.pitch || 0,
            bearing: state.map.bearing || 0,
            duration: 1000
          });
        } else {
          map.setPitch(state.map.pitch || 0);
          map.setBearing(state.map.bearing || 0);
        }
      }
    }
    
    // Apply theme settings
    if (state.theme) {
      // Button size
      if (state.theme.buttonSize) {
        var buttonSizeRadios = document.getElementById('buttonSizeOptions');
        if (buttonSizeRadios) {
          buttonSizeRadios.value = state.theme.buttonSize;
          buttonSizeRadios.dispatchEvent(new Event('sl-change', { bubbles: true }));
        }
      }
      
      // Color theme
      if (state.theme.colorTheme) {
        var colorThemeRadios = document.getElementById('colorThemeOptions');
        if (colorThemeRadios) {
          colorThemeRadios.value = state.theme.colorTheme;
          colorThemeRadios.dispatchEvent(new Event('sl-change', { bubbles: true }));
        }
      }
    }
  }
  
  // Public API
  return {
    /**
     * Initialize the UI state module
     */
    initialize: function() {
      console.log("[UI State] Initializing UI state management");
      _loadPresets();
      
      // Create default preset if it doesn't exist
      if (!_uiPresets.has(DEFAULT_PRESET_ID)) {
        _uiPresets.set(DEFAULT_PRESET_ID, {
          id: DEFAULT_PRESET_ID,
          name: 'Default',
          state: DEFAULT_STATE,
          createdAt: new Date().toISOString(),
          isDefault: true
        });
        _savePresets();
      }
    },
    
    /**
     * Save current UI state as a new preset
     * @param {string} name - Name for the preset
     * @returns {string} ID of the created preset
     */
    savePreset: function(name) {
      if (!name || name.trim() === '') {
        throw new Error('Preset name is required');
      }
      
      var id = 'ui_preset_' + Date.now();
      var state = _collectCurrentState();
      
      _uiPresets.set(id, {
        id: id,
        name: name.trim(),
        state: state,
        createdAt: new Date().toISOString(),
        isDefault: false
      });
      
      _currentPresetId = id;
      _savePresets();
      
      // Trigger event
      if (App.Core && App.Core.Events) {
        App.Core.Events.trigger('ui:preset:saved', { id: id, name: name });
      }
      
      return id;
    },
    
    /**
     * Load a UI preset by ID
     * @param {string} id - Preset ID to load
     */
    loadPreset: function(id) {
      var preset = _uiPresets.get(id);
      if (!preset) {
        console.error("[UI State] UI preset not found:", id);
        return;
      }
      
      _applyState(preset.state);
      _currentPresetId = id;
      _savePresets();
      
      // Trigger event
      if (App.Core && App.Core.Events) {
        App.Core.Events.trigger('ui:preset:loaded', { id: id, name: preset.name });
      }
    },
    
    /**
     * Delete a UI preset by ID
     * @param {string} id - Preset ID to delete
     */
    deletePreset: function(id) {
      if (id === DEFAULT_PRESET_ID) {
        console.error("[UI State] Cannot delete default UI preset");
        return;
      }
      
      var preset = _uiPresets.get(id);
      if (!preset) {
        console.error("[UI State] UI preset not found:", id);
        return;
      }
      
      _uiPresets.delete(id);
      
      // If we deleted the current preset, clear current
      if (_currentPresetId === id) {
        _currentPresetId = null;
      }
      
      _savePresets();
      
      // Trigger event
      if (App.Core && App.Core.Events) {
        App.Core.Events.trigger('ui:preset:deleted', { id: id, name: preset.name });
      }
    },
    
    /**
     * Update an existing UI preset with current state
     * @param {string} id - Preset ID to update
     */
    updatePreset: function(id) {
      var preset = _uiPresets.get(id);
      if (!preset) {
        console.error("[UI State] UI preset not found:", id);
        return;
      }
      
      preset.state = _collectCurrentState();
      preset.updatedAt = new Date().toISOString();
      
      _savePresets();
      
      // Trigger event
      if (App.Core && App.Core.Events) {
        App.Core.Events.trigger('ui:preset:updated', { id: id, name: preset.name });
      }
    },
    
    /**
     * Get all UI presets
     * @returns {Array} Array of preset objects
     */
    getAllPresets: function() {
      return Array.from(_uiPresets.values()).sort(function(a, b) {
        // Default preset always first
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        // Then sort by creation date
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    },
    
    /**
     * Get current UI preset ID
     * @returns {string|null} Current preset ID or null
     */
    getCurrentPresetId: function() {
      return _currentPresetId;
    },
    
    /**
     * Reset to default UI preset
     */
    resetToDefault: function() {
      this.loadPreset(DEFAULT_PRESET_ID);
    },
    
    /**
     * Get default UI state
     * @returns {Object} Default UI state
     */
    getDefaultState: function() {
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  };
})();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Wait for map and UI components to be ready
  setTimeout(function() {
    App.UI.State.initialize();
  }, 1000);
});

console.log("app.ui.state.js loaded - App.UI.State module created");