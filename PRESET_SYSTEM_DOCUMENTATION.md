# Preset System Documentation

## Overview

This application now includes a comprehensive preset management system that allows users to save and restore both layer visibility states and UI configurations. The system is designed to be mobile-friendly and integrates seamlessly with the existing UI.

## Features

### Layer Presets
- Save current layer visibility and selectability states
- Save category expansion states
- Save master checkbox states
- Save search input values
- Automatic "Default" preset that captures the initial state

### UI Presets  
- Save control visibility states (zoom, navigation, scale, etc.)
- Save drawer open/closed states
- Save map view settings (pitch, bearing, zoom, center)
- Save theme preferences (button size, color theme)

## Usage

### Accessing Presets

#### Layer Presets
1. Open the "Feature Layers" drawer (left sidebar, layer icon)
2. Click the "Presets" button in the drawer header
3. The preset dialog will open showing all saved presets

#### UI Presets
1. Open the "Settings" drawer (right sidebar, gear icon)
2. Scroll down to find the "UI Presets" section
3. Click the "Presets" button
4. The preset dialog will open showing all saved UI presets

### Managing Presets

#### Saving a New Preset
1. Configure layers/UI to your desired state
2. Open the appropriate preset dialog
3. Click "Save Current State"
4. Enter a name for your preset
5. Click "Save"

#### Loading a Preset
- Click on any preset in the list to load it
- Or click the download icon button
- The currently active preset is highlighted

#### Updating a Preset
1. Load the preset you want to update
2. Make your changes
3. Click the refresh icon on the preset
4. Confirm the update

#### Deleting a Preset
1. Click the trash icon on the preset
2. Confirm the deletion
3. Note: The "Default" preset cannot be deleted

### Default Preset
- Automatically created on first use
- Represents the initial state of the application
- Can be loaded but not deleted
- Always appears first in the list

## Mobile Considerations

The preset system is fully mobile-responsive:
- Larger touch targets for mobile devices
- Responsive dialog sizing
- Clear visual feedback for actions
- Confirmation dialogs for destructive actions

## Technical Details

### Storage
- Presets are stored in localStorage
- Layer presets key: `geo360_layer_presets`
- UI presets key: `geo360_ui_presets`
- No expiration on preset data (unlike temporary state)

### API

#### Layer Presets API
```javascript
// Save current state as new preset
App.Map.Layers.Presets.savePreset(name)

// Load a preset
App.Map.Layers.Presets.loadPreset(presetId)

// Update existing preset
App.Map.Layers.Presets.updatePreset(presetId)

// Delete a preset
App.Map.Layers.Presets.deletePreset(presetId)

// Get all presets
App.Map.Layers.Presets.getAllPresets()

// Reset to default
App.Map.Layers.Presets.resetToDefault()
```

#### UI Presets API
```javascript
// Save current UI state as new preset
App.UI.State.savePreset(name)

// Load a UI preset
App.UI.State.loadPreset(presetId)

// Update existing UI preset
App.UI.State.updatePreset(presetId)

// Delete a UI preset
App.UI.State.deletePreset(presetId)

// Get all UI presets
App.UI.State.getAllPresets()

// Reset to default UI
App.UI.State.resetToDefault()
```

### Events

The system triggers events that can be listened to:

```javascript
// Layer preset events
App.Core.Events.on('preset:saved', function(data) {
  console.log('Preset saved:', data.name);
});

App.Core.Events.on('preset:loaded', function(data) {
  console.log('Preset loaded:', data.name);
});

// UI preset events
App.Core.Events.on('ui:preset:saved', function(data) {
  console.log('UI preset saved:', data.name);
});

App.Core.Events.on('ui:preset:loaded', function(data) {
  console.log('UI preset loaded:', data.name);
});
```

## Files Added

1. `/src/map/app.map.layers.presets.js` - Layer preset management
2. `/src/ui/app.ui.state.js` - UI state management
3. `/src/ui/app.ui.presets.js` - Preset UI components

All files follow the existing module pattern and are automatically initialized when the DOM is ready.