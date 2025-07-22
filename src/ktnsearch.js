let searchURL = "https://gis.ktn.gv.at/suche/kagis/search/all_wgs?";
let filterExtend = false;

function filter_search2extent() {
  if (filterExtend) {
    searchURL = "https://gis.ktn.gv.at/suche/kagis/search/all_wgs?";
    filterExtend = false;
    document
      .getElementById("search_button_mapExtend")
      .style.setProperty("background-color", "#F7F7F7");
  } else {
    const bounds = map.getBounds();
    searchURL = `https://gis.ktn.gv.at/suche/kagis/search/all_wgs?&fq=geowgs:[${bounds._sw.lat},${bounds._sw.lng} TO ${bounds._ne.lat},${bounds._ne.lng}]`;
    filterExtend = true;
    document
      .getElementById("search_button_mapExtend")
      .style.setProperty("background-color", "#b0b0b0");
  }
  do_search(true);
}

function do_search(switchSearch = false) {
  const event = window.event || {}; // Ensure event is available
  if (
    (event.keyCode != 40 && event.keyCode != 38 && event.keyCode != 13) ||
    switchSearch
  ) {
    let search_term = document.getElementById("map_search_input").value;
    $.ajax({
      type: "GET",
      url: searchURL,
      data: { q: search_term },
      success: function (response) {
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

          link.onclick = function () {
            zoomTo(entry);
            result_list.innerHTML = ""; // Clear results after selection
            dynamic_Overlay(
              entry.properties.type,
              entry.properties.map_category
            );
            highlightFromSOLR(entry);
            showPopup_formSOLR(entry, entry.geometry.coordinates);
          };

          link.onmouseover = function () {
            zoomTo(entry);
            addMarker(entry);
          };

          link.onmouseleave = function () {
            removeMarker();
          };

          result_list.appendChild(link); // Append the result to the dropdown
        });
      },
    });
  }
}

function zoomTo(object) {
  map.flyTo({
    center: object.geometry.coordinates,
    zoom: 16,
  });
}

// Autocomplete Navigation using Arrow Keys
function map_q_select() {
  const event = window.event || {};
  let suggestions = document
    .getElementById("map_search_results")
    .getElementsByTagName("a");

  if (event.keyCode == 40) {
    // Arrow Down
    suggestionfocus =
      suggestionfocus >= suggestions.length - 1 ? -1 : suggestionfocus + 1;
    map_selectSuggestionFocus(suggestionfocus);
  }

  if (event.keyCode == 38) {
    // Arrow Up
    suggestionfocus =
      suggestionfocus <= 0 ? suggestions.length : suggestionfocus - 1;
    map_selectSuggestionFocus(suggestionfocus);
  }

  if (event.keyCode == 13 && suggestionfocus != -1) {
    // Enter key
    const selected_elem =
      suggestions[suggestionfocus].getElementsByTagName("input");
    const selected_obj = suggestionToObject(selected_elem);
    zoomTo(selected_obj);
    dynamic_Overlay(selected_obj.type, selected_obj.map_category);
    highlightFromSOLR(selected_obj);
    showPopup_formSOLR(selected_obj, selected_obj.coordinates);
    document.getElementById("map_search_results").innerHTML = ""; // Clear after selection
  }
}

function map_selectSuggestionFocus(index) {
  const links = $("#map_search_results").find("a");
  links.removeClass("selected").css("background", "#ffffff");

  if (index >= 0 && index < links.length) {
    const selectedLink = links[index];
    $(selectedLink).addClass("selected").css("background", "#efefef");
    const hiddenInputs = selectedLink.getElementsByTagName("input");
    const selected_obj = suggestionToObject(hiddenInputs);
    document.getElementById("map_search_input").value =
      selectedLink.getElementsByTagName("b")[0].textContent;
    zoomTo(selected_obj);
    addMarker(selected_obj);
  }
}

function suggestionToObject(html_suggestion_hidden) {
  let object = {};
  Array.from(html_suggestion_hidden).forEach((input) => {
    object[input.name] =
      input.name === "coordinates" ? input.value.split(",") : input.value;
  });
  return object;
}

function addMarker(obj) {
  // Add a marker based on the object coordinates
}

function removeMarker() {
  // Remove marker from map
}
