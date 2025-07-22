/**
 * Language Bridge
 * Provides a reliable bridge between Android Activity and JavaScript for language setting
 * Works with existing UIBridge and provides multiple fallback mechanisms
 */
class LanguageBridge {
    constructor() {
        this.currentLanguage = 'en';
        this.isReady = false;
        this.pendingLanguage = null;
        this.callbacks = [];
        this.retryAttempts = 0;
        this.maxRetries = 3;
        
        // Initialize bridge
        this.initializeBridge();
    }
    
    /**
     * Initialize language bridge
     */
    initializeBridge() {
        console.log('[LanguageBridge] Initializing language bridge...');
        
        // Set up all bridge methods
        this.setupUIBridgeIntegration();
        this.setupAndroidIntegration();
        this.setupWebIntegration();
        this.setupEventListeners();
        
        // Mark as ready
        this.isReady = true;
        
        // Process any pending language setting
        if (this.pendingLanguage) {
            this.setLanguage(this.pendingLanguage);
            this.pendingLanguage = null;
        }
        
        console.log('[LanguageBridge] Language bridge initialized');
    }
    
    /**
     * Setup UIBridge integration
     */
    setupUIBridgeIntegration() {
        // Extend or create UIBridge
        if (typeof UIBridge === 'undefined') {
            window.UIBridge = {};
        }
        
        // Store original methods if they exist
        const originalSetLanguage = UIBridge.setLanguage;
        const originalGetLanguage = UIBridge.getLanguage;
        
        // Enhanced setLanguage method
        UIBridge.setLanguage = (language) => {
            console.log('[LanguageBridge] UIBridge.setLanguage called:', language);
            
            // Call original method if it exists
            if (originalSetLanguage) {
                try {
                    originalSetLanguage.call(UIBridge, language);
                } catch (error) {
                    console.warn('[LanguageBridge] Original UIBridge.setLanguage failed:', error);
                }
            }
            
            // Update via bridge
            this.setLanguage(language);
            
            return true;
        };
        
        // Enhanced getLanguage method
        UIBridge.getLanguage = () => {
            // Call original method if it exists
            if (originalGetLanguage) {
                try {
                    const result = originalGetLanguage.call(UIBridge);
                    if (result) {
                        return result;
                    }
                } catch (error) {
                    console.warn('[LanguageBridge] Original UIBridge.getLanguage failed:', error);
                }
            }
            
            // Return current language
            return this.getCurrentLanguage();
        };
        
        // Add additional UIBridge methods
        UIBridge.updateLanguage = (language) => {
            console.log('[LanguageBridge] UIBridge.updateLanguage called:', language);
            return this.setLanguage(language);
        };
        
        UIBridge.changeLanguage = (language) => {
            console.log('[LanguageBridge] UIBridge.changeLanguage called:', language);
            return this.setLanguage(language);
        };
        
        UIBridge.getAvailableLanguages = () => {
            return ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'da', 'sv', 'no'];
        };
        
