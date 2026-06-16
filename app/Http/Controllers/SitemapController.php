<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;

class SitemapController extends Controller
{
    public function index()
    {
        $posts = Post::where('is_private', false)
            ->where('is_hidden_by_admin', false)
            ->where('is_draft', false)
            ->orderBy('updated_at', 'desc')
            ->get();

        $users = User::orderBy('updated_at', 'desc')->get();

        return response()->view('sitemap', [
            'posts' => $posts,
            'users' => $users,
        ])->header('Content-Type', 'text/xml');
    }
}
