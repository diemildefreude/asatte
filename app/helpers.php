<?php

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Imagick\Driver;
use Intervention\Image\ImageManager;
//----HELPER FUNCTIONS----
function addHttpProtocol(string $url): string
{
    if ($url && !str_starts_with($url, 'http://') 
        && !str_starts_with($url, 'https://')) 
    {
        return 'http://' . $url;
    }

    return $url;
}
function saveEditorImages($contentArray, &$oldImgArr, $folderPath)
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