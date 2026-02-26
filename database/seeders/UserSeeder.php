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

        User::create([
            'name' => 'Budi (Warga)',
            'email' => 'warga@gmail.com',
            'password' => $password,
            'role' => 'warga',
        ]);

        User::create([
            'name' => 'Pak Kades (Kaling)',
            'email' => 'kaling@gmail.com',
            'password' => $password,
            'role' => 'kaling',
        ]);

        User::create([
            'name' => 'Ucok (Petugas Sampah)',
            'email' => 'petugas@gmail.com',
            'password' => $password,
            'role' => 'petugas',
        ]);

        User::create([
            'name' => 'Kepala DLH Lombok',
            'email' => 'dlh@gmail.com',
            'password' => $password,
            'role' => 'dlh',
        ]);
    }
}
