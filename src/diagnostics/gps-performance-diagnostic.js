/**
 * GPS Performance Diagnostic Tool
 * Helps identify what's causing frame drops during GPS updates
 */
(function() {
    'use strict';
    
    console.log('[GPS Performance Diagnostic] Starting diagnostic monitoring');
    
    // Store original functions to wrap
    const originalFunctions = {};
    const performanceData = {
        operations: [],
        frameDrops: [],
        slowOperations: []
    };
    
    // Threshold for slow operations (in ms)
    const SLOW_OPERATION_THRESHOLD = 50;
    
    /**
     * Wrap a function to measure its performance
     */
    function wrapFunction(obj, methodName, category) {
        if (!obj || !obj[methodName]) return;
        
        originalFunctions[category + '.' + methodName] = obj[methodName];
        
        obj[methodName] = function() {
            const startTime = performance.now();
            const stackTrace = new Error().stack;
            
            try {
                const result = originalFunctions[category + '.' + methodName].apply(this, arguments);
                
                const duration = performance.now() - startTime;
                
                // Record the operation
                const operation = {
                    category,
                    method: methodName,
                    duration,
                    timestamp: Date.now(),
                    args: Array.from(arguments).slice(0, 2) // Only first 2 args to avoid too much data
                };
                
                performanceData.operations.push(operation);
                
                // Check if it's a slow operation
                if (duration > SLOW_OPERATION_THRESHOLD) {
                    console.warn(`[GPS Diagnostic] SLOW OPERATION: ${category}.${methodName} took ${duration.toFixed(2)}ms`);
                    performanceData.slowOperations.push({
                        ...operation,
                        stack: stackTrace
                    });
                }
                
                return result;
            } catch (error) {
                console.error(`[GPS Diagnostic] Error in ${category}.${methodName}:`, error);
                throw error;
            }
        };
    }
    
    // Start monitoring key functions
    function startMonitoring() {
        // Monitor map operations
        if (window.App && App.Map) {
            // Navigation operations
            if (App.Map.Navigation) {
                wrapFunction(App.Map.Navigation, 'setPosition', 'Navigation');
                wrapFunction(App.Map.Navigation, 'updateGPSLocation', 'Navigation');
                wrapFunction(App.Map.Navigation, 'setPositionEnabled', 'Navigation');
            }
            
            // Layer operations
            if (App.Map.Layers) {
                wrapFunction(App.Map.Layers, 'addFeature', 'Layers');
                wrapFunction(App.Map.Layers, 'removeFeature', 'Layers');
                wrapFunction(App.Map.Layers, 'updateFeature', 'Layers');
                wrapFunction(App.Map.Layers, 'clearLayer', 'Layers');
            }
        }
        
        // Monitor MapLibre map operations
        const checkMapLibre = setInterval(() => {
            if (App.Map && App.Map.Init && App.Map.Init.getMap) {
                const map = App.Map.Init.getMap();
                if (map) {
                    clearInterval(checkMapLibre);
                    
                    // Wrap expensive map operations
                    wrapFunction(map, 'setLayoutProperty', 'MapLibre');
                    wrapFunction(map, 'setPaintProperty', 'MapLibre');
                    wrapFunction(map, 'setFilter', 'MapLibre');
                    wrapFunction(map, 'queryRenderedFeatures', 'MapLibre');
                    wrapFunction(map, 'querySourceFeatures', 'MapLibre');
                    
                    // Monitor source operations
                    const originalGetSource = map.getSource.bind(map);
                    map.getSource = function(id) {
                        const source = originalGetSource(id);
                        if (source && !source._diagnosticWrapped) {
                            source._diagnosticWrapped = true;
                            wrapFunction(source, 'setData', `Source[${id}]`);
                            wrapFunction(source, 'updateImage', `Source[${id}]`);
                        }
                        return source;
                    };
                    
                    console.log('[GPS Diagnostic] MapLibre monitoring initialized');
                }
            }
        }, 100);
        
        // Monitor frame drops
        let lastFrameTime = performance.now();
        function checkFrameDrops() {
            const now = performance.now();
            const frameDuration = now - lastFrameTime;
            
            if (frameDuration > 100) { // More than 100ms = significant frame drop
                const recentOps = performanceData.operations.filter(op => 
                    op.timestamp > Date.now() - 1000 // Operations in last second
                );
                
                // Disable console logging for frame drops as it makes the problem worse
                // The frame drop is already recorded in performanceData.frameDrops
                // console.error(`[GPS Diagnostic] FRAME DROP DETECTED: ${frameDuration.toFixed(0)}ms`);
                // console.table(recentOps.sort((a, b) => b.duration - a.duration).slice(0, 5));
                
                performanceData.frameDrops.push({
                    duration: frameDuration,
                    timestamp: Date.now(),
                    recentOperations: recentOps
                });
            }
            
            lastFrameTime = now;
            requestAnimationFrame(checkFrameDrops);
        }
        requestAnimationFrame(checkFrameDrops);
    }
    
    // Public API
    window.GPSDiagnostic = {
        start: startMonitoring,
        
        getReport: function() {
            const report = {
                totalOperations: performanceData.operations.length,
                slowOperations: performanceData.slowOperations.length,
                frameDrops: performanceData.frameDrops.length,
                
                // Get operation statistics
                operationStats: {},
                
                // Recent slow operations
                recentSlowOps: performanceData.slowOperations.slice(-10),
                
                // Recent frame drops
                recentFrameDrops: performanceData.frameDrops.slice(-5)
            };
            
            // Calculate stats per operation
            performanceData.operations.forEach(op => {
                const key = `${op.category}.${op.method}`;
                if (!report.operationStats[key]) {
                    report.operationStats[key] = {
                        count: 0,
                        totalDuration: 0,
                        maxDuration: 0,
                        avgDuration: 0
                    };
                }
                
                const stats = report.operationStats[key];
                stats.count++;
                stats.totalDuration += op.duration;
                stats.maxDuration = Math.max(stats.maxDuration, op.duration);
                stats.avgDuration = stats.totalDuration / stats.count;
            });
            
            return report;
        },
        
        printReport: function() {
            const report = this.getReport();
            
            console.log('=== GPS Performance Diagnostic Report ===');
            console.log(`Total operations tracked: ${report.totalOperations}`);
            console.log(`Slow operations (>${SLOW_OPERATION_THRESHOLD}ms): ${report.slowOperations}`);
            console.log(`Frame drops detected: ${report.frameDrops}`);
            
            console.log('\n=== Operation Statistics ===');
            const sortedStats = Object.entries(report.operationStats)
                .sort((a, b) => b[1].avgDuration - a[1].avgDuration);
            
            console.table(sortedStats.map(([op, stats]) => ({
                Operation: op,
                Count: stats.count,
                'Avg Duration (ms)': stats.avgDuration.toFixed(2),
                'Max Duration (ms)': stats.maxDuration.toFixed(2),
                'Total Time (ms)': stats.totalDuration.toFixed(2)
            })));
            
            if (report.recentSlowOps.length > 0) {
                console.log('\n=== Recent Slow Operations ===');
                report.recentSlowOps.forEach(op => {
                    console.log(`${op.category}.${op.method}: ${op.duration.toFixed(2)}ms`);
                    console.log('Args:', op.args);
                });
            }
            
            if (report.recentFrameDrops.length > 0) {
                console.log('\n=== Recent Frame Drops ===');
                report.recentFrameDrops.forEach(drop => {
                    console.log(`Frame drop: ${drop.duration.toFixed(0)}ms at ${new Date(drop.timestamp).toLocaleTimeString()}`);
                    if (drop.recentOperations.length > 0) {
                        console.log('Operations before drop:');
                        drop.recentOperations.slice(0, 3).forEach(op => {
                            console.log(`  - ${op.category}.${op.method}: ${op.duration.toFixed(2)}ms`);
                        });
                    }
                });
            }
        },
        
        reset: function() {
            performanceData.operations = [];
            performanceData.frameDrops = [];
            performanceData.slowOperations = [];
            console.log('[GPS Diagnostic] Data reset');
        }
    };
    
    // Auto-start monitoring
    startMonitoring();
    
    // Add command line commands
    if (window.commandLine) {
        console.log('[GPS Diagnostic] Adding command line integration');
        
        // Store original handler
        const originalProcessCommand = window.commandLine.processCommand;
        
        // Add our commands
        window.commandLine.processCommand = function(command) {
            const parts = command.trim().split(' ');
            const cmd = parts[0].toLowerCase();
            
            if (cmd === 'gpsdiag') {
                const subCmd = parts[1] || 'help';
                
                switch (subCmd) {
                    case 'report':
                        GPSDiagnostic.printReport();
                        break;
                    case 'reset':
                        GPSDiagnostic.reset();
                        this.addOutput('GPS diagnostic data reset', '#00ff00');
                        break;
                    case 'help':
                        this.addOutput(`
GPS Diagnostic Commands:
gpsdiag report - Show performance report
gpsdiag reset  - Clear diagnostic data
gpsdiag help   - Show this help
`, '#00aaff');
                        break;
                }
                
                return;
            }
            
            // Call original handler
            return originalProcessCommand.call(this, command);
        };
    }
    
    console.log('[GPS Diagnostic] Ready. Use GPSDiagnostic.printReport() or "gpsdiag report" in console');
})();