var GpxMapPluginHandle = {
   want:function(action) {
      // We don't want the action but we are still in display, let's remove our div!
      if(action != "map" && $('#map_canvas_gpxmap').length) {
         $('#header').css('opacity', 1);
         $('#map_canvas_gpxmap').remove();
         $('#map_canvas_filter').remove();
      }
      return action.match(/^map/);
   },

   /* If we are in charge of this page, display it!*/
   handle:function(action) {
      $script('admin/pages/gpxmap/scripts/jgallery.gpxmap.js?'+Math.random(), 'gpxmap', function() {
         GpxMapPlugin.handle(action);
      });
   },

   showGPXHook:function() {
      if(jGallery.currentPage == '') {
         $('#contentb').append('<div style="width: 100%; text-align: center;clear:both;opacity:0" id="gpxmaplink"><a href="#!map" class="translate" style="border-bottom:1px dotted #EEE;text-decoration: none;">'+jGalleryModel.translate('SHOW MAP')+'</a></div>');
         $('#gpxmaplink').animate({opacity:1}, 'fast');
      }
   },

   init:function() {
      jGallery.plugins.push(GpxMapPluginHandle);
      config.content_order.push('gpxmap');
      config.contentPlugins['gpxmap'] = GpxMapPluginHandle.showGPXHook;
      gpxMapChangeLang();
      $('<div class="customtranslate"/>').bind('languagechangeevt', gpxMapChangeLang).appendTo($('body'));
   },
};

config.pluginsInstances.push(GpxMapPluginHandle);

function gpxMapChangeLang() {
   if(jGallery.lang == 'fr') {
      var tr = {
         'Map':'Carte',
         'SHOW MAP':'AFFICHER LA CARTE',
      };
      config.tr = $.extend(config.tr, tr);
   }
}
