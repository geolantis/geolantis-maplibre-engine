/**
 * Comprehensive Testing Suite for StakeOut AI Enhancements
 * Run tests to validate all functionality
 */
class StakeOutAITestSuite {
    constructor() {
        this.tests = [];
        this.results = [];
        this.isRunning = false;
        
        // Register all tests
        this.registerTests();
    }
    
    /**
     * Register all test cases
     */
    registerTests() {
        // Autozoom Engine Tests
        this.addTest('Autozoom: Distance-based zoom calculation', async () => {
            if (!window.AutozoomEngine) throw new Error('AutozoomEngine not loaded');
            
            const mockMap = {
                getZoom: () => 15,
                getMinZoom: () => 1,
                getMaxZoom: () => 20,
                setZoom: () => {},
                easeTo: () => {}
            };
            
            const engine = new window.AutozoomEngine(mockMap);
            
            // Test zoom calculations for different distances
            const testCases = [
                { distance: 5, expectedZoom: 20 },
                { distance: 50, expectedZoom: 17 },
                { distance: 500, expectedZoom: 14 },
                { distance: 5000, expectedZoom: 11 }
            ];
            
            for (const test of testCases) {
                const zoom = engine.calculateOptimalZoom(test.distance);
                if (zoom !== test.expectedZoom) {
                    throw new Error(`Expected zoom ${test.expectedZoom} for distance ${test.distance}m, got ${zoom}`);
                }
            }
            
            return 'All distance calculations correct';
        });
        
        this.addTest('Autozoom: Velocity tracking', async () => {
            if (!window.AutozoomEngine) throw new Error('AutozoomEngine not loaded');
            
            const mockMap = {
                getZoom: () => 15,
                getMinZoom: () => 1,
                getMaxZoom: () => 20,
                setZoom: () => {},
                easeTo: () => {}
            };
            
            const engine = new window.AutozoomEngine(mockMap);
            
            // Simulate movement
            const positions = [
                { pos: [0, 0], time: 0 },
                { pos: [0.0001, 0], time: 1000 },  // ~11m in 1s = 11m/s
                { pos: [0.0002, 0], time: 2000 }   // ~11m in 1s = 11m/s
            ];
            
            for (const data of positions) {
                engine.updateVelocity(data.pos, data.time);
            }
            
            const state = engine.getState();
            if (state.velocity.average < 10 || state.velocity.average > 12) {
                throw new Error(`Expected velocity ~11m/s, got ${state.velocity.average}`);
            }
            
            return 'Velocity tracking working correctly';
        });
        
        // User Preferences Tests
        this.addTest('Preferences: Save and load', async () => {
            if (!window.UserPreferences) throw new Error('UserPreferences not loaded');
            
            const prefs = window.UserPreferences;
            
            // Set a preference
            prefs.set('autozoom.zoomSensitivity', 1.5);
            
            // Get it back
            const value = prefs.get('autozoom.zoomSensitivity');
            if (value !== 1.5) {
                throw new Error(`Expected 1.5, got ${value}`);
            }
            
            // Reset to default
            prefs.set('autozoom.zoomSensitivity', 1.0);
            
            return 'Preferences save/load working';
        });
        
        // Performance Monitor Tests
        this.addTest('Performance: FPS monitoring', async () => {
            if (!window.PerformanceMonitor) throw new Error('PerformanceMonitor not loaded');
            
            const monitor = new window.PerformanceMonitor();
            monitor.start();
            
            // Wait for some samples
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const metrics = monitor.getMetrics();
            monitor.stop();
            monitor.destroy();
            
            if (!metrics.fps.current || metrics.fps.current < 1) {
                throw new Error('FPS monitoring not working');
            }
            
            return `FPS monitoring working: ${metrics.fps.current} FPS`;
        });
        
        // WebGL Optimizer Tests
        this.addTest('WebGL: Optimization levels', async () => {
            if (!window.WebGLOptimizer) throw new Error('WebGLOptimizer not loaded');
            
            const optimizer = new window.WebGLOptimizer();
            
            // Test optimization level switching
            const levels = ['performance', 'balanced', 'quality'];
            
            for (const level of levels) {
                optimizer.setOptimizationLevel(level);
                const status = optimizer.getStatus();
                
                if (status.level !== level) {
                    throw new Error(`Failed to set optimization level to ${level}`);
                }
            }
            
            return 'Optimization level switching working';
        });
        
        // Battery Manager Tests
        this.addTest('Battery: Adaptive rates', async () => {
            if (!window.BatteryManager) throw new Error('BatteryManager not loaded');
            
            const battery = window.BatteryManager;
            
            // Test different modes
            const modes = ['performance', 'balanced', 'batterySaver', 'critical'];
            
            for (const mode of modes) {
                battery.forceMode(mode);
                const rate = battery.getUpdateRate('position');
                
                if (!rate || rate < 0) {
                    throw new Error(`Invalid update rate for mode ${mode}`);
                }
            }
            
            // Reset to balanced
            battery.forceMode('balanced');
            
            return 'Adaptive rate system working';
        });
        
        // AR Enhancements Tests
        this.addTest('AR: Visual effects creation', async () => {
            if (!window.AREnhancements) throw new Error('AREnhancements not loaded');
            
            // Need a mock map for testing
            const mockMap = this.createMockMap();
            
            const ar = new window.AREnhancements();
            ar.initialize(mockMap);
            
            // Test creating effects
            ar.createPulsingTarget([0, 0]);
            ar.createGlowingPath([0, 0], [0.001, 0.001]);
            ar.createProximityRings([0, 0]);
            
            // Check if layers were created
            if (mockMap.layers.size < 3) {
                throw new Error('AR effects not created properly');
            }
            
            ar.destroy();
            
            return 'AR effects creation working';
        });
        
        // ML Coordinator Tests
        this.addTest('ML: Model loading simulation', async () => {
            if (!window.MLCoordinator) throw new Error('MLCoordinator not loaded');
            
            const ml = new window.MLCoordinator();
            await ml.initialize();
            
            // Load a model
            const model = await ml.loadModel('movementPredictor');
            if (!model) {
                throw new Error('Failed to load movement predictor model');
            }
            
            // Test prediction
            const prediction = await ml.predictMovement({
                currentPosition: [0, 0],
                velocity: 5,
                bearing: 45
            });
            
            if (!prediction || !prediction.confidence) {
                throw new Error('Movement prediction failed');
            }
            
            ml.destroy();
            
            return 'ML model loading and prediction working';
        });
        
        // Integration Tests
        this.addTest('Integration: UI Enhancement loading', async () => {
            if (!window.StakeOutUIEnhanced) {
                throw new Error('StakeOutUIEnhanced not loaded');
            }
            
            // Check if it extends StakeOutUICompact
            const ui = new window.StakeOutUIEnhanced();
            if (typeof ui.createWidget !== 'function') {
                throw new Error('StakeOutUIEnhanced missing required methods');
            }
            
            return 'Enhanced UI loaded correctly';
        });
        
        this.addTest('Integration: Component communication', async () => {
            // Test that components can communicate
            if (!window.UserPreferences || !window.AutozoomEngine) {
                throw new Error('Required components not loaded');
            }
            
            // Change a preference
            window.UserPreferences.set('autozoom.enabled', false);
            
            // Create new autozoom engine (it should load the preference)
            const mockMap = this.createMockMap();
            const engine = new window.AutozoomEngine(mockMap);
            
            if (engine.preferences.autoZoomEnabled !== false) {
                throw new Error('Component communication not working');
            }
            
            // Reset preference
            window.UserPreferences.set('autozoom.enabled', true);
            
            return 'Component communication working';
        });
    }
    
