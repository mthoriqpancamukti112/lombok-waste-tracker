<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportComment;
use App\Models\AppNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ReportCommentController extends Controller
{
    /**
     * Menyimpan komentar baru via AJAX/Axios
     */
    public function store(Request $request, $id)
    {
        try {
            // Validasi input dari React
            $request->validate([
                'body' => 'required|string|max:1000',
                'parent_id' => 'nullable|exists:report_comments,id'
            ]);

            $report = Report::findOrFail($id);
            $user = $request->user();

            // Simpan komentar ke database
            $comment = ReportComment::create([
                'report_id' => $report->id,
                'user_id' => $user->id,
                'body' => $request->body,
                'parent_id' => $request->parent_id
            ]);

            // Kirim notifikasi JIKA yang komen BUKAN si pembuat laporan
            if ($user->id !== $report->user_id) {
                $snippet = Str::limit($request->body, 40);

                AppNotification::create([
                    'user_id' => $report->user_id,
                    'type' => 'report_commented',
                    'notifiable_type' => Report::class,
                    'notifiable_id' => $report->id,
                    'data' => [
                        'report_id' => $report->id,
                        'translation_key' => 'notif_commented',
                        'actor_name' => $user->name,
                        'snippet' => $snippet,
                        'message' => "{$user->name} berkomentar: \"{$snippet}\"",
                        'icon' => 'comment'
                    ],
                ]);
            }

            // Load relasi user agar avatar dan nama bisa langsung dirender di React
            $comment->load('user:id,name,avatar');

            // Kembalikan JSON ke frontend
            return response()->json([
                'message' => 'Komentar berhasil ditambahkan',
                'comment' => $comment
            ]);
        } catch (\Exception $e) {
            // Catat error aslinya ke laravel.log agar mudah dilacak
            Log::error('Error Report Comment: ' . $e->getMessage());
            return response()->json(['error' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }
}
