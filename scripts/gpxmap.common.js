var GpxMapCommon = {
   map: undefined,
   polyLines:[],
   defaultColor:[],
   nbTracks:0,

   createMap:function(cb) {
      GpxMapCommon.nbTracks = 0;
      $script('admin/pages/gpxmap/scripts/randomcolors.js', 'randomcolors', function() {
         $script('admin/pages/gpx/scripts/jgallery.gpx.js', 'gpx', function() {
            var m = new map({}, {mapDiv:"map_canvas_gpxmap"});
            m.loadLeaflet(function() {
               $('#map_canvas_gpxmap').removeClass('canvas_loading');

               /* Show the map */
               m.showMap();
               m.fitBounds(true);
               $('.leaflet-right').css('right', '40px');
               GpxMapCommon.map = m;
               GpxMapCommon.loadLeafletMeasure();
               cb(m);
            });
         });
      });
   },

   defaultLayer:undefined,
   addLayers: function() {
		if(!config.gpxmap_default_map)
			config.gpxmap_default_map = 'CartoDB';
      if(GpxMapCommon.map.layers[config.gpxmap_default_map])
         GpxMapCommon.defaultLayer = GpxMapCommon.map.layers[config.gpxmap_default_map];
      else
         GpxMapCommon.defaultLayer = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png", {attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'});

      GpxMapCommon.map.map.removeLayer(GpxMapCommon.map.getCurrentTileLayers()[0]);
      GpxMapCommon.defaultLayer.addTo(GpxMapCommon.map.map);
   },

   showTrack: function(gpx, id) {
      var points = [];
      var bounds = new L.latLngBounds;
      var poly;

      if(!gpx)
         return;

      /* Get points */
      for(var i = 0; i < gpx.length; i++) {
         var lat = gpx[i][0];
         var lon = gpx[i][1];
         if(isNaN(lat) || isNaN(lon)) {
            console.log("error "+lat+"+"+lon);
            break;
         }
         var p = new L.LatLng(lat, lon);
         points.push(p);
         bounds.extend(p);
      }

      /* Draw track */
      var hues = ['red', 'blue', 'purple', 'pink'];
      var hue = hues[GpxMapCommon.nbTracks%hues.length];
      var color = randomColor({ hue:hue, luminosity:'dark'});

      poly = new L.Polyline(points, {
         color: color,
         opacity: .7,
         weight: 4
      });
      poly.addTo(GpxMapCommon.map.map);
      GpxMapCommon.nbTracks++;
      GpxMapCommon.polyLines.push(poly);
      GpxMapCommon.defaultColor.push(color);

      return {poly:poly, bounds:bounds};
   },

    /* Load the measuring tool */
   loadLeafletMeasure:function(cb) {
      jGallery.addCss("admin/pages/gpxmap/css/Leaflet.PolylineMeasure.css", "PolylineMeasureCss", function() {
         $script('admin/pages/gpxmap/scripts/Leaflet.PolylineMeasure.js', 'PolylineMeasureJs', function() {
            L.control.polylineMeasure({position:'topleft', unit:'metres', showBearings:false, clearMeasurementsOnStop: false, showClearControl: true, showUnitControl: false}).addTo(GpxMapCommon.map.map);
            if(cb)
               cb();
         });
      });
   },
};
