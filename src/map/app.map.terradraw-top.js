/**
 * Ensure TerraDraw measurement layers stay on absolute top
 * @namespace App.Map.TerraDrawTop
 */
App.Map = App.Map || {};
App.Map.TerraDrawTop = (function() {
    var _map = null;
    var _intervalId = null;
    var _terraDrawLayerIds = [];
    var _lastFixTime = 0;
    var _fixDebounceTimeout = null;
    
    /**
     * Force TerraDraw layers to the absolute top
     * @private
     */
    function _forceLayersToTop() {
        if (!_map || !_map.getStyle()) return;
        
        // Throttle to prevent running too often - only run once every 5 seconds max
        const now = Date.now();
        if (now - _lastFixTime < 5000) {
            // Too soon, skip it
            return;
        }
        _lastFixTime = now;
        
        const style = _map.getStyle();
        if (!style.layers) return;
        
        // Find all TerraDraw layers
        const terraDrawLayers = style.layers.filter(layer => 
            layer.id.includes('terradraw') || layer.id.includes('measure')
        );
        
        if (terraDrawLayers.length === 0) return;
        
        // Get the ID of the last (topmost) layer
        const topmostLayerId = style.layers[style.layers.length - 1].id;
        
        // Check if a TerraDraw layer is already on top
        if (topmostLayerId.includes('terradraw') || topmostLayerId.includes('measure')) {
            return; // Already on top
        }
        
        // Move all TerraDraw layers to the top
        // Sort them so symbol (text) layers are above others
        const sortedTerraLayers = terraDrawLayers.sort((a, b) => {
            // Symbol layers should be on top
            if (a.type === 'symbol' && b.type !== 'symbol') return 1;
            if (a.type !== 'symbol' && b.type === 'symbol') return -1;
            // Line layers above fill
            if (a.type === 'line' && b.type === 'fill') return 1;
            if (a.type === 'fill' && b.type === 'line') return -1;
            return 0;
        });
        
        // Move each layer to the top
        sortedTerraLayers.forEach(layer => {
            try {
                // Remove and re-add the layer to put it on top
                const layerConfig = JSON.parse(JSON.stringify(layer));
                _map.removeLayer(layer.id);
                _map.addLayer(layerConfig);
                // console.log(`Moved ${layer.id} to top`);
            } catch (e) {
                // Try just moving it
                try {
                    _map.moveLayer(layer.id);
                } catch (e2) {
                    // Layer might not exist
                }
            }
        });
        
        // Store the layer IDs
        _terraDrawLayerIds = sortedTerraLayers.map(l => l.id);
    }
    
    /**
     * Start monitoring to keep layers on top
     * @private
     */
    function _startMonitoring() {
        // Listen for when new layers are added
        _map.on('data', (e) => {
            // Only react to TerraDraw layer changes
            if (e.sourceId && (e.sourceId.includes('terradraw') || e.sourceId.includes('measure'))) {
                // Debounce the fix
                if (_fixDebounceTimeout) clearTimeout(_fixDebounceTimeout);
                _fixDebounceTimeout = setTimeout(() => {
                    _forceLayersToTop();
                }, 1000);
            }
        });
    }
    
    /**
     * Initialize the module
     */
    function initialize(map) {
        _map = map;
        
        // Start monitoring for TerraDraw layers
        _startMonitoring();
        
        // Also listen for measurement events
        if (App.Core.Events) {
            App.Core.Events.on('measure:started', () => {
                // Fix layer order when measurement starts
                setTimeout(() => {
                    _forceLayersToTop();
                }, 500);
                
                // And once more after a delay to ensure it stays on top
                setTimeout(() => {
                    _forceLayersToTop();
                }, 2000);
            });
        }
    }
    
    /**
     * Stop monitoring
     */
    function stop() {
        if (_intervalId) {
            clearInterval(_intervalId);
            _intervalId = null;
        }
    }
    
    // Public API
    return {
        initialize: initialize,
        forceToTop: _forceLayersToTop,
        stop: stop
    };
})();

// Auto-initialize when map is ready
document.addEventListener('DOMContentLoaded', function() {
    const checkMap = setInterval(() => {
        const map = App.Map.Init && App.Map.Init.getMap ? App.Map.Init.getMap() : null;
        if (map) {
            clearInterval(checkMap);
            // Wait for map to be fully loaded
            if (map.loaded()) {
                App.Map.TerraDrawTop.initialize(map);
            } else {
                map.once('load', () => {
                    App.Map.TerraDrawTop.initialize(map);
                });
            }
        }
    }, 500);
});

// console.log('app.map.terradraw-top.js loaded - Enforces TerraDraw layers stay on top');