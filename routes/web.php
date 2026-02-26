<?php

use App\Http\Controllers\DlhController;
use App\Http\Controllers\KalingController;
use App\Http\Controllers\PetugasController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\WargaController;
use App\Models\Report;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // Ambil data laporan beserta nama user pembuatnya, urutkan dari yang terbaru
    // Kita hanya mengambil laporan yang belum selesai agar peta tidak penuh
    $reports = Report::with('user:id,name')
        ->whereIn('status', ['menunggu', 'divalidasi', 'proses'])
        ->latest()
        ->get();

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'reports' => $reports, // Mengirim data laporan ke React
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {

    // Dashboard Warga
    Route::middleware('role:warga')->get('/dashboard/warga', [WargaController::class, 'index'])->name('dashboard.warga');

    // Dashboard Kepala Lingkungan (Kaling)
    Route::middleware('role:kaling')->group(function () {
        Route::get('/dashboard/kaling', [KalingController::class, 'index'])->name('dashboard.kaling');
    });

    // Route untuk tombol "Validasi"
    Route::patch('/report/{report}/status', [ReportController::class, 'updateStatus'])->name('report.update-status');

    // Dashboard Petugas Sampah
    Route::middleware('role:petugas')->group(function () {
        Route::get('/dashboard/petugas', [PetugasController::class, 'index'])->name('dashboard.petugas');
    });

    // Executive Dashboard DLH
    Route::middleware('role:dlh')->group(function () {
        Route::get('/dashboard/dlh', [DlhController::class, 'index'])->name('dashboard.dlh');
    });

    Route::get('/report/create', [ReportController::class, 'create'])->name('report.create');
    Route::post('/report', [ReportController::class, 'store'])->name('report.store');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
