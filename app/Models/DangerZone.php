<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DangerZone extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'coordinates' => 'array',
            'is_active' => 'boolean',
            'center_lat' => 'decimal:8',
            'center_lng' => 'decimal:8',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Cek apakah titik (lat, lng) berada di dalam zona ini.
     */
    public function isPointInside($lat, $lng): bool
    {
        // 1. Cek jika tipe lingkaran (Circle)
        if ($this->center_lat && $this->center_lng && $this->radius_meters) {
            $distance = $this->calculateDistance($lat, $lng, $this->center_lat, $this->center_lng);
            return $distance <= $this->radius_meters;
        }

        // 2. Cek jika tipe Poligon (GeoJSON structure)
        if (!empty($this->coordinates) && is_array($this->coordinates)) {
            return $this->isPointInPolygon($lat, $lng, $this->coordinates);
        }

        return false;
    }

    private function calculateDistance($lat1, $lng1, $lat2, $lng2): float
    {
        $earthRadius = 6371000; // meter
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }

    private function isPointInPolygon($lat, $lng, $polygon): bool
    {
        // $polygon biasanya array koordinat: [[lng, lat], [lng, lat], ...]
        // Kadang di GeoJSON dia dibungkus lagi: [[[lng, lat], ...]]
        $points = $polygon;
        if (isset($polygon[0]) && is_array($polygon[0]) && isset($polygon[0][0]) && is_array($polygon[0][0])) {
            $points = $polygon[0];
        }

        $inside = false;
        $j = count($points) - 1;

        for ($i = 0; $i < count($points); $i++) {
            $xi = $points[$i][0]; // longitude
            $yi = $points[$i][1]; // latitude
            $xj = $points[$j][0];
            $yj = $points[$j][1];

            $intersect = (($yi > $lat) != ($yj > $lat))
                && ($lng < ($xj - $xi) * ($lat - $yi) / ($yj - $yi) + $xi);

            if ($intersect) {
                $inside = !$inside;
            }
            $j = $i;
        }

        return $inside;
    }
}
