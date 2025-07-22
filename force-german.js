/**
 * Force German Language
 * This script ensures German language is set and applied
 */

console.log('[FORCE-DE] Force German script starting...');

// Function to force German language
function forceGermanLanguage() {
    console.log('[FORCE-DE] Attempting to force German language...');
    
    if (!window.App || !window.App.I18n) {
        console.warn('[FORCE-DE] App.I18n not ready, retrying in 500ms...');
        setTimeout(forceGermanLanguage, 500);
        return;
    }
    
    // Get current language
    const currentLang = window.App.I18n.getLanguage();
    console.log('[FORCE-DE] Current language:', currentLang);
    
    if (currentLang === 'de') {
        console.log('[FORCE-DE] Already in German, updating translations...');
        window.App.I18n.updatePageTranslations();
        return;
    }
    
    // Force German
    console.log('[FORCE-DE] Setting language to German...');
    window.App.I18n.setLanguage('de').then(() => {
        console.log('[FORCE-DE] German language set successfully');
        
        // Force update all translations
        setTimeout(() => {
            window.App.I18n.updatePageTranslations();
            
            // Also manually update to be sure
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = window.App.I18n.t(key);
                if (translation && translation !== key) {
                    element.textContent = translation;
                }
            });
            
            console.log('[FORCE-DE] Translations updated');
            
            // Log some test translations
            console.log('[FORCE-DE] Test translations:');
            console.log('  ui.tabs.layers =', window.App.I18n.t('ui.tabs.layers'));
            console.log('  ui.settings.mapSettings =', window.App.I18n.t('ui.settings.mapSettings'));
            console.log('  ui.settings.threeDBuilding =', window.App.I18n.t('ui.settings.threeDBuilding'));
            
        }, 100);
        
    }).catch(error => {
        console.error('[FORCE-DE] Error setting German:', error);
    });
}

// Override the setAppLanguage to always use German
window.setAppLanguage = function(languageCode) {
    console.log('[FORCE-DE] setAppLanguage called with:', languageCode, '- forcing to German');
    
    // Always force German regardless of what's requested
    return forceGermanLanguage();
};

// Auto-force German when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(forceGermanLanguage, 1000);
    });
} else {
    setTimeout(forceGermanLanguage, 1000);
}

// Also try immediately
setTimeout(forceGermanLanguage, 100);

console.log('[FORCE-DE] Force German script loaded');