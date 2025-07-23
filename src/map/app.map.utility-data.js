/**
 * Utility Data management for Map Engine
 * @namespace App.Map.UtilityData
 */
App.Map = App.Map || {};
App.Map.UtilityData = (function() {
    var _utilityData = [];
    var _map = null;
    var _initialized = false;
    var _container = null;
    var _layerGroups = new Map();

    // Layer configuration for different utility types
    var _layerConfig = {
        'LP Main': {
            type: 'line',
            paint: {
                'line-color': '#1976d2',
                'line-width': 3,
                'line-opacity': 0.8
            }
        },
        'MP Main': {
            type: 'line',
            paint: {
                'line-color': '#f57c00',
                'line-width': 4,
                'line-opacity': 0.9
            }
        },
        'LP Service': {
            type: 'line',
            paint: {
                'line-color': '#388e3c',
                'line-width': 2,
                'line-opacity': 0.7
            }
        },
        'LP Valve': {
            type: 'line',
            paint: {
                'line-color': '#d32f2f',
                'line-width': 5,
                'line-opacity': 1.0
            }
        },
        'MP Valve': {
            type: 'line', 
            paint: {
                'line-color': '#7b1fa2',
                'line-width': 6,
                'line-opacity': 1.0
            }
        }
    };

    /**
     * Initialize utility data functionality
     * @param {Object} map - MapLibre map instance
     */
    function initialize(map) {
        if (_initialized) {
            console.log('🔥 UTILITY DATA - Already initialized');
            _updateDebugStatus('Already initialized');
            return;
        }
        
        _map = map || App.Map.Init.getMap();
        _container = document.getElementById('utility-data-list');
        
        console.log('🔥 UTILITY DATA - Module initialized', {
            map: !!_map,
            container: !!_container
        });
        
        _updateDebugStatus(`Module initialized. Map: ${!!_map}, Container: ${!!_container}`);
        
        // Set up action buttons
        _setupActionButtons();
        
        // Listen for drawer/tab changes
        if (App.Core && App.Core.Events) {
            App.Core.Events.on('drawer:shown', function(drawerId) {
                if (drawerId === 'left1-drawer') {
                    setTimeout(_updateUI, 100);
                }
            });
        }
        
        document.addEventListener('sl-tab-show', function(event) {
            console.log('🔥 UTILITY DATA - Tab shown:', event.detail.name);
            if (event.detail.name === 'utility-data') {
                _updateDebugStatus('Tab shown, loading data...');
                setTimeout(() => {
                    _updateUI();
                    _loadUtilityDataFromAPI();
                }, 100);
            }
        });
        
        // Load utility data automatically on initialization
        _loadUtilityDataFromAPI();
        
        _initialized = true;
    }

    /**
     * Load utility data from API
     */
    function _loadUtilityDataFromAPI() {
        _updateDebugStatus('Loading utility data from API...');
        
        // Determine the API base URL
        const apiBaseUrl = _getApiBaseUrl();
        const apiUrl = `${apiBaseUrl}/api/utility-data`;
        
        console.log('🔥 UTILITY DATA - Fetching from:', apiUrl);
        _updateDebugStatus(`Fetching from: ${apiUrl}`);
        
        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(response => {
            console.log('🔥 UTILITY DATA - API Response status:', response.status);
            _updateDebugStatus(`API Response: ${response.status} ${response.statusText}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('⚡ UTILITY DATA - Loaded from API:', data);
            _updateDebugStatus(`Data loaded: ${data ? data.length : 0} collections`);
            _loadUtilityData(data);
        })
        .catch(error => {
            console.error('❌ UTILITY DATA - Failed to load from API:', error);
            _updateDebugStatus(`API Error: ${error.message}`);
            _showEmptyState();
        });
    }
    
    /**
     * Get API base URL based on current environment
     */
    function _getApiBaseUrl() {
        const hostname = window.location.hostname;
        
        // Check if we're in development (localhost)
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8000';
        }
        
        // Check if we're on the production domain
        if (hostname === 'tools.geolantis.com') {
            return 'https://tools.geolantis.com';
        }
        
        // For Vercel previews or other domains, use same domain
        return `https://${hostname}`;
    }

    /**
     * Load utility data and create map layers
     */
    function _loadUtilityData(data) {
        console.log('🔥 UTILITY DATA - Loading utility data:', data);
        console.log('🔥 UTILITY DATA - Data type:', typeof data);
        console.log('🔥 UTILITY DATA - Is array:', Array.isArray(data));
        
        _updateDebugStatus(`Received data: ${data ? data.length : 0} collections`);
        
        if (!data || !Array.isArray(data)) {
            console.warn('🔥 UTILITY DATA - Invalid utility data format');
            _updateDebugStatus('ERROR: Invalid data format');
            _showEmptyState();
            return;
        }

        _utilityData = data;
        
        // Clear existing layers first
        _clearLayers();
        
        let totalFeatures = 0;
        
        // Process each GeoJSON FeatureCollection
        data.forEach((collection, index) => {
            console.log(`🔥 Collection ${index}:`, collection);
            if (collection.type === 'FeatureCollection' && collection.features) {
                console.log(`🔥 UTILITY DATA - Processing collection ${index} with ${collection.features.length} features`);
                
                // Sample first few features to see their subtypes
                const sampleFeatures = collection.features.slice(0, 10);
                const sampleSubtypes = sampleFeatures.map(f => f.properties?.subtype);
                console.log('🔥 Sample subtypes from collection:', sampleSubtypes);
                
                totalFeatures += collection.features.length;
                _processFeatureCollection(collection, index);
            }
        });

        _updateDebugStatus(`Processed ${totalFeatures} features, creating ${_layerGroups.size} layers`);

        // Force UI update
        setTimeout(() => {
            _updateUI();
            _hideEmptyState();
        }, 100);
    }

    /**
     * Process a GeoJSON FeatureCollection and create map layers
     */
    function _processFeatureCollection(collection, collectionIndex) {
        const featuresByType = new Map();
        
        // Group features by subtype
        collection.features.forEach(feature => {
            const subtype = feature.properties?.subtype || 'Unknown';
            if (!featuresByType.has(subtype)) {
                featuresByType.set(subtype, []);
            }
            featuresByType.get(subtype).push(feature);
        });

        // Create layers for each subtype
        console.log(`🏗️ Creating layers for subtypes:`, Array.from(featuresByType.keys()));
        featuresByType.forEach((features, subtype) => {
            console.log(`🏗️ Creating layer for ${subtype} with ${features.length} features`);
            _createUtilityLayer(subtype, features, collectionIndex);
        });
    }

    /**
     * Create a map layer for utility features
     */
    function _createUtilityLayer(subtype, features, collectionIndex) {
        const layerId = `utility-${subtype.replace(/\s+/g, '-').toLowerCase()}-${collectionIndex}`;
        const sourceId = `${layerId}-source`;
        
        console.log(`Creating layer ${layerId} for ${subtype} with ${features.length} features`);
        
        const geojson = {
            type: 'FeatureCollection',
            features: features
        };

        // Debug the exact subtype value
        console.log(`🔍 DEBUG: Looking for subtype: '${subtype}' (type: ${typeof subtype})`);
        console.log(`🔍 Available config keys:`, Object.keys(_layerConfig));
        
        // Normalize and find config with flexible matching
        const normalizedSubtype = subtype?.toString().trim();
        let config = _layerConfig[normalizedSubtype];

        if (!config) {
            console.warn(`❌ No exact match for subtype '${normalizedSubtype}', trying fallbacks...`);
            
            // Try case-insensitive matching
            const foundKey = Object.keys(_layerConfig).find(key => 
                key.toLowerCase() === normalizedSubtype.toLowerCase()
            );
            
            if (foundKey) {
                config = _layerConfig[foundKey];
                console.log(`✅ Found case-insensitive match: '${foundKey}'`);
            } else {
                config = _layerConfig['LP Main'];
                console.warn(`⚠️  Using fallback config for unmatched subtype '${normalizedSubtype}'`);
            }
        }

        console.log(`🎨 Layer ${layerId}: ${normalizedSubtype} -> ${config.paint['line-color']}`);
        
        try {
            if (!_map) {
                console.warn('Map not available, skipping layer creation for', layerId);
                // Still store layer info for UI
                _layerGroups.set(layerId, {
                    subtype: subtype,
                    features: features,
                    visible: true,
                    pending: true
                });
                return;
            }
            
            // Wait for map style to be loaded if needed
            if (!_map.isStyleLoaded()) {
                console.log('Map style not ready, waiting for', layerId);
                _layerGroups.set(layerId, {
                    subtype: subtype,
                    features: features,
                    visible: true,
                    pending: true
                });
                
                // Use setTimeout instead of styledata event to avoid infinite loops
                setTimeout(() => {
                    console.log('Retrying layer creation for', layerId);
                    if (_map && _map.isStyleLoaded()) {
                        _createUtilityLayer(subtype, features, collectionIndex);
                    }
                }, 100);
                return;
            }
            
            // Add source
            if (!_map.getSource(sourceId)) {
                _map.addSource(sourceId, {
                    type: 'geojson',
                    data: geojson
                });
            }

            // Add layer - all utilities are lines in this dataset
            const geometryType = features[0]?.geometry?.type;
            let layerConfig = {
                id: layerId,
                source: sourceId,
                type: 'line', // All features are LineString geometry
                paint: config.paint,
                layout: config.layout || {}
            };
            

            if (!_map.getLayer(layerId)) {
                _map.addLayer(layerConfig);
                
                // Add click handler
                _map.on('click', layerId, (e) => {
                    _showFeaturePopup(e.features[0], e.lngLat);
                });

                // Change cursor on hover
                _map.on('mouseenter', layerId, () => {
                    _map.getCanvas().style.cursor = 'pointer';
                });

                _map.on('mouseleave', layerId, () => {
                    _map.getCanvas().style.cursor = '';
                });
            }

            console.log(`✅ Created utility layer: ${layerId} with ${features.length} features`);
            
            // Store layer info
            _layerGroups.set(layerId, {
                subtype: subtype,
                features: features,
                visible: true
            });

        } catch (error) {
            console.error('❌ Failed to create utility layer:', error);
            // Still store layer info for UI even if map layer fails
            _layerGroups.set(layerId, {
                subtype: subtype,
                features: features,
                visible: false,
                error: error.message
            });
        }
    }

    /**
     * Show feature popup on click
     */
    function _showFeaturePopup(feature, lngLat) {
        const properties = feature.properties || {};
        const geometry = feature.geometry;
        
        let content = `
            <div style="padding: 8px; min-width: 200px;">
                <h4 style="margin: 0 0 8px 0; color: #1976d2;">⚡ ${properties.subtype || 'Utility Feature'}</h4>
                <div style="font-size: 12px; color: #666;">
                    <strong>Type:</strong> ${geometry.type}<br>
                    <strong>Subtype:</strong> ${properties.subtype || 'Unknown'}
                </div>
            </div>
        `;

        new maplibregl.Popup()
            .setLngLat(lngLat)
            .setHTML(content)
            .addTo(_map);
    }

    /**
     * Update debug status display
     */
    function _updateDebugStatus(message) {
        const debugEl = document.getElementById('utility-debug-status');
        if (debugEl) {
            const timestamp = new Date().toLocaleTimeString();
            debugEl.innerHTML = `[${timestamp}] ${message}`;
        }
        console.log('🔧 UTILITY DATA DEBUG:', message);
    }

    /**
     * Set up action buttons
     */
    function _setupActionButtons() {
        const refreshBtn = document.getElementById('refresh-utility-data');
        const zoomBtn = document.getElementById('zoom-to-utility-data');
        const debugBtn = document.getElementById('debug-utility-data');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log('🔥 UTILITY DATA - Refreshing utility data...');
                _updateDebugStatus('Refresh requested');
                _loadUtilityDataFromAPI();
            });
        }

        if (zoomBtn) {
            zoomBtn.addEventListener('click', () => {
                console.log('🔥 UTILITY DATA - Zoom to all requested');
                _updateDebugStatus('Zoom to all requested');
                _zoomToAllUtilityData();
            });
        }

        if (debugBtn) {
            debugBtn.addEventListener('click', () => {
                _showDebugInfo();
            });
        }
    }

    /**
     * Show comprehensive debug information
     */
    function _showDebugInfo() {
        const info = {
            initialized: _initialized,
            mapReady: !!_map,
            containerFound: !!_container,
            utilityDataCount: _utilityData.length,
            layerGroupsCount: _layerGroups.size,
            totalFeatures: _utilityData.reduce((total, collection) => 
                total + (collection.features ? collection.features.length : 0), 0)
        };
        
        console.log('🔧 UTILITY DATA DEBUG INFO:', info);
        _updateDebugStatus(`Debug: ${JSON.stringify(info)}`);
        
        // Force a test load
        if (_utilityData.length === 0) {
            _updateDebugStatus('No data - loading from API...');
            _loadUtilityDataFromAPI();
        } else {
            _updateDebugStatus('Data exists - forcing UI update...');
            _updateUI();
        }
    }

    /**
     * Zoom to all utility data
     */
    function _zoomToAllUtilityData() {
        if (_utilityData.length === 0) {
            console.warn('No utility data to zoom to');
            return;
        }

        try {
            // Calculate bounds from all features
            let allFeatures = [];
            _utilityData.forEach(collection => {
                if (collection.features) {
                    allFeatures = allFeatures.concat(collection.features);
                }
            });

            if (allFeatures.length > 0) {
                const bounds = turf.bbox({
                    type: 'FeatureCollection',
                    features: allFeatures
                });

                _map.fitBounds(bounds, {
                    padding: 50,
                    maxZoom: 16
                });
            }
        } catch (error) {
            console.error('Failed to zoom to utility data:', error);
        }
    }

    /**
     * Update the UI with current utility data
     */
    function _updateUI() {
        console.log('Updating utility data UI', {
            container: !!_container,
            dataLength: _utilityData.length,
            layerGroups: _layerGroups.size
        });
        
        if (!_container) {
            _container = document.getElementById('utility-data-list');
            if (!_container) {
                console.error('Utility data container not found');
                return;
            }
        }

        _container.innerHTML = '';

        if (_layerGroups.size === 0) {
            console.log('No layer groups, showing empty state');
            _showEmptyState();
            return;
        }

        // Create layer controls
        let itemCount = 0;
        _layerGroups.forEach((layerInfo, layerId) => {
            console.log(`Creating UI item for layer: ${layerId}`, layerInfo);
            const item = _createLayerControlItem(layerId, layerInfo);
            _container.appendChild(item);
            itemCount++;
        });
        
        console.log(`Created ${itemCount} layer control items`);
    }

    /**
     * Create a layer control item
     */
    function _createLayerControlItem(layerId, layerInfo) {
        const item = document.createElement('div');
        item.className = 'utility-layer-item';
        item.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            margin: 4px 0;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid ${_getLayerColor(layerInfo.subtype)};
        `;

        const leftSide = document.createElement('div');
        leftSide.style.cssText = 'display: flex; align-items: center; gap: 8px;';

        const icon = document.createElement('sl-icon');
        icon.name = layerInfo.subtype.includes('Valve') ? 'circle' : 'minus';
        icon.style.color = _getLayerColor(layerInfo.subtype);

        const label = document.createElement('span');
        label.textContent = `${layerInfo.subtype} (${layerInfo.features.length})`;
        label.style.cssText = 'font-size: 14px; font-weight: 500;';

        leftSide.appendChild(icon);
        leftSide.appendChild(label);

        const toggle = document.createElement('sl-switch');
        toggle.checked = layerInfo.visible;
        toggle.size = 'small';
        toggle.addEventListener('sl-change', (e) => {
            _toggleLayer(layerId, e.target.checked);
        });

        item.appendChild(leftSide);
        item.appendChild(toggle);

        return item;
    }

    /**
     * Get color for layer type
     */
    function _getLayerColor(subtype) {
        const config = _layerConfig[subtype];
        if (config && config.paint) {
            return config.paint['line-color'] || config.paint['circle-color'] || '#1976d2';
        }
        return '#1976d2';
    }

    /**
     * Toggle layer visibility
     */
    function _toggleLayer(layerId, visible) {
        if (_map.getLayer(layerId)) {
            _map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
            
            const layerInfo = _layerGroups.get(layerId);
            if (layerInfo) {
                layerInfo.visible = visible;
            }
        }
    }

    /**
     * Show empty state
     */
    function _showEmptyState() {
        const emptyDiv = document.getElementById('utility-data-empty');
        if (emptyDiv) {
            emptyDiv.style.display = 'block';
        }
    }

    /**
     * Hide empty state
     */
    function _hideEmptyState() {
        const emptyDiv = document.getElementById('utility-data-empty');
        if (emptyDiv) {
            emptyDiv.style.display = 'none';
        }
    }

    /**
     * Remove all utility layers
     */
    function _clearLayers() {
        _layerGroups.forEach((layerInfo, layerId) => {
            if (_map.getLayer(layerId)) {
                _map.removeLayer(layerId);
            }
            if (_map.getSource(`${layerId}-source`)) {
                _map.removeSource(`${layerId}-source`);
            }
        });
        _layerGroups.clear();
    }

    /**
     * Public API
     */
    return {
        initialize: initialize,
        loadUtilityData: _loadUtilityData,
        clearLayers: _clearLayers,
        getLayerGroups: function() { return _layerGroups; },
        isInitialized: function() { return _initialized; }
    };
})();

// Auto-initialize when map is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 UTILITY DATA - DOM Content Loaded');
    
    // Immediate status update
    const debugEl = document.getElementById('utility-debug-status');
    if (debugEl) {
        debugEl.innerHTML = 'DOM loaded, waiting for map...';
    }
    
    if (App.Core && App.Core.Events) {
        App.Core.Events.on('map:initialized', function(map) {
            console.log('🔥 UTILITY DATA - Map initialized event received');
            App.Map.UtilityData.initialize(map);
        });
    }
    
    // Also try to initialize after a short delay if map is already ready
    setTimeout(() => {
        if (!App.Map.UtilityData.isInitialized() && App.Map && App.Map.Init && App.Map.Init.getMap) {
            const map = App.Map.Init.getMap();
            if (map) {
                console.log('🔥 UTILITY DATA - Found existing map, initializing...');
                App.Map.UtilityData.initialize(map);
            }
        }
    }, 1000);
    
    // Force initialization attempt after 3 seconds regardless
    setTimeout(() => {
        if (!App.Map.UtilityData.isInitialized()) {
            console.log('🔥 UTILITY DATA - Force initializing without map...');
            App.Map.UtilityData.initialize(null);
        }
    }, 3000);
});

// Make sure we're loaded
console.log('🔥 UTILITY DATA - Module script loaded!');