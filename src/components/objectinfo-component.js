/**
 * Object Info Component - Fixed version
 * 
 * A web component that displays detailed information about geographic features
 * or objects. This component provides a structured view with a styled header
 * and content sections.
 */
// object-info-component-fixed.js

const ObjectInfoStyles = `
<style>
    :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        font-family: Roboto, system-ui, -apple-system, sans-serif;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
    }

    .header {
        background: #4682b4;
        color: white;
        padding: 0;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        width: 100%;
        box-sizing: border-box;
        flex-shrink: 0;
    }

    .header-content {
        padding: 8px 16px;
    }

    .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
    }

    .header-title {
        font-size: 1rem;
        font-weight: 500;
        margin: 0;
    }

    .feature-type-badge {
        background: rgba(255, 255, 255, 0.2);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
    }

    .feature-id {
        font-size: 0.75rem;
        opacity: 0.9;
        margin-bottom: 4px;
    }

    .feature-name {
        font-size: 1.25rem;
        font-weight: 500;
        margin: 0 0 4px 0;
    }

    .field-note {
        font-size: 0.875rem;
        font-style: italic;
        opacity: 0.9;
    }

    .scrollable-content {
        flex: 1;
        overflow-y: auto;
        padding: 0 16px 16px;
        box-sizing: border-box;
        min-height: 0;
    }

    .section {
        margin-bottom: 16px;
        border-radius: 4px;
        border: 1px solid #e0e0e0;
        overflow: hidden;
    }

    .section-header {
        display: flex;
        align-items: center;
        padding: 12px;
        background: #f5f5f5;
        cursor: pointer;
        user-select: none;
    }

    .section-header:hover {
        background: #eeeeee;
    }

    .section-icon {
        margin-right: 8px;
        color: #666;
    }

    .section-title {
        flex: 1;
        font-weight: 500;
        color: #333;
        margin: 0;
    }

    .chevron {
        transition: transform 0.2s ease;
        color: #666;
    }

    .chevron.collapsed {
        transform: rotate(-90deg);
    }

    .section-content {
        padding: 12px;
        background: white;
    }

    .section-content.collapsed {
        display: none;
    }

    .data-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid #f0f0f0;
        font-size: 0.875rem;
    }

    .data-row:last-child {
        border-bottom: none;
    }

    .data-label {
        color: #666;
    }

    .data-value {
        font-weight: 500;
        color: #333;
        text-align: right;
    }

    .actions {
        flex-shrink: 0;
        padding: 12px 16px;
        background: #f9f9f9;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        gap: 8px;
        box-sizing: border-box;
    }

    .edit-button, .close-button {
        flex: 1;
    }

    .svg-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .photos-container {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .photo-item {
        width: 80px;
        height: 60px;
        border-radius: 4px;
        overflow: hidden;
        border: 1px solid #e0e0e0;
    }

    .photo-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .subsection {
        margin-top: 12px;
    }

    .subsection h4 {
        margin: 0 0 8px 0;
        font-size: 0.875rem;
        font-weight: 500;
        color: #555;
    }

    .linked-feature {
        display: flex;
        align-items: center;
        padding: 8px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        margin-bottom: 8px;
    }

    .linked-feature:last-child {
        margin-bottom: 0;
    }

    .linked-feature-icon {
        margin-right: 8px;
        color: #666;
    }

    .linked-feature-details {
        flex: 1;
    }

    .address-text {
        font-size: 0.875rem;
        line-height: 1.5;
    }
</style>
`;

class ObjectInfo extends HTMLElement {
  constructor() {
    console.log("🔧 ObjectInfo: Constructor called");
    super();
    this.attachShadow({ mode: "open" });
    this.currentFeature = null;

    // Default labels for i18n
    this.labels = {
      title: "Feature Info",
      noFeature: "No feature selected",
      location: "Location",
      attributes: "Feature Attributes",
      objectInfo: "Object Info",
      creationInfo: "Creation Info",
      photos: "Photos",
      address: "Address",
      edit: "Edit",
      close: "Close",
      creationTime: "Creation Time",
      creationUser: "User",
      changeTime: "Change Date/Time",
      changeUser: "Change User",
      metaInfo: "Meta Info",
      device: "Device",
      gnss: "GNSS",
      locator: "Locator",
      linkedFeatures: "Linked Features",
    };

    // SVG icons
    this.svgIcons = {
      chevronDown: `<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
      </svg>`,
      geoAlt: `<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
          <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
      </svg>`,
      tag: `<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z"/>
          <path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1zm0 5.586l7 7L13.586 9l-7-7H2v4.586z"/>
      </svg>`,
      infoCircle: `<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
      </svg>`,
      clock: `<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
      </svg>`,
      image: `<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
          <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
      </svg>`,
      pencil: `<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
      </svg>`,
      file: `<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3zM4.5 6.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zM4 8.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4z"/>
      </svg>`,
      link: `<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
          <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
      </svg>`,
      pin: `<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
          <path d="M8 4a.5.5 0 0 1 .5.5V6H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V7H6a.5.5 0 0 1 0-1h1.5V4.5A.5.5 0 0 1 8 4z"/>
      </svg>`,
      x: `<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
      </svg>`,
    };
  }

