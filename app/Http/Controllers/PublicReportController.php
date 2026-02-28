<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportComment;
use App\Models\ReportLike;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Notifications\ReportStatusUpdated;
use Illuminate\Support\Str;

class PublicReportController extends Controller
{
    // Menampilkan halaman Feed/Forum Laporan Warga
    public function index(Request $request)
    {
        $query = Report::with([
            'user:id,name',
            'likes',
            'comments' => function ($query) {
                $query->whereNull('parent_id')
                    ->with(['user:id,name', 'replies.user:id,name'])
                    ->oldest();
            },
            'user.warga'
        ]);

        // Jika ada request filter status dan nilainya bukan 'semua'
        if ($request->filled('status') && $request->status !== 'semua') {
            $query->where('status', $request->status);
        }

        // Ambil maksimal 50 data terbaru sesuai filter
        $reports = $query->latest()->take(50)->get();

        return Inertia::render('Warga/LaporanPublik/Index', [
            'reports' => $reports,
            'currentFilter' => $request->status ?? 'semua'
        ]);
    }

    // Fitur Toggle Like (Bisa Like dan Unlike)
    public function toggleLike(Request $request, $id)
    {
        $report = Report::findOrFail($id);
        $user = $request->user();

        // Cek apakah user sudah pernah like laporan ini
        $existingLike = ReportLike::where('report_id', $report->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingLike) {
            // Jika sudah ada, hapus like-nya (Unlike)
            $existingLike->delete();
        } else {
            // Jika belum, tambahkan Like baru
            ReportLike::create([
                'report_id' => $report->id,
                'user_id' => $user->id
            ]);

            // Kirim notifikasi HANYA JIKA yang me-like BUKAN si pembuat laporan
            if ($user->id !== $report->user_id) {
                $pesan = "❤️ {$user->name} menyukai laporan tumpukan sampah Anda.";
                $report->user->notify(new ReportStatusUpdated($report, $pesan));
            }
        }

        return back();
    }

    // Fitur Tambah Komentar
    public function storeComment(Request $request, $id)
    {
        $request->validate([
            'body' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:report_comments,id'
        ]);

        $report = Report::findOrFail($id);
        $user = $request->user();

        ReportComment::create([
            'report_id' => $report->id,
            'user_id' => $user->id,
            'body' => $request->body,
            'parent_id' => $request->parent_id
        ]);

        // Kirim notifikasi HANYA JIKA yang komen BUKAN si pembuat laporan
        if ($user->id !== $report->user_id) {
            // Potong teks komentar jika terlalu panjang untuk ditampilkan di notif (maks 40 huruf)
            $snippet = Str::limit($request->body, 40);
            $pesan = "💬 {$user->name} mengomentari laporan Anda: \"{$snippet}\"";

            $report->user->notify(new ReportStatusUpdated($report, $pesan));
        }
        return back();
    }
}
