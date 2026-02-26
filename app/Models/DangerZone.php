<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DangerZone extends Model
{
    protected $fillable = [
        'name',
        'description',
        'type',
        'severity',
        'coordinates',
        'center_lat',
        'center_lng',
        'radius_meters',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'coordinates' => 'array',
        'is_active' => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
