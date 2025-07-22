/**
 * Layer state management module
 * Handles persistence of layer visibility and other settings across sidebar toggles
 * @namespace App.Map.Layers.State
 */
App.Map = App.Map || {};
App.Map.Layers = App.Map.Layers || {};
App.Map.Layers.State = (function () {
  // Private variables
  var _layerStates = new Map();
  var _categoryStates = new Map();
  var _expandedCategories = new Set();
  var _searchState = {
    value: '',
    active: false
  };
  var _masterCheckboxStates = {
    visible: true,
    selectable: true
  };
  var _allExpanded = true;
  
  /**
   * Collect current state from UI
   * @private
   */
  function _collectCurrentState() {
    console.log("[Layer State] Collecting current state from UI");
    
    // Clear previous states
    _layerStates.clear();
    _categoryStates.clear();
    _expandedCategories.clear();
    
    // Collect feature layer states
    var featureItems = document.querySelectorAll('.lc-feature-item');
    featureItems.forEach(function(item) {
      var featureId = item.dataset.featureId;
      if (featureId) {
        var visibilityCheckbox = item.querySelector('.lc-checkbox-container:first-child sl-checkbox');
        var selectableCheckbox = item.querySelector('.lc-checkbox-container:nth-child(2) sl-checkbox');
        
        _layerStates.set(featureId, {
          visible: visibilityCheckbox ? visibilityCheckbox.checked : true,
          selectable: selectableCheckbox ? selectableCheckbox.checked : true,
          hidden: item.hidden || false
        });
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
        
        _categoryStates.set(categoryName, {
          visible: categoryVisCheckbox ? categoryVisCheckbox.checked : true,
          selectable: categorySelCheckbox ? categorySelCheckbox.checked : true,
          hidden: category.hidden || false
        });
        
        // Track expanded state
        if (featureList && featureList.classList.contains('expanded')) {
          _expandedCategories.add(categoryName);
        }
      }
    });
    
    // Collect search state
    var searchInput = document.getElementById('layerSearchInput');
    if (searchInput) {
      _searchState.value = searchInput.value || '';
      _searchState.active = _searchState.value.length > 0;
    }
    
    // Collect master checkbox states
    var masterVisibleCheckbox = document.getElementById('masterVisibleCheckbox');
    var masterSelectableCheckbox = document.getElementById('masterSelectableCheckbox');
    if (masterVisibleCheckbox) {
      _masterCheckboxStates.visible = masterVisibleCheckbox.checked;
    }
    if (masterSelectableCheckbox) {
      _masterCheckboxStates.selectable = masterSelectableCheckbox.checked;
    }
    
    // Collect expand/collapse all state
    var expandCollapseBtn = document.querySelector('.expand-collapse-button');
    if (expandCollapseBtn) {
      _allExpanded = expandCollapseBtn.name === 'chevron-down';
    }
    
    console.log(`[Layer State] Collected state for ${_layerStates.size} layers and ${_categoryStates.size} categories`);
  }
  
  /**
   * Restore state to UI
   * @private
   */
  function _restoreState() {
    console.log("[Layer State] Restoring state to UI");
    
    // Small delay to ensure UI is fully rendered
    setTimeout(function() {
      // Restore feature layer states
      _layerStates.forEach(function(state, featureId) {
        var featureItem = document.querySelector(`[data-feature-id="${featureId}"]`);
        if (featureItem) {
          var visibilityCheckbox = featureItem.querySelector('.lc-checkbox-container:first-child sl-checkbox');
          var selectableCheckbox = featureItem.querySelector('.lc-checkbox-container:nth-child(2) sl-checkbox');
          
          if (visibilityCheckbox && visibilityCheckbox.checked !== state.visible) {
            visibilityCheckbox.checked = state.visible;
            // Trigger change event
            visibilityCheckbox.dispatchEvent(new Event('sl-change', { bubbles: true }));
          }
          
          if (selectableCheckbox && selectableCheckbox.checked !== state.selectable) {
            selectableCheckbox.checked = state.selectable;
            selectableCheckbox.dispatchEvent(new Event('sl-change', { bubbles: true }));
          }
          
          featureItem.hidden = state.hidden;
        }
      });
      
      // Restore category states
      _categoryStates.forEach(function(state, categoryName) {
        var category = document.querySelector(`[data-category="${categoryName}"]`);
        if (category) {
          var categoryVisCheckbox = category.querySelector('.lc-category-controls .lc-checkbox-container:first-child sl-checkbox');
          var categorySelCheckbox = category.querySelector('.lc-category-controls .lc-checkbox-container:nth-child(2) sl-checkbox');
          var featureList = category.querySelector('.lc-feature-list');
          var chevron = category.querySelector('sl-icon[name="chevron-down"]');
          
          if (categoryVisCheckbox && categoryVisCheckbox.checked !== state.visible) {
            categoryVisCheckbox.checked = state.visible;
            categoryVisCheckbox.dispatchEvent(new Event('sl-change', { bubbles: true }));
          }
          
          if (categorySelCheckbox && categorySelCheckbox.checked !== state.selectable) {
            categorySelCheckbox.checked = state.selectable;
            categorySelCheckbox.dispatchEvent(new Event('sl-change', { bubbles: true }));
          }
          
          category.hidden = state.hidden;
          
          // Restore expanded state
          if (featureList && chevron) {
            if (_expandedCategories.has(categoryName)) {
              featureList.classList.add('expanded');
              chevron.style.transform = 'rotate(0deg)';
            } else {
              featureList.classList.remove('expanded');
              chevron.style.transform = 'rotate(-90deg)';
            }
          }
        }
      });
      
      // Restore search state
      var searchInput = document.getElementById('layerSearchInput');
      if (searchInput && _searchState.value) {
        searchInput.value = _searchState.value;
        if (_searchState.active) {
          // Trigger search
          searchInput.dispatchEvent(new Event('sl-input', { bubbles: true }));
        }
      }
      
      // Restore master checkbox states
      var masterVisibleCheckbox = document.getElementById('masterVisibleCheckbox');
      var masterSelectableCheckbox = document.getElementById('masterSelectableCheckbox');
      if (masterVisibleCheckbox) {
        masterVisibleCheckbox.checked = _masterCheckboxStates.visible;
      }
      if (masterSelectableCheckbox) {
        masterSelectableCheckbox.checked = _masterCheckboxStates.selectable;
      }
      
      // Restore expand/collapse all button state
      var expandCollapseBtn = document.querySelector('.expand-collapse-button');
      var tooltip = expandCollapseBtn?.closest('sl-tooltip');
      if (expandCollapseBtn) {
        expandCollapseBtn.name = _allExpanded ? 'chevron-down' : 'chevron-right';
        expandCollapseBtn.label = _allExpanded ? 'Collapse all categories' : 'Expand all categories';
        if (tooltip) {
          tooltip.content = _allExpanded ? 'Collapse all categories' : 'Expand all categories';
        }
      }
      
      console.log("[Layer State] State restoration complete");
    }, 100);
  }
  
  /**
   * Save state to localStorage
   * @private
   */
  function _persistState() {
    var stateData = {
      layers: Array.from(_layerStates.entries()),
      categories: Array.from(_categoryStates.entries()),
      expandedCategories: Array.from(_expandedCategories),
      search: _searchState,
      masterCheckboxes: _masterCheckboxStates,
      allExpanded: _allExpanded,
      timestamp: new Date().toISOString()
    };
    
    try {
      localStorage.setItem('geo360_layer_states', JSON.stringify(stateData));
      console.log("[Layer State] State persisted to localStorage");
    } catch (e) {
      console.error("[Layer State] Failed to persist state:", e);
    }
  }
  
  /**
   * Load state from localStorage
   * @private
   */
  function _loadPersistedState() {
    try {
      var savedData = localStorage.getItem('geo360_layer_states');
      if (savedData) {
        var stateData = JSON.parse(savedData);
        
        // Check if data is not too old (24 hours)
        var timestamp = new Date(stateData.timestamp);
        var now = new Date();
        var hoursDiff = (now - timestamp) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          _layerStates = new Map(stateData.layers);
          _categoryStates = new Map(stateData.categories);
          _expandedCategories = new Set(stateData.expandedCategories);
          _searchState = stateData.search || { value: '', active: false };
          _masterCheckboxStates = stateData.masterCheckboxes || { visible: true, selectable: true };
          _allExpanded = stateData.allExpanded !== undefined ? stateData.allExpanded : true;
          
          console.log("[Layer State] Loaded persisted state from localStorage");
          return true;
        } else {
          console.log("[Layer State] Persisted state too old, ignoring");
        }
      }
    } catch (e) {
      console.error("[Layer State] Failed to load persisted state:", e);
    }
    return false;
  }
  
  // Public API
  return {
    /**
     * Initialize the layer state management
     */
    initialize: function() {
      console.log("[Layer State] Initializing layer state management");
      
      // Load any persisted state
      _loadPersistedState();
      
      // Set up event listeners for drawer show/hide
      var drawers = document.querySelectorAll('sl-drawer[id$="-drawer"]');
      drawers.forEach(function(drawer) {
        // Save state when drawer is about to hide
        drawer.addEventListener('sl-hide', function(event) {
          if (drawer.id === 'left4-drawer' || drawer.id === 'left4a-drawer') {
            console.log(`[Layer State] Drawer ${drawer.id} hiding, saving state`);
            _collectCurrentState();
            _persistState();
          }
        });
        
        // Restore state when drawer is shown
        drawer.addEventListener('sl-after-show', function(event) {
          if (drawer.id === 'left4-drawer' || drawer.id === 'left4a-drawer') {
            console.log(`[Layer State] Drawer ${drawer.id} shown, restoring state`);
            // Give UI time to render
            setTimeout(function() {
              _restoreState();
            }, 200);
          }
        });
      });
      
      // Also listen for visibility changes on the map layers
      if (App.Core && App.Core.Events) {
        App.Core.Events.on('layer:visibility:changed', function(data) {
          // Update our internal state when layer visibility changes
          if (data.layerId && data.visible !== undefined) {
            var featureId = data.layerId.replace('cat-', '');
            var state = _layerStates.get(featureId) || {};
            state.visible = data.visible;
            _layerStates.set(featureId, state);
          }
        });
      }
      
      console.log("[Layer State] Layer state management initialized");
    },
    
    /**
     * Manually save current state
     */
    saveState: function() {
      _collectCurrentState();
      _persistState();
    },
    
    /**
     * Manually restore state
     */
    restoreState: function() {
      _restoreState();
    },
    
    /**
     * Clear all saved states
     */
    clearState: function() {
      _layerStates.clear();
      _categoryStates.clear();
      _expandedCategories.clear();
      _searchState = { value: '', active: false };
      _masterCheckboxStates = { visible: true, selectable: true };
      _allExpanded = true;
      localStorage.removeItem('geo360_layer_states');
      console.log("[Layer State] All states cleared");
    },
    
    /**
     * Get current state (for debugging)
     */
    getState: function() {
      return {
        layerCount: _layerStates.size,
        categoryCount: _categoryStates.size,
        expandedCategories: Array.from(_expandedCategories),
        searchState: _searchState,
        masterCheckboxStates: _masterCheckboxStates,
        allExpanded: _allExpanded
      };
    }
  };
})();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Wait for Shoelace components to be defined
  customElements.whenDefined('sl-drawer').then(function() {
    App.Map.Layers.State.initialize();
  });
});

console.log("app.map.layers.state.js loaded - App.Map.Layers.State module created");