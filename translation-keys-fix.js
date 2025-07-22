/**
 * Translation Keys Fix
 * Specifically targets translation keys showing as raw text like "presets.ui_presets"
 */

console.log('[KEYS-FIX] Starting translation keys fix...');

// Map of translation keys to German text
const translationKeys = {
    'presets.ui_presets': 'UI-Voreinstellungen',
    'presets.saverestore_ui_layout': 'UI-Layout speichern/wiederherstellen', 
    'preset.ui_presets': 'UI-Voreinstellungen',
    'presets.presets': 'Voreinstellungen',
    'ui.tabs.layers': 'Ebenen',
    'ui.tabs.basemaps': 'Basiskarten',
    'ui.tabs.overlays': 'Overlays',
    'ui.tabs.bookmarks': 'Lesezeichen',
    'ui.tabs.settings': 'Einstellungen',
    'ui.tabs.tools': 'Werkzeuge',
    'ui.settings.mapSettings': 'Karteneinstellungen',
    'ui.settings.uiSettings': 'UI-Einstellungen',
    'ui.settings.layerSettings': 'Ebeneneinstellungen',
    'kataster.toggle': 'Kataster umschalten',
    'kataster.toggleBEV': 'Kataster BEV umschalten',
    'kataster.toggleGray': 'Kataster Grau umschalten',
    // Stakeout module
    'Total': 'Gesamt',
    'Segments': 'Segmente',
    'stakeout.lines': 'Absteckungslinien',
    'stakeout.nodes': 'Absteckungspunkte'
};

function fixTranslationKeys() {
    console.log('[KEYS-FIX] Scanning for untranslated keys...');
    
    let fixedCount = 0;
    
    // Method 1: Check all text nodes for translation keys
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
        const text = node.textContent.trim();
        if (translationKeys[text]) {
            node.textContent = translationKeys[text];
            fixedCount++;
            console.log(`[KEYS-FIX] Fixed key: "${text}" -> "${translationKeys[text]}"`);
        }
    }
    
    // Method 2: Check elements that might contain keys
    const keyPatterns = Object.keys(translationKeys);
    keyPatterns.forEach(key => {
        // Find elements containing this exact key
        const elements = document.evaluate(
            `//*[text()='${key}']`,
            document,
            null,
            XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
            null
        );
        
        for (let i = 0; i < elements.snapshotLength; i++) {
            const element = elements.snapshotItem(i);
            if (element && element.textContent.trim() === key) {
                element.textContent = translationKeys[key];
                fixedCount++;
                console.log(`[KEYS-FIX] Fixed via XPath: "${key}" -> "${translationKeys[key]}"`);
            }
        }
    });
    
    // Method 3: Check all elements for keys (more aggressive)
    document.querySelectorAll('*').forEach(element => {
        // Skip if element has children (to avoid breaking structure)
        if (element.children.length === 0) {
            const text = element.textContent.trim();
            if (translationKeys[text]) {
                element.textContent = translationKeys[text];
                fixedCount++;
                console.log(`[KEYS-FIX] Fixed element: "${text}" -> "${translationKeys[text]}"`);
            }
        }
    });
    
    console.log(`[KEYS-FIX] Fixed ${fixedCount} translation keys`);
    
    // Debug: Look for any remaining untranslated keys
    const remainingKeys = [];
    document.querySelectorAll('*').forEach(element => {
        const text = element.textContent.trim();
        if (text.includes('.') && (text.startsWith('ui.') || text.startsWith('presets.') || text.startsWith('preset.') || text.startsWith('stakeout.'))) {
            if (!translationKeys[text]) {
                remainingKeys.push(text);
            }
        }
    });
    
    if (remainingKeys.length > 0) {
        console.log('[KEYS-FIX] Remaining untranslated keys found:');
        [...new Set(remainingKeys)].forEach(key => {
            console.log(`   "${key}"`);
        });
    }
}

// Run fixes multiple times with different delays
function initializeKeysFixes() {
    // Initial fix
    fixTranslationKeys();
    
    // Fix after various delays to catch late-loading content
    [100, 500, 1000, 2000, 3000, 5000].forEach(delay => {
        setTimeout(fixTranslationKeys, delay);
    });
    
    // Fix when settings tab is shown (where these keys are most likely to appear)
    document.addEventListener('sl-tab-show', (event) => {
        setTimeout(fixTranslationKeys, 50);
    });
    
    // Monitor for DOM changes
    const observer = new MutationObserver(() => {
        clearTimeout(window.keysFixTimeout);
        window.keysFixTimeout = setTimeout(fixTranslationKeys, 50);
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
    
    console.log('[KEYS-FIX] Started monitoring for untranslated keys');
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeKeysFixes);
} else {
    initializeKeysFixes();
}

// Global access for debugging
window.fixTranslationKeys = fixTranslationKeys;

console.log('[KEYS-FIX] Translation keys fix loaded');