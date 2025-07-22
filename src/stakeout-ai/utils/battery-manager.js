/**
 * Battery Manager and Adaptive Update Rate System
 * Dynamically adjusts update rates based on battery level and performance
 */
class BatteryManager {
    constructor() {
        this.batteryLevel = 100;
        this.isCharging = false;
        this.batteryAPI = null;
        
        // Update rate configurations (in milliseconds)
        this.updateRates = {
            performance: {
                position: 100,      // 10 Hz
                ui: 100,           // 10 Hz
                animations: 16,    // 60 FPS
                ml: 100           // 10 Hz
            },
            balanced: {
                position: 200,      // 5 Hz
                ui: 150,           // ~7 Hz
                animations: 33,    // 30 FPS
                ml: 500           // 2 Hz
            },
            batterySaver: {
                position: 500,      // 2 Hz
                ui: 300,           // ~3 Hz
                animations: 100,   // 10 FPS
                ml: 1000          // 1 Hz
            },
            critical: {
                position: 1000,     // 1 Hz
                ui: 500,           // 2 Hz
                animations: 250,   // 4 FPS
                ml: 2000          // 0.5 Hz
            }
        };
        
        // Current mode
        this.currentMode = 'balanced';
        
        // Callbacks for rate changes
        this.callbacks = new Map();
        
        // Performance metrics
        this.performanceScore = 100;
        
        // Initialize battery monitoring
        this.initBatteryMonitoring();
    }
    
    /**
     * Initialize battery monitoring
     */
    async initBatteryMonitoring() {
        try {
            // Check if Battery API is available
            if ('getBattery' in navigator) {
                this.batteryAPI = await navigator.getBattery();
                
                // Set initial values
                this.batteryLevel = Math.round(this.batteryAPI.level * 100);
                this.isCharging = this.batteryAPI.charging;
                
                // Set up event listeners
                this.batteryAPI.addEventListener('levelchange', () => {
                    this.onBatteryLevelChange();
                });
                
                this.batteryAPI.addEventListener('chargingchange', () => {
                    this.onChargingChange();
                });
                
                console.log('[BatteryManager] Battery API initialized. Level:', this.batteryLevel + '%');
            } else {
                console.log('[BatteryManager] Battery API not available, using defaults');
            }
        } catch (error) {
            console.warn('[BatteryManager] Failed to initialize battery monitoring:', error);
        }
        
        // Load preferences
        this.loadPreferences();
        
        // Start adaptive rate management
        this.startAdaptiveManagement();
    }
    
    /**
     * Load user preferences
     */
    loadPreferences() {
        if (window.UserPreferences) {
            const batteryOptimization = window.UserPreferences.get('performance.batteryOptimization') ?? false;
            
            if (batteryOptimization) {
                // If battery optimization is enabled, be more aggressive
                this.updateRates.balanced.position = 300;
                this.updateRates.balanced.ui = 200;
            }
            
            // Listen for preference changes
            window.UserPreferences.onChange(() => {
                this.loadPreferences();
                this.updateMode();
            });
        }
    }
    
    /**
     * Start adaptive management
     */
    startAdaptiveManagement() {
        // Check and update mode every 30 seconds
        setInterval(() => {
            this.updateMode();
        }, 30000);
        
        // Initial mode update
        this.updateMode();
    }
    
    /**
     * Update mode based on battery and performance
     */
    updateMode() {
        let newMode = 'balanced';
        
        // If charging, always use performance mode
        if (this.isCharging) {
            newMode = 'performance';
        }
        // Critical battery (< 10%)
        else if (this.batteryLevel < 10) {
            newMode = 'critical';
        }
        // Low battery (< 20%)
        else if (this.batteryLevel < 20) {
            newMode = 'batterySaver';
        }
        // Medium battery (< 50%) or poor performance
        else if (this.batteryLevel < 50 || this.performanceScore < 50) {
            newMode = 'balanced';
        }
        // High battery and good performance
        else if (this.batteryLevel > 80 && this.performanceScore > 80) {
            newMode = 'performance';
        }
        
        // Apply mode if changed
        if (newMode !== this.currentMode) {
            console.log(`[BatteryManager] Switching from ${this.currentMode} to ${newMode} mode`);
            this.currentMode = newMode;
            this.notifyCallbacks();
        }
    }
    