  connectedCallback() {
    console.log("🔧 ObjectInfo: connectedCallback called");
    try {
      this.render();
      console.log("✅ ObjectInfo: render() completed");
      
      this.setupEventListeners();
      console.log("✅ ObjectInfo: setupEventListeners() completed");

      // Add single event listener for all section headers using event delegation
      this.shadowRoot.addEventListener("click", (e) => {
        const sectionHeader = e.target.closest(".section-header");
        if (sectionHeader) {
          const section = sectionHeader.parentElement;
          const content = section.querySelector(".section-content");
          const chevron = sectionHeader.querySelector(".chevron");

          if (content && chevron) {
            content.classList.toggle("collapsed");
            chevron.classList.toggle("collapsed");
          }
        }
      });
      console.log("✅ ObjectInfo: Event delegation setup completed");
      
      // Display "No feature selected" message instead of example data
      this.clearFeature();
    } catch (error) {
      console.error("❌ ObjectInfo: Error in connectedCallback:", error);
      console.error("Stack trace:", error.stack);
    }
  }

  render() {
    const html = `
      ${ObjectInfoStyles}
      <div class="header">
        <div class="header-content">
          <div class="header-top">
            <h2 class="header-title">${this.labels.title}</h2>
            <div class="feature-type-badge" id="feature-type-badge">Point</div>
          </div>
          <div class="feature-id" id="feature-id"></div>
          <h3 class="feature-name" id="feature-name"></h3>
          <div class="field-note" id="field-note"></div>
        </div>
      </div>

      <div class="scrollable-content">
        <div class="content" id="content">
          <p style="padding: 16px; text-align: center; color: #666;">Loading...</p>
        </div>
      </div>

      <div class="actions">
        <sl-button variant="default" class="select-similar-button" id="select-similar-button">
          <div slot="prefix" class="svg-icon">${this.svgIcons.link}</div>
          Select Similar
        </sl-button>
        <sl-button variant="primary" class="edit-button" id="edit-button">
          <div slot="prefix" class="svg-icon">${this.svgIcons.pencil}</div>
          ${this.labels.edit}
        </sl-button>
        <sl-button variant="primary" class="close-button" id="close-button">
          <div slot="prefix" class="svg-icon">${this.svgIcons.x}</div>
          ${this.labels.close}
        </sl-button>
      </div>
    `;

    this.shadowRoot.innerHTML = html;
  }

  setupEventListeners() {
    const editButton = this.shadowRoot.getElementById("edit-button");
    if (editButton) {
      editButton.addEventListener("click", () => this.handleEdit());
    }

    const closeButton = this.shadowRoot.getElementById("close-button");
    if (closeButton) {
      closeButton.addEventListener("click", () => this.handleClose());
    }

    const selectSimilarButton = this.shadowRoot.getElementById("select-similar-button");
    if (selectSimilarButton) {
      selectSimilarButton.addEventListener("click", () => this.handleSelectSimilar());
    }
  }

  createSection(id, title, iconName, expanded = true) {
    const section = document.createElement("div");
    section.className = "section";

    const iconSvg = this.svgIcons[iconName] || this.svgIcons.tag;

    const header = document.createElement("div");
    header.className = "section-header";
    header.innerHTML = `
      <div class="section-icon svg-icon">${iconSvg}</div>
      <span class="section-title">${title}</span>
      <div class="chevron ${expanded ? "" : "collapsed"} svg-icon">${
      this.svgIcons.chevronDown
    }</div>
    `;

    const content = document.createElement("div");
    content.className = `section-content ${expanded ? "" : "collapsed"}`;
    content.id = `${id}-content`;

    // No individual event listener here - handled by event delegation

    section.appendChild(header);
    section.appendChild(content);

    return { section, content };
  }

