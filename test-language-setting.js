/**
 * Test Language Setting Mechanism
 * Tests the fixed i18n system to ensure German language setting works
 */

console.log('[LANG-TEST] Starting language setting test...');

function testLanguageSetting() {
    console.log('=== LANGUAGE SETTING TEST ===\n');
    
    // Wait for i18n to be initialized
    if (!window.App || !window.App.I18n) {
        console.log('[LANG-TEST] App.I18n not ready, waiting...');
        setTimeout(testLanguageSetting, 500);
        return;
    }
    
    console.log('[LANG-TEST] App.I18n is available');
    
    // Test 1: Check initial state
    console.log('\n1. Initial state:');
    const debugInfo = App.I18n.getDebugInfo();
    console.log('   Initialized:', debugInfo.initialized);
    console.log('   Current language:', debugInfo.currentLanguage);
    console.log('   Loaded languages:', debugInfo.loadedLanguages);
    console.log('   Available translations:', debugInfo.translationKeys);
    
    // Test 2: Force German language
    console.log('\n2. Testing German language setting...');
    App.I18n.setLanguage('de')
        .then(() => {
            console.log('   ✅ German language set successfully');
            console.log('   Current language:', App.I18n.getLanguage());
            
            // Test 3: Test specific translations
            console.log('\n3. Testing specific German translations:');
            const testKeys = [
                'ui.tabs.layers',
                'ui.tabs.settings',
                'ui.settings.mapSettings',
                'ui.settings.buttonSize.label',
                'ui.settings.colorTheme.label',
                'presets.uiPresets',
                'stakeout.nodes',
                'stakeout.lines',
                'stakeout.total'
            ];
            
            testKeys.forEach(key => {
                const translation = App.I18n.t(key);
                const status = translation === key ? '❌' : '✅';
                console.log(`   ${status} ${key} = "${translation}"`);
            });
            
            // Test 4: Check if page elements are updated
            console.log('\n4. Checking page element updates:');
            const elementsWithI18n = document.querySelectorAll('[data-i18n]');
            console.log(`   Found ${elementsWithI18n.length} elements with data-i18n attributes`);
            
            let correctlyTranslated = 0;
            let incorrectlyTranslated = 0;
            
            elementsWithI18n.forEach(element => {
                const key = element.getAttribute('data-i18n');
                const expectedTranslation = App.I18n.t(key);
                const actualText = element.textContent.trim();
                
                if (expectedTranslation !== key && actualText === expectedTranslation) {
                    correctlyTranslated++;
                } else if (expectedTranslation !== key && actualText !== expectedTranslation) {
                    incorrectlyTranslated++;
                    console.log(`   ❌ Element "${key}": expected "${expectedTranslation}", got "${actualText}"`);
                }
            });
            
            console.log(`   ✅ ${correctlyTranslated} elements correctly translated`);
            console.log(`   ❌ ${incorrectlyTranslated} elements incorrectly translated`);
            
            // Test 5: Test Android bridge integration
            console.log('\n5. Testing Android bridge integration:');
            if (typeof window.bridge !== 'undefined' && typeof window.bridge.setLanguage === 'function') {
                console.log('   ✅ Android bridge setLanguage method available');
                
                // Test bridge call
                try {
                    window.bridge.setLanguage('de');
                    console.log('   ✅ Bridge setLanguage call successful');
                } catch (error) {
                    console.log('   ❌ Bridge setLanguage call failed:', error);
                }
            } else {
                console.log('   ⚠️  Android bridge not available (normal in browser)');
            }
            
            // Test 6: Test manual element updates
            console.log('\n6. Testing manual element updates:');
            App.I18n.updatePageTranslations();
            console.log('   ✅ Manual page translation update completed');
            
            // Final summary
            console.log('\n=== TEST SUMMARY ===');
            console.log('Language setting mechanism:', App.I18n.getLanguage() === 'de' ? '✅ WORKING' : '❌ FAILED');
            console.log('Translation system:', correctlyTranslated > 0 ? '✅ WORKING' : '❌ FAILED');
            console.log('Page updates:', correctlyTranslated > incorrectlyTranslated ? '✅ WORKING' : '❌ NEEDS WORK');
            
        })
        .catch(error => {
            console.error('[LANG-TEST] ❌ Error setting German language:', error);
        });
}

// Run test after a delay to ensure everything is loaded
setTimeout(testLanguageSetting, 3000);

// Also run when i18n is initialized
document.addEventListener('i18nInitialized', () => {
    console.log('[LANG-TEST] i18n initialized event received');
    setTimeout(testLanguageSetting, 500);
});

// Make available globally for manual testing
window.testLanguageSetting = testLanguageSetting;

console.log('[LANG-TEST] Test script loaded - will run in 3 seconds');