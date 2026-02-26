<?php

namespace Database\Seeders;

use App\Models\DangerZone;
use Illuminate\Database\Seeder;

class DangerZoneSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            [
                'name' => 'TPA Kebon Kongok',
                'description' => 'Tempat Pembuangan Akhir resmi Kota Mataram dan Lombok Barat. Titik risiko pencemaran tertinggi di wilayah ini.',
                'type' => 'tpa',
                'severity' => 'critical',
                'center_lat' => -8.6194,
                'center_lng' => 116.0942,
                'radius_meters' => 800,
                'coordinates' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Blackspot Sungai Dodokan',
                'description' => 'Area pembuangan sampah ilegal di tepi Sungai Dodokan. Sering ditemukan sampah B3 dan plastik.',
                'type' => 'blackspot',
                'severity' => 'high',
                'center_lat' => -8.6250,
                'center_lng' => 116.1083,
                'radius_meters' => 300,
                'coordinates' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Kawasan Pasar Sweta',
                'description' => 'Area pasar dengan volume sampah organik tinggi. Risiko pencemaran drainase dan genangan.',
                'type' => 'illegal_dump',
                'severity' => 'high',
                'center_lat' => -8.5944,
                'center_lng' => 116.0858,
                'radius_meters' => 250,
                'coordinates' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Zona Banjir Ampenan',
                'description' => 'Wilayah rawan banjir musiman di Ampenan. Sampah dari hulu sering menumpuk di sini saat hujan.',
                'type' => 'flood_risk',
                'severity' => 'medium',
                'center_lat' => -8.5683,
                'center_lng' => 116.0594,
                'radius_meters' => 500,
                'coordinates' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Pantai Mapak Indah (Blackspot)',
                'description' => 'Kawasan pesisir dengan sampah plastik dari laut dan sungai. Area wisata yang tercemar.',
                'type' => 'blackspot',
                'severity' => 'medium',
                'center_lat' => -8.6139,
                'center_lng' => 116.0481,
                'radius_meters' => 400,
                'coordinates' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Area Industri Cakranegara Selatan',
                'description' => 'Potensi pembuangan limbah industri. Perlu pemantauan rutin untuk sampah B3.',
                'type' => 'illegal_dump',
                'severity' => 'medium',
                'center_lat' => -8.6125,
                'center_lng' => 116.1003,
                'radius_meters' => 350,
                'coordinates' => null,
                'is_active' => true,
            ],
        ];

        foreach ($zones as $zone) {
            DangerZone::create($zone);
        }
    }
}
