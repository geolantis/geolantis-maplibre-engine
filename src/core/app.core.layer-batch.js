/**
 * Layer Operation Batching
 * @namespace App.Core.LayerBatch
 * 
 * This module batches layer operations to prevent performance degradation
 * from rapid layer updates, especially for temporary layers.
 */
App.Core = App.Core || {};
App.Core.LayerBatch = (function() {
    // Private variables
    var _batchQueue = {};
    var _batchTimer = null;
    var _batchInterval = 100; // Process batches every 100ms
    var _enabled = true;
    var _stats = {
        operations: 0,
        batches: 0,
        skipped: 0
    };
    
    /**
     * Add an operation to the batch queue
     * @param {string} operation - Operation type
     * @param {Array} args - Operation arguments
     * @param {Object} context - Context for operation
     * @param {Function} callback - Original function to call
     */
    function batchOperation(operation, args, context, callback) {
        if (!_enabled) {
            // If batching is disabled, execute immediately
            return callback.apply(context, args);
        }
        
        _stats.operations++;
        
        // Create a unique key for this operation
        var key = operation;
        if (args[0]) key += '_' + args[0]; // Add layer ID
        if (args[1]) key += '_' + args[1]; // Add object ID
        
        // Store only the latest operation for each key
        _batchQueue[key] = {
            operation: operation,
            args: args,
            context: context,
            callback: callback,
            timestamp: Date.now()
        };
        
        // Schedule batch processing
        if (!_batchTimer) {
            _batchTimer = setTimeout(processBatch, _batchInterval);
        }
    }
    
    /**
     * Process all queued operations
     * @private
     */
    function processBatch() {
        _batchTimer = null;
        _stats.batches++;
        
        var operations = Object.keys(_batchQueue);
        if (operations.length === 0) return;
        
        // Process each unique operation
        operations.forEach(function(key) {
            var op = _batchQueue[key];
            
            // Skip very recent operations that might get superseded
            if (Date.now() - op.timestamp < 50) {
                _stats.skipped++;
                return;
            }
            
            try {
                op.callback.apply(op.context, op.args);
            } catch (e) {
                console.error('LayerBatch: Error processing operation', key, e);
            }
        });
        
        // Clear the queue
        _batchQueue = {};
    }
    
    /**
     * Wrap layer operations for batching
     */
    function wrapLayerOperations() {
        if (!window.interface) return;
        
        // Wrap removeObjectFromLayer
        if (window.interface.removeObjectFromLayer && !window.interface._removeObjectBatchWrapped) {
            var original = window.interface.removeObjectFromLayer;
            
            window.interface.removeObjectFromLayer = function(layerId, objId) {
                // Only batch temporary layers
                if (layerId && layerId.includes('tmpLayer')) {
                    batchOperation('removeObject', [layerId, objId], this, original);
                } else {
                    // Non-temporary layers execute immediately
                    original.apply(this, arguments);
                }
            };
            
            window.interface._removeObjectBatchWrapped = true;
            console.log('LayerBatch: removeObjectFromLayer wrapped');
        }
        
        // Wrap addFeature if needed
        if (window.interface.addFeature && !window.interface._addFeatureBatchWrapped) {
            var originalAdd = window.interface.addFeature;
            
            window.interface.addFeature = function(layerId, objectId, geojson, style) {
                // Only batch temporary layers
                if (layerId && layerId.includes('tmpLayer')) {
                    batchOperation('addFeature', arguments, this, originalAdd);
                } else {
                    originalAdd.apply(this, arguments);
                }
            };
            
            window.interface._addFeatureBatchWrapped = true;
            console.log('LayerBatch: addFeature wrapped');
        }
    }
    
    // Public API
    return {
        /**
         * Initialize layer batching
         */
        initialize: function() {
            console.log('Layer Batch initialized');
            
            // Get batch interval from config if available
            if (App.Core.PerformanceConfig) {
                _batchInterval = App.Core.PerformanceConfig.get('layers.batchInterval') || 100;
            }
            
            // Wrap operations
            wrapLayerOperations();
            
            // Retry wrapping after delays
            setTimeout(wrapLayerOperations, 1000);
            setTimeout(wrapLayerOperations, 3000);
            
            // Listen for config changes
            if (App.Core.Events) {
                App.Core.Events.on('performance:config:changed', function(data) {
                    if (data.path === 'layers.batchInterval') {
                        _batchInterval = data.newValue;
                    }
                });
            }
        },
        
        /**
         * Enable or disable batching
         * @param {boolean} enabled
         */
        setEnabled: function(enabled) {
            _enabled = enabled;
            if (!enabled && _batchTimer) {
                // Process any pending operations
                clearTimeout(_batchTimer);
                processBatch();
            }
            console.log('Layer batching', enabled ? 'enabled' : 'disabled');
        },
        
        /**
         * Get batching statistics
         * @returns {Object} Statistics
         */
        getStats: function() {
            return {
                operations: _stats.operations,
                batches: _stats.batches,
                skipped: _stats.skipped,
                opsPerBatch: _stats.batches > 0 ? 
                    (_stats.operations / _stats.batches).toFixed(1) : 0,
                enabled: _enabled,
                interval: _batchInterval + 'ms'
            };
        },
        
        /**
         * Reset statistics
         */
        resetStats: function() {
            _stats = {
                operations: 0,
                batches: 0,
                skipped: 0
            };
        },
        
        /**
         * Force process any pending operations
         */
        flush: function() {
            if (_batchTimer) {
                clearTimeout(_batchTimer);
                _batchTimer = null;
            }
            processBatch();
        }
    };
})();

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        App.Core.LayerBatch.initialize();
    });
} else {
    App.Core.LayerBatch.initialize();
}

console.log('app.core.layer-batch.js loaded - Layer operation batching ready');