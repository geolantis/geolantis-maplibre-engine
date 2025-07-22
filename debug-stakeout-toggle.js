// Debug script to check stakeout toggle visibility
// Run this in the browser console after activating stakeout

function debugStakeoutToggle() {
    console.log("=== Stakeout Toggle Debug ===");
    
    // Check if stakeout module exists
    console.log("1. StakeOut module exists:", !!App.Features.StakeOut);
    
    // Check navigation mode
    if (App.Features.StakeOut) {
        console.log("2. Current navigation mode:", App.Features.StakeOut.getNavigationMode());
    }
    
    // Check if UI exists
    if (App.Features.StakeOut && App.Features.StakeOut.getUI) {
        const ui = App.Features.StakeOut.getUI();
        console.log("3. UI instance exists:", !!ui);
        
        if (ui) {
            console.log("4. Mode toggle container exists:", !!ui.modeToggleContainer);
            console.log("5. Arrow container exists:", !!ui.arrowContainer);
        }
    }
    
    // Check DOM elements
    const arrowContainer = document.getElementById("arrow-container");
    console.log("6. Arrow container in DOM:", !!arrowContainer);
    
    const modeToggle = document.getElementById("stakeout-mode-toggle");
    console.log("7. Mode toggle in DOM:", !!modeToggle);
    
    if (arrowContainer) {
        console.log("8. Arrow container children:", arrowContainer.children.length);
        console.log("9. Arrow container HTML:", arrowContainer.innerHTML.substring(0, 200) + "...");
    }
    
    if (modeToggle) {
        console.log("10. Mode toggle visible:", modeToggle.style.display !== 'none');
        console.log("11. Mode toggle parent:", modeToggle.parentElement?.id);
    }
    
    // Check if right2 sidebar is open
    const right2 = document.getElementById("right2");
    console.log("12. Right2 sidebar exists:", !!right2);
    if (right2) {
        console.log("13. Right2 sidebar collapsed:", right2.classList.contains("collapsed"));
    }
    
    // Try to manually create the toggle if it doesn't exist
    if (arrowContainer && !modeToggle) {
        console.log("14. Attempting to manually trigger toggle creation...");
        const ui = App.Features.StakeOut.getUI();
        if (ui && ui.createModeToggle) {
            ui.createModeToggle();
            console.log("15. Manual toggle creation attempted");
        }
    }
}

// Instructions
console.log("To debug stakeout toggle:");
console.log("1. Select a feature on the map");
console.log("2. Start stakeout navigation");
console.log("3. Run: debugStakeoutToggle()");