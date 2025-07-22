/**
 * Presets UI Management module
 * Provides UI components for managing layer and UI state presets
 * @namespace App.UI.Presets
 */
App.UI = App.UI || {};
App.UI.Presets = (function () {
  // Private variables
  var _initialized = false;
  var _presetDialog = null;
  var _saveDialog = null;
  
  /**
   * Create the preset management button for a drawer
   * @private
   * @param {string} type - 'layer' or 'ui'
   * @returns {HTMLElement} Button element
   */
  function _createPresetButton(type) {
    var button = document.createElement('sl-button');
    button.variant = 'default';
    button.size = 'small';
    button.innerHTML = '<sl-icon slot="prefix" name="bookmark"></sl-icon>' + (App.I18n ? App.I18n.t('presets.presets') : 'Presets');
    button.style.marginLeft = 'auto';
    button.style.marginRight = '10px';
    
    button.addEventListener('click', function() {
      _showPresetDialog(type);
    });
    
    return button;
  }
  
  /**
   * Create the preset management dialog
   * @private
   */
  function _createPresetDialog() {
    if (_presetDialog) return;
    
    _presetDialog = document.createElement('sl-dialog');
    _presetDialog.id = 'preset-dialog';
    _presetDialog.label = App.I18n ? App.I18n.t('presets.manage_presets') : 'Manage Presets';
    _presetDialog.style.setProperty('--width', '90vw');
    _presetDialog.style.setProperty('--sl-panel-max-width', '500px');
    
    _presetDialog.innerHTML = `
      <div class="preset-container">
        <div class="preset-header">
          <sl-button variant="primary" size="small" id="save-new-preset">
            <sl-icon slot="prefix" name="plus-circle"></sl-icon>
            ${App.I18n ? App.I18n.t('presets.save_current_state') : 'Save Current State'}
          </sl-button>
        </div>
        <sl-divider></sl-divider>
        <div id="preset-list" class="preset-list">
          <!-- Presets will be populated here -->
        </div>
      </div>
      <sl-button slot="footer" variant="default" id="close-preset-dialog">${App.I18n ? App.I18n.t('presets.close') : 'Close'}</sl-button>
    `;
    
    document.body.appendChild(_presetDialog);
    
    // Add styles
    var style = document.createElement('style');
    style.textContent = `
      .preset-container {
        padding: 10px;
      }
      
      .preset-header {
        margin-bottom: 15px;
        text-align: center;
      }
      
      .preset-list {
        max-height: 60vh;
        overflow-y: auto;
      }
      
      .preset-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        margin-bottom: 10px;
        background: var(--sl-color-neutral-50);
        border-radius: var(--sl-border-radius-medium);
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .preset-item:hover {
        background: var(--sl-color-neutral-100);
      }
      
      .preset-item.active {
        background: var(--sl-color-primary-100);
        border: 2px solid var(--sl-color-primary-500);
      }
      
      .preset-item.default {
        font-weight: bold;
      }
      
      .preset-info {
        flex: 1;
        margin-right: 10px;
      }
      
      .preset-name {
        font-size: 16px;
        margin-bottom: 5px;
      }
      
      .preset-date {
        font-size: 12px;
        color: var(--sl-color-neutral-600);
      }
      
      .preset-actions {
        display: flex;
        gap: 5px;
      }
      
      @media (max-width: 768px) {
        .preset-item {
          padding: 15px;
        }
        
        .preset-name {
          font-size: 18px;
        }
        
        .preset-actions sl-button {
          --sl-input-height-small: 40px;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Event listeners
    document.getElementById('close-preset-dialog').addEventListener('click', function() {
      _presetDialog.hide();
    });
    
    document.getElementById('save-new-preset').addEventListener('click', function() {
      _showSaveDialog(_presetDialog.dataset.type);
    });
  }
  
  /**
   * Create the save preset dialog
   * @private
   */
  function _createSaveDialog() {
    if (_saveDialog) return;
    
    _saveDialog = document.createElement('sl-dialog');
    _saveDialog.id = 'save-preset-dialog';
    _saveDialog.label = App.I18n ? App.I18n.t('presets.save_preset') : 'Save Preset';
    _saveDialog.style.setProperty('--width', '90vw');
    _saveDialog.style.setProperty('--sl-panel-max-width', '400px');
    
    _saveDialog.innerHTML = `
      <sl-input 
        id="preset-name-input" 
        label="${App.I18n ? App.I18n.t('presets.preset_name') : 'Preset Name'}" 
        placeholder="${App.I18n ? App.I18n.t('presets.enter_preset_name') : 'Enter a name for this preset'}"
        required
        autofocus
      ></sl-input>
      <sl-button slot="footer" variant="default" id="cancel-save-preset">${App.I18n ? App.I18n.t('presets.cancel') : 'Cancel'}</sl-button>
      <sl-button slot="footer" variant="primary" id="confirm-save-preset">${App.I18n ? App.I18n.t('presets.save') : 'Save'}</sl-button>
    `;
    
    document.body.appendChild(_saveDialog);
    
    // Event listeners
    document.getElementById('cancel-save-preset').addEventListener('click', function() {
      _saveDialog.hide();
    });
    
    document.getElementById('confirm-save-preset').addEventListener('click', function() {
      _savePreset();
    });
    
    // Save on Enter key
    document.getElementById('preset-name-input').addEventListener('sl-input', function(e) {
      if (e.detail && e.detail.event && e.detail.event.key === 'Enter') {
        _savePreset();
      }
    });
  }
  
  /**
   * Show the preset management dialog
   * @private
   * @param {string} type - 'layer' or 'ui'
   */
  function _showPresetDialog(type) {
    if (!_presetDialog) {
      _createPresetDialog();
    }
    
    _presetDialog.dataset.type = type;
    _presetDialog.label = type === 'layer' ? (App.I18n ? App.I18n.t('presets.layer_presets') : 'Layer Presets') : (App.I18n ? App.I18n.t('presets.ui_presets') : 'UI Presets');
    
    // Populate presets
    _populatePresets(type);
    
    _presetDialog.show();
  }
  
  /**
   * Show the save preset dialog
   * @private
   * @param {string} type - 'layer' or 'ui'
   */
  function _showSaveDialog(type) {
    if (!_saveDialog) {
      _createSaveDialog();
    }
    
    _saveDialog.dataset.type = type;
    document.getElementById('preset-name-input').value = '';
    _saveDialog.show();
    
    // Focus input after dialog opens
    setTimeout(function() {
      document.getElementById('preset-name-input').focus();
    }, 100);
  }
  
  /**
   * Save a new preset
   * @private
   */
  function _savePreset() {
    var nameInput = document.getElementById('preset-name-input');
    var name = nameInput.value.trim();
    
    if (!name) {
      nameInput.setCustomValidity(App.I18n ? App.I18n.t('presets.enter_preset_name_validation') : 'Please enter a preset name');
      nameInput.reportValidity();
      return;
    }
    
    var type = _saveDialog.dataset.type;
    
    try {
      if (type === 'layer') {
        App.Map.Layers.Presets.savePreset(name);
      } else {
        App.UI.State.savePreset(name);
      }
      
      _saveDialog.hide();
      _populatePresets(type);
      
      // Show success notification
      _showNotification(App.I18n ? App.I18n.t('presets.preset_saved_successfully') : 'Preset saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save preset:', error);
      _showNotification(App.I18n ? App.I18n.t('presets.failed_to_save_preset') : 'Failed to save preset', 'danger');
    }
  }
  
  /**
   * Populate the preset list
   * @private
   * @param {string} type - 'layer' or 'ui'
   */
  function _populatePresets(type) {
    var presetList = document.getElementById('preset-list');
    presetList.innerHTML = '';
    
    var presets = type === 'layer' 
      ? App.Map.Layers.Presets.getAllPresets()
      : App.UI.State.getAllPresets();
    
    var currentId = type === 'layer'
      ? App.Map.Layers.Presets.getCurrentPresetId()
      : App.UI.State.getCurrentPresetId();
    
    presets.forEach(function(preset) {
      var item = document.createElement('div');
      item.className = 'preset-item';
      if (preset.id === currentId) {
        item.classList.add('active');
      }
      if (preset.isDefault) {
        item.classList.add('default');
      }
      
      var date = new Date(preset.createdAt);
      var dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      item.innerHTML = `
        <div class="preset-info">
          <div class="preset-name">${preset.name}</div>
          <div class="preset-date">${dateStr}</div>
        </div>
        <div class="preset-actions">
          <sl-button size="small" variant="default" data-action="load" data-id="${preset.id}">
            <sl-icon name="arrow-down-circle"></sl-icon>
          </sl-button>
          ${!preset.isDefault ? `
            <sl-button size="small" variant="default" data-action="update" data-id="${preset.id}">
              <sl-icon name="arrow-clockwise"></sl-icon>
            </sl-button>
            <sl-button size="small" variant="danger" data-action="delete" data-id="${preset.id}">
              <sl-icon name="trash"></sl-icon>
            </sl-button>
          ` : ''}
        </div>
      `;
      
      // Click on item to load
      item.addEventListener('click', function(e) {
        if (!e.target.closest('.preset-actions')) {
          _loadPreset(type, preset.id);
        }
      });
      
      presetList.appendChild(item);
    });
    
    // Add action listeners
    presetList.querySelectorAll('[data-action]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var action = this.dataset.action;
        var id = this.dataset.id;
        
        if (action === 'load') {
          _loadPreset(type, id);
        } else if (action === 'update') {
          _updatePreset(type, id);
        } else if (action === 'delete') {
          _deletePreset(type, id);
        }
      });
    });
  }
  
  /**
   * Load a preset
   * @private
   * @param {string} type - 'layer' or 'ui'
   * @param {string} id - Preset ID
   */
  function _loadPreset(type, id) {
    try {
      if (type === 'layer') {
        App.Map.Layers.Presets.loadPreset(id);
      } else {
        App.UI.State.loadPreset(id);
      }
      
      _populatePresets(type);
      _showNotification(App.I18n ? App.I18n.t('presets.preset_loaded_successfully') : 'Preset loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to load preset:', error);
      _showNotification(App.I18n ? App.I18n.t('presets.failed_to_load_preset') : 'Failed to load preset', 'danger');
    }
  }
  
  /**
   * Update a preset
   * @private
   * @param {string} type - 'layer' or 'ui'
   * @param {string} id - Preset ID
   */
  function _updatePreset(type, id) {
    if (confirm(App.I18n ? App.I18n.t('presets.update_preset_confirm') : 'Update this preset with the current state?')) {
      try {
        if (type === 'layer') {
          App.Map.Layers.Presets.updatePreset(id);
        } else {
          App.UI.State.updatePreset(id);
        }
        
        _populatePresets(type);
        _showNotification(App.I18n ? App.I18n.t('presets.preset_updated_successfully') : 'Preset updated successfully', 'success');
      } catch (error) {
        console.error('Failed to update preset:', error);
        _showNotification(App.I18n ? App.I18n.t('presets.failed_to_update_preset') : 'Failed to update preset', 'danger');
      }
    }
  }
  
  /**
   * Delete a preset
   * @private
   * @param {string} type - 'layer' or 'ui'
   * @param {string} id - Preset ID
   */
  function _deletePreset(type, id) {
    if (confirm(App.I18n ? App.I18n.t('presets.delete_preset_confirm') : 'Are you sure you want to delete this preset?')) {
      try {
        if (type === 'layer') {
          App.Map.Layers.Presets.deletePreset(id);
        } else {
          App.UI.State.deletePreset(id);
        }
        
        _populatePresets(type);
        _showNotification(App.I18n ? App.I18n.t('presets.preset_deleted_successfully') : 'Preset deleted successfully', 'warning');
      } catch (error) {
        console.error('Failed to delete preset:', error);
        _showNotification(App.I18n ? App.I18n.t('presets.failed_to_delete_preset') : 'Failed to delete preset', 'danger');
      }
    }
  }
  
  /**
   * Show a notification
   * @private
   * @param {string} message - Notification message
   * @param {string} variant - Alert variant (success, warning, danger)
   */
  function _showNotification(message, variant) {
    var alert = document.createElement('sl-alert');
    alert.variant = variant;
    alert.closable = true;
    alert.duration = 3000;
    alert.innerHTML = `
      <sl-icon slot="icon" name="${variant === 'success' ? 'check-circle' : variant === 'danger' ? 'exclamation-circle' : 'info-circle'}"></sl-icon>
      ${message}
    `;
    
    document.body.appendChild(alert);
    alert.toast();
  }
  
  // Public API
  return {
    /**
     * Initialize the presets UI
     */
    initialize: function() {
      if (_initialized) return;
      
      console.log("[Presets UI] Initializing preset management UI");
      
      // Add preset buttons to appropriate drawers
      setTimeout(function() {
        console.log("[Presets UI] Attempting to add preset buttons...");
        
        // Add to Feature Layers drawer - find the h3 title
        var layersTitle = document.querySelector('#left4-drawer h3');
        console.log("[Presets UI] Feature Layers title found:", !!layersTitle);
        if (layersTitle) {
          var layerPresetBtn = _createPresetButton('layer');
          layerPresetBtn.style.float = 'right';
          layerPresetBtn.style.marginTop = '-5px';
          layersTitle.parentNode.insertBefore(layerPresetBtn, layersTitle.nextSibling);
          console.log("[Presets UI] Layer preset button added");
        }
        
        // Add to Settings drawer - look in the correct location (left2-drawer)
        var settingsLocations = [
          '#left2-drawer .controls',  // Main settings location
          '#left2-drawer sl-tab-panel[name="ui"] .controls',  // UI tab panel
          '#left2-drawer .sidebar-content'  // Fallback
        ];
        
        var added = false;
        for (var i = 0; i < settingsLocations.length && !added; i++) {
          var settingsContainer = document.querySelector(settingsLocations[i]);
          if (settingsContainer && !document.querySelector('.ui-presets-section')) {
            var uiPresetsSection = document.createElement('div');
            uiPresetsSection.className = 'ui-presets-section';
            uiPresetsSection.style.marginTop = '20px';
            uiPresetsSection.innerHTML = `
              <sl-divider></sl-divider>
              <h3 style="margin-top: 20px; margin-bottom: 10px;">${App.I18n ? App.I18n.t('presets.ui_presets') : 'UI Presets'}</h3>
              <p style="margin-bottom: 10px; color: var(--sl-color-neutral-600);">${App.I18n ? App.I18n.t('presets.save_restore_ui_layout') : 'Save and restore UI layout configurations'}</p>
            `;
            
            var uiPresetBtn = _createPresetButton('ui');
            uiPresetBtn.style.width = '100%';
            uiPresetsSection.appendChild(uiPresetBtn);
            
            settingsContainer.appendChild(uiPresetsSection);
            console.log("[Presets UI] UI preset section added to:", settingsLocations[i]);
            added = true;
          }
        }
      }, 2000);
      
      _initialized = true;
      console.log("[Presets UI] Preset management UI initialized");
    },
    
    /**
     * Show layer presets dialog
     */
    showLayerPresets: function() {
      _showPresetDialog('layer');
    },
    
    /**
     * Show UI presets dialog  
     */
    showUIPresets: function() {
      _showPresetDialog('ui');
    },
    
    /**
     * Manually add preset buttons (for debugging)
     */
    addPresetButtons: function() {
      console.log("[Presets UI] Manual button addition triggered");
      
      // Try to add layer preset button
      var layersContainer = document.querySelector('#left4-drawer .sidebar-content');
      if (layersContainer) {
        var existingBtn = layersContainer.querySelector('sl-button[slot="prefix"]');
        if (!existingBtn) {
          var h3 = layersContainer.querySelector('h3');
          if (h3) {
            var wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.justifyContent = 'space-between';
            wrapper.style.alignItems = 'center';
            wrapper.style.marginBottom = '10px';
            
            h3.parentNode.insertBefore(wrapper, h3);
            wrapper.appendChild(h3);
            
            var layerPresetBtn = _createPresetButton('layer');
            wrapper.appendChild(layerPresetBtn);
            console.log("[Presets UI] Layer preset button added manually");
          }
        }
      }
      
      // Try to add UI preset section - look in the correct settings drawer
      var settingsLocations = [
        '#left2-drawer .controls',  // Main settings location
        '#left2-drawer sl-tab-panel[name="ui"] .controls',  // UI tab panel
        '#left2-drawer .sidebar-content'  // Fallback
      ];
      
      var added = false;
      for (var i = 0; i < settingsLocations.length && !added; i++) {
        var settingsContainer = document.querySelector(settingsLocations[i]);
        if (settingsContainer && !document.querySelector('.ui-presets-section')) {
          var uiPresetsSection = document.createElement('div');
          uiPresetsSection.className = 'ui-presets-section';
          uiPresetsSection.style.marginTop = '20px';
          uiPresetsSection.innerHTML = `
            <sl-divider></sl-divider>
            <h3 style="margin-top: 20px; margin-bottom: 10px;">${App.I18n ? App.I18n.t('presets.ui_presets') : 'UI Presets'}</h3>
            <p style="margin-bottom: 10px; color: var(--sl-color-neutral-600);">${App.I18n ? App.I18n.t('presets.save_restore_ui_layout') : 'Save and restore UI layout configurations'}</p>
          `;
          
          var uiPresetBtn = _createPresetButton('ui');
          uiPresetBtn.style.width = '100%';
          uiPresetsSection.appendChild(uiPresetBtn);
          
          settingsContainer.appendChild(uiPresetsSection);
          console.log("[Presets UI] UI preset section added to:", settingsLocations[i]);
          added = true;
        }
      }
      
      if (!added) {
        console.log("[Presets UI] Could not find suitable location for UI preset button");
      }
    }
  };
})();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Wait for other components to be ready
  customElements.whenDefined('sl-drawer').then(function() {
    setTimeout(function() {
      App.UI.Presets.initialize();
    }, 2000);
  });
});

console.log("app.ui.presets.js loaded - App.UI.Presets module created");