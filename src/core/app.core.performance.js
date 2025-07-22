/**
 * Performance monitoring and profiling for MapLibre
 * @namespace App.Core.Performance
 * 
 * This module provides comprehensive performance tracking for MapLibre operations,
 * helping identify bottlenecks and optimize map rendering performance.
 */
App.Core = App.Core || {};
App.Core.Performance = (function() {
    // Private variables
    var _enabled = true;
    var _metrics = {
        mapLoad: {},
        styleChanges: [],
        layerOperations: [],
        sourceOperations: [],
        renderFrames: [],
        interactions: [],
        tileLoads: [],
        featureQueries: []
    };
    
    // Performance thresholds for warnings (in milliseconds)
    var _thresholds = {
        mapLoad: 3000,
        styleChange: 1000,
        layerOperation: 100,
        sourceOperation: 200,
        renderFrame: 16.67, // 60 FPS target
        interaction: 100,
        tileLoad: 500,
        featureQuery: 50
    };
    
    // Ring buffers for continuous metrics
    var _frameTimings = new Array(120); // Last 2 seconds at 60fps
    var _frameIndex = 0;
    var _lastFrameTime = 0;
    
    /**
     * Mark the start of a performance measurement
     * @param {string} category - Performance category
     * @param {string} operation - Operation name
     * @param {Object} metadata - Additional metadata
     * @returns {Object} Performance marker object
     */
    function mark(category, operation, metadata = {}) {
        const marker = {
            category,
            operation,
            startTime: performance.now(),
            metadata,
            id: `${category}_${operation}_${Date.now()}`
        };
        
        // Use Performance API if available
        if (window.performance && window.performance.mark) {
            try {
                window.performance.mark(`${marker.id}_start`);
            } catch (e) {
                console.warn('Performance mark failed:', e);
            }
        }
        
        return marker;
    }
    
    /**
     * Measure the end of a performance measurement
     * @param {Object} marker - Performance marker from mark()
     * @returns {Object} Measurement result
     */
    function measure(marker) {
        if (!marker) return null;
        
        const endTime = performance.now();
        const duration = endTime - marker.startTime;
        
        // Use Performance API if available
        if (window.performance && window.performance.measure) {
            try {
                window.performance.measure(
                    marker.id,
                    `${marker.id}_start`
                );
            } catch (e) {
                console.warn('Performance measure failed:', e);
            }
        }
        
        const measurement = {
            ...marker,
            endTime,
            duration,
            timestamp: new Date().toISOString()
        };
        
        // Store measurement
        storeMeasurement(measurement);
        
        // Check threshold and warn if exceeded
        checkThreshold(measurement);
        
        return measurement;
    }
    
    /**
     * Store measurement in appropriate metrics array
     * @param {Object} measurement - Measurement data
     * @private
     */
    function storeMeasurement(measurement) {
        const { category } = measurement;
        
        switch (category) {
            case 'mapLoad':
                _metrics.mapLoad = measurement;
                break;
            case 'styleChange':
                _metrics.styleChanges.push(measurement);
                // Keep only last 50 style changes
                if (_metrics.styleChanges.length > 50) {
                    _metrics.styleChanges.shift();
                }
                break;
            case 'layerOperation':
                _metrics.layerOperations.push(measurement);
                if (_metrics.layerOperations.length > 100) {
                    _metrics.layerOperations.shift();
                }
                break;
            case 'sourceOperation':
                _metrics.sourceOperations.push(measurement);
                if (_metrics.sourceOperations.length > 100) {
                    _metrics.sourceOperations.shift();
                }
                break;
            case 'interaction':
                _metrics.interactions.push(measurement);
                if (_metrics.interactions.length > 100) {
                    _metrics.interactions.shift();
                }
                break;
            case 'tileLoad':
                _metrics.tileLoads.push(measurement);
                if (_metrics.tileLoads.length > 200) {
                    _metrics.tileLoads.shift();
                }
                break;
            case 'featureQuery':
                _metrics.featureQueries.push(measurement);
                if (_metrics.featureQueries.length > 100) {
                    _metrics.featureQueries.shift();
                }
                break;
        }
    }
    
    /**
     * Check if measurement exceeds threshold
     * @param {Object} measurement - Measurement data
     * @private
     */
    function checkThreshold(measurement) {
        const threshold = _thresholds[measurement.category];
        if (threshold && measurement.duration > threshold) {
            console.warn(
                `⚠️ Performance warning: ${measurement.category} - ${measurement.operation} ` +
                `took ${measurement.duration.toFixed(2)}ms (threshold: ${threshold}ms)`,
                measurement.metadata
            );
            
            // Trigger event for external monitoring
            if (App.Core.Events) {
                App.Core.Events.trigger('performance:threshold:exceeded', {
                    measurement,
                    threshold
                });
            }
        }
    }
    
    /**
     * Monitor frame rendering performance
     * @param {Object} map - MapLibre map instance
     * @private
     */
    function monitorFrameRate(map) {
        if (!map || !_enabled) return;
        
        let rafId;
        
        function measureFrame(timestamp) {
            if (_lastFrameTime) {
                const frameDuration = timestamp - _lastFrameTime;
                _frameTimings[_frameIndex] = frameDuration;
                _frameIndex = (_frameIndex + 1) % _frameTimings.length;
                
                // Check for frame drops (> 33ms = below 30fps)
                if (frameDuration > 33) {
                    // Disable frame drop logging as it causes performance issues
                    // Logging to console during frame drops makes them worse!
                    // if (App.Core.PerformanceConfig && App.Core.PerformanceConfig.get('debug.warnOnSlowOperations')) {
                    //     console.warn(`🎯 Frame drop detected: ${frameDuration.toFixed(2)}ms`);
                    // }
                }
            }
            
            _lastFrameTime = timestamp;
            
            if (_enabled) {
                rafId = requestAnimationFrame(measureFrame);
            }
        }
        
        rafId = requestAnimationFrame(measureFrame);
        
        // Return cleanup function
        return () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
        };
    }
    
    /**
     * Wrap MapLibre methods with performance monitoring
     * @param {Object} map - MapLibre map instance
     * @private
     */
    function wrapMapMethods(map) {
        if (!map || !_enabled) return;
        
        // Monitor style operations
        const originalSetStyle = map.setStyle.bind(map);
        map.setStyle = function(style, options) {
            const marker = mark('styleChange', 'setStyle', { style: typeof style === 'string' ? style : 'object' });
            const result = originalSetStyle(style, options);
            
            // Measure after style loads
            map.once('style.load', () => {
                measure(marker);
            });
            
            return result;
        };
        
        // Monitor layer operations
        const originalAddLayer = map.addLayer.bind(map);
        map.addLayer = function(layer, beforeId) {
            const marker = mark('layerOperation', 'addLayer', { 
                layerId: layer.id, 
                type: layer.type,
                beforeId 
            });
            const result = originalAddLayer(layer, beforeId);
            measure(marker);
            return result;
        };
        
        const originalRemoveLayer = map.removeLayer.bind(map);
        map.removeLayer = function(layerId) {
            const marker = mark('layerOperation', 'removeLayer', { layerId });
            const result = originalRemoveLayer(layerId);
            measure(marker);
            return result;
        };
        
        // Monitor source operations
        const originalAddSource = map.addSource.bind(map);
        map.addSource = function(sourceId, source) {
            const marker = mark('sourceOperation', 'addSource', { 
                sourceId, 
                type: source.type,
                dataSize: source.data ? JSON.stringify(source.data).length : 0
            });
            const result = originalAddSource(sourceId, source);
            measure(marker);
            return result;
        };
        
        const originalRemoveSource = map.removeSource.bind(map);
        map.removeSource = function(sourceId) {
            const marker = mark('sourceOperation', 'removeSource', { sourceId });
            const result = originalRemoveSource(sourceId);
            measure(marker);
            return result;
        };
        
        // Monitor GeoJSON updates
        const originalGetSource = map.getSource.bind(map);
        map.getSource = function(sourceId) {
            const source = originalGetSource(sourceId);
            if (source && source.setData && !source._perfWrapped) {
                const originalSetData = source.setData.bind(source);
                source.setData = function(data) {
                    const marker = mark('sourceOperation', 'setData', {
                        sourceId,
                        featureCount: data.features ? data.features.length : 0,
                        dataSize: JSON.stringify(data).length
                    });
                    const result = originalSetData(data);
                    measure(marker);
                    return result;
                };
                source._perfWrapped = true;
            }
            return source;
        };
        
        // Monitor feature queries
        const originalQueryRenderedFeatures = map.queryRenderedFeatures.bind(map);
        map.queryRenderedFeatures = function(point, options) {
            const marker = mark('featureQuery', 'queryRenderedFeatures', { 
                hasPoint: !!point,
                layers: options?.layers 
            });
            const result = originalQueryRenderedFeatures(point, options);
            const measurement = measure(marker);
            if (measurement) {
                measurement.metadata.resultCount = result.length;
            }
            return result;
        };
    }
    
    /**
     * Monitor map events for performance insights
     * @param {Object} map - MapLibre map instance
     * @private
     */
    function monitorMapEvents(map) {
        if (!map || !_enabled) return;
        
        // Monitor tile loading
        map.on('dataloading', (e) => {
            if (e.tile) {
                e.tile._perfMarker = mark('tileLoad', 'load', {
                    coord: e.tile.tileID.canonical.toString(),
                    source: e.sourceId
                });
            }
        });
        
        map.on('data', (e) => {
            if (e.tile && e.tile._perfMarker) {
                measure(e.tile._perfMarker);
                delete e.tile._perfMarker;
            }
        });
        
        // Monitor user interactions
        const interactionEvents = ['dragstart', 'drag', 'dragend', 'zoomstart', 'zoom', 'zoomend'];
        interactionEvents.forEach(eventName => {
            map.on(eventName, () => {
                if (eventName.endsWith('start')) {
                    map._perfInteractionMarker = mark('interaction', eventName.replace('start', ''));
                } else if (eventName.endsWith('end') && map._perfInteractionMarker) {
                    measure(map._perfInteractionMarker);
                    delete map._perfInteractionMarker;
                }
            });
        });
    }
    
    /**
     * Calculate current FPS based on frame timings
     * @returns {number} Current FPS
     * @private
     */
    function calculateFPS() {
        const validTimings = _frameTimings.filter(t => t > 0);
        if (validTimings.length === 0) return 0;
        
        const avgFrameTime = validTimings.reduce((a, b) => a + b, 0) / validTimings.length;
        return 1000 / avgFrameTime;
    }
    
    /**
     * Get performance summary
     * @returns {Object} Performance summary
     * @private
     */
    function getSummary() {
        const summary = {
            fps: calculateFPS(),
            mapLoadTime: _metrics.mapLoad.duration || null,
            avgLayerOpTime: calculateAverage(_metrics.layerOperations),
            avgSourceOpTime: calculateAverage(_metrics.sourceOperations),
            avgTileLoadTime: calculateAverage(_metrics.tileLoads),
            avgQueryTime: calculateAverage(_metrics.featureQueries),
            recentStyleChanges: _metrics.styleChanges.length,
            slowOperations: findSlowOperations()
        };
        
        return summary;
    }
    
    /**
     * Calculate average duration from measurements
     * @param {Array} measurements - Array of measurements
     * @returns {number} Average duration
     * @private
     */
    function calculateAverage(measurements) {
        if (!measurements || measurements.length === 0) return 0;
        const sum = measurements.reduce((acc, m) => acc + m.duration, 0);
        return sum / measurements.length;
    }
    
    /**
     * Find operations that exceeded thresholds
     * @returns {Array} Slow operations
     * @private
     */
    function findSlowOperations() {
        const slow = [];
        
        Object.entries(_metrics).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(measurement => {
                    const threshold = _thresholds[measurement.category];
                    if (threshold && measurement.duration > threshold) {
                        slow.push({
                            ...measurement,
                            threshold,
                            excess: measurement.duration - threshold
                        });
                    }
                });
            }
        });
        
        return slow.sort((a, b) => b.excess - a.excess).slice(0, 10);
    }
    
    // Public API
    return {
        /**
         * Initialize performance monitoring for a map instance
         * @param {Object} map - MapLibre map instance
         */
        initialize: function(map) {
            if (!map) {
                console.error('Performance monitoring requires a map instance');
                return;
            }
            
            console.log('🎯 Performance monitoring initialized');
            
            // Start monitoring
            wrapMapMethods(map);
            monitorMapEvents(map);
            const cleanupFrameMonitor = monitorFrameRate(map);
            
            // Monitor initial map load
            const loadMarker = mark('mapLoad', 'initial');
            if (map.loaded()) {
                measure(loadMarker);
            } else {
                map.once('load', () => {
                    measure(loadMarker);
                });
            }
            
            // Store cleanup function
            map._perfCleanup = cleanupFrameMonitor;
        },
        
        /**
         * Enable or disable performance monitoring
         * @param {boolean} enabled - Enable state
         */
        setEnabled: function(enabled) {
            _enabled = enabled;
            console.log(`Performance monitoring ${enabled ? 'enabled' : 'disabled'}`);
        },
        
        /**
         * Get current performance metrics
         * @returns {Object} Current metrics
         */
        getMetrics: function() {
            return {
                ..._metrics,
                summary: getSummary()
            };
        },
        
        /**
         * Stop all performance monitoring
         */
        stop: function() {
            _enabled = false;
            _isCollecting = false;
            if (_stopFrameMonitoring) {
                _stopFrameMonitoring();
                _stopFrameMonitoring = null;
            }
            console.log('[Performance] Monitoring stopped');
        },
        
        /**
         * Get performance summary
         * @returns {Object} Performance summary
         */
        getSummary: getSummary,
        
        /**
         * Clear all collected metrics
         */
        clearMetrics: function() {
            _metrics = {
                mapLoad: {},
                styleChanges: [],
                layerOperations: [],
                sourceOperations: [],
                renderFrames: [],
                interactions: [],
                tileLoads: [],
                featureQueries: []
            };
            _frameTimings.fill(0);
            _frameIndex = 0;
            console.log('Performance metrics cleared');
        },
        
        /**
         * Set performance thresholds
         * @param {Object} thresholds - New threshold values
         */
        setThresholds: function(thresholds) {
            Object.assign(_thresholds, thresholds);
            console.log('Performance thresholds updated:', _thresholds);
        },
        
        /**
         * Create a performance mark
         * @param {string} category - Performance category
         * @param {string} operation - Operation name
         * @param {Object} metadata - Additional metadata
         * @returns {Object} Performance marker
         */
        mark: mark,
        
        /**
         * Measure a performance mark
         * @param {Object} marker - Performance marker
         * @returns {Object} Measurement result
         */
        measure: measure,
        
        /**
         * Export metrics as JSON
         * @returns {string} JSON string of metrics
         */
        exportMetrics: function() {
            return JSON.stringify(this.getMetrics(), null, 2);
        },
        
        /**
         * Generate performance report
         * @returns {string} Human-readable performance report
         */
        generateReport: function() {
            const summary = getSummary();
            const report = [
                '=== MapLibre Performance Report ===',
                `Generated: ${new Date().toISOString()}`,
                '',
                '📊 Summary:',
                `  • Current FPS: ${summary.fps.toFixed(1)}`,
                `  • Map Load Time: ${summary.mapLoadTime ? summary.mapLoadTime.toFixed(0) + 'ms' : 'N/A'}`,
                `  • Avg Layer Op: ${summary.avgLayerOpTime.toFixed(1)}ms`,
                `  • Avg Source Op: ${summary.avgSourceOpTime.toFixed(1)}ms`,
                `  • Avg Tile Load: ${summary.avgTileLoadTime.toFixed(1)}ms`,
                `  • Avg Query Time: ${summary.avgQueryTime.toFixed(1)}ms`,
                '',
                '⚠️ Slow Operations (Top 10):'
            ];
            
            summary.slowOperations.forEach((op, i) => {
                report.push(
                    `  ${i + 1}. ${op.category} - ${op.operation}: ` +
                    `${op.duration.toFixed(1)}ms (${op.excess.toFixed(1)}ms over threshold)`
                );
            });
            
            return report.join('\n');
        },
        
        /**
         * Start recording performance trace
         * @param {string} name - Trace name
         */
        startTrace: function(name = 'maplibre-trace') {
            if (window.performance && window.performance.mark) {
                window.performance.mark(`${name}-start`);
                console.log(`📹 Started performance trace: ${name}`);
            }
        },
        
        /**
         * Stop recording performance trace
         * @param {string} name - Trace name
         * @returns {Object} Trace data
         */
        stopTrace: function(name = 'maplibre-trace') {
            if (window.performance && window.performance.measure) {
                try {
                    window.performance.measure(name, `${name}-start`);
                    const entries = window.performance.getEntriesByName(name);
                    console.log(`📹 Stopped performance trace: ${name}`);
                    return entries[entries.length - 1];
                } catch (e) {
                    console.error('Failed to stop trace:', e);
                }
            }
            return null;
        }
    };
})();

console.log('app.core.performance.js loaded - Performance monitoring ready');