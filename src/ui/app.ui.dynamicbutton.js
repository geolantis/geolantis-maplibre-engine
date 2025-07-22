/**
 * Dynamic button control for Geolantis360 - Expands to the right with sub-buttons
 * @namespace App.UI.DynamicButton
 */
App.UI = App.UI || {};
App.UI.DynamicButton = (function () {
  // Private variables
  var _map = null;
  var _container = null;
  var _isExpanded = false;
  var _currentMode = "default";
  var _buttonConfigs = {};
  var _primaryButton = null;
  var _secondaryButtons = [];
  var _eventHandlers = {};
  var _expandedSubButtons = {};
  var _basemapSelectionEnabled = false; // Track basemap selection state
  var _multiSelectEnabled = false; // Track multi-select state
  var _terrainEnabled = false; // Track terrain state
  var _offlineModeEnabled = false; // Track offline mode state
  var _lengthLabelsEnabled = false; // Track length labels state
  var _slopeAngleLabelsEnabled = false; // Track slope angle labels state
  var _slopePercentLabelsEnabled = false; // Track slope percent labels state

  /**
   * Default button configurations for different modes
   * @private
   */
  var _defaultModes = {
    default: {
      primary: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
        title: "Dynamic Actions",
        className: "",
      },
      secondary: [
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 13V2l8 4-8 4"/><path d="M20.561 10.222a9 9 0 1 1-12.55-5.29"/><path d="M8.002 9.997a5 5 0 1 0 8.9 2.02"/></svg>',
          title: "Navigation",
          action: "navigationMenu",
          className: "",
          hasSubButtons: true,
          subButtons: [
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
              title: "Start Navigation",
              action: "startNavigation",
              className: "",
            },
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>',
              title: "Reset Target",
              action: "resetTarget",
              className: "",
            },
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
              title: "Settings",
              action: "settingsMenu",
              className: "",
              hasSubButtons: true,
              subButtons: [
                {
                  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>',
                  title: "Preferences",
                  action: "preferences",
                  className: "",
                },
                {
                  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
                  title: "Customize",
                  action: "customize",
                  className: "",
                },
              ],
            },
          ],
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>',
          title: "Measure",
          action: "toggleMeasure",
          className: "",
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.9-1.9"/></svg>',
          title: "Inspect",
          action: "toggleInspect",
          className: "",
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-mouse-pointer"><path d="M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z"/><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/></svg>',
          title: "Toggle Basemap Selection",
          action: "toggleBasemapSelection",
          className: "basemap-toggle",
          isToggle: true, // Special flag for toggle behavior
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-check"><path d="m12 15 2 2 4-4"/><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
          title: "Toggle Multi-Select Mode",
          action: "toggleMultiSelect",
          className: "multiselect-toggle",
          isToggle: true, // Special flag for toggle behavior
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mountain-icon lucide-mountain"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>',
          title: "Toggle 3D Terrain",
          action: "toggleTerrain",
          className: "terrain-toggle",
          isToggle: true, // Special flag for toggle behavior
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wifi-off-icon lucide-wifi-off"><path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/></svg>',
          title: "Toggle Offline Mode",
          action: "toggleOfflineMode",
          className: "offline-toggle",
          isToggle: true, // Special flag for toggle behavior
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tag-icon lucide-tag"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
          title: "Labels",
          action: "labelsMenu",
          className: "",
          hasSubButtons: true,
          subButtons: [
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ruler-dimension-line-icon lucide-ruler-dimension-line"><path d="M12 15v-3.014"/><path d="M16 15v-3.014"/><path d="M20 6H4"/><path d="M20 8V4"/><path d="M4 8V4"/><path d="M8 15v-3.014"/><rect x="3" y="12" width="18" height="7" rx="1"/></svg>',
              title: "Toggle Length Labels",
              action: "toggleLengthLabels",
              className: "length-labels-toggle",
              isToggle: true,
            },
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-right-icon lucide-triangle-right"><path d="M22 18a2 2 0 0 1-2 2H3c-1.1 0-1.3-.6-.4-1.3L20.4 4.3c.9-.7 1.6-.4 1.6.7Z"/></svg>',
              title: "Toggle Slope Angle Labels (degrees)",
              action: "toggleSlopeAngleLabels",
              className: "slope-angle-toggle",
              isToggle: true,
            },
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-percent-icon lucide-percent"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>',
              title: "Toggle Slope Percent Labels",
              action: "toggleSlopePercentLabels", 
              className: "slope-percent-toggle",
              isToggle: true,
            },
          ],
        },
      ],
    },
    navigation: {
      primary: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4682b4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
        title: "Navigation Mode",
        className: "active-mode",
      },
      secondary: [
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
          title: "Stop Navigation",
          action: "stopNavigation",
          className: "danger",
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>',
          title: "Reset Target",
          action: "resetTarget",
          className: "",
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-mouse-pointer"><path d="M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z"/><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/></svg>',
          title: "Toggle Basemap Selection",
          action: "toggleBasemapSelection",
          className: "basemap-toggle",
          isToggle: true,
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-check"><path d="m12 15 2 2 4-4"/><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
          title: "Toggle Multi-Select Mode",
          action: "toggleMultiSelect",
          className: "multiselect-toggle",
          isToggle: true,
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mountain-icon lucide-mountain"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>',
          title: "Toggle 3D Terrain",
          action: "toggleTerrain",
          className: "terrain-toggle",
          isToggle: true,
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wifi-off-icon lucide-wifi-off"><path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/></svg>',
          title: "Toggle Offline Mode",
          action: "toggleOfflineMode",
          className: "offline-toggle",
          isToggle: true,
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tag-icon lucide-tag"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
          title: "Labels",
          action: "labelsMenu",
          className: "",
          hasSubButtons: true,
          subButtons: [
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ruler-dimension-line-icon lucide-ruler-dimension-line"><path d="M12 15v-3.014"/><path d="M16 15v-3.014"/><path d="M20 6H4"/><path d="M20 8V4"/><path d="M4 8V4"/><path d="M8 15v-3.014"/><rect x="3" y="12" width="18" height="7" rx="1"/></svg>',
              title: "Toggle Length Labels",
              action: "toggleLengthLabels",
              className: "length-labels-toggle",
              isToggle: true,
            },
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-right-icon lucide-triangle-right"><path d="M22 18a2 2 0 0 1-2 2H3c-1.1 0-1.3-.6-.4-1.3L20.4 4.3c.9-.7 1.6-.4 1.6.7Z"/></svg>',
              title: "Toggle Slope Angle Labels (degrees)",
              action: "toggleSlopeAngleLabels",
              className: "slope-angle-toggle",
              isToggle: true,
            },
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-percent-icon lucide-percent"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>',
              title: "Toggle Slope Percent Labels",
              action: "toggleSlopePercentLabels", 
              className: "slope-percent-toggle",
              isToggle: true,
            },
          ],
        },
      ],
    },
    measure: {
      primary: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4682b4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
        title: "Measure Mode",
        className: "active-mode",
      },
      secondary: [
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
          title: "Stop Measuring",
          action: "stopMeasure",
          className: "danger",
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
          title: "Clear Measurements",
          action: "clearMeasurements",
          className: "",
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-mouse-pointer"><path d="M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z"/><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/></svg>',
          title: "Toggle Basemap Selection",
          action: "toggleBasemapSelection",
          className: "basemap-toggle",
          isToggle: true,
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-check"><path d="m12 15 2 2 4-4"/><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
          title: "Toggle Multi-Select Mode",
          action: "toggleMultiSelect",
          className: "multiselect-toggle",
          isToggle: true,
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mountain-icon lucide-mountain"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>',
          title: "Toggle 3D Terrain",
          action: "toggleTerrain",
          className: "terrain-toggle",
          isToggle: true,
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wifi-off-icon lucide-wifi-off"><path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/></svg>',
          title: "Toggle Offline Mode",
          action: "toggleOfflineMode",
          className: "offline-toggle",
          isToggle: true,
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tag-icon lucide-tag"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
          title: "Labels",
          action: "labelsMenu",
          className: "",
          hasSubButtons: true,
          subButtons: [
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ruler-dimension-line-icon lucide-ruler-dimension-line"><path d="M12 15v-3.014"/><path d="M16 15v-3.014"/><path d="M20 6H4"/><path d="M20 8V4"/><path d="M4 8V4"/><path d="M8 15v-3.014"/><rect x="3" y="12" width="18" height="7" rx="1"/></svg>',
              title: "Toggle Length Labels",
              action: "toggleLengthLabels",
              className: "length-labels-toggle",
              isToggle: true,
            },
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-right-icon lucide-triangle-right"><path d="M22 18a2 2 0 0 1-2 2H3c-1.1 0-1.3-.6-.4-1.3L20.4 4.3c.9-.7 1.6-.4 1.6.7Z"/></svg>',
              title: "Toggle Slope Angle Labels (degrees)",
              action: "toggleSlopeAngleLabels",
              className: "slope-angle-toggle",
              isToggle: true,
            },
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-percent-icon lucide-percent"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>',
              title: "Toggle Slope Percent Labels",
              action: "toggleSlopePercentLabels", 
              className: "slope-percent-toggle",
              isToggle: true,
            },
          ],
        },
      ],
    },
  };

  /**
   * Update primary button based on current mode
   * @private
   */
  function _updatePrimaryButton() {
    const config = _buttonConfigs[_currentMode].primary;
    _primaryButton.innerHTML = config.icon;
    _primaryButton.title = config.title;
    _primaryButton.className = `maplibregl-ctrl-icon dynamic-button-primary ${config.className}`;
  }

  /**
   * Toggle expanded state
   * @private
   */
  function _toggleExpanded(e) {
    if (e) e.stopPropagation();

    console.log("Toggling expanded state:", !_isExpanded);

    _isExpanded = !_isExpanded;

    // Position secondary buttons
    _positionSecondaryButtons();

    // Hide all sub-buttons when collapsing main menu
    if (!_isExpanded) {
      Object.values(_expandedSubButtons).forEach((buttons) => {
        buttons.forEach((btn) => {
          btn.style.visibility = "hidden";
          btn.style.opacity = "0";
          btn.style.transform = `translate(${btn.dataset.x}px, ${btn.dataset.y}px) scale(0.5)`;
        });
      });
    }
  }

  /**
   * Get dynamic button spacing based on current button size
   * @private
   */
  function _getDynamicSpacing() {
    // Get the actual button size from computed styles
    const primaryButton = _primaryButton || document.querySelector('.dynamic-button-primary');
    if (primaryButton) {
      const computed = window.getComputedStyle(primaryButton);
      const width = parseFloat(computed.width);
      // Add 5px padding between buttons
      return width + 5;
    }
    // Default fallback
    return 55;
  }

  /**
   * Position secondary buttons horizontally to the right
   * @private
   */
  function _positionSecondaryButtons() {
    const spacing = _getDynamicSpacing(); // Dynamic spacing based on button size

    _secondaryButtons.forEach((button, index) => {
      const x = (index + 1) * spacing;

      if (_isExpanded) {
        button.style.visibility = "visible";
        button.style.transform = `translate(${x}px, 0) scale(1)`;
        button.style.opacity = "1";
      } else {
        button.style.visibility = "hidden";
        button.style.transform = "translate(0, 0) scale(0.5)";
        button.style.opacity = "0";
      }
    });
  }

  /**
   * Toggle sub-buttons
   * @private
   */
  function _toggleSubButtons(action) {
    console.log("Toggling sub-buttons for action:", action);
    console.log("_expandedSubButtons keys:", Object.keys(_expandedSubButtons));
    console.log("Sub-buttons for", action + ":", _expandedSubButtons[action]);

    if (_expandedSubButtons[action]) {
      const subButtons = _expandedSubButtons[action];
      console.log("Found", subButtons.length, "sub-buttons for", action);
      
      const isCurrentlyExpanded = subButtons[0].style.visibility === "visible";
      console.log("Currently expanded?", isCurrentlyExpanded);
      
      const spacing = _getDynamicSpacing(); // Get current spacing

      // If expanding labels menu, hide other sub-menus to avoid overlap
      if (!isCurrentlyExpanded && action === 'labelsMenu') {
        Object.keys(_expandedSubButtons).forEach(otherAction => {
          if (otherAction !== action && _expandedSubButtons[otherAction]) {
            _expandedSubButtons[otherAction].forEach(btn => {
              btn.style.visibility = "hidden";
              btn.style.opacity = "0";
              btn.style.transform = `translate(${btn.dataset.x}px, ${btn.dataset.y}px) scale(0.5)`;
            });
          }
        });
      }

      // Toggle the sub-buttons for the clicked button
      subButtons.forEach((btn, index) => {
        if (isCurrentlyExpanded) {
          // Hide if currently expanded
          btn.style.visibility = "hidden";
          btn.style.opacity = "0";
          btn.style.transform = `translate(${btn.dataset.x}px, ${btn.dataset.y}px) scale(0.5)`;
        } else {
          // Show if currently hidden - use stored positions
          const x = parseFloat(btn.dataset.x);
          const y = parseFloat(btn.dataset.y);
          
          console.log("Showing sub-button", index, "dataset values:", btn.dataset.x, btn.dataset.y);
          console.log("Parsed position:", x, y);
          
          // If dataset values are missing, try to calculate them
          if (isNaN(x) || isNaN(y)) {
            console.warn("Invalid dataset values for sub-button", index, "- recalculating...");
            
            // Find the parent button index
            const parentIndex = parseInt(btn.dataset.parentIndex);
            const subIndex = parseInt(btn.dataset.subIndex);
            const spacing = _getDynamicSpacing();
            
            if (!isNaN(parentIndex) && !isNaN(subIndex)) {
              // Recalculate position for labels menu
              const recalcX = (parentIndex + 1) * spacing;
              const recalcY = spacing * (subIndex + 1);
              
              console.log("Recalculated position:", recalcX, recalcY);
              
              // Update dataset
              btn.dataset.x = recalcX;
              btn.dataset.y = recalcY;
              
              // Use recalculated values
              btn.style.transform = `translate(${recalcX}px, ${recalcY}px) scale(1)`;
            } else {
              console.error("Cannot recalculate position - parent/sub indices missing");
              return;
            }
          } else {
            // Use existing dataset values
            btn.style.transform = `translate(${x}px, ${y}px) scale(1)`;
          }
          
          // Force immediate position update
          btn.style.visibility = "visible";
          btn.style.zIndex = "10"; // Ensure buttons are above other elements
          btn.style.opacity = "1";
          
          // Force a reflow to ensure styles are applied
          btn.offsetHeight;
        }
      });
    } else {
      console.warn("No sub-buttons found for action:", action);
    }
  }

  /**
   * Update toggle button state
   * @private
   */
  function _updateToggleButtonState(button, isActive) {
    if (isActive) {
      button.style.backgroundColor = "rgba(70, 130, 180, 0.8)"; // Geolantis360 blue
      button.style.color = "white";
      button.style.boxShadow = "0 0 0 2px rgba(70, 130, 180, 1)";
      button.classList.add("active-toggle");
    } else {
      button.style.backgroundColor = "rgba(255, 255, 255, 0.4)";
      button.style.color = "inherit";
      button.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.1)";
      button.classList.remove("active-toggle");
    }
  }

  /**
   * Handle secondary button click
   * @private
   */
  function _handleSecondaryClick(action) {
    console.log("Secondary button clicked:", action);

    // Handle special toggle button behavior
    if (action === "toggleBasemapSelection") {
      _basemapSelectionEnabled = !_basemapSelectionEnabled;

      // Update all instances of the basemap toggle button
      const toggleButtons = document.querySelectorAll(
        `.dynamic-button-secondary.basemap-toggle, .dynamic-button-sub.basemap-toggle`
      );
      toggleButtons.forEach((button) => {
        _updateToggleButtonState(button, _basemapSelectionEnabled);
        button.title = _basemapSelectionEnabled
          ? "Disable Basemap Selection"
          : "Enable Basemap Selection";
      });

      // Update state if available
      if (App.Core.State) {
        App.Core.State.set(
          "settings.basemapSelectionEnabled",
          _basemapSelectionEnabled
        );
      }

      // Execute action if handler exists
      if (_eventHandlers[action]) {
        _eventHandlers[action](_basemapSelectionEnabled);
      }

      // Trigger event for other modules
      if (App.Core.Events) {
        App.Core.Events.trigger("dynamicButton:action", {
          action: action,
          mode: _currentMode,
          isActive: _basemapSelectionEnabled,
        });
      }

      return;
    }

    // Handle multi-select toggle
    if (action === "toggleMultiSelect") {
      _multiSelectEnabled = !_multiSelectEnabled;

      // Update all instances of the multi-select toggle button
      const toggleButtons = document.querySelectorAll(
        `.dynamic-button-secondary.multiselect-toggle, .dynamic-button-sub.multiselect-toggle`
      );
      toggleButtons.forEach((button) => {
        _updateToggleButtonState(button, _multiSelectEnabled);
        button.title = _multiSelectEnabled
          ? "Disable Multi-Select Mode"
          : "Enable Multi-Select Mode";
      });

      // Update state if available
      if (App.Core.State) {
        App.Core.State.set("settings.multiSelectEnabled", _multiSelectEnabled);
      }

      // Execute action if handler exists
      if (_eventHandlers[action]) {
        _eventHandlers[action](_multiSelectEnabled);
      }

      // Trigger event for other modules
      if (App.Core.Events) {
        App.Core.Events.trigger("dynamicButton:action", {
          action: action,
          mode: _currentMode,
          isActive: _multiSelectEnabled,
        });
      }

      return;
    }

    // Handle terrain toggle
    if (action === "toggleTerrain") {
      // Check if terrain module is available
      if (App.Map.Terrain && App.Map.Terrain.toggleTerrain) {
        // Toggle terrain and get the new state
        App.Map.Terrain.toggleTerrain();
        _terrainEnabled = App.Map.Terrain.isTerrainEnabled();
        
        // Update all instances of the terrain toggle button
        const toggleButtons = document.querySelectorAll(
          `.dynamic-button-secondary.terrain-toggle, .dynamic-button-sub.terrain-toggle`
        );
        toggleButtons.forEach((button) => {
          _updateToggleButtonState(button, _terrainEnabled);
          button.title = _terrainEnabled
            ? "Disable 3D Terrain"
            : "Enable 3D Terrain";
        });

        // Update state if available
        if (App.Core.State) {
          App.Core.State.set("settings.terrainEnabled", _terrainEnabled);
        }

        // Execute action if handler exists
        if (_eventHandlers[action]) {
          _eventHandlers[action](_terrainEnabled);
        }

        // Trigger event for other modules
        if (App.Core.Events) {
          App.Core.Events.trigger("dynamicButton:action", {
            action: action,
            mode: _currentMode,
            isActive: _terrainEnabled,
          });
        }
      } else {
        console.warn("Terrain module not available");
      }

      return;
    }

    // Handle offline mode toggle
    if (action === "toggleOfflineMode") {
      _offlineModeEnabled = !_offlineModeEnabled;
      
      // Update all instances of the offline toggle button
      const toggleButtons = document.querySelectorAll(
        `.dynamic-button-secondary.offline-toggle, .dynamic-button-sub.offline-toggle`
      );
      toggleButtons.forEach((button) => {
        _updateToggleButtonState(button, _offlineModeEnabled);
        button.title = _offlineModeEnabled
          ? "Disable Offline Mode"
          : "Enable Offline Mode";
      });

      // Update state if available
      if (App.Core.State) {
        App.Core.State.set("settings.offlineModeEnabled", _offlineModeEnabled);
      }

      // Execute action if handler exists
      if (_eventHandlers[action]) {
        _eventHandlers[action](_offlineModeEnabled);
      }

      // Trigger event for other modules
      if (App.Core.Events) {
        App.Core.Events.trigger("dynamicButton:action", {
          action: action,
          mode: _currentMode,
          isActive: _offlineModeEnabled,
        });
        
        // Also trigger specific offline mode event
        App.Core.Events.trigger("offlineMode:toggled", {
          enabled: _offlineModeEnabled
        });
      }

      return;
    }

    // Handle length labels toggle
    if (action === "toggleLengthLabels") {
      _lengthLabelsEnabled = !_lengthLabelsEnabled;
      
      // Update all instances of the length labels toggle button
      const toggleButtons = document.querySelectorAll(
        `.dynamic-button-secondary.length-labels-toggle, .dynamic-button-sub.length-labels-toggle`
      );
      toggleButtons.forEach((button) => {
        _updateToggleButtonState(button, _lengthLabelsEnabled);
        button.title = _lengthLabelsEnabled
          ? "Disable Length Labels"
          : "Enable Length Labels";
      });

      // Update state if available
      if (App.Core.State) {
        App.Core.State.set("settings.lengthLabelsEnabled", _lengthLabelsEnabled);
      }

      // Execute action if handler exists
      if (_eventHandlers[action]) {
        _eventHandlers[action](_lengthLabelsEnabled);
      }

      // Trigger event for other modules
      if (App.Core.Events) {
        App.Core.Events.trigger("dynamicButton:action", {
          action: action,
          mode: _currentMode,
          isActive: _lengthLabelsEnabled,
        });
        
        App.Core.Events.trigger("labels:lengthToggled", {
          enabled: _lengthLabelsEnabled
        });
      }

      return;
    }

    // Handle slope angle labels toggle
    if (action === "toggleSlopeAngleLabels") {
      _slopeAngleLabelsEnabled = !_slopeAngleLabelsEnabled;
      
      // Update all instances of the slope angle labels toggle button
      const toggleButtons = document.querySelectorAll(
        `.dynamic-button-secondary.slope-angle-toggle, .dynamic-button-sub.slope-angle-toggle`
      );
      toggleButtons.forEach((button) => {
        _updateToggleButtonState(button, _slopeAngleLabelsEnabled);
        button.title = _slopeAngleLabelsEnabled
          ? "Disable Slope Angle Labels"
          : "Enable Slope Angle Labels";
      });

      // Update state if available
      if (App.Core.State) {
        App.Core.State.set("settings.slopeAngleLabelsEnabled", _slopeAngleLabelsEnabled);
      }

      // Execute action if handler exists
      if (_eventHandlers[action]) {
        _eventHandlers[action](_slopeAngleLabelsEnabled);
      }

      // Trigger event for other modules
      if (App.Core.Events) {
        App.Core.Events.trigger("dynamicButton:action", {
          action: action,
          mode: _currentMode,
          isActive: _slopeAngleLabelsEnabled,
        });
        
        App.Core.Events.trigger("labels:slopeAngleToggled", {
          enabled: _slopeAngleLabelsEnabled
        });
      }

      return;
    }

    // Handle slope percent labels toggle
    if (action === "toggleSlopePercentLabels") {
      _slopePercentLabelsEnabled = !_slopePercentLabelsEnabled;
      
      // Update all instances of the slope percent labels toggle button
      const toggleButtons = document.querySelectorAll(
        `.dynamic-button-secondary.slope-percent-toggle, .dynamic-button-sub.slope-percent-toggle`
      );
      toggleButtons.forEach((button) => {
        _updateToggleButtonState(button, _slopePercentLabelsEnabled);
        button.title = _slopePercentLabelsEnabled
          ? "Disable Slope Percent Labels"
          : "Enable Slope Percent Labels";
      });

      // Update state if available
      if (App.Core.State) {
        App.Core.State.set("settings.slopePercentLabelsEnabled", _slopePercentLabelsEnabled);
      }

      // Execute action if handler exists
      if (_eventHandlers[action]) {
        _eventHandlers[action](_slopePercentLabelsEnabled);
      }

      // Trigger event for other modules
      if (App.Core.Events) {
        App.Core.Events.trigger("dynamicButton:action", {
          action: action,
          mode: _currentMode,
          isActive: _slopePercentLabelsEnabled,
        });
        
        App.Core.Events.trigger("labels:slopePercentToggled", {
          enabled: _slopePercentLabelsEnabled
        });
      }

      return;
    }

    // Execute action if handler exists
    if (_eventHandlers[action]) {
      _eventHandlers[action]();
    }

    // Trigger event for other modules
    if (App.Core.Events) {
      App.Core.Events.trigger("dynamicButton:action", {
        action: action,
        mode: _currentMode,
      });
    }
  }

  /**
   * Create the primary button
   * @private
   */
  function _createPrimaryButton() {
    _primaryButton = document.createElement("button");
    _primaryButton.className = "maplibregl-ctrl-icon dynamic-button-primary";
    _primaryButton.type = "button";

    // Apply styles (removed fixed width/height to allow CSS control)
    Object.assign(_primaryButton.style, {
      borderRadius: "15%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      border: "none",
      cursor: "pointer",
      boxShadow: "0 0 0 2px rgba(0,0,0,0.1)",
      position: "relative",
      zIndex: "2",
    });

    // Set initial content
    _updatePrimaryButton();

    // Add click handler
    _primaryButton.addEventListener("click", _toggleExpanded);

    return _primaryButton;
  }

  /**
   * Create a button with common styling
   * @private
   */
  function _createButton(config, index, isSubButton, level, parentIndex) {
    const button = document.createElement("button");
    button.className = `maplibregl-ctrl-icon dynamic-button-${
      isSubButton ? "sub" : "secondary"
    } ${config.className}`;
    button.type = "button";
    button.title = config.title;
    button.innerHTML = config.icon;

    // Apply styles (removed fixed width/height to allow CSS control)
    Object.assign(button.style, {
      borderRadius: "15%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      transition: "all 0.3s ease",
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      border: "none",
      cursor: "pointer",
      boxShadow: "0 0 0 2px rgba(0,0,0,0.1)",
      opacity: "0",
      visibility: "hidden",
      transform: "scale(0.5)",
      zIndex: "1",
      top: "0",
      left: "0",
    });

    // Apply initial toggle state if needed
    if (config.isToggle) {
      if (config.action === "toggleBasemapSelection") {
        _updateToggleButtonState(button, _basemapSelectionEnabled);
      } else if (config.action === "toggleMultiSelect") {
        _updateToggleButtonState(button, _multiSelectEnabled);
      } else if (config.action === "toggleTerrain") {
        _updateToggleButtonState(button, _terrainEnabled);
      } else if (config.action === "toggleOfflineMode") {
        _updateToggleButtonState(button, _offlineModeEnabled);
      } else if (config.action === "toggleLengthLabels") {
        _updateToggleButtonState(button, _lengthLabelsEnabled);
      } else if (config.action === "toggleSlopeAngleLabels") {
        _updateToggleButtonState(button, _slopeAngleLabelsEnabled);
      } else if (config.action === "toggleSlopePercentLabels") {
        _updateToggleButtonState(button, _slopePercentLabelsEnabled);
      }
    }

    // Add click handler
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("Button clicked:", config.action || "action not defined");

      if (config.hasSubButtons && config.subButtons) {
        // Toggle sub-buttons
        console.log("Button has sub-buttons, toggling:", config.action);
        _toggleSubButtons(config.action);
      } else {
        // Execute action
        _handleSecondaryClick(config.action);
      }
    });

    return button;
  }

  /**
   * Create secondary buttons
   * @private
   */
  function _createSecondaryButtons() {
    const config = _buttonConfigs[_currentMode].secondary;
    const spacing = _getDynamicSpacing(); // Dynamic spacing based on button size

    // Clear existing secondary buttons
    _secondaryButtons.forEach((btn) => btn.remove());
    _secondaryButtons = [];

    // Clear sub-buttons
    Object.values(_expandedSubButtons).forEach((buttons) => {
      buttons.forEach((btn) => btn.remove());
    });
    _expandedSubButtons = {};

    config.forEach((buttonConfig, index) => {
      const button = _createButton(buttonConfig, index, false, 1);
      _secondaryButtons.push(button);
      _container.appendChild(button);

      // Create sub-buttons if they exist
      if (buttonConfig.subButtons) {
        console.log("Creating sub-buttons for", buttonConfig.action, "- count:", buttonConfig.subButtons.length);
        
        buttonConfig.subButtons.forEach((subConfig, subIndex) => {
          const subButton = _createButton(subConfig, subIndex, true, 2, index);

          // Position sub-buttons
          let subButtonX, subButtonY;
          if (buttonConfig.action === 'labelsMenu') {
            // For labels, position sub-buttons directly below the parent button
            // The parent button is at position (index + 1) * spacing horizontally
            // Sub-buttons should be at the same X position but stacked vertically below
            subButtonX = (index + 1) * spacing;
            // Start below the primary button row (Y = spacing), then stack down
            subButtonY = spacing * (subIndex + 1);
          } else {
            // For other menus, position to the right and staggered down
            subButtonX = (index + 1) * spacing + spacing;
            subButtonY = (subIndex + 1) * spacing;
          }

          console.log("Sub-button", subIndex, "position:", subButtonX, subButtonY);

          // Store position in dataset - ensure values are strings
          subButton.dataset.x = String(subButtonX);
          subButton.dataset.y = String(subButtonY);
          subButton.dataset.parentIndex = String(index);
          subButton.dataset.subIndex = String(subIndex);
          
          // Also store the action for reference
          subButton.dataset.parentAction = buttonConfig.action;

          // Initially hidden
          subButton.style.visibility = "hidden";
          subButton.style.opacity = "0";
          subButton.style.transform = `translate(${subButtonX}px, ${subButtonY}px) scale(0.5)`;
          subButton.style.position = "absolute";
          subButton.style.top = "0";
          subButton.style.left = "0";

          _container.appendChild(subButton);

          if (!_expandedSubButtons[buttonConfig.action]) {
            _expandedSubButtons[buttonConfig.action] = [];
          }
          _expandedSubButtons[buttonConfig.action].push(subButton);
          
          console.log("Added sub-button to _expandedSubButtons[", buttonConfig.action, "] - total:", _expandedSubButtons[buttonConfig.action].length);

          // Create sub-sub-buttons if they exist
          if (subConfig.subButtons) {
            subConfig.subButtons.forEach((subSubConfig, subSubIndex) => {
              const subSubButton = _createButton(
                subSubConfig,
                subSubIndex,
                true,
                3,
                subIndex
              );

              // Sub-sub buttons expand to the right
              const subSubButtonX = (index + 1) * spacing + spacing;
              const subSubButtonY =
                (subIndex + 1) * spacing + subSubIndex * spacing;

              // Store position in dataset
              subSubButton.dataset.x = subSubButtonX;
              subSubButton.dataset.y = subSubButtonY;

              // Initially hidden
              subSubButton.style.visibility = "hidden";
              subSubButton.style.transform = `translate(${subSubButtonX}px, ${subSubButtonY}px) scale(0.5)`;

              _container.appendChild(subSubButton);

              if (!_expandedSubButtons[subConfig.action]) {
                _expandedSubButtons[subConfig.action] = [];
              }
              _expandedSubButtons[subConfig.action].push(subSubButton);
            });
          }
        });
      }
    });

    // Position buttons if already expanded
    if (_isExpanded) {
      _positionSecondaryButtons();
    }
  }

  /**
   * Add CSS styles
   * @private
   */
  function _addStyles() {
    // Check if styles are already added
    if (document.getElementById("dynamic-button-styles")) return;

    const style = document.createElement("style");
    style.id = "dynamic-button-styles";
    style.textContent = `
            .dynamic-button-control {
                transition: all 0.3s ease;
                position: relative;
                overflow: visible !important;
            }
            
            .dynamic-button-primary {
                transition: all 0.3s ease !important;
                width: 40px;
                height: 40px;
            }
            
            .dynamic-button-primary:hover {
                background-color: #f5f5f5 !important;
            }
            
            .dynamic-button-primary.active-mode {
                box-shadow: 0 0 0 2px #4682b4 !important;
            }
            
            .dynamic-button-secondary,
            .dynamic-button-sub {
                transition: all 0.3s ease !important;
                width: 40px;
                height: 40px;
                position: absolute !important;
                top: 0;
                left: 0;
            }
            
            .dynamic-button-secondary:hover,
            .dynamic-button-sub:hover {
                background-color: #f5f5f5 !important;
            }
            
            .dynamic-button-secondary.danger,
            .dynamic-button-sub.danger {
                color: #dc3545;
            }
            
            .dynamic-button-secondary.danger:hover,
            .dynamic-button-sub.danger:hover {
                background-color: #fff5f5 !important;
            }
            
            .dynamic-button-secondary.active-toggle,
            .dynamic-button-sub.active-toggle {
                background-color: #4682b4 !important;
                color: white !important;
                box-shadow: 0 0 0 2px #4682b4 !important;
            }
            
            .dynamic-button-secondary.active-toggle:hover,
            .dynamic-button-sub.active-toggle:hover {
                background-color: #5a9ad1 !important;
            }
            
            .dynamic-button-secondary.active-toggle svg,
            .dynamic-button-sub.active-toggle svg {
                stroke: white !important;
            }
            
            /* Mobile sizes handled by button-themes.css */
            
            /* Ensure MapLibre control groups don't clip our buttons */
            .maplibregl-ctrl-group {
                overflow: visible !important;
            }
            
            .maplibregl-ctrl {
                overflow: visible !important;
            }
        `;
    document.head.appendChild(style);
  }

  // Add styles when module loads
  _addStyles();

  // Public API
  return {
    /**
     * Initialize the dynamic button control
     * @param {Object} map - The MapLibre map instance
     */
    initialize: function (map) {
      _map = map;
      _buttonConfigs = _defaultModes;

      // Subscribe to state changes for basemap selection
      if (App.Core.State) {
        App.Core.State.subscribe(
          "settings.basemapSelectionEnabled",
          function (enabled) {
            // Update internal state
            _basemapSelectionEnabled = enabled;

            // Update all instances of the basemap toggle button
            const toggleButtons = document.querySelectorAll(
              `.dynamic-button-secondary.basemap-toggle, .dynamic-button-sub.basemap-toggle`
            );
            toggleButtons.forEach((button) => {
              _updateToggleButtonState(button, enabled);
              button.title = enabled
                ? "Disable Basemap Selection"
                : "Enable Basemap Selection";
            });
          }
        );

        // Subscribe to state changes for multi-select
        App.Core.State.subscribe(
          "settings.multiSelectEnabled",
          function (enabled) {
            // Update internal state
            _multiSelectEnabled = enabled;

            // Update all instances of the multi-select toggle button
            const toggleButtons = document.querySelectorAll(
              `.dynamic-button-secondary.multiselect-toggle, .dynamic-button-sub.multiselect-toggle`
            );
            toggleButtons.forEach((button) => {
              _updateToggleButtonState(button, enabled);
              button.title = enabled
                ? "Disable Multi-Select Mode"
                : "Enable Multi-Select Mode";
            });
          }
        );

        // Initialize from state if available
        const initialBasemapState = App.Core.State.get(
          "settings.basemapSelectionEnabled"
        );
        if (initialBasemapState !== undefined) {
          _basemapSelectionEnabled = initialBasemapState;
        }

        // Initialize multi-select state if available
        const initialMultiSelectState = App.Core.State.get(
          "settings.multiSelectEnabled"
        );
        if (initialMultiSelectState !== undefined) {
          _multiSelectEnabled = initialMultiSelectState;
        }

        // Subscribe to terrain state changes
        App.Core.State.subscribe(
          "settings.terrainEnabled",
          function (enabled) {
            // Update internal state
            _terrainEnabled = enabled;

            // Update all instances of the terrain toggle button
            const toggleButtons = document.querySelectorAll(
              `.dynamic-button-secondary.terrain-toggle, .dynamic-button-sub.terrain-toggle`
            );
            toggleButtons.forEach((button) => {
              _updateToggleButtonState(button, enabled);
              button.title = enabled
                ? "Disable 3D Terrain"
                : "Enable 3D Terrain";
            });
          }
        );

        // Initialize terrain state from Terrain module if available
        if (App.Map.Terrain && App.Map.Terrain.isTerrainEnabled) {
          _terrainEnabled = App.Map.Terrain.isTerrainEnabled();
        }

        // Subscribe to offline mode state changes
        App.Core.State.subscribe(
          "settings.offlineModeEnabled",
          function (enabled) {
            // Update internal state
            _offlineModeEnabled = enabled;

            // Update all instances of the offline toggle button
            const toggleButtons = document.querySelectorAll(
              `.dynamic-button-secondary.offline-toggle, .dynamic-button-sub.offline-toggle`
            );
            toggleButtons.forEach((button) => {
              _updateToggleButtonState(button, enabled);
              button.title = enabled
                ? "Disable Offline Mode"
                : "Enable Offline Mode";
            });
          }
        );

        // Initialize offline mode state if available
        const initialOfflineState = App.Core.State.get(
          "settings.offlineModeEnabled"
        );
        if (initialOfflineState !== undefined) {
          _offlineModeEnabled = initialOfflineState;
        }
      }
      
      // Subscribe to button size changes
      if (App.Core.Events) {
        App.Core.Events.on('buttonSize:changed', function() {
          // Recalculate positions if buttons are expanded
          if (_isExpanded) {
            _positionSecondaryButtons();
          }
        });

        // Subscribe to basemap changes to reset terrain
        App.Core.Events.on('basemap:changed', function() {
          // When basemap changes, terrain is automatically disabled
          if (_terrainEnabled) {
            _terrainEnabled = false;
            
            // Update all instances of the terrain toggle button
            const toggleButtons = document.querySelectorAll(
              `.dynamic-button-secondary.terrain-toggle, .dynamic-button-sub.terrain-toggle`
            );
            toggleButtons.forEach((button) => {
              _updateToggleButtonState(button, false);
              button.title = "Enable 3D Terrain";
            });

            // Update state if available
            if (App.Core.State) {
              App.Core.State.set("settings.terrainEnabled", false);
            }
          }
        });
      }

      console.log("Dynamic button initialized");
    },

    /**
     * Create the control and add it to the map
     * @returns {Object} The control object
     */
    createControl: function () {
      return {
        onAdd: function (map) {
          _container = document.createElement("div");
          _container.className = "maplibregl-ctrl dynamic-button-control";

          // Apply container styles
          Object.assign(_container.style, {
            position: "relative",
            margin: "20px 0 0 10px", // 50px below logo control
            overflow: "visible",
            zIndex: "1000",
          });

          // Create primary button
          _primaryButton = _createPrimaryButton();
          _container.appendChild(_primaryButton);

          // Create secondary buttons
          _createSecondaryButtons();

          return _container;
        },

        onRemove: function () {
          _container.parentNode.removeChild(_container);
          _map = null;
        },
      };
    },

    /**
     * Set the current mode
     * @param {string} mode - The mode to set
     */
    setMode: function (mode) {
      if (_buttonConfigs[mode]) {
        _currentMode = mode;
        _updatePrimaryButton();
        _createSecondaryButtons();

        // If expanded, reposition immediately
        if (_isExpanded) {
          _positionSecondaryButtons();
        }

        // Trigger event
        if (App.Core.Events) {
          App.Core.Events.trigger("dynamicButton:modeChanged", {
            mode: mode,
          });
        }
        
        // Fix TerraDraw position if in measure mode
        if (mode === 'measure') {
          setTimeout(() => {
            this.fixTerradrawPosition();
          }, 100);
        }
      }
    },

    /**
     * Register an action handler
     * @param {string} action - The action name
     * @param {Function} handler - The handler function
     */
    onAction: function (action, handler) {
      _eventHandlers[action] = handler;
    },

    /**
     * Add a custom mode configuration
     * @param {string} modeName - The mode name
     * @param {Object} config - The mode configuration
     */
    addMode: function (modeName, config) {
      _buttonConfigs[modeName] = config;
    },

    /**
     * Get the current mode
     * @returns {string} The current mode
     */
    getMode: function () {
      return _currentMode;
    },

    /**
     * Collapse the menu
     */
    collapse: function () {
      if (_isExpanded) {
        _toggleExpanded();
      }
    },

    /**
     * Get the basemap selection state
     * @returns {boolean} The current basemap selection state
     */
    getBasemapSelectionState: function () {
      return _basemapSelectionEnabled;
    },

    /**
     * Set the basemap selection state
     * @param {boolean} enabled - Whether basemap selection should be enabled
     */
    setBasemapSelectionState: function (enabled) {
      _basemapSelectionEnabled = enabled;

      // Update all instances of the basemap toggle button
      const toggleButtons = document.querySelectorAll(
        `.dynamic-button-secondary.basemap-toggle, .dynamic-button-sub.basemap-toggle`
      );
      toggleButtons.forEach((button) => {
        _updateToggleButtonState(button, _basemapSelectionEnabled);
        button.title = _basemapSelectionEnabled
          ? "Disable Basemap Selection"
          : "Enable Basemap Selection";
      });

      // Update state if available
      if (App.Core.State) {
        App.Core.State.set("settings.basemapSelectionEnabled", enabled);
      }

      // Trigger event
      if (App.Core.Events) {
        App.Core.Events.trigger("dynamicButton:basemapSelectionChanged", {
          isActive: _basemapSelectionEnabled,
        });
      }
    },

    /**
     * Get the multi-select state
     * @returns {boolean} The current multi-select state
     */
    getMultiSelectState: function () {
      return _multiSelectEnabled;
    },

    /**
     * Set the multi-select state
     * @param {boolean} enabled - Whether multi-select should be enabled
     */
    setMultiSelectState: function (enabled) {
      _multiSelectEnabled = enabled;

      // Update all instances of the multi-select toggle button
      const toggleButtons = document.querySelectorAll(
        `.dynamic-button-secondary.multiselect-toggle, .dynamic-button-sub.multiselect-toggle`
      );
      toggleButtons.forEach((button) => {
        _updateToggleButtonState(button, _multiSelectEnabled);
        button.title = _multiSelectEnabled
          ? "Disable Multi-Select Mode"
          : "Enable Multi-Select Mode";
      });

      // Update state if available
      if (App.Core.State) {
        App.Core.State.set("settings.multiSelectEnabled", enabled);
      }

      // Trigger event
      if (App.Core.Events) {
        App.Core.Events.trigger("dynamicButton:multiSelectChanged", {
          isActive: _multiSelectEnabled,
        });
      }
    },
    
    /**
     * Fix TerraDraw button positions to align with the second dynamic button
     */
    fixTerradrawPosition: function () {
      const groups = document.querySelectorAll('.maplibregl-ctrl-group');
      groups.forEach(group => {
        if (group.querySelector('.maplibregl-terradraw-add-control')) {
          if (_container && _primaryButton && _secondaryButtons.length > 0) {
            const secondButton = _secondaryButtons[0]; // First secondary button is the second button overall
            
            if (secondButton) {
              // Get the computed positions
              const secondButtonRect = secondButton.getBoundingClientRect();
              const containerRect = _container.getBoundingClientRect();
              
              // Calculate relative position within the container
              const relativeLeft = secondButtonRect.left - containerRect.left;
              const relativeTop = secondButtonRect.top - containerRect.top;
              
              // Position directly on the second button
              group.style.position = 'absolute';
              group.style.top = (containerRect.top - document.body.getBoundingClientRect().top + relativeTop) + 'px';
              group.style.left = (containerRect.left - document.body.getBoundingClientRect().left + relativeLeft) + 'px';
              group.style.marginTop = '0';
              group.style.marginLeft = '0';
              group.style.padding = '0';
              group.style.zIndex = '3';
            } else {
              // Fallback: Calculate based on primary button and spacing
              const spacing = _getDynamicSpacing();
              const containerRect = _container.getBoundingClientRect();
              
              group.style.position = 'absolute';
              group.style.top = (containerRect.top - document.body.getBoundingClientRect().top) + 'px';
              group.style.left = (containerRect.left - document.body.getBoundingClientRect().left + spacing) + 'px';
              group.style.marginTop = '0';
              group.style.marginLeft = '0';
              group.style.padding = '0';
              group.style.zIndex = '3';
            }
          } else {
            // Fallback to fixed position if dynamic button not found
            group.style.position = 'absolute';
            group.style.top = '70px';
            group.style.left = '55px';
            group.style.marginTop = '0';
            group.style.marginLeft = '0';
            group.style.padding = '0';
            group.style.zIndex = '3';
          }
        }
      });
    },
    
    /**
     * Get dynamic button spacing
     * @returns {number} The current spacing between buttons
     */
    getSpacing: function () {
      return _getDynamicSpacing();
    },
    
    /**
     * Get button container element
     * @returns {HTMLElement} The container element
     */
    getContainer: function () {
      return _container;
    },
    
    /**
     * Get secondary buttons
     * @returns {Array} Array of secondary button elements
     */
    getSecondaryButtons: function () {
      return _secondaryButtons;
    },

    /**
     * Get the terrain state
     * @returns {boolean} The current terrain state
     */
    getTerrainState: function () {
      return _terrainEnabled;
    },

    /**
     * Set the terrain state
     * @param {boolean} enabled - Whether terrain should be enabled
     */
    setTerrainState: function (enabled) {
      _terrainEnabled = enabled;

      // Update all instances of the terrain toggle button
      const toggleButtons = document.querySelectorAll(
        `.dynamic-button-secondary.terrain-toggle, .dynamic-button-sub.terrain-toggle`
      );
      toggleButtons.forEach((button) => {
        _updateToggleButtonState(button, _terrainEnabled);
        button.title = _terrainEnabled
          ? "Disable 3D Terrain"
          : "Enable 3D Terrain";
      });

      // Update state if available
      if (App.Core.State) {
        App.Core.State.set("settings.terrainEnabled", enabled);
      }

      // Actually toggle terrain if module is available
      if (App.Map.Terrain) {
        if (enabled && !App.Map.Terrain.isTerrainEnabled()) {
          App.Map.Terrain.enableTerrain();
        } else if (!enabled && App.Map.Terrain.isTerrainEnabled()) {
          App.Map.Terrain.disableTerrain();
        }
      }

      // Trigger event
      if (App.Core.Events) {
        App.Core.Events.trigger("dynamicButton:terrainChanged", {
          isActive: _terrainEnabled,
        });
      }
    },

    /**
     * Get the offline mode state
     * @returns {boolean} The current offline mode state
     */
    getOfflineModeState: function () {
      return _offlineModeEnabled;
    },

    /**
     * Set the offline mode state
     * @param {boolean} enabled - Whether offline mode should be enabled
     */
    setOfflineModeState: function (enabled) {
      _offlineModeEnabled = enabled;

      // Update all instances of the offline toggle button
      const toggleButtons = document.querySelectorAll(
        `.dynamic-button-secondary.offline-toggle, .dynamic-button-sub.offline-toggle`
      );
      toggleButtons.forEach((button) => {
        _updateToggleButtonState(button, _offlineModeEnabled);
        button.title = _offlineModeEnabled
          ? "Disable Offline Mode"
          : "Enable Offline Mode";
      });

      // Update state if available
      if (App.Core.State) {
        App.Core.State.set("settings.offlineModeEnabled", enabled);
      }

      // Trigger events
      if (App.Core.Events) {
        App.Core.Events.trigger("dynamicButton:offlineModeChanged", {
          isActive: _offlineModeEnabled,
        });
        
        App.Core.Events.trigger("offlineMode:toggled", {
          enabled: _offlineModeEnabled
        });
      }
    },
  };
})();

