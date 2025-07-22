/**
 * StakeOut Alert Utility - Handles showing various alerts for the StakeOut feature
 * @namespace App.Features.StakeOut.Alerts
 */
App.Features = App.Features || {};
App.Features.StakeOut = App.Features.StakeOut || {};
App.Features.StakeOut.Alerts = (function () {
  // Private properties
  let _activeAlerts = [];

  // Default styling options
  const _defaultStyles = {
    error: {
      variant: "danger",
      icon: "exclamation-octagon",
      duration: 5000,
    },
    warning: {
      variant: "warning",
      icon: "exclamation-triangle",
      duration: 5000,
    },
    success: {
      variant: "success",
      icon: "check-circle",
      duration: 3000,
    },
    info: {
      variant: "primary",
      icon: "info-circle",
      duration: 4000,
    },
  };

  /**
   * Create and show an alert
   * @private
   */
  function _createAlert(type, title, message, options = {}) {
    // Ensure Shoelace is loaded
    if (!customElements.get("sl-alert")) {
      console.error("Shoelace Alert component not available");
      console.warn(type, title, message); // Fallback to console
      return null;
    }

    // Merge default styles with provided options
    const styles = Object.assign(
      {},
      _defaultStyles[type] || _defaultStyles.info,
      options
    );

    // Create the alert element
    const alert = document.createElement("sl-alert");
    alert.variant = styles.variant;
    alert.closable = true;
    alert.duration = styles.duration;

    // Set content with icon, title, and message
    alert.innerHTML = `
      <sl-icon slot="icon" name="${styles.icon}"></sl-icon>
      <strong>${title}</strong><br>
      ${message}
    `;

    // Add event listeners
    alert.addEventListener("sl-after-hide", () => {
      // Remove from active alerts array
      const index = _activeAlerts.indexOf(alert);
      if (index > -1) {
        _activeAlerts.splice(index, 1);
      }

      // Remove from DOM
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    });

    // Add to document
    document.body.appendChild(alert);

    // Show as toast
    alert.toast();

    // Track the alert
    _activeAlerts.push(alert);

    return alert;
  }

  // Public API
  return {
    /**
     * Show an error alert
     * @param {string} title - Alert title
     * @param {string} message - Alert message
     * @param {Object} options - Additional options
     * @returns {HTMLElement} The alert element
     */
    error: function (title, message, options) {
      return _createAlert("error", title, message, options);
    },

    /**
     * Show a warning alert
     * @param {string} title - Alert title
     * @param {string} message - Alert message
     * @param {Object} options - Additional options
     * @returns {HTMLElement} The alert element
     */
    warning: function (title, message, options) {
      return _createAlert("warning", title, message, options);
    },

    /**
     * Show a success alert
     * @param {string} title - Alert title
     * @param {string} message - Alert message
     * @param {Object} options - Additional options
     * @returns {HTMLElement} The alert element
     */
    success: function (title, message, options) {
      return _createAlert("success", title, message, options);
    },

    /**
     * Show an info alert
     * @param {string} title - Alert title
     * @param {string} message - Alert message
     * @param {Object} options - Additional options
     * @returns {HTMLElement} The alert element
     */
    info: function (title, message, options) {
      return _createAlert("info", title, message, options);
    },

    /**
     * Dismiss all active alerts
     */
    dismissAll: function () {
      _activeAlerts.forEach((alert) => {
        if (typeof alert.hide === "function") {
          alert.hide();
        }
      });
      _activeAlerts = [];
    },

    /**
     * Show unsupported feature type alert
     * @param {string} featureType - Type of feature that's not supported
     * @returns {HTMLElement} The alert element
     */
    unsupportedType: function (featureType) {
      return this.warning(
        App.I18n ? App.I18n.t('stakeout.feature_type_not_supported') : "Feature Type Not Supported",
        App.I18n ? App.I18n.t('stakeout.only_polygons_supported', { featureType: featureType || (App.I18n ? App.I18n.t('stakeout.this_feature_type') : "This feature type") }) : `Stake Out currently only supports polygons. ${
          featureType || "This feature type"
        } cannot be used for Stake Out at this time.`
      );
    },

    /**
     * Show no feature selected alert
     * @returns {HTMLElement} The alert element
     */
    noFeatureSelected: function () {
      return this.warning(
        App.I18n ? App.I18n.t('stakeout.no_feature_selected') : "No Feature Selected",
        App.I18n ? App.I18n.t('stakeout.select_polygon_feature') : "Please select a polygon feature on the map before starting Stake Out."
      );
    },

    /**
     * Show stake out started alert
     * @param {string} [featureType="polygon"] - Type of feature being staked out
     * @returns {HTMLElement} The alert element
     */
    stakeOutStarted: function (featureType = "polygon") {
      return this.success(
        App.I18n ? App.I18n.t('stakeout.stake_out_started') : "Stake Out Started",
        App.I18n ? App.I18n.t('stakeout.navigation_started', { featureType: featureType }) : `Navigation to selected ${featureType} has started. Follow the directional arrows.`
      );
    },

    /**
     * Show stake out stopped alert
     * @returns {HTMLElement} The alert element
     */
    stakeOutStopped: function () {
      return this.info(
        App.I18n ? App.I18n.t('stakeout.stake_out_stopped') : "Stake Out Stopped",
        App.I18n ? App.I18n.t('stakeout.navigation_stopped') : "Navigation has been stopped."
      );
    },
  };
})();

console.log("StakeOut Alert Utility loaded");

// Replace the showUnsupportedTypeAlert function with the new alerts utility
App.Features.StakeOut.showUnsupportedTypeAlert = function (featureType) {
  return App.Features.StakeOut.Alerts.unsupportedType(featureType);
};
