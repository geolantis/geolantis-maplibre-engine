const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

class CSSDeduplicator {
    constructor() {
        this.processedRules = new Map();
        this.statistics = {
            filesProcessed: 0,
            rulesRemoved: 0,
            bytesReduced: 0
        };
    }

    async processFile(filePath) {
        const originalContent = fs.readFileSync(filePath, 'utf8');
        const originalSize = Buffer.byteLength(originalContent, 'utf8');
        
        try {
            const result = await postcss().process(originalContent, { from: filePath });
            const root = result.root;
            const rulesToRemove = [];
            
            // Track rules in this file
            const fileRules = new Map();
            
            root.walkRules(rule => {
                const selector = rule.selector.trim();
                const declarations = [];
                
                rule.walkDecls(decl => {
                    declarations.push(`${decl.prop}:${decl.value}`);
                });
                
                const ruleSignature = `${selector}{${declarations.sort().join(';')}}`;
                
                if (fileRules.has(ruleSignature)) {
                    // This is a duplicate within the same file
                    rulesToRemove.push(rule);
                    this.statistics.rulesRemoved++;
                    console.log(`  Removing duplicate: ${selector} in ${path.basename(filePath)}`);
                } else {
                    fileRules.set(ruleSignature, rule);
                }
            });
            
            // Remove duplicate rules
            rulesToRemove.forEach(rule => rule.remove());
            
            // Only write if changes were made
            if (rulesToRemove.length > 0) {
                const newContent = root.toString();
                const newSize = Buffer.byteLength(newContent, 'utf8');
                this.statistics.bytesReduced += (originalSize - newSize);
                
                fs.writeFileSync(filePath, newContent);
                console.log(`✓ Processed ${path.basename(filePath)}: removed ${rulesToRemove.length} duplicate rules`);
            } else {
                console.log(`✓ No duplicates found in ${path.basename(filePath)}`);
            }
            
            this.statistics.filesProcessed++;
            
        } catch (error) {
            console.error(`✗ Error processing ${filePath}: ${error.message}`);
        }
    }

    async processDirectory(dirPath) {
        const files = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const file of files) {
            const fullPath = path.join(dirPath, file.name);
            
            if (file.isDirectory()) {
                await this.processDirectory(fullPath);
            } else if (file.name.endsWith('.css')) {
                await this.processFile(fullPath);
            }
        }
    }

    printStatistics() {
        console.log('\n=== CSS Deduplication Summary ===');
        console.log(`Files processed: ${this.statistics.filesProcessed}`);
        console.log(`Duplicate rules removed: ${this.statistics.rulesRemoved}`);
        console.log(`Bytes reduced: ${this.statistics.bytesReduced} (${(this.statistics.bytesReduced / 1024).toFixed(2)} KB)`);
    }
}

// Run the deduplicator
async function main() {
    console.log('Starting CSS deduplication...\n');
    
    const deduplicator = new CSSDeduplicator();
    
    // Process all CSS files
    await deduplicator.processDirectory('./src/css');
    
    // Also process maplibre-gl.css
    if (fs.existsSync('./src/maplibre-gl.css')) {
        await deduplicator.processFile('./src/maplibre-gl.css');
    }
    
    // Process radial menu CSS
    if (fs.existsSync('./src/xrmenu/css/RadialMenu.css')) {
        await deduplicator.processFile('./src/xrmenu/css/RadialMenu.css');
    }
    
    deduplicator.printStatistics();
}

main().catch(console.error);