<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $amount = intval($request->query('amount', 12));
        $fetchOrder = $request->query('fetch_order', 'random');
        $page = $request->query('page', null);
        $excludes = $request->query('excludes', null);

        // Hero and carousel are small and safe to include on full renders
        $heroPosts = Post::with(['user:id,username,avatar,member_type'])
            ->where('is_news', false)
            ->where('is_private', false)
            ->where('is_hidden_by_admin', false)
            ->latest()
            ->limit(8)
            ->get();

        $carouselArchive = Post::with(['user:id,username,avatar,member_type'])
            ->where('is_news', false)
            ->where('is_private', false)
            ->where('is_hidden_by_admin', false)
            ->latest()
            ->limit(6)
            ->get();

        $carouselNews = Post::with(['user:id,username,avatar,member_type'])
            ->where('is_news', true)
            ->where('is_private', false)
            ->where('is_hidden_by_admin', false)
            ->latest()
            ->limit(6)
            ->get();

        // Archive posts - support random fetch with excludes, or paginated fetch
        $query = Post::with(['user:id,username,avatar,member_type'])
            ->where('is_news', false)
            ->where('is_private', false)
            ->where('is_hidden_by_admin', false);

        if ($fetchOrder === 'random') {
            if ($excludes) {
                $ids = array_filter(array_map('intval', explode(',', $excludes)));
                if (!empty($ids)) {
                    $query->whereNotIn('id', $ids);
                }
            }
            $archivePosts = $query->inRandomOrder()->limit($amount)->get();
        } else {
            // Use standard Laravel pagination for deterministic ordering
            $order = $fetchOrder === 'desc' ? 'desc' : 'asc';
            $archivePosts = $query->orderBy('id', $order)->paginate($amount)->withQueryString();
        }

        return Inertia::render('Home', [
            'heroPosts' => $heroPosts,
            'carouselArchive' => $carouselArchive,
            'carouselNews' => $carouselNews,
            'archivePosts' => $archivePosts,
        ]);
    }
}
