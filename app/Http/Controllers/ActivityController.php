<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\PostView;
use Carbon\Carbon;
use Illuminate\Http\Request;

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
}