    /**
     * Handle battery level change
     */
    onBatteryLevelChange() {
        if (this.batteryAPI) {
            this.batteryLevel = Math.round(this.batteryAPI.level * 100);
            console.log('[BatteryManager] Battery level changed:', this.batteryLevel + '%');
            this.updateMode();
        }
    }
    
    /**
     * Handle charging state change
     */
    onChargingChange() {
        if (this.batteryAPI) {
            this.isCharging = this.batteryAPI.charging;
            console.log('[BatteryManager] Charging state changed:', this.isCharging);
            this.updateMode();
        }
    }
    
    /**
     * Update performance score
     * @param {number} score - Performance score (0-100)
     */
    updatePerformanceScore(score) {
        this.performanceScore = Math.max(0, Math.min(100, score));
        
        // If performance is critically low, force update
        if (this.performanceScore < 30) {
            this.updateMode();
        }
    }
    
    /**
     * Get current update rate for a component
     * @param {string} component - Component name (position, ui, animations, ml)
     */
    getUpdateRate(component) {
        return this.updateRates[this.currentMode][component] || 100;
    }
    
    /**
     * Get all current update rates
     */
    getCurrentRates() {
        return {
            mode: this.currentMode,
            rates: this.updateRates[this.currentMode],
            batteryLevel: this.batteryLevel,
            isCharging: this.isCharging,
            performanceScore: this.performanceScore
        };
    }
    
    /**
     * Register callback for rate changes
     * @param {string} id - Callback ID
     * @param {Function} callback - Callback function
     */
    onRateChange(id, callback) {
        this.callbacks.set(id, callback);
        
        // Return unsubscribe function
        return () => {
            this.callbacks.delete(id);
        };
    }
    
    /**
     * Notify all callbacks of rate changes
     */
    notifyCallbacks() {
        const rates = this.getCurrentRates();
        
        this.callbacks.forEach(callback => {
            try {
                callback(rates);
            } catch (error) {
                console.error('[BatteryManager] Callback error:', error);
            }
        });
    }
    
    /**
     * Force a specific mode (for testing)
     * @param {string} mode - Mode to force
     */
    forceMode(mode) {
        if (mode in this.updateRates) {
            this.currentMode = mode;
            this.notifyCallbacks();
            console.log('[BatteryManager] Forced mode:', mode);
        }
    }
    
    /**
     * Get battery status
     */
    getStatus() {
        return {
            level: this.batteryLevel,
            isCharging: this.isCharging,
            mode: this.currentMode,
            performanceScore: this.performanceScore,
            hasBatteryAPI: this.batteryAPI !== null
        };
    }
    
    /**
     * Create adaptive interval
     * @param {Function} callback - Function to call
     * @param {string} component - Component name for rate
     * @returns {Object} Interval controller
     */
    createAdaptiveInterval(callback, component) {
        let intervalId = null;
        let currentRate = this.getUpdateRate(component);
        
        const start = () => {
            if (intervalId) clearInterval(intervalId);
            currentRate = this.getUpdateRate(component);
            intervalId = setInterval(callback, currentRate);
        };
        
        const stop = () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        };
        
        // Listen for rate changes
        const unsubscribe = this.onRateChange(`interval-${component}-${Date.now()}`, (rates) => {
            const newRate = rates.rates[component];
            if (newRate !== currentRate && intervalId) {
                console.log(`[BatteryManager] Updating ${component} interval: ${currentRate}ms -> ${newRate}ms`);
                start(); // Restart with new rate
            }
        });
        
        // Start interval
        start();
        
        return {
            stop: () => {
                stop();
                unsubscribe();
            },
            restart: start,
            getRate: () => currentRate
        };
    }
}

// Create singleton instance
const batteryManager = new BatteryManager();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = batteryManager;
} else {
    window.BatteryManager = batteryManager;
}