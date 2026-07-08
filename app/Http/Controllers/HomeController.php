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
            ->whereHas('user', fn($q) => $q->whereNull('profile_hidden_at'))
            ->where('is_news', false)
            ->where('is_private', false)
            ->where('is_hidden_by_admin', false)
            ->where('is_draft', false)
            ->inRandomOrder()
            ->limit(11)
            ->get();

        $carouselArchive = Post::with(['user:id,username,avatar,member_type'])
            ->whereHas('user', fn($q) => $q->whereNull('profile_hidden_at'))
            ->where('is_news', false)
            ->where('is_private', false)
            ->where('is_hidden_by_admin', false)
            ->where('is_draft', false)
            ->latest()
            ->limit(6)
            ->get();

        $carouselNews = Post::with(['user:id,username,avatar,member_type'])
            ->whereHas('user', fn($q) => $q->whereNull('profile_hidden_at'))
            ->where('is_news', true)
            ->where('is_private', false)
            ->where('is_hidden_by_admin', false)
            ->where('is_draft', false)
            ->latest()
            ->limit(6)
            ->get();

        $carouselFollowing = [];
        if ($user = $request->user()) {
            $followingIds = $user->following()->pluck('users.id');
            if ($followingIds->isNotEmpty()) {
                $carouselFollowing = Post::with(['user:id,username,avatar,member_type'])
                    ->whereHas('user', fn($q) => $q->whereNull('profile_hidden_at'))
                    ->whereIn('user_id', $followingIds)
                    ->where('is_news', false)
                    ->where('is_private', false)
                    ->where('is_hidden_by_admin', false)
                    ->where('is_draft', false)
                    ->latest()
                    ->limit(6)
                    ->get();
            }
        }

        // Archive posts - support random fetch with excludes, or paginated fetch
        $heroIds = $heroPosts->pluck('id')->toArray();
        $query = Post::with(['user:id,username,avatar,member_type'])
            ->whereHas('user', fn($q) => $q->whereNull('profile_hidden_at'))
            ->when(!empty($heroIds), fn($q) => $q->whereNotIn('id', $heroIds))
            ->where('is_news', false)
            ->where('is_private', false)
            ->where('is_hidden_by_admin', false)
            ->where('is_draft', false);

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
            'carouselFollowing' => $carouselFollowing,
            'archivePosts' => $archivePosts,
        ]);
    }
}
