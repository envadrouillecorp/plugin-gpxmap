var GpxMapCommon = {
   map: undefined,
   polyLines:[],
   defaultColor:[],


   rgb2hex: function(rgb) {
      if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

      rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      function hex(x) {
         return ("0" + parseInt(x).toString(16)).slice(-2);
      }
      return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
   },

   /*addStyle(name, url) {
      GpxMapCommon.map.mapTypes.set(name, new google.maps.ImageMapType({
         getTileUrl: function(coord, zoom) {
            var tilesPerGlobe = 1 << zoom;
            var x = coord.x % tilesPerGlobe;
            if (x < 0) {
               x = tilesPerGlobe+x;
            }
            return url(zoom, x, coord.y);
         },
         tileSize: new google.maps.Size(256, 256),
         name: name,
         maxZoom: 18
      }));
   },*/

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
