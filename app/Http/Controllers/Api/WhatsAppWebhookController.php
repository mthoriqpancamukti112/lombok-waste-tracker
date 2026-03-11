<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\ReportStatusLog;
use App\Models\User;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    /**
     * Handle incoming WhatsApp messages from Fonnte.
     */
    public function handle(Request $request)
    {
        // Fonnte sends data via POST: sender, message, token.
        $sender = $request->input('sender'); // Phone number of the sender
        $message = strtoupper(trim($request->input('message'))); // Command: e.g. ACC 123

        Log::info("Incoming WhatsApp from $sender: $message");

        // 1. Identify User by Phone Number
        $user = User::where('phone_number', $sender)->first();
        if (!$user) {
            // Unrecognized number
            return response()->json(['status' => 'ignored', 'reason' => 'User not found']);
        }

        // 2. Parse Command
        // Pattern: ACC [ID] or TOLAK [ID] [REASON]
        if (!preg_match('/^(ACC|TOLAK)\s+(\d+)(.*)$/i', $message, $matches)) {
            $this->reply($sender, "⚠️ Perintah tidak dikenal. Gunakan format:\n✅ *ACC [ID]*\n❌ *TOLAK [ID] [Alasan]*");
            return response()->json(['status' => 'invalid_command']);
        }

        $action = strtoupper($matches[1]);
        $reportId = $matches[2];
        $notes = trim($matches[3] ?? '');

        // 3. Find Report
        $report = Report::find($reportId);
        if (!$report) {
            $this->reply($sender, "❌ Laporan dengan ID #$reportId tidak ditemukan.");
            return response()->json(['status' => 'not_found']);
        }

        // 4. Check Authorization
        if ($user->role === 'kaling' && $report->kaling_id != $user->kaling?->id) {
            $this->reply($sender, "⛔ Anda tidak berwenang untuk memproses laporan ini.");
            return response()->json(['status' => 'unauthorized']);
        }

        // Only allow processing if status is 'menunggu'
        if ($report->status !== 'menunggu' && $user->role !== 'dlh') {
            $this->reply($sender, "ℹ️ Laporan #$reportId sudah diproses sebelumnya (Status: {$report->status}).");
            return response()->json(['status' => 'already_processed']);
        }

        // 5. Process Action
        $oldStatus = $report->status;
        $newStatus = ($action === 'ACC') ? 'divalidasi' : 'ditolak';

        if ($newStatus === 'ditolak') {
            $this->logStatus($reportId, $user->id, $oldStatus, 'ditolak', $notes ?: 'Ditolak via WhatsApp');
            $report->delete();
            $this->reply($sender, "✅ Laporan #$reportId berhasil *DITOLAK*.");
        } else {
            $report->update(['status' => 'divalidasi']);
            $this->logStatus($reportId, $user->id, $oldStatus, 'divalidasi', $notes ?: 'Disetujui via WhatsApp');
            $this->reply($sender, "✅ Laporan #$reportId berhasil *DIVALIDASI*.");
        }

        return response()->json(['status' => 'success']);
    }

    private function reply($to, $message)
    {
        $wa = new WhatsAppService();
        $wa->sendMessage($to, $message);
    }

    private function logStatus($reportId, $userId, $old, $new, $notes)
    {
        ReportStatusLog::create([
            'report_id' => $reportId,
            'changed_by' => $userId,
            'old_status' => $old,
            'new_status' => $new,
            'notes' => $notes,
        ]);
    }
}
