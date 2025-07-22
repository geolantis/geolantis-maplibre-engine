/**
 * Enhanced Direct German Override
 * This bypasses the i18n system and directly replaces text with German
 * Includes more aggressive monitoring and dynamic content handling
 */

console.log('[ENHANCED-DE] Enhanced German override starting...');

// German translations map - expanded with all possible variations
const germanTranslations = {
    // Core UI tabs
    'Layers': 'Ebenen',
    'Basemaps': 'Basiskarten',
    'Overlays': 'Overlays',
    'Offline Maps': 'Offline-Karten',
    'Bookmarks': 'Lesezeichen',
    'Settings': 'Einstellungen',
    'Tools': 'Werkzeuge',
    
    // Settings sections
    'Map Settings': 'Karteneinstellungen',
    'Map Rotation': 'Kartendrehung',
    'Rotate with compass': 'Mit Kompass drehen',
    'Allow Pitch': 'Neigung erlauben',
    'Background': 'Hintergrund',
    '3D Building': '3D Gebäude',
    'Accuracy Circle': 'Genauigkeitskreis',
    'Layer Settings': 'Ebeneneinstellungen',
    'Background Transparency': 'Hintergrundtransparenz',
    'UI Settings': 'UI-Einstellungen',
    'Zoom control': 'Zoom-Steuerung',
    'Show scale': 'Maßstab anzeigen',
    'Metric units': 'Metrische Einheiten',
    'Status Bar': 'Statusleiste',
    'Feature Layers': 'Feature-Ebenen',
    
    // Button labels
    'Visible': 'Sichtbar',
    'Select': 'Auswählen',
    'Search': 'Suche',
    'Reset to Default Basemap': 'Basiskarte zurücksetzen',
    'Toggle Kataster': 'Kataster umschalten',
    'Toggle Kataster BEV': 'Kataster BEV umschalten',
    'Toggle Kataster Grau': 'Kataster Grau umschalten',
    
    // Button sizes - all variations
    'Button Size': 'Schaltflächengröße',
    'Small': 'Klein',
    'Medium': 'Mittel',
    'Large': 'Groß',
    'Extra Large': 'Extra groß',
    'Extra<br>Large': 'Extra<br>groß',
    
    // Color themes - all variations  
    'Color Theme': 'Farbschema',
    'Light': 'Hell',
    'Geolantis': 'Geolantis',
    'Glow': 'Leuchten',
    'Geolantis<br>Glow': 'Geolantis<br>Leuchten',
    'Trans': 'Transparent',
    'Trans<br>Black': 'Trans.<br>Schwarz',
    'Black': 'Schwarz',
    'White': 'Weiß',
    'Trans<br>White': 'Trans.<br>Weiß',
    
    // Presets - including all variations and translation keys
    'Presets': 'Voreinstellungen',
    'presets.presets': 'Voreinstellungen',
    'preset.ui_presets': 'UI-Voreinstellungen',
    'presets.ui_presets': 'UI-Voreinstellungen',
    'presets.saverestore_ui_layout': 'UI-Layout speichern/wiederherstellen',
    'UI Presets': 'UI-Voreinstellungen',
    'Layer Presets': 'Ebenen-Voreinstellungen',
    'Manage Presets': 'Voreinstellungen verwalten',
    'Save Preset': 'Voreinstellung speichern',
    'Preset Name': 'Name der Voreinstellung',
    'Save/Restore UI Layout': 'UI-Layout speichern/wiederherstellen',
    
    // Tools
    'Command Line Tool': 'Kommandozeilen-Tool',
    
    // Measurement
    'Measurement Modes': 'Messmodi',
    'Point': 'Punkt',
    'Line': 'Linie',
    'Polygon': 'Polygon',
    'Rectangle': 'Rechteck',
    'Circle': 'Kreis',
    'Sector': 'Sektor',
    'Sensor': 'Sensor',
    'Freehand': 'Freihand',
    'Angled Rectangle': 'Schräges Rechteck',
    
    // Status bar
    'Enable Status Bar': 'Statusleiste aktivieren',
    'Display Settings': 'Anzeigeeinstellungen',
    'Ultra Thin (28px)': 'Ultra dünn (28px)',
    'Compact (32px)': 'Kompakt (32px)',
    'Normal (40px)': 'Normal (40px)',
    
    // Additional UI elements
    'Adjust the transparency of background layers': 'Transparenz der Hintergrundebenen anpassen',
    'Toggle measurement modes on/off. Changes take effect when measurement tool is restarted.': 'Messmodi ein-/ausschalten. Änderungen werden wirksam, wenn das Messwerkzeug neu gestartet wird.',
    'No offline maps available': 'Keine Offline-Karten verfügbar',
    'Add .mbtiles or .pmtiles files to enable offline mode': 'Fügen Sie .mbtiles- oder .pmtiles-Dateien hinzu, um den Offline-Modus zu aktivieren',
    'No bookmarks saved yet': 'Noch keine Lesezeichen gespeichert',
    
    // Search placeholders
    'Search feature classes...': 'Feature-Klassen suchen...',
    'Suchtext eingeben': 'Suchtext eingeben',
    
    // Layer controls
    'Collapse all categories': 'Alle Kategorien einklappen',
    'Expand all categories': 'Alle Kategorien ausklappen',
    'Show/hide layer': 'Ebene ein-/ausblenden',
    'Download layer': 'Ebene herunterladen',
    
    // Additional buttons
    'Zoom to GeoJSON Layers': 'Auf GeoJSON-Ebenen zoomen',
    'ADD Inspire WMS': 'Inspire WMS hinzufügen',
    'ADD BEV DKM GST': 'BEV DKM GST hinzufügen',
    'Explore BEV WMS Layers': 'BEV WMS-Ebenen erkunden',
    'Add bookmark': 'Lesezeichen hinzufügen',
    
    // Measurement tool
    'Measure area': 'Fläche messen',
    'Measure length': 'Länge messen',
    'Clear measurements': 'Messungen löschen',
    'Enable Snapping': 'Einrasten aktivieren',
    'Disable Snapping': 'Einrasten deaktivieren',
    
    // Loading and status
    'Loading...': 'Laden...',
    'Error': 'Fehler',
    'loading': 'Laden',
    
    // Stakeout module
    'Total': 'Gesamt',
    'Segments': 'Segmente',
    'stakeout.lines': 'Absteckungslinien',
    'stakeout.nodes': 'Absteckungspunkte'
};

