/**
 * Fix Translation Display Issue
 * This script fixes the issue where translation keys are displayed instead of translated text
 */

// Override the Android language setting to ensure proper translation loading
window.setAppLanguage = function(languageCode) {
    console.log('[FIX] setAppLanguage called with:', languageCode);
    
    // Ensure i18n is available
    if (!window.App || !window.App.I18n) {
        console.warn('[FIX] App.I18n not available, retrying in 500ms');
        setTimeout(() => window.setAppLanguage(languageCode), 500);
        return false;
    }
    
    // Set the language
    return window.App.I18n.setLanguage(languageCode).then(() => {
        console.log('[FIX] Language set successfully to:', languageCode);
        
        // Force update all translations after a short delay
        setTimeout(() => {
            console.log('[FIX] Updating page translations...');
            
            // Manual translation update for elements that might be missed
            updateAllTranslations();
            
            // Also call the built-in update
            if (window.App.I18n.updatePageTranslations) {
                window.App.I18n.updatePageTranslations();
            }
            
        }, 100);
        
        return true;
    }).catch(error => {
        console.error('[FIX] Error setting language:', error);
        return false;
    });
};

// Manual translation function to ensure all elements are updated
function updateAllTranslations() {
    console.log('[FIX] Starting manual translation update');
    
    if (!window.App || !window.App.I18n) {
        console.warn('[FIX] App.I18n not available for manual update');
        return;
    }
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = window.App.I18n.t(key);
        
        if (translation && translation !== key) {
            element.textContent = translation;
            console.log('[FIX] Updated', key, '→', translation);
        } else {
            console.warn('[FIX] No translation for key:', key);
        }
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = window.App.I18n.t(key);
        
        if (translation && translation !== key) {
            element.placeholder = translation;
        }
    });
    
    // Update titles
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        const translation = window.App.I18n.t(key);
        
        if (translation && translation !== key) {
            element.title = translation;
        }
    });
    
    console.log('[FIX] Manual translation update completed');
}

// Add missing translations for elements visible in screenshot
if (window.App && window.App.I18n && typeof window.App.I18n.translations === 'object') {
    // Add "3D Building" translation if missing
    const currentLang = window.App.I18n.getLanguage() || 'en';
    
    if (window.App.I18n.translations[currentLang]) {
        if (!window.App.I18n.translations[currentLang].ui) {
            window.App.I18n.translations[currentLang].ui = {};
        }
        if (!window.App.I18n.translations[currentLang].ui.settings) {
            window.App.I18n.translations[currentLang].ui.settings = {};
        }
        
        // Add missing translations
        if (currentLang === 'de') {
            window.App.I18n.translations[currentLang].ui.settings.threeDBuilding = '3D Gebäude';
            window.App.I18n.translations[currentLang].ui.settings.resetBasemap = 'Basiskarte zurücksetzen';
        } else {
            window.App.I18n.translations[currentLang].ui.settings.threeDBuilding = '3D Building';
            window.App.I18n.translations[currentLang].ui.settings.resetBasemap = 'Reset to Default Basemap';
        }
    }
}

// Auto-fix when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('[FIX] DOM ready, checking for translation issues...');
    
    // Check if translation keys are being displayed
    setTimeout(() => {
        const elementsWithKeys = document.querySelectorAll('[data-i18n]');
        let foundIssues = false;
        
        elementsWithKeys.forEach(element => {
            if (element.textContent && element.textContent.includes('ui.')) {
                console.warn('[FIX] Found untranslated key:', element.textContent);
                foundIssues = true;
            }
        });
        
        if (foundIssues) {
            console.log('[FIX] Found translation issues, applying manual fix...');
            updateAllTranslations();
        } else {
            console.log('[FIX] No translation issues detected');
        }
    }, 1000);
});

console.log('[FIX] Translation fix script loaded');