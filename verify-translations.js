/**
 * Translation Verification Script
 * Helps identify which translations are working and which aren't
 */

console.log('[VERIFY] Starting translation verification...');

function verifyTranslations() {
    const expectedTranslations = {
        // Tab labels
        'Layers': 'Ebenen',
        'Settings': 'Einstellungen',
        'Bookmarks': 'Lesezeichen',
        
        // Settings
        'Map Settings': 'Karteneinstellungen',
        'UI Settings': 'UI-Einstellungen',
        'Button Size': 'Schaltflächengröße',
        'Color Theme': 'Farbschema',
        
        // Button sizes
        'Small': 'Klein',
        'Medium': 'Mittel',
        'Large': 'Groß',
        'Extra Large': 'Extra groß',
        
        // Color themes
        'Light': 'Hell',
        'Geolantis': 'Geolantis',
        'Toggle Kataster': 'Kataster umschalten',
        'Presets': 'Voreinstellungen',
        'Enable Status Bar': 'Statusleiste aktivieren'
    };
    
    console.log('[VERIFY] Checking translations...\n');
    
    const results = {
        found: [],
        missing: [],
        incorrect: []
    };
    
    // Check all text content in the document
    const allTextNodes = [];
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
        if (text) {
            allTextNodes.push({
                text: text,
                element: node.parentElement,
                path: getElementPath(node.parentElement)
            });
        }
    }
    
    // Check each expected translation
    for (const [english, german] of Object.entries(expectedTranslations)) {
        let found = false;
        let foundEnglish = false;
        
        for (const textNode of allTextNodes) {
            if (textNode.text === german) {
                found = true;
                results.found.push({
                    english,
                    german,
                    element: textNode.path
                });
                break;
            } else if (textNode.text === english) {
                foundEnglish = true;
                results.incorrect.push({
                    english,
                    german,
                    actualText: textNode.text,
                    element: textNode.path
                });
            }
        }
        
        if (!found && !foundEnglish) {
            results.missing.push({
                english,
                german
            });
        }
    }
    
    // Generate report
    console.log('=== TRANSLATION VERIFICATION REPORT ===\n');
    
    console.log(`✅ CORRECTLY TRANSLATED (${results.found.length}):`);
    results.found.forEach(item => {
        console.log(`   "${item.english}" → "${item.german}" at ${item.element}`);
    });
    
    console.log(`\n❌ NOT TRANSLATED (${results.incorrect.length}):`);
    results.incorrect.forEach(item => {
        console.log(`   "${item.english}" should be "${item.german}" at ${item.element}`);
    });
    
    console.log(`\n⚠️  NOT FOUND (${results.missing.length}):`);
    results.missing.forEach(item => {
        console.log(`   "${item.english}" (expected: "${item.german}")`);
    });
    
    // Additional checks for specific elements
    console.log('\n=== SPECIFIC ELEMENT CHECKS ===\n');
    
    // Check button size controls
    const sizeButtons = document.querySelectorAll('.button-size-controls button');
    console.log(`Button Size Controls (${sizeButtons.length} found):`);
    sizeButtons.forEach(button => {
        console.log(`   Button: "${button.textContent.trim()}" (data-size="${button.dataset.size}")`);
    });
    
    // Check color theme controls
    const colorButtons = document.querySelectorAll('.button-color-controls button');
    console.log(`\nColor Theme Controls (${colorButtons.length} found):`);
    colorButtons.forEach(button => {
        console.log(`   Button: "${button.textContent.trim()}" (data-color="${button.dataset.color}")`);
    });
    
    // Check settings labels
    const settingsLabels = document.querySelectorAll('.settings-label');
    console.log(`\nSettings Labels (${settingsLabels.length} found):`);
    settingsLabels.forEach(label => {
        console.log(`   Label: "${label.textContent.trim()}"`);
    });
    
    // Summary
    const total = results.found.length + results.incorrect.length + results.missing.length;
    const percentage = Math.round((results.found.length / total) * 100);
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total translations checked: ${total}`);
    console.log(`Successfully translated: ${results.found.length} (${percentage}%)`);
    console.log(`Failed translations: ${results.incorrect.length}`);
    console.log(`Missing elements: ${results.missing.length}`);
    
    return results;
}

function getElementPath(element) {
    const path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let selector = element.tagName.toLowerCase();
        if (element.id) {
            selector += '#' + element.id;
        } else if (element.className) {
            selector += '.' + element.className.split(' ').join('.');
        }
        path.unshift(selector);
        element = element.parentElement;
    }
    return path.join(' > ');
}

// Run verification
setTimeout(() => {
    console.log('[VERIFY] Running initial verification...');
    verifyTranslations();
}, 3000);

// Make available globally
window.verifyTranslations = verifyTranslations;

console.log('[VERIFY] Translation verification loaded - use window.verifyTranslations() to check');