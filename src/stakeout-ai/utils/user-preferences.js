/**
 * User Preferences Manager for StakeOut AI
 * Manages user preferences with local storage persistence
 */
class UserPreferences {
    constructor() {
        this.storageKey = 'stakeout-ai-preferences';
        this.defaults = {
            // Autozoom preferences
            autozoom: {
                enabled: true,
                smoothTransitions: true,
                predictiveZoom: true,
                zoomSensitivity: 1.0,
                preferCircleFit: false,
                manualOverrideTimeout: 5000
            },
            
            // Performance preferences
            performance: {
                updateRate: 100,           // ms between updates
                enableGPU: true,
                batteryOptimization: false,
                reducedMotion: false
            },
            
            // Visual preferences
            visual: {
                arEnhancements: true,
                glowEffects: true,
                animationSpeed: 1.0,
                transparencyLevel: 0.9,
                colorScheme: 'auto'       // auto, light, dark
            },
            
            // Behavior preferences
            behavior: {
                autoStartStakeout: false,
                rememberLastMode: true,
                hapticFeedback: true,
                audioAlerts: false,
                proximityAlerts: {
                    enabled: true,
                    distances: [50, 10, 5, 1] // meters
                }
            },
            
            // ML preferences
            ml: {
                enablePredictions: true,
                personalizedLearning: true,
                shareAnonymousData: false,
                modelUpdateFrequency: 'auto' // auto, daily, weekly, never
            }
        };
        
        this.preferences = this.load();
        this.listeners = new Set();
    }
    
    /**
     * Load preferences from storage
     */
    load() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Deep merge with defaults to ensure all keys exist
                return this.deepMerge(this.defaults, parsed);
            }
        } catch (error) {
            console.error('[UserPreferences] Failed to load preferences:', error);
        }
        
        return { ...this.defaults };
    }
    
    /**
     * Save preferences to storage
     */
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
            this.notifyListeners();
            return true;
        } catch (error) {
            console.error('[UserPreferences] Failed to save preferences:', error);
            return false;
        }
    }
    
    /**
     * Get a preference value
     * @param {string} path - Dot notation path (e.g., 'autozoom.enabled')
     */
    get(path) {
        const keys = path.split('.');
        let value = this.preferences;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }
        
        return value;
    }
    
    /**
     * Set a preference value
     * @param {string} path - Dot notation path
     * @param {*} value - Value to set
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let target = this.preferences;
        
        for (const key of keys) {
            if (!(key in target) || typeof target[key] !== 'object') {
                target[key] = {};
            }
            target = target[key];
        }
        
        target[lastKey] = value;
        this.save();
    }
    
    /**
     * Update multiple preferences at once
     * @param {Object} updates - Object with preference updates
     */
    update(updates) {
        this.preferences = this.deepMerge(this.preferences, updates);
        this.save();
    }
    
    /**
     * Reset preferences to defaults
     * @param {string} category - Optional category to reset (e.g., 'autozoom')
     */
    reset(category = null) {
        if (category && category in this.defaults) {
            this.preferences[category] = { ...this.defaults[category] };
        } else {
            this.preferences = { ...this.defaults };
        }
        this.save();
    }
    
    /**
     * Get all preferences
     */
    getAll() {
        return { ...this.preferences };
    }
    
    /**
     * Export preferences as JSON
     */
    export() {
        return JSON.stringify(this.preferences, null, 2);
    }
    
    /**
     * Import preferences from JSON
     * @param {string} json - JSON string of preferences
     */
    import(json) {
        try {
            const imported = JSON.parse(json);
            this.preferences = this.deepMerge(this.defaults, imported);
            this.save();
            return true;
        } catch (error) {
            console.error('[UserPreferences] Failed to import preferences:', error);
            return false;
        }
    }
    
    /**
     * Add a listener for preference changes
     * @param {Function} callback - Callback function
     */
    onChange(callback) {
        this.listeners.add(callback);
        
        // Return unsubscribe function
        return () => {
            this.listeners.delete(callback);
        };
    }
    
    /**
     * Notify all listeners of changes
     */
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.preferences);
            } catch (error) {
                console.error('[UserPreferences] Listener error:', error);
            }
        });
    }
    
    /**
     * Deep merge two objects
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     */
    deepMerge(target, source) {
        const output = { ...target };
        
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        output[key] = source[key];
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    output[key] = source[key];
                }
            });
        }
        
        return output;
    }
    
    /**
     * Check if value is a plain object
     */
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
    
    /**
     * Get preference schema for UI generation
     */
    getSchema() {
        return {
            autozoom: {
                title: 'Auto Zoom',
                properties: {
                    enabled: { type: 'boolean', title: 'Enable Auto Zoom' },
                    smoothTransitions: { type: 'boolean', title: 'Smooth Transitions' },
                    predictiveZoom: { type: 'boolean', title: 'Predictive Zoom' },
                    zoomSensitivity: { 
                        type: 'number', 
                        title: 'Zoom Sensitivity', 
                        min: 0.5, 
                        max: 2.0, 
                        step: 0.1 
                    },
                    preferCircleFit: { type: 'boolean', title: 'Prefer Circle Fit Algorithm' }
                }
            },
            performance: {
                title: 'Performance',
                properties: {
                    updateRate: { 
                        type: 'number', 
                        title: 'Update Rate (ms)', 
                        min: 50, 
                        max: 500, 
                        step: 50 
                    },
                    enableGPU: { type: 'boolean', title: 'Enable GPU Acceleration' },
                    batteryOptimization: { type: 'boolean', title: 'Battery Optimization' },
                    reducedMotion: { type: 'boolean', title: 'Reduced Motion' }
                }
            },
            visual: {
                title: 'Visual Effects',
                properties: {
                    arEnhancements: { type: 'boolean', title: 'AR Enhancements' },
                    glowEffects: { type: 'boolean', title: 'Glow Effects' },
                    animationSpeed: { 
                        type: 'number', 
                        title: 'Animation Speed', 
                        min: 0.5, 
                        max: 2.0, 
                        step: 0.1 
                    },
                    colorScheme: { 
                        type: 'select', 
                        title: 'Color Scheme',
                        options: ['auto', 'light', 'dark']
                    }
                }
            }
        };
    }
}

// Create singleton instance
const userPreferences = new UserPreferences();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = userPreferences;
} else {
    window.UserPreferences = userPreferences;
}