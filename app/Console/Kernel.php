<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     * This method is where you register the command for periodic execution.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule): void
    {
        // Schedule the command to run once every day at midnight (00:00).
        // This is a good, low-traffic time for database cleanup.
        $schedule->command('app:cleanup-post-views')->daily();
    }

    /**
     * Register the commands for the application.
     * This method tells Laravel where to find your custom Artisan commands.
     *
     * @return void
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
    }
}