<?php

namespace App\Http\Controllers;

use App\Enums\NotificationType;
use App\Models\Comment;
use App\Models\ProfileComment;
use App\Models\Notification;
use App\Models\Post;
use App\Models\PostView;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ActivityController extends Controller
{
    public function recordView(Post $post, Request $request)
    {
        $ipAddress = $request->ip();
        $postId = $post->id;
        $fields = [
                    'post_id' => $postId, 
                    'ip_address' => $ipAddress, 
                    'viewed_at' => Carbon::now()
        ];

        $query = PostView::where('post_id', $postId);
        $authenticatedUser = $request->user();

        if($authenticatedUser)
        {
            $query->where('user_id', $authenticatedUser->id);
            $fields['user_id'] = $authenticatedUser->id;    
        }
        else
        {            
            $binaryIp = inet_pton($ipAddress);
            $query->where('ip_address', $binaryIp);
        }
        $recentView = $query
            ->where('viewed_at', '>', Carbon::now()->subDay())
            ->first();

        if(!$recentView)
        {
            PostView::create($fields);
            $post->increment('view_count');
            return back();
        }
        else
        {
            return back();
        }
    }
    public function toggleLike(Post $post, Request $request)
    {
        $userId = $request->user()->id;

        // toggle() takes an array or a single ID and will attach it if missing 
        // or detach it if present.
        $result = $post->usersWhoLiked()->toggle($userId);

        $wasAttached = !empty($result['attached']);

        $post->loadCount('usersWhoLiked');

        $user = $request->user();
        if ($user && in_array($user->member_type, [\App\Enums\MemberType::Admin, \App\Enums\MemberType::Webmaster])) {
            return back();
        }

        return back()->with('success', $wasAttached ? 'Post liked successfully.' : 'Post unliked successfully.');
    }
    public function notifications(Request $request)
    {
        $showOnlyUnread = $request->boolean('unread_only');

        $user = $request->user();
        $amount = intval($request->query('amount', 10));
        $page = intval($request->query('page', 1));

        $queryA = $showOnlyUnread ? Notification::where('user_id', $user->id)
        ->where('is_read', false)
        : Notification::where('user_id', $user->id);

        $paginator = $queryA->latest()->paginate($amount, ['*'], 'page', $page);

        $paginator->getCollection()->transform(function ($notification) 
        {
            $type = $notification->type;
            $data = $notification->data; // JSON → array
            if (($type == NotificationType::Comment || $type == NotificationType::Reply)
                && isset($data['comment_id'])) 
            {
                $comment = Comment::with([
                    'user:id,username,avatar',
                    'post:id,title,slug,user_id',
                    'post.user:id,username'
                ])->find($data['comment_id']);

                $notification->setRelation('comment', $comment);
            }
            else if (($type == NotificationType::ProfileComment || $type == NotificationType::ProfileReply)
                && isset($data['profile_comment_id'])) 
            {
                $comment = ProfileComment::with([
                    'user:id,username,avatar',
                    'profile:id,username'
                ])->find($data['profile_comment_id']);

                $notification->setRelation('profile_comment', $comment);
            }            
            else if($type == NotificationType::Unhidden && isset($data['post_id']))
            {
                $post = Post::with([
                    'user:id,username'
                ])->select(['id', 'slug', 'title', 'user_id'])->find($data['post_id']);
                $notification->setRelation('post', $post);
                $notification->unhidden_at = Carbon::now()->toDateTimeString();
            }
            else if($type == NotificationType::Follower && isset($data['follower_id'])) 
            {
                $follower = User::select(['id', 'username', 'avatar'])->find($data['follower_id']);
                $notification->setRelation('follower', $follower);
            }
            $notification->makeHidden('data');
            
            $notification->is_read = true;
            $notification->save();
            
            return $notification;
        });

        $totalUnreadCount = Notification::where('user_id', $user->id)
        ->where('is_read', false)
        ->count();

        return Inertia::render('dashboard/Notifications', [
            'notifications' => $paginator, 
            'unread_total' => $totalUnreadCount
        ]);
    }
    public function toggleFollow(Request $request, User $user)
    {
        $authUser = $request->user();
            // Prevent self-following
        if ($authUser->id === $user->id) 
        {
            return back()->withErrors(['error' => 'You cannot follow yourself.']);
        }

        $result = $authUser->following()->toggle($user->id);
        $isFollowing = !empty($result['attached']);
        
        $notificationFields = [
            'user_id' => $user->id,
            'type' => NotificationType::Follower,
            'data' => ['follower_id' => $authUser->id]
        ];
        Notification::create($notificationFields);

        return back()->with([
            'is_following' => $isFollowing,
            'success' => $isFollowing ? 'Followed successfully.' : 'Unfollowed successfully.',
        ]);
    }
}