# Android I18n Integration Guide for MapLibre Engine

This guide provides comprehensive instructions for integrating the MapLibre i18n system with Android applications, specifically for the Geolantis 360 project.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Integration Steps](#integration-steps)
4. [DefaultBridgeMap.java Changes](#defaultbridgemapjava-changes)
5. [Android Locale System Integration](#android-locale-system-integration)
6. [Using requestCultureStrings()](#using-requestculturestrings)
7. [Language Preference Management](#language-preference-management)
8. [Code Examples](#code-examples)
9. [Testing Integration](#testing-integration)
10. [Runtime Language Changes](#runtime-language-changes)
11. [Fallback Behavior](#fallback-behavior)
12. [Performance Considerations](#performance-considerations)
13. [Troubleshooting](#troubleshooting)

## Overview

The MapLibre i18n system provides multi-language support for the web-based mapping engine. This integration connects the Android application's locale settings with the MapLibre engine's translation system, ensuring consistent language experience across both native Android UI and web-based map interface.

### Key Features
- Automatic locale detection from Android system
- Seamless synchronization between Android and MapLibre locales
- Runtime language switching without map reinitialization
- Fallback to English when requested language is unavailable
- Performance-optimized translation loading

## Prerequisites

### Required Files
- `engine_ml/src/i18n/i18n-manager.js` - Core i18n manager
- `engine_ml/src/i18n/translations/*.json` - Translation files
- `DefaultBridgeMap.java` - Android bridge class

### Supported Languages
- English (en) - fallback language
- German (de)
- Spanish (es)
- French (fr)
- Italian (it)

## Integration Steps

### Step 1: Add I18n Methods to DefaultBridgeMap.java

Add the following methods to your `DefaultBridgeMap.java` class:

```java
/**
 * Set the language for the MapLibre engine
 * @param languageCode ISO 639-1 language code (e.g., "en", "de", "es")
 */
public void setMapLanguage(String languageCode) {
    if (engineType == MapEngineManager.MapEngine.MAPLIBRE) {
        String jsCall = String.format(Locale.US, 
            "if (typeof App !== 'undefined' && App.I18n) { App.I18n.setLanguage('%s'); }",
            languageCode);
        LogControl.d(TAG, "Setting MapLibre language to: " + languageCode);
        awv.execJavascript(jsCall);
    }
}

/**
 * Get the current language from the MapLibre engine
 */
public void getCurrentMapLanguage() {
    if (engineType == MapEngineManager.MapEngine.MAPLIBRE) {
        String jsCall = "if (typeof App !== 'undefined' && App.I18n) { " +
            "Android.onCallback('currentLanguage', App.I18n.getLanguage()); }";
        awv.execJavascript(jsCall);
    }
}

/**
 * Request culture strings from MapLibre engine
 * This method triggers the JavaScript to send translation data back to Android
 */
public void requestCultureStrings() {
    if (engineType == MapEngineManager.MapEngine.MAPLIBRE) {
        String jsCall = "if (typeof App !== 'undefined' && App.I18n) { " +
            "var translations = App.I18n.translations[App.I18n.currentLanguage]; " +
            "Android.onCallback('cultureStrings', JSON.stringify({ " +
            "language: App.I18n.currentLanguage, " +
            "translations: translations " +
            "})); }";
        awv.execJavascript(jsCall);
    }
}

/**
 * Initialize MapLibre i18n system with Android locale
 */
public void initializeI18nSystem() {
    if (engineType == MapEngineManager.MapEngine.MAPLIBRE) {
        // Get Android system locale
        String androidLocale = getAndroidLocale();
        
        // Initialize i18n system with Android locale
        String jsCall = String.format(Locale.US,
            "if (typeof App !== 'undefined' && App.I18n) { " +
            "App.I18n.init('%s').then(() => { " +
            "Android.onCallback('i18nInitialized', App.I18n.getLanguage()); " +
            "}); }",
            androidLocale);
        
        LogControl.d(TAG, "Initializing MapLibre i18n with locale: " + androidLocale);
        awv.execJavascript(jsCall);
    }
}

/**
 * Get available languages from MapLibre engine
 */
public void getAvailableLanguages() {
    if (engineType == MapEngineManager.MapEngine.MAPLIBRE) {
        String jsCall = "if (typeof App !== 'undefined' && App.I18n) { " +
            "var languages = App.I18n.getAvailableLanguages(); " +
            "Android.onCallback('availableLanguages', JSON.stringify(languages)); }";
        awv.execJavascript(jsCall);
    }
}

/**
 * Helper method to get Android system locale
 */
private String getAndroidLocale() {
    Locale locale = Locale.getDefault();
    String language = locale.getLanguage();
    
    // Map Android locale to supported languages
    String[] supportedLanguages = {"en", "de", "es", "fr", "it"};
    for (String supportedLang : supportedLanguages) {
        if (language.equals(supportedLang)) {
            return language;
        }
    }
    
    // Fallback to English if language not supported
    return "en";
}
```

### Step 2: Update Constructor and Initialization

Modify the constructor to initialize the i18n system:

```java
public DefaultBridgeMap(AbstractWebView abstractWebView, final Activity activity, MapEngineManager.MapEngine engine) {
    awv = abstractWebView;
    engineType = engine;
    
    // Set the appropriate URL based on engine type
    switch (engineType) {
        case MAPLIBRE:
            engineUrl = "file:///android_asset/engine_ml/index.html";
            break;
        case LEAFLET:
        default:
            engineUrl = "file:///android_asset/bridgeAssets/engine/index.html";
            break;
    }
    
    awv.loadUrl(engineUrl);

    // Initialize the UI Bridge only for MapLibre
    if (engineType == MapEngineManager.MapEngine.MAPLIBRE) {
        uiBridge = new UIBridge(awv, activity, engineType);
    }

    awv.addOnCallbackListener(new OnCallbackListener() {
        @Override
        public void onCallback(String action, String data) {
            switch (action) {
                // ... existing cases ...
                
                case "initiated":
                    sendInitSignal(activity);
                    // Initialize i18n system after map is loaded
                    initializeI18nSystem();
                    break;
                    
                case "i18nInitialized":
                    LogControl.d(TAG, "MapLibre i18n initialized with language: " + data);
                    // Optionally notify listeners about i18n initialization
                    for (BridgeMapEventListener listener : listeners) {
                        if (listener instanceof I18nEventListener) {
                            ((I18nEventListener) listener).onI18nInitialized(data);
                        }
                    }
                    break;
                    
                case "currentLanguage":
                    LogControl.d(TAG, "Current MapLibre language: " + data);
                    // Handle current language response
                    for (BridgeMapEventListener listener : listeners) {
                        if (listener instanceof I18nEventListener) {
                            ((I18nEventListener) listener).onCurrentLanguage(data);
                        }
                    }
                    break;
                    
                case "cultureStrings":
                    LogControl.d(TAG, "Received culture strings: " + data);
                    // Handle culture strings response
                    for (BridgeMapEventListener listener : listeners) {
                        if (listener instanceof I18nEventListener) {
                            ((I18nEventListener) listener).onCultureStrings(data);
                        }
                    }
                    break;
                    
                case "availableLanguages":
                    LogControl.d(TAG, "Available languages: " + data);
                    // Handle available languages response
                    for (BridgeMapEventListener listener : listeners) {
                        if (listener instanceof I18nEventListener) {
                            ((I18nEventListener) listener).onAvailableLanguages(data);
                        }
                    }
                    break;
                    
                case "languageChanged":
                    LogControl.d(TAG, "Language changed to: " + data);
                    // Handle language change notification
                    for (BridgeMapEventListener listener : listeners) {
                        if (listener instanceof I18nEventListener) {
                            ((I18nEventListener) listener).onLanguageChanged(data);
                        }
                    }
                    break;
                    
                // ... rest of existing cases ...
            }
        }
    });
}
```

## DefaultBridgeMap.java Changes

### Complete Integration Example

Here's a complete example of the modified DefaultBridgeMap.java with i18n integration:

```java
// Add these imports at the top of the file
import java.util.Locale;
import android.content.Context;
import android.content.res.Configuration;

// Add this interface for i18n event handling
public interface I18nEventListener {
    void onI18nInitialized(String language);
    void onCurrentLanguage(String language);
    void onCultureStrings(String cultureData);
    void onAvailableLanguages(String languagesData);
    void onLanguageChanged(String newLanguage);
}

// Add these fields to the class
private Context context;
private String currentMapLanguage = "en";

// Modify constructor to accept Context
public DefaultBridgeMap(AbstractWebView abstractWebView, final Activity activity, MapEngineManager.MapEngine engine) {
    // ... existing constructor code ...
    this.context = activity.getApplicationContext();
    
    // Register for locale changes
    registerLocaleChangeListener();
}

/**
 * Register listener for Android locale changes
 */
private void registerLocaleChangeListener() {
    // This would typically be done in the Activity or Application class
    // Here's how you would handle configuration changes
}

/**
 * Handle Android configuration changes (including locale changes)
 */
public void onConfigurationChanged(Configuration newConfig) {
    String newLocale = getAndroidLocale();
    if (!newLocale.equals(currentMapLanguage)) {
        LogControl.d(TAG, "Android locale changed to: " + newLocale);
        setMapLanguage(newLocale);
    }
}

/**
 * Synchronize MapLibre language with Android system locale
 */
public void syncWithAndroidLocale() {
    String androidLocale = getAndroidLocale();
    setMapLanguage(androidLocale);
}
```

## Android Locale System Integration

### Activity Integration

In your Activity class (e.g., `ActMapFeature`), add the following:

```java
public class ActMapFeature extends Activity implements DefaultBridgeMap.I18nEventListener {
    
    private DefaultBridgeMap bridgeMap;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize bridge map
        bridgeMap = new DefaultBridgeMap(webView, this, MapEngineManager.MapEngine.MAPLIBRE);
        
        // Set up locale change listener
        setupLocaleListener();
    }
    
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        
        // Sync MapLibre language with Android locale
        if (bridgeMap != null) {
            bridgeMap.onConfigurationChanged(newConfig);
        }
    }
    
    // I18n event listener implementations
    @Override
    public void onI18nInitialized(String language) {
        Log.d(TAG, "MapLibre i18n initialized with language: " + language);
        // Update UI or notify other components
    }
    
    @Override
    public void onCurrentLanguage(String language) {
        Log.d(TAG, "Current MapLibre language: " + language);
        // Handle current language response
    }
    
    @Override
    public void onCultureStrings(String cultureData) {
        try {
            JSONObject data = new JSONObject(cultureData);
            String language = data.getString("language");
            JSONObject translations = data.getJSONObject("translations");
            
            // Process translations for native UI if needed
            processTranslations(language, translations);
        } catch (JSONException e) {
            Log.e(TAG, "Error parsing culture strings", e);
        }
    }
    
    @Override
    public void onAvailableLanguages(String languagesData) {
        try {
            JSONArray languages = new JSONArray(languagesData);
            // Update language selection UI
            updateLanguageSelectionUI(languages);
        } catch (JSONException e) {
            Log.e(TAG, "Error parsing available languages", e);
        }
    }
    
    @Override
    public void onLanguageChanged(String newLanguage) {
        Log.d(TAG, "MapLibre language changed to: " + newLanguage);
        // Update any dependent UI components
    }
    
    private void setupLocaleListener() {
        // Monitor system locale changes
        IntentFilter filter = new IntentFilter(Intent.ACTION_LOCALE_CHANGED);
        registerReceiver(new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (bridgeMap != null) {
                    bridgeMap.syncWithAndroidLocale();
                }
            }
        }, filter);
    }
    
    private void processTranslations(String language, JSONObject translations) {
        // Process translations for native Android UI components
        // This could be used to update ActionBar titles, menu items, etc.
    }
    
    private void updateLanguageSelectionUI(JSONArray languages) {
        // Update language selection dropdown or preference screen
    }
}
```

## Using requestCultureStrings()

The `requestCultureStrings()` method allows you to retrieve translation data from the MapLibre engine for use in native Android components:

```java
// Request culture strings from MapLibre
public void requestAndProcessCultureStrings() {
    bridgeMap.requestCultureStrings();
}

// Handle the response in your I18nEventListener
@Override
public void onCultureStrings(String cultureData) {
    try {
        JSONObject data = new JSONObject(cultureData);
        String language = data.getString("language");
        JSONObject translations = data.getJSONObject("translations");
        
        // Example: Update ActionBar title
        updateActionBarTitle(translations);
        
        // Example: Update menu items
        updateMenuItems(translations);
        
        // Example: Update status messages
        updateStatusMessages(translations);
        
    } catch (JSONException e) {
        Log.e(TAG, "Error processing culture strings", e);
    }
}

private void updateActionBarTitle(JSONObject translations) {
    try {
        JSONObject ui = translations.getJSONObject("ui");
        JSONObject tabs = ui.getJSONObject("tabs");
        
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(tabs.getString("layers"));
        }
    } catch (JSONException e) {
        Log.e(TAG, "Error updating action bar title", e);
    }
}

private void updateMenuItems(JSONObject translations) {
    try {
        JSONObject ui = translations.getJSONObject("ui");
        JSONObject settings = ui.getJSONObject("settings");
        
        // Update menu items with translated text
        invalidateOptionsMenu(); // Trigger menu recreation
        
    } catch (JSONException e) {
        Log.e(TAG, "Error updating menu items", e);
    }
}
```

## Language Preference Management

### SharedPreferences Integration

Create a language preference manager:

```java
public class LanguagePreferenceManager {
    private static final String PREF_NAME = "language_preferences";
    private static final String KEY_LANGUAGE = "selected_language";
    
    private SharedPreferences preferences;
    private Context context;
    
    public LanguagePreferenceManager(Context context) {
        this.context = context;
        this.preferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }
    
    public void setLanguage(String languageCode) {
        preferences.edit().putString(KEY_LANGUAGE, languageCode).apply();
    }
    
    public String getLanguage() {
        return preferences.getString(KEY_LANGUAGE, getSystemLanguage());
    }
    
    public String getSystemLanguage() {
        String language = Locale.getDefault().getLanguage();
        String[] supported = {"en", "de", "es", "fr", "it"};
        
        for (String supportedLang : supported) {
            if (language.equals(supportedLang)) {
                return language;
            }
        }
        
        return "en"; // fallback
    }
    
    public boolean isLanguageSupported(String languageCode) {
        String[] supported = {"en", "de", "es", "fr", "it"};
        return Arrays.asList(supported).contains(languageCode);
    }
}
```

### Usage in Activity

```java
public class ActMapFeature extends Activity {
    
    private LanguagePreferenceManager languageManager;
    private DefaultBridgeMap bridgeMap;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        languageManager = new LanguagePreferenceManager(this);
        
        // Set language based on user preference
        String preferredLanguage = languageManager.getLanguage();
        setApplicationLanguage(preferredLanguage);
        
        // Initialize bridge map
        bridgeMap = new DefaultBridgeMap(webView, this, MapEngineManager.MapEngine.MAPLIBRE);
    }
    
    private void setApplicationLanguage(String languageCode) {
        Locale locale = new Locale(languageCode);
        Locale.setDefault(locale);
        
        Configuration config = new Configuration();
        config.locale = locale;
        
        getResources().updateConfiguration(config, getResources().getDisplayMetrics());
        
        // Also set MapLibre language
        if (bridgeMap != null) {
            bridgeMap.setMapLanguage(languageCode);
        }
    }
    
    public void changeLanguage(String languageCode) {
        if (languageManager.isLanguageSupported(languageCode)) {
            languageManager.setLanguage(languageCode);
            setApplicationLanguage(languageCode);
            
            // Restart activity to apply changes
            recreate();
        }
    }
}
```

## Code Examples

### Complete Integration Example

Here's a complete example showing how to integrate the i18n system:

```java
public class MapI18nIntegration {
    
    private DefaultBridgeMap bridgeMap;
    private LanguagePreferenceManager languageManager;
    private Context context;
    
    public MapI18nIntegration(Context context, DefaultBridgeMap bridgeMap) {
        this.context = context;
        this.bridgeMap = bridgeMap;
        this.languageManager = new LanguagePreferenceManager(context);
        
        setupI18nIntegration();
    }
    
    private void setupI18nIntegration() {
        // Initialize with saved language preference
        String savedLanguage = languageManager.getLanguage();
        bridgeMap.setMapLanguage(savedLanguage);
        
        // Request available languages
        bridgeMap.getAvailableLanguages();
        
        // Set up periodic sync (optional)
        setupPeriodicSync();
    }
    
    private void setupPeriodicSync() {
        Timer timer = new Timer();
        timer.schedule(new TimerTask() {
            @Override
            public void run() {
                // Sync with Android locale every 30 seconds
                bridgeMap.syncWithAndroidLocale();
            }
        }, 30000, 30000); // 30 seconds interval
    }
    
    public void switchLanguage(String languageCode) {
        if (languageManager.isLanguageSupported(languageCode)) {
            // Save preference
            languageManager.setLanguage(languageCode);
            
            // Update Android locale
            updateAndroidLocale(languageCode);
            
            // Update MapLibre language
            bridgeMap.setMapLanguage(languageCode);
            
            // Request updated culture strings
            bridgeMap.requestCultureStrings();
        } else {
            Log.w("MapI18nIntegration", "Language not supported: " + languageCode);
        }
    }
    
    private void updateAndroidLocale(String languageCode) {
        Locale locale = new Locale(languageCode);
        Locale.setDefault(locale);
        
        Configuration config = new Configuration();
        config.locale = locale;
        
        context.getResources().updateConfiguration(config, 
            context.getResources().getDisplayMetrics());
    }
}
```

## Testing Integration

### Unit Tests

```java
@Test
public void testLanguageIntegration() {
    // Mock context and bridge map
    Context mockContext = mock(Context.class);
    DefaultBridgeMap mockBridgeMap = mock(DefaultBridgeMap.class);
    
    // Create integration instance
    MapI18nIntegration integration = new MapI18nIntegration(mockContext, mockBridgeMap);
    
    // Test language switching
    integration.switchLanguage("de");
    
    // Verify bridge map was called
    verify(mockBridgeMap).setMapLanguage("de");
}

@Test
public void testFallbackLanguage() {
    LanguagePreferenceManager manager = new LanguagePreferenceManager(context);
    
    // Test unsupported language falls back to English
    assertEquals("en", manager.getSystemLanguage());
}
```

### Integration Tests

```java
@Test
public void testI18nInitialization() {
    // Load MapLibre engine
    bridgeMap.loadUrl("file:///android_asset/engine_ml/index.html");
    
    // Wait for initialization
    Thread.sleep(2000);
    
    // Test i18n system initialization
    bridgeMap.initializeI18nSystem();
    
    // Verify language was set
    bridgeMap.getCurrentMapLanguage();
}
```

### Manual Testing Checklist

1. **Language Detection**
   - [ ] System locale is correctly detected
   - [ ] MapLibre uses correct initial language
   - [ ] Fallback to English works for unsupported languages

2. **Language Switching**
   - [ ] Language can be changed via UI
   - [ ] MapLibre updates immediately
   - [ ] Preferences are saved correctly

3. **Runtime Changes**
   - [ ] System locale changes are detected
   - [ ] MapLibre language updates automatically
   - [ ] No memory leaks or performance issues

4. **Error Handling**
   - [ ] Failed language loads fall back to English
   - [ ] Network errors don't crash the app
   - [ ] Invalid language codes are handled gracefully

## Runtime Language Changes

### Handling System Locale Changes

```java
public class LocaleChangeHandler extends BroadcastReceiver {
    
    private DefaultBridgeMap bridgeMap;
    
    public LocaleChangeHandler(DefaultBridgeMap bridgeMap) {
        this.bridgeMap = bridgeMap;
    }
    
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_LOCALE_CHANGED.equals(intent.getAction())) {
            Log.d("LocaleChangeHandler", "System locale changed");
            
            // Update MapLibre language
            bridgeMap.syncWithAndroidLocale();
            
            // Request updated culture strings
            bridgeMap.requestCultureStrings();
        }
    }
}

// Register in Activity
@Override
protected void onResume() {
    super.onResume();
    
    IntentFilter filter = new IntentFilter(Intent.ACTION_LOCALE_CHANGED);
    registerReceiver(localeChangeHandler, filter);
}

@Override
protected void onPause() {
    super.onPause();
    
    unregisterReceiver(localeChangeHandler);
}
```

### Dynamic Language Switching

```java
public void showLanguageSelectionDialog() {
    // Get available languages
    bridgeMap.getAvailableLanguages();
}

@Override
public void onAvailableLanguages(String languagesData) {
    try {
        JSONArray languages = new JSONArray(languagesData);
        
        String[] languageNames = new String[languages.length()];
        String[] languageCodes = new String[languages.length()];
        
        for (int i = 0; i < languages.length(); i++) {
            JSONObject language = languages.getJSONObject(i);
            languageNames[i] = language.getString("name");
            languageCodes[i] = language.getString("code");
        }
        
        // Show selection dialog
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Select Language");
        builder.setItems(languageNames, (dialog, which) -> {
            String selectedLanguage = languageCodes[which];
            changeLanguage(selectedLanguage);
        });
        builder.show();
        
    } catch (JSONException e) {
        Log.e(TAG, "Error parsing available languages", e);
    }
}
```

## Fallback Behavior

The i18n system implements several fallback mechanisms:

### 1. Language Fallback Chain

```
User Selected Language → System Language → English (en)
```

### 2. Translation Key Fallback

```
Current Language Translation → English Translation → Translation Key
```

### 3. Implementation Example

```java
public class I18nFallbackHandler {
    
    private static final String FALLBACK_LANGUAGE = "en";
    private LanguagePreferenceManager languageManager;
    
    public String getTranslationWithFallback(String key, String currentLanguage) {
        // Try current language first
        String translation = getTranslation(key, currentLanguage);
        if (translation != null && !translation.equals(key)) {
            return translation;
        }
        
        // Try fallback language
        if (!currentLanguage.equals(FALLBACK_LANGUAGE)) {
            translation = getTranslation(key, FALLBACK_LANGUAGE);
            if (translation != null && !translation.equals(key)) {
                return translation;
            }
        }
        
        // Return key if no translation found
        return key;
    }
    
    private String getTranslation(String key, String language) {
        // Implementation would fetch from MapLibre translations
        return null;
    }
}
```

## Performance Considerations

### 1. Translation Loading Optimization

```java
public class I18nPerformanceOptimizer {
    
    private Map<String, JSONObject> translationCache = new HashMap<>();
    private long lastCacheTime = 0;
    private static final long CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    public void preloadTranslations(String[] languages) {
        for (String language : languages) {
            if (!translationCache.containsKey(language)) {
                loadTranslationAsync(language);
            }
        }
    }
    
    private void loadTranslationAsync(String language) {
        new Thread(() -> {
            try {
                // Load translation in background
                JSONObject translation = loadTranslation(language);
                translationCache.put(language, translation);
            } catch (Exception e) {
                Log.e("I18nOptimizer", "Error loading translation: " + language, e);
            }
        }).start();
    }
    
    public boolean isCacheValid() {
        return System.currentTimeMillis() - lastCacheTime < CACHE_DURATION;
    }
}
```

### 2. Memory Management

```java
public class I18nMemoryManager {
    
    private static final int MAX_CACHED_LANGUAGES = 3;
    private LinkedHashMap<String, JSONObject> lruCache;
    
    public I18nMemoryManager() {
        lruCache = new LinkedHashMap<String, JSONObject>(MAX_CACHED_LANGUAGES, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<String, JSONObject> eldest) {
                return size() > MAX_CACHED_LANGUAGES;
            }
        };
    }
    
    public void clearUnusedTranslations() {
        // Keep only current and fallback language
        String currentLanguage = getCurrentLanguage();
        String fallbackLanguage = "en";
        
        Iterator<Map.Entry<String, JSONObject>> iterator = lruCache.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, JSONObject> entry = iterator.next();
            String language = entry.getKey();
            
            if (!language.equals(currentLanguage) && !language.equals(fallbackLanguage)) {
                iterator.remove();
            }
        }
    }
}
```

### 3. JavaScript Execution Optimization

```java
public class JavaScriptI18nOptimizer {
    
    private long lastJsCall = 0;
    private static final long JS_THROTTLE_INTERVAL = 100; // 100ms
    
    public void setLanguageThrottled(String language) {
        long currentTime = System.currentTimeMillis();
        
        if (currentTime - lastJsCall > JS_THROTTLE_INTERVAL) {
            bridgeMap.setMapLanguage(language);
            lastJsCall = currentTime;
        }
    }
}
```

## Troubleshooting

### Common Issues and Solutions

#### 1. MapLibre Not Initializing Correctly
```
Error: App.I18n is undefined
```
**Solution**: Ensure the i18n-manager.js is loaded before calling i18n methods.

```java
// Wait for map initialization before calling i18n methods
case "initiated":
    sendInitSignal(activity);
    // Add delay to ensure i18n system is loaded
    new Handler().postDelayed(() -> {
        initializeI18nSystem();
    }, 500);
    break;
```

#### 2. Language Not Switching
```
Error: Language change not reflected in UI
```
**Solution**: Check if translations are properly loaded and updatePageTranslations() is called.

```java
// Force translation update
public void forceTranslationUpdate() {
    String jsCall = "if (typeof App !== 'undefined' && App.I18n) { " +
        "App.I18n.updatePageTranslations(); }";
    awv.execJavascript(jsCall);
}
```

#### 3. Memory Leaks
```
Error: Out of memory errors after language switching
```
**Solution**: Implement proper cleanup and memory management.

```java
public void cleanup() {
    if (translationCache != null) {
        translationCache.clear();
    }
    
    if (localeChangeHandler != null) {
        unregisterReceiver(localeChangeHandler);
    }
}
```

### Debug Mode

Enable debug logging for troubleshooting:

```java
public class I18nDebugger {
    
    private static final boolean DEBUG_ENABLED = BuildConfig.DEBUG;
    
    public static void log(String message) {
        if (DEBUG_ENABLED) {
            Log.d("I18nDebug", message);
        }
    }
    
    public void enableJavaScriptDebugging() {
        String jsCall = "console.log('I18n Debug Mode Enabled'); " +
            "if (typeof App !== 'undefined' && App.I18n) { " +
            "App.I18n.debugMode = true; }";
        awv.execJavascript(jsCall);
    }
}
```

## Best Practices

1. **Always check MapLibre engine type** before calling i18n methods
2. **Implement proper error handling** for all JavaScript calls
3. **Use fallback languages** for unsupported locales
4. **Cache translations** to improve performance
5. **Clean up resources** when Activity is destroyed
6. **Test on different devices** and Android versions
7. **Monitor memory usage** during language switching
8. **Implement proper logging** for debugging

## Conclusion

This integration guide provides a comprehensive approach to connecting Android's locale system with MapLibre's i18n capabilities. By following these guidelines, you can create a seamless multilingual experience that automatically adapts to user preferences and system settings.

For additional support or questions, refer to the MapLibre documentation or the Geolantis 360 development team.