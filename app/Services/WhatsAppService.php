<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

class WhatsAppService
{
    protected $sid;
    protected $token;
    protected $from;
    protected $client;

    public function __construct()
    {
        $this->sid = config('services.twilio.sid');
        $this->token = config('services.twilio.token');
        $this->from = config('services.twilio.from', 'whatsapp:+14155238886');

        if ($this->sid && $this->token) {
            $this->client = new Client($this->sid, $this->token);
        }
    }

    /**
     * Send a standard WhatsApp message using Twilio.
     * 
     * @param string $to The recipient's phone number (e.g. +62...).
     * @param string $message The message content.
     * @return bool Success or failure.
     */
    public function sendMessage($to, $message)
    {
        if (!$this->client) {
            Log::warning("WhatsApp notification skipped: Twilio credentials not set.");
            return false;
        }

        // Format number to whatsapp: format if not already
        $to = str_starts_with($to, 'whatsapp:') ? $to : "whatsapp:$to";

        try {
            $this->client->messages->create($to, [
                'from' => $this->from,
                'body' => $message,
            ]);

            Log::info("WhatsApp message sent via Twilio to $to");
            return true;
        } catch (\Exception $e) {
            Log::error("Twilio WhatsApp error for $to: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send a template-based WhatsApp message (Twilio Content API).
     * 
     * @param string $to Recipient number.
     * @param string $contentSid Template ID.
     * @param array $variables Variables for the template.
     * @return bool
     */
    public function sendTemplate($to, $contentSid, array $variables = [])
    {
        if (!$this->client) {
            return false;
        }

        $to = str_starts_with($to, 'whatsapp:') ? $to : "whatsapp:$to";

        try {
            $this->client->messages->create($to, [
                'from' => $this->from,
                'contentSid' => $contentSid,
                'contentVariables' => json_encode($variables),
            ]);

            Log::info("WhatsApp template ($contentSid) sent to $to");
            return true;
        } catch (\Exception $e) {
            Log::error("Twilio Template error for $to: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify Kaling about a new report in their area.
     * Uses interactive buttons if TWILIO_KALING_CONTENT_SID is set.
     */
    public function notifyKaling($kaling, $report)
    {
        if (!$kaling || !$kaling->user || !$kaling->user->phone_number)
            return;

        $contentSid = config('services.twilio.kaling_content_sid');

        $msg = "📢 *Laporan Sampah Baru!*\n\n" .
            "ID: #{$report->id}\n" .
            "Lokasi: {$report->address}\n" .
            "Jenis: {$report->waste_type}\n" .
            "Tingkat: {$report->severity_level}\n\n" .
            "Silakan balas pesan ini dengan:\n" .
            "✅ *ACC {$report->id}* (untuk Validasi)\n" .
            "❌ *TOLAK {$report->id} [Alasan]* (untuk Menolak)";

        if ($contentSid) {
            // Variables: {{1}} = ID, {{2}} = Address, {{3}} = Type/Severity
            $this->sendTemplate($kaling->user->phone_number, $contentSid, [
                '1' => (string) $report->id,
                '2' => $report->address,
                '3' => "{$report->waste_type} ({$report->severity_level})"
            ]);
        } else {
            $this->sendMessage($kaling->user->phone_number, $msg);
        }
    }

    /**
     * Notify all active Petugas about a new validated report.
     * Uses interactive buttons if TWILIO_NOTIFY_CONTENT_SID is set.
     * 
     * @param \App\Models\Report $report
     * @return void
     */
    public function notifyAllPetugas($report)
    {
        $activePetugas = \App\Models\Petugas::with('user')->where('is_aktif', true)->get();
        $contentSid = config('services.twilio.notify_content_sid');
        $mapsUrl = "https://www.google.com/maps?q={$report->latitude},{$report->longitude}";

        // Prepare standard message
        $msg = "📢 *TUGAS BARU (SIAP ANGKUT)!*\n\n" .
            "ID: #{$report->id}\n" .
            "Lokasi: {$report->address}\n" .
            "🗺️ Maps: $mapsUrl\n\n" .
            "Ketik: *KERJAKAN {$report->id}* untuk mengambil tugas ini.";

        foreach ($activePetugas as $petugas) {
            if (!$petugas->user || !$petugas->user->phone_number)
                continue;

            if ($contentSid) {
                // Using Content API (Buttons)
                // Template should have variables like: {{1}} = ID, {{2}} = Address, {{3}} = Maps URL
                $this->sendTemplate($petugas->user->phone_number, $contentSid, [
                    '1' => (string) $report->id,
                    '2' => $report->address,
                    '3' => $mapsUrl
                ]);
            } else {
                // Fallback to plain text
                $this->sendMessage($petugas->user->phone_number, $msg);
            }
        }
    }
}
