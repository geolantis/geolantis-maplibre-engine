/**
 * Measurement integration with Dynamic Button
 * Connects the Measurement feature to the existing Dynamic Button UI component
 */
document.addEventListener('DOMContentLoaded', function() {
    // Wait for the Dynamic Button and Measure modules to be available
    function initMeasureDynamicButtonIntegration() {
        // Check if required modules exist
        if (!App.UI || !App.UI.DynamicButton || !App.Features || !App.Features.Measure) {
            console.log('Waiting for Dynamic Button and Measure modules to load...');
            setTimeout(initMeasureDynamicButtonIntegration, 500);
            return;
        }
        
        console.log('Initializing Measure integration with Dynamic Button...');
        
        // Register Measure actions with the Dynamic Button
        
        // 1. Toggle Measure action - This starts measurement mode
        App.UI.DynamicButton.onAction('toggleMeasure', function() {
            console.log('Dynamic Button: Toggling measure mode');
            
            // Get the map instance if needed for initialization
            const map = App.Map.Init.getMap();
            
            // Ensure Measure is initialized
            if (map && typeof App.Features.Measure.initialize === 'function') {
                App.Features.Measure.initialize(map);
            }
            
            // Toggle measurement
            App.Features.Measure.toggleMeasurement();
        });
        
        // 2. Stop Measure action
        App.UI.DynamicButton.onAction('stopMeasure', function() {
            console.log('Dynamic Button: Stopping measure mode');
            
            // Stop measurement
            App.Features.Measure.stopMeasurement();
        });
        
        // 3. Clear Measurements action
        App.UI.DynamicButton.onAction('clearMeasurements', function() {
            console.log('Dynamic Button: Clearing measurements');
            
            // Clear all measurements
            App.Features.Measure.clearMeasurements();
        });
        
        // Listen for measurement events to update Dynamic Button state
        if (App.Core.Events) {
            App.Core.Events.on('measure:started', function(data) {
                // Update Dynamic Button to measure mode
                App.UI.DynamicButton.setMode('measure');
                
                // Show notification
                showMeasureNotification('Measurement Started', 'Click on the map to start measuring distances and areas.');
            });
            
            App.Core.Events.on('measure:stopped', function() {
                // Update Dynamic Button back to default mode
                App.UI.DynamicButton.setMode('default');
                
                // Show notification
                showMeasureNotification('Measurement Stopped', 'Measurement mode has been deactivated.');
            });
            
            App.Core.Events.on('measure:cleared', function() {
                // Show notification
                showMeasureNotification('Measurements Cleared', 'All measurements have been removed from the map.');
            });
            
            App.Core.Events.on('measure:libraryLoaded', function() {
                console.log('Measurement library loaded successfully');
            });
        }
        
        // Utility function to show notifications
        function showMeasureNotification(title, message, variant = 'primary') {
            const alert = document.createElement('sl-alert');
            alert.variant = variant;
            alert.closable = true;
            alert.duration = 3000;
            
            const iconMap = {
                'primary': 'info-circle',
                'success': 'check-circle',
                'warning': 'exclamation-triangle',
                'danger': 'x-circle'
            };
            
            alert.innerHTML = `
                <sl-icon slot="icon" name="${iconMap[variant] || 'info-circle'}"></sl-icon>
                <strong>${title}</strong><br>
                ${message}
            `;
            
            document.body.appendChild(alert);
            alert.toast();
        }
        
        // Add custom styles for measurement mode
        const style = document.createElement('style');
        style.textContent = `
            /* Measurement mode styles */
            body.measure-active {
                cursor: crosshair !important;
            }
            
            .maplibregl-canvas-container.maplibregl-interactive {
                cursor: crosshair !important;
            }
            
            /* Terradraw control styles */
            .maplibre-terradraw-measure-control {
                margin: 10px;
            }
            
            /* Custom measurement result styles */
            .measurement-result {
                background: rgba(255, 255, 255, 0.9);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
        `;
        document.head.appendChild(style);
        
        console.log('Measure and Dynamic Button integration complete');
    }
    
    // Start initialization with a delay
    setTimeout(initMeasureDynamicButtonIntegration, 1000);
});

console.log('measure-dynamic-integration.js loaded');