<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller
{
    public function user($userName)
    {
        $user = User::where('username', $userName)
            ->select('avatar', 'bio', 'location', 'website', /*'email',*/ /*'member_type'*/)
            ->first();

        if (!$user) 
        {
             return response()->json(['error' => 'No user by that name found.'], 404);
        }

        return response()->json($user);
    }
}