<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportComment;
use App\Models\ReportLike;
use App\Models\AppNotification; // <--- TAMBAHAN PENTING
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class PublicReportController extends Controller
{
    // Fitur Toggle Like (Bisa Like dan Unlike) - Menggunakan AJAX/JSON
    public function toggleLike(Request $request, Report $report)
    {
        try {
            $user = $request->user();

            // Cek apakah user sudah pernah like laporan ini
            $existingLike = ReportLike::where('report_id', $report->id)
                ->where('user_id', $user->id)
                ->first();

            if ($existingLike) {
                // Jika sudah ada, hapus like-nya (Unlike)
                $existingLike->delete();
                $liked = false;
            } else {
                // Jika belum, tambahkan Like baru
                ReportLike::create([
                    'report_id' => $report->id,
                    'user_id' => $user->id
                ]);
                $liked = true;

                // Kirim notifikasi menggunakan AppNotification (Format yang benar)
                if ($user->id !== $report->user_id) {
                    AppNotification::create([
                        'user_id' => $report->user_id,
                        'type' => 'report_liked',
                        'notifiable_type' => Report::class,
                        'notifiable_id' => $report->id,
                        'data' => [
                            'report_id' => $report->id,
                            'message' => "❤️ {$user->name} menyukai laporan tumpukan sampah Anda."
                        ],
                    ]);
                }
            }

            return response()->json([
                'liked' => $liked,
                'count' => $report->likes()->count(),
            ]);
        } catch (\Exception $e) {
            // Catat error ke file log Laravel jika terjadi masalah
            Log::error('Error Toggle Like: ' . $e->getMessage());
            return response()->json(['error' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }
}
