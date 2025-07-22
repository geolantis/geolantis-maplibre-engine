/**
 * Layer order management - ensures measurement layers stay on top and PDF overlays above basemap
 * @namespace App.Map.LayerOrder
 */
App.Map = App.Map || {};
App.Map.LayerOrder = (function() {
    var _map = null;
    var _measurementLayerIds = ['terradraw', 'measure'];
    var _pdfOverlayLayerIds = ['pdf-overlay'];
    var _isUpdating = false;
    var _updateTimeout = null;
    
    /**
     * Check if a layer is a measurement layer
     * @private
     */
    function _isMeasurementLayer(layerId) {
        return _measurementLayerIds.some(keyword => layerId.includes(keyword));
    }
    
    /**
     * Check if a layer is a PDF overlay layer
     * @private
     */
    function _isPdfOverlayLayer(layerId) {
        return _pdfOverlayLayerIds.some(keyword => layerId.includes(keyword));
    }
    
    /**
     * Ensure proper layer ordering: basemap < PDF overlays < measurement layers
     * @private
     */
    function _ensureProperLayerOrder() {
        if (!_map || _isUpdating) return;
        
        const style = _map.getStyle();
        if (!style || !style.layers) return;
        
        _isUpdating = true;
        
        // Find all PDF overlay layers
        const pdfOverlayLayers = style.layers.filter(layer => _isPdfOverlayLayer(layer.id));
        
        // Find all measurement layers
        const measurementLayers = style.layers.filter(layer => _isMeasurementLayer(layer.id));
        
        // Check if layers are already in correct order to avoid unnecessary moves
        const layerIds = style.layers.map(layer => layer.id);
        const pdfOverlayIds = pdfOverlayLayers.map(layer => layer.id);
        const measurementIds = measurementLayers.map(layer => layer.id);
        
        // Check if measurement layers are already at the top
        const measurementLayersAtTop = measurementIds.every(id => {
            const index = layerIds.indexOf(id);
            const higherLayers = layerIds.slice(index + 1);
            return !higherLayers.some(layerId => 
                !measurementIds.includes(layerId) // Only non-measurement layers should be below
            );
        });
        
        // Only move layers if they're not already in correct positions
        let layersMoved = false;
        
        // First, ensure PDF overlays are above basemap layers (but only if needed)
        if (pdfOverlayLayers.length > 0) {
            pdfOverlayLayers.forEach(layer => {
                const currentIndex = layerIds.indexOf(layer.id);
                const shouldMove = layerIds.slice(currentIndex + 1).some(id => 
                    measurementIds.includes(id) // PDF overlays should be below measurements
                );
                
                if (shouldMove) {
                    try {
                        _map.moveLayer(layer.id);
                        layersMoved = true;
                    } catch (e) {
                        console.warn('Could not move PDF overlay layer:', layer.id, e);
                    }
                }
            });
        }
        
        // Then, ensure measurement layers are on top (but only if needed)
        if (measurementLayers.length > 0 && !measurementLayersAtTop) {
            // Sort to ensure text layers (symbol type) are on top of other measurement layers
            measurementLayers.sort((a, b) => {
                if (a.type === 'symbol' && b.type !== 'symbol') return 1;
                if (a.type !== 'symbol' && b.type === 'symbol') return -1;
                return 0;
            });
            
            // Move each measurement layer to the very top
            measurementLayers.forEach(layer => {
                try {
                    _map.moveLayer(layer.id);
                    layersMoved = true;
                } catch (e) {
                    console.warn('Could not move measurement layer:', layer.id, e);
                }
            });
        }
        
        // Only log if we actually moved layers
        if (layersMoved || pdfOverlayLayers.length > 0 || measurementLayers.length > 0) {
            console.log('Layer order updated:', {
                pdfOverlays: pdfOverlayLayers.length,
                measurements: measurementLayers.length,
                layersMoved: layersMoved
            });
        }
        
        // Reset flag after operations complete
        setTimeout(() => {
            _isUpdating = false;
        }, 50);
    }
    
    /**
     * Legacy method for backward compatibility
     * @private
     */
    function _ensureMeasurementLayersOnTop() {
        _ensureProperLayerOrder();
    }
    
    /**
     * Set up event listeners
     * @private
     */
    function _setupListeners() {
        if (!_map) return;
        
        // Listen for style changes (only for basemap changes, not every style update)
        _map.on('styledata', (event) => {
            // Only handle when a new style is loaded (basemap change), not style updates
            if (event && event.dataType === 'style') {
                console.log('🗺️ Basemap changed, updating layer order');
                // Debounce layer order updates to prevent infinite loops
                if (_updateTimeout) {
                    clearTimeout(_updateTimeout);
                }
                _updateTimeout = setTimeout(() => {
                    _ensureProperLayerOrder();
                    _updateTimeout = null;
                }, 200);
            }
        });
        
        // Listen for new layers (only update order for specific layer types)
        const originalAddLayer = _map.addLayer.bind(_map);
        _map.addLayer = function(layer, before) {
            // Call original method
            originalAddLayer(layer, before);
            
            // Only update layer order if this is a layer that affects ordering
            const needsOrdering = _isPdfOverlayLayer(layer.id) || _isMeasurementLayer(layer.id);
            
            if (needsOrdering) {
                console.log('📐 New overlay/measurement layer added, updating order:', layer.id);
                // Slight delay to let the layer fully initialize
                setTimeout(_ensureProperLayerOrder, 50);
            }
        };
    }
    
    /**
     * Initialize layer order management
     */
    function initialize(map) {
        _map = map;
        _setupListeners();
        
        // Initial check
        _ensureProperLayerOrder();
        
        console.log('Layer order management initialized (with PDF overlay support)');
    }
    
    // Public API
    return {
        initialize: initialize,
        ensureMeasurementLayersOnTop: _ensureMeasurementLayersOnTop, // Legacy compatibility
        ensureProperLayerOrder: _ensureProperLayerOrder,
        isPdfOverlayLayer: _isPdfOverlayLayer,
        isMeasurementLayer: _isMeasurementLayer
    };
})();

// Auto-initialize when map is ready
document.addEventListener('DOMContentLoaded', function() {
    const checkMap = setInterval(() => {
        const map = App.Map.Init && App.Map.Init.getMap ? App.Map.Init.getMap() : null;
        if (map) {
            clearInterval(checkMap);
            App.Map.LayerOrder.initialize(map);
        }
    }, 500);
});

console.log('app.map.layer-order.js loaded');