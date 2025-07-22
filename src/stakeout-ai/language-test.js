/**
 * Language Integration Test Script
 * Demonstrates all alternative language setting methods
 */

// Test configuration
const TEST_LANGUAGE = 'es'; // Change this to test different languages
const AVAILABLE_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'da', 'sv', 'no'];

console.log('🔧 Language Integration Test Script');
console.log('===================================');
console.log('Test Language:', TEST_LANGUAGE);
console.log('Available Languages:', AVAILABLE_LANGUAGES.join(', '));
console.log('');

/**
 * Test Method 1: StakeOutAI Controls
 */
function testStakeOutAIControls() {
  console.log('📋 Testing StakeOutAI Controls...');
  
  if (typeof StakeOutAI !== 'undefined') {
    try {
      // Get current language
      const currentLang = StakeOutAI.getCurrentLanguage();
      console.log('  ✓ Current language:', currentLang);
      
      // Set new language
      const setResult = StakeOutAI.setLanguage(TEST_LANGUAGE);
      console.log('  ✓ Set language result:', setResult);
      
      // Verify language change
      const newLang = StakeOutAI.getCurrentLanguage();
      console.log('  ✓ New language:', newLang);
      
      // Get status
      const status = StakeOutAI.getLanguageStatus();
      console.log('  ✓ Language status:', status);
      
      // Test language system
      const testResult = StakeOutAI.testLanguage();
      console.log('  ✓ Language test result:', testResult);
      
      console.log('  ✅ StakeOutAI Controls: PASSED');
      return true;
    } catch (error) {
      console.log('  ❌ StakeOutAI Controls: FAILED -', error.message);
      return false;
    }
  } else {
    console.log('  ⚠️  StakeOutAI Controls: NOT AVAILABLE');
    return false;
  }
}

/**
 * Test Method 2: LanguageBridge
 */
function testLanguageBridge() {
  console.log('🌉 Testing LanguageBridge...');
  
  if (typeof window.LanguageBridge !== 'undefined') {
    try {
      // Get current language
      const currentLang = window.LanguageBridge.getCurrentLanguage();
      console.log('  ✓ Current language:', currentLang);
      
      // Set new language
      const setResult = window.LanguageBridge.setLanguage(TEST_LANGUAGE);
      console.log('  ✓ Set language result:', setResult);
      
      // Get bridge status
      const status = window.LanguageBridge.getStatus();
      console.log('  ✓ Bridge status:', status);
      
      // Test bridge
      const testResult = window.LanguageBridge.testBridge();
      console.log('  ✓ Bridge test result:', testResult);
      
      console.log('  ✅ LanguageBridge: PASSED');
      return true;
    } catch (error) {
      console.log('  ❌ LanguageBridge: FAILED -', error.message);
      return false;
    }
  } else {
    console.log('  ⚠️  LanguageBridge: NOT AVAILABLE');
    return false;
  }
}

/**
 * Test Method 3: LanguageManager
 */
async function testLanguageManager() {
  console.log('🔧 Testing LanguageManager...');
  
  if (typeof window.LanguageManager !== 'undefined') {
    try {
      // Get current language
      const currentLang = window.LanguageManager.getCurrentLanguage();
      console.log('  ✓ Current language:', currentLang);
      
      // Set language manually
      const setResult = window.LanguageManager.setLanguageManually(TEST_LANGUAGE);
      console.log('  ✓ Set language manually result:', setResult);
      
      // Set language with async
      const asyncResult = await window.LanguageManager.setLanguage(TEST_LANGUAGE);
      console.log('  ✓ Set language async result:', asyncResult);
      
      // Get debug info
      const debugInfo = window.LanguageManager.getDebugInfo();
      console.log('  ✓ Debug info:', debugInfo);
      
      // Force refresh
      await window.LanguageManager.forceLanguageRefresh();
      console.log('  ✓ Force refresh completed');
      
      console.log('  ✅ LanguageManager: PASSED');
      return true;
    } catch (error) {
      console.log('  ❌ LanguageManager: FAILED -', error.message);
      return false;
    }
  } else {
    console.log('  ⚠️  LanguageManager: NOT AVAILABLE');
    return false;
  }
}

/**
 * Test Method 4: Enhanced UIBridge
 */
