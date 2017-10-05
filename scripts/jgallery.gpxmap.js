var GpxMapPlugin = {
   loaded:0,
   loadedScripts:{},
   showThumbs:true,
   removeMap:true,

   loadScripts:function() {
      var loaded = 0;
      if($script.loaded['gpxmap'] === undefined)
         $script('./admin/pages/gpxmap/scripts/gpxmap.common.js', 'gpxmap', GpxMapPlugin.ready);
      else if($script.loaded['gpxmap']) loaded++;
      if(!$script.loaded['randomcolors'])
         $script('./admin/pages/gpxmap/scripts/randomcolors.js', 'randomcolors', GpxMapPlugin.ready);
      else if($script.loaded['randomcolors']) loaded++;
      if(!$script.loaded['gmapsclusters'])
         $script('./admin/pages/gpx/scripts/markerclusterer_packed.js', 'gmapsclusters', GpxMapPlugin.ready);
      else if($script.loaded['gmapsclusters']) loaded++;
      if($script.loaded['gmaps'] === undefined)
         $script('https://maps.google.com/maps/api/js?callback=GpxMapPlugin.ready&key='+config.gmapsKey, 'gmaps');
      else if (typeof google === 'object' && typeof google.maps === 'object')
         loaded++;
      return loaded == 4;
   },

   want:function(action) {
      var w = (action == "map");
      if(!w && GpxMapPlugin.removeMap)
         $('#map_canvas_gpxmap').remove();
      return w;
   },

   mc:undefined,
   markers:[],
   handle:function(action) {
      if(!GpxMapPlugin.loadScripts())
         return;

      $("body").append("<div id='map_canvas_gpxmap' style='position:absolute;height:100%;width:100%;z-index:2;top:0'></div>");
      GpxMapCommon.createMap();
      $('#content').animate({opacity:1}, "fast");

      GpxMapCommon.map.setOptions({fullScreenControl: false});
      GpxMapPlugin.mc = new MarkerClusterer(GpxMapCommon.map, []);
      GpxMapPlugin.mc.setZoomOnClick(false);

      GpxMapPlugin.show('');

      var control = document.createElement('div');
      $(control).html("<img id='map_pics_gpxmap' src='admin/pages/gpxmap/css/map_location.png' style='width:50px' />");
      google.maps.event.addDomListener(control, 'click', function() {
         if(GpxMapPlugin.showThumbs)
            GpxMapPlugin.showThumbs = false;
         else
            GpxMapPlugin.showThumbs = true;
         GpxMapPlugin.displayClusters(GpxMapPlugin.showThumbs);
         $('#map_pics_gpxmap').css('opacity', GpxMapPlugin.showThumbs?1:0.5);
      });
      control.index = 1;   
      GpxMapCommon.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(control);  
   },

   findCluster:function(marker) {
      var clusters = GpxMapPlugin.mc.getClusters();
      for(var i = 0; i < clusters.length;++i){
         if(clusters[i].markers_.length > 1 && clusters[i].clusterIcon_.div_){
            if(clusters[i].markers_.indexOf(marker)>-1){
               return clusters[i].clusterIcon_.div_;
            } 
         }
      }
      return null;
   },

   displayClusters:function(display) {
      if(!display)
         GpxMapPlugin.mc.clearMarkers();
      else
         GpxMapPlugin.mc.addMarkers(GpxMapPlugin.markers);
   },

   displayPolylines:function(display) {
      for(p in GpxMapPlugin.polyLines)
         GpxMapPlugin.polyLines[p].setVisible(display);
   },

   polyLines:[],
   dirs:[],
   show:function(dir, thumbs) {
      var json = jGalleryModel.getJSON(dir, function() { GpxMapPlugin.show(dir, thumbs); });

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
                var tracks = [];
                for(var s = 0; s < json.points.length; s++) {
                   var track = GpxMapCommon.showTrack(json.points[s], 0);
                   if(track) {
                      google.maps.event.addListener(track.poly, 'click', function() {
                         jGallery.switchPage(dir);
                      });
                      tracks.push(track);
                      GpxMapPlugin.polyLines.push(track.poly);
                      GpxMapPlugin.dirs.push(dir);
                   }
                }

                var bounds = new google.maps.LatLngBounds();
                for(var t in tracks) {
                   bounds.extend(tracks[t].bounds.getCenter());
                }
                var marker = new google.maps.Marker({
                   position: bounds.getCenter(),
                   title: dir,
                   icon:{
                      url: thumbs?dir+'/'+thumbs[0]:'',
                      scaledSize: new google.maps.Size(60, 45), // scaled size
                      origin: new google.maps.Point(0,0), // origin
                      anchor: new google.maps.Point(30, 23) // anchor
                   }
                });
                google.maps.event.addListener(marker, 'click', function() {
                   jGallery.switchPage(dir);
                });
                GpxMapPlugin.markers.push(marker);
                GpxMapPlugin.mc.addMarker(marker);
             },
             error:function(e, f) {
                console.log("Cannot load "+url);
             },
           });
         }
      }

      for (var i in json.dirs) {
         var d = json.dirs[i];
         GpxMapPlugin.show(dir+'/'+d.url, d.thumbs);
      }
   },

   ready:function(e) {
      if(jGallery.currentPage == "map")
         GpxMapPlugin.handle("map");
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
