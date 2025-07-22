/**
 * Direct Enhancement Script - Simplified approach to ensure StakeOut AI loads
 * This can be run directly in the console or included as a script
 */
(function() {
  console.log('[StakeOutAI-Direct] Starting direct enhancement...');
  
  // Wait for all required components
  function waitForComponents(callback) {
    const checkInterval = setInterval(() => {
      if (window.StakeOutUICompact && 
          window.App && 
          window.App.Features && 
          window.App.Features.StakeOut &&
          window.turf &&
          window.maplibregl) {
        clearInterval(checkInterval);
        console.log('[StakeOutAI-Direct] All components ready');
        callback();
      }
    }, 100);
  }
  
  // Create the enhanced UI class inline
  function createEnhancedUI() {
    class StakeOutUIEnhancedDirect extends window.StakeOutUICompact {
      constructor() {
        super();
        console.log('[StakeOutAI-Direct] Enhanced UI created');
        this.autozoomEnabled = true;
        this.currentZoom = 15;
      }
      
      // Override createWidget to add zoom controls
      createWidget() {
        // Call parent
        const widget = super.createWidget();
        
        console.log('[StakeOutAI-Direct] Adding zoom controls...');
        
        // Add zoom controls
        const zoomControls = document.createElement('div');
        zoomControls.style.cssText = `
          position: absolute;
          bottom: 10px;
          right: 10px;
          display: flex;
          gap: 5px;
          z-index: 100;
        `;
        
        // Zoom in button
        const zoomIn = document.createElement('button');
        zoomIn.innerHTML = '+';
        zoomIn.style.cssText = `
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid #00ff00;
          background: rgba(0, 0, 0, 0.7);
          color: #00ff00;
          font-size: 20px;
          cursor: pointer;
        `;
        zoomIn.onclick = () => {
          if (window.App && window.App.Map && window.App.Map.Init) {
            const map = window.App.Map.Init.getMap();
            if (map) {
              map.zoomIn();
              console.log('[StakeOutAI-Direct] Zoomed in');
            }
          }
        };
        
        // Zoom out button
        const zoomOut = document.createElement('button');
        zoomOut.innerHTML = '-';
        zoomOut.style.cssText = `
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid #00ff00;
          background: rgba(0, 0, 0, 0.7);
          color: #00ff00;
          font-size: 20px;
          cursor: pointer;
        `;
        zoomOut.onclick = () => {
          if (window.App && window.App.Map && window.App.Map.Init) {
            const map = window.App.Map.Init.getMap();
            if (map) {
              map.zoomOut();
              console.log('[StakeOutAI-Direct] Zoomed out');
            }
          }
        };
        
        // Auto zoom button
        const autoZoom = document.createElement('button');
        autoZoom.innerHTML = 'A';
        autoZoom.style.cssText = `
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid ${this.autozoomEnabled ? '#00ff00' : '#666'};
          background: ${this.autozoomEnabled ? 'rgba(0, 255, 0, 0.2)' : 'rgba(0, 0, 0, 0.7)'};
          color: ${this.autozoomEnabled ? '#00ff00' : '#666'};
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
        `;
        autoZoom.onclick = () => {
          this.autozoomEnabled = !this.autozoomEnabled;
          autoZoom.style.border = `2px solid ${this.autozoomEnabled ? '#00ff00' : '#666'}`;
          autoZoom.style.background = this.autozoomEnabled ? 'rgba(0, 255, 0, 0.2)' : 'rgba(0, 0, 0, 0.7)';
          autoZoom.style.color = this.autozoomEnabled ? '#00ff00' : '#666';
          console.log('[StakeOutAI-Direct] Auto zoom:', this.autozoomEnabled);
        };
        
        zoomControls.appendChild(zoomIn);
        zoomControls.appendChild(zoomOut);
        zoomControls.appendChild(autoZoom);
        
        if (this.widget) {
          this.widget.appendChild(zoomControls);
        }
        
        // Start auto zoom if enabled
        this.startAutoZoom();
        
        return widget;
      }
      
      // Simple auto zoom based on distance
      startAutoZoom() {
        if (this.autozoomInterval) {
          clearInterval(this.autozoomInterval);
        }
        
        this.autozoomInterval = setInterval(() => {
          if (!this.autozoomEnabled) return;
          
          // Get distance from UI
          const distanceEl = document.getElementById('stakeout-distance');
          if (distanceEl) {
            const distance = parseFloat(distanceEl.textContent);
            if (!isNaN(distance)) {
              this.updateZoomForDistance(distance);
            }
          }
        }, 1000); // Check every second
      }
      
      updateZoomForDistance(distance) {
        if (!window.App || !window.App.Map || !window.App.Map.Init) return;
        
        const map = window.App.Map.Init.getMap();
        if (!map) return;
        
        let targetZoom;
        if (distance < 10) targetZoom = 19;
        else if (distance < 25) targetZoom = 18;
        else if (distance < 50) targetZoom = 17;
        else if (distance < 100) targetZoom = 16;
        else if (distance < 250) targetZoom = 15;
        else if (distance < 500) targetZoom = 14;
        else if (distance < 1000) targetZoom = 13;
        else targetZoom = 12;
        
        const currentZoom = map.getZoom();
        if (Math.abs(currentZoom - targetZoom) > 0.5) {
          map.easeTo({
            zoom: targetZoom,
            duration: 750
          });
          console.log(`[StakeOutAI-Direct] Auto zoom: ${distance}m -> zoom ${targetZoom}`);
        }
      }
      
      cleanup() {
        if (this.autozoomInterval) {
          clearInterval(this.autozoomInterval);
        }
        super.cleanup();
      }
    }
    
    return StakeOutUIEnhancedDirect;
  }
  
  // Apply the enhancement
  function applyEnhancement() {
    console.log('[StakeOutAI-Direct] Applying enhancement...');
    
    // Create enhanced class
    const EnhancedClass = createEnhancedUI();
    
    // Store original
    window.StakeOutUICompactOriginal = window.StakeOutUICompact;
    
    // Replace with enhanced
    window.StakeOutUICompact = EnhancedClass;
    
    console.log('[StakeOutAI-Direct] StakeOutUICompact replaced with enhanced version');
    
    // If StakeOut is already active, replace the UI
    if (window.App.Features.StakeOut.isActive()) {
      console.log('[StakeOutAI-Direct] StakeOut is active, triggering UI replacement...');
      
      // Clean up and recreate
      window.App.Features.StakeOut.cleanup();
      
      console.log('[StakeOutAI-Direct] Ready for next stakeout activation with enhanced UI');
    }
    
    // Add visual indicator
    const indicator = document.createElement('div');
    indicator.innerHTML = '✓ StakeOut AI Active';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #00ff00;
      color: black;
      padding: 5px 10px;
      border-radius: 5px;
      font-weight: bold;
      z-index: 10000;
      animation: fadeOut 3s forwards;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeOut {
        0% { opacity: 1; }
        70% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(indicator);
    
    setTimeout(() => indicator.remove(), 3000);
  }
  
  // Wait and apply
  waitForComponents(() => {
    applyEnhancement();
    
    // Expose manual controls
    window.StakeOutAIDirect = {
      reapply: applyEnhancement,
      test: () => {
        console.log('[StakeOutAI-Direct] Testing with coordinates...');
        if (window.App && window.App.Features && window.App.Features.StakeOut) {
          window.App.Features.StakeOut.addCircleLayer(0.001, 0.001, 0, 0);
        }
      }
    };
    
    console.log('[StakeOutAI-Direct] Enhancement complete!');
    console.log('Commands available:');
    console.log('  StakeOutAIDirect.test() - Test with mock coordinates');
    console.log('  StakeOutAIDirect.reapply() - Reapply enhancement');
  });
})();