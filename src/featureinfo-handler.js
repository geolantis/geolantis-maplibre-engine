/**
 * Direct Feature Info Enhancer
 *
 * This script directly enhances the feature info display in right1 sidebar
 * without relying on the ObjectInfo class or other external dependencies.
 *
 * It hooks into the map click event directly and populates the sidebar with
 * enhanced feature information.
 */

// Wait for document and map to be loaded
document.addEventListener("DOMContentLoaded", function () {
  // Wait for map to be loaded
  const checkMapInterval = setInterval(function () {
    if (window.interface && window.interface.map) {
      clearInterval(checkMapInterval);
      console.log("Map found, initializing direct feature info enhancer");
      initializeDirectEnhancer();
    }
  }, 300);
});

/**
 * Initialize the direct feature info enhancer
 */
function initializeDirectEnhancer() {
  // Check if the UI elements are present
  if (!document.getElementById("right1-drawer")) {
    console.error("Right sidebar not found");
    return;
  }

  // Initialize the UI if needed
  if (!document.getElementById("feature-info-dialog")) {
    console.log("Initializing feature info UI");
    initObjectInfo();
  }

  // Add map click handler
  window.interface.map.on("click", function (e) {
    // Query features at the clicked point
    const features = window.interface.map.queryRenderedFeatures(e.point);

    if (features.length > 0) {
      // Process the first feature (or you might want to prioritize certain layers)
      const feature = features[0];
      console.log("Feature clicked:", feature);

      // Display enhanced feature info
      displayEnhancedFeatureInfo(feature, e.lngLat);

      // Open the sidebar if it's collapsed
      const sidebar = document.getElementById("right1-drawer");
      if (sidebar.classList.contains("collapsed")) {
        window.interface.toggleSidebar("right1-drawer");
      }
    }
  });

  console.log("Direct feature info enhancer initialized");
}

/**
 * Display enhanced feature information
 * @param {Object} feature - The feature to display
 * @param {Object} lngLat - The coordinates where the click occurred
 */
function displayEnhancedFeatureInfo(feature, lngLat) {
  // Update the header with feature information
  updateFeatureHeader(feature);

  // Clear and populate the content
  const dialogContent = document.getElementById("dialog-content");
  if (!dialogContent) {
    console.error("Dialog content element not found");
    return;
  }

  // Clear previous content
  dialogContent.innerHTML = "";

  // Add sections based on the feature data

  // 1. Location section
  addLocationSection(dialogContent, feature, lngLat);

  // 2. Feature Attributes section
  addAttributesSection(dialogContent, feature);

  // 3. Object Info section with measurements
  addObjectInfoSection(dialogContent, feature);

  // 4. Creation Info section
  addCreationInfoSection(dialogContent, feature);

  // 5. Photos section (if available)
  addPhotosSection(dialogContent, feature);

  // 6. Address section (if available)
  addAddressSection(dialogContent, feature);
}

/**
 * Update the feature header with information from the feature
 * @param {Object} feature - The feature to display
 */
function updateFeatureHeader(feature) {
  const featureId = document.getElementById("feature-id");
  const featureName = document.getElementById("feature-name");
  const fieldNote = document.getElementById("field-note");
  const featureTypeBadge = document.getElementById("feature-type-badge");

  if (!featureId || !featureName || !fieldNote || !featureTypeBadge) {
    console.error("Header elements not found");
    return;
  }

  // Set feature ID
  if (feature.id) {
    featureId.textContent = `ID: ${feature.id}`;
  } else if (feature.properties && feature.properties.id) {
    featureId.textContent = `ID: ${feature.properties.id}`;
  } else {
    featureId.textContent = `ID: ${generateFeatureId(feature)}`;
  }

  // Set feature name
  if (feature.properties && feature.properties.name) {
    featureName.textContent = feature.properties.name;
  } else if (feature.properties && feature.properties.title) {
    featureName.textContent = feature.properties.title;
  } else if (feature.layer && feature.layer.id) {
    featureName.textContent = `${feature.layer.id} Feature`;
  } else {
    featureName.textContent = App.I18n.t('featureInfo.unnamedFeature');
  }

  // Set description/note
  if (feature.properties && feature.properties.description) {
    fieldNote.textContent = feature.properties.description;
  } else {
    fieldNote.textContent = App.I18n.t('featureInfo.noDescription');
  }

  // Set geometry type badge
  if (feature.geometry && feature.geometry.type) {
    featureTypeBadge.textContent = feature.geometry.type;
    featureTypeBadge.style.display = "inline-block";
  } else {
    featureTypeBadge.textContent = App.I18n.t('featureInfo.unknown');
    featureTypeBadge.style.display = "inline-block";
  }
}

