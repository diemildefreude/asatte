<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Notification;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $unread = [
            'has_unread_notifications' => false,
            'has_unread_mail' => false,
        ];

        if ($user) {
            $unread = [
                'has_unread_notifications' => Notification::where('user_id', $user->id)
                    ->where('is_read', false)->exists(),
                'has_unread_mail' => $user->conversations()
                    ->where(function ($query) {
                        $query->whereColumn('conversations.updated_at', '>', 'conversation_user.last_read_at')
                              ->orWhereNull('conversation_user.last_read_at');
                    })->exists(),
            ];
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user,
            ],
            'flash' => fn () => [
                'status'  => $request->session()->get('status'),
                'success' => $request->session()->get('success'),
                'success_bio' => $request->session()->get('success_bio'),
                'success_profile' => $request->session()->get('success_profile'),
                'error'   => $request->session()->get('error'),
            ],
            'unread' => $unread,
        ]);
    }
}
