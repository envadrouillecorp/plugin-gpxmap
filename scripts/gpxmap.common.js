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
      var inStyle = [{featureType:"road",elementType:"geometry",stylers:[{lightness:100},{visibility:"simplified"}]},{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#C6E2FF",}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#C5E3BF"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#D1D1B8"}]}];
      var outStyle = [{"featureType":"poi","elementType":"all","stylers":[{"hue":"#000000"},{"saturation":-100},{"lightness":-100},{"visibility":"off"}]},{"featureType":"poi","elementType":"all","stylers":[{"hue":"#000000"},{"saturation":-100},{"lightness":-100},{"visibility":"off"}]},{"featureType":"administrative","elementType":"all","stylers":[{"hue":"#000000"},{"saturation":0},{"lightness":-100},{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"hue":"#000000"},{"saturation":-100},{"lightness":-100},{"visibility":"off"}]},{"featureType":"road.local","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"on"}]},{"featureType": "water", "elementType": "geometry.fill", "stylers": [{"color": GpxMapCommon.rgb2hex($('body').css('background-color'))}]},{"featureType":"transit","elementType":"labels","stylers":[{"hue":"#000000"},{"saturation":0},{"lightness":-100},{"visibility":"off"}]},{"featureType":"landscape","elementType":"labels","stylers":[{"hue":"#000000"},{"saturation":-100},{"lightness":-100},{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"hue":"#bbbbbb"},{"saturation":-100},{"lightness":26},{"visibility":"on"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"hue":"#dddddd"},{"saturation":-100},{"lightness":-3},{"visibility":"on"}]}];

      var options = {
         center: new google.maps.LatLng(22.593726063929346, 14.23828125),
         zoom: 2,
         scaleControl: true,
         mapTypeId: google.maps.MapTypeId.TERRAIN,
         gestureHandling: 'greedy',
         styles: outStyle,
         backgroundColor: 'hsla(0, 0, 255, 100)',
         disableDefaultUI: true,
         mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.ROADMAP],
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
         },
      };
      GpxMapCommon.map = new google.maps.Map(document.getElementById("map_canvas"), options);


      google.maps.event.addListener(GpxMapCommon.map, 'zoom_changed', function() { 
         var zoomLevel = GpxMapCommon.map.getZoom();
         if(zoomLevel <= 5)
            GpxMapCommon.map.setOptions({styles:outStyle});
         else
            GpxMapCommon.map.setOptions({styles:inStyle});
      });
   },

   showTrack: function(gpx, id) {
      var points = [];
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
      }

      /* Draw track */
      var hues = ['red', 'orange', 'green', 'blue', 'purple', 'pink'];
      var hue = hues[GpxMapCommon.nbTracks%hues.length];
      poly = new google.maps.Polyline({
         path: points,
         strokeColor: randomColor({ hue:hue, luminosity:'dark'}),
         strokeOpacity: .7,
         strokeWeight: 5
      });
      poly.setMap(GpxMapCommon.map);
      GpxMapCommon.nbTracks++;

      return poly;
   }
};
