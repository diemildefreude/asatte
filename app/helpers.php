<?php

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
//use Intervention\Image\Drivers\Imagick\Driver;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
//----HELPER FUNCTIONS----
/**
 * Sanitize rich HTML from TinyMCE. Allows safe formatting, images, links,
 * and iframes only from approved video hosts.
 */
if (!function_exists('sanitizeRichHtml')) {
  function sanitizeRichHtml(string $html): string
  {
  if (trim($html) === '') {
    return '';
  }

  // Convert raw pasted Twitter/X embed blockquotes into static iframes before sanitization
  if (strpos($html, 'twitter-tweet') !== false) {
      $html = preg_replace_callback(
          '/<blockquote class="[^"]*twitter-tweet[^"]*"[^>]*>.*?href="https:\/\/(?:twitter|x)\.com\/[^\/]+\/status\/(\d+)[^"]*".*?<\/blockquote>(?:\s*<script[^>]*>.*?<\/script>)?/is',
          function($m) {
              return '<iframe src="https://platform.twitter.com/embed/Tweet.html?id=' . $m[1] . '" width="550" height="600" frameborder="0" scrolling="no" style="max-width: 100%; overflow: hidden;"></iframe>';
          },
          $html
      );
  }
  
  // Convert raw pasted Instagram embed blockquotes into static iframes before sanitization
  if (strpos($html, 'instagram-media') !== false) {
      $html = preg_replace_callback(
          '/<blockquote class="[^"]*instagram-media[^"]*"[^>]*data-instgrm-permalink="https:\/\/(?:www\.)?instagram\.com\/(?:[^\/]+\/)?(?:p|reel|tv)\/([a-zA-Z0-9_-]+)[^"]*".*?<\/blockquote>(?:\s*<script[^>]*>.*?<\/script>)?/is',
          function($m) {
              return '<iframe src="https://www.instagram.com/p/' . $m[1] . '/embed/captioned" width="540" height="700" frameborder="0" scrolling="no" style="max-width: 100%; overflow: hidden;"></iframe>';
          },
          $html
      );
  }

  // Magically convert raw pasted TikTok embed blockquotes into static iframes before sanitization
  $html = preg_replace_callback(
      '/<blockquote class="tiktok-embed"[^>]*?cite="https:\/\/www\.tiktok\.com\/.*?\/video\/(\d+)[^"]*".*?<\/blockquote>\s*<script[^>]*>.*?<\/script>/is',
      function($m) {
          return '<iframe src="https://www.tiktok.com/embed/v2/' . $m[1] . '" width="325" height="740" frameborder="0" scrolling="no" allow="fullscreen" style="max-width: 100%; overflow: hidden;"></iframe>';
      },
      $html
  );
  
  // Magically convert raw pasted Dailymotion wrappers into .iframe-container before sanitization
  $html = preg_replace_callback(
      '/<div[^>]*?>\s*<iframe[^>]*?src="(https:\/\/(?:www\.|geo\.)?dailymotion\.com\/(?:embed\/video\/|player\.html\?video=)[a-zA-Z0-9_-]+)"[^>]*>.*?<\/iframe>\s*<\/div>/is',
      function($m) {
          return '<div class="iframe-container"><iframe src="' . $m[1] . '" width="100%" height="100%" frameborder="0" allowfullscreen></iframe></div>';
      },
      $html
  );
  
  $config = \HTMLPurifier_Config::createDefault();
  $config->set('Cache.DefinitionImpl', null); // Keep disabled for local XAMPP dev

  // CRITICAL: Ensure class is explicitly allowed on spans, images, and iframes
  $config->set('HTML.Allowed',
    'p[style|class],br,strong,b,em,i,u,s,strike,sub,sup,blockquote[style|class|data-instgrm-permalink|data-instgrm-version|data-instgrm-captioned|data-instgrm-payload-id],' .
    'ul[style|class],ol[style|class],li[style|class],a[href|title|target|rel],img[src|alt|width|height|title|style|class],' .
    'h1[style|class],h2[style|class],h3[style|class],h4[style|class],h5[style|class],h6[style|class],span[style|class],div[style|class],' .
    'iframe[src|width|height|frameborder|allowfullscreen|title|class|style|scrolling]'
  );
  
  $config->set(
    'CSS.AllowedProperties',
    'text-align,float,display,margin,margin-left,margin-right,margin-top,margin-bottom,width,height,max-width,padding,padding-bottom,padding-top,padding-left,padding-right,overflow,border,background,background-color,color,text-decoration,font-size'
  );
  
  $config->set('HTML.Nofollow', true);
  $config->set('Attr.AllowedFrameTargets', ['_blank', '_self']);
  $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true]);
  
  $config->set('HTML.SafeIframe', true);
  $config->set('URI.SafeIframeRegexp', getSafeVideoIframeRegexp());
  $config->set('HTML.Trusted', true);
  $config->set('CSS.AllowTricky', true);

  // Define custom data attributes for Instagram blockquotes
  // This must be called LAST because it finalizes the config
  $def = $config->getHTMLDefinition(true);
  $def->addAttribute('blockquote', 'data-instgrm-permalink', 'Text');
  $def->addAttribute('blockquote', 'data-instgrm-version', 'Text');
  $def->addAttribute('blockquote', 'data-instgrm-captioned', 'Text');
  $def->addAttribute('blockquote', 'data-instgrm-payload-id', 'Text');
  
  // Define custom data attributes for Twitter blockquotes
  $def->addAttribute('blockquote', 'data-theme', 'Text');
  $def->addAttribute('blockquote', 'data-dnt', 'Text');
  $def->addAttribute('blockquote', 'data-media-max-width', 'Text');

  $purifier = new \HTMLPurifier($config);
  return $purifier->purify($html);
  }
}

