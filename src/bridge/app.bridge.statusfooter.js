/**
 * App.Bridge.StatusFooter
 * 
 * Bridge module for StatusFooter to integrate with legacy interface
 * 
 * @module App.Bridge.StatusFooter
 * @requires App.UI.StatusFooter
 */
App.Bridge = App.Bridge || {};
App.Bridge.StatusFooter = (function() {
    'use strict';
    
    /**
     * Update StatusFooter from legacy interface data
     * @param {Object} data - Legacy format GNSS data
     */
    function updateFromInterface(data) {
        if (!App.UI.StatusFooter || !App.UI.StatusFooter.isInitialized()) {
            return;
        }
        
        var gnssData = {};
        
        // Map legacy data format to new format
        if (data.accuracy !== undefined) {
            gnssData.accuracy = data.accuracy;
            gnssData.accuracyUnit = data.accuracyUnit || 'cm';
        }
        
        if (data.fixType !== undefined) {
            gnssData.gnssStatus = _mapFixType(data.fixType);
        }
        
        if (data.latitude !== undefined) {
            gnssData.latitude = data.latitude;
        }
        
        if (data.longitude !== undefined) {
            gnssData.longitude = data.longitude;
        }
        
        if (data.altitude !== undefined) {
            gnssData.altitude = data.altitude;
        }
        
        if (data.satelliteCount !== undefined) {
            gnssData.satellites = data.satelliteCount;
        }
        
        if (data.batteryLevel !== undefined) {
            gnssData.battery = data.batteryLevel;
        }
        
        if (data.deviceName !== undefined) {
            gnssData.deviceName = data.deviceName;
        }
        
        // Update StatusFooter
        App.UI.StatusFooter.updateGNSSData(gnssData);
    }
    
    /**
     * Map numeric fix type to status string
     * @private
     */
    function _mapFixType(fixType) {
        switch(fixType) {
            case 0: return 'NO FIX';
            case 1: return 'SINGLE';
            case 2: return 'FLOAT';
            case 4: return 'FIX';
            case 5: return 'FIX';
            default: return 'UNKNOWN';
        }
    }
    
    /**
     * Update device information
     * @param {Object} device - Device information
     */
    function updateDevice(device) {
        if (!App.UI.StatusFooter || !App.UI.StatusFooter.isInitialized()) {
            return;
        }
        
        App.UI.StatusFooter.updateDeviceInfo({
            name: device.name || device.deviceName,
            battery: device.battery || device.batteryLevel
        });
    }
    
    /**
     * Configure StatusFooter visibility
     * @param {boolean} visible - Whether to show the footer
     */
    function setVisible(visible) {
        if (!App.UI.StatusFooter || !App.UI.StatusFooter.isInitialized()) {
            return;
        }
        
        if (visible) {
            App.UI.StatusFooter.show();
        } else {
            App.UI.StatusFooter.hide();
        }
    }
    
    /**
     * Apply a preset configuration
     * @param {string} preset - Preset name
     */
    function applyPreset(preset) {
        if (!App.UI.StatusFooter || !App.UI.StatusFooter.isInitialized()) {
            return;
        }
        
        App.UI.StatusFooter.applyPreset(preset);
    }
    
    // Register with legacy interface if it exists
    if (window.interface) {
        // Add methods to interface
        window.interface.updateStatusFooter = updateFromInterface;
        window.interface.setStatusFooterVisible = setVisible;
        window.interface.setStatusFooterPreset = applyPreset;
        
        // Register handler for GNSS updates
        if (window.interface.registerHandler) {
            window.interface.registerHandler('gnssUpdate', updateFromInterface);
            window.interface.registerHandler('deviceUpdate', updateDevice);
        }
        
        console.log('[StatusFooter Bridge] Registered with legacy interface');
    }
    
    // Listen for App events
    if (App.Core && App.Core.Events) {
        // Bridge legacy GNSS updates
        App.Core.Events.on('interface:gnss:update', updateFromInterface);
        App.Core.Events.on('interface:device:update', updateDevice);
    }
    
    // Public API
    return {
        updateFromInterface: updateFromInterface,
        updateDevice: updateDevice,
        setVisible: setVisible,
        applyPreset: applyPreset,
        mapFixType: _mapFixType
    };
})();

console.log('App.Bridge.StatusFooter module loaded');