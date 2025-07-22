// Run this in the browser console to immediately fix the glyph issue

console.log('=== FIXING TERRADRAW GLYPHS ===');

// Method 1: Use the force fix if available
if (window.forceFixTerraDrawGlyphs) {
    console.log('Using force fix...');
    forceFixTerraDrawGlyphs();
} else {
    console.log('Force fix not available, trying direct fix...');
    
    // Method 2: Direct style update
    const map = App.Map.Init.getMap();
    const style = map.getStyle();
    
    console.log('Current glyphs:', style.glyphs);
    
    // Clone and fix the style
    const newStyle = JSON.parse(JSON.stringify(style));
    newStyle.glyphs = 'https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=ldV32HV5eBdmgfE7vZJI';
    newStyle.sprite = 'https://api.maptiler.com/maps/streets/sprite';
    
    // Fix fonts in all layers
    newStyle.layers.forEach(layer => {
        if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
            layer.layout['text-font'] = ['Open Sans Regular', 'Arial Unicode MS Regular'];
        }
    });
    
    console.log('Applying fixed style...');
    map.setStyle(newStyle);
    
    map.once('style.load', () => {
        console.log('Style reloaded! Check if labels are now visible.');
    });
}

console.log('Fix applied - measurement labels should now be visible!');