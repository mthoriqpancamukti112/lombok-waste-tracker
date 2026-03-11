<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WasteDensityZone extends Model
{
    protected $fillable = [
        'name',
        'coordinates',
        'density_level',
        'kelurahan',
        'kecamatan',
        'report_count',
        'monthly_tonnage',
        'is_active',
    ];

    protected $casts = [
        'coordinates' => 'array',
        'is_active' => 'boolean',
        'monthly_tonnage' => 'float',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
