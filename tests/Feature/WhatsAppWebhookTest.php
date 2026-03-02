<?php

namespace Tests\Feature;

use App\Models\Kaling;
use App\Models\Report;
use App\Models\ReportStatusLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Services\WhatsAppService;
use Mockery;

class WhatsAppWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Mock WhatsAppService globally for these tests
        $mock = Mockery::mock(WhatsAppService::class);
        $mock->shouldReceive('sendMessage')->andReturn(['status' => true]);
        $this->app->instance(WhatsAppService::class, $mock);
    }

    public function test_webhook_can_validate_report()
    {
        // 1. Setup User and Kaling
        $user = User::factory()->create([
            'role' => 'kaling',
            'phone_number' => '628123456789'
        ]);

        $kaling = Kaling::create([
            'user_id' => $user->id,
            'nik' => '1234567890',
            'nama_wilayah' => 'Mataram',
            'no_telp' => '628123456789'
        ]);

        // 2. Setup Report
        $report = Report::factory()->create([
            'kaling_id' => $kaling->id,
            'status' => 'menunggu'
        ]);

        // 3. Mock Payload from Fonnte
        $payload = [
            'sender' => '628123456789',
            'message' => 'ACC ' . $report->id,
        ];

        // 4. Call Webhook
        $response = $this->postJson('/api/webhooks/whatsapp', $payload);

        $response->assertStatus(200);
        $this->assertEquals('divalidasi', $report->fresh()->status);
        $this->assertDatabaseHas('report_status_logs', [
            'report_id' => $report->id,
            'new_status' => 'divalidasi',
            'notes' => 'Disetujui via WhatsApp'
        ]);
    }

    public function test_webhook_can_reject_report_with_reason()
    {
        // 1. Setup User and Kaling
        $user = User::factory()->create([
            'role' => 'kaling',
            'phone_number' => '628123456789'
        ]);

        $kaling = Kaling::create([
            'user_id' => $user->id,
            'nik' => '1234567890',
            'nama_wilayah' => 'Mataram',
            'no_telp' => '628123456789'
        ]);

        // 2. Setup Report
        $report = Report::factory()->create([
            'kaling_id' => $kaling->id,
            'status' => 'menunggu'
        ]);

        // 3. Mock Payload from Fonnte
        $payload = [
            'sender' => '628123456789',
            'message' => 'TOLAK ' . $report->id . ' Foto tidak jelas',
        ];

        // 4. Call Webhook
        $response = $this->postJson('/api/webhooks/whatsapp', $payload);

        $response->assertStatus(200);
        $this->assertNull($report->fresh());
        // Note: report_status_logs is also deleted due to onDelete('cascade') in migration.
    }

    public function test_webhook_ignores_unauthorized_sender()
    {
        // 1. Setup Report
        $report = Report::factory()->create(['status' => 'menunggu']);

        // 2. Mock Payload from unknown sender
        $payload = [
            'sender' => '62999999999',
            'message' => 'ACC ' . $report->id,
        ];

        // 3. Call Webhook
        $response = $this->postJson('/api/webhooks/whatsapp', $payload);

        $response->assertStatus(200);
        $this->assertEquals('menunggu', $report->fresh()->status);
    }
}
