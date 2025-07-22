// Function to start updating data
function startDataUpdates() {
  // Update with initial data
  updateStatusBarData({
    device: "ppm10xx zero",
    tiltStatus: "Ready",
    lastFixTime: new Date().toLocaleTimeString(),
    rtkStatus: " FIX",
    rtkAge: "2s",
    horizontalAccuracy: 0.8,
    verticalAccuracy: 1.2,
    coordinates: {
      longitude: window.interface.currentLocation[0],
      latitude: window.interface.currentLocation[1],
      altitude: 524.8,
      x: 5682453.21,
      y: 4538271.65,
      z: 524.8,
    },
    gnssQuality: {
      vrms: (Math.random() * 1.2).toFixed(3) + " [m]",
      hrms: (Math.random() * 1.0).toFixed(3) + " [m]",
      hdop: 1.0, // Added hdop to match usage in the code
      vdop: 1.2,
      pdop: 1.4,
      ntrip: "Connected",
      rtcm: "Receiving",
      satellites: 18,
      visibleSatellites: 23,
      speed: 0.1,
    },
    deviceInfo: {
      tiltInfo: "0.4°",
      battery: 85,
      connectionType: "WiFi",
    },
    locatorInfo: {
      // Added locatorInfo to match usage in the code
      model: "vLoc3 RTK Pro",
    },
  });

  // Set up regular updates (demo for now)
  startDemoUpdates();
}

// Update the status bar with new data
function updateStatusBarData(data) {
  // Fallback to direct element updates
  try {
    // Main bar updates
    const deviceName = document.querySelector(".device-name");
    const tiltStatus = document.querySelector(".tilt-status");
    const fixTime = document.querySelector(".fix-time");
    const rtkStatus = document.querySelector(".rtk-status");
    const accuracy = document.querySelector(".accuracy");

    if (deviceName) deviceName.textContent = data.device;
    if (tiltStatus) tiltStatus.textContent = data.tiltStatus;
    if (fixTime) fixTime.textContent = data.lastFixTime;
    if (rtkStatus) rtkStatus.textContent = `${data.rtkStatus} (${data.rtkAge})`;
    if (accuracy)
      accuracy.textContent = `±${data.horizontalAccuracy.toFixed(1)}cm`;

    // Update accuracy color
    if (accuracy) {
      accuracy.classList.remove("high", "medium", "low");
      if (data.horizontalAccuracy <= 1.0) {
        accuracy.classList.add("high");
      } else if (data.horizontalAccuracy <= 3.0) {
        accuracy.classList.add("medium");
      } else {
        accuracy.classList.add("low");
      }
    }

    // Update expanded sections if they're visible
    const expandedSection = document.getElementById("expanded-sections");
    if (expandedSection && !expandedSection.classList.contains("hidden")) {
      updateExpandedSections(data);
    }
  } catch (error) {
    console.error("Error updating status bar:", error);
  }
}

