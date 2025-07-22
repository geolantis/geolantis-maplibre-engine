/**
 * Performance Diagnostics
 * @namespace App.Core.Diagnostics
 * 
 * This module helps identify performance bottlenecks by measuring
 * different aspects of the system.
 */
App.Core = App.Core || {};
App.Core.Diagnostics = (function() {
    // Private variables
    var _measurements = {
        domQueries: [],
        layerOps: [],
        bridgeCalls: [],
        renders: []
    };
    
    var _interceptors = {
        getElementById: null,
        querySelector: null,
        querySelectorAll: null
    };
    
    var _enabled = false;
    var _startTime = 0;
    
    /**
     * Start diagnostic mode
     */
    function startDiagnostics() {
        _enabled = true;
        _startTime = performance.now();
        
        // Intercept DOM queries
        interceptDOMQueries();
        
        // Intercept MapLibre operations
        interceptMapOperations();
        
        // Monitor frame timing
        monitorFrames();
        
        console.log('🔍 Diagnostics started - measuring performance bottlenecks');
    }
    
    /**
     * Intercept DOM query methods to measure their performance
     * @private
     */
    function interceptDOMQueries() {
        // getElementById
        if (!_interceptors.getElementById) {
            _interceptors.getElementById = document.getElementById;
            document.getElementById = function(id) {
                if (_enabled) {
                    var start = performance.now();
                    var result = _interceptors.getElementById.call(document, id);
                    var duration = performance.now() - start;
                    
                    if (duration > 1) { // Only log slow queries
                        _measurements.domQueries.push({
                            type: 'getElementById',
                            query: id,
                            duration: duration,
                            found: !!result,
                            timestamp: Date.now()
                        });
                    }
                    
                    return result;
                }
                return _interceptors.getElementById.call(document, id);
            };
        }
        
        // querySelector
        if (!_interceptors.querySelector) {
            _interceptors.querySelector = document.querySelector;
            document.querySelector = function(selector) {
                if (_enabled) {
                    var start = performance.now();
                    var result = _interceptors.querySelector.call(document, selector);
                    var duration = performance.now() - start;
                    
                    if (duration > 1) {
                        _measurements.domQueries.push({
                            type: 'querySelector',
                            query: selector,
                            duration: duration,
                            found: !!result,
                            timestamp: Date.now()
                        });
                    }
                    
                    return result;
                }
                return _interceptors.querySelector.call(document, selector);
            };
        }
    }
    
    /**
     * Intercept MapLibre operations
     * @private
     */
    function interceptMapOperations() {
        if (!window.interface) return;
        
        // Track addFeature calls
        var originalAddFeature = window.interface.addFeature;
        if (originalAddFeature && !window.interface._diagAddFeature) {
            window.interface._diagAddFeature = originalAddFeature;
            window.interface.addFeature = function() {
                if (_enabled) {
                    var start = performance.now();
                    var result = window.interface._diagAddFeature.apply(this, arguments);
                    var duration = performance.now() - start;
                    
                    _measurements.layerOps.push({
                        type: 'addFeature',
                        layerId: arguments[0],
                        duration: duration,
                        timestamp: Date.now()
                    });
                    
                    return result;
                }
                return window.interface._diagAddFeature.apply(this, arguments);
            };
        }
        
        // Track removeObjectFromLayer calls
        var originalRemove = window.interface.removeObjectFromLayer;
        if (originalRemove && !window.interface._diagRemoveObject) {
            window.interface._diagRemoveObject = originalRemove;
            window.interface.removeObjectFromLayer = function() {
                if (_enabled) {
                    var start = performance.now();
                    var result = window.interface._diagRemoveObject.apply(this, arguments);
                    var duration = performance.now() - start;
                    
                    _measurements.layerOps.push({
                        type: 'removeObject',
                        layerId: arguments[0],
                        objectId: arguments[1],
                        duration: duration,
                        timestamp: Date.now()
                    });
                    
                    return result;
                }
                return window.interface._diagRemoveObject.apply(this, arguments);
            };
        }
    }
    
    /**
     * Monitor frame rendering
     * @private
     */
    function monitorFrames() {
        var lastFrameTime = 0;
        var frameCount = 0;
        
        function measureFrame(timestamp) {
            if (!_enabled) return;
            
            if (lastFrameTime) {
                var frameDuration = timestamp - lastFrameTime;
                frameCount++;
                
                // Sample every 10th frame to reduce overhead
                if (frameCount % 10 === 0) {
                    _measurements.renders.push({
                        duration: frameDuration,
                        fps: 1000 / frameDuration,
                        timestamp: Date.now()
                    });
                }
            }
            
            lastFrameTime = timestamp;
            
            if (_enabled) {
                requestAnimationFrame(measureFrame);
            }
        }
        
        requestAnimationFrame(measureFrame);
    }
    
    /**
     * Analyze collected data
     * @private
     */
    function analyzeData() {
        var report = {
            duration: (performance.now() - _startTime) / 1000,
            domQueries: analyzeDOMQueries(),
            layerOps: analyzeLayerOps(),
            rendering: analyzeRendering(),
            bottlenecks: []
        };
        
        // Identify bottlenecks
        if (report.domQueries.avgDuration > 5) {
            report.bottlenecks.push({
                type: 'DOM Queries',
                severity: 'high',
                message: `Slow DOM queries averaging ${report.domQueries.avgDuration.toFixed(1)}ms`
            });
        }
        
        if (report.layerOps.tmpLayerOps > 100) {
            report.bottlenecks.push({
                type: 'Temporary Layers',
                severity: 'high',
                message: `Excessive temporary layer operations: ${report.layerOps.tmpLayerOps}`
            });
        }
        
        if (report.rendering.avgFPS < 30) {
            report.bottlenecks.push({
                type: 'Rendering',
                severity: 'high',
                message: `Low average FPS: ${report.rendering.avgFPS.toFixed(1)}`
            });
        }
        
        return report;
    }
    
    /**
     * Analyze DOM queries
     * @private
     */
    function analyzeDOMQueries() {
        var queries = _measurements.domQueries;
        if (queries.length === 0) return { count: 0 };
        
        var totalDuration = queries.reduce((sum, q) => sum + q.duration, 0);
        var slowQueries = queries.filter(q => q.duration > 10);
        var notFoundQueries = queries.filter(q => !q.found);
        
        // Group by query
        var queryGroups = {};
        queries.forEach(q => {
            var key = q.type + ':' + q.query;
            if (!queryGroups[key]) {
                queryGroups[key] = { count: 0, totalDuration: 0 };
            }
            queryGroups[key].count++;
            queryGroups[key].totalDuration += q.duration;
        });
        
        // Find most frequent queries
        var frequentQueries = Object.entries(queryGroups)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([key, data]) => ({
                query: key,
                count: data.count,
                avgDuration: (data.totalDuration / data.count).toFixed(2)
            }));
        
        return {
            count: queries.length,
            avgDuration: totalDuration / queries.length,
            slowQueries: slowQueries.length,
            notFoundQueries: notFoundQueries.length,
            frequentQueries: frequentQueries
        };
    }
    
    /**
     * Analyze layer operations
     * @private
     */
    function analyzeLayerOps() {
        var ops = _measurements.layerOps;
        if (ops.length === 0) return { count: 0 };
        
        var tmpLayerOps = ops.filter(op => op.layerId && op.layerId.includes('tmpLayer'));
        var totalDuration = ops.reduce((sum, op) => sum + op.duration, 0);
        
        return {
            count: ops.length,
            avgDuration: totalDuration / ops.length,
            tmpLayerOps: tmpLayerOps.length,
            tmpLayerPercent: (tmpLayerOps.length / ops.length * 100).toFixed(1),
            byType: {
                addFeature: ops.filter(op => op.type === 'addFeature').length,
                removeObject: ops.filter(op => op.type === 'removeObject').length
            }
        };
    }
    
    /**
     * Analyze rendering performance
     * @private
     */
    function analyzeRendering() {
        var frames = _measurements.renders;
        if (frames.length === 0) return { avgFPS: 0 };
        
        var totalFPS = frames.reduce((sum, f) => sum + f.fps, 0);
        var lowFPSFrames = frames.filter(f => f.fps < 30);
        
        return {
            frameCount: frames.length,
            avgFPS: totalFPS / frames.length,
            lowFPSFrames: lowFPSFrames.length,
            lowFPSPercent: (lowFPSFrames.length / frames.length * 100).toFixed(1)
        };
    }
    
    // Public API
    return {
        /**
         * Start diagnostics
         * @param {number} duration - Duration in seconds (default 10)
         */
        start: function(duration) {
            duration = duration || 10;
            
            // Clear previous measurements
            _measurements = {
                domQueries: [],
                layerOps: [],
                bridgeCalls: [],
                renders: []
            };
            
            startDiagnostics();
            
            // Auto-stop after duration
            setTimeout(() => {
                this.stop();
            }, duration * 1000);
            
            return `Diagnostics started for ${duration} seconds...`;
        },
        
        /**
         * Stop diagnostics and generate report
         */
        stop: function() {
            _enabled = false;
            
            // Restore original methods
            if (_interceptors.getElementById) {
                document.getElementById = _interceptors.getElementById;
            }
            if (_interceptors.querySelector) {
                document.querySelector = _interceptors.querySelector;
            }
            
            var report = analyzeData();
            console.log('🔍 Diagnostics complete');
            
            return report;
        },
        
        /**
         * Get current status
         */
        isRunning: function() {
            return _enabled;
        },
        
        /**
         * Generate formatted report
         */
        generateReport: function(report) {
            var lines = [
                '=== Performance Diagnostics Report ===',
                `Duration: ${report.duration.toFixed(1)}s`,
                '',
                '📊 DOM Queries:',
                `  Total: ${report.domQueries.count}`,
                `  Avg Duration: ${report.domQueries.avgDuration?.toFixed(2) || 0}ms`,
                `  Slow Queries (>10ms): ${report.domQueries.slowQueries || 0}`,
                `  Not Found: ${report.domQueries.notFoundQueries || 0}`,
                ''
            ];
            
            if (report.domQueries.frequentQueries?.length > 0) {
                lines.push('  Most Frequent:');
                report.domQueries.frequentQueries.forEach(q => {
                    lines.push(`    ${q.query}: ${q.count} calls, avg ${q.avgDuration}ms`);
                });
                lines.push('');
            }
            
            lines.push(
                '🗺️ Layer Operations:',
                `  Total: ${report.layerOps.count}`,
                `  Avg Duration: ${report.layerOps.avgDuration?.toFixed(2) || 0}ms`,
                `  Temp Layer Ops: ${report.layerOps.tmpLayerOps} (${report.layerOps.tmpLayerPercent || 0}%)`,
                `  Add Feature: ${report.layerOps.byType?.addFeature || 0}`,
                `  Remove Object: ${report.layerOps.byType?.removeObject || 0}`,
                '',
                '🎬 Rendering:',
                `  Avg FPS: ${report.rendering.avgFPS?.toFixed(1) || 0}`,
                `  Low FPS Frames: ${report.rendering.lowFPSPercent || 0}%`,
                ''
            );
            
            if (report.bottlenecks.length > 0) {
                lines.push('⚠️ Identified Bottlenecks:');
                report.bottlenecks.forEach(b => {
                    lines.push(`  [${b.severity.toUpperCase()}] ${b.type}: ${b.message}`);
                });
            } else {
                lines.push('✅ No major bottlenecks identified');
            }
            
            return lines.join('\n');
        }
    };
})();

console.log('app.core.diagnostics.js loaded - Performance diagnostics ready');