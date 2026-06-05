<?php

namespace App\Http\Controllers;

use App\Enums\MemberType;
use App\Enums\NotificationType;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $amount = intval($request->query('amount', 10));
        $page = intval($request->query('page', 1));

        $query = Comment::with([
            'post:id,post_url,title,user_id',
            'post.user:id,username'
        ])
        ->where('user_id', $user->id)
        ->latest();

        $comments = $query->paginate($amount, ['*'], 'page', $page);
        
        return Inertia::render('dashboard/UserComments', [
            'comments' => $comments,
        ]);
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

        return back()->with('success', 'Your comment has been made.');
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
        if($comment->user_id != $request->user()->id)
        {
            return back()->withErrors(['error' => "This is not your comment to edit."]);
        }
        //Log::info("updating comment", ['postId' => $post->id]);
        $validatedFields = $request->validate([
            'content' => ['required', 'string', 'max:5000']
        ]);
        $updatedContent = $validatedFields['content'];

        $comment->update(['content' => $updatedContent]);

        return back()->with('success', 'Your comment has been updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Post $post, Comment $comment)
    {
        $requestingUser = $request->user();
        $isAdminRequest = $requestingUser->member_type == MemberType::Webmaster 
                || $requestingUser->member_type == MemberType::Admin;
        if($requestingUser->id != $comment->user_id && !$isAdminRequest)
        {
            return back()->withErrors(['error' => "This is not your comment to delete."]);
        }
        Log::info("Deleting comment $comment->id");
        $comment->delete();

        return back()->with('success', 'Comment successfully deleted.');
    }
}
