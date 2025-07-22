/**
 * Performance Monitor for StakeOut AI
 * Tracks and optimizes system performance in real-time
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: {
                current: 60,
                average: 60,
                min: 60,
                max: 60,
                samples: []
            },
            renderTime: {
                current: 0,
                average: 0,
                max: 0,
                samples: []
            },
            memoryUsage: {
                current: 0,
                limit: 0,
                percentage: 0
            },
            gpuTime: {
                current: 0,
                average: 0,
                samples: []
            }
        };
        
        this.config = {
            sampleSize: 60,          // Keep last 60 samples (1 second at 60fps)
            updateInterval: 100,     // Update metrics every 100ms
            lowFPSThreshold: 30,     // Trigger optimization below 30 FPS
            highRenderThreshold: 16  // Trigger optimization above 16ms render time
        };
        
        this.optimizationCallbacks = new Set();
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.isMonitoring = false;
        
        // WebGL performance extension
        this.glPerformance = null;
    }
    
    /**
     * Start monitoring performance
     */
    start() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.lastFrameTime = performance.now();
        
        // Set up WebGL performance monitoring if available
        this.setupWebGLMonitoring();
        
        // Start the monitoring loop
        this.monitor();
        
        // Start periodic metric updates
        this.updateInterval = setInterval(() => {
            this.updateMetrics();
        }, this.config.updateInterval);
        
        console.log('[PerformanceMonitor] Started monitoring');
    }
    
    /**
     * Stop monitoring
     */
    stop() {
        this.isMonitoring = false;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('[PerformanceMonitor] Stopped monitoring');
    }
    
    /**
     * Main monitoring loop
     */
    monitor() {
        if (!this.isMonitoring) return;
        
        const now = performance.now();
        const frameTime = now - this.lastFrameTime;
        
        // Update FPS
        this.updateFPS(frameTime);
        
        // Update render time
        this.updateRenderTime(frameTime);
        
        this.lastFrameTime = now;
        this.frameCount++;
        
        // Continue monitoring
        requestAnimationFrame(() => this.monitor());
    }
    
    /**
     * Update FPS metrics
     */
    updateFPS(frameTime) {
        const fps = Math.min(1000 / frameTime, 120); // Cap at 120 FPS
        
        this.metrics.fps.current = fps;
        this.metrics.fps.samples.push(fps);
        
        // Keep only recent samples
        if (this.metrics.fps.samples.length > this.config.sampleSize) {
            this.metrics.fps.samples.shift();
        }
        
        // Update statistics
        this.metrics.fps.average = this.calculateAverage(this.metrics.fps.samples);
        this.metrics.fps.min = Math.min(...this.metrics.fps.samples);
        this.metrics.fps.max = Math.max(...this.metrics.fps.samples);
        
        // Check if optimization is needed
        if (fps < this.config.lowFPSThreshold) {
            this.triggerOptimization('lowFPS', { fps });
        }
    }
    
    /**
     * Update render time metrics
     */
    updateRenderTime(frameTime) {
        this.metrics.renderTime.current = frameTime;
        this.metrics.renderTime.samples.push(frameTime);
        
        if (this.metrics.renderTime.samples.length > this.config.sampleSize) {
            this.metrics.renderTime.samples.shift();
        }
        
        this.metrics.renderTime.average = this.calculateAverage(this.metrics.renderTime.samples);
        this.metrics.renderTime.max = Math.max(...this.metrics.renderTime.samples);
        
        // Check if optimization is needed
        if (frameTime > this.config.highRenderThreshold) {
            this.triggerOptimization('highRenderTime', { renderTime: frameTime });
        }
    }
    
    /**
     * Update memory usage metrics
     */
    updateMetrics() {
        // Update memory usage if available
        if (performance.memory) {
            this.metrics.memoryUsage.current = performance.memory.usedJSHeapSize;
            this.metrics.memoryUsage.limit = performance.memory.jsHeapSizeLimit;
            this.metrics.memoryUsage.percentage = 
                (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
        }
        
        // Update GPU metrics if available
        if (this.glPerformance) {
            this.updateGPUMetrics();
        }
    }
    
    /**
     * Set up WebGL performance monitoring
     */
    setupWebGLMonitoring() {
        try {
            // Get MapLibre's WebGL context
            if (window.App && window.App.Map && window.App.Map.Init) {
                const map = window.App.Map.Init.getMap();
                if (map && map.painter && map.painter.context && map.painter.context.gl) {
                    const gl = map.painter.context.gl;
                    
                    // Try to get the EXT_disjoint_timer_query extension
                    this.glPerformance = gl.getExtension('EXT_disjoint_timer_query') ||
                                        gl.getExtension('EXT_disjoint_timer_query_webgl2');
                    
                    if (this.glPerformance) {
                        console.log('[PerformanceMonitor] WebGL performance monitoring enabled');
                    }
                }
            }
        } catch (error) {
            console.warn('[PerformanceMonitor] Could not enable WebGL monitoring:', error);
        }
    }
    
    /**
     * Update GPU metrics
     */
    updateGPUMetrics() {
        // Placeholder for GPU metrics
        // In production, would use WebGL timing queries
        this.metrics.gpuTime.current = 0;
        this.metrics.gpuTime.samples.push(0);
        
        if (this.metrics.gpuTime.samples.length > this.config.sampleSize) {
            this.metrics.gpuTime.samples.shift();
        }
        
        this.metrics.gpuTime.average = this.calculateAverage(this.metrics.gpuTime.samples);
    }
    
    /**
     * Calculate average of samples
     */
    calculateAverage(samples) {
        if (samples.length === 0) return 0;
        return samples.reduce((a, b) => a + b, 0) / samples.length;
    }
    
    /**
     * Register optimization callback
     */
    onOptimizationNeeded(callback) {
        this.optimizationCallbacks.add(callback);
    }
    
    /**
     * Trigger optimization
     */
    triggerOptimization(reason, data) {
        const optimization = {
            reason,
            data,
            timestamp: Date.now(),
            metrics: this.getMetrics()
        };
        
        this.optimizationCallbacks.forEach(callback => {
            try {
                callback(optimization);
            } catch (error) {
                console.error('[PerformanceMonitor] Optimization callback error:', error);
            }
        });
    }
    
    /**
     * Get current metrics
     */
    getMetrics() {
        return {
            fps: {
                current: Math.round(this.metrics.fps.current),
                average: Math.round(this.metrics.fps.average),
                min: Math.round(this.metrics.fps.min),
                max: Math.round(this.metrics.fps.max)
            },
            renderTime: {
                current: Math.round(this.metrics.renderTime.current * 10) / 10,
                average: Math.round(this.metrics.renderTime.average * 10) / 10,
                max: Math.round(this.metrics.renderTime.max * 10) / 10
            },
            memoryUsage: {
                current: Math.round(this.metrics.memoryUsage.current / 1048576), // MB
                limit: Math.round(this.metrics.memoryUsage.limit / 1048576), // MB
                percentage: Math.round(this.metrics.memoryUsage.percentage)
            },
            gpuTime: {
                current: Math.round(this.metrics.gpuTime.current * 10) / 10,
                average: Math.round(this.metrics.gpuTime.average * 10) / 10
            },
            frameCount: this.frameCount
        };
    }
    
    /**
     * Get performance score (0-100)
     */
    getPerformanceScore() {
        const fpsScore = Math.min(this.metrics.fps.average / 60, 1) * 40; // 40% weight
        const renderScore = Math.max(0, 1 - (this.metrics.renderTime.average / 16.67)) * 40; // 40% weight
        const memoryScore = Math.max(0, 1 - (this.metrics.memoryUsage.percentage / 100)) * 20; // 20% weight
        
        const score = Math.round(fpsScore + renderScore + memoryScore);
        
        // Update battery manager with performance score
        if (window.BatteryManager) {
            window.BatteryManager.updatePerformanceScore(score);
        }
        
        return score;
    }
    
    /**
     * Get optimization recommendations
     */
    getOptimizationRecommendations() {
        const recommendations = [];
        
        if (this.metrics.fps.average < 30) {
            recommendations.push({
                type: 'critical',
                message: 'Low FPS detected',
                suggestion: 'Reduce map layer complexity or disable animations'
            });
        }
        
        if (this.metrics.renderTime.average > 16.67) {
            recommendations.push({
                type: 'warning',
                message: 'High render time',
                suggestion: 'Optimize WebGL shaders or reduce feature count'
            });
        }
        
        if (this.metrics.memoryUsage.percentage > 80) {
            recommendations.push({
                type: 'warning',
                message: 'High memory usage',
                suggestion: 'Clear unused data or reduce cache size'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Reset metrics
     */
    reset() {
        this.metrics.fps.samples = [];
        this.metrics.renderTime.samples = [];
        this.metrics.gpuTime.samples = [];
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
    }
    
    /**
     * Destroy and cleanup
     */
    destroy() {
        this.stop();
        this.optimizationCallbacks.clear();
        this.reset();
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
} else {
    window.PerformanceMonitor = PerformanceMonitor;
}