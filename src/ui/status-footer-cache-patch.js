/**
 * Performance patch for status-footer-ultrathin
 * Caches DOM elements to avoid repeated querySelector calls
 */
(function() {
    'use strict';
    
    console.log('[StatusFooter Cache Patch] Initializing DOM element caching');
    
    // Wait for the component to be defined
    const patchComponent = () => {
        const StatusFooterUltrathin = customElements.get('status-footer-ultrathin');
        
        if (!StatusFooterUltrathin) {
            console.warn('[StatusFooter Cache Patch] Component not yet defined, retrying...');
            setTimeout(patchComponent, 100);
            return;
        }
        
        // Patch the prototype
        const originalConnectedCallback = StatusFooterUltrathin.prototype.connectedCallback;
        
        StatusFooterUltrathin.prototype.connectedCallback = function() {
            // Call original
            if (originalConnectedCallback) {
                originalConnectedCallback.call(this);
            }
            
            // Initialize DOM cache after shadow DOM is ready
            setTimeout(() => this.initializeDOMCache(), 0);
        };
        
        // Add DOM caching functionality
        StatusFooterUltrathin.prototype.initializeDOMCache = function() {
            console.log('[StatusFooter Cache] Initializing DOM element cache');
            
            // Cache all frequently accessed elements
            this._domCache = {
                // Status bar elements
                accuracy: this.shadowRoot.querySelector('.accuracy'),
                gnssStatus: this.shadowRoot.querySelector('.gnss-status'),
                deviceName: this.shadowRoot.querySelector('.device-name'),
                satellites: this.shadowRoot.querySelector('.satellites span'),
                batteryFill: this.shadowRoot.querySelector('.battery-fill'),
                batteryText: this.shadowRoot.querySelector('.battery span'),
                
                // Coordinate elements
                latitude: this.shadowRoot.querySelector('.latitude'),
                longitude: this.shadowRoot.querySelector('.longitude'),
                altitude: this.shadowRoot.querySelector('.altitude'),
                xCoord: this.shadowRoot.querySelector('.x-coord'),
                yCoord: this.shadowRoot.querySelector('.y-coord'),
                zCoord: this.shadowRoot.querySelector('.z-coord'),
                
                // GNSS quality elements
                hdopPdop: this.shadowRoot.querySelector('.hdop-pdop'),
                speed: this.shadowRoot.querySelector('.speed'),
                ntripStatus: this.shadowRoot.querySelector('.ntrip-status'),
                rtcmStatus: this.shadowRoot.querySelector('.rtcm-status'),
                wifiStatus: this.shadowRoot.querySelector('.wifi-status'),
                
                // Main containers
                statusBar: this.shadowRoot.querySelector('.status-bar'),
                expandedSections: this.shadowRoot.querySelector('.expanded-sections'),
                footer: this.shadowRoot.querySelector('.status-footer')
            };
            
            console.log('[StatusFooter Cache] Cached', Object.keys(this._domCache).length, 'DOM elements');
        };
        
        // Override update methods to use cache
        const originalUpdateAccuracy = StatusFooterUltrathin.prototype.updateAccuracy;
        StatusFooterUltrathin.prototype.updateAccuracy = function(value, className) {
            if (!this._domCache || !this._domCache.accuracy) {
                // Fallback to original
                return originalUpdateAccuracy.call(this, value, className);
            }
            
            const elem = this._domCache.accuracy;
            if (elem && elem.textContent !== value) {
                elem.textContent = value;
                elem.className = 'accuracy ' + (className || '');
            }
        };
        
        const originalUpdateGnssStatus = StatusFooterUltrathin.prototype.updateGnssStatus;
        StatusFooterUltrathin.prototype.updateGnssStatus = function(status) {
            if (!this._domCache || !this._domCache.gnssStatus) {
                return originalUpdateGnssStatus.call(this, status);
            }
            
            const elem = this._domCache.gnssStatus;
            if (elem) {
                elem.textContent = status;
                elem.className = 'gnss-status ' + (status === 'NO FIX' ? 'nofix' : '');
            }
        };
        
        const originalUpdateDeviceName = StatusFooterUltrathin.prototype.updateDeviceName;
        StatusFooterUltrathin.prototype.updateDeviceName = function(name) {
            if (!this._domCache || !this._domCache.deviceName) {
                return originalUpdateDeviceName.call(this, name);
            }
            
            const elem = this._domCache.deviceName;
            if (elem && elem.textContent !== name) {
                elem.textContent = name;
            }
        };
        
        const originalUpdateSatellites = StatusFooterUltrathin.prototype.updateSatellites;
        StatusFooterUltrathin.prototype.updateSatellites = function(count) {
            if (!this._domCache || !this._domCache.satellites) {
                return originalUpdateSatellites.call(this, count);
            }
            
            const elem = this._domCache.satellites;
            if (elem && elem.textContent !== count) {
                elem.textContent = count;
            }
        };
        
        // Patch updateCoordinates to use cache
        const originalUpdateCoordinates = StatusFooterUltrathin.prototype.updateCoordinates;
        StatusFooterUltrathin.prototype.updateCoordinates = function(lat, lon, alt, localCoords) {
            if (!this._domCache) {
                return originalUpdateCoordinates.call(this, lat, lon, alt, localCoords);
            }
            
            // Skip if not expanded and no significant change
            if (!this.isExpanded) {
                // Only update if there's a significant change
                if (this._lastCoords && 
                    Math.abs(this._lastCoords.lat - lat) < 0.000001 &&
                    Math.abs(this._lastCoords.lon - lon) < 0.000001) {
                    return;
                }
            }
            
            this._lastCoords = { lat, lon, alt };
            
            // Update coordinate display using cached elements
            if (this._domCache.latitude) {
                const latStr = lat.toFixed(8) + '°';
                if (this._domCache.latitude.textContent !== latStr) {
                    this._domCache.latitude.textContent = latStr;
                }
            }
            
            if (this._domCache.longitude) {
                const lonStr = lon.toFixed(8) + '°';
                if (this._domCache.longitude.textContent !== lonStr) {
                    this._domCache.longitude.textContent = lonStr;
                }
            }
            
            if (this._domCache.altitude && alt !== undefined) {
                const altStr = alt.toFixed(2) + ' m';
                if (this._domCache.altitude.textContent !== altStr) {
                    this._domCache.altitude.textContent = altStr;
                }
            }
            
            // Update local coordinates if provided
            if (localCoords && this.isExpanded) {
                if (this._domCache.xCoord && localCoords.x !== undefined) {
                    const xStr = parseFloat(localCoords.x).toFixed(3) + ' m';
                    if (this._domCache.xCoord.textContent !== xStr) {
                        this._domCache.xCoord.textContent = xStr;
                    }
                }
                
                if (this._domCache.yCoord && localCoords.y !== undefined) {
                    const yStr = parseFloat(localCoords.y).toFixed(3) + ' m';
                    if (this._domCache.yCoord.textContent !== yStr) {
                        this._domCache.yCoord.textContent = yStr;
                    }
                }
                
                if (this._domCache.zCoord && localCoords.z !== undefined) {
                    const zStr = parseFloat(localCoords.z).toFixed(3) + ' m';
                    if (this._domCache.zCoord.textContent !== zStr) {
                        this._domCache.zCoord.textContent = zStr;
                    }
                }
            }
        };
        
        // Patch updateGNSSQuality to use cache
        const originalUpdateGNSSQuality = StatusFooterUltrathin.prototype.updateGNSSQuality;
        StatusFooterUltrathin.prototype.updateGNSSQuality = function(data) {
            if (!this._domCache) {
                return originalUpdateGNSSQuality.call(this, data);
            }
            
            // Only update if expanded
            if (!this.isExpanded) return;
            
            if (data.hdop !== undefined && data.pdop !== undefined && this._domCache.hdopPdop) {
                const hdopPdopStr = `H: ${data.hdop} / P: ${data.pdop}`;
                if (this._domCache.hdopPdop.textContent !== hdopPdopStr) {
                    this._domCache.hdopPdop.textContent = hdopPdopStr;
                }
            }
            
            if (data.speed !== undefined && this._domCache.speed) {
                if (this._domCache.speed.textContent !== data.speed) {
                    this._domCache.speed.textContent = data.speed;
                }
            }
            
            if (data.ntrip !== undefined && this._domCache.ntripStatus) {
                if (this._domCache.ntripStatus.textContent !== data.ntrip) {
                    this._domCache.ntripStatus.textContent = data.ntrip;
                }
            }
            
            if (data.rtcm !== undefined && this._domCache.rtcmStatus) {
                if (this._domCache.rtcmStatus.textContent !== data.rtcm) {
                    this._domCache.rtcmStatus.textContent = data.rtcm;
                }
            }
            
            if (data.wifi !== undefined && this._domCache.wifiStatus) {
                if (this._domCache.wifiStatus.textContent !== data.wifi) {
                    this._domCache.wifiStatus.textContent = data.wifi;
                }
            }
        };
        
        console.log('[StatusFooter Cache Patch] Successfully patched status-footer-ultrathin');
    };
    
    // Start patching
    patchComponent();
})();