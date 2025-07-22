// Ultra-thin Mobile Status Footer with Advanced Configuration
(function() {
    'use strict';
    
    console.log('[StatusFooterUltraThin v5-rtk] Initializing ultra-thin status footer with RTK status support');
    
    // Configuration defaults
    const defaultConfig = {
        style: {
            theme: 'default', // 'default' | 'transparent' | 'glass' | 'minimal'
            height: 'ultra', // 'ultra' (28px) | 'compact' (32px) | 'normal' (40px)
            position: 'bottom', // 'bottom' | 'top' | 'floating'
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            textColor: '#333',
            borderRadius: 0,
            shadow: true
        },
        layout: {
            // Non-expanded footer elements configuration
            statusBar: {
                // Required elements (cannot be hidden)
                accuracy: { 
                    visible: true, 
                    position: 'right',
                    showUnit: true,
                    colorCoded: true
                },
                gnssStatus: { 
                    visible: true, 
                    position: 'right',
                    format: 'compact' // 'compact' | 'full'
                },
                // Optional elements
                deviceName: { 
                    visible: true, 
                    position: 'left',
                    maxWidth: '120px'
                },
                time: { 
                    visible: true, 
                    position: 'center',
                    format: '24h' // '24h' | '12h'
                },
                satellites: { 
                    visible: true, 
                    position: 'right',
                    showIcon: true
                },
                battery: { 
                    visible: false, 
                    position: 'right',
                    showPercentage: true
                },
                expandButton: { 
                    visible: true, 
                    position: 'right',
                    size: 'small' // 'small' | 'medium'
                }
            },
            // Expanded sections configuration
            expanded: {
                coordinates: { visible: true, priority: 1 },
                gnssQuality: { visible: true, priority: 2 },
                deviceInfo: { visible: true, priority: 3 }
            }
        },
        behavior: {
            autoHide: false,
            autoHideDelay: 5000,
            expandOnTap: true,
            swipeToExpand: true,
            hapticFeedback: true,
            persistState: true
        },
        responsive: {
            breakpoints: {
                ultraSmall: 360,  // Below this: hide labels
                small: 480,       // Below this: compact mode
                medium: 768       // Below this: reduced elements
            },
            autoAdjust: true
        }
    };
    
    // Ultra-thin optimized styles
    const UltraThinStyles = `
<style>
  :host {
    display: block;
    position: fixed;
    left: 0;
    right: 0;
    z-index: 1000;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    font-size: 12px;
  }
  
  :host([position="bottom"]) {
    bottom: 0;
  }
  
  :host([position="top"]) {
    top: 0;
  }
  
  :host([position="floating"]) {
    bottom: 10px;
    left: 10px;
    right: 10px;
  }
  
  /* Container */
  .status-footer {
    width: 100%;
    transition: all 0.3s ease-out;
  }
  
  /* Status bar heights */
  .status-bar {
    position: relative;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s;
    overflow: hidden;
  }
  
  .height-ultra .status-bar {
    height: 28px;
  }
  
  .height-compact .status-bar {
    height: 32px;
  }
  
  .height-normal .status-bar {
    height: 40px;
  }
  
  /* Theme styles */
  .theme-default .status-bar {
    background: var(--bg-color, rgba(255, 255, 255, 0.9));
    backdrop-filter: var(--backdrop, blur(10px));
    -webkit-backdrop-filter: var(--backdrop, blur(10px));
    box-shadow: var(--shadow, 0 -1px 3px rgba(0, 0, 0, 0.1));
    color: var(--text-color, #333);
  }
  
  .theme-transparent .status-bar {
    background: var(--bg-color, rgba(0, 0, 0, 0.3));
    backdrop-filter: var(--backdrop, blur(20px));
    -webkit-backdrop-filter: var(--backdrop, blur(20px));
    box-shadow: none;
    color: var(--text-color, white);
  }
  
  .theme-glass .status-bar {
    background: var(--bg-color, rgba(255, 255, 255, 0.1));
    backdrop-filter: var(--backdrop, blur(30px) saturate(180%));
    -webkit-backdrop-filter: var(--backdrop, blur(30px) saturate(180%));
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: var(--shadow, 0 8px 32px 0 rgba(31, 38, 135, 0.37));
    color: var(--text-color, white);
  }
  
  .theme-minimal .status-bar {
    background: transparent;
    box-shadow: none;
    color: var(--text-color, white);
  }
  
  /* Floating mode */
  :host([position="floating"]) .status-bar {
    border-radius: var(--radius, 8px);
  }
  
  /* Content layout */
  .status-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding: 0 8px;
    gap: 8px;
  }
  
  .height-ultra .status-content {
    padding: 0 6px;
    gap: 6px;
  }
  
  /* Position groups */
  .position-left,
  .position-center,
  .position-right {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 100%;
  }
  
  .height-ultra .position-left,
  .height-ultra .position-center,
  .height-ultra .position-right {
    gap: 6px;
  }
  
  .position-left {
    flex: 1;
    justify-content: flex-start;
    min-width: 0;
  }
  
  .position-center {
    flex: 0 0 auto;
    justify-content: center;
  }
  
  .position-right {
    flex: 1;
    justify-content: flex-end;
  }
  
  /* Status elements */
  .status-element {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;
    height: 100%;
  }
  
  .height-ultra .status-element {
    font-size: 11px;
    gap: 2px;
  }
  
  /* Device name */
  .device-name {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: var(--device-max-width, 120px);
  }
  
  /* Time */
  .time-display {
    font-variant-numeric: tabular-nums;
    font-weight: 500;
  }
  
  /* GNSS Status */
  .gnss-status {
    font-weight: 600;
    color: inherit; /* Use default text color (black/white based on theme) */
  }
  
  /* Keep colored status for NO FIX only as a warning */
  .gnss-status.nofix {
    color: #f44336;
  }
  
  /* For transparent themes - white text */
  .theme-transparent .gnss-status,
  .theme-glass .gnss-status,
  .theme-minimal .gnss-status {
    color: inherit;
    text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  }
  
  .theme-transparent .gnss-status.nofix,
  .theme-glass .gnss-status.nofix,
  .theme-minimal .gnss-status.nofix {
    color: #ff6666;
  }
  
  /* Icon color - same as text */
  .gnss-icon {
    color: inherit;
  }
  
  .gnss-icon.nofix {
    color: #f44336;
  }
  
  /* For transparent themes */
  .theme-transparent .gnss-icon,
  .theme-glass .gnss-icon,
  .theme-minimal .gnss-icon {
    color: inherit;
  }
  
  .theme-transparent .gnss-icon.nofix,
  .theme-glass .gnss-icon.nofix,
  .theme-minimal .gnss-icon.nofix {
    color: #ff6666;
  }
  
  /* Accuracy indicator - height adjusts to status bar */
  .accuracy {
    background: var(--accuracy-bg, #4caf50);
    color: var(--accuracy-color, white);
    padding: 0 6px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 11px;
    display: inline-flex;
    align-items: center;
    min-width: 45px;
    text-align: center;
    justify-content: center;
    height: calc(100% - 8px); /* Adjust to status bar height with padding */
    max-height: 24px;
  }
  
  .height-ultra .accuracy {
    padding: 0 4px;
    font-size: 10px;
    min-width: 40px;
    height: calc(100% - 6px);
    max-height: 20px;
  }
  
  /* Enhanced accuracy indicator font sizes for tablets */
  @media (min-width: 769px) and (max-width: 1024px) {
    .accuracy {
      font-size: 16px;
      padding: 0 8px;
      min-width: 60px;
    }
    
    .height-ultra .accuracy {
      font-size: 14px;
      padding: 0 6px;
      min-width: 50px;
    }
  }
  
  @media (min-width: 1025px) {
    .accuracy {
      font-size: 18px;
      padding: 0 10px;
      min-width: 70px;
    }
    
    .height-ultra .accuracy {
      font-size: 16px;
      padding: 0 8px;
      min-width: 60px;
    }
  }
  
  .height-normal .accuracy {
    height: calc(100% - 10px);
    max-height: 28px;
  }
  
  .accuracy.high {
    --accuracy-bg: #4caf50;
  }
  
  .accuracy.medium {
    --accuracy-bg: #ff9800;
  }
  
  .accuracy.low {
    --accuracy-bg: #f44336;
  }
  
  /* Satellites */
  .satellites {
    display: flex;
    align-items: center;
    gap: 2px;
  }
  
  /* Battery */
  .battery {
    display: flex;
    align-items: center;
    gap: 2px;
  }
  
  .battery-bar {
    width: 20px;
    height: 10px;
    border: 1px solid currentColor;
    border-radius: 2px;
    position: relative;
    overflow: hidden;
  }
  
  .battery-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: currentColor;
    transition: width 0.3s;
  }
  
  /* Icons */
  .icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    opacity: 0.8;
  }
  
  .height-ultra .icon {
    width: 12px;
    height: 12px;
  }
  
  /* Expand button */
  .expand-button {
    background: none;
    border: none;
    padding: 4px;
    margin: -4px;
    cursor: pointer;
    color: inherit;
    opacity: 0.6;
    transition: opacity 0.2s;
    touch-action: manipulation;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .expand-button:hover,
  .expand-button:active {
    opacity: 1;
  }
  
  .height-ultra .expand-button {
    padding: 2px;
    margin: -2px;
  }
  
  .expand-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Expand button sizing */
  .expand-button {
    min-width: 24px;
    min-height: 24px;
  }
  
  /* Expanded sections with smooth animation */
  .expanded-sections {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transition: max-height 0.4s ease-out,
                opacity 0.3s ease-out;
    font-size: 13px;
    position: relative;
  }
  
  .expanded-sections-inner {
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    max-height: 50vh;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  }
  
  .expanded-sections-inner::-webkit-scrollbar {
    width: 6px;
  }
  
  .expanded-sections-inner::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .expanded-sections-inner::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  
  .expanded-sections-inner::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
  
  .theme-transparent .expanded-sections,
  .theme-glass .expanded-sections {
    background: var(--expanded-bg, rgba(0, 0, 0, 0.8));
    color: white;
  }
  
  .theme-default .expanded-sections {
    color: #333;
  }
  
  .expanded-sections.visible {
    max-height: 400px;
    opacity: 1;
  }
  
  /* Smooth height transition */
  .status-footer {
    transition: transform 0.3s ease-out;
  }
  
  /* Optional: Push up the whole footer when expanded */
  .status-footer.expanded {
    transform: translateY(-5px);
  }
  
  .expanded-content {
    padding: 12px;
  }
  
  /* Sections */
  .section {
    margin-bottom: 16px;
  }
  
  .section:last-child {
    margin-bottom: 0;
  }
  
  .section-title {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
    opacity: 0.8;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  /* Format switch button */
  .format-switch-btn {
    background: none;
    border: none;
    padding: 4px;
    margin: -4px;
    cursor: pointer;
    color: inherit;
    opacity: 0.6;
    transition: opacity 0.2s;
    touch-action: manipulation;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .format-switch-btn:hover {
    opacity: 1;
  }
  
  .format-switch-btn .icon {
    width: 12px;
    height: 12px;
  }
  
  .section-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
  }
  
  .grid-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .grid-label {
    font-size: 11px;
    opacity: 0.6;
    color: inherit;
  }
  
  .grid-value {
    font-size: 13px;
    font-weight: 500;
    font-family: 'SF Mono', Consolas, monospace;
    color: inherit;
  }
  
  /* Ensure expanded content styling */
  .theme-default .expanded-sections {
    background: rgba(255, 255, 255, 0.95);
    color: #333;
  }
  
  .theme-transparent .expanded-sections,
  .theme-glass .expanded-sections {
    background: rgba(0, 0, 0, 0.85);
    color: white;
  }
  
  .theme-minimal .expanded-sections {
    background: rgba(0, 0, 0, 0.8);
    color: white;
  }
  
  .expanded-sections.visible {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  /* Add subtle shadow animation */
  .status-bar {
    transition: box-shadow 0.3s ease-out;
  }
  
  .expanded .status-bar {
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
  }
  
  /* Auto-hide */
  .auto-hide {
    transform: translateY(calc(100% - 4px));
  }
  
  .auto-hide:hover {
    transform: translateY(0);
  }
  
  /* Responsive */
  @media (max-width: 360px) {
    .status-element span:not(.accuracy):not(.gnss-status) {
      display: none;
    }
    
    .device-name {
      max-width: 80px !important;
    }
  }
  
  /* Text shadows for readability */
  .theme-minimal .status-element,
  .theme-glass.overlay .status-element,
  .theme-transparent .status-element {
    text-shadow: 
      0 0 3px rgba(0, 0, 0, 0.8),
      0 1px 2px rgba(0, 0, 0, 0.9);
  }
  
  /* Icon shadows for readability */
  .theme-minimal .icon,
  .theme-glass.overlay .icon,
  .theme-transparent .icon {
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.8)) 
            drop-shadow(0 1px 1px rgba(0, 0, 0, 0.9));
  }
  
  /* Animations */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  
  .updating {
    animation: pulse 1s infinite;
  }
  
  /* Subtle expand hint animation */
  @keyframes expand-hint {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
  }
  
  /* Temporarily disabled for debugging
  .expand-button .expand-icon {
    animation: expand-hint 2s ease-in-out infinite;
  }
  */
  
  /* Stop animation when expanded */
  .expanded .expand-button .expand-icon {
    animation: none;
  }
  
  /* Touch feedback */
  .status-bar:active {
    transform: scale(0.98);
    transition: transform 0.1s;
  }
  
  /* Prevent animation during active state */
  .status-footer:not(.expanded) .status-bar:active {
    transform: scale(0.98);
  }
  
  .status-footer.expanded .status-bar:active {
    transform: scale(0.98) translateY(-5px);
  }
  
  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
`;
    
    // Icons (from DJI light theme)
    const icons = {
        clock: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
        signal: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></svg>`,
        satellite: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 7 9 3 5 7l4 4"/><path d="m17 11 4 4-4 4-4-4"/><path d="m8 12 4 4 6-6-4-4Z"/><path d="m16 8 3-3"/><path d="M9 21a6 6 0 0 0-6-6"/></svg>`,
        battery: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"/><line x1="23" y1="13" x2="23" y2="11"/></svg>`,
        'chevron-up': `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
        'chevron-down': `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`
    };
    
    // Ultra-thin Status Footer Component
    class UltraThinStatusFooter extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            
            // State
            this.config = JSON.parse(JSON.stringify(defaultConfig));
            this.isExpanded = false;
            this.data = {
                accuracy: { value: '±3.10cm', class: 'high' },
                gnssStatus: { text: 'FIX', class: 'fix' },
                deviceName: 'R2 Plus',
                time: new Date().toLocaleTimeString('en-US', { hour12: false }),
                satellites: 0,
                battery: 85,
                // Extended GNSS data
                position: {
                    latitude: 46.626374,
                    longitude: 14.222974,
                    altitude: 524.38,
                    // Local coordinates
                    x: '5682455.66',
                    y: '4538269.67',
                    z: '524.63 m'
                },
                quality: {
                    hdop: 1.6,
                    pdop: 2.4,
                    speed: 0.2,
                    ntrip: 'Connected',
                    rtcm: 'OK',
                    wifi: 'Connected',
                    tilt: '0.5°'
                },
                deviceInfo: {
                    tiltInfo: 'N/A'
                }
            };
            
            // Coordinate format: 0 = decimal degrees, 1 = degrees minutes, 2 = degrees minutes seconds
            this.currentCoordFormat = 0;
            
            // Touch handling
            this.touchStartY = 0;
            this.touchStartTime = 0;
        }
        
        connectedCallback() {
            this.render();
            this.setupEventListeners();
            this.applyConfiguration();
            
            // Set initial position
            this.setAttribute('position', this.config.style.position);
            
            // Initialize expanded state - let CSS handle this
            // const expanded = this.shadowRoot.querySelector('.expanded-sections');
            // if (expanded) {
            //     expanded.style.maxHeight = '0';
            //     expanded.style.opacity = '0';
            // }
            
            // Load saved state
            if (this.config.behavior.persistState) {
                this.loadState();
            }
            
            // Start time updates
            this.startTimeUpdates();
        }
        
        disconnectedCallback() {
            this.stopTimeUpdates();
            if (this.config.behavior.persistState) {
                this.saveState();
            }
        }
        
        // Configuration
        configure(newConfig) {
            this.config = this.mergeConfig(this.config, newConfig);
            
            // Ensure expand button is visible if expand behavior is enabled
            if (this.config.behavior && (this.config.behavior.expandOnTap || this.config.behavior.swipeToExpand)) {
                if (!this.config.layout.statusBar.expandButton) {
                    this.config.layout.statusBar.expandButton = { visible: true, position: 'right' };
                } else {
                    this.config.layout.statusBar.expandButton.visible = true;
                }
            }
            
            // Log the configuration for debugging
            console.log('[UltraThin] Configuration after merge:', this.config);
            
            this.render();
            this.applyConfiguration();
            this.setupEventListeners();
            
            if (this.config.behavior.persistState) {
                this.saveState();
            }
        }
        
        mergeConfig(base, update) {
            const merged = JSON.parse(JSON.stringify(base));
            
            function deepMerge(target, source) {
                for (const key in source) {
                    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                        if (!target[key]) target[key] = {};
                        deepMerge(target[key], source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }
            
            deepMerge(merged, update);
            return merged;
        }
        
        applyConfiguration() {
            const footer = this.shadowRoot.querySelector('.status-footer');
            const statusBar = this.shadowRoot.querySelector('.status-bar');
            const expanded = this.shadowRoot.querySelector('.expanded-sections');
            
            if (!footer || !statusBar) return;
            
            // Apply theme
            footer.className = `status-footer theme-${this.config.style.theme} height-${this.config.style.height}`;
            
            // Apply custom styles
            if (this.config.style.backgroundColor) {
                statusBar.style.setProperty('--bg-color', this.config.style.backgroundColor);
                expanded?.style.setProperty('--expanded-bg', this.config.style.backgroundColor);
            }
            
            if (this.config.style.textColor) {
                statusBar.style.setProperty('--text-color', this.config.style.textColor);
            }
            
            if (this.config.style.backdropFilter) {
                statusBar.style.setProperty('--backdrop', this.config.style.backdropFilter);
                expanded?.style.setProperty('--expanded-backdrop', this.config.style.backdropFilter);
            }
            
            if (this.config.style.borderRadius) {
                statusBar.style.setProperty('--radius', `${this.config.style.borderRadius}px`);
            }
            
            statusBar.style.setProperty('--shadow', this.config.style.shadow ? null : 'none');
            
            // Apply position
            this.setAttribute('position', this.config.style.position);
            
            // Apply auto-hide
            if (this.config.behavior.autoHide) {
                this.enableAutoHide();
            }
        }
        
        render() {
            const elements = this.buildStatusElements();
            console.log('[UltraThin] Rendering with elements:', elements);
            console.log('[UltraThin] Expand button config:', this.config.layout.statusBar.expandButton);
            
            this.shadowRoot.innerHTML = `
                ${UltraThinStyles}
                <div class="status-footer theme-${this.config.style.theme} height-${this.config.style.height}">
                    <div class="status-bar">
                        <div class="status-content">
                            <div class="position-left">
                                ${elements.left.join('')}
                            </div>
                            <div class="position-center">
                                ${elements.center.join('')}
                            </div>
                            <div class="position-right">
                                ${elements.right.join('')}
                            </div>
                        </div>
                    </div>
                    <div class="expanded-sections">
                        <div class="expanded-sections-inner">
                            <div class="expanded-content">
                                ${this.buildExpandedContent()}
                            </div>
                        </div>
                    </div>
                </div>`;
        }
        
        buildStatusElements() {
            const elements = { left: [], center: [], right: [] };
            const layout = this.config.layout.statusBar;
            
            // Build each element
            for (const [key, config] of Object.entries(layout)) {
                if (!config.visible) continue;
                
                let element = '';
                switch (key) {
                    case 'accuracy':
                        element = this.buildAccuracy(config);
                        break;
                    case 'gnssStatus':
                        element = this.buildGnssStatus(config);
                        break;
                    case 'deviceName':
                        element = this.buildDeviceName(config);
                        break;
                    case 'time':
                        element = this.buildTime(config);
                        break;
                    case 'satellites':
                        element = this.buildSatellites(config);
                        break;
                    case 'battery':
                        element = this.buildBattery(config);
                        break;
                    case 'expandButton':
                        element = this.buildExpandButton(config);
                        break;
                }
                
                if (element) {
                    elements[config.position].push(element);
                }
            }
            
            return elements;
        }
        
        buildAccuracy(config) {
            const { value, class: accuracyClass } = this.data.accuracy;
            return `<div class="status-element">
                <span class="accuracy ${accuracyClass}">${value}</span>
            </div>`;
        }
        
        buildGnssStatus(config) {
            const { text, class: statusClass } = this.data.gnssStatus;
            const iconHtml = icons.signal.replace('class="icon"', `class="icon gnss-icon ${statusClass}"`);
            if (config.format === 'compact') {
                return `<div class="status-element gnss-element">
                    ${iconHtml}
                    <span class="gnss-status ${statusClass}">${text}</span>
                </div>`;
            }
            return `<div class="status-element gnss-element">
                ${iconHtml}
                <span class="gnss-status ${statusClass}">RTK: ${text}</span>
            </div>`;
        }
        
        buildDeviceName(config) {
            return `<div class="status-element device-name" style="--device-max-width: ${config.maxWidth}">
                ${this.data.deviceName}
            </div>`;
        }
        
        buildTime(config) {
            return `<div class="status-element">
                ${icons.clock}
                <span class="time-display">${this.data.time}</span>
            </div>`;
        }
        
        buildSatellites(config) {
            return `<div class="status-element satellites">
                ${config.showIcon ? icons.satellite : ''}
                <span>${this.data.satellites}</span>
            </div>`;
        }
        
        buildBattery(config) {
            const fillWidth = this.data.battery;
            return `<div class="status-element battery">
                <div class="battery-bar">
                    <div class="battery-fill" style="width: ${fillWidth}%"></div>
                </div>
                ${config.showPercentage ? `<span>${fillWidth}%</span>` : ''}
            </div>`;
        }
        
        buildExpandButton(config) {
            if (!config.visible) return '';
            return `<button class="expand-button" type="button" aria-label="Toggle expanded view" aria-expanded="${this.isExpanded}">
                <span class="expand-icon">${this.isExpanded ? icons['chevron-down'] : icons['chevron-up']}</span>
            </button>`;
        }
        
        buildExpandedContent() {
            const sections = [];
            const expanded = this.config.layout.expanded;
            
            console.log('[UltraThin] Building expanded content with config:', expanded);
            console.log('[UltraThin] Current data:', this.data);
            
            if (expanded && expanded.coordinates && expanded.coordinates.visible) {
                sections.push(`
                    <div class="section">
                        <h3 class="section-title">
                            Coordinates
                            <button class="format-switch-btn" type="button" title="Switch coordinate format">
                                ${icons.expand}
                            </button>
                        </h3>
                        <div class="section-grid">
                            <div class="grid-item">
                                <span class="grid-label">Longitude</span>
                                <span class="grid-value longitude" data-raw="${this.data.position.longitude}">${this.formatCoordinate(this.data.position.longitude, this.currentCoordFormat)}</span>
                            </div>
                            <div class="grid-item">
                                <span class="grid-label">Latitude</span>
                                <span class="grid-value latitude" data-raw="${this.data.position.latitude}">${this.formatCoordinate(this.data.position.latitude, this.currentCoordFormat)}</span>
                            </div>
                            <div class="grid-item">
                                <span class="grid-label">Altitude</span>
                                <span class="grid-value altitude">${this.data.position.altitude.toFixed(2)} m</span>
                            </div>
                            <div class="grid-item">
                                <span class="grid-label">X</span>
                                <span class="grid-value x-coord">${this.data.position.x}</span>
                            </div>
                            <div class="grid-item">
                                <span class="grid-label">Y</span>
                                <span class="grid-value y-coord">${this.data.position.y}</span>
                            </div>
                            <div class="grid-item">
                                <span class="grid-label">Z</span>
                                <span class="grid-value z-coord">${this.data.position.z}</span>
                            </div>
                        </div>
                    </div>
                `);
            }
            
            if (expanded && expanded.gnssQuality && expanded.gnssQuality.visible) {
                sections.push(`
                    <div class="section">
                        <h3 class="section-title">GNSS Quality</h3>
                        <div class="section-grid">
                            <div class="grid-item">
                                <span class="grid-label">HDOP/PDOP</span>
                                <span class="grid-value hdop-pdop">${this.data.quality.hdop} / ${this.data.quality.pdop}</span>
                            </div>
                            <div class="grid-item">
                                <span class="grid-label">Satellites</span>
                                <span class="grid-value satellites-count">${this.data.satellites}</span>
                            </div>
                            <div class="grid-item">
                                <span class="grid-label">Speed</span>
                                <span class="grid-value speed">${this.data.quality.speed} m/s</span>
                            </div>
                            <div class="grid-item">
                                <span class="grid-label">NTRIP</span>
                                <span class="grid-value ntrip-status">${this.data.quality.ntrip}</span>
                            </div>
                            <div class="grid-item">
                                <span class="grid-label">RTCM</span>
                                <span class="grid-value rtcm-status">${this.data.quality.rtcm}</span>
                            </div>
                            <div class="grid-item">
                                <span class="grid-label">WiFi</span>
                                <span class="grid-value wifi-status">${this.data.quality.wifi}</span>
                            </div>
                            <div class="grid-item">
                                <span class="grid-label">Tilt</span>
                                <span class="grid-value tilt">${this.data.quality.tilt}</span>
                            </div>
                        </div>
                    </div>
                `);
            }
            
            if (expanded && expanded.deviceInfo && expanded.deviceInfo.visible) {
                sections.push(`
                    <div class="section">
                        <h3 class="section-title">Device Info (v5-rtk)</h3>
                        <div class="section-grid">
                            <div class="grid-item">
                                <span class="grid-label">Tilt</span>
                                <span class="grid-value tilt-info">${this.data.deviceInfo.tiltInfo || 'N/A'}</span>
                            </div>
                            <div class="grid-item">
                                <span class="grid-label">Battery</span>
                                <span class="grid-value battery-info">${this.data.battery}%</span>
                            </div>
                        </div>
                    </div>
                `);
            }
            
            const result = sections.join('');
            console.log('[UltraThin] Expanded content sections:', sections.length);
            console.log('[UltraThin] Expanded content HTML length:', result.length);
            return result;
        }
        
        setupEventListeners() {
            // Remove any existing event listeners first
            if (this._clickHandler) {
                this.shadowRoot.removeEventListener('click', this._clickHandler);
            }
            
            // Create new click handler
            this._clickHandler = (e) => {
                const expandButton = e.target.closest('.expand-button');
                const statusBar = e.target.closest('.status-bar');
                const formatButton = e.target.closest('.format-switch-btn');
                
                if (formatButton) {
                    e.stopPropagation();
                    this.switchCoordinateFormat();
                } else if (expandButton) {
                    e.stopPropagation();
                    console.log('[UltraThin] Expand button clicked');
                    this.toggleExpanded();
                } else if (statusBar && this.config.behavior.expandOnTap) {
                    console.log('[UltraThin] Status bar clicked');
                    this.toggleExpanded();
                }
            };
            
            // Add event listener to shadow root for delegation
            this.shadowRoot.addEventListener('click', this._clickHandler);
            
            // Touch handlers
            const statusBar = this.shadowRoot.querySelector('.status-bar');
            if (this.config.behavior.swipeToExpand && statusBar) {
                if (this._touchStartHandler) {
                    statusBar.removeEventListener('touchstart', this._touchStartHandler);
                    statusBar.removeEventListener('touchend', this._touchEndHandler);
                }
                
                this._touchStartHandler = this.handleTouchStart.bind(this);
                this._touchEndHandler = this.handleTouchEnd.bind(this);
                
                statusBar.addEventListener('touchstart', this._touchStartHandler, { passive: true });
                statusBar.addEventListener('touchend', this._touchEndHandler, { passive: true });
            }
        }
        
        handleTouchStart(e) {
            this.touchStartY = e.touches[0].clientY;
            this.touchStartTime = Date.now();
        }
        
        handleTouchEnd(e) {
            const touchEndY = e.changedTouches[0].clientY;
            const touchDuration = Date.now() - this.touchStartTime;
            const swipeDistance = this.touchStartY - touchEndY;
            
            if (touchDuration < 300) {
                if (swipeDistance > 50 && !this.isExpanded) {
                    this.toggleExpanded();
                } else if (swipeDistance < -50 && this.isExpanded) {
                    this.toggleExpanded();
                }
            }
        }
        
        toggleExpanded() {
            console.log('[UltraThin] toggleExpanded called, current state:', this.isExpanded);
            this.isExpanded = !this.isExpanded;
            
            const footer = this.shadowRoot.querySelector('.status-footer');
            const expanded = this.shadowRoot.querySelector('.expanded-sections');
            const button = this.shadowRoot.querySelector('.expand-button .expand-icon');
            
            console.log('[UltraThin] Expanded element found:', !!expanded);
            
            if (expanded) {
                // Use class toggle for smooth CSS transitions
                expanded.classList.toggle('visible', this.isExpanded);
                
                // Add expanded class to footer for additional styling
                if (footer) {
                    footer.classList.toggle('expanded', this.isExpanded);
                }
                
                // Update button icon
                if (button) {
                    button.innerHTML = this.isExpanded ? icons['chevron-down'] : icons['chevron-up'];
                }
                
                console.log('[UltraThin]', this.isExpanded ? 'Expanding' : 'Collapsing', 'sections');
                
                // If expanding, update all expanded section data with current values
                if (this.isExpanded) {
                    this.refreshExpandedData();
                }
            }
            
            if (this.config.behavior.hapticFeedback && navigator.vibrate) {
                navigator.vibrate(10);
            }
            
            this.dispatchEvent(new CustomEvent('toggle', { 
                detail: { expanded: this.isExpanded } 
            }));
        }
        
        // Data update methods
        updateAccuracy(value, accuracyClass = 'medium') {
            this.data.accuracy = { value, class: accuracyClass };
            const elem = this.shadowRoot.querySelector('.accuracy');
            if (elem) {
                elem.textContent = value;
                elem.className = `accuracy ${accuracyClass}`;
            }
        }
        
        updateGnssStatus(text, statusClass = 'fix') {
            this.data.gnssStatus = { text, class: statusClass };
            const elem = this.shadowRoot.querySelector('.gnss-status');
            if (elem) {
                const format = this.config.layout.statusBar.gnssStatus.format;
                elem.textContent = format === 'compact' ? text : `RTK: ${text}`;
                elem.className = `gnss-status ${statusClass}`;
            }
        }
        
        updateDeviceName(name) {
            this.data.deviceName = name;
            const elem = this.shadowRoot.querySelector('.device-name');
            if (elem) elem.textContent = name;
        }
        
        updateSatellites(count) {
            console.log('[StatusFooter] Updating satellites to:', count);
            this.data.satellites = count;
            const elem = this.shadowRoot.querySelector('.satellites span');
            if (elem) elem.textContent = count;
            
            // Also update in expanded view
            const expandedElem = this.shadowRoot.querySelector('.satellites-count');
            if (expandedElem) expandedElem.textContent = count;
        }
        
        updateBattery(percentage) {
            this.data.battery = percentage;
            const fill = this.shadowRoot.querySelector('.battery-fill');
            const text = this.shadowRoot.querySelector('.battery span');
            if (fill) fill.style.width = `${percentage}%`;
            if (text) text.textContent = `${percentage}%`;
        }
        
        updatePosition(lat, lon, alt) {
            // Convenience method that calls updateCoordinates
            this.updateCoordinates(lat, lon, alt);
        }
        
        updateCoordinates(lat, lon, alt, localCoords = null) {
            // Parse numeric values from strings if needed
            if (typeof lat === 'string') {
                lat = parseFloat(lat.replace(/°/g, '').trim());
            }
            if (typeof lon === 'string') {
                lon = parseFloat(lon.replace(/°/g, '').trim());
            }
            if (typeof alt === 'string') {
                alt = parseFloat(alt.replace(/[^\d.-]/g, '').trim());
            }
            
            // Update internal data with numeric values
            this.data.position.latitude = lat;
            this.data.position.longitude = lon;
            this.data.position.altitude = alt;
            
            if (localCoords) {
                this.data.position.x = localCoords.x || this.data.position.x;
                this.data.position.y = localCoords.y || this.data.position.y;
                this.data.position.z = localCoords.z || this.data.position.z;
            }
            
            // Only update DOM elements if expanded
            if (this.isExpanded) {
                const latElem = this.shadowRoot.querySelector('.latitude');
                const lonElem = this.shadowRoot.querySelector('.longitude');
                const altElem = this.shadowRoot.querySelector('.altitude');
                
                if (latElem) {
                    latElem.setAttribute('data-raw', lat);
                    latElem.textContent = this.formatCoordinate(lat, this.currentCoordFormat);
                }
                if (lonElem) {
                    lonElem.setAttribute('data-raw', lon);
                    lonElem.textContent = this.formatCoordinate(lon, this.currentCoordFormat);
                }
                if (altElem && !isNaN(alt)) {
                    altElem.textContent = `${alt.toFixed(2)} m`;
                }
                
                // Update local coordinates
                if (localCoords) {
                    const xElem = this.shadowRoot.querySelector('.x-coord');
                    const yElem = this.shadowRoot.querySelector('.y-coord');
                    const zElem = this.shadowRoot.querySelector('.z-coord');
                    
                    if (xElem) xElem.textContent = localCoords.x || this.data.position.x;
                    if (yElem) yElem.textContent = localCoords.y || this.data.position.y;
                    if (zElem) zElem.textContent = localCoords.z || this.data.position.z;
                }
            }
        }
        
        // Switch coordinate format
        switchCoordinateFormat() {
            this.currentCoordFormat = (this.currentCoordFormat + 1) % 3;
            console.log('[UltraThin] Switching to format:', this.currentCoordFormat);
            
            // Update all coordinate displays
            const lonElem = this.shadowRoot.querySelector('.longitude');
            const latElem = this.shadowRoot.querySelector('.latitude');
            
            if (lonElem && lonElem.hasAttribute('data-raw')) {
                const rawLon = parseFloat(lonElem.getAttribute('data-raw'));
                lonElem.textContent = this.formatCoordinate(rawLon, this.currentCoordFormat);
            }
            
            if (latElem && latElem.hasAttribute('data-raw')) {
                const rawLat = parseFloat(latElem.getAttribute('data-raw'));
                latElem.textContent = this.formatCoordinate(rawLat, this.currentCoordFormat);
            }
            
            // Save preference
            if (this.config.behavior.persistState) {
                this.saveState();
            }
        }
        
        // Format coordinate based on selected format
        formatCoordinate(decimal, format) {
            // Handle string inputs that might contain degree symbols
            if (typeof decimal === 'string') {
                decimal = parseFloat(decimal.replace(/°/g, '').trim());
            }
            
            // Ensure decimal is a valid number
            if (typeof decimal !== 'number' || isNaN(decimal)) {
                console.warn('[StatusFooterUltraThin] Invalid coordinate value:', decimal);
                return '0.000000°';
            }
            
            const degrees = Math.floor(Math.abs(decimal));
            const minutesDecimal = (Math.abs(decimal) - degrees) * 60;
            const minutes = Math.floor(minutesDecimal);
            const seconds = (minutesDecimal - minutes) * 60;
            
            switch (format) {
                case 1: // Degrees Minutes
                    return `${decimal < 0 ? '-' : ''}${degrees}° ${minutes.toFixed(3)}'`;
                case 2: // Degrees Minutes Seconds
                    return `${decimal < 0 ? '-' : ''}${degrees}° ${minutes}' ${seconds.toFixed(1)}"`;
                default: // Decimal Degrees
                    return `${decimal.toFixed(6)}°`;
            }
        }
        
        // Add methods for updating GNSS quality data
        updateGNSSQuality(data) {
            // Always update internal data
            if (data.hdop !== undefined) this.data.quality.hdop = data.hdop;
            if (data.pdop !== undefined) this.data.quality.pdop = data.pdop;
            if (data.speed !== undefined) this.data.quality.speed = data.speed;
            if (data.ntrip !== undefined) this.data.quality.ntrip = data.ntrip;
            if (data.rtcm !== undefined) this.data.quality.rtcm = data.rtcm;
            if (data.wifi !== undefined) this.data.quality.wifi = data.wifi;
            if (data.tilt !== undefined) this.data.quality.tilt = data.tilt;
            
            // Only update DOM if expanded
            if (this.isExpanded) {
                const hdopElem = this.shadowRoot.querySelector('.hdop-pdop');
                if (hdopElem) hdopElem.textContent = `${this.data.quality.hdop} / ${this.data.quality.pdop}`;
                
                const speedElem = this.shadowRoot.querySelector('.speed');
                if (speedElem) speedElem.textContent = `${this.data.quality.speed} m/s`;
                
                const ntripElem = this.shadowRoot.querySelector('.ntrip-status');
                if (ntripElem) ntripElem.textContent = this.data.quality.ntrip;
                
                const rtcmElem = this.shadowRoot.querySelector('.rtcm-status');
                if (rtcmElem) rtcmElem.textContent = this.data.quality.rtcm;
                
                const wifiElem = this.shadowRoot.querySelector('.wifi-status');
                if (wifiElem) wifiElem.textContent = this.data.quality.wifi;
                
                const tiltElem = this.shadowRoot.querySelector('.tilt');
                if (tiltElem) tiltElem.textContent = this.data.quality.tilt;
            }
        }
        
        updateTiltStatus(calibrated, angle = 0) {
            // Update tilt status in the quality data
            const tiltText = calibrated ? `Calibrated (${angle.toFixed(1)}°)` : 'Uncalibrated';
            this.data.quality.tilt = tiltText;
            
            // Update DOM if expanded
            if (this.isExpanded) {
                const tiltElem = this.shadowRoot.querySelector('.tilt');
                if (tiltElem) tiltElem.textContent = tiltText;
            }
        }
        
        updateDeviceInfo(data) {
            // Always update internal data
            if (data.tiltInfo !== undefined) this.data.deviceInfo.tiltInfo = data.tiltInfo;
            if (data.batteryPercentage !== undefined) this.data.battery = data.batteryPercentage;
            
            // Only update DOM if expanded
            if (this.isExpanded) {
                const tiltElem = this.shadowRoot.querySelector('.tilt-info');
                if (tiltElem) tiltElem.textContent = this.data.deviceInfo.tiltInfo || 'N/A';
                
                // Also update battery info if available
                const batteryElem = this.shadowRoot.querySelector('.battery-info');
                if (batteryElem) batteryElem.textContent = `${this.data.battery}%`;
            }
        }
        
        // Time updates
        startTimeUpdates() {
            this.updateTime();
            this.timeInterval = setInterval(() => this.updateTime(), 1000);
        }
        
        stopTimeUpdates() {
            if (this.timeInterval) {
                clearInterval(this.timeInterval);
                this.timeInterval = null;
            }
        }
        
        updateTime() {
            const format = this.config.layout.statusBar.time?.format || '24h';
            const options = { 
                hour12: format === '12h',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            
            this.data.time = new Date().toLocaleTimeString('en-US', options);
            const elem = this.shadowRoot.querySelector('.time-display');
            if (elem) elem.textContent = this.data.time;
        }
        
        // Auto-hide functionality
        enableAutoHide() {
            let hideTimer;
            const footer = this.shadowRoot.querySelector('.status-footer');
            
            const startHideTimer = () => {
                clearTimeout(hideTimer);
                hideTimer = setTimeout(() => {
                    footer.classList.add('auto-hide');
                }, this.config.behavior.autoHideDelay);
            };
            
            const cancelHideTimer = () => {
                clearTimeout(hideTimer);
                footer.classList.remove('auto-hide');
                startHideTimer();
            };
            
            footer.addEventListener('mouseenter', cancelHideTimer);
            footer.addEventListener('touchstart', cancelHideTimer);
            
            startHideTimer();
        }
        
        // Refresh expanded data when opened
        refreshExpandedData() {
            // Update coordinates
            const latElem = this.shadowRoot.querySelector('.latitude');
            const lonElem = this.shadowRoot.querySelector('.longitude');
            const altElem = this.shadowRoot.querySelector('.altitude');
            
            if (latElem && this.data.position.latitude !== undefined) {
                latElem.setAttribute('data-raw', this.data.position.latitude);
                latElem.textContent = this.formatCoordinate(this.data.position.latitude, this.currentCoordFormat);
            }
            if (lonElem && this.data.position.longitude !== undefined) {
                lonElem.setAttribute('data-raw', this.data.position.longitude);
                lonElem.textContent = this.formatCoordinate(this.data.position.longitude, this.currentCoordFormat);
            }
            if (altElem && this.data.position.altitude !== undefined) {
                altElem.textContent = `${this.data.position.altitude.toFixed(2)} m`;
            }
            
            // Update local coordinates
            const xElem = this.shadowRoot.querySelector('.x-coord');
            const yElem = this.shadowRoot.querySelector('.y-coord');
            const zElem = this.shadowRoot.querySelector('.z-coord');
            
            if (xElem) xElem.textContent = this.data.position.x;
            if (yElem) yElem.textContent = this.data.position.y;
            if (zElem) zElem.textContent = this.data.position.z;
            
            // Update GNSS quality
            const hdopElem = this.shadowRoot.querySelector('.hdop-pdop');
            if (hdopElem) hdopElem.textContent = `${this.data.quality.hdop} / ${this.data.quality.pdop}`;
            
            const speedElem = this.shadowRoot.querySelector('.speed');
            if (speedElem) speedElem.textContent = `${this.data.quality.speed} m/s`;
            
            const ntripElem = this.shadowRoot.querySelector('.ntrip-status');
            if (ntripElem) ntripElem.textContent = this.data.quality.ntrip;
            
            const rtcmElem = this.shadowRoot.querySelector('.rtcm-status');
            if (rtcmElem) rtcmElem.textContent = this.data.quality.rtcm;
            
            const wifiElem = this.shadowRoot.querySelector('.wifi-status');
            if (wifiElem) wifiElem.textContent = this.data.quality.wifi;
            
            const tiltElem = this.shadowRoot.querySelector('.tilt');
            if (tiltElem) tiltElem.textContent = this.data.quality.tilt;
            
            // Update satellite count
            const satElem = this.shadowRoot.querySelector('.satellites-count');
            if (satElem) satElem.textContent = this.data.satellites;
            
            // Update device info
            const tiltInfoElem = this.shadowRoot.querySelector('.tilt-info');
            if (tiltInfoElem) tiltInfoElem.textContent = this.data.deviceInfo.tiltInfo || 'N/A';
            
            const batteryElem = this.shadowRoot.querySelector('.battery-info');
            if (batteryElem) batteryElem.textContent = `${this.data.battery}%`;
        }
        
        // State persistence
        saveState() {
            const state = {
                expanded: this.isExpanded,
                config: this.config,
                coordFormat: this.currentCoordFormat
            };
            localStorage.setItem('ultraThinFooterState', JSON.stringify(state));
        }
        
        loadState() {
            try {
                const saved = localStorage.getItem('ultraThinFooterState');
                if (saved) {
                    const state = JSON.parse(saved);
                    if (state.expanded) {
                        this.toggleExpanded();
                    }
                    if (state.coordFormat !== undefined) {
                        this.currentCoordFormat = state.coordFormat;
                    }
                    // Don't load config on init to allow programmatic config
                }
            } catch (e) {
                console.error('Failed to load state:', e);
            }
        }
    }
    
    // Register component
    customElements.define('status-footer-ultrathin', UltraThinStatusFooter);
    
    // Export for use
    window.UltraThinStatusFooter = UltraThinStatusFooter;
    
    console.log('[StatusFooterUltraThin] Component registered');
})();