if (!function_exists('getSafeVideoIframeRegexp')) {
  function getSafeVideoIframeRegexp(): string
  {
  // Allow all HTTP and HTTPS URLs for iframes to universally support lesser-known platforms
  return '%^https?://%';
  }
}
if (!function_exists('addHttpProtocol')) {
    function addHttpProtocol(string $url): string
    {
        if ($url && !str_starts_with($url, 'http://') 
            && !str_starts_with($url, 'https://')) 
        {
            return 'http://' . $url;
        }

        return $url;
    }
}

/**
 * Processes HTML content to save Base64 images and delete removed ones.
 * * @param string $contentHtml The raw HTML string from TinyMCE.
 * @param array $oldImgArr Reference to the array of filenames currently on disk.
 * @param string $folderPath The subfolder name within images/uploaded/.
 * @return string The updated HTML with Base64 replaced by relative paths.
 */

if (!function_exists('saveEditorImages')) {
    function saveEditorImages(string $contentHtml, &$oldImgArr, string $folderPath)
    {
        $newImgArr = [];
        $cleanFolder = trim($folderPath, '/');
        $storageBase = "images/uploaded/$cleanFolder";

        if(!$oldImgArr || gettype($oldImgArr) != "array")
        {
            $oldImgArr = [];
        }

        // 1. IDENTIFY EXISTING IMAGES
        $quotedPath = preg_quote($storageBase, '/');
        $patternExisting = "/src=[\"'](?:https?:\\/\\/[^\"']+\\/)?\\/?(?:storage\\/)?{$quotedPath}\\/([^\"']+)[\"']/i";

        preg_match_all($patternExisting, $contentHtml, $matchesExisting);
        $currentImagesInHtml = $matchesExisting[1];

        // 2. CLEANUP: Delete files from disk that were removed in the editor
        foreach ($oldImgArr as $oldImg) {
            if (!in_array($oldImg, $currentImagesInHtml)) {
                $pathToDelete = "$storageBase/$oldImg";
                if (Storage::disk('public')->exists($pathToDelete)) {
                    Storage::disk('public')->delete($pathToDelete);

                }
            } else {
                $newImgArr[] = $oldImg;
            }
        }

        // 3. STORAGE: Process new Base64 images safely
        $patternBase64 = '/src="data:image\/([a-zA-Z]*);base64,([^"]*)"/i';

        $contentHtml = preg_replace_callback($patternBase64, function($matches) use ($storageBase, &$newImgArr) {
            $base64Data = $matches[2];

            try {
                $decodedData = base64_decode($base64Data, true);
                if (!$decodedData) {
                    Log::warning("Failed to decode base64 string.");
                    return $matches[0];
                }

                if (strlen($decodedData) > 5242880) {
                    Log::warning("Base64 image payload exceeded 5MB size limit.");
                    return $matches[0]; 
                }

                $finfo = new \finfo(FILEINFO_MIME_TYPE);
                $mimeType = $finfo->buffer($decodedData);

                $extension = match ($mimeType) {
                    'image/jpeg', 'image/jpg' => 'jpg',
                    'image/png'               => 'png',
                    'image/gif'               => 'gif',
                    'image/webp'              => 'webp',
                    default                   => null
                };

                if (!$extension) {
                    Log::warning("Unsupported or malicious image payload type intercepted: $mimeType");
                    return $matches[0];
                }

                if ($extension === 'gif') {
                    $imageName = uniqid() . '.gif';
                    $relativePath = "$storageBase/$imageName";
                    Storage::disk('public')->put($relativePath, $decodedData);
                    $newImgArr[] = $imageName;
                    return 'src="' . $relativePath . '"';
                }

                $manager = new ImageManager(new Driver());
                $image = $manager->read($decodedData);
                
                $image->scaleDown(width: 1920);

                $encodedImage = $image->encodeByExtension($extension);

                $imageName = uniqid() . '.' . $extension;
                $relativePath = "$storageBase/$imageName";

                Storage::disk('public')->put($relativePath, (string) $encodedImage);

                $newImgArr[] = $imageName;
                return 'src="' . $relativePath . '"';

            } 
            catch (\Exception $e) 
            {
                Log::error("Failed to safely process Base64 image: " . $e->getMessage());
                return $matches[0];
            }
        }, $contentHtml);

        $oldImgArr = $newImgArr;
        return $contentHtml;
    }
}

