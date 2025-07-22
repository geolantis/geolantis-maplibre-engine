// Quick test for glyph fix
// Run this in the browser console

// Check if the glyph fix module detects the problematic URL
const map = App.Map.Init.getMap();
const style = map.getStyle();
console.log('Current glyph URL:', style.glyphs);
console.log('Is gis.ktn.gv.at problematic?', style.glyphs.includes('gis.ktn.gv.at'));

// Manually trigger the fix
if (App.Features.TerraDrawGlyphFix) {
    console.log('Forcing glyph fix...');
    App.Features.TerraDrawGlyphFix.ensureGlyphs();
} else {
    console.error('Glyph fix module not found\!');
}
