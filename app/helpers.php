<?php

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Imagick\Driver;
use Intervention\Image\ImageManager;
//----HELPER FUNCTIONS----
/**
 * Sanitize rich HTML from TinyMCE. Allows safe formatting, images, links,
 * and iframes only from approved video hosts.
 */
function sanitizeRichHtml(string $html): string
{
  if (trim($html) === '') {
    return '';
  }
  
  $config = \HTMLPurifier_Config::createDefault();
  $config->set('Cache.DefinitionImpl', null); // Keep disabled for local XAMPP dev

  // CRITICAL: Ensure class is explicitly allowed on spans, images, and iframes
  $config->set('HTML.Allowed',
    'p[style|class],br,strong,b,em,i,u,s,strike,sub,sup,blockquote[style|class],' .
    'ul[style|class],ol[style|class],li[style|class],a[href|title|target|rel],img[src|alt|width|height|title|style|class],' .
    'h1[style|class],h2[style|class],h3[style|class],h4[style|class],h5[style|class],h6[style|class],span[style|class],div[style|class],' .
    'iframe[src|width|height|frameborder|allowfullscreen|title|class|style]'
  );
  
  $config->set(
    'CSS.AllowedProperties',
    'text-align,float,display,margin,margin-left,margin-right,margin-top,margin-bottom,width,height,max-width'
  );
  
  $config->set('HTML.Nofollow', true);
  $config->set('HTML.TargetBlank', true);
  $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true]);
  
  $config->set('HTML.SafeIframe', true);
  $config->set('URI.SafeIframeRegexp', getSafeVideoIframeRegexp());
  $config->set('HTML.Trusted', true);
  $config->set('CSS.AllowTricky', true);

  $purifier = new \HTMLPurifier($config);
  return $purifier->purify($html);
}
function getSafeVideoIframeRegexp(): string
{
  $hosts = implode('|', [
    // YouTube
    '(?:www\.)?youtube\.com',
    '(?:www\.)?youtube-nocookie\.com',
    'youtu\.be', // rare in iframe src; harmless to allow
    // Vimeo
    'player\.vimeo\.com',
    '(?:www\.)?vimeo\.com',
    // DailyMotion
    '(?:www\.)?dailymotion\.com',
    'geo\.dailymotion\.com',
    // Youku
    '(?:www\.)?youku\.com',
    'player\.youku\.com',
    'v\.youku\.com',
  ]);
  // Match from start of URL (after optional scheme)
  return '%^(https?:)?//(' . $hosts . ')/%i';
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
    // We look for filenames currently in the HTML that match our storage pattern.
    // Pattern matches: src="images/uploaded/folder/filename.ext"
    $quotedPath = preg_quote($storageBase, '/');
    $patternExisting = '/src="' . $quotedPath . '\/([^"]+)"/i';
    
    preg_match_all($patternExisting, $contentHtml, $matchesExisting);
    $currentImagesInHtml = $matchesExisting[1]; // e.g., ["65f123.jpg", "65f456.png"]

    // 2. CLEANUP: Delete files from disk that were removed in the editor
    foreach ($oldImgArr as $oldImg) 
    {
        Log::info($contentHtml);
        Log::info("$oldImg found?", $matchesExisting);//$currentImagesInHtml);
        if (!in_array($oldImg, $currentImagesInHtml)) 
        {
            $pathToDelete = "$storageBase/$oldImg";
            if (Storage::disk('public')->exists($pathToDelete)) 
            {
                Storage::disk('public')->delete($pathToDelete);
                Log::info("Deleted removed image: $pathToDelete");
            }
        } 
        else 
        {
            // If it's still in the HTML, keep it in our tracking array
            $newImgArr[] = $oldImg;
        }
    }

    // 3. STORAGE: Process new Base64 images
    // Pattern matches: src="data:image/png;base64,iVBORw..."
    $patternBase64 = '/src="data:image\/([a-zA-Z]*);base64,([^"]*)"/i';

    $contentHtml = preg_replace_callback($patternBase64, function($matches) use ($storageBase, &$newImgArr) {
        $extension = $matches[1];
        $base64Data = $matches[2];

        // Generate a unique filename
        $imageName = uniqid() . '.' . $extension;
        $relativePath = "$storageBase/$imageName";

        Log::info("Saving new Base64 image: $relativePath");

        // Save to the public disk
        Storage::disk('public')->put($relativePath, base64_decode($base64Data));

        // Add the new filename to our tracking array
        $newImgArr[] = $imageName;

        // Replace the Base64 string with the new relative path in the HTML
        return 'src="' . $relativePath . '"';
    }, $contentHtml);

    // Update the reference variable for the parent record
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

    // Save the resized image to the public disk
    $imageRoot = "images/uploaded/users/$userName/avatar/";
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
function deleteAvatar($imageName, $userName)
{
    $imageRoot = "images/uploaded/users/$userName/avatar/";   
    Storage::disk('public')->delete($imageRoot . 'thumb/' . $imageName);
    Storage::disk('public')->delete($imageRoot . 'small/' . $imageName);
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