/**
 * Add the location section to the dialog content
 * @param {HTMLElement} dialogContent - The dialog content element
 * @param {Object} feature - The feature to display
 * @param {Object} lngLat - The coordinates where the click occurred
 */
function addLocationSection(dialogContent, feature, lngLat) {
  const locationIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="5" y1="12" y2="12"></line><line x1="19" x2="22" y1="12" y2="12"></line><line x1="12" x2="12" y1="2" y2="5"></line><line x1="12" x2="12" y1="19" y2="22"></line><circle cx="12" cy="12" r="7"></circle><circle cx="12" cy="12" r="3"></circle></svg>`;
  const locationSection = createSection("location", "Location", locationIcon);

  // Get coordinates based on feature type
  let coordinates;
  let altitude = 0;

  if (feature.geometry && feature.geometry.type === "Point") {
    // For Point features, use the point coordinates
    coordinates = feature.geometry.coordinates;
    if (coordinates.length > 2) {
      altitude = coordinates[2];
    }
  } else if (feature.geometry && feature.geometry.type === "Polygon") {
    // For Polygon features, calculate the centroid
    coordinates = calculateCentroid(feature.geometry.coordinates[0]);
  } else if (feature.geometry && feature.geometry.type === "LineString") {
    // For LineString features, use the midpoint
    const coords = feature.geometry.coordinates;
    const midIndex = Math.floor(coords.length / 2);
    coordinates = coords[midIndex];
  } else if (lngLat) {
    // Fall back to click location if no geometry
    coordinates = [lngLat.lng, lngLat.lat];
  }

  if (coordinates) {
    addDataRow(locationSection.content, "Longitude", coordinates[0].toFixed(6));
    addDataRow(locationSection.content, "Latitude", coordinates[1].toFixed(6));
    addDataRow(locationSection.content, "Altitude", altitude.toFixed(2) + " m");

    // Add additional location information if available
    if (feature.properties) {
      // Check for common coordinate system properties
      if (feature.properties.x) {
        addDataRow(locationSection.content, "X", feature.properties.x);
      }
      if (feature.properties.y) {
        addDataRow(locationSection.content, "Y", feature.properties.y);
      }
      if (feature.properties.z) {
        addDataRow(locationSection.content, "Z", feature.properties.z);
      }

      // Check for accuracy information
      if (feature.properties.accuracy) {
        addDataRow(
          locationSection.content,
          "Accuracy",
          feature.properties.accuracy
        );
      }
    }
  }

  dialogContent.appendChild(locationSection.section);
}

/**
 * Add the feature attributes section to the dialog content
 * @param {HTMLElement} dialogContent - The dialog content element
 * @param {Object} feature - The feature to display
 */
function addAttributesSection(dialogContent, feature) {
  const attributesIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"></path><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="6.5" cy="9.5" r=".5" fill="currentColor"></circle></svg>`;
  const attributesSection = createSection(
    "attributes",
    "Feature Attributes",
    attributesIcon
  );
  console.log("Feature" + feature);
  // Skip common fields that will be displayed in other sections
  const skipFields = [
    "id",
    "name",
    "title",
    "description",
    "x",
    "y",
    "z",
    "accuracy",
    "latitude",
    "longitude",
    "altitude",
    "creationTime",
    "creationUser",
    "changeTime",
    "changeUser",
    "area",
    "length",
    "nodes",
    "geometry",
  ];

  if (feature.properties) {
    let attributesAdded = 0;
    // Sort properties alphabetically
    const sortedKeys = Object.keys(feature.properties).sort();

    for (const key of sortedKeys) {
      // Skip certain fields and null/undefined values
      if (
        skipFields.includes(key.toLowerCase()) ||
        feature.properties[key] === null ||
        feature.properties[key] === undefined
      ) {
        continue;
      }

      // Format the label (first letter uppercase)
      const formattedLabel = formatLabel(key);

      // Format the value
      const value = formatValue(feature.properties[key]);

      // Add the row
      addDataRow(attributesSection.content, formattedLabel, value);
      attributesAdded++;
    }

    // If no attributes were added, show a message
    if (attributesAdded === 0) {
      const noAttributesMsg = document.createElement("p");
      noAttributesMsg.style.padding = "4px";
      noAttributesMsg.style.fontStyle = "italic";
      noAttributesMsg.textContent = App.I18n.t('featureInfo.noAdditionalAttributes');
      attributesSection.content.appendChild(noAttributesMsg);
    }
  } else {
    // If no properties, show a message
    const noPropertiesMsg = document.createElement("p");
    noPropertiesMsg.style.padding = "4px";
    noPropertiesMsg.style.fontStyle = "italic";
    noPropertiesMsg.textContent = App.I18n.t('featureInfo.noProperties');
    attributesSection.content.appendChild(noPropertiesMsg);
  }

  dialogContent.appendChild(attributesSection.section);
}

