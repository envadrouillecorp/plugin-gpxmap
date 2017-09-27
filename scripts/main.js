var GLoaded = false;
var GLoadedCb = undefined;

function gmapsLoaded() {
   GLoaded = true;
   if(GLoadedCb)
      GLoadedCb();
}

var map;
var bounds;
var nbTracks = 0;
var mapChanged = false;

function rgb2hex(rgb) {
    if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function createMap() {
   var inStyle = [{featureType:"road",elementType:"geometry",stylers:[{lightness:100},{visibility:"simplified"}]},{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#C6E2FF",}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#C5E3BF"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#D1D1B8"}]}];
   var outStyle = [{"featureType":"poi","elementType":"all","stylers":[{"hue":"#000000"},{"saturation":-100},{"lightness":-100},{"visibility":"off"}]},{"featureType":"poi","elementType":"all","stylers":[{"hue":"#000000"},{"saturation":-100},{"lightness":-100},{"visibility":"off"}]},{"featureType":"administrative","elementType":"all","stylers":[{"hue":"#000000"},{"saturation":0},{"lightness":-100},{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"hue":"#000000"},{"saturation":-100},{"lightness":-100},{"visibility":"off"}]},{"featureType":"road.local","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"on"}]},{"featureType": "water", "elementType": "geometry.fill", "stylers": [{"color": rgb2hex($('body').css('background-color'))}]},{"featureType":"transit","elementType":"labels","stylers":[{"hue":"#000000"},{"saturation":0},{"lightness":-100},{"visibility":"off"}]},{"featureType":"landscape","elementType":"labels","stylers":[{"hue":"#000000"},{"saturation":-100},{"lightness":-100},{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"hue":"#bbbbbb"},{"saturation":-100},{"lightness":26},{"visibility":"on"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"hue":"#dddddd"},{"saturation":-100},{"lightness":-3},{"visibility":"on"}]}];

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
   map = new google.maps.Map(document.getElementById("map_canvas"), options);
   bounds = new google.maps.LatLngBounds();


   google.maps.event.addListener(map, 'zoom_changed', function() { 
      var zoomLevel = map.getZoom();
      if(zoomLevel <= 5)
         map.setOptions({styles:outStyle});
      else
         map.setOptions({styles:inStyle});
   });
}

function showTrack(gpx, id) {
   var points = [];

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
   var hues = ['red', 'orange', 'green', 'blue', 'purple', 'pink'];
   var hue = hues[nbTracks%hues.length];
   var poly = new google.maps.Polyline({
      path: points,
      //strokeColor: randomColor({hue:'pink', luminosity:'dark'}),
      strokeColor: randomColor({ hue:hue, luminosity:'dark'}),
      strokeOpacity: .7,
      strokeWeight: 5
   });
   poly.setMap(map);
   nbTracks++;
}


function mainGpx() {
   if(GLoaded == false) {
      GLoadedCb = mainGpx;
      return;
   }

   $("#map_canvas").css('height', ($(window).height() - $('#head').height() - 30)+'px');
   createMap();

   var dirId = 0;
   var nbTracks = 0;
   var nbLoadedTracks = 0;

   function updateLoading() {
      if(nbLoadedTracks != nbTracks) {
         $("#current").text("GPX Map - Loading "+nbLoadedTracks+"/"+nbTracks);
      } else {
         $("#current").text("GPX Map");
      }
   }
   function showGpxs(json, id) {
      var batch = new Batch(ParallelBatch, function() { }, null);
      for(var g = 0; g < json.gpx.length; g++) {
         nbTracks++;
         updateLoading();

         batch.get({action:'gpxmap.get_gpx', 'dir':json.gpx[g].path, 'gpx':json.gpx[g].name}, function(json) {
            if(!json || !json.points) {
               console.log(json);
               return;
            }
            for(var s = 0; s < json.points.length; s++)
               showTrack(json.points[s], id);

            nbLoadedTracks++;
            updateLoading();
         });
      }
      batch.launch();
   }
   function showDirs(dirs) {
      var nb_dirs = dirs.length;
      var batch = new Batch(ParallelBatch, function() { }, null);
      for(var d = 0; d < nb_dirs; d++) {
         (function(id) {
            batch.get({action:'gpxmap.get_dir_content', 'dir':dirs[d].path+'/'+dirs[d].name}, function(json) {
               if(json.dirs.length)
                  showDirs(json.dirs);
               if(json.gpx)
                  showGpxs(json, id);
            });
         })(dirId);
         dirId++;
      }
      batch.launch();
   }
   showDirs([{path:'', name:''}]);
}

$(document).ready(function() { mainGpx() });
