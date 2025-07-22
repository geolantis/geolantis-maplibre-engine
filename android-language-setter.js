/**
 * Android-Driven Language Setting System
 * This script provides simple methods for Android to set the MapLibre language
 * without relying on automatic detection or complex bridge systems.
 */

// Create global namespace for Android language functions
window.AndroidLanguage = {
    initialized: false,
    currentLanguage: 'en',
    
    /**
     * Initialize the language system
     */
    init: function() {
        console.log('[AndroidLanguage] Initializing...');
        
        // Wait for App.I18n to be available
        if (window.App && window.App.I18n) {
            this.initialized = true;
            console.log('[AndroidLanguage] App.I18n is available');
            return true;
        } else {
            console.log('[AndroidLanguage] App.I18n not available yet, will retry...');
            return false;
        }
    },
    
    /**
     * Set language directly from Android
     * @param {string} languageCode - Language code (e.g., 'de', 'en', 'es')
     * @returns {boolean} Success status
     */
    setLanguage: function(languageCode) {
        console.log('[AndroidLanguage] Setting language to:', languageCode);
        
        if (!this.initialized) {
            if (!this.init()) {
                console.warn('[AndroidLanguage] System not initialized, storing language for later');
                // Store for later when system is ready
                this.pendingLanguage = languageCode;
                return false;
            }
        }
        
        try {
            // Set the language using App.I18n
            window.App.I18n.setLanguage(languageCode).then(() => {
                console.log('[AndroidLanguage] Language successfully set to:', languageCode);
                this.currentLanguage = languageCode;
                
                // Trigger a manual update of all page translations
                if (window.App.I18n.updatePageTranslations) {
                    window.App.I18n.updatePageTranslations();
                }
                
                // Dispatch event for other components
                document.dispatchEvent(new CustomEvent('androidLanguageChanged', {
                    detail: { language: languageCode }
                }));
                
            }).catch(error => {
                console.error('[AndroidLanguage] Error setting language:', error);
            });
            
            return true;
        } catch (error) {
            console.error('[AndroidLanguage] Exception setting language:', error);
            return false;
        }
    },
    
    /**
     * Get current language
     * @returns {string} Current language code
     */
    getCurrentLanguage: function() {
        if (this.initialized && window.App && window.App.I18n) {
            return window.App.I18n.getLanguage();
        }
        return this.currentLanguage;
    },
    
    /**
     * Test if a language is available
     * @param {string} languageCode - Language code to test
     * @returns {boolean} True if language is supported
     */
    isLanguageAvailable: function(languageCode) {
        if (this.initialized && window.App && window.App.I18n) {
            const available = window.App.I18n.getAvailableLanguages();
            return available.some(lang => lang.code === languageCode);
        }
        // Default supported languages
        return ['en', 'de', 'es', 'fr', 'it'].includes(languageCode);
    },
    
    /**
     * Get system status for debugging
     * @returns {Object} Status information
     */
    getStatus: function() {
        return {
            initialized: this.initialized,
            currentLanguage: this.getCurrentLanguage(),
            appI18nAvailable: !!(window.App && window.App.I18n),
            pendingLanguage: this.pendingLanguage || null,
            timestamp: new Date().toISOString()
        };
    },
    
    /**
     * Force reinitialize the system
     */
    reinitialize: function() {
        console.log('[AndroidLanguage] Reinitializing...');
        this.initialized = false;
        
        if (this.init() && this.pendingLanguage) {
            console.log('[AndroidLanguage] Applying pending language:', this.pendingLanguage);
            this.setLanguage(this.pendingLanguage);
            this.pendingLanguage = null;
        }
    }
};

// Global convenience functions for Android to call
window.setAppLanguage = function(languageCode) {
    console.log('[Global] setAppLanguage called with:', languageCode);
    return window.AndroidLanguage.setLanguage(languageCode);
};

window.getAppLanguage = function() {
    return window.AndroidLanguage.getCurrentLanguage();
};

window.getLanguageStatus = function() {
    return window.AndroidLanguage.getStatus();
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('[AndroidLanguage] DOM ready, attempting initialization...');
    
    // Try immediate initialization
    if (!window.AndroidLanguage.init()) {
        // If not ready, try periodically
        let attempts = 0;
        const maxAttempts = 20; // 10 seconds max
        
        const initInterval = setInterval(function() {
            attempts++;
            console.log('[AndroidLanguage] Initialization attempt', attempts);
            
            if (window.AndroidLanguage.init()) {
                console.log('[AndroidLanguage] Successfully initialized after', attempts, 'attempts');
                clearInterval(initInterval);
            } else if (attempts >= maxAttempts) {
                console.warn('[AndroidLanguage] Failed to initialize after', maxAttempts, 'attempts');
                clearInterval(initInterval);
            }
        }, 500);
    }
});

// Listen for i18n system being ready
document.addEventListener('languageChanged', function(event) {
    console.log('[AndroidLanguage] Language changed event received:', event.detail);
});

console.log('[AndroidLanguage] Script loaded');