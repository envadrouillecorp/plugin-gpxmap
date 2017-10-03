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
