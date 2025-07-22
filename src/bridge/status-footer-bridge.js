// Enhanced Status Footer Bridge with Mobile Configuration Support
(function() {
    'use strict';
    
    console.log('[StatusFooterBridge v5] Initializing enhanced bridge with RTK status parsing for all FIX_QUALITY types');
    
    // Bridge class for Status Footer communication
    class StatusFooterBridge {
        constructor() {
            this.footer = null;
            this.config = null;
            this.listeners = new Map();
            this.dataCache = {
                statusBar: {},
                coordinates: {},
                gnssInfo: {},
                deviceInfo: {}
            };
            this.isExpanded = false;
        }
        
        // Initialize the bridge with the footer element
        initialize(footerElement) {
            this.footer = footerElement || 
                        document.querySelector('status-footer-ultrathin') || 
                        document.querySelector('status-footer-mobile') || 
                        document.querySelector('status-footer');
            
            if (!this.footer) {
                console.warn('[StatusFooterBridge] No status footer element found');
                return false;
            }
            
            console.log('[StatusFooterBridge] Initialized with footer:', this.footer.tagName);
            
            // Listen for footer events
            this.footer.addEventListener('toggle', (e) => {
                this.isExpanded = e.detail.expanded;
                this.emit('toggle', e.detail);
            });
            
            // Also listen for the custom event from App.UI.StatusFooter
            this.footer.addEventListener('statusfooter:toggle', (e) => {
                this.isExpanded = e.detail.expanded;
                this.emit('toggle', e.detail);
            });
            
            return true;
        }
        
        // Configuration method with full options
        configure(config) {
            if (!this.footer) {
                console.error('[StatusFooterBridge] Footer not initialized');
                return;
            }
            
            // Store config for later use
            this.config = config;
            
            // Apply configuration to footer
            if (this.footer.configure) {
                this.footer.configure(config);
            } else {
                console.warn('[StatusFooterBridge] Footer does not support configuration');
            }
            
            // Emit configuration change event
            this.emit('configure', config);
        }
        
        // Quick theme change
        setTheme(theme) {
            this.configure({
                style: { theme: theme }
            });
        }
        
        // Toggle specific flags
        setFlags(flags) {
            this.configure({ flags: flags });
        }
        
        // Show/hide locator status
        showLocatorStatus(show) {
            this.setFlags({ showLocatorStatus: show });
        }
        
        // Show/hide GNSS status
        showGnssStatus(show) {
            this.setFlags({ showGnssStatus: show });
        }
        
        // Enable/disable auto-hide
        setAutoHide(enable) {
            this.setFlags({ autoHideOnMapInteraction: enable });
        }
        
        // Set layout mode
        setLayoutMode(mode) {
            this.configure({
                layout: { mode: mode }
            });
        }
        
        // Update status bar data
        updateStatusBar(data) {
            if (!this.footer) return;
            
            // Merge with cache
            Object.assign(this.dataCache.statusBar, data);
            
            // Update individual components for status-footer-ultrathin
            if (data.accuracy !== undefined && this.footer.updateAccuracy) {
                this.footer.updateAccuracy(data.accuracy, data.accuracyClass);
            }
            if (data.satellites !== undefined && this.footer.updateSatellites) {
                this.footer.updateSatellites(data.satellites);
            }
            if (data.deviceName !== undefined && this.footer.updateDeviceName) {
                this.footer.updateDeviceName(data.deviceName);
            }
            
            // Handle RTK status (Java sends rtkStatus, not gnssStatus)
            if (data.rtkStatus !== undefined && this.footer.updateGnssStatus) {
                // Parse RTK status to extract the fix type
                var rtkStatus = data.rtkStatus;
                var fixType = 'NO FIX';
                var statusClass = 'nofix';
                
                // Parse formats like "RTK (2.1s)", "FLOAT_RTK (1.2s)", "Single", etc.
                // Based on NTRIP.FIX_QUALITY enum values
                if (rtkStatus.includes('RTK') && !rtkStatus.includes('FLOAT')) {
                    fixType = 'RTK FIX';
                    statusClass = 'fix';
                } else if (rtkStatus.includes('FLOAT_RTK') || rtkStatus.includes('FLOAT RTK')) {
                    fixType = 'RTK FLOAT';
                    statusClass = 'float';
                } else if (rtkStatus.includes('DGPS')) {
                    fixType = 'DGPS';
                    statusClass = 'dgps';
                } else if (rtkStatus.includes('GPS')) {
                    fixType = 'GPS';
                    statusClass = 'single';
                } else if (rtkStatus.includes('PPS')) {
                    fixType = 'PPS';
                    statusClass = 'pps';
                } else if (rtkStatus.includes('ESTIMATED')) {
                    fixType = 'ESTIMATED';
                    statusClass = 'estimated';
                } else if (rtkStatus.includes('MANUAL')) {
                    fixType = 'MANUAL';
                    statusClass = 'manual';
                } else if (rtkStatus.includes('SIMULATION')) {
                    fixType = 'SIMULATION';
                    statusClass = 'simulation';
                } else if (rtkStatus.includes('Single')) {
                    fixType = 'SINGLE';
                    statusClass = 'single';
                } else if (rtkStatus.includes('INVALID')) {
                    fixType = 'NO FIX';
                    statusClass = 'nofix';
                }
                
                // Extract diff age if present
                var diffAgeMatch = rtkStatus.match(/\(([0-9.-]+)s\)/);
                if (diffAgeMatch) {
                    fixType = fixType + ' (' + diffAgeMatch[1] + 's)';
                }
                
                this.footer.updateGnssStatus(fixType, statusClass);
            }
            
            // Also support direct gnssStatus if provided
            if (data.gnssStatus !== undefined && this.footer.updateGnssStatus) {
                this.footer.updateGnssStatus(data.gnssStatus);
            }
            
            this.emit('update:statusBar', data);
        }
        
        // Update coordinates
        updateCoordinates(data) {
            if (!this.footer) return;
            
            // Always merge with cache to maintain latest data
            Object.assign(this.dataCache.coordinates, data);
            
            // Only update DOM if we have the updateCoordinates method
            if (this.footer.updateCoordinates) {
                // Parse coordinates
                var lat = data.latitude || this.dataCache.coordinates.latitude;
                var lon = data.longitude || this.dataCache.coordinates.longitude;
                var alt = data.altitude || this.dataCache.coordinates.altitude;
                
                // Remove degree symbols and parse if needed
                if (typeof lat === 'string') {
                    lat = parseFloat(lat.replace('°', ''));
                }
                if (typeof lon === 'string') {
                    lon = parseFloat(lon.replace('°', ''));
                }
                if (typeof alt === 'string') {
                    alt = parseFloat(alt.split(' ')[0]);
                }
                
                // Update the coordinates - the component will handle whether to update DOM
                this.footer.updateCoordinates(
                    lat,
                    lon,
                    alt,
                    {
                        x: data.x || this.dataCache.coordinates.x,
                        y: data.y || this.dataCache.coordinates.y,
                        z: data.z || this.dataCache.coordinates.z
                    }
                );
            }
            
            this.emit('update:coordinates', data);
        }
        
        // Update GNSS information
        updateGnssInfo(data) {
            if (!this.footer) return;
            
            // Always merge with cache to maintain latest data
            Object.assign(this.dataCache.gnssInfo, data);
            
            // Parse VDOP/PDOP if it comes as a combined string
            var hdop = data.hdop || this.dataCache.gnssInfo.hdop;
            var pdop = data.pdop || this.dataCache.gnssInfo.pdop;
            
            if (data.vdopPdop && !data.hdop && !data.pdop) {
                // Parse format "1.6 / 2.4"
                var parts = data.vdopPdop.split('/').map(function(s) { return s.trim(); });
                if (parts.length === 2) {
                    hdop = parseFloat(parts[0]) || 1.0;
                    pdop = parseFloat(parts[1]) || 1.0;
                }
            }
            
            // Parse speed if it comes with units
            var speed = data.speed || this.dataCache.gnssInfo.speed;
            if (typeof speed === 'string' && speed.includes('m/s')) {
                speed = parseFloat(speed) || 0;
            }
            
            // Update GNSS quality - the component will handle whether to update DOM
            if (this.footer.updateGNSSQuality) {
                this.footer.updateGNSSQuality({
                    hdop: hdop,
                    pdop: pdop,
                    speed: speed,
                    ntrip: data.ntripStatus || this.dataCache.gnssInfo.ntripStatus,
                    rtcm: data.rtcmStatus || this.dataCache.gnssInfo.rtcmStatus,
                    wifi: data.wifiStatus || this.dataCache.gnssInfo.wifiStatus,
                    tilt: data.tilt || this.dataCache.gnssInfo.tilt
                });
            }
            
            // Update satellite count if available (always update as it's in status bar)
            if (data.satelliteCount !== undefined && this.footer.updateSatellites) {
                // Parse satellite count if it's a string
                var satCount = data.satelliteCount;
                if (typeof satCount === 'string') {
                    satCount = parseInt(satCount) || 0;
                }
                console.log('[StatusFooterBridge] Updating satellite count from', data.satelliteCount, 'to', satCount);
                this.footer.updateSatellites(satCount);
            }
            
            this.emit('update:gnssInfo', data);
        }
        
        // Update device information with enhanced locator data
        updateDeviceInfo(data) {
            if (!this.footer) return;
            
            // Always merge with cache to maintain latest data
            Object.assign(this.dataCache.deviceInfo, data);
            
            // Update device info - the component will handle whether to update DOM
            if (this.footer.updateDeviceInfo) {
                this.footer.updateDeviceInfo(data);
            }
            
            // Battery is shown in status bar, so always update
            if (data.batteryPercentage !== undefined && this.footer.updateBattery) {
                this.footer.updateBattery(data.batteryPercentage);
            }
            
            // Update tilt status if available
            if (data.tiltInfo !== undefined && this.footer.updateTiltStatus) {
                // Extract calibration status and angle from tiltInfo string
                // Formats: 
                // - "calibrated ✓" / "uncalibrated ✗" (PPM devices)
                // - "OK (0.2°)" / "NOT OK (1.5°)" (Stonex devices)
                // - "N/A" (no tilt sensor)
                
                var tiltInfo = data.tiltInfo;
                var calibrated = false;
                var angle = 0;
                
                if (tiltInfo === 'N/A' || tiltInfo.includes('✗')) {
                    // No tilt sensor or tilt is off
                    calibrated = false;
                    angle = 0;
                } else if (tiltInfo.includes('✓')) {
                    // PPM device with tilt active
                    calibrated = true;
                    angle = 0; // PPM doesn't provide angle in this format
                } else {
                    // Try to parse angle from formats like "OK (0.2°)" or "NOT OK (1.5°)"
                    var angleMatch = tiltInfo.match(/\(([\d.]+)°\)/);
                    if (angleMatch) {
                        angle = parseFloat(angleMatch[1]) || 0;
                    }
                    
                    // Check calibration status
                    calibrated = tiltInfo.includes('OK') && !tiltInfo.includes('NOT OK');
                }
                
                this.footer.updateTiltStatus(calibrated, angle);
            }
            
            this.emit('update:deviceInfo', data);
        }
        
        // Enhanced locator status update
        updateLocatorStatus(locatorData) {
            this.updateDeviceInfo({
                locator: {
                    type: locatorData.type || 'Unknown',
                    model: locatorData.model,
                    signal: locatorData.signal || 'Unknown',
                    accuracy: locatorData.accuracy,
                    lastUpdate: locatorData.lastUpdate || new Date().toISOString()
                }
            });
        }
        
        // Batch update all sections
        updateAllStatus(data) {
            if (!this.footer) return;
            
            // Track timing for performance monitoring
            const startTime = performance.now();
            
            // Update cache
            if (data.statusBar) Object.assign(this.dataCache.statusBar, data.statusBar);
            if (data.coordinates) Object.assign(this.dataCache.coordinates, data.coordinates);
            if (data.gnssInfo) Object.assign(this.dataCache.gnssInfo, data.gnssInfo);
            if (data.deviceInfo) Object.assign(this.dataCache.deviceInfo, data.deviceInfo);
            
            // Update each section using individual methods
            if (data.statusBar) {
                this.updateStatusBar(data.statusBar);
            }
            if (data.coordinates) {
                this.updateCoordinates(data.coordinates);
            }
            if (data.gnssInfo) {
                this.updateGnssInfo(data.gnssInfo);
            }
            if (data.deviceInfo) {
                this.updateDeviceInfo(data.deviceInfo);
            }
            
            this.emit('update:all', data);
            
            // Log execution time if it's slow
            const executionTime = performance.now() - startTime;
            if (executionTime > 16) { // More than one frame (16ms)
                console.warn(`[StatusFooterBridge] updateAllStatus took ${executionTime.toFixed(2)}ms - performance warning!`);
            }
        }
        
        // Toggle expanded sections
        toggleExpandedSections(show) {
            if (!this.footer) return;
            
            if (typeof show === 'boolean') {
                const expanded = this.footer.shadowRoot.querySelector("#expanded-sections");
                if (expanded) {
                    if (show && expanded.classList.contains("hidden")) {
                        this.footer.toggleExpanded();
                    } else if (!show && !expanded.classList.contains("hidden")) {
                        this.footer.toggleExpanded();
                    }
                }
            } else {
                this.footer.toggleExpanded();
            }
        }
        
        // Get current configuration
        getConfiguration() {
            return this.config;
        }
        
        // Get current data
        getCurrentData() {
            return JSON.parse(JSON.stringify(this.dataCache));
        }
        
        // Event handling
        on(event, callback) {
            if (!this.listeners.has(event)) {
                this.listeners.set(event, []);
            }
            this.listeners.get(event).push(callback);
        }
        
        off(event, callback) {
            if (!this.listeners.has(event)) return;
            
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
        
        emit(event, data) {
            if (!this.listeners.has(event)) return;
            
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    console.error('[StatusFooterBridge] Error in event listener:', e);
                }
            });
        }
        
        // Demo mode control
        startDemo() {
            if (this.footer && this.footer.startDemoMode) {
                this.footer.startDemoMode();
            }
        }
        
        stopDemo() {
            if (this.footer && this.footer.demoIntervalId) {
                clearInterval(this.footer.demoIntervalId);
                this.footer.demoIntervalId = null;
            }
        }
        
        // Utility methods for common updates
        updateAccuracy(value, unit = 'cm') {
            const accuracy = parseFloat(value);
            let accuracyClass = 'high';
            
            if (unit === 'cm') {
                if (accuracy > 3) accuracyClass = 'low';
                else if (accuracy > 1.5) accuracyClass = 'medium';
            } else if (unit === 'm') {
                if (accuracy > 0.03) accuracyClass = 'low';
                else if (accuracy > 0.015) accuracyClass = 'medium';
            }
            
            this.updateStatusBar({
                accuracy: `±${value}${unit}`,
                accuracyClass: accuracyClass
            });
        }
        
        updateRTKStatus(status, duration) {
            this.updateStatusBar({
                rtkStatus: duration ? `${status} (${duration})` : status
            });
        }
        
        updateBatteryLevel(percentage) {
            this.updateDeviceInfo({
                batteryPercentage: percentage
            });
        }
        
        updateConnectionType(type) {
            this.updateDeviceInfo({
                connectionType: type
            });
        }
        
        // Helper for coordinate updates with automatic formatting
        updatePosition(lat, lon, alt, x, y, z) {
            const coordData = {};
            
            if (lat !== undefined) coordData.latitude = lat;
            if (lon !== undefined) coordData.longitude = lon;
            if (alt !== undefined) coordData.altitude = typeof alt === 'number' ? `${alt.toFixed(2)} m` : alt;
            if (x !== undefined) coordData.x = typeof x === 'number' ? x.toFixed(2) : x;
            if (y !== undefined) coordData.y = typeof y === 'number' ? y.toFixed(2) : y;
            if (z !== undefined) coordData.z = typeof z === 'number' ? `${z.toFixed(2)} m` : z;
            
            this.updateCoordinates(coordData);
        }
        
        // Helper for GNSS quality updates
        updateGNSSQuality(data) {
            const gnssData = {};
            
            if (data.hrms !== undefined || data.vrms !== undefined) {
                gnssData.vrmsHrms = `${data.hrms || '?'}[m] / ${data.vrms || '?'}[m]`;
            }
            
            if (data.hdop !== undefined || data.pdop !== undefined) {
                gnssData.vdopPdop = `${data.hdop || '?'} / ${data.pdop || '?'}`;
            }
            
            if (data.satellites !== undefined) {
                gnssData.satelliteCount = data.satellites;
            }
            
            if (data.speed !== undefined) {
                gnssData.speed = `${data.speed.toFixed(1)} m/s`;
            }
            
            if (data.ntripStatus !== undefined) {
                gnssData.ntripStatus = data.ntripStatus;
            }
            
            if (data.rtcmStatus !== undefined) {
                gnssData.rtcmStatus = data.rtcmStatus;
            }
            
            this.updateGnssInfo(gnssData);
        }
    }
    
    // Create and expose the bridge instance
    const bridge = new StatusFooterBridge();
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                bridge.initialize();
            }, 100);
        });
    } else {
        setTimeout(() => {
            bridge.initialize();
        }, 100);
    }
    
    // Expose to global scope for backward compatibility
    window.statusFooterBridge = bridge;
    
    // Also expose constructor for multiple instances if needed
    window.StatusFooterBridge = StatusFooterBridge;
    
    console.log('[StatusFooterBridge] Bridge exposed as window.statusFooterBridge');
    
})();