/**
 * Add the object info section with measurements to the dialog content
 * @param {HTMLElement} dialogContent - The dialog content element
 * @param {Object} feature - The feature to display
 */
function addObjectInfoSection(dialogContent, feature) {
  const objectInfoIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.99 6.74 1.93 3.44"></path><path d="M19.136 12a10 10 0 0 1-14.271 0"></path><path d="m21 21-2.16-3.84"></path><path d="m3 21 8.02-14.26"></path><circle cx="12" cy="5" r="2"></circle></svg>`;
  const objectInfoSection = createSection(
    "objectInfo",
    "Object Info",
    objectInfoIcon
  );

  // Default values
  let length = "N/A";
  let area = "N/A";
  let nodeCount = "N/A";
  let circumference = "N/A";

  // Calculate based on geometry type
  if (feature.geometry) {
    const geomType = feature.geometry.type;

    if (geomType === "LineString") {
      // LineString - calculate length and node count
      length = calculateLength(feature.geometry.coordinates).toFixed(2) + " m";
      nodeCount = feature.geometry.coordinates.length;
      addDataRow(objectInfoSection.content, "Line Length", length);
      addDataRow(objectInfoSection.content, "Node Count", nodeCount);
    } else if (geomType === "Polygon") {
      // Polygon - calculate area, circumference, and node count
      area = calculateArea(feature.geometry.coordinates[0]).toFixed(2) + " m²";
      circumference =
        calculateLength(feature.geometry.coordinates[0]).toFixed(2) + " m";
      nodeCount = feature.geometry.coordinates[0].length - 1; // Subtract 1 because first and last points are the same

      addDataRow(objectInfoSection.content, "Area", area);
      addDataRow(objectInfoSection.content, "Circumference", circumference);
      addDataRow(objectInfoSection.content, "Node Count", nodeCount);
    } else if (geomType === "Point") {
      // Point - no specific measurements
      addDataRow(objectInfoSection.content, "Line Length", "N/A");
      addDataRow(objectInfoSection.content, "Area", "N/A");
    } else if (geomType === "MultiLineString") {
      // MultiLineString - calculate total length and node count across all lines
      let totalLength = 0;
      let totalNodes = 0;

      feature.geometry.coordinates.forEach((lineCoords) => {
        totalLength += calculateLength(lineCoords);
        totalNodes += lineCoords.length;
      });

      length = totalLength.toFixed(2) + " m";
      nodeCount = totalNodes;

      addDataRow(objectInfoSection.content, "Total Line Length", length);
      addDataRow(
        objectInfoSection.content,
        "Line Count",
        feature.geometry.coordinates.length
      );
      addDataRow(objectInfoSection.content, "Total Node Count", nodeCount);
    } else if (geomType === "MultiPolygon") {
      // MultiPolygon - calculate total area and node count across all polygons
      let totalArea = 0;
      let totalCircumference = 0;
      let totalNodes = 0;

      feature.geometry.coordinates.forEach((polygon) => {
        totalArea += calculateArea(polygon[0]);
        totalCircumference += calculateLength(polygon[0]);
        totalNodes += polygon[0].length - 1;
      });

      area = totalArea.toFixed(2) + " m²";
      circumference = totalCircumference.toFixed(2) + " m";
      nodeCount = totalNodes;

      addDataRow(objectInfoSection.content, "Total Area", area);
      addDataRow(
        objectInfoSection.content,
        "Total Circumference",
        circumference
      );
      addDataRow(
        objectInfoSection.content,
        "Polygon Count",
        feature.geometry.coordinates.length
      );
      addDataRow(objectInfoSection.content, "Total Node Count", nodeCount);
    } else {
      // For other types just show default values
      addDataRow(objectInfoSection.content, "Line Length", length);
      addDataRow(objectInfoSection.content, "Area", area);
    }
  } else {
    // No geometry
    addDataRow(objectInfoSection.content, "Line Length", "N/A");
    addDataRow(objectInfoSection.content, "Area", "N/A");
  }

  dialogContent.appendChild(objectInfoSection.section);
}

/**
 * Add the creation info section to the dialog content
 * @param {HTMLElement} dialogContent - The dialog content element
 * @param {Object} feature - The feature to display
 */
