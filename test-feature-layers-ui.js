// Test script to verify Feature Layers UI changes
console.log("Testing Feature Layers UI updates...");

// Wait for DOM to load
setTimeout(() => {
    // Check search container
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        const computedStyle = window.getComputedStyle(searchContainer);
        console.log("Search Container:");
        console.log("  - Padding:", computedStyle.padding);
        console.log("  - Margin:", computedStyle.margin);
        console.log("  - Width:", computedStyle.width);
    }

    // Check expand/collapse button
    const expandBtn = document.querySelector('.expand-collapse-button');
    if (expandBtn) {
        console.log("\nExpand/Collapse Button:");
        console.log("  - Type:", expandBtn.tagName);
        console.log("  - Icon name:", expandBtn.getAttribute('name'));
        console.log("  - Has tooltip:", !!expandBtn.closest('sl-tooltip'));
    }

    // Check feature icons
    const featureIcons = document.querySelectorAll('.lc-feature-icon');
    if (featureIcons.length > 0) {
        console.log("\nFeature Icons:");
        const firstIcon = featureIcons[0];
        const iconStyle = window.getComputedStyle(firstIcon);
        console.log("  - Width:", iconStyle.width);
        console.log("  - Height:", iconStyle.height);
    }

    // Check header spacing
    const header = document.querySelector('.lc-layer-controls-header');
    if (header) {
        const headerStyle = window.getComputedStyle(header);
        console.log("\nHeader:");
        console.log("  - Padding:", headerStyle.padding);
        console.log("  - Margin bottom:", headerStyle.marginBottom);
    }

    // Check first category spacing
    const firstCategory = document.querySelector('#featureLayersContainer .lc-category:first-child');
    if (firstCategory) {
        const catStyle = window.getComputedStyle(firstCategory);
        console.log("\nFirst Category:");
        console.log("  - Margin top:", catStyle.marginTop);
        console.log("  - Padding top:", catStyle.paddingTop);
    }

}, 2000);