<?php

use App\Http\Controllers\Api\MapDataController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DangerZoneController;
use App\Http\Controllers\DlhController;
use App\Http\Controllers\KalingController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PetugasController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\WargaController;
use App\Http\Controllers\WasteDensityController;
use App\Models\DangerZone;
use App\Models\Report;
use App\Models\WasteDensityZone;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->middleware('verified')->name('dashboard');

    // Warga dashboard
    Route::middleware('role:warga')->get('/dashboard/warga', [WargaController::class, 'index'])->name('dashboard.warga');

    // Kaling dashboard
    Route::middleware('role:kaling')->group(function () {
        Route::get('/dashboard/kaling', [KalingController::class, 'index'])->name('dashboard.kaling');
    });

    // Petugas dashboard
    Route::middleware('role:petugas')->group(function () {
        Route::get('/dashboard/petugas', [PetugasController::class, 'index'])->name('dashboard.petugas');
    });

    // DLH dashboard + manage danger zones & waste density
    Route::middleware('role:dlh')->group(function () {
        Route::get('/dashboard/dlh', [DlhController::class, 'index'])->name('dashboard.dlh');

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