    /**
     * Add a test
     * @param {string} name - Test name
     * @param {Function} testFn - Test function (should throw on failure)
     */
    addTest(name, testFn) {
        this.tests.push({ name, testFn });
    }
    
    /**
     * Create mock map for testing
     */
    createMockMap() {
        const layers = new Map();
        const sources = new Map();
        
        return {
            getZoom: () => 15,
            getMinZoom: () => 1,
            getMaxZoom: () => 20,
            setZoom: () => {},
            easeTo: () => {},
            getCanvas: () => ({ width: 800, height: 600 }),
            layers: layers,
            sources: sources,
            getLayer: (id) => layers.get(id),
            addLayer: (layer) => layers.set(layer.id, layer),
            removeLayer: (id) => layers.delete(id),
            getSource: (id) => sources.get(id),
            addSource: (id, source) => sources.set(id, source),
            removeSource: (id) => sources.delete(id),
            setLayoutProperty: () => {},
            setPaintProperty: () => {},
            on: () => {},
            off: () => {}
        };
    }
    
    /**
     * Run all tests
     */
    async runAll() {
        if (this.isRunning) {
            console.log('[TestSuite] Tests already running');
            return;
        }
        
        this.isRunning = true;
        this.results = [];
        
        console.log('[TestSuite] Starting comprehensive test suite...');
        console.log(`[TestSuite] Running ${this.tests.length} tests`);
        
        const startTime = performance.now();
        
        for (const test of this.tests) {
            await this.runTest(test);
        }
        
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        // Summary
        const passed = this.results.filter(r => r.status === 'passed').length;
        const failed = this.results.filter(r => r.status === 'failed').length;
        
        console.log('\n[TestSuite] ========== TEST RESULTS ==========');
        console.log(`[TestSuite] Total: ${this.tests.length}`);
        console.log(`[TestSuite] Passed: ${passed} ✓`);
        console.log(`[TestSuite] Failed: ${failed} ✗`);
        console.log(`[TestSuite] Duration: ${duration}ms`);
        console.log('[TestSuite] ==================================\n');
        
        // Show failed tests
        if (failed > 0) {
            console.log('[TestSuite] Failed tests:');
            this.results.filter(r => r.status === 'failed').forEach(result => {
                console.error(`  ✗ ${result.name}: ${result.error}`);
            });
        }
        
        this.isRunning = false;
        
        return {
            total: this.tests.length,
            passed,
            failed,
            duration,
            results: this.results
        };
    }
    
    /**
     * Run a single test
     */
    async runTest(test) {
        const startTime = performance.now();
        
        try {
            const result = await test.testFn();
            const duration = Math.round(performance.now() - startTime);
            
            this.results.push({
                name: test.name,
                status: 'passed',
                result: result,
                duration
            });
            
            console.log(`✓ ${test.name} (${duration}ms)`);
            
        } catch (error) {
            const duration = Math.round(performance.now() - startTime);
            
            this.results.push({
                name: test.name,
                status: 'failed',
                error: error.message,
                duration
            });
            
            console.error(`✗ ${test.name}: ${error.message} (${duration}ms)`);
        }
    }
    
    /**
     * Get test results
     */
    getResults() {
        return this.results;
    }
}

// Create and expose test suite
const testSuite = new StakeOutAITestSuite();

// Auto-run tests if requested
if (window.location.search.includes('runTests=true')) {
    console.log('[TestSuite] Auto-running tests...');
    setTimeout(() => {
        testSuite.runAll();
    }, 2000); // Wait for everything to load
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = testSuite;
} else {
    window.StakeOutAITestSuite = testSuite;
}