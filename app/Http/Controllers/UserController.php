<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Post;
use App\Models\ProfileComment;
use App\Enums\MemberType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller
{
    public function userSearch(string $searchTerm)
    {
        $users = User::where('username', 'LIKE', '%' . $searchTerm . '%')
        ->whereNull('profile_hidden_at')
        ->select('username', 'id', 'avatar')
        ->take(8)
        ->get();

        return response()->json($users);
    }
    public function user(string $userName)
    {
        $user = User::where('username', $userName)
            ->select('id', 'username', 'avatar', 'bio', 'location', 'websites', 'show_email_in_profile', 'email', 'profile_hidden_at')
            ->first();

        if (!$user || $user->profile_hidden_at) 
        {
             abort(404);
        }

        $authUser = auth()->user();
        $isAdminRequest = false;
        if ($authUser) 
        {
            $isAdminRequest = $authUser->member_type == MemberType::Webmaster 
                || $authUser->member_type == MemberType::Admin;
        }

        if ($user->profile_hidden_at !== null && (!$authUser || $authUser->id !== $user->id) && !$isAdminRequest)
        {
            abort(404);
        }
        
        if(!$user->show_email_in_profile)
        {   
            $user->makeHidden('email');
        }

        
        

        $user->is_following = false;

        // If the request is authenticated, check if the current user follows this one
        if ($authUser) 
        {
            $user->is_following = $authUser
                ->following()
                ->where('followed_id', $user->id)
                ->exists();
        }

        $posts = Post::with('user:id,username,avatar,member_type')
            ->where('user_id', $user->id)
            ->where('is_private', false)
            ->where('is_news', false)
            ->when(!$isAdminRequest, fn($q) => $q->where('is_hidden_by_admin', false))
            ->where('is_draft', false)
            ->latest()
            ->limit(12)
            ->get();

        $profileComments = ProfileComment::with('user:id,username,avatar,member_type')
            ->where('profile_id', $user->id)
            ->latest()
            ->get();

        return \Inertia\Inertia::render('UserProfile', [
            'user' => $user,
            'initialPosts' => $posts,
            'profileComments' => $profileComments
        ]);
    }

    public function posts(Request $request, string $userName)
    {
        $user = User::where('username', $userName)->first();
        if (!$user) {
            abort(404);
        }

        /** @var \App\Models\User $authUser */
        $authUser = auth()->user();
        $isAdminRequest = false;
        if ($authUser) {
            $isAdminRequest = $authUser->member_type == MemberType::Webmaster 
                || $authUser->member_type == MemberType::Admin;
        }

        $amount = intval($request->query('amount', 12));
        $page = intval($request->query('page', 1));

        $posts = Post::with('user:id,username,avatar,member_type')
            ->where('user_id', $user->id)
            ->where('is_private', false)
            ->where('is_news', false)
            ->when(!$isAdminRequest, fn($q) => $q->where('is_hidden_by_admin', false))
            ->where('is_draft', false)
            ->latest()
            ->paginate($amount, ['*'], 'page', $page);

        return \Inertia\Inertia::render('Posts', [
            'username' => $userName,
            'archivePosts' => $posts
        ]);
    }
    public function following(Request $request, User $user = null)
    {
        $user = $user ?? $request->user();
        if (!$user) {
            abort(404);
        }

        $amount = intval($request->query('amount', 120));
        $page = intval($request->query('page', 1));
        
        $paginator = $user->following()
            ->select('users.id', 'users.avatar', 'users.username')
            ->paginate($amount, ['*'], 'page', $page);
            
        return \Inertia\Inertia::render('Following', [
            'usersList' => $paginator,
            'memberProp' => $user
        ]);
    }

    public function followers(Request $request, User $user = null)
    {
        $user = $user ?? $request->user();
        if (!$user) {
            abort(404);
        }

        $amount = intval($request->query('amount', 120));
        $page = intval($request->query('page', 1));
        
        $paginator = $user->followers()        
            ->select('users.id', 'users.avatar', 'users.username')
            ->paginate($amount, ['*'], 'page', $page);
            
        return \Inertia\Inertia::render('Followers', [
            'usersList' => $paginator,
            'memberProp' => $user
        ]);
    }
}