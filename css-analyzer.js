const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const { glob } = require('glob');

class CSSAnalyzer {
    constructor() {
        this.cssRules = new Map();
        this.duplicates = new Map();
        this.usedSelectors = new Set();
        this.usedClasses = new Set();
        this.usedIds = new Set();
        this.usedTags = new Set();
        this.usedAttributes = new Set();
    }

    async analyzeCSSFiles() {
        console.log('Finding CSS files...');
        const cssFiles = await glob('src/**/*.css', { absolute: true });
        
        for (const file of cssFiles) {
            console.log(`Parsing: ${path.relative(process.cwd(), file)}`);
            await this.parseCSSFile(file);
        }
    }

    async parseCSSFile(filePath) {
        const css = fs.readFileSync(filePath, 'utf8');
        const fileName = path.relative(process.cwd(), filePath);
        
        try {
            const result = await postcss().process(css, { from: filePath });
            
            result.root.walkRules(rule => {
                const selectors = rule.selector.split(',').map(s => s.trim());
                
                selectors.forEach(selector => {
                    const key = `${selector}|${fileName}`;
                    const declarations = {};
                    
                    rule.walkDecls(decl => {
                        declarations[decl.prop] = decl.value;
                    });
                    
                    // Store rule info
                    if (!this.cssRules.has(selector)) {
                        this.cssRules.set(selector, []);
                    }
                    
                    this.cssRules.get(selector).push({
                        file: fileName,
                        line: rule.source?.start?.line || 0,
                        declarations: declarations
                    });
                });
            });
        } catch (error) {
            console.error(`Error parsing ${fileName}: ${error.message}`);
        }
    }

    async scanUsage() {
        console.log('\nScanning HTML and JS files for CSS usage...');
        
        // Scan HTML files
        const htmlFiles = await glob('**/*.html', { ignore: ['node_modules/**'] });
        for (const file of htmlFiles) {
            await this.scanHTMLFile(file);
        }
        
        // Scan JS files
        const jsFiles = await glob('src/**/*.js');
        for (const file of jsFiles) {
            await this.scanJSFile(file);
        }
    }

    async scanHTMLFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract classes
        const classMatches = content.matchAll(/class\s*=\s*["']([^"']+)["']/gi);
        for (const match of classMatches) {
            match[1].split(/\s+/).forEach(cls => {
                if (cls) this.usedClasses.add(cls);
            });
        }
        
        // Extract IDs
        const idMatches = content.matchAll(/id\s*=\s*["']([^"']+)["']/gi);
        for (const match of idMatches) {
            if (match[1]) this.usedIds.add(match[1]);
        }
        
