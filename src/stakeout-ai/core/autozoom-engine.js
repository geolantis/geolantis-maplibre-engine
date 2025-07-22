/**
 * Distance-based Autozoom Engine for Stakeout
 * Provides intelligent zoom control based on distance to target
 */
class AutozoomEngine {
    constructor(map) {
        this.map = map;
        this.enabled = true;
        this.isAnimating = false;
        
        // Zoom level configuration based on distance (meters)
        this.zoomLevels = [
            { distance: 5, zoom: 20 },      // Very close: max zoom
            { distance: 10, zoom: 19 },
            { distance: 25, zoom: 18 },
            { distance: 50, zoom: 17 },
            { distance: 100, zoom: 16 },
            { distance: 200, zoom: 15 },
            { distance: 500, zoom: 14 },
            { distance: 1000, zoom: 13 },
            { distance: 2000, zoom: 12 },
            { distance: 5000, zoom: 11 },
            { distance: 10000, zoom: 10 }   // Far away: overview
        ];
        
        // Smooth zoom configuration
        this.smoothZoomConfig = {
            duration: 750,              // Animation duration in ms
            easing: 'ease-in-out',
            threshold: 0.5              // Minimum zoom level change to trigger animation
        };
        
        // Performance optimization
        this.lastUpdate = 0;
        this.updateInterval = 100;      // Minimum ms between updates
        
        // Load user preferences
        this.loadUserPreferences();
        
        this.currentDistance = null;
        this.targetZoom = null;
        
        // Velocity tracking
        this.velocityTracking = {
            samples: [],
            maxSamples: 5,
            lastPosition: null,
            lastTime: null,
            currentVelocity: 0,
            averageVelocity: 0
        };
        
        // Predictive zoom configuration
        this.predictiveConfig = {
            lookAheadTime: 2000,        // Look ahead 2 seconds
            velocityThreshold: 0.5,     // Minimum velocity (m/s) to trigger prediction
            accelerationFactor: 1.5,    // How much to adjust zoom based on acceleration
            decelerationFactor: 0.8     // How much to adjust zoom when slowing down
        };
    }
    
    /**
     * Calculate optimal zoom level based on distance
     * @param {number} distance - Distance to target in meters
     * @returns {number} Optimal zoom level
     */
    calculateOptimalZoom(distance) {
        // Find appropriate zoom level based on distance
        for (let i = 0; i < this.zoomLevels.length; i++) {
            if (distance <= this.zoomLevels[i].distance) {
                // Apply user sensitivity preference
                const baseZoom = this.zoomLevels[i].zoom;
                const adjustedZoom = baseZoom * this.preferences.zoomSensitivity;
                return Math.min(Math.max(adjustedZoom, this.map.getMinZoom()), this.map.getMaxZoom());
            }
        }
        
        // Default to minimum zoom for very far distances
        return this.map.getMinZoom();
    }
    
    /**
     * Update zoom based on distance to target
     * @param {number} distance - Distance to target in meters
     * @param {Object} options - Additional options (velocity, bearing, etc.)
     */
    updateZoom(distance, options = {}) {
        if (!this.enabled || !this.preferences.autoZoomEnabled) return;
        
        // Throttle updates for performance
        const now = Date.now();
        if (now - this.lastUpdate < this.updateInterval) return;
        this.lastUpdate = now;
        
        // Update velocity tracking if position provided
        if (options.currentPosition) {
            this.updateVelocity(options.currentPosition, now);
        }
        
        this.currentDistance = distance;
        let optimalZoom = this.calculateOptimalZoom(distance);
        
        // Apply predictive zoom if enabled and velocity available
        if (this.preferences.predictiveZoom && 
            (options.velocity !== undefined || this.velocityTracking.averageVelocity > 0)) {
            optimalZoom = this.applyPredictiveZoom(optimalZoom, distance, options);
        }
        
        const currentZoom = this.map.getZoom();
        const zoomDifference = Math.abs(optimalZoom - currentZoom);
        
        // Only update if change is significant
        if (zoomDifference >= this.smoothZoomConfig.threshold) {
            this.targetZoom = optimalZoom;
            
            if (this.preferences.smoothTransitions && !this.isAnimating) {
                this.animateZoom(optimalZoom, options);
            } else if (!this.preferences.smoothTransitions) {
                this.map.setZoom(optimalZoom);
            }
        }
    }
    
