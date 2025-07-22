// Basemap selector with improved functionality
function createBasemapControls() {
    console.log('Creating improved basemap selector');
    
    // Get the container
    const container = document.getElementById('basemap-controls');
    if (!container) {
      console.error('Basemap controls container not found');
      return;
    }
    
    // Notify UI initialization manager when basemap controls are created
    if (window.UIInitializationManager) {
        setTimeout(() => {
            window.UIInitializationManager.checkReady();
        }, 50);
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Set base styles
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    
    // Create a table for rigid structure
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.tableLayout = 'fixed';
    table.style.borderCollapse = 'collapse';
    table.style.borderSpacing = '0';
    table.style.margin = '0';
    table.style.padding = '0';
    
    // Create a container for the scrollable content
    const scrollContainer = document.createElement('div');
    scrollContainer.style.width = '100%';
    scrollContainer.style.height = '100%';
    scrollContainer.style.overflow = 'auto';
    
    // Wrap table in scrollContainer
    scrollContainer.appendChild(table);
    
    // Add to container
    container.appendChild(scrollContainer);
    
    // Add colgroup to enforce consistent column widths
    const colgroup = document.createElement('colgroup');
    table.appendChild(colgroup);
    
    // Column widths using percentages for responsive layout
    const colWidths = ['15%', '70%', '15%'];
    colWidths.forEach(width => {
      const col = document.createElement('col');
      col.style.width = width;
      colgroup.appendChild(col);
    });
    
    // Create table body for content
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    
    // Load favorites
    let favorites = [];
    try {
      const saved = localStorage.getItem('geolantis360_favorite_basemaps');
      if (saved) favorites = JSON.parse(saved);
    } catch (e) {
      console.error('Error loading favorites:', e);
    }
    
    // Find current basemap
    let currentBasemap = null;
    let currentBasemapData = null;
    if (window.mapConfig && window.mapConfig.backgroundMaps) {
      // Try to find current map
      if (window.interface && window.interface.map) {
        try {
          const style = window.interface.map.getStyle();
          if (style && style.name) {
            Object.keys(window.mapConfig.backgroundMaps).forEach(key => {
              if (window.mapConfig.backgroundMaps[key].name === style.name) {
                currentBasemap = key;
                currentBasemapData = window.mapConfig.backgroundMaps[key];
              }
            });
          }
        } catch (e) {
          console.warn('Error getting current style:', e);
        }
      }
      
      // Default to first if not found
      if (!currentBasemap) {
        currentBasemap = Object.keys(window.mapConfig.backgroundMaps)[0];
        currentBasemapData = window.mapConfig.backgroundMaps[currentBasemap];
      }
    } else {
      console.error('No map config found');
      return;
    }
    
    
    // Add currently selected map row
    if (currentBasemapData) {
      row = tbody.insertRow();
      row.style.width = '100%';
      row.style.backgroundColor = '#e3f2fd';
      row.style.borderBottom = '1px solid #eeeeee';
      
      cell = row.insertCell();
      cell.colSpan = 3;
      cell.style.padding = '10px';
      cell.style.textAlign = 'left';
      cell.style.fontStyle = 'italic';
      cell.style.color = '#666';
      cell.innerHTML = `Current: <strong>${currentBasemapData.label || currentBasemapData.name}</strong>`;
    }
    
    
    // Group maps by country
    const mapsByCountry = {};
    
    // Add maps to countries
    Object.entries(window.mapConfig.backgroundMaps).forEach(([key, map]) => {
      const country = map.country || 'Global';
      
      if (!mapsByCountry[country]) {
        mapsByCountry[country] = [];
      }
      
      mapsByCountry[country].push({key, map});
      
      // Add to favorites
      if (favorites.includes(key)) {
        if (!mapsByCountry['Favorites']) {
          mapsByCountry['Favorites'] = [];
        }
        mapsByCountry['Favorites'].push({key, map});
      }
    });
    
    // Order countries - Global first, then alphabetical
    const countries = Object.keys(mapsByCountry).sort((a, b) => {
      if (a === 'Favorites') return -1;
      if (b === 'Favorites') return 1;
      if (a === 'Global') return -1;
      if (b === 'Global') return 1;
      return a.localeCompare(b);
    });
    
    // Initial state - favorites expanded
    const expandedState = {};
    expandedState['Favorites'] = true;
    
    // Store row references to help with proper ordering
    const countryRows = {};
    
    // Create country rows
    countries.forEach(country => {
      // Skip empty countries
      if (!mapsByCountry[country] || mapsByCountry[country].length === 0) return;
      
      // Get country flag
      let flag = '🌐';
      if (country === 'Favorites') {
        flag = '⭐';
      } else if (mapsByCountry[country][0] && mapsByCountry[country][0].map.flag) {
        flag = mapsByCountry[country][0].map.flag;
      }
      
      // Add country header row
      row = tbody.insertRow();
      row.style.width = '100%';
      row.style.backgroundColor = '#f5f5f5';
      row.style.borderBottom = '1px solid #eeeeee';
      row.style.cursor = 'pointer';
      row.setAttribute('data-country', country);
      row.className = 'country-header-row';
      
      countryRows[country] = {
        headerRow: row,
        mapRows: []
      };
      
      // Flag cell
      cell = row.insertCell();
      cell.innerHTML = flag;
      
      // Country name
      cell = row.insertCell();
      cell.innerHTML = country;
      
      // Arrow
      cell = row.insertCell();
      cell.innerHTML = expandedState[country] ? '▲' : '▼';
      
      // Create map rows immediately after the country header
      mapsByCountry[country].forEach(({key, map}) => {
        const mapRow = tbody.insertRow();
        mapRow.className = 'map-row';
        mapRow.setAttribute('data-country', country);
        mapRow.setAttribute('data-key', key);
        mapRow.style.width = '100%';
        mapRow.style.backgroundColor = key === currentBasemap ? '#f0f7ff' : '#ffffff';
        mapRow.style.borderBottom = '1px solid #eeeeee';
        mapRow.style.cursor = 'pointer';
        mapRow.style.display = expandedState[country] ? '' : 'none';
        
        countryRows[country].mapRows.push(mapRow);
        
        // Map flag
        let mapCell = mapRow.insertCell();
        mapCell.innerHTML = map.flag || '🌐';
        
        // Map name
        mapCell = mapRow.insertCell();
        mapCell.innerHTML = map.label || map.name;
        
        // Star
        mapCell = mapRow.insertCell();
        mapCell.style.color = favorites.includes(key) ? '#FFD700' : '#dddddd';
        mapCell.innerHTML = '★';
        mapCell.className = 'star-cell';
        mapCell.setAttribute('data-key', key);
        
        // Map click - select the basemap
        mapRow.addEventListener('click', function(e) {
          // Don't close if clicking the star
          if (e.target.className === 'star-cell' || e.target.parentNode.className === 'star-cell') {
            return;
          }
          
          if (window.interface && typeof window.interface.setBasemap === 'function') {
            window.interface.setBasemap(key);
            
            // Also save through App.Map.Basemap if available
            if (window.App && window.App.Map && window.App.Map.Basemap && window.App.Map.Basemap.setBasemap) {
              window.App.Map.Basemap.setBasemap(key);
            }
            
            // Update UI - just update colors without refreshing
            document.querySelectorAll('.map-row').forEach(function(row) {
              row.style.backgroundColor = '#ffffff';
            });
            this.style.backgroundColor = '#f0f7ff';
            
            // Update the current basemap variable
            const basemapControl = document.getElementById('basemap-control');
            if (basemapControl) {
              basemapControl.value = key;
            }
            
            // Don't refresh - this preserves the expanded state
          }
        });
        
        // Star click - toggle favorite without closing group
        mapCell.addEventListener('click', function(e) {
          e.stopPropagation();
          const key = this.getAttribute('data-key');
          
          if (favorites.includes(key)) {
            // Remove from favorites
            favorites = favorites.filter(k => k !== key);
            this.style.color = '#dddddd';
          } else {
            // Add to favorites
            favorites.push(key);
            this.style.color = '#FFD700';
          }
          
          // Save favorites
          try {
            localStorage.setItem('geolantis360_favorite_basemaps', JSON.stringify(favorites));
          } catch (e) {
            console.error('Error saving favorites:', e);
          }
          
          // Don't refresh - just update the star color
          // This prevents the group from closing
        });
      });
      
      // Toggle maps when header is clicked
      row.addEventListener('click', function() {
        const country = this.getAttribute('data-country');
        const arrow = this.cells[2];
        const expanded = expandedState[country];
        
        // Toggle state
        expandedState[country] = !expanded;
        
        // Update UI - toggle display of map rows for this country
        if (countryRows[country] && countryRows[country].mapRows) {
          countryRows[country].mapRows.forEach(function(mapRow) {
            mapRow.style.display = expanded ? 'none' : '';
          });
        }
        
        // Update arrow
        arrow.innerHTML = expanded ? '▼' : '▲';
      });
    });
  }
  
  // Replace original function
  window.createBasemapControls = createBasemapControls;
  
  // Initialize
  if (window.mapConfig && document.getElementById('basemap-controls')) {
    createBasemapControls();
  } else {
    // Listen for events
    document.addEventListener('mapconfig:loaded', function() {
      if (document.getElementById('basemap-controls')) {
        createBasemapControls();
      }
    });
    
    document.addEventListener('DOMContentLoaded', function() {
      if (window.mapConfig && document.getElementById('basemap-controls')) {
        createBasemapControls();
      } else {
        setTimeout(function() {
          if (window.mapConfig && document.getElementById('basemap-controls')) {
            createBasemapControls();
          }
        }, 200);
      }
    });
  }