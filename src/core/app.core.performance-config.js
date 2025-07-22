/**
 * Performance configuration for GPS and map updates
 * @namespace App.Core.PerformanceConfig
 * 
 * This module provides centralized configuration for performance-related
 * throttling and optimization settings.
 */
App.Core = App.Core || {};
App.Core.PerformanceConfig = (function() {
    // Default configuration values
    var _config = {
        // GPS/GNSS update throttling
        gps: {
            updateInterval: 1000,        // 1Hz = 1000ms (once per second)
            positionUpdateInterval: 1000, // Position marker update rate
            enabledStateInterval: 1000,   // Position enabled state update rate
            minDistanceChange: 0.5        // Minimum distance change in meters to trigger update
        },
        
        // Map layer operations throttling
        layers: {
            removeObjectInterval: 100,    // Throttle for removeObjectFromLayer on temp layers
            addFeatureInterval: 50,       // Throttle for addFeature operations
            styleUpdateInterval: 100      // Throttle for style updates
        },
        
        // Map interaction throttling
        interaction: {
            moveEndInterval: 500,         // Throttle for moveend events
            zoomEndInterval: 300,         // Throttle for zoomend events
            rotationUpdateRate: 300       // Map rotation update rate
        },
        
        // Rendering optimization
        rendering: {
            targetFPS: 60,               // Target frames per second
            lowFPSThreshold: 30,         // FPS below this triggers optimization
            tileLoadTimeout: 5000,       // Timeout for tile loading
            maxConcurrentTileLoads: 6    // Maximum concurrent tile loads
        },
        
        // Debug settings
        debug: {
            logThrottledUpdates: false,  // Log when updates are throttled
            showPerformanceMetrics: true, // Show performance metrics
            warnOnSlowOperations: true   // Warn on slow operations
        }
    };
    
    /**
     * Validate configuration value
     * @param {string} path - Configuration path (e.g., 'gps.updateInterval')
     * @param {*} value - Value to validate
     * @returns {boolean} True if valid
     * @private
     */
    function validateConfig(path, value) {
        // All intervals should be positive numbers
        if (path.includes('Interval') || path.includes('Rate')) {
            return typeof value === 'number' && value > 0;
        }
        
        // FPS values should be between 1 and 120
        if (path.includes('FPS')) {
            return typeof value === 'number' && value >= 1 && value <= 120;
        }
        
        // Boolean values
        if (path.startsWith('debug.')) {
            return typeof value === 'boolean';
        }
        
        return true;
    }
    
    /**
     * Get nested configuration value
     * @param {string} path - Configuration path (e.g., 'gps.updateInterval')
     * @returns {*} Configuration value
     * @private
     */
    function getConfigValue(path) {
        var parts = path.split('.');
        var value = _config;
        
        for (var i = 0; i < parts.length; i++) {
            if (value && typeof value === 'object' && parts[i] in value) {
                value = value[parts[i]];
            } else {
                return undefined;
            }
        }
        
        return value;
    }
    
    /**
     * Set nested configuration value
     * @param {string} path - Configuration path (e.g., 'gps.updateInterval')
     * @param {*} value - Value to set
     * @private
     */
    function setConfigValue(path, value) {
        var parts = path.split('.');
        var obj = _config;
        
        for (var i = 0; i < parts.length - 1; i++) {
            if (!obj[parts[i]]) {
                obj[parts[i]] = {};
            }
            obj = obj[parts[i]];
        }
        
        obj[parts[parts.length - 1]] = value;
    }
    
    // Public API
    return {
        /**
         * Get configuration value
         * @param {string} path - Configuration path (e.g., 'gps.updateInterval')
         * @returns {*} Configuration value
         */
        get: function(path) {
            if (!path) {
                return JSON.parse(JSON.stringify(_config)); // Return copy of entire config
            }
            return getConfigValue(path);
        },
        
        /**
         * Set configuration value
         * @param {string|Object} pathOrConfig - Configuration path or object with multiple values
         * @param {*} [value] - Value to set (if path is string)
         */
        set: function(pathOrConfig, value) {
            if (typeof pathOrConfig === 'object') {
                // Set multiple values
                Object.keys(pathOrConfig).forEach(function(key) {
                    this.set(key, pathOrConfig[key]);
                }, this);
                return;
            }
            
            if (!validateConfig(pathOrConfig, value)) {
                console.warn('Invalid configuration value:', pathOrConfig, value);
                return;
            }
            
            var oldValue = getConfigValue(pathOrConfig);
            setConfigValue(pathOrConfig, value);
            
            console.log(`Performance config updated: ${pathOrConfig} = ${value} (was ${oldValue})`);
            
            // Trigger event for config change
            if (App.Core.Events) {
                App.Core.Events.trigger('performance:config:changed', {
                    path: pathOrConfig,
                    oldValue: oldValue,
                    newValue: value
                });
            }
        },
        
        /**
         * Reset configuration to defaults
         * @param {string} [path] - Optional path to reset specific section
         */
        reset: function(path) {
            if (!path) {
                // Reset entire config
                _config = this.getDefaults();
                console.log('Performance configuration reset to defaults');
            } else {
                // Reset specific section
                var defaults = this.getDefaults();
                var defaultValue = getConfigValue.call({ _config: defaults }, path);
                if (defaultValue !== undefined) {
                    this.set(path, defaultValue);
                }
            }
        },
        
        /**
         * Get default configuration
         * @returns {Object} Default configuration
         */
        getDefaults: function() {
            return {
                gps: {
                    updateInterval: 1000,
                    positionUpdateInterval: 1000,
                    enabledStateInterval: 1000,
                    minDistanceChange: 0.5
                },
                layers: {
                    removeObjectInterval: 100,
                    addFeatureInterval: 50,
                    styleUpdateInterval: 100
                },
                interaction: {
                    moveEndInterval: 500,
                    zoomEndInterval: 300,
                    rotationUpdateRate: 300
                },
                rendering: {
                    targetFPS: 60,
                    lowFPSThreshold: 30,
                    tileLoadTimeout: 5000,
                    maxConcurrentTileLoads: 6
                },
                debug: {
                    logThrottledUpdates: false,
                    showPerformanceMetrics: true,
                    warnOnSlowOperations: true
                }
            };
        },
        
        /**
         * Apply performance preset
         * @param {string} preset - Preset name ('high', 'balanced', 'battery-saver')
         */
        applyPreset: function(preset) {
            switch (preset) {
                case 'high':
                    // High performance - minimal throttling
                    this.set({
                        'gps.updateInterval': 500,
                        'gps.positionUpdateInterval': 500,
                        'layers.removeObjectInterval': 50,
                        'interaction.moveEndInterval': 200,
                        'rendering.targetFPS': 60
                    });
                    break;
                    
                case 'balanced':
                    // Balanced - default settings
                    this.reset();
                    break;
                    
                case 'battery-saver':
                    // Battery saver - aggressive throttling
                    this.set({
                        'gps.updateInterval': 2000,
                        'gps.positionUpdateInterval': 2000,
                        'layers.removeObjectInterval': 200,
                        'interaction.moveEndInterval': 1000,
                        'rendering.targetFPS': 30
                    });
                    break;
                    
                default:
                    console.warn('Unknown performance preset:', preset);
            }
            
            console.log(`Applied performance preset: ${preset}`);
        },
        
        /**
         * Export configuration as JSON
         * @returns {string} JSON configuration
         */
        export: function() {
            return JSON.stringify(_config, null, 2);
        },
        
        /**
         * Import configuration from JSON
         * @param {string} json - JSON configuration
         */
        import: function(json) {
            try {
                var imported = JSON.parse(json);
                // Validate and apply each setting
                Object.keys(imported).forEach(function(section) {
                    if (typeof imported[section] === 'object') {
                        Object.keys(imported[section]).forEach(function(key) {
                            var path = section + '.' + key;
                            this.set(path, imported[section][key]);
                        }, this);
                    }
                }, this);
                console.log('Performance configuration imported successfully');
            } catch (e) {
                console.error('Failed to import performance configuration:', e);
            }
        }
    };
})();

console.log('app.core.performance-config.js loaded - Performance configuration ready');