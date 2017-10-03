var GpxMapPlugin = {
   loaded:0,

   want:function(action) {
      return action == "map";
   },

   handle:function(action) {
      if(GpxMapPlugin.loaded != 3) {
         // problem with the async gmap and the loading that might have taken place elsewhere!
         $script('./admin/pages/gpxmap/scripts/gpxmap.common.js', 'gpxmap', GpxMapPlugin.ready);
         $script('./admin/pages/gpxmap/scripts/randomcolors.js', 'randomcolors', GpxMapPlugin.ready);
         $script('https://maps.google.com/maps/api/js?callback=GpxMapPlugin.ready&key='+config.gmapsKey, 'gmaps', function(alreadyLoaded) {
               console.log("ko"+alreadyLoaded);
               console.log(GpxMapPlugin.loaded);
               if(alreadyLoaded) GpxMapPlugin.ready(false);
         });
         return;
      }
      $("#content").append("<div id='map_canvas' style='height:500px'></div>");
      $("#map_canvas").css('height', ($(window).height() - 60)+'px');
      GpxMapCommon.createMap();
      $('#content').animate({opacity:1}, "fast");

      GpxMapPlugin.show('');
   },

   show:function(dir) {
      var json = jGalleryModel.getJSON(dir, function() { GpxMapPlugin.show(dir); });

      if(!json) {
         return; // wait
      } else if(json.type == "error") {
         jGallery.theme.showError({Error:"Unable to load json"});
      } else {
         json = json.json;
      }

      if(json.gpx) {
         var urls = [].concat(json.gpx);
         var regexp1 = new RegExp('^'+config.picsDir);
         var regexp2 = new RegExp('^'+config.cacheDir+'/json');
         for(var i in urls) {
            var url = urls[i].replace(regexp2, config.cacheDir+'/gpxmap');
            url = url.replace(regexp1, config.cacheDir+'/gpxmap');
            url = url.replace(/gpx$/, 'json');
            $.ajax({
             type: "GET",
             url: url,
             dataType:"json",
             success: function(json) {
                for(var s = 0; s < json.points.length; s++) {
                   var line = GpxMapCommon.showTrack(json.points[s], 0);
                   if(line) {
                      google.maps.event.addListener(line, 'click', function() {
                         jGallery.switchPage(dir);
                      });
                   }
                }
             },
             error:function(e, f) {
                console.log("Cannot load "+url);
             },
           });
         }
      }

      for (var i in json.dirs) {
         var d = json.dirs[i];
         GpxMapPlugin.show(dir+'/'+d.url);
      }
   },

   ready:function(e) {
      GpxMapPlugin.loaded++;
      if(GpxMapPlugin.loaded == 3 && jGallery.currentPage == "map") {
         GpxMapPlugin.handle("map");
      }
   },

   init:function() {
      jGallery.plugins.push(GpxMapPlugin);
   },
};

config.pluginsInstances.push(GpxMapPlugin);
if(!gm_authFailure) {
   function gm_authFailure() {
      $('#content').html('');
      $('#content').css('opacity', 1);
      jGallery.theme.showError({Error:"Invalid Google Map key. Please add a correct Google Map key in the administration options."});
   }
}
