/**
 * Android Log Control Utility
 * @namespace App.Utils.AndroidLog
 * 
 * This module provides JavaScript control over Android logging levels
 * to help diagnose and fix performance issues caused by excessive logging.
 */
App.Utils = App.Utils || {};
App.Utils.AndroidLog = (function() {
    // Private variables
    var _logPatterns = {
        glrm: /GLRM/,
        rtcm: /RTCM/,
        ble: /BLE|Bluetooth/,
        ntrip: /NTRIP|ntrip/,
        gps: /GPS|GNSS|GLRMProcessor/,
        all: /.*/
    };
    
    /**
     * Send command to Android to control logging
     * @param {string} command - Log control command
     * @param {string} category - Log category to control
     * @private
     */
    function sendLogCommand(command, category) {
        if (window.reha && typeof window.reha.sendCallback === 'function') {
            window.reha.sendCallback('logControl', JSON.stringify({
                command: command,
                category: category,
                timestamp: Date.now()
            }));
            return true;
        }
        return false;
    }
    
    /**
     * Execute adb logcat filter command
     * @param {string} filter - Logcat filter expression
     * @private
     */
    function setLogcatFilter(filter) {
        if (window.interface && typeof window.interface.executeShellCommand === 'function') {
            // This would require a special bridge method
            window.interface.executeShellCommand(`setprop log.tag.${filter}`);
            return true;
        }
        return false;
    }
    
    // Public API
    return {
        /**
         * Disable specific log categories
         * @param {string|Array} categories - Categories to disable
         */
        disable: function(categories) {
            if (!Array.isArray(categories)) {
                categories = [categories];
            }
            
            var results = [];
            categories.forEach(function(category) {
                var success = sendLogCommand('disable', category);
                results.push({
                    category: category,
                    success: success
                });
            });
            
            return results;
        },
        
        /**
         * Enable specific log categories
         * @param {string|Array} categories - Categories to enable
         */
        enable: function(categories) {
            if (!Array.isArray(categories)) {
                categories = [categories];
            }
            
            var results = [];
            categories.forEach(function(category) {
                var success = sendLogCommand('enable', category);
                results.push({
                    category: category,
                    success: success
                });
            });
            
            return results;
        },
        
        /**
         * Set log level for categories
         * @param {string} level - Log level (VERBOSE, DEBUG, INFO, WARN, ERROR)
         * @param {string|Array} categories - Categories to set
         */
        setLevel: function(level, categories) {
            if (!Array.isArray(categories)) {
                categories = [categories];
            }
            
            var validLevels = ['VERBOSE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'SILENT'];
            if (!validLevels.includes(level.toUpperCase())) {
                console.error('Invalid log level:', level);
                return false;
            }
            
            var results = [];
            categories.forEach(function(category) {
                var success = sendLogCommand('setLevel', {
                    category: category,
                    level: level.toUpperCase()
                });
                results.push({
                    category: category,
                    level: level,
                    success: success
                });
            });
            
            return results;
        },
        
        /**
         * Disable all verbose GPS/GLRM logging
         */
        disableGPSLogging: function() {
            return this.disable(['GLRM', 'GLRM-RTCM', 'GLRM-Manager', 
                                'GLRM-Processor', 'GLRMProcessor', 
                                'BLEMultipleManager', 'NTRIP']);
        },
        
        /**
         * Set minimal logging for performance
         */
        setPerformanceMode: function() {
            // Disable verbose categories
            this.disable(['GLRM', 'GLRM-RTCM', 'GLRM-Manager', 
                         'GLRM-Processor', 'GLRMProcessor', 
                         'BLEMultipleManager']);
            
            // Set others to WARN or ERROR only
            this.setLevel('WARN', ['NTRIP', 'GPS', 'GNSS']);
            
            return 'Performance logging mode set - verbose logs disabled';
        },
        
        /**
         * Restore normal logging
         */
        setNormalMode: function() {
            this.enable(['GLRM', 'GLRM-RTCM', 'GLRM-Manager', 
                        'GLRM-Processor', 'GLRMProcessor', 
                        'BLEMultipleManager', 'NTRIP']);
            
            return 'Normal logging mode restored';
        },
        
        /**
         * Get estimated log frequency
         * @param {number} sampleDuration - Sample duration in ms
         * @returns {Promise} Log frequency analysis
         */
        analyzeLogFrequency: function(sampleDuration) {
            sampleDuration = sampleDuration || 1000;
            
            return new Promise(function(resolve) {
                var startTime = Date.now();
                var logCounts = {};
                var originalLog = console.log;
                var totalLogs = 0;
                
                // Temporarily intercept console.log
                console.log = function() {
                    totalLogs++;
                    var message = arguments[0] || '';
                    
                    // Categorize log
                    Object.keys(_logPatterns).forEach(function(category) {
                        if (_logPatterns[category].test(message)) {
                            logCounts[category] = (logCounts[category] || 0) + 1;
                        }
                    });
                    
                    // Call original log
                    originalLog.apply(console, arguments);
                };
                
                // Restore and analyze after duration
                setTimeout(function() {
                    console.log = originalLog;
                    var duration = Date.now() - startTime;
                    
                    var analysis = {
                        duration: duration,
                        totalLogs: totalLogs,
                        logsPerSecond: (totalLogs / duration * 1000).toFixed(1),
                        byCategory: {}
                    };
                    
                    Object.keys(logCounts).forEach(function(category) {
                        analysis.byCategory[category] = {
                            count: logCounts[category],
                            perSecond: (logCounts[category] / duration * 1000).toFixed(1)
                        };
                    });
                    
                    resolve(analysis);
                }, sampleDuration);
            });
        }
    };
})();

console.log('app.utils.android-log.js loaded - Android log control ready');