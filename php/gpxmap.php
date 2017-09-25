<?php

class GpxMap {
    public function getCacheFile($file) {
       global $cachepath, $picpath;
       $path = str_replace($picpath, $cachepath.'/gpxmap', $file->completePath);
       return new File($path, $file->name);
   }
}
