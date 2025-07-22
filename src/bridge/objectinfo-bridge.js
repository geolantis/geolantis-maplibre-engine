/**
 * Object Info Bridge
 * 
 * This module provides the bridge between the Java UIBridge and the JavaScript
 * object info component, handling the display of complete GeoObject data.
 */

window.objectInfoBridge = (function() {
    'use strict';
    
    var _lastDisplayedObjectId = null;
    var _pendingDisplayQueue = []; // Queue for pending display requests
    var _isReady = false;
    
    /**
     * Display a GeoJSON feature in the object info component
     * @param {Object|string} feature - GeoJSON feature object or JSON string
     * @param {boolean} openSidebar - Whether to open the sidebar
     */
    function displayFeature(feature, openSidebar) {
        console.log('[ObjectInfoBridge] displayFeature called', { feature, openSidebar });
        
        try {
            // Parse if string
            if (typeof feature === 'string') {
                feature = JSON.parse(feature);
            }
            
            // Open sidebar if requested
            if (openSidebar) {
                const rightDrawer = document.getElementById('right1-drawer');
                if (rightDrawer) {
                    rightDrawer.show();
                    
                    // Add class to map to adjust width
                    const map = document.getElementById('map');
                    if (map) {
                        map.classList.add('drawer-open');
                    }
                }
            }
            
            // Display in object info component
            const objectInfo = document.querySelector('object-info');
            if (objectInfo && typeof objectInfo.setFeature === 'function') {
                objectInfo.setFeature(feature);
            } else {
                console.error('[ObjectInfoBridge] object-info component not found or not ready');
            }
            
        } catch (error) {
            console.error('[ObjectInfoBridge] Error displaying feature:', error);
        }
    }
    
    /**
     * Display complete GeoObject details
     * @param {Object|string} geoObjectData - Complete GeoObject data from Java
     * @param {boolean} openSidebar - Whether to open the sidebar
     */
    function displayGeoObjectDetails(geoObjectData, openSidebar) {
        console.log('[ObjectInfoBridge] displayGeoObjectDetails called', { 
            dataType: typeof geoObjectData,
            dataLength: typeof geoObjectData === 'string' ? geoObjectData.length : 'N/A',
            openSidebar: openSidebar 
        });
        
        try {
            // Parse if string
            if (typeof geoObjectData === 'string') {
                console.log('[ObjectInfoBridge] Parsing string data...');
                geoObjectData = JSON.parse(geoObjectData);
                console.log('[ObjectInfoBridge] Successfully parsed GeoObject data:', geoObjectData);
            }
            
            // Store the object ID
            if (geoObjectData.basicInfo && geoObjectData.basicInfo.id) {
                _lastDisplayedObjectId = geoObjectData.basicInfo.id;
            }
            
            // Open sidebar if requested
            if (openSidebar) {
                const rightDrawer = document.getElementById('right1-drawer');
                if (rightDrawer) {
                    rightDrawer.show();
                    
                    // Add class to map to adjust width
                    const map = document.getElementById('map');
                    if (map) {
                        map.classList.add('drawer-open');
                    }
                    
                    // Wait for drawer animation
                    setTimeout(() => {
                        displayInObjectInfo(geoObjectData);
                    }, 150);
                } else {
                    displayInObjectInfo(geoObjectData);
                }
            } else {
                displayInObjectInfo(geoObjectData);
            }
            
        } catch (error) {
            console.error('[ObjectInfoBridge] Error displaying GeoObject details:', error);
            console.error('[ObjectInfoBridge] Error stack:', error.stack);
            console.error('[ObjectInfoBridge] Original data type:', typeof geoObjectData);
            if (typeof geoObjectData === 'string') {
                console.error('[ObjectInfoBridge] Failed to parse string data. First 200 chars:', geoObjectData.substring(0, 200));
            }
        }
    }
    
    /**
     * Display the data in the object info component
     * @private
     */
    function displayInObjectInfo(geoObjectData) {
        console.log('[ObjectInfoBridge] displayInObjectInfo called');
        
        // First ensure the component is defined
        if (!customElements.get('object-info')) {
            console.error('[ObjectInfoBridge] ❌ object-info component not defined!');
            return;
        }
        
        // Use the helper function if available, otherwise retry manually
        if (window.ensureObjectInfoReady) {
            console.log('[ObjectInfoBridge] Using ensureObjectInfoReady helper');
            window.ensureObjectInfoReady((component) => {
                try {
                    if (typeof component.setGeoObjectData === 'function') {
                        console.log('[ObjectInfoBridge] Calling setGeoObjectData with:', geoObjectData);
                        component.setGeoObjectData(geoObjectData);
                        console.log('[ObjectInfoBridge] ✅ Successfully displayed GeoObject data via ensureObjectInfoReady');
                    } else if (typeof component.setFeature === 'function') {
                        console.log('[ObjectInfoBridge] setGeoObjectData not available, converting to feature format');
                        const convertedFeature = convertToFeature(geoObjectData);
                        component.setFeature(convertedFeature);
                        console.log('[ObjectInfoBridge] ✅ Displayed using fallback setFeature method via ensureObjectInfoReady');
                    } else {
                        console.error('[ObjectInfoBridge] ❌ Component found but no display methods available');
                        console.error('Component:', component);
                        console.error('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(component)));
                    }
                } catch (error) {
                    console.error('[ObjectInfoBridge] ❌ Error calling component method:', error);
                    console.error('Stack:', error.stack);
                }
            });
        } else {
            console.log('[ObjectInfoBridge] ensureObjectInfoReady not available, using manual retry');
            // Fallback to manual retry
            let attempts = 0;
            const maxAttempts = 20; // Increased attempts
            
            function tryDisplay() {
                const objectInfo = document.querySelector('object-info');
                
                if (!objectInfo) {
                    console.error('[ObjectInfoBridge] ❌ object-info element not found in DOM!');
                    attempts++;
                    if (attempts < maxAttempts) {
                        setTimeout(tryDisplay, 200);
                    }
                    return;
                }
                
                // Check if it's upgraded
                if (objectInfo.constructor.name === 'HTMLElement') {
                    console.log('[ObjectInfoBridge] Component not upgraded yet, waiting...');
                    customElements.upgrade(objectInfo);
                }
                
                if (objectInfo && typeof objectInfo.setGeoObjectData === 'function') {
                    console.log('[ObjectInfoBridge] Calling setGeoObjectData (manual retry)');
                    objectInfo.setGeoObjectData(geoObjectData);
                    console.log('[ObjectInfoBridge] ✅ Successfully displayed GeoObject data (manual retry)');
                } else if (objectInfo && typeof objectInfo.setFeature === 'function') {
                    console.log('[ObjectInfoBridge] Using fallback setFeature (manual retry)');
                    const convertedFeature = convertToFeature(geoObjectData);
                    objectInfo.setFeature(convertedFeature);
                    console.log('[ObjectInfoBridge] ✅ Displayed using fallback setFeature method (manual retry)');
                } else {
                    attempts++;
                    if (attempts < maxAttempts) {
                        console.log(`[ObjectInfoBridge] ⏳ Retry attempt ${attempts}/${maxAttempts}, component not ready`);
                        if (objectInfo) {
                            console.log('Component found but methods not available. Constructor:', objectInfo.constructor.name);
                            console.log('Prototype:', Object.getPrototypeOf(objectInfo));
                        }
                        setTimeout(tryDisplay, 200);
                    } else {
                        console.error(`[ObjectInfoBridge] ❌ Failed to display after ${maxAttempts} attempts`);
                        console.log('Final state - objectInfo exists:', !!objectInfo);
                        if (objectInfo) {
                            console.log('Constructor:', objectInfo.constructor.name);
                            console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(objectInfo)));
                        }
                        // Last resort - try to recreate the component
                        console.log('[ObjectInfoBridge] Attempting to recreate the component...');
                        const newObjectInfo = document.createElement('object-info');
                        objectInfo.parentNode.replaceChild(newObjectInfo, objectInfo);
                        setTimeout(() => tryDisplay(), 500);
                    }
                }
            }
            
            tryDisplay();
        }
    }
    
    /**
     * Convert GeoObject data to GeoJSON feature format
     * @private
     */
    function convertToFeature(geoObjectData) {
        const feature = {
            type: 'Feature',
            id: geoObjectData.basicInfo?.id,
            properties: {},
            geometry: geoObjectData.geometry || null
        };
        
        // Map basic info
        if (geoObjectData.basicInfo) {
            feature.properties.id = geoObjectData.basicInfo.id;
            feature.properties.name = geoObjectData.basicInfo.name;
            feature.properties.description = geoObjectData.basicInfo.description;
            feature.properties.objectType = geoObjectData.basicInfo.type;
        }
        
        // Map position info
        if (geoObjectData.position) {
            Object.assign(feature.properties, geoObjectData.position);
        }
        
        // Map creation info
        if (geoObjectData.creationInfo) {
            feature.properties.creationTime = geoObjectData.creationInfo.createdDate;
            feature.properties.creationUser = geoObjectData.creationInfo.createdBy;
            feature.properties.changeTime = geoObjectData.creationInfo.modifiedDate;
            feature.properties.changeUser = geoObjectData.creationInfo.modifiedBy;
        }
        
        // Include the full data as a special property
        feature.properties._geoObjectData = geoObjectData;
        
        return feature;
    }
    
    /**
     * Clear the currently displayed object
     */
    function clearDisplay() {
        const objectInfo = document.querySelector('object-info');
        if (objectInfo && typeof objectInfo.clearFeature === 'function') {
            objectInfo.clearFeature();
        }
        _lastDisplayedObjectId = null;
    }
    
    /**
     * Get the ID of the last displayed object
     */
    function getLastDisplayedObjectId() {
        return _lastDisplayedObjectId;
    }
    
    /**
     * Initialize the bridge and process any pending requests
     * @private
     */
    function _initialize() {
        console.log('[ObjectInfoBridge] Checking initialization...');
        
        // Check if object-info component is defined
        if (customElements.get('object-info')) {
            const objectInfo = document.querySelector('object-info');
            if (objectInfo) {
                // Wait for it to be ready
                if (window.ensureObjectInfoReady) {
                    window.ensureObjectInfoReady((component) => {
                        _isReady = true;
                        console.log('[ObjectInfoBridge] ✅ Bridge is ready, processing pending queue:', _pendingDisplayQueue.length, 'items');
                        _processPendingQueue();
                    });
                } else {
                    // Fallback
                    _isReady = true;
                    console.log('[ObjectInfoBridge] ✅ Bridge is ready (fallback)');
                    _processPendingQueue();
                }
            } else {
                console.log('[ObjectInfoBridge] object-info element not in DOM yet, retrying...');
                setTimeout(_initialize, 100);
            }
        } else {
            console.log('[ObjectInfoBridge] object-info component not defined yet, retrying...');
            setTimeout(_initialize, 100);
        }
    }
    
    /**
     * Process pending display requests
     * @private
     */
    function _processPendingQueue() {
        while (_pendingDisplayQueue.length > 0) {
            const request = _pendingDisplayQueue.shift();
            console.log('[ObjectInfoBridge] Processing pending request:', request.type);
            if (request.type === 'feature') {
                displayFeature(request.data, request.openSidebar);
            } else if (request.type === 'geoObject') {
                displayGeoObjectDetails(request.data, request.openSidebar);
            }
        }
    }
    
    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _initialize);
    } else {
        // DOM already loaded, initialize immediately
        setTimeout(_initialize, 100);
    }
    
    // Public API
    return {
        displayFeature: function(feature, openSidebar) {
            if (!_isReady) {
                console.log('[ObjectInfoBridge] Not ready yet, queuing feature display request');
                _pendingDisplayQueue.push({ type: 'feature', data: feature, openSidebar: openSidebar });
                return;
            }
            displayFeature(feature, openSidebar);
        },
        displayGeoObjectDetails: function(geoObjectData, openSidebar) {
            if (!_isReady) {
                console.log('[ObjectInfoBridge] Not ready yet, queuing GeoObject display request');
                _pendingDisplayQueue.push({ type: 'geoObject', data: geoObjectData, openSidebar: openSidebar });
                return;
            }
            displayGeoObjectDetails(geoObjectData, openSidebar);
        },
        clearDisplay: clearDisplay,
        getLastDisplayedObjectId: getLastDisplayedObjectId,
        isReady: function() { return _isReady; }
    };
    
})();

