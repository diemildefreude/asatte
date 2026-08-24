<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Post;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DeleteHiddenPosts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'posts:delete-hidden';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deletes admin-hidden posts that have been hidden for more than the specified time.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // For testing purposes, this is set to 5 minutes.
        // TODO: To change this back to 30 days later, change `subMinutes(5)` to `subDays(30)`
        $cutoffDate = Carbon::now()->subDays(30);

        $postsToDelete = Post::where('is_hidden_by_admin', true)
                             ->whereNotNull('admin_hidden_at')
                             ->where('admin_hidden_at', '<=', $cutoffDate)
                             ->get();

        $count = 0;

        foreach ($postsToDelete as $post) {
            try {
                if ($post->user) {
                    $userName = $post->user->username;
                    $postUrl = $post->slug;
                    $postFolder = "images/uploaded/users/$userName/posts/$postUrl";
                    Storage::disk('public')->deleteDirectory($postFolder);
                }

                $post->delete();
                $count++;
            } catch (\Exception $e) {
                Log::error("Failed to delete hidden post ID {$post->id}: " . $e->getMessage());
            }
        }

        $this->info("Deleted {$count} hidden posts.");
    }
}
