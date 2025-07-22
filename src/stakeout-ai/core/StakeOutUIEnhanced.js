// StakeOutUIEnhanced.js - Enhanced stakeout UI with integrated zoom controls
class StakeOutUIEnhanced extends StakeOutUICompact {
  constructor() {
    super();
    this.autozoomEngine = null;
    this.webglOptimizer = null;
    this.performanceMonitor = null;
    this.arEnhancements = null;
    this.map = null;
    this.autozoomEnabled = true;
    this.manualZoomTimeout = null;
    this.zoomControlsVisible = true;
  }

  // Override createWidget to add zoom controls
  createWidget() {
    // Call parent createWidget first
    super.createWidget();
    
    // Initialize autozoom engine if map is available
    if (typeof App !== "undefined" && App.Map && App.Map.Init) {
      this.map = App.Map.Init.getMap();
      if (this.map) {
        // Initialize autozoom engine
        if (window.AutozoomEngine) {
          this.autozoomEngine = new window.AutozoomEngine(this.map);
        }
        
        // Initialize WebGL optimizer
        if (window.WebGLOptimizer) {
          this.webglOptimizer = new window.WebGLOptimizer();
          this.webglOptimizer.initialize(this.map);
        }
        
        // Initialize performance monitor
        if (window.PerformanceMonitor) {
          this.performanceMonitor = new window.PerformanceMonitor();
          this.performanceMonitor.start();
          
          // Set up performance-based optimization
          this.performanceMonitor.onOptimizationNeeded((optimization) => {
            console.log('[StakeOutUI] Performance optimization needed:', optimization.reason);
            
            // Reduce update rate if performance is poor
            if (optimization.reason === 'lowFPS' && this.autozoomEngine) {
              // Battery manager will handle this adaptively
              if (window.BatteryManager) {
                const newRate = window.BatteryManager.getUpdateRate('position');
                this.autozoomEngine.updateInterval = newRate;
                console.log('[StakeOutUI] Adjusted update rate to:', newRate + 'ms');
              } else {
                this.autozoomEngine.updateInterval = 200; // Fallback
              }
            }
          });
        }
        
        // Initialize AR enhancements
        if (window.AREnhancements) {
          this.arEnhancements = new window.AREnhancements();
          this.arEnhancements.initialize(this.map);
        }
      }
    }
    
    // Add zoom controls to the widget
    this.addZoomControls();
    
    return this.widget;
  }
  
  // Add zoom controls to the widget
  addZoomControls() {
    if (!this.widget) return;
    
    // Find the compact view container
    const compactView = this.widget.querySelector('.stakeout-compact-view');
    if (!compactView) return;
    
    // Create zoom controls container
    const zoomControls = document.createElement('div');
    zoomControls.className = 'stakeout-zoom-controls';
    zoomControls.innerHTML = `
      <button class="zoom-control zoom-in" id="stakeout-zoom-in" title="${this.getTranslation('stakeout.zoom_in', 'Zoom In')}">
        <svg width="20" height="20" viewBox="0 0 20 20">
          <line x1="10" y1="5" x2="10" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="5" y1="10" x2="15" y2="10" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
      <button class="zoom-control zoom-out" id="stakeout-zoom-out" title="${this.getTranslation('stakeout.zoom_out', 'Zoom Out')}">
        <svg width="20" height="20" viewBox="0 0 20 20">
          <line x1="5" y1="10" x2="15" y2="10" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
      <button class="zoom-control zoom-auto ${this.autozoomEnabled ? 'active' : ''}" id="stakeout-zoom-auto" title="${this.getTranslation('stakeout.auto_zoom', 'Auto Zoom')}">
        <svg width="20" height="20" viewBox="0 0 20 20">
          <text x="10" y="15" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">A</text>
        </svg>
      </button>
    `;
    
    // Insert zoom controls after the arrows grid
    const arrowsGrid = compactView.querySelector('.stakeout-arrows-grid');
    if (arrowsGrid && arrowsGrid.nextSibling) {
      compactView.insertBefore(zoomControls, arrowsGrid.nextSibling);
    } else {
      compactView.appendChild(zoomControls);
    }
    
    // Add zoom control styles
    this.addZoomControlStyles();
    
    // Set up zoom control event handlers
    this.setupZoomControlHandlers();
  }
  
