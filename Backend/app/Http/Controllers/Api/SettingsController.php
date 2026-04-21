<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function notificationStatus(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'notifications_enabled' => (bool) $request->user()->notifications_enabled,
            ],
        ]);
    }

    public function updateNotificationStatus(Request $request)
    {
        $validated = $request->validate([
            'notifications_enabled' => 'required|boolean',
        ]);

        $request->user()->update([
            'notifications_enabled' => $validated['notifications_enabled'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pengaturan notifikasi berhasil diperbarui.',
            'data' => [
                'notifications_enabled' => (bool) $request->user()->notifications_enabled,
            ],
        ]);
    }

    public function revokeOtherTokens(Request $request)
    {
        $currentTokenId = optional($request->user()->currentAccessToken())->id;

        $query = $request->user()->tokens();
        if ($currentTokenId !== null) {
            $query->whereKeyNot($currentTokenId);
        }

        $deleted = $query->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Token lain berhasil dicabut.',
            'data' => [
                'revoked_tokens' => $deleted,
            ],
        ]);
    }
}
