/**
 * Force fix for TerraDraw glyphs - aggressive approach
 * This module forces a complete style reload with working glyphs
 */
(function() {
    console.log('TerraDraw Force Glyph Fix loading...');
    
    const WORKING_GLYPHS = 'https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=ldV32HV5eBdmgfE7vZJI';
    const WORKING_SPRITE = 'https://api.maptiler.com/maps/streets/sprite';
    
    /**
     * Force fix glyphs by completely reloading the style
     */
    function forceFixGlyphs(map) {
        if (!map) return;
        
        const currentStyle = map.getStyle();
        if (!currentStyle) return;
        
        console.log('Force fixing glyphs...');
        console.log('Current glyphs:', currentStyle.glyphs);
        
        // Clone the current style
        const newStyle = JSON.parse(JSON.stringify(currentStyle));
        
        // Force working glyphs and sprite
        newStyle.glyphs = WORKING_GLYPHS;
        newStyle.sprite = WORKING_SPRITE;
        
        // Fix all symbol layers to use compatible fonts
        newStyle.layers.forEach(layer => {
            if (layer.type === 'symbol' && layer.layout) {
                // Use simple, widely available fonts
                layer.layout['text-font'] = ['Open Sans Regular', 'Arial Unicode MS Regular'];
                
                // Ensure text is visible
                if (layer.layout['text-field']) {
                    if (!layer.layout['text-size']) {
                        layer.layout['text-size'] = 14;
                    }
                    
                    // Ensure paint properties
                    if (!layer.paint) layer.paint = {};
                    if (!layer.paint['text-color']) {
                        layer.paint['text-color'] = '#000000';
                    }
                    if (!layer.paint['text-halo-color']) {
                        layer.paint['text-halo-color'] = '#FFFFFF';
                    }
                    if (!layer.paint['text-halo-width']) {
                        layer.paint['text-halo-width'] = 2;
                    }
                }
            }
        });
        
        console.log('Applying fixed style with working glyphs...');
        
        // Store current view state
        const center = map.getCenter();
        const zoom = map.getZoom();
        const bearing = map.getBearing();
        const pitch = map.getPitch();
        
        // Apply the new style
        map.setStyle(newStyle);
        
        // Restore view state after style loads
        map.once('style.load', () => {
            console.log('Style reloaded with fixed glyphs!');
            
            // Restore view
            map.jumpTo({
                center: center,
                zoom: zoom,
                bearing: bearing,
                pitch: pitch
            });
            
            // Trigger any necessary events
            if (window.App && App.Core && App.Core.Events) {
                App.Core.Events.trigger('glyphs:force-fixed');
            }
            
            // Check result
            setTimeout(() => {
                const newGlyphs = map.getStyle().glyphs;
                console.log('New glyphs URL:', newGlyphs);
                console.log('Fix successful:', newGlyphs === WORKING_GLYPHS);
            }, 100);
        });
    }
    
    /**
     * Auto-apply fix when map loads
     */
    function autoApplyFix() {
        const checkInterval = setInterval(() => {
            if (window.App && App.Map && App.Map.Init && App.Map.Init.getMap) {
                const map = App.Map.Init.getMap();
                if (map && map.loaded()) {
                    clearInterval(checkInterval);
                    
                    // Check if glyphs are problematic
                    const style = map.getStyle();
                    if (style && style.glyphs && 
                        (style.glyphs.includes('ktn.gv.at') || 
                         style.glyphs.includes('kataster.bev.gv.at') ||
                         !style.glyphs)) {
                        console.log('Problematic glyphs detected on load - applying force fix');
                        setTimeout(() => forceFixGlyphs(map), 1000);
                    }
                    
                    // Listen for basemap changes
                    if (App.Core && App.Core.Events) {
                        App.Core.Events.on('basemap:changed', () => {
                            setTimeout(() => {
                                const newStyle = map.getStyle();
                                if (newStyle && newStyle.glyphs && 
                                    (newStyle.glyphs.includes('ktn.gv.at') || 
                                     newStyle.glyphs.includes('kataster.bev.gv.at'))) {
                                    console.log('Problematic basemap loaded - applying force fix');
                                    forceFixGlyphs(map);
                                }
                            }, 500);
                        });
                    }
                }
            }
        }, 100);
    }
    
    // Start auto-fix
    autoApplyFix();
    
    // Expose for manual use
    window.forceFixTerraDrawGlyphs = function() {
        const map = (window.App && App.Map && App.Map.Init && App.Map.Init.getMap) ? 
            App.Map.Init.getMap() : null;
        if (map) {
            forceFixGlyphs(map);
        } else {
            console.error('Map not available');
        }
    };
    
    console.log('TerraDraw Force Glyph Fix loaded - use forceFixTerraDrawGlyphs() to manually apply');
})();