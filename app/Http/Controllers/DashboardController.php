<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Post;
use App\Models\Comment;
use App\Models\ProfileComment;
use App\Models\User;
use App\Enums\MemberType;
use App\Enums\NotificationType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class DashboardController extends Controller
{
    public function updateAvatar(Request $request)
    {


        if(!$request->user()->hasVerifiedEmail())
        {
            Log::error("e-mail not verified");
            return back()->withInput()->with([
                'status' => 'change_profile_unverified',
                'error_message' => 'Your email address must be verified to edit your profile.'
            ]);
        }

        $request->validate
        ([
            'avatar' => ['required', 'image', 'mimes:png,jpeg,jpg,webp,bmp']   
        ]);
        $user = $request->user();
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
            return back()->withInput()->with([
                'status' => 'change_profile_unverified',
                'error_message' => 'Your email address must be verified to edit your bio.'
            ]);
        }

        $request->validate
        ([
            'bio' => ['required', 'string']           
        ]);
        $user = $request->user();
        $userName = $user->username;
        
        $editorImageArray = $user->bio_image_urls ?? [];


        $bioStatementRaw = $request->input('bio');

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
            return back()->withInput()->with([
                'status' => 'change_profile_unverified',
                'error_message' => 'Your email address must be verified to edit your profile.'
            ]);
        }

        $request->validate
        ([
            'websites' => ['nullable', 'array', 'max:3'],
            'websites.*' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'theme' => ['nullable', 'string', 'in:default,sunset,bubblegum,noir']
        ]);

        
        $showEmailInProfile = $request->boolean('show_email_in_profile');

        $user = $request->user();
        $websitesInput = $request->input('websites');
        $websites = [];
        if (is_array($websitesInput)) {
            foreach ($websitesInput as $url) {
                if (trim($url)) {
                    $websites[] = addHttpProtocol($url);
                }
            }
        }
        $user->websites = empty($websites) ? null : $websites;
        $user->location = $request->location;
        $user->show_email_in_profile = $showEmailInProfile;
        $user->accepts_emails = $request->boolean('accepts_emails', true);
        $user->theme = $request->input('theme', 'default');
        $user->save();
        
        $request->session()->flash('success_profile', 'Your profile has been successfully updated.');
        return redirect()->back();
    }

    public function posts(Request $request)
    {
        $user = $request->user();
        $amount = 12;
        $page = 1;
        if ($request->header('X-Inertia-Partial-Data')) {
            $amount = intval($request->query('amount', 12));
            $page = intval($request->query('page', 1));
        }

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

        $amount = 12;
        $page = 1;
        if ($request->header('X-Inertia-Partial-Data')) {
            $amount = intval($request->query('amount', 12));
            $page = intval($request->query('page', 1));
        }

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

    public function editPost(Request $request, $slug)
    {
        $user = $request->user();
        $post = Post::where('slug', $slug)->where('user_id', $user->id)->first();
        if (!$post) {
            abort(404);
        }
        $post->load(['user:id,username,avatar,member_type', 'comments.user']);

        return Inertia::render('dashboard/EditPost', [
            'post' => $post,
        ]);
    }

    public function activity(Request $request)
    {
        $user = $request->user();

        $likedPosts = Post::select('posts.*', 'post_user.id as pivot_id', 'post_user.created_at as liked_at')
            ->join('post_user', 'posts.id', '=', 'post_user.post_id')
            ->where('post_user.user_id', $user->id)
            ->with('user:id,username,avatar')
            ->orderBy('post_user.created_at', 'desc')
            ->limit(6)->get();

        $comments = Comment::with(['post:id,title,slug,user_id', 'post.user:id,username'])
            ->where('user_id', $user->id)
            ->latest()
            ->limit(3)->get();

        $notifications = Notification::where('user_id', $user->id)
            ->latest()
            ->limit(3)->get()
            ->map(function ($notification) {
                $type = $notification->type;
                $data = $notification->data;
                if (($type == NotificationType::Comment || $type == NotificationType::Reply) && isset($data['comment_id'])) {
                    $comment = Comment::with(['user:id,username,avatar', 'post:id,title,slug,user_id', 'post.user:id,username'])->find($data['comment_id']);
                    $notification->setRelation('comment', $comment);
                } else if (($type == NotificationType::ProfileComment || $type == NotificationType::ProfileReply) && isset($data['profile_comment_id'])) {
                    $comment = ProfileComment::with(['user:id,username,avatar', 'profile:id,username'])->find($data['profile_comment_id']);
                    $notification->setRelation('profile_comment', $comment);
                } else if ($type == NotificationType::Unhidden && isset($data['post_id'])) {
                    $post = Post::with(['user:id,username'])->select(['id', 'slug', 'title', 'user_id'])->find($data['post_id']);
                    $notification->setRelation('post', $post);
                    $notification->unhidden_at = \Carbon\Carbon::now()->toDateTimeString();
                } else if ($type == NotificationType::Follower && isset($data['follower_id'])) {
                    $follower = User::select(['id', 'username', 'avatar'])->find($data['follower_id']);
                    $notification->setRelation('follower', $follower);
                }
                $notification->makeHidden('data');
                if(!$notification->is_read) {
                    $notification->is_read = true;
                    $notification->save();
                }
                return $notification;
            });

        $followers = $user->followers()->select('users.id', 'users.avatar', 'users.username')->limit(6)->get();
        $following = $user->following()->select('users.id', 'users.avatar', 'users.username')->limit(6)->get();

        return Inertia::render('dashboard/Activity', [
            'initialLikedPosts' => $likedPosts,
            'initialComments' => $comments,
            'initialNotifications' => $notifications,
            'initialFollowers' => $followers,
            'initialFollowing' => $following,
        ]);
    }
    public function deleteAccountForm()
    {
        return Inertia::render('dashboard/DeleteAccount');
    }

    public function deleteAccount(Request $request)
    {
        $user = $request->user();
        $user->profile_hidden_at = now();
        $user->save();

        return redirect()->route('dashboard');
    }

    public function restoreAccount(Request $request)
    {
        $user = $request->user();
        $user->profile_hidden_at = null;
        $user->save();

        $request->session()->flash('success', 'Your account has been successfully restored.');

        return redirect()->back();
    }
}
