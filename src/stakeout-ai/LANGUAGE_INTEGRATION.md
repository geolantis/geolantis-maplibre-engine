# Language Integration Guide

This document provides comprehensive instructions for integrating language setting with the StakeOut AI system using multiple alternative approaches.

## Overview

The system provides 5 different language integration methods that work independently and can be used as alternatives when standard integration fails:

1. **LanguageManager** - Core language management with retry logic
2. **LanguageIntegration** - Multiple integration points for different initialization timings
3. **LanguageBridge** - Enhanced UIBridge with Android Activity integration
4. **StakeOutAI Controls** - Manual controls for immediate testing
5. **Enhanced UI Translation** - Built-in translation system with fallbacks

## Alternative Integration Methods

### Method 1: Direct StakeOutAI Controls (Recommended for Testing)

The simplest approach for immediate testing and manual control:

```javascript
// Set language directly
StakeOutAI.setLanguage('es');

// Get current language
const currentLang = StakeOutAI.getCurrentLanguage();

// Test the language system
const testResult = StakeOutAI.testLanguage();

// Get comprehensive status
const status = StakeOutAI.getLanguageStatus();
```

**Advantages:**
- Works immediately after StakeOut AI loads
- No timing issues
- Can be called from Android Activity or web console
- Provides comprehensive status information

### Method 2: LanguageBridge Integration

Works with existing UIBridge and provides enhanced methods:

```javascript
// Enhanced UIBridge methods (automatically available)
UIBridge.setLanguage('fr');
UIBridge.getLanguage();
UIBridge.updateLanguage('de');
UIBridge.changeLanguage('it');

// Android Activity integration methods
window.setLanguageFromAndroid('pt');
window.updateLanguageFromAndroid('nl');
window.getLanguageForAndroid();
window.validateLanguageForAndroid('da');

// Web integration methods
window.setGlobalAppLanguage('sv');
window.getGlobalAppLanguage();
```

**Advantages:**
- Extends existing UIBridge seamlessly
- Provides multiple entry points
- Works with Android Activities
- Automatic event dispatching

### Method 3: LanguageManager with Retry Logic

For robust language setting with automatic retry:

```javascript
// Initialize and set language
await window.LanguageManager.initialize();
await window.LanguageManager.setLanguage('es');

// Manual setting (synchronous)
window.LanguageManager.setLanguageManually('fr');

// Force refresh
await window.LanguageManager.forceLanguageRefresh();

// Add callback for language changes
window.LanguageManager.onLanguageChange((language) => {
  console.log('Language changed to:', language);
});
```

**Advantages:**
- Automatic retry with exponential backoff
- Multiple detection methods
- Persistent monitoring
- Callback system for language changes

### Method 4: LanguageIntegration for Different Timing

For integration at specific initialization points:

```javascript
// Initialize at specific timing
await window.LanguageIntegration.initializeIntegration('de');

// Immediate setting regardless of timing
window.LanguageIntegration.setLanguageImmediately('it');

// Get integration status
const status = window.LanguageIntegration.getIntegrationStatus();
```

**Advantages:**
- Multiple initialization timing options
- Comprehensive system integration
- Validation of different components
- Immediate setting option

### Method 5: Enhanced UI Translation (Automatic)

Built into the StakeOut UI with multiple fallback sources:

```javascript
// Translation sources (in order of preference):
// 1. App.I18n.t(key)
// 2. App.I18n.translations[language][key]
// 3. UIBridge.translate(key)
// 4. window.translate(key)
// 5. Built-in translation map

// The UI automatically uses the best available translation
```

**Advantages:**
- Automatic translation with multiple fallbacks
- No manual intervention required
- Works even if main translation system fails
- Built-in translations for common UI elements

## Android Activity Integration

### Java/Kotlin Integration

From your Android Activity, you can call any of these methods:

```java
// Option 1: Using StakeOutAI controls
webView.evaluateJavascript("StakeOutAI.setLanguage('es')", null);

// Option 2: Using LanguageBridge
webView.evaluateJavascript("window.setLanguageFromAndroid('es')", null);

// Option 3: Using enhanced UIBridge
webView.evaluateJavascript("UIBridge.setLanguage('es')", null);

// Option 4: Using LanguageManager directly
webView.evaluateJavascript("window.LanguageManager.setLanguageManually('es')", null);

// Option 5: Using global function
webView.evaluateJavascript("window.setGlobalAppLanguage('es')", null);
```

### Get Language Status

```java
// Get current language
webView.evaluateJavascript("StakeOutAI.getCurrentLanguage()", result -> {
    Log.d("Language", "Current language: " + result);
});

// Get comprehensive status
webView.evaluateJavascript("JSON.stringify(StakeOutAI.getLanguageStatus())", result -> {
    Log.d("Language", "Status: " + result);
});
```

## Troubleshooting

### If Language Setting Fails

1. **Check System Status:**
   ```javascript
   const status = StakeOutAI.getLanguageStatus();
   console.log('Language system status:', status);
   ```

