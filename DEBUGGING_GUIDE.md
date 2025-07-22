# MapLibre Language Initialization Debugging Guide

## Issue Overview
The user is not seeing the "Setting MapLibre language to: de" log message, which indicates that the `setMapLibreLanguage()` method is not being called properly.

## Root Cause Analysis

Based on the ANDROID_I18N_INTEGRATION.md documentation, the expected flow is:
1. WebView loads MapLibre engine
2. JavaScript fires 'initiated' event
3. Android receives 'initiated' callback
4. `sendInitSignal()` is called
5. `initializeI18nSystem()` is called
6. `setMapLanguage()` is called with Android locale
7. JavaScript executes `App.I18n.setLanguage()`

## Debugging Steps

### Step 1: Load the Debug Script

Add this script tag to your `index.html` file **before** any other scripts:

```html
<script src="debug-initialization-flow.js"></script>
```

### Step 2: Check Engine Type Detection

The most common issue is that `engineType` is not being detected as `MAPLIBRE`. Add this logging to your `DefaultBridgeMap.java`:

```java
// In the constructor or initialization method
LogControl.d(TAG, "=== ENGINE TYPE DEBUG ===");
LogControl.d(TAG, "Engine Type: " + engineType);
LogControl.d(TAG, "Engine Type == MAPLIBRE: " + (engineType == MapEngineManager.MapEngine.MAPLIBRE));
LogControl.d(TAG, "Engine URL: " + engineUrl);
LogControl.d(TAG, "=== END ENGINE TYPE DEBUG ===");
```

### Step 3: Track the 'initiated' Event

Add logging to track when the 'initiated' event is received:

```java
// In the onCallback method
@Override
public void onCallback(String action, String data) {
    LogControl.d(TAG, "=== CALLBACK DEBUG ===");
    LogControl.d(TAG, "Action: " + action);
    LogControl.d(TAG, "Data: " + data);
    LogControl.d(TAG, "Engine Type: " + engineType);
    LogControl.d(TAG, "=== END CALLBACK DEBUG ===");
    
    switch (action) {
        case "initiated":
            LogControl.d(TAG, "INITIATED event received - calling sendInitSignal");
            sendInitSignal(activity);
            
            // Add debugging for i18n initialization
            if (engineType == MapEngineManager.MapEngine.MAPLIBRE) {
                LogControl.d(TAG, "Engine is MAPLIBRE - calling initializeI18nSystem");
                initializeI18nSystem();
            } else {
                LogControl.d(TAG, "Engine is NOT MAPLIBRE - skipping i18n initialization");
                LogControl.d(TAG, "Current engine type: " + engineType);
            }
            break;
        // ... other cases
    }
}
```

### Step 4: Enhanced sendInitSignal Logging

Add comprehensive logging to your `sendInitSignal` method:

```java
private void sendInitSignal(Activity activity) {
    LogControl.d(TAG, "=== SEND INIT SIGNAL DEBUG ===");
    LogControl.d(TAG, "Method called with activity: " + activity);
    LogControl.d(TAG, "Engine type: " + engineType);
    LogControl.d(TAG, "WebView instance: " + (awv != null ? "Available" : "NULL"));
    
    // Your existing sendInitSignal implementation
    // Add logging after each significant operation
    
    LogControl.d(TAG, "=== END SEND INIT SIGNAL DEBUG ===");
}
```

### Step 5: Add initializeI18nSystem Method with Debugging

If you don't have this method yet, add it to your `DefaultBridgeMap.java`:

