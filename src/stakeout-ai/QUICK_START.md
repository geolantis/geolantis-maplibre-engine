# StakeOut AI Quick Start Guide

## Testing the Enhancements

### 1. Check Enhancement Status

Open the browser console and run:
```javascript
StakeOutAI.getStatus()
```

This will show:
- Whether the UI is enhanced
- The current UI type
- Whether stakeout is active

### 2. Manual Enhancement Trigger

If the enhancements didn't load automatically, run:
```javascript
StakeOutAI.triggerEnhancement()
```

### 3. Test StakeOut with Mock Data

To quickly test the stakeout functionality:
```javascript
StakeOutAI.testStakeout()
```

This will activate stakeout mode with test coordinates.

### 4. Normal StakeOut Activation

To use stakeout normally:
1. Select a feature on the map
2. Click the stakeout button in the UI
3. The enhanced UI should appear with:
   - Zoom controls (+ / - / A buttons)
   - Distance display
   - Directional arrows
   - AR visual effects (if enabled)

### 5. Verify Features

Once stakeout is active, you should see:

#### Zoom Controls
- **[+]** button - Manual zoom in
- **[-]** button - Manual zoom out  
- **[A]** button - Toggle auto-zoom (should be highlighted when active)

#### Automatic Features
- **Distance-based zoom** - Map automatically zooms based on distance to target
- **Smooth animations** - Zoom transitions are animated
- **Velocity prediction** - If moving, zoom anticipates your movement
- **AR effects** - Pulsing target, glowing path, proximity rings (if enabled)

### 6. Check Console Logs

The console will show:
- `[StakeOutAI] All enhancements loaded successfully`
- `[StakeOutAI] Successfully enhanced StakeOutUI`
- Performance metrics and optimization messages

### 7. Run Tests

To run the test suite:
```javascript
// Add to URL: ?runTests=true
// Or run manually:
StakeOutAITestSuite.runAll()
```

### 8. Run Benchmarks

To run performance benchmarks:
```javascript
// Add to URL: ?runBenchmarks=true
// Or run manually:
StakeOutAIBenchmark.runAll()
```

## Troubleshooting

### UI Not Enhanced?

1. Check console for errors
2. Run `StakeOutAI.getStatus()` to see current state
3. Try `StakeOutAI.triggerEnhancement()` to force enhancement
4. If stakeout is already active, deactivate and reactivate it

### No Visual Changes?

1. Ensure browser cache is cleared
2. Check that all scripts loaded (look for `[StakeOutAI]` messages in console)
3. Verify user preferences: `UserPreferences.get('autozoom.enabled')`

### Performance Issues?

1. Check battery manager status: `BatteryManager.getStatus()`
2. View performance metrics: `PerformanceMonitor.getMetrics()`
3. Try different optimization levels: `WebGLOptimizer.setOptimizationLevel('performance')`

## Configuration

### Disable Auto-zoom
```javascript
UserPreferences.set('autozoom.enabled', false)
```

### Adjust Zoom Sensitivity
```javascript
UserPreferences.set('autozoom.zoomSensitivity', 1.5) // 1.0 is default
```

### Toggle AR Effects
```javascript
UserPreferences.set('visual.arEnhancements', false)
```

### Battery Optimization
```javascript
UserPreferences.set('performance.batteryOptimization', true)
```