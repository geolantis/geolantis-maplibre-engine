/**
 * Language Manager for StakeOut AI
 * Provides multiple robust methods to set and manage language preferences
 * with failsafe mechanisms and retry logic
 */
class LanguageManager {
    constructor() {
        this.currentLanguage = 'en'; // Default language
        this.availableLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'da', 'sv', 'no'];
        this.retryCount = 0;
        this.maxRetries = 5;
        this.retryDelay = 1000; // Start with 1 second delay
        this.initialized = false;
        this.callbacks = [];
        
        // Language setting methods in order of preference
        this.languageSetters = [
            this.setLanguageViaI18n.bind(this),
            this.setLanguageViaUIBridge.bind(this),
            this.setLanguageViaLocalStorage.bind(this),
            this.setLanguageViaGlobalVar.bind(this),
            this.setLanguageViaCustomEvent.bind(this)
        ];
        
        // Auto-detect language on initialization
        this.autoDetectLanguage();
    }
    
    /**
     * Initialize language manager with multiple fallback strategies
     */
    async initialize() {
        console.log('[LanguageManager] Initializing language manager...');
        
        // Try to get language from various sources
        const detectedLanguage = await this.detectLanguage();
        
        if (detectedLanguage) {
            await this.setLanguage(detectedLanguage);
        }
        
        // Set up periodic language checks
        this.setupLanguageMonitoring();
        
        this.initialized = true;
        console.log('[LanguageManager] Language manager initialized. Current language:', this.currentLanguage);
        
        return this.currentLanguage;
    }
    
    /**
     * Auto-detect language from multiple sources
     */
    autoDetectLanguage() {
        // Try App.I18n first (most reliable)
        if (typeof App !== 'undefined' && App.I18n && App.I18n.locale) {
            this.currentLanguage = App.I18n.locale;
            console.log('[LanguageManager] Language detected via App.I18n:', this.currentLanguage);
            return;
        }
        
        // Try localStorage
        const storedLanguage = localStorage.getItem('app_language') || localStorage.getItem('language');
        if (storedLanguage && this.availableLanguages.includes(storedLanguage)) {
            this.currentLanguage = storedLanguage;
            console.log('[LanguageManager] Language detected via localStorage:', this.currentLanguage);
            return;
        }
        
        // Try browser language
        const browserLanguage = navigator.language || navigator.userLanguage;
        if (browserLanguage) {
            const lang = browserLanguage.split('-')[0];
            if (this.availableLanguages.includes(lang)) {
                this.currentLanguage = lang;
                console.log('[LanguageManager] Language detected via browser:', this.currentLanguage);
                return;
            }
        }
        
        // Default to English
        this.currentLanguage = 'en';
        console.log('[LanguageManager] Using default language:', this.currentLanguage);
    }
    
    /**
     * Detect language from all available sources
     */
    async detectLanguage() {
        const sources = [
            () => this.getLanguageFromI18n(),
            () => this.getLanguageFromUIBridge(),
            () => this.getLanguageFromLocalStorage(),
            () => this.getLanguageFromGlobal(),
            () => this.getLanguageFromBrowser()
        ];
        
        for (const source of sources) {
            try {
                const language = await source();
                if (language && this.availableLanguages.includes(language)) {
                    console.log('[LanguageManager] Language detected:', language);
                    return language;
                }
            } catch (error) {
                console.warn('[LanguageManager] Language detection failed for source:', error);
            }
        }
        
        return this.currentLanguage; // Return current as fallback
    }
    
    /**
     * Get language from App.I18n
     */
    getLanguageFromI18n() {
        if (typeof App !== 'undefined' && App.I18n) {
            return App.I18n.locale || App.I18n.language;
        }
        return null;
    }
    
    /**
     * Get language from UIBridge
     */
    getLanguageFromUIBridge() {
        if (typeof UIBridge !== 'undefined' && UIBridge.getLanguage) {
            return UIBridge.getLanguage();
        }
        return null;
    }
    
    /**
     * Get language from localStorage
     */
    getLanguageFromLocalStorage() {
        return localStorage.getItem('app_language') || 
               localStorage.getItem('language') || 
               localStorage.getItem('user_language');
    }
    
    /**
     * Get language from global variables
     */
    getLanguageFromGlobal() {
        return window.APP_LANGUAGE || 
               window.LANGUAGE || 
               window.userLanguage;
    }
    
    /**
     * Get language from browser
     */
    getLanguageFromBrowser() {
        const browserLang = navigator.language || navigator.userLanguage;
        return browserLang ? browserLang.split('-')[0] : null;
    }
    
    /**
     * Set language using all available methods with retry logic
     */
    async setLanguage(language) {
        if (!this.availableLanguages.includes(language)) {
            console.warn('[LanguageManager] Unsupported language:', language);
            return false;
        }
        
        console.log('[LanguageManager] Setting language to:', language);
        
        let success = false;
        
        // Try all methods
        for (const setter of this.languageSetters) {
            try {
                const result = await setter(language);
                if (result) {
                    success = true;
                    console.log('[LanguageManager] Language set successfully using method:', setter.name);
                }
            } catch (error) {
                console.warn('[LanguageManager] Language setter failed:', setter.name, error);
            }
        }
        
        if (success) {
            this.currentLanguage = language;
            this.retryCount = 0; // Reset retry count on success
            
            // Notify callbacks
            this.callbacks.forEach(callback => {
                try {
                    callback(language);
                } catch (error) {
                    console.warn('[LanguageManager] Callback error:', error);
                }
            });
            
            // Store in localStorage as backup
            localStorage.setItem('stakeout_language', language);
            
            return true;
        }
        
        // Retry logic
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            const delay = this.retryDelay * Math.pow(2, this.retryCount - 1); // Exponential backoff
            
            console.log(`[LanguageManager] Retrying language setting in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})`);
            
            setTimeout(() => {
                this.setLanguage(language);
            }, delay);
        } else {
            console.error('[LanguageManager] Failed to set language after', this.maxRetries, 'attempts');
        }
        
        return false;
    }
    
    /**
     * Method 1: Set language via App.I18n
     */
    async setLanguageViaI18n(language) {
        if (typeof App !== 'undefined' && App.I18n) {
            if (App.I18n.setLocale) {
                App.I18n.setLocale(language);
                return true;
            }
            
            if (App.I18n.locale !== undefined) {
                App.I18n.locale = language;
                return true;
            }
            
            // Try alternative properties
            if (App.I18n.language !== undefined) {
                App.I18n.language = language;
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Method 2: Set language via UIBridge
     */
    async setLanguageViaUIBridge(language) {
        if (typeof UIBridge !== 'undefined') {
            if (UIBridge.setLanguage) {
                UIBridge.setLanguage(language);
                return true;
            }
            
            if (UIBridge.changeLanguage) {
                UIBridge.changeLanguage(language);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Method 3: Set language via localStorage
     */
    async setLanguageViaLocalStorage(language) {
        try {
            localStorage.setItem('app_language', language);
            localStorage.setItem('language', language);
            localStorage.setItem('user_language', language);
            
            // Dispatch storage event to notify other components
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'app_language',
                newValue: language,
                oldValue: this.currentLanguage
            }));
            
            return true;
        } catch (error) {
            console.warn('[LanguageManager] localStorage language setting failed:', error);
            return false;
        }
    }
    
    /**
     * Method 4: Set language via global variables
     */
    async setLanguageViaGlobalVar(language) {
        try {
            window.APP_LANGUAGE = language;
            window.LANGUAGE = language;
            window.userLanguage = language;
            
            // Try to update common global objects
            if (typeof window.config !== 'undefined') {
                window.config.language = language;
            }
            
            return true;
        } catch (error) {
            console.warn('[LanguageManager] Global variable language setting failed:', error);
            return false;
        }
    }
    
    /**
     * Method 5: Set language via custom event
     */
    async setLanguageViaCustomEvent(language) {
        try {
            // Dispatch custom language change event
            const event = new CustomEvent('languageChange', {
                detail: {
                    language: language,
                    oldLanguage: this.currentLanguage
                }
            });
            
            window.dispatchEvent(event);
            document.dispatchEvent(event);
            
            return true;
        } catch (error) {
            console.warn('[LanguageManager] Custom event language setting failed:', error);
            return false;
        }
    }
    
    /**
     * Manual language setting method for Activity integration
     */
    setLanguageManually(language) {
        console.log('[LanguageManager] Manual language setting requested:', language);
        
        if (!this.availableLanguages.includes(language)) {
            console.warn('[LanguageManager] Invalid language for manual setting:', language);
            return false;
        }
        
        // Force all methods synchronously
        this.languageSetters.forEach(setter => {
            try {
                setter(language);
            } catch (error) {
                console.warn('[LanguageManager] Manual setter failed:', setter.name, error);
            }
        });
        
        this.currentLanguage = language;
        console.log('[LanguageManager] Manual language setting completed:', language);
        
        return true;
    }
    
    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    /**
     * Get available languages
     */
    getAvailableLanguages() {
        return [...this.availableLanguages];
    }
    
    /**
     * Check if language is available
     */
    isLanguageAvailable(language) {
        return this.availableLanguages.includes(language);
    }
    
    /**
     * Add language change callback
     */
    onLanguageChange(callback) {
        if (typeof callback === 'function') {
            this.callbacks.push(callback);
        }
    }
    
    /**
     * Remove language change callback
     */
    removeLanguageChangeCallback(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }
    
    /**
     * Setup language monitoring to detect external changes
     */
    setupLanguageMonitoring() {
        // Monitor localStorage changes
        window.addEventListener('storage', (event) => {
            if (event.key === 'app_language' && event.newValue !== this.currentLanguage) {
                console.log('[LanguageManager] Language change detected via storage:', event.newValue);
                this.currentLanguage = event.newValue;
                this.callbacks.forEach(callback => callback(event.newValue));
            }
        });
        
        // Monitor custom language events
        window.addEventListener('languageChange', (event) => {
            if (event.detail && event.detail.language !== this.currentLanguage) {
                console.log('[LanguageManager] Language change detected via custom event:', event.detail.language);
                this.currentLanguage = event.detail.language;
                this.callbacks.forEach(callback => callback(event.detail.language));
            }
        });
        
        // Periodic check for App.I18n changes
        setInterval(() => {
            if (typeof App !== 'undefined' && App.I18n && App.I18n.locale) {
                if (App.I18n.locale !== this.currentLanguage) {
                    console.log('[LanguageManager] Language change detected via App.I18n:', App.I18n.locale);
                    this.currentLanguage = App.I18n.locale;
                    this.callbacks.forEach(callback => callback(App.I18n.locale));
                }
            }
        }, 2000);
    }
    
    /**
     * Force language refresh - useful for troubleshooting
     */
    async forceLanguageRefresh() {
        console.log('[LanguageManager] Forcing language refresh...');
        
        const detectedLanguage = await this.detectLanguage();
        if (detectedLanguage && detectedLanguage !== this.currentLanguage) {
            console.log('[LanguageManager] Language changed during refresh:', detectedLanguage);
            await this.setLanguage(detectedLanguage);
        }
        
        // Re-apply current language to all systems
        await this.setLanguage(this.currentLanguage);
        
        console.log('[LanguageManager] Language refresh completed');
    }
    
    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            currentLanguage: this.currentLanguage,
            availableLanguages: this.availableLanguages,
            retryCount: this.retryCount,
            initialized: this.initialized,
            callbackCount: this.callbacks.length,
            sources: {
                i18n: this.getLanguageFromI18n(),
                uiBridge: this.getLanguageFromUIBridge(),
                localStorage: this.getLanguageFromLocalStorage(),
                global: this.getLanguageFromGlobal(),
                browser: this.getLanguageFromBrowser()
            }
        };
    }
    
    /**
     * Destroy language manager
     */
    destroy() {
        this.callbacks = [];
        this.initialized = false;
        clearInterval(this.monitoringInterval);
        console.log('[LanguageManager] Language manager destroyed');
    }
}

// Create global instance
window.LanguageManager = new LanguageManager();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageManager;
} else {
    window.LanguageManager = LanguageManager;
}