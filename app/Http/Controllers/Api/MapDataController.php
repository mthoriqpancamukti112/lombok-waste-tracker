<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DangerZone;
use App\Models\Report;
use App\Models\WasteDensityZone;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class MapDataController extends Controller
{
    public function reportPins(): JsonResponse
    {
        $reports = Report::with('user:id,name,avatar')
            ->whereIn('status', ['menunggu', 'divalidasi', 'proses'])
            ->select('id', 'user_id', 'latitude', 'longitude', 'status', 'severity_level', 'waste_type', 'description', 'photo_path', 'address', 'created_at')
            ->latest()
            ->get();

        return response()->json($reports);
    }

    public function dangerZones(): JsonResponse
    {
        $zones = DangerZone::active()
            ->select('id', 'name', 'description', 'type', 'severity', 'coordinates', 'center_lat', 'center_lng', 'radius_meters')
            ->get();

        return response()->json($zones);
    }

    public function wasteDensity(): JsonResponse
    {
        $zones = WasteDensityZone::active()
            ->select('id', 'name', 'coordinates', 'density_level', 'kelurahan', 'kecamatan', 'report_count', 'monthly_tonnage')
            ->get();

        return response()->json($zones);
    }

    public function reportDetail($id): JsonResponse
    {
        // Ambil data Report dan hitung totalnya (TIDAK usah load comments di sini)
        $report = Report::with(['user:id,name,avatar'])
            ->withCount(['likes', 'comments'])
            ->findOrFail($id);

        // Ambil Komentar secara terpisah: HANYA komentar utama + balasan (replies)
        $comments = \App\Models\ReportComment::where('report_id', $id)
            ->whereNull('parent_id') // Kunci utamanya di sini: hanya ambil komentar induk
            ->with([
                'user:id,name,avatar',
                'replies.user:id,name,avatar' // Sekalian ambil data balasan dan usernya
            ])
            ->latest() // Urutkan dari yang terbaru
            ->get();

        // Cek apakah user login sudah me-like
        $isLiked = Auth::check() ? $report->likes()->where('user_id', Auth::id())->exists() : false;

        return response()->json([
            'report' => $report,
            'comments' => $comments, // Masukkan variabel $comments yang sudah difilter
            'isLiked' => $isLiked,
        ]);
    }
}
