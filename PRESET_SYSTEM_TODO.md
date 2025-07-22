# Preset System - Future Development Instructions

## Current Status ✅

### What's Working
1. **Layer Presets**
   - Save/load layer visibility states
   - Save category expansion states
   - Save master checkbox states
   - Save search values
   - Default preset auto-creation
   - Full CRUD operations (Create, Read, Update, Delete)

2. **UI Presets**
   - Save/load control visibility (zoom, navigation, scale, etc.)
   - Save drawer open/closed states
   - Save map view settings (pitch, bearing, zoom, center)
   - Save theme preferences (button size, color theme)
   - Default preset with sensible defaults

3. **User Interface**
   - Layer preset button in Feature Layers drawer header
   - UI preset button in Settings drawer (UI tab)
   - Mobile-friendly preset management dialogs
   - Command line interface integration
   - Visual indicators for active presets

## Future Enhancements 🚀

### 1. Import/Export Presets
```javascript
// Add to App.Map.Layers.Presets
exportPreset: function(presetId) {
  // Export preset as JSON file
},

importPreset: function(jsonData) {
  // Import preset from JSON
}
```

### 2. Preset Sharing
- Generate shareable URLs for presets
- QR codes for mobile sharing
- Copy preset configuration to clipboard

### 3. Auto-Save Functionality
```javascript
// Add auto-save on significant changes
App.Core.Events.on('layer:visibility:changed', function() {
  // Debounced auto-save to "Last Session" preset
});
```

### 4. Preset Categories/Tags
- Organize presets by project/category
- Add search/filter functionality
- Color coding for different preset types

### 5. Keyboard Shortcuts
```javascript
// Add keyboard shortcuts for quick preset switching
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
    // Load preset by number
  }
});
```

### 6. Enhanced UI State Saving
- Save measurement tool states
- Save active tools and modes
- Save custom marker positions
- Save drawing/annotation states

### 7. Preset Sync
- Cloud sync using user accounts
- Device sync via QR codes
- Backup to external services

### 8. Advanced Features
- Preset scheduling (time-based activation)
- Conditional presets (based on location, zoom level)
- Preset combinations (layer preset + UI preset)
- Preset inheritance/templates

## Implementation Priority 📋

### High Priority
1. **Import/Export** - Essential for backup and sharing
2. **Keyboard Shortcuts** - Improves workflow efficiency
3. **Auto-Save** - Prevents loss of configurations

### Medium Priority
1. **Preset Categories** - Better organization
2. **Enhanced UI State** - More comprehensive saves
3. **Preset Combinations** - Link layer and UI presets

### Low Priority
1. **Cloud Sync** - Requires backend infrastructure
2. **Conditional Presets** - Advanced use cases
3. **Preset Scheduling** - Specialized feature

## Technical Considerations 💡

### Storage Optimization
```javascript
// Consider compression for large preset collections
function compressPresets(presets) {
  return LZString.compress(JSON.stringify(presets));
}
```

### Performance
- Lazy load preset data
- Implement virtual scrolling for large preset lists
- Cache frequently used presets

### Compatibility
- Version presets for backward compatibility
- Migration system for preset upgrades
- Validation for imported presets

## Code Locations 📁

### Core Modules
- `/src/map/app.map.layers.presets.js` - Layer preset logic
- `/src/ui/app.ui.state.js` - UI state management
- `/src/ui/app.ui.presets.js` - Preset UI components

### Integration Points
- `/src/commandline/commandline-interface.js` - CLI commands (line 2219)
- `/index.html` - Module includes (lines 834, 827-828)

### Key Functions
```javascript
// Save new preset
App.Map.Layers.Presets.savePreset(name)
App.UI.State.savePreset(name)

// Load preset
App.Map.Layers.Presets.loadPreset(id)
App.UI.State.loadPreset(id)

// Show dialogs
App.UI.Presets.showLayerPresets()
App.UI.Presets.showUIPresets()
```

## Testing Checklist ✓

- [ ] Test preset saving with special characters in names
- [ ] Test preset limits (max number of presets)
- [ ] Test preset loading with missing layers
- [ ] Test UI preset with different screen sizes
- [ ] Test preset persistence across sessions
- [ ] Test preset conflicts resolution
- [ ] Test performance with many presets

## Next Steps 👣

1. **Gather User Feedback**
   - Which features are most important?
   - What workflows need optimization?
   - Any missing functionality?

2. **Implement Import/Export**
   - Start with simple JSON export
   - Add file picker for import
   - Validate imported data

3. **Add Keyboard Shortcuts**
   - Define shortcut scheme
   - Add visual hints in UI
   - Document shortcuts

4. **Optimize Storage**
   - Monitor localStorage usage
   - Implement cleanup strategies
   - Consider IndexedDB for larger datasets

## Notes 📝

- The preset system follows the app's modular architecture
- All presets are stored in localStorage with no expiration
- The system is designed to be extensible
- Mobile responsiveness is a priority
- Consider accessibility features in future updates