  addDataRow(container, label, value) {
    const row = document.createElement("div");
    row.className = "data-row";
    row.innerHTML = `
      <div class="data-label">${label}</div>
      <div class="data-value">${value}</div>
    `;
    container.appendChild(row);
  }

  createSubsection(title) {
    const subsection = document.createElement("div");
    subsection.className = "subsection";

    const header = document.createElement("h4");
    header.textContent = title;
    subsection.appendChild(header);

    return subsection;
  }

  displayFeature(featureData) {
    console.log("🔍 displayFeature called");
    const content = this.shadowRoot.getElementById("content");
    if (!content) {
      console.error("❌ Content element not found in shadow DOM");
      return;
    }

    // Store the current feature
    this.currentFeature = featureData;

    // Clear content
    content.innerHTML = "";

    // Check if this is a GeoObject with full data
    if (featureData.properties && featureData.properties._geoObjectData) {
      // This has full GeoObject data, use the dedicated method
      this.displayGeoObjectData(featureData.properties._geoObjectData);
      return;
    }

    // Update header - handle different data structures
    const featureId = this.shadowRoot.getElementById("feature-id");
    const featureName = this.shadowRoot.getElementById("feature-name");
    const fieldNote = this.shadowRoot.getElementById("field-note");
    const featureTypeBadge =
      this.shadowRoot.getElementById("feature-type-badge");

    // Extract ID from various possible locations
    const id =
      featureData.id ||
      featureData.properties?.id ||
      featureData.properties?.ID ||
      null;
    if (id && featureId) featureId.textContent = `ID: ${id}`;

    // Extract name from various possible locations
    const name =
      featureData.name ||
      featureData.properties?.name ||
      featureData.properties?.NAME ||
      featureData.properties?.eigent1 ||
      featureData.properties?.title ||
      featureData.properties?.label ||
      "Unnamed Feature";
    if (featureName) featureName.textContent = name;

    // Extract description
    const description =
      featureData.description ||
      featureData.properties?.description ||
      featureData.properties?.DESCRIPTION ||
      "";
    if (fieldNote) fieldNote.textContent = description;

    // Extract feature type
    const type = featureData.type || featureData.geometry?.type || "Unknown";
    if (featureTypeBadge) featureTypeBadge.textContent = type;

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    // Handle GeoJSON feature structure
    if (featureData.geometry && featureData.properties) {
      // This is likely a GeoJSON feature

      // Location section from geometry
      if (featureData.geometry.coordinates) {
        const { section: locationSection, content: locationContent } =
          this.createSection("location", this.labels.location, "geoAlt");
        fragment.appendChild(locationSection);

        if (featureData.geometry.type === "Point") {
          const [lng, lat, alt] = featureData.geometry.coordinates;
          this.addDataRow(locationContent, "Longitude", lng.toFixed(7) + "°");
          this.addDataRow(locationContent, "Latitude", lat.toFixed(7) + "°");
          if (alt !== undefined) {
            this.addDataRow(
              locationContent,
              "Altitude",
              alt.toFixed(2) + " m"
            );
          }
        }
      }

      // Properties section
      if (Object.keys(featureData.properties).length > 0) {
        const { section: attributesSection, content: attributesContent } =
          this.createSection("attributes", this.labels.attributes, "tag");
        fragment.appendChild(attributesSection);

        Object.entries(featureData.properties).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            this.addDataRow(attributesContent, key, value);
          }
        });
      }
    } else {
      // Handle the structure from the sample data

      // Location section
      if (featureData.location) {
        const { section: locationSection, content: locationContent } =
          this.createSection("location", this.labels.location, "geoAlt");
        fragment.appendChild(locationSection);

        Object.entries(featureData.location).forEach(([key, value]) => {
          this.addDataRow(locationContent, key, value);
        });
      }

      // Feature Attributes section
      if (featureData.attributes) {
        const { section: attributesSection, content: attributesContent } =
          this.createSection("attributes", this.labels.attributes, "tag");
        fragment.appendChild(attributesSection);

        Object.entries(featureData.attributes).forEach(([key, value]) => {
          this.addDataRow(attributesContent, key, value);
        });
      }

      // Other sections (simplified for performance)...
      // Only create sections that actually have data
      if (featureData.objectInfo) {
        const { section: objectInfoSection, content: objectInfoContent } =
          this.createSection(
            "objectInfo",
            this.labels.objectInfo,
            "infoCircle"
          );
        fragment.appendChild(objectInfoSection);

        Object.entries(featureData.objectInfo).forEach(([key, value]) => {
          this.addDataRow(objectInfoContent, key, value);
        });
      }

      if (featureData.creationInfo) {
        const { section: creationInfoSection, content: creationInfoContent } =
          this.createSection(
            "creationInfo",
            this.labels.creationInfo,
            "clock"
          );
        fragment.appendChild(creationInfoSection);

        Object.entries(featureData.creationInfo).forEach(([key, value]) => {
          this.addDataRow(creationInfoContent, key, value);
        });
      }
    }

    // Append all sections at once
    content.appendChild(fragment);

    // If no sections were added, show a message
    if (content.children.length === 0) {
      const noDataMessage = document.createElement("div");
      noDataMessage.style.padding = "16px";
      noDataMessage.style.textAlign = "center";
      noDataMessage.style.color = "#666";
      noDataMessage.textContent =
        "No additional feature information available";
      content.appendChild(noDataMessage);
    }

    this.currentFeature = featureData;
  }

  displayExampleData() {
    const exampleData = {
      id: "FT-2025-03-28-001",
      name: "Water Valve #42",
      description: "Newly installed valve, needs inspection in 6 months",
      type: "Point",
      location: {
        Longitude: "-122.4194456",
        Latitude: "37.7749456",
        Altitude: "42.32 m",
        X: "551234.23",
        Y: "4179456.78",
        Z: "18.30",
        "Recording Mode": "RTK Fixed",
        Accuracy: "±0.012 m",
        "Pole Height": "2.0 m",
        Depth: "1.2 m",
      },
      attributes: {
        Diameter: "200 mm",
        Material: "Ductile Iron",
        Pressure: "16 bar",
        Manufacturer: "WaterTech Inc.",
        "Install Date": "2025-02-15",
      },
      objectInfo: {
        "Line Length": "N/A",
        Area: "N/A",
        "Node Count": "N/A",
      },
      creationInfo: {
        "Creation Time": "2025-03-28 09:45:22",
        User: "John Smith",
        "Change Date/Time": "2025-03-28 10:12:15",
        "Change User": "John Smith",
      },
      photos: [
        { url: null }, // This will show a skeleton
        { url: "/api/placeholder/80/60", thumbnail: "/api/placeholder/80/60" },
      ],
      metaInfo: {
        device: {
          "Device Name": "Field Tablet FT-12",
          Model: "Rugged Pro X5",
        },
        gnss: {
          "Device Type": "Trimble R12i",
          Accuracy: "0.008 m + 0.5 ppm",
        },
        locator: {
          "Locator Type": "Radio Detection RD8100",
          "Serial Number": "RD-21-45678",
        },
      },
      linkedFeatures: [
        {
          name: "Water Main Pipe",
          id: "FT-2025-03-27-005",
        },
      ],
      address: "123 Main Street, San Francisco, CA 94103",
    };

    this.displayFeature(exampleData);
  }

  // Public API methods
  setFeature(featureData) {
    try {
      console.log("📥 setFeature called with:", featureData);
      this.displayFeature(featureData);
    } catch (error) {
      console.error("❌ Error in setFeature:", error);

      // Display error message
      const content = this.shadowRoot.getElementById("content");
      if (content) {
        content.innerHTML = `
          <div style="padding: 16px; color: #d32f2f; text-align: center;">
            <p>Error displaying feature information</p>
            <p style="font-size: 0.8em;">Check console for details</p>
          </div>
        `;
      }
    }
  }

  /**
   * Display complete GeoObject data from Java
   * @param {Object} geoObjectData - Complete GeoObject data
   */
  setGeoObjectData(geoObjectData) {
    try {
      console.log("📥 setGeoObjectData called with:", geoObjectData);
      this.displayGeoObjectData(geoObjectData);
    } catch (error) {
      console.error("❌ Error in setGeoObjectData:", error);
      this.displayError();
    }
  }

  clearFeature() {
    this.currentFeature = null;
    const content = this.shadowRoot.getElementById("content");
    if (content) {
      content.innerHTML =
        '<p style="padding: 16px; text-align: center;">' +
        this.labels.noFeature +
        "</p>";
    }
  }
  
  /**
   * Show loading state
   */
  showLoading() {
    const content = this.shadowRoot.getElementById("content");
    if (content) {
      content.innerHTML =
        '<p style="padding: 16px; text-align: center;">' +
        '<sl-spinner style="font-size: 2rem;"></sl-spinner><br>' +
        'Loading object details...' +
        '</p>';
    }
    
    // Clear header
    const featureId = this.shadowRoot.getElementById("feature-id");
    const featureName = this.shadowRoot.getElementById("feature-name");
    const fieldNote = this.shadowRoot.getElementById("field-note");
    const featureTypeBadge = this.shadowRoot.getElementById("feature-type-badge");
    
    if (featureId) featureId.textContent = "";
    if (featureName) featureName.textContent = "Loading...";
    if (fieldNote) fieldNote.textContent = "";
    if (featureTypeBadge) featureTypeBadge.textContent = "";
  }

  /**
   * Display complete GeoObject data
   * @param {Object} geoObjectData - Complete GeoObject data from Java
   */
  displayGeoObjectData(geoObjectData) {
    console.log("🔍 displayGeoObjectData called");
    const content = this.shadowRoot.getElementById("content");
    if (!content) {
      console.error("❌ Content element not found in shadow DOM");
      return;
    }

    // Store the current data
    this.currentGeoObjectData = geoObjectData;
    this.currentFeature = geoObjectData; // For compatibility

    // Clear content
    content.innerHTML = "";

    // Update header with basic info
    if (geoObjectData.basicInfo) {
      this.updateGeoObjectHeader(geoObjectData.basicInfo, geoObjectData.category);
    }

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    // 1. Location/Position section
    if (geoObjectData.position) {
      const { section: locationSection, content: locationContent } =
        this.createSection("location", this.labels.location, "geoAlt");
      fragment.appendChild(locationSection);

      // Display coordinates based on what's available
      if (geoObjectData.position.longitude) {
        this.addDataRow(locationContent, "Longitude", geoObjectData.position.longitude);
      }
      if (geoObjectData.position.latitude) {
        this.addDataRow(locationContent, "Latitude", geoObjectData.position.latitude);
      }
      if (geoObjectData.position.altitude) {
        this.addDataRow(locationContent, "Altitude", geoObjectData.position.altitude);
      }
      if (geoObjectData.position.x) {
        this.addDataRow(locationContent, "X", geoObjectData.position.x);
        this.addDataRow(locationContent, "Y", geoObjectData.position.y);
      }
      if (geoObjectData.position.z) {
        this.addDataRow(locationContent, "Z", geoObjectData.position.z);
      }
      
      // Recording metadata
      if (geoObjectData.position.recordingMode) {
        this.addDataRow(locationContent, "Recording Mode", geoObjectData.position.recordingMode);
      }
      if (geoObjectData.position.accuracy) {
        this.addDataRow(locationContent, "Accuracy", geoObjectData.position.accuracy);
      }
      if (geoObjectData.position.antennaHeight) {
        this.addDataRow(locationContent, "Antenna Height", geoObjectData.position.antennaHeight);
      }
      if (geoObjectData.position.depth) {
        this.addDataRow(locationContent, "Depth", geoObjectData.position.depth);
      }
    }

    // 2. Category-specific attributes
    if (geoObjectData.attributes && geoObjectData.attributes.length > 0) {
      const { section: attributesSection, content: attributesContent } =
        this.createSection("attributes", this.labels.attributes, "tag");
      fragment.appendChild(attributesSection);

      geoObjectData.attributes.forEach(attr => {
        if (attr.value) {
          this.addDataRow(attributesContent, attr.name || attr.id, attr.value);
        }
        
        // Handle group attributes
        if (attr.isGroup && attr.groupAttributes) {
          attr.groupAttributes.forEach(groupAttr => {
            if (groupAttr.value) {
              this.addDataRow(attributesContent, "  • " + (groupAttr.name || groupAttr.id), groupAttr.value);
            }
          });
        }
      });
    }

    // 3. Measurements section
    if (geoObjectData.measurements) {
      const hasData = Object.values(geoObjectData.measurements).some(v => v && v !== "N/A");
      if (hasData) {
        const { section: measureSection, content: measureContent } =
          this.createSection("measurements", this.labels.objectInfo, "infoCircle");
        fragment.appendChild(measureSection);

        if (geoObjectData.measurements.length) {
          this.addDataRow(measureContent, "Line Length", geoObjectData.measurements.length);
        }
        if (geoObjectData.measurements.area) {
          this.addDataRow(measureContent, "Area", geoObjectData.measurements.area);
        }
        if (geoObjectData.measurements.distance) {
          this.addDataRow(measureContent, "Distance", geoObjectData.measurements.distance);
        }
      }
    }

    // 4. Creation/Modification info
    if (geoObjectData.creationInfo) {
      const { section: creationSection, content: creationContent } =
        this.createSection("creationInfo", this.labels.creationInfo, "clock");
      fragment.appendChild(creationSection);

      if (geoObjectData.creationInfo.createdDate) {
        this.addDataRow(creationContent, this.labels.creationTime, geoObjectData.creationInfo.createdDate);
      }
      if (geoObjectData.creationInfo.createdBy) {
        this.addDataRow(creationContent, this.labels.creationUser, geoObjectData.creationInfo.createdBy);
      }
      if (geoObjectData.creationInfo.modifiedDate) {
        this.addDataRow(creationContent, this.labels.changeTime, geoObjectData.creationInfo.modifiedDate);
      }
      if (geoObjectData.creationInfo.modifiedBy) {
        this.addDataRow(creationContent, this.labels.changeUser, geoObjectData.creationInfo.modifiedBy);
      }
    }

    // 5. Sensor metadata
    if (geoObjectData.sensorData) {
      const { section: sensorSection, content: sensorContent } =
        this.createSection("sensorData", this.labels.metaInfo, "file");
      fragment.appendChild(sensorSection);

      // Display each sensor type
      if (geoObjectData.sensorData.smartphone) {
        this.addSensorSubsection(sensorContent, this.labels.device, geoObjectData.sensorData.smartphone);
      }
      if (geoObjectData.sensorData.rover) {
        this.addSensorSubsection(sensorContent, this.labels.gnss, geoObjectData.sensorData.rover);
      }
      if (geoObjectData.sensorData.locator) {
        this.addSensorSubsection(sensorContent, this.labels.locator, geoObjectData.sensorData.locator);
      }
    }

    // 6. Address section
    if (geoObjectData.address) {
      const { section: addressSection, content: addressContent } =
        this.createSection("address", this.labels.address, "pin");
      fragment.appendChild(addressSection);

      const addressText = geoObjectData.address.fullAddress || 
        [geoObjectData.address.street, geoObjectData.address.houseNumber, 
         geoObjectData.address.city, geoObjectData.address.postalCode, 
         geoObjectData.address.country].filter(Boolean).join(", ");
      
      const addressDiv = document.createElement("div");
      addressDiv.className = "address-text";
      addressDiv.textContent = addressText;
      addressContent.appendChild(addressDiv);
    }

    // 7. Parent/Linked features
    if (geoObjectData.parentFeature) {
      const { section: linkedSection, content: linkedContent } =
        this.createSection("linkedFeatures", this.labels.linkedFeatures, "link");
      fragment.appendChild(linkedSection);

      const linkedFeature = document.createElement("div");
      linkedFeature.className = "linked-feature";
      linkedFeature.innerHTML = `
        <div class="linked-feature-icon svg-icon">${this.svgIcons.link}</div>
        <div class="linked-feature-details">
          <div class="feature-name">${geoObjectData.parentFeature.name || geoObjectData.parentFeature.id}</div>
          <div style="font-size: 0.75rem; color: #666;">${geoObjectData.parentFeature.categoryName || geoObjectData.parentFeature.type}</div>
        </div>
      `;
      linkedContent.appendChild(linkedFeature);
    }

    // Append all sections at once
    content.appendChild(fragment);
  }

  /**
   * Update header for GeoObject data
   */
  updateGeoObjectHeader(basicInfo, category) {
    const featureId = this.shadowRoot.getElementById("feature-id");
    const featureName = this.shadowRoot.getElementById("feature-name");
    const fieldNote = this.shadowRoot.getElementById("field-note");
    const featureTypeBadge = this.shadowRoot.getElementById("feature-type-badge");

    if (featureId && basicInfo.id) {
      featureId.textContent = `ID: ${basicInfo.id}`;
    }
    if (featureName && basicInfo.name) {
      featureName.textContent = basicInfo.name;
    }
    if (fieldNote && basicInfo.description) {
      fieldNote.textContent = basicInfo.description;
    }
    if (featureTypeBadge) {
      if (category && category.name) {
        featureTypeBadge.textContent = category.name;
      } else if (basicInfo.type) {
        featureTypeBadge.textContent = basicInfo.type;
      }
    }
  }

  /**
   * Add sensor subsection
   */
  addSensorSubsection(container, title, sensorRecords) {
    if (!sensorRecords || sensorRecords.length === 0) return;

    const subsection = this.createSubsection(title);
    
    // Display the most recent sensor record
    const latestRecord = sensorRecords[sensorRecords.length - 1];
    if (latestRecord.data) {
      try {
        const data = typeof latestRecord.data === 'string' ? 
          JSON.parse(latestRecord.data) : latestRecord.data;
        
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            this.addDataRow(subsection, this.formatSensorKey(key), value);
          }
        });
      } catch (e) {
        // If data is not JSON, display as is
        this.addDataRow(subsection, "Data", latestRecord.data);
      }
    }
    
    container.appendChild(subsection);
  }

  /**
   * Format sensor data keys for display
   */
  formatSensorKey(key) {
    // Convert camelCase or snake_case to readable format
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  /**
   * Display error message
   */
  displayError() {
    const content = this.shadowRoot.getElementById("content");
    if (content) {
      content.innerHTML = `
        <div style="padding: 16px; color: #d32f2f; text-align: center;">
          <p>Error displaying feature information</p>
          <p style="font-size: 0.8em;">Check console for details</p>
        </div>
      `;
    }
  }

  handleEdit() {
    console.log("Edit button clicked for feature:", this.currentFeature);
    // Trigger edit event
    this.dispatchEvent(new CustomEvent('feature-edit', {
      detail: { feature: this.currentFeature },
      bubbles: true,
      composed: true
    }));
  }

  handleClose() {
    console.log("Close button clicked");
    // Hide the drawer/panel
    const drawer = this.closest('sl-drawer');
    if (drawer) {
      drawer.hide();

      // Also adjust map width
      const map = document.getElementById("map");
      if (map) {
        map.classList.remove("drawer-open");
      }
    }

    // Dispatch event for any additional handling
    this.dispatchEvent(
      new CustomEvent("feature:close", {
        detail: { feature: this.currentFeature },
        bubbles: true,
        composed: true,
      })
    );
  }

  handleSelectSimilar() {
    console.log("Select similar button clicked for feature:", this.currentFeature);
    
    if (!this.currentFeature) {
      console.warn("No feature currently selected");
      return;
    }

    // Call the map events API to select similar features
    if (window.App && window.App.Map && window.App.Map.Events) {
      const selectedFeatures = window.App.Map.Events.selectSimilarFeatures(
        this.currentFeature,
        'eigent1', // Using eigent1 as the default attribute
        true // Add to existing selection
      );
      
      console.log(`Selected ${selectedFeatures.length} similar features`);
      
      // Show notification
      if (selectedFeatures.length > 0) {
        this.showNotification(`Selected ${selectedFeatures.length} similar features`);
      } else {
        this.showNotification('No similar features found in current view', 'warning');
      }
    } else {
      console.error("Map Events API not available");
    }
  }

  showNotification(message, variant = 'success') {
    // Create a temporary notification element
    const notification = document.createElement('sl-alert');
    notification.variant = variant;
    notification.closable = true;
    notification.duration = 3000;
    notification.innerHTML = `
      <sl-icon slot="icon" name="${variant === 'success' ? 'check-circle' : 'exclamation-triangle'}"></sl-icon>
      ${message}
    `;
    
    document.body.appendChild(notification);
    notification.toast();
    
    // Remove after it's done
    notification.addEventListener('sl-after-hide', () => {
      notification.remove();
    });
  }

  updateLabels(labels) {
    this.labels = { ...this.labels, ...labels };
    this.render();
  }
}

