<?php

namespace App\Console\Commands;

use App\Models\PostView;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CleanupPostViews extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cleanup-post-views';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deletes all post view records older than 24 hours.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $cutoffTime = Carbon::now()->subDay();

        // Query and delete all records where 'viewed_at' is less than the cutoff time.
        $deletedCount = PostView::where('viewed_at', '<', $cutoffTime)->delete();

        // Log the result to the console output
        $this->info("Successfully deleted {$deletedCount} post view records older than 24 hours.");
    }
}
