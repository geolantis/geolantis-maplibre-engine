/**
 * Basemap Layer Management UI
 * @namespace App.Map.Basemap.UI
 */
App.Map = App.Map || {};
App.Map.Basemap = App.Map.Basemap || {};
App.Map.Basemap.UI = (function () {
  // Private variables
  var _map = null;
  var _layerSettings = new Map();
  var _categorySettings = new Map();
  var _allExpanded = true;
  var _initialized = false;
  var _searchTerm = '';

  // Layer type configurations
  var _layerTypeConfig = {
    background: { icon: 'square-fill', label: 'Background', color: '#666' },
    fill: { icon: 'hexagon-fill', label: 'Fill', color: '#4A90E2' },
    line: { icon: 'minus', label: 'Line', color: '#F5A623' },
    symbol: { icon: 'type', label: 'Symbol', color: '#7ED321' },
    circle: { icon: 'circle-fill', label: 'Circle', color: '#BD10E0' },
    raster: { icon: 'image', label: 'Raster', color: '#9013FE' },
    hillshade: { icon: 'terrain', label: 'Hillshade', color: '#8B4513' },
    heatmap: { icon: 'thermometer', label: 'Heatmap', color: '#FF0000' },
    'fill-extrusion': { icon: 'building', label: '3D Fill', color: '#50E3C2' }
  };

  /**
   * Initialize the basemap layers UI
   * @param {Object} map - MapLibre map instance
   */
  function initialize(map) {
    _map = map;
    _initialized = true;

    // Create initial UI
    _createBasemapLayersUI();

    // Listen for basemap changes
    App.Core.Events.on('basemap:changed', function() {
      _refreshLayerList();
    });

    // Listen for style load events
    _map.on('style.load', function() {
      _refreshLayerList();
    });

    console.log('Basemap UI initialized');
  }

  /**
   * Create the main UI structure
   * @private
   */
  function _createBasemapLayersUI() {
    const container = document.getElementById('basemap-layers-container');
    if (!container) {
      console.error('Basemap layers container not found');
      return;
    }

    // Create header with controls
    const header = document.createElement('div');
    header.className = 'bl-header';
    header.innerHTML = `
      <div class="bl-header-content">
        <div class="bl-header-left">
          <sl-tooltip content="Collapse all categories">
            <sl-icon-button name="chevron-down" class="bl-expand-collapse-btn"></sl-icon-button>
          </sl-tooltip>
          <span class="bl-header-title">Basemap</span>
        </div>
        <div class="bl-master-controls">
          <div class="bl-master-control">
            <sl-checkbox class="bl-master-visibility" checked></sl-checkbox>
            <span class="bl-control-label">Visible</span>
          </div>
          <div class="bl-master-control">
            <sl-checkbox class="bl-master-selectability"></sl-checkbox>
            <span class="bl-control-label">Select</span>
          </div>
        </div>
      </div>
    `;

    // Create search input
    const searchContainer = document.createElement('div');
    searchContainer.className = 'bl-search-container';
    searchContainer.innerHTML = `
      <sl-input placeholder="Search basemap layers..." size="small" clearable>
        <sl-icon name="search" slot="prefix"></sl-icon>
      </sl-input>
    `;

    // Create layers container
    const layersContainer = document.createElement('div');
    layersContainer.id = 'basemapLayersList';
    layersContainer.className = 'bl-layers-container';

    // Append all elements
    container.innerHTML = '';
    container.appendChild(header);
    container.appendChild(searchContainer);
    container.appendChild(layersContainer);

    // Set up event listeners
    _setupEventListeners();

    // Initial population
    _refreshLayerList();
  }

  /**
   * Set up event listeners for UI controls
   * @private
   */
  function _setupEventListeners() {
    // Expand/collapse all button
    const expandCollapseBtn = document.querySelector('.bl-expand-collapse-btn');
    if (expandCollapseBtn) {
      expandCollapseBtn.addEventListener('click', _toggleAllCategories);
    }

    // Master visibility checkbox
    const masterVisibility = document.querySelector('.bl-master-visibility');
    if (masterVisibility) {
      masterVisibility.addEventListener('sl-change', function(e) {
        _setAllLayersVisibility(e.target.checked);
      });
    }

    // Master selectability checkbox
    const masterSelectability = document.querySelector('.bl-master-selectability');
    if (masterSelectability) {
      masterSelectability.addEventListener('sl-change', function(e) {
        _setAllLayersSelectability(e.target.checked);
      });
    }

    // Search input
    const searchInput = document.querySelector('.bl-search-container sl-input');
    if (searchInput) {
      searchInput.addEventListener('sl-input', function(e) {
        _searchTerm = e.target.value.toLowerCase();
        _filterLayers();
      });
    }
  }

  /**
   * Refresh the layer list from current map style
   * @private
   */
  function _refreshLayerList() {
    if (!_map || !_map.getStyle()) return;

    const container = document.getElementById('basemapLayersList');
    if (!container) return;

    container.innerHTML = '';
    
    // Get all layers and group by type
    const layers = _map.getStyle().layers;
    const groupedLayers = _groupLayersByType(layers);

    // Create UI for each group
    Object.entries(groupedLayers).forEach(([type, layerList]) => {
      if (layerList.length === 0) return;

      const categoryDiv = _createCategorySection(type, layerList);
      container.appendChild(categoryDiv);
    });

    // Apply search filter if active
    if (_searchTerm) {
      _filterLayers();
    }
  }

  /**
   * Group layers by their type
   * @param {Array} layers - Array of layer objects
   * @returns {Object} Grouped layers by type
   * @private
   */
  function _groupLayersByType(layers) {
    const groups = {};

    layers.forEach(layer => {
      // Skip user-added layers
      if (_isUserAddedLayer(layer)) return;

      const type = layer.type || 'other';
      if (!groups[type]) {
        groups[type] = [];
      }

      // Initialize layer settings if not exists
      if (!_layerSettings.has(layer.id)) {
        _layerSettings.set(layer.id, {
          visible: layer.layout?.visibility !== 'none',
          opacity: _getLayerOpacity(layer),
          selectable: false, // Basemap layers are typically not selectable
          minzoom: layer.minzoom || 0,
          maxzoom: layer.maxzoom || 24
        });
      }

      groups[type].push(layer);
    });

    return groups;
  }

  /**
   * Check if a layer is user-added (GeoJSON)
   * @param {Object} layer - Layer object
   * @returns {boolean}
   * @private
   */
  function _isUserAddedLayer(layer) {
    if (!layer.source || !_map) return false;
    
    const source = _map.getSource(layer.source);
    return source && source.type === 'geojson';
  }

  /**
   * Get current opacity of a layer
   * @param {Object} layer - Layer object
   * @returns {number} Opacity value 0-100
   * @private
   */
  function _getLayerOpacity(layer) {
    if (!layer.paint) return 100;

    // Check various paint properties for opacity
    const opacityProps = [
      'fill-opacity',
      'line-opacity',
      'circle-opacity',
      'icon-opacity',
      'text-opacity',
      'raster-opacity'
    ];

    for (const prop of opacityProps) {
      if (layer.paint[prop] !== undefined) {
        const value = layer.paint[prop];
        // Handle expressions and constants
        if (typeof value === 'number') {
          return Math.round(value * 100);
        } else if (Array.isArray(value) && typeof value[value.length - 1] === 'number') {
          // Handle expressions like ["interpolate", ["linear"], ["zoom"], 10, 0, 15, 1]
          return Math.round(value[value.length - 1] * 100);
        }
      }
    }

    // Special case for hillshade
    if (layer.type === 'hillshade' && layer.paint['hillshade-exaggeration'] !== undefined) {
      return Math.round(layer.paint['hillshade-exaggeration'] * 100);
    }

    return 100;
  }

  /**
   * Create a category section
   * @param {string} type - Layer type
   * @param {Array} layers - Layers in this category
   * @returns {HTMLElement} Category element
   * @private
   */
  function _createCategorySection(type, layers) {
    const config = _layerTypeConfig[type] || { icon: 'layers', label: type, color: '#888' };
    
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'bl-category expanded';
    categoryDiv.dataset.type = type;

    // Initialize category settings
    if (!_categorySettings.has(type)) {
      _categorySettings.set(type, {
        visible: true,
        expanded: true,
        selectable: false
      });
    }

    // Category header
    const header = document.createElement('div');
    header.className = 'bl-category-header';
    header.innerHTML = `
      <div class="bl-category-header-left">
        <sl-icon name="chevron-down" class="bl-chevron"></sl-icon>
        <sl-icon name="${config.icon}" style="color: ${config.color}"></sl-icon>
        <span class="bl-category-name">${config.label} (${layers.length})</span>
      </div>
      <div class="bl-category-controls">
        <sl-checkbox class="bl-category-visibility" ${_categorySettings.get(type).visible ? 'checked' : ''}></sl-checkbox>
        <sl-checkbox class="bl-category-selectability" ${_categorySettings.get(type).selectable ? 'checked' : ''}></sl-checkbox>
      </div>
    `;

    // Layer list
    const layerList = document.createElement('div');
    layerList.className = 'bl-layer-list expanded';

    // Add layers
    layers.forEach(layer => {
      const layerItem = _createLayerItem(layer, config);
      layerList.appendChild(layerItem);
    });

    categoryDiv.appendChild(header);
    categoryDiv.appendChild(layerList);

    // Set up category event listeners
    _setupCategoryEventListeners(categoryDiv, type, layers);

    return categoryDiv;
  }

  /**
   * Create a layer item
   * @param {Object} layer - Layer object
   * @param {Object} config - Type configuration
   * @returns {HTMLElement} Layer item element
   * @private
   */
  function _createLayerItem(layer, config) {
    const settings = _layerSettings.get(layer.id);
    
    const item = document.createElement('div');
    item.className = 'bl-layer-item';
    item.dataset.layerId = layer.id;

    // Get zoom constraints
    const minZoom = layer.minzoom || 0;
    const maxZoom = layer.maxzoom || 24;
    const zoomInfo = `Zoom: ${minZoom}-${maxZoom}`;

    // Extract layer color from paint properties
    const layerColor = _getLayerColor(layer) || config.color;

    // Create icon element based on layer type
    const iconHtml = _createLayerIcon(layer, config, layerColor);

    item.innerHTML = `
      <div class="bl-layer-content">
        ${iconHtml}
        <div class="bl-layer-info">
          <span class="bl-layer-name" title="${layer.id}">${layer.id}</span>
          <span class="bl-layer-zoom">${zoomInfo}</span>
        </div>
      </div>
      <div class="bl-layer-controls">
        <sl-checkbox class="bl-layer-visibility" ${settings.visible ? 'checked' : ''}></sl-checkbox>
        <sl-checkbox class="bl-layer-selectability" ${settings.selectable ? 'checked' : ''}></sl-checkbox>
        <sl-icon-button name="gear" class="bl-layer-settings"></sl-icon-button>
      </div>
    `;

    // Set up layer event listeners
    _setupLayerEventListeners(item, layer);

    return item;
  }

  /**
   * Set up event listeners for a category
   * @param {HTMLElement} categoryDiv - Category element
   * @param {string} type - Layer type
   * @param {Array} layers - Layers in category
   * @private
   */
  function _setupCategoryEventListeners(categoryDiv, type, layers) {
    // Header click for expand/collapse
    const header = categoryDiv.querySelector('.bl-category-header');
    header.addEventListener('click', function(e) {
      if (e.target.closest('.bl-category-controls')) return;
      
      const expanded = categoryDiv.classList.toggle('expanded');
      const chevron = categoryDiv.querySelector('.bl-chevron');
      chevron.style.transform = expanded ? 'rotate(0deg)' : 'rotate(-90deg)';
      
      const layerList = categoryDiv.querySelector('.bl-layer-list');
      layerList.classList.toggle('expanded');
      
      _categorySettings.get(type).expanded = expanded;
    });

    // Category visibility checkbox
    const visibilityCheckbox = categoryDiv.querySelector('.bl-category-visibility');
    visibilityCheckbox.addEventListener('sl-change', function(e) {
      const visible = e.target.checked;
      _categorySettings.get(type).visible = visible;
      
      // Update all layers in category
      layers.forEach(layer => {
        _setLayerVisibility(layer.id, visible);
        const layerCheckbox = categoryDiv.querySelector(`[data-layer-id="${layer.id}"] .bl-layer-visibility`);
        if (layerCheckbox) layerCheckbox.checked = visible;
      });
    });

    // Category selectability checkbox
    const selectabilityCheckbox = categoryDiv.querySelector('.bl-category-selectability');
    selectabilityCheckbox.addEventListener('sl-change', function(e) {
      const selectable = e.target.checked;
      _categorySettings.get(type).selectable = selectable;
      
      // Update all layers in category
      layers.forEach(layer => {
        _setLayerSelectability(layer.id, selectable);
        const layerCheckbox = categoryDiv.querySelector(`[data-layer-id="${layer.id}"] .bl-layer-selectability`);
        if (layerCheckbox) layerCheckbox.checked = selectable;
      });
    });
  }

  /**
   * Set up event listeners for a layer item
   * @param {HTMLElement} item - Layer item element
   * @param {Object} layer - Layer object
   * @private
   */
  function _setupLayerEventListeners(item, layer) {
    // Layer visibility checkbox
    const visibilityCheckbox = item.querySelector('.bl-layer-visibility');
    visibilityCheckbox.addEventListener('sl-change', function(e) {
      _setLayerVisibility(layer.id, e.target.checked);
    });

    // Layer selectability checkbox
    const selectabilityCheckbox = item.querySelector('.bl-layer-selectability');
    selectabilityCheckbox.addEventListener('sl-change', function(e) {
      _setLayerSelectability(layer.id, e.target.checked);
    });

    // Settings button
    const settingsBtn = item.querySelector('.bl-layer-settings');
    settingsBtn.addEventListener('click', function() {
      _showLayerSettings(layer);
    });
  }

  /**
   * Set visibility for a specific layer
   * @param {string} layerId - Layer ID
   * @param {boolean} visible - Visibility state
   * @private
   */
  function _setLayerVisibility(layerId, visible) {
    if (!_map || !_map.getLayer(layerId)) return;

    _map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
    
    const settings = _layerSettings.get(layerId);
    if (settings) {
      settings.visible = visible;
    }
  }

  /**
   * Set visibility for all layers
   * @param {boolean} visible - Visibility state
   * @private
   */
  function _setAllLayersVisibility(visible) {
    const layers = _map.getStyle().layers;
    
    layers.forEach(layer => {
      if (!_isUserAddedLayer(layer)) {
        _setLayerVisibility(layer.id, visible);
      }
    });

    // Update all checkboxes
    document.querySelectorAll('.bl-layer-visibility').forEach(checkbox => {
      checkbox.checked = visible;
    });

    document.querySelectorAll('.bl-category-visibility').forEach(checkbox => {
      checkbox.checked = visible;
    });

    // Update category settings
    _categorySettings.forEach((settings, type) => {
      settings.visible = visible;
    });
  }

  /**
   * Show layer settings dialog
   * @param {Object} layer - Layer object
   * @private
   */
  function _showLayerSettings(layer) {
    const settings = _layerSettings.get(layer.id);
    
    // Create dialog
    const dialog = document.createElement('sl-dialog');
    dialog.label = `Layer Settings: ${layer.id}`;
    dialog.className = 'bl-settings-dialog';

    const content = document.createElement('div');
    content.innerHTML = `
      <div class="bl-settings-content">
        <div class="bl-setting-group">
          <label>Opacity</label>
          <sl-range 
            min="0" 
            max="100" 
            value="${settings.opacity}" 
            label="Opacity"
            class="bl-opacity-slider"
          >
            <span slot="suffix">${settings.opacity}%</span>
          </sl-range>
        </div>
        <div class="bl-setting-group">
          <label>Zoom Range</label>
          <div class="bl-zoom-controls">
            <div class="bl-zoom-input">
              <label>Min Zoom</label>
              <sl-input 
                type="number" 
                min="0" 
                max="24" 
                value="${settings.minzoom}" 
                size="small"
                class="bl-minzoom-input"
              ></sl-input>
            </div>
            <div class="bl-zoom-input">
              <label>Max Zoom</label>
              <sl-input 
                type="number" 
                min="0" 
                max="24" 
                value="${settings.maxzoom}" 
                size="small"
                class="bl-maxzoom-input"
              ></sl-input>
            </div>
          </div>
        </div>
        <div class="bl-setting-group">
          <label>Layer Information</label>
          <div class="bl-layer-details">
            <p><strong>ID:</strong> ${layer.id}</p>
            <p><strong>Type:</strong> ${layer.type}</p>
            <p><strong>Source:</strong> ${layer.source || 'None'}</p>
            <p><strong>Source Layer:</strong> ${layer['source-layer'] || 'None'}</p>
          </div>
        </div>
      </div>
    `;

    dialog.appendChild(content);
    document.body.appendChild(dialog);

    // Handle opacity changes
    const opacitySlider = dialog.querySelector('.bl-opacity-slider');
    opacitySlider.addEventListener('sl-input', function(e) {
      const opacity = e.target.value;
      _setLayerOpacity(layer, opacity);
      e.target.querySelector('[slot="suffix"]').textContent = `${opacity}%`;
    });

    // Handle zoom changes
    const minZoomInput = dialog.querySelector('.bl-minzoom-input');
    const maxZoomInput = dialog.querySelector('.bl-maxzoom-input');
    
    minZoomInput.addEventListener('sl-change', function(e) {
      const minZoom = parseInt(e.target.value) || 0;
      _setLayerZoomRange(layer.id, minZoom, settings.maxzoom);
      settings.minzoom = minZoom;
    });
    
    maxZoomInput.addEventListener('sl-change', function(e) {
      const maxZoom = parseInt(e.target.value) || 24;
      _setLayerZoomRange(layer.id, settings.minzoom, maxZoom);
      settings.maxzoom = maxZoom;
    });

    // Show dialog
    dialog.show();

    // Clean up on close
    dialog.addEventListener('sl-after-hide', () => {
      dialog.remove();
    });
  }

  /**
   * Set layer opacity
   * @param {Object} layer - Layer object
   * @param {number} opacity - Opacity value (0-100)
   * @private
   */
  function _setLayerOpacity(layer, opacity) {
    const opacityValue = opacity / 100;
    
    try {
      // Update appropriate paint property based on layer type
      switch (layer.type) {
        case 'fill':
          _map.setPaintProperty(layer.id, 'fill-opacity', opacityValue);
          break;
        case 'line':
          _map.setPaintProperty(layer.id, 'line-opacity', opacityValue);
          break;
        case 'circle':
          _map.setPaintProperty(layer.id, 'circle-opacity', opacityValue);
          break;
        case 'symbol':
          // For symbols, we need to set both icon and text opacity
          try {
            _map.setPaintProperty(layer.id, 'icon-opacity', opacityValue);
          } catch (e) {
            // Property might not exist
          }
          try {
            _map.setPaintProperty(layer.id, 'text-opacity', opacityValue);
          } catch (e) {
            // Property might not exist
          }
          break;
        case 'raster':
          _map.setPaintProperty(layer.id, 'raster-opacity', opacityValue);
          break;
        case 'hillshade':
          // Hillshade uses exaggeration, not opacity
          _map.setPaintProperty(layer.id, 'hillshade-exaggeration', opacityValue);
          break;
        case 'background':
          // Background layers use background-opacity
          _map.setPaintProperty(layer.id, 'background-opacity', opacityValue);
          break;
      }
    } catch (error) {
      console.warn(`Could not set opacity for layer ${layer.id}:`, error);
    }

    // Update settings
    const settings = _layerSettings.get(layer.id);
    if (settings) {
      settings.opacity = opacity;
    }
  }

  /**
   * Toggle all categories expanded/collapsed
   * @private
   */
  function _toggleAllCategories() {
    _allExpanded = !_allExpanded;
    
    const categories = document.querySelectorAll('.bl-category');
    categories.forEach(category => {
      if (_allExpanded) {
        category.classList.add('expanded');
      } else {
        category.classList.remove('expanded');
      }
      
      const chevron = category.querySelector('.bl-chevron');
      chevron.style.transform = _allExpanded ? 'rotate(0deg)' : 'rotate(-90deg)';
      
      const layerList = category.querySelector('.bl-layer-list');
      if (_allExpanded) {
        layerList.classList.add('expanded');
      } else {
        layerList.classList.remove('expanded');
      }
    });

    // Update button
    const btn = document.querySelector('.bl-expand-collapse-btn');
    if (btn) {
      btn.name = _allExpanded ? 'chevron-down' : 'chevron-right';
      const tooltip = btn.closest('sl-tooltip');
      if (tooltip) {
        tooltip.content = _allExpanded ? 'Collapse all categories' : 'Expand all categories';
      }
    }
  }

  /**
   * Filter layers based on search term
   * @private
   */
  function _filterLayers() {
    const layerItems = document.querySelectorAll('.bl-layer-item');
    const categories = document.querySelectorAll('.bl-category');

    layerItems.forEach(item => {
      const layerName = item.querySelector('.bl-layer-name').textContent.toLowerCase();
      const matches = layerName.includes(_searchTerm);
      item.style.display = matches ? '' : 'none';
    });

    // Hide empty categories
    categories.forEach(category => {
      const visibleItems = category.querySelectorAll('.bl-layer-item:not([style*="display: none"])');
      category.style.display = visibleItems.length > 0 ? '' : 'none';
    });
  }

  /**
   * Get the primary color from a layer's paint properties
   * @param {Object} layer - Layer object
   * @returns {string|null} Hex color string or null
   * @private
   */
  function _getLayerColor(layer) {
    if (!layer.paint) return null;

    // Map of paint properties to check for each layer type
    const colorProperties = {
      'fill': ['fill-color', 'fill-outline-color'],
      'line': ['line-color'],
      'circle': ['circle-color', 'circle-stroke-color'],
      'symbol': ['text-color', 'icon-color'],
      'background': ['background-color'],
      'fill-extrusion': ['fill-extrusion-color']
    };

    const properties = colorProperties[layer.type] || [];
    
    for (const prop of properties) {
      if (layer.paint[prop]) {
        const value = layer.paint[prop];
        // Handle simple color strings
        if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
          return value;
        }
        // Handle expressions - try to extract a color
        if (Array.isArray(value)) {
          // Look for color values in the expression
          for (let i = value.length - 1; i >= 0; i--) {
            if (typeof value[i] === 'string' && (value[i].startsWith('#') || value[i].startsWith('rgb'))) {
              return value[i];
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Create an icon element for a layer
   * @param {Object} layer - Layer object
   * @param {Object} config - Type configuration
   * @param {string} color - Color to use
   * @returns {string} HTML string for icon
   * @private
   */
  function _createLayerIcon(layer, config, color) {
    const iconColor = color || config.color;
    
    switch (layer.type) {
      case 'fill':
      case 'fill-extrusion':
        // Create a filled square/polygon icon
        return `<div class="bl-layer-icon bl-icon-fill" style="background-color: ${iconColor}; width: 18px; height: 18px; border-radius: 4px; opacity: 0.8;"></div>`;
      
      case 'line':
        // Create a line icon
        return `<div class="bl-layer-icon bl-icon-line" style="background-color: ${iconColor}; width: 20px; height: 3px; border-radius: 2px;"></div>`;
      
      case 'circle':
        // Create a circle icon
        return `<div class="bl-layer-icon bl-icon-circle" style="background-color: ${iconColor}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid ${iconColor};"></div>`;
      
      case 'symbol':
        // For symbols, show text icon with color
        return `<sl-icon name="${config.icon}" style="color: ${iconColor}; width: 18px; height: 18px;"></sl-icon>`;
      
      default:
        // Default to icon from config
        return `<sl-icon name="${config.icon}" style="color: ${iconColor}; width: 18px; height: 18px;"></sl-icon>`;
    }
  }

  // Public API
  return {
    initialize: initialize,
    refresh: _refreshLayerList,
    isInitialized: function() { return _initialized; }
  };
})();