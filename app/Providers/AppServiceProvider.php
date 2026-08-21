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

        // Access tokens expire in 15 minutes, refresh tokens last for 30 days
        Passport::tokensExpireIn(now()->addMinutes(15));
        Passport::refreshTokensExpireIn(now()->addDays(30));
        
        if (env('APP_URL')) 
        { // Only force if APP_URL is actually set
            URL::forceRootUrl(config('app.url'));
        }
        
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        // Share default email theme variables across all emails.* Blade views
        \Illuminate\Support\Facades\View::composer('emails.*', function ($view) 
        {
            $view->with([
                'mainTextColor' => $view->getData()['mainTextColor'] ?? '#ffffff',
                'buttonTextColor' => $view->getData()['buttonTextColor'] ?? '#28dbff',
                'footnoteColor' => $view->getData()['footnoteColor'] ?? '#cdcdcd',
                'fontFamily' => $view->getData()['fontFamily'] ?? "'Cascadia Code', ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, 'Courier New', monospace",
                'buttonHoverTextColor' => $view->getData()['buttonHoverTextColor'] ?? '#FFE4AF',
                'buttonHoverFallbackColor' => $view->getData()['buttonHoverFallbackColor'] ?? '#1177c0',
            ]);
        });
    }
}
