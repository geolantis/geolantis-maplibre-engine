/**
 * Created by Alex Stromberger on 21.12.16.
 */

/**
 * Handles the communication between the browser process and the native application
 * @constructor
 */
var ReturnHandler = function () {
  this.debug = false;
  this.interface = "default";

  /**
   * Activates debug mode -> console.log at every event
   * @param {boolean} mode - enables debug mode
   */
  this.setDebugMode = function (mode) {
    this.debug = mode;
  };

  /**
   * Sets the ReturnHandler Interface for communications with WebView
   * @param {string} interface - string value of the selected interface (android,default)
   */
  this.setInterface = function (interface) {
    this.interface = interface.toLowerCase();
  };

  /**
   * Sends the return values of the functions to the WebView (work-around for async behaviour)
   * @param {string }data
   * @returns {*}
   */
  this.send = function (data) {
    switch (this.interface) {
      case "android":
        nativeReha.send(data);
        break;
      case "dotnet":
      case "default":
        return data;
        break;
    }

    //return data when in debug mode
    if (this.debug) {
      return data;
    }

    //if nothing gets selected - return nothing
    return undefined;
  };

  /**
   * Sends a callback to the WebView
   * @param {string} callbackName - name of the callback function
   * @param {string} data - data of the callback (serialized js objects ...)
   */
  this.sendCallback = function (callbackName, data) {
    // Debug
    if (this.debug) {
      console.log("Received Callback {" + callbackName + "} - " + data);
    }

    switch (this.interface) {
      case "android":
      case "dotnet":
        if (typeof nativeReha !== 'undefined' && nativeReha.sendCallback) {
          nativeReha.sendCallback(callbackName, data);
        } else {
          console.error("nativeReha.sendCallback is not available! Callback '" + callbackName + "' with data '" + data + "' could not be sent.");
          console.log("nativeReha object:", typeof nativeReha !== 'undefined' ? nativeReha : 'undefined');
        }
        break;
      case "default":
        return data;
    }
  };

  /**
   * Sends a callback to the WebView
   * @param {string} callbackName - name of the callback function
   * @param {string} data - data of the callback (serialized js objects ...)
   */
  this.sendReturnCallback = function (callbackName, data) {
    // Debug
    if (this.debug) {
      console.log("Received Callback {" + callbackName + "} - " + data);
    }

    switch (this.interface) {
      case "android":
      case "dotnet":
        return nativeReha.sendReturnCallback(callbackName, data);
      case "default":
        return data;
    }
  };
};
