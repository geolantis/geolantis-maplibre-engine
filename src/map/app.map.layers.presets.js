/**
 * Layer presets management module
 * Handles saving and loading of layer visibility preset configurations
 * @namespace App.Map.Layers.Presets
 */
App.Map = App.Map || {};
App.Map.Layers = App.Map.Layers || {};
App.Map.Layers.Presets = (function () {
  // Private variables
  var _presets = new Map();
  var _currentPresetId = null;
  var STORAGE_KEY = 'geo360_layer_presets';
  var DEFAULT_PRESET_ID = 'default';
  
  /**
   * Load presets from localStorage
   * @private
   */
  function _loadPresets() {
    try {
      var savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        var data = JSON.parse(savedData);
        _presets = new Map(data.presets);
        _currentPresetId = data.currentPresetId || null;
        console.log(`[Layer Presets] Loaded ${_presets.size} presets from storage`);
      }
    } catch (e) {
      console.error("[Layer Presets] Failed to load presets:", e);
    }
  }
  
  /**
   * Save presets to localStorage
   * @private
   */
  function _savePresets() {
    try {
      var data = {
        presets: Array.from(_presets.entries()),
        currentPresetId: _currentPresetId,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log("[Layer Presets] Saved presets to storage");
    } catch (e) {
      console.error("[Layer Presets] Failed to save presets:", e);
    }
  }
  
  /**
   * Collect current layer state from UI
   * @private
   * @returns {Object} Current state object
   */
  function _collectCurrentState() {
    var state = {
      layers: {},
      categories: {},
      expandedCategories: [],
      masterCheckboxes: {
        visible: true,
        selectable: true
      },
      allExpanded: true
    };
    
    // Collect feature layer states
    var featureItems = document.querySelectorAll('.lc-feature-item');
    featureItems.forEach(function(item) {
      var featureId = item.dataset.featureId;
      if (featureId) {
        var visibilityCheckbox = item.querySelector('.lc-checkbox-container:first-child sl-checkbox');
        var selectableCheckbox = item.querySelector('.lc-checkbox-container:nth-child(2) sl-checkbox');
        
        state.layers[featureId] = {
          visible: visibilityCheckbox ? visibilityCheckbox.checked : true,
          selectable: selectableCheckbox ? selectableCheckbox.checked : true
        };
      }
    });
    
    // Collect category states
    var categories = document.querySelectorAll('.lc-category');
    categories.forEach(function(category) {
      var categoryName = category.dataset.category;
      if (categoryName) {
        var categoryVisCheckbox = category.querySelector('.lc-category-controls .lc-checkbox-container:first-child sl-checkbox');
        var categorySelCheckbox = category.querySelector('.lc-category-controls .lc-checkbox-container:nth-child(2) sl-checkbox');
        var featureList = category.querySelector('.lc-feature-list');
        
        state.categories[categoryName] = {
          visible: categoryVisCheckbox ? categoryVisCheckbox.checked : true,
          selectable: categorySelCheckbox ? categorySelCheckbox.checked : true
        };
        
        // Track expanded state
        if (featureList && featureList.classList.contains('expanded')) {
          state.expandedCategories.push(categoryName);
        }
      }
    });
    
    // Collect master checkbox states
    var masterVisibleCheckbox = document.getElementById('masterVisibleCheckbox');
    var masterSelectableCheckbox = document.getElementById('masterSelectableCheckbox');
    if (masterVisibleCheckbox) {
      state.masterCheckboxes.visible = masterVisibleCheckbox.checked;
    }
    if (masterSelectableCheckbox) {
      state.masterCheckboxes.selectable = masterSelectableCheckbox.checked;
    }
    
    // Collect expand/collapse all state
    var expandCollapseBtn = document.querySelector('.expand-collapse-button');
    if (expandCollapseBtn) {
      state.allExpanded = expandCollapseBtn.name === 'chevron-down';
    }
    
    return state;
  }
  
  /**
   * Apply a preset state to the UI
   * @private
   * @param {Object} state - State object to apply
   */
  function _applyState(state) {
    if (!state) return;
    
    // Apply layer states
    if (state.layers) {
      Object.keys(state.layers).forEach(function(featureId) {
        var featureItem = document.querySelector(`[data-feature-id="${featureId}"]`);
        if (featureItem) {
          var visibilityCheckbox = featureItem.querySelector('.lc-checkbox-container:first-child sl-checkbox');
          var selectableCheckbox = featureItem.querySelector('.lc-checkbox-container:nth-child(2) sl-checkbox');
          var layerState = state.layers[featureId];
          
          if (visibilityCheckbox && visibilityCheckbox.checked !== layerState.visible) {
            visibilityCheckbox.checked = layerState.visible;
            visibilityCheckbox.dispatchEvent(new Event('sl-change', { bubbles: true }));
          }
          
          if (selectableCheckbox && selectableCheckbox.checked !== layerState.selectable) {
            selectableCheckbox.checked = layerState.selectable;
            selectableCheckbox.dispatchEvent(new Event('sl-change', { bubbles: true }));
          }
        }
      });
    }
    
    // Apply category states
    if (state.categories) {
      Object.keys(state.categories).forEach(function(categoryName) {
        var category = document.querySelector(`[data-category="${categoryName}"]`);
        if (category) {
          var categoryVisCheckbox = category.querySelector('.lc-category-controls .lc-checkbox-container:first-child sl-checkbox');
          var categorySelCheckbox = category.querySelector('.lc-category-controls .lc-checkbox-container:nth-child(2) sl-checkbox');
          var categoryState = state.categories[categoryName];
          
          if (categoryVisCheckbox && categoryVisCheckbox.checked !== categoryState.visible) {
            categoryVisCheckbox.checked = categoryState.visible;
            categoryVisCheckbox.dispatchEvent(new Event('sl-change', { bubbles: true }));
          }
          
          if (categorySelCheckbox && categorySelCheckbox.checked !== categoryState.selectable) {
            categorySelCheckbox.checked = categoryState.selectable;
            categorySelCheckbox.dispatchEvent(new Event('sl-change', { bubbles: true }));
          }
        }
      });
    }
    
    // Apply master checkbox states
    if (state.masterCheckboxes) {
      var masterVisibleCheckbox = document.getElementById('masterVisibleCheckbox');
      var masterSelectableCheckbox = document.getElementById('masterSelectableCheckbox');
      if (masterVisibleCheckbox) {
        masterVisibleCheckbox.checked = state.masterCheckboxes.visible;
      }
      if (masterSelectableCheckbox) {
        masterSelectableCheckbox.checked = state.masterCheckboxes.selectable;
      }
    }
    
    // Apply expanded categories
    if (state.expandedCategories) {
      var expandedSet = new Set(state.expandedCategories);
      var categories = document.querySelectorAll('.lc-category');
      categories.forEach(function(category) {
        var categoryName = category.dataset.category;
        var featureList = category.querySelector('.lc-feature-list');
        var chevron = category.querySelector('sl-icon[name="chevron-down"]');
        
        if (featureList && chevron) {
          if (expandedSet.has(categoryName)) {
            featureList.classList.add('expanded');
            chevron.style.transform = 'rotate(0deg)';
          } else {
            featureList.classList.remove('expanded');
            chevron.style.transform = 'rotate(-90deg)';
          }
        }
      });
    }
    
    // Apply expand/collapse all button state
    if (state.allExpanded !== undefined) {
      var expandCollapseBtn = document.querySelector('.expand-collapse-button');
      var tooltip = expandCollapseBtn?.closest('sl-tooltip');
      if (expandCollapseBtn) {
        expandCollapseBtn.name = state.allExpanded ? 'chevron-down' : 'chevron-right';
        expandCollapseBtn.label = state.allExpanded ? 'Collapse all categories' : 'Expand all categories';
        if (tooltip) {
          tooltip.content = state.allExpanded ? 'Collapse all categories' : 'Expand all categories';
        }
      }
    }
  }
  
  // Public API
  return {
    /**
     * Initialize the presets module
     */
    initialize: function() {
      console.log("[Layer Presets] Initializing layer presets management");
      _loadPresets();
      
      // Create default preset if it doesn't exist
      if (!_presets.has(DEFAULT_PRESET_ID)) {
        // Wait for UI to be ready
        setTimeout(function() {
          var defaultState = _collectCurrentState();
          _presets.set(DEFAULT_PRESET_ID, {
            id: DEFAULT_PRESET_ID,
            name: 'Default',
            state: defaultState,
            createdAt: new Date().toISOString(),
            isDefault: true
          });
          _savePresets();
        }, 1000);
      }
    },
    
    /**
     * Save current state as a new preset
     * @param {string} name - Name for the preset
     * @returns {string} ID of the created preset
     */
    savePreset: function(name) {
      if (!name || name.trim() === '') {
        throw new Error('Preset name is required');
      }
      
      var id = 'preset_' + Date.now();
      var state = _collectCurrentState();
      
      _presets.set(id, {
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
        App.Core.Events.trigger('preset:saved', { id: id, name: name });
      }
      
      return id;
    },
    
    /**
     * Load a preset by ID
     * @param {string} id - Preset ID to load
     */
    loadPreset: function(id) {
      var preset = _presets.get(id);
      if (!preset) {
        console.error("[Layer Presets] Preset not found:", id);
        return;
      }
      
      _applyState(preset.state);
      _currentPresetId = id;
      _savePresets();
      
      // Trigger event
      if (App.Core && App.Core.Events) {
        App.Core.Events.trigger('preset:loaded', { id: id, name: preset.name });
      }
    },
    
    /**
     * Delete a preset by ID
     * @param {string} id - Preset ID to delete
     */
    deletePreset: function(id) {
      if (id === DEFAULT_PRESET_ID) {
        console.error("[Layer Presets] Cannot delete default preset");
        return;
      }
      
      var preset = _presets.get(id);
      if (!preset) {
        console.error("[Layer Presets] Preset not found:", id);
        return;
      }
      
      _presets.delete(id);
      
      // If we deleted the current preset, clear current
      if (_currentPresetId === id) {
        _currentPresetId = null;
      }
      
      _savePresets();
      
      // Trigger event
      if (App.Core && App.Core.Events) {
        App.Core.Events.trigger('preset:deleted', { id: id, name: preset.name });
      }
    },
    
    /**
     * Update an existing preset with current state
     * @param {string} id - Preset ID to update
     */
    updatePreset: function(id) {
      var preset = _presets.get(id);
      if (!preset) {
        console.error("[Layer Presets] Preset not found:", id);
        return;
      }
      
      preset.state = _collectCurrentState();
      preset.updatedAt = new Date().toISOString();
      
      _savePresets();
      
      // Trigger event
      if (App.Core && App.Core.Events) {
        App.Core.Events.trigger('preset:updated', { id: id, name: preset.name });
      }
    },
    
    /**
     * Get all presets
     * @returns {Array} Array of preset objects
     */
    getAllPresets: function() {
      return Array.from(_presets.values()).sort(function(a, b) {
        // Default preset always first
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        // Then sort by creation date
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    },
    
    /**
     * Get current preset ID
     * @returns {string|null} Current preset ID or null
     */
    getCurrentPresetId: function() {
      return _currentPresetId;
    },
    
    /**
     * Reset to default preset
     */
    resetToDefault: function() {
      this.loadPreset(DEFAULT_PRESET_ID);
    }
  };
})();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Wait for Shoelace components and layers UI to be ready
  customElements.whenDefined('sl-drawer').then(function() {
    setTimeout(function() {
      App.Map.Layers.Presets.initialize();
    }, 500);
  });
});

console.log("app.map.layers.presets.js loaded - App.Map.Layers.Presets module created");