/**
 * Performance Dashboard UI Component
 * @namespace App.UI.PerformanceDashboard
 * 
 * Provides real-time visualization of MapLibre performance metrics
 * to help identify and debug performance bottlenecks.
 */
App.UI = App.UI || {};
App.UI.PerformanceDashboard = (function() {
    // Private variables
    var _container = null;
    var _updateInterval = null;
    var _isVisible = false;
    var _chartData = {
        fps: [],
        memory: [],
        operations: []
    };
    
    /**
     * Create the dashboard HTML structure
     * @private
     */
    function createDashboard() {
        // Remove existing dashboard if present
        const existing = document.getElementById('performance-dashboard');
        if (existing) {
            existing.remove();
        }
        
        // Create dashboard container
        _container = document.createElement('div');
        _container.id = 'performance-dashboard';
        _container.className = 'performance-dashboard';
        _container.innerHTML = `
            <div class="perf-header">
                <h3>Performance Monitor</h3>
                <div class="perf-controls">
                    <sl-button size="small" variant="text" id="perf-minimize">
                        <sl-icon name="dash"></sl-icon>
                    </sl-button>
                    <sl-button size="small" variant="text" id="perf-close">
                        <sl-icon name="x"></sl-icon>
                    </sl-button>
                </div>
            </div>
            
            <div class="perf-content">
                <!-- Real-time metrics -->
                <div class="perf-metrics">
                    <div class="perf-metric">
                        <span class="metric-label">FPS</span>
                        <span class="metric-value" id="perf-fps">--</span>
                    </div>
                    <div class="perf-metric">
                        <span class="metric-label">Memory</span>
                        <span class="metric-value" id="perf-memory">--</span>
                    </div>
                    <div class="perf-metric">
                        <span class="metric-label">Layers</span>
                        <span class="metric-value" id="perf-layers">--</span>
                    </div>
                    <div class="perf-metric">
                        <span class="metric-label">Sources</span>
                        <span class="metric-value" id="perf-sources">--</span>
                    </div>
                </div>
                
                <!-- GNSS Update Interval -->
                <div class="perf-metrics" style="margin-top: 8px;">
                    <div class="perf-metric" style="grid-column: span 2;">
                        <span class="metric-label">GNSS Update</span>
                        <span class="metric-value" id="perf-gnss-interval">--</span>
                    </div>
                    <div class="perf-metric" style="grid-column: span 2;">
                        <span class="metric-label">Last GPS</span>
                        <span class="metric-value" id="perf-last-gps">--</span>
                    </div>
                </div>
                
                <!-- Performance graph -->
                <div class="perf-graph">
                    <canvas id="perf-fps-chart" width="300" height="100"></canvas>
                </div>
                
                <!-- Recent operations -->
                <div class="perf-operations">
                    <h4>Recent Operations</h4>
                    <div id="perf-operations-list" class="operations-list"></div>
                </div>
                
                <!-- Warnings -->
                <div class="perf-warnings">
                    <h4>Performance Warnings</h4>
                    <div id="perf-warnings-list" class="warnings-list"></div>
                </div>
                
                <!-- Actions -->
                <div class="perf-actions">
                    <sl-button size="small" variant="primary" id="perf-export">
                        Export Report
                    </sl-button>
                    <sl-button size="small" variant="neutral" id="perf-clear">
                        Clear Data
                    </sl-button>
                </div>
            </div>
        `;
        
        // Add styles
        addStyles();
        
        // Append to body
        document.body.appendChild(_container);
        
        // Set up event listeners
        setupEventListeners();
    }
    
    /**
     * Add CSS styles for the dashboard
     * @private
     */
    function addStyles() {
        const styleId = 'performance-dashboard-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .performance-dashboard {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 350px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
            }
            
            .performance-dashboard.minimized {
                height: 50px;
                overflow: hidden;
            }
            
            .perf-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                border-bottom: 1px solid #e0e0e0;
                background: rgba(70, 130, 180, 0.1);
                border-radius: 8px 8px 0 0;
            }
            
            .perf-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #333;
            }
            
            .perf-controls {
                display: flex;
                gap: 4px;
            }
            
            .perf-content {
                padding: 16px;
            }
            
            .perf-metrics {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
                margin-bottom: 16px;
            }
            
            .perf-metric {
                text-align: center;
                padding: 8px;
                background: #f5f5f5;
                border-radius: 6px;
            }
            
            .metric-label {
                display: block;
                font-size: 11px;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .metric-value {
                display: block;
                font-size: 20px;
                font-weight: 600;
                color: #333;
                margin-top: 4px;
            }
            
            .metric-value.good {
                color: #4caf50;
            }
            
            .metric-value.warning {
                color: #ff9800;
            }
            
            .metric-value.bad {
                color: #f44336;
            }
            
            .perf-graph {
                margin-bottom: 16px;
                padding: 8px;
                background: #f9f9f9;
                border-radius: 6px;
            }
            
            .perf-graph canvas {
                width: 100%;
                height: 100px;
            }
            
            .perf-operations, .perf-warnings {
                margin-bottom: 16px;
            }
            
            .perf-operations h4, .perf-warnings h4 {
                font-size: 13px;
                font-weight: 600;
                color: #333;
                margin: 0 0 8px 0;
            }
            
            .operations-list, .warnings-list {
                max-height: 120px;
                overflow-y: auto;
                font-size: 12px;
                color: #666;
            }
            
            .operation-item, .warning-item {
                padding: 6px 8px;
                margin-bottom: 4px;
                background: #f5f5f5;
                border-radius: 4px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .operation-item.slow {
                background: #fff3cd;
                color: #856404;
            }
            
            .warning-item {
                background: #f8d7da;
                color: #721c24;
            }
            
            .operation-time, .warning-time {
                font-weight: 600;
                font-size: 11px;
            }
            
            .perf-actions {
                display: flex;
                gap: 8px;
                justify-content: flex-end;
            }
            
            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .performance-dashboard {
                    background: rgba(32, 32, 32, 0.95);
                    color: #e0e0e0;
                }
                
                .perf-header {
                    background: rgba(70, 130, 180, 0.2);
                    border-bottom-color: #444;
                }
                
                .perf-header h3 {
                    color: #e0e0e0;
                }
                
                .perf-metric {
                    background: #2a2a2a;
                }
                
                .metric-label {
                    color: #999;
                }
                
                .metric-value {
                    color: #e0e0e0;
                }
                
                .perf-graph {
                    background: #2a2a2a;
                }
                
                .operation-item, .warning-item {
                    background: #2a2a2a;
                    color: #e0e0e0;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Set up event listeners for dashboard controls
     * @private
     */
    function setupEventListeners() {
        // Minimize button
        const minimizeBtn = document.getElementById('perf-minimize');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                _container.classList.toggle('minimized');
            });
        }
        
        // Close button
        const closeBtn = document.getElementById('perf-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                hide();
            });
        }
        
        // Export button
        const exportBtn = document.getElementById('perf-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                exportReport();
            });
        }
        
        // Clear button
        const clearBtn = document.getElementById('perf-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (App.Core.Performance) {
                    App.Core.Performance.clearMetrics();
                    _chartData = { fps: [], memory: [], operations: [] };
                    updateDashboard();
                }
            });
        }
    }
    
    /**
     * Update dashboard with current metrics
     * @private
     */
    function updateDashboard() {
        if (!_container || !App.Core.Performance) return;
        
        const metrics = App.Core.Performance.getMetrics();
        const summary = metrics.summary;
        
        // Update FPS
        const fpsElement = document.getElementById('perf-fps');
        if (fpsElement) {
            const fps = summary.fps;
            fpsElement.textContent = fps.toFixed(0);
            fpsElement.className = 'metric-value ' + 
                (fps >= 50 ? 'good' : fps >= 30 ? 'warning' : 'bad');
        }
        
        // Update memory if available
        const memoryElement = document.getElementById('perf-memory');
        if (memoryElement && performance.memory) {
            const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(0);
            memoryElement.textContent = `${usedMB}MB`;
        }
        
        // Update layer/source counts
        const map = App.Map.Init.getMap();
        if (map) {
            const layerCount = document.getElementById('perf-layers');
            const sourceCount = document.getElementById('perf-sources');
            
            if (layerCount) {
                layerCount.textContent = map.getStyle().layers.length;
            }
            
            if (sourceCount) {
                sourceCount.textContent = Object.keys(map.getStyle().sources).length;
            }
        }
        
        // Update GNSS interval
        const gnssIntervalElement = document.getElementById('perf-gnss-interval');
        if (gnssIntervalElement && App.Core.PerformanceConfig) {
            const interval = App.Core.PerformanceConfig.get('gps.updateInterval');
            const hz = (1000 / interval).toFixed(1);
            gnssIntervalElement.textContent = `${interval}ms (${hz}Hz)`;
        }
        
        // Update last GPS time
        const lastGPSElement = document.getElementById('perf-last-gps');
        if (lastGPSElement) {
            const lastUpdate = window._lastGPSUpdateTime || 0;
            if (lastUpdate > 0) {
                const elapsed = Date.now() - lastUpdate;
                if (elapsed < 1000) {
                    lastGPSElement.textContent = 'Just now';
                    lastGPSElement.className = 'metric-value good';
                } else if (elapsed < 5000) {
                    lastGPSElement.textContent = `${(elapsed/1000).toFixed(1)}s ago`;
                    lastGPSElement.className = 'metric-value warning';
                } else {
                    lastGPSElement.textContent = `${(elapsed/1000).toFixed(0)}s ago`;
                    lastGPSElement.className = 'metric-value bad';
                }
            } else {
                lastGPSElement.textContent = 'No updates';
            }
        }
        
        // Update FPS chart
        updateFPSChart(summary.fps);
        
        // Update recent operations
        updateOperationsList(metrics);
        
        // Update warnings
        updateWarningsList(summary.slowOperations);
    }
    
    /**
     * Update FPS chart
     * @param {number} currentFPS - Current FPS value
     * @private
     */
    function updateFPSChart(currentFPS) {
        const canvas = document.getElementById('perf-fps-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Add current FPS to data
        _chartData.fps.push(currentFPS);
        if (_chartData.fps.length > 60) { // Keep last 60 samples
            _chartData.fps.shift();
        }
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw grid lines
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        // 30 FPS line
        const y30 = height - (30 / 60) * height;
        ctx.moveTo(0, y30);
        ctx.lineTo(width, y30);
        
        // 60 FPS line
        const y60 = height - (60 / 60) * height;
        ctx.moveTo(0, y60);
        ctx.lineTo(width, y60);
        ctx.stroke();
        
        // Draw FPS line
        if (_chartData.fps.length > 1) {
            ctx.strokeStyle = currentFPS >= 50 ? '#4caf50' : currentFPS >= 30 ? '#ff9800' : '#f44336';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            const stepX = width / 59;
            _chartData.fps.forEach((fps, i) => {
                const x = i * stepX;
                const y = height - (fps / 60) * height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        }
        
        // Draw labels
        ctx.fillStyle = '#666';
        ctx.font = '10px sans-serif';
        ctx.fillText('60', 5, y60 - 2);
        ctx.fillText('30', 5, y30 - 2);
    }
    
    /**
     * Update recent operations list
     * @param {Object} metrics - Performance metrics
     * @private
     */
    function updateOperationsList(metrics) {
        const listElement = document.getElementById('perf-operations-list');
        if (!listElement) return;
        
        // Collect recent operations from all categories
        const recentOps = [];
        
        ['layerOperations', 'sourceOperations', 'styleChanges'].forEach(category => {
            if (metrics[category]) {
                metrics[category].slice(-5).forEach(op => {
                    recentOps.push(op);
                });
            }
        });
        
        // Sort by timestamp
        recentOps.sort((a, b) => b.endTime - a.endTime);
        
        // Display top 5
        listElement.innerHTML = recentOps.slice(0, 5).map(op => {
            const isSlow = op.duration > 100;
            return `
                <div class="operation-item ${isSlow ? 'slow' : ''}">
                    <span>${op.operation} - ${op.metadata.layerId || op.metadata.sourceId || ''}</span>
                    <span class="operation-time">${op.duration.toFixed(0)}ms</span>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Update warnings list
     * @param {Array} slowOperations - Array of slow operations
     * @private
     */
    function updateWarningsList(slowOperations) {
        const listElement = document.getElementById('perf-warnings-list');
        if (!listElement) return;
        
        if (slowOperations.length === 0) {
            listElement.innerHTML = '<div class="warning-item" style="background: #d4edda; color: #155724;">' + (App.I18n ? App.I18n.t('performance.no_performance_issues') : 'No performance issues detected') + '</div>';
            return;
        }
        
        listElement.innerHTML = slowOperations.slice(0, 3).map(op => `
            <div class="warning-item">
                <span>${op.category}: ${op.operation}</span>
                <span class="warning-time">+${op.excess.toFixed(0)}ms</span>
            </div>
        `).join('');
    }
    
    /**
     * Export performance report
     * @private
     */
    function exportReport() {
        if (!App.Core.Performance) return;
        
        const report = App.Core.Performance.generateReport();
        const metrics = App.Core.Performance.exportMetrics();
        
        // Create blob with report data
        const fullReport = `${report}\n\n=== Raw Metrics ===\n${metrics}`;
        const blob = new Blob([fullReport], { type: 'text/plain' });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `maplibre-performance-${new Date().getTime()}.txt`;
        link.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        
        console.log('Performance report exported');
    }
    
    // Public API
    return {
        /**
         * Initialize the performance dashboard
         */
        initialize: function() {
            console.log('Performance dashboard initialized');
        },
        
        /**
         * Show the performance dashboard
         */
        show: function() {
            if (!_container) {
                createDashboard();
            }
            
            _isVisible = true;
            _container.style.display = 'block';
            
            // Start updating
            if (_updateInterval) {
                clearInterval(_updateInterval);
            }
            
            // Initial update
            updateDashboard();
            
            // Update every 500ms
            _updateInterval = setInterval(updateDashboard, 500);
        },
        
        /**
         * Hide the performance dashboard
         */
        hide: function() {
            if (_container) {
                _container.style.display = 'none';
            }
            
            _isVisible = false;
            
            if (_updateInterval) {
                clearInterval(_updateInterval);
                _updateInterval = null;
            }
        },
        
        /**
         * Toggle dashboard visibility
         */
        toggle: function() {
            if (_isVisible) {
                this.hide();
            } else {
                this.show();
            }
        },
        
        /**
         * Check if dashboard is visible
         * @returns {boolean} Visibility state
         */
        isVisible: function() {
            return _isVisible;
        }
    };
})();

console.log('app.ui.performance-dashboard.js loaded - Performance dashboard ready');