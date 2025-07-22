/**
 * Layer Management UI functionality
 * @namespace App.Map.Layers.UI
 */
console.log("[Layers UI] File loading - app.map.layers.ui.js");

// Simple global test
window.simpleTest = function() {
  console.log("Simple test works!");
  return { 
    test: "working",
    layersUI: !!(window.App && window.App.Map && window.App.Map.Layers && window.App.Map.Layers.UI)
  };
};

App.Map = App.Map || {};
App.Map.Layers = App.Map.Layers || {};
App.Map.Layers.UI = (function () {
  // Private variables
  var _featureSettings = new Map();
  var _categorySettings = new Map();
  var _currentFeatureId = null;
  var _currentCategoryName = null;
  var _isCategoryMode = false;
  var _allExpanded = true;

  // Demo layers for testing
  var _demoLayers = [
    {
      clientVisible: true,
      color: "#047DBD",
      geoType: "point",
      geoTypeCode: 3,
      id: "955c0193-ac25-4902-a65f-a7256026120a",
      lineStyle: 0,
      markerSymbol: "",
      minZoom: 14,
      moduleName: "Verkehrszeichen",
      name: "50er",
      parentCategories: "",
      priority: 0,
    },
    {
      clientVisible: true,
      color: "#F5E90FE3",
      geoType: "polygon",
      geoTypeCode: 1,
      id: "f1bf716c-7568-4fc7-9bca-a35d460469a9",
      lineStyle: 0,
      markerSymbol: "",
      minZoom: 1,
      moduleName: "Bauhof",
      name: "Asphalt-Fläche",
      parentCategories: "",
      priority: 0,
    },
    {
      clientVisible: true,
      color: "#FAF858FF",
      geoType: "point",
      geoTypeCode: 3,
      id: "5907746e-a74d-44c0-9a26-884fca1132ce",
      lineStyle: 0,
      markerSymbol: "",
      minZoom: 1,
      moduleName: "Allgemein",
      name: "Foto-Punkt",
      parentCategories: "",
      priority: 0,
    },
    {
      clientVisible: true,
      color: "#00AB2A",
      geoType: "line",
      geoTypeCode: 4,
      id: "cb57de7a-6d52-45d6-b7e5-8ac3f83ec4d0",
      lineStyle: 0,
      markerSymbol: "",
      minZoom: 13,
      moduleName: "Beleuchtung",
      name: "Kabel oberirdisch",
      parentCategories: "",
      priority: 13,
    },
    {
      clientVisible: true,
      color: "#1D00FF",
      geoType: "line",
      geoTypeCode: 4,
      id: "3a2b54e2-9452-4775-af1a-1b14c692de8e",
      lineStyle: 0,
      markerSymbol: "",
      minZoom: 1,
      moduleName: "Beleuchtung",
      name: "Kabel unterirdisch",
      parentCategories: "",
      priority: 12,
    },
    {
      clientVisible: true,
      color: "#FF0017FF",
      geoType: "point",
      geoTypeCode: 3,
      id: "8a4e0469-06b1-4bed-b440-0527dd672477",
      lineStyle: 0,
      markerSymbol:
        "iVBORw0KGgoAAAANSUhEUgAAABEAAAASCAYAAAC9+TVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC7SURBVDhPrZPBEYQgDEXTgXagHWgn2oGl7LbBabcTS7EES8CfwLoI0cGRw8tkyOfJoJK19jHqomCoBiN4e7ivtWyygGALvsCewLM23LM3gnva6sNXcGZMJYb6IJRLH0uWKJDD8pcYmqLhHSZUkczR4A4zqkjUyyQcNETLgBVVJNowVwJBwZMUuZMCb8eJHn4nTtJFgRy6o8SJBpD77wy/fVIOGGrAx4c1eNaEe/YmwVAF+GQvD/dVmrW0AWlcDkadgwBqAAAAAElFTkSuQmCC",
      minZoom: 1,
      moduleName: "Beleuchtung",
      name: "Lichtpunkt",
      parentCategories: "",
      priority: 100,
    },
    {
      clientVisible: true,
      color: "#0000FFFF",
      geoType: "point",
      geoTypeCode: 3,
      id: "8621fb98-d2c4-4116-a8a7-62ab8bf5e01f",
      lineStyle: 0,
      markerSymbol:
        "iVBORw0KGgoAAAANSUhEUgAAABEAAAASCAYAAAC9+TVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACiSURBVDhP1ZTBDYMwDEWZBYkFcDsHvXQJJO6s0mk6mukPNViubUJ76uEFxfZ/ihSFhpl/pixExPO9fX4DskVyvRBjMw7dKZBB9i3pmR9NKeJbg8wi+6rsEt3M0DOuxA5ZbC+UAE/k1VIJ0KHodIcSgHAkAH8k0eFIlEq8kFcLJdnxbc+VZAJBz3xIagSCzCrJegPTrTsFMtsrxsb7V9RARLwANUO77Xal/XcAAAAASUVORK5CYII\u003d",
      minZoom: 11,
      moduleName: "Beleuchtung",
      name: "Versorgungskasten",
      parentCategories: "",
      priority: 100,
    },
  ];

  /**
   * Initialize collapsible sections for baselayers/overlays in left1
   * @private
   */
  function _initCollapsibleSections() {
    const categoryHeaders = document.querySelectorAll(".lc-category-header");

    categoryHeaders.forEach((header) => {
      header.addEventListener("click", function (e) {
        // Don't toggle if clicking on controls
        if (e.target.closest(".lc-category-controls")) {
          return;
        }

        const featureList = this.nextElementSibling;
        const chevron = this.querySelector("sl-icon");

        if (featureList.classList.contains("expanded")) {
          featureList.classList.remove("expanded");
          chevron.style.transform = "rotate(-90deg)";
        } else {
          featureList.classList.add("expanded");
          chevron.style.transform = "rotate(0deg)";
        }
      });
    });
  }

  /**
   * Populate baselayers in left1
   * @private
   */
  function _populateBaselayers() {
    const baselayersList = document.getElementById("baselayers-list");
    if (!baselayersList) return;

    baselayersList.innerHTML = ""; // Clear existing content

    // Get baselayers from mapConfig
    if (typeof mapConfig !== "undefined" && mapConfig.backgroundMaps) {
      Object.keys(mapConfig.backgroundMaps).forEach((key) => {
        const mapOption = mapConfig.backgroundMaps[key];
        const basemapItem = document.createElement("div");
        basemapItem.className = "basemap-item";
        basemapItem.dataset.mapKey = key;

        // Set active state if this is the current basemap
        if (
          window.interface &&
          window.interface.activeBackgroundLayer === key
        ) {
          basemapItem.classList.add("active");
        }

        // Add flag icon if available
        const flag = mapOption.flag || "";
        const iconHtml = flag
          ? `<span class="basemap-icon">${flag}</span>`
          : '<span class="basemap-icon">🗺️</span>';

        basemapItem.innerHTML = `
                    ${iconHtml}
                    <span class="basemap-name">${mapOption.label}</span>
                `;

        basemapItem.addEventListener("click", function () {
          _handleBasemapClick(key, this);
        });

        baselayersList.appendChild(basemapItem);
      });
    }
  }

  /**
   * Handle basemap click
   * @private
   */
  function _handleBasemapClick(key, element) {
    // Remove active class from all basemap items
    document.querySelectorAll(".basemap-item").forEach((item) => {
      item.classList.remove("active");
    });

    // Add active class to clicked item
    element.classList.add("active");

    // Call the setBasemap function
    if (window.interface && typeof window.interface.setBasemap === "function") {
      window.interface.setBasemap(key);
    }
  }

  /**
   * Initialize overlay button states
   * @private
   */
  function _initOverlayButtonStates() {
    const overlayButtons = document.querySelectorAll(
      "#overlays-list sl-button"
    );
    overlayButtons.forEach((button) => {
      button.addEventListener("click", function () {
        this.classList.toggle("active");
      });
    });
  }

  function _addExpandCollapseButton() {
    const layerControlsHeader = document.querySelector(
      ".lc-layer-controls-header"
    );
    if (!layerControlsHeader) {
      console.error("Layer controls header not found");
      return;
    }

    // Check if button already exists
    if (document.querySelector(".expand-collapse-button")) {
      return;
    }

    // Create chevron icon button
    const expandCollapseBtn = document.createElement("sl-icon-button");
    expandCollapseBtn.className = "expand-collapse-button";
    expandCollapseBtn.name = _allExpanded ? "chevron-down" : "chevron-right";
    expandCollapseBtn.label = _allExpanded ? (App.I18n ? App.I18n.t('layers.collapse_all_categories') : "Collapse all categories") : (App.I18n ? App.I18n.t('layers.expand_all_categories') : "Expand all categories");
    
    // Create tooltip
    const tooltip = document.createElement("sl-tooltip");
    tooltip.content = _allExpanded ? (App.I18n ? App.I18n.t('layers.collapse_all_categories') : "Collapse all categories") : (App.I18n ? App.I18n.t('layers.expand_all_categories') : "Expand all categories");
    tooltip.appendChild(expandCollapseBtn);

    expandCollapseBtn.addEventListener("click", _toggleAllCategories);

    // Create container structure
    const headerContent = document.createElement("div");
    headerContent.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 8px;
    `;

    // Create left container for chevron
    const leftContainer = document.createElement("div");
    leftContainer.style.cssText = `
      display: flex;
      align-items: center;
    `;
    leftContainer.appendChild(tooltip);

    // Get existing master controls
    const masterControls = layerControlsHeader.querySelector(
      ".lc-layer-controls-master"
    );

    if (masterControls) {
      headerContent.appendChild(leftContainer);
      headerContent.appendChild(masterControls);
      layerControlsHeader.insertBefore(
        headerContent,
        layerControlsHeader.firstChild
      );
    } else {
      // If master controls not found, just add the button
      layerControlsHeader.insertBefore(
        leftContainer,
        layerControlsHeader.firstChild
      );
    }
  }

  function _initExpandCollapseButton() {
    const existingBtn = document.querySelector(".expand-collapse-button");
    if (existingBtn) {
      return existingBtn; // Return existing button
    }
    
    // Create chevron icon button
    const expandCollapseBtn = document.createElement("sl-icon-button");
    expandCollapseBtn.className = "expand-collapse-button";
    expandCollapseBtn.name = _allExpanded ? "chevron-down" : "chevron-right";
    expandCollapseBtn.label = _allExpanded ? (App.I18n ? App.I18n.t('layers.collapse_all_categories') : "Collapse all categories") : (App.I18n ? App.I18n.t('layers.expand_all_categories') : "Expand all categories");
    
    expandCollapseBtn.addEventListener("click", () => _toggleAllCategories());

    return expandCollapseBtn;
  }

  /**
   * Toggle all categories
   * @private
   */
  function _toggleAllCategories() {
    const expandCollapseBtn = document.querySelector(".expand-collapse-button");
    const tooltip = expandCollapseBtn?.closest("sl-tooltip");
    _allExpanded = !_allExpanded;
    const featureLists = document.querySelectorAll(
      "#featureLayersContainer .lc-feature-list"
    );
    const chevrons = document.querySelectorAll(
      '#featureLayersContainer .lc-category-header sl-icon[name="chevron-down"]'
    );

    featureLists.forEach((list) => {
      if (_allExpanded) {
        list.classList.add("expanded");
      } else {
        list.classList.remove("expanded");
      }
    });

    chevrons.forEach((chevron) => {
      chevron.style.transform = _allExpanded
        ? "rotate(0deg)"
        : "rotate(-90deg)";
    });

    if (expandCollapseBtn) {
      expandCollapseBtn.name = _allExpanded ? "chevron-down" : "chevron-right";
      expandCollapseBtn.label = _allExpanded ? (App.I18n ? App.I18n.t('layers.collapse_all_categories') : "Collapse all categories") : (App.I18n ? App.I18n.t('layers.expand_all_categories') : "Expand all categories");
      if (tooltip) {
        tooltip.content = _allExpanded ? (App.I18n ? App.I18n.t('layers.collapse_all_categories') : "Collapse all categories") : (App.I18n ? App.I18n.t('layers.expand_all_categories') : "Expand all categories");
      }
    }
  }

  /**
   * Populate feature layers in left4 (similar to layers.html)
   * @param {Array} categories - Array of category objects
   * @private
   */
  function _populateFeatureLayers(categories) {
    console.log("=== _populateFeatureLayers called ===");
    console.log("Categories received:", categories.length);
    
    const container = document.getElementById("featureLayersContainer");
    console.log("Container found:", !!container);
    if (!container) {
      console.error("featureLayersContainer not found!");
      return;
    }

    console.log("Clearing existing content...");
    container.innerHTML = ""; // Clear existing content

    // Initialize feature settings
    categories.forEach((feature) => {
      _featureSettings.set(feature.id, {
        visible: feature.clientVisible,
        selectable: true,
        transparency: 0,
      });
    });

    // Group categories by module name
    const moduleGroups = {};
    categories.forEach((category) => {
      if (category.clientVisible) {
        if (!moduleGroups[category.moduleName]) {
          moduleGroups[category.moduleName] = [];
        }
        moduleGroups[category.moduleName].push(category);
      }
    });

    // Initialize category settings
    Object.keys(moduleGroups).forEach((moduleName) => {
      _categorySettings.set(moduleName, {
        visible: true,
        selectable: true,
        transparency: 0,
      });
    });

    // Create collapsible sections for each module
    Object.keys(moduleGroups).forEach((moduleName) => {
      const categoryDiv = document.createElement("div");
      categoryDiv.className = "lc-category";
      categoryDiv.dataset.category = moduleName;

      // Category header
      const header = document.createElement("div");
      header.className = "lc-category-header";

      // Left side with chevron and name
      const leftDiv = document.createElement("div");
      leftDiv.className = "lc-category-header-left";
      leftDiv.style.display = "flex";
      leftDiv.style.alignItems = "center";
      leftDiv.style.gap = "var(--sl-spacing-small)";

      const chevron = document.createElement("sl-icon");
      chevron.name = "chevron-down";
      chevron.style.transition = "transform 0.2s";

      const nameSpan = document.createElement("span");
      nameSpan.className = "lc-category-name";
      nameSpan.textContent = moduleName;

      leftDiv.appendChild(chevron);
      leftDiv.appendChild(nameSpan);

      // Right side with controls
      const categoryControls = _createCategoryControls(moduleName);

      header.appendChild(leftDiv);
      header.appendChild(categoryControls);

      // Feature list
      const featureList = document.createElement("div");
      featureList.className = "lc-feature-list expanded";

      // Add features from this module
      moduleGroups[moduleName].forEach((feature) => {
        const featureElement = _createFeatureElement(feature);
        featureList.appendChild(featureElement);
      });

      // Toggle functionality
      header.addEventListener("click", (e) => {
        // Don't toggle if clicking on controls
        if (e.target.closest(".lc-category-controls")) {
          return;
        }

        const isExpanded = featureList.classList.contains("expanded");
        if (isExpanded) {
          featureList.classList.remove("expanded");
          chevron.style.transform = "rotate(-90deg)";
        } else {
          featureList.classList.add("expanded");
          chevron.style.transform = "rotate(0deg)";
        }
      });

      categoryDiv.appendChild(header);
      categoryDiv.appendChild(featureList);
      container.appendChild(categoryDiv);
    });
    
    console.log("Feature layers populated successfully with", Object.keys(moduleGroups).length, "modules");
  }

  /**
   * Create category controls
   * @private
   */
  function _createCategoryControls(categoryName) {
    const categoryControls = document.createElement("div");
    categoryControls.className = "lc-category-controls";
    categoryControls.style.display = "flex";
    categoryControls.style.alignItems = "center";
    categoryControls.style.gap = "18px";
    categoryControls.style.flexShrink = "0";
    categoryControls.style.marginLeft = "auto";
    categoryControls.style.width = "100px"; // Fixed width to ensure alignment
    categoryControls.style.justifyContent = "flex-end"; // Align items to the right

    // Visibility checkbox
    const visibilityCheckbox = document.createElement("sl-checkbox");
    visibilityCheckbox.checked = true;
    visibilityCheckbox.size = "small";
    visibilityCheckbox.addEventListener("sl-change", (e) => {
      e.stopPropagation();
      _updateCategoryVisibility(categoryName, visibilityCheckbox.checked);
    });

    const visibilityContainer = document.createElement("div");
    visibilityContainer.className = "lc-checkbox-container";
    visibilityContainer.style.width = "32px";
    visibilityContainer.style.height = "32px";
    visibilityContainer.style.display = "flex";
    visibilityContainer.style.alignItems = "center";
    visibilityContainer.style.justifyContent = "center";
    visibilityContainer.appendChild(visibilityCheckbox);

    // Selectable checkbox
    const selectableCheckbox = document.createElement("sl-checkbox");
    selectableCheckbox.checked = true;
    selectableCheckbox.size = "small";
    selectableCheckbox.addEventListener("sl-change", (e) => {
      e.stopPropagation();
      _updateCategorySelectable(categoryName, selectableCheckbox.checked);
    });

    const selectableContainer = document.createElement("div");
    selectableContainer.className = "lc-checkbox-container";
    selectableContainer.style.width = "32px";
    selectableContainer.style.height = "32px";
    selectableContainer.style.display = "flex";
    selectableContainer.style.alignItems = "center";
    selectableContainer.style.justifyContent = "center";
    selectableContainer.appendChild(selectableCheckbox);

    // Settings button
    const settingsButton = document.createElement("sl-icon-button");
    settingsButton.name = "gear";
    settingsButton.label = App.I18n ? App.I18n.t('layers.settings') : "Settings";
    settingsButton.addEventListener("click", (e) => {
      e.stopPropagation();
      _openCategorySettings(categoryName);
    });

    categoryControls.appendChild(visibilityContainer);
    categoryControls.appendChild(selectableContainer);
    categoryControls.appendChild(settingsButton);

    return categoryControls;
  }

  /**
   * Update category visibility
   * @private
   */
  function _updateCategoryVisibility(categoryName, visible) {
    const settings = _categorySettings.get(categoryName);
    settings.visible = visible;
    _categorySettings.set(categoryName, settings);

    // Update all features in this category
    const category = document.querySelector(
      `[data-category="${categoryName}"]`
    );
    if (category) {
      const features = category.querySelectorAll(".lc-feature-item");
      features.forEach((feature) => {
        const featureId = feature.dataset.featureId;
        const featureSettings = _featureSettings.get(featureId);
        featureSettings.visible = visible;
        _featureSettings.set(featureId, featureSettings);

        // Update the checkbox in the UI
        const checkbox = feature.querySelector(
          ".lc-checkbox-container:first-child sl-checkbox"
        );
        if (checkbox) checkbox.checked = visible;

        // Update the layer
        const layerName = `cat-${featureId}`;
        if (visible) {
          if (
            App.Map.Layers &&
            typeof App.Map.Layers.showLayer === "function"
          ) {
            App.Map.Layers.showLayer(layerName);
          }
        } else {
          if (
            App.Map.Layers &&
            typeof App.Map.Layers.hideLayer === "function"
          ) {
            App.Map.Layers.hideLayer(layerName);
          }
        }
      });
    }
  }

  /**
   * Update category selectability
   * @private
   */
  function _updateCategorySelectable(categoryName, selectable) {
    const settings = _categorySettings.get(categoryName);
    settings.selectable = selectable;
    _categorySettings.set(categoryName, settings);

    // Update all features in this category
    const category = document.querySelector(
      `[data-category="${categoryName}"]`
    );
    if (category) {
      const features = category.querySelectorAll(".lc-feature-item");
      features.forEach((feature) => {
        const featureId = feature.dataset.featureId;
        const featureSettings = _featureSettings.get(featureId);
        featureSettings.selectable = selectable;
        _featureSettings.set(featureId, featureSettings);

        // Update the checkbox in the UI
        const checkbox = feature.querySelector(
          ".lc-checkbox-container:nth-child(2) sl-checkbox"
        );
        if (checkbox) checkbox.checked = selectable;
      });
    }
  }

  /**
   * Open category settings
   * @private
   */
  function _openCategorySettings(categoryName) {
    _currentCategoryName = categoryName;
    _currentFeatureId = null;
    _isCategoryMode = true;
    const settings = _categorySettings.get(categoryName);
    const settingsDialog = document.getElementById("settingsDialog");
    const transparencySlider = document.getElementById("transparencySlider");
    const transparencyValue = document.getElementById("transparencyValue");

    if (settingsDialog && transparencySlider && transparencyValue) {
      transparencySlider.value = settings.transparency;
      transparencyValue.textContent = `${settings.transparency}%`;
      settingsDialog.show();
    }
  }

  /**
   * Create a feature element
   * @private
   */
  function _createFeatureElement(feature) {
    const featureDiv = document.createElement("div");
    featureDiv.className = "lc-feature-item";
    featureDiv.dataset.featureId = feature.id;

    // Content container to hold icon and name
    const contentDiv = document.createElement("div");
    contentDiv.className = "lc-feature-content";

    const icon = _createFeatureIcon(feature);
    const info = _createFeatureInfo(feature);

    contentDiv.appendChild(icon);
    contentDiv.appendChild(info);

    const controls = _createFeatureControls(feature);

    featureDiv.appendChild(contentDiv);
    featureDiv.appendChild(controls);

    return featureDiv;
  }

  /**
   * Create feature icon
   * @private
   */
  function _createFeatureIcon(feature) {
    const iconDiv = document.createElement("div");
    iconDiv.className = "lc-feature-icon";

    if (feature.markerSymbol) {
      const img = document.createElement("img");
      img.className = "lc-feature-icon bitmap";
      img.src = `data:image/png;base64,${feature.markerSymbol}`;
      img.style.width = "100%";
      img.style.height = "100%";
      iconDiv.appendChild(img);
    } else {
      iconDiv.className += ` ${feature.geoType.toLowerCase()}`;
      const color = feature.color.startsWith("#")
        ? feature.color
        : `#${feature.color.slice(0, 6)}`;

      if (feature.geoType.toLowerCase() === "point") {
        iconDiv.style.width = "18px";
        iconDiv.style.height = "18px";
        iconDiv.style.borderRadius = "50%";
        iconDiv.style.border = `2px solid ${color}`;
        iconDiv.style.backgroundColor = `${color}40`;
      } else if (feature.geoType.toLowerCase() === "line") {
        iconDiv.style.width = "22px";
        iconDiv.style.height = "4px";
        iconDiv.style.backgroundColor = color;
        iconDiv.style.borderRadius = "2px";
      } else if (feature.geoType.toLowerCase() === "polygon") {
        iconDiv.style.width = "18px";
        iconDiv.style.height = "18px";
        iconDiv.style.border = `3px solid ${color}`;
        iconDiv.style.borderRadius = "4px";
        iconDiv.style.backgroundColor = `${color}40`;
      }
    }

    return iconDiv;
  }

  /**
   * Create feature info
   * @private
   */
  function _createFeatureInfo(feature) {
    const infoDiv = document.createElement("div");
    infoDiv.className = "lc-feature-info";
    const nameDiv = document.createElement("div");
    nameDiv.className = "lc-feature-name";
    nameDiv.textContent = feature.name;
    nameDiv.style.textAlign = "left";
    infoDiv.appendChild(nameDiv);
    return infoDiv;
  }

  /**
   * Create feature controls
   * @private
   */
  function _createFeatureControls(feature) {
    const controlsDiv = document.createElement("div");
    controlsDiv.className = "lc-feature-controls";

    // Visibility checkbox
    const visibilityCheckbox = document.createElement("sl-checkbox");
    visibilityCheckbox.checked = _featureSettings.get(feature.id).visible;
    visibilityCheckbox.size = "small";
    visibilityCheckbox.addEventListener("sl-change", () => {
      _updateFeatureVisibility(feature.id, visibilityCheckbox.checked);
    });

    const visibilityContainer = document.createElement("div");
    visibilityContainer.className = "lc-checkbox-container";
    visibilityContainer.appendChild(visibilityCheckbox);
    const visibilityLabel = document.createElement("div");
    visibilityLabel.className = "lc-checkbox-label";
    visibilityLabel.textContent = App.I18n ? App.I18n.t('layers.visible') : "Visible";
    visibilityContainer.appendChild(visibilityLabel);

    // Selectable checkbox
    const selectableCheckbox = document.createElement("sl-checkbox");
    selectableCheckbox.checked = _featureSettings.get(feature.id).selectable;
    selectableCheckbox.size = "small";
    selectableCheckbox.addEventListener("sl-change", () => {
      _updateFeatureSelectable(feature.id, selectableCheckbox.checked);
    });

    const selectableContainer = document.createElement("div");
    selectableContainer.className = "lc-checkbox-container";
    selectableContainer.appendChild(selectableCheckbox);
    const selectableLabel = document.createElement("div");
    selectableLabel.className = "lc-checkbox-label";
    selectableLabel.textContent = App.I18n ? App.I18n.t('layers.select') : "Select";
    selectableContainer.appendChild(selectableLabel);

    // Settings button
    const settingsButton = document.createElement("sl-icon-button");
    settingsButton.name = "gear";
    settingsButton.label = App.I18n ? App.I18n.t('layers.settings') : "Settings";
    settingsButton.addEventListener("click", () => _openSettings(feature.id));

    controlsDiv.appendChild(visibilityContainer);
    controlsDiv.appendChild(selectableContainer);
    controlsDiv.appendChild(settingsButton);

    return controlsDiv;
  }

  /**
   * Update feature visibility
   * @private
   */
  function _updateFeatureVisibility(featureId, visible) {
    const settings = _featureSettings.get(featureId);
    settings.visible = visible;
    _featureSettings.set(featureId, settings);

    const layerName = `cat-${featureId}`;
    if (visible) {
      if (App.Map.Layers && typeof App.Map.Layers.showLayer === "function") {
        App.Map.Layers.showLayer(layerName);
      }
    } else {
      if (App.Map.Layers && typeof App.Map.Layers.hideLayer === "function") {
        App.Map.Layers.hideLayer(layerName);
      }
    }
    
    // Trigger event for state tracking
    if (App.Core && App.Core.Events) {
      App.Core.Events.trigger('layer:visibility:changed', {
        layerId: layerName,
        featureId: featureId,
        visible: visible
      });
    }
  }

  /**
   * Update feature selectability
   * @private
   */
  function _updateFeatureSelectable(featureId, selectable) {
    const settings = _featureSettings.get(featureId);
    settings.selectable = selectable;
    _featureSettings.set(featureId, settings);

    // Implement selectability logic
    console.log(`Feature ${featureId} selectable set to: ${selectable}`);
  }

  /**
   * Open settings dialog
   * @private
   */
  function _openSettings(featureId) {
    _currentFeatureId = featureId;
    _currentCategoryName = null;
    _isCategoryMode = false;
    const settings = _featureSettings.get(featureId);
    const settingsDialog = document.getElementById("settingsDialog");
    const transparencySlider = document.getElementById("transparencySlider");
    const transparencyValue = document.getElementById("transparencyValue");

    if (settingsDialog && transparencySlider && transparencyValue) {
      transparencySlider.value = settings.transparency;
      transparencyValue.textContent = `${settings.transparency}%`;
      settingsDialog.show();
    }
  }

  /**
   * Initialize search functionality
   * @private
   */
  function _initSearch() {
    const searchInput = document.getElementById("layerSearchInput");
    if (!searchInput) return;

    searchInput.addEventListener("sl-input", () => {
      const searchTerm = searchInput.value.toLowerCase();

      const categories = document.querySelectorAll(
        "#featureLayersContainer .lc-category"
      );
      categories.forEach((category) => {
        const categoryName = category.dataset.category.toLowerCase();
        const features = category.querySelectorAll(".lc-feature-item");
        let hasVisibleFeatures = false;

        features.forEach((feature) => {
          const featureName = feature
            .querySelector(".lc-feature-name")
            .textContent.toLowerCase();
          if (
            categoryName.includes(searchTerm) ||
            featureName.includes(searchTerm)
          ) {
            feature.hidden = false;
            hasVisibleFeatures = true;
          } else {
            feature.hidden = true;
          }
        });

        if (hasVisibleFeatures) {
          category.hidden = false;
          // Expand category when searching
          const featureList = category.querySelector(".lc-feature-list");
          const chevron = category.querySelector(
            'sl-icon[name="chevron-down"]'
          );
          if (featureList) {
            featureList.classList.add("expanded");
            chevron.style.transform = "rotate(0deg)";
          }
        } else {
          category.hidden = true;
        }
      });
    });

    searchInput.addEventListener("sl-clear", () => {
      const categories = document.querySelectorAll(
        "#featureLayersContainer .lc-category"
      );
      categories.forEach((category) => {
        category.hidden = false;
        const features = category.querySelectorAll(".lc-feature-item");
        features.forEach((feature) => {
          feature.hidden = false;
        });
      });
    });
  }

  /**
   * Initialize transparency slider
   * @private
   */
  function _initTransparencySlider() {
    const transparencySlider = document.getElementById("transparencySlider");
    const transparencyValue = document.getElementById("transparencyValue");

    if (transparencySlider && transparencyValue) {
      transparencySlider.addEventListener("sl-change", () => {
        const value = transparencySlider.value;
        transparencyValue.textContent = `${value}%`;

        if (_isCategoryMode && _currentCategoryName) {
          _updateCategoryTransparency(_currentCategoryName, value);
        } else if (_currentFeatureId) {
          _updateFeatureTransparency(_currentFeatureId, value);
        }
      });

      transparencySlider.addEventListener("sl-input", () => {
        const value = transparencySlider.value;
        transparencyValue.textContent = `${value}%`;
      });
    }
  }

  /**
   * Update category transparency
   * @private
   */
  function _updateCategoryTransparency(categoryName, transparency) {
    const settings = _categorySettings.get(categoryName);
    settings.transparency = transparency;
    _categorySettings.set(categoryName, settings);

    // Update all features in this category
    const category = document.querySelector(
      `[data-category="${categoryName}"]`
    );
    if (category) {
      const features = category.querySelectorAll(".lc-feature-item");
      features.forEach((feature) => {
        const featureId = feature.dataset.featureId;
        const featureSettings = _featureSettings.get(featureId);
        featureSettings.transparency = transparency;
        _featureSettings.set(featureId, featureSettings);

        // Implement actual transparency update here
        console.log(
          `Setting transparency for feature ${featureId} to ${transparency}%`
        );
      });
    }
  }

  /**
   * Update feature transparency
   * @private
   */
  function _updateFeatureTransparency(featureId, transparency) {
    const settings = _featureSettings.get(featureId);
    settings.transparency = transparency;
    _featureSettings.set(featureId, settings);

    // Implement actual transparency update here
    console.log(
      `Setting transparency for feature ${featureId} to ${transparency}%`
    );
  }

  /**
   * Initialize master checkboxes for all layers
   * @private
   */
  function _initMasterCheckboxes() {
    const masterVisibleCheckbox = document.getElementById(
      "masterVisibleCheckbox"
    );
    const masterSelectableCheckbox = document.getElementById(
      "masterSelectableCheckbox"
    );

    if (masterVisibleCheckbox) {
      masterVisibleCheckbox.addEventListener("sl-change", () => {
        const isChecked = masterVisibleCheckbox.checked;

        // Update all category checkboxes
        document
          .querySelectorAll(
            ".lc-category-controls .lc-checkbox-container:first-child sl-checkbox"
          )
          .forEach((checkbox) => {
            checkbox.checked = isChecked;
            const categoryName =
              checkbox.closest(".lc-category").dataset.category;
            _updateCategoryVisibility(categoryName, isChecked);
          });

        // Update all feature checkboxes
        document
          .querySelectorAll(
            ".lc-feature-controls .lc-checkbox-container:first-child sl-checkbox"
          )
          .forEach((checkbox) => {
            checkbox.checked = isChecked;
            const featureId =
              checkbox.closest(".lc-feature-item").dataset.featureId;
            _updateFeatureVisibility(featureId, isChecked);
          });
      });
    }

    if (masterSelectableCheckbox) {
      masterSelectableCheckbox.addEventListener("sl-change", () => {
        const isChecked = masterSelectableCheckbox.checked;

        // Update all category checkboxes
        document
          .querySelectorAll(
            ".lc-category-controls .lc-checkbox-container:nth-child(2) sl-checkbox"
          )
          .forEach((checkbox) => {
            checkbox.checked = isChecked;
            const categoryName =
              checkbox.closest(".lc-category").dataset.category;
            _updateCategorySelectable(categoryName, isChecked);
          });

        // Update all feature checkboxes
        document
          .querySelectorAll(
            ".lc-feature-controls .lc-checkbox-container:nth-child(2) sl-checkbox"
          )
          .forEach((checkbox) => {
            checkbox.checked = isChecked;
            const featureId =
              checkbox.closest(".lc-feature-item").dataset.featureId;
            _updateFeatureSelectable(featureId, isChecked);
          });
      });
    }
  }

  /**
   * Mark UI as initialized to show hidden elements
   * @private
   */
  function _markUIAsInitialized() {
    // Add initialized class to body
    document.body.classList.add('ui-initialized');
    
    // Mark all drawers as initialized
    document.querySelectorAll('sl-drawer[id$="-drawer"]').forEach(drawer => {
      drawer.classList.add('initialized');
    });
    
    // Mark sidebar content as ready
    document.querySelectorAll('.sidebar-content').forEach(content => {
      content.classList.add('ready');
    });
  }

  // Public API
  return {
    /**
     * Initialize the layer UI
     */
    initialize: function () {
      // Create settings dialog if it doesn't exist
      if (!document.getElementById("settingsDialog")) {
        const dialog = document.createElement("sl-dialog");
        dialog.id = "settingsDialog";
        dialog.label = App.I18n ? App.I18n.t('layers.layer_settings') : "Layer Settings";
        dialog.innerHTML = `
                <div class="transparency-control">
                    <label class="transparency-label" for="transparencySlider">${App.I18n ? App.I18n.t('layers.transparency') : "Transparency"}</label>
                    <sl-range id="transparencySlider" min="0" max="100" value="0" 
                              tooltip="top" 
                              style="--sl-color-primary-600: #4682b4">
                    </sl-range>
                    <div class="transparency-value" id="transparencyValue">0%</div>
                </div>
            `;
        document.body.appendChild(dialog);
      }

      // Initialize collapsible sections for baselayers/overlays in left1
      _initCollapsibleSections();

      // Populate baselayers in left1
      _populateBaselayers();

      // Initialize overlay button states in left1
      _initOverlayButtonStates();

      // Initialize expand/collapse all button
      _initExpandCollapseButton();

      // Initialize search functionality for left4
      _initSearch();

      // Initialize transparency slider
      _initTransparencySlider();

      _initOverlayButtonStates();

      _addExpandCollapseButton();

      _initMasterCheckboxes();

      // Check if we have categories from App.Map.Layers
      let hasCategories = false;
      let categories = [];

      if (
        App.Map.Layers &&
        typeof App.Map.Layers.getFeatureCategories === "function"
      ) {
        try {
          categories = App.Map.Layers.getFeatureCategories();
          if (categories && categories.length > 0) {
            hasCategories = true;
            console.log(
              "Found " + categories.length + " categories from App.Map.Layers"
            );
          }
        } catch (e) {
          console.error("Error getting categories:", e);
        }
      }

      // Load categories or demo layers
      if (hasCategories) {
        console.log("Loading categories from App.Map.Layers");
        this.updateFeatureLayersFromCategories(categories);
      } else {
        console.log("No categories found, loading demo layers");
        this.updateFeatureLayersFromCategories(_demoLayers);
      }

      console.log("Layer UI initialized");
      
      // Notify UI initialization manager that we're ready
      if (window.UIInitializationManager) {
        window.UIInitializationManager.checkReady();
      }
    },

    /**
     * Refresh baselayers list
     */
    refreshBaselayers: function () {
      _populateBaselayers();
    },

    /**
     * Update feature layers from categories
     * @param {Array} categories - Array of category objects
     */
    updateFeatureLayersFromCategories: function (categories) {
      console.log("=== updateFeatureLayersFromCategories called ===");
      console.log(
        "Updating feature layers with " + categories.length + " categories"
      );
      console.log("First category:", categories[0]);
      console.log("Calling _populateFeatureLayers...");
      _populateFeatureLayers(categories);
    },

    /**
     * Load demo layers for testing
     */
    loadDemoLayers: function () {
      console.log("Manually loading demo layers");
      this.updateFeatureLayersFromCategories(_demoLayers);
    },
    
    /**
     * Force refresh with current categories from App.Map.Layers
     */
    refreshFromCurrentCategories: function() {
      console.log("=== refreshFromCurrentCategories called ===");
      if (App.Map.Layers && typeof App.Map.Layers.getFeatureCategories === "function") {
        const categories = App.Map.Layers.getFeatureCategories();
        console.log("Found", categories ? categories.length : 0, "categories to refresh");
        if (categories && categories.length > 0) {
          this.updateFeatureLayersFromCategories(categories);
        } else {
          console.warn("No categories found in App.Map.Layers");
        }
      } else {
        console.error("App.Map.Layers.getFeatureCategories not available");
      }
    },
  };
})();

