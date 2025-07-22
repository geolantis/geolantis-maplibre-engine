/**
 * I18n Manager for MapLibre Engine
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
        
        /**
         * Initialize the i18n manager
         * @param {string} language - Initial language code
         * @returns {Promise}
         */
        init: function(language) {
            console.log('[I18n] Initializing i18n manager...');
            console.log('[I18n] Provided language:', language);
            
            this.currentLanguage = language || this.detectLanguage();
            console.log('[I18n] Selected language:', this.currentLanguage);
            
            return this.loadLanguage(this.currentLanguage)
                .then(() => {
                    console.log('[I18n] Successfully initialized with language:', this.currentLanguage);
                    console.log('[I18n] Available translations:', Object.keys(this.translations));
                })
                .catch(error => {
                    console.error('[I18n] Error during initialization:', error);
                    throw error;
                });
        },
        
        /**
         * Detect language from browser or system
         * @returns {string} Language code
         */
        detectLanguage: function() {
            console.log('[I18n] Starting language detection...');
            
            // Check localStorage first
            const savedLang = localStorage.getItem('maplibre_language');
            console.log('[I18n] Saved language in localStorage:', savedLang);
            if (savedLang && this.isLanguageSupported(savedLang)) {
                console.log('[I18n] Using saved language:', savedLang);
                return savedLang;
            }
            
            // Check Android bridge for device language
            if (window.bridge && typeof window.bridge.getDeviceLanguage === 'function') {
                try {
                    const deviceLang = window.bridge.getDeviceLanguage();
                    console.log('[I18n] Device language from Android bridge:', deviceLang);
                    if (deviceLang && this.isLanguageSupported(deviceLang)) {
                        console.log('[I18n] Using device language:', deviceLang);
                        return deviceLang;
                    }
                } catch (error) {
                    console.log('[I18n] Could not get device language from Android bridge:', error);
                }
            }
            
            // Check browser language
            const browserLang = navigator.language || navigator.userLanguage;
            const shortLang = browserLang ? browserLang.split('-')[0] : null;
            console.log('[I18n] Browser language:', browserLang, '-> Short language:', shortLang);
            
            if (shortLang && this.isLanguageSupported(shortLang)) {
                console.log('[I18n] Using browser language:', shortLang);
                return shortLang;
            }
            
            console.log('[I18n] Using fallback language:', this.fallbackLanguage);
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
         * Get list of available languages
         * @returns {Array} Available language codes
         */
        getAvailableLanguages: function() {
            return [
                { code: 'en', name: 'English' },
                { code: 'de', name: 'Deutsch' },
                { code: 'es', name: 'Español' },
                { code: 'fr', name: 'Français' },
                { code: 'it', name: 'Italiano' }
            ];
        },
        
        /**
         * Load translations for a language
         * @param {string} lang - Language code
         * @returns {Promise}
         */
        loadLanguage: function(lang) {
            console.log('[I18n] Loading language:', lang);
            
            if (this.loadedLanguages.has(lang)) {
                console.log('[I18n] Language already loaded:', lang);
                return Promise.resolve();
            }
            
            const url = `src/i18n/translations/${lang}.json`;
            console.log('[I18n] Fetching translation file:', url);
            
            return fetch(url)
                .then(response => {
                    console.log('[I18n] Translation file response:', response.status, response.statusText);
                    if (!response.ok) {
                        throw new Error(`Failed to load language: ${lang} (${response.status})`);
                    }
                    return response.json();
                })
                .then(translations => {
                    console.log('[I18n] Translation file loaded successfully for:', lang);
                    console.log('[I18n] Translation keys:', Object.keys(translations));
                    this.translations[lang] = translations;
                    this.loadedLanguages.add(lang);
                })
                .catch(error => {
                    console.error('[I18n] Error loading language:', lang, error);
                    // Fallback to English if language fails to load
                    if (lang !== this.fallbackLanguage) {
                        console.log('[I18n] Falling back to:', this.fallbackLanguage);
                        return this.loadLanguage(this.fallbackLanguage);
                    }
                });
        },
        
        /**
         * Set the current language
         * @param {string} lang - Language code
         * @returns {Promise}
         */
        setLanguage: function(lang) {
            if (!this.isLanguageSupported(lang)) {
                console.warn(`Language ${lang} is not supported`);
                lang = this.fallbackLanguage;
            }
            
            return this.loadLanguage(lang).then(() => {
                this.currentLanguage = lang;
                localStorage.setItem('maplibre_language', lang);
                this.updatePageTranslations();
                // Emit language change event
                document.dispatchEvent(new CustomEvent('languageChanged', { 
                    detail: { language: lang } 
                }));
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
         * Force set language (called from Android bridge)
         * @param {string} language - Language code
         * @returns {Promise}
         */
        forceLanguage: function(language) {
            console.log('[I18n] Force setting language to:', language);
            if (this.isLanguageSupported(language)) {
                return this.setLanguage(language);
            } else {
                console.warn('[I18n] Unsupported language:', language);
                return Promise.resolve();
            }
        },
        
        /**
         * Translate a key
         * @param {string} key - Translation key (dot notation)
         * @param {Object} params - Parameters for interpolation
         * @returns {string} Translated text
         */
        t: function(key, params) {
            const keys = key.split('.');
            let value = this.translations[this.currentLanguage];
            
            // Navigate through nested object
            for (let i = 0; i < keys.length; i++) {
                if (value && typeof value === 'object' && keys[i] in value) {
                    value = value[keys[i]];
                } else {
                    // Try fallback language
                    value = this.translations[this.fallbackLanguage];
                    for (let j = 0; j <= i; j++) {
                        if (value && typeof value === 'object' && keys[j] in value) {
                            value = value[keys[j]];
                        } else {
                            // Return key if translation not found
                            return key;
                        }
                    }
                }
            }
            
            // Handle interpolation
            if (params && typeof value === 'string') {
                Object.keys(params).forEach(param => {
                    value = value.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
                });
            }
            
            return value || key;
        },
        
        /**
         * Update all translations on the page
         */
        updatePageTranslations: function() {
            // Check if translations are loaded for current language
            if (!this.translations[this.currentLanguage]) {
                console.warn('[I18n] Translations not loaded for current language:', this.currentLanguage);
                return;
            }
            
            console.log('[I18n] Updating page translations for language:', this.currentLanguage);
            
            // Update elements with data-i18n attribute
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = this.t(key);
                
                // Only update if we got a valid translation (not just the key back)
                if (translation !== key) {
                    // Check if it's a placeholder or regular text
                    if (element.hasAttribute('placeholder')) {
                        element.placeholder = translation;
                    } else if (element.hasAttribute('title')) {
                        element.title = translation;
                    } else {
                        element.textContent = translation;
                    }
                } else {
                    console.warn('[I18n] No translation found for key:', key);
                }
            });
            
            // Update elements with data-i18n-placeholder
            document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
                const key = element.getAttribute('data-i18n-placeholder');
                const translation = this.t(key);
                if (translation !== key) {
                    element.placeholder = translation;
                }
            });
            
            // Update elements with data-i18n-title
            document.querySelectorAll('[data-i18n-title]').forEach(element => {
                const key = element.getAttribute('data-i18n-title');
                const translation = this.t(key);
                if (translation !== key) {
                    element.title = translation;
                }
            });
            
            console.log('[I18n] Page translations updated successfully');
        },
        
        /**
         * Format number according to locale
         * @param {number} num - Number to format
         * @param {Object} options - Formatting options
         * @returns {string} Formatted number
         */
        formatNumber: function(num, options) {
            const locale = this.getLocale();
            return new Intl.NumberFormat(locale, options).format(num);
        },
        
        /**
         * Get locale for current language
         * @returns {string} Locale string
         */
        getLocale: function() {
            const localeMap = {
                'en': 'en-US',
                'de': 'de-DE',
                'es': 'es-ES',
                'fr': 'fr-FR',
                'it': 'it-IT'
            };
            return localeMap[this.currentLanguage] || 'en-US';
        },
        
        /**
         * Get debug information about current i18n state
         * @returns {Object} Debug information
         */
        getDebugInfo: function() {
            return {
                currentLanguage: this.currentLanguage,
                fallbackLanguage: this.fallbackLanguage,
                loadedLanguages: Array.from(this.loadedLanguages),
                translationKeys: Object.keys(this.translations),
                savedLanguage: localStorage.getItem('maplibre_language'),
                browserLanguage: navigator.language,
                browserLanguages: navigator.languages,
                supportedLanguages: this.getAvailableLanguages().map(l => l.code),
                detectLanguageResult: this.detectLanguage(),
                bridgeAvailable: typeof window.bridge !== 'undefined',
                bridgeHasLanguageMethod: typeof window.bridge !== 'undefined' && typeof window.bridge.getDeviceLanguage === 'function'
            };
        }
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            App.I18n.init().then(() => {
                // Update page translations after initialization
                App.I18n.updatePageTranslations();
            });
        });
    } else {
        App.I18n.init().then(() => {
            // Update page translations after initialization
            App.I18n.updatePageTranslations();
        });
    }
})();