<?php

namespace Database\Seeders;

use App\Models\Kaling;
use App\Models\User;
use Illuminate\Database\Seeder;

class KalingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kalingUser = User::where('role', 'kaling')->first();

        if ($kalingUser) {
            Kaling::updateOrCreate(
                ['user_id' => $kalingUser->id],
                [
                    'nik' => '1234567890123456',
                    'nama_wilayah' => 'Lingkungan Karang Baru',
                    'no_telp' => '081234567890',
                ]
            );
        }
    }
}