// Initialize when document is ready
document.addEventListener("DOMContentLoaded", function () {
  console.log("[Layers UI] DOMContentLoaded event fired");
  
  // Initialize after Shoelace components are defined
  if (customElements.get("sl-icon")) {
    console.log("[Layers UI] Shoelace already defined, initializing now");
    App.Map.Layers.UI.initialize();
  } else {
    console.log("[Layers UI] Waiting for Shoelace to be defined");
    customElements.whenDefined("sl-icon").then(() => {
      console.log("[Layers UI] Shoelace defined, initializing now");
      App.Map.Layers.UI.initialize();
    });
  }
});

// Add debug helper to window for testing
window.debugFeatureLayers = function() {
  console.log("=== Feature Layers Debug Info ===");
  const categories = App.Map.Layers.getFeatureCategories();
  console.log("Total categories:", categories ? categories.length : 0);
  
  // Check UI container state
  const container = document.getElementById("featureLayersContainer");
  if (container) {
    const childCount = container.children.length;
    console.log("UI container has", childCount, "category groups");
    
    if (childCount === 0 && categories && categories.length > 0) {
      console.log("WARNING: UI is empty but categories are loaded!");
    }
  }
  
  if (categories && categories.length > 0) {
    console.log("First 5 categories:", categories.slice(0, 5).map(c => ({
      name: c.name,
      moduleName: c.moduleName,
      visible: c.clientVisible,
      geoType: c.geoType
    })));
    console.log("\nModule groups found:");
    const modules = [...new Set(categories.map(c => c.moduleName || "(No Module)"))];
    modules.forEach(m => {
      const count = categories.filter(c => (c.moduleName || "(No Module)") === m).length;
      console.log("  - " + m + ": " + count + " categories");
    });
    console.log("\nTo refresh UI with current categories, run:");
    console.log("  App.Map.Layers.UI.refreshFromCurrentCategories()");
  } else {
    console.log("No categories loaded yet. The demo layers are shown.");
  }
  
  return {
    categoriesLoaded: categories ? categories.length : 0,
    uiChildCount: container ? container.children.length : -1
  };
};

