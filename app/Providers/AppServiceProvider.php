<?php

namespace App\Providers;

use App\Mail\VerifyEmail;
use App\Models\User;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Passport::enablePasswordGrant();

        if (env('APP_URL')) 
        { // Only force if APP_URL is actually set
            URL::forceRootUrl(config('app.url'));
        }
    }
}