console.log(
  "app.ui.dynamicbutton.js loaded - App.UI.DynamicButton module created"
);

// Global function for TerraDraw position fixing (backward compatibility)
window.fixPosition = function() {
  if (App.UI.DynamicButton && App.UI.DynamicButton.fixTerradrawPosition) {
    App.UI.DynamicButton.fixTerradrawPosition();
  }
};

// Set up event listeners for dynamic updates
if (App.Core.Events) {
  // Listen for button size changes
  App.Core.Events.on('buttonSize:changed', () => {
    setTimeout(() => {
      if (App.UI.DynamicButton && App.UI.DynamicButton.fixTerradrawPosition) {
        App.UI.DynamicButton.fixTerradrawPosition();
      }
    }, 100);
  });
  
  // Listen for measurement start
  App.Core.Events.on('measure:started', () => {
    setTimeout(() => {
      if (App.UI.DynamicButton && App.UI.DynamicButton.fixTerradrawPosition) {
        App.UI.DynamicButton.fixTerradrawPosition();
      }
    }, 100);
  });
  
  // Listen for dynamic button actions
  App.Core.Events.on('dynamicButton:action', () => {
    setTimeout(() => {
      if (App.UI.DynamicButton && App.UI.DynamicButton.fixTerradrawPosition) {
        App.UI.DynamicButton.fixTerradrawPosition();
      }
    }, 100);
  });
}
