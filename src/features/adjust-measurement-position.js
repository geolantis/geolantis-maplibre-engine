/**
 * Dynamically adjust measurement control position based on dynamic button visibility
 * This module ensures the measurement control appears below the dynamic buttons vertically
 */
(function() {
    // Track the measurement control element
    let measurementControl = null;
    let dynamicButtonControl = null;
    let positionUpdateInterval = null;
    
    /**
     * Calculate the offset needed for the measurement control
     * @returns {number} The top offset in pixels
     */
    function calculateMeasurementOffset() {
        // Find the dynamic button control
        dynamicButtonControl = dynamicButtonControl || document.querySelector('.dynamic-button-control');
        
        if (!dynamicButtonControl) {
            console.log('Dynamic button control not found');
            return 10; // Default offset if no dynamic buttons
        }
        
        // Get all buttons in the dynamic control
        const buttons = dynamicButtonControl.querySelectorAll('button');
        let visibleCount = 0;
        
        // Count visible buttons
        buttons.forEach(button => {
            const computed = window.getComputedStyle(button);
            const isVisible = computed.visibility !== 'hidden' && 
                            computed.display !== 'none' && 
                            computed.opacity !== '0';
            
            if (isVisible) {
                visibleCount++;
            }
        });
        
        // Get actual button height from computed styles
        let buttonHeight = 50; // Default height
        const firstButton = dynamicButtonControl.querySelector('.dynamic-button-primary');
        if (firstButton) {
            const computed = window.getComputedStyle(firstButton);
            buttonHeight = parseFloat(computed.height) || 50;
        }
        
        // Calculate offset based on visible buttons
        const buttonSpacing = 5; // Spacing between buttons
        const baseOffset = 10; // Base offset from top
        
        const totalHeight = baseOffset + 
                          (visibleCount * buttonHeight) + 
                          ((visibleCount - 1) * buttonSpacing);
        
        console.log(`Calculated measurement offset: ${totalHeight}px for ${visibleCount} visible buttons`);
        return totalHeight;
    }
    
    /**
     * Update the position of the measurement control
     */
    function updateMeasurementPosition() {
        // Find the measurement control if not already cached
        if (!measurementControl) {
            measurementControl = document.querySelector('.maplibre-terradraw-measure-control');
            if (!measurementControl) {
                measurementControl = document.querySelector('.maplibregl-ctrl-measures');
            }
        }
        
        if (!measurementControl) {
            return; // Control not found yet
        }
        
        // Calculate and apply the offset
        const offset = calculateMeasurementOffset();
        
        // Apply positioning styles
        measurementControl.style.position = 'absolute';
        measurementControl.style.top = offset + 'px';
        measurementControl.style.left = '10px';
        measurementControl.style.marginTop = '0'; // Reset any existing margin
        measurementControl.style.marginLeft = '0'; // Reset any existing margin
        
        // Ensure it's in the correct stacking order
        measurementControl.style.zIndex = '1000';
        
        console.log('Updated measurement control position to:', offset + 'px');
    }
    
    /**
     * Observe changes to the dynamic button control
     */
    function observeDynamicButtons() {
        dynamicButtonControl = document.querySelector('.dynamic-button-control');
        
        if (!dynamicButtonControl) {
            // Try again later if control not found
            setTimeout(observeDynamicButtons, 500);
            return;
        }
        
        // Create a MutationObserver to watch for changes
        const observer = new MutationObserver((mutations) => {
            // Debounce the position update
            clearTimeout(positionUpdateInterval);
            positionUpdateInterval = setTimeout(updateMeasurementPosition, 100);
        });
        
        // Observe the dynamic button control for changes
        observer.observe(dynamicButtonControl, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'visibility', 'opacity']
        });
        
        console.log('Started observing dynamic button changes');
    }
    
    /**
     * Initialize the measurement position adjuster
     */
    function initialize() {
        console.log('Initializing measurement position adjuster...');
        
        // Start observing for dynamic button changes
        observeDynamicButtons();
        
        // Listen for measurement control being added
        const checkForMeasurementControl = setInterval(() => {
            const control = document.querySelector('.maplibre-terradraw-measure-control') ||
                          document.querySelector('.maplibregl-ctrl-measures');
            
            if (control && !measurementControl) {
                measurementControl = control;
                clearInterval(checkForMeasurementControl);
                
                // Initial position update
                updateMeasurementPosition();
                
                // Update position whenever dynamic buttons change
                if (App && App.Core && App.Core.Events) {
                    App.Core.Events.on('dynamicbutton:updated', updateMeasurementPosition);
                    App.Core.Events.on('dynamicbutton:visibilitychanged', updateMeasurementPosition);
                }
                
                console.log('Measurement control found and positioned');
            }
        }, 100);
        
        // Also listen for measurement events
        if (App && App.Core && App.Core.Events) {
            App.Core.Events.on('measure:started', () => {
                // Reset the cache and update position when measurement starts
                measurementControl = null;
                setTimeout(updateMeasurementPosition, 200);
            });
        }
    }
    
    // Export the functions globally for external access
    window.adjustMeasurementPosition = updateMeasurementPosition;
    window.initMeasurementPositioning = initialize;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already loaded
        setTimeout(initialize, 100);
    }
})();

console.log('adjust-measurement-position.js loaded');