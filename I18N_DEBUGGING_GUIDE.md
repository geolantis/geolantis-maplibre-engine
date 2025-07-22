# I18n Language Detection Debugging Guide

## 🔍 Issue Summary
User reports seeing only English despite having German OS and app. The i18n system has German translations available but auto-detection is failing.

## 📁 Files Created/Modified

### 1. Enhanced i18n-manager.js
- **Location**: `/app/src/main/assets/engine_ml/src/i18n/i18n-manager.js`
- **Changes**:
  - Added comprehensive debug logging
  - Added Android bridge integration for device language detection
  - Added `forceLanguage()` method for manual language setting
  - Added `getDebugInfo()` method for diagnostics
  - Enhanced error handling and logging

### 2. Debug Script
- **Location**: `/app/src/main/assets/engine_ml/debug-i18n.js`
- **Purpose**: Comprehensive debugging tool for browser console

### 3. Simple Debug Page
- **Location**: `/app/src/main/assets/engine_ml/debug-i18n-simple.html`
- **Purpose**: Visual debugging interface with real-time testing

### 4. Debug Analysis
- **Location**: `/app/src/main/assets/engine_ml/I18N_DEBUG_ANALYSIS.md`
- **Purpose**: Technical analysis of the issue and potential fixes

## 🚀 How to Debug

### Step 1: Load Debug Tools
Include the debug script in your testing:
```html
<script src="debug-i18n.js"></script>
```

### Step 2: Open Simple Debug Page
Navigate to: `debug-i18n-simple.html`

This page provides:
- Real-time browser information
- I18n manager status
- Translation testing
- Console output capture
- Quick action buttons

### Step 3: Run Browser Console Commands

#### Basic Diagnosis
```javascript
// Full diagnosis
I18nDebugger.diagnose()

// Quick debug info
App.I18n.getDebugInfo()
```

#### Language Detection Testing
```javascript
// Check what language is detected
App.I18n.detectLanguage()

// Check browser language
console.log('Browser:', navigator.language)
console.log('Languages:', navigator.languages)

// Check saved language
console.log('Saved:', localStorage.getItem('maplibre_language'))
```

#### Manual Language Switching
```javascript
// Force German
App.I18n.forceLanguage('de')

// Or use setLanguage
App.I18n.setLanguage('de').then(() => {
    console.log('Language set to German')
})
```

#### Translation Testing
```javascript
// Test specific translations
App.I18n.t('ui.tabs.layers')
App.I18n.t('ui.settings.mapRotation')

// Check loaded translations
App.I18n.translations.de
```

### Step 4: Check Network Requests
1. Open DevTools → Network tab
2. Filter by "translations"
3. Reload page or switch languages
4. Verify `.json` files are loading correctly

## 🔧 Enhanced Debug Features

### New Console Logging
The enhanced i18n manager now logs:
- Initialization process
- Language detection steps
- Translation file loading
- Android bridge attempts
- Error details

Look for logs prefixed with `[I18n]` in the console.

### Android Bridge Integration
The system now checks for device language via:
```javascript
window.bridge.getDeviceLanguage()
```

### Debug Info Method
```javascript
App.I18n.getDebugInfo()
```
Returns comprehensive system state including:
- Current and fallback languages
- Loaded languages and translation keys
- Browser language information
- Android bridge availability
- Detection results

## 🎯 Expected Behavior

### Normal Flow
1. Check localStorage for saved language
2. Check Android bridge for device language
3. Check browser language (navigator.language)
4. Fall back to English

### With German Device
- Should detect "de" from Android bridge
- Should load German translation file
- Should display German text

## 🔍 Troubleshooting Common Issues

### Issue: Always Shows English
**Check:**
- Console logs for language detection
- Network tab for translation file loading
- Browser language settings
- Android bridge availability

### Issue: German File Not Loading
**Check:**
- Network requests for `src/i18n/translations/de.json`
- File permissions and accessibility
- Console errors during file loading

### Issue: Translation Keys Not Found
**Check:**
- Translation file structure
- Key naming consistency
- Fallback mechanism

## 📱 Android WebView Specific

### WebView Language Detection
WebView might not properly expose device language. The enhanced system now:
1. Tries Android bridge first
2. Falls back to browser detection
3. Provides manual override methods

### Bridge Integration
If Android bridge doesn't have `getDeviceLanguage()`, add it:
```java
// In your Android bridge
@JavascriptInterface
public String getDeviceLanguage() {
    return Locale.getDefault().getLanguage();
}
```

## 🛠️ Manual Testing Steps

### 1. Basic Test
```javascript
// In browser console
I18nDebugger.diagnose()
```

### 2. Force German Test
```javascript
// Force German and check result
I18nDebugger.forceGerman()
```

### 3. Clear Storage Test
```javascript
// Clear saved language and test detection
localStorage.removeItem('maplibre_language')
App.I18n.init()
```

### 4. Translation Test
```javascript
// Test specific translations
I18nDebugger.testTranslation('ui.tabs.layers')
```

## 📊 Debug Output Examples

### Successful Detection
```
[I18n] Starting language detection...
[I18n] Saved language in localStorage: null
[I18n] Device language from Android bridge: de
[I18n] Using device language: de
[I18n] Loading language: de
[I18n] Fetching translation file: src/i18n/translations/de.json
[I18n] Translation file loaded successfully for: de
```

### Failed Detection
```
[I18n] Starting language detection...
[I18n] Saved language in localStorage: null
[I18n] Could not get device language from Android bridge: TypeError
[I18n] Browser language: en-US -> Short language: en
[I18n] Using browser language: en
```

## 🔄 Next Steps

1. **Test with debug tools** - Use the simple debug page
2. **Check console logs** - Look for `[I18n]` prefixed messages
3. **Verify file access** - Ensure German translation file loads
4. **Test manual switching** - Verify German works when forced
5. **Add Android bridge** - If needed, add device language method
6. **Report findings** - Document what the debug tools reveal

The enhanced system provides comprehensive logging and multiple fallback mechanisms to identify exactly where the language detection is failing.