<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);



        // Content Security Policy
        // Allows external media (iframes, video, audio, images), external fonts, and external scripts (over HTTPS).
        // Uses 'unsafe-inline' and 'unsafe-eval' to support React/Inertia/TinyMCE dynamically injected scripts and styles.
        $csp = "default-src 'self'; " .
               "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " .
               "style-src 'self' 'unsafe-inline' https:; " .
               "img-src * data: blob:; " .
               "media-src * data: blob:; " .
               "font-src * data:; " .
               "frame-src *; " .
               "connect-src 'self' wss: https:;";

        if (app()->environment('local')) {
            // Completely relax CSP for local development to prevent Vite/HMR conflicts
            $csp = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " .
                   "script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " .
                   "style-src * 'unsafe-inline' data: blob:; " .
                   "img-src * data: blob:; " .
                   "media-src * data: blob:; " .
                   "font-src * data: blob:; " .
                   "frame-src *; " .
                   "connect-src *;";
        }

        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}
