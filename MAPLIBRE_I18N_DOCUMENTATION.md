# MapLibre I18n Documentation

## Overview

The MapLibre i18n (internationalization) system provides comprehensive multi-language support for the MapLibre web engine within the Geolantis 360 Android application. This system enables dynamic language switching, automatic language detection, and seamless integration between JavaScript and Android native code.

## Table of Contents

1. [Architecture and Components](#architecture-and-components)
2. [System Features](#system-features)
3. [How to Add New Languages](#how-to-add-new-languages)
4. [How to Add New Translation Keys](#how-to-add-new-translation-keys)
5. [Integration with Android](#integration-with-android)
6. [Translation File Structure](#translation-file-structure)
7. [Testing Procedures](#testing-procedures)
8. [Usage Examples](#usage-examples)
9. [Best Practices](#best-practices)
10. [Troubleshooting Guide](#troubleshooting-guide)

## Architecture and Components

### Core Components

The i18n system consists of the following components:

1. **i18n-manager.js**: Main translation manager
2. **Translation Files**: JSON files containing language-specific translations
3. **HTML Data Attributes**: For automatic DOM element translation
4. **Bridge Interface**: For Android integration

### File Structure

```
src/
├── i18n/
│   ├── i18n-manager.js           # Main i18n manager
│   └── translations/
│       ├── en.json              # English translations
│       ├── de.json              # German translations
│       ├── es.json              # Spanish translations (placeholder)
│       ├── fr.json              # French translations (placeholder)
│       └── it.json              # Italian translations (placeholder)
└── test-i18n.html              # Testing interface
```

## System Features

### Language Management
- **Automatic Language Detection**: Detects browser/system language
- **Fallback System**: Uses English as fallback when translations are missing
- **Language Persistence**: Saves selected language in localStorage
- **Dynamic Language Switching**: Change language without page reload

### Translation Features
- **Nested Translation Keys**: Support for dot notation (`ui.tabs.layers`)
- **Parameter Interpolation**: Dynamic values in translations (`{{parameter}}`)
- **Multiple Attribute Support**: Text content, placeholders, and titles
- **Number Formatting**: Locale-specific number formatting

### Integration Features
- **Android Bridge**: Native Android integration support
- **Event System**: Language change events for component updates
- **Performance Optimized**: Lazy loading of translation files

## How to Add New Languages

### Step 1: Create Translation File

1. Create a new JSON file in `src/i18n/translations/` with the language code:
   ```bash
   # Example for Spanish
   touch src/i18n/translations/es.json
   ```

2. Copy the structure from `en.json` and translate all values:
   ```json
   {
     "ui": {
       "tabs": {
         "layers": "Capas",
         "basemaps": "Mapas base",
         "bookmarks": "Marcadores"
       }
     }
   }
   ```

### Step 2: Update i18n-manager.js

Add the language to the supported languages list:

```javascript
isLanguageSupported: function(lang) {
    const supported = ['en', 'de', 'es', 'fr', 'it', 'pt']; // Add 'pt' for Portuguese
    return supported.includes(lang);
},

getAvailableLanguages: function() {
    return [
        { code: 'en', name: 'English' },
        { code: 'de', name: 'Deutsch' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
        { code: 'it', name: 'Italiano' },
        { code: 'pt', name: 'Português' }  // Add new language
    ];
}
```

### Step 3: Update Locale Mapping

Add locale mapping for number formatting:

```javascript
getLocale: function() {
    const localeMap = {
        'en': 'en-US',
        'de': 'de-DE',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'it': 'it-IT',
        'pt': 'pt-BR'  // Add new locale
    };
    return localeMap[this.currentLanguage] || 'en-US';
}
```

### Step 4: Test the New Language

1. Open `test-i18n.html`
2. Add a button for the new language
3. Test all translation keys
4. Verify number formatting works correctly

## How to Add New Translation Keys

### Step 1: Define the Key Structure

Use dot notation for nested keys:
```json
{
  "newSection": {
    "subsection": {
      "keyName": "Translation value"
    }
  }
}
```

### Step 2: Add to All Language Files

Add the same key structure to all language files:

**en.json:**
```json
{
  "toolbar": {
    "drawing": {
      "startDrawing": "Start Drawing",
      "stopDrawing": "Stop Drawing"
    }
  }
}
```

**de.json:**
```json
{
  "toolbar": {
    "drawing": {
      "startDrawing": "Zeichnung beginnen",
      "stopDrawing": "Zeichnung beenden"
    }
  }
}
```

### Step 3: Use in HTML

Add data attributes to HTML elements:

```html
<!-- Text content -->
<button data-i18n="toolbar.drawing.startDrawing">Start Drawing</button>

<!-- Placeholder text -->
<input type="text" data-i18n-placeholder="search.placeholder">

<!-- Title attribute -->
<button data-i18n-title="toolbar.drawing.tooltip">Draw</button>
```

### Step 4: Use in JavaScript

```javascript
// Simple translation
const text = App.I18n.t('toolbar.drawing.startDrawing');

// With parameters
const message = App.I18n.t('messages.itemsFound', { count: 5 });
// Translation: "Found {{count}} items" -> "Found 5 items"
```

## Integration with Android

### Android Bridge Setup

The i18n system integrates with Android through the bridge interface:

```javascript
// Android can call this to change language
function setLanguageFromAndroid(languageCode) {
    App.I18n.setLanguage(languageCode).then(() => {
        console.log('Language changed from Android:', languageCode);
    });
}

// Make function available to Android
window.setLanguageFromAndroid = setLanguageFromAndroid;
```

### Android Implementation

In your Android activity:

```java
// Change language from Android
webView.evaluateJavascript("setLanguageFromAndroid('de')", null);

// Get current language
webView.evaluateJavascript("App.I18n.getLanguage()", new ValueCallback<String>() {
    @Override
    public void onReceiveValue(String value) {
        String currentLanguage = value.replace("\"", "");
        // Use the current language
    }
});
```

### Language Detection from Android

The system can detect Android's system language:

```javascript
// This will automatically detect Android's language
App.I18n.init().then(() => {
    console.log('Detected language:', App.I18n.getLanguage());
});
```

## Translation File Structure

### Basic Structure

```json
{
  "section": {
    "subsection": {
      "key": "Translation value"
    }
  }
}
```

### Parameter Interpolation

```json
{
  "messages": {
    "welcome": "Welcome, {{username}}!",
    "itemCount": "Found {{count}} items in {{category}}",
    "coordinates": "Lat: {{lat}}, Lon: {{lon}}"
  }
}
```

### Complex Nested Structure

```json
{
  "ui": {
    "tabs": {
      "layers": "Layers",
      "basemaps": "Basemaps"
    },
    "buttons": {
      "save": "Save",
      "cancel": "Cancel",
      "actions": {
        "edit": "Edit",
        "delete": "Delete"
      }
    }
  }
}
```

### Arrays and Lists

```json
{
  "measurements": {
    "units": {
      "distance": ["meters", "kilometers", "feet", "miles"],
      "area": ["square meters", "square kilometers", "hectares"]
    }
  }
}
```

## Testing Procedures

### Manual Testing

1. **Open Test Interface**:
   ```
   Open test-i18n.html in browser
   ```

2. **Test Language Switching**:
   - Click each language button
   - Verify all text updates correctly
   - Check browser console for errors

3. **Test HTML Attributes**:
   - Verify `data-i18n` updates text content
   - Check `data-i18n-placeholder` updates placeholders
   - Confirm `data-i18n-title` updates title attributes

### Automated Testing

Create test scripts to verify translations:

```javascript
// Test all keys exist in all languages
function testTranslationCompleteness() {
    const languages = ['en', 'de', 'es', 'fr', 'it'];
    const englishKeys = getAllKeys(App.I18n.translations.en);
    
    languages.forEach(lang => {
        const langKeys = getAllKeys(App.I18n.translations[lang]);
        const missingKeys = englishKeys.filter(key => !langKeys.includes(key));
        
        if (missingKeys.length > 0) {
            console.warn(`Missing keys in ${lang}:`, missingKeys);
        }
    });
}

// Test parameter interpolation
function testParameterInterpolation() {
    const result = App.I18n.t('stakeout.totalDistance', { distance: 150 });
    console.log('Interpolation test:', result); // Should show "Total: 150 m"
}
```

### Integration Testing

Test with Android WebView:

```javascript
// Test language detection
App.I18n.init().then(() => {
    console.log('Initial language:', App.I18n.getLanguage());
    
    // Test language change
    App.I18n.setLanguage('de').then(() => {
        console.log('Changed to German');
        
        // Test translation
        const translation = App.I18n.t('ui.tabs.layers');
        console.log('German translation:', translation); // Should be "Ebenen"
    });
});
```

## Usage Examples

### Basic HTML Usage

```html
<!DOCTYPE html>
<html>
<head>
    <script src="src/i18n/i18n-manager.js"></script>
</head>
<body>
    <!-- Text content translation -->
    <h1 data-i18n="ui.title">Map Application</h1>
    
    <!-- Button with translation -->
    <button data-i18n="ui.buttons.save">Save</button>
    
    <!-- Input with placeholder translation -->
    <input type="text" data-i18n-placeholder="search.placeholder">
    
    <!-- Element with title translation -->
    <button data-i18n-title="ui.buttons.help.tooltip" data-i18n="ui.buttons.help">Help</button>
</body>
</html>
```

### JavaScript Usage

```javascript
// Initialize i18n
App.I18n.init('de').then(() => {
    console.log('I18n initialized with German');
    
    // Get simple translation
    const title = App.I18n.t('ui.title');
    
    // Get translation with parameters
    const message = App.I18n.t('messages.welcome', { username: 'John' });
    
    // Change language dynamically
    App.I18n.setLanguage('en').then(() => {
        console.log('Language changed to English');
    });
});

// Listen for language changes
document.addEventListener('languageChanged', (event) => {
    console.log('Language changed to:', event.detail.language);
    // Update custom components
    updateCustomComponents();
});
```

### Component Integration

```javascript
// Custom component with i18n support
class CustomButton {
    constructor(translationKey) {
        this.translationKey = translationKey;
        this.element = document.createElement('button');
        this.updateText();
        
        // Listen for language changes
        document.addEventListener('languageChanged', () => {
            this.updateText();
        });
    }
    
    updateText() {
        this.element.textContent = App.I18n.t(this.translationKey);
    }
}

// Usage
const saveButton = new CustomButton('ui.buttons.save');
```

### Dynamic Content Translation

```javascript
// Translate dynamic content
function createFeatureInfoPanel(feature) {
    const panel = document.createElement('div');
    
    // Static translations
    const title = App.I18n.t('featureInfo.title');
    
    // Dynamic translations with parameters
    const info = App.I18n.t('featureInfo.coordinates', {
        lat: feature.lat.toFixed(6),
        lon: feature.lon.toFixed(6)
    });
    
    panel.innerHTML = `
        <h3>${title}</h3>
        <p>${info}</p>
    `;
    
    return panel;
}
```

## Best Practices

### Translation Key Naming

1. **Use Descriptive Names**:
   ```json
   // Good
   "ui.buttons.save": "Save"
   
   // Bad
   "btn1": "Save"
   ```

2. **Group Related Keys**:
   ```json
   {
     "measurement": {
       "tools": {
         "distance": "Distance",
         "area": "Area"
       },
       "units": {
         "meters": "m",
         "kilometers": "km"
       }
     }
   }
   ```

3. **Use Consistent Patterns**:
   ```json
   {
     "buttons": {
       "save": "Save",
       "cancel": "Cancel",
       "delete": "Delete"
     }
   }
   ```

### Translation Content

1. **Keep Translations Concise**:
   ```json
   // Good
   "ui.buttons.save": "Save"
   
   // Avoid
   "ui.buttons.save": "Save the current document"
   ```

2. **Use Proper Capitalization**:
   ```json
   // English: Title Case for buttons
   "ui.buttons.saveDocument": "Save Document"
   
   // German: Different capitalization rules
   "ui.buttons.saveDocument": "Dokument speichern"
   ```

3. **Handle Pluralization**:
   ```json
   {
     "messages": {
       "itemFound": "Found {{count}} item",
       "itemsFound": "Found {{count}} items"
     }
   }
   ```

### Performance Optimization

1. **Lazy Load Languages**:
   ```javascript
   // Only load language when needed
   App.I18n.loadLanguage('de').then(() => {
       App.I18n.setLanguage('de');
   });
   ```

2. **Cache Translations**:
   ```javascript
   // Cache frequently used translations
   const commonTranslations = {
       save: App.I18n.t('ui.buttons.save'),
       cancel: App.I18n.t('ui.buttons.cancel')
   };
   ```

3. **Minimize DOM Updates**:
   ```javascript
   // Batch DOM updates
   function updateLanguage(newLang) {
       App.I18n.setLanguage(newLang).then(() => {
           // Update all elements at once
           App.I18n.updatePageTranslations();
       });
   }
   ```

### Error Handling

1. **Provide Fallbacks**:
   ```javascript
   function getTranslation(key, fallback) {
       const translation = App.I18n.t(key);
       return translation !== key ? translation : fallback;
   }
   ```

2. **Log Missing Translations**:
   ```javascript
   const originalT = App.I18n.t;
   App.I18n.t = function(key, params) {
       const result = originalT.call(this, key, params);
       if (result === key) {
           console.warn('Missing translation:', key);
       }
       return result;
   };
   ```

## Troubleshooting Guide

### Common Issues

#### 1. Translation Not Loading

**Problem**: Translation files are not loading

**Solutions**:
```javascript
// Check if translation file exists
fetch('src/i18n/translations/de.json')
    .then(response => {
        if (!response.ok) {
            console.error('Translation file not found:', response.status);
        }
        return response.json();
    })
    .then(data => console.log('Translation loaded:', data))
    .catch(error => console.error('Error loading translation:', error));

// Check file path
console.log('Current path:', window.location.pathname);
```

#### 2. Language Not Switching

**Problem**: Language changes but UI doesn't update

**Solutions**:
```javascript
// Check if language is supported
if (!App.I18n.isLanguageSupported('xyz')) {
    console.error('Language not supported');
}

// Manually trigger update
App.I18n.setLanguage('de').then(() => {
    App.I18n.updatePageTranslations();
});

// Check for DOM elements
const elements = document.querySelectorAll('[data-i18n]');
console.log('Found elements:', elements.length);
```

#### 3. Translation Keys Not Found

**Problem**: Translation returns the key instead of translated text

**Solutions**:
```javascript
// Check if key exists in translation
const translation = App.I18n.translations[App.I18n.getLanguage()];
console.log('Available keys:', Object.keys(translation));

// Test specific key
const result = App.I18n.t('ui.tabs.layers');
console.log('Translation result:', result);

// Check nested keys
function checkKey(obj, path) {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return false;
        }
    }
    return true;
}
```

#### 4. Parameter Interpolation Not Working

**Problem**: Parameters in translations are not being replaced

**Solutions**:
```javascript
// Check parameter format
const template = "Hello {{name}}!";
const params = { name: "World" };
const result = template.replace(/\{\{(\w+)\}\}/g, (match, key) => params[key] || match);
console.log('Result:', result);

// Test with i18n
const translation = App.I18n.t('messages.welcome', { username: 'John' });
console.log('I18n result:', translation);
```

### Debugging Tools

#### Translation Validator

```javascript
function validateTranslations() {
    const languages = Object.keys(App.I18n.translations);
    const baseKeys = getAllKeys(App.I18n.translations.en);
    
    languages.forEach(lang => {
        const langKeys = getAllKeys(App.I18n.translations[lang]);
        const missing = baseKeys.filter(key => !langKeys.includes(key));
        const extra = langKeys.filter(key => !baseKeys.includes(key));
        
        if (missing.length > 0) {
            console.warn(`${lang}: Missing keys:`, missing);
        }
        if (extra.length > 0) {
            console.warn(`${lang}: Extra keys:`, extra);
        }
    });
}

function getAllKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            keys = keys.concat(getAllKeys(obj[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}
```

#### Translation Coverage Report

```javascript
function generateCoverageReport() {
    const elements = document.querySelectorAll('[data-i18n], [data-i18n-placeholder], [data-i18n-title]');
    const usedKeys = new Set();
    
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n') || 
                   el.getAttribute('data-i18n-placeholder') || 
                   el.getAttribute('data-i18n-title');
        if (key) usedKeys.add(key);
    });
    
    const allKeys = getAllKeys(App.I18n.translations.en);
    const unusedKeys = allKeys.filter(key => !usedKeys.has(key));
    
    console.log('Used keys:', usedKeys.size);
    console.log('Total keys:', allKeys.length);
    console.log('Unused keys:', unusedKeys);
}
```

### Browser Console Commands

```javascript
// Check current language
App.I18n.getLanguage()

// Get all available languages
App.I18n.getAvailableLanguages()

// Test specific translation
App.I18n.t('ui.tabs.layers')

// Test with parameters
App.I18n.t('stakeout.totalDistance', { distance: 150 })

// Check loaded languages
App.I18n.loadedLanguages

// Force reload translations
App.I18n.loadedLanguages.clear()
App.I18n.loadLanguage('de')
```

---

## Additional Resources

- **Test Interface**: `test-i18n.html` - Interactive testing interface
- **Source Code**: `src/i18n/i18n-manager.js` - Main implementation
- **Translation Files**: `src/i18n/translations/` - Language files
- **Integration Examples**: Look for `data-i18n` attributes in HTML files

For questions or issues, refer to the troubleshooting section or check the browser console for detailed error messages.