// Function to clean text content (remove extra whitespace)
function cleanText(text) {
    return text.trim().replace(/\s+/g, ' ');
}

// Enhanced text replacement function
function replaceTextContent(node, translations) {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = cleanText(node.textContent);
        if (text && translations[text]) {
            node.textContent = translations[text];
            return true;
        }
    }
    return false;
}

// Replace innerHTML content (for elements with <br> tags)
function replaceInnerHTML(element, translations) {
    const html = element.innerHTML.trim();
    if (translations[html]) {
        element.innerHTML = translations[html];
        return true;
    }
    
    // Also check textContent as fallback
    const text = cleanText(element.textContent);
    if (text && translations[text]) {
        element.textContent = translations[text];
        return true;
    }
    return false;
}

// Main translation function
function applyEnhancedGermanTranslations() {
    console.log('[ENHANCED-DE] Applying enhanced German translations...');
    
    let changedCount = 0;
    
    // Method 1: Walk through all text nodes
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                if (node.parentElement.tagName === 'SCRIPT' || 
                    node.parentElement.tagName === 'STYLE') {
                    return NodeFilter.FILTER_SKIP;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );
    
    let node;
    while (node = walker.nextNode()) {
        if (replaceTextContent(node, germanTranslations)) {
            changedCount++;
        }
    }
    
    // Method 2: Target specific elements that might have innerHTML content
    const elementsWithInnerHTML = document.querySelectorAll('button, label, div.settings-label, h3, h4, sl-button, sl-tab, span');
    elementsWithInnerHTML.forEach(element => {
        if (replaceInnerHTML(element, germanTranslations)) {
            changedCount++;
        }
    });
    
    // Method 3: Update attributes
    document.querySelectorAll('[placeholder]').forEach(element => {
        const placeholder = element.placeholder;
        if (germanTranslations[placeholder]) {
            element.placeholder = germanTranslations[placeholder];
            changedCount++;
        }
    });
    
    document.querySelectorAll('[title]').forEach(element => {
        const title = element.title;
        if (germanTranslations[title]) {
            element.title = germanTranslations[title];
            changedCount++;
        }
    });
    
    document.querySelectorAll('[aria-label]').forEach(element => {
        const label = element.getAttribute('aria-label');
        if (germanTranslations[label]) {
            element.setAttribute('aria-label', germanTranslations[label]);
            changedCount++;
        }
    });
    
    console.log(`[ENHANCED-DE] Applied ${changedCount} German translations`);
}

// Set up MutationObserver to catch dynamically added content
const observerConfig = {
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: true
};

let translationObserver;

function startObserving() {
    if (translationObserver) {
        translationObserver.disconnect();
    }
    
    translationObserver = new MutationObserver((mutations) => {
        let shouldTranslate = false;
        
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                shouldTranslate = true;
                break;
            }
            if (mutation.type === 'characterData') {
                shouldTranslate = true;
                break;
            }
        }
        
        if (shouldTranslate) {
            // Debounce to avoid too many calls
            clearTimeout(window.enhancedTranslationTimeout);
            window.enhancedTranslationTimeout = setTimeout(() => {
                applyEnhancedGermanTranslations();
            }, 100);
        }
    });
    
    translationObserver.observe(document.body, observerConfig);
    console.log('[ENHANCED-DE] Started observing DOM changes');
}

// Apply translations multiple times to catch all content
function initializeEnhancedTranslations() {
    console.log('[ENHANCED-DE] Initializing enhanced translations...');
    
    // Initial application
    applyEnhancedGermanTranslations();
    
    // Start observing
    startObserving();
    
    // Apply at various intervals to catch late-loading content
    const delays = [500, 1000, 2000, 3000, 5000];
    delays.forEach(delay => {
        setTimeout(applyEnhancedGermanTranslations, delay);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancedTranslations);
} else {
    initializeEnhancedTranslations();
}

// Listen for tab changes and other events
document.addEventListener('sl-tab-show', () => {
    setTimeout(applyEnhancedGermanTranslations, 100);
});

// Also listen for custom events that might indicate content changes
['contentLoaded', 'layersLoaded', 'mapReady'].forEach(eventName => {
    document.addEventListener(eventName, () => {
        setTimeout(applyEnhancedGermanTranslations, 100);
    });
});

// Make functions available globally for debugging
window.enhancedGermanOverride = {
    apply: applyEnhancedGermanTranslations,
    startObserving: startObserving,
    stopObserving: () => {
        if (translationObserver) {
            translationObserver.disconnect();
            console.log('[ENHANCED-DE] Stopped observing');
        }
    },
    translations: germanTranslations
};

console.log('[ENHANCED-DE] Enhanced German override loaded - use window.enhancedGermanOverride to access functions');