<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller
{
    public function userSearch(string $searchTerm)
    {
        $users = User::where('username', 'LIKE', '%' . $searchTerm . '%')
        ->select('username', 'id', 'avatar')
        ->take(8)
        ->get();
        //Log::info("users?", $users->toArray());
        return response()->json($users);
    }
    public function user(string $userName)
    {
        $user = User::where('username', $userName)
            ->select('id', 'avatar', 'bio', 'location', 'website', 'show_email_in_profile', 'email')
            ->first();

        if (!$user) 
        {
             return response()->json(['error' => 'No user by that name found.'], 404);
        }
        
        if(!$user->show_email_in_profile)
        {   
            $user->makeHidden('email');
        }
        //Log::info("toggling follow for user", $user->toArray());
        
        

        $user->is_following = false;

         /** @var \App\Models\User $authUser */
        $authUser = auth('api')->user();
        //Log::info("auth?", $authUser->toArray());
        // If the request is authenticated, check if the current user follows this one
        if ($authUser) 
        {
            $user->is_following = $authUser
                ->following()
                ->where('followed_id', $user->id)
                ->exists();
        }
        return \Inertia\Inertia::render('Profile', ['user' => $user]);
    }
    public function following(Request $request, User $user)
    {
        $request->validate([
            'items_per_page' => ['required', 'integer'],
            'current_page' => ['required', 'integer'],
        ]);
        $itemsPerPage = $request->items_per_page;
        $currentPage = $request->current_page - 1;
        $user ??= auth('api')->user();
        /** @var \App\Models\User $user */
        $query = $user->following()
            ->select('users.id', 'users.avatar', 'users.username')
            ->get();
        
        $totalCount = $query->count();
        $following = $query
        ->slice($itemsPerPage * $currentPage, $itemsPerPage);
        //Log::info("$user->id is following", $following->toArray());
        return response()->json([
            "users" => $following->values(),
            "total" => $totalCount], 200);
    }
    public function followers(Request $request, User $user)
    {
        $request->validate([
            'items_per_page' => ['required', 'integer'],
            'current_page' => ['required', 'integer'],
        ]);
        $itemsPerPage = $request->items_per_page;
        $currentPage = $request->current_page - 1;
        $user = $user ?? auth('api')->user();
        /** @var \App\Models\User $user */
        $query = $user->followers()        
            ->select('users.id', 'users.avatar', 'users.username')
            ->get();
        
        $totalCount = $query->count();
        $followers = $query
        ->slice($itemsPerPage * $currentPage, $itemsPerPage);
        return response()->json([
            "users" => $followers->values(),
            "total" => $totalCount], 200);
    }
}