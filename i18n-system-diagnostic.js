/**
 * I18n System Diagnostic
 * Tests the i18n system to identify why German translations aren't working
 */

console.log('[I18N-DIAG] Starting i18n system diagnostic...');

function runI18nDiagnostic() {
    console.log('=== I18N SYSTEM DIAGNOSTIC ===\n');
    
    // Test 1: Check if App.I18n exists
    console.log('1. Checking App.I18n availability...');
    if (typeof App === 'undefined' || !App.I18n) {
        console.error('   ❌ App.I18n is NOT available!');
        return;
    }
    console.log('   ✅ App.I18n is available');
    
    // Test 2: Check current state
    console.log('\n2. Current i18n state:');
    const debugInfo = App.I18n.getDebugInfo();
    console.log('   Current language:', debugInfo.currentLanguage);
    console.log('   Loaded languages:', debugInfo.loadedLanguages);
    console.log('   Available translation keys:', debugInfo.translationKeys);
    console.log('   Browser language:', debugInfo.browserLanguage);
    console.log('   Device language detection:', debugInfo.detectLanguageResult);
    
    // Test 3: Check German translation loading
    console.log('\n3. Testing German translation loading...');
    App.I18n.loadLanguage('de')
        .then(() => {
            console.log('   ✅ German language loaded successfully');
            
            // Check if German translations are in memory
            if (App.I18n.translations.de) {
                console.log('   ✅ German translations object exists');
                console.log('   German translation keys:', Object.keys(App.I18n.translations.de));
                
                // Test specific keys
                console.log('\n4. Testing specific German translations:');
                const testKeys = [
                    'ui.tabs.layers',
                    'ui.tabs.settings',
                    'ui.settings.mapSettings',
                    'ui.settings.buttonSize.label',
                    'ui.settings.colorTheme.label',
                    'presets.uiPresets',
                    'stakeout.nodes',
                    'stakeout.lines'
                ];
                
                testKeys.forEach(key => {
                    const translation = App.I18n.t(key);
                    const status = translation === key ? '❌' : '✅';
                    console.log(`   ${status} ${key} = "${translation}"`);
                });
                
            } else {
                console.error('   ❌ German translations object is missing!');
            }
        })
        .catch(error => {
            console.error('   ❌ Error loading German language:', error);
        });
    
    // Test 4: Test language switching
    console.log('\n5. Testing language switching to German...');
    App.I18n.setLanguage('de')
        .then(() => {
            console.log('   ✅ Language switched to German');
            console.log('   Current language after switch:', App.I18n.getLanguage());
            
            // Test translations after language switch
            setTimeout(() => {
                console.log('\n6. Testing translations after language switch:');
                const testTranslations = [
                    'ui.tabs.layers',
                    'ui.settings.mapSettings',
                    'ui.settings.buttonSize.label'
                ];
                
                testTranslations.forEach(key => {
                    const translation = App.I18n.t(key);
                    console.log(`   ${key} = "${translation}"`);
                });
                
                // Test if page translations are being updated
                console.log('\n7. Checking page translation updates:');
                const elementsWithI18n = document.querySelectorAll('[data-i18n]');
                console.log(`   Found ${elementsWithI18n.length} elements with data-i18n attributes`);
                
                let translatedElements = 0;
                let untranslatedElements = 0;
                
                elementsWithI18n.forEach(element => {
                    const key = element.getAttribute('data-i18n');
                    const translation = App.I18n.t(key);
                    const elementText = element.textContent.trim();
                    
                    if (translation !== key && elementText === translation) {
                        translatedElements++;
                    } else {
                        untranslatedElements++;
                        console.log(`   ❌ Element with key "${key}" not translated. Expected: "${translation}", Got: "${elementText}"`);
                    }
                });
                
                console.log(`   ✅ ${translatedElements} elements correctly translated`);
                console.log(`   ❌ ${untranslatedElements} elements not translated`);
                
                // Test specific elements that should be translated
                console.log('\n8. Testing specific UI elements:');
                const testSelectors = [
                    'h3[data-i18n="ui.tabs.layers"]',
                    'h3[data-i18n="ui.tabs.settings"]',
                    '.settings-label'
                ];
                
                testSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    console.log(`   ${selector}: ${elements.length} elements found`);
                    elements.forEach((element, index) => {
                        const key = element.getAttribute('data-i18n');
                        const text = element.textContent.trim();
                        console.log(`     Element ${index}: key="${key}", text="${text}"`);
                    });
                });
                
            }, 100);
        })
        .catch(error => {
            console.error('   ❌ Error switching language:', error);
        });
    
    // Test 5: Check for missing translations
    console.log('\n9. Looking for elements with missing translations...');
    setTimeout(() => {
        const elementsWithKeys = [];
        document.querySelectorAll('*').forEach(element => {
            const text = element.textContent.trim();
            if (text.includes('.') && (text.startsWith('ui.') || text.startsWith('presets.') || text.startsWith('stakeout.'))) {
                elementsWithKeys.push({
                    element: element.tagName.toLowerCase(),
                    text: text,
                    classes: element.className,
                    id: element.id
                });
            }
        });
        
        if (elementsWithKeys.length > 0) {
            console.log('   ❌ Found elements with untranslated keys:');
            elementsWithKeys.forEach(item => {
                console.log(`     <${item.element}> "${item.text}" (class: ${item.classes}, id: ${item.id})`);
            });
        } else {
            console.log('   ✅ No elements with untranslated keys found');
        }
    }, 1000);
}

// Run diagnostic after a delay to ensure everything is loaded
setTimeout(runI18nDiagnostic, 2000);

// Make available globally for manual testing
window.runI18nDiagnostic = runI18nDiagnostic;

console.log('[I18N-DIAG] Diagnostic script loaded - running in 2 seconds...');