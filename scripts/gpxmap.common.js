var GpxMapCommon = {
   map: undefined,
   polyLines:[],
   defaultColor:[],
   nbTracks:0,

   createMap:function(cb) {
      GpxMapCommon.nbTracks = 0;
      $script('admin/pages/gpxmap/scripts/randomcolors.js?'+Math.random(), 'randomcolors', function() {
         $script('admin/pages/gpx/scripts/jgallery.gpx.js?'+Math.random(), 'gpx', function() {
            var m = new map({}, {mapDiv:"map_canvas_gpxmap"});
            m.loadLeaflet(function() {
               $('#map_canvas_gpxmap').removeClass('canvas_loading');

               /* Show the map */
               m.showMap();
               m.fitBounds(true);
               $('.leaflet-right').css('right', '40px');
               GpxMapCommon.map = m;

               cb(m);
            });
         });
      });
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
   }
};