2. **Test Language Bridge:**
   ```javascript
   const testResult = StakeOutAI.testLanguage();
   console.log('Language bridge test:', testResult);
   ```

3. **Force Language Refresh:**
   ```javascript
   if (window.LanguageManager) {
     await window.LanguageManager.forceLanguageRefresh();
   }
   ```

4. **Try Alternative Methods:**
   ```javascript
   // Try each method in sequence
   const methods = [
     () => StakeOutAI.setLanguage('es'),
     () => UIBridge.setLanguage('es'),
     () => window.setLanguageFromAndroid('es'),
     () => window.LanguageManager.setLanguageManually('es'),
     () => window.setGlobalAppLanguage('es')
   ];
   
   for (const method of methods) {
     try {
       const result = method();
       if (result) {
         console.log('Language set successfully using method:', method.name);
         break;
       }
     } catch (error) {
       console.warn('Method failed:', method.name, error);
     }
   }
   ```

### Common Issues and Solutions

1. **Timing Issues:**
   - Use `StakeOutAI.setLanguage()` which waits for system readiness
   - Use `LanguageIntegration.setLanguageImmediately()` for immediate setting
   - Use polling integration as fallback

2. **Translation Not Working:**
   - Check if App.I18n is available
   - Verify translation keys exist
   - Built-in translations will be used as fallback

3. **Android Integration Issues:**
   - Ensure WebView allows JavaScript execution
   - Check if UIBridge is properly initialized
   - Use multiple Android integration methods

## Supported Languages

The system supports the following languages:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Dutch (nl)
- Danish (da)
- Swedish (sv)
- Norwegian (no)

## Configuration

### Adding New Languages

1. **Add to LanguageManager:**
   ```javascript
   // In language-manager.js
   this.availableLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'da', 'sv', 'no', 'newlang'];
   ```

2. **Add Translations to Enhanced UI:**
   ```javascript
   // In StakeOutUIEnhanced.js
   const translations = {
     'stakeout.zoom_in': {
       'newlang': 'New Language Translation'
     }
   };
   ```

### Customizing Retry Logic

```javascript
// In language-manager.js constructor
this.maxRetries = 10;        // Increase retry attempts
this.retryDelay = 500;       // Reduce retry delay
```

## Best Practices

1. **Use Multiple Methods:** Implement multiple integration methods for maximum reliability
2. **Test Thoroughly:** Use the built-in test functions to verify language setting
3. **Monitor Status:** Check system status regularly for troubleshooting
4. **Provide Fallbacks:** Always provide fallback translations
5. **Handle Errors:** Implement proper error handling for all methods

## Example Implementation

```javascript
// Comprehensive language setting with fallbacks
async function setLanguageRobustly(language) {
  console.log('Setting language to:', language);
  
  // Method 1: Try StakeOutAI (recommended)
  try {
    if (window.StakeOutAI && StakeOutAI.setLanguage(language)) {
      console.log('Language set via StakeOutAI');
      return true;
    }
  } catch (error) {
    console.warn('StakeOutAI method failed:', error);
  }
  
  // Method 2: Try LanguageBridge
  try {
    if (window.LanguageBridge && window.LanguageBridge.setLanguage(language)) {
      console.log('Language set via LanguageBridge');
      return true;
    }
  } catch (error) {
    console.warn('LanguageBridge method failed:', error);
  }
  
  // Method 3: Try LanguageManager
  try {
    if (window.LanguageManager) {
      await window.LanguageManager.setLanguage(language);
      console.log('Language set via LanguageManager');
      return true;
    }
  } catch (error) {
    console.warn('LanguageManager method failed:', error);
  }
  
  // Method 4: Try UIBridge
  try {
    if (typeof UIBridge !== 'undefined' && UIBridge.setLanguage) {
      UIBridge.setLanguage(language);
      console.log('Language set via UIBridge');
      return true;
    }
  } catch (error) {
    console.warn('UIBridge method failed:', error);
  }
  
  // Method 5: Try direct App.I18n
  try {
    if (typeof App !== 'undefined' && App.I18n && App.I18n.setLocale) {
      App.I18n.setLocale(language);
      console.log('Language set via App.I18n');
      return true;
    }
  } catch (error) {
    console.warn('App.I18n method failed:', error);
  }
  
  console.error('All language setting methods failed');
  return false;
}
```

## Summary

This language integration system provides 5 robust alternative approaches to ensure language setting works reliably:

1. **StakeOutAI Controls** - For immediate testing and manual control
2. **LanguageBridge** - For UIBridge and Android Activity integration
3. **LanguageManager** - For robust setting with retry logic
4. **LanguageIntegration** - For different timing scenarios
5. **Enhanced UI Translation** - For automatic translation with fallbacks

Each method works independently and can be used as needed. The system is designed to be fault-tolerant with comprehensive error handling and multiple fallback mechanisms.