        // Extract tag names from HTML
        const tagMatches = content.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)/g);
        for (const match of tagMatches) {
            this.usedTags.add(match[1].toLowerCase());
        }
    }

    async scanJSFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Look for class additions/removals
        const classPatterns = [
            /classList\.(add|remove|toggle|contains)\s*\(\s*["']([^"']+)["']/g,
            /className\s*[+\-]?=\s*["']([^"']+)["']/g,
            /\.addClass\s*\(\s*["']([^"']+)["']/g,
            /\.removeClass\s*\(\s*["']([^"']+)["']/g,
            /\.hasClass\s*\(\s*["']([^"']+)["']/g,
            /\.toggleClass\s*\(\s*["']([^"']+)["']/g
        ];
        
        classPatterns.forEach(pattern => {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                const classes = match[match.length - 1].split(/\s+/);
                classes.forEach(cls => {
                    if (cls) this.usedClasses.add(cls);
                });
            }
        });
        
        // Look for querySelector patterns
        const selectorPatterns = [
            /querySelector\s*\(\s*["']([^"']+)["']/g,
            /querySelectorAll\s*\(\s*["']([^"']+)["']/g,
            /getElementById\s*\(\s*["']([^"']+)["']/g,
            /getElementsByClassName\s*\(\s*["']([^"']+)["']/g
        ];
        
        selectorPatterns.forEach(pattern => {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                this.parseSelectorUsage(match[1]);
            }
        });
    }

    parseSelectorUsage(selector) {
        // Parse classes
        const classMatches = selector.matchAll(/\.([a-zA-Z0-9_-]+)/g);
        for (const match of classMatches) {
            this.usedClasses.add(match[1]);
        }
        
        // Parse IDs
        const idMatches = selector.matchAll(/#([a-zA-Z0-9_-]+)/g);
        for (const match of idMatches) {
            this.usedIds.add(match[1]);
        }
        
        // Store complete selector
        this.usedSelectors.add(selector);
    }

    findUnusedRules() {
        const unused = [];
        
        for (const [selector, rules] of this.cssRules) {
            const isUsed = this.isSelectorUsed(selector);
            
            if (!isUsed) {
                rules.forEach(rule => {
                    unused.push({
                        selector,
                        file: rule.file,
                        line: rule.line,
                        declarations: rule.declarations
                    });
                });
            }
        }
        
        return unused;
    }

    isSelectorUsed(selector) {
        // Direct match in usedSelectors
        if (this.usedSelectors.has(selector)) return true;
        
        // Parse selector and check components
        const selectorParts = this.parseSelector(selector);
        
        for (const part of selectorParts) {
            if (part.type === 'class' && !this.usedClasses.has(part.value)) {
                return false;
            }
            if (part.type === 'id' && !this.usedIds.has(part.value)) {
                return false;
            }
            if (part.type === 'tag' && !this.usedTags.has(part.value)) {
                // Check if it's a standard HTML tag
                const standardTags = ['div', 'span', 'p', 'a', 'button', 'input', 'form', 
                                    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'li', 
                                    'table', 'tr', 'td', 'th', 'img', 'section', 'article',
                                    'header', 'footer', 'nav', 'main', 'body', 'html'];
                if (!standardTags.includes(part.value)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    parseSelector(selector) {
        const parts = [];
        const regex = /([.#]?)([a-zA-Z0-9_-]+)/g;
        let match;
        
        while ((match = regex.exec(selector)) !== null) {
            if (match[1] === '.') {
                parts.push({ type: 'class', value: match[2] });
            } else if (match[1] === '#') {
                parts.push({ type: 'id', value: match[2] });
            } else if (match[2]) {
                parts.push({ type: 'tag', value: match[2].toLowerCase() });
            }
        }
        
        return parts;
    }

    findDuplicates() {
        const duplicates = [];
        
        for (const [selector, rules] of this.cssRules) {
            if (rules.length > 1) {
                // Check for exact duplicates
                const seen = new Map();
                
                rules.forEach(rule => {
                    const declString = JSON.stringify(rule.declarations);
                    
                    if (seen.has(declString)) {
                        duplicates.push({
                            type: 'exact_duplicate',
                            selector,
                            original: seen.get(declString),
                            duplicate: rule
                        });
                    } else {
                        seen.set(declString, rule);
                    }
                });
                
                // Check for property overrides
                const propertyMap = new Map();
                
                rules.forEach(rule => {
                    Object.keys(rule.declarations).forEach(prop => {
                        if (propertyMap.has(prop)) {
                            duplicates.push({
                                type: 'property_override',
                                selector,
                                property: prop,
                                original: propertyMap.get(prop),
                                override: {
                                    file: rule.file,
                                    line: rule.line,
                                    value: rule.declarations[prop]
                                }
                            });
                        } else {
                            propertyMap.set(prop, {
                                file: rule.file,
                                line: rule.line,
                                value: rule.declarations[prop]
                            });
                        }
                    });
                });
            }
        }
        
        return duplicates;
    }

    generateReport(unused, duplicates) {
        const report = [];
        
        report.push('# CSS Analysis Report');
        report.push(`Generated on: ${new Date().toISOString()}\n`);
        
        report.push('## Summary');
        report.push(`- Total CSS rules analyzed: ${Array.from(this.cssRules.values()).flat().length}`);
        report.push(`- Unused rules found: ${unused.length}`);
        report.push(`- Duplicate/Override issues found: ${duplicates.length}`);
        report.push(`- Used classes detected: ${this.usedClasses.size}`);
        report.push(`- Used IDs detected: ${this.usedIds.size}\n`);
        
        report.push('## Unused CSS Rules');
        if (unused.length === 0) {
            report.push('No unused CSS rules found!\n');
        } else {
            const byFile = {};
            unused.forEach(rule => {
                if (!byFile[rule.file]) byFile[rule.file] = [];
                byFile[rule.file].push(rule);
            });
            
            Object.keys(byFile).sort().forEach(file => {
                report.push(`\n### ${file}`);
                byFile[file].forEach(rule => {
                    report.push(`- **${rule.selector}** (line ${rule.line})`);
                    const props = Object.keys(rule.declarations).slice(0, 3).join(', ');
                    const more = Object.keys(rule.declarations).length > 3 ? '...' : '';
                    report.push(`  Properties: ${props}${more}`);
                });
            });
        }
        
        report.push('\n## Duplicates and Overrides');
        if (duplicates.length === 0) {
            report.push('No duplicate CSS rules found!\n');
        } else {
            const exactDupes = duplicates.filter(d => d.type === 'exact_duplicate');
            const overrides = duplicates.filter(d => d.type === 'property_override');
            
            if (exactDupes.length > 0) {
                report.push('\n### Exact Duplicates');
                exactDupes.forEach(dup => {
                    report.push(`- **${dup.selector}**`);
                    report.push(`  Original: ${dup.original.file}:${dup.original.line}`);
                    report.push(`  Duplicate: ${dup.duplicate.file}:${dup.duplicate.line}`);
                });
            }
            
            if (overrides.length > 0) {
                report.push('\n### Property Overrides');
                const bySelector = {};
                overrides.forEach(ov => {
                    if (!bySelector[ov.selector]) bySelector[ov.selector] = [];
                    bySelector[ov.selector].push(ov);
                });
                
                Object.keys(bySelector).forEach(selector => {
                    report.push(`\n- **${selector}**`);
                    bySelector[selector].forEach(ov => {
                        report.push(`  ${ov.property}: "${ov.original.value}" (${ov.original.file}:${ov.original.line})`);
                        report.push(`         → "${ov.override.value}" (${ov.override.file}:${ov.override.line})`);
                    });
                });
            }
        }
        
        return report.join('\n');
    }

    async run() {
        console.log('Starting CSS analysis...\n');
        
        await this.analyzeCSSFiles();
        await this.scanUsage();
        
        console.log('\nAnalyzing results...');
        const unused = this.findUnusedRules();
        const duplicates = this.findDuplicates();
        
        const report = this.generateReport(unused, duplicates);
        
        const reportPath = path.join(process.cwd(), 'css-analysis-report.md');
        fs.writeFileSync(reportPath, report);
        
        console.log(`\nReport generated: ${reportPath}`);
        console.log(`\nSummary:`);
        console.log(`- Unused rules: ${unused.length}`);
        console.log(`- Duplicate/Override issues: ${duplicates.length}`);
    }
}

// Run the analyzer
const analyzer = new CSSAnalyzer();
analyzer.run().catch(console.error);