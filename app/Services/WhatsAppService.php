<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected $token;
    protected $baseUrl = 'https://api.fonnte.com';

    public function __construct()
    {
        $this->token = config('services.fonnte.token');
    }

    /**
     * Send a WhatsApp message using Fonnte API.
     * 
     * @param string $to The recipient's phone number.
     * @param string $message The message content.
     * @return bool Success or failure.
     */
    public function sendMessage($to, $message)
    {
        if (empty($this->token) || str_contains($this->token, 'your_token_here')) {
            Log::warning("WhatsApp notification skipped: FONNTE_API_TOKEN is not set.");
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->post($this->baseUrl . '/send', [
                        'target' => $to,
                        'message' => $message,
                        'countryCode' => '62', // Default to Indonesia
                    ]);

            if ($response->successful()) {
                Log::info("WhatsApp message sent to $to: $message");
                return true;
            }

            Log::error("WhatsApp API error for $to: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("WhatsApp service exception: " . $e->getMessage());
            return false;
        }
    }
}
