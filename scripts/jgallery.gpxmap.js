var GpxMapPlugin = {
   showThumbs:true,        /* Display thumbs on the map?*/
   addRichAdded:false,   /* The RichMarker plugin requires to be manually activated. Has it been done? */
   polyLines:[],           /* Lines on the map */
   dirs:[],                /* polyLines[i] is in dir[i] (url of directory) */
   mc:undefined,           /* MarkerCluster object -- main cluster manager */
   markers:[],             /* RichMarkers (thumbs) displayed on the map */

   /* We need to load many external .js files before being able to display the map... */
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
      if($script.loaded['richmarker'] === undefined)
         $script('./admin/pages/gpxmap/scripts/richmarker.js', 'richmarker', GpxMapPlugin.ready);
      else if($script.loaded['richmarker']) loaded++;
      return loaded == 5;
   },

   /* Envadrouille interface -- which pages do we want? */
   want:function(action) {
      // We don't want the action but we are still in display, let's remove our div!
      if(action != "map" && $('#map_canvas_gpxmap').length) {
         $('#header').css('opacity', 1);
         $('#map_canvas_gpxmap').remove();
      }
      return action == "map";
   },

   /* If we are in charge of this page, display it!*/
   handle:function(action) {
      document.title = 'Photos :: Map';
      if(!GpxMapPlugin.loadScripts()) {
         page.loaded = false;
         page.showLoading();
         return;
      }
      page.loaded = true;

      /* Richmarker requires delayed activation because it needs google.maps to exists */
      if(!GpxMapPlugin.addRichAdded) {
         GpxMapPlugin.addRichAdded = true;
         addRich();
      }

      /* Reinitialize variables */
      GpxMapPlugin.showThumbs = true;
      GpxMapPlugin.polyLines = [];
      GpxMapPlugin.dirs = [];
      GpxMapPlugin.mc = undefined;
      GpxMapPlugin.markers = [];

      /* Remove theme, show map */
      $('#header').animate({opacity:0}, 'fast');
      $("body").append("<div id='map_canvas_gpxmap' style='position:absolute;height:100%;width:100%;z-index:2;top:0'></div>");
      GpxMapCommon.createMap();
      $('#content').animate({opacity:1}, "fast");

      /* Create picture clusters */
      GpxMapCommon.map.setOptions({fullScreenControl: false});
      GpxMapPlugin.mc = new MarkerClusterer(GpxMapCommon.map, []);
      GpxMapPlugin.mc.setZoomOnClick(false);

      /* Recursively go through all directories to display tracks
       * Only do so when the map is loaded otherwise this gets priority and the full
       * map takes forever to show... */
      var listenerHandle = google.maps.event.addListener(GpxMapCommon.map, 'idle', function() {
         google.maps.event.removeListener(listenerHandle);
         GpxMapPlugin.show('');
      });

      /* Create map icon at the bottom to remove thumb layer */
      var control = document.createElement('div');
      $(control).html("<img id='map_pics_gpxmap' src='admin/pages/gpxmap/css/map_location.png' style='width:50px;cursor:pointer;' />");
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

      /* ... and close button top right */
      var close = document.createElement('div');
      $(close).html("<img id='map_pics_gpxmap' src='themes/_common/fsclose.png' style='width:28px;margin:3px;cursor:pointer;' />");
      google.maps.event.addDomListener(close, 'click', function() {
         GpxMapPlugin.leaveMap('');
      });
      close.index = 1;   
      GpxMapCommon.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(close);  
   },

   /* When we exit the map view we need to do some cleaning,
    * so use a helper instead of jGallery.switchPage */
   leaveMap:function(action) {
      $('#header').css('opacity', 1);
      $('#map_canvas_gpxmap').remove();
      if(action.startsWith('/'))
         action = action.substr(1);
      //jGallery.switchPage(action);
      window.location.hash = '#!'+action;
   },

   /* Action of the map icon: display/hide thumbs */
   displayClusters:function(display) {
      if(!display)
         GpxMapPlugin.mc.clearMarkers();
      else
         GpxMapPlugin.mc.addMarkers(GpxMapPlugin.markers);
   },

   /* Same for polylines */
   displayPolylines:function(display) {
      for(p in GpxMapPlugin.polyLines)
         GpxMapPlugin.polyLines[p].setVisible(display);
   },

   maxCallsAjax:4,
   priorityCalls:0,
   lowpriorityCalls:0,
   pendingCalls:[],
   inCache:{},
   ajaxQueue:function(dir, cb, async) {
      if(!GpxMapPlugin.inCache[dir] && (GpxMapPlugin.priorityCalls + GpxMapPlugin.lowpriorityCalls > GpxMapPlugin.maxCallsAjax)) {
         GpxMapPlugin.pendingCalls.push({dir:dir, cb:cb});
         return;
      }
      GpxMapPlugin.lowpriorityCalls++;
      var json = jGalleryModel.getJSON(dir, function() { GpxMapPlugin.ajaxDequeue(dir, cb); });
      if(json) {
         GpxMapPlugin.inCache[dir] = true;
         GpxMapPlugin.lowpriorityCalls--;
         if(async)
            cb();
         return json;
      }
      return;
   },

   ajaxDequeue:function(dir, cb) {
      GpxMapPlugin.inCache[dir] = true;
      cb();
      GpxMapPlugin.lowpriorityCalls--;
      GpxMapPlugin.ajaxRelaunch();
   },

   ajaxRelaunch:function() {
      if(GpxMapPlugin.pendingCalls.length && (GpxMapPlugin.priorityCalls + GpxMapPlugin.lowpriorityCalls <= GpxMapPlugin.maxCallsAjax)) {
         var call = GpxMapPlugin.pendingCalls.shift();
         GpxMapPlugin.ajaxQueue(call.dir, call.cb, true);
      }
   },


   /* Recursively show gpx in directories.
    * The thumbnail of a directory is stored in the parent dir json, so propagate that */
   show:function(dir, thumbs) {
      //var json = jGalleryModel.getJSON(dir, function() { GpxMapPlugin.show(dir, thumbs); });
      // We want to prioritize loading of GPX, so queue dir parsing
      var json = GpxMapPlugin.ajaxQueue(dir, function() { GpxMapPlugin.show(dir, thumbs); });

      if(!json) {
         return; // wait
      } else if(json.type == "error") {
         //Ignore loading errors -- never happens in practice
         console.log("Unable to load json of dir "+dir);
      } else {
         json = json.json;
      }

      /* Find the cached json file for a given gpx */
      if(json.gpx) {
         var urls = [].concat(json.gpx);
         var regexp1 = new RegExp('^'+config.picsDir);
         var regexp2 = new RegExp('^'+config.cacheDir+'/json');
         for(var i in urls) {
            var url = urls[i].replace(regexp2, config.cacheDir+'/gpxmap');
            url = url.replace(regexp1, config.cacheDir+'/gpxmap');
            url = url.replace(/gpx$/, 'json');
            GpxMapPlugin.priorityCalls++;
            $.ajax({
             type: "GET",
             url: url,
             dataType:"json",
             success: function(json) {
                GpxMapPlugin.priorityCalls--;
                GpxMapPlugin.ajaxRelaunch();

                var tracks = [];
                for(var s = 0; s < json.points.length; s++) {
                   var track = GpxMapCommon.showTrack(json.points[s], 0);
                   if(track) {
                      google.maps.event.addListener(track.poly, 'click', function() {
                         GpxMapPlugin.leaveMap(dir);
                      });
                      tracks.push(track);
                      GpxMapPlugin.polyLines.push(track.poly);
                      GpxMapPlugin.dirs.push(dir);
                   }
                }

                /* Put the thumbnail in the middle of the track */
                var bounds = new google.maps.LatLngBounds();
                for(var t in tracks) {
                   bounds.extend(tracks[t].bounds.getCenter());
                }
                var url = thumbs?jGalleryModel.cacheDir+'/thumbs'+jGalleryModel.pageToUrl(dir)+''+thumbs[0].replace('_m', '_c'):'';
                var marker = new RichMarker({
                   position: bounds.getCenter(),
                   content: '<div style="background-image:url(\''+url+'\');width:60px;height:60px;position:absolute;top:-34px;left:-34px;border-radius: 50%;background-size: cover;background-position:center;border:4px solid black;cursor:pointer;" />',
                   shadow:0,
                });
                google.maps.event.addListener(marker, 'click', function() {
                   GpxMapPlugin.leaveMap(dir);
                });
                GpxMapPlugin.markers.push(marker);
                GpxMapPlugin.mc.addMarker(marker);
             },
             error:function(e, f) {
                GpxMapPlugin.priorityCalls--;
                GpxMapPlugin.ajaxRelaunch();
                console.log("Cannot load "+url);
             },
           });
         }
      }

      /* Recurse */
      for (var i in json.dirs) {
         var d = json.dirs[i];
         GpxMapPlugin.show(dir+'/'+d.url, d.thumbs);
      }
   },

   /* Helper called everytime a script is loaded; it refreshes the view until everything is loaded */
   ready:function(e) {
      if(jGallery.currentPage == "map")
         GpxMapPlugin.handle("map");
   },

   showGPXHook:function() {
      if(jGallery.currentPage == '') {
         $('#contentb').append('<div style="width: 100%; text-align: center;clear:both;opacity:0" id="gpxmaplink"><a href="#!map" class="translate" style="border-bottom:1px dotted #EEE;text-decoration: none;">'+jGalleryModel.translate('SHOW MAP')+'</a></div>');
         $('#gpxmaplink').animate({opacity:1}, 'fast');
      }
   },

   init:function() {
      jGallery.plugins.push(GpxMapPlugin);
      config.content_order.push('gpxmap');
      config.contentPlugins['gpxmap'] = GpxMapPlugin.showGPXHook;
      gpxMapChangeLang();
      $('<div class="customtranslate"/>').bind('languagechangeevt', gpxMapChangeLang).appendTo($('body'));
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

function gpxMapChangeLang() {
   if(jGallery.lang == 'fr') {
      var tr = {
         'Map':'Carte',
         'SHOW MAP':'AFFICHER LA CARTE',
      };
      config.tr = $.extend(config.tr, tr);
   }
}

