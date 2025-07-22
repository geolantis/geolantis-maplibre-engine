// Status Footer Component - Non-module version of the original
(function() {
    'use strict';
    
    console.log('[StatusFooterNonModule] Starting...');
    
    // First, let's make sure to remove the broken one
    const brokenFooter = document.querySelector('status-footer');
    if (brokenFooter) {
        brokenFooter.remove();
        console.log('[StatusFooterNonModule] Removed broken footer');
    }
    
    // Import the styles content directly
    const StatusFooterStyles = `
<style>
  :host {
    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    font-family: var(--sl-font-sans, "Roboto", sans-serif);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  .status-footer {
    width: 100%;
  }
  
  /* Status bar styling */
  .status-bar {
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: 18px;
  }
  
  .status-bar:hover {
    background: rgba(255, 255, 255, 0.4);
  }
  
  .status-bar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 8px;
  }
  
  .device-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .device-name {
    font-weight: 500;
    color: #333;
  }
  
  .tilt-status {
    margin-left: 8px;
    color: #666;
  }
  
  .status-indicators {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .time-indicator,
  .rtk-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  /* Accuracy indicator styling */
  .accuracy-indicator {
    font-weight: 600;
    margin-right: 8px;
  }
  
  .accuracy {
    background-color: #4caf50;
    color: black;
    padding: 2px 4px;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 600;
  }
  
  .accuracy.high {
    background-color: #4caf50;
  }
  
  .accuracy.medium {
    background-color: #ff9800;
  }
  
  .accuracy.low {
    background-color: #f44336;
  }
  
  /* Expanded sections */
  .expanded-sections {
    display: block;
    background: rgba(255, 255, 255, 0.95);
    padding: 10px;
    box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.2);
    font-size: 14px;
    transition: all 0.3s;
  }
  
  .expanded-sections.hidden {
    display: none;
  }
  
  sl-button#toggle-expand::part(base) {
    padding: 0;
    min-width: 24px;
    min-height: 24px;
    color: #666;
  }
  
  /* Sections layout */
  .sections-row {
    display: flex;
    gap: 20px;
    justify-content: space-between;
  }
  
  .section {
    flex: 1;
    min-width: 0;
  }
  
  .coordinates-section {
    flex: 1.2;
  }
  
  .gnss-section {
    flex: 1.5;
  }
  
  .device-section {
    flex: 0.8;
  }
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  /* Coordinate grid */
  .coordinates-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px 8px;
  }
  
  .coord-item {
    display: flex;
    flex-direction: column;
  }
  
  .coord-label {
    font-size: 11px;
    color: #666;
  }
  
  .coord-value {
    font-size: 13px;
    font-weight: 500;
    font-family: monospace;
  }
  
  /* GNSS styles */
  .gnss-grid {
    display: flex;
    gap: 24px;
  }
  
  .gnss-block {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  
  .gnss-item {
    display: flex;
    flex-direction: column;
  }
  
  .gnss-label {
    font-size: 11px;
    color: #666;
  }
  
  .gnss-value {
    font-size: 13px;
    font-weight: 500;
  }
  
  .gnss-icon-row {
    display: flex;
    gap: 16px;
    margin-top: 4px;
    align-items: center;
  }
  
  .gnss-icon-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .rtk-status {
    font-size: 13px;
    line-height: 1.4;
  }
  
  .status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 4px;
  }
  
  .status-dot.connected {
    background-color: #4caf50;
  }
  
  .status-dot.disconnected {
    background-color: #f44336;
  }
  
  /* Device details */
  .device-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .device-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .device-label {
    font-size: 11px;
    color: #666;
    margin-right: 4px;
  }
  
  .subsection-title {
    font-size: 13px;
    font-weight: 600;
    color: #333;
    margin: 4px 0;
  }
  
  .locator {
    flex-direction: column;
    align-items: flex-start;
  }
  
  /* Format switch button */
  .format-switch-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    margin: 0;
    color: #666;
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  
  .format-switch-btn:hover {
    opacity: 1;
  }
  
  /* Shoelace progress bar customization */
  sl-progress-bar.battery-progress {
    --height: 8px;
    --border-radius: 4px;
    --indicator-color: var(--sl-color-success-500);
    flex: 1;
    max-width: 80px;
  }
  
  /* Mobile responsive */
  @media (max-width: 640px) {
    .sections-row {
      flex-direction: column;
      gap: 8px;
    }
    
    .coordinates-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .expanded-sections {
      padding: 8px;
    }
  }
</style>
`;

    // Icons
    const icons = {
        clock: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
        signal: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></svg>`,
        satellite: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 7 9 3 5 7l4 4"/><path d="m17 11 4 4-4 4-4-4"/><path d="m8 12 4 4 6-6-4-4Z"/><path d="m16 8 3-3"/><path d="M9 21a6 6 0 0 0-6-6"/></svg>`,
        speedometer: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>`,
        compass: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`,
        battery: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"/><line x1="23" y1="13" x2="23" y2="11"/></svg>`,
        wifi: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
        "chevron-up": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
        "chevron-down": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
        expand: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4 9 9"/></svg>`
    };
    
    function svg(name) {
        return icons[name] || "";
    }
    
    // Define the component
    class StatusFooterOriginal extends HTMLElement {
        constructor() {
            super();
            console.log('[StatusFooterNonModule] Constructor called');
            this.attachShadow({ mode: "open" });
            
            // Component state
            this.realDataReceived = false;
            this.demoIntervalId = null;
            this.debugEnabled = false;
            this.currentCoordFormat = 0;
        }
        
        connectedCallback() {
            console.log('[StatusFooterNonModule] Connected callback');
            this.render();
            this.setupEventListeners();
            this.initializeComponent();
        }
        
        disconnectedCallback() {
            if (this.demoIntervalId) {
                clearInterval(this.demoIntervalId);
                this.demoIntervalId = null;
            }
        }
        
        render() {
            console.log('[StatusFooterNonModule] Rendering');
            this.shadowRoot.innerHTML = `
                ${StatusFooterStyles}
                <div class="status-footer">
                    <div class="status-bar">
                        <div class="status-bar-content">
                            <div class="device-info">
                                <span class="device-name">ppm10xx zero</span>
                                <span class="tilt-status">Ready</span>
                            </div>
                            <div class="status-indicators">
                                <div class="time-indicator">
                                    ${svg("clock")}
                                    <span class="fix-time">12:45:32</span>
                                </div>
                                <div class="rtk-indicator">
                                    ${svg("signal")}
                                    <span>FIX (2s)</span>
                                </div>
                                <div class="accuracy-indicator">
                                    <span class="accuracy high">±0.8cm</span>
                                </div>
                                <sl-button id="toggle-expand" variant="text" size="small" circle>
                                    <span id="chevron-icon">${svg("chevron-up")}</span>
                                </sl-button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Expanded sections (hidden by default) -->
                    <div id="expanded-sections" class="expanded-sections hidden">
                        <div class="sections-row">
                            <!-- Coordinates Section -->
                            <div class="section coordinates-section">
                                <h3 class="section-title">Coordinates
                                    <button id="coord-format-switch" class="format-switch-btn" title="Switch coordinate format">
                                        ${svg("expand")}
                                    </button>
                                </h3>
                                <div class="coordinates-grid">
                                    <div class="coord-item"><span class="coord-label">Longitude:</span><span class="coord-value longitude" data-raw="14.222948">14.222948°</span></div>
                                    <div class="coord-item"><span class="coord-label">Latitude:</span><span class="coord-value latitude" data-raw="46.626326">46.626326°</span></div>
                                    <div class="coord-item"><span class="coord-label">Altitude:</span><span class="coord-value altitude">524.56 m</span></div>
                                    <div class="coord-item"><span class="coord-label">X:</span><span class="coord-value x-coord">5682455.66</span></div>
                                    <div class="coord-item"><span class="coord-label">Y:</span><span class="coord-value y-coord">4538269.67</span></div>
                                    <div class="coord-item"><span class="coord-label">Z:</span><span class="coord-value z-coord">524.63 m</span></div>
                                </div>
                            </div>
                            
                            <!-- GNSS Quality Section -->
                            <div class="section gnss-section">
                                <h3 class="section-title">GNSS Quality</h3>
                                
                                <!-- two horizontal blocks -->
                                <div class="gnss-grid">
                                    <!-- Block 1 -->
                                    <div class="gnss-block">
                                        <div class="gnss-item">
                                            <span class="gnss-label">HRMS / VRMS:</span>
                                            <span class="gnss-value vrms-hrms">1.005[m] / 0.298[m]</span>
                                        </div>
                                        <div class="gnss-item">
                                            <span class="gnss-label">HDOP / PDOP:</span>
                                            <span class="gnss-value vdop-pdop">1.6 / 2.4</span>
                                        </div>
                                    </div>
                                    
                                    <!-- Block 2 -->
                                    <div class="gnss-block">
                                        <div class="gnss-item">
                                            <span class="gnss-label">RTK Status:</span>
                                            <span class="rtk-status">
                                                <span class="status-dot connected"></span>NTRIP: Connected<br>
                                                <span class="status-dot connected"></span>RTCM: Receiving
                                            </span>
                                        </div>
                                        
                                        <!-- icons share one row -->
                                        <div class="gnss-icon-row">
                                            <div class="gnss-icon-item">
                                                ${svg("satellite")}
                                                <span class="gnss-value satellite-count">17</span>
                                            </div>
                                            <div class="gnss-icon-item">
                                                ${svg("speedometer")}
                                                <span class="gnss-value speed-value">0.2 m/s</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Device Info Section -->
                            <div class="section device-section">
                                <h3 class="section-title">GNSS-Device</h3>
                                <div class="device-details">
                                    <div class="device-item">${svg("compass")}<span class="device-label">Tilt Status:</span><span class="tilt-info">No Sensor (0.4°)</span></div>
                                    <div class="device-item">${svg("battery")}<sl-progress-bar value="85" class="battery-progress"></sl-progress-bar><span class="battery-percentage">85%</span></div>
                                    <div class="device-item">${svg("wifi")}<span>WiFi</span></div>
                                    <div class="device-item locator"><h4 class="subsection-title">Locator</h4><span class="locator-type">WiFi</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        }
        
        async initializeComponent() {
            // Wait for Shoelace if needed
            if (customElements.get('sl-button')) {
                console.log('[StatusFooterNonModule] Shoelace already loaded');
            } else {
                try {
                    await customElements.whenDefined('sl-button');
                    console.log('[StatusFooterNonModule] Shoelace loaded');
                } catch (e) {
                    console.warn('[StatusFooterNonModule] Shoelace not available');
                }
            }
            
            // Start demo mode
            this.startDemoMode();
        }
        
        setupEventListeners() {
            const statusBar = this.shadowRoot.querySelector(".status-bar");
            const expandButton = this.shadowRoot.querySelector("#toggle-expand");
            const formatButton = this.shadowRoot.querySelector("#coord-format-switch");
            
            if (statusBar) {
                statusBar.addEventListener("click", (e) => {
                    // Don't toggle if clicking on buttons
                    if (!e.target.closest('button') && !e.target.closest('sl-button')) {
                        this.toggleExpanded();
                    }
                });
            }
            if (expandButton) {
                expandButton.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.toggleExpanded();
                });
            }
            if (formatButton) {
                formatButton.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.handleFormatSwitch();
                });
            }
        }
        
        handleFormatSwitch() {
            this.currentCoordFormat = (this.currentCoordFormat + 1) % 3;
            const longitudeElem = this.shadowRoot.querySelector(".coord-value.longitude");
            const latitudeElem = this.shadowRoot.querySelector(".coord-value.latitude");
            
            if (longitudeElem && latitudeElem) {
                const rawLongitude = parseFloat(longitudeElem.getAttribute("data-raw") || 14.222948);
                const rawLatitude = parseFloat(latitudeElem.getAttribute("data-raw") || 46.626326);
                
                longitudeElem.textContent = this.formatCoordinate(rawLongitude, this.currentCoordFormat);
                latitudeElem.textContent = this.formatCoordinate(rawLatitude, this.currentCoordFormat);
            }
        }
        
        formatCoordinate(decimal, format) {
            switch (format) {
                case 0:
                    return `${decimal.toFixed(6)}°`;
                case 1:
                    return this.decimalToDMS(decimal);
                case 2:
                    return this.decimalToDDM(decimal);
                default:
                    return `${decimal.toFixed(6)}°`;
            }
        }
        
        decimalToDMS(decimal) {
            const deg = Math.floor(Math.abs(decimal));
            const minNotTrunc = (Math.abs(decimal) - deg) * 60;
            const min = Math.floor(minNotTrunc);
            const sec = ((minNotTrunc - min) * 60).toFixed(2);
            const dir = decimal >= 0 ? "" : "-";
            return `${dir}${deg}° ${min}' ${sec}"`;
        }
        
        decimalToDDM(decimal) {
            const deg = Math.floor(Math.abs(decimal));
            const min = ((Math.abs(decimal) - deg) * 60).toFixed(4);
            const dir = decimal >= 0 ? "" : "-";
            return `${dir}${deg}° ${min}'`;
        }
        
        toggleExpanded() {
            const expandedSections = this.shadowRoot.querySelector("#expanded-sections");
            const chevronIcon = this.shadowRoot.querySelector("#chevron-icon");
            
            if (expandedSections) {
                const isExpanding = expandedSections.classList.contains("hidden");
                expandedSections.classList.toggle("hidden");
                
                if (chevronIcon) {
                    chevronIcon.innerHTML = isExpanding ? svg("chevron-down") : svg("chevron-up");
                }
            }
        }
        
        startDemoMode() {
            this.updateWithDemoData();
            this.demoIntervalId = setInterval(() => {
                this.updateWithDemoData();
            }, 3000);
        }
        
        updateAllStatus(data) {
            // Update different sections based on the data provided
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
            
            // Stop demo mode if real data is received
            if (this.demoIntervalId) {
                clearInterval(this.demoIntervalId);
                this.demoIntervalId = null;
            }
        }
        
        updateStatusBar(data) {
            if (data.deviceName) {
                const deviceElem = this.shadowRoot.querySelector(".device-name");
                if (deviceElem) deviceElem.textContent = data.deviceName;
            }
            if (data.tiltStatus) {
                const tiltElem = this.shadowRoot.querySelector(".tilt-status");
                if (tiltElem) {
                    tiltElem.innerHTML = `${this.getTiltIcon(data.tiltStatus)} ${data.tiltStatus}`;
                }
            }
            if (data.fixTime) {
                const fixTimeElem = this.shadowRoot.querySelector(".fix-time");
                if (fixTimeElem) fixTimeElem.textContent = data.fixTime;
            }
            if (data.rtkStatus) {
                const rtkElem = this.shadowRoot.querySelector(".rtk-status-simple");
                if (rtkElem) rtkElem.textContent = data.rtkStatus;
            }
            if (data.accuracy !== undefined) {
                const accuracyElem = this.shadowRoot.querySelector(".accuracy");
                if (accuracyElem) {
                    accuracyElem.textContent = data.accuracy;
                    accuracyElem.className = `accuracy ${data.accuracyClass || ''}`;
                }
            }
        }
        
        updateCoordinates(data) {
            if (data.longitude !== undefined) {
                const lonElem = this.shadowRoot.querySelector(".coord-value.longitude");
                if (lonElem) {
                    lonElem.setAttribute("data-raw", data.longitude);
                    lonElem.textContent = this.formatCoordinate(data.longitude, this.currentCoordFormat);
                }
            }
            if (data.latitude !== undefined) {
                const latElem = this.shadowRoot.querySelector(".coord-value.latitude");
                if (latElem) {
                    latElem.setAttribute("data-raw", data.latitude);
                    latElem.textContent = this.formatCoordinate(data.latitude, this.currentCoordFormat);
                }
            }
            if (data.altitude) {
                const altElem = this.shadowRoot.querySelector(".coord-value.altitude");
                if (altElem) altElem.textContent = data.altitude;
            }
            if (data.x) {
                const xElem = this.shadowRoot.querySelector(".coord-value.x-coord");
                if (xElem) xElem.textContent = data.x;
            }
            if (data.y) {
                const yElem = this.shadowRoot.querySelector(".coord-value.y-coord");
                if (yElem) yElem.textContent = data.y;
            }
            if (data.z) {
                const zElem = this.shadowRoot.querySelector(".coord-value.z-coord");
                if (zElem) zElem.textContent = data.z;
            }
        }
        
        updateGnssInfo(data) {
            if (data.vrmsHrms) {
                const elem = this.shadowRoot.querySelector(".vrms-hrms");
                if (elem) elem.textContent = data.vrmsHrms;
            }
            if (data.vdopPdop) {
                const elem = this.shadowRoot.querySelector(".vdop-pdop");
                if (elem) elem.textContent = data.vdopPdop;
            }
            if (data.ntripStatus || data.rtcmStatus) {
                const rtkElem = this.shadowRoot.querySelector(".rtk-status");
                if (rtkElem) {
                    let html = '';
                    if (data.ntripStatus) {
                        html += `<span class="status-dot ${data.ntripStatus.includes('Connected') ? 'connected' : ''}"></span>NTRIP: ${data.ntripStatus}`;
                    }
                    if (data.rtcmStatus) {
                        if (html) html += '<br>';
                        html += `<span class="status-dot ${data.rtcmStatus.includes('Receiving') ? 'connected' : ''}"></span>RTCM: ${data.rtcmStatus}`;
                    }
                    rtkElem.innerHTML = html;
                }
            }
            if (data.satelliteCount !== undefined) {
                const satElem = this.shadowRoot.querySelector(".satellite-count");
                if (satElem) satElem.textContent = data.satelliteCount;
            }
            if (data.speed) {
                const speedElem = this.shadowRoot.querySelector(".speed-value");
                if (speedElem) speedElem.textContent = data.speed;
            }
        }
        
        updateDeviceInfo(data) {
            if (data.tiltInfo) {
                const tiltElem = this.shadowRoot.querySelector(".tilt-info");
                if (tiltElem) tiltElem.textContent = data.tiltInfo;
            }
            if (data.batteryPercentage !== undefined) {
                const batteryBar = this.shadowRoot.querySelector(".battery-progress");
                const batteryPct = this.shadowRoot.querySelector(".battery-percentage");
                if (batteryBar) batteryBar.value = data.batteryPercentage;
                if (batteryPct) batteryPct.textContent = `${data.batteryPercentage}%`;
            }
        }
        
        getTiltIcon(status) {
            // Return appropriate icon based on tilt status
            if (status.toLowerCase().includes('good') || status.toLowerCase().includes('ok')) {
                return '✓';
            } else if (status.toLowerCase().includes('warning')) {
                return '⚠';
            } else if (status.toLowerCase().includes('error') || status.toLowerCase().includes('bad')) {
                return '✗';
            }
            return '';
        }
        
        updateWithDemoData() {
            const now = new Date();
            const fixTime = this.shadowRoot.querySelector(".fix-time");
            if (fixTime) {
                fixTime.textContent = now.toLocaleTimeString();
            }
            
            const accuracy = this.shadowRoot.querySelector(".accuracy");
            if (accuracy) {
                const acc = (Math.random() * 5).toFixed(1);
                accuracy.textContent = `±${acc}cm`;
                
                // Update accuracy class
                accuracy.className = "accuracy";
                if (acc > 3) {
                    accuracy.classList.add("low");
                } else if (acc > 1.5) {
                    accuracy.classList.add("medium");
                } else {
                    accuracy.classList.add("high");
                }
            }
            
            // Update expanded section data if visible
            const expandedSections = this.shadowRoot.querySelector("#expanded-sections");
            if (expandedSections && !expandedSections.classList.contains("hidden")) {
                // Update coordinates
                const longitude = 14.222948 + (Math.random() - 0.5) * 0.0001;
                const latitude = 46.626326 + (Math.random() - 0.5) * 0.0001;
                
                const lonElem = this.shadowRoot.querySelector(".coord-value.longitude");
                const latElem = this.shadowRoot.querySelector(".coord-value.latitude");
                if (lonElem) {
                    lonElem.setAttribute("data-raw", longitude);
                    lonElem.textContent = this.formatCoordinate(longitude, this.currentCoordFormat);
                }
                if (latElem) {
                    latElem.setAttribute("data-raw", latitude);
                    latElem.textContent = this.formatCoordinate(latitude, this.currentCoordFormat);
                }
                
                // Update altitude
                const altElem = this.shadowRoot.querySelector(".coord-value.altitude");
                if (altElem) {
                    altElem.textContent = `${(524.56 + (Math.random() - 0.5) * 0.5).toFixed(2)} m`;
                }
                
                // Update satellite count
                const satCount = this.shadowRoot.querySelector(".satellite-count");
                if (satCount) {
                    satCount.textContent = Math.floor(15 + Math.random() * 5);
                }
                
                // Update speed
                const speed = this.shadowRoot.querySelector(".speed-value");
                if (speed) {
                    speed.textContent = `${(Math.random() * 0.5).toFixed(1)} m/s`;
                }
                
                // Update battery
                const batteryBar = this.shadowRoot.querySelector(".battery-progress");
                const batteryPct = this.shadowRoot.querySelector(".battery-percentage");
                if (batteryBar && batteryPct) {
                    const battery = 60 + Math.floor(Math.random() * 40);
                    batteryBar.value = battery;
                    batteryPct.textContent = `${battery}%`;
                }
            }
        }
    }
    
    // Define the custom element with the original name
    console.log('[StatusFooterNonModule] Defining status-footer element');
    customElements.define("status-footer", StatusFooterOriginal);
    
    // Create and add the element
    const newFooter = document.createElement('status-footer');
    document.body.appendChild(newFooter);
    console.log('[StatusFooterNonModule] Created and added status-footer element');
    
})();