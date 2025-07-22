/**
 * Language Integration Utilities
 * Provides multiple integration points for language setting
 * Works with Android Activity, UIBridge, and web environments
 */
class LanguageIntegration {
    constructor() {
        this.integrationMethods = new Map();
        this.initializationQueue = [];
        this.isInitialized = false;
        this.currentLanguage = null;
        
        // Register all integration methods
        this.registerIntegrationMethods();
    }
    
    /**
     * Register all available integration methods
     */
    registerIntegrationMethods() {
        // Method 1: Direct App.I18n integration
        this.integrationMethods.set('app_i18n', {
            name: 'App.I18n Integration',
            priority: 1,
            execute: this.integrateWithAppI18n.bind(this),
            validate: () => typeof App !== 'undefined' && App.I18n
        });
        
        // Method 2: UIBridge integration
        this.integrationMethods.set('ui_bridge', {
            name: 'UIBridge Integration',
            priority: 2,
            execute: this.integrateWithUIBridge.bind(this),
            validate: () => typeof UIBridge !== 'undefined'
        });
        
        // Method 3: Android Activity integration
        this.integrationMethods.set('android_activity', {
            name: 'Android Activity Integration',
            priority: 3,
            execute: this.integrateWithAndroidActivity.bind(this),
            validate: () => typeof Android !== 'undefined' || typeof androidApp !== 'undefined'
        });
        
        // Method 4: Document ready integration
        this.integrationMethods.set('document_ready', {
            name: 'Document Ready Integration',
            priority: 4,
            execute: this.integrateWithDocumentReady.bind(this),
            validate: () => document.readyState === 'complete' || document.readyState === 'interactive'
        });
        
        // Method 5: Window load integration
        this.integrationMethods.set('window_load', {
            name: 'Window Load Integration',
            priority: 5,
            execute: this.integrateWithWindowLoad.bind(this),
            validate: () => true // Always available as last resort
        });
        
        // Method 6: Polling integration
        this.integrationMethods.set('polling', {
            name: 'Polling Integration',
            priority: 6,
            execute: this.integrateWithPolling.bind(this),
            validate: () => true // Always available as fallback
        });
    }
    
    /**
     * Initialize language integration with all available methods
     */
    async initializeIntegration(language = null) {
        console.log('[LanguageIntegration] Initializing language integration...');
        
        // Set language if provided
        if (language) {
            this.currentLanguage = language;
        }
        
        // Try all integration methods in priority order
        const sortedMethods = Array.from(this.integrationMethods.values())
            .sort((a, b) => a.priority - b.priority);
        
        const results = [];
        
        for (const method of sortedMethods) {
            try {
                if (method.validate()) {
                    console.log('[LanguageIntegration] Executing integration method:', method.name);
                    const result = await method.execute(this.currentLanguage);
                    results.push({ method: method.name, success: result });
                } else {
                    console.log('[LanguageIntegration] Skipping method (validation failed):', method.name);
                    results.push({ method: method.name, success: false, reason: 'validation_failed' });
                }
            } catch (error) {
                console.warn('[LanguageIntegration] Integration method failed:', method.name, error);
                results.push({ method: method.name, success: false, error: error.message });
            }
        }
        
        this.isInitialized = true;
        console.log('[LanguageIntegration] Integration completed. Results:', results);
        
        return results;
    }
    
    /**
     * Method 1: App.I18n Integration
     */
    async integrateWithAppI18n(language) {
        if (!language) return false;
        
        try {
            // Wait for App.I18n to be ready
            await this.waitForCondition(() => typeof App !== 'undefined' && App.I18n, 5000);
            
            // Set language via App.I18n
            if (App.I18n.setLocale) {
                App.I18n.setLocale(language);
                console.log('[LanguageIntegration] Language set via App.I18n.setLocale:', language);
                return true;
            }
            
            if (App.I18n.locale !== undefined) {
                App.I18n.locale = language;
                console.log('[LanguageIntegration] Language set via App.I18n.locale:', language);
                return true;
            }
            
            // Setup monitoring for App.I18n changes
            this.setupAppI18nMonitoring();
            
            return true;
        } catch (error) {
            console.warn('[LanguageIntegration] App.I18n integration failed:', error);
            return false;
        }
    }
    
    /**
     * Method 2: UIBridge Integration
     */
    async integrateWithUIBridge(language) {
        if (!language) return false;
        
        try {
            // Wait for UIBridge to be ready
            await this.waitForCondition(() => typeof UIBridge !== 'undefined', 3000);
            
            // Try different UIBridge methods
            const methods = ['setLanguage', 'changeLanguage', 'updateLanguage'];
            
            for (const method of methods) {
                if (UIBridge[method]) {
                    UIBridge[method](language);
                    console.log('[LanguageIntegration] Language set via UIBridge.' + method + ':', language);
                    return true;
                }
            }
            
            // Create a custom UIBridge method if none exists
            if (!UIBridge.setLanguage) {
                UIBridge.setLanguage = (lang) => {
                    console.log('[LanguageIntegration] Custom UIBridge.setLanguage called:', lang);
                    if (window.LanguageManager) {
                        window.LanguageManager.setLanguageManually(lang);
                    }
                };
            }
            
            return true;
        } catch (error) {
            console.warn('[LanguageIntegration] UIBridge integration failed:', error);
            return false;
        }
    }
    
