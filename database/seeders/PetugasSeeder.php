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
                    'nama_petugas' => 'Ucok',
                    'wilayah_tugas' => 'Mataram',
                    'kontak' => '081234567890',
                ]
            );
        }
    }
}
