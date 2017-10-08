function addRich(){var b=true,f=false;function g(a){var c=a||{};this.d=this.c=f;if(a.visible==undefined)a.visible=b;if(a.shadow==undefined)a.shadow="7px -3px 5px rgba(88,88,88,0.7)";if(a.anchor==undefined)a.anchor=i.BOTTOM;this.setValues(c)}g.prototype=new google.maps.OverlayView;window.RichMarker=g;g.prototype.getVisible=function(){return this.get("visible")};g.prototype.getVisible=g.prototype.getVisible;g.prototype.setVisible=function(a){this.set("visible",a)};g.prototype.setVisible=g.prototype.setVisible;
g.prototype.s=function(){if(this.c){this.a.style.display=this.getVisible()?"":"none";this.draw()}};g.prototype.visible_changed=g.prototype.s;g.prototype.setFlat=function(a){this.set("flat",!!a)};g.prototype.setFlat=g.prototype.setFlat;g.prototype.getFlat=function(){return this.get("flat")};g.prototype.getFlat=g.prototype.getFlat;g.prototype.p=function(){return this.get("width")};g.prototype.getWidth=g.prototype.p;g.prototype.o=function(){return this.get("height")};g.prototype.getHeight=g.prototype.o;
g.prototype.setShadow=function(a){this.set("shadow",a);this.g()};g.prototype.setShadow=g.prototype.setShadow;g.prototype.getShadow=function(){return this.get("shadow")};g.prototype.getShadow=g.prototype.getShadow;g.prototype.g=function(){if(this.c)this.a.style.boxShadow=this.a.style.webkitBoxShadow=this.a.style.MozBoxShadow=this.getFlat()?"":this.getShadow()};g.prototype.flat_changed=g.prototype.g;g.prototype.setZIndex=function(a){this.set("zIndex",a)};g.prototype.setZIndex=g.prototype.setZIndex;
g.prototype.getZIndex=function(){return this.get("zIndex")};g.prototype.getZIndex=g.prototype.getZIndex;g.prototype.t=function(){if(this.getZIndex()&&this.c)this.a.style.zIndex=this.getZIndex()};g.prototype.zIndex_changed=g.prototype.t;g.prototype.getDraggable=function(){return this.get("draggable")};g.prototype.getDraggable=g.prototype.getDraggable;g.prototype.setDraggable=function(a){this.set("draggable",!!a)};g.prototype.setDraggable=g.prototype.setDraggable;
g.prototype.k=function(){if(this.c)this.getDraggable()?j(this,this.a):k(this)};g.prototype.draggable_changed=g.prototype.k;g.prototype.getPosition=function(){return this.get("position")};g.prototype.getPosition=g.prototype.getPosition;g.prototype.setPosition=function(a){this.set("position",a)};g.prototype.setPosition=g.prototype.setPosition;g.prototype.q=function(){this.draw()};g.prototype.position_changed=g.prototype.q;g.prototype.l=function(){return this.get("anchor")};g.prototype.getAnchor=g.prototype.l;
g.prototype.r=function(a){this.set("anchor",a)};g.prototype.setAnchor=g.prototype.r;g.prototype.n=function(){this.draw()};g.prototype.anchor_changed=g.prototype.n;function l(a,c){var d=document.createElement("DIV");d.innerHTML=c;if(d.childNodes.length==1)return d.removeChild(d.firstChild);else{for(var e=document.createDocumentFragment();d.firstChild;)e.appendChild(d.firstChild);return e}}function m(a,c){if(c)for(var d;d=c.firstChild;)c.removeChild(d)}
g.prototype.setContent=function(a){this.set("content",a)};g.prototype.setContent=g.prototype.setContent;g.prototype.getContent=function(){return this.get("content")};g.prototype.getContent=g.prototype.getContent;
g.prototype.j=function(){if(this.b){m(this,this.b);var a=this.getContent();if(a){if(typeof a=="string"){a=a.replace(/^\s*([\S\s]*)\b\s*$/,"$1");a=l(this,a)}this.b.appendChild(a);var c=this;a=this.b.getElementsByTagName("IMG");for(var d=0,e;e=a[d];d++){google.maps.event.addDomListener(e,"mousedown",function(h){if(c.getDraggable()){h.preventDefault&&h.preventDefault();h.returnValue=f}});google.maps.event.addDomListener(e,"load",function(){c.draw()})}google.maps.event.trigger(this,"domready")}this.c&&
this.draw()}};g.prototype.content_changed=g.prototype.j;function n(a,c){if(a.c){var d="";if(navigator.userAgent.indexOf("Gecko/")!==-1){if(c=="dragging")d="-moz-grabbing";if(c=="dragready")d="-moz-grab"}else if(c=="dragging"||c=="dragready")d="move";if(c=="draggable")d="pointer";if(a.a.style.cursor!=d)a.a.style.cursor=d}}
function o(a,c){if(a.getDraggable())if(!a.d){a.d=b;var d=a.getMap();a.m=d.get("draggable");d.set("draggable",f);a.h=c.clientX;a.i=c.clientY;n(a,"dragready");a.a.style.MozUserSelect="none";a.a.style.KhtmlUserSelect="none";a.a.style.WebkitUserSelect="none";a.a.unselectable="on";a.a.onselectstart=function(){return f};p(a);google.maps.event.trigger(a,"dragstart")}}
function q(a){if(a.getDraggable())if(a.d){a.d=f;a.getMap().set("draggable",a.m);a.h=a.i=a.m=null;a.a.style.MozUserSelect="";a.a.style.KhtmlUserSelect="";a.a.style.WebkitUserSelect="";a.a.unselectable="off";a.a.onselectstart=function(){};r(a);n(a,"draggable");google.maps.event.trigger(a,"dragend");a.draw()}}
function s(a,c){if(!a.getDraggable()||!a.d)q(a);else{var d=a.h-c.clientX,e=a.i-c.clientY;a.h=c.clientX;a.i=c.clientY;d=parseInt(a.a.style.left,10)-d;e=parseInt(a.a.style.top,10)-e;a.a.style.left=d+"px";a.a.style.top=e+"px";var h=t(a);a.setPosition(a.getProjection().fromDivPixelToLatLng(new google.maps.Point(d-h.width,e-h.height)));n(a,"dragging");google.maps.event.trigger(a,"drag")}}function k(a){if(a.f){google.maps.event.removeListener(a.f);delete a.f}n(a,"")}
function j(a,c){if(c){a.f=google.maps.event.addDomListener(c,"mousedown",function(d){o(a,d)});n(a,"draggable")}}function p(a){if(a.a.setCapture){a.a.setCapture(b);a.e=[google.maps.event.addDomListener(a.a,"mousemove",function(c){s(a,c)},b),google.maps.event.addDomListener(a.a,"mouseup",function(){q(a);a.a.releaseCapture()},b)]}else a.e=[google.maps.event.addDomListener(window,"mousemove",function(c){s(a,c)},b),google.maps.event.addDomListener(window,"mouseup",function(){q(a)},b)]}
function r(a){if(a.e){for(var c=0,d;d=a.e[c];c++)google.maps.event.removeListener(d);a.e.length=0}}
function t(a){var c=a.l();if(typeof c=="object")return c;var d=new google.maps.Size(0,0);if(!a.b)return d;var e=a.b.offsetWidth;a=a.b.offsetHeight;switch(c){case i.TOP:d.width=-e/2;break;case i.TOP_RIGHT:d.width=-e;break;case i.LEFT:d.height=-a/2;break;case i.MIDDLE:d.width=-e/2;d.height=-a/2;break;case i.RIGHT:d.width=-e;d.height=-a/2;break;case i.BOTTOM_LEFT:d.height=-a;break;case i.BOTTOM:d.width=-e/2;d.height=-a;break;case i.BOTTOM_RIGHT:d.width=-e;d.height=-a}return d}
g.prototype.onAdd=function(){if(!this.a){this.a=document.createElement("DIV");this.a.style.position="absolute"}if(this.getZIndex())this.a.style.zIndex=this.getZIndex();this.a.style.display=this.getVisible()?"":"none";if(!this.b){this.b=document.createElement("DIV");this.a.appendChild(this.b);var a=this;google.maps.event.addDomListener(this.b,"click",function(){google.maps.event.trigger(a,"click")});google.maps.event.addDomListener(this.b,"mouseover",function(){google.maps.event.trigger(a,"mouseover")});
google.maps.event.addDomListener(this.b,"mouseout",function(){google.maps.event.trigger(a,"mouseout")})}this.c=b;this.j();this.g();this.k();var c=this.getPanes();c&&c.overlayImage.appendChild(this.a);google.maps.event.trigger(this,"ready")};g.prototype.onAdd=g.prototype.onAdd;
g.prototype.draw=function(){if(!(!this.c||this.d)){var a=this.getProjection();if(a){var c=this.get("position");a=a.fromLatLngToDivPixel(c);c=t(this);this.a.style.top=a.y+c.height+"px";this.a.style.left=a.x+c.width+"px";a=this.b.offsetHeight;c=this.b.offsetWidth;c!=this.get("width")&&this.set("width",c);a!=this.get("height")&&this.set("height",a)}}};g.prototype.draw=g.prototype.draw;g.prototype.onRemove=function(){this.a&&this.a.parentNode&&this.a.parentNode.removeChild(this.a);k(this)};
g.prototype.onRemove=g.prototype.onRemove;var i={TOP_LEFT:1,TOP:2,TOP_RIGHT:3,LEFT:4,MIDDLE:5,RIGHT:6,BOTTOM_LEFT:7,BOTTOM:8,BOTTOM_RIGHT:9};window.RichMarkerPosition=i;
}
var addRichAdded = false;

var added = false;
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
      if(!addRichAdded) {
         addRichAdded = true;
         addRich();
      }

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
                var url = thumbs?jGalleryModel.cacheDir+'/thumbs'+jGalleryModel.pageToUrl(dir)+''+thumbs[0].replace('_m', '_c'):'';
                /*if(added)
                   return;
                added = true;*/
                var marker = new RichMarker({
                   position: bounds.getCenter(),
                   content: '<div style="background-image:url(\''+url+'\');width:60px;height:60px;position:absolute;top:-34px;left:-34px;border-radius: 50%;background-size: cover;background-position:center;border:4px solid black" />',
                   shadow:0,
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