```java
/**
 * Initialize MapLibre i18n system with Android locale
 */
public void initializeI18nSystem() {
    LogControl.d(TAG, "=== INITIALIZE I18N SYSTEM DEBUG ===");
    LogControl.d(TAG, "Engine type: " + engineType);
    LogControl.d(TAG, "Engine type == MAPLIBRE: " + (engineType == MapEngineManager.MapEngine.MAPLIBRE));
    
    if (engineType == MapEngineManager.MapEngine.MAPLIBRE) {
        // Get Android system locale
        String androidLocale = getAndroidLocale();
        LogControl.d(TAG, "Android locale: " + androidLocale);
        
        // Initialize i18n system with Android locale
        String jsCall = String.format(Locale.US,
            "if (typeof App !== 'undefined' && App.I18n) { " +
            "console.log('Initializing i18n with locale: %s'); " +
            "App.I18n.init('%s').then(() => { " +
            "console.log('i18n initialized successfully'); " +
            "Android.onCallback('i18nInitialized', App.I18n.getLanguage()); " +
            "}); } else { " +
            "console.error('App.I18n not available for initialization'); " +
            "}",
            androidLocale, androidLocale);
        
        LogControl.d(TAG, "Executing JavaScript: " + jsCall);
        LogControl.d(TAG, "Initializing MapLibre i18n with locale: " + androidLocale);
        
        awv.execJavascript(jsCall);
    } else {
        LogControl.d(TAG, "Engine is not MAPLIBRE - skipping i18n initialization");
    }
    
    LogControl.d(TAG, "=== END INITIALIZE I18N SYSTEM DEBUG ===");
}

/**
 * Helper method to get Android system locale
 */
private String getAndroidLocale() {
    Locale locale = Locale.getDefault();
    String language = locale.getLanguage();
    
    LogControl.d(TAG, "System locale: " + locale);
    LogControl.d(TAG, "System language: " + language);
    
    // Map Android locale to supported languages
    String[] supportedLanguages = {"en", "de", "es", "fr", "it"};
    for (String supportedLang : supportedLanguages) {
        if (language.equals(supportedLang)) {
            LogControl.d(TAG, "Language " + language + " is supported");
            return language;
        }
    }
    
    // Fallback to English if language not supported
    LogControl.d(TAG, "Language " + language + " not supported, falling back to English");
    return "en";
}
```

### Step 6: Add setMapLanguage Method with Debugging

Add this method to your `DefaultBridgeMap.java`:

```java
/**
 * Set the language for the MapLibre engine
 * @param languageCode ISO 639-1 language code (e.g., "en", "de", "es")
 */
public void setMapLanguage(String languageCode) {
    LogControl.d(TAG, "=== SET MAP LANGUAGE DEBUG ===");
    LogControl.d(TAG, "Requested language: " + languageCode);
    LogControl.d(TAG, "Engine type: " + engineType);
    LogControl.d(TAG, "Engine type == MAPLIBRE: " + (engineType == MapEngineManager.MapEngine.MAPLIBRE));
    
    if (engineType == MapEngineManager.MapEngine.MAPLIBRE) {
        String jsCall = String.format(Locale.US, 
            "console.log('Setting MapLibre language to: %s'); " +
            "if (typeof App !== 'undefined' && App.I18n) { " +
            "App.I18n.setLanguage('%s'); " +
            "console.log('Language set successfully'); " +
            "} else { " +
            "console.error('App.I18n not available for language setting'); " +
            "}",
            languageCode, languageCode);
        
        LogControl.d(TAG, "Setting MapLibre language to: " + languageCode);
        LogControl.d(TAG, "Executing JavaScript: " + jsCall);
        
        awv.execJavascript(jsCall);
    } else {
        LogControl.d(TAG, "Engine is not MAPLIBRE - skipping language setting");
        LogControl.d(TAG, "Current engine type: " + engineType);
    }
    
    LogControl.d(TAG, "=== END SET MAP LANGUAGE DEBUG ===");
}
```

### Step 7: JavaScript Console Monitoring

Open Chrome DevTools (if testing on desktop) or use remote debugging for Android WebView and monitor the console for these messages:

Expected console output:
```
🔍 MapLibre Initialization Debug System loaded
[DEBUG][ENGINE] Engine type determined: MAPLIBRE
[DEBUG][I18N] I18n system status: {...}
Setting MapLibre language to: de
Language set successfully
```

### Step 8: Manual Testing Commands

Once the debug script is loaded, you can use these commands in the JavaScript console:

```javascript
// Check current system status
window.debugMapInit.performCheck();

// Test language setting manually
window.debugMapInit.testLanguage('de');

// Get all debug events
window.debugMapInit.getEvents();

// Get current debug state
window.debugMapInit.getState();
```

