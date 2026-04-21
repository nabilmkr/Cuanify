<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Untuk project pure API: jangan redirect ke route 'login' yang tidak ada.
        // Kembalikan null agar AuthenticationException naik ke exception handler kita.
        $middleware->redirectGuestsTo(fn () => null);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Pastikan semua error di route /api/* selalu dikembalikan sebagai JSON
        $exceptions->shouldRenderJsonWhen(function (\Illuminate\Http\Request $request, \Throwable $e) {
            return $request->is('api/*');
        });

        // Tangkap AuthenticationException → kembalikan 401 JSON (bukan redirect ke 'login')
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, \Illuminate\Http\Request $request) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthenticated. Token tidak valid atau tidak disertakan.',
            ], 401);
        });
    })->create();
