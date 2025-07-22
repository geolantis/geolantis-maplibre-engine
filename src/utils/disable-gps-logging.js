/**
 * Disable all GPS-related console logging for performance
 * Console operations during high-frequency updates cause frame drops
 */
(function() {
    'use strict';
    
    console.log('[GPS Logging] Disabling GPS-related console logs for performance...');
    
    // Store original console methods
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalInfo = console.info;
    const originalError = console.error;
    
    // List of GPS-related patterns to suppress
    const suppressPatterns = [
        'setPosition called with:',
        'setPositionEnabled called with:',
        'Bridge: setPositionEnabled',
        'GPS position update',
        '[GPS Diagnostic]',
        'FRAME DROP DETECTED',
        '[UIBridge] Updating status footer',
        'updateGPSLocation called with:',
        '[CommandLine Extension]',
        'window.statusFooterBridge',
        'Updating status footer with:',
        '[UIBridge]'
    ];
    
    // Override console methods
    console.log = function() {
        const message = arguments[0];
        if (typeof message === 'string') {
            for (const pattern of suppressPatterns) {
                if (message.includes(pattern)) {
                    return; // Suppress this log
                }
            }
        }
        return originalLog.apply(console, arguments);
    };
    
    console.warn = function() {
        const message = arguments[0];
        if (typeof message === 'string') {
            for (const pattern of suppressPatterns) {
                if (message.includes(pattern)) {
                    return; // Suppress this warning
                }
            }
        }
        return originalWarn.apply(console, arguments);
    };
    
    console.info = function() {
        const message = arguments[0];
        if (typeof message === 'string') {
            for (const pattern of suppressPatterns) {
                if (message.includes(pattern)) {
                    return; // Suppress this info
                }
            }
        }
        return originalInfo.apply(console, arguments);
    };
    
    console.error = function() {
        const message = arguments[0];
        if (typeof message === 'string') {
            for (const pattern of suppressPatterns) {
                if (message.includes(pattern)) {
                    return; // Suppress this error
                }
            }
        }
        return originalError.apply(console, arguments);
    };
    
    // Add a method to restore original logging
    window.restoreGPSLogging = function() {
        console.log = originalLog;
        console.warn = originalWarn;
        console.info = originalInfo;
        console.error = originalError;
        console.log('[GPS Logging] Console logging restored');
    };
    
    // Add a method to check if GPS logging is disabled
    window.isGPSLoggingDisabled = function() {
        return console.log !== originalLog;
    };
    
    console.log('[GPS Logging] GPS-related console logs disabled. Use restoreGPSLogging() to re-enable.');
})();