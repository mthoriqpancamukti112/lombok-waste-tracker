<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DlhController extends Controller
{
    public function index()
    {
        $totalReports = Report::count();
        $menunggu = Report::where('status', 'menunggu')->count();
        $proses = Report::whereIn('status', ['divalidasi', 'proses'])->count();
        $selesai = Report::where('status', 'selesai')->count();

        $chartData = [
            ['name' => 'Menunggu', 'jumlah' => $menunggu, 'fill' => '#ef4444'],
            ['name' => 'Diproses', 'jumlah' => $proses, 'fill' => '#3b82f6'],
            ['name' => 'Selesai', 'jumlah' => $selesai, 'fill' => '#22c55e'],
        ];

        $recentReports = Report::with('user:id,name')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Dashboard/DLH', [
            'stats' => [
                'total' => $totalReports,
                'menunggu' => $menunggu,
                'proses' => $proses,
                'selesai' => $selesai,
            ],
            'chartData' => $chartData,
            'recentReports' => $recentReports
        ]);
    }

    public function map()
    {
        // Ambil semua laporan beserta data usernya
        $reports = Report::with('user:id,name')->latest()->get();

        return Inertia::render('DLH/Map/Index', [
            'reports' => $reports,
            'mapboxToken' => env('VITE_MAPBOX_TOKEN')
        ]);
    }
}
