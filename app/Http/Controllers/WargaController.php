<?php

namespace App\Http\Controllers;

use App\Models\Report;
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
}