function addCreationInfoSection(dialogContent, feature) {
  const creationInfoIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 22h2a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><circle cx="8" cy="16" r="6"></circle><path d="M9.5 17.5 8 16.25V14"></path></svg>`;
  const creationInfoSection = createSection(
    "creationInfo",
    "Creation Info",
    creationInfoIcon
  );

  let creationTime = "N/A";
  let creationUser = "N/A";
  let changeTime = "N/A";
  let changeUser = "N/A";

  // Check for creation info in properties
  if (feature.properties) {
    if (feature.properties.creationTime) {
      creationTime = feature.properties.creationTime;
    } else if (feature.properties.created) {
      creationTime = feature.properties.created;
    }

    if (feature.properties.creationUser) {
      creationUser = feature.properties.creationUser;
    } else if (feature.properties.creator) {
      creationUser = feature.properties.creator;
    }

    if (feature.properties.changeTime) {
      changeTime = feature.properties.changeTime;
    } else if (feature.properties.modified) {
      changeTime = feature.properties.modified;
    }

    if (feature.properties.changeUser) {
      changeUser = feature.properties.changeUser;
    } else if (feature.properties.modifier) {
      changeUser = feature.properties.modifier;
    }
  }

  // Add default creation info if not present
  if (creationTime === "N/A") {
    creationTime = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  if (creationUser === "N/A") {
    creationUser = "Current User";
  }

  // Add rows
  addDataRow(creationInfoSection.content, "Creation Time", creationTime);
  addDataRow(creationInfoSection.content, "User", creationUser);

  if (changeTime !== "N/A") {
    addDataRow(creationInfoSection.content, "Change Date/Time", changeTime);
  }

  if (changeUser !== "N/A") {
    addDataRow(creationInfoSection.content, "Change User", changeUser);
  }

  dialogContent.appendChild(creationInfoSection.section);
}

/**
 * Add the photos section to the dialog content
 * @param {HTMLElement} dialogContent - The dialog content element
 * @param {Object} feature - The feature to display
 */
function addPhotosSection(dialogContent, feature) {
  const photosIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 22H4a2 2 0 0 1-2-2V6"></path><path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"></path><circle cx="12" cy="8" r="2"></circle><rect width="16" height="16" x="6" y="2" rx="2"></rect></svg>`;
  const photosSection = createSection("photos", "Photos", photosIcon);

  // Add photos container
  const photosContainer = document.createElement("div");
  photosContainer.className = "photos-container";

  // Check if the feature has photos
  let hasPhotos = false;

  if (feature.properties && feature.properties.photos) {
    hasPhotos = true;

    // Handle photos as array or string
    const photos = Array.isArray(feature.properties.photos)
      ? feature.properties.photos
      : [feature.properties.photos];

    // Add each photo
    photos.forEach((photo, index) => {
      const photoItem = document.createElement("div");
      photoItem.className = "photo-item";

      const img = document.createElement("img");
      // Use the photo URL if it's a string, otherwise use a placeholder
      if (
        typeof photo === "string" &&
        (photo.startsWith("http") || photo.startsWith("data:"))
      ) {
        img.src = photo;
      } else if (photo.url) {
        img.src = photo.url;
      } else {
        img.src = "/api/placeholder/120/90";
      }

      img.alt = `Photo ${index + 1}`;
      img.width = 120;
      img.height = 90;

      photoItem.appendChild(img);
      photosContainer.appendChild(photoItem);
    });
  }

  // If no photos, add placeholder or message
  if (!hasPhotos) {
    // Add example photos (placeholders)
    for (let i = 0; i < 2; i++) {
      const photoItem = document.createElement("div");
      photoItem.className = "photo-item";

      const img = document.createElement("img");
      img.src = "/api/placeholder/120/90";
      img.alt = `Photo ${i + 1}`;
      img.width = 120;
      img.height = 90;

      photoItem.appendChild(img);
      photosContainer.appendChild(photoItem);
    }
  }

  photosSection.content.appendChild(photosContainer);
  dialogContent.appendChild(photosSection.section);
}

/**
 * Add the address section to the dialog content
 * @param {HTMLElement} dialogContent - The dialog content element
 * @param {Object} feature - The feature to display
 */
function addAddressSection(dialogContent, feature) {
  const addressIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22a1 1 0 0 1-1-1v-4a1 1 0 0 1 .445-.832l3-2a1 1 0 0 1 1.11 0l3 2A1 1 0 0 1 22 17v4a1 1 0 0 1-1 1z"/><path d="M18 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 .601.2"/><path d="M18 22v-3"/><circle cx="10" cy="10" r="3"/></svg>`;
  const addressSection = createSection("address", "Address", addressIcon);

  let address = "No address information available";

  // Check for address in properties
  if (feature.properties) {
    if (feature.properties.address) {
      address = feature.properties.address;
    } else {
      // Try to construct address from individual fields
      const addressParts = [];

      if (feature.properties.street) {
        addressParts.push(feature.properties.street);

        if (feature.properties.housenumber) {
          // Add housenumber after street for proper formatting
          addressParts[0] += " " + feature.properties.housenumber;
        }
      }

      if (feature.properties.city) {
        addressParts.push(feature.properties.city);
      }

      if (feature.properties.state || feature.properties.province) {
        addressParts.push(
          feature.properties.state || feature.properties.province
        );
      }

      if (feature.properties.postcode || feature.properties.zip) {
        addressParts.push(
          feature.properties.postcode || feature.properties.zip
        );
      }

      if (feature.properties.country) {
        addressParts.push(feature.properties.country);
      }

      if (addressParts.length > 0) {
        address = addressParts.join(", ");
      }
    }
  }

  // Add address content
  const addressPara = document.createElement("p");
  addressPara.textContent = address;
  addressSection.content.appendChild(addressPara);

  dialogContent.appendChild(addressSection.section);
}

