<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $amount = intval($request->query('amount', 12));
        $query = Post::with(['user:id,username,avatar,member_type'])
            ->whereHas('user', fn($q) => $q->whereNull('profile_hidden_at'))
            ->where('is_news', true)
            ->where('is_private', false)
            ->where('is_hidden_by_admin', false)
            ->where('is_draft', false)
            ->latest();

        $newsPosts = $query->paginate($amount)->withQueryString();

        return Inertia::render('News', ['newsPosts' => $newsPosts]);
    }
}