// Check if interface.loadCategories was ever called
window.checkInterfaceLoadCategories = function() {
  console.log("=== Checking interface.loadCategories ===");
  console.log("window.interface exists?", !!window.interface);
  console.log("interface.loadCategories exists?", !!(window.interface && window.interface.loadCategories));
  
  // Monkey-patch to detect if it's called
  if (window.interface && window.interface.loadCategories) {
    const original = window.interface.loadCategories;
    window.interface.loadCategories = function(data) {
      console.log("!!! interface.loadCategories WAS CALLED !!!");
      console.log("Data received:", data ? data.substring(0, 200) + "..." : "null");
      const result = original.call(this, data);
      
      // After call, check if categories were loaded
      setTimeout(() => {
        const cats = App.Map.Layers.getFeatureCategories();
        console.log("After loadCategories - categories count:", cats ? cats.length : 0);
        
        // Force UI update
        if (cats && cats.length > 0) {
          console.log("Forcing UI update with loaded categories");
          App.Map.Layers.UI.refreshFromCurrentCategories();
        }
      }, 100);
      
      return result;
    };
    console.log("Monkey-patch installed on interface.loadCategories");
  }
  
  return {
    interfaceExists: !!window.interface,
    loadCategoriesExists: !!(window.interface && window.interface.loadCategories)
  };
};

