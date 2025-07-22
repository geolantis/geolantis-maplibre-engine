/**
 * GLRM Tilt Integration Test
 * 
 * This file provides testing functions to verify the GLRM tilt angle visualization
 * integration between Android and MapLibre. Run these tests in the browser console
 * to verify the implementation works correctly.
 */

// Test configuration
const GLRM_TEST_CONFIG = {
  samplePositions: [
    { lng: 14.2229, lat: 46.6263, tiltAngle: 0, azimuth: 0 },      // Level
    { lng: 14.2230, lat: 46.6264, tiltAngle: 10, azimuth: 45 },    // Slight tilt NE
    { lng: 14.2231, lat: 46.6265, tiltAngle: 25, azimuth: 90 },    // Moderate tilt E
    { lng: 14.2232, lat: 46.6266, tiltAngle: 35, azimuth: 180 },   // High tilt S
    { lng: 14.2233, lat: 46.6267, tiltAngle: 45, azimuth: 270 }    // Very high tilt W
  ],
  testInterval: 1000, // 1 second between updates
  maxAngle: 45,
  statusTypes: ['active', 'calibrating', 'inactive']
};

/**
 * Test 1: Check if all required objects and methods exist
 */
function testGLRMIntegrationSetup() {
  console.log('🧪 Testing GLRM Integration Setup...');
  
  const results = {
    bridgeInterface: false,
    tiltWidget: false,
    bridgeMethods: false,
    widgetMethods: false
  };
  
  // Check bridge interface
  if (typeof window.interface !== 'undefined' && window.interface) {
    results.bridgeInterface = true;
    console.log('✅ Bridge interface exists');
  } else {
    console.error('❌ Bridge interface not found');
  }
  
  // Check tilt widget
  if (typeof App !== 'undefined' && App.UI && App.UI.TiltDisplayWidget) {
    results.tiltWidget = true;
    console.log('✅ TiltDisplayWidget module exists');
  } else {
    console.error('❌ TiltDisplayWidget module not found');
  }
  
  // Check bridge methods
  if (window.interface && 
      typeof window.interface.updateGLRMTiltData === 'function' &&
      typeof window.interface.setGLRMTiltEnabled === 'function' &&
      typeof window.interface.updateGLRMCalibrationProgress === 'function') {
    results.bridgeMethods = true;
    console.log('✅ Bridge GLRM methods exist');
  } else {
    console.error('❌ Bridge GLRM methods not found');
  }
  
  // Check widget methods
  if (App.UI && App.UI.TiltDisplayWidget &&
      typeof App.UI.TiltDisplayWidget.updateTiltData === 'function' &&
      typeof App.UI.TiltDisplayWidget.showWidget === 'function' &&
      typeof App.UI.TiltDisplayWidget.hideWidget === 'function') {
    results.widgetMethods = true;
    console.log('✅ Widget methods exist');
  } else {
    console.error('❌ Widget methods not found');
  }
  
  const success = Object.values(results).every(r => r);
  console.log(success ? '✅ All integration setup checks passed' : '❌ Some setup checks failed');
  
  return results;
}

/**
 * Test 2: Test basic tilt data updates
 */
function testGLRMTiltDataUpdates() {
  console.log('🧪 Testing GLRM Tilt Data Updates...');
  
  if (!window.interface || !window.interface.updateGLRMTiltData) {
    console.error('❌ updateGLRMTiltData method not available');
    return false;
  }
  
  // Enable tilt display first
  if (window.interface.setGLRMTiltEnabled) {
    window.interface.setGLRMTiltEnabled(true);
    console.log('✅ Tilt display enabled');
  }
  
  // Test with sample data
  const sampleData = GLRM_TEST_CONFIG.samplePositions[0];
  
  try {
    window.interface.updateGLRMTiltData(
      sampleData.lng,
      sampleData.lat,
      sampleData.tiltAngle,
      sampleData.azimuth,
      'active'
    );
    console.log('✅ Basic tilt data update successful');
    return true;
  } catch (error) {
    console.error('❌ Tilt data update failed:', error);
    return false;
  }
}

