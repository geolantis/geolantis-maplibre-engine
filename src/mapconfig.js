var mapConfig = {
  backgroundMaps: {
    Global: {
      name: "Global",
      style:
        "https://api.maptiler.com/maps/streets-v2/style.json?key=ldV32HV5eBdmgfE7vZJI",
      label: "Global",
      type: "vtc",
      flag: "🌐",
    },
    Global2: {
      name: "Global2",
      style:
        "https://maps.clockworkmicro.com/streets/v1/style?x-api-key=9G4F5b99xO28esL8tArIO2Bbp8sGhURW5qIieYTy",
      label: "Global 2",
      type: "vtc",
      flag: "🌐",
    },
    Landscape: {
      name: "Landscape",
      style:
        "https://api.maptiler.com/maps/landscape/style.json?key=ldV32HV5eBdmgfE7vZJI",
      label: "Landscape",
      type: "vtc",
      flag: "🌐",
    },
    Ocean: {
      name: "Ocean",
      style:
        "https://api.maptiler.com/maps/ocean/style.json?key=ldV32HV5eBdmgfE7vZJI",
      label: "Ocean",
      type: "vtc",
      flag: "🌐",
    },
    Outdoor: {
      name: "Outdoor",
      style:
        "https://api.maptiler.com/maps/outdoor-v2/style.json?key=ldV32HV5eBdmgfE7vZJI",
      label: "Outdoor",
      type: "vtc",
      flag: "🌐",
    },
    Dataviz: {
      name: "Dataviz",
      style:
        "https://api.maptiler.com/maps/dataviz/style.json?key=ldV32HV5eBdmgfE7vZJI",
      label: "Dataviz",
      type: "vtc",
      flag: "🌐",
    },
    OSMLiberty: {
      name: "OSMLiberty",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/osmliberty.json",
      label: "OSM Liberty",
      type: "vtc",
      flag: "🌐",
    },
    OSMBright: {
      name: "OSMBright",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/osmliberty.json",
      label: "OSM Bright",
      type: "vtc",
      flag: "🌐",
    },
    OSM3D: {
      name: "OSM3D",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/maptiler3d.json",
      label: "OSM 3D",
      type: "vtc",
      flag: "🌐",
    },

    GlobalSat: {
      name: "GlobalSat",
      style:
        "https://api.maptiler.com/maps/satellite/style.json?key=ldV32HV5eBdmgfE7vZJI",
      label: "Global Satellite",
      type: "vtc",
      flag: "🌐",
    },
    "Basemap Standard": {
      name: "Basemap Standard",
    style: "https://gis.ktn.gv.at/osgdi/styles/basemap_ktn_vektor.json",
      country: "Austria",
      flag: "🇦🇹",
      label: "Basemap Standard",
      type: "vtc",
    },
    "Basemap Grau": {
      name: "Basemap Grau",
      style: "https://gis.ktn.gv.at/osgdi/styles/basemap_grau_ktn_vektor.json",
      country: "Austria",
      flag: "🇦🇹",
      label: "Basemap Grau",
      type: "vtc",
    },
    "Basemap Ortho": {
      name: "Basemap Ortho",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/basemap-ortho.json",
      country: "Austria",
      flag: "🇦🇹",
      label: "Basemap Ortho",
      type: "vtc",
    },
    BEVLight: {
      name: "BEVLight",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/kataster-light.json",
      country: "Austria",
      flag: "🇦🇹",
      label: "BEV Light",
      type: "vtc",
    },
    BEVOrtho: {
      name: "BEVOrtho",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/kataster-ortho.json",
      country: "Austria",
      flag: "🇦🇹",
      label: "BEV Ortho",
      type: "vtc",
    },

    "Basemap Ortho Blue": {
      name: "Basemap Ortho Blue",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/basemap-ortho-blue.json",
      country: "Austria",
      flag: "🇦🇹",
      label: "Basemap Ortho Blue",
      type: "vtc",
    },
    Orthofoto: {
      name: "Orthofoto",
      tiles: [
        "https://mapsneu.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg",
      ],
      country: "Austria",
      flag: "🇦🇹",
      label: "Orthofoto",
      type: "wmts",
    },
    "BEV Ortho": {
      name: "BEV Ortho",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/bev-katasterlight.json",
      country: "Austria",
      flag: "🇦🇹",
      type: "vtc",
      label: "BEV Ortho",
    },
    "Basemap.at": {
      name: "basemap.at",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/basemap-at-new.json",
      country: "Austria",
      flag: "🇦🇹",
      type: "vtc",
      label: "basemap.at",
    },
    Agrar: {
      name: "Agrar",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/agraratlas.json",
      country: "Austria",
      flag: "🇦🇹",
      type: "vtc",
      label: "Agrar Atlas",
    },
    basemapcustom2: {
      name: "basemapcustom2",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/basemap2.json",
      country: "Austria",
      flag: "🇦🇹",
      type: "vtc",
      label: "Basemap 1",
    },
    basemapcustom3: {
      name: "basemapcustom3",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/basemap3.json",
      country: "Austria",
      flag: "🇦🇹",
      type: "vtc",
      label: "Basemap 2",
    },
    basemapcustom4: {
      name: "basemapcustom4",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/basemap7.json",
      country: "Austria",
      flag: "🇦🇹",
      type: "vtc",
      label: "Basemap 3",
    },
    //

    "Basemap DE": {
      name: "Basemap DE",
      style:
        "https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_top.json",
      country: "Germany",
      flag: "🇩🇪",
      type: "vtc",
      label: "Basemap DE",
    },
    "DE-Brandenburg": {
      name: "Brandenburg DE",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/de_brandenburg.json",
      country: "Germany",
      flag: "🇩🇪",
      type: "vtc",
      label: "DE Brandenburg",
    },
    TopPlusOpen: {
      name: "Germany TopPlusOpen",
      tiles: [
        "https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_scale/default/WEBMERCATOR/{z}/{y}/{x}.png",
      ],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 18,
      attribution: "© BKG (GeoBasis-DE)",
      label: "TopPlusOpen (Germany)",
      type: "wmts",
      flag: "🇩🇪",
    },
    "NL Topo": {
      name: "NL Topo",
      style:
        "https://api.maptiler.com/maps/nl-cartiqo-topo/style.json?key=ldV32HV5eBdmgfE7vZJI",
      country: "Netherlands",
      flag: "🇳🇱",
      type: "vtc",
      label: "NL Topo",
    },
    "NL Luchtfoto": {
      name: "NL Luchtfoto",
      tiles: [
        "https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0/Actueel_ortho25/EPSG:3857/{z}/{x}/{y}.jpeg",
      ],
      tileSize: 256,
      attribution: "© PDOK, Luchtfoto",
      country: "Netherlands",
      type: "wmts",
      flag: "🇳🇱",
      label: "NL Luchtfoto",
    },
    BelgiumOrtho: {
      name: "Belgium Ortho",
      type: "raster",
      tiles: [
        "https://wmts.ngi.be/inspire/ortho/1.0.0/Ortho/GoogleMapsCompatible/{z}/{y}/{x}.jpeg",
      ],
      tileSize: 256,
      type: "wmts",
      attribution: "© NGI Belgium",
      maxzoom: 18,
      minzoom: 0,
      country: "Belgium",
      flag: "🇧🇪",
      label: "Belgium Ortho",
    },
    Switzerland: {
      name: "Switzerland",
      style:
        "https://api.maptiler.com/maps/cadastre-satellite/style.json?key=ldV32HV5eBdmgfE7vZJI",
      country: "Switzerland",
      flag: "🇨🇭",
      type: "vtc",
      label: "Switzerland",
    },
    SwisstopoLight: {
      name: "SwisstopoLight",
      style:
        "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte.vt/style.json",
      country: "Switzerland",
      flag: "🇨🇭",
      type: "vtc",
      label: "Swiss Topo Light",
    },
    Swisstopo: {
      name: "Swisstopo",
      style:
        "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.basemap.vt/style.json",
      country: "Switzerland",
      flag: "🇨🇭",
      type: "vtc",
      label: "Swiss Topo",
    },
    SwisstopoLightWinter: {
      name: "SwisstopoLightWinter",
      style:
        "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.basemap-winter.vt/style.json",
      country: "Switzerland",
      flag: "🇨🇭",
      type: "vtc",
      label: "Swiss Topo Winter",
    },

    SwisstopoSat: {
      name: "SwisstopoSat",
      style:
        "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.imagerybasemap.vt/style.json",
      country: "SwisstopoSat",
      flag: "🇨🇭",
      type: "vtc",
      label: "Swiss Topo Satellite",
    },

    OSGB: {
      name: "OSGB",
      style:
        "https://api.os.uk/maps/vector/v1/vts/resources/styles?srs=3857&key=dclksBdD441tZWuokDrxjRsw7Syr4nRS",
      country: "United Kingdom",
      flag: "🇬🇧",
      type: "vtc",
      label: "OSGB",
    },
    OSGBGrey: {
      name: "OSGBGrey",
      style:
        "https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/refs/heads/main/OS_VTS_3857_Light.json?key=dclksBdD441tZWuokDrxjRsw7Syr4nRS",
      country: "United Kingdom",
      flag: "🇬🇧",
      type: "vtc",
      label: "OSGB Grey",
    },

    Luxembourg: {
      name: "Luxembourg",
      style:
        "https://vectortiles-mobiliteit.geoportail.lu/styles/roadmap_jsapi/style.json",
      label: "Luxembourg",
      flag: "🇱🇺",
      attribution: "© Geoportail Luxembourg",
      type: "vtc",
      maxzoom: 24,
    },
    LuxembourgRoadmap: {
      name: "Luxembourg Roadmap",
      style:
        "https://vectortiles-mobiliteit.geoportail.lu/styles/topomap/style.json",
      label: "Luxembourg Roadmap",
      flag: "🇱🇺",
      attribution: "© Geoportail Luxembourg",
      type: "vtc",
      maxzoom: 24,
    },
    LuxembourgTopo: {
      name: "Luxembourg Topo",
      style:
        "https://vectortiles-mobiliteit.geoportail.lu/styles/topomap_gray/style.json",
      label: "Luxembourg Topo",
      flag: "🇱🇺",
      attribution: "© Geoportail Luxembourg",
      type: "vtc",
      maxzoom: 24,
    },
    LuxembourgMobiliteit: {
      name: "Luxembourg Mobiliteit",
      style:
        "https://vectortiles-mobiliteit.geoportail.lu/styles/vectortiles_mobiliteit.lu/style.json",
      label: "Luxembourg Mobiliteit",
      flag: "🇱🇺",
      attribution: "© Geoportail Luxembourg",
      type: "vtc",
      maxzoom: 24,
    },
    FranceAerial: {
      name: "France Aerial",
      type: "raster",
      tiles: [
        "https://data.geopf.fr/wmts?&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/jpeg&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}",
      ],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 24,
      attribution: "IGN-F/Geoportail",
      label: "France Aerial",
      flag: "🇫🇷",
    },
    "France Vector": {
      name: "France Vector",
      type: "vtc",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/plan_ign.json",

      attribution: "IGN-F/Geoportail",
      label: "France Vector",
      flag: "🇫🇷",
    },

    "France Admin Express": {
      name: "France Admin Express",
      tiles: [
        "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ADMINEXPRESS-COG.LATEST&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg",
      ],
      tileSize: 256,
      maxzoom: 18,
      label: "France Admin Express",
      attribution: "© IGN-F/Geoportail",
      type: "wmts",
      flag: "🇫🇷",
    },
    "France Cadastral Parcels": {
      name: "France Cadastral Parcels",
      tiles: [
        "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=CADASTRALPARCELS.PARCELS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg",
      ],
      tileSize: 256,
      maxzoom: 18,
      label: "Cadastral Parcels",
      attribution: "© IGN-F/Geoportail",
      type: "wmts",
      flag: "🇫🇷",
    },
    NZ: {
      name: "NZ",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/nz-basemap-topographic.json",
      country: "New Zealand",
      flag: "🇳🇿",
      type: "vtc",
      label: "NZ",
    },
    NZTopoOrtho: {
      name: "NZTopoOrtho",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/nz-topolite-ortho.json",
      country: "New Zealand",
      flag: "🇳🇿",
      type: "vtc",
      label: "NZ Topo Ortho",
    },

    NZOrtho: {
      name: "NZ Ortho",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/nzortho.json",
      country: "New Zealand",
      flag: "🇳🇿",
      type: "vtc",
      label: "NZ Ortho",
    },
    NLSTaustakartta: {
      name: "NLS Finland Cadaster",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/kiinteistojaotus-taustakartalla.json",
      label: "NLS Finland Cadaster",
      attribution: "© National Land Survey of Finland",
      country: "Finland",
      type: "vtc",
      flag: "🇫🇮",
    },
    ICGCOrtho: {
      name: "ICGCOrtho",
      style: "https://geoserveis.icgc.cat/contextmaps/icgc_orto_estandard.json",
      country: "Spain (Catalunya)",
      type: "vtc",
      flag: "🇪🇸",
      label: "ICGC (Catalunya) Ortho",
    },
    ICGCStandard: {
      name: "ICGCStandard",
      style: "https://geoserveis.icgc.cat/contextmaps/icgc.json",
      country: "Spain (Catalunya)",
      type: "vtc",
      flag: "🇪🇸",
      label: "ICGC (Catalunya) Standard",
    },
    VictoriaWMTS: {
      name: "Victoria Imagery",
      type: "raster",
      tiles: [
        "https://base.maps.vic.gov.au/service/wmts/1.0.0/AERIAL_WM/default/EPSG:3857/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 24,
      label: "Victoria Imagery",
      attribution: "© Vicmap, State of Victoria",
      country: "Australia",
      flag: "🇦🇺",
    },
    "NSW BaseMap": {
      name: "NSW BaseMap",
      type: "vector-esri",
      url: "https://portal.spatial.nsw.gov.au/vectortileservices/rest/services/Hosted/NSW_BaseMap_VectorTile/VectorTileServer",
      styleUrl:
        "https://portal.spatial.nsw.gov.au/vectortileservices/rest/services/Hosted/NSW_BaseMap_VectorTile/VectorTileServer/resources/styles/root.json",
      label: "NSW BaseMap",
      country: "Australia",
      flag: "🇦🇺",
      attribution: "NSW Spatial Services",
    },
    NSWImagery: {
      name: "NSW Imagery",
      type: "raster",
      tiles: [
        "https://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Imagery/MapServer/WMTS/tile/1.0.0/NSW_Imagery/default/GoogleMapsCompatible/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 24,
      label: "NSW Imagery",
      country: "Australia",
      flag: "🇦🇺",
    },
    QueenslandWMTS: {
      name: "Queensland Aerial",
      type: "raster",
      tiles: [
        "https://spatial-img.information.qld.gov.au/arcgis/rest/services/Basemaps/LatestStateProgram_AllUsers/ImageServer/WMTS/tile/1.0.0/Basemaps_LatestStateProgram_AllUsers/default/GoogleMapsCompatible/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 24, // Set higher zoom level for deeper zoom
      label: "Queensland Aerial",
      country: "Australia",
      flag: "🇦🇺",
    },
    WAImagery: {
      name: "WA Imagery",
      type: "raster",
      url: "https://services.slip.wa.gov.au/public/services/SLIP_Public_Services/Locate/MapServer/WMSServer",
      layers: "1",
      type: "wms",
      format: "image/png",
      version: "1.1.1",
      tileSize: 256,
      maxzoom: 19,
      flag: "🇦🇺",
      label: "WA Imagery",
    },
    TasmaniaOrtho: {
      name: "Tasmania Orthophoto",
      type: "raster",
      tiles: [
        "https://services.thelist.tas.gov.au/arcgis/rest/services/Basemaps/Orthophoto/MapServer/WMTS/tile/1.0.0/Orthophoto/default/GoogleMapsCompatible/{z}/{y}/{x}.jpeg",
      ],
      tileSize: 256,
      attribution: "© The LIST, Tasmania",
      maxzoom: 19,
      minzoom: 0,
      label: "Tasmania Orthophoto",
      flag: "🇦🇺",
    },
    "QLD Aerial WMTS": {
      name: "QLD Aerial WMTS",
      type: "raster",
      tiles: [
        "https://spatial-img.information.qld.gov.au/arcgis/rest/services/Basemaps/LatestStateProgram_AllUsers/ImageServer/WMTS/tile/1.0.0/Basemaps_LatestStateProgram_AllUsers/default/GoogleMapsCompatible/{z}/{y}/{x}.jpeg",
      ],
      tileSize: 256,
      attribution: "© Queensland Government",
      maxzoom: 18,
      minzoom: 0,
      country: "Australia",
      flag: "🇦🇺",
      label: "QLD Aerial",
    },
    BCImagery: {
      name: "BC Imagery",
      type: "wms",
      url: "https://openmaps.gov.bc.ca/geo/pub/WHSE_IMAGERY_AND_BASE_MAPS.GSR_ORTHOIMAGERY_MOSAIC_2022/ows",
      layers: "WHSE_IMAGERY_AND_BASE_MAPS.GSR_ORTHOIMAGERY_MOSAIC_2022",
      format: "image/png",
      transparent: true,
      version: "1.1.1",
      tileSize: 256,
      minzoom: 0,
      maxzoom: 18,
      attribution: "© Province of British Columbia",
      label: "BC Imagery 2022",
      flag: "🇨🇦",
      country: "Canada"
    },
    "Google Roadmap": {
      name: "Google Roadmap",
      style: `https://maps.googleapis.com/maps/api/style/v1?style=roadmap&key=AIzaSyAkLRqGt0fFyaJMkDS1UyRt8j6M4XAQuog`,
      label: "Google Roadmap",
      flag: "🌐",
    },
    "Google Satellite": {
      name: "Google Satellite",
      style: `https://maps.googleapis.com/maps/api/style/v1?style=satellite&key=AIzaSyAkLRqGt0fFyaJMkDS1UyRt8j6M4XAQuog`,
      label: "Google Satellite",
      flag: "🌐",
    },
  },
  overlayMaps: {
    Kataster: {
      name: "Kataster",
      tileset: "https://gis.ktn.gv.at/osgdi/tilesets/gst_bev.json",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/kataster.json",
      selectLayer: "gst_bev_fill",
      country: "Austria",
      flag: "🇦🇹",
      label: "Kataster",
    },
    "Kataster BEV": {
      name: "Kataster BEV",
      tileset: "https://kataster.bev.gv.at/styles/kataster/tiles.json",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/kataster-bev2.json",
      extra_sprite: "https://kataster.bev.gv.at/styles/sprite",
      selectLayer: "Grundstücke - Flächen",
      country: "Austria",
      flag: "🇦🇹",
      label: "Kataster BEV",
    },
    "Kataster BEV2": {
      name: "Kataster BEV2",
      tileset: "https://kataster.bev.gv.at/styles/kataster/tiles.json",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/kataster-bev.json",
      extra_sprite: "https://kataster.bev.gv.at/styles/sprite",
      selectLayer: "Grundstücke - Flächen",
      country: "Austria",
      flag: "🇦🇹",
      label: "Kataster BEV2",
    },

    "Kataster OVL": {
      name: "Kataster OVL",
      tileset: "https://kataster.bev.gv.at/styles/kataster/tiles.json",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/ovl-kataster.json",
      extra_sprite: "https://kataster.bev.gv.at/styles/sprite",
      selectLayer: "Grundstücke - Flächen",
      country: "Austria",
      flag: "🇦🇹",
      label: "Kataster Grau Overlay",
    },

    dkm_bev_symbole: {
      name: "dkm_bev_symbole",
      tileset: "https://kataster.bev.gv.at/styles/symbole/tiles.json",
      style: "https://gis.ktn.gv.at/osgdi/styles/BEV_kataster_symbole.json",
      extra_sprite: "https://kataster.bev.gv.at/styles/sprite",
      country: "Austria",
      flag: "🇦🇹",
      label: "dkm_bev_symbole",
    },
    flawi: {
      name: "flawi",
      tileset: "https://gis.ktn.gv.at/osgdi/tilesets/flawi.json",
      style: "https://gis.ktn.gv.at/osgdi/styles//flaewi_ktn.json",
      extra_sprite: "https://kataster.bev.gv.at/styles/sprite",
      country: "Austria",
      flag: "🇦🇹",
      label: "flawi",
    },
    gefahr: {
      name: "gefahr",
      tileset: "https://gis.ktn.gv.at/osgdi/tilesets/overlay_wasser.json",
      style:
        "https://gis.ktn.gv.at/osgdi/styles/overlaystyle_wasser_schutz.json",
      extra_sprite: "https://kataster.bev.gv.at/styles/sprite",
      country: "Austria",
      flag: "🇦🇹",
      label: "gefahr",
    },
    NZParcels: {
      name: "NZParcels",
      tileset:
        "https://basemaps.linz.govt.nz/v1/tiles/topographic/EPSG:3857/tile.json?api=c01j9kgtq3hq9yb59c22gnr6k64",
      style:
        "https://raw.githubusercontent.com/geolantis/basemap/refs/heads/main/nz-parcels.json",
      extra_sprite: "https://basemaps.linz.govt.nz/v1/sprites/topographic",
      selectLayer: "Parcels-Ln",
      country: "New Zealand",
      flag: "🇳🇿",
      label: "NZ Parcels",
    },
    // Add to overlayMaps section (at the end)
    "NSW BaseMap Overlay": {
      name: "NSW BaseMap Overlay",
      url: "https://portal.spatial.nsw.gov.au/vectortileservices/rest/services/Hosted/NSW_BaseMap_VectorTile/VectorTileServer",
      styleUrl:
        "https://portal.spatial.nsw.gov.au/vectortileservices/rest/services/Hosted/NSW_BaseMap_VectorTile/VectorTileServer/resources/styles/root.json",
      country: "Australia",
      flag: "🇦🇺",
      label: "NSW BaseMap",
      attribution: "NSW Spatial Services",
      popupLayers: [], // Will be populated from style JSON
    },
    "Inspire WMS": {
      name: "Inspire WMS",
      type: "wms",
      url: "http://wsa.bev.gv.at/GeoServer/Interceptor/Wms/CP/INSPIRE_KUNDEN-2375336d-49b8-4e62-8640-6d6668ba100a",
      layers: "CP.CadastralParcel_Parcel",
      format: "image/png",
      transparent: true,
      version: "1.3.0",
      country: "Austria",
      flag: "🇦🇹",
      label: "Inspire WMS",
    },
    "BEV DKM GST": {
      name: "BEV DKM GST",
      type: "wms",
      url: "https://data.bev.gv.at/geoserver/BEVdataKAT/wms",
      layers: "KAT_DKM_GST",
      format: "image/png",
      transparent: true,
      version: "1.3.0",
      country: "Austria",
      flag: "🇦🇹",
      label: "BEV DKM GST",
    },
  },
};
