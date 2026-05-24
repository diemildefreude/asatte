<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Routing\Exceptions\InvalidSignatureException;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) 
    {
        $middleware->append(HandleCors::class);
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) 
    {
        $exceptions->renderable(function (InvalidSignatureException $e, Request $request) { // <--- Note Request type-hint
            $reactAppUrl = config('app.react_app_url', 'http://localhost:3000');

            // Log the event for debugging/monitoring
            Log::info('InvalidSignatureException caught for URL: ' . $request->fullUrl());

            // Redirect to your frontend dashboard with a specific status
            return redirect($reactAppUrl . '/dashboard?status=invalid_link');
        });
    })
    ->create();
