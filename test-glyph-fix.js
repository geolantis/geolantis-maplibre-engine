/**
 * Manual test script for TerraDraw glyph fix
 * Run these commands in the browser console to test the fix
 */

// Check current glyph status
function checkGlyphStatus() {
    const map = App.Map.Init.getMap();
    const style = map.getStyle();
    console.log('=== Glyph Status ===');
    console.log('Glyphs URL:', style.glyphs);
    console.log('Sprite URL:', style.sprite);
    
    // Check if problematic
    const problematicServers = ['ktn.gv.at', 'kataster.bev.gv.at', 'localhost', 'file://', 'geoportal.de'];
    const isProblematic = !style.glyphs || problematicServers.some(server => style.glyphs.includes(server));
    console.log('Is Problematic:', isProblematic);
    
    // Check TerraDraw layers
    const terraDrawLayers = style.layers.filter(l => l.id.includes('terradraw') || l.id.includes('measure'));
    console.log('TerraDraw Layers:', terraDrawLayers.length);
    
    terraDrawLayers.forEach(layer => {
        if (layer.type === 'symbol') {
            console.log(`Layer ${layer.id}:`, {
                font: layer.layout?.['text-font'],
                size: layer.layout?.['text-size'],
                field: layer.layout?.['text-field']
            });
        }
    });
}

// Test basemap switching
function testBasemapSwitch(basemapName) {
    console.log(`\n=== Testing ${basemapName} ===`);
    App.Map.Basemap.setBasemap(basemapName);
    
    // Check after style loads
    setTimeout(() => {
        checkGlyphStatus();
    }, 2000);
}

// Force glyph fix
function forceGlyphFix() {
    console.log('\n=== Forcing Glyph Fix ===');
    if (App.Features.TerraDrawGlyphFix) {
        App.Features.TerraDrawGlyphFix.ensureGlyphs();
    }
    if (window.ensureTerraDrawFonts) {
        window.ensureTerraDrawFonts();
    }
}

// Test measurement with current basemap
function testMeasurement() {
    console.log('\n=== Testing Measurement ===');
    // Click measurement button
    const measureBtn = document.querySelector('#measureControl');
    if (measureBtn) {
        measureBtn.click();
        console.log('Measurement tool activated - draw on map to test labels');
    } else {
        console.log('Measurement button not found');
    }
}

// Run full test sequence
function runFullTest() {
    console.log('Starting full glyph fix test...\n');
    
    const basemaps = ['Kärnten', 'Kärnten Gray', 'Kataster Light', 'Global'];
    let index = 0;
    
    function testNext() {
        if (index < basemaps.length) {
            testBasemapSwitch(basemaps[index]);
            index++;
            setTimeout(testNext, 5000);
        } else {
            console.log('\n=== Test Complete ===');
            console.log('Check if measurement labels appear on all basemaps');
        }
    }
    
    testNext();
}

// Log instructions
console.log(`
TerraDraw Glyph Fix Test Commands:
==================================
checkGlyphStatus()         - Check current glyph configuration
testBasemapSwitch('name')  - Switch to a basemap and check glyphs
forceGlyphFix()           - Manually trigger the glyph fix
testMeasurement()         - Activate measurement tool
runFullTest()             - Run automated test sequence

Problematic basemaps to test:
- 'Kärnten'
- 'Kärnten Gray'  
- 'Kataster Light'
- 'Brandenburg'

Working basemap for comparison:
- 'Global'
`);