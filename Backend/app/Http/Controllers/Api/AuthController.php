<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Exception;

class AuthController extends Controller
{
    public function googleLogin(Request $request)
    {
        // 1. Validasi request dari React Native
        $request->validate([
            'google_token' => 'required|string'
        ]);

        try {
            // 2. Validasi token langsung ke Google (Stateless untuk API)
            $googleUser = Socialite::driver('google')->stateless()->userFromToken($request->google_token);

            // 3. Cari user atau buat baru — gunakan updateOrCreate agar
            //    nama & avatar selalu sinkron jika user update profil Google-nya
            $user = User::updateOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name'       => $googleUser->getName(),
                    'google_id'  => $googleUser->getId(),
                    'avatar_url' => $googleUser->getAvatar(),
                ]
            );

            // 4. Hapus token lama milik user ini sebelum buat token baru
            //    Mencegah akumulasi ratusan token aktif per user
            $user->tokens()->delete();

            // 5. Generate Sanctum Token baru untuk sesi di Mobile
            $token = $user->createToken('mobile-app-token')->plainTextToken;

            // 6. Kembalikan respons standar
            return response()->json([
                'status'  => 'success',
                'message' => 'Login berhasil',
                'data'    => [
                    'token' => $token,
                    'user'  => $user
                ]
            ], 200);

        } catch (Exception $e) {
            // Tangkap error jika token kadaluarsa atau tidak valid
            return response()->json([
                'status'  => 'error',
                'message' => 'Token Google tidak valid atau kadaluarsa.'
            ], 401);
        }
    }

    public function logout(Request $request)
    {
        // Hapus token yang sedang dipakai saat ini
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Logout berhasil.'
        ], 200);
    }
}