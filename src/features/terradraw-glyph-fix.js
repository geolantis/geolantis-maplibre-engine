/**
 * TerraDraw Glyph Fix
 * Ensures TerraDraw measurement text has proper glyphs after basemap changes
 * @namespace App.Features.TerraDrawGlyphFix
 */
App.Features = App.Features || {};
App.Features.TerraDrawGlyphFix = (function() {
    var _map = null;
    var _glyphsUrl = 'https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=ldV32HV5eBdmgfE7vZJI';
    var _spriteUrl = 'https://api.maptiler.com/maps/streets/sprite';
    
    /**
     * Check if a glyph URL is problematic
     * @private
     * @param {string} glyphUrl - The glyph URL to check
     * @returns {boolean} Whether the URL is problematic
     */
    function _isProblematicGlyphUrl(glyphUrl) {
        if (!glyphUrl) return true; // No glyph URL defined
        
        // List of known problematic glyph servers
        const problematicServers = [
            'ktn.gv.at',           // Kärnten basemaps
            'kataster.bev.gv.at',  // Kataster basemaps
            'localhost',           // Local development servers
            'file://',            // Local file references
            'basemaps.cartocdn.com', // May not have all required fonts
            'demotiles.maplibre.org', // Demo servers with limited fonts
            'geoportal.de',        // German basemaps
            'gis.ktn.gv.at',       // Kärnten GIS server
            'maps.geoapify.com'    // May have limited fonts
        ];
        
        // Check if the glyph URL contains any problematic server
        return problematicServers.some(server => glyphUrl.includes(server)) ||
               glyphUrl === '{glyphs}'; // Placeholder value
    }
    
    /**
     * Check and fix symbol layers that need glyphs
     * @private
     */
    function _fixSymbolLayers() {
        if (!_map || !_map.getStyle()) return;
        
        const style = _map.getStyle();
        if (!style.layers) return;
        
        // Find all TerraDraw symbol layers
        const symbolLayers = style.layers.filter(layer => 
            layer.type === 'symbol' && 
            (layer.id.includes('terradraw') || layer.id.includes('measure'))
        );
        
        symbolLayers.forEach(layer => {
            // Check if layer has text-field
            if (layer.layout && layer.layout['text-field']) {
                // Ensure proper font is set
                if (!layer.layout['text-font']) {
                    console.log(`Setting font for TerraDraw layer: ${layer.id}`);
                    // Use commonly available fonts that work with most glyph sources
                    _map.setLayoutProperty(layer.id, 'text-font', [
                        'Noto Sans Regular',
                        'Open Sans Regular', 
                        'Arial Unicode MS Regular',
                        'DIN Offc Pro Regular',
                        'sans-serif'
                    ]);
                }
                
                // Ensure text is visible
                if (!layer.layout['text-size']) {
                    _map.setLayoutProperty(layer.id, 'text-size', 14);
                }
                
                // Ensure text has proper styling
                if (!layer.paint) layer.paint = {};
                if (!layer.paint['text-color']) {
                    _map.setPaintProperty(layer.id, 'text-color', '#333333');
                }
                if (!layer.paint['text-halo-color']) {
                    _map.setPaintProperty(layer.id, 'text-halo-color', '#FFFFFF');
                }
                if (!layer.paint['text-halo-width']) {
                    _map.setPaintProperty(layer.id, 'text-halo-width', 2);
                }
            }
        });
    }
    
    /**
     * Ensure the map style has glyphs for TerraDraw
     * @private
     */
    function _ensureGlyphs() {
        if (!_map) return;
        
        const style = _map.getStyle();
        if (!style) return;
        
        // Check if current glyphs URL is problematic
        if (_isProblematicGlyphUrl(style.glyphs)) {
            console.log('Problematic glyph URL detected:', style.glyphs);
            console.log('Applying direct glyph fix without style reload...');
            
            // Method 1: Direct style modification (less disruptive)
            try {
                // Update the glyphs URL directly in the style object
                if (_map._style) {
                    _map._style.glyphs = _glyphsUrl;
                    console.log('Updated internal style glyphs to:', _glyphsUrl);
                }
                
                // Update the sprite URL if needed
                if (_map._style && (!_map._style.sprite || _map._style.sprite.includes('ktn.gv.at'))) {
                    _map._style.sprite = _spriteUrl;
                    console.log('Updated internal style sprite to:', _spriteUrl);
                }
                
                // Force update of glyph manager if it exists
                if (_map._glyphManager || (_map.style && _map.style.glyphManager)) {
                    const glyphManager = _map._glyphManager || _map.style.glyphManager;
                    if (glyphManager && glyphManager.setURL) {
                        glyphManager.setURL(_glyphsUrl);
                        console.log('Updated glyph manager URL');
                    }
                }
                
                // Fix symbol layers without reloading
                _fixSymbolLayers();
                
                // Force a render update
                if (_map.triggerRepaint) {
                    _map.triggerRepaint();
                }
                
                return true;
            } catch (e) {
                console.warn('Direct fix failed, falling back to style reload:', e);
                
                // Method 2: Full style reload (fallback)
                const fixedStyle = JSON.parse(JSON.stringify(style));
                fixedStyle.glyphs = _glyphsUrl;
                
                // Also fix sprite URL if needed
                if (!fixedStyle.sprite || fixedStyle.sprite === '{sprites}' || 
                    fixedStyle.sprite.includes('localhost') || 
                    fixedStyle.sprite.includes('ktn.gv.at') ||
                    fixedStyle.sprite.includes('kataster.bev.gv.at')) {
                    fixedStyle.sprite = _spriteUrl;
                    console.log('Also fixed sprite URL to:', _spriteUrl);
                }
                
                // Ensure TerraDraw layers use compatible fonts
                fixedStyle.layers.forEach(layer => {
                    if ((layer.id.includes('terradraw') || layer.id.includes('measure')) && 
                        layer.type === 'symbol' && layer.layout) {
                        // Force fonts that are available on most font servers
                        layer.layout['text-font'] = [
                            'Noto Sans Regular',
                            'Open Sans Regular',
                            'Arial Unicode MS Regular'
                        ];
                        
                        // Ensure text is visible
                        if (!layer.layout['text-size']) {
                            layer.layout['text-size'] = 14;
                        }
                    }
                });
                
                // Apply the fixed style
                _map.setStyle(fixedStyle);
                
                // Re-initialize after style change
                _map.once('style.load', () => {
                    console.log('Style reloaded with fixed glyphs');
                    // Trigger events to notify other modules
                    if (App.Core.Events) {
                        App.Core.Events.trigger('glyphs:fixed');
                    }
                });
                
                return true; // Style was fixed
            }
        } else {
            console.log('Glyph URL appears to be working:', style.glyphs);
        }
        
        // Fix any existing symbol layers
        _fixSymbolLayers();
        return false; // No fix needed
    }
    
    /**
     * Watch for new TerraDraw layers
     * @private
     */
    function _watchForLayers() {
        if (!_map) return;
        
        _map.on('data', (e) => {
            // Check if it's a TerraDraw source
            if (e.sourceId && (e.sourceId.includes('terradraw') || e.sourceId.includes('measure'))) {
                // Debounce to avoid too many calls
                clearTimeout(_watchForLayers._timeout);
                _watchForLayers._timeout = setTimeout(() => {
                    _ensureGlyphs();
                    _fixSymbolLayers();
                }, 100);
            }
        });
        
        // Also watch for style changes
        _map.on('style.load', () => {
            console.log('Style loaded - ensuring glyphs for TerraDraw');
            setTimeout(() => {
                _ensureGlyphs();
            }, 100);
        });
    }
    
    /**
     * Initialize the fix
     */
    function initialize(map) {
        _map = map || (App.Map.Init && App.Map.Init.getMap ? App.Map.Init.getMap() : null);
        
        if (!_map) {
            console.warn('TerraDraw Glyph Fix: No map instance available');
            return;
        }
        
        console.log('TerraDraw Glyph Fix initialized');
        
        // Initial check
        _ensureGlyphs();
        
        // Watch for changes
        _watchForLayers();
        
        // Listen for measurement events
        if (App.Core.Events) {
            App.Core.Events.on('measure:started', () => {
                console.log('Measurement started - ensuring glyphs');
                setTimeout(() => {
                    _ensureGlyphs();
                }, 500);
            });
            
            // Listen for basemap changes
            App.Core.Events.on('basemap:changed', () => {
                console.log('Basemap changed - ensuring glyphs for TerraDraw');
                setTimeout(() => {
                    _ensureGlyphs();
                }, 1000);
            });
            
            // Listen for style changes
            App.Core.Events.on('map:styleChanged', () => {
                console.log('Map style changed - ensuring glyphs for TerraDraw');
                setTimeout(() => {
                    _ensureGlyphs();
                }, 500);
            });
        }
    }
    
    // Auto-initialize when document is ready
    document.addEventListener('DOMContentLoaded', function() {
        const checkMap = setInterval(() => {
            const map = App.Map.Init && App.Map.Init.getMap ? App.Map.Init.getMap() : null;
            if (map) {
                clearInterval(checkMap);
                if (map.loaded()) {
                    initialize(map);
                } else {
                    map.once('load', () => {
                        initialize(map);
                    });
                }
            }
        }, 500);
    });
    
    // Public API
    return {
        initialize: initialize,
        ensureGlyphs: _ensureGlyphs,
        fixSymbolLayers: _fixSymbolLayers
    };
})();

console.log('terradraw-glyph-fix.js loaded - Ensures TerraDraw has glyphs for text rendering');