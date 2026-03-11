<?php

namespace Database\Seeders;

use App\Models\WasteDensityZone;
use Illuminate\Database\Seeder;

class WasteDensitySeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            [
                'name' => 'Kelurahan Cakranegara Timur',
                'density_level' => 'very_high',
                'kelurahan' => 'Cakranegara Timur',
                'kecamatan' => 'Cakranegara',
                'report_count' => 45,
                'monthly_tonnage' => 12.5,
                'coordinates' => $this->boxCoords(-8.606, 116.095, -8.615, 116.108),
            ],
            [
                'name' => 'Kelurahan Ampenan Tengah',
                'density_level' => 'high',
                'kelurahan' => 'Ampenan Tengah',
                'kecamatan' => 'Ampenan',
                'report_count' => 31,
                'monthly_tonnage' => 8.2,
                'coordinates' => $this->boxCoords(-8.558, 116.055, -8.572, 116.070),
            ],
            [
                'name' => 'Kelurahan Mataram Barat',
                'density_level' => 'high',
                'kelurahan' => 'Mataram Barat',
                'kecamatan' => 'Mataram',
                'report_count' => 28,
                'monthly_tonnage' => 7.8,
                'coordinates' => $this->boxCoords(-8.580, 116.075, -8.595, 116.090),
            ],
            [
                'name' => 'Kelurahan Dasan Agung Baru',
                'density_level' => 'medium',
                'kelurahan' => 'Dasan Agung Baru',
                'kecamatan' => 'Selaparang',
                'report_count' => 17,
                'monthly_tonnage' => 4.5,
                'coordinates' => $this->boxCoords(-8.568, 116.085, -8.580, 116.098),
            ],
            [
                'name' => 'Kelurahan Pagutan Barat',
                'density_level' => 'medium',
                'kelurahan' => 'Pagutan Barat',
                'kecamatan' => 'Mataram',
                'report_count' => 12,
                'monthly_tonnage' => 3.2,
                'coordinates' => $this->boxCoords(-8.626, 116.085, -8.638, 116.098),
            ],
            [
                'name' => 'Kelurahan Rembiga',
                'density_level' => 'low',
                'kelurahan' => 'Rembiga',
                'kecamatan' => 'Selaparang',
                'report_count' => 6,
                'monthly_tonnage' => 1.8,
                'coordinates' => $this->boxCoords(-8.545, 116.090, -8.558, 116.105),
            ],
            [
                'name' => 'Kawasan Cakranegara — Pasar Sweta',
                'density_level' => 'very_high',
                'kelurahan' => 'Sapta Marga',
                'kecamatan' => 'Cakranegara',
                'report_count' => 52,
                'monthly_tonnage' => 15.0,
                'coordinates' => $this->boxCoords(-8.588, 116.078, -8.600, 116.093),
            ],
        ];

        foreach ($zones as $zone) {
            WasteDensityZone::updateOrCreate(
                ['name' => $zone['name']],
                $zone
            );
        }
    }

    private function boxCoords(float $north, float $west, float $south, float $east): array
    {
        return [
            [$west, $north],
            [$east, $north],
            [$east, $south],
            [$west, $south],
            [$west, $north],
        ];
    }
}
