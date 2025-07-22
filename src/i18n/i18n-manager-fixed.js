/**
 * I18n Manager for MapLibre Engine - Fixed Version
 * Handles multi-language support and translations
 */
(function() {
    'use strict';

    window.App = window.App || {};
    
    App.I18n = {
        currentLanguage: 'en',
        fallbackLanguage: 'en',
        translations: {},
        loadedLanguages: new Set(),
        initialized: false,
        
        /**
         * Initialize the i18n manager
         * @param {string} language - Initial language code
         * @returns {Promise}
         */
        init: function(language) {
            console.log('[I18n-Fixed] Initializing i18n manager...');
            console.log('[I18n-Fixed] Provided language:', language);
            
            // Detect language if not provided
            const detectedLanguage = language || this.detectLanguage();
            console.log('[I18n-Fixed] Detected language:', detectedLanguage);
            
            // Load both English (fallback) and target language
            return this.loadLanguage(this.fallbackLanguage)
                .then(() => {
                    if (detectedLanguage !== this.fallbackLanguage) {
                        return this.loadLanguage(detectedLanguage);
                    }
                })
                .then(() => {
                    this.currentLanguage = detectedLanguage;
                    this.initialized = true;
                    console.log('[I18n-Fixed] Successfully initialized with language:', this.currentLanguage);
                    console.log('[I18n-Fixed] Available translations:', Object.keys(this.translations));
                    
                    // Update page translations after initialization
                    this.updatePageTranslations();
                    
                    // Emit initialization event
                    document.dispatchEvent(new CustomEvent('i18nInitialized', { 
                        detail: { language: this.currentLanguage } 
                    }));
                })
                .catch(error => {
                    console.error('[I18n-Fixed] Error during initialization:', error);
                    // Fallback to English if initialization fails
                    this.currentLanguage = this.fallbackLanguage;
                    this.initialized = true;
                    throw error;
                });
        },
        
        /**
         * Detect language from browser or system
         * @returns {string} Language code
         */
        detectLanguage: function() {
            console.log('[I18n-Fixed] Starting language detection...');
            
            // Check localStorage first
            const savedLang = localStorage.getItem('maplibre_language');
            console.log('[I18n-Fixed] Saved language in localStorage:', savedLang);
            if (savedLang && this.isLanguageSupported(savedLang)) {
                console.log('[I18n-Fixed] Using saved language:', savedLang);
                return savedLang;
            }
            
            // Check Android bridge for device language
            if (window.bridge && typeof window.bridge.getDeviceLanguage === 'function') {
                try {
                    const deviceLang = window.bridge.getDeviceLanguage();
                    console.log('[I18n-Fixed] Device language from Android bridge:', deviceLang);
                    if (deviceLang && this.isLanguageSupported(deviceLang)) {
                        console.log('[I18n-Fixed] Using device language:', deviceLang);
                        return deviceLang;
                    }
                } catch (error) {
                    console.log('[I18n-Fixed] Could not get device language from Android bridge:', error);
                }
            }
            
            // Check browser language
            const browserLang = navigator.language || navigator.userLanguage;
            const shortLang = browserLang ? browserLang.split('-')[0] : null;
            console.log('[I18n-Fixed] Browser language:', browserLang, '-> Short language:', shortLang);
            
            if (shortLang && this.isLanguageSupported(shortLang)) {
                console.log('[I18n-Fixed] Using browser language:', shortLang);
                return shortLang;
            }
            
            console.log('[I18n-Fixed] Using fallback language:', this.fallbackLanguage);
            return this.fallbackLanguage;
        },
        
        /**
         * Check if a language is supported
         * @param {string} lang - Language code
         * @returns {boolean}
         */
        isLanguageSupported: function(lang) {
            const supported = ['en', 'de', 'es', 'fr', 'it'];
            return supported.includes(lang);
        },
        
        /**
         * Load translations for a language
         * @param {string} lang - Language code
         * @returns {Promise}
         */
        loadLanguage: function(lang) {
            console.log('[I18n-Fixed] Loading language:', lang);
            
            if (this.loadedLanguages.has(lang)) {
                console.log('[I18n-Fixed] Language already loaded:', lang);
                return Promise.resolve();
            }
            
            const url = `src/i18n/translations/${lang}.json`;
            console.log('[I18n-Fixed] Fetching translation file:', url);
            
            return fetch(url)
                .then(response => {
                    console.log('[I18n-Fixed] Translation file response:', response.status, response.statusText);
                    if (!response.ok) {
                        throw new Error(`Failed to load language: ${lang} (${response.status})`);
                    }
                    return response.json();
                })
                .then(translations => {
                    console.log('[I18n-Fixed] Translation file loaded successfully for:', lang);
                    console.log('[I18n-Fixed] Translation keys:', Object.keys(translations));
                    this.translations[lang] = translations;
                    this.loadedLanguages.add(lang);
                    
                    // Validate that we have some translations
                    if (Object.keys(translations).length === 0) {
                        console.warn('[I18n-Fixed] Warning: Translation file is empty for language:', lang);
                    }
                })
                .catch(error => {
                    console.error('[I18n-Fixed] Error loading language:', lang, error);
                    // Don't fallback automatically - let the calling code handle it
                    throw error;
                });
        },
        
        /**
         * Set the current language
         * @param {string} lang - Language code
         * @returns {Promise}
         */
        setLanguage: function(lang) {
            console.log('[I18n-Fixed] Setting language to:', lang);
            
            if (!this.isLanguageSupported(lang)) {
                console.warn(`[I18n-Fixed] Language ${lang} is not supported`);
                lang = this.fallbackLanguage;
            }
            
            return this.loadLanguage(lang).then(() => {
                this.currentLanguage = lang;
                localStorage.setItem('maplibre_language', lang);
                console.log('[I18n-Fixed] Language set to:', lang);
                
                // Update page translations
                this.updatePageTranslations();
                
                // Emit language change event
                document.dispatchEvent(new CustomEvent('languageChanged', { 
                    detail: { language: lang } 
                }));
                
                console.log('[I18n-Fixed] Language change complete');
            }).catch(error => {
                console.error('[I18n-Fixed] Error setting language:', error);
                throw error;
            });
        },
        
        /**
         * Get current language
         * @returns {string} Current language code
         */
        getLanguage: function() {
            return this.currentLanguage;
        },
        
        /**
         * Translate a key
         * @param {string} key - Translation key (dot notation)
         * @param {Object} params - Parameters for interpolation
         * @returns {string} Translated text
         */
        t: function(key, params) {
            if (!this.initialized) {
                console.warn('[I18n-Fixed] Translation requested before initialization:', key);
                return key;
            }
            
            // Try current language first
            let value = this.getNestedValue(this.translations[this.currentLanguage], key);
            
            // Special handling for standalone terms (like "Total", "Segments")
            if (value === null && !key.includes('.')) {
                // Try to find in common section
                value = this.getNestedValue(this.translations[this.currentLanguage], 'common.' + key.toLowerCase());
                
                // Also try direct mapping for common standalone terms
                if (value === null) {
                    const standaloneTerms = {
                        'Total': 'Gesamt',
                        'Segments': 'Segmente',
                        'Loading': 'Laden...',
                        'Error': 'Fehler'
                    };
                    
                    value = standaloneTerms[key];
                }
            }
            
            // Fallback to English if not found
            if (value === null && this.currentLanguage !== this.fallbackLanguage) {
                value = this.getNestedValue(this.translations[this.fallbackLanguage], key);
                
                // Also try English fallback for standalone terms
                if (value === null && !key.includes('.')) {
                    value = this.getNestedValue(this.translations[this.fallbackLanguage], 'common.' + key.toLowerCase());
                }
            }
            
            // Return key if translation not found
            if (value === null) {
                console.warn('[I18n-Fixed] No translation found for key:', key);
                return key;
            }
            
            // Handle interpolation
            if (params && typeof value === 'string') {
                Object.keys(params).forEach(param => {
                    value = value.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
                });
            }
            
            return value;
        },
        
        /**
         * Get nested value from object using dot notation
         * @param {Object} obj - Object to search
         * @param {string} key - Dot notation key
         * @returns {*} Value or null if not found
         */
        getNestedValue: function(obj, key) {
            if (!obj) return null;
            
            const keys = key.split('.');
            let value = obj;
            
            for (let i = 0; i < keys.length; i++) {
                if (value && typeof value === 'object' && keys[i] in value) {
                    value = value[keys[i]];
                } else {
                    return null;
                }
            }
            
            return value;
        },
        
        /**
         * Update all translations on the page
         */
        updatePageTranslations: function() {
            if (!this.initialized) {
                console.warn('[I18n-Fixed] updatePageTranslations called before initialization');
                return;
            }
            
            // Check if translations are loaded for current language
            if (!this.translations[this.currentLanguage]) {
                console.warn('[I18n-Fixed] Translations not loaded for current language:', this.currentLanguage);
                return;
            }
            
            console.log('[I18n-Fixed] Updating page translations for language:', this.currentLanguage);
            
            let updatedCount = 0;
            
            // Update elements with data-i18n attribute
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = this.t(key);
                
                // Only update if we got a valid translation (not just the key back)
                if (translation !== key) {
                    element.textContent = translation;
                    updatedCount++;
                }
            });
            
            // Update elements with data-i18n-placeholder
            document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
                const key = element.getAttribute('data-i18n-placeholder');
                const translation = this.t(key);
                if (translation !== key) {
                    element.placeholder = translation;
                    updatedCount++;
                }
            });
            
            // Update elements with data-i18n-title
            document.querySelectorAll('[data-i18n-title]').forEach(element => {
                const key = element.getAttribute('data-i18n-title');
                const translation = this.t(key);
                if (translation !== key) {
                    element.title = translation;
                    updatedCount++;
                }
            });
            
            console.log('[I18n-Fixed] Page translations updated successfully. Updated', updatedCount, 'elements');
        },
        
        /**
         * Get debug information about current i18n state
         * @returns {Object} Debug information
         */
        getDebugInfo: function() {
            return {
                initialized: this.initialized,
                currentLanguage: this.currentLanguage,
                fallbackLanguage: this.fallbackLanguage,
                loadedLanguages: Array.from(this.loadedLanguages),
                translationKeys: Object.keys(this.translations),
                availableTranslations: Object.keys(this.translations).reduce((acc, lang) => {
                    acc[lang] = Object.keys(this.translations[lang] || {});
                    return acc;
                }, {}),
                savedLanguage: localStorage.getItem('maplibre_language'),
                browserLanguage: navigator.language,
                browserLanguages: navigator.languages,
                supportedLanguages: ['en', 'de', 'es', 'fr', 'it'],
                detectLanguageResult: this.detectLanguage(),
                bridgeAvailable: typeof window.bridge !== 'undefined',
                bridgeHasLanguageMethod: typeof window.bridge !== 'undefined' && typeof window.bridge.getDeviceLanguage === 'function'
            };
        }
    };
    
    // Initialize when DOM is ready or immediately if already loaded
    function initializeI18n() {
        console.log('[I18n-Fixed] Starting initialization...');
        
        // Try to detect language from Android bridge immediately
        let initialLanguage = 'de'; // Default to German for this case
        
        if (typeof window.bridge !== 'undefined' && typeof window.bridge.getDeviceLanguage === 'function') {
            try {
                const deviceLang = window.bridge.getDeviceLanguage();
                if (deviceLang && App.I18n.isLanguageSupported(deviceLang)) {
                    initialLanguage = deviceLang;
                    console.log('[I18n-Fixed] Using device language from bridge:', deviceLang);
                }
            } catch (error) {
                console.log('[I18n-Fixed] Could not get device language from bridge:', error);
            }
        }
        
        App.I18n.init(initialLanguage).then(() => {
            console.log('[I18n-Fixed] I18n system initialized successfully');
        }).catch(error => {
            console.error('[I18n-Fixed] I18n initialization failed:', error);
        });
    }
    
    // Initialize based on document readiness
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeI18n);
    } else {
        // DOM is already ready, initialize with a small delay to ensure other scripts are loaded
        setTimeout(initializeI18n, 100);
    }
    
    // Make global functions available for debugging
    window.App.I18n.forceGerman = function() {
        console.log('[I18n-Fixed] Force switching to German...');
        return App.I18n.setLanguage('de');
    };
    
    window.App.I18n.debugTranslation = function(key) {
        console.log('[I18n-Fixed] Debug translation for key:', key);
        console.log('Current language:', App.I18n.currentLanguage);
        console.log('Translation result:', App.I18n.t(key));
        console.log('Available in current language:', App.I18n.getNestedValue(App.I18n.translations[App.I18n.currentLanguage], key));
        console.log('Available in fallback:', App.I18n.getNestedValue(App.I18n.translations[App.I18n.fallbackLanguage], key));
    };
    
    console.log('[I18n-Fixed] I18n Manager loaded');
})();