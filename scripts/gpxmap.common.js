var GpxMapCommon = {
   GLoaded: false,
   GLoadedCb: undefined,

   gmapsLoaded: function() {
      GpxMapCommon.GLoaded = true;
      if(GpxMapCommon.GLoadedCb)
         GpxMapCommon.GLoadedCb();
   },

   map: undefined,
   nbTracks: 0,

   rgb2hex: function(rgb) {
      if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

      rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      function hex(x) {
         return ("0" + parseInt(x).toString(16)).slice(-2);
      }
      return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
   },

   createMap: function() {
      // Alternate between a very dark google style when dezoomed to the OSM layers when zoomed.
      // Google has a much better rendering of the earth, while OSM is better suited to display tracks (less intrusive text, better colors + glacier display).
      var outStyle = [{"featureType":"poi","elementType":"all","stylers":[{"hue":"#000000"},{"saturation":-100},{"lightness":-100},{"visibility":"off"}]},{"featureType":"poi","elementType":"all","stylers":[{"hue":"#000000"},{"saturation":-100},{"lightness":-100},{"visibility":"off"}]},{"featureType":"administrative","elementType":"all","stylers":[{"hue":"#000000"},{"saturation":0},{"lightness":-100},{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"hue":"#000000"},{"saturation":-100},{"lightness":-100},{"visibility":"off"}]},{"featureType":"road.local","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"on"}]},{"featureType": "water", "elementType": "geometry.fill", "stylers": [{"color": GpxMapCommon.rgb2hex($('body').css('background-color'))}]},{"featureType":"transit","elementType":"labels","stylers":[{"hue":"#000000"},{"saturation":0},{"lightness":-100},{"visibility":"off"}]},{"featureType":"landscape","elementType":"labels","stylers":[{"hue":"#000000"},{"saturation":-100},{"lightness":-100},{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"hue":"#bbbbbb"},{"saturation":-100},{"lightness":26},{"visibility":"on"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"hue":"#dddddd"},{"saturation":-100},{"lightness":-3},{"visibility":"on"}]}];

      var options = {
         center: new google.maps.LatLng(22.593726063929346, 14.23828125),
         zoom: 2,
         scaleControl: true,
         mapTypeId: google.maps.MapTypeId.TERRAIN,
         gestureHandling: 'greedy',
         styles: outStyle,
         backgroundColor: 'hsla(0, 0, 255, 100)',
         mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.ROADMAP],
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
         },
      };
      GpxMapCommon.map = new google.maps.Map(document.getElementById("map_canvas"), options);
      GpxMapCommon.map.mapTypes.set("OSM", new google.maps.ImageMapType({
         getTileUrl: function(coord, zoom) {
            var tilesPerGlobe = 1 << zoom;
            var x = coord.x % tilesPerGlobe;
            if (x < 0) {
               x = tilesPerGlobe+x;
            }
            return "http://tile.openstreetmap.org/" + zoom + "/" + x + "/" + coord.y + ".png";
         },
         tileSize: new google.maps.Size(256, 256),
         name: "OpenStreetMap",
         maxZoom: 18
      }));


      google.maps.event.addListener(GpxMapCommon.map, 'zoom_changed', function() { 
         var zoomLevel = GpxMapCommon.map.getZoom();
         if(zoomLevel <= 7)
            GpxMapCommon.map.setOptions({styles:outStyle, mapTypeId: google.maps.MapTypeId.TERRAIN});
         else
            GpxMapCommon.map.setOptions({mapTypeId: "OSM"});
      });
   },

   showTrack: function(gpx, id) {
      var points = [];
      var bounds = new google.maps.LatLngBounds();
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
         var p = new google.maps.LatLng(lat, lon);
         points.push(p);
         bounds.extend(p);
      }

      /* Draw track */
      var hues = ['red', 'blue', 'purple', 'pink'];
      var hue = hues[GpxMapCommon.nbTracks%hues.length];
      poly = new google.maps.Polyline({
         path: points,
         strokeColor: randomColor({ hue:hue, luminosity:'dark'}),
         strokeOpacity: .7,
         strokeWeight: 5
      });
      poly.setMap(GpxMapCommon.map);
      GpxMapCommon.nbTracks++;

      return {poly:poly, bounds:bounds};
   }
};
