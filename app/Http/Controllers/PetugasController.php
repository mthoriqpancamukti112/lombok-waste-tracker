<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PetugasController extends Controller
{
    public function index(Request $request)
    {
        // 1. Ambil data laporan
        $reports = Report::with('user:id,name')
            ->whereIn('status', ['divalidasi', 'proses'])
            ->oldest()
            ->get();

        // 2. Ambil profil petugas yang sedang login
        $petugasProfile = $request->user()->petugas;

        return Inertia::render('Dashboard/Petugas', [
            'reports' => $reports,
            'petugasProfile' => $petugasProfile
        ]);
    }

    public function riwayat(Request $request)
    {
        // Ambil data petugas dari user yang sedang login
        $petugas = $request->user()->petugas;

        if (!$petugas) {
            abort(403, 'Akses ditolak. Akun Anda belum terkait dengan data Petugas.');
        }

        // Ambil laporan yang SUDAH SELESAI dan dikerjakan oleh petugas ini
        $reports = Report::with('user:id,name')
            ->where('petugas_id', $petugas->id)
            ->where('status', 'selesai')
            ->latest('updated_at') // Urutkan berdasarkan waktu penyelesaian terbaru
            ->get();

        return inertia('Petugas/PetugasRiwayat', [
            'reports' => $reports
        ]);
    }
}
