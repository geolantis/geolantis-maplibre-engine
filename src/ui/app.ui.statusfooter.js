 Currently/**
 * App.UI.StatusFooter
 * 
 * Manages the ultra-thin status footer for displaying GNSS and device information.
 * Integrates with the map-engine architecture using the App namespace pattern.
 * 
 * @module App.UI.StatusFooter
 * @requires status-footer-ultrathin.js
 * @requires status-footer-ultrathin-bridge.js
 */
App.UI.StatusFooter = (function() {
    'use strict';
    
    var _bridge = null;
    var _footer = null;
    var _initialized = false;
    var _config = {
        autoUpdate: true,
        updateInterval: 1000,
        defaultPreset: 'ultra-minimal',
        autoHideOnInteraction: false
    };
    
    /**
     * Initialize the status footer
     * @param {Object} options - Configuration options
     * @returns {boolean} Success status
     */
    function initialize(options) {
        if (_initialized) {
            console.warn('[StatusFooter] Already initialized');
            return true;
        }
        
        // Merge options
        if (options) {
            Object.assign(_config, options);
        }
        
        // Create footer element
        _footer = document.createElement('status-footer-ultrathin');
        document.body.appendChild(_footer);
        
        // Initialize bridge
        if (window.ultraThinFooterBridge) {
            _bridge = window.ultraThinFooterBridge;
            _bridge.initialize(_footer);
            
            // Apply default preset
            if (_config.defaultPreset) {
                _bridge.applyPreset(_config.defaultPreset);
            }
            
            // Ensure expand functionality is enabled
            _bridge.configure({
                behavior: {
                    expandOnTap: true,
                    swipeToExpand: true
                },
                layout: {
                    statusBar: {
                        expandButton: {
                            visible: true,
                            position: 'right'
                        }
                    }
                }
            });
            
            // Apply initial configuration
            if (_config.initialConfig) {
                configure(_config.initialConfig);
            }
            
            // Listen for events
            _setupEventListeners();
            
            _initialized = true;
            
            // Trigger initialized event
            App.Core.Events.trigger('statusfooter:initialized');
            
            console.log('[StatusFooter] Initialized successfully');
            return true;
        }
        
        console.error('[StatusFooter] Bridge not found');
        return false;
    }
    
    /**
     * Setup event listeners
     * @private
     */
    function _setupEventListeners() {
        // Listen for footer toggle
        _footer.addEventListener('toggle', function(e) {
            App.Core.Events.trigger('statusfooter:toggle', {
                expanded: e.detail.expanded
            });
            
            // Add/remove class to body for CSS positioning
            if (e.detail.expanded) {
                document.body.classList.add('footer-expanded');
            } else {
                document.body.classList.remove('footer-expanded');
            }
            
            // Log expansion state for debugging
            console.log('[StatusFooter] Footer', e.detail.expanded ? 'expanded' : 'collapsed');
        });
        
        // Listen for GNSS updates from other modules
        App.Core.Events.on('gnss:update', function(data) {
            updateGNSSData(data);
        });
        
        // Listen for device updates
        App.Core.Events.on('device:update', function(data) {
            updateDeviceInfo(data);
        });
        
        // Listen for position updates
        App.Core.Events.on('position:update', function(data) {
            if (data.latitude && data.longitude) {
                _bridge.updatePosition(data.latitude, data.longitude, data.altitude || 0);
            }
        });
        
        // Auto-hide on map interaction
        if (_config.autoHideOnInteraction) {
            App.Core.Events.on('map:interaction:start', function() {
                hide();
            });
            
            App.Core.Events.on('map:interaction:end', function() {
                show();
            });
        }
        
        // IMPORTANT: Expose the updateAllStatus method on the bridge for Java calls
        if (_bridge) {
            _bridge.updateAllStatus = function(data) {
                updateAllFromBridge(data);
            };
            
            // Also ensure the global bridge has the same reference
            if (window.statusFooterBridge !== _bridge) {
                console.log('[StatusFooter] Syncing global bridge reference');
                // Copy methods to ensure Java calls work
                window.statusFooterBridge.updateAllStatus = function(data) {
                    updateAllFromBridge(data);
                };
            }
        }
    }
    
    /**
     * Configure the status footer
     * @param {Object} options - Configuration options
     */
    function configure(options) {
        if (!_bridge) {
            console.warn('[StatusFooter] Not initialized');
            return;
        }
        
        // Handle preset shortcut
        if (options.preset) {
            _bridge.applyPreset(options.preset);
            delete options.preset;
        }
        
        // Handle transparency shortcut
        if (options.transparency !== undefined) {
            var theme = options.theme || _bridge.getConfiguration()?.style?.theme || 'default';
            var bgColor = theme === 'default' || theme === 'glass' 
                ? `rgba(255, 255, 255, ${options.transparency})`
                : `rgba(0, 0, 0, ${options.transparency})`;
            
            _bridge.setTransparency(bgColor, options.blur || 'blur(20px)');
            delete options.transparency;
            delete options.blur;
        }
        
        // Handle element visibility shortcut
        if (options.elements) {
            var elementConfig = {};
            for (var key in options.elements) {
                if (typeof options.elements[key] === 'boolean') {
                    elementConfig[key] = { visible: options.elements[key] };
                } else {
                    elementConfig[key] = options.elements[key];
                }
            }
            _bridge.configureElements(elementConfig);
            delete options.elements;
        }
        
        // Apply remaining configuration
        if (Object.keys(options).length > 0) {
            _bridge.configure(options);
        }
        
        App.Core.Events.trigger('statusfooter:configured', options);
    }
    
    /**
     * Update GNSS data
     * @param {Object} data - GNSS data object
     */
    function updateGNSSData(data) {
        if (!_bridge) return;
        
        // Create a copy to avoid modifying original
        var updateData = Object.assign({}, data);
        
        // Format accuracy to 2 decimal places
        if (updateData.accuracy !== undefined && !isNaN(updateData.accuracy)) {
            updateData.accuracy = parseFloat(updateData.accuracy);
        }
        
        _bridge.updateAll(updateData);
        
        // Trigger event
        App.Core.Events.trigger('statusfooter:updated', updateData);
    }
    
    /**
     * Update all status footer data from Java bridge
     * This method is called by the Java UIBridge
     * @param {Object} allData - Complete status data object
     */
    function updateAllFromBridge(allData) {
        if (!_bridge) return;
        
        // The Java bridge sends data in this structure:
        // {
        //   statusBar: { deviceName, tiltStatus, fixTime, rtkStatus, accuracy, accuracyClass },
        //   coordinates: { longitude, latitude, altitude, x, y, z },
        //   gnssInfo: { vrmsHrms, vdopPdop, ntripStatus, rtcmStatus, satelliteCount, speed },
        //   deviceInfo: { tiltInfo, batteryPercentage }
        // }
        
        // Always update status bar data as it's always visible
        if (allData.statusBar) {
            var statusData = {
                deviceName: allData.statusBar.deviceName,
                accuracy: allData.statusBar.accuracy,
                satellites: allData.statusBar.satelliteCount,
                gnssStatus: allData.statusBar.rtkStatus
            };
            _bridge.updateStatusBar(statusData);
        }
        
        // Update other sections - the bridge and component will handle DOM updates based on expansion state
        if (allData.coordinates) {
            _bridge.updateCoordinates(allData.coordinates);
        }
        
        if (allData.gnssInfo) {
            // Map GNSS info to expected format
            var gnssData = {
                hdop: allData.gnssInfo.vdopPdop ? allData.gnssInfo.vdopPdop.split(' / ')[0] : undefined,
                pdop: allData.gnssInfo.vdopPdop ? allData.gnssInfo.vdopPdop.split(' / ')[1] : undefined,
                speed: allData.gnssInfo.speed,
                ntripStatus: allData.gnssInfo.ntripStatus,
                rtcmStatus: allData.gnssInfo.rtcmStatus,
                satellites: allData.gnssInfo.satelliteCount
            };
            _bridge.updateGnssInfo(gnssData);
        }
        
        if (allData.deviceInfo) {
            _bridge.updateDeviceInfo(allData.deviceInfo);
        }
        
        // Trigger event
        App.Core.Events.trigger('statusfooter:bridgeupdate', allData);
    }
    
    /**
     * Update device information
     * @param {Object} data - Device data object
     */
    function updateDeviceInfo(data) {
        if (!_bridge) return;
        
        if (data.name) {
            _bridge.updateDeviceName(data.name);
        }
        
        if (data.battery !== undefined) {
            _bridge.updateBattery(data.battery);
        }
        
        App.Core.Events.trigger('statusfooter:device:updated', data);
    }
    
    /**
     * Show the footer
     */
    function show() {
        if (_bridge) {
            _bridge.show();
            App.Core.Events.trigger('statusfooter:shown');
        }
    }
    
    /**
     * Hide the footer
     */
    function hide() {
        if (_bridge) {
            _bridge.hide();
            App.Core.Events.trigger('statusfooter:hidden');
        }
    }
    
    /**
     * Toggle expanded state
     */
    function toggle() {
        if (_bridge) {
            _bridge.toggleExpanded();
        }
    }
    
    /**
     * Apply a preset configuration
     * @param {string} preset - Preset name
     */
    function applyPreset(preset) {
        if (_bridge) {
            _bridge.applyPreset(preset);
            App.Core.Events.trigger('statusfooter:preset:applied', { preset: preset });
        }
    }
    
    /**
     * Set the theme
     * @param {string} theme - Theme name
     */
    function setTheme(theme) {
        if (_bridge) {
            _bridge.setTheme(theme);
            App.Core.Events.trigger('statusfooter:theme:changed', { theme: theme });
        }
    }
    
    /**
     * Get current configuration
     * @returns {Object|null} Current configuration
     */
    function getConfiguration() {
        return _bridge ? _bridge.getConfiguration() : null;
    }
    
    /**
     * Destroy the footer and cleanup
     */
    function destroy() {
        if (_footer) {
            _footer.remove();
            _footer = null;
        }
        _bridge = null;
        _initialized = false;
        App.Core.Events.trigger('statusfooter:destroyed');
    }
    
    /**
     * Check if initialized
     * @returns {boolean} Initialization status
     */
    function isInitialized() {
        return _initialized;
    }
    
    /**
     * Check if footer is expanded
     * @returns {boolean} Expansion status
     */
    function isExpanded() {
        return _footer && _footer.isExpanded;
    }
    
    // Public API
    return {
        initialize: initialize,
        configure: configure,
        updateGNSSData: updateGNSSData,
        updateDeviceInfo: updateDeviceInfo,
        updateAllFromBridge: updateAllFromBridge,
        show: show,
        hide: hide,
        toggle: toggle,
        applyPreset: applyPreset,
        setTheme: setTheme,
        getConfiguration: getConfiguration,
        destroy: destroy,
        isInitialized: isInitialized,
        isExpanded: isExpanded,
        
        // Quick access methods
        setAccuracy: function(value, unit) {
            if (_bridge) _bridge.updateAccuracy(value, unit || 'cm');
        },
        setGNSSStatus: function(status) {
            if (_bridge) _bridge.updateGnssStatus(status);
        },
        setPosition: function(lat, lon, alt) {
            if (_bridge) _bridge.updatePosition(lat, lon, alt || 0);
        },
        setSatellites: function(count) {
            if (_bridge) _bridge.updateSatellites(count);
        },
        setBattery: function(percentage) {
            if (_bridge) _bridge.updateBattery(percentage);
        },
        setDeviceName: function(name) {
            if (_bridge) _bridge.updateDeviceName(name);
        },
        
        // Debug methods
        getFooter: function() {
            return _footer;
        },
        getBridge: function() {
            return _bridge;
        },
        expand: function() {
            if (_bridge) _bridge.expand();
        },
        collapse: function() {
            if (_bridge) _bridge.collapse();
        },
        
        // Test method to simulate Java updates
        testWithSampleData: function() {
            var sampleData = {
                statusBar: {
                    deviceName: 'GNSS Receiver Pro',
                    tiltStatus: 'calibrated',
                    fixTime: '15:45:32',
                    rtkStatus: 'Fixed (5s)',
                    accuracy: '±0.012 m',
                    accuracyClass: 'high'
                },
                coordinates: {
                    longitude: '14.2229296°',
                    latitude: '46.6263287°',
                    altitude: '524.80 m',
                    x: '551234.23',
                    y: '4179456.78',
                    z: '18.30'
                },
                gnssInfo: {
                    vrmsHrms: '0.008 [m] / 0.012 [m]',
                    vdopPdop: '1.1 / 1.3',
                    ntripStatus: 'Connected',
                    rtcmStatus: 'Receiving',
                    satelliteCount: '15/22',
                    speed: '0.2 m/s'
                },
                deviceInfo: {
                    tiltInfo: 'Calibrated (0.2°)',
                    batteryPercentage: 95
                }
            };
            
            updateAllFromBridge(sampleData);
            console.log('[StatusFooter] Test data applied');
        }
    };
})();