/**
 * Test 3: Test input validation
 */
function testGLRMInputValidation() {
  console.log('🧪 Testing GLRM Input Validation...');
  
  if (!window.interface || !window.interface.updateGLRMTiltData) {
    console.error('❌ updateGLRMTiltData method not available');
    return false;
  }
  
  const testCases = [
    { lng: 'invalid', lat: 46.6263, tiltAngle: 10, azimuth: 45, expected: 'fail' },
    { lng: 14.2229, lat: 'invalid', tiltAngle: 10, azimuth: 45, expected: 'fail' },
    { lng: 14.2229, lat: 46.6263, tiltAngle: -10, azimuth: 45, expected: 'fail' },
    { lng: 14.2229, lat: 46.6263, tiltAngle: 100, azimuth: 45, expected: 'fail' },
    { lng: 14.2229, lat: 46.6263, tiltAngle: 10, azimuth: -45, expected: 'fail' },
    { lng: 14.2229, lat: 46.6263, tiltAngle: 10, azimuth: 400, expected: 'fail' },
    { lng: 14.2229, lat: 46.6263, tiltAngle: 10, azimuth: 45, expected: 'pass' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    try {
      window.interface.updateGLRMTiltData(
        testCase.lng,
        testCase.lat,
        testCase.tiltAngle,
        testCase.azimuth,
        'active'
      );
      
      if (testCase.expected === 'pass') {
        console.log(`✅ Test case ${index + 1} passed (valid input accepted)`);
        passed++;
      } else {
        console.warn(`⚠️ Test case ${index + 1} should have failed but didn't`);
        failed++;
      }
    } catch (error) {
      if (testCase.expected === 'fail') {
        console.log(`✅ Test case ${index + 1} passed (invalid input rejected)`);
        passed++;
      } else {
        console.error(`❌ Test case ${index + 1} failed unexpectedly:`, error);
        failed++;
      }
    }
  });
  
  console.log(`✅ Input validation: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

/**
 * Test 4: Test widget visibility control
 */
function testGLRMWidgetVisibility() {
  console.log('🧪 Testing GLRM Widget Visibility...');
  
  if (!window.interface || !window.interface.setGLRMTiltEnabled) {
    console.error('❌ setGLRMTiltEnabled method not available');
    return false;
  }
  
  try {
    // Test show widget
    window.interface.setGLRMTiltEnabled(true);
    console.log('✅ Widget show test completed');
    
    // Wait a bit then hide
    setTimeout(() => {
      window.interface.setGLRMTiltEnabled(false);
      console.log('✅ Widget hide test completed');
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('❌ Widget visibility test failed:', error);
    return false;
  }
}

/**
 * Test 5: Test calibration progress updates
 */
function testGLRMCalibrationProgress() {
  console.log('🧪 Testing GLRM Calibration Progress...');
  
  if (!window.interface || !window.interface.updateGLRMCalibrationProgress) {
    console.error('❌ updateGLRMCalibrationProgress method not available');
    return false;
  }
  
  const progressValues = [0, 25, 50, 75, 100];
  let currentIndex = 0;
  
  const progressInterval = setInterval(() => {
    if (currentIndex >= progressValues.length) {
      clearInterval(progressInterval);
      console.log('✅ Calibration progress test completed');
      return;
    }
    
    const progress = progressValues[currentIndex];
    try {
      window.interface.updateGLRMCalibrationProgress(progress);
      console.log(`✅ Progress update ${progress}% successful`);
    } catch (error) {
      console.error(`❌ Progress update ${progress}% failed:`, error);
    }
    
    currentIndex++;
  }, 500);
  
  return true;
}

/**
 * Test 6: Simulate realistic GLRM data stream
 */
function testGLRMRealisticDataStream() {
  console.log('🧪 Testing GLRM Realistic Data Stream...');
  
  if (!window.interface || !window.interface.updateGLRMTiltData) {
    console.error('❌ updateGLRMTiltData method not available');
    return false;
  }
  
  // Enable tilt display
  window.interface.setGLRMTiltEnabled(true);
  
  let currentIndex = 0;
  const positions = GLRM_TEST_CONFIG.samplePositions;
  
  const dataInterval = setInterval(() => {
    if (currentIndex >= positions.length) {
      clearInterval(dataInterval);
      console.log('✅ Realistic data stream test completed');
      return;
    }
    
    const position = positions[currentIndex];
    const status = GLRM_TEST_CONFIG.statusTypes[currentIndex % GLRM_TEST_CONFIG.statusTypes.length];
    
    try {
      window.interface.updateGLRMTiltData(
        position.lng,
        position.lat,
        position.tiltAngle,
        position.azimuth,
        status
      );
      
      console.log(`✅ Position ${currentIndex + 1} updated: ${position.tiltAngle}° @ ${position.azimuth}° (${status})`);
    } catch (error) {
      console.error(`❌ Position ${currentIndex + 1} update failed:`, error);
    }
    
    currentIndex++;
  }, GLRM_TEST_CONFIG.testInterval);
  
  return true;
}

/**
 * Run all tests
 */
function runAllGLRMTests() {
  console.log('🚀 Running All GLRM Integration Tests...');
  console.log('=====================================');
  
  const tests = [
    { name: 'Integration Setup', fn: testGLRMIntegrationSetup },
    { name: 'Tilt Data Updates', fn: testGLRMTiltDataUpdates },
    { name: 'Input Validation', fn: testGLRMInputValidation },
    { name: 'Widget Visibility', fn: testGLRMWidgetVisibility },
    { name: 'Calibration Progress', fn: testGLRMCalibrationProgress }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  tests.forEach(test => {
    console.log(`\n--- Running ${test.name} Test ---`);
    const result = test.fn();
    if (result) {
      passed++;
    }
  });
  
  console.log('\n=====================================');
  console.log(`🏁 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('✅ All GLRM integration tests passed!');
    
    // Run the realistic data stream test at the end
    setTimeout(() => {
      console.log('\n--- Running Realistic Data Stream Test ---');
      testGLRMRealisticDataStream();
    }, 2000);
  } else {
    console.log('❌ Some tests failed. Please check the implementation.');
  }
}