// Function to update the expanded sections
function updateExpandedSections(data) {
  try {
    // Coordinates updates
    const longitudeElem = document.querySelector(".coord-value.longitude");
    const latitudeElem = document.querySelector(".coord-value.latitude");
    const altitudeElem = document.querySelector(".coord-value.altitude");
    const xElem = document.querySelector(".coord-value.x-coord");
    const yElem = document.querySelector(".coord-value.y-coord");
    const zElem = document.querySelector(".coord-value.z-coord");

    if (longitudeElem && latitudeElem) {
      // Store raw values as data attributes for format switching
      longitudeElem.setAttribute("data-raw", data.coordinates.longitude);
      latitudeElem.setAttribute("data-raw", data.coordinates.latitude);

      // Update with formatted values using current format (if defined)
      const currentFormat = window.currentCoordFormat || 0;
      longitudeElem.textContent = formatCoordinate(
        data.coordinates.longitude,
        currentFormat
      );
      latitudeElem.textContent = formatCoordinate(
        data.coordinates.latitude,
        currentFormat
      );

      if (altitudeElem)
        altitudeElem.textContent = `${data.coordinates.altitude.toFixed(2)} m`;

      // Update XYZ coordinates
      if (xElem) xElem.textContent = data.coordinates.x.toFixed(2);
      if (yElem) yElem.textContent = data.coordinates.y.toFixed(2);
      if (zElem) zElem.textContent = data.coordinates.z.toFixed(2);
    }

    // GNSS Quality updates
    const vrmsHrms = document.querySelector(".vrms-hrms");
    const vdopPdop = document.querySelector(".vdop-pdop");

    if (vrmsHrms)
      vrmsHrms.textContent = `${data.gnssQuality.hrms} / ${data.gnssQuality.vrms}`;
    // Fixed: Ensure hdop exists in data before using it
    if (vdopPdop) {
      const hdop = data.gnssQuality.hdop || data.gnssQuality.vdop || "-";
      const pdop = data.gnssQuality.pdop || "-";
      vdopPdop.textContent = `${hdop} / ${pdop}`;
    }

    // Update satellite count with used/visible format
    const satelliteCount = document.querySelector(".satellite-count");
    if (satelliteCount) {
      // Generate visible satellites if not provided
      const visibleSats =
        data.gnssQuality.visibleSatellites ||
        data.gnssQuality.satellites + 5 + Math.floor(Math.random() * 5);
      satelliteCount.textContent = `${data.gnssQuality.satellites}/${visibleSats}`;
    }

    // Update speed with gauge icon - FIXED to avoid the "Cannot read properties of null" error
    const speedValue = document.querySelector(".speed-value");
    if (speedValue) {
      speedValue.textContent = `${data.gnssQuality.speed} m/s`;
    }

    // RTK status dots and text
    const statusDots = document.querySelectorAll(".status-dot");
    const ntripStatus = document.querySelector(".ntrip-status");
    const rtcmStatus = document.querySelector(".rtcm-status");

    if (statusDots && statusDots.length >= 2) {
      statusDots[0].className = `status-dot ${
        data.gnssQuality.ntrip === "Connected" ? "connected" : "disconnected"
      }`;
      statusDots[1].className = `status-dot ${
        data.gnssQuality.rtcm === "Receiving" ? "connected" : "disconnected"
      }`;
    }

    if (ntripStatus)
      ntripStatus.textContent = `NTRIP: ${data.gnssQuality.ntrip}`;
    if (rtcmStatus) rtcmStatus.textContent = `RTCM: ${data.gnssQuality.rtcm}`;

    // Device info updates
    const tiltInfo = document.querySelector(".tilt-info span");
    if (tiltInfo) {
      tiltInfo.textContent = `${data.tiltStatus} (${data.deviceInfo.tiltInfo})`;
    }

    // Battery updates
    const batteryBar = document.querySelector(".battery-bar");
    const batteryPercentage = document.querySelector(".battery-percentage");
    if (batteryBar && batteryPercentage) {
      batteryBar.style.width = `${data.deviceInfo.battery}%`;
      batteryPercentage.textContent = `${data.deviceInfo.battery}%`;

      // Change battery color based on percentage
      batteryBar.style.backgroundColor =
        data.deviceInfo.battery <= 20 ? "#EF4444" : "#10B981";
    }

    // Connection type updates - Fixed duplicate variable declaration
    const connectionType = document.querySelector(".connection-type");
    const connectionIcon = document.querySelector(".connection-icon");

    if (connectionType && connectionIcon && data.deviceInfo.connectionType) {
      connectionType.textContent = data.deviceInfo.connectionType;

      // Update icon based on connection type
      let iconSvg = "";
      switch (data.deviceInfo.connectionType) {
        case "WiFi":
          iconSvg =
            '<path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line>';
          break;
        case "Bluetooth":
          iconSvg = '<path d="m7 7 10 10-5 5V2l5 5L7 17"></path>';
          break;
        case "BLE":
          iconSvg =
            '<path d="m7 7 10 10-5 5V2l5 5L7 17"></path><path d="M11 11H4"></path><path d="M16 11h-5"></path>';
          break;
        case "USB":
          iconSvg =
            '<circle cx="12" cy="18" r="2"></circle><path d="M9 18V4h6v14"></path><path d="M10 4h4"></path><path d="M7 7h10"></path>';
          break;
        case "ConnectorApp":
          iconSvg =
            '<path d="M9 3H5a2 2 0 0 0-2 2v4"></path><path d="M13 21h6a2 2 0 0 0 2-2v-7"></path><path d="M5 11v4a2 2 0 0 0 2 2h4"></path><rect width="6" height="6" x="9" y="9" rx="3"></rect>';
          break;
        default:
          iconSvg =
            '<path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line>';
      }

      if (connectionIcon) {
        connectionIcon.innerHTML = iconSvg;
      }
    }

    // Update locator type
    const locatorType = document.querySelector(".locator-type");
    if (locatorType && data.locatorInfo && data.locatorInfo.model) {
      locatorType.textContent = data.locatorInfo.model;
    }
  } catch (error) {
    console.error("Error updating expanded sections:", error, error.stack);
  }
}