// Register the web component
if (!customElements.get('object-info')) {
  customElements.define("object-info", ObjectInfo);
  console.log("✅ object-info component registered");
  
  // Ensure the component works immediately after registration
  customElements.whenDefined('object-info').then(() => {
    console.log("✅ object-info component is now defined and ready");
    
    // Upgrade any existing elements
    const existingElements = document.querySelectorAll('object-info');
    existingElements.forEach(el => {
      customElements.upgrade(el);
      console.log("✅ Upgraded existing object-info element");
    });
  });
} else {
  console.log("⚠️ object-info component already registered");
  
  // Still try to upgrade existing elements
  const existingElements = document.querySelectorAll('object-info');
  existingElements.forEach(el => {
    customElements.upgrade(el);
  });
}

// Add a global test function for debugging
window.testObjectInfoComponent = function() {
  const component = document.querySelector('object-info');
  if (component) {
    console.log("✅ Component found in DOM");
    console.log("Component:", component);
    console.log("Shadow root:", component.shadowRoot);
    console.log("Shadow root content:", component.shadowRoot.innerHTML);
    
    // Test setFeature
    const testData = {
      id: "TEST-001",
      name: "Test Feature",
      type: "Point",
      properties: {
        test: "value"
      }
    };
    
    console.log("Calling setFeature with test data...");
    component.setFeature(testData);
  } else {
    console.log("❌ No object-info component found in DOM");
  }
};

