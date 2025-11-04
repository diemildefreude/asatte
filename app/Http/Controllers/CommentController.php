<?php

namespace App\Http\Controllers;

use App\Enums\NotificationType;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $request->validate([
            'items_per_page' => ['required', 'integer'],
            'current_page' => ['required', 'integer'],
        ]);
        
        $user = $request->user();
        $itemsPerPage = $request->items_per_page; //5
        $currentPage = $request->current_page - 1; //2 - 1 = 1

        $query = Comment::with([
            'post:id,post_url,title,user_id',
            'post.user:id,username'
        ])
        ->where('user_id', $user->id)
        ->latest();

        $totalCount = $query->count();

        $comments = $query->skip($itemsPerPage * $currentPage)
        ->take($itemsPerPage)
        ->get();
        //Log::info("$user->id's comments", $comments);
        
        return response()->json(['comments' => $comments, 'total' => $totalCount], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Post $post)
    {
        Log::info("storing comment", ['postId' => $post->id]);
        $validatedFields = $request->validate([
            'content' => ['required', 'string', 'max:5000'],
            'parent_id' => ['nullable', 'exists:comments,id'], 
        ]);
        Log::info("parent id is $request->parent_id");

        $userId = $request->user()->id;
        $commentFields = [
            ...$validatedFields,
            'user_id' => $userId
        ];
        $comment = $post->comments()->create($commentFields);

        $repliedToUser = isset($request->parent_id) ? 
            Comment::where('id', $request->parent_id)->first()->user_id
            : null;

        if($userId == $repliedToUser) //don't notify users if they reply to themselves
        {} 
        else if(!$repliedToUser && $userId == $post->user_id)
        {} //don't notify users if they comment on their own posts
        else 
        {
            $userToNotify = $repliedToUser ?? $post->user_id;
            $notificationType = $repliedToUser ? NotificationType::Reply : NotificationType::Comment;

            $notificationFields = [
                'user_id' => $userToNotify,
                'type' => $notificationType,
                'data' => ['post_id' => $post->id, 'comment_id' => $comment->id]
            ];
            Notification::create($notificationFields);
        }

        $comments = $post->comments()->with('user:id,username,avatar')->get();

        return response() ->json([
            'status' => 'comment_left',
            'message' => 'Your comment has been made.',
            'comments' => $comments
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post, Comment $comment)
    {
        //Log::info("updating comment", ['postId' => $post->id]);
        $validatedFields = $request->validate([
            'content' => ['required', 'string', 'max:5000']
        ]);
        $updatedContent = $validatedFields['content'];

        $comment->update(['content' => $updatedContent]);

        $comments = $post->comments()->with('user:id,username,avatar')->get();

        return response() ->json([
            'status' => 'comment_updated',
            'message' => 'Your comment has been updated.',
            'comments' => $comments
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post, Comment $comment)
    {
        Log::info("Deleting comment $comment->id");
        $comment->delete();

        $comments = $post->comments()->with('user:id,username,avatar')->get();

        return response() ->json([
            'status' => 'comment_updated',
            'message' => 'Comment successfully deleted.',
            'comments' => $comments
        ], 200);
    }
}