### Step 9: Common Issues and Solutions

#### Issue 1: Engine Type Not MAPLIBRE
**Symptoms:** Log shows engine type as something other than MAPLIBRE
**Solution:** Check the engine detection logic in your Android code

#### Issue 2: App.I18n Not Available
**Symptoms:** JavaScript console shows "App.I18n not available"
**Solution:** Ensure i18n-manager.js is loaded before initialization

#### Issue 3: 'initiated' Event Not Firing
**Symptoms:** No "INITIATED event received" log
**Solution:** Check if the JavaScript is properly firing the initiated event

#### Issue 4: JavaScript Not Executing
**Symptoms:** No console output from JavaScript calls
**Solution:** Check if WebView has JavaScript enabled

### Step 10: Verification Checklist

Use this checklist to verify each step:

- [ ] Debug script loaded successfully
- [ ] Engine type detected as MAPLIBRE
- [ ] 'initiated' event received
- [ ] sendInitSignal called
- [ ] initializeI18nSystem called
- [ ] App.I18n namespace available
- [ ] setMapLanguage called
- [ ] JavaScript executed successfully
- [ ] Console shows "Setting MapLibre language to: de"

## Expected Log Output

When working correctly, you should see this sequence in your logs:

```
D/DefaultBridgeMap: === ENGINE TYPE DEBUG ===
D/DefaultBridgeMap: Engine Type: MAPLIBRE
D/DefaultBridgeMap: Engine Type == MAPLIBRE: true
D/DefaultBridgeMap: Engine URL: file:///android_asset/engine_ml/index.html
D/DefaultBridgeMap: === END ENGINE TYPE DEBUG ===

D/DefaultBridgeMap: === CALLBACK DEBUG ===
D/DefaultBridgeMap: Action: initiated
D/DefaultBridgeMap: Data: 
D/DefaultBridgeMap: Engine Type: MAPLIBRE
D/DefaultBridgeMap: === END CALLBACK DEBUG ===

D/DefaultBridgeMap: INITIATED event received - calling sendInitSignal
D/DefaultBridgeMap: Engine is MAPLIBRE - calling initializeI18nSystem

D/DefaultBridgeMap: === INITIALIZE I18N SYSTEM DEBUG ===
D/DefaultBridgeMap: Engine type: MAPLIBRE
D/DefaultBridgeMap: Engine type == MAPLIBRE: true
D/DefaultBridgeMap: Android locale: de
D/DefaultBridgeMap: Executing JavaScript: if (typeof App !== 'undefined' && App.I18n) { console.log('Initializing i18n with locale: de'); App.I18n.init('de').then(() => { console.log('i18n initialized successfully'); Android.onCallback('i18nInitialized', App.I18n.getLanguage()); }); } else { console.error('App.I18n not available for initialization'); }
D/DefaultBridgeMap: Initializing MapLibre i18n with locale: de
D/DefaultBridgeMap: === END INITIALIZE I18N SYSTEM DEBUG ===

D/DefaultBridgeMap: === SET MAP LANGUAGE DEBUG ===
D/DefaultBridgeMap: Requested language: de
D/DefaultBridgeMap: Engine type: MAPLIBRE
D/DefaultBridgeMap: Engine type == MAPLIBRE: true
D/DefaultBridgeMap: Setting MapLibre language to: de
D/DefaultBridgeMap: Executing JavaScript: console.log('Setting MapLibre language to: de'); if (typeof App !== 'undefined' && App.I18n) { App.I18n.setLanguage('de'); console.log('Language set successfully'); } else { console.error('App.I18n not available for language setting'); }
D/DefaultBridgeMap: === END SET MAP LANGUAGE DEBUG ===
```

## Next Steps

1. **Load the debug script** and run the application
2. **Check the logs** for the sequence above
3. **Identify the missing step** where the sequence breaks
4. **Apply the appropriate solution** based on the findings
5. **Test the language setting** manually using the debug commands

This comprehensive debugging approach will help identify exactly where the initialization is failing and provide the necessary information to fix the issue.