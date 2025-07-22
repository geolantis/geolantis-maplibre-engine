/**
 * TerraDraw Font Patch
 * Patches TerraDraw to use fonts that are guaranteed to work with various glyph sources
 */
(function() {
    console.log('TerraDraw Font Patch initializing...');
    
    // List of fonts to try in order of preference
    const FALLBACK_FONTS = [
        'Noto Sans Regular',
        'Open Sans Regular',
        'Roboto Regular',
        'Arial Unicode MS Regular',
        'DIN Offc Pro Regular',
        'sans-serif'
    ];
    
    /**
     * Patch the MaplibreTerradrawControl to use our fonts
     */
    function patchTerraDrawControl() {
        if (!window.MaplibreTerradrawControl || !window.MaplibreTerradrawControl.MaplibreMeasureControl) {
            setTimeout(patchTerraDrawControl, 500);
            return;
        }
        
        console.log('Patching TerraDraw control...');
        
        // Store original constructor
        const OriginalMeasureControl = window.MaplibreTerradrawControl.MaplibreMeasureControl;
        
        // Create patched constructor
        window.MaplibreTerradrawControl.MaplibreMeasureControl = function(options) {
            console.log('Creating patched MeasureControl');
            
            // Create instance with original constructor
            const instance = new OriginalMeasureControl(options);
            
            // Store original onAdd
            const originalOnAdd = instance.onAdd.bind(instance);
            
            // Override onAdd to patch the draw instance
            instance.onAdd = function(map) {
                const container = originalOnAdd(map);
                
                // Patch the draw instance after it's created
                setTimeout(() => {
                    if (instance.draw && instance.draw._api) {
                        patchDrawInstance(instance.draw, map);
                    }
                }, 100);
                
                // Also patch on every render
                if (instance.draw) {
                    instance.draw.on('render', () => {
                        ensureProperFonts(map);
                    });
                }
                
                return container;
            };
            
            return instance;
        };
        
        // Copy static properties
        Object.keys(OriginalMeasureControl).forEach(key => {
            window.MaplibreTerradrawControl.MaplibreMeasureControl[key] = OriginalMeasureControl[key];
        });
        
        // Ensure prototype chain
        window.MaplibreTerradrawControl.MaplibreMeasureControl.prototype = OriginalMeasureControl.prototype;
        
        console.log('TerraDraw control patched successfully');
    }
    
    /**
     * Patch a draw instance to use proper fonts
     */
    function patchDrawInstance(draw, map) {
        console.log('Patching draw instance...');
        
        // Override the styling functions if they exist
        if (draw._api && draw._api.setStyle) {
            const originalSetStyle = draw._api.setStyle.bind(draw._api);
            
            draw._api.setStyle = function(style) {
                // Modify style to use our fonts
                if (style && Array.isArray(style)) {
                    style = style.map(layer => {
                        if (layer.type === 'symbol' && layer.layout) {
                            layer.layout['text-font'] = FALLBACK_FONTS;
                        }
                        return layer;
                    });
                }
                
                return originalSetStyle(style);
            };
        }
    }
    
    /**
     * Ensure all TerraDraw symbol layers use proper fonts
     */
    function ensureProperFonts(map) {
        if (!map || !map.getStyle) return;
        
        const style = map.getStyle();
        if (!style || !style.layers) return;
        
        // Find all TerraDraw symbol layers
        style.layers.forEach(layer => {
            if (layer.type === 'symbol' && 
                (layer.id.includes('terradraw') || layer.id.includes('measure')) &&
                layer.layout && layer.layout['text-field']) {
                
                // Get current font
                const currentFont = map.getLayoutProperty(layer.id, 'text-font');
                
                // Update if needed
                if (!currentFont || !Array.isArray(currentFont) || 
                    !FALLBACK_FONTS.some(font => currentFont.includes(font))) {
                    
                    try {
                        map.setLayoutProperty(layer.id, 'text-font', FALLBACK_FONTS);
                        console.log(`Updated font for layer: ${layer.id}`);
                    } catch (e) {
                        // Ignore errors, layer might be transitioning
                    }
                }
            }
        });
    }
    
    /**
     * Monitor for map style changes
     */
    function setupMapMonitoring() {
        const checkMap = setInterval(() => {
            const map = (window.App && App.Map && App.Map.Init && App.Map.Init.getMap) ? 
                App.Map.Init.getMap() : null;
            
            if (map) {
                clearInterval(checkMap);
                
                // Monitor style changes
                map.on('style.load', () => {
                    console.log('Style loaded - ensuring TerraDraw fonts');
                    setTimeout(() => ensureProperFonts(map), 500);
                });
                
                // Monitor data changes
                map.on('data', (e) => {
                    if (e.sourceId && (e.sourceId.includes('terradraw') || e.sourceId.includes('measure'))) {
                        // Debounced font check
                        clearTimeout(setupMapMonitoring._timeout);
                        setupMapMonitoring._timeout = setTimeout(() => {
                            ensureProperFonts(map);
                        }, 100);
                    }
                });
                
                // Initial check
                ensureProperFonts(map);
            }
        }, 500);
    }
    
    // Start patching
    patchTerraDrawControl();
    setupMapMonitoring();
    
    // Expose for manual use
    window.ensureTerraDrawFonts = function() {
        const map = (window.App && App.Map && App.Map.Init && App.Map.Init.getMap) ? 
            App.Map.Init.getMap() : null;
        if (map) {
            ensureProperFonts(map);
        }
    };
    
    console.log('TerraDraw Font Patch loaded. Use ensureTerraDrawFonts() to manually apply.');
})();