var GPXMap = {
   preWriteJson:function(id, dir, cb) {
      cb();
   },
   getJsonParams:function(id, dir) {
      return {};
   },
   postWriteJson:function(id, dir, cb) {
      var path = dir.path+'/'+dir.name;
      var batch = new Batch(ParallelBatch, function() { }, null);
      batch.get({action:'gpxmap.get_dir_content', 'dir':path}, function(json) {
         var batch2 = new Batch(ParallelBatch, cb);
         for(var g in json.gpx) {
            batch2.get({action:'gpxmap.get_gpx', 'dir':path, 'gpx':json.gpx[g].name}, function(json) {});
         }
         batch2.launch();
      });
      batch.launch();
   },

   addButtonActions:function(id, dir, data) {
   },

   getHooks:function(dir, div) {
      return [];
   },

   getUnparsedDirTpl:function(dir, div, id) {
      return '';
   },

   getParsedDirTpl:function(dir, div, data) {
      return '';
   },

   getPluginHeight:function(dir, div) {
      return 0;
   }
};
plugins.push(GPXMap);
