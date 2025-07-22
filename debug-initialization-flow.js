/**
 * Enhanced Debugging Script for MapLibre Initialization Flow
 * This script tracks the entire initialization process to identify where setMapLibreLanguage() fails
 */

// Debug configuration
const DEBUG_CONFIG = {
    enabled: true,
    logLevel: 'verbose', // 'verbose', 'normal', 'minimal'
    trackTiming: true,
    trackEngineType: true,
    trackI18nSystem: true,
    trackAndroidBridge: true
};

// Debug state tracker
const DEBUG_STATE = {
    startTime: Date.now(),
    events: [],
    timings: {},
    engineType: null,
    i18nStatus: null,
    androidBridge: null,
    mapInstance: null
};

// Enhanced logging function
function debugLog(level, category, message, data = null) {
    if (!DEBUG_CONFIG.enabled) return;
    
    const timestamp = Date.now() - DEBUG_STATE.startTime;
    const logEntry = {
        timestamp,
        level,
        category,
        message,
        data
    };
    
    DEBUG_STATE.events.push(logEntry);
    
    // Console output with color coding
    const colors = {
        error: '\x1b[31m',
        warn: '\x1b[33m',
        info: '\x1b[36m',
        success: '\x1b[32m',
        reset: '\x1b[0m'
    };
    
    const color = colors[level] || colors.info;
    const prefix = `${color}[${timestamp}ms][${category}]${colors.reset}`;
    
    console.log(`${prefix} ${message}`, data ? data : '');
    
    // Also log to Android if available
    if (typeof Android !== 'undefined' && Android.log) {
        Android.log(`[DEBUG][${category}] ${message}`, data ? JSON.stringify(data) : '');
    }
}

// Engine type detection with enhanced logging
function detectEngineType() {
    debugLog('info', 'ENGINE', 'Starting engine type detection');
    
    // Check if we're in a MapLibre environment
    const indicators = {
        maplibregl: typeof maplibregl !== 'undefined',
        mapConfig: typeof mapConfig !== 'undefined',
        App: typeof App !== 'undefined',
        engineUrl: window.location.href
    };
    
    debugLog('info', 'ENGINE', 'Engine indicators detected:', indicators);
    
    let engineType = 'UNKNOWN';
    
    // Determine engine type based on indicators
    if (indicators.maplibregl && indicators.mapConfig) {
        engineType = 'MAPLIBRE';
    } else if (window.location.href.includes('engine_ml')) {
        engineType = 'MAPLIBRE';
    } else if (window.location.href.includes('bridgeAssets/engine')) {
        engineType = 'LEAFLET';
    }
    
    DEBUG_STATE.engineType = engineType;
    debugLog('success', 'ENGINE', `Engine type determined: ${engineType}`);
    
    return engineType;
}

// Android bridge detection
function detectAndroidBridge() {
    debugLog('info', 'BRIDGE', 'Checking Android bridge availability');
    
    const bridgeStatus = {
        androidObject: typeof Android !== 'undefined',
        receiveData: typeof Android !== 'undefined' && typeof Android.receiveData === 'function',
        onCallback: typeof Android !== 'undefined' && typeof Android.onCallback === 'function',
        log: typeof Android !== 'undefined' && typeof Android.log === 'function',
        userAgent: navigator.userAgent,
        isWebView: /wv/.test(navigator.userAgent)
    };
    
    DEBUG_STATE.androidBridge = bridgeStatus;
    debugLog('info', 'BRIDGE', 'Android bridge status:', bridgeStatus);
    
    return bridgeStatus;
}

// I18n system detection
function detectI18nSystem() {
    debugLog('info', 'I18N', 'Checking I18n system availability');
    
    const i18nStatus = {
        appNamespace: typeof App !== 'undefined',
        i18nNamespace: typeof App !== 'undefined' && typeof App.I18n !== 'undefined',
        initMethod: typeof App !== 'undefined' && typeof App.I18n !== 'undefined' && typeof App.I18n.init === 'function',
        setLanguageMethod: typeof App !== 'undefined' && typeof App.I18n !== 'undefined' && typeof App.I18n.setLanguage === 'function',
        currentLanguage: null,
        availableLanguages: []
    };
    
    // Try to get current language if available
    if (i18nStatus.i18nNamespace && App.I18n.getLanguage) {
        try {
            i18nStatus.currentLanguage = App.I18n.getLanguage();
        } catch (e) {
            debugLog('warn', 'I18N', 'Error getting current language:', e);
        }
    }
    
    // Try to get available languages if available
    if (i18nStatus.i18nNamespace && App.I18n.getAvailableLanguages) {
        try {
            i18nStatus.availableLanguages = App.I18n.getAvailableLanguages();
        } catch (e) {
            debugLog('warn', 'I18N', 'Error getting available languages:', e);
        }
    }
    
    DEBUG_STATE.i18nStatus = i18nStatus;
    debugLog('info', 'I18N', 'I18n system status:', i18nStatus);
    
    return i18nStatus;
}

// Map instance detection
function detectMapInstance() {
    debugLog('info', 'MAP', 'Checking map instance availability');
    
    const mapStatus = {
        appMapInit: typeof App !== 'undefined' && typeof App.Map !== 'undefined' && typeof App.Map.Init !== 'undefined',
        getMapMethod: typeof App !== 'undefined' && typeof App.Map !== 'undefined' && typeof App.Map.Init !== 'undefined' && typeof App.Map.Init.getMap === 'function',
        mapInstance: null,
        mapReady: false,
        windowInterface: typeof window.interface !== 'undefined' && typeof window.interface.map !== 'undefined'
    };
    
    // Try to get map instance
    if (mapStatus.getMapMethod) {
        try {
            mapStatus.mapInstance = App.Map.Init.getMap();
            mapStatus.mapReady = mapStatus.mapInstance !== null;
        } catch (e) {
            debugLog('warn', 'MAP', 'Error getting map instance:', e);
        }
    }
    
    // Check window.interface as fallback
    if (!mapStatus.mapInstance && mapStatus.windowInterface) {
        mapStatus.mapInstance = window.interface.map;
        mapStatus.mapReady = mapStatus.mapInstance !== null;
    }
    
    DEBUG_STATE.mapInstance = mapStatus;
    debugLog('info', 'MAP', 'Map instance status:', mapStatus);
    
    return mapStatus;
}

// Enhanced sendInitSignal detection
function monitorSendInitSignal() {
    debugLog('info', 'INIT', 'Setting up sendInitSignal monitoring');
    
    // Hook into the 'initiated' event callback
    const originalAndroidCallback = window.Android && window.Android.onCallback;
    
    if (originalAndroidCallback) {
        window.Android.onCallback = function(action, data) {
            debugLog('info', 'CALLBACK', `Android callback received: ${action}`, data);
            
            if (action === 'initiated') {
                debugLog('success', 'INIT', 'INITIATED event received - this should trigger sendInitSignal');
                
                // Track what happens after initiated
                setTimeout(() => {
                    debugLog('info', 'INIT', 'Checking initialization status 1 second after initiated');
                    performComprehensiveCheck();
                }, 1000);
            }
            
            // Call original callback
            return originalAndroidCallback.call(this, action, data);
        };
    }
    
    // Also monitor direct calls to sendInitSignal-like functions
    const originalReceiveData = window.Android && window.Android.receiveData;
    if (originalReceiveData) {
        window.Android.receiveData = function(data) {
            debugLog('info', 'BRIDGE', 'receiveData called with:', data);
            
            try {
                const parsed = JSON.parse(data);
                if (parsed.action === 'initSignal' || parsed.action === 'init') {
                    debugLog('success', 'INIT', 'Init signal detected in receiveData');
                }
            } catch (e) {
                // Not JSON, might be direct call
                debugLog('info', 'BRIDGE', 'receiveData called with non-JSON data:', data);
            }
            
            return originalReceiveData.call(this, data);
        };
    }
}

// Enhanced setMapLibreLanguage monitoring
function monitorSetMapLibreLanguage() {
    debugLog('info', 'LANGUAGE', 'Setting up setMapLibreLanguage monitoring');
    
    // Hook into JavaScript execution to catch language setting calls
    const originalExecJavaScript = window.execJavaScript;
    if (originalExecJavaScript) {
        window.execJavaScript = function(jsCode) {
            if (jsCode.includes('setLanguage') || jsCode.includes('I18n')) {
                debugLog('success', 'LANGUAGE', 'Language-related JavaScript execution detected:', jsCode);
            }
            return originalExecJavaScript.call(this, jsCode);
        };
    }
    
    // Monitor App.I18n.setLanguage calls directly
    if (typeof App !== 'undefined' && App.I18n && App.I18n.setLanguage) {
        const originalSetLanguage = App.I18n.setLanguage;
        App.I18n.setLanguage = function(language) {
            debugLog('success', 'LANGUAGE', `App.I18n.setLanguage called with: ${language}`);
            
            // Track timing
            const startTime = Date.now();
            
            try {
                const result = originalSetLanguage.call(this, language);
                const endTime = Date.now();
                debugLog('success', 'LANGUAGE', `setLanguage completed in ${endTime - startTime}ms`);
                return result;
            } catch (e) {
                debugLog('error', 'LANGUAGE', 'Error in setLanguage:', e);
                throw e;
            }
        };
    }
}

// Comprehensive system check
function performComprehensiveCheck() {
    debugLog('info', 'CHECK', 'Performing comprehensive system check');
    
    const checkResults = {
        engineType: detectEngineType(),
        androidBridge: detectAndroidBridge(),
        i18nSystem: detectI18nSystem(),
        mapInstance: detectMapInstance(),
        timing: Date.now() - DEBUG_STATE.startTime
    };
    
    debugLog('info', 'CHECK', 'Comprehensive check results:', checkResults);
    
    // Analyze results and provide recommendations
    const recommendations = analyzeResults(checkResults);
    debugLog('info', 'ANALYSIS', 'Recommendations:', recommendations);
    
    return checkResults;
}

// Results analysis
function analyzeResults(results) {
    const recommendations = [];
    
    // Engine type analysis
    if (results.engineType !== 'MAPLIBRE') {
        recommendations.push({
            severity: 'critical',
            category: 'engine',
            message: 'Engine type is not MAPLIBRE - language setting will not work',
            action: 'Verify engineType detection in Android code'
        });
    }
    
    // Android bridge analysis
    if (!results.androidBridge.androidObject) {
        recommendations.push({
            severity: 'critical',
            category: 'bridge',
            message: 'Android object not available - not running in WebView',
            action: 'Ensure code is running in Android WebView environment'
        });
    }
    
    // I18n system analysis
    if (!results.i18nSystem.i18nNamespace) {
        recommendations.push({
            severity: 'critical',
            category: 'i18n',
            message: 'App.I18n namespace not available',
            action: 'Ensure i18n-manager.js is loaded before initialization'
        });
    }
    
    if (!results.i18nSystem.setLanguageMethod) {
        recommendations.push({
            severity: 'critical',
            category: 'i18n',
            message: 'App.I18n.setLanguage method not available',
            action: 'Check if i18n-manager.js loaded correctly'
        });
    }
    
    // Map instance analysis
    if (!results.mapInstance.mapReady) {
        recommendations.push({
            severity: 'warning',
            category: 'map',
            message: 'Map instance not ready - initialization may be too early',
            action: 'Add delay or wait for map load event'
        });
    }
    
    return recommendations;
}

// Manual testing functions
function testLanguageSetting(languageCode = 'de') {
    debugLog('info', 'TEST', `Testing language setting with code: ${languageCode}`);
    
    const testResults = {
        beforeTest: performComprehensiveCheck(),
        testExecuted: false,
        testSuccess: false,
        error: null
    };
    
    try {
        if (typeof App !== 'undefined' && App.I18n && App.I18n.setLanguage) {
            App.I18n.setLanguage(languageCode);
            testResults.testExecuted = true;
            testResults.testSuccess = true;
            debugLog('success', 'TEST', `Language setting test successful for: ${languageCode}`);
        } else {
            testResults.error = 'App.I18n.setLanguage not available';
            debugLog('error', 'TEST', testResults.error);
        }
    } catch (e) {
        testResults.error = e.message;
        debugLog('error', 'TEST', 'Language setting test failed:', e);
    }
    
    return testResults;
}

// Initialize debugging system
function initializeDebugSystem() {
    debugLog('info', 'SYSTEM', 'Initializing debug system');
    
    // Initial system detection
    performComprehensiveCheck();
    
    // Set up monitoring
    monitorSendInitSignal();
   testOk, n

    
    // Set up periodic checks
    setInterval(() => {
        if (DEBUG_CONFIG.trackTiming) {
            debugLog('info', 'PERIODIC', 'Periodic system check');
            performComprehensiveCheck();
        }
    }, 10000); // Check every 10 seconds
    
    // Export global functions for manual testing
    window.debugMapInit = {
        performCheck: performComprehensiveCheck,
        testLanguage: testLanguageSetting,
        getEvents: () => DEBUG_STATE.events,
        getState: () => DEBUG_STATE,
        enableVerbose: () => { DEBUG_CONFIG.logLevel = 'verbose'; },
        disableDebug: () => { DEBUG_CONFIG.enabled = false; }
    };
    
    debugLog('success', 'SYSTEM', 'Debug system initialized - access via window.debugMapInit');
}

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    debugLog('info', 'SYSTEM', 'DOM loaded - initializing debug system');
    initializeDebugSystem();
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', initializeDebugSystem);
} else {
    // DOM is already loaded
    initializeDebugSystem();
}

// Export for manual access
window.initializeDebugSystem = initializeDebugSystem;

console.log('🔍 MapLibre Initialization Debug System loaded');
console.log('📊 Access debugging functions via window.debugMapInit');
console.log('🛠️ Manual initialization: window.initializeDebugSystem()');