        UIBridge.isLanguageSupported = (language) => {
            return UIBridge.getAvailableLanguages().includes(language);
        };
    }
    
    /**
     * Setup Android integration methods
     */
    setupAndroidIntegration() {
        // Methods that can be called from Android Activity
        window.setLanguageFromAndroid = (language) => {
            console.log('[LanguageBridge] setLanguageFromAndroid called:', language);
            this.setLanguage(language);
            return true;
        };
        
        window.updateLanguageFromAndroid = (language) => {
            console.log('[LanguageBridge] updateLanguageFromAndroid called:', language);
            return this.setLanguage(language);
        };
        
        window.getLanguageForAndroid = () => {
            const language = this.getCurrentLanguage();
            console.log('[LanguageBridge] getLanguageForAndroid returning:', language);
            return language;
        };
        
        window.validateLanguageForAndroid = (language) => {
            const isValid = UIBridge.isLanguageSupported(language);
            console.log('[LanguageBridge] validateLanguageForAndroid:', language, 'is', isValid ? 'valid' : 'invalid');
            return isValid;
        };
        
        // Notification method for Android
        window.notifyLanguageChanged = (language) => {
            console.log('[LanguageBridge] notifyLanguageChanged called:', language);
            this.currentLanguage = language;
            this.notifyCallbacks(language);
        };
    }
    
    /**
     * Setup web integration methods
     */
    setupWebIntegration() {
        // Global methods for web usage
        window.setGlobalAppLanguage = (language) => {
            console.log('[LanguageBridge] setGlobalAppLanguage called:', language);
            return this.setLanguage(language);
        };
        
        window.getGlobalAppLanguage = () => {
            return this.getCurrentLanguage();
        };
        
        // jQuery integration if available
        if (typeof $ !== 'undefined') {
            $.setLanguage = (language) => {
                return this.setLanguage(language);
            };
            
            $.getLanguage = () => {
                return this.getCurrentLanguage();
            };
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for language change events
        window.addEventListener('languageChange', (event) => {
            if (event.detail && event.detail.language) {
                console.log('[LanguageBridge] Language change event received:', event.detail.language);
                this.currentLanguage = event.detail.language;
                this.notifyCallbacks(event.detail.language);
            }
        });
        
        // Listen for storage changes
        window.addEventListener('storage', (event) => {
            if (event.key === 'app_language' && event.newValue) {
                console.log('[LanguageBridge] Language change detected in storage:', event.newValue);
                this.currentLanguage = event.newValue;
                this.notifyCallbacks(event.newValue);
            }
        });
        
        // Listen for DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.detectAndSetInitialLanguage();
            });
        } else {
            this.detectAndSetInitialLanguage();
        }
    }
    
    /**
     * Detect and set initial language
     */
    detectAndSetInitialLanguage() {
        const sources = [
            () => localStorage.getItem('app_language'),
            () => document.documentElement.lang,
            () => navigator.language ? navigator.language.split('-')[0] : null,
            () => 'en' // Default
        ];
        
        for (const source of sources) {
            try {
                const language = source();
                if (language && UIBridge.isLanguageSupported(language)) {
                    console.log('[LanguageBridge] Initial language detected:', language);
                    this.setLanguage(language);
                    break;
                }
            } catch (error) {
                console.warn('[LanguageBridge] Language detection source failed:', error);
            }
        }
    }
    
    /**
     * Set language with comprehensive integration
     */
    setLanguage(language) {
        if (!this.isReady) {
            console.log('[LanguageBridge] Bridge not ready, queuing language:', language);
            this.pendingLanguage = language;
            return false;
        }
        
        if (!UIBridge.isLanguageSupported(language)) {
            console.warn('[LanguageBridge] Unsupported language:', language);
            return false;
        }
        
        console.log('[LanguageBridge] Setting language:', language);
        
        const oldLanguage = this.currentLanguage;
        this.currentLanguage = language;
        
        // Update all systems
        this.updateAllSystems(language);
        
        // Notify callbacks
        this.notifyCallbacks(language, oldLanguage);
        
        // Dispatch events
        this.dispatchLanguageEvents(language, oldLanguage);
        
        console.log('[LanguageBridge] Language set successfully:', language);
        return true;
    }
    
    /**
     * Update all language systems
     */
    updateAllSystems(language) {
        const updates = [
            () => this.updateAppI18n(language),
            () => this.updateLocalStorage(language),
            () => this.updateDOM(language),
            () => this.updateGlobalVars(language),
            () => this.updateLanguageManager(language)
        ];
        
        updates.forEach((update, index) => {
            try {
                update();
                console.log('[LanguageBridge] System update', index + 1, 'completed');
            } catch (error) {
                console.warn('[LanguageBridge] System update', index + 1, 'failed:', error);
            }
        });
    }
    
    /**
     * Update App.I18n
     */
    updateAppI18n(language) {
        if (typeof App !== 'undefined' && App.I18n) {
            if (App.I18n.setLocale) {
                App.I18n.setLocale(language);
            }
            if (App.I18n.locale !== undefined) {
                App.I18n.locale = language;
            }
            console.log('[LanguageBridge] App.I18n updated to:', language);
        }
    }
    
    /**
     * Update localStorage
     */
    updateLocalStorage(language) {
        localStorage.setItem('app_language', language);
        localStorage.setItem('language', language);
        localStorage.setItem('user_language', language);
        console.log('[LanguageBridge] localStorage updated to:', language);
    }
    
    /**
     * Update DOM
     */
    updateDOM(language) {
        document.documentElement.lang = language;
        
        // Update any language-specific elements
        const langElements = document.querySelectorAll('[data-lang]');
        langElements.forEach(element => {
            if (element.dataset.lang === language) {
                element.style.display = '';
            } else {
                element.style.display = 'none';
            }
        });
        
        console.log('[LanguageBridge] DOM updated to:', language);
    }
    
    /**
     * Update global variables
     */
    updateGlobalVars(language) {
        window.APP_LANGUAGE = language;
        window.LANGUAGE = language;
        window.userLanguage = language;
        
        if (typeof window.config !== 'undefined') {
            window.config.language = language;
        }
        
        console.log('[LanguageBridge] Global variables updated to:', language);
    }
    
    /**
     * Update LanguageManager
     */
    updateLanguageManager(language) {
        if (window.LanguageManager) {
            window.LanguageManager.setLanguageManually(language);
            console.log('[LanguageBridge] LanguageManager updated to:', language);
        }
    }
    
    /**
     * Notify callbacks
     */
    notifyCallbacks(language, oldLanguage = null) {
        this.callbacks.forEach((callback, index) => {
            try {
                callback(language, oldLanguage);
            } catch (error) {
                console.warn('[LanguageBridge] Callback', index, 'failed:', error);
            }
        });
    }
    
    /**
     * Dispatch language events
     */
    dispatchLanguageEvents(language, oldLanguage = null) {
        const eventData = {
            language: language,
            oldLanguage: oldLanguage,
            timestamp: Date.now()
        };
        
        // Custom event
        const customEvent = new CustomEvent('languageChange', {
            detail: eventData
        });
        
        // Storage event
        const storageEvent = new StorageEvent('storage', {
            key: 'app_language',
            newValue: language,
            oldValue: oldLanguage
        });
        
        // Dispatch events
        window.dispatchEvent(customEvent);
        document.dispatchEvent(customEvent);
        window.dispatchEvent(storageEvent);
        
        console.log('[LanguageBridge] Language events dispatched');
    }
    
    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
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
     * Force language refresh
     */
    forceRefresh() {
        console.log('[LanguageBridge] Forcing language refresh...');
        this.setLanguage(this.currentLanguage);
    }
    
    /**
     * Retry language setting
     */
    retryLanguageSetting(language) {
        if (this.retryAttempts < this.maxRetries) {
            this.retryAttempts++;
            console.log('[LanguageBridge] Retrying language setting, attempt', this.retryAttempts);
            
            setTimeout(() => {
                this.setLanguage(language);
            }, 1000 * this.retryAttempts);
        } else {
            console.error('[LanguageBridge] Max retry attempts reached for language setting');
        }
    }
    
    /**
     * Get bridge status
     */
    getStatus() {
        return {
            isReady: this.isReady,
            currentLanguage: this.currentLanguage,
            pendingLanguage: this.pendingLanguage,
            callbackCount: this.callbacks.length,
            retryAttempts: this.retryAttempts,
            supportedLanguages: UIBridge.getAvailableLanguages(),
            systemStatus: {
                app_i18n: typeof App !== 'undefined' && App.I18n,
                ui_bridge: typeof UIBridge !== 'undefined',
                language_manager: !!window.LanguageManager,
                local_storage: typeof localStorage !== 'undefined',
                dom_ready: document.readyState !== 'loading'
            }
        };
    }
    
    /**
     * Test language bridge
     */
    testBridge() {
        console.log('[LanguageBridge] Testing language bridge...');
        
        const testLanguage = 'es';
        const originalLanguage = this.currentLanguage;
        
        // Test setting language
        const result = this.setLanguage(testLanguage);
        
        // Test getting language
        const currentLang = this.getCurrentLanguage();
        
        // Restore original language
        this.setLanguage(originalLanguage);
        
        const testResult = {
            setLanguageResult: result,
            currentLanguageResult: currentLang === testLanguage,
            bridgeStatus: this.getStatus()
        };
        
        console.log('[LanguageBridge] Bridge test completed:', testResult);
        return testResult;
    }
    
    /**
     * Destroy bridge
     */
    destroy() {
        this.callbacks = [];
        this.isReady = false;
        this.pendingLanguage = null;
        
        // Clean up global methods
        delete window.setLanguageFromAndroid;
        delete window.updateLanguageFromAndroid;
        delete window.getLanguageForAndroid;
        delete window.validateLanguageForAndroid;
        delete window.notifyLanguageChanged;
        delete window.setGlobalAppLanguage;
        delete window.getGlobalAppLanguage;
        
        console.log('[LanguageBridge] Language bridge destroyed');
    }
}

// Create global instance
window.LanguageBridge = new LanguageBridge();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageBridge;
} else {
    window.LanguageBridge = LanguageBridge;
}