/**
 * Button size and color theme settings manager - FIXED VERSION
 */
document.addEventListener("DOMContentLoaded", function () {
  // Initialize the color theme system
  initColorTheme();

  // Button size radio group event listener
  const buttonSizeRadios = document.getElementById("buttonSizeOptions");
  if (buttonSizeRadios) {
    buttonSizeRadios.addEventListener("sl-change", (e) => {
      document.body.classList.remove(
        "button-size-small",
        "button-size-medium",
        "button-size-large",
        "button-size-extra-large"
      );
      document.body.classList.add("button-size-" + e.target.value);

      // Save setting
      try {
        localStorage.setItem("buttonSize", e.target.value);
      } catch (e) {
        console.warn("Could not save button size setting");
      }
      
      // Trigger repositioning of measurement buttons
      if (window.adjustMeasurementPosition) {
        setTimeout(() => window.adjustMeasurementPosition(), 100);
      }
      
      // Trigger repositioning of TerraDraw buttons
      if (window.fixPosition) {
        setTimeout(() => window.fixPosition(), 100);
      }
      
      // Notify dynamic buttons that size has changed
      if (window.App && window.App.Core && window.App.Core.Events) {
        window.App.Core.Events.trigger('buttonSize:changed', { size: e.target.value });
      }
    });

    // Apply saved button size setting if available
    try {
      const savedButtonSize = localStorage.getItem("buttonSize");
      if (savedButtonSize) {
        buttonSizeRadios.value = savedButtonSize;
        document.body.classList.add("button-size-" + savedButtonSize);
      } else {
        document.body.classList.add("button-size-medium"); // Default
      }
    } catch (e) {
      document.body.classList.add("button-size-medium"); // Default
    }
  }

  // Color theme radio group event listener - FIXED VERSION
  const colorThemeRadios = document.getElementById("colorThemeOptions");
  if (colorThemeRadios) {
    colorThemeRadios.addEventListener("sl-change", (e) => {
      // Remove existing theme classes
      document.body.classList.remove(
        "color-theme-default",
        "color-theme-steelblue"
      );

      // Add new theme class
      document.body.classList.add("color-theme-" + e.target.value);

      // IMPORTANT: Update CSS variable directly for immediate effect
      if (e.target.value === "steelblue") {
        document.documentElement.style.setProperty(
          "--primary-color",
          "rgba(70, 130, 180, 0.7)"
        );
      } else {
        document.documentElement.style.setProperty(
          "--primary-color",
          "rgba(70, 130, 180, 0.7)"
        );
      }

      // Save setting
      try {
        localStorage.setItem("colorTheme", e.target.value);
      } catch (e) {
        console.warn("Could not save color theme setting");
      }

      // Notify components about theme change
      if (window.App && window.App.Core && window.App.Core.Events) {
        window.App.Core.Events.trigger('colorTheme:changed', { theme: e.target.value });
      }

      console.log("Color theme changed to:", e.target.value);
    });

    // Apply saved color theme setting if available
    try {
      const savedColorTheme = localStorage.getItem("colorTheme");
      if (savedColorTheme) {
        colorThemeRadios.value = savedColorTheme;
        document.body.classList.add("color-theme-" + savedColorTheme);

        // IMPORTANT: Set the CSS variable directly
        if (savedColorTheme === "steelblue") {
          document.documentElement.style.setProperty(
            "--primary-color",
            "rgba(70, 130, 180, 0.7)"
          );
        }
      } else {
        document.body.classList.add("color-theme-default"); // Default
      }
    } catch (e) {
      document.body.classList.add("color-theme-default"); // Default
    }
  }
});

function initColorTheme() {
  // Set up initial CSS variable
  document.documentElement.style.setProperty(
    "--primary-color",
    "rgba(70, 130, 180, 0.7)"
  );
}
