<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = Hash::make('password');

        User::updateOrCreate(
            ['email' => 'warga@gmail.com'],
            [
                'name' => 'Budi (Warga)',
                'password' => $password,
                'role' => 'warga',
            ]
        );

        User::updateOrCreate(
            ['email' => 'kaling@gmail.com'],
            [
                'name' => 'Pak Kades (Kaling)',
                'password' => $password,
                'role' => 'kaling',
            ]
        );

        User::updateOrCreate(
            ['email' => 'petugas@gmail.com'],
            [
                'name' => 'Ucok (Petugas Sampah)',
                'password' => $password,
                'role' => 'petugas',
            ]
        );

        User::updateOrCreate(
            ['email' => 'dlh@gmail.com'],
            [
                'name' => 'Kepala DLH Lombok',
                'password' => $password,
                'role' => 'dlh',
            ]
        );
    }
}
