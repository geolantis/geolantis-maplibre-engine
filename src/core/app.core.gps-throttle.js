/**
 * GPS Update Throttling and Debouncing
 * @namespace App.Core.GPSThrottle
 * 
 * This module provides aggressive throttling and debouncing for GPS updates
 * to prevent performance degradation from excessive position updates.
 */
App.Core = App.Core || {};
App.Core.GPSThrottle = (function() {
    // Private variables
    var _pendingUpdate = null;
    var _updateTimer = null;
    var _lastUpdate = 0;
    var _updateInterval = 1000; // Default 1Hz
    var _stats = {
        received: 0,
        processed: 0,
        throttled: 0,
        queued: 0
    };
    
    /**
     * Process a GPS update with throttling and debouncing
     * @param {Function} callback - Function to call with position
     * @param {Array|Object} position - Position data
     * @param {Object} context - Context for callback
     */
    function throttleUpdate(callback, position, context) {
        _stats.received++;
        
        var now = Date.now();
        var timeSinceLastUpdate = now - _lastUpdate;
        
        // Get current interval from config
        if (App.Core.PerformanceConfig) {
            _updateInterval = App.Core.PerformanceConfig.get('gps.updateInterval') || 1000;
        }
        
        // If we just processed an update, queue this one
        if (timeSinceLastUpdate < _updateInterval) {
            _stats.queued++;
            
            // Store the pending update
            _pendingUpdate = {
                callback: callback,
                position: position,
                context: context
            };
            
            // Clear any existing timer
            if (_updateTimer) {
                clearTimeout(_updateTimer);
            }
            
            // Schedule the update for when the interval has passed
            var delay = _updateInterval - timeSinceLastUpdate;
            _updateTimer = setTimeout(function() {
                processPendingUpdate();
            }, delay);
            
            _stats.throttled++;
            return false; // Update was throttled
        }
        
        // Process immediately
        _lastUpdate = now;
        _stats.processed++;
        
        // Clear any pending update since we're processing now
        _pendingUpdate = null;
        if (_updateTimer) {
            clearTimeout(_updateTimer);
            _updateTimer = null;
        }
        
        // Execute the callback
        callback.apply(context, [position]);
        return true; // Update was processed
    }
    
    /**
     * Process any pending update
     * @private
     */
    function processPendingUpdate() {
        if (_pendingUpdate) {
            var update = _pendingUpdate;
            _pendingUpdate = null;
            _updateTimer = null;
            _lastUpdate = Date.now();
            _stats.processed++;
            
            // Execute the pending update
            update.callback.apply(update.context, [update.position]);
        }
    }
    
    /**
     * Create a throttled version of a function
     * @param {Function} fn - Function to throttle
     * @param {Object} context - Context for function
     * @returns {Function} Throttled function
     */
    function createThrottledFunction(fn, context) {
        return function(position) {
            return throttleUpdate(fn, position, context || this);
        };
    }
    
    /**
     * Wrap the bridge interface GPS functions
     */
    function wrapBridgeInterface() {
        if (!window.interface) {
            console.warn('GPSThrottle: window.interface not ready');
            return;
        }
        
        // Check if already wrapped
        if (window.interface._gpsThrottleWrapped) {
            return;
        }
        
        // Wrap setPosition
        if (window.interface.setPosition && !window.interface._originalSetPositionPreThrottle) {
            window.interface._originalSetPositionPreThrottle = window.interface.setPosition;
            window.interface.setPosition = createThrottledFunction(
                window.interface._originalSetPositionPreThrottle,
                window.interface
            );
        }
        
        // Wrap updateGPSLocation
        if (window.interface.updateGPSLocation && !window.interface._originalUpdateGPSLocationPreThrottle) {
            window.interface._originalUpdateGPSLocationPreThrottle = window.interface.updateGPSLocation;
            window.interface.updateGPSLocation = function(lng, lat) {
                // Convert to position array for throttling
                return throttleUpdate(
                    window.interface._originalUpdateGPSLocationPreThrottle,
                    [lng, lat],
                    window.interface
                );
            };
        }
        
        window.interface._gpsThrottleWrapped = true;
        console.log('GPSThrottle: Bridge interface wrapped for aggressive throttling');
    }
    
    // Public API
    return {
        /**
         * Initialize GPS throttling
         */
        initialize: function() {
            console.log('GPS Throttle initialized');
            
            // Try to wrap immediately
            wrapBridgeInterface();
            
            // Also try after a delay in case interface isn't ready
            setTimeout(wrapBridgeInterface, 1000);
            setTimeout(wrapBridgeInterface, 3000);
            
            // Listen for app initialization
            if (App.Core.Events) {
                App.Core.Events.on('app:initialized', wrapBridgeInterface);
            }
        },
        
        /**
         * Get throttling statistics
         * @returns {Object} Statistics
         */
        getStats: function() {
            var ratio = _stats.received > 0 ? 
                (_stats.processed / _stats.received * 100).toFixed(1) : 0;
            
            return {
                received: _stats.received,
                processed: _stats.processed,
                throttled: _stats.throttled,
                queued: _stats.queued,
                processRatio: ratio + '%',
                currentInterval: _updateInterval + 'ms'
            };
        },
        
        /**
         * Reset statistics
         */
        resetStats: function() {
            _stats = {
                received: 0,
                processed: 0,
                throttled: 0,
                queued: 0
            };
        },
        
        /**
         * Force process any pending update
         */
        flush: function() {
            processPendingUpdate();
        },
        
        /**
         * Create a throttled function
         * @param {Function} fn - Function to throttle
         * @param {Object} context - Optional context
         * @returns {Function} Throttled function
         */
        throttle: createThrottledFunction
    };
})();

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        App.Core.GPSThrottle.initialize();
    });
} else {
    App.Core.GPSThrottle.initialize();
}

console.log('app.core.gps-throttle.js loaded - Aggressive GPS throttling ready');