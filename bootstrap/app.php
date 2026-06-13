<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Routing\Exceptions\InvalidSignatureException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
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
            // Log the event for debugging/monitoring
            Log::info('InvalidSignatureException caught for URL: ' . $request->fullUrl());

            // Redirect to your frontend dashboard with a specific status
            return redirect('/dashboard?status=invalid_link');
        });

        $exceptions->renderable(function (NotFoundHttpException $e, Request $request) {
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Not Found.'], 404);
            }
            return Inertia::render('NotFound')
                ->toResponse($request)
                ->setStatusCode(404);
        });
    })
    ->create();