// ----- Helper Functions -----

/**
 * Create a section with content
 * @param {String} id - The section ID
 * @param {String} title - The section title
 * @param {String} iconSvg - The SVG icon for the section
 * @returns {Object} - The section and content elements
 */
function createSection(id, title, iconSvg) {
  const section = document.createElement("div");
  section.className = "section";
  section.style.marginBottom = "0"; // Ensure no margin
  section.style.borderBottom = "0"; // Remove any border

  // Create header
  const sectionHeader = document.createElement("div");
  sectionHeader.className = "section-header";
  sectionHeader.setAttribute("data-section", id);

  // Update SVG size to make it smaller
  iconSvg = iconSvg
    .replace('width="20"', 'width="16"')
    .replace('height="20"', 'height="16"');

  const sectionTitle = document.createElement("div");
  sectionTitle.className = "section-title";

  const sectionIcon = document.createElement("div");
  sectionIcon.className = "section-icon";
  sectionIcon.innerHTML = iconSvg;

  const heading = document.createElement("h3");
  heading.textContent = title;

  sectionTitle.appendChild(sectionIcon);
  sectionTitle.appendChild(heading);

  // Make the chevron icon smaller
  const chevronIcon = document.createElement("div");
  chevronIcon.className = "chevron-icon chevron-up";
  chevronIcon.setAttribute("data-chevron", id);
  chevronIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

  sectionHeader.appendChild(sectionTitle);
  sectionHeader.appendChild(chevronIcon);

  // Create content
  const sectionContent = document.createElement("div");
  sectionContent.className = "section-content";
  sectionContent.id = `${id}-content`;
  sectionContent.style.padding = "1px 2px"; // Minimized padding

  // Add toggle behavior
  sectionHeader.addEventListener("click", function () {
    sectionContent.classList.toggle("hidden");
    chevronIcon.classList.toggle("chevron-up");
  });

  section.appendChild(sectionHeader);
  section.appendChild(sectionContent);

  return { section, content: sectionContent };
}

/**
 * Add a data row to a section
 * @param {HTMLElement} container - The container element
 * @param {String} label - The data label
 * @param {String} value - The data value
 */
function addDataRow(container, label, value) {
  const row = document.createElement("div");
  row.className = "data-row";

  const labelEl = document.createElement("div");
  labelEl.className = "data-label";
  labelEl.textContent = label;

  const valueEl = document.createElement("div");
  valueEl.className = "data-value";
  valueEl.textContent = value;

  row.appendChild(labelEl);
  row.appendChild(valueEl);
  container.appendChild(row);
}

/**
 * Format a label by capitalizing the first letter of each word
 * @param {String} label - The label to format
 * @returns {String} - The formatted label
 */
function formatLabel(label) {
  // Handle camelCase
  const spacedLabel = label.replace(/([A-Z])/g, " $1");

  // Split into words and capitalize first letter of each
  return spacedLabel
    .split(/[_\s]/) // Split on underscores or spaces
    .map((word) => {
      if (word.length === 0) return "";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ")
    .trim();
}

/**
 * Format a value for display
 * @param {*} value - The value to format
 * @returns {String} - The formatted value
 */
function formatValue(value) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    // Check if it's a whole number or has decimals
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  }

  if (typeof value === "object") {
    // For objects, convert to JSON string
    return JSON.stringify(value);
  }

  // For strings and other types, just convert to string
  return value.toString();
}

/**
 * Generate a feature ID
 * @param {Object} feature - The feature
 * @returns {String} - A generated ID
 */
function generateFeatureId(feature) {
  return `FT-${new Date().toISOString().substring(0, 10)}-${Math.floor(
    Math.random() * 10000
  )
    .toString()
    .padStart(4, "0")}`;
}

/**
 * Calculate the distance between two points
 * @param {Array} p1 - The first point [lng, lat]
 * @param {Array} p2 - The second point [lng, lat]
 * @returns {Number} - The distance in meters
 */
