<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\AiInsightController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Endpoint Public (Tidak perlu token Sanctum)
Route::post('/auth/google', [AuthController::class, 'googleLogin']);

// Endpoint Private (Hanya bisa diakses kalau punya token Sanctum)
Route::middleware('auth:sanctum')->group(function () {

    // Info user yang sedang login
    Route::get('/me', function (Request $request) {
        return response()->json(['status' => 'success', 'data' => $request->user()]);
    });

    // Logout (hapus token saat ini)
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // CRUD Transaksi
    Route::apiResource('transactions', TransactionController::class);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Analytics / Ringkasan keuangan
    Route::get('/analytics/summary', [AnalyticsController::class, 'summary']);
    Route::get('/analytics/trend', [AnalyticsController::class, 'trend']);
    Route::get('/analytics/category-distribution', [AnalyticsController::class, 'categoryDistribution']);

    // AI Insight — analisis keuangan dari FastAPI + Gemini
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::get('/settings/notifications', [SettingsController::class, 'notificationStatus']);
    Route::put('/settings/notifications', [SettingsController::class, 'updateNotificationStatus']);
    Route::post('/settings/security/revoke-tokens', [SettingsController::class, 'revokeOtherTokens']);

    Route::post('/financial-insight', [AiInsightController::class, 'getInsight']);
    Route::post('/financial-insight/refresh', [AiInsightController::class, 'refreshInsight']);
    Route::get('/financial-insight/history', [AiInsightController::class, 'history']);
});
