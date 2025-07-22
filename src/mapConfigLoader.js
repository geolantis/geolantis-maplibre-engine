// mapConfigLoader.js - Optimized for immediate initialization with fallback

/**
 * Loads and initializes the map configuration globally.
 * This ensures backward compatibility with existing code that expects
 * a global mapConfig variable, while also supporting modern module imports.
 */
(function() {
    // Store our loaded config
    let loadPromise = null;
    
    // Use the GitHub raw URL for the map configuration JSON
    const defaultConfigUrl = 'https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/mapconfig.json';
    
    /**
     * Main function to load map configuration
     * 
     * @param {string} url - Optional URL to override the default
     * @param {Function} callback - Optional callback when config is loaded
     * @returns {Promise} Promise that resolves with the config
     */
    function loadMapConfig(url = defaultConfigUrl, callback) {
      // IMPORTANT: If defaultMapConfig exists, use it right away to set window.mapConfig
      // This ensures mapConfig is available immediately, which helps with modules that
      // load before the async JSON fetch completes
      if (!window.mapConfig && window.defaultMapConfig) {
        console.log('Initializing mapConfig with defaultMapConfig right away');
        window.mapConfig = window.defaultMapConfig;
        
        // Call the callback immediately if provided
        if (typeof callback === 'function') {
          callback(window.mapConfig);
        }
      }
      
      // If config is already fully loaded (from remote source), return it immediately
      if (window.mapConfig && window._mapConfigFullyLoaded) {
        if (typeof callback === 'function' && !window._callbackCalled) {
          callback(window.mapConfig);
          window._callbackCalled = true;
        }
        return Promise.resolve(window.mapConfig);
      }
      
      // If already loading, return the existing promise
      if (loadPromise) {
        return loadPromise;
      }
      
      // Load the config from remote source
      console.log(`Loading map configuration from ${url}`);
      
      loadPromise = fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load map configuration: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then(config => {
          console.log('Map configuration loaded successfully from remote source');
          
          // Store the configuration globally for backward compatibility
          window.mapConfig = config;
          window._mapConfigFullyLoaded = true;
          
          // Call the callback if provided and not already called
          if (typeof callback === 'function' && !window._callbackCalled) {
            callback(config);
            window._callbackCalled = true;
          }
          
          // Trigger a custom event that modules can listen for
          const event = new CustomEvent('mapconfig:loaded', { detail: { config: config } });
          document.dispatchEvent(event);
          
          return config;
        })
        .catch(error => {
          console.error('Error loading map configuration from remote source:', error);
          
          // If we haven't set mapConfig yet and fallback is available, use it
          if (!window.mapConfig && window.defaultMapConfig) {
            console.warn('Using fallback map configuration');
            window.mapConfig = window.defaultMapConfig;
            
            // Call the callback if provided and not already called
            if (typeof callback === 'function' && !window._callbackCalled) {
              callback(window.mapConfig);
              window._callbackCalled = true;
            }
            
            return window.mapConfig;
          } else if (window.mapConfig) {
            // We already set it from defaultMapConfig above, so just return it
            return window.mapConfig;
          }
          
          // No fallback available, propagate the error
          throw error;
        })
        .finally(() => {
          // Clear the promise reference to allow future reloads
          loadPromise = null;
        });
      
      return loadPromise;
    }
    
    /**
     * Gets the map configuration synchronously if already loaded
     * 
     * @returns {Object|null} The map configuration or null if not loaded
     */
    function getMapConfig() {
      return window.mapConfig || null;
    }
    
    /**
     * Check if the map configuration is loaded
     * 
     * @returns {boolean} Whether the configuration is loaded
     */
    function isConfigLoaded() {
      return window.mapConfig !== undefined && window.mapConfig !== null;
    }
    
    /**
     * Reload the map configuration from the remote source
     * Useful for refreshing after configuration changes
     * 
     * @param {string} url - Optional URL to override the default
     * @returns {Promise} Promise that resolves with the fresh config
     */
    function reloadMapConfig(url = defaultConfigUrl) {
      // Clear the loaded flag to force a reload
      window._mapConfigFullyLoaded = false;
      window._callbackCalled = false;
      
      // Call the regular load function
      return loadMapConfig(url);
    }
    
    // Make functions available globally
    window.loadMapConfig = loadMapConfig;
    window.getMapConfig = getMapConfig;
    window.isMapConfigLoaded = isConfigLoaded;
    window.reloadMapConfig = reloadMapConfig;
    
    // Initialize immediately if defaultMapConfig is available
    if (window.defaultMapConfig && !window.mapConfig) {
      window.mapConfig = window.defaultMapConfig;
      console.log('Initialized window.mapConfig with defaultMapConfig');
    }
    
    // Auto-load on script inclusion to start fetching the remote config
    loadMapConfig();
  })();
  
  console.log('mapConfigLoader.js executed - async loading started');