  // Add zoom control styles
  addZoomControlStyles() {
    // Check if styles already exist
    if (document.getElementById('stakeout-zoom-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'stakeout-zoom-styles';
    style.textContent = `
      .stakeout-zoom-controls {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 10px;
        padding: 8px 0;
      }
      
      .zoom-control {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(var(--ml-c-bg-2), 0.8);
        border: 1px solid rgba(var(--ml-c-bg-3), 0.5);
        border-radius: 50%;
        color: rgb(var(--ml-c-icon-1));
        cursor: pointer;
        transition: all 0.2s;
        -webkit-appearance: none;
        appearance: none;
        outline: none;
      }
      
      .zoom-control:hover {
        background: rgba(var(--ml-c-bg-2), 1);
        color: rgb(var(--ml-c-icon-2));
        transform: scale(1.1);
      }
      
      .zoom-control:active {
        transform: scale(0.95);
      }
      
      .zoom-control.active {
        background: rgba(var(--ml-c-active), 0.2);
        border-color: rgb(var(--ml-c-active));
        color: rgb(var(--ml-c-active));
      }
      
      .zoom-control.active:hover {
        background: rgba(var(--ml-c-active), 0.3);
      }
      
      .zoom-control svg {
        pointer-events: none;
      }
      
      /* Adjust widget height to accommodate zoom controls */
      .stakeout-widget {
        height: 220px !important; /* Increased from 180px */
      }
      
      .stakeout-widget.expanded {
        height: 380px !important; /* Increased from 340px */
      }
      
      /* Responsive adjustments */
      @media (max-width: 480px) {
        .zoom-control {
          width: 32px;
          height: 32px;
        }
      }
      
      @media (orientation: landscape) and (max-height: 500px) {
        .stakeout-widget {
          height: 170px !important;
        }
        
        .stakeout-widget.expanded {
          height: 330px !important;
        }
        
        .stakeout-zoom-controls {
          margin-top: 5px;
          padding: 5px 0;
        }
        
        .zoom-control {
          width: 30px;
          height: 30px;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Set up zoom control event handlers
  setupZoomControlHandlers() {
    const widget = this.widget;
    if (!widget) return;
    
    // Zoom in button
    const zoomInBtn = widget.querySelector('#stakeout-zoom-in');
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleManualZoom(1);
      });
    }
    
    // Zoom out button
    const zoomOutBtn = widget.querySelector('#stakeout-zoom-out');
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleManualZoom(-1);
      });
    }
    
    // Auto zoom toggle button
    const autoZoomBtn = widget.querySelector('#stakeout-zoom-auto');
    if (autoZoomBtn) {
      autoZoomBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleAutozoom();
      });
    }
  }
  
  // Handle manual zoom
  handleManualZoom(direction) {
    if (!this.map) return;
    
    // Temporarily disable autozoom when user manually zooms
    if (this.autozoomEnabled) {
      this.setAutozoomEnabled(false);
      
      // Re-enable autozoom after 5 seconds of no manual zoom
      clearTimeout(this.manualZoomTimeout);
      this.manualZoomTimeout = setTimeout(() => {
        this.setAutozoomEnabled(true);
      }, 5000);
    }
    
    // Perform zoom
    const currentZoom = this.map.getZoom();
    const newZoom = currentZoom + (direction * 0.5); // Zoom by 0.5 levels
    this.map.easeTo({
      zoom: newZoom,
      duration: 300
    });
  }
  
  // Toggle autozoom
  toggleAutozoom() {
    this.setAutozoomEnabled(!this.autozoomEnabled);
  }
  
  // Set autozoom enabled state
  setAutozoomEnabled(enabled) {
    this.autozoomEnabled = enabled;
    
    if (this.autozoomEngine) {
      this.autozoomEngine.setEnabled(enabled);
    }
    
    // Update button state
    const autoZoomBtn = this.widget?.querySelector('#stakeout-zoom-auto');
    if (autoZoomBtn) {
      if (enabled) {
        autoZoomBtn.classList.add('active');
      } else {
        autoZoomBtn.classList.remove('active');
      }
    }
    
    // Clear manual zoom timeout if disabling
    if (!enabled) {
      clearTimeout(this.manualZoomTimeout);
    }
  }
  
  // Override updateNavigation to integrate autozoom and AR
  updateNavigation(currentLocation, targetLocation, distance) {
    // Call parent updateNavigation
    super.updateNavigation(currentLocation, targetLocation, distance);
    
    // Update autozoom if enabled
    if (this.autozoomEnabled && this.autozoomEngine && distance !== undefined) {
      // Extract velocity if available from GNSS data
      let velocity = 0;
      if (typeof App !== "undefined" && App.Features && App.Features.GNSS) {
        const gnssData = App.Features.GNSS.getLastPosition();
        if (gnssData && gnssData.speed !== undefined) {
          velocity = gnssData.speed; // m/s
        }
      }
      
      // Pass current position for velocity tracking
      this.autozoomEngine.updateZoom(distance, { 
        velocity,
        currentPosition: [currentLocation[0], currentLocation[1]]
      });
    }
    
    // Update AR enhancements
    if (this.arEnhancements) {
      // Calculate bearing from current to target
      const bearing = turf.bearing(
        turf.point(currentLocation),
        turf.point(targetLocation)
      );
      
      this.arEnhancements.update({
        currentPosition: [currentLocation[0], currentLocation[1]],
        targetPosition: [targetLocation[0], targetLocation[1]],
        bearing: bearing
      });
    }
  }
  
  // Hide external zoom controls when stakeout is active
  hideExternalZoomControls() {
    if (typeof App !== "undefined" && App.Map && App.Map.Controls) {
      this.zoomControlsVisible = App.Map.Controls.getZoomEnabled();
      if (this.zoomControlsVisible) {
        App.Map.Controls.setZoomEnabled(false);
      }
    }
  }
  
  // Restore external zoom controls when stakeout ends
  restoreExternalZoomControls() {
    if (typeof App !== "undefined" && App.Map && App.Map.Controls && this.zoomControlsVisible) {
      App.Map.Controls.setZoomEnabled(true);
    }
  }
  
  // Override cleanup to restore zoom controls
  cleanup() {
    // Restore external zoom controls
    this.restoreExternalZoomControls();
    
    // Clean up autozoom engine
    if (this.autozoomEngine) {
      this.autozoomEngine.destroy();
      this.autozoomEngine = null;
    }
    
    // Clean up WebGL optimizer
    if (this.webglOptimizer) {
      this.webglOptimizer.destroy();
      this.webglOptimizer = null;
    }
    
    // Clean up performance monitor
    if (this.performanceMonitor) {
      this.performanceMonitor.destroy();
      this.performanceMonitor = null;
    }
    
    // Clean up AR enhancements
    if (this.arEnhancements) {
      this.arEnhancements.destroy();
      this.arEnhancements = null;
    }
    
    // Clear timeout
    clearTimeout(this.manualZoomTimeout);
    
    // Call parent cleanup
    super.cleanup();
  }
  
  // Add method to be called when stakeout starts
  onStakeoutStart() {
    this.hideExternalZoomControls();
  }
  
  // Translation helper method with multiple fallback strategies
  getTranslation(key, defaultValue) {
    // Try multiple translation sources in order of preference
    const sources = [
      () => {
        // Method 1: App.I18n standard
        if (typeof App !== 'undefined' && App.I18n && App.I18n.t) {
          return App.I18n.t(key);
        }
        return null;
      },
      () => {
        // Method 2: Direct App.I18n access
        if (typeof App !== 'undefined' && App.I18n && App.I18n.translations) {
          const current = window.LanguageBridge ? window.LanguageBridge.getCurrentLanguage() : 'en';
          const translations = App.I18n.translations[current] || App.I18n.translations.en;
          return this.getNestedProperty(translations, key);
        }
        return null;
      },
      () => {
        // Method 3: UIBridge translation
        if (typeof UIBridge !== 'undefined' && UIBridge.translate) {
          return UIBridge.translate(key);
        }
        return null;
      },
      () => {
        // Method 4: Global translation function
        if (typeof window.translate !== 'undefined') {
          return window.translate(key);
        }
        return null;
      },
      () => {
        // Method 5: Simple translation map
        const translations = {
          'stakeout.zoom_in': {
            'en': 'Zoom In',
            'es': 'Acercar',
            'fr': 'Zoom avant',
            'de': 'Vergrößern',
            'it': 'Ingrandire',
            'pt': 'Aproximar',
            'nl': 'Inzoomen',
            'da': 'Zoom ind',
            'sv': 'Zooma in',
            'no': 'Zoom inn'
          },
          'stakeout.zoom_out': {
            'en': 'Zoom Out',
            'es': 'Alejar',
            'fr': 'Zoom arrière',
            'de': 'Verkleinern',
            'it': 'Rimpicciolire',
            'pt': 'Afastar',
            'nl': 'Uitzoomen',
            'da': 'Zoom ud',
            'sv': 'Zooma ut',
            'no': 'Zoom ut'
          },
          'stakeout.auto_zoom': {
            'en': 'Auto Zoom',
            'es': 'Zoom Automático',
            'fr': 'Zoom automatique',
            'de': 'Automatischer Zoom',
            'it': 'Zoom automatico',
            'pt': 'Zoom automático',
            'nl': 'Automatisch zoomen',
            'da': 'Automatisk zoom',
            'sv': 'Auto-zoom',
            'no': 'Auto-zoom'
          }
        };
        
        const currentLang = window.LanguageBridge ? window.LanguageBridge.getCurrentLanguage() : 'en';
        const keyTranslations = translations[key];
        
        if (keyTranslations) {
          return keyTranslations[currentLang] || keyTranslations.en;
        }
        
        return null;
      }
    ];
    
    // Try each source until we get a valid translation
    for (const source of sources) {
      try {
        const translation = source();
        if (translation && translation !== key) {
          return translation;
        }
      } catch (error) {
        console.warn('[StakeOutUIEnhanced] Translation source failed:', error);
      }
    }
    
    // Return default value if no translation found
    return defaultValue;
  }
  
  // Helper method to get nested property from object
  getNestedProperty(obj, path) {
    if (!obj || !path) return null;
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return null;
      }
    }
    
    return current;
  }
}

// Export the enhanced class
if (typeof module !== "undefined" && module.exports) {
  module.exports = StakeOutUIEnhanced;
} else {
  window.StakeOutUIEnhanced = StakeOutUIEnhanced;
}