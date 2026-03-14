<?php

namespace App\Http\Controllers;

use App\Models\Kaling;
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

        $unassignedCount = Report::whereNull('kaling_id')->count();

        return Inertia::render('Dashboard/DLH', [
            'stats' => [
                'total' => $totalReports,
                'menunggu' => $menunggu,
                'proses' => $proses,
                'selesai' => $selesai,
            ],
            'chartData' => $chartData,
            'recentReports' => $recentReports,
            'unassignedCount' => $unassignedCount
        ]);
    }

    public function unassignedReports()
    {
        $unassignedReports = Report::with('user:id,name')
            ->whereNull('kaling_id')
            ->latest()
            ->get();

        $kalings = Kaling::with('user:id,name')->get()->map(function ($kaling) {
            return [
                'id' => $kaling->id,
                'nama_wilayah' => $kaling->nama_wilayah,
                'nama_kaling' => $kaling->user->name ?? 'Anonim'
            ];
        });

        return Inertia::render('DLH/LaporanNyasar/DLHUnassigned', [
            'unassignedReports' => $unassignedReports,
            'kalings' => $kalings,
            'unassignedCount' => $unassignedReports->count()
        ]);
    }

    public function map()
    {
        // Ambil semua laporan beserta relasi user (pelapor), relasi kaling, dan user kaling-nya
        $reports = Report::with(['user:id,name', 'kaling.user'])
            ->latest()
            ->get()
            ->map(function ($report) {
                return [
                    'id' => $report->id,
                    'description' => $report->description,
                    'status' => $report->status,
                    'photo_path' => $report->photo_path,
                    'latitude' => $report->latitude,
                    'longitude' => $report->longitude,
                    'created_at' => $report->created_at,
                    'user' => [
                        'name' => $report->user->name ?? 'Anonim',
                    ],
                    // Ambil nama kaling (dari tabel users melalui relasi kaling)
                    'kaling_name' => $report->kaling->user->name ?? null,

                    // Ambil nama wilayah (dari tabel kalings)
                    'nama_wilayah' => $report->kaling->nama_wilayah ?? null,
                ];
            });

        $unassignedCount = Report::whereNull('kaling_id')->count();

        return Inertia::render('DLH/Map/Index', [
            'reports' => $reports,
            'mapboxToken' => env('VITE_MAPBOX_TOKEN'),
            'unassignedCount' => $unassignedCount
        ]);
    }

    public function assignKaling(Request $request, Report $report)
    {
        $request->validate(['kaling_id' => 'required|exists:kalings,id']);

        $report->update(['kaling_id' => $request->kaling_id]);

        return back()->with('success', 'Laporan berhasil diteruskan ke Kaling.');
    }
}
