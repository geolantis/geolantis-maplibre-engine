/* ------------------------------------------------------------------
 * Minimal icon registry – add or edit SVGs here.  Each SVG keeps
 * width/height so sizing is identical to before and uses currentColor
 * so it inherits the surrounding text color.
 * ------------------------------------------------------------------ */
const icons = {
  clock: `\n<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  signal: `\n<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></svg>`,
  satellite: `\n<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 7 9 3 5 7l4 4"/><path d="m17 11 4 4-4 4-4-4"/><path d="m8 12 4 4 6-6-4-4Z"/><path d="m16 8 3-3"/><path d="M9 21a6 6 0 0 0-6-6"/></svg>`,
  speedometer: `\n<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>`,
  compass: `\n<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`,
  battery: `\n<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"/><line x1="23" y1="13" x2="23" y2="11"/></svg>`,
  wifi: `\n<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
  "chevron-up": `\n<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
  "chevron-down": `\n<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  expand: `\n<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4 9 9"/></svg>`,
};
function svg(name) {
  return icons[name] || "";
}

/* ------------------------------------------------------------------ */

import { StatusFooterStyles } from "./status-footer-styles.js";

class StatusFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Component state
    this.realDataReceived = false;
    this.demoIntervalId = null;
    this.debugEnabled = false;
    this.currentCoordFormat = 0;
  }

  // Lifecycle callbacks
  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.initializeComponent();
    this.ensureVisibility();
  }

  disconnectedCallback() {
    if (this.demoIntervalId) {
      clearInterval(this.demoIntervalId);
      this.demoIntervalId = null;
    }
    this.removeEventListeners();
  }

  render() {
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
    <!-- ─────────── Block ① ─────────── -->
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

    <!-- ─────────── Block ② ─────────── -->
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
          <span class="gnss-value speed-value">0.2&nbsp;m/s</span>
        </div>
      </div>
    </div>
  </div>
</div>

            <!-- Device Info Section -->
            <div class="section device-section">
              <h3 class="section-title">GNSS-Device</h3>
              <div class="device-details">
                <div class="device-item">${svg(
                  "compass"
                )}<span class="device-label">Tilt Status:</span><span class="tilt-info">No Sensor (0.4°)</span></div>
                <div class="device-item">${svg(
                  "battery"
                )}<sl-progress-bar value="85" class="battery-progress"></sl-progress-bar><span class="battery-percentage">85%</span></div>
                <div class="device-item">${svg("wifi")}<span>WiFi</span></div>
                <div class="device-item locator"><h4 class="subsection-title">Locator</h4><span class="locator-type">WiFi</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  async initializeComponent() {
    // Only wait for Shoelace components we still use.
    await Promise.all([
      customElements.whenDefined("sl-button"),
      customElements.whenDefined("sl-progress-bar"),
    ]);

    const isBrowserEnvironment =
      !window.AndroidBridge &&
      !window.Android &&
      !navigator.userAgent.includes("Android WebView");

    if (isBrowserEnvironment) {
      this.startDemoMode();
    }
    
    // Ensure visibility after initialization
    this.ensureVisibility();
  }

  setupEventListeners() {
    const statusBar = this.shadowRoot.querySelector(".status-bar");
    const expandButton = this.shadowRoot.querySelector("#toggle-expand");
    const formatButton = this.shadowRoot.querySelector("#coord-format-switch");

    if (statusBar) {
      statusBar.addEventListener("click", () => this.toggleExpanded());
    }
    if (expandButton) {
      expandButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleExpanded();
      });
    }
    if (formatButton) {
      formatButton.addEventListener("click", (e) => this.handleFormatSwitch(e));
    }
  }

  removeEventListeners() {}

  toggleExpanded() {
    const expandedSections =
      this.shadowRoot.querySelector("#expanded-sections");
    const chevronIcon = this.shadowRoot.querySelector("#chevron-icon");

    if (expandedSections) {
      const isExpanding = expandedSections.classList.contains("hidden");
      expandedSections.classList.toggle("hidden");

      if (chevronIcon) {
        chevronIcon.innerHTML = isExpanding
          ? svg("chevron-down")
          : svg("chevron-up");
      }
      this.toggleBottomControls(!isExpanding);
    }
  }

  handleFormatSwitch(e) {
    e.stopPropagation();
    this.currentCoordFormat = (this.currentCoordFormat + 1) % 3;

    const longitudeElem = this.shadowRoot.querySelector(
      ".coord-value.longitude"
    );
    const latitudeElem = this.shadowRoot.querySelector(".coord-value.latitude");

    if (longitudeElem && latitudeElem) {
      const rawLongitude = parseFloat(
        longitudeElem.getAttribute("data-raw") || 14.222948
      );
      const rawLatitude = parseFloat(
        latitudeElem.getAttribute("data-raw") || 46.626326
      );

      longitudeElem.textContent = this.formatCoordinate(
        rawLongitude,
        this.currentCoordFormat
      );
      latitudeElem.textContent = this.formatCoordinate(
        rawLatitude,
        this.currentCoordFormat
      );
    }
  }

  // Configuration methods for customizing the display
  configureStatusBar(config) {
    this.statusBarConfig = Object.assign({}, this.statusBarConfig, config);
    this.render();
  }

  configureExpandedSections(config) {
    this.expandedSectionsConfig = Object.assign(
      {},
      this.expandedSectionsConfig,
      config
    );
    this.render();
  }

  // Detect orientation and adjust layout
  // Detect orientation and adjust layout
  handleOrientationChange() {
    const isPortrait = window.innerHeight > window.innerWidth;
    const wasPortrait = this.expandedSectionsConfig.portraitMode;

    if (isPortrait !== wasPortrait) {
      this.expandedSectionsConfig.portraitMode = isPortrait;
      this.expandedSectionsConfig.compactLayout = isPortrait;
      this.render();
      this.setupEventListeners();

      // Restore current coordinate format
      if (this.currentCoordFormat !== 0) {
        this.handleFormatSwitch({ stopPropagation: () => {} });
      }
    }
  }

  toggleBottomControls(show) {
    const bottomControls = document.querySelectorAll(
      ".maplibregl-ctrl-bottom-left, .maplibregl-ctrl-bottom-right, #G360StakeButtonControl, .maplibregl-ctrl-scale"
    );
    bottomControls.forEach((control) => {
      if (control) {
        control.style.visibility = show ? "visible" : "hidden";
        control.style.opacity = show ? "1" : "0";
        control.style.transition = "opacity 0.3s ease";
      }
    });
  }
  
  /**
   * Ensure the footer is visible and properly positioned
   */
  ensureVisibility() {
    // Force visibility styles on the host element
    this.style.cssText = `
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      width: 100% !important;
      z-index: 10000 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    `;
    
    // Ensure map doesn't overlap
    const map = document.getElementById('map');
    if (map) {
      map.style.bottom = '60px';
    }
    
    // Adjust map controls to not overlap with footer
    const bottomControls = document.querySelectorAll('.maplibregl-ctrl-bottom-left, .maplibregl-ctrl-bottom-right');
    bottomControls.forEach(control => {
      //control.style.bottom = '70px';
    });
  }

  /* ---------- update* methods and demo mode unchanged -------------------- */
  updateStatusBar(data) {
    try {
      const elements = {
        deviceName: this.shadowRoot.querySelector(".device-name"),
        tiltStatus: this.shadowRoot.querySelector(".tilt-status"),
        fixTime: this.shadowRoot.querySelector(".fix-time"),
        rtkStatus: this.shadowRoot.querySelector(
          ".rtk-indicator span:last-child"
        ),
        accuracy: this.shadowRoot.querySelector(".accuracy"),
      };
      if (data.deviceName && elements.deviceName)
        elements.deviceName.textContent = data.deviceName;
      if (data.tiltStatus && elements.tiltStatus)
        elements.tiltStatus.textContent = data.tiltStatus;
      if (data.fixTime && elements.fixTime)
        elements.fixTime.textContent = data.fixTime;
      if (data.rtkStatus && elements.rtkStatus)
        elements.rtkStatus.textContent = data.rtkStatus;
      if (data.accuracy && elements.accuracy) {
        elements.accuracy.textContent = data.accuracy;
        if (data.accuracyClass)
          elements.accuracy.className = `accuracy ${data.accuracyClass}`;
      }
      return true;
    } catch (err) {
      console.error("Error updating status bar:", err);
      return false;
    }
  }

  updateCoordinates(data) {
    try {
      const el = {
        lon: this.shadowRoot.querySelector(".coord-value.longitude"),
        lat: this.shadowRoot.querySelector(".coord-value.latitude"),
        alt: this.shadowRoot.querySelector(".coord-value.altitude"),
        x: this.shadowRoot.querySelector(".coord-value.x-coord"),
        y: this.shadowRoot.querySelector(".coord-value.y-coord"),
        z: this.shadowRoot.querySelector(".coord-value.z-coord"),
      };
      
      if (data.longitude !== undefined && el.lon) {
        // Parse numeric value from string if needed
        let lonValue = data.longitude;
        if (typeof lonValue === 'string') {
          lonValue = parseFloat(lonValue.replace(/°/g, '').trim());
        }
        el.lon.setAttribute("data-raw", lonValue);
        el.lon.textContent = this.formatCoordinate(lonValue, this.currentCoordFormat);
      }
      
      if (data.latitude !== undefined && el.lat) {
        // Parse numeric value from string if needed
        let latValue = data.latitude;
        if (typeof latValue === 'string') {
          latValue = parseFloat(latValue.replace(/°/g, '').trim());
        }
        el.lat.setAttribute("data-raw", latValue);
        el.lat.textContent = this.formatCoordinate(latValue, this.currentCoordFormat);
      }
      
      if (data.altitude && el.alt) el.alt.textContent = data.altitude;
      if (data.x && el.x) el.x.textContent = data.x;
      if (data.y && el.y) el.y.textContent = data.y;
      if (data.z && el.z) el.z.textContent = data.z;
      return true;
    } catch (err) {
      console.error("Error updating coordinates:", err);
      return false;
    }
  }

  updateGnssInfo(data) {
    try {
      const el = {
        vrmsHrms: this.shadowRoot.querySelector(".vrms-hrms"),
        vdopPdop: this.shadowRoot.querySelector(".vdop-pdop"),
        rtkStatus: this.shadowRoot.querySelector(".rtk-status"),
        satCount: this.shadowRoot.querySelector(".satellite-count"),
        speed: this.shadowRoot.querySelector(".speed-value"),
      };
      if (data.vrmsHrms && el.vrmsHrms) el.vrmsHrms.textContent = data.vrmsHrms;
      if (data.vdopPdop && el.vdopPdop) el.vdopPdop.textContent = data.vdopPdop;
      if (data.satelliteCount && el.satCount)
        el.satCount.textContent = data.satelliteCount;
      if (data.speed && el.speed) el.speed.textContent = data.speed;
      if (data.ntripStatus && data.rtcmStatus && el.rtkStatus) {
        el.rtkStatus.innerHTML = `<span class="status-dot ${
          data.ntripStatus === "Connected" ? "connected" : "disconnected"
        }"></span>NTRIP: ${data.ntripStatus}<br><span class="status-dot ${
          data.rtcmStatus === "Receiving" ? "connected" : "disconnected"
        }"></span>RTCM: ${data.rtcmStatus}`;
      }
      return true;
    } catch (err) {
      console.error("Error updating GNSS info:", err);
      return false;
    }
  }

  updateDeviceInfo(data) {
    try {
      const tiltInfoEl = this.shadowRoot.querySelector(".tilt-info");
      const batteryBar = this.shadowRoot.querySelector(".battery-progress");
      const batteryPct = this.shadowRoot.querySelector(".battery-percentage");
      if (data.tiltInfo && tiltInfoEl) tiltInfoEl.textContent = data.tiltInfo;
      if (batteryBar && batteryPct && data.batteryPercentage !== undefined) {
        const v = parseInt(data.batteryPercentage);
        if (!isNaN(v)) {
          batteryBar.value = v;
          batteryPct.textContent = `${v}%`;
          if (v <= 20)
            batteryBar.style.setProperty(
              "--indicator-color",
              "var(--sl-color-danger-500)"
            );
          else if (v <= 50)
            batteryBar.style.setProperty(
              "--indicator-color",
              "var(--sl-color-warning-500)"
            );
          else
            batteryBar.style.setProperty(
              "--indicator-color",
              "var(--sl-color-success-500)"
            );
        }
      }
      return true;
    } catch (err) {
      console.error("Error updating device info:", err);
      return false;
    }
  }

  updateAllStatus(data) {
    if (data.statusBar) this.updateStatusBar(data.statusBar);
    if (data.coordinates) this.updateCoordinates(data.coordinates);
    if (data.gnssInfo) this.updateGnssInfo(data.gnssInfo);
    if (data.deviceInfo) this.updateDeviceInfo(data.deviceInfo);
    if (!this.realDataReceived) {
      this.realDataReceived = true;
      if (this.demoIntervalId) {
        clearInterval(this.demoIntervalId);
        this.demoIntervalId = null;
      }
    }
    return true;
  }

  startDemoMode() {
    if (this.demoIntervalId) clearInterval(this.demoIntervalId);
    this.updateWithDemoData();
    this.demoIntervalId = setInterval(() => {
      if (this.realDataReceived) {
        clearInterval(this.demoIntervalId);
        this.demoIntervalId = null;
        return;
      }
      this.updateWithDemoData();
    }, 3000);
  }

  updateWithDemoData() {
    const now = new Date();
    const demoData = {
      statusBar: {
        deviceName: "ppm10xx zero (DEMO)",
        tiltStatus: "Ready",
        fixTime: now.toLocaleTimeString(),
        rtkStatus: "FIX (2s)",
        accuracy: `±${(Math.random() * 5).toFixed(1)}cm`,
        accuracyClass:
          Math.random() < 0.7 ? "high" : Math.random() < 0.9 ? "medium" : "low",
      },
      coordinates: {
        longitude: `${(14.222948 + (Math.random() - 0.5) * 0.0001).toFixed(
          6
        )}°`,
        latitude: `${(46.626326 + (Math.random() - 0.5) * 0.0001).toFixed(6)}°`,
        altitude: `${(524.56 + (Math.random() - 0.5) * 0.5).toFixed(2)} m`,
        x: (5682455.66 + (Math.random() - 0.5) * 10).toFixed(2),
        y: (4538269.67 + (Math.random() - 0.5) * 10).toFixed(2),
        z: `${(524.63 + (Math.random() - 0.5) * 0.5).toFixed(2)} m`,
      },
      gnssInfo: {
        vrmsHrms: `${(Math.random() * 1.5).toFixed(3)}[m] / ${(
          Math.random() * 0.5
        ).toFixed(3)}[m]`,
        vdopPdop: `${(1 + Math.random()).toFixed(1)} / ${(
          2 +
          Math.random() * 1.5
        ).toFixed(1)}`,
        ntripStatus: Math.random() > 0.9 ? "Disconnected" : "Connected",
        rtcmStatus: Math.random() > 0.9 ? "No Data" : "Receiving",
        satelliteCount: Math.floor(15 + Math.random() * 5),
        speed: `${(Math.random() * 0.5).toFixed(1)} m/s`,
      },
      deviceInfo: {
        tiltInfo: `No Sensor (${(Math.random() * 0.8).toFixed(1)}°)`,
        batteryPercentage: 60 + Math.floor(Math.random() * 40),
      },
    };
    this.updateStatusBar(demoData.statusBar);
    const expandedSections =
      this.shadowRoot.querySelector("#expanded-sections");
    if (expandedSections && !expandedSections.classList.contains("hidden")) {
      this.updateCoordinates(demoData.coordinates);
      this.updateGnssInfo(demoData.gnssInfo);
      this.updateDeviceInfo(demoData.deviceInfo);
    }
  }

  formatCoordinate(decimal, format) {
    // Handle string inputs that might contain degree symbols
    if (typeof decimal === 'string') {
      decimal = parseFloat(decimal.replace(/°/g, '').trim());
    }
    
    // Ensure decimal is a valid number
    if (typeof decimal !== 'number' || isNaN(decimal)) {
      console.warn('[StatusFooter] Invalid coordinate value:', decimal);
      return '0.000000°';
    }
    
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
}

// Register the Web Component
customElements.define("status-footer", StatusFooter);

// Export function for manual visibility ensuring
window.ensureFooterVisibility = function() {
  const footer = document.querySelector('status-footer');
  if (footer && footer.ensureVisibility) {
    footer.ensureVisibility();
  }
};

export default StatusFooter;
