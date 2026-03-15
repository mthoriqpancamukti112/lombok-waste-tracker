<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Petugas;
use App\Models\Report;
use App\Models\ReportStatusLog;
use App\Models\User;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    /**
     * Handle incoming WhatsApp messages from Twilio.
     */
    public function handle(Request $request)
    {
        $from = $request->input('From');
        $body = strtoupper(trim($request->input('Body')));
        $sender = str_replace('whatsapp:', '', $from);

        Log::info("Incoming Twilio WhatsApp from $sender: $body");

        // 1. Identify User
        $user = User::where('phone_number', $sender)
            ->orWhere('phone_number', str_replace('+', '', $sender))
            ->first();

        if (!$user) {
            return $this->generateTwilioResponse("Maaf, nomor Anda belum terdaftar di sistem.");
        }

        // 2. Parse Command
        // Pattern: [COMMAND] [ID] [NOTES...]
        if (!preg_match('/^([A-Z]+)\s+(\d+)(.*)$/i', $body, $matches)) {
            $helpMsg = "⚠️ Perintah tidak dikenal.\n\n*Format Kaling:*\n✅ ACC [ID]\n❌ TOLAK [ID] [Alasan]\n\n*Format Petugas:*\n🚚 KERJAKAN [ID]\n✨ SELESAI [ID]";
            return $this->generateTwilioResponse($helpMsg);
        }

        $command = strtoupper($matches[1]);
        $reportId = $matches[2];
        $notes = trim($matches[3] ?? '');

        // 3. Find Report
        $report = Report::find($reportId);
        if (!$report) {
            return $this->generateTwilioResponse("❌ Laporan #$reportId tidak ditemukan.");
        }

        // 4. Role-based Logic
        switch ($user->role) {
            case 'kaling':
                return $this->handleKalingCommand($user, $report, $command, $notes);
            case 'petugas':
                return $this->handlePetugasCommand($user, $report, $command, $notes);
            default:
                return $this->generateTwilioResponse("⛔ Maaf, role Anda ({$user->role}) tidak diizinkan memproses via WhatsApp.");
        }
    }

    /**
     * Kaling: ACC or TOLAK
     */
    private function handleKalingCommand($user, Report $report, $command, $notes)
    {
        if ($report->status !== 'menunggu') {
            return $this->generateTwilioResponse("⚠️ Laporan #{$report->id} sudah diproses sebelumnya (Status: {$report->status}).");
        }

        if ($report->kaling_id != $user->kaling?->id) {
            return $this->generateTwilioResponse("⛔ Anda tidak berwenang memproses laporan di wilayah ini.");
        }

        $oldStatus = $report->status;

        if ($command === 'ACC') {
            $report->update(['status' => 'divalidasi']);
            $this->logStatus($report->id, $user->id, $oldStatus, 'divalidasi', $notes ?: 'Disetujui via WhatsApp');

            // --- NOTIFY PETUGAS ---
            $this->notifyAllPetugas($report);

            return $this->generateTwilioResponse("✅ Laporan #{$report->id} BERHASIL DIVALIDASI. Notifikasi telah dikirim ke semua petugas lapangan.");
        } elseif ($command === 'TOLAK') {
            $report->update(['status' => 'ditolak']);
            $this->logStatus($report->id, $user->id, $oldStatus, 'ditolak', $notes ?: 'Ditolak via WhatsApp');

            return $this->generateTwilioResponse("❌ Laporan #{$report->id} TELAH DITOLAK.");
        }

        return $this->generateTwilioResponse("⚠️ Perintah Kaling hanya: ACC atau TOLAK.");
    }

    /**
     * Petugas: KERJAKAN or SELESAI
     */
    private function handlePetugasCommand($user, Report $report, $command, $notes)
    {
        $oldStatus = $report->status;

        if ($command === 'KERJAKAN') {
            if ($oldStatus !== 'divalidasi') {
                return $this->generateTwilioResponse("⚠️ Laporan #{$report->id} tidak bisa diambil (Status saat ini: $oldStatus).");
            }

            $report->update([
                'status' => 'proses',
                'petugas_id' => $user->petugas?->id
            ]);

            $this->logStatus($report->id, $user->id, $oldStatus, 'proses', 'Diambil alih petugas via WhatsApp');

            return $this->generateTwilioResponse("🚚 Laporan #{$report->id} berhasil Anda ambil! Segera menuju lokasi.");
        } elseif ($command === 'SELESAI') {
            if ($oldStatus !== 'proses') {
                return $this->generateTwilioResponse("⚠️ Anda hanya bisa menyelesaikan laporan yang sedang dalam 'proses'.");
            }

            if ($report->petugas_id != $user->petugas?->id) {
                return $this->generateTwilioResponse("⛔ Laporan ini sedang dikerjakan oleh petugas lain.");
            }

            $report->update(['status' => 'selesai']);
            $this->logStatus($report->id, $user->id, $oldStatus, 'selesai', $notes ?: 'Diselesaikan via WhatsApp');

            // --- NOTIFY CITIZEN ON WEB ---
            AppNotification::create([
                'user_id' => $report->user_id,
                'type' => 'report_status_updated',
                'notifiable_type' => Report::class,
                'notifiable_id' => $report->id,
                'data' => [
                    'report_id' => $report->id,
                    'title' => 'Laporan Selesai!',
                    'message' => 'Laporan sampah Anda telah dibersihkan oleh petugas. Terima kasih!',
                    'icon' => 'check-circle'
                ],
            ]);

            return $this->generateTwilioResponse("✨ Luar biasa! Laporan #{$report->id} telah ditandai SELESAI. Poin sudah masuk ke pelapor.");
        }

        return $this->generateTwilioResponse("⚠️ Perintah Petugas hanya: KERJAKAN atau SELESAI.");
    }

    private function notifyAllPetugas(Report $report)
    {
        (new WhatsAppService())->notifyAllPetugas($report);
    }

    private function generateTwilioResponse($message)
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' .
            '<Response><Message>' . htmlspecialchars($message) . '</Message></Response>';
        return response($xml)->header('Content-Type', 'text/xml');
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
