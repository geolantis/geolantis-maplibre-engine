/**
 * Line style converter utility
 * Converts Android line style patterns to MapLibre line-dasharray format
 */
App.Utils = App.Utils || {};
App.Utils.LineStyleConverter = (function() {
    
    /**
     * Line style constants matching Android GeoObjectCategory
     */
    const LINE_STYLES = {
        LINESTYLE_SOLID: 0,
        LINESTYLE_DASHED: 1,
        LINESTYLE_DOTTED: 2,
        LINESTYLE_DASHLONG: 3,
        LINESTYLE_DASHMEDIUM: 4,
        LINESTYLE_DASHLONGDOTSINGLE: 5,
        LINESTYLE_DASHMEDIUMDOTDOUBLE: 6,
        LINESTYLE_DASHLONGDOTTRIPLE: 7,
        LINESTYLE_DASHLONGDASHSHORT: 8,
        LINESTYLE_DASHSHORTDOTQUAD: 9,
        LINESTYLE_DASHDOUBLEDOTQUAD: 10,
        LINESTYLE_DOTDOUBLEDASHDOUBLE: 11,
        LINESTYLE_DASHQUAD: 12,
        LINESTYLE_DOTDOUBLEDOTMULTI: 13,
        LINESTYLE_DASHLONGDOTDOUBLEDASH: 14
    };
    
    /**
     * Map of Android dash patterns to MapLibre dash arrays
     * Based on getDashPathEffectForLineStyle from GeoObjectCategory.java
     */
    const DASH_PATTERNS = {
        [LINE_STYLES.LINESTYLE_SOLID]: null,
        [LINE_STYLES.LINESTYLE_DASHED]: "5, 10",
        [LINE_STYLES.LINESTYLE_DOTTED]: "1, 5",
        [LINE_STYLES.LINESTYLE_DASHLONG]: "30, 15",
        [LINE_STYLES.LINESTYLE_DASHMEDIUM]: "15",
        [LINE_STYLES.LINESTYLE_DASHLONGDOTSINGLE]: "30, 10, 2, 10",
        [LINE_STYLES.LINESTYLE_DASHMEDIUMDOTDOUBLE]: "30, 10, 2, 10, 2, 10",
        [LINE_STYLES.LINESTYLE_DASHLONGDOTTRIPLE]: "30, 10, 2, 10, 2, 10, 2, 10",
        [LINE_STYLES.LINESTYLE_DASHLONGDASHSHORT]: "45, 10, 15, 10",
        [LINE_STYLES.LINESTYLE_DASHSHORTDOTQUAD]: "15, 10, 2, 10, 2, 10, 2, 10, 2, 10",
        [LINE_STYLES.LINESTYLE_DASHDOUBLEDOTQUAD]: "15, 10, 15, 10, 2, 10, 2, 10, 2, 10, 2, 10",
        [LINE_STYLES.LINESTYLE_DOTDOUBLEDASHDOUBLE]: "15, 10, 15, 10, 2, 10, 2, 10",
        [LINE_STYLES.LINESTYLE_DASHQUAD]: "15, 10, 15, 10, 15, 10, 15, 30",
        [LINE_STYLES.LINESTYLE_DOTDOUBLEDOTMULTI]: "2, 7, 2, 20, 2, 7, 2, 7, 2, 7, 2, 7, 2, 7, 2, 7, 2, 7, 2, 20",
        [LINE_STYLES.LINESTYLE_DASHLONGDOTDOUBLEDASH]: "30, 10, 2, 10, 2, 10, 15, 10, 2, 10, 2, 10"
    };
    
    /**
     * Convert Android dash pattern string to MapLibre line-dasharray
     * @param {string} dashPattern - Android dash pattern (e.g. "5, 10")
     * @param {number} lineWidth - Line width for scaling
     * @returns {Array|null} MapLibre dash array or null for solid lines
     */
    function convertDashPattern(dashPattern, lineWidth = 1) {
        if (!dashPattern) return null;
        
        // Parse the dash pattern string
        const values = dashPattern.split(',').map(v => parseFloat(v.trim()));
        
        // MapLibre dash arrays are relative to line width
        // We scale the pattern based on line width to maintain proportions
        const scale = 1 / lineWidth;
        return values.map(v => v * scale);
    }
    
    /**
     * Get MapLibre dash array for a line style constant
     * @param {number} lineStyle - Line style constant
     * @param {number} lineWidth - Line width for scaling
     * @returns {Array|null} MapLibre dash array or null for solid lines
     */
    function getDashArrayForLineStyle(lineStyle, lineWidth = 1) {
        const pattern = DASH_PATTERNS[lineStyle];
        if (!pattern) return null;
        
        return convertDashPattern(pattern, lineWidth);
    }
    
    /**
     * Convert a style object with Android line style to MapLibre format
     * @param {Object} androidStyle - Android style object
     * @returns {Object} MapLibre style object
     */
    function convertAndroidStyleToMapLibre(androidStyle) {
        if (!androidStyle) return {};
        
        const maplibreStyle = {};
        
        // Convert color properties
        if (androidStyle.color) {
            maplibreStyle['line-color'] = androidStyle.color;
        }
        if (androidStyle['line-color']) {
            maplibreStyle['line-color'] = androidStyle['line-color'];
        }
        
        // Convert width
        if (androidStyle.weight) {
            maplibreStyle['line-width'] = androidStyle.weight;
        }
        if (androidStyle['line-width']) {
            maplibreStyle['line-width'] = androidStyle['line-width'];
        }
        
        // Convert opacity
        if (androidStyle.opacity !== undefined) {
            maplibreStyle['line-opacity'] = androidStyle.opacity;
        }
        
        // Convert dash pattern
        if (androidStyle.dashPattern) {
            const lineWidth = maplibreStyle['line-width'] || 2;
            maplibreStyle['line-dasharray'] = convertDashPattern(androidStyle.dashPattern, lineWidth);
        }
        if (androidStyle['line-dasharray']) {
            maplibreStyle['line-dasharray'] = androidStyle['line-dasharray'];
        }
        
        // Handle line style constant
        if (androidStyle.lineStyle !== undefined) {
            const lineWidth = maplibreStyle['line-width'] || 2;
            const dashArray = getDashArrayForLineStyle(androidStyle.lineStyle, lineWidth);
            if (dashArray) {
                maplibreStyle['line-dasharray'] = dashArray;
            }
        }
        
        return maplibreStyle;
    }
    
    // Public API
    return {
        LINE_STYLES: LINE_STYLES,
        convertDashPattern: convertDashPattern,
        getDashArrayForLineStyle: getDashArrayForLineStyle,
        convertAndroidStyleToMapLibre: convertAndroidStyleToMapLibre
    };
})();