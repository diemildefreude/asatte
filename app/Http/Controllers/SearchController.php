<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $searchTerm = $request->query('q', '');
        if (strlen(trim($searchTerm)) < 2) {
            return Inertia::render('SearchResults', ['searchTerm' => $searchTerm, 'searchPosts' => []]);
        }

        $amount = intval($request->query('amount', 12));
        $query = Post::with(['user:id,username,avatar,member_type'])
            ->whereHas('user', fn($q) => $q->whereNull('profile_hidden_at'))
            ->where('is_private', false)
            ->where('is_draft', false)
            ->where('is_hidden_by_admin', false)
            ->where(function ($q) use ($searchTerm) {
                $q->where('title', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('slug', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('subtitle', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('website', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('statement', 'LIKE', "%{$searchTerm}%");
            })
            ->orderByRaw(
                "CASE WHEN title LIKE ? THEN 1 WHEN slug LIKE ? THEN 2 WHEN subtitle LIKE ? THEN 3 WHEN website LIKE ? THEN 4 WHEN statement LIKE ? THEN 5 ELSE 6 END ASC",
                ["%{$searchTerm}%", "%{$searchTerm}%", "%{$searchTerm}%", "%{$searchTerm}%", "%{$searchTerm}%"]
            );

        $posts = $query->paginate($amount)->withQueryString();

        return Inertia::render('SearchResults', ['searchTerm' => $searchTerm, 'searchPosts' => $posts]);
    }
}
