<?php

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Imagick\Driver;
use Intervention\Image\ImageManager;
//use Intervention\Image\Drivers\Gd\Driver;
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
    'text-align,float,display,margin,margin-left,margin-right,margin-top,margin-bottom,width,height,max-width,padding,padding-bottom,padding-top,padding-left,padding-right,overflow,border,background,background-color'
  );
  
  $config->set('HTML.Nofollow', true);
  $config->set('HTML.TargetBlank', true);
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
function addHttpProtocol(string $url): string
{
    if ($url && !str_starts_with($url, 'http://') 
        && !str_starts_with($url, 'https://')) 
    {
        return 'http://' . $url;
    }

    return $url;
}

/**
 * Processes HTML content to save Base64 images and delete removed ones.
 * * @param string $contentHtml The raw HTML string from TinyMCE.
 * @param array $oldImgArr Reference to the array of filenames currently on disk.
 * @param string $folderPath The subfolder name within images/uploaded/.
 * @return string The updated HTML with Base64 replaced by relative paths.
 */

function saveEditorImages(string $contentHtml, array &$oldImgArr, string $folderPath)
{
    $newImgArr = [];
    $cleanFolder = trim($folderPath, '/');
    $storageBase = "images/uploaded/$cleanFolder";

    // 1. IDENTIFY EXISTING IMAGES
    $quotedPath = preg_quote($storageBase, '/');
    // Match src attributes in a variety of forms:
    // - "images/uploaded/..."
    // - "/storage/images/uploaded/..."
    // - "storage/images/uploaded/..."
    // - "https://host/.../storage/images/uploaded/..."
    // Support both single and double quotes.
    $patternExisting = "/src=[\"'](?:https?:\\/\\/[^\"']+\\/)?\\/?(?:storage\\/)?{$quotedPath}\\/([^\"']+)[\"']/i";

    preg_match_all($patternExisting, $contentHtml, $matchesExisting);
    $currentImagesInHtml = $matchesExisting[1];

    // 2. CLEANUP: Delete files from disk that were removed in the editor
    foreach ($oldImgArr as $oldImg) {
        if (!in_array($oldImg, $currentImagesInHtml)) {
            $pathToDelete = "$storageBase/$oldImg";
            if (Storage::disk('public')->exists($pathToDelete)) {
                Storage::disk('public')->delete($pathToDelete);
                Log::info("Deleted removed image: $pathToDelete");
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

            // Enforce size limit (5MB)
            if (strlen($decodedData) > 5242880) {
                Log::warning("Base64 image payload exceeded 5MB size limit.");
                return $matches[0]; 
            }

            // Securely determine true type using native PHP magic bytes
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

            // Read into Intervention v3
            $manager = new ImageManager(new Driver());
            $image = $manager->read($decodedData);
            
            // Sanitize dimension extremes
            $image->scaleDown(width: 1920);

            // Encode to format matching verified extension
            $encodedImage = $image->encodeByExtension($extension);

            $imageName = uniqid() . '.' . $extension;
            $relativePath = "$storageBase/$imageName";

            Log::info("Saving verified Base64 image via Intervention: $relativePath");

            // FIX: Cast the EncodedImage object directly to a string to output raw binary content
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

function saveEditorImagesFromDelta($contentArray, &$oldImgArr, $folderPath)
{    
    //$contentArray = json_decode($contentJson);

    $newImgArr = [];
    $contentWithImg = array_filter($contentArray, function($op)
    {
        return isset($op->insert->image);
    });
    
    $contentImgs = array_map(function($op)
    {
        return $op->insert->image;
    }, $contentWithImg);

    //$contentImgs = array_values($contentImgs);
    $contentImgs = array_map(function($op) 
    {
        $imgData = $op->insert->image;
        // If it's an object, get the 'image' property; otherwise use it as is
        return is_object($imgData) ? $imgData->image : $imgData;
    }, $contentWithImg);

    foreach($oldImgArr as $i => $oldImg)
    {  
        $relativePath = "images/uploaded/$folderPath/$oldImg";
        //$oldImgAbsPath = asset("storage/$relativePath");

        //Log::info("old image: $oldImgAbsPath");
        //Log::info("contentImgs", $contentImgs);
        Log::info("looking for $relativePath:", $contentImgs);
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
            
            // Determine if it's a string or object
            $currentPath = is_object($imageValue) ? ($imageValue->image ?? '') : $imageValue;
            Log::info("checking if string: $currentPath");
            if (is_string($currentPath) && preg_match($pattern, $currentPath, $matches)) 
            {
                $cleanFolder = trim($folderPath, '/');
                $imageName = uniqid() . '.' . $matches[1];
                $relativePath = "images/uploaded/$cleanFolder/$imageName";
                
                Log::info("making imageName: $relativePath");

                Storage::disk('public')->put($relativePath, base64_decode($matches[2]));

                // FORCE it back to a string. 
                // This fixes the "Missing URL" issue in your console.
                $op->insert->image = $relativePath;
                
                array_push($oldImgArr, $imageName);
            }
        }
    }
    //$updatedContent = json_encode($contentArray);
    return $contentArray;//$updatedContent;
}
function saveAvatarImage($file, $userName)
{
    $manager = new ImageManager(new Driver());
    $filePath = $file->getPathname();

    $imageName = uniqid() . "." . $file->extension();
    $thumb = $manager->read($filePath);
    $small = $manager->read($filePath);

    $thumb->scaleDown(height: avatarThumb());
    $small->scaleDown(height: avatarSmall());

    // Clear out any old avatars to prevent orphaned files
    $imageRoot = "images/uploaded/users/$userName/avatar/";
    Storage::disk('public')->deleteDirectory($imageRoot . 'thumb');
    Storage::disk('public')->deleteDirectory($imageRoot . 'small');

    // Save the resized image to the public disk
    Storage::disk('public')->put($imageRoot . 'thumb/' . $imageName, (string) $thumb->encode());
    Storage::disk('public')->put($imageRoot . 'small/' . $imageName, (string) $small->encode());

    return $imageName;
}
function storeImageFile($file, $folder)
{    
    $manager = new ImageManager(new Driver());

    // Get the temporary file path
    $filePath = $file->getPathname();

    // Generate a unique image name
    $imageName = uniqid() . "." . $file->extension();
    // Read the image from the temporary file path
    $thumb = $manager->read($filePath);
    $small = $manager->read($filePath);
    $large = $manager->read($filePath);
    // Resize the image
    $thumb->scaleDown(height: thumbSize());
    $small->scaleDown(height: mediumH());

    // Save the resized image to the public disk
    $imageRoot = 'images/uploaded/' . $folder . '/';
    Storage::disk('public')->put($imageRoot . 'thumb/' . $imageName, (string) $thumb->encode());
    Storage::disk('public')->put($imageRoot . 'small/' . $imageName, (string) $small->encode());
    Storage::disk('public')->put($imageRoot . 'large/' . $imageName, (string) $large->encode());

    return $imageName;
}

function deleteGalleryImages($imageName, $folderPath)
{
    $imageRoot = 'images/uploaded/' . $folderPath . '/';
    Log::info("Deleting image at $imageRoot");
    Storage::disk('public')->delete($imageRoot . 'thumb/' . $imageName);
    Storage::disk('public')->delete($imageRoot . 'small/' . $imageName);
    Storage::disk('public')->delete($imageRoot . 'large/' . $imageName);
}

function avatarThumb() { return 50;}
function avatarSmall() { return 300;}
function thumbSize(){ return 240;}
function smallW(){ return 640;}
function smallH(){ return 480;}
function mediumW(){ return 1280;}
function mediumH(){ return 720;}
function largeW(){ return 1920;}
function largeH(){ return 1080;}