// Auto-install the monkey patch when the page loads
if (window.interface) {
  checkInterfaceLoadCategories();
}

// Diagnostic function to check everything
window.diagnoseCategoriesIssue = function() {
  console.log("=== FULL DIAGNOSIS ===");
  
  // 1. Check if categories are loaded
  const cats = App.Map.Layers.getFeatureCategories();
  console.log("1. Categories loaded:", cats ? cats.length : 0);
  
  // 2. Check debug categories
  console.log("2. Debug categories:", window._debugCategories ? window._debugCategories.length : "none");
  
  // 3. Check UI container
  const container = document.getElementById("featureLayersContainer");
  console.log("3. UI container exists:", !!container);
  console.log("   Container children:", container ? container.children.length : "N/A");
  
  // 4. Check if UI module is ready
  console.log("4. UI module ready:", !!(App.Map.Layers.UI && App.Map.Layers.UI.updateFeatureLayersFromCategories));
  
  // 5. Try to get first category details
  if (cats && cats.length > 0) {
    console.log("5. First category:", cats[0]);
  }
  
  // 6. Force update
  if (cats && cats.length > 0 && container && container.children.length === 0) {
    console.log("6. Attempting force update...");
    App.Map.Layers.UI.updateFeatureLayersFromCategories(cats);
    
    setTimeout(() => {
      console.log("   After force update - children:", container.children.length);
    }, 500);
  }
  
  return {
    categoriesLoaded: cats ? cats.length : 0,
    debugCategories: window._debugCategories ? window._debugCategories.length : 0,
    containerExists: !!container,
    containerChildren: container ? container.children.length : 0,
    uiModuleReady: !!(App.Map.Layers.UI && App.Map.Layers.UI.updateFeatureLayersFromCategories)
  };
};

