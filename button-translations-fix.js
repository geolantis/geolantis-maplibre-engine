/**
 * Button Translations Fix
 * Specifically targets button size and color theme buttons
 */

console.log('[BUTTON-FIX] Starting button translations fix...');

// Button-specific translations
const buttonTranslations = {
    // Button sizes
    'Small': 'Klein',
    'Medium': 'Mittel', 
    'Large': 'Groß',
    'Extra Large': 'Extra groß',
    
    // Color themes
    'Light': 'Hell',
    'Geolantis': 'Geolantis',
    'Geolantis\nGlow': 'Geolantis\nLeuchten',
    'Trans\nBlack': 'Trans.\nSchwarz',
    'Trans\nWhite': 'Trans.\nWeiß',
    
    // Preset translation keys - these show up as raw keys
    'presets.ui_presets': 'UI-Voreinstellungen',
    'presets.saverestore_ui_layout': 'UI-Layout speichern/wiederherstellen',
    'preset.ui_presets': 'UI-Voreinstellungen',
    'presets.presets': 'Voreinstellungen'
};

function fixButtonTranslations() {
    console.log('[BUTTON-FIX] Fixing button translations...');
    
    let fixedCount = 0;
    
    // Fix button size controls
    const sizeButtons = document.querySelectorAll('.button-size-controls button, [data-size]');
    sizeButtons.forEach(button => {
        const text = button.textContent.trim();
        if (buttonTranslations[text]) {
            button.textContent = buttonTranslations[text];
            fixedCount++;
            console.log(`[BUTTON-FIX] Fixed size button: "${text}" -> "${buttonTranslations[text]}"`);
        }
    });
    
    // Fix color theme buttons
    const colorButtons = document.querySelectorAll('.button-color-controls button, [data-color]');
    colorButtons.forEach(button => {
        // Handle buttons with <br> tags
        const htmlContent = button.innerHTML.trim();
        const textContent = button.textContent.trim();
        
        // Try various text formats
        const variations = [
            textContent,
            textContent.replace(/\s+/g, ' '),
            textContent.replace(/\s+/g, '\n'),
            htmlContent.replace(/<br>/gi, '\n'),
            htmlContent.replace(/<br\s*\/?>/gi, ' ')
        ];
        
        for (const variant of variations) {
            if (buttonTranslations[variant]) {
                // Preserve HTML structure if it had <br> tags
                if (htmlContent.includes('<br>')) {
                    button.innerHTML = buttonTranslations[variant].replace(/\n/g, '<br>');
                } else {
                    button.textContent = buttonTranslations[variant];
                }
                fixedCount++;
                console.log(`[BUTTON-FIX] Fixed color button: "${variant}" -> "${buttonTranslations[variant]}"`);
                break;
            }
        }
    });
    
    // Check for any elements containing preset translation keys
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
        const text = element.textContent.trim();
        if (buttonTranslations[text] && element.children.length === 0) {
            // Only replace if it's a leaf element (no child elements)
            element.textContent = buttonTranslations[text];
            fixedCount++;
            console.log(`[BUTTON-FIX] Fixed preset key: "${text}" -> "${buttonTranslations[text]}"`);
        }
    });
    
    // Also check for settings labels
    const labels = document.querySelectorAll('.settings-label');
    labels.forEach(label => {
        const text = label.textContent.trim();
        if (text === 'Button Size') {
            label.textContent = 'Schaltflächengröße';
            fixedCount++;
        } else if (text === 'Color Theme') {
            label.textContent = 'Farbschema';
            fixedCount++;
        } else if (buttonTranslations[text]) {
            label.textContent = buttonTranslations[text];
            fixedCount++;
        }
    });
    
    console.log(`[BUTTON-FIX] Fixed ${fixedCount} button translations`);
    
    // Debug: Log current button state
    console.log('[BUTTON-FIX] Current button states:');
    document.querySelectorAll('.settings-buttons button').forEach(button => {
        console.log(`  Button: "${button.textContent.trim()}" (data-size="${button.dataset.size}", data-color="${button.dataset.color}")`);
    });
}

// Run fixes at multiple times
function initializeButtonFixes() {
    // Initial fix
    fixButtonTranslations();
    
    // Fix after delays
    [500, 1000, 2000, 3000, 5000].forEach(delay => {
        setTimeout(fixButtonTranslations, delay);
    });
    
    // Fix when settings tab is shown
    document.addEventListener('sl-tab-show', (event) => {
        if (event.detail.name === 'settings') {
            setTimeout(fixButtonTranslations, 100);
        }
    });
    
    // Watch for DOM changes in settings area
    const settingsObserver = new MutationObserver(() => {
        clearTimeout(window.buttonFixTimeout);
        window.buttonFixTimeout = setTimeout(fixButtonTranslations, 100);
    });
    
    // Start observing when settings panel exists
    const checkForSettings = setInterval(() => {
        const settingsPanel = document.querySelector('#left2-drawer .sidebar-content');
        if (settingsPanel) {
            clearInterval(checkForSettings);
            settingsObserver.observe(settingsPanel, {
                childList: true,
                subtree: true
            });
            console.log('[BUTTON-FIX] Started observing settings panel');
        }
    }, 500);
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeButtonFixes);
} else {
    initializeButtonFixes();
}

// Global access for debugging
window.fixButtonTranslations = fixButtonTranslations;

console.log('[BUTTON-FIX] Button translations fix loaded');