# I18n Language Detection Debug Analysis

## Issue Description
User is seeing only English despite having German OS and app. The i18n system appears to be working (German translation file exists and is loaded), but the automatic language detection is failing.

## Analysis of Current Implementation

### 1. Language Detection Logic (from `i18n-manager.js`)

The `detectLanguage()` function follows this sequence:
1. **Check localStorage** for saved language (`maplibre_language`)
2. **Check browser language** using `navigator.language || navigator.userLanguage`
3. **Fall back** to English if neither is supported

```javascript
detectLanguage: function() {
    // Check localStorage first
    const savedLang = localStorage.getItem('maplibre_language');
    if (savedLang && this.isLanguageSupported(savedLang)) {
        return savedLang;
    }
    
    // Check browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const shortLang = browserLang.split('-')[0];
    
    if (this.isLanguageSupported(shortLang)) {
        return shortLang;
    }
    
    return this.fallbackLanguage;
}
```

### 2. Supported Languages
- English (en)
- German (de)
- Spanish (es)
- French (fr)
- Italian (it)

### 3. Initialization Sequence
1. i18n-manager.js loads at line 1057 in index.html
2. Auto-initializes on DOMContentLoaded or immediately if DOM is ready
3. Core init (app.core.init.js) also calls App.I18n.init() at line 52-59

## Potential Issues

### 1. **Double Initialization**
The i18n manager auto-initializes itself, but is also initialized by the core init system. This could cause race conditions.

### 2. **WebView Context**
In Android WebView, `navigator.language` might not reflect the device's actual language setting. It could be returning "en-US" regardless of the device locale.

### 3. **Timing Issues**
The language detection might be happening before the Android bridge is fully available, so it can't get the actual device language.

### 4. **Missing Android Bridge Integration**
There's no integration with the Android bridge to get the device's actual language from the Android system.

## Debugging Steps

### Step 1: Load Debug Script
Add this to your HTML or run in console:
```html
<script src="debug-i18n.js"></script>
```

### Step 2: Run Diagnosis
In browser console:
```javascript
I18nDebugger.diagnose()
```

### Step 3: Check Browser Language
```javascript
console.log('Browser language:', navigator.language);
console.log('Browser languages:', navigator.languages);
```

### Step 4: Test Manual Language Switch
```javascript
I18nDebugger.forceGerman()
```

### Step 5: Check if Translations Load
```javascript
I18nDebugger.checkNetworkRequests()
```

## Proposed Fixes

### Fix 1: Add Android Bridge Integration
Add this to the `detectLanguage()` function:

```javascript
detectLanguage: function() {
    // Check localStorage first
    const savedLang = localStorage.getItem('maplibre_language');
    if (savedLang && this.isLanguageSupported(savedLang)) {
        return savedLang;
    }
    
    // NEW: Check Android bridge for device language
    if (window.bridge && typeof window.bridge.getDeviceLanguage === 'function') {
        try {
            const deviceLang = window.bridge.getDeviceLanguage();
            if (deviceLang && this.isLanguageSupported(deviceLang)) {
                return deviceLang;
            }
        } catch (error) {
            console.log('Could not get device language from Android bridge:', error);
        }
    }
    
    // Check browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const shortLang = browserLang.split('-')[0];
    
    if (this.isLanguageSupported(shortLang)) {
        return shortLang;
    }
    
    return this.fallbackLanguage;
}
```

### Fix 2: Add Debug Logging
Add comprehensive logging to understand what's happening:

```javascript
detectLanguage: function() {
    console.log('[I18n] Starting language detection...');
    
    // Check localStorage first
    const savedLang = localStorage.getItem('maplibre_language');
    console.log('[I18n] Saved language:', savedLang);
    if (savedLang && this.isLanguageSupported(savedLang)) {
        console.log('[I18n] Using saved language:', savedLang);
        return savedLang;
    }
    
    // Check browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const shortLang = browserLang ? browserLang.split('-')[0] : null;
    console.log('[I18n] Browser language:', browserLang, '-> Short:', shortLang);
    
    if (shortLang && this.isLanguageSupported(shortLang)) {
        console.log('[I18n] Using browser language:', shortLang);
        return shortLang;
    }
    
    console.log('[I18n] Using fallback language:', this.fallbackLanguage);
    return this.fallbackLanguage;
}
```

### Fix 3: Add Force Language Setting Method
Add a method that can be called from Android:

```javascript
// Add to App.I18n object
forceLanguage: function(language) {
    console.log('[I18n] Force setting language to:', language);
    if (this.isLanguageSupported(language)) {
        this.setLanguage(language);
        return true;
    }
    return false;
}
```

### Fix 4: Remove Double Initialization
Either remove auto-initialization or the manual initialization in core init.

## Manual Testing Commands

### Test Language Detection
```javascript
// Check what language is detected
console.log('Detected:', App.I18n.detectLanguage());

// Check browser info
console.log('Navigator language:', navigator.language);
console.log('Navigator languages:', navigator.languages);

// Check if German is supported
console.log('German supported:', App.I18n.isLanguageSupported('de'));
```

### Test Language Switch
```javascript
// Switch to German
App.I18n.setLanguage('de').then(() => {
    console.log('Current language:', App.I18n.getLanguage());
    console.log('Test translation:', App.I18n.t('ui.tabs.layers'));
});
```

### Test Translation Loading
```javascript
// Test if German translations are loaded
console.log('Loaded languages:', Array.from(App.I18n.loadedLanguages));
console.log('German translations:', App.I18n.translations.de);
```

## Expected Behavior

1. **German Device**: Should detect "de" and load German translations
2. **German Browser**: Should detect "de" from navigator.language
3. **Manual Switch**: Should work regardless of auto-detection
4. **Fallback**: Should work if detection fails

## Next Steps

1. Run the debug script to identify the exact issue
2. Check what `navigator.language` returns in the WebView
3. Verify German translation file is accessible
4. Test manual language switching
5. Implement appropriate fix based on findings

The most likely issue is that the WebView is not properly exposing the device language, so adding Android bridge integration would be the best solution.