/**
 * WebGL Optimizer for StakeOut AI
 * Optimizes MapLibre GL rendering performance
 */
class WebGLOptimizer {
    constructor() {
        this.map = null;
        this.optimizationLevel = 'balanced'; // 'performance', 'balanced', 'quality'
        this.isOptimizing = false;
        
        // Optimization settings
        this.settings = {
            performance: {
                maxSourceTiles: 3,
                fadeOpacity: false,
                antialias: false,
                preserveDrawingBuffer: false,
                refreshExpiredTiles: false,
                maxTileCacheSize: 50,
                renderWorldCopies: false,
                collectResourceTiming: false,
                fadeDuration: 0,
                crossSourceCollisions: false
            },
            balanced: {
                maxSourceTiles: 5,
                fadeOpacity: true,
                antialias: true,
                preserveDrawingBuffer: false,
                refreshExpiredTiles: true,
                maxTileCacheSize: 100,
                renderWorldCopies: true,
                collectResourceTiming: false,
                fadeDuration: 150,
                crossSourceCollisions: true
            },
            quality: {
                maxSourceTiles: 8,
                fadeOpacity: true,
                antialias: true,
                preserveDrawingBuffer: true,
                refreshExpiredTiles: true,
                maxTileCacheSize: 200,
                renderWorldCopies: true,
                collectResourceTiming: true,
                fadeDuration: 300,
                crossSourceCollisions: true
            }
        };
        
        // Layer visibility optimization
        this.layerVisibility = new Map();
        this.zoomThresholds = {
            detail: 16,     // Show detail layers above this zoom
            medium: 12,     // Show medium detail above this zoom
            overview: 8     // Show only essential layers below this
        };
    }
    
    /**
     * Initialize optimizer with map instance
     * @param {Object} map - MapLibre GL map instance
     */
    initialize(map) {
        this.map = map;
        
        // Apply initial optimizations
        this.applyOptimizations();
        
        // Set up automatic optimization based on performance
        this.setupAutoOptimization();
        
        console.log('[WebGLOptimizer] Initialized with', this.optimizationLevel, 'settings');
    }
    
    /**
     * Apply optimizations based on current level
     */
    applyOptimizations() {
        if (!this.map) return;
        
        const settings = this.settings[this.optimizationLevel];
        
        // Apply map options
        if (settings.fadeDuration !== undefined) {
            this.map.style.transition = { duration: settings.fadeDuration };
        }
        
        // Optimize tile loading
        this.optimizeTileLoading(settings);
        
        // Optimize layer rendering
        this.optimizeLayerRendering();
        
        // Apply WebGL-specific optimizations
        this.applyWebGLOptimizations(settings);
    }
    
    /**
     * Optimize tile loading behavior
     */
    optimizeTileLoading(settings) {
        // Adjust tile cache size
        if (this.map._requestManager) {
            this.map._requestManager._tileCache.setMaxSize(settings.maxTileCacheSize);
        }
        
        // Optimize source tile loading
        const sources = this.map.style.sourceCaches;
        Object.keys(sources).forEach(sourceId => {
            const source = sources[sourceId];
            if (source && source._source) {
                // Limit concurrent tile requests
                if (source._source.type === 'vector' || source._source.type === 'raster') {
                    source._maxTileCacheSize = settings.maxSourceTiles;
                }
            }
        });
    }
    
    /**
     * Optimize layer rendering based on zoom level
     */
    optimizeLayerRendering() {
        if (!this.map) return;
        
        const currentZoom = this.map.getZoom();
        
        this.map.getStyle().layers.forEach(layer => {
            // Skip essential layers
            if (this.isEssentialLayer(layer)) return;
            
            // Store original visibility if not already stored
            if (!this.layerVisibility.has(layer.id)) {
                this.layerVisibility.set(layer.id, {
                    original: this.map.getLayoutProperty(layer.id, 'visibility') || 'visible',
                    importance: this.getLayerImportance(layer)
                });
            }
            
            // Apply visibility based on zoom and importance
            const layerInfo = this.layerVisibility.get(layer.id);
            if (layerInfo.original === 'visible') {
                const shouldShow = this.shouldShowLayer(layer, currentZoom, layerInfo.importance);
                const currentVisibility = this.map.getLayoutProperty(layer.id, 'visibility');
                
                if (shouldShow && currentVisibility !== 'visible') {
                    this.map.setLayoutProperty(layer.id, 'visibility', 'visible');
                } else if (!shouldShow && currentVisibility === 'visible') {
                    this.map.setLayoutProperty(layer.id, 'visibility', 'none');
                }
            }
        });
    }
    
