/**
 * TiltDisplayWidget.js - GLRM Tilt Angle Visualization Widget
 * 
 * This widget displays real-time tilt angle data from GLRM devices in a movable,
 * collapsible container within the MapLibre map interface.
 */

App.UI.TiltDisplayWidget = (function() {
  'use strict';

  // Private variables
  let _widget = null;
  let _isExpanded = false;
  let _isDragging = false;
  let _currentPosition = { x: null, y: null };
  let _dragOffset = { x: 0, y: 0 };
  let _tiltData = {
    angle: 0,
    azimuth: 0,
    status: 'inactive'
  };

  // Configuration constants
  const WIDGET_ID = 'tilt-display-widget';
  const WIDGET_SIZE = { width: 120, height: 160 };
  const INDICATOR_SIZE = 80;
  const TILT_THRESHOLDS = {
    HIGH_ACCURACY: 15,    // Green zone: 0-15°
    MODERATE_ACCURACY: 30 // Yellow zone: 15-30°, Red: >30°
  };

  /**
   * Initialize the tilt display widget
   */
  function initialize() {
    console.log('[TiltDisplayWidget] Initializing...');
    
    // Load saved position
    _loadWidgetPosition();
    
    // Create widget if not already exists
    if (!_widget) {
      _createWidget();
    }
    
    // Initially hide widget until GLRM is connected
    _hideWidget();
    
    // Initialize with test data to ensure widget displays properly
    updateTiltData(2.5, 45, 'active');
    
    console.log('[TiltDisplayWidget] Initialized successfully');
  }

  /**
   * Create the main widget structure
   */
  function _createWidget() {
    // Check if widget already exists
    const existingWidget = document.getElementById(WIDGET_ID);
    if (existingWidget) {
      _widget = existingWidget;
      return;
    }

    // Create main container
    _widget = document.createElement('div');
    _widget.id = WIDGET_ID;
    _widget.className = 'tilt-display-widget';
    
    // Apply base styles
    _applyWidgetStyles();
    
    // Create widget content
    _widget.innerHTML = `
      <div class="tilt-handle" id="tilt-handle" style="
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: grab;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      ">
        <div class="handle-bar" style="
          width: 30px;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          position: absolute;
          top: 8px;
        "></div>
        <div class="tilt-title" style="
          font-weight: bold;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.9);
        ">GLRM Tilt</div>
      </div>
      
      <div class="tilt-content" id="tilt-content" style="
        padding: 10px;
        display: none;
      ">
        <!-- Circular tilt indicator -->
        <div class="tilt-indicator-container" style="
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        ">
          <svg class="tilt-indicator" id="tilt-indicator" width="${INDICATOR_SIZE}" height="${INDICATOR_SIZE}" viewBox="0 0 ${INDICATOR_SIZE} ${INDICATOR_SIZE}">
            <!-- Background circle -->
            <circle cx="${INDICATOR_SIZE/2}" cy="${INDICATOR_SIZE/2}" r="${INDICATOR_SIZE/2 - 2}" 
                    fill="rgba(255, 255, 255, 0.1)" 
                    stroke="rgba(255, 255, 255, 0.3)" 
                    stroke-width="2"/>
            
            <!-- Crosshair lines -->
            <line x1="${INDICATOR_SIZE/2}" y1="5" x2="${INDICATOR_SIZE/2}" y2="${INDICATOR_SIZE - 5}" 
                  stroke="rgba(255, 255, 255, 0.4)" stroke-width="1"/>
            <line x1="5" y1="${INDICATOR_SIZE/2}" x2="${INDICATOR_SIZE - 5}" y2="${INDICATOR_SIZE/2}" 
                  stroke="rgba(255, 255, 255, 0.4)" stroke-width="1"/>
            
            <!-- Tilt bubble -->
            <circle class="tilt-bubble" id="tilt-bubble" cx="${INDICATOR_SIZE/2}" cy="${INDICATOR_SIZE/2}" r="8" 
                    fill="#4CAF50" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2"/>
          </svg>
        </div>
        
        <!-- Digital readout -->
        <div class="tilt-readout" style="
          font-size: 10px;
          line-height: 1.3;
        ">
          <div class="tilt-angle" style="margin-bottom: 3px;">
            <span class="tilt-label" style="color: rgba(255, 255, 255, 0.7);">Angle:</span>
            <span class="tilt-value" id="tilt-angle-value" style="color: #4CAF50; font-weight: bold;">0.0°</span>
          </div>
          <div class="tilt-azimuth" style="margin-bottom: 3px;">
            <span class="tilt-label" style="color: rgba(255, 255, 255, 0.7);">Azimuth:</span>
            <span class="tilt-value" id="tilt-azimuth-value" style="color: #4CAF50; font-weight: bold;">N 0°</span>
          </div>
          <div class="tilt-status" style="display: flex; align-items: center;">
            <span class="status-indicator" id="tilt-status-indicator" style="color: #757575; margin-right: 5px;">●</span>
            <span class="status-text" id="tilt-status-text" style="color: rgba(255, 255, 255, 0.9);">Inactive</span>
          </div>
        </div>
      </div>
    `;
    
    // Add to DOM
    document.body.appendChild(_widget);
    
    // Set up event handlers
    _setupEventHandlers();
    
    // Set initial position
    _setWidgetPosition();
  }

  /**
   * Apply CSS styles to the widget
   */
  function _applyWidgetStyles() {
    const styles = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: ${WIDGET_SIZE.width}px;
      min-height: 40px;
      background: linear-gradient(135deg, rgba(30, 30, 30, 0.95), rgba(50, 50, 50, 0.95));
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      font-family: 'Roboto', Arial, sans-serif;
      font-size: 12px;
      color: white;
      z-index: 1000;
      user-select: none;
      transition: all 0.3s ease;
      backdrop-filter: blur(5px);
    `;
    
    _widget.style.cssText = styles;
    console.log('[TiltDisplayWidget] Widget styles applied');
  }

  /**
   * Set up event handlers for dragging and interaction
   */
  function _setupEventHandlers() {
    const handle = _widget.querySelector('#tilt-handle');
    
    // Mouse events
    handle.addEventListener('mousedown', _handleDragStart);
    document.addEventListener('mousemove', _handleDragMove);
    document.addEventListener('mouseup', _handleDragEnd);
    
    // Touch events
    handle.addEventListener('touchstart', _handleDragStart);
    document.addEventListener('touchmove', _handleDragMove);
    document.addEventListener('touchend', _handleDragEnd);
    
    // Click to expand/collapse
    handle.addEventListener('click', _toggleExpanded);
    
    // Prevent context menu
    handle.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /**
   * Handle drag start
   */
  function _handleDragStart(e) {
    e.preventDefault();
    _isDragging = true;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const rect = _widget.getBoundingClientRect();
    _dragOffset.x = clientX - rect.left;
    _dragOffset.y = clientY - rect.top;
    
    _widget.style.cursor = 'grabbing';
  }

  /**
   * Handle drag move
   */
  function _handleDragMove(e) {
    if (!_isDragging) return;
    
    e.preventDefault();
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    let newX = clientX - _dragOffset.x;
    let newY = clientY - _dragOffset.y;
    
    // Constrain to viewport
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    newX = Math.max(0, Math.min(newX, viewport.width - WIDGET_SIZE.width));
    newY = Math.max(0, Math.min(newY, viewport.height - 40)); // Minimum height for handle
    
    _widget.style.left = newX + 'px';
    _widget.style.top = newY + 'px';
    
    _currentPosition.x = newX;
    _currentPosition.y = newY;
  }

  /**
   * Handle drag end
   */
  function _handleDragEnd(e) {
    if (!_isDragging) return;
    
    _isDragging = false;
    _widget.style.cursor = '';
    
    // Save position
    _saveWidgetPosition();
  }

  /**
   * Toggle expanded/collapsed state
   */
  function _toggleExpanded() {
    if (_isDragging) return;
    
    _isExpanded = !_isExpanded;
    console.log('[TiltDisplayWidget] _toggleExpanded() called, isExpanded:', _isExpanded);
    
    const content = _widget.querySelector('#tilt-content');
    if (!content) {
      console.error('[TiltDisplayWidget] Content element not found!');
      return;
    }
    
    if (_isExpanded) {
      content.style.display = 'block';
      _widget.style.height = WIDGET_SIZE.height + 'px';
      console.log('[TiltDisplayWidget] Widget expanded, height:', WIDGET_SIZE.height + 'px');
    } else {
      content.style.display = 'none';
      _widget.style.height = '40px';
      console.log('[TiltDisplayWidget] Widget collapsed');
    }
    
    // Save state
    if (typeof App !== 'undefined' && App.Core && App.Core.State) {
      App.Core.State.set('tilt.widget.expanded', _isExpanded);
    }
  }

  /**
   * Update tilt data and refresh display
   */
  function updateTiltData(angle, azimuth, status) {
    _tiltData.angle = angle || 0;
    _tiltData.azimuth = azimuth || 0;
    _tiltData.status = status || 'inactive';
    
    _updateTiltIndicator();
    _updateDigitalReadout();
  }

  /**
   * Update the visual tilt indicator
   */
  function _updateTiltIndicator() {
    const bubble = _widget.querySelector('#tilt-bubble');
    if (!bubble) return;
    
    const angle = _tiltData.angle;
    const azimuth = _tiltData.azimuth;
    
    // Calculate bubble position based on tilt angle and azimuth
    const maxOffset = (INDICATOR_SIZE / 2) - 12; // Keep bubble within circle
    const offset = Math.min(angle / 45, 1) * maxOffset; // Scale to max offset
    
    // Convert azimuth to radians (0° = North, clockwise)
    const azimuthRad = (azimuth - 90) * Math.PI / 180;
    
    // Calculate new position
    const centerX = INDICATOR_SIZE / 2;
    const centerY = INDICATOR_SIZE / 2;
    const newX = centerX + Math.cos(azimuthRad) * offset;
    const newY = centerY + Math.sin(azimuthRad) * offset;
    
    // Update bubble position
    bubble.setAttribute('cx', newX);
    bubble.setAttribute('cy', newY);
    
    // Update bubble color based on accuracy
    let color;
    if (angle <= TILT_THRESHOLDS.HIGH_ACCURACY) {
      color = '#4CAF50'; // Green
    } else if (angle <= TILT_THRESHOLDS.MODERATE_ACCURACY) {
      color = '#FF9800'; // Orange
    } else {
      color = '#F44336'; // Red
    }
    
    bubble.setAttribute('fill', color);
  }

  /**
   * Update digital readout values
   */
  function _updateDigitalReadout() {
    const angleValue = _widget.querySelector('#tilt-angle-value');
    const azimuthValue = _widget.querySelector('#tilt-azimuth-value');
    const statusText = _widget.querySelector('#tilt-status-text');
    const statusIndicator = _widget.querySelector('#tilt-status-indicator');
    
    if (angleValue) {
      angleValue.textContent = _tiltData.angle.toFixed(1) + '°';
    }
    
    if (azimuthValue) {
      azimuthValue.textContent = _formatAzimuth(_tiltData.azimuth);
    }
    
    if (statusText) {
      statusText.textContent = _formatStatus(_tiltData.status);
    }
    
    if (statusIndicator) {
      const statusColors = {
        'active': '#4CAF50',
        'calibrating': '#FF9800',
        'inactive': '#757575'
      };
      statusIndicator.style.color = statusColors[_tiltData.status] || '#757575';
    }
  }

  /**
   * Format azimuth angle to compass direction
   */
  function _formatAzimuth(azimuth) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(azimuth / 45) % 8;
    return directions[index] + ' ' + Math.round(azimuth) + '°';
  }

  /**
   * Format status text
   */
  function _formatStatus(status) {
    const statusMap = {
      'active': 'Active',
      'calibrating': 'Calibrating',
      'inactive': 'Inactive'
    };
    return statusMap[status] || 'Unknown';
  }

  /**
   * Show the widget
   */
  function showWidget() {
    console.log('[TiltDisplayWidget] showWidget() called');
    if (_widget) {
      _widget.style.display = 'block';
      console.log('[TiltDisplayWidget] Widget display set to block');
      
      // Force expand the widget to show content
      _isExpanded = false; // Set to false first so toggle will expand
      _toggleExpanded();
      
      console.log('[TiltDisplayWidget] Widget expanded, isExpanded:', _isExpanded);
    }
  }

  /**
   * Hide the widget
   */
  function _hideWidget() {
    if (_widget) {
      _widget.style.display = 'none';
    }
  }

  /**
   * Load saved widget position
   */
  function _loadWidgetPosition() {
    if (typeof App !== 'undefined' && App.Core && App.Core.State) {
      const savedPosition = App.Core.State.get('tilt.widget.position');
      const savedExpanded = App.Core.State.get('tilt.widget.expanded');
      
      if (savedPosition) {
        _currentPosition = savedPosition;
      }
      
      if (savedExpanded !== undefined) {
        _isExpanded = savedExpanded;
      }
    }
  }

  /**
   * Save widget position
   */
  function _saveWidgetPosition() {
    if (typeof App !== 'undefined' && App.Core && App.Core.State) {
      App.Core.State.set('tilt.widget.position', _currentPosition);
    }
  }

  /**
   * Set widget position
   */
  function _setWidgetPosition() {
    if (_currentPosition.x !== null && _currentPosition.y !== null) {
      _widget.style.left = _currentPosition.x + 'px';
      _widget.style.top = _currentPosition.y + 'px';
    }
  }

  /**
   * Update calibration progress
   */
  function updateCalibrationProgress(progress) {
    // This could be extended to show calibration progress
    console.log('[TiltDisplayWidget] Calibration progress:', progress + '%');
  }

  /**
   * Set tilt compensation enabled state
   */
  function setTiltCompensationEnabled(enabled) {
    const status = enabled ? 'active' : 'inactive';
    updateTiltData(_tiltData.angle, _tiltData.azimuth, status);
  }

  // Public API
  return {
    initialize: initialize,
    updateTiltData: updateTiltData,
    updateCalibrationProgress: updateCalibrationProgress,
    setTiltCompensationEnabled: setTiltCompensationEnabled,
    showWidget: showWidget,
    hideWidget: _hideWidget,
    // Test function to force show widget with test data
    testWidget: function() {
      console.log('[TiltDisplayWidget] Test widget called');
      updateTiltData(15.3, 120, 'active');
      showWidget();
    }
  };
})();