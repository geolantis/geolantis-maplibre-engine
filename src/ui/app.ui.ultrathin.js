// Ultra-thin Footer Integration for App
App.UI.UltraThin = (function() {
    'use strict';
    
    let _footer = null;
    let _bridge = null;
    let _initialized = false;
    
    function initialize(dependencies) {
        if (_initialized) return;
        
        console.log('[App.UI.UltraThin] Initializing ultra-thin footer');
        
        // Create footer element
        _footer = document.createElement('status-footer-ultrathin');
        document.body.appendChild(_footer);
        
        // Get bridge
        _bridge = window.ultraThinFooterBridge;
        _bridge.initialize(_footer);
        
        // Apply default configuration based on device
        const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
        
        if (isMobile) {
            _bridge.applyPreset('ultra-minimal');
        } else {
            _bridge.applyPreset('compact-dark');
        }
        
        // Listen for app events
        setupEventListeners();
        
        _initialized = true;
    }
    
    function setupEventListeners() {
        // GNSS updates
        App.Core.Events.on('gnss:accuracy', function(data) {
            if (_bridge) {
                _bridge.updateAccuracy(data.value, data.unit || 'cm');
            }
        });
        
        App.Core.Events.on('gnss:status', function(status) {
            if (_bridge) {
                _bridge.updateGnssStatus(status);
            }
        });
        
        App.Core.Events.on('gnss:satellites', function(count) {
            if (_bridge) {
                _bridge.updateSatellites(count);
            }
        });
        
        // Position updates
        App.Core.Events.on('position:update', function(data) {
            if (_bridge && data.lat && data.lon) {
                _bridge.updatePosition(data.lat, data.lon, data.alt || 0);
            }
        });
        
        // Device updates
        App.Core.Events.on('device:battery', function(level) {
            if (_bridge) {
                _bridge.updateBattery(level);
            }
        });
        
        App.Core.Events.on('device:name', function(name) {
            if (_bridge) {
                _bridge.updateDeviceName(name);
            }
        });
        
        // Map theme changes
        App.Core.Events.on('map:theme', function(theme) {
            if (_bridge) {
                // Map themes to footer themes
                switch(theme) {
                    case 'satellite':
                        _bridge.setTheme('minimal');
                        break;
                    case 'dark':
                        _bridge.setTheme('transparent');
                        break;
                    case 'terrain':
                        _bridge.setTheme('glass');
                        break;
                    default:
                        _bridge.setTheme('default');
                }
            }
        });
    }
    
    // Public API
    return {
        initialize: initialize,
        
        // Direct bridge access
        getBridge: function() { return _bridge; },
        
        // Quick methods
        setPreset: function(preset) {
            if (_bridge) _bridge.applyPreset(preset);
        },
        
        configure: function(config) {
            if (_bridge) _bridge.configure(config);
        },
        
        hide: function() {
            if (_bridge) _bridge.hide();
        },
        
        show: function() {
            if (_bridge) _bridge.show();
        },
        
        toggle: function() {
            if (_bridge) _bridge.toggleExpanded();
        }
    };
})();