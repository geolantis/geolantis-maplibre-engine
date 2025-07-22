# EnhancedCommandLine Documentation

## Overview

The EnhancedCommandLine is a powerful command-line interface for the MapLibre-based GIS mapping application. It provides developers and power users with direct access to map functionality, debugging tools, and data inspection capabilities.

## Installation & Initialization

The command line is initialized automatically when the application loads. It can be accessed through:

1. **Tools Panel**: Click the "Command Line Tool" button in the UX tab of the left sidebar
2. **Global Access**: Use `window.mapConsole` from the browser console
3. **Keyboard Shortcut**: Press `Escape` to hide the command line when visible

## Basic Commands

### General Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `help` | Show all available commands | `help` |
| `clear` | Clear the console output | `clear` |
| `hide` | Hide the command line interface | `hide` |
| `eval` | Evaluate JavaScript code | `eval map.getZoom()` |

### Map Navigation

| Command | Description | Usage |
|---------|-------------|-------|
| `center` | Get or set map center coordinates | `center` or `center 13.4049 52.5200` |
| `zoom` | Get or set map zoom level | `zoom` or `zoom 15` |
| `bounds` | Get current map bounds | `bounds` |
| `position` | Get or set position marker | `position` or `position 13.4049 52.5200` |

### Layer Management

| Command | Description | Usage |
|---------|-------------|-------|
| `layers` | List all map layers | `layers` |
| `layers background` | List background and raster layers | `layers background` |
| `layers geojson` | List GeoJSON layers | `layers geojson` |
| `layers geojson-full` | Show detailed GeoJSON layer information | `layers geojson-full` |
| `layers objects` | List top 10 GeoJSON objects across all layers | `layers objects` |
| `layers objects-full` | Show detailed information about top GeoJSON objects | `layers objects-full` |
| `layers objects-by-layer` | List top 10 GeoJSON objects for each layer | `layers objects-by-layer` |
| `layers objects-by-layer-full` | Show detailed information about GeoJSON objects by layer | `layers objects-by-layer-full` |
| `layers raw [layer_id] [limit]` | Show raw GeoJSON for features | `layers raw buildings 3` |
| `toggle` | Toggle layer visibility | `toggle layerId` |

### Basemap & WMS

| Command | Description | Usage |
|---------|-------------|-------|
| `basemap` | Get or set the basemap | `basemap` or `basemap satellite` |
| `wms` | Inspect WMS capabilities or add WMS layers | `wms https://data.bev.gv.at/geoserver/BEVdataKAT/wms` |

## Advanced Features

### GNSS Simulator

Control the GNSS (GPS) simulator for testing location-based features:

| Command | Description | Usage |
|---------|-------------|-------|
| `gnss help` | Show GNSS simulator help | `gnss help` |
| `gnss start` | Start GNSS simulator | `gnss start` |
| `gnss stop` | Stop GNSS simulator | `gnss stop` |
| `gnss status` | Show current GNSS status | `gnss status` |
| `show-gnss` | Show GNSS simulator button | `show-gnss` |
| `hide-gnss` | Hide GNSS simulator button | `hide-gnss` |

### Feature Snapping

Enable snapping to map features for precise selection:

| Command | Description | Usage |
|---------|-------------|-------|
| `snap help` | Show snapping help | `snap help` |
| `snap init` | Initialize the feature snapper | `snap init` |
| `snap enable` | Enable snapping and show button | `snap enable` |
| `snap disable` | Disable snapping | `snap disable` |
| `snap toggle` | Toggle snapping state | `snap toggle` |
| `snap status` | Show current snapping status | `snap status` |
| `show-snap` | Show snapping button | `show-snap` |
| `hide-snap` | Hide snapping button | `hide-snap` |

**Keyboard Shortcut**: Press 'S' to toggle snapping when the snap button is visible.

### Button Visibility Control

Manage the visibility of control buttons:

| Command | Description | Usage |
|---------|-------------|-------|
| `buttons list` | List all control buttons and their status | `buttons list` |
| `buttons show all` | Show all available buttons | `buttons show all` |
| `buttons hide all` | Hide all control buttons | `buttons hide all` |
| `buttons show gnss` | Show GNSS simulator button | `buttons show gnss` |
| `buttons hide gnss` | Hide GNSS simulator button | `buttons hide gnss` |
| `buttons show snap` | Show snapping button | `buttons show snap` |
| `buttons hide snap` | Hide snapping button | `buttons hide snap` |
| `list` | List all button statuses | `list` |
| `show-all` | Show all buttons | `show-all` |
| `hide-all` | Hide all buttons | `hide-all` |

