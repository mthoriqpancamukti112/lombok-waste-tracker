<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class KalingController extends Controller
{
    public function index()
    {
        // 1. Ambil data profil Kaling dari user yang sedang login
        $kaling = Auth::user()->kaling;

        // Jaga-jaga jika user yang login role-nya kaling tapi belum punya data di tabel kalings
        if (!$kaling) {
            abort(403, 'Data wilayah Anda belum diatur oleh DLH.');
        }

        // 2. Filter laporan KHUSUS untuk wilayah Kaling ini saja
        $reports = Report::with(['user:id,name,email', 'user.warga'])
            ->where('kaling_id', $kaling->id)
            ->where('status', 'menunggu')
            ->oldest()
            ->get();

        return Inertia::render('Dashboard/Kaling', [
            'reports' => $reports,
            'namaWilayah' => $kaling->nama_wilayah
        ]);
    }

    public function map(Request $request)
    {
        $kaling = $request->user()->kaling;

        if (!$kaling) {
            abort(403, 'Data wilayah Anda belum diatur.');
        }

        // Ambil SEMUA laporan di wilayah Kaling ini (tidak hanya yang menunggu)
        $reports = Report::with(['user:id,name', 'user.warga'])
            ->where('kaling_id', $kaling->id)
            ->latest()
            ->get();

        return Inertia::render('Kaling/Map', [
            'reports' => $reports,
            'namaWilayah' => $kaling->nama_wilayah,
            'mapboxToken' => env('VITE_MAPBOX_TOKEN')
        ]);
    }
}