// Start demo updates
function startDemoUpdates() {
  if (window._demoUpdateInterval) {
    clearInterval(window._demoUpdateInterval);
  }

  // Define possible connection types and locator models for cycling
  const connectionTypes = ["WiFi", "Bluetooth", "BLE", "USB", "ConnectorApp"];
  const locatorModels = [
    "vLoc3 RTK Pro",
    "RD8200SG",
    "RD8200",
    "vLoc3",
    "Leica Ultra",
  ];
  let connectionIndex = 0;
  let locatorIndex = 0;

  window._demoUpdateInterval = setInterval(() => {
    // Create random variations for demo
    const accuracy = (Math.random() * 5).toFixed(1); // Between 0 and 5 cm

    // Generate satellite counts for used/visible format
    const usedSatellites = 8 + Math.floor(Math.random() * 8); // Random between 8-15
    const visibleSatellites =
      usedSatellites + 5 + Math.floor(Math.random() * 8); // Always more visible than used

    const battery = 60 + Math.floor(Math.random() * 40); // Between 60% and 100%

    // Occasionally change RTK status
    const rtkStatus = Math.random() > 0.8 ? " FLOAT" : " FIX";
    const rtkAge = Math.floor(Math.random() * 10) + "s";

    // Generate random HRMS and VRMS values (swapped order)
    const hrms = (Math.random() * 1.0).toFixed(3) + " [m]";
    const vrms = (Math.random() * 1.2).toFixed(3) + " [m]";

    // Generate random HDOP and PDOP values (changed from VDOP)
    const hdop = (0.8 + Math.random()).toFixed(1);
    const pdop = (1 + Math.random() * 1.5).toFixed(1);

    // Use current location if available
    const lng =
      window.interface && window.interface.currentLocation
        ? window.interface.currentLocation[0]
        : 14.2229296;
    const lat =
      window.interface && window.interface.currentLocation
        ? window.interface.currentLocation[1]
        : 46.626328;

    // Cycle through connection types and locator models
    connectionIndex = (connectionIndex + 1) % connectionTypes.length;
    // Only occasionally change the locator model (20% chance)
    if (Math.random() < 0.2) {
      locatorIndex = (locatorIndex + 1) % locatorModels.length;
    }

    // Update with demo data
    updateStatusBarData({
      device: "Geo360 Pro",
      tiltStatus: "Calibrated",
      lastFixTime: new Date().toLocaleTimeString(),
      rtkStatus: rtkStatus,
      rtkAge: rtkAge,
      horizontalAccuracy: parseFloat(accuracy),
      verticalAccuracy: parseFloat(accuracy) * 1.5,
      coordinates: {
        longitude: 14.2229296 + (Math.random() - 0.5) * 0.0001,
        latitude: 46.626328 + (Math.random() - 0.5) * 0.0001,
        altitude: 524.8 + (Math.random() - 0.5) * 0.5,
        x: 5682453.21 + (Math.random() - 0.5) * 10,
        y: 4538271.65 + (Math.random() - 0.5) * 10,
        z: 524.8 + (Math.random() - 0.5) * 0.5,
      },
      gnssQuality: {
        hrms: hrms,
        vrms: vrms,
        hdop: hdop,
        pdop: pdop,
        ntrip: Math.random() > 0.9 ? "Disconnected" : "Connected",
        rtcm: Math.random() > 0.9 ? "No Data" : "Receiving",
        satellites: usedSatellites,
        visibleSatellites: visibleSatellites,
        speed: (Math.random() * 0.5).toFixed(1),
      },
      deviceInfo: {
        tiltInfo: (Math.random() * 0.8).toFixed(1) + "°",
        battery: battery,
        connectionType: connectionTypes[connectionIndex],
      },
      locatorInfo: {
        model: locatorModels[locatorIndex],
      },
    });
  }, 2000);
} // Added missing closing bracket for startDemoUpdates function

// Function to convert decimal degrees to degrees minutes seconds
// Moved outside of startDemoUpdates function to global scope
function decimalToDMS(decimal) {
  const deg = Math.floor(Math.abs(decimal));
  const minutesNotTruncated = (Math.abs(decimal) - deg) * 60;
  const min = Math.floor(minutesNotTruncated);
  const sec = ((minutesNotTruncated - min) * 60).toFixed(2);

  const direction = decimal >= 0 ? "" : "-";
  return `${direction}${deg}° ${min}' ${sec}"`;
}

// Function to convert decimal degrees to degrees decimal minutes
// Moved outside of startDemoUpdates function to global scope
function decimalToDDM(decimal) {
  const deg = Math.floor(Math.abs(decimal));
  const min = ((Math.abs(decimal) - deg) * 60).toFixed(4);

  const direction = decimal >= 0 ? "" : "-";
  return `${direction}${deg}° ${min}'`;
}

// Function to format coordinates based on selected format
// Moved outside of startDemoUpdates function to global scope
function formatCoordinate(decimal, format) {
  switch (format) {
    case 0: // Decimal degrees
      return `${decimal.toFixed(7)}°`;
    case 1: // Degrees minutes seconds
      return decimalToDMS(decimal);
    case 2: // Degrees decimal minutes
      return decimalToDDM(decimal);
    default:
      return `${decimal.toFixed(7)}°`;
  }
}

// Toggle bottom controls function
window.statusFooterFunctions = window.statusFooterFunctions || {};
window.statusFooterFunctions.toggleBottomControls = function (show) {
  try {
    // Find all bottom controls
    const bottomControls = document.querySelectorAll(
      ".maplibregl-ctrl-bottom-left, .maplibregl-ctrl-bottom-right, #G360StakeButtonControl"
    );

    // Set visibility based on parameter
    bottomControls.forEach((control) => {
      if (control) {
        control.style.visibility = show ? "visible" : "hidden";
        control.style.opacity = show ? "1" : "0";
        control.style.transition = "opacity 0.3s ease";
      }
    });

    console.log(
      `Bottom controls visibility set to: ${show ? "visible" : "hidden"}`
    );
  } catch (error) {
    console.error("Error toggling bottom controls:", error);
  }
};

// Set up the footer functions namespace
window.statusFooterFunctions.updateStatusBar = function (data) {
  updateStatusBarData(data);
};
