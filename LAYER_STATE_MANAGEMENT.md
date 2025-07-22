# Layer State Management Implementation

## Overview

The Layer State Management module (`App.Map.Layers.State`) provides automatic persistence of layer visibility and UI states across sidebar toggles. This ensures that when users close and reopen the feature layers sidebar, all their settings are preserved.

## Features

### What Gets Saved

1. **Layer States**
   - Visibility (checked/unchecked) for each feature layer
   - Selectability state for each feature layer
   - Hidden/shown state (from search filtering)

2. **Category States**
   - Visibility state for entire categories
   - Selectability state for entire categories
   - Expanded/collapsed state for category groups
   - Hidden/shown state (from search filtering)

3. **UI States**
   - Search input value and active state
   - Master checkbox states (visibility and selectability)
   - Expand/collapse all button state

### How It Works

1. **Automatic Save**: When the left4-drawer (Feature Layers) or left4a-drawer closes, the module automatically collects and saves the current state
2. **Automatic Restore**: When the drawer reopens, the module waits for the UI to render and then restores all saved states
3. **Persistence**: States are saved to localStorage with a 24-hour expiration
4. **Event Integration**: Integrates with the existing event system to track real-time changes

## Implementation Details

### File: `/src/map/app.map.layers.state.js`

The module follows the established pattern with private state management and public API:

```javascript
App.Map.Layers.State = (function () {
  // Private state storage
  var _layerStates = new Map();
  var _categoryStates = new Map();
  var _expandedCategories = new Set();
  var _searchState = { value: '', active: false };
  var _masterCheckboxStates = { visible: true, selectable: true };
  
  // Private methods for collecting and restoring state
  function _collectCurrentState() { ... }
  function _restoreState() { ... }
  function _persistState() { ... }
  function _loadPersistedState() { ... }
  
  // Public API
  return {
    initialize: function() { ... },
    saveState: function() { ... },
    restoreState: function() { ... },
    clearState: function() { ... },
    getState: function() { ... }
  };
})();
```

### Integration Points

1. **Event Listeners**: Attached to drawer `sl-hide` and `sl-after-show` events
2. **Layer Events**: Listens to `layer:visibility:changed` events from the layer UI
3. **UI Restoration**: Works with Shoelace components to restore checkbox and input states

## Usage

### Automatic Usage

The module works automatically once loaded. No manual intervention required for normal operation.

### Manual Commands (for debugging)

```javascript
// View current state
App.Map.Layers.State.getState()

// Manually save current UI state
App.Map.Layers.State.saveState()

// Manually restore saved state
App.Map.Layers.State.restoreState()

// Clear all saved states
App.Map.Layers.State.clearState()

// Check raw localStorage data
JSON.parse(localStorage.getItem('geo360_layer_states'))
```

## Testing

1. **Test Page**: Open `layer-state-test.html` for a demonstration and testing interface
2. **In Application**:
   - Open Feature Layers sidebar (left sidebar, layers button)
   - Change some layer visibility states
   - Expand/collapse categories
   - Enter a search term
   - Close the sidebar
   - Reopen the sidebar - all states should be restored

## Technical Considerations

### Performance
- State collection is lightweight, using DOM queries only when needed
- Restoration includes a 100ms delay to ensure UI is fully rendered
- localStorage operations are wrapped in try-catch for safety

### Data Expiration
- Saved states expire after 24 hours to prevent stale data
- Timestamp checking ensures only recent states are restored

### Browser Compatibility
- Uses standard localStorage API
- Compatible with all modern browsers
- Gracefully handles localStorage quota errors

## Future Enhancements

Potential improvements for future versions:

1. **User Preferences**: Save state per-user or per-project
2. **State History**: Keep multiple state snapshots for undo/redo
3. **Export/Import**: Allow users to save and share layer configurations
4. **Selective Persistence**: Option to exclude certain layers from persistence
5. **Performance Metrics**: Track save/restore timing for optimization

## Troubleshooting

### States Not Saving
- Check browser console for errors
- Verify localStorage is not disabled
- Check localStorage quota (run `navigator.storage.estimate()`)

### States Not Restoring
- Ensure drawer events are firing (check console logs)
- Verify UI elements have expected IDs and classes
- Check if states are older than 24 hours

### Debugging
Enable verbose logging by adding to console:
```javascript
// Before opening drawer
localStorage.setItem('geo360_debug_layer_state', 'true')
```

## File Changes

1. **New File**: `/src/map/app.map.layers.state.js` - The main state management module
2. **Modified**: `/index.html` - Added script include for the state module
3. **Modified**: `/src/map/app.map.layers.ui.js` - Added event trigger for visibility changes
4. **New File**: `/layer-state-test.html` - Test page for the functionality
5. **New File**: `/LAYER_STATE_MANAGEMENT.md` - This documentation