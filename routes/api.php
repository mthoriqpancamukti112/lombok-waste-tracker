<?php

use App\Http\Controllers\Api\WhatsAppWebhookController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\WargaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/webhooks/whatsapp', [WhatsAppWebhookController::class, 'handle']);
Route::get('/user/{id}/poin', [WargaController::class, 'getPoin']);
Route::get('/user/{id}/laporan/terakhir', [ReportController::class, 'getLatestReportStatus']);
Route::get('/laporan/terbaru', [ReportController::class, 'getLatestReports']);
Route::get('/user/{id}/tugas-petugas', [ReportController::class, 'getTitikAngkut']);
Route::get('/statistik-sampah', [ReportController::class, 'getStatistik']);
