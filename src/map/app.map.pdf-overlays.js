/**
 * PDF Overlays management for Map Engine
 * @namespace App.Map.PdfOverlays
 */
App.Map = App.Map || {};
App.Map.PdfOverlays = (function() {
    var _overlays = new Map();
    var _map = null;
    var _initialized = false;
    var _container = null;

    /**
     * Initialize PDF overlays functionality
     * @param {Object} map - MapLibre map instance
     */
    function initialize(map) {
        if (_initialized) {
            console.log('PDF Overlays already initialized');
            return;
        }
        
        _map = map || App.Map.Init.getMap();
        _container = document.getElementById('pdf-overlays-list');
        
        console.log('PDF Overlays module initialized', {
            map: !!_map,
            container: !!_container
        });
        
        // Set up action buttons
        _setupActionButtons();
        
        // Note: Style change handling removed to prevent infinite loops
        
        // Listen for postMessage from parent MapEngineViewer
        window.addEventListener('message', _handleMessage);
        
        // Listen for drawer/tab changes
        if (App.Core && App.Core.Events) {
            App.Core.Events.on('drawer:shown', function(drawerId) {
                if (drawerId === 'left1-drawer') {
                    setTimeout(_updateUI, 100);
                }
            });
        }
        
        document.addEventListener('sl-tab-show', function(event) {
            console.log('Tab shown:', event.detail.name);
            if (event.detail.name === 'pdf-overlays') {
                setTimeout(() => {
                    _updateUI();
                    _loadOverlaysFromAPI();
                }, 100);
            }
        });
        
        // Load PDF overlays automatically on initialization
        _loadOverlaysFromAPI();
        
        _initialized = true;
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
        
        // For Vercel previews or other domains, use the same domain
        return 'https://tools.geolantis.com';
    }

    /**
     * Handle messages from parent window (MapEngineViewer)
     */
    function _handleMessage(event) {
        console.log('PDF Overlays received message:', event.data);
        
        if (event.data.type === 'LOAD_PDF_OVERLAYS') {
            console.log('📋 Loading PDF overlays from parent:', event.data.overlays);
            _loadOverlays(event.data.overlays);
        } else if (event.data.type === 'PARENT_READY') {
            console.log('🔗 Parent ready, requesting overlay data');
            
            // If parent provides API URL, pass it to Auth Settings
            if (event.data.apiUrl && App.UI && App.UI.AuthSettings) {
                console.log('🔗 Setting API URL for Auth Settings:', event.data.apiUrl);
                App.UI.AuthSettings.setApiUrl(event.data.apiUrl);
            }
            
            _notifyParentReady();
        }
    }

    /**
     * Notify parent that map engine is ready to receive overlay data
     */
    function _notifyParentReady() {
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'MAP_ENGINE_READY'
            }, '*');
        }
    }

    /**
     * Load overlays directly from API using account ID
     */
    function _loadOverlaysFromAPI(accountId, sessionId) {
        console.log('🔄 Loading PDF overlays from API', { accountId, sessionId });
        
        // Check authentication status
        if (App.UI && App.UI.AuthSettings && !App.UI.AuthSettings.isLoggedIn()) {
            console.warn('🔐 Not logged in via Authentication Settings - skipping PDF overlay loading');
            _showEmptyState();
            return;
        }
        
        console.log('🔄 Starting overlay loading from API...');
        
        // Determine the API base URL
        const apiBaseUrl = _getApiBaseUrl();
        const apiUrl = `${apiBaseUrl}/api/overlays`;
        const params = new URLSearchParams();
        if (sessionId) params.append('session_id', sessionId);
        
        console.log('📡 Fetching overlays from:', `${apiUrl}?${params}`);
        console.log('🔐 Request cookies being sent:', document.cookie);
        
        fetch(`${apiUrl}`, {
            method: 'GET',
            credentials: 'include', // Important for session cookies
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                console.log('📨 API Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(overlays => {
                console.log('📋 Received overlays from API:', overlays);
                console.log('📋 Overlays exists?', !!overlays);
                console.log('📋 Overlays length:', overlays?.length);
                console.log('📋 Condition check: overlays && overlays.length > 0 =', !!(overlays && overlays.length > 0));
                
                if (overlays && overlays.length > 0) {
                    const apiBaseUrl = _getApiBaseUrl(); // Use the same API base URL logic
                    
                    // Get session_id from cookies for MapLibre image authentication
                    console.log('🔐 All cookies raw:', document.cookie);
                    console.log('🔐 Cookie split result:', document.cookie.split('; '));
                    
                    // Try different cookie name variations
                    const possibleCookieNames = ['session_id', 'sessionId', 'JSESSIONID', 'connect.sid'];
                    let cookieValue = null;
                    let sessionId = null;
                    
                    for (const cookieName of possibleCookieNames) {
                        cookieValue = document.cookie
                            .split('; ')
                            .find(row => row.startsWith(`${cookieName}=`));
                        if (cookieValue) {
                            sessionId = cookieValue.split('=')[1];
                            console.log(`🔐 Found session in cookie '${cookieName}':`, sessionId);
                            break;
                        }
                    }
                    
                    if (!sessionId) {
                        console.log('🔐 No session cookie found in any format');
                    }
                    
                    // Alternative: Get session_id from localStorage (where Auth Settings stores it)
                    let finalSessionId = sessionId;
                    if (!sessionId) {
                        console.log('🔍 Checking localStorage for auth data...');
                        
                        try {
                            // Auth Settings stores session in localStorage under 'map_engine_login_status'
                            const loginData = JSON.parse(localStorage.getItem('map_engine_login_status') || '{}');
                            console.log('🔍 Login data from localStorage:', loginData);
                            
                            if (loginData.sessionToken) {
                                finalSessionId = loginData.sessionToken;
                                console.log('✅ Found session_id in localStorage:', finalSessionId);
                            } else if (loginData.isLoggedIn && loginData.username) {
                                console.log('🔍 User is logged in but no sessionToken found:', loginData);
                            }
                        } catch (e) {
                            console.log('🔍 Could not parse login data from localStorage:', e);
                        }
                        
                        // Try Auth Settings component as backup
                        if (!finalSessionId && App.UI && App.UI.AuthSettings) {
                            console.log('🔍 Checking AuthSettings component...');
                            if (App.UI.AuthSettings.isLoggedIn && App.UI.AuthSettings.isLoggedIn()) {
                                console.log('🔍 AuthSettings shows user is logged in');
                            }
                        }
                        
                        // Final fallback: warn user they need to log in
                        if (!finalSessionId) {
                            console.warn('⚠️ No session_id found. User may need to log in via Authentication Settings.');
                            finalSessionId = null; // Don't use fallback - let it fail with clear error
                        }
                    }
                    
                    const processedOverlays = overlays.map(overlay => {
                        // FORCE all overlays to use /image endpoint (not tiles) like PDF Manager
                        const baseImageUrl = `${apiBaseUrl}/api/overlays/${overlay.id}/image`;
                        
                        // Only add session_id if we have one
                        const imageUrl = finalSessionId 
                            ? `${baseImageUrl}?session_id=${finalSessionId}`
                            : baseImageUrl;
                        
                        if (!finalSessionId) {
                            console.warn(`⚠️ No session_id available for ${overlay.name} - image may fail to load`);
                        }
                            
                        console.log(`🔗 Generated authenticated URL for ${overlay.name}:`, imageUrl);
                        console.log(`🔍 Overlay type from DB: ${overlay.overlay_type}, forced to: image`);
                        
                        return {
                            id: overlay.id,
                            name: overlay.name,
                            bounds: overlay.bounds,
                            imageUrl: imageUrl,
                            overlayType: 'image', // FORCE to image type for all overlays
                            visible: true,
                            opacity: 0.8,
                            created_at: overlay.created_at,
                            image_width: overlay.image_width,
                            image_height: overlay.image_height,
                            image_size_bytes: overlay.image_size_bytes
                        };
                    });
                    
                    console.log(`🚀 CALLING _loadOverlays() with ${processedOverlays.length} processed overlays`);
                    _loadOverlays(processedOverlays);
                } else {
                    console.log('📋 No overlays found');
                    _showEmptyState();
                }
            })
            .catch(error => {
                console.error('❌ Failed to load overlays from API:', error);
                _showEmptyState();
            })
            .finally(() => {
                // Loading dialog removed, just log completion
                console.log('✅ Overlay loading from API completed');
            });
    }

    /**
     * Load overlays from parent data
     */
    function _loadOverlays(overlayData) {
        console.log('🔄 ================ _loadOverlays CALLED ================');
        console.log('🔄 _loadOverlays called with:', overlayData);
        console.log('🔄 Data type:', typeof overlayData);
        console.log('🔄 Is array?', Array.isArray(overlayData));
        console.log('🔄 Length:', overlayData?.length);
        
        if (!overlayData || !Array.isArray(overlayData)) {
            console.log('❌ No valid overlay data provided');
            _showEmptyState();
            return;
        }

        console.log(`📚 Loading ${overlayData.length} PDF overlays`);
        _overlays.clear();

        overlayData.forEach((overlay, index) => {
            console.log(`Processing overlay ${index + 1}:`, overlay);
            
            // Following PDF Manager approach: treat ALL overlays as images
            // PDF Manager uses /image endpoint regardless of overlay_type
            console.log(`📷 Treating overlay ${overlay.name} as image type (like PDF Manager)`);
            
            const processedOverlay = {
                id: overlay.id,
                name: overlay.name,
                bounds: overlay.bounds,
                imageUrl: overlay.imageUrl,
                overlayType: overlay.overlayType,
                visible: overlay.visible !== false,
                opacity: overlay.opacity || 0.8,
                layerId: `pdf-overlay-${overlay.id}`,
                sourceId: `pdf-overlay-source-${overlay.id}`,
                // Additional metadata
                created_at: overlay.created_at,
                image_width: overlay.image_width,
                image_height: overlay.image_height,
                image_size_bytes: overlay.image_size_bytes,
                tile_count: overlay.tile_count || 0,
                backgroundRemoved: false // Track background removal state
            };
            
            console.log('Processed overlay (with data):', processedOverlay);
            _overlays.set(overlay.id, processedOverlay);
        });

        console.log(`📊 Total overlays loaded: ${_overlays.size} (from ${overlayData.length} database records)`);
        
        if (_overlays.size === 0 && overlayData.length > 0) {
            console.warn(`⚠️ All ${overlayData.length} overlay(s) were skipped due to missing tile/image data`);
            console.info(`💡 To see working overlays, create new overlays with actual image/tile content in the PDF Manager`);
        }
        
        console.log(`🎯 ABOUT TO CALL _addOverlaysToMap() with ${_overlays.size} overlays`);
        _addOverlaysToMap();
        console.log(`🎯 ABOUT TO CALL _updateUI()`);
        _updateUI();
    }

    /**
     * Add overlays to the map
     */
    function _addOverlaysToMap() {
        if (!_map) {
            console.warn('⚠️ Map not available for adding overlays, attempting to get map...');
            _map = App.Map.Init.getMap();
            if (!_map) {
                console.error('❌ Still no map available, aborting overlay add');
                console.log('🔍 Debug: App.Map.Init available:', !!App.Map.Init);
                console.log('🔍 Debug: getMap function available:', !!App.Map.Init?.getMap);
                return;
            }
            console.log('✅ Map retrieved successfully');
        }

        console.log(`🗺️ Adding ${_overlays.size} overlays to map`);
        console.log('🔍 Debug: Map object:', _map);
        console.log('🔍 Debug: Map loaded:', _map?.loaded());
        console.log('🔍 Debug: Map style loaded:', _map?.isStyleLoaded());

        console.log(`🚀 STARTING TO ADD ${_overlays.size} OVERLAYS TO MAP`);
        
        _overlays.forEach(overlay => {
            try {
                console.log(`🔄 PROCESSING OVERLAY: ${overlay.name}`, {
                    type: overlay.overlayType,
                    bounds: overlay.bounds,
                    imageUrl: overlay.imageUrl,
                    visible: overlay.visible,
                    opacity: overlay.opacity
                });

                // Note: Data validation is now done in _loadOverlays before storage

                // Remove existing overlay if it exists (important after style changes)
                try {
                    if (_map.getLayer(overlay.layerId)) {
                        console.log(`Removing existing layer: ${overlay.layerId}`);
                        _map.removeLayer(overlay.layerId);
                    }
                } catch (e) {
                    console.log(`Layer ${overlay.layerId} not found, continuing...`);
                }
                
                try {
                    if (_map.getSource(overlay.sourceId)) {
                        console.log(`Removing existing source: ${overlay.sourceId}`);
                        _map.removeSource(overlay.sourceId);
                    }
                } catch (e) {
                    console.log(`Source ${overlay.sourceId} not found, continuing...`);
                }
                
                // Also remove any background removal layers/sources if they exist
                const bgRemovalLayerId = `${overlay.layerId}-bg-removal`;
                const bgRemovalSourceId = `${overlay.sourceId}-bg-removal`;
                
                try {
                    if (_map.getLayer(bgRemovalLayerId)) {
                        _map.removeLayer(bgRemovalLayerId);
                    }
                } catch (e) {}
                
                try {
                    if (_map.getSource(bgRemovalSourceId)) {
                        _map.removeSource(bgRemovalSourceId);
                    }
                } catch (e) {}

                console.log(`🔍 OVERLAY TYPE CHECK: ${overlay.overlayType} === 'image'? ${overlay.overlayType === 'image'}`);
                
                if (overlay.overlayType === 'image') {
                    // Add image overlay using MapLibre's image source
                    const coordinates = _boundsToImageCoordinates(overlay.bounds);
                    console.log(`🖼️ ADDING IMAGE OVERLAY with coordinates:`, coordinates);
                    console.log(`🖼️ Image URL:`, overlay.imageUrl);
                    console.log(`🖼️ Overlay visible:`, overlay.visible, 'Opacity:', overlay.opacity);
                    
                    // Add image source
                    console.log(`🖼️ Adding source: ${overlay.sourceId}`);
                    _map.addSource(overlay.sourceId, {
                        type: 'image',
                        url: overlay.imageUrl,
                        coordinates: coordinates
                    });

                    // Add raster layer
                    console.log(`🖼️ Adding layer: ${overlay.layerId}`);
                    _map.addLayer({
                        id: overlay.layerId,
                        type: 'raster',
                        source: overlay.sourceId,
                        paint: {
                            'raster-opacity': overlay.visible ? overlay.opacity : 0
                        }
                    });
                    
                    console.log(`✅ IMAGE OVERLAY ADDED TO MAP: ${overlay.layerId}`);
                } else {
                    // Handle tile-based overlays (legacy)
                    console.log(`Adding tile overlay with URL template:`, overlay.imageUrl);
                    console.log(`Tile bounds:`, overlay.bounds);
                    
                    // Check if the tile URL is accessible
                    const testTileUrl = overlay.imageUrl.replace('{z}/{x}/{y}', '10/512/512');
                    console.log(`Test tile URL:`, testTileUrl);
                    
                    _map.addSource(overlay.sourceId, {
                        type: 'raster',
                        tiles: [overlay.imageUrl],
                        tileSize: 256,
                        bounds: [overlay.bounds.west || overlay.bounds[0], overlay.bounds.south || overlay.bounds[1], 
                               overlay.bounds.east || overlay.bounds[2], overlay.bounds.north || overlay.bounds[3]]
                    });

                    _map.addLayer({
                        id: overlay.layerId,
                        type: 'raster',
                        source: overlay.sourceId,
                        paint: {
                            'raster-opacity': overlay.visible ? overlay.opacity : 0
                        }
                    });
                    
                    console.log(`✅ Tile overlay added to map: ${overlay.layerId}`);
                }

                console.log(`✅ Added ${overlay.overlayType} overlay: ${overlay.name}`);
                
            } catch (error) {
                console.error(`❌ Failed to add overlay ${overlay.name}:`, error);
            }
        });
        
        // Ensure proper layer ordering after adding all overlays
        if (App.Map.LayerOrder && App.Map.LayerOrder.ensureProperLayerOrder) {
            setTimeout(() => {
                App.Map.LayerOrder.ensureProperLayerOrder();
                console.log('🔄 PDF overlay layer ordering applied');
            }, 100);
        }
    }

    /**
     * Convert bounds to image coordinates for MapLibre
     */
    function _boundsToImageCoordinates(bounds) {
        console.log('🔍 Converting bounds to coordinates:', bounds);
        
        let west, south, east, north;
        
        // Handle both object and array formats
        if (Array.isArray(bounds) && bounds.length === 4) {
            [west, south, east, north] = bounds;
        } else if (bounds && typeof bounds === 'object') {
            west = bounds.west;
            south = bounds.south;
            east = bounds.east;
            north = bounds.north;
        } else {
            console.error('Invalid bounds format:', bounds);
            return [[0, 0], [1, 0], [1, 1], [0, 1]];
        }
        
        if (!west || !south || !east || !north) {
            console.error('Missing bounds values:', { west, south, east, north });
            return [[0, 0], [1, 0], [1, 1], [0, 1]];
        }

        const coordinates = [
            [west, north],  // top-left
            [east, north],  // top-right
            [east, south],  // bottom-right
            [west, south]   // bottom-left
        ];
        
        console.log('🔍 Generated coordinates:', coordinates);
        return coordinates;
    }

    /**
     * Update the UI to show current overlays
     */
    function _updateUI() {
        const list = document.getElementById('pdf-overlays-list');
        const empty = document.getElementById('pdf-overlays-empty');

        if (!list) return;

        if (_overlays.size === 0) {
            _showEmptyState();
        } else {
            _showOverlayList();
        }
        
        // Simplified validation - only check once during initial load, not on every UI update
        if (_overlays.size > 0) {
            console.log(`📊 PDF Overlays loaded: ${_overlays.size} overlays available`);
        }
    }

    /**
     * Show empty state
     */
    function _showEmptyState() {
        const list = document.getElementById('pdf-overlays-list');
        const empty = document.getElementById('pdf-overlays-empty');
        
        if (list) list.style.display = 'none';
        if (empty) empty.style.display = 'block';
    }

    /**
     * Show overlay list
     */
    function _showOverlayList() {
        const list = document.getElementById('pdf-overlays-list');
        const empty = document.getElementById('pdf-overlays-empty');
        
        if (list) {
            list.style.display = 'block';
            list.innerHTML = '';
            
            _overlays.forEach(overlay => {
                const overlayElement = _createOverlayItem(overlay);
                list.appendChild(overlayElement);
            });
        }
        if (empty) empty.style.display = 'none';
    }

    /**
     * Create overlay list item
     */
    function _createOverlayItem(overlay) {
        const item = document.createElement('div');
        item.className = 'pdf-overlay-item';
        item.style.cssText = `
            padding: 12px;
            margin-bottom: 8px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            background: white;
        `;

        // Format file size
        const formatFileSize = (bytes) => {
            if (!bytes || bytes === 0) return '';
            const mb = bytes / (1024 * 1024);
            return `${mb.toFixed(1)} MB`;
        };

        // Format date
        const formatDate = (dateString) => {
            if (!dateString) return '';
            try {
                return new Date(dateString).toLocaleDateString();
            } catch {
                return '';
            }
        };

        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; word-break: break-word;">
                        ${overlay.name || 'Unnamed Overlay'}
                    </div>
                    ${overlay.image_width && overlay.image_height ? 
                        `<div style="font-size: 12px; color: #666; margin-bottom: 2px;">
                            Size: ${overlay.image_width} × ${overlay.image_height} pixels
                        </div>` : ''
                    }
                    ${formatFileSize(overlay.image_size_bytes) ? 
                        `<div style="font-size: 12px; color: #666; margin-bottom: 2px;">
                            File: ${formatFileSize(overlay.image_size_bytes)}
                        </div>` : ''
                    }
                    ${formatDate(overlay.created_at) ? 
                        `<div style="font-size: 12px; color: #666;">
                            Added: ${formatDate(overlay.created_at)}
                        </div>` : ''
                    }
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
                    <sl-icon-button 
                        name="${overlay.visible ? 'eye' : 'eye-slash'}" 
                        class="toggle-visibility-btn"
                        style="font-size: 16px;"
                        label="${overlay.visible ? 'Hide' : 'Show'} overlay"
                    ></sl-icon-button>
                    <sl-icon-button 
                        name="zoom-in" 
                        class="zoom-to-btn"
                        style="font-size: 16px;"
                        label="Zoom to overlay"
                    ></sl-icon-button>
                    <sl-icon-button 
                        name="${overlay.backgroundRemoved ? 'image' : 'layers'}" 
                        class="toggle-background-btn"
                        style="font-size: 16px; ${overlay.backgroundRemoved ? 'color: #ff6b35;' : ''}"
                        label="${overlay.backgroundRemoved ? 'Restore background' : 'Remove background'}"
                    ></sl-icon-button>
                </div>
            </div>
            <div style="margin-top: 8px;">
                <label style="font-size: 12px; color: #666; margin-bottom: 4px; display: block;">
                    Opacity: <span class="opacity-value">${Math.round(overlay.opacity * 100)}%</span>
                </label>
                <sl-range 
                    class="opacity-slider"
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value="${overlay.opacity}"
                    style="--thumb-size: 16px;"
                ></sl-range>
            </div>
        `;

        // Set up event listeners
        const toggleBtn = item.querySelector('.toggle-visibility-btn');
        const zoomBtn = item.querySelector('.zoom-to-btn');
        const backgroundBtn = item.querySelector('.toggle-background-btn');
        const opacitySlider = item.querySelector('.opacity-slider');
        const opacityValue = item.querySelector('.opacity-value');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => _toggleOverlayVisibility(overlay.id));
        }

        if (zoomBtn) {
            zoomBtn.addEventListener('click', () => _zoomToOverlay(overlay.id));
        }

        if (backgroundBtn) {
            backgroundBtn.addEventListener('click', () => _toggleBackgroundRemoval(overlay.id));
        }

        if (opacitySlider) {
            opacitySlider.addEventListener('sl-change', (e) => {
                const opacity = parseFloat(e.target.value);
                _setOverlayOpacity(overlay.id, opacity);
                if (opacityValue) {
                    opacityValue.textContent = `${Math.round(opacity * 100)}%`;
                }
            });
        }

        return item;
    }

    /**
     * Toggle overlay visibility
     */
    function _toggleOverlayVisibility(overlayId) {
        const overlay = _overlays.get(overlayId);
        if (!overlay || !_map) return;

        overlay.visible = !overlay.visible;
        const opacity = overlay.visible ? overlay.opacity : 0;
        
        _map.setPaintProperty(overlay.layerId, 'raster-opacity', opacity);
        
        // Update UI
        _updateUI();
    }

    /**
     * Set overlay opacity
     */
    function _setOverlayOpacity(overlayId, opacity) {
        const overlay = _overlays.get(overlayId);
        if (!overlay || !_map) return;

        overlay.opacity = opacity;
        if (overlay.visible) {
            _map.setPaintProperty(overlay.layerId, 'raster-opacity', opacity);
        }
    }

    /**
     * Toggle background removal for overlay
     */
    function _toggleBackgroundRemoval(overlayId) {
        const overlay = _overlays.get(overlayId);
        if (!overlay || !_map) return;

        overlay.backgroundRemoved = !overlay.backgroundRemoved;
        
        console.log(`${overlay.backgroundRemoved ? 'Removing' : 'Restoring'} background for overlay: ${overlay.name}`);
        
        // Apply background removal using CSS filters and blend modes
        const layerId = overlay.layerId;
        
        if (overlay.backgroundRemoved) {
            // Apply background removal using only MapLibre raster properties
            // This approach affects only the specific overlay layer, not the entire UI
            
            try {
                // Use a different approach: reduce opacity significantly and increase contrast
                // to make white/light areas effectively transparent while preserving dark content
                _map.setPaintProperty(layerId, 'raster-opacity', overlay.visible ? overlay.opacity * 0.4 : 0);
                _map.setPaintProperty(layerId, 'raster-brightness-min', 0.1);  // Make dark areas darker
                _map.setPaintProperty(layerId, 'raster-brightness-max', 0.7);  // Reduce white brightness (not increase)
                _map.setPaintProperty(layerId, 'raster-contrast', 1.5);        // High contrast to separate white from content
                _map.setPaintProperty(layerId, 'raster-saturation', 0.8);      // Boost saturation to preserve colors
                
                console.log(`✅ Layer-specific background removal applied: ${overlay.name}`);
                
            } catch (e) {
                console.warn('Could not apply background removal:', e);
                
                // Simple fallback that just reduces opacity significantly
                _map.setPaintProperty(layerId, 'raster-opacity', overlay.visible ? overlay.opacity * 0.3 : 0);
                _map.setPaintProperty(layerId, 'raster-brightness-max', 0.6);
            }
            
        } else {
            // Restore original appearance - only affects this layer
            _map.setPaintProperty(layerId, 'raster-opacity', overlay.visible ? overlay.opacity : 0);
            _map.setPaintProperty(layerId, 'raster-contrast', 0);
            _map.setPaintProperty(layerId, 'raster-saturation', 0);
            _map.setPaintProperty(layerId, 'raster-brightness-min', 0);
            _map.setPaintProperty(layerId, 'raster-brightness-max', 1);
            
            console.log(`🗑️ Background removal restored for: ${overlay.name}`);
        }
        
        // Update UI
        _updateUI();
        
        console.log(`Background ${overlay.backgroundRemoved ? 'removed' : 'restored'} for overlay: ${overlay.name}`);
    }

    /**
     * Zoom to overlay bounds
     */
    function _zoomToOverlay(overlayId) {
        const overlay = _overlays.get(overlayId);
        if (!overlay || !_map || !overlay.bounds) return;

        console.log('Zooming to overlay:', overlay.bounds);
        
        // Handle both array and object bounds formats
        let bounds;
        if (Array.isArray(overlay.bounds) && overlay.bounds.length === 4) {
            const [west, south, east, north] = overlay.bounds;
            bounds = [[west, south], [east, north]];
        } else if (overlay.bounds.west !== undefined) {
            bounds = [[overlay.bounds.west, overlay.bounds.south], [overlay.bounds.east, overlay.bounds.north]];
        } else {
            console.error('Invalid bounds format:', overlay.bounds);
            return;
        }

        _map.fitBounds(bounds, {
            padding: 50,
            duration: 1000
        });
    }

    /**
     * Zoom to all overlays
     */
    function _zoomToAllOverlays() {
        if (!_map || _overlays.size === 0) return;

        const bounds = [];
        _overlays.forEach(overlay => {
            if (overlay.bounds && overlay.bounds.length === 4) {
                const [west, south, east, north] = overlay.bounds;
                bounds.push([west, south], [east, north]);
            }
        });

        if (bounds.length === 0) return;

        // Calculate combined bounds
        let minLng = Math.min(...bounds.map(b => b[0]));
        let minLat = Math.min(...bounds.map(b => b[1]));
        let maxLng = Math.max(...bounds.map(b => b[0]));
        let maxLat = Math.max(...bounds.map(b => b[1]));

        _map.fitBounds([[minLng, minLat], [maxLng, maxLat]], {
            padding: 50,
            duration: 1000
        });
    }

    /**
     * Refresh overlays from API
     */
    function _refreshOverlays() {
        console.log('Refreshing PDF overlays...');
        _loadOverlaysFromAPI();
    }

    /**
     * Set up action buttons
     */
    function _setupActionButtons() {
        const refreshBtn = document.getElementById('refresh-pdf-overlays');
        const zoomAllBtn = document.getElementById('zoom-to-all-overlays');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', _refreshOverlays);
        }

        if (zoomAllBtn) {
            zoomAllBtn.addEventListener('click', _zoomToAllOverlays);
        }
    }

    /**
     * Handle style/basemap changes - restore PDF overlays
     */
    function _handleStyleChange() {
        if (!_map || _overlays.size === 0) return;
        
        console.log('PDF Overlays: Handling basemap/style change');
        
        // Wait for the new style to be fully loaded
        if (_map.isStyleLoaded()) {
            console.log('Style loaded - restoring PDF overlays');
            _addOverlaysToMap();
        } else {
            // Wait for style to load
            const checkStyleLoaded = () => {
                if (_map.isStyleLoaded()) {
                    console.log('Style now loaded - restoring PDF overlays');
                    _addOverlaysToMap();
                } else {
                    setTimeout(checkStyleLoaded, 50);
                }
            };
            checkStyleLoaded();
        }
    }

    // Public API
    return {
        initialize: initialize,
        loadOverlays: _loadOverlays,
        loadOverlaysFromAPI: _loadOverlaysFromAPI,
        loadFromAPI: function() {
            // Load overlays using session cookies (no parameters needed)
            console.log('🔄 Loading overlays from API using session authentication');
            _loadOverlaysFromAPI();
        },
        handleMessage: _handleMessage,
        refreshOverlays: _refreshOverlays,
        zoomToAllOverlays: _zoomToAllOverlays,
        handleStyleChange: _handleStyleChange,
        getOverlays: function() {
            return Array.from(_overlays.values());
        },
        // Debug methods
        testImageOverlay: function() {
            console.log('🧪 Testing image overlay...');
            const testOverlay = {
                id: 'test-1',
                name: 'Test Image Overlay',
                bounds: {west: 8.538, south: 47.366, east: 8.548, north: 47.376}, // Zurich area
                imageUrl: 'https://via.placeholder.com/500x500/ff0000/ffffff?text=TEST',
                overlayType: 'image',
                visible: true,
                opacity: 0.8,
                image_width: 500,
                image_height: 500,
                tile_count: 0
            };
            _loadOverlays([testOverlay]);
        },
        getMap: function() {
            return _map;
        },
        getDebugInfo: function() {
            return {
                initialized: _initialized,
                mapAvailable: !!_map,
                overlayCount: _overlays.size,
                containerFound: !!_container
            };
        }
    };
})();

console.log('App.Map.PdfOverlays module loaded');

// Make debugging methods available globally
window.PDFOverlayDebug = App.Map.PdfOverlays;

// Create enhanced global bridge for multi-platform usage
window.PDFOverlayBridge = {
    /**
     * Method 1: Direct Geolantis360 JWT Token Authentication
     * @param {string} jwtToken - JWT token from Geolantis360
     * @param {string} endpoint - Optional G360 API endpoint (defaults to current origin)
     * @returns {Promise} - Promise resolving when overlays are loaded
     */
    loadWithG360Token: function(jwtToken, endpoint) {
        console.log('🌉 Bridge: Loading with G360 JWT token');
        return this._loadOverlays({
            type: 'g360_jwt',
            token: jwtToken,
            endpoint: endpoint || `${window.location.origin}/api`,
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            }
        });
    },

    /**
     * Method 2: Platform Backend Token Authentication
     * @param {string} platformToken - Token from platform-specific backend
     * @param {string} backendUrl - Platform backend URL
     * @returns {Promise} - Promise resolving when overlays are loaded
     */
    loadWithPlatformToken: function(platformToken, backendUrl) {
        console.log('🌉 Bridge: Loading with platform token from:', backendUrl);
        return this._loadOverlays({
            type: 'platform_token',
            token: platformToken,
            endpoint: `${backendUrl}/api`,
            headers: {
                'Authorization': `Bearer ${platformToken}`,
                'Content-Type': 'application/json'
            }
        });
    },

    /**
     * Method 3: API Key Authentication
     * @param {string} apiKey - API key for simple integrations
     * @param {string} userId - User ID for the API key
     * @param {string} endpoint - Optional API endpoint
     * @returns {Promise} - Promise resolving when overlays are loaded
     */
    loadWithApiKey: function(apiKey, userId, endpoint) {
        console.log('🌉 Bridge: Loading with API key for user:', userId);
        return this._loadOverlays({
            type: 'api_key',
            key: apiKey,
            user_id: userId,
            endpoint: endpoint || `${window.location.origin}/api`,
            headers: {
                'X-API-Key': apiKey,
                'X-User-ID': userId,
                'Content-Type': 'application/json'
            }
        });
    },

    /**
     * Method 4: Session-based Authentication (current web implementation)
     * @param {string} sessionId - Session ID for cookie-based auth
     * @returns {Promise} - Promise resolving when overlays are loaded
     */
    loadWithSession: function(sessionId) {
        console.log('🌉 Bridge: Loading with session ID:', sessionId);
        return this._loadOverlays({
            type: 'session',
            session_id: sessionId || 'map_engine_session',
            endpoint: `${window.location.origin}/api`,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    /**
     * Platform Detection and Auto-Configuration
     * @returns {string} - Detected platform ('web', 'android', 'flutter', 'unknown')
     */
    detectPlatform: function() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (userAgent.includes('flutter')) {
            return 'flutter';
        } else if (userAgent.includes('android') && window.AndroidInterface) {
            return 'android';
        } else if (window.ReactNativeWebView) {
            return 'react-native';
        } else if (window.parent !== window) {
            return 'web-iframe';
        } else {
            return 'web';
        }
    },

    /**
     * Smart Authentication - Automatically choose best auth method
     * @param {Object} authConfig - Authentication configuration
     * @returns {Promise} - Promise resolving when overlays are loaded
     */
    smartAuth: function(authConfig) {
        const platform = this.detectPlatform();
        console.log('🧠 Smart auth detected platform:', platform);

        switch (platform) {
            case 'android':
                if (window.AndroidInterface && window.AndroidInterface.getAuthToken) {
                    const token = window.AndroidInterface.getAuthToken();
                    return this.loadWithPlatformToken(token, authConfig.androidBackend);
                }
                break;
                
            case 'flutter':
                if (authConfig.flutterToken && authConfig.flutterBackend) {
                    return this.loadWithPlatformToken(authConfig.flutterToken, authConfig.flutterBackend);
                }
                break;
                
            case 'web-iframe':
            case 'web':
                if (authConfig.g360Token) {
                    return this.loadWithG360Token(authConfig.g360Token);
                } else if (authConfig.sessionId) {
                    return this.loadWithSession(authConfig.sessionId);
                } else if (authConfig.apiKey && authConfig.userId) {
                    return this.loadWithApiKey(authConfig.apiKey, authConfig.userId);
                }
                break;
        }

        // Fallback to session-based auth
        console.log('🔄 Falling back to session-based authentication');
        return this.loadWithSession(authConfig.sessionId);
    },

    /**
     * Internal method to load overlays with authentication config
     * @private
     */
    _loadOverlays: function(authConfig) {
        return new Promise((resolve, reject) => {
            console.log('🔐 Loading overlays with auth config:', { 
                type: authConfig.type, 
                endpoint: authConfig.endpoint 
            });

            if (!App.Map || !App.Map.PdfOverlays) {
                const error = 'PDF Overlay module not available';
                console.error('❌', error);
                reject(new Error(error));
                return;
            }
            
            console.log('🔍 Debug: App.Map.PdfOverlays available');
            console.log('🔍 Debug: Map instance available:', !!App.Map.Init.getMap());

            // Build API URL with parameters
            let apiUrl = `${authConfig.endpoint}/overlays`;
            const params = new URLSearchParams();

            // Add authentication parameters based on type
            switch (authConfig.type) {
                case 'session':
                    if (authConfig.session_id) {
                        params.append('session_id', authConfig.session_id);
                    }
                    break;
                case 'api_key':
                    if (authConfig.user_id) {
                        params.append('user_id', authConfig.user_id);
                    }
                    break;
                case 'platform_token':
                case 'g360_jwt':
                    // For token-based auth, use the same session as PDF Manager
                    // This ensures we see the same overlays as the PDF Manager
                    params.append('session_id', 'pdf_overlay_manager_session');
                    break;
            }

            if (params.toString()) {
                apiUrl += `?${params.toString()}`;
            }

            console.log('📡 Fetching overlays from:', apiUrl);

            // Make authenticated request
            fetch(apiUrl, {
                method: 'GET',
                headers: authConfig.headers || {},
                credentials: authConfig.type === 'session' ? 'include' : 'omit'
            })
            .then(response => {
                console.log('📨 API Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(overlays => {
                console.log('📋 Received overlays from API:', overlays);
                console.log('📊 Overlay count:', overlays ? overlays.length : 0);
                console.log('📊 First overlay sample:', overlays && overlays.length > 0 ? overlays[0] : 'None');
                
                if (overlays && overlays.length > 0) {
                    const processedOverlays = overlays.map(overlay => {
                        const imageUrl = this._buildImageUrl(overlay, authConfig);
                        console.log(`🔗 Generated URL for ${overlay.name}:`, imageUrl);
                        
                        return {
                            id: overlay.id,
                            name: overlay.name,
                            bounds: overlay.bounds,
                            imageUrl: imageUrl,
                            overlayType: 'image', // Force all overlays to use image type like PDF Manager
                            visible: true,
                            opacity: 0.8,
                            created_at: overlay.created_at,
                            image_width: overlay.image_width,
                            image_height: overlay.image_height,
                            image_size_bytes: overlay.image_size_bytes,
                            tile_count: overlay.tile_count || 0
                        };
                    });
                    
                    App.Map.PdfOverlays.loadOverlays(processedOverlays);
                    resolve(processedOverlays);
                } else {
                    console.log('📋 No overlays found');
                    resolve([]);
                }
            })
            .catch(error => {
                console.error('❌ Failed to load overlays:', error);
                reject(error);
            });
        });
    },

    /**
     * Build image URL based on auth config and overlay type
     * Force all overlays to use /image endpoint like PDF Manager
     * @private
     */
    _buildImageUrl: function(overlay, authConfig) {
        const baseUrl = `${authConfig.endpoint}/overlays/${overlay.id}`;
        
        // ALWAYS use /image endpoint to match PDF Manager behavior
        // PDF Manager doesn't use tiles - it uses single image overlays
        let imageUrl = `${baseUrl}/image`;
        
        // Add authentication parameters
        switch (authConfig.type) {
            case 'session':
                imageUrl += `?session_id=${authConfig.session_id}`;
                break;
            case 'g360_jwt':
            case 'platform_token':
                // Get actual session_id from cookies for authentication
                const sessionId = document.cookie.split('; ')
                    .find(row => row.startsWith('session_id='))
                    ?.split('=')[1];
                if (sessionId) {
                    imageUrl += `?session_id=${sessionId}`;
                } else {
                    imageUrl += `?session_id=pdf_overlay_manager_session`;
                }
                break;
            case 'api_key':
                imageUrl += `?api_key=${authConfig.key}&user_id=${authConfig.user_id}`;
                break;
        }
        
        console.log(`🖼️ Generated image URL for ${overlay.name}:`, imageUrl);
        return imageUrl;
    },

    /**
     * Legacy methods for backward compatibility
     */
    loadOverlaysForAccount: function(accountId, sessionId) {
        console.log('🔄 Legacy method: loadOverlaysForAccount - redirecting to loadWithSession');
        return this.loadWithSession(sessionId || 'map_engine_session');
    },

    loadOverlaysWithSession: function(sessionId) {
        console.log('🔄 Legacy method: loadOverlaysWithSession - redirecting to loadWithSession');
        return this.loadWithSession(sessionId);
    },

    /**
     * Get current overlay status and platform info
     */
    getStatus: function() {
        const baseStatus = App.Map && App.Map.PdfOverlays 
            ? App.Map.PdfOverlays.getDebugInfo() 
            : { error: 'PDF Overlay module not available' };
            
        return {
            ...baseStatus,
            platform: this.detectPlatform(),
            bridgeVersion: '2.0.0',
            supportedAuthMethods: ['g360_jwt', 'platform_token', 'api_key', 'session'],
            currentOrigin: window.location.origin
        };
    },

    /**
     * Test overlay system with different auth methods
     */
    test: function(authType = 'session') {
        console.log('🧪 Testing bridge with auth type:', authType);
        
        if (App.Map && App.Map.PdfOverlays) {
            // Test with a sample overlay first
            App.Map.PdfOverlays.testImageOverlay();
            
            // Then test the selected auth method
            switch (authType) {
                case 'session':
                    return this.loadWithSession('test_session');
                case 'api_key':
                    return this.loadWithApiKey('test_key', 'test_user');
                default:
                    console.log('ℹ️ Auth type not testable without real credentials');
                    return Promise.resolve();
            }
        } else {
            console.error('❌ PDF Overlay module not available');
            return Promise.reject(new Error('PDF Overlay module not available'));
        }
    }
};

console.log('🌉 PDF Overlay Bridge available at window.PDFOverlayBridge');