// Log that the bridge is ready
console.log('[ObjectInfoBridge] Bridge module loaded, waiting for initialization...');

// Add debug function to verify bridge is working
window.debugObjectInfoBridge = function() {
    console.log('[ObjectInfoBridge Debug] Checking bridge status...');
    console.log('- window.objectInfoBridge exists:', !!window.objectInfoBridge);
    console.log('- displayGeoObjectDetails exists:', !!(window.objectInfoBridge && window.objectInfoBridge.displayGeoObjectDetails));
    console.log('- displayFeature exists:', !!(window.objectInfoBridge && window.objectInfoBridge.displayFeature));
    console.log('- Bridge ready status:', window.objectInfoBridge ? window.objectInfoBridge.isReady() : 'N/A');
    console.log('- Pending queue length:', window.objectInfoBridge ? window.objectInfoBridge._pendingDisplayQueue : 'N/A');
    
    // Test with sample data
    const testData = {
        basicInfo: {
            id: 'test-123',
            name: 'Test Object',
            description: 'Test Description'
        },
        position: {
            latitude: 46.0,
            longitude: 14.0
        }
    };
    
    console.log('[ObjectInfoBridge Debug] Testing displayGeoObjectDetails with sample data...');
    try {
        window.objectInfoBridge.displayGeoObjectDetails(testData, true);
        console.log('[ObjectInfoBridge Debug] Test completed successfully');
    } catch (error) {
        console.error('[ObjectInfoBridge Debug] Test failed:', error);
    }
};