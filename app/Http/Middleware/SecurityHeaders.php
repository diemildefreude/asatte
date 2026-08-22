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
        // Enforce HTTPS redirect for non-secure HTTP requests in production
        if (!app()->environment('local') && !$request->secure() && $request->header('X-Forwarded-Proto') !== 'https') {
            return redirect()->secure($request->getRequestUri(), 301);
        }

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
               "connect-src 'self' wss: https: data:;";

        if (app()->environment('local')) {
            // Completely relax CSP for local development to prevent Vite/HMR conflicts
            $csp = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " .
                   "script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " .
                   "style-src * 'unsafe-inline' data: blob:; " .
                   "img-src * data: blob:; " .
                   "media-src * data: blob:; " .
                   "font-src * data: blob:; " .
                   "frame-src *; " .
                   "connect-src * data: blob:;";
        }

        if (!app()->environment('local')) {
            $csp = "upgrade-insecure-requests; " . $csp;
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        $response->headers->set('Content-Security-Policy', $csp);
        
        // Permissions Policy (formerly Feature Policy)
        // Restricts access to sensitive browser features (camera, mic, geolocation, etc.)
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');

        return $response;
    }
}