/**
 * Manual test functions for individual testing
 */
window.GLRMTestSuite = {
  runAll: runAllGLRMTests,
  testSetup: testGLRMIntegrationSetup,
  testUpdates: testGLRMTiltDataUpdates,
  testValidation: testGLRMInputValidation,
  testVisibility: testGLRMWidgetVisibility,
  testProgress: testGLRMCalibrationProgress,
  testRealistic: testGLRMRealisticDataStream,
  
  // Quick test data
  enableTilt: () => window.interface && window.interface.setGLRMTiltEnabled(true),
  disableTilt: () => window.interface && window.interface.setGLRMTiltEnabled(false),
  
  // Sample data update
  updateSample: (index = 0) => {
    const pos = GLRM_TEST_CONFIG.samplePositions[index];
    if (window.interface && window.interface.updateGLRMTiltData) {
      window.interface.updateGLRMTiltData(pos.lng, pos.lat, pos.tiltAngle, pos.azimuth, 'active');
    }
  }
};

// Auto-run tests when loaded (comment out for manual testing)
// setTimeout(runAllGLRMTests, 1000);

console.log('🧪 GLRM Test Suite loaded. Use GLRMTestSuite.runAll() to run all tests.');
console.log('   Individual tests: GLRMTestSuite.testSetup(), GLRMTestSuite.testUpdates(), etc.');
console.log('   Quick functions: GLRMTestSuite.enableTilt(), GLRMTestSuite.updateSample(0)');