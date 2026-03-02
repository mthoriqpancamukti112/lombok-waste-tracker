<?php

namespace Database\Seeders;

use App\Models\Petugas;
use App\Models\User;
use Illuminate\Database\Seeder;

class PetugasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $petugasUser = User::where('email', 'petugas@gmail.com')->first();

        if ($petugasUser) {
            Petugas::updateOrCreate(
                ['user_id' => $petugasUser->id],
                [
                    'jenis_kendaraan' => 'motor_gerobak',
                    'plat_nomor' => 'DR 1234 AB',
                    'kapasitas_kg' => 500,
                    'is_aktif' => true,
                ]
            );
        }
    }
}