    /**
     * Update velocity tracking
     * @param {Array} currentPosition - Current [lng, lat] position
     * @param {number} currentTime - Current timestamp
     */
    updateVelocity(currentPosition, currentTime) {
        if (this.velocityTracking.lastPosition && this.velocityTracking.lastTime) {
            // Calculate distance moved
            const distance = turf.distance(
                turf.point(this.velocityTracking.lastPosition),
                turf.point(currentPosition),
                { units: "meters" }
            );
            
            // Calculate time elapsed in seconds
            const timeElapsed = (currentTime - this.velocityTracking.lastTime) / 1000;
            
            // Calculate velocity in m/s
            if (timeElapsed > 0) {
                const velocity = distance / timeElapsed;
                
                // Add to samples
                this.velocityTracking.samples.push(velocity);
                if (this.velocityTracking.samples.length > this.velocityTracking.maxSamples) {
                    this.velocityTracking.samples.shift();
                }
                
                // Update current and average velocity
                this.velocityTracking.currentVelocity = velocity;
                this.velocityTracking.averageVelocity = 
                    this.velocityTracking.samples.reduce((a, b) => a + b, 0) / 
                    this.velocityTracking.samples.length;
            }
        }
        
        this.velocityTracking.lastPosition = currentPosition;
        this.velocityTracking.lastTime = currentTime;
    }
    
    /**
     * Apply predictive zoom based on velocity
     * @param {number} baseZoom - Base zoom level from distance
     * @param {number} currentDistance - Current distance to target
     * @param {Object} options - Options including velocity
     * @returns {number} Adjusted zoom level
     */
    applyPredictiveZoom(baseZoom, currentDistance, options) {
        const velocity = options.velocity || this.velocityTracking.averageVelocity;
        
        // Skip prediction if velocity is too low
        if (velocity < this.predictiveConfig.velocityThreshold) {
            return baseZoom;
        }
        
        // Calculate predicted distance based on velocity
        const lookAheadSeconds = this.predictiveConfig.lookAheadTime / 1000;
        const predictedDistanceChange = velocity * lookAheadSeconds;
        const predictedDistance = Math.max(0, currentDistance - predictedDistanceChange);
        
        // Calculate zoom for predicted position
        const predictedZoom = this.calculateOptimalZoom(predictedDistance);
        
        // Check if accelerating or decelerating
        const isAccelerating = this.velocityTracking.currentVelocity > 
                              this.velocityTracking.averageVelocity;
        
        // Apply acceleration/deceleration factor
        const factor = isAccelerating ? 
            this.predictiveConfig.accelerationFactor : 
            this.predictiveConfig.decelerationFactor;
        
        // Blend between current and predicted zoom
        const blendedZoom = baseZoom + (predictedZoom - baseZoom) * factor;
        
        // Ensure zoom stays within bounds
        return Math.min(Math.max(blendedZoom, this.map.getMinZoom()), this.map.getMaxZoom());
    }
    
    /**
     * Calculate zoom to fit both current position and target with padding
     * @param {Array} currentPosition - Current [lng, lat] position
     * @param {Array} targetPosition - Target [lng, lat] position
     * @param {Object} options - Options including padding
     * @returns {number} Optimal zoom level
     */
    calculateCircleFitZoom(currentPosition, targetPosition, options = {}) {
        // Default padding in pixels
        const padding = options.padding || {
            top: 100,
            bottom: 250,    // More padding for bottom due to UI
            left: 50,
            right: 50
        };
        
        // Create bounds that include both positions
        const bounds = new maplibregl.LngLatBounds()
            .extend(currentPosition)
            .extend(targetPosition);
        
        // Get the center point between positions
        const center = bounds.getCenter();
        
        // Calculate the distance between points
        const distance = turf.distance(
            turf.point(currentPosition),
            turf.point(targetPosition),
            { units: "meters" }
        );
        
        // Add a circular buffer around the bounds
        // This ensures we see context around both points
        const bufferDistance = Math.max(distance * 0.2, 10); // 20% buffer or minimum 10m
        
        // Create circle around current position
        const currentCircle = turf.circle(turf.point(currentPosition), bufferDistance, {
            units: 'meters',
            steps: 8
        });
        
        // Create circle around target position
        const targetCircle = turf.circle(turf.point(targetPosition), bufferDistance, {
            units: 'meters',
            steps: 8
        });
        
        // Extend bounds to include both circles
        turf.coordAll(currentCircle).forEach(coord => bounds.extend(coord));
        turf.coordAll(targetCircle).forEach(coord => bounds.extend(coord));
        
        // Calculate the required zoom level
        const canvas = this.map.getCanvas();
        const width = canvas.width - padding.left - padding.right;
        const height = canvas.height - padding.top - padding.bottom;
        
        // Get bounds dimensions in degrees
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const lngSpan = ne.lng - sw.lng;
        const latSpan = ne.lat - sw.lat;
        
        // Calculate zoom levels for width and height
        const zoomX = Math.log2(360 / lngSpan * width / 256);
        const zoomY = Math.log2(180 / latSpan * height / 256);
        
        // Use the smaller zoom to ensure everything fits
        let zoom = Math.min(zoomX, zoomY);
        
        // Apply user sensitivity
        zoom *= this.preferences.zoomSensitivity;
        
        // Ensure zoom is within valid range
        zoom = Math.min(Math.max(zoom, this.map.getMinZoom()), this.map.getMaxZoom());
        
        return zoom;
    }
    
