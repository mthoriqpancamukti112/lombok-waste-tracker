<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    // Mengarahkan user ke halaman login Google
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    // Menangani kembalian data dari Google
    public function callback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Cek apakah email sudah terdaftar sebelumnya (baik via manual maupun Google)
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // Jika user sudah ada, update google_id & avatar (kalau sebelumnya daftar manual)
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);
            } else {
                // Jika user belum ada, BUAT USER BARU
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => Hash::make(Str::random(24)),
                    'role' => 'warga',
                ]);

                Warga::create([
                    'user_id' => $user->id,
                    'poin_kepercayaan' => 0,
                    'is_terverifikasi' => false,
                ]);
            }

            // Login-kan user tersebut
            Auth::login($user);

            // Regenerate session untuk keamanan
            $request->session()->regenerate();

            return redirect()->intended(route('dashboard.warga', absolute: false));
        } catch (\Exception $e) {
            // Jika batal login atau error, kembalikan ke halaman login dengan pesan
            return redirect()->route('login')->with('error', 'Gagal login menggunakan Google.');
        }
    }
}