## Logging System

The command line includes a comprehensive logging system for GeoJSON conversions and feature operations:

### Basic Logging Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `log help` | Show logging command help | `log help` |
| `log status` | Show current logging status | `log status` |
| `log enable` | Enable GeoJSON conversion logging | `log enable` |
| `log disable` | Disable GeoJSON conversion logging | `log disable` |
| `log clear` | Clear the log history | `log clear` |
| `log show` | Show the latest log entries | `log show` |
| `log last` | Show the last GeoJSON conversion | `log last` |
| `log save` | Save logs to file | `log save` |
| `log filter <type>` | Filter logs by type | `log filter geometry` |

### Log Export Commands

Export logs in various formats for external analysis:

| Command | Description | Usage |
|---------|-------------|-------|
| `log clipboard` | Copy logs to clipboard | `log clipboard` |
| `log dataurl` | Generate a data URL with the logs | `log dataurl` |
| `log dataurl pretty` | Generate a data URL with formatted logs | `log dataurl pretty` |
| `log dataurl html` | Generate a formatted HTML version | `log dataurl html` |
| `log qrcode` | Export logs via QR code | `log qrcode` |
| `log paste` | Upload logs to temporary storage | `log paste` |

### WebSocket Export

For real-time log streaming:

| Command | Description | Usage |
|---------|-------------|-------|
| `log websocket ws://IP:PORT` | Send logs to a WebSocket server | `log websocket ws://192.168.1.100:8080` |
| `log websocket status` | Check WebSocket connection status | `log websocket status` |
| `log websocket disconnect` | Disconnect from WebSocket server | `log websocket disconnect` |

## Debug Commands

Debug functionality for development:

| Command | Description | Usage |
|---------|-------------|-------|
| `debug status` | Show current debug status | `debug status` |
| `debug enable` | Enable all debug features | `debug enable` |
| `debug disable` | Disable all debug features | `debug disable` |
| `debug panel` | Show visual debug panel | `debug panel` |
| `debug test` | Test status update functions | `debug test` |
| `debug logupdates` | Log all status updates to console | `debug logupdates` |
| `debug dom` | Test DOM status elements | `debug dom` |

## Navigation & History

- **Up/Down Arrow Keys**: Navigate through command history
- **Tab**: Auto-complete commands (if implemented)
- **Escape**: Hide the command line interface
- **Enter**: Execute the current command

## Examples

### Basic Map Operations
```
center 13.4049 52.5200
zoom 15
layers geojson
toggle buildings
```

### Working with GeoJSON Data
```
layers geojson-full
layers raw buildings 5
layers objects-by-layer-full
```

### Debugging and Logging
```
log enable
// Perform some map operations
log show
log save
```

### Feature Snapping
```
snap init
snap enable
// Click on map features to select them
snap status
```

### GNSS Simulation
```
gnss start
// Simulator will move around the map
gnss status
gnss stop
```

## Tips & Best Practices

1. **Performance**: When working with large datasets, use limits in commands like `layers raw [layer_id] [limit]`
2. **Debugging**: Enable logging before performing operations you want to track
3. **Export**: Use appropriate export format based on your needs:
   - `log clipboard` for quick copying
   - `log dataurl html` for readable reports
   - `log qrcode` for transferring to another device
4. **Keyboard Shortcuts**: Learn shortcuts like 'S' for snapping toggle to work more efficiently

## Error Handling

- Commands will show error messages in red (#ff0000)
- Warning messages appear in orange (#ffaa00)
- Success messages appear in green (#00ff00)
- Informational messages appear in blue (#00aaff)

## Global Access

The command line interface is accessible globally through:

```javascript
window.mapConsole.show()        // Show the command line
window.mapConsole.hide()        // Hide the command line
window.mapConsole.execute(cmd)  // Execute a command programmatically
window.mapConsole.addOutput(text, color)  // Add custom output
```

## Extending the Command Line

To add new commands, modify the `processCommand` method in the EnhancedCommandLine class:

```javascript
case 'mycommand':
    this.handleMyCommand(args);
    break;
```

Then implement your handler method:

```javascript
handleMyCommand(args) {
    // Your command logic here
    this.addOutput('Command executed', '#00ff00');
}
```