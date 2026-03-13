<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use Carbon\Carbon;
use App\Mail\OtpMail;

class OtpPasswordResetController extends Controller
{
    // 1. Minta OTP
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'Email ini tidak terdaftar di sistem kami.'
        ]);

        // Generate 6 digit angka acak
        $otp = rand(100000, 999999);

        // Simpan ke tabel password_reset_tokens (Timpa jika sudah ada)
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($otp), // Hash OTP demi keamanan
                'created_at' => Carbon::now()
            ]
        );

        // Kirim Email
        Mail::to($request->email)->send(new OtpMail($otp));

        return response()->json(['message' => 'OTP berhasil dikirim']);
    }

    // 2. Verifikasi OTP
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|numeric|digits:6',
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record) {
            return response()->json(['message' => 'Sesi OTP tidak ditemukan.'], 400);
        }

        // Cek Kedaluwarsa (misal: 15 menit)
        if (Carbon::parse($record->created_at)->addMinutes(15)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Kode OTP sudah kedaluwarsa. Silakan minta ulang.'], 400);
        }

        // Cek kecocokan OTP
        if (!Hash::check($request->otp, $record->token)) {
            return response()->json(['message' => 'Kode OTP salah.'], 400);
        }

        return response()->json(['message' => 'OTP Valid']);
    }

    // 3. Reset Kata Sandi
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|numeric|digits:6',
            'password' => 'required|min:8',
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record || !Hash::check($request->otp, $record->token)) {
            return response()->json(['message' => 'Akses ditolak atau OTP tidak valid.'], 400);
        }

        // Update password user
        $user = User::where('email', $request->email)->first();
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Hapus token agar tidak bisa dipakai lagi
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Kata sandi berhasil diubah']);
    }
}