    /**
     * Apply WebGL-specific optimizations
     */
    applyWebGLOptimizations(settings) {
        if (!this.map.painter || !this.map.painter.context) return;
        
        const gl = this.map.painter.context.gl;
        if (!gl) return;
        
        // Optimize blending for better performance
        if (this.optimizationLevel === 'performance') {
            // Disable expensive blending operations where possible
            this.map.painter.context.blendFunc.set([gl.ONE, gl.ONE_MINUS_SRC_ALPHA]);
        }
        
        // Optimize texture filtering
        if (settings.antialias === false) {
            // Use nearest neighbor filtering for better performance
            const textureFilter = gl.NEAREST;
            this.map.painter.context.activeTexture.set(gl.TEXTURE0);
        }
    }
    
    /**
     * Check if layer is essential (always visible)
     */
    isEssentialLayer(layer) {
        // StakeOut-related layers are always essential
        if (layer.id.includes('stakeout') || 
            layer.id.includes('guide') || 
            layer.id.includes('circle')) {
            return true;
        }
        
        // Background and base layers are essential
        if (layer.type === 'background' || 
            layer.id.includes('base') ||
            layer.id.includes('land')) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Get layer importance score
     */
    getLayerImportance(layer) {
        // Higher score = more important
        if (layer.type === 'symbol') return 3;  // Labels and icons
        if (layer.type === 'line') return 2;    // Roads and boundaries
        if (layer.type === 'fill') return 1;    // Area fills
        return 0;                                // Others
    }
    
    /**
     * Determine if layer should be shown at current zoom
     */
    shouldShowLayer(layer, zoom, importance) {
        if (this.optimizationLevel === 'quality') {
            return true; // Show all layers in quality mode
        }
        
        if (zoom >= this.zoomThresholds.detail) {
            return true; // Show all layers at high zoom
        }
        
        if (zoom >= this.zoomThresholds.medium) {
            return importance >= 2; // Show important layers at medium zoom
        }
        
        // At low zoom, only show most important layers
        return importance >= 3;
    }
    
    /**
     * Set up automatic optimization based on performance
     */
    setupAutoOptimization() {
        if (!window.PerformanceMonitor) return;
        
        const monitor = new window.PerformanceMonitor();
        monitor.start();
        
        // Listen for performance issues
        monitor.onOptimizationNeeded((optimization) => {
            if (this.isOptimizing) return;
            
            console.log('[WebGLOptimizer] Performance issue detected:', optimization.reason);
            
            // Auto-adjust optimization level
            if (optimization.reason === 'lowFPS' && this.optimizationLevel !== 'performance') {
                this.setOptimizationLevel('performance');
            } else if (optimization.metrics.fps.average > 50 && this.optimizationLevel === 'performance') {
                this.setOptimizationLevel('balanced');
            }
        });
        
        // Also listen to zoom changes for layer optimization
        this.map.on('zoom', () => {
            this.optimizeLayerRendering();
        });
    }
    
    /**
     * Set optimization level
     * @param {string} level - 'performance', 'balanced', or 'quality'
     */
    setOptimizationLevel(level) {
        if (this.optimizationLevel === level) return;
        
        console.log('[WebGLOptimizer] Changing optimization level to:', level);
        this.optimizationLevel = level;
        this.isOptimizing = true;
        
        // Apply new optimizations
        this.applyOptimizations();
        
        // Notify user preferences if available
        if (window.UserPreferences) {
            window.UserPreferences.set('performance.optimizationLevel', level);
        }
        
        setTimeout(() => {
            this.isOptimizing = false;
        }, 500);
    }
    
    /**
     * Get current optimization status
     */
    getStatus() {
        const visibleLayers = Array.from(this.layerVisibility.entries())
            .filter(([id, info]) => {
                const visibility = this.map.getLayoutProperty(id, 'visibility');
                return visibility === 'visible';
            }).length;
        
        return {
            level: this.optimizationLevel,
            settings: this.settings[this.optimizationLevel],
            visibleLayers,
            totalLayers: this.layerVisibility.size,
            currentZoom: this.map.getZoom()
        };
    }
    
    /**
     * Force optimization refresh
     */
    refresh() {
        this.applyOptimizations();
    }
    
    /**
     * Reset to default settings
     */
    reset() {
        this.optimizationLevel = 'balanced';
        this.layerVisibility.clear();
        this.applyOptimizations();
    }
    
    /**
     * Destroy and cleanup
     */
    destroy() {
        // Restore original layer visibility
        this.layerVisibility.forEach((info, layerId) => {
            if (this.map.getLayer(layerId)) {
                this.map.setLayoutProperty(layerId, 'visibility', info.original);
            }
        });
        
        this.layerVisibility.clear();
        this.map = null;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebGLOptimizer;
} else {
    window.WebGLOptimizer = WebGLOptimizer;
}