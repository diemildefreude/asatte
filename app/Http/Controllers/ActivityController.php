<?php

namespace App\Http\Controllers;

use App\Enums\NotificationType;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\Post;
use App\Models\PostView;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
        $authenticatedUser = auth('api')->user();     

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
            return response()->json([
                'status' => 'view recorded'
            ],200);
        }
        else
        {
            return response()->json([
                'status' => 'view ignored'
            ],200);
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

        return response()->json([
            'message' => $wasAttached ? 'Post liked successfully.' : 'Post unliked successfully.',
            'liked' => $wasAttached, // True if a like was registered
            'like_count' => $post->users_who_liked_count, // The new total count
            'status' => 200,
        ]);
    }
    public function notifications(Request $request)
    {
        $request->validate([
            'items_per_page' => ['required', 'integer'],
            'current_page' => ['required', 'integer'],
        ]);

        $showOnlyUnread = isset($request['unread_only']);

        $user = $request->user();
        $itemsPerPage = $request->items_per_page;
        $currentPage = $request->current_page - 1;

        $queryA = $showOnlyUnread ? Notification::where('user_id', $user->id)
        ->where('is_read', false)
        : Notification::where('user_id', $user->id);

        $query = $queryA->latest()
        ->get()
        ->map(function ($notification) 
        {
            $type = $notification->type;
            $data = $notification->data; // JSON → array
            if (($type == NotificationType::Comment || $type == NotificationType::Reply)
                && ($data['comment_id'])) 
            {
                $comment = Comment::with([
                    'user:id,username,avatar',
                    'post:id,title,post_url,user_id',
                    'post.user:id,username'
                ])->find($data['comment_id']);

                //$notification->comment = $comment;
                $notification->setRelation('comment', $comment);
            }            
            else if($type == NotificationType::Unhidden && $data['post_id'])
            {
                $post = Post::with([
                    'user:id,username'
                ])->find($data['post_id'])->select(['id', 'post_url', 'title']);
                $notification->setRelation('post', $post);
                $notification->unhidden_at = Carbon::now()->toDateTimeString();
            }
            else if($type == NotificationType::Follower && $data['follower_id']) //for followers
            {
                $follower = User::select(['id', 'username', 'avatar'])->find($data['follower_id']);
                //Log::info("follower", $follower->toArray());
                $notification->setRelation('follower', $follower);
            }
            //else if(isset($data['user_id'])) //for followers
            $notification->makeHidden('data');
            return $notification;
        });
        
        $totalCount = $query->count();

        $notifications = $query
        ->slice($itemsPerPage * $currentPage, $itemsPerPage)
        ->values();

        $notifications->each(function ($notification) //<--uncommenting this produces the error
        {
            $notification->is_read = true;
            $notification->save();
        });

        $totalUnreadCount = Notification::where('user_id', $user->id)
        ->where('is_read', false)
        ->get()->count();

        return response()->json([
            'notifications' => $notifications, 
            'total' => $totalCount,
            'unread_total' => $totalUnreadCount
        ], 200);
    }
    public function toggleFollow(Request $request, User $user)
    {
        $authUser = $request->user();
            // Prevent self-following
        if ($authUser->id === $user->id) 
        {
            return response()->json(['message' => 'You cannot follow yourself.'], 400);
        }

        $result = $authUser->following()->toggle($user->id);
        $isFollowing = !empty($result['attached']);
        
        $notificationFields = [
            'user_id' => $user->id,
            'type' => NotificationType::Follower,
            'data' => ['follower_id' => $authUser->id]
        ];
        Notification::create($notificationFields);

        return response()->json([
            'is_following' => $isFollowing,
            'message' => $isFollowing ? 'Followed successfully.' : 'Unfollowed successfully.',
        ]);
    }
}