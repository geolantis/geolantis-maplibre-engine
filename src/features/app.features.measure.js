/**
 * Measurement functionality for Geolantis360
 * @namespace App.Features.Measure
 */
App.Features = App.Features || {};
App.Features.Measure = (function() {
    // Private variables
    var _map = null;
    var _isActive = false;
    var _measureControl = null;
    var _currentMode = null;
    var _clickHandler = null;
    var _originalClickEnabled = true;
    
    /**
     * Initialize the measurement module
     * @param {Object} map - The MapLibre map instance
     */
    function initialize(map) {
        _map = map;
        console.log('Measurement module initialized');
        
        // Load the measurement library if not already loaded
        if (!window.MaplibreTerradrawControl && !window.MaplibreglMeasures) {
            loadMeasurementLibrary();
        }
        
        // Subscribe to events
        if (App.Core.Events) {
            App.Core.Events.on('measure:libraryLoaded', function() {
                console.log('Measurement library ready');
            });
        }
    }
    
    /**
     * Load the measurement library dynamically
     * @private
     */
    function loadMeasurementLibrary() {
        // Try to use the terradraw measurement control
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@watergis/maplibre-gl-terradraw@1.3.14/dist/maplibre-gl-terradraw.umd.js';
        script.onload = function() {
            console.log('Terradraw measurement library loaded');
            
            // Load the CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/@watergis/maplibre-gl-terradraw@1.3.14/dist/maplibre-gl-terradraw.css';
            document.head.appendChild(link);
            
            // Apply text display fix by overriding the constructor
            applyTerradrawTextFix();
            
            // Trigger ready event
            if (App.Core.Events) {
                App.Core.Events.trigger('measure:libraryLoaded');
            }
        };
        script.onerror = function() {
            console.error('Failed to load measurement library');
            // Fallback to the local maplibre-measures.js if available
            loadLocalMeasurementLibrary();
        };
        document.head.appendChild(script);
    }
    
    /**
     * Add custom styles for measurement controls
     * @private
     */
    function addCustomStyles() {
        // CSS is already loaded via index.html - no need to add anything here
        return;
    }
    
    /**
     * Apply TerraDraw text display fix by overriding the constructor
     * @private
     */
    function applyTerradrawTextFix() {
        if (!window.MaplibreTerradrawControl || !window.MaplibreTerradrawControl.MaplibreMeasureControl) {
            return;
        }
        
        const OriginalMeasureControl = window.MaplibreTerradrawControl.MaplibreMeasureControl;
        
        window.MaplibreTerradrawControl.MaplibreMeasureControl = function(options) {
            console.log('Creating patched MeasureControl with enhanced text display');
            
            // Force enable all text display options
            const patchedOptions = {
                ...options,
                displayMeasurements: true,
                showLabels: true,
                showTooltips: true,
                showSegmentLengths: true,
                showTotalLength: true,
                showArea: true,
                labelOptions: {
                    showDistances: true,
                    showArea: true,
                    showSegmentLengths: true,
                    showTotalDistance: true,
                    decimalPlaces: 2,
                    ...options.labelOptions
                }
            };
            
            // Create the control with patched options
            const control = new OriginalMeasureControl(patchedOptions);
            
            // Store original onAdd
            const originalOnAdd = control.onAdd.bind(control);
            
            // Override onAdd to add monitoring
            control.onAdd = function(map) {
                const container = originalOnAdd(map);
                
                // Monitor for draw instance and ensure text visibility
                setTimeout(() => {
                    if (control.draw) {
                        // Monitor draw events to ensure labels stay visible
                        ['create', 'update', 'render'].forEach(eventName => {
                            control.draw.on(eventName, () => {
                                setTimeout(ensureMeasurementTextVisible, 100);
                            });
                        });
                    }
                    
                    // Start monitoring for measurement text
                    setInterval(() => {
                        const style = map.getStyle();
                        if (style && style.sources) {
                            Object.keys(style.sources).forEach(sourceId => {
                                if (sourceId.includes('measure') || sourceId.includes('terradraw')) {
                                    const source = map.getSource(sourceId);
                                    if (source && source._data && source._data.features) {
                                        source._data.features.forEach(feature => {
                                            if (feature.properties && (feature.properties.distance || feature.properties.area || feature.properties.length)) {
                                                ensureMeasurementTextVisible();
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }, 1000);
                }, 1000);
                
                return container;
            };
            
            return control;
        };
        
        // Copy static properties
        Object.keys(OriginalMeasureControl).forEach(key => {
            window.MaplibreTerradrawControl.MaplibreMeasureControl[key] = OriginalMeasureControl[key];
        });
        
        // Prototype inheritance
        window.MaplibreTerradrawControl.MaplibreMeasureControl.prototype = OriginalMeasureControl.prototype;
        
        console.log('TerraDraw text display fix applied');
    }
    
    /**
     * Ensure measurement text is visible
     * @private
     */
    function ensureMeasurementTextVisible() {
        const selectors = [
            '.maplibregl-marker',
            '.terradraw-measurement-label',
            '.terradraw-measurement-label-custom',
            '[class*="measure"]',
            '[class*="terradraw"]'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el.textContent && el.textContent.trim()) {
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                    el.style.display = 'block';
                }
            });
        });
    }
    
    /**
     * Load the local measurement library as fallback
     * @private
     */
    function loadLocalMeasurementLibrary() {
        const script = document.createElement('script');
        script.src = 'src/maplibre-measures.js';
        script.onload = function() {
            console.log('Local measurement library loaded');
        };
        document.head.appendChild(script);
    }
    
    /**
     * Disable map click events during measurement
     * @private
     */
    function disableMapClickEvents() {
        if (!_map) return;
        
        // Store the original click handler if we haven't already
        if (!_clickHandler && _map._listeners && _map._listeners.click) {
            _clickHandler = _map._listeners.click[0];
        }
        
        // Remove click event listeners to prevent feature selection
        if (_map._listeners && _map._listeners.click) {
            _map._listeners.click = [];
        }
        
        console.log('Map click events disabled for measurement mode');
    }
    
    /**
     * Re-enable map click events after measurement
     * @private
     */
    function enableMapClickEvents() {
        if (!_map) return;
        
        // Restore the original click handler
        if (_clickHandler) {
            _map.on('click', _clickHandler);
        } else if (App.Map.Events && App.Map.Events.reset) {
            // Fallback: reset map events
            App.Map.Events.reset();
        }
        
        console.log('Map click events re-enabled');
    }
    
    /**
     * Get enabled measurement modes from settings
     * @private
     */
    function getEnabledModes() {
        const modes = [];
        
        // Check each mode toggle and add if enabled
        const modeToggleMap = {
            'measureModePoint': 'point',
            'measureModeLinestring': 'linestring',
            'measureModePolygon': 'polygon',
            'measureModeRectangle': 'rectangle',
            'measureModeAngledRectangle': 'angled-rectangle',
            'measureModeCircle': 'circle',
            'measureModeSector': 'sector',
            'measureModeSensor': 'sensor',
            'measureModeFreehand': 'freehand'
        };
        
        for (const [toggleId, modeName] of Object.entries(modeToggleMap)) {
            const toggle = document.getElementById(toggleId);
            if (toggle && toggle.checked) {
                modes.push(modeName);
            }
        }
        
        // Always include these utility modes
        modes.push('select', 'delete-selection', 'delete', 'download');
        
        return modes;
    }
    
    /**
     * Start measurement mode
     * @param {string} mode - The measurement mode ('line', 'polygon', 'circle', etc.)
     */
    function startMeasurement(mode) {
        if (_isActive && _measureControl) {
            // If already active, just show the control
            if (_measureControl._container) {
                _measureControl._container.style.display = 'block';
            }
            return;
        }
        
        _currentMode = mode || 'linestring';
        _isActive = true;
        
        // Disable map click events to prevent feature selection
        disableMapClickEvents();
        
        // Check if the library is loaded
        if (window.MaplibreTerradrawControl && window.MaplibreTerradrawControl.MaplibreMeasureControl) {
            if (!_measureControl) {
                // Get enabled modes from settings
                const enabledModes = getEnabledModes();
                
                // Create the measurement control with enabled modes
                _measureControl = new MaplibreTerradrawControl.MaplibreMeasureControl({
                    modes: enabledModes,
                    open: true,
                    computeElevation: true,
                    // Enable measurement display
                    displayMeasurements: true,
                    // Units configuration
                    units: 'metric',
                    language: 'en',
                    // Additional options to ensure labels are shown
                    showLabels: true,
                    showTooltips: true,
                    labelOptions: {
                        showDistances: true,
                        showArea: true,
                        decimalPlaces: 2,
                        showTotalDistance: true
                    }
                });
                _map.addControl(_measureControl, 'top-left');
                
                // Add custom styles to fix button sizing
                addCustomStyles();
                
                // Ensure the control is properly initialized and positioned
                setTimeout(() => {
                    if (_measureControl && _measureControl._container) {
                        _measureControl._container.style.display = 'block';
                        
                        // Button sizing is now handled by CSS based on button-size settings
                        
                        // Use the external positioning function if available
                        if (window.adjustMeasurementPosition) {
                            window.adjustMeasurementPosition();
                        }
                        
                        // Start watching for dynamic button changes
                        if (window.watchDynamicButtons) {
                            window.watchDynamicButtons();
                        }
                        
                        // Button sizing is handled by CSS
                        
                        // MutationObserver removed - button sizing is now handled by CSS
                    }
                }, 100);
            } else {
                // Show the control panel
                if (_measureControl._container) {
                    _measureControl._container.style.display = 'block';
                }
            }
            
        } else if (window.MaplibreglMeasures) {
            // Fallback to local measurement library
            if (!_measureControl) {
                _measureControl = new MaplibreglMeasures({
                    lang: {
                        areaMeasurementButtonTitle: App.I18n ? App.I18n.t('measurementTool.measureArea') : 'Measure area',
                        lengthMeasurementButtonTitle: App.I18n ? App.I18n.t('measurementTool.measureLength') : 'Measure length',
                        clearMeasurementsButtonTitle: App.I18n ? App.I18n.t('measurementTool.clearMeasurements') : 'Clear measurements'
                    }
                });
                _map.addControl(_measureControl, 'top-left');
            }
            
            // Start measurement
            if (mode === 'polygon') {
                _measureControl.startAreaMeasurement();
            } else {
                _measureControl.startLengthMeasurement();
            }
        } else {
            console.warn('Measurement library not loaded yet');
            // Try loading again
            loadMeasurementLibrary();
            
            // Re-enable click events since we can't start measurement
            enableMapClickEvents();
            return;
        }
        
        // Update UI state
        updateUIState(true);
        
        // Trigger event
        if (App.Core.Events) {
            App.Core.Events.trigger('measure:started', { mode: _currentMode });
        }
    }
    
    /**
     * Stop measurement mode
     */
    function stopMeasurement() {
        _isActive = false;
        
        // Re-enable map click events
        enableMapClickEvents();
        
        if (_measureControl) {
            // Remove the control completely
            if (_map) {
                _map.removeControl(_measureControl);
                _measureControl = null;
            }
        }
        
        // Clear all measurement features from the map
        clearAllMeasurementFeatures();
        
        // Update UI state
        updateUIState(false);
        
        // Trigger event
        if (App.Core.Events) {
            App.Core.Events.trigger('measure:stopped');
        }
    }
    
    /**
     * Clear all measurement features from the map
     * @private
     */
    function clearAllMeasurementFeatures() {
        if (!_map) return;
        
        // Remove any TerraDraw layers and sources
        const style = _map.getStyle();
        if (style && style.layers) {
            const terradrawLayers = style.layers.filter(layer => 
                layer.id.includes('terradraw') || 
                layer.id.includes('measure') ||
                layer.id.includes('gl-draw')
            );
            
            terradrawLayers.forEach(layer => {
                if (_map.getLayer(layer.id)) {
                    _map.removeLayer(layer.id);
                }
            });
        }
        
        if (style && style.sources) {
            Object.keys(style.sources).forEach(sourceId => {
                if (sourceId.includes('terradraw') || 
                    sourceId.includes('measure') ||
                    sourceId.includes('gl-draw')) {
                    if (_map.getSource(sourceId)) {
                        _map.removeSource(sourceId);
                    }
                }
            });
        }
        
        // Remove any measurement markers
        const markers = document.querySelectorAll('.maplibregl-marker');
        markers.forEach(marker => {
            if (marker.innerHTML.includes('terradraw') || 
                marker.innerHTML.includes('measurement') ||
                marker.classList.contains('terradraw-measurement-label')) {
                marker.remove();
            }
        });
    }
    
    /**
     * Clear all measurements
     */
    function clearMeasurements() {
        if (_measureControl) {
            if (_measureControl.draw) {
                // Terradraw control - clear all features
                _measureControl.draw.deleteAll();
            } else if (_measureControl.clearMeasurements) {
                // Local measurement library
                _measureControl.clearMeasurements();
            }
        }
        
        // Also clear any remaining features
        clearAllMeasurementFeatures();
        
        // Trigger event
        if (App.Core.Events) {
            App.Core.Events.trigger('measure:cleared');
        }
    }
    
    /**
     * Update UI state based on measurement status
     * @private
     * @param {boolean} active - Whether measurement is active
     */
    function updateUIState(active) {
        // Update dynamic button if available
        if (App.UI.DynamicButton) {
            if (active) {
                App.UI.DynamicButton.setMode('measure');
            } else {
                App.UI.DynamicButton.setMode('default');
            }
        }
        
        // Update body class for cursor styling
        document.body.classList.toggle('measure-active', active);
    }
    
    /**
     * Toggle measurement mode
     */
    function toggleMeasurement() {
        if (_isActive) {
            stopMeasurement();
        } else {
            startMeasurement('linestring');
        }
    }
    
    /**
     * Clean up resources
     */
    function cleanup() {
        // Make sure to re-enable click events
        if (_isActive) {
            enableMapClickEvents();
        }
        
        if (_measureControl && _map) {
            _map.removeControl(_measureControl);
            _measureControl = null;
        }
        
        // Clear all measurement features
        clearAllMeasurementFeatures();
        
        _isActive = false;
        _currentMode = null;
        _clickHandler = null;
    }
    
    // Public API
    return {
        initialize: initialize,
        startMeasurement: startMeasurement,
        stopMeasurement: stopMeasurement,
        clearMeasurements: clearMeasurements,
        toggleMeasurement: toggleMeasurement,
        cleanup: cleanup,
        isActive: function() { return _isActive; },
        getCurrentMode: function() { return _currentMode; },
        forceShowMeasurementText: ensureMeasurementTextVisible
    };
})();

// Global function to manually trigger measurement text visibility
window.forceShowMeasurementText = function() {
    if (App.Features.Measure.forceShowMeasurementText) {
        App.Features.Measure.forceShowMeasurementText();
    }
};

console.log('app.features.measure.js loaded - App.Features.Measure module created');