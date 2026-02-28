<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DangerZone extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    // Ini sangat penting agar Laravel otomatis mengubah JSON di database menjadi Array di PHP, dan sebaliknya
    protected function casts(): array
    {
        return [
            'coordinates' => 'array',
            'is_active' => 'boolean',
            'center_lat' => 'decimal:8',
            'center_lng' => 'decimal:8',
        ];
    }

    // Relasi ke User (Siapa admin DLH yang membuat zona ini)
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