if (!function_exists('saveEditorImagesFromDelta')) {
    function saveEditorImagesFromDelta($contentArray, &$oldImgArr, $folderPath)
    {    
        $newImgArr = [];
        $contentWithImg = array_filter($contentArray, function($op)
        {
            return isset($op->insert->image);
        });
        
        $contentImgs = array_map(function($op)
        {
            return $op->insert->image;
        }, $contentWithImg);

        $contentImgs = array_map(function($op) 
        {
            $imgData = $op->insert->image;
            return is_object($imgData) ? $imgData->image : $imgData;
        }, $contentWithImg);

        foreach($oldImgArr as $i => $oldImg)
        {  
            $relativePath = "images/uploaded/$folderPath/$oldImg";

            $isFound = array_search($relativePath, $contentImgs) !== false;
            if(!$isFound)
            {
                Storage::disk('public')->delete($relativePath);
            }
            else
            {
                array_push($newImgArr, $oldImg);
            }
        }
        $oldImgArr = $newImgArr;

        $pattern = '/data:image\/([a-zA-Z]*);base64,([^\"]*)/i'; 
        foreach ($contentArray as &$op) 
        {
            if (isset($op->insert->image)) 
            {
                $imageValue = $op->insert->image;
                
                $currentPath = is_object($imageValue) ? ($imageValue->image ?? '') : $imageValue;

                if (is_string($currentPath) && preg_match($pattern, $currentPath, $matches)) 
                {
                    $cleanFolder = trim($folderPath, '/');
                    $imageName = uniqid() . '.' . $matches[1];
                    $relativePath = "images/uploaded/$cleanFolder/$imageName";
                    


                    Storage::disk('public')->put($relativePath, base64_decode($matches[2]));

                    $op->insert->image = $relativePath;
                    
                    array_push($oldImgArr, $imageName);
                }
            }
        }
        return $contentArray;
    }
}
if (!function_exists('saveAvatarImage')) {
    function saveAvatarImage($file, $userName)
    {
        $manager = new ImageManager(new Driver());
        $filePath = $file->getPathname();

        $imageName = uniqid() . "." . $file->extension();
        $thumb = $manager->read($filePath);
        $small = $manager->read($filePath);

        $thumb->scaleDown(height: avatarThumb());
        $small->scaleDown(height: avatarSmall());

        $imageRoot = "images/uploaded/users/$userName/avatar/";
        Storage::disk('public')->deleteDirectory($imageRoot . 'thumb');
        Storage::disk('public')->deleteDirectory($imageRoot . 'small');

        Storage::disk('public')->put($imageRoot . 'thumb/' . $imageName, (string) $thumb->encodeByExtension($file->extension(), quality: 90));
        Storage::disk('public')->put($imageRoot . 'small/' . $imageName, (string) $small->encodeByExtension($file->extension(), quality: 92));

        return $imageName;
    }
}

if (!function_exists('storeImageFile')) {
    function storeImageFile($file, $folder)
    {    
        $manager = new ImageManager(new Driver());
        $filePath = $file->getPathname();
        $imageName = uniqid() . "." . $file->extension();

        $thumb = $manager->read($filePath);
        $small = $manager->read($filePath);
        $large = $manager->read($filePath);
        $isLandscape = $thumb->width() >= $thumb->height();
        
        $thumb->scaleDown(height: thumbSize());
        
        if($isLandscape)
        {
            $small->scaleDown(height: smallH());
            $large->scaleDown(height: largeH());
        }
        else
        {
            $small->scaleDown(height: smallW());
            $large->scaleDown(height: largeW());
        }
        
        $imageRoot = 'images/uploaded/' . $folder . '/';
        Storage::disk('public')->put($imageRoot . 'thumb/' . $imageName, (string) $thumb->encode());
        Storage::disk('public')->put($imageRoot . 'small/' . $imageName, (string) $small->encode());
        Storage::disk('public')->put($imageRoot . 'large/' . $imageName, (string) $large->encode());

        return $imageName;
    }
}

if (!function_exists('deleteGalleryImages')) {
    function deleteGalleryImages($imageName, $folderPath)
    {
        $imageRoot = 'images/uploaded/' . $folderPath . '/';

        Storage::disk('public')->delete($imageRoot . 'thumb/' . $imageName);
        Storage::disk('public')->delete($imageRoot . 'small/' . $imageName);
        Storage::disk('public')->delete($imageRoot . 'large/' . $imageName);
    }
}

if (!function_exists('avatarThumb')) { function avatarThumb() { return 240;} }
if (!function_exists('avatarSmall')) { function avatarSmall() { return 600;} }
if (!function_exists('thumbSize')) { function thumbSize(){ return 240;} }
if (!function_exists('smallW')) { function smallW(){ return 640;} }
if (!function_exists('smallH')) { function smallH(){ return 480;} }
if (!function_exists('mediumW')) { function mediumW(){ return 1280;} }
if (!function_exists('mediumH')) { function mediumH(){ return 720;} }
if (!function_exists('largeW')) { function largeW(){ return 1920;} }
if (!function_exists('largeH')) { function largeH(){ return 1080;} }