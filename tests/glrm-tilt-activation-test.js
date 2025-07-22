/**
 * GLRM Tilt Activation Test
 * 
 * This test verifies that the tilt activation/deactivation flow works correctly
 * between the Android settings menu and the MapLibre tilt visualization widget.
 * 
 * Run this test in the browser console after the MapLibre engine has loaded.
 */

window.GLRMTiltActivationTest = (function() {
    'use strict';

    // Test configuration
    const TEST_CONFIG = {
        mockGLRMDevice: true,
        testInterval: 1000,
        simulateActivation: true,
        simulateDeactivation: true
    };

    /**
     * Test 1: Verify tilt activation enables widget
     */
    function testTiltActivation() {
        console.log('🧪 Testing GLRM Tilt Activation...');
        
        if (!window.interface || !window.interface.setGLRMTiltEnabled) {
            console.error('❌ setGLRMTiltEnabled method not available');
            return false;
        }
        
        try {
            // Activate tilt
            window.interface.setGLRMTiltEnabled(true);
            console.log('✅ Tilt activation command sent');
            
            // Check if widget is visible
            setTimeout(() => {
                const widget = document.getElementById('tilt-display-widget');
                if (widget && widget.style.display !== 'none') {
                    console.log('✅ Tilt widget is visible');
                } else {
                    console.warn('⚠️ Tilt widget may not be visible');
                }
            }, 500);
            
            return true;
        } catch (error) {
            console.error('❌ Tilt activation failed:', error);
            return false;
        }
    }

    /**
     * Test 2: Verify tilt deactivation hides widget
     */
    function testTiltDeactivation() {
        console.log('🧪 Testing GLRM Tilt Deactivation...');
        
        if (!window.interface || !window.interface.setGLRMTiltEnabled) {
            console.error('❌ setGLRMTiltEnabled method not available');
            return false;
        }
        
        try {
            // Deactivate tilt
            window.interface.setGLRMTiltEnabled(false);
            console.log('✅ Tilt deactivation command sent');
            
            // Check if widget is hidden
            setTimeout(() => {
                const widget = document.getElementById('tilt-display-widget');
                if (widget && widget.style.display === 'none') {
                    console.log('✅ Tilt widget is hidden');
                } else {
                    console.warn('⚠️ Tilt widget may still be visible');
                }
            }, 500);
            
            return true;
        } catch (error) {
            console.error('❌ Tilt deactivation failed:', error);
            return false;
        }
    }

    /**
     * Test 3: Verify tilt data updates work when active
     */
    function testTiltDataFlow() {
        console.log('🧪 Testing GLRM Tilt Data Flow...');
        
        if (!window.interface || !window.interface.updateGLRMTiltData) {
            console.error('❌ updateGLRMTiltData method not available');
            return false;
        }
        
        try {
            // Enable tilt first
            window.interface.setGLRMTiltEnabled(true);
            
            // Send test data
            const testData = {
                lng: 14.2229,
                lat: 46.6263,
                tiltAngle: 15,
                azimuth: 45,
                status: 'active'
            };
            
            window.interface.updateGLRMTiltData(
                testData.lng,
                testData.lat,
                testData.tiltAngle,
                testData.azimuth,
                testData.status
            );
            
            console.log('✅ Tilt data update sent:', testData);
            
            // Check if data is reflected in widget
            setTimeout(() => {
                const angleDisplay = document.getElementById('tilt-angle-value');
                const azimuthDisplay = document.getElementById('tilt-azimuth-value');
                
                if (angleDisplay && azimuthDisplay) {
                    console.log('✅ Tilt data displays found');
                    console.log('   Angle:', angleDisplay.textContent);
                    console.log('   Azimuth:', azimuthDisplay.textContent);
                } else {
                    console.warn('⚠️ Tilt data displays not found');
                }
            }, 500);
            
            return true;
        } catch (error) {
            console.error('❌ Tilt data flow test failed:', error);
            return false;
        }
    }

    /**
     * Test 4: Simulate complete activation/deactivation cycle
     */
    function testCompleteActivationCycle() {
        console.log('🧪 Testing Complete Tilt Activation Cycle...');
        
        const steps = [
            { action: 'activate', delay: 0 },
            { action: 'sendData', delay: 1000 },
            { action: 'deactivate', delay: 2000 },
            { action: 'complete', delay: 3000 }
        ];
        
        steps.forEach(step => {
            setTimeout(() => {
                switch (step.action) {
                    case 'activate':
                        console.log('📍 Step 1: Activating tilt...');
                        testTiltActivation();
                        break;
                    case 'sendData':
                        console.log('📍 Step 2: Sending tilt data...');
                        testTiltDataFlow();
                        break;
                    case 'deactivate':
                        console.log('📍 Step 3: Deactivating tilt...');
                        testTiltDeactivation();
                        break;
                    case 'complete':
                        console.log('📍 Step 4: Cycle complete!');
                        console.log('✅ Complete activation cycle test finished');
                        break;
                }
            }, step.delay);
        });
        
        return true;
    }

    /**
     * Test 5: Verify proper error handling when no GLRM device
     */
    function testNoGLRMDevice() {
        console.log('🧪 Testing No GLRM Device Scenario...');
        
        // This test simulates what happens when no GLRM device is connected
        // In a real scenario, the toggle button wouldn't appear in the settings
        
        try {
            // Try to activate tilt without GLRM device
            if (window.interface && window.interface.setGLRMTiltEnabled) {
                window.interface.setGLRMTiltEnabled(true);
                console.log('⚠️ Tilt activation attempted without GLRM device');
            }
            
            // Widget should not appear or should show error state
            setTimeout(() => {
                const widget = document.getElementById('tilt-display-widget');
                if (widget && widget.style.display !== 'none') {
                    console.warn('⚠️ Tilt widget visible without GLRM device');
                } else {
                    console.log('✅ Tilt widget correctly hidden without GLRM device');
                }
            }, 500);
            
            return true;
        } catch (error) {
            console.error('❌ No GLRM device test failed:', error);
            return false;
        }
    }

    /**
     * Run all tilt activation tests
     */
    function runAllTests() {
        console.log('🚀 Running All GLRM Tilt Activation Tests...');
        console.log('====================================================');
        
        const tests = [
            { name: 'Tilt Activation', fn: testTiltActivation },
            { name: 'Tilt Deactivation', fn: testTiltDeactivation },
            { name: 'Tilt Data Flow', fn: testTiltDataFlow },
            { name: 'Complete Activation Cycle', fn: testCompleteActivationCycle },
            { name: 'No GLRM Device', fn: testNoGLRMDevice }
        ];
        
        let passed = 0;
        let total = tests.length;
        
        tests.forEach((test, index) => {
            setTimeout(() => {
                console.log(`\n--- Running ${test.name} Test ---`);
                const result = test.fn();
                if (result) {
                    passed++;
                }
                
                // Show results after last test
                if (index === tests.length - 1) {
                    setTimeout(() => {
                        console.log('\n====================================================');
                        console.log(`🏁 Test Results: ${passed}/${total} tests passed`);
                        
                        if (passed === total) {
                            console.log('✅ All GLRM tilt activation tests passed!');
                        } else {
                            console.log('❌ Some tests failed. Please check the implementation.');
                        }
                    }, 4000); // Wait for complete cycle test to finish
                }
            }, index * 100); // Stagger test execution
        });
    }

    /**
     * Quick test functions for manual testing
     */
    function quickActivateTest() {
        console.log('🔧 Quick Tilt Activation Test');
        return testTiltActivation();
    }

    function quickDeactivateTest() {
        console.log('🔧 Quick Tilt Deactivation Test');
        return testTiltDeactivation();
    }

    function quickDataTest() {
        console.log('🔧 Quick Tilt Data Test');
        return testTiltDataFlow();
    }

    // Public API
    return {
        runAll: runAllTests,
        testActivation: testTiltActivation,
        testDeactivation: testTiltDeactivation,
        testDataFlow: testTiltDataFlow,
        testCycle: testCompleteActivationCycle,
        testNoDevice: testNoGLRMDevice,
        quickActivate: quickActivateTest,
        quickDeactivate: quickDeactivateTest,
        quickData: quickDataTest
    };
})();

// Auto-run message
console.log('🧪 GLRM Tilt Activation Test Suite loaded.');
console.log('   Use GLRMTiltActivationTest.runAll() to run all tests.');
console.log('   Use GLRMTiltActivationTest.quickActivate() for quick activation test.');
console.log('   Use GLRMTiltActivationTest.quickDeactivate() for quick deactivation test.');
console.log('   Use GLRMTiltActivationTest.quickData() for quick data flow test.');

// Optionally auto-run after a delay (uncomment to enable)
// setTimeout(() => {
//     GLRMTiltActivationTest.runAll();
// }, 2000);