    /**
     * Method 3: Android Activity Integration
     */
    async integrateWithAndroidActivity(language) {
        try {
            // Create methods that can be called from Android Activity
            window.setLanguageFromActivity = (lang) => {
                console.log('[LanguageIntegration] setLanguageFromActivity called:', lang);
                if (window.LanguageManager) {
                    window.LanguageManager.setLanguageManually(lang);
                }
                return true;
            };
            
            window.updateLanguageFromActivity = (lang) => {
                console.log('[LanguageIntegration] updateLanguageFromActivity called:', lang);
                if (window.LanguageManager) {
                    return window.LanguageManager.setLanguage(lang);
                }
                return false;
            };
            
            window.getCurrentLanguageForActivity = () => {
                if (window.LanguageManager) {
                    return window.LanguageManager.getCurrentLanguage();
                }
                return 'en';
            };
            
            // Set initial language if provided
            if (language) {
                window.setLanguageFromActivity(language);
            }
            
            console.log('[LanguageIntegration] Android Activity integration methods created');
            return true;
        } catch (error) {
            console.warn('[LanguageIntegration] Android Activity integration failed:', error);
            return false;
        }
    }
    
    /**
     * Method 4: Document Ready Integration
     */
    async integrateWithDocumentReady(language) {
        return new Promise((resolve) => {
            const setupLanguage = () => {
                if (language && window.LanguageManager) {
                    window.LanguageManager.setLanguageManually(language);
                }
                
                // Setup language detection from DOM
                this.setupDOMLanguageDetection();
                
                console.log('[LanguageIntegration] Document ready integration completed');
                resolve(true);
            };
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', setupLanguage);
            } else {
                setupLanguage();
            }
        });
    }
    
    /**
     * Method 5: Window Load Integration
     */
    async integrateWithWindowLoad(language) {
        return new Promise((resolve) => {
            const setupLanguage = () => {
                if (language && window.LanguageManager) {
                    window.LanguageManager.setLanguageManually(language);
                }
                
                // Setup comprehensive language integration
                this.setupComprehensiveIntegration();
                
                console.log('[LanguageIntegration] Window load integration completed');
                resolve(true);
            };
            
            if (document.readyState === 'complete') {
                setupLanguage();
            } else {
                window.addEventListener('load', setupLanguage);
            }
        });
    }
    
    /**
     * Method 6: Polling Integration (Last Resort)
     */
    async integrateWithPolling(language) {
        let attempts = 0;
        const maxAttempts = 10;
        const interval = 1000;
        
        return new Promise((resolve) => {
            const pollForSystems = () => {
                attempts++;
                
                // Check if any system is ready
                const systemsReady = [
                    typeof App !== 'undefined' && App.I18n,
                    typeof UIBridge !== 'undefined',
                    window.LanguageManager
                ].some(Boolean);
                
                if (systemsReady || attempts >= maxAttempts) {
                    if (language && window.LanguageManager) {
                        window.LanguageManager.setLanguageManually(language);
                    }
                    
                    console.log('[LanguageIntegration] Polling integration completed after', attempts, 'attempts');
                    resolve(true);
                } else {
                    setTimeout(pollForSystems, interval);
                }
            };
            
            pollForSystems();
        });
    }
    
    /**
     * Setup App.I18n monitoring
     */
    setupAppI18nMonitoring() {
        if (typeof App !== 'undefined' && App.I18n) {
            // Override App.I18n methods to sync with LanguageManager
            const originalSetLocale = App.I18n.setLocale;
            if (originalSetLocale) {
                App.I18n.setLocale = (locale) => {
                    console.log('[LanguageIntegration] App.I18n.setLocale intercepted:', locale);
                    const result = originalSetLocale.call(App.I18n, locale);
                    
                    if (window.LanguageManager) {
                        window.LanguageManager.setLanguageManually(locale);
                    }
                    
                    return result;
                };
            }
            
            // Monitor locale property changes
            if (App.I18n.locale !== undefined) {
                let lastLocale = App.I18n.locale;
                setInterval(() => {
                    if (App.I18n.locale !== lastLocale) {
                        console.log('[LanguageIntegration] App.I18n.locale changed:', App.I18n.locale);
                        lastLocale = App.I18n.locale;
                        
                        if (window.LanguageManager) {
                            window.LanguageManager.setLanguageManually(lastLocale);
                        }
                    }
                }, 1000);
            }
        }
    }
    
    /**
     * Setup DOM language detection
     */
    setupDOMLanguageDetection() {
        // Check HTML lang attribute
        const htmlLang = document.documentElement.lang;
        if (htmlLang && window.LanguageManager) {
            window.LanguageManager.setLanguageManually(htmlLang);
        }
        
        // Monitor for lang attribute changes
        if (window.MutationObserver) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
                        const newLang = document.documentElement.lang;
                        if (newLang && window.LanguageManager) {
                            console.log('[LanguageIntegration] HTML lang attribute changed:', newLang);
                            window.LanguageManager.setLanguageManually(newLang);
                        }
                    }
                });
            });
            
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['lang']
            });
        }
    }
    
    /**
     * Setup comprehensive language integration
     */
    setupComprehensiveIntegration() {
        // Create global language functions
        window.setGlobalLanguage = (lang) => {
            console.log('[LanguageIntegration] setGlobalLanguage called:', lang);
            
            // Update all possible language sources
            if (typeof App !== 'undefined' && App.I18n) {
                if (App.I18n.setLocale) App.I18n.setLocale(lang);
                if (App.I18n.locale !== undefined) App.I18n.locale = lang;
            }
            
            if (typeof UIBridge !== 'undefined' && UIBridge.setLanguage) {
                UIBridge.setLanguage(lang);
            }
            
            if (window.LanguageManager) {
                window.LanguageManager.setLanguageManually(lang);
            }
            
            // Update DOM
            document.documentElement.lang = lang;
            
            // Store in localStorage
            localStorage.setItem('app_language', lang);
            
            return true;
        };
        
        // Create language getter
        window.getGlobalLanguage = () => {
            if (window.LanguageManager) {
                return window.LanguageManager.getCurrentLanguage();
            }
            
            return document.documentElement.lang || 'en';
        };
        
        // Create language validator
        window.validateLanguage = (lang) => {
            if (window.LanguageManager) {
                return window.LanguageManager.isLanguageAvailable(lang);
            }
            
            return ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'da', 'sv', 'no'].includes(lang);
        };
    }
    
    /**
     * Wait for condition with timeout
     */
    async waitForCondition(condition, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkCondition = () => {
                if (condition()) {
                    resolve(true);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Timeout waiting for condition'));
                } else {
                    setTimeout(checkCondition, 100);
                }
            };
            
            checkCondition();
        });
    }
    
    /**
     * Manual language setting for immediate use
     */
    setLanguageImmediately(language) {
        console.log('[LanguageIntegration] Setting language immediately:', language);
        
        // Try all methods synchronously
        const methods = [
            () => {
                if (typeof App !== 'undefined' && App.I18n) {
                    if (App.I18n.setLocale) App.I18n.setLocale(language);
                    if (App.I18n.locale !== undefined) App.I18n.locale = language;
                }
            },
            () => {
                if (typeof UIBridge !== 'undefined' && UIBridge.setLanguage) {
                    UIBridge.setLanguage(language);
                }
            },
            () => {
                if (window.LanguageManager) {
                    window.LanguageManager.setLanguageManually(language);
                }
            },
            () => {
                if (window.setGlobalLanguage) {
                    window.setGlobalLanguage(language);
                }
            }
        ];
        
        methods.forEach((method, index) => {
            try {
                method();
                console.log('[LanguageIntegration] Immediate method', index + 1, 'executed successfully');
            } catch (error) {
                console.warn('[LanguageIntegration] Immediate method', index + 1, 'failed:', error);
            }
        });
        
        this.currentLanguage = language;
        return true;
    }
    
    /**
     * Get integration status
     */
    getIntegrationStatus() {
        const status = {
            initialized: this.isInitialized,
            currentLanguage: this.currentLanguage,
            availableMethods: {},
            systemsReady: {}
        };
        
        // Check method availability
        this.integrationMethods.forEach((method, key) => {
            status.availableMethods[key] = method.validate();
        });
        
        // Check system readiness
        status.systemsReady = {
            app_i18n: typeof App !== 'undefined' && App.I18n,
            ui_bridge: typeof UIBridge !== 'undefined',
            language_manager: !!window.LanguageManager,
            android_activity: typeof Android !== 'undefined' || typeof androidApp !== 'undefined'
        };
        
        return status;
    }
    
    /**
     * Destroy integration
     */
    destroy() {
        this.integrationMethods.clear();
        this.initializationQueue = [];
        this.isInitialized = false;
        this.currentLanguage = null;
        
        // Clean up global methods
        delete window.setLanguageFromActivity;
        delete window.updateLanguageFromActivity;
        delete window.getCurrentLanguageForActivity;
        delete window.setGlobalLanguage;
        delete window.getGlobalLanguage;
        delete window.validateLanguage;
        
        console.log('[LanguageIntegration] Integration destroyed');
    }
}

// Create global instance
window.LanguageIntegration = new LanguageIntegration();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageIntegration;
} else {
    window.LanguageIntegration = LanguageIntegration;
}