<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\DangerZoneController;
use App\Http\Controllers\DlhController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\KalingController;
use App\Http\Controllers\KalingManagementController;
use App\Http\Controllers\LaporanAnalitikController;
use App\Http\Controllers\PetugasController;
use App\Http\Controllers\PetugasManagementController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicReportController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\WargaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('google.login');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

Route::get('/dashboard', function (Request $request) {
    $role = $request->user()->role;

    return match ($role) {
        'dlh'     => redirect()->route('dashboard.dlh'),
        'kaling'  => redirect()->route('dashboard.kaling'),
        'petugas' => redirect()->route('dashboard.petugas'),
        default   => redirect()->route('dashboard.warga'),
    };
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {

    Route::get('/laporan-publik', [PublicReportController::class, 'index'])->name('laporan-publik.index');
    Route::post('/laporan-publik/{id}/like', [PublicReportController::class, 'toggleLike'])->name('laporan-publik.like');
    Route::post('/laporan-publik/{id}/comment', [PublicReportController::class, 'storeComment'])->name('laporan-publik.comment');

    Route::post('/notifications/mark-as-read', function (Request $request) {
        $request->user()->unreadNotifications->markAsRead();
        return back();
    })->name('notifications.markAllRead');

    // Dashboard Warga
    Route::middleware('role:warga')->get('/dashboard/warga', [WargaController::class, 'index'])->name('dashboard.warga');

    // Dashboard Kepala Lingkungan (Kaling)
    Route::middleware('role:kaling')->group(function () {
        Route::get('/dashboard/kaling', [KalingController::class, 'index'])->name('dashboard.kaling');

        Route::get('/kaling/map', [KalingController::class, 'map'])->name('kaling.map');
    });

    // Route untuk tombol "Validasi"
    Route::patch('/report/{report}/status', [ReportController::class, 'updateStatus'])->name('report.update-status');

    // Dashboard Petugas Sampah
    Route::middleware('role:petugas')->group(function () {
        Route::get('/dashboard/petugas', [PetugasController::class, 'index'])->name('dashboard.petugas');

        Route::get('/dashboard/petugas/riwayat', [PetugasController::class, 'riwayat'])->name('petugas.riwayat');
    });

    // Executive Dashboard DLH
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
    });

    Route::get('/report/create', [ReportController::class, 'create'])->name('report.create');
    Route::post('/report', [ReportController::class, 'store'])->name('report.store');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
