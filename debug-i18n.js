/**
 * I18n Debug Script
 * Run this in browser console to diagnose language detection issues
 */

(function() {
    'use strict';

    const I18nDebugger = {
        
        /**
         * Main debugging function - run this to get full diagnosis
         */
        diagnose: function() {
            console.log('=== I18n Language Detection Debug ===');
            
            this.checkBrowserInfo();
            this.checkI18nManager();
            this.checkTranslationFiles();
            this.checkInitialization();
            this.checkLanguageDetection();
            this.testLanguageSwitching();
            this.checkDOMTranslations();
            this.provideFixes();
            
            console.log('=== End of I18n Debug ===');
        },
        
        /**
         * Check browser language information
         */
        checkBrowserInfo: function() {
            console.log('\n--- Browser Language Information ---');
            console.log('navigator.language:', navigator.language);
            console.log('navigator.userLanguage:', navigator.userLanguage);
            console.log('navigator.languages:', navigator.languages);
            
            const browserLang = navigator.language || navigator.userLanguage;
            const shortLang = browserLang ? browserLang.split('-')[0] : 'unknown';
            console.log('Detected short language:', shortLang);
            
            // Check localStorage
            const savedLang = localStorage.getItem('maplibre_language');
            console.log('Saved language in localStorage:', savedLang);
        },
        
        /**
         * Check if I18n manager is available and initialized
         */
        checkI18nManager: function() {
            console.log('\n--- I18n Manager Status ---');
            console.log('App object exists:', typeof App !== 'undefined');
            console.log('App.I18n exists:', typeof App !== 'undefined' && typeof App.I18n !== 'undefined');
            
            if (typeof App !== 'undefined' && App.I18n) {
                console.log('Current language:', App.I18n.currentLanguage);
                console.log('Fallback language:', App.I18n.fallbackLanguage);
                console.log('Loaded languages:', Array.from(App.I18n.loadedLanguages));
                console.log('Available languages:', App.I18n.getAvailableLanguages());
                console.log('Translations object keys:', Object.keys(App.I18n.translations));
            } else {
                console.error('❌ App.I18n is not available! Check if i18n-manager.js is loaded.');
            }
        },
        
        /**
         * Check if translation files are loading correctly
         */
        checkTranslationFiles: function() {
            console.log('\n--- Translation Files Check ---');
            
            const languages = ['en', 'de', 'es', 'fr', 'it'];
            
            languages.forEach(lang => {
                const url = `src/i18n/translations/${lang}.json`;
                fetch(url)
                    .then(response => {
                        if (response.ok) {
                            console.log(`✅ ${lang}.json - Status: ${response.status}`);
                            return response.json();
                        } else {
                            console.error(`❌ ${lang}.json - Status: ${response.status}`);
                        }
                    })
                    .then(data => {
                        if (data) {
                            console.log(`   - Keys: ${Object.keys(data).length}`);
                            console.log(`   - Sample: ui.tabs.layers = "${data.ui?.tabs?.layers || 'not found'}"`);
                        }
                    })
                    .catch(error => {
                        console.error(`❌ ${lang}.json - Error:`, error);
                    });
            });
        },
        
        /**
         * Check initialization sequence
         */
        checkInitialization: function() {
            console.log('\n--- Initialization Check ---');
            
            // Check if DOMContentLoaded has fired
            console.log('Document ready state:', document.readyState);
            
            // Check if App.I18n.init() was called
            if (typeof App !== 'undefined' && App.I18n) {
                console.log('I18n initialized based on loadedLanguages:', App.I18n.loadedLanguages.size > 0);
                
                // Try to detect language manually
                const detectedLang = App.I18n.detectLanguage();
                console.log('Manual language detection result:', detectedLang);
            }
        },
        
        /**
         * Test language detection logic step by step
         */
        checkLanguageDetection: function() {
            console.log('\n--- Language Detection Logic ---');
            
            if (typeof App !== 'undefined' && App.I18n) {
                // Step 1: Check localStorage
                const savedLang = localStorage.getItem('maplibre_language');
                console.log('Step 1 - localStorage check:', savedLang);
                
                if (savedLang) {
                    const isSupported = App.I18n.isLanguageSupported(savedLang);
                    console.log(`  - Is "${savedLang}" supported?`, isSupported);
                    if (isSupported) {
                        console.log('  - ✅ Would use saved language:', savedLang);
                        return;
                    }
                }
                
                // Step 2: Check browser language
                const browserLang = navigator.language || navigator.userLanguage;
                console.log('Step 2 - Browser language:', browserLang);
                
                if (browserLang) {
                    const shortLang = browserLang.split('-')[0];
                    console.log('  - Short language:', shortLang);
                    
                    const isSupported = App.I18n.isLanguageSupported(shortLang);
                    console.log(`  - Is "${shortLang}" supported?`, isSupported);
                    
                    if (isSupported) {
                        console.log('  - ✅ Would use browser language:', shortLang);
                        return;
                    }
                }
                
                // Step 3: Fallback
                console.log('Step 3 - Would use fallback:', App.I18n.fallbackLanguage);
            }
        },
        
        /**
         * Test language switching functionality
         */
        testLanguageSwitching: function() {
            console.log('\n--- Language Switching Test ---');
            
            if (typeof App !== 'undefined' && App.I18n) {
                const currentLang = App.I18n.getLanguage();
                console.log('Current language before test:', currentLang);
                
                // Test switching to German
                console.log('Testing switch to German...');
                App.I18n.setLanguage('de')
                    .then(() => {
                        console.log('✅ Successfully switched to German');
                        console.log('Current language after switch:', App.I18n.getLanguage());
                        
                        // Test a translation
                        const translation = App.I18n.t('ui.tabs.layers');
                        console.log('Translation test (ui.tabs.layers):', translation);
                        
                        // Switch back to original language
                        return App.I18n.setLanguage(currentLang);
                    })
                    .then(() => {
                        console.log('✅ Switched back to original language');
                    })
                    .catch(error => {
                        console.error('❌ Error during language switching:', error);
                    });
            }
        },
        
        /**
         * Check DOM elements with translation attributes
         */
        checkDOMTranslations: function() {
            console.log('\n--- DOM Translation Elements ---');
            
            const elements = document.querySelectorAll('[data-i18n]');
            console.log('Elements with data-i18n:', elements.length);
            
            if (elements.length > 0) {
                const sample = Array.from(elements).slice(0, 5);
                sample.forEach((el, index) => {
                    const key = el.getAttribute('data-i18n');
                    const currentText = el.textContent || el.placeholder || el.title;
                    console.log(`  ${index + 1}. Key: "${key}" -> Text: "${currentText}"`);
                });
            }
            
            // Check placeholder elements
            const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
            console.log('Elements with data-i18n-placeholder:', placeholderElements.length);
            
            // Check title elements
            const titleElements = document.querySelectorAll('[data-i18n-title]');
            console.log('Elements with data-i18n-title:', titleElements.length);
        },
        
        /**
         * Provide potential fixes and manual tests
         */
        provideFixes: function() {
            console.log('\n--- Potential Fixes and Manual Tests ---');
            
            console.log('Manual tests you can run:');
            console.log('1. Force German language:');
            console.log('   I18nDebugger.forceGerman()');
            
            console.log('2. Test specific translation:');
            console.log('   I18nDebugger.testTranslation("ui.tabs.layers")');
            
            console.log('3. Reload translations:');
            console.log('   I18nDebugger.reloadTranslations()');
            
            console.log('4. Check network requests:');
            console.log('   I18nDebugger.checkNetworkRequests()');
            
            console.log('5. Force reinitialize:');
            console.log('   I18nDebugger.forceReinitialize()');
        },
        
        /**
         * Force switch to German
         */
        forceGerman: function() {
            console.log('Forcing switch to German...');
            if (typeof App !== 'undefined' && App.I18n) {
                App.I18n.setLanguage('de')
                    .then(() => {
                        console.log('✅ Forced to German');
                        App.I18n.updatePageTranslations();
                        console.log('✅ Updated page translations');
                    })
                    .catch(error => {
                        console.error('❌ Error forcing German:', error);
                    });
            }
        },
        
        /**
         * Test specific translation
         */
        testTranslation: function(key) {
            console.log(`Testing translation for key: ${key}`);
            if (typeof App !== 'undefined' && App.I18n) {
                const translation = App.I18n.t(key);
                console.log(`Result: "${translation}"`);
                return translation;
            }
        },
        
        /**
         * Force reload translations
         */
        reloadTranslations: function() {
            console.log('Reloading translations...');
            if (typeof App !== 'undefined' && App.I18n) {
                // Clear loaded languages
                App.I18n.loadedLanguages.clear();
                App.I18n.translations = {};
                
                // Reinitialize
                App.I18n.init()
                    .then(() => {
                        console.log('✅ Translations reloaded');
                    })
                    .catch(error => {
                        console.error('❌ Error reloading:', error);
                    });
            }
        },
        
        /**
         * Check network requests for translation files
         */
        checkNetworkRequests: function() {
            console.log('Checking network requests...');
            console.log('Open DevTools -> Network tab and filter by "translations" to see if .json files are being loaded');
            
            // Force a request
            if (typeof App !== 'undefined' && App.I18n) {
                App.I18n.loadLanguage('de')
                    .then(() => {
                        console.log('✅ German translation loaded');
                    })
                    .catch(error => {
                        console.error('❌ Error loading German:', error);
                    });
            }
        },
        
        /**
         * Force reinitialize the entire i18n system
         */
        forceReinitialize: function() {
            console.log('Force reinitializing i18n system...');
            if (typeof App !== 'undefined' && App.I18n) {
                // Reset state
                App.I18n.currentLanguage = 'en';
                App.I18n.loadedLanguages.clear();
                App.I18n.translations = {};
                
                // Detect and initialize
                const detectedLang = App.I18n.detectLanguage();
                console.log('Detected language:', detectedLang);
                
                App.I18n.init(detectedLang)
                    .then(() => {
                        console.log('✅ System reinitialized');
                        App.I18n.updatePageTranslations();
                    })
                    .catch(error => {
                        console.error('❌ Error during reinitialization:', error);
                    });
            }
        },
        
        /**
         * Get current system info
         */
        getSystemInfo: function() {
            const info = {
                browserLanguage: navigator.language,
                browserLanguages: navigator.languages,
                savedLanguage: localStorage.getItem('maplibre_language'),
                currentLanguage: typeof App !== 'undefined' && App.I18n ? App.I18n.getLanguage() : 'unknown',
                loadedLanguages: typeof App !== 'undefined' && App.I18n ? Array.from(App.I18n.loadedLanguages) : [],
                translationKeys: typeof App !== 'undefined' && App.I18n ? Object.keys(App.I18n.translations) : []
            };
            
            console.log('System Info:', info);
            return info;
        }
    };
    
    // Make it globally available
    window.I18nDebugger = I18nDebugger;
    
    console.log('I18n Debugger loaded. Run I18nDebugger.diagnose() to start debugging.');
    
})();