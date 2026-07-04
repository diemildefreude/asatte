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

        // HSTS (Strict-Transport-Security)
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

        // Prevent Clickjacking
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // Prevent MIME sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

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

        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}