// Global function to reinitialize the component
window.initObjectInfo = function() {
  const existingComponent = document.querySelector('object-info');
  if (existingComponent) {
    // Remove existing component
    existingComponent.remove();
  }
  
  // Create new component
  const drawer = document.getElementById('right1-drawer');
  const sidebarContent = drawer?.querySelector('.sidebar-content');
  
  if (sidebarContent) {
    const newComponent = document.createElement('object-info');
    sidebarContent.innerHTML = '';
    sidebarContent.appendChild(newComponent);
    
    console.log('✅ Object-info component recreated');
    return newComponent;
  }
  
  return null;
};

// Helper function to ensure component is ready
window.ensureObjectInfoReady = function(callback) {
  const component = document.querySelector('object-info');
  
  if (!component) {
    console.error("No object-info component in DOM");
    return;
  }
  
  // Check if already initialized
  if (typeof component.setFeature === 'function' && typeof component.setGeoObjectData === 'function') {
    callback(component);
    return;
  }
  
  // Wait for custom element to be defined
  customElements.whenDefined('object-info').then(() => {
    // Upgrade the element if needed
    if (!component.constructor.name || component.constructor.name === 'HTMLElement') {
      customElements.upgrade(component);
    }
    
    // Use a more robust retry mechanism
    let retries = 0;
    const maxRetries = 20; // Increase max retries
    const checkReady = () => {
      retries++;
      if (typeof component.setFeature === 'function' && typeof component.setGeoObjectData === 'function') {
        console.log("✅ ObjectInfo component ready after", retries, "attempts");
        callback(component);
      } else if (retries < maxRetries) {
        console.log("⏳ Waiting for ObjectInfo component to be ready, attempt", retries);
        setTimeout(checkReady, 100); // Check every 100ms
      } else {
        console.error("❌ ObjectInfo component still not ready after", maxRetries, "attempts");
        console.log("Component constructor:", component.constructor.name);
        console.log("Available methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(component)));
      }
    };
    
    // Start checking
    setTimeout(checkReady, 50);
  }).catch(error => {
    console.error("Error waiting for object-info component:", error);
  });
};

// Make the class available globally for debugging
window.ObjectInfo = ObjectInfo;

// Add a debug function to test the component immediately
window.debugObjectInfoComponent = function() {
  console.log("🔍 Debugging ObjectInfo component...");
  
  // Check if component is registered
  const componentConstructor = customElements.get('object-info');
  console.log("Component constructor:", componentConstructor);
  
  // Check if element exists in DOM
  const element = document.querySelector('object-info');
  console.log("Element in DOM:", element);
  
  if (element) {
    console.log("Element constructor:", element.constructor.name);
    console.log("Has setFeature method:", typeof element.setFeature === 'function');
    console.log("Has setGeoObjectData method:", typeof element.setGeoObjectData === 'function');
    
    // Try to test with sample data
    const testData = {
      basicInfo: {
        id: "test-123",
        name: "Test Object",
        description: "A test object for debugging",
        type: "Point"
      },
      position: {
        longitude: "14.5000000°",
        latitude: "46.5000000°",
        altitude: "500.00 m"
      },
      category: {
        name: "Test Category"
      }
    };
    
    try {
      if (typeof element.setGeoObjectData === 'function') {
        element.setGeoObjectData(testData);
        console.log("✅ Successfully called setGeoObjectData");
      } else {
        console.log("❌ setGeoObjectData method not available");
      }
    } catch (error) {
      console.error("❌ Error calling setGeoObjectData:", error);
    }
  }
  
  return { componentConstructor, element };
};
