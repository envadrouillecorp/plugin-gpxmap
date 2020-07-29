var GpxMapPlugin = {
   map:undefined,          /* Map object */
   leafletMap:undefined,          /* Map object */
   showThumbs:true,        /* Display thumbs on the map?*/
   polyLines:[],
   dirs:[],                /* polyLines[i] is in dir[i] (url of directory) */
   mc:undefined,           /* MarkerCluster object -- main cluster manager */

   handle:function(action) {
      document.title = 'Photos :: Map';

      /* Reinitialize variables */
      GpxMapPlugin.map = undefined;
      GpxMapPlugin.showThumbs = true;
      GpxMapPlugin.polyLines = [];
      GpxMapPlugin.dirs = [];
      GpxMapPlugin.mc = undefined;

      /* Remove theme, show map */
      $('#header').animate({opacity:0}, 'fast');
      $("body").append("<div id='map_canvas_gpxmap' style='position:absolute;height:100%;width:100%;z-index:2;top:0'></div>");
      $script('admin/pages/gpxmap/scripts/gpxmap.common.js?'+Math.random(), 'gpxmapcommon', function() {
         GpxMapCommon.createMap(function(map) {
            GpxMapPlugin.map = map;
            GpxMapPlugin.leafletMap = map.map;
            GpxMapCommon.addLayers();

            /* Restore old position */
            var pos = action.match(/map\/(\d+)\/(-?[\d\.]+)\/(-?[\d\.]+)/);
            if(pos)
                GpxMapPlugin.leafletMap.flyTo([pos[2], pos[3]], pos[1]);

            /* Update url on position change */
            GpxMapPlugin.leafletMap.on('moveend', function(e) {
               var center = GpxMapPlugin.leafletMap.getCenter();
               var zoom = GpxMapPlugin.leafletMap.getZoom();
               history.replaceState('', '', '#!map/'+zoom+"/"+center.lat+"/"+center.lng);
            });

            /* Wait for all tiles to be loaded and then load the tracks */
            /* We wait otherwise the tracks are shown on a black map... */
            GpxMapCommon.cartoDB.once('load', function() {
               GpxMapPlugin.map.loadLeafletCluster(function() {
                  GpxMapPlugin.mc = new L.markerClusterGroup({showCoverageOnHover:false});
                  GpxMapPlugin.map.map.addLayer(GpxMapPlugin.mc);
                  GpxMapPlugin.show('');
               });
            });
         })
      });
      $('#content').animate({opacity:1}, "fast");

      /* Create map icon at the bottom to remove thumb layer */
      var control = $("#map_canvas_gpxmap").append("<div style='z-index:99999;bottom:5px;left:50%;position:absolute;'><img id='map_pics_gpxmap_thumbs' src='admin/pages/gpxmap/css/map_location.png' style='width:50px;cursor:pointer;z-index:99999' /></div>");
      $('#map_pics_gpxmap_thumbs').click(function() {
         if(!GpxMapPlugin.mc)
            return;
         if(GpxMapPlugin.showThumbs) {
            GpxMapPlugin.map.map.removeLayer(GpxMapPlugin.mc);
         } else {
            GpxMapPlugin.map.map.addLayer(GpxMapPlugin.mc);
         }
         GpxMapPlugin.showThumbs = !GpxMapPlugin.showThumbs;
         $('#map_pics_gpxmap').css('opacity', GpxMapPlugin.showThumbs?1:0.5);
      });

      /* ... and close button top right */
      var close = $("#map_canvas_gpxmap").append("<div style='z-index:99999;top:5px;right:5px;position:absolute;'><img id='map_pics_gpxmap_close' src='themes/_common/fsclose.png' style='width:28px;margin:3px;cursor:pointer;' /></div>");
      $('#map_pics_gpxmap_close').click(function() {
         GpxMapPlugin.leaveMap('');
      });
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
                      track.poly.on('click', function(e) {
                         L.DomEvent.stopPropagation(e);
                         GpxMapPlugin.leaveMap(dir);
                      });
                      tracks.push(track);
                      GpxMapPlugin.polyLines.push(track.poly);
                      GpxMapPlugin.dirs.push(dir);
                   }
                }

                /* Put the thumbnail in the middle of the track */
                var bounds = new L.latLngBounds;
                for(var t in tracks)
                   bounds.extend(tracks[t].bounds);
                var url = thumbs?jGalleryModel.cacheDir+'/thumbs'+jGalleryModel.pageToUrl(dir)+''+thumbs[0].replace('_m', '_c'):'';
                var marker = new L.marker(bounds.getCenter(), {
                   icon: L.divIcon({html:'<a href="#!'+dir.substr(1)+'"><span style="background-image:url(\''+url+'\');width:60px;height:60px;position:absolute;top:-34px;left:-34px;border-radius: 50%;background-size: cover;background-position:center;border:4px solid black;cursor:pointer;"></span></a>' })
                });
                marker.on('click', function(e) {
                   L.DomEvent.stopPropagation(e);
                   GpxMapPlugin.leaveMap(dir);
                });
                GpxMapPlugin.mc.addLayer(marker);
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
};
