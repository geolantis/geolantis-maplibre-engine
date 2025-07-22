// Copy and paste this entire code block into the browser console to immediately enhance StakeOut

(function() {
  // Check if StakeOut is available
  if (!window.App || !window.App.Features || !window.App.Features.StakeOut) {
    console.error('StakeOut module not found. Make sure the map is loaded.');
    return;
  }
  
  // Simple enhancement that adds visible zoom controls
  const originalUI = window.App.Features.StakeOut.getUI();
  if (originalUI) {
    console.log('Current UI:', originalUI.constructor.name);
    
    // Add zoom controls to existing widget
    const widget = document.getElementById('stakeout-widget');
    if (widget && !document.getElementById('stakeout-zoom-controls')) {
      console.log('Adding zoom controls to existing widget...');
      
      const controls = document.createElement('div');
      controls.id = 'stakeout-zoom-controls';
      controls.style.cssText = `
        position: absolute;
        bottom: 10px;
        right: 10px;
        display: flex;
        gap: 5px;
        z-index: 1000;
      `;
      
      const btnStyle = `
        width: 35px;
        height: 35px;
        border-radius: 50%;
        border: 2px solid #00ff00;
        background: rgba(0, 0, 0, 0.8);
        color: #00ff00;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      `;
      
      // Zoom in
      const zoomIn = document.createElement('button');
      zoomIn.innerHTML = '+';
      zoomIn.style.cssText = btnStyle;
      zoomIn.onmouseover = () => { zoomIn.style.background = 'rgba(0, 255, 0, 0.3)'; };
      zoomIn.onmouseout = () => { zoomIn.style.background = 'rgba(0, 0, 0, 0.8)'; };
      zoomIn.onclick = () => {
        App.Map.Init.getMap().zoomIn();
        console.log('Zoomed in');
      };
      
      // Zoom out  
      const zoomOut = document.createElement('button');
      zoomOut.innerHTML = '−';
      zoomOut.style.cssText = btnStyle;
      zoomOut.onmouseover = () => { zoomOut.style.background = 'rgba(0, 255, 0, 0.3)'; };
      zoomOut.onmouseout = () => { zoomOut.style.background = 'rgba(0, 0, 0, 0.8)'; };
      zoomOut.onclick = () => {
        App.Map.Init.getMap().zoomOut();
        console.log('Zoomed out');
      };
      
      // Auto zoom
      let autoZoomEnabled = true;
      const autoZoom = document.createElement('button');
      autoZoom.innerHTML = 'A';
      autoZoom.style.cssText = btnStyle + `
        background: rgba(0, 255, 0, 0.3);
        border-color: #00ff00;
      `;
      autoZoom.onclick = () => {
        autoZoomEnabled = !autoZoomEnabled;
        autoZoom.style.background = autoZoomEnabled ? 'rgba(0, 255, 0, 0.3)' : 'rgba(0, 0, 0, 0.8)';
        autoZoom.style.borderColor = autoZoomEnabled ? '#00ff00' : '#666';
        autoZoom.style.color = autoZoomEnabled ? '#00ff00' : '#666';
        console.log('Auto zoom:', autoZoomEnabled);
      };
      
      controls.appendChild(zoomIn);
      controls.appendChild(zoomOut);
      controls.appendChild(autoZoom);
      widget.appendChild(controls);
      
      // Add auto zoom functionality
      let autoZoomInterval = setInterval(() => {
        if (!autoZoomEnabled) return;
        
        const distanceEl = document.getElementById('stakeout-distance');
        if (!distanceEl) return;
        
        const distance = parseFloat(distanceEl.textContent);
        if (isNaN(distance)) return;
        
        const map = App.Map.Init.getMap();
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
          map.easeTo({ zoom: targetZoom, duration: 750 });
        }
      }, 1000);
      
      // Add AR effects
      const map = App.Map.Init.getMap();
      if (map) {
        // Get current and target positions
        const targetEl = document.querySelector('.maplibregl-marker');
        if (targetEl) {
          const targetPos = map.project([
            parseFloat(targetEl.style.transform.match(/translate\((-?\d+\.?\d*)px/)[1]),
            parseFloat(targetEl.style.transform.match(/,\s*(-?\d+\.?\d*)px/)[1])
          ]);
          
          // Add pulsing effect to target
          targetEl.style.animation = 'pulse 2s infinite';
          
          // Add CSS for pulse animation
          if (!document.getElementById('stakeout-ar-styles')) {
            const style = document.createElement('style');
            style.id = 'stakeout-ar-styles';
            style.textContent = `
              @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
              }
              
              #stakeout-widget {
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
              }
            `;
            document.head.appendChild(style);
          }
        }
      }
      
      console.log('✓ StakeOut enhanced with zoom controls and auto-zoom!');
      
      // Show success message
      const msg = document.createElement('div');
      msg.innerHTML = '✓ StakeOut AI Enhanced!';
      msg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #00ff00;
        color: black;
        padding: 10px 20px;
        border-radius: 5px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0, 255, 0, 0.5);
      `;
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 3000);
      
    } else if (!widget) {
      console.log('StakeOut widget not found. Activate stakeout first.');
    } else {
      console.log('Zoom controls already added.');
    }
  }
  
  // Test function
  window.testStakeOut = () => {
    console.log('Activating test stakeout...');
    App.Features.StakeOut.addCircleLayer(0.001, 0.001, 0, 0);
  };
  
  console.log('Run testStakeOut() to test with mock coordinates');
})();