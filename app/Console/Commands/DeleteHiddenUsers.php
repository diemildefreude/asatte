<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DeleteHiddenUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:delete-hidden';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deletes user accounts that have been marked for deletion for more than the specified time.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // For testing purposes, this is set to 2 minutes.
        // TODO: To change this back to 30 days later, change `subMinutes(5)` to `subDays(30)`
        $cutoffDate = Carbon::now()->subDays(30);

        $usersToDelete = User::whereNotNull('profile_hidden_at')
                             ->where('profile_hidden_at', '<=', $cutoffDate)
                             ->get();

        $count = 0;

        foreach ($usersToDelete as $user) 
        {
            try 
            {
                // Delete user's public storage directory which includes avatar, posts, statement, etc.
                $userFolder = "images/uploaded/users/{$user->username}";
                Storage::disk('public')->deleteDirectory($userFolder);

                // Scrub <img> tags from all messages sent by the user so conversation isn't broken with dead links
                $userMessages = $user->messages()->get();
                foreach ($userMessages as $message) 
                {
                    // Replace <img ...> with placeholder
                    $cleanContent = preg_replace('/<img[^>]+>/i', '<p class="notice small">[image removed]</p>', $message->content);
                    $message->update(['content' => $cleanContent]);
                }

                // Delete the user model (which will cascade delete their posts as per DB schema)
                $user->delete();
                
                $count++;
            } 
            catch (\Exception $e) 
            {
                Log::error("Failed to delete user ID {$user->id}: " . $e->getMessage());
            }
        }

        $this->info("Deleted {$count} hidden users.");
    }
}