function calculateDistance(p1, p2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (p1[1] * Math.PI) / 180; // Latitude 1 in radians
  const φ2 = (p2[1] * Math.PI) / 180; // Latitude 2 in radians
  const Δφ = ((p2[1] - p1[1]) * Math.PI) / 180; // Latitude difference in radians
  const Δλ = ((p2[0] - p1[0]) * Math.PI) / 180; // Longitude difference in radians

  // Haversine formula
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Calculate the length of a line
 * @param {Array} coordinates - The line coordinates
 * @returns {Number} - The length in meters
 */
function calculateLength(coordinates) {
  if (!coordinates || coordinates.length < 2) return 0;

  let length = 0;

  for (let i = 1; i < coordinates.length; i++) {
    length += calculateDistance(coordinates[i - 1], coordinates[i]);
  }

  return length;
}

/**
 * Calculate the area of a polygon
 * @param {Array} ring - The polygon ring coordinates
 * @returns {Number} - The area in square meters
 */
function calculateArea(ring) {
  if (!ring || ring.length < 3) return 0;

  // Use the Shoelace formula (Gauss's area formula)
  let area = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }

  // Close the loop
  area +=
    ring[ring.length - 1][0] * ring[0][1] -
    ring[0][0] * ring[ring.length - 1][1];

  // Take absolute value and divide by 2
  area = Math.abs(area) / 2;

  // Convert to square meters (approximate, depends on latitude)
  // This is a rough approximation for small areas
  const latitude = ring[0][1];
  const metersPerDegreeLat = 111320; // Approximate meters per degree latitude
  const metersPerDegreeLon = 111320 * Math.cos((latitude * Math.PI) / 180);

  // Convert square degrees to square meters
  return area * metersPerDegreeLat * metersPerDegreeLon;
}

/**
 * Calculate the centroid of a polygon ring
 * @param {Array} ring - The polygon ring coordinates
 * @returns {Array} - The centroid coordinates [lng, lat]
 */
function calculateCentroid(ring) {
  if (!ring || ring.length === 0) return [0, 0];

  // For more accurate centroid calculation (weighted by area)
  let area = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    const p1 = ring[i];
    const p2 = ring[i + 1];

    // Calculate signed area for this triangle
    const f = p1[0] * p2[1] - p2[0] * p1[1];
    area += f;

    // Accumulate centroid components weighted by area
    cx += (p1[0] + p2[0]) * f;
    cy += (p1[1] + p2[1]) * f;
  }

  // Last point connects to first
  const p1 = ring[ring.length - 1];
  const p2 = ring[0];
  const f = p1[0] * p2[1] - p2[0] * p1[1];
  area += f;
  cx += (p1[0] + p2[0]) * f;
  cy += (p1[1] + p2[1]) * f;

  // Final computation with correct sign and weighting
  area = area * 0.5;

  // If area is too small, fallback to simpler method
  if (Math.abs(area) < 1e-10) {
    let sumX = 0;
    let sumY = 0;

    for (let i = 0; i < ring.length; i++) {
      sumX += ring[i][0];
      sumY += ring[i][1];
    }

    return [sumX / ring.length, sumY / ring.length];
  }

  cx = cx / (6 * area);
  cy = cy / (6 * area);

  return [cx, cy];
}

/**
 * Initialize object info UI
 * This function is copied from right1-objectinfo.js to ensure we have a proper UI structure
 */