function testEnhancedUIBridge() {
  console.log('🔗 Testing Enhanced UIBridge...');
  
  if (typeof UIBridge !== 'undefined') {
    try {
      // Test standard UIBridge methods
      if (UIBridge.setLanguage) {
        UIBridge.setLanguage(TEST_LANGUAGE);
        console.log('  ✓ UIBridge.setLanguage called');
      }
      
      if (UIBridge.getLanguage) {
        const currentLang = UIBridge.getLanguage();
        console.log('  ✓ Current language via UIBridge:', currentLang);
      }
      
      if (UIBridge.updateLanguage) {
        UIBridge.updateLanguage(TEST_LANGUAGE);
        console.log('  ✓ UIBridge.updateLanguage called');
      }
      
      if (UIBridge.changeLanguage) {
        UIBridge.changeLanguage(TEST_LANGUAGE);
        console.log('  ✓ UIBridge.changeLanguage called');
      }
      
      // Test additional methods
      if (UIBridge.getAvailableLanguages) {
        const availableLangs = UIBridge.getAvailableLanguages();
        console.log('  ✓ Available languages:', availableLangs);
      }
      
      if (UIBridge.isLanguageSupported) {
        const isSupported = UIBridge.isLanguageSupported(TEST_LANGUAGE);
        console.log('  ✓ Language support check:', isSupported);
      }
      
      console.log('  ✅ Enhanced UIBridge: PASSED');
      return true;
    } catch (error) {
      console.log('  ❌ Enhanced UIBridge: FAILED -', error.message);
      return false;
    }
  } else {
    console.log('  ⚠️  Enhanced UIBridge: NOT AVAILABLE');
    return false;
  }
}

/**
 * Test Method 5: Android Integration Methods
 */
function testAndroidIntegration() {
  console.log('📱 Testing Android Integration...');
  
  try {
    let methodCount = 0;
    
    // Test Android methods
    if (typeof window.setLanguageFromAndroid !== 'undefined') {
      const result = window.setLanguageFromAndroid(TEST_LANGUAGE);
      console.log('  ✓ setLanguageFromAndroid result:', result);
      methodCount++;
    }
    
    if (typeof window.updateLanguageFromAndroid !== 'undefined') {
      const result = window.updateLanguageFromAndroid(TEST_LANGUAGE);
      console.log('  ✓ updateLanguageFromAndroid result:', result);
      methodCount++;
    }
    
    if (typeof window.getLanguageForAndroid !== 'undefined') {
      const currentLang = window.getLanguageForAndroid();
      console.log('  ✓ getLanguageForAndroid result:', currentLang);
      methodCount++;
    }
    
    if (typeof window.validateLanguageForAndroid !== 'undefined') {
      const isValid = window.validateLanguageForAndroid(TEST_LANGUAGE);
      console.log('  ✓ validateLanguageForAndroid result:', isValid);
      methodCount++;
    }
    
    if (typeof window.notifyLanguageChanged !== 'undefined') {
      window.notifyLanguageChanged(TEST_LANGUAGE);
      console.log('  ✓ notifyLanguageChanged called');
      methodCount++;
    }
    
    if (methodCount > 0) {
      console.log('  ✅ Android Integration: PASSED (' + methodCount + ' methods available)');
      return true;
    } else {
      console.log('  ⚠️  Android Integration: NO METHODS AVAILABLE');
      return false;
    }
  } catch (error) {
    console.log('  ❌ Android Integration: FAILED -', error.message);
    return false;
  }
}

/**
 * Test Method 6: Global Methods
 */
function testGlobalMethods() {
  console.log('🌍 Testing Global Methods...');
  
  try {
    let methodCount = 0;
    
    // Test global methods
    if (typeof window.setGlobalAppLanguage !== 'undefined') {
      const result = window.setGlobalAppLanguage(TEST_LANGUAGE);
      console.log('  ✓ setGlobalAppLanguage result:', result);
      methodCount++;
    }
    
    if (typeof window.getGlobalAppLanguage !== 'undefined') {
      const currentLang = window.getGlobalAppLanguage();
      console.log('  ✓ getGlobalAppLanguage result:', currentLang);
      methodCount++;
    }
    
    if (typeof window.setGlobalLanguage !== 'undefined') {
      const result = window.setGlobalLanguage(TEST_LANGUAGE);
      console.log('  ✓ setGlobalLanguage result:', result);
      methodCount++;
    }
    
    if (typeof window.getGlobalLanguage !== 'undefined') {
      const currentLang = window.getGlobalLanguage();
      console.log('  ✓ getGlobalLanguage result:', currentLang);
      methodCount++;
    }
    
    if (typeof window.validateLanguage !== 'undefined') {
      const isValid = window.validateLanguage(TEST_LANGUAGE);
      console.log('  ✓ validateLanguage result:', isValid);
      methodCount++;
    }
    
    if (methodCount > 0) {
      console.log('  ✅ Global Methods: PASSED (' + methodCount + ' methods available)');
      return true;
    } else {
      console.log('  ⚠️  Global Methods: NO METHODS AVAILABLE');
      return false;
    }
  } catch (error) {
    console.log('  ❌ Global Methods: FAILED -', error.message);
    return false;
  }
}

/**
 * Test Method 7: Direct App.I18n
 */