// Test function to manually load categories
window.testLoadCategories = function() {
  console.log("Testing loadCategories with sample data...");
  const testData = [
    {
      "clientVisible": true,
      "color": "#047DBD",
      "geoType": "point",
      "geoTypeCode": 3,
      "id": "test-1",
      "lineStyle": 0,
      "markerSymbol": "",
      "minZoom": 1,
      "moduleName": "Test Module",
      "name": "Test Point",
      "parentCategories": "",
      "priority": 0
    },
    {
      "clientVisible": true,
      "color": "#FF0000",
      "geoType": "line",
      "geoTypeCode": 4,
      "id": "test-2",
      "lineStyle": 0,
      "markerSymbol": "",
      "minZoom": 1,
      "moduleName": "Test Module",
      "name": "Test Line",
      "parentCategories": "",
      "priority": 0
    }
  ];
  
  // Call loadCategories directly
  if (App.Map.Layers && App.Map.Layers.loadCategories) {
    App.Map.Layers.loadCategories(testData);
    console.log("Test data loaded. Check UI now.");
    
    // Debug current state
    setTimeout(() => {
      debugFeatureLayers();
    }, 500);
  } else {
    console.error("App.Map.Layers.loadCategories not found!");
  }
};

console.log("[Layers UI] File loaded completely - app.map.layers.ui.js");
console.log("[Layers UI] window.simpleTest available:", typeof window.simpleTest);
console.log("[Layers UI] App.Map.Layers.UI available:", !!(window.App && window.App.Map && window.App.Map.Layers && window.App.Map.Layers.UI));
