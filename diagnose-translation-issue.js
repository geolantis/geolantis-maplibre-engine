/**
 * Diagnose Translation Issue
 * This script helps identify why German text isn't showing despite language being set to 'de'
 */

console.log('[DIAGNOSE] Starting translation diagnosis...');

function diagnoseTranslations() {
    console.log('[DIAGNOSE] === TRANSLATION SYSTEM DIAGNOSIS ===');
    
    // Check if App.I18n exists
    if (!window.App || !window.App.I18n) {
        console.error('[DIAGNOSE] ❌ App.I18n is NOT available!');
        return;
    }
    
    console.log('[DIAGNOSE] ✅ App.I18n is available');
    
    // Check current language
    const currentLang = window.App.I18n.getLanguage();
    console.log('[DIAGNOSE] Current language:', currentLang);
    
    // Check loaded languages
    if (window.App.I18n.loadedLanguages) {
        console.log('[DIAGNOSE] Loaded languages:', Array.from(window.App.I18n.loadedLanguages));
    }
    
    // Check if translations object exists
    if (window.App.I18n.translations) {
        console.log('[DIAGNOSE] Available translation languages:', Object.keys(window.App.I18n.translations));
        
        // Check German translations
        if (window.App.I18n.translations.de) {
            console.log('[DIAGNOSE] ✅ German translations object exists');
            
            // Check specific translations
            const testKeys = ['ui.tabs.layers', 'ui.settings.mapSettings', 'ui.tabs.bookmarks'];
            console.log('[DIAGNOSE] Testing German translations:');
            
            testKeys.forEach(key => {
                const keys = key.split('.');
                let value = window.App.I18n.translations.de;
                
                for (let i = 0; i < keys.length; i++) {
                    if (value && typeof value === 'object' && keys[i] in value) {
                        value = value[keys[i]];
                    } else {
                        value = null;
                        break;
                    }
                }
                
                console.log(`[DIAGNOSE]   ${key} = "${value}"`);
            });
            
            // Check if German translations are empty
            const deTranslations = JSON.stringify(window.App.I18n.translations.de);
            console.log('[DIAGNOSE] German translations size:', deTranslations.length, 'characters');
            
            if (deTranslations.length < 100) {
                console.error('[DIAGNOSE] ❌ German translations seem empty or corrupted!');
                console.log('[DIAGNOSE] Content:', deTranslations);
            }
            
        } else {
            console.error('[DIAGNOSE] ❌ German translations NOT loaded!');
        }
        
        // Check English translations for comparison
        if (window.App.I18n.translations.en) {
            console.log('[DIAGNOSE] ✅ English translations exist');
            const enSize = JSON.stringify(window.App.I18n.translations.en).length;
            console.log('[DIAGNOSE] English translations size:', enSize, 'characters');
        }
    } else {
        console.error('[DIAGNOSE] ❌ No translations object found!');
    }
    
    // Test the translation function
    console.log('[DIAGNOSE] Testing translation function:');
    console.log('[DIAGNOSE]   App.I18n.t("ui.tabs.layers") =', window.App.I18n.t('ui.tabs.layers'));
    console.log('[DIAGNOSE]   App.I18n.t("ui.settings.mapSettings") =', window.App.I18n.t('ui.settings.mapSettings'));
    console.log('[DIAGNOSE]   App.I18n.t("ui.tabs.bookmarks") =', window.App.I18n.t('ui.tabs.bookmarks'));
    
    // Try to manually load German translations
    console.log('[DIAGNOSE] Attempting to manually load German translations...');
    
    fetch('src/i18n/translations/de.json')
        .then(response => {
            console.log('[DIAGNOSE] German file fetch response:', response.status, response.statusText);
            return response.text();
        })
        .then(text => {
            console.log('[DIAGNOSE] German file content (first 200 chars):', text.substring(0, 200));
            
            try {
                const germanData = JSON.parse(text);
                console.log('[DIAGNOSE] ✅ German JSON parsed successfully');
                console.log('[DIAGNOSE] Sample German translations:');
                console.log('[DIAGNOSE]   ui.tabs.layers =', germanData.ui?.tabs?.layers);
                console.log('[DIAGNOSE]   ui.settings.mapSettings =', germanData.ui?.settings?.mapSettings);
                
                // Try to manually set the German translations
                if (window.App.I18n.translations) {
                    window.App.I18n.translations.de = germanData;
                    console.log('[DIAGNOSE] ✅ Manually injected German translations');
                    
                    // Force update
                    window.App.I18n.updatePageTranslations();
                    console.log('[DIAGNOSE] ✅ Forced translation update');
                }
                
            } catch (error) {
                console.error('[DIAGNOSE] ❌ Error parsing German JSON:', error);
                console.log('[DIAGNOSE] File content:', text);
            }
        })
        .catch(error => {
            console.error('[DIAGNOSE] ❌ Error loading German translations:', error);
        });
    
    console.log('[DIAGNOSE] === END DIAGNOSIS ===');
}

// Run diagnosis immediately
diagnoseTranslations();

// Also run after a delay
setTimeout(diagnoseTranslations, 2000);

// Make it available globally
window.diagnoseTranslations = diagnoseTranslations;