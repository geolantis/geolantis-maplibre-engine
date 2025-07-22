/**
 * Search functionality
 * @namespace App.UI.Search
 */
App.UI = App.UI || {};
App.UI.Search = (function () {
  // Private variables
  var _map = null;
  var _searchURL = "https://gis.ktn.gv.at/suche/kagis/search/all_wgs?";
  var _filterExtend = false;

  // Public API
  return {
    /**
     * Initialize search functionality
     * @param {Object} map - The MapLibre map instance
     */
    initialize: function (map) {
      _map = map;
      console.log("Search functionality initialized");
    },

    /**
     * Filter search based on map extent
     */
    filterSearch2extent: function () {
      if (_filterExtend) {
        _searchURL = "https://gis.ktn.gv.at/suche/kagis/search/all_wgs?";
        _filterExtend = false;
        document
          .getElementById("search_button_mapExtend")
          .style.setProperty("background-color", "#F7F7F7");
      } else {
        const bounds = _map.getBounds();
        _searchURL = `https://gis.ktn.gv.at/suche/kagis/search/all_wgs?&fq=geowgs:[${bounds._sw.lat},${bounds._sw.lng} TO ${bounds._ne.lat},${bounds._ne.lng}]`;
        _filterExtend = true;
        document
          .getElementById("search_button_mapExtend")
          .style.setProperty("background-color", "#b0b0b0");
      }
      this.doSearch(true);
    },

    /**
     * Perform a search with the current term
     * @param {boolean} switchSearch - Whether this is a search type switch
     */
    doSearch: function (switchSearch = false) {
      const event = window.event || {};
      if (
        (event.keyCode != 40 && event.keyCode != 38 && event.keyCode != 13) ||
        switchSearch
      ) {
        let search_term = document.getElementById("map_search_input").value;
        console.log("Searching for:", search_term);

        $.ajax({
          type: "GET",
          url: _searchURL,
          data: { q: search_term },
          success: (response) => {
            const obj = JSON.parse(response);
            const myData = obj.response.features;
            const result_list = document.getElementById("map_search_results");
            result_list.innerHTML = ""; // Clear previous results

            myData.forEach((entry) => {
              let link = document.createElement("a");
              link.href = "#";
              link.className = "active";

              let subtext = entry.properties.subtext || "";
              let thumbnail_url = entry.properties.thumbnail_url || "";

              let html_link = `
                                <img src='${thumbnail_url}' style='width:20px;'/><div><b>${entry.properties.textsuggest}</b><br>${subtext}</div>
                                <input type='hidden' name='coordinates' value='${entry.geometry.coordinates}'>
                            `;
              link.innerHTML = html_link;

              link.onclick = () => {
                this.zoomTo(entry);
                result_list.innerHTML = "";
                dynamic_Overlay(
                  entry.properties.type,
                  entry.properties.map_category
                );
                highlightFromSOLR(entry);
                showPopup_formSOLR(entry, entry.geometry.coordinates);
              };

              link.onmouseover = () => {
                this.zoomTo(entry);
                this.addMarker(entry);
              };

              link.onmouseleave = () => {
                this.removeMarker();
              };

              result_list.appendChild(link);
            });
          },
        });
      }
    },

    /**
     * Handle keyboard navigation in search results
     */
    mapQSelect: function () {
      const event = window.event || {};
      let suggestions = document
        .getElementById("map_search_results")
        .getElementsByTagName("a");

      if (event.keyCode == 40) {
        // Arrow Down
        suggestionfocus =
          suggestionfocus >= suggestions.length - 1 ? -1 : suggestionfocus + 1;
        this.mapSelectSuggestionFocus(suggestionfocus);
      }

      if (event.keyCode == 38) {
        // Arrow Up
        suggestionfocus =
          suggestionfocus <= 0 ? suggestions.length : suggestionfocus - 1;
        this.mapSelectSuggestionFocus(suggestionfocus);
      }

      if (event.keyCode == 13 && suggestionfocus != -1) {
        // Enter key
        const selected_elem =
          suggestions[suggestionfocus].getElementsByTagName("input");
        const selected_obj = this.suggestionToObject(selected_elem);
        this.zoomTo(selected_obj);
        dynamic_Overlay(selected_obj.type, selected_obj.map_category);
        highlightFromSOLR(selected_obj);
        showPopup_formSOLR(selected_obj, selected_obj.coordinates);
        document.getElementById("map_search_results").innerHTML = "";
      }
    },

    /**
     * Focus on a suggestion by index
     * @param {number} index - Index of suggestion to focus
     */
    mapSelectSuggestionFocus: function (index) {
      const links = $("#map_search_results").find("a");
      links.removeClass("selected").css("background", "#ffffff");

      if (index >= 0 && index < links.length) {
        const selectedLink = links[index];
        $(selectedLink).addClass("selected").css("background", "#efefef");
        const hiddenInputs = selectedLink.getElementsByTagName("input");
        const selected_obj = this.suggestionToObject(hiddenInputs);
        document.getElementById("map_search_input").value =
          selectedLink.getElementsByTagName("b")[0].textContent;
        this.zoomTo(selected_obj);
        this.addMarker(selected_obj);
      }
    },

    /**
     * Convert suggestion HTML elements to an object
     * @param {HTMLCollection} html_suggestion_hidden - Collection of hidden inputs
     * @returns {Object} Structured object from inputs
     */
    suggestionToObject: function (html_suggestion_hidden) {
      let object = {};
      Array.from(html_suggestion_hidden).forEach((input) => {
        object[input.name] =
          input.name === "coordinates" ? input.value.split(",") : input.value;
      });
      return object;
    },

    /**
     * Zoom to a specific object
     * @param {Object} object - The object to zoom to
     */
    zoomTo: function (object) {
      _map.flyTo({
        center: object.geometry.coordinates,
        zoom: 18,
      });
    },

    /**
     * Add a marker for the search result
     * @param {Object} obj - Object with location information
     */
    addMarker: function (obj) {
      // Implement marker addition logic
    },

    /**
     * Remove search result marker
     */
    removeMarker: function () {
      // Implement marker removal logic
    },
  };
})();

console.log("app.ui.search.js loaded - App.UI.Search module created");
