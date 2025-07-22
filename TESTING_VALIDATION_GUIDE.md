# Android Language Integration Testing & Validation Guide

## Overview

This guide provides comprehensive testing and validation procedures for the Android language integration in the MapLibre engine. The system supports multiple language setting methods with robust fallback mechanisms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start Testing](#quick-start-testing)
3. [Detailed Testing Procedures](#detailed-testing-procedures)
4. [Log Analysis](#log-analysis)
5. [Verification Methods](#verification-methods)
6. [Troubleshooting](#troubleshooting)
7. [Performance Testing](#performance-testing)
8. [Multi-Language Testing](#multi-language-testing)
9. [Android Activity Integration](#android-activity-integration)
10. [Test Automation](#test-automation)

---

## Prerequisites

### System Requirements
- Android WebView with JavaScript enabled
- StakeOut AI system loaded and initialized
- MapLibre engine running
- Valid language files and translations

### Test Environment Setup
1. **Load the test page:**
   ```html
   file:///android_asset/engine_ml/src/stakeout-ai/language-test.html
   ```

2. **Open browser console** for log monitoring

3. **Enable verbose logging** in your Android app:
   ```java
   WebView.setWebContentsDebuggingEnabled(true);
   ```

---

## Quick Start Testing

### 1. Basic System Test (30 seconds)

```javascript
// Test 1: Run comprehensive test suite
runAllTests();

// Test 2: Set language manually
StakeOutAI.setLanguage('es');

// Test 3: Verify language change
console.log('Current language:', StakeOutAI.getCurrentLanguage());

// Test 4: Check system status
console.log('System status:', StakeOutAI.getLanguageStatus());
```

### 2. Expected Quick Results
- ✅ At least 5/8 tests should pass
- ✅ Language should change to 'es' (Spanish)
- ✅ System status should show "initialized: true"
- ✅ No critical errors in console

---

## Detailed Testing Procedures

### Step 1: System Initialization Test

**Purpose:** Verify all language system components are loaded and initialized

**Test Commands:**
```javascript
// Check system availability
console.log('StakeOutAI available:', !!window.StakeOutAI);
console.log('LanguageManager available:', !!window.LanguageManager);
console.log('LanguageBridge available:', !!window.LanguageBridge);
console.log('App.I18n available:', !!(typeof App !== 'undefined' && App.I18n));

// Get detailed status
const status = StakeOutAI.getLanguageStatus();
console.log('Detailed status:', JSON.stringify(status, null, 2));
```

**Expected Results:**
- All major components should be available (true)
- Status should show initialized: true
- No errors in console

**Log Messages to Look For:**
```
✅ [StakeOutAI] System initialized successfully
✅ [LanguageManager] Language manager initialized
✅ [LanguageBridge] Bridge initialized
```

### Step 2: Language Setting Test

**Purpose:** Test all available language setting methods

**Test Commands:**
```javascript
// Test each method individually
testStakeOutAIControls();
testLanguageBridge();
testLanguageManager();
testEnhancedUIBridge();
testAndroidIntegration();
testGlobalMethods();
testDirectAppI18n();
testTranslationSystem();
```

**Expected Results:**
- Primary methods (StakeOutAI, LanguageBridge, LanguageManager) should PASS
- At least 60% of methods should work
- Language should be successfully set

**Log Messages to Look For:**
```
✅ StakeOutAI Controls: PASSED
✅ Language Bridge: PASSED
✅ Language Manager: PASSED
⚠️  Some methods may show NOT AVAILABLE (acceptable)
```

### Step 3: Language Change Verification

**Purpose:** Verify language changes are properly applied

**Test Commands:**
```javascript
// Test language change sequence
const originalLang = StakeOutAI.getCurrentLanguage();
console.log('Original language:', originalLang);

// Change to Spanish
StakeOutAI.setLanguage('es');
setTimeout(() => {
    console.log('After Spanish:', StakeOutAI.getCurrentLanguage());
    
    // Change to French
    StakeOutAI.setLanguage('fr');
    setTimeout(() => {
        console.log('After French:', StakeOutAI.getCurrentLanguage());
        
        // Change back to original
        StakeOutAI.setLanguage(originalLang);
        setTimeout(() => {
            console.log('After reset:', StakeOutAI.getCurrentLanguage());
        }, 100);
    }, 100);
}, 100);
```

**Expected Results:**
- Language should change to 'es', then 'fr', then back to original
- Each change should be reflected in getCurrentLanguage()
- No errors during transitions

### Step 4: Translation System Test

**Purpose:** Verify translations work correctly

**Test Commands:**
```javascript
// Test translation system
testTranslationSystem();

// Test specific translations
const testKeys = [
    'stakeout.zoom_in',
    'stakeout.zoom_out',
    'stakeout.auto_zoom',
    'stakeout.reset_view'
];

// Test in multiple languages
['en', 'es', 'fr', 'de'].forEach(lang => {
    StakeOutAI.setLanguage(lang);
    console.log(`\nTranslations for ${lang}:`);
    
    testKeys.forEach(key => {
        const translation = App.I18n.t(key);
        console.log(`  ${key}: "${translation}"`);
    });
});
```

**Expected Results:**
- Translations should be different for each language
- All keys should return meaningful translations
- No missing translation errors

---

## Log Analysis

### Critical Log Messages

**✅ Success Messages:**
```
[StakeOutAI] Language set successfully: es
[LanguageManager] Language setting completed: es
[LanguageBridge] Bridge operation successful
✅ StakeOutAI Controls: PASSED
```

**⚠️ Warning Messages (Usually OK):**
```
[LanguageManager] Language detection failed for source: [error]
⚠️  Enhanced UIBridge: NOT AVAILABLE
⚠️  Android Integration: NO METHODS AVAILABLE
```

**❌ Error Messages (Need Investigation):**
```
[LanguageManager] Failed to set language after 5 attempts
❌ StakeOutAI Controls: FAILED
ReferenceError: StakeOutAI is not defined
```

### Log Analysis Commands

```javascript
// Enable detailed logging
console.log('=== LANGUAGE SYSTEM DEBUG ===');

// Check all language sources
getCurrentLanguageInfo();

// Get debug information
if (window.LanguageManager) {
    console.log('LanguageManager debug:', window.LanguageManager.getDebugInfo());
}

// Test bridge status
if (window.LanguageBridge) {
    console.log('LanguageBridge status:', window.LanguageBridge.getStatus());
}
```

---

## Verification Methods

### 1. Visual Verification

**UI Element Test:**
```javascript
// Set language to Spanish
StakeOutAI.setLanguage('es');

// Check if UI elements are translated
const zoomInBtn = document.querySelector('[data-i18n="stakeout.zoom_in"]');
const zoomOutBtn = document.querySelector('[data-i18n="stakeout.zoom_out"]');

console.log('Zoom In text:', zoomInBtn?.textContent);
console.log('Zoom Out text:', zoomOutBtn?.textContent);
```

### 2. Translation Verification

**Translation Accuracy Test:**
```javascript
// Define expected translations
const expectedTranslations = {
    'stakeout.zoom_in': {
        'en': 'Zoom In',
        'es': 'Acercar',
        'fr': 'Zoom avant',
        'de': 'Vergrößern'
    }
};

// Test translation accuracy
Object.entries(expectedTranslations).forEach(([key, translations]) => {
    Object.entries(translations).forEach(([lang, expected]) => {
        StakeOutAI.setLanguage(lang);
        const actual = App.I18n.t(key);
        const match = actual === expected;
        console.log(`${key} [${lang}]: ${match ? '✅' : '❌'} "${actual}" (expected: "${expected}")`);
    });
});
```

### 3. Persistence Verification

**Storage Test:**
```javascript
// Test language persistence
StakeOutAI.setLanguage('de');
console.log('Language set to German');

// Check if stored in localStorage
const stored = localStorage.getItem('stakeout_language');
console.log('Stored in localStorage:', stored);

// Simulate page reload
location.reload();

// After reload, check if language is restored
setTimeout(() => {
    const restored = StakeOutAI.getCurrentLanguage();
    console.log('Language after reload:', restored);
}, 1000);
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "StakeOutAI is not defined"

**Symptoms:**
```
ReferenceError: StakeOutAI is not defined
```

**Solution:**
```javascript
// Check if system is loaded
if (typeof window.StakeOutAI === 'undefined') {
    console.log('StakeOutAI not loaded. Checking alternatives...');
    
    // Try alternative methods
    if (typeof window.LanguageManager !== 'undefined') {
        console.log('Using LanguageManager instead');
        window.LanguageManager.setLanguageManually('es');
    }
    
    // Try UIBridge
    if (typeof UIBridge !== 'undefined' && UIBridge.setLanguage) {
        console.log('Using UIBridge instead');
        UIBridge.setLanguage('es');
    }
}
```

#### Issue 2: Language Not Changing

**Symptoms:**
```
Language set request accepted but UI not updating
```

**Solution:**
```javascript
// Force language refresh
async function forceLanguageRefresh() {
    console.log('Forcing language refresh...');
    
    // Try all methods
    const methods = [
        () => StakeOutAI.setLanguage('es'),
        () => window.LanguageManager.setLanguageManually('es'),
        () => UIBridge.setLanguage('es'),
        () => App.I18n.setLocale('es')
    ];
    
    for (const method of methods) {
        try {
            await method();
            console.log('Method succeeded:', method.name);
            break;
        } catch (error) {
            console.warn('Method failed:', error);
        }
    }
    
    // Force UI refresh
    if (window.LanguageManager) {
        await window.LanguageManager.forceLanguageRefresh();
    }
}

forceLanguageRefresh();
```

#### Issue 3: Partial Translation

**Symptoms:**
```
Some UI elements translated, others not
```

**Solution:**
```javascript
// Check translation coverage
function checkTranslationCoverage(language) {
    const testKeys = [
        'stakeout.zoom_in',
        'stakeout.zoom_out',
        'stakeout.auto_zoom',
        'stakeout.reset_view',
        'stakeout.settings'
    ];
    
    StakeOutAI.setLanguage(language);
    
    console.log(`Translation coverage for ${language}:`);
    testKeys.forEach(key => {
        const translation = App.I18n.t(key);
        const isTranslated = translation !== key;
        console.log(`  ${key}: ${isTranslated ? '✅' : '❌'} "${translation}"`);
    });
}

checkTranslationCoverage('es');
```

---

## Performance Testing

### 1. Language Switch Performance

**Performance Test:**
```javascript
async function measureLanguageSwitchPerformance() {
    const languages = ['en', 'es', 'fr', 'de', 'it'];
    const results = [];
    
    for (const lang of languages) {
        const startTime = performance.now();
        
        await StakeOutAI.setLanguage(lang);
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        results.push({ language: lang, duration: duration });
        console.log(`Language switch to ${lang}: ${duration.toFixed(2)}ms`);
    }
    
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    console.log(`Average language switch time: ${avgDuration.toFixed(2)}ms`);
    
    return results;
}

measureLanguageSwitchPerformance();
```

**Expected Performance:**
- Language switch should complete in < 100ms
- Average time should be < 50ms
- No memory leaks after multiple switches

### 2. Memory Usage Test

**Memory Test:**
```javascript
function testMemoryUsage() {
    const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    
    // Perform 50 language switches
    const languages = ['en', 'es', 'fr', 'de', 'it'];
    
    for (let i = 0; i < 50; i++) {
        const lang = languages[i % languages.length];
        StakeOutAI.setLanguage(lang);
    }
    
    const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    console.log(`Memory usage increase: ${memoryIncrease} bytes`);
    console.log(`Memory increase acceptable: ${memoryIncrease < 1000000 ? '✅' : '❌'}`);
}

testMemoryUsage();
```

---

## Multi-Language Testing

### Comprehensive Language Test

**Test All Supported Languages:**
```javascript
async function testAllLanguages() {
    const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'da', 'sv', 'no'];
    const testKey = 'stakeout.zoom_in';
    
    console.log('=== Multi-Language Test ===');
    
    for (const lang of languages) {
        console.log(`\nTesting language: ${lang}`);
        
        // Set language
        const setResult = StakeOutAI.setLanguage(lang);
        console.log(`  Set result: ${setResult}`);
        
        // Verify current language
        const currentLang = StakeOutAI.getCurrentLanguage();
        console.log(`  Current language: ${currentLang}`);
        
        // Test translation
        const translation = App.I18n.t(testKey);
        console.log(`  Translation: "${translation}"`);
        
        // Verify not using key as translation
        const isProperTranslation = translation !== testKey;
        console.log(`  Proper translation: ${isProperTranslation ? '✅' : '❌'}`);
        
        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

testAllLanguages();
```

### Language Detection Test

**Test Language Detection:**
```javascript
function testLanguageDetection() {
    console.log('=== Language Detection Test ===');
    
    // Test browser language detection
    const browserLang = navigator.language || navigator.userLanguage;
    console.log('Browser language:', browserLang);
    
    // Test localStorage detection
    localStorage.setItem('app_language', 'fr');
    const storedLang = localStorage.getItem('app_language');
    console.log('Stored language:', storedLang);
    
    // Test auto-detection
    if (window.LanguageManager) {
        const debugInfo = window.LanguageManager.getDebugInfo();
        console.log('Language Manager sources:', debugInfo.sources);
    }
}

testLanguageDetection();
```

---

## Android Activity Integration

### Java/Kotlin Integration Test

**Test Android Activity Integration:**
```java
public class LanguageTestActivity extends Activity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        WebView webView = new WebView(this);
        setContentView(webView);
        
        // Enable debugging
        WebView.setWebContentsDebuggingEnabled(true);
        
        // Load test page
        webView.loadUrl("file:///android_asset/engine_ml/src/stakeout-ai/language-test.html");
        
        // Test language setting after page load
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                
                // Test language setting methods
                testLanguageSettingMethods(view);
            }
        });
    }
    
    private void testLanguageSettingMethods(WebView webView) {
        // Test 1: StakeOutAI method
        webView.evaluateJavascript("StakeOutAI.setLanguage('es')", result -> {
            Log.d("LanguageTest", "StakeOutAI.setLanguage result: " + result);
        });
        
        // Test 2: LanguageBridge method
        webView.evaluateJavascript("window.setLanguageFromAndroid('fr')", result -> {
            Log.d("LanguageTest", "setLanguageFromAndroid result: " + result);
        });
        
        // Test 3: UIBridge method
        webView.evaluateJavascript("UIBridge.setLanguage('de')", result -> {
            Log.d("LanguageTest", "UIBridge.setLanguage result: " + result);
        });
        
        // Test 4: Get current language
        webView.evaluateJavascript("StakeOutAI.getCurrentLanguage()", result -> {
            Log.d("LanguageTest", "Current language: " + result);
        });
        
        // Test 5: Get system status
        webView.evaluateJavascript("JSON.stringify(StakeOutAI.getLanguageStatus())", result -> {
            Log.d("LanguageTest", "System status: " + result);
        });
    }
}
```

### Integration Test JavaScript

**Test Android Integration from JavaScript:**
```javascript
function testAndroidIntegration() {
    console.log('=== Android Integration Test ===');
    
    // Test Android-specific methods
    const androidMethods = [
        'setLanguageFromAndroid',
        'updateLanguageFromAndroid',
        'getLanguageForAndroid',
        'validateLanguageForAndroid',
        'notifyLanguageChanged'
    ];
    
    androidMethods.forEach(method => {
        if (typeof window[method] !== 'undefined') {
            console.log(`✅ ${method} is available`);
            
            // Test the method
            try {
                const result = window[method]('es');
                console.log(`  ${method} result:`, result);
            } catch (error) {
                console.warn(`  ${method} error:`, error);
            }
        } else {
            console.log(`❌ ${method} is not available`);
        }
    });
}

testAndroidIntegration();
```

---

## Test Automation

### Automated Test Suite

**Create Automated Test Runner:**
```javascript
class LanguageTestRunner {
    constructor() {
        this.testResults = [];
        this.testCount = 0;
        this.passCount = 0;
    }
    
    async runTest(testName, testFunction) {
        console.log(`\n🔸 Running test: ${testName}`);
        this.testCount++;
        
        try {
            const result = await testFunction();
            const passed = result === true || (result && result.passed);
            
            if (passed) {
                this.passCount++;
                console.log(`✅ ${testName}: PASSED`);
            } else {
                console.log(`❌ ${testName}: FAILED`);
            }
            
            this.testResults.push({
                name: testName,
                passed: passed,
                result: result
            });
            
            return passed;
        } catch (error) {
            console.log(`❌ ${testName}: ERROR - ${error.message}`);
            this.testResults.push({
                name: testName,
                passed: false,
                error: error.message
            });
            
            return false;
        }
    }
    
    async runAllTests() {
        console.log('🚀 Starting Automated Language Test Suite');
        console.log('==========================================');
        
        // Test 1: System availability
        await this.runTest('System Availability', () => {
            return !!window.StakeOutAI && !!window.LanguageManager;
        });
        
        // Test 2: Language setting
        await this.runTest('Language Setting', () => {
            return StakeOutAI.setLanguage('es');
        });
        
        // Test 3: Language verification
        await this.runTest('Language Verification', () => {
            return StakeOutAI.getCurrentLanguage() === 'es';
        });
        
        // Test 4: Translation system
        await this.runTest('Translation System', () => {
            const translation = App.I18n.t('stakeout.zoom_in');
            return translation && translation !== 'stakeout.zoom_in';
        });
        
        // Test 5: Multiple language changes
        await this.runTest('Multiple Language Changes', async () => {
            const languages = ['en', 'fr', 'de'];
            for (const lang of languages) {
                const result = StakeOutAI.setLanguage(lang);
                if (!result) return false;
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return true;
        });
        
        // Test 6: Performance test
        await this.runTest('Performance Test', async () => {
            const startTime = performance.now();
            StakeOutAI.setLanguage('it');
            const endTime = performance.now();
            return (endTime - startTime) < 100; // Should complete in < 100ms
        });
        
        // Test 7: Error handling
        await this.runTest('Error Handling', () => {
            try {
                StakeOutAI.setLanguage('invalid_language');
                return false; // Should not succeed
            } catch (error) {
                return true; // Should throw error
            }
        });
        
        // Test 8: System status
        await this.runTest('System Status', () => {
            const status = StakeOutAI.getLanguageStatus();
            return status && status.initialized === true;
        });
        
        this.printResults();
        return this.getResults();
    }
    
    printResults() {
        console.log('\n📊 Test Results Summary');
        console.log('======================');
        
        this.testResults.forEach(result => {
            const icon = result.passed ? '✅' : '❌';
            console.log(`${icon} ${result.name}: ${result.passed ? 'PASSED' : 'FAILED'}`);
            if (result.error) {
                console.log(`    Error: ${result.error}`);
            }
        });
        
        const percentage = Math.round((this.passCount / this.testCount) * 100);
        console.log(`\nOverall: ${this.passCount}/${this.testCount} tests passed (${percentage}%)`);
        
        if (percentage >= 80) {
            console.log('🎉 Language integration is working well!');
        } else if (percentage >= 60) {
            console.log('⚠️  Language integration has some issues but is functional');
        } else {
            console.log('❌ Language integration needs attention');
        }
    }
    
    getResults() {
        return {
            totalTests: this.testCount,
            passedTests: this.passCount,
            failedTests: this.testCount - this.passCount,
            percentage: Math.round((this.passCount / this.testCount) * 100),
            results: this.testResults
        };
    }
}

// Create and run automated tests
const testRunner = new LanguageTestRunner();
testRunner.runAllTests();
```

### Continuous Integration Test

**CI/CD Test Script:**
```bash
#!/bin/bash
# Language integration test script for CI/CD

echo "🔧 Running Language Integration Tests"

# Start test server
cd /path/to/app/src/main/assets/engine_ml

# Run tests using headless browser
node -e "
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Load test page
  await page.goto('file://' + __dirname + '/src/stakeout-ai/language-test.html');
  
  // Wait for system to load
  await page.waitForTimeout(3000);
  
  // Run tests
  const testResults = await page.evaluate(() => {
    return new Promise((resolve) => {
      const runner = new LanguageTestRunner();
      runner.runAllTests().then(resolve);
    });
  });
  
  // Check results
  if (testResults.percentage >= 80) {
    console.log('✅ Language integration tests passed');
    process.exit(0);
  } else {
    console.log('❌ Language integration tests failed');
    process.exit(1);
  }
  
  await browser.close();
})();
"
```

---

## Test Checklist

### Pre-Testing Checklist
- [ ] Android WebView has JavaScript enabled
- [ ] StakeOut AI system is loaded
- [ ] MapLibre engine is running
- [ ] Test page is accessible
- [ ] Console is available for monitoring

### Testing Checklist
- [ ] System initialization test passes
- [ ] At least 5/8 language methods work
- [ ] Language changes are reflected in UI
- [ ] Translations are working correctly
- [ ] Performance is acceptable (< 100ms)
- [ ] Multiple language switches work
- [ ] Error handling works properly
- [ ] Android integration methods work

### Post-Testing Checklist
- [ ] No memory leaks detected
- [ ] System is stable after testing
- [ ] All test results documented
- [ ] Performance metrics recorded
- [ ] Issues identified and logged

---

## Support and Resources

### Debug Commands
```javascript
// Quick debug commands
StakeOutAI.getLanguageStatus();          // System status
StakeOutAI.testLanguage();               // Test language bridge
window.LanguageManager.getDebugInfo();   // Debug information
getCurrentLanguageInfo();                // All language sources
```

### Test Files
- `language-test.html` - Interactive test page
- `language-test.js` - Test script
- `LANGUAGE_INTEGRATION.md` - Integration guide

### Contact Information
For issues or questions, check the console logs first, then refer to the troubleshooting section above.

---

*This guide covers comprehensive testing of the Android language integration system. For specific implementation details, refer to the individual component documentation.*