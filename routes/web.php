<?php

use App\Http\Controllers\Api\MapDataController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DangerZoneController;
use App\Http\Controllers\DlhController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\KalingController;
use App\Http\Controllers\KalingManagementController;
use App\Http\Controllers\LaporanAnalitikController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PetugasController;
use App\Http\Controllers\PetugasManagementController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicReportController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\WargaController;
use App\Http\Controllers\WasteDensityController;
use App\Models\DangerZone;
use App\Models\Report;
use App\Models\WasteDensityZone;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;

// ──────────────────────────────────────────
// Public: Welcome / Map
// ──────────────────────────────────────────
Route::get('/', function () {
    $reports = Report::with('user:id,name,avatar')
        ->withCount(['likes', 'comments'])
        ->whereIn('status', ['menunggu', 'divalidasi', 'proses'])
        ->latest()
        ->get();

    $dangerZones = DangerZone::active()
        ->select('id', 'name', 'description', 'type', 'severity', 'coordinates', 'center_lat', 'center_lng', 'radius_meters')
        ->get();

    $wasteDensityZones = WasteDensityZone::active()
        ->select('id', 'name', 'coordinates', 'density_level', 'kelurahan', 'kecamatan', 'report_count')
        ->get();

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'reports' => $reports,
        'dangerZones' => $dangerZones,
        'wasteDensityZones' => $wasteDensityZones,
    ]);
});

// ──────────────────────────────────────────
// Google OAuth
// ──────────────────────────────────────────
Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');

// ──────────────────────────────────────────
// API: Map Data (public — no auth needed)
// ──────────────────────────────────────────
Route::prefix('api')->group(function () {
    Route::get('/map/reports', [MapDataController::class, 'reportPins']);
    Route::get('/map/danger-zones', [MapDataController::class, 'dangerZones']);
    Route::get('/map/waste-density', [MapDataController::class, 'wasteDensity']);
});

// ──────────────────────────────────────────
// Authenticated routes
// ──────────────────────────────────────────
Route::middleware('auth')->group(function () {

    Route::get('/dashboard', function (Request $request) {
        $role = $request->user()->role;

        return match ($role) {
            'dlh' => redirect()->route('dashboard.dlh'),
            'kaling' => redirect()->route('dashboard.kaling'),
            'petugas' => redirect()->route('dashboard.petugas'),
            default => redirect()->route('dashboard.warga'),
        };
    })->middleware('verified')->name('dashboard');

    Route::get('/laporan-publik', [PublicReportController::class, 'index'])->name('laporan-publik.index');
    Route::post('/laporan-publik/{id}/like', [PublicReportController::class, 'toggleLike'])->name('laporan-publik.like');
    Route::post('/laporan-publik/{id}/comment', [PublicReportController::class, 'storeComment'])->name('laporan-publik.comment');

    // Warga dashboard
    Route::middleware('role:warga')->get('/dashboard/warga', [WargaController::class, 'index'])->name('dashboard.warga');

    // Kaling dashboard
    Route::middleware('role:kaling')->group(function () {
        Route::get('/dashboard/kaling', [KalingController::class, 'index'])->name('dashboard.kaling');

        Route::get('/kaling/map', [KalingController::class, 'map'])->name('kaling.map');
    });

    // Petugas dashboard
    Route::middleware('role:petugas')->group(function () {
        Route::get('/dashboard/petugas', [PetugasController::class, 'index'])->name('dashboard.petugas');

        Route::get('/dashboard/petugas/riwayat', [PetugasController::class, 'riwayat'])->name('petugas.riwayat');
    });

    // DLH dashboard + manage danger zones & waste density
    Route::middleware('role:dlh')->group(function () {
        Route::get('/dashboard/dlh', [DlhController::class, 'index'])->name('dashboard.dlh');

        Route::get('/kaling-management', [KalingManagementController::class, 'index'])->name('kaling-management.index');
        Route::post('/kaling-management', [KalingManagementController::class, 'store'])->name('kaling-management.store');
        Route::put('/kaling-management/{id}', [KalingManagementController::class, 'update'])->name('kaling-management.update');
        Route::delete('/kaling-management/{id}', [KalingManagementController::class, 'destroy'])->name('kaling-management.destroy');

        Route::get('/petugas-management', [PetugasManagementController::class, 'index'])->name('petugas-management.index');
        Route::post('/petugas-management', [PetugasManagementController::class, 'store'])->name('petugas-management.store');
        Route::put('/petugas-management/{id}', [PetugasManagementController::class, 'update'])->name('petugas-management.update');
        Route::delete('/petugas-management/{id}', [PetugasManagementController::class, 'destroy'])->name('petugas-management.destroy');

        Route::get('/peta-sebaran', [DlhController::class, 'map'])->name('dlh.map');

        Route::get('/laporan-analitik', [LaporanAnalitikController::class, 'index'])->name('laporan.index');
        Route::get('/laporan-analitik/export-excel', [LaporanAnalitikController::class, 'exportExcel'])->name('laporan.export.excel');
        Route::get('/laporan-analitik/export-pdf', [LaporanAnalitikController::class, 'exportPdf'])->name('laporan.export.pdf');

        Route::get('/danger-zones', [DangerZoneController::class, 'index'])->name('danger-zones.index');
        Route::post('/danger-zones', [DangerZoneController::class, 'store'])->name('danger-zones.store');
        Route::put('/danger-zones/{dangerZone}', [DangerZoneController::class, 'update'])->name('danger-zones.update');
        Route::delete('/danger-zones/{dangerZone}', [DangerZoneController::class, 'destroy'])->name('danger-zones.destroy');

        Route::post('/waste-density', [WasteDensityController::class, 'store'])->name('waste-density.store');
        Route::put('/waste-density/{wasteDensityZone}', [WasteDensityController::class, 'update'])->name('waste-density.update');
        Route::delete('/waste-density/{wasteDensityZone}', [WasteDensityController::class, 'destroy'])->name('waste-density.destroy');
    });

    // Reports
    Route::patch('/report/{report}/status', [ReportController::class, 'updateStatus'])->name('report.update-status');
    Route::get('/report/create', [ReportController::class, 'create'])->name('report.create');
    Route::post('/report', [ReportController::class, 'store'])->name('report.store');

    // Comments
    Route::post('/report/{report}/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');

    // Likes (AJAX)
    Route::post('/report/{report}/like', [LikeController::class, 'toggle'])->name('likes.toggle');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unread-count');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
