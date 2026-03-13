<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WargaController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $totalLaporan = Report::where('user_id', $userId)->count();

        $sedangDiproses = Report::where('user_id', $userId)
            ->whereIn('status', ['menunggu', 'divalidasi', 'proses'])
            ->count();

        $laporanSelesai = Report::where('user_id', $userId)
            ->where('status', 'selesai')
            ->count();

        $riwayatLaporan = Report::with('user:id,name')
            ->where('user_id', $userId)
            ->latest()
            ->get();

        return Inertia::render('Dashboard/Warga', [
            'stats' => [
                'total' => $totalLaporan,
                'menunggu' => $sedangDiproses,
                'selesai' => $laporanSelesai,
            ],
            'riwayat' => $riwayatLaporan
        ]);
    }

    /**
     * API Endpoint untuk Chatbot Python mengambil poin user
     */
    public function getPoin($userId)
    {
        // Jika user_id adalah 0 (belum login)
        if ($userId == 0) {
            return response()->json(['poin' => 0, 'role' => 'guest'], 200);
        }

        // Cari data user
        $user = \App\Models\User::find($userId);

        if (!$user) {
            return response()->json(['poin' => 0, 'role' => 'unknown'], 200);
        }

        // CEK ROLE: Jika BUKAN warga, kembalikan respons khusus
        if ($user->role !== 'warga') {
            return response()->json([
                'poin' => 0,
                'role' => $user->role,
                'message' => 'Fitur poin hanya untuk warga.'
            ], 200);
        }

        // Jika dia warga, cari poinnya
        $warga = Warga::where('user_id', $userId)->first();

        return response()->json([
            'poin' => $warga ? $warga->poin_kepercayaan : 0,
            'role' => 'warga'
        ], 200);
    }
}
