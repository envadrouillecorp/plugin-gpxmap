var GpxMapPlugin = {
   map:undefined,          /* Map object */
   leafletMap:undefined,          /* Map object */
   showThumbs:true,        /* Display thumbs on the map?*/
   polyLines:[],
   dirs:[],                /* polyLines[i] is in dir[i] (url of directory) */
   mc:undefined,           /* MarkerCluster object -- main cluster manager */
   polyLinesObservers:[],      /* List of functions to call when adding a track */

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
                GpxMapPlugin.leafletMap.flyTo([parseFloat(pos[2]), parseFloat(pos[3])], parseInt(pos[1], 10));

            /* Update url on position change */
            GpxMapPlugin.leafletMap.on('moveend', function(e) {
               var center = GpxMapPlugin.leafletMap.getCenter();
               var zoom = GpxMapPlugin.leafletMap.getZoom();
               history.replaceState('', '', '#!map/'+zoom+"/"+center.lat+"/"+center.lng);
            });

            /* Wait for all tiles to be loaded and then load the tracks */
            /* We wait otherwise the tracks are shown on a black map... */
            GpxMapCommon.defaultLayer.once('load', function() {
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
      $("#map_canvas_gpxmap").append("<div id='map_canvas_controls' style='z-index:99999;bottom:5px;left:50%;position:absolute;transform: translateX(-50%);'></div>");
      $("#map_canvas_controls").append("<img id='map_pics_gpxmap_thumb' src='admin/pages/gpxmap/css/map_location.png' style='width:50px;cursor:pointer;' />");
      $('#map_pics_gpxmap_thumb').click(function() {
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

      /* Create a button to show/hide the filters */
      $("#map_canvas_controls").append("<span style='width:10px;'></span><img id='map_filter_gpxmap_thumb' src='admin/pages/gpxmap/css/map_filter.png' style='width:50px;cursor:pointer;' />");
      $('#map_filter_gpxmap_thumb').click(function(e) {
          if($("#map_canvas_filter").length) {
                  $("#map_canvas_filter").toggle();
          } else {
                  GpxMapPlugin.showFilter();
          }
          e.stopPropagation();
      });
      $('#map_filter_gpxmap_thumb').dblclick(function(e) {
         return false;
      });

      /* ... and close button top right */
      var close = $("#map_canvas_gpxmap").append("<div style='z-index:99999;top:5px;right:5px;position:absolute;'><img id='map_pics_gpxmap_close' src='themes/_common/fsclose.png' style='width:28px;margin:3px;cursor:pointer;' /></div>");
      $('#map_pics_gpxmap_close').click(function() {
         GpxMapPlugin.leaveMap('');
      });
   },

   showFilter:function() {
      /* Create a filter options at the bottom */
      $("body").append(
         `<div id='map_canvas_filter' style='z-index:99998;bottom:60px;left:50%;position:absolute;transform: translateX(-50%);box-shadow:0 1px 2px rgba(0,0,0,0.07),0 2px 4px rgba(0,0,0,0.07),0 4px 8px rgba(0,0,0,0.07),0 8px 16px rgba(0,0,0,0.07),0 16px 32px rgba(0,0,0,0.07),0 32px 64px rgba(0,0,0,0.07);background-color:#FFF;width:90%;min-height:50px;padding-top:30px;color:#000'>
            <div style="width:90%;display:flex;left:50%;position:absolute;transform: translateX(-50%);">
               <label style="display:inline-block;padding-right:30px;" class="customtranslate">${jGalleryModel.translate('Years range')}</label>
               <div style="flex:1;transform: translateY(7px);">
                       <div id='gpxmap-slider-range'></div>
                       <strong style="padding-left:10px">Min:</strong> <span id="slider-range-value1"></span>
                       <div style="position:absolute;right:10px;display:inline"><strong>Max:</strong> <span id="slider-range-value2"></span></div>
               </div>
            </div>
         </div>`);
      jGallery.addCss("admin/pages/gpxmap/css/slider.css", "GpxMapSliderCss", function() {
              $script('admin/pages/gpxmap/scripts/slider.js?'+Math.random(), 'gpxmapslider', function() {
                      var rangeSlider = document.getElementById('gpxmap-slider-range');
                      var min = undefined, max = undefined;

                      function update_range(poly) {
                         if(poly.date && (poly.date < min || !min))
                              min = parseInt(poly.date, 10);
                         if(poly.date && (poly.date > max || !max))
                              max = parseInt(poly.date, 10);
                         if(!rangeSlider.noUiSlider)
                              return;
                         var update_min = true;
                         var update_max = true;
                         if(rangeSlider.noUiSlider.options.range) {
                              update_min = rangeSlider.noUiSlider.options.range.min == rangeSlider.noUiSlider.get(true)[0];
                              update_max = rangeSlider.noUiSlider.options.range.max == rangeSlider.noUiSlider.get(true)[1];
                         }
                         if(min == max) /* Avoid error on the first update */
                              min = max - 1;
                         rangeSlider.noUiSlider.updateOptions({
                              range: {
                                      'min': min,
                                      'max': max
                              }
                         });
                         if(update_min || update_max) {
                              rangeSlider.noUiSlider.set([update_min?min:null, update_max?max:null]);
                              $('#slider-range-value1').html(new Date(min).toISOString().split('T')[0]);
                              $('#slider-range-value2').html(new Date(max).toISOString().split('T')[0]);
                         }
                      }

                      for(var t in GpxMapCommon.polyLines)
                              update_range(GpxMapCommon.polyLines[t]);
                      GpxMapPlugin.polyLinesObservers.push(update_range);

                      var default_date = new Date().getTime();
                      console.log( [min?min:default_date, max?max:default_date] );
                      noUiSlider.create(rangeSlider, {
                              start: [min?min:default_date, max?max:(default_date+1)],
                              step: 1,
                              range: {
                                      'min': [min?min:default_date],
                                      'max': [max?max:(default_date+1)]
                              },
                              connect: true
                      });

          
                      rangeSlider.noUiSlider.on('update', function(values, handle) {
                         $('#slider-range-value1').html(new Date(parseInt(values[0], 10)).toISOString().split('T')[0]);
                         $('#slider-range-value2').html(new Date(parseInt(values[1], 10)).toISOString().split('T')[0]);
                      });

                      rangeSlider.noUiSlider.on('change', function(values, handle) {
                         var current_min = parseInt(values[0], 10);
                         var current_max = parseInt(values[1], 10);
                         for(var t in GpxMapCommon.polyLines) {
                              var poly = GpxMapPlugin.polyLines[t];
                              var display = true;
                              var displayed = GpxMapPlugin.map.map.hasLayer(poly);
                              if(!poly.date)
                                      display = false;
                              else if(poly.date < current_min)
                                      display = false;
                              else if (poly.date > current_max)
                                      display = false;
                              if(display && !displayed) {
                                 poly.addTo(GpxMapCommon.map.map);
                                 if(poly.marker)
                                      GpxMapPlugin.mc.addLayer(poly.marker);
                              }
                              if(!display && displayed) {
                                 poly.remove(GpxMapCommon.map.map);
                                 if(poly.marker)
                                         GpxMapPlugin.mc.removeLayer(poly.marker);
                              }
                         }
                      });
              });
      });
   },

   /* When we exit the map view we need to do some cleaning,
    * so use a helper instead of jGallery.switchPage */
   leaveMap:function(action) {
      $('#header').css('opacity', 1);
      $('#map_canvas_gpxmap').remove();
      $('#map_canvas_filter').remove();
      if(action.startsWith('/'))
         action = action.substr(1);
      //jGallery.switchPage(action);
      window.location.hash = '#!'+action;
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

                var m = dir.match( jGalleryModel.dirPattern );
                var date = m?(new Date(m[1]+"-"+m[2]+"-"+m[3]).getTime()):undefined;

                var tracks = [];
                for(var s = 0; s < json.points.length; s++) {
                   var track = GpxMapCommon.showTrack(json.points[s], 0);
                   if(track) {
                      track.poly.on('click', function(e) {
                         L.DomEvent.stopPropagation(e);
                         GpxMapPlugin.leaveMap(dir);
                      });
                      track.poly.date = date;
                      tracks.push(track);
                      GpxMapPlugin.polyLines.push(track.poly);
                      for(var f in GpxMapPlugin.polyLinesObservers)
                           GpxMapPlugin.polyLinesObservers[f](track.poly);
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
                tracks[0].poly.marker = marker;
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

function gpxMapPluginChangeLang() {
   if(jGallery.lang == 'fr') {
      var tr = {
         'Years range':'Années',
      };
      config.tr = $.extend(config.tr, tr);
   }
}
gpxMapPluginChangeLang();
