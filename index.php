<?php
/*
 * Copyright (c) 2013 Baptiste Lepers
 * Released under MIT License
 *
 * Gpx map
 */

class Pages_GpxMap_Index {
   public static $description = "GPX Map";
   public static $isOptional = true;
   public static $activatedByDefault = true;
   public static $showOnMenu = true;


   public static function setupAutoload() {
      AutoLoader::$autoload_path[] = "./pages/index/php/";
      AutoLoader::$autoload_path[] = "./pages/gpx/php/";
      AutoLoader::$autoload_path[] = "./pages/gpxmap/php/";
      File_Factory::registerExtension("gpx", "GPX");
   }

   static public function getOptions() {
      return array(
      );
   }

   /*static public function getUserFunctions() {
       return array(
           file_get_contents('./pages/gpxmap/scripts/jgallery.gpxmap.js')
       );
   }*/

   static public function getUserScripts() {
      return array('./admin/pages/gpxmap/scripts/jgallery.gpxmap.js');
   }


   static public function mainAction() {
      $template = new liteTemplate();
      $template->extraJS[] = './pages/gpxmap/scripts/randomcolors.js';
      $template->extraJS[] = 'https://maps.google.com/maps/api/js?sensor=false&callback=gmapsLoaded&key=AIzaSyCbi1rhO6dTs_OQuBRtMS2vSRFKlopijGY';
      $template->showPage('gpxmap');
      $template->view();
   }

   static public function getDirContentAction() {
      $dir = new GPXDir(Controller::getParameter('dir'));
      echo File_JSON::myjson_encode(array(
         'dirs' => $dir->getDirs(),
         'gpx' => $dir->getGPX(),
      ));
   }

   static public function getCacheFile($file) {
       global $cachepath, $picpath;
       $path = str_replace($cachepath.'/json', $cachepath.'/gpxmap', $file->path);
       $path = str_replace($picpath, $cachepath.'/gpxmap', $path);
       $name = str_replace(".gpx", ".json", $file->name);
       return new File($path, $name);
   }


   static public function getGpxAction() {
      $file = new File(Controller::getParameter('dir'), Controller::getParameter('gpx'));

      /* If in cache, return cached version */
      $cached_gpx = Pages_GpxMap_Index::getCacheFile($file);
      if($cached_gpx->exists()) {
         $file_date = filemtime($file->completePath);
         $cache_date = filemtime($cached_gpx->completePath);
         if($file_date < $cache_date) {
            print $cached_gpx->getContent();
            return;
         }
      }

      /* Otherwise, parse GPX */
      $xml = simplexml_load_file($file->completePath);

      /* One array per individual section (track or segment) */
      $gpx = array();
      foreach($xml->trk as $trk) {
         foreach($trk->trkseg as $segment) {
            $points = array();
            foreach($segment->trkpt as $trkpt) {
               $trkptlat = (string)$trkpt->attributes()->lat;
               $trkptlon = (string)$trkpt->attributes()->lon;
               $points[] = array($trkptlat, $trkptlon);
            }
            if(count($points))
               $gpx[] = $points;
         }
      }

      /* Simplify each section */
      $simplifiedGpx = array();
      foreach($gpx as $segment) {
         $tolerance = 0.00070;
         $after = Douglas::simplify_RDP($segment, $tolerance);
         while(count($after) > 70) {
            $tolerance *= 2;
            $after = Douglas::simplify_RDP($after, $tolerance);
         }
         $simplifiedGpx[] = $after;
      }

      /* Write cache, then return content */
      $content = json_encode(array("points" => $simplifiedGpx));
      if($cached_gpx->tryCreate()) {
         $cached_gpx->writeContent($content);
      }
      print $content;
   }
};
