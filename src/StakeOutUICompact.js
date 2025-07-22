// StakeOutUICompact.js - Redesigned compact stakeout UI
class StakeOutUICompact {
  constructor() {
    this.widget = null;
    this.isExpanded = false;
    this.isDragging = false;
    this.navigationMode = "segments";
    this.lastTouchY = 0;
    this.dragOffset = { x: 0, y: 0 };
    this.currentPosition = { x: null, y: null };
    
    // Get saved navigation mode
    if (typeof App !== "undefined" && App.Core && App.Core.State) {
      this.navigationMode = App.Core.State.get("stakeout.navigationMode") || "segments";
    }
  }

  // Create the main widget container
  createWidget() {
    // Check if widget already exists in DOM
    const existingWidget = document.getElementById("stakeout-widget");
    if (existingWidget) {
      console.log("[StakeOutUI] Widget already exists, using existing one");
      this.widget = existingWidget;
      return this.widget;
    }
    
    if (this.widget && document.body.contains(this.widget)) {
      console.log("[StakeOutUI] Widget reference exists and is in DOM");
      return this.widget;
    }

    console.log("[StakeOutUI] Creating new widget");
    // Main container
    this.widget = document.createElement("div");
    this.widget.id = "stakeout-widget";
    this.widget.className = "stakeout-widget";
    
    // Apply styles
    this.applyWidgetStyles();
    
    // Create widget content
    this.widget.innerHTML = `
      <div class="stakeout-handle" id="stakeout-handle">
        <div class="handle-bar"></div>
      </div>
      
      <div class="stakeout-compact-view">
        <!-- Total distance -->
        <div class="stakeout-total-distance">
          <span class="distance-label" data-i18n="stakeout.totalDistance">Total:</span>
          <span class="distance-value" id="stakeout-distance">0.00</span>
          <span class="distance-unit">m</span>
        </div>
        
        <!-- Quick mode toggle and stop button -->
        <div class="stakeout-quick-mode-toggle">
          <button class="quick-mode-button" id="quick-mode-toggle" title="Toggle Navigation Mode" data-i18n-title="stakeout.navigationMode">
            <svg width="16" height="16" viewBox="0 0 20 20" id="mode-icon">
              <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="2"/>
              <circle cx="10" cy="10" r="2" fill="currentColor"/>
            </svg>
            <span class="mode-text" id="mode-text" data-i18n="stakeout.segments">Segments</span>
          </button>
          <button class="stop-button" id="stakeout-stop" title="Stop StakeOut">
            <svg width="16" height="16" viewBox="0 0 20 20">
              <rect x="4" y="4" width="12" height="12" fill="currentColor"/>
            </svg>
          </button>
        </div>
        
        <!-- Three directional arrows -->
        <div class="stakeout-arrows-grid">
          <!-- X Arrow (East/West) -->
          <div class="arrow-item">
            <svg class="directional-arrow" id="arrow-x" width="50" height="50" viewBox="0 0 50 50">
              <defs>
                <filter id="arrow-glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <g transform="translate(25, 25)">
                <path d="M 0,-18 L 8,-8 L 4,-8 L 4,10 L -4,10 L -4,-8 L -8,-8 Z" 
                      fill="currentColor" 
                      stroke="rgba(255, 255, 255, 0.8)" 
                      stroke-width="1.5"
                      filter="url(#arrow-glow)"/>
              </g>
            </svg>
            <div class="arrow-info">
              <span class="arrow-label">X:</span>
              <span class="arrow-value" id="stakeout-x">--</span>
            </div>
          </div>
          
          <!-- Y Arrow (North/South) -->
          <div class="arrow-item">
            <svg class="directional-arrow" id="arrow-y" width="50" height="50" viewBox="0 0 50 50">
              <g transform="translate(25, 25)">
                <path d="M 0,-18 L 8,-8 L 4,-8 L 4,10 L -4,10 L -4,-8 L -8,-8 Z" 
                      fill="currentColor" 
                      stroke="rgba(255, 255, 255, 0.8)" 
                      stroke-width="1.5"
                      filter="url(#arrow-glow)"/>
              </g>
            </svg>
            <div class="arrow-info">
              <span class="arrow-label">Y:</span>
              <span class="arrow-value" id="stakeout-y">--</span>
            </div>
          </div>
          
          <!-- Z Arrow (Up/Down) -->
          <div class="arrow-item">
            <svg class="directional-arrow" id="arrow-z" width="50" height="50" viewBox="0 0 50 50">
              <g transform="translate(25, 25)">
                <path d="M 0,-18 L 8,-8 L 4,-8 L 4,10 L -4,10 L -4,-8 L -8,-8 Z" 
                      fill="currentColor" 
                      stroke="rgba(255, 255, 255, 0.8)" 
                      stroke-width="1.5"
                      filter="url(#arrow-glow)"/>
              </g>
            </svg>
            <div class="arrow-info">
              <span class="arrow-label">Z:</span>
              <span class="arrow-value" id="stakeout-z">--</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="stakeout-expanded-view" style="display: none;">
        <!-- Mode toggle -->
        <div class="stakeout-mode-section">
          <label class="mode-label" data-i18n="stakeout.navigationMode">Navigation Mode</label>
          <div class="mode-toggle-wrapper">
            <button class="mode-button" id="mode-segments" data-mode="segments">
              <svg width="20" height="20" viewBox="0 0 20 20">
                <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="2"/>
                <circle cx="10" cy="10" r="2" fill="currentColor"/>
              </svg>
              <span data-i18n="stakeout.segments">Segments</span>
            </button>
            <button class="mode-button" id="mode-nodes" data-mode="nodes">
              <svg width="20" height="20" viewBox="0 0 20 20">
                <circle cx="5" cy="5" r="3" fill="currentColor"/>
                <circle cx="15" cy="5" r="3" fill="currentColor"/>
                <circle cx="15" cy="15" r="3" fill="currentColor"/>
                <circle cx="5" cy="15" r="3" fill="currentColor"/>
              </svg>
              <span data-i18n="stakeout.nodes">Nodes</span>
            </button>
          </div>
        </div>
        
        <!-- Additional info -->
        <div class="stakeout-info-section">
          <div class="info-item">
            <span class="info-label">Accuracy:</span>
            <span class="info-value" id="stakeout-accuracy">--</span>
          </div>
          <div class="info-item" id="node-info" style="display: none;">
            <span class="info-label">Node:</span>
            <span class="info-value" id="stakeout-node">--</span>
          </div>
        </div>
      </div>
    `;
    
    // Remove any existing widgets first
    const oldWidgets = document.querySelectorAll("#stakeout-widget");
    oldWidgets.forEach(w => {
      if (w !== this.widget) {
        console.log("[StakeOutUI] Removing old widget");
        w.remove();
      }
    });
    
    // Add to document
    document.body.appendChild(this.widget);
    
    // Set up event handlers
    this.setupEventHandlers();
    
    // Set initial mode
    this.setMode(this.navigationMode);
    
    // Add mutation observer to debug value changes
    if (window.debugStakeOut) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'characterData' || mutation.type === 'childList') {
            const target = mutation.target;
            if (target.id && target.id.includes('stakeout')) {
              console.warn(`[StakeOutUI] Mutation detected on ${target.id}: ${mutation.oldValue} -> ${target.textContent}`);
              console.trace();
            }
          }
        });
      });
      
      ['stakeout-distance', 'stakeout-x', 'stakeout-y', 'stakeout-z'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          observer.observe(el, { 
            characterData: true, 
            childList: true, 
            subtree: true,
            characterDataOldValue: true 
          });
        }
      });
    }
    
    console.log("StakeOut widget created with mode:", this.navigationMode);
    
    return this.widget;
  }

  // Apply widget styles
  applyWidgetStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .stakeout-widget {
        position: fixed;
        bottom: 60px; /* Position above footer */
        left: 50%;
        transform: translateX(-50%);
        width: min(450px, 95vw);
        background: rgba(var(--ml-c-bg-1), 0.5);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        color: rgb(var(--ml-c-icon-1));
        font-family: system-ui, -apple-system, sans-serif;
        z-index: 1001; /* Above footer which is at 1000 */
        transition: height 0.3s ease;
        height: 180px; /* Increased to fit content */
        overflow: hidden;
        box-shadow: var(--ml-shadow);
      }
      
      .stakeout-widget.expanded {
        height: 340px; /* Increased for expanded content */
      }
      
      /* Handle for expanding/collapsing */
      .stakeout-handle {
        height: 30px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        touch-action: pan-y;
        -webkit-tap-highlight-color: transparent;
      }
      
      .stakeout-handle:hover {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .stakeout-handle:active {
        cursor: grabbing;
      }
      
      .stakeout-widget.dragging {
        cursor: grabbing !important;
        transition: none !important;
      }
      
      .handle-bar {
        width: 40px;
        height: 4px;
        background: rgb(var(--ml-c-bg-3));
        border-radius: 2px;
      }
      
      /* Compact view */
      .stakeout-compact-view {
        padding: 10px 15px;
        display: flex;
        flex-direction: column;
        height: calc(100% - 30px); /* Account for handle height */
      }
      
      /* Quick mode toggle */
      .stakeout-quick-mode-toggle {
        position: absolute;
        top: 35px;
        right: 15px;
        z-index: 10;
        display: flex;
        gap: 8px;
      }
      
      .quick-mode-button {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: rgb(var(--ml-c-bg-2));
        border: 1px solid rgb(var(--ml-c-bg-3));
        border-radius: 15px;
        color: rgb(var(--ml-c-icon-1));
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        -webkit-appearance: none;
        appearance: none;
        outline: none;
      }
      
      .quick-mode-button:hover {
        background: rgb(var(--ml-c-bg-2));
        color: rgb(var(--ml-c-icon-2));
      }
      
      .quick-mode-button svg {
        flex-shrink: 0;
      }
      
      .mode-text {
        font-weight: 500;
      }
      
      .stop-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        background: rgba(var(--ml-c-error), 0.2);
        border: 1px solid rgba(var(--ml-c-error), 0.4);
        border-radius: 15px;
        color: rgb(var(--ml-c-error));
        cursor: pointer;
        transition: all 0.2s;
        -webkit-appearance: none;
        appearance: none;
        outline: none;
      }
      
      .stop-button:hover {
        background: rgba(var(--ml-c-error), 0.3);
      }
      
      /* Total distance display */
      .stakeout-total-distance {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 8px;
        margin-bottom: 15px;
        font-size: 24px;
        font-weight: bold;
      }
      
      .distance-label {
        opacity: 0.7;
        font-size: 18px;
      }
      
      .distance-value {
        color: rgb(var(--ml-c-active));
        text-shadow: 0 0 10px rgba(var(--ml-c-active), 0.5);
        font-size: 28px;
      }
      
      .distance-unit {
        opacity: 0.8;
        font-size: 18px;
      }
      
      /* Three arrows grid */
      .stakeout-arrows-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        flex: 1;
        align-items: center;
        padding-bottom: 10px; /* Add padding to prevent text cutoff */
      }
      
      .arrow-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
      }
      
      .directional-arrow {
        display: block;
        transition: transform 0.3s ease;
        color: rgb(var(--ml-c-active));
      }
      
      .arrow-info {
        display: flex;
        align-items: baseline;
        gap: 5px;
        font-size: 14px;
      }
      
      .arrow-label {
        opacity: 0.7;
        font-weight: 600;
      }
      
      .arrow-value {
        font-weight: 500;
        color: rgb(var(--ml-c-active));
      }
      
      /* Expanded view */
      .stakeout-expanded-view {
        padding: 20px;
        border-top: 1px solid rgb(var(--ml-c-bg-3));
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .stakeout-mode-section {
        margin-bottom: 20px;
      }
      
      .mode-label {
        display: block;
        font-size: 12px;
        opacity: 0.6;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .mode-toggle-wrapper {
        display: flex;
        gap: 10px;
      }
      
      .mode-button {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px;
        background: rgba(var(--ml-c-bg-2), 0.5);
        border: 2px solid rgba(var(--ml-c-bg-3), 0.5);
        border-radius: 10px;
        color: rgb(var(--ml-c-icon-1));
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
        -webkit-appearance: none;
        appearance: none;
        outline: none;
      }
      
      .mode-button:hover {
        background: rgba(var(--ml-c-bg-2), 0.8);
      }
      
      .mode-button.active {
        background: rgba(var(--ml-c-active), 0.2);
        border-color: rgb(var(--ml-c-active));
        color: rgb(var(--ml-c-active));
      }
      
      .mode-button svg {
        flex-shrink: 0;
      }
      
      .stakeout-info-section {
        display: flex;
        gap: 30px;
      }
      
      .info-item {
        display: flex;
        gap: 10px;
        font-size: 14px;
      }
      
      .info-label {
        opacity: 0.6;
      }
      
      /* Responsive adjustments */
      @media (max-width: 480px) {
        .stakeout-widget {
          width: 100%;
          border-radius: 20px;
          bottom: 60px; /* Ensure it stays above footer on mobile */
        }
        
        .stakeout-total-distance {
          font-size: 20px;
          margin-bottom: 10px;
        }
        
        .distance-value {
          font-size: 24px;
        }
        
        .directional-arrow {
          width: 40px;
          height: 40px;
        }
        
        .arrow-info {
          font-size: 12px;
        }
      }
      
      /* Landscape mode adjustments */
      @media (orientation: landscape) and (max-height: 500px) {
        .stakeout-widget {
          height: 140px; /* Increased to fit content */
          bottom: 40px; /* Less space needed in landscape */
        }
        
        .stakeout-widget.expanded {
          height: 300px; /* Increased for expanded content */
        }
        
        .stakeout-compact-view {
          padding: 5px 15px;
        }
        
        .stakeout-total-distance {
          margin-bottom: 8px;
          font-size: 20px;
        }
        
        .distance-value {
          font-size: 24px;
        }
        
        .directional-arrow {
          width: 35px;
          height: 35px;
        }
        
        .arrow-info {
          font-size: 12px;
        }
        
        .stakeout-arrows-grid {
          gap: 10px;
        }
      }
      
      /* Transition classes */
      .stakeout-widget.transitioning {
        transition: none;
      }
      
      /* Ensure text is visible */
      .distance-value,
      .arrow-value {
        position: relative;
        z-index: 1;
      }
    `;
    
    document.head.appendChild(style);
  }

  // Set up event handlers
  setupEventHandlers() {
    const handle = document.getElementById("stakeout-handle");
    
    if (handle) {
      // Touch events for mobile
      handle.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: true });
      handle.addEventListener("touchmove", this.handleTouchMove.bind(this), { passive: false });
      handle.addEventListener("touchend", this.handleTouchEnd.bind(this));
      
      // Mouse events for desktop
      handle.addEventListener("mousedown", this.handleMouseDown.bind(this));
      document.addEventListener("mousemove", this.handleMouseMove.bind(this));
      document.addEventListener("mouseup", this.handleMouseUp.bind(this));
      
      // Double click to toggle expand
      handle.addEventListener("dblclick", this.toggleExpanded.bind(this));
      
      console.log("Handle event listeners attached");
    }
    
    // Restore saved position if available
    if (typeof App !== "undefined" && App.Core && App.Core.State) {
      const savedPosition = App.Core.State.get("stakeout.position");
      if (savedPosition && savedPosition.x !== null) {
        this.widget.style.left = savedPosition.x + 'px';
        this.widget.style.top = savedPosition.y + 'px';
        this.widget.style.transform = 'translateX(-50%)';
        this.widget.style.bottom = 'auto';
        this.currentPosition = savedPosition;
      }
    }
    
    // Mode buttons - use event delegation since they might not exist yet
    this.widget.addEventListener("click", (e) => {
      try {
        // Handle quick mode toggle
        if (e.target.closest("#quick-mode-toggle")) {
          e.preventDefault();
          e.stopPropagation();
          
          const currentMode = this.navigationMode;
          let newMode;
          // Cycle through three modes: segments -> lines -> nodes -> segments
          if (currentMode === "segments") {
            newMode = "lines";
          } else if (currentMode === "lines") {
            newMode = "nodes";
          } else {
            newMode = "segments";
          }
          console.log("[StakeOutUI] Quick toggle mode from", currentMode, "to", newMode);
          this.setMode(newMode);
          
          // Notify stakeout module
          if (typeof App !== "undefined" && App.Features && App.Features.StakeOut && App.Features.StakeOut.setNavigationMode) {
            console.log("[StakeOutUI] Notifying StakeOut of mode change");
            App.Features.StakeOut.setNavigationMode(newMode);
          }
          return;
        }
      } catch (error) {
        console.error("[StakeOutUI] Error handling mode toggle:", error);
      }
      
      // Handle stop button
      if (e.target.closest("#stakeout-stop")) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log("[StakeOutUI] Stop button clicked");
        if (typeof App !== "undefined" && App.Features && App.Features.StakeOut) {
          App.Features.StakeOut.cleanup();
        }
        
        // Update Dynamic Button mode back to default
        if (typeof App !== "undefined" && App.UI && App.UI.DynamicButton) {
          console.log("[StakeOutUI] Resetting Dynamic Button to default mode");
          App.UI.DynamicButton.setMode("default");
        }
        
        // Trigger stakeout stopped event
        if (typeof App !== "undefined" && App.Core && App.Core.Events) {
          App.Core.Events.trigger("stakeout:stopped", {});
        }
        
        return;
      }
      
      // Handle expanded view mode buttons
      const button = e.target.closest(".mode-button");
      if (button) {
        const mode = button.dataset.mode;
        console.log("Mode button clicked:", mode);
        this.setMode(mode);
        
        // Notify stakeout module
        if (typeof App !== "undefined" && App.Features && App.Features.StakeOut && App.Features.StakeOut.setNavigationMode) {
          App.Features.StakeOut.setNavigationMode(mode);
        }
      }
    });
  }

  // Touch handling for swipe to expand/collapse
  handleTouchStart(e) {
    // Check if this is a drag or expand/collapse gesture
    const touch = e.touches[0];
    this.lastTouchY = touch.clientY;
    this.dragStartX = touch.clientX;
    this.dragStartY = touch.clientY;
    this.dragStartTime = Date.now();
    
    // Get current widget position
    const rect = this.widget.getBoundingClientRect();
    this.dragOffset.x = touch.clientX - rect.left - rect.width / 2;
    this.dragOffset.y = touch.clientY - rect.top;
  }

  handleTouchMove(e) {
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - this.dragStartX);
    const deltaY = touch.clientY - this.dragStartY;
    const timeDelta = Date.now() - this.dragStartTime;
    
    // If significant horizontal movement or long press, treat as drag
    if (deltaX > 10 || timeDelta > 300) {
      e.preventDefault();
      this.isDragging = true;
      
      // Update widget position
      const x = touch.clientX - this.dragOffset.x;
      const y = touch.clientY - this.dragOffset.y;
      
      // Constrain to viewport
      const maxX = window.innerWidth - 30;
      const maxY = window.innerHeight - 30;
      const constrainedX = Math.max(30, Math.min(maxX, x));
      const constrainedY = Math.max(30, Math.min(maxY, y));
      
      this.widget.style.left = constrainedX + 'px';
      this.widget.style.top = constrainedY + 'px';
      this.widget.style.transform = 'translateX(-50%)';
      this.widget.style.bottom = 'auto';
      
      // Save position
      this.currentPosition.x = constrainedX;
      this.currentPosition.y = constrainedY;
    } else if (Math.abs(deltaY) > 50 && deltaX < 10) {
      // Vertical swipe for expand/collapse
      if (deltaY < 0 && !this.isExpanded) {
        this.expand();
      } else if (deltaY > 0 && this.isExpanded) {
        this.collapse();
      }
    }
  }

  handleTouchEnd() {
    this.isDragging = false;
    // Save position to state if moved
    if (this.currentPosition.x !== null && typeof App !== "undefined" && App.Core && App.Core.State) {
      App.Core.State.set("stakeout.position", this.currentPosition);
    }
  }
  
  // Mouse handling for desktop
  handleMouseDown(e) {
    if (e.button !== 0) return; // Only left click
    
    this.isDragging = true;
    this.dragStartTime = Date.now();
    this.widget.classList.add('dragging');
    
    // Get current widget position
    const rect = this.widget.getBoundingClientRect();
    this.dragOffset.x = e.clientX - rect.left - rect.width / 2;
    this.dragOffset.y = e.clientY - rect.top;
    
    e.preventDefault();
  }
  
  handleMouseMove(e) {
    if (!this.isDragging) return;
    
    // Update widget position
    const x = e.clientX - this.dragOffset.x;
    const y = e.clientY - this.dragOffset.y;
    
    // Constrain to viewport
    const maxX = window.innerWidth - 30;
    const maxY = window.innerHeight - 30;
    const constrainedX = Math.max(30, Math.min(maxX, x));
    const constrainedY = Math.max(30, Math.min(maxY, y));
    
    this.widget.style.left = constrainedX + 'px';
    this.widget.style.top = constrainedY + 'px';
    this.widget.style.transform = 'translateX(-50%)';
    this.widget.style.bottom = 'auto';
    
    // Save position
    this.currentPosition.x = constrainedX;
    this.currentPosition.y = constrainedY;
  }
  
  handleMouseUp(e) {
    if (!this.isDragging) return;
    
    const timeDelta = Date.now() - this.dragStartTime;
    
    // If it was a quick click (< 200ms), toggle expand instead
    if (timeDelta < 200 && Math.abs(e.clientX - this.dragOffset.x) < 5) {
      this.toggleExpanded();
    }
    
    this.isDragging = false;
    this.widget.classList.remove('dragging');
    
    // Save position to state if moved
    if (this.currentPosition.x !== null && typeof App !== "undefined" && App.Core && App.Core.State) {
      App.Core.State.set("stakeout.position", this.currentPosition);
    }
  }

  // Toggle expanded state
  toggleExpanded() {
    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  expand() {
    if (!this.widget) this.createWidget();
    
    this.isExpanded = true;
    this.widget.classList.add("expanded");
    const expandedView = this.widget.querySelector(".stakeout-expanded-view");
    if (expandedView) {
      expandedView.style.display = "block";
    }
  }

  collapse() {
    if (!this.widget) return;
    
    this.isExpanded = false;
    this.widget.classList.remove("expanded");
    const expandedView = this.widget.querySelector(".stakeout-expanded-view");
    if (expandedView) {
      expandedView.style.display = "none";
    }
  }

  // Update navigation display
  updateNavigation(currentLocation, targetLocation, distance) {
    try {
      console.log(`[StakeOutUI] updateNavigation called - distance: ${distance}, widget: ${!!this.widget}`);
      
      if (!this.widget) {
        console.log("[StakeOutUI] Creating widget...");
        this.createWidget();
      }
      
      // Ensure widget is in DOM
      if (!document.body.contains(this.widget)) {
        console.log("[StakeOutUI] Widget not in DOM, adding...");
        document.body.appendChild(this.widget);
      }
    
      // Update total distance
      const distanceEl = document.getElementById("stakeout-distance");
      const unitEl = this.widget.querySelector(".distance-unit");
      
      console.log(`[StakeOutUI] Elements found - distance: ${!!distanceEl}, unit: ${!!unitEl}`);
      console.log(`[StakeOutUI] Current distance element text: "${distanceEl?.textContent}"`);
      
      if (!distanceEl) {
        console.error("[StakeOutUI] Distance element not found!");
        return;
      }
      
      if (distanceEl && unitEl) {
        let distanceText, unitText;
        
        if (distance < 1) {
          distanceText = (distance * 100).toFixed(1);
          unitText = "cm";
        } else if (distance < 1000) {
          distanceText = distance.toFixed(2);
          unitText = "m";
        } else {
          distanceText = (distance / 1000).toFixed(2);
          unitText = "km";
        }
        
        console.log(`[StakeOutUI] Updating distance from "${distanceEl.textContent}" to "${distanceText}"`);
        
        // Force update distance value
        distanceEl.textContent = distanceText;
        void distanceEl.offsetHeight; // Force reflow
        
        // Force update unit
        unitEl.textContent = unitText;
        void unitEl.offsetHeight; // Force reflow
        
        // Verify the update
        console.log(`[StakeOutUI] After update, distance element text: "${distanceEl.textContent}"`);
      }
    
    // Extract coordinates with altitude support
    const [currentLng, currentLat, currentAlt = 0] = currentLocation;
    const [targetLng, targetLat, targetAlt = 0] = targetLocation;
    
    // Calculate distances
    console.log(`[StakeOutUI] Calculating distances - current: [${currentLng}, ${currentLat}], target: [${targetLng}, ${targetLat}]`);
    
    // Calculate X (East-West) distance - preserving sign for direction
    let xDistance = 0;
    if (currentLng !== targetLng) {
      xDistance = turf.distance(
        turf.point([currentLng, currentLat]),
        turf.point([targetLng, currentLat]),
        { units: "meters" }
      );
      // Apply sign based on direction
      if (targetLng < currentLng) xDistance = -xDistance;
    }
    
    // Calculate Y (North-South) distance - preserving sign for direction
    let yDistance = 0;
    if (currentLat !== targetLat) {
      yDistance = turf.distance(
        turf.point([currentLng, currentLat]),
        turf.point([currentLng, targetLat]),
        { units: "meters" }
      );
      // Apply sign based on direction
      if (targetLat < currentLat) yDistance = -yDistance;
    }
    
    // Calculate Z (altitude) difference
    const zDistance = targetAlt - currentAlt;
    
    console.log(`[StakeOutUI] Distances calculated - X: ${xDistance}, Y: ${yDistance}, Z: ${zDistance}`);
    
    // Update arrow rotations - apply to the g element inside the SVG
    // X arrow: Points East (right) or West (left)
    const xArrow = document.getElementById("arrow-x");
    if (xArrow) {
      const xRotation = targetLng > currentLng ? 90 : -90; // East: 90° (right), West: -90° (left)
      const xG = xArrow.querySelector("g");
      if (xG) {
        console.log(`[StakeOutUI] Setting X arrow rotation: ${xRotation}°`);
        xG.setAttribute("transform", `translate(25, 25) rotate(${xRotation})`);
      } else {
        console.error("[StakeOutUI] X arrow g element not found!");
      }
    }
    
    // Y arrow: Points North (up) or South (down)
    const yArrow = document.getElementById("arrow-y");
    if (yArrow) {
      const yRotation = targetLat > currentLat ? 0 : 180; // North: 0° (up), South: 180° (down)
      const yG = yArrow.querySelector("g");
      if (yG) {
        yG.setAttribute("transform", `translate(25, 25) rotate(${yRotation})`);
      }
    }
    
    // Z arrow: Points Up or Down (45° angle for better visibility)
    const zArrow = document.getElementById("arrow-z");
    if (zArrow) {
      const zRotation = targetAlt > currentAlt ? -45 : 135; // Up: -45°, Down: 135°
      const zG = zArrow.querySelector("g");
      if (zG) {
        zG.setAttribute("transform", `translate(25, 25) rotate(${zRotation})`);
      }
    }
    
    // Update distance displays
    const formatDistance = (dist) => {
      const absDist = Math.abs(dist);
      if (absDist < 1) return `${(absDist * 100).toFixed(2)}cm`;
      return `${absDist.toFixed(2)}m`;
    };
    
    const xEl = document.getElementById("stakeout-x");
    const yEl = document.getElementById("stakeout-y");
    const zEl = document.getElementById("stakeout-z");
    
    
    // Force DOM updates with debugging
    const forceUpdate = (elementId, newText) => {
      const element = document.getElementById(elementId);
      if (!element) {
        console.error(`[StakeOutUI] Element not found: ${elementId}`);
        return;
      }
      
      const oldText = element.textContent;
      
      // Update the text content
      element.textContent = newText;
      
      // Force reflow
      void element.offsetHeight;
      
      // Add timestamp for debugging
      element.setAttribute('data-updated', Date.now());
      
      // Always log updates for debugging
      console.log(`[StakeOutUI] ${elementId} updated: "${oldText}" -> "${newText}"`);
      
      // Verify update worked
      const verifyEl = document.getElementById(elementId);
      if (verifyEl && verifyEl.textContent !== newText) {
        console.error(`[StakeOutUI] Update failed! Element still contains: "${verifyEl.textContent}"`);
        // Try one more time with innerHTML
        verifyEl.innerHTML = newText;
      }
    };
    
    // Update all distance values
    forceUpdate("stakeout-x", formatDistance(xDistance));
    forceUpdate("stakeout-y", formatDistance(yDistance));
    forceUpdate("stakeout-z", Math.abs(zDistance) < 0.01 ? "--" : formatDistance(zDistance));
    
    // Color arrows based on distance (closer = greener)
    const getArrowColor = (dist) => {
      const absDist = Math.abs(dist);
      if (absDist < 0.1) return "rgb(0, 255, 0)"; // Green - very close
      if (absDist < 0.5) return "rgb(144, 238, 144)"; // Light green
      if (absDist < 1.0) return "rgb(255, 255, 0)"; // Yellow
      if (absDist < 2.0) return "rgb(255, 165, 0)"; // Orange
      return `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--ml-c-active').trim()})`; // Active color
    };
    
    if (xArrow) {
      const xPath = xArrow.querySelector("path");
      if (xPath) xPath.style.fill = getArrowColor(xDistance);
    }
    if (yArrow) {
      const yPath = yArrow.querySelector("path");
      if (yPath) yPath.style.fill = getArrowColor(yDistance);
    }
    if (zArrow) {
      const zPath = zArrow.querySelector("path");
      if (zPath) zPath.style.fill = Math.abs(zDistance) < 0.01 ? "#666" : getArrowColor(zDistance);
    }
    } catch (error) {
      console.error("[StakeOutUI] Error in updateNavigation:", error, error.stack);
    }
  }


  // Update node info display
  updateNodeInfo(nodeIndex, totalNodes) {
    const nodeInfo = document.getElementById("node-info");
    const nodeValue = document.getElementById("stakeout-node");
    
    if (this.navigationMode === "nodes" && nodeInfo && nodeValue) {
      nodeInfo.style.display = "block";
      nodeValue.textContent = `${nodeIndex + 1} / ${totalNodes}`;
    } else if (nodeInfo) {
      nodeInfo.style.display = "none";
    }
  }

  // Set navigation mode
  setMode(mode) {
    this.navigationMode = mode;
    
    // Update button states if widget exists
    if (this.widget) {
      // Update expanded view buttons
      const buttons = this.widget.querySelectorAll(".mode-button");
      buttons.forEach(button => {
        if (button.dataset.mode === mode) {
          button.classList.add("active");
        } else {
          button.classList.remove("active");
        }
      });
      
      // Update quick toggle button
      const modeText = document.getElementById("mode-text");
      const modeIcon = document.getElementById("mode-icon");
      if (modeText) {
        if (mode === "nodes") {
          modeText.textContent = App.I18n ? App.I18n.t('stakeout.nodes') : "Nodes";
        } else if (mode === "lines") {
          modeText.textContent = App.I18n ? App.I18n.t('stakeout.lines') : "Lines";
        } else {
          modeText.textContent = "Segments";
        }
      }
      if (modeIcon) {
        if (mode === "nodes") {
          // Show nodes icon
          modeIcon.innerHTML = `
            <circle cx="5" cy="5" r="3" fill="currentColor"/>
            <circle cx="15" cy="5" r="3" fill="currentColor"/>
            <circle cx="15" cy="15" r="3" fill="currentColor"/>
            <circle cx="5" cy="15" r="3" fill="currentColor"/>
          `;
        } else if (mode === "lines") {
          // Show lines icon - continuous line
          modeIcon.innerHTML = `
            <path d="M 3,10 L 17,10" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M 3,7 L 3,13" stroke="currentColor" stroke-width="1.5" fill="none"/>
            <path d="M 17,7 L 17,13" stroke="currentColor" stroke-width="1.5" fill="none"/>
          `;
        } else {
          // Show segments icon
          modeIcon.innerHTML = `
            <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="2"/>
            <circle cx="10" cy="10" r="2" fill="currentColor"/>
          `;
        }
      }
    }
  }

  // Interface compatibility methods for StakeOut module
  createArrowContainer() {
    // Ensure widget is created and in DOM
    if (!this.widget || !document.body.contains(this.widget)) {
      const existing = document.getElementById("stakeout-widget");
      if (existing) {
        console.log("[StakeOutUI] Using existing widget from DOM");
        this.widget = existing;
      } else {
        console.log("[StakeOutUI] Creating new widget in createArrowContainer");
        this.createWidget();
      }
    }
    return this.widget;
  }
  
  displayDirectionalArrows(currentLocation, targetLocation, totalDistance) {
    try {
      // If distance isn't provided, calculate it
      if (totalDistance === undefined || totalDistance === null) {
        totalDistance = turf.distance(
          turf.point(currentLocation),
          turf.point(targetLocation),
          { units: "meters" }
        );
      }
      
      // Remove throttling for now to debug
      const now = Date.now();
      
      // Always log for debugging
      console.log(`[StakeOutUI] displayDirectionalArrows called - distance: ${totalDistance.toFixed(2)}m, widget exists: ${!!this.widget}`);
      
      // Direct call without throttling
      this.updateNavigation(currentLocation, targetLocation, totalDistance);
    } catch (error) {
      console.error("[StakeOutUI] Error in displayDirectionalArrows:", error);
    }
  }
  
  updateTotalDistance(distance) {
    // Handled in updateNavigation
  }
  
  resetActivationState() {
    // Reset to default state
    this.collapse();
  }
  
  // Clean up
  cleanup() {
    if (this.widget) {
      this.widget.remove();
      this.widget = null;
    }
  }
}

// Export the class
if (typeof module !== "undefined" && module.exports) {
  module.exports = StakeOutUICompact;
}