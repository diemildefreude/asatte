<?php

namespace App\Http\Controllers;

use App\Enums\MemberType;
use App\Enums\NotificationType;
use App\Models\ProfileComment;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ProfileCommentController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, User $user)
    {
        $validatedFields = $request->validate([
            'content' => ['required', 'string', 'max:5000'],
            'parent_id' => ['nullable', 'exists:profile_comments,id'], 
        ]);

        $userId = $request->user()->id;
        
        $comment = new ProfileComment($validatedFields);
        $comment->user_id = $userId;
        $comment->profile_id = $user->id;
        $comment->save();

        $repliedToUser = isset($request->parent_id) ? 
            ProfileComment::where('id', $request->parent_id)->first()->user_id
            : null;

        if ($userId == $repliedToUser) 
        {
            // don't notify users if they reply to themselves
        } 
        else if (!$repliedToUser && $userId == $user->id) 
        {
            // don't notify users if they comment on their own profile
        } 
        else 
        {
            $notificationType = $repliedToUser ? NotificationType::ProfileReply : NotificationType::ProfileComment;
            $notifiedUserId = $repliedToUser ?? $user->id;

            Notification::create([
                'user_id' => $notifiedUserId,
                'type' => $notificationType,
                'data' => [
                    'profile_comment_id' => $comment->id,
                    'actor_id' => $userId,
                    'actor_username' => $request->user()->username,
                    'profile_username' => $user->username
                ]
            ]);
        }

        return back()->with('success', 'Your comment has been posted.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user, ProfileComment $comment)
    {
        if ($comment->user_id != $request->user()->id) {
            return back()->withErrors(['error' => "This is not your comment to edit."]);
        }

        $validatedFields = $request->validate([
            'content' => ['required', 'string', 'max:5000']
        ]);

        $comment->update(['content' => $validatedFields['content']]);

        return back()->with('success', 'Your comment has been updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, User $user, ProfileComment $comment)
    {
        $requestingUser = $request->user();
        
        $isWebmaster = $requestingUser->member_type == MemberType::Webmaster;
        $isAdmin = $requestingUser->member_type == MemberType::Admin;
                       
        $isCommentOwner = $requestingUser->id == $comment->user_id;
        $isProfileOwner = $requestingUser->id == $user->id;

        $commentAuthor = $comment->user;
        $authorMemberType = $commentAuthor->member_type;

        $canDelete = false;

        if ($isCommentOwner) {
            $canDelete = true;
        } else if ($isProfileOwner) {
            $canDelete = true;
        } else if ($isWebmaster) {
            $canDelete = true;
        } else if ($isAdmin) {
            if ($authorMemberType != MemberType::Webmaster && $authorMemberType != MemberType::Admin) {
                $canDelete = true;
            }
        }

        if (!$canDelete) {
            return back()->withErrors(['error' => "You do not have permission to delete this comment."]);
        }

        $comment->delete();

        return back()->with('success', 'Comment successfully deleted.');
    }
}
