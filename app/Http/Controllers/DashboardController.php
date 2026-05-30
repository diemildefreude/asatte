<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Post;
use App\Enums\MemberType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
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

        $request->session()->flash('success_profile', 'Your avatar has been successfully updated.');
        return redirect()->back();
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
            'bio' => ['required', 'string']           
        ]);
        $user = $request->user();
        $userName = $user->username;
        
        $editorImageArray = $user->bio_image_urls ?? [];
        //Log::info($user);
        //Log::info("bio_image_urls:" . $editorImageArray);
        $bioStatementRaw = $request->input('bio');
        //Log::info("bio:", $bioArray);
        $newBio = saveEditorImages($bioStatementRaw, 
            $editorImageArray, "users/$userName/bio");
        $newBio = sanitizeRichHtml($newBio);
        $user->bio_image_urls = $editorImageArray; //RIGHT?!
        $user->bio = $newBio;
        $user->save();
        
        $request->session()->flash('success_bio', 'Your bio has been successfully updated.');
        return redirect()->back();
        
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

        $showEmailInProfileField = $request->input('show_email_in_profile');
        $showEmailInProfile = isset($showEmailInProfileField);

        $user = $request->user();
        $website = $request->input('website') ? addHttpProtocol($request->input('website', '')) : null;
        $user->website = $website;
        $user->location = $request->location;
        $user->show_email_in_profile = $showEmailInProfile;
        $user->save();
        
        $request->session()->flash('success_profile', 'Your profile has been successfully updated.');
        return redirect()->back();
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

    public function posts(Request $request)
    {
        $user = $request->user();
        $amount = intval($request->query('amount', 12));
        $page = intval($request->query('page', 1));

        $query = Post::with('user:id,username,avatar,member_type')
            ->where('user_id', $user->id)
            ->where('is_news', false)
            ->latest();

        $posts = $query->paginate($amount, ['*'], 'page', $page);

        return Inertia::render('dashboard/MyPosts', [
            'myPosts' => $posts,
        ]);
    }

    public function newsPosts(Request $request)
    {
        $user = $request->user();
        // only webmasters/admins can manage news posts
        if (!in_array($user->member_type, [MemberType::Webmaster, MemberType::Admin])) {
            return redirect()->back();
        }

        $amount = intval($request->query('amount', 12));
        $page = intval($request->query('page', 1));

        $query = Post::with('user:id,username,avatar,member_type')
            ->where('is_news', true)
            ->latest();

        $posts = $query->paginate($amount, ['*'], 'page', $page);

        return Inertia::render('dashboard/NewsPosts', [
            'newsPosts' => $posts,
        ]);
    }

    public function newPost(Request $request)
    {
        return Inertia::render('dashboard/NewPost');
    }

    public function newNewsPost(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->member_type, [MemberType::Webmaster, MemberType::Admin])) {
            return redirect()->back();
        }

        return Inertia::render('dashboard/NewNewsPost');
    }

    public function editPost(Request $request, $post_url)
    {
        $user = $request->user();
        $post = Post::where('post_url', $post_url)->where('user_id', $user->id)->first();
        if (!$post) {
            abort(404);
        }
        $post->load(['user:id,username,avatar,member_type', 'comments.user']);

        return Inertia::render('dashboard/EditPost', [
            'post' => $post,
        ]);
    }
}
