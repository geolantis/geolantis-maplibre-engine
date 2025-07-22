/**
 * Direct German Override
 * This bypasses the i18n system and directly replaces text with German
 */

console.log('[DIRECT-DE] Direct German override starting...');

// German translations map
const germanTranslations = {
    'Layers': 'Ebenen',
    'Basemaps': 'Basiskarten', 
    'Overlays': 'Overlays',
    'Offline Maps': 'Offline-Karten',
    'Bookmarks': 'Lesezeichen',
    'Settings': 'Einstellungen',
    'Tools': 'Werkzeuge',
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
    'Visible': 'Sichtbar',
    'Select': 'Auswählen',
    'Search': 'Suche',
    'No bookmarks saved yet': 'Noch keine Lesezeichen gespeichert',
    'Reset to Default Basemap': 'Basiskarte zurücksetzen',
    'Toggle Kataster': 'Kataster umschalten',
    'Toggle Kataster BEV': 'Kataster BEV umschalten',
    'Toggle Kataster Grau': 'Kataster Grau umschalten',
    // Button sizes
    'Button Size': 'Schaltflächengröße',
    'Small': 'Klein',
    'Medium': 'Mittel',
    'Large': 'Groß',
    'Extra Large': 'Extra groß',
    // Color themes
    'Color Theme': 'Farbschema',
    'Light': 'Hell',
    'Geolantis': 'Geolantis',
    'Glow': 'Leuchten',
    'Trans': 'Transparent',
    'Black': 'Schwarz',
    'White': 'Weiß',
    // Presets
    'Presets': 'Voreinstellungen',
    'presets.presets': 'Voreinstellungen',
    'preset.ui_presets': 'UI-Voreinstellungen',
    'UI Presets': 'UI-Voreinstellungen',
    'Layer Presets': 'Ebenen-Voreinstellungen',
    'Manage Presets': 'Voreinstellungen verwalten',
    'Save Preset': 'Voreinstellung speichern',
    'Preset Name': 'Name der Voreinstellung',
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
    'loading': 'Laden'
};

function applyDirectGermanTranslations() {
    console.log('[DIRECT-DE] Applying direct German translations...');
    
    let changedCount = 0;
    
    // Replace text in all elements
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // Skip script and style elements
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
        const text = node.textContent.trim();
        if (text && germanTranslations[text]) {
            node.textContent = germanTranslations[text];
            changedCount++;
            console.log(`[DIRECT-DE] Changed "${text}" to "${germanTranslations[text]}"`);
        }
    }
    
    // Also update placeholders
    document.querySelectorAll('[placeholder]').forEach(element => {
        const placeholder = element.placeholder;
        if (germanTranslations[placeholder]) {
            element.placeholder = germanTranslations[placeholder];
            changedCount++;
        }
    });
    
    // Update titles
    document.querySelectorAll('[title]').forEach(element => {
        const title = element.title;
        if (germanTranslations[title]) {
            element.title = germanTranslations[title];
            changedCount++;
        }
    });
    
    console.log(`[DIRECT-DE] Applied ${changedCount} German translations`);
}

// Apply translations after a delay
setTimeout(applyDirectGermanTranslations, 1500);
setTimeout(applyDirectGermanTranslations, 3000);
setTimeout(applyDirectGermanTranslations, 5000);

// Also apply when tabs change
document.addEventListener('sl-tab-show', () => {
    setTimeout(applyDirectGermanTranslations, 100);
});

// Make it available globally
window.applyDirectGermanTranslations = applyDirectGermanTranslations;

console.log('[DIRECT-DE] Direct German override loaded');