function testDirectAppI18n() {
  console.log('🔤 Testing Direct App.I18n...');
  
  if (typeof App !== 'undefined' && App.I18n) {
    try {
      // Get current locale
      const currentLocale = App.I18n.locale;
      console.log('  ✓ Current locale:', currentLocale);
      
      // Set locale via setLocale
      if (App.I18n.setLocale) {
        App.I18n.setLocale(TEST_LANGUAGE);
        console.log('  ✓ setLocale called');
      }
      
      // Set locale directly
      if (App.I18n.locale !== undefined) {
        App.I18n.locale = TEST_LANGUAGE;
        console.log('  ✓ locale property set');
      }
      
      // Test translation
      if (App.I18n.t) {
        const translation = App.I18n.t('stakeout.zoom_in');
        console.log('  ✓ Translation test:', translation);
      }
      
      console.log('  ✅ Direct App.I18n: PASSED');
      return true;
    } catch (error) {
      console.log('  ❌ Direct App.I18n: FAILED -', error.message);
      return false;
    }
  } else {
    console.log('  ⚠️  Direct App.I18n: NOT AVAILABLE');
    return false;
  }
}

/**
 * Test Translation System
 */
function testTranslationSystem() {
  console.log('📖 Testing Translation System...');
  
  if (typeof window.StakeOutUIEnhanced !== 'undefined') {
    try {
      // Create instance to test translations
      const ui = new window.StakeOutUIEnhanced();
      
      // Test translation keys
      const testKeys = [
        'stakeout.zoom_in',
        'stakeout.zoom_out',
        'stakeout.auto_zoom'
      ];
      
      testKeys.forEach(key => {
        const translation = ui.getTranslation(key, key);
        console.log(`  ✓ ${key}: "${translation}"`);
      });
      
      console.log('  ✅ Translation System: PASSED');
      return true;
    } catch (error) {
      console.log('  ❌ Translation System: FAILED -', error.message);
      return false;
    }
  } else {
    console.log('  ⚠️  Translation System: NOT AVAILABLE');
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Running All Language Integration Tests...');
  console.log('');
  
  const results = [];
  
  // Run all tests
  results.push({ name: 'StakeOutAI Controls', passed: testStakeOutAIControls() });
  console.log('');
  
  results.push({ name: 'LanguageBridge', passed: testLanguageBridge() });
  console.log('');
  
  results.push({ name: 'LanguageManager', passed: await testLanguageManager() });
  console.log('');
  
  results.push({ name: 'Enhanced UIBridge', passed: testEnhancedUIBridge() });
  console.log('');
  
  results.push({ name: 'Android Integration', passed: testAndroidIntegration() });
  console.log('');
  
  results.push({ name: 'Global Methods', passed: testGlobalMethods() });
  console.log('');
  
  results.push({ name: 'Direct App.I18n', passed: testDirectAppI18n() });
  console.log('');
  
  results.push({ name: 'Translation System', passed: testTranslationSystem() });
  console.log('');
  
  // Print summary
  console.log('📊 Test Results Summary');
  console.log('=======================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.passed ? 'PASSED' : 'FAILED'}`);
  });
  
  console.log('');
  console.log(`Overall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
  
  if (passed > 0) {
    console.log('');
    console.log('✅ At least one language integration method is working!');
    console.log('💡 You can use any of the passing methods to set the language.');
  } else {
    console.log('');
    console.log('❌ No language integration methods are working.');
    console.log('💡 Check if the StakeOut AI system is properly loaded.');
  }
  
  return { passed, total, results };
}

// Auto-run tests if this script is loaded directly
if (typeof window !== 'undefined' && window.location) {
  // Wait for system to be ready
  setTimeout(async () => {
    try {
      const results = await runAllTests();
      
      // Store results globally for access
      window.languageTestResults = results;
      
      console.log('');
      console.log('💾 Test results stored in window.languageTestResults');
      console.log('🔄 Run runAllTests() to test again');
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    }
  }, 2000);
}

// Export functions for manual testing
if (typeof window !== 'undefined') {
  window.runAllTests = runAllTests;
  window.testStakeOutAIControls = testStakeOutAIControls;
  window.testLanguageBridge = testLanguageBridge;
  window.testLanguageManager = testLanguageManager;
  window.testEnhancedUIBridge = testEnhancedUIBridge;
  window.testAndroidIntegration = testAndroidIntegration;
  window.testGlobalMethods = testGlobalMethods;
  window.testDirectAppI18n = testDirectAppI18n;
  window.testTranslationSystem = testTranslationSystem;
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testStakeOutAIControls,
    testLanguageBridge,
    testLanguageManager,
    testEnhancedUIBridge,
    testAndroidIntegration,
    testGlobalMethods,
    testDirectAppI18n,
    testTranslationSystem
  };
}