<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        
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

        $userId = $request->user()->id;
        $fields = [
            ...$validatedFields,
            'user_id' => $userId
        ];
        $post->comments()->create($fields);

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
        $comment->delete();

        $comments = $post->comments()->with('user:id,username,avatar')->get();

        return response() ->json([
            'status' => 'comment_updated',
            'message' => 'Comment successfully deleted.',
            'comments' => $comments
        ], 200);
    }
}
