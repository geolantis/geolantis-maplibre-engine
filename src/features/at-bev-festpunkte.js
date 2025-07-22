/*  
    --------------------------------------------------------------
    Adds click-to-query support for BEV “Festpunkte” control points
    to any Maplibre-GL map available from
       – App.Map.Init.getMap()     (your framework)
       – or window.map            (fallback)
    Works in old WebViews: 
    -------------------------------------------------------------- */
(function () {
  /* ---------- configuration ---------- */
  var API = "https://kataster.bev.gv.at/api";
  var SOURCE_ID = "bev-festpunkte";

  /* ---------- helpers ---------- */
  function httpGetJSON(url, done, err) {
    if (window.fetch) {
      fetch(url, { headers: { accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.json();
        })
        .then(done)
        ["catch"](err);
    } else {
      /* basic XHR fallback */
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (xhr.status >= 200 && xhr.status < 300) {
          done(JSON.parse(xhr.responseText));
        } else {
          err(new Error(xhr.status));
        }
      };
      xhr.send(null);
    }
  }

  function fetchClosest(lon, lat, done, err) {
    var url = API + "/fpt/getClosestPoints?center=" + lon + "," + lat;
    httpGetJSON(url, done, err);
  }

  function pointPopupHTML(p) {
    var pdf = API + "/fpt/getPointCard?uuid=" + p.pkuid;
    return (
      "<strong>Punkt&nbsp;" +
      p.punktnr +
      "</strong><br>" +
      "GK&nbsp;X:&nbsp;" +
      p.x +
      "&nbsp;&nbsp;Y:&nbsp;" +
      p.y +
      "<br>" +
      "H:&nbsp;" +
      (p.h !== undefined ? p.h : "–") +
      "&nbsp;m<br>" +
      '<a href="' +
      pdf +
      '" target="_blank" rel="noopener">Punktkarte&nbsp;(PDF)</a>'
    );
  }

  /* ---------- layer set-up ---------- */
  function ensureFestpunktLayer(map) {
    if (map.getSource(SOURCE_ID)) return;

    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });

    map.addLayer({
      id: SOURCE_ID,
      type: "circle",
      source: SOURCE_ID,
      paint: {
        "circle-radius": 6,
        "circle-color": "#f30",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fff",
      },
    });

    map.on("click", SOURCE_ID, function (e) {
      var f = e.features && e.features[0];
      if (!f) return;
      new maplibregl.Popup()
        .setLngLat(f.geometry.coordinates)
        .setHTML(pointPopupHTML(f.properties))
        .addTo(map);
    });

    map.on("mouseenter", SOURCE_ID, function () {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", SOURCE_ID, function () {
      map.getCanvas().style.cursor = "";
    });
  }

  /* ---------- main integration ---------- */
  function attachFestpunktSupport(map) {
    ensureFestpunktLayer(map);

    map.on("click", function (e) {
      var lng = e.lngLat.lng;
      var lat = e.lngLat.lat;

      fetchClosest(
        lng,
        lat,
        function (geo) {
          /* success */
          map.getSource(SOURCE_ID).setData(geo);

          /* optional: zoom to the returned points */
          if (geo.features.length) {
            var bounds = new maplibregl.LngLatBounds(
              geo.features[0].geometry.coordinates,
              geo.features[0].geometry.coordinates
            );
            for (var i = 1; i < geo.features.length; i++) {
              bounds.extend(geo.features[i].geometry.coordinates);
            }
            map.fitBounds(bounds, { padding: 60, duration: 600 });
          }
        },
        function (error) {
          /* failure */
          console.error("Festpunkt query failed:", error);
        }
      );
    });
  }

  /* ---------- bootstrap once map exists ---------- */
  (function waitForMap() {
    var map = null;

    if (
      window.App &&
      App.Map &&
      App.Map.Init &&
      typeof App.Map.Init.getMap === "function"
    ) {
      map = App.Map.Init.getMap();
    }
    if (!map && window.map) map = window.map;

    if (map && (map.isStyleLoaded ? map.isStyleLoaded() : map.loaded())) {
      attachFestpunktSupport(map);
    } else if (map) {
      map.once("load", function () {
        attachFestpunktSupport(map);
      });
    } else {
      setTimeout(
        waitForMap,
        200
      ); /* try again until your app created the map */
    }
  })();
})();