    /**
     * Update zoom using circle-fit algorithm
     * @param {Array} currentPosition - Current [lng, lat] position
     * @param {Array} targetPosition - Target [lng, lat] position
     * @param {Object} options - Additional options
     */
    updateZoomCircleFit(currentPosition, targetPosition, options = {}) {
        if (!this.enabled || !this.preferences.autoZoomEnabled) return;
        
        const optimalZoom = this.calculateCircleFitZoom(currentPosition, targetPosition, options);
        const currentZoom = this.map.getZoom();
        const zoomDifference = Math.abs(optimalZoom - currentZoom);
        
        // Only update if change is significant
        if (zoomDifference >= this.smoothZoomConfig.threshold) {
            this.targetZoom = optimalZoom;
            
            // Also pan to center between points
            const bounds = new maplibregl.LngLatBounds()
                .extend(currentPosition)
                .extend(targetPosition);
            const center = bounds.getCenter();
            
            if (this.preferences.smoothTransitions && !this.isAnimating) {
                this.isAnimating = true;
                
                this.map.easeTo({
                    center: center,
                    zoom: optimalZoom,
                    duration: options.duration || this.smoothZoomConfig.duration,
                    essential: true
                });
                
                setTimeout(() => {
                    this.isAnimating = false;
                }, this.smoothZoomConfig.duration);
            } else {
                this.map.jumpTo({
                    center: center,
                    zoom: optimalZoom
                });
            }
        }
    }
    
    /**
     * Smoothly animate zoom to target level
     * @param {number} targetZoom - Target zoom level
     * @param {Object} options - Animation options
     */
    animateZoom(targetZoom, options = {}) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Use MapLibre's easeTo for smooth animation
        this.map.easeTo({
            zoom: targetZoom,
            duration: options.duration || this.smoothZoomConfig.duration,
            easing: (t) => {
                // Custom easing function for smooth deceleration
                return t < 0.5 
                    ? 2 * t * t 
                    : -1 + (4 - 2 * t) * t;
            },
            essential: true  // This animation is essential and shouldn't be interrupted
        });
        
        // Reset animation flag after completion
        setTimeout(() => {
            this.isAnimating = false;
        }, this.smoothZoomConfig.duration);
    }
    
    /**
     * Set user preferences
     * @param {Object} preferences - User preference object
     */
    setPreferences(preferences) {
        this.preferences = { ...this.preferences, ...preferences };
    }
    
    /**
     * Enable or disable autozoom
     * @param {boolean} enabled - Enable state
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.isAnimating = false;
        }
    }
    
    /**
     * Get current autozoom state
     * @returns {Object} Current state information
     */
    getState() {
        return {
            enabled: this.enabled,
            isAnimating: this.isAnimating,
            currentDistance: this.currentDistance,
            targetZoom: this.targetZoom,
            currentZoom: this.map.getZoom(),
            preferences: this.preferences,
            velocity: {
                current: this.velocityTracking.currentVelocity,
                average: this.velocityTracking.averageVelocity,
                samples: this.velocityTracking.samples.length
            }
        };
    }
    
    /**
     * Load user preferences
     */
    loadUserPreferences() {
        // Default preferences
        this.preferences = {
            autoZoomEnabled: true,
            smoothTransitions: true,
            predictiveZoom: true,
            zoomSensitivity: 1.0
        };
        
        // Try to load from UserPreferences if available
        if (window.UserPreferences) {
            const prefs = window.UserPreferences;
            this.preferences = {
                autoZoomEnabled: prefs.get('autozoom.enabled') ?? true,
                smoothTransitions: prefs.get('autozoom.smoothTransitions') ?? true,
                predictiveZoom: prefs.get('autozoom.predictiveZoom') ?? true,
                zoomSensitivity: prefs.get('autozoom.zoomSensitivity') ?? 1.0
            };
            
            // Listen for preference changes
            prefs.onChange(() => {
                this.loadUserPreferences();
            });
        }
    }
    
    /**
     * Reset autozoom engine
     */
    reset() {
        this.isAnimating = false;
        this.currentDistance = null;
        this.targetZoom = null;
        this.lastUpdate = 0;
        this.velocityTracking.samples = [];
        this.velocityTracking.currentVelocity = 0;
        this.velocityTracking.averageVelocity = 0;
    }
    
    /**
     * Destroy and cleanup
     */
    destroy() {
        this.reset();
        this.map = null;
    }
}

// Export for use in MapLibre
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutozoomEngine;
} else {
    window.AutozoomEngine = AutozoomEngine;
}