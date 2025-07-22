/**
 * UI Initialization Manager
 * Manages the visibility of UI elements during app initialization to prevent flash of unstyled content
 */
(function() {
    var _initialized = false;
    var _initTimeout = null;
    
    /**
     * Mark the UI as fully initialized and show all hidden elements
     */
    function markUIAsInitialized() {
        if (_initialized) return;
        
        _initialized = true;
        
        // Clear any pending timeout
        if (_initTimeout) {
            clearTimeout(_initTimeout);
            _initTimeout = null;
        }
        
        // Add initialized class to body
        document.body.classList.add('ui-initialized');
        
        // Mark all drawers as initialized
        document.querySelectorAll('sl-drawer[id$="-drawer"]').forEach(drawer => {
            drawer.classList.add('initialized');
        });
        
        // Mark sidebar content as ready
        document.querySelectorAll('.sidebar-content').forEach(content => {
            content.classList.add('ready');
        });
        
        console.log('UI marked as initialized');
    }
    
    /**
     * Check if key UI components are ready
     */
    function checkUIReady() {
        const checks = {
            layerUI: typeof App?.Map?.Layers?.UI !== 'undefined',
            basemapControls: document.getElementById('basemap-controls')?.children.length > 0,
            featureLayers: document.getElementById('featureLayersContainer')?.children.length > 0,
            shoelaceReady: customElements.get('sl-icon') !== undefined
        };
        
        const allReady = Object.values(checks).every(check => check === true);
        
        console.log('UI Ready Check:', checks, 'All Ready:', allReady);
        
        if (allReady) {
            markUIAsInitialized();
        }
        
        return allReady;
    }
    
    /**
     * Initialize the UI manager
     */
    function initialize() {
        console.log('UI Initialization Manager started');
        
        // Check periodically if UI is ready
        let checkCount = 0;
        const maxChecks = 50; // 5 seconds maximum
        
        const checkInterval = setInterval(() => {
            checkCount++;
            
            if (checkUIReady() || checkCount >= maxChecks) {
                clearInterval(checkInterval);
                
                if (checkCount >= maxChecks) {
                    console.warn('UI initialization timeout - forcing initialization');
                    markUIAsInitialized();
                }
            }
        }, 100);
        
        // Fallback timeout - ensure UI is shown after 3 seconds regardless
        _initTimeout = setTimeout(() => {
            console.warn('UI initialization fallback triggered');
            markUIAsInitialized();
        }, 3000);
    }
    
    // Export to global scope
    window.UIInitializationManager = {
        initialize: initialize,
        markAsInitialized: markUIAsInitialized,
        checkReady: checkUIReady
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM already loaded
        initialize();
    }
})();