<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\DangerZone;
use App\Models\WasteDensityZone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // For logged in users, pull more reports
        $limit = $user ? 200 : 100;

        // Query digabungkan dari versi web.php dan kebutuhan relasi
        $reports = Report::with([
            'user:id,name,avatar',
            'comments:id,report_id,user_id'
            // Jika Anda butuh relasi 'user.warga' atau nested comments seperti di controller lama,
            // Anda bisa menambahkannya kembali di sini.
        ])
            ->withCount(['likes', 'comments'])
            ->whereIn('status', ['menunggu', 'divalidasi', 'proses', 'selesai'])
            ->latest()
            ->take($limit)
            ->get();

        $dangerZones = DangerZone::where('is_active', true)
            ->select('id', 'name', 'description', 'type', 'severity', 'coordinates', 'center_lat', 'center_lng', 'radius_meters')
            ->get();
        $wasteDensityZones = WasteDensityZone::where('is_active', true)
            ->select('id', 'name', 'coordinates', 'density_level', 'kelurahan', 'kecamatan', 'report_count')
            ->get();

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'reports' => $reports,
            'dangerZones' => $dangerZones,
            'wasteDensityZones' => $wasteDensityZones,
        ]);
    }
}
