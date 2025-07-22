// Ultra-thin Status Footer Bridge
(function() {
    'use strict';
    
    console.log('[UltraThinBridge] Initializing bridge');
    
    class UltraThinFooterBridge {
        constructor() {
            this.footer = null;
            this.initialized = false;
        }
        
        // Initialize with footer element
        initialize(footerElement) {
            this.footer = footerElement || document.querySelector('status-footer-ultrathin');
            
            if (!this.footer) {
                console.warn('[UltraThinBridge] No footer element found');
                return false;
            }
            
            this.initialized = true;
            console.log('[UltraThinBridge] Initialized successfully');
            return true;
        }
        
        // Full configuration
        configure(config) {
            if (!this.footer) return;
            this.footer.configure(config);
        }
        
        // Quick presets
        applyPreset(preset) {
            const presets = {
                'ultra-minimal': {
                    style: {
                        theme: 'minimal',
                        height: 'ultra',
                        backgroundColor: 'transparent'
                    },
                    layout: {
                        statusBar: {
                            accuracy: { visible: true, position: 'right' },
                            gnssStatus: { visible: true, position: 'right', format: 'compact' },
                            deviceName: { visible: false },
                            time: { visible: false },
                            satellites: { visible: true, position: 'right', showIcon: false },
                            battery: { visible: false },
                            expandButton: { visible: true, position: 'right', size: 'small' }
                        }
                    }
                },
                'compact-dark': {
                    style: {
                        theme: 'transparent',
                        height: 'compact',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(20px)'
                    },
                    layout: {
                        statusBar: {
                            accuracy: { visible: true, position: 'right' },
                            gnssStatus: { visible: true, position: 'right' },
                            deviceName: { visible: true, position: 'left', maxWidth: '100px' },
                            time: { visible: true, position: 'center' },
                            satellites: { visible: true, position: 'right' },
                            battery: { visible: false },
                            expandButton: { visible: true, position: 'right' }
                        }
                    }
                },
                'glass': {
                    style: {
                        theme: 'glass',
                        height: 'compact',
                        position: 'floating'
                    }
                },
                'surveyor': {
                    style: {
                        theme: 'default',
                        height: 'normal',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)'
                    },
                    layout: {
                        statusBar: {
                            accuracy: { visible: true, position: 'right', colorCoded: true },
                            gnssStatus: { visible: true, position: 'right', format: 'full' },
                            deviceName: { visible: true, position: 'left' },
                            time: { visible: true, position: 'center' },
                            satellites: { visible: true, position: 'right', showIcon: true },
                            battery: { visible: true, position: 'right', showPercentage: true },
                            expandButton: { visible: true, position: 'right' }
                        }
                    }
                }
            };
            
            if (presets[preset]) {
                this.configure(presets[preset]);
            }
        }
        
        // Style shortcuts
        setTheme(theme) {
            this.configure({ style: { theme } });
        }
        
        setHeight(height) {
            this.configure({ style: { height } });
        }
        
        setPosition(position) {
            this.configure({ style: { position } });
        }
        
        setTransparency(backgroundColor, backdropFilter) {
            this.configure({ 
                style: { 
                    backgroundColor,
                    backdropFilter 
                } 
            });
        }
        
        // Element visibility
        showElement(element, position = 'right') {
            this.configure({
                layout: {
                    statusBar: {
                        [element]: { visible: true, position }
                    }
                }
            });
        }
        
        hideElement(element) {
            // Don't allow hiding required elements
            if (element === 'accuracy' || element === 'gnssStatus') {
                console.warn(`[UltraThinBridge] Cannot hide required element: ${element}`);
                return;
            }
            
            this.configure({
                layout: {
                    statusBar: {
                        [element]: { visible: false }
                    }
                }
            });
        }
        
        // Configure element positioning
        setElementPosition(element, position) {
            this.configure({
                layout: {
                    statusBar: {
                        [element]: { position }
                    }
                }
            });
        }
        
        // Batch element configuration
        configureElements(elements) {
            const config = { layout: { statusBar: {} } };
            
            for (const [element, settings] of Object.entries(elements)) {
                // Ensure required elements remain visible
                if ((element === 'accuracy' || element === 'gnssStatus') && settings.visible === false) {
                    settings.visible = true;
                }
                config.layout.statusBar[element] = settings;
            }
            
            this.configure(config);
        }
        
        // Data updates
        updateAccuracy(value, unit = 'cm') {
            if (!this.footer) return;
            
            const accuracy = parseFloat(value);
            let accuracyClass = 'high';
            
            if (unit === 'cm') {
                if (accuracy > 5) accuracyClass = 'low';
                else if (accuracy > 2) accuracyClass = 'medium';
            } else if (unit === 'm') {
                if (accuracy > 0.05) accuracyClass = 'low';
                else if (accuracy > 0.02) accuracyClass = 'medium';
            }
            
            // Format to 2 decimal places
            const formattedValue = accuracy.toFixed(2);
            this.footer.updateAccuracy(`±${formattedValue}${unit}`, accuracyClass);
        }
        
        updateGnssStatus(status) {
            if (!this.footer) return;
            
            let statusClass = 'nofix';
            if (status === 'FIX' || status === 'RTK FIX') {
                statusClass = 'fix';
            } else if (status === 'FLOAT' || status === 'RTK FLOAT') {
                statusClass = 'float';
            }
            
            this.footer.updateGnssStatus(status, statusClass);
        }
        
        updatePosition(lat, lon, alt, localCoords = null) {
            if (!this.footer) return;
            this.footer.updateCoordinates(lat, lon, alt, localCoords);
        }
        
        updateSatellites(count) {
            if (!this.footer) return;
            this.footer.updateSatellites(count);
        }
        
        updateBattery(percentage) {
            if (!this.footer) return;
            this.footer.updateBattery(percentage);
        }
        
        updateDeviceName(name) {
            if (!this.footer) return;
            this.footer.updateDeviceName(name);
        }
        
        // Batch update
        updateAll(data) {
            if (!this.footer) return;
            
            if (data.accuracy !== undefined) {
                this.updateAccuracy(data.accuracy, data.accuracyUnit || 'cm');
            }
            if (data.gnssStatus !== undefined) {
                this.updateGnssStatus(data.gnssStatus);
            }
            if (data.latitude !== undefined && data.longitude !== undefined) {
                const localCoords = {};
                if (data.x !== undefined) localCoords.x = data.x;
                if (data.y !== undefined) localCoords.y = data.y;
                if (data.z !== undefined) localCoords.z = data.z;
                
                this.updatePosition(data.latitude, data.longitude, data.altitude || 0, 
                    Object.keys(localCoords).length > 0 ? localCoords : null);
            }
            if (data.satellites !== undefined) {
                this.updateSatellites(data.satellites);
            }
            if (data.battery !== undefined) {
                this.updateBattery(data.battery);
            }
            if (data.deviceName !== undefined) {
                this.updateDeviceName(data.deviceName);
            }
            if (data.quality !== undefined) {
                this.updateGNSSQuality(data.quality);
            }
            if (data.deviceInfo !== undefined) {
                this.updateDeviceInfo(data.deviceInfo);
            }
        }
        
        // Update GNSS quality data
        updateGNSSQuality(data) {
            if (!this.footer || !this.footer.updateGNSSQuality) return;
            this.footer.updateGNSSQuality(data);
        }
        
        // Update device info
        updateDeviceInfo(data) {
            if (!this.footer || !this.footer.updateDeviceInfo) return;
            this.footer.updateDeviceInfo(data);
        }
        
        // Control methods
        toggleExpanded() {
            if (!this.footer) return;
            console.log('[Bridge] Toggling expanded state');
            this.footer.toggleExpanded();
        }
        
        // Force expand/collapse
        expand() {
            if (!this.footer || this.footer.isExpanded) return;
            this.footer.toggleExpanded();
        }
        
        collapse() {
            if (!this.footer || !this.footer.isExpanded) return;
            this.footer.toggleExpanded();
        }
        
        show() {
            if (!this.footer) return;
            this.footer.style.display = 'block';
        }
        
        hide() {
            if (!this.footer) return;
            this.footer.style.display = 'none';
        }
        
        // Get current configuration
        getConfiguration() {
            if (!this.footer) return null;
            return this.footer.config;
        }
    }
    
    // Create and expose bridge
    const bridge = new UltraThinFooterBridge();
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => bridge.initialize(), 100);
        });
    } else {
        setTimeout(() => bridge.initialize(), 100);
    }
    
    // Expose to global scope
    window.ultraThinFooterBridge = bridge;
    
    console.log('[UltraThinBridge] Bridge available at window.ultraThinFooterBridge');
})();