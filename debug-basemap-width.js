// Debug helper for basemap width issue
// Run this in browser console: debugBasemapWidth()

function debugBasemapWidth() {
  const basemap = document.getElementById('basemap-controls');
  if (!basemap) {
    console.error('Basemap controls not found!');
    return;
  }
  
  console.log('=== BASEMAP WIDTH DEBUG ===');
  
  // Check all parent elements
  let el = basemap;
  let level = 0;
  while (el) {
    const computed = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    
    console.log(`Level ${level}: ${el.tagName}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className : ''}`);
    console.log(`  Actual width: ${rect.width}px`);
    console.log(`  CSS width: ${computed.width}`);
    console.log(`  Padding: ${computed.paddingLeft} ${computed.paddingRight}`);
    console.log(`  Margin: ${computed.marginLeft} ${computed.marginRight}`);
    console.log(`  Box-sizing: ${computed.boxSizing}`);
    
    if (computed.width !== '100%' && computed.width !== 'auto') {
      console.warn(`  ⚠️ Width is not 100%: ${computed.width}`);
    }
    
    el = el.parentElement;
    level++;
    if (level > 10) break; // Prevent infinite loop
  }
  
  // Check the table
  const table = basemap.querySelector('table');
  if (table) {
    const tableComputed = window.getComputedStyle(table);
    const tableRect = table.getBoundingClientRect();
    console.log('\n=== TABLE ===');
    console.log(`Width: ${tableRect.width}px (CSS: ${tableComputed.width})`);
    console.log(`Table-layout: ${tableComputed.tableLayout}`);
  }
  
  // Check drawer width
  const drawer = document.getElementById('left1-drawer');
  if (drawer) {
    const drawerRect = drawer.getBoundingClientRect();
    console.log('\n=== DRAWER ===');
    console.log(`Drawer width: ${drawerRect.width}px`);
  }
  
  console.log('\n=== END DEBUG ===');
}

// Auto-fix function
function fixBasemapWidth() {
  const basemap = document.getElementById('basemap-controls');
  if (!basemap) return;
  
  // Get drawer width
  const drawer = document.getElementById('left1-drawer');
  const drawerWidth = drawer ? drawer.getBoundingClientRect().width : 350;
  
  // Calculate available width (drawer width minus tab nav)
  const tabNav = document.querySelector('#left1-drawer sl-tab-group::part(nav)');
  const tabNavWidth = tabNav ? 44 : 0; // We know it's 44px from CSS
  const availableWidth = drawerWidth - tabNavWidth;
  
  console.log(`Fixing basemap width. Available: ${availableWidth}px`);
  
  // Force all parents to use available width
  let el = basemap;
  while (el && el.id !== 'left1-drawer') {
    el.style.width = '100%';
    el.style.maxWidth = 'none';
    el.style.padding = '0';
    el.style.margin = '0';
    el = el.parentElement;
  }
  
  // Force table
  const table = basemap.querySelector('table');
  if (table) {
    table.style.width = '100%';
    table.style.tableLayout = 'fixed';
  }
}

// Make functions available globally
window.debugBasemapWidth = debugBasemapWidth;
window.fixBasemapWidth = fixBasemapWidth;