/**
 * Loader for StakeOut AI enhancements
 * Loads the autozoom engine and enhanced UI components
 */
(function() {
  console.log('[StakeOutAI] Loading enhancements...');
  console.log('[StakeOutAI] Initial check - StakeOutUICompact exists:', !!window.StakeOutUICompact);
  
  // Wait for StakeOutUICompact to be loaded if it's not ready yet
  function waitForStakeOutUICompact(callback) {
    if (window.StakeOutUICompact) {
      callback();
    } else {
      console.log('[StakeOutAI] Waiting for StakeOutUICompact to load...');
      setTimeout(function() {
        waitForStakeOutUICompact(callback);
      }, 100);
    }
  }
  
  // Function to load a script dynamically
  function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    script.onerror = function(error) {
      console.error('[StakeOutAI] Failed to load:', src);
      console.error('[StakeOutAI] Error details:', error);
      if (callback) {
        console.error('[StakeOutAI] Skipping callback due to load error');
      }
    };
    document.head.appendChild(script);
  }
  
  // Function to override StakeOutUICompact with enhanced version
  function enhanceStakeOutUI() {
    console.log('[StakeOutAI] Attempting to enhance StakeOutUI...');
    console.log('[StakeOutAI] window.StakeOutUIEnhanced exists:', !!window.StakeOutUIEnhanced);
    console.log('[StakeOutAI] window.StakeOutUICompact exists:', !!window.StakeOutUICompact);
    
    if (window.StakeOutUIEnhanced && window.StakeOutUICompact) {
      // Store original constructor if needed
      window.StakeOutUICompactOriginal = window.StakeOutUICompact;
      
      // Replace with enhanced version
      window.StakeOutUICompact = window.StakeOutUIEnhanced;
      
      console.log('[StakeOutAI] Successfully enhanced StakeOutUI');
      console.log('[StakeOutAI] StakeOutUICompact is now:', window.StakeOutUICompact.name);
      
      // Check if StakeOut is already initialized and needs UI replacement
      if (window.App && window.App.Features && window.App.Features.StakeOut) {
        console.log('[StakeOutAI] StakeOut already initialized, checking UI...');
        
        try {
          const currentUI = window.App.Features.StakeOut.getUI();
          
          // Check if it's already enhanced
          if (currentUI && !(currentUI instanceof window.StakeOutUIEnhanced)) {
            console.log('[StakeOutAI] Current UI is not enhanced, need to trigger recreation...');
            
            // If stakeout is active, we need to clean up and recreate
            if (window.App.Features.StakeOut.isActive()) {
              console.log('[StakeOutAI] StakeOut is active, cleaning up for UI replacement...');
              
              // Clean up current stakeout
              window.App.Features.StakeOut.cleanup();
              
              // Re-trigger stakeout with the same coordinates
              // The new StakeOutUICompact (which is now StakeOutUIEnhanced) will be used
              console.log('[StakeOutAI] UI replacement will happen on next stakeout activation');
            }
          } else if (currentUI instanceof window.StakeOutUIEnhanced) {
            console.log('[StakeOutAI] UI is already enhanced!');
          }
        } catch (error) {
          console.error('[StakeOutAI] Error checking/replacing UI:', error);
        }
      }
    } else {
      console.warn('[StakeOutAI] Unable to enhance - missing dependencies');
    }
  }
  
  // Determine base path for script loading
  const scripts = document.getElementsByTagName('script');
  let basePath = '';
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].src && scripts[i].src.includes('stakeout-ai/loader.js')) {
      basePath = scripts[i].src.replace('/stakeout-ai/loader.js', '');
      break;
    }
  }
  console.log('[StakeOutAI] Base path determined:', basePath);
  
  // Wait for StakeOutUICompact before loading enhancements
  waitForStakeOutUICompact(function() {
    console.log('[StakeOutAI] StakeOutUICompact is ready, loading enhancements...');
    
    // Load dependencies in order
    loadScript(basePath + '/stakeout-ai/utils/user-preferences.js', function() {
    console.log('[StakeOutAI] User preferences loaded');
    
    // Load language utilities
    loadScript(basePath + '/stakeout-ai/utils/language-manager.js', function() {
      console.log('[StakeOutAI] Language manager loaded');
      
      loadScript(basePath + '/stakeout-ai/utils/language-integration.js', function() {
        console.log('[StakeOutAI] Language integration loaded');
        
        loadScript(basePath + '/stakeout-ai/utils/language-bridge.js', function() {
          console.log('[StakeOutAI] Language bridge loaded');
          
          // Initialize language system
          if (window.LanguageManager) {
            window.LanguageManager.initialize();
          }
          if (window.LanguageIntegration) {
            window.LanguageIntegration.initializeIntegration();
          }
    
    // Load battery manager
    loadScript(basePath + '/stakeout-ai/utils/battery-manager.js', function() {
      console.log('[StakeOutAI] Battery manager loaded');
      
      // Load the autozoom engine
      loadScript(basePath + '/stakeout-ai/core/autozoom-engine.js', function() {
        console.log('[StakeOutAI] Autozoom engine loaded');
      
      // Load ML coordinator
      loadScript(basePath + '/stakeout-ai/core/ml-coordinator.js', function() {
        console.log('[StakeOutAI] ML coordinator loaded');
        
        // Load performance monitor
        loadScript(basePath + '/stakeout-ai/core/performance-monitor.js', function() {
          console.log('[StakeOutAI] Performance monitor loaded');
          
          // Load WebGL optimizer
          loadScript(basePath + '/stakeout-ai/utils/webgl-optimizer.js', function() {
            console.log('[StakeOutAI] WebGL optimizer loaded');
            
            // Load AR enhancements
            loadScript(basePath + '/stakeout-ai/utils/ar-enhancements.js', function() {
              console.log('[StakeOutAI] AR enhancements loaded');
              
              // Finally load the enhanced UI
              loadScript(basePath + '/stakeout-ai/core/StakeOutUIEnhanced.js', function() {
                console.log('[StakeOutAI] Enhanced UI loaded');
                
                // Override the StakeOutUICompact class
                enhanceStakeOutUI();
                
                // Hook into stakeout activation to trigger zoom control hiding
                if (window.App && window.App.Core && window.App.Core.Events) {
                  // Listen for stakeout activation
                  window.App.Core.Events.on('stakeout:started', function() {
                    console.log('[StakeOutAI] Stakeout started - hiding external zoom controls');
                    // The enhanced UI will handle this automatically
                  });
                }
                
                console.log('[StakeOutAI] All enhancements loaded successfully');
                
                // Expose a manual trigger function for testing
                window.StakeOutAI = {
                  triggerEnhancement: function() {
                    console.log('[StakeOutAI] Manually triggering enhancement...');
                    enhanceStakeOutUI();
                  },
                  
                  // Language control methods
                  setLanguage: function(language) {
                    console.log('[StakeOutAI] Setting language via StakeOutAI:', language);
                    if (window.LanguageBridge) {
                      return window.LanguageBridge.setLanguage(language);
                    }
                    return false;
                  },
                  
                  getCurrentLanguage: function() {
                    if (window.LanguageBridge) {
                      return window.LanguageBridge.getCurrentLanguage();
                    }
                    return 'en';
                  },
                  
                  getLanguageStatus: function() {
                    const status = {
                      languageManager: !!window.LanguageManager,
                      languageIntegration: !!window.LanguageIntegration,
                      languageBridge: !!window.LanguageBridge
                    };
                    
                    if (window.LanguageBridge) {
                      status.bridgeStatus = window.LanguageBridge.getStatus();
                    }
                    
                    if (window.LanguageManager) {
                      status.managerDebug = window.LanguageManager.getDebugInfo();
                    }
                    
                    return status;
                  },
                  
                  testLanguage: function() {
                    console.log('[StakeOutAI] Testing language system...');
                    if (window.LanguageBridge) {
                      return window.LanguageBridge.testBridge();
                    }
                    return false;
                  },
                  
                  testStakeout: function() {
                    console.log('[StakeOutAI] Testing stakeout with mock coordinates...');
                    if (window.App && window.App.Features && window.App.Features.StakeOut) {
                      // Use current location or mock coordinates
                      const currentLng = 0.0;
                      const currentLat = 0.0;
                      const targetLng = 0.001;
                      const targetLat = 0.001;
                      
                      // Activate stakeout
                      window.App.Features.StakeOut.addCircleLayer(targetLng, targetLat, currentLng, currentLat);
                      console.log('[StakeOutAI] Stakeout activated with test coordinates');
                    } else {
                      console.error('[StakeOutAI] StakeOut module not available');
                    }
                  },
                  
                  getStatus: function() {
                    const status = {
                      enhanced: false,
                      uiType: 'Unknown',
                      active: false
                    };
                    
                    if (window.App && window.App.Features && window.App.Features.StakeOut) {
                      const ui = window.App.Features.StakeOut.getUI();
                      status.enhanced = ui instanceof window.StakeOutUIEnhanced;
                      status.uiType = ui ? ui.constructor.name : 'None';
                      status.active = window.App.Features.StakeOut.isActive();
                    }
                    
                    console.log('[StakeOutAI] Status:', status);
                    return status;
                  }
                };
                
                console.log('[StakeOutAI] Manual controls available:');
                console.log('  - StakeOutAI.triggerEnhancement() - Force UI enhancement');
                console.log('  - StakeOutAI.testStakeout() - Test with mock coordinates');
                console.log('  - StakeOutAI.getStatus() - Check enhancement status');
                console.log('  - StakeOutAI.setLanguage(lang) - Set language (e.g., "es", "fr")');
                console.log('  - StakeOutAI.getCurrentLanguage() - Get current language');
                console.log('  - StakeOutAI.getLanguageStatus() - Get language system status');
                console.log('  - StakeOutAI.testLanguage() - Test language bridge');
                
                // Load test suite if requested
                if (window.location.search.includes('runTests=true') || 
                    window.location.search.includes('runBenchmarks=true')) {
                  
                  loadScript(basePath + '/stakeout-ai/test/test-suite.js', function() {
                    console.log('[StakeOutAI] Test suite loaded');
                    
                    loadScript(basePath + '/stakeout-ai/test/benchmark.js', function() {
                      console.log('[StakeOutAI] Benchmark suite loaded');
                    });
                  });
                }
              });
            });
          });
        });
      });
    });
    });
  });
  });
  }); // End of waitForStakeOutUICompact callback
})();