/**
 * AR-Style Visual Enhancements for StakeOut
 * Adds augmented reality-inspired visual effects
 */
class AREnhancements {
    constructor() {
        this.map = null;
        this.enabled = true;
        this.layers = new Map();
        
        // Visual effect configurations
        this.effects = {
            pulsingTarget: {
                enabled: true,
                color: '#00ff00',
                radius: 10,
                pulseSpeed: 2,
                opacity: 0.8
            },
            pathGlow: {
                enabled: true,
                color: '#00aaff',
                width: 4,
                blur: 10,
                opacity: 0.6
            },
            proximityRings: {
                enabled: true,
                distances: [1, 5, 10, 25], // meters
                colors: ['#ff0000', '#ff8800', '#ffff00', '#00ff00'],
                opacity: 0.4,
                animated: true
            },
            compassIndicator: {
                enabled: true,
                size: 100,
                opacity: 0.7,
                color: '#ffffff'
            },
            distanceLabels: {
                enabled: true,
                intervals: [10, 25, 50, 100], // meters
                fontSize: 12,
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)'
            }
        };
        
        this.animationFrameId = null;
        this.startTime = Date.now();
    }
    
    /**
     * Initialize AR enhancements
     * @param {Object} map - MapLibre GL map instance
     */
    initialize(map) {
        this.map = map;
        
        // Load user preferences
        this.loadPreferences();
        
        // Start animations
        this.startAnimations();
        
        console.log('[AREnhancements] Initialized');
    }
    
    /**
     * Load user preferences
     */
    loadPreferences() {
        if (window.UserPreferences) {
            this.enabled = window.UserPreferences.get('visual.arEnhancements') ?? true;
            
            // Listen for preference changes
            window.UserPreferences.onChange(() => {
                const newEnabled = window.UserPreferences.get('visual.arEnhancements') ?? true;
                if (newEnabled !== this.enabled) {
                    this.enabled = newEnabled;
                    if (this.enabled) {
                        this.showAll();
                    } else {
                        this.hideAll();
                    }
                }
            });
        }
    }
    
    /**
     * Create pulsing target effect at destination
     * @param {Array} position - [lng, lat] position
     */
    createPulsingTarget(position) {
        if (!this.enabled || !this.effects.pulsingTarget.enabled) return;
        
        const layerId = 'ar-pulsing-target';
        const sourceId = 'ar-pulsing-target-source';
        
        // Remove existing layer if present
        if (this.map.getLayer(layerId)) {
            this.map.removeLayer(layerId);
        }
        if (this.map.getSource(sourceId)) {
            this.map.removeSource(sourceId);
        }
        
        // Create pulsing circle
        this.map.addSource(sourceId, {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: position
                }
            }
        });
        
        this.map.addLayer({
            id: layerId,
            type: 'circle',
            source: sourceId,
            paint: {
                'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['get', 'pulse'],
                    0, this.effects.pulsingTarget.radius,
                    1, this.effects.pulsingTarget.radius * 2
                ],
                'circle-color': this.effects.pulsingTarget.color,
                'circle-opacity': [
                    'interpolate',
                    ['linear'],
                    ['get', 'pulse'],
                    0, this.effects.pulsingTarget.opacity,
                    1, 0
                ],
                'circle-blur': 0.5
            }
        });
        
        this.layers.set(layerId, { type: 'pulsing', sourceId });
    }
    
    /**
     * Create glowing path between current position and target
     * @param {Array} start - [lng, lat] start position
     * @param {Array} end - [lng, lat] end position
     */
    createGlowingPath(start, end) {
        if (!this.enabled || !this.effects.pathGlow.enabled) return;
        
        const layerId = 'ar-glowing-path';
        const sourceId = 'ar-glowing-path-source';
        
        // Remove existing
        if (this.map.getLayer(layerId)) {
            this.map.removeLayer(layerId);
        }
        if (this.map.getLayer(layerId + '-glow')) {
            this.map.removeLayer(layerId + '-glow');
        }
        if (this.map.getSource(sourceId)) {
            this.map.removeSource(sourceId);
        }
        
        // Create line
        this.map.addSource(sourceId, {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [start, end]
                }
            }
        });
        
        // Add glow layer (wider, blurred)
        this.map.addLayer({
            id: layerId + '-glow',
            type: 'line',
            source: sourceId,
            paint: {
                'line-color': this.effects.pathGlow.color,
                'line-width': this.effects.pathGlow.width * 3,
                'line-opacity': this.effects.pathGlow.opacity * 0.3,
                'line-blur': this.effects.pathGlow.blur
            }
        });
        
        // Add main line
        this.map.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            paint: {
                'line-color': this.effects.pathGlow.color,
                'line-width': this.effects.pathGlow.width,
                'line-opacity': this.effects.pathGlow.opacity,
                'line-dasharray': [2, 1]
            }
        });
        
        this.layers.set(layerId, { type: 'path', sourceId });
    }
    
    /**
     * Create proximity rings around target
     * @param {Array} position - [lng, lat] position
     */
    createProximityRings(position) {
        if (!this.enabled || !this.effects.proximityRings.enabled) return;
        
        const sourceId = 'ar-proximity-rings-source';
        
        // Remove existing rings
        this.effects.proximityRings.distances.forEach((_, index) => {
            const layerId = `ar-proximity-ring-${index}`;
            if (this.map.getLayer(layerId)) {
                this.map.removeLayer(layerId);
            }
        });
        
        if (this.map.getSource(sourceId)) {
            this.map.removeSource(sourceId);
        }
        
        // Create rings data
        const features = this.effects.proximityRings.distances.map((distance, index) => {
            const circle = turf.circle(turf.point(position), distance, {
                units: 'meters',
                steps: 64
            });
            
            return {
                type: 'Feature',
                properties: {
                    distance: distance,
                    index: index
                },
                geometry: circle.geometry
            };
        });
        
        this.map.addSource(sourceId, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: features
            }
        });
        
        // Add ring layers
        this.effects.proximityRings.distances.forEach((distance, index) => {
            const layerId = `ar-proximity-ring-${index}`;
            const color = this.effects.proximityRings.colors[index];
            
            this.map.addLayer({
                id: layerId,
                type: 'line',
                source: sourceId,
                filter: ['==', ['get', 'index'], index],
                paint: {
                    'line-color': color,
                    'line-width': 2,
                    'line-opacity': this.effects.proximityRings.opacity,
                    'line-dasharray': [5, 5]
                }
            });
            
            this.layers.set(layerId, { type: 'ring', sourceId });
        });
    }
    
    /**
     * Update compass indicator
     * @param {number} bearing - Current bearing in degrees
     */
    updateCompassIndicator(bearing) {
        if (!this.enabled || !this.effects.compassIndicator.enabled) return;
        
        // This would be implemented as a canvas overlay
        // For now, we'll store the bearing for future implementation
        this.currentBearing = bearing;
    }
    
    /**
     * Create distance labels along the path
     * @param {Array} start - [lng, lat] start position
     * @param {Array} end - [lng, lat] end position
     */
    createDistanceLabels(start, end) {
        if (!this.enabled || !this.effects.distanceLabels.enabled) return;
        
        const layerId = 'ar-distance-labels';
        const sourceId = 'ar-distance-labels-source';
        
        // Remove existing
        if (this.map.getLayer(layerId)) {
            this.map.removeLayer(layerId);
        }
        if (this.map.getSource(sourceId)) {
            this.map.removeSource(sourceId);
        }
        
        // Calculate total distance
        const totalDistance = turf.distance(
            turf.point(start),
            turf.point(end),
            { units: 'meters' }
        );
        
        // Create label points
        const features = [];
        this.effects.distanceLabels.intervals.forEach(interval => {
            if (interval < totalDistance) {
                const ratio = interval / totalDistance;
                const point = turf.along(
                    turf.lineString([start, end]),
                    interval,
                    { units: 'meters' }
                );
                
                features.push({
                    type: 'Feature',
                    properties: {
                        label: `${interval}m`
                    },
                    geometry: point.geometry
                });
            }
        });
        
        if (features.length === 0) return;
        
        this.map.addSource(sourceId, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: features
            }
        });
        
        this.map.addLayer({
            id: layerId,
            type: 'symbol',
            source: sourceId,
            layout: {
                'text-field': ['get', 'label'],
                'text-size': this.effects.distanceLabels.fontSize,
                'text-anchor': 'center',
                'text-offset': [0, -1]
            },
            paint: {
                'text-color': this.effects.distanceLabels.color,
                'text-halo-color': this.effects.distanceLabels.backgroundColor,
                'text-halo-width': 2,
                'text-halo-blur': 1
            }
        });
        
        this.layers.set(layerId, { type: 'labels', sourceId });
    }
    
    /**
     * Start animations
     */
    startAnimations() {
        const animate = () => {
            if (!this.enabled) {
                this.animationFrameId = null;
                return;
            }
            
            const elapsed = (Date.now() - this.startTime) / 1000;
            
            // Update pulsing target
            if (this.map.getSource('ar-pulsing-target-source')) {
                const pulse = (Math.sin(elapsed * this.effects.pulsingTarget.pulseSpeed) + 1) / 2;
                this.map.getSource('ar-pulsing-target-source').setData({
                    type: 'Feature',
                    properties: { pulse },
                    geometry: {
                        type: 'Point',
                        coordinates: this.map.getSource('ar-pulsing-target-source')._data.geometry.coordinates
                    }
                });
            }
            
            // Animate proximity rings
            if (this.effects.proximityRings.animated) {
                const offset = (elapsed * 10) % 100;
                this.effects.proximityRings.distances.forEach((_, index) => {
                    const layerId = `ar-proximity-ring-${index}`;
                    if (this.map.getLayer(layerId)) {
                        this.map.setPaintProperty(layerId, 'line-dasharray', [5, 5]);
                        this.map.setPaintProperty(layerId, 'line-offset', offset);
                    }
                });
            }
            
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        if (this.enabled) {
            animate();
        }
    }
    
    /**
     * Update all AR effects
     * @param {Object} data - Update data including positions
     */
    update(data) {
        if (!this.enabled) return;
        
        const { currentPosition, targetPosition, bearing } = data;
        
        if (currentPosition && targetPosition) {
            this.createPulsingTarget(targetPosition);
            this.createGlowingPath(currentPosition, targetPosition);
            this.createProximityRings(targetPosition);
            this.createDistanceLabels(currentPosition, targetPosition);
        }
        
        if (bearing !== undefined) {
            this.updateCompassIndicator(bearing);
        }
    }
    
    /**
     * Hide all AR effects
     */
    hideAll() {
        this.layers.forEach((info, layerId) => {
            if (this.map.getLayer(layerId)) {
                this.map.setLayoutProperty(layerId, 'visibility', 'none');
            }
        });
    }
    
    /**
     * Show all AR effects
     */
    showAll() {
        this.layers.forEach((info, layerId) => {
            if (this.map.getLayer(layerId)) {
                this.map.setLayoutProperty(layerId, 'visibility', 'visible');
            }
        });
    }
    
    /**
     * Clean up and destroy
     */
    destroy() {
        // Stop animations
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Remove all layers and sources
        this.layers.forEach((info, layerId) => {
            if (this.map.getLayer(layerId)) {
                this.map.removeLayer(layerId);
            }
            // Remove glow layers
            if (this.map.getLayer(layerId + '-glow')) {
                this.map.removeLayer(layerId + '-glow');
            }
        });
        
        // Remove sources
        const sources = new Set();
        this.layers.forEach(info => sources.add(info.sourceId));
        sources.forEach(sourceId => {
            if (this.map.getSource(sourceId)) {
                this.map.removeSource(sourceId);
            }
        });
        
        this.layers.clear();
        this.map = null;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AREnhancements;
} else {
    window.AREnhancements = AREnhancements;
}