function initObjectInfo() {
  // Get the right1 sidebar content container
  const sidebar = document.getElementById("right1-drawer");
  const sidebarContent = sidebar.querySelector(".sidebar-content");

  if (!sidebarContent) {
    console.error("Sidebar content not found in right1-drawer");
    return;
  }

  // Clear existing content
  sidebarContent.innerHTML = "";
  sidebarContent.style.padding = "0"; // Remove any padding from the sidebar content
  sidebarContent.style.display = "flex"; // Use flex display
  sidebarContent.style.flexDirection = "column"; // Stack children vertically
  sidebarContent.style.height = "100%"; // Full height

  // Create feature info container
  const featureInfoDialog = document.createElement("div");
  featureInfoDialog.id = "feature-info-dialog";
  featureInfoDialog.className = "feature-info-dialog";

  // Create header
  const dialogHeader = document.createElement("div");
  dialogHeader.className = "dialog-header";

  const headerContent = document.createElement("div");
  headerContent.className = "header-content";

  // Title and badge in the same row
  const titleRow = document.createElement("div");
  titleRow.className = "title-badge-row";

  // Title centered
  const headerTitle = document.createElement("h2");
  headerTitle.textContent = App.I18n.t('featureInfo.title');
  headerTitle.style.textAlign = "center";
  headerTitle.style.width = "100%";
  titleRow.appendChild(headerTitle);

  // Feature type badge on the right
  const featureTypeBadge = document.createElement("div");
  featureTypeBadge.className = "feature-type-badge";
  featureTypeBadge.id = "feature-type-badge";
  featureTypeBadge.textContent = "Point";
  titleRow.appendChild(featureTypeBadge);

  headerContent.appendChild(titleRow);

  // ID row
  const featureId = document.createElement("div");
  featureId.className = "feature-id";
  featureId.id = "feature-id";
  featureId.textContent = "ID: FT-2025-03-28-001";
  featureId.style.textAlign = "left";
  headerContent.appendChild(featureId);

  // Name row
  const featureName = document.createElement("h1");
  featureName.id = "feature-name";
  featureName.textContent = "Water Valve #42";
  featureName.style.textAlign = "left";
  headerContent.appendChild(featureName);

  // Note row
  const fieldNote = document.createElement("div");
  fieldNote.className = "field-note";
  fieldNote.id = "field-note";
  fieldNote.textContent = "Newly installed valve, needs inspection in 6 months";
  fieldNote.style.textAlign = "left";
  headerContent.appendChild(fieldNote);

  dialogHeader.appendChild(headerContent);
  featureInfoDialog.appendChild(dialogHeader);

  // Create content area
  const dialogContent = document.createElement("div");
  dialogContent.className = "dialog-content";
  dialogContent.id = "dialog-content";

  // Will be populated when a feature is selected
  featureInfoDialog.appendChild(dialogContent);

  // Create actions area
  const dialogActions = document.createElement("div");
  dialogActions.className = "dialog-actions";

  const editButton = document.createElement("button");
  editButton.className = "edit-button";
  editButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
      Edit
    `;

  dialogActions.appendChild(editButton);
  featureInfoDialog.appendChild(dialogActions);

  // Add to sidebar
  sidebarContent.appendChild(featureInfoDialog);

  // Add styles
  addStyles();
}

/**
 * Add necessary styles to the page
 */
function addStyles() {
  if (document.getElementById("object-info-styles")) return;

  const styleEl = document.createElement("style");
  styleEl.id = "object-info-styles";
  styleEl.textContent = `
      .feature-info-dialog {
        width: 100%;
        height: calc(100% - 2px); /* Subtract 32px to make room for the toolbar */
        background: white;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 8px;
        margin-bottom: 1px; /* Add 1px margin at the bottom */
      }
  
      .dialog-header {
        background: #4682b4;
        color: white;
        padding: 0;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        width: 100%;
        height: auto; /* Reduce height */
        /* Make header 50% of its original height */
        max-height: 50%;
      }
  
      .header-content {
        padding: 3px 8px 3px 6px; /* Reduce padding on all sides */
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
  
      .dialog-header h2 {
        font-size: 0.9rem; /* Smaller font size */
        font-weight: bold;
        margin: 0;
        padding: 0;
        text-align: center; /* Center the title */
        flex-grow: 1;
      }
  
      .feature-id {
        font-size: 0.6rem; /* Smaller font */
        opacity: 0.9;
        margin: 0;
        padding: 0;
        text-align: left;
      }
  
      .dialog-header h1 {
        font-size: 0.9rem; /* Smaller font */
        font-weight: bold;
        margin: 0; /* Remove margin */
        padding: 0;
        text-align: left;
        max-width: 75%;
      }
  
      .field-note {
        font-size: 0.7rem; /* Smaller font */
        font-style: italic;
        margin: 0; /* Remove margin */
        padding: 0;
        text-align: left;
        max-width: 75%;
        line-height: 1.0; /* Tighter line height */
      }
  
      .title-badge-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 0; /* Reduced padding */
        margin-bottom: 1px; /* Add small margin at bottom */
        position: relative; /* For absolute positioning of badge */
      }
  
      .feature-type-badge {
        display: inline-block;
        background: #3a6d94;
        padding: 1px 4px; /* Smaller padding */
        border-radius: 9999px;
        font-size: 0.65rem; /* Smaller font */
        text-align: center;
        margin-right: 0; /* Removed margin */
        position: absolute; /* Position absolutely */
        right: 0; /* Align to right */
        top: 0; /* Align to top */
      }
  
      /* Completely eliminate margin between sections */
      .section {
        margin: 0;
        padding: 0;
        margin-bottom: 0;
        border-bottom: 0;
      }
  
      /* Remove spacing between sections */
      .section + .section {
        margin-top: 0;
        border-top: 0;
      }
  
      .dialog-content {
        flex: 1;
        overflow-y: auto;
        padding: 0; /* Removed all padding */
      }
  
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2px 2px; /* Minimized padding */
        background: #f1f1f1;
        border-radius: 4px; /* Reduced border radius */
        margin-bottom: 8px; /* No bottom margin */
        cursor: pointer;
      }
  
      .section-header:hover {
        background: #e5e5e5;
      }
  
      .section-title {
        display: flex;
        align-items: center;
        gap: 4px; /* Reduced from 6px to 4px */
      }
  
      .section-title h3 {
        font-weight: 600;
        color: #333;
        margin: 0;
        font-size: 0.8rem; /* Reduced font size */
      }
  
      .section-icon {
        color: #666;
      }
  
      .section-icon svg {
        width: 16px; /* Smaller icon */
        height: 16px; /* Smaller icon */
      }
  
      .chevron-icon {
        color: #666;
        transition: transform 0.2s ease;
      }
  
      .chevron-icon svg {
        width: 16px; /* Smaller icon */
        height: 16px; /* Smaller icon */
      }
  
      .chevron-up {
        transform: rotate(180deg);
      }
  
      .section-content {
        padding: 1px 6px; /* Minimized padding */
        margin: 0;
      }
  
      .hidden {
        display: none;
      }
  
      .data-row {
        display: table !important;
        width: 100% !important;
        table-layout: fixed !important; /* Fixed table layout gives more predictable sizing */
        padding: 1px 0 !important; /* Minimized padding */
        border-bottom: 1px solid #f1f1f1 !important;
        font-size: 0.8rem !important; /* Slightly larger font size */
        line-height: 1.4 !important; /* Slightly increased line height for readability */
        min-height: 18px !important; /* Ensure minimum height */
        margin: 0 !important;
      }
  
      .data-label {
        display: table-cell !important;
        width: 40% !important;
        color: #666 !important;
        text-align: left !important;
        white-space: nowrap !important; /* Prevent wrapping */
        overflow: hidden !important;
        text-overflow: ellipsis !important; /* Show ellipsis if text overflows */
        padding-right: 4px !important; /* Add a little padding */
        vertical-align: middle !important;
        box-sizing: border-box !important;
      }
  
      .data-value {
        display: table-cell !important;
        width: 60% !important;
        font-size: 1.2rem !important; /* Increased font size */
        font-weight: 600 !important;
        color: #333 !important;
        text-align: right !important;
        white-space: nowrap !important; /* Prevent wrapping */
        overflow: hidden !important; /* Hide overflow */
        text-overflow: ellipsis !important; /* Show ellipsis if text overflows */
        vertical-align: middle !important;
        box-sizing: border-box !important;
      }
  
      .dialog-actions {
        border-top: 1px solid #e5e5e5;
        padding: 8px; /* Reduced padding */
        background: #f9f9f9;
        display: flex;
        justify-content: center;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
      }
  
      .edit-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: #4682b4;
        color: white;
        padding: 6px 20px; /* Reduced padding */
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-size: 0.8rem; /* Reduced font size */
      }
  
      .edit-button:hover {
        background: #3a6d94;
      }
  
      .photos-container {
        display: flex;
        flex-wrap: wrap;
        gap: 4px; /* Reduced gap */
        padding: 1px;
      }
  
      .photo-item {
        position: relative;
        cursor: pointer;
      }
  
      .photo-item img {
        border: 1px solid #e5e5e5;
        border-radius: 4px; /* Reduced border radius */
        object-fit: cover;
      }
  
      .section p {
        margin: 0;
        padding: 1px 8px; /* Minimized padding */
        text-align: left;
        font-size: 0.75rem; /* Reduced font size */
      }
  
      .subsection {
        background: #f9f9f9;
        padding: 2px; /* Reduced padding */
        border-radius: 4px; /* Reduced border radius */
        margin-bottom: 2px; /* Reduced margin */
      }
  
      .subsection h4 {
        font-weight: 500;
        color: #444;
        margin: 0;
        padding: 0;
        margin-bottom: 1px; /* Minimized margin */
        text-align: left;
        font-size: 0.75rem; /* Reduced font size */
      }
  
      .linked-feature {
        display: flex;
        align-items: center;
        gap: 4px; /* Reduced gap */
        padding: 2px; /* Reduced padding */
        background: #f9f9f9;
        border-radius: 4px; /* Reduced border radius */
        margin-bottom: 2px; /* Reduced margin */
        cursor: pointer;
        text-align: left;
      }
  
      .linked-feature:hover {
        background: #f0f0f0;
      }
  
      .linked-feature-icon {
        color: #4682b4;
      }
  
      .feature-name {
        font-weight: 500;
        font-size: 0.75rem; /* Reduced font size */
      }
  
      /* Make specific adjustments to further reduce spacing */
      #dialog-content > .section:not(:first-child) {
        margin-top: 0;
      }
    `;

  document.head.appendChild(styleEl);
}
