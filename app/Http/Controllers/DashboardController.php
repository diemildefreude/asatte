<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class DashboardController extends Controller
{
    public function updateAvatar(Request $request)
    {
        // Log::info($request);

        if (!$request->hasFile('avatar')) 
        {
            return response()->json(['error' => 'No avatar file detected by Laravel.'], 422);
        }

        if(!$request->user()->hasVerifiedEmail())
        {
            Log::error("e-mail not verified");
            return response()->json([
                'message' => 'Your email address must be verified to edit your profile.', // <--- Top-level message
                'status' => 'change_profile_unverified'
            ], Response::HTTP_FORBIDDEN);
        }

        $request->validate
        ([
            'avatar' => ['required', 'image', 'mimes:png,jpeg,jpg,webp,bmp']   
        ]);
        $user = $request->user();
        if($user->avatar)
        {
            deleteAvatar($user->avatar, $user->username);
        }
        $imgPath = saveAvatarImage($request->file('avatar'), $user->username);
        $user->avatar = $imgPath;
        $user->save();

        return response() ->json([
            'status' => 'bio_updated',
            'message' => 'Your avatar has been successfully updated.'
        ], 200);
    }
    public function updateBio(Request $request)
    {        
        if(!$request->user()->hasVerifiedEmail())
        {
            Log::error("e-mail not verified");
            return response()->json([
                'message' => 'Your email address must be verified to edit your bio.', // <--- Top-level message
                'status' => 'change_profile_unverified'
            ], Response::HTTP_FORBIDDEN);
        }

        $request->validate
        ([
            'bio' => ['required', 'json']           
        ]);
        $user = $request->user();
        $userName = $user->username;
        
        $editorImageArray = $user->bio_image_urls ?? [];
        //Log::info($user);
        //Log::info("bio_image_urls:" . $editorImageArray);
        $bioArray = json_decode($request->input('bio'));
        Log::info("bio:", $bioArray);
        $newBio = saveEditorImages($bioArray, 
            $editorImageArray, "users/$userName/bio");
        $user->bio_image_urls = $editorImageArray; //RIGHT?!
        $user->bio = $newBio;
        $user->save();
        
        return response() ->json([
            'status' => 'bio_updated',
            'message' => 'Your bio has been successfully updated.'
        ], 200);
        
    }
    public function updateProfile(Request $request)
    {
        if(!$request->user()->hasVerifiedEmail())
        {
            Log::error("e-mail not verified");
            return response()->json([
                'message' => 'Your email address must be verified to edit your profile.', // <--- Top-level message
                'status' => 'change_profile_unverified'
            ], Response::HTTP_FORBIDDEN);
        }

        $request->validate
        ([
            'website' => ['required', 'string'],
            'location' => ['required', 'string']            
        ]);

        $user = $request->user();
        $website = $request->input('website') ? addHttpProtocol($request->input('website', '')) : null;
        $user->website = $website;
        $user->location = $request->location;
        $user->save();
        
        return response() ->json([
            'status' => 'profile_updated',
            'message' => 'Your profile has been successfully updated.'
        ], 200);
    }
    public function unreadStatus(Request $request)
    {
        $user = $request->user();
        $hasUnreadNotifications = Notification::where('user_id', $user->id)
        ->where('is_read', false)->exists();//get()->count() > 0;

        $hasUnreadMail = $user->conversations()
            ->where(function ($query) 
            {
                $query->whereColumn('conversations.updated_at', '>', 'conversation_user.last_read_at')
                  ->orWhereNull('conversation_user.last_read_at');
            })->exists();
        
        return response()->json([
            'has_unread_notifications' => $hasUnreadNotifications,
            'has_unread_mail' => $hasUnreadMail
        ],200);
    }
}
