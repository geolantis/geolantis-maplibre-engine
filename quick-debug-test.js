/**
 * Quick Debug Test Script
 * Run this in the JavaScript console to immediately check the initialization state
 */

function quickDebugTest() {
    console.log('🔍 Quick Debug Test - MapLibre Language Initialization');
    console.log('==========================================');
    
    const results = {
        timestamp: new Date().toISOString(),
        engineDetection: {},
        i18nSystem: {},
        androidBridge: {},
        mapInstance: {},
        recommendations: []
    };
    
    // 1. Check engine type indicators
    console.log('1. Engine Type Detection:');
    results.engineDetection = {
        maplibregl: typeof maplibregl !== 'undefined',
        mapConfig: typeof mapConfig !== 'undefined',
        currentUrl: window.location.href,
        userAgent: navigator.userAgent,
        isWebView: /wv/.test(navigator.userAgent)
    };
    
    console.log('   - maplibregl available:', results.engineDetection.maplibregl);
    console.log('   - mapConfig available:', results.engineDetection.mapConfig);
    console.log('   - Current URL:', results.engineDetection.currentUrl);
    console.log('   - Is WebView:', results.engineDetection.isWebView);
    
    // Determine expected engine type
    const expectedEngine = results.engineDetection.currentUrl.includes('engine_ml') ? 'MAPLIBRE' : 'LEAFLET';
    console.log('   - Expected engine type:', expectedEngine);
    
    if (expectedEngine !== 'MAPLIBRE') {
        results.recommendations.push({
            severity: 'CRITICAL',
            issue: 'Wrong engine type detected',
            solution: 'Ensure you are loading the MapLibre engine (engine_ml/index.html)'
        });
    }
    
    // 2. Check I18n system
    console.log('\n2. I18n System Status:');
    results.i18nSystem = {
        appNamespace: typeof App !== 'undefined',
        i18nNamespace: typeof App !== 'undefined' && typeof App.I18n !== 'undefined',
        initMethod: false,
        setLanguageMethod: false,
        getLanguageMethod: false,
        currentLanguage: null,
        isInitialized: false
    };
    
    if (results.i18nSystem.appNamespace) {
        console.log('   - App namespace: ✅ Available');
        
        if (results.i18nSystem.i18nNamespace) {
            console.log('   - App.I18n namespace: ✅ Available');
            
            results.i18nSystem.initMethod = typeof App.I18n.init === 'function';
            results.i18nSystem.setLanguageMethod = typeof App.I18n.setLanguage === 'function';
            results.i18nSystem.getLanguageMethod = typeof App.I18n.getLanguage === 'function';
            results.i18nSystem.isInitialized = typeof App.I18n.initialized === 'boolean' ? App.I18n.initialized : false;
            
            console.log('   - init() method:', results.i18nSystem.initMethod ? '✅' : '❌');
            console.log('   - setLanguage() method:', results.i18nSystem.setLanguageMethod ? '✅' : '❌');
            console.log('   - getLanguage() method:', results.i18nSystem.getLanguageMethod ? '✅' : '❌');
            console.log('   - Is initialized:', results.i18nSystem.isInitialized ? '✅' : '❌');
            
            if (results.i18nSystem.getLanguageMethod) {
                try {
                    results.i18nSystem.currentLanguage = App.I18n.getLanguage();
                    console.log('   - Current language:', results.i18nSystem.currentLanguage);
                } catch (e) {
                    console.log('   - Current language: ❌ Error getting language');
                }
            }
        } else {
            console.log('   - App.I18n namespace: ❌ Not available');
            results.recommendations.push({
                severity: 'CRITICAL',
                issue: 'App.I18n namespace not available',
                solution: 'Ensure i18n-manager.js is loaded before this script'
            });
        }
    } else {
        console.log('   - App namespace: ❌ Not available');
        results.recommendations.push({
            severity: 'CRITICAL',
            issue: 'App namespace not available',
            solution: 'Ensure main app scripts are loaded before this script'
        });
    }
    
    // 3. Check Android bridge
    console.log('\n3. Android Bridge Status:');
    results.androidBridge = {
        androidObject: typeof Android !== 'undefined',
        receiveDataMethod: false,
        onCallbackMethod: false,
        logMethod: false
    };
    
    if (results.androidBridge.androidObject) {
        console.log('   - Android object: ✅ Available');
        
        results.androidBridge.receiveDataMethod = typeof Android.receiveData === 'function';
        results.androidBridge.onCallbackMethod = typeof Android.onCallback === 'function';
        results.androidBridge.logMethod = typeof Android.log === 'function';
        
        console.log('   - receiveData() method:', results.androidBridge.receiveDataMethod ? '✅' : '❌');
        console.log('   - onCallback() method:', results.androidBridge.onCallbackMethod ? '✅' : '❌');
        console.log('   - log() method:', results.androidBridge.logMethod ? '✅' : '❌');
    } else {
        console.log('   - Android object: ❌ Not available');
        if (results.engineDetection.isWebView) {
            results.recommendations.push({
                severity: 'CRITICAL',
                issue: 'Android object not available in WebView',
                solution: 'Check if Android bridge is properly initialized in native code'
            });
        } else {
            results.recommendations.push({
                severity: 'INFO',
                issue: 'Not running in Android WebView',
                solution: 'This is expected when testing in desktop browser'
            });
        }
    }
    
    // 4. Check map instance
    console.log('\n4. Map Instance Status:');
    results.mapInstance = {
        appMapNamespace: typeof App !== 'undefined' && typeof App.Map !== 'undefined',
        appMapInitNamespace: false,
        getMapMethod: false,
        mapInstance: null,
        mapReady: false
    };
    
    if (results.mapInstance.appMapNamespace) {
        console.log('   - App.Map namespace: ✅ Available');
        
        results.mapInstance.appMapInitNamespace = typeof App.Map.Init !== 'undefined';
        
        if (results.mapInstance.appMapInitNamespace) {
            console.log('   - App.Map.Init namespace: ✅ Available');
            
            results.mapInstance.getMapMethod = typeof App.Map.Init.getMap === 'function';
            console.log('   - getMap() method:', results.mapInstance.getMapMethod ? '✅' : '❌');
            
            if (results.mapInstance.getMapMethod) {
                try {
                    results.mapInstance.mapInstance = App.Map.Init.getMap();
                    results.mapInstance.mapReady = results.mapInstance.mapInstance !== null;
                    console.log('   - Map instance ready:', results.mapInstance.mapReady ? '✅' : '❌');
                } catch (e) {
                    console.log('   - Map instance ready: ❌ Error getting map');
                }
            }
        } else {
            console.log('   - App.Map.Init namespace: ❌ Not available');
        }
    } else {
        console.log('   - App.Map namespace: ❌ Not available');
    }
    
    // 5. Test language setting (if possible)
    console.log('\n5. Language Setting Test:');
    if (results.i18nSystem.setLanguageMethod) {
        try {
            console.log('   - Testing setLanguage("de")...');
            App.I18n.setLanguage('de');
            console.log('   - ✅ Language setting successful');
            
            if (results.i18nSystem.getLanguageMethod) {
                const newLanguage = App.I18n.getLanguage();
                console.log('   - Current language after setting:', newLanguage);
            }
        } catch (e) {
            console.log('   - ❌ Language setting failed:', e.message);
            results.recommendations.push({
                severity: 'HIGH',
                issue: 'Language setting failed',
                solution: 'Check if i18n system is properly initialized'
            });
        }
    } else {
        console.log('   - ❌ Cannot test - setLanguage method not available');
    }
    
    // 6. Recommendations
    console.log('\n6. Recommendations:');
    if (results.recommendations.length === 0) {
        console.log('   - ✅ No critical issues found');
    } else {
        results.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. [${rec.severity}] ${rec.issue}`);
            console.log(`      Solution: ${rec.solution}`);
        });
    }
    
    // 7. Summary
    console.log('\n7. Summary:');
    const criticalIssues = results.recommendations.filter(r => r.severity === 'CRITICAL').length;
    const highIssues = results.recommendations.filter(r => r.severity === 'HIGH').length;
    
    if (criticalIssues === 0 && highIssues === 0) {
        console.log('   - ✅ System appears to be working correctly');
        console.log('   - If you\'re still not seeing language changes, check Android logs');
    } else {
        console.log(`   - ❌ Found ${criticalIssues} critical and ${highIssues} high priority issues`);
        console.log('   - Fix these issues before testing language functionality');
    }
    
    console.log('\n==========================================');
    console.log('🔍 Quick Debug Test Complete');
    
    return results;
}

// Auto-run the test
console.log('Running quick debug test...');
const testResults = quickDebugTest();

// Export for manual access
window.quickDebugTest = quickDebugTest;
window.lastDebugResults = testResults;

console.log('\n💡 Tip: Run "quickDebugTest()" again to re-run the test');
console.log('💡 Tip: Access